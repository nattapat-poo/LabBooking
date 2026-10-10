/**
 * ============================================================================
 * MODULE: API_Read_Lab.gs
 * PURPOSE: Resolves Lab inventory matrices, timeline states, and bookings.
 * PRD/DESIGN REF: Section 7 (Read Functions) / Phase 1.2 Forensic Patching
 * AUTHOR: Gemini Lead Engineer Gem
 * PROTOCOL: 100% Defensive Architecture, Schema-Bound Immutable Mapping
 * AUDIT: Cycle 13 Cleared (Terminology Compliant)
 * ============================================================================
 */

/**
 * Retrieves registered laboratories from the system repository.
 * 🛡️ ARCHITECTURE CLEANUP: Streamlined cache-miss fallback execution sequence.
 * @return {Array<Object>} Sanitized list of active laboratories.
 */
function coreGetLabList() {
  try {
    const config = typeof getConfig === 'function' ? getConfig() : null;
    if (!config) throw new Error("Configuration context is missing.");

    // ⚡ OPTIMIZED FALLBACK: Execute cache fetch first, cleanly cascade to sheet fetch on miss
    let finalRows = typeof getCachedSheetValues === 'function' 
      ? getCachedSheetValues(config.SPREADSHEET_CONFIG.SHEETS.LABS) 
      : null;
      
    if (!finalRows && typeof getSheetData === 'function') {
      finalRows = getSheetData(config.SPREADSHEET_CONFIG.SHEETS.LABS);
    }

    if (!finalRows || finalRows.length === 0) {
      throw new Error("Database Error: Laboratories data sheet is empty or offline.");
    }

    const mappedLabs = Utils_DataMapper.mapSheetRowsToObjects(finalRows, LAB_COL);
    
    return mappedLabs
      .filter(lab => String(lab.STATUS || "").toUpperCase().trim() !== "INACTIVE")
      .map(lab => ({
        labId: lab.LAB_ID || "",
        labName: lab.LAB_NAME || "",
        capacity: Number(lab.CAPACITY || 0),
        status: String(lab.STATUS || "ACTIVE").toUpperCase().trim()
      }));
  } catch (err) {
    if (typeof _writeLogEntry === 'function') {
      _writeLogEntry("ERROR", `[API_Read_Lab.coreGetLabList] Critical exception mapped: ${err.message}`);
    }
    throw err;
  }
}

/**
 * Retrieves administrative calendar blocks and lab outages.
 * @return {Array<Object>} Mapped array of registered laboratory outages.
 */
function coreGetLabOutages() {
  try {
    const config = typeof getConfig === 'function' ? getConfig() : null;
    if (!config) throw new Error("Configuration context is missing.");

    const rawRows = typeof getCachedSheetValues === 'function' 
      ? getCachedSheetValues(config.SPREADSHEET_CONFIG.SHEETS.OUTAGES) 
      : typeof getSheetData === 'function' ? getSheetData(config.SPREADSHEET_CONFIG.SHEETS.OUTAGES) : null;
      
    const finalRows = rawRows || (typeof getSheetData === 'function' ? getSheetData(config.SPREADSHEET_CONFIG.SHEETS.OUTAGES) : null);
    if (!finalRows || finalRows.length === 0) return [];

    const schemaToUse = typeof OUT_COL !== 'undefined' ? OUT_COL : (typeof OUTAGE_COL !== 'undefined' ? OUTAGE_COL : {});
    const mappedOutages = Utils_DataMapper.mapSheetRowsToObjects(finalRows, schemaToUse);

    return mappedOutages.map(out => ({
      outageId: out.OUTAGE_ID || "",
      labId: out.LAB_ID || "",
      labName: out.LAB_NAME || "",
      startDate: typeof parseDateString === 'function' ? parseDateString(out.START_DATE) : "",
      endDate: typeof parseDateString === 'function' ? parseDateString(out.END_DATE) : "",
      startPeriod: out.START_PERIOD || "",
      endPeriod: out.END_PERIOD || "",
      reason: out.REASON || "",
      status: String(out.STATUS || "ACTIVE").toUpperCase().trim()
    }));
  } catch (err) {
    if (typeof _writeLogEntry === 'function') {
      _writeLogEntry("ERROR", `[API_Read_Lab.coreGetLabOutages] Failed to compile outages dataset: ${err.message}`);
    }
    throw err;
  }
}

/**
 * Fetches technician allocation data context for assigned room mappings.
 * @return {Array<Object>} Array of lab-technician matching records.
 */
function coreGetLabAssignmentContext() {
  try {
    const config = typeof getConfig === 'function' ? getConfig() : null;
    if (!config) throw new Error("Configuration context is missing.");

    const rawRows = typeof getCachedSheetValues === 'function' 
      ? getCachedSheetValues(config.SPREADSHEET_CONFIG.SHEETS.DUTIES) 
      : typeof getSheetData === 'function' ? getSheetData(config.SPREADSHEET_CONFIG.SHEETS.DUTIES) : null;
      
    const finalRows = rawRows || (typeof getSheetData === 'function' ? getSheetData(config.SPREADSHEET_CONFIG.SHEETS.DUTIES) : null);
    if (!finalRows || finalRows.length === 0) return [];

    const schemaToUse = typeof DUTY_COL !== 'undefined' ? DUTY_COL : {};
    return Utils_DataMapper.mapSheetRowsToObjects(finalRows, schemaToUse);
  } catch (err) {
    if (typeof _writeLogEntry === 'function') {
      _writeLogEntry("ERROR", `[API_Read_Lab.coreGetLabAssignmentContext] Failure: ${err.message}`);
    }
    throw err;
  }
}

