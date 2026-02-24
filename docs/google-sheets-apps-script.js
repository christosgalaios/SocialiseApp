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
//   5. Grant permissions when prompted
//   6. Deploy > Manage deployments > Edit > New version > Deploy
//   7. Configure dropdown colors manually (see DROPDOWN SETUP below)
//
// FUNCTIONS:
//   doPost(e)    — Webhook handler for backend create/update calls
//   tidySheet()  — Cleanup: remove duplicates, normalize env values
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

var HEADERS = [COL_BUG_ID, COL_DESCRIPTION, COL_STATUS, COL_PRIORITY, COL_ENVIRONMENT, COL_CREATED_AT, COL_APP_VERSION, COL_PLATFORM, COL_FIXED_AT];

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
 * POST handler — creates new rows or updates existing ones.
 * Called by the Express backend (server/routes/bugs.js).
 *
 * Payloads:
 *   Create: { bug_id, description, status, priority, environment, created_at, app_version, platform }
 *   Update: { action: 'update', bug_id, status?, priority? }
 */
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var cols = getColumnMap_(sheet);
  var data = JSON.parse(e.postData.contents);

  // --- UPDATE mode: find row by bug_id, update status/priority ---
  if (data.action === 'update') {
    var bugIdCol = cols[COL_BUG_ID];
    if (!bugIdCol) return ContentService.createTextOutput('error: Bug ID column not found');

    var allData = sheet.getDataRange().getValues();
    for (var i = 1; i < allData.length; i++) {
      if (allData[i][bugIdCol - 1] === data.bug_id) {
        if (data.status && cols[COL_STATUS])     sheet.getRange(i + 1, cols[COL_STATUS]).setValue(data.status);
        if (data.priority && cols[COL_PRIORITY])  sheet.getRange(i + 1, cols[COL_PRIORITY]).setValue(data.priority);
        // Auto-populate "Fixed At" timestamp when status changes to "fixed"
        if (data.status === 'fixed' && cols[COL_FIXED_AT]) {
          var fixedAt = data.fixed_at || new Date().toISOString();
          sheet.getRange(i + 1, cols[COL_FIXED_AT]).setValue(fixedAt);
        }
        return ContentService.createTextOutput('updated');
      }
    }
    return ContentService.createTextOutput('not_found');
  }

  // --- CREATE mode: append new row ---
  // Build row array matching current column order
  var fieldMap = {};
  fieldMap[COL_BUG_ID]      = data.bug_id || '';
  fieldMap[COL_DESCRIPTION] = data.description || '';
  fieldMap[COL_STATUS]      = data.status || 'open';
  fieldMap[COL_PRIORITY]    = data.priority || 'auto';
  fieldMap[COL_ENVIRONMENT] = normalizeEnv_(data.environment || '');
  fieldMap[COL_CREATED_AT]  = data.created_at || new Date().toISOString();
  fieldMap[COL_APP_VERSION] = data.app_version || '';
  fieldMap[COL_PLATFORM]    = data.platform || '';

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
  return val.toUpperCase();
}

// ==========================================
// TIDY SHEET — Run to clean up data
// ==========================================

/**
 * Run this to:
 * - Remove duplicate/partial rows
 * - Normalize environment values (production → PROD, development → DEV, local → LOCAL)
 *
 * Safe to run multiple times. Does NOT touch Smart Table column types,
 * dropdowns, or conditional formatting — those are managed by the table itself.
 */
function tidySheet() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  cleanDuplicates_(sheet);
  normalizeExistingEnvValues_(sheet);

  SpreadsheetApp.flush();
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

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
    var original = String(values[i][0]).trim();
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
 * Array indexOf helper (Apps Script doesn't have Array.indexOf in older runtimes).
 */
function indexOf_(arr, val) {
  for (var i = 0; i < arr.length; i++) {
    if (arr[i] === val) return i;
  }
  return -1;
}
