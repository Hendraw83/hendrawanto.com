import {beforeEach,describe,expect,it} from "vitest";
import rawBank from "../data/questions.demo.json";
import type {PrivateQuestion,SessionSnapshot} from "../game/types";
import {DemoBackend} from "./demoBackend";

const bank=new Map((rawBank as PrivateQuestion[]).map(question=>[question.id,question]));
async function correct(backend:DemoBackend,session:SessionSnapshot,index:number){
  const answer=bank.get(session.question!.id)!.correctOptionId;
  const feedback=await backend.submitAnswer({sessionId:session.id,turnId:session.turnId!,questionId:session.question!.id,selectedOptionId:answer,requestId:`correct-${index}`});
  return backend.nextQuestion({sessionId:session.id,requestId:`next-${index}`});
}

describe("demo backend",()=>{
  let backend:DemoBackend;
  beforeEach(async()=>{backend=new DemoBackend();await backend.resetSession();});
  it("klik ganda dengan requestId sama tidak menggandakan skor",async()=>{const session=await backend.startOrResumeSession(),question=bank.get(session.question!.id)!;const input={sessionId:session.id,turnId:session.turnId!,questionId:question.id,selectedOptionId:question.correctOptionId,requestId:"same-request"};const first=await backend.submitAnswer(input),second=await backend.submitAnswer(input);expect(first.score).toBe(1);expect(second.score).toBe(1);expect(second).toEqual(first);});
  it("jawaban salah dan timeout mengurangi nyawa tepat satu",async()=>{const session=await backend.startOrResumeSession(),question=bank.get(session.question!.id)!;const wrong=question.options.find(option=>option.id!==question.correctOptionId)!;const result=await backend.submitAnswer({sessionId:session.id,turnId:session.turnId!,questionId:question.id,selectedOptionId:wrong.id,requestId:"wrong"});expect(result).toMatchObject({position:0,lives:40,wrongCount:1,phase:"feedback"});const resumed=await backend.startOrResumeSession();expect(resumed.lives).toBe(40);});
  it("gerbang 60 dapat dilanjutkan hingga puncak 100",async()=>{let session=await backend.startOrResumeSession();for(let i=0;i<60;i++)session=await correct(backend,session,i);expect(session).toMatchObject({phase:"won",score:60,position:60});session=await backend.continueToSummit({sessionId:session.id,requestId:"continue"});for(let i=60;i<100;i++)session=await correct(backend,session,i);expect(session).toMatchObject({phase:"summit",score:100,position:100});});
  it("klaim sesi yang sama diperbarui tanpa baris duplikat",async()=>{let session=await backend.startOrResumeSession();for(let i=0;i<60;i++)session=await correct(backend,session,i);await backend.claimWin(session.id,{displayName:"Aa Hendra"});session=await backend.continueToSummit({sessionId:session.id,requestId:"continue-claim"});for(let i=60;i<100;i++)session=await correct(backend,session,i);const update=await backend.claimWin(session.id,{displayName:"Aa Hendra"});const rows=await backend.getLeaderboard();expect(update.duplicate).toBe(false);expect(rows.filter(row=>row.id===session.id)).toHaveLength(1);expect(rows.find(row=>row.id===session.id)?.score).toBe(100);});
});
