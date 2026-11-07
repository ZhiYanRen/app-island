export function validateCatalog(projects) {
 if (!Array.isArray(projects)) throw new Error('项目目录必须是数组');
 const ids=new Set();
 for (const p of projects) {
  if (!p || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.id) || ids.has(p.id)) throw new Error('项目标识缺失或重复');
  if(p.id==='app-island') throw new Error('导航目录不收录应用岛自身');
  ids.add(p.id);
  for (const key of ['name','description','category']) if (typeof p[key]!=='string'||!p[key].trim()) throw new Error(`项目缺少 ${key}`);
  if (!/^\.\/assets\/[a-zA-Z0-9/_-]+\.(svg|png|webp)$/.test(p.icon)) throw new Error('图标必须是本站静态资源');
  if (!['pending','published'].includes(p.status)) throw new Error('未知发布状态');
  if (p.status==='pending') { if (p.url!==null) throw new Error('未发布项目不能配置可点击网址'); }
  else {
   let url;try {url=new URL(p.url);} catch {throw new Error('缺少正式网址');}
   if (url.protocol!=='https:'||!url.hostname.endsWith('.github.io')||url.username||url.password||url.port||url.search||url.hash||!url.pathname.endsWith('/')) throw new Error('必须使用正式 HTTPS GitHub Pages 网址');
  }
 }
 return projects;
}
export function selectProjects(projects,{query='',favoritesOnly=false,favorites=[]}={}) {
 const term=query.trim().toLocaleLowerCase('zh-CN');
 return projects.filter(p=>(!favoritesOnly||favorites.includes(p.id))&&[p.name,p.description,p.category].join(' ').toLocaleLowerCase('zh-CN').includes(term));
}
