# 🛡️ Executive Security Audit Ledger: Findings & Remediation Inventory (F-01 … F-18)

**Target System:** `Lab Oops OS` — Project 01 (`Smart Lab Booking System`)  
**Document Status:** Living Security Audit Ledger (Formalized in Phase 0 / v1.4.0b)  
**Governing Documents:** [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md), [`PHASE_CHECKLIST.md`](./PHASE_CHECKLIST.md), [`SCHEMA_CONTRACT.md`](./SCHEMA_CONTRACT.md), [ADR-0002](./adr/0002-superadmin-pin-removal-and-standard-deviations.md), [ADR-0003](./adr/0003-postponement-linked-row-model.md)  
**Classification Rules:** All findings are classified as **Confirmed**, **Conditional**, or **Unverified** based on static analysis of the baseline codebase (`b984891`).

---

## 1. Summary of Vulnerabilities & Remediation Mapping

| Finding ID | Title / Vulnerability Class | Severity | Classification | Target Phase | Checklist ID | Status |
|:---:|---|:---:|:---:|:---:|:---:|:---:|
| **F-01** | Client-Supplied Identity & Broken Gatekeeper | **Critical** | Confirmed | Phase 1 | `P1-01`, `P1-02`, `P1-16` | Remediation Scheduled |
| **F-02** | Unauthenticated Read Endpoints & Public Function Exposure | **High** | Confirmed | Phase 1 | `P1-03`, `P1-04`, `P1-05`, `P1-06` | Remediation Scheduled |
| **F-03** | Fail-Open Identity Fallback to SuperAdmin | **Critical** | Confirmed | Phase 1 | `P1-02`, `P1-25`, ADR-0002 | Remediation Scheduled |
| **F-04** | Diagnostic Test Suite Production Mutation & Arbitrary Code Exec | **High** | Confirmed | Phase 1, Phase 4 | `P1-15`, `P4-06`, `P4-07` | Remediation Scheduled |
| **F-05** | Double-Booking Concurrency Race Condition | **High** | Confirmed | Phase 2 | `P2-08`, `P2-09`, `P2-10` | Remediation Scheduled |
| **F-06** | CSV / Spreadsheet Formula Injection (CWE-1236) | **Medium** | Confirmed | Phase 4 | `P4-01`, `P4-02` | Remediation Scheduled |
| **F-07** | Stored Cross-Site Scripting (XSS) via UI `innerHTML` Interpolation | **Medium** | Confirmed | Phase 4 | `P4-03`, `P4-04`, `P4-05` | Remediation Scheduled |
| **F-08** | Broken Write-API Wiring Dropping Server Identity | **High** | Confirmed | Phase 2 | `P2-05`, `P2-06` | Remediation Scheduled |
| **F-09** | Uncontrolled Postponement & Reschedule Race | **High** | Confirmed | Phase 2 | `P2-12`, `P2-25`, ADR-0003 | Remediation Scheduled |
| **F-10** | Route Parameter Spoofing & Admin Route Bypass | **High** | Confirmed | Phase 1 | `P1-14` | Remediation Scheduled |
| **F-11** | Destructive Full-Sheet ArrayFormula Erasure (`setValues`) | **High** | Confirmed | Phase 3 | `P3-01`, `P3-02`, `P3-03` | Remediation Scheduled |
| **F-12** | 3-Tier Cache Desynchronization & Stale Permissions | **Medium** | Confirmed | Phase 3 | `P3-07`, `P3-08`, `P3-09`, `P3-10` | Remediation Scheduled |
| **F-13** | Clickjacking via `ALLOWALL` & Excessive OAuth Scope Permissiveness | **High** | Confirmed | Phase 1, Phase 6 | `P1-23`, `P6-03` | Remediation Scheduled |
| **F-14** | Hardcoded Spreadsheet, Calendar IDs & Personal Emails in Source | **Medium** | Confirmed | Phase 1 | `P1-18`, `P0-07`, `P6-01` | Remediation Scheduled |
| **F-15** | Monitored Batch Submission Session Severance | **Medium** | Confirmed | Phase 2 | `P2-11` | Remediation Scheduled |
| **F-16** | Silent Index Fallback Causing Silent Column Data Corruption | **High** | Confirmed | Phase 2 | `P2-01`, `P2-02` | Remediation Scheduled |
| **F-17** | Deceptive Audit Headers & Dead Unmaintained Sandbox Artifacts | **Low** | Confirmed | Phase 6 | `P6-05` | Remediation Scheduled |
| **F-18** | Client-Side Hardcoded Admin PIN (`2026`) in HTML Source | **High** | Confirmed | Phase 1 | `P1-24`, ADR-0002 | Remediation Scheduled |

