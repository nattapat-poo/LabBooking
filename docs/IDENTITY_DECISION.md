# 🧭 Identity Spike Architecture & Decision Record (P0-08, P0-15, P0-16)

**Target System:** `Lab Oops OS` — Project 01 (`Smart Lab Booking System`)  
**Status:** Pre-Registration Phase (Criteria & Disqualifiers Committed Before Execution)  
**Governing Standard:** `gas-best-practices` (`rules/security.md`), `lab-oops-standards` (§1), [`PHASE_0_IMPLEMENTATION_PLAN.md`](./PHASE_0_IMPLEMENTATION_PLAN.md)  
**Requirement Mapping:** `P0-08`, `P0-15`, `P0-16`, `R-01`, `R-02`, `D-33`

---

## 1. Context & Problem Statement

User accounts in the MUIDS ecosystem span three distinct Google / Microsoft email domains:
1. **Staff & Teachers:** `@mahidol.ac.th` (Google Workspace institutional domain).
2. **Grade 10 Students:** `@student.mahidol.ac.th` (Microsoft 365 Exchange mail, linked with Google identity).
3. **Grades 11–12 Students:** `@student.mahidol.edu` (Google Workspace legacy domain).

In Google Apps Script web apps, `Session.getActiveUser().getEmail()` and `Session.getEffectiveUser().getEmail()` behave differently depending on the deployment settings:
- **`executeAs: USER_DEPLOYING`** (Developer context): The script runs with the permissions of the deployer. Cross-domain users (e.g., `@student.*` calling a `@mahidol.ac.th` script) may return an empty string for `getActiveUser().getEmail()` unless access is properly configured.
- **`executeAs: USER_ACCESSING`** (User context): The script runs with the permissions of the browsing user. This requires granting end users direct read/write access to the Google Spreadsheets, which violates database encapsulation and allows users to modify data outside Apps Script logic.

To establish the definitive production deployment topology for Phase 1 without guesswork, this document pre-registers the evaluation criteria, disqualifiers, and execution matrix for an empirical **Staging Identity Spike**.

---

## 2. Pre-Registered Disqualifiers (D1 … D8)

A deployment topology configuration is **DISQUALIFIED** from production consideration if any of the following statements is true:

| ID | Disqualifier Rule | Justification / Impact |
|:---:|---|---|
| **D1** | A **staff** account (`@mahidol.ac.th`) returns an empty or ambiguous identity in `Session.getActiveUser().getEmail()`. | Staff authentication is mission-critical. If staff identity cannot be resolved reliably, bookings and approvals cannot be authenticated. |
| **D2** | It requires end users (teachers or students) to hold direct edit/view access to the underlying Google Spreadsheets (`<LOCAL_SPREADSHEET_ID>`, `<MASTER_DB_ID>`, `<TIMETABLE_2026_ID>`). | Bypasses server logic; users could alter bookings directly in Sheets, and student directory PII would be exposed to all users. |
| **D3** | Automated notifications cannot be sent from the `talt.muids@mahidol.ac.th` institutional alias, or emails are sent as the browsing user. | Notification emails must originate from the authoritative departmental mailbox. |
| **D4** | Google Calendar synchronization requires individual teachers to hold edit rights over departmental lab calendars. | Departmental calendars must be maintained exclusively by the service account or deployment owner. |
| **D5** | It requires setting access to `ANYONE` (anonymous) to reach student accounts, without proving every entry point fails closed on empty identity. | Opens the system to unauthenticated public internet requests. |
| **D6** | Identity resolution differs between initial page load (`doGet`) and client-to-server RPC calls (`google.script.run`). | Causes session state desynchronization between HTML rendering and data submission. |
| **D7** | Results fail to reproduce consistently across fresh browser profiles with a single signed-in account, on both Google Chrome and Mobile Safari (iOS ITP). | Web app must work reliably across standard desktop and mobile devices. |
| **D8** | It requires broader OAuth scopes than the minimal declared set in `appsscript.json`, or forces users through unverified app consent screens. | Compromises security and creates onboarding friction. |

---

## 3. Staging Spike Evaluation Matrix

The probe script tests all 4 deployment combinations across the 4 account categories (using **dedicated test accounts**, never real student data):

