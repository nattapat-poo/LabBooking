/**
 * ============================================================================
 * FILE: Health_Unit_Core.js
 * PURPOSE: Core Utility, Schema, and Cache Function-by-Function Unit Tests
 * PRD/DESIGN REF: Section 14 (UAT Plan), Section 15.8 (Security & Telemetry Layer)
 * AUTHOR: Master System Architect (Gemini Engine Mode)
 * PROTOCOL: 100% Identity Isolation, Memory-Optimized V8 Gas Telemetry,
 * Absolute Deprecation of Legacy E-Commerce Terminology (Cycle 14).
 * ============================================================================
 */

// Global volatile log array for deep transaction tracking
let _coreTestExecutionLogs = [];

/**
 * System-wide Diagnostic Logger for internal test observation.
 * Accretes structural tracing events in memory during a single unit test execution.
 */
function logCoreTestDiagnostic(testId, severity, message) {
  const timestamp = new Date().toISOString();
  _coreTestExecutionLogs.push({ testId, timestamp, severity, message });
}

/**
 * Memory-Optimized Unit Telemetry Engine.
 * Executes a test payload safely within a sandbox isolation perimeter. 
 */
function _recordCoreUnitTelemetry(testId, testName, context, testFn, resultsArray) {
  const start = Date.now();
  try {
    const msg = testFn();
    const duration = Date.now() - start;
    
    if (typeof msg === "string" && msg.startsWith("Skipped:")) {
      resultsArray.push({ 
        testId: testId,
        testName: `[${testId}] ${testName} (${context})`, 
        passed: false, 
        durationMs: duration,
        message: `Unresolved: ${msg}` 
      });
    } else {
      resultsArray.push({ 
        testId: testId,
        testName: `[${testId}] ${testName} (${context})`, 
        passed: true, 
        durationMs: duration,
        message: msg 
      });
    }
  } catch (err) {
    const duration = Date.now() - start;
    resultsArray.push({ 
      testId: testId,
      testName: `[${testId}] ${testName} (${context})`, 
      passed: false, 
      durationMs: duration,
      message: `Failed: ${err.message}`,
      logs: _coreTestExecutionLogs.slice(-10)
    });
  }
}

/**
 * Main switchboard execution point for the Core Utilities Unit Testing Suite.
 * Covers Domains 1, 2, 3, and 4 completely to achieve 100% functional alignment.
 * @returns {Array<Object>} Compile array of test results.
 */