---

## 2. Detailed Vulnerability Dossiers

### F-01: Client-Supplied Identity & Broken Gatekeeper
* **Root Cause:** Client-side scripts pass caller email or user object as payload parameters. Endpoints trust parameters instead of resolving `Session.getActiveUser().getEmail()`. In addition, unauthorized calls return `{ authorized: false }` or `{ ok: false }` rather than throwing `AUTH_DENIED`, allowing execution to continue in unhardened handlers.
* **Code Reference:** `App_Script/API_Bridge.js`, `App_Script/Utils_Security.js` (`withGatekeeper`).
* **Exploit Scenario:** An attacker intercepts or crafts client-side `google.script.run` RPC invocations and provides any teacher or admin email in the argument payload, executing unauthorized actions.
* **Remediation:** Remove all client-supplied email arguments. `withGatekeeper` must independently resolve caller session email on the server, perform fail-closed validation, and throw an explicit `AUTH_DENIED` exception upon any violation.
* **Verification Test:** `testGatekeeperThrowsOnUnauthorized()`, `testClientSuppliedIdentityIgnored()`.

### F-02: Unauthenticated Read Endpoints & Public Function Exposure
* **Root Cause:** Read endpoints (`getWeeklySchedule`, `getBookingDetails`, `getLabList`, etc.) and internal utility/write functions omit gatekeeper wrappers and lack trailing underscores (`_`). In Google Apps Script, any top-level function without a trailing underscore is exposed as a public RPC callable via `google.script.run`.
* **Code Reference:** `App_Script/API_Read_Aggregator.js`, `App_Script/API_Read_Lab.js`, `App_Script/API_Write_Core.js`.
* **Exploit Scenario:** An unauthorized user (or external account if improperly scoped) calls internal functions like `coreApproveBooking` directly via the browser console, completely bypassing UI controls and `API_Bridge.js`.
* **Remediation:** Append trailing underscore `_` to all internal private helper functions. Route all client-callable actions through an explicit allowlist in `API_Bridge.js` wrapped in `withGatekeeper`.
* **Verification Test:** `testInternalFunctionsHaveUnderscore()`, `testPublicFunctionAllowlist()`.

### F-03: Fail-Open Identity Fallback to SuperAdmin
* **Root Cause:** In `Utils_Security.js`, when `Session.getActiveUser().getEmail()` fails to resolve (or returns an empty string), fallback logic defaulted to the SuperAdmin identity for "development convenience".
* **Code Reference:** `App_Script/Utils_Security.js` (`getActorEmailSafe`).
* **Exploit Scenario:** Any unauthenticated user or external caller whose active email is empty receives instant, full SuperAdmin privileges.
* **Remediation:** Enforce **fail-closed** identity resolution. If caller email is blank, unresolvable, or not in the 3 institutional domains, terminate immediately with `AUTH_DENIED`. SuperAdmin privileges are strictly evaluated against the Script Property `SUPERADMIN_EMAILS` only after a valid active email is resolved (ADR-0002).
* **Verification Test:** `testUnresolvedIdentityFailsClosed()`, `testSuperAdminRequiresResolvedEmail()`.

