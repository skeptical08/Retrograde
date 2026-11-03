import fs from 'node:fs/promises';
import {romanizationEngines} from './romanization-engines.mjs';
const out=new URL('../dist/Retrograde/',import.meta.url);
await fs.mkdir(out,{recursive:true});
for(const name of ['user.css','color.ini']) await fs.copyFile(new URL('../src/'+name,import.meta.url),new URL(name,out));
const code=await Promise.all(['preferences.js','runtime.js','romanization.js','lyrics-compat.js','fullscreen.js','listening-controls.js','lyric-effects.js','karaoke-data.js','karaoke.js','lyrics.js','features.js','chrome.js','theme.js'].map(n=>fs.readFile(new URL('../src/'+n,import.meta.url),'utf8')));
const logo='data:image/png;base64,'+(await fs.readFile(new URL('../src/spotify-classic.png',import.meta.url))).toString('base64');
await fs.writeFile(new URL('theme.js',out),`/* Retrograde 1.0 — generated from src/ */\n(()=>{\nconst RetrogradeLogo=${JSON.stringify(logo)};\n${await romanizationEngines()}${code.join('\n')}\n})();\n`);
console.log('Built dist/Retrograde');



