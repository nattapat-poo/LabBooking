/**
 * ============================================================================
 * MODULE: Mock_Data.js
 * PURPOSE: Centralized Testing Payloads for UAT and Diagnostic Runners.
 * 🛡️ ARCHITECTURE: Encapsulated to prevent global namespace pollution.
 * PRD/DESIGN REF: Section 14 / Mock Payload Architectures / Technical Sync
 * PROTOCOL: UI Payload Decoupling Active
 * 🛡️ AUDITOR REMEDIATION: Eradicated legacy e-commerce terminology from payloads
 * and synchronized telemetry registries with the Cycle 14 test engines.
 * AUDIT: Cycle 14 Compliant (Ubiquitous Language Enforced)
 * ============================================================================
 */

var Mock_Data = (function() {
  
  // 🔒 PRIVATE HELPERS
  const getFutureDateStr = (daysAhead) => {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    return d.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
  };

  // Deep Freeze Helper to prevent accidental runtime state mutations
  const deepFreeze = (obj) => {
    Object.keys(obj).forEach(prop => {
      if (typeof obj[prop] === 'object' && !Object.isFrozen(obj[prop])) deepFreeze(obj[prop]);
    });
    return Object.freeze(obj);
  };

  // 🚪 PUBLIC MOCK PAYLOADS
  const payloads = {
    // --- CALENDAR & DATE MOCKS ---
    Dates: {
      standardOperationalDay: getFutureDateStr(5), // Dynamically offset to bypass 48-hour lock
      weekendBoundaryDay: getFutureDateStr(7)
    },

    // --- NOTIFICATION MOCKS ---
    Notifications: {
      hydrationString: "Hello {name}",
      hydrationVars: { name: "Mek" },
      bogusTemplateKey: "COMPLETELY_BOGUS_TEMPLATE_NAME_999"
    },

    // --- TRANSACTION MOCKS (CYCLE 14 ALIGNED) ---
    Transactions: {
      submitBatchPayload: { 
        batch: [{ 
          bookingId: "mock_tx_123", 
          labId: "lab_01", 
          dateStr: getFutureDateStr(5), 
          date: getFutureDateStr(5), 
          period: "3", 
          subject: "Physics",
          subjectId: "subject_02",
          section: "12-2",
          assignedTaltName: "",
          assignedTaltId: "",
          status: "Pending" 
        }], 
        teacherName: "Auto-QA Test",
        userContext: { email: "nattapat.poo@mahidol.ac.th", userEmail: "nattapat.poo@mahidol.ac.th", role: "teacher" },
        session: { email: "nattapat.poo@mahidol.ac.th", userEmail: "nattapat.poo@mahidol.ac.th", role: "teacher" }
      },

      adminApprovalPayload: {
        batch: [{ 
          bookingId: "mock_tx_999", 
          labId: "lab_02", 
          dateStr: getFutureDateStr(21), 
          date: getFutureDateStr(21), 
          period: "1", 
          subject: "Bio",
          subjectId: "subject_01",
          section: "10-1",
          assignedTaltName: "QA Test Technician",
          assignedTaltId: "TALT-QA-999",
          status: "Pending" 
        }], 
        teacherName: "Auto-QA Test",
        userContext: { email: "nattapat.poo@mahidol.ac.th", userEmail: "nattapat.poo@mahidol.ac.th", role: "admin" },
        session: { email: "nattapat.poo@mahidol.ac.th", userEmail: "nattapat.poo@mahidol.ac.th", role: "admin" }
      }
    }, // ⚡ FIX: Added the missing comma right here!

    // --- UAT INTEGRATION PAYLOADS ---
    UAT: {
      standardTeacherBatch: {
        batch: [{
          bookingId: "UAT-TX-001",
          labId: "lab_01",
          dateStr: getFutureDateStr(5), // ⚡ FIX: Force 5 days ahead for 48h compliance
          date: getFutureDateStr(5),
          period: "3",
          subject: "Chem",
          section: "11-2",
          status: "Pending"
        }],
        userContext: { email: "teacher.muids@mahidol.ac.th", role: "teacher" },
        session: { email: "teacher.muids@mahidol.ac.th", role: "teacher" }
      }
    } // ⚡ FIX: Removed the trailing semicolon that was here!
  };

  return deepFreeze(payloads);
})();


/**
 * 🛡️ THE TELEMETRY DECOUPLER 
 * PURPOSE: Optimized UI Decoupling - High-Volume Mock Data Registries
 * Evaluated directly by Test_Runner.html upon DOM load.
 * ⚡ CYCLE 14 ALIGNMENT: Synchronized with the 6 exact domains mapping to Health_UAT.js
 */
function getServerMockTelemetryPayload() {
  return [
    { id: "DOMAIN_CORE", name: "Core Utilities & Normalization Schemas", testCount: 10 },
    { id: "DOMAIN_SERVICES", name: "Transactional Process Streams", testCount: 5 },
    { id: "DOMAIN_BRIDGE", name: "Perimeter Security & Gateway Routing", testCount: 3 },
    { id: "DOMAIN_WRITE", name: "UAT: Atomic Database Commits", testCount: 2 },
    { id: "DOMAIN_UPDATE", name: "UAT: State Transitions & Lifecycles", testCount: 2 },
    { id: "DOMAIN_TALT", name: "UAT: Administrative Endpoints", testCount: 1 }
  ];
}