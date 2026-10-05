# Kerja bersama pada hendrawanto.com

Situs produksi berasal dari branch `main` di repo `Hendraw83/hendrawanto.com`. Aa Hendra juga mengelolanya dengan Claude dan ChatGPT. Perlakukan setiap commit yang sudah masuk sebagai pekerjaan yang harus dipertahankan.

## Sebelum mengubah

1. Periksa status kerja lokal, tarik informasi `main` terbaru, dan baca commit terkini serta berkas yang akan disentuh.
2. Mulai dari commit terbaru. Bila ada perubahan lokal yang bukan milik tugas ini, pertahankan dan jangan menimpanya.
3. Tentukan perubahan sekecil mungkin. Jangan membuat ulang seluruh halaman atau mengembalikan versi lama hanya untuk mengubah metadata.
4. Untuk pekerjaan besar atau perubahan pada berkas yang juga sedang dikerjakan pihak lain, gunakan branch/PR tersendiri dan jelaskan cakupannya.

## Saat menerbitkan

1. Uji perubahan yang dibuat dan bandingkan diff terhadap `main` terbaru.
2. Periksa ulang SHA `main` segera sebelum commit/push. Jika telah bergerak, ambil perubahan baru, tinjau konflik, terapkan ulang secara selektif, dan uji lagi.
3. Gunakan pembaruan fast-forward saja. Jangan force push, `reset --hard`, atau menimpa riwayat. Jangan menyelesaikan konflik dengan membuang pekerjaan pihak lain.
4. Jika konflik tidak dapat diselesaikan secara yakin, hentikan publikasi bagian yang berbenturan, laporkan berkas/keputusan yang dibutuhkan, dan lanjutkan pekerjaan aman lainnya.
5. Setelah terbit, periksa situs publik dan catat commit serta hasilnya. Jangan mengklaim terbit hanya karena perubahan sudah ada di lokal.

## Pembagian kerja praktis

- Claude dan ChatGPT sama-sama boleh menyempurnakan situs. Tidak ada kepemilikan eksklusif atas halaman tertentu.
- Audit SEO harian ChatGPT berfokus pada kesehatan teknis, presentasi pencarian, dan laporan; perubahan konten substantif harus berlandaskan sumber yang terverifikasi.
- Jaga fungsi aplikasi/formulir, tautan, identitas profesional, dan kesetaraan halaman Indonesia–Inggris.
- Hindari commit kosong dan perubahan berulang pada judul, deskripsi, atau tanggal hanya demi tampak aktif.
- Catat alasan, cakupan, dan dampak perubahan pada pesan commit atau laporan sehingga pengelola berikutnya dapat melanjutkan tanpa mengulang pekerjaan.

## Laporan wajib setiap tugas

Aa Hendra meminta laporan untuk setiap pekerjaan ChatGPT dan Claude agar keduanya dapat melanjutkan dan melengkapi pekerjaan satu sama lain. Gunakan `LAPORAN_KERJA_BERSAMA.md` pada repo ini sebagai catatan bersama. ChatGPT dan Claude tidak berbagi percakapan secara otomatis; keberadaan laporan tidak membuktikan bahwa pihak lain telah membacanya.

1. Sebelum bekerja, baca laporan terbaru dan commit setelah laporan tersebut. Identifikasi pekerjaan yang sudah selesai, yang masih terbuka, serta berkas yang sedang diubah.
2. Setelah setiap tugas, tambahkan entri pada akhir laporan. Pertahankan semua entri sebelumnya. Tugas audit/penelitian tanpa perubahan kode tetap dilaporkan; jangan memaksa perubahan situs agar ada hasil yang dapat dicatat.
3. Tulis hanya pekerjaan sendiri atau perubahan yang dapat dibuktikan. Bila pelaksana suatu commit tidak dinyatakan, tulis `pelaksana belum terverifikasi`; nama akun GitHub saja tidak membedakan Claude, ChatGPT, dan perubahan manual.
4. Bedakan status `disiapkan`, `masuk main`, `deployment berhasil`, `terverifikasi live`, dan `belum terverifikasi`. Jangan menyamakan tag Analytics berhasil dimuat dengan data yang sudah diterima GA4, atau perbaikan SEO dengan kenaikan peringkat.
5. Sebelum menerbitkan laporan, periksa lagi versi laporan pada main. Gabungkan entri tambahan secara berurutan; jangan mengganti laporan pihak lain dengan salinan lama.
6. Sertakan tautan laporan dalam jawaban kepada Aa Hendra. Bila akses repo terhambat, berikan laporan dalam jawaban dan jelaskan bahwa catatan bersama belum diperbarui.

Gunakan format berikut dan hapus placeholder yang tidak relevan:

```markdown
## Tanggal dan waktu WIB — Ringkasan tugas

- Pelaksana: ChatGPT/Codex atau Claude.
- Tujuan dan alasan: ...
- Base main: SHA yang diperiksa sebelum perubahan.
- Perubahan dan berkas: ... / tidak ada perubahan kode.
- Commit/PR hasil: SHA/tautan; untuk entri dalam commit yang sama, rujuk PR atau riwayat berkas setelah diterbitkan.
- Pengujian dan bukti: pemeriksaan, hasil, dan batas bukti.
- Status publikasi: disiapkan / masuk main / deployment berhasil / terverifikasi live / tidak ada deployment.
- Keterbatasan atau pekerjaan terbuka: ...
- Tindak lanjut untuk pengelola berikutnya: ...
```

Audit SEO harian tetap menulis metrik di `SEO_DAILY_LOG.md`; laporan bersama merangkum hasil dan merujuk entri tersebut. Hindari menyalin angka lama sebagai hasil pemeriksaan baru.
