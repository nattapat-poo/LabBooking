# ADR-0002: SuperAdmin via Script Properties, removal of the client-side admin PIN, and deviations from `lab-oops-standards`

* **Status:** Accepted (Owner directive 2026-10-19)
* **Date:** 2026-10-19
* **Deciders:** Lead Architect (Owner)
* **Relates to:** F-03, F-18, D-16, D-26, D-27, [ADR-0001](./0001-governing-ecosystem-alignment.md)

## Context

`lab-oops-standards` (the primary governing standard) prescribes three things that conflict with the security remediation:

1. **SuperAdmin fallback.** The identity resolver `getActorEmailSafe()` terminates at a hardcoded SuperAdmin email. When the real caller cannot be resolved, the caller silently becomes SuperAdmin. This is fail-open (audit finding F-03).
2. **Stealth Admin Gateway.** A `Ctrl + Shift + Q` shortcut and signature click open a modal guarded by a fixed PIN. The PIN is checked in browser JavaScript, is printed in the modal header and is recorded in public documentation (finding F-18). Anyone can bypass or read it.
3. **Mandatory sheet schemas.** The standard defines `Config`, `Logs` and `Stats` schemas that differ from the live sheets (`Logs` has 7 columns here; `Stats` is an aggregated 12-column schema).

The plan's precedence rule states that security findings and Owner decisions override skill guidance and that every conflict must be recorded.

## Decision

1. **SuperAdmin is a Script Property, not a role and not a fallback.**
   * `SUPERADMIN_EMAILS` (comma-separated, normalised) is stored in Script Properties.
   * It applies only when the active user email is **resolved** and passes the domain whitelist. An unresolved identity is always denied and never mapped to SuperAdmin.
   * SuperAdmin inherits all `Admin` permissions plus diagnostics, impersonation and configuration editing.
   * **Break-glass:** if Master DB is unreachable, authorization fails closed for everyone; a resolved SuperAdmin may open the diagnostics/health view only, with no booking operations.
2. **The client-side admin PIN is removed.**
   * No PIN check, PIN label or PIN text may remain in `App_Script/` or `docs/`.
   * The `Ctrl + Shift + Q` shortcut may remain, but it only reveals the admin panel for a session the **server** has verified as `Admin` or SuperAdmin, and every action behind it is authorised server-side.
3. **Schema deviations are accepted and recorded.** The live `Config`, `Logs` and `Stats` schemas in `SCHEMA_CONTRACT.md` are authoritative for this project.

## Consequences

* The primary standard is out of sync with this project. The Owner should update `lab-oops-standards` (Rule 26 and the sheet schemas). Sibling Lab Oops applications that inherited the PIN gateway likely carry the same weakness and should be reviewed.
* Authorization no longer depends on a secret in source control.
* Break-glass access exists without an identity fallback.
* Checklist rows `P1-03`, `P1-24` and `P1-25` verify the decision.
