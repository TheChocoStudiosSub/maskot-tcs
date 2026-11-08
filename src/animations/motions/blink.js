// Facial blink is intentionally isolated from body motion.
// The segmented GLB currently has no morph targets or eyelid mesh groups,
// so this module exposes a safe timing curve without scaling or hiding eye meshes.
export function getBlinkAmount(elapsed, interval = 3.4) {
  const phase = elapsed % interval;
  return phase < 0.14 ? Math.sin((phase / 0.14) * Math.PI) : 0;
}
