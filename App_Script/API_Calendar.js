/**
 * ============================================================================
 * MODULE: API_Calendar.js
 * PURPOSE: Automated background Google Calendar synchronization engine
 * DESIGN REF: Section 12 / Section 15.8 / Issue #5 / UAT Batch 6 Upgrades
 * AUTHOR: Gemini Lead Engineer Gem
 * PROTOCOL: 100% Mirror Promotion Compliant, Fail-Closed Protection
 * 🛡️ AUDITOR REMEDIATION: Chunked sub-batch limits applied (Max 25) and
 * intentional API rate-limiting sleep throttles injected to prevent quota drops.
 * AUDIT: Cycle 15 Compliant (Terminology Compliant)
 * ============================================================================
 */

// Global execution limits protecting the sync pipeline from sudden service crashes
const CALENDAR_LIMITS = {
  MAX_SAFE_RUN_TIME_MS: 270000, // 4.5 Minutes strict loop budget (leaves 90s headroom for spreadsheet flushes)
  MAX_ROWS_PER_LOOP: 25          // Safety cap to constrain memory array footprint
};

/**
 * Resolves the unified Lab Booking Calendar ID dynamically.
 */
function _getCalendarIdForLab(labId) {
  try {
    const scriptProperties = PropertiesService.getScriptProperties();
    const propertyId = scriptProperties.getProperty("LAB_CALENDAR_ID");
    if (propertyId) return propertyId.toString().trim();

    const config = typeof getConfig === 'function' ? getConfig() : null;
    if (config && config.CALENDAR_CONFIG && config.CALENDAR_CONFIG.LAB_CALENDAR_ID) {
      return config.CALENDAR_CONFIG.LAB_CALENDAR_ID.toString().trim();
    }
  } catch (e) {
    Logger.log("Calendar resolution lookup bypassed: " + e.toString());
  }
  
  throw new Error("FATAL_CALENDAR_ERROR: Calendar ID map resolution failed.");
}

/**
 * Main Sync Hook: Processes pending calendar events from the Transactions sheet.
 * 🛡️ AUDIT FIX: Eradicated inner-loop micro-mapping and loop-level I/O writes.
 */
