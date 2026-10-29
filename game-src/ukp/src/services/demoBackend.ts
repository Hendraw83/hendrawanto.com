import rawBank from "../data/questions.demo.json";
import {GAME_CONFIG} from "../config/gameConfig";
import {randomId,secureShuffle} from "../game/random";
import type {AnswerFeedback,BackendClient,ClaimInput,GameResult,LeaderboardEntry,PrivateQuestion,PublicQuestion,SessionPhase,SessionSnapshot} from "../game/types";

const SESSION_KEY="he-puncak-v2-session";
const LEADERBOARD_KEY="he-puncak-v2-leaderboard";
const CONTACT_KEY="he-puncak-v2-private-contacts";
const BANK_VERSION="aa-hendra-draft-2026-v1";
const bank=rawBank as PrivateQuestion[];
const questionMap=new Map(bank.map(question=>[question.id,question]));

interface DemoTurn {id:string;questionId:string;startedAt:number;deadlineAt:number;optionIds:string[]}
type PendingOutcome={outcome:"won"|"summit"|"lost";reason:GameResult["reason"]}|null;
interface DemoSession {
  id:string;bankVersion:string;phase:SessionPhase;order:string[];cursor:number;
  score:number;correctCount:number;wrongCount:number;lives:number;position:number;totalAnswerMs:number;
  startedAt:number;completedAt:number|null;turn:DemoTurn|null;feedback:AnswerFeedback|null;
  pendingOutcome:PendingOutcome;summitMode:boolean;processed:Record<string,SessionSnapshot>;
}

let memorySession:string|null=null;
let memoryLeaderboard="[]";
let memoryContacts="{}";
const storage={
  get(key:string){try{return localStorage.getItem(key);}catch{return key===SESSION_KEY?memorySession:key===LEADERBOARD_KEY?memoryLeaderboard:memoryContacts;}},
  set(key:string,value:string){try{localStorage.setItem(key,value);}catch{if(key===SESSION_KEY)memorySession=value;else if(key===LEADERBOARD_KEY)memoryLeaderboard=value;else memoryContacts=value;}},
  remove(key:string){try{localStorage.removeItem(key);}catch{if(key===SESSION_KEY)memorySession=null;}},
};

