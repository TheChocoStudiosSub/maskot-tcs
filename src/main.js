import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {createMascot,setExpression,setPose,animateMascot,blinkMascot} from './mascot.js';
import './style.css';
const stage=document.querySelector('#stage');
const scene=new THREE.Scene();scene.background=new THREE.Color('#080d2b');scene.fog=new THREE.Fog('#080d2b',8,18);
const camera=new THREE.PerspectiveCamera(34,1,.1,60);camera.position.set(0,2.1,7.7);
const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.2;stage.prepend(renderer.domElement);
const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.07;controls.minDistance=4.4;controls.maxDistance=11;controls.target.set(0,.85,0);controls.maxPolarAngle=Math.PI*.82;
scene.add(new THREE.HemisphereLight('#cbd6ff','#25204e',2.1));const key=new THREE.DirectionalLight('#fff4ff',3.1);key.position.set(3,6,5);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-4;key.shadow.camera.right=4;key.shadow.camera.top=5;key.shadow.camera.bottom=-4;scene.add(key);const rim=new THREE.PointLight('#685cff',22,9);rim.position.set(-3,2,-3);scene.add(rim);const fill=new THREE.PointLight('#48aaff',8,8);fill.position.set(3,1,3);scene.add(fill);
const floor=new THREE.Mesh(new THREE.CircleGeometry(7,64),new THREE.MeshStandardMaterial({color:'#101b4c',roughness:.85}));floor.rotation.x=-Math.PI/2;floor.position.y=-.85;floor.receiveShadow=true;scene.add(floor);
const mascot=createMascot();mascot.root.position.y=-.08;scene.add(mascot.root);setExpression(mascot,'happy');setPose(mascot,'idle');
const state={expression:'happy',pose:'idle',blink:true,idle:true,rotate:false,blinkValue:1,nextBlink:2.5,blinkPhase:0};
const resize=()=>{const w=stage.clientWidth,h=stage.clientHeight;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false)};new ResizeObserver(resize).observe(stage);resize();
function setStatus(s){document.querySelector('#statusText').textContent=s}
function activate(selector,attr,value){document.querySelectorAll(selector).forEach(b=>b.classList.toggle('active',b.dataset[attr]===value))}
document.querySelectorAll('[data-expression]').forEach(b=>b.addEventListener('click',()=>{state.expression=b.dataset.expression;setExpression(mascot,state.expression);activate('[data-expression]','expression',state.expression);setStatus('EXPRESSION: '+state.expression.toUpperCase())}));
document.querySelectorAll('[data-pose]').forEach(b=>b.addEventListener('click',()=>{state.pose=b.dataset.pose;setPose(mascot,state.pose);activate('[data-pose]','pose',state.pose);setStatus('POSE: '+state.pose.toUpperCase())}));
document.querySelector('#blinkToggle').addEventListener('change',e=>{state.blink=e.target.checked;if(!state.blink)blinkMascot(mascot,1);setStatus(state.blink?'AUTO BLINK ON':'AUTO BLINK OFF')});
document.querySelector('#idleToggle').addEventListener('change',e=>state.idle=e.target.checked);
document.querySelector('#rotateToggle').addEventListener('change',e=>{state.rotate=e.target.checked;controls.enabled=!state.rotate});
document.querySelector('#bgColor').addEventListener('input',e=>{scene.background.set(e.target.value);scene.fog.color.set(e.target.value)});
document.querySelector('#frontView').onclick=()=>moveCamera([0,2.1,7.7]);document.querySelector('#sideView').onclick=()=>moveCamera([7.7,2.1,0]);document.querySelector('#backView').onclick=()=>moveCamera([0,2.1,-7.7]);
function moveCamera(p){camera.position.set(...p);controls.target.set(0,.85,0);controls.update()}
document.querySelector('#resetView').onclick=()=>{moveCamera([0,2.1,7.7]);controls.reset()};
document.querySelector('#resetCharacter').onclick=()=>{state.expression='happy';state.pose='idle';state.blink=true;state.idle=true;state.rotate=false;document.querySelector('#blinkToggle').checked=true;document.querySelector('#idleToggle').checked=true;document.querySelector('#rotateToggle').checked=false;setExpression(mascot,'happy');setPose(mascot,'idle');activate('[data-expression]','expression','happy');activate('[data-pose]','pose','idle');setStatus('STANDBY')};
let last=0;function frame(ms){requestAnimationFrame(frame);const t=ms/1000,dt=Math.min((ms-last)/1000,.05);last=ms;animateMascot(mascot,t,{idle:state.idle,rotate:state.rotate});if(state.blink){if(state.blinkPhase===0&&t>state.nextBlink){state.blinkPhase=1;state.blinkStart=t}if(state.blinkPhase===1){const q=(t-state.blinkStart)/.12;state.blinkValue=q<.5?1-q*2:(q-0.5)*2;state.blinkValue=Math.max(.08,Math.min(1,state.blinkValue));blinkMascot(mascot,state.blinkValue);if(q>=1){state.blinkPhase=0;state.nextBlink=t+2.2+Math.random()*2.5;state.blinkValue=1}}}controls.update();renderer.render(scene,camera)}
requestAnimationFrame(frame);document.querySelector('#loading').remove();setStatus('READY · INTERACTIVE');
window.addEventListener('beforeunload',()=>{renderer.dispose();controls.dispose()});
