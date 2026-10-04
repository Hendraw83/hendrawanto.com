# Operasi SEO Harian hendrawanto.com

Tujuannya meningkatkan kesehatan teknis, kualitas hasil pencarian, dan keterlihatan organik secara bertahap. Jangan mengubah situs hanya agar terlihat sering diperbarui.

## Urutan kerja setiap hari

1. Tarik `main` terbaru dan baca entri terakhir `SEO_DAILY_LOG.md`.
2. Jalankan `node scripts/seo-audit.mjs --live`.
3. Periksa `robots.txt`, sitemap, canonical, hreflang, robots meta, JSON-LD, tautan internal, judul dan H1, serta status deployment GitHub Pages.
4. Amati hasil pencarian publik untuk kueri merek dan sasaran: `Hendrawanto akuntan publik`, `akuntan publik Tangerang`, `jasa audit laporan keuangan Tangerang`, `akuntan forensik kerugian keuangan negara`, dan `ahli akuntansi keterangan ahli persidangan`.
5. Jika akses Search Console tersedia, catat klik, impresi, CTR, posisi rata-rata, halaman terindeks, dan masalah validasi. Jika tidak, tulis `tidak tersedia`; jangan membuat estimasi.
6. Terapkan hanya perubahan aman dan berbasis bukti. Uji lokal dan situs publik setelah deployment.
7. Tambahkan laporan bertanggal ke `SEO_DAILY_LOG.md`: baseline versus kini, perubahan, commit, verifikasi, hambatan, tindakan berikutnya.

## Batas perubahan otomatis

- Jangan membuat konten tipis, isian kata kunci, tautan buatan, atau halaman massal.
- Jangan mengubah gelar, izin, pengalaman, nama klien, angka, klaim hukum/profesional, atau informasi rahasia tanpa bukti.
- Jangan mengubah fungsi formulir, aplikasi, atau URL publik tanpa pengujian.
- Pertahankan kesetaraan bahasa Indonesia–Inggris.
- Jika tidak ada perbaikan layak, laporkan audit tanpa memaksa commit.

Peringkat tidak dijanjikan naik tiap hari: crawling, indexing, persaingan, dan evaluasi mesin pencari berada di luar kendali situs.
