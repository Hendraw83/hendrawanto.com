import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { harden } from './security-policy.mjs';
export const CATEGORIES = {audit:['Audit','Audit'],accounting:['Akuntansi','Accounting'],tax:['Pajak','Tax'],'state-finance':['Keuangan Negara','Public Finance'],investigative:['Investigatif','Investigative'],governance:['Tata Kelola','Governance'],finance:['Keuangan','Finance']};
const escape = value => String(value).replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
const base = 'https://hendrawanto.com';
export function gitHash(content) {const data=Buffer.from(content);return createHash('sha1').update(Buffer.concat([Buffer.from('blob '+data.length+'\0'),data])).digest('hex');}
function meta(html, key, value, property=false) {
  const attr=property?'property':'name';
  const re=new RegExp('<meta '+attr+'="'+key.replace(/[.*+?^$()|[\]\\]/g,'\\$&')+'"[^>]*>','i');
  const tag='<meta '+attr+'="'+key+'" content="'+escape(value)+'">';
  return re.test(html)?html.replace(re,()=>tag):html.replace('</head>',()=>tag+'\n</head>');
}
function link(html,rel,href) {
  const re=new RegExp('<link rel="'+rel+'"[^>]*>','ig');
  const tag='<link rel="'+rel+'" href="'+escape(href)+'">';
  return re.test(html)?html.replace(re,()=>tag):html.replace('</head>',()=>tag+'\n</head>');
}
export function publicImages(html, assets) {
  return html.replace(/\/api\/media\/([a-f0-9-]{36})/g,(all,id)=>{
    if(!assets[id]||!/^assets\/articles\/[a-f0-9-]{36}\.(jpg|png|webp|gif)$/.test(assets[id]))throw Error('Missing approved media: '+id);
    return '/'+assets[id];
  });
}
function dateString(value,lang) {return new Date(value).toLocaleDateString(lang==='id'?'id-ID':'en-US',{timeZone:'Asia/Jakarta',day:'numeric',month:'long',year:'numeric'});}
function dateISO(value) {return new Date(value).toISOString();}
export function articlePage(shell,d,lang,assets={},now=new Date().toISOString()) {
  if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(d.slug)||!CATEGORIES[d.category])throw Error('Invalid article address/category');
  const c=d[lang],url=base+'/'+(lang==='en'?'en/':'')+'artikel/'+d.slug+'/',cat=CATEGORIES[d.category][lang==='id'?0:1];
  const published=dateISO(d.publishedAt||now),modified=dateISO(now),title=c.seoTitle||c.title;
  let html=shell;
  if (!html.includes('href="/cms-article.css"')) html=html.replace('</head>','<link rel="stylesheet" href="/cms-article.css">\n</head>');
  html=html.replace(/<title>[\s\S]*?<\/title>/i,()=>'<title>'+escape(title)+'</title>');
  html=meta(html,'description',c.seoDescription);html=meta(html,'og:title',title,true);html=meta(html,'og:description',c.seoDescription,true);
  html=meta(html,'og:url',url,true);html=meta(html,'robots',d.noindex?'noindex, follow':'index, follow, max-image-preview:large');
  html=link(html,'canonical',url);
  html=html.replace(/<link rel="alternate" hreflang="(?:id|en|x-default)"[^>]*>\s*/g,'');
  const locales=['id',...(d.en.title.trim()?['en']:[])];
  const hreflang=locales.map(l=>'<link rel="alternate" hreflang="'+l+'" href="'+base+'/'+(l==='en'?'en/':'')+'artikel/'+d.slug+'/">').join('\n');
  html=html.replace('</head>',()=>hreflang+'\n<link rel="alternate" hreflang="x-default" href="'+base+'/artikel/'+d.slug+'/">\n</head>');
  const image=d.cover?publicImages(d.cover,assets):'/assets/hendrawanto.jpg';
  html=meta(html,'og:image',base+image,true);
  html=html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g,'');
  const graph={'@context':'https://schema.org','@graph':[
    {'@type':'Article','@id':url+'#article',headline:c.title,description:c.seoDescription,inLanguage:lang==='id'?'id-ID':'en-US',datePublished:published,dateModified:modified,
      author:{'@type':'Person','@id':base+'/#person',name:'Hendrawanto',url:base+'/tentang/'},publisher:{'@id':base+'/#person'},mainEntityOfPage:url,image:base+image,
      ...(lang==='en'?{translationOfWork:{'@id':base+'/artikel/'+d.slug+'/#article'}}:{})},
    {'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:lang==='id'?'Beranda':'Home',item:base+'/'},{'@type':'ListItem',position:2,name:lang==='id'?'Artikel':'Articles',item:base+'/'+(lang==='en'?'en/':'')+'artikel/'},{'@type':'ListItem',position:3,name:c.title,item:url}]}
  ]};
  html=html.replace('</head>',()=>'<script type="application/ld+json">'+JSON.stringify(graph).replace(/</g,'\\u003c')+'</script>\n</head>');
  html=html.replace(/<h1\b[^>]*>[\s\S]*?<\/h1>/,()=>'<h1 id="art-title" class="page-title">'+escape(c.title)+'</h1>');
  html=html.replace(/<p class="eyebrow">[\s\S]*?<\/p>/,()=>'<p class="eyebrow">'+(lang==='id'?'ARTIKEL':'ARTICLE')+' · '+escape(cat.toUpperCase())+'</p>');
  html=html.replace(/(<nav class="svc-crumb"[\s\S]*?<span aria-hidden="true">\/<\/span> <span>)[^<]+(<\/span><\/nav>)/,(_,a,b)=>a+escape(cat)+b);
  const author='<p class="art-meta">'+(lang==='id'?'Oleh':'By')+' <a href="'+(lang==='en'?'/en':'')+'/tentang/">Hendrawanto</a> · <time datetime="'+published+'">'+dateString(published,lang)+'</time></p>';
  const cover=d.cover?'<figure><img src="'+escape(image)+'" alt="'+escape(c.imageAlt)+'" width="1200" loading="lazy" decoding="async"></figure>':'';
  const body=publicImages(c.body,assets);
  html=html.replace(/<article class="svc-body">[\s\S]*?<\/article>/,()=>'<article class="svc-body">\n'+author+'\n'+cover+'\n'+body+'\n</article>');
  html=html.replace(/(<div class="lang-switch"[\s\S]*?<\/div>)/,()=>{
    return '<div class="lang-switch" role="group" aria-label="Language">'+locales.map(l=>'<a href="/'+(l==='en'?'en/':'')+'artikel/'+d.slug+'/" hreflang="'+l+'" lang="'+l+'"'+(lang===l?' aria-current="true"':'')+'>'+l.toUpperCase()+'</a>').join('')+'</div>';
  });
  return html;
}
export function upsertCard(html,d,lang) {
  const c=d[lang];if(!c.title.trim())return html;
  const path='/'+(lang==='en'?'en/':'')+'artikel/'+d.slug+'/',published=dateISO(d.publishedAt);
  const card='<article class="news-card"><div class="news-meta"><span class="news-source">'+escape(CATEGORIES[d.category][lang==='id'?0:1].toUpperCase())+'</span><time datetime="'+published+'">'+dateString(published,lang)+'</time></div><h2 class="svc-hub-title"><a href="'+path+'">'+escape(c.title)+'</a></h2><p>'+escape(c.excerpt)+'</p><a class="text-link" href="'+path+'">'+(lang==='id'?'Baca Artikel':'Read Article')+' →</a></article>';
  let found=false;
  html=html.replace(/<article class="news-card">[\s\S]*?<\/article>/g,old=>{if(old.includes('href="'+path+'"')){found=true;return card;}return old;});
  if(!found)html=html.replace('<div class="news-list">',()=>'<div class="news-list">\n'+card+'\n');
  if(!html.includes('href="'+path+'"'))throw Error('Listing structure changed; stop and review.');
  return html;
}
export function upsertSitemap(xml,d,date) {
  const urls=['artikel/'+d.slug+'/',...(d.en.title.trim()?['en/artikel/'+d.slug+'/']:[])];
  for(const path of urls) {
    const url=base+'/'+path;let found=false;
    xml=xml.replace(/<url>[\s\S]*?<\/url>/g,old=>{
      if(!old.includes('<loc>'+url+'</loc>'))return old;
      found=true;if(d.noindex)return '';
      return /<lastmod>/.test(old)?old.replace(/<lastmod>[^<]*<\/lastmod>/,()=>'<lastmod>'+date+'</lastmod>'):old.replace('</url>','<lastmod>'+date+'</lastmod></url>');
    });
    if(!found&&!d.noindex)xml=xml.replace('</urlset>',()=>'<url><loc>'+url+'</loc><lastmod>'+date+'</lastmod></url>\n</urlset>');
  }
  return xml;
}
export function preparePublication(root,job,assets={},tree={},now=new Date().toISOString()) {
  if(job.dueAt>Date.now())throw Error('Future job cannot be published.');
  const d=job.content,paths=['artikel/'+d.slug+'/index.html',...(d.en.title.trim()?['en/artikel/'+d.slug+'/index.html']:[])];
  if (job.expectedHashes['en/artikel/'+d.slug+'/index.html'] && !d.en.title.trim()) throw Error('An existing English version must be retained.');
  for(const path of paths)if((tree[path]||null)!==(job.expectedHashes[path]||null))throw Error('CONFLICT: '+path);
  const output={};
  for(const lang of ['id',...(d.en.title.trim()?['en']:[])]) {
    const path=(lang==='en'?'en/':'')+'artikel/'+d.slug+'/index.html';
    const fallback=(lang==='en'?'en/':'')+'artikel/memahami-opini-audit/index.html';
    const shell=readFileSync(resolve(root,existsSync(resolve(root,path))?path:fallback),'utf8');
    let html=articlePage(shell,d,lang,assets,now);
    html=harden(html,path);output[path]=html;
    const list=(lang==='en'?'en/':'')+'artikel/index.html';
    output[list]=harden(upsertCard(readFileSync(resolve(root,list),'utf8'),d,lang),list);
  }
  const date=now.slice(0,10);
  output['sitemap.xml']=upsertSitemap(readFileSync(resolve(root,'sitemap.xml'),'utf8'),d,date);
  if(existsSync(resolve(root,'llms.txt'))){
    let llms=readFileSync(resolve(root,'llms.txt'),'utf8');
    const url=base+'/artikel/'+d.slug+'/';
    const entry='- ['+d.id.title.replace(/[\[\]\r\n]/g,'')+']('+url+'): '+d.id.excerpt.replace(/[\r\n]/g,' ');
    if(llms.includes(']('+url+')'))llms=llms.replace(new RegExp('^- \\[[^\\n]+\\]\\('+url.replace(/[.*+?^$()|[\]\\]/g,'\\$&')+'\\)[^\\n]*','m'),()=>entry);
    else llms+='\n'+entry+'\n';
    output['llms.txt']=llms;
  }
  const manifestPath='data/cms-published/'+job.articleId+'.json';
  if(!/^data\/cms-published\/[a-zA-Z0-9-]+\.json$/.test(manifestPath))throw Error('Invalid article ID');
  output[manifestPath]=JSON.stringify({jobId:job.id,revision:job.revision,slug:d.slug,publishedAt:now,files:Object.fromEntries(paths.map(p=>[p,gitHash(output[p])]))},null,2)+'\n';
  return output;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  let input='';for await(const chunk of process.stdin)input+=chunk;
  const {root,job,assets,tree,now,write}=JSON.parse(input);
  const output=preparePublication(root,job,assets,tree,now);
  if(write)for(const [path,content]of Object.entries(output)){mkdirSync(dirname(resolve(root,path)),{recursive:true});writeFileSync(resolve(root,path),content);}
  process.stdout.write(JSON.stringify({files:output,hashes:Object.fromEntries(Object.entries(output).filter(([p])=>/^(en\/)?artikel\/[^/]+\/index.html$/.test(p)).map(([p,c])=>[p,gitHash(c)]))})+'\n');
}
