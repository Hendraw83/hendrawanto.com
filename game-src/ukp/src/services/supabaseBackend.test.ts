import {afterEach,beforeEach,describe,expect,it,vi} from "vitest";
import {SupabaseBackend} from "./supabaseBackend";

const URL_API="https://contoh.supabase.co/functions/v1/ukp";
const session={id:"11111111-1111-4111-8111-111111111111",phase:"answering"};

function reply(status:number,body:unknown){
  return Promise.resolve(new Response(JSON.stringify(body),{status,headers:{"Content-Type":"application/json"}}));
}

describe("SupabaseBackend",()=>{
  let calls:{action:string;body:Record<string,unknown>}[]=[];
  beforeEach(()=>{
    calls=[];
    const store=new Map<string,string>();
    vi.stubGlobal("localStorage",{
      getItem:(key:string)=>store.get(key)??null,
      setItem:(key:string,value:string)=>void store.set(key,value),
      removeItem:(key:string)=>void store.delete(key),
      clear:()=>store.clear(),
    });
    vi.stubGlobal("fetch",vi.fn((_url:string,init:RequestInit)=>{
      const body=JSON.parse(String(init.body)) as Record<string,unknown>;
      calls.push({action:String(body.action),body});
      const current={...session,level:body.level??"A"};
      if(body.action==="start")return reply(200,{session:current,token:"tok-rahasia"});
      if(body.action==="claim")return reply(200,{entry:{displayName:body.displayName},duplicate:false});
      if(body.action==="answer"&&body.token!=="tok-rahasia")return reply(404,{error:"Sesi tidak ditemukan atau sudah kedaluwarsa."});
      return reply(200,{session:current});
    }));
  });
  afterEach(()=>vi.unstubAllGlobals());

  it("menyimpan token sesi dan mengirimkannya pada permintaan berikutnya",async()=>{
    const backend=new SupabaseBackend(URL_API);
    await backend.startOrResumeSession("Erik");
    expect(calls[0]!.body).toMatchObject({action:"start",playerName:"Erik"});
    expect(calls[0]!.body.playerId).toMatch(/^[0-9a-f-]{36}$/i);
    await backend.submitAnswer({sessionId:session.id,turnId:"t",questionId:"q",selectedOptionId:"a",requestId:"req-000001"});
    expect(calls[1]!.body).toMatchObject({action:"answer",sessionId:session.id,token:"tok-rahasia",selectedOptionId:"a"});
  });

  it("klaim hanya mengirim nama panggilan, tanpa email atau telepon",async()=>{
    const backend=new SupabaseBackend(URL_API);
    await backend.startOrResumeSession();
    await backend.claimWin(session.id,{displayName:"Hendra",email:"x@y.z",phone:"0800"});
    const claim=calls.find(call=>call.action==="claim")!.body;
    expect(claim.displayName).toBe("Hendra");
    expect(claim).not.toHaveProperty("email");
    expect(claim).not.toHaveProperty("phone");
  });

  it("menghapus sesi tersimpan bila server menolak (404) dan meneruskan pesan galat",async()=>{
    localStorage.setItem("he-ukp-online-session-v1",JSON.stringify({sessionId:session.id,token:"basi"}));
    const backend=new SupabaseBackend(URL_API);
    await expect(backend.submitAnswer({sessionId:session.id,turnId:"t",questionId:"q",selectedOptionId:null,requestId:"req-000002"}))
      .rejects.toThrow("Sesi tidak ditemukan");
    expect(localStorage.getItem("he-ukp-online-session-v1")).toBeNull();
  });

  it("resetSession melupakan token sehingga start berikutnya membuat sesi baru",async()=>{
    const backend=new SupabaseBackend(URL_API);
    await backend.startOrResumeSession();
    await backend.resetSession();
    await backend.startOrResumeSession();
    expect(calls[1]!.body).not.toHaveProperty("token");
  });
});

describe("pemisahan Level A dan B",()=>{
  let calls:Record<string,unknown>[]=[];
  beforeEach(()=>{
    calls=[];
    const values=new Map<string,string>();
    vi.stubGlobal("localStorage",{getItem:(key:string)=>values.get(key)??null,setItem:(key:string,value:string)=>values.set(key,value),removeItem:(key:string)=>values.delete(key)});
    vi.stubGlobal("fetch",vi.fn((_url:string,init:RequestInit)=>{
      const body=JSON.parse(String(init.body));calls.push(body);
      return reply(200,{session:{...session,level:body.level},token:`token-${body.level}`,entries:[]});
    }));
  });
  afterEach(()=>vi.unstubAllGlobals());
  it("menyimpan dan memulihkan token tiap level secara terpisah",async()=>{
    const a=new SupabaseBackend(URL_API,"A"),b=new SupabaseBackend(URL_API,"B");
    await a.startOrResumeSession("Hendra");await b.startOrResumeSession("Hendra");
    expect(calls[1]).toMatchObject({level:"B"});expect(calls[1]).not.toHaveProperty("token");
    await a.startOrResumeSession("Hendra");await b.startOrResumeSession("Hendra");
    expect(calls[2]).toMatchObject({level:"A",token:"token-A"});
    expect(calls[3]).toMatchObject({level:"B",token:"token-B"});
    await b.resetSession();await a.startOrResumeSession("Hendra");await b.startOrResumeSession("Hendra");
    expect(calls[4]).toMatchObject({token:"token-A"});expect(calls[5]).not.toHaveProperty("token");
  });
  it("nama berbeda tidak meneruskan sesi pemain sebelumnya",async()=>{
    const b=new SupabaseBackend(URL_API,"B");
    await b.startOrResumeSession("Hendra");await b.startOrResumeSession("Riski");
    expect(calls[1]).not.toHaveProperty("token");
    await b.startOrResumeSession("Riski");expect(calls[2]).toHaveProperty("token","token-B");
  });
  it("leaderboard meminta level pilihan tanpa mengirim token pemain",async()=>{
    const b=new SupabaseBackend(URL_API,"B");await b.startOrResumeSession("Hendra");await b.getLeaderboard();
    expect(calls[1]).toMatchObject({action:"leaderboard",level:"B"});
    expect(calls[1]).not.toHaveProperty("token");
  });
  it("menolak snapshot dari level yang berbeda",async()=>{
    vi.stubGlobal("fetch",vi.fn(()=>reply(200,{session:{...session,level:"A"},token:"salah"})));
    await expect(new SupabaseBackend(URL_API,"B").startOrResumeSession("Hendra")).rejects.toThrow(/level berbeda/);
  });
});
