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
