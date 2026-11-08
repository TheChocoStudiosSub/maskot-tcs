import {lerpRotation,pulse} from './rig.js';
export function animateCheer(rig,t,k){rig.arms.forEach((o,i)=>{const b=rig.base.get(o);lerpRotation(o,'z',(b?.rotation.z||0)+(i%2?-.95:.95)+pulse(t,4)*.12,k);});rig.body.forEach(o=>lerpRotation(o,'z',pulse(t,4)*.035,k));}
