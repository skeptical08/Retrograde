/* Retrograde preferences: deliberately independent of Spotify account settings. */
const RetrogradePreferences = (() => {
  const defaults = Object.freeze({version:1,accent:'#a4cc35',sidebar:'#414141',menu:'#424242',main:'#303030',player:'#505050',text:'#eeeeee',secondary:'#c2c2c2',selection:'#526c82',hover:'#505050',density:'compact',fontSize:13,relief:'subtle',motion:true,trackArtwork:false,playerArtworkDock:true,leftWidth:300,rightWidth:360,libraryStyle:'classic',windowControls:true,lyricsSize:20,lyricsInfoSide:'left',chrome:'#a0a0a0',libraryIcons:true,libraryArtwork:false,playerHeight:56,playerTextSize:14,lyricsBackground:true,lyricsBlur:48,lyricsFade:18,lyricsRomanization:true,lyricsReadingLanguage:'auto',lyricsIntegration:'auto',lyricsActiveColor:'#ffffff',lyricsEffect:'glow',lyricsFocus:true,lyricsAlignment:'center',lyricsProvider:'native',artworkBackground:true,lyricsCoverArtwork:true,artworkCoverArtwork:true});
  const colorKeys=['accent','sidebar','menu','main','player','text','secondary','selection','hover','chrome'];
  const presets={
    'Classic Green':{...defaults},
    'Arctic Blue':{...defaults,accent:'#80c3ee',selection:'#345b76',sidebar:'#353c43',menu:'#3a434c',main:'#272d33',player:'#424c56'},
    'Amber Studio':{...defaults,accent:'#efbd66',selection:'#705a3c',sidebar:'#423e38',menu:'#48423b',main:'#302d28',player:'#544d43'},
    'Graphite':{...defaults,accent:'#d0d5da',selection:'#626971',sidebar:'#3a3c40',menu:'#3e4146',main:'#292b2f',player:'#494c52'},
    'Midnight Cobalt':{...defaults,accent:'#78aaff',selection:'#354f70',sidebar:'#293342',menu:'#303d4d',main:'#202936',player:'#3b4a5e',hover:'#405169'},
    'Evergreen':{...defaults,accent:'#8fc49b',selection:'#3c5c49',sidebar:'#303c35',menu:'#39483f',main:'#242d28',player:'#425348',hover:'#465c4d'},
    'Plum':{...defaults,accent:'#c9a4df',selection:'#594464',sidebar:'#3c3342',menu:'#463b4e',main:'#2e2733',player:'#53465d',hover:'#594b63'},
    'Oxide':{...defaults,accent:'#e8a08c',selection:'#70483e',sidebar:'#423633',menu:'#4c3e39',main:'#302724',player:'#594740',hover:'#604d47'},
    'Sandstone':{...defaults,accent:'#d9c591',selection:'#645b42',sidebar:'#3d3b33',menu:'#49463b',main:'#2c2b25',player:'#565245',hover:'#59564a'},
    'High Contrast':{...defaults,accent:'#b4eb44',sidebar:'#181818',menu:'#202020',main:'#101010',player:'#252525',text:'#ffffff',secondary:'#dddddd',selection:'#345574',hover:'#414141'}
  };
  // Every preset defines every color, preventing previous palette leakage.
  const chromeTints={'Classic Green':'#a0a0a0','Arctic Blue':'#91a5b6','Amber Studio':'#b1a18a','Graphite':'#92979f','Midnight Cobalt':'#7c91af','Evergreen':'#8ba695','Plum':'#a18aaf','Oxide':'#b19488','Sandstone':'#ada58b','High Contrast':'#a4a4a4'};
  for(const [name,preset]of Object.entries(presets))preset.chrome=chromeTints[name];
  Object.assign(presets,{
    'Ocean Teal':{...defaults,accent:'#65d3ce',sidebar:'#293e40',menu:'#31484a',main:'#203033',player:'#3c5659',selection:'#326368',hover:'#405c60',chrome:'#83a6a8'},
    'Rosewood':{...defaults,accent:'#efa5b4',sidebar:'#44343c',menu:'#4e3d46',main:'#30252b',player:'#5c4652',selection:'#754657',hover:'#654953',chrome:'#b197a2'},
    'Lavender Night':{...defaults,accent:'#b8b1ff',sidebar:'#353449',menu:'#403e55',main:'#262535',player:'#4a4863',selection:'#57527e',hover:'#514e6a',chrome:'#9995b5'},
    'Espresso':{...defaults,accent:'#dfb98f',sidebar:'#3c3029',menu:'#493a30',main:'#29221d',player:'#574436',selection:'#6b513d',hover:'#604b3b',chrome:'#a79585'},
    'Slate Mint':{...defaults,accent:'#9ce2bd',sidebar:'#344344',menu:'#3b4c4e',main:'#283334',player:'#475c5e',selection:'#406857',hover:'#4d6261',chrome:'#99aeaa'},
    'Crimson Radio':{...defaults,accent:'#fa9393',sidebar:'#3e3033',menu:'#49383c',main:'#2b2225',player:'#564147',selection:'#70434b',hover:'#60464c',chrome:'#ac9096'},
    'Paper & Ink':{...defaults,accent:'#315d32',sidebar:'#d4d3c8',menu:'#e2e0d6',main:'#eeeae0',player:'#c7c6bb',text:'#262720',secondary:'#53554a',selection:'#b7c9ae',hover:'#d7ddcc',chrome:'#c3c6b8'},
    'Terminal':{...defaults,accent:'#92ee86',sidebar:'#202c25',menu:'#28392e',main:'#162019',player:'#314638',text:'#e1f3dc',secondary:'#adc6a9',selection:'#365a3c',hover:'#354c39',chrome:'#81957e'}
  });
  function sanitize(input){
    if(!input || typeof input!=='object' || input.version!==1) return {...defaults};
    const out={...defaults};
    if(typeof input.lyricsActiveColor==='string'&&/^#[0-9a-f]{6}$/i.test(input.lyricsActiveColor))out.lyricsActiveColor=input.lyricsActiveColor.toLowerCase();
    for(const k of colorKeys) if(typeof input[k]==='string' && /^#[0-9a-f]{6}$/i.test(input[k])) out[k]=input[k].toLowerCase();
    if(['compact','comfortable'].includes(input.density)) out.density=input.density;
    if(['subtle','strong'].includes(input.relief)) out.relief=input.relief;
    if(typeof input.fontSize==='number' && Number.isFinite(input.fontSize)) out.fontSize=Math.min(16,Math.max(11,Math.round(input.fontSize)));
    if(typeof input.motion==='boolean') out.motion=input.motion;
    if(typeof input.trackArtwork==='boolean') out.trackArtwork=input.trackArtwork;
    if(typeof input.playerArtworkDock==='boolean') out.playerArtworkDock=input.playerArtworkDock;
    for(const k of ['lyricsFocus','artworkBackground','lyricsCoverArtwork','artworkCoverArtwork','libraryIcons','libraryArtwork','lyricsBackground','lyricsRomanization'])if(typeof input[k]==='boolean')out[k]=input[k];
    for(const [k,min,max]of [['playerHeight',48,72],['playerTextSize',12,18],['lyricsBlur',20,80],['lyricsFade',0,40]])if(typeof input[k]==='number'&&Number.isFinite(input[k]))out[k]=Math.round(Math.min(max,Math.max(min,input[k])));
    if(typeof input.windowControls==='boolean') out.windowControls=input.windowControls;
    if(['center','left'].includes(input.lyricsAlignment))out.lyricsAlignment=input.lyricsAlignment;
    if(['native','spicy'].includes(input.lyricsProvider))out.lyricsProvider=input.lyricsProvider;
    if(['none','glow','pulse','wave'].includes(input.lyricsEffect))out.lyricsEffect=input.lyricsEffect;
    if(['auto','native','extension'].includes(input.lyricsIntegration))out.lyricsIntegration=input.lyricsIntegration;
    if(['auto','ja','zh'].includes(input.lyricsReadingLanguage))out.lyricsReadingLanguage=input.lyricsReadingLanguage;
    if(['left','right'].includes(input.lyricsInfoSide))out.lyricsInfoSide=input.lyricsInfoSide;
    if(['classic','artwork'].includes(input.libraryStyle))out.libraryStyle=input.libraryStyle;
    if(typeof input.lyricsSize==='number'&&Number.isFinite(input.lyricsSize))out.lyricsSize=Math.round(Math.min(28,Math.max(16,input.lyricsSize)));
    for(const [key,min] of [['leftWidth',200],['rightWidth',240]]) if(typeof input[key]==='number'&&Number.isFinite(input[key]))out[key]=Math.round(Math.min(640,Math.max(min,input[key])));
    return out;
  }
  function fitWidths(viewport,left,right){
    left=Math.max(200,Math.min(640,left));right=Math.max(240,Math.min(640,right));
    const budget=Math.max(440,viewport-320),excess=Math.max(0,left+right-budget),room=left+right-440;
    if(excess&&room){const ratio=Math.max(0,(room-excess)/room);left=200+(left-200)*ratio;right=240+(right-240)*ratio;}
    return {left:Math.round(left),right:Math.round(right)};
  }
  function luminance(hex){const rgb=hex.slice(1).match(/../g).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;}
  function applyPreset(settings,preset){const next={...settings};for(const k of colorKeys)next[k]=preset[k];return sanitize(next);}
  function contrast(a,b){const l=[luminance(a),luminance(b)].sort((a,b)=>b-a);return(l[0]+.05)/(l[1]+.05);}
  return {defaults,colorKeys,presets,sanitize,contrast,fitWidths,applyPreset};
})();

