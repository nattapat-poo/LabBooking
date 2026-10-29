# 🗺️ Planning & Roadmap — Project 01: Smart Lab Booking System

**Updated:** 2026-10-19 (v1.4.0b planning baseline). **Priority order:** Milestone 4 (security hardening) first. Feature Milestones 2–3 start **after Gate 6** (decision D-28).

---

## 📌 Milestones

### Milestone 1: Governing Skills & Architecture Alignment (Completed)
- [x] **Acknowledge Upstream Skills Source:** Sourced from `mattpocock/skills` (`https://github.com/mattpocock/skills`).
- [x] **RBAC & TALT Team Role Normalization:** Eliminated the `"talt"` role string in favour of database roles `"TA"`, `"LabTech"`, `"Teacher"`, `"Admin"`, `"HoD"` (and `"Student"` from v1.4.0b).
- [x] **Universal Response Envelope (`Result<T>`):** Standardised client-facing server endpoints to return `{ ok, success, data, message }`.
- [x] **3-Tier Caching Pipeline:** Layer 1 (ScriptCache) → Layer 2 (ScriptProperties snapshot) → Layer 3 (Spreadsheet). *(Layer 2 receives a TTL in Phase 3.)*
- [x] **Universal Branding & Split Footer:** Non-uppercase highlighted acronym subtitle and responsive 2-column split footer.
- [x] **Stealth Admin Shortcut:** `Ctrl + Shift + Q` / signature click. *The client-side PIN guard was a weakness (finding F-18) and is **removed in Phase 1**; the shortcut remains only for server-verified Admin/SuperAdmin (D-27, ADR-0002).*
- [x] **Documentation Standard:** Scaffolding under `docs/` (`Project_Profile.md`, `Planning.md`, `DevLog.md`, `CHANGELOG.md`, `docs/adr/`).

### Milestone 4: Security Hardening & v1.4.0b Remediation (ACTIVE — runs first)
One phase at a time; each ends at an owner gate with an evidence pack (`docs/PHASE_CHECKLIST.md`, `verify_phase.js`).
- [ ] **Phase 0:** Baseline safety (rollback tag by explicit SHA), repository hygiene (branch protection, scanning, docs lint), Staging Identity Spike with pre-registered disqualifiers (`docs/IDENTITY_DECISION.md`), test harness, `verify_phase.js`, live header dump to verify `docs/SCHEMA_CONTRACT.md`.
- [ ] **Phase 1:** Fail-closed identity, `AUTH_DENIED` taxonomy, domain whitelist, canonical `PERMISSIONS` matrix (Student zero permissions, HoD own-booking + executive view per D-47), Script Properties and **all ID migration**, cross-sheet `Users` reader, ownership by `TargetUserID`, SuperAdmin Script Property, **PIN removal**, **`ALLOWALL` → `DEFAULT`**, admin-only impersonation (preview + dry-run), diagnostics containment, UserID-stability and teacher-join audits.
- [ ] **Phase 2:** Booking engine repair, schema alignment (12 consumed tabs), status enum with `DENIED`/`POSTPONED`, linked-row two-way postponement with cancellation and auto-revert, 2-instructional-day lead time + 24 h cancel lock with audited TALT bypass, bookable-slot derivation, read-only forensic-log endpoint, behaviour-preservation suite from PRD §7/§14.
- [ ] **Phase 3:** Targeted cell updates, Calendar idempotency and postponement event swap, cache TTLs (≤ 5 min), auto-revert job.
- [ ] **Phase 4:** XSS elimination, `sanitizeCell_`, diagnostics isolation, impersonation banner, read-only log viewer UI.
- [ ] **Phase 5:** Consolidated verification, concurrency evidence, traceability in `docs/TEST_RESULTS.md`, documentation-consistency lint.
- [ ] **Phase 6:** Minimal OAuth scopes (including identity scope), history-scan report, cleanup, staging release, owner production approval (Gate 6).

