# 📑 Schema Contract: MUIDS Lab Booking System (v1.4.0b)

**Target System:** `Lab Oops OS` — Project 01 (`Smart Lab Booking System`)
**Updated:** 2026-10-19 (Owner-supplied tab and column lists, decisions D-21 … D-36)
**Verification status:** Header names were supplied by the Lead Architect. **Live verification is pending** (checklist `P0-17`: owner-run, read-only header dump; commit only header names and a SHA-256 of each header row, never data rows).
**Governance:** [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md), `AGENTS.md`, `lab-oops-standards`, `gas-best-practices`
**Placeholders:** `<LOCAL_SPREADSHEET_ID>`, `<DEV_SPREADSHEET_ID>`, `<MASTER_DB_ID>`, `<TIMETABLE_2026_ID>`, `<CALENDAR_ID>`. Real IDs live only in Script Properties.

---

## 1. Architecture Overview

The system reads and writes **three federated Google Spreadsheets**. The application consumes **12 tabs** in total.

| Spreadsheet | Access | Consumed tabs (count) | Not-consumed tabs (documented for completeness) |
|---|---|---|---|
| Local Lab Booking Sheet (`<LOCAL_SPREADSHEET_ID>`) | Read / Write (under `LockService`) | `Bookings`, `Outages`, `Duties`, `Config`, `Logs`, `Stats` (**6**) | none |
| Master DB 2026 (`<MASTER_DB_ID>`) | **Read-only** | `Users`, `Subjects`, `Academic_Calendar`, `Bell_Schedules`, `Room` (**5**) | `Global_Config`, `Config`, `Logs` |
| Timetable 2026 (`<TIMETABLE_2026_ID>`) | **Read-only** | `Index` (**1**) | `TimeTable 2026` (grid), `Template`, per-teacher pages, `Config`, `Logs` |

Read-only enforcement is layered: (1) the deploying account holds **Viewer** permission on Master DB and Timetable 2026 so any accidental write fails at the platform level; (2) a static check (`P2-04`) forbids write calls against external tabs.

### 1.1 Global Rules

1. **Header matching:** headers are compared after `trim()` and case-insensitively. A missing required header throws `SCHEMA_HEADER_MISMATCH`. There is **no** fallback to hardcoded column indexes.
2. **Plain values only in `Bookings`:** the server computes `DayType`, `BellType`, `TimeSlotID`, `User`, `Teacher`, `LabName` and `BookingID` at write time. The server never writes into a column governed by an array formula. If the live header row contains array formulas, the header dump (`P0-17`) must report them and the owner must convert them to plain columns before Phase 2.
3. **Stable identifiers:** `UserID` in Master DB `Users` must be a stable, non-formula, never-reused value. If it is generated from row position, deleting a row would re-assign IDs and silently re-own bookings. The audit in `P1-27` verifies this before enforcement.
4. **Denormalised nicknames:** `User`, `Teacher`, `ConfirmedBy`, `AssignedTaltName` are snapshots written at booking time. Historical rows keep the nickname even after the user's `Users` row is deleted.
5. **No PII in docs:** this contract lists structure only.

---

## 2. Local Lab Booking Sheet (`<LOCAL_SPREADSHEET_ID>`)

### 2.1 Tab: `Bookings` (25 columns)
*Replaces legacy `Transactions`. The code constant is `SHEETS.BOOKINGS`; the tab name is never hardcoded elsewhere.*

