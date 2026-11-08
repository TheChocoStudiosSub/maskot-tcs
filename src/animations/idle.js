import {lerpRotation,pulse} from './rig.js';
export function animateIdle(model,rig,t,k){model.position.y+=pulse(t,2.1)*.012;rig.head.forEach(o=>lerpRotation(o,'z',pulse(t,1.1)*.025,k));rig.tail.forEach(o=>{lerpRotation(o,'x',pulse(t,2.8)*.16,k);lerpRotation(o,'z',pulse(t,1.8)*.1,k);});rig.body.forEach(o=>lerpRotation(o,'x',pulse(t,1.8)*.018,k));}