### Milestone 2: Adaptive Calendar Grid & Persistent Setup Outages (Deferred until after Gate 6)
- [x] **Adaptive Grid Specification:** Documented continuous physical time coordinate mapping (`07:30–16:30`), ghost target slots and multi-chip stacking in `docs/Adaptive_Calendar_Grid_Spec.md`.
- [x] **Setup Hold Outage Policy:** `SetupHold` / `ApparatusLock` outage category with email suppression for continuing lab activities.
- [x] **Outages Schema Defined:** `OutageType`, `LinkedSubject`, `SuppressEmail` are in the 13-column `Outages` contract (new column order). *Live-sheet verification: `P0-17`.*
- [ ] **`SetupHold` enforcement** in the booking engine — delivered in Phase 2 (`P2-11`).
- [ ] **TALT Setup Hold Management Modal** (UI) — after Gate 6.
- [ ] **Adaptive Grid Rendering** (`calculateGridCoordinates`, mobile day carousel) — after Gate 6.

### Milestone 3: Pre-Release Polish & Benchmark Promotion (Deferred until after Gate 6)
- [ ] Execute 6-Pillar Pre-Release Protocol.
- [ ] End-to-end rehearsal across Teacher and LabTech workflows.
- [ ] Synchronise versioning across config tabs and promote to a stable benchmark release.

---

## 🔒 Sequencing Rule (D-28)
Feature work and security work touch the same files (`JS_TALTView.html`, modals, `Outages` logic). To avoid conflicting edits, no feature milestone starts before Gate 6, and no feature branch may merge into `security/production-hardening`.

---

## 📋 Ecosystem Follow-Ups & Backlog (After Gate 6)

### Ecosystem Follow-Ups (D-45)
1. **Update `lab-oops-standards` Skill:** Revise Rule 26 (eliminating client-side PIN gateway in favor of server-verified shortcuts), update SuperAdmin resolution (eliminating fail-open fallback in favor of `SUPERADMIN_EMAILS` Script Property), and align standard sheet schemas with project requirements (ADR-0002, D-45).
2. **Review Sibling Lab Oops Applications:** Audit child science lab applications that inherited the client-side PIN gateway and fail-open SuperAdmin fallback patterns.

### Backlog Items
* **BL-01 (Room-Booking Timetable Restrictions):** Define and implement restrictive business rules governing which teachers may book specific rooms based on the master timetable. (Validation seam `isRoomEligible_` established in Phase 2 via D-38; returns `true` until BL-01 rule specification is confirmed).
* **BL-02 (Teacher Booking-Grid UI Overhaul per D-48):**
  - **Read-Only UI Inspection Findings:** Current UI (`App_Script/JS_TeacherView.html` lines 157–161) locks unassigned cells with a gray 'No Assignment' label (`state: 'LOCKED'`, `bg-gray-100 text-gray-400 cursor-not-allowed`) rather than blank cells. The booking form (`App_Script/Modal_Details.html` lines 84–95, 214–266) uses an unlocked `<input id="inputSubjectName">` with demo quick-fill presets, allowing arbitrary subject entry without verifying against assigned teaching blocks.
  - **Implementation Requirements (D-48):** Render unassigned cells and non-teaching blocks (Homeroom, Study Hall, LD, meetings) as completely blank/empty (matching the "teaching radar" grid). Render available teaching blocks muted (border and text only, transparent background), filling with subject colour when selected, pending, or booked. Selecting a block autofills and locks Subject and Section from the server endpoint (`P2-38`), preventing manual modification. Server remains authoritative.
* **BL-03 (Subject Color Design Tokens Adoption):** Ingest and apply standardized subject-to-hex design tokens from `docs/DESIGN_TOKENS_SUBJECT_COLORS.md` (tokens confirmed by Owner and populated in O-12) to booking grid block borders and fills.
* **BL-04 (Make-Up Session Booking Type UI & Workflow - D-49):** Implement dedicated UI entry and workflow for whole-subject make-up lab sessions (`Section = ALL`, defaulting to Period 8). Created by TALT staff only (Teacher/HoD/Student Not allowed; auto-`APPROVED` by creator with mandatory justification). Validates free-period status across all teachers of that subject (`MAKEUP_PERIOD_NOT_FREE`), validates teaching subject (`MAKEUP_SUBJECT_NOT_TEACHING`), tags bookings with `[MAKEUP] notify: <nicknames>`, and triggers email notification to all teachers assigned to that subject in `Index` plus extras (recipients, not owners). Confirmed by Owner (D-49, O-13).
* **BL-05 (Error Code Catalogue Synchronisation):** Keep `docs/ERROR_CODES.md` in sync with codebase exceptions and validation returns; add an automated verification rule in `verify_phase.js` to assert code alignment.
