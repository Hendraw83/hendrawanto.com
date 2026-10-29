import {Html} from "@react-three/drei";
import {useFrame} from "@react-three/fiber";
import {useMemo,useRef} from "react";
import * as THREE from "three";
import {GAME_CONFIG} from "../config/gameConfig";
import {stepPosition} from "./sceneMath";

function Clouds(){const clouds=useMemo(()=>Array.from({length:18},(_,i)=>({x:(i%5-2)*5+(i%2),y:4+(i%4)*2.6,z:-i*5-5,s:.7+(i%3)*.28})),[]);return <>{clouds.map((cloud,index)=><group key={index} position={[cloud.x,cloud.y,cloud.z]} scale={cloud.s}><mesh><sphereGeometry args={[1,16,10]}/><meshStandardMaterial color="#ffffff" transparent opacity={.72}/></mesh><mesh position={[1.1,-.15,.1]}><sphereGeometry args={[.72,16,10]}/><meshStandardMaterial color="#f3f8ff" transparent opacity={.68}/></mesh><mesh position={[-1,-.22,.05]}><sphereGeometry args={[.65,16,10]}/><meshStandardMaterial color="#ffffff" transparent opacity={.65}/></mesh></group>)}</>}
function Buildings(){return <group position={[0,0,4]}>{Array.from({length:9},(_,i)=>{const x=(i-4)*1.65,h=2.5+(i%4)*1.1;return <group key={i} position={[x,h/2,-Math.abs(i-4)*.35]}><mesh><boxGeometry args={[1.25,h,1.25]}/><meshStandardMaterial color={i%2?"#d7e8f5":"#c8dbe9"} roughness={.56} metalness={.08}/></mesh>{Array.from({length:Math.floor(h)},(_,j)=><mesh key={j} position={[0,j-h/2+.75,.64]}><boxGeometry args={[.75,.2,.02]}/><meshBasicMaterial color="#6aa7ce"/></mesh>)}</group>})}</group>}
function GateLeaf({side}:{side:-1|1}){return <group><mesh position={[side*.37,.62,0]} castShadow><boxGeometry args={[.7,1.22,.07]}/><meshStandardMaterial color="#f4cf63" metalness={.72} roughness={.23}/></mesh><mesh position={[side*.37,.62,.045]}><boxGeometry args={[.54,.98,.025]}/><meshStandardMaterial color="#fff0a6" metalness={.5}/></mesh>{[.27,.52,.77].map(y=><mesh key={y} position={[side*.37,y,.07]}><boxGeometry args={[.56,.035,.025]}/><meshStandardMaterial color="#a87113" metalness={.65}/></mesh>)}</group>}
function VictoryGate({open,reducedMotion}:{open:boolean;reducedMotion:boolean}){
  const p=stepPosition(GAME_CONFIG.winScore),left=useRef<THREE.Group>(null),right=useRef<THREE.Group>(null),light=useRef<THREE.PointLight>(null);
  useFrame((_,delta)=>{
    const leftTarget=open?-Math.PI*.48:0,rightTarget=open?Math.PI*.48:0,intensity=open?4.2:.35;
    if(left.current)left.current.rotation.y=reducedMotion?leftTarget:THREE.MathUtils.damp(left.current.rotation.y,leftTarget,5.5,delta);
    if(right.current)right.current.rotation.y=reducedMotion?rightTarget:THREE.MathUtils.damp(right.current.rotation.y,rightTarget,5.5,delta);
    if(light.current)light.current.intensity=reducedMotion?intensity:THREE.MathUtils.damp(light.current.intensity,intensity,4,delta);
  });
  return <group position={[p.x,p.y+.55,p.z-.12]}><pointLight ref={light} position={[0,.9,-.45]} color="#ffd767" intensity={.35} distance={5}/><mesh position={[-.82,.6,0]} castShadow><boxGeometry args={[.14,1.7,.18]}/><meshStandardMaterial color="#dca72d" metalness={.72}/></mesh><mesh position={[.82,.6,0]} castShadow><boxGeometry args={[.14,1.7,.18]}/><meshStandardMaterial color="#dca72d" metalness={.72}/></mesh><mesh position={[0,1.43,0]} castShadow><boxGeometry args={[1.78,.18,.2]}/><meshStandardMaterial color="#f3cf66" metalness={.7}/></mesh><group ref={left} position={[-.75,.02,0]}><GateLeaf side={1}/></group><group ref={right} position={[.75,.02,0]}><GateLeaf side={-1}/></group><Html position={[0,1.85,0]} center transform distanceFactor={5}><div className="scene-label scene-label-gold">GERBANG KEMENANGAN · 60 · {open?"TERBUKA":"TERKUNCI"}</div></Html></group>
}
export function Staircase({position,quality,reducedMotion}:{position:number;quality:"low"|"high";reducedMotion:boolean}){
  const steps=useMemo(()=>Array.from({length:GAME_CONFIG.stairCount+1},(_,i)=>({i,p:stepPosition(i)})),[]);
  const min=Math.max(0,position-4),max=Math.min(GAME_CONFIG.stairCount,position+(quality==="high"?9:6));
  return <group>{steps.map(({i,p})=><group key={i} position={p.toArray()}><mesh receiveShadow={quality==="high"}><boxGeometry args={[2.7,.22,.6]}/><meshStandardMaterial color={i===GAME_CONFIG.winScore?"#d9aa36":i<=position?"#2f74b5":"#eef5fb"} roughness={.55} metalness={i===GAME_CONFIG.winScore?.35:.04}/></mesh>{i>=min&&i<=max&&<Html position={[0,.2,.02]} center transform distanceFactor={4.6}><span className="step-number">{i}</span></Html>}</group>)}<VictoryGate open={position>=GAME_CONFIG.winScore} reducedMotion={reducedMotion}/></group>;
}
export function World({position,quality,reducedMotion}:{position:number;quality:"low"|"high";reducedMotion:boolean}){return <><color attach="background" args={["#9ed8ff"]}/><fog attach="fog" args={["#b9e4fb",14,66]}/><ambientLight intensity={1.15}/><directionalLight position={[7,14,9]} intensity={2.1} color="#fff3d5" castShadow={quality==="high"}/><hemisphereLight args={["#d8f1ff","#526b82",1.1]}/><Buildings/><Clouds/><Staircase position={position} quality={quality} reducedMotion={reducedMotion}/><mesh position={[0,-.2,0]} receiveShadow><cylinderGeometry args={[7,7.5,.45,48]}/><meshStandardMaterial color="#e9f4fb"/></mesh></>}
