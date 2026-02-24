// ==========================================
// Socialise App — Bug Report Sheet Manager
// ==========================================
//
// Compatible with Google Sheets Smart Tables.
//
// SETUP:
//   1. Open your Google Sheet > Extensions > Apps Script
//   2. Replace all existing code with this file
//   3. Save (Ctrl+S)
//   4. Run tidySheet() from the function dropdown > Run
//      (this auto-adds any missing columns: Platform, Reports, Fixed At, etc.)
//   5. Grant permissions when prompted
//   6. Deploy > Manage deployments > Edit > New version > Deploy
//   7. Configure dropdown colors manually (see DROPDOWN SETUP below)
//
// FUNCTIONS:
//   doPost(e)    — Webhook handler for backend create/update/delete calls
//   tidySheet()  — Cleanup: consolidate duplicates, normalize env values, init reports counts
//
// DROPDOWN SETUP (Smart Table column type settings):
//   Smart Tables manage dropdowns via column type, not data validation.
//   To add colored chips: click column header dropdown arrow > Edit column details
//   Then add each option with its color:
//
//   STATUS column:
//     open          → Orange
//     fixed         → Green
//     rejected      → Red
//     needs-triage  → Blue
//     duplicate     → Purple
//
//   PRIORITY column:
//     auto          → Grey
//     P1            → Red
//     P2            → Orange
//     P3            → Yellow
//
//   ENVIRONMENT column:
//     PROD          → Red
//     DEV           → Blue
//     LOCAL         → Grey
//     BOTH          → Purple
//
//   REPORTS column:
//     (no dropdown — numeric field showing how many times this bug was reported)
//
//   PLATFORM column:
//     Plain text — auto-detected from user agent.
//     Format: "OS / Browser / Device" (e.g. "Android 14 / Chrome 120 / Mobile")
//
// ==========================================

// ---- Column header constants ----
// All lookups use these names, so columns can be reordered freely.
var COL_BUG_ID      = 'Bug ID';
var COL_DESCRIPTION = 'Description';
var COL_STATUS      = 'Status';
var COL_PRIORITY    = 'Priority';
var COL_ENVIRONMENT = 'Environment';
var COL_CREATED_AT  = 'Created At';
var COL_APP_VERSION = 'App Version';
var COL_PLATFORM    = 'Platform';
var COL_FIXED_AT    = 'Fixed At';
var COL_REPORTS     = 'Reports';

var HEADERS = [COL_BUG_ID, COL_DESCRIPTION, COL_STATUS, COL_PRIORITY, COL_ENVIRONMENT, COL_CREATED_AT, COL_APP_VERSION, COL_PLATFORM, COL_FIXED_AT, COL_REPORTS];

/**
 * Returns a map of { headerName: columnIndex (1-based) } for the given sheet.
 * Reads the first row and matches against known header names.
 */
function getColumnMap_(sheet) {
  var headerRow = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var map = {};
  for (var i = 0; i < headerRow.length; i++) {
    var name = String(headerRow[i]).trim();
    if (name) map[name] = i + 1; // 1-based
  }
  return map;
}

