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
