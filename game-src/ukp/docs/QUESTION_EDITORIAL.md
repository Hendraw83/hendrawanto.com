# Proses editorial bank soal

Bank berisi 200 soal: 100 soal Simulasi UKP Level A yang diberikan Aa Hendra dan 100 soal latihan tambahan. Setiap butir memiliki ID stabil, empat opsi unik, satu kunci, pembahasan, sumber, masa berlaku, status editorial, nomor urut, dan catatan review.

Hasil review regulasi awal 30 Oktober 2026, review etika tahap kedua, dan audit regulasi tahap ketiga 31 Oktober 2026:

- 80 soal regulasi berstatus `editorialStatus: "verified"` setelah review editorial awal. Tiga belas butir—21, 22, 27, 39, 70, dan 73–80—telah diaudit kembali terhadap sumber pemerintah resmi pada tahap ketiga.
- 20 soal etika berstatus `editorialStatus: "draft"`. Seluruhnya telah diselaraskan dengan ketentuan eksplisit Kode Etik IKPI, tetapi belum dinaikkan menjadi terverifikasi karena acuannya bersifat asosiasi-spesifik.
- 100 soal tambahan nomor 101–200 berstatus `editorialStatus: "draft"` dan memerlukan review editorial kedua secara independen.
- Seluruh 200 soal tetap `competitionEligible: false` sampai persetujuan editorial akhir.

Mode demo dapat menggunakan seluruh bank. Mode online beta Supabase juga dapat memakai draft; mode kompetisi hanya boleh memilih `verified + competitionEligible` dan membutuhkan 200 soal agar rotasi dua paket tetap bekerja. Emulator boleh memakai draft jika **dua** kondisi terpenuhi: `ALLOW_DRAFT_QUESTIONS=true` dan `FIRESTORE_EMULATOR_HOST` tersedia. Daftar koreksi dan audit ada di [QUESTION_REVIEW_2026-10-30.md](QUESTION_REVIEW_2026-10-30.md).

## Checklist verifikasi administrator

1. Cocokkan pertanyaan, jawaban, tarif, batasan, dan tanggal berlaku ke sumber resmi DJP/JDIH.
2. Isi `source.official=true`, `officialSourceUrl`, `verifiedAt`, `effectivePeriod`, `validFrom`, dan bila perlu `validUntil`.
3. Untuk hitungan, isi periode pajak, kondisi WP, satuan, pembulatan, dan asumsi di `calculationAssumptions`.
4. Uji bahwa tepat satu opsi benar.
5. Setelah review kedua dan persetujuan editor, set `editorialStatus="verified"` dan `competitionEligible=true`.
6. Seed/deploy dan uji emulator sebelum produksi.

Jika aturan berubah, administrator cukup mengubah `editorialStatus` menjadi `inactive` atau `competitionEligible` menjadi `false`. Sesi baru tidak akan memilih soal itu; sesi yang sudah dimulai tetap memiliki order auditnya. Template lengkap tersedia di `content/question.template.json`.