### F-04: Diagnostic Test Suite Production Mutation & Arbitrary Code Exec
* **Root Cause:** `Health_UAT.js` test routines execute against active production spreadsheets without isolation, appending and modifying real rows. Additionally, `Test_Runner.html` and `Diag_Console.html` include dynamic reflection runners that execute server functions by string name.
* **Code Reference:** `App_Script/Health_UAT.js`, `App_Script/Test_Runner.html`, `App_Script/Diag_Console.html`.
* **Exploit Scenario:** Running UAT tests pollutes production sheets with dummy bookings. Dynamic reflection in HTML allows arbitrary function execution.
* **Remediation:** Quarantine diagnostic tools: gate all diagnostics behind `ENABLE_DIAGNOSTICS === 'true'` Script Property AND Admin role check. Point UAT target sheets strictly to sandbox/mock copies. Remove dynamic reflection runners.
* **Verification Test:** `testDiagnosticsGatedBehindScriptProperty()`, `testHealthUatDoesNotMutateProduction()`.

### F-05: Double-Booking Concurrency Race Condition
* **Root Cause:** High-concurrency slot reservations check slot availability using in-memory or cached data without holding an exclusive lock, and release locks prior to calling `SpreadsheetApp.flush()`. Furthermore, client-side generates IDs rather than atomic server UUIDs.
* **Code Reference:** `App_Script/API_Write_Booking.js`, `App_Script/Utils_Core.js`.
* **Exploit Scenario:** Two teachers submit the same lab period simultaneously. Both requests read the slot as available concurrently; both write bookings, resulting in overlapping confirmed bookings.
* **Remediation:** Acquire `LockService.getScriptLock()` with a 15-second bounded wait; read live sheet data inside the lock; generate server UUID (`Utilities.getUuid()`); execute `SpreadsheetApp.flush()` before releasing the lock in a `finally` block.
* **Verification Test:** `testConcurrentBookingLockService()`, `testFlushBeforeUnlock()`.

### F-06: CSV / Spreadsheet Formula Injection (CWE-1236)
* **Root Cause:** User-submitted text fields (`LabTitle`, `Remark`, `Reason`, `Section`) are written directly to Google Sheets cells without sanitizing leading formula trigger characters (`=`, `+`, `-`, `@`, `\t`, `\r`).
* **Code Reference:** `App_Script/API_Write_Booking.js`, `App_Script/API_Write_Outage.js`.
* **Exploit Scenario:** A user submits a booking with title `=IMPORTXML(...)` or `=IMAGE(...)`. When an administrator or technician opens the spreadsheet, the formula executes within the viewer's security context, exfiltrating data or mounting phishing attacks.
* **Remediation:** Route all user-supplied text writes through `sanitizeCell_()` which prepends an apostrophe (`'`) if the trimmed value begins with an injection trigger character.
* **Verification Test:** `testSanitizeCellPrefixesFormulaTriggers()`.

### F-07: Stored Cross-Site Scripting (XSS) via UI `innerHTML` Interpolation
* **Root Cause:** UI templates and dynamic modals construct DOM elements by directly interpolating user input strings (`LabTitle`, `Teacher`, `Remark`) into `innerHTML`. HTML email templates in `API_Notification.js` also perform raw string replacement.
* **Code Reference:** `App_Script/JS_TALTView.html`, `App_Script/Modal_BatchAction.html`, `App_Script/API_Notification.js`.
* **Exploit Scenario:** Malicious script tags or event handlers embedded in a booking's title execute in the browser of teachers or technicians viewing the dashboard.
* **Remediation:** Replace `innerHTML` with safe DOM APIs (`textContent`, `createElement`, `setAttribute`). In HTML notification templates, HTML-encode all dynamic placeholder variables.
* **Verification Test:** `testHtmlNotificationEscapesPayloads()`, `testNoRawInnerHtmlInModals()`.

