# 🛡️ Phase Verification Checklist: MUIDS Lab Booking System Remediation (v1.4.0b)

**Target System:** `Lab Oops OS` — Project 01 (`Smart Lab Booking System`)
**Governance:** [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md), `AGENTS.md`, `lab-oops-standards`, `gas-best-practices`, `setup-matt-pocock-skills`
**Automated Verification Tool:** `node scripts/verify_phase.js --phase <N>`
**Last synchronised with the plan:** 2026-10-19 (rev. 2, 123 checklist rows)

---

## 📋 Conventions & Rules

1. **Stable IDs.** Every requirement has a permanent ID that is never reused or renumbered. A requirement that moves to another phase keeps its ID, is marked `⊘` with the reason *"moved to <new ID> (owner approved)"*, and the new row carries the work.
2. **Traceability.** Every row maps to a finding (`F-xx`), revision (`R-xx`) or decision (`D-xx`) in the plan's ledger.
3. **Evidence.** A row may be `☑ done` only with a commit SHA, file path and test-log reference.
4. **No silent deletions.** `⊘ N/A` needs owner approval and a reason.
5. **Review.** Independent reviewers use the commands in "How to verify".

**Legend:** ☐ not started · ◐ in progress · ☑ done · ☒ failed · ⊘ N/A or moved (owner approval recorded)

---

## Phase 0: Baseline, Safety, Identity Spike, Tooling & Hygiene

