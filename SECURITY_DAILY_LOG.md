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

## 2026-10-08 08:22 WIB — ChatGPT: audit keamanan main dan live, termasuk demo Aset Hak Guna

- Pelaksana: ChatGPT/Codex.
- Base main: `0b5a8d129beed31d039217e4bd1f7a47b871bb8e`; main dan laporan bersama dibaca ulang sebelum penyiapan commit. Perubahan Claude (artikel ID/EN, pengadilan, Tools Aset Hak Guna, template, IIFE dan mesin bulanan) dipertahankan; tidak diklaim sebagai pekerjaan ChatGPT.
- Perubahan dan berkas: tidak ada perubahan runtime. Catatan ini, serah terima di `LAPORAN_KERJA_BERSAMA.md`, dan catatan advisori tambahan di `SECURITY_OPERATIONS.md`. Commit hasil: lihat riwayat ketiga berkas pada entri tanggal ini.
- Pengujian baru: `security-audit.mjs` **61 HTML / 0 error / 2 warning**; `security-audit.mjs --live` **61 HTML / 0 error / 7 warning**. Live mencocokkan CSP meta dan SRI aset lokal dengan byte yang dilayani; pemeriksa tidak memvalidasi SRI CDN dinamis. Audit mencakup mixed content, iframe/referrer, form-action, tautan tab baru dan pola kredensial terbatas pada tree aktif; tidak memindai seluruh sejarah Git.
- Smoke test cache/security, analytics, visits dan hero-video semuanya PASS. SEO lokal: 48 URL sitemap / 61 HTML / 0 error / 47 warning editorial; tidak ada perubahan SEO.
- HTTPS beranda 200; HTTP beranda 301 menuju HTTPS kanonis. Inspeksi openssl tidak memperoleh sertifikat; penerbit dan kedaluwarsa TLS **belum dapat diverifikasi**, meski HTTPS berhasil pada fetch. Lima header server masih tidak terlihat: HSTS, CSP HTTP, nosniff, X-Frame-Options dan Permissions-Policy. CSP meta tidak menggantikan header atau anti-framing.
- Perbandingan: laporan Claude 7 Oktober memeriksa 56 halaman; kini 61, termasuk artikel/Tools baru. Tidak ada regresi yang ditemukan oleh pemeriksa. Tujuh warning live merupakan kategori pemeriksa, bukan jumlah seluruh celah.
- Tinjauan pustaka: demo memuat jsPDF 4.2.1 / AutoTable 5.0.8; advisori primer jsPDF GHSA-wfv2-pwc8-crg5 dan GHSA-7x6v-j9x4-qf24 menunjuk perbaikan 4.2.1. Tidak ada pembaruan runtime yang dipaksakan berdasarkan pencarian ini.
- **Temuan baru pada tinjauan, advisori sudah terbit Agustus 2026:** ExcelJS <=4.4.0 dilaporkan rentan kehabisan memori pada `Workbook.xlsx.load()` (GHSA-7cvf-3r55-r39q, high) dan prototype pollution pada `Note.model/deepMerge` (GHSA-qwr4-7h29-chpf, critical menurut penerbit). Sumber adalah pelapor/pengelola fork tidak resmi, bukan rilis perbaikan upstream; tidak menyatakan jalur aplikasi telah dieksploitasi. Catatan sebelumnya yang hanya menyebut uuid moderate tidak cukup untuk menilai impor XLSX.
- Demo Aset Hak Guna memiliki `DEMO=true`, input unggah disabled, handler unggah berhenti pada DEMO, ekspor XLSX menolak DEMO, dan CSP tidak mengizinkan URL ExcelJS. Risiko jalur impor publik tidak terbukti aktif. **Prioritas tinggi tindak lanjut versi lengkap Apps Script:** periksa penggunaan ExcelJS dan batas dekompresi sebelum menerima file klien; ukuran file terkompresi saja tidak cukup. Kode/backend Apps Script dan otorisasi tidak tersedia untuk audit ini, sehingga tidak diubah.
- Status versi sumber yang diaudit: [Website security checks](https://github.com/Hendraw83/hendrawanto.com/actions/runs/37710967159) success; [Pages deployment](https://github.com/Hendraw83/hendrawanto.com/actions/runs/37710966374) success; CSP/SRI **terverifikasi live** oleh audit. Commit dokumentasi tugas ini terpisah dari bukti deployment sumber; tidak mengklaim deployment dokumentasi sebelum selesai.
- Batas: tidak ada login/uji kirim formulir, pemindaian agresif, pengujian visual browser baru, pembacaan data klien/GA4 atau kontrol akses Apps Script/MFA/WAF. Gate statistik dan penghitung diuji lokal; tidak membuktikan event diterima GA4. Tidak mengubah DNS, autentikasi, branch visit-count-data maupun salinan Sites lama.
- Tindak lanjut: header server/anti-framing tetap terbuka; audit impor XLSX dan otorisasi versi lengkap Apps Script memerlukan kode deployment yang aktual. Jangan mengaktifkan ExcelJS pada demo dengan memperluas CSP hanya agar impor berjalan.
- Sumber primer: https://github.com/parallax/jsPDF/security/advisories/GHSA-wfv2-pwc8-crg5 ; https://github.com/parallax/jsPDF/security/advisories/GHSA-7x6v-j9x4-qf24 ; https://github.com/mateocallec/exceljs-hardened/security/advisories/GHSA-7cvf-3r55-r39q ; https://github.com/mateocallec/exceljs-hardened/security/advisories/GHSA-qwr4-7h29-chpf .

- Pemeriksaan pelengkap selesai sebelum commit: tiga hash SRI CDN yang dideklarasikan demo Aset Hak Guna cocok dengan byte cdnjs (jsPDF, AutoTable, ExcelJS; ExcelJS tetap tidak diizinkan CSP). Sampel `/.git/config`, `/.env`, `/backup.zip`, `/package.json` semuanya 404; ini bukan bukti tidak ada data publik pada URL lain.

## 2026-10-09 08:54 WIB — ChatGPT: audit harian dan penguatan tes regresi CDN/demo

- Pelaksana: ChatGPT/Codex.
- Base main: `6cffc03a5c4a45834cb710e4a9c926f887c5ecc5`. Dibanding audit ChatGPT 8 Oktober, terdapat 15 commit yang menambah artikel PSAK 118 ID/EN, memperbarui kartu/sitemap/llms, metadata artikel opini audit, data/laporan SEO, dan laporan akses aplikasi. Perubahan Claude dan pekerjaan SEO ChatGPT dipertahankan; tidak diklaim sebagai pekerjaan audit ini.
- Temuan live: HTTPS beranda 200 dan HTTP 301 ke HTTPS kanonis. Lima header server tetap absen: HSTS, CSP HTTP, nosniff, X-Frame-Options, dan Permissions-Policy. CSP meta bukan pengganti header/anti-framing. Sertifikat origin tidak dapat dibaca: koneksi terminal diintersepsi proxy lingkungan, sehingga tanggal sertifikat yang terlihat bukan bukti sertifikat produksi.
- Audit sumber sebelum perubahan: **63 HTML / 0 error / 2 warning**; live: **63 HTML / 0 error / 7 warning**. Naik dari 61 halaman pada 8 Oktober karena artikel baru, tanpa regresi yang ditemukan pemeriksa. Audit mencakup CSP meta, SRI aset lokal, mixed content, iframe/referrer, form-action, tautan tab baru, pola kredensial terbatas pada tree aktif, HTTPS/redirect dan header respons.
- Pengujian: cache/security, persetujuan Analytics, penghitung kunjungan, dan hero-video PASS. SEO pendamping 50 URL sitemap / 63 HTML / 0 error / 43 warning editorial. Lima URL sampel sensitif (`/.git/config`, `/.env`, `/backup.zip`, `/package.json`, `/.DS_Store`) memberi 404; ini bukan bukti semua kemungkinan URL aman.
- Pustaka: jsPDF 4.2.1 dan AutoTable 5.0.8 tetap dua script CDN yang diizinkan CSP; hash SHA-384 yang dipatok cocok dengan byte cdnjs pada pemeriksaan 9 Oktober. Tidak ditemukan advisori baru yang mengubah kesimpulan 8 Oktober. Referensi ExcelJS 4.4.0 masih ada dalam kode turunan tiga demo, tetapi URL tidak diizinkan CSP, input file disabled, dan jalur ekspor Excel mode demo dijaga. Risiko versi lengkap Apps Script tetap terbuka dan tidak dapat disimpulkan dari repo.
- Perbaikan: `scripts/security-audit.mjs` kini otomatis memverifikasi pasangan URL/SRI untuk pemuat CDN dinamis serta memastikan ExcelJS tetap diblokir CSP, upload workbook tetap disabled, dan guard ekspor Excel mode demo tetap ada. `SECURITY_OPERATIONS.md` diperbarui. Tidak ada perubahan HTML/runtime, desain, video, bahasa, Analytics, penghitung, formulir, DNS, autentikasi, atau branch `visit-count-data`.
- Uji setelah perubahan: audit sumber dan live tetap 63 HTML / 0 error; seluruh smoke test PASS; byte CDN jsPDF dan AutoTable SRI PASS. Uji mutasi sengaja mengubah hash CDN dan melepas atribut `disabled`; pemeriksa berhenti nonzero dan melaporkan kedua regresi. Workflow security pada base main [success](https://github.com/Hendraw83/hendrawanto.com/actions/runs/37870250531) dan Pages base main [success](https://github.com/Hendraw83/hendrawanto.com/actions/runs/37870250381). Run schedule terakhir yang terlihat adalah 8 Oktober; push checks terbaru memberi cakupan sumber tetapi langkah live terjadwal hari ini belum terlihat saat audit.
- Status publikasi: perubahan pemeriksa dan dokumentasi disiapkan dari base di atas; commit/CI/deployment final dicatat pada serah terima setelah publikasi. Verifikasi live keamanan dilakukan terhadap runtime base karena perubahan ini tidak mengubah runtime.
- Batas: tidak melakukan login, mengirim formulir, membaca GA4/data klien, brute force, audit seluruh sejarah Git, atau memeriksa otorisasi/MFA/WAF/backend Apps Script. Hasil bukan sertifikasi bebas celah.
- Prioritas terbuka: **tinggi** — audit aktual impor XLSX dan akses/otorisasi Apps Script versi lengkap; **menengah** — header server dan anti-framing melalui edge/hosting yang benar-benar dikendalikan; **operasional** — verifikasi MFA akun terkait dan backup/restore.
