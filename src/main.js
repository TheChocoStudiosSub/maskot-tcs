import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import './style.css';
import { discoverRig } from './animations/rig.js';
import { createAnimationController } from './animations/controller.js';
import { mountRigDebug } from '../debug.js';
import { CONFIG } from '../config.js';

const stage = document.querySelector('#stage');
const loading = document.querySelector('#loading');
const scene = new THREE.Scene();
scene.background = new THREE.Color('#080d2b');
scene.fog = new THREE.Fog('#080d2b', 10, 24);

const camera = new THREE.PerspectiveCamera(CONFIG.model.cameraFov, 1, CONFIG.model.cameraNear, CONFIG.model.cameraFar);
camera.position.set(0, 2.15, 7.8);
const renderer = new THREE.WebGLRenderer({
  antialias: false, alpha: false, powerPreference: 'low-power', stencil: false
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, CONFIG.model.pixelRatioMax));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;
renderer.shadowMap.enabled = false;
stage.prepend(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.075;
controls.minDistance = 3;
controls.maxDistance = 16;
controls.maxPolarAngle = Math.PI * 0.84;

scene.add(new THREE.HemisphereLight('#d7ddff', '#25204e', 2));
const key = new THREE.DirectionalLight('#fff4ff', 2.7);
key.position.set(3, 6, 5);
scene.add(key);
const rim = new THREE.PointLight('#685cff', 17, 11);
rim.position.set(-3, 2, -3);
scene.add(rim);
const fill = new THREE.PointLight('#48aaff', 6, 9);
fill.position.set(3, 1, 3);
scene.add(fill);

const floor = new THREE.Mesh(
  new THREE.CircleGeometry(8, 40),
  new THREE.MeshStandardMaterial({ color: '#101b4c', roughness: 0.9 })
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -0.03;
scene.add(floor);

const state = {
  model: null, rig: null, controller: null,
  motion: 'idle', expression: 'happy', autoRotate: false
};

function status(message) {
  const element = document.querySelector('#statusText');
  if (element) element.textContent = message;
}
function activate(selector, dataKey, value) {
  document.querySelectorAll(selector).forEach(button => {
    button.classList.toggle('active', button.dataset[dataKey] === value);
  });
}
function setMotion(name) {
  state.motion = name;
  state.controller?.setMotion(name);
  activate('[data-motion]', 'motion', name);
  status('ANIMASI: ' + name.toUpperCase());
}
function setExpression(name) {
  state.expression = name;
  activate('[data-expression]', 'expression', name);
  // The supplied GLB has no morph targets or facial rig. Keep the selector honest:
  // it records the selected expression without deforming unrelated geometry.
  status('EKSPRESI DIPILIH: ' + name.toUpperCase());
}
function cameraAt(position) {
  camera.position.set(...position);
  controls.target.set(0, 0.95, 0);
  controls.update();
}

function loadGLB() {
  const loader = new GLTFLoader();
  loader.load(
    'https://cdn.jsdelivr.net/gh/TheChocoStudiosSub/maskot-tcs@main/TCS_Mascot_3D.glb',
    gltf => {
      try {
        const model = gltf.scene;
        state.model = model;
        scene.add(model);

        const bounds = new THREE.Box3().setFromObject(model);
        const size = bounds.getSize(new THREE.Vector3());
        const center = bounds.getCenter(new THREE.Vector3());
        const maxDimension = Math.max(size.x, size.y, size.z) || 1;
        const scale = CONFIG.model.maxDisplaySize / maxDimension;
        model.scale.setScalar(scale);
        model.position.set(-center.x * scale, -bounds.min.y * scale, -center.z * scale);

        model.traverse(object => {
          if (!object.isMesh) return;
          object.frustumCulled = true;
          if (object.material) {
            object.material.side = THREE.FrontSide;
            if ('roughness' in object.material) {
              object.material.roughness = Math.max(0.35, object.material.roughness ?? 0.7);
            }
          }
        });

        state.rig = discoverRig(model);
        state.controller = createAnimationController(model, state.rig, name => {
          activate('[data-motion]', 'motion', name);
        });
        state.controller.setMotion(state.motion);
        mountRigDebug(state.rig);

        controls.target.set(0, 1.25, 0);
        camera.position.set(0, 2.15, 7.8);
        controls.update();

        const audit = state.rig.meshAudit;
        const info = document.querySelector('#rigInfo');
        info.textContent =
          `Rig aktif: ${audit.total} mesh terjaga · kepala ${audit.head} · telinga ${audit.ears} · tangan/lengan ${audit.arms} · kaki ${audit.legs} · ekor ${audit.tail} · badan ${audit.torso} · mesh statis ${audit.unassigned}. Tinggi ${state.rig.measure.height.toFixed(3)} unit.`;
        loading?.remove();
        status('GLB DIMUAT · RIGID PIVOT AKTIF');
      } catch (error) {
        console.error('Rig initialization failed:', error);
        if (loading) loading.textContent = 'Struktur rig gagal disiapkan. Periksa laporan debug browser.';
        status('GAGAL MENYIAPKAN RIG');
      }
    },
    undefined,
    error => {
      console.error('GLB load failed:', error);
      if (loading) loading.textContent = 'Model GLB gagal dimuat. Periksa file TCS_Mascot_3D.glb.';
      status('GAGAL MEMUAT GLB');
    }
  );
}

document.querySelectorAll('[data-expression]').forEach(button => {
  button.addEventListener('click', () => setExpression(button.dataset.expression));
});
document.querySelectorAll('[data-motion]').forEach(button => {
  button.addEventListener('click', () => setMotion(button.dataset.motion));
});

document.querySelector('#blinkToggle').addEventListener('change', event => {
  status(event.target.checked ? 'KEDIP OTOMATIS DIPILIH' : 'KEDIP OTOMATIS NONAKTIF');
});
document.querySelector('#idleToggle').addEventListener('change', event => {
  state.controller?.setIdleEnabled(event.target.checked);
  status(event.target.checked ? 'GERAKAN IDLE AKTIF' : 'GERAKAN IDLE NONAKTIF');
});
document.querySelector('#rotateToggle').addEventListener('change', event => {
  state.autoRotate = event.target.checked;
  controls.enabled = !state.autoRotate;
});
document.querySelector('#bgColor').addEventListener('input', event => {
  scene.background.set(event.target.value);
  scene.fog.color.set(event.target.value);
});

document.querySelector('#frontView').onclick = () => cameraAt([0, 2.15, 7.8]);
document.querySelector('#sideView').onclick = () => cameraAt([7.8, 2.15, 0]);
document.querySelector('#backView').onclick = () => cameraAt([0, 2.15, -7.8]);
document.querySelector('#resetView').onclick = () => cameraAt([0, 2.15, 7.8]);
document.querySelector('#resetCharacter').onclick = () => {
  state.controller?.reset();
  setMotion('idle');
  setExpression('happy');
  state.autoRotate = false;
  document.querySelector('#blinkToggle').checked = true;
  document.querySelector('#idleToggle').checked = true;
  document.querySelector('#rotateToggle').checked = false;
  controls.enabled = true;
};

const resize = () => {
  const width = Math.max(1, stage.clientWidth);
  const height = Math.max(1, stage.clientHeight);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height, false);
};
const observer = new ResizeObserver(resize);
observer.observe(stage);
resize();

loadGLB();

let previous = 0;
let raf = 0;
let disposed = false;
function frame(timestamp) {
  if (disposed || document.hidden) return;
  raf = requestAnimationFrame(frame);
  const dt = Math.min(0.05, (timestamp - previous) / 1000 || 0);
  previous = timestamp;
  state.controller?.update(dt);
  if (state.autoRotate && state.model) state.model.rotation.y += dt * 0.45;
  controls.update();
  renderer.render(scene, camera);
}
raf = requestAnimationFrame(frame);

renderer.domElement.addEventListener('webglcontextlost', event => {
  event.preventDefault();
  cancelAnimationFrame(raf);
  status('KONTEKS WEBGL TERPUTUS');
});
renderer.domElement.addEventListener('webglcontextrestored', () => {
  previous = 0;
  status('WEBGL DIPULIHKAN');
  raf = requestAnimationFrame(frame);
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) cancelAnimationFrame(raf);
  else { previous = 0; raf = requestAnimationFrame(frame); }
});
window.addEventListener('beforeunload', () => {
  disposed = true;
  cancelAnimationFrame(raf);
  observer.disconnect();
  controls.dispose();
  renderer.dispose();
});
