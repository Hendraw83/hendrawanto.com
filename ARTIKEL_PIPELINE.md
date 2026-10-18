# Alur Artikel Rutin: ChatGPT menulis draft → Claude review → terbit

Ditetapkan Aa Hendra pada 5 Oktober 2026. Berlaku untuk ChatGPT/Codex dan Claude. Dokumen ini adalah satu-satunya "kotak surat" antara keduanya untuk artikel; aturan umum tetap di `COLLABORATION.md`.

## Jadwal

| Hari | Kategori | ChatGPT: draft siap | Claude: review mulai | Terbit |
|---|---|---|---|---|
| Minggu | Pajak | 07.30 WIB | 09.30 WIB | ±10.00 WIB |
| Selasa | Audit | 07.30 WIB | 09.30 WIB | ±10.00 WIB |
| Kamis | Akuntansi | 07.30 WIB | 09.30 WIB | ±10.00 WIB |
| Jumat | Keuangan Negara, Investigatif, Kerugian Keuangan Negara | 07.30 WIB | 09.30 WIB | ±10.00 WIB |

Topik: utamakan isu terbaru (regulasi, putusan, standar, kebijakan yang baru terbit atau mulai berlaku). Jika tidak ada isu baru yang layak, tulis topik umum yang bermanfaat. Jangan mengulang topik yang sudah ada di `/artikel/`.

## 1. Tugas ChatGPT (paling lambat 07.30 WIB)

1. Ambil `main` terbaru. Baca bagian **Log status** di bawah: bila ada draft berstatus `DITAHAN`, perbaiki dulu sesuai catatan Claude (ubah `status: revisi-siap`).
2. Buat SATU draft untuk kategori hari itu di branch **`draft-artikel`** (buat dari `main` bila belum ada). **Jangan** menaruh draft di `main` — situs memakai `.nojekyll`, jadi semua berkas di `main` ikut tayang publik.
3. Lokasi berkas: `drafts/YYYY-MM-DD-<slug>.md` (tanggal = hari terbit). Satu artikel per berkas.
4. Format wajib (frontmatter + isi Markdown):

```markdown
---
tanggal: 2026-10-11
kategori: Pajak            # Pajak | Audit | Akuntansi | Investigasi
jenis: update              # update | umum
judul: Judul Artikel
subjudul: Satu kalimat penjelas
slug: judul-artikel-huruf-kecil
meta_title: maksimal 60 karakter
meta_description: 120–155 karakter
ringkasan: 1–2 kalimat untuk kartu di halaman /artikel/
kata_kunci_utama: ...
kata_kunci_pendukung: ..., ..., ...
sumber:
  - https://sumber-resmi-1
  - https://sumber-resmi-2
status: siap-review
---

Paragraf pembuka...

## Subjudul 1
...

## Kesimpulan
...

*Disclaimer. Artikel ini merupakan informasi umum ...*
```

5. Ketentuan isi: 800–1.500 kata; Bahasa Indonesia baku; penulis Hendrawanto (jangan menambah klaim baru tentang pengalaman, klien, atau jabatan Aa Hendra); tanpa data atau nama klien; setiap nomor regulasi, tanggal berlaku, tarif, dan angka harus ada di daftar `sumber` (utamakan sumber primer: pajak.go.id, jdih.kemenkeu.go.id, peraturan.bpk.go.id, mkri.id, mahkamahagung.go.id, iaiglobal.or.id, iapi.or.id, ojk.go.id, bpk.go.id, bpkp.go.id). Untuk `jenis: update` minimal 2 sumber primer. Tulis sendiri, jangan menyalin teks sumber.
5a. **Usulan visual (wajib sejak 14 Oktober 2026, instruksi Aa Hendra).** Tambahkan field `visual:` di frontmatter berisi 2–4 usulan visual yang relevan dengan tema (mis. linimasa tanggal berlaku, alur prosedur, perbandingan sebelum/sesudah, tabel tarif, diagram peran). Setiap angka/tanggal dalam usulan visual harus sudah ada di isi dan sumber artikel. Claude yang membuat visual akhirnya.
6. Tidak perlu membuat HTML, versi Inggris, sitemap, atau kartu daftar artikel — itu tugas Claude.
7. Tambahkan entri singkat di `LAPORAN_KERJA_BERSAMA.md` (di `main`): judul draft, path berkas di branch `draft-artikel`, SHA commit draft.

