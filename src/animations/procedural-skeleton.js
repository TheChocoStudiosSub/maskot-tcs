import * as THREE from 'three';

/**
 * Procedural fallback humanoid-ish armature + skin weights for a static GLB.
 * Model bounds are used as proportions. Meshes are converted to SkinnedMesh
 * and receive 4-nearest-bone weights. This is a generic fallback, not a
 * replacement for artist-authored topology/weights.
 */
export function buildProceduralSkeleton(model) {
  model.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const H = Math.max(size.y, 0.001), W = Math.max(size.x, H * 0.25), D = Math.max(size.z, H * 0.2);
  const x = W * 0.28, y = box.min.y, z = center.z;
  const point = (px, py, pz=z) => new THREE.Vector3(px, py, pz);
  const root = new THREE.Bone(); root.name='TCS_Root'; root.position.copy(point(center.x,y,z)); model.add(root);
  const bones=[], positions=[];
  const addChain=(parent, specs)=>{
    let p=parent;
    for(const [name,px,py,pz] of specs){
      const b=new THREE.Bone();b.name=name;b.position.copy(point(px,py,pz).sub(p===root?root.position: new THREE.Vector3(0,0,0)));
      // Bone child positions are relative to parent; specs are model-space points.
      if(p!==root){const wp=p.getWorldPosition(new THREE.Vector3());b.position.copy(point(px,py,pz).sub(wp));}
      p.add(b);bones.push(b);positions.push(point(px,py,pz));p=b;
    }
    return p;
  };
  // Root's coordinate space begins at model bounding-box bottom-center.
  addChain(root,[['Pelvis',center.x,y+H*.48,z],['Spine',center.x,y+H*.62,z],['Chest',center.x,y+H*.72,z],['Neck',center.x,y+H*.82,z],['Head',center.x,y+H*.94,z]]);
  for(const side of [-1,1]){
    const s=side<0?'L':'R',sx=center.x+side*x;
    addChain(root,[['Shoulder_'+s,sx,y+H*.73,z],['UpperArm_'+s,sx+side*W*.10,y+H*.64,z],['Forearm_'+s,sx+side*W*.17,y+H*.54,z],['Hand_'+s,sx+side*W*.20,y+H*.48,z]]);
    addChain(root,[['Hip_'+s,center.x+side*W*.11,y+H*.47,z],['Thigh_'+s,center.x+side*W*.13,y+H*.30,z],['Knee_'+s,center.x+side*W*.14,y+H*.16,z],['Ankle_'+s,center.x+side*W*.14,y+H*.05,z],['Foot_'+s,center.x+side*W*.14,y+H*.025,z+D*.18]]);
  }
  const skel=new THREE.Skeleton(bones);
  const inverseModel=model.matrixWorld.clone().invert();
  const skinned=[];
  model.traverse(mesh=>{
    if(!mesh.isMesh || mesh.isSkinnedMesh || !mesh.geometry?.attributes?.position)return;
    const geo=mesh.geometry.clone(),pos=geo.attributes.position,idx=new Uint16Array(pos.count*4),weights=new Float32Array(pos.count*4);
    mesh.updateMatrixWorld(true);
    const toModel=inverseModel.clone().multiply(mesh.matrixWorld);
    for(let i=0;i<pos.count;i++){
      const v=new THREE.Vector3(pos.getX(i),pos.getY(i),pos.getZ(i)).applyMatrix4(toModel);
      const distances=bones.map((b,j)=>{const bp=positions[j];return Math.max(.025,v.distanceTo(bp));});
      const nearest=distances.map((d,j)=>({j,d})).sort((a,b)=>a.d-b.d).slice(0,4);
      let total=0;nearest.forEach(a=>total+=1/(a.d*a.d));
      nearest.forEach((a,k)=>{idx[i*4+k]=a.j;weights[i*4+k]=(1/(a.d*a.d))/total;});
    }
    geo.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(idx,4));
    geo.setAttribute('skinWeight',new THREE.Float32BufferAttribute(weights,4));
    const sm=new THREE.SkinnedMesh(geo,mesh.material);sm.name=mesh.name;sm.position.copy(mesh.position);sm.quaternion.copy(mesh.quaternion);sm.scale.copy(mesh.scale);sm.matrix.copy(mesh.matrix);sm.matrixAutoUpdate=mesh.matrixAutoUpdate;sm.bind(skel);
    mesh.parent.add(sm);mesh.visible=false;skinned.push(sm);
  });
  return {root,bones,skeleton:skel,skinnedMeshes:skinned,generated:true};
}
