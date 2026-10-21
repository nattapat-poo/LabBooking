#!/usr/bin/env node

/**
 * 🔍 Verification Runner for MUIDS Lab Booking System Hardening
 * Verifies phase gates, checklist integrity, forbidden patterns, schema contracts, and doc linting.
 * Usage: node scripts/verify_phase.js --phase <phaseNumber>
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const repoRoot = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const phaseIndex = args.indexOf('--phase');
const targetPhase = phaseIndex !== -1 ? parseInt(args[phaseIndex + 1], 10) : 0;

console.log(`🛡️ Executing Automated Verification for Phase ${targetPhase}...\n`);

let violations = 0;

function check(title, condition, detail = '') {
  if (condition) {
    console.log(`  ✅ [PASS] ${title}`);
  } else {
    violations++;
    console.error(`  ❌ [FAIL] ${title} ${detail ? '(' + detail + ')' : ''}`);
  }
}

// 1. Checklist Integrity Check
console.log('--- 1. Checklist Integrity ---');
const checklistPath = path.join(repoRoot, 'docs/PHASE_CHECKLIST.md');
if (fs.existsSync(checklistPath)) {
  const content = fs.readFileSync(checklistPath, 'utf8');
  const lines = content.split('\n');
  const ids = [];
  lines.forEach(l => {
    const parts = l.split('|');
    if (parts.length > 2) {
      const rawId = parts[1].trim().replace(/`/g, '');
      if (/^P[0-6]-\d\d$/.test(rawId)) {
        ids.push(rawId);
      }
    }
  });
  const counts = {};
  ids.forEach(id => { counts[id] = (counts[id] || 0) + 1; });
  const duplicates = Object.entries(counts).filter(([_, c]) => c > 1);
  check(`PHASE_CHECKLIST.md exists and contains ${ids.length} entries`, ids.length > 100);
  check('Checklist IDs are strictly unique', duplicates.length === 0, duplicates.map(d => d[0]).join(', '));
} else {
  check('PHASE_CHECKLIST.md exists', false);
}

// 2. Unit Test Execution
console.log('\n--- 2. Offline Unit Test Suite ---');
try {
  const testOutput = execSync('node test/run_tests.js', { cwd: repoRoot, encoding: 'utf8' });
  const passed = testOutput.includes('All test suites passed successfully');
  check('Offline unit tests pass cleanly', passed);
} catch (err) {
  check('Offline unit tests pass cleanly', false, err.message);
}

// 3. Schema Contract Alignment
console.log('\n--- 3. Schema Contract Alignment ---');
const contractFile = path.join(repoRoot, 'schema/contract.json');
if (fs.existsSync(contractFile)) {
  const contract = JSON.parse(fs.readFileSync(contractFile, 'utf8'));
  check('schema/contract.json is valid and specifies 12 consumed tabs', contract.totalConsumedTabs === 12);
  check('schema/contract.json specifies exactly 7 statuses', contract.statuses && contract.statuses.length === 7);
} else {
  check('schema/contract.json exists', false);
}

// 4. Git Baseline & Code Isolation (Phase 0 requirements)
console.log('\n--- 4. Git Isolation & Code Baseline ---');
try {
  const currentBranch = execSync('git branch --show-current', { cwd: repoRoot, encoding: 'utf8' }).trim();
  check('Current branch is security/production-hardening', currentBranch === 'security/production-hardening', `Current: ${currentBranch}`);

  const tagCommit = execSync('git rev-parse "pre-hardening-baseline^{commit}"', { cwd: repoRoot, encoding: 'utf8' }).trim();
  const baselineSha = 'b984891aef1713e991db37d3aa6168a53cbb486b';
  check('Rollback tag pre-hardening-baseline points to explicit baseline SHA b984891', tagCommit === baselineSha, `Found: ${tagCommit}`);

  const appScriptDiff = execSync(`git diff --stat ${baselineSha} HEAD -- App_Script`, { cwd: repoRoot, encoding: 'utf8' }).trim();
  check('App_Script/ remains 100% untouched since baseline b984891', appScriptDiff.length === 0, `Diff detected: ${appScriptDiff}`);
} catch (err) {
  check('Git baseline verification', false, err.message);
}

// 5. Documentation Hygiene Lint
console.log('\n--- 5. Documentation Hygiene Lint ---');
const docFiles = [
  'docs/IMPLEMENTATION_PLAN.md',
  'docs/PHASE_0_IMPLEMENTATION_PLAN.md',
  'docs/PHASE_CHECKLIST.md',
  'docs/SCHEMA_CONTRACT.md',
  'docs/SECURITY_AUDIT.md',
  'docs/ACCESS_CONTROL_MATRIX.md',
  'docs/IDENTITY_DECISION.md',
  'docs/CHANGELOG.md',
  'docs/DevLog.md',
  'docs/Planning.md',
  'docs/Project_Profile.md'
];

let docViolations = 0;
docFiles.forEach(relPath => {
  const fullPath = path.join(repoRoot, relPath);
  if (!fs.existsSync(fullPath)) return;
  const content = fs.readFileSync(fullPath, 'utf8');

  // Check for local file:/// links (actual markdown links or URLs, not code backticks discussing the rule)
  if (/\[.*?\]\(file:\/\/\//i.test(content) || /<file:\/\/\//i.test(content) || /href=["']file:\/\/\//i.test(content)) {
    docViolations++;
    console.error(`  ❌ [LINT] ${relPath} contains prohibited 'file:///' link`);
  }
  // Check for hardcoded 44-character Google IDs (excluding placeholder brackets)
  const matches = content.match(/[^A-Za-z0-9_-][A-Za-z0-9_-]{44}[^A-Za-z0-9_-]/g);
  if (matches) {
    const realIds = matches.filter(m => !m.includes('<') && !m.includes('>'));
    if (realIds.length > 0) {
      docViolations++;
      console.error(`  ❌ [LINT] ${relPath} contains literal 44-character ID`);
    }
  }
});
check('Documentation files pass hygiene lint (no file:///, no plain 44-char IDs)', docViolations === 0);

console.log('\n======================================================');
if (violations > 0) {
  console.error(`❌ Phase ${targetPhase} Verification FAILED with ${violations} violation(s).`);
  process.exit(1);
} else {
  console.log(`🎉 Phase ${targetPhase} Verification PASSED! Gate criteria satisfied.`);
  process.exit(0);
}
