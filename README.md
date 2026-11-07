# TCS Mascot 3D Studio

Interactive browser-based 3D mascot viewer for The Choco Studios.

## Live application

https://tcs-maskot-motion.vercel.app/

## Run locally

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

## Interactive features

- Real-time Three.js geometry, not a rotating 2D sprite.
- Orbit camera with front, side and rear views.
- Six facial expressions: happy, wink, surprised, sleepy, angry and sad.
- Four body poses: idle, wave, cheer and sit.
- Automatic blinking that preserves the active expression, including the wink state.
- Independent idle motion and 360-degree turntable rotation.
- Background color control and one-click character reset.
- Responsive layout and low-power rendering settings for modest hardware.
- WebGL failure handling and recovery after graphics-context loss.

## Animation and maintenance

The mascot is composed of independent geometry groups for the head, eyes, eyelids, brows, mouth, ears, hoodie, arms, legs and tail.

Expression logic, pose logic, blinking and idle animation are isolated in `src/mascot.js`. The viewer lifecycle, camera, controls and UI events are handled in `src/main.js`. Fixes should be applied to the affected component rather than replacing the whole mascot model.

Recent stability fixes:
- Separated eye feature scaling from eyelid geometry so blinking does not distort the whole eye assembly.
- Preserved expression-specific eye openness during automatic blinking.
- Fixed pose/idle vertical-position conflicts, especially when switching into and out of the sitting pose.
- Made cheek opacity respond correctly to expression changes.
- Reduced renderer cost by disabling real-time shadow maps, limiting device pixel ratio and reducing primitive geometry detail.
- Added WebGL fallback messaging, context-loss recovery and tab-visibility handling.

## Reference

The existing character-sheet artwork is retained in the repository as the visual reference. Geometry refinement should continue against the original front, side and rear reference views.