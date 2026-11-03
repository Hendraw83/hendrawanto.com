# Menaiki Tangga Puncak Kemenangan Konsultan Pajak

MVP game edukasi perpajakan Indonesia dengan React, Vite, TypeScript, Tailwind CSS, dan backend Firebase yang bersifat server-authoritative. Prototipe React Three Fiber tetap tersedia di source, tetapi renderer utama memakai ilustrasi 2D ringan sesuai arahan visual terbaru.

> Ini adalah snapshot kode sumber publik. Berkas `.env`, kredensial, bank soal master, dan bank jawaban privat server sengaja tidak disertakan. Rincian snapshot terdapat di [SOURCE_SNAPSHOT.md](SOURCE_SNAPSHOT.md).

## Pilihan Level A, B, dan C

Level A memakai 100 dari 200 soal dalam dua paket tanpa irisan. Level C memakai 100 dari 300 soal dalam tiga paket tanpa irisan untuk tiga permainan berturut-turut. Level B memakai 100 soal dari server dan urutannya diacak tiap sesi. Sesi, leaderboard, petunjuk, dan sertifikat mengikuti level yang dipilih. Seluruh soal B/C masih draft; label BETA tetap berlaku. Rincian terdapat di [docs/LEVELS.md](docs/LEVELS.md).

## 1. Ringkasan rancangan dan asumsi

- **Tangga 60** adalah Gerbang Kemenangan Dasar. Pintu emas 2D membuka; pemain boleh klaim atau lanjut.
- **Tangga 100** adalah Puncak Kemenangan Utama. Medali “Konsultan Pajak Profesional” tampil sebagai pencapaian edukasi.
- Salah/timeout tidak menurunkan tangga atau skor, tetapi mengurangi satu dari 41 nyawa.
- Level A memiliki bank 200 soal dan memakai tepat 100 soal unik per sesi; paket berikutnya memakai 100 soal komplemen tanpa irisan. Level C memiliki bank 300 soal; tiga permainan berturut-turut memakai tiga paket berbeda tanpa irisan. Level B memiliki bank server 100 soal yang diacak ulang setiap sesi.
- Puncak 100 hanya mungkin bila 100/100 jawaban pada paket sesi benar. Kemenangan dasar tetap aman jika pendakian lanjutan berhenti.
- Mode demo memakai bank latihan hasil review di perangkat. Mode online produksi hanya menerima soal yang telah disetujui untuk kompetisi.

Runtime yang dipilih: Node.js 22.12+ dan npm 10+. Versi dependensi dikunci di `package.json`; Cloud Functions memakai runtime Node.js 22.

## 2. Game Design Document ringkas

Dokumen lengkap: [docs/GAME_DESIGN.md](docs/GAME_DESIGN.md).

Alur: pembuka → petunjuk → game → hasil dasar/kalah → opsional lanjut ke puncak → klaim → Hall of Fame. Feedback, pembahasan, animasi, dan tombol Lanjut memisahkan fase menjawab agar waktu baca tidak dihitung.

## 3. Arsitektur sistem dan diagram state

Lihat [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md). Frontend memakai satu `BackendClient`; implementasi demo dan online menghasilkan kontrak snapshot identik. Reducer memisahkan state `ready`, `answering`, `checking`, `moving`, `explanation`, `won`, `claimed`, `lost`, dan `connectionError`.

## 4. Skema database, operasi backend, dan aturan akses

Lihat [docs/BACKEND_SECURITY.md](docs/BACKEND_SECURITY.md). Firestore Rules menutup bank jawaban, sesi, history, klaim, kontak, dan rate limit. Hanya leaderboard yang sudah disanitasi dapat dibaca, dan hanya sampai `expiresAt` tujuh hari berdasarkan waktu server.

## 5. Struktur folder proyek

```text
content/                     template editorial; bank master bersifat lokal/privat
docs/                        GDD, arsitektur, keamanan, editorial
functions/
  data/                      bank privat hasil generator, tidak masuk Git
  src/                       callable Functions + mesin aturan + seeder
  test/                      unit test aturan server
scripts/                     validator/generator bank soal
src/
  audio/                     audio prosedural
  components/                layar dan panel HTML aksesibel
  config/                    konfigurasi game terpusat
  data/                      bank demo hasil generator
  game/                      kontrak, reducer, randomisasi
  hooks/                     controller, timer, reduced motion
  scene/                     prototipe 3D opsional (tidak dimuat renderer utama)
  services/                  backend demo/online + Firebase client
firebase.json                emulator/deploy
firestore.rules              aturan minimum-access
firestore.indexes.json       indeks produksi
```

## 6. Implementasi lengkap MVP

Semua fungsi inti tersedia di berkas proyek, tanpa placeholder “implementasikan di sini”. Titik masuk utama: `src/App.tsx`, `src/hooks/useGameController.ts`, `src/services/demoBackend.ts`, `src/services/onlineBackend.ts`, `src/scene/World.tsx`, dan `functions/src/index.ts`.

## 7. Data soal dan status verifikasi

Bank demo terdiri dari `src/data/questions.demo.json` (100 soal awal Aa Hendra) dan `src/data/questions.additional.json` (100 soal tambahan). Dari 200 soal, 80 soal regulasi awal berstatus `verified`; 20 soal etika awal dan seluruh 100 soal tambahan masih `draft`. Semua soal tetap nonkompetisi sampai persetujuan editorial akhir. Proses dan daftar koreksi dijelaskan di [docs/QUESTION_EDITORIAL.md](docs/QUESTION_EDITORIAL.md) dan [docs/QUESTION_REVIEW_2026-10-30.md](docs/QUESTION_REVIEW_2026-10-30.md).

