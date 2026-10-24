/* Mangrove, direction D2 (draft, 23 Oct 2026, Cooper).
   The flock: Mangrove-main `surfaces/csm_murmurations_v3.html` (seven flocks on seven depth layers,
   stroked birds with flapping, swept wings), rebuilt in true 3D with three.js r170, plus the web that
   joins each bird to its 7 nearest neighbours (topological interaction, Ballerini et al. 2008, PNAS).
   The visitor's pointer or finger is a falcon. Plain JavaScript, no build step. */
import * as THREE from './vendor/three/three.module.min.js';

const root = document.documentElement;
const canvas = document.getElementById('sky');
const mq = (q) => { try { return matchMedia(q).matches; } catch (e) { return false; } };
const coarse = mq('(hover: none) and (pointer: coarse)');
const reducedMotion = () => {
  const m = root.dataset.libMotion;           // the accessibility kit's resolved choice, when present
  return m ? m === 'reduce' : mq('(prefers-reduced-motion: reduce)');
};
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const smooth = (e0, e1, x) => { const t = clamp((x - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t); };
let seed = 20261023;
const rand = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };

/* ── Words: split the wonky headings into letters (the spirit of direction E) ── */
const wonkyEls = [...document.querySelectorAll('.wonky, .wonky-mail')];
const letters = [];
for (const el of wonkyEls) {
  const text = el.textContent;
  el.setAttribute('aria-label', text);
  el.textContent = '';
  for (const ch of text) {
    const s = document.createElement('span');
    s.className = 'l'; s.setAttribute('aria-hidden', 'true'); s.textContent = ch;
    el.appendChild(s);
    letters.push({ el: s, rot: (rand() - .5) * 9, dy: (rand() - .5) * .09, cx: 0, cy: 0, ox: 0, oy: 0, orot: 0 });
  }
}
function placeWonkyBase() {
  for (const L of letters) L.el.style.transform = `translateY(${L.dy}em) rotate(${L.rot}deg)`;
}
placeWonkyBase();

/* ── Light and dark toggle (a plain switch: on = dark) ── */
const atmosBtn = document.getElementById('atmos');
function labelAtmos() {
  atmosBtn.setAttribute('aria-checked', root.getAttribute('data-theme') === 'light' ? 'false' : 'true');
}
atmosBtn.addEventListener('click', () => {
  root.setAttribute('data-theme', root.getAttribute('data-theme') === 'light' ? 'dark' : 'light');
  labelAtmos();
});
try { const q = new URLSearchParams(location.search).get('sky'); if (q === 'silt' || q === 'light') root.setAttribute('data-theme', 'light'); } catch (e) {}
labelAtmos();

/* ── Input: the falcon (pointer, finger) and the parallax (pointer, tilt) ── */
const falcon = { x: .5, y: .35, on: 0, target: 0, last: -1e9, down: 0, stoop: 0, px: .5, py: .35, moved: false };
const par = { x: 0, y: 0, tx: 0, ty: 0 };
let tilt = null;
function setFalcon(cx, cy, now) {
  falcon.x = cx / innerWidth; falcon.y = 1 - cy / innerHeight;   // uv, origin bottom-left
  falcon.target = 1; falcon.last = now; falcon.moved = true;
  if (!tilt) { par.tx = (cx / innerWidth - .5) * 2; par.ty = (cy / innerHeight - .5) * 2; }
}
function stoopAt(cx, cy, now) { setFalcon(cx, cy, now); falcon.stoop = 1; }
addEventListener('pointermove', (e) => { if (e.pointerType !== 'touch') setFalcon(e.clientX, e.clientY, performance.now()); }, { passive: true });
addEventListener('pointerdown', (e) => {
  if (e.pointerType === 'touch') return;
  if (e.target.closest('a,button')) return;              // clicking a link is not a dive
  stoopAt(e.clientX, e.clientY, performance.now());
}, { passive: true });
document.addEventListener('pointerleave', () => { falcon.target = 0; }, { passive: true });
let touchStart = null;
addEventListener('touchstart', (e) => {
  const t = e.touches[0]; if (!t) return;
  touchStart = { x: t.clientX, y: t.clientY, at: performance.now() };
  setFalcon(t.clientX, t.clientY, performance.now());
}, { passive: true });
addEventListener('touchmove', (e) => { const t = e.touches[0]; if (t) setFalcon(t.clientX, t.clientY, performance.now()); }, { passive: true });
addEventListener('touchend', (e) => {
  const now = performance.now();
  if (touchStart && now - touchStart.at < 260 && !e.target.closest('a,button')) {
    const t = e.changedTouches[0];
    if (t && Math.hypot(t.clientX - touchStart.x, t.clientY - touchStart.y) < 12) stoopAt(t.clientX, t.clientY, now);
  }
  touchStart = null; falcon.target = 0;
}, { passive: true });

