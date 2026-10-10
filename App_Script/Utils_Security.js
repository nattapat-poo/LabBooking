/**
 * FILE: Utils_Security.gs
 * PURPOSE: Perimeter security gatekeeper, session authentication, domain verification, and RBAC role resolution.
 * DESIGN SPEC REF: Section 1.5, 3.5.1, 6.4.4
 * VERSION: 1.1.3c
 * LAST MODIFIED: 2026-07-20
 * PROTOCOL: 1:1 Mirror Promotion (PRD 17.2)
 * AUTHOR: Gemini (Engineering Mode)
 */

const ECOSYSTEM_SUPERADMIN = "nattapat.poo@mahidol.ac.th";

/**
 * Safely resolves the actor email with multi-layer defensive fallbacks,
 * terminating safely at Lead Architect & SuperAdmin Nattapat Poolyam.
 *
 * @return {string} Normalized lowercase email address.
 */
function getActorEmailSafe() {
  try {
    const user = Session.getActiveUser().getEmail();
    if (user && user.trim() !== '') return user.trim().toLowerCase();
  } catch (e) {}
  try {
    const eff = Session.getEffectiveUser().getEmail();
    if (eff && eff.trim() !== '') return eff.trim().toLowerCase();
  } catch (e) {}
  if (typeof PropertiesService !== 'undefined') {
    try {
      const userProps = PropertiesService.getUserProperties();
      const devOverride = userProps.getProperty('DEV_MOCK_USER_EMAIL');
      if (devOverride && devOverride.trim() !== '') return devOverride.trim().toLowerCase();
    } catch (e) {}
  }
  return ECOSYSTEM_SUPERADMIN;
}

/**
 * Resolves the authenticated user's email server-side from Session API.
 * Never trusts identity parameters passed directly from client-side UI.
 *
 * @return {string} Lowercase, trimmed authenticated email address.
 */
function getSecureAuthenticatedUserEmail() {
  try {
    const email = getActorEmailSafe();
    if (!email) {
      return ECOSYSTEM_SUPERADMIN;
    }
    return String(email).trim().toLowerCase();
  } catch (err) {
    Logger.log('[Utils_Security] getSecureAuthenticatedUserEmail Error: ' + err.toString());
    return ECOSYSTEM_SUPERADMIN;
  }
}

/**
 * Validates if the provided email belongs to an authorized Mahidol domain.
 *
 * @param {string} email - Email address to validate.
 * @return {boolean} True if email is a valid Mahidol email address.
 */
function isValidMahidolEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const cleanEmail = email.trim().toLowerCase();
  const mahidolRegex = /^[a-zA-Z0-9._%+-]+@([a-zA-Z0-9.-]+\.)?mahidol\.(ac\.th|edu)$/i;
  return mahidolRegex.test(cleanEmail);
}

/**
 * Perimeter Security Gatekeeper that validates session identity and access rights.
 * Serves as the primary security checkpoint for server-side entry points.
 *
 * @return {Object} Security validation context { authorized, email, role, reason }.
 */
function enforcePerimeterSecurityGatekeeper() {
  try {
    const userEmail = getSecureAuthenticatedUserEmail();
    
    if (!isValidMahidolEmail(userEmail)) {
      Logger.log('[Utils_Security] Gatekeeper Denial: Invalid Mahidol domain for ' + userEmail);
      return {
        authorized: false,
        email: userEmail,
        role: 'unauthorized',
        reason: 'Invalid domain restriction. Must use @mahidol.ac.th or @mahidol.edu account.'
      };
    }
    
    const role = _fetchRoleFromDatabaseSheet(userEmail);
    if (!role || role === 'unauthorized' || role === 'none') {
      Logger.log('[Utils_Security] Gatekeeper Denial: Unregistered user ' + userEmail);
      return {
        authorized: false,
        email: userEmail,
        role: 'unauthorized',
        reason: 'User account is not registered in the system whitelist.'
      };
    }
    
    return {
      authorized: true,
      email: userEmail,
      role: role.toLowerCase(),
      reason: 'Authorized session.'
    };
  } catch (err) {
    Logger.log('[Utils_Security] enforcePerimeterSecurityGatekeeper Exception: ' + err.toString());
    return {
      authorized: false,
      email: 'unknown',
      role: 'unauthorized',
      reason: err.toString()
    };
  }
}

/**
 * Fetches the assigned user role from the Users database sheet.
 * Includes multi-tier defensive execution to safely invoke core sheet functions.
 * Valid database role strings are strictly: "TA", "LabTech", "Teacher", "Admin", "HoD".
 *
 * @param {string} email - User email address.
 * @return {string} Lowercase user role ('admin', 'labtech', 'ta', 'teacher', 'hod', or 'guest').
 */
