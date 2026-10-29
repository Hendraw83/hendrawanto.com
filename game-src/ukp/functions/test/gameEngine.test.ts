import {describe,expect,it} from "vitest";
import {Timestamp} from "firebase-admin/firestore";
import {computeAnswer,compareLeaderboard} from "../src/gameEngine";
import type {SessionDocument} from "../src/model";

function session(overrides:Partial<SessionDocument>={}):SessionDocument{
  const now=Timestamp.fromMillis(1_000);
  return {ownerUid:"u",bankVersion:"v",phase:"answering",active:true,order:Array.from({length:100},(_,i)=>`q${i}`),cursor:0,score:0,correctCount:0,wrongCount:0,lives:41,position:0,totalAnswerMs:0,startedAt:now,completedAt:null,updatedAt:now,turn:null,feedback:null,pendingOutcome:null,summitMode:false,...overrides};
}

describe("server game engine",()=>{
  it("jawaban benar menaikkan skor dan tangga tepat satu",()=>{const result=computeAnswer({session:session(),correct:true,timedOut:false,nowMs:5_000,startedAtMs:1_000});expect(result).toMatchObject({score:1,position:1,lives:41,wrongCount:0,durationMs:4_000});});
  it("jawaban salah tetap di tangga dan mengurangi satu nyawa",()=>{const result=computeAnswer({session:session({position:8,lives:41}),correct:false,timedOut:false,nowMs:5_000,startedAtMs:1_000});expect(result).toMatchObject({score:0,position:8,lives:40,wrongCount:1});});
  it("skor 60 membuka gerbang dasar",()=>{const result=computeAnswer({session:session({score:59,correctCount:59,position:59}),correct:true,timedOut:false,nowMs:2_000,startedAtMs:1_000});expect(result.pendingOutcome).toEqual({outcome:"won",reason:"score"});});
  it("mode lanjutan tidak berhenti lagi pada 60",()=>{const result=computeAnswer({session:session({score:60,correctCount:60,position:60,summitMode:true}),correct:true,timedOut:false,nowMs:2_000,startedAtMs:1_000});expect(result.pendingOutcome).toBeNull();});
  it("tangga 100 menghasilkan puncak utama",()=>{const result=computeAnswer({session:session({score:99,correctCount:99,position:99,cursor:99,summitMode:true}),correct:true,timedOut:false,nowMs:2_000,startedAtMs:1_000});expect(result.pendingOutcome).toEqual({outcome:"summit",reason:"summit"});});
  it("urutan leaderboard mengikuti empat kriteria",()=>{const rows=[{score:60,wrongCount:2,totalAnswerMs:100,completedAt:1},{score:61,wrongCount:9,totalAnswerMs:999,completedAt:9},{score:60,wrongCount:1,totalAnswerMs:500,completedAt:2}];expect(rows.sort(compareLeaderboard).map(row=>row.score+":"+row.wrongCount)).toEqual(["61:9","60:1","60:2"]);});
});
