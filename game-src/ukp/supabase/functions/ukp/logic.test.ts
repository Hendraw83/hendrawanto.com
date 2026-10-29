// Jalankan: node --experimental-strip-types --test supabase/functions/ukp/logic.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  CONFIG, type Question, cleanDisplayName, continueToSummit, createState, leaderboardEntry,
  nextQuestion, resolveStaleTurn, submitAnswer, view,
} from "./logic.ts";

const raw = JSON.parse(readFileSync(new URL("../../../src/data/questions.demo.json", import.meta.url), "utf8"));
const bank = new Map<string, Question>(raw.map((q: Question) => [q.id, q]));
let rid = 0;
const req = () => `req-${String(++rid).padStart(6, "0")}`;

function answer(s: ReturnType<typeof createState>, right: boolean, now = Date.now()) {
  const q = bank.get(s.turn!.questionId)!;
  const pick = right ? q.correctOptionId : q.options.find((o) => o.id !== q.correctOptionId)!.id;
  return submitAnswer(s, { turnId: s.turn!.id, questionId: q.id, selectedOptionId: pick, requestId: req() }, bank, now) as any;
}

test("view tidak pernah membocorkan kunci jawaban sebelum menjawab", () => {
  const s = createState(bank);
  const v = view(s, bank);
  const text = JSON.stringify(v);
  assert.equal(v.feedback, null);
  assert.ok(!text.includes("correctOptionId"));
  assert.ok(!text.includes(bank.get(s.turn!.questionId)!.explanation));
  assert.equal(v.question!.options.length, 4);
});

test("benar naik satu tangga; salah mengurangi satu nyawa tanpa turun", () => {
  const s = createState(bank);
  let v = answer(s, true);
  assert.equal(v.score, 1); assert.equal(v.position, 1); assert.equal(v.lives, 41);
  assert.equal(v.feedback.correct, true);
  nextQuestion(s, req(), bank);
  v = answer(s, false);
  assert.equal(v.score, 1); assert.equal(v.position, 1); assert.equal(v.lives, 40);
});

test("requestId yang sama tidak dihitung dua kali", () => {
  const s = createState(bank);
  const q = bank.get(s.turn!.questionId)!;
  const input = { turnId: s.turn!.id, questionId: q.id, selectedOptionId: q.correctOptionId, requestId: "dup-request-1" };
  submitAnswer(s, input, bank); submitAnswer(s, input, bank);
  assert.equal(s.score, 1);
});

test("jawaban setelah batas waktu (+toleransi) dihitung timeout", () => {
  const s = createState(bank);
  const late = s.turn!.deadlineAt + CONFIG.graceMs + 1;
  const v = answer(s, true, late);
  assert.equal(v.feedback.timedOut, true); assert.equal(v.score, 0); assert.equal(v.lives, 40);
});

test("sesi menggantung diselesaikan sebagai timeout saat dilanjutkan", () => {
  const s = createState(bank);
  const v: any = resolveStaleTurn(s, bank, s.turn!.deadlineAt + CONFIG.graceMs + 10);
  assert.equal(v.phase, "feedback"); assert.equal(v.feedback.timedOut, true);
});

test("pilihan yang bukan milik soal ditolak", () => {
  const s = createState(bank);
  assert.throws(() => submitAnswer(s, { turnId: s.turn!.id, questionId: s.turn!.questionId, selectedOptionId: "palsu", requestId: req() }, bank));
});

test("skor 60 = menang dasar, bisa klaim, lalu lanjut ke puncak", () => {
  const s = createState(bank);
  for (let i = 0; i < 60; i++) { answer(s, true); nextQuestion(s, req(), bank); }
  assert.equal(s.phase, "won");
  assert.equal(leaderboardEntry(s, "Tester").score, 60);
  continueToSummit(s, req(), bank);
  assert.equal(s.phase, "answering");
  for (let i = 0; i < 40; i++) { answer(s, true); nextQuestion(s, req(), bank); }
  assert.equal(s.phase, "summit"); assert.equal(s.position, 100);
});

test("41 kesalahan = kalah, klaim ditolak", () => {
  const s = createState(bank);
  for (let i = 0; i < 41; i++) { answer(s, false); nextQuestion(s, req(), bank); }
  assert.equal(s.phase, "lost");
  assert.throws(() => leaderboardEntry(s, "Tester"));
});

test("klaim sebelum menang ditolak", () => {
  assert.throws(() => leaderboardEntry(createState(bank), "Tester"));
});

test("nama panggilan dibersihkan; tautan & nama terlalu pendek ditolak", () => {
  assert.equal(cleanDisplayName("  Bro   HE <b> "), "Bro HE b");
  assert.throws(() => cleanDisplayName("x"));
  assert.throws(() => cleanDisplayName("kunjungi www.judi.com"));
  assert.equal(cleanDisplayName("A".repeat(40)).length, 24);
});

test("soal tidak berulang dalam satu sesi", () => {
  const s = createState(bank);
  assert.equal(new Set(s.order).size, 100);
});