| ID | Requirement | Traces to | How to verify | Expected result | Evidence Level | Skill Applied | Status | Evidence | Verified By |
|---|---|---|---|---|---|---|---|---|---|
| `P0-01` | Dedicated working branch created from `main` | Plan §3, R-16 | `git branch --show-current` | `security/production-hardening` | static | gas-best-practices | ☐ | | |
| `P0-02` | Rollback tag created **on the explicit baseline SHA** (not HEAD) and pushed | R-16, D-34 | `git rev-parse pre-hardening-baseline^{commit}` | Equals the full SHA of baseline `b984891` | static | gas-best-practices | ☐ | | |
| `P0-03` | Living audit ledger created, classifying F-01 … F-18 | F-01..F-18 | Inspect `docs/SECURITY_AUDIT.md` | All findings classified with code refs | static | setup-matt-pocock-skills | ☐ | | |
| `P0-04` | Function call graph and exposure inventory generated | F-02, R-08 | Inspect `docs/ACCESS_CONTROL_MATRIX.md` | All 50 files inventoried into 5 categories | static | setup-matt-pocock-skills | ☐ | | |
| `P0-05` | Node test harness with GAS stubs | R-10 | `node test/run_tests.js` | Boots without errors | unit | gas-best-practices | ☐ | | |
| `P0-06` | Automated verification runner created | Plan §4.1 | `node scripts/verify_phase.js --phase 0` | Exit 0, summary emitted | static | setup-matt-pocock-skills | ☐ | | |
| `P0-07` | Secret/ID scan of **full git history using a pattern** (not a placeholder string) | R-06, F-14, D-34 | Scanner or `git log -p --all` filtered by the 44-character Google ID pattern and `@group.calendar.google.com` | Report of counts only (no values) delivered *(corrected 2026-10-19)* | static | lab-oops-standards | ☐ | | |
| `P0-08` | Staging Identity Spike executed | R-01, D-06 | Inspect `docs/IDENTITY_DECISION.md` | Evidence matrix per model/access setting | staging | gas-best-practices | ☐ | | |
| `P0-09` | Skills and standards mapping documented, rule files verified to exist | Plan §1 | Inspect plan §1 and list each cited rule path | Every cited rule file exists | static | lab-oops-standards | ☐ | | |
| `P0-10` | Test fixtures moved from banned `@mahidol.edu` to `uat_tester@mahidol.ac.th` | R-02, D-01, D-17 | `git grep "@mahidol.edu" -- App_Script` | Zero hits in fixtures | static / unit | gas-best-practices | ☐ | | |
| `P0-11` | At branch creation, `App_Script/` is unchanged since the baseline | R-16 | `git diff --stat <baseline> HEAD -- App_Script` | Empty output | static | gas-best-practices | ☐ | | |
| `P0-12` | `main` protected (PR required, verify check required, no force-push); GitHub secret scanning and push protection enabled | D-34 | Owner screenshot or `gh api` result (redacted) | Settings enabled | owner-manual | gas-best-practices | ☐ | | |
| `P0-13` | CI job runs the pattern scan on every PR | D-34 | Inspect workflow file | Job present and passing | static | gas-best-practices | ☐ | | |
| `P0-14` | Docs lint: no `file:///`, no `C:\`, no 44-character IDs, tab counts match the contract | D-34 | `node scripts/verify_phase.js --phase 0` | Zero violations | static | setup-matt-pocock-skills | ☐ | | |
| `P0-15` | Spike acceptance criteria and disqualifiers (D1–D8) written **before** the first test run | D-33 | Inspect `IDENTITY_DECISION.md` history | Criteria committed before results | static | gas-best-practices | ☐ | | |
| `P0-16` | Spike evidence redacted (domain + pass/fail only), dedicated test accounts, probe undeployed after use | D-33, D-09 | Inspect evidence and deployment list | No emails committed; probe removed | staging / owner | gas-best-practices | ☐ | | |
| `P0-17` | Owner-run, read-only header dump of all 12 consumed tabs; distinct `Status`, `BellType`, `RoomType` and `Users.Role` values with counts (no PII); array-formula report | D-05, D-36, D-42 | Inspect `schema/` output vs `SCHEMA_CONTRACT.md` | Contract matches live headers; distinct values recorded; or diff resolved | staging / owner | lab-oops-standards | ☐ | | |
| `P0-18` | Isolated DEV copies of Master DB 2026 and Timetable 2026 exist; production Master DB is never modified | D-14, D-44 | Owner verification | Confirmed by Owner (2026-10-21); isolated DEV copies of all Google Sheets exist | staging / owner | gas-best-practices | ☑ | Owner statement in AGY session, 2026-10-21 (no IDs) | |
| `P0-19` | Spike account-coverage matrix committed; unverified accounts marked best-effort; zero emails in committed docs | D-33, D-44 | Inspect `docs/IDENTITY_DECISION.md` | Account coverage table committed; no emails exposed | static | setup-matt-pocock-skills | ☐ | | |

---

## Phase 1: Authentication, Fail-Closed Identity, RBAC, Configuration & Cross-Sheet Reader

| ID | Requirement | Traces to | How to verify | Expected result | Evidence Level | Skill Applied | Status | Evidence | Verified By |
|---|---|---|---|---|---|---|---|---|---|
| `P1-01` | Gatekeeper throws `AUTH_DENIED` on unauthenticated/unauthorised calls | F-01, R-01 | Unit test `testGatekeeperThrowsOnUnauthorized()` | Typed error, never `{authorized:false}` | unit | gas-best-practices | ☐ | | |
| `P1-02` | Caller identity resolved solely via `Session.getActiveUser().getEmail()` | F-02, F-03 | grep `getEffectiveUser` in `Utils_Security.js` | Zero hits in the identity path | static / unit | gas-best-practices | ☐ | | |
| `P1-03` | Hardcoded superadmin removed as an identity fallback and as an automatic `admin` role | F-03, D-26, ADR-0002 | grep `ECOSYSTEM_SUPERADMIN` | Zero hits in identity resolution | static | lab-oops-standards | ☐ | | |
| `P1-04` | `DEV_MOCK_USER_EMAIL` code path deleted | F-03, D-16 | grep `DEV_MOCK_USER_EMAIL` across `App_Script/` | Zero hits | static | gas-best-practices | ☐ | | |
| `P1-05` | Domain whitelist is exact for the three domains | R-02, D-01 | Unit test `testDomainWhitelistLookalikes()` | Look-alikes (`@mahidol.edu`, `@evilmahidol.ac.th`, `x@y@mahidol.ac.th`) rejected | unit | lab-oops-standards | ☐ | | |
| `P1-06` | Pre-enforcement audit reports counts of `Users` rows outside the whitelist (no PII) | R-02 | Run audit on staging via the reader (`P1-19`) | Count reported | staging | gas-best-practices | ☐ | | |
| `P1-07` | Central `PERMISSIONS` table enforced | R-03, D-10 | Unit test `testPermissionsMatrixEnforcement()` | Every cell of plan §2.1 behaves as specified | unit | lab-oops-standards | ☐ | | |
| `P1-08` | Teacher cannot cancel another teacher's booking | R-03, D-02 | Unit test `testTeacherCannotCancelOtherTeacherBooking()` | Throws **`AUTH_DENIED`** | unit | lab-oops-standards | ☐ | | |
| `P1-09` | `TA` has identical approval authority to `LabTech` | R-03, D-03 | Unit test `testTaCanApproveBooking()` | Same results as `LabTech` | unit | lab-oops-standards | ☐ | | |
| `P1-10` | Internal functions renamed with trailing `_` | F-02, R-08 | grep `function rbacExecute` | Names end with `_` or are bridge-wrapped | static | gas-best-practices | ☐ | | |
| `P1-11` | Read APIs enforce identity and role scoping | F-02, R-08 | Unit test `testReadApiDataScoping()` | Scoped per matrix | unit | lab-oops-standards | ☐ | | |
| `P1-12` | Public callable allowlist verified | F-02, R-08 | `node scripts/verify_phase.js --phase 1` | All un-underscored functions are in the allowlist | static | gas-best-practices | ☐ | | |
| `P1-13` | Diagnostics gated by Admin/SuperAdmin and `ENABLE_DIAGNOSTICS` | F-04, R-07 | Unit test `testDiagnosticsDisabledByDefault()` | Denied when flag false or caller non-admin | unit | lab-oops-standards | ☐ | | |
| `P1-14` | Single secure config accessor over Script Properties | R-07 | grep `PropertiesService.getScriptProperties` | One accessor in `Utils_Config.js` | static | gas-best-practices | ☐ | | |
| `P1-15` | `Main.doGet` admin-route check fixed and enforced | F-10 | Inspect `Main.doGet` | Signature `(email, roles)`; fails closed | static / unit | lab-oops-standards | ☐ | | |
| `P1-16` | BRG-RTE.01 passes with genuine denial | F-01 | Unit runner | Real `AUTH_DENIED` | unit | gas-best-practices | ☐ | | |
| `P1-17` | `getMainSpreadsheet()` throws `DATABASE_UNAVAILABLE`; `FALLBACK_SHEET_ID` removed | D-13 | Inspect `Utils_Config.js` | Typed error; zero occurrences of the constant | static / unit | gas-best-practices | ☐ | | |
| `P1-18` | All spreadsheet/calendar IDs and `SUPERADMIN_EMAILS` read from Script Properties; **zero hardcoded IDs** *(moved from `P6-01`)* | F-14, R-07, D-35 | pattern scan of `App_Script/` | Zero hits | static | gas-best-practices | ☐ | | |
| `P1-19` | Cross-sheet reader `getUserDirectory_()` with federated cache keys, TTL ≤ 300 s, header validation *(moved from `P2-03`)* | R-05, D-05, D-35 | Unit test `testCrossSheetReaderCacheKey()` | Keys contain `spreadsheetId:tab`; TTL ≤ 300 | unit | gas-best-practices | ☐ | | |
| `P1-20` | Ownership uses `TargetUserID` resolved through `Users`; no `TEACHER_EMAIL` ownership logic | D-21 | Unit test `testOwnershipByUserId()` + grep `TEACHER_EMAIL` | Email → UserID compare; zero hits in ownership code | unit / static | lab-oops-standards | ☐ | | |
| `P1-21` | **Student** role: every action Denied; perimeter pass only | D-08 | Unit test `testStudentZeroPermissions()` | All matrix actions → `AUTH_DENIED` | unit | lab-oops-standards | ☐ | | |
| `P1-22` | **HoD** executive read-only: all mutating actions Denied, read actions allowed | D-10, D-24 | Unit test `testHodReadOnly()` | Approve/cancel/submit/postpone/assign/outage/config → `AUTH_DENIED` | unit | lab-oops-standards | ☐ | | |
| `P1-23` | `ALLOWALL` replaced with `XFrameOptionsMode.DEFAULT` in all three places in `Main.js` *(moved from `P6-04`)* | F-13, D-20, D-35 | `git grep ALLOWALL -- App_Script` | Zero hits | static | gas-best-practices | ☐ | | |
| `P1-24` | Client-side admin PIN removed from code and docs; shortcut visible only to server-verified Admin/SuperAdmin | F-18, D-27 | grep PIN gateway strings; unit test on the verified-admin flag | Zero hits | static / unit | lab-oops-standards | ☐ | | |
| `P1-25` | SuperAdmin resolved only from `SUPERADMIN_EMAILS` and a resolved user; unresolved identity never maps to SuperAdmin; Master DB outage allows diagnostics-only | D-26, ADR-0002 | Unit test `testSuperAdminResolution()` | Behaves per ADR-0002 | unit | lab-oops-standards | ☐ | | |
| `P1-26` | Impersonation: Admin/SuperAdmin only; cannot target Admin/SuperAdmin; server-side state; production = preview + dry-run; writes only on DEV; logged with the real admin | D-16 | Unit test `testImpersonationRules()` | All rules enforced | unit | gas-best-practices | ☐ | | |
| `P1-27` | Deleting a `Users` row denies access within ≤ 5 min; `UserID` verified stable (non-formula, never reused) | D-30, D-12 | Unit test with cache expiry + owner-run audit | Denied after TTL; audit shows no row-derived IDs | unit / staging | gas-best-practices | ☐ | | |
| `P1-28` | One-time teacher-join audit: every `Index.Teacher` resolves to exactly one `Users.DisplayName`; unresolved/ambiguous → `TIMETABLE_USER_UNRESOLVED` | D-15, D-31 | Owner-run audit (counts only) + unit test `testTimetableUserUnresolvedFailsClosed()` | Zero unresolved/ambiguous or owner-accepted list | staging / unit | gas-best-practices | ☐ | | |
| `P1-29` | Every permission, role, domain, ownership or identity failure throws `AUTH_DENIED` | R-03 | Unit test `testAuthDeniedTaxonomy()` | Single error code; reason code only in `Logs` | unit | lab-oops-standards | ☐ | | |
| `P1-30` | DEV/PROD isolation: DEV and PROD IDs differ; UAT and diagnostics refuse the PROD ID | D-14 | Unit test `testUatRefusesProdId()` | Refusal with typed error | unit | gas-best-practices | ☐ | | |
| `P1-31` | Client-supplied identity parameters (`loggedInUserId`, `userEmail`) are ignored or rejected on mismatch | F-02, PRD amendment #15 | Unit test `testClientIdentityIgnored()` | Mismatch → `AUTH_DENIED` | unit | gas-best-practices | ☐ | | |

---

## Phase 2: Booking Transaction Engine & Schema Alignment

| ID | Requirement | Traces to | How to verify | Expected result | Evidence Level | Skill Applied | Status | Evidence | Verified By |
|---|---|---|---|---|---|---|---|---|---|
| `P2-01` | `TX_COL` matches the live `Bookings` contract | F-08, R-05 | Unit test `testHeaderContractMatch('Bookings')` | 100% match | unit | gas-best-practices | ☐ | | |
| `P2-02` | `SCHEMA_CONTRACT.md` documents all **12 consumed tabs** (plus not-consumed tabs) | R-05, D-05 | Inspect contract | Headers and counts correct | static | lab-oops-standards | ☐ | | |
| `P2-03` | *(Cross-sheet reader)* | R-05, **D-05** | — | ⊘ **Moved to `P1-19`** (owner approved 2026-10-19) | — | — | ⊘ | `P1-19` | |
| `P2-04` | Master DB and Timetable are strictly read-only; no write calls | R-05 | grep `appendRow\|setValues` targeting external tabs | Zero | static | lab-oops-standards | ☐ | | |
| `P2-05` | `coreApproveBooking`, `coreRejectBooking`, `coreCancelBooking` implemented | F-08 | grep in `API_Write_Core.js` | Defined and callable | static / unit | gas-best-practices | ☐ | | |
| `P2-06` | Booking IDs via `Utilities.getUuid()` | F-05, F-17 | grep `Math.random` | Zero hits | static | gas-best-practices | ☐ | | |
| `P2-07` | Atomic conflict detection inside `LockService` | F-05, R-11 | Concurrency unit test | Second transaction rejected | unit | gas-best-practices | ☐ | | |
| `P2-08` | `SpreadsheetApp.flush()` before releasing the lock | R-11 | grep `flush()` before `releaseLock()` | Present in all write paths | static | gas-best-practices | ☐ | | |
| `P2-09` | Optional lock fallback eliminated | F-09 | grep `typeof withLock` | Zero hits; lock timeout throws | static | gas-best-practices | ☐ | | |
| `P2-10` | **2 instructional days** lead time (via `Academic_Calendar.IsInstructional`) + 24 h cancel/postpone lock enforced; TALT bypass logged | F-05, R-09, D-07 | Unit test `testLeadTimeAndCancelLock()` | Non-TALT rejected; TALT bypass writes `[URGENT_BYPASS]` and `URGENT_BOOKING_BYPASS` | unit | gas-best-practices | ☐ | | |
| `P2-11` | `SetupHold` outage blocks conflicting bookings except for `LinkedSubject` | D-28 | Unit test | Rejected; linked subject passes | unit | lab-oops-standards | ☐ | | |
| `P2-12` | Linked-row, two-way postponement (original + proposed-slot row, both blocking) with atomic approval | R-04, D-04, D-23, ADR-0003 | Unit test `testTwoWayApprovalPostponementSwap()` | Approve: `N`→`APPROVED`, `O`→`POSTPONED` in one lock | unit | lab-oops-standards | ☐ | | |
| `P2-13` | Denial sets status **`DENIED`** and appends the reason to `Remark` chronologically | F-11, D-19, D-22 | Unit test `testRejectionPreservesReasonChronological()` | Status `DENIED`; remark appended | unit | lab-oops-standards | ☐ | | |
| `P2-14` | Idempotency key prevents duplicate submissions | R-12 | Unit test `testDuplicateSubmissionIdempotency()` | Second call returns the original response | unit | gas-best-practices | ☐ | | |
| `P2-15` | Client "cart/checkout" check refined | F-15 | Unit test with teacher name "Carter" | Accepted | unit | gas-best-practices | ☐ | | |
| `P2-16` | Mapper throws on header mismatch (case-insensitive, trimmed) | F-16 | Unit test | `SCHEMA_HEADER_MISMATCH` | unit | gas-best-practices | ☐ | | |
| `P2-17` | `LOG_COL` and `_writeLogEntry` agree (7 columns) | F-16 | Inspect `Telemetry.js`, `Utils_Schema.js` | Counts match | static / unit | lab-oops-standards | ☐ | | |
| `P2-18` | `Index.html` include casing fixed | F-08 | Inspect `Index.html` | Matches file names exactly | static | gas-best-practices | ☐ | | |
| `P2-19` | Email template keys resolvable | F-08 | Unit test `testGetEmailTemplateAllKeys()` | All keys resolve | unit | gas-best-practices | ☐ | | |
| `P2-20` | Canonical teacher join implemented | D-15 | Unit test `testCanonicalTeacherJoin()` | Email → `DisplayName` → `Index.Teacher` | unit | gas-best-practices | ☐ | | |
| `P2-21` | `Stats` implemented with 12 columns | F-16, D-05 | Unit test `testStatsSheetSchema()` | All 12 mapped | unit | lab-oops-standards | ☐ | | |
| `P2-22` | On-behalf attribution recorded | D-11 | Unit test `testOnBehalfAttribution()` | `SubmittedByUserID`, `TargetUserID`, `ConfirmUserId`, `AssignedTaltID` stored | unit | lab-oops-standards | ☐ | | |
| `P2-23` | Master Calendar read allowed for teachers and HoD; modification of others' bookings denied | D-10 | Unit test `testMasterCalendarRead()` | Allowed read; denied write | unit | lab-oops-standards | ☐ | | |
| `P2-24` | Derived attributes: `isHoD`, `Can_Edit_Config`; tutorial in `localStorage`; `PrimaryGrade` removed | D-18 | Inspect `Utils_Security.js` and frontend | Derived dynamically | static / unit | lab-oops-standards | ☐ | | |
| `P2-25` | Postponement cancellation works in both modes; no timeout; auto-revert when the earlier slot start is reached | D-23, ADR-0003 | Unit tests `testCancelPostponeRequestBothModes()`, `testPostponeAutoRevertAtSlotStart()` | Original returns to `APPROVED`; `N` `CANCELLED`; `POSTPONE_AUTO_REVERT` logged | unit | gas-best-practices | ☐ | | |
| `P2-26` | Status values in code, tests and docs exactly equal the contract's seven values (`PENDING`, `APPROVED`, `DENIED`, `CANCELLED`, `POSTPONE_PENDING_TALT`, `POSTPONE_PENDING_TEACHER`, `POSTPONED`) | D-22 | `node scripts/verify_phase.js --phase 2` | No unknown status literal | static / unit | lab-oops-standards | ☐ | | |
| `P2-27` | Bookable-slot rule enforced (Room, instructional date, bell period, outage, live conflicts) | D-29 | Unit test `testBookableSlotDerivation()` | Each failing condition rejected with its own code | unit | lab-oops-standards | ☐ | | |
| `P2-28` | Forensic-log endpoint is read-only, returns allowlisted columns, sanitised text, paginated; `Student` denied | D-25 | Unit test `testForensicViewerReadOnly()` | No write path; Student → `AUTH_DENIED` | unit | gas-best-practices | ☐ | | |
| `P2-29` | `Outages` and `Duties` contracts (new column order; `Duties.IsActive`) validated | D-36 | Unit tests `testHeaderContractMatch('Outages')`, `('Duties')` | Match; `IsActive` honoured | unit | lab-oops-standards | ☐ | | |
| `P2-30` | Behaviour-preservation suite derived from PRD §7/§14 passes (workload limits and bypass, P2 split, short-lab, batch atomicity, outage auto-cancel, calendar guests, lock-busy message) | PRD amendment §3 | Run suite | All pass | unit / staging | gas-best-practices | ☐ | | |
| `P2-31` | `TIMETABLE_USER_UNRESOLVED` thrown for zero or multiple teacher matches | D-15, D-31 | Unit test | Fails closed | unit | gas-best-practices | ☐ | | |
| `P2-32` | Legacy status strings migrated using PRD amendment §2 mapping (dated backup, DEV first, idempotent, counts only, unknown strings block go-live) | D-22, D-42 | Owner-manual script execution | No legacy strings remain; counts logged | staging / owner | lab-oops-standards | ☐ | | |
| `P2-33` | Default `BellType` rule: `Wed` on Wednesday, otherwise `Regular` when override is blank | D-37 | Unit test `testDefaultBellTypeByWeekday()` | Effective bell type matches weekday | unit | gas-best-practices | ☐ | | |
| `P2-34` | All `Room` rows bookable (no `RoomType` filter); timetable verification retained; `isRoomEligible_` seam present and called | D-38, BL-01 | Unit test `testAllRoomsBookableWithSeam()` | Room without RoomType bookable; seam called | unit | gas-best-practices | ☐ | | |
| `P2-35` | `TARGET_ROLE_INELIGIBLE` thrown when booking target is HoD or Student (HoD cannot be on-behalf target) | D-43 | Unit test `testHodCannotBeBookingTarget()` | Throws `TARGET_ROLE_INELIGIBLE` | unit | gas-best-practices | ☐ | | |
| `P2-36` | `GCalEventID` `ERROR:<code>` vocabulary enforced; retry attempts tracked outside sheet schema; manual retry works | D-40 | Unit test `testCalendarErrorCodeVocabulary()` | Standard code recorded; retry state external | unit | gas-best-practices | ☐ | | |

---

## Phase 3: Data Consistency, Cache Tier & Calendar Sync

| ID | Requirement | Traces to | How to verify | Expected result | Evidence Level | Skill Applied | Status | Evidence | Verified By |
|---|---|---|---|---|---|---|---|---|---|
| `P3-01` | Full-range `getDataRange().setValues()` rewrites replaced by targeted updates | F-11 | grep across mutation endpoints | Zero | static | gas-best-practices | ☐ | | |
| `P3-02` | Calendar creation preceded by duplicate lookup | F-11, R-14 | Unit test `testCalendarDuplicateCheck()` | Lookup before create | unit | gas-best-practices | ☐ | | |
| `P3-03` | `GCalEventID` persisted immediately after creation | F-11, R-14 | Unit test `testCalendarEventIdPersistence()` | Written in the same transaction | unit | gas-best-practices | ☐ | | |
| `P3-04` | Cancellation deletes the linked calendar event | F-11, R-14 | Unit test `testCancelDeletesCalendarEvent()` | Event deleted | unit | gas-best-practices | ☐ | | |
| `P3-05` | Retry with backoff for `ERROR:` rows | F-11, R-14 | Unit test `testCalendarSyncRetryBackoff()` | Retried up to the maximum | unit | gas-best-practices | ☐ | | |
| `P3-06` | Date objects in time cells formatted safely for `Asia/Bangkok` | F-11 | Unit test | Correct `HH:mm` | unit | lab-oops-standards | ☐ | | |
| `P3-07` | Layer-2 snapshots expire via TTL and version key | F-12, R-13 | Unit test `testLayer2CacheTtlExpiration()` | Expired → refetch | unit | gas-best-practices | ☐ | | |
| `P3-08` | `clearAllCaches` uses the correct key pattern | F-12 | Inspect `Utils_Cache.js` | Matches namespace | static / unit | gas-best-practices | ☐ | | |
| `P3-09` | Role/profile/directory cache TTL ≤ 300 s | R-13, D-12 | Inspect TTL constants | ≤ 300 | static | lab-oops-standards | ☐ | | |
| `P3-10` | Cache never authoritative for conflict detection | R-11 | Inspect conflict path | Live read inside the lock | static | gas-best-practices | ☐ | | |
| `P3-11` | Scheduled job and on-read check perform postponement auto-revert | D-23 | Unit test with a past slot | Reverted and logged | unit | gas-best-practices | ☐ | | |
| `P3-12` | Postponement approval swaps calendar events (old removed, new created) | D-23, R-14 | Unit test `testPostponeSwapsCalendarEvents()` | One event for `N`, none for `O` | unit | gas-best-practices | ☐ | | |

---

## Phase 4: Frontend Hardening, Formula Neutralisation & Diagnostics Isolation

| ID | Requirement | Traces to | How to verify | Expected result | Evidence Level | Skill Applied | Status | Evidence | Verified By |
|---|---|---|---|---|---|---|---|---|---|
| `P4-01` | `sanitizeCell_` implemented | F-06 | Unit test `testSanitizeCellFormulas()` | `=`, `+`, `-`, `@`, tab, CR prefixed with `'` | unit | gas-best-practices | ☐ | | |
| `P4-02` | All user-supplied values sanitised before sheet writes | F-06 | grep write paths | All routed through `sanitizeCell_` | static | gas-best-practices | ☐ | | |
| `P4-03` | `innerHTML` interpolation eliminated in `JS_TALTView.html` | F-07 | Inspect file | DOM APIs / `textContent` | static | lab-oops-standards | ☐ | | |
| `P4-04` | Same in `Modal_BatchAction.html` and other modals | F-07 | Inspect files | Safe population | static | lab-oops-standards | ☐ | | |
| `P4-05` | Email placeholder hydration escapes values | F-07 | Unit test `testHydrateTemplateEscapesHtml()` | Tags escaped | unit | gas-best-practices | ☐ | | |
| `P4-06` | UAT cannot mutate the production sheet | F-04 | Inspect `Health_UAT.js` | Staging/mock only | static / unit | gas-best-practices | ☐ | | |
| `P4-07` | Test runners cannot invoke arbitrary server functions by name | F-04 | Inspect `Test_Runner.html`, `Diag_Console.html` | Dynamic routing removed | static | gas-best-practices | ☐ | | |
| `P4-08` | Impersonation banner visible whenever impersonation is active | D-16 | UI test / inspection | Banner present and cannot be dismissed | static / staging | lab-oops-standards | ☐ | | |
| `P4-09` | Forensic viewer UI is read-only (no inputs, edit controls or write calls) | D-25 | Inspect viewer HTML/JS | No write path | static | lab-oops-standards | ☐ | | |