/**
 * Extracts comprehensive history matrices for all processed allocations.
 * @return {Array<Object>} Compiled list of transactions histories.
 */
function coreGetBookingHistory() {
  try {
    const config = typeof getConfig === 'function' ? getConfig() : null;
    if (!config) throw new Error("Configuration context is missing.");

    const rawRows = typeof getCachedSheetValues === 'function' 
      ? getCachedSheetValues(config.SPREADSHEET_CONFIG.SHEETS.TRANSACTIONS) 
      : typeof getSheetData === 'function' ? getSheetData(config.SPREADSHEET_CONFIG.SHEETS.TRANSACTIONS) : null;
      
    const finalRows = rawRows || (typeof getSheetData === 'function' ? getSheetData(config.SPREADSHEET_CONFIG.SHEETS.TRANSACTIONS) : null);
    if (!finalRows || finalRows.length === 0) return [];

    return Utils_DataMapper.mapSheetRowsToObjects(finalRows, TX_COL);
  } catch (err) {
    if (typeof _writeLogEntry === 'function') {
      _writeLogEntry("ERROR", `[API_Read_Lab.coreGetBookingHistory] History extraction exception: ${err.message}`);
    }
    throw err;
  }
}

/**
 * Filters and isolates pending request chains specific to the caller session context.
 * @return {Array<Object>} Mapped array of pending transaction line items.
 */
function coreGetMyPendingBookings() {
  try {
    const sessionEmail = typeof getSecureAuthenticatedUserEmail === 'function'
      ? getSecureAuthenticatedUserEmail()
      : Session.getActiveUser().getEmail().toLowerCase().trim();

    const history = coreGetBookingHistory();
    return history.filter(tx => 
      String(tx.SUBMITTED_BY_USER_ID || tx.USER || "").toLowerCase().trim() === sessionEmail &&
      String(tx.STATUS || "").toUpperCase().trim() === "PENDING"
    );
  } catch (err) {
    if (typeof _writeLogEntry === 'function') {
      _writeLogEntry("ERROR", `[API_Read_Lab.coreGetMyPendingBookings] Failure: ${err.message}`);
    }
    throw err;
  }
}

/**
 * Compiles a localized, date-bounded operational calendar mapping matrix.
 * 🛡️ HARMONIZED PROPERTY NAMESPACE: Resolved uppercase-vs-lowercase split-brain structure drift bugs.
 * @param {string} startDateStr - Upper operational timeline date limit boundary.
 * @param {string} endDateStr - Lower operational timeline date limit boundary.
 * @return {Object} Mapped calendar structures index-keyed by standardized date strings.
 */
function coreGetCalendarData(startDateStr, endDateStr) {
  try {
    const config = typeof getConfig === 'function' ? getConfig() : null;
    if (!config) throw new Error("Configuration context is missing.");

    const rawRows = typeof getCachedSheetValues === 'function' 
      ? getCachedSheetValues(config.SPREADSHEET_CONFIG.SHEETS.CALENDAR) 
      : typeof getSheetData === 'function' ? getSheetData(config.SPREADSHEET_CONFIG.SHEETS.CALENDAR) : null;
      
    const finalRows = rawRows || (typeof getSheetData === 'function' ? getSheetData(config.SPREADSHEET_CONFIG.SHEETS.CALENDAR) : null);
    if (!finalRows || finalRows.length === 0) return {};

    const mappedCal = Utils_DataMapper.mapSheetRowsToObjects(finalRows, CAL_COL);
    const calMap = {};
    
    mappedCal.forEach(row => {
      // 🛡️ DRY FIXED & NAMESPACE COMPLIANCE: Use uniform global parseDateString and uppercase object keys
      const dStr = typeof parseDateString === 'function' ? parseDateString(row.DATE) : "";
      if (dStr) {
        if (startDateStr && dStr < startDateStr) return;
        if (endDateStr && dStr > endDateStr) return;

        // 🛡️ HARMONIZED PROPERTY NAMESPACE COMPLIANCE: Uniform Uppercase Fields
        calMap[dStr] = {
           dayType: row.DAY_TYPE || "A",
           bellType: row.BELL_TYPE || "Normal"
        };
      }
    });
    return calMap;
  } catch (err) {
    if (typeof _writeLogEntry === 'function') {
      _writeLogEntry("ERROR", `[API_Read_Lab.coreGetCalendarData] Exception mapped: ${err.message}`);
    }
    throw err;
  }
}

/**
 * Evaluates if a target date parameters configuration is inside active academic bounds.
 * @param {string|Date} dateStr - The target evaluation date token.
 * @return {boolean} True if operational day type matches open academic parameters.
 */
function coreIsOperationalDay(dateStr) {
  if (!dateStr) return false;
  try {
    // 🛡️ DRY FIXED: Standardize temporal mapping format across scripts via centralized engine
    const normalizedDateStr = typeof parseDateString === 'function' ? parseDateString(dateStr) : String(dateStr);
    
    const calBoundsMap = coreGetCalendarData(normalizedDateStr, normalizedDateStr);
    const dayContext = calBoundsMap[normalizedDateStr];
    
    if (!dayContext) {
      const dayOfWeek = new Date(normalizedDateStr).getDay();
      return (dayOfWeek !== 0 && dayOfWeek !== 6); 
    }
    
    const cleanDayType = String(dayContext.dayType || "").toUpperCase().trim();
    return (cleanDayType !== "HOLIDAY" && cleanDayType !== "CLOSED" && cleanDayType !== "OFF");
  } catch (err) {
    if (typeof _writeLogEntry === 'function') {
      _writeLogEntry("ERROR", `[API_Read_Lab.coreIsOperationalDay] Evaluation failed for [${dateStr}]: ${err.message}`);
    }
    return false;
  }
}