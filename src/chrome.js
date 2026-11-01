/* Native Windows compatibility verified on Spotify 1.3.6. These private
   DesktopWindowState/UpdateUI methods are isolated here; failures restore native
   caption buttons. Xumi was consulted for endpoint semantics, not copied. */
function createRetrogradeChrome({getSettings,onPreferences}) {
  const abort=new AbortController(),timers=new Set();let wrap,menuButton,popup,popupAbort,hidden=false,disposed=false,starting=false;
  const windowClient=()=>Spicetify.Platform?.FocusMainWindowAPI?._windowStateClient;
  const uiClient=()=>Spicetify.Platform?.ControlMessageAPI?._updateUiClient;
  const delay=(fn,ms)=>{const id=setTimeout(()=>{timers.delete(id);if(!disposed)fn();},ms);timers.add(id);};
  const safeNative=async show=>{const ui=uiClient();if(!ui)return;await ui.updateTitlebarHeight({height:show?64:1});await ui.setButtonsVisibility({showButtons:show});hidden=!show;};
  function closeMenu(){popupAbort?.abort();popupAbort=null;popup?.remove();popup=null;menuButton?.setAttribute('aria-expanded','false');}
  function actionButton(label,fn){const b=document.createElement('button');b.type='button';b.textContent=label;b.setAttribute('role','menuitem');b.addEventListener('click',()=>{closeMenu();fn();},{signal:popupAbort.signal});return b;}
  function openMenu(){
    if(popup){closeMenu();return;}popupAbort=new AbortController();popup=document.createElement('div');popup.className='rp-application-menu';popup.setAttribute('role','menu');popup.setAttribute('aria-label','Retrograde menu');
    const history=Spicetify.Platform.History;
    for(const[label,fn]of[['Home',()=>history.push('/')],['Search',()=>history.push('/search')],['Your Library',()=>history.push('/collection')],['Queue',()=>document.querySelector('[data-testid="control-button-queue"]')?.click()],['Lyrics',()=>document.querySelector('[data-testid="lyrics-button"]')?.click()],['Preferences…',onPreferences],['Spotify settings…',()=>history.push('/preferences')]])popup.append(actionButton(label,fn));
    popup.addEventListener('keydown',e=>{const items=[...popup.querySelectorAll('button')],i=items.indexOf(document.activeElement);if(e.key==='Escape'){closeMenu();menuButton.focus();}else if(['ArrowDown','ArrowUp','Home','End'].includes(e.key)){e.preventDefault();items[e.key==='Home'?0:e.key==='End'?items.length-1:(i+(e.key==='ArrowDown'?1:-1)+items.length)%items.length].focus();}});
    document.body.append(popup);menuButton.setAttribute('aria-expanded','true');popup.firstElementChild.focus();
  }
  document.addEventListener('pointerdown',e=>{if(popup&&!popup.contains(e.target)&&!menuButton.contains(e.target))closeMenu();},{signal:abort.signal});
  async function restore(){closeMenu();wrap?.remove();menuButton?.remove();wrap=menuButton=null;delete document.documentElement.dataset.retrogradeChrome;if(hidden)try{await safeNative(true);}catch(e){console.warn('[Retrograde] Native caption restore failed',e);}}
  async function run(kind){const c=windowClient();try{if(kind==='minimize')await c.setWindowState({state:3});if(kind==='maximize'){const cur=await c.getWindowState({});await c.setWindowState({state:cur.state===2?1:2});await reflect();}if(kind==='close')await c.closeWindow({});}catch(e){console.warn('[Retrograde] Caption control failed; restoring native controls',e);await restore();}}
  async function reflect(){if(!wrap)return;try{const state=await windowClient().getWindowState({}),b=wrap.querySelector('[data-action="maximize"]');const max=state.state===2;b.setAttribute('aria-label',max?'Restore window':'Maximize window');b.title=b.getAttribute('aria-label');b.textContent=max?'❐':'□';}catch{}}
  async function update(){
    if(disposed||starting)return;
    if(!getSettings().windowControls){await restore();return;}
    if(wrap?.isConnected)return;
    const nav=document.querySelector('.Root__globalNav'),c=windowClient(),ui=uiClient();
    if(!nav||!c?.getWindowState||!c.setWindowState||!c.closeWindow||!ui?.setButtonsVisibility||!ui.updateTitlebarHeight)return;
    starting=true;
    try{
      await c.getWindowState({});if(disposed)return;
      wrap=document.createElement('div');wrap.className='rp-window-controls';wrap.setAttribute('aria-label','Window controls');
      for(const[kind,label,text]of[['minimize','Minimize window','−'],['maximize','Maximize window','□'],['close','Close window','×']]){const b=document.createElement('button');b.type='button';b.dataset.action=kind;b.setAttribute('aria-label',label);b.title=label;b.textContent=text;b.addEventListener('click',()=>run(kind),{signal:abort.signal});wrap.append(b);}
      menuButton=document.createElement('button');menuButton.type='button';menuButton.className='rp-application-menu-button';menuButton.textContent='•••';menuButton.setAttribute('aria-label','Retrograde menu');menuButton.setAttribute('aria-haspopup','menu');menuButton.setAttribute('aria-expanded','false');menuButton.addEventListener('click',openMenu,{signal:abort.signal});
      nav.append(wrap,menuButton);await safeNative(false);if(disposed){await restore();return;}document.documentElement.dataset.retrogradeChrome='true';await reflect();
      // Spotify may reset its native hit-test strip during startup. Bounded retries.
      for(const ms of [800,2000,5000])delay(()=>{if(getSettings().windowControls&&wrap?.isConnected)safeNative(false).catch(()=>restore());},ms);
    }catch(e){console.warn('[Retrograde] Native caption API unavailable',e);await restore();}finally{starting=false;}
  }
  window.addEventListener('resize',reflect,{signal:abort.signal});
  return{update,dispose(){disposed=true;abort.abort();for(const t of timers)clearTimeout(t);restore();}};
}
