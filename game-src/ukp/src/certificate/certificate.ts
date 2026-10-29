import {GAME_CONFIG,GAME_COPY} from "../config/gameConfig";
import type {GameResult} from "../game/types";

export interface CertificateInput{
  sessionId:string;
  playerName:string;
  result:GameResult;
}

export interface CertificateView{
  certificateId:string;
  playerName:string;
  score:number;
  scoreLabel:string;
  tier:"gate"|"summit";
  tierLabel:string;
  achievementText:string;
  completedDate:string;
  correctCount:number;
  wrongCount:number;
  answerTime:string;
  notice:string;
}

const xml=(value:string)=>value.replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&apos;"}[char]!));
const cleanName=(value:string)=>value.normalize("NFKC").replace(/[<>\u0000-\u001f\u007f-\u009f]/g,"").replace(/\s{2,}/g," ").trim().slice(0,24)||"Pemain UKP A";
const duration=(ms:number)=>`${String(Math.floor(Math.max(0,ms)/60000)).padStart(2,"0")}:${String(Math.floor(Math.max(0,ms)/1000)%60).padStart(2,"0")}`;

function jakartaDateParts(timestamp:number){
  const parts=new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Jakarta",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(new Date(timestamp));
  const value=(type:"year"|"month"|"day")=>parts.find(part=>part.type===type)?.value??"00";
  return {year:value("year"),month:value("month"),day:value("day")};
}

export function isCertificateEligible(result:GameResult){
  return (result.outcome==="won"||result.outcome==="summit")&&result.score>=GAME_CONFIG.winScore;
}

export function createCertificateView(input:CertificateInput):CertificateView{
  if(!isCertificateEligible(input.result))throw new Error(`Sertifikat hanya tersedia untuk pemenang dengan nilai minimal ${GAME_CONFIG.winScore}.`);
  const score=Math.max(0,Math.min(GAME_CONFIG.stairCount,Math.floor(input.result.score)));
  const tier=input.result.outcome==="summit"||score>=GAME_CONFIG.stairCount?"summit":"gate";
  const completedAt=Number.isFinite(input.result.completedAt)?input.result.completedAt:Date.now();
  const date=jakartaDateParts(completedAt);
  const sessionPart=input.sessionId.replace(/[^a-z0-9]/gi,"").slice(-8).toUpperCase().padStart(8,"0");
  return {
    certificateId:`HE-UKPA-${date.year}${date.month}${date.day}-${sessionPart}`,
    playerName:cleanName(input.playerName),
    score,
    scoreLabel:`${score} / ${GAME_CONFIG.stairCount}`,
    tier,
    tierLabel:tier==="summit"?"PUNCAK KEMENANGAN UTAMA":"GERBANG KEMENANGAN DASAR",
    achievementText:tier==="summit"?"berhasil menaklukkan seluruh 100 tangga menuju Puncak Kemenangan":"berhasil melewati Gerbang Kemenangan Dasar pada tangga 60",
    completedDate:new Intl.DateTimeFormat("id-ID",{timeZone:"Asia/Jakarta",day:"numeric",month:"long",year:"numeric"}).format(new Date(completedAt)),
    correctCount:Math.max(0,Math.floor(input.result.correctCount)),
    wrongCount:Math.max(0,Math.floor(input.result.wrongCount)),
    answerTime:duration(input.result.totalAnswerMs),
    notice:GAME_COPY.certificateNotice,
  };
}