## 2. Tugas Claude (mulai 09.30 WIB)

1. Ambil branch `draft-artikel`; cari `drafts/<tanggal hari ini>-*.md` dan draft lain berstatus `revisi-siap`.
2. Review:
   - Fakta: verifikasi setiap regulasi, tanggal, tarif, angka, dan putusan ke sumber primer (web). Klaim yang tidak bisa diverifikasi = masalah berat.
   - Kepatuhan: tanpa data klien, tanpa klaim baru tentang Aa Hendra, ada disclaimer, bukan salinan teks sumber.
   - Mutu: struktur, kejelasan, panjang, ejaan; kelengkapan field SEO.
3. Keputusan:
   - **TERBIT** — lolos tanpa perubahan berarti.
   - **DIPERBAIKI-TERBIT** — masalah ringan (ejaan, struktur, judul/meta, tautan internal, kalimat kurang jelas) diperbaiki Claude, lalu terbit. Perubahan dicatat.
   - **DITAHAN** — masalah berat (fakta/regulasi salah atau tak terverifikasi, potensi menyesatkan, isu kerahasiaan). Tidak terbit; catatan revisi ditulis di Log status dan Aa Hendra diberi tahu.
3a. **Visual wajib (instruksi Aa Hendra, 14 Oktober 2026): setiap artikel yang terbit harus punya gambar atau visual yang relevan dengan tema.** Minimal: (a) gambar sampul 1408×768 JPG ±100–150 KB untuk ID dan EN di `assets/articles/<slug>-sampul-{id,en}.jpg` (dirender dari HTML/SVG dengan huruf situs; tanpa logo/lambang instansi atau merek pihak lain; teks hanya fakta yang ada di artikel), dipasang di bawah baris penulis dan dipakai untuk og:image serta JSON-LD `image`; dan (b) 2–3 figur di dalam isi (HTML/CSS/SVG inline, blok `<style>` berprefiks khusus artikel di halaman itu saja, tanpa skrip/CDN baru). Gunakan **visual bergerak** bila membantu pemahaman (linimasa yang muncul berurutan, batang yang terisi, titik berdenyut) dengan animasi CSS saja — boleh `animation-timeline: view()` di dalam `@supports` — dan wajib dimatikan oleh `@media (prefers-reduced-motion: reduce)`. Periksa tampilan 1280 px dan 390 px tanpa scroll horizontal dan tanpa error konsol. Artikel tanpa visual tidak boleh terbit.
4. Bila terbit: halaman ID `/artikel/<slug>/` + terjemahan EN `/en/artikel/<slug>/` (hreflang dua arah), kartu di `/artikel/` dan `/en/artikel/`, `sitemap.xml`, `llms.txt`; `node scripts/security-policy.mjs --apply`, audit SEO & keamanan, smoke test; terbit ke `main`; verifikasi live; minta pengindeksan di Search Console.
5. Isi baris **Log status** di bawah dan entri `LAPORAN_KERJA_BERSAMA.md`.
6. Bila tidak ada draft untuk hari itu: catat `TIDAK ADA DRAFT` di Log status. **Sejak 6 Oktober 2026 (instruksi Aa Hendra): bila ChatGPT tidak mengirim draft, Claude mengerjakan sendiri seluruh tugas ChatGPT** — memilih topik sesuai jadwal, menulis artikel dengan ketentuan bagian 1 (sumber primer, 800–1.500 kata, field SEO, disclaimer), memverifikasinya dengan standar review bagian 2, lalu menerbitkannya. Status di Log: `DITULIS-CLAUDE`.

## Log status (diisi Claude; dibaca ChatGPT sebelum menulis draft berikutnya)

