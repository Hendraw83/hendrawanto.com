# Level permainan UKP

- Level A: bank 200 soal, 100 soal unik per sesi. Paket berikutnya untuk perangkat dan nama yang sama adalah komplemen paket sebelumnya.
- Level B: bank server 100 soal draft pajak badan, 100 soal unik per sesi. Sesi berikutnya mengacak urutan bank yang sama.
- Level C: bank server 200 soal draft UKP C lanjutan, 100 soal unik per sesi. Paket berikutnya untuk perangkat dan nama yang sama adalah komplemen paket sebelumnya, sama seperti Level A. Materi mencakup KUP dan sengketa, PPh Badan, pemotongan/pemungutan, pajak internasional, transfer pricing, serta profesi konsultan pajak.
- Beta tetap berlaku. Pemeriksaan 2 November 2026: A = 80 terverifikasi + 120 draft; B = 100 draft; C = 200 draft. Semua masih nonkompetisi.

## Sesi dan tampilan

Mode Supabase mengirim level pada setiap aksi. Token A lama dipertahankan; token B dan C memakai kunci browser terpisah. Mengatur ulang satu level tidak menghapus level lain. Nama berbeda membuat sesi baru. Pemulihan sesi mempertahankan fase answering, feedback, won, summit, atau lost; fase feedback dipetakan ke pembahasan.

Perjalanan, petunjuk, lima pemain terbaik, Hall of Fame, hasil, ID sertifikat, dan nama berkas unduhan mengikuti level. Leaderboard dipisahkan di server melalui `ukp_leaderboard_list_v2`.

## Backend aktif

Edge Function `ukp` versi 12 menerima Level A, B, dan C. Migrasi Supabase `20261102103905_ukp_level_c` memperluas constraint level dan validasi pembuatan sesi ke C. Database aktif memakai RPC `ukp_bank_v2`, `ukp_session_get_v2`, `ukp_session_create_v3`, `ukp_last_order_v2`, `ukp_leaderboard_list_v2`, dan `ukp_claim_v2`.

Kunci jawaban Level B dan C tetap hanya di database dan tidak disalin ke repository publik. Soal C 1–100 berasal dari modul awal yang divalidasi penulis per 23 April 2026; soal 101–200 berasal dari modul advanced edisi RC-02 tanggal 19 Oktober 2026. Semua 200 butir lolos pemeriksaan struktur dan pencocokan kunci terhadap lampiran. Statusnya tetap draft karena pemeriksaan struktur tidak menggantikan audit substantif per soal.

## Build dan verifikasi

Build produksi wajib memakai `VITE_GAME_MODE=supabase` dan `VITE_UKP_API_URL` yang tercantum di `supabase/README.md`.

Workflow `UKP game checks` menjalankan instalasi dari lockfile, test frontend, test aturan server, TypeScript, build, serta pengemasan CSP/SRI. `scripts/package-ukp-production.mjs` menolak bank demo yang terbawa bundle. Artefak `ukp-production` berasal dari commit workflow yang diuji; penerbitan tetap melalui pembaruan fast-forward `main`.

