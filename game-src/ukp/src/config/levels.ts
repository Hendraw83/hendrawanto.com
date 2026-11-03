import type {GameLevel} from "../game/types";

export const LEVEL_CONFIG={
  A:{bankSize:200,questionCount:100,description:"Pajak orang pribadi"},
  B:{bankSize:100,questionCount:100,description:"Pajak badan"},
} as const;

const LEVEL_KEY="he-ukp-selected-level-v1";
export const supportsLevelB=import.meta.env.VITE_GAME_MODE==="supabase";
export function readStoredLevel():GameLevel{
  try{return supportsLevelB&&localStorage.getItem(LEVEL_KEY)==="B"?"B":"A";}
  catch{return "A";}
}
export function saveSelectedLevel(level:GameLevel){
  try{localStorage.setItem(LEVEL_KEY,level);}catch{/* tetap dapat bermain tanpa penyimpanan */}
}