### F-08: Broken Write-API Wiring Dropping Server Identity
* **Root Cause:** Functions in `API_Write_Core.js` (`coreApproveBooking`, `coreRejectBooking`, `coreCancelBooking`) dropped the server-verified actor identity and attempted to accept client-passed usernames or bypassed audit attribution.
* **Code Reference:** `App_Script/API_Write_Core.js`.
* **Exploit Scenario:** Audit trail in `Bookings` records incorrect or blank `ConfirmUserId` and `ConfirmedBy`.
* **Remediation:** Pass server-resolved session user explicitly through the execution context to all write functions.
* **Verification Test:** `testWriteCorePreservesActorIdentity()`.

### F-09: Uncontrolled Postponement & Reschedule Race
* **Root Cause:** Postponement was implemented as an in-place mutation of the existing row, leaving no record of the proposed slot, creating concurrency race windows where either the original or new slot could be double-booked, and providing no clean rejection or rollback path.
* **Code Reference:** `App_Script/API_Write_Booking.js`.
* **Exploit Scenario:** A postponement request leaves the target slot unreserved; another teacher books it before approval. If declined, the original booking details are corrupted.
* **Remediation:** Adopt ADR-0003: Linked-row reciprocal approval workflow. Original row `O` and proposed row `N` both block their slots (`POSTPONE_PENDING_TALT` or `POSTPONE_PENDING_TEACHER`). Approval finalizes `N` (`APPROVED`) and marks `O` (`POSTPONED`). Denial cancels `N` and restores `O`. If the earlier slot start time is reached, auto-revert occurs without timeout.
* **Verification Test:** `testPostponementLinkedRowModel()`, `testPostponementAutoRevertAtSlotStart()`.

### F-10: Route Parameter Spoofing & Admin Route Bypass
* **Root Cause:** `Main.js` `doGet(e)` contained signature mismatches when invoking `isAdmin(email, roles)` and failed to reject unauthorized query parameter routing, permitting unauthorized access to administrative views.
* **Code Reference:** `App_Script/Main.js`.
* **Exploit Scenario:** Regular users append `?page=admin` or `?p=diag` and view administrative controls or trigger privileged handlers.
* **Remediation:** Harmonize route signature: resolve caller email and canonical role on the server; evaluate role against `PERMISSIONS`; serve `UI_Unauthorized.html` on permission denial.
* **Verification Test:** `testDoGetAdminRouteFailsClosed()`.

### F-11: Destructive Full-Sheet ArrayFormula Erasure (`setValues`)
* **Root Cause:** Legacy write operations retrieved entire tab data ranges via `getDataRange().getValues()`, mutated the JavaScript matrix, and wrote everything back with `setValues()`. This overwrote header formulas (`=ARRAYFORMULA`), destroyed cell notes, formatting, and wiped concurrent modifications made by other users.
* **Code Reference:** `App_Script/Utils_Core.js`, `App_Script/API_Write_Booking.js`.
* **Exploit Scenario:** Submitting or updating a single booking strips all array formulas from the `Bookings` sheet, breaking automatic calendar and timetable lookups.
* **Remediation:** Replace table rewrites with targeted row updates: `sheet.appendRow()` for insertions, and `sheet.getRange(row, col).setValue()` (or minimal contiguous ranges) for status/field updates.
* **Verification Test:** `testTargetedRowWritesPreserveFormulas()`.

### F-12: 3-Tier Cache Desynchronization & Stale Permissions
* **Root Cause:** Layer 2 `PropertiesService` snapshots lacked TTL expiration or cache versioning. `clearAllCaches()` cleared properties across multiple namespaces or failed to invalidate Layer 1 `CacheService`.
* **Code Reference:** `App_Script/Utils_Cache.js`.
* **Exploit Scenario:** A user's role is updated or revoked in Master DB, but stale Cache/Properties continue granting access indefinitely.
* **Remediation:** Implement versioned cache keys with strict TTLs (Role lookup ≤ 5 minutes). Invalidate both CacheService and PropertiesService entries synchronously on mutation.
* **Verification Test:** `testCacheInvalidationOnRoleRevocation()`.

