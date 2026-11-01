/* Native media layout, isolated to Spotify 1.3.6's main-window media surface.
   Lyrics/provider/line seeking remain native; no text is copied or fetched. */
function createRetrogradeLyrics({getSettings,renderTrack,schedule}) {
  let current,card,collapsedByUs=false,lastUri='',disposed=false,offMode,offRail;
  const years=new Map();
  const data=(e,key,value)=>{if(e.dataset[key]!==value)e.dataset[key]=value;};
  function restoreLibrary(){if(collapsedByUs){const left=document.querySelector('#Desktop_LeftSidebar_Id');if(left?.querySelector('.main-yourLibraryX-headerIsCollapsed'))left.querySelector('button[aria-label="Open Your Library"],button[aria-label="Expand Your Library"]')?.click();collapsedByUs=false;}}
  function leave(){offRail?.disconnect();offRail=null;offMode?.disconnect();offMode=null;card?.remove();card=null;if(current){delete current.dataset.rpMediaRoot;delete current.dataset.rpMediaMode;}current=null;lastUri='';delete document.documentElement.dataset.retrogradeMedia;delete document.documentElement.dataset.retrogradeMediaQueue;restoreLibrary();}
  function yearFor(uri){if(years.has(uri))return years.get(uri);const definition=Spicetify.GraphQL?.Definitions?.getAlbum;if(!definition)return Promise.resolve('');const promise=Spicetify.GraphQL.Request(definition,{uri,locale:'en',offset:0,limit:1}).then(r=>/^\d{4}/.exec(r.data?.albumUnion?.date?.isoString||'')?.[0]||'').catch(()=> '');if(years.size>=50)years.delete(years.keys().next().value);years.set(uri,promise);return promise;}
  function metadata(){
    const item=Spicetify.Player.data?.item||Spicetify.Platform.PlayerAPI?._state?.item,m=item?.metadata||{},key=[item?.uri,m.album_uri,m.title].join('|');if(key===lastUri)return;lastUri=key;
    renderTrack(card);const info=card.querySelector('.rp-now-info');if(!info)return;
    const album=document.createElement('p');album.className='rp-listening-album';album.textContent=m.album_title||'Album unavailable';const year=document.createElement('p');year.className='rp-listening-year';year.textContent='';info.append(album,year);
    if(m.album_uri?.startsWith('spotify:album:'))yearFor(m.album_uri).then(value=>{if(!disposed&&lastUri===key&&year.isConnected)year.textContent=value||'Release year unavailable';});
  }
  function update(){
    const button=document.querySelector('.Root__top-container > .WDGCR4wjBcw7jSoDr1ei button[aria-label="Show artwork"]');let surface=button;const root=document.querySelector('.Root__top-container');while(surface?.parentElement&&surface.parentElement!==root)surface=surface.parentElement;
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
    const mode=current.querySelector('[role="radio"][aria-checked="true"]')?.getAttribute('value')||'lyrics';data(current,'rpMediaMode',mode);data(document.documentElement,'retrogradeMedia',mode);data(current,'rpInfoSide',getSettings().lyricsInfoSide);metadata();
  }
  return {update,dispose(){disposed=true;leave();}};
}


