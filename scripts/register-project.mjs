import {parseArgs} from 'node:util';
import {readFile,writeFile,rename,copyFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {validateCatalog} from '../public/catalog.js';
const {values}=parseArgs({options:Object.fromEntries(['id','name','description','category','icon','url'].map(key=>[key,{type:'string'}]).concat([['help',{type:'boolean'}]]))});
if(values.help){console.log('node scripts/register-project.mjs --id slug --name 名称 --description 简介 --category 分类 --icon /absolute/logo.svg [--url https://owner.github.io/repo/]\n无 --url 时登记为准备中；提供时实际核验正式网址后启用。更新已有条目可仅提供 --id 和变更字段。');process.exit(0);}
if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(values.id||''))throw Error('需要合法 --id');
const root=new URL('../public/',import.meta.url),file=new URL('projects.json',root);
const projects=JSON.parse(await readFile(file,'utf8')),previous=projects.find(p=>p.id===values.id),next={...previous,id:values.id};
for(const key of ['name','description','category'])if(values[key])next[key]=values[key];
if(!previous){next.status='pending';next.url=null;}
if(values.icon){const ext=path.extname(values.icon).toLowerCase();if(!['.svg','.png','.webp'].includes(ext))throw Error('图标仅支持 svg/png/webp');next.icon=`./assets/projects/${values.id}${ext}`;}
if(values.url){next.url=values.url;next.status='published';}
const updated=previous?projects.map(p=>p.id===next.id?next:p):[...projects,next];validateCatalog(updated);
if(values.url){const response=await fetch(values.url,{signal:AbortSignal.timeout(20000),redirect:'error'});if(!response.ok||!response.headers.get('content-type')?.includes('text/html'))throw Error('正式地址尚不可访问或不是 HTML，未修改目录');await response.body?.cancel();}
if(values.icon){await mkdir(new URL('assets/projects/',root),{recursive:true});await copyFile(path.resolve(values.icon),new URL(next.icon.slice(2),root));}
const temp=new URL('projects.json.tmp',root);await writeFile(temp,JSON.stringify(updated,null,2)+'\n');await rename(temp,file);
console.log(`${next.name}：${next.status==='published'?'已验证并启用 '+next.url:'准备中，暂未启用入口'}`);
