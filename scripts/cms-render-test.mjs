import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { articlePage, preparePublication, upsertCard, upsertSitemap, gitHash, publicImages } from './cms-render.mjs';
import { resolve } from 'node:path';
const root=resolve(new URL('..',import.meta.url).pathname);
const entity=s=>s.replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&lt;/g,'<').replace(/&gt;/g,'>');
const pick=(s,re)=>entity(s.match(re)?.[1]||'');
const seed=readdirSync(resolve(root,'artikel'),{withFileTypes:true}).filter(d=>d.isDirectory()).map(dir=>{
 const slug=dir.name,hashes={},content={slug,category:'audit',cover:'',publishedAt:'2026-10-02',noindex:false};
 for(const lang of ['id','en']){
  const path=(lang==='en'?'en/':'')+'artikel/'+slug+'/index.html';
  if(!existsSync(resolve(root,path))){content[lang]={title:'',excerpt:'',body:'',seoTitle:'',seoDescription:'',imageAlt:''};continue;}
  const raw=readFileSync(resolve(root,path),'utf8');hashes[path]=gitHash(raw);
  const title=pick(raw,/<h1[^>]*>([\s\S]*?)<\/h1>/),description=pick(raw,/<meta name="description" content="([^"]*)"/);
  content[lang]={title,excerpt:description,body:raw.match(/<article class="svc-body">([\s\S]*?)<\/article>/)[1].replace(/<p class="art-meta">[\s\S]*?<\/p>/,''),seoTitle:pick(raw,/<title>([\s\S]*?)<\/title>/),seoDescription:description,imageAlt:''};
 }
 return {id:'existing-'+slug,content,hashes};
});
const source=seed.find(x=>x.content.slug==='memahami-opini-audit');
const job={id:'test-job',articleId:'test-article',revision:1,dueAt:0,expectedHashes:{},content:{...source.content,slug:'contoh-artikel-cms'}};
const shell=readFileSync(resolve(root,'artikel/memahami-opini-audit/index.html'),'utf8');
const output=preparePublication(root,job,{},{});assert.equal(Object.keys(output).length,7);
const id=output['artikel/contoh-artikel-cms/index.html'],en=output['en/artikel/contoh-artikel-cms/index.html'];
assert(id.includes('https://hendrawanto.com/artikel/contoh-artikel-cms/'));
assert(en.includes('https://hendrawanto.com/en/artikel/contoh-artikel-cms/'));
assert(id.includes('hreflang="en"')&&en.includes('hreflang="id"'));
assert(id.includes('Integritas. Objektivitas. Transparan.')&&id.includes('6287790487353'));
assert(id.includes('Content-Security-Policy')&&id.includes('integrity="sha384-'));
assert(id.includes('href="/cms-article.css" integrity="sha384-'));
const jsonld=JSON.parse(id.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
assert.equal(jsonld['@graph'][0].headline,job.content.id.title);
assert.equal(jsonld['@graph'][0].mainEntityOfPage,'https://hendrawanto.com/artikel/contoh-artikel-cms/');
assert(output['artikel/index.html'].includes('href="/artikel/contoh-artikel-cms/"'));
assert(output['sitemap.xml'].includes('<loc>https://hendrawanto.com/artikel/contoh-artikel-cms/</loc>'));
assert(output['llms.txt'].includes('](https://hendrawanto.com/artikel/contoh-artikel-cms/)'));
assert.throws(()=>preparePublication(root,job,{}, {'artikel/contoh-artikel-cms/index.html':'another-version'}),/CONFLICT/);
assert.throws(()=>preparePublication(root,{...job,dueAt:Date.now()+100000}, {},{}),/Future/);
const list=readFileSync(resolve(root,'artikel/index.html'),'utf8');
const up=upsertCard(list,source.content,'id');assert.equal((up.match(/class="news-card"/g)||[]).length,(list.match(/class="news-card"/g)||[]).length);
const one=structuredClone(job.content);one.en.title='';one.en.body='';
const oneHtml=articlePage(shell,one,'id');assert(!oneHtml.includes('hreflang="en"'));
assert.throws(()=>preparePublication(root,{...job,content:one,expectedHashes:{'en/artikel/contoh-artikel-cms/index.html':'a'.repeat(40)}},{},{}),/English version/);
one.noindex=true;assert(!upsertSitemap(output['sitemap.xml'],one,'2026-10-09').includes('<loc>https://hendrawanto.com/artikel/contoh-artikel-cms/</loc>'));
const img='11111111-1111-4111-8111-111111111111';
assert.equal(publicImages('/api/media/'+img,{[img]:'assets/articles/'+img+'.png'}),'/assets/articles/'+img+'.png');
assert.throws(()=>publicImages('/api/media/'+img,{}),/Missing/);
assert.equal(gitHash('hello\n'),'ce013625030ba8dba906f756967f9e9ca394464a');
const safe=structuredClone(job.content);safe.id.title='Judul </script> & "quoted"';safe.id.seoTitle=safe.id.title;
const safeHtml=articlePage(shell,safe,'id');assert(safeHtml.includes('Judul &lt;/script&gt; &amp; &quot;quoted&quot;'));assert(!safeHtml.includes('"headline":"Judul </script>'));
for(const item of seed){
  const tree=item.hashes;
  const files=preparePublication(root,{id:'test',articleId:item.id,revision:1,dueAt:0,expectedHashes:tree,content:item.content},{},tree);
  for(const lang of ['id','en'].filter(lang=>item.content[lang].title&&item.content[lang].body)){
    const html=files[(lang==='en'?'en/':'')+'artikel/'+item.content.slug+'/index.html'];
    assert(html.includes('<h1 id="art-title" class="page-title">'));
    assert.equal((html.match(/<article class="svc-body">/g)||[]).length,1);
  }
}
console.log(JSON.stringify({result:'PASS',articles:seed.length,scope:'existing templates, new article, canonical/hreflang/JSON-LD, cards, sitemap, llms, CSP/SRI, conflicts, future jobs, escaping, approved media'}));