/**
 * POST handler — creates new rows, updates existing ones, or deletes rows.
 * Called by the Express backend (server/routes/bugs.js).
 *
 * Payloads:
 *   Create: { bug_id, description, status, priority, environment, created_at, app_version, platform }
 *   Update: { action: 'update', bug_id, status?, priority?, reports?, environment?, app_version?, fixed_at? }
 *   Delete: { action: 'delete', bug_id }
 *
 * Duplicate detection (CREATE mode):
 *   If a bug with an identical description (case-insensitive, trimmed) already exists,
 *   the incoming report is consolidated into the existing row instead of creating a new one:
 *     - Reports count is incremented by 1
 *     - Environment is merged (PROD + DEV → BOTH; same environment is kept as-is)
 *     - App version is appended if not already present (comma-separated)
 *     - If the existing bug's status was 'fixed', it is re-opened (status → 'open', Fixed At cleared)
 *   Returns 'consolidated' in this case.
 */
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var cols = getColumnMap_(sheet);
  var data = JSON.parse(e.postData.contents);

  // --- DELETE mode: remove row by bug_id ---
  if (data.action === 'delete') {
    var delBugIdCol = cols[COL_BUG_ID];
    if (!delBugIdCol) return ContentService.createTextOutput('error: Bug ID column not found');

    var delData = sheet.getDataRange().getValues();
    for (var d = 1; d < delData.length; d++) {
      if (String(delData[d][delBugIdCol - 1]).trim() === String(data.bug_id).trim()) {
        sheet.deleteRow(d + 1);
        return ContentService.createTextOutput('deleted');
      }
    }
    return ContentService.createTextOutput('not_found');
  }

  // --- UPDATE mode: find row by bug_id, update fields ---
  if (data.action === 'update') {
    var bugIdCol = cols[COL_BUG_ID];
    if (!bugIdCol) return ContentService.createTextOutput('error: Bug ID column not found');

    var allData = sheet.getDataRange().getValues();
    for (var i = 1; i < allData.length; i++) {
      if (String(allData[i][bugIdCol - 1]).trim() === String(data.bug_id).trim()) {
        if (data.status && cols[COL_STATUS])
          sheet.getRange(i + 1, cols[COL_STATUS]).setValue(data.status);
        if (data.priority && cols[COL_PRIORITY])
          sheet.getRange(i + 1, cols[COL_PRIORITY]).setValue(data.priority);
        if (data.environment && cols[COL_ENVIRONMENT])
          sheet.getRange(i + 1, cols[COL_ENVIRONMENT]).setValue(normalizeEnv_(data.environment));
        if (data.app_version && cols[COL_APP_VERSION])
          sheet.getRange(i + 1, cols[COL_APP_VERSION]).setValue(data.app_version);
        if (data.reports != null && cols[COL_REPORTS])
          sheet.getRange(i + 1, cols[COL_REPORTS]).setValue(data.reports);

        // Auto-populate "Fixed At" timestamp when status changes to "fixed"
        if (data.status === 'fixed' && cols[COL_FIXED_AT]) {
          var fixedAt = data.fixed_at || new Date().toISOString();
          sheet.getRange(i + 1, cols[COL_FIXED_AT]).setValue(fixedAt);
        }
        // Clear "Fixed At" when re-opening a bug
        if (data.status === 'open' && cols[COL_FIXED_AT]) {
          sheet.getRange(i + 1, cols[COL_FIXED_AT]).setValue('');
        }

        return ContentService.createTextOutput('updated');
      }
    }
    return ContentService.createTextOutput('not_found');
  }

  // --- CREATE mode ---
  // Before appending, check if a bug with the same description already exists.
  // If so, consolidate the incoming report into the existing row instead of creating a new one.
  var incomingDescNorm = String(data.description || '').trim().toLowerCase();

  if (incomingDescNorm) {
    var existingData = sheet.getDataRange().getValues();
    var descCol    = cols[COL_DESCRIPTION];
    var statusCol  = cols[COL_STATUS];
    var envCol     = cols[COL_ENVIRONMENT];
    var versionCol = cols[COL_APP_VERSION];
    var reportsCol = cols[COL_REPORTS];
    var fixedAtCol = cols[COL_FIXED_AT];

    for (var j = 1; j < existingData.length; j++) {
      var rowDescNorm = String(existingData[j][descCol - 1] || '').trim().toLowerCase();
      if (rowDescNorm !== incomingDescNorm) continue;

      // Match found — consolidate into this row
      var rowNum = j + 1;

      // Increment reports count
      if (reportsCol) {
        var currentReports = parseInt(existingData[j][reportsCol - 1]) || 1;
        sheet.getRange(rowNum, reportsCol).setValue(currentReports + 1);
      }

      // Merge environment
      if (envCol) {
        var existingEnv = String(existingData[j][envCol - 1]).trim();
        var incomingEnv = normalizeEnv_(data.environment || '');
        var mergedEnv = mergeEnv_(existingEnv, incomingEnv);
        if (mergedEnv !== existingEnv) {
          sheet.getRange(rowNum, envCol).setValue(mergedEnv);
        }
      }

      // Append new app version if not already present
      if (versionCol) {
        var existingVersion = String(existingData[j][versionCol - 1]).trim();
        var incomingVersion = String(data.app_version || '').trim();
        var mergedVersion = mergeVersions_(existingVersion, incomingVersion);
        if (mergedVersion !== existingVersion) {
          sheet.getRange(rowNum, versionCol).setValue(mergedVersion);
        }
      }

      // Re-open if the existing bug was 'fixed'
      if (statusCol) {
        var existingStatus = String(existingData[j][statusCol - 1]).trim();
        if (existingStatus === 'fixed') {
          sheet.getRange(rowNum, statusCol).setValue('open');
          if (fixedAtCol) {
            sheet.getRange(rowNum, fixedAtCol).setValue('');
          }
        }
      }

      return ContentService.createTextOutput('consolidated');
    }
  }

  // No existing match — append new row with Reports = 1
  var fieldMap = {};
  fieldMap[COL_BUG_ID]      = data.bug_id || '';
  fieldMap[COL_DESCRIPTION] = data.description || '';
  fieldMap[COL_STATUS]      = data.status || 'open';
  fieldMap[COL_PRIORITY]    = data.priority || 'auto';
  fieldMap[COL_ENVIRONMENT] = normalizeEnv_(data.environment || '');
  fieldMap[COL_CREATED_AT]  = data.created_at || new Date().toISOString();
  fieldMap[COL_APP_VERSION] = data.app_version || '';
  fieldMap[COL_PLATFORM]    = data.platform || '';
  fieldMap[COL_REPORTS]     = 1;

  // Place each field in the correct column position
  var maxCol = 0;
  for (var header in fieldMap) {
    var ci = cols[header];
    if (ci && ci > maxCol) maxCol = ci;
  }

  var newRow = [];
  for (var c = 0; c < maxCol; c++) newRow.push('');

  for (var header2 in fieldMap) {
    var ci2 = cols[header2];
    if (ci2) newRow[ci2 - 1] = fieldMap[header2];
  }

  sheet.appendRow(newRow);
  return ContentService.createTextOutput('ok');
}

