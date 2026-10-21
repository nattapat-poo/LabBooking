# 🛡️ Phase 0 Implementation Plan: Baseline, Safety, Identity Spike, Tooling & Repository Hygiene

**Target System:** `Lab Oops OS` — Project 01 (`Smart Lab Booking System`)
**Version Target:** `v1.4.0b`
**Governing Documents:** [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md), [`PHASE_CHECKLIST.md`](./PHASE_CHECKLIST.md), [`SCHEMA_CONTRACT.md`](./SCHEMA_CONTRACT.md), `AGENTS.md`
**Execution Mode:** Foundation, tooling, staging spike and safety isolation. **No application logic changes** except test-fixture sanitation in `Health_UAT.js`.

---

## 1. Purpose

Phase 0 creates the safety net for the whole remediation: an isolated rollback point, empirical proof of how caller identity behaves, an offline test harness, an automated verifier, repository hygiene, and verified schema headers. The production codebase stays untouched.

## 2. Objectives & Deliverables

| Objective | Deliverable | Verification |
|---|---|---|
| Git isolation & rollback | Branch `security/production-hardening`; tag `pre-hardening-baseline` **on the baseline SHA** | `P0-01`, `P0-02`, `P0-11` |
| Repository hygiene | Branch protection; secret scanning and push protection; pattern-based history scan; CI scan; docs lint | `P0-07`, `P0-12`, `P0-13`, `P0-14` |
| Identity Spike | `docs/IDENTITY_DECISION.md` with pre-registered criteria and redacted evidence | `P0-08`, `P0-15`, `P0-16` |
| Test harness | `test/gas-stubs.js`, `test/run_tests.js` | `P0-05` |
| Verification runner | `scripts/verify_phase.js` | `P0-06` |
| Ledger & exposure map | `docs/SECURITY_AUDIT.md`, `docs/ACCESS_CONTROL_MATRIX.md` | `P0-03`, `P0-04` |
| Fixture sanitation | `Health_UAT.js` uses `uat_tester@mahidol.ac.th` | `P0-10` |
| Schema verification | Owner-run header dump; header names and SHA-256 per header row in `schema/` | `P0-17` |

---

## 3. Workstreams

### 0.1 Git Isolation & Rollback Anchor (`P0-01`, `P0-02`, `P0-11`)
The tag must point at the **code baseline**, not whatever HEAD happens to be. Documentation commits have been added to `main` since the baseline, so tag by explicit SHA and prove `App_Script/` is unchanged.

```powershell
git fetch --all --tags
git cat-file -t b984891aef1713e991db37d3aa6168a53cbb486b                           # must print: commit
git diff --stat b984891aef1713e991db37d3aa6168a53cbb486b HEAD -- App_Script        # must print nothing
git tag -a pre-hardening-baseline b984891aef1713e991db37d3aa6168a53cbb486b -m "Code baseline before v1.4.0b hardening"
git push origin pre-hardening-baseline
git checkout -b security/production-hardening main
```
`b984891aef1713e991db37d3aa6168a53cbb486b` is the full 40-character SHA of `b984891`. Never move or re-create the tag.