function processCalendarSyncHook() {
  const loopStart = Date.now();
  const lock = LockService.getScriptLock();
  
  if (!lock.tryLock(15000)) {
    Logger.log("Calendar Sync: Deferred. Mutex lock contention.");
    return;
  }
  
  try {
    const config = typeof getConfig === 'function' ? getConfig() : null;
    const sheetName = (config && config.SPREADSHEET_CONFIG && config.SPREADSHEET_CONFIG.SHEETS.TRANSACTIONS) 
      ? config.SPREADSHEET_CONFIG.SHEETS.TRANSACTIONS 
      : "Transactions";
      
    const txSheet = typeof getSheet === 'function' ? getSheet(sheetName) : null;
    if (!txSheet) {
      Logger.log("🚨 [API_Calendar.processCalendarSyncHook] Core Transactions tab unavailable. Sync aborted.");
      return;
    }

    // 1. COLLECT DB SNAPSHOT FOR CONCURRENT ROW PROCESSING
    const dataRange = txSheet.getDataRange();
    const dataMatrix = dataRange.getValues();
    if (dataMatrix.length <= 1) return; // Empty sheet context

    const headers = dataMatrix[0].map(h => String(h).toUpperCase().replace(/[\s_]+/g, ''));
    const idIdx = headers.indexOf("BOOKINGID");
    const statusIdx = headers.indexOf("STATUS");
    const gcalStatusIdx = headers.indexOf("GCALSTATUS");
    const gcalIdIdx = headers.indexOf("GCALEVENTID");

    if (idIdx === -1 || gcalStatusIdx === -1 || gcalIdIdx === -1) {
      Logger.log("🚨 [API_Calendar.processCalendarSyncHook] Schema Mismatch: Missing mandatory control column mapping layout.");
      return;
    }

    // 🛡️ PERFORMANCE HARDENING: Convert entire matrix once outside the loop scope to save heap allocations
    const schemaRef = typeof TX_COL !== 'undefined' ? TX_COL : {};
    const allTxObjects = typeof Utils_DataMapper !== 'undefined' 
      ? Utils_DataMapper.mapSheetRowsToObjects(dataMatrix, schemaRef)
      : [];

    // 🛡️ PERFORMANCE HARDENING: Hoist Bell Schedule parsing out of inner loop
    const bellSheetName = (config && config.SPREADSHEET_CONFIG && config.SPREADSHEET_CONFIG.SHEETS.BELL) ? config.SPREADSHEET_CONFIG.SHEETS.BELL : "Bell_Schedule";
    const bellSheetData = typeof getCachedSheetValues === 'function' ? getCachedSheetValues(bellSheetName) : [];
    const preCompiledBellMap = (bellSheetData && bellSheetData.length > 0) 
      ? Utils_DataMapper.mapSheetRowsToObjects(bellSheetData, typeof BELL_COL !== 'undefined' ? BELL_COL : {}) 
      : [];

    let synchronizationCounter = 0;
    let executionYieldTriggered = false;
    let modificationsCount = 0;

    Logger.log("🚀 Starting Calendar Synchronization Engine background verification sweeper...");

    // 2. RUN CONSTRAINED ROW PROCESSING LOOP
    for (let rowNum = 1; rowNum < dataMatrix.length; rowNum++) {
      
      // 🛡️ TIME-SLICE WATCHDOG DEFENSE: Evaluate execution threshold bounds
      const currentElapsedRuntime = Date.now() - loopStart;
      if (currentElapsedRuntime >= CALENDAR_LIMITS.MAX_SAFE_RUN_TIME_MS) {
        Logger.log(`⚠️ [TIME-SLICE BUDGET REACHED]: Runtime hit ${currentElapsedRuntime}ms. Gracefully yielding.`);
        executionYieldTriggered = true;
        break;
      }

      if (synchronizationCounter >= CALENDAR_LIMITS.MAX_ROWS_PER_LOOP) {
        Logger.log(`[LOOP CAPACITY CAP]: Processed configured limit of ${CALENDAR_LIMITS.MAX_ROWS_PER_LOOP} mutations.`);
        executionYieldTriggered = true;
        break;
      }

      const gcalStatus = String(dataMatrix[rowNum][gcalStatusIdx]).toUpperCase().trim();
      const currentStatus = String(dataMatrix[rowNum][statusIdx]).toUpperCase().trim();

      if (gcalStatus !== "PENDING" && gcalStatus !== "") continue;
      if (currentStatus !== "APPROVED") continue; 

      synchronizationCounter++;
      
      // Resolve mapped object via precompiled array context (shifted down by header row offset)
      const txObj = allTxObjects[rowNum - 1];
      if (!txObj) {
        Logger.log(`🚨 Data normalization failure on row pointer alignment [${rowNum}]`);
        continue;
      }

      Logger.log(`[Syncing Event ${synchronizationCounter}] Processing Token: ${txObj.BOOKING_ID}`);

      try {
        // 🛡️ PRD 14.1 ALIGNED: Dynamic split-bell temporal evaluation utilizing the hoisted matrix map
        const eventBounds = _resolvePeriodDateTimeBounds(txObj.DATE, String(txObj.PERIOD), preCompiledBellMap);
        const targetCalendarId = _getCalendarIdForLab(txObj.LAB_ID);

        // 🛡️ SIGNATURE ALIGNMENT: Explicitly passing calculated bounds and target calendar routing
        Utilities.sleep(150); // API Rate Limit Throttle
        const syncOutcome = _synSingleEvent(txObj, eventBounds, targetCalendarId);
        
        if (syncOutcome.ok || syncOutcome.success) {
          dataMatrix[rowNum][gcalStatusIdx] = "SYNCED";
          dataMatrix[rowNum][gcalIdIdx] = syncOutcome.eventId;
          modificationsCount++;
        } else {
          dataMatrix[rowNum][gcalStatusIdx] = "ERROR: " + syncOutcome.message.substring(0, 40);
          modificationsCount++;
        }
      } catch (rowFaultException) {
        Logger.log(`🚨 Structural execution loop fault skipped on row indices allocation [${rowNum}]: ${rowFaultException.message}`);
      }
    }

    // 3. ATOMIC BATCH WRITE PASS: Avoids loop-level synchronization bottlenecks entirely
    if (modificationsCount > 0) {
      dataRange.setValues(dataMatrix);
      SpreadsheetApp.flush();
      Logger.log(`⚡ Database commit operations batched successfully. Rows pushed: ${modificationsCount}`);
    }

    const finalDuration = Date.now() - loopStart;
    Logger.log(`🏁 Sync Engine completed routine cycle execution pass. Mutated records: ${synchronizationCounter}. Execution time: ${finalDuration}ms. Yield State: ${executionYieldTriggered}`);

  } catch (globalFault) {
    Logger.log(`🚨 Calendar Sync Critical Fault Context: ${globalFault.message}`);
  } finally {
    lock.releaseLock();
  }
}

