# 📋 Changelog — Project 01: Smart Lab Booking System

All notable changes to this project will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), conforming to **Lab Oops OS** ecosystem standards.

> **Versions 1.4.0a and 1.4.0b are documentation/planning baselines.** No application code has changed since 1.1.3c. Planned work is recorded under `[Unreleased]` until code ships.

## [Unreleased] — Phase 0 Scaffolding & Tooling Execution (2026-10-21)

### Phase 0 Infrastructure & Tooling Scaffolding
* **Git Isolation:** Merged PR #1 to `main`; created immutable rollback anchor tag `pre-hardening-baseline` on commit `b984891`; created working branch `security/production-hardening`. Verified `App_Script/` 100% untouched.
* **Living Security Audit Ledger (`docs/SECURITY_AUDIT.md`):** Complete classification of vulnerabilities F-01 through F-18 (confirmed, root cause, severity, target phase, verification test).
* **Access Control Matrix (`docs/ACCESS_CONTROL_MATRIX.md`):** Comprehensive exposure map of all 50 files in `App_Script/`, establishing the 22-endpoint public allowlist in `API_Bridge.js` and mapping internal functions for trailing `_` privatization.
* **Identity Spike Protocol (`docs/IDENTITY_DECISION.md`):** Pre-registered disqualifiers D1–D8, 4×4 test matrix across the 3 email domains, and staging probe specification.
* **Single Machine-Readable Schema Contract (`schema/contract.json`):** Validated schema specification for the 12 consumed tabs, column types, nullability, and 7-status lifecycle.
* **Offline Unit Test Harness (`test/gas-stubs.js`, `test/run_tests.js`):** Standalone Node.js test environment with 34 tests passing across GAS stubs, sanitization, permissions matrix, and state machine.
* **Verification Runner & Lint (`scripts/verify_phase.js`):** Automated verification runner enforcing checklist integrity, tests, schema contracts, git baseline isolation, and docs hygiene.
* **Pattern History Scanner (`scripts/scan_history.js`):** Audited full git commit history for 44-character IDs, calendar IDs, and emails, reporting counts only without plain values.
* **Continuous Integration (`.github/workflows/ci.yml`):** GitHub Actions workflow executing verification runner and pattern scan.
* **Lead Architect Header Dump Tool (`scripts/header_dump_tool.gs`):** Read-only GAS script for owner inspection of Row 1 headers and Row 2 formulas across the 12 consumed tabs.

## [Unreleased] — Planning baseline v1.4.0b (2026-10-19)

### 🛡️ Clarified Architecture & Security Decisions (D-21 … D-36)
Plan: [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md) · Contract: [`SCHEMA_CONTRACT.md`](./SCHEMA_CONTRACT.md) · Checklist: [`PHASE_CHECKLIST.md`](./PHASE_CHECKLIST.md) · PRD changes: [`PRD_AMENDMENT_v1.4.0b.md`](./PRD_AMENDMENT_v1.4.0b.md)

### Added
* **ADR-0002** ([`adr/0002-superadmin-pin-removal-and-standard-deviations.md`](./adr/0002-superadmin-pin-removal-and-standard-deviations.md)): SuperAdmin as a Script Property, removal of the client-side admin PIN, recorded deviations from `lab-oops-standards`.
* **ADR-0003** ([`adr/0003-postponement-linked-row-model.md`](./adr/0003-postponement-linked-row-model.md)): linked-row, two-way approval postponement with cancellation in both modes and no timeout (auto-revert at slot start).
* **`PRD_AMENDMENT_v1.4.0b.md`**: superseded statements and legacy-to-canonical status mapping.
* **Status values `DENIED` and `POSTPONED`** (seven stored values in total) and the matching state-machine states.
* **Repository hygiene controls** (Phase 0): rollback tag by explicit SHA, branch protection, secret scanning, pattern-based history scan, docs lint.
* **Identity Spike disqualifiers (D1–D8)** with pre-registered criteria and redacted evidence.
* **Admin-only impersonation** (preview + dry-run in production; writes only on DEV).
* **Read-only forensic log viewer** for all non-student roles (event details and emails).
* **`Duties.IsActive`** column and new column order for `Outages` and `Duties`.