### 0.2 Repository Hygiene (`P0-07`, `P0-12`, `P0-13`, `P0-14`)
The repository stays **public** (D-09), so the controls must be strong.
1. **Pattern-based history scan.** Search all history for Google ID shaped strings (44 characters of `[A-Za-z0-9_-]`), calendar IDs (`@group.calendar.google.com`) and personal emails. Report **counts only**; never write found values into any document. Do not search for a placeholder string.
2. **Branch protection on `main`:** pull request required, owner review, `verify_phase` check required, no force-push, no deletion; protect tag patterns; `CODEOWNERS` for `docs/`, `Utils_Security.js` and `appsscript.json`.
3. **GitHub secret scanning and push protection** enabled.
4. **CI:** a workflow runs the pattern scan and `verify_phase.js --phase 0` on every pull request.
5. **Docs lint:** reject `file:///` and `C:\` links (use relative links), any 44-character ID literal, and tab counts or status values that disagree with `SCHEMA_CONTRACT.md`.
6. **Single schema source:** keep `schema/contract.json` (machine-readable) alongside `SCHEMA_CONTRACT.md`; the lint compares them.
7. **Changelog discipline:** planned work is recorded under `[Unreleased]` until code ships.

### 0.3 Staging Identity Spike (`P0-08`, `P0-15`, `P0-16`) — CRITICAL GATEWAY

**Context.** Accounts span three domains: staff (`@mahidol.ac.th`), Grade 10 (`@student.mahidol.ac.th`, Microsoft mail with a Google identity) and Grades 11–12 (`@student.mahidol.edu`, Google Workspace). `Session.getActiveUser().getEmail()` can be empty under `USER_DEPLOYING` for users outside the deployer's domain, and `USER_ACCESSING` gives each user their own authority over every sheet.

**Pre-registration.** Before running any test, commit the acceptance criteria and disqualifiers below to `IDENTITY_DECISION.md`. Results are then judged against them.

**Test matrix.** Run every combination of `executeAs` (`USER_DEPLOYING`, `USER_ACCESSING`) × `access` (`DOMAIN`, `ANYONE`) for each account type: staff, G10 student, G11/G12 student, outside account.

**A combination is DISQUALIFIED if any of these is true:**
| # | Disqualifier |
|---|---|
| D1 | A **staff** account returns an empty or ambiguous identity. |
| D2 | It requires end users to hold direct access to the Local, Master DB or Timetable sheets (teachers could then edit data outside server checks; the directory would be exposed to every user). |
| D3 | Mail cannot be sent from the `talt.muids@` alias, or notifications are sent as the individual user. |
| D4 | Calendar writes require each user to hold lab-calendar edit rights. |
| D5 | It needs `access: ANYONE` to reach non-domain accounts, unless every entry point is proven fail-closed on an empty identity. |
| D6 | Identity differs between `doGet` and `google.script.run` calls. |
| D7 | Results are not reproducible in a fresh browser profile with a single signed-in account, on Chrome **and** mobile Safari. |
| D8 | It needs broader OAuth scopes than the minimal set, or shows consent screens users cannot complete. |

**Method & Account Coverage Policy (D-44):**
| Account Category | Role / Identity Used | Scope / What It Proves | What It Cannot Prove |
|---|---|---|---|
| Staff (`@mahidol.ac.th`) | Owner staff account (`Admin` in Master DB `Users`) | Tests Admin identity resolution and permissions **strictly against DEV copies**. | Does not test non-Admin staff roles without extra accounts. |
| Consumer Google Account | Owner personal account | Serves as non-Workspace negative control (`AUTH_DENIED` by domain whitelist) and proxy for Microsoft-hosted G10 accounts. | Cannot validate student domain whitelisting (tested via unit tests). |
| Workspace Student (`@student.mahidol.edu`) | Dedicated test account (if available) | Tests legacy Google Workspace student domain behavior. | Remains **unverified / best-effort** until dedicated test account exists. |
| Teacher / TA / LabTech | Unit stubs & Admin preview-impersonation | Validates permission logic, state transitions, and read-only preview. | Live multi-user concurrency on staging (validated at Phase 5). |

> **Prerequisite (D-44 / P0-18):** Isolated DEV copies of Master DB 2026 and Timetable 2026 must be configured before running tests; the production Master DB is **never modified**.

Use dedicated test accounts on each domain (never real students). Run each cell at least twice, after sign-out and sign-in. Include negative controls (a non-whitelisted account must be denied). **Staff results decide the model; student results are best-effort** and must not force a weaker design.

**Evidence handling (public repo).** Record domain, model, access setting and pass/fail only. Do not commit any email address or the raw probe output. Undeploy the probe when finished.

**Probe (staging only):** a minimal `doGet` and one `google.script.run` function that return `activeUser`, `effectiveUser`, and `authMode`.

**Deliverable:** `docs/IDENTITY_DECISION.md` with the chosen model, the evidence matrix, residual risks and a re-verification trigger (re-run when Google changes behaviour). Phase 1 cannot start until the owner approves it.

### 0.4 Node Test Harness (`P0-05`)
`test/gas-stubs.js` and `test/run_tests.js` provide stubs for `Session`, `SpreadsheetApp`, `LockService`, `CacheService`, `PropertiesService` and `Utilities`, with in-memory sheets, lock timeouts, TTL expiry and switchable active users. All pure logic (permissions, domains, state machine, validation, sanitisers) must be runnable here.

### 0.5 Verification Runner (`P0-06`)
`node scripts/verify_phase.js --phase <N>`: file and symbol presence, forbidden-pattern sweeps (`getEffectiveUser`, `DEV_MOCK_USER_EMAIL`, `typeof withLock`, `ALLOWALL`, PIN text, `TEACHER_EMAIL` ownership, `file:///`), unit tests, checklist integrity, diff-scope check, documentation-consistency lint.