function makeTurn(questionId:string):DemoTurn{
  const question=questionMap.get(questionId);
  if(!question)throw new Error("Soal demo tidak ditemukan.");
  const startedAt=Date.now();
  return {id:randomId(),questionId,startedAt,deadlineAt:startedAt+GAME_CONFIG.answerSeconds*1000,optionIds:secureShuffle(question.options.map(option=>option.id))};
}
function publicQuestion(turn:DemoTurn):PublicQuestion{
  const question=questionMap.get(turn.questionId)!;
  const options=turn.optionIds.map(id=>question.options.find(option=>option.id===id)!);
  return {id:question.id,topic:question.topic,prompt:question.prompt,options,sequence:question.sequence};
}
function resultOf(session:DemoSession):GameResult|null{
  if(session.phase!=="won"&&session.phase!=="summit"&&session.phase!=="lost")return null;
  return {
    outcome:session.phase,
    reason:session.pendingOutcome?.reason??(session.phase==="summit"?"summit":session.phase==="won"?"score":"lives"),
    score:session.score,correctCount:session.correctCount,wrongCount:session.wrongCount,
    position:session.position,totalAnswerMs:session.totalAnswerMs,startedAt:session.startedAt,
    completedAt:session.completedAt??Date.now(),
  };
}
function snapshot(session:DemoSession):SessionSnapshot{
  return {
    id:session.id,phase:session.phase,mode:"demo",score:session.score,correctCount:session.correctCount,
    wrongCount:session.wrongCount,lives:session.lives,position:session.position,questionIndex:session.cursor+1,
    questionCount:session.order.length,totalAnswerMs:session.totalAnswerMs,startedAt:session.startedAt,
    deadlineAt:session.phase==="answering"?session.turn?.deadlineAt??null:null,
    turnId:session.turn?.id??null,question:session.turn?publicQuestion(session.turn):null,
    feedback:session.feedback,result:resultOf(session),
  };
}
function save(session:DemoSession){storage.set(SESSION_KEY,JSON.stringify(session));}
function load():DemoSession|null{
  const value=storage.get(SESSION_KEY);if(!value)return null;
  try{const parsed=JSON.parse(value) as DemoSession;return parsed.bankVersion===BANK_VERSION?parsed:null;}catch{return null;}
}
function cache(session:DemoSession,requestId:string,value:SessionSnapshot){
  session.processed[requestId]=value;
  const ids=Object.keys(session.processed);
  for(const id of ids.slice(0,Math.max(0,ids.length-24)))delete session.processed[id];
}
function newSession():DemoSession{
  if(bank.length<GAME_CONFIG.questionCount)throw new Error("Bank demo belum mencapai 100 soal unik.");
  const order=secureShuffle(bank.map(question=>question.id)).slice(0,GAME_CONFIG.questionCount);
  const session:DemoSession={
    id:randomId(),bankVersion:BANK_VERSION,phase:"answering",order,cursor:0,score:0,correctCount:0,
    wrongCount:0,lives:GAME_CONFIG.startLives,position:GAME_CONFIG.startPosition,totalAnswerMs:0,
    startedAt:Date.now(),completedAt:null,turn:makeTurn(order[0]),feedback:null,pendingOutcome:null,summitMode:false,processed:{},
  };
  save(session);return session;
}
function requireSession(id:string){const session=load();if(!session||session.id!==id)throw new Error("Sesi tidak ditemukan atau sudah kedaluwarsa.");return session;}
function resolveAnswer(session:DemoSession,input:{turnId:string;questionId:string;selectedOptionId:string|null;requestId:string},now=Date.now()):SessionSnapshot{
  const prior=session.processed[input.requestId];if(prior)return prior;
  if(session.phase!=="answering"||!session.turn)throw new Error("Sesi tidak sedang menerima jawaban.");
  if(session.turn.id!==input.turnId||session.turn.questionId!==input.questionId)throw new Error("Jawaban sudah kedaluwarsa. Muat ulang sesi.");
  const question=questionMap.get(session.turn.questionId)!;
  const timedOut=now>=session.turn.deadlineAt||input.selectedOptionId===null;
  if(input.selectedOptionId!==null&&!session.turn.optionIds.includes(input.selectedOptionId))throw new Error("Pilihan jawaban tidak valid.");
  const correct=!timedOut&&input.selectedOptionId===question.correctOptionId;
  const duration=Math.max(0,Math.min(GAME_CONFIG.answerSeconds*1000,now-session.turn.startedAt));
  session.totalAnswerMs+=duration;
  if(correct){session.score+=1;session.correctCount+=1;session.position=Math.min(GAME_CONFIG.stairCount,session.position+1);}
  else{session.wrongCount+=1;session.lives=Math.max(0,session.lives-1);}
  session.feedback={
    turnId:session.turn.id,questionId:question.id,selectedOptionId:timedOut?null:input.selectedOptionId,
    correctOptionId:question.correctOptionId,correct,timedOut,explanation:question.explanation,source:question.source,
    scoreDelta:correct?1:0,livesDelta:correct?0:-1,positionDelta:correct?1:0,
  };
  session.phase="feedback";
  if(session.position>=GAME_CONFIG.stairCount)session.pendingOutcome={outcome:"summit",reason:"summit"};
  else if(!session.summitMode&&session.score>=GAME_CONFIG.winScore)session.pendingOutcome={outcome:"won",reason:"score"};
  else if(session.lives<=0)session.pendingOutcome={outcome:session.score>=GAME_CONFIG.winScore?"won":"lost",reason:"lives"};
  else if(session.cursor>=session.order.length-1)session.pendingOutcome={outcome:session.score>=GAME_CONFIG.winScore?"won":"lost",reason:"questions"};
  const value=snapshot(session);cache(session,input.requestId,value);save(session);return value;
}

