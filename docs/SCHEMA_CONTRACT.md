# 📑 Schema Contract: MUIDS Lab Booking System (v1.4.0a)

**Target System:** `Lab Oops OS` — Project 01 (`Smart Lab Booking System`)  
**Status:** Approved by Lead Architect Mek (2026-10-15)  
**Governance:** `docs/IMPLEMENTATION_PLAN.md`, `AGENTS.md`, `lab-oops-standards`, `gas-best-practices`

---

## 🏛️ 1. Architecture Overview

The system operates across **three federated Google Spreadsheets**:
1. **Local Transactional Spreadsheet (`<LOCAL_SPREADSHEET_ID>`):** Holds application transactions, room outages, fixed duty blocks, environment configuration, forensic audit logs, and telemetry metrics.
   - Tabs: `Bookings` (25 cols), `Outages` (13 cols), `Duties` (8 cols), `Config` (5 cols), `Logs` (7 cols), `Stats` (12 cols).
2. **Master DB 2026 (`<MASTER_DB_ID>`) [READ-ONLY]:** Enterprise directory holding user identities, subjects, rooms, academic calendar cycle, and bell schedules.
   - Tabs: `Users` (8 cols), `Subjects` (5 cols), `Room` (4 cols, serves as Labs), `Academic_Calendar` (6 cols, serves as Calendar), `Bell_Schedules` (8 cols, serves as Bell).
3. **Timetable 2026 (`<TIMETABLE_2026_ID>`) [READ-ONLY]:** Master teacher teaching schedules, sections, and classroom allocations.
   - Tab: `Index` (7 cols, serves as TeacherTimeTables).

---

## 📋 2. Local Transactional Sheet Schemas (`<LOCAL_SPREADSHEET_ID>`)

### 2.1 Tab: `Bookings` (25 Columns)
*Replaces legacy `Transactions` sheet.*

| Col Index | Column Header | Data Type | Nullable | Description |
|:---:|---|---|:---:|---|
| A | `BookingID` | String | No | Server-generated UUID (`Utilities.getUuid()`). Primary Key. |
| B | `BatchID` | String | Yes | Shared identifier linking multiple slots in a single submission batch. |
| C | `SubmittedByUserID` | String | No | ID/email of the operator who submitted the booking (e.g. TALT in proxy mode). |
| D | `User` | String | No | Human-readable nickname of the operator. |
| E | `TargetUserID` | String | No | ID/email of the teacher who owns the reservation (**Legal Booking Owner**). |
| F | `Teacher` | String | No | Human-readable nickname of the booking owner. |
| G | `Subject` | String | No | Academic subject (e.g. Gen Chem, Biology). |
| H | `LabID` | String | Yes | ID of the reserved laboratory room (e.g. `lab_01`). |
| I | `LabName` | String | Yes | Human-readable room identifier (e.g. `Bio 1`, `Chem 2`, `Room 204`). |
| J | `Date` | Date | No | Reservation date (Format: `YYYY-MM-DD` or `MMM DD/YYYY`). |
| K | `Period` | String | No | Bell period identifier (e.g. `HR`, `P1`, `P2`, `P8`). |
| L | `Section` | String | No | Class section identifier (e.g. `1001`, `1102`). |
| M | `DayType` | String | No | Rotational cycle day (`A`, `B`, `C`, `D`, `E`). |
| N | `BellType` | String | No | Bell timing template (e.g. `Regular`, `Wed`, `Assembly`). |
| O | `TimeSlotID` | String | No | Composite slot key (`TS_P<Period>_<BellType>`). |
| P | `LabTitle` | String | No | Purpose or title of the experimental lab. |
| Q | `Status` | String | No | `PENDING`, `APPROVED`, `DENIED`, `CANCELLED`, `POSTPONE_PENDING_TALT`, `POSTPONE_PENDING_TEACHER`, `POSTPONED`. |
| R | `BookingTimeStamp` | DateTime | No | Timestamp of submission in `Asia/Bangkok`. |
| S | `ConfirmUserId` | String | Yes | UserID/email of the staff member who approved or rejected the slot. |
| T | `ConfirmedBy` | String | Yes | Nickname of the confirming staff member. |
| U | `AssignedTaltID` | String | Yes | UserID/email of the assigned technician (comma-separated if multiple). |
| V | `AssignedTaltName` | String | Yes | Nickname(s) of assigned technician(s). |
| W | `Remark` | String | Yes | Appended notes stack (denial reasons, `[URGENT_BYPASS]` prefixes, timestamps). Sorted chronologically ascending. |
| X | `GCalEventID` | String | Yes | Google Calendar event ID for synchronization and cancellation hooks. |
| Y | `LinkedBookingID` | String | Yes | Previous booking ID if this record was created via a postponement swap. |

