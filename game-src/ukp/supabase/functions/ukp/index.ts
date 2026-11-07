// Edge Function "ukp" — server permainan & leaderboard Tangga Konsultan Pajak.
// Deploy dengan verify_jwt = false: game publik tanpa login; tiap sesi dilindungi token acak.
// Akses DB lewat fungsi RPC (PostgREST + service role), bukan koneksi Postgres langsung,
// supaya slot koneksi tidak habis saat banyak pemain bermain bersamaan.
import {
  CONFIG,
  GameError,
  type GameLevel,
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

const bankCache = new Map<string,{ at: number; bank: Map<string, Question> }>();

async function loadBank(level: GameLevel): Promise<Map<string, Question>> {
  const cacheKey=`${level}:${BANK_MODE}`,cached=bankCache.get(cacheKey);
  if (cached && Date.now() - cached.at < 5 * 60_000) return cached.bank;
  const rows = await rpc<Question[]>("ukp_bank_v2", { p_verified: BANK_MODE === "terverifikasi",p_level:level });
  const bank = new Map<string, Question>(rows.map((q) => [q.id, q]));
  bankCache.set(cacheKey,{ at: Date.now(), bank });
  return bank;
}

function cleanLevel(value:unknown):GameLevel{
  if(value===undefined||value===null||value==="A")return "A";
  if(value==="B"||value==="C")return value;
  throw new GameError("Level permainan tidak valid.");
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

type Row = { id: string; token_hash: string; state: State; version: number; bank_mode: string; level: GameLevel };

async function loadSession(sessionId: unknown, token: unknown): Promise<Row> {
  if (typeof sessionId !== "string" || !/^[0-9a-f-]{36}$/.test(sessionId) || typeof token !== "string") {
    throw new GameError("Sesi tidak ditemukan atau sudah kedaluwarsa.", 404);
  }
  const row = await rpc<Row | null>("ukp_session_get_v2", { p_id: sessionId });
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
  await saveProgress(row);
}

// Hall of Fame menampilkan semua pemain yang sudah menjawab minimal 1 soal (keputusan Aa Hendra 6 Nov 2026).
// Gagal mencatat progres tidak boleh menghentikan permainan.
async function saveProgress(row: Row) {
  const s = row.state;
  if (!s.playerName || !s.playerHash || s.correctCount + s.wrongCount < 1) return;
  try {
    await rpc<boolean>("ukp_progress_upsert", {
      p_session: row.id, p_level: row.level, p_player_hash: s.playerHash, p_name: s.playerName,
      p_score: s.score, p_wrong: s.wrongCount, p_ms: s.totalAnswerMs, p_position: s.position, p_phase: s.phase,
    });
  } catch (e) {
    console.error("progres gagal dicatat", e);
  }
}

const leaderboard = (level:GameLevel) => rpc<unknown[]>("ukp_leaderboard_list_v3", { p_limit: CONFIG.maxLeaderboardRows,p_level:level });

async function handle(body: Record<string, unknown>, ip: string) {
  const action = body.action;
  const level=cleanLevel(body.level);
  if (action === "leaderboard") return { entries: await leaderboard(level) };

  const bank = await loadBank(level);

  if (action === "start") {
    // Kompatibilitas singkat untuk bundle lama yang belum mengirim identitas pemain.
    // Bundle baru selalu memakai UUID persisten; fallback ini hanya menghindari downtime
    // selama cache halaman lama masih aktif dan diturunkan menjadi hash ber-salt server.
    let profileId: string;
    if (body.playerId === undefined || body.playerId === null) {
      profileId = await sha256(`${IP_SALT}|legacy-device|${ip}`);
    } else if (typeof body.playerId === "string" && /^[0-9a-f-]{36}$/i.test(body.playerId)) {
      profileId = body.playerId;
    } else {
      throw new GameError("Identitas anonim pemain tidak valid.");
    }
    const playerName = body.playerName === undefined
      ? "AvatarMu"
      : cleanDisplayName(body.playerName);
    const playerHash=await sha256(`${IP_SALT}|player|${profileId}|${playerName.toLocaleLowerCase("id-ID")}`);
    // Sama dengan adapter demo: sesi lama (termasuk yang sudah selesai) dilanjutkan bila tokennya sah.
    // Sesi baru hanya dibuat setelah pemain mengatur ulang (resetSession menghapus token di browser).
    if (body.sessionId && body.token) {
      try {
        const row = await loadSession(body.sessionId, body.token);
        if (row.bank_mode === BANK_MODE&&row.level===level) {
          // Sesi lama (sebelum fitur ini) belum menyimpan nama: lengkapi saat dilanjutkan.
          if (!row.state.playerName || !row.state.playerHash) {
            row.state.playerName = playerName;
            row.state.playerHash = playerHash;
          }
          const v = resolveStaleTurn(row.state, bank);
          await saveSession(row);
          return { session: v };
        }
      } catch (e) {
        if (!(e instanceof GameError)) throw e;
      }
    }
    const previousOrder=await rpc<string[]>("ukp_recent_orders_v3",{p_player_hash:playerHash,p_level:level});
    const state = createState(bank,Date.now(),previousOrder,level);
    state.playerName = playerName;
    state.playerHash = playerHash;
    const token = randomToken();
    const ok = await rpc<boolean>("ukp_session_create_v3", {
      p_id: state.id,
      p_token_hash: await sha256(token),
      p_ip_hash: await sha256(`${IP_SALT}|${ip}`),
      p_player_hash: playerHash,
      p_state: state,
      p_phase: state.phase,
      p_bank_mode: BANK_MODE,
      p_level: level,
      p_limit: MAX_SESSIONS_PER_HOUR,
    });
    if (!ok) throw new GameError("Terlalu banyak sesi baru dari jaringan ini. Coba lagi dalam satu jam.", 429);
    return { session: view(state, bank), token };
  }

  const row = await loadSession(body.sessionId, body.token);
  if(row.level!==level)throw new GameError("Sesi tidak sesuai dengan level permainan.",409);
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
      const saved = await rpc<boolean>("ukp_claim_v2", {
        p_session: row.id, p_name: e.displayName, p_score: e.score, p_wrong: e.wrongCount,
        p_ms: e.totalAnswerMs, p_position: e.position, p_bank_mode: row.bank_mode,
        p_completed_ms: e.completedAt, p_expires_ms: e.expiresAt,
        p_level: row.level,
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

