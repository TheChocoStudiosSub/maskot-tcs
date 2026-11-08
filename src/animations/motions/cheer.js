import { CONFIG } from '../../../config.js';

export function getPose(rig, time) {
  const transforms = new Map();
  for (const [side, arm] of Object.entries(rig.armSides)) {
    if (arm) transforms.set(arm, { z: (side === 'L' ? -1 : 1) * CONFIG.animation.cheerAngle, x: -0.22 + Math.sin(time * 4) * 0.035 });
  }
  if (rig.torso) transforms.set(rig.torso, { x: Math.sin(time * 4) * 0.035 });
  rig.tail.forEach((tail, index) => transforms.set(tail, { x: Math.sin(time * 4 - index * 0.4) * 0.18 }));
  rig.ears.forEach((ear, index) => transforms.set(ear, { z: (index === 0 ? -1 : 1) * 0.1 }));
  return { modelY: Math.abs(Math.sin(time * 4)) * 0.035, transforms };
}