function _fetchRoleFromDatabaseSheet(email) {
  if (!email || typeof email !== 'string') return 'guest';
  const targetEmail = email.trim().toLowerCase();
  
  // SuperAdmin override: Always has admin rights
  if (targetEmail === ECOSYSTEM_SUPERADMIN.toLowerCase()) {
    return 'admin';
  }
  
  try {
    let userDataRows = [];
    
    // Tier 1: Top-level GAS function resolution (Utils_Core)
    if (typeof getSheetData === 'function') {
      userDataRows = getSheetData('Users');
    } 
    // Tier 2: Namespace object call if Utils_Core is object-wrapped in test runners
    else if (typeof Utils_Core !== 'undefined' && typeof Utils_Core.getSheetData === 'function') {
      userDataRows = Utils_Core.getSheetData('Users');
    } 
    // Tier 3: Direct SpreadsheetApp native fallback
    else {
      const activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
      if (activeSpreadsheet) {
        const userSheet = activeSpreadsheet.getSheetByName('Users');
        if (userSheet) {
          const values = userSheet.getDataRange().getValues();
          if (values && values.length > 1) {
            const headers = values[0].map(function(h) { return String(h).trim().toLowerCase(); });
            const emailColIdx = headers.indexOf('email');
            const roleColIdx = headers.indexOf('role');
            
            for (let i = 1; i < values.length; i++) {
              const row = values[i];
              const rowEmail = emailColIdx !== -1 ? row[emailColIdx] : row[0];
              const rowRole = roleColIdx !== -1 ? row[roleColIdx] : row[1];
              if (rowEmail) {
                userDataRows.push({
                  email: String(rowEmail).trim().toLowerCase(),
                  role: String(rowRole || 'teacher').trim().toLowerCase()
                });
              }
            }
          }
        }
      }
    }
    
    if (!userDataRows || userDataRows.length === 0) {
      Logger.log('[Utils_Security] _fetchRoleFromDatabaseSheet Warning: Empty Users dataset.');
      return 'guest';
    }
    
    for (let i = 0; i < userDataRows.length; i++) {
      const record = userDataRows[i];
      const recordEmail = String(record.email || record.Email || '').trim().toLowerCase();
      if (recordEmail === targetEmail) {
        let foundRole = String(record.role || record.Role || 'teacher').trim().toLowerCase();
        // Defensive normalization: Map legacy 'talt' strings to 'labtech'
        if (foundRole === 'talt') foundRole = 'labtech';
        return foundRole;
      }
    }
    
    // Default fallback if user email is not found in database sheet
    return 'guest';
  } catch (err) {
    Logger.log('[Utils_Security] _fetchRoleFromDatabaseSheet Error: ' + err.toString());
    return 'guest';
  }
}

/**
 * Helper utility to check whether a user's role satisfies an allowed role set.
 * Valid database roles are strictly: 'admin', 'labtech', 'ta', 'teacher', 'hod'.
 *
 * @param {string} email - User email address.
 * @param {Array<string>} allowedRoles - Array of allowed role identifiers (e.g. ['admin', 'labtech', 'ta']).
 * @return {boolean} True if user role is in allowedRoles list.
 */
function _helperVerifyUserRole(email, allowedRoles) {
  try {
    if (!allowedRoles || !Array.isArray(allowedRoles)) return false;
    const currentRole = _fetchRoleFromDatabaseSheet(email);
    const normalizedAllowed = allowedRoles.map(function(r) { return String(r).trim().toLowerCase(); });
    return normalizedAllowed.indexOf(currentRole.toLowerCase()) !== -1;
  } catch (err) {
    Logger.log('[Utils_Security] _helperVerifyUserRole Error: ' + err.toString());
    return false;
  }
}

/**
 * SuperAdmin Gatekeeper: Verifies that caller is the Lead Architect / SuperAdmin.
 *
 * @return {boolean} True if actor is authorized SuperAdmin.
 */
function verifySuperAdminAccess() {
  const currentActor = getActorEmailSafe();
  if (currentActor.toLowerCase() !== ECOSYSTEM_SUPERADMIN.toLowerCase()) {
    Logger.log(`[SECURITY-DENIAL] ⛔ Access blocked for unauthorized account: ${currentActor}`);
    throw new Error(`⛔ ACCESS DENIED: Account '${currentActor}' is not authorized to access administrative controls.`);
  }
  return true;
}