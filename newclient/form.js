(function(){
"use strict";
const BIDANG=["Perdagangan dan Jasa","Industri Pengolahan/Manufaktur","Industri Lainnya","Properti dan Konstruksi","Pertambangan dan Energi","Pertanian, Perkebunan, Kehutanan, Peternakan, Kelautan dan Perikanan","Informasi, Komunikasi dan Transportasi","Sektor Keuangan - Asuransi dan Dana Pensiun","Sektor Keuangan - Lainnya","Pemerintahan, Badan Internasional dan Organisasi Non Profit"];
const STANDAR=["SAK","SAK ETAP","SAK EP","SAP","Standar Akuntansi Lainnya"];
const KEPEMILIKAN=["Swasta","BUMD","Sektor Publik","Koperasi","Yayasan"];
const MODE=(window.KAPSHS_MODE||"");
const TUJUAN=["Pajak","Bank / Kredit","Internal","OJK","Lainnya"];
const STATUS={
  baru:{label:"Formulir diterima",tone:"info",klien:"Formulir diterima, sedang ditinjau",c:"#6B8FC9"},
  partner:{label:"Menunggu Partner",tone:"warn",klien:"Sedang ditinjau",c:"#D99A2B"},
  revisi:{label:"Revisi diminta",tone:"warn",klien:"Sedang ditinjau",c:"#B77B1C"},
  disetujui:{label:"Disetujui Partner",tone:"ok",klien:"Proposal sedang disiapkan",c:"#3AA876"},
  proposal:{label:"Proposal dikirim",tone:"info",klien:"Proposal telah dikirim",c:"#1F6FB4"},
  negosiasi:{label:"Negosiasi",tone:"info",klien:"Dalam pembahasan",c:"#1E2A6E"},
  deal:{label:"Kontrak ditandatangani",tone:"ok",klien:"Kontrak ditandatangani",c:"#1C7A4E"},
  batal:{label:"Tidak berlanjut",tone:"bad",klien:"Tidak berlanjut",c:"#B01E35"}
};
const NEXT={baru:["partner","batal"],revisi:["partner","batal"],partner:[],disetujui:["proposal","batal"],proposal:["negosiasi","deal","batal"],negosiasi:["deal","batal"],deal:[],batal:["baru"]};
const DEF_SET={inggris:10,bilingual:15,auditPertama:10,deadlineKetat:15,hariKetat:30,ojk:10,feeMin:10000000,pembulatan:500000};

const S={token:null,me:null,records:[],hist:[],set:{...DEF_SET},urlPublik:"",urlSheet:"",
  tab:null,sel:null,selP:null,filt:"aktif",q:"",bulan:ym(new Date()),hq:"",hb:"",confirm:null,lapUrl:{}};
function api(fn,...args){return new Promise((res,rej)=>google.script.run.withSuccessHandler(res).withFailureHandler(rej)[fn](...args))}
function errMsg(e){const m=String((e&&e.message)||e||"Terjadi kesalahan");return m.replace(/^(Exception|Error):\s*/,"").replace(/^SESI:\s*/,"")}
function isSesi(e){return /SESI:/.test(String((e&&e.message)||e))}
function load(d){S.me=d.me;S.records=d.records||[];S.hist=d.hist||[];S.set=Object.assign({},DEF_SET,d.set||{});S.urlPublik=d.urlPublik||"";S.urlSheet=d.urlSheet||""}
function keluar(msg){try{localStorage.removeItem("shs_tok")}catch(_){}S.token=null;S.me=null;S.force=true;render();if(msg)toast(msg)}
async function aksi(req){try{const d=await api("aksi",S.token,req);load(d);S.force=true;render();return d}
  catch(e){if(isSesi(e)){keluar("Sesi berakhir, silakan masuk lagi");throw e}toast(errMsg(e));throw e}}

/* ---------- utils ---------- */
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
const nf=new Intl.NumberFormat("id-ID");
function rp(n){return (n==null||isNaN(n))?"–":"Rp "+nf.format(Math.round(n))}
function rpS(n){if(n==null||isNaN(n))return "–";const a=Math.abs(n);if(a>=1e12)return "Rp "+(n/1e12).toLocaleString("id-ID",{maximumFractionDigits:2})+" T";if(a>=1e9)return "Rp "+(n/1e9).toLocaleString("id-ID",{maximumFractionDigits:1})+" M";if(a>=1e6)return "Rp "+(n/1e6).toLocaleString("id-ID",{maximumFractionDigits:1})+" jt";return rp(n)}
function ym(d){return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")}
function tgl(ts){if(!ts)return "–";return new Date(ts).toLocaleDateString("id-ID",{day:"numeric",month:"short",year:"numeric"})}
function tglJam(ts){if(!ts)return "–";return new Date(ts).toLocaleString("id-ID",{day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"})}
function blnLabel(k){const [y,m]=k.split("-");return new Date(+y,+m-1,1).toLocaleDateString("id-ID",{month:"long",year:"numeric"})}
function digits(s){const d=String(s||"").replace(/[^\d]/g,"");return d?Number(d):0}
function pill(st){const s=STATUS[st]||STATUS.baru;return `<span class="pill t-${s.tone}">${esc(s.label)}</span>`}
function toast(t){const el=document.getElementById("toast");el.textContent=t;el.hidden=false;clearTimeout(toast._t);toast._t=setTimeout(()=>el.hidden=true,3200)}
function newId(){const d=new Date();return "NC"+String(d.getFullYear()).slice(2)+String(d.getMonth()+1).padStart(2,"0")+"-"+Math.random().toString(36).slice(2,6).toUpperCase()}
function daysBetween(a,b){return Math.round((new Date(b).setHours(0,0,0,0)-new Date(a).setHours(0,0,0,0))/864e5)}
/* "31 Desember 2025" + 3 tahun -> "3 tahun buku: 31 Desember 2023, 2024 dan 2025" */
function periodeTeks(f){const n=Math.max(1,Number(f.jumlahTahun)||1);const s=String(f.tahunBuku||"");if(n===1)return s;
  const m=s.match(/(\d{4})\s*$/);if(!m)return s+" ("+n+" tahun buku)";const th=+m[1],pre=s.slice(0,m.index).trim(),ys=[];
  for(let y=th-n+1;y<=th;y++)ys.push(y);return n+" tahun buku: "+(pre?pre+" ":"")+ys.slice(0,-1).join(", ")+" dan "+ys[ys.length-1]}
function nameOf(n){return n||"Tim KAP"}
function resolveNames(){}
function isPartner(){return S.me&&S.me.peran==="Partner"}

/* ---------- fee engine ---------- */
function wq(items,q){const s=[...items].sort((a,b)=>a.fee-b.fee);const tot=s.reduce((a,b)=>a+b.w,0);let acc=0;for(const it of s){acc+=it.w;if(acc>=q*tot-1e-9)return it.fee}return s[s.length-1].fee}
function pool(){const p=S.hist.slice();for(const r of allRecords()){if(r.st==="deal"&&r.p.feeDisetujui>0){const f=r.f;p.push([f.namaPT+" (deal "+(f.tahunBuku||"")+")",0,f.bidang,f.standar||"",f.kepemilikan||"",f.konsolidasi||"",+f.omset||0,+f.aset||0,r.p.feeDisetujui])}}return p}
/* Persentase fee historis per kelompok ukuran (rata-rata 50% data tengah: tanpa 25% teratas & 25% terbawah),
   diperhalus antar kelompok secara log-log agar fee tidak melompat di batas kelompok. */
const BANDS=[[0,1e9,"< Rp1 M"],[1e9,5e9,"Rp1–5 M"],[5e9,25e9,"Rp5–25 M"],[25e9,100e9,"Rp25–100 M"],[100e9,500e9,"Rp100–500 M"],[500e9,Infinity,"> Rp500 M"]];
const METODE={gabungan:"Gabungan: rata-rata persentase historis & 8 klien pembanding",persentase:"Persentase historis (omset & aset) saja",pembanding:"Median 8 klien pembanding saja"};
function tmean(a){const s=[...a].sort((x,y)=>x-y);const k=Math.floor(s.length*0.25);const t=s.slice(k,s.length-k);return t.reduce((p,c)=>p+c,0)/t.length}
function qs(s,p){return s[Math.floor((s.length-1)*p)]}
let _pc=null,_pcKey="";
function persenTabel(){const P=pool();const key=P.length+":"+P.reduce((s,h)=>s+(+h[8]||0),0);if(_pc&&_pcKey===key)return _pc;
  const mk=idx=>BANDS.map(([lo,hi,label])=>{const m=P.filter(h=>h[idx]>lo&&h[idx]<=hi&&h[8]>0);const r=m.map(h=>h[8]/h[idx]).sort((a,b)=>a-b);const xs=m.map(h=>Math.log(h[idx])).sort((a,b)=>a-b);
    return {label,lo,hi,n:r.length,avg:r.length?tmean(r):null,p25:r.length?qs(r,.25):null,p75:r.length?qs(r,.75):null,x:r.length?qs(xs,.5):null}});
  _pc={omset:mk(6),aset:mk(7)};_pcKey=key;return _pc}
function interp(bands,v,fld){const B=bands.filter(b=>b.n>=3&&b[fld]>0);if(!B.length)return null;const x=Math.log(v);
  if(x<=B[0].x)return B[0][fld];if(x>=B[B.length-1].x)return B[B.length-1][fld];
  for(let i=0;i<B.length-1;i++){const a=B[i],b=B[i+1];if(x>=a.x&&x<=b.x){const t=(x-a.x)/(b.x-a.x);return Math.exp(Math.log(a[fld])+t*(Math.log(b[fld])-Math.log(a[fld])))}}return null}
function feePersen(f){const T=persenTabel();const parts=[];
  for(const k of ["omset","aset"]){const v=+f[k]||0;if(!(v>0))continue;const pct=interp(T[k],v,"avg");if(pct==null)continue;
    const b=T[k].find(x=>v>x.lo&&v<=x.hi);parts.push({dasar:k,nilai:v,pct,fee:v*pct,lo:v*(interp(T[k],v,"p25")||pct),hi:v*(interp(T[k],v,"p75")||pct),kelompok:b?b.label:""})}
  if(!parts.length)return null;const av=k=>parts.reduce((s,p)=>s+p[k],0)/parts.length;return {parts,fee:av("fee"),lo:av("lo"),hi:av("hi")}}
function pctTxt(p){return (p*100).toLocaleString("id-ID",{maximumSignificantDigits:3})+"%"}
function hitungFee(f,set){
  set=set||S.set;const P=pool();if(!P.length)return null;
  const rev=+f.omset||0,as=+f.aset||0;const lr=rev>0?Math.log(rev):null,la=as>0?Math.log(as):null;
  const c=[];
  for(const h of P){const hr=h[6],ha=h[7],fee=h[8];if(!(fee>0))continue;let s=0,w=0;
    if(lr!==null&&hr>0){s+=Math.pow(lr-Math.log(hr),2);w++}
    if(la!==null&&ha>0){s+=Math.pow(la-Math.log(ha),2);w++}
    if(!w)continue;let d=Math.sqrt(s/w);
    if(f.bidang&&h[2]!==f.bidang)d+=0.6;
    if(f.standar&&STANDAR.includes(f.standar)&&h[3]!==f.standar)d+=0.5;
    if(f.kepemilikan&&KEPEMILIKAN.includes(f.kepemilikan)&&h[4]!==f.kepemilikan)d+=0.5;
    if(f.konsolidasi==="Ya"&&h[5]!=="Ya")d+=1.0;
    if(f.konsolidasi==="Tidak"&&h[5]==="Ya")d+=1.0;
    c.push({h,d})}
  if(!c.length)return null;
  c.sort((a,b)=>a.d-b.d);const k=c.slice(0,8);const items=k.map(x=>({fee:x.h[8],w:1/(x.d+0.25)}));
  const kb=wq(items,.5),kl=wq(items,.25),kh=wq(items,.75);
  const fp=feePersen(f);const metode=fp?(set.metodeFee||"gabungan"):"pembanding";
  let base,lo,hi;
  if(metode==="pembanding"){base=kb;lo=kl;hi=kh}
  else if(metode==="gabungan"){base=(fp.fee+kb)/2;lo=(fp.lo+kl)/2;hi=(fp.hi+kh)/2}
  else{base=fp.fee;lo=fp.lo;hi=fp.hi}
  lo=Math.min(lo,base);hi=Math.max(hi,base);
  const adj=[];
  if(f.bahasa==="Bahasa Inggris"&&set.inggris)adj.push(["Laporan dalam bahasa Inggris",+set.inggris]);
  if(f.bahasa==="Bilingual"&&set.bilingual)adj.push(["Laporan bilingual",+set.bilingual]);
  if(f.pernahAudit==="Belum"&&set.auditPertama)adj.push(["Audit tahun pertama (belum pernah diaudit)",+set.auditPertama]);
  if((f.tujuan||[]).includes("OJK")&&set.ojk)adj.push(["Laporan untuk OJK",+set.ojk]);
  {const nTb=Math.max(1,Number(f.jumlahTahun)||1);const pt=set.feeTahunTambahan==null?100:+set.feeTahunTambahan;
   if(nTb>1&&pt>0)adj.push([nTb+" tahun buku ("+(nTb-1)+" tahun tambahan × "+pt+"%)",(nTb-1)*pt])}
  if(f.deadline){const hr=daysBetween(f.dikirim||Date.now(),f.deadline);if(hr<=+set.hariKetat&&set.deadlineKetat)adj.push(["Tenggat "+hr+" hari (≤ "+set.hariKetat+" hari)",+set.deadlineKetat])}
  const fk=adj.reduce((m,a)=>m*(1+a[1]/100),1);const bul=+set.pembulatan||1;
  const r=v=>Math.max(+set.feeMin||0,Math.round(v*fk/bul)*bul);
  const md=k.reduce((s,x)=>s+x.d,0)/k.length;
  return {usulan:r(base),rendah:r(lo),tinggi:r(hi),dasar:base,faktor:fk,adj,metode,persen:fp,knn:kb,keyakinan:md<0.8?"Tinggi":md<1.6?"Sedang":"Rendah",jarak:+md.toFixed(2),n:P.length,
    pembanding:k.map(x=>({nama:x.h[0],bidang:x.h[2],standar:x.h[3],kep:x.h[4],kon:x.h[5],rev:x.h[6],aset:x.h[7],fee:x.h[8],jarak:+x.d.toFixed(2)})),dihitung:Date.now()};
}

/* ---------- data ---------- */
function allRecords(){return S.records.filter(r=>r&&r.f&&r.f.namaPT).map(r=>{const p=r.p||{};return {fid:r.fid,f:r.f,p,st:p.status||"baru",upd:p.diperbarui||r.f.dikirim}}).sort((a,b)=>(b.f.dikirim||0)-(a.f.dikirim||0))}
function rec(fid){return allRecords().find(r=>r.fid===fid)}

/* ---------- tabs ---------- */
function staff(){return MODE==="kantor"&&!!S.me}
function tabsFor(){
  if(MODE!=="kantor")return [["form","Formulir New Client"]];
  if(!S.me)return [["login","Masuk"]];
  const recs=allRecords();const aktif=recs.filter(r=>!["deal","batal"].includes(r.st)).length;const pend=recs.filter(r=>r.st==="partner").length;
  return [["pengajuan","Pengajuan",aktif],["partner","Persetujuan Partner",pend],["laporan","Laporan Bulanan"],["form","Input Formulir"],["data","Data Fee & Parameter"]]}
function renderTabs(){const t=tabsFor();if(!S.tab||!t.some(x=>x[0]===S.tab))S.tab=t[0][0];
  const nav=document.getElementById("tabs");nav.parentElement.hidden=t.length<2;
  const w=document.getElementById("who");w.innerHTML=S.me?`${esc(S.me.nama)} <span class="eyebrow">${esc(S.me.peran)}</span><br><button type="button" class="btn" id="btnKeluar" style="padding:4px 10px;font-size:12px;margin-top:4px">Keluar</button>`:"";
  nav.innerHTML=t.map(([k,l,n])=>`<button type="button" data-tab="${k}" aria-selected="${S.tab===k}">${esc(l)}${n?`<span class="n">${n}</span>`:""}</button>`).join("")}
document.getElementById("tabs").addEventListener("click",e=>{const b=e.target.closest("[data-tab]");if(!b)return;S.tab=b.dataset.tab;S.confirm=null;S.done=null;S.force=true;render();try{sessionStorage.setItem("shs_tab",S.tab)}catch(_){}})
document.getElementById("who").addEventListener("click",e=>{if(!e.target.closest("#btnKeluar"))return;api("logout",S.token).catch(()=>{});keluar("Anda sudah keluar")})

function render(){
  renderTabs();const app=document.getElementById("app");
  const keepForm=S.tab==="form"&&document.getElementById("clientForm")&&!S.force;S.force=false;
  if(keepForm)return; // don't wipe a form in progress
  const v={login:vLogin,form:vForm,pengajuan:vPengajuan,partner:vPartner,laporan:vLaporan,data:vData}[S.tab];
  app.innerHTML=v?v():"";
  if(S.tab==="form")bindForm();
  if(S.tab==="login")bindLogin();
}

/* ---------- login ---------- */
function vLogin(){return `<div class="card login stack"><div><div class="eyebrow">Khusus tim KAP SHS</div><h2>Masuk ke New Client Desk</h2></div>
  <form id="loginForm" class="stack" style="gap:10px"><label class="f">Nama<input id="lNama" autocomplete="username" list="lNames" required></label><datalist id="lNames"></datalist>
  <label class="f">PIN<input id="lPin" type="password" inputmode="numeric" autocomplete="current-password" required></label>
  <div id="lMsg" class="small"></div><button class="btn primary" type="submit" id="lBtn">Masuk</button></form>
  <p class="small muted" style="margin:0">Nama dan PIN diatur oleh pemilik sistem di sheet "Pengguna". Di perangkat ini Anda tetap masuk selama 30 hari sejak terakhir dipakai; tekan Keluar bila memakai perangkat bersama.</p></div>`}
function bindLogin(){const f=document.getElementById("loginForm");if(!f)return;
  api("staffNames").then(n=>{const dl=document.getElementById("lNames");if(dl)dl.innerHTML=n.map(x=>`<option value="${esc(x)}">`).join("")}).catch(()=>{});
  f.addEventListener("submit",async e=>{e.preventDefault();const m=document.getElementById("lMsg"),b=document.getElementById("lBtn");b.disabled=true;m.textContent="Memeriksa…";m.style.color="var(--muted)";
    try{const r=await api("login",document.getElementById("lNama").value,document.getElementById("lPin").value);S.token=r.token;try{localStorage.setItem("shs_tok",r.token)}catch(_){}
      load(await api("getData",S.token));S.tab=null;S.force=true;render()}
    catch(err){m.style.color="var(--bad)";m.textContent=errMsg(err);b.disabled=false}})}

/* ---------- client form ---------- */
function opt(list,sel,ph){return (ph?`<option value="">${esc(ph)}</option>`:"")+list.map(x=>`<option${x===sel?" selected":""}>${esc(x)}</option>`).join("")}
function vDone(){const d=S.done;
  if(staff())return `<div class="card stack" style="max-width:720px"><div class="eyebrow">Tersimpan</div><h2>${esc(d.form.namaPT)} tercatat</h2>
   <p style="margin:0">Nomor <b class="num">${esc(d.fid)}</b>. Usulan fee sudah tersedia di tab Pengajuan.</p>
   <div class="row"><button type="button" class="btn primary" data-act="lihatBaru" data-fid="${esc(d.fid)}">Buka pengajuan</button><button type="button" class="btn" data-act="isiLagi">Catat formulir lain</button></div></div>`;
  return `<div class="card stack" style="max-width:720px"><div class="eyebrow">Formulir terkirim</div><h2>Terima kasih, ${esc(d.form.pic)}</h2>
   <p class="lead" style="margin:0">Formulir <b>${esc(d.form.namaPT)}</b> sudah kami terima dengan nomor <b class="num">${esc(d.fid)}</b>. Tim KAP Sutrisno Hendrawanto Sukardi & Rekan akan menghubungi Anda melalui ${esc(d.form.email)} atau ${esc(d.form.hp)} setelah formulir ditinjau.</p>
   <div><button type="button" class="btn" data-act="isiLagi">Isi formulir lain</button></div></div>`}
function vForm(){
  if(S.done)return vDone();
  const adminNote=staff()?`<div class="msg info">Catat di sini klien yang mengirim formulir Word lewat email. Calon klien sendiri mengisi lewat link publik (lihat tab Data Fee &amp; Parameter).</div>`:"";
  return `<div class="stack">
  <div><div class="eyebrow">Formulir New Client ${new Date().getFullYear()}</div><h2>Informasi Umum Perusahaan / Entitas</h2>
  <p class="lead">Untuk estimasi fee dan penyusunan Proposal/Quotation, mohon lengkapi informasi berikut. Tim kami akan menghubungi PIC setelah formulir ditinjau.</p></div>
  ${adminNote}
  <form class="card qform" id="clientForm" novalidate>
   <div class="q"><div class="no">01</div><div><div class="qt">Nama, alamat lengkap &amp; email Perusahaan/Entitas</div>
    <div class="fields"><label class="f">Nama PT / Entitas *<input id="f_namaPT" required placeholder="PT Contoh Makmur"></label>
    <label class="f">Nama PIC *<input id="f_pic" required></label><label class="f">Email *<input id="f_email" type="email" required></label><label class="f">No. Telepon *<input id="f_telp" inputmode="tel" required placeholder="021 1234 5678"></label></div>
    <div class="fields" style="margin-top:10px"><label class="f">Alamat lengkap *<textarea id="f_alamat" required></textarea></label></div></div></div>
   <div class="q"><div class="no">02</div><div><div class="qt">Direktur / Pimpinan / Ketua yang menandatangani proposal/kontrak</div>
    <div class="fields"><label class="f">Nama Direktur *<input id="f_direktur" required></label><label class="f">No. HP *<input id="f_hp" inputmode="tel" required></label></div></div></div>
   <div class="q"><div class="no">03</div><div><div class="qt">Bidang usaha Perusahaan/Entitas</div>
    <div class="fields"><label class="f">Kategori bidang usaha *<select id="f_bidang" required>${opt(BIDANG,"","Pilih bidang usaha")}</select></label>
    <label class="f">Uraian kegiatan usaha<input id="f_uraian" placeholder="mis. distribusi alat kesehatan"></label></div></div></div>
   <div class="q"><div class="no">04</div><div><div class="qt">Tahun buku / periode yang akan diaudit</div>
    <div class="chips"><label><input type="radio" name="jmlTb" value="1" checked>1 tahun buku</label><label><input type="radio" name="jmlTb" value="multi">Lebih dari 1 tahun buku</label></div>
    <div class="fields" style="margin-top:10px"><label class="f" id="w_jumlahTahun" hidden>Jumlah tahun buku *<input id="f_jumlahTahun" type="number" min="2" max="10" step="1" value="2" inputmode="numeric"></label>
    <label class="f"><span id="l_tahunBuku">Periode *</span><input id="f_tahunBuku" required value="31 Desember ${new Date().getFullYear()-1}"></label></div>
    <div class="small muted" id="p_tahunBuku" style="margin-top:6px"></div></div></div>
   <div class="q"><div class="no">05</div><div><div class="qt">Jumlah omset / pendapatan untuk tahun buku yang diaudit</div>
    <div class="fields"><label class="f">Omset (Rupiah) *<input id="f_omset" class="money" inputmode="numeric" required placeholder="0"></label></div></div></div>
   <div class="q"><div class="no">06</div><div><div class="qt">Jumlah aset untuk tahun buku yang diaudit</div>
    <div class="fields"><label class="f">Total aset (Rupiah) *<input id="f_aset" class="money" inputmode="numeric" required placeholder="0"></label></div></div></div>
   <div class="q"><div class="no">07</div><div><div class="qt">Deadline penyelesaian audit dan laporan yang diharapkan</div>
    <div class="fields"><label class="f">Tanggal *<input id="f_deadline" type="date" required></label></div></div></div>
   <div class="q"><div class="no">08</div><div><div class="qt">Bahasa yang disajikan dalam laporan</div>
    <div class="chips" role="radiogroup">${["Bahasa Indonesia","Bahasa Inggris","Bilingual","Lainnya"].map((b,i)=>`<label><input type="radio" name="bahasa" value="${b}"${i===0?" checked":""}>${b}</label>`).join("")}</div></div></div>
   <div class="q"><div class="no">09</div><div><div class="qt">Tujuan laporan audit</div><div class="hint">Boleh pilih lebih dari satu.</div>
    <div class="chips">${TUJUAN.map(t=>`<label><input type="checkbox" name="tujuan" value="${t}">${t}</label>`).join("")}</div></div></div>
   <div class="q"><div class="no">10</div><div><div class="qt">Apakah perusahaan/entitas sudah pernah diaudit sebelumnya?</div>
    <div class="chips"><label><input type="radio" name="pernah" value="Sudah">Sudah pernah</label><label><input type="radio" name="pernah" value="Belum" checked>Belum pernah</label></div>
    <div class="fields" style="margin-top:10px"><label class="f">Jika pernah, nama KAP sebelumnya<input id="f_kapLama"></label></div></div></div>
   <div class="q"><div class="no">11</div><div><div class="qt">Profil pelaporan</div><div class="hint">Membantu kami menyiapkan tim dan fee yang tepat. Pilih "Belum tahu" bila ragu.</div>
    <div class="fields"><label class="f">Standar akuntansi<select id="f_standar">${opt(["Belum tahu",...STANDAR],"Belum tahu")}</select></label>
    <label class="f">Kepemilikan<select id="f_kepemilikan">${opt(KEPEMILIKAN,"Swasta")}</select></label>
    <label class="f">Laporan konsolidasi (punya anak usaha)?<select id="f_konsolidasi">${opt(["Tidak","Ya"],"Tidak")}</select></label></div></div></div>
   <div class="q"><div class="no">12</div><div><div class="qt">Informasi tentang KAP SHS diperoleh dari</div>
    <div class="chips">${["Website www.kapshs.com","Rekan / Relasi","Lainnya"].map((b,i)=>`<label><input type="radio" name="sumber" value="${b}"${i===2?" checked":""}>${b}</label>`).join("")}</div>
    <div class="fields" style="margin-top:10px"><label class="f">Sebutkan nama rekan/relasi atau sumber lain<input id="f_sumberKet" value="https://hendrawanto.com/proposal/"></label><label class="f">Kota pengisian<input id="f_kota" placeholder="Jakarta"></label></div></div></div>
   <label class="hp" aria-hidden="true">Website<input id="f_website" tabindex="-1" autocomplete="off"></label>
   <div class="formfoot"><span class="small muted" id="formMsg">Kolom bertanda * wajib diisi.</span>
    <button class="btn primary" type="submit" id="btnKirim">Kirim formulir</button></div>
  </form></div>`}
function bindForm(){
  const f=document.getElementById("clientForm");if(!f)return;
  f.querySelectorAll("input.money").forEach(i=>i.addEventListener("input",()=>{const n=digits(i.value);i.value=n?nf.format(n):""}));
  const tb=()=>{const multi=(f.querySelector("[name=jmlTb]:checked")||{}).value==="multi";
    document.getElementById("w_jumlahTahun").hidden=!multi;document.getElementById("l_tahunBuku").textContent=multi?"Periode tahun buku terakhir *":"Periode *";
    const n=multi?Math.min(10,Math.max(2,Number(document.getElementById("f_jumlahTahun").value)||2)):1;
    document.getElementById("p_tahunBuku").textContent=n>1?"Akan diaudit "+periodeTeks({tahunBuku:document.getElementById("f_tahunBuku").value,jumlahTahun:n}):""};
  f.querySelectorAll("[name=jmlTb],#f_jumlahTahun,#f_tahunBuku").forEach(x=>{x.addEventListener("change",tb);x.addEventListener("input",tb)});
  f.addEventListener("reset",()=>setTimeout(tb,0));tb();
  f.addEventListener("submit",async e=>{e.preventDefault();const m=document.getElementById("formMsg");
    const val=id=>document.getElementById(id).value.trim();
    const miss=[...f.querySelectorAll("[required]")].filter(x=>!x.value.trim());
    if(miss.length){miss[0].focus();m.className="msg bad";m.textContent="Lengkapi "+miss.length+" kolom wajib yang masih kosong.";return}
    if(!/^\S+@\S+\.\S+$/.test(val("f_email"))){document.getElementById("f_email").focus();m.className="msg bad";m.textContent="Format email belum benar, contoh: nama@perusahaan.co.id";return}
    const form={namaPT:val("f_namaPT"),pic:val("f_pic"),email:val("f_email"),telp:val("f_telp"),alamat:val("f_alamat"),direktur:val("f_direktur"),hp:val("f_hp"),bidang:val("f_bidang"),uraian:val("f_uraian"),
      tahunBuku:val("f_tahunBuku"),jumlahTahun:(f.querySelector("[name=jmlTb]:checked")||{}).value==="multi"?Math.min(10,Math.max(2,Number(val("f_jumlahTahun"))||2)):1,omset:digits(val("f_omset")),aset:digits(val("f_aset")),deadline:val("f_deadline"),
      bahasa:(f.querySelector("[name=bahasa]:checked")||{}).value||"",tujuan:[...f.querySelectorAll("[name=tujuan]:checked")].map(x=>x.value),
      pernahAudit:(f.querySelector("[name=pernah]:checked")||{}).value||"",kapLama:val("f_kapLama"),standar:val("f_standar"),kepemilikan:val("f_kepemilikan"),konsolidasi:val("f_konsolidasi"),
      sumber:(f.querySelector("[name=sumber]:checked")||{}).value||"",sumberKet:val("f_sumberKet"),kota:val("f_kota"),website:val("f_website")};
    const btn=document.getElementById("btnKirim");btn.disabled=true;m.className="small muted";m.textContent="Mengirim…";
    try{
      if(staff()){const d=await aksi({jenis:"inputAdmin",form});S.done={fid:d.baru,form}}
      else{const r=await api("submitForm",form);S.done={fid:r.fid,form}}
      S.force=true;render();window.scrollTo(0,0);toast("Formulir terkirim")}
    catch(err){if(isSesi(err))return;m.className="msg bad";m.textContent="Gagal mengirim: "+errMsg(err)+" Periksa koneksi lalu tekan Kirim sekali lagi.";btn.disabled=false}});
}
/* ---------- client status ---------- */
function vStatus(){const forms=(S.myDoc&&S.myDoc.forms)||{};const ids=Object.keys(forms).sort((a,b)=>(forms[b].dikirim||0)-(forms[a].dikirim||0));
  return `<div class="stack"><div><h2>Status pengajuan saya</h2><p class="lead">Perkembangan formulir yang sudah Anda kirim ke KAP SHS.</p></div>
  ${ids.length?`<div class="card scroll"><table><thead><tr><th>No.</th><th>Perusahaan</th><th>Dikirim</th><th>Status</th><th>Pembaruan</th></tr></thead><tbody>
  ${ids.map(id=>{const f=forms[id];return `<tr><td class="num">${esc(id)}</td><td>${esc(f.namaPT)}</td><td>${tgl(f.dikirim)}</td><td>${esc(f.statusKlien||STATUS.baru.klien)}</td><td>${tgl(f.diperbaruiKlien||f.dikirim)}</td></tr>`}).join("")}
  </tbody></table></div>`:`<div class="card empty"><strong>Belum ada formulir</strong>Isi formulir di tab Formulir Klien, lalu statusnya muncul di sini.</div>`}</div>`}

/* ---------- detail blocks ---------- */
function infoKlien(f){return `<dl class="kv">
 <dt>PIC / Email</dt><dd>${esc(f.pic)} · ${esc(f.email)}</dd><dt>No. Telepon</dt><dd>${esc(f.telp||"–")}</dd><dt>Alamat</dt><dd>${esc(f.alamat)}</dd>
 <dt>Direktur / HP</dt><dd>${esc(f.direktur)} · ${esc(f.hp)}</dd><dt>Bidang usaha</dt><dd>${esc(f.bidang)}${f.uraian?" — "+esc(f.uraian):""}</dd>
 <dt>Tahun buku</dt><dd>${esc(periodeTeks(f))}</dd><dt>Omset</dt><dd class="num">${rp(f.omset)}</dd><dt>Total aset</dt><dd class="num">${rp(f.aset)}</dd>
 <dt>Deadline</dt><dd>${f.deadline?tgl(f.deadline)+" ("+daysBetween(f.dikirim||Date.now(),f.deadline)+" hari dari pengisian)":"–"}</dd>
 <dt>Bahasa laporan</dt><dd>${esc(f.bahasa)}</dd><dt>Tujuan laporan</dt><dd>${esc((f.tujuan||[]).join(", ")||"–")}</dd>
 <dt>Pernah diaudit</dt><dd>${esc(f.pernahAudit)}${f.kapLama?" — "+esc(f.kapLama):""}</dd>
 <dt>Standar / kepemilikan</dt><dd>${esc(f.standar||"–")} · ${esc(f.kepemilikan||"–")} · Konsolidasi: ${esc(f.konsolidasi||"–")}</dd>
 <dt>Sumber informasi</dt><dd>${esc(f.sumber)}${f.sumberKet?" — "+esc(f.sumberKet):""}</dd>
 <dt>Diisi</dt><dd>${esc(f.kota||"–")}, ${tglJam(f.dikirim)} · ${esc(f.input||"Klien")}</dd></dl>`}
function feeBlock(fee,extra){if(!fee)return `<div class="msg info">Data historis fee belum tersedia, usulan belum bisa dihitung.</div>`;
  return `<div class="feebox"><div><div class="eyebrow">Usulan fee sistem</div><div class="fee-main">${rp(fee.usulan)}</div><div class="fee-sub">Rentang ${rpS(fee.rendah)} – ${rpS(fee.tinggi)}</div></div>
  <div><div class="eyebrow">Keyakinan</div><div style="margin-top:6px">${`<span class="pill t-${fee.keyakinan==="Tinggi"?"ok":fee.keyakinan==="Sedang"?"info":"warn"}">${fee.keyakinan}</span>`}</div><div class="fee-sub" style="margin-top:6px">rata-rata jarak ${String(fee.jarak).replace(".",",")} · ${fee.n} data</div></div>
  ${extra||""}</div>
  <div class="small" style="margin-top:12px"><span class="muted">Metode: </span>${esc(METODE[fee.metode]||METODE.pembanding)}
  ${fee.persen?fee.persen.parts.map(p=>`<br><span class="muted">${p.dasar==="omset"?"Omset":"Total aset"} ${esc(rpS(p.nilai))} × ${esc(pctTxt(p.pct))} <span title="kelompok historis">(${esc(p.kelompok)})</span> = </span><span class="num">${rp(p.fee)}</span>`).join("")+(fee.persen.parts.length>1?`<br><span class="muted">Rata-rata keduanya: </span><span class="num">${rp(fee.persen.fee)}</span>`:""):""}
  ${fee.knn!=null?`<br><span class="muted">Median tertimbang 8 pembanding: </span><span class="num">${rp(fee.knn)}</span>${fee.metode==="persentase"?' <span class="muted">(acuan)</span>':""}${fee.metode==="gabungan"&&fee.persen?`<br><span class="muted">Rata-rata kedua metode: </span><span class="num">${rp(fee.dasar)}</span>`:""}`:`<br><span class="muted">Dasar: </span><span class="num">${rp(fee.dasar)}</span>`}
  ${fee.adj.length?fee.adj.map(a=>`<br><span class="muted">+ ${esc(a[0])}: </span><span class="num">${a[1]}%</span>`).join(""):"<br><span class='muted'>Tanpa penyesuaian.</span>"}</div>`}
function pembandingTable(fee){if(!fee)return "";return `<details><summary class="small" style="cursor:pointer;font-weight:700">Lihat 8 klien pembanding</summary><div class="scroll" style="margin-top:10px"><table><thead><tr><th>Klien historis</th><th>Bidang / standar</th><th class="r">Pendapatan</th><th class="r">Aset</th><th class="r">Fee</th><th class="r">Jarak</th></tr></thead><tbody>
 ${fee.pembanding.map(p=>`<tr><td>${esc(p.nama)}</td><td class="small">${esc(p.bidang)}<br><span class="muted">${esc(p.standar)} · ${esc(p.kep)}${p.kon==="Ya"?" · Konsolidasi":""}</span></td><td class="r num">${rpS(p.rev)}</td><td class="r num">${rpS(p.aset)}</td><td class="r num">${rpS(p.fee)}</td><td class="r num">${String(p.jarak).replace(".",",")}</td></tr>`).join("")}
 </tbody></table></div></details>`}
function timeline(p){const rw=(p&&p.riwayat)||[];if(!rw.length)return `<p class="small muted">Belum ada pembaruan progres.</p>`;resolveNames(rw.map(x=>x.oleh));
  return `<ul class="timeline">${rw.slice().reverse().map(x=>`<li><span class="dot" style="background:${(STATUS[x.status]||STATUS.baru).c}"></span><div><div class="row" style="gap:8px">${pill(x.status)}<span class="small muted">${tglJam(x.t)} · ${esc(nameOf(x.oleh))}</span></div>${x.catatan?`<div class="small" style="margin-top:4px">${esc(x.catatan)}</div>`:""}</div></li>`).join("")}</ul>`}

/* ---------- pengajuan (admin) ---------- */
function vPengajuan(){
  const recs=allRecords();
  const F={aktif:r=>!["deal","batal"].includes(r.st),semua:()=>true,baru:r=>r.st==="baru"||r.st==="revisi",partner:r=>r.st==="partner",proses:r=>["disetujui","proposal","negosiasi"].includes(r.st),selesai:r=>["deal","batal"].includes(r.st)};
  const q=S.q.toLowerCase();const list=recs.filter(F[S.filt]||F.aktif).filter(r=>!q||(r.f.namaPT+" "+r.fid+" "+r.f.pic).toLowerCase().includes(q));
  if(!S.sel||!recs.some(r=>r.fid===S.sel))S.sel=list[0]&&list[0].fid;
  const fl=[["aktif","Aktif"],["baru","Perlu ditinjau"],["partner","Di Partner"],["proses","Proses proposal"],["selesai","Selesai"],["semua","Semua"]];
  return `<div class="stack"><div><h2>Pengajuan klien baru</h2><p class="lead">Formulir yang masuk, usulan fee otomatis dari ${S.hist.length} data historis, dan progres sampai kontrak.</p></div>
  <div class="split"><div><div class="filters"><select id="fSel" aria-label="Filter status" style="width:auto">${fl.map(([k,l])=>`<option value="${k}"${S.filt===k?" selected":""}>${l}</option>`).join("")}</select>
   <input id="fQ" placeholder="Cari nama / nomor" value="${esc(S.q)}" style="flex:1 1 140px;width:auto"></div>
   <div class="list">${list.length?list.map(r=>`<button type="button" class="item" data-sel="${r.fid}" aria-current="${r.fid===S.sel}"><span class="nm">${esc(r.f.namaPT)}</span>${pill(r.st)}<span class="meta"><span class="num">${esc(r.fid)}</span><span>${tgl(r.f.dikirim)}</span><span class="num">${rpS(r.f.omset)} omset</span></span></button>`).join(""):
   `<div class="empty"><strong>${recs.length?"Tidak ada yang cocok":"Belum ada formulir masuk"}</strong>${recs.length?"Ubah filter atau kata kunci.":"Formulir yang dikirim klien, atau yang Anda catat di tab Formulir Klien, muncul di sini."}</div>`}</div></div>
  <div>${S.sel?detailAdmin(rec(S.sel)):`<div class="card empty"><strong>Pilih pengajuan</strong>Detail, usulan fee dan riwayat progres tampil di sini.</div>`}</div></div></div>`}
function detailAdmin(r){if(!r)return "";const f=r.f,p=r.p;const live=hitungFee(f);const fee=p.feeSistem||live;
  const opts=NEXT[r.st]||[];const canSend=r.st==="baru"||r.st==="revisi";
  const fa=p.feeDiajukan||(live&&live.usulan)||"";
  const cf=S.confirm&&S.confirm.fid===r.fid?S.confirm:null;
  return `<div class="stack">
  <div class="card"><div class="row" style="justify-content:space-between"><div style="min-width:0"><div class="eyebrow num">${esc(r.fid)}</div><h3 style="font-size:19px;margin:2px 0 0">${esc(f.namaPT)}</h3></div>${pill(r.st)}</div></div>
  <div class="card"><h3>Usulan fee</h3>${feeBlock(canSend?live:fee,p.feeDisetujui?`<div><div class="eyebrow">Disetujui Partner</div><div class="fee-main" style="color:var(--ok)">${rp(p.feeDisetujui)}</div><div class="fee-sub">${esc(p.partner||"")}</div></div>`:(p.feeDiajukan&&!canSend?`<div><div class="eyebrow">Diajukan ke Partner</div><div class="fee-main">${rp(p.feeDiajukan)}</div></div>`:""))}
   ${p.status==="revisi"&&p.catatanPartner?`<div class="msg info" style="margin-top:12px"><b>Catatan Partner:</b> ${esc(p.catatanPartner)}</div>`:""}
   ${canSend?`<div class="fields" style="margin-top:14px;align-items:end"><label class="f">Fee yang diajukan ke Partner<input id="feeAju" class="money" inputmode="numeric" value="${fa?nf.format(fa):""}"></label>
    <label class="f">Catatan untuk Partner<input id="catAju" placeholder="opsional"></label>
    <button type="button" class="btn primary" data-act="kirimPartner" data-fid="${r.fid}">Kirim ke Partner</button></div>`:""}
   <div style="margin-top:14px">${pembandingTable(canSend?live:fee)}</div></div>
  ${proposalCard(r,cf)}
  <div class="grid2"><div class="card"><h3>Data klien</h3>${infoKlien(f)}</div>
  <div class="card"><h3>Update progres</h3>
   ${opts.length?`<div class="stack" style="gap:10px"><label class="f">Status baru<select id="stNew">${opts.map(o=>`<option value="${o}">${esc(STATUS[o].label)}</option>`).join("")}</select></label>
   ${r.st==="negosiasi"||r.st==="proposal"?`<label class="f">Fee final (bila berubah saat negosiasi)<input id="feeFinal" class="money" inputmode="numeric" value="${p.feeDisetujui?nf.format(p.feeDisetujui):""}"></label>`:""}
   <label class="f">Catatan progres<textarea id="stNote" placeholder="mis. Proposal dikirim via email ke PIC, follow up 7 hari"></textarea></label>
   ${cf&&cf.act==="progres"?`<div class="confirm"><p>Ubah status ke <b>${esc(STATUS[cf.st].label)}</b>?</p><button type="button" class="btn primary" data-act="progresYa" data-fid="${r.fid}">Ya, simpan</button><button type="button" class="btn" data-act="batalConfirm">Batal</button></div>`:
   `<button type="button" class="btn primary" data-act="progres" data-fid="${r.fid}">Simpan progres</button>`}</div>`:
   `<p class="small muted">${r.st==="partner"?"Menunggu keputusan Partner di tab Persetujuan Partner.":"Pengajuan sudah selesai."}</p>`}
   <h3 style="margin-top:18px">Riwayat</h3>${timeline(p)}
   ${isPartner()?(cf&&cf.act==="hapus"?`<div class="confirm" style="margin-top:16px"><p>Hapus permanen pengajuan ${esc(f.namaPT)} dari sheet? Tindakan ini tidak bisa dibatalkan.</p><button type="button" class="btn danger" data-act="hapusYa" data-fid="${r.fid}">Ya, hapus</button><button type="button" class="btn" data-act="batalConfirm">Batal</button></div>`:
   `<div style="margin-top:16px"><button type="button" class="btn danger" data-act="hapus" data-fid="${r.fid}" style="font-size:12px;padding:5px 10px">Hapus pengajuan (mis. data uji coba)</button></div>`):""}</div></div></div>`}
function proposalCard(r,cf){const p=r.p,f=r.f,pr=p.proposal;
  if(!["disetujui","proposal","negosiasi","deal"].includes(r.st)||!(p.feeDisetujui>0))return "";
  const busy=S.busy===r.fid;
  let h=`<div class="card"><div class="row" style="justify-content:space-between"><h3 style="margin:0">Proposal</h3>${pr&&pr.terkirim?`<span class="pill t-ok">Terkirim ${esc(tgl(pr.terkirim))}</span>`:pr?`<span class="pill t-info">Draf siap</span>`:""}</div>`;
  if(!pr){h+=`<p class="small muted" style="margin:8px 0 12px">Sistem menyusun proposal dari template kantor: Format Proposal SHS: kop resmi, nomor surat otomatis, ruang lingkup sesuai jenis entitas, fee ${esc(rp(p.feeDisetujui))} dengan termin pembayaran, serta tanda tangan dan stempel Managing Partner (dipilih acak dari 5 variasi). Hasilnya berupa Google Docs yang masih bisa diedit sebelum dikirim.</p>
    <button type="button" class="btn primary" data-act="buatProposal" data-fid="${r.fid}"${busy?" disabled":""}>${busy?"Menyusun proposal…":"Buat Proposal"}</button></div>`;return h}
  h+=`<dl class="kv" style="margin-top:12px"><dt>Nomor</dt><dd class="num">${esc(pr.nomor)}</dd><dt>Dibuat</dt><dd>${esc(tglJam(pr.dibuat))} · ${esc(pr.dibuatOleh||"")}</dd>
    ${pr.terkirim?`<dt>Dikirim ke</dt><dd>${esc(pr.ke)}${pr.cc?`<br><span class="small muted">cc ${esc(pr.cc)}</span>`:""}<br><span class="small muted">${esc(tglJam(pr.terkirim))} · ${esc(pr.dikirimOleh||"")}</span></dd>`:""}</dl>
    <div class="row" style="margin-top:12px"><a class="btn" href="${esc(pr.docUrl)}" target="_blank" rel="noopener" style="text-decoration:none">Buka / edit proposal</a>${pr.pdfUrl?`<a class="btn" href="${esc(pr.pdfUrl)}" target="_blank" rel="noopener" style="text-decoration:none">PDF terkirim</a>`:""}
    ${pr.terkirim?"":`<button type="button" class="btn" data-act="buatProposal" data-fid="${r.fid}"${busy?" disabled":""}>Buat ulang</button>`}</div>`;
  if(cf&&cf.act==="kirimProposal")h+=`<div class="confirm" style="margin-top:14px"><p>Kirim proposal <b class="num">${esc(pr.nomor)}</b> dalam bentuk PDF ke <b>${esc(cf.ke)}</b>? Email terkirim dari akun Gmail kantor dan tidak bisa ditarik kembali.</p>
    <button type="button" class="btn primary" data-act="kirimProposalYa" data-fid="${r.fid}"${busy?" disabled":""}>${busy?"Mengirim…":"Ya, kirim sekarang"}</button><button type="button" class="btn" data-act="batalConfirm">Batal</button></div>`;
  else h+=`<div class="fields" style="margin-top:14px;align-items:end"><label class="f">Kirim ke email<input id="prKe" type="email" value="${esc(pr.ke||f.email)}"></label>
    <button type="button" class="btn primary" data-act="kirimProposal" data-fid="${r.fid}">${pr.terkirim?"Kirim ulang proposal":"Kirim Proposal"}</button></div>
    <p class="small muted" style="margin:8px 0 0">Periksa dulu isi proposal lewat "Buka / edit proposal". Perubahan yang Anda buat di Google Docs ikut terkirim.${r.st==="disetujui"?" Setelah terkirim, status berubah menjadi Proposal dikirim.":""}</p>`;
  return h+`</div>`}function draf(r){const f=r.f,p=r.p;return `Kepada Yth.
Bapak/Ibu ${f.direktur}
${f.namaPT}
${f.alamat}

Perihal: Proposal Jasa Audit Laporan Keuangan ${f.tahunBuku}

Dengan hormat,

Terima kasih atas kepercayaan ${f.namaPT} kepada KAP Sutrisno Hendrawanto Sukardi & Rekan. Berdasarkan informasi yang telah Bapak/Ibu sampaikan, kami mengajukan proposal jasa audit atas laporan keuangan untuk tahun buku ${f.tahunBuku} dengan penyajian laporan dalam ${f.bahasa}.

Fee profesional yang kami ajukan sebesar ${rp(p.feeDisetujui)}. Rincian ruang lingkup, jadwal pekerjaan${f.deadline?" (target penyelesaian "+tgl(f.deadline)+")":""} dan ketentuan pembayaran kami sampaikan dalam proposal terlampir.

Kami siap mendiskusikan proposal ini lebih lanjut. Silakan menghubungi kami bila ada pertanyaan.

Hormat kami,
${p.partner||"Partner"}
KAP Sutrisno Hendrawanto Sukardi & Rekan`}

/* ---------- partner ---------- */
function vPartner(){const recs=allRecords().filter(r=>r.st==="partner");const done=allRecords().filter(r=>r.p.diputuskan).sort((a,b)=>b.p.diputuskan-a.p.diputuskan).slice(0,8);
  if(!S.selP||!recs.some(r=>r.fid===S.selP))S.selP=recs[0]&&recs[0].fid;
  return `<div class="stack"><div><h2>Persetujuan Partner</h2><p class="lead">Tinjau usulan fee dan klien pembandingnya, lalu setujui, minta revisi, atau tolak.</p></div>
  <div class="split"><div class="stack"><div class="list">${recs.length?recs.map(r=>`<button type="button" class="item" data-selp="${r.fid}" aria-current="${r.fid===S.selP}"><span class="nm">${esc(r.f.namaPT)}</span><span class="num small">${rpS(r.p.feeDiajukan)}</span><span class="meta"><span>${esc(r.f.bidang)}</span><span>diajukan ${tgl(r.p.diperbarui)}</span></span></button>`).join(""):
   `<div class="empty"><strong>Tidak ada antrean</strong>Pengajuan yang dikirim admin ke Partner muncul di sini.</div>`}</div>
   ${done.length?`<div class="card"><h3>Keputusan terakhir</h3><div class="stack" style="gap:8px">${done.map(r=>`<div class="row small" style="justify-content:space-between"><span>${esc(r.f.namaPT)}</span>${pill(r.p.keputusan||r.st)}</div>`).join("")}</div></div>`:""}</div>
  <div>${S.selP?detailPartner(rec(S.selP)):`<div class="card empty"><strong>Semua sudah diputuskan</strong>Tidak ada pengajuan yang menunggu.</div>`}</div></div></div>`}
function detailPartner(r){if(!r)return "";const f=r.f,p=r.p,fee=p.feeSistem;const cf=S.confirm&&S.confirm.fid===r.fid?S.confirm:null;
  const aju=p.feeDiajukan||(fee&&fee.usulan);const selisih=fee&&aju?((aju/fee.usulan-1)*100):0;
  return `<div class="stack"><div class="card"><div class="eyebrow num">${esc(r.fid)}</div><h3 style="font-size:19px;margin:2px 0 0">${esc(f.namaPT)}</h3><div class="small muted">${esc(f.bidang)} · omset ${rpS(f.omset)} · aset ${rpS(f.aset)}</div></div>
  <div class="card"><h3>Fee</h3>${feeBlock(fee,`<div><div class="eyebrow">Diajukan admin</div><div class="fee-main">${rp(aju)}</div><div class="fee-sub">${Math.abs(selisih)<0.5?"sama dengan usulan sistem":(selisih>0?"+":"")+selisih.toFixed(1).replace(".",",")+"% dari usulan sistem"}</div></div>`)}
   ${p.catatanAdmin?`<div class="msg info" style="margin-top:12px"><b>Catatan admin:</b> ${esc(p.catatanAdmin)}</div>`:""}
   <div style="margin-top:14px">${pembandingTable(fee)}</div></div>
  ${!isPartner()?`<div class="card"><h3>Keputusan</h3><p class="small muted" style="margin:0">Hanya pengguna berperan Partner yang dapat menyetujui, meminta revisi, atau menolak.</p></div>`:`<div class="card"><h3>Keputusan ${esc(S.me.nama)}</h3><div class="fields">
   <label class="f">Fee disetujui<input id="pFee" class="money" inputmode="numeric" value="${aju?nf.format(aju):""}"></label></div>
   <label class="f" style="margin-top:10px">Catatan<textarea id="pNote" placeholder="Wajib diisi untuk revisi atau penolakan"></textarea></label>
   <div id="pMsg"></div>
   ${cf?`<div class="confirm" style="margin-top:12px"><p>${cf.act==="setuju"?`Setujui fee <b>${rp(cf.fee)}</b> untuk ${esc(f.namaPT)}?`:cf.act==="revisi"?"Kembalikan ke admin untuk revisi?":"Tolak pengajuan ini? Status menjadi Tidak berlanjut."}</p>
    <button type="button" class="btn primary" data-act="putusYa" data-fid="${r.fid}">Ya, lanjutkan</button><button type="button" class="btn" data-act="batalConfirm">Batal</button></div>`:
   `<div class="row" style="margin-top:12px"><button type="button" class="btn good" data-act="putus" data-k="setuju" data-fid="${r.fid}">Setujui</button><button type="button" class="btn" data-act="putus" data-k="revisi" data-fid="${r.fid}">Minta revisi</button><button type="button" class="btn danger" data-act="putus" data-k="tolak" data-fid="${r.fid}">Tolak</button></div>`}</div>`}
  <div class="grid2"><div class="card"><h3>Data klien</h3>${infoKlien(f)}</div><div class="card"><h3>Riwayat</h3>${timeline(p)}</div></div></div>`}

/* ---------- laporan ---------- */
function laporanData(k){const recs=allRecords();const inM=ts=>ts&&ym(new Date(ts))===k;
  const masuk=recs.filter(r=>inM(r.f.dikirim));const akt=[];
  for(const r of recs)for(const h of (r.p.riwayat||[]))if(inM(h.t))akt.push({r,h});akt.sort((a,b)=>b.h.t-a.h.t);
  const deal=recs.filter(r=>r.st==="deal"&&(r.p.riwayat||[]).some(h=>h.status==="deal"&&inM(h.t)));
  const setuju=recs.filter(r=>(r.p.riwayat||[]).some(h=>h.status==="disetujui"&&inM(h.t)));
  return {recs,masuk,akt,deal,setuju}}
function vLaporan(){const months=new Set([ym(new Date())]);for(const r of allRecords()){months.add(ym(new Date(r.f.dikirim)));for(const h of (r.p.riwayat||[]))months.add(ym(new Date(h.t)))}
  const ms=[...months].sort().reverse();const k=S.bulan;const d=laporanData(k);
  const sumU=d.masuk.reduce((s,r)=>s+((r.p.feeSistem&&r.p.feeSistem.usulan)||(hitungFee(r.f)||{}).usulan||0),0);
  const sumS=d.setuju.reduce((s,r)=>s+(r.p.feeDisetujui||0),0);const sumD=d.deal.reduce((s,r)=>s+(r.p.feeDisetujui||0),0);
  const cnt={};for(const r of d.masuk)cnt[r.st]=(cnt[r.st]||0)+1;const tot=d.masuk.length;
  const byB={};for(const r of d.masuk)byB[r.f.bidang]=(byB[r.f.bidang]||0)+1;const bMax=Math.max(1,...Object.values(byB));
  const byS={};for(const r of d.masuk){const s=(r.f.sumber||"–").replace("Website www.kapshs.com","Website");byS[s]=(byS[s]||0)+1}
  const pipe={};for(const r of d.recs)if(!["deal","batal"].includes(r.st))pipe[r.st]=(pipe[r.st]||0)+1;
  return `<div class="stack"><div class="row" style="justify-content:space-between;align-items:end"><div><h2>Laporan bulanan ${esc(blnLabel(k))}</h2><p class="lead" style="margin:0">Ringkasan klien yang mengisi formulir dan pembaruan progresnya.</p></div>
  <div class="row"><select id="bSel" aria-label="Bulan" style="width:auto">${ms.map(m=>`<option value="${m}"${m===k?" selected":""}>${esc(blnLabel(m))}</option>`).join("")}</select>
  ${S.lapUrl[k]?`<a class="btn" href="${esc(S.lapUrl[k])}" target="_blank" rel="noopener" style="text-decoration:none">Buka Google Sheet laporan</a>`:`<button type="button" class="btn" data-act="ekspor">Buat Google Sheet</button>`}<button type="button" class="btn" data-act="salinRingkas">Salin ringkasan</button></div></div>
  <div class="kpis"><div class="kpi"><div class="l">Formulir masuk</div><div class="v">${tot}</div></div>
   <div class="kpi"><div class="l">Total usulan fee sistem</div><div class="v">${rpS(sumU)}</div></div>
   <div class="kpi"><div class="l">Disetujui Partner bulan ini</div><div class="v">${d.setuju.length} · ${rpS(sumS)}</div></div>
   <div class="kpi"><div class="l">Kontrak ditandatangani</div><div class="v">${d.deal.length} · ${rpS(sumD)}</div></div>
   <div class="kpi"><div class="l">Pipeline aktif (semua bulan)</div><div class="v">${Object.values(pipe).reduce((a,b)=>a+b,0)}</div></div></div>
  ${tot?`<div class="card"><h3>Posisi status formulir yang masuk bulan ini</h3><div class="bar">${Object.keys(STATUS).filter(s=>cnt[s]).map(s=>`<span style="width:${cnt[s]/tot*100}%;background:${STATUS[s].c}" title="${esc(STATUS[s].label)}"></span>`).join("")}</div>
   <div class="legend">${Object.keys(STATUS).filter(s=>cnt[s]).map(s=>`<span><i style="background:${STATUS[s].c}"></i>${esc(STATUS[s].label)} <b class="num">${cnt[s]}</b></span>`).join("")}</div></div>`:""}
  <div class="card"><h3>Klien yang mengisi formulir</h3>${tot?`<div class="scroll"><table><thead><tr><th>No.</th><th>Perusahaan</th><th>Bidang</th><th class="r">Omset</th><th class="r">Usulan sistem</th><th class="r">Disetujui</th><th>Status</th><th>Progres terakhir</th></tr></thead><tbody>
   ${d.masuk.map(r=>{const last=(r.p.riwayat||[]).slice(-1)[0];const u=(r.p.feeSistem&&r.p.feeSistem.usulan)||(hitungFee(r.f)||{}).usulan;return `<tr><td class="num small">${esc(r.fid)}</td><td><b>${esc(r.f.namaPT)}</b><div class="small muted">${tgl(r.f.dikirim)} · ${esc(r.f.pic)}</div></td><td class="small">${esc(r.f.bidang)}</td><td class="r num">${rpS(r.f.omset)}</td><td class="r num">${rpS(u)}</td><td class="r num">${r.p.feeDisetujui?rpS(r.p.feeDisetujui):"–"}</td><td>${pill(r.st)}</td><td class="small">${last?tgl(last.t)+(last.catatan?" — "+esc(last.catatan):""):"–"}</td></tr>`}).join("")}</tbody></table></div>`:
   `<div class="empty"><strong>Belum ada formulir di ${esc(blnLabel(k))}</strong>Laporan terisi otomatis saat klien mengirim formulir.</div>`}</div>
  <div class="grid2"><div class="card"><h3>Bidang usaha</h3>${tot?`<div class="hbars">${Object.entries(byB).sort((a,b)=>b[1]-a[1]).map(([b,n])=>`<div class="hb"><div>${esc(b)}<div class="track"><span style="width:${n/bMax*100}%"></span></div></div><div class="num r">${n}</div></div>`).join("")}</div>`:`<p class="small muted">Belum ada data.</p>`}</div>
   <div class="card"><h3>Sumber informasi KAP</h3>${tot?`<div class="hbars">${Object.entries(byS).sort((a,b)=>b[1]-a[1]).map(([b,n])=>`<div class="hb"><div>${esc(b)}<div class="track"><span style="width:${n/tot*100}%;background:var(--red)"></span></div></div><div class="num r">${n}</div></div>`).join("")}</div>`:`<p class="small muted">Belum ada data.</p>`}</div></div>
  <div class="card"><h3>Aktivitas progres bulan ini</h3>${d.akt.length?(resolveNames(d.akt.map(a=>a.h.oleh)),`<div class="scroll"><table><thead><tr><th>Tanggal</th><th>Perusahaan</th><th>Status</th><th>Catatan</th><th>Oleh</th></tr></thead><tbody>${d.akt.map(a=>`<tr><td class="small num">${tglJam(a.h.t)}</td><td>${esc(a.r.f.namaPT)}</td><td>${pill(a.h.status)}</td><td class="small">${esc(a.h.catatan)}</td><td class="small">${esc(nameOf(a.h.oleh))}</td></tr>`).join("")}</tbody></table></div>`):`<p class="small muted">Belum ada aktivitas di bulan ini.</p>`}</div></div>`}
function barisLaporan(){const d=laporanData(S.bulan);
  const head=["No. Formulir","Tanggal Masuk","Perusahaan","PIC","Email","No. Telepon","Direktur","HP","Bidang Usaha","Tahun Buku","Omset","Total Aset","Deadline","Bahasa","Tujuan","Pernah Diaudit","KAP Sebelumnya","Sumber Info","Usulan Fee Sistem","Fee Diajukan","Fee Disetujui","Partner","Status","Progres Terakhir","Tanggal Progres"];
  const rows=d.masuk.map(r=>{const f=r.f,p=r.p,l=(p.riwayat||[]).slice(-1)[0]||{};const u=(p.feeSistem&&p.feeSistem.usulan)||(hitungFee(f)||{}).usulan||"";
    return [r.fid,tgl(f.dikirim),f.namaPT,f.pic,f.email,f.telp||"",f.direktur,f.hp,f.bidang,periodeTeks(f),f.omset,f.aset,f.deadline,f.bahasa,(f.tujuan||[]).join(", "),f.pernahAudit,f.kapLama,f.sumber+(f.sumberKet?" - "+f.sumberKet:""),u,p.feeDiajukan||"",p.feeDisetujui||"",p.partner||"",STATUS[r.st].label,l.catatan||"",l.t?tgl(l.t):""]});
  return {head,rows}}
function ringkasan(){const d=laporanData(S.bulan);const L=["Laporan New Client KAP SHS — "+blnLabel(S.bulan),"","Formulir masuk: "+d.masuk.length,"Disetujui Partner: "+d.setuju.length+" ("+rp(d.setuju.reduce((s,r)=>s+(r.p.feeDisetujui||0),0))+")","Kontrak ditandatangani: "+d.deal.length+" ("+rp(d.deal.reduce((s,r)=>s+(r.p.feeDisetujui||0),0))+")",""];
  d.masuk.forEach((r,i)=>{const l=(r.p.riwayat||[]).slice(-1)[0];L.push((i+1)+". "+r.f.namaPT+" — "+STATUS[r.st].label+(r.p.feeDisetujui?" — "+rp(r.p.feeDisetujui):"")+(l&&l.catatan?" ("+l.catatan+")":""))});return L.join("\n")}

/* ---------- data & parameter ---------- */
const PROP_FIELDS=[["namaKAP","Nama KAP",1],["izinUsaha","Baris izin usaha (kop)",1],["alamatKAP","Alamat (kaki surat)",1],["teleponKAP","Telepon"],["emailKAP","Email kantor"],["websiteKAP","Website"],["kotaSurat","Kota tanggal surat"],
  ["penandatangan","Penanda tangan (nama & gelar)",1],["jabatanPenandatangan","Jabatan penanda tangan"],["kodeNomor","Kode nomor surat"],["eksemplar","Jumlah eksemplar laporan"],["hariKerja","Lama pelaksanaan (hari kerja)"],["klausulPajak","Klausul setelah nilai fee",1],
  ["emailCcProposal","Email tembusan (CC) proposal",1],["emailBalasan","Alamat balasan (Reply-To), kosongkan bila ke Gmail pengirim",1]];
function nomorBerikut(){const s=S.set,d=new Date(),th=d.getFullYear(),R=["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII"];const u=(+s.nomorTahun===th?+s.nomorUrut||0:0)+1;return String(u).padStart(3,"0")+"/"+(s.kodeNomor||"SHS-PN")+"/"+R[d.getMonth()]+"/"+th}
function vData(){const H=S.hist;const q=S.hq.toLowerCase();
  const rows=H.filter(h=>(!S.hb||h[2]===S.hb)&&(!q||h[0].toLowerCase().includes(q))).sort((a,b)=>b[8]-a[8]);
  const fees=H.map(h=>h[8]).sort((a,b)=>a-b);const med=fees.length?fees[Math.floor(fees.length/2)]:0;const s=S.set;
  const sim=S.sim||{omset:0,aset:0,bidang:"",standar:"Belum tahu",kepemilikan:"Swasta",konsolidasi:"Tidak",bahasa:"Bahasa Indonesia",pernahAudit:"Sudah",tujuan:[]};
  const simFee=(sim.omset||sim.aset)?hitungFee(sim):null;
  return `<div class="stack"><div class="card"><h3>Link formulir untuk calon klien</h3><p class="small muted" style="margin-top:-4px">Kirim link ini ke calon klien lewat email atau WhatsApp, atau pasang di website kapshs.com. Calon klien tidak perlu login.</p>
   <div class="row"><input id="urlPub" readonly value="${esc(S.urlPublik)}" style="flex:1 1 260px;font-family:var(--f-data);font-size:12.5px"><button type="button" class="btn primary" data-act="salinLink">Salin link</button><a class="btn" href="${esc(S.urlPublik)}" target="_blank" rel="noopener" style="text-decoration:none">Buka formulir</a></div>
   ${S.urlSheet?`<p class="small" style="margin:10px 0 0"><a href="${esc(S.urlSheet)}" target="_blank" rel="noopener">Buka spreadsheet data (Pengajuan, Historis, Parameter, Pengguna)</a></p>`:""}</div>
  <div><h2>Data fee historis &amp; parameter</h2><p class="lead">Dasar perhitungan usulan fee: ${H.length} klien historis dari sheet "Historis", ditambah kontrak yang sudah ditandatangani di sistem ini. Tambah atau koreksi data historis langsung di sheet tersebut.</p></div>
  ${!H.length?`<div class="msg info">Sheet "Historis" masih kosong. Jalankan setup() di editor Apps Script.</div>`:""}
  <div class="kpis"><div class="kpi"><div class="l">Klien historis</div><div class="v">${H.length}</div></div><div class="kpi"><div class="l">Fee terendah</div><div class="v">${rpS(fees[0])}</div></div><div class="kpi"><div class="l">Median fee</div><div class="v">${rpS(med)}</div></div><div class="kpi"><div class="l">Fee tertinggi</div><div class="v">${rpS(fees[fees.length-1])}</div></div></div>
  <div class="grid2"><div class="card"><h3>Simulasi cepat</h3><div class="fields">
    <label class="f">Omset<input id="sOmset" class="money" inputmode="numeric" value="${sim.omset?nf.format(sim.omset):""}" placeholder="0"></label>
    <label class="f">Total aset<input id="sAset" class="money" inputmode="numeric" value="${sim.aset?nf.format(sim.aset):""}" placeholder="0"></label>
    <label class="f">Bidang<select id="sBidang">${opt(BIDANG,sim.bidang,"Semua bidang")}</select></label>
    <label class="f">Standar<select id="sStandar">${opt(["Belum tahu",...STANDAR],sim.standar)}</select></label>
    <label class="f">Kepemilikan<select id="sKep">${opt(KEPEMILIKAN,sim.kepemilikan)}</select></label>
    <label class="f">Konsolidasi<select id="sKon">${opt(["Tidak","Ya"],sim.konsolidasi)}</select></label></div>
    <button type="button" class="btn primary" data-act="simulasi" style="margin-top:12px">Hitung</button>
    <div style="margin-top:14px">${simFee?feeBlock(simFee)+'<div style="margin-top:10px">'+pembandingTable(simFee)+"</div>":`<p class="small muted">Isi omset atau aset lalu tekan Hitung.</p>`}</div></div>
  <div class="card"><h3>Parameter</h3><p class="small muted" style="margin-top:-4px">Persentase penyesuaian ditambahkan ke dasar fee. Nilai awal adalah asumsi; sesuaikan dengan kebijakan fee KAP.</p>
   <div class="fields">
   <label class="f" style="grid-column:1/-1">Metode dasar fee<select id="p_metodeFee">${Object.entries(METODE).map(([k,l])=>`<option value="${k}"${(s.metodeFee||"gabungan")===k?" selected":""}>${esc(l)}</option>`).join("")}</select></label>
   ${[["inggris","Laporan bahasa Inggris (%)"],["bilingual","Laporan bilingual (%)"],["auditPertama","Audit tahun pertama (%)"],["ojk","Tujuan OJK (%)"],["deadlineKetat","Tenggat ketat (%)"],["hariKetat","Batas tenggat ketat (hari)"],["feeTahunTambahan","Fee tiap tahun buku tambahan (% dari 1 tahun)"]].map(([k,l])=>`<label class="f">${l}<input id="p_${k}" type="number" min="0" step="1" value="${esc(s[k])}"></label>`).join("")}
   <label class="f">Fee minimum (Rp)<input id="p_feeMin" class="money" inputmode="numeric" value="${nf.format(s.feeMin||0)}"></label>
   <label class="f">Pembulatan (Rp)<input id="p_pembulatan" class="money" inputmode="numeric" value="${nf.format(s.pembulatan||0)}"></label>
   <label class="f">Email notifikasi formulir masuk<input id="p_emailNotifikasi" value="${esc(s.emailNotifikasi||"")}" placeholder="admin@kapshs.com"></label>
   <label class="f">Email laporan bulanan (tiap tanggal 1)<input id="p_emailLaporan" value="${esc(s.emailLaporan||"")}" placeholder="partner1@..., partner2@..."></label></div>
   <button type="button" class="btn primary" data-act="simpanParam" style="margin-top:12px">Simpan parameter</button>
   <details style="margin-top:14px"><summary class="small" style="cursor:pointer;font-weight:700">Cara sistem menghitung</summary><p class="small"><b>Metode gabungan (bawaan)</b> = rata-rata hasil metode persentase dan metode pembanding. <b>Metode persentase:</b> fee = rata-rata dari (omset × persentase fee historis kelompok omsetnya) dan (total aset × persentase fee historis kelompok asetnya); tabel persentasenya ada di kartu "Persentase fee historis per kelompok ukuran". Bila hanya omset atau aset yang terisi, dipakai yang ada. <b>Metode pembanding:</b> median tertimbang fee 8 klien historis paling mirip menurut skala omset dan aset, bidang usaha, standar, kepemilikan, dan konsolidasi; daftar pembandingnya tetap ditampilkan pada semua metode sebagai acuan. Setelah dasar fee didapat, persentase penyesuaian di atas diterapkan, lalu dibulatkan dan dijaga tidak di bawah fee minimum. Keyakinan menunjukkan seberapa mirip klien pembanding: Tinggi bila rata-rata jarak di bawah 0,8, Sedang di bawah 1,6.</p></details></div></div>
  <div class="card"><h3>Persentase fee historis per kelompok ukuran</h3><p class="small muted" style="margin-top:-4px">Dihitung otomatis dari sheet Historis dan kontrak yang sudah ditandatangani: rata-rata fee ÷ omset dan fee ÷ total aset, dihitung dari 50% data tengah (tanpa 25% data teratas dan 25% terbawah) agar tidak terdistorsi pencilan. Rentang usulan memakai kuartil 25%–75%. Di antara dua kelompok, persentase diperhalus agar fee tidak melompat di batas kelompok.</p>
   <div class="grid2">${[["omset","Fee ÷ omset"],["aset","Fee ÷ total aset"]].map(([k,l])=>`<div class="scroll"><table><thead><tr><th>${l}</th><th class="r">Data</th><th class="r">Rata-rata</th><th class="r">Kuartil 25–75%</th></tr></thead><tbody>
   ${persenTabel()[k].map(b=>`<tr><td>${esc(b.label)}</td><td class="r num">${b.n}</td><td class="r num">${b.n?esc(pctTxt(b.avg)):"–"}</td><td class="r num">${b.n?esc(pctTxt(b.p25))+" – "+esc(pctTxt(b.p75)):"–"}</td></tr>`).join("")}</tbody></table></div>`).join("")}</div></div>
  <div class="card"><h3>Template proposal</h3><p class="small muted" style="margin-top:-4px">Dipakai untuk kop, tanda tangan, nomor surat, dan email proposal. Nomor berikutnya: <b class="num">${esc(nomorBerikut())}</b></p>
   <div class="fields">${PROP_FIELDS.map(([k,l,w])=>`<label class="f"${w?' style="grid-column:1/-1"':""}>${l}<input id="pp_${k}" value="${esc(s[k]==null?"":s[k])}"></label>`).join("")}</div>
   <button type="button" class="btn primary" data-act="simpanProposalParam" style="margin-top:12px">Simpan template proposal</button></div>  <div class="card"><div class="row" style="justify-content:space-between"><h3 style="margin:0">Data historis</h3><div class="row"><select id="hB" style="width:auto;max-width:240px">${opt(BIDANG,S.hb,"Semua bidang")}</select><input id="hQ" placeholder="Cari nama" value="${esc(S.hq)}" style="width:180px"></div></div>
   <div class="scroll" style="margin-top:12px;max-height:520px;overflow:auto"><table><thead><tr><th>Nama</th><th>Bidang</th><th>Standar</th><th>Kepemilikan</th><th>Kons.</th><th class="r">Pendapatan</th><th class="r">Total aset</th><th class="r">Fee</th></tr></thead><tbody>
   ${rows.map(h=>`<tr><td>${esc(h[0])}</td><td class="small">${esc(h[2])}</td><td class="small">${esc(h[3])}</td><td class="small">${esc(h[4])}</td><td class="small">${esc(h[5])}</td><td class="r num">${rpS(h[6])}</td><td class="r num">${rpS(h[7])}</td><td class="r num">${rpS(h[8])}</td></tr>`).join("")}</tbody></table></div>
   <p class="small muted">${rows.length} baris ditampilkan.</p></div></div>`}

/* ---------- events ---------- */
document.getElementById("app").addEventListener("click",async e=>{
  const s=e.target.closest("[data-sel]");if(s){S.sel=s.dataset.sel;S.confirm=null;render();return}
  const sp=e.target.closest("[data-selp]");if(sp){S.selP=sp.dataset.selp;S.confirm=null;render();return}
  const b=e.target.closest("[data-act]");if(!b)return;const act=b.dataset.act;const r=b.dataset.fid&&rec(b.dataset.fid);
  try{
  if(act==="batalConfirm"){S.confirm=null;render()}
  else if(act==="isiLagi"){S.done=null;S.force=true;render();window.scrollTo(0,0)}
  else if(act==="lihatBaru"){S.done=null;S.sel=b.dataset.fid;S.filt="semua";S.tab="pengajuan";S.force=true;render()}
  else if(act==="salinLink"){const t=S.urlPublik;try{await navigator.clipboard.writeText(t);toast("Link formulir disalin")}catch(_){const i=document.getElementById("urlPub");if(i){i.focus();i.select()}toast("Tekan Ctrl+C untuk menyalin")}}
  else if(act==="kirimPartner"){const fee=hitungFee(r.f);const aju=digits(document.getElementById("feeAju").value)||(fee&&fee.usulan);if(!aju){toast("Isi fee yang diajukan");return}
    b.disabled=true;await aksi({jenis:"kirimPartner",fid:r.fid,feeSistem:fee,fee:aju,catatan:document.getElementById("catAju").value.trim()});toast("Terkirim ke Partner")}
  else if(act==="progres"){S.confirm={fid:r.fid,act:"progres",st:document.getElementById("stNew").value,note:document.getElementById("stNote").value.trim(),fee:document.getElementById("feeFinal")?digits(document.getElementById("feeFinal").value):0};render();
    const n=document.getElementById("stNote");if(n)n.value=S.confirm.note;const ff=document.getElementById("feeFinal");if(ff&&S.confirm.fee)ff.value=nf.format(S.confirm.fee);const sn=document.getElementById("stNew");if(sn)sn.value=S.confirm.st}
  else if(act==="progresYa"){const c=S.confirm;S.confirm=null;b.disabled=true;
    await aksi({jenis:"progres",fid:r.fid,status:c.st,catatan:c.note,fee:c.fee||0});toast("Progres tersimpan")}
  else if(act==="putus"){const k=b.dataset.k;const note=document.getElementById("pNote").value.trim();const fee=digits(document.getElementById("pFee").value);
    if(k!=="setuju"&&!note){const m=document.getElementById("pMsg");m.className="msg bad";m.style.marginTop="10px";m.textContent="Tulis catatan agar admin tahu apa yang perlu diubah.";return}
    if(k==="setuju"&&!fee){toast("Isi fee yang disetujui");return}
    S.confirm={fid:r.fid,act:k,fee,note};render();document.getElementById("pNote").value=note;document.getElementById("pFee").value=fee?nf.format(fee):""}
  else if(act==="putusYa"){const c=S.confirm;S.confirm=null;b.disabled=true;
    await aksi({jenis:"putus",fid:r.fid,k:c.act,fee:c.fee,catatan:c.note});
    toast(c.act==="setuju"?"Fee disetujui":c.act==="revisi"?"Dikembalikan ke admin":"Pengajuan ditolak")}
  else if(act==="buatProposal"){S.busy=r.fid;S.confirm=null;render();try{await aksi({jenis:"buatProposal",fid:r.fid});toast("Proposal dibuat. Periksa isinya lalu kirim.")}finally{S.busy=null;S.force=true;render()}}
  else if(act==="kirimProposal"){const ke=document.getElementById("prKe").value.trim();if(!/^\S+@\S+\.\S+$/.test(ke)){toast("Alamat email penerima belum benar");return}S.confirm={fid:r.fid,act:"kirimProposal",ke};render()}
  else if(act==="kirimProposalYa"){const ke=S.confirm.ke;S.busy=r.fid;render();try{await aksi({jenis:"kirimProposal",fid:r.fid,ke});S.confirm=null;toast("Proposal terkirim ke "+ke)}finally{S.busy=null;S.force=true;render()}}
  else if(act==="hapus"){S.confirm={fid:r.fid,act:"hapus"};render()}
  else if(act==="hapusYa"){S.confirm=null;b.disabled=true;await aksi({jenis:"hapus",fid:r.fid});S.sel=null;toast("Pengajuan dihapus")}
  else if(act==="salinDraf"){const t=document.getElementById("draf");try{await navigator.clipboard.writeText(t.value);toast("Draf disalin")}catch(_){t.select();toast("Tekan Ctrl+C untuk menyalin")}}
  else if(act==="salinRingkas"){const t=ringkasan();try{await navigator.clipboard.writeText(t);toast("Ringkasan disalin")}catch(_){toast("Browser menolak menyalin otomatis")}}
  else if(act==="ekspor"){b.disabled=true;b.textContent="Membuat sheet…";const x=barisLaporan();
    try{const url=await api("eksporLaporan",S.token,"Laporan New Client KAP SHS - "+blnLabel(S.bulan),x.head,x.rows);S.lapUrl[S.bulan]=url;render();toast("Google Sheet laporan dibuat")}
    catch(err){if(isSesi(err))keluar("Sesi berakhir, silakan masuk lagi");else toast(errMsg(err));b.disabled=false;b.textContent="Buat Google Sheet"}}
  else if(act==="simulasi"){S.sim={omset:digits(document.getElementById("sOmset").value),aset:digits(document.getElementById("sAset").value),bidang:document.getElementById("sBidang").value,standar:document.getElementById("sStandar").value,kepemilikan:document.getElementById("sKep").value,konsolidasi:document.getElementById("sKon").value,bahasa:"Bahasa Indonesia",pernahAudit:"Sudah",tujuan:[]};render()}
  else if(act==="simpanProposalParam"){const n={};for(const [k] of PROP_FIELDS)n[k]=document.getElementById("pp_"+k).value.trim();n.eksemplar=Math.max(1,Number(n.eksemplar)||3);n.hariKerja=Math.max(1,Number(n.hariKerja)||30);
    b.disabled=true;await aksi({jenis:"simpanParam",set:n});toast("Template proposal tersimpan")}
  else if(act==="simpanParam"){const n={};for(const k of ["inggris","bilingual","auditPertama","ojk","deadlineKetat","hariKetat","feeTahunTambahan"])n[k]=Math.max(0,Number(document.getElementById("p_"+k).value)||0);
    n.feeMin=digits(document.getElementById("p_feeMin").value);n.pembulatan=digits(document.getElementById("p_pembulatan").value)||1;
    n.metodeFee=document.getElementById("p_metodeFee").value;n.emailNotifikasi=document.getElementById("p_emailNotifikasi").value.trim();n.emailLaporan=document.getElementById("p_emailLaporan").value.trim();
    b.disabled=true;await aksi({jenis:"simpanParam",set:n});toast("Parameter tersimpan")}
  }catch(err){b.disabled=false}
});
document.getElementById("app").addEventListener("input",e=>{const t=e.target;
  if(t.classList.contains("money")&&!t.closest("#clientForm")){const n=digits(t.value);t.value=n?nf.format(n):""}
  if(t.id==="fQ"){S.q=t.value;clearTimeout(S._qt);S._qt=setTimeout(()=>{render();const i=document.getElementById("fQ");if(i){i.focus();i.setSelectionRange(i.value.length,i.value.length)}},250)}
  if(t.id==="hQ"){S.hq=t.value;clearTimeout(S._ht);S._ht=setTimeout(()=>{render();const i=document.getElementById("hQ");if(i){i.focus();i.setSelectionRange(i.value.length,i.value.length)}},250)}});
document.getElementById("app").addEventListener("change",e=>{const t=e.target;
  if(t.id==="fSel"){S.filt=t.value;render()} if(t.id==="bSel"){S.bulan=t.value;render()} if(t.id==="hB"){S.hb=t.value;render()}});

/* ---------- boot ---------- */
function quiet(){const a=document.activeElement;return !(a&&a.closest&&a.closest("#app")&&/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName))&&!S.confirm}
async function refresh(){if(!S.token||document.hidden||!quiet()||S.tab==="form")return;
  try{load(await api("getData",S.token));render()}catch(e){if(isSesi(e))keluar("Sesi berakhir, silakan masuk lagi")}}
async function boot(){
  if(MODE!=="kantor"){S.force=true;render();return}
  try{S.token=localStorage.getItem("shs_tok");const t=sessionStorage.getItem("shs_tab");if(t)S.tab=t}catch(_){}
  if(S.token){document.getElementById("app").innerHTML=`<div class="empty"><strong>Memuat data…</strong></div>`;
    try{load(await api("getData",S.token))}catch(e){S.token=null;S.me=null;if(isSesi(e)){try{localStorage.removeItem("shs_tok")}catch(_){}}}}
  S.force=true;render();
  setInterval(refresh,90000);
}
boot();
})();
