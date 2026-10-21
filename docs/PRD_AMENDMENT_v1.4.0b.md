# 📎 PRD Amendment v1.4.0b — Supersedes Selected Statements in PRD / Design Spec / Appendix v1.1.3c

**Status:** Binding for implementation of `v1.4.0b`. The v1.1.3c documents are **Locked** and are not edited in place; where they conflict with this amendment, **this amendment wins**.
**Date:** 2026-10-19 · **Decider:** Lead Architect (Owner)
**Scope:** data model, roles, statuses, deployment and security decisions D-01 … D-36 in [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md).

Documents affected: `Lab Booking App - PRD v1.1.3c.md`, `Lab Booking App - Design Spec v1.1.3c.md`, `Lab Booking App - Appendix v1.1.3c.md`, and the legacy Cycle 15 documents (`CodebaseMap15.md`, `AllFunctions[15].md`, `DevLog15.md`).

---

## 1. Superseded statements

| # | v1.1.3c statement (topic) | v1.4.0b rule | Decision |
|---|---|---|---|
| 1 | Booking sheet is named `Transactions`; columns are formula-driven in places. | Tab is `Bookings` (25 columns, plain values written by the server). `BookingID` is a server UUID. | D-05, D-36 |
| 2 | Single spreadsheet holds Users, Labs, Calendar, Bell, TeacherTimeTables, Duties, Subjects. | Three federated spreadsheets; Users/Subjects/Room/Academic_Calendar/Bell_Schedules come from Master DB 2026 and `Index` from Timetable 2026 (both read-only). `Duties` stays local. | D-05 |
| 3 | `Labs` carries capacity, status and subject tags. | `Room` has none of these. Bookability is derived from Room + Academic_Calendar + Bell_Schedules + Outages + live bookings. Capacity and subject tags are dropped. | D-29 |
| 4 | Roles are `Teacher`, `LabTech`, `TA` with `isHoD` and `Can_Edit_Config` flags. | Roles are `Teacher`, `TA`, `LabTech`, `Admin`, `HoD`, `Student` (single value in `Users.Role`). `isHoD` and `Can_Edit_Config` are derived. SuperAdmin is a Script Property (ADR-0002). | D-18, D-26 |
| 5 | `TA` only views and inspects (Project Profile). | `TA` has the same authority as `LabTech`. | D-03 |
| 6 | `HoD` can approve, bypass lead time and book as a proxy. | `HoD` is **executive read-only**: no mutating action. | D-10, D-24 |
| 7 | Student-facing view is out of scope. | Student-domain accounts pass the perimeter but hold **zero** permissions. | D-08 |
| 8 | Booking requires at least 2 instructional days; cancel/postpone locked within 24 hours (teachers). | **Unchanged.** Instructional days come from `Academic_Calendar.IsInstructional`. TALT bypass (`TA`, `LabTech`, `Admin`) is audited. | D-07 |
| 9 | Postponement creates a linked pending request; wording varies. | Two-way approval linked-row workflow with cancellation in both modes and **no timeout** (auto-revert at slot start). See ADR-0003. | D-04, D-23 |
| 10 | Booking owner identified by teacher name/email in places. | Owner = `TargetUserID` (UserID only); nickname and email are looked up through `Users`. | D-21 |
| 11 | App embedded in a Google Site (`ALLOWALL`). | Standalone Web App URL, `XFrameOptionsMode.DEFAULT`. | D-20 |
| 12 | Environment IDs read from the Config sheet / hardcoded. | IDs and SuperAdmin list live in Script Properties; the Config tab never holds security-critical values. | D-13, D-14, D-35 |
| 13 | Client-side developer PIN gateway. | Removed. | D-27, ADR-0002 |
| 14 | Teachers have no access to logs. | All roles except `Student` get a **read-only** forensic log viewer (event details and emails). | D-25 |
| 15 | `loggedInUserId` / `userEmail` are client-supplied parameters. | Signatures are kept for contract compatibility, but identity is derived server-side and a mismatch is rejected with `AUTH_DENIED`. | D-01 … D-03 |
| 16 | Default bell schedule is unstated or assumed. | When `Academic_Calendar.BellScheduleOverride` is blank, effective `BellType` is `Wed` if `DayOfWeek` is Wednesday, otherwise `Regular`. | D-37 |
| 17 | Only rooms with a "Lab" designation or `RoomType` are bookable. | All `Room` rows are bookable, including non-lab rooms used for classroom/lab activity. No `RoomType` filter. Future restriction deferred to BL-01 via `isRoomEligible_` seam; timetable verification retained. | D-38, BL-01 |
| 18 | Prior workaround permitting proxy booking for HoD. | HoD is strictly read-only: cannot book, cannot proxy, and **cannot be the `TargetUserID` of an on-behalf booking** (`TARGET_ROLE_INELIGIBLE`). Workaround withdrawn. | D-43 |
| 19 | `Action Required` and `Error (Calendar)` treated as booking statuses. | Confirmed non-statuses: revalidations go to `Remark`/`Logs`; calendar errors go to `GCalEventID = ERROR:<code>` with standard vocabulary; retries tracked outside sheet. | D-40, D-41 |

## 2. Status vocabulary mapping

| v1.1.3c / legacy value | v1.4.0b stored value |
|---|---|
| `Await Confirmation`, `Pending` | `PENDING` |
| `Booked`, `Confirmed`, `Booked (Lab Support)`, `Confirmed (Lab Support)` | `APPROVED` |
| `Denied` | `DENIED` |
| `Cancelled`, `Cancelled by User`, `Cancelled (Admin)` | `CANCELLED` |
| `Pending (Postponement)` | `POSTPONE_PENDING_TALT` or `POSTPONE_PENDING_TEACHER` (by initiator) |
| `Cancelled (Postponed)`, `Postponed` | `POSTPONED` |
| `Action Required`, `Error (Calendar)` | Not statuses. Revalidation results go to `Remark`/`Logs`; calendar failures are recorded as `GCalEventID = ERROR:<code>` (confirmed by D-40, D-41). |

Any existing rows in a live sheet using legacy strings require a one-time migration approved by the Owner before Phase 2 goes live. UI labels may remain friendly (for example `DENIED` is displayed as "Denied").

## 3. Unchanged by this amendment
Lead-time rule, workload limits and soft bypass, P2 split-bell logic, short-lab handling, batch atomicity, outage auto-cancel behaviour, calendar guest logic, lock wait of 30 seconds with the busy message, and all UAT behaviour in PRD §14 remain the **baseline to preserve**. Phase 2 must not regress them.
