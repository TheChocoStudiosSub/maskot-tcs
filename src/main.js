import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import './style.css';
import { createIdleMotion } from './animations/idle.js';

const stage = document.querySelector('#stage');
const loading = document.querySelector('#loading');
const statusText = document.querySelector('#statusText');
if (!stage) throw new Error('Elemen #stage tidak ditemukan.');

const scene = new THREE.Scene();
scene.background = new THREE.Color('#080d2b');
scene.fog = new THREE.Fog('#080d2b', 10, 24);
const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 80);
camera.position.set(0, 2.15, 7.8);

const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: 'low-power', stencil: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
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
const keyLight = new THREE.DirectionalLight('#fff4ff', 2.7);
keyLight.position.set(3, 6, 5);
scene.add(keyLight);
const rimLight = new THREE.PointLight('#685cff', 17, 11);
rimLight.position.set(-3, 2, -3);
scene.add(rimLight);
const fillLight = new THREE.PointLight('#48aaff', 6, 9);
fillLight.position.set(3, 1, 3);
scene.add(fillLight);

const floor = new THREE.Mesh(new THREE.CircleGeometry(8, 40), new THREE.MeshStandardMaterial({ color: '#101b4c', roughness: 0.9 }));
floor.rotation.x = -Math.PI / 2;
floor.position.y = -0.03;
scene.add(floor);

const turntableRoot = new THREE.Group();
turntableRoot.name = 'TCS_MASCOT_TURNTABLE';
scene.add(turntableRoot);
const characterRoot = new THREE.Group();
characterRoot.name = 'TCS_MASCOT_IDLE_ROOT';
turntableRoot.add(characterRoot);

let idleMotion = null;
let autoRotate = false;
let previousTime = 0;
let rafId = 0;
let disposed = false;

function setStatus(message) {
  if (statusText) statusText.textContent = message;
}
function setCamera(position) {
  camera.position.set(...position);
  controls.target.set(0, 1.25, 0);
  controls.update();
}

function loadMascot() {
  const loader = new GLTFLoader();
  loader.load(
    'https://cdn.jsdelivr.net/gh/TheChocoStudiosSub/maskot-tcs@main/TCS_Mascot_3D.glb?v=tail-hanging-01',
    (gltf) => {
      try {
        const model = gltf.scene;
        model.name = 'TCS_MASCOT_SOURCE_GLB';

        // Keep the source GLB hierarchy untouched. No mesh is detached,
        // re-parented, or assigned to guessed body-part pivots.
        const bounds = new THREE.Box3().setFromObject(model);
        if (bounds.isEmpty()) throw new Error('GLB tidak memiliki geometri yang terlihat.');
        const size = bounds.getSize(new THREE.Vector3());
        const center = bounds.getCenter(new THREE.Vector3());
        const maxDimension = Math.max(size.x, size.y, size.z);
        if (!Number.isFinite(maxDimension) || maxDimension <= 0) throw new Error('Ukuran model GLB tidak valid.');

        const scale = 2.9 / maxDimension;
        model.scale.setScalar(scale);
        model.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
        // Place the wrapper at the model center while keeping the feet on y=0.
        characterRoot.position.set(0, (center.y - bounds.min.y) * scale, 0);
        characterRoot.add(model);

        let meshCount = 0;
        model.traverse((object) => {
          if (!object.isMesh) return;
          meshCount += 1;
          object.frustumCulled = false;
          if (object.material && 'roughness' in object.material) object.material.roughness = Math.max(0.35, object.material.roughness ?? 0.7);
        });
        if (meshCount === 0) throw new Error('Tidak ditemukan mesh pada model GLB.');

        idleMotion = createIdleMotion(characterRoot);
        idleMotion.setEnabled(document.querySelector('#idleToggle')?.checked ?? true);
        const rigInfo = document.querySelector('#rigInfo');
        if (rigInfo) rigInfo.textContent = `Model asli dipertahankan · ${meshCount} mesh · tanpa pemisahan anggota tubuh.`;
        if (loading) loading.remove();
        setStatus('MODEL SIAP · SISTEM IDLE AKTIF');
        console.info('[TCS Idle] GLB loaded:', { meshCount, size: size.toArray(), scale });
      } catch (error) {
        console.error('[TCS Idle] Gagal menyiapkan model:', error);
        if (loading) loading.textContent = 'Model berhasil dimuat, tetapi gagal disiapkan. Periksa console browser.';
        setStatus('GAGAL MENYIAPKAN MODEL');
      }
    },
    undefined,
    (error) => {
      console.error('[TCS Idle] Gagal memuat GLB:', error);
      if (loading) loading.textContent = 'Model GLB gagal dimuat. Periksa koneksi dan file model.';
      setStatus('GAGAL MEMUAT MODEL');
    }
  );
}

