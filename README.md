# TCS Mascot 3D Studio

Interactive browser-based 3D mascot viewer for The Choco Studios.

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

## Features
- Real-time Three.js 3D geometry, not a rotating 2D sprite.
- Orbit camera with front, side and rear views.
- Six facial expressions: happy, wink, surprised, sleepy, angry and sad.
- Four body poses: idle, wave, cheer and sit.
- Independent automatic blinking, idle motion and turntable rotation.
- Responsive layout and low-power WebGL renderer settings.

## Model structure
The mascot is composed of independent geometry groups for head, eyes, lids, brows, mouth, ears, hoodie, arms, legs and tail. Expression and pose functions are isolated in `src/mascot.js`, so a defect in one feature can be corrected without replacing the whole model.

## Reference
The existing repository character sheet remains preserved as the visual reference. This first geometry pass establishes the character's proportions and controls; detailed sculpt refinement should be made against the original reference views.
