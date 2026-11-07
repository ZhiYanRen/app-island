import {cp,mkdir,readFile,writeFile,rm,access,readdir,stat} from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import sharp from 'sharp';
import {validateCatalog} from '../public/catalog.js';
const root=new URL('../',import.meta.url);
const projects=validateCatalog(JSON.parse(await readFile(new URL('public/projects.json',root),'utf8')));
for(const project of projects) await access(new URL(`public/${project.icon.slice(2)}`,root));
const digest=createHash('sha256');
for(const file of (await readdir(new URL('public/',root),{recursive:true})).sort()){
 const url=new URL('public/'+file,root);if((await stat(url)).isFile())digest.update(file).update(await readFile(url));
}
const version=digest.digest('hex').slice(0,12);
const dist=new URL('dist/',root);await rm(dist,{recursive:true,force:true});await mkdir(dist,{recursive:true});await cp(new URL('public/',root),dist,{recursive:true});
for(const [name,size] of [['icon-192.png',192],['icon-512.png',512],['apple-touch-icon.png',180]]) await sharp(new URL('public/assets/logo.svg',root).pathname).resize(size,size).png().toFile(new URL(`assets/${name}`,dist).pathname);
const html=await readFile(new URL('index.html',dist),'utf8');
await writeFile(new URL('index.html',dist),html.replace(/((?:src|href)=")(.\/[^"?]+\.(?:js|css|svg|png|webmanifest))(")/g,(_,prefix,url,suffix)=>`${prefix}${url}?v=${version}${suffix}`));
const app=await readFile(new URL('app.js',dist),'utf8');await writeFile(new URL('app.js',dist),app.replace("from './catalog.js'",`from './catalog.js?v=${version}'`));
const manifest=JSON.parse(await readFile(new URL('manifest.webmanifest',dist),'utf8'));for(const icon of manifest.icons)icon.src+=`?v=${version}`;await writeFile(new URL('manifest.webmanifest',dist),JSON.stringify(manifest,null,2)+'\n');
await writeFile(new URL('.nojekyll',dist),'');
console.log(`Built ${projects.length} projects into ${path.basename(dist.pathname.slice(0,-1))}/`);
