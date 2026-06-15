const fs = require('fs');
const c = fs.readFileSync('.open-next/server-functions/default/handler.mjs', 'utf8');

// Check for require() calls (non-commonJS wrappers)
const lines = c.split('\n');
let count = 0;
for (const line of lines) {
  const trimmed = line.trim();
  if (trimmed.includes('require(') && 
      !trimmed.includes('__commonJS') && 
      !trimmed.startsWith('//') &&
      !trimmed.includes('require("fs"') &&
      !trimmed.includes("require('fs'")) {
    count++;
    if (count <= 10) {
      console.log(`  [${count}] ${trimmed.substring(0, 200)}`);
    }
  }
}
console.log(`\nTotal require() calls (non-commonJS/wrapper): ${count}`);

// Check for import() calls
console.log('\n- import() calls:');
const importCount = (c.match(/\bimport\(/g) || []).length;
console.log(`  Count: ${importCount}`);

// Check for module.exports
const meCount = (c.match(/module\.exports/g) || []).length;
console.log(`\n- module.exports count: ${meCount}`);

// Check overall content
const handlerImports = (c.match(/^import /gm) || []).length;
console.log(`- Top-level import statements: ${handlerImports}`);

// Check size
console.log(`- Total size: ${(c.length / 1024).toFixed(0)} KB`);