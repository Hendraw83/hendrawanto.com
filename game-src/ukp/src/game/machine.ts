import type {MachineEvent,MachinePhase,MachineState,SessionSnapshot} from "./types";

export const initialMachineState:MachineState={phase:"ready",session:null,selectedOptionId:null,motion:"idle",error:null};

function phaseFromSession(session:SessionSnapshot):MachinePhase{
  if(session.phase==="won"||session.phase==="summit")return "won";
  if(session.phase==="lost")return "lost";
  if(session.phase==="feedback")return "explanation";
  return "answering";
}

export function machineReducer(state:MachineState,event:MachineEvent):MachineState{
  switch(event.type){
    case "START":
      if(!["ready","connectionError"].includes(state.phase))return state;
      return {...state,phase:"checking",error:null,motion:"idle"};
    case "SESSION":
      return {...state,phase:phaseFromSession(event.session),session:event.session,selectedOptionId:null,error:null,motion:event.session.phase==="won"||event.session.phase==="summit"?"victory":event.session.phase==="lost"?"parachute":"idle"};
    case "SELECT":
      return state.phase==="answering"?{...state,selectedOptionId:event.optionId}:state;
    case "SUBMIT":
      return state.phase==="answering"?{...state,phase:"checking",error:null}:state;
    case "ANSWER": {
      const cue=event.session.feedback?.correct?"climb":"disappointed";
      return {...state,phase:"moving",session:event.session,selectedOptionId:event.session.feedback?.selectedOptionId??state.selectedOptionId,motion:cue,error:null};
    }
    case "ANIMATION_DONE":
      return state.phase==="moving"?{...state,phase:"explanation",motion:state.session?.feedback?.correct?"celebrate":"disappointed"}:state;
    case "NEXT":
      return state.phase==="explanation"?{...state,phase:"checking",error:null}:state;
    case "CONTINUE":
      return state.phase==="won"||state.phase==="claimed"?{...state,phase:"checking",error:null,motion:"idle"}:state;
    case "CLAIM":
      return state.phase==="won"?{...state,phase:"claiming",error:null}:state;
    case "CLAIMED":
      return {...state,phase:"claimed",session:event.session,error:null,motion:"victory"};
    case "ERROR":
      return {...state,phase:"connectionError",error:event.message,motion:"idle"};
    case "RETRY":
      return state.phase==="connectionError"?{...state,phase:state.session?phaseFromSession(state.session):"ready",error:null}:state;
    case "RESET":
      return initialMachineState;
    default:
      return state;
  }
}

export const allowedActions:Record<MachinePhase,readonly string[]>={
  ready:["mulai","petunjuk","hall-of-fame"],
  answering:["pilih-jawaban","kunci-jawaban","mute"],
  checking:["mute"],
  moving:["mute"],
  explanation:["lanjut","baca-sumber","mute"],
  won:["klaim","lanjut-ke-puncak","hall-of-fame","main-lagi"],
  lost:["hall-of-fame","main-lagi"],
  claiming:["batal-klaim","kirim-klaim"],
  claimed:["lanjut-ke-puncak","hall-of-fame","main-lagi"],
  connectionError:["coba-lagi","kembali"],
};