---

## Phase 5: Consolidated Verification

| ID | Requirement | Traces to | How to verify | Expected result | Evidence Level | Skill Applied | Status | Evidence | Verified By |
|---|---|---|---|---|---|---|---|---|---|
| `P5-01` | Static sweep: no unchecked gatekeepers or client-supplied identities | All | `node scripts/verify_phase.js --phase 5` | Zero violations | static | gas-best-practices | ☐ | | |
| `P5-02` | Authorization matrix executed for all 6 roles and SuperAdmin | F-01..F-03 | Run suite on staging | All allow/deny as specified | staging | lab-oops-standards | ☐ | | |
| `P5-03` | Concurrent booking collision test executed (state the evidence level honestly) | F-05, R-11 | Parallel submission test | Exactly one succeeds | staging / unit | gas-best-practices | ☐ | | |
| `P5-04` | Traceability matrix in `docs/TEST_RESULTS.md` | All | Inspect file | F-01 … F-18 mapped to test logs | static | setup-matt-pocock-skills | ☐ | | |
| `P5-05` | No unresolved required rows in this checklist | Plan §4 | `node scripts/verify_phase.js --phase 5` | All ☑ with evidence or ⊘ with approval | static | setup-matt-pocock-skills | ☐ | | |
| `P5-06` | Documentation-consistency lint passes (tab counts, status enum, no `TEACHER_EMAIL`, no PIN) | D-34 | `node scripts/verify_phase.js --phase 5` | Zero violations | static | setup-matt-pocock-skills | ☐ | | |
| `P5-07` | ADR-0001 … ADR-0003 present and referenced by the plan | ADR-0002 | Inspect `docs/adr/` | Present | static | setup-matt-pocock-skills | ☐ | | |

