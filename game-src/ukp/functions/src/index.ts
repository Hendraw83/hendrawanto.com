import {randomInt,randomUUID} from "node:crypto";
import {initializeApp} from "firebase-admin/app";
import {FieldValue,Timestamp,getFirestore,type DocumentData,type DocumentReference,type Transaction} from "firebase-admin/firestore";
import {setGlobalOptions} from "firebase-functions/v2";
import {HttpsError,onCall,type CallableRequest} from "firebase-functions/v2/https";
import {computeAnswer,compareLeaderboard} from "./gameEngine";
import {SERVER_CONFIG,type Feedback,type PrivateQuestion,type PublicLeaderboardEntry,type SessionDocument,type SessionSnapshot,type Turn} from "./model";

initializeApp();
const db=getFirestore();
const region="asia-southeast2";
const callableOptions={region,enforceAppCheck:process.env.ENFORCE_APP_CHECK==="true",cors:true};
setGlobalOptions({region,maxInstances:20,timeoutSeconds:30,memory:"256MiB"});

function requireUid(request:CallableRequest<unknown>){
  const uid=request.auth?.uid;
  if(!uid)throw new HttpsError("unauthenticated","Autentikasi anonim diperlukan.");
  return uid;
}
function objectData(value:unknown):Record<string,unknown>{
  if(!value||typeof value!=="object"||Array.isArray(value))throw new HttpsError("invalid-argument","Payload tidak valid.");
  return value as Record<string,unknown>;
}
function text(value:unknown,name:string,max=160){
  if(typeof value!=="string"||value.length<1||value.length>max)throw new HttpsError("invalid-argument",`${name} tidak valid.`);
  return value;
}
function optionalText(value:unknown,max:number){return typeof value==="string"?value.trim().slice(0,max):"";}
function cleanName(value:unknown){
  const name=optionalText(value,24).replace(/[<>\u0000-\u001f]/g,"");
  if(name.length<2)throw new HttpsError("invalid-argument","Nama leaderboard minimal 2 karakter.");
  return name;
}
function shuffle<T>(items:readonly T[]){
  const result=[...items];
  for(let i=result.length-1;i>0;i--){const j=randomInt(i+1);[result[i],result[j]]=[result[j]!,result[i]!];}
  return result;
}
function makeTurn(question:PrivateQuestion,now=Timestamp.now()):Turn{
  return {id:randomUUID(),questionId:question.id,startedAt:now,deadlineAt:Timestamp.fromMillis(now.toMillis()+SERVER_CONFIG.answerMs),optionIds:shuffle(question.options.map(option=>option.id))};
}
function publicQuestion(question:PrivateQuestion,turn:Turn){
  return {id:question.id,topic:question.topic,prompt:question.prompt,sequence:question.sequence,options:turn.optionIds.map(id=>question.options.find(option=>option.id===id)!)};
}
function terminalResult(session:SessionDocument){
  if(!["won","summit","lost"].includes(session.phase)||!session.completedAt)return null;
  const fallback=session.phase==="summit"?"summit":session.phase==="won"?"score":"lives";
  return {outcome:session.phase as "won"|"summit"|"lost",reason:session.pendingOutcome?.reason??fallback,score:session.score,correctCount:session.correctCount,wrongCount:session.wrongCount,position:session.position,totalAnswerMs:session.totalAnswerMs,startedAt:session.startedAt.toMillis(),completedAt:session.completedAt.toMillis()};
}
function snapshot(id:string,session:SessionDocument,question:PrivateQuestion|null):SessionSnapshot{
  return {id,phase:session.phase,mode:"online",score:session.score,correctCount:session.correctCount,wrongCount:session.wrongCount,lives:session.lives,position:session.position,questionIndex:session.cursor+1,questionCount:session.order.length,totalAnswerMs:session.totalAnswerMs,startedAt:session.startedAt.toMillis(),deadlineAt:session.phase==="answering"?session.turn?.deadlineAt.toMillis()??null:null,turnId:session.turn?.id??null,question:session.turn&&question?publicQuestion(question,session.turn):null,feedback:session.feedback,result:terminalResult(session)};
}
function sessionRef(id:string){return db.collection("gameSessions").doc(id);}
function requestRef(id:string,requestId:string){return sessionRef(id).collection("requests").doc(requestId);}
function questionRef(id:string){return db.collection("questionBank").doc(id) as DocumentReference<PrivateQuestion>;}
function asSession(data:DocumentData|undefined){if(!data)throw new HttpsError("not-found","Sesi tidak ditemukan.");return data as SessionDocument;}
function cached(data:DocumentData|undefined,operation:string){
  if(!data)return null;
  if(data.operation!==operation)throw new HttpsError("already-exists","ID permintaan sudah dipakai untuk operasi lain.");
  return data.response as SessionSnapshot;
}
function requireOwner(session:SessionDocument,uid:string){if(session.ownerUid!==uid)throw new HttpsError("permission-denied","Sesi bukan milik pengguna ini.");}

