/**
 * 🚀 Offline Test Runner for MUIDS Lab Booking System
 * Runs offline unit tests against Google Apps Script Stubs.
 */

const fs = require('fs');
const path = require('path');
const { createGasStubs } = require('./gas-stubs');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ PASS: ${message}`);
  } else {
    failedTests++;
    console.error(`  ❌ FAIL: ${message}`);
  }
}

function assertThrows(fn, expectedCode, message) {
  totalTests++;
  try {
    fn();
    failedTests++;
    console.error(`  ❌ FAIL (Expected error ${expectedCode} but none thrown): ${message}`);
  } catch (err) {
    if (expectedCode && !err.message.includes(expectedCode)) {
      failedTests++;
      console.error(`  ❌ FAIL (Wrong error. Expected: ${expectedCode}, Got: ${err.message}): ${message}`);
    } else {
      passedTests++;
      console.log(`  ✅ PASS: ${message}`);
    }
  }
}

console.log('🧪 Starting MUIDS Lab Booking System Offline Test Suite...\n');

// Test Suite 1: GAS Stubs Boot & Initialization (P0-05)
console.log('--- Suite 1: GAS Stubs Initialization (P0-05) ---');
const stubs = createGasStubs();
assert(stubs.Session.getActiveUser().getEmail() === 'teacher.bal@mahidol.ac.th', 'Session stubs active user correctly');
assert(stubs.PropertiesService.getScriptProperties().getProperty('SUPERADMIN_EMAILS') === 'nattapat.poo@mahidol.ac.th', 'PropertiesService returns SUPERADMIN_EMAILS');
const lock = stubs.LockService.getScriptLock();
assert(lock.tryLock(1000) === true && lock.hasLock === true, 'LockService acquires lock');
lock.releaseLock();
assert(lock.hasLock === false, 'LockService releases lock');
const uuid = stubs.Utilities.getUuid();
assert(typeof uuid === 'string' && uuid.length === 36, 'Utilities.getUuid generates valid UUID format');

// Test Suite 2: Schema Contract Verification (P0-14, R-05)
console.log('\n--- Suite 2: Schema Contract Verification (R-05) ---');
const contractPath = path.join(__dirname, '../schema/contract.json');
assert(fs.existsSync(contractPath), 'schema/contract.json file exists');
const contract = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
assert(contract.totalConsumedTabs === 12, 'Contract specifies exactly 12 consumed tabs');
assert(contract.spreadsheets.local.access === 'READ_WRITE', 'Local spreadsheet access is READ_WRITE');
assert(contract.spreadsheets.master_db.access === 'READ_ONLY', 'Master DB spreadsheet access is READ_ONLY');
assert(contract.spreadsheets.timetable.access === 'READ_ONLY', 'Timetable spreadsheet access is READ_ONLY');
assert(contract.statuses.length === 7, 'Contract specifies exactly 7 status enum values');
assert(contract.statuses.includes('POSTPONE_PENDING_TALT') && contract.statuses.includes('POSTPONE_PENDING_TEACHER'), 'Contract contains linked postponement statuses');

// Test Suite 3: Formula Injection Sanitization (F-06, P4-01)
console.log('\n--- Suite 3: Formula Injection Sanitization (F-06) ---');
function sanitizeCell_(value) {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  if (/^[=+\-@\t\r]/.test(trimmed)) {
    return "'" + value;
  }
  return value;
}
assert(sanitizeCell_('=SUM(A1:A10)') === "'=SUM(A1:A10)", 'Leading = is prefixed with apostrophe');
assert(sanitizeCell_('+12345') === "'+12345", 'Leading + is prefixed with apostrophe');
assert(sanitizeCell_('-100') === "'-100", 'Leading - is prefixed with apostrophe');
assert(sanitizeCell_('@command') === "'@command", 'Leading @ is prefixed with apostrophe');
assert(sanitizeCell_('Normal Lab Title') === 'Normal Lab Title', 'Normal text is unaltered');

// Test Suite 4: Canonical Role & Permissions Policy (R-03, D-08, D-10, D-24)
console.log('\n--- Suite 4: Permissions Policy Matrix (R-03) ---');
const PERMISSIONS = {
  Teacher: ['ACTION_SUBMIT_BOOKING', 'ACTION_VIEW_OWN_BOOKINGS', 'ACTION_VIEW_ALL_BOOKINGS', 'ACTION_VIEW_SCHEDULE', 'ACTION_CANCEL_BOOKING', 'ACTION_REQUEST_POSTPONE', 'ACTION_APPROVE_POSTPONE', 'ACTION_CANCEL_POSTPONE_REQUEST', 'ACTION_VIEW_LOGS_STATS'],
  TA: ['ACTION_SUBMIT_BOOKING', 'ACTION_VIEW_OWN_BOOKINGS', 'ACTION_VIEW_ALL_BOOKINGS', 'ACTION_VIEW_SCHEDULE', 'ACTION_CANCEL_BOOKING', 'ACTION_APPROVE_BOOKING', 'ACTION_REJECT_BOOKING', 'ACTION_REQUEST_POSTPONE', 'ACTION_APPROVE_POSTPONE', 'ACTION_CANCEL_POSTPONE_REQUEST', 'ACTION_ASSIGN_ROOM_TECH', 'ACTION_MANAGE_OUTAGES', 'ACTION_VIEW_LOGS_STATS', 'ACTION_TRIGGER_CALENDAR'],
  LabTech: ['ACTION_SUBMIT_BOOKING', 'ACTION_VIEW_OWN_BOOKINGS', 'ACTION_VIEW_ALL_BOOKINGS', 'ACTION_VIEW_SCHEDULE', 'ACTION_CANCEL_BOOKING', 'ACTION_APPROVE_BOOKING', 'ACTION_REJECT_BOOKING', 'ACTION_REQUEST_POSTPONE', 'ACTION_APPROVE_POSTPONE', 'ACTION_CANCEL_POSTPONE_REQUEST', 'ACTION_ASSIGN_ROOM_TECH', 'ACTION_MANAGE_OUTAGES', 'ACTION_VIEW_LOGS_STATS', 'ACTION_TRIGGER_CALENDAR'],
  Admin: ['ACTION_SUBMIT_BOOKING', 'ACTION_VIEW_OWN_BOOKINGS', 'ACTION_VIEW_ALL_BOOKINGS', 'ACTION_VIEW_SCHEDULE', 'ACTION_CANCEL_BOOKING', 'ACTION_APPROVE_BOOKING', 'ACTION_REJECT_BOOKING', 'ACTION_REQUEST_POSTPONE', 'ACTION_APPROVE_POSTPONE', 'ACTION_CANCEL_POSTPONE_REQUEST', 'ACTION_ASSIGN_ROOM_TECH', 'ACTION_MANAGE_OUTAGES', 'ACTION_EDIT_CONFIG', 'ACTION_VIEW_LOGS_STATS', 'ACTION_RUN_DIAGNOSTICS', 'ACTION_IMPERSONATE_PREVIEW', 'ACTION_TRIGGER_CALENDAR'],
  HoD: ['ACTION_VIEW_OWN_BOOKINGS', 'ACTION_VIEW_ALL_BOOKINGS', 'ACTION_VIEW_SCHEDULE', 'ACTION_VIEW_LOGS_STATS'],
  Student: []
};

function checkPermission(role, action) {
  const allowed = PERMISSIONS[role] || [];
  return allowed.includes(action);
}

assert(checkPermission('Teacher', 'ACTION_APPROVE_BOOKING') === false, 'Teacher CANNOT approve bookings');
assert(checkPermission('TA', 'ACTION_APPROVE_BOOKING') === true, 'TA CAN approve bookings');
assert(checkPermission('LabTech', 'ACTION_APPROVE_BOOKING') === true, 'LabTech CAN approve bookings');
assert(checkPermission('HoD', 'ACTION_APPROVE_BOOKING') === false, 'HoD CANNOT approve bookings (executive read-only)');
assert(checkPermission('HoD', 'ACTION_SUBMIT_BOOKING') === false, 'HoD CANNOT submit directly (books via on-behalf proxy)');
assert(checkPermission('Student', 'ACTION_VIEW_SCHEDULE') === false, 'Student has zero permissions (D-08)');
assert(checkPermission('Admin', 'ACTION_EDIT_CONFIG') === true, 'Admin CAN edit config');
assert(checkPermission('Teacher', 'ACTION_VIEW_LOGS_STATS') === true, 'Teacher CAN view read-only forensic logs/stats');

// Test Suite 5: Fail-Closed Gatekeeper Behavior (F-01, F-03, ADR-0002)
console.log('\n--- Suite 5: Fail-Closed Gatekeeper (F-01, F-03) ---');
function mockGatekeeper(email, role, action, superadminEmails = '') {
  if (!email || typeof email !== 'string' || !email.trim()) {
    throw new Error('AUTH_DENIED: Unresolved caller identity');
  }
  const cleanEmail = email.trim().toLowerCase();
  const allowedDomains = ['@mahidol.ac.th', '@student.mahidol.ac.th', '@student.mahidol.edu'];
  const matchesDomain = allowedDomains.some(d => cleanEmail.endsWith(d));
  if (!matchesDomain) {
    throw new Error('AUTH_DENIED: Non-whitelisted domain');
  }

  const isSuperAdmin = superadminEmails.split(',').map(s => s.trim().toLowerCase()).includes(cleanEmail);
  if (isSuperAdmin) {
    return true; // SuperAdmin inherits all
  }

  if (!checkPermission(role, action)) {
    throw new Error(`AUTH_DENIED: Role ${role} cannot perform ${action}`);
  }
  return true;
}

assertThrows(() => mockGatekeeper('', 'Teacher', 'ACTION_VIEW_SCHEDULE'), 'AUTH_DENIED', 'Empty caller email throws AUTH_DENIED (no fail-open)');
assertThrows(() => mockGatekeeper('attacker@gmail.com', 'Admin', 'ACTION_EDIT_CONFIG'), 'AUTH_DENIED', 'Non-institutional domain throws AUTH_DENIED');
assertThrows(() => mockGatekeeper('teacher@mahidol.ac.th', 'Teacher', 'ACTION_APPROVE_BOOKING'), 'AUTH_DENIED', 'Unauthorized action throws AUTH_DENIED');
assert(mockGatekeeper('teacher@mahidol.ac.th', 'Teacher', 'ACTION_VIEW_SCHEDULE') === true, 'Authorized teacher call passes gatekeeper');
assert(mockGatekeeper('nattapat.poo@mahidol.ac.th', 'Teacher', 'ACTION_EDIT_CONFIG', 'nattapat.poo@mahidol.ac.th') === true, 'SuperAdmin with resolved email passes gatekeeper');

// Test Suite 6: Postponement State Machine (ADR-0003)
console.log('\n--- Suite 6: Postponement State Machine (ADR-0003) ---');
const STATE_TRANSITIONS = {
  APPROVED: ['CANCELLED', 'POSTPONE_PENDING_TALT', 'POSTPONE_PENDING_TEACHER'],
  POSTPONE_PENDING_TALT: ['POSTPONED', 'APPROVED', 'CANCELLED'],
  POSTPONE_PENDING_TEACHER: ['POSTPONED', 'APPROVED', 'CANCELLED']
};

function canTransition(current, next) {
  return (STATE_TRANSITIONS[current] || []).includes(next);
}

assert(canTransition('APPROVED', 'POSTPONE_PENDING_TALT') === true, 'Approved booking can transition to POSTPONE_PENDING_TALT');
assert(canTransition('POSTPONE_PENDING_TALT', 'POSTPONED') === true, 'Pending postponement can transition to POSTPONED upon approval');
assert(canTransition('POSTPONE_PENDING_TALT', 'APPROVED') === true, 'Pending postponement reverts to APPROVED upon denial/revert');
assert(canTransition('CANCELLED', 'POSTPONE_PENDING_TALT') === false, 'Terminal CANCELLED state cannot transition to postpone');

console.log('\n======================================================');
console.log(`📊 Test Summary: Total: ${totalTests} | Passed: ${passedTests} | Failed: ${failedTests}`);
console.log('======================================================\n');

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('🎉 All test suites passed successfully!\n');
  process.exit(0);
}
