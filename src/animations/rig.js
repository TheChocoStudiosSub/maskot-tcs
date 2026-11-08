export function discoverRig(model){
 const rig={arms:[],legs:[],head:[],tail:[],body:[],eyes:[],face:[],base:new Map()};
 model.traverse(o=>{
  if(!o.isObject3D)return; const n=(o.name||'').toLowerCase();
  if(/arm|hand|wrist|shoulder|forearm|lengan|tangan/.test(n))rig.arms.push(o);
  if(/leg|foot|feet|thigh|knee|kaki/.test(n))rig.legs.push(o);
  if(/head|kepala/.test(n))rig.head.push(o);
  if(/tail|ekor/.test(n))rig.tail.push(o);
  if(/body|torso|chest|spine|badan/.test(n))rig.body.push(o);
  if(o.isMesh && /eye|eyeball|pupil|mata/.test(n))rig.eyes.push(o);
  if(o.isMesh && /mouth|lip|smile|brow|face|mulut|alis/.test(n))rig.face.push(o);
  rig.base.set(o,{position:o.position.clone(),rotation:o.rotation.clone(),scale:o.scale.clone()});
 });
 return rig;
}
export function restoreRig(rig){rig.base.forEach((b,o)=>{o.position.copy(b.position);o.rotation.copy(b.rotation);o.scale.copy(b.scale);});}
export function lerpRotation(o,axis,value,k){o.rotation[axis]+=(value-o.rotation[axis])*k;}
export function pulse(t,rate,phase=0){return Math.sin(t*rate+phase);}