### F-13: Clickjacking via `ALLOWALL` & Excessive OAuth Scope Permissiveness
* **Root Cause:** `Main.js` set `XFrameOptionsMode.ALLOWALL` in three locations, permitting third-party iframe embedding. `appsscript.json` lacked explicit minimal OAuth scopes, allowing GAS to prompt for overly broad Google Drive / Sheet permissions.
* **Code Reference:** `App_Script/Main.js`, `App_Script/appsscript.json`.
* **Exploit Scenario:** Malicious external site embeds the Lab Booking portal in a transparent iframe, tricking authenticated teachers into clicking hidden action buttons (Clickjacking).
* **Remediation:** Replace `ALLOWALL` with `HtmlService.XFrameOptionsMode.DEFAULT` (`SAMEORIGIN`). Deploy as Standalone Web App URL (no Google Site embedding). Restrict `oauthScopes` in `appsscript.json` to minimal required services.
* **Verification Test:** `testNoAllowAllInHtmlOutput()`, `testMinimalOAuthScopesDeclared()`.

### F-14: Hardcoded Spreadsheet, Calendar IDs & Personal Emails in Source
* **Root Cause:** 44-character Google Spreadsheet IDs, Google Calendar resource email IDs, and developer personal email addresses were hardcoded directly in script files.
* **Code Reference:** `App_Script/Utils_Config.js`, `App_Script/API_Calendar.js`, `App_Script/Utils_Security.js`.
* **Exploit Scenario:** Public repository exposure exposes internal school infrastructure IDs and personal contact addresses.
* **Remediation:** Migrate all IDs and privileged email lists to Google Apps Script `PropertiesService.getScriptProperties()` (`LOCAL_SPREADSHEET_ID`, `MASTER_DB_ID`, `TIMETABLE_2026_ID`, `CALENDAR_ID`, `SUPERADMIN_EMAILS`). Scan git history to ensure no plain secrets remain.
* **Verification Test:** `testNoHardcodedIdsInAppScript()`.

### F-15: Monitored Batch Submission Session Severance
* **Root Cause:** `monitoredBatchSubmit` in `API_Bridge.js` detached or dropped the `session` context before delegating to batch handlers, preventing proper attribution in telemetry and audit logs.
* **Code Reference:** `App_Script/API_Bridge.js`.
* **Exploit Scenario:** Batch submissions appear in `Logs` and `Stats` as unassigned or anonymous transactions.
* **Remediation:** Maintain session context immutability throughout the RPC pipeline; ensure `session.userId` and `session.role` are propagated to batch processors.
* **Verification Test:** `testBatchSubmitPreservesAuditAttribution()`.

### F-16: Silent Index Fallback Causing Silent Column Data Corruption
* **Root Cause:** Schema readers caught missing header exceptions and fell back to hardcoded 0-based column indices. If a column was inserted, renamed, or reordered in Google Sheets, the script silently read or wrote data into the wrong columns without throwing an error.
* **Code Reference:** `App_Script/Utils_Schema.js`, `App_Script/Utils_DataMapper.js`.
* **Exploit Scenario:** A technician inserts a notes column in `Bookings`. The script continues running, writing `Status` into `Remark` and corrupting database integrity.
* **Remediation:** Eliminate silent fallback. Read Row 1 headers dynamically (trimmed and case-insensitive); throw structured `SCHEMA_HEADER_MISMATCH` if any required header is missing.
* **Verification Test:** `testSchemaThrowsOnMissingHeader()`.

