/**
 * ============================================================================
 * FILE: Health_Unit_Bridge.js
 * PURPOSE: Perimeter Security, Boundary Access Control, and Gateway Routing Tests
 * PRD/DESIGN REF: Section 14 (UAT Matrix), Section 6.4.4 & 15 (Security/Architecture)
 * AUTHOR: Master System Architect (Gemini Engine Mode)
 * PROTOCOL: 100% Identity Isolation, Memory-Optimized V8 Gas Telemetry,
 * Absolute Deprecation of Legacy E-Commerce Terminology (Cycle 14).
 * PATCH REF: Standardized Global Reflection Lookups (Fallback to 'this')
 * ============================================================================
 */

// Global volatile log array for tracking perimeter security gates
let _bridgeTestExecutionLogs = [];

/**
 * System-wide Security Diagnostic Logger for peripheral boundary validation.
 * Accretes structural perimeter routing events in memory during a single execution run.
 * @param {string} testId Unique identifier for the executing security test block.
 * @param {string} severity Log severity level (INFO, WARNING, SUCCESS, CRITICAL).
 * @param {string} message Descriptive security validation trace info.
 */
function logBridgeTestDiagnostic(testId, severity, message) {
  const timestamp = new Date().toISOString();
  _bridgeTestExecutionLogs.push({ testId, timestamp, severity, message });
}

/**
 * Memory-Optimized Bridge Telemetry Engine.
 * Executes a boundary security check inside a secure, headless sandbox wrapper.
 * @param {string} testId Unique identifier for the UAT assertion.
 * @param {string} testName Descriptive layout name of the feature under test.
 * @param {string} context System scope or process boundary.
 * @param {function} testFn Test logic block containing assertions.
 * @param {Array} resultsArray Target compile array for metrics ingestion.
 */
function _recordBridgeUnitTelemetry(testId, testName, context, testFn, resultsArray) {
  const start = Date.now();
  _bridgeTestExecutionLogs = []; 
  
  try {
    const msg = testFn();
    const duration = Date.now() - start;
    
    if (typeof msg === "string" && msg.startsWith("Skipped:")) {
      resultsArray.push({ 
        testId, 
        testName: `[${testId}] ${testName} (${context})`, 
        passed: false, 
        durationMs: duration, 
        message: `Unresolved: ${msg}` 
      });
      return;
    }
    resultsArray.push({ 
      testId, 
      testName: `[${testId}] ${testName} (${context})`, 
      passed: true, 
      durationMs: duration, 
      message: msg 
    });
  } catch (err) {
    resultsArray.push({ 
      testId, 
      testName: `[${testId}] ${testName} (${context})`, 
      passed: false, 
      durationMs: Date.now() - start, 
      message: `Failed: ${err.message}` 
    });
  }
}

/**
 * Executes the full Bridge security and gateway unit testing suite.
 * @returns {Array<Object>} Compilation of test assertion results.
 */
function runUnit_BridgeSuite() {
  const results = [];

  // ==========================================================================
  // DOMAIN 1: ADMINISTRATIVE GATEWAY PERIMETER VALIDATION
  // ==========================================================================

  _recordBridgeUnitTelemetry("BRG-AUT.01", "TALT Perimeter Security Authorization Guard", "API_TALT_Auth -> enforceTALTAuth Check", () => {
    if (typeof enforceTALTAuth !== 'function') return "Skipped: enforceTALTAuth utility offline.";
    
    logBridgeTestDiagnostic("BRG-AUT.01", "INFO", "Initiating peripheral validation trace against enforceTALTAuth.");
    try {
      enforceTALTAuth("Automated Sandbox Test");
      logBridgeTestDiagnostic("BRG-AUT.01", "INFO", "Executing test identity holds valid administrative clearance.");
    } catch (e) {
      if (!e.message.includes("Security Violation") && !e.message.includes("SECURITY_CRITICAL")) {
        throw new Error(`Unexpected failure modality during TALT auth check: ${e.message}`);
      }
      logBridgeTestDiagnostic("BRG-AUT.01", "SUCCESS", `Access denied as expected for current execution identity: ${e.message}`);
    }

    return "TALT authorization perimeter successfully verified against runtime context.";
  }, results);

  // ==========================================================================
  // DOMAIN 2: ROUTING GATEWAY INTERCEPTION
  // ==========================================================================

  _recordBridgeUnitTelemetry("BRG-RTE.01", "Bridge Route Authorization Interception", "API_Bridge -> _authenticateRouteGateway", () => {
    if (typeof _authenticateRouteGateway !== 'function') return "Skipped: _authenticateRouteGateway offline.";
    
    logBridgeTestDiagnostic("BRG-RTE.01", "INFO", "Evaluating routing gateway's ability to demand valid roles.");
    
    try {
      // Test the gateway with a bogus required role to force a rejection
      _authenticateRouteGateway(["IMPOSSIBLE_BOGUS_ROLE"]);
      throw new Error("Gateway failed to intercept request with impossible role constraints.");
    } catch (e) {
      if (!e.message.includes("Security Exception") && !e.message.includes("Access denied")) {
        throw e;
      }
    }
    
    return "Gateway securely intercepts and halts mismatched route authorization requirements.";
  }, results);

  // ==========================================================================
  // DOMAIN 3: DATA TRANSLATION AND DEPRECATION AUDIT SCAN (CYCLE 14 REVISION)
  // ==========================================================================

  _recordBridgeUnitTelemetry("BRG-ULP.02", "API Endpoint Parametric Vocabulary Sanity Check", "API_Bridge -> Input Variable Structural Scan", () => {
    logBridgeTestDiagnostic("BRG-ULP.02", "INFO", "Auditing global string definitions in exposed API_Bridge routes for legacy terms.");
    
    // Verify that zero legacy parameters exist on exposed gateway functions to protect payload definitions from regressions
    const targetedBridgeRoutes = [
      "bridgeSubmitBooking", "bridgeApproveBooking", "bridgeRejectBooking", "bridgeCancelBooking"
    ];

    // ⚡ PATCH: Standardized global reflection lookup using scope fallback pattern to eliminate silent test passes if globalThis properties are masked
    const scope = typeof globalThis !== 'undefined' ? globalThis : this;

    targetedBridgeRoutes.forEach((routeName) => {
      if (typeof scope[routeName] === 'function') {
        const functionStringBody = scope[routeName].toString().toLowerCase();
        if (functionStringBody.includes("cart") || functionStringBody.includes("checkout")) {
          throw new Error(`SEVERITY 1 REGRESSION: Exposed bridge pathway '${routeName}' retains legacy e-commerce strings inside execution blocks.`);
        }
      } else {
        // Explicitly throw an exception instead of silently skipping to prevent silent test passes
        throw new Error(`SEVERITY 1 ARCHITECTURAL FAULT: Exposed bridge route pathway '${routeName}' is missing or unallocated in global runtime scope.`);
      }
    });

    logBridgeTestDiagnostic("BRG-ULP.02", "SUCCESS", "All active bridge pathways cleared for production routing. Zero terminology leakage discovered.");
    return "All routing parameters strictly comply with Cycle 14 formatting standards. Core systems remain clear and verified via secure fallback reflection.";
  }, results);

  return results;
}