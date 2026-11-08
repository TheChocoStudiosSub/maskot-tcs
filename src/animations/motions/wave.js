import { CONFIG } from '../../../config.js';

export function getPose(rig, time) {
  const transforms = new Map();
  for (const [side, arm] of Object.entries(rig.armSides)) {
    if (!arm) continue;
    const direction = side === 'L' ? -1 : 1;
    transforms.set(arm, side === 'R'
      ? { z: CONFIG.animation.waveAngle + Math.sin(time * CONFIG.animation.waveFrequency) * 0.28, x: -0.18 }
      : { z: -0.08, x: 0.02 });
  }
  if (rig.head) transforms.set(rig.head, { z: Math.sin(time * 2) * 0.045 });
  rig.ears.forEach((ear, index) => transforms.set(ear, { z: Math.sin(time * 3 + index) * 0.035 }));
  return { modelY: 0, transforms };
}
