# Panel pengelolaan artikel Hendrawanto

Panel: https://he-article-cms.hendraw83.chatgpt.site/
Pintu masuk: https://hendrawanto.com/admin/
Site CMS: appgprj_6ac8897e3420819191e058450110bc59.
Situs publik tetap berasal dari Hendraw83/hendrawanto.com, branch main.

## Pemakaian

1. Pemilik masuk dengan akun ChatGPT pemilik Site, lalu klik **Aktifkan panel saya** pada kunjungan pertama. Pemilik menjadi Administrator; sembilan artikel ID+EN yang sudah terbit tersedia setelah aktivasi. Identitas akun admin dikonfigurasi secara privat dan tidak dicantumkan di repo publik.
2. Buka **Artikel**, pilih tulisan atau **Artikel baru**. Isi judul, ringkasan, isi, kategori, dan SEO. Indonesia dan English disunting terpisah; tidak ada terjemahan otomatis yang dianggap telah ditinjau.
3. Editor mendukung format teks, judul bagian, daftar, kutipan, perataan, tautan, gambar, tabel, dan undo/redo. Teks Word dapat ditempel; font dan tata letak halaman Word tidak disalin persis.
4. Gambar: JPG/PNG/WebP/GIF, maksimal 8 MB. SVG/dokumen ditolak. Draft dan unggahan berada di CMS privat; hanya gambar dalam revisi publikasi disalin ke situs publik.
5. **Simpan draft** membuat versi baru. **Pratinjau** memeriksa isi tanpa publikasi. Pemulihan riwayat menghasilkan draft baru, tanpa langsung mengubah artikel publik.
6. Administrator/Penerbit menyetujui **Publikasi** atau memilih tanggal dan jam WIB. Penulis hanya mengajukan tinjauan.
7. Automation **Publikasi artikel CMS Hendrawanto** aktif untuk memeriksa antrean setiap jam, pada menit ke-30 WIB; jadwal pertama 9 Oktober 2026 pukul 23.30 WIB. Waktu terbit dapat terlambat sekitar satu jam plus antrean GitHub Pages. Ini bukan jaminan terbit tepat pada detik yang dipilih. Schedule tersimpan belum membuktikan sebuah run telah berhasil.
8. Mengedit draft membatalkan persetujuan yang belum mulai diterbitkan. Jika penerbitan sudah dimulai, revisi yang disetujui tetap dapat selesai; perubahan terbaru menjadi draft berikutnya.
9. Jika versi situs berubah, antrean ditahan. Bandingkan artikel publik dengan draft, lalu gunakan **Tinjau perubahan situs**. Persetujuan publikasi baru tetap diperlukan.

## Hak akses

| Peran | Izin |
|---|---|
| Administrator | Semua artikel, publikasi/jadwal, riwayat, pengguna |
| Penerbit | Semua artikel, tinjauan, publikasi/jadwal, riwayat |
| Penulis | Draft sendiri, gambar, pratinjau, riwayat, pengajuan tinjauan; tidak dapat memublikasikan |

Izin diperiksa di server pada setiap permintaan. Penyimpanan dari halaman dengan nomor revisi lama ditolak.

Penulis hanya membaca artikel dan unggahan miliknya. Artikel yang masuk melalui sinkronisasi sebelum aktivasi pemilik tetap terlindungi, lalu menjadi milik pemilik saat aktivasi. Menonaktifkan penerbit atau mengubahnya menjadi Penulis membatalkan persetujuan yang belum mulai terbit; persetujuan baru dari penerbit aktif diperlukan. Snapshot yang sudah mulai terbit tetap dapat diselesaikan. Versi Inggris yang sudah terbit tidak dapat dihilangkan melalui publikasi ulang.

Untuk staf, daftarkan email akun ChatGPT dan peran di **Hak akses**, lalu beri izin email yang sama melalui pengaturan berbagi Site CMS. Dua lapis izin berlaku: akses Site dan peran CMS. Jangan membagikan akun pemilik atau menjadikan panel publik. Staf belum ditambahkan karena identitasnya belum diberikan.

## Kerja bersama

- Baca COLLABORATION.md, AGENTS.md/CLAUDE.md, dan LAPORAN_KERJA_BERSAMA.md.
- CMS adalah tambahan; jadwal/review substansi dalam ARTIKEL_PIPELINE.md tetap berlaku untuk artikel rutin.
- Artikel yang ditambah/diubah Claude di main diimpor pada sinkronisasi. Hanya artikel tanpa draft/antrean aktif yang diperbarui; draft aktif dipertahankan.
- Publikasi membandingkan SHA blob artikel dengan versi saat draft diambil. Perubahan Claude/SEO/pengelola lain mengakibatkan tinjauan, bukan overwrite.
- Daftar artikel, sitemap, llms, header/footer, dan kebijakan keamanan berasal dari main terbaru.
- Draft CMS tidak boleh dimasukkan ke repo publik. Hanya revisi yang disetujui dan telah jatuh tempo yang diekspor.

## Sinkronisasi untuk automation

Mulai dari get_site untuk Site CMS di atas. Ambil URL publikasi dan service credential dari hasil resmi. Jangan menyimpan credential di repo, berkas, browser, atau prompt automation. Bridge memakai OAI-Sites-Authorization dan proof SHA-256 pada X-CMS-Sync-Proof melalui stdin tersembunyi; origin dikunci persis ke https://he-article-cms.hendraw83.chatgpt.site, tanpa redirect. URL lain, userinfo, port, query, atau fragmen ditolak sebelum request. Jalankan bridge dengan PTY, tunggu pesan input tersembunyi, lalu berikan satu JSON dan newline melalui stdin. Mode terminal noncanonical mencegah pemotongan naskah panjang; HTTP error hanya menampilkan status dan petunjuk umum, tanpa credential.

