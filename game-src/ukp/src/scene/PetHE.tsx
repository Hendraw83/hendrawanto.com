import {useFrame} from "@react-three/fiber";
import {useRef} from "react";
import * as THREE from "three";
import type {MotionCue} from "../game/types";

function Medal(){return <group position={[0,.2,.36]} rotation={[Math.PI/2,0,0]}><mesh><cylinderGeometry args={[.18,.18,.055,32]}/><meshStandardMaterial color="#f7c948" metalness={.75} roughness={.22}/></mesh><mesh position={[0,0,.035]}><torusGeometry args={[.11,.025,10,28]}/><meshStandardMaterial color="#fff0a8" metalness={.65}/></mesh></group>}

export function PetHE({target,motion,reducedMotion}:{target:THREE.Vector3;motion:MotionCue;reducedMotion:boolean}){
  const root=useRef<THREE.Group>(null),head=useRef<THREE.Group>(null),leftArm=useRef<THREE.Group>(null),rightArm=useRef<THREE.Group>(null);
  useFrame(({clock},delta)=>{
    if(!root.current)return;
    const t=clock.elapsedTime;
    const speed=reducedMotion?20:motion==="climb"?7:4.5;
    root.current.position.lerp(target,1-Math.exp(-speed*delta));
    root.current.position.y+=reducedMotion?0:Math.sin(t*3.2)*.008;
    const celebrate=motion==="celebrate"||motion==="victory";
    const disappointed=motion==="disappointed";
    root.current.scale.y=THREE.MathUtils.lerp(root.current.scale.y,disappointed?.78:1,1-Math.exp(-8*delta));
    if(head.current)head.current.rotation.y=reducedMotion?0:disappointed?Math.sin(t*10)*.18:0;
    if(leftArm.current)leftArm.current.rotation.z=THREE.MathUtils.lerp(leftArm.current.rotation.z,celebrate?2.35:.35,.12);
    if(rightArm.current)rightArm.current.rotation.z=THREE.MathUtils.lerp(rightArm.current.rotation.z,celebrate?-2.35:-.35,.12);
  });
  return <group ref={root} position={target.toArray()}>
    {motion==="parachute"&&<group position={[0,2.15,0]}><mesh scale={[1.55,.48,1]}><sphereGeometry args={[.85,24,12,0,Math.PI*2,0,Math.PI/2]}/><meshStandardMaterial color="#ffd166" roughness={.65}/></mesh><mesh position={[-.48,-.72,0]} rotation={[0,0,-.2]}><cylinderGeometry args={[.012,.012,1.5,6]}/><meshBasicMaterial color="#f7f2e8"/></mesh><mesh position={[.48,-.72,0]} rotation={[0,0,.2]}><cylinderGeometry args={[.012,.012,1.5,6]}/><meshBasicMaterial color="#f7f2e8"/></mesh></group>}
    <mesh position={[0,.78,0]}><capsuleGeometry args={[.28,.5,8,16]}/><meshStandardMaterial color="#0a315c" roughness={.58}/></mesh>
    <mesh position={[0,.77,.285]} scale={[.55,.82,.08]}><boxGeometry args={[.5,.52,.08]}/><meshStandardMaterial color="#f7f9fb"/></mesh>
    <mesh position={[0,.85,.35]} rotation={[0,0,Math.PI/4]}><boxGeometry args={[.13,.13,.04]}/><meshStandardMaterial color="#e7b83f" metalness={.35}/></mesh>
    <group ref={head} position={[0,1.35,0]}>
      <mesh><sphereGeometry args={[.39,28,20]}/><meshStandardMaterial color="#d99a72" roughness={.72}/></mesh>
      <mesh position={[0,.23,-.08]} scale={[1,.42,1]}><sphereGeometry args={[.4,24,16]}/><meshStandardMaterial color="#17222f"/></mesh>
      <mesh position={[-.145,.035,.35]}><sphereGeometry args={[.042,12,8]}/><meshBasicMaterial color="#101b28"/></mesh>
      <mesh position={[.145,.035,.35]}><sphereGeometry args={[.042,12,8]}/><meshBasicMaterial color="#101b28"/></mesh>
      <mesh position={[-.145,.04,.38]}><torusGeometry args={[.105,.014,8,20]}/><meshStandardMaterial color="#18324b" metalness={.25}/></mesh>
      <mesh position={[.145,.04,.38]}><torusGeometry args={[.105,.014,8,20]}/><meshStandardMaterial color="#18324b" metalness={.25}/></mesh>
      <mesh position={[0,.04,.39]}><boxGeometry args={[.09,.018,.018]}/><meshStandardMaterial color="#18324b"/></mesh>
      <mesh position={[0,-.12,.37]} rotation={[Math.PI/2,0,0]}><torusGeometry args={[.09,.014,8,20,Math.PI]}/><meshStandardMaterial color="#6e2e2e"/></mesh>
    </group>
    <group ref={leftArm} position={[-.35,1.02,0]} rotation={[0,0,.35]}><mesh position={[0,-.28,0]}><capsuleGeometry args={[.09,.4,6,10]}/><meshStandardMaterial color="#0a315c"/></mesh><mesh position={[0,-.56,0]}><sphereGeometry args={[.11,12,8]}/><meshStandardMaterial color="#d99a72"/></mesh></group>
    <group ref={rightArm} position={[.35,1.02,0]} scale={[-1,1,1]} rotation={[0,0,-.35]}><mesh position={[0,-.28,0]}><capsuleGeometry args={[.09,.4,6,10]}/><meshStandardMaterial color="#0a315c"/></mesh><mesh position={[0,-.56,0]}><sphereGeometry args={[.11,12,8]}/><meshStandardMaterial color="#d99a72"/></mesh></group>
    <mesh position={[-.16,.27,0]}><capsuleGeometry args={[.1,.28,6,10]}/><meshStandardMaterial color="#17283d"/></mesh>
    <mesh position={[.16,.27,0]}><capsuleGeometry args={[.1,.28,6,10]}/><meshStandardMaterial color="#17283d"/></mesh>
    {(motion==="victory")&&<Medal/>}
  </group>;
}