const tiltBtn = document.getElementById('tilt');
let tiltAsk = false;
// The button shows only where tilt can do something: permission still to ask, a renderer, and motion allowed.
function syncTiltBtn() { tiltBtn.hidden = !(tiltAsk && renderer && !reducedMotion()); }
function onTilt(e) {
  if (e.gamma == null) return;
  tilt = true;
  par.tx = clamp(e.gamma / 28, -1, 1); par.ty = clamp((e.beta - 45) / 28, -1, 1);
}
if ('DeviceOrientationEvent' in window && coarse) {
  if (typeof DeviceOrientationEvent.requestPermission === 'function') {
    tiltAsk = true;                                      // iOS asks first, and only after a tap
    tiltBtn.addEventListener('click', async () => {
      try { if (await DeviceOrientationEvent.requestPermission() === 'granted') { addEventListener('deviceorientation', onTilt, { passive: true }); tiltAsk = false; } }
      catch (e) { tiltAsk = false; }
      syncTiltBtn();
    });
  } else addEventListener('deviceorientation', onTilt, { passive: true });
}

/* ── Layout reads, cached (no reads inside the frame loop except scroll) ── */
const tagline = document.querySelector('.tagline');
const headings = [...document.querySelectorAll('.room .wonky')];
const paras = [...document.querySelectorAll('.room p')];
const axisLinks = [...document.querySelectorAll('.axis a')];
const axisDot = document.querySelector('.axis .dot');
const axisOl = document.querySelector('.axis ol');
const sections = ['research', 'studio', 'services', 'write'].map((id) => document.getElementById(id));
const maskEls = [document.querySelector('.tagline'), document.querySelector('.hint'), ...document.querySelectorAll('.room p'), document.querySelector('.email')].slice(0, 6);
function readMasks() {
  const asp = innerWidth / innerHeight, H = innerHeight;
  maskEls.forEach((el, k) => {
    const r = el.getBoundingClientRect(), v = U.uMask.value[k];
    if (r.bottom < 0 || r.top > H) { v.set(-9, -9, -9, -9); return; }
    v.set(r.left / innerWidth * asp, 1 - r.bottom / H, r.right / innerWidth * asp, 1 - r.top / H);
  });
}
let layout = {};
function measure() {
  for (const L of letters) L.el.style.transform = 'none';
  const sy = scrollY;
  for (const L of letters) { const r = L.el.getBoundingClientRect(); L.cx = r.left + r.width / 2; L.cy = r.top + sy + r.height / 2; L.fs = r.height; }
  layout.heads = headings.map((h) => { h.style.transform = 'none'; const r = h.getBoundingClientRect(); return r.top + sy + r.height / 2; });
  layout.secs = sections.map((s) => s.getBoundingClientRect().top + sy);
  layout.axisW = axisOl.getBoundingClientRect().width;
  layout.vh = innerHeight; layout.docH = document.documentElement.scrollHeight;
  placeWonkyBase();
}

/* ── WebGL ── */
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'high-performance' });
} catch (e) { renderer = null; }
if (!renderer) { root.classList.add('no-gl'); }
THREE.ColorManagement.enabled = false;                    // pass our sRGB tokens straight through
if (renderer) {
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
  renderer.autoClear = false;
  root.classList.add('gl');
}

const DPR = Math.min(devicePixelRatio || 1, coarse ? 1.5 : 1.75);
const area = innerWidth * innerHeight;
let N = clamp(Math.round(area / 1900), 240, 630);
if (coarse) N = Math.min(N, innerWidth >= 700 ? 420 : 280);
if ((navigator.hardwareConcurrency || 8) <= 4) N = Math.round(N * .8);

/* v3's seven flocks: proportions, speed, size and depth, reordered front to back. */
const STEMS = [
  { n: 82, speed: 1.25, size: 1.40, alpha: .74 }, { n: 78, speed: 1.60, size: 1.20, alpha: .70 },
  { n: 72, speed: 2.10, size: .88, alpha: .65 },  { n: 72, speed: 1.90, size: .85, alpha: .62 },
  { n: 68, speed: 2.25, size: .78, alpha: .66 },  { n: 76, speed: 1.65, size: 1.00, alpha: .70 },
  { n: 58, speed: 3.50, size: .52, alpha: .48 },
];
const Z_HOME = [150, 40, -80, -210, -340, -470, -600];
const totalN = STEMS.reduce((a, s) => a + s.n, 0);
const flockOf = new Uint8Array(N);
{ let i = 0; STEMS.forEach((s, k) => { const c = k === 6 ? N - i : Math.round(N * s.n / totalN); for (let j = 0; j < c && i < N; j++) flockOf[i++] = k; }); }

const FOV = 50, CAM0 = 430, DIVE = 660, FAL_D = 300;
const camera = new THREE.PerspectiveCamera(FOV, innerWidth / innerHeight, 1, 2000);
camera.position.set(0, 0, CAM0);
const halfTan = Math.tan(THREE.MathUtils.degToRad(FOV / 2));

