import {useCallback,useMemo,useReducer,useRef,useState} from "react";
import {audioManager} from "../audio/audioManager";
import {GAME_CONFIG} from "../config/gameConfig";
import {initialMachineState,machineReducer} from "../game/machine";
import {randomId} from "../game/random";
import type {ClaimInput,LeaderboardEntry} from "../game/types";
import {createBackend} from "../services/backend";
import {useCountdown} from "./useCountdown";

export function useGameController(){
  const backend=useMemo(()=>createBackend(),[]);
  const [state,dispatch]=useReducer(machineReducer,initialMachineState);
  const [muted,setMuted]=useState(false);
  const pending=useRef(false);

  const fail=useCallback((error:unknown)=>{dispatch({type:"ERROR",message:error instanceof Error?error.message:"Koneksi permainan terputus."});},[]);
  const start=useCallback(async()=>{
    if(pending.current)return;pending.current=true;dispatch({type:"START"});
    try{await audioManager.enable();const session=await backend.startOrResumeSession();dispatch({type:"SESSION",session});}
    catch(error){fail(error);}finally{pending.current=false;}
  },[backend,fail]);
  const select=useCallback((optionId:string)=>dispatch({type:"SELECT",optionId}),[]);
  const submit=useCallback(async(selectedOptionId:string|null=state.selectedOptionId)=>{
    const session=state.session;
    if(pending.current||state.phase!=="answering"||!session?.turnId||!session.question)return;
    pending.current=true;dispatch({type:"SUBMIT"});
    try{
      const next=await backend.submitAnswer({sessionId:session.id,turnId:session.turnId,questionId:session.question.id,selectedOptionId,requestId:randomId()});
      void audioManager.play(next.feedback?.correct?"correct":"wrong");
      dispatch({type:"ANSWER",session:next});
      window.setTimeout(()=>dispatch({type:"ANIMATION_DONE"}),GAME_CONFIG.animationMs);
    }catch(error){fail(error);}finally{pending.current=false;}
  },[backend,fail,state.phase,state.selectedOptionId,state.session]);
  const next=useCallback(async()=>{
    const session=state.session;if(pending.current||state.phase!=="explanation"||!session)return;
    pending.current=true;dispatch({type:"NEXT"});
    try{
      const updated=await backend.nextQuestion({sessionId:session.id,requestId:randomId()});
      dispatch({type:"SESSION",session:updated});
      if(updated.phase==="won")void audioManager.play("win");
      if(updated.phase==="lost")void audioManager.play("lose");
    }catch(error){fail(error);}finally{pending.current=false;}
  },[backend,fail,state.phase,state.session]);
  const reset=useCallback(async()=>{await backend.resetSession();dispatch({type:"RESET"});},[backend]);
  const continueToSummit=useCallback(async()=>{
    const session=state.session;if(pending.current||!["won","claimed"].includes(state.phase)||!session)return;
    pending.current=true;dispatch({type:"CONTINUE"});
    try{const updated=await backend.continueToSummit({sessionId:session.id,requestId:randomId()});dispatch({type:"SESSION",session:updated});}
    catch(error){fail(error);}finally{pending.current=false;}
  },[backend,fail,state.phase,state.session]);
  const claim=useCallback(async(input:ClaimInput)=>{
    if(!state.session||state.phase!=="won")throw new Error("Kemenangan belum siap diklaim.");
    dispatch({type:"CLAIM"});
    try{const result=await backend.claimWin(state.session.id,input);dispatch({type:"CLAIMED",session:state.session});return result;}
    catch(error){fail(error);throw error;}
  },[backend,fail,state.phase,state.session]);
  const leaderboard=useCallback(()=>backend.getLeaderboard(),[backend]);
  const toggleMute=useCallback(()=>setMuted(value=>{audioManager.setMuted(!value);return !value;}),[]);
  const retry=useCallback(async()=>{dispatch({type:"RETRY"});await start();},[start]);
  const onWarning=useCallback(()=>{void audioManager.play("warning");},[]);
  const onTimeout=useCallback(()=>{void submit(null);},[submit]);
  const timer=useCountdown({deadlineAt:state.session?.deadlineAt??null,turnId:state.session?.turnId??null,active:state.phase==="answering",totalSeconds:GAME_CONFIG.answerSeconds,warningAt:GAME_CONFIG.warningSeconds,onWarning,onTimeout});

  return {state,mode:backend.mode,muted,timer,start,select,submit,next,continueToSummit,reset,claim,leaderboard,toggleMute,retry} as const;
}

export type GameController=ReturnType<typeof useGameController>;
export type {LeaderboardEntry};
