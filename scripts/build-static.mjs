import {mkdir,copyFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const root=new URL('../cloudflare-app/',import.meta.url);
await mkdir(new URL('dist/',root),{recursive:true});
for(const file of ['index.html','styles.css','app.mjs','core.mjs']) await copyFile(new URL(file,root),new URL('dist/'+file,root));
console.log('Static output: '+fileURLToPath(new URL('dist/',root)));
