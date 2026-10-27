# 📓 Developer Log — Project 01: Smart Lab Booking System

---

## 2026-10-22: Process Note — Repository Incident Recovery & Standing Safety Rules
* During a documentation task on 2026-10-21, an agent deleted the Phase 0 branch (`security/production-hardening`) and baseline tag (`pre-hardening-baseline`) and force-reset `main`.
* The Owner required a read-only incident report; refs were restored exactly under explicit Owner authorization (tag on baseline commit `b984891`, Phase 0 branch at its previous tip `2f69730`, and `main` fast-forwarded to `efd082d` then `baa19de`) with no history lost.
* The Phase 0 branch remains an **unreviewed draft**.
* Standing safety rules have been proposed for `AGENTS.md`: never force-push, reset, or delete shared refs without written Owner approval; stop and report immediately on precondition mismatch; and report every state-changing command.

---

## 2026-10-19: Revision 2 — Owner Clarifications (D-37 … D-45) & PR #1 Hardening
* **2026-10-21 Owner Clarification & Prerequisite Confirmation:**
  - **P0-18 Confirmed:** Owner confirmed all Google Sheets have DEV copies; checklist row `P0-18` marked complete (`☑`).
  - **O-3 / P0-17 Not Yet Processed:** Acknowledged that live schema header dump has not yet been run; remains open for Phase 0 execution.
* **Lead Architect:** Nattapat Poolyam (Mek)
* **Agent:** Claude (documentation review) with Google Antigravity (implementation)
* **Scope:** Applied Owner answers for open items O-1 … O-9; recorded decisions D-37 … D-45; updated schema contract, implementation plan, checklist, and PRD amendment; restored locked PRD from main, kept the old v1.4.0a amendment block for history with a superseded notice, and added a v1.4.0b pointer banner. *(Documentation only; no code changed).*

### Decisions Recorded
1. **D-37 (Default `BellType`):** Effective schedule is `Wed` on Wednesday, otherwise `Regular` when `BellScheduleOverride` is blank.
2. **D-38 (Room Scope & BL-01):** All `Room` rows are bookable; no `RoomType` filter. Timetable assignment rule enforced in `API_Validation.js` (D-46; PLANNED Phase 2); seam `isRoomEligible_` added as an additional future check for backlog BL-01.
3. **D-39 (Live Spellings):** Exact tab spelling is `Bookings`; header is `IsActive`.
4. **D-40 (Calendar Failure Marker):** `GCalEventID = ERROR:<code>` confirmed with standard vocabulary; retry counts stored outside sheet.
5. **D-41 (Non-Statuses):** `Action Required` and `Error (Calendar)` confirmed non-statuses.
6. **D-42 (Status Migration):** Procedure approved (dated backup, DEV first, idempotent, counts only, unknown strings block go-live).
7. **D-43 (HoD Restriction — SUPERSEDED by D-47):** Previously held HoD strictly read-only; superseded by D-47 (Owner 2026-10-27).
8. **D-44 (Identity Spike Account Coverage):** Admin tested on DEV via Owner staff account; consumer Google stand-in for G10; Workspace student best-effort; no emails in committed docs; DEV DB prerequisite (`P0-18`).
9. **D-45 (ADR-0002 Reconfirmed):** SuperAdmin via Script Property, PIN removal, project schema authority, global standards update deferred.
10. **D-46 (Timetable Assignment Rule):** Owner confirmed Option B (PRD assignment rule). Stricter than live code: bookings require an existing assigned teaching block with matching Subject and Section. Free periods, non-teaching blocks (Homeroom, Study Hall, LD, meetings), and teachers with zero `Index` rows are rejected (`TIMETABLE_NOT_ASSIGNED`). Identity failure throws `TIMETABLE_USER_UNRESOLVED` fail-closed. Added `P2-37` and `P2-38`. Supersedes D-15; staff notice required before deployment.
11. **D-47 (HoD as Subject Teacher with Executive View):** HoD role string UNCHANGED as `HoD`. Subject teacher with executive view: can book own classes under own timetable, cancel (24 h cancel lock), and request postponement; TALT staff may book on HoD's behalf. On-behalf booking for other teachers, approvals, and administrative actions Not allowed. `TARGET_ROLE_INELIGIBLE` applies to `Student` and unrecognised roles only. Supersedes D-43; revises D-24.
12. **D-48 (Booking-Grid UI Requirements & Design Tokens):** Teacher grid displays assigned teaching blocks only; unassigned/non-teaching slots are blank; available blocks muted transparent, filled on select/pending/booked; Subject and Section autofilled and locked field. Subject colours drawn from `docs/DESIGN_TOKENS_SUBJECT_COLORS.md` (O-12). Scaffolding in place; UI delivery deferred to post-Gate 6 (BL-02, BL-03).

