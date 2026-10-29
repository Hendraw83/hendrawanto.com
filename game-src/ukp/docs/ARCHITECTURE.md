# Arsitektur dan state machine

## Arsitektur sistem

```mermaid
flowchart TD
  UI["React + HTML quiz"] --> CTRL["Game controller + reducer"]
  CTRL --> SCENE["JourneyScene2D · HTML/CSS"]
  CTRL --> DEMO["DemoBackend · localStorage"]
  CTRL --> ONLINE["OnlineBackend · Firebase callable"]
  ONLINE --> FN["Cloud Functions · trusted rules"]
  FN --> FS[("Cloud Firestore")]
  FN --> AUTH["Anonymous Auth"]
```

UI tidak pernah mengubah skor langsung. `BackendClient` membuat mode demo dan online memakai kontrak snapshot yang sama. Pada online, hanya Cloud Functions/Admin SDK dapat membaca kunci soal dan menulis sesi, klaim, kontak, serta leaderboard.

## State machine klien

```mermaid
stateDiagram-v2
  [*] --> Ready
  Ready --> Checking: Mulai/resume
  Checking --> Answering: Snapshot soal
  Answering --> Checking: Kunci/timeout
  Checking --> Moving: Hasil tepercaya
  Moving --> Explanation: Animasi selesai
  Explanation --> Checking: Lanjut
  Checking --> Won: Skor 60 / akhir setelah 60
  Won --> Checking: Lanjut ke 100
  Won --> Claimed: Klaim
  Claimed --> Checking: Lanjut ke 100
  Checking --> Summit: Tangga 100
  Checking --> Lost: Nyawa habis sebelum 60
  Ready --> ConnectionError: Jaringan gagal
  ConnectionError --> Checking: Coba lagi
```

| State | Aksi yang diizinkan |
|---|---|
| `ready` | mulai, petunjuk, Hall of Fame |
| `answering` | pilih, kunci jawaban, mute |
| `checking` | menunggu operasi idempoten, mute |
| `moving` | menunggu animasi, mute |
| `explanation` | baca hasil/sumber, Lanjut, mute |
| `won` | klaim, lanjut ke puncak, Hall of Fame, main lagi |
| `claimed` | lanjut ke puncak, Hall of Fame, main lagi |
| `lost` | Hall of Fame, main lagi |
| `connectionError` | coba lagi atau kembali |

## Batas kepercayaan

- Browser mengirim identitas sesi, turn, soal, opsi, dan `requestId`; browser tidak mengirim skor akhir, sisa waktu, atau status menang.
- Deadline, waktu mulai, kunci, skor, nyawa, dan outcome dihitung Functions memakai waktu server.
- Setiap mutasi online disimpan dalam transaksi Firestore bersama dokumen idempotensi.
- Resume memeriksa deadline. Timeout yang lewat memakai ID deterministik `timeout-{turnId}`, sehingga dicatat paling banyak sekali.
