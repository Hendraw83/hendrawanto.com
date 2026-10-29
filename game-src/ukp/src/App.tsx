import {lazy,Suspense,useState} from "react";
import {HallOfFame} from "./components/HallOfFame";
import {InstructionsScreen} from "./components/InstructionsScreen";
import {OpeningScreen} from "./components/OpeningScreen";
import {useGameController} from "./hooks/useGameController";
import {filterPlayerNameInput,normalizePlayerName,readStoredPlayerName,savePlayerName} from "./player/playerName";

type View="opening"|"instructions"|"game"|"hall";
const GameScreen=lazy(()=>import("./components/GameScreen").then(module=>({default:module.GameScreen})));
function GameLoading(){return <main className="connection-page" aria-live="polite"><div className="connection-card"><span className="spinner spinner-blue"/><p>Menyiapkan perjalanan AvatarMu…</p></div></main>;}
export default function App(){
  const controller=useGameController();
  const [view,setView]=useState<View>("opening"),[hallReturn,setHallReturn]=useState<View>("opening");
  const [playerName,setPlayerName]=useState(readStoredPlayerName);
  const normalizedName=normalizePlayerName(playerName),canStart=normalizedName.length>=2;
  async function start(){if(!canStart){setView("opening");return;}const saved=savePlayerName(normalizedName);setPlayerName(saved);setView("game");await controller.start();}
  function hall(from:View){setHallReturn(from);setView("hall");}
  async function replay(){await controller.reset();setView("game");await controller.start();}
  if(view==="instructions")return <InstructionsScreen canStart={canStart} onBack={()=>setView("opening")} onStart={()=>void start()}/>;
  if(view==="hall")return <HallOfFame controller={controller} onBack={()=>setView(hallReturn)}/>;
  if(view==="game")return <Suspense fallback={<GameLoading/>}><GameScreen controller={controller} playerName={normalizedName} onHall={()=>hall("game")} onReplay={()=>void replay()} onHome={()=>setView("opening")}/></Suspense>;
  return <OpeningScreen mode={controller.mode} busy={controller.state.phase==="checking"} playerName={playerName} onPlayerNameChange={value=>setPlayerName(filterPlayerNameInput(value))} onStart={()=>void start()} onInstructions={()=>setView("instructions")} onHall={()=>hall("opening")}/>;
}
