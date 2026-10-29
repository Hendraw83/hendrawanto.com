import {useEffect,useRef,useState} from "react";

export function useCountdown(input:{deadlineAt:number|null;turnId:string|null;active:boolean;totalSeconds:number;warningAt:number;onWarning:(seconds:number)=>void;onTimeout:()=>void}){
  const [remainingMs,setRemainingMs]=useState(()=>input.deadlineAt?Math.max(0,input.deadlineAt-Date.now()):0);
  const timeoutTurn=useRef<string|null>(null);
  const warningKey=useRef("");
  useEffect(()=>{
    if(!input.active||!input.deadlineAt||!input.turnId){setRemainingMs(0);return;}
    const tick=()=>{
      const next=Math.max(0,input.deadlineAt!-Date.now());
      setRemainingMs(next);
      const seconds=Math.ceil(next/1000);
      const key=`${input.turnId}:${seconds}`;
      if(seconds>0&&seconds<=input.warningAt&&warningKey.current!==key){warningKey.current=key;input.onWarning(seconds);}
      if(next===0&&timeoutTurn.current!==input.turnId){timeoutTurn.current=input.turnId;input.onTimeout();}
    };
    tick();const timer=window.setInterval(tick,200);
    return()=>window.clearInterval(timer);
  },[input.active,input.deadlineAt,input.turnId,input.warningAt,input.onWarning,input.onTimeout]);
  return {remainingMs,seconds:Math.ceil(remainingMs/1000),ratio:input.deadlineAt?Math.min(1,remainingMs/(input.totalSeconds*1000)):0};
}
