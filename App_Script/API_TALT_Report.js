/**
 * ============================================================================
 * FILE: API_TALT_Report.js
 * PURPOSE: Non-mutative analytical reporting engines and workload dashboards.
 * PRD/DESIGN REF: Section 7 (Read Functions 7.12, 7.15) / Section 15.8 / Phase 5 Data Integration
 * AUTHOR: Gemini Lead Engineer Gem
 * PROTOCOL: 100% Mirror Promotion Compliant, Context-Stabilized, Cache-Bypassing Read Layer
 * AUDIT: Cycle 13 Cleared (Terminology Compliant)
 * ============================================================================
 */

/**
 * 7.15 getTALTDashboardMetrics
 * Aggregates summary statistics from historical bookings for the TALT administrative panel.
 * Explicitly bypasses all cache layers and utilizes context-stabilized spreadsheet access.
 * @return {Object} High-level metric counts and laboratory distribution breakdowns.
 */
function getTALTDashboardMetrics() {
  try {
    const config = typeof getConfig === 'function' ? getConfig() : null;
    if (!config) throw new Error("Configuration context missing.");

    const ss = typeof getMainSpreadsheet === 'function' ? getMainSpreadsheet() : SpreadsheetApp.getActiveSpreadsheet();
    const sheetName = config.SPREADSHEET_CONFIG.SHEETS.TRANSACTIONS;
    const sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      return { totalBookings: 0, approvedBookings: 0, pendingBookings: 0, labBreakdown: [] };
    }

    const txData = sheet.getDataRange().getValues();
    if (txData.length <= 1) {
      return { totalBookings: 0, approvedBookings: 0, pendingBookings: 0, labBreakdown: [] };
    }

    if (typeof TX_COL === 'undefined') throw new Error("Schema Mapping Exception: Global TX_COL is undefined.");

    // Map rows cleanly through decoupled schema definitions
    const records = Utils_DataMapper.mapSheetRowsToObjects(txData, TX_COL);
    
    let total = 0;
    let approved = 0;
    let pending = 0;
    const labDistributionMap = {};

    records.forEach(row => {
      const currentStatus = String(row.STATUS || "").toUpperCase().trim();
      
      if (currentStatus === "DELETED" || currentStatus === "DENIED" || currentStatus === "REJECTED") {
        return; 
      }

      total++;
      if (currentStatus === "APPROVED" || currentStatus === "CONFIRMED") approved++;
      if (currentStatus === "PENDING") pending++;

      const targetLabId = row.LAB_ID || "UNKNOWN";
      const targetLabName = row.LAB_NAME || `Room ${targetLabId}`;

      if (!labDistributionMap[targetLabId]) {
        labDistributionMap[targetLabId] = { labId: targetLabId, labName: targetLabName, count: 0 };
      }
      labDistributionMap[targetLabId].count++;
    });

    const breakdownArray = Object.keys(labDistributionMap).map(key => labDistributionMap[key]);

    return {
      totalBookings: total,
      approvedBookings: approved,
      pendingBookings: pending,
      labBreakdown: breakdownArray
    };

  } catch (error) {
    if (typeof _writeLogEntry === 'function') {
      _writeLogEntry("ERROR", `[API_TALT_Report.getTALTDashboardMetrics] System calculation fault: ${error.message}`);
    }
    throw error;
  }
}

/**
 * 7.12 coreGenerateWorkloadReport
 * Processes granular transaction operational records filtered by a target date fence window.
 */
function coreGenerateWorkloadReport(startDateBoundary, endDateBoundary) {
  try {
    if (typeof enforceTALTAuth === 'function') enforceTALTAuth("Generate Workload Report");

    const config = typeof getConfig === 'function' ? getConfig() : null;
    const ss = typeof getMainSpreadsheet === 'function' ? getMainSpreadsheet() : SpreadsheetApp.getActiveSpreadsheet();
    const sheetName = config.SPREADSHEET_CONFIG.SHEETS.TRANSACTIONS;
    const sheet = ss.getSheetByName(sheetName);

    if (!sheet) return [];
    const rawValues = sheet.getDataRange().getValues();
    if (rawValues.length <= 1) return [];

    if (typeof TX_COL === 'undefined') throw new Error("Schema Context Failure: Master TX_COL layout map missing.");

    // Process array entries via compiler-frozen mapping coordinates
    const allBookings = Utils_DataMapper.mapSheetRowsToObjects(rawValues, TX_COL);
    
    const startFilter = startDateBoundary ? new Date(startDateBoundary).getTime() : 0;
    const endFilter = endDateBoundary ? new Date(endDateBoundary).getTime() : Infinity;

    const reportDataMap = {};

    for (let i = 0; i < allBookings.length; i++) {
      const booking = allBookings[i];
      if (!booking.DATE) continue;

      const bookingTime = new Date(booking.DATE).getTime();
      if (bookingTime < startFilter || bookingTime > endFilter) continue;

      const targetLabId = booking.LAB_ID || "UNKNOWN";
      const labName = booking.LAB_NAME || `Room: ${targetLabId}`;
      const status = booking.STATUS || "PENDING";
      const isProxyVal = typeof booking.IS_PROXY_MODE === "boolean" 
        ? booking.IS_PROXY_MODE 
        : String(booking.IS_PROXY_MODE).toUpperCase() === "TRUE";

      if (!reportDataMap[targetLabId]) {
        reportDataMap[targetLabId] = {
          labId: targetLabId,
          labName: labName,
          totalBookings: 0,
          approvedCount: 0,
          pendingCount: 0,
          proxyBookingsCount: 0
        };
      }

      const summary = reportDataMap[targetLabId];
      const statusClean = String(status).toUpperCase().trim();

      if (statusClean !== "DELETED" && statusClean !== "DENIED" && statusClean !== "REJECTED") {
        summary.totalBookings++;
        if (statusClean === "APPROVED" || statusClean === "CONFIRMED") summary.approvedCount++;
        if (statusClean === "PENDING") summary.pendingCount++;
        if (isProxyVal) summary.proxyBookingsCount++;
      }
    }

    return Object.keys(reportDataMap).map(key => reportDataMap[key]);

  } catch (error) {
    if (typeof _writeLogEntry === 'function') {
      _writeLogEntry("ERROR", `[API_TALT_Report.coreGenerateWorkloadReport] Execution aborted: ${error.message}`);
    }
    throw error;
  }
}