| Col | Header | Type | Nullable | Description |
|:---:|---|---|:---:|---|
| A | `BookingID` | String | No | Server-generated UUID (`Utilities.getUuid()`). Primary key. |
| B | `BatchID` | String | Yes | Shared identifier for slots submitted together. |
| C | `SubmittedByUserID` | String | No | **UserID** of the operator who submitted (TALT in on-behalf mode). |
| D | `User` | String | No | Nickname of the operator (snapshot). |
| E | `TargetUserID` | String | No | **UserID only.** The legal booking owner. Email and nickname are looked up through `Users`. |
| F | `Teacher` | String | No | Nickname of the booking owner (snapshot). |
| G | `Subject` | String | No | Academic subject. |
| H | `LabID` | String | No | `Room.RoomID` of the reserved lab. |
| I | `LabName` | String | No | `Room.RoomName` (snapshot). |
| J | `Date` | Date | No | Reservation date. |
| K | `Period` | String | No | Bell period (`HR`, `1`–`8`). |
| L | `Section` | String | No | Class section. |
| M | `DayType` | String | No | `A`–`E`, from `Academic_Calendar.DayType`. |
| N | `BellType` | String | No | Effective bell type for the date. |
| O | `TimeSlotID` | String | No | Composite slot key (`TS_P<Period>_<BellType>`). |
| P | `LabTitle` | String | No | Purpose or title of the lab activity. |
| Q | `Status` | String | No | One of the seven values in §6. |
| R | `BookingTimeStamp` | DateTime | No | Submission time in `Asia/Bangkok`. |
| S | `ConfirmUserId` | String | Yes | **UserID** of the staff member who approved or denied. |
| T | `ConfirmedBy` | String | Yes | Nickname of the confirming staff member (snapshot). |
| U | `AssignedTaltID` | String | Yes | **UserID(s)** of assigned technician(s), comma-separated. |
| V | `AssignedTaltName` | String | Yes | Nickname(s) of assigned technician(s) (snapshot). |
| W | `Remark` | String | Yes | Append-only note stack, chronological ascending: `[YYYY-MM-DD HH:mm Nickname]: text`. Holds denial reasons and `[URGENT_BYPASS …]` tags. Never overwritten. |
| X | `GCalEventID` | String | Yes | Google Calendar event ID. Empty = not synced. `ERROR:<code>` = sync failed, eligible for retry with backoff (confirmed by D-40). See vocabulary below. |
| Y | `LinkedBookingID` | String | Yes | For postponement: the `BookingID` of the counterpart row (§7.5). |

#### Calendar Sync Failure Vocabulary (`GCalEventID = ERROR:<code>`) — D-40 *(Vocabulary ASSUMED)*
When a Google Calendar event sync fails, `GCalEventID` records `ERROR:<code>` using the following standardized error codes:

| Code | Meaning | Recovery / Action |
|---|---|---|
| `CALENDAR_API` | Google Calendar API transient error (e.g. HTTP 5xx or network glitch). | Automated retry with exponential backoff; manual retry via `ACTION_TRIGGER_CALENDAR`. |
| `CALENDAR_QUOTA` | Google Calendar API daily/user rate limit or quota exceeded. | Retry after quota replenishment interval. |
| `CALENDAR_NOT_FOUND` | Configured `CALENDAR_ID` does not exist or service account lacks write access. | Requires admin intervention to verify Script Properties. |
| `INVALID_TIME` | Start/End timestamp was malformed or end time is not strictly after start time. | Block retry until slot timing metadata is validated. |

> **Retry State Tracking (D-40):** Retry attempt counts and exponential backoff timestamps are tracked **outside the sheet schema** (stored in `CacheService` or `ScriptProperties` keyed by `BookingID`). The sheet cell stores only the current `ERROR:<code>`. TALT retains a manual retry action (`ACTION_TRIGGER_CALENDAR`).

### 2.2 Tab: `Outages` (13 columns)

| Col | Header | Type | Nullable | Description |
|:---:|---|---|:---:|---|
| A | `OutageID` | String | No | Primary key. |
| B | `LabID` | String | No | `Room.RoomID`. |
| C | `LabName` | String | No | `Room.RoomName`. |
| D | `StartDate` | Date | No | Start of window. |
| E | `EndDate` | Date | No | End of window. |
| F | `AllDay` | Boolean | No | `TRUE` = all periods closed. |
| G | `StartPeriod` | String | Yes | Used when `AllDay` is `FALSE`. |
| H | `EndPeriod` | String | Yes | Used when `AllDay` is `FALSE`. |
| I | `OutageType` | String | No | `Maintenance`, `SetupHold` or `Emergency`. |
| J | `LinkedSubject` | String | Yes | Subject permitted during a `SetupHold`. |
| K | `SuppressEmail` | Boolean | No | `TRUE` suppresses cancellation emails for continuing lab activity. |
| L | `Reason` | String | Yes | Description or justification. |
| M | `Status` | String | No | `Active` or `Resolved`. |

### 2.3 Tab: `Duties` (9 columns)

