/**
 * ============================================================================
 * MODULE: API_Read_User.gs
 * PURPOSE: Secure identity, user profile, and subject context fetching engine.
 * PRD/DESIGN REF: Section 7 (Read Functions) / Phase 1.2 Forensic Patching
 * AUTHOR: Gemini Lead Engineer Gem
 * PROTOCOL: 100% Defensive Architecture, Schema-Bound Fail-Closed Operations
 * AUDIT: Cycle 13 Cleared (Terminology Compliant)
 * ============================================================================
 */

/**
 * Retrieves and maps a user record matching the active session email.
 * Enforces strict whitelisting and privilege-checked proxy access control.
 * @param {string} [explicitEmail] - Optional email override for privileged proxy lookups.
 * @return {Object|null} Mapped user information or null if not found.
 * @throws {Error} If security boundaries are violated or domain validation fails.
 */
function coreGetUserInfo(explicitEmail) {
  try {
    // 🛡️ SECURITY FIX: Always resolve the un-spoofable active session email as the primary anchor
    const sessionEmail = typeof getSecureAuthenticatedUserEmail === 'function'
      ? getSecureAuthenticatedUserEmail()
      : Session.getActiveUser().getEmail().toLowerCase().trim();

    if (!sessionEmail) {
      throw new Error("SECURITY_BLOCK: Active session user email could not be determined securely.");
    }

    let targetEmail = sessionEmail;

    // 🛡️ SECURITY FIX: Evaluate proxy access restrictions to eliminate Administrative Impersonation Bypass
    if (explicitEmail && explicitEmail.toLowerCase().trim() !== sessionEmail) {
      const cleanExplicit = explicitEmail.toLowerCase().trim();
      
      // Determine the true active user's role directly from the database sheet
      let sessionRole = "teacher";
      if (typeof _fetchRoleFromDatabaseSheet === 'function') {
        sessionRole = _fetchRoleFromDatabaseSheet(sessionEmail);
      }
      
      const isAuthorizedProxy = (sessionRole === "admin" || sessionRole === "labtech" || sessionRole === "ta");

      if (!isAuthorizedProxy) {
        if (typeof _writeLogEntry === 'function') {
          _writeLogEntry("SECURITY_ALERT", `Unauthorized proxy attempt by [${sessionEmail}] targeting [${cleanExplicit}].`);
        }
        throw new Error("Security Exception: Access denied. Impersonation parameter rejected due to insufficient privileges.");
      }

      // Enforce organizational domain policy on the proxy parameter string
      if (typeof isValidMahidolEmail === 'function' && !isValidMahidolEmail(cleanExplicit)) {
        throw new Error("Security Exception: Proxy target email violates organizational domain boundaries.");
      }

      targetEmail = cleanExplicit;
    }

    const config = typeof getConfig === 'function' ? getConfig() : null;
    if (!config) throw new Error("Configuration context missing.");

    // Attempt cache fetch with standard live data fallback
    const rawRows = typeof getCachedSheetValues === 'function'
      ? getCachedSheetValues(config.SPREADSHEET_CONFIG.SHEETS.USERS)
      : typeof getSheetData === 'function' ? getSheetData(config.SPREADSHEET_CONFIG.SHEETS.USERS) : null;

    const finalRows = rawRows || (typeof getSheetData === 'function' ? getSheetData(config.SPREADSHEET_CONFIG.SHEETS.USERS) : null);
    if (!finalRows || finalRows.length === 0) {
      throw new Error("Database Error: Master Users dataset is blank or inaccessible.");
    }

    const mappedUsers = Utils_DataMapper.mapSheetRowsToObjects(finalRows, USR_COL);
    const userMatch = mappedUsers.find(u => String(u.EMAIL || '').toLowerCase().trim() === targetEmail);

    if (!userMatch) {
      if (typeof _writeLogEntry === 'function') {
        _writeLogEntry("WARNING", `Requested profile email [${targetEmail}] not found in Master Users register.`);
      }
      return null;
    }

    return {
      userId: userMatch.USER_ID || "",
      email: targetEmail,
      fullName: userMatch.FULL_NAME || (userMatch.FIRST_NAME && userMatch.LAST_NAME ? `${userMatch.FIRST_NAME} ${userMatch.LAST_NAME}` : ""),
      nickname: userMatch.NICKNAME || "",
      role: String(userMatch.ROLE || "teacher").toLowerCase().trim(),
      canEditConfig: String(userMatch.CAN_EDIT_CONFIG || "FALSE").toUpperCase() === "TRUE"
    };
  } catch (err) {
    if (typeof _writeLogEntry === 'function') {
      _writeLogEntry("ERROR", `[API_Read_User.coreGetUserInfo] Failure: ${err.message}`);
    }
    throw err;
  }
}

