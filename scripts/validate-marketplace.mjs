import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import path from 'node:path';

const root=path.resolve(import.meta.dirname,'..');
const manifest=JSON.parse(await fs.readFile(path.join(root,'manifest.json'),'utf8'));
for(const key of ['name','description','preview','readme','usercss','schemes'])assert.equal(typeof manifest[key],'string',`Missing ${key}`);
assert.equal(manifest.name,'Retrograde');
for(const key of ['preview','readme','usercss','schemes']){
  const target=path.resolve(root,manifest[key]);
  assert.ok(target.startsWith(root+path.sep),`${key} must remain inside the repository`);
  assert.ok((await fs.stat(target)).isFile(),`${key} file missing`);
}
const png=await fs.readFile(path.join(root,manifest.preview));
assert.equal(png.subarray(0,8).toString('hex'),'89504e470d0a1a0a','Preview must be PNG');
assert.ok(png.readUInt32BE(16)>=800&&png.readUInt32BE(20)>=450,'Preview is too small');
assert.equal(manifest.include?.length,1,'Companion script is required');
const url=new URL(manifest.include[0]);
assert.equal(url.origin,'https://skeptical08.github.io');
assert.equal(url.pathname,'/Retrograde/dist/Retrograde/theme.js');
await fs.access(path.join(root,'dist/Retrograde/theme.js'));
const css=await fs.readFile(path.join(root,manifest.usercss),'utf8');
assert.ok(css.includes('Retrograde — an original'),'Marketplace cleanup CSS marker missing');
const bundle=await fs.readFile(path.join(root,'dist/Retrograde/theme.js'),'utf8');
assert.ok(bundle.includes('Retrograde 1.0')&&bundle.includes('createRetrogradeMarketplaceLifecycle'));
for(const file of ['README.md','manifest.json','docs/DEVELOPMENT.md','docs/PERFORMANCE.md','docs/THIRD_PARTY.md','docs/MARKETPLACE.md']){
  const text=await fs.readFile(path.join(root,file),'utf8');
  assert.ok(!/C:[\\/]|AppData|YOUR_USERNAME|gh[pousr]_[A-Za-z0-9]{20}/i.test(text),`Private path or placeholder in ${file}`);
}
console.log('Marketplace manifest, local assets, companion URL and public documentation validated. Hosted delivery still requires a separate live check.');
