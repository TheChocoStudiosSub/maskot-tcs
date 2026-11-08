import * as THREE from 'three';
import { CONFIG } from '../../config.js';

const PATTERNS = {
  head: /^(head|cheek|cheek_tuft|forelock|eye|iris|pupil|eyebrow|blush|nose|mouth|tiny_incisor)/i,
  ears: /^ear_/i,
  arms: /^(sleeve|sleeve_cuff|sleeve_blue_accent|paw|hand|wrist|arm|forearm|shoulder)/i,
  legs: /^(leg|foot|feet|toe|thigh|knee|shoe)/i,
  tail: /^tail_/i,
  torso: /^(hoodie|hood_|drawstring|logo|chest_logo|hood_back_collar)/i
};

function boundsOf(object) {
  object.updateWorldMatrix(true, false);
  return new THREE.Box3().setFromObject(object);
}
function union(objects, fallback) {
  const box = new THREE.Box3();
  for (const object of objects) box.union(boundsOf(object));
  return box.isEmpty() ? fallback.clone() : box;
}
function makePivot(parent, name, worldPosition) {
  parent.updateWorldMatrix(true, false);
  const group = new THREE.Group();
  group.name = name;
  parent.add(group);
  group.position.copy(parent.worldToLocal(worldPosition.clone()));
  group.updateWorldMatrix(true, false);
  return group;
}
function moveMeshes(pivot, meshes) {
  for (const mesh of meshes) pivot.attach(mesh);
}
function sideOf(mesh, centerX) {
  return boundsOf(mesh).getCenter(new THREE.Vector3()).x < centerX ? 'L' : 'R';
}
function describe(root) {
  const rows = [];
  root.traverse(object => {
    if (object === root || object.isMesh || object.isGroup) {
      let depth = 0, parent = object.parent;
      while (parent && parent !== root) { depth++; parent = parent.parent; }
      rows.push(`${'  '.repeat(depth)}${object.name || object.type}${object.isMesh ? ' [mesh]' : ''}`);
    }
  });
  return rows.join('\n');
}