| Col | Header | Type | Nullable | Description |
|:---:|---|---|:---:|---|
| A | `DutyID` | String | No | Primary key. |
| B | `TeachingBlockID` | String | Yes | Opaque reference string. **Not validated as a foreign key**: `Timetable 2026 / Index` has no block ID. |
| C | `UserID` | String | No | Technician/TA `UserID`. |
| D | `Teacher` | String | No | Nickname (snapshot). |
| E | `DayType` | String | No | `A`–`E`. |
| F | `Period` | String | No | `HR`, `1`–`8`. |
| G | `Subject` | String | No | Duty code (for example `LD 4A`, `Study Hall`). |
| H | `DutyDescription` | String | Yes | Human-readable description. |
| I | `IsActive` | Boolean | No | `FALSE` rows are ignored by workload and availability logic. *(The owner's list spells it `isActive`; matching is case-insensitive, canonical spelling is `IsActive`.)* |

### 2.4 Tab: `Config` (5 columns)

| Col | Header | Type | Nullable | Description |
|:---:|---|---|:---:|---|
| A | `Category` | String | No | `Environment`, `System`, `Email_Subject`, `Email_Body`. |
| B | `Config_Key` | String | No | Unique uppercase key. Primary key. |
| C | `Config_Value` | String | No | Value or template. |
| D | `Description` | String | Yes | Explanation. |
| E | `Placeholders` | String | Yes | Comma-separated template variables. |

> Security-critical settings (spreadsheet IDs, calendar ID, `SUPERADMIN_EMAILS`, `ENABLE_DIAGNOSTICS`, domain whitelist) are **never** stored in this tab, because it is editable by TALT staff. They live in Script Properties or code.

### 2.5 Tab: `Logs` (7 columns)

| Col | Header | Type | Description |
|:---:|---|---|---|
| A | `Timestamp` | DateTime | `Asia/Bangkok`. |
| B | `User ID` | String | Executing actor (the real admin during impersonation). |
| C | `Action` | String | For example `SUBMIT_BATCH`, `APPROVE_BOOKING`, `URGENT_BOOKING_BYPASS`, `POSTPONE_AUTO_REVERT`, `IMPERSONATION_DRY_RUN`. |
| D | `Result Status` | String | `SUCCESS`, `FAIL`, `BLOCKED`, `ERROR`. |
| E | `Total Latency (ms)` | Integer | Duration. |
| F | `Lock Contention?` | Boolean | `TRUE` if lock wait exceeded the threshold. |
| G | `Error/Outcome Message` | String | Sanitised message. Impersonation and urgent-bypass metadata are encoded as a prefix, for example `[IMPERSONATING <UserID>]`. **Never** contains stack traces, tokens or request payloads. |

The forensic viewer shown to non-student roles is **read-only** (§7.6).

### 2.6 Tab: `Stats` (12 columns)

| Col | Header | Type | Description |
|:---:|---|---|---|
| A | `StatDate` | Date | `YYYY-MM-DD`. |
| B | `MetricName` | String | For example `DAILY_BOOKING_VOLUME`. |
| C | `MetricCategory` | String | `THROUGHPUT`, `SECURITY`, `CAPACITY`. |
| D | `PeriodIdentifier` | String | Period or `ALL_DAY`. |
| E | `TotalRequests` | Integer | Attempted requests. |
| F | `TotalApproved` | Integer | Approved bookings. |
| G | `TotalRejected` | Integer | Denied bookings (status `DENIED`). |
| H | `TotalCancelled` | Integer | Cancelled bookings. |
| I | `UrgentBypassCount` | Integer | Bookings or actions that used the TALT bypass of the 2-instructional-day lead time or the 24-hour cancel lock. |
| J | `AvgLatencyMs` | Float | Average latency. |
| K | `LockContentionCount` | Integer | Contended transactions. |
| L | `LastUpdated` | DateTime | Calculation time. |

---

## 3. Master DB 2026 (`<MASTER_DB_ID>`) — READ-ONLY

### 3.1 Consumed tabs

**`Users` (8 columns)** — RBAC source and identity directory.

| Col | Header | Description |
|:---:|---|---|
| A | `UserID` | Stable, non-formula, never reused (see §1.1 rule 3). |
| B | `FirstName` | First name. |
| C | `LastName` | Last name. |
| D | `Email` | Institutional email. Matched after trim and lowercase. |
| E | `DisplayName` | Nickname. **Used for the timetable join** (§7.3). |
| F | `Role` | `Teacher`, `TA`, `LabTech`, `Admin`, `HoD`, `Student`. One value per user. |
| G | `JoinedAY` | Academic year joined. |
| H | `PrimarySubject` | Subject discipline. |

Revocation is performed by **deleting the user's row** (or clearing `Role`). Access ends within the role-cache TTL of 5 minutes (D-12).

**`Subjects` (5 columns):** `SubjectID` | `Subject` | `CourseTitle` | `Grade` | `SubjectCategory`

**`Academic_Calendar` (10 columns):** `Date` | `DayOfWeek` | `DayType` | `Semester` | `Quarter` | `WeekNumber` | `IsInstructional` | `EventType` | `BellScheduleOverride` | `Notes`

**`Bell_Schedules` (8 columns):** `BellType` | `Period` | `StartTime` | `EndTime` | `DurationMinutes` | `TargetGrades` | `IsLunchPeriod` | `Description`

**`Room` (5 columns):** `RoomID` | `RoomName` | `SourceSystemCode` | `Floor` | `RoomType`
`RoomID` maps to `Bookings.LabID`; `RoomName` maps to `Bookings.LabName`. `Room` carries **no** capacity, subject tags or status; bookability is derived (§7.1).

### 3.2 Not consumed (documented only; never read or written by this app)

| Tab | Columns |
|---|---|
| `Global_Config` | `Key` \| `Value` \| `ValueType` \| `Description` \| `LastUpdated` \| `UpdatedBy` |
| `Config` | `ConfigKey` \| `ConfigValue` \| `DataType` \| `Description` \| `LastUpdated` |
| `Logs` | `LogID` \| `Timestamp` \| `UserEmail` \| `ActionType` \| `TargetTab` \| `RecordsAffected` \| `Details` |

---

## 4. Timetable 2026 (`<TIMETABLE_2026_ID>`) — READ-ONLY

### 4.1 Consumed tab

**`Index` (7 columns):** `Teacher` | `Day` | `Period` | `Subject` | `Class` | `Room` | `Section`
`Day` corresponds to `DayType` (`A`–`E`). `Teacher` is a nickname and must match `Users.DisplayName` exactly (§7.3). `Index` has no email or UserID column.

### 4.2 Not consumed (structure noted only)

| Tab | Structure |
|---|---|
| `TimeTable 2026` | Grid sheet: column A blank; columns C–V hold one column per teacher (20 teacher columns, nickname headers). |
| `Template` | Columns B–F = day types `A`–`E`; H `Teacher` \| I `Day` \| J `Period` \| K `Input` \| L `Subject` \| M `Class` \| N `Section` \| O `2nd HR` \| P `Grade`. |
| Per-teacher pages (many) | Columns B–F = day types `A`–`E`; H `Teacher` \| I `Day` \| J `Period` \| K `Input` \| L `Subject` \| M `Class` \| N `Section` \| O `2nd HR`. These pages feed `Index`. |
| `Config` | Empty. |
| `Logs` | Empty. |

---

## 5. Identity and Role Source

- Role is read **only** from Master DB `Users.Role` (cached ≤ 5 minutes).
- `isHoD` is derived (`Role === 'HoD'`). `Can_Edit_Config` is derived (`Role === 'Admin'` or SuperAdmin).
- **SuperAdmin** is not a `Role` value. It is the Script Property `SUPERADMIN_EMAILS` and applies only to a resolved, whitelisted active user (ADR-0002).
- `hasCompletedTutorial` lives in browser `localStorage`. `PrimaryGrade` is removed.

---

## 6. Status Enumeration (`Bookings.Status`)

| Stored value | UI label | Meaning |
|---|---|---|
| `PENDING` | Pending | Submitted, awaiting TA/LabTech/Admin decision. Blocks the slot. |
| `APPROVED` | Approved | Confirmed. Blocks the slot. |
| `DENIED` | Denied | Refused by TA/LabTech/Admin with a reason in `Remark`. Terminal. |
| `CANCELLED` | Cancelled | Cancelled by the owner or TALT. Terminal. |
| `POSTPONE_PENDING_TALT` | Postponement requested (awaiting TALT) | Teacher-initiated postponement awaiting TALT. Blocks its slot. |
| `POSTPONE_PENDING_TEACHER` | Postponement requested (awaiting teacher) | TALT-initiated swap awaiting the owner. Blocks its slot. |
| `POSTPONED` | Postponed | Original booking superseded by an approved postponement. Terminal. |

Legacy PRD strings are mapped in [`PRD_AMENDMENT_v1.4.0b.md`](./PRD_AMENDMENT_v1.4.0b.md). Code, docs and tests must use exactly these stored values (`P2-26`).

### 6.1 Non-Statuses (D-41)
Legacy PRD strings **`Action Required`** (schedule revalidation alert) and **`Error (Calendar)`** (calendar sync error) are **non-statuses**. They are never written into `Bookings.Status`. Instead:
- Revalidation discrepancies are recorded in `Bookings.Remark` and logged to `Logs`.
- Calendar sync failures are recorded in `Bookings.GCalEventID` as `ERROR:<code>` (D-40) and logged to `Logs`.

---

## 7. Derived Rules

### 7.1 Bookable slot
A slot (`LabID`, `Date`, `Period`) is bookable only if **all** hold:
1. `Room` contains `LabID`.
2. `Academic_Calendar` contains `Date` with `IsInstructional = TRUE`.
3. `Bell_Schedules` contains `Period` for the date's effective `BellType` (`BellScheduleOverride` when non-blank; otherwise the default rule, see §8).
4. No `Active` `Outages` window overlaps the slot (a `SetupHold` admits only its `LinkedSubject`).
5. No booking in `PENDING`, `APPROVED`, `POSTPONE_PENDING_TALT` or `POSTPONE_PENDING_TEACHER` occupies the slot (checked live inside the lock, never from cache).
6. Lead-time and cancel-lock rules (Plan §2.4) are satisfied or legitimately bypassed.

### 7.2 Ownership
Ownership = the caller's `Users.UserID` (resolved from the session email) equals `Bookings.TargetUserID`. No ownership logic uses an email column.

### 7.3 Canonical teacher join (`Utils_DataMapper.js`)
1. Session email → `Users` row (trim, lowercase) → `DisplayName` (or `FirstName` if blank), normalised.
2. `Index.Teacher` (trim, lowercase) must equal that value.
3. Zero matches or more than one match throws `TIMETABLE_USER_UNRESOLVED` (fail closed, never guess).
4. A one-time audit (`P1-28`) proves every `Index.Teacher` resolves to exactly one `Users` row.

### 7.4 Revocation
Deleting a `Users` row (or clearing `Role`) denies the user at the next cache refresh (≤ 5 minutes). Existing bookings keep their `TargetUserID` and snapshot nickname.

### 7.5 Postponement data model (ADR-0003)
Postponement uses a **linked row**. See the plan §2.2 for the state machine. The original row `O` and the proposed-slot row `N` reference each other through `LinkedBookingID`, and both carry the same pending status while the request is open.

### 7.6 Forensic log viewer
Non-student roles may open a read-only viewer over `Logs`: event details and actor emails visible; allowlisted columns only; message text sanitised; paginated; **no write endpoint exists**.

---

## 8. Open and Resolved Items (Phase 0 & Phase 2 Alignment)

| # | Item | Status / Resolution |
|---|---|---|
| **O-1** | Default `BellType` when `Academic_Calendar.BellScheduleOverride` is blank | **RESOLVED (D-37):** Effective `BellType` is `Wed` if `DayOfWeek` is Wednesday, otherwise `Regular`. Value spellings verified in `P0-17`. |
| **O-2** | Room scope & non-lab rooms in `Room` tab | **RESOLVED (D-38):** All `Room` rows are bookable; no `RoomType` filter. Timetable verification retained; future restrictions deferred to **BL-01** via `isRoomEligible_` seam. |
| **O-3** | Live header dump & array-formula check across 12 consumed tabs (`P0-17`) | **OPEN (not yet processed):** Scheduled for owner-run execution in Phase 0 (`P0-17`). Extended to report distinct values with counts for `Bookings.Status`, `Bell_Schedules.BellType`, `Room.RoomType`, and `Users.Role` (no PII). |
| **O-4** | Live tab name and header spelling (`Bookings` vs `Booking`, `IsActive`) | **RESOLVED (D-39):** Exact live tab name is `Bookings`; header is `IsActive`. Matching remains trim + case-insensitive. |
| **O-5** | `GCalEventID` failure convention and code vocabulary | **RESOLVED (D-40):** `ERROR:<code>` confirmed. Proposed vocabulary (`CALENDAR_API`, `CALENDAR_QUOTA`, `CALENDAR_NOT_FOUND`, `INVALID_TIME`) adopted (ASSUMED). Retry counts stored outside sheet. |
| **O-6** | Legacy PRD statuses `Action Required` and `Error (Calendar)` | **RESOLVED (D-41):** Confirmed non-statuses; recorded in `Remark` and `Logs` only. |
| **O-7** | Legacy status string migration | **RESOLVED (D-42):** Migration procedure approved (backup copy, test on DEV first, idempotent, log counts only). Unknown status strings block go-live. |
| **O-8** | Stored role strings in Master DB `Users.Role` | **OPEN:** Verify that all active rows in `Users.Role` use canonical values (`Teacher`, `TA`, `LabTech`, `Admin`, `HoD`, `Student`). Verified via `P0-17`. |
| **O-9** | DEV copies of Master DB 2026 and Timetable 2026 (`P0-18`) | **CONFIRMED (Owner 2026-10-21):** Isolated DEV copies of all Google Sheets confirmed to exist; production Master DB is never modified. |
