const TAU = Math.PI * 2;

const DEFAULTS = Object.freeze({
  bobAmplitude: 0.006,
  bobFrequency: 1.15,
  yawAmplitude: 0.012,
  yawFrequency: 0.62,
  phaseOffset: Math.PI * 0.25
});

/**
 * Idle is deliberately applied to one parent Group only.
 * The imported GLB remains intact: all original mesh nodes retain their
 * original parent, local transform, material and geometry.
 */
export function createIdleMotion(target, options = {}) {
  if (!target?.isObject3D) {
    throw new TypeError('createIdleMotion membutuhkan THREE.Object3D.');
  }

  const settings = { ...DEFAULTS, ...options };
  const basePosition = target.position.clone();
  const baseRotation = target.rotation.clone();
  let elapsed = 0;
  let enabled = true;

  function update(deltaSeconds) {
    if (!Number.isFinite(deltaSeconds) || deltaSeconds <= 0) return;
    elapsed = (elapsed + Math.min(deltaSeconds, 0.05)) % 100000;

    if (!enabled) {
      target.position.copy(basePosition);
      target.rotation.copy(baseRotation);
      return;
    }

    const breath = Math.sin(elapsed * TAU * settings.bobFrequency + settings.phaseOffset);
    const sway = Math.sin(elapsed * TAU * settings.yawFrequency);

    // Vertical movement remains above the base position, avoiding floor penetration.
    target.position.set(
      basePosition.x,
      basePosition.y + settings.bobAmplitude * (0.5 + 0.5 * breath),
      basePosition.z
    );
    target.rotation.set(
      baseRotation.x,
      baseRotation.y + settings.yawAmplitude * sway,
      baseRotation.z
    );
  }

  function reset() {
    elapsed = 0;
    target.position.copy(basePosition);
    target.rotation.copy(baseRotation);
  }

  return {
    update,
    reset,
    setEnabled(value) {
      enabled = Boolean(value);
      if (!enabled) reset();
    },
    get enabled() {
      return enabled;
    },
    get elapsed() {
      return elapsed;
    }
  };
}
