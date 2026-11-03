# Server leaderboard online (Supabase) — game UKP

Disiapkan oleh Claude pada 29 Okt 2026 atas keputusan Aa Hendra: platform **Supabase**; identitas pemain **cukup nama panggilan**, tanpa email dan telepon.

## Komponen live
- Proyek Supabase `hendrawanto-ukp-game` (ref `wizuklulmqphamfnfkdi`, region ap-southeast-1, paket gratis).
- Edge Function `ukp` versi 12 (`verify_jwt=false`), URL: `https://wizuklulmqphamfnfkdi.supabase.co/functions/v1/ukp`.
  - Aksi: `start`, `answer`, `next`, `summit`, `claim`, `leaderboard`.
  - Hanya menerima Origin dari hendrawanto.com dan origin proyeknya sendiri.
  - Token sesi acak hanya disimpan sebagai hash. Ada batas 20 sesi baru per jam per jaringan (IP disimpan sebagai hash).
- Skema `ukp` (`questions`, `sessions`, `leaderboard`) dengan RLS aktif tanpa policy, sehingga browser tidak punya akses langsung. Fungsi `public.ukp_*` bersifat `SECURITY DEFINER` dan hanya dapat dieksekusi `service_role`.
- Aturan permainan di `functions/ukp/logic.ts` identik dengan `src/services/demoBackend.ts`. Ada toleransi jaringan 3 detik untuk batas waktu jawaban.

## Build frontend mode online
```bash
VITE_GAME_MODE=supabase \
VITE_UKP_API_URL=https://wizuklulmqphamfnfkdi.supabase.co/functions/v1/ukp \
npx vite build --base /game/ukp/ --outDir <tmp>
```
Setelah build:
1. Salin `index.html` dan `assets/*.js|*.css` ke `game/ukp/`. Jangan salin berkas `.map`.
2. Hapus aset build lama.
3. Jalankan `node scripts/security-policy.mjs --apply`. `connect-src` untuk `game/ukp/index.html` sudah diatur lewat `ukpApiOrigin` di skrip itu.
4. Kembalikan perubahan referrer otomatis di desk/newclient/SHSNewClientDesk serta perubahan pada `game-src/ukp/index.html`.

**Wajib dicek:** build mode `supabase` tidak boleh memuat bank soal. Perintah `grep -c "he-ukp-a-0" game/ukp/assets/*.js` harus menghasilkan 0 untuk setiap berkas.

Build tanpa `VITE_GAME_MODE=supabase` kembali ke mode demo lokal, yang membawa bank soal ke browser. Jangan terbitkan build demo ke `game/ukp/`.

## Bank soal & batasan
- Database berisi Level A sebanyak 200 soal (80 `terverifikasi`, 120 `draft`), Level B sebanyak 100 soal `draft`, dan Level C sebanyak 200 soal `draft`. Semuanya belum layak kompetisi. Seed SQL dan kunci Level B/C tidak di-commit.
- Soal C 1–100 berasal dari modul awal yang divalidasi penulis per 23 April 2026; soal 101–200 berasal dari modul advanced edisi RC-02 tanggal 19 Oktober 2026. Semua 200 butir telah diperiksa strukturnya dan kuncinya cocok dengan bagian jawaban. Seluruhnya tetap memerlukan audit hukum per butir.
- Daftar 21 koreksi atau klarifikasi dan keputusan editorial tercatat di `docs/QUESTION_REVIEW_2026-10-30.md`.
- Karena bank demo publik di repo ini sama dengan bank online, pemain teliti tetap bisa menyontek dari repo. Untuk kompetisi resmi:
  - siapkan bank terverifikasi yang **tidak** dipublikasikan;
  - muat ke `ukp.questions` dengan `editorial_status='terverifikasi'` dan `competition_eligible=true`;
  - set secret `UKP_BANK_MODE=terverifikasi`.
- Label BETA dan `noindex` tetap dipasang sampai bank kompetisi terverifikasi.

## Uji
- `node --test supabase/functions/ukp/logic.test.ts` mencakup rotasi tanpa irisan untuk Level A/C, gerbang 60, puncak 100, serta penolakan bank kurang dari 100 untuk Level B dan kurang dari 200 untuk Level C.
- `npm test` mencakup pemisahan token, sesi, leaderboard, dan sertifikat Level A/B/C.


