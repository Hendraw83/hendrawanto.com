export const PLAYER_NAME_STORAGE_KEY="he-ukp-player-name-v1";
export const PLAYER_NAME_MAX_LENGTH=18;

export function filterPlayerNameInput(value:string){
  return value.replace(/[<>\u0000-\u001f]/g,"").replace(/\s{2,}/g," ").slice(0,PLAYER_NAME_MAX_LENGTH);
}

export function normalizePlayerName(value:string){
  return filterPlayerNameInput(value).trim();
}

export function displayPlayerName(value:string){
  return normalizePlayerName(value)||"AvatarMu";
}

export function readStoredPlayerName(){
  try{return normalizePlayerName(localStorage.getItem(PLAYER_NAME_STORAGE_KEY)??"");}catch{return "";}
}

export function savePlayerName(value:string){
  const normalized=normalizePlayerName(value);
  try{localStorage.setItem(PLAYER_NAME_STORAGE_KEY,normalized);}catch{}
  return normalized;
}
