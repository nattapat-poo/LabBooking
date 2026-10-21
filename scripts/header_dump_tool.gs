/**
 * 🔍 Lead Architect Read-Only Header Dump Tool (P0-17)
 * 
 * Instructions for Lead Architect (Mek):
 * 1. Open your Google Apps Script editor.
 * 2. Create a temporary script file and paste this code.
 * 3. Run `executeHeaderDump()`.
 * 4. Copy the resulting JSON string from the execution log and save it to `schema/headers.json`.
 * 
 * Safety & Privacy Guarantee:
 * - 100% Read-Only: Never modifies any sheet cell.
 * - Zero PII: Reads only Row 1 (Headers) and Row 2 (Formulas). Never reads Row 3+ (User data).
 * - Computes SHA-256 fingerprints of header rows.
 */

function executeHeaderDump() {
  var config = {
    localSheetId: PropertiesService.getScriptProperties().getProperty('LOCAL_SPREADSHEET_ID'),
    masterDbId: PropertiesService.getScriptProperties().getProperty('MASTER_DB_ID'),
    timetableId: PropertiesService.getScriptProperties().getProperty('TIMETABLE_2026_ID')
  };

  var targetMap = {
    local: {
      id: config.localSheetId,
      tabs: ['Bookings', 'Outages', 'Duties', 'Config', 'Logs', 'Stats']
    },
    masterDb: {
      id: config.masterDbId,
      tabs: ['Users', 'Subjects', 'Room', 'Academic_Calendar', 'Bell_Schedules']
    },
    timetable: {
      id: config.timetableId,
      tabs: ['Index']
    }
  };

  var results = {
    timestamp: new Date().toISOString(),
    inspectedTabs: {}
  };

  for (var category in targetMap) {
    var target = targetMap[category];
    if (!target.id) {
      Logger.log('⚠️ Skipping ' + category + ': ID not found in Script Properties.');
      continue;
    }

    try {
      var ss = SpreadsheetApp.openById(target.id);
      for (var i = 0; i < target.tabs.length; i++) {
        var tabName = target.tabs[i];
        var sheet = ss.getSheetByName(tabName);
        if (!sheet) {
          results.inspectedTabs[category + ':' + tabName] = { error: 'TAB_NOT_FOUND' };
          continue;
        }

        var maxCols = sheet.getLastColumn();
        if (maxCols === 0) {
          results.inspectedTabs[category + ':' + tabName] = { error: 'EMPTY_SHEET' };
          continue;
        }

        var headerRow = sheet.getRange(1, 1, 1, maxCols).getValues()[0];
        var formulaRow1 = sheet.getRange(1, 1, 1, maxCols).getFormulas()[0];
        var formulaRow2 = sheet.getLastRow() >= 2 ? sheet.getRange(2, 1, 1, maxCols).getFormulas()[0] : [];

        var cleanHeaders = headerRow.map(function(h) { return String(h).trim(); });
        var formulasDetected = [];

        for (var c = 0; c < maxCols; c++) {
          var f1 = formulaRow1[c] || '';
          var f2 = formulaRow2[c] || '';
          if (f1 || f2) {
            formulasDetected.push({
              colIndex: c,
              colLetter: String.fromCharCode(65 + c),
              header: cleanHeaders[c],
              row1Formula: f1,
              row2Formula: f2
            });
          }
        }

        var rawHeaderString = cleanHeaders.join('|');
        var sha256 = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, rawHeaderString, Utilities.Charset.UTF_8);
        var shaHex = sha256.map(function(b) {
          var val = (b < 0 ? b + 256 : b).toString(16);
          return val.length === 1 ? '0' + val : val;
        }).join('');

        results.inspectedTabs[category + ':' + tabName] = {
          headerCount: cleanHeaders.length,
          headers: cleanHeaders,
          headerSha256: shaHex,
          hasArrayFormulas: formulasDetected.length > 0,
          formulas: formulasDetected
        };
      }
    } catch (e) {
      Logger.log('❌ Error inspecting ' + category + ': ' + e.message);
    }
  }

  Logger.log('📋 ===== HEADER DUMP RESULT (JSON) =====');
  Logger.log(JSON.stringify(results, null, 2));
  Logger.log('=========================================');
  return results;
}
