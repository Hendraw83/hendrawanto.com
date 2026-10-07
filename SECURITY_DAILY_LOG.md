# Catatan keamanan harian hendrawanto.com

Gunakan bukti pemeriksaan baru, tanggal WIB, dan main yang diperiksa. Pertahankan entri lama; nyatakan tidak diperiksa bila akses tidak tersedia. Catatan serah terima tetap ada di `LAPORAN_KERJA_BERSAMA.md`.

## 5 Oktober 2026 — Baseline dan penyiapan perbaikan

- Pelaksana: ChatGPT/Codex; base main `2804caa5139f3c8faf7c711a014a25d68813d252`.
- Sumber: 218 blob baseline dibanding dengan hash Git; video latar PR #4 dan laporan terakhir dipertahankan. Snapshot keamanan sebelum video tidak diterapkan sebagai pengganti halaman terbaru.
- Bukti live sebelum perbaikan: home ID, home EN dan `/newclient/` memberi HTTP 200 melalui GitHub.com; HTTP home dialihkan ke HTTPS. Header CSP, HSTS, nosniff, Referrer-Policy, frame controls dan Permissions-Policy tidak terlihat pada sampel. Baseline sumber memiliki 0 CSP meta dan 0 SRI.
- Temuan yang ditangani: CSP dengan hash inline dan daftar sumber sesuai halaman; SRI semua include JS/CSS lokal statis; referrer meta dan iframe no-referrer; pemuat SheetJS 0.18.5 yang tidak digunakan dilepas dari dua demo; retry handler aplikasi memakai listener JS; cache dan intersepsi kedua service worker dibatasi pada aplikasinya.
- Uji lokal: 50 halaman berstruktur, 0 error pada audit keamanan; 2 catatan batas cakupan. Smoke test isolasi cache, Analytics, penghitung, dan video PASS. SEO lokal 38 URL sitemap, 0 error dan 45 catatan editorial lama; bukan audit HTTP live. Generator kebijakan idempoten.
- Otomasi percakapan: Keamanan Harian Hendrawanto enabled, mulai 6 Oktober sekitar 08.00 WIB, Asia/Jakarta. Jadwal belum berarti run sudah terlaksana. Workflow repo disiapkan untuk PR/push/schedule tanpa hak tulis ke main.
- Status saat entri dibuat: **disiapkan**; status final akan ditambah setelah PR, CI, deployment dan pemeriksaan live benar-benar tersedia.
- Terbuka: header server/anti-framing, otorisasi backend/MFA/WAF dan sejarah Git; CDN PDF beserta advisori/versinya; uji visual/fungsional browser atas kebijakan baru belum dilaksanakan. Rincian, cakupan dan sumber primer di `SECURITY_OPERATIONS.md`.

## 2026-10-05 12:51 WIB — Perbaikan terbit dan pemeriksaan live selesai

