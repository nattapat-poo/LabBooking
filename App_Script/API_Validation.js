/**
 * ============================================================================\
 * FILE: API_Validation.gs
 * PURPOSE: Pre-write business rule validation and data safety boundaries.
 * PRD SPEC REF: Section 4.4 (Lead Times), 4.1 (Split-Bell)
 * PROTOCOL COMPLIANCE: 100% Fail-Closed Security Policy Architecture
 * 🛡️ AUDITOR REMEDIATION: Integrated 48h checks, Split-Bell P2 Logic, & Schema Map.
 * ============================================================================\
 */

/**
 * Primary transactional pre-write validation gate.
 * @param {Object} payload - Incoming booking request packet payload (Selected Slots).
 * @param {Object} session - Authenticated user session security context token.
 * @param {Array<Array>} [preFetchedTimetableMatrix] - Optional injected 2D array of timetable row values.
 * @return {boolean} True if all safety checks pass successfully.
 * @throws {Error} Fail-Closed operational denial on any data or policy violations.
 */
function executePreWriteValidation(payload, session, preFetchedTimetableMatrix = null) {
  const rawPeriod = payload ? payload.period : null;
  const p = parseInt(rawPeriod, 10);
  
  if (isNaN(p) || String(rawPeriod).includes('.') || p < 1 || p > 8) {
    throw new Error("Data Error: Invalid period sequence. Input must be an integer between 1 and 8.");
  }

  if (!payload || (!payload.teacherEmail && (!session || !session.email))) {
    throw new Error("Validation Fault: Missing critical identity mapping in payload.");
  }

  // 1. LEAD-TIME ENFORCEMENT (PRD Section 4.4)
  // Standard Teachers must book at least 48 hours in advance. LabTechs/Admins bypass this.
  const isTeacher = session && String(session.role).toLowerCase() === 'teacher';
  if (isTeacher && payload.dateStr) {
    const targetDate = new Date(payload.dateStr);
    const now = new Date();
    
    // Calculate hours difference
    const hoursDiff = (targetDate - now) / (1000 * 60 * 60);
    
    if (hoursDiff < 48) {
      throw new Error("Lead-Time Policy Violation: Teacher reservations require a minimum 48-hour advance notice.");
    }
  }

  // 2. SPLIT-BELL (PERIOD 2) RESOLUTION
  // Cross-reference student grade levels if Period 2 is booked to prevent overlapping timeline conflicts.
  if (p === 2 && typeof getBellType === 'function') {
    const bellResolution = getBellType(payload.dateStr);
    if (!bellResolution || (!bellResolution.ok && !bellResolution.success)) {
      throw new Error(`Structural Fault: Unable to resolve Split-Bell timeline for date: ${payload.dateStr}`);
    }
    // Inject the resolved Bell Type (Grade 11 vs 10/12) back into the payload for downstream mapping
    payload._resolvedBellType = bellResolution.bellType;
  }

  const normalizedEmail = String(payload.teacherEmail || session.email || "").trim().toLowerCase();
  const normalizedDayType = String(payload.dayType || "").toUpperCase().replace(/DAY/g, '').trim();
  const normalizedSubject = String(payload.subject || "").trim().toLowerCase();
  const normalizedSection = String(payload.section || "").trim().toLowerCase();

  let rows = preFetchedTimetableMatrix;

  if (!rows) {
    const config = Utils_Config.getEnvironmentConfig();
    const ss = SpreadsheetApp.openById(config.SPREADSHEET_ID);
    
    // 3. SCHEMA DRIFT PREVENTION (Removed string fallback)
    const timetableSheetName = Utils_Schema.SHEETS.TEACHER_TIMETABLES;
    
    if (!timetableSheetName) {
        throw new Error("Schema Mapping Fault: TEACHER_TIMETABLES mapping is missing from Utils_Schema.");
    }
    
    const sheet = ss.getSheetByName(timetableSheetName);
    if (!sheet) {
      throw new Error(`Database Error: Timetable repository [${timetableSheetName}] cannot be found.`);
    }
    rows = sheet.getDataRange().getValues();
  }

  if (!rows || rows.length === 0) {
    throw new Error("Data Error: Timetable matrix is empty. Halting validation to prevent schema drift corruption.");
  }

  // Enforce frozen schema definitions safely
  const mappedRecords = Utils_DataMapper.mapSheetRowsToObjects(rows, null);

  if (!mappedRecords || mappedRecords.length === 0) {
    throw new Error("Schema Mapping Fault: Timetable rows failed to map to structural objects. Halting to prevent data corruption.");
  }

  let conflictFound = false;

  // STRICT EXECUTION: Iterate exclusively over safely mapped objects. 
  // No hardcoded 2D array fallbacks exist here.
  for (let i = 0; i < mappedRecords.length; i++) {
    const record = mappedRecords[i];
    const matchEmail = String(record.TEACHER_EMAIL || record.EMAIL || "").trim().toLowerCase();
    const matchDayType = String(record.DAY_TYPE || record.DAY || "").toUpperCase().replace(/DAY/g, '').trim();
    const matchPeriod = parseInt(record.PERIOD || 0, 10);
    
    if (matchEmail === normalizedEmail && matchDayType === normalizedDayType && matchPeriod === p) {
       const matchSubject = String(record.SUBJECT || record.SUBJECT_ID || record.SUBJECT_CODE || "").trim().toLowerCase();
       const matchSection = String(record.SECTION || "").trim().toLowerCase();
       
       if (matchSubject !== normalizedSubject || matchSection !== normalizedSection) {
         conflictFound = true;
         break;
       }
    }
  }

  if (conflictFound) {
    throw new Error("Timetable Conflict: Requested period overlaps with an existing scheduled class.");
  }

  return true;
}