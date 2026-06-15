const fs = require('fs');
const c = fs.readFileSync('.open-next/server-functions/default/handler.mjs', 'utf8');

// Find the require("module") context
const idx = c.indexOf('require("module")');
if (idx >= 0) {
  // Get 500 chars of context
  const start = Math.max(0, idx - 200);
  const end = Math.min(c.length, idx + 300);
  console.log('=== Context around require("module") ===');
  console.log(c.substring(start, end));
}

// Check if the code is in a __commonJS style wrapper or top-level
const beforeModule = c.substring(Math.max(0, idx - 500), idx);
const isInFunction = beforeModule.lastIndexOf('function ') > beforeModule.lastIndexOf('}\n');
console.log('\n=== require("module") context analysis ===');
console.log('Is inside a function:', !isInFunction);
console.log('Surrounded by __commonJS:', beforeModule.includes('__commonJS'));

// Check if require("module") is in an IIFE or at top level
const idx2 = c.indexOf('require("module")', idx + 1);
console.log('Second occurrence:', idx2 >= 0 ? 'YES' : 'NO');
if (idx2 >= 0) {
  console.log('  at position:', idx2);
}