const P = new Float32Array(N * 3), V = new Float32Array(N * 3), PH = new Float32Array(N), HEAT = new Float32Array(N);
const NB = new Int32Array(N * 7).fill(-1), NBD = new Float32Array(N * 7);
const anchors = STEMS.map((s, k) => ({ w: (0.045 + rand() * .05) * (k % 2 ? -1 : 1), phi: rand() * 6.28, ax: 0, ay: 0, z: Z_HOME[k] }));
function anchorAmp() {
  const asp = innerWidth / innerHeight;
  anchors.forEach((a) => { const d = CAM0 - a.z; a.hh = d * halfTan; a.hw = a.hh * asp; });
}
anchorAmp();
for (let i = 0; i < N; i++) {
  const a = anchors[flockOf[i]];
  const g = () => (rand() + rand() + rand() - 1.5) * 70;
  P[i * 3] = g() + (rand() - .5) * a.hw * .6; P[i * 3 + 1] = g() * .7 + a.hh * .15; P[i * 3 + 2] = a.z + g() * .5;
  const th = rand() * 6.28; V[i * 3] = Math.cos(th); V[i * 3 + 1] = Math.sin(th) * .3; V[i * 3 + 2] = (rand() - .5) * .4;
  PH[i] = rand() * 6.28;
}

/* Word targets: the flock briefly writes "mangrove" in wonky letters. */
let wordPts = null;
async function buildWord() {
  try { await document.fonts.load('520 200px "Bricolage Grotesque"'); } catch (e) {}
  const c = document.createElement('canvas'); c.width = 1100; c.height = 300;
  const x = c.getContext('2d');
  x.font = '520 210px "Bricolage Grotesque", sans-serif'; x.fillStyle = '#fff'; x.textBaseline = 'alphabetic';
  let cx = 30; const s = 'mangrove';
  for (let i = 0; i < s.length; i++) {
    const w = x.measureText(s[i]).width;
    x.save(); x.translate(cx + w / 2, 205 + (rand() - .5) * 26); x.rotate((rand() - .5) * .2);
    x.fillText(s[i], -w / 2, 0); x.restore(); cx += w * .93;
  }
  const W = Math.min(1100, cx + 30), img = x.getImageData(0, 0, c.width, c.height).data, pts = [];
  for (let y = 0; y < 300; y += 7) for (let xx = 0; xx < W; xx += 7) if (img[(y * c.width + xx) * 4 + 3] > 140) pts.push([(xx / W) - .5, (.5 - y / 300) * (300 / W)]);
  for (let i = pts.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [pts[i], pts[j]] = [pts[j], pts[i]]; }
  wordPts = pts;
}
buildWord();
const word = { t: -1, birds: null, T: null };
let lastWordAt = -1e9;
function formWord(now) {
  if (!wordPts || word.t >= 0 || now - lastWordAt < 15000) return;
  const M = Math.min(wordPts.length, Math.round(N * .82));
  const dir = new THREE.Vector3(); camera.getWorldDirection(dir);
  const c = camera.position.clone().addScaledVector(dir, 340);
  const vw = 340 * halfTan * camera.aspect * 2 * (camera.aspect < 1 ? .78 : .56);
  const pick = [...Array(N).keys()].sort((a, b) => Math.abs(P[a * 3 + 2] - c.z) - Math.abs(P[b * 3 + 2] - c.z)).slice(0, M).sort(() => rand() - .5);
  word.birds = new Int32Array(pick); word.T = new Float32Array(M * 3);
  for (let m = 0; m < M; m++) {
    const [u, v] = wordPts[m]; word.T[m * 3] = c.x + u * vw; word.T[m * 3 + 1] = c.y + v * vw + 30; word.T[m * 3 + 2] = c.z + (rand() - .5) * 14;
  }
  word.t = 0; lastWordAt = now;
}

/* Buffers */
const BIRD_SEG = 5, birdPos = new Float32Array(N * BIRD_SEG * 6), birdCol = new Float32Array(N * BIRD_SEG * 6);
const webPos = new Float32Array(N * 7 * 6), webCol = new Float32Array(N * 7 * 6);
const FH = 28, falPos = new Float32Array(FH * 6), falCol = new Float32Array(FH * 6), falHist = [];
function lines(pos, col) {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage));
  g.setAttribute('color', new THREE.BufferAttribute(col, 3).setUsage(THREE.DynamicDrawUsage));
  const m = new THREE.LineBasicMaterial({ vertexColors: true, blending: THREE.AdditiveBlending, transparent: true, depthTest: false, depthWrite: false });
  const l = new THREE.LineSegments(g, m); l.frustumCulled = false; return l;
}
const birdsL = lines(birdPos, birdCol), webL = lines(webPos, webCol), falL = lines(falPos, falCol);
const flockScene = new THREE.Scene(); flockScene.add(webL, birdsL, falL);

const quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
const quad = new THREE.PlaneGeometry(2, 2);
const fadeMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: .3, depthTest: false, depthWrite: false });
const fadeScene = new THREE.Scene(); fadeScene.add(new THREE.Mesh(quad, fadeMat));

