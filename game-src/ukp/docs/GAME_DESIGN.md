# Game Design Document — Puncak Kemenangan Konsultan Pajak

## Ringkasan pengalaman

Pemain membantu PET HE mendaki 100 anak tangga dengan menjawab 100 soal unik perpajakan Indonesia. Fokusnya ketelitian, pembelajaran dari pembahasan, dan keputusan untuk berhenti pada kemenangan dasar atau mengejar puncak sempurna.

| Elemen | Keputusan MVP |
|---|---|
| Audiens | Mahasiswa, staf pajak, akuntan, calon konsultan pajak |
| Sesi | 100 soal acak tanpa pengulangan |
| Waktu | 60 detik per soal; berhenti selama animasi/pembahasan |
| Nyawa | 41; salah/timeout mengurangi tepat 1 |
| Pergerakan | Benar naik tepat 1; salah tetap |
| Gerbang 60 | Kemenangan Dasar; gerbang 2D membuka; boleh klaim atau lanjut |
| Puncak 100 | Kemenangan Utama dan medali “Konsultan Pajak Profesional” |
| Kalah | Nyawa habis sebelum skor 60; PET HE berparasut ke nol |
| Ranking | Skor ↓, salah ↑, waktu jawab ↑, selesai lebih awal |

## Loop inti

1. Pemain membaca satu soal dan empat opsi HTML yang dapat dioperasikan dengan keyboard/sentuhan.
2. Setelah dikunci, semua opsi nonaktif. Server atau mesin demo memeriksa satu kali.
3. PET HE merespons: selebrasi dan naik satu tangga, atau kecewa dan tetap di tempat.
4. Jawaban tepat, pembahasan, dan sumber ditampilkan. Timer berhenti.
5. Soal baru hanya dimulai setelah tombol **Lanjut** ditekan.

## Dua tingkat kemenangan

- Pada skor 60, sesi masuk hasil **Gerbang Kemenangan Dasar**. Gerbang emas di tangga 60 membuka. Pemain dapat mengklaim leaderboard atau melanjutkan.
- Klaim pada skor 60 tidak mengakhiri kemampuan melanjutkan. Klaim berikutnya dari sesi sama hanya memperbarui skor yang lebih tinggi; tidak membuat baris baru.
- Selama pendakian lanjutan, kemenangan dasar tidak hilang. Jika nyawa/soal habis, hasil tetap kemenangan dasar dengan skor terbaik.
- Puncak 100 memerlukan 100 jawaban benar karena bank MVP tepat 100 soal dan soal tidak berulang. Ini ditampilkan transparan dalam petunjuk.

## Visual, animasi, dan audio

- Renderer utama mengikuti referensi “Perjalanan HE”: ilustrasi 2D minimal, palet hijau pucat–krem, PET HE, dan sepuluh tangga diagonal per sektor.
- Seratus tangga dibagi menjadi sektor 1–10 sampai 91–100 agar angka dan karakter tetap terbaca di desktop maupun ponsel.
- Gerbang memiliki dua daun pintu. Posisi 60 memicu bukaan halus dan cahaya emas; `prefers-reduced-motion` membuatnya langsung terbuka.
- Bunyi dibuat dengan Web Audio API, baru aktif sesudah interaksi. Tidak ada URL audio/model/font eksternal.
- Renderer tidak memerlukan WebGL. Prototipe React Three Fiber tetap tersimpan di source tetapi tidak dimuat oleh layar utama.

## Prinsip edukasi

- Skor tidak berkurang; kesalahan menjadi kesempatan membaca pembahasan.
- Warna selalu didampingi teks/ikon.
- Medali adalah pencapaian game edukasi, bukan sertifikat profesi atau izin praktik.
- Materi draft boleh digunakan untuk demo, tetapi dilarang masuk kompetisi online sampai diverifikasi editorial.
