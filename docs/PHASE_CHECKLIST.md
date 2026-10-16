# 🛡️ Phase Verification Checklist: MUIDS Lab Booking System Remediation

**Target System:** `Lab Oops OS` — Project 01 (`Smart Lab Booking System`)  
**Governance:** `docs/IMPLEMENTATION_PLAN.md`, `AGENTS.md`, `lab-oops-standards`, `gas-best-practices`  
**Automated Verification Tool:** `node scripts/verify_phase.js --phase <N>` (specified in Phase 0, executable in Phase 0+)

---

## 📋 Checklist Conventions & Rules

1. **Stable IDs:** Every requirement has a permanent ID (`P0-01`, `P1-01`, etc.) that is never reused or renumbered.
2. **Traceability:** Every row maps directly to an audit finding (`F-xx`), revision item (`R-xx`), or owner decision (`D-xx`).
3. **Evidence Requirement:** A row can ONLY be marked `☑ done` if it contains a concrete commit SHA, file path, and test log reference.
4. **No Silent Deletions:** Rows cannot be deleted. Any requirement marked `⊘ N/A` requires explicit owner approval and a documented reason.
5. **Review Protocol:** Independent reviewers or AI agents must verify rows using the commands listed under "How to verify".

**Legend:**
- ☐ `not started`
- ◐ `in progress`
- ☑ `done`
- ☒ `failed`
- ⊘ `N/A` (needs owner approval)

---

## Phase 0: Baseline, Safety, Call Graph & Setup

| ID | Requirement | Traces to | How to verify | Expected result | Evidence Level | Skill Applied | Status | Evidence | Verified By |
|---|---|---|---|---|---|---|---|---|---|
| `P0-01` | Dedicated working branch created from clean commit | Plan §2, R-16 | `git branch --show-current` | Output is `security/production-hardening` | static | gas-best-practices | ☐ | | |
| `P0-02` | Rollback commit hash recorded in docs and git tag created | Plan §2, R-16 | `git tag -l "pre-hardening-baseline"` | Tag exists pointing to baseline commit | static | gas-best-practices | ☐ | | |
| `P0-03` | Living audit ledger created classifying all 17 findings | F-01..F-17 | Inspect `docs/SECURITY_AUDIT.md` | All 17 findings classified with code refs | static | lab-oops-standards | ☐ | | |
| `P0-04` | Function call graph and exposure inventory generated | F-02, R-08 | Inspect `docs/ACCESS_CONTROL_MATRIX.md` | All 50 App_Script files inventoried into 5 categories | static | lab-oops-standards | ☐ | | |
| `P0-05` | Node test harness environment configured with Gas stubs | R-10 | `node test/run_tests.js` | Test harness boots without runtime errors | unit | gas-best-practices | ☐ | | |
| `P0-06` | Automated phase verification runner created | §3.2 | `node scripts/verify_phase.js --phase 0` | Exit code 0, JSON summary emitted | static | mattpocock/skills | ☐ | | |
| `P0-07` | Repo privacy & secret scan executed across git history | R-06, F-14 | `git log -S "<LOCAL_SPREADSHEET_ID>"` | Audit report of committed IDs delivered | static | lab-oops-standards | ☐ | | |
| `P0-08` | Staging Identity Spike executed across auth models | R-01 | Inspect `docs/IDENTITY_DECISION.md` | Evidence matrix for USER_DEPLOYING vs ACCESSING | staging | gas-best-practices | ☐ | | |
| `P0-09` | Skills and standards alignment documented | Plan §1 | Inspect `docs/IMPLEMENTATION_PLAN.md` §1 | 3 installed skills mapped with precedence | static | lab-oops-standards | ☐ | | |
| `P0-10` | Test fixtures sanitized from banned `@mahidol.edu` domain to `@mahidol.ac.th` | R-02, D-01, D-17 | Inspect `Health_UAT.js` | All fixture emails use `uat_tester@mahidol.ac.th` | static / unit | gas-best-practices | ☐ | | |

---

## Phase 1: Authentication, Fail-Closed Identity & RBAC Enforcement