async function rateLimit(uid:string,bucket:string,limit:number,windowMs=60_000){
  const ref=db.collection("rateLimits").doc(`${uid}_${bucket}`),now=Timestamp.now();
  await db.runTransaction(async tx=>{
    const snap=await tx.get(ref),data=snap.data() as {windowStartedAt?:Timestamp;count?:number}|undefined;
    const fresh=!data?.windowStartedAt||now.toMillis()-data.windowStartedAt.toMillis()>=windowMs;
    const count=fresh?1:(data?.count??0)+1;
    if(count>limit)throw new HttpsError("resource-exhausted","Terlalu banyak permintaan. Coba lagi sebentar.");
    tx.set(ref,{windowStartedAt:fresh?now:data!.windowStartedAt,count,updatedAt:now},{merge:true});
  });
}
async function activeQuestions(){
  const all=await db.collection("questionBank").get();
  const allowDraft=process.env.ALLOW_DRAFT_QUESTIONS==="true"&&Boolean(process.env.FIRESTORE_EMULATOR_HOST);
  return all.docs.map(doc=>doc.data() as PrivateQuestion).filter(question=>question.editorialStatus!=="inactive"&&(allowDraft||(question.editorialStatus==="verified"&&question.competitionEligible)));
}
async function loadSnapshot(id:string){
  const doc=await sessionRef(id).get(),session=asSession(doc.data());
  const question=session.turn?(await questionRef(session.turn.questionId).get()).data()??null:null;
  return snapshot(id,session,question);
}

