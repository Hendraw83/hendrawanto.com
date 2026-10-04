# Laporan SEO Harian hendrawanto.com

## 2026-10-04 — Baseline dan perbaikan awal

### Kondisi awal

- Search Console telah terverifikasi.
- Sitemap terbaru memuat 36 URL. Pemeriksaan live tercatat di bagian verifikasi di bawah.
- `robots.txt`, HTTPS, pengalihan `www` ke domain utama, canonical, dan halaman dua bahasa tersedia.
- Pencarian publik untuk nama/merek telah menemukan beranda dan beberapa halaman dalam situs.
- Dalam sampel hasil publik yang diperiksa, situs belum terlihat untuk empat kueri non-merek utama. Ini observasi sampel, bukan data posisi resmi.
- Klik, impresi, CTR, posisi rata-rata, dan jumlah URL terindeks dari Search Console: tidak tersedia pada akses saat ini.

### Temuan dan perubahan

- Search Console melaporkan `ProfilePage.dateModified` tidak valid karena hanya berisi tanggal. Diubah ke ISO 8601 lengkap dengan zona waktu pada beranda Indonesia dan Inggris.
- `/newclient/` merupakan pembungkus formulir operasional; ditambahkan `noindex, nofollow, noarchive` agar bukan hasil pencarian.
- Deskripsi meta galeri Inggris yang menduplikasi deskripsi profil diganti dengan ringkasan khusus galeri.
- Dua halaman alat berstatus `noindex` sempat tercantum di sitemap dan proposal tidak memiliki H1; keduanya sudah diperbaiki dalam commit lain hari ini.
- Ditambahkan pemeriksa SEO yang dapat diulang dan aturan operasi harian.

### Verifikasi

- Audit lokal dan live: 36/36 URL sitemap merespons HTTP 200; 0 kesalahan struktural terdeteksi pada 48 berkas HTML. Ada 45 catatan editorial panjang judul/deskripsi untuk ditinjau berdasarkan data kueri/CTR, bukan kesalahan indexing.
- Commit publikasi: commit yang memuat entri laporan ini; lihat riwayat `main` untuk SHA.
- Validasi ulang Search Console bergantung pada crawling Google; perbaikan markup tidak sama dengan kenaikan peringkat langsung.
