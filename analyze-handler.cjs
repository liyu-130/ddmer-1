const fs = require('fs');
const c = fs.readFileSync('.open-next/server-functions/default/handler.mjs', 'utf8');

// Fix 1: Replace all requireChunk functions that throw "Not found"
const oldRequireChunk = 'function requireChunk(chunkPath){throw new Error(`Not found ${chunkPath}`)}';
const newRequireChunk = 'function requireChunk(chunkPath){return[]}';
const rcCount = (c.match(new RegExp(oldRequireChunk.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
console.log(`Found ${rcCount} throw-based requireChunk functions`);

// Fix 2: Fix loadWasmChunk - replace the WASM chunk loaders that use absolute paths
const wasmRegex = /async function loadWasmChunk\(chunkPath\)\{if\(chunkPath===`[^`]+`\)return\(await import\("[^"]+"\)\)\.default;throw new Error\(`Unknown wasm chunk: \$\{chunkPath\}`\)\}/g;
const wasmMatches = c.match(wasmRegex);
if (wasmMatches) {
  console.log(`Found ${wasmMatches.length} loadWasmChunk function(s)`);
}

// Fix 3: Patch require("module") - this is NOT available in Cloudflare Workers
// The original code is: mod3=require("module"),originalRequire=mod3.prototype.require,resolveFilename3=mod3._resolveFilename
// We need to provide a dummy module polyfill
const modulePatches = [
  // Pattern 1: require("module") with .prototype.require and ._resolveFilename
  {
    search: 'require("module"),originalRequire=mod3.prototype.require,resolveFilename3=mod3._resolveFilename',
    replace: 'require("module"),originalRequire=function(m){return import(m)},resolveFilename3=function(){return""}'
  }
];

for (const patch of modulePatches) {
  if (c.includes(patch.search)) {
    console.log(`Found patchable pattern: ${patch.search.substring(0, 60)}...`);
  }
}

// Fix 4: Check for other problematic patterns
const problematicPaths = [
  'process.cwd',
  '__dirname',
  '__filename'
];
for (const p of problematicPaths) {
  const idx = c.indexOf(p);
  if (idx >= 0) {
    const ctx = c.substring(Math.max(0, idx-30), idx+50);
    console.log(`Found "${p}": ...${ctx}...`);
  }
}

console.log('\nAll checks done.');