import {useEffect,useRef,useState} from "react";
import type {ClaimInput,LeaderboardEntry} from "../game/types";

export function ClaimDialog({open,initialDisplayName,onClose,onClaim}:{open:boolean;initialDisplayName:string;onClose:()=>void;onClaim:(input:ClaimInput)=>Promise<{entry:LeaderboardEntry;duplicate:boolean}>}){
  const [name,setName]=useState(initialDisplayName),[email,setEmail]=useState(""),[phone,setPhone]=useState(""),[busy,setBusy]=useState(false),[error,setError]=useState("");
  const first=useRef<HTMLInputElement>(null),dialog=useRef<HTMLElement>(null),previousFocus=useRef<HTMLElement|null>(null),busyRef=useRef(false),closeRef=useRef(onClose);
  busyRef.current=busy;closeRef.current=onClose;
  useEffect(()=>{
    if(!open)return;
    setName(current=>current||initialDisplayName);
    previousFocus.current=document.activeElement instanceof HTMLElement?document.activeElement:null;
    first.current?.focus();
    const listener=(event:KeyboardEvent)=>{
      if(event.key==="Escape"&&!busyRef.current){event.preventDefault();closeRef.current();return;}
      if(event.key!=="Tab"||!dialog.current)return;
      const focusable=[...dialog.current.querySelectorAll<HTMLElement>('button:not([disabled]),input:not([disabled]),a[href],[tabindex]:not([tabindex="-1"])')];
      if(focusable.length===0)return;
      const firstItem=focusable[0]!,lastItem=focusable[focusable.length-1]!;
      if(event.shiftKey&&document.activeElement===firstItem){event.preventDefault();lastItem.focus();}
      else if(!event.shiftKey&&document.activeElement===lastItem){event.preventDefault();firstItem.focus();}
    };
    document.addEventListener("keydown",listener);
    return()=>{document.removeEventListener("keydown",listener);previousFocus.current?.focus();};
  },[open,initialDisplayName]);
  if(!open)return null;
  async function submit(event:React.FormEvent){event.preventDefault();setBusy(true);setError("");try{await onClaim({displayName:name,email:email||undefined,phone:phone||undefined});onClose();}catch(reason){setError(reason instanceof Error?reason.message:"Klaim belum dapat diproses.");}finally{setBusy(false);}}
  return <div className="modal-backdrop" role="presentation" onMouseDown={event=>{if(event.target===event.currentTarget&&!busy)onClose();}}><section ref={dialog} className="claim-dialog" role="dialog" aria-modal="true" aria-labelledby="claim-title"><button className="modal-close" onClick={onClose} disabled={busy} aria-label="Tutup formulir">×</button><span className="eyebrow-blue">KLAIM LEADERBOARD</span><h2 id="claim-title" className="mt-3 text-2xl font-black text-[#08264a]">Catat pencapaianmu</h2><p className="mt-2 text-sm leading-6 text-slate-500">Nama tampil publik selama tujuh hari. Email dan telepon bersifat opsional serta disimpan terpisah sebagai data privat.</p><form className="mt-5 grid gap-4" onSubmit={submit}><label className="form-label">Nama tampilan<input ref={first} value={name} onChange={event=>setName(event.target.value)} minLength={2} maxLength={24} required autoComplete="nickname"/></label><label className="form-label">Email opsional<input value={email} onChange={event=>setEmail(event.target.value)} type="email" autoComplete="email"/></label><label className="form-label">Telepon opsional<input value={phone} onChange={event=>setPhone(event.target.value)} type="tel" autoComplete="tel"/></label>{error&&<p className="error-text" role="alert">{error}</p>}<button className="primary-game-button" disabled={busy||name.trim().length<2}>{busy?<span className="spinner"/>:null} {busy?"Mengirim klaim…":"Klaim Pencapaian"}</button></form></section></div>;
}