Seratus soal tambahan memiliki sumber dan satu kunci, tetapi sengaja berstatus `draft` agar tidak dianggap telah disahkan. Generator tervalidasi tersedia di `scripts/build-additional-questions.mjs`; administrator harus menonaktifkan atau memperbaiki butir yang berubah sebelum kompetisi.

Bank Level B dan C hanya berada di server Supabase agar kunci jawaban tidak masuk repository publik. Level C berisi 300 soal draft: soal 1–100 berasal dari modul awal, soal 101–200 dari modul advanced edisi RC-02 tanggal 19 Oktober 2026, dan soal 201–300 merupakan Paket 3 yang dikembangkan berdasarkan cakupan dua paket sebelumnya. Seluruh butir lolos validasi struktur; Paket 1–2 juga telah dicocokkan dengan lampiran kunci. Paket 3 tetap memerlukan reviu substantif sebelum dapat dianggap terverifikasi.

## 8. Konfigurasi environment

Repositori publik ini tidak menyertakan berkas `.env` dalam bentuk apa pun. Buat `.env.local` dan `functions/.env.<project-id>` hanya pada komputer atau secret manager yang berwenang. Nama variabel Firebase frontend dijelaskan pada konfigurasi `src/services/firebaseClient.ts`; flag backend yang digunakan antara lain `ALLOW_DRAFT_QUESTIONS` dan `ENFORCE_APP_CHECK`.

Untuk produksi, jangan simpan credential Admin SDK di repository. Frontend Firebase config bukan secret, tetapi tetap pisahkan per environment. App Check direkomendasikan sebelum membuka kompetisi publik.

## 9. Instalasi dan menjalankan

### Demo lokal

```bash
npm install
npm run dev
```

Buka `http://127.0.0.1:5173`. Tanpa Firebase config, aplikasi otomatis memakai demo lokal dan menyimpan sesi/leaderboard di `localStorage`.

### Firebase Emulator Suite

```bash
npm install
npm --prefix functions install
npm run bank:build
ALLOW_DRAFT_QUESTIONS=true npm run emulators
```

`bank:build` menggabungkan 100 soal awal yang sudah dinormalisasi di `src/data/questions.demo.json` dengan 100 soal tambahan menjadi `functions/data/questions.private.json` berisi 200 soal. Berkas keluaran server tetap masuk `.gitignore` dan tidak boleh di-commit.

Pada terminal kedua, setelah Firestore emulator aktif:

```bash
FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 GCLOUD_PROJECT=demo-puncak-kemenangan npm --prefix functions run seed
```

Isi `.env.local` dengan `VITE_GAME_MODE=online`, `VITE_USE_FIREBASE_EMULATORS=true`, `VITE_FIREBASE_PROJECT_ID=demo-puncak-kemenangan`, dan nilai dummy nonkosong untuk field config Firebase lain; lalu jalankan `npm run dev`.

### Mode online produksi

1. Buat/siapkan project Firebase; aktifkan Anonymous Authentication, Firestore, Functions, Hosting, dan App Check.
2. Verifikasi soal. Rotasi produksi memerlukan sedikitnya 200 dokumen `verified + competitionEligible`.
3. Isi `.firebaserc`, `.env.local`, serta `functions/.env.<project-id>` (`ALLOW_DRAFT_QUESTIONS=false`, `ENFORCE_APP_CHECK=true`).
4. Seed bank dengan kredensial administrator yang sah: `GCLOUD_PROJECT=<id> npm --prefix functions run seed`.
5. Jalankan emulator dan tes sebelum deployment.

## 10. Deployment dan iframe responsif

Firebase deployment:

```bash
npm run test
npm run functions:test
npm run deploy:firebase
```

Penyematan website:

```html
<div style="position:relative;width:100%;min-height:760px;aspect-ratio:16/10">
  <iframe
    src="https://DOMAIN-GAME-ANDA/"
    title="Menaiki Tangga Puncak Kemenangan Konsultan Pajak"
    style="position:absolute;inset:0;width:100%;height:100%;border:0"
    loading="lazy"
    allow="fullscreen"
  ></iframe>
</div>
```

Uji kebijakan CSP/frame-ancestors domain induk sebelum publikasi.

## 11. Pengujian, keterbatasan, dan pekerjaan lanjutan

Perintah verifikasi:

```bash
npm run test
npm run build
npm run functions:test
npm run functions:build
```

Unit test mencakup +1 tangga, salah tetap/-1 nyawa, penguncian state, idempotensi request demo, gerbang 60, lanjutan hingga 100, klaim tanpa duplikasi, urutan leaderboard, integritas bank, rotasi dua paket Level A, dan rotasi tiga paket Level C tanpa irisan. Emulator diperlukan untuk menguji dua browser, Anonymous Auth, transaksi Firestore, timeout setelah refresh, serta Rules secara end-to-end.

Keterbatasan MVP: review bank belum merupakan pengesahan naskah ujian dan 120 soal masih draft (20 soal etika awal serta 100 soal tambahan); identitas rotasi bersifat anonim per perangkat dan nama sehingga penghapusan penyimpanan browser memulai identitas baru; perlindungan bot tidak absolut. Lanjutan yang disarankan: review editorial kedua untuk 100 soal tambahan, konsol editorial, test Rules Emulator, observabilitas, App Check enforcement, deteksi anomali, dan audit aksesibilitas dengan perangkat nyata.
