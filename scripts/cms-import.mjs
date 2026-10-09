import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { gitHash } from './cms-render.mjs';
const entity=s=>s.replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&#(\d+);/g,(_,v)=>String.fromCodePoint(Number(v)));
const text=s=>entity(s.replace(/<[^>]+>/g,'')).trim();
const pick=(s,re)=>s.match(re)?.[1]||'';
export function importArticle(root,slug,tree,sourceCommit) {
  if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))throw Error('Invalid slug');
  const content={slug,category:'audit',cover:'',publishedAt:'',noindex:false},hashes={};
  for(const lang of ['id','en']){
    const path=(lang==='en'?'en/':'')+'artikel/'+slug+'/index.html';
    if(!tree[path]){if(lang==='en'){content.en={title:'',excerpt:'',body:'',seoTitle:'',seoDescription:'',imageAlt:''};continue;}throw Error('Missing Indonesian public article');}
    const raw=readFileSync(resolve(root,path),'utf8');
    const body=pick(raw,/<article class="svc-body">([\s\S]*?)<\/article>/).replace(/<p class="art-meta">[\s\S]*?<\/p>/,'');
    if(!body)throw Error('Article structure changed; stop and review: '+path);
    const title=text(pick(raw,/<h1[^>]*>([\s\S]*?)<\/h1>/)),description=entity(pick(raw,/<meta name="description" content="([^"]*)"/));
    content[lang]={title,excerpt:description,body,seoTitle:text(pick(raw,/<title>([\s\S]*?)<\/title>/)),seoDescription:description,imageAlt:''};
    hashes[path]=tree[path];
    if(lang==='id'){
      const cat=text(pick(raw,/<p class="eyebrow">([\s\S]*?)<\/p>/)).toLowerCase();
      content.category=/akuntansi|accounting/.test(cat)?'accounting':/pajak|tax/.test(cat)?'tax':/keuangan negara|public finance/.test(cat)?'state-finance':/investigat/.test(cat)?'investigative':/tata kelola|governance/.test(cat)?'governance':/keuangan|finance/.test(cat)?'finance':'audit';
      content.publishedAt=pick(raw,/<time datetime="([^"]+)"/)||'2026-10-02';
      content.noindex=/<meta name="robots" content="[^"]*noindex/.test(raw);
    }
  }
  return {content,hashes,sourceCommit};
}
if(process.argv[1]&&resolve(process.argv[1])===new URL(import.meta.url).pathname){
  let raw='';for await(const c of process.stdin)raw+=c;
  const {root,tree,sourceCommit}=JSON.parse(raw);
  const slugs=Object.keys(tree).filter(p=>/^artikel\/[^/]+\/index.html$/.test(p)).map(p=>p.split('/')[1]);
  const articles=slugs.map(slug=>importArticle(root,slug,tree,sourceCommit));
  process.stdout.write(JSON.stringify({articles})+'\n');
}
