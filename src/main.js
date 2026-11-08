import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import './style.css';
import {discoverRig} from './animations/rig.js';
import {tickCharacter} from './animations/controller.js';
import {buildProceduralSkeleton} from './animations/procedural-skeleton.js';

const stage=document.querySelector('#stage'),loading=document.querySelector('#loading');
const scene=new THREE.Scene();scene.background=new THREE.Color('#080d2b');scene.fog=new THREE.Fog('#080d2b',10,24);
const camera=new THREE.PerspectiveCamera(34,1,.1,80);camera.position.set(0,2.15,7.8);
const renderer=new THREE.WebGLRenderer({antialias:false,alpha:false,powerPreference:'low-power',stencil:false});
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.25));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;renderer.shadowMap.enabled=false;stage.prepend(renderer.domElement);
const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.075;controls.minDistance=3;controls.maxDistance=16;controls.maxPolarAngle=Math.PI*.84;
scene.add(new THREE.HemisphereLight('#d7ddff','#25204e',2.0));
const key=new THREE.DirectionalLight('#fff4ff',2.7);key.position.set(3,6,5);scene.add(key);
const rim=new THREE.PointLight('#685cff',17,11);rim.position.set(-3,2,-3);scene.add(rim);
const fill=new THREE.PointLight('#48aaff',6,9);fill.position.set(3,1,3);scene.add(fill);
const floor=new THREE.Mesh(new THREE.CircleGeometry(8,40),new THREE.MeshStandardMaterial({color:'#101b4c',roughness:.9}));floor.rotation.x=-Math.PI/2;floor.position.y=-.03;scene.add(floor);
const state={motion:'idle',expression:'happy',blink:true,autoRotate:false,elapsed:0,model:null,mixer:null,clips:[],activeClip:null,parts:{arms:[],legs:[],head:[],tail:[],body:[],eyes:[],face:[]},rig:null,baseY:0,baseRot:new THREE.Euler(),blinkTime:0,nextBlink:2.5,autoAngle:0};
function status(s){const el=document.querySelector('#statusText');if(el)el.textContent=s}
function activate(sel,key,value){document.querySelectorAll(sel).forEach(b=>b.classList.toggle('active',b.dataset[key]===value))}
function cameraAt(p){camera.position.set(...p);controls.target.set(0,.95,0);controls.update()}
function findParts(root){
 const p=state.parts;
 root.traverse(o=>{if(!o.isBone&&!o.isGroup)return;const n=o.name.toLowerCase();
 if(/arm|hand|wrist|shoulder|forearm|lengan|tangan/.test(n))p.arms.push(o);
 if(/leg|foot|feet|thigh|knee|kaki/.test(n))p.legs.push(o);
 if(/head|kepala/.test(n))p.head.push(o);
 if(/tail|ekor/.test(n))p.tail.push(o);
 if(/body|torso|chest|spine|badan/.test(n))p.body.push(o);
 });
}
function setMotion(name){state.motion=name;state.elapsed=0;activate('[data-motion]','motion',name);if(state.mixer){state.mixer.stopAllAction();const patterns={idle:/idle|stand|breath/,walk:/walk|run/,jump:/jump|hop/,sit:/sit/,wave:/wave|greet|hello/,cheer:/cheer|celebrate/};const clip=state.clips.find(c=>patterns[name]?.test(c.name));if(clip){state.activeClip=clip;state.mixer.clipAction(clip).reset().fadeIn(.18).play();}else state.activeClip=null;}status('ANIMASI: '+name.toUpperCase());}
function setExpression(name){
 state.expression=name;activate('[data-expression]','expression',name);
 const presets={happy:{blink:1,mouth:0},wink:{blink:.22,mouth:0},surprised:{blink:1,mouth:1},sleepy:{blink:.55,mouth:0},angry:{blink:.8,mouth:0},sad:{blink:.9,mouth:0}};
 const preset=presets[name]||presets.happy;state.parts.face?.forEach(x=>{});
 if(state.model){state.model.traverse(o=>{if(!o.isMesh||!o.morphTargetDictionary||!o.morphTargetInfluences)return;for(const [key,index] of Object.entries(o.morphTargetDictionary)){const k=key.toLowerCase();if(/blink|eye.?close/.test(k))o.morphTargetInfluences[index]=name==='wink'?.9:name==='sleepy'?.45:0;if(/mouth.?open|jaw.?open/.test(k))o.morphTargetInfluences[index]=preset.mouth;if(/smile|happy/.test(k))o.morphTargetInfluences[index]=name==='happy'?.8:0;if(/sad|frown/.test(k))o.morphTargetInfluences[index]=name==='sad'?.8:0;if(/angry/.test(k))o.morphTargetInfluences[index]=name==='angry'?.8:0;} });}
 status('EKSPRESI: '+name.toUpperCase());
}
function animateRig(dt,t){
 const {arms,legs,head,tail,body}=state.parts;const smooth=1-Math.exp(-dt*8);
 if(state.mixer)state.mixer.update(dt);
 const bob=Math.sin(t*2.2)*.018;
 state.model.position.y=THREE.MathUtils.damp(state.model.position.y,state.baseY+(state.motion==='jump'?Math.max(0,Math.sin(state.elapsed*Math.PI*1.4))*.8:state.motion==='walk'?Math.abs(Math.sin(t*8))*.045:state.motion==='idle'?bob:0),dt,7);
 const walking=state.motion==='walk',sitting=state.motion==='sit',waving=state.motion==='wave',cheering=state.motion==='cheer';
 if(state.motion==='jump')state.model.rotation.z=Math.sin(state.elapsed*3)*.025;
 else state.model.rotation.z=THREE.MathUtils.damp(state.model.rotation.z,0,dt,6);
 if(head.length)head.forEach((o,i)=>{o.rotation.z+=(Math.sin(t*1.3)*.018-o.rotation.z)*smooth});
 if(tail.length)tail.forEach(o=>{o.rotation.x+=(Math.sin(t*3)*.13-o.rotation.x)*smooth;o.rotation.z+=(Math.sin(t*2)*.09-o.rotation.z)*smooth});
 if(arms.length){arms.forEach((o,i)=>{const side=i%2===0?-1:1;let target=0;if(waving&&side>0)target=Math.sin(state.elapsed*8)*.75-1.05;else if(cheering)target=side*.95;else if(walking)target=Math.sin(t*8+ i*Math.PI)*.45; o.rotation.z+=(target-o.rotation.z)*smooth;});}
 if(legs.length){legs.forEach((o,i)=>{const side=i%2===0?-1:1;let target=walking?Math.sin(t*8+i*Math.PI)*.48:sitting?-.95:0;o.rotation.x+=(target-o.rotation.x)*smooth;o.rotation.z+=(sitting?side*.18:0-o.rotation.z)*smooth;});}
 if(body.length)body.forEach(o=>{const target=sitting?.22:walking?Math.sin(t*8)*.025:0;o.rotation.x+=(target-o.rotation.x)*smooth;});
 if(state.autoRotate){state.autoAngle+=dt*.45;state.model.rotation.y=state.rig.baseModelRotation.y+state.autoAngle;}
}
function loadGLB(){
 const loader=new GLTFLoader();
 loader.load('https://cdn.jsdelivr.net/gh/TheChocoStudiosSub/maskot-tcs@main/TCS_Mascot_3D.glb',gltf=>{
  const model=gltf.scene;state.model=model;scene.add(model);
  const box=new THREE.Box3().setFromObject(model),size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3());
  const max=Math.max(size.x,size.y,size.z)||1;const scale=2.9/max;model.scale.setScalar(scale);model.position.set(-center.x*scale,-box.min.y*scale, -center.z*scale);state.baseY=model.position.y;
  model.traverse(o=>{if(o.isMesh){o.frustumCulled=true;if(o.material){o.material.side=THREE.FrontSide;if('roughness' in o.material)o.material.roughness=Math.max(.35,o.material.roughness??.7);}}});
  state.proceduralArmature=buildProceduralSkeleton(model);state.rig=discoverRig(model);state.clips=gltf.animations||[];state.mixer=null;
  controls.target.set(0,1.25,0);camera.position.set(0,2.15,7.8);controls.update();
  const rig=document.querySelector('#rigInfo');const count=state.rig.arms.length+state.rig.legs.length+state.rig.head.length+state.rig.tail.length+state.rig.body.length;const eyeCount=state.rig.eyes.length;
  rig.textContent='Armature prosedural aktif: '+state.proceduralArmature.bones.length+' tulang · '+state.proceduralArmature.skinnedMeshes.length+' mesh ter-skinning. Rig otomatis berbasis proporsi GLB; hasil deformasi bergantung pada bentuk mesh.';
  loading?.remove();status('GLB DIMUAT · '+(state.clips.length?'ANIMASI TERTANAM':'MODE KONTROL 3D'));
 },undefined,error=>{console.error(error);loading.textContent='Model GLB gagal dimuat. Periksa file TCS_Mascot_3D.glb di repositori.';status('GAGAL MEMUAT GLB');});
}
document.querySelectorAll('[data-expression]').forEach(b=>b.addEventListener('click',()=>setExpression(b.dataset.expression)));
document.querySelectorAll('[data-motion]').forEach(b=>b.addEventListener('click',()=>setMotion(b.dataset.motion)));
document.querySelector('#blinkToggle').addEventListener('change',e=>{state.blink=e.target.checked;status(state.blink?'KEDIP OTOMATIS AKTIF':'KEDIP OTOMATIS NONAKTIF')});
document.querySelector('#idleToggle').addEventListener('change',e=>{if(e.target.checked&&state.motion==='idle')status('GERAKAN IDLE AKTIF')});
document.querySelector('#rotateToggle').addEventListener('change',e=>{state.autoRotate=e.target.checked;controls.enabled=!state.autoRotate});
document.querySelector('#bgColor').addEventListener('input',e=>{scene.background.set(e.target.value);scene.fog.color.set(e.target.value)});
document.querySelector('#frontView').onclick=()=>cameraAt([0,2.15,7.8]);document.querySelector('#sideView').onclick=()=>cameraAt([7.8,2.15,0]);document.querySelector('#backView').onclick=()=>cameraAt([0,2.15,-7.8]);document.querySelector('#resetView').onclick=()=>cameraAt([0,2.15,7.8]);
document.querySelector('#resetCharacter').onclick=()=>{setMotion('idle');setExpression('happy');state.blink=true;state.autoRotate=false;state.autoAngle=0;document.querySelector('#blinkToggle').checked=true;document.querySelector('#rotateToggle').checked=false;controls.enabled=true;};
const resize=()=>{const w=Math.max(1,stage.clientWidth),h=Math.max(1,stage.clientHeight);camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false)};const observer=new ResizeObserver(resize);observer.observe(stage);resize();
loadGLB();
let previous=0,raf=0,disposed=false;
function frame(ms){if(disposed||document.hidden)return;raf=requestAnimationFrame(frame);const t=ms/1000,dt=Math.min(.05,(ms-previous)/1000||0);previous=ms;state.elapsed+=dt;if(state.model&&state.rig){tickCharacter(state.model,state.rig,state.motion,state.expression,state.elapsed,dt,state.blink);if(state.autoRotate)state.model.rotation.y+=dt*.45;}if(state.blink&&state.expression!=='wink'){state.blinkTime+=dt;if(state.blinkTime>state.nextBlink){state.blinkTime=0;state.nextBlink=2.2+Math.random()*2.4;}}controls.update();renderer.render(scene,camera);}
raf=requestAnimationFrame(frame);
renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();cancelAnimationFrame(raf);status('KONTEKS WEBGL TERPUTUS')});
renderer.domElement.addEventListener('webglcontextrestored',()=>{previous=0;status('WEBGL DIPULIHKAN');raf=requestAnimationFrame(frame)});
document.addEventListener('visibilitychange',()=>{if(document.hidden)cancelAnimationFrame(raf);else{previous=0;raf=requestAnimationFrame(frame)}});
window.addEventListener('beforeunload',()=>{disposed=true;cancelAnimationFrame(raf);observer.disconnect();controls.dispose();renderer.dispose();});