### Document Repairs & Synchronization
* **Locked PRD Repaired:** Restored `docs/Lab Booking App - PRD v1.1.3c.md` from `main` to undo inadvertent reversion of 1.4.0a text; added single superseding banner line matching Appendix and Design Spec.
* **Checklist Extended:** Added `P0-18`, `P0-19`, `P2-33`, `P2-34`, `P2-35`, `P2-36`; extended `P0-17` and `P2-32`; verified 123 unique IDs with zero gaps and no `P6-10`.

---

## 2026-10-19: Revision 1 — v1.4.0b Clarifications & Documentation Normalisation
* **Lead Architect:** Nattapat Poolyam (Mek)
* **Agent:** Claude (documentation review) with Google Antigravity (implementation)
* **Scope:** Normalised tab/column lists across all documents; recorded decisions D-21 … D-36; no application code changed.

### Decisions recorded
1. **Schema normalisation:** 12 consumed tabs across 3 spreadsheets (6 local, 5 Master DB, 1 Timetable). Not-consumed tabs (Master DB `Global_Config`, `Config`, `Logs`; Timetable `TimeTable 2026`, `Template`, per-teacher pages, `Config`, `Logs`) are documented only. `Outages` and `Duties` column order updated; `Duties.IsActive` added.
2. **Ownership:** `TargetUserID` holds a UserID only; nickname and email are resolved through `Users`.
3. **Status enum:** seven stored values, adding `DENIED` and `POSTPONED` to `PENDING`/`APPROVED`/`CANCELLED` and the two pending-postponement states.
4. **Postponement:** linked-row, two-way approval; cancellation in both modes; **no timeout** (auto-revert when the slot start is reached). See ADR-0003.
5. **Roles:** `Student` zero permissions; `HoD` executive read-only; `TA` equals `LabTech`; teachers and all non-student roles get a read-only forensic log viewer.
6. **Security:** client-side admin PIN removed (F-18); SuperAdmin becomes a Script Property (ADR-0002); admin-only impersonation limited to preview and dry-run in production.
7. **Phase moves:** cross-sheet reader and all ID migration → Phase 1; `ALLOWALL` → `DEFAULT` → Phase 1.
8. **Sequencing:** feature Milestones 2–3 start after Gate 6.
9. **Process hygiene:** rollback tag on an explicit SHA, branch protection, secret scanning, pattern-based history scan, relative doc links, single schema source, `[Unreleased]` changelog discipline.

### Documents updated
`IMPLEMENTATION_PLAN.md`, `SCHEMA_CONTRACT.md`, `PHASE_CHECKLIST.md`, `PHASE_0_IMPLEMENTATION_PLAN.md`, `Planning.md`, `CHANGELOG.md`, `DevLog.md`, `Project_Profile.md`; new: `PRD_AMENDMENT_v1.4.0b.md`, `adr/0002-…`, `adr/0003-…`.

---

## 2026-10-15: Version 1.4.0a Architecture & Security Baseline *(corrected 2026-10-19)*
* **Lead Architect:** Nattapat Poolyam (Mek)
* **Agent:** Google Antigravity
* **Scope:** Planning baseline for v1.4.0a security hardening, federated database schema contract, canonical role permissions, two-way postponement and urgent-bypass logging. *(Documentation only; no code changed.)*

