import {GAME_CONFIG} from "../config/gameConfig";

const rules=[
  ["Benar","AvatarMu naik tepat satu tangga dan skor bertambah satu."],
  ["Salah / timeout","AvatarMu tetap di tempat dan satu nyawa berkurang. Skor tidak berkurang."],
  ["Timer","Setiap soal memiliki 60 detik. Timer berhenti selama animasi dan pembahasan."],
  ["Kemenangan dasar","Skor 60 membuka Gerbang Kemenangan. Pemain boleh klaim hasil atau melanjutkan pendakian."],
  ["Puncak utama","Skor 100 menghasilkan Puncak Kemenangan Utama. Tidak ada soal lagi setelah puncak."],
  ["Kekalahan","Sesi berakhir ketika seluruh 41 nyawa habis."],
  ["Integritas","Pilihan dikunci setelah dikirim. Soal tidak berulang dan soal berikutnya dimulai setelah tombol Lanjut."],
];
export function InstructionsScreen({canStart,onBack,onStart}:{canStart:boolean;onBack:()=>void;onStart:()=>void}){return <main id="main-content" className="min-h-screen bg-[#eef6fc] px-5 py-8 text-[#08264a] sm:px-8"><div className="mx-auto max-w-5xl"><button className="back-button" onClick={onBack}>← Kembali</button><div className="mt-6 rounded-[2rem] border border-blue-100 bg-white p-6 shadow-xl shadow-blue-900/5 sm:p-10"><span className="eyebrow-blue">PETUNJUK PERMAINAN</span><h1 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">Satu jawaban. Satu keputusan.</h1><p className="mt-4 max-w-3xl leading-7 text-slate-600">Permainan mengutamakan pemahaman, bukan kecepatan semata. Bacalah periode pajak, asumsi, dan satuan angka sebelum memilih jawaban.</p><div className="mt-8 grid gap-4 md:grid-cols-2">{rules.map(([title,body],index)=><article key={title} className="rule-card"><span>{String(index+1).padStart(2,"0")}</span><div><h2>{title}</h2><p>{body}</p></div></article>)}</div><div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950"><strong>Batas matematis MVP:</strong> bank saat ini berisi {GAME_CONFIG.questionCount} soal unik. Karena soal tidak boleh berulang, Puncak 100 hanya tercapai bila seluruh 100 jawaban benar. Jika ada kesalahan, kemenangan dasar tetap aman dan skor terbaik tetap dapat diklaim.</div><button className="primary-cta mt-8" onClick={canStart?onStart:onBack}>{canStart?"Saya Mengerti · Mulai":"Kembali · Isi Nama Pemain"}</button></div></div></main>}
