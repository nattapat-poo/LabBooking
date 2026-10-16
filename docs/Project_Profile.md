# 📅 Project Profile — Project 01: Smart Lab Booking System

---

## 🏛️ 1. Metadata & Governance
* **Project ID:** `01`
* **Project Title:** Smart Lab Booking System
* **Ecosystem:** **Lab Oops OS** (*Science Laboratory Operations & Oppositely-Organized Problems Solved Operating System*)
* **Organization:** MUIDS — Science Department
* **Lead Architect & SuperAdmin:** Nattapat Poolyam (Mek) (`nattapat.poo@mahidol.ac.th`)
* **Timezone:** `Asia/Bangkok` (UTC+07:00)
* **Current Version:** `v1.4.0a`
* **Platform & Stack:** Google Apps Script (V8) + Google Sheets + Tailwind CSS + Lucide Icons

---

## 🎯 2. Purpose & Scope
The Smart Lab Booking System provides high-integrity, concurrency-controlled science laboratory reservations for teachers, lab technicians, and teaching assistants. It prevents double-booking across shared physical laboratory spaces (rooms 204–315) through server-side `LockService` mutex transactions, dynamic Day A–E calendar integration, and multi-tier role-based access control.

---

## 👥 3. RBAC & Roles
* **`Teacher`:** Reserve science laboratories, view personal schedules, select slot batches, cancel and postpone **only their own** reservations (`TargetUserID` matching user session), and view forensic logs & telemetry statistics.
* **`LabTech`:** Full operational management — approve/reject bookings, mark lab outages (`Maintenance` & `SetupHold`), assign technicians, override rooms, and view system-wide schedules.
* **`TA`:** **Equal authority to LabTech** — approve/reject bookings, approve postponements, assign technicians, override rooms, manage outages, and view system-wide schedules.
* **`Admin`:** Full administrative control — approve bookings, manage outages, edit system configuration, user permission management, and system diagnostics.
* **`HoD`:** Executive overview — subject-wide allocations, capacity reporting, forensic logs, and telemetry statistics. **HoD cannot approve standard bookings.**

> **Note on Team Moniker:** `TALT` is strictly an organizational team moniker (*Teaching Assistants & Lab Technicians*), not a database role.

---

## 🗄️ 4. Database & Federated Spreadsheets
The application architecture operates across **three federated Google Spreadsheets**:

1. **Local Transactional Spreadsheet (`<LOCAL_SPREADSHEET_ID>`):**
   - `Bookings`: Active and historical laboratory bookings (25 columns, replacing legacy `Transactions`).
   - `Outages`: Scheduled laboratory maintenance & `SetupHold` persistent apparatus locks (13 columns).
   - `Duties`: Fixed, non-lab responsibilities for technicians/TAs (8 columns).
   - `Config`: Dynamic parameters engine (3-tier cache backed, 5 columns).
   - `Logs`: Concurrency-locked audit forensics trail (7 columns).
   - `Stats`: Aggregated user telemetry and operational metrics (12 columns).

2. **Master DB 2026 (`<MASTER_DB_ID>`) — Read-Only:**
   - `Users`: Faculty, staff, and student directory with assigned roles and primary subjects (8 columns).
   - `Subjects`: Centralized subject catalog and grade classifications (5 columns).
   - `Room`: Physical laboratory facilities, room numbers, capacities, and subject tags (4 columns, replaces legacy `Labs`).
   - `Academic_Calendar`: Rotational cycle Day A–E mapping and bell flags (6 columns, replaces legacy `Calendar`).
   - `Bell_Schedules`: Period timing templates, start/end bounds, and grade splits (8 columns, replaces legacy `Bell`).

3. **Timetable 2026 (`<TIMETABLE_2026_ID>`) — Read-Only:**
   - `Index`: Master teaching timetable mapping teachers to day types (`Day`), periods, subjects, rooms, and sections (7 columns, replaces legacy `TeacherTimeTables`).

---

## 🌐 5. Deployment Topology
* **Deployment Channel:** **Standalone Web App URL** (`https://script.google.com/a/.../exec`).
* **Frame Security:** `HtmlService.XFrameOptionsMode.DEFAULT` (`SAMEORIGIN`). Embedding in Google Sites or external iframes is **strictly prohibited**.
* **Authentication:** Google Workspace Single Sign-On (SSO) enforcing `@mahidol.ac.th`, `@student.mahidol.ac.th`, and `@student.mahidol.edu`.
