import * as THREE from 'three';
import { CONFIG } from '../../config.js';

const HEAD = /^(head|cheek_|cheek_tuft_|forelock_|eye_|iris_|pupil_|eyebrow_|blush_|nose$|mouth_|tiny_incisor_)/i;
const TORSO = /^(hoodie_|drawstring|logo_badge|chest_logo_|hood_back_collar$)/i;
const ARM = /^(sleeve_|sleeve_cuff_|sleeve_blue_accent_|paw_|paw_toe_)/i;
const LEG = /^(leg_|foot_|toe_)/i;
const TAIL = /^tail_/i;
const EAR = /^ear_/i;

function boxOf(object) {
  object.updateWorldMatrix(true, false);
  return new THREE.Box3().setFromObject(object);
}
function union(objects) {
  const box = new THREE.Box3();
  objects.forEach(o => box.union(boxOf(o)));
  return box;
}
function localPoint(parent, worldPoint) {
  parent.updateWorldMatrix(true, false);
  return parent.worldToLocal(worldPoint.clone());
}
function pivot(parent, name, worldPoint) {
  const group = new THREE.Group();
  group.name = name;
  parent.add(group);
  group.position.copy(localPoint(parent, worldPoint));
  return group;
}
function attachAll(group, objects) {
  objects.forEach(o => group.attach(o));
}
function sideOf(object, centerX) {
  return boxOf(object).getCenter(new THREE.Vector3()).x < centerX ? 'L' : 'R';
}
function reportTree(root) {
  const lines = [];
  root.traverse(o => {
    if (o === root || o.isMesh || o.isGroup) lines.push(`${'  '.repeat(depthOf(o, root))}${o.name || o.type}${o.isMesh ? ' [mesh]' : ''}`);
  });
  return lines.join('\n');
}
function depthOf(o, root) {
  let d = 0, p = o.parent;
  while (p && p !== root) { d++; p = p.parent; }
  return d;
}
export function discoverRig(model) {
  model.updateMatrixWorld(true);
  const meshes = [];
  model.traverse(o => { if (o.isMesh) meshes.push(o); });
  const allBox = union(meshes), size = allBox.getSize(new THREE.Vector3()), center = allBox.getCenter(new THREE.Vector3());
  const by = (rx) => meshes.filter(m => rx.test(m.name || ''));
  const torsoMeshes = by(TORSO), headMeshes = by(HEAD), armMeshes = by(ARM), legMeshes = by(LEG), tailMeshes = by(TAIL), earMeshes = by(EAR);
  const root = new THREE.Group(); root.name = 'TCS_Root'; model.add(root);
  const hips = pivot(root, 'Hips', new THREE.Vector3(center.x, allBox.min.y + size.y * CONFIG.rig.hipsPivotRatio, center.z));
  const torso = pivot(hips, 'Torso', new THREE.Vector3(center.x, allBox.min.y + size.y * CONFIG.rig.torsoPivotRatio, center.z));
  attachAll(torso, torsoMeshes);

  const headBox = union(headMeshes);
  const headPivot = pivot(torso, 'Head', new THREE.Vector3(center.x, headBox.min.y + headBox.getSize(new THREE.Vector3()).y * CONFIG.rig.headPivotRatio, headBox.getCenter(new THREE.Vector3()).z));
  attachAll(headPivot, headMeshes);

  const armPivots = { L: null, R: null }, legPivots = { L: null, R: null }, earPivots = { L: null, R: null };
  for (const side of ['L','R']) {
    const armSide = armMeshes.filter(m => sideOf(m, center.x) === side);
    if (armSide.length) {
      const b = union(armSide), c = b.getCenter(new THREE.Vector3()), s = b.getSize(new THREE.Vector3());
      const sign = side === 'L' ? -1 : 1;
      const p = pivot(torso, `Arm_${side}`, new THREE.Vector3(c.x - sign * s.x * CONFIG.rig.shoulderInsetRatio, b.max.y - s.y * .08, c.z));
      attachAll(p, armSide); armPivots[side] = p;
    }
    const legSide = legMeshes.filter(m => sideOf(m, center.x) === side);
    if (legSide.length) {
      const b = union(legSide), c = b.getCenter(new THREE.Vector3());
      const p = pivot(hips, `Leg_${side}`, new THREE.Vector3(c.x, b.max.y, c.z));
      attachAll(p, legSide); legPivots[side] = p;
    }
    const earSide = earMeshes.filter(m => sideOf(m, center.x) === side);
    if (earSide.length) {
      const b = union(earSide), c = b.getCenter(new THREE.Vector3());
      const p = pivot(headPivot, `Ear_${side}`, new THREE.Vector3(c.x, b.min.y + b.getSize(new THREE.Vector3()).y * .12, c.z));
      attachAll(p, earSide); earPivots[side] = p;
    }
  }

  const tailPivots = [];
  let tailParent = hips;
  const tailOrder = ['tail_base','tail_fluff_upper','tail_fluff_mid','tail_fluff_lower','tail_tip'];
  for (const name of tailOrder) {
    const part = tailMeshes.filter(m => (m.name || '').toLowerCase().startsWith(name));
    if (!part.length) continue;
    const b = union(part), c = b.getCenter(new THREE.Vector3());
    const p = pivot(tailParent, `Tail_${tailPivots.length + 1}`, c);
    attachAll(p, part); tailPivots.push(p); tailParent = p;
  }

  const drawstrings = meshes.filter(m => /^drawstring/i.test(m.name || ''));
  const drawstringPivots = [];
  for (const mesh of drawstrings) {
    const b = boxOf(mesh), c = b.getCenter(new THREE.Vector3());
    const p = pivot(torso, `Drawstring_${drawstringPivots.length + 1}`, c);
    p.attach(mesh); drawstringPivots.push(p);
  }

  model.updateMatrixWorld(true);
  const legBox = union(legMeshes), armBox = union(armMeshes);
  const legLength = legBox.getSize(new THREE.Vector3()).y;
  const armLength = Math.max(
    new THREE.Vector3().subVectors(armBox.max, new THREE.Vector3(center.x, armBox.getCenter(new THREE.Vector3()).y, armBox.getCenter(new THREE.Vector3()).z)).length(),
    armBox.getSize(new THREE.Vector3()).x * .5
  );
  const measure = Object.freeze({ height: size.y, width: size.x, depth: size.z, legLength, armLength, headHeight: headBox.getSize(new THREE.Vector3()).y, units: 'GLB world units after display scale' });
  const pivots = [hips, torso, headPivot, ...Object.values(armPivots).filter(Boolean), ...Object.values(legPivots).filter(Boolean), ...Object.values(earPivots).filter(Boolean), ...tailPivots, ...drawstringPivots];
  const groups = { root, hips, torso, head: headPivot, arms: Object.values(armPivots).filter(Boolean), legs: Object.values(legPivots).filter(Boolean), ears: Object.values(earPivots).filter(Boolean), tail: tailPivots, drawstrings: drawstringPivots };
  const hierarchy = reportTree(root);
  console.group('TCS GLB node hierarchy'); console.log(hierarchy); console.groupEnd();
  console.table({ ...measure });
  return { ...groups, pivots, measure, hierarchy, meshCount: meshes.length, sourceMeshes: meshes };
}
