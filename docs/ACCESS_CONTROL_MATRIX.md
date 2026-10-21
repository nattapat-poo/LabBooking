# 🔐 Access Control Matrix & Function Exposure Inventory

**Target System:** `Lab Oops OS` — Project 01 (`Smart Lab Booking System`)  
**Document Status:** Formalized Exposure Baseline (Phase 0 / v1.4.0b)  
**Governing Standard:** `gas-best-practices` (`rules/security.md`, `rules/web-app-rpc.md`), `lab-oops-standards` (§1, §13), [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md)  
**Remediation Goal:** Fix Audit Finding `F-02` by inventorying all 50 files in `App_Script/`, establishing the function call graph, privatizing internal functions with trailing `_`, and restricting public entry points strictly to an audited allowlist in `API_Bridge.js`.

---

## 1. File Inventory by Exposure Category (50 Files)

| Category | File Count | File List | Policy / Target Posture |
|---|:---:|---|---|
| **Category 1: Public RPC Gateway** | 1 | `API_Bridge.js` | Sole authorized entry point for `google.script.run`. Every export must be wrapped in `withGatekeeper` and return `Result<T>`. |
| **Category 2: Internal Business Logic & Domain APIs** | 13 | `API_Calendar.js`, `API_Notification.js`, `API_Read_Aggregator.js`, `API_Read_Lab.js`, `API_Read_User.js`, `API_TALT_Auth.js`, `API_TALT_Core.js`, `API_TALT_Report.js`, `API_Update_Meta.js`, `API_Update_RBAC.js`, `API_Validation.js`, `API_Write_Assignment.js`, `API_Write_Core.js` | All internal helper functions must be renamed with trailing `_` (e.g., `coreApproveBooking_`) to prevent direct execution via client-side `google.script.run`. |
| **Category 3: System Utilities & Cross-Cutting Infrastructure** | 7 | `Utils_Cache.js`, `Utils_Config.js`, `Utils_Core.js`, `Utils_DataMapper.js`, `Utils_Schema.js`, `Utils_Security.js`, `Telemetry.js` | System-level services (Layer 1-3 cache, locking, schema mapping, gatekeeper). All functions internal (`_`). |
| **Category 4: Web App Lifecycle & Routing** | 2 | `Main.js`, `Engine_Business.js` | `doGet(e)` / `doPost(e)` entry points. Enforce `XFrameOptionsMode.DEFAULT`, fail closed on unauthenticated users, render `UI_Unauthorized.html`. |
| **Category 5: Diagnostic, UAT & Deprecated Sandboxes** | 8 | `Health_UAT.js`, `Health_Unit_Bridge.js`, `Health_Unit_Core.js`, `Health_Unit_Service.js`, `Sys_Diagnostic.js`, `Mock_Data.js`, `Main_Dev_Sandbox.js`, `Diag_Console.html` | Quarantined. Accessible only if `ENABLE_DIAGNOSTICS === 'true'` AND caller has `Admin` or SuperAdmin status. Prohibited from mutating production sheets. `Main_Dev_Sandbox.js` to be deleted in Phase 6 (`F-17`). |
| **Category 6: Frontend Views, Scripts & Partials** | 17 | `Index.html`, `Client_Bridge.html`, `Grid_Calendar.html`, `JS_Core.html`, `JS_Header.html`, `JS_TALTView.html`, `JS_TeacherView.html`, `JS_Utilities.html`, `Modal_BatchAction.html`, `Modal_Details.html`, `Modal_EmailEditor.html`, `Modal_SelectedSlots.html`, `Modal_Welcome.html`, `Modal_Workload.html`, `Test_Runner.html`, `UI_FallbackError.html`, `UI_Unauthorized.html` | Client templates. Remove client PIN `2026` (`F-18`). Eliminate raw `innerHTML` interpolation (`F-07`). Only call functions declared in `API_Bridge.js`. |
| **Category 7: Project & Manifest Configuration** | 2 | `appsscript.json`, `.clasp.json` | Project metadata. Declare minimal OAuth scopes in `appsscript.json` (`F-13`, `P6-03`). |

---

