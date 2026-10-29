import type {BackendClient,ClaimInput,LeaderboardEntry,SessionSnapshot} from "../game/types";

// Mode online: semua penilaian dilakukan Edge Function Supabase "ukp".
// Browser hanya menerima soal tanpa kunci jawaban; pembahasan dikirim setelah jawaban dikunci.
// Identitas pemain cukup nama panggilan (keputusan Aa Hendra, 29 Okt 2026): email/telepon tidak dikirim.

const SESSION_KEY="he-ukp-online-session-v1";
interface Saved {sessionId:string;token:string}

let memorySaved:Saved|null=null;
function readSaved():Saved|null{
  try{
    const value=JSON.parse(localStorage.getItem(SESSION_KEY)??"null") as Saved|null;
    if(value&&typeof value.sessionId==="string"&&typeof value.token==="string")return value;
  }catch{/* mode privat: pakai memori tab */}
  return memorySaved;
}
function writeSaved(value:Saved|null){
  memorySaved=value;
  try{if(value)localStorage.setItem(SESSION_KEY,JSON.stringify(value));else localStorage.removeItem(SESSION_KEY);}catch{/* abaikan */}
}

export class SupabaseBackend implements BackendClient{
  readonly mode="online" as const;
  private readonly url:string;
  constructor(url:string){this.url=url;}

  private async call<T>(action:string,payload:Record<string,unknown>={}):Promise<T>{
    const saved=readSaved();
    let response:Response;
    try{
      response=await fetch(this.url,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({action,...(saved??{}),...payload}),
        cache:"no-store",
      });
    }catch{
      throw new Error("Koneksi ke server permainan terputus. Periksa internet lalu coba lagi.");
    }
    const data=await response.json().catch(()=>({})) as {error?:string}&T;
    if(!response.ok){
      if(response.status===404)writeSaved(null);
      throw new Error(data.error??"Server permainan sedang bermasalah. Coba lagi.");
    }
    return data;
  }

  async startOrResumeSession(){
    const result=await this.call<{session:SessionSnapshot;token?:string}>("start");
    if(result.token)writeSaved({sessionId:result.session.id,token:result.token});
    return result.session;
  }
  async submitAnswer(input:{sessionId:string;turnId:string;questionId:string;selectedOptionId:string|null;requestId:string}){
    return (await this.call<{session:SessionSnapshot}>("answer",{turnId:input.turnId,questionId:input.questionId,selectedOptionId:input.selectedOptionId,requestId:input.requestId})).session;
  }
  async nextQuestion(input:{sessionId:string;requestId:string}){
    return (await this.call<{session:SessionSnapshot}>("next",{requestId:input.requestId})).session;
  }
  async continueToSummit(input:{sessionId:string;requestId:string}){
    return (await this.call<{session:SessionSnapshot}>("summit",{requestId:input.requestId})).session;
  }
  async claimWin(_sessionId:string,input:ClaimInput){
    return await this.call<{entry:LeaderboardEntry;duplicate:boolean}>("claim",{displayName:input.displayName});
  }
  async getLeaderboard(){
    return (await this.call<{entries:LeaderboardEntry[]}>("leaderboard")).entries;
  }
  async resetSession(){writeSaved(null);}
}
