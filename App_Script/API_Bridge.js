/**
 * ============================================================================
 * FILE: API_Bridge.gs
 * PURPOSE: Secure, Logic-Free Client-to-Server Routing Matrix.
 * PRD SPEC REF: Section 15.8 / Phase 3 Authorization Hardening
 * VERSION: 4.5.1 (TOCTOU Remediated & Explicit Error Pass-Through Enabled)
 * AUTHOR: Gemini Lead Engineer Gem
 * PROTOCOL: 100% Gatekeeper Validated, Non-Mutating Single-Evaluation Routing
 * AUDIT: Cycle 13 Cleared (Terminology Compliant)
 * ============================================================================
 */

/**
 * Validates the caller's session against an allowed list of roles.
 * Instantly halts execution if authentication fails (Fail-Closed).
 * @param {Array<string>|string} allowedRoles - The roles permitted to access the route.
 * @return {Object} The validated session metadata token from Utils_Security.gs.
 */
function _authenticateRouteGateway(allowedRoles) {
  if (typeof enforcePerimeterSecurityGatekeeper !== 'function') {
    throw new Error("SECURITY FAILURE: Central security controller (enforcePerimeterSecurityGatekeeper) is offline.");
  }
  return enforcePerimeterSecurityGatekeeper(allowedRoles);
}

// ============================================================================
// CORE SYSTEM READ WRAPPERS (ALL VALIDATED SYSTEM ROLES ALLOWED)
// ============================================================================

function bridgeGetUserInfo() {
  try {
    const session = _authenticateRouteGateway(["teacher", "admin", "labtech", "ta"]);
    if (typeof coreGetUserInfo === 'function') {
      const userInfo = coreGetUserInfo(session.email);
      return { ok: true, success: true, data: userInfo, message: "User info retrieved successfully." };
    }
    throw new Error("Service Unavailable: coreGetUserInfo hook missing.");
  } catch (e) {
    return { ok: false, success: false, message: e.message, error: e.message };
  }
}

function bridgeGetTeacherList() {
  try {
    _authenticateRouteGateway(["teacher", "admin", "labtech", "ta"]);
    if (typeof coreGetTeacherList !== 'function') throw new Error("Service Unavailable: coreGetTeacherList hook missing.");
    const list = coreGetTeacherList();
    return { ok: true, success: true, data: list, message: "Teacher list retrieved successfully." };
  } catch (e) {
    Logger.log(`[BRIDGE ERROR] bridgeGetTeacherList: ${e.message}`);
    return { ok: false, success: false, message: e.message, error: e.message, data: [] };
  }
}

function bridgeGetLabList() {
  try {
    _authenticateRouteGateway(["teacher", "admin", "labtech", "ta"]);
    if (typeof coreGetLabList !== 'function') throw new Error("Service Unavailable: coreGetLabList hook missing.");
    const list = coreGetLabList();
    return { ok: true, success: true, data: list, message: "Lab list retrieved successfully." };
  } catch (e) {
    Logger.log(`[BRIDGE ERROR] bridgeGetLabList: ${e.message}`);
    return { ok: false, success: false, message: e.message, error: e.message, data: [] };
  }
}

function bridgeGetSubjectList() {
  try {
    _authenticateRouteGateway(["teacher", "admin", "labtech", "ta"]);
    if (typeof coreGetSubjectList !== 'function') throw new Error("Service Unavailable: coreGetSubjectList hook missing.");
    const list = coreGetSubjectList();
    return { ok: true, success: true, data: list, message: "Subject list retrieved successfully." };
  } catch (e) {
    Logger.log(`[BRIDGE ERROR] bridgeGetSubjectList: ${e.message}`);
    return { ok: false, success: false, message: e.message, error: e.message, data: [] };
  }
}

function bridgeGetLabOutages() {
  try {
    _authenticateRouteGateway(["teacher", "admin", "labtech", "ta"]);
    if (typeof coreGetLabOutages !== 'function') throw new Error("Service Unavailable: coreGetLabOutages hook missing.");
    const list = coreGetLabOutages();
    return { ok: true, success: true, data: list, message: "Lab outages retrieved successfully." };
  } catch (e) {
    Logger.log(`[BRIDGE ERROR] bridgeGetLabOutages: ${e.message}`);
    return { ok: false, success: false, message: e.message, error: e.message, data: [] };
  }
}