document.querySelector('#idleToggle')?.addEventListener('change', (event) => {
  idleMotion?.setEnabled(event.target.checked);
  setStatus(event.target.checked ? 'GERAKAN IDLE AKTIF' : 'POSISI DIAM');
});
document.querySelector('#rotateToggle')?.addEventListener('change', (event) => {
  autoRotate = event.target.checked;
  controls.enabled = !autoRotate;
  setStatus(autoRotate ? 'ROTASI OTOMATIS AKTIF' : 'ROTASI OTOMATIS NONAKTIF');
});
document.querySelector('#bgColor')?.addEventListener('input', (event) => {
  scene.background.set(event.target.value);
  scene.fog.color.set(event.target.value);
});
document.querySelector('#frontView')?.addEventListener('click', () => setCamera([0, 2.15, 7.8]));
document.querySelector('#sideView')?.addEventListener('click', () => setCamera([7.8, 2.15, 0]));
document.querySelector('#backView')?.addEventListener('click', () => setCamera([0, 2.15, -7.8]));
document.querySelector('#resetView')?.addEventListener('click', () => setCamera([0, 2.15, 7.8]));
document.querySelector('#resetCharacter')?.addEventListener('click', () => {
  idleMotion?.reset();
  idleMotion?.setEnabled(true);
  const idleToggle = document.querySelector('#idleToggle');
  if (idleToggle) idleToggle.checked = true;
  autoRotate = false;
  const rotateToggle = document.querySelector('#rotateToggle');
  if (rotateToggle) rotateToggle.checked = false;
  controls.enabled = true;
  setCamera([0, 2.15, 7.8]);
  setStatus('POSISI IDLE DIKEMBALIKAN');
});

function resize() {
  const width = Math.max(1, stage.clientWidth);
  const height = Math.max(1, stage.clientHeight);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height, false);
}
const resizeObserver = new ResizeObserver(resize);
resizeObserver.observe(stage);
resize();

function frame(timestamp) {
  if (disposed || document.hidden) return;
  rafId = requestAnimationFrame(frame);
  const dt = previousTime ? Math.min((timestamp - previousTime) / 1000, 0.05) : 0;
  previousTime = timestamp;
  idleMotion?.update(dt);
  if (autoRotate) turntableRoot.rotation.y += dt * 0.35;
  controls.update();
  renderer.render(scene, camera);
}
rafId = requestAnimationFrame(frame);
loadMascot();

renderer.domElement.addEventListener('webglcontextlost', (event) => {
  event.preventDefault();
  cancelAnimationFrame(rafId);
  setStatus('KONTEKS WEBGL TERPUTUS');
});
renderer.domElement.addEventListener('webglcontextrestored', () => {
  previousTime = 0;
  setStatus('WEBGL DIPULIHKAN');
  rafId = requestAnimationFrame(frame);
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) cancelAnimationFrame(rafId);
  else { previousTime = 0; rafId = requestAnimationFrame(frame); }
});
window.addEventListener('beforeunload', () => {
  disposed = true;
  cancelAnimationFrame(rafId);
  resizeObserver.disconnect();
  controls.dispose();
  renderer.dispose();
});
