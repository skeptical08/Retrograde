import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
const source=await fs.readFile(new URL('../src/preferences.js',import.meta.url),'utf8');
const P=vm.runInNewContext(source+'\nRetrogradePreferences');
const plain=x=>JSON.parse(JSON.stringify(x));
test('corrupt and unknown-version preferences recover defaults',()=>{
 for(const bad of [null,[],{},'oops',{version:2,accent:'#ffffff'}]) assert.deepEqual(plain(P.sanitize(bad)),plain(P.defaults));
});
test('invalid values cannot become CSS and font sizes are bounded',()=>{
 const s=P.sanitize({...P.defaults,accent:'url(https://bad)',main:'#xyzxyz',fontSize:100,density:'broken',motion:'no'});
 assert.equal(s.accent,P.defaults.accent);assert.equal(s.main,P.defaults.main);assert.equal(s.fontSize,16);assert.equal(s.density,'compact');assert.equal(s.motion,true);
 assert.equal(P.sanitize({...P.defaults,fontSize:-20}).fontSize,11);
});
test('all presets survive serialization with validated values',()=>{
 for(const value of Object.values(P.presets)) assert.deepEqual(plain(P.sanitize(JSON.parse(JSON.stringify(value)))),plain(value));
});
test('contrast math matches reference ratios',()=>{
 assert.equal(P.contrast('#000000','#ffffff'),21);assert.equal(P.contrast('#424242','#424242'),1);
 assert.ok(P.contrast(P.defaults.text,P.defaults.main)>10);
});

test('layout preferences migrate safely and clamp invalid widths',()=>{
 const old={...P.defaults};delete old.trackArtwork;delete old.leftWidth;delete old.rightWidth;
 const migrated=P.sanitize(old);assert.equal(migrated.trackArtwork,false);assert.equal(migrated.leftWidth,P.defaults.leftWidth);
 const s=P.sanitize({...P.defaults,trackArtwork:'true',leftWidth:-1,rightWidth:9999});assert.equal(s.trackArtwork,false);assert.equal(s.leftWidth,200);assert.equal(s.rightWidth,640);
 assert.equal(P.sanitize({...P.defaults,leftWidth:NaN,rightWidth:Infinity}).rightWidth,P.defaults.rightWidth);
});
test('sidebars leave room for content at practical window sizes',()=>{
 for(const viewport of [900,1024,1298,1600,1920])for(const left of [200,420,640])for(const right of [240,420,640]){
 const fit=P.fitWidths(viewport,left,right);assert.ok(fit.left>=200&&fit.left<=640);assert.ok(fit.right>=240&&fit.right<=640);assert.ok(fit.left+fit.right<=viewport-319);
 }
 assert.deepEqual(plain(P.fitWidths(1920,420,420)),{left:420,right:420});
});


test('presets preserve non-color preferences across all finite layout combinations',()=>{
 let checked=0;
 for(const preset of Object.values(P.presets))for(const density of ['compact','comfortable'])for(const relief of ['subtle','strong'])for(const trackArtwork of [false,true])for(const motion of [false,true])for(const libraryStyle of ['classic','artwork'])for(const windowControls of [false,true])for(const fontSize of [11,13,16])for(const lyricsSize of [16,20,28])for(const [leftWidth,rightWidth]of [[200,240],[300,360],[640,640]]){
  const s={...P.defaults,density,relief,trackArtwork,motion,libraryStyle,windowControls,fontSize,lyricsSize,leftWidth,rightWidth};
  const result=P.applyPreset(s,preset);
  for(const k of Object.keys(s).filter(k=>!P.colorKeys.includes(k)))assert.equal(result[k],s[k],k);
  for(const k of P.colorKeys)assert.equal(result[k],preset[k],k);
  assert.deepEqual(plain(P.sanitize(JSON.parse(JSON.stringify(result)))),plain(result));checked++;
 }
 assert.equal(checked,Object.keys(P.presets).length*1728);
});
test('new controls recover invalid values and bound lyric typography',()=>{
 const s=P.sanitize({...P.defaults,libraryStyle:'broken',windowControls:'yes',lyricsSize:100});assert.equal(s.libraryStyle,'classic');assert.equal(s.windowControls,true);assert.equal(s.lyricsSize,28);
 assert.equal(P.sanitize({...P.defaults,lyricsSize:0}).lyricsSize,16);
});
test('lyrics side validates, survives storage and is independent of presets',()=>{
 assert.equal(P.sanitize({...P.defaults,lyricsInfoSide:'invalid'}).lyricsInfoSide,'left');
 const right=P.sanitize(JSON.parse(JSON.stringify({...P.defaults,lyricsInfoSide:'right'})));
 assert.equal(right.lyricsInfoSide,'right');
 for(const preset of Object.values(P.presets))assert.equal(P.applyPreset(right,preset).lyricsInfoSide,'right');
});

test('player artwork preference migrates, persists and survives palette changes',()=>{
 const old={version:1};assert.equal(P.sanitize(old).playerArtworkDock,true);
 const compact=P.sanitize({...P.defaults,playerArtworkDock:false});
 assert.equal(P.sanitize(JSON.parse(JSON.stringify(compact))).playerArtworkDock,false);
 assert.equal(P.sanitize({...P.defaults,playerArtworkDock:'false'}).playerArtworkDock,true);
 for(const preset of Object.values(P.presets))assert.equal(P.applyPreset(compact,preset).playerArtworkDock,false);
});

