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
