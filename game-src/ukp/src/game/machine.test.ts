import {describe,expect,it} from "vitest";
import {initialMachineState,machineReducer} from "./machine";
import type {SessionSnapshot} from "./types";

function session(overrides:Partial<SessionSnapshot>={}):SessionSnapshot{return {id:"s",phase:"answering",mode:"demo",score:0,correctCount:0,wrongCount:0,lives:41,position:0,questionIndex:1,questionCount:100,totalAnswerMs:0,startedAt:1,deadlineAt:61_000,turnId:"t",question:{id:"q",topic:"KUP",prompt:"?",sequence:1,options:[{id:"a",text:"A"},{id:"b",text:"B"},{id:"c",text:"C"},{id:"d",text:"D"}]},feedback:null,result:null,...overrides};}

describe("game state machine",()=>{
  it("mengunci pilihan saat jawaban dikirim",()=>{let state=machineReducer(initialMachineState,{type:"START"});state=machineReducer(state,{type:"SESSION",session:session()});state=machineReducer(state,{type:"SELECT",optionId:"a"});state=machineReducer(state,{type:"SUBMIT"});expect(state.phase).toBe("checking");expect(machineReducer(state,{type:"SELECT",optionId:"b"}).selectedOptionId).toBe("a");});
  it("timer/pilihan baru hanya aktif setelah Lanjut",()=>{let state=machineReducer({...initialMachineState,phase:"moving",session:session({phase:"feedback"})},{type:"ANIMATION_DONE"});expect(state.phase).toBe("explanation");state=machineReducer(state,{type:"NEXT"});expect(state.phase).toBe("checking");});
  it("mengizinkan pendakian lanjutan dari kemenangan atau klaim",()=>{const won=machineReducer(initialMachineState,{type:"SESSION",session:session({phase:"won"})});expect(machineReducer(won,{type:"CONTINUE"}).phase).toBe("checking");expect(machineReducer({...won,phase:"claimed"},{type:"CONTINUE"}).phase).toBe("checking");});
  it("menganggap puncak sebagai kemenangan",()=>{const state=machineReducer(initialMachineState,{type:"SESSION",session:session({phase:"summit",position:100})});expect(state.phase).toBe("won");expect(state.motion).toBe("victory");});
});