## 2. Public Client-Callable RPC Allowlist (`API_Bridge.js`)

Only functions listed below are permitted to be called from client-side JavaScript via `google.script.run`. All other functions in `App_Script/` must be private (`_` suffix) or internal.

| Endpoint Name | Wrapped In Gatekeeper? | Action ID Checked | Authorized Roles | Response Envelope |
|---|:---:|:---:|:---:|:---:|
| `getUserProfile` | Yes | `ACTION_VIEW_SCHEDULE` | Teacher, TA, LabTech, Admin, HoD | `Result<UserProfile>` |
| `getCalendarEvents` | Yes | `ACTION_VIEW_SCHEDULE` | Teacher, TA, LabTech, Admin, HoD | `Result<CalendarData>` |
| `getWeeklyScheduleData` | Yes | `ACTION_VIEW_SCHEDULE` | Teacher, TA, LabTech, Admin, HoD | `Result<ScheduleGrid>` |
| `getMyBookings` | Yes | `ACTION_VIEW_OWN_BOOKINGS` | Teacher, TA, LabTech, Admin, HoD | `Result<BookingRow[]>` |
| `getMasterCalendarBookings` | Yes | `ACTION_VIEW_ALL_BOOKINGS` | Teacher, TA, LabTech, Admin, HoD | `Result<BookingRow[]>` |
| `submitBatchBooking` | Yes | `ACTION_SUBMIT_BOOKING` | Teacher (Own), TA/LabTech/Admin (Own/On-behalf) | `Result<BatchSubmitResult>` |
| `cancelBooking` | Yes | `ACTION_CANCEL_BOOKING` | Teacher (Own, >24h), TA/LabTech/Admin (Any, Bypass) | `Result<CancelResult>` |
| `approveBooking` | Yes | `ACTION_APPROVE_BOOKING` | TA, LabTech, Admin | `Result<ApproveResult>` |
| `rejectBooking` | Yes | `ACTION_REJECT_BOOKING` | TA, LabTech, Admin | `Result<RejectResult>` |
| `requestPostpone` | Yes | `ACTION_REQUEST_POSTPONE` | Teacher (Own, >24h), TA/LabTech/Admin (Swap) | `Result<PostponeRequestResult>` |
| `approvePostpone` | Yes | `ACTION_APPROVE_POSTPONE` | Reciprocal: Owner (for TALT swap) or TALT (for Teacher request) | `Result<PostponeApproveResult>` |
| `cancelPostponeRequest` | Yes | `ACTION_CANCEL_POSTPONE_REQUEST` | Initiator or TA/LabTech/Admin | `Result<PostponeCancelResult>` |
| `getLabOutagesList` | Yes | `ACTION_VIEW_SCHEDULE` | Teacher, TA, LabTech, Admin, HoD | `Result<OutageRow[]>` |
| `saveLabOutage` | Yes | `ACTION_MANAGE_OUTAGES` | TA, LabTech, Admin | `Result<OutageResult>` |
| `getTaltWorkloadSummary` | Yes | `ACTION_ASSIGN_ROOM_TECH` | TA, LabTech, Admin | `Result<WorkloadSummary>` |
| `assignLabRoomAndTech` | Yes | `ACTION_ASSIGN_ROOM_TECH` | TA, LabTech, Admin | `Result<AssignResult>` |
| `viewSystemLogs` | Yes | `ACTION_VIEW_LOGS_STATS` | Teacher, TA, LabTech, Admin, HoD (Read-only forensic) | `Result<LogEntry[]>` |
| `viewSystemStats` | Yes | `ACTION_VIEW_LOGS_STATS` | Teacher, TA, LabTech, Admin, HoD (Read-only forensic) | `Result<StatEntry[]>` |
| `getSystemConfig` | Yes | `ACTION_EDIT_CONFIG` | Admin, SuperAdmin | `Result<ConfigEntry[]>` |
| `updateSystemConfig` | Yes | `ACTION_EDIT_CONFIG` | Admin, SuperAdmin | `Result<ConfigUpdateResult>` |
| `runDiagnosticsSuite` | Yes | `ACTION_RUN_DIAGNOSTICS` | Admin, SuperAdmin (Requires `ENABLE_DIAGNOSTICS`) | `Result<DiagnosticReport>` |
| `impersonateUserPreview` | Yes | `ACTION_IMPERSONATE_PREVIEW` | Admin, SuperAdmin (Dry-run only) | `Result<ImpersonationSession>` |

