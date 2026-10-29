import type {BackendClient,ClaimInput} from "../game/types";
import {DemoBackend} from "./demoBackend";

class LazyOnlineBackend implements BackendClient{
  readonly mode="online" as const;
  private instance:Promise<BackendClient>|null=null;
  private get(){return this.instance??=(import("./onlineBackend").then(module=>new module.OnlineBackend()));}
  async startOrResumeSession(){return (await this.get()).startOrResumeSession();}
  async submitAnswer(input:Parameters<BackendClient["submitAnswer"]>[0]){return (await this.get()).submitAnswer(input);}
  async nextQuestion(input:Parameters<BackendClient["nextQuestion"]>[0]){return (await this.get()).nextQuestion(input);}
  async continueToSummit(input:Parameters<BackendClient["continueToSummit"]>[0]){return (await this.get()).continueToSummit(input);}
  async claimWin(sessionId:string,input:ClaimInput){return (await this.get()).claimWin(sessionId,input);}
  async getLeaderboard(){return (await this.get()).getLeaderboard();}
  async resetSession(){return (await this.get()).resetSession();}
}

function onlineConfigured(){return [import.meta.env.VITE_FIREBASE_API_KEY,import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,import.meta.env.VITE_FIREBASE_PROJECT_ID,import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,import.meta.env.VITE_FIREBASE_APP_ID].every(Boolean);}

export function createBackend():BackendClient{
  const requested=import.meta.env.VITE_GAME_MODE;
  if(requested==="online"&&onlineConfigured())return new LazyOnlineBackend();
  return new DemoBackend();
}
