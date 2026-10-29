import {useEffect,useMemo,useRef,useState} from "react";
import {certificatePreviewUrl,createCertificateView,downloadCertificatePng,printCertificate} from "../certificate/certificate";
import type {GameResult} from "../game/types";

interface CertificateDialogProps{
  open:boolean;
  sessionId:string;
  playerName:string;
  result:GameResult;
  onClose:()=>void;
}

export function CertificateDialog({open,sessionId,playerName,result,onClose}:CertificateDialogProps){
  const [busy,setBusy]=useState(false),[message,setMessage]=useState(""),[error,setError]=useState("");
  const dialog=useRef<HTMLElement>(null),first=useRef<HTMLButtonElement>(null),previousFocus=useRef<HTMLElement|null>(null),busyRef=useRef(false),closeRef=useRef(onClose);
  busyRef.current=busy;closeRef.current=onClose;
  const input=useMemo(()=>({sessionId,playerName,result}),[sessionId,playerName,result]);
  const view=useMemo(()=>createCertificateView(input),[input]);
  const preview=useMemo(()=>certificatePreviewUrl(input),[input]);

  useEffect(()=>{
    if(!open)return;
    setMessage("");setError("");
    previousFocus.current=document.activeElement instanceof HTMLElement?document.activeElement:null;
    window.setTimeout(()=>first.current?.focus(),0);
    const listener=(event:KeyboardEvent)=>{
      if(event.key==="Escape"&&!busyRef.current){event.preventDefault();closeRef.current();return;}
      if(event.key!=="Tab"||!dialog.current)return;
      const focusable=[...dialog.current.querySelectorAll<HTMLElement>('button:not([disabled]),a[href],[tabindex]:not([tabindex="-1"])')];
      if(focusable.length===0)return;
      const firstItem=focusable[0]!,lastItem=focusable[focusable.length-1]!;
      if(event.shiftKey&&document.activeElement===firstItem){event.preventDefault();lastItem.focus();}
      else if(!event.shiftKey&&document.activeElement===lastItem){event.preventDefault();firstItem.focus();}
    };
    document.addEventListener("keydown",listener);
    return()=>{document.removeEventListener("keydown",listener);previousFocus.current?.focus();};
  },[open]);

  if(!open)return null;
  async function download(){
    setBusy(true);setMessage("");setError("");
    try{const format=await downloadCertificatePng(input);setMessage(format==="png"?"Sertifikat PNG berhasil diunduh.":"Browser menggunakan format SVG agar sertifikat tetap dapat diunduh.");}
    catch(reason){setError(reason instanceof Error?reason.message:"Sertifikat belum dapat diunduh.");}
    finally{setBusy(false);}
  }
  function print(){
    setMessage("");setError("");
    try{printCertificate(input);setMessage("Jendela cetak dibuka. Pilih ‘Simpan sebagai PDF’ untuk mengunduh PDF.");}
    catch(reason){setError(reason instanceof Error?reason.message:"Jendela cetak belum dapat dibuka.");}
  }

  return <div className="modal-backdrop certificate-backdrop" role="presentation" onMouseDown={event=>{if(event.target===event.currentTarget&&!busy)onClose();}}><section ref={dialog} className="certificate-dialog" role="dialog" aria-modal="true" aria-labelledby="certificate-title" aria-describedby="certificate-description"><button ref={first} className="modal-close" onClick={onClose} disabled={busy} aria-label="Tutup pratinjau sertifikat">×</button><div className="certificate-heading"><span className="eyebrow-blue">SERTIFIKAT PENCAPAIAN</span><h2 id="certificate-title">Nilai {view.score} layak dirayakan.</h2><p id="certificate-description">Periksa nama dan nilai, lalu unduh sertifikat pencapaian game edukasi ini.</p></div><div className="certificate-preview-frame"><img className="certificate-preview" src={preview} alt={`Pratinjau sertifikat ${view.playerName} dengan nilai ${view.score} dari 100`}/></div><div className="certificate-meta"><span>{view.tierLabel}</span><span>ID: {view.certificateId}</span></div><p className="certificate-note">{view.notice} Data pada sertifikat berasal dari hasil sesi yang dinyatakan menang oleh game.</p>{error&&<p className="error-text" role="alert">{error}</p>}{message&&<p className="certificate-status" role="status">{message}</p>}<div className="certificate-actions"><button className="primary-game-button" onClick={()=>void download()} disabled={busy}>{busy?<span className="spinner"/>:null}{busy?"Menyiapkan sertifikat…":"Unduh Sertifikat PNG"}</button><button className="secondary-cta certificate-print-button" onClick={print} disabled={busy}>Cetak / Simpan PDF</button></div></section></div>;
}
