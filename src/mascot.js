import * as THREE from 'three';

const mat=(color,roughness=.72,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
const M={fur:mat('#f4f2ff'),furShade:mat('#dcd9f5'),innerEar:mat('#8060dd'),earDark:mat('#24134f'),hood:mat('#111638'),hoodLight:mat('#20265a'),blue:mat('#168cff'),ink:mat('#17123b'),iris:mat('#2457d9',.28),irisLight:mat('#54aaff',.25),white:mat('#fff'),pink:mat('#ff8dbd'),mouth:mat('#e84e9a'),sole:mat('#c9c7e8'),logo:mat('#ffffff',.5,.15)};
const sphereGeo=new THREE.SphereGeometry(1,24,18);
function ball(parent,material,pos,scale,geo=sphereGeo){const o=new THREE.Mesh(geo,material);o.position.set(...pos);o.scale.set(...scale);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o}
function capsule(parent,material,a,b,r1,r2=r1){const d=new THREE.Vector3(...b).sub(new THREE.Vector3(...a));const mesh=new THREE.Mesh(new THREE.CylinderGeometry(r2,r1,d.length(),12),material);mesh.position.copy(new THREE.Vector3(...a).add(new THREE.Vector3(...b)).multiplyScalar(.5));mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());mesh.castShadow=true;parent.add(mesh);ball(parent,material,a,[r1,r1,r1]);ball(parent,material,b,[r2,r2,r2]);return mesh}
function makeEar(parent,x){const ear=new THREE.Group();ear.position.set(x,1.43,0);parent.add(ear);const outer=ball(ear,M.ink,[0,.22,0],[.31,.49,.18]);outer.rotation.z=x<0?-.18:.18;const inner=ball(ear,M.innerEar,[0,.22,.145],[.205,.34,.045]);inner.rotation.z=x<0?-.18:.18;ball(ear,M.fur,[0,.04,.15],[.13,.12,.05]);return ear}
function makeEye(parent,x){const g=new THREE.Group();g.position.set(x,.42,.47);parent.add(g);ball(g,M.ink,[0,0,0],[.205,.285,.09]);ball(g,M.iris,[0,-.015,.075],[.157,.215,.055]);ball(g,M.irisLight,[0,-.065,.12],[.105,.12,.025]);ball(g,M.ink,[0,-.04,.143],[.083,.14,.022]);ball(g,M.white,[-.055,.105,.17],[.058,.075,.018]);ball(g,M.white,[.064,-.105,.166],[.025,.032,.012]);const lid=ball(g,M.fur,[0,.27,.13],[.23,.035,.045]);return {group:g,lid,pupil:g.children[4]}}
function makeMouth(parent){const g=new THREE.Group();g.position.set(0,-.06,.57);parent.add(g);const mouth=ball(g,M.mouth,[0,-.055,0],[.115,.13,.035]);ball(g,M.ink,[0,.045,.005],[.07,.025,.02]);const smile=ball(g,M.pink,[0,-.13,.008],[.06,.035,.012]);return {group:g,mouth,smile}}
export function createMascot(){
 const root=new THREE.Group();const torso=new THREE.Group();root.add(torso);
 const head=new THREE.Group();head.position.y=1.38;torso.add(head);
 // Head silhouette, cheeks and layered cheek tufts
 ball(head,M.fur,[0,0,0],[.78,.69,.58]);ball(head,M.fur,[-.58,-.23,.12],[.25,.22,.34]);ball(head,M.fur,[.58,-.23,.12],[.25,.22,.34]);
 for(const s of [-1,1]){ball(head,M.fur,[s*.69,-.31,.08],[.2,.12,.19]).rotation.z=s*.3;ball(head,M.fur,[s*.48,-.48,.28],[.2,.1,.13]);}
 const ears=[makeEar(head,-.48),makeEar(head,.48)];
 // forehead tuft
 for(let i=0;i<3;i++){const t=ball(head,M.fur,[(-.12+i*.12),.63+(i===1?.1:0),.03],[.13,.22,.13]);t.rotation.z=-.35+i*.32}
 const eyes=[makeEye(head,-.31),makeEye(head,.31)];
 const brows=[ball(head,M.fur,[-.31,.76,.5],[.12,.035,.025]),ball(head,M.fur,[.31,.76,.5],[.12,.035,.025])];
 ball(head,M.ink,[0,.13,.59],[.075,.05,.045]);const mouth=makeMouth(head);
 const blush=[ball(head,M.pink,[-.53,-.13,.46],[.13,.055,.025]),ball(head,M.pink,[.53,-.13,.46],[.13,.055,.025])];
 // Hoodie body, hood collar and drawstrings
 const body=new THREE.Group();torso.add(body);ball(body,M.hood,[0,.25,0],[.59,.67,.42]);ball(body,M.hoodLight,[0,.66,-.08],[.49,.22,.36]);ball(body,M.hood,[0,.58,.2],[.44,.17,.18]);
 for(const x of [-.16,.16]){capsule(body,M.blue,[x,.58,.37],[x,.24,.38],.018);ball(body,M.logo,[x,.2,.385],[.025,.025,.012])}
 // Chest logo, stylized TCS letters
 const logo=new THREE.Group();logo.position.set(0,.22,.405);body.add(logo);
 const logoText=new THREE.Mesh(new THREE.BoxGeometry(.46,.045,.018),M.logo);logoText.position.y=.05;logo.add(logoText);
 const logoSlash=new THREE.Mesh(new THREE.BoxGeometry(.16,.035,.02),M.blue);logoSlash.position.set(.2,.0,.012);logoSlash.rotation.z=-.6;logo.add(logoSlash);
 // Arms with separate shoulder and forearm segments
 const arms=[];
 for(const s of [-1,1]){const arm=new THREE.Group();arm.position.set(s*.49,.62,0);body.add(arm);capsule(arm,M.hood,[0,0,0],[s*.1,-.37,.04],.19,.16);capsule(arm,M.hoodLight,[s*.1,-.37,.04],[s*.08,-.56,.14],.15,.13);ball(arm,M.fur,[s*.08,-.62,.16],[.14,.12,.13]);ball(arm,M.blue,[s*.11,-.24,.16],[.035,.11,.035]);arms.push(arm)}
 // Legs and shoes
 const legs=[];for(const s of [-1,1]){const leg=new THREE.Group();leg.position.set(s*.25,-.28,0);torso.add(leg);capsule(leg,M.fur,[0,0,0],[0,-.43,.03],.16,.14);ball(leg,M.fur,[0,-.46,.1],[.2,.12,.25]);for(let i=-1;i<=1;i++)ball(leg,M.sole,[i*.065,-.52,.26],[.045,.035,.045]);legs.push(leg)}
 // Big fluffy tail behind, assembled from overlapping tapered fur lobes
 const tail=new THREE.Group();tail.position.set(.44,-.03,-.35);torso.add(tail);const tailBase=ball(tail,M.fur,[.2,-.02,-.05],[.34,.43,.32]);tailBase.rotation.z=-.55;for(let i=0;i<5;i++){const a=i*Math.PI*2/5;const l=ball(tail,M.fur,[.37+Math.cos(a)*.13,-.02+Math.sin(a)*.18,-.03],[.2,.24,.2]);l.rotation.z=-.45+Math.sin(a)*.4}
 // Hood rear volume
 ball(body,M.hood,[0,.65,-.28],[.47,.38,.2]);
 const shadow=new THREE.Mesh(new THREE.CircleGeometry(1.45,48),new THREE.MeshBasicMaterial({color:'#030719',transparent:true,opacity:.3}));shadow.rotation.x=-Math.PI/2;shadow.position.y=-.83;root.add(shadow);
 return {root,torso,head,eyes,brows,mouth,blush,arms,legs,tail,ears,shadow,body};
}
const expr={
 happy:{mouth:[1,1,1],eyes:[1,1],brow:[0,0],blush:1},
 wink:{mouth:[.8,.8,1],eyes:[1,.06],brow:[0,0],blush:.8},
 surprised:{mouth:[.65,1.35,1],eyes:[1.18,1.18],brow:[.12,.12],blush:.35},
 sleepy:{mouth:[.7,.45,1],eyes:[.18,.18],brow:[-.04,-.04],blush:.2},
 angry:{mouth:[.85,.55,1],eyes:[.72,.72],brow:[-.2,.2],blush:.15},
 sad:{mouth:[.85,.65,1],eyes:[.7,.7],brow:[.13,-.13],blush:.3}
};
export function setExpression(m,name){const e=expr[name]||expr.happy;m.eyes.forEach((eye,i)=>{eye.group.scale.y=e.eyes[i];eye.lid.position.y=e.eyes[i]<.3?.19:.27;eye.lid.scale.y=e.eyes[i]<.3?.25:.035});m.brows.forEach((b,i)=>{b.rotation.z=e.brow[i];b.position.y=.76+Math.abs(e.brow[i])*.15});m.mouth.mouth.scale.set(...e.mouth);m.blush.forEach(b=>b.material.opacity=e.blush);m.blush.forEach(b=>{b.visible=e.blush>.1});}
export function setPose(m,name){m.arms.forEach((a,i)=>{a.rotation.set(0,0,0);if(name==='wave'&&i===1){a.rotation.z=-2.35;a.rotation.x=-.25}else if(name==='cheer'){a.rotation.z=i===0?2.2:-2.2}else if(name==='sit'){a.rotation.z=i===0?.35:-.35}});m.legs.forEach((l,i)=>{l.rotation.set(0,0,0);if(name==='sit'){l.rotation.x=-.9;l.position.y=-.18}else l.position.y=-.28});m.torso.rotation.x=name==='sit'?.12:0;m.torso.position.y=name==='sit'?.12:0;}
export function animateMascot(m,t,opts){if(opts.idle){m.torso.position.y+=(Math.sin(t*2.1)*.025-m.torso.position.y)*.08;m.head.rotation.z=Math.sin(t*.8)*.018;m.tail.rotation.x=Math.sin(t*2.5)*.12;m.tail.rotation.z=Math.sin(t*1.7)*.12;}else{m.torso.position.y*=.92;m.head.rotation.z*=.92}if(opts.rotate)m.root.rotation.y+=.0035;}
export function blinkMascot(m,amount){for(const e of m.eyes){e.group.scale.y=amount;e.lid.position.y=amount<.3?.19:.27;e.lid.scale.y=amount<.3?.25:.035}}