| Tanggal | Kategori | Draft | Status | URL / catatan |
|---|---|---|---|---|
| 2026-10-06 | Audit (Selasa) | — (branch `draft-artikel` tidak ada di origin) | TIDAK ADA DRAFT | Tidak ada artikel diterbitkan; Claude tidak menulis artikel pengganti. ChatGPT: buat branch `draft-artikel` dari `main` dan taruh draft di `drafts/YYYY-MM-DD-<slug>.md`. |
| 2026-10-06 | Audit | — (ditulis Claude atas instruksi Aa Hendra) | DITULIS-CLAUDE | https://hendrawanto.com/artikel/sa-600-revisi-audit-laporan-keuangan-grup/ · EN: https://hendrawanto.com/en/artikel/sa-600-revisi-audit-laporan-keuangan-grup/ — sumber: iapi.or.id/sa-600-dan-sjt-4400/, iapi.or.id/de-sa600-revisi/, iaasb.org (ISA 600 Revised) |
| 2026-10-08 | Akuntansi (Kamis) | — (branch `draft-artikel` tidak ada di origin; ditulis Claude) | DITULIS-CLAUDE | https://hendrawanto.com/artikel/psak-118-penyajian-pengungkapan-laporan-keuangan/ · EN: https://hendrawanto.com/en/artikel/psak-118-penyajian-pengungkapan-laporan-keuangan/ — sumber: DSAK Terkini Vol. 7 2025 & DE PSAK 118 (web.iaiglobal.or.id), ifrs.org (IFRS 18). Penerapan dini dinyatakan sebagai "diusulkan DE / diizinkan IFRS 18" karena teks final PSAK 118 tidak dapat diakses publik. |
| 2026-10-11 (dikerjakan 2026-10-12) | Pajak (Minggu) | — (branch `draft-artikel` tidak ada di origin; ditulis Claude) | DITULIS-CLAUDE | https://hendrawanto.com/artikel/pmk-71-2026-pengurangan-sanksi-keberatan-pajak/ · EN: https://hendrawanto.com/en/artikel/pmk-71-2026-pengurangan-sanksi-keberatan-pajak/ — sumber primer: jdih.kemenkeu.go.id (PMK 71/2026: ditetapkan 29 Sep 2026, diundangkan & berlaku 2 Okt 2026, BN 2026/691; PMK 118/2024 teks asli Pasal 23 ayat (6)-(7)). Rutin Minggu baru berjalan Senin 12 Okt ±19.00 WIB, terbit tanggal 12 Okt. Status ketentuan UU KUP yang dikecualikan (Pasal 25(9), 27(5d), 27(5f)) hanya disebut pasalnya, tanpa tarif. |
| 2026-10-13 | Audit (Selasa) | — (branch `draft-artikel` tidak ada di origin; ditulis Claude) | DITULIS-CLAUDE | https://hendrawanto.com/artikel/isa-240-revisi-tanggung-jawab-auditor-kecurangan/ · EN: https://hendrawanto.com/en/artikel/isa-240-revisi-tanggung-jawab-auditor-kecurangan/ — sumber primer: iaasb.org (siaran pers 8 Jul 2025; halaman publikasi ISA 240 (Revised): berlaku periode mulai ≥15 Des 2026, berlaku bersamaan ISA 570 (Revised 2024)); teks standar (para 16, 18–22, 29, 32–33, 40–41, 47–68); iapi.or.id (DE Standar Audit 2025 berbasis Handbook 2023–2024, tanggapan s.d. 10 Okt 2025; daftar draf eksposur belum memuat SA 240 revisi). Artikel menyatakan SA 240 IAPI yang berlaku tetap acuan di Indonesia. |
| 2026-10-14 | Audit (draft ChatGPT, uji Run Now 13 Okt; terbit Rabu atas permintaan Aa Hendra) | `draft-artikel`: `drafts/2026-10-13-isa-570-revisi-2024-kelangsungan-usaha.md` (034aae5) | DIPERBAIKI-TERBIT | https://hendrawanto.com/artikel/isa-570-revisi-2024-kelangsungan-usaha/ · EN: https://hendrawanto.com/en/artikel/isa-570-revisi-2024-kelangsungan-usaha/ — fakta terverifikasi (siaran pers IAASB 9 Apr 2025, berlaku periode mulai ≥15 Des 2026; FAQ IAASB 15 Mei 2025; iapi.or.id: SA 570 (Revisi 2021) berlaku periode mulai ≥1 Jan 2022). Perbaikan: klaim skeptisisme profesional dialihkan ke publikasi IAASB 21 Jul 2025 (siaran pers 9 Apr tidak menyebutnya); ditambah evaluasi penilaian manajemen walau tanpa peristiwa/kondisi dan periode ≥12 bulan sejak persetujuan LK (siaran pers 9 Apr); penguatan disusun bernomor; tautan internal ke ISA 240; subjudul 'tanggal berlakunya'; Referensi Resmi. Catatan untuk ChatGPT: draft bagus — pastikan setiap klaim dikaitkan ke sumber yang benar-benar memuatnya. |
| 2026-10-15 | Akuntansi (Kamis) | `draft-artikel`: `drafts/2026-10-15-sak-entitas-privat-transisi-etap.md` (d7ee131) | DIPERBAIKI-TERBIT | https://hendrawanto.com/artikel/sak-entitas-privat-transisi-etap/ · EN: https://hendrawanto.com/en/artikel/sak-entitas-privat-transisi-etap/ — fakta terverifikasi ke web.iaiglobal.or.id: Tentang SAK EP (pengguna tanpa akuntabilitas publik, LK bertujuan umum untuk pengguna eksternal, izin regulator, efektif 1 Jan 2025, penerapan dini diperkenankan, Bab 1–35, Contoh LK Ilustratif dari IFRS for SMEs); Tentang SAK ETAP (digantikan SAK EP per 1 Jan 2025); SAK Efektif Disahkan 2021 (pengesahan 30 Jun 2021, adopsi IFRS for SMEs, penyederhanaan, enam area perbedaan dengan SAK ETAP). Perbaikan: (1) "pemberi pinjaman" sebagai contoh pengguna eksternal dihapus — tidak ada di sumber; diganti contoh IAI "pemilik yang tidak terlibat langsung dalam pengelolaan usaha"; (2) klaim "35 bab" dialihkan ke halaman Tentang SAK EP (halaman SAK Efektif 2021 tidak memuatnya); (3) URL sumber ke-3 di isi draft salah encoding — diperbaiki; (4) ditambah tanggal pengesahan, penerapan dini, contoh topik yang dihilangkan dan contoh properti investasi; (5) ditambah paragraf transisi Bab 35 (retrospektif dengan pengecualian, penyesuaian ke saldo laba) dari materi sosialisasi SAK EP di situs IAI, dengan catatan bahwa materi itu bukan posisi resmi; (6) tautan internal ke artikel Penerapan SAK Terbaru dan PSAK 118; Referensi Resmi. Visual: sampul ID/EN + 3 figur (linimasa, diagram kelayakan, enam area perbedaan; animasi CSS). Catatan untuk ChatGPT: field `visual:` sudah dipakai — bagus; jangan menambahkan contoh/kategori yang tidak ada di sumber walau terdengar wajar, dan cek ulang encoding URL sumber. |
| 2026-10-18 | Pajak (Minggu; terbit oleh Codex atas permintaan Aa Hendra karena Claude kehabisan token) | `draft-artikel`: `drafts/2026-10-18-pembetulan-spt-coretax-per-12-2026.md` (`7adf8ae`) | DIPERBAIKI-TERBIT | https://hendrawanto.com/artikel/pembetulan-spt-coretax-per-12-2026/ · EN: https://hendrawanto.com/en/artikel/pembetulan-spt-coretax-per-12-2026/ — sumber primer: teks PER-12/PJ/2026, materi penjelasan DJP, dan artikel edukasi DJP. Artikel ID ditambah rujukan resmi; versi EN, sampul JPG ID/EN, dan tiga figur beranimasi CSS dibuat. Klaim transisi, pembetulan terakhir, pengembalian, angsuran, serta kompensasi dicocokkan ke Pasal II, 129A–129B, 29C–29D, dan 80A. Terbit pada main `7803756`; navigasi bersama diselaraskan pada `345014f`. Pages berhasil dan halaman/visual diverifikasi live; workflow keamanan masih gagal karena temuan pada dua aplikasi lain yang tidak diubah dalam tugas ini. |
