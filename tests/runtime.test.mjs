import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
const context=vm.createContext({});vm.runInContext(fs.readFileSync('src/runtime.js','utf8')+';globalThis.make=createRetrogradeFrameQueue',context);
function setup(run){let id=0;const callbacks=new Map();const q=context.make(run,fn=>{callbacks.set(++id,fn);return id;},n=>callbacks.delete(n));return{q,callbacks,flush(){const batch=[...callbacks.values()];callbacks.clear();batch.forEach(fn=>fn());}};}
test('merges surface flags into exactly one frame',()=>{const seen=[],s=setup(x=>seen.push(x));s.q.add(1);s.q.add(8);s.q.add(1);assert.equal(s.callbacks.size,1);s.flush();assert.deepEqual(seen,[9]);});
test('idle does not schedule frames or timers',()=>{const s=setup(()=>assert.fail());assert.equal(s.callbacks.size,0);s.q.add(0);assert.equal(s.callbacks.size,0);});
test('work requested during a flush runs once on the next frame',()=>{const seen=[];let s;s=setup(x=>{seen.push(x);if(x===1)s.q.add(16);});s.q.add(1);s.flush();assert.deepEqual(seen,[1]);assert.equal(s.callbacks.size,1);s.flush();assert.deepEqual(seen,[1,16]);});
test('dispose cancels pending work and ignores later requests',()=>{const seen=[],s=setup(x=>seen.push(x));s.q.add(63);s.q.dispose();s.q.add(1);assert.equal(s.callbacks.size,0);s.flush();assert.deepEqual(seen,[]);});
