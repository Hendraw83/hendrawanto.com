# Level permainan UKP

- Level A: bank 200 soal, 100 soal unik per sesi. Paket berikutnya untuk perangkat dan nama yang sama adalah komplemen paket sebelumnya.
- Level B: bank server 100 soal draft pajak badan, 100 soal unik per sesi. Sesi berikutnya mengacak urutan bank yang sama; tidak menjanjikan paket berbeda.
- Level C: tombol nonaktif dengan keterangan Segera Hadir. Tidak ada jalur untuk memulai sesi C.
- Beta tetap berlaku. Pemeriksaan 2 November 2026: A = 80 terverifikasi + 120 draft; B = 100 draft. Semua masih nonkompetisi.

## Sesi dan tampilan

Mode Supabase mengirim level pada setiap aksi. Token A lama dipertahankan; token B memakai kunci browser terpisah. Mengatur ulang B tidak menghapus A. Nama berbeda membuat sesi baru. Pemulihan sesi mempertahankan fase answering, feedback, won, summit, atau lost; fase feedback dipetakan ke pembahasan.

Perjalanan, petunjuk, lima pemain terbaik, Hall of Fame, hasil, ID sertifikat dan nama berkas unduhan mengikuti level. Leaderboard dipisahkan di server melalui ukp_leaderboard_list_v2.

## Backend aktif

Source index.ts dan logic.ts diselaraskan dari Edge Function ukp versi 10 yang sudah aktif sebelum tugas ini. Tugas ini tidak membuat ulang bank, tidak mengubah status editorial, dan tidak menerbitkan ulang backend.

Database aktif telah memiliki kolom level pada questions, sessions, dan leaderboard, serta RPC ukp_bank_v2, ukp_session_get_v2, ukp_session_create_v3, ukp_last_order_v2, ukp_leaderboard_list_v2, dan ukp_claim_v2. Kunci jawaban Level B tetap di database dan tidak disalin ke repository publik.

## Build dan verifikasi

Build produksi wajib memakai VITE_GAME_MODE=supabase dan VITE_UKP_API_URL yang tercantum di supabase/README.md.

Workflow UKP game checks menjalankan npm ci dari lockfile, test frontend, 16 test server, TypeScript, dan build. scripts/package-ukp-production.mjs hanya mengemas game, menerapkan CSP/SRI, serta menolak bank demo yang terbawa bundle. Artefak ukp-production berasal dari commit workflow yang diuji; penerbitan tetap melalui pembaruan fast-forward main.
