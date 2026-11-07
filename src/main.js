import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {createMascot,setExpression,setPose,setMouth,animateMascot,blinkMascot} from './mascot.js';
import './style.css';

const stage=document.querySelector('#stage');
const loading=document.querySelector('#loading');
const status=document.querySelector('#statusText');
const state={expression:'happy',pose:'idle',blink:true,idle:true,rotate:false,blinkPhase:0,blinkStart:0,nextBlink:2.8};
let renderer,controls,mascot,raf=0,last=0,disposed=false;
const scene=new THREE.Scene();
scene.background=new THREE.Color('#080d2b');
scene.fog=new THREE.Fog('#080d2b',8,18);
const camera=new THREE.PerspectiveCamera(34,1,.1,60);
camera.position.set(0,2.1,7.7);

function setStatus(value){if(status)status.textContent=value;}
function activate(selector,attr,value){document.querySelectorAll(selector).forEach(el=>el.classList.toggle('active',el.dataset[attr]===value));}
function moveCamera(position){
  camera.position.set(...position);
  if(controls){controls.target.set(0,.85,0);controls.update();}
}
function showFailure(message){
  loading?.remove();
  const note=document.createElement('div');
  note.className='loading';note.textContent=message;note.style.color='#ffb6c1';
  stage.append(note);setStatus('WEBGL TIDAK TERSEDIA');
}
try{
  renderer=new THREE.WebGLRenderer({antialias:false,alpha:false,powerPreference:'low-power',stencil:false,depth:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.25));
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.15;
  renderer.shadowMap.enabled=false;
  renderer.domElement.setAttribute('aria-label','Tampilan model 3D maskot TCS. Seret untuk memutar model.');
  stage.prepend(renderer.domElement);
}catch(error){
  console.error('WebGL initialization failed:',error);
  showFailure('Browser atau perangkat belum mendukung WebGL.');
}

