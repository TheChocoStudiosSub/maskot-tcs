import * as THREE from 'three';

/**
 * Procedural fallback armature for a static GLB.
 * The generated rest pose is a horizontal T-pose so the mascot starts with
 * both arms extended. Weights are assigned in model space and meshes are
 * bound only after all bone world matrices have been updated.
 */
export function buildProceduralSkeleton(model) {
  model.updateMatrixWorld(true);

  // Calculate bounds in model-local coordinates, not world coordinates.
  const worldBox = new THREE.Box3().setFromObject(model);
  const inverseRoot = model.matrixWorld.clone().invert();
  const corners = [];
  for (const xx of [worldBox.min.x, worldBox.max.x]) {
    for (const yy of [worldBox.min.y, worldBox.max.y]) {
      for (const zz of [worldBox.min.z, worldBox.max.z]) {
        corners.push(new THREE.Vector3(xx, yy, zz).applyMatrix4(inverseRoot));
      }
    }
  }
  const box = new THREE.Box3().setFromPoints(corners);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const H = Math.max(size.y, 0.001);
  const W = Math.max(size.x, H * 0.25);
  const D = Math.max(size.z, H * 0.2);
  const y = box.min.y;
  const z = center.z;
  const point = (px, py, pz = z) => new THREE.Vector3(px, py, pz);

  const root = new THREE.Bone();
  root.name = 'TCS_Root';
  root.position.copy(point(center.x, y, z));
  model.add(root);

  const bones = [];
  const positions = [];
  const addChain = (parent, specs) => {
    let current = parent;
    let parentPoint = parent === root ? root.position.clone() : null;
    for (const [name, px, py, pz] of specs) {
      const absolute = point(px, py, pz);
      const bone = new THREE.Bone();
      bone.name = name;
      bone.position.copy(absolute.sub(parentPoint || current.getWorldPosition(new THREE.Vector3())));
      current.add(bone);
      bones.push(bone);
      positions.push(point(px, py, pz));
      current = bone;
      parentPoint = point(px, py, pz);
    }
    return current;
  };

  // Central torso chain.
  addChain(root, [
    ['Pelvis', center.x, y + H * 0.48, z],
    ['Spine', center.x, y + H * 0.61, z],
    ['Chest', center.x, y + H * 0.72, z],
    ['Neck', center.x, y + H * 0.83, z],
    ['Head', center.x, y + H * 0.94, z]
  ]);

  for (const side of [-1, 1]) {
    const suffix = side < 0 ? 'L' : 'R';
    const shoulderX = center.x + side * W * 0.105;
    const shoulderY = y + H * 0.72;

    // Horizontal rest pose: shoulder -> upper arm -> forearm -> hand.
    addChain(root, [
      ['Shoulder_' + suffix, shoulderX, shoulderY, z],
      ['UpperArm_' + suffix, center.x + side * W * 0.235, shoulderY, z],
      ['Forearm_' + suffix, center.x + side * W * 0.355, shoulderY, z],
      ['Hand_' + suffix, center.x + side * W * 0.435, shoulderY, z]
    ]);

    // Legs stay straight in the neutral pose, with feet above the floor.
    addChain(root, [
      ['Hip_' + suffix, center.x + side * W * 0.105, y + H * 0.47, z],
      ['Thigh_' + suffix, center.x + side * W * 0.115, y + H * 0.30, z],
      ['Knee_' + suffix, center.x + side * W * 0.12, y + H * 0.16, z],
      ['Ankle_' + suffix, center.x + side * W * 0.12, y + H * 0.055, z],
      ['Foot_' + suffix, center.x + side * W * 0.12, y + H * 0.025, z + D * 0.18]
    ]);
  }

  // Ensure the bind pose is fully propagated before calculating inverse binds.
  model.updateMatrixWorld(true);
  root.updateMatrixWorld(true);
  const skeleton = new THREE.Skeleton(bones);
  skeleton.calculateInverses();
  const inverseModel = model.matrixWorld.clone().invert();
  const skinnedMeshes = [];

  model.traverse(mesh => {
    if (!mesh.isMesh || mesh.isSkinnedMesh || !mesh.geometry?.attributes?.position) return;

    mesh.updateMatrixWorld(true);
    const geometry = mesh.geometry.clone();
    const position = geometry.attributes.position;
    const skinIndex = new Uint16Array(position.count * 4);
    const skinWeight = new Float32Array(position.count * 4);
    const meshToModel = inverseModel.clone().multiply(mesh.matrixWorld);

    for (let i = 0; i < position.count; i++) {
      const vertex = new THREE.Vector3(
        position.getX(i),
        position.getY(i),
        position.getZ(i)
      ).applyMatrix4(meshToModel);

      const nearest = bones.map((bone, index) => ({
        index,
        distance: Math.max(0.035, vertex.distanceTo(positions[index]))
      })).sort((a, b) => a.distance - b.distance).slice(0, 4);

      let total = 0;
      for (const item of nearest) total += 1 / (item.distance * item.distance);
      nearest.forEach((item, slot) => {
        skinIndex[i * 4 + slot] = item.index;
        skinWeight[i * 4 + slot] = (1 / (item.distance * item.distance)) / total;
      });
    }

    geometry.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(skinIndex, 4));
    geometry.setAttribute('skinWeight', new THREE.Float32BufferAttribute(skinWeight, 4));

    const skinned = new THREE.SkinnedMesh(geometry, mesh.material);
    skinned.name = mesh.name;
    skinned.position.copy(mesh.position);
    skinned.quaternion.copy(mesh.quaternion);
    skinned.scale.copy(mesh.scale);
    skinned.matrix.copy(mesh.matrix);
    skinned.matrixAutoUpdate = mesh.matrixAutoUpdate;
    mesh.parent.add(skinned);
    skinned.updateMatrixWorld(true);
    skinned.bind(skeleton, skinned.matrixWorld.clone());

    mesh.visible = false;
    skinnedMeshes.push(skinned);
  });

  return { root, bones, skeleton, skinnedMeshes, generated: true, restPose: 'T-pose' };
}
