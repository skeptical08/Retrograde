/* Word times are supplied, never inferred from spelling or line duration. */
const RetrogradeKaraokeData=(()=>{
 const finite=n=>typeof n==='number'&&Number.isFinite(n)&&n>=0&&n<=86400000;
 function normalize(input){
  if(!input||typeof input!=='object'||!Array.isArray(input.lines)||!input.lines.length||input.lines.length>1000)throw Error('No supported timed lines found.');
  let count=0,chars=0;
  const lines=input.lines.map(l=>{if(!finite(l.startMs)||!finite(l.endMs)||l.endMs<=l.startMs||!Array.isArray(l.syllables)||!l.syllables.length)throw Error('Invalid lyric line timing.');let last=-1;
   const syllables=l.syllables.map(s=>{if(typeof s.text!=='string'||!s.text.length||s.text.length>500||!finite(s.startMs)||!finite(s.endMs)||s.endMs<=s.startMs||s.startMs<l.startMs||s.endMs>l.endMs||s.startMs<last)throw Error('Invalid word timing.');last=s.startMs;count++;chars+=s.text.length;return {text:s.text,startMs:s.startMs,endMs:s.endMs,joinNext:s.joinNext===true};});
   return {startMs:l.startMs,endMs:l.endMs,syllables,background:l.background===true,opposite:l.opposite===true,reading:typeof l.reading==='string'?l.reading.slice(0,2000):''};
  }).sort((a,b)=>a.startMs-b.startMs);
  if(count>8000||chars>100000)throw Error('Timing file is too large.');
  return {version:1,lines,source:typeof input.source==='string'?input.source.slice(0,100):'Local timing',credits:Array.isArray(input.credits)?input.credits.slice(0,4).filter(c=>c&&typeof c.name==='string').map(c=>({name:c.name.slice(0,120),url:typeof c.url==='string'&&/^https:\/\/spicylyrics\.org\/uid\/[0-9]+$/.test(c.url)?c.url:''})):[]};
 }
 function spicy(response){const b=response?.Body;if(b?.Type!=='Syllable'||!Array.isArray(b.Content))throw Error('This track has no word-level sync. Native lyrics are still available.');const lines=[];
  for(const g of b.Content){if(g.Type!=='Vocal')continue;for(const [i,v]of [g.Lead,...(Array.isArray(g.Background)?g.Background:[])].entries()){if(!v?.Syllables?.length)continue;const syllables=v.Syllables.map(s=>({text:s.Text,startMs:s.StartTime*1000,endMs:s.EndTime*1000,joinNext:s.IsPartOfWord===true}));lines.push({startMs:v.StartTime*1000,endMs:v.EndTime*1000,syllables,background:i>0,opposite:g.OppositeAligned===true,reading:v.TransliteratedText});}}
  const names={spicy_lyrics:'Spicy Lyrics',apple_music:'Apple Music',spotify:'Spotify'},credits=[];
  if(b.source==='spicy_lyrics'){for(const role of ['Uploader','Maker']){const c=b.UploadAttribution?.[role];if(c?.username)credits.push({name:role.toLowerCase()+': '+c.username,url:c.url});}if(!credits.some(c=>c.name.startsWith('uploader:')))throw Error('Provider attribution is incomplete.');}
  return normalize({lines,source:names[b.source]||'Unknown source',credits});
 }
 function progress(segment,ms){return Math.max(0,Math.min(1,(ms-segment.startMs)/(segment.endMs-segment.startMs)));}
 function active(lines,ms){return lines.map((l,i)=>ms>=l.startMs&&ms<l.endMs?i:-1).filter(i=>i>=0);}
 return {normalize,spicy,progress,active,validKey:key=>typeof key==='string'&&/^sl_pk_[a-zA-Z0-9_-]{8,}$/.test(key)};
})();
const RetrogradeKaraokeCredentials=(()=>{const key='retrograde:karaoke-key:v1';return {read(){try{return localStorage.getItem(key)||'';}catch{return '';}},save(value){if(value&&!RetrogradeKaraokeData.validKey(value))throw Error('Use a publishable sl_pk_ key, never a secret key.');if(value)localStorage.setItem(key,value);else localStorage.removeItem(key);window.dispatchEvent(new Event('retrograde:karaoke-config'));}};})();