const VERT = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }';
const FRAG = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uTrail; uniform vec2 uRes; uniform float uTime, uDark, uScroll, uFalOn, uPulse, uPulseR, uDpr;
uniform vec3 uTop, uMid, uLow, uGlow, uInk, uHeat, uFalcon; uniform vec2 uFal, uPar; uniform vec4 uMask[6];
float rmask(vec4 r, vec2 p){ vec2 c = (r.xy + r.zw)*0.5, e = (r.zw - r.xy)*0.5 + 0.018; vec2 q = abs(p - c) - e; float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0); return 1.0 - smoothstep(0.0, 0.05, d); }
float hash(vec2 p){ p = fract(p*vec2(123.34,456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
float noise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x), f.y); }
float fbm(vec2 p){ float v=0.0, a=0.5; for(int i=0;i<4;i++){ v+=a*noise(p); p*=2.03; a*=0.5; } return v; }
void main(){
  vec2 uv = vUv; float asp = uRes.x/uRes.y; float y = uv.y;
  vec3 sky = mix(uLow, uMid, smoothstep(0.0, 0.55, y));
  sky = mix(sky, uTop, smoothstep(0.5, 1.0, y));
  vec2 q = vec2(uv.x*asp, uv.y);
  float c1 = fbm(q*vec2(1.4,3.0) + uPar*0.16 + vec2(uTime*0.006, uScroll*0.8));
  float c2 = fbm(q*vec2(3.2,6.5) + uPar*0.42 + vec2(-uTime*0.012, uScroll*1.9) + 7.1);
  float band = exp(-pow((y - 0.27 - uScroll*0.22)*4.0, 2.0));
  sky += uGlow * band * (0.10 + 0.26*c1) * mix(0.75, 1.0, uDark);
  sky *= 1.0 + (c1-0.5)*0.12 + (c2-0.5)*0.07;
  float mk = 0.0; for (int i = 0; i < 6; i++) mk = max(mk, rmask(uMask[i], vec2(uv.x*asp, uv.y)));
  float keep = 1.0 - 0.82*mk;
  vec4 t = texture2D(uTrail, uv)*keep;
  vec2 px = uDpr/uRes;
  vec3 h = vec3(0.0);
  for(int i=0;i<8;i++){ float a=float(i)*0.785398; h += texture2D(uTrail, uv + vec2(cos(a),sin(a))*px*4.5).rgb; }
  h *= 0.125*keep;
  vec3 col = sky;
  if (uDark > 0.5) { col += uInk*h.r*0.16 + uHeat*h.g*0.55 + uFalcon*h.b*0.4; }
  else { vec3 sh = texture2D(uTrail, uv + vec2(-4.0, 7.0)*px).rgb; col *= 1.0 - clamp(sh.r*0.16 + h.r*0.05, 0.0, 0.4); }
  col = mix(col, uInk, clamp(t.r, 0.0, 1.0)*0.92);
  col = mix(col, uHeat, clamp(t.g, 0.0, 1.0)*0.9);
  col = mix(col, uFalcon, clamp(t.b, 0.0, 1.0));
  vec2 d = (uv - uFal)*vec2(asp, 1.0); float r = length(d);
  float light = exp(-r*r*10.0)*uFalOn;
  float ring = exp(-pow((r - uPulseR)*18.0, 2.0))*uPulse;
  col += uGlow*(light*0.14 + ring*0.20)*mix(0.6, 1.0, uDark);
  float v = smoothstep(1.3, 0.3, length((uv-0.5)*vec2(asp*0.75, 1.0)));
  col *= mix(mix(0.94, 0.76, uDark), 1.0, v);
  col += (hash(uv*uRes + fract(uTime*7.0)*91.0) - 0.5)*mix(0.03, 0.045, uDark);
  gl_FragColor = vec4(col, 1.0);
}`;
const U = {
  uTrail: { value: null }, uRes: { value: new THREE.Vector2(1, 1) }, uTime: { value: 0 }, uDark: { value: 1 },
  uScroll: { value: 0 }, uFalOn: { value: 0 }, uPulse: { value: 0 }, uPulseR: { value: 0 }, uDpr: { value: DPR },
  uTop: { value: new THREE.Color() }, uMid: { value: new THREE.Color() }, uLow: { value: new THREE.Color() },
  uGlow: { value: new THREE.Color() }, uInk: { value: new THREE.Color() }, uHeat: { value: new THREE.Color() },
  uMask: { value: Array.from({ length: 6 }, () => new THREE.Vector4(-9, -9, -9, -9)) },
  uFalcon: { value: new THREE.Color() }, uFal: { value: new THREE.Vector2(.5, .4) }, uPar: { value: new THREE.Vector2() },
};
const compScene = new THREE.Scene();
compScene.add(new THREE.Mesh(quad, new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms: U, depthTest: false, depthWrite: false })));

let rt = null;
function makeRT(w, h) {
  if (rt) rt.dispose();
  const half = renderer.capabilities.isWebGL2;
  rt = new THREE.WebGLRenderTarget(w, h, { type: half ? THREE.HalfFloatType : THREE.UnsignedByteType, depthBuffer: false, stencilBuffer: false });
  U.uTrail.value = rt.texture;
  renderer.setRenderTarget(rt); renderer.setClearColor(0x000000, 1); renderer.clear(); renderer.setRenderTarget(null);
}
function readPalette() {
  const cs = getComputedStyle(root);
  const g = (n) => cs.getPropertyValue(n).trim();
  U.uTop.value.set(g('--sky-top')); U.uMid.value.set(g('--sky-mid')); U.uLow.value.set(g('--sky-low'));
  U.uGlow.value.set(g('--glow')); U.uInk.value.set(g('--ink')); U.uHeat.value.set(g('--heat')); U.uFalcon.value.set(g('--falcon'));
  U.uDark.value = root.getAttribute('data-theme') === 'light' ? 0 : 1;
}
function resize() {
  if (renderer) {
    renderer.setPixelRatio(DPR); renderer.setSize(innerWidth, innerHeight, false);
    const w = Math.round(innerWidth * DPR), h = Math.round(innerHeight * DPR);
    makeRT(w, h); U.uRes.value.set(w, h);
    camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); anchorAmp();
  }
  measure();
}

/* ── Simulation ── */
const tmp = new THREE.Vector3(), fwd = new THREE.Vector3(), rgt = new THREE.Vector3(), upv = new THREE.Vector3();
let frame = 0;
function neighbours(part) {
  const R2 = 95 * 95;
  for (let i = part; i < N; i += 3) {
    const o = i * 7; for (let k = 0; k < 7; k++) { NB[o + k] = -1; NBD[o + k] = R2; }
    const x = P[i * 3], y = P[i * 3 + 1], z = P[i * 3 + 2];
    for (let j = 0; j < N; j++) {
      if (j === i) continue;
      const dx = P[j * 3] - x; if (dx * dx > NBD[o + 6]) continue;
      const dy = P[j * 3 + 1] - y, dz = P[j * 3 + 2] - z, d = dx * dx + dy * dy + dz * dz;
      if (d >= NBD[o + 6]) continue;
      let k = 6; while (k > 0 && NBD[o + k - 1] > d) { NBD[o + k] = NBD[o + k - 1]; NB[o + k] = NB[o + k - 1]; k--; }
      NBD[o + k] = d; NB[o + k] = j;
    }
  }
}
function step(dt, t, fal, stoop) {
  frame++;
  neighbours(frame % 3);
  const W2 = innerWidth / 2, H2 = innerHeight / 2;
  const Rpx = (coarse ? 95 : 120) * (1 + stoop * 1.1);
  const ws = word.t >= 0 ? word.s : 0;
  const wi = word.t >= 0 ? new Map() : null;
  if (wi) word.birds.forEach((b, m) => wi.set(b, m));
  anchors.forEach((a) => {
    a.x = Math.cos(t * a.w + a.phi) * a.hw * .42;
    a.y = Math.sin(t * a.w * 1.27 + a.phi) * a.hh * .26 + a.hh * .2;
    a.zz = a.z + Math.sin(t * a.w * .8 + a.phi) * 50;
  });
  for (let i = 0; i < N; i++) {
    const i3 = i * 3, st = STEMS[flockOf[i]], a = anchors[flockOf[i]];
    let px = P[i3], py = P[i3 + 1], pz = P[i3 + 2], vx = V[i3], vy = V[i3 + 1], vz = V[i3 + 2];
    let ax = 0, ay = 0, az = 0, cx = 0, cy = 0, cz = 0, sx = 0, sy = 0, sz = 0, n = 0;
    for (let k = 0; k < 7; k++) {
      const j = NB[i * 7 + k]; if (j < 0) break;
      const j3 = j * 3; ax += V[j3]; ay += V[j3 + 1]; az += V[j3 + 2]; cx += P[j3]; cy += P[j3 + 1]; cz += P[j3 + 2]; n++;
      const d = Math.sqrt(NBD[i * 7 + k]) + 1e-3;
      if (d < 15) { const f = (15 - d) / (15 * d); sx += (px - P[j3]) * f; sy += (py - P[j3 + 1]) * f; sz += (pz - P[j3 + 2]) * f; }
    }
    const m = wi && wi.has(i) ? wi.get(i) : -1, own = m >= 0 ? 1 - .85 * ws : 1;
    let fx = 0, fy = 0, fz = 0;
    if (n) {
      fx += ((ax / n) - vx) * .055 + ((cx / n) - px) * .0016; fy += ((ay / n) - vy) * .055 + ((cy / n) - py) * .0016; fz += ((az / n) - vz) * .055 + ((cz / n) - pz) * .0016;
    }
    fx += sx * .14; fy += sy * .14; fz += sz * .14;
    fx += (a.x - px) * .0007; fy += (a.y - py) * .0009; fz += (a.zz - pz) * .0005;
    fx *= own; fy *= own; fz *= own;
    if (m >= 0) {
      const T = word.T, m3 = m * 3;
      fx += ((T[m3] - px) * .014 - vx * .07) * ws; fy += ((T[m3 + 1] - py) * .014 - vy * .07) * ws; fz += ((T[m3 + 2] - pz) * .014 - vz * .07) * ws;
      HEAT[i] = Math.max(HEAT[i], .32 * ws);
    }
    // The falcon: flee in screen space, so every bird under the pointer scatters, near or far.
    if (fal > .02) {
      tmp.set(px, py, pz).project(camera);
      if (tmp.z < 1) {
        const dx = (tmp.x - (falcon.x * 2 - 1)) * W2, dy = (tmp.y - (falcon.y * 2 - 1)) * H2, d = Math.hypot(dx, dy) + 1e-3;
        if (d < Rpx) {
          const s = (1 - d / Rpx); const f = s * s * (1.0 + stoop * 2.4) * fal;
          fx += dx / d * f; fy += dy / d * f; fz += (rand() - .5) * f * .6;
          HEAT[i] = Math.max(HEAT[i], s * (.5 + stoop * .5) * fal);
        }
      }
    }
    vx += fx * dt; vy += fy * dt; vz += fz * dt;
    const sp = Math.hypot(vx, vy, vz) + 1e-6, base = st.speed / 2;
    const lo = .9 * base, hi = (2.3 + stoop * 2.5 + (HEAT[i] > .2 ? 1.2 : 0)) * base + (m >= 0 ? 5 * ws : 0);
    const k = sp < lo * (m >= 0 ? 1 - .7 * ws : 1) ? lo * (m >= 0 ? 1 - .7 * ws : 1) / sp : sp > hi ? hi / sp : 1; vx *= k; vy *= k; vz *= k;
    V[i3] = vx; V[i3 + 1] = vy; V[i3 + 2] = vz;
    P[i3] = px + vx * dt; P[i3 + 1] = py + vy * dt; P[i3 + 2] = pz + vz * dt;
    if (m >= 0 && ws > 0) {   // ease onto the letter so the word reads, then let go
      const T = word.T, m3 = m * 3, e = 1 - Math.pow(1 - .085 * ws * ws, dt);
      P[i3] += (T[m3] - P[i3]) * e; P[i3 + 1] += (T[m3 + 1] - P[i3 + 1]) * e; P[i3 + 2] += (T[m3 + 2] - P[i3 + 2]) * e;
    }
    PH[i] += dt * (.16 + sp * .06);
    HEAT[i] *= Math.pow(.955, dt);
  }
}

/* ── Geometry: v3's bird, in 3D ── */
function draw() {
  const cz = camera.position.z;
  let b = 0, w = 0;
  for (let i = 0; i < N; i++) {
    const i3 = i * 3, st = STEMS[flockOf[i]];
    const px = P[i3], py = P[i3 + 1], pz = P[i3 + 2], dist = cz - pz;
    const df = smooth(25, 90, dist) * (1 - smooth(720, 1150, dist)) * (1 - .55 * smooth(150, 800, dist));
    const ink = st.alpha * 1.15 * df, heat = HEAT[i] * df;
    fwd.set(V[i3], V[i3 + 1], V[i3 + 2]); const spd = fwd.length(); fwd.multiplyScalar(1 / (spd + 1e-6));
    rgt.set(0, 1, 0).cross(fwd); if (rgt.lengthSq() < 1e-4) rgt.set(1, 0, 0); rgt.normalize();
    upv.copy(fwd).cross(rgt);
    const fc = (Math.sin(PH[i]) + 1) * .5, sc = st.size * 1.75;
    const hs = (1.5 + spd * .5) * sc * (.56 + .44 * fc), sw = hs * .28, hd = hs * .44, lift = (fc - .5) * hs * .7;
    const pts = [
      [px, py, pz], [px + fwd.x * hd, py + fwd.y * hd, pz + fwd.z * hd],
    ];
    for (const sgn of [-1, 1]) {
      const mx = px - fwd.x * sw * .3 + rgt.x * sgn * hs * .45 + upv.x * lift * .4, my = py - fwd.y * sw * .3 + rgt.y * sgn * hs * .45 + upv.y * lift * .4, mz = pz - fwd.z * sw * .3 + rgt.z * sgn * hs * .45 + upv.z * lift * .4;
      const tx = px - fwd.x * sw + rgt.x * sgn * hs + upv.x * lift, ty = py - fwd.y * sw + rgt.y * sgn * hs + upv.y * lift, tz = pz - fwd.z * sw + rgt.z * sgn * hs + upv.z * lift;
      pts.push([px, py, pz], [mx, my, mz], [mx, my, mz], [tx, ty, tz]);
    }
    for (const p of pts) { birdPos[b] = p[0]; birdPos[b + 1] = p[1]; birdPos[b + 2] = p[2]; birdCol[b] = ink; birdCol[b + 1] = heat; birdCol[b + 2] = 0; b += 3; }
    // The web: an edge to each of the 7 nearest neighbours.
    for (let k = 0; k < 7; k++) {
      const j = NB[i * 7 + k];
      if (j < 0) { webCol.fill(0, w, w + 6); w += 6; continue; }
      const j3 = j * 3, len = Math.sqrt(NBD[i * 7 + k]);
      const fade = (1 - len / 95) * df, wh = (HEAT[i] + HEAT[j]) * .5 * df;
      webPos[w] = px; webPos[w + 1] = py; webPos[w + 2] = pz; webPos[w + 3] = P[j3]; webPos[w + 4] = P[j3 + 1]; webPos[w + 5] = P[j3 + 2];
      webCol[w] = webCol[w + 3] = .16 * fade; webCol[w + 1] = webCol[w + 4] = wh * .85; webCol[w + 2] = webCol[w + 5] = 0;
      w += 6;
    }
  }
  birdsL.geometry.attributes.position.needsUpdate = true; birdsL.geometry.attributes.color.needsUpdate = true;
  webL.geometry.attributes.position.needsUpdate = true; webL.geometry.attributes.color.needsUpdate = true;
}

/* ── Frame ── */
const stats = { frames: 0, simMs: 0, drawMs: 0, gpuMs: 0, fps: 0, N, dpr: DPR, mode: 'live' };
window.__d2 = stats;
let running = false, rafId = 0, tPrev = 0, tSim = 0, idleSince = performance.now(), fpsAcc = 0, fpsN = 0;
const falWorld = new THREE.Vector3(), falPrev = new THREE.Vector3(); let falPrevOk = false;

function domMotion(now, live) {
  const vh = layout.vh, sy = scrollY;
  const hp = clamp(sy / vh, 0, 1);
  if (live) {
    tagline.style.transform = `translate3d(${par.x * -14}px, ${par.y * -9 - hp * 50}px, 0) scale(${1 - hp * .14})`;
    tagline.style.filter = hp > .01 ? `blur(${(hp * 6).toFixed(2)}px)` : 'none';
    tagline.style.opacity = (1 - hp * .7).toFixed(3);
    headings.forEach((h, k) => {
      const t = clamp((layout.heads[k] - sy - vh / 2) / (vh * .7), -1.3, 1.3);
      const s = t > 0 ? 1 + t * .26 : 1 + t * .14, bl = Math.max(0, Math.abs(t) - .18) * 4.2;
      h.style.transform = `translate3d(${par.x * 22 * (1 + t * .5)}px, ${t * 30}px, 0) scale(${s.toFixed(4)})`;
      h.style.filter = bl > .05 ? `blur(${bl.toFixed(2)}px)` : 'none';
      h.style.opacity = (1 - Math.max(0, Math.abs(t) - .55) * .9).toFixed(3);
      paras[k].style.transform = `translate3d(${par.x * -8}px, ${t * -14}px, 0)`;
    });
    // Wonky letters lean away from the falcon and spring back.
    const fxp = falcon.x * innerWidth, fyp = (1 - falcon.y) * innerHeight, on = U.uFalOn.value;
    for (const L of letters) {
      const y = L.cy - sy; if (y < -200 || y > vh + 200) continue;
      const dx = L.cx - fxp, dy = y - fyp, d = Math.hypot(dx, dy) + 1e-3, R = 170 * (1 + falcon.stoop);
      let tx = 0, ty = 0, tr = 0;
      if (d < R && on > .05) { const s = (1 - d / R) ** 2 * on; tx = dx / d * 26 * s; ty = dy / d * 26 * s; tr = (dx > 0 ? 1 : -1) * 18 * s; }
      L.ox += (tx - L.ox) * .16; L.oy += (ty - L.oy) * .16; L.orot += (tr - L.orot) * .16;
      L.el.style.transform = `translate(${L.ox.toFixed(2)}px, calc(${L.dy}em + ${L.oy.toFixed(2)}px)) rotate(${(L.rot + L.orot).toFixed(2)}deg)`;
    }
  }
  // The axis: a dot travels the page's time line; the room in view is marked.
  const s0 = layout.secs[0] - vh * .5, s1 = layout.secs[3] - vh * .35;
  const p = clamp((sy - s0) / (s1 - s0), 0, 1);
  axisDot.style.transform = `translateX(${(p * layout.axisW).toFixed(1)}px)`;
  let cur = -1; layout.secs.forEach((y, k) => { if (sy + vh * .5 >= y) cur = k; });
  axisLinks.forEach((a, k) => { if (k === cur) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
}

function frameFn(now) {
  rafId = requestAnimationFrame(frameFn);
  const dtMs = Math.min(50, now - (tPrev || now)); tPrev = now;
  const dt = clamp(dtMs / 16.667, .25, 2.2);
  if (dtMs > 0) { fpsAcc += 1000 / dtMs; fpsN++; if (fpsN >= 30) { stats.fps = Math.round(fpsAcc / fpsN); fpsAcc = fpsN = 0; } }
  tSim += dtMs / 1000;

  const sy = scrollY, maxS = Math.max(1, layout.docH - layout.vh), sp = clamp(sy / maxS, 0, 1);
  par.x += (par.tx - par.x) * .06; par.y += (par.ty - par.y) * .06;
  camera.position.set(par.x * 34, -par.y * 20, CAM0 - sp * DIVE);
  camera.lookAt(par.x * 10, -par.y * 6, camera.position.z - 400);
  camera.updateMatrixWorld();

  // Falcon presence: on while moving, resting after 2.2 s still (the flock settles; the words can return).
  const idle = now - falcon.last;
  const want = falcon.target * (idle < 2200 ? 1 : .25);
  U.uFalOn.value += (want - U.uFalOn.value) * .08;
  falcon.stoop = Math.max(0, falcon.stoop - dtMs / 1100);
  if (falcon.moved) { idleSince = now; falcon.moved = false; }
  if (sp < .06 && now - idleSince > 5200) formWord(now);
  if (layout.secs[3] - sy < layout.vh * .55) formWord(now);
  if (word.t >= 0) {
    word.t += dtMs / 1000;
    word.s = word.t < 1.8 ? smooth(0, 1.8, word.t) : word.t < 5.2 ? 1 : 1 - smooth(5.2, 6.8, word.t);
    if (word.t > 6.8) word.t = -1;
  }

  readMasks();
  const t0 = performance.now();
  step(dt, tSim, U.uFalOn.value, falcon.stoop);
  const t1 = performance.now();
  draw();
  // The visitor's own path: D's red line, drawn into the trail buffer and left to fade.
  tmp.set(falcon.x * 2 - 1, falcon.y * 2 - 1, .5).unproject(camera).sub(camera.position).normalize();
  fwd.set(0, 0, -1).applyQuaternion(camera.quaternion);
  falWorld.copy(camera.position).addScaledVector(tmp, FAL_D / Math.max(.2, tmp.dot(fwd)));
  if (falPrevOk && U.uFalOn.value > .25 && falWorld.distanceTo(falPrev) > .5 && falWorld.distanceTo(falPrev) < 120) {
    falHist.push([falPrev.x, falPrev.y, falPrev.z, falWorld.x, falWorld.y, falWorld.z, now]);
    if (falHist.length > FH) falHist.shift();
  }
  falCol.fill(0);
  falHist.forEach((h, k) => {
    const age = (now - h[6]) / 1400, a = Math.max(0, 1 - age) * .9;
    falPos.set(h.slice(0, 6), k * 6); falCol[k * 6 + 2] = falCol[k * 6 + 5] = a;
  });
  falL.geometry.attributes.position.needsUpdate = true; falL.geometry.attributes.color.needsUpdate = true;
  falPrev.copy(falWorld); falPrevOk = true;

  // Long exposure deepens as you dive: short wing blur at the top, D's trails further down.
  fadeMat.opacity = .34 - smooth(.05, .7, sp) * .25 + (word.t >= 0 ? word.s * .3 : 0);
  renderer.setRenderTarget(rt);
  renderer.render(fadeScene, quadCam);
  renderer.render(flockScene, camera);
  renderer.setRenderTarget(null);
  U.uTime.value = tSim; U.uScroll.value = sp; U.uFal.value.set(falcon.x, falcon.y); U.uPar.value.set(par.x, par.y);
  U.uPulse.value = falcon.stoop; U.uPulseR.value = (1 - falcon.stoop) * .55;
  renderer.render(compScene, quadCam);
  const t2 = performance.now();
  stats.frames++; stats.simMs = stats.simMs * .95 + (t1 - t0) * .05; stats.drawMs = stats.drawMs * .95 + (t2 - t1) * .05;
  domMotion(now, true);
}

function renderStill() {
  // Reduced motion: a still composition. Settle the flock off-screen, then draw it once, crisp.
  stats.mode = 'still';
  root.classList.add('still');
  if (!renderer) return;
  camera.position.set(0, 0, CAM0); camera.lookAt(0, 0, CAM0 - 400); camera.updateMatrixWorld();
  if (!stats.settled) { for (let s = 0; s < 260; s++) step(1, s / 60, 0, 0); stats.settled = true; }
  draw(); falCol.fill(0); falL.geometry.attributes.color.needsUpdate = true;
  renderer.setRenderTarget(rt); renderer.setClearColor(0x000000, 1); renderer.clear(); renderer.render(flockScene, camera); renderer.setRenderTarget(null);
  readMasks();
  U.uTime.value = 12; U.uScroll.value = 0; U.uFalOn.value = 0; U.uPulse.value = 0; U.uPar.value.set(0, 0);
  renderer.render(compScene, quadCam);
  tagline.style.cssText = ''; headings.forEach((h, k) => { h.style.cssText = ''; paras[k].style.cssText = ''; });
  placeWonkyBase();
  domMotion(performance.now(), false);
}

function start() {
  if (running || !renderer) return;
  root.classList.remove('still'); stats.mode = 'live';
  running = true; tPrev = 0; rafId = requestAnimationFrame((t) => { tPrev = t; frameFn(t); });
}
function stop() { running = false; cancelAnimationFrame(rafId); }
function decide() {
  readPalette();
  syncTiltBtn();
  if (reducedMotion()) { stop(); renderStill(); }
  else if (document.hidden) stop();
  else start();
}


if (renderer) {
  canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); stop(); });
  canvas.addEventListener('webglcontextrestored', () => { resize(); decide(); });
}
addEventListener('resize', () => { resize(); if (!running) decide(); });
addEventListener('scroll', () => { if (!running) domMotion(performance.now(), false); }, { passive: true });
document.addEventListener('visibilitychange', decide);
new MutationObserver(() => { labelAtmos(); decide(); }).observe(root, { attributes: true, attributeFilter: ['data-theme', 'data-lib-motion'] });
try { matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', decide); } catch (e) {}
document.fonts && document.fonts.ready.then(() => { measure(); });
resize();
decide();
