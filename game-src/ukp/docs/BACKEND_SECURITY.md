# Backend, skema data, dan keamanan dasar

## Skema Firestore

| Path | Isi | Akses browser |
|---|---|---|
| `questionBank/{questionId}` | soal lengkap, kunci, metadata editorial | tidak ada |
| `activeSessions/{uid}` | pointer sesi aktif pengguna anonim | tidak ada |
| `gameSessions/{sessionId}` | order, turn, deadline, skor, nyawa, state | tidak ada |
| `gameSessions/{id}/answers/{turnId}` | riwayat jawaban tepercaya | tidak ada |
| `gameSessions/{id}/requests/{requestId}` | respons idempoten operasi | tidak ada |
| `claims/{sessionId}` | audit klaim kemenangan | tidak ada |
| `privateContacts/{sessionId}` | email/telepon opsional | tidak ada |
| `leaderboard/{sessionId}` | nama dan metrik publik tersanitasi | baca jika belum kedaluwarsa; tulis server |
| `rateLimits/{uid_bucket}` | jendela frekuensi | tidak ada |

ID entri leaderboard sama dengan ID sesi. Karena itu klaim lanjutan memperbarui pencapaian, tidak menggandakan baris.

## Kontrak callable

| Fungsi | Input utama | Hasil / jaminan |
|---|---|---|
| `startOrResumeSession` | `{}` | membuat atau melanjutkan satu sesi pemilik; memproses timeout lewat sekali |
| `submitAnswer` | `sessionId, turnId, questionId, selectedOptionId, requestId` | validasi turn dan opsi; mengunci jawaban dalam transaksi |
| `nextQuestion` | `sessionId, requestId` | hanya dari feedback; terminal atau turn baru dengan deadline baru |
| `continueToSummit` | `sessionId, requestId` | hanya sesudah skor 60; tidak bila nyawa/soal habis |
| `claimWin` | `sessionId, claim` | hanya kemenangan server; upsert klaim/leaderboard/kontak secara atomik |
| `getLeaderboard` | `{}` | entri aktif maksimum 50, diurutkan empat kriteria |
| `resetSession` | `{}` | menonaktifkan sesi aktif milik pemanggil |

## Kontrol pengamanan

- Anonymous Auth wajib untuk semua callable; setiap sesi dicek `ownerUid`.
- Firestore Rules menolak seluruh tulis browser dan seluruh baca data privat.
- Kunci tidak masuk snapshot sebelum jawaban terkunci. Setelah itu ID jawaban tepat dan pembahasan memang perlu ditampilkan.
- Rate limit per UID diterapkan melalui transaksi. App Check dapat dipaksa dengan `ENFORCE_APP_CHECK=true`.
- Nama dibatasi 24 karakter dan karakter kontrol/angle bracket dibuang. Kontak tidak disalin ke koleksi publik.
- Leaderboard difilter `expiresAt > waktu server`; TTL Firestore opsional dapat menghapus dokumen fisik setelah lewat.

## Keterbatasan jujur

Anonymous Auth, App Check, rate limit, dan transaksi menaikkan biaya serangan tetapi tidak membuat game kebal bot. Penyerang dapat mengotomatisasi browser, membuat identitas anonim baru, atau mengekstrak materi yang telah dijawab. Kompetisi bernilai tinggi memerlukan pemantauan anomali, kuota/IP di lapisan edge, audit, dan mungkin verifikasi peserta.
