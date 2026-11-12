import type {GameLevel} from "../game/types";

export const LEVEL_CONFIG={
  A:{bankSize:300,questionCount:100,description:"Pajak orang pribadi"},
  B:{bankSize:300,questionCount:100,description:"Pajak badan"},
  C:{bankSize:300,questionCount:100,description:"Pajak lanjutan & internasional"},
} as const;

/** Artikel panduan per tingkat UKP di hendrawanto.com (tautan dari game). */
export const LEVEL_ARTICLE:Record<GameLevel,{href:string;title:string}>={
  A:{href:"/artikel/ukp-tingkat-a-materi-aturan-strategi-2026/",title:"Panduan UKP Tingkat A: materi, aturan, dan strategi"},
  B:{href:"/artikel/ukp-tingkat-b-materi-pph-badan-akuntansi-pajak-2026/",title:"Panduan UKP Tingkat B: PPh Badan dan rekonsiliasi"},
  C:{href:"/artikel/ukp-tingkat-c-pajak-internasional-but-transfer-pricing-2026/",title:"Panduan UKP Tingkat C: pajak internasional dan BUT"},
};

const LEVEL_KEY="he-ukp-selected-level-v1";
export const supportsAdvancedLevels=import.meta.env.VITE_GAME_MODE==="supabase";
function readUrlLevel():GameLevel|null{
  try{
    const value=new URLSearchParams(window.location.search).get("level")?.toUpperCase();
    if(value==="A")return "A";
    if(supportsAdvancedLevels&&(value==="B"||value==="C"))return value;
  }catch{/* abaikan parameter yang tidak valid */}
  return null;
}
export function readStoredLevel():GameLevel{
  const fromUrl=readUrlLevel();
  if(fromUrl){saveSelectedLevel(fromUrl);return fromUrl;}
  try{
    const stored=localStorage.getItem(LEVEL_KEY);
    return supportsAdvancedLevels&&(stored==="B"||stored==="C")?stored:"A";
  }
  catch{return "A";}
}
export function saveSelectedLevel(level:GameLevel){
  try{localStorage.setItem(LEVEL_KEY,level);}catch{/* tetap dapat bermain tanpa penyimpanan */}
}