---

### 2.2 Tab: `Outages` (13 Columns)
*Includes core outage tracking + Adaptive Calendar Grid `SetupHold` persistent apparatus locks.*

| Col Index | Column Header | Data Type | Nullable | Description |
|:---:|---|---|:---:|---|
| A | `OutageID` | String | No | Unique outage identifier (e.g. `outage_001`). Primary Key. |
| B | `LabID` | String | No | ID of the affected lab room. |
| C | `LabName` | String | No | Name of the affected lab room. |
| D | `StartDate` | Date | No | Start date of closure/hold window. |
| E | `EndDate` | Date | No | End date of closure/hold window. |
| F | `AllDay` | Boolean | No | `TRUE` if room is closed for all periods; `FALSE` if period-specific. |
| G | `StartPeriod` | String | Yes | Starting period if `AllDay` is `FALSE`. |
| H | `EndPeriod` | String | Yes | Ending period if `AllDay` is `FALSE`. |
| I | `Reason` | String | Yes | Maintenance description or setup justification. |
| J | `Status` | String | No | `Active` or `Resolved`. |
| K | `OutageType` | String | No | `Maintenance`, `SetupHold`, or `Emergency`. |
| L | `LinkedSubject` | String | Yes | Academic subject permitted to use room during `SetupHold` (e.g. `Biology`). |
| M | `SuppressEmail` | Boolean | No | `TRUE` suppresses disruptive cancellation emails for continuing lab activities. |

---

### 2.3 Tab: `Duties` (8 Columns)
*Master schedule for fixed, non-lab responsibilities assigned to technicians and TAs (e.g. Lunch Duty, Study Hall).*

| Col Index | Column Header | Data Type | Nullable | Description |
|:---:|---|---|:---:|---|
| A | `DutyID` | String | No | Unique identifier for duty record (e.g. `Duty_001`). Primary Key. |
| B | `TeachingBlockID` | String | Yes | Foreign key to timetable block. |
| C | `UserID` | String | No | Technician/TA user ID or email. |
| D | `Teacher` | String | No | Human-readable technician nickname. |
| E | `DayType` | String | No | Cycle day (`A`, `B`, `C`, `D`, `E`). |
| F | `Period` | String | No | Period identifier (`HR`, `1`–`8`). |
| G | `Subject` | String | No | Duty code (e.g. `LD 4A`, `Study Hall`). |
| H | `DutyDescription` | String | Yes | Human-readable duty description. |

---

### 2.4 Tab: `Config` (5 Columns)

| Col Index | Column Header | Data Type | Nullable | Description |
|:---:|---|---|:---:|---|
| A | `Category` | String | No | `Environment`, `System`, `Email_Subject`, `Email_Body`. |
| B | `Config_Key` | String | No | Unique uppercase configuration key (e.g. `MIN_LEAD_TIME_DAYS`). Primary Key. |
| C | `Config_Value` | String | No | Configuration value or template string. |
| D | `Description` | String | Yes | Human-readable explanation of parameter. |
| E | `Placeholders` | String | Yes | Comma-separated list of dynamic variables for template hydration. |