test('readability and backdrop preferences migrate, validate and survive every preset',()=>{
 const old=P.sanitize({version:1});assert.equal(old.playerHeight,56);assert.equal(old.playerTextSize,14);assert.equal(old.libraryIcons,true);assert.equal(old.lyricsBackground,true);
 const settings=P.sanitize({...P.defaults,playerHeight:1000,playerTextSize:0,lyricsBlur:Infinity,lyricsFade:-10,libraryIcons:false,lyricsBackground:false});
 assert.equal(settings.playerHeight,72);assert.equal(settings.playerTextSize,12);assert.equal(settings.lyricsBlur,48);assert.equal(settings.lyricsFade,0);
 for(const preset of Object.values(P.presets)){
  const roundtrip=P.sanitize(JSON.parse(JSON.stringify(P.applyPreset(settings,preset))));
  for(const k of ['playerHeight','playerTextSize','lyricsBlur','lyricsFade','libraryIcons','lyricsBackground'])assert.equal(roundtrip[k],settings[k]);
  for(const k of P.colorKeys)assert.match(roundtrip[k],/^#[0-9a-f]{6}$/);
 }
});
test('romanization preference migrates and retains off across all palettes',()=>{
 assert.equal(P.sanitize({version:1}).lyricsRomanization,true);assert.equal(P.sanitize({...P.defaults,lyricsRomanization:'false'}).lyricsRomanization,true);
 const off=P.sanitize(JSON.parse(JSON.stringify({...P.defaults,lyricsRomanization:false})));for(const preset of Object.values(P.presets))assert.equal(P.applyPreset(off,preset).lyricsRomanization,false);
});

test('library covers migrate independently of the legacy symbol preference',()=>{
 assert.equal(P.sanitize({version:1,libraryIcons:false}).libraryArtwork,false);
 for(const enabled of [true,false]){const s=P.sanitize({...P.defaults,libraryArtwork:enabled});for(const preset of Object.values(P.presets))assert.equal(P.applyPreset(s,preset).libraryArtwork,enabled);assert.equal(P.sanitize(JSON.parse(JSON.stringify(s))).libraryArtwork,enabled);}
});

test('lyrics compatibility mode migrates and survives palette changes',()=>{assert.equal(P.sanitize({version:1}).lyricsIntegration,'auto');assert.equal(P.sanitize({...P.defaults,lyricsIntegration:'bad'}).lyricsIntegration,'auto');for(const mode of ['auto','native','extension'])for(const p of Object.values(P.presets))assert.equal(P.applyPreset({...P.defaults,lyricsIntegration:mode},p).lyricsIntegration,mode);});

test('listening color and independent artwork preferences migrate and persist',()=>{const old=P.sanitize({version:1,lyricsBackground:false});assert.equal(old.lyricsActiveColor,'#ffffff');assert.equal(old.lyricsBackground,false);assert.equal(old.artworkBackground,true);for(const p of Object.values(P.presets)){const s=P.applyPreset({...P.defaults,lyricsActiveColor:'#aabbcc',lyricsBackground:false,artworkBackground:true,lyricsCoverArtwork:false,artworkCoverArtwork:true},p);assert.equal(s.lyricsActiveColor,'#aabbcc');assert.equal(s.lyricsBackground,false);assert.equal(s.artworkBackground,true);assert.equal(s.lyricsCoverArtwork,false);assert.equal(s.artworkCoverArtwork,true);}assert.equal(P.sanitize({...P.defaults,lyricsActiveColor:'url(bad)'}).lyricsActiveColor,'#ffffff');});

test('lyric effects validate without changing the selected motion preference',()=>{assert.equal(P.sanitize({version:1}).lyricsEffect,'glow');assert.equal(P.sanitize({...P.defaults,lyricsEffect:'bad'}).lyricsEffect,'glow');for(const effect of ['none','glow','pulse','wave']){const s=P.sanitize({...P.defaults,lyricsEffect:effect,motion:false});assert.equal(s.lyricsEffect,effect);assert.equal(s.motion,false);}});

test('optional timing provider is opt-in and independent of palettes',()=>{assert.equal(P.sanitize({version:1}).lyricsProvider,'native');assert.equal(P.sanitize({...P.defaults,lyricsProvider:'bad'}).lyricsProvider,'native');for(const p of Object.values(P.presets))assert.equal(P.applyPreset({...P.defaults,lyricsProvider:'spicy'},p).lyricsProvider,'spicy');});
test('lyric focus and alignment migrate safely and survive all presets',()=>{assert.equal(P.sanitize({version:1}).lyricsFocus,true);assert.equal(P.sanitize({...P.defaults,lyricsAlignment:'invalid'}).lyricsAlignment,'center');for(const preset of Object.values(P.presets)){const s=P.applyPreset({...P.defaults,lyricsFocus:false,lyricsAlignment:'left'},preset);assert.equal(s.lyricsFocus,false);assert.equal(s.lyricsAlignment,'left');}});
