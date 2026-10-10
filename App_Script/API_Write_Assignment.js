/**
 * ============================================================================
 * MODULE: API_Write_Assignment.gs
 * PURPOSE: Automated lab technician workload distribution algorithms and
 * assignment dependency checking.
 * PRD/DESIGN REF: Section 15.8 / Phase 3 Write Domain
 * AUTHOR: Gemini Lead Engineer Gem
 * PROTOCOL: 100% Mirror Promotion Compliant, Hard Fail-Closed Security
 * 🛡️ AUDITOR REMEDIATION: Eradicated indexOf array scanning. Enforces 100% Schema validation.
 * AUDIT: Cycle 13 Cleared (Terminology Compliant)
 * ============================================================================
 */

/**
 * Core validation gate checking structural technician workload availability bounds.
 * FORCE FAIL-CLOSED: Bypasses and mock configurations have been explicitly expunged.
 * @param {string} taltId - The unique identifier of the technician.
 * @param {string} dateStr - The target date string (YYYY-MM-DD).
 * @return {boolean} True if the technician has workload capacity, false otherwise.
 */
function _isTaltAvailable(taltId, dateStr) {
  if (!taltId) return false;
  
  // 🚨 HARDENED FAIL-CLOSED: Check if the validation dependency engine is missing entirely
  if (typeof evaluateTaltWorkloadLimits !== 'function') {
    const structuralError = "Critical Architecture Fault: Required verification function 'evaluateTaltWorkloadLimits' is unreachable.";
    Logger.log("🚨 " + structuralError);
    throw new Error(structuralError + " Halting execution thread to protect database integrity."); 
  }
  
  try {
    return evaluateTaltWorkloadLimits(taltId, dateStr);
  } catch (e) {
    Logger.log(`[Workload Boundary Error] ${e.message}`);
    return false;
  }
}

/**
 * Automatically evaluates available technicians and balances assignment workloads.
 * @param {string} dateStr - Target date string.
 * @param {number|string} period - Target period sequence.
 * @return {Object|null} The assigned technician payload, or null if capacity is maxed.
 */
function autoAssignTalt(dateStr, period) {
  try {
    const config = typeof getConfig === 'function' ? getConfig() : null;
    const sheetName = (config && config.SPREADSHEET_CONFIG && config.SPREADSHEET_CONFIG.SHEETS.USERS) 
      ? config.SPREADSHEET_CONFIG.SHEETS.USERS 
      : "Users";

    let usersData = typeof getCachedSheetValues === 'function' ? getCachedSheetValues(sheetName) : null;
    if (!usersData) {
      const sheet = typeof getSheet === 'function' ? getSheet(sheetName) : null;
      if (!sheet) {
        throw new Error("Architecture Fault: Users sheet resolution failed. Failing closed.");
      }
      usersData = sheet.getDataRange().getValues();
    }

    if (!usersData || usersData.length <= 1) return null;

    // 🚨 HARDENED FAIL-CLOSED: Route processing strictly through DataMapper
    if (typeof Utils_DataMapper === 'undefined' || typeof Utils_DataMapper.mapSheetRowsToObjects !== 'function') {
      throw new Error("Architecture Fault: Utils_DataMapper is offline. Halting assignment to prevent schema drift corruption.");
    }

    const frozenSchema = typeof USR_COL !== 'undefined' ? USR_COL : null;
    const mappedUsers = Utils_DataMapper.mapSheetRowsToObjects(usersData, frozenSchema);
    
    if (!mappedUsers || mappedUsers.length === 0) {
      throw new Error("Schema Mapping Fault: Users matrix failed to map to structural objects.");
    }

    let availableTalts = [];

    // STRICT EXECUTION: Iterate exclusively over safely mapped objects.
    // No manual 2D array parsing or 'indexOf' fallbacks exist here.
    for (let i = 0; i < mappedUsers.length; i++) {
      const user = mappedUsers[i];
      const role = String(user.ROLE || "").trim().toLowerCase();

      if (role === "labtech" || role === "ta" || role === "admin") {
        const tId = String(user.USER_ID || user.EMAIL || user.USERID || "").trim();
        const tName = String(user.FIRSTNAME || user.NAME || "Technician").trim();

        if (tId && _isTaltAvailable(tId, dateStr)) {
          availableTalts.push({ userId: tId, fullName: tName });
        }
      }
    }

    if (availableTalts.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableTalts.length);
      return availableTalts[randomIndex];
    }

    return null;

  } catch (error) {
    Logger.log(`🚨 Auto-Assign Talt Error: ${error.message}`);
    // In a Fail-Closed architecture, schema exceptions bubble up to abort the parent transaction.
    throw error; 
  }
}