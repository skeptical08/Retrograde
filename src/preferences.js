/* Retrograde preferences: deliberately independent of Spotify account settings. */
const RetrogradePreferences = (() => {
  const defaults = Object.freeze({version:1,accent:'#a4cc35',sidebar:'#414141',menu:'#424242',main:'#303030',player:'#505050',text:'#eeeeee',secondary:'#c2c2c2',selection:'#526c82',hover:'#505050',density:'compact',fontSize:13,relief:'subtle',motion:true,trackArtwork:false,leftWidth:300,rightWidth:360,libraryStyle:'classic',windowControls:true,lyricsSize:20,lyricsInfoSide:'left'});
  const colorKeys=['accent','sidebar','menu','main','player','text','secondary','selection','hover'];
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
  function sanitize(input){
    if(!input || typeof input!=='object' || input.version!==1) return {...defaults};
    const out={...defaults};
    for(const k of colorKeys) if(typeof input[k]==='string' && /^#[0-9a-f]{6}$/i.test(input[k])) out[k]=input[k].toLowerCase();
    if(['compact','comfortable'].includes(input.density)) out.density=input.density;
    if(['subtle','strong'].includes(input.relief)) out.relief=input.relief;
    if(typeof input.fontSize==='number' && Number.isFinite(input.fontSize)) out.fontSize=Math.min(16,Math.max(11,Math.round(input.fontSize)));
    if(typeof input.motion==='boolean') out.motion=input.motion;
    if(typeof input.trackArtwork==='boolean') out.trackArtwork=input.trackArtwork;
    if(typeof input.windowControls==='boolean') out.windowControls=input.windowControls;
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

