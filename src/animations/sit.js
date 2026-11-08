import {lerpRotation} from './rig.js';
export function animateSit(rig,k){rig.legs.forEach((o,i)=>{const b=rig.base.get(o);lerpRotation(o,'x',(b?.rotation.x||0)-.95,k);});rig.body.forEach(o=>{const b=rig.base.get(o);lerpRotation(o,'x',(b?.rotation.x||0)+.18,k);});}