/**
 * Normalize environment values to the standard short form.
 */
function normalizeEnv_(val) {
  var v = String(val).trim().toLowerCase();
  if (v === 'production' || v === 'prod') return 'PROD';
  if (v === 'development' || v === 'dev') return 'DEV';
  if (v === 'local' || v === '') return 'LOCAL';
  if (v === 'both') return 'BOTH';
  return val.toUpperCase();
}

/**
 * Merge two environment values. Returns 'BOTH' if they differ.
 * Examples:
 *   mergeEnv_('PROD', 'DEV')  → 'BOTH'
 *   mergeEnv_('PROD', 'PROD') → 'PROD'
 *   mergeEnv_('BOTH', 'LOCAL') → 'BOTH'
 */
function mergeEnv_(existing, incoming) {
  if (!existing || existing === '') return incoming;
  if (!incoming || incoming === '') return existing;
  if (existing === incoming) return existing;
  if (existing === 'BOTH' || incoming === 'BOTH') return 'BOTH';
  return 'BOTH';
}

/**
 * Merge app version strings — comma-separated, no duplicates.
 * Examples:
 *   mergeVersions_('0.1.104', '0.1.107')            → '0.1.104, 0.1.107'
 *   mergeVersions_('0.1.104, 0.1.107', '0.1.104')   → '0.1.104, 0.1.107'
 *   mergeVersions_('', '0.1.104')                   → '0.1.104'
 */
function mergeVersions_(existing, incoming) {
  if (!incoming || String(incoming).trim() === '') return existing;
  if (!existing || String(existing).trim() === '') return String(incoming).trim();
  var parts = existing.split(',').map(function(v) { return v.trim(); });
  var incomingTrimmed = String(incoming).trim();
  if (indexOf_(parts, incomingTrimmed) === -1) {
    parts.push(incomingTrimmed);
    return parts.join(', ');
  }
  return existing;
}

// ==========================================
// TIDY SHEET — Run to clean up data
// ==========================================

/**
 * Run this to:
 * - Add any missing columns (Platform, Reports, Fixed At, etc.) to the header row
 * - Remove duplicate/partial rows (same bug_id, empty description)
 * - Consolidate rows with identical descriptions into the earliest occurrence:
 *     - Sums Reports counts across all duplicates
 *     - Merges Environment values (PROD + DEV → BOTH)
 *     - Merges App Version strings (comma-separated unique versions)
 *     - Re-opens the primary bug if it was 'fixed' and a newer report exists
 *     - Deletes the duplicate rows
 * - Normalize environment values (production → PROD, development → DEV, etc.)
 * - Initialize Reports column (set to 1 for rows with no count)
 *
 * Safe to run multiple times. Does NOT touch Smart Table column types,
 * dropdowns, or conditional formatting — those are managed by the table itself.
 */
