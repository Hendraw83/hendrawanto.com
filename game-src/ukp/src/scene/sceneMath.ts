import * as THREE from "three";

export function stepPosition(step:number){
  const safe=Math.max(0,Math.min(100,step));
  return new THREE.Vector3(Math.sin(safe*.22)*1.15,safe*.23,-safe*.62);
}
