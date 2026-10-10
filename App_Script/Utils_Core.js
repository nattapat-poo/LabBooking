/**
 * ============================================================================
 * MODULE: Utils_Core.gs
 * PURPOSE: High-integrity transaction managers, mutex locks, unique ID generators,
 * and timezone-independent date string normalizers.
 * PRD/DESIGN REF: PRD Section 6.11 / Section 15.8.1 (File Header Protocol)
 * AUTHOR: Gemini Lead Engineer Gem
 * PROTOCOL: 100% Mirror Promotion Compliant, Dynamic Resolution
 * ============================================================================
 */

/**
 * ⚠️ ARCHITECTURAL DIRECTIVE: SINGLE-THREAD MEMOIZATION ONLY ⚠️
 * Prevents redundant Google Drive API calls within a SINGLE execution thread.
 */
var __memoizedActiveSpreadsheet = null;

/**
 * Returns the active or configured spreadsheet container dynamically.
 * 🛡️ AUDITOR PATCH: Hardened nested try-catch structures to guarantee fallback continuity.
 * @returns {SpreadsheetApp.Spreadsheet}
 */
function getMainSpreadsheet() {
  if (__memoizedActiveSpreadsheet !== null) return __memoizedActiveSpreadsheet;
  
  const config = typeof getConfig === 'function' ? getConfig() : null;
  
  // 1. Prioritize dynamic configuration parameter ID
  if (config && config.SPREADSHEET_CONFIG) {
    const targetId = config.SPREADSHEET_CONFIG.MAIN_SHEET_ID;
    if (targetId && typeof targetId === 'string' && targetId.trim() !== '' && targetId.length > 10) {
      try {
        __memoizedActiveSpreadsheet = SpreadsheetApp.openById(targetId);
        return __memoizedActiveSpreadsheet;
      } catch (err) {
        Logger.log(`⚠️ [Utils_Core.getMainSpreadsheet] Primary sheet connection failed [${targetId}]: ${err.message}. Trying next fallback...`);
      }
    }
  }
  
  // 2. Fall back safely to Active Spreadsheet under container-bound execution contexts
  try {
    const activeSS = SpreadsheetApp.getActiveSpreadsheet();
    if (activeSS) {
      __memoizedActiveSpreadsheet = activeSS;
      return __memoizedActiveSpreadsheet;
    }
  } catch (err) {
    Logger.log(`⚠️ [Utils_Core.getMainSpreadsheet] Active spreadsheet resolution bypassed: ${err.message}. Trying last-resort...`);
  }
  
  // 3. Absolute last-resort fallback
  if (config && config.SPREADSHEET_CONFIG && config.SPREADSHEET_CONFIG.FALLBACK_SHEET_ID) {
    const fallbackId = config.SPREADSHEET_CONFIG.FALLBACK_SHEET_ID;
    if (fallbackId && typeof fallbackId === 'string' && fallbackId.trim() !== '' && fallbackId.length > 10) {
      try {
        __memoizedActiveSpreadsheet = SpreadsheetApp.openById(fallbackId);
        return __memoizedActiveSpreadsheet;
      } catch (err) {
        Logger.log(`🚨 [Utils_Core.getMainSpreadsheet] Last-resort fallback initialization failed [${fallbackId}]: ${err.message}`);
      }
    }
  }
  
  throw new Error("Database Configuration Failure: Target Master Spreadsheet ID could not be resolved.");
}

/**
 * Resolves a specific spreadsheet tab object safely.
 * @param {string} sheetName - Target tab name.
 * @returns {SpreadsheetApp.Sheet}
 */
function getSheet(sheetName) {
  const ss = getMainSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) throw new Error(`Database Entity missing: Tab [${sheetName}] could not be resolved.`);
  return sheet;
}

/**
 * Extracts 2D array data values directly from the database sheet layer.
 * @param {string} sheetName - Target tab name.
 * @returns {Array<Array<*>>}
 */
function getSheetData(sheetName) {
  try {
    return getSheet(sheetName).getDataRange().getValues();
  } catch (e) {
    Logger.log(`🚨 Error reading sheet data for [${sheetName}]: ${e.message}`);
    return [];
  }
}

/**
 * Executes a callback within a safe, mutually exclusive transaction wrapper.
 * Blocks concurrent read-write overlaps using standard LockService queues (default 30 seconds).
 * @param {function} callback 
 * @param {number} [timeoutMs=30000] 
 * @returns {*} The return value of the callback
 */
function withLock(callback, timeoutMs = 30000) {
  const lock = LockService.getScriptLock();
  let hasLock = false;
  
  try {
    hasLock = lock.tryLock(timeoutMs);
    
    if (!hasLock) {
      Logger.log(`🚨 [Utils_Core.withLock] MUTEX LOCK TIMEOUT: Unable to acquire script database lock within ${timeoutMs}ms.`);
      throw new Error("System Busy: Another transaction is currently writing to the database. Please wait a moment and try again.");
    }
    
    const result = callback();
    
    // ⚡ CONCURRENCY FIX: Commit memory buffers directly to disk *inside* the lock
    SpreadsheetApp.flush();
    
    return result;
  } catch (error) {
    Logger.log(`🚨 [Utils_Core.withLock] EXCEPTION ENCOUNTERED: ${error.message}`);
    throw error;
  } finally {
    if (hasLock) {
      lock.releaseLock();
    }
  }
}

/**
 * Generates standardized unique identifiers.
 * @param {string} prefix 
 * @returns {string}
 */
function generateUniqueId(prefix = "ID-") {
  return prefix + Math.random().toString(36).substr(2, 9).toUpperCase() + "-" + Date.now().toString().slice(-4);
}

/**
 * Safely parses and normalizes string dates to bypass Google Sheets timezone warping.
 * @param {string} dateStr 
 * @returns {string} YYYY-MM-DD
 */
function parseDateString(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return String(dateStr);
  const scriptTimeZone = Session.getScriptTimeZone() || "Asia/Bangkok";
  return Utilities.formatDate(d, scriptTimeZone, "yyyy-MM-dd");
}

/**
 * Safely stringifies objects to prevent circular JSON reference crashes during logging.
 * @param {Object} obj 
 * @returns {string}
 */
function safeStringify(obj) {
  let cache = [];
  const retVal = JSON.stringify(obj, function(key, value) {
    if (typeof value === 'object' && value !== null) {
      if (cache.indexOf(value) !== -1) {
        return "[Circular]";
      }
      cache.push(value);
    }
    return value;
  });
  cache = null; 
  return retVal;
}