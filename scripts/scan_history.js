#!/usr/bin/env node

/**
 * 🕵️ Pattern-based Git History Scanner (P0-07)
 * Scans full git commit history across all branches and tags for pattern occurrences.
 * Emits counts ONLY to preserve privacy in public repositories.
 */

const { execSync } = require('child_process');

console.log('🔍 Executing Full Git History Pattern Scanner (P0-07)...\n');

try {
  const fullLog = execSync('git log -p --all', { encoding: 'utf8', maxBuffer: 50 * 1024 * 1024 });

  // 1. Google 44-char spreadsheet ID pattern: [A-Za-z0-9_-]{44}
  const idRegex = /[^A-Za-z0-9_-]([A-Za-z0-9_-]{44})[^A-Za-z0-9_-]/g;
  const idMatches = [];
  let m;
  while ((m = idRegex.exec(fullLog)) !== null) {
    const val = m[1];
    // Filter out obvious placeholders or hash strings
    if (!val.includes('<') && !val.includes('>') && !val.startsWith('0000000000000000000000000000000000000000')) {
      idMatches.push(val);
    }
  }

  // 2. Google Calendar resource IDs
  const calRegex = /[a-zA-Z0-9._%+-]+@group\.calendar\.google\.com/g;
  const calMatches = fullLog.match(calRegex) || [];

  // 3. Email patterns
  const emailRegex = /[a-zA-Z0-9._%+-]+@(mahidol\.ac\.th|student\.mahidol\.ac\.th|student\.mahidol\.edu|gmail\.com)/g;
  const emailMatches = fullLog.match(emailRegex) || [];

  console.log('======================================================');
  console.log('📊 Full Git History Pattern Scan Summary (Counts Only)');
  console.log('======================================================');
  console.log(`• 44-character Google ID occurrences found in history: ${idMatches.length} (Unique: ${new Set(idMatches).size})`);
  console.log(`• Google Calendar ID occurrences found in history:     ${calMatches.length} (Unique: ${new Set(calMatches).size})`);
  console.log(`• Email address occurrences found in history:          ${emailMatches.length} (Unique: ${new Set(emailMatches).size})`);
  console.log('======================================================\n');
  console.log('🛡️ Report format complies with D-09 / P0-07: zero plain values logged.');
} catch (err) {
  console.error('Error scanning git history:', err.message);
  process.exit(1);
}