| ID | Requirement | Traces to | How to verify | Expected result | Evidence Level | Skill Applied | Status | Evidence | Verified By |
|---|---|---|---|---|---|---|---|---|---|
| `P1-01` | Gatekeeper throws `AUTH_DENIED` on unauthenticated / unauthorized calls | F-01, R-01 | Unit test: `testGatekeeperThrowsOnUnauthorized()` | Throws typed error; does not return `{authorized: false}` | unit | lab-oops-standards | ☐ | | |
| `P1-02` | Server resolves caller identity solely via `Session.getActiveUser().getEmail()` | F-02, F-03 | grep `getEffectiveUser` in `Utils_Security.js` | Zero hits in active identity resolution path | static / unit | lab-oops-standards | ☐ | | |
| `P1-03` | Hardcoded superadmin email removed as identity fallback | F-03 | grep `ECOSYSTEM_SUPERADMIN` in `Utils_Security.js` identity resolver | Zero hits in caller email fallback | static | lab-oops-standards | ☐ | | |
| `P1-04` | DEV_MOCK_USER_EMAIL completely removed from `Utils_Security.js` as an impersonation vulnerability | F-03, D-16 | grep `DEV_MOCK_USER_EMAIL` in `Utils_Security.js` | Zero hits; mock impersonation path completely deleted | static | gas-best-practices | ☐ | | |
| `P1-05` | Domain whitelist strictly matches `@mahidol.ac.th`, `@student.mahidol.ac.th`, `@student.mahidol.edu` | R-02, D-01 | Unit test: `testDomainWhitelistLookalikes()` | Exact domain match; look-alikes (`@mahidol.edu`, `@evilmahidol.ac.th`) rejected | unit | lab-oops-standards | ☐ | | |
| `P1-06` | Pre-enforcement scan of `Users` sheet reports non-whitelisted domain count without PII | R-02 | Run pre-check utility in staging | Count of non-whitelisted emails reported | staging | gas-best-practices | ☐ | | |
| `P1-07` | Central `PERMISSIONS` table enforced in `Utils_Security.js` | R-03, D-02 | Unit test: `testPermissionsMatrixEnforcement()` | Allowed roles pass; unlisted roles fail | unit | lab-oops-standards | ☐ | | |
| `P1-08` | `Teacher` restricted to cancelling own bookings only; cannot cancel other teachers | R-03, D-02 | Unit test: `testTeacherCannotCancelOtherTeacherBooking()` | Throws `UNAUTHORIZED_ACTION` | unit | lab-oops-standards | ☐ | | |
| `P1-09` | `TA` holds identical approval authority to `LabTech` | R-03, D-02 | Unit test: `testTaCanApproveBooking()` | Approves successfully; permissions match LabTech | unit | lab-oops-standards | ☐ | | |
| `P1-10` | Non-public internal functions renamed with trailing underscore `_` | F-02, R-08 | grep `function rbacExecute` across `App_Script/` | Functions end with `_` or wrapped in API_Bridge | static | gas-best-practices | ☐ | | |
| `P1-11` | Read APIs enforce identity and data scoping | F-02, R-08 | Unit test: `testReadApiDataScoping()` | Teachers only receive own records; Admins see all | unit | lab-oops-standards | ☐ | | |
| `P1-12` | Public callable allowlist strictly verified | F-02, R-08 | `node scripts/verify_phase.js --phase 1` | All un-underscored functions match allowlist | static | gas-best-practices | ☐ | | |
| `P1-13` | Diagnostics gated behind Admin role and `ENABLE_DIAGNOSTICS` Script Property | F-04, R-07 | Unit test: `testDiagnosticsDisabledByDefault()` | Denied when flag false or caller non-admin | unit | lab-oops-standards | ☐ | | |
| `P1-14` | Secure Config Accessor implemented for Script Properties | R-07 | grep `PropertiesService.getScriptProperties` centralized | Single accessor in `Utils_Config.js` | static | gas-best-practices | ☐ | | |
| `P1-15` | `Main.doGet` admin route check signature fixed and enforced | F-10 | Inspect `Main.doGet` in `Main.js` | Signature matches `(email, roles)` and gates route | static / unit | lab-oops-standards | ☐ | | |
| `P1-16` | Bogus role rejection test (BRG-RTE.01) passes with authentic denial | F-01 | Unit test runner | Test passes with real `AUTH_DENIED` | unit | gas-best-practices | ☐ | | |
| `P1-17` | `getMainSpreadsheet()` eliminates silent fallback and throws `DATABASE_UNAVAILABLE` fail closed; `FALLBACK_SHEET_ID` removed | D-13 | Inspect `getMainSpreadsheet()` in `Utils_Config.js` | Throws typed error on missing ID; zero occurrences of `FALLBACK_SHEET_ID` | static / unit | gas-best-practices | ☐ | | |

