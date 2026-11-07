import {validateCatalog,selectProjects} from './catalog.js';
const $=s=>document.querySelector(s);
const storageKey='app-island-favorites-v1';
let projects=[],favorites=[],view='all',storageAvailable=true;
try {const saved=JSON.parse(localStorage.getItem(storageKey)||'[]');if(Array.isArray(saved)) favorites=saved.filter(x=>typeof x==='string');} catch {storageAvailable=false;}
const star='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.8 5.7 6.3.9-4.5 4.4 1 6.2-5.6-3-5.6 3 1-6.2L3 9.6l6.2-.9Z"/></svg>';
function notice(message){$('#notice').textContent=message;$('#notice').hidden=false;}
function render(){
 const query=$('#search').value;
 const results=selectProjects(projects,{query,favoritesOnly:view==='favorites',favorites});
 $('#nav-count').textContent=projects.length;$('#favorite-count').textContent=projects.filter(p=>favorites.includes(p.id)).length;
 $('#result-count').textContent=`${results.length} 个应用`;$('#clear-search').hidden=!query;
 $('#grid').replaceChildren();$('#grid').setAttribute('aria-busy','false');
 $('#empty').hidden=results.length>0;
 $('#empty-title').textContent=view==='favorites'&&!query?'把喜欢的应用，留在这里':'还没有找到这个小世界';
 $('#empty-description').textContent=view==='favorites'&&!query?'轻点卡片上的星标，收藏你常用的应用。':'换个名称或关键词试试。';
 for(const p of results){
  const card=document.createElement('article');card.className='app-card';card.dataset.project=p.id;
  const link=document.createElement(p.status==='published'?'a':'div');link.className='app-link';
  if(p.status==='published'){link.href=p.url;link.target='_blank';link.rel='noopener noreferrer';link.setAttribute('aria-label',`打开${p.name}（新窗口）`);} else {link.setAttribute('aria-disabled','true');}
  const top=document.createElement('div');top.className='card-top';
  const icon=document.createElement('img');icon.src=p.icon;icon.alt='';icon.width=80;icon.height=80;icon.className='project-icon';
  icon.addEventListener('error',()=>{icon.hidden=true;const fallback=document.createElement('span');fallback.className='icon-fallback';fallback.textContent=p.name.slice(0,1);top.prepend(fallback);},{once:true});
  const tag=document.createElement('span');tag.className='category-tag';tag.textContent=p.category;top.append(icon,tag);
  const name=document.createElement('h3');name.textContent=p.name;
  const description=document.createElement('p');description.className='card-description';description.textContent=p.description;
  const foot=document.createElement('div');foot.className='card-foot';
  const state=document.createElement('span');state.className=p.status==='published'?'published':'pending';state.textContent=p.status==='published'?'已上线':'准备中';
  const action=document.createElement('span');action.className='open-label';action.textContent=p.status==='published'?'打开应用 ↗':'敬请期待';foot.append(state,action);
  link.append(top,name,description,foot);
  const favorite=document.createElement('button');favorite.className='favorite-button';favorite.innerHTML=star;favorite.setAttribute('aria-label',`${favorites.includes(p.id)?'取消收藏':'收藏'}${p.name}`);favorite.setAttribute('aria-pressed',String(favorites.includes(p.id)));
  favorite.addEventListener('click',()=>{
   const isFavorite=favorites.includes(p.id);favorites=isFavorite?favorites.filter(id=>id!==p.id):[...favorites,p.id];
   try {localStorage.setItem(storageKey,JSON.stringify(favorites));}catch {storageAvailable=false;}
   if(!storageAvailable)notice('浏览器无法保存收藏；本次打开期间仍可使用。');
   render();const button=$(`[data-project="${p.id}"] .favorite-button`);(button||$('[data-view="favorites"]')).focus({preventScroll:true});
  });card.append(link,favorite);$('#grid').append(card);
 }
}
async function load(){
 $('#error').hidden=true;$('#empty').hidden=true;$('#grid').setAttribute('aria-busy','true');$('#grid').textContent='正在载入你的应用…';
 try {const response=await fetch(new URL('./projects.json',import.meta.url),{cache:'no-cache'});if(!response.ok)throw Error('目录加载失败');projects=validateCatalog(await response.json());render();}
 catch {$('#grid').replaceChildren();$('#grid').setAttribute('aria-busy','false');$('#error').hidden=false;$('#result-count').textContent='暂未载入';}
}
for(const button of document.querySelectorAll('[data-view]'))button.addEventListener('click',()=>{
 view=button.dataset.view;
 for(const nav of document.querySelectorAll('[data-view]')){nav.classList.toggle('selected',nav===button);if(nav===button)nav.setAttribute('aria-current','page');else nav.removeAttribute('aria-current');}
 const label=view==='all'?'全部应用':'我的收藏';$('#breadcrumb').textContent=label;$('#section-title').textContent=label;$('#page-title').replaceChildren(document.createTextNode(view==='all'?'我的应用':'我的收藏'));
 if(!$('#error').hidden)return;render();
});
$('#search').addEventListener('input',()=>{if($('#error').hidden)render();});
$('#clear-search').addEventListener('click',()=>{$('#search').value='';$('#search').focus();render();});
$('#empty-reset').addEventListener('click',()=>{$('#search').value='';$('[data-view="all"]').click();$('#search').focus();});
$('#retry').addEventListener('click',load);
document.addEventListener('keydown',event=>{if((event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==='k'){event.preventDefault();$('#search').focus();}});
load();
