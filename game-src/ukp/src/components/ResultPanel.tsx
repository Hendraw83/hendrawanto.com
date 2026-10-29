import {useState} from "react";
import {isCertificateEligible} from "../certificate/certificate";
import {GAME_CONFIG,GAME_COPY} from "../config/gameConfig";
import type {GameController} from "../hooks/useGameController";
import {CertificateDialog} from "./CertificateDialog";
import {ClaimDialog} from "./ClaimDialog";

const time=(ms:number)=>`${String(Math.floor(ms/60000)).padStart(2,"0")}:${String(Math.floor(ms/1000)%60).padStart(2,"0")}`;
export function ResultPanel({controller,playerName,onHall,onReplay}:{controller:GameController;playerName:string;onHall:()=>void;onReplay:()=>void}){
  const [claimOpen,setClaimOpen]=useState(false),[certificateOpen,setCertificateOpen]=useState(false),session=controller.state.session,result=session?.result;
  if(!session||!result)return null;
  const achievement=result.outcome!=="lost",summit=result.outcome==="summit",claimed=controller.state.phase==="claimed";
  const certificateEligible=isCertificateEligible(result);
  const canContinue=result.outcome==="won"&&session.position<GAME_CONFIG.stairCount&&session.lives>0&&session.questionIndex<session.questionCount;
  const eyebrow=summit?"PUNCAK KEMENANGAN UTAMA":achievement?"GERBANG KEMENANGAN DASAR":"SESI BERAKHIR";
  const title=summit?"Tangga 100 berhasil ditaklukkan!":achievement?"Kemenangan dasar sudah aman.":"Belum sampai gerbang—tetap belajar.";
  const body=summit?`AvatarMu menerima medali “${GAME_COPY.medal}” setelah mencapai puncak.`:achievement?"Skor 60 atau lebih telah tercapai. Klaim sekarang atau teruskan menuju puncak 100.":"Nyawa telah habis sebelum skor 60. Gunakan pembahasan sebagai peta latihan berikutnya.";
  return <><div className="result-overlay"><section className={`result-card ${achievement?"result-win":"result-lose"}`}><div className="result-medal" aria-hidden="true">{summit?"🏅":achievement?"★":"↘"}</div><span className="eyebrow-blue">{eyebrow}</span><h1 className="mt-3 text-3xl font-black text-[#08264a] sm:text-5xl">{title}</h1><p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-600">{body}</p><div className="result-stats"><div><span>Skor</span><b>{result.score}</b></div><div><span>Benar</span><b>{result.correctCount}</b></div><div><span>Salah</span><b>{result.wrongCount}</b></div><div><span>Waktu jawab</span><b>{time(result.totalAnswerMs)}</b></div></div><p className="education-notice">{GAME_COPY.educationalNotice}</p><div className="mt-6 flex flex-wrap justify-center gap-3">{certificateEligible&&<button className="certificate-button" onClick={()=>setCertificateOpen(true)}>▣ Unduh Sertifikat</button>}{achievement&&!claimed&&<button className="primary-game-button !w-auto" onClick={()=>setClaimOpen(true)}>Klaim Leaderboard</button>}{claimed&&<span className="claimed-badge">✓ Klaim tersimpan</span>}{canContinue&&<button className="summit-button" onClick={()=>void controller.continueToSummit()}>Lanjut ke Puncak 100 ↑</button>}<button className="secondary-cta !border-blue-200 !text-[#08264a]" onClick={onHall}>Lihat Hall of Fame</button><button className="secondary-cta !border-blue-200 !text-[#08264a]" onClick={onReplay}>Main Lagi</button></div>{canContinue&&<p className="mt-4 text-xs leading-5 text-slate-500">Kemenangan dasar tidak hilang. Jika pendakian lanjutan berhenti, skor terbaik sesi ini tetap dapat diklaim.</p>}</section></div><ClaimDialog open={claimOpen} initialDisplayName={playerName} onClose={()=>setClaimOpen(false)} onClaim={input=>controller.claim(input)}/><CertificateDialog open={certificateOpen} sessionId={session.id} playerName={playerName} result={result} onClose={()=>setCertificateOpen(false)}/></>;
}