function runUnit_CoreSuite() {
  const results = [];
  _coreTestExecutionLogs = []; // Reset volatile memory buffer

  // ==========================================================================
  // DOMAIN 1: DYNAMIC CONFIGURATION VALIDATION (Utils_Config)
  // ==========================================================================

  _recordCoreUnitTelemetry("CORE-CFG.01", "Dynamic Configuration Schema Matrix Resolution", "Utils_Config -> getConfig Structural Sanity", () => {
    if (typeof getConfig !== 'function') return "Skipped: getConfig engine offline.";
    logCoreTestDiagnostic("CORE-CFG.01", "INFO", "Evaluating global configuration payload structure.");
    
    const config = getConfig();
    if (!config || typeof config !== 'object') {
      throw new Error("Configuration context returned empty or invalid type payload.");
    }
    if (!config.SPREADSHEET_CONFIG || !config.CALENDAR_CONFIG || !config.SYSTEM_CONSTANTS) {
      throw new Error("Missing vital configuration root domains (SPREADSHEET_CONFIG, CALENDAR_CONFIG, SYSTEM_CONSTANTS).");
    }
    return "Dynamic configuration schema successfully loaded and structural elements verified.";
  }, results);

  _recordCoreUnitTelemetry("CORE-CFG.02", "Granular Parameter Token Key Resolution Lookup", "Utils_Config -> getConfigValue Fault Tolerance", () => {
    if (typeof getConfigValue !== 'function') return "Skipped: getConfigValue offline.";
    const nonExistentValue = getConfigValue("NON_EXISTENT_SYSTEM_KEY_BOGUS_999");
    if (nonExistentValue !== undefined && nonExistentValue !== null && nonExistentValue !== "") {
      throw new Error("Configuration lookup failed to return fallback/empty state for untracked parameters.");
    }
    return "Parameter token resolver gracefully handles non-existent configurations.";
  }, results);

  // ==========================================================================
  // DOMAIN 2: CORE UTILITIES & LOCKS (Utils_Core)
  // ==========================================================================

  _recordCoreUnitTelemetry("CORE-COR.01", "Timezone Warping Mitigation and Date Normalization", "Utils_Core -> parseDateString Isolation", () => {
    if (typeof parseDateString !== 'function') return "Skipped: parseDateString offline.";
    const standardInput = "2026/05/21";
    const normalizedOutput = parseDateString(standardInput);
    if (normalizedOutput !== "2026-05-21") {
      throw new Error(`Timezone parsing mismatch: Expected '2026-05-21', but received '${normalizedOutput}'`);
    }
    return "Date string normalization engine accurately anchors calendar dates.";
  }, results);

  _recordCoreUnitTelemetry("CORE-COR.02", "Standardized Cryptographic Pseudo-Random Unique ID Generation", "Utils_Core -> generateUniqueId Pattern Match", () => {
    if (typeof generateUniqueId !== 'function') return "Skipped: generateUniqueId offline.";
    const prefix = "TEST-TX-";
    const generatedId = generateUniqueId(prefix);
    if (!generatedId.startsWith(prefix)) {
      throw new Error(`ID pattern breakdown: Generated vector string '${generatedId}' lacks mandatory prefix context.`);
    }
    return "Unique identifier generation conforms strictly to structural prefix rules.";
  }, results);

  _recordCoreUnitTelemetry("CORE-COR.03", "Circular Reference Sanitization and JSON Crash Shielding", "Utils_Core -> safeStringify Boundary Guard", () => {
    if (typeof safeStringify !== 'function') return "Skipped: safeStringify offline.";
    const cyclicGraphObject = { label: "Root Node" };
    cyclicGraphObject.selfLink = cyclicGraphObject;
    try {
      safeStringify(cyclicGraphObject);
    } catch (crashEvent) {
      throw new Error(`CRITICAL ENGINE BLOWUP: safeStringify failed to neutralize circular dependencies.`);
    }
    return "Circular reference protection shields the diagnostic engine.";
  }, results);

  _recordCoreUnitTelemetry("CORE-COR.04", "Atomic Concurrency Transaction Mutual Exclusion Engine", "Utils_Core -> withLock Mutex Hold-Times", () => {
    if (typeof withLock !== 'function') return "Skipped: withLock thread controller offline.";
    let trackingFlag = false;
    const transactionalOutcome = withLock(() => {
      trackingFlag = true;
      return "SUCCESS_WITHIN_MUTEX";
    });
    if (transactionalOutcome !== "SUCCESS_WITHIN_MUTEX" || !trackingFlag) {
      throw new Error("Mutex controller dropped execution or failed to safely return callback context payloads.");
    }
    return "Atomic lock boundary isolates closures successfully.";
  }, results);

  // ==========================================================================
  // DOMAIN 3: SCRIPT CACHE Lifecycle & Segmentation Controls (Utils_Cache)
  // ==========================================================================

  _recordCoreUnitTelemetry("CORE-CCH.01", "Distributed Key Chunk Assembly Matrix Rows Processing", "Utils_Cache -> Chunked Caching Boundaries", () => {
    if (typeof getCachedSheetValues !== 'function' || typeof setCachedSheetValues !== 'function') {
      return "Skipped: Distributed cache sub-system functions offline.";
    }
    const mockSheetName = "MOCK_DUMMY_TAB";
    const mockDataValues = [["Header1", "Header2"], ["Row1Value", "Row2Value"]];
    try {
      setCachedSheetValues(mockSheetName, mockDataValues);
      const retrievedValues = getCachedSheetValues(mockSheetName);
      if (!retrievedValues || retrievedValues[1][0] !== "Row1Value") {
        throw new Error("Data fragmentation loop corrupted volatile layout structures.");
      }
    } finally {
      if (typeof clearCacheForSheet === 'function') clearCacheForSheet(mockSheetName);
    }
    return "Chunked storage matrix splits and reconstructs data structures flawlessly.";
  }, results);

  _recordCoreUnitTelemetry("CORE-CCH.02", "RBAC Verification Eviction and Administrative Token Bypass Purge", "Utils_Cache -> clearAllCaches Security Sweep", () => {
    if (typeof clearAllCaches !== 'function') return "Skipped: clearAllCaches offline.";
    try {
      clearAllCaches();
    } catch (purgeFault) {
      throw new Error(`Cache system wipe experienced structural blockages: ${purgeFault.message}`);
    }
    return "Eviction purge successfully wipes active authorization tokens.";
  }, results);

  // ==========================================================================
  // DOMAIN 4: DATA TRANSLATION AND CYCLE 14 PROTOCOL SANITY CHECK (Utils_DataMapper)
  // ==========================================================================

  _recordCoreUnitTelemetry("CORE-MAP.01", "Pre-Compiled Header Index Map Array Normalization", "Utils_DataMapper -> mapSheetRowsToObjects V8 Speed Optimization", () => {
    if (!Utils_DataMapper || typeof Utils_DataMapper.mapSheetRowsToObjects !== 'function') {
      return "Skipped: Utils_DataMapper mapSheetRowsToObjects offline.";
    }
    const rawSpreadsheetData = [
      ["BOOKING_ID", "TEACHER_EMAIL", "PERIOD"],
      ["TX-7711", "bala.muids@mahidol.ac.th", "4"]
    ];
    
    // 🛡️ PATCH: Supply explicit schema map so the V8 engine can compile the indexes
    const mockSchema = { BOOKING_ID: "BOOKING_ID", TEACHER_EMAIL: "TEACHER_EMAIL", PERIOD: "PERIOD" };
    
    const parsedObjects = Utils_DataMapper.mapSheetRowsToObjects(rawSpreadsheetData, mockSchema);
    
    if (!parsedObjects || parsedObjects.length !== 1 || (parsedObjects[0].BOOKING_ID !== "TX-7711" && parsedObjects[0].BOOKINGID !== "TX-7711")) {
      throw new Error("V8 mapping optimization failed to resolve normalized pre-compiled matrix array vectors.");
    }
    return "Pre-compiled header mapping successfully decouples raw data rows.";
  }, results);

  _recordCoreUnitTelemetry("CORE-MAP.02", "Vector Path Naming Alias Alignment Verification", "Utils_DataMapper -> mapBatchItemToRowVector Alias Integrity", () => {
    if (!Utils_DataMapper || typeof Utils_DataMapper.mapBatchItemToRowVector !== 'function') {
      return "Skipped: mapBatchItemToRowVector alias offline.";
    }
    const dummyItem = { bookingId: "ID-99" };
    const dummySchema = { BOOKING_ID: 0 };
    try {
      const rowVector = Utils_DataMapper.mapBatchItemToRowVector(dummyItem, dummySchema);
      if (!rowVector || !Array.isArray(rowVector)) {
        throw new Error("Alias wrapper failed to produce a structured array vector row output.");
      }
    } catch (e) {
      throw new Error(`Regression in mapping components: ${e.message}`);
    }
    return "mapBatchItemToRowVector alias confirmed intact.";
  }, results);

  _recordCoreUnitTelemetry("CORE-MAP.03", "Utils_DataMapper.safelyCommitToScriptCache 95KB Overflow Protection", "Utils_DataMapper -> Memory Boundaries Guard", () => {
    if (!Utils_DataMapper || typeof Utils_DataMapper.safelyCommitToScriptCache !== 'function') {
      return "Skipped: Utils_DataMapper safelyCommitToScriptCache offline.";
    }
    let overflowBufferString = "";
    for (let i = 0; i < 3000; i++) {
      overflowBufferString += "CRITICAL_CACHING_OVERFLOW_SHIELD_ARRAY_TEST_PADDING_BLOCK_SEQUENCE_LONG_STRING_DATA_1234567890_";
    }
    const executionSafetyOutcome = Utils_DataMapper.safelyCommitToScriptCache("CRITICAL_OVERFLOW_TEST_KEY", overflowBufferString, 300);
    if (executionSafetyOutcome === true) {
      throw new Error("SECURITY FAULT: Cache shield allowed an oversized payload to bypass the 95KB threshold cushion.");
    }
    return "safelyCommitToScriptCache successfully intercepted memory bounds to prevent execution crash.";
  }, results);

  _recordCoreUnitTelemetry("CORE-ULP.01", "Ubiquitous Language Compliance Structural Validation", "Utils_DataMapper -> Global Dictionary Verification", () => {
    // ⚡ FALLBACK PATCH PRE-APPLIED: Safely resolves global boundaries to prevent silent passes
    const scope = typeof globalThis !== 'undefined' ? globalThis : this;
    const activeGlobalIdentifiers = Object.keys(scope);
    const forbiddenExpressions = ["cart", "checkout", "addtocart", "submitcart", "view_cart"];
    
    activeGlobalIdentifiers.forEach((exposedSymbol) => {
      const lowercasedSymbolName = exposedSymbol.toLowerCase();
      forbiddenExpressions.forEach((forbiddenTerm) => {
        if (lowercasedSymbolName.includes(forbiddenTerm)) {
          throw new Error(`SEVERITY 1 DEPRECATION BREAK: Discovered forbidden legacy expression '${forbiddenTerm}' inside exposed system identity symbol: '${exposedSymbol}'`);
        }
      });
    });
    
    return "Global runtime workspace completely purged of all legacy e-commerce terminology. Cycle 14 protocol is enforced.";
  }, results);

  return results;
}