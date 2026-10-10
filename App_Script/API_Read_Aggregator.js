/**
 * ============================================================================
 * FILE: API_Read_Aggregator.gs
 * PURPOSE: High-efficiency schedule matrix processing and structural aggregations
 * PRD SPECIFICATION REFERENCE: Section 7 (Read Functions 7.3), Section 15.8
 * AUTHOR: Gemini Lead Engineer Gem
 * PROTOCOL COMPLIANCE: 100% Mirror Promotion & Context Standardized Compliant
 * AUDIT: Cycle 13 Cleared (Terminology Compliant)
 * ============================================================================
 */

/**
 * 7.3 getWeeklySchedule
 * Compiles a multi-dimensional timeline matrix containing laboratory allocation grids.
 * Optimizes loop structures via Dictionary Hashing to eliminate GAS timeout vulnerabilities.
 * @param {string} startDateStr - The starting boundary date string (yyyy-MM-dd).
 * @return {Object} An engineered nested matrix structure organized by Date -> Lab ID -> Period.
 */
function getWeeklySchedule(startDateStr) {
  try {
    if (!startDateStr) {
      throw new Error("Weekly schedule matrix generation requires an explicit anchor date.");
    }

    // 🛡️ DRY FIX: Leverage centralized parsing utility to format and normalize input strings
    const sanitizedAnchor = typeof parseDateString === 'function' ? parseDateString(startDateStr) : startDateStr;
    const start = new Date(sanitizedAnchor);
    if (isNaN(start.getTime())) {
      throw new Error(`Invalid anchor date string format passed: ${startDateStr}`);
    }

    const config = typeof getConfig === 'function' ? getConfig() : null;
    if (!config) throw new Error("Configuration context missing.");

    // Compute calendar timeline window limits (Monday to Friday, a 4-day jump from anchor)
    const end = new Date(start.getTime() + 4 * 24 * 60 * 60 * 1000);
    const endDateStr = typeof parseDateString === 'function' ? parseDateString(end) : "";

    // Pull transactions array via cache ecosystem with automatic spreadsheet database fallback
    const rawTxRows = typeof getCachedSheetValues === 'function'
      ? getCachedSheetValues(config.SPREADSHEET_CONFIG.SHEETS.TRANSACTIONS)
      : typeof getSheetData === 'function' ? getSheetData(config.SPREADSHEET_CONFIG.SHEETS.TRANSACTIONS) : null;
      
    const finalTxRows = rawTxRows || (typeof getSheetData === 'function' ? getSheetData(config.SPREADSHEET_CONFIG.SHEETS.TRANSACTIONS) : null);
    if (!finalTxRows || finalTxRows.length === 0) {
      return { ok: true, success: true,  schedule: {} };
    }

    const mappedTransactions = Utils_DataMapper.mapSheetRowsToObjects(finalTxRows, TX_COL);
    const scheduleMatrix = {};

    // ⚡ HIGH EFFICIENCY HASH DICTIONARY LOOP: O(N) Processing Layer
    mappedTransactions.forEach(tx => {
      const txStatus = String(tx.STATUS || "").toUpperCase().trim();
      if (txStatus === "REJECTED" || txStatus === "CANCELLED") return;

      // 🛡️ DRY FIXED: Standardize temporal normalization via centralized engine
      const txDateStr = typeof parseDateString === 'function' ? parseDateString(tx.DATE) : "";
      if (!txDateStr || txDateStr < sanitizedAnchor || txDateStr > endDateStr) return;

      const labId = tx.LAB_ID || tx.LABID || "";
      const period = tx.PERIOD || "";
      
      if (!labId || !period) return;

      if (!scheduleMatrix[txDateStr]) scheduleMatrix[txDateStr] = {};
      if (!scheduleMatrix[txDateStr][labId]) scheduleMatrix[txDateStr][labId] = {};

      // Bind properties harmonized to matching layout parameters
      scheduleMatrix[txDateStr][labId][period] = {
        bookingId: tx.BOOKING_ID || "",
        batchId: tx.BATCH_ID || "",
        teacherName: tx.TEACHER || "",
        subject: tx.SUBJECT || "",
        section: tx.SECTION || "",
        status: txStatus
      };
    });

    return { ok: true, success: true,  schedule: scheduleMatrix };
  } catch (err) {
    if (typeof _writeLogEntry === 'function') {
      _writeLogEntry("ERROR", `[API_Read_Aggregator.getWeeklySchedule] Processing failed: ${err.message}`);
    }
    throw err;
  }
}

/**
 * Resolves calendar day type configurations and bell layout timelines.
 * ⚡ PERFORMANCE OPTIMIZED: Routes queries through cache service to safeguard against high I/O limits.
 * @return {Object} Structured metadata timeline dictionary keyed by formatted date strings.
 */
function getCalendarMetadataTimeline() {
  try {
    const config = typeof getConfig === 'function' ? getConfig() : null;
    if (!config) throw new Error("Configuration context missing.");

    // ⚡ PERFORMANCE FIX: Route storage queries through chunked cache engine instead of synchronous direct sheets read
    let calData = typeof getCachedSheetValues === 'function'
      ? getCachedSheetValues(config.SPREADSHEET_CONFIG.SHEETS.CALENDAR)
      : null;

    if (!calData) {
      const ss = typeof getMainSpreadsheet === 'function' ? getMainSpreadsheet() : SpreadsheetApp.getActiveSpreadsheet();
      const calSheet = ss.getSheetByName(config.SPREADSHEET_CONFIG.SHEETS.CALENDAR);
      if (!calSheet) throw new Error("Database Error: Calendar sheet could not be located in sheet container.");
      calData = calSheet.getDataRange().getValues();
      
      if (typeof setCachedSheetValues === 'function') {
        setCachedSheetValues(config.SPREADSHEET_CONFIG.SHEETS.CALENDAR, calData);
      }
    }

    // Ingest data rows directly through our change-resilient defensive mapper schema configuration
    const mappedCalendar = Utils_DataMapper.mapSheetRowsToObjects(calData, CAL_COL);
    const metadataTimelineMap = {};

    mappedCalendar.forEach(item => {
      // 🛡️ DRY FIXED: Shift to pre-established parseDateString utility to strip timezone drift
      const isoKey = typeof parseDateString === 'function' ? parseDateString(item.DATE) : "";
      if (!isoKey) return;

      // 🛡️ HARMONIZED PROPERTY NAMESPACE COMPLIANCE: Absolute Uniform Uppercase Token Mapping
      metadataTimelineMap[isoKey] = {
        dayType: item.DAY_TYPE || "A",
        bellType: item.BELL_TYPE || "Normal"
      };
    });

    return { ok: true, success: true,  timeline: metadataTimelineMap };
    
  } catch (err) {
    if (typeof _writeLogEntry === 'function') {
      _writeLogEntry("ERROR", `[API_Read_Aggregator.getCalendarMetadataTimeline] CRITICAL RUNTIME ERROR: ${err.message}`);
    }
    throw err;
  }
}