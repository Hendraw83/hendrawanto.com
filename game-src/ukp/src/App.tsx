import {lazy,Suspense,useState} from "react";
import {readStoredLevel,saveSelectedLevel} from "./config/levels";
import type {GameLevel} from "./game/types";
import {HallOfFame} from "./components/HallOfFame";
import {InstructionsScreen} from "./components/InstructionsScreen";
import {OpeningScreen} from "./components/OpeningScreen";
import {useGameController} from "./hooks/useGameController";
import {filterPlayerNameInput,normalizePlayerName,readStoredPlayerName,savePlayerName} from "./player/playerName";

type View="opening"|"instructions"|"game"|"hall";
const GameScreen=lazy(()=>import("./components/GameScreen").then(module=>({default:module.GameScreen})));
function GameLoading(){return <main className="connection-page" aria-live="polite"><div className="connection-card"><span className="spinner spinner-blue"/><p>Menyiapkan perjalanan AvatarMu…</p></div></main>;}
export default function App(){
  const [level,setLevel]=useState<GameLevel>(readStoredLevel);
  const [playerName,setPlayerName]=useState(readStoredPlayerName);
  function changeLevel(next:GameLevel){saveSelectedLevel(next);setLevel(next);try{const url=new URL(window.location.href);if(url.searchParams.has("level")){url.searchParams.delete("level");window.history.replaceState(window.history.state,"",url.pathname+url.search+url.hash);}}catch{/* abaikan */}}
  return <LevelGame key={level} level={level} onLevelChange={changeLevel} playerName={playerName} setPlayerName={setPlayerName}/>;
}
function LevelGame({level,onLevelChange,playerName,setPlayerName}:{level:GameLevel;onLevelChange:(value:GameLevel)=>void;playerName:string;setPlayerName:(value:string)=>void}){
  const controller=useGameController(level);
  const [view,setView]=useState<View>("opening"),[hallReturn,setHallReturn]=useState<View>("opening");
  const normalizedName=normalizePlayerName(playerName),canStart=normalizedName.length>=2;
  async function start(){if(!canStart){setView("opening");return;}const saved=savePlayerName(normalizedName);setPlayerName(saved);setView("game");await controller.start(saved);}
  function hall(from:View){setHallReturn(from);setView("hall");}
  async function replay(){await controller.reset(normalizedName);setView("game");await controller.start(normalizedName);}
  if(view==="instructions")return <InstructionsScreen level={level} canStart={canStart} onBack={()=>setView("opening")} onStart={()=>void start()}/>;
  if(view==="hall")return <HallOfFame controller={controller} onBack={()=>setView(hallReturn)}/>;
  if(view==="game")return <Suspense fallback={<GameLoading/>}><GameScreen controller={controller} playerName={normalizedName} onHall={()=>hall("game")} onReplay={()=>void replay()} onHome={()=>setView("opening")}/></Suspense>;
  return <OpeningScreen level={level} onLevelChange={onLevelChange} mode={controller.mode} busy={controller.state.phase==="checking"} playerName={playerName} onPlayerNameChange={value=>setPlayerName(filterPlayerNameInput(value))} onStart={()=>void start()} onInstructions={()=>setView("instructions")} onHall={()=>hall("opening")}/>;
}
