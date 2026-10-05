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

## Penghitung kunjungan publik — mulai 5 Oktober 2026

Beranda Indonesia dan Inggris menampilkan kartu bergerak setelah tombol Minta Proposal. Angka merupakan **kunjungan tercatat dengan izin statistik**, bukan pengguna unik, jumlah orang online, atau angka historis dari GA4. Google tag dan ID pengukuran tetap dipertahankan; penghitung ini tidak memberi akses laporan atau lokasi GA4.

- `analytics.js` memuat `visits.js` pada host produksi dan halaman publik. Pixel Hits hanya dimuat setelah pilihan `allow`; pilihan Tolak, sebelum izin, preview, aplikasi operasional, dan demo tidak mengirim hit. URL pixel selalu `https://hits.sh/hendrawanto.com/visits-20261005.svg`, tanpa data formulir/URL halaman dan tanpa referrer.
- `hendrawanto.visit.activity.v1` menyimpan waktu aktivitas di localStorage setelah izin. Reload, perpindahan halaman/bahasa, dan tab pada browser yang sama dalam 30 menit tidak dimaksudkan sebagai kunjungan baru. Kunjungan baru dimulai setelah 30 menit tanpa aktivitas yang tercatat. Tidak ada pengenal orang; deduplikasi antartab bersifat upaya terbaik. Jika penyimpanan diblokir, batasnya satu hit per halaman. Penolakan/pencabutan izin menghapus waktu aktivitas.
- Layanan Hits menyimpan jumlah bersama. API baca `https://hits.sh/api/urns/hendrawanto.com/visits-20261005` tidak menambah hit. Penyedia menyatakan badge tidak menyimpan IP/cookie/user agent pada [kebijakan privasinya](https://hits.sh/privacy/); permintaan jaringan tetap mencapai servernya. Bot, permintaan langsung, kegagalan jaringan, pemblokir, dan pilihan pengunjung memengaruhi angka. Angka tidak bersifat audit orang yang terverifikasi.
- `.github/workflows/visit-count.yml` membaca API sekitar setiap 30 menit (menit 7 dan 37 UTC), ketika kode penghitung masuk main, atau melalui Run workflow. Jadwal GitHub dapat tertunda. Workflow memakai token bawaan GitHub Actions di server, tidak ada secret pada frontend.
- Cache berada pada **branch `visit-count-data`**, berkas `data/visit-count.json`. Branch ini terpisah dari main agar pembaruan angka tidak berbenturan dengan pekerjaan Claude/ChatGPT dan tidak menerbitkan ulang seluruh situs. Jangan merge branch data ke main. Widget membaca JSON dari raw.githubusercontent.com; permintaan ini tidak meningkatkan penghitung. Salinan main pada URL situs dipakai hanya sebagai fallback dan waktu salinannya tetap ditampilkan.
- `scripts/update-visit-count.mjs` hanya menulis JSON agregat pada branch data memakai SHA berkas terakhir (tanpa force). Gangguan API, angka yang berkurang, atau benturan penulis menghentikan pembaruan dan mempertahankan salinan lama. Metadata JSON menyebut waktu, pelaksana otomatis, dan URL workflow sebagai bukti tiap pembaruan.
- Animasi angka berhenti tepat pada nilai cache yang sah. Lingkaran bergerak merupakan dekorasi, bukan indikator orang online. `prefers-reduced-motion` menghentikan gerakan. Saat seluruh sumber gagal, kartu menampilkan “belum tersedia”; tidak membuat angka nol atau tambahan fiktif.

Uji tambahan: `node scripts/visits-smoke-test.cjs`. Laporan harian harus membaca cache branch data dan menyebut waktu pembaruan, batas pencatatan, serta selisih terhadap laporan hari sebelumnya jika baseline tersedia. Jangan menyamakannya dengan metrik pengguna/sesi/tayangan GA4 atau mengisi lokasi yang tidak tersedia.
