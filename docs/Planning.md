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
- [ ] **Phase 1:** Fail-closed identity, `AUTH_DENIED` taxonomy, domain whitelist, canonical `PERMISSIONS` matrix (Student zero permissions, HoD executive read-only), Script Properties and **all ID migration**, cross-sheet `Users` reader, ownership by `TargetUserID`, SuperAdmin Script Property, **PIN removal**, **`ALLOWALL` → `DEFAULT`**, admin-only impersonation (preview + dry-run), diagnostics containment, UserID-stability and teacher-join audits.
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