- Pelaksana: ChatGPT/Codex. Entri ini melengkapi status **disiapkan** sebelumnya; cakupan dan batas perlindungan tetap mengikuti `SECURITY_OPERATIONS.md`.
- Perubahan kode telah **masuk main, deployment berhasil, dan terverifikasi live**: [PR #6](https://github.com/Hendraw83/hendrawanto.com/pull/6), commit sumber `0b76a1e519f1469635123e465fd76551332bc583`, merge/main yang diperiksa `83abbd672793f7d4bbb9790ed891130e7da39988`.
- Bukti CI: [PR checks](https://github.com/Hendraw83/hendrawanto.com/actions/runs/37267817808) dan [push checks](https://github.com/Hendraw83/hendrawanto.com/actions/runs/37267928574) selesai `success`; [Pages build and deployment](https://github.com/Hendraw83/hendrawanto.com/actions/runs/37267928270) pada main tersebut juga `success`.
- Attestasi sumber sebelum merge: 224 blob cocok dengan byte lokal yang diperiksa; 165 blob baseline tidak berubah; 6 berkas baru dan tidak ada penghapusan. Isi body halaman serta video latar versi terbaru dipertahankan.
- Pemeriksaan baru `node scripts/security-audit.mjs --live`: **50 halaman HTML, 0 error, 7 warning**. Pemeriksa membandingkan CSP yang dilayani dan byte aset terhadap SRI pada halaman live, memeriksa respons HTTPS serta redirect HTTP. Lima warning mencatat absennya HSTS, CSP HTTP, nosniff, X-Frame-Options, dan Permissions-Policy; dua lainnya mencatat tinjauan pustaka PDF serta batas backend/akun/sejarah Git. Angka ini hanya hasil pemeriksa tersebut, bukan jumlah seluruh kerentanan.
- Uji browser publik: home Indonesia dan Inggris menampilkan CSP/referrer baru; video siap dan sedang diputar tanpa error media. Pencarian artikel `kerugian` menampilkan 1 dari 4 artikel. Nomor telepon tetap tersedia. Dalam kondisi persetujuan statistik ditolak, pemuat Google tag berjumlah 0; penerimaan data GA4 tidak diperiksa. Log yang dibaca hanya menampilkan error metadata ekstensi browser, tanpa error situs/CSP pada sampel tersebut. Tidak mengirim formulir klien.
- Pemeriksaan khusus tanggal kedaluwarsa sertifikat/TLS belum berhasil karena koneksi inspeksi mengalami timeout; jangan mengisi umur sertifikat dengan perkiraan.
- Jadwal percakapan **Keamanan Harian Hendrawanto** dicek ulang: enabled dan terhubung ke percakapan keamanan ini, mulai 6 Oktober 2026 sekitar 08.00 WIB (fleksibel), Asia/Jakarta; belum ada run terjadwal yang selesai saat pemeriksaan. Workflow repo tetap read-only dan dijadwalkan 07.17 WIB; waktu eksekusi penyedia dapat tertunda.
- Prioritas lanjutan: header HTTP/anti-framing melalui kontrol hosting/edge yang benar-benar tersedia; advisori, kompatibilitas serta SRI/vendor pustaka PDF; otorisasi Apps Script dan akun/MFA, backup/restore, rahasia pada sejarah Git. Tidak ada perubahan DNS/hosting atau klaim kontrol tersebut telah aktif.

## 2026-10-05 13:45 WIB — Claude: pembaruan pustaka PDF demo dan audit pelengkap

- Pelaksana: Claude (melengkapi audit ChatGPT 12:51 WIB).
- Base main: `82c9fc4de01f6f5d5968406714ca9fbc708c95f2` (dimulai dari `a10a52d`).
- Temuan: `npm audit` atas pustaka yang dimuat demo — jsPDF 2.5.1 **critical** (≤4.2.0 terdampak: GHSA-pqxr-3g65-p328, GHSA-w532-jxjh-hjhj, GHSA-8mvj-3j78-4qmw, GHSA-95fx-jjr5-f39c, GHSA-vm32-vv63-w422, serta DOMPurify bawaan), jspdf-autotable 3.8.2 **high**, ExcelJS 4.4.0 moderate (via `uuid`).
- Perbaikan: jsPDF → 4.2.1, AutoTable → 5.0.8 pada `tools/imbalan-kerja/demo/` dan `tools/pajak-tangguhan/demo/`; SRI sha384 + `crossorigin="anonymous"` pada pemuat dinamis; `scripts/security-policy.mjs` diperbarui lalu `--apply` meregenerasi CSP (2 halaman berubah, hash skrip inline baru).
- Pengujian: `security-audit.mjs` 50 halaman 0 error; smoke test cache, analytics, visits, hero-video PASS. Uji Playwright lokal (byte pustaka = tarball npm, hash sama dengan cdnjs): PDF demo IK dan pajak tangguhan berhasil dibuat dengan versi lama dan baru, ukuran keluaran identik, tanpa error konsol/CSP.
- Audit pelengkap tanpa perubahan kode: sejarah Git (305 commit, semua branch) dipindai pola kunci API/token/private key/password — tidak ditemukan rahasia. `.git`, `.env`, backup tidak terlayani publik. Repo publik sehingga `AGENTS.md`, `CLAUDE.md`, laporan kerja dan log tetap dapat dibaca umum (bukan rahasia, tetapi mengungkap proses internal).
- Terbuka: header HTTP (HSTS, frame-ancestors/X-Frame-Options, nosniff) memerlukan edge/CDN di depan GitHub Pages; pengaturan akses deployment Apps Script ("Who has access") belum terverifikasi dari luar; ExcelJS; aplikasi anggota di Apps Script kemungkinan juga memuat jsPDF lama (di luar repo).

## 2026-10-06 12:00 WIB — Claude: pemeriksaan keamanan harian (diterbitkan 7 Okt)

- Pelaksana: Claude (tugas harian terjadwal). Entri ini tertunda karena Chrome Aa Hendra tidak terhubung pada 6 Okt.
- Base main: `ceebfb9`. Review ChatGPT: belum ada entri keamanan ChatGPT tanggal 6 Okt.
- Perubahan dan berkas: tidak ada perubahan kode.
- Pengujian dan bukti: `security-policy.mjs --apply` 54 halaman, 0 berubah; `security-audit.mjs` 0 error; smoke test cache/analytics/visits/hero-video PASS; Playwright lokal: PDF demo IK & pajak tangguhan berhasil (jsPDF 4.2.1). `npm audit`: jsPDF/AutoTable bersih; ExcelJS 4.4.0 moderate via `uuid` (tanpa versi perbaikan; jalur Excel di demo nonaktif dan tidak ada di CSP). Pindai rahasia 12 commit baru: bersih.
- Catatan: `search-stats.js` (kartu statistik khusus pemilik) bukan kontrol akses, sudah dinyatakan; data hanya agregat publik.
- Status publikasi: tidak ada deployment; uji live tidak dilakukan (Chrome offline).

## 2026-10-07 12:05 WIB — Claude: pemeriksaan keamanan harian

- Pelaksana: Claude (tugas harian terjadwal).
- Base main: `7af6186` (5 commit sejak `ceebfb9`, semuanya sesi Claude: artikel SA 600 ID/EN, log SEO/indeks).
- Review ChatGPT: belum ada entri keamanan ChatGPT tanggal 7 Okt; dicatat apa adanya.
- Perubahan dan berkas: tidak ada perubahan kode.
- Pengujian dan bukti: `security-policy.mjs --apply` 56 halaman, 0 berubah (dua artikel SA 600 baru sudah ber-CSP/SRI); `security-audit.mjs` 0 error, 2 warning standar; smoke test PASS; Playwright lokal: PDF demo IK & pajak tangguhan berhasil. Live di Chrome: kedua demo memuat jsPDF 4.2.1 + AutoTable 5.0.8 dengan SRI dan membuat PDF; beranda ID/EN dan artikel SA 600 menyajikan CSP; `/.git/config`, `/.env`, `/backup.zip`, `/package.json` = 404. `npm audit` tidak berubah (ExcelJS moderate, tidak dimuat). Pindai rahasia 5 commit baru: bersih; robots tidak berubah.
- Status publikasi: entri log saja.
- Keterbatasan atau pekerjaan terbuka (keputusan Aa Hendra): header HTTP via CDN/edge (perlu ubah nameserver), akses deployment Apps Script, 2FA akun GitHub/Google/Hostinger, repo publik.
- Tindak lanjut untuk ChatGPT: run keamanan pagi belum tercatat sejak 5 Okt — mohon lanjutkan dan catat di `SECURITY_DAILY_LOG.md` agar Claude dapat meninjaunya.
