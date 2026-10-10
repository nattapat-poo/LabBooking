/**
 * ============================================================================
 * FILE: Utils_Schema.gs
 * PURPOSE: True Master Unified Column Structural Definitions and Layout Configurations
 * PRD SPECIFICATION REFERENCE: Section 15.8 (Data Layer Integrity Validation)
 * AUTHOR: Gemini Lead Engineer Gem
 * PROTOCOL COMPLIANCE: 100% Structural Object Architecture & Mirror Promotion Compliant
 * AUDIT: Cycle 13 Cleared (Terminology Compliant)
 * ============================================================================
 */

/**
 * Recursive deep freeze utility to lock schema metadata layouts at compile-time.
 * Enforces true read-only structural integrity for authoritative column indices.
 * @param {Object} obj - The layout mapping dictionary to freeze.
 * @return {Object} The deeply frozen, immutable layout mapping.
 */
function _deepFreezeSchema(obj) {
  if (obj && typeof obj === 'object') {
    Object.freeze(obj);
    Object.getOwnPropertyNames(obj).forEach(function (prop) {
      if (obj.hasOwnProperty(prop) &&
          obj[prop] !== null &&
          (typeof obj[prop] === "object" || typeof obj[prop] === "function") &&
          !Object.isFrozen(obj[prop])) {
        _deepFreezeSchema(obj[prop]);
      }
    });
  }
  return obj;
}

// ============================================================================
// MASTER COLUMN LAYOUT SCHEMA OBJECTS (DECOUPLED FROM RAW INDEX DRIFT)
// ============================================================================

const USR_COL = _deepFreezeSchema({ 
  USER_ID: { header: "USER_ID", index: 0 }, 
  ACCOUNT: { header: "ACCOUNT", index: 1 }, 
  FIRSTNAME: { header: "FIRSTNAME", index: 2 }, 
  LASTNAME: { header: "LASTNAME", index: 3 }, 
  EMAIL: { header: "EMAIL", index: 4 }, 
  NICKNAME: { header: "NICKNAME", index: 5 }, 
  ROLE: { header: "ROLE", index: 6 }, 
  ISHOD: { header: "ISHOD", index: 7 }, 
  SUBJECTS: { header: "SUBJECTS", index: 8 }, 
  HAS_COMPLETED_TUTORIAL: { header: "HAS_COMPLETED_TUTORIAL", index: 9 }, 
  PRIMARY_GRADE: { header: "PRIMARY_GRADE", index: 10 }, 
  JOINED_AY: { header: "JOINED_AY", index: 11 }, 
  CAN_EDIT_CONFIG: { header: "CAN_EDIT_CONFIG", index: 12 }
});

const SUB_COL = _deepFreezeSchema({ 
  SUBJECT_ID: { header: "SUBJECT_ID", index: 0 }, 
  SUBJECT: { header: "SUBJECT", index: 1 }, 
  COURSE_FULLNAME: { header: "COURSE_FULLNAME", index: 2 }
});

const OUT_COL = _deepFreezeSchema({
  OUTAGE_ID: { header: "OUTAGE_ID", index: 0 },
  LAB_ID: { header: "LAB_ID", index: 1 },
  LAB_NAME: { header: "LAB_NAME", index: 2 },
  START_DATE: { header: "START_DATE", index: 3 },
  END_DATE: { header: "END_DATE", index: 4 },
  START_PERIOD: { header: "START_PERIOD", index: 5 },
  END_PERIOD: { header: "END_PERIOD", index: 6 },
  REASON: { header: "REASON", index: 7 },
  STATUS: { header: "STATUS", index: 8 }
});

const TX_COL = _deepFreezeSchema({ 
  BOOKING_ID: { header: "BOOKING_ID", index: 0 }, 
  BATCH_ID: { header: "BATCH_ID", index: 1 }, 
  SUBMITTED_BY_USER_ID: { header: "SUBMITTED_BY_USER_ID", index: 2 }, 
  USER: { header: "USER", index: 3 }, 
  TARGET_USER_ID: { header: "TARGET_USER_ID", index: 4 }, 
  TEACHER: { header: "TEACHER", index: 5 }, 
  SUBJECT: { header: "SUBJECT", index: 6 }, 
  LAB_ID: { header: "LAB_ID", index: 7 }, 
  LAB_NAME: { header: "LAB_NAME", index: 8 }, 
  DATE: { header: "DATE", index: 9 }, 
  PERIOD: { header: "PERIOD", index: 10 }, 
  SECTION: { header: "SECTION", index: 11 }, 
  DAY_TYPE: { header: "DAY_TYPE", index: 12 }, 
  BELL_TYPE: { header: "BELL_TYPE", index: 13 }, 
  TIME_SLOT_ID: { header: "TIME_SLOT_ID", index: 14 }, 
  LAB_TITLE: { header: "LAB_TITLE", index: 15 }, 
  STATUS: { header: "STATUS", index: 16 }, 
  BOOKING_TIMESTAMP: { header: "BOOKING_TIMESTAMP", index: 17 }, 
  CONFIRM_USER_ID: { header: "CONFIRM_USER_ID", index: 18 }, 
  CONFIRMED_BY: { header: "CONFIRMED_BY", index: 19 }, 
  ASSIGNED_TALT_ID: { header: "ASSIGNED_TALT_ID", index: 20 }, 
  ASSIGNED_TALT_NAME: { header: "ASSIGNED_TALT_NAME", index: 21 }
});

// ============================================================================
// THE 3 MANDATORY ECOSYSTEM SHEETS (LAB OOPS OS CANONICAL SCHEMAS)
// ============================================================================

const CFG_COL = _deepFreezeSchema({
  CONFIG_KEY: { header: "ConfigKey", index: 0 },
  CONFIG_VALUE: { header: "ConfigValue", index: 1 },
  DATA_TYPE: { header: "DataType", index: 2 },
  DESCRIPTION: { header: "Description", index: 3 },
  LAST_UPDATED: { header: "LastUpdated", index: 4 }
});

const LOG_COL = _deepFreezeSchema({
  TIMESTAMP: { header: "Timestamp", index: 0 },
  ACTOR_EMAIL: { header: "ActorEmail", index: 1 },
  ACTION_TYPE: { header: "ActionType", index: 2 },
  STATUS: { header: "Status", index: 3 },
  RECORDS_AFFECTED: { header: "RecordsAffected", index: 4 },
  DETAILS: { header: "Details", index: 5 }
});

const STA_COL = _deepFreezeSchema({
  TIMESTAMP: { header: "Timestamp", index: 0 },
  ACTOR_EMAIL: { header: "ActorEmail", index: 1 },
  EVENT_TYPE: { header: "EventType", index: 2 },
  EVENT_DATA: { header: "EventData", index: 3 },
  METRIC_KEY: { header: "MetricKey", index: 4 },
  METRIC_VALUE: { header: "MetricValue", index: 5 }
});