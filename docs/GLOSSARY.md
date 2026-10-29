# 📖 Project Glossary & Controlled Vocabulary

---

**Governing Governance:** `IMPLEMENTATION_PLAN.md`, `AGENTS.md`, `lab-oops-standards`  
**Status:** ACTIVE  
**Last Updated:** 2026-10-27  

> [!IMPORTANT]
> **Owner Approval Rule:** Terminology changes require an Architectural Decision Record (ADR) or a formal decision ledger entry confirmed by the Owner.

---

## 1. Controlled Vocabulary

The following terms are standardized across all active engineering and specification documentation for Project 01 (`Smart Lab Booking System`). Banned and confusing variants are retired to prevent drift between specifications and implementation.

| # | Term / Phrase | Strict Standard (Use Only This) | Retired / Banned Variations | Scope & Rationale |
|---|---|---|---|---|
| 1 | **Code vs Plan Status** | **LIVE** = enforced by the current code (v1.1.3c).<br>**PLANNED (Phase N)** = to be built.<br>**UNCHANGED** = same in current code and plan.<br>**SUPERSEDED (by X)** = replaced.<br>**HISTORY** = kept only for the record. | "retained", "retains", "preserved", "kept", "unchanged" (when ambiguous) | Eliminates ambiguity over whether an item exists in running code today or in the forward remediation plan. **Never write "retained".** |
| 2 | **Conflict vs Mismatch vs Occupied** | **occupied** = slot taken by another booking.<br>**timetable mismatch** = D-46 failure (not scheduled).<br>**merge conflict** = git only. | Bare "conflict" for timetable rules or slot states | Prevents confusing timetable validation failures with slot double-booking or git branch collisions. "Timetable Conflict" appears only when quoting legacy error strings. |
| 3 | **Block vs Occupy vs Reject** | **teaching block** = a scheduled class row in `Index`.<br>**occupies** = a status that holds a slot.<br>**rejected** = validation failed. | "block", "blocked", "blocks the slot" as a verb | "Block" is strictly a noun representing a scheduled teaching entry in the timetable. It is never used as a verb. |
| 4 | **Time Units** | **period** = bell period (HR, 1–8).<br>**slot** = combination of (lab, date, period).<br>**block** = combination of (teacher, `DayType`, period) row in `Index`. | Interchanging period, slot, and block; `TimeSlotID` | Distinct physical and logical coordinates must not be conflated. |
| 5 | **Scheduled Class vs Assignment** | **scheduled class** / **timetable assignment rule** (full phrase, never bare "assignment").<br>**technician assignment** = assigning TALT staff (`AssignedTalt*`, `ACTION_ASSIGN_ROOM_TECH`). | Bare "assignment", "assigned" without context | Disambiguates academic teacher timetable schedules from operational technician task allocations. |
| 6 | **Owner Distinction** | **Owner** (capital O) = Lead Architect (Nattapat Poolyam / Mek).<br>**booking owner** = the `TargetUserID` user. | Bare lowercase "owner" | Differentiates repository and project ownership from record-level booking ownership. |
| 7 | **User Entities** | **caller** = authenticated session user.<br>**target** = `TargetUserID`.<br>**operator** = `SubmittedByUserID` (on-behalf creator).<br>`Teacher` (code font) = database role.<br>**DisplayName** = nickname used for `Index` join. | Interchanging user, teacher, target, caller, actor | Unambiguous attribution for audit logs, permissions, and cross-sheet joins. |
| 8 | **Confirmation Vocabulary** | Ledger statuses (`CONFIRMED`, `PROPOSED`, etc.) stay in ledger tables only.<br>Booking statuses are always in code font (`APPROVED`). | Bare "confirmed" used for a booking | Prevents conflating decision ledger approval states with booking lifecycle states. |
| 9 | **Authorization & Matrix Values** | `DENIED` = stored booking status.<br>`AUTH_DENIED` = server error code.<br>Matrix cells use **Not allowed** (replaces "Denied"). | "Denied" in permission matrices | Clarifies whether a negative outcome is an administrative booking rejection, a security exception, or a disallowed permission cell. |
| 10 | **Rejected vs Denied** | **rejected** = a validation error returned to the caller.<br>**denied** = an administrative decision by TALT staff (`DENIED`). | Using "rejected" and "denied" interchangeably | Differentiates automated server-side contract rejections from human triage decisions. |
| 11 | **Read Access Scope** | **read access only** = data sources or viewers without mutation endpoints.<br>**executive view** = HoD role scope (read access to all, write access to own bookings only). | Bare "read-only" applied to HoD | Accurately describes that HoD can book and manage their own classes while having an executive overview of all school schedules. |
| 12 | **Bypass vs Override** | **bypass** = audited TALT exemption from 2-day lead time and 24 h cancel lock (D-07).<br>**override** = exemption from timetable assignment rule: **none exists**. | Using "bypass" and "override" interchangeably | Preserves security boundaries: timetable assignment rules have zero overrides. |
| 13 | **On-Behalf Bookings** | **on-behalf booking** = booking submitted by TALT operator for a target teacher. | "proxy", "proxy booking", "on their behalf" | Deprecates "proxy" terminology across the entire specification suite. |
| 14 | **Lock Disambiguation** | **24 h cancel lock** = deadline before period starts.<br>**script lock** = `LockService` concurrency guard.<br>**locked field** = UI element that cannot be edited. | Bare "lock" | Prevents conflating concurrency controls, business cancellation windows, and UI form states. |
| 15 | **Bookability vs Availability** | **bookable slot** = satisfies derivation rule D-29 (instructional date, room active, period valid, no outage, unoccupied).<br>**available teaching block** = muted UI state (D-48). | Interchanging bookable and available | Distinguishes physical resource bookability from personal teacher schedule availability. |
| 16 | **TALT Staff Entity** | **TALT staff** = operators holding roles `TA`, `LabTech`, or `Admin`. | "TALT" as a stored database role; including HoD in TALT | "TALT" is strictly an organizational team moniker, never a database role string. |
| 17 | **Environment & Code State** | **PROD** / **DEV** = production and development spreadsheets.<br>**current code (v1.1.3c)** = active code running today. | Bare "live" | Clarifies whether a statement pertains to production databases or legacy codebase behavior. |
| 18 | **Policy vs Enforcement vs Proof** | **rule** = business policy.<br>**validation** = server code enforcing a rule.<br>**verification** = test/checklist evidence. | Bare "check" | Enforces precision between specifications, implementations, and test suites. |

---

## 2. Enforcement & Linting Policy
In accordance with `PHASE_0_IMPLEMENTATION_PLAN.md` (Workstream 0.2), the automated documentation linter (`verify_phase.js --phase 0`) warns on banned words ("retained", "proxy", bare "conflict") appearing in active documentation outside historical or quoted legacy contexts.

---

## 3. Companion References
* [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md) — Remediation blueprint and architecture decisions.
* [`SCHEMA_CONTRACT.md`](./SCHEMA_CONTRACT.md) — Multi-spreadsheet schema and vocabulary definitions.
* [`DESIGN_TOKENS_SUBJECT_COLORS.md`](./DESIGN_TOKENS_SUBJECT_COLORS.md) — Subject color and UI design tokens.
* [`ERROR_CODES.md`](./ERROR_CODES.md) — Catalogue of standardized system and validation error codes.