if(renderer){
  controls=new OrbitControls(camera,renderer.domElement);
  controls.enableDamping=true;controls.dampingFactor=.075;
  controls.minDistance=4.4;controls.maxDistance=11;
  controls.target.set(0,.85,0);controls.maxPolarAngle=Math.PI*.82;
  scene.add(new THREE.HemisphereLight('#cbd6ff','#25204e',2.0));
  const key=new THREE.DirectionalLight('#fff4ff',2.7);key.position.set(3,6,5);scene.add(key);
  const rim=new THREE.PointLight('#685cff',16,9);rim.position.set(-3,2,-3);scene.add(rim);
  const fill=new THREE.PointLight('#48aaff',6,8);fill.position.set(3,1,3);scene.add(fill);
  const floor=new THREE.Mesh(new THREE.CircleGeometry(7,40),new THREE.MeshStandardMaterial({color:'#101b4c',roughness:.9}));
  floor.rotation.x=-Math.PI/2;floor.position.y=-.85;scene.add(floor);
  mascot=createMascot();mascot.root.position.y=-.08;scene.add(mascot.root);
  setExpression(mascot,state.expression);setPose(mascot,state.pose);

  const resize=()=>{
    const width=Math.max(1,stage.clientWidth),height=Math.max(1,stage.clientHeight);
    camera.aspect=width/height;camera.updateProjectionMatrix();renderer.setSize(width,height,false);
  };
  const observer=new ResizeObserver(resize);observer.observe(stage);resize();

  document.querySelectorAll('[data-expression]').forEach(button=>button.addEventListener('click',()=>{
    state.expression=button.dataset.expression;
    setExpression(mascot,state.expression);
    activate('[data-expression]','expression',state.expression);
    setStatus('EKSPRESI: '+state.expression.toUpperCase());
  }));
  document.querySelectorAll('[data-mouth]').forEach(button=>button.addEventListener('click',()=>{
    setMouth(mascot,button.dataset.mouth);
    activate('[data-mouth]','mouth',button.dataset.mouth);
    setStatus('GERAKAN MULUT: '+button.textContent.trim().toUpperCase());
  }));
  document.querySelectorAll('[data-pose]').forEach(button=>button.addEventListener('click',()=>{
    state.pose=button.dataset.pose;setPose(mascot,state.pose);
    activate('[data-pose]','pose',state.pose);
    setStatus('POSE: '+state.pose.toUpperCase());
  }));
  document.querySelector('#blinkToggle').addEventListener('change',event=>{
    state.blink=event.target.checked;state.blinkPhase=0;
    if(!state.blink)blinkMascot(mascot,1);
    setStatus(state.blink?'KEDIP OTOMATIS AKTIF':'KEDIP OTOMATIS NONAKTIF');
  });
  document.querySelector('#idleToggle').addEventListener('change',event=>{state.idle=event.target.checked;});
  document.querySelector('#rotateToggle').addEventListener('change',event=>{
    state.rotate=event.target.checked;controls.enabled=!state.rotate;
    setStatus(state.rotate?'ROTASI OTOMATIS AKTIF':'ROTASI OTOMATIS NONAKTIF');
  });
  document.querySelector('#bgColor').addEventListener('input',event=>{
    scene.background.set(event.target.value);scene.fog.color.set(event.target.value);
  });
  document.querySelector('#frontView').onclick=()=>moveCamera([0,2.1,7.7]);
  document.querySelector('#sideView').onclick=()=>moveCamera([7.7,2.1,0]);
  document.querySelector('#backView').onclick=()=>moveCamera([0,2.1,-7.7]);
  document.querySelector('#resetView').onclick=()=>{moveCamera([0,2.1,7.7]);controls.target.set(0,.85,0);controls.update();};
  document.querySelector('#resetCharacter').onclick=()=>{
    state.expression='happy';state.pose='idle';state.blink=true;state.idle=true;state.rotate=false;state.blinkPhase=0;
    document.querySelector('#blinkToggle').checked=true;
    document.querySelector('#idleToggle').checked=true;
    document.querySelector('#rotateToggle').checked=false;
    controls.enabled=true;blinkMascot(mascot,1);
    setExpression(mascot,'happy');setMouth(mascot,'closed');setPose(mascot,'idle');
    activate('[data-expression]','expression','happy');activate('[data-mouth]','mouth','closed');activate('[data-pose]','pose','idle');
    setStatus('SIAP · INTERAKTIF');
  };

  renderer.domElement.addEventListener('webglcontextlost',event=>{
    event.preventDefault();cancelAnimationFrame(raf);setStatus('KONTEKS GRAFIS TERPUTUS');
  });
  renderer.domElement.addEventListener('webglcontextrestored',()=>{
    last=0;setStatus('GRAFIS DIPULIHKAN');raf=requestAnimationFrame(frame);
  });
  document.addEventListener('visibilitychange',()=>{if(!document.hidden){last=0;raf=requestAnimationFrame(frame);}else cancelAnimationFrame(raf);});
  function frame(milliseconds){
    if(disposed||document.hidden)return;
    raf=requestAnimationFrame(frame);
    const time=milliseconds/1000;last=milliseconds;
    animateMascot(mascot,time,{idle:state.idle,rotate:state.rotate});
    if(state.blink){
      if(state.blinkPhase===0&&time>=state.nextBlink){state.blinkPhase=1;state.blinkStart=time;}
      if(state.blinkPhase===1){
        const progress=Math.min(1,(time-state.blinkStart)/.16);
        const amount=progress<.5?1-(progress*2):(progress-.5)*2;
        blinkMascot(mascot,Math.max(.04,amount));
        if(progress>=1){state.blinkPhase=0;state.nextBlink=time+2.4+Math.random()*2.4;blinkMascot(mascot,1);}
      }
    }
    controls.update();renderer.render(scene,camera);
  }
  loading?.remove();setStatus('SIAP · INTERAKTIF');raf=requestAnimationFrame(frame);
  window.addEventListener('beforeunload',()=>{disposed=true;cancelAnimationFrame(raf);observer.disconnect();controls.dispose();renderer.dispose();});
}
