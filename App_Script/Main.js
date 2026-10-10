/**
 * FILE: Main.gs
 * PURPOSE: Core web application entry point (doGet) and template rendering switchboard.
 * DESIGN SPEC REF: Section 1.2 (Global Navigation), Section 1.5 (Unauthorized State)
 * PRD REF: Section 4.2.1, Section 7.1
 * VERSION: 1.1.3c
 * LAST MODIFIED: 2026-07-20
 * PROTOCOL: 1:1 Mirror Promotion (PRD 17.2)
 * AUTHOR: Gemini (Lead Engineer Gem)
 */

/**
 * Convenience wrapper to fetch current session security context.
 * @returns {Object} Security context containing authorized status, email, and role.
 */
function getVerifiedSessionContext() {
  return enforcePerimeterSecurityGatekeeper();
}

/**
 * Main HTTP GET entry point for the Google Apps Script Web App.
 * @param {Object} e HTTP Event parameters from client request.
 * @returns {HtmlOutput} Rendered web UI output.
 */
function doGet(e) {
  try {
    // 1. Enforce Perimeter Security Gatekeeper
    const gatekeeper = enforcePerimeterSecurityGatekeeper();
    if (!gatekeeper.authorized) {
      return _renderUnauthorizedUI(gatekeeper.email, gatekeeper.reason);
    }

    const userEmail = gatekeeper.email;
    const userRole = (gatekeeper.role || '').toLowerCase();
    const ADMIN_ROLES = ['admin', 'labtech', 'ta'];

    // 2. Resolve target route / requested view
    const page = (e && e.parameter && e.parameter.page) ? String(e.parameter.page).toLowerCase() : 'index';

    // 3. Administrative route clearance check
    if ((page === 'talt' || page === 'admin') && !ADMIN_ROLES.includes(userRole)) {
      _helperVerifyUserRole(ADMIN_ROLES);
    }

    // 4. Construct and evaluate main UI layout
    const template = HtmlService.createTemplateFromFile('Index');
    template.userEmail = userEmail;
    template.userRole = userRole;
    template.securityContext = gatekeeper;

    return template.evaluate()
      .setTitle('MUIDS Lab Booking System')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);

  } catch (error) {
    Logger.log('[Main.gs doGet Error] ' + (error.stack || error.message || error));
    return _renderFallbackErrorUI(error);
  }
}

/**
 * Renders the UI_Unauthorized template with populated session debug variables.
 * @param {string} userEmail Evaluated user identity email.
 * @param {string} userRole Evaluated user role from gatekeeper.
 * @return {HtmlOutput} Evaluated HTML response object.
 */
function _renderUnauthorizedUI(userEmail, userRole) {
  const template = HtmlService.createTemplateFromFile('UI_Unauthorized');
  
  template.activeEmail = userEmail || Session.getActiveUser().getEmail() || 'UNKNOWN_USER';
  template.activeRole = userRole || 'UNASSIGNED';
  
  return template.evaluate()
    .setTitle('Access Restricted - MUIDS Lab Booking')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
}

/**
 * Renders structured system error page when an unhandled runtime error occurs during doGet.
 * @param {Error|string} error Caught exception object or message string.
 * @returns {HtmlOutput} Rendered error view.
 */
function _renderFallbackErrorUI(error) {
  const errorMessage = (error && error.message) ? error.message : String(error);
  const safeMessage = errorMessage.replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <base target="_top">
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>System Error - MUIDS Lab Booking</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body class="bg-slate-50 font-sans min-h-screen flex items-center justify-center p-4">
        <div class="max-w-lg w-full bg-white rounded-xl shadow-xl border border-slate-200 p-6 text-center">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-red-100 text-red-600 rounded-full mb-4">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
          </div>
          <h1 class="text-xl font-bold text-slate-800 mb-2">Application Initialization Error</h1>
          <p class="text-sm text-slate-600 mb-4">An unexpected exception occurred during request execution.</p>
          <div class="bg-slate-100 p-3 rounded-lg text-left text-xs font-mono text-red-700 overflow-x-auto mb-6">
            <strong>Exception Detail:</strong> ${safeMessage}
          </div>
          <button onclick="window.location.reload()" class="px-5 py-2.5 bg-[#003366] text-white font-medium text-sm rounded-lg hover:bg-blue-900 transition">
            Reload Application
          </button>
        </div>
      </body>
    </html>
  `;

  return HtmlService.createHtmlOutput(htmlContent)
    .setTitle("System Error - MUIDS Lab Booking")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Server-side asset inclusion pattern for modular HTML templates.
 * @param {string} filename Name of the HTML template file to include.
 * @returns {string} Evaluated file string contents.
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * Diagnostic utility to test whether a specific component file can be resolved and included.
 * @param {string} filename Target file name.
 * @returns {Object} Diagnostic status report.
 */
function testInclude(filename) {
  try {
    const content = include(filename);
    return { ok: true, success: true,  length: content.length };
  } catch (err) {
    return { ok: false, success: false,  error: err.message };
  }
}