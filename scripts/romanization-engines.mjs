import fs from 'node:fs/promises';
// Pinned, checked-in browser builds: no runtime remote script execution.
export async function romanizationEngines(){
 const entries=[];
 for(const name of ['korean','pinyin','kuroshiro','analyzer']){
  let code=await fs.readFile(new URL('../src/vendor/'+name+'.js',import.meta.url),'utf8');
  if(name==='analyzer'){
   const from='o.open("GET",r,!0)';
   if(code.split(from).length!==2)throw new Error('Kuromoji loader patch no longer matches the pinned build');
   // path.join in the bundled browser loader collapses https:// to https:/.
   // Repair only this library's dictionary URL, never global XMLHttpRequest.
   code=code.replace('o.responseType="arraybuffer",','o.timeout=30000,o.ontimeout=function(){e(new Error("Dictionary request timed out"),null)},o.responseType="arraybuffer",');
   code=code.replace(from,'o.open("GET",r.replace(/^https:\\/(?!\\/)/,"https://"),!0)');
  }
  code=code.replace(/^\/\/[#@] sourceMappingURL=.*$/gm,'');
  const guard=name==='korean'?'const AROMANIZE_EXTEND_STRING=false,document=undefined,process=undefined;':'';
  entries.push(JSON.stringify(name)+':()=>{const module={exports:{}},exports=module.exports;'+guard+'\n'+code+'\nreturn module.exports;}');
 }
 return 'const RetrogradeRomanizationEngines=(()=>{const factories={'+entries.join(',')+'},cache={};return {get(name){return cache[name]||(cache[name]=factories[name]());}};})();\n';
}
