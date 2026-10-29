import type {BackendClient,ClaimInput} from "../game/types";

// Semua backend dimuat malas (dynamic import). Karena VITE_GAME_MODE diganti nilai tetap saat build,
// cabang yang tidak dipakai dibuang Rollup beserta chunk-nya. Akibatnya build mode "supabase"
// TIDAK membawa bank soal demo (berisi kunci jawaban) ke browser.
class LazyBackend implements BackendClient{
  private instance:Promise<BackendClient>|null=null;
  readonly mode:BackendClient["mode"];
  private readonly load:()=>Promise<BackendClient>;
  constructor(mode:BackendClient["mode"],load:()=>Promise<BackendClient>){this.mode=mode;this.load=load;}
  private get(){return this.instance??=this.load();}
  async startOrResumeSession(){return (await this.get()).startOrResumeSession();}
  async submitAnswer(input:Parameters<BackendClient["submitAnswer"]>[0]){return (await this.get()).submitAnswer(input);}
  async nextQuestion(input:Parameters<BackendClient["nextQuestion"]>[0]){return (await this.get()).nextQuestion(input);}
  async continueToSummit(input:Parameters<BackendClient["continueToSummit"]>[0]){return (await this.get()).continueToSummit(input);}
  async claimWin(sessionId:string,input:ClaimInput){return (await this.get()).claimWin(sessionId,input);}
  async getLeaderboard(){return (await this.get()).getLeaderboard();}
  async resetSession(){return (await this.get()).resetSession();}
}

function firebaseConfigured(){return [import.meta.env.VITE_FIREBASE_API_KEY,import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,import.meta.env.VITE_FIREBASE_PROJECT_ID,import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,import.meta.env.VITE_FIREBASE_APP_ID].every(Boolean);}

export function createBackend():BackendClient{
  // Mode "supabase" = leaderboard online hendrawanto.com (Edge Function Supabase "ukp").
  if(import.meta.env.VITE_GAME_MODE==="supabase"){
    const url=import.meta.env.VITE_UKP_API_URL;
    if(!url)throw new Error("VITE_UKP_API_URL wajib diisi untuk mode supabase.");
    return new LazyBackend("online",()=>import("./supabaseBackend").then(module=>new module.SupabaseBackend(url)));
  }
  if(import.meta.env.VITE_GAME_MODE==="online"&&firebaseConfigured()){
    return new LazyBackend("online",()=>import("./onlineBackend").then(module=>new module.OnlineBackend()));
  }
  return new LazyBackend("demo",()=>import("./demoBackend").then(module=>new module.DemoBackend()));
}
