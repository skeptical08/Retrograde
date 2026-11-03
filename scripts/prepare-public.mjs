import fs from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const out=path.join(root,'work/Retrograde-1.0-marketplace');
await fs.mkdir(out,{recursive:true});
for(const item of ['src','scripts','tests','.github','README.md','LICENSE','package.json','manifest.json','preview.png','CHANGELOG.md','.gitattributes','.gitignore','.nojekyll']){
  await fs.cp(path.join(root,item),path.join(out,item),{recursive:true});
}
await fs.mkdir(path.join(out,'dist'),{recursive:true});
await fs.cp(path.join(root,'dist/Retrograde'),path.join(out,'dist/Retrograde'),{recursive:true});
await fs.mkdir(path.join(out,'docs'),{recursive:true});
await fs.cp(path.join(root,'docs/gallery'),path.join(out,'docs/gallery'),{recursive:true});
for(const item of ['DEVELOPMENT.md','PERFORMANCE.md','THIRD_PARTY.md','MARKETPLACE.md','PLAYER-REFINEMENT.md','READABILITY-REFINEMENT.md','ROMANIZATION-LICENSES.md','LYRICS-VERIFICATION.md','LYRICS-EXTENSIONS.md','RETROGRADE-LYRICS.md','KARAOKE-SETUP.md','PROVIDER-TEMPLATE-DRAFT.md','Throwback-LICENSE.txt']){
  await fs.copyFile(path.join(root,'docs',item),path.join(out,'docs',item));
}
console.log(`Prepared public repository at ${out}`);
