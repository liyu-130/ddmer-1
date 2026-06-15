const fs = require('fs');
const c = fs.readFileSync('.open-next/server-functions/default/handler.mjs', 'utf8');

const targets = [
  'require("module")',
  'require("path")',
  'require("fs")',
  'require("child_process")',
  'require("crypto")',
];

for (const t of targets) {
  const idx = c.indexOf(t);
  if (idx >= 0) {
    // Check if it's in a string literal or actual code
    const context = c.substring(Math.max(0, idx - 20), idx + t.length + 20);
    console.log(`FOUND "${t}" at ${idx}: ...${context}...`);
  } else {
    console.log(`NOT found: "${t}"`);
  }
}

// Also search for process.hrtime, process.cwd, etc.
const nodeAPIs = ['process.hrtime', 'process.cwd', 'process.uptime', 'process.memoryUsage', '__dirname', '__filename'];
for (const api of nodeAPIs) {
  const idx = c.indexOf(api);
  if (idx >= 0) console.log(`FOUND: "${api}" at ${idx}`);
}

console.log('\n--- Checking for commonJS require wrappers ---');
const commonJSWrappers = c.match(/function __commonJS/g);
console.log(`__commonJS wrappers: ${commonJSWrappers ? commonJSWrappers.length : 0}`);

// Check for actual require() calls that aren't in __commonJS wrappers
const lines = c.split('\n');
let requireCount = 0;
for (const line of lines) {
  const trimmed = line.trim();
  // Skip comment lines
  if (trimmed.startsWith('//')) continue;
  // Look for require("X") or require('X') patterns
  const matches = trimmed.match(/require\s*\(\s*["'][^"']+["']\s*\)/g);
  if (matches) {
    for (const m of matches) {
      // Skip if inside __commonJS wrapper or runtime helper
      if (trimmed.includes('__commonJS')) continue;
      if (trimmed.includes('originalRequire')) continue;
      requireCount++;
      console.log(`  require() call #${requireCount}: ${m}`);
    }
  }
}
console.log(`\nTotal non-commonJS require() calls: ${requireCount}`);