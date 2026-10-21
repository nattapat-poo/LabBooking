# ADR-0003: Postponement as a two-way, approval-gated linked-row workflow

* **Status:** Accepted (Owner directive 2026-10-19)
* **Date:** 2026-10-19
* **Relates to:** D-04, D-22, D-23, `P2-12`, `P2-25`

## Context

Postponement requires approval from the other party: a teacher's request is approved by TALT staff (`TA`, `LabTech`, `Admin`), and a TALT-initiated swap is approved by the booking owner. The first design mutated the original booking in place, which left nowhere to store the proposed slot, did not say which slot blocks others, and had no cancellation path. The `Bookings` contract already contains `LinkedBookingID` and the status `POSTPONED`, and the PRD describes a linked-row model.

## Decision

* **Request.** Creating a postponement request inside one `LockService` critical section:
  * keeps the original row `O` and sets its status to `POSTPONE_PENDING_TALT` (teacher-initiated) or `POSTPONE_PENDING_TEACHER` (TALT-initiated);
  * inserts a new row `N` for the proposed slot with the **same** pending status and `LinkedBookingID = O.BookingID`;
  * validates `N` exactly like a new booking (bookable slot, conflicts, outages, timetable, lead time).
* **Blocking.** Both `O` and `N` block their slots while pending, so approval cannot fail because the target was taken.
* **Approve (by the reciprocal party).** In one lock: `N` becomes `APPROVED`, `O` becomes `POSTPONED`; calendar event of `O` is removed and one is created for `N`.
* **Deny (by the reciprocal party, reason appended to `Remark` of both rows).** `N` becomes `CANCELLED`, `O` returns to `APPROVED`.
* **Cancel the request.** Allowed in both modes: the initiator, or any `TA`/`LabTech`/`Admin`, may cancel. Effect: same as deny.
* **No timeout.** Requests do not expire. As a data-integrity guard (not a timeout), when the **earlier** of the two slot start times is reached while the request is still pending, the system reverts: `N` becomes `CANCELLED`, `O` returns to `APPROVED`, and `POSTPONE_AUTO_REVERT` is logged.
* **Locks and bypass.** Teachers cannot request a postponement within 24 hours of the original slot start; TALT staff may bypass with the audited urgent-bypass rule. Owner approval is still required for TALT-initiated swaps.

## Consequences

* The proposed slot is stored in the existing schema, transactionally, with no schema change.
* Conflict detection treats the two pending statuses as occupying statuses.
* The `Logs` sheet records events only. It is **not** used to store workflow state, because log writes are best-effort and the viewer is visible to teachers.
* A scheduled job plus an on-read check performs the auto-revert.
