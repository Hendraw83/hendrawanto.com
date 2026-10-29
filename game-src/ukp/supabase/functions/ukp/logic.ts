// Logika permainan "Tangga Konsultan Pajak" yang berjalan di server.
// Murni (tanpa I/O) supaya bisa diuji di Node maupun Deno.
// Aturan disalin dari adapter demo di bundle game (game/ukp/assets/index-*.js, kelas Pe).

export const CONFIG = {
  stairCount: 100,
  startPosition: 0,
  startLives: 41,
  answerSeconds: 60,
  graceMs: 3000, // toleransi jaringan untuk batas waktu jawaban
  winScore: 60,
  leaderboardDays: 7,
  maxLeaderboardRows: 50,
  questionCount: 100,
} as const;

export type Option = { id: string; text: string };
export type Question = {
  id: string;
  sequence: number;
  topic: string;
  prompt: string;
  options: Option[];
  correctOptionId: string;
  explanation: string;
  source: unknown;
};

export type Turn = {
  id: string;
  questionId: string;
  startedAt: number;
  deadlineAt: number;
  optionIds: string[];
};

export type Phase = "answering" | "feedback" | "won" | "summit" | "lost";

export type State = {
  id: string;
  phase: Phase;
  order: string[];
  cursor: number;
  score: number;
  correctCount: number;
  wrongCount: number;
  lives: number;
  position: number;
  totalAnswerMs: number;
  startedAt: number;
  completedAt: number | null;
  turn: Turn | null;
  feedback: Record<string, unknown> | null;
  pendingOutcome: { outcome: "won" | "summit" | "lost"; reason: string } | null;
  summitMode: boolean;
  processed: Record<string, unknown>;
};

export class GameError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export function shuffle<T>(items: T[], rand: () => number = secureRandom): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function secureRandom(): number {
  const b = new Uint32Array(1);
  crypto.getRandomValues(b);
  return b[0] / 2 ** 32;
}

function newTurn(q: Question, now: number): Turn {
  return {
    id: crypto.randomUUID(),
    questionId: q.id,
    startedAt: now,
    deadlineAt: now + CONFIG.answerSeconds * 1000,
    optionIds: shuffle(q.options.map((o) => o.id)),
  };
}

export function createState(bank: Map<string, Question>, now = Date.now()): State {
  if (bank.size < CONFIG.questionCount) {
    throw new GameError("Bank soal online belum mencapai 100 soal.", 503);
  }
  const order = shuffle([...bank.keys()]).slice(0, CONFIG.questionCount);
  return {
    id: crypto.randomUUID(),
    phase: "answering",
    order,
    cursor: 0,
    score: 0,
    correctCount: 0,
    wrongCount: 0,
    lives: CONFIG.startLives,
    position: CONFIG.startPosition,
    totalAnswerMs: 0,
    startedAt: now,
    completedAt: null,
    turn: newTurn(bank.get(order[0])!, now),
    feedback: null,
    pendingOutcome: null,
    summitMode: false,
    processed: {},
  };
}

function publicQuestion(turn: Turn, bank: Map<string, Question>) {
  const q = bank.get(turn.questionId);
  if (!q) throw new GameError("Soal tidak ditemukan.", 500);
  // Kunci jawaban TIDAK pernah dikirim sebelum pemain menjawab.
  const options = turn.optionIds.map((id) => {
    const o = q.options.find((x) => x.id === id)!;
    return { id: o.id, text: o.text };
  });
  return { id: q.id, topic: q.topic, prompt: q.prompt, options, sequence: q.sequence };
}

function result(s: State) {
  if (s.phase !== "won" && s.phase !== "summit" && s.phase !== "lost") return null;
  return {
    outcome: s.phase,
    reason: s.pendingOutcome?.reason ??
      (s.phase === "summit" ? "summit" : s.phase === "won" ? "score" : "lives"),
    score: s.score,
    correctCount: s.correctCount,
    wrongCount: s.wrongCount,
    position: s.position,
    totalAnswerMs: s.totalAnswerMs,
    startedAt: s.startedAt,
    completedAt: s.completedAt,
  };
}

