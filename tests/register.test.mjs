import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,copyFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';

test('registration creates pending entries and never mutates files on failed publication verification',async()=>{
 const root=await mkdtemp(path.join(tmpdir(),'app-island-registration-'));
 try {
  for(const dir of ['scripts','public/assets/projects'])await mkdir(path.join(root,dir),{recursive:true});
  await writeFile(path.join(root,'package.json'),'{"type":"module"}');
  for(const file of ['scripts/register-project.mjs','public/catalog.js'])await copyFile(new URL('../'+file,import.meta.url),path.join(root,file));
  const catalog=path.join(root,'public/projects.json'),source=path.join(root,'original.svg');
  await writeFile(catalog,'[]\n');await writeFile(source,'<svg xmlns="http://www.w3.org/2000/svg"><title>original</title></svg>');
  const run=(args,env={})=>spawnSync(process.execPath,['--import',path.join(root,'network.mjs'),path.join(root,'scripts/register-project.mjs'),...args],{cwd:root,encoding:'utf8',env:{...process.env,...env}});
  await writeFile(path.join(root,'network.mjs'),`globalThis.fetch=async()=>{if(process.env.RESPONSE==='network')throw Error('offline');return new Response(process.env.RESPONSE==='plain'?'not html':'<html></html>',{status:process.env.RESPONSE==='failure'?503:200,headers:{'Content-Type':process.env.RESPONSE==='plain'?'text/plain':'text/html'}});};`);
  let result=run(['--id','new-project','--name','新项目','--description','测试用途','--category','工具','--icon',source]);assert.equal(result.status,0,result.stderr);
  let data=JSON.parse(await readFile(catalog,'utf8'));assert.equal(data[0].status,'pending');assert.equal(data[0].url,null);
  const icon=path.join(root,'public/assets/projects/new-project.svg'),beforeCatalog=await readFile(catalog,'utf8'),beforeIcon=await readFile(icon,'utf8');
  await writeFile(source,'<svg xmlns="http://www.w3.org/2000/svg"><title>changed</title></svg>');
  for(const RESPONSE of ['failure','plain','network']){
   result=run(['--id','new-project','--url','https://owner.github.io/project/','--icon',source],{RESPONSE});
   assert.notEqual(result.status,0,RESPONSE+' must refuse activation');assert.equal(await readFile(catalog,'utf8'),beforeCatalog);assert.equal(await readFile(icon,'utf8'),beforeIcon);
  }
  result=run(['--id','new-project','--url','javascript:alert(1)']);assert.notEqual(result.status,0);assert.equal(await readFile(catalog,'utf8'),beforeCatalog);
  result=run(['--id','new-project','--url','https://owner.github.io/project/','--icon',source]);assert.equal(result.status,0,result.stderr);
  data=JSON.parse(await readFile(catalog,'utf8'));assert.equal(data.length,1);assert.equal(data[0].status,'published');assert.equal(data[0].url,'https://owner.github.io/project/');assert.equal(await readFile(icon,'utf8'),await readFile(source,'utf8'));
 } finally {await rm(root,{recursive:true,force:true});}
});
