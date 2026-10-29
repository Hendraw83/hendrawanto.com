# Server leaderboard online (Supabase) — game UKP

Disiapkan oleh Claude pada 29 Okt 2026 atas keputusan Aa Hendra: platform **Supabase**; identitas pemain **cukup nama panggilan**, tanpa email dan telepon.

## Komponen live
- Proyek Supabase `hendrawanto-ukp-game` (ref `wizuklulmqphamfnfkdi`, region ap-southeast-1, paket gratis).
- Edge Function `ukp` (`verify_jwt=false`), URL: `https://wizuklulmqphamfnfkdi.supabase.co/functions/v1/ukp`.
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
- Database berisi 100 soal draft yang identik dengan `src/data/questions.demo.json` (dicek dengan hash). Seed SQL tidak di-commit.
- Karena bank demo publik di repo ini sama dengan bank online, pemain teliti tetap bisa menyontek dari repo. Untuk kompetisi resmi:
  - siapkan bank terverifikasi yang **tidak** dipublikasikan;
  - muat ke `ukp.questions` dengan `editorial_status='terverifikasi'` dan `competition_eligible=true`;
  - set secret `UKP_BANK_MODE=terverifikasi`.
- Label BETA dan `noindex` tetap dipasang sampai bank kompetisi terverifikasi.

## Uji
- `node --experimental-strip-types --test supabase/functions/ukp/logic.test.ts` → 11 uji.
- `npm test` → termasuk `src/services/supabaseBackend.test.ts`.
