# Operasi SEO Harian hendrawanto.com

Tujuannya meningkatkan kesehatan teknis, kualitas hasil pencarian, dan keterlihatan organik secara bertahap. Jangan mengubah situs hanya agar terlihat sering diperbarui.

Ikuti `COLLABORATION.md` karena situs ini dikelola bersama Claude dan ChatGPT. Ambil `main` terbaru dan baca commit baru sebelum mengerjakan audit, lalu periksa lagi tepat sebelum menerbitkan. Jika ada perubahan bersamaan, tinjau dan pertahankan; jangan force push atau menimpa pekerjaan yang belum ditinjau.

## Urutan kerja setiap hari

1. Tarik `main` terbaru dan baca `LAPORAN_KERJA_BERSAMA.md`, commit setelah laporan tersebut, serta entri terakhir `SEO_DAILY_LOG.md`.
2. Jalankan `node scripts/seo-audit.mjs --live`.
3. Periksa `robots.txt`, sitemap, canonical, hreflang, robots meta, JSON-LD, tautan internal, judul dan H1, serta status deployment GitHub Pages.
4. Amati hasil pencarian publik untuk kueri merek dan sasaran: `Hendrawanto akuntan publik`, `akuntan publik Tangerang`, `jasa audit laporan keuangan Tangerang`, `akuntan forensik kerugian keuangan negara`, dan `ahli akuntansi keterangan ahli persidangan`.
5. Jika akses Search Console tersedia, catat klik, impresi, CTR, posisi rata-rata, halaman terindeks, dan masalah validasi. Jika tidak, tulis `tidak tersedia`; jangan membuat estimasi.
6. Terapkan hanya perubahan aman dan berbasis bukti. Uji lokal dan situs publik setelah deployment.
7. Tambahkan laporan bertanggal ke `SEO_DAILY_LOG.md`: baseline versus kini, perubahan, commit, verifikasi, hambatan, tindakan berikutnya. Tambahkan ringkasan tugas pada `LAPORAN_KERJA_BERSAMA.md` dan bedakan pekerjaan ChatGPT, Claude, serta pelaksana yang belum terverifikasi.

## Batas perubahan otomatis

- Jangan membuat konten tipis, isian kata kunci, tautan buatan, atau halaman massal.
- Jangan mengubah gelar, izin, pengalaman, nama klien, angka, klaim hukum/profesional, atau informasi rahasia tanpa bukti.
- Jangan mengubah fungsi formulir, aplikasi, atau URL publik tanpa pengujian.
- Pertahankan kesetaraan bahasa Indonesia–Inggris.
- Jika tidak ada perbaikan layak, laporkan audit tanpa memaksa commit.

Peringkat tidak dijanjikan naik tiap hari: crawling, indexing, persaingan, dan evaluasi mesin pencari berada di luar kendali situs.