---

## 3. Function Call Graph & Privatization Mapping (Phase 1 Target)

The table below catalogs major top-level functions in `App_Script/` that currently lack a trailing `_` and must be privatized to resolve `F-02`.

| File | Current Function Name | Exposure Risk | Target Action | Target Function Name |
|---|---|:---:|---|---|
| `API_Write_Core.js` | `coreApproveBooking` | **Critical** (F-02, F-08) | Privatize | `coreApproveBooking_` |
| `API_Write_Core.js` | `coreRejectBooking` | **Critical** (F-02, F-08) | Privatize | `coreRejectBooking_` |
| `API_Write_Core.js` | `coreCancelBooking` | **Critical** (F-02, F-08) | Privatize | `coreCancelBooking_` |
| `API_Write_Assignment.js` | `assignLabAndTech` | **High** (F-02) | Privatize | `assignLabAndTech_` |
| `API_Read_Aggregator.js` | `getAggregatedSchedule` | **High** (F-02) | Privatize | `getAggregatedSchedule_` |
| `API_Read_Lab.js` | `getLabInventory` | **Medium** (F-02) | Privatize | `getLabInventory_` |
| `API_Read_User.js` | `getUserDirectoryData` | **High** (F-02) | Privatize | `getUserDirectoryData_` |
| `API_Calendar.js` | `syncBookingToCalendar` | **High** (F-02) | Privatize | `syncBookingToCalendar_` |
| `API_Notification.js` | `sendBookingNotification` | **Medium** (F-02) | Privatize | `sendBookingNotification_` |
| `Utils_Core.js` | `readSheetDataRaw` | **High** (F-02) | Privatize | `readSheetDataRaw_` |
| `Utils_Core.js` | `writeSheetRowTargeted` | **High** (F-02) | Privatize | `writeSheetRowTargeted_` |
| `Utils_DataMapper.js` | `mapRowToBooking` | **Medium** (F-02) | Privatize | `mapRowToBooking_` |
| `Utils_Security.js` | `resolveSessionEmail` | **High** (F-02) | Privatize | `resolveSessionEmail_` |
| `Health_UAT.js` | `runFullUatSuite` | **Critical** (F-04) | Privatize / Gate | `runFullUatSuite_` |

---

## 4. Web App Route Access Matrix (`Main.js`)

| Route / Parameter | Required Role | Failure Behavior | Exploit Remediated |
|---|---|---|:---:|
| Root (`GET /`) | Any whitelisted user (`Teacher`, `TA`, `LabTech`, `Admin`, `HoD`) | Renders `UI_Unauthorized.html` | Fail-closed access |
| Student Domain (`@student.*`) | `Student` | Displays read-only informational holding screen (`D-08`) | Role containment |
| Outside Domain / Unresolved | None | Renders `UI_Unauthorized.html` (`AUTH_DENIED`) | Fail-closed auth (`F-03`) |
| Admin View (`?p=admin`) | `Role === 'Admin'` or SuperAdmin | Renders `UI_Unauthorized.html` (`AUTH_DENIED`) | Route spoofing (`F-10`) |
| Diagnostics (`?p=diag`) | `Admin` / SuperAdmin AND `ENABLE_DIAGNOSTICS === 'true'` | Returns HTTP 403 / `UI_Unauthorized.html` | Diagnostic leakage (`F-04`) |

---

## 5. Implementation Verification Protocol

1. **Static Sweep:** In Phase 1 (`P1-03`, `P1-04`), run `node scripts/verify_phase.js --phase 1` to assert that zero internal functions in `App_Script/` (outside `API_Bridge.js` and `Main.js`) lack a trailing `_`.
2. **Callable Allowlist Audit:** Run `testPublicFunctionAllowlist()` to confirm that `API_Bridge.js` strictly exports the approved list of 22 endpoints.
