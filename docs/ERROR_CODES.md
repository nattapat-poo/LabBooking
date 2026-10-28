# 🛑 Standard Error Codes Catalogue

---

**Governing Standard:** [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md) · [`SCHEMA_CONTRACT.md`](./SCHEMA_CONTRACT.md) · [`GLOSSARY.md`](./GLOSSARY.md)  
**Status:** ACTIVE  
**Last Updated:** 2026-10-28  
**Backlog Reference:** **BL-05**

---

> [!IMPORTANT]
> **Architectural Rules:**
> 1. **One Code Per Failure Reason:** Every distinct system or business validation failure has an unambiguous, machine-readable error code.
> 2. **Perimeter Containment (`AUTH_DENIED` rule):** `AUTH_DENIED` is the **only** permission, role, domain, ownership or identity exception returned to the caller. Detailed security reasons (e.g. domain mismatch, role ineligible, ownership violation) are written to forensic `Logs` only, never leaked to the client.
> 3. **Actionable Business Errors:** Business rule rejections (timetable mismatch, period not free, lead time violation) return domain-specific error codes to the caller to provide actionable feedback in the UI.
> 4. **Calendar Failure Marker Vocabulary:** Google Calendar sync failures stored in `Bookings.GCalEventID` strictly use the `ERROR:<code>` vocabulary defined in decision **D-40**.
> 5. **Zero Exposure:** Error strings, payloads, and forensic logs must never contain raw spreadsheet IDs, calendar IDs, user emails, or absolute local paths.

---

## 1. Active & Standardized Error Codes

| Code | Meaning | Raised by (rule / decision) | Where first defined (doc / section) | Caller-visible message theme | Phase |
|---|---|---|---|---|:---:|
| `AUTH_DENIED` | Any permission, role, domain whitelist, ownership, or perimeter validation failure (fail-closed perimeter) | `enforcePerimeterSecurityGatekeeper` (F-01..F-04, F-10, R-02, R-03, D-08, D-10, D-16, D-21) | `IMPLEMENTATION_PLAN.md` §2.1; `PHASE_CHECKLIST.md` `P1-01`, `P1-07` | Access denied. Your account does not have permission to perform this action. | Phase 1 |
| `DATABASE_UNAVAILABLE` | Underlying Google Spreadsheet cannot be opened or is missing (replaces silent fallback sheet) | `getMainSpreadsheet()` / Config reader when `SpreadsheetApp.openById()` fails (F-14, D-14, D-35) | `IMPLEMENTATION_PLAN.md` §3 (Phase 1); `PHASE_CHECKLIST.md` `P1-06` | Database connection failed. Please contact administrator. | Phase 1 |
| `SCHEMA_HEADER_MISMATCH` | Consumed Google Sheet tab headers do not match canonical schema contract | `validateHeaders_()` on sheet boot or cache warm (D-05, D-36) | `SCHEMA_CONTRACT.md` §1; `PHASE_CHECKLIST.md` `P2-06` | Database schema verification failed. | Phase 2 |
| `TIMETABLE_NOT_ASSIGNED` | Target teacher has no assigned teaching block at requested DayType/Period, has a free period, has a non-teaching block (Homeroom, Study Hall, LD, meeting), or has zero `Index` rows | Timetable assignment rule validation in `API_Validation.js` (D-46) | `IMPLEMENTATION_PLAN.md` §2.3; `SCHEMA_CONTRACT.md` §7.3; `PRD_AMENDMENT_v1.4.0b.md` row 20; `PHASE_CHECKLIST.md` `P2-37` | You are not scheduled to teach a class during this period. | Phase 2 |
| `TIMETABLE_SUBJECT_MISMATCH` | Target teacher is scheduled, but requested subject or section does not match the assigned block in `Index` | Timetable assignment rule validation in `API_Validation.js` (D-46) | `IMPLEMENTATION_PLAN.md` §2.3; `SCHEMA_CONTRACT.md` §7.3; `PRD_AMENDMENT_v1.4.0b.md` row 20; `PHASE_CHECKLIST.md` `P2-37` | The selected subject or section does not match your scheduled teaching block. | Phase 2 |
| `TIMETABLE_USER_UNRESOLVED` | Session email cannot be resolved to a unique active `Users` row, has duplicate email, or has duplicate `DisplayName` across active rows | Identity & timetable join resolver in `Utils_Security.js` (D-31, D-46) | `IMPLEMENTATION_PLAN.md` §2.3; `SCHEMA_CONTRACT.md` §7.3; `PHASE_CHECKLIST.md` `P2-31` | Your user profile could not be uniquely resolved. Please contact administrator. | Phase 2 |
| `TARGET_ROLE_INELIGIBLE` | Attempt to create a booking on behalf of an ineligible target role (e.g. `Student` or unrecognised role; `HoD` is eligible target for TALT) | Target role validator in booking submission (D-47; supersedes D-43) | `IMPLEMENTATION_PLAN.md` §2.1; `SCHEMA_CONTRACT.md` §7.2; `PHASE_CHECKLIST.md` `P2-35` | Bookings cannot be created on behalf of the selected role. | Phase 2 |
| `MAKEUP_PERIOD_NOT_FREE` | Make-up session requested during a period that has an existing scheduled teaching block for one or more teachers instructing that subject | Make-up session validator in `API_Validation.js` (D-49) | `IMPLEMENTATION_PLAN.md` §2.1; `DevLog.md` item 13; `PHASE_CHECKLIST.md` `P2-39` | Cannot schedule make-up: the period is not free for all teachers of this subject. | Phase 2 |
| `MAKEUP_SUBJECT_NOT_TEACHING` | Make-up session requested for a subject not classified as a teaching subject per Master DB `Subjects` | Make-up session validator in `API_Validation.js` (D-49) | `IMPLEMENTATION_PLAN.md` §2.1; `DevLog.md` item 13; `PHASE_CHECKLIST.md` `P2-39` | Make-up sessions may only be scheduled for valid teaching subjects. | Phase 2 |
| `CALENDAR_API` | Google Calendar API error during event creation or synchronization (stored as `ERROR:CALENDAR_API` in `GCalEventID`) | Calendar synchronization service (D-40) | `SCHEMA_CONTRACT.md` §3; `PHASE_CHECKLIST.md` `P2-36` | Calendar synchronization encountered an API error. | Phase 2 |
| `CALENDAR_QUOTA` | Google Calendar API rate limit or quota exceeded (stored as `ERROR:CALENDAR_QUOTA` in `GCalEventID`) | Calendar synchronization service (D-40) | `SCHEMA_CONTRACT.md` §3; `PHASE_CHECKLIST.md` `P2-36` | Calendar synchronization quota reached. Retry scheduled. | Phase 2 |
| `CALENDAR_NOT_FOUND` | Target secondary Google Calendar ID not found or inaccessible (stored as `ERROR:CALENDAR_NOT_FOUND` in `GCalEventID`) | Calendar synchronization service (D-40) | `SCHEMA_CONTRACT.md` §3; `PHASE_CHECKLIST.md` `P2-36` | Secondary lab calendar not found. Please verify configuration. | Phase 2 |
| `INVALID_TIME` | Booking time interval cannot be parsed for calendar event creation (stored as `ERROR:INVALID_TIME` in `GCalEventID`) | Calendar synchronization service (D-40) | `SCHEMA_CONTRACT.md` §3; `PHASE_CHECKLIST.md` `P2-36` | Booking time interval could not be parsed for calendar event creation. | Phase 2 |

