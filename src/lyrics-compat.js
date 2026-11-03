/* Compatibility hooks audited against upstream sources; no extension code is copied.
   Extension-owned DOM, animation, providers and romanization stay extension-owned. */
const RetrogradeLyricsCompatibility=(()=>{
 const views='#SpicyLyricsPage,.BeautifulLyricsPage,#lyrics-plus,#lyrics-cinema';
 const cards='#SpicyLyricsNPVCard,#BeautifulLyrics-CardView';
 const simple='.lyrics-background-container';
 const protectedRoots=views+','+cards+','+simple;
 function owner(doc,path='',surface){
  if(/^\/SpicyLyrics(?:\/|$)/i.test(path)||doc.querySelector('#SpicyLyricsPage'))return 'spicy';
  if(/^\/BeautifulLyrics(?:\/|$)/i.test(path)||doc.querySelector('.BeautifulLyricsPage'))return 'beautiful';
  if(/^\/lyrics-plus(?:\/|$)/i.test(path)||doc.querySelector('#lyrics-cinema:not(:empty)'))return 'lyrics-plus';
  if((surface||doc.querySelector('#main-view'))?.querySelector(simple))return 'simple-beautiful';
  return '';
 }
 function policy(mode,detected,active=true){return {owner:detected||'',external:active&&(mode==='extension'||(mode!=='native'&&!!detected))};}
 function relevant(records){return records.some(r=>[...r.addedNodes,...r.removedNodes].some(n=>n.nodeType===1&&(n.matches(protectedRoots)||n.querySelector(protectedRoots))));}
 return {views,cards,protectedRoots,owner,policy,relevant};
})();
