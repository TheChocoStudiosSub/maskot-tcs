import { CONFIG } from '../../../config.js';

export function getPose(rig, time) {
  const transforms = new Map();
  const progress = Math.min(1, Math.max(0, time / CONFIG.animation.jumpDuration));
  const lift = Math.sin(progress * Math.PI);
  for (const [side, arm] of Object.entries(rig.armSides)) {
    if (arm) transforms.set(arm, { z: (side === 'L' ? -1 : 1) * (0.95 + lift * 0.28), x: -0.18 });
  }
  for (const [side, leg] of Object.entries(rig.legSides)) {
    if (leg) transforms.set(leg, { x: -0.35 - lift * 0.32, z: (side === 'L' ? -1 : 1) * 0.08 });
  }
  rig.ears.forEach((ear, index) => transforms.set(ear, { z: (index === 0 ? -1 : 1) * lift * 0.12 }));
  rig.tail.forEach((tail, index) => transforms.set(tail, { x: -lift * (0.16 - index * 0.015) }));
  return { modelY: lift * CONFIG.animation.jumpHeight, transforms, complete: progress >= 1 };
}