| Deployment Configuration | Execute As (`executeAs`) | Access Permission (`access`) | Staff (`@mahidol.ac.th`) | G10 (`@student.mahidol.ac.th`) | G11-12 (`@student.mahidol.edu`) | Outside Account (Negative Control) |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Config A** | `USER_DEPLOYING` | `DOMAIN` (Mahidol) | *Pending Probe* | *Pending Probe* | *Pending Probe* | *Expected: Blocked* |
| **Config B** | `USER_DEPLOYING` | `ANYONE` | *Pending Probe* | *Pending Probe* | *Pending Probe* | *Expected: AUTH_DENIED* |
| **Config C** | `USER_ACCESSING` | `DOMAIN` (Mahidol) | *Pending Probe* | *Pending Probe* | *Pending Probe* | *Expected: Blocked* |
| **Config D** | `USER_ACCESSING` | `ANYONE` | *Pending Probe* | *Pending Probe* | *Pending Probe* | *Expected: AUTH_DENIED* |

*Note: In accordance with D-08, staff accounts decide the production model. Student account behavior is documented for the future Student module and must not weaken staff security.*

---

## 4. Staging Probe Technical Specification

The probe is a disposable, isolated Google Apps Script project deployed strictly to the Staging environment.

### 4.1 Probe Backend (`Code.gs`)
```javascript
function doGet(e) {
  var activeUser = Session.getActiveUser().getEmail();
  var effectiveUser = Session.getEffectiveUser().getEmail();
  var authMode = ScriptApp.getAuthMode ? ScriptApp.getAuthMode().toString() : 'UNKNOWN';
  
  var template = HtmlService.createTemplateFromFile('Probe_UI');
  template.serverData = {
    doGetActive: activeUser || '(EMPTY)',
    doGetEffective: effectiveUser || '(EMPTY)',
    authMode: authMode
  };
  return template.evaluate()
    .setTitle('MUIDS Identity Spike Probe')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.DEFAULT);
}

function probeRpcIdentity() {
  return {
    rpcActive: Session.getActiveUser().getEmail() || '(EMPTY)',
    rpcEffective: Session.getEffectiveUser().getEmail() || '(EMPTY)'
  };
}
```

### 4.2 Probe Frontend (`Probe_UI.html`)
```html
<!DOCTYPE html>
<html>
  <head>
    <title>Identity Probe</title>
  </head>
  <body style="font-family: sans-serif; padding: 20px;">
    <h2>Identity Spike Probe Results</h2>
    <p><strong>doGet Active:</strong> <?= serverData.doGetActive ?></p>
    <p><strong>doGet Effective:</strong> <?= serverData.doGetEffective ?></p>
    <div id="rpcResults">Probing RPC...</div>
    <script>
      google.script.run
        .withSuccessHandler(function(res) {
          document.getElementById('rpcResults').innerHTML =
            '<p><strong>RPC Active:</strong> ' + res.rpcActive + '</p>' +
            '<p><strong>RPC Effective:</strong> ' + res.rpcEffective + '</p>';
        })
        .withFailureHandler(function(err) {
          document.getElementById('rpcResults').innerHTML = '<p style="color:red;">RPC Failed: ' + err.message + '</p>';
        })
        .probeRpcIdentity();
    </script>
  </body>
</html>
```

---

## 5. Evidence Handling & Public Repository Hygiene

Because this repository is public (`D-09`):
1. **Zero Email Disclosure:** Never commit real email addresses or unredacted raw JSON outputs from the probe.
2. **Redacted Evidence Format:** Document test results using domain labels and pass/fail indicators only (e.g. `Staff (@mahidol.ac.th): Resolved (PASS)`, `External: Rejected (PASS)`).
3. **Probe Disposal:** Once the spike execution is complete and verified by the Lead Architect, the staging probe web app deployment must be deleted immediately.

---

## 6. Pre-Spike Baseline Decision & Fallback Strategy

* **Hypothesis:** `executeAs: USER_DEPLOYING` with `access: ANYONE` (Config B) or `access: DOMAIN` (Config A) fails closed at `withGatekeeper` level.
* **Pre-Spike Working Standard:** Staff accounts authenticate cleanly via `Session.getActiveUser().getEmail()`. The gatekeeper resolves this against Master DB `Users`. If empty or unauthorized, execution terminates with `AUTH_DENIED`.
* **Re-Verification Trigger:** This spike must be re-run whenever Google Workspace tenant policies or Apps Script runtime configurations change.