### 0.6 Ledger & Exposure Map (`P0-03`, `P0-04`)
`docs/SECURITY_AUDIT.md` classifies F-01 … F-18 as confirmed, conditional or unverified, with root cause, remediation phase and test ID. `docs/ACCESS_CONTROL_MATRIX.md` inventories all 50 files and every global function (public, internal, trigger-only, dev/test, admin).

### 0.7 Fixture Sanitation (`P0-10`)
Replace `uat_tester@mahidol.edu` with `uat_tester@mahidol.ac.th` in `Health_UAT.js` and diagnostic mocks.

### 0.8 Schema Verification (`P0-17`)
The owner runs a **read-only** header dump over the 12 consumed tabs. Commit only header names and a SHA-256 of each header row to `schema/`, plus a report of any array formulas or formula-derived IDs (including `Users.UserID`). Reconcile any difference with `SCHEMA_CONTRACT.md` before Gate 0.

---

## 4. Phase 0 Checklist Mapping

| Checklist ID | Requirement | Verification | Status |
|---|---|---|:---:|
| `P0-01` | Working branch | `git branch --show-current` | ☐ |
| `P0-02` | Rollback tag on explicit SHA | `git rev-parse pre-hardening-baseline^{commit}` | ☐ |
| `P0-03` | Audit ledger | Inspect `docs/SECURITY_AUDIT.md` | ☐ |
| `P0-04` | Exposure map | Inspect `docs/ACCESS_CONTROL_MATRIX.md` | ☐ |
| `P0-05` | Node harness | `node test/run_tests.js` | ☐ |
| `P0-06` | Verification runner | `node scripts/verify_phase.js --phase 0` | ☐ |
| `P0-07` | Pattern-based history scan | Counts-only report | ☐ |
| `P0-08` | Identity Spike | `docs/IDENTITY_DECISION.md` | ☐ |
| `P0-09` | Skills mapping and rule files exist | Inspect plan §1 | ☐ |
| `P0-10` | Fixture sanitation | `git grep "@mahidol.edu" -- App_Script` | ☐ |
| `P0-11` | `App_Script/` unchanged since baseline | `git diff --stat` | ☐ |
| `P0-12` | Branch protection, secret scanning | Owner evidence | ☐ |
| `P0-13` | CI scan job | Workflow file | ☐ |
| `P0-14` | Docs lint | `verify_phase --phase 0` | ☐ |
| `P0-15` | Spike criteria pre-registered | Commit history | ☐ |
| `P0-16` | Spike evidence redacted; probe removed | Inspect | ☐ |
| `P0-17` | Header dump verified | `schema/` vs contract | ☐ |
| `P0-18` | DEV copies of Master DB and Timetable exist | Owner verification | ☑ |
| `P0-19` | Spike account-coverage matrix committed | Inspect `docs/IDENTITY_DECISION.md` | ☐ |

## 5. Gate 0 Exit Criteria

1. Branch and tag exist; `App_Script/` unchanged since baseline.
2. `docs/IDENTITY_DECISION.md` approved by the owner, judged against the pre-registered disqualifiers.
3. Repository protections active; scans clean or reported.
4. `docs/SECURITY_AUDIT.md` and `docs/ACCESS_CONTROL_MATRIX.md` published.
5. `node test/run_tests.js` and `node scripts/verify_phase.js --phase 0` exit 0.
6. Schema header dump reconciled with the contract.
7. Zero changes in `App_Script/` except fixture sanitation.

## 🛑 Gate 0 Protocol
After the evidence pack is generated, work stops. The Lead Architect reviews it and approves Phase 1.