export function view(s: State, bank: Map<string, Question>) {
  return {
    id: s.id,
    phase: s.phase,
    mode: "online",
    score: s.score,
    correctCount: s.correctCount,
    wrongCount: s.wrongCount,
    lives: s.lives,
    position: s.position,
    questionIndex: s.cursor + 1,
    questionCount: s.order.length,
    totalAnswerMs: s.totalAnswerMs,
    startedAt: s.startedAt,
    deadlineAt: s.phase === "answering" ? s.turn?.deadlineAt ?? null : null,
    turnId: s.turn?.id ?? null,
    question: s.turn ? publicQuestion(s.turn, bank) : null,
    feedback: s.feedback,
    result: result(s),
  };
}

function remember(s: State, requestId: string, v: unknown) {
  s.processed[requestId] = v;
  const keys = Object.keys(s.processed);
  for (const k of keys.slice(0, Math.max(0, keys.length - 24))) delete s.processed[k];
}

function checkRequestId(id: unknown): string {
  if (typeof id !== "string" || id.length < 8 || id.length > 80) {
    throw new GameError("requestId tidak valid.");
  }
  return id;
}

export type AnswerInput = {
  turnId: string;
  questionId: string;
  selectedOptionId: string | null;
  requestId: string;
};

export function submitAnswer(
  s: State,
  input: AnswerInput,
  bank: Map<string, Question>,
  now = Date.now(),
) {
  const requestId = checkRequestId(input.requestId);
  if (s.processed[requestId]) return s.processed[requestId];
  if (s.phase !== "answering" || !s.turn) {
    throw new GameError("Sesi tidak sedang menerima jawaban.", 409);
  }
  if (s.turn.id !== input.turnId || s.turn.questionId !== input.questionId) {
    throw new GameError("Jawaban sudah kedaluwarsa. Muat ulang sesi.", 409);
  }
  const q = bank.get(s.turn.questionId)!;
  const timedOut = now >= s.turn.deadlineAt + CONFIG.graceMs || input.selectedOptionId === null;
  if (input.selectedOptionId !== null && !s.turn.optionIds.includes(input.selectedOptionId)) {
    throw new GameError("Pilihan jawaban tidak valid.");
  }
  const correct = !timedOut && input.selectedOptionId === q.correctOptionId;
  const spent = Math.max(0, Math.min(CONFIG.answerSeconds * 1000, now - s.turn.startedAt));
  s.totalAnswerMs += spent;
  if (correct) {
    s.score += 1;
    s.correctCount += 1;
    s.position = Math.min(CONFIG.stairCount, s.position + 1);
  } else {
    s.wrongCount += 1;
    s.lives = Math.max(0, s.lives - 1);
  }
  s.feedback = {
    turnId: s.turn.id,
    questionId: q.id,
    selectedOptionId: timedOut ? null : input.selectedOptionId,
    correctOptionId: q.correctOptionId,
    correct,
    timedOut,
    explanation: q.explanation,
    source: q.source,
    scoreDelta: correct ? 1 : 0,
    livesDelta: correct ? 0 : -1,
    positionDelta: correct ? 1 : 0,
  };
  s.phase = "feedback";
  if (s.position >= CONFIG.stairCount) {
    s.pendingOutcome = { outcome: "summit", reason: "summit" };
  } else if (!s.summitMode && s.score >= CONFIG.winScore) {
    s.pendingOutcome = { outcome: "won", reason: "score" };
  } else if (s.lives <= 0) {
    s.pendingOutcome = { outcome: s.score >= CONFIG.winScore ? "won" : "lost", reason: "lives" };
  } else if (s.cursor >= s.order.length - 1) {
    s.pendingOutcome = { outcome: s.score >= CONFIG.winScore ? "won" : "lost", reason: "questions" };
  }
  const v = view(s, bank);
  remember(s, requestId, v);
  return v;
}