---

## Phase 2: Booking Transaction Engine & Federated Data

| ID | Requirement | Traces to | How to verify | Expected result | Evidence Level | Skill Applied | Status | Evidence | Verified By |
|---|---|---|---|---|---|---|---|---|---|
| `P2-01` | `TX_COL` aligned with live `Bookings` header contract | F-08, R-05 | Unit test: `testHeaderContractMatch('Bookings')` | 100% column name match, zero index drift | unit | gas-best-practices | ☐ | | |
| `P2-02` | `docs/SCHEMA_CONTRACT.md` authored for all 10 tabs across 3 federated spreadsheets | R-05, D-05 | Inspect `docs/SCHEMA_CONTRACT.md` | Exact headers documented for Local Sheet, Master DB, and Timetable | static | lab-oops-standards | ☐ | | |
| `P2-03` | Cross-sheet data access helper implemented for Master DB with federated cache keys | R-05, D-03 | Unit test: `testCrossSheetReaderCacheKey()` | Keys contain spreadsheetId + tabName | unit | gas-best-practices | ☐ | | |
| `P2-04` | Master DB is strictly read-only; no write mutations exist | R-05 | grep `appendRow\|setValues` targeting Master DB tabs | Zero write operations | static | lab-oops-standards | ☐ | | |
| `P2-05` | `coreApproveBooking`, `coreRejectBooking`, `coreCancelBooking` implemented | F-08 | grep `coreApproveBooking` in `API_Write_Core.js` | Functions defined, exported, and callable | static / unit | gas-best-practices | ☐ | | |
| `P2-06` | Server generates UUID booking IDs via `Utilities.getUuid()` | F-05, F-17 | grep `Math.random` in booking generation | Zero hits; `Utilities.getUuid()` used | static | gas-best-practices | ☐ | | |
| `P2-07` | Atomic conflict detection (room, date, period) executed inside LockService | F-05, R-11 | Concurrency unit test: simulate collision | Second transaction rejected with structured error | unit | gas-best-practices | ☐ | | |
| `P2-08` | `SpreadsheetApp.flush()` executed before releasing LockService | R-11 | grep `flush()` before `releaseLock()` in write paths | Flush called in all write transactions | static | gas-best-practices | ☐ | | |
| `P2-09` | Optional lock fallback (`cb => cb()`) completely eliminated | F-09 | grep `typeof withLock` across `App_Script/` | Zero hits; LockService acquisition throws on timeout | static | gas-best-practices | ☐ | | |
| `P2-10` | 2 instructional days lead time + 24h cancel lock enforced; TALT universal bypass logged | F-05, R-09, D-07 | Unit test: `testLeadTimeAndCancelLock()` | Non-TALT rejected < 2 days / < 24h cancel; TALT bypass writes [URGENT_BYPASS] remark & log | unit | gas-best-practices | ☐ | | |
| `P2-11` | Persistent setup outage (`SetupHold`) blocks conflicting room bookings | Feature, Spec | Unit test: book slot during active SetupHold | Rejected; linked activity passes | unit | lab-oops-standards | ☐ | | |
| `P2-12` | Two-way approval-gated postponement reserves target slot and releases old slot atomically | R-04, D-04 | Unit test: `testTwoWayApprovalPostponementSwap()` | Teacher move requires TALT approve; TALT move requires Teacher approve; atomic swap inside lock | unit | lab-oops-standards | ☐ | | |
| `P2-13` | Rejection sets explicit `Denied` status and appends reason in chronological order downwards | F-11, D-19 | Unit test: `testRejectionPreservesReasonChronological()` | Status is `Denied`; reason appended to `Remark` downwards | unit | lab-oops-standards | ☐ | | |
| `P2-14` | Idempotency key cache prevents duplicate submissions on network retry | R-12 | Unit test: `testDuplicateSubmissionIdempotency()` | Second call returns cached original response | unit | gas-best-practices | ☐ | | |
| `P2-15` | Client-side strict "cart/checkout" ban refined | F-15 | Unit test: submit with teacher name "Carter" | Payload accepted without false positive | unit | gas-best-practices | ☐ | | |
| `P2-16` | Schema mapper throws on header mismatch instead of silent index fallback | F-16 | Unit test: map row with missing required header | Throws explicit descriptive error | unit | gas-best-practices | ☐ | | |
| `P2-17` | `LOG_COL` signature reconciled with `_writeLogEntry` | F-16 | Inspect `Telemetry.js` and `Utils_Schema.js` | Parameter count matches column count (7 columns) | static / unit | lab-oops-standards | ☐ | | |
| `P2-18` | `Index.html` include casing fixed (`JS_TALTView.html`) | F-08 | Inspect `Index.html` | Casing matches file system exactly | static | gas-best-practices | ☐ | | |
| `P2-19` | Email template keys resolvable in `SYSTEM_CONSTANTS` | F-08 | Unit test: `testGetEmailTemplateAllKeys()` | All template keys resolve without throwing | unit | gas-best-practices | ☐ | | |
| `P2-20` | Canonical teacher join implemented in `Utils_DataMapper.js` | D-15 | Unit test: `testCanonicalTeacherJoin()` | Session email resolves through `DisplayName` to timetable nickname | unit | gas-best-practices | ☐ | | |
| `P2-21` | `Stats` telemetry schema implemented with 12 structured columns | F-16, D-05 | Unit test: `testStatsSheetSchema()` | All 12 telemetry columns mapped and written accurately | unit | lab-oops-standards | ☐ | | |
| `P2-22` | On-behalf booking attribution parameters recorded and verified | D-11 | Unit test: `testOnBehalfAttribution()` | `SubmittedByUserID`, `TargetUserID`, `ConfirmUserId`, `AssignedTaltID` recorded in row | unit | lab-oops-standards | ☐ | | |
| `P2-23` | Teacher read access to Master Calendar permitted; edit/cancel restricted to own bookings | D-10 | Unit test: `testTeacherMasterCalendarRead()` | `ACTION_VIEW_ALL_BOOKINGS` allowed; modifying other bookings denied | unit | lab-oops-standards | ☐ | | |
| `P2-24` | User attributes dynamically derived; `hasCompletedTutorial` in localStorage; `PrimaryGrade` removed | D-18 | Inspect `Utils_Security.js` & frontend | `isHoD` & `Can_Edit_Config` derived dynamically; `PrimaryGrade` removed | static / unit | lab-oops-standards | ☐ | | |


