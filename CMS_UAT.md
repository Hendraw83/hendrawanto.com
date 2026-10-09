# Pemeriksaan fitur CMS — 9 Oktober 2026

Panel privat memakai database D1 dan gambar R2 yang sudah tersedia, serta login ChatGPT. Plugin Supabase tidak diperlukan. Pintu masuk situs utama: https://hendrawanto.com/admin/.

| Permintaan Aa Hendra | Implementasi dan bukti pemeriksaan | Batas bukti |
|---|---|---|
| Login khusus admin | Login ChatGPT dan daftar anggota; pengguna tanpa identitas ditolak 401, akun tanpa izin ditolak 403; hanya akun pemilik yang dikonfigurasi dapat aktivasi pertama | UAT memakai identitas simulasi di Worker terisolasi; login browser Aa belum terverifikasi |
| Tambah dan edit artikel | Pembuatan, simpan draft, penolakan slug ganda, dan nomor revisi untuk mencegah saling timpa | Operasi uji pada database terisolasi |
| Unggah gambar | JPG/PNG/WebP/GIF sampai 8 MB di R2 privat; pemeriksaan tipe, akses milik sendiri untuk Penulis; SVG/dokumen ditolak | Unggah uji pada bucket terisolasi; gambar artikel disetujui saja diekspor |
| Editor seperti Word | Tiptap: H2/H3, tebal, miring, garis bawah, daftar, kutipan, perataan, tautan, gambar, tabel, undo/redo; format disanitasi dan dipertahankan | Editor artikel, bukan semua fitur Word/DOCX; klik toolbar dan visual browser belum terverifikasi |
| Pilihan kategori | Audit, Akuntansi, Pajak, Keuangan Negara, Investigatif, Tata Kelola, Keuangan; kategori disimpan dan diterapkan ke kartu/halaman | UAT penyimpanan kategori dan pemeriksaan renderer |
| Draft, pratinjau, publikasi | Draft privat, pratinjau disanitasi, snapshot persetujuan tetap, claim/ack idempotent; edit draft mempertahankan artikel publik sebelumnya | Alur Worker dan renderer lulus; publikasi konten pertama ke Pages belum terverifikasi |
| Penjadwalan | Waktu WIB dikonversi ke UTC; tanggal kalender tidak valid ditolak; jadwal masa depan tidak keluar dari antrean; edit/pencabutan akses membatalkan persetujuan yang belum dimulai | Memerlukan automation tersambung; waktu terbit bergantung antrean dan Pages, bukan jaminan tepat menit |
| Pengelolaan SEO | Judul/deskripsi/slug, noindex, teks alternatif; canonical, hreflang, JSON-LD, sitemap, kartu dan llms dibangun otomatis; CSS/JS memakai SRI/CSP | Renderer lulus; tampilan hasil Google dan kenaikan peringkat tidak dijanjikan |
| Indonesia dan Inggris | Dua editor/metadata dalam satu artikel; sembilan artikel lama memiliki pasangan bahasa; versi EN yang sudah terbit tidak boleh hilang saat publikasi ulang | Tidak ada terjemahan otomatis; isi kedua bahasa tetap harus ditinjau |
| Riwayat perubahan | Versi, pelaksana dan waktu; restore menjadi draft baru tanpa publikasi otomatis; penyimpanan versi basi ditolak | UAT riwayat dan restore lulus; ini bukan pengganti backup |
| Hak akses Aa dan staf tertentu | Administrator, Penerbit, Penulis; pemeriksaan server pada setiap operasi; pemilik terlindungi dari penonaktifan; pencabutan akses berlaku pada permintaan berikutnya | Aa mengaktifkan akun pemilik saat login pertama. Staf belum diberikan akses; perlu email tepat, peran dan izin Site |

## Hasil pemeriksaan

- 81 permintaan UAT Worker/D1/R2 terisolasi: PASS. Identitas dispatch disimulasikan; tidak ada impersonasi akun di layanan produksi.
- TypeScript dan build Worker: PASS.
- Renderer: PASS untuk sembilan pasangan artikel lama dan artikel baru; metadata, canonical/hreflang/JSON-LD, kartu, sitemap/llms, SRI/CSP, gambar disetujui, konflik SHA, waktu mendatang dan escaping.
- Regresi cache aplikasi, consent statistik, penghitung kunjungan, video: PASS.
- Audit sumber integrasi: 64 HTML, 0 error keamanan; 50 URL sitemap, 0 error SEO. Dua warning keamanan dan 43 warning metadata lama tetap ada.
- Antrean produksi privat dapat dibaca lewat akses layanan resmi dan kosong sebelum integrasi. Ini tidak membuktikan sebuah artikel sudah diterbitkan.

## Verifikasi yang masih memerlukan pemilik

1. Buka panel, masuk memakai akun ChatGPT pemilik Site, lalu **Aktifkan panel saya**.
2. Periksa sembilan artikel lama dan gambar pada editor; lakukan pemeriksaan visual pada komputer/HP.
3. Untuk staf, tentukan email akun ChatGPT dan peran, daftarkan di Hak akses serta izinkan email yang sama pada pengaturan berbagi Site. Jangan memakai akun pemilik bersama.
4. Tinjau satu artikel nyata ID/EN, simpan, pratinjau, setujui publikasi/jadwal. Setelah Pages berhasil, periksa URL, bahasa, gambar dan metadata lalu pastikan antrean ditandai diterapkan.

Status penerbitan integrasi, automation, commit dan hasil live dicatat pada [laporan bersama](LAPORAN_KERJA_BERSAMA.md). Ikuti [CMS_OPERATIONS.md](CMS_OPERATIONS.md) untuk alur penerbitan dan penanganan konflik dengan pekerjaan Claude.
