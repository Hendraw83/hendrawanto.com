import {describe,expect,it} from "vitest";
import type {GameResult} from "../game/types";
import {buildCertificateSvg,certificateFileName,createCertificateView,isCertificateEligible} from "./certificate";

const result=(overrides:Partial<GameResult>={}):GameResult=>({outcome:"won",reason:"score",score:60,correctCount:60,wrongCount:7,position:60,totalAnswerMs:125_000,startedAt:1_798_000_000_000,completedAt:1_798_000_125_000,...overrides});
const input=(overrides:Partial<GameResult>={})=>({sessionId:"11111111-2222-3333-4444-abcdef123456",playerName:"Aa Hendra",result:result(overrides)});

describe("certificate",()=>{
  it("hanya mengizinkan pemenang dengan nilai minimal 60",()=>{expect(isCertificateEligible(result())).toBe(true);expect(isCertificateEligible(result({score:59,outcome:"lost"}))).toBe(false);expect(isCertificateEligible(result({score:60,outcome:"lost"}))).toBe(false);});
  it("mencantumkan nama, nilai, statistik, dan ID pencapaian",()=>{const view=createCertificateView(input());expect(view).toMatchObject({playerName:"Aa Hendra",scoreLabel:"60 / 100",tier:"gate",correctCount:60,wrongCount:7,answerTime:"02:05"});expect(view.certificateId).toMatch(/^HE-UKPA-\d{8}-EF123456$/);});
  it("membedakan puncak 100 dan mengamankan teks nama",()=>{const svg=buildCertificateSvg({...input({outcome:"summit",reason:"summit",score:100,position:100}),playerName:'A&B <Juara>'});expect(svg).toContain("100 / 100");expect(svg).toContain("PUNCAK KEMENANGAN UTAMA");expect(svg).toContain("A&amp;B Juara");expect(svg).not.toContain("<Juara>");});
  it("membuat nama file yang aman",()=>{expect(certificateFileName({...input(),playerName:"Aa Héndra / Juara"})).toBe("sertifikat-ukp-level-a-aa-hendra-juara-nilai-60.png");});
  it("menolak pembuatan sertifikat sebelum menang",()=>{expect(()=>createCertificateView(input({score:59,outcome:"lost"}))).toThrow(/minimal 60/);});
});