---

## Phase 3: Data Consistency, Cache Tier & Calendar Sync

| ID | Requirement | Traces to | How to verify | Expected result | Evidence Level | Skill Applied | Status | Evidence | Verified By |
|---|---|---|---|---|---|---|---|---|---|
| `P3-01` | Full-range `getDataRange().setValues()` rewrites replaced by targeted cell updates | F-11 | grep `getDataRange\(\)\.setValues` across mutation endpoints | Zero whole-table overwrite calls | static | gas-best-practices | ☐ | | |
| `P3-02` | Google Calendar event creation preceded by duplicate lookup | F-11, R-14 | Unit test: `testCalendarDuplicateCheck()` | Look up existing event ID before calling createEvent | unit | gas-best-practices | ☐ | | |
| `P3-03` | Calendar event ID persisted immediately upon creation | F-11, R-14 | Unit test: `testCalendarEventIdPersistence()` | Event ID written to sheet in same transaction | unit | gas-best-practices | ☐ | | |
| `P3-04` | Booking cancellation automatically deletes / cancels linked Calendar event | F-11, R-14 | Unit test: `testCancelDeletesCalendarEvent()` | Linked calendar event deleted on booking cancel | unit | gas-best-practices | ☐ | | |
| `P3-05` | Calendar sync retry mechanism handles `ERROR:` rows with exponential backoff | F-11, R-14 | Unit test: `testCalendarSyncRetryBackoff()` | Failed rows retried up to max threshold | unit | gas-best-practices | ☐ | | |
| `P3-06` | Native Date objects in time cells formatted safely for `Asia/Bangkok` | F-11 | Unit test: parse date cell with native Date | Returns correct HH:mm string without NaN | unit | lab-oops-standards | ☐ | | |
| `P3-07` | Layer-2 `PropertiesService` snapshots expire via TTL and version key | F-12, R-13 | Unit test: `testLayer2CacheTtlExpiration()` | Expired snapshots return null and re-fetch | unit | gas-best-practices | ☐ | | |
| `P3-08` | `clearAllCaches` uses correct script-wide key pattern | F-12 | Inspect `Utils_Cache.js` | Keys cleared match script cache namespace | static / unit | gas-best-practices | ☐ | | |
| `P3-09` | Role and user profile cache TTL bounded to maximum acceptable revocation delay | R-13 | Inspect TTL constant in `Utils_Cache.js` | TTL <= 5 minutes (300 seconds) | static | lab-oops-standards | ☐ | | |
| `P3-10` | Cache is never used as authority for booking conflict detection | R-11 | Inspect `checkRoomCollision` code path | Reads live sheet data inside LockService | static | gas-best-practices | ☐ | | |

