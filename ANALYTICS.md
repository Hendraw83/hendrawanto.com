# Statistik kunjungan hendrawanto.com

Integrasi GA4 menggunakan ID pengukuran `G-ZPRBG3X1JL` yang diberikan Aa Hendra pada 5 Oktober 2026. Akun/properti tetap milik Aa Hendra. Jangan mengganti ID tanpa instruksi pengelola, menambahkan tag kedua, atau memasang analitik pada aplikasi/formulir operasional.

## Cara kerja

- Halaman publik memuat satu `/analytics.js` dari `<head>`. Pemuat tersebut menjalankan satu Google tag setelah pengunjung memilih **Izinkan statistik**. Penolakan tidak memuat script Google dan tidak mengirim ping Analytics.
- Pilihan berlaku 180 hari dan dapat diubah melalui **Preferensi statistik** pada footer. Jika penyimpanan browser diblokir, pilihan hanya berlaku pada halaman yang sedang dibuka.
- URL halaman yang dikonfigurasi untuk Analytics tidak memuat query string atau fragmen. Referrer dibatasi ke origin. Fitur sinyal/periklanan Google dinonaktifkan. Cookie analitik memakai prefiks `he` dan masa berlaku maksimum 180 hari.
- Formulir klien, aplikasi kantor, redirect aplikasi, halaman verifikasi Google, dan demo kalkulator tidak memuat pemuat analitik. Guard pada pemuat juga menolak route operasional/demo jika script tidak sengaja ditambahkan.
- Pencatatan lanjutan dihentikan sebelum input/submission formulir atau klik tautan berparameter pesan/pribadi. Kode ini tidak mengirim isian formulir.
- Hanya host produksi `hendrawanto.com` dan `www.hendrawanto.com` yang dapat memuat Google tag. Preview lokal tidak mengirim statistik.

## Pengaturan dan verifikasi milik pengelola

Uji lokal tanpa jaringan: `node scripts/analytics-smoke-test.cjs`. Jalankan juga `node scripts/seo-audit.mjs` sebelum menerbitkan.

Untuk membatasi laporan pada statistik dasar, matikan **Enhanced measurement / Pengukuran yang ditingkatkan** pada aliran data Web di Admin GA4. Pengukuran otomatis opsional (scroll, outbound click, pencarian, form, video) dikendalikan oleh properti Google, bukan hanya kode situs. Periksa juga pengaturan retensi data di properti; kode situs tidak mengubahnya.

Setelah deployment, buka halaman publik, pilih **Izinkan statistik**, lalu periksa **Reports → Realtime** pada properti yang sesuai. Status `data-analytics-state="tag-loaded"` membuktikan script Google berhasil dimuat, bukan bukti bahwa laporan GA4 telah menerima/memproses event. Periksa ID, pemblokir browser, persetujuan, dan pilihan properti jika data belum terlihat.

Laporan harus mencantumkan tanggal mulai pencatatan dan zona waktu properti, membedakan pengguna, sesi, dan tayangan halaman, serta menyebutkan bahwa lokasi merupakan perkiraan. Pengunjung yang menolak atau memblokir analitik dan route operasional tidak tercatat. Kunjungan sebelum pemasangan tidak dapat direkonstruksi dari tag baru.

Jangan mengklaim jumlah pengunjung/lokasi sudah tersedia tanpa membaca GA4 atau ekspor data dari pengelola. ID pengukuran merupakan ID pemasangan publik dan tidak memberi akses membaca laporan. Akses dashboard Google Analytics belum diberikan kepada ChatGPT pada pemasangan awal.

## Referensi resmi

- https://developers.google.com/analytics/devguides/collection/ga4/reference/config
- https://developers.google.com/analytics/devguides/collection/ga4/views
- https://support.google.com/analytics/answer/9216061

Ikuti `COLLABORATION.md` untuk setiap perubahan bersama Claude dan ChatGPT.
