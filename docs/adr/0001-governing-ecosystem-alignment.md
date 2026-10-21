# 1. Governing Ecosystem Alignment (Lab Oops OS + GAS Best Practices + Matt Pocock Scaffolding)

Date: 2026-10-10  
Status: Accepted  

## Context
Project 01 (Smart Lab Booking System) operates within the **Lab Oops OS** ecosystem (*Science Laboratory Operations & Oppositely-Organized Problems Solved Operating System*) at MUIDS.
To maintain cross-project consistency, reliability, and security across all 13 child science laboratory systems, the ecosystem enforces a strict three-tier skills hierarchy:
1. **Primary Governing Architecture**: `lab-oops-standards` (Master architectural guidelines, 3-tier caching, SuperAdmin security, universal branding, non-uppercase acronym, 2-column split footer, Stealth Admin Gateway `Ctrl + Shift + Q`, and strict RBAC; see [ADR-0002](./0002-superadmin-pin-removal-and-standard-deviations.md) for PIN removal).
2. **Complementary Engineering**: `gas-best-practices` (Universal `Result<T>` envelope `{ ok: true, data: ..., message: "..." }`, `LockService` concurrency guards, safe identity resolution).
3. **Scaffolding Engine**: `mattpocock/skills` (Scaffolding `docs/`, `GLOSSARY.md`, Architecture Decision Records under `docs/adr/`, sourced from `https://github.com/mattpocock/skills`).

Prior to this alignment, several deviations were identified:
- Legacy references treating organizational team moniker `TALT` (*Teaching Assistants & Lab Technicians*) as a database user role string rather than evaluating `"TA"` and `"LabTech"` individually.
- Inconsistent API return shapes where several endpoints returned raw arrays or thrown exceptions instead of the universal `Result<T>` envelope.
- Missing Layer 2 (`PropertiesService`) persistent fallback in the 3-Tier cache engine.
- Missing 2-column split footer and stealth admin gateway in `Index.html`.
- Documentation structure lacked standardized `Planning.md`, `DevLog.md`, `CHANGELOG.md`, and `docs/adr/`.

## Decision
1. **RBAC Role Nomenclature**:
   - Enforce strictly valid database roles: `"TA"`, `"LabTech"`, `"Teacher"`, `"Admin"`, `"HoD"`.
   - Remove `"talt"` as an authorization role token across all backend gatekeepers (`API_Bridge.js`, `API_Read_User.js`, `API_TALT_Auth.js`, `API_Update_RBAC.js`, `Telemetry.js`, `Health_UAT.js`, `Main.js`, `Utils_Security.js`) and frontend role selectors (`JS_Header.html`, `JS_Core.html`).
2. **Universal Response Envelope (`Result<T>`)**:
   - Standardize all server API routes on `{ ok: true, success: true, data: ..., message: "..." }` and `{ ok: false, success: false, message: "...", error: "..." }`.
   - Ensure client callers evaluate `res.ok` (or `res.ok || res.success`).
3. **3-Tier Caching Architecture**:
   - Layer 1 (In-Memory RAM): `CacheService.getScriptCache()`.
   - Layer 2 (Persistent Properties): `PropertiesService.getScriptProperties()` JSON snapshot fallback.
   - Layer 3 (Live Master Sheet): Direct spreadsheet read executed only on cache misses.
4. **Universal Branding & Stealth Admin Gateway**:
   - Apply non-uppercase acronym styling with emerald highlighted letters (`text-emerald-400 font-extrabold`).
   - Implement responsive 2-column split footer with official developer signature `Vibe Coded by Nattapat Poolyam, 2026`.
   - Implement Stealth Admin Gateway triggered via `Ctrl + Shift + Q` (or `Cmd + Shift + Q`) and by clicking developer signature (client-side PIN removed per ADR-0002/D-27).
5. **Documentation Standard**:
   - Standardize architecture specifications, planning, dev logs, ADRs, and changelogs strictly under `docs/`.

## Consequences
- 100% architectural and operational compliance with the governing Lab Oops OS ecosystem hierarchy.
- Robust concurrency protection, zero identity spoofing, and clean fail-closed perimeter gatekeeping.
- Consistent developer experience and multi-agent interoperability across all 13 child projects.