---

## Phase 4: Frontend Hardening, Formula Neutralization & Diagnostics Isolation

| ID | Requirement | Traces to | How to verify | Expected result | Evidence Level | Skill Applied | Status | Evidence | Verified By |
|---|---|---|---|---|---|---|---|---|---|
| `P4-01` | Formula injection neutralizer `sanitizeCell_` implemented | F-06 | Unit test: `testSanitizeCellFormulas()` | Values starting with `=`, `+`, `-`, `@`, tab prefixed with `'` | unit | gas-best-practices | ☐ | | |
| `P4-02` | All user-supplied inputs sanitized before sheet write operations | F-06 | grep sheet write paths for sanitization call | All dynamic values passed through `sanitizeCell_` | static | gas-best-practices | ☐ | | |
| `P4-03` | `innerHTML` concatenation eliminated in `JS_TALTView.html` | F-07 | Inspect `JS_TALTView.html` | DOM construction / `textContent` used | static | lab-oops-standards | ☐ | | |
| `P4-04` | `innerHTML` concatenation eliminated in `Modal_BatchAction.html` & other modals | F-07 | Inspect modal HTML files | Safe DOM population used | static | lab-oops-standards | ☐ | | |
| `P4-05` | HTML email template placeholder hydration escapes dynamic variables | F-07 | Unit test: `testHydrateTemplateEscapesHtml()` | `<script>` and `<img>` tags escaped in output | unit | gas-best-practices | ☐ | | |
| `P4-06` | UAT test suite prohibited from mutating production spreadsheet rows | F-04 | Inspect `Health_UAT.js` | Target spreadsheet forced to staging/mock copy | static / unit | gas-best-practices | ☐ | | |
| `P4-07` | Client test runners cannot invoke arbitrary server functions by name | F-04 | Inspect `Test_Runner.html` & `Diag_Console.html` | Dynamic function routing removed | static | gas-best-practices | ☐ | | |

---

## Phase 5: Consolidated Verification & End-to-End Sweeps