### Changed
* **Schema normalisation:** 12 consumed tabs across 3 spreadsheets (6 local, 5 Master DB, 1 Timetable); non-consumed tabs documented only. The booking tab is `Bookings` (25 columns).
* **Ownership:** `TargetUserID` holds a UserID only; nickname and email are looked up through `Users`. `TEACHER_EMAIL` ownership logic is retired.
* **Roles:** `Student` accounts have zero permissions; **`HoD` is executive read-only**; `TA` equals `LabTech`.
* **Lead time:** 2 instructional days (via `Academic_Calendar.IsInstructional`) plus a 24-hour teacher cancel/postpone lock, with audited TALT bypass. *(Replaces the incorrect "24-hour lead time" wording of 1.4.0a.)*
* **Room data:** `Room` has no capacity, subject tags or status; bookability is derived from Room + Academic_Calendar + Bell_Schedules + Outages + live bookings.
* **Revocation:** delete the user's row in Master DB `Users` (effective within the 5-minute cache TTL); `UserID` must be stable and never reused.
* **Phase moves:** cross-sheet reader and **all** ID migration moved to Phase 1; `ALLOWALL` → `DEFAULT` moved to Phase 1.
* **Feature sequencing:** Milestones 2–3 start after Gate 6.
* **Identity resolution:** the 1.1.3c resolver terminated at a hardcoded SuperAdmin, which is **fail-open** (finding F-03). It is replaced by fail-closed resolution; SuperAdmin comes from a Script Property and never applies to an unresolved identity.

### Security
* **F-18:** the client-side admin PIN gateway is slated for removal; no PIN may remain in code or docs.

---

## [1.4.0a] — 2026-10-15 *(planning baseline; corrected 2026-10-19)*

### 🛡️ Security Hardening & Federated Architecture Baseline
Architectural plan addressing the 17 audit findings (F-01 … F-17) and 16 revisions (R-01 … R-16).

### Added
* **Formal Implementation Plan**: 6-phase remediation blueprint in [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md).
* **Phase Verification Checklist**: [`PHASE_CHECKLIST.md`](./PHASE_CHECKLIST.md).
* **Canonical Role Permissions (`PERMISSIONS`)**: policy-as-data matrix for Teacher, TA, LabTech, Admin, HoD.
* **Two-Way Approval Postponement Protocol**.
* **Federated Multi-Spreadsheet Schema Contract**: spans the Local Sheet, Master DB 2026 and Timetable 2026. *(1.4.0a described this as an "8-tab" contract; the corrected count is **12 consumed tabs**, see v1.4.0b.)*
* **On-Behalf Booking Attribution**: `SubmittedByUserID`, `TargetUserID`, `ConfirmUserId`, `AssignedTaltID`.
* **Telemetry & Forensic Stats Tab**: 12-column `Stats` schema.

### Changed
* **Role equality:** `TA` equals `LabTech`.
* **HoD:** cannot approve standard bookings. *(Now fully executive read-only in v1.4.0b.)*
* **Domain whitelist:** `@mahidol.ac.th`, `@student.mahidol.ac.th`, `@student.mahidol.edu` (`@mahidol.edu` prohibited).
* **Lead time:** *(corrected)* 2 instructional days plus a 24-hour teacher cancel/postpone lock, with audited TALT bypass. The original entry said "standardised on 24 hours", which was inaccurate.

---

## [1.1.3c] — 2026-10-10

### 🏛️ Governing Skills Alignment Release
Aligned the project with the 3 governing skills:
* **Primary:** `lab-oops-standards` (Rule 26: 3-tier caching, SuperAdmin security, universal branding, 2-column split footer, Stealth Admin Gateway `Ctrl + Shift + Q`).
* **Complementary:** `gas-best-practices` (`Result<T>` envelope, `LockService` concurrency guards, safe identity resolution).
* **Scaffolding:** `mattpocock/skills` (`setup-matt-pocock-skills`, ADRs, ubiquitous language).