function tidySheet() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  ensureColumns_(sheet);
  cleanDuplicates_(sheet);
  consolidateDuplicateDescriptions_(sheet);
  normalizeExistingEnvValues_(sheet);
  initReportsColumn_(sheet);

  SpreadsheetApp.flush();
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Ensure all expected columns exist in the header row.
 * Appends any missing columns from HEADERS to the right of the last existing column.
 * Existing columns (by name) are never moved or modified.
 * Call this before any other tidy operation so column lookups work correctly.
 */
function ensureColumns_(sheet) {
  var headerRow = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var existingNames = headerRow.map(function(h) { return String(h).trim(); });

  var added = [];
  for (var i = 0; i < HEADERS.length; i++) {
    if (indexOf_(existingNames, HEADERS[i]) === -1) {
      var newColIndex = sheet.getLastColumn() + 1;
      sheet.getRange(1, newColIndex).setValue(HEADERS[i]);
      existingNames.push(HEADERS[i]); // keep in sync for subsequent iterations
      added.push(HEADERS[i]);
    }
  }

  if (added.length > 0) {
    Logger.log('ensureColumns_: added missing columns: ' + added.join(', '));
  }
}

/**
 * Remove duplicate/partial rows — keeps the first occurrence of each bug_id
 * (the one with a description). Removes rows with the same bug_id but empty description.
 */
function cleanDuplicates_(sheet) {
  var data = sheet.getDataRange().getValues();
  var cols = getColumnMap_(sheet);

  var bugIdColIdx = (cols[COL_BUG_ID] || 1) - 1;
  var descColIdx = (cols[COL_DESCRIPTION] || 2) - 1;

  var seen = {};
  var rowsToDelete = [];

  for (var i = 1; i < data.length; i++) {
    var bugId = data[i][bugIdColIdx];
    var desc = data[i][descColIdx];

    if (!bugId || String(bugId).trim() === '') {
      rowsToDelete.push(i + 1);
      continue;
    }

    if (seen[bugId]) {
      if (!desc || String(desc).trim() === '') {
        rowsToDelete.push(i + 1);
      } else {
        // This row has a description — delete the earlier empty one
        rowsToDelete.push(seen[bugId]);
        seen[bugId] = i + 1;
      }
    } else {
      seen[bugId] = i + 1;
    }
  }

  // Delete from bottom to top so row indices stay valid
  rowsToDelete.sort(function(a, b) { return b - a; });
  for (var j = 0; j < rowsToDelete.length; j++) {
    sheet.deleteRow(rowsToDelete[j]);
  }
}

/**
 * Consolidate rows with identical descriptions (case-insensitive) into the first occurrence.
 *
 * For each group of rows sharing the same description:
 *   - Primary: the earliest row (first occurrence by sheet position)
 *   - Updates the primary with merged data from all duplicates:
 *       - Reports count: sum of all rows in the group
 *       - Environment: merged (PROD + DEV → BOTH)
 *       - App Version: all unique versions, comma-separated
 *       - Status: if primary was 'fixed' and any duplicate is 'open', re-opens the primary
 *   - Deletes all duplicate rows (keeps only the primary)
 */