---

### 2.5 Tab: `Logs` (7 Columns)

| Col Index | Column Header | Data Type | Nullable | Description |
|:---:|---|---|:---:|---|
| A | `Timestamp` | DateTime | No | ISO timestamp in `Asia/Bangkok`. |
| B | `User ID` | String | No | Email or UserID of executing actor. |
| C | `Action` | String | No | Action code (e.g. `SUBMIT_BATCH`, `APPROVE_BOOKING`, `URGENT_BOOKING_BYPASS`). |
| D | `Result Status` | String | No | `SUCCESS`, `FAIL`, `BLOCKED`, `ERROR`. |
| E | `Total Latency (ms)` | Integer | No | Execution duration in milliseconds. |
| F | `Lock Contention?` | Boolean | No | `TRUE` if lock wait exceeded contention threshold. |
| G | `Error/Outcome Message` | String | Yes | Sanitized outcome or error message (contains urgent bypass metadata). |

---

### 2.6 Tab: `Stats` (12 Columns)
*Canonical telemetry schema for forensic analytics, capacity reporting, and UX adoption tracking.*

| Col Index | Column Header | Data Type | Nullable | Description |
|:---:|---|---|:---:|---|
| A | `StatDate` | Date | No | Date of recorded telemetry (Format: `YYYY-MM-DD`). |
| B | `MetricName` | String | No | Identifier (e.g. `DAILY_BOOKING_VOLUME`, `ROOM_UTILIZATION`). |
| C | `MetricCategory` | String | No | Category (e.g. `THROUGHPUT`, `SECURITY`, `CAPACITY`). |
| D | `PeriodIdentifier` | String | Yes | Specific period or `ALL_DAY`. |
| E | `TotalRequests` | Integer | No | Count of attempted booking requests. |
| F | `TotalApproved` | Integer | No | Count of approved bookings. |
| G | `TotalRejected` | Integer | No | Count of rejected bookings. |
| H | `TotalCancelled` | Integer | No | Count of cancelled bookings. |
| I | `UrgentBypassCount` | Integer | No | Count of bookings utilizing the 24h lead-time bypass. |
| J | `AvgLatencyMs` | Float | No | Average API response time. |
| K | `LockContentionCount` | Integer | No | Count of transactions encountering lock contention. |
| L | `LastUpdated` | DateTime | No | Timestamp of metric calculation. |

---

## 🏛️ 3. Master DB 2026 Schemas (`<MASTER_DB_ID>`) [READ-ONLY]

### 3.1 Tab: `Users` (8 Columns)
*User directory & RBAC source.*
| Col Index | Column Header | Data Type | Description |
|:---:|---|---|---|
| A | `UserID` | String | Unique user identifier (e.g. `user_01`). |
| B | `FirstName` | String | First name. |
| C | `LastName` | String | Last name. |
| D | `Email` | String | Institutional email (`@mahidol.ac.th`, `@student.mahidol.ac.th`, `@student.mahidol.edu`). |
| E | `DisplayName` | String | Nickname or informal display name (used for timetable join). |
| F | `Role` | String | `Teacher`, `TA`, `LabTech`, `Admin`, `HoD`, `Student`. |
| G | `JoinedAY` | Integer | Academic year joined (e.g. `2024`, `2026`). |
| H | `PrimarySubject` | String | Subject discipline (e.g. `Chemistry`, `Biology`, `Physics`). |

### 3.2 Tab: `Subjects` (5 Columns)
*Centralized subject catalog.*
| Col Index | Column Header | Data Type | Description |
|:---:|---|---|---|
| A | `SubjectID` | String | Unique subject identifier (e.g. `subject_01`). |
| B | `Subject` | String | Short subject code/name (e.g. `Gen Chem`). |
| C | `Course Full Name` | String | Official course title. |
| D | `Grade` | String | Grade level (`10`, `11`, `12`, `All`). |
| E | `SubjectCategory` | String | `Core`, `Elective`, `Meeting`. |

