import { CONFIG } from '../../../config.js';

export function getPose(rig) {
  const transforms = new Map();
  for (const [side, leg] of Object.entries(rig.legSides)) {
    if (leg) transforms.set(leg, { x: CONFIG.animation.sitLegAngle, z: (side === 'L' ? -1 : 1) * 0.08 });
  }
  if (rig.torso) transforms.set(rig.torso, { x: CONFIG.animation.sitTorsoAngle });
  if (rig.head) transforms.set(rig.head, { x: -0.035 });
  rig.tail.forEach(tail => transforms.set(tail, { x: 0.12 }));
  return { modelY: 0, transforms };
}
