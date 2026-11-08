import { CONFIG } from '../../../config.js';

export function getPose(rig, time) {
  const transforms = new Map();
  const phase = time * CONFIG.animation.walkFrequency;
  for (const [side, leg] of Object.entries(rig.legSides)) {
    if (leg) transforms.set(leg, { x: Math.sin(phase + (side === 'L' ? 0 : Math.PI)) * CONFIG.animation.walkStride });
  }
  for (const [side, arm] of Object.entries(rig.armSides)) {
    if (arm) transforms.set(arm, { x: Math.sin(phase + (side === 'L' ? Math.PI : 0)) * CONFIG.animation.walkArmSwing });
  }
  if (rig.torso) transforms.set(rig.torso, { z: Math.sin(phase) * 0.018, x: Math.abs(Math.sin(phase)) * 0.018 });
  rig.tail.forEach((tail, index) => transforms.set(tail, { z: Math.sin(phase * 0.5 - index * 0.3) * 0.12 }));
  return { modelY: Math.abs(Math.sin(phase)) * CONFIG.animation.walkBounce, transforms };
}
