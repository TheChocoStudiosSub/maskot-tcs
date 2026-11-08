export const CONFIG = Object.freeze({
  model: { maxDisplaySize: 2.9, cameraFov: 34, cameraNear: 0.1, cameraFar: 80, pixelRatioMax: 1.25 },
  rig: {
    torsoPivotRatio: 0.58, hipsPivotRatio: 0.37, headPivotRatio: 0.18,
    shoulderInsetRatio: 0.16, shoulderHeightRatio: 0.08, earPivotRatio: 0.12
  },
  animation: {
    damping: 11, idleBob: 0.018, idleBreath: 0.018, walkFrequency: 7.2,
    walkStride: 0.48, walkArmSwing: 0.32, walkBounce: 0.038,
    jumpHeight: 0.62, jumpDuration: 1.05, sitLegAngle: -0.95,
    sitTorsoAngle: 0.16, waveAngle: 1.35, waveFrequency: 7.5,
    cheerAngle: 1.85, idleTailX: 0.13, idleTailZ: 0.09,
    blinkIntervalMin: 2.2, blinkIntervalMax: 4.6
  },
  debug: { query: "debug", panelWidth: 320, pivotSize: 0.045, reportMaxHeight: 180 },
  render: { idleFps: 30, hiddenPause: true }
});
