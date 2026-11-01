/* Retrograde settings runtime. Layout/NPV compatibility lives in features.js. */
(() => {
  'use strict';
  const loadedScript=document.currentScript;let marketplaceLifecycle;
  window.Reprise?.dispose?.(); window.Retrograde?.dispose?.();
  const P=RetrogradePreferences, KEY='retrograde:preferences:v1', root=document.documentElement;
  let settings={...P.defaults}, timer, menu, topbar, dialog, previousFocus, disposed=false, features, lastBehavior, lastWidths, lastDensity;
  try {settings=P.sanitize(JSON.parse(localStorage.getItem(KEY)||localStorage.getItem('reprise:preferences:v1')));} catch { /* corrupt storage falls back safely */ }
  const data=(key,value)=>{value=String(value);if(root.dataset[key]!==value)root.dataset[key]=value;};
  const token=(key,value)=>{if(root.style.getPropertyValue(key)!==value)root.style.setProperty(key,value);};
  const behavior=()=>JSON.stringify([settings.libraryStyle,settings.density,settings.trackArtwork,settings.fontSize,settings.windowControls,settings.lyricsInfoSide,settings.playerArtworkDock]);
  function apply(){
    data('retrograde','true'); data('retrogradeDensity',settings.density);
    data('retrogradeRelief',settings.relief); data('retrogradeMotion',settings.motion);
    data('retrogradeTrackArtwork',settings.trackArtwork);data('retrogradeLibrary',settings.libraryStyle);token('--rp-lyrics-size',settings.lyricsSize+'px');
    for(const k of P.colorKeys) token('--rp-'+k,settings[k]);
    token('--rp-font-size',settings.fontSize+'px');
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
  function open(){
    if(dialog?.isConnected){dialog.focus();return;}
    previousFocus=document.activeElement;
    dialog=element('dialog',{class:'rp-settings','aria-labelledby':'rp-settings-title'});
    const heading=element('header',{class:'rp-settings-header'});
    const titleBox=element('div',{class:'rp-preferences-brand'});const logo=element('img',{class:'rp-classic-logo',src:RetrogradeLogo,alt:'Classic Spotify logo',width:'52',height:'52'});titleBox.append(logo,element('h2',{id:'rp-settings-title'},'Preferences'));
    const x=element('button',{type:'button',class:'rp-close','aria-label':'Close theme settings'});x.innerHTML='<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false"><path d="m3 3 10 10M13 3 3 13" fill="none" stroke="currentColor" stroke-width="2"/></svg>';x.onclick=close;
    heading.append(titleBox,x);
    const body=element('div',{class:'rp-settings-body'});
    const presets=element('div',{class:'rp-presets','aria-label':'Color presets'});
    const refs=new Map();
    const status=element('p',{class:'rp-status',role:'status','aria-live':'polite'});
    function report(){
      const pairs=[['text','main'],['text','sidebar'],['text','menu'],['text','player'],['secondary','main'],['text','selection'],['text','hover']];
      const low=pairs.filter(([a,b])=>P.contrast(settings[a],settings[b])<4.5);
      status.textContent=low.length?'Low contrast: '+low.map(([a,b])=>`${a} on ${b}`).join(', ')+'. Consider adjusting these colors.':'All checked text and surface pairs meet 4.5:1 contrast.';
      status.dataset.warning=String(low.length>0);
    }
    function changed(){const ok=save();report();if(!ok){status.textContent='Preview applied, but local storage is unavailable. Changes may not survive a restart.';status.dataset.warning='true';}}
    function sync(){for(const[k,v]of refs){if(v.color)v.color.value=settings[k];if(v.hex){v.hex.value=settings[k];v.hex.setAttribute('aria-invalid','false');v.hex.setCustomValidity('');}if(v.control){if(v.control.type==='checkbox')v.control.checked=settings[k];else v.control.value=String(settings[k]);}}report();}
    for(const[name,preset]of Object.entries(P.presets)){
      const b=element('button',{type:'button',class:'rp-preset'},name);
      const swatch=element('span',{'aria-hidden':'true'});swatch.style.background=preset.accent;b.prepend(swatch);
      b.onclick=()=>{settings=P.applyPreset(settings,preset);changed();sync();};presets.append(b);
    }
    body.append(element('h3',{},'Color scheme'),presets);
    const colors=element('fieldset',{class:'rp-colors'});colors.append(element('legend',{},'Palette'));
    const labels={accent:'Accent',sidebar:'Library sidebar',menu:'Menus & dialogs',main:'Main content',player:'Playback bar',text:'Primary text',secondary:'Secondary text',selection:'Selected rows',hover:'Hover surface'};
    for(const k of P.colorKeys){
      const row=element('div',{class:'rp-color-row'}),label=element('label',{for:'rp-'+k},labels[k]);
      const color=element('input',{id:'rp-'+k,type:'color','aria-label':labels[k]+' color'});
      const hex=element('input',{id:'rp-'+k+'-hex',type:'text',maxlength:'7',pattern:'#[0-9a-fA-F]{6}','aria-label':labels[k]+' hex color',spellcheck:'false'});
      color.oninput=()=>{settings[k]=color.value;hex.value=color.value;hex.setAttribute('aria-invalid','false');hex.setCustomValidity('');changed();};
      hex.oninput=()=>{const valid=/^#[0-9a-f]{6}$/i.test(hex.value);hex.setAttribute('aria-invalid',String(!valid));hex.setCustomValidity(valid?'':'Use a six-digit hex color, such as #a4cc35.');if(valid){settings[k]=hex.value.toLowerCase();color.value=settings[k];changed();}};
      hex.onblur=()=>{if(hex.getAttribute('aria-invalid')==='true'){hex.value=settings[k];hex.setAttribute('aria-invalid','false');hex.setCustomValidity('');}};
      row.append(label,color,hex);colors.append(row);refs.set(k,{color,hex});
    }
    const layout=element('fieldset',{class:'rp-layout'});layout.append(element('legend',{},'Layout & feel'));
    function select(k,label,options){const row=element('div',{class:'rp-option'}),l=element('label',{for:'rp-'+k},label),s=element('select',{id:'rp-'+k});for(const[value,text]of options)s.append(element('option',{value},text));s.onchange=()=>{settings[k]=s.value;changed();};row.append(l,s);layout.append(row);refs.set(k,{control:s});}
    select('lyricsInfoSide','Lyrics information position',[['left','Left'],['right','Right']]);
    select('libraryStyle','Library rows',[['classic','Classic list'],['artwork','Album artwork']]);
    const dockRow=element('div',{class:'rp-option'}),dock=element('input',{id:'rp-playerArtworkDock',type:'checkbox'});
    dock.onchange=()=>{settings.playerArtworkDock=dock.checked;changed();};dockRow.append(element('label',{for:'rp-playerArtworkDock'},'Artwork above playback bar'),dock);layout.append(dockRow);refs.set('playerArtworkDock',{control:dock});
    select('density','Track spacing',[['compact','Compact'],['comfortable','Comfortable']]);
    layout.append(element('p',{class:'rp-density-note'},'Album icons use Spotify’s native List layout.'));
    const artRow=element('div',{class:'rp-option'}),art=element('input',{id:'rp-trackArtwork',type:'checkbox'});
    art.onchange=()=>{settings.trackArtwork=art.checked;changed();};artRow.append(element('label',{for:'rp-trackArtwork'},'Show track album icons'),art);layout.append(artRow);refs.set('trackArtwork',{control:art});
    select('relief','Gradients & bevels',[['subtle','Subtle'],['strong','Stronger']]);
    const winRow=element('div',{class:'rp-option'}),win=element('input',{id:'rp-windowControls',type:'checkbox'});win.onchange=()=>{settings.windowControls=win.checked;changed();};winRow.append(element('label',{for:'rp-windowControls'},'Themed window controls'),win);layout.append(winRow);refs.set('windowControls',{control:win});
    const lyricRow=element('div',{class:'rp-option'}),lyric=element('input',{id:'rp-lyricsSize',type:'number',min:'16',max:'28',step:'1'});lyric.onchange=()=>{settings.lyricsSize=P.sanitize({...settings,lyricsSize:Number(lyric.value)}).lyricsSize;lyric.value=settings.lyricsSize;changed();};lyricRow.append(element('label',{for:'rp-lyricsSize'},'Lyrics size (16–28 px)'),lyric);layout.append(lyricRow);refs.set('lyricsSize',{control:lyric});
    const fontRow=element('div',{class:'rp-option'}),font=element('input',{id:'rp-fontSize',type:'number',min:'11',max:'16',step:'1'});
    font.onchange=()=>{settings.fontSize=P.sanitize({...settings,fontSize:Number(font.value)}).fontSize;font.value=settings.fontSize;changed();};
    fontRow.append(element('label',{for:'rp-fontSize'},'Text size (11–16 px)'),font);layout.append(fontRow);refs.set('fontSize',{control:font});
    const motionRow=element('div',{class:'rp-option'}),motion=element('input',{id:'rp-motion',type:'checkbox'});
    motion.onchange=()=>{settings.motion=motion.checked;changed();};motionRow.append(element('label',{for:'rp-motion'},'Reduce animation'),motion);layout.append(motionRow);refs.set('motion',{control:motion});
    for(const[k,label,min]of[['leftWidth','Left sidebar width',200],['rightWidth','Right sidebar width',240]]){
      const row=element('div',{class:'rp-option'}),input=element('input',{id:'rp-'+k,type:'number',min:String(min),max:'640',step:'10'});
      input.onchange=()=>{settings[k]=P.sanitize({...settings,[k]:Number(input.value)})[k];input.value=settings[k];changed();};
      row.append(element('label',{for:'rp-'+k},label+' (px)'),input);layout.append(row);refs.set(k,{control:input});
    }
    layout.append(element('p',{class:'rp-density-note'},'Drag either divider to resize. Arrow keys also work when a divider is focused.'));
    const grid=element('div',{class:'rp-settings-grid'});grid.append(colors,layout);body.append(grid,status);
    const foot=element('footer',{class:'rp-settings-footer'}),reset=element('button',{type:'button',class:'rp-secondary'},'Reset to defaults'),done=element('button',{type:'button',class:'rp-primary'},'Done');
    reset.onclick=()=>{settings={...P.defaults};changed();sync();};done.onclick=close;
    foot.append(reset,element('span',{},'Retrograde 1.0'),done);
    dialog.append(heading,body,foot);dialog.addEventListener('cancel',e=>{e.preventDefault();close();});
    document.body.append(dialog);sync();dialog.showModal();x.focus();
  }
  function ready(attempt=0){
    if(disposed)return;
    if(!window.Spicetify?.Topbar?.Button || !Spicetify.Menu?.Item || !Spicetify.Platform?.History?.listen || !Spicetify.Platform?.LocalStorageAPI){if(attempt<60)timer=setTimeout(()=>ready(attempt+1),500);else console.warn('[Retrograde] Spicetify controls unavailable; theme styling remains active.');return;}
    // Topbar API handles Spotify navigation and mounting of the button.
    const icon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 7h16M4 12h16M4 17h16"/><circle cx="9" cy="7" r="2" fill="currentColor"/><circle cx="15" cy="12" r="2" fill="currentColor"/><circle cx="10" cy="17" r="2" fill="currentColor"/></svg>';
    topbar=new Spicetify.Topbar.Button('Retrograde theme settings',icon,open);
    topbar.element.id='retrograde-settings-button';
    menu=new Spicetify.Menu.Item('Retrograde theme settings',false,open);menu.register();
    applyDensity();
    lastBehavior=behavior();lastWidths=settings.leftWidth+'|'+settings.rightWidth;features=createRetrogradeFeatures({getSettings:()=>settings,onPreferences:open,setPlayerArtworkDock:value=>{settings.playerArtworkDock=!!value;save();},setWidths:(left,right,commit)=>{settings.leftWidth=left;settings.rightWidth=right;if(commit)save();},preferences:P});
  }
  apply();ready();
  window.Retrograde={openSettings:open,getSettings:()=>({...settings}),getDiagnostics:()=>features?.diagnostics(),dispose(){if(disposed)return;disposed=true;marketplaceLifecycle?.dispose();clearTimeout(timer);features?.dispose();close();menu?.deregister();topbar?.element?.remove();delete root.dataset.retrograde;delete root.dataset.retrogradeDensity;delete root.dataset.retrogradeRelief;delete root.dataset.retrogradeMotion;delete root.dataset.retrogradeTrackArtwork;for(const name of ['retrogradeLibrary','retrogradePage','retrogradeMedia','retrogradeMediaQueue'])delete root.dataset[name];for(const k of [...P.colorKeys,'font-size','accent-ink','lyrics-size'])root.style.removeProperty('--rp-'+k);}};
  marketplaceLifecycle=createRetrogradeMarketplaceLifecycle({script:loadedScript,document,onDeactivate:()=>window.Retrograde?.dispose()});
})();