---

## Phase 6: Hardening, Scopes & Staging Deployment

| ID | Requirement | Traces to | How to verify | Expected result | Evidence Level | Skill Applied | Status | Evidence | Verified By |
|---|---|---|---|---|---|---|---|---|---|
| `P6-01` | *(ID migration to Script Properties)* | F-14, R-07 | — | ⊘ **Moved to `P1-18`** (owner approved 2026-10-19) | — | — | ⊘ | `P1-18` | |
| `P6-02` | Git history scan reported; owner decision recorded | F-14, R-06 | Inspect `docs/SECURITY_AUDIT.md` | Report delivered | static | lab-oops-standards | ☐ | | |
| `P6-03` | Minimal explicit OAuth scopes, including the identity scope, tested on staging | F-13, R-15 | Inspect `appsscript.json`; staging run | Identity still resolves | static / staging | gas-best-practices | ☐ | | |
| `P6-04` | *(Framing fix)* | F-13, D-20 | — | ⊘ **Moved to `P1-23`** (owner approved 2026-10-19) | — | — | ⊘ | `P1-23` | |
| `P6-05` | Misleading "AUDIT: Cycle 13 Cleared" headers and dead code removed | F-17 | grep | Zero | static | lab-oops-standards | ☐ | | |
| `P6-06` | `Result<T>` envelope across all callable endpoints | AGENTS.md | `node scripts/verify_phase.js --phase 6` | 100% | static | lab-oops-standards | ☐ | | |
| `P6-07` | Deployment and rollback manual documented | R-16 | Inspect `docs/DEPLOYMENT_ROLLBACK.md` | Steps complete | static | gas-best-practices | ☐ | | |
| `P6-08` | Staging smoke test (submit → approve → calendar → cancel → postpone) signed off | Plan §3 | Run on staging | All pass | staging / owner | lab-oops-standards | ☐ | | |
| `P6-09` | Regression guard: zero hardcoded IDs, zero `ALLOWALL`, zero PIN text | D-20, D-27, D-35 | `node scripts/verify_phase.js --phase 6` | Zero hits | static | gas-best-practices | ☐ | | |

---

## 🔍 Independent Review Protocol

1. Run `node scripts/verify_phase.js --phase <N>`; the exit code must be `0`.
2. Open this file and confirm every `☑` row has a non-empty Evidence field.
3. Spot-check at least three `☑` rows by reading the cited code.
4. Run `git diff <baseline>..HEAD --stat`; confirm only planned files changed, no assertion was weakened, and no row was deleted.
5. Record your name/ID and the date under `Verified By`.
