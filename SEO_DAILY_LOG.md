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

## 2026-10-05 09:47 WIB — Audit live setelah proses dilanjutkan

- Pelaksana: ChatGPT/Codex; base main `e1ac691a95df1c55862db3def6ec4108d2e3b6c2`.
- Audit ini dikerjakan dalam sesi permintaan melanjutkan proses; bukan klaim otomasi harian telah mengeksekusinya. Laporan tanggal 5 Oktober sebelumnya belum tersedia pada main.

### Baseline versus pemeriksaan baru

| Metrik | Baseline 4 Oktober | 5 Oktober, pemeriksaan baru |
| --- | --- | --- |
| URL sitemap | 36 | 38; bertambah halaman privasi Indonesia/Inggris |
| URL sehat live | 36/36 HTTP 200 | 38/38 HTTP 200; URL akhir sesuai |
| Kesalahan struktural pemeriksa | 0 | 0 |
| Catatan editorial judul/deskripsi | 45 | 45; belum diubah tanpa bukti kueri/CTR |
| Klik, impresi, CTR, posisi, jumlah terindeks resmi | Tidak tersedia | Tidak tersedia |
| Kunjungan agregat publik | Belum dipasang | 2, mulai 5 Oktober; snapshot 09:38 WIB |

- `node scripts/seo-audit.mjs --live` lulus pada main terbaru: 38 URL dan 50 HTML entry points. Canonical, alternatif bahasa, H1, robots meta, JSON-LD, dan tautan internal tidak menimbulkan kesalahan pada pemeriksa.
- Pemeriksaan HTTP terpisah selesai 09:42 WIB: 38/38 isi halaman live identik dengan hash blob main. robots.txt dan sitemap.xml merespons 200. Formulir operasional tetap mengikuti noindex dan pengecualian analitik.
- Analytics consent smoke test dan visits smoke test PASS. Pemeriksaan aset lokal pada 51 HTML: tidak ada aset hilang atau referensi nomor lama. Nomor publik 0877-9048-7353 / WhatsApp 6287790487353. Footer Indonesia Transparan tetap benar.
- Deployment terakhir [37252283159](https://github.com/Hendraw83/hendrawanto.com/actions/runs/37252283159) sukses. Fitur terdahulu tidak perlu diterbitkan ulang.

### Kunjungan dan proses berkala

- Snapshot sebelum penyegaran: 1 pada 08:29 WIB. API baca Hits memberi total 2 pada 09:38:46 WIB; dicatat pada branch data melalui [29b470c](https://github.com/Hendraw83/hendrawanto.com/commit/29b470c578dccc51f6a81bbd3bec17bd097bfeb1).
- Selisih terhadap snapshot sebelumnya pada hari yang sama: +1. Selisih terhadap hari sebelumnya: **belum ada baseline**, sehingga belum dapat dihitung.
- Total termasuk satu kunjungan uji sebelumnya. Ini kunjungan dengan izin statistik, bukan orang unik, orang online, atau metrik GA4. Tidak ada data lokasi yang dapat dilaporkan.
- Browser live menunjukkan 2 dan waktu cache 09.38 WIB. Verifikasi dengan Tolak memperlihatkan 0 Google tag / 0 pixel Hits; pemeriksaan ini tidak menambah hit.
- Workflow cache berstatus active dan run push sebelumnya success; belum ada eksekusi schedule yang terlihat pada pemeriksaan terbaru. Penyegaran kali ini manual. Jadwal GitHub sekitar 30 menit belum terbukti mengeksekusi run berkala; pantau timestamp/run berikutnya, dan jangan menganggap enabled sebagai bukti berjalan.
- Otomasi laporan SEO harian tetap enabled, ID dipertahankan. DTSTART jadwal berikutnya 6 Oktober 2026 sekitar 08.00 WIB, Asia/Jakarta, berulang harian. Metadata pelaksanaan otomatis belum tersedia.

### Sampel hasil pencarian publik

- Diperiksa kueri `Hendrawanto akuntan publik`, `akuntan publik Tangerang`, `jasa audit laporan keuangan Tangerang`, `akuntan forensik kerugian keuangan negara`, dan `ahli akuntansi keterangan ahli persidangan`, dengan pemeriksaan tambahan domain tepat.
- Pencarian domain/merek menemukan beranda ID/EN, profil, galeri, artikel, dan layanan. Sampel empat kueri non-merek yang tersedia belum memperlihatkan domain; ini pengamatan terbatas, bukan ranking Google yang diukur atau bukti situs tidak terindeks.
- Cuplikan beranda/artikel yang dicrawl sebelumnya masih memuat nomor atau footer lama. Halaman live identik dengan versi terbaru; tunggu crawling dan periksa data resmi bila akses tersedia.
- Google Search Central menjelaskan perubahan dapat membutuhkan waktu untuk tampak pada hasil; [panduan SEO resmi](https://developers.google.com/search/docs/fundamentals/seo-starter-guide). Peningkatan URL sehat tidak sama dengan kenaikan trafik/peringkat.

### Perubahan dan tindak lanjut

- Penyegaran satu JSON agregat di branch data, serta entri pada `SEO_DAILY_LOG.md` dan `LAPORAN_KERJA_BERSAMA.md` di main. Tidak ada perubahan runtime/editorial baru berdasarkan audit tanpa kesalahan ini. Lihat riwayat berkas untuk commit dokumentasi sesi ini.
- Pantau cron cache, pertahankan kualitas konten dan versi ID/EN, serta gunakan metrik Search Console untuk menentukan prioritas judul/deskripsi berikutnya. Jangan mengganti tanggal metadata demi aktivitas semu.
- Status hardening keamanan terdahulu belum disimpulkan selesai; temuan verifikasi sumber dibukukan pada laporan bersama, untuk ditinjau selektif tanpa menimpa karya Claude.

## 2026-10-04 — Claude — Data Search Console (ditambahkan 5 Oktober 13:10 WIB)

- Pelaksana: Claude, melalui Search Console di Chrome Aa Hendra (properti URL-prefix `https://hendrawanto.com/`). Data dibaca 4 Okt 2026 sekitar 07.00–08.40 WIB.
- Laporan Performa dan Pengindeksan halaman: masih "Memproses data, harap periksa kembali setelah sekitar satu hari". Klik, impresi, CTR, posisi: belum tersedia dari Search Console.
- Penyempurnaan: Breadcrumb 7 valid / 0 tidak valid; Halaman profil 1 valid / 0 tidak valid.
- Sitemap: status Sukses (pembacaan Claude 2 Okt: 36 halaman ditemukan).
- Inspeksi URL (4 Okt): terindeks — `/`, `/artikel/`, `/layanan/audit-laporan-keuangan/`, `/layanan/audit-investigatif-kerugian-negara/`, `/layanan/keterangan-ahli/`. Belum terindeks ("Ditemukan - saat ini tidak diindeks") — `/layanan/`, `/tentang/`, `/galeri/`. Artikel baru `/artikel/perubahan-pajak-digital-oktober-2026/`: "URL tidak dikenal oleh Google".
- Tindakan: pengindeksan diminta untuk `/` (indeks ulang), `/layanan/`, `/tentang/`, `/galeri/`, dan artikel pajak ID. Artikel EN belum diminta (Chrome tidak merespons); dijadwalkan pada pemeriksaan Claude berikutnya.
- Batas: inspeksi URL adalah status per halaman saat dibaca, bukan jumlah halaman terindeks keseluruhan. Permintaan pengindeksan tidak menjamin indeks atau peringkat.

## 2026-10-05 — Claude — Search Console (dibaca 13.20–13.27 WIB)

- Pelaksana: Claude, melalui Search Console di Chrome Aa Hendra (properti URL-prefix `https://hendrawanto.com/`). Base main: `5e048d4`.
- **Performa (pertama kali tersedia)**, filter 7 hari, data yang sudah diproses Google baru sampai 2 Okt 2026: 4 klik, 6 tayangan, CTR 66,7%, posisi rata-rata 1. Tabel kueri/halaman: "Tidak ada data" (volume terlalu kecil/dianonimkan). Baseline 4 Okt: tidak tersedia.
- Laporan Pengindeksan halaman: masih "Memproses data". Jumlah terindeks keseluruhan belum tersedia.
- Penyempurnaan: Breadcrumb 17 valid / 0 tidak valid (4 Okt: 7); Halaman profil 4 valid / 0 tidak valid (4 Okt: 1).
- Inspeksi URL (5 Okt): terindeks — `/layanan/`, `/tentang/`, `/galeri/` (ketiganya 4 Okt "Ditemukan - saat ini tidak diindeks"), `/artikel/perubahan-pajak-digital-oktober-2026/` (4 Okt "URL tidak dikenal"), `/en/`, `/tools/imbalan-kerja/`. Belum terindeks — `/en/artikel/perubahan-pajak-digital-oktober-2026/` ("Ditemukan - saat ini tidak diindeks"; **pengindeksan diminta**), `/privasi/` ("URL tidak dikenal oleh Google"; halaman baru, belum diminta).
- Catatan: `/tools/` tidak memiliki index.html (bukan halaman); permintaan indeks Claude ditolak karena itu. Tidak ada tautan internal ke `/tools/`, jadi tidak ada tindakan.
- Batas: inspeksi = status per URL saat dibaca; angka performa sangat kecil dan belum mewakili tren.
