# 📅 Project Profile — Project 01: Smart Lab Booking System

---

## 🏛️ 1. Metadata & Governance
* **Project ID:** `01`
* **Project Title:** Smart Lab Booking System
* **Ecosystem:** **Lab Oops OS** (*Science Laboratory Operations & Oppositely-Organized Problems Solved Operating System*)
* **Organization:** MUIDS — Science Department
* **Lead Architect:** Nattapat Poolyam (Mek)
* **SuperAdmin:** configured in the Script Property `SUPERADMIN_EMAILS` (never stored in code or docs; see ADR-0002)
* **Timezone:** `Asia/Bangkok` (UTC+07:00)
* **Current Version:** `v1.1.3c` (code) · `v1.4.0b` (planning baseline)
* **Platform & Stack:** Google Apps Script (V8) + Google Sheets + Tailwind CSS + Lucide Icons

---

## 🎯 2. Purpose & Scope
The Smart Lab Booking System provides high-integrity, concurrency-controlled science laboratory reservations for teachers, lab technicians and teaching assistants. It prevents double-booking across shared physical laboratory spaces (rooms 204–315) through server-side `LockService` mutex transactions, dynamic Day A–E calendar integration, and multi-tier role-based access control.

---

## 👥 3. RBAC & Roles
Roles come from Master DB `Users.Role` (one value per user). Full matrix: `IMPLEMENTATION_PLAN.md` §2.1.

* **`Teacher`:** Reserve labs, view personal schedules and the read-only Master Calendar, select slot batches, cancel and postpone **only their own** reservations (`TargetUserID` matching the session user; 24-hour lock applies), approve TALT-initiated swaps of their own bookings, and open the read-only forensic log viewer.
* **`LabTech`:** Full operational management: approve/deny bookings, approve postponements, mark lab outages (`Maintenance`, `SetupHold`), assign technicians, override rooms, view system-wide schedules, and bypass the lead-time rules with an audited justification.
* **`TA`:** **Equal authority to `LabTech`.**
* **`Admin`:** All TALT authority plus system configuration, diagnostics, user permission management and admin-only impersonation (preview and dry-run).
* **`HoD`:** **Strictly executive read-only.** Views schedules, the Master Calendar, forensic logs and statistics. Cannot book, cannot act as a proxy, and **cannot be the `TargetUserID` of an on-behalf booking** (`TARGET_ROLE_INELIGIBLE`; D-43). Cannot approve, deny, cancel, postpone, submit, assign, manage outages or edit configuration.
* **`Student`:** Passes the domain perimeter but holds **zero permissions** until a Student module exists.
* **SuperAdmin:** not a database role; a Script Property applying only to a resolved, whitelisted active user. Inherits `Admin` plus diagnostics, impersonation and configuration.

> **Note on Team Moniker:** `TALT` is strictly an organisational team moniker (*Teaching Assistants & Lab Technicians*), not a database role.

---

## 🗄️ 4. Database & Federated Spreadsheets
The application operates across **three federated Google Spreadsheets** and consumes **12 tabs**. Authoritative headers: [`SCHEMA_CONTRACT.md`](./SCHEMA_CONTRACT.md).

1. **Local Lab Booking Sheet (`<LOCAL_SPREADSHEET_ID>`)** — read/write:
   - `Bookings` (25 columns, replaces legacy `Transactions`), `Outages` (13), `Duties` (9, includes `IsActive`), `Config` (5), `Logs` (7), `Stats` (12).
2. **Master DB 2026 (`<MASTER_DB_ID>`)** — **read-only**:
   - `Users` (8), `Subjects` (5), `Room` (5; all rows bookable, no capacity, subject tags, status or RoomType filter; replaces legacy `Labs`; D-38), `Academic_Calendar` (10; replaces legacy `Calendar`), `Bell_Schedules` (8; replaces legacy `Bell`).
   - Not consumed (documented only): `Global_Config`, `Config`, `Logs`.
3. **Timetable 2026 (`<TIMETABLE_2026_ID>`)** — **read-only**:
   - `Index` (7 columns; replaces legacy `TeacherTimeTables`).
   - Not consumed: `TimeTable 2026` grid, `Template`, per-teacher pages, `Config`, `Logs`.

Booking ownership is `Bookings.TargetUserID` (UserID only). Nickname and email come from `Users`.

---

## 🌐 5. Deployment Topology
* **Deployment Channel:** Standalone Web App URL. Execution model decided by the Phase 0 Identity Spike.
* **Frame Security:** `HtmlService.XFrameOptionsMode.DEFAULT`. Embedding in Google Sites or external iframes is **prohibited**.
* **Authentication:** Google Workspace sign-on enforcing `@mahidol.ac.th`, `@student.mahidol.ac.th` and `@student.mahidol.edu` (`@mahidol.edu` prohibited). Domain acceptance is only the perimeter; a user must also hold a role in `Users`.
* **Configuration:** spreadsheet IDs, calendar ID and the SuperAdmin list live in Script Properties, never in the repository.
