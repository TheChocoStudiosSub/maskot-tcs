import * as THREE from 'three';
import { CONFIG } from '../../../config.js';

export function getPose(rig, time) {
  const transforms = new Map();
  const wave = Math.sin(time * 1.15);
  if (rig.head) transforms.set(rig.head, { z: wave * 0.018, x: Math.sin(time * 0.7) * 0.012 });
  rig.ears.forEach((ear, index) => transforms.set(ear, { z: Math.sin(time * 1.7 + index * Math.PI) * 0.025 }));
  rig.tail.forEach((tail, index) => transforms.set(tail, {
    x: Math.sin(time * 2.5 - index * 0.35) * CONFIG.animation.idleTailX,
    z: Math.sin(time * 1.7 - index * 0.25) * CONFIG.animation.idleTailZ
  }));
  if (rig.torso) transforms.set(rig.torso, { x: Math.sin(time * 2.1) * CONFIG.animation.idleBreath });
  return { modelY: Math.sin(time * 2.1) * CONFIG.animation.idleBob, transforms };
}
