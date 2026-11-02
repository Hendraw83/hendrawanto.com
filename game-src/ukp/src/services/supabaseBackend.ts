import type {BackendClient,ClaimInput,GameLevel,LeaderboardEntry,SessionSnapshot} from "../game/types";
import {randomId} from "../game/random";

// Kunci A lama dipertahankan supaya pembaruan tidak memutus sesi pemain.
const SESSION_KEY="he-ukp-online-session-v1";
const PLAYER_KEY="he-ukp-online-player-v1";
interface Saved {sessionId:string;token:string;playerName?:string}
const memorySaved=new Map<string,Saved>();
let memoryPlayerId=randomId();
const sessionKey=(level:GameLevel)=>level==="A"?SESSION_KEY:`${SESSION_KEY}-${level}`;
const playerKey=(name:string)=>name.normalize("NFKC").trim().toLocaleLowerCase("id-ID");
function readSaved(level:GameLevel):Saved|null{
  const key=sessionKey(level);
  try{
    const value=JSON.parse(localStorage.getItem(key)??"null") as Saved|null;
    return value&&typeof value.sessionId==="string"&&typeof value.token==="string"?value:null;
  }catch{return memorySaved.get(key)??null;}
}
function writeSaved(level:GameLevel,value:Saved|null){
  const key=sessionKey(level);
  if(value)memorySaved.set(key,value);else memorySaved.delete(key);
  try{if(value)localStorage.setItem(key,JSON.stringify(value));else localStorage.removeItem(key);}catch{/* memori tab */}
}
function playerId(){
  try{
    const stored=localStorage.getItem(PLAYER_KEY);
    if(stored&&/^[0-9a-f-]{36}$/i.test(stored))return stored;
    const created=randomId();localStorage.setItem(PLAYER_KEY,created);return created;
  }catch{return memoryPlayerId;}
}
export class SupabaseBackend implements BackendClient{
  readonly mode="online" as const;
  private readonly url:string;
  readonly level:GameLevel;
  constructor(url:string,level:GameLevel="A"){this.url=url;this.level=level;}
  private async call<T>(action:string,payload:Record<string,unknown>={},saved=readSaved(this.level)):Promise<T>{
    let response:Response;
    try{
      response=await fetch(this.url,{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({action,...(action==="leaderboard"?{}:saved??{}),...payload,level:this.level}),
        cache:"no-store",
      });
    }catch{throw new Error("Koneksi ke server permainan terputus. Periksa internet lalu coba lagi.");}
    const data=await response.json().catch(()=>({})) as {error?:string}&T;
    if(!response.ok){
      if(response.status===404)writeSaved(this.level,null);
      throw new Error(data.error??"Server permainan sedang bermasalah. Coba lagi.");
    }
    return data;
  }
  private snapshot(session:SessionSnapshot){
    if((session.level??"A")!==this.level)throw new Error("Server mengembalikan sesi dari level berbeda. Coba lagi.");
    return session;
  }
  async startOrResumeSession(playerName="AvatarMu"){
    const saved=readSaved(this.level);
    const samePlayer=!saved?.playerName||playerKey(saved.playerName)===playerKey(playerName);
    const result=await this.call<{session:SessionSnapshot;token?:string}>("start",{playerId:playerId(),playerName},samePlayer?saved:null);
    const session=this.snapshot(result.session);
    if(result.token)writeSaved(this.level,{sessionId:session.id,token:result.token,playerName});
    else if(saved)writeSaved(this.level,{...saved,playerName});
    return session;
  }
  async submitAnswer(input:{sessionId:string;turnId:string;questionId:string;selectedOptionId:string|null;requestId:string}){
    return this.snapshot((await this.call<{session:SessionSnapshot}>("answer",{turnId:input.turnId,questionId:input.questionId,selectedOptionId:input.selectedOptionId,requestId:input.requestId})).session);
  }
  async nextQuestion(input:{sessionId:string;requestId:string}){
    return this.snapshot((await this.call<{session:SessionSnapshot}>("next",{requestId:input.requestId})).session);
  }
  async continueToSummit(input:{sessionId:string;requestId:string}){
    return this.snapshot((await this.call<{session:SessionSnapshot}>("summit",{requestId:input.requestId})).session);
  }
  async claimWin(_sessionId:string,input:ClaimInput){
    return await this.call<{entry:LeaderboardEntry;duplicate:boolean}>("claim",{displayName:input.displayName});
  }
  async getLeaderboard(){
    return (await this.call<{entries:LeaderboardEntry[]}>("leaderboard")).entries;
  }
  async resetSession(){writeSaved(this.level,null);}
}