1. Baca main terbaru, tree, aturan/laporan bersama, dan skrip cms-bridge.py, cms-import.mjs, cms-render.mjs, security-policy.mjs. Materialisasi berkas UTF-8 dari SHA tersebut: seluruh artikel ID/EN, dua daftar, sitemap, llms, serta CSS/JS yang dirujuk template.
2. Jalankan cms-import.mjs dengan JSON stdin berisi root, tree (path → SHA blob), dan sourceCommit. Kirim setiap hasil melalui bridge mode import. Artikel publik diimpor; draft aktif tidak diganti.
3. Bridge mode outbox membaca hanya revisi disetujui yang telah jatuh tempo. Jika kosong, jangan membuat commit/PR/laporan berulang atau mengganggu pengguna.
4. Periksa data/cms-published/<articleId>.json pada main dan branch/PR cms/publish-<jobId>. Jika manifest merekam job yang sama dan SHA artikel cocok, verifikasi deployment/live lalu ack; jangan terbitkan ulang. Jika PR sudah ada, review dan lanjutkan PR itu, tanpa duplikat.
5. Sebelum mutasi GitHub, bridge mode claim dengan jobId. Jika persetujuan berubah/dibatalkan (409), hentikan job. Snapshot yang mulai diterbitkan tetap; penyunting dapat membuat draft berikutnya.
6. Bandingkan path artikel ID/EN dengan expectedHashes. Ketidaksesuaian: bridge mode conflict berisi jobId, message, hashes dari tree terbaru; hentikan job. Jangan force push/overwrite.
7. Gambar /api/media/<UUID> hanya diunduh melalui bridge mode media dengan mediaId dan jobId. Hasil memberi path aset, bytes base64, encoding. Gunakan mapping UUID → path untuk render.
8. Jalankan cms-render.mjs dengan JSON stdin berisi root, job, assets, tree, now, write:false. Keluaran berisi berkas publik dan hash artikel. Tinjau diff, metadata, canonical/hreflang/JSON-LD, CSP/SRI, kartu/sitemap/llms. Jangan mengubah halaman lain.
9. Gunakan branch/PR terpisah, native GitHub blobs/tree/commit/ref tanpa force. Review diff/status dan periksa ulang main serta hash artikel sebelum merge. Jika base bergerak, render ulang dari sumber terbaru dan pertahankan pekerjaan baru, atau tahan bagian yang belum jelas.
10. Tambahkan laporan hanya setelah tindakan nyata, dengan job/revisi/PR dan batas pengujian.
11. Merge PR yang lulus, tunggu GitHub Pages dan verifikasi URL live. Bridge mode ack berisi jobId, commitSha, hashes hanya setelah publikasi terverifikasi. Ack idempotent; baseline CMS diperbarui.
12. Jika koneksi gagal/hasil aksi tidak pasti, periksa keadaan provider sebelum mengulangi. Jangan ack keberhasilan yang belum dibuktikan; jangan membuat PR/merge duplikat. Laporkan blocker bila perlu tindakan pemilik.

Bridge mode: outbox, import, claim, media, ack, conflict. Rotasi service credential memerlukan pembaruan CMS_SYNC_PROOF (SHA-256 credential) melalui pengaturan rahasia dan deployment CMS. Jangan menampilkan nilai rahasia atau merotasi sekadar untuk pemeriksaan.

## Bukti dan batas

UAT Worker/D1/R2 terisolasi menguji izin, kepemilikan, draft privat, gambar, sanitizer, stale write, jadwal WIB, antrean, konflik, riwayat/restore, ack idempotent, pencabutan akses, dan impor tanpa menimpa draft. Identitas dispatch disimulasikan; ini tidak membuktikan login SIWC pengguna pada browser.

Renderer diuji terhadap sembilan template dwibahasa, artikel baru, metadata/canonical/hreflang/JSON-LD, kartu/sitemap/llms, CSP/SRI, media, waktu mendatang, konflik SHA, dan escaping.

Pemeriksaan ulang 9 Oktober 2026: **81 permintaan UAT lulus**, termasuk impor sebelum aktivasi, akses gambar Penulis, tanggal kalender WIB yang tidak valid, kategori, format teks/tabel, versi ID/EN, pencabutan persetujuan dan snapshot publik yang tetap saat draft berubah. TypeScript dan build berhasil. Renderer serta regresi keamanan, consent statistik, penghitung dan video lulus. Status terperinci per fitur ada di [CMS_UAT.md](CMS_UAT.md).

Sembilan artikel lama ID/EN telah diimpor ke database produksi dan dibaca kembali dengan hash sumber yang sesuai; akun pemilik belum diaktifkan. `/admin/`, CSS dan robots terverifikasi HTTP 200 setelah Pages PR #10 sukses. Perbaikan transport naskah panjang lulus tiga tes Python tanpa request jaringan, kemudian dipakai untuk impor nyata. Automation tersambung ke Site yang sama dan dapat memperoleh akses layanan serta petunjuk dari main; pelaksanaan pertamanya dan publikasi konten pertama belum terverifikasi.

Pemeriksaan visual desktop/ponsel dan WebMCP browser belum tersedia dalam sesi ini. Belum ada artikel percobaan yang diterbitkan. Login pemilik/staf dengan akun nyata dan publikasi pertama belum terverifikasi. Publikasi pertama memakai artikel nyata yang telah ditinjau; deploy CMS bukan bukti alur konten live sudah diuji.
