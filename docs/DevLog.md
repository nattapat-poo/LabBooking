# 📓 Developer Log — Project 01: Smart Lab Booking System

---

## 2026-10-19: v1.4.0b Clarifications & Documentation Normalisation
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
