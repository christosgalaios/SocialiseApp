// ==========================================
// Socialise App — Bug Report Sheet Manager
// ==========================================
//
// SETUP:
//   1. Open your Google Sheet > Extensions > Apps Script
//   2. Replace all existing code with this file
//   3. Save (Ctrl+S)
//   4. Run formatSheet() from the function dropdown > Run
//   5. Grant permissions when prompted
//   6. Deploy > Manage deployments > Edit > New version > Deploy
//
// FUNCTIONS:
//   doPost(e)      — Webhook handler for backend create/update calls
//   formatSheet()  — One-time setup: headers, dropdowns, colors, cleanup
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

var HEADERS = [COL_BUG_ID, COL_DESCRIPTION, COL_STATUS, COL_PRIORITY, COL_ENVIRONMENT, COL_CREATED_AT, COL_APP_VERSION];

// ---- Dropdown options ----
var STATUS_OPTIONS   = ['open', 'fixed', 'rejected', 'needs-triage', 'duplicate'];
var PRIORITY_OPTIONS = ['auto', 'P1', 'P2', 'P3'];
var ENV_OPTIONS      = ['PROD', 'DEV', 'LOCAL'];

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
 *   Create: { bug_id, description, status, priority, environment, created_at, app_version }
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
        return ContentService.createTextOutput('updated');
      }
    }
    return ContentService.createTextOutput('not_found');
  }

  // --- CREATE mode: append new row ---
  // Build row array matching current column order
  var newRow = [];
  for (var h = 0; h < HEADERS.length; h++) {
    var colIdx = cols[HEADERS[h]];
    // Expand array if needed
    while (newRow.length < colIdx) newRow.push('');
  }

  // Map payload fields to the correct column positions
  var fieldMap = {};
  fieldMap[COL_BUG_ID]      = data.bug_id || '';
  fieldMap[COL_DESCRIPTION] = data.description || '';
  fieldMap[COL_STATUS]      = data.status || 'open';
  fieldMap[COL_PRIORITY]    = data.priority || 'auto';
  fieldMap[COL_ENVIRONMENT] = normalizeEnv_(data.environment || '');
  fieldMap[COL_CREATED_AT]  = data.created_at || new Date().toISOString();
  fieldMap[COL_APP_VERSION] = data.app_version || '';

  // Place each field in the correct column
  var maxCol = 0;
  for (var header in fieldMap) {
    var ci = cols[header];
    if (ci) {
      while (newRow.length < ci) newRow.push('');
      newRow[ci - 1] = fieldMap[header];
      if (ci > maxCol) maxCol = ci;
    }
  }

  sheet.appendRow(newRow.slice(0, maxCol));
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
// FORMAT SHEET — Run once to set up everything
// ==========================================

/**
 * Run this once (or after adding columns) to set up:
 * - Correct headers
 * - Column widths
 * - Header styling (frozen, colored)
 * - Data validation dropdowns (Status, Priority, Environment)
 * - Conditional formatting (color-coded chips)
 * - Alternating row bands
 * - Auto-filter
 * - Duplicate row cleanup
 * - Environment value normalization
 */
function formatSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getActiveSheet();
  sheet.setName('Bug Reports');

  // --- 1. Set headers ---
  var headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
  headerRange.setValues([HEADERS]);

  // --- 2. Clean duplicate/partial rows ---
  cleanDuplicates_(sheet);

  // --- 3. Normalize existing environment values ---
  normalizeExistingEnvValues_(sheet);

  // --- 4. Column widths ---
  var widths = {};
  widths[COL_BUG_ID]      = 200;
  widths[COL_DESCRIPTION] = 450;
  widths[COL_STATUS]      = 120;
  widths[COL_PRIORITY]    = 100;
  widths[COL_ENVIRONMENT] = 120;
  widths[COL_CREATED_AT]  = 180;
  widths[COL_APP_VERSION] = 120;

  for (var h = 0; h < HEADERS.length; h++) {
    var w = widths[HEADERS[h]];
    if (w) sheet.setColumnWidth(h + 1, w);
  }

  // --- 5. Header styling ---
  headerRange
    .setBackground('#2D5F5D')
    .setFontColor('#FFFFFF')
    .setFontWeight('bold')
    .setFontSize(11)
    .setFontFamily('Inter')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');
  sheet.setRowHeight(1, 40);
  sheet.setFrozenRows(1);

  // --- 6. Data range styling ---
  var lastRow = Math.max(sheet.getLastRow(), 2);
  var dataRange = sheet.getRange(2, 1, lastRow - 1, HEADERS.length);
  dataRange
    .setFontFamily('Inter')
    .setFontSize(10)
    .setVerticalAlignment('middle')
    .setBorder(true, true, true, true, true, true, '#E0E0E0', SpreadsheetApp.BorderStyle.SOLID);

  // Row heights for readability
  for (var r = 2; r <= lastRow; r++) {
    sheet.setRowHeight(r, 32);
  }

  // Description column — wrap text
  sheet.getRange(2, indexOf_(HEADERS, COL_DESCRIPTION) + 1, Math.max(lastRow - 1, 1), 1).setWrap(true);

  // Bug ID column — monospace
  sheet.getRange(2, indexOf_(HEADERS, COL_BUG_ID) + 1, Math.max(lastRow - 1, 1), 1)
    .setFontFamily('Roboto Mono')
    .setFontSize(9);

  // Center-align dropdown columns + App Version
  var centerCols = [COL_STATUS, COL_PRIORITY, COL_ENVIRONMENT, COL_APP_VERSION];
  for (var c = 0; c < centerCols.length; c++) {
    var ci = indexOf_(HEADERS, centerCols[c]) + 1;
    sheet.getRange(2, ci, Math.max(lastRow - 1, 1), 1).setHorizontalAlignment('center');
  }

  // --- 7. Data validation dropdowns ---
  applyDropdown_(sheet, COL_STATUS,      STATUS_OPTIONS,   true);   // allow freetext for "duplicate of BUG-xxx"
  applyDropdown_(sheet, COL_PRIORITY,    PRIORITY_OPTIONS, false);
  applyDropdown_(sheet, COL_ENVIRONMENT, ENV_OPTIONS,      false);

  // --- 8. Conditional formatting ---
  applyConditionalFormatting_(sheet);

  // --- 9. Alternating row bands ---
  var bandings = sheet.getBandings();
  for (var b = 0; b < bandings.length; b++) {
    bandings[b].remove();
  }
  if (lastRow > 1) {
    sheet.getRange(1, 1, lastRow, HEADERS.length)
      .applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY);
  }

  // --- 10. Auto-filter ---
  if (!sheet.getFilter()) {
    sheet.getRange(1, 1, lastRow, HEADERS.length).createFilter();
  }

  SpreadsheetApp.flush();
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Apply a dropdown data validation to a column (by header name).
 * Uses 500 rows to cover future entries.
 */
