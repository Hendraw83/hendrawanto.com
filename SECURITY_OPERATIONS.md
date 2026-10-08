# Pemeriksaan dan perbaikan keamanan hendrawanto.com

Sumber produksi: `Hendraw83/hendrawanto.com`, branch `main`, GitHub Pages. Baca `AGENTS.md`, `COLLABORATION.md`, dan entri terakhir `LAPORAN_KERJA_BERSAMA.md` sebelum bekerja. Jangan menerbitkan salinan Sites lama atau snapshot sebelum video latar. Perubahan luas memakai branch/PR; periksa main dan laporan lagi sebelum publikasi, pertahankan pekerjaan kedua pengelola, dan jangan force push.

## Pemeriksaan harian

1. Ambil main terbaru, tinjau commit sejak laporan terakhir, dan baca `SECURITY_DAILY_LOG.md`.
2. Jalankan `node scripts/security-audit.mjs` dan `node scripts/security-smoke-test.cjs`. Pemeriksa meliputi 50 halaman HTML berstruktur pada baseline 5 Oktober 2026; respons verifikasi Google dipertahankan persis dan tidak diberi markup tambahan. Cakupan mengikuti halaman yang ada, bukan angka yang dipaksakan tetap 50.
3. Jalankan `node scripts/security-audit.mjs --live` untuk HTTP halaman, CSP aktual, SRI dibanding byte aset yang benar-benar dilayani, redirect HTTP, dan keberadaan header server. TLS/HTTPS yang berhasil dalam fetch memvalidasi koneksi saat itu; umur sertifikat harus dibaca terpisah sebelum melaporkan tanggal kedaluwarsa.
4. Periksa workflow `Website security checks`, status deployment, dan advisori resmi terbaru untuk pustaka yang benar-benar dimuat. Perubahan kode dapat mendahului deployment; jangan menganggap temuan versi live lama sebagai pekerjaan baru yang sudah terbit.
5. Terapkan perbaikan berbasis bukti yang teruji; jangan membuat commit runtime tanpa alasan. Uji kembali Analytics, penghitung dan video bila menyentuh halaman/asset bersama. Gunakan `scripts/analytics-smoke-test.cjs`, `scripts/visits-smoke-test.cjs`, `scripts/hero-video-smoke-test.cjs`, serta `scripts/seo-audit.mjs` sesuai dampak.
6. Tambahkan laporan bertanggal WIB ke `SECURITY_DAILY_LOG.md` dan laporan serah terima ke `LAPORAN_KERJA_BERSAMA.md`, termasuk audit tanpa perubahan kode. Bedakan persiapan, main, deployment berhasil, dan verifikasi live. Laporkan bukti, keterbatasan, prioritas dan tindak lanjut; jangan mengungkap token/data klien atau nilai temuan rahasia.

Otomasi percakapan **Keamanan Harian Hendrawanto** dimulai 6 Oktober 2026 sekitar 08.00 WIB (jadwal fleksibel), pada percakapan keamanan yang diminta Aa Hendra. Workflow repo melakukan audit sumber pada PR/push main, dan pemeriksaan live dijadwalkan pukul 00:17 UTC / 07:17 WIB. Jadwal GitHub dapat tertunda. Workflow hanya membaca repo, tidak mengubah main, dan checkout tidak menyimpan kredensial tulis. Status enabled/konfigurasi jadwal bukan bukti suatu run sudah selesai.

## Perlindungan yang diterapkan pada sumber

- CSP meta ditempatkan sebelum pemuat script/styles. Sumber script dibatasi ke origin sendiri, hash script inline yang diperiksa, Google tag pada halaman publik berizin statistik, dan dua URL pustaka PDF yang spesifik pada demo. Script inline tanpa hash, event handler pada atribut HTML, `eval` dan objek/plugin tidak diizinkan. `base-uri 'none'` dan `form-action 'self'` berlaku.
- SRI SHA-384 untuk script dan stylesheet lokal yang dimuat statis; browser membandingkan byte aset dengan hash sebelum memakai aset. Perubahan aset oleh pengelola lain harus diikuti pembaruan hash halaman yang merujuknya.
- Referrer policy pada semua halaman berstruktur; iframe tidak mengirim URL induk sebagai referrer. CSP membatasi tujuan iframe sesuai kebutuhan YouTube dan Apps Script yang sudah ada.
- SheetJS **0.18.5** yang tidak diperlukan dilepas dari kedua demo. Upload Excel serta ekspor Excel demo sudah dinonaktifkan pada sumber sebelumnya; penghapusan pemuat tidak mengubah fitur yang disediakan. Kode parser lama yang tidak dijalankan bukan alasan memasang kembali versi rentan. Bila fitur import Excel nanti dibuka, gunakan versi yang telah diperiksa dan uji kompatibilitas/file berbahaya terlebih dahulu. Backend aplikasi lengkap di Apps Script tidak diubah.
- Dua service worker dibatasi pada folder aplikasinya, memakai namespace cache terpisah, tidak menghapus cache aplikasi lain, dan fallback offline hanya membaca cache sendiri. Cache lama tanpa namespace tidak dihapus massal agar tidak merusak aplikasi lain.

