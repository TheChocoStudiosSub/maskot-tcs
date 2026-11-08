import {lerpRotation,pulse} from './rig.js';
export function animateJump(model,rig,t){const phase=(t%1.05)/1.05;model.position.y+=phase<.48?Math.sin(phase/.48*Math.PI)*.62:0;rig.arms.forEach((o,i)=>{const b=rig.base.get(o);lerpRotation(o,'z',(b?.rotation.z||0)+(i%2?-.85:.85),.24);});}
