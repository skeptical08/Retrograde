/* Retrograde settings runtime. Layout/NPV compatibility lives in features.js. */
(() => {
  'use strict';
  const loadedScript=document.currentScript;let marketplaceLifecycle;
  window.Reprise?.dispose?.(); window.Retrograde?.dispose?.();
  const P=RetrogradePreferences, KEY='retrograde:preferences:v1', root=document.documentElement;
  let settings={...P.defaults}, timer, menu, topbar, dialog, previousFocus, disposed=false, features, lastBehavior, lastWidths, lastDensity;
  try {settings=P.sanitize(JSON.parse(localStorage.getItem(KEY)||localStorage.getItem('reprise:preferences:v1')));} catch { /* corrupt storage falls back safely */ }
  const data=(key,value)=>{value=String(value);if(root.dataset[key]!==value)root.dataset[key]=value;};
  const priorTokens=new Map(),ownedTokens=new Map();
  const token=(key,value)=>{if(!priorTokens.has(key))priorTokens.set(key,[root.style.getPropertyValue(key),root.style.getPropertyPriority(key)]);if(root.style.getPropertyValue(key)!==value)root.style.setProperty(key,value);ownedTokens.set(key,value);};
  const behavior=()=>JSON.stringify([settings.libraryStyle,settings.density,settings.trackArtwork,settings.fontSize,settings.windowControls,settings.lyricsInfoSide,settings.lyricsFocus,settings.lyricsAlignment,settings.playerArtworkDock,settings.libraryIcons,settings.libraryArtwork,settings.playerHeight,settings.playerTextSize,settings.lyricsBackground,settings.lyricsBlur,settings.lyricsFade,settings.lyricsRomanization,settings.lyricsReadingLanguage,settings.lyricsProvider,settings.lyricsEffect,settings.lyricsIntegration,settings.artworkBackground,settings.lyricsCoverArtwork,settings.artworkCoverArtwork]);
  function apply(){
    data('retrograde','true'); data('retrogradeDensity',settings.density);
    data('retrogradeRelief',settings.relief); data('retrogradeMotion',settings.motion);
    data('retrogradeTrackArtwork',settings.trackArtwork);data('retrogradeLibrary',settings.libraryStyle);token('--rp-lyrics-size',settings.lyricsSize+'px');
    for(const k of P.colorKeys) token('--rp-'+k,settings[k]);
    token('--rp-lyrics-active',settings.lyricsActiveColor);data('retrogradeArtworkBackground',settings.artworkBackground);data('retrogradeLyricsCoverArtwork',settings.lyricsCoverArtwork);data('retrogradeArtworkCoverArtwork',settings.artworkCoverArtwork);
    data('retrogradeLibraryIcons',settings.libraryIcons);data('retrogradeLibraryArtwork',settings.libraryArtwork);data('retrogradeLyricsBackground',settings.lyricsBackground);
    for(const [key,value]of Object.entries({'--rp-font-size':settings.fontSize+'px','--rp-player-strip':settings.playerHeight+'px','--rp-player-text-size':settings.playerTextSize+'px','--rp-lyrics-blur':settings.lyricsBlur+'px','--rp-lyrics-opacity':String(settings.lyricsFade/100)}))token(key,value);
    // Marketplace and native surfaces use both hex and RGB Spicetify tokens.
    // Refresh the complete family together on every palette edit.
    const spice={main:'main',sidebar:'sidebar',player:'player',text:'text',subtext:'secondary',button:'accent','button-active':'accent','button-disabled':'hover',card:'menu',shadow:'main','selected-row':'selection',misc:'secondary','tab-active':'selection',notification:'accent','notification-error':'accent'};
    for(const [key,color]of Object.entries(spice)){const value=settings[color];token('--spice-'+key,value);token('--spice-rgb-'+key,value.slice(1).match(/../g).map(x=>parseInt(x,16)).join(','));}
    token('--rp-accent-ink',P.contrast(settings.accent,'#171717')>=P.contrast(settings.accent,'#ffffff')?'#171717':'#ffffff');
  }
  function applyDensity(){
    // Verified on Spotify 1.3.6 / Spicetify 2.46.4. This local preference emits
    // Spotify's UPDATE event, so React and its virtualizer share the same height.
    const api=window.Spicetify?.Platform?.LocalStorageAPI;
    if(typeof api?.setItem!=='function' || typeof api?.getItem!=='function')return;
    try {const desired=settings.density==='compact'&&!settings.trackArtwork?'compact':'list';if(lastDensity===desired)return;if(api.getItem('view-mode')!==desired)api.setItem('view-mode',desired);lastDensity=desired;}catch(e){console.warn('[Retrograde] Native density unavailable',e);}
  }
  function save(){apply();applyDensity();const next=behavior(),widths=settings.leftWidth+'|'+settings.rightWidth;if(next!==lastBehavior){lastBehavior=next;features?.update();}else if(widths!==lastWidths)features?.resize();lastWidths=widths;try{localStorage.setItem(KEY,JSON.stringify(settings));return true;}catch{return false;}}
  function element(tag,attrs={},text){const e=document.createElement(tag);for(const[k,v]of Object.entries(attrs)){if(k==='class')e.className=v;else e.setAttribute(k,v);}if(text!==undefined)e.textContent=text;return e;}
  function close(){if(!dialog)return;const old=dialog;dialog=null;old.close();old.remove();previousFocus?.focus?.();}
  function open(scope='theme'){
    const lyricsOnly=scope==='lyrics';
    if(dialog?.isConnected){if(dialog.dataset.scope===(lyricsOnly?'lyrics':'theme')){dialog.focus();return;}close();}
    previousFocus=document.activeElement;
    dialog=element('dialog',{class:'rp-settings','aria-labelledby':'rp-settings-title'});
    dialog.dataset.scope=lyricsOnly?'lyrics':'theme';
    const heading=element('header',{class:'rp-settings-header'});
    const titleBox=element('div',{class:'rp-preferences-brand'});const logo=element('img',{class:'rp-classic-logo',src:RetrogradeLogo,alt:'Classic Spotify logo',width:'52',height:'52'});titleBox.append(logo,element('h2',{id:'rp-settings-title'},lyricsOnly?'Lyrics preferences':'Preferences'));
    const x=element('button',{type:'button',class:'rp-close','aria-label':'Close theme settings'});x.innerHTML='<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false"><path d="m3 3 10 10M13 3 3 13" fill="none" stroke="currentColor" stroke-width="2"/></svg>';x.onclick=close;
    heading.append(titleBox,x);
    const body=element('div',{class:'rp-settings-body'});
    const presets=element('div',{class:'rp-presets','aria-label':'Color presets'});
    const refs=new Map();
    const status=element('p',{class:'rp-status',role:'status','aria-live':'polite'});
    function report(){
      const pairs=lyricsOnly?[['lyricsActiveColor','main']]:[['text','main'],['text','sidebar'],['text','menu'],['text','player'],['secondary','main'],['text','selection'],['text','hover']];
      const low=pairs.filter(([a,b])=>P.contrast(settings[a],settings[b])<4.5);
      status.textContent=low.length?'Low contrast: '+low.map(([a,b])=>`${a} on ${b}`).join(', ')+'. Consider adjusting these colors.':'All checked text and surface pairs meet 4.5:1 contrast.';
      status.dataset.warning=String(low.length>0);
      for(const b of presets.querySelectorAll('button[data-preset]'))b.setAttribute('aria-pressed',String(P.colorKeys.every(k=>settings[k]===P.presets[b.dataset.preset][k])));
    }
    function changed(){const ok=save();report();if(!ok){status.textContent='Preview applied, but local storage is unavailable. Changes may not survive a restart.';status.dataset.warning='true';}}
    function sync(){for(const[k,v]of refs){if(v.color)v.color.value=settings[k];if(v.hex){v.hex.value=settings[k];v.hex.setAttribute('aria-invalid','false');v.hex.setCustomValidity('');}if(v.control){if(v.control.type==='checkbox')v.control.checked=settings[k];else v.control.value=String(settings[k]);}}report();}
    for(const[name,preset]of Object.entries(P.presets)){
      const b=element('button',{type:'button',class:'rp-preset'},name);
      const swatch=element('span',{'aria-hidden':'true'});swatch.style.background=preset.accent;b.prepend(swatch);
      b.dataset.preset=name;b.onclick=()=>{settings=P.applyPreset(settings,preset);changed();sync();};presets.append(b);
    }
    if(!lyricsOnly)body.append(element('h3',{},'Color scheme'),presets);
    const grid=element('div',{class:'rp-settings-grid'});
    function group(title,description){const field=element('fieldset',{class:'rp-preference-group'});field.append(element('legend',{},title),element('p',{class:'rp-group-description'},description));field.hidden=lyricsOnly&&!['Lyrics & artwork','Word timing · optional'].includes(title);grid.append(field);return field;}
    function option(field,k,label,description,control){const row=element('div',{class:'rp-option'}),copy=element('div',{class:'rp-option-copy'});copy.append(element('label',{for:'rp-'+k},label));if(description){const help=element('p',{id:'rp-'+k+'-help',class:'rp-option-help'},description);copy.append(help);control.setAttribute('aria-describedby',help.id);}row.append(copy,control);field.append(row);refs.set(k,{control});return control;}
    function select(field,k,label,description,options){const s=element('select',{id:'rp-'+k});for(const[value,text]of options)s.append(element('option',{value},text));s.onchange=()=>{settings[k]=s.value;changed();};return option(field,k,label,description,s);}
    function toggle(field,k,label,description){const input=element('input',{id:'rp-'+k,type:'checkbox'});input.onchange=()=>{settings[k]=input.checked;changed();};return option(field,k,label,description,input);}
    function number(field,k,label,description,min,max,step=1){const input=element('input',{id:'rp-'+k,type:'number',min:String(min),max:String(max),step:String(step)});input.onchange=()=>{settings[k]=P.sanitize({...settings,[k]:Number(input.value)})[k];input.value=settings[k];changed();};return option(field,k,label,description,input);}
    const colors=group('Colors & surfaces','Choose a preset above, then fine-tune individual colors. All changes save on this computer.');
    const labels={accent:'Accent & active controls',sidebar:'Library & right sidebar',menu:'Menus, cards & dialogs',main:'Main page background',player:'Playback strip & song details',text:'Primary text',secondary:'Secondary text',selection:'Selected rows',hover:'Hover feedback',chrome:'Toolbar & bevel tint'};
    for(const k of P.colorKeys){
      const row=element('div',{class:'rp-color-row'}),label=element('label',{for:'rp-'+k},labels[k]);
      const color=element('input',{id:'rp-'+k,type:'color','aria-label':labels[k]+' color'});
      const hex=element('input',{id:'rp-'+k+'-hex',type:'text',maxlength:'7',pattern:'#[0-9a-fA-F]{6}','aria-label':labels[k]+' hex color',spellcheck:'false'});
      color.oninput=()=>{settings[k]=color.value;hex.value=color.value;hex.setAttribute('aria-invalid','false');hex.setCustomValidity('');changed();};
      hex.oninput=()=>{const valid=/^#[0-9a-f]{6}$/i.test(hex.value);hex.setAttribute('aria-invalid',String(!valid));hex.setCustomValidity(valid?'':'Use a six-digit hex color, such as #a4cc35.');if(valid){settings[k]=hex.value.toLowerCase();color.value=settings[k];changed();}};
      hex.onblur=()=>{if(hex.getAttribute('aria-invalid')==='true'){hex.value=settings[k];hex.setAttribute('aria-invalid','false');hex.setCustomValidity('');}};
      row.append(label,color,hex);colors.append(row);refs.set(k,{color,hex});
    }
    select(colors,'relief','Surface relief','Controls the strength of tinted gradients and inset borders.',[['subtle','Subtle'],['strong','Pronounced']]);
    const library=group('Library & track lists','Library appearance is separate from song-row artwork. Native scrolling and context menus are preserved.');
    select(library,'libraryStyle','Library row layout','Choose a compact text list or Spotify’s artwork rows.',[['classic','Text list'],['artwork','Artwork rows']]);
    toggle(library,'libraryArtwork','Library cover thumbnails','Show playlist, album and artist covers at the far right of text-list rows. Small type symbols stay on the left. The collapsed library keeps its cover rail.');
    select(library,'density','Track row spacing','Compact fits more songs; comfortable provides more room.',[['compact','Compact'],['comfortable','Comfortable']]);
    toggle(library,'trackArtwork','Cover thumbnails in song rows','Show album covers in playlist and artist track tables. Uses Spotify’s native List layout.');
    const player=group('Playback bar','The artwork dock and library collapse independently. Transport, volume and utility controls share one centerline.');
    toggle(player,'playerArtworkDock','Expanded album artwork','Keep the cover and song details above the playback strip. Turn off for a compact player; the cover’s hover button does the same.');
    number(player,'playerHeight','Playback strip height (px)','Increase room around controls without changing their alignment.',48,72,2);
    number(player,'playerTextSize','Song details text size (px)','Applies to the title and artist in both layouts. Compact text is limited by strip height to prevent clipping.',12,18);
    const lyrics=group('Lyrics & artwork','Customize the listening view. Native lyrics use Spotify timing; optional timestamped lyrics use Retrograde’s karaoke renderer.');
    toggle(lyrics,'lyricsFocus','Focus on the current line','Gently soften upcoming and previous lines. Text stays selectable and lines retain their native seek behavior.');
    select(lyrics,'lyricsAlignment','Lyric alignment','Center for a balanced listening room, or align left for a reading layout.',[['center','Centered'],['left','Left aligned']]);
    select(lyrics,'lyricsIntegration','Lyrics extension compatibility','Auto yields to detected custom lyric views. Extension-owned also supports other lyric plugins. Retrograde native forces this theme’s listening layout.',[['auto','Automatic'],['extension','Extension-owned'],['native','Retrograde native']]);
    const providerControls=group('Word timing · optional','Native lyrics work without an account. These advanced controls are for an authorized timing provider or your own local timing file.');
    select(providerControls,'lyricsProvider','Word-timing provider','Native lyrics need no provider key. Optional Spicy Lyrics access needs an approved client setup; requests include the track ID and your provider key, never your Spotify token.',[['native','Spotify native'],['spicy','Spicy API (optional)']]);
    const providerKey=element('input',{type:'password',autocomplete:'off',spellcheck:'false','aria-label':'Publishable lyrics provider key',placeholder:'sl_pk_…'});providerKey.value=RetrogradeKaraokeCredentials.read();const providerMessage=element('p',{class:'rp-option-help',role:'status'});const saveKey=element('button',{type:'button'},'Save key');saveKey.onclick=()=>{try{RetrogradeKaraokeCredentials.save(providerKey.value.trim());providerMessage.textContent=providerKey.value?'Client key saved on this computer. Provider authorization is still required.':'Client key removed.';}catch(error){providerMessage.textContent=error.message;}};option(providerControls,'karaokeKey','Optional provider client key','Never enter a secret sl_sk_ key. This field is stored separately from theme settings.',providerKey);refs.delete('karaokeKey');providerControls.append(saveKey,providerMessage);
    const importFile=element('input',{type:'file',accept:'.json,application/json','aria-label':'Import your own word timing JSON'});importFile.onchange=async()=>{try{const file=importFile.files?.[0];if(!file)return;if(file.size>2000000)throw Error('Timing file is too large.');const trackUri=Spicetify.Player.data?.item?.uri;const timingText=await file.text();if(Spicetify.Player.data?.item?.uri!==trackUri)throw Error('The song changed during import. Select the timing file again for the current track.');const result=features.importTiming(JSON.parse(timingText));providerMessage.textContent='Imported '+result.lines+' timed lines for the current track, for this Spotify session.';}catch(error){providerMessage.textContent=error.message;}finally{importFile.value='';}};option(providerControls,'karaokeImport','Import local word timing','Optional: select your own timestamped JSON for the current track. No file is uploaded. See the bundled guide for the format.',importFile);refs.delete('karaokeImport');const clearTiming=element('button',{type:'button'},'Use native timing for this track');clearTiming.onclick=()=>{features.clearTiming();providerMessage.textContent='Local timing removed for this track.';};providerControls.append(clearTiming);
    select(lyrics,'lyricsEffect','Current-line visual effect','Glow, pulse or a decorative letter wave follows Spotify’s active line. These are line-synced effects, not word-timed karaoke. Motion respects Reduce interface animation.',[['none','None'],['glow','Soft glow'],['pulse','Breathing glow'],['wave','Letter wave']]);
    select(lyrics,'lyricsInfoSide','Song information card position','Place the framed cover and album details beside the lyrics.',[['left','Left of lyrics'],['right','Right of lyrics']]);
    number(lyrics,'lyricsSize','Lyrics text size (px)','The current line is emphasized at a larger size.',16,28);
    toggle(lyrics,'lyricsBackground','Album backdrop behind lyrics','Zoom, blur and fade the album cover behind lyrics. Turn off for a solid background.');
    toggle(lyrics,'artworkBackground','Album backdrop in artwork view','Use the same zoomed, blurred and faded cover behind Show artwork.');
    toggle(lyrics,'lyricsCoverArtwork','Cover image beside lyrics','Show the album cover in the lyrics information card. Track details remain visible when off.');
    toggle(lyrics,'artworkCoverArtwork','Cover image in artwork view','Show the foreground album cover in Show artwork. Track details remain visible when off.');
    const activeColor=element('input',{id:'rp-lyricsActiveColor',type:'color','aria-label':'Current lyric line color'}),activeHex=element('input',{type:'text',maxlength:'7',pattern:'#[0-9a-fA-F]{6}','aria-label':'Current lyric line hex color',class:'rp-lyric-color-hex'}),activeWrap=element('div',{class:'rp-lyric-color-controls'});activeWrap.append(activeColor,activeHex);activeColor.oninput=()=>{settings.lyricsActiveColor=activeColor.value;activeHex.value=activeColor.value;activeHex.setAttribute('aria-invalid','false');activeHex.setCustomValidity('');changed();};activeHex.oninput=()=>{const valid=/^#[0-9a-f]{6}$/i.test(activeHex.value);activeHex.setAttribute('aria-invalid',String(!valid));activeHex.setCustomValidity(valid?'':'Use a six-digit hex color.');if(valid){settings.lyricsActiveColor=activeHex.value.toLowerCase();activeColor.value=settings.lyricsActiveColor;changed();}};activeHex.onblur=()=>{if(activeHex.getAttribute('aria-invalid')==='true'){activeHex.value=settings.lyricsActiveColor;activeHex.setAttribute('aria-invalid','false');activeHex.setCustomValidity('');}};option(lyrics,'lyricsActiveColor','Current lyric line color','White by default; independent of the interface accent and color preset.',activeWrap);refs.set('lyricsActiveColor',{color:activeColor,hex:activeHex});
    toggle(lyrics,'lyricsRomanization','Phonetic lyric readings','Add romanization below Japanese, Korean and Mandarin lines. Original lyrics and click-to-seek remain intact. Japanese requires a first-use dictionary download.');
    select(lyrics,'lyricsReadingLanguage','Han-character reading','Auto uses kana elsewhere in the lyrics to distinguish Japanese from Mandarin. Override it for mixed-language songs.',[['auto','Auto'],['ja','Japanese'],['zh','Mandarin']]);
    number(lyrics,'lyricsBlur','Backdrop blur (px)','Higher values turn the enlarged cover into softer color shapes.',20,80,4);
    number(lyrics,'lyricsFade','Backdrop visibility (%)','Low values keep the album colors subtle and the lyrics readable.',0,40,2);
    const type=group('Typography & motion','Adjust interface readability and response without changing Spotify account preferences.');
    number(type,'fontSize','Interface text size (px)','Sets library, table, menu and control text; song and lyric sizes have their own settings.',11,16);
    toggle(type,'motion','Reduce interface animation','Use immediate menu and control feedback. Native lyric synchronization continues.');
    const windows=group('Window & sidebars','Drag the sidebar dividers or use these saved widths. Focused dividers also support arrow keys.');
    toggle(windows,'windowControls','Retrograde window buttons','Style minimize, maximize and close to match the selected chrome tint.');
    number(windows,'leftWidth','Expanded library width (px)','Also determines the expanded cover size. Collapsing the library keeps the artwork dock open.',200,640,10);
    number(windows,'rightWidth','Queue / Now Playing width (px)','Available content width may limit large sidebar sizes.',240,640,10);
    body.append(grid,status);
    const foot=element('footer',{class:'rp-settings-footer'}),reset=element('button',{type:'button',class:'rp-secondary'},'Reset to defaults'),done=element('button',{type:'button',class:'rp-primary'},'Done');
    reset.onclick=()=>{if(lyricsOnly){for(const key of Object.keys(settings))if(key.startsWith('lyrics')||key.startsWith('artwork'))settings[key]=P.defaults[key];}else settings={...P.defaults};changed();sync();};done.onclick=close;
    foot.append(reset,element('span',{},'Retrograde 1.0'),done);
    dialog.append(heading,body,foot);dialog.addEventListener('cancel',e=>{e.preventDefault();e.stopPropagation();close();});dialog.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();close();}},{capture:true});
    document.body.append(dialog);sync();dialog.showModal();x.focus();
  }
  function ready(attempt=0){
    if(disposed)return;
    if(!window.Spicetify?.Topbar?.Button || !Spicetify.Menu?.Item || !Spicetify.Platform?.History?.listen || !Spicetify.Platform?.LocalStorageAPI){if(attempt<60)timer=setTimeout(()=>ready(attempt+1),500);else console.warn('[Retrograde] Spicetify controls unavailable; theme styling remains active.');return;}
    // Topbar API handles Spotify navigation and mounting of the button.
    const icon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 7h16M4 12h16M4 17h16"/><circle cx="9" cy="7" r="2" fill="currentColor"/><circle cx="15" cy="12" r="2" fill="currentColor"/><circle cx="10" cy="17" r="2" fill="currentColor"/></svg>';
    // 2.46.4 retains Topbar wrappers in an internal Set and has no unregister.
    // Reuse one button across runtime reloads and hide it on theme disposal.
    topbar=window.__retrogradeTopbar||(window.__retrogradeTopbar=new Spicetify.Topbar.Button('Retrograde theme settings',icon,open));
    topbar.onClick=open;topbar.element.style.removeProperty('display');
    topbar.element.id='retrograde-settings-button';
    menu=new Spicetify.Menu.Item('Retrograde theme settings',false,open);menu.register();
    applyDensity();
    lastBehavior=behavior();lastWidths=settings.leftWidth+'|'+settings.rightWidth;features=createRetrogradeFeatures({getSettings:()=>settings,onPreferences:open,setLyricsRomanization:value=>{settings.lyricsRomanization=!!value;save();},setPlayerArtworkDock:value=>{settings.playerArtworkDock=!!value;save();},setWidths:(left,right,commit)=>{settings.leftWidth=left;settings.rightWidth=right;if(commit)save();},preferences:P});
  }
  apply();ready();
  window.Retrograde={openSettings:open,openLyricsSettings:()=>open('lyrics'),importTimedLyrics:input=>features?.importTiming(input),clearTimedLyrics:()=>features?.clearTiming(),romanizeLyrics:RetrogradeRomanization.convert,getSettings:()=>({...settings}),getDiagnostics:()=>features?.diagnostics(),dispose(){if(disposed)return;disposed=true;marketplaceLifecycle?.dispose();clearTimeout(timer);features?.dispose();close();menu?.deregister();if(topbar){topbar.onClick=()=>{};topbar.element.style.setProperty('display','none','important');}delete root.dataset.retrograde;delete root.dataset.retrogradeDensity;delete root.dataset.retrogradeRelief;delete root.dataset.retrogradeMotion;delete root.dataset.retrogradeTrackArtwork;for(const name of ['retrogradeLibrary','retrogradeLibraryArtwork','retrogradeLibraryIcons','retrogradeLyricsBackground','retrogradePage','retrogradeMedia','retrogradeMediaQueue','retrogradeLyricsOwner','retrogradeExternalLyrics','retrogradeFullscreen','retrogradeArtworkBackground','retrogradeLyricsCoverArtwork','retrogradeArtworkCoverArtwork'])delete root.dataset[name];for(const [key,[value,priority]]of priorTokens){if(root.style.getPropertyValue(key)!==ownedTokens.get(key))continue;if(value)root.style.setProperty(key,value,priority);else root.style.removeProperty(key);}}};
  marketplaceLifecycle=createRetrogradeMarketplaceLifecycle({script:loadedScript,document,onDeactivate:()=>window.Retrograde?.dispose()});
})();