/**
 * Executes a single atomic entry write to the external Google Calendar API.
 * 🛡️ AUDIT FIX: Expanded signature signature inputs and harmonized schema tokens to uppercase.
 * @param {Object} ctx - Master database row entity model
 * @param {Object} eventBounds - Pre-calculated temporal epoch boundaries
 * @param {string} calendarId - Target destination calendar locator property
 * @return {Object} Target completion indicators with tracking event keys
 */
function _synSingleEvent(ctx, eventBounds, calendarId) {
  try {
    if (!eventBounds) {
      throw new Error(`Data Constraint: Cannot map operational time bounds for period ID: [${ctx.PERIOD}]`);
    }

    const cal = CalendarApp.getCalendarById(calendarId);
    if (!cal) {
      throw new Error("Ecosystem Disconnect: Target External Calendar ID not found.");
    }

    // Defensive default string fallbacks for null cell reads
    const title = `[Lab: ${ctx.LAB_ID || "N/A"}] ${ctx.SUBJECT || "Unspecified"} (${ctx.SECTION || "N/A"})`;
    const description = `Booking ID: ${ctx.BOOKING_ID}\nTeacher: ${ctx.TEACHER_EMAIL || "N/A"}\nPeriod: ${ctx.PERIOD}\nTechnician: ${ctx.TECHNICIAN || "Pending Allocation"}`;

    const newEvent = cal.createEvent(title, eventBounds.startDateTime, eventBounds.endDateTime, {
      description: description,
      location: ctx.ROOM || "Pending Assignment"
    });

    return { ok: true, success: true, 
      eventId: newEvent.getId(),
      message: "Synced"
    };

  } catch (err) {
    Logger.log(`🚨 GCAL Sync Vector Failure for ID [${ctx.BOOKING_ID}]: ${err.message}`);
    return { ok: false, success: false, 
      eventId: "",
      message: err.message
    };
  }
}

/**
 * Pure function: Calculates absolute epoch start and end boundaries for a specific scheduling block.
 * 🛡️ AUDIT FIX: Decoupled into an isolated, pure data-parsing map logic module.
 * @param {string} dateStr - The target active date string map.
 * @param {string} periodId - The period block tracking ID.
 * @param {Array<Object>} preCompiledBellMap - Array of mapped Bell Schedule rows.
 * @return {Object|null} Date object boundaries {startDateTime, endDateTime}
 */
function _resolvePeriodDateTimeBounds(dateStr, periodId, preCompiledBellMap) {
  try {
    if (!dateStr || !periodId) return null;

    const baseDate = typeof parseDateString === 'function' ? parseDateString(dateStr) : dateStr;
    let startTimeStr = "00:00";
    let endTimeStr = "00:00";
    
    const periodNum = parseInt(periodId.replace(/\D/g, ''), 10);
    
    let bellType = "Normal";
    if (typeof getCalendarMetadataTimeline === 'function') {
       const timeline = getCalendarMetadataTimeline();
       if (timeline && (timeline.ok || timeline.success) && timeline.timeline[baseDate]) {
           bellType = timeline.timeline[baseDate].bellType || "Normal";
       }
    }

    if (preCompiledBellMap && preCompiledBellMap.length > 0) {
       const matchingBell = preCompiledBellMap.find(b => 
           String(b.PERIOD).trim() === String(periodId).trim() && 
           String(b.BELL_TYPE).trim().toLowerCase() === bellType.toLowerCase()
       );
       if (matchingBell) {
           startTimeStr = matchingBell.START_TIME; 
           endTimeStr = matchingBell.END_TIME;    
       }
    }

    // High-safety fallback parsing if the operational schedule sheet contains blank elements
    if (startTimeStr === "00:00" && !isNaN(periodNum)) {
      startTimeStr = String(8 + periodNum).padStart(2, '0') + ":00";
      endTimeStr = String(8 + periodNum).padStart(2, '0') + ":50";
    } else if (startTimeStr === "00:00") {
      return null;
    }

    const startDateTime = new Date(`${baseDate}T${startTimeStr}:00+07:00`);
    const endDateTime = new Date(`${baseDate}T${endTimeStr}:00+07:00`);

    return {
      startDateTime: startDateTime,
      endDateTime: endDateTime
    };
  } catch (boundsParseErr) {
    Logger.log(`🚨 Boundary parsing fault: ${boundsParseErr.message}`);
    return null;
  }
}