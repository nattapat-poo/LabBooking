# Codebase Function Blueprint (Cycle: 15)

> *Note: This file is auto-generated. Do not manually edit function lists.*

### API_Bridge
- `_authenticateRouteGateway`
- `bridgeGetUserInfo`
- `bridgeGetTeacherList`
- `bridgeGetLabList`
- `bridgeGetSubjectList`
- `bridgeGetLabOutages`
- `bridgeGetLabAssignmentContext`
- `bridgeSearchTeachers`
- `bridgeSubmitBooking`
- `bridgeApproveBooking`
- `bridgeRejectBooking`
- `bridgeCancelBooking`
- `bridgeTriggerManualRevalidation`
- `getCalendarDayType`
- `getBellType`

### API_Calendar
- `_getCalendarIdForLab`
- `processCalendarSyncHook`
- `_synSingleEvent`
- `_resolvePeriodDateTimeBounds`

### API_Notification
- `_getPrecompiledLayoutShell`
- `getEmailTemplate`
- `hydrateTemplate`
- `dispatchMail`
- `sendConfirmationEmail`
- `sendConflictAlertEmail`
- `sendSubmissionReceipt`
- `sendDenialEmail`
- `sendCancellationEmail`

### API_Read_Aggregator
- `getWeeklySchedule`
- `getCalendarMetadataTimeline`

### API_Read_Lab
- `coreGetLabList`
- `coreGetLabOutages`
- `coreGetLabAssignmentContext`
- `coreGetBookingHistory`
- `coreGetMyPendingBookings`
- `coreGetCalendarData`
- `coreIsOperationalDay`

### API_Read_User
- `coreGetUserInfo`
- `coreGetTeacherList`
- `coreSearchTeachers`
- `coreGetSubjectList`

### API_TALT_Auth
- `enforceTALTAuth`
- `verifyAndGetAdminEmail`

### API_TALT_Core
- `taltOverrideAssignment`
- `taltGenerateOutageWindow`
- `taltUpdateSystemConfig`

### API_TALT_Report
- `getTALTDashboardMetrics`
- `coreGenerateWorkloadReport`

### API_Update_Meta
- `completeTutorial`
- `requestPostponement`

### API_Update_RBAC
- `rbacExecuteApprove`
- `rbacExecuteReject`
- `rbacExecuteCancel`

### API_Validation
- `executePreWriteValidation`

### API_Write_Assignment
- `_isTaltAvailable`
- `autoAssignTalt`

### API_Write_Core
- `writeExecuteLockTransaction`
- `coreBatchSubmit`

### Client_Bridge.html
- *(No functions found in this module)*

### Diag_Console.html
- *(No functions found in this module)*

### Engine_Business
- `validateBookingRequest`
- `processNewBookingTransaction`

### Grid_Calendar.html
- *(No functions found in this module)*

### Health_UAT
- `_recordUatTelemetry`
- `_preFlightUatPurge`
- `runUat_WriteSuite`
- `runUat_UpdateSuite`
- `runUat_TaltSuite`
- `runDiagnosticSuiteForDomain`
- `executeTestDomain`

### Health_Unit_Bridge
- `logBridgeTestDiagnostic`
- `_recordBridgeUnitTelemetry`
- `runUnit_BridgeSuite`

### Health_Unit_Core
- `logCoreTestDiagnostic`
- `_recordCoreUnitTelemetry`
- `runUnit_CoreSuite`

### Health_Unit_Service
- `logServicesTestDiagnostic`
- `_recordServicesUnitTelemetry`
- `runUnit_ServiceSuite`

### Index.html
- *(No functions found in this module)*

### JS_Core.html
- `initCoreEngine`
- `hydrateHeaderUI`
- `toggleSlotSelection`
- `clearSelectedSlots`
- `submitBatchBooking`

### JS_Header.html
- `init`
- `configureRoleSwitcher`
- `formatRoleName`
- `handleRoleSwitch`
- `setProxyMode`
- `clearProxyMode`
- `exitProxyMode`
- `updateSchedulingStack`
- `handleManualRevalidation`
- `resetRevalidationState`
- `navigateWeek`
- `navigateToday`

### JS_TALTView.html
- *(No functions found in this module)*

### JS_TeacherView.html
- *(No functions found in this module)*

### JS_Utilities.html
- `showToast`
- `dismissToast`
- `getShimmerTemplate`
- `triggerManualRevalidation`

### Main
- `getVerifiedSessionContext`
- `doGet`
- `_renderUnauthorizedUI`
- `_renderFallbackErrorUI`
- `include`
- `testInclude`

### Main_Dev_Sandbox
- `injectDevSandbox`

### Mock_Data
- `getServerMockTelemetryPayload`

### Modal_BatchAction.html
- `openBatchActionModal`
- `closeBatchActionModal`
- `renderBatchActionTable`
- `setItemDecision`
- `applyGlobalBatchIntent`
- `updateBatchTally`
- `commitBatchActions`

### Modal_Details.html
- `openDetailsModal`
- `closeDetailsModal`
- `validateModalFormState`
- `applyQuickBookTemplate`
- `executeBatchSubmission`

### Modal_EmailEditor.html
- `openEmailEditorModal`
- `closeEmailEditorModal`
- `loadSelectedTemplateContent`
- `saveEmailTemplate`

### Modal_SelectedSlots.html
- `handleClearBatch`
- `handleInitializeBatchSubmission`

### Modal_Welcome.html
- `openWelcomeModal`
- `advanceWelcomeStep`
- `updateTutorialStepUI`
- `dismissWelcomeTutorial`

### Modal_Workload.html
- `openWorkloadModal`
- `closeWorkloadModal`
- `renderWorkloadStats`
- `updateWorkloadBar`

### Sys_Diagnostic
- `inspectSystemConnection`
- `fixSystemSpreadsheetLink`

### Telemetry
- `monitoredBatchSubmit`
- `monitoredApproveBooking`
- `monitoredRejectBooking`
- `monitoredCancelBooking`
- `_sampleDiagnosticLock`
- `_writeLogEntry`

### Test_Runner.html
- `initializeDiagnosticConsole`
- `renderDomainList`
- `writeToConsoleStream`
- `updateRowState`
- `setUIMutexState`
- `runSingleTest`
- `runAllTests`
- `next`
- `clearAllTelemetryOutputs`
- `copyActiveConsoleToClipboard`

### UI_FallbackError.html
- *(No functions found in this module)*

### UI_Unauthorized.html
- *(No functions found in this module)*

### Utils_Cache
- `getCachedSheetValues`
- `setCachedSheetValues`
- `clearCacheForSheet`
- `clearAllCaches`

### Utils_Config
- `loadDynamicConfig`
- `getConfig`
- `getConfigValue`

### Utils_Core
- `getMainSpreadsheet`
- `getSheet`
- `getSheetData`
- `withLock`
- `generateUniqueId`
- `parseDateString`
- `safeStringify`

### Utils_DataMapper
- *(No functions found in this module)*

### Utils_Schema
- `_deepFreezeSchema`

### Utils_Security
- `getSecureAuthenticatedUserEmail`
- `isValidMahidolEmail`
- `enforcePerimeterSecurityGatekeeper`
- `_fetchRoleFromDatabaseSheet`
- `_helperVerifyUserRole`