*(Sanitised 2026-10-19: a client-side PIN value and a personal email address were removed from this historical entry; see finding F-18 and ADR-0002.)*

### Added
* **2-Column Split Footer**: standard responsive footer in [`Index.html`](../App_Script/Index.html) with left-side app and ecosystem branding and right-side developer signature `Vibe Coded by Nattapat Poolyam, 2026`.
* **Stealth Developer Admin Gateway**: `Ctrl + Shift + Q` (and `Cmd + Shift + Q`) listener and signature click trigger in [`Index.html`](../App_Script/Index.html), originally guarded by a fixed client-side PIN. *(PIN guard removed in the v1.4.0b plan.)*
* **3-Tier Caching Pipeline**: Layer 2 (`PropertiesService.getScriptProperties()`) JSON snapshot fallback in [`Utils_Cache.js`](../App_Script/Utils_Cache.js).
* **Mandatory Sheets Support**: `CFG_COL`, `LOG_COL`, `STA_COL` schemas in [`Utils_Schema.js`](../App_Script/Utils_Schema.js) and `recordUserTelemetry()` in [`Telemetry.js`](../App_Script/Telemetry.js).
* **Identity Resolution & SuperAdmin Gatekeeper**: `getActorEmailSafe()` and `verifySuperAdminAccess()` in [`Utils_Security.js`](../App_Script/Utils_Security.js). *(The resolver terminated at a hardcoded SuperAdmin, which audit finding F-03 classifies as fail-open; see ADR-0002.)*
* **Architecture Decision Record**: [`adr/0001-governing-ecosystem-alignment.md`](./adr/0001-governing-ecosystem-alignment.md).
* **Project Specifications**: [`Project_Profile.md`](./Project_Profile.md), [`Planning.md`](./Planning.md), [`DevLog.md`](./DevLog.md).

### Changed
* **RBAC & TALT Team Role Normalisation**:
  - Replaced all `"talt"` role checks with permitted roles (`"TA"`, `"LabTech"`, `"Teacher"`, `"Admin"`, `"HoD"`) across [`API_Bridge.js`](../App_Script/API_Bridge.js), [`API_Read_User.js`](../App_Script/API_Read_User.js), [`API_TALT_Auth.js`](../App_Script/API_TALT_Auth.js), [`API_Update_RBAC.js`](../App_Script/API_Update_RBAC.js), [`Health_UAT.js`](../App_Script/Health_UAT.js), [`Main.js`](../App_Script/Main.js), [`Telemetry.js`](../App_Script/Telemetry.js), [`Utils_Security.js`](../App_Script/Utils_Security.js), [`JS_Header.html`](../App_Script/JS_Header.html) and [`JS_Core.html`](../App_Script/JS_Core.html).
  - Updated the role dropdown switcher in `JS_Header.html` to include `"Teacher"`, `"Lab Tech"`, `"TA"` and `"System Admin"`. *(The switcher is a UI convenience only; the server never trusts a client-selected role.)*
* **Universal Response Envelope (`Result<T>`)**:
  - Refactored `API_Bridge.js` functions (`bridgeGetUserInfo`, `bridgeGetTeacherList`, `bridgeGetLabList`, `bridgeGetSubjectList`, `bridgeGetLabOutages`, `bridgeGetLabAssignmentContext`, `bridgeSearchTeachers`, `bridgeSubmitBooking`, `bridgeApproveBooking`, `bridgeRejectBooking`, `bridgeCancelBooking`, `getCalendarDayType`, `getBellType`) to return `{ ok, success, data/payload, message, error }`.
  - Updated the client handler in `JS_Core.html` to evaluate `response.ok` / `response.success`.
* **Universal Branding & Acronym Styling**: `JS_Header.html` acronym letters use `text-emerald-400 font-extrabold` without CSS uppercase.
* **Concurrency Locking**: `withLock` in [`Utils_Core.js`](../App_Script/Utils_Core.js) accepts a configurable `timeoutMs` (default 30,000 ms).
