/* Merge independent theme work into one animation frame; never run a timer loop. */
function createRetrogradeFrameQueue(run,request=fn=>requestAnimationFrame(fn),cancel=id=>cancelAnimationFrame(id)) {
  let pending=0,frame=0,disposed=false;
  return {
    add(flags){if(disposed||!flags)return;pending|=flags;if(!frame)frame=request(()=>{frame=0;const work=pending;pending=0;if(!disposed)run(work);});},
    dispose(){disposed=true;pending=0;if(frame)cancel(frame);frame=0;}
  };
}
/* Marketplace replaces its injected stylesheet when changing/removing a theme.
   Observe only that stylesheet and its parent child list, never Spotify's tree. */
function createRetrogradeMarketplaceLifecycle({script,document,onDeactivate,Observer=MutationObserver}) {
  if(!script?.classList.contains('marketplaceScript'))return{dispose(){}};
  const sheet=[...document.querySelectorAll('style.marketplaceUserCSS')].find(e=>e.textContent.includes('Retrograde — an original'));
  if(!sheet?.parentElement)return{dispose(){}};
  let stopped=false;
  const observer=new Observer(()=>{if(stopped)return;if(!sheet.isConnected||!sheet.textContent.includes('Retrograde — an original')){stopped=true;observer.disconnect();onDeactivate();}});
  observer.observe(sheet.parentElement,{childList:true});
  observer.observe(sheet,{childList:true,characterData:true,subtree:true});
  return{dispose(){stopped=true;observer.disconnect();}};
}
