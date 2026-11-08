import * as THREE from 'three';
import { CONFIG } from '../../config.js';
import { getPose as idlePose } from './motions/idle.js';
import { getPose as walkPose } from './motions/walk.js';
import { getPose as jumpPose } from './motions/jump.js';
import { getPose as sitPose } from './motions/sit.js';
import { getPose as wavePose } from './motions/wave.js';
import { getPose as cheerPose } from './motions/cheer.js';

const MOTIONS = { idle: idlePose, walk: walkPose, jump: jumpPose, sit: sitPose, wave: wavePose, cheer: cheerPose };

export function createAnimationController(model, rig, onMotionChange = () => {}) {
  const base = new Map(rig.pivots.map(pivot => [pivot, pivot.rotation.clone()]));
  const baseModelY = model.position.y;
  let motion = 'idle';
  let elapsed = 0;
  let idleEnabled = true;

  function setMotion(name) {
    if (!MOTIONS[name]) return false;
    motion = name;
    elapsed = 0;
    onMotionChange(name);
    return true;
  }

  function update(dt) {
    if (!Number.isFinite(dt) || dt <= 0) return;
    elapsed += Math.min(dt, 0.05);
    const active = motion === 'idle' && !idleEnabled ? 'still' : motion;
    const pose = active === 'still' ? { modelY: 0, transforms: new Map() } : MOTIONS[active](rig, elapsed);
    const smoothing = CONFIG.animation.damping;
    for (const pivot of rig.pivots) {
      const origin = base.get(pivot);
      const offset = pose.transforms.get(pivot) || {};
      pivot.rotation.x = THREE.MathUtils.damp(pivot.rotation.x, origin.x + (offset.x || 0), dt, smoothing);
      pivot.rotation.y = THREE.MathUtils.damp(pivot.rotation.y, origin.y + (offset.y || 0), dt, smoothing);
      pivot.rotation.z = THREE.MathUtils.damp(pivot.rotation.z, origin.z + (offset.z || 0), dt, smoothing);
    }
    model.position.y = THREE.MathUtils.damp(model.position.y, baseModelY + (pose.modelY || 0), dt, smoothing);
    if (motion === 'jump' && pose.complete) setMotion('idle');
  }

  function reset() {
    rig.pivots.forEach(pivot => pivot.rotation.copy(base.get(pivot)));
    model.position.y = baseModelY;
    setMotion('idle');
  }

  return {
    setMotion, update, reset,
    setIdleEnabled(value) { idleEnabled = Boolean(value); },
    get motion() { return motion; },
    get elapsed() { return elapsed; }
  };
}