function pruneAndSort(entries:LeaderboardEntry[]){
  const now=Date.now();
  return entries.filter(entry=>entry.expiresAt>now).sort((a,b)=>b.score-a.score||a.wrongCount-b.wrongCount||a.totalAnswerMs-b.totalAnswerMs||a.completedAt-b.completedAt).slice(0,GAME_CONFIG.maxLeaderboardRows);
}

export class DemoBackend implements BackendClient{
  readonly mode="demo" as const;
  async startOrResumeSession(){
    let session=load()??newSession();
    if(session.phase==="answering"&&session.turn&&Date.now()>=session.turn.deadlineAt){
      const requestId=`timeout-${session.turn.id}`;
      return resolveAnswer(session,{turnId:session.turn.id,questionId:session.turn.questionId,selectedOptionId:null,requestId});
    }
    return snapshot(session);
  }
  async submitAnswer(input:{sessionId:string;turnId:string;questionId:string;selectedOptionId:string|null;requestId:string}){
    return resolveAnswer(requireSession(input.sessionId),input);
  }
  async nextQuestion(input:{sessionId:string;requestId:string}){
    const session=requireSession(input.sessionId);
    const prior=session.processed[input.requestId];if(prior)return prior;
    if(session.phase!=="feedback")throw new Error("Pembahasan belum siap dilanjutkan.");
    if(session.pendingOutcome){session.phase=session.pendingOutcome.outcome;session.completedAt=Date.now();}
    else{
      session.cursor+=1;session.turn=makeTurn(session.order[session.cursor]);session.phase="answering";session.feedback=null;
    }
    const value=snapshot(session);cache(session,input.requestId,value);save(session);return value;
  }
  async continueToSummit(input:{sessionId:string;requestId:string}){
    const session=requireSession(input.sessionId);
    const prior=session.processed[input.requestId];if(prior)return prior;
    if(session.phase!=="won"||session.score<GAME_CONFIG.winScore)throw new Error("Gerbang Kemenangan Dasar belum tercapai.");
    if(session.position>=GAME_CONFIG.stairCount||session.cursor>=session.order.length-1||session.lives<=0)throw new Error("Tidak ada soal unik tersisa untuk melanjutkan pendakian.");
    session.summitMode=true;session.pendingOutcome=null;session.cursor+=1;session.turn=makeTurn(session.order[session.cursor]);session.feedback=null;session.completedAt=null;session.phase="answering";
    const value=snapshot(session);cache(session,input.requestId,value);save(session);return value;
  }
  async claimWin(sessionId:string,input:ClaimInput){
    const session=requireSession(sessionId);
    if(session.phase!=="won"&&session.phase!=="summit")throw new Error("Klaim ditolak: kemenangan belum terverifikasi.");
    const name=input.displayName.trim().replace(/[<>\u0000-\u001f]/g,"").slice(0,24);
    if(name.length<2)throw new Error("Nama leaderboard minimal 2 karakter.");
    const entries=pruneAndSort(JSON.parse(storage.get(LEADERBOARD_KEY)??"[]") as LeaderboardEntry[]);
    const existing=entries.find(entry=>entry.id===session.id);
    if(existing&&existing.score>=session.score)return {entry:existing,duplicate:true};
    const completedAt=session.completedAt??Date.now();
    const entry:LeaderboardEntry={id:session.id,displayName:name,score:session.score,wrongCount:session.wrongCount,totalAnswerMs:session.totalAnswerMs,completedAt,expiresAt:completedAt+GAME_CONFIG.leaderboardDays*86400000,position:session.position};
    storage.set(LEADERBOARD_KEY,JSON.stringify(pruneAndSort([...entries.filter(item=>item.id!==session.id),entry])));
    const contacts=JSON.parse(storage.get(CONTACT_KEY)??"{}") as Record<string,unknown>;
    contacts[session.id]={email:input.email?.trim()||null,phone:input.phone?.trim()||null,createdAt:Date.now()};
    storage.set(CONTACT_KEY,JSON.stringify(contacts));
    return {entry,duplicate:false};
  }
  async getLeaderboard(){return pruneAndSort(JSON.parse(storage.get(LEADERBOARD_KEY)??"[]") as LeaderboardEntry[]);}
  async resetSession(){storage.remove(SESSION_KEY);}
}