---

## 2. Implied / To Be Defined (Phase 2 Finalisation)

The following error states are specified in requirements and behavioural suites, with formal codes to be finalised during Phase 2 implementation (**BL-05**):

| Candidate Code | Failure Condition | Raised by (rule / decision) | Source Document | Phase |
|---|---|---|---|:---:|
| `LOCK_BUSY` | Concurrency script lock acquisition timeout (`withLock` busy) | Concurrency lock wrapper in `Utils_Concurrency.js` | PRD §14, Plan §2.5, `PHASE_CHECKLIST.md` `P2-30` | Phase 2 |
| `LEAD_TIME_VIOLATION` | Submission attempted with less than 2 instructional days lead time without TALT bypass | Lead time validation (F-05, R-09, D-07) | `IMPLEMENTATION_PLAN.md` §2.1; `PHASE_CHECKLIST.md` `P2-10` | Phase 2 |
| `CANCEL_LOCK_ACTIVE` | Cancellation or postponement attempted within 24 hours of scheduled start by non-TALT user | Cancellation lock validation (D-02, D-07) | `IMPLEMENTATION_PLAN.md` §2.1; `PHASE_CHECKLIST.md` `P2-10` | Phase 2 |
| `SLOT_UNAVAILABLE` | Requested room slot is occupied by an active booking or outage hold | Bookable slot derivation (D-29) | `IMPLEMENTATION_PLAN.md` §2.3; `PHASE_CHECKLIST.md` `P2-27` | Phase 2 |
| `DUPLICATE_SUBMISSION` | Idempotency token collision on duplicate batch or request UUID | Idempotency guard | PRD §14, `PHASE_CHECKLIST.md` `P2-30` | Phase 2 |
