import {GAME_CONFIG,GAME_COPY} from "../config/gameConfig";
import type {BackendMode} from "../game/types";
import {displayPlayerName,normalizePlayerName,PLAYER_NAME_MAX_LENGTH} from "../player/playerName";
import {JourneyScene2D} from "./JourneyScene2D";

export function OpeningScreen({mode,busy,playerName,onPlayerNameChange,onStart,onInstructions,onHall}:{mode:BackendMode;busy:boolean;playerName:string;onPlayerNameChange:(value:string)=>void;onStart:()=>void;onInstructions:()=>void;onHall:()=>void}){
  const canStart=normalizePlayerName(playerName).length>=2;
  return <main id="main-content" className="opening-flat min-h-screen overflow-hidden text-[#17384b]">
    <div className="relative mx-auto flex min-h-screen max-w-[1440px] flex-col px-5 py-6 sm:px-8 lg:px-12">
      <header className="flex items-center justify-between gap-4 border-b border-[#d9e1da] pb-5">
        <div className="flex items-center gap-3"><span className="he-logo">HE</span><div><strong className="block text-sm tracking-wide">GAME EDUKASI</strong><span className="text-[10px] tracking-[.22em] text-[#71877b]">Latihan UKP Pajak Level A</span></div></div>
        <span className={`mode-badge mode-light ${mode==="online"?"mode-online":""}`}>{mode==="online"?"ONLINE · BETA":"DEMO LOKAL"}</span>
      </header>
      <section className="grid flex-1 items-center gap-8 py-8 lg:grid-cols-[.72fr_1.28fr] lg:py-12">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-black leading-[1.03] tracking-[-.045em] sm:text-6xl">TANGGA<br/><span className="text-[#ad7620]">KONSULTAN PAJAK</span></h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-[#667e72] sm:text-lg">Jawab soal perpajakan, jaga 41 nyawa, dan lewati Gerbang Kemenangan. Setiap jawaban benar naik 1 anak tangga.</p>
          <label className="player-name-field"><span>Nama pemain</span><input value={playerName} onChange={event=>onPlayerNameChange(event.target.value)} minLength={2} maxLength={PLAYER_NAME_MAX_LENGTH} placeholder="Contoh: Hendra" autoComplete="nickname"/><small>Nama ini akan tampil pada perjalanan AvatarMu.</small></label>
          <div className="mt-8 flex flex-wrap gap-3">
            <button className="primary-cta" onClick={onStart} disabled={busy||!canStart}>{busy?<span className="spinner"/>:<span aria-hidden="true">▶</span>} {busy?"Menyiapkan sesi…":"Mulai Pendakian"}</button>
            <button className="secondary-cta flat-secondary" onClick={onInstructions}>Petunjuk</button>
            <button className="secondary-cta flat-secondary" onClick={onHall}>Hall of Fame</button>
          </div>
          <div className="opening-stats"><span><b>{GAME_CONFIG.questionCount}</b> soal unik</span><span><b>{GAME_CONFIG.startLives}</b> nyawa</span><span><b>{GAME_CONFIG.answerSeconds}s</b> per soal</span></div>
        </div>
        <div className="relative mx-auto w-full"><JourneyScene2D position={1} playerName={displayPlayerName(playerName)} preview/></div>
      </section>
      <footer className="flex flex-wrap justify-end gap-3 border-t border-[#d9e1da] pt-5 text-[11px] text-[#7c9187]"><span>{GAME_COPY.educationalNotice}</span></footer>
    </div>
  </main>;
}