async function processAnswer(uid:string,input:{sessionId:string;turnId:string;questionId:string;selectedOptionId:string|null;requestId:string},now=Timestamp.now()){
  const sRef=sessionRef(input.sessionId),rRef=requestRef(input.sessionId,input.requestId);
  return db.runTransaction(async tx=>{
    const [requestDoc,sessionDoc]=await Promise.all([tx.get(rRef),tx.get(sRef)]);
    const prior=cached(requestDoc.data(),"submitAnswer");if(prior)return prior;
    const session=asSession(sessionDoc.data());requireOwner(session,uid);
    if(session.phase!=="answering"||!session.turn)throw new HttpsError("failed-precondition","Sesi tidak sedang menerima jawaban.");
    if(session.turn.id!==input.turnId||session.turn.questionId!==input.questionId)throw new HttpsError("failed-precondition","Jawaban sudah kedaluwarsa. Lanjutkan dari state terbaru.");
    const qDoc=await tx.get(questionRef(session.turn.questionId)),question=qDoc.data();
    if(!question)throw new HttpsError("not-found","Soal tidak tersedia.");
    if(input.selectedOptionId!==null&&!session.turn.optionIds.includes(input.selectedOptionId))throw new HttpsError("invalid-argument","Pilihan jawaban tidak valid.");
    const timedOut=now.toMillis()>=session.turn.deadlineAt.toMillis()||input.selectedOptionId===null;
    const isCorrect=!timedOut&&input.selectedOptionId===question.correctOptionId;
    const computed=computeAnswer({session,correct:isCorrect,timedOut,nowMs:now.toMillis(),startedAtMs:session.turn.startedAt.toMillis()});
    const feedback:Feedback={turnId:session.turn.id,questionId:question.id,selectedOptionId:timedOut?null:input.selectedOptionId,correctOptionId:question.correctOptionId,correct:isCorrect,timedOut,explanation:question.explanation,source:question.source,scoreDelta:isCorrect?1:0,livesDelta:isCorrect?0:-1,positionDelta:isCorrect?1:0};
    const updated:SessionDocument={...session,phase:"feedback",score:computed.score,correctCount:computed.correctCount,wrongCount:computed.wrongCount,lives:computed.lives,position:computed.position,totalAnswerMs:session.totalAnswerMs+computed.durationMs,feedback,pendingOutcome:computed.pendingOutcome,updatedAt:now};
    const response=snapshot(input.sessionId,updated,question);
    tx.update(sRef,updated as unknown as DocumentData);
    tx.create(sRef.collection("answers").doc(session.turn.id),{ownerUid:uid,questionId:question.id,turnId:session.turn.id,selectedOptionId:feedback.selectedOptionId,correctOptionId:question.correctOptionId,correct:isCorrect,timedOut,answerMs:computed.durationMs,answeredAt:now,requestId:input.requestId});
    tx.create(rRef,{operation:"submitAnswer",response,createdAt:now});
    return response;
  });
}

async function expireIfNeeded(uid:string,id:string){
  const doc=await sessionRef(id).get(),session=asSession(doc.data());requireOwner(session,uid);
  if(session.phase==="answering"&&session.turn&&Timestamp.now().toMillis()>=session.turn.deadlineAt.toMillis())return processAnswer(uid,{sessionId:id,turnId:session.turn.id,questionId:session.turn.questionId,selectedOptionId:null,requestId:`timeout-${session.turn.id}`});
  return loadSnapshot(id);
}

export const startOrResumeSession=onCall(callableOptions,async request=>{
  const uid=requireUid(request);await rateLimit(uid,"start",15);
  const activeRef=db.collection("activeSessions").doc(uid),active=await activeRef.get();
  if(active.exists)return expireIfNeeded(uid,text(active.data()?.sessionId,"sessionId",80));
  const questions=await activeQuestions();
  if(questions.length<SERVER_CONFIG.questionCount)throw new HttpsError("failed-precondition",`Bank kompetisi membutuhkan ${SERVER_CONFIG.questionCount} soal terverifikasi; tersedia ${questions.length}.`);
  const selected=shuffle(questions).slice(0,SERVER_CONFIG.questionCount),lookup=new Map(selected.map(question=>[question.id,question]));
  const proposedId=randomUUID(),now=Timestamp.now();
  const id=await db.runTransaction(async tx=>{
    const current=await tx.get(activeRef);
    if(current.exists)return text(current.data()?.sessionId,"sessionId",80);
    const first=lookup.get(selected[0]!.id)!;
    const session:SessionDocument={ownerUid:uid,bankVersion:"questionBank-live",phase:"answering",active:true,order:selected.map(question=>question.id),cursor:0,score:0,correctCount:0,wrongCount:0,lives:SERVER_CONFIG.startLives,position:0,totalAnswerMs:0,startedAt:now,completedAt:null,updatedAt:now,turn:makeTurn(first,now),feedback:null,pendingOutcome:null,summitMode:false};
    tx.create(sessionRef(proposedId),session as unknown as DocumentData);tx.create(activeRef,{sessionId:proposedId,createdAt:now});return proposedId;
  });
  return expireIfNeeded(uid,id);
});

