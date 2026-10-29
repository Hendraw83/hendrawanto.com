# Proses editorial bank soal

Bank sumber berisi 100 soal yang diberikan Aa Hendra. Generator `scripts/build-question-banks.mjs` memvalidasi jumlah, ID, prompt, empat opsi unik, dan satu indeks jawaban, lalu menghasilkan bank demo klien dan bank privat Functions.

Semua soal impor saat ini sengaja berstatus:

- `editorialStatus: "draft"`
- `competitionEligible: false`
- `verifiedAt: null`
- `officialSourceUrl: null`

Status tersebut bukan penilaian bahwa isinya salah; artinya verifikasi per butir ke DJP/JDIH belum dicatat. Mode online produksi hanya memilih `verified + competitionEligible`. Emulator boleh memakai draft jika **dua** kondisi terpenuhi: `ALLOW_DRAFT_QUESTIONS=true` dan `FIRESTORE_EMULATOR_HOST` tersedia.

## Checklist verifikasi administrator

1. Cocokkan pertanyaan, jawaban, tarif, batasan, dan tanggal berlaku ke sumber resmi DJP/JDIH.
2. Isi `source.official=true`, `officialSourceUrl`, `verifiedAt`, `effectivePeriod`, `validFrom`, dan bila perlu `validUntil`.
3. Untuk hitungan, isi periode pajak, kondisi WP, satuan, pembulatan, dan asumsi di `calculationAssumptions`.
4. Uji bahwa tepat satu opsi benar.
5. Set `editorialStatus="verified"` dan `competitionEligible=true`.
6. Seed/deploy dan uji emulator sebelum produksi.

Jika aturan berubah, administrator cukup mengubah `editorialStatus` menjadi `inactive` atau `competitionEligible` menjadi `false`. Sesi baru tidak akan memilih soal itu; sesi yang sudah dimulai tetap memiliki order auditnya. Template lengkap tersedia di `content/question.template.json`.