export function buildCertificateSvg(input:CertificateInput){
  const certificate=createCertificateView(input);
  const nameSize=certificate.playerName.length>21?58:certificate.playerName.length>16?66:76;
  const medalText=certificate.tier==="summit"?"100":"60+";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1131" viewBox="0 0 1600 1131" role="img" aria-labelledby="title desc">
  <title id="title">Sertifikat Pencapaian ${xml(certificate.playerName)}</title>
  <desc id="desc">Sertifikat game edukasi Latihan UKP Pajak Level A dengan nilai ${certificate.scoreLabel}</desc>
  <defs>
    <linearGradient id="paper" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fffdf8"/><stop offset="1" stop-color="#f3eee1"/></linearGradient>
    <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#f5d77b"/><stop offset=".48" stop-color="#bf7c24"/><stop offset="1" stop-color="#8d5918"/></linearGradient>
    <linearGradient id="navy" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#17384b"/><stop offset="1" stop-color="#315f68"/></linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#17384b" flood-opacity=".16"/></filter>
  </defs>
  <rect width="1600" height="1131" fill="url(#paper)"/>
  <path d="M0 0h460L0 330Z" fill="#dfeae2"/><path d="M1600 0h-360l360 280Z" fill="#f3dfb7"/><path d="M0 1131V920l300 211Z" fill="#f3dfb7"/><path d="M1600 1131V845l-390 286Z" fill="#dfeae2"/>
  <rect x="42" y="42" width="1516" height="1047" rx="28" fill="none" stroke="#17384b" stroke-width="5"/>
  <rect x="58" y="58" width="1484" height="1015" rx="22" fill="none" stroke="#bd7c32" stroke-width="2"/>
  <rect x="76" y="76" width="1448" height="979" rx="18" fill="#fffdf8" fill-opacity=".72" stroke="#d7c79d"/>
  <g transform="translate(105 92)"><rect width="82" height="82" rx="22" fill="url(#gold)"/><text x="41" y="54" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="34" font-weight="900" fill="#17384b">HE</text></g>
  <text x="210" y="121" font-family="Arial,Helvetica,sans-serif" font-size="23" font-weight="800" letter-spacing="4" fill="#315f68">GAME EDUKASI</text>
  <text x="210" y="157" font-family="Arial,Helvetica,sans-serif" font-size="18" font-weight="600" letter-spacing="2" fill="#7a8b82">LATIHAN UKP PAJAK LEVEL A</text>
  <text x="1490" y="127" text-anchor="end" font-family="Georgia,serif" font-size="20" font-weight="700" letter-spacing="2" fill="#315f68">HENDRAWANTO.COM</text>
  <line x1="105" y1="195" x2="1495" y2="195" stroke="#d7c79d" stroke-width="2"/>
  <text x="800" y="280" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="24" font-weight="800" letter-spacing="7" fill="#bd7c32">SERTIFIKAT PENCAPAIAN</text>
  <text x="800" y="347" text-anchor="middle" font-family="Georgia,serif" font-size="55" font-weight="700" fill="#17384b">Konsultan Pajak</text>
  <text x="800" y="402" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="21" fill="#6c8177">Diberikan kepada</text>
  <text x="800" y="493" text-anchor="middle" font-family="Georgia,serif" font-size="${nameSize}" font-weight="700" fill="#17384b">${xml(certificate.playerName)}</text>
  <path d="M430 525h740" stroke="#bd7c32" stroke-width="3"/><path d="M610 536h380" stroke="#d8c38c" stroke-width="1"/>
  <text x="800" y="581" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="21" fill="#536d61">atas pencapaian dalam permainan edukasi dan ${xml(certificate.achievementText)}</text>
  <g filter="url(#shadow)"><rect x="575" y="625" width="450" height="154" rx="77" fill="url(#navy)" stroke="#d6b257" stroke-width="6"/></g>
  <text x="800" y="680" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="18" font-weight="800" letter-spacing="4" fill="#f6dda0">NILAI</text>
  <text x="800" y="749" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="68" font-weight="900" fill="#ffffff">${xml(certificate.scoreLabel)}</text>
  <text x="800" y="824" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="20" font-weight="900" letter-spacing="4" fill="#a86b20">${xml(certificate.tierLabel)}</text>
  <g transform="translate(225 866)" font-family="Arial,Helvetica,sans-serif"><rect width="930" height="96" rx="22" fill="#edf3ee" stroke="#ccdbcf"/><line x1="310" y1="18" x2="310" y2="78" stroke="#ccdbcf"/><line x1="620" y1="18" x2="620" y2="78" stroke="#ccdbcf"/><text x="155" y="38" text-anchor="middle" font-size="16" font-weight="800" letter-spacing="2" fill="#71847a">BENAR</text><text x="155" y="71" text-anchor="middle" font-size="28" font-weight="900" fill="#17384b">${certificate.correctCount}</text><text x="465" y="38" text-anchor="middle" font-size="16" font-weight="800" letter-spacing="2" fill="#71847a">SALAH</text><text x="465" y="71" text-anchor="middle" font-size="28" font-weight="900" fill="#17384b">${certificate.wrongCount}</text><text x="775" y="38" text-anchor="middle" font-size="16" font-weight="800" letter-spacing="2" fill="#71847a">WAKTU JAWAB</text><text x="775" y="71" text-anchor="middle" font-size="28" font-weight="900" fill="#17384b">${certificate.answerTime}</text></g>
  <g transform="translate(1300 846)"><circle cx="82" cy="82" r="78" fill="url(#gold)"/><circle cx="82" cy="82" r="63" fill="none" stroke="#fff4ca" stroke-width="4" stroke-dasharray="5 7"/><path d="M48 81l23 23 48-52" fill="none" stroke="#fff" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/><text x="82" y="137" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="19" font-weight="900" fill="#fff">${medalText}</text></g>
  <text x="125" y="1008" font-family="Arial,Helvetica,sans-serif" font-size="17" font-weight="800" fill="#17384b">Diterbitkan: ${xml(certificate.completedDate)}</text>
  <text x="1475" y="1008" text-anchor="end" font-family="Arial,Helvetica,sans-serif" font-size="17" font-weight="800" fill="#17384b">ID Pencapaian: ${xml(certificate.certificateId)}</text>
  <text x="800" y="1044" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="14" fill="#6f7d75">${xml(certificate.notice)}</text>
  </svg>`;
}

export function certificatePreviewUrl(input:CertificateInput){
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(buildCertificateSvg(input))}`;
}