export const submitAnswer=onCall(callableOptions,async request=>{
  const uid=requireUid(request);await rateLimit(uid,"answer",150);const data=objectData(request.data);
  const selected=data.selectedOptionId===null?null:text(data.selectedOptionId,"selectedOptionId",100);
  return processAnswer(uid,{sessionId:text(data.sessionId,"sessionId",80),turnId:text(data.turnId,"turnId",80),questionId:text(data.questionId,"questionId",100),selectedOptionId:selected,requestId:text(data.requestId,"requestId",120)});
});

export const nextQuestion=onCall(callableOptions,async request=>{
  const uid=requireUid(request);await rateLimit(uid,"next",150);const data=objectData(request.data),id=text(data.sessionId,"sessionId",80),requestId=text(data.requestId,"requestId",120),sRef=sessionRef(id),rRef=requestRef(id,requestId),now=Timestamp.now();
  return db.runTransaction(async tx=>{
    const [requestDoc,sessionDoc]=await Promise.all([tx.get(rRef),tx.get(sRef)]);const prior=cached(requestDoc.data(),"nextQuestion");if(prior)return prior;
    const session=asSession(sessionDoc.data());requireOwner(session,uid);if(session.phase!=="feedback")throw new HttpsError("failed-precondition","Pembahasan belum siap dilanjutkan.");
    let updated:SessionDocument,question:PrivateQuestion|null=null;
    if(session.pendingOutcome)updated={...session,phase:session.pendingOutcome.outcome,completedAt:now,updatedAt:now};
    else{const cursor=session.cursor+1,qDoc=await tx.get(questionRef(session.order[cursor]!));question=qDoc.data()??null;if(!question)throw new HttpsError("not-found","Soal berikutnya tidak tersedia.");updated={...session,cursor,phase:"answering",turn:makeTurn(question,now),feedback:null,updatedAt:now};}
    const response=snapshot(id,updated,question);tx.update(sRef,updated as unknown as DocumentData);tx.create(rRef,{operation:"nextQuestion",response,createdAt:now});return response;
  });
});

export const continueToSummit=onCall(callableOptions,async request=>{
  const uid=requireUid(request);await rateLimit(uid,"continue",20);const data=objectData(request.data),id=text(data.sessionId,"sessionId",80),requestId=text(data.requestId,"requestId",120),sRef=sessionRef(id),rRef=requestRef(id,requestId),now=Timestamp.now();
  return db.runTransaction(async tx=>{
    const [requestDoc,sessionDoc]=await Promise.all([tx.get(rRef),tx.get(sRef)]);const prior=cached(requestDoc.data(),"continueToSummit");if(prior)return prior;
    const session=asSession(sessionDoc.data());requireOwner(session,uid);
    if(session.phase!=="won"||session.score<SERVER_CONFIG.winScore)throw new HttpsError("failed-precondition","Gerbang Kemenangan Dasar belum tercapai.");
    if(session.position>=SERVER_CONFIG.stairCount||session.cursor>=session.order.length-1||session.lives<=0)throw new HttpsError("failed-precondition","Tidak ada soal unik tersisa untuk pendakian lanjutan.");
    const cursor=session.cursor+1,qDoc=await tx.get(questionRef(session.order[cursor]!)),question=qDoc.data();if(!question)throw new HttpsError("not-found","Soal berikutnya tidak tersedia.");
    const updated:SessionDocument={...session,cursor,phase:"answering",summitMode:true,pendingOutcome:null,completedAt:null,turn:makeTurn(question,now),feedback:null,updatedAt:now};
    const response=snapshot(id,updated,question);tx.update(sRef,updated as unknown as DocumentData);tx.create(rRef,{operation:"continueToSummit",response,createdAt:now});return response;
  });
});

