# 📋 Changelog — Project 01: Smart Lab Booking System

All notable changes to this project will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), conforming to **Lab Oops OS** ecosystem standards.

---

## [1.1.3c] — 2026-10-10

### 🏛️ Governing Skills Alignment Release
Aligned project with the 3 governing skills:
* **Primary:** `lab-oops-standards` (Rule 26: 3-tier caching, SuperAdmin security, universal branding, 2-column split footer, Stealth Admin Gateway `Ctrl + Shift + Q` / PIN `2026`).
* **Complementary:** `gas-best-practices` (`Result<T>` envelope, `LockService` concurrency guards, safe identity resolution).
* **Scaffolding:** `mattpocock/skills` (`setup-matt-pocock-skills`, ADRs, and ubiquitous language).

### Added
* **2-Column Split Footer**: Standard responsive footer in [`Index.html`](file:///c:/Users/MUIDS/Documents/Projects/Lab%20Oops/Project01_LabBooking/App_Script/Index.html) featuring left-side app & ecosystem branding and right-side official developer signature `Vibe Coded by Nattapat Poolyam, 2026` with highlighted acronym legend.
* **Stealth Developer Admin Gateway**: Added `Ctrl + Shift + Q` (and `Cmd + Shift + Q`) keyboard listener and signature click trigger in [`Index.html`](file:///c:/Users/MUIDS/Documents/Projects/Lab%20Oops/Project01_LabBooking/App_Script/Index.html), guarded by security PIN `2026`.
* **3-Tier Caching Pipeline**: Added Layer 2 (`PropertiesService.getScriptProperties()`) persistent JSON snapshot fallback to [`Utils_Cache.js`](file:///c:/Users/MUIDS/Documents/Projects/Lab%20Oops/Project01_LabBooking/App_Script/Utils_Cache.js).
* **Mandatory Sheets Support**: Added `CFG_COL`, `LOG_COL`, and `STA_COL` canonical schemas to [`Utils_Schema.js`](file:///c:/Users/MUIDS/Documents/Projects/Lab%20Oops/Project01_LabBooking/App_Script/Utils_Schema.js) and `recordUserTelemetry()` to [`Telemetry.js`](file:///c:/Users/MUIDS/Documents/Projects/Lab%20Oops/Project01_LabBooking/App_Script/Telemetry.js).
* **Safe Identity Resolution & SuperAdmin Gatekeeper**: Added `getActorEmailSafe()` and `verifySuperAdminAccess()` to [`Utils_Security.js`](file:///c:/Users/MUIDS/Documents/Projects/Lab%20Oops/Project01_LabBooking/App_Script/Utils_Security.js) terminating at SuperAdmin `nattapat.poo@mahidol.ac.th`.
* **Architecture Decision Record**: Scaffolding under [`docs/adr/0001-governing-ecosystem-alignment.md`](file:///c:/Users/MUIDS/Documents/Projects/Lab%20Oops/Project01_LabBooking/docs/adr/0001-governing-ecosystem-alignment.md).
* **Project Specifications**: Added [`docs/Project_Profile.md`](file:///c:/Users/MUIDS/Documents/Projects/Lab%20Oops/Project01_LabBooking/docs/Project_Profile.md), [`docs/Planning.md`](file:///c:/Users/MUIDS/Documents/Projects/Lab%20Oops/Project01_LabBooking/docs/Planning.md), and [`docs/DevLog.md`](file:///c:/Users/MUIDS/Documents/Projects/Lab%20Oops/Project01_LabBooking/docs/DevLog.md).

### Changed
* **RBAC & TALT Team Role Normalization**:
  - Replaced all `"talt"` role checks with permitted roles (`"TA"`, `"LabTech"`, `"Teacher"`, `"Admin"`, `"HoD"`) across [`API_Bridge.js`](file:///c:/Users/MUIDS/Documents/Projects/Lab%20Oops/Project01_LabBooking/App_Script/API_Bridge.js), [`API_Read_User.js`](file:///c:/Users/MUIDS/Documents/Projects/Lab%20Oops/Project01_LabBooking/App_Script/API_Read_User.js), [`API_TALT_Auth.js`](file:///c:/Users/MUIDS/Documents/Projects/Lab%20Oops/Project01_LabBooking/App_Script/API_TALT_Auth.js), [`API_Update_RBAC.js`](file:///c:/Users/MUIDS/Documents/Projects/Lab%20Oops/Project01_LabBooking/App_Script/API_Update_RBAC.js), [`Health_UAT.js`](file:///c:/Users/MUIDS/Documents/Projects/Lab%20Oops/Project01_LabBooking/App_Script/Health_UAT.js), [`Main.js`](file:///c:/Users/MUIDS/Documents/Projects/Lab%20Oops/Project01_LabBooking/App_Script/Main.js), [`Telemetry.js`](file:///c:/Users/MUIDS/Documents/Projects/Lab%20Oops/Project01_LabBooking/App_Script/Telemetry.js), [`Utils_Security.js`](file:///c:/Users/MUIDS/Documents/Projects/Lab%20Oops/Project01_LabBooking/App_Script/Utils_Security.js), [`JS_Header.html`](file:///c:/Users/MUIDS/Documents/Projects/Lab%20Oops/Project01_LabBooking/App_Script/JS_Header.html), and [`JS_Core.html`](file:///c:/Users/MUIDS/Documents/Projects/Lab%20Oops/Project01_LabBooking/App_Script/JS_Core.html).
  - Updated role dropdown switcher in `JS_Header.html` to include `"Teacher"`, `"Lab Tech"`, `"TA"`, and `"System Admin"`.
* **Universal Response Envelope (`Result<T>`)**:
  - Refactored `API_Bridge.js` functions (`bridgeGetUserInfo`, `bridgeGetTeacherList`, `bridgeGetLabList`, `bridgeGetSubjectList`, `bridgeGetLabOutages`, `bridgeGetLabAssignmentContext`, `bridgeSearchTeachers`, `bridgeSubmitBooking`, `bridgeApproveBooking`, `bridgeRejectBooking`, `bridgeCancelBooking`, `getCalendarDayType`, `getBellType`) to consistently return standard `{ ok, success, data/payload, message, error }` envelopes.
  - Updated client handler in `JS_Core.html` to evaluate `response.ok` / `response.success`.
* **Universal Branding & Acronym Styling**:
  - Updated `JS_Header.html` acronym letters to `text-emerald-400 font-extrabold` without CSS uppercase.
* **Concurrency Locking**:
  - Updated `withLock` in [`Utils_Core.js`](file:///c:/Users/MUIDS/Documents/Projects/Lab%20Oops/Project01_LabBooking/App_Script/Utils_Core.js) to accept configurable `timeoutMs` defaulting to 30,000ms.
