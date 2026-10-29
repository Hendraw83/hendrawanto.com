// Edge Function "ukp" — server permainan & leaderboard Tangga Konsultan Pajak.
// Deploy dengan verify_jwt = false: game publik tanpa login; tiap sesi dilindungi token acak.
// Akses DB lewat fungsi RPC (PostgREST + service role), bukan koneksi Postgres langsung,
// supaya slot koneksi tidak habis saat banyak pemain bermain bersamaan.
import {
  CONFIG,
  GameError,
  type Question,
  type State,
  cleanDisplayName,
  continueToSummit,
  createState,
  leaderboardEntry,
  nextQuestion,
  resolveStaleTurn,
  submitAnswer,
  view,
} from "./logic.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const ALLOWED_ORIGINS = new Set([
  "https://hendrawanto.com",
  "https://www.hendrawanto.com",
  SUPABASE_URL, // origin proyek sendiri, untuk uji langsung dari URL fungsi
  ...(Deno.env.get("UKP_EXTRA_ORIGINS") ?? "").split(",").map((s) => s.trim()).filter(Boolean),
]);
// "draft" = boleh memakai soal draft (masa beta). "terverifikasi" = hanya soal lolos verifikasi.
const BANK_MODE = Deno.env.get("UKP_BANK_MODE") === "terverifikasi" ? "terverifikasi" : "draft";
// Salt hash IP: pakai secret khusus bila ada; jika tidak, kunci service role (rahasia bawaan proyek).
const IP_SALT = Deno.env.get("UKP_IP_SALT") ?? SERVICE_KEY;
const MAX_SESSIONS_PER_HOUR = 20;

async function rpc<T>(fn: string, args: Record<string, unknown>): Promise<T> {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
    },
    body: JSON.stringify(args),
  });
  if (!r.ok) {
    console.error(`rpc ${fn} gagal`, r.status, await r.text());
    throw new Error(`rpc ${fn} ${r.status}`);
  }
  return await r.json() as T;
}

let bankCache: { at: number; bank: Map<string, Question> } | null = null;

async function loadBank(): Promise<Map<string, Question>> {
  if (bankCache && Date.now() - bankCache.at < 5 * 60_000) return bankCache.bank;
  const rows = await rpc<Question[]>("ukp_bank", { p_verified: BANK_MODE === "terverifikasi" });
  const bank = new Map<string, Question>(rows.map((q) => [q.id, q]));
  bankCache = { at: Date.now(), bank };
  return bank;
}

