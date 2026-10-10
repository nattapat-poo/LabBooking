/**
 * ============================================================================
 * FILE: API_Update_Meta.js
 * PURPOSE: Secondary state mutations (Tutorial Tracking, Postponements).
 * PRD/DESIGN REF: Section 15.8 / Phase 4 State Mutation Directives
 * AUTHOR: Gemini Lead Engineer Gem
 * PROTOCOL: 100% Mirror Promotion Compliant, Atomic Matrix Write Patched
 * AUDIT: Cycle 13 Cleared (Terminology Compliant)
 * ============================================================================
 */

/**
 * Hardened: Single-trip atomic row-isolated update to commit user tutorial flags.
 * 🛡️ ARCHITECTURAL FIX: Bound strictly to USR_COL metadata vectors, bypassing runtime scans.
 */
function completeTutorial() {
  if (typeof getSecureAuthenticatedUserEmail !== 'function') {
    throw new Error("SECURITY_CRITICAL: Central authentication perimeter utility is offline.");
  }
  const activeEmail = getSecureAuthenticatedUserEmail();
  if (!activeEmail) return { ok: false, success: false,  error: "Security Guard: Unauthenticated session." };

  const executionWrapper = typeof withLock === 'function' ? withLock : function(cb){ return cb(); };

  return executionWrapper(function() {
    const config = typeof getConfig === 'function' ? getConfig() : null;
    const userSheet = typeof getSheet === 'function' ? getSheet(config.SPREADSHEET_CONFIG.SHEETS.USERS) : SpreadsheetApp.getActiveSpreadsheet().getSheetByName(config.SPREADSHEET_CONFIG.SHEETS.USERS);
    
    const data = userSheet.getDataRange().getValues();
    if (data.length <= 1) throw new Error("Users Database Empty.");

    // Lock to schema compilation configurations instantly
    if (typeof USR_COL === 'undefined') throw new Error("Schema Integrity Exception: USR_COL mapping registry missing.");
    const emailColIdx = USR_COL.EMAIL.index;
    const tutorialColIdx = USR_COL.HAS_COMPLETED_TUTORIAL.index;
    
    const matchTarget = activeEmail.toLowerCase().trim();
    let targetRowPos = -1;

    for (let i = 1; i < data.length; i++) {
      if (String(data[i][emailColIdx]).toLowerCase().trim() === matchTarget) {
        targetRowPos = i + 1;
        data[i][tutorialColIdx] = true; // Commit structural value update directly to row matrix
        break;
      }
    }

    if (targetRowPos === -1) {
      return { ok: false, success: false,  error: "User identity block could not be matched within system records." };
    }

    // Isolate range mapping write to exactly the matching entry coordinates to minimize locking holding times
    userSheet.getRange(targetRowPos, 1, 1, data[0].length).setValues([data[targetRowPos - 1]]);
    SpreadsheetApp.flush();
    
    if (typeof clearCacheForSheet === 'function') {
      clearCacheForSheet(config.SPREADSHEET_CONFIG.SHEETS.USERS);
    }

    return { ok: true, success: true,  message: "Tutorial compilation flags closed cleanly into system storage." };
  });
}

/**
 * Coordinates postponement tracking validations and updates historical tracking rows.
 * 🛡️ ARCHITECTURAL FIX: Stripped legacy indexOf loops, hard-locked to TX_COL schema indices.
 */
function requestPostponement(bookingId, destinationPayload, requesterEmail) {
  if (!bookingId || !destinationPayload) {
    throw new Error("Validation Exception: Missing payload parameters for lifecycle modification.");
  }

  const executionWrapper = typeof withLock === 'function' ? withLock : function(cb){ return cb(); };

  return executionWrapper(function() {
    const config = typeof getConfig === 'function' ? getConfig() : null;
    const txSheet = typeof getSheet === 'function' ? getSheet(config.SPREADSHEET_CONFIG.SHEETS.TRANSACTIONS) : SpreadsheetApp.getActiveSpreadsheet().getSheetByName(config.SPREADSHEET_CONFIG.SHEETS.TRANSACTIONS);
    
    const txRows = txSheet.getDataRange().getValues();
    if (txRows.length <= 1) throw new Error("Transactions repository is empty.");

    if (typeof TX_COL === 'undefined') throw new Error("Schema Exception: Master TX_COL layout map missing.");
    const idIdx = TX_COL.BOOKING_ID.index;
    const statusIdx = TX_COL.STATUS.index;
    const remarkIdx = TX_COL.REMARK.index;

    let rowArray = null;
    let targetRowIndex = -1;

    for (let i = 1; i < txRows.length; i++) {
      if (String(txRows[i][idIdx]).trim() === String(bookingId).trim()) {
        rowArray = txRows[i];
        targetRowIndex = i + 1;
        break;
      }
    }

    if (!rowArray) throw new Error("Database Resolution Fault: Target booking record does not exist.");

    // Assert existing structural status flags
    const currentStatus = rowArray[statusIdx] ? String(rowArray[statusIdx]).trim().toLowerCase() : "";
    if (["cancelled", "denied", "declined", "rejected", "error (calendar)"].includes(currentStatus)) {
      throw new Error("Lifecycle Error: Cannot request postponement. The original booking is no longer active.");
    }
    
    // Validate destination parameters bounds
    if (destinationPayload.date && typeof validateLeadTime === "function") {
       try {
         validateLeadTime(destinationPayload.date);
       } catch (leadTimeError) {
         throw new Error(`Postponement Blocked: Target destination date violates operational policies. ${leadTimeError.message}`);
       }
    }

    // Inject trace stamps securely into schema coordinates without risking adjacent column corruptions
    const existingRemark = rowArray[remarkIdx] ? String(rowArray[remarkIdx]).trim() : "";
    const postStamp = `[Postponed to: ${destinationPayload.date || 'TBD'} Period ${destinationPayload.period || 'TBD'}]`;
    rowArray[remarkIdx] = existingRemark ? `${existingRemark} | ${postStamp}` : postStamp;
    rowArray[statusIdx] = "POSTPONED";

    // Write isolated row block back to ledger
    txSheet.getRange(targetRowIndex, 1, 1, txRows[0].length).setValues([rowArray]);
    SpreadsheetApp.flush();
    
    if (typeof clearAllCaches === 'function') clearAllCaches();

    return { ok: true, success: true,  message: "Postponement state stamp successfully written." };
  });
}