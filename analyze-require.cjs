const fs = require('fs');
const c = fs.readFileSync('.open-next/server-functions/default/handler.mjs', 'utf8');
console.log('File size:', (c.length / 1024).toFixed(1), 'KB');
console.log('require("fs"):', c.includes('require("fs")'));
console.log('require("path"):', c.includes('require("path")'));
console.log('__require call:', c.includes('__require('));
console.log('var requireChunk:', c.includes('function requireChunk'));

// Check total require calls
const requireCalls = [...c.matchAll(/require\("[^"]+"\)/g)].map(m => m[0]);
console.log('\nAll require("x") calls:', requireCalls.length);
const uniqueRequires = [...new Set(requireCalls)];
console.log('Unique require targets:', uniqueRequires);

// Check for non-node: specifiers that are not available in CF Workers
const nodeBuiltins = ['fs', 'path', 'module', 'child_process', 'net', 'tls', 'dns', 'http2', 'os'];
for (const b of nodeBuiltins) {
  if (c.includes(`require("${b}")`)) {
    const idx = c.indexOf(`require("${b}")`);
    const ctx = c.substring(Math.max(0, idx-40), idx+40);
    console.log(`\n  require("${b}"): ...${ctx}...`);
  }
}

// Count "node:" prefix references
const nodePrefix = [...c.matchAll(/\b(node:|node:)[a-z/]+/g)].map(m => m[0]);
const uniqueNodePrefix = [...new Set(nodePrefix)];
console.log('\nUnique node: imports:', uniqueNodePrefix);