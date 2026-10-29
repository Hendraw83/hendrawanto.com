import {SERVER_CONFIG,type AnswerComputation,type PendingOutcome,type SessionDocument} from "./model";

export function computeAnswer(input:{session:SessionDocument;correct:boolean;timedOut:boolean;nowMs:number;startedAtMs:number}):AnswerComputation{
  const durationMs=Math.max(0,Math.min(SERVER_CONFIG.answerMs,input.nowMs-input.startedAtMs));
  const score=input.session.score+(input.correct?1:0);
  const correctCount=input.session.correctCount+(input.correct?1:0);
  const wrongCount=input.session.wrongCount+(input.correct?0:1);
  const lives=Math.max(0,input.session.lives-(input.correct?0:1));
  const position=Math.min(SERVER_CONFIG.stairCount,input.session.position+(input.correct?1:0));
  let pendingOutcome:PendingOutcome|null=null;
  if(position>=SERVER_CONFIG.stairCount)pendingOutcome={outcome:"summit",reason:"summit"};
  else if(!input.session.summitMode&&score>=SERVER_CONFIG.winScore)pendingOutcome={outcome:"won",reason:"score"};
  else if(lives<=0)pendingOutcome={outcome:score>=SERVER_CONFIG.winScore?"won":"lost",reason:"lives"};
  else if(input.session.cursor>=input.session.order.length-1)pendingOutcome={outcome:score>=SERVER_CONFIG.winScore?"won":"lost",reason:"questions"};
  return {correct:input.correct,timedOut:input.timedOut,durationMs,score,correctCount,wrongCount,lives,position,pendingOutcome};
}

export function compareLeaderboard(a:{score:number;wrongCount:number;totalAnswerMs:number;completedAt:number},b:{score:number;wrongCount:number;totalAnswerMs:number;completedAt:number}){
  return b.score-a.score||a.wrongCount-b.wrongCount||a.totalAnswerMs-b.totalAnswerMs||a.completedAt-b.completedAt;
}
