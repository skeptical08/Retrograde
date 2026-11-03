import {test} from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';import fs from 'node:fs/promises';import {romanizationEngines} from '../scripts/romanization-engines.mjs';
const context=vm.createContext({setTimeout,clearTimeout,console});const bundle=await romanizationEngines();const source=await fs.readFile(new URL('../src/romanization.js',import.meta.url),'utf8');const R=vm.runInContext(bundle+'\n'+source+'\nRetrogradeRomanization',context);
test('bundled phonetic engines convert Korean and Mandarin without sending text',async()=>{
 assert.equal(await R.convert('안녕하세요'),'annyeonghaseyo');assert.equal(await R.convert('你好世界'),'nǐ hǎo shì jiè');
 assert.equal(await R.convert('Hello world'),'Hello world');assert.match(await R.convert('你好 Spotify'),/Spotify/);
});
test('Japanese hints handle kanji-only lines and mixed scripts',()=>{
 assert.equal(R.language('カタカナ 日本語'),'ja');assert.equal(R.language('日本語','ja'),'ja');assert.equal(R.language('你好'),'zh');assert.equal(R.language('안녕 world'),'ko');
 const K=vm.runInContext("RetrogradeRomanizationEngines.get('kuroshiro')",context);assert.equal((K.default||K).Util.kanaToRomaji('カタカナ'),'katakana');
});
test('engines remain cached and do not patch global strings or XHR',async()=>{
 await R.convert('안녕');assert.equal(vm.runInContext('String.prototype.romanize',context),undefined);
 assert.equal(vm.runInContext("RetrogradeRomanizationEngines.get('korean')===RetrogradeRomanizationEngines.get('korean')",context),true);
 assert.equal(vm.runInContext('typeof XMLHttpRequest',context),'undefined');
});