/** Bila pemain kembali setelah batas waktu lewat, soal yang menggantung dihitung timeout. */
export function resolveStaleTurn(s: State, bank: Map<string, Question>, now = Date.now()) {
  if (s.phase === "answering" && s.turn && now >= s.turn.deadlineAt + CONFIG.graceMs) {
    return submitAnswer(s, {
      turnId: s.turn.id,
      questionId: s.turn.questionId,
      selectedOptionId: null,
      requestId: `timeout-${s.turn.id}`,
    }, bank, now);
  }
  return view(s, bank);
}

export function nextQuestion(s: State, requestId: string, bank: Map<string, Question>, now = Date.now()) {
  requestId = checkRequestId(requestId);
  if (s.processed[requestId]) return s.processed[requestId];
  if (s.phase !== "feedback") throw new GameError("Pembahasan belum siap dilanjutkan.", 409);
  if (s.pendingOutcome) {
    s.phase = s.pendingOutcome.outcome;
    s.completedAt = now;
  } else {
    s.cursor += 1;
    s.turn = newTurn(bank.get(s.order[s.cursor])!, now);
    s.phase = "answering";
    s.feedback = null;
  }
  const v = view(s, bank);
  remember(s, requestId, v);
  return v;
}

export function continueToSummit(s: State, requestId: string, bank: Map<string, Question>, now = Date.now()) {
  requestId = checkRequestId(requestId);
  if (s.processed[requestId]) return s.processed[requestId];
  if (s.phase !== "won" || s.score < CONFIG.winScore) {
    throw new GameError("Gerbang Kemenangan Dasar belum tercapai.", 409);
  }
  if (s.position >= CONFIG.stairCount || s.cursor >= s.order.length - 1 || s.lives <= 0) {
    throw new GameError("Tidak ada soal unik tersisa untuk melanjutkan pendakian.", 409);
  }
  s.summitMode = true;
  s.pendingOutcome = null;
  s.cursor += 1;
  s.turn = newTurn(bank.get(s.order[s.cursor])!, now);
  s.feedback = null;
  s.completedAt = null;
  s.phase = "answering";
  const v = view(s, bank);
  remember(s, requestId, v);
  return v;
}

/** Hanya nama panggilan; email/telepon sengaja tidak diterima. */
export function cleanDisplayName(raw: unknown): string {
  if (typeof raw !== "string") throw new GameError("Nama leaderboard wajib diisi.");
  // Buang <, >, karakter kontrol, dan karakter tak terlihat / pembalik arah teks.
  const blocked = (c: number) =>
    c === 60 || c === 62 || c < 32 || (c >= 127 && c <= 159) ||
    (c >= 0x200b && c <= 0x200f) || (c >= 0x2028 && c <= 0x202e);
  const name = [...raw.normalize("NFKC")].filter((ch) => !blocked(ch.codePointAt(0)!)).join("")
    .replace(/\s{2,}/g, " ").trim().slice(0, 24);
  if (name.length < 2) throw new GameError("Nama leaderboard minimal 2 karakter.");
  if (/https?:|www\.|\.(com|id|net|org)\b/i.test(name)) {
    throw new GameError("Nama leaderboard tidak boleh berisi tautan.");
  }
  return name;
}

export function leaderboardEntry(s: State, displayName: string) {
  if (s.phase !== "won" && s.phase !== "summit") {
    throw new GameError("Klaim ditolak: kemenangan belum terverifikasi.", 409);
  }
  const completedAt = s.completedAt ?? Date.now();
  return {
    id: s.id,
    displayName,
    score: s.score,
    wrongCount: s.wrongCount,
    totalAnswerMs: s.totalAnswerMs,
    completedAt,
    expiresAt: completedAt + CONFIG.leaderboardDays * 86_400_000,
    position: s.position,
  };
}
