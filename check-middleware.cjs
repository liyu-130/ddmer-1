const fs = require('fs');
const m = fs.readFileSync('.open-next/middleware/handler.mjs', 'utf8');
console.log('Size:', m.length);
console.log('Has require("module"):', m.indexOf('require("module")') >= 0);
console.log('Has requireChunk throw:', m.includes('function requireChunk(chunkPath){throw'));
console.log('Has loadWasmChunk:', m.includes('async function loadWasmChunk'));
console.log('Has worker_threads:', m.includes('require("worker_threads")') || m.includes('require("node:worker_threads")'));
console.log('Has vm:', m.includes('require("vm")') || m.includes('require("node:vm")'));
console.log('Has inspector:', m.includes('require("inspector")') || m.includes('require("node:inspector")'));