import {httpsCallable} from "firebase/functions";
import type {BackendClient,ClaimInput,LeaderboardEntry,SessionSnapshot} from "../game/types";
import {ensureAnonymousUser,getFirebaseBundle} from "./firebaseClient";

interface CallableResult<T>{data:T}
async function call<TInput,TOutput>(name:string,input:TInput):Promise<TOutput>{
  await ensureAnonymousUser();
  const fn=httpsCallable<TInput,TOutput>(getFirebaseBundle().functions,name);
  const result=await fn(input) as CallableResult<TOutput>;
  return result.data;
}

export class OnlineBackend implements BackendClient{
  readonly mode="online" as const;
  startOrResumeSession(){return call<Record<string,never>,SessionSnapshot>("startOrResumeSession",{});}
  submitAnswer(input:{sessionId:string;turnId:string;questionId:string;selectedOptionId:string|null;requestId:string}){return call<typeof input,SessionSnapshot>("submitAnswer",input);}
  nextQuestion(input:{sessionId:string;requestId:string}){return call<typeof input,SessionSnapshot>("nextQuestion",input);}
  continueToSummit(input:{sessionId:string;requestId:string}){return call<typeof input,SessionSnapshot>("continueToSummit",input);}
  claimWin(sessionId:string,input:ClaimInput){return call<{sessionId:string;claim:ClaimInput},{entry:LeaderboardEntry;duplicate:boolean}>("claimWin",{sessionId,claim:input});}
  getLeaderboard(){return call<Record<string,never>,LeaderboardEntry[]>("getLeaderboard",{});}
  async resetSession(){await call<Record<string,never>,{ok:true}>("resetSession",{});}
}
