/* Spotify 1.3.6 compatibility: native sidebar size preferences, a minimal NPV,
   and a fully-rendered artist Popular table. React-owned nodes are never moved. */
function createRetrogradeFeatures({getSettings,setWidths,setPlayerArtworkDock,setLyricsRomanization,preferences,onPreferences}) {
  const controller=new AbortController(),signal=controller.signal;
  const handles=new Map(),headers=new Set(),tagged=new Set(),stats={syncs:0,lastMs:0,maxMs:0,totalMs:0,passes:{layout:0,panel:0,artist:0,queue:0,media:0,chrome:0}};
  const LAYOUT=1,PANEL=2,ARTIST=4,QUEUE=8,MEDIA=16,CHROME=32,ALL=63;
  const frames=createRetrogradeFrameQueue(sync),artistGeometry=new WeakMap();
  let disposed=false,dragController,lastLibraryStyle,lastWidthContext,observedRoot,dockWidth=getSettings().leftWidth;
  const chrome=createRetrogradeChrome({getSettings,onPreferences});const lyrics=createRetrogradeLyrics({getSettings,onPreferences:()=>onPreferences('lyrics'),onRomanization:setLyricsRomanization,renderTrack,schedule:()=>schedule(MEDIA)});
  const storage=()=>Spicetify.Platform?.LocalStorageAPI;
  const mark=(e,k,v='')=>{if(e.getAttribute(k)!==v){e.setAttribute(k,v);tagged.add(e);}};
  const originals=new Map();
  function override(e,k,v){if(!e)return;let props=originals.get(e);if(!props){props=new Map();originals.set(e,props);}if(!props.has(k))props.set(k,[e.style.getPropertyValue(k),e.style.getPropertyPriority(k)]);if(e.style.getPropertyValue(k)!==v)e.style.setProperty(k,v,'important');}
  const nativeSet=(k,v)=>{const api=storage();if(api?.getItem(k)!==v)api?.setItem(k,v);};
  function playerArtwork(){
    const bar=document.querySelector('[data-testid="now-playing-bar"]');
    if(bar&&playerBar!==bar){playerImageObserver.disconnect();playerBar=bar;playerImageObserver.observe(bar,{childList:true,subtree:true,attributes:true,attributeFilter:['src']});}
    const img=bar?.querySelector('[data-testid="cover-art-container"] img');
    const widget=bar?.querySelector('[data-testid="now-playing-widget-v2"]');
    if(widget){
      let toggle=widget.querySelector(':scope > .rp-player-dock-toggle');
      if(!toggle){
        toggle=document.createElement('button');toggle.type='button';toggle.className='rp-player-dock-toggle';
        toggle.innerHTML='<svg viewBox="0 0 16 16" aria-hidden="true"><path d="m4 6 4 4 4-4" fill="none" stroke="currentColor" stroke-width="2"/></svg>';
        toggle.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();setPlayerArtworkDock(!getSettings().playerArtworkDock);},{signal});
        widget.append(toggle);
      }
      const expanded=document.documentElement.getAttribute('data-rp-player-docked')==='true';
      const label=expanded?'Collapse artwork into playback bar':'Expand artwork above playback bar';
      if(toggle.getAttribute('aria-label')!==label){toggle.setAttribute('aria-label',label);toggle.title=label;}
      toggle.setAttribute('aria-expanded',String(expanded));
      toggle.hidden=false;
    }
    // Spotify supplies a 56px thumbnail for its original mini-widget. Its own
    // CDN size variant keeps the enlarged native cover sharp without a fetch loop.
    if(img&&img.src.includes('ab67616d000011eb')){
      const sharp=img.src.replace('ab67616d000011eb','ab67616d0000b273')+' 640w';
      if(img.srcset!==sharp)img.srcset=sharp;
    }
  }
  let playerBar;
  const playerImageObserver=new MutationObserver(playerArtwork);
  signal.addEventListener('abort',()=>{playerImageObserver.disconnect();playerBar?.querySelector('[data-testid="cover-art-container"] img')?.removeAttribute('srcset');document.querySelectorAll('.rp-player-dock-toggle').forEach(e=>e.remove());},{once:true});
  function schedule(flags=ALL){frames.add(flags);}
  // Virtualized list rows and native lyric lines need no theme JavaScript.
  // Only structural changes in the relevant surface trigger its adaptation.
  const observer=new MutationObserver(records=>{
    let flags=0;
    for(const r of records){
      const e=r.target.nodeType===1?r.target:r.target.parentElement;if(!e)continue;
      if(e.closest('.rp-track-summary,.rp-listening-info,.rp-artist-tablehead,.rp-queue-tablehead,[role="tooltip"],[data-tippy-root]'))continue;
      if(e.closest('[data-testid="now-playing-bar"]'))continue;
      if(e.closest('#Desktop_LeftSidebar_Id'))continue;
      if(e.closest('[data-rp-media-root]'))continue;
      if(e.closest('.Root__globalNav')){if(e.classList.contains('Root__globalNav'))flags|=CHROME;continue;}
      if(e.closest('#Desktop_PanelContainer_Id')){flags|=PANEL|QUEUE|MEDIA;continue;}
      if(e.closest('[data-testid="artist-page"]')){flags|=ARTIST;continue;}
      // Playlist/Home virtualizers are styled through CSS, not rescanned.
      if(e.closest('#main-view')){if(RetrogradeLyricsCompatibility.relevant([r]))flags|=MEDIA;if(Spicetify.Platform.History.location.pathname.startsWith('/artist/'))flags|=ARTIST;continue;}
      if(e===observedRoot||e.closest('.Root__top-container'))flags|=LAYOUT|PANEL|ARTIST|QUEUE|MEDIA|CHROME;
    }
    if(flags)schedule(flags);
  });
  const resize=new ResizeObserver(()=>schedule(LAYOUT|ARTIST));
  const mount=new MutationObserver(()=>{const root=document.querySelector('.Root__top-container');if(root!==observedRoot)schedule(ALL);});
  function observe(){const root=document.querySelector('.Root__top-container');if(root!==observedRoot){mount.disconnect();observedRoot=root;if(root?.parentElement)mount.observe(root.parentElement,{childList:true});else mount.observe(document.querySelector('#main')||document.body,{childList:true,subtree:true});}if(root)observer.observe(root,{childList:true,subtree:true});}
  const roots=new Set();
  function watchSize(e){if(e&&!roots.has(e)){roots.add(e);resize.observe(e);}}
  function libraryLayout(geometry){
    const left=document.querySelector('#Desktop_LeftSidebar_Id'),nav=left?.querySelector('nav'),api=storage();if(!nav)return;
    const libraryView=getSettings().libraryStyle==='classic'&&!getSettings().libraryArtwork?2:0;
    if(api&&lastLibraryStyle!==libraryView){nativeSet('items-view',libraryView);lastLibraryStyle=libraryView;}
    const path=Spicetify.Platform.History.location.pathname;mark(document.documentElement,'data-retrograde-page',path==='/'?'home':path.includes('lyrics')?'lyrics':'content');
    mark(left,'data-rp-collapsed',String(!!left.querySelector('.main-yourLibraryX-headerIsCollapsed')));
    // Size the native player's artwork dock from the actual library geometry.
    // CSS repositions the existing widget; React ownership and menus are retained.
    const docked=getSettings().playerArtworkDock!==false&&!lyrics.isOpen();
    mark(document.documentElement,'data-rp-player-docked',String(docked));
    playerArtwork();
    if(!left.querySelector('.main-yourLibraryX-headerIsCollapsed'))dockWidth=geometry.rects.left?.width||getSettings().leftWidth;
    override(document.documentElement,'--rp-player-library-width',Math.max(200,Math.round(dockWidth))+'px');
    // Remove the older generated duplicate; the native widget is the dock.
    nav.querySelector('.rp-library-dock')?.remove();
    mark(left,'data-rp-narrow',String((geometry.rects.left?.width||0)<320));
    const panel=document.querySelector('#Desktop_PanelContainer_Id');if(panel)mark(panel,'data-rp-narrow',String((geometry.rects.panel?.width||0)<330));
  }
  function sideElements(){const left=document.querySelector('#Desktop_LeftSidebar_Id'),panel=document.querySelector('#Desktop_PanelContainer_Id'),root=document.querySelector('.Root__top-container');let right=panel;while(right?.parentElement&&right.parentElement!==root)right=right.parentElement;return{left,panel,right:panel&&root?.contains(right)?right:null,root};}
  function applyWidths(){
    const s=getSettings(),fit=preferences.fitWidths(innerWidth,s.leftWidth,s.rightWidth),{left,panel,root}=sideElements();
    const collapsedNow=!!left?.querySelector('.main-yourLibraryX-headerIsCollapsed');
    const context=[left,panel,panel?.parentElement,collapsedNow,fit.left,fit.right];
    if(lastWidthContext&&context.every((v,i)=>v===lastWidthContext[i]))return;
    lastWidthContext=context;
    // These two local UI preferences are observed by Spotify's React layout.
    // Updating them preserves its library/NPV state and avoids fighting inline widths.
    const collapsed=!!left?.querySelector('.main-yourLibraryX-headerIsCollapsed');
    try{if(left&&!collapsed){const state=storage()?.getItem('left-sidebar-state');nativeSet(state===2?'left-sidebar-expanded-state-width':'left-sidebar-default-state-width',fit.left);}if(left)override(left,'--left-sidebar-width',String(collapsed?76:fit.left));if(panel){nativeSet('panel-width',fit.right);for(let p=panel.parentElement;p&&p!==root;p=p.parentElement){override(p,'width',fit.right+'px');override(p,'min-width','0px');}}}catch(e){console.warn('[Retrograde] Sidebar size API unavailable',e);}
  }
  function createHandle(side){
    const h=document.createElement('div');h.className='rp-sidebar-resizer';h.dataset.side=side;h.tabIndex=0;h.setAttribute('role','separator');h.setAttribute('aria-orientation','vertical');h.setAttribute('aria-label',`Resize ${side} sidebar`);h.title=`Drag to resize ${side} sidebar. Arrow keys adjust; double-click resets.`;
    document.body.append(h);handles.set(side,h);
    function change(value,commit){const s=getSettings(),key=side==='left'?'leftWidth':'rightWidth',clean=preferences.sanitize({...s,[key]:value});setWidths(clean.leftWidth,clean.rightWidth,commit);applyWidths();schedule(LAYOUT|ARTIST);}
    h.addEventListener('pointerdown',e=>{
      if(e.button!==0)return;e.preventDefault();h.focus();dragController?.abort();dragController=new AbortController();const ds=dragController.signal,start=e.clientX,width=side==='left'?sideElements().left?.getBoundingClientRect().width:sideElements().right?.getBoundingClientRect().width;
      document.documentElement.dataset.retrogradeResizing='true';
      let dragFrame=0,pendingWidth;const flushDrag=()=>{dragFrame=0;if(pendingWidth!==undefined){const value=pendingWidth;pendingWidth=undefined;change(value,false);}};
      ds.addEventListener('abort',()=>{if(dragFrame)cancelAnimationFrame(dragFrame);},{once:true});
      window.addEventListener('pointermove',m=>{pendingWidth=width+(m.clientX-start)*(side==='left'?1:-1);if(!dragFrame)dragFrame=requestAnimationFrame(flushDrag);},{signal:ds});
      window.addEventListener('pointerup',()=>{if(dragFrame)cancelAnimationFrame(dragFrame);flushDrag();dragController.abort();delete document.documentElement.dataset.retrogradeResizing;const s=getSettings();setWidths(s.leftWidth,s.rightWidth,true);},{once:true,signal:ds});
      window.addEventListener('blur',()=>{dragController.abort();delete document.documentElement.dataset.retrogradeResizing;},{once:true,signal:ds});
    },{signal});
    h.addEventListener('keydown',e=>{const current=getSettings()[side==='left'?'leftWidth':'rightWidth'];let value;if(e.key==='ArrowLeft'||e.key==='ArrowRight')value=current+(e.key==='ArrowRight'?1:-1)*(side==='left'?1:-1)*(e.shiftKey?32:8);if(e.key==='Home')value=side==='left'?200:240;if(e.key==='End')value=640;if(value!==undefined){e.preventDefault();change(value,true);}},{signal});
    h.addEventListener('dblclick',()=>change(side==='left'?300:360,true),{signal});return h;
  }
  function positionHandles(geometry){const {left,right,root}=geometry.sides;watchSize(root);watchSize(left);watchSize(right);
    const collapsed=!!left?.querySelector('.main-yourLibraryX-headerIsCollapsed');
    const rects=geometry.rects;
    const cinema=!!document.querySelector('#lyrics-cinema:not(:empty)');
    for(const side of ['left','right']){const h=handles.get(side)||createHandle(side),r=rects[side],hide=!r||r.width<100||r.height<80||(side==='left'&&collapsed)||cinema;
      if(h.hidden!==hide)h.hidden=hide;if(hide)continue;
      const values={left:Math.round((side==='left'?r.right:r.left)-4)+'px',top:Math.round(r.top)+'px',height:Math.round(r.height)+'px'};
      for(const[k,v]of Object.entries(values))if(h.style[k]!==v)h.style[k]=v;
      const attrs={'aria-valuenow':String(Math.round(r.width)),'aria-valuemin':side==='left'?'200':'240','aria-valuemax':'640','aria-controls':side==='left'?'Desktop_LeftSidebar_Id':'Desktop_PanelContainer_Id'};
      for(const[k,v]of Object.entries(attrs))if(h.getAttribute(k)!==v)h.setAttribute(k,v);
    }
  }
  function navigationLink(text,uri){const a=document.createElement('a');a.textContent=text;const match=/^spotify:(album|artist|track):([a-zA-Z0-9]+)$/.exec(uri||'');if(match){a.href=`/${match[1]}/${match[2]}`;a.addEventListener('click',e=>{if(e.button===0&&!e.ctrlKey&&!e.metaKey){e.preventDefault();Spicetify.Platform.History.push(a.getAttribute('href'));}});}return a;}
  function renderTrack(target){
    // 1.3.6 can expose PlayerAPI state before the wrapper Player.data getter is ready.
    const item=Spicetify.Player.data?.item||Spicetify.Platform.PlayerAPI?._state?.item,meta=item?.metadata||{},signature=[item?.uri,meta.title,meta.image_xlarge_url,meta.artist_name].join('|');
    if(target.dataset.track===signature)return;target.dataset.track=signature;target.replaceChildren();
    const art=navigationLink('',meta.album_uri);art.className='rp-now-cover';art.setAttribute('aria-label',`Open album ${meta.album_title||item?.name||''}`);
    const url=meta.image_xlarge_url||meta.image_large_url||item?.images?.find(x=>x.label==='large')?.url||meta.image_url;
    if(url&&(/^(spotify:image:|https:\/\/(i\.scdn\.co|image-cdn[^/]*\.spotifycdn\.com)\/)/.test(url))){const image=document.createElement('img');image.src=url;image.alt=meta.album_title||'Current album cover';art.append(image);}else{const empty=document.createElement('div');empty.className='rp-cover-placeholder';empty.textContent='♪';art.append(empty);}
    const info=document.createElement('div');info.className='rp-now-info';const title=document.createElement('h2');title.append(navigationLink(item?.name||meta.title||'Nothing playing',item?.uri));
    const artists=document.createElement('div');artists.className='rp-now-artists';const list=item?.artists?.length?item.artists:[{name:meta.artist_name||'Choose something from your library',uri:meta.artist_uri}];list.forEach((artist,i)=>{if(i)artists.append(document.createTextNode(', '));artists.append(navigationLink(artist.name,artist.uri));});info.append(title,artists);target.append(art,info);
  }
  function simplifyPanel(){
    const panel=document.querySelector('#Desktop_PanelContainer_Id'),npv=panel?.querySelector('[data-npv-root]');if(!npv)return;
    const viewport=npv.querySelector('[data-overlayscrollbars-viewport]'),native=viewport?.firstElementChild;if(!native)return;mark(native,'data-rp-npv-content');
    let summary=native.querySelector(':scope > .rp-track-summary');if(!summary){summary=document.createElement('section');summary.className='rp-track-summary';summary.setAttribute('aria-label','Now playing track');native.prepend(summary);viewport.scrollTop=0;}renderTrack(summary);
    // English label + isolated 1.3.6 fallback. Find the outer card whose parent
    // also contains the other section headings; never reparent React-owned DOM.
    const heading=[...native.querySelectorAll('h2')].find(h=>/^About the artist$/i.test(h.textContent.trim()));
    let card=heading;
    if(card){while(card.parentElement&&card.parentElement!==native&&[...card.parentElement.querySelectorAll('h2')].every(h=>h===heading))card=card.parentElement;mark(card,'data-rp-about-card');const follow=[...card.querySelectorAll('button')].find(b=>/^(Follow|Following)$/.test(b.textContent.trim()));if(follow?.parentElement)mark(follow.parentElement,'data-rp-about-metrics');}
    function filter(parent){for(const child of parent.children){if(child===summary)continue;if(child.matches(RetrogradeLyricsCompatibility.cards)||child.querySelector(RetrogradeLyricsCompatibility.cards)){child.removeAttribute('data-rp-npv-hidden');for(const card of child.querySelectorAll(RetrogradeLyricsCompatibility.cards)){let p=card;while(p&&p!==child){p.removeAttribute('data-rp-npv-hidden');p=p.parentElement;}}continue;}if(card&&(child===card||child.contains(card))){if(child.hasAttribute('data-rp-npv-hidden'))child.removeAttribute('data-rp-npv-hidden');if(child!==card){mark(child,'data-rp-npv-path');filter(child);}}else mark(child,'data-rp-npv-hidden');}}
    filter(native);
    const toolbar=npv.firstElementChild;mark(toolbar,'data-rp-npv-toolbar');const height=toolbar.getBoundingClientRect().height+'px';if(native.style.getPropertyValue('--rp-npv-toolbar-height')!==height)native.style.setProperty('--rp-npv-toolbar-height',height);const context=toolbar.querySelector('a');if(context){mark(context,'data-rp-npv-hidden');if(!context.parentElement.querySelector('.rp-npv-label')){const label=document.createElement('span');label.className='rp-npv-label';label.textContent='Now playing';context.parentElement.append(label);}}
  }
  function artistTables(){
    for(const g of document.querySelectorAll('[data-testid="artist-page"] [role="grid"][style*="--row-height"]')){
      const rows=[...g.querySelectorAll('[role="row"][aria-selected]')],count=Number(g.getAttribute('aria-rowcount'));
      // Only the entirely rendered 5/10-song Popular list. Never alter the
      // spacers of paginated/virtualized albums, playlists, or discographies.
      if(!count||count>30||rows.length!==count)continue;
      mark(g,'data-rp-static-tracks');
      const wrap=g.querySelector(':scope > [data-scroll-size-contained]');if(wrap)mark(wrap,'data-rp-static-wrap');
      let head=g.previousElementSibling;if(!head?.classList.contains('rp-artist-tablehead')){head=document.createElement('div');head.className='rp-artist-tablehead';head.setAttribute('aria-hidden','true');for(const text of ['#','Track','Plays','Time']){const cell=document.createElement('span');cell.textContent=text;head.append(cell);}g.before(head);headers.add(head);}
      const row=rows[0]?.firstElementChild,previous=artistGeometry.get(g),width=g.clientWidth;if(row&&(!previous||previous.row!==row||previous.width!==width||previous.density!==getSettings().density||previous.fontSize!==getSettings().fontSize||previous.artwork!==getSettings().trackArtwork)){artistGeometry.set(g,{row,width,density:getSettings().density,fontSize:getSettings().fontSize,artwork:getSettings().trackArtwork});const cs=getComputedStyle(row);head.style.gridTemplateColumns=cs.gridTemplateColumns;head.style.columnGap=cs.columnGap;head.style.paddingInlineStart=cs.paddingInlineStart;head.style.paddingInlineEnd=cs.paddingInlineEnd;}
    }
  }
  function queueTables(){
    // 1.3.6 queue/history uses fully rendered treegrids. Only compact these;
    // a future virtualized queue must keep its own calculated row geometry.
    const panel=document.querySelector('#Desktop_PanelContainer_Id');if(!panel)return;
    if(panel.querySelector('[role=tab]'))mark(panel,'data-rp-queue-panel');else if(panel.hasAttribute('data-rp-queue-panel'))panel.removeAttribute('data-rp-queue-panel');
    for(const g of panel.querySelectorAll('[role="treegrid"]')){
      const count=Number(g.getAttribute('aria-rowcount')),rows=g.querySelectorAll('[role="row"]');
      const compact=count>0&&rows.length===count&&!g.querySelector('[data-scroll-size-contained]');
      if(compact){
        mark(g,'data-rp-classic-queue');mark(g.parentElement,'data-rp-queue-section');
        let head=g.previousElementSibling;
        if(!head?.classList.contains('rp-queue-tablehead')){head=document.createElement('div');head.className='rp-queue-tablehead';head.setAttribute('aria-hidden','true');for(const text of ['#','Track','Artist']){const cell=document.createElement('span');cell.textContent=text;head.append(cell);}g.before(head);headers.add(head);}
      }else {g.removeAttribute('data-rp-classic-queue');if(g.previousElementSibling?.classList.contains('rp-queue-tablehead'))g.previousElementSibling.remove();}
    }
  }
  function sync(flags=ALL){if(disposed)return;const started=performance.now();observer.disconnect();try{
    // Read panel rectangles before writing width/state tokens. ResizeObserver
    // schedules a follow-up if those writes change the resulting geometry.
    let geometry;if(flags&LAYOUT){const sides=sideElements();geometry={sides,rects:{left:sides.left?.getBoundingClientRect(),right:sides.right?.getBoundingClientRect(),panel:sides.panel?.getBoundingClientRect()}};}
    if(flags&LAYOUT){for(const e of tagged)if(!e.isConnected)tagged.delete(e);for(const e of headers)if(!e.isConnected)headers.delete(e);for(const e of roots)if(!e.isConnected){resize.unobserve(e);roots.delete(e);}for(const e of originals.keys())if(!e.isConnected)originals.delete(e);applyWidths();libraryLayout(geometry);stats.passes.layout++;}
    if(flags&PANEL){simplifyPanel();stats.passes.panel++;}
    if(flags&ARTIST){artistTables();stats.passes.artist++;}
    if(flags&QUEUE){queueTables();stats.passes.queue++;}
    if(flags&MEDIA){lyrics.update();mark(document.documentElement,'data-rp-player-docked',String(getSettings().playerArtworkDock!==false&&!lyrics.isOpen()));playerArtwork();stats.passes.media++;}
    if(flags&LAYOUT)positionHandles(geometry);
    if(flags&CHROME){chrome.update();stats.passes.chrome++;}
  }finally{stats.syncs++;stats.lastMs=performance.now()-started;stats.totalMs+=stats.lastMs;stats.maxMs=Math.max(stats.maxMs,stats.lastMs);observe();}}
  window.addEventListener('resize',()=>schedule(LAYOUT|ARTIST),{signal});const unlisten=Spicetify.Platform.History.listen(()=>schedule(ALL));
  const songchange=()=>schedule(PANEL|QUEUE|MEDIA);Spicetify.Player.addEventListener('songchange',songchange);
  sync();
  return{importTiming:input=>lyrics.importTiming(input),clearTiming:()=>lyrics.clearTiming(),update:()=>schedule(ALL),resize:()=>schedule(LAYOUT|ARTIST),diagnostics:()=>({...stats,passes:{...stats.passes}}),dispose(){disposed=true;controller.abort();unlisten?.();frames.dispose();lyrics.dispose();chrome.dispose();dragController?.abort();observer.disconnect();mount.disconnect();resize.disconnect();Spicetify.Player.removeEventListener('songchange',songchange);for(const[e,props]of originals)for(const[k,[v,p]]of props){if(v)e.style.setProperty(k,v,p);else e.style.removeProperty(k);}for(const h of handles.values())h.remove();for(const h of headers)h.remove();document.querySelectorAll('.rp-track-summary,.rp-npv-label,.rp-library-navigation,.rp-library-dock').forEach(e=>e.remove());for(const e of tagged)for(const a of [...e.attributes])if(a.name.startsWith('data-rp-'))e.removeAttribute(a.name);delete document.documentElement.dataset.retrogradeResizing;}};
}
















