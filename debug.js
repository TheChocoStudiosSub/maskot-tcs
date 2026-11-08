import * as THREE from 'three';
import { CONFIG } from './config.js';

export function mountRigDebug(rig) {
  if (new URLSearchParams(location.search).get(CONFIG.debug.query) !== '1') return null;
  const panel = document.createElement('section');
  panel.id = 'rig-debug-panel';
  panel.innerHTML = `<style>
  #rig-debug-panel{position:fixed;z-index:30;right:12px;top:12px;width:min(${CONFIG.debug.panelWidth}px,calc(100vw - 24px));max-height:calc(100dvh - 24px);overflow:auto;background:#090f27f2;color:#eef2ff;border:1px solid #5867a8;border-radius:12px;padding:12px;font:12px/1.45 system-ui;box-shadow:0 12px 40px #0008}
  #rig-debug-panel h2{font-size:13px;margin:0 0 8px}#rig-debug-panel .row{display:flex;gap:6px;flex-wrap:wrap;margin:7px 0}
  #rig-debug-panel button{background:#202d60;color:white;border:1px solid #5867a8;border-radius:6px;padding:6px 8px;font:inherit}
  #rig-debug-panel pre{white-space:pre-wrap;overflow:auto;max-height:${CONFIG.debug.reportMaxHeight}px;background:#030817;padding:8px;border-radius:7px;font-size:10px}
  #rig-debug-panel label{display:block;margin:6px 0}#rig-debug-panel input{width:100%}
  </style><h2>F0 · RIG PIVOT DEBUG</h2><div id="rig-measure"></div><div class="row" id="rig-buttons"></div><label>Sudut sendi <input id="rig-angle" type="range" min="-90" max="90" value="20"></label><label><input id="rig-pivots" type="checkbox"> Tampilkan pivot</label><button id="rig-reset">Reset semua sendi</button><h2>Hierarki GLB / rig</h2><pre id="rig-hierarchy"></pre><div id="rig-error" role="status"></div>`;
  document.body.append(panel);
  panel.querySelector('#rig-measure').textContent = `Tinggi ${rig.measure.height.toFixed(3)} · Kaki ${rig.measure.legLength.toFixed(3)} · Lengan ${rig.measure.armLength.toFixed(3)}`;
  panel.querySelector('#rig-hierarchy').textContent = rig.hierarchy;
  const buttons = panel.querySelector('#rig-buttons');
  const helpers = [];
  rig.pivots.forEach((p,i) => {
    const b = document.createElement('button'); b.textContent = p.name; buttons.append(b);
    b.addEventListener('click', () => { rig.pivots.forEach(x => x.rotation.set(0,0,0)); p.rotation.z = THREE.MathUtils.degToRad(Number(panel.querySelector('#rig-angle').value)); });
    const helper = new THREE.AxesHelper(CONFIG.debug.pivotSize); helper.visible = false; p.add(helper); helpers.push(helper);
  });
  panel.querySelector('#rig-pivots').addEventListener('change', e => helpers.forEach(h => h.visible = e.target.checked));
  panel.querySelector('#rig-reset').addEventListener('click', () => rig.pivots.forEach(p => p.rotation.set(0,0,0)));
  return panel;
}