function applyDropdown_(sheet, headerName, options, allowInvalid) {
  var colIdx = indexOf_(HEADERS, headerName) + 1;
  if (colIdx < 1) return;

  var rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(options, true)
    .setAllowInvalid(allowInvalid)
    .build();
  sheet.getRange(2, colIdx, 500, 1).setDataValidation(rule);
}

/**
 * Apply all conditional formatting rules for Status, Priority, and Environment.
 * Uses column letters derived from header positions (not hardcoded).
 */
function applyConditionalFormatting_(sheet) {
  sheet.clearConditionalFormatRules();
  var rules = [];

  var statusColIdx = indexOf_(HEADERS, COL_STATUS) + 1;
  var priorityColIdx = indexOf_(HEADERS, COL_PRIORITY) + 1;
  var envColIdx = indexOf_(HEADERS, COL_ENVIRONMENT) + 1;

  var statusRange   = sheet.getRange(2, statusColIdx, 500, 1);
  var priorityRange = sheet.getRange(2, priorityColIdx, 500, 1);
  var envRange      = sheet.getRange(2, envColIdx, 500, 1);

  // ---- Status colors ----
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('open')
    .setBackground('#FFF3E0').setFontColor('#E65100')
    .setRanges([statusRange]).build());
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('fixed')
    .setBackground('#E8F5E9').setFontColor('#2E7D32')
    .setRanges([statusRange]).build());
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('rejected')
    .setBackground('#FFEBEE').setFontColor('#C62828')
    .setRanges([statusRange]).build());
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('needs-triage')
    .setBackground('#E3F2FD').setFontColor('#1565C0')
    .setRanges([statusRange]).build());
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextContains('duplicate')
    .setBackground('#F3E5F5').setFontColor('#6A1B9A')
    .setRanges([statusRange]).build());

  // ---- Priority colors ----
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('P1')
    .setBackground('#FFEBEE').setFontColor('#C62828').setBold(true)
    .setRanges([priorityRange]).build());
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('P2')
    .setBackground('#FFF3E0').setFontColor('#E65100')
    .setRanges([priorityRange]).build());
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('P3')
    .setBackground('#FFFDE7').setFontColor('#F9A825')
    .setRanges([priorityRange]).build());
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('auto')
    .setBackground('#F5F5F5').setFontColor('#9E9E9E')
    .setRanges([priorityRange]).build());

  // ---- Environment colors ----
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('PROD')
    .setBackground('#FFEBEE').setFontColor('#C62828')
    .setRanges([envRange]).build());
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('DEV')
    .setBackground('#E3F2FD').setFontColor('#1565C0')
    .setRanges([envRange]).build());
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('LOCAL')
    .setBackground('#F5F5F5').setFontColor('#616161')
    .setRanges([envRange]).build());

  sheet.setConditionalFormatRules(rules);
}

/**
 * Remove duplicate/partial rows — keeps the first occurrence of each bug_id
 * (the one with a description). Removes rows with the same bug_id but empty description.
 */
function cleanDuplicates_(sheet) {
  var data = sheet.getDataRange().getValues();
  var bugIdColIdx = indexOf_(data[0], COL_BUG_ID);
  var descColIdx = indexOf_(data[0], COL_DESCRIPTION);

  // Fallback: if headers aren't set yet, use column 0 and 1
  if (bugIdColIdx < 0) bugIdColIdx = 0;
  if (descColIdx < 0) descColIdx = 1;

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
