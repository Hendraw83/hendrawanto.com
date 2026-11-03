import type {GameLevel} from "../game/types";

export const LEVEL_CONFIG={
  A:{bankSize:200,questionCount:100,description:"Pajak orang pribadi"},
  B:{bankSize:100,questionCount:100,description:"Pajak badan"},
  C:{bankSize:300,questionCount:100,description:"Pajak lanjutan & internasional"},
} as const;

const LEVEL_KEY="he-ukp-selected-level-v1";
export const supportsAdvancedLevels=import.meta.env.VITE_GAME_MODE==="supabase";
export function readStoredLevel():GameLevel{
  try{
    const stored=localStorage.getItem(LEVEL_KEY);
    return supportsAdvancedLevels&&(stored==="B"||stored==="C")?stored:"A";
  }
  catch{return "A";}
}
export function saveSelectedLevel(level:GameLevel){
  try{localStorage.setItem(LEVEL_KEY,level);}catch{/* tetap dapat bermain tanpa penyimpanan */}
}

