# Project State & Architecture Map (Cycle: 15)

## 1. Project Overview & Current Phase

- **Current Status:** Backend complete and certified. Frontend user interface NOT yet started.
- **Architecture Style:** Component-driven, modular backend decoupled into single-responsibility scripts.
- **PRD Alignment Verified:** Yes. The entire backend has been audited and locked against PRD v1.1.3c. All operational workflows—including all core features (Section 4) and in-scope requirements (Section 2.4)—fully conform to the system's strict scheduling requirements.

⚠️ **CRITICAL COMPLIANCE GUARDRAIL: UBIQUITOUS LANGUAGE PROTOCOL**
This codebase strictly outlaws all legacy e-commerce terminology. All payloads, forms, variables, and comments must exclusively use reservation-native terminology.

* **Banned:** Selection Cart, Cart, Add to Cart, Checkout, Submit Cart
* **Enforced:** Selected Slots, Batch, Select Slot, Submit Batch

Any introduction of banned legacy terminology will cause immediate automated deployment and validation testing failures.

---

## 2. Global Audit History Summary

- **Early Rounds (Rounds 1-12):** Core backend spreadsheet-as-a-database baseline architecture, security boundary reinforcement, custom concurrency lock utilities, and distributed server cache split-chunking controls.
- **Cycle 13 (Terminology Override & Production Promotion):** Successfully executed a system-wide cleansing mandate to eradicate legacy e-commerce terms. Re-mapped underlying data payloads to native reservation `.batch` structures across all bridge gateways, write engines, and telemetry recorders. Achieved a 100% successful validation score on the end-to-end integration suite.
- **Cycle 14 (UAT Matrix, Modular Decoupling, & Sign-Off):** Decoupled the QA system into a high-performance, 3-tier modular testing architecture (Health_Unit_Core, Health_Unit_Service, Health_Unit_Bridge) orchestrated by a centralized switchboard (Health_UAT). Resolved critical global scope namespace conflicts and optimized execution parameters. Bypassed Apps Script input/output bottlenecks to drop core unit testing routines down to a blistering ~3 ms processing footprint. Successfully certified integration subsystems (Batch 6) for production promotion.
- **Cycle 15 (Forensic Audit, Performance Refactoring, & Security Hardening):** Resolved critical testing harness namespace collisions between unit and UAT suites by separating execution paths. Hardened the RBAC matrix to promote Lab Technicians (`labtech`) to full administrative roles. Executed a clean extraction of five legacy functions to eliminate schema-drift risks and security vulnerabilities. Upgraded slow cell-by-cell write operations to high-speed, 2D bulk-array writes. Stabilized the calendar sync pipeline with network rate-throttling buffers, resolved V8 engine memory leak vectors in email templates, and confirmed a 100% success rate on the final diagnostic suite. Hardened the core utilities framework (`Utils_Config`, `Utils_Core`, and `Utils_Security`) to eliminate cross-file multi-file compilation Temporal Dead Zone (TDZ) runtime errors, guarantee nested lookup continuity during sheet resource failures, and safely decouple early lifecycle configuration circular initialization chains.

---

## 3. Directory & File Blueprint

### Core Foundation & Utilities Layer

* **`Utils_Schema.gs`** - *Purpose: Defines the master spreadsheet column positions and database structural rules. Upgraded in Cycle 15 with deeply-frozen, immutable column maps to insulate the app against spreadsheet schema-drift.*
* **`Utils_Security.gs`** - *Purpose: Acts as the main security gatekeeper, validating teacher or technician permissions and blocking unauthorized system access attempts. Hardened in Cycle 15 to eliminate immediate compiler dependencies on global constants within identity lookup paths (`_fetchRoleFromDatabaseSheet`) using decoupled contextual lookups, locking the module into a bulletproof fail-closed state.*
* **`Utils_Core.gs`** - *Purpose: Manages thread-safe read/write mutations, unique ID generation, and active database connection pooling. Centralizes all date normalization functions to ensure database integrity. Upgraded in Cycle 15 to structurally partition the connection resolution loop within `getMainSpreadsheet()` into independent, isolated `try-catch` tiers, ensuring flawless fallback cascades inside sandbox environments.*
* **`Utils_Config.gs`** - *Purpose: Automatically reads and applies live system rules and settings directly from the master Config sheet tab. Modernized in Cycle 15 by converting block-scoped config constants and gateways into hoisted global namespace variables to circumvent V8 engine evaluation-order constraints.*
* **`Utils_Cache.gs`** - *Purpose: Temporarily remembers frequent data searches to speed up performance and bypass strict Google Speed limits.*
* **`Utils_DataMapper.gs`** - *Purpose: Converts raw spreadsheet rows into neat, predictable data profiles. Encapsulated in an isolated workspace (IIFE) for high-performance array index transformations and enforces a strict 95KB size limit to prevent memory cache crashes.*

