const fs = require('fs');
const handlerPath = '.open-next/server-functions/default/handler.mjs';
let c = fs.readFileSync(handlerPath, 'utf8');
let changed = false;

// Fix 1: requireChunk - replace throw-based with no-op
const oldRequireChunk = 'function requireChunk(chunkPath){throw new Error(`Not found ${chunkPath}`)}';
const newRequireChunk = 'function requireChunk(chunkPath){return[]}';
if (c.includes(oldRequireChunk)) {
  c = c.split(oldRequireChunk).join(newRequireChunk);
  changed = true;
  console.log('  Replaced requireChunk functions');
} else {
  console.log('  requireChunk already fixed');
}

// Fix 2: loadWasmChunk - replace absolute Windows paths with relative
const wasmRegex = /async function loadWasmChunk\(chunkPath\)\{if\(chunkPath===`[^`]+`\)return\(await import\("[^"]+"\)\)\.default;throw new Error\(`Unknown wasm chunk: \$\{chunkPath\}`\)\}/g;
const wasmMatches = c.match(wasmRegex);
if (wasmMatches && wasmMatches.length > 0) {
  const newWasmLoader = `async function loadWasmChunk(chunkPath){if(chunkPath.includes('query_engine_bg.wasm'))return(await import('./query_engine_bg.wasm')).default;throw new Error('Unknown wasm chunk: '+chunkPath)}`;
  c = c.replace(wasmRegex, newWasmLoader);
  changed = true;
  console.log(`  Replaced ${wasmMatches.length} loadWasmChunk functions`);
} else {
  console.log('  loadWasmChunk already patched');
}

// Fix 3: Remove require("module") entirely since it's not available in Cloudflare Workers
// Pattern 3a: The current state has mod3=require("module") followed by originalRequire=function...
// Replace mod3=require("module") with mod3=void 0
// Check for the original pattern first (if fix not yet applied)
const rawPattern = 'mod3=require("module"),originalRequire=mod3.prototype.require,resolveFilename3=mod3._resolveFilename';
const patchedPattern = 'mod3=require("module"),originalRequire=function(m){return typeof __webpack_require__!=="undefined"?__webpack_require__(m):require(m)},resolveFilename3=function(){return""}';

if (c.includes(rawPattern)) {
  c = c.replace(rawPattern, 'mod3=void 0,originalRequire=function(m){return typeof __webpack_require__!=="undefined"?__webpack_require__(m):require(m)},resolveFilename3=function(){return""}');
  changed = true;
  console.log('  Patched original require("module") pattern');
} else if (c.includes(patchedPattern)) {
  // Already patched, but still has mod3=require("module") - remove the require
  c = c.replace('mod3=require("module"),originalRequire=', 'mod3=void 0,originalRequire=');
  changed = true;
  console.log('  Removed require("module") (was already patched)');
} else {
  // Try more general search
  const idx = c.indexOf('require("module")');
  if (idx >= 0) {
    const context = c.substring(Math.max(0, idx-30), idx+30);
    console.log('  Unhandled require("module") at', idx, ':', context);
  } else {
    console.log('  No require("module") found in file');
  }
}

if (changed) {
  fs.writeFileSync(handlerPath, c, 'utf8');
  console.log('\nHandler file updated');
} else {
  console.log('\nNo changes');
}

// Final verification
const finalC = fs.readFileSync(handlerPath, 'utf8');
console.log('\nFinal verification:');
console.log(`  requireChunk throw: ${finalC.includes('function requireChunk(chunkPath){throw')}`);
console.log(`  requireChunk noop: ${finalC.includes('function requireChunk(chunkPath){return[]}')}`);
console.log(`  require("module") count: ${(finalC.match(/require\("module"\)/g)||[]).length}`);
console.log(`  mod3=void 0: ${finalC.includes('mod3=void 0')}`);