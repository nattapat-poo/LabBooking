# 🗺️ Planning & Roadmap — Project 01: Smart Lab Booking System

---

## 📌 Active Milestones

### Milestone 1: Governing Skills & Architecture Alignment (Completed)
- [x] **Acknowledge Upstream Skills Source:** Sourced from `mattpocock/skills` (`https://github.com/mattpocock/skills`).
- [x] **RBAC & TALT Team Role Normalization:** Eliminated `"talt"` role string in favor of valid database roles `"TA"`, `"LabTech"`, `"Teacher"`, `"Admin"`, `"HoD"`.
- [x] **Universal Response Envelope (`Result<T>`):** Standardized all client-facing server endpoints to return `{ ok, success, data, message }`.
- [x] **3-Tier Caching Pipeline:** Implemented Layer 1 (ScriptCache) $\rightarrow$ Layer 2 (ScriptProperties snapshot) $\rightarrow$ Layer 3 (Spreadsheet fallback).
- [x] **Universal Branding & Split Footer:** Implemented non-uppercase highlighted acronym subtitle and responsive 2-column split footer (`Vibe Coded by Nattapat Poolyam, 2026`).
- [x] **Stealth Developer Admin Gateway:** Added `Ctrl + Shift + Q` / signature click trigger guarded by PIN `2026`.
- [x] **Documentation Standard:** Scaffolding under `docs/` (`Project_Profile.md`, `Planning.md`, `DevLog.md`, `CHANGELOG.md`, `docs/adr/`).

### Milestone 2: Adaptive Calendar Grid & Persistent Setup Outages (Active)
- [x] **Adaptive Grid Specification:** Documented continuous physical time coordinate mapping (`07:30–16:30`), ghost target slots, and multi-chip stacking in `docs/Adaptive_Calendar_Grid_Spec.md`.
- [x] **Setup Hold Outage Policy:** Formulated `SetupHold` / `ApparatusLock` outage category with email suppression guards for continuing lab activities.
- [ ] **Outages Schema Extension:** Add `OutageType`, `LinkedSubject`, and `SuppressEmail` columns to `Outages` sheet.
- [ ] **TALT Setup Hold Management Modal:** Extend outage creation interface to declare apparatus hold windows without triggering disruptive teacher emails.
- [ ] **Adaptive Grid Rendering:** Implement dynamic period position calculations (`calculateGridCoordinates`) and responsive mobile day-carousel.

### Milestone 3: Pre-Release Polish & Benchmark Promotion (Upcoming)
- [ ] Execute 6-Pillar Pre-Release Protocol.
- [ ] End-to-end rehearsal across Teacher and LabTech workflows.
- [ ] Synchronize versioning across config tabs and promote to stable benchmark release.