export function certificateFileName(input:CertificateInput,extension:"png"|"svg"="png"){
  const certificate=createCertificateView(input);
  const slug=certificate.playerName.normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,36)||"pemain";
  return `sertifikat-ukp-level-a-${slug}-nilai-${certificate.score}.${extension}`;
}

function saveBlob(blob:Blob,fileName:string){
  const url=URL.createObjectURL(blob),anchor=document.createElement("a");
  anchor.href=url;anchor.download=fileName;anchor.style.display="none";document.body.append(anchor);anchor.click();anchor.remove();
  window.setTimeout(()=>URL.revokeObjectURL(url),1000);
}

export async function downloadCertificatePng(input:CertificateInput):Promise<"png"|"svg">{
  const svg=buildCertificateSvg(input),svgBlob=new Blob([svg],{type:"image/svg+xml;charset=utf-8"}),url=URL.createObjectURL(svgBlob);
  try{
    const image=new Image();image.decoding="async";image.src=url;
    if(typeof image.decode==="function")await image.decode();else await new Promise<void>((resolve,reject)=>{image.onload=()=>resolve();image.onerror=()=>reject(new Error("Pratinjau sertifikat gagal dimuat."));});
    const canvas=document.createElement("canvas");canvas.width=1600;canvas.height=1131;
    const context=canvas.getContext("2d");if(!context)throw new Error("Canvas tidak tersedia.");
    context.fillStyle="#fffdf8";context.fillRect(0,0,canvas.width,canvas.height);context.drawImage(image,0,0,canvas.width,canvas.height);
    const png=await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,"image/png",1));if(!png)throw new Error("PNG tidak dapat dibuat.");
    saveBlob(png,certificateFileName(input,"png"));return "png";
  }catch{
    saveBlob(svgBlob,certificateFileName(input,"svg"));return "svg";
  }finally{URL.revokeObjectURL(url);}
}

export function printCertificate(input:CertificateInput){
  const printWindow=window.open("","_blank","width=1200,height=850");
  if(!printWindow)throw new Error("Jendela cetak diblokir browser. Izinkan pop-up, lalu coba lagi.");
  printWindow.opener=null;
  printWindow.document.open();
  printWindow.document.write(`<!doctype html><html lang="id"><head><meta charset="utf-8"><title>Sertifikat Pencapaian</title><style>@page{size:A4 landscape;margin:0}html,body{margin:0;background:#e8ece9}body{display:grid;min-height:100vh;place-items:center}svg{display:block;width:100%;height:auto;max-height:100vh}@media print{body{background:#fff}svg{width:297mm;height:210mm;max-height:none}}</style></head><body>${buildCertificateSvg(input)}</body></html>`);
  printWindow.document.close();
  window.setTimeout(()=>{printWindow.focus();printWindow.print();},350);
}