async function sha256(text: string): Promise<string> {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function randomToken(): string {
  const b = new Uint8Array(32);
  crypto.getRandomValues(b);
  return btoa(String.fromCharCode(...b)).replace(/[+/=]/g, (c) => ({ "+": "-", "/": "_", "=": "" }[c]!));
}

function cors(origin: string | null): Record<string, string> {
  const h: Record<string, string> = {
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type, apikey, authorization, x-client-info",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };
  if (origin && ALLOWED_ORIGINS.has(origin)) h["Access-Control-Allow-Origin"] = origin;
  return h;
}

function json(body: unknown, status: number, origin: string | null) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors(origin), "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

type Row = { id: string; token_hash: string; state: State; version: number; bank_mode: string };

async function loadSession(sessionId: unknown, token: unknown): Promise<Row> {
  if (typeof sessionId !== "string" || !/^[0-9a-f-]{36}$/.test(sessionId) || typeof token !== "string") {
    throw new GameError("Sesi tidak ditemukan atau sudah kedaluwarsa.", 404);
  }
  const row = await rpc<Row | null>("ukp_session_get", { p_id: sessionId });
  if (!row || row.token_hash !== await sha256(token)) {
    throw new GameError("Sesi tidak ditemukan atau sudah kedaluwarsa.", 404);
  }
  return row;
}

async function saveSession(row: Row) {
  const ok = await rpc<boolean>("ukp_session_save", {
    p_id: row.id, p_version: row.version, p_state: row.state, p_phase: row.state.phase,
  });
  if (!ok) throw new GameError("Sesi sedang diperbarui di tab lain. Muat ulang.", 409);
}

const leaderboard = () => rpc<unknown[]>("ukp_leaderboard_list", { p_limit: CONFIG.maxLeaderboardRows });

async function handle(body: Record<string, unknown>, ip: string) {
  const action = body.action;
  if (action === "leaderboard") return { entries: await leaderboard() };

  const bank = await loadBank();

  if (action === "start") {
    // Sama dengan adapter demo: sesi lama (termasuk yang sudah selesai) dilanjutkan bila tokennya sah.
    // Sesi baru hanya dibuat setelah pemain mengatur ulang (resetSession menghapus token di browser).
    if (body.sessionId && body.token) {
      try {
        const row = await loadSession(body.sessionId, body.token);
        if (row.bank_mode === BANK_MODE) {
          const v = resolveStaleTurn(row.state, bank);
          await saveSession(row);
          return { session: v };
        }
      } catch (e) {
        if (!(e instanceof GameError)) throw e;
      }
    }
    const state = createState(bank);
    const token = randomToken();
    const ok = await rpc<boolean>("ukp_session_create", {
      p_id: state.id,
      p_token_hash: await sha256(token),
      p_ip_hash: await sha256(`${IP_SALT}|${ip}`),
      p_state: state,
      p_phase: state.phase,
      p_bank_mode: BANK_MODE,
      p_limit: MAX_SESSIONS_PER_HOUR,
    });
    if (!ok) throw new GameError("Terlalu banyak sesi baru dari jaringan ini. Coba lagi dalam satu jam.", 429);
    return { session: view(state, bank), token };
  }

  const row = await loadSession(body.sessionId, body.token);
  let result: unknown;
  switch (action) {
    case "answer":
      result = { session: submitAnswer(row.state, {
        turnId: String(body.turnId ?? ""),
        questionId: String(body.questionId ?? ""),
        selectedOptionId: typeof body.selectedOptionId === "string" ? body.selectedOptionId : null,
        requestId: body.requestId as string,
      }, bank) };
      break;
    case "next":
      result = { session: nextQuestion(row.state, body.requestId as string, bank) };
      break;
    case "summit":
      result = { session: continueToSummit(row.state, body.requestId as string, bank) };
      break;
    case "claim": {
      const name = cleanDisplayName(body.displayName);
      const e = leaderboardEntry(row.state, name);
      const saved = await rpc<boolean>("ukp_claim", {
        p_session: row.id, p_name: e.displayName, p_score: e.score, p_wrong: e.wrongCount,
        p_ms: e.totalAnswerMs, p_position: e.position, p_bank_mode: row.bank_mode,
        p_completed_ms: e.completedAt, p_expires_ms: e.expiresAt,
      });
      return { entry: e, duplicate: !saved };
    }
    case "resume":
      result = { session: resolveStaleTurn(row.state, bank) };
      break;
    default:
      throw new GameError("Aksi tidak dikenal.");
  }
  await saveSession(row);
  return result;
}

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(origin) });
  if (req.method !== "POST") return json({ error: "Metode tidak didukung." }, 405, origin);
  if (!origin || !ALLOWED_ORIGINS.has(origin)) return json({ error: "Origin tidak diizinkan." }, 403, origin);
  const len = Number(req.headers.get("content-length") ?? "0");
  if (len > 4096) return json({ error: "Permintaan terlalu besar." }, 413, origin);
  try {
    const body = await req.json();
    if (!body || typeof body !== "object") throw new GameError("Format permintaan tidak valid.");
    const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
    return json(await handle(body, ip), 200, origin);
  } catch (e) {
    if (e instanceof GameError) return json({ error: e.message }, e.status, origin);
    console.error(e);
    return json({ error: "Server permainan sedang bermasalah. Coba lagi." }, 500, origin);
  }
});
