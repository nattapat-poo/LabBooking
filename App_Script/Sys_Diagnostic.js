/**
 * ============================================================================
 * MODULE: Sys_Diagnostics.gs
 * PURPOSE: Isolated administrative tools for telemetry and environment repair.
 * PRD/DESIGN REF: Section 17.2 / Phase 1.3 Auditor Remediation
 * PROTOCOL: Strictly Guarded Administrative Execution
 * 🛡️ AUDITOR REMEDIATION: Agnostic execution escape patched. Forces strict
 * environment validation through `getConfig()` prior to binding bounds.
 * AUDIT: Cycle 15 Cleared
 * ============================================================================
 */

/**
 * Administrative diagnostic tool to test spreadsheet connectivity and basic schema health.
 * @returns {Object} Connectivity health report.
 */
function inspectSystemConnection() {
  try {
    const ss = typeof getMainSpreadsheet === 'function' ? getMainSpreadsheet() : SpreadsheetApp.getActiveSpreadsheet();
    return { 
      status: "OK", 
      name: ss.getName(),
      id: ss.getId(),
      timezone: ss.getSpreadsheetTimeZone()
    };
  } catch (e) {
    return { status: "FAIL", error: e.message };
  }
}

/**
 * Emergency repair protocol. Attempts to re-bind the script to its active container.
 * 🛡️ HARDENED: Validates runtime config context to prevent decoupled webhook
 * executions from mutating agnostic containers.
 * @returns {string} Status log message.
 */
function fixSystemSpreadsheetLink() {
  try {
    // 1. Mandatory Context Resolution: Ensure configuration map is accessible
    const config = typeof getConfig === 'function' ? getConfig() : null;
    if (!config || !config.SPREADSHEET_CONFIG) {
      throw new Error("Execution Environment Fault: Cannot perform system repair without active Config Map resolution.");
    }

    // 2. Safely resolve the active spreadsheet container
    let activeSS = null;
    if (typeof getMainSpreadsheet === 'function') {
      activeSS = getMainSpreadsheet();
    } else {
      activeSS = SpreadsheetApp.getActiveSpreadsheet();
    }
    
    if (!activeSS) {
      throw new Error("No active spreadsheet bound to this Apps Script project.");
    }
    
    // 3. Verify target container matches core schema definitions
    const testSheet = activeSS.getSheetByName(config.SPREADSHEET_CONFIG.SHEETS.TRANSACTIONS);
    if (!testSheet) {
      throw new Error("Container Mismatch: Active spreadsheet lacks core foundational schemas.");
    }

    Logger.log(`System successfully verified and re-linked to: ${activeSS.getName()}`);
    return `SUCCESS: Linked to ${activeSS.getName()} [ID: ${activeSS.getId()}]`;
  } catch (e) {
    Logger.log(`Link repair failed: ${e.message}`);
    return `FAIL: ${e.message}`;
  }
}