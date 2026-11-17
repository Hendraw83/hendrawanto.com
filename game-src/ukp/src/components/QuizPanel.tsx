import type {GameController} from "../hooks/useGameController";

function optionClass(input:{chosen:boolean;correct:boolean;wrong:boolean}){return `answer-button ${input.chosen?"answer-chosen":""} ${input.correct?"answer-correct":""} ${input.wrong?"answer-wrong":""}`;}
const REPORT_WHATSAPP="https://wa.me/6287790487353";
function reportHref(level:string,id:string,sequence:number){return `${REPORT_WHATSAPP}?text=${encodeURIComponent(`Halo Pak Hendrawanto, saya ingin melaporkan soal game UKP Level ${level} (ID ${id}, Bank #${sequence}). Catatan saya: `)}`;}
export function QuizPanel({controller}:{controller:GameController}){
  const {state,timer}=controller,session=state.session,question=session?.question,feedback=session?.feedback;
  if(!session||!question)return <div className="flex min-h-[420px] items-center justify-center rounded-3xl bg-white"><span className="spinner spinner-blue"/><span className="ml-3 text-sm text-slate-500">Menyiapkan soal…</span></div>;
  const locked=state.phase!=="answering";
  const correctText=question.options.find(option=>option.id===feedback?.correctOptionId)?.text;
  return <section className="quiz-panel" aria-labelledby="question-heading">
    <div className="quiz-progress"><div className="quiz-progress-top"><b>Soal {session.questionIndex} <span>dari {session.questionCount}</span></b><small>Bank #{question.sequence}</small></div><div className="quiz-progress-bar" role="progressbar" aria-label="Kemajuan soal" aria-valuemin={0} aria-valuemax={session.questionCount} aria-valuenow={session.questionIndex}><span style={{width:`${Math.min(100,session.questionIndex/Math.max(1,session.questionCount)*100)}%`}}/></div></div>
    <div className="mt-4"><span className="topic-pill">{question.topic}</span></div>
    <div className={`timer-strip ${timer.seconds<=10&&state.phase==="answering"?"timer-danger":""}`} aria-label={`Sisa waktu ${timer.seconds} detik`}><span style={{width:`${timer.ratio*100}%`}}/><b>{state.phase==="answering"?`${timer.seconds} detik`:"Timer berhenti"}</b></div>
    <h2 id="question-heading" tabIndex={-1} className="mt-6 text-lg font-bold leading-8 text-[#08264a] sm:text-xl">{question.prompt}</h2>
    <div className="mt-5 grid gap-3" role="group" aria-label="Pilihan jawaban">{question.options.map((option,index)=>{
      const correct=Boolean(feedback&&option.id===feedback.correctOptionId),wrong=Boolean(feedback&&!feedback.correct&&option.id===feedback.selectedOptionId),chosen=state.selectedOptionId===option.id;
      return <button key={option.id} className={optionClass({chosen,correct,wrong})} onClick={()=>controller.select(option.id)} disabled={locked} aria-pressed={chosen}><span className="option-letter">{String.fromCharCode(65+index)}</span><span className="flex-1">{option.text}</span>{correct&&<b aria-label="Jawaban benar">✓</b>}{wrong&&<b aria-label="Jawaban salah">×</b>}</button>;
    })}</div>
    <div aria-live="polite" className="mt-5">
      {state.phase==="answering"&&<button className="primary-game-button" onClick={()=>void controller.submit()} disabled={!state.selectedOptionId}>Kunci Jawaban <span>→</span></button>}
      {(state.phase==="checking"||state.phase==="moving")&&<div className="status-box"><span className="spinner spinner-blue"/><p>{state.phase==="checking"?"Memeriksa jawaban di mesin permainan…":"AvatarMu merespons jawaban…"}</p></div>}
      {state.phase==="explanation"&&feedback&&<div className={`feedback-card ${feedback.correct?"feedback-correct":"feedback-wrong"}`}><div className="flex items-start justify-between gap-3"><strong>{feedback.timedOut?"Waktu habis":feedback.correct?"Jawaban benar":"Jawaban belum tepat"}</strong><span>{feedback.correct?"+1 tangga":`${feedback.livesDelta} nyawa`}</span></div>{!feedback.correct&&<p className="mt-3"><b>Jawaban tepat:</b> {correctText}</p>}<p className="mt-3 leading-7">{feedback.explanation}</p>{feedback.source.url?<a className="source-link" href={feedback.source.url} target="_blank" rel="noopener noreferrer">{feedback.source.label} ↗</a>:<p className="source-link" aria-label="Rujukan soal">{feedback.source.label}</p>}<a className="report-link" href={reportHref(controller.level,question.id,question.sequence)} target="_blank" rel="noopener noreferrer">Ada yang keliru? Laporkan soal ini ↗</a><button className="primary-game-button mt-5" onClick={()=>void controller.next()}>Lanjut <span>→</span></button></div>}
    </div>
  </section>;
}


