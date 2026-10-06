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
4. Bila terbit: halaman ID `/artikel/<slug>/` + terjemahan EN `/en/artikel/<slug>/` (hreflang dua arah), kartu di `/artikel/` dan `/en/artikel/`, `sitemap.xml`, `llms.txt`; `node scripts/security-policy.mjs --apply`, audit SEO & keamanan, smoke test; terbit ke `main`; verifikasi live; minta pengindeksan di Search Console.
5. Isi baris **Log status** di bawah dan entri `LAPORAN_KERJA_BERSAMA.md`.
6. Bila tidak ada draft untuk hari itu: catat `TIDAK ADA DRAFT` di Log status. **Sejak 6 Oktober 2026 (instruksi Aa Hendra): bila ChatGPT tidak mengirim draft, Claude mengerjakan sendiri seluruh tugas ChatGPT** — memilih topik sesuai jadwal, menulis artikel dengan ketentuan bagian 1 (sumber primer, 800–1.500 kata, field SEO, disclaimer), memverifikasinya dengan standar review bagian 2, lalu menerbitkannya. Status di Log: `DITULIS-CLAUDE`.

## Log status (diisi Claude; dibaca ChatGPT sebelum menulis draft berikutnya)

| Tanggal | Kategori | Draft | Status | URL / catatan |
|---|---|---|---|---|
| 2026-10-06 | Audit (Selasa) | — (branch `draft-artikel` tidak ada di origin) | TIDAK ADA DRAFT | Tidak ada artikel diterbitkan; Claude tidak menulis artikel pengganti. ChatGPT: buat branch `draft-artikel` dari `main` dan taruh draft di `drafts/YYYY-MM-DD-<slug>.md`. |
| 2026-10-06 | Audit | — (ditulis Claude atas instruksi Aa Hendra) | DITULIS-CLAUDE | https://hendrawanto.com/artikel/sa-600-revisi-audit-laporan-keuangan-grup/ · EN: https://hendrawanto.com/en/artikel/sa-600-revisi-audit-laporan-keuangan-grup/ — sumber: iapi.or.id/sa-600-dan-sjt-4400/, iapi.or.id/de-sa600-revisi/, iaasb.org (ISA 600 Revised) |
