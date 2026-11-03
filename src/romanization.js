/* Local phonetic readings. Dictionaries may download; lyric text never leaves
   the client. Conversion promises and dictionary initialization are shared. */
const RetrogradeRomanization = (()=>{
 let japanese;
 function language(text,hint=''){
  if(/[\u3040-\u30ff\uff66-\uff9f]/u.test(text))return 'ja';
  if(/[\uac00-\ud7af\u1100-\u11ff]/u.test(text))return 'ko';
  if(/\p{Script=Han}/u.test(text))return hint==='ja'?'ja':'zh';
  return '';
 }
 function bounded(promise,ms=45000){let timer;return Promise.race([promise,new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('Romanization dictionary timed out')),ms);})]).finally(()=>clearTimeout(timer));}
 async function convert(text,hint=''){
  const lang=language(text,hint);if(!lang)return text;
  if(lang==='ko')return RetrogradeRomanizationEngines.get('korean').hangulToLatin(text,'rr-translit');
  if(lang==='zh')return RetrogradeRomanizationEngines.get('pinyin').pinyin(text,{toneType:'symbol',nonZh:'consecutive'});
  if(!japanese){const K=RetrogradeRomanizationEngines.get('kuroshiro'),Analyzer=RetrogradeRomanizationEngines.get('analyzer');const engine=new (K.default||K)();japanese=bounded(engine.init(new (Analyzer.default||Analyzer)({dictPath:'https://cdn.jsdelivr.net/npm/kuromoji@0.1.2/dict/'}))).then(()=>engine).catch(e=>{japanese=null;throw e;});}
  return (await japanese).convert(text,{to:'romaji',mode:'spaced',romajiSystem:'hepburn'});
 }
 return {language,convert};
})();
/* Observe only native lyric text mutations. Active-line class changes never
   trigger conversion; owned readings are ignored to prevent observer loops. */
function createRetrogradeRomanizedLines({getSettings,onToggle}){
 let surface,viewport,observer,mountObserver,button,status,scheduled=0,idle=0,busy=false,disposed=false,generation=0;
 let pending=[],seen=new WeakMap(),cache=new Map(),songKey='';
 const source=line=>[...line.childNodes].filter(n=>!(n.nodeType===1&&n.classList.contains('rp-romanized-line'))).map(n=>n.textContent||'').join('').trim();
 const tell=text=>{if(status&&status.textContent!==text)status.textContent=text;};
 const cleanup=()=>{mountObserver?.disconnect();mountObserver=null;observer?.disconnect();observer=null;if(scheduled)cancelAnimationFrame(scheduled);scheduled=0;if(idle){if(window.cancelIdleCallback)cancelIdleCallback(idle);else clearTimeout(idle);}idle=0;pending=[];generation++;surface?.querySelectorAll('.rp-romanized-line').forEach(e=>e.remove());button?.remove();status?.remove();button=status=null;surface=viewport=null;seen=new WeakMap();cache.clear();};
 function schedule(){if(!scheduled&&!disposed)scheduled=requestAnimationFrame(()=>{scheduled=0;scan();});}
 function enqueue(){if(idle||busy||!pending.length||disposed)return;const run=async()=>{idle=0;busy=true;try{await Promise.all(pending.splice(0,2).map(task=>task()));}finally{busy=false;enqueue();}};idle=window.requestIdleCallback?requestIdleCallback(run,{timeout:500}):setTimeout(run,16);}
 function scan(){
  if(!surface||disposed)return;
  const enabled=getSettings().lyricsRomanization!==false;button?.setAttribute('aria-pressed',String(enabled));
  if(!enabled){generation++;pending=[];cache.clear();seen=new WeakMap();surface.querySelectorAll('.rp-romanized-line').forEach(e=>e.remove());tell('');return;}
  const lines=[...surface.querySelectorAll('.J4_kkGYm5hjbZlztykxr')];const hint=getSettings().lyricsReadingLanguage!=='auto'?getSettings().lyricsReadingLanguage:RetrogradeRomanization.language(lines.map(source).join(' '));
  const token=generation;
  for(const line of lines){
   const original=source(line),lang=RetrogradeRomanization.language(original,hint),previous=seen.get(line);
   if(!lang){line.querySelector(':scope > .rp-romanized-line')?.remove();continue;}
   if(previous?.text===original&&previous.lang===lang&&(previous.pending||previous.span?.parentElement===line))continue;
   const state={text:original,lang,pending:true,span:null};seen.set(line,state);
   pending.push(async()=>{
    if(token!==generation||!line.isConnected)return;
    try{
     tell('Preparing phonetic readings…');const key=lang+'|'+original;
     if(!cache.has(key)){if(cache.size>=800)cache.delete(cache.keys().next().value);cache.set(key,RetrogradeRomanization.convert(original,lang));}
     const reading=await cache.get(key);
     if(token!==generation||disposed||!line.isConnected||source(line)!==original)return;
     if(reading&&reading!==original){line.querySelector(':scope > .rp-romanized-line')?.remove();const span=document.createElement('span');span.className='rp-romanized-line';span.lang=lang+'-Latn';span.textContent=reading;line.append(span);state.span=span;}
     state.pending=false;tell('');
    }catch{state.pending=false;if(token===generation&&!disposed)tell('Readings unavailable — original lyrics remain visible.');}
   });
  }
  enqueue();
 }
 function update(next){
  if(disposed)return;if(next!==surface||(next&&(!button?.isConnected||!viewport?.isConnected))){cleanup();surface=next;if(!surface)return;viewport=surface.querySelector('[data-rp-karaoke-viewport]')||surface.querySelector('[data-overlayscrollbars]');const header=surface.querySelector('[data-rp-media-header]');
   button=document.createElement('button');button.type='button';button.className='rp-romanization-toggle';button.textContent='Aa';button.setAttribute('aria-label','Romanize lyrics');button.title='Romanization: Japanese, Korean and Mandarin';button.addEventListener('click',()=>{onToggle(getSettings().lyricsRomanization===false);scan();});
   status=document.createElement('span');status.className='rp-romanization-status';status.setAttribute('role','status');status.setAttribute('aria-live','polite');header?.append(status,button);
   observer=new MutationObserver(records=>{if(records.some(r=>{const e=r.target.nodeType===1?r.target:r.target.parentElement;if(e?.closest('.rp-romanized-line'))return false;if(r.type==='characterData')return true;return ![...r.addedNodes,...r.removedNodes].every(n=>n.nodeType===1&&n.classList.contains('rp-romanized-line'));}))schedule();});
   if(viewport)observer.observe(viewport,{childList:true,subtree:true,characterData:true});
   mountObserver=new MutationObserver(()=>update(surface));mountObserver.observe(surface,{childList:true});
  }
  const key=Spicetify.Player.data?.item?.uri||'';if(key!==songKey){songKey=key;generation++;pending=[];cache.clear();seen=new WeakMap();}
  scan();
 }
 return{update,dispose(){disposed=true;cleanup();}};
}
