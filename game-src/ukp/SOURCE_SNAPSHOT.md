# Snapshot Kode Sumber UKP

Snapshot ini berasal dari commit proyek pengembangan `9377f37817b569f55119ef606a250ccb5f6616e2` dan disimpan di repositori website agar kode aplikasi tidak hanya tersedia sebagai hasil build terkompresi.

## Yang disertakan

- Frontend React, Vite, dan TypeScript di `src/`.
- Cloud Functions dan unit test di `functions/src/` serta `functions/test/`.
- Konfigurasi Firebase, Firestore Rules, indeks, TypeScript, dan Vite.
- Dokumentasi desain, arsitektur, keamanan, dan editorial.
- Aset lokal yang dipakai game.
- Bank soal demo draft yang memang tersedia pada browser.

## Yang sengaja tidak disertakan

- `node_modules/`, `dist/`, `functions/lib/`, cache, coverage, dan log.
- Seluruh berkas `.env*`.
- `content/questions.source.json`, karena merupakan sumber editorial berkunci.
- `functions/data/questions.private.json`, karena memuat kunci jawaban untuk backend.
- `.openai/hosting.json`, karena terikat pada lingkungan hosting pengembangan dan tidak diperlukan oleh GitHub Pages.

Jangan menggunakan bank demo sebagai bank kompetisi online. Produksi wajib memakai bank privat yang sudah diverifikasi dan hanya dapat dibaca oleh backend tepercaya.
