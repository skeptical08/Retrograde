import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
test('leaving a timed line resets singing motion and backward seeking updates the fill',async()=>{
 class Element {
  constructor(){this.dataset={};this.children=[];this.isConnected=true;this.classes=new Set();this.props={};this.style={setProperty:(k,v)=>this.props[k]=v};this.classList={toggle:(k,v)=>v?this.classes.add(k):this.classes.delete(k)};}
  append(...c){this.children.push(...c);} setAttribute(){} addEventListener(){} querySelector(){return null;} scrollIntoView(){} remove(){this.isConnected=false;}
 }
 let progress=1500;const listeners=new Map();const player={data:{item:{uri:'spotify:track:1234567890123456789012'}},getProgress:()=>progress,isPlaying:()=>false,addEventListener:(k,v)=>listeners.set(k,v),removeEventListener:(k,v)=>{if(listeners.get(k)===v)listeners.delete(k);}};
 const context=vm.createContext({window:{addEventListener(){}},document:{hidden:false,createElement:()=>new Element(),createTextNode:text=>({textContent:text}),addEventListener(){}},Spicetify:{Player:player},AbortController,Map,Set,performance:{now:()=>10000},matchMedia:()=>({matches:false}),requestAnimationFrame:()=>1,cancelAnimationFrame(){},RetrogradeKaraokeCredentials:{read:()=>''}});
 vm.runInContext(await fs.readFile(new URL('../src/karaoke-data.js',import.meta.url),'utf8'),context);
 vm.runInContext(await fs.readFile(new URL('../src/karaoke.js',import.meta.url),'utf8'),context);
 const renderer=vm.runInContext('createRetrogradeKaraoke',context)({getSettings:()=>({lyricsProvider:'native',motion:false,lyricsEffect:'wave'}),schedule(){}});
 renderer.importTiming({lines:[{startMs:1000,endMs:2000,syllables:[{text:'Sample',startMs:1000,endMs:2000}]}]});
 const surface=new Element();renderer.update(surface);const word=surface.children[0].children[0].children[0].children[0];
 assert.equal(word.props['--rp-word-fill'],'50%');assert.equal(word.classes.has('rp-word-singing'),true);
 progress=2500;listeners.get('onprogress')();assert.equal(word.classes.has('rp-word-singing'),false);assert.equal(word.props['--rp-word-lift'],'0em');
 progress=1000;listeners.get('onprogress')();assert.equal(word.props['--rp-word-fill'],'0%');renderer.dispose();assert.equal(listeners.size,0);
});
