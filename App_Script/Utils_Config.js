/**
 * ============================================================================
 * MODULE: Utils_Config.gs
 * PURPOSE: Centralized global constants and dynamic environment configurations.
 * PRD/DESIGN REF: PRD Section 6.11 / Section 15.8.1 (File Header Protocol)
 * AUTHOR: Gemini Lead Engineer Gem
 * PROTOCOL: 100% Mirror Promotion Compliant, Dynamic Resolution
 * ============================================================================
 */

// Global state to prevent redundant fetching micro-delays
var isConfigLoaded = false;

// 🛡️ AUDITOR PATCH: Converted to global var to eliminate Temporal Dead Zone compile blocks
var SPREADSHEET_CONFIG = {
  // Hard-lock this to your DEV sheet ID so automated tests don't get lost
  MAIN_SHEET_ID: '1XdkCQHFm-qFZcSFnUVL_2M3m3dSl1d5s2ztImAd8wvM', 
  FALLBACK_SHEET_ID: '1MDcTUsydw3hJ1G3qljxlxLwL2x3r_H9ajKBEeymE-yY',
  SHEETS: {
    USERS: 'Users',
    SUBJECTS: 'Subjects',
    LABS: 'Labs', 
    CALENDAR: 'Calendar',
    BELL: 'Bell',
    TEACHER_TIMETABLES: 'TeacherTimeTables',
    DUTIES: 'Duties',
    OUTAGES: 'Outages',
    TRANSACTIONS: 'Transactions',
    CONFIG: 'Config',
    LOGS: 'Logs',
    STATS: 'Stats'
  }
};

var CALENDAR_CONFIG = {
  LAB_CALENDAR_ID: 'mahidol.edu_qqoq8j566dhh7sdr'
};

var SYSTEM_CONSTANTS = {
  LEAD_TIME_HOURS: 24,
  MAX_DAILY_PERIODS: 7,
  CONSECUTIVE_PERIOD_LIMIT: 3,
  ENABLE_EMAIL_NOTIFICATIONS: true
};

var DEFAULT_EMAIL_TEMPLATES = {
  CONFIRMATION: "<h3>Reservation Confirmed</h3>",
  DENIAL: "<h3>Reservation Declined</h3>"
};

/**
 * Hydrates system variables from the Spreadsheet 'Config' tab.
 */
function loadDynamicConfig() {
  try {
    const ss = getMainSpreadsheet();
    if (!ss) return;
    
    const sheet = ss.getSheetByName(SPREADSHEET_CONFIG.SHEETS.CONFIG);
    if (!sheet) {
      Logger.log("⚠️ Config Warning: 'Config' sheet tab not found. Falling back to static defaults.");
      return;
    }
    
    const data = sheet.getDataRange().getValues();
    if (!data || data.length <= 1) return;
    
    let hydratedCount = 0;
    for (let i = 1; i < data.length; i++) {
      const key = String(data[i][0] || "").trim();
      const value = data[i][1];
      
      if (key && SYSTEM_CONSTANTS.hasOwnProperty(key)) {
        if (typeof SYSTEM_CONSTANTS[key] === 'boolean') {
          SYSTEM_CONSTANTS[key] = String(value).toLowerCase() === 'true';
        } else if (typeof SYSTEM_CONSTANTS[key] === 'number') {
          SYSTEM_CONSTANTS[key] = Number(value);
        } else {
          SYSTEM_CONSTANTS[key] = String(value !== null && value !== undefined ? value : "").trim();
        }
        hydratedCount++;
      }
    }
    Logger.log("⚙️ Config Sync Success: Loaded (" + hydratedCount + ") live variables from spreadsheet.");
  } catch (error) {
    Logger.log("🚨 Config Crash: Runtime failure reading configuration matrix: " + error.stack);
  }
}

/**
 * Returns dynamic runtime configuration parameters.
 */
function getConfig() {
  if (!SPREADSHEET_CONFIG.MAIN_SHEET_ID) {
    try {
      const activeSs = SpreadsheetApp.getActiveSpreadsheet();
      SPREADSHEET_CONFIG.MAIN_SHEET_ID = activeSs ? activeSs.getId() : SPREADSHEET_CONFIG.FALLBACK_SHEET_ID;
    } catch(e) {
      SPREADSHEET_CONFIG.MAIN_SHEET_ID = SPREADSHEET_CONFIG.FALLBACK_SHEET_ID;
    }
  }

  // ⚡ CONCURRENCY & RECURSION FIX: Set flag to true BEFORE executing loadDynamicConfig
  // This intercepts the inner circular calls from getMainSpreadsheet() perfectly.
  if (!isConfigLoaded) {
    isConfigLoaded = true;
    loadDynamicConfig();
  }
  
  return { 
    SPREADSHEET_CONFIG, 
    CALENDAR_CONFIG, 
    SYSTEM_CONSTANTS,
    DEFAULT_EMAIL_TEMPLATES
  };
}

/**
 * Safely fetches a configuration parameter value by token lookup.
 */
function getConfigValue(key) {
  try {
    const config = getConfig();
    if (config.SYSTEM_CONSTANTS && config.SYSTEM_CONSTANTS.hasOwnProperty(key)) {
      return config.SYSTEM_CONSTANTS[key];
    }
    return null;
  } catch (err) {
    Logger.log("🚨 Error resolving config key [" + key + "]: " + err.message);
    return null;
  }
}

/**
 * ⚡ GATEWAY BRIDGE
 * Exposes the expected namespace and methods used by Main.gs
 * 🛡️ AUDITOR PATCH: Standardized as a hoisted var variable to bypass compiler timeline blocks
 */
var Utils_Config = {
  getEnvironmentConfig: function() {
    return getConfig();
  },
  getConfigValue: function(key) {
    return getConfigValue(key);
  }
};