import {Canvas,useFrame,useThree} from "@react-three/fiber";
import {Suspense,useMemo} from "react";
import * as THREE from "three";
import type {MotionCue} from "../game/types";
import {PetHE} from "./PetHE";
import {stepPosition} from "./sceneMath";
import {World} from "./World";

function CameraRig({position,motion,reducedMotion}:{position:number;motion:MotionCue;reducedMotion:boolean}){
  const {camera}=useThree();
  const target=useMemo(()=>new THREE.Vector3(),[]);
  useFrame((_,delta)=>{
    const focus=stepPosition(motion==="parachute"?0:position);
    target.copy(focus).add(new THREE.Vector3(motion==="victory"?2.4:4.5,motion==="victory"?2.5:3.2,motion==="victory"?4.2:6.2));
    camera.position.lerp(target,reducedMotion?1:1-Math.exp(-2.8*delta));
    camera.lookAt(focus.x,focus.y+.75,focus.z-.3);
  });
  return null;
}
function Confetti({active}:{active:boolean}){
  const points=useMemo(()=>{const values=new Float32Array(180);for(let i=0;i<values.length;i+=3){values[i]=(Math.random()-.5)*4;values[i+1]=Math.random()*4;values[i+2]=(Math.random()-.5)*3;}return values;},[]);
  const geometry=useMemo(()=>{const g=new THREE.BufferGeometry();g.setAttribute("position",new THREE.BufferAttribute(points,3));return g;},[points]);
  if(!active)return null;
  return <points geometry={geometry}><pointsMaterial color="#ffd166" size={.09} sizeAttenuation transparent opacity={.9}/></points>;
}
function Scene({position,motion,reducedMotion,quality}:{position:number;motion:MotionCue;reducedMotion:boolean;quality:"low"|"high"}){
  const target=stepPosition(motion==="parachute"?0:position).add(new THREE.Vector3(0,.25,0));
  return <><World position={position} quality={quality} reducedMotion={reducedMotion}/><PetHE target={target} motion={motion} reducedMotion={reducedMotion}/><Confetti active={motion==="victory"&&!reducedMotion}/><CameraRig position={position} motion={motion} reducedMotion={reducedMotion}/></>;
}
export function supportsWebGL(){try{const canvas=document.createElement("canvas");return Boolean(canvas.getContext("webgl2")||canvas.getContext("webgl"));}catch{return false;}}
export function GameScene(props:{position:number;motion:MotionCue;reducedMotion:boolean;quality:"low"|"high"}){
  if(!supportsWebGL())return <div className="webgl-fallback" role="img" aria-label={`AvatarMu berada di tangga ${props.position}`}><strong>Mode 3D tidak tersedia</strong><span>Permainan tetap dapat dilanjutkan melalui panel soal.</span><div className="fallback-progress"><span style={{width:`${props.position}%`}}/></div><b>Tangga {props.position} / 100</b></div>;
  return <Canvas shadows={props.quality==="high"} dpr={props.quality==="high"?[1,1.6]:1} gl={{antialias:props.quality==="high",powerPreference:"high-performance"}} camera={{position:[4.5,3.2,6.2],fov:48,near:.1,far:130}}>
    <Suspense fallback={null}><Scene {...props}/></Suspense>
  </Canvas>;
}
