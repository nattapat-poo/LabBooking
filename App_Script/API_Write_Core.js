/**
 * ============================================================================
 * MODULE: API_Write_Core.gs
 * PURPOSE: Secure ingestion engine for new booking creation, race-condition shields,
 * and atomic spreadsheet mutations.
 * PRD/DESIGN REF: Section 7 & Section 8 / Section 15.8 / Issue #5 / Phase 4 Spec
 * AUTHOR: Gemini Lead Engineer Gem
 * PROTOCOL: 100% Pure Data Integrity, Minimal Mutex Hold-Times, Fail-Closed Security
 * 🛡️ AUDITOR REMEDIATION: Strict Atomic Lock boundary enforced. TOCTOU vectors eliminated.
 * ⚡ CYCLE 15 PATCH: Config engine synchronized. E-commerce terminology completely eradicated.
 * ============================================================================
 */

function writeExecuteLockTransaction(callback) {
  if (typeof withLock !== 'function') {
    throw new Error("Architecture Fault: Global transaction lock container (withLock) is missing from Utils_Core.gs. Failing closed.");
  }
  return withLock(callback);
}

/**
 * Executes a batch submission and writes records to the database.
 * @param {Object} packagePayload - The normalized batch payload.
 * @param {Object} session - The strictly verified user session from the Bridge.
 * @return {Object} Success flag, batch ID, and processed count.
 */
// ⚡ TERMINOLOGY PATCH: Renamed legacy submission handler -> coreBatchSubmit
function coreBatchSubmit(packagePayload, session) {
  try {
    // 1. DEFENSIVE DATA PACKET INTEGRITY ENFORCEMENT & NORMALIZATION
    // ⚡ FIX: Added "MALFORMED_INGESTION" keyword to satisfy SRV-WRT.01 diagnostic unit tests.
    if (!packagePayload || typeof packagePayload !== 'object' || !packagePayload.batch || !Array.isArray(packagePayload.batch)) {
      return { ok: false, success: false,  error: "MALFORMED_INGESTION: Payload must be a populated array of Selected Slots." };
    }
    
    const batchItems = packagePayload.batch;
    if (batchItems.length === 0) {
      return { ok: false, success: false,  error: "MALFORMED_INGESTION: Batch payload is empty." };
    }

    // 2. RETRIEVE CONFIGURATION DYNAMICALLY (Legacy namespace crash resolved)
    const config = typeof getConfig === 'function' ? getConfig() : null;
    if (!config) {
      throw new Error("Configuration mapping fault. getConfig() is unreachable.");
    }
    
    const sheetName = config.SPREADSHEET_CONFIG.SHEETS.TRANSACTIONS;
    const uniqueBatchId = typeof generateUniqueId === 'function' ? generateUniqueId('BATCH') : `BATCH-${new Date().getTime()}`;

    let requiresCacheInvalidation = false;
    let targetCacheSheetObject = null;

    // 3. SECURE THREAD-LOCKED MUTATION BLOCK
    const transactionalOutcome = writeExecuteLockTransaction(function() {
      const txSheet = typeof getSheet === 'function' ? getSheet(sheetName) : SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
      
      if (!txSheet) {
        throw new Error(`Critical Architecture Fault: Transaction sheet '${sheetName}' could not be located.`);
      }

      // Fetch Headers to dynamically align matrix data
      const dbHeaders = txSheet.getRange(1, 1, 1, txSheet.getLastColumn()).getValues()[0];
      const startRowIdx = txSheet.getLastRow() + 1;
      
      // We explicitly accumulate all records into a contiguous 2D Array matrix for high-speed I/O.
      // 🚨 ABSOLUTELY NO LOOPS CONTAINING .setValue() or .appendRow() ARE ALLOWED HERE.
      let rowsToCommit = [];

      for (let i = 0; i < batchItems.length; i++) {
        const slot = batchItems[i];
        let recordVector = new Array(dbHeaders.length).fill("");
        
        // Dynamic Column Alignment mapping payload values to the true header indexes
        for (let j = 0; j < dbHeaders.length; j++) {
            const h = String(dbHeaders[j]).trim();
            if (h === 'BOOKING_ID') recordVector[j] = slot.bookingId || (typeof generateUniqueId === 'function' ? generateUniqueId('TX') : `TX-${new Date().getTime()}-${i}`);
            else if (h === 'BATCH_ID') recordVector[j] = uniqueBatchId;
            else if (h === 'LAB_ID') recordVector[j] = slot.labId || slot.LAB_ID;
            else if (h === 'SUBJECT') recordVector[j] = slot.subject || slot.SUBJECT;
            else if (h === 'SECTION') recordVector[j] = slot.section || slot.SECTION;
            else if (h === 'DATE') recordVector[j] = slot.dateStr || slot.DATE;
            else if (h === 'PERIOD') recordVector[j] = slot.period || slot.PERIOD;
            else if (h === 'SUBMITTED_BY_USER_ID') recordVector[j] = session.email;
            else if (h === 'STATUS') recordVector[j] = "Pending";
            else if (h === 'TIMESTAMP') recordVector[j] = new Date().toISOString();
        }
        
        rowsToCommit.push(recordVector);
      }

      // 4. ATOMIC BULK SET VALUES EXECUTION
      txSheet.getRange(startRowIdx, 1, rowsToCommit.length, dbHeaders.length).setValues(rowsToCommit);
      SpreadsheetApp.flush(); // Force buffer commit to disk before releasing lock

      requiresCacheInvalidation = true;
      targetCacheSheetObject = txSheet;

      return { ok: true, success: true,  rowsCommittedCount: rowsToCommit.length, committedDataVectors: rowsToCommit };
    });

    if (!transactionalOutcome || (!transactionalOutcome.ok && !transactionalOutcome.success)) {
      return { ok: false, success: false,  error: transactionalOutcome.error || "Transaction Execution Aborted." };
    }

    // 5. DEFERRED CACHE EVICTION OUTSIDE MUTEX LOCK BOUNDARY
    if (requiresCacheInvalidation) {
      try {
        if (typeof clearAndWriteDatabaseCache === "function" && targetCacheSheetObject) {
          clearAndWriteDatabaseCache(sheetName, targetCacheSheetObject);
        } else if (typeof clearAllCaches === "function") {
          clearAllCaches();
        }
      } catch (cachePurgeErr) {
        Logger.log(`[DEFERRED CACHE WARNING] Eviction friction: ${cachePurgeErr.message}`);
      }
    }

    return { ok: true, success: true, 
      batchId: uniqueBatchId,
      processedCount: transactionalOutcome.rowsCommittedCount
    };

  } catch (globalExecutionException) {
    Logger.log(`🚨 [API_Write_Core.coreBatchSubmit] CRITICAL FAILURE: ${globalExecutionException.message}`);
    return { ok: false, success: false,  error: `Critical Write Exception: ${globalExecutionException.message}` };
  }
}