# 📅 Project Profile — Project 01: Smart Lab Booking System

---

## 🏛️ 1. Metadata & Governance
* **Project ID:** `01`
* **Project Title:** Smart Lab Booking System
* **Ecosystem:** **Lab Oops OS** (*Science Laboratory Operations & Oppositely-Organized Problems Solved Operating System*)
* **Organization:** MUIDS — Science Department
* **Lead Architect & SuperAdmin:** Nattapat Poolyam (Mek) (`nattapat.poo@mahidol.ac.th`)
* **Timezone:** `Asia/Bangkok` (UTC+07:00)
* **Current Version:** `v1.1.3c`
* **Platform & Stack:** Google Apps Script (V8) + Google Sheets + Tailwind CSS + Lucide Icons

---

## 🎯 2. Purpose & Scope
The Smart Lab Booking System provides high-integrity, concurrency-controlled science laboratory reservations for teachers, lab technicians, and teaching assistants. It prevents double-booking across shared physical laboratory spaces (rooms 204–315) through server-side `LockService` mutex transactions, dynamic Day A–E calendar integration, and multi-tier role-based access control.

---

## 👥 3. RBAC & Roles
* **`Teacher`:** Reserve science laboratories, view personal schedules, select slot batches, cancel owned reservations.
* **`LabTech`:** Approve/reject bookings, mark lab outages/maintenance, view system-wide schedules and workload statistics.
* **`TA`:** View schedules, support logistics, inspect booking requests.
* **`Admin`:** Full administrative control, system revalidation, and user permission management.
* **`HoD`:** Executive overview, subject-wide allocations, and capacity reporting.

> **Note on Team Moniker:** `TALT` is strictly an organizational team moniker (*Teaching Assistants & Lab Technicians*), not a database role.

---

## 🗄️ 4. Database & Sheets
* **Primary Spreadsheet ID:** `1XdkCQHFm-qFZcSFnUVL_2M3m3dSl1d5s2ztImAd8wvM`
* **Canonical Sheet Tabs:**
  - `Transactions`: Active and historical laboratory bookings.
  - `Labs`: Physical lab facilities, room numbers, capacities, and assigned subjects.
  - `Users`: Faculty and staff directory with assigned roles.
  - `Duties`: Teaching and lab technician duty allocations.
  - `Outages`: Scheduled laboratory maintenance windows.
  - `Calendar`: Daily timeline with rotational Day A–E mapping.
  - `Bell`: Bell timing templates.
  - `Config`: Dynamic parameters engine (3-tier cache backed).
  - `Logs`: Concurrency-locked audit forensics trail.
  - `Stats`: User telemetry and UX adoption telemetry.
