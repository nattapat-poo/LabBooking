# 📋 Changelog — Project 01: Smart Lab Booking System

All notable changes to this project will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), conforming to **Lab Oops OS** ecosystem standards.

> **Versions 1.4.0a and 1.4.0b are documentation/planning baselines.** No application code has changed since 1.1.3c. Planned work is recorded under `[Unreleased]` until code ships.

## [Unreleased] — Planning baseline v1.4.0b (2026-10-19)

### 🛡️ Revision 2: Owner Clarifications & Closed Open Items (2026-10-19)
* **DEV Google Sheets confirmed (P0-18):** Owner confirmed (2026-10-21) that all Google Sheets have DEV copies; production Master DB and Timetable remain untouched.
* **Header dump status acknowledged (O-3 / P0-17):** Owner clarified header dump is not yet processed; remains scheduled for Phase 0 execution.
Decisions D-37 … D-45 in [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md).

#### Added
* **Make-up session proposal (D-49, P2-39, BL-04, O-13):** Proposed dedicated booking flow for whole-subject make-up lab sessions (`Section = ALL`, typically Period 8) created by TALT staff only (auto-`APPROVED` by creator), subject-wide free-period rule across all teachers of the subject, multi-teacher notification (recipients not owners), mandatory justification, and `[MAKEUP]` tag in `Remark` (awaiting Owner confirmation).
* **Booking-grid UI requirements (D-48, BL-02, BL-03):** Teacher booking view shows only assigned teaching blocks; non-teaching/free periods are blank; available blocks are muted transparent, filled on select/pending/booked; Subject and Section autofilled and locked from server blocks endpoint (`P2-38`); UI implementation deferred to post-Gate 6 (**BL-02**); subject color tokens populated in `docs/DESIGN_TOKENS_SUBJECT_COLORS.md` (**BL-03**, O-12 resolved).
* **Default `BellType` rule (D-37):** when `Academic_Calendar.BellScheduleOverride` is blank, effective schedule is `Wed` on Wednesday, otherwise `Regular` (`P2-33`).
* **All `Room` rows bookable (D-38, D-46):** all rooms in `Room` are bookable for class/lab activities (no `RoomType` filter); timetable assignment rule will be enforced in `API_Validation.js` (PLANNED Phase 2, `P2-37`); extensible seam `isRoomEligible_` added for future timetable room restrictions (**BL-01**; `P2-34`).
* **Timetable assignment rule (D-46, P2-37; Option B):** Owner confirmed the PRD assignment rule supersedes the code's conflict-check semantics (earlier conflict-check entry superseded). A booking is valid only if an assigned teaching block exists matching DayType, Period, Subject, and Section. Free periods, non-teaching blocks (Homeroom, Study Hall, LD, meetings), and zero-row teachers are rejected (`TIMETABLE_NOT_ASSIGNED`). Subject/section mismatch is rejected (`TIMETABLE_SUBJECT_MISMATCH`). **Behaviour change from live code:** staff must be informed before deployment that free periods can no longer be booked. Added `P2-38` (assigned blocks endpoint).
* **Target role eligibility (D-47; supersedes D-43):** booking owner must resolve to an eligible role (`Teacher`, `TA`, `LabTech`, `Admin`, `HoD`); attempts targeting an ineligible role (`Student` or unrecognised roles) fail with `TARGET_ROLE_INELIGIBLE` (`P2-35`).
* **Calendar failure marker vocabulary (D-40):** `GCalEventID = ERROR:<code>` confirmed with standard vocabulary (`CALENDAR_API`, `CALENDAR_QUOTA`, `CALENDAR_NOT_FOUND`, `INVALID_TIME`); retries tracked outside sheet schema (`P2-36`).
* **Status migration procedure (D-42):** approved procedure for migrating legacy status strings (dated backup, DEV first, idempotent, counts only, unknown strings block go-live; `P2-32`).
* **Identity spike account-coverage policy (D-44):** Admin tested on DEV via Owner staff account; consumer Google proxy for G10; G11-12 Workspace student unverified / best-effort; no emails in committed docs (`P0-19`); prerequisite: isolated DEV copies of Master DB and Timetable (`P0-18`).
* **Extended distinct-value dump report (D-37, D-38, D-42):** `P0-17` extended to report distinct values and counts for `Bookings.Status`, `Bell_Schedules.BellType`, `Room.RoomType`, and `Users.Role` (no PII).

#### Changed
* **HoD role authority (D-47; supersedes D-43, revises D-24):** HoD is a subject teacher with executive view (role string UNCHANGED as `HoD`). HoD may submit, cancel (24 h lock) and request postponement for own bookings under own timetable assignment rule; TALT may book on HoD's behalf (`P1-22`, `P2-35`). HoD has no on-behalf booking rights for other teachers, no approval rights, and no administrative mutating permissions. Earlier strictly read-only D-43 entry superseded.
* **Non-statuses confirmed (D-41):** `Action Required` and `Error (Calendar)` confirmed non-statuses; recorded in `Remark`/`Logs` only.
* **Live spellings confirmed (D-39):** exact tab spelling `Bookings` and header `IsActive` confirmed.
* **ADR-0002 reconfirmed (D-45):** status updated to "Accepted — reconfirmed by Owner 2026-10-19".

### 🛡️ Revision 1: Clarified Architecture & Security Decisions (D-21 … D-36)
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