### Key Architectural Milestones:
1. **Version baseline v1.4.0a** recorded across `Project_Profile.md`, `Planning.md`, `CHANGELOG.md`, `IMPLEMENTATION_PLAN.md`.
2. **Federated multi-spreadsheet contract:** three spreadsheets (Local Sheet, Master DB 2026, Timetable 2026). *(Originally described as an "8-tab" contract; superseded by the 12-consumed-tab contract in v1.4.0b.)*
3. **Role authority matrix (`PERMISSIONS`):** `TA` equals `LabTech`; `HoD` cannot approve. *(Now fully executive read-only in v1.4.0b.)* Teachers can see forensic logs and stats. *(Now through a read-only viewer; see v1.4.0b.)*
4. **Two-way approval postponement and urgent bypass:** reciprocal approval workflow. *(Corrected: the lead time is **2 instructional days**, with a **24-hour** teacher cancel/postpone lock; TALT bypasses are audited with `[URGENT_BYPASS]`. The original entry said "24-hour lead time", which was inaccurate.)*
5. **On-behalf attribution:** 25-column `Bookings` schema with `SubmittedByUserID`, `TargetUserID`, `ConfirmUserId`, `AssignedTaltID`.

---

## 2026-10-10: Governing Ecosystem Skills Alignment
* **Lead Architect:** Nattapat Poolyam (Mek)
* **Agent:** Google Antigravity
* **Scope:** Alignment with `lab-oops-standards` (primary), `gas-best-practices` (complementary) and `mattpocock/skills` (scaffolding).

### Key Architectural Refactors:
1. **RBAC & TALT Team Role Normalisation:**
   - Eliminated `"talt"` role usages across `API_Bridge.js`, `API_Read_User.js`, `API_TALT_Auth.js`, `API_Update_RBAC.js`, `Health_UAT.js`, `Main.js`, `Telemetry.js`, `Utils_Security.js`, `JS_Header.html` and `JS_Core.html`.
   - Valid database roles: `"TA"`, `"LabTech"`, `"Teacher"`, `"Admin"`, `"HoD"`.
2. **Universal Response Envelope (`Result<T>`):**
   - `API_Bridge.js` routes return `{ ok: true, success: true, data: ..., message: "..." }` on success and `{ ok: false, success: false, message: "...", error: "..." }` on failure.
   - `JS_Core.html` checks `res.ok` (or `res.ok || res.success`) before showing success feedback.
3. **Identity Resolution & SuperAdmin Gatekeeper:**
   - Implemented `getActorEmailSafe()` in `Utils_Security.js` and `verifySuperAdminAccess()`. *(Correction: the resolver ended at a hardcoded SuperAdmin when the caller could not be resolved. That is **fail-open**, not fail-closed (finding F-03). It is replaced in Phase 1; see ADR-0002.)*
4. **3-Tier Caching Flow:** `Utils_Cache.js` Layer 2 (`PropertiesService.getScriptProperties()`) snapshot between Layer 1 (`CacheService`) and Layer 3 (live spreadsheet).
5. **Universal Branding & Stealth Admin Shortcut:**
   - `JS_Header.html` acronym letters styled `text-emerald-400 font-extrabold` without CSS uppercase; `Index.html` 2-column split footer (`Vibe Coded by Nattapat Poolyam, 2026`).
   - Stealth admin shortcut `Ctrl + Shift + Q` (or `Cmd + Shift + Q`) and signature click. *(Originally guarded by a client-side PIN, now removed in the v1.4.0b plan; see F-18.)*
6. **Documentation scaffolding:** standard layout under `docs/` (`Project_Profile.md`, `Planning.md`, `DevLog.md`, `CHANGELOG.md`, `adr/0001-governing-ecosystem-alignment.md`).

---

## Historical Logs Archive
For development logs prior to this alignment, see:
* [`DevLog15.md`](./DevLog15.md) (Cycle 15 UAT & Diagnostic Engine Hardening).
* [`CodebaseMap15.md`](./CodebaseMap15.md) (Cycle 15 Codebase Architecture Map).