/**
 * Retrieves a sanitized list of all registered teachers for dropdown menus.
 * @return {Array<Object>} Mapped teacher list.
 */
function coreGetTeacherList() {
  try {
    const config = typeof getConfig === 'function' ? getConfig() : null;
    if (!config) throw new Error("Configuration context missing.");

    const rawRows = typeof getCachedSheetValues === 'function'
      ? getCachedSheetValues(config.SPREADSHEET_CONFIG.SHEETS.USERS)
      : typeof getSheetData === 'function' ? getSheetData(config.SPREADSHEET_CONFIG.SHEETS.USERS) : null;

    const finalRows = rawRows || (typeof getSheetData === 'function' ? getSheetData(config.SPREADSHEET_CONFIG.SHEETS.USERS) : null);
    if (!finalRows || finalRows.length === 0) {
      throw new Error("Database Error: Master Users dataset could not be compiled for teacher inventory.");
    }

    const mappedUsers = Utils_DataMapper.mapSheetRowsToObjects(finalRows, USR_COL);
    
    return mappedUsers
      .filter(u => String(u.ROLE || "").toLowerCase().trim() === "teacher")
      .map(u => ({
        fullName: u.FULL_NAME || (u.FIRST_NAME && u.LAST_NAME ? `${u.FIRST_NAME} ${u.LAST_NAME}` : ""),
        nickname: u.NICKNAME || "",
        email: String(u.EMAIL || "").toLowerCase().trim(),
        role: "teacher"
      }));
  } catch (err) {
    if (typeof _writeLogEntry === 'function') {
      _writeLogEntry("ERROR", `[API_Read_User.coreGetTeacherList] Failure: ${err.message}`);
    }
    throw err;
  }
}

/**
 * Searches and filters registered instructors based on a character query.
 * @param {string} query - Search keyword.
 * @return {Array<Object>} Filtered teacher profiles.
 */
function coreSearchTeachers(query) {
  if (!query) return [];
  try {
    const list = coreGetTeacherList();
    const q = String(query).toLowerCase().trim();
    return list.filter(t => 
      (t.fullName && t.fullName.toLowerCase().includes(q)) || 
      (t.nickname && t.nickname.toLowerCase().includes(q)) || 
      (t.email && t.email.toLowerCase().includes(q))
    );
  } catch (err) {
    if (typeof _writeLogEntry === 'function') {
      _writeLogEntry("ERROR", `[API_Read_User.coreSearchTeachers] Search query [${query}] faulted: ${err.message}`);
    }
    throw err;
  }
}

/**
 * Retrieves the list of operational course subjects.
 * 🛡️ SCHEMA ENFORCEMENT: Stripped legacy fallbacks. strictly binds to the master SUB_COL token.
 * @return {Array<Object>} Structured array of subject configurations.
 */
function coreGetSubjectList() {
  try {
    const config = typeof getConfig === 'function' ? getConfig() : null;
    if (!config) throw new Error("Configuration context missing.");

    // ⚡ OPTIMIZED FALLBACK: Clean cascade logic
    let finalRows = typeof getCachedSheetValues === 'function'
      ? getCachedSheetValues(config.SPREADSHEET_CONFIG.SHEETS.SUBJECTS)
      : null;

    if (!finalRows && typeof getSheetData === 'function') {
      finalRows = getSheetData(config.SPREADSHEET_CONFIG.SHEETS.SUBJECTS);
    }

    if (!finalRows || finalRows.length === 0) {
      throw new Error("Database Error: Subjects master table is empty or missing.");
    }

    // 🛡️ STRICT BINDING: Force dependency on the deep-frozen SUB_COL from Utils_Schema.gs
    if (typeof SUB_COL === 'undefined') {
      throw new Error("Architectural Error: Master SUB_COL schema layout is missing from scope.");
    }

    return Utils_DataMapper.mapSheetRowsToObjects(finalRows, SUB_COL);
  } catch (err) {
    if (typeof _writeLogEntry === 'function') {
      _writeLogEntry("ERROR", `[API_Read_User.coreGetSubjectList] Critical failure: ${err.message}`);
    }
    throw err;
  }
}