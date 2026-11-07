import test from 'node:test';
import assert from 'node:assert/strict';
import {validateCatalog, selectProjects} from '../public/catalog.js';
const item = {id:'garden',name:'拼音小花园',description:'听写与复习',category:'学习',icon:'./assets/projects/garden.svg',status:'published',url:'https://zhiyanren.github.io/pinyin-garden-pages/'};
test('published entries require an actual HTTPS Pages URL',()=>{
 assert.deepEqual(validateCatalog([item]),[item]);
 for(const url of [null,'javascript:alert(1)','http://zhiyanren.github.io/demo/','https://example.com/','https://user@zhiyanren.github.io/demo/','https://zhiyanren.github.io/demo/?secret=x']) assert.throws(()=>validateCatalog([{...item,url}]));
});
test('pending projects have no clickable URL and identifiers are unique',()=>{
 assert.doesNotThrow(()=>validateCatalog([{...item,status:'pending',url:null}]));
 assert.throws(()=>validateCatalog([{...item,status:'pending'}]));
 assert.throws(()=>validateCatalog([item,item]));
 assert.throws(()=>validateCatalog([{...item,icon:'../../secret.svg'}]));
 assert.throws(()=>validateCatalog([{...item,status:'unknown'}]));
});
test('search and favorites compose without changing the catalog',()=>{
 const other={...item,id:'island',name:'应用岛',category:'工具',description:'所有项目的入口'};
 const input=[item,other];
 assert.deepEqual(selectProjects(input,{query:'  听写  '}),[item]);
 assert.deepEqual(selectProjects(input,{query:'工具'}),[other]);
 assert.deepEqual(selectProjects(input,{favoritesOnly:true,favorites:['island']}),[other]);
 assert.deepEqual(selectProjects(input,{query:'拼音',favoritesOnly:true,favorites:['island']}),[]);
 assert.equal(input.length,2);
});
test('the navigation catalog never includes App Island itself',()=>{
 assert.throws(()=>validateCatalog([{...item,id:'app-island',name:'应用岛'}]),/自身/);
});