export function discoverRig(model) {
  model.updateWorldMatrix(true, true);
  const meshes = [];
  model.traverse(object => { if (object.isMesh) meshes.push(object); });
  if (!meshes.length) throw new Error('GLB tidak memiliki mesh yang dapat dirig.');

  const worldBounds = new THREE.Box3();
  meshes.forEach(mesh => worldBounds.union(boundsOf(mesh)));
  const size = worldBounds.getSize(new THREE.Vector3());
  const center = worldBounds.getCenter(new THREE.Vector3());
  const buckets = { head: [], ears: [], arms: [], legs: [], tail: [], torso: [], unassigned: [] };
  const assigned = new Set();

  for (const mesh of meshes) {
    const name = mesh.name || '';
    const category = Object.keys(PATTERNS).find(key => PATTERNS[key].test(name));
    if (category && !assigned.has(mesh)) {
      buckets[category].push(mesh);
      assigned.add(mesh);
    } else if (!assigned.has(mesh)) {
      buckets.unassigned.push(mesh);
      assigned.add(mesh);
    }
  }

  const root = new THREE.Group();
  root.name = 'TCS_Rig_Root';
  model.add(root);
  root.updateWorldMatrix(true, false);

  const hips = makePivot(root, 'Hips', new THREE.Vector3(center.x, worldBounds.min.y + size.y * CONFIG.rig.hipsPivotRatio, center.z));
  const torso = makePivot(hips, 'Torso', new THREE.Vector3(center.x, worldBounds.min.y + size.y * CONFIG.rig.torsoPivotRatio, center.z));
  moveMeshes(torso, buckets.torso);

  const headBounds = union(buckets.head, worldBounds);
  const head = makePivot(torso, 'Head', new THREE.Vector3(
    headBounds.getCenter(new THREE.Vector3()).x,
    headBounds.min.y + headBounds.getSize(new THREE.Vector3()).y * CONFIG.rig.headPivotRatio,
    headBounds.getCenter(new THREE.Vector3()).z
  ));
  moveMeshes(head, buckets.head);

  const arms = { L: null, R: null };
  const legs = { L: null, R: null };
  const ears = { L: null, R: null };

  for (const side of ['L', 'R']) {
    const armMeshes = buckets.arms.filter(mesh => sideOf(mesh, center.x) === side);
    if (armMeshes.length) {
      const box = union(armMeshes, worldBounds);
      const c = box.getCenter(new THREE.Vector3()), s = box.getSize(new THREE.Vector3());
      const sign = side === 'L' ? -1 : 1;
      const pivot = makePivot(torso, `Arm_${side}`, new THREE.Vector3(
        c.x - sign * s.x * CONFIG.rig.shoulderInsetRatio,
        box.max.y - s.y * CONFIG.rig.shoulderHeightRatio,
        c.z
      ));
      moveMeshes(pivot, armMeshes);
      arms[side] = pivot;
    }

    const legMeshes = buckets.legs.filter(mesh => sideOf(mesh, center.x) === side);
    if (legMeshes.length) {
      const box = union(legMeshes, worldBounds), c = box.getCenter(new THREE.Vector3());
      const pivot = makePivot(hips, `Leg_${side}`, new THREE.Vector3(c.x, box.max.y, c.z));
      moveMeshes(pivot, legMeshes);
      legs[side] = pivot;
    }

    const earMeshes = buckets.ears.filter(mesh => sideOf(mesh, center.x) === side);
    if (earMeshes.length) {
      const box = union(earMeshes, worldBounds), c = box.getCenter(new THREE.Vector3());
      const pivot = makePivot(head, `Ear_${side}`, new THREE.Vector3(
        c.x, box.min.y + box.getSize(new THREE.Vector3()).y * CONFIG.rig.earPivotRatio, c.z
      ));
      moveMeshes(pivot, earMeshes);
      ears[side] = pivot;
    }
  }

  const tailPivots = [];
  let tailParent = hips;
  const tailOrder = ['tail_base', 'tail_fluff_upper', 'tail_fluff_mid', 'tail_fluff_lower', 'tail_tip'];
  for (const prefix of tailOrder) {
    const group = buckets.tail.filter(mesh => (mesh.name || '').toLowerCase().startsWith(prefix));
    if (!group.length) continue;
    const box = union(group, worldBounds);
    const pivot = makePivot(tailParent, `Tail_${tailPivots.length + 1}`, box.getCenter(new THREE.Vector3()));
    moveMeshes(pivot, group);
    tailPivots.push(pivot);
    tailParent = pivot;
  }
  const groupedTail = new Set(tailPivots.flatMap(pivot => {
    const found = [];
    pivot.traverse(object => { if (object.isMesh) found.push(object); });
    return found;
  }));
  const remainingTail = buckets.tail.filter(mesh => !groupedTail.has(mesh));
  if (remainingTail.length) {
    const box = union(remainingTail, worldBounds);
    const pivot = makePivot(hips, 'Tail_Extra', box.getCenter(new THREE.Vector3()));
    moveMeshes(pivot, remainingTail);
    tailPivots.push(pivot);
  }

  // Unclassified GLB meshes remain visible under a neutral root instead of being dropped.
  const staticParts = makePivot(root, 'Unassigned_Static_Meshes', center);
  moveMeshes(staticParts, buckets.unassigned);

  const allPivots = [
    hips, torso, head,
    ...Object.values(arms).filter(Boolean),
    ...Object.values(legs).filter(Boolean),
    ...Object.values(ears).filter(Boolean),
    ...tailPivots
  ];
  const movedMeshes = new Set();
  root.traverse(object => { if (object.isMesh) movedMeshes.add(object); });
  const missingMeshes = meshes.filter(mesh => !movedMeshes.has(mesh));
  if (missingMeshes.length) {
    const safety = makePivot(root, 'Unassigned_Safety_Net', center);
    moveMeshes(safety, missingMeshes);
  }

  model.updateWorldMatrix(true, true);
  const legBox = union(buckets.legs, worldBounds);
  const armBox = union(buckets.arms, worldBounds);
  const measure = Object.freeze({
    height: size.y, width: size.x, depth: size.z,
    legLength: legBox.getSize(new THREE.Vector3()).y,
    armLength: armBox.getSize(new THREE.Vector3()).length() * 0.5,
    headHeight: headBounds.getSize(new THREE.Vector3()).y,
    units: 'GLB world units after display scale'
  });
  const hierarchy = describe(root);
  const meshAudit = Object.freeze({
    total: meshes.length,
    assigned: finalMeshSet.size,
    head: buckets.head.length, ears: buckets.ears.length,
    arms: buckets.arms.length, legs: buckets.legs.length,
    tail: buckets.tail.length, torso: buckets.torso.length,
    unassigned: buckets.unassigned.length,
    missingAfterSafetyNet: stillMissing.length
  });
  console.group('TCS GLB rig audit');
  console.table(meshAudit);
  console.log(hierarchy);
  console.groupEnd();

  return {
    root, hips, torso, head,
    arms: Object.values(arms).filter(Boolean),
    armSides: arms, legs: Object.values(legs).filter(Boolean),
    legSides: legs, ears: Object.values(ears).filter(Boolean),
    earSides: ears, tail: tailPivots, staticParts,
    pivots: allPivots, measure, hierarchy, meshCount: meshes.length,
    meshAudit, sourceMeshes: meshes
  };
}
