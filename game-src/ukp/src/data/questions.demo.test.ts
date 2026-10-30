import {describe,expect,it} from "vitest";
import rawBank from "./questions.demo.json";
import type {PrivateQuestion} from "../game/types";

const bank=rawBank as PrivateQuestion[];

function question(number:number){
  const item=bank.find(entry=>entry.sourceDocumentQuestionNumber===number);
  if(!item)throw new Error(`Soal sumber nomor ${number} tidak ditemukan.`);
  return item;
}

function correctText(number:number){
  const item=question(number);
  return item.options.find(option=>option.id===item.correctOptionId)?.text;
}

describe("bank soal simulasi UKP Level A",()=>{
  it("memuat tepat 100 soal yang unik dan valid",()=>{
    expect(bank).toHaveLength(100);
    expect(new Set(bank.map(item=>item.id)).size).toBe(100);
    expect(new Set(bank.map(item=>item.prompt)).size).toBe(100);
    for(const item of bank){
      expect(item.options).toHaveLength(4);
      expect(new Set(item.options.map(option=>option.id)).size).toBe(4);
      expect(new Set(item.options.map(option=>option.text)).size).toBe(4);
      expect(item.options.some(option=>option.id===item.correctOptionId)).toBe(true);
      expect(item.explanation.trim().length).toBeGreaterThan(0);
      expect(item.source.url).toMatch(/^https:\/\//);
    }
  });

  it("mencatat status editorial hasil review",()=>{
    const regulatory=bank.filter(item=>(item.sourceDocumentQuestionNumber??0)<=80);
    const ethics=bank.filter(item=>(item.sourceDocumentQuestionNumber??0)>=81);

    expect(regulatory.filter(item=>item.editorialStatus==="verified")).toHaveLength(80);
    expect(ethics.filter(item=>item.editorialStatus==="draft")).toHaveLength(20);
    expect(bank.every(item=>item.competitionEligible===false)).toBe(true);
    expect(regulatory.every(item=>item.reviewedAt==="2026-10-30")).toBe(true);
    expect(ethics.every(item=>item.reviewedAt==="2026-10-31")).toBe(true);
  });

  it("memuat koreksi aturan material utama",()=>{
    expect(correctText(15)).toBe("10 tahun");
    expect(correctText(35)).toBe("NPWP atau NIK sesuai ketentuan perpajakan");
    expect(correctText(41)).toBe("12%");
    expect(correctText(63)).toBe("Rp 10.000.000");
    expect(correctText(65)).toBe("0,5%");
    expect(correctText(69)).toBe("Rp 80.000.000");
    expect(correctText(72)?.toLowerCase()).toContain("perjanjian pengikatan jual beli");
    expect(correctText(79)).toBe("Ijazah");
  });

  it("menyelaraskan bagian etika dengan rujukan Kode Etik IKPI",()=>{
    const ethics=bank.filter(item=>(item.sourceDocumentQuestionNumber??0)>=81);
    const combinedText=ethics.flatMap(item=>[
      item.prompt,
      item.explanation,
      ...item.options.map(option=>option.text),
    ]).join(" ").toLowerCase();

    expect(ethics).toHaveLength(20);
    expect(ethics.every(item=>!item.prompt.toLowerCase().includes("teknisi perpajakan"))).toBe(true);
    expect(ethics.every(item=>item.topic.includes("Kode Etik IKPI"))).toBe(true);
    expect(ethics.every(item=>item.source.url==="https://ikpi.or.id/wp-content/uploads/2020/08/13.-KODE-ETIK-IKPI-KONGRES-MALANG.pdf")).toBe(true);
    expect(combinedText).not.toMatch(/self-interest|familiarity|skeptisisme profesional|kertas kerja|\bfee\b/);
    expect(correctText(85)).toBe("Memasang iklan semata-mata untuk mendapatkan pelanggan");
    expect(correctText(88)).toBe("Jaminan kepastian atas penyelesaian pekerjaan");
    expect(correctText(95)).toBe("Menyerahkan semua dokumen klien yang terkait dengan jasa perpajakan yang sedang dikerjakan");
    expect(correctText(100)).toBe("Membela diri dalam rapat Majelis Sidang");
  });
});