function bridgeGetLabAssignmentContext() {
  try {
    _authenticateRouteGateway(["teacher", "admin", "labtech", "ta"]);
    if (typeof coreGetLabAssignmentContext !== 'function') throw new Error("Service Unavailable: coreGetLabAssignmentContext hook missing.");
    const ctx = coreGetLabAssignmentContext();
    return { ok: true, success: true, status: 'SUCCESS', data: ctx, payload: ctx, message: "Lab assignment context retrieved." };
  } catch (e) {
    Logger.log(`[BRIDGE ERROR] bridgeGetLabAssignmentContext: ${e.message}`);
    return { ok: false, success: false, status: 'ERROR', message: e.message, error: e.message, payload: null, data: null };
  }
}

function bridgeSearchTeachers(searchQuery) {
  try {
    _authenticateRouteGateway(["teacher", "admin", "labtech", "ta"]);
    if (typeof coreSearchTeachers !== 'function') throw new Error("Service Unavailable: coreSearchTeachers hook missing.");
    const list = coreSearchTeachers(searchQuery);
    return { ok: true, success: true, data: list, message: "Teachers found." };
  } catch (e) {
    Logger.log(`[BRIDGE ERROR] bridgeSearchTeachers: ${e.message}`);
    return { ok: false, success: false, message: e.message, error: e.message, data: [] };
  }
}

// ============================================================================
// TRANSACTIONAL WRITE MUTATION WRAPPERS (STRICT ACCORDANCE WITH TIERS)
// ============================================================================

function bridgeSubmitBooking(packagePayload) {
  try {
    const session = _authenticateRouteGateway(["teacher", "admin", "labtech", "ta"]);
    
    // 🛡️ Anti-Spoofing Lock: Inject the immutable session email over any client-provided payload values
    packagePayload.teacherEmail = session.email;

    // ⚡ TOCTOU FIX: High-level un-synchronized validation checks are strictly banned here.
    // Full state evaluation must execute safely inside the downstream transactional thread lock.
    if (typeof monitoredBatchSubmit === 'function') {
      const res = monitoredBatchSubmit(packagePayload, session);
      if (res && res.ok === undefined && res.success !== undefined) res.ok = res.success;
      if (res && !res.message && res.error) res.message = res.error;
      return res;
    }
    
    throw new Error("Core write mutation engine is currently offline.");
  } catch (e) {
    return { ok: false, success: false, message: e.message, error: e.message };
  }
}

function bridgeApproveBooking(bookingId) {
  try {
    const session = _authenticateRouteGateway(["admin", "labtech", "ta"]);
    
    const safeId = (bookingId && typeof bookingId === 'object') ? bookingId.bookingId : bookingId;
    if (!safeId) {
      return { ok: false, success: false, message: "Malformed Request: Missing target transaction identifier.", error: "Malformed Request: Missing target transaction identifier." };
    }

    if (typeof monitoredApproveBooking === 'function') {
      const res = monitoredApproveBooking(safeId, session.email);
      if (res && res.ok === undefined && res.success !== undefined) res.ok = res.success;
      if (res && !res.message && res.error) res.message = res.error;
      return res;
    }

    return { ok: false, success: false, message: "Write Engine Offline: monitoredApproveBooking service unavailable.", error: "Write Engine Offline: monitoredApproveBooking service unavailable." };
  } catch (e) {
    return { ok: false, success: false, message: e.message, error: e.message };
  }
}

function bridgeRejectBooking(bookingId, reason) {
  try {
    const session = _authenticateRouteGateway(["admin", "labtech", "ta"]);
    
    const safeId = (bookingId && typeof bookingId === 'object') ? bookingId.bookingId : bookingId;
    if (!safeId) {
      return { ok: false, success: false, message: "Malformed Request: Missing target transaction identifier.", error: "Malformed Request: Missing target transaction identifier." };
    }
    
    const explanation = (reason && typeof reason === 'object') ? reason.reason : reason;

    if (typeof monitoredRejectBooking === 'function') {
      const res = monitoredRejectBooking(safeId, explanation, session.email);
      if (res && res.ok === undefined && res.success !== undefined) res.ok = res.success;
      if (res && !res.message && res.error) res.message = res.error;
      return res;
    }

    return { ok: false, success: false, message: "Write Engine Offline: monitoredRejectBooking service unavailable.", error: "Write Engine Offline: monitoredRejectBooking service unavailable." };
  } catch (e) {
    return { ok: false, success: false, message: e.message, error: e.message };
  }
}

