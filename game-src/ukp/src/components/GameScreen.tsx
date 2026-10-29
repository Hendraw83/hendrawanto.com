import {GAME_CONFIG} from "../config/gameConfig";
import type {GameController} from "../hooks/useGameController";
import {JourneyScene2D} from "./JourneyScene2D";
import {QuizPanel} from "./QuizPanel";
import {ResultPanel} from "./ResultPanel";

export function GameScreen({controller,playerName,onHall,onReplay,onHome}:{controller:GameController;playerName:string;onHall:()=>void;onReplay:()=>void;onHome:()=>void}){
  const session=controller.state.session;
  if(controller.state.phase==="connectionError")return <main id="main-content" className="connection-page"><div className="connection-card"><span className="text-5xl">⚠</span><h1>Koneksi permainan terputus</h1><p>{controller.state.error}</p><div className="flex flex-wrap justify-center gap-3"><button className="primary-game-button !w-auto" onClick={()=>void controller.retry()}>Coba Lagi</button><button className="secondary-cta !border-blue-200 !text-[#08264a]" onClick={onHome}>Kembali</button></div></div></main>;
  return <main id="main-content" className="min-h-screen bg-[#f6f4ef] text-[#17384b]"><header className="game-header flat-header"><button className="brand-button" onClick={onHome}><span className="he-logo he-logo-small">HE</span><span><b>Game Edukasi</b><small>Latihan UKP Pajak Level A</small></span></button><div className="flex items-center gap-2"><span className={`mode-badge mode-light ${controller.mode==="online"?"mode-online":""}`}>{controller.mode.toUpperCase()}</span><button className="icon-button" onClick={controller.toggleMute} aria-label={controller.muted?"Aktifkan suara":"Matikan suara"}>{controller.muted?"🔇":"🔊"}</button></div></header>
    <div className="mx-auto max-w-[1500px] px-3 py-3 sm:px-5 sm:py-5"><section className="hud-grid" aria-label="Status permainan"><div><span>Tangga</span><b>{session?.position??0}<small>/{GAME_CONFIG.stairCount}</small></b></div><div><span>Skor</span><b>{session?.score??0}<small>/{GAME_CONFIG.stairCount}</small></b></div><div><span>Nyawa</span><b className="text-rose-600">♥ {session?.lives??GAME_CONFIG.startLives}</b></div><div><span>Salah</span><b>{session?.wrongCount??0}</b></div><div><span>Waktu jawab</span><b>{Math.floor((session?.totalAnswerMs??0)/60000)}:{String(Math.floor((session?.totalAnswerMs??0)/1000)%60).padStart(2,"0")}</b></div></section>
      <div className="game-grid mt-3 sm:mt-5"><div className="scene-panel flat-scene-panel"><JourneyScene2D position={session?.position??0} motion={controller.state.motion} playerName={playerName}/></div><QuizPanel controller={controller}/></div>
    </div>{(controller.state.phase==="won"||controller.state.phase==="lost"||controller.state.phase==="claimed")&&<ResultPanel controller={controller} playerName={playerName} onHall={onHall} onReplay={onReplay}/>}</main>;
}
