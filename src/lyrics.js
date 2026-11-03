/* Native media layout, isolated to Spotify 1.3.6's main-window media surface.
   Original lyric text and line seeking stay native; phonetic readings are derived locally. */
function createRetrogradeLyrics({getSettings,onPreferences,onRomanization,renderTrack,schedule}) {
  let current,card,collapsedByUs=false,lastUri='',disposed=false,offMode,offRail;
  const years=new Map();
  const compat=RetrogradeLyricsCompatibility;
  const changes=new MutationObserver(records=>{if(compat.relevant(records))schedule();});
  changes.observe(document.body,{childList:true,subtree:true});
  let external=false;
  let fullscreen,transport;
  const effects=createRetrogradeLyricEffects({getSettings});
  const karaoke=createRetrogradeKaraoke({getSettings,schedule});
  const readings=createRetrogradeRomanizedLines({getSettings,onToggle:onRomanization});
  const data=(e,key,value)=>{if(e.dataset[key]!==value)e.dataset[key]=value;};
  function restoreLibrary(){if(collapsedByUs){const left=document.querySelector('#Desktop_LeftSidebar_Id');if(left?.querySelector('.main-yourLibraryX-headerIsCollapsed'))left.querySelector('button[aria-label="Open Your Library"],button[aria-label="Expand Your Library"]')?.click();collapsedByUs=false;}}
  function leave(){karaoke.update(null);effects.update(null);transport?.dispose();transport=null;fullscreen?.dispose();fullscreen=null;readings.update(null);offRail?.disconnect();offRail=null;offMode?.disconnect();offMode=null;card?.remove();card=null;if(current){current.querySelectorAll('[data-rp-media-header]').forEach(e=>delete e.dataset.rpMediaHeader);current.style.removeProperty('--rp-lyrics-cover');delete current.dataset.rpMediaRoot;delete current.dataset.rpMediaMode;}current=null;lastUri='';delete document.documentElement.dataset.retrogradeMedia;delete document.documentElement.dataset.retrogradeMediaQueue;restoreLibrary();}
  function yearFor(uri){if(years.has(uri))return years.get(uri);const definition=Spicetify.GraphQL?.Definitions?.getAlbum;if(!definition)return Promise.resolve('');const promise=Spicetify.GraphQL.Request(definition,{uri,locale:'en',offset:0,limit:1}).then(r=>/^\d{4}/.exec(r.data?.albumUnion?.date?.isoString||'')?.[0]||'').catch(()=> '');if(years.size>=50)years.delete(years.keys().next().value);years.set(uri,promise);return promise;}
  function metadata(){
    const item=Spicetify.Player.data?.item||Spicetify.Platform.PlayerAPI?._state?.item,m=item?.metadata||{},key=[item?.uri,m.album_uri,m.title].join('|');if(key===lastUri)return;lastUri=key;
    renderTrack(card);
    const image=card.querySelector('img')?.getAttribute('src')||'';
    const cover=image.startsWith('spotify:image:')?'https://i.scdn.co/image/'+image.slice(14):image;
    if(/^https:\/\/i\.scdn\.co\/image\/[a-zA-Z0-9]+$/.test(cover))current.style.setProperty('--rp-lyrics-cover','url("'+cover+'")');else current.style.removeProperty('--rp-lyrics-cover');
    const info=card.querySelector('.rp-now-info');if(!info)return;
    const album=document.createElement('p');album.className='rp-listening-album';album.textContent=m.album_title||'Album unavailable';const year=document.createElement('p');year.className='rp-listening-year';year.textContent='';info.append(album,year);
    if(m.album_uri?.startsWith('spotify:album:'))yearFor(m.album_uri).then(value=>{if(!disposed&&lastUri===key&&year.isConnected)year.textContent=value||'Release year unavailable';});
  }
  function update(){
    const button=document.querySelector('.Root__top-container > .WDGCR4wjBcw7jSoDr1ei button[aria-label="Show artwork"]');let surface=button;const root=document.querySelector('.Root__top-container');while(surface?.parentElement&&surface.parentElement!==root)surface=surface.parentElement;
    const path=Spicetify.Platform.History.location.pathname,owner=compat.owner(document,path,surface);
    const state=compat.policy(getSettings().lyricsIntegration,owner,!!button||!!owner||/lyrics/i.test(path));
    external=state.external;
    if(state.external){if(current)leave();document.documentElement.dataset.retrogradeExternalLyrics='true';document.documentElement.dataset.retrogradeLyricsOwner=state.owner||'custom';return;}
    delete document.documentElement.dataset.retrogradeExternalLyrics;delete document.documentElement.dataset.retrogradeLyricsOwner;
    if(!button||surface?.parentElement!==root){if(current)leave();return;}
    if(surface!==current){leave();current=surface;current.dataset.rpMediaRoot='';const header=button.closest('.XsSWx3aR_OYA3GMIEk7S');if(header)header.dataset.rpMediaHeader='';card=document.createElement('section');card.className='rp-listening-info';card.setAttribute('aria-label','Current track information');current.append(card);
      const controls=button.closest('[role="radiogroup"]');offMode=new MutationObserver(schedule);if(controls)offMode.observe(controls,{attributes:true,subtree:true,attributeFilter:['aria-checked']});
      const left=document.querySelector('#Desktop_LeftSidebar_Id');offRail=new MutationObserver(schedule);if(left)offRail.observe(left,{attributes:true,attributeFilter:['inert']});if(left&&!left.querySelector('.main-yourLibraryX-headerIsCollapsed')){left.querySelector('button[aria-label="Collapse Your Library"]')?.click();collapsedByUs=true;}
    }
    // Cinema normally makes its offscreen library inert. Here it remains a real,
    // interactive rail. Leave modal dialog focus isolation alone.
    const left=document.querySelector('#Desktop_LeftSidebar_Id');if(left?.inert&&!document.querySelector('dialog[open]'))left.inert=false;
    const queue=!!document.querySelector('#Desktop_PanelContainer_Id #queue-panel');
    data(current,'rpMediaQueue',String(queue));data(document.documentElement,'retrogradeMediaQueue',String(queue));
    const artistMode=current.querySelector('[role="radio"][value="hero"][aria-checked="true"]');if(artistMode)current.querySelector('[role="radio"][value="lyrics"]')?.click();
    const mode=current.querySelector('[role="radio"][aria-checked="true"]')?.getAttribute('value')||'lyrics';data(current,'rpMediaMode',mode);data(document.documentElement,'retrogradeMedia',mode);data(current,'rpInfoSide',getSettings().lyricsInfoSide);metadata();karaoke.update(mode==='artwork'?null:current);readings.update(current);effects.update(mode==='artwork'?null:current);
    if(!transport)transport=createRetrogradeListeningControls({onPreferences});transport.mount(card);
    if(!fullscreen)fullscreen=createRetrogradeFullscreen({onChange:()=>transport?.update(),onError:message=>Spicetify.showNotification?.(message)});fullscreen.mount(current.querySelector('[data-rp-media-header]'));
  }
  return {update,importTiming:input=>karaoke.importTiming(input),clearTiming:()=>karaoke.clearTiming(),isOpen:()=>external||!!current?.isConnected,dispose(){disposed=true;changes.disconnect();leave();readings.dispose();effects.dispose();karaoke.dispose();delete document.documentElement.dataset.retrogradeExternalLyrics;delete document.documentElement.dataset.retrogradeLyricsOwner;}};
}