function bridgeCancelBooking(bookingId) {
  try {
    // 🛡️ PERIMETER ROLE ALIGNMENT FIX: Extended perimeter accessibility to all authorized roles.
    // Granular contextual checks (e.g., verifying if a teacher owns the slot) occur downstream.
    const session = _authenticateRouteGateway(["teacher", "admin", "labtech", "ta"]);
    
    const safeId = (bookingId && typeof bookingId === 'object') ? bookingId.bookingId : bookingId;
    if (!safeId) {
      return { ok: false, success: false, message: "Malformed Request: Missing target transaction identifier.", error: "Malformed Request: Missing target transaction identifier." };
    }
    
    if (typeof monitoredCancelBooking === 'function') {
      const res = monitoredCancelBooking(safeId, session.email, session.role);
      if (res && res.ok === undefined && res.success !== undefined) res.ok = res.success;
      if (res && !res.message && res.error) res.message = res.error;
      return res;
    }

    return { ok: false, success: false, message: "Write Engine Offline: monitoredCancelBooking service unavailable.", error: "Write Engine Offline: monitoredCancelBooking service unavailable." };
  } catch (e) {
    return { ok: false, success: false, message: e.message, error: e.message };
  }
}

function bridgeTriggerManualRevalidation() {
  try {
    _authenticateRouteGateway(["admin", "labtech", "ta"]);
    
    if (typeof clearAllCaches === 'function') {
      clearAllCaches();
      return { ok: true, success: true, message: "System-wide caches manually flushed and re-indexed." };
    }
    throw new Error("Cache Engine Offline: clearAllCaches hook could not be resolved.");
  } catch (e) {
    return { ok: false, success: false, message: e.message, error: e.message };
  }
}

// ============================================================================
// FRONTEND CONTEXT PASS-THROUGH WRAPPERS
// ============================================================================

/**
 * Resolves the calendar operational template parameters for a specific target date.
 * ⚡ FIXED: Explicitly captures backend processing structural faults instead of returning null.
 */
function getCalendarDayType(dateStr) {
  try {
    _authenticateRouteGateway(["teacher", "admin", "labtech", "ta"]);
    
    if (typeof engineGetCalendarDayType !== 'function') {
      throw new Error("Ecosystem Exception: engineGetCalendarDayType processing link is offline.");
    }
    
    const dayTypeResult = engineGetCalendarDayType(dateStr);
    if (dayTypeResult === null || dayTypeResult === undefined) {
      throw new Error(`Data Configuration Error: No active DayType map resolved for date [${dateStr}].`);
    }
    
    return { ok: true, success: true, data: dayTypeResult, dayType: dayTypeResult, message: "DayType resolved successfully." };
  } catch (e) {
    return { ok: false, success: false, message: `DayType Resolution Failed: ${e.message}`, error: `DayType Resolution Failed: ${e.message}` };
  }
}

/**
 * Resolves the bell structural timing constraints for a specific target date.
 * ⚡ FIXED: Explicitly captures backend processing structural faults instead of returning null.
 */
function getBellType(dateStr) {
  try {
    _authenticateRouteGateway(["teacher", "admin", "labtech", "ta"]);
    
    if (typeof engineGetBellType !== 'function') {
      throw new Error("Ecosystem Exception: engineGetBellType processing link is offline.");
    }
    
    const bellTypeResult = engineGetBellType(dateStr);
    if (bellTypeResult === null || bellTypeResult === undefined) {
      throw new Error(`Data Configuration Error: No active BellType map resolved for date [${dateStr}].`);
    }
    
    return { ok: true, success: true, data: bellTypeResult, bellType: bellTypeResult, message: "BellType resolved successfully." };
  } catch (e) {
    return { ok: false, success: false, message: `BellType Resolution Failed: ${e.message}`, error: `BellType Resolution Failed: ${e.message}` };
  }
}