`node scripts/security-policy.mjs --apply` menyusun CSP dan SRI dari sumber yang ada. Jalankan hanya setelah meninjau perubahan; pembaruan hash otomatis bukan bukti bahwa kode baru aman. Jangan memakai generator sebagai persetujuan otomatis bagi script dari pihak lain. Pemeriksa audit tidak mengubah halaman.

## Batas dan pekerjaan yang tetap terbuka

- CSP meta tidak menjadi header HTTP dan **tidak menyediakan `frame-ancestors`/X-Frame-Options**. Header HSTS, CSP server, nosniff, frame controls, dan Permissions-Policy belum tersedia pada respons publik baseline. Menambah file `_headers` atau meta dengan nama tersebut tidak memasang header pada GitHub Pages. Tindak lanjut memerlukan kontrol penyedia/edge yang terverifikasi; tidak ada perubahan DNS, perpindahan hosting, atau klaim WAF/MFA sudah aktif dalam paket ini.
- CSP gaya masih mengizinkan inline style untuk kompatibilitas tampilan/kalkulator. Script se-origin tetap dipercaya; kebijakan ini tidak menggantikan pembatasan akses repo, peninjauan kode, atau verifikasi setiap upload.
- Demo PDF memuat jsPDF 4.2.1 dan AutoTable 5.0.8 dari cdnjs (diperbarui Claude 5 Oktober 2026 dari 2.5.1/3.8.2 yang terkena advisori GHSA critical/high, a.l. GHSA-pqxr-3g65-p328 PDF injection/JS execution, GHSA-w532-jxjh-hjhj ReDoS, GHSA-8mvj-3j78-4qmw DoS). Pemuat dinamis kini memasang SRI sha384 + `crossorigin` yang dicocokkan dengan byte cdnjs dan tarball npm. ExcelJS 4.4.0 (dependensi `uuid` advisori moderate, tidak dipakai jalur demo PDF) belum diubah dan tetap perlu ditinjau. Saat menaikkan versi, perbarui `pdfLibraries`, `LIBS` dan `LIB_SRI` bersama-sama.
- Google tag ditambahkan dinamis dan dikelola penyedia; bukan file tetap untuk dipasangi SRI. CSP mengikuti dokumentasi GA tanpa fitur iklan. ID GA4, gate persetujuan, pengecualian aplikasi/demo, sumber penghitung dan branch data dipertahankan. Memuat tag bukan bukti event diterima GA4.
- Otorisasi server Apps Script, akses ke data kantor/klien, validasi/rate limiting backend, MFA akun, WAF, backup/restore, pemindaian malware dan rahasia di seluruh sejarah Git belum diverifikasi. Pemeriksaan ini bersifat pasif/static, bukan penetration test atau sertifikasi bebas celah.
- Gambar galeri yang dapat dilihat tetap dapat disalin secara teknis. PDF yang dilepas dari tree aktif dapat bertahan di sejarah repo publik; jangan menulis ulang riwayat tanpa keputusan terpisah dan jangan mengklaim telah dihapus dari semua salinan.

## Sumber primer

- MDN CSP: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy
- Batas frame-ancestors pada meta: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/frame-ancestors
- SRI: https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Subresource_Integrity
- Google tag/CSP: https://developers.google.com/tag-platform/security/guides/csp
- SheetJS prototype pollution (berlaku pada pembacaan file): https://github.com/advisories/GHSA-4r6h-8v6p-xvw6
- SheetJS ReDoS: https://github.com/advisories/GHSA-5pgg-2g8v-p4x9
- Distribusi resmi SheetJS: https://docs.sheetjs.com/docs/getting-started/installation/standalone/
- HTTPS GitHub Pages: https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https

## Tambahan tinjauan pustaka — 8 Oktober 2026

Catatan ExcelJS tidak boleh dibatasi pada advisori uuid moderate. Pelapor/pengelola fork tidak resmi menerbitkan [GHSA-7cvf-3r55-r39q](https://github.com/mateocallec/exceljs-hardened/security/advisories/GHSA-7cvf-3r55-r39q) (dekompresi XLSX tanpa batas, high) dan [GHSA-qwr4-7h29-chpf](https://github.com/mateocallec/exceljs-hardened/security/advisories/GHSA-qwr4-7h29-chpf) (Note.model/deepMerge prototype pollution, critical menurut penerbit), affected ExcelJS <=4.4.0, tanpa patched upstream pada advisori yang dibaca. Ini laporan primer pelapor, bukan rekomendasi otomatis berpindah ke fork.

Demo Aset Hak Guna pada main 0b5a8d1 memakai DEMO=true, unggah disabled/gated, ekspor XLSX menolak DEMO, dan URL ExcelJS tidak ada di CSP script-src. Kode impor versi lengkap di luar repo harus ditinjau terpisah: batasi dekompresi/isolasi sebelum Workbook.xlsx.load(), jangan hanya membatasi ukuran file terkompresi; jangan meneruskan objek JSON tak tervalidasi ke cell.note. Tidak ada bukti eksploitasi aplikasi lengkap dari audit pasif ini. Jangan memperluas CSP demo agar fitur Excel aktif tanpa tinjauan keamanan dan kompatibilitas.