function consolidateDuplicateDescriptions_(sheet) {
  var data = sheet.getDataRange().getValues();
  var cols = getColumnMap_(sheet);

  var bugIdColIdx   = (cols[COL_BUG_ID] || 1) - 1;
  var descColIdx    = (cols[COL_DESCRIPTION] || 2) - 1;
  var statusColIdx  = cols[COL_STATUS]      ? cols[COL_STATUS] - 1      : 2;
  var envColIdx     = cols[COL_ENVIRONMENT] ? cols[COL_ENVIRONMENT] - 1 : 4;
  var versionColIdx = cols[COL_APP_VERSION] ? cols[COL_APP_VERSION] - 1 : 6;
  var reportsColIdx = cols[COL_REPORTS]     ? cols[COL_REPORTS] - 1     : -1;
  var fixedAtColIdx = cols[COL_FIXED_AT]    ? cols[COL_FIXED_AT] - 1    : 7;

  // Map: normalized description → first (primary) row index (1-based)
  var firstOccurrence = {};
  var rowsToDelete = [];

  for (var i = 1; i < data.length; i++) {
    var desc  = String(data[i][descColIdx]).trim();
    var bugId = String(data[i][bugIdColIdx]).trim();
    if (!desc || !bugId) continue;

    var descNorm = desc.toLowerCase();

    if (firstOccurrence[descNorm] !== undefined) {
      // Duplicate — merge into the primary row
      var primaryRowNum  = firstOccurrence[descNorm];
      var primaryDataIdx = primaryRowNum - 1; // data[] is 0-based

      // Sum reports counts
      if (reportsColIdx >= 0) {
        var primaryReports = parseInt(data[primaryDataIdx][reportsColIdx]) || 1;
        var dupReports     = parseInt(data[i][reportsColIdx]) || 1;
        var newReports     = primaryReports + dupReports;
        data[primaryDataIdx][reportsColIdx] = newReports;
        sheet.getRange(primaryRowNum, reportsColIdx + 1).setValue(newReports);
      }

      // Merge environment
      var existingEnv = String(data[primaryDataIdx][envColIdx]).trim();
      var dupEnv      = normalizeEnv_(String(data[i][envColIdx]).trim());
      var mergedEnv   = mergeEnv_(existingEnv, dupEnv);
      if (mergedEnv !== existingEnv) {
        data[primaryDataIdx][envColIdx] = mergedEnv;
        sheet.getRange(primaryRowNum, envColIdx + 1).setValue(mergedEnv);
      }

      // Merge app versions
      var existingVersion = String(data[primaryDataIdx][versionColIdx]).trim();
      var dupVersion      = String(data[i][versionColIdx]).trim();
      var mergedVersion   = mergeVersions_(existingVersion, dupVersion);
      if (mergedVersion !== existingVersion) {
        data[primaryDataIdx][versionColIdx] = mergedVersion;
        sheet.getRange(primaryRowNum, versionColIdx + 1).setValue(mergedVersion);
      }

      // Re-open the primary if it was 'fixed' and a newer open report exists
      var primaryStatus = String(data[primaryDataIdx][statusColIdx]).trim();
      var dupStatus     = String(data[i][statusColIdx]).trim();
      if (primaryStatus === 'fixed' && dupStatus === 'open') {
        data[primaryDataIdx][statusColIdx] = 'open';
        sheet.getRange(primaryRowNum, statusColIdx + 1).setValue('open');
        sheet.getRange(primaryRowNum, fixedAtColIdx + 1).setValue('');
      }

      rowsToDelete.push(i + 1);
    } else {
      firstOccurrence[descNorm] = i + 1;
    }
  }

  // Delete from bottom to top so row indices stay valid
  rowsToDelete.sort(function(a, b) { return b - a; });
  for (var j = 0; j < rowsToDelete.length; j++) {
    sheet.deleteRow(rowsToDelete[j]);
  }
}

/**
 * Normalize existing environment values in the sheet.
 * Converts: production → PROD, development → DEV, local → LOCAL.
 */
function normalizeExistingEnvValues_(sheet) {
  var cols = getColumnMap_(sheet);
  var envCol = cols[COL_ENVIRONMENT];
  if (!envCol) return;

  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return;

  var range = sheet.getRange(2, envCol, lastRow - 1, 1);
  var values = range.getValues();
  var changed = false;

  for (var i = 0; i < values.length; i++) {
    var original   = String(values[i][0]).trim();
    var normalized = normalizeEnv_(original);
    if (normalized !== original && original !== '') {
      values[i][0] = normalized;
      changed = true;
    }
  }

  if (changed) {
    range.setValues(values);
  }
}

/**
 * Initialize the Reports column — set to 1 for any rows with an empty count.
 * Safe to run on sheets that already have Reports values (only fills blanks).
 * Call this after adding the Reports column to an existing sheet.
 */
function initReportsColumn_(sheet) {
  var cols = getColumnMap_(sheet);
  var reportsCol = cols[COL_REPORTS];
  if (!reportsCol) return;

  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return;

  var range  = sheet.getRange(2, reportsCol, lastRow - 1, 1);
  var values = range.getValues();
  var changed = false;

  for (var i = 0; i < values.length; i++) {
    if (!values[i][0] || values[i][0] === '') {
      values[i][0] = 1;
      changed = true;
    }
  }

  if (changed) {
    range.setValues(values);
  }
}

/**
 * Array indexOf helper (Apps Script doesn't have Array.indexOf in older runtimes).
 */
function indexOf_(arr, val) {
  for (var i = 0; i < arr.length; i++) {
    if (arr[i] === val) return i;
  }
  return -1;
}