### 3.3 Tab: `Room` (4 Columns)
*Authoritative room catalog (serves as Labs).*
| Col Index | Column Header | Data Type | Description |
|:---:|---|---|---|
| A | `LabID` | String | Unique room identifier (e.g. `lab_01`). |
| B | `LabName` | String | Official room name (e.g. `Bio 1`, `Chem 2`, `Room 204`). |
| C | `SubjectTags` | String | Recommended subject disciplines. |
| D | `Status` | String | `Active` or `Outage`. |

### 3.4 Tab: `Academic_Calendar` (6 Columns)
*Authoritative school calendar (serves as Calendar).*
| Col Index | Column Header | Data Type | Description |
|:---:|---|---|---|
| A | `Date` | Date | School date (`YYYY-MM-DD`). |
| B | `DayType` | String | Cycle day (`A`, `B`, `C`, `D`, `E`). |
| C | `AutoBell` | String | Automated bell schedule (`Regular`, `Wed`). |
| D | `AddShortened` | String | Special schedule flag (`Shortened`). |
| E | `ManualShort` | String | Custom schedule name (e.g. `Assembly`). |
| F | `BellType` | String | Effective bell type. |

### 3.5 Tab: `Bell_Schedules` (8 Columns)
*Authoritative period timing templates (serves as Bell).*
| Col Index | Column Header | Data Type | Description |
|:---:|---|---|---|
| A | `BellType` | String | Schedule type (e.g. `Regular`, `Wed`, `Assembly`, `Shortened`). |
| B | `Period` | String | Period name (`HR`, `1`–`8`). |
| C | `StartTime` | String | Wall-clock start time in `HH:mm`. |
| D | `EndTime` | String | Wall-clock end time in `HH:mm`. |
| E | `DurationMinutes` | Integer | Period duration in minutes. |
| F | `TargetGrades` | String | Target grade scope (`10`, `11`, `12`, `All`). |
| G | `IsLunchPeriod` | Boolean | `TRUE` if designated lunch block. |
| H | `Description` | String | Timing notes (e.g. `Grade 10 Split Break`). |

---

## 📅 4. Timetable 2026 Schema (`<TIMETABLE_2026_ID>`) [READ-ONLY]

### 4.1 Tab: `Index` (7 Columns)
*Master teaching timetable mapping (serves as TeacherTimeTables).*
| Col Index | Column Header | Data Type | Description |
|:---:|---|---|---|
| A | `Teacher` | String | Teacher display nickname (matches `Users.DisplayName`). |
| B | `Day` | String | Rotational Day Type (`A`, `B`, `C`, `D`, `E`). *Note: Corresponds to DayType.* |
| C | `Period` | String | Teaching period (`HR`, `1` through `8`). |
| D | `Subject` | String | Course shortcode (e.g. `Gen Chem`, `Biology 10`). |
| E | `Class` | String | Class grade identifier (e.g. `10`, `11`, `12`). |
| F | `Room` | String | Default assigned home classroom or lab room. |
| G | `Section` | String | Student section number (e.g. `1001`, `1104`). |

---

## 🔗 5. Canonical Teacher Join Specification (`Utils_DataMapper.js`)

To resolve teacher identities between authenticated sessions and `Timetable 2026`:
1. Authenticated session email (`Session.getActiveUser().getEmail()`) is looked up in `Master DB 2026` (`Users.Email`).
2. The user's `DisplayName` (or `FirstName` if DisplayName is blank) is retrieved and normalized.
3. Timetable records in `Timetable 2026` (`Index`) are matched where `Index.Teacher.trim().toLowerCase() === user.DisplayName.trim().toLowerCase()`.
4. If no nickname match is found, the system fails closed with `TIMETABLE_USER_UNRESOLVED` rather than guessing.