| ID | Requirement | Traces to | How to verify | Expected result | Evidence Level | Skill Applied | Status | Evidence | Verified By |
|---|---|---|---|---|---|---|---|---|---|
| `P5-01` | Automated static sweep: zero unchecked gatekeepers or client-supplied identities | All, §3.2 | `node scripts/verify_phase.js --phase 5` | Zero violations across all 50 files | static | gas-best-practices | ☐ | | |
| `P5-02` | End-to-end authorization matrix suite executed across all 5 roles | F-01..F-03 | Run test suite against staging | All 5 roles verify expected allow/deny behavior | staging | lab-oops-standards | ☐ | | |
| `P5-03` | Concurrent booking collision test executed | F-05, R-11 | Run parallel submission test | Exactly 1 booking succeeds; 1 fails cleanly | staging / unit | gas-best-practices | ☐ | | |
| `P5-04` | Full traceability matrix documented in `docs/TEST_RESULTS.md` | All | Inspect `docs/TEST_RESULTS.md` | F-01 through F-17 mapped to test logs | static | mattpocock/skills | ☐ | | |
| `P5-05` | Zero unresolved requirements in `PHASE_CHECKLIST.md` | §3.1 | `node scripts/verify_phase.js --phase 5` | All P0-P4 rows marked ☑ with evidence | static | mattpocock/skills | ☐ | | |

---

## Phase 6: Hardening, Script Properties Migration & Staging Deployment

| ID | Requirement | Traces to | How to verify | Expected result | Evidence Level | Skill Applied | Status | Evidence | Verified By |
|---|---|---|---|---|---|---|---|---|---|
| `P6-01` | All spreadsheet IDs, calendar ID, superadmin email migrated to Script Properties | F-14, R-07 | grep hardcoded IDs in `App_Script/` | Zero hits; all read via `Utils_Config.get()` | static | gas-best-practices | ☐ | | |
| `P6-02` | Git history scanned for exposed IDs and documented | F-14, R-06 | Inspect `docs/SECURITY_AUDIT.md` | Scan report delivered; owner decision recorded | static | lab-oops-standards | ☐ | | |
| `P6-03` | Minimal OAuth scopes declared in `appsscript.json` | F-13, R-15 | Inspect `appsscript.json` | Explicit scopes defined; minimal privilege | static | gas-best-practices | ☐ | | |
| `P6-04` | XFrameOptionsMode locked to DEFAULT; Google Site iframe embedding rejected; ALLOWALL eliminated | F-13, D-20 | Inspect `Main.js` HtmlOutput | `ALLOWALL` replaced with default mode; iframe embedding blocked | static | gas-best-practices | ☐ | | |
| `P6-05` | Misleading "AUDIT: Cycle 13 Cleared" headers and dead code removed | F-17 | grep "AUDIT: Cycle" across files | Zero hits; dead files archived/removed | static | lab-oops-standards | ☐ | | |
| `P6-06` | Universal response envelope `Result<T>` verified across all callable endpoints | AGENTS.md | `node scripts/verify_phase.js --phase 6` | 100% of callable endpoints return Result<T> | static | lab-oops-standards | ☐ | | |
| `P6-07` | Deployment and rollback manual documented in `docs/DEPLOYMENT_ROLLBACK.md` | R-16 | Inspect `docs/DEPLOYMENT_ROLLBACK.md` | Step-by-step deploy & rollback procedures | static | gas-best-practices | ☐ | | |
| `P6-08` | Final staging deployment smoke-test executed and signed off | §6 | Smoke-test submit -> approve -> calendar -> cancel | All flows pass on staging | staging / owner | lab-oops-standards | ☐ | | |

---

## 🔍 Independent Review Protocol: How a Reviewer Verifies a Phase

When an independent AI agent or human auditor reviews a completed phase:

1. **Run Automated Verification:** Execute `node scripts/verify_phase.js --phase <N>` from the repository root. Ensure exit code is `0`.
2. **Examine Evidence Links:** Open `docs/PHASE_CHECKLIST.md` and verify that every row marked `☑ done` contains a non-empty `Evidence` field linking to a commit SHA, file path, or test log.
3. **Spot-Check Code:** Pick at least three rows marked `☑ done` at random and open the referenced source files to confirm the requirement is genuinely satisfied in the code.
4. **Scope-Creep & Anti-Gaming Inspection:**
   - Inspect the git diff: `git diff <baseline_sha>..HEAD --stat`.
   - Confirm only files planned for this phase were altered.
   - Verify that no test assertions were weakened, commented out, or bypassed.
   - Verify that no checklist rows were deleted (rows may only be marked `⊘ N/A` with owner approval).
5. **Sign Off:** Record name/ID and timestamp under the `Verified By` column.