### F-17: Deceptive Audit Headers & Dead Unmaintained Sandbox Artifacts
* **Root Cause:** Legacy files contained misleading comment headers claiming "AUDIT: Cycle 13 Cleared" despite containing major vulnerabilities. Unused sandbox scripts (`Main_Dev_Sandbox.js`) lingered in the source directory.
* **Code Reference:** Multiple files in `App_Script/`.
* **Exploit Scenario:** Misleads developers and automated tools into assuming files are verified and secure.
* **Remediation:** Remove misleading headers; archive or delete dead files and unreferenced test sandboxes.
* **Verification Test:** `testNoMisleadingAuditHeaders()`.

### F-18: Client-Side Hardcoded Admin PIN (`2026`) in HTML Source
* **Root Cause:** `Index.html` listened for `Ctrl + Shift + Q` (or `Cmd + Shift + Q`) and prompted for a hardcoded numeric PIN `2026` in client-side JavaScript to unlock administrative tabs.
* **Code Reference:** `App_Script/Index.html`, `App_Script/JS_Header.html`.
* **Exploit Scenario:** Any user opening browser Developer Tools / Source tab inspects the JavaScript, discovers PIN `2026`, and bypasses frontend access gates.
* **Remediation:** Adopt ADR-0002: Completely delete the client-side PIN check from `Index.html`. The keyboard shortcut triggers a server-side permission check (`ACTION_IMPERSONATE_PREVIEW` / `ACTION_EDIT_CONFIG`). The admin UI is rendered only if the server confirms the caller has `Role === 'Admin'` or SuperAdmin status.
* **Verification Test:** `testNoClientSideAdminPinInHtml()`.

---

## 3. Revisions Traceability Matrix (R-01 … R-16)

| Revision | Architectural Scope | Primary Deliverable / Implementation Detail |
|:---:|---|---|
| **R-01** | Identity Model Clarity | Phase 0 Identity Spike (`docs/IDENTITY_DECISION.md`) evaluating 3 domains. |
| **R-02** | Institutional Domain Restriction | Strict whitelist: `@mahidol.ac.th`, `@student.mahidol.ac.th`, `@student.mahidol.edu`. |
| **R-03** | Canonical Role $\times$ Action Matrix | Declarative `PERMISSIONS` table in `Utils_Security.js`; all actions verified. |
| **R-04** | Two-Way Approval Postponement | ADR-0003 linked-row state machine with reciprocal approval and auto-revert. |
| **R-05** | Federated Cross-Sheet Architecture | 12 consumed tabs across 3 spreadsheets; `SCHEMA_CONTRACT.md` and `contract.json`. |
| **R-06** | Public Repository Sanitation | Zero plain secrets/IDs in docs or history; placeholder convention used throughout. |
| **R-07** | Script Properties Secret Storage | Centralized `Utils_Config.get()` accessing Script Properties in Phase 1. |
| **R-08** | Function Privatization & Allowlist | Trailing underscore `_` for internal functions; allowlist in `API_Bridge.js`. |
| **R-09** | Lead Time & Cancellation Rules | 2 instructional days lead time; 24h cancel/postpone lock; audited TALT urgent bypass. |
| **R-10** | Two-Tier Test Strategy | Offline Node.js unit test harness (`test/gas-stubs.js`) + Staging Apps Script copy. |
| **R-11** | Concurrency Lock Reliability | `LockService` bounded wait; `SpreadsheetApp.flush()` before release; structured retry error. |
| **R-12** | Client Request Idempotency | Client request UUID cached in `CacheService` (6-hour TTL) to prevent duplicate submission. |
| **R-13** | Cache Synchronization & Invalidation | Synchronous cache eviction across Layer 1 and Layer 2 on write mutations. |
| **R-14** | Resilient Google Calendar Sync | Calendar event sync with `ERROR:<code>` failure tagging and retry eligibility. |
| **R-15** | Minimal OAuth Scopes | Explicit scopes declared in `appsscript.json`; eliminate wildcards. |
| **R-16** | Git Isolation & Rollback Baseline | Tag `pre-hardening-baseline` on commit `b984891`; branch `security/production-hardening`. |
