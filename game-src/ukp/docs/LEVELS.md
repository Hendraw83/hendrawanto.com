# Level permainan UKP

- Level A: bank 200 soal, 100 soal unik per sesi. Paket berikutnya untuk perangkat dan nama yang sama adalah komplemen paket sebelumnya.
- Level B: bank server 300 soal draft pajak badan, 100 soal unik per sesi. Tiga permainan berturut-turut untuk perangkat dan nama yang sama memakai tiga paket berbeda tanpa irisan. Setelah itu rotasi bergulir dengan tetap mengecualikan dua paket terakhir.
- Level C: bank server 300 soal draft UKP C lanjutan, 100 soal unik per sesi. Tiga permainan berturut-turut untuk perangkat dan nama yang sama memakai tiga paket berbeda tanpa irisan. Setelah itu rotasi bergulir dengan tetap mengecualikan dua paket terakhir. Materi mencakup KUP dan sengketa, PPh Badan, pemotongan/pemungutan, pajak internasional, transfer pricing, serta profesi konsultan pajak.
- Beta tetap berlaku. Pemeriksaan 3 November 2026: A = 80 terverifikasi + 120 draft; B = 300 draft; C = 300 draft. Semua masih nonkompetisi.

## Pengacakan paket di produksi (11 November 2026)

Bank aktif saat perubahan ini adalah A 300, B 300, dan C 413 soal. Pembagian editorial mengikuti sequence: 1–100, 101–200, 201–300, dan khusus C paket tambahan 301–413. Setiap sesi online memilih satu paket secara acak dan mengacak 100 soal unik di dalamnya. Paket C terakhir mengambil 100 dari 113 soal. Riwayat perangkat dan nama pemain mengecualikan paket terbaru sampai semua paket mendapat giliran. Sesi yang dilanjutkan mempertahankan order dan deadline tersimpan.

Riwayat sesi lama dapat berisi campuran beberapa paket. Peralihan memilih paket dengan irisan terkecil terhadap riwayat tersebut. Setelah riwayat baru terbentuk, rotasi berjalan per paket. Mulai serentak dari dua tab memakai pemeriksaan riwayat dengan kunci transaksi per pemain dan level. Jika riwayat berubah, tab kedua menerima 409 dan dapat mencoba mulai lagi.

Implementasi produksi berada di `supabase/functions/ukp/logic.ts`; SQL RPC ada di `scripts/update-package-rotation.sql`. Mode demo lokal tetap menggunakan rotasi yang sudah ada.

## Sesi dan tampilan

Mode Supabase mengirim level pada setiap aksi. Token A lama dipertahankan; token B dan C memakai kunci browser terpisah. Mengatur ulang satu level tidak menghapus level lain. Nama berbeda membuat sesi baru. Pemulihan sesi mempertahankan fase answering, feedback, won, summit, atau lost; fase feedback dipetakan ke pembahasan.

Perjalanan, petunjuk, lima pemain terbaik, Hall of Fame, hasil, ID sertifikat, dan nama berkas unduhan mengikuti level. Leaderboard dipisahkan di server melalui `ukp_leaderboard_list_v2`.

## Backend aktif

Edge Function `ukp` versi 15 menerima Level A, B, dan C. Migrasi Supabase `ukp_level_b_three_round_rotation` mengelola dua paket terakhir Level B; migrasi `ukp_level_c_three_round_rotation` tetap mengelola dua paket terakhir Level C. Database aktif memakai RPC `ukp_bank_v2`, `ukp_session_get_v2`, `ukp_session_create_v3`, `ukp_recent_orders_v3`, `ukp_leaderboard_list_v2`, dan `ukp_claim_v2`.

Kunci jawaban Level B dan C tetap hanya di database dan tidak disalin ke repository publik. Soal B 101–200 berasal dari Master Casebook UKP Tingkat B 2026 edisi RC-01 tanggal 20 Oktober 2026. Soal B 201–300 berasal dari Modul USKP B edisi validasi regulasi 22 April 2026. Setiap paket memiliki empat opsi, satu kunci, pembahasan, dan dasar hukum per butir; seluruhnya tetap draft sampai audit substantif selesai.

Soal C 1–100 berasal dari modul awal yang divalidasi penulis per 23 April 2026; soal 101–200 berasal dari modul advanced edisi RC-02 tanggal 19 Oktober 2026. Soal 201–300 adalah Paket 3 yang dikembangkan pada 3 November 2026 berdasarkan cakupan Paket 1 dan 2. Seluruh 300 butir lolos pemeriksaan struktur; Paket 1–2 juga telah dicocokkan dengan lampiran kunci. Paket 3 memiliki satu kunci valid per soal, tetapi tetap memerlukan reviu substantif. Semua soal berstatus draft karena pemeriksaan struktur tidak menggantikan audit hukum dan editorial per soal.

## Build dan verifikasi

Build produksi wajib memakai `VITE_GAME_MODE=supabase` dan `VITE_UKP_API_URL` yang tercantum di `supabase/README.md`.

Workflow `UKP game checks` menjalankan instalasi dari lockfile, test frontend, test aturan server, TypeScript, build, serta pengemasan CSP/SRI. `scripts/package-ukp-production.mjs` menolak bank demo yang terbawa bundle. Isi `game/ukp` disalin dari artefak `ukp-production` yang diuji, dan aset build lama dihapus sebelum penerbitan fast-forward `main`.