export const claimWin=onCall(callableOptions,async request=>{
  const uid=requireUid(request);await rateLimit(uid,"claim",6,10*60_000);const data=objectData(request.data),id=text(data.sessionId,"sessionId",80),claim=objectData(data.claim),now=Timestamp.now();
  const name=cleanName(claim.displayName),email=optionalText(claim.email,160),phone=optionalText(claim.phone,40),sRef=sessionRef(id),claimRef=db.collection("claims").doc(id),leaderRef=db.collection("leaderboard").doc(id),contactRef=db.collection("privateContacts").doc(id);
  return db.runTransaction(async tx=>{
    const [sessionDoc,existingDoc]=await Promise.all([tx.get(sRef),tx.get(leaderRef)]),session=asSession(sessionDoc.data());requireOwner(session,uid);
    if(!["won","summit"].includes(session.phase)||session.score<SERVER_CONFIG.winScore||!session.completedAt)throw new HttpsError("failed-precondition","Klaim ditolak: kemenangan belum diverifikasi server.");
    const existing=existingDoc.data() as {score?:number}|undefined;
    if((existing?.score??-1)>=session.score){const stored=existingDoc.data()!;return {entry:{id,displayName:stored.displayName,score:stored.score,wrongCount:stored.wrongCount,totalAnswerMs:stored.totalAnswerMs,completedAt:(stored.completedAt as Timestamp).toMillis(),expiresAt:(stored.expiresAt as Timestamp).toMillis(),position:stored.position} as PublicLeaderboardEntry,duplicate:true};}
    const expiresAt=Timestamp.fromMillis(session.completedAt.toMillis()+SERVER_CONFIG.leaderboardMs);
    const stored={ownerUid:uid,displayName:name,score:session.score,wrongCount:session.wrongCount,totalAnswerMs:session.totalAnswerMs,completedAt:session.completedAt,expiresAt,position:session.position,updatedAt:now};
    tx.set(leaderRef,stored);tx.set(claimRef,{ownerUid:uid,sessionId:id,score:session.score,claimedAt:now,updatedAt:now},{merge:true});tx.set(contactRef,{ownerUid:uid,email:email||null,phone:phone||null,updatedAt:now},{merge:true});
    return {entry:{id,displayName:name,score:session.score,wrongCount:session.wrongCount,totalAnswerMs:session.totalAnswerMs,completedAt:session.completedAt.toMillis(),expiresAt:expiresAt.toMillis(),position:session.position} as PublicLeaderboardEntry,duplicate:false};
  });
});

export const getLeaderboard=onCall(callableOptions,async request=>{
  requireUid(request);await rateLimit(request.auth!.uid,"leaderboard",60);const now=Timestamp.now();
  const docs=await db.collection("leaderboard").where("expiresAt",">",now).limit(250).get();
  return docs.docs.map(doc=>{const data=doc.data();return {id:doc.id,displayName:data.displayName,score:data.score,wrongCount:data.wrongCount,totalAnswerMs:data.totalAnswerMs,completedAt:(data.completedAt as Timestamp).toMillis(),expiresAt:(data.expiresAt as Timestamp).toMillis(),position:data.position} as PublicLeaderboardEntry;}).sort(compareLeaderboard).slice(0,SERVER_CONFIG.maxLeaderboardRows);
});

export const resetSession=onCall(callableOptions,async request=>{
  const uid=requireUid(request);await rateLimit(uid,"reset",20);const activeRef=db.collection("activeSessions").doc(uid),now=Timestamp.now();
  await db.runTransaction(async tx=>{const active=await tx.get(activeRef);if(!active.exists)return;const id=text(active.data()?.sessionId,"sessionId",80),sRef=sessionRef(id),sessionDoc=await tx.get(sRef);if(sessionDoc.exists){const session=asSession(sessionDoc.data());requireOwner(session,uid);tx.update(sRef,{active:false,updatedAt:now,endedAt:now});}tx.delete(activeRef);});
  return {ok:true as const};
});

export const _test={snapshot,publicQuestion,makeTurn};