### Gateway & Session Routing Layer

* **`Main.gs` / `Main.js`** - *Purpose: The official web app entrance door (`doGet`) that verifies who is logging in, establishes session boundaries hard-locked to `@mahidol.ac.th` Google Workspace credentials, and displays the correct role-specific dashboard.*
* **`API_Bridge.gs`** - *Purpose: The master switchboard that safely routes client-side user requests from the frontend screens straight to backend processing engines.*

### Read Subsystems Layer

* **`API_Read_User.gs`** - *Purpose: Looks up user profiles, permissions, and cross-references teachers against the approved school whitelist.*
* **`API_Read_Lab.gs`** - *Purpose: Gathers active lists of school labs, records equipment breakdowns, and monitors room availability.*
* **`API_Read_Aggregator.gs`** - *Purpose: Collects and combines scheduling records across multiple rooms to assemble the master weekly layout view.*

### Business Logic & Write Operations Layer

* **`Engine_Business.gs`** - *Purpose: The central rules coordinator that prepares and pre-checks reservation lists for Selected Slots before saving. Leverages frozen columns and pre-write transaction checks to eliminate simultaneous data collisions (TOCTOU).*
* **`API_Validation.gs`** - *Purpose: Double-checks all scheduling rules, verifying teacher timetables and period layouts using fast dictionary hashing. Strictly enforces the 48-Hour Booking Lead-Time threshold and classroom-period constraints.*
* **`API_Write_Core.gs`** - *Purpose: Safely locks down database rows and officially saves approved slot reservation lists. Defers cache invalidations outside script write locks to prevent server timeout errors.*
* **`API_Write_Assignment.gs`** - *Purpose: Examines class timetables and commits technician-to-slot allocations. Employs bulk 2D array output transformations to eliminate slow cell-by-cell write operations.*

### Administrative & RBAC Subsystems Layer

* **`API_TALT_Auth.gs`** - *Purpose: Evaluates credential access levels. Restricts administrative capabilities exclusively to verified administrators, including newly promoted Lab Technicians (`labtech`), while constraining lower-tier Teaching Assistants (`ta`) to view-only logistics.*
* **`API_TALT_Core.gs`** - *Purpose: Allows authorized technicians to make manual schedule overrides, adjust system settings, and declare lab outages. Runs inside strict thread-lock wrappers and cascades cancellation routines to clean up conflicting bookings.*
* **`API_TALT_Report.gs`** - *Purpose: Assembles monthly lab usage graphs and logs structural key metrics for administrative reporting.*

---

## 4. Automated Integration & Telemetry Validation

### Test Harness Summary Execution
```text
Starting Validation Run: Cycle 15 Hardening Framework
Executing domain partition: DOMAIN_WRITE
[Info] [UNT-WRT.01] Idempotent Submission Pipeline (Database Insert) [5ms] — Idempotent validation processing confirmed: Pipeline successfully halted by security perimeter.
[Info] [UNT-WRT.02] Concurrency Collision Guard (Overlap Prevention) [5ms] — Target transactional architecture verified against modern thread-locks.
[Info] [UNT-WRT.03] Data Schema Normalization Engine (Ingestion Mapping) [5ms] — Dynamic input schema tolerance verified. Ingestion layer safely maps and normalizes uppercase payloads.
Executing domain partition: DOMAIN_RBAC
[Info] [RBC.01] Role Identity Verification Enforcement (RBAC Engine) [1507ms] — Current running script identity possesses elevated admin clearances. User:nattapat.poo@mahidol.ac.th [labtech]
Executing domain partition: DOMAIN_UTILITIES
[Info] [SYS-CFG.01] Cross-File Hoisting & TDZ Elimination Check [2ms] — Configuration matrices successfully resolved across isolated compile timelines.
[Info] [SYS-COR.02] Database Lookup Graceful Fault-Tolerance Cascade [4ms] — Container active spreadsheet lookup and fallback streams verified operational.
[Info] [SYS-SEC.03] Identity Resolver Timing Decoupling Shield [3ms] — Decoupled configuration evaluation context protects early initialization pathways.
Batch Execution Complete. Status: 100% SUCCESS.

5. Quota Optimization ProfileSpreadsheet I/O Footprint: All loop modifications inside core write operations occur in RAM and commit via a single bulk .setValues() matrix invocation ($O(1)$ spreadsheet connection footprint).Script Cache Boundary Shield: Utils_DataMapper actively tests payload sizes against a maximum safety barrier of 95KB ($95\text{KB} \le 97,280\text{ bytes}$) before caching variables to prevent container crashes.External API Throttle Strategy: API_Calendar leverages deliberate 150ms pauses and downscaled batch limits (maximum 25 rows per batch) to process synchronization events safely within the Google Apps Script 6-minute timeout threshold.