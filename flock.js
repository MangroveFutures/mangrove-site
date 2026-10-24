/* Mangrove, direction D2 (draft, 23 Oct 2026, Cooper).
   The flock: Mangrove-main `surfaces/csm_murmurations_v3.html` (seven flocks on seven depth layers,
   stroked birds with flapping, swept wings), rebuilt in true 3D with three.js r170, plus the web that
   joins each bird to its 7 nearest neighbours (topological interaction, Ballerini et al. 2008, PNAS).
   The visitor's pointer or finger is a falcon. Plain JavaScript, no build step. */
import * as THREE from './vendor/three/three.module.min.js';
import { Flock3D } from './vendor/choreotope/flock3d.js';                       // Rosie's Choreotope flock, unchanged
import { STEPS, parsePhrase, poseAt, skeletonLocal } from './vendor/choreotope/steps.js';   // and her dance vocabulary

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

/* ══ FLOW: every flocking choice in one block, with its reason (flow-lab candidate, Cooper, 24 Oct 2026) ══
   Where each part comes from (flow-lab REPORT.md has the table):
   - The flock is Rosie's Choreotope engine, imported unchanged: Flock3D (MangroveFutures/studio,
     packages/choreotope/app/src/lib/flock/flock3d.ts): 7 nearest neighbours, separation, alignment, cohesion,
     pull to targets, a swirl, a cruise-speed band.
   - What each flock follows: an invisible dancer performing the Atlas phrase (atlas/main.ts, lib/pose/steps.ts),
     placed as the Atlas places its sculpted dancer (lib/stage3d/sculpt.ts).
   - What carries each dancer across the sky: v3's steering (Mangrove-main surfaces/csm_murmurations_v3.html):
     a random-walk turn rate, gravity towards the centre only when far out, wander, and a soft edge.
   - The look on top is D2's: v3's stroked birds in 3D, the web to the 7 nearest, the falcon, the dive, the word.
   Change a number here, never in the code below. Test overrides: ?flocks=2|3 ?seed=<n> ?f.<key>=<number>. */
const Q = new URLSearchParams(location.search);
const FLOW = {
  seed: +Q.get('seed') || 20261023,  // fixed random seed: the same seed and preset give the same frames (stills, video)
  hz: 60,                            // fixed simulation step, as the Atlas and v3 both stepped at 60 Hz
  maxSteps: 4,                       // a slow device catches up at most 4 steps a frame, then slows down rather than jumps
  // Flocks, front to back: D2's depths and bird sizes; each has its own dancer. Two by default (Rosie, 24 Oct 2026:
  // fewer, larger flocks), one on a phone; ?flocks=1|2|3 to choose. canon: beats behind the first dancer (Choreotope's canon, steps.ts
  // movementScore). turn: v3's turnDir, the way the dancer first tends to turn.
  flocks: (Q.get('flocks') === '1' || (!Q.get('flocks') && Math.min(innerWidth, innerHeight) < 600))
    ? [{ share: 1, size: 1.8, alpha: .74, z: 150, canon: 0, turn: 1 }]   // a phone: one flock (fewer than about 150 birds a flock break into knots; measured)
    : Q.get('flocks') !== '3'
    ? [{ share: .55, size: 1.8, alpha: .74, z: 150, canon: 0, turn: 1 },
       { share: .45, size: 1.5, alpha: .70, z: 40, canon: 6, turn: -1 }]
    : [{ share: .40, size: 1.8, alpha: .74, z: 150, canon: 0, turn: 1 },
       { share: .33, size: 1.5, alpha: .70, z: 40, canon: 6, turn: -1 },
       { share: .27, size: 1.25, alpha: .66, z: -80, canon: 12, turn: 1 }],
  // Flock3D settings. From the Atlas duet: speed 1.6 m/s, bounds 2.6 m, swirl 0.4. From Flock3D's own defaults: cohesion 1,
  // alignment 1 (the Atlas's 2.2 cohesion hugs a body). From the app registry's default: separation 1.3. attract 1.2 sits
  // between Flock3D's default (1) and the Atlas (2.6): one target, so a softer pull keeps the mass large (measured).
  speed: 1.6, bounds: 2.6, cohesion: 1, alignment: 1, separation: 1.3, attract: 1.2, swirl: .4,
  phrase: 'two pliés, relevé, tendu, port de bras, arabesque, pirouette, sauté, attitude, révérence',  // the Atlas phrase
  bps: 72 / 60 * .85,                // the Atlas tempo: 72 beats a minute, played at 0.85
  follow: 1,                         // joints the flock follows: 1 (right hand), 2 (hands) or 5 (hands, feet, head, as the Atlas).
                                     // 5 splits a sky flock into five knots; 1 keeps it one mass (measured)
  skyMetres: 2,                      // half the screen's SHORTER side, in the dancers' metres: sets how large a flock looks on any screen
  time: .33,                         // playback speed of the dance and the flock (1 = the Atlas). Slower keeps every shape; only the
                                     // pace changes. .33: median bird speed about 125 px/s on a 900 px screen, between D2 (112) and v3 (134)
  floorPx: 300,                      // the Atlas floor sits this far below the screen's bottom edge, so flocks are not pinned to it
  startSpread: .35,                  // Flock3D starts birds in a ring 1.2 to 3.4 m out; a tighter start forms one mass sooner
  prewarm: 3,                        // seconds simulated before the first frame, so the page opens on a formed flock
  // The dancer's travel: one v3 bird at a steady pace, turning by v3's rules.
  travel: .34,                       // metres a second: about 75 px/s on a 900 px screen; a flock crosses a laptop screen in about 20 s
  turn: { start: .0018, step: .000022, max: .007, decay: .9988 },  // v3 steering drift
  spread: .32, gravity: .000024,     // v3 centre gravity (v3 starts at 40% of the shorter side; 32% here, as a whole flock rides on it)
  edge: -.32, boundPush: .12,        // v3 soft edge, moved inside the screen by 32% of the shorter side (v3: 100 px outside, for single
                                     // birds). The dancer turns there; the flock's far side still sweeps off the edge and back
  skyOne: 2.8, timeOne: .45,         // with one flock (a phone): a smaller flock on the narrow screen, at the same pace across it (measured)
  edgeOne: -.32,                     // with one flock (a phone) the flock is the whole sky, so its dancer turns further in (measured: at -.32
                                     // one seed left the phone nearly empty 11% of the time)
  wander: .012,                      // v3 wander
  falcon: 1,                         // strength of the pointer-falcon scatter (D2's)
};
/* The word moment: the flock briefly writes "mangrove". D2's timing and wobble, changed only where it hurt reading. */
const WORD = {
  weight: 800,      // Bricolage Grotesque weight. D2 used 520: its strokes were thinner than a bird
  outline: 10,      // canvas px of outline drawn round each letter, which thickens thin joins (the arch of the m)
  spacing: 1.0,     // letter advance, in letter widths. D2 used .93, so neighbouring letters touched ("rn" for "m")
  jitterPx: 3,      // each letter's playful up-down shift, in canvas px (D2: 13). Kept small: more hurt reading on the iPad
  tilt: .02,        // each letter's playful tilt, radians either way (D2: .1). Kept small for the same reason
  share: .82,       // share of all birds that write the word (D2's)
  shrink: .4,       // birds draw this much smaller while they hold a letter, so strokes stay crisp
  brighten: .5,     // letter birds draw this much brighter while they hold (smaller birds would otherwise read dimmer)
  width: .68,       // the word's width as a share of the screen on a wide screen (D2: .56)
  widthPhone: .84,  // and on a tall screen (D2: .78)
  webFade: .95,     // the web fades this much between letter birds while the word holds (the lines bridged the gaps)
};
for (const [k, v] of Q) if (k.startsWith('w.') && k.slice(2) in WORD) WORD[k.slice(2)] = +v;   // lab sweeps only
for (const [k, v] of Q) if (k.startsWith('f.') && k.slice(2) in FLOW) FLOW[k.slice(2)] = +v;   // lab sweeps only, e.g. ?f.travel=1.2
let seed = FLOW.seed;
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

/* Flocks: contiguous blocks of birds, one Flock3D per row of FLOW.flocks. */
const STEMS = FLOW.flocks;
if (STEMS.length === 1) { FLOW.skyMetres = FLOW.skyOne; FLOW.time = FLOW.timeOne; }   // a phone
const totalN = STEMS.reduce((a, s) => a + s.share, 0);
const flockOf = new Uint8Array(N);
{ let i = 0; STEMS.forEach((s, k) => { const c = k === STEMS.length - 1 ? N - i : Math.round(N * s.share / totalN); s.i0 = i; for (let j = 0; j < c && i < N; j++) flockOf[i++] = k; s.i1 = i; }); }

const FOV = 50, CAM0 = 430, DIVE = 660, FAL_D = 300;
const camera = new THREE.PerspectiveCamera(FOV, innerWidth / innerHeight, 1, 2000);
camera.position.set(0, 0, CAM0);
const halfTan = Math.tan(THREE.MathUtils.degToRad(FOV / 2));

const P = new Float32Array(N * 3), V = new Float32Array(N * 3), PH = new Float32Array(N), HEAT = new Float32Array(N);
const KNN = 7, NB = new Int32Array(N * KNN).fill(-1), NBD = new Float32Array(N * KNN);
/* The sky in the dancers' metres. Screen height = 2 x skyMetres; the Atlas floor (y = 0.15 m) sits 100 px below the
   bottom edge. pxm: v3 pixels per metre (v3's constants are in pixels on a 900 px-tall screen). */
const SKY = { pxm: 1, yMid: 0, hwM: 1, hhM: 1 };
/* Per flock: the view's half-size at its depth (hw, hh, world units), world units per metre (S), its Flock3D, its dancer. */
const anchors = STEMS.map((s, k) => ({ z: s.z, hh: 1, hw: 1, S: 1 }));
function anchorAmp() {
  const asp = innerWidth / innerHeight, sh = Math.min(innerWidth, innerHeight);
  SKY.pxm = sh / 2 / FLOW.skyMetres;                       // screen pixels per metre (v3's constants are in screen pixels)
  SKY.hwM = innerWidth / 2 / SKY.pxm; SKY.hhM = innerHeight / 2 / SKY.pxm;
  anchors.forEach((a) => { const d = CAM0 - a.z; a.hh = d * halfTan; a.hw = a.hh * asp; a.S = Math.min(a.hw, a.hh) / FLOW.skyMetres; });
}
anchorAmp();
SKY.yMid = .15 + SKY.hhM + FLOW.floorPx * Math.min(innerWidth, innerHeight) / 900 / SKY.pxm;   // fixed at load, so a resize never moves the sky
const PHRASE = (() => {
  const steps = parsePhrase(FLOW.phrase, false), starts = []; let len = 0;
  for (const s of steps) { starts.push(len); len += STEPS[s].beats; }
  return { len, at(beat) { const b = ((beat % len) + len) % len; let i = steps.length - 1; while (i > 0 && b < starts[i]) i--; return poseAt(steps[i], Math.min(.9999, (b - starts[i]) / STEPS[steps[i]].beats)); } };
})();
const M_PER_UNIT = 1.75;                 // Choreotope lib/stage3d/sculpt.ts: body units to metres
const JOINTS = FLOW.follow === 1 ? ['rh'] : FLOW.follow === 2 ? ['lh', 'rh'] : ['lh', 'rh', 'lf', 'rf', 'head'];
/* The dancer's hands, feet and head in metres, as SculptedDancer.update() places them, moved to the dancer's place. */
function dancerTargets(pose, X, Y) {
  const spin = pose.spin * Math.PI * 2, L = skeletonLocal(pose), lowest = Math.max(L.lf[1], L.rf[1]), lift = lowest + pose.rise * .04 + pose.lift;
  const cs = Math.cos(spin), sn = Math.sin(spin);
  return JOINTS.map((k) => { const x = -L[k][0] * M_PER_UNIT, y = (lift - L[k][1]) * M_PER_UNIT, z = L[k][2] * M_PER_UNIT; return [X + x * cs + z * sn, Y - 1.2 + y, -x * sn + z * cs]; });
}
const flocks = STEMS.map((s, k) => {
  const f = new Flock3D({ count: s.i1 - s.i0, speed: FLOW.speed, bounds: FLOW.bounds }, FLOW.seed + k);
  f.cohesion = FLOW.cohesion; f.alignment = FLOW.alignment; f.separation = FLOW.separation; f.attract = FLOW.attract; f.swirl = FLOW.swirl;
  // The dancer starts in its own part of the sky, heading a random way.
  const X = (k - (STEMS.length - 1) / 2) * SKY.hwM * .7 + (rand() - .5) * SKY.hwM * .3, Y = SKY.yMid + (rand() - .5) * FLOW.skyMetres * .8;
  const h = rand() * 6.28;
  const d = { X, Y, vx: Math.cos(h) * FLOW.travel / FLOW.hz, vy: Math.sin(h) * FLOW.travel / FLOW.hz, turnRate: FLOW.turn.start * s.turn, wa: rand() * 6.28 };
  const sp0 = FLOW.startSpread;
  for (let i = 0; i < f.n; i++) { f.pos[i * 3] = X + f.pos[i * 3] * sp0; f.pos[i * 3 + 1] = Y + (f.pos[i * 3 + 1] - 1.7) * sp0; f.pos[i * 3 + 2] *= sp0; }
  return { f, d };
});
/* Metres to world units, per flock. */
function toWorld(k) {
  const s = STEMS[k], a = anchors[k], f = flocks[k].f, S = a.S, vS = S / FLOW.hz * FLOW.time;
  for (let i = 0; i < f.n; i++) {
    const g = (s.i0 + i) * 3;
    P[g] = f.pos[i * 3] * S; P[g + 1] = (f.pos[i * 3 + 1] - SKY.yMid) * S; P[g + 2] = a.z + f.pos[i * 3 + 2] * S;
    V[g] = f.vel[i * 3] * vS; V[g + 1] = f.vel[i * 3 + 1] * vS; V[g + 2] = f.vel[i * 3 + 2] * vS;
  }
}
STEMS.forEach((s, k) => toWorld(k));
for (let i = 0; i < N; i++) PH[i] = rand() * 6.28;

/* Word targets: the flock briefly writes "mangrove" in wonky letters. */
let wordPts = null;
async function buildWord() {
  // Its own seeded random numbers: this runs after the font loads, so sharing the flock's generator would make frames
  // depend on load timing (found in flow-lab; the live page has this fault).
  let ws = FLOW.seed ^ 0x9e3779b9; const wr = () => { ws = (ws * 1664525 + 1013904223) >>> 0; return ws / 4294967296; };
  const Wd = WORD;
  try { await document.fonts.load(`${Wd.weight} 200px "Bricolage Grotesque"`); } catch (e) {}
  const c = document.createElement('canvas'); c.width = 1300; c.height = 300;
  const x = c.getContext('2d');
  x.font = `${Wd.weight} 210px "Bricolage Grotesque", sans-serif`; x.fillStyle = '#fff'; x.textBaseline = 'alphabetic';
  let cx = 30; const s = 'mangrove';
  for (let i = 0; i < s.length; i++) {
    const w = x.measureText(s[i]).width;
    x.save(); x.translate(cx + w / 2, 205 + (wr() - .5) * 2 * Wd.jitterPx); x.rotate((wr() - .5) * 2 * Wd.tilt);
    x.fillText(s[i], -w / 2, 0); if (Wd.outline) { x.lineWidth = Wd.outline; x.lineJoin = 'round'; x.strokeStyle = '#fff'; x.strokeText(s[i], -w / 2, 0); }
    x.restore(); cx += w * Wd.spacing + Wd.outline;
  }
  const W = Math.min(c.width, cx + 30), img = x.getImageData(0, 0, c.width, c.height).data;
  // Sample the letters on an even grid, as fine as the birds allow, so every stroke is covered (D2 took a random third
  // of a 7 px grid, which left strokes patchy).
  const M = Math.round(N * Wd.share), ink = (xx, y) => img[(Math.round(y) * c.width + Math.round(xx)) * 4 + 3] > 140;
  let st = 3, pts = [];
  for (;; st += .25) {
    pts = [];
    for (let y = st / 2; y < 300; y += st) for (let xx = st / 2; xx < W; xx += st) if (ink(xx, y)) pts.push([(xx / W) - .5, (.5 - y / 300) * (300 / W)]);
    if (pts.length <= M) break;
  }
  for (let i = pts.length - 1; i > 0; i--) { const j = Math.floor(wr() * (i + 1)); [pts[i], pts[j]] = [pts[j], pts[i]]; }
  wordPts = pts;
}
buildWord();
const word = { t: -1, birds: null, T: null };
let lastWordAt = -1e9;
function formWord(now) {
  if (!wordPts || word.t >= 0 || now - lastWordAt < 15000) return;
  const M = Math.min(wordPts.length, Math.round(N * WORD.share));
  const dir = new THREE.Vector3(); camera.getWorldDirection(dir);
  const c = camera.position.clone().addScaledVector(dir, 340);
  const vw = 340 * halfTan * camera.aspect * 2 * (camera.aspect < 1 ? WORD.widthPhone : WORD.width);
  const pick = [...Array(N).keys()].sort((a, b) => Math.abs(P[a * 3 + 2] - c.z) - Math.abs(P[b * 3 + 2] - c.z)).slice(0, M).sort(() => rand() - .5);
  word.birds = new Int32Array(pick); word.T = new Float32Array(M * 3);
  word.map = new Map(); pick.forEach((b, m) => word.map.set(b, m));
  for (let m = 0; m < M; m++) {
    const [u, v] = wordPts[m]; word.T[m * 3] = c.x + u * vw; word.T[m * 3 + 1] = c.y + v * vw + 30; word.T[m * 3 + 2] = c.z + (rand() - .5) * 14;
  }
  word.t = 0; lastWordAt = now;
}

/* Buffers */
const BIRD_SEG = 5, birdPos = new Float32Array(N * BIRD_SEG * 6), birdCol = new Float32Array(N * BIRD_SEG * 6);
const webPos = new Float32Array(N * KNN * 6), webCol = new Float32Array(N * KNN * 6);
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
/* The dancer's travel: one v3 bird (v3 loop(), unloaded values), in metres, at a steady pace. */
function travel(d, k) {
  const F = FLOW, T = F.turn, pxm = SKY.pxm;
  d.turnRate += (rand() - .5) * T.step;                       // v3: slow random walk of the turn rate
  d.turnRate = clamp(d.turnRate, -T.max, T.max) * T.decay;    // v3: capped, gently pulled back to zero
  const ct = Math.cos(d.turnRate), st = Math.sin(d.turnRate);
  let vx = d.vx * ct - d.vy * st, vy = d.vx * st + d.vy * ct; // v3: steer by rotating the velocity
  // v3: centre gravity, only far out. v3's zone is a circle on the shorter side; here it is stretched to the screen's shape
  // (an ellipse), so on a tall phone a flock reaches the top and bottom too (ours, not v3's).
  const dx = -d.X, dy = SKY.yMid - d.Y, sm = Math.min(SKY.hwM, SKY.hhM), dC = Math.hypot(dx * sm / SKY.hwM, dy * sm / SKY.hhM), thr = sm * 2 * F.spread;
  if (dC > thr) { const g = (dC - thr) * pxm * F.gravity; vx += dx * sm / SKY.hwM * g; vy += dy * sm / SKY.hhM * g; }
  d.wa += (rand() - .5) * F.wander * 3.8; vx += Math.cos(d.wa) * F.wander / pxm; vy += Math.sin(d.wa) * F.wander / pxm;   // v3: wander
  const e = (STEMS.length === 1 ? F.edgeOne : F.edge) * Math.min(SKY.hwM, SKY.hhM) * 2, bx = SKY.hwM + e, by = SKY.hhM + e, bp = F.boundPush / pxm;   // v3: soft edge
  if (d.X < -bx) vx += bp; else if (d.X > bx) vx -= bp;
  if (d.Y - SKY.yMid < -by) vy += bp; else if (d.Y - SKY.yMid > by) vy -= bp;
  const sp = Math.hypot(vx, vy) + 1e-9, cruise = F.travel / F.hz;   // a dancer keeps a steady pace (v3's birds varied)
  d.vx = vx / sp * cruise; d.vy = vy / sp * cruise; d.X += d.vx; d.Y += d.vy;
}
function step(dt, t, fal, stoop) {
  frame++;
  const W2 = innerWidth / 2, H2 = innerHeight / 2;
  const Rpx = (coarse ? 95 : 120) * (1 + stoop * 1.1);
  const ws = word.t >= 0 ? word.s : 0, wi = word.t >= 0 ? word.map : null, h = 1 / FLOW.hz;
  STEMS.forEach((s, k) => {
    const { f, d } = flocks[k], a = anchors[k], S = a.S;
    travel(d, k);
    f.centre[0] = d.X; f.centre[1] = d.Y; f.centre[2] = 0;
    const targets = dancerTargets(PHRASE.at(t * FLOW.time * FLOW.bps - s.canon), d.X, d.Y);
    // The falcon (D2's): flee in screen space, so every bird under the pointer scatters, near or far.
    if (fal > .02) {
      for (let i = 0; i < f.n; i++) {
        const g = s.i0 + i;
        tmp.set(P[g * 3], P[g * 3 + 1], P[g * 3 + 2]).project(camera); if (tmp.z >= 1) continue;
        const dx = (tmp.x - (falcon.x * 2 - 1)) * W2, dy = (tmp.y - (falcon.y * 2 - 1)) * H2, dd = Math.hypot(dx, dy) + 1e-3;
        if (dd < Rpx) {
          const q = 1 - dd / Rpx, fo = q * q * (1 + stoop * 2.4) * fal * FLOW.falcon * FLOW.hz / (S * FLOW.time);   // D2's push, in m/s
          f.vel[i * 3] += dx / dd * fo; f.vel[i * 3 + 1] += dy / dd * fo; f.vel[i * 3 + 2] += (rand() - .5) * fo * .6;
          HEAT[g] = Math.max(HEAT[g], q * (.5 + stoop * .5) * fal);
        }
      }
    }
    f.step(h * FLOW.time, targets);                               // Rosie's Flock3D, unchanged
    // The word: birds chosen for a letter are drawn onto it and held there, then let go.
    if (wi && ws > 0) {
      const e = ws * ws;
      for (let i = 0; i < f.n; i++) {
        const m = wi.get(s.i0 + i); if (m === undefined) continue;
        const T = word.T, m3 = m * 3, tx = T[m3] / S, ty = T[m3 + 1] / S + SKY.yMid, tz = (T[m3 + 2] - a.z) / S;
        f.pos[i * 3] += (tx - f.pos[i * 3]) * e; f.pos[i * 3 + 1] += (ty - f.pos[i * 3 + 1]) * e; f.pos[i * 3 + 2] += (tz - f.pos[i * 3 + 2]) * e;
        HEAT[s.i0 + i] = Math.max(HEAT[s.i0 + i], .32 * ws);
      }
    }
    toWorld(k);
    // The web: Flock3D's own 7 nearest neighbours, as global indices with their distances.
    for (let i = 0; i < f.n; i++) {
      const g = s.i0 + i;
      for (let q = 0; q < KNN; q++) {
        const j = f.nbr[i * KNN + q], o = g * KNN + q;
        if (j < 0) { NB[o] = -1; continue; }
        const jg = s.i0 + j, dx = P[jg * 3] - P[g * 3], dy = P[jg * 3 + 1] - P[g * 3 + 1], dz = P[jg * 3 + 2] - P[g * 3 + 2];
        NB[o] = jg; NBD[o] = dx * dx + dy * dy + dz * dz;
      }
      const sp = Math.hypot(V[g * 3], V[g * 3 + 1], V[g * 3 + 2]);
      PH[g] += dt * (.16 + sp / a.hh * 450 * .02);              // wingbeat quickens with screen speed
      HEAT[g] *= Math.pow(.955, dt);
    }
  });
}

/* ── Geometry: v3's bird, in 3D ── */
function draw() {
  const cz = camera.position.z;
  let b = 0, w = 0;
  for (let i = 0; i < N; i++) {
    const i3 = i * 3, st = STEMS[flockOf[i]];
    const px = P[i3], py = P[i3 + 1], pz = P[i3 + 2], dist = cz - pz;
    const df = smooth(25, 90, dist) * (1 - smooth(720, 1150, dist)) * (1 - .55 * smooth(150, 800, dist));
    const inW = word.t >= 0 && word.map && word.map.has(i) ? word.s : 0;   // 1 while this bird holds a letter
    const ink = st.alpha * 1.15 * df * (1 + WORD.brighten * inW), heat = HEAT[i] * df;
    fwd.set(V[i3], V[i3 + 1], V[i3 + 2]); const spd = fwd.length(); fwd.multiplyScalar(1 / (spd + 1e-6));
    if (inW > 0) { fwd.lerp(tmp.set(1, 0, 0), inW).normalize(); }   // letter birds face one way while they hold, as one flock
    rgt.set(0, 1, 0).cross(fwd); if (rgt.lengthSq() < 1e-4) rgt.set(1, 0, 0); rgt.normalize();
    upv.copy(fwd).cross(rgt);
    const fc = (Math.sin(PH[i]) + 1) * .5, sc = st.size * 1.75 * Math.sqrt(anchors[flockOf[i]].S / (anchors[flockOf[i]].hh / 2)) * (1 - WORD.shrink * inW);   // birds shrink with the flock on a narrow screen (1 on a laptop)
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
    for (let k = 0; k < KNN; k++) {
      const j = NB[i * KNN + k];
      if (j < 0) { webCol.fill(0, w, w + 6); w += 6; continue; }
      const j3 = j * 3, len = Math.sqrt(NBD[i * KNN + k]);
      const inJ = Math.max(inW, word.t >= 0 && word.map && word.map.has(j) ? word.s : 0);   // either end holding a letter
      const fade = (1 - len / 95) * df * (1 - WORD.webFade * inJ), wh = (HEAT[i] + HEAT[j]) * .5 * df * (1 - WORD.webFade * inJ);
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

/* One fixed simulation step (1/60 s). The frame loop runs as many as real time asks for (at most FLOW.maxSteps);
   the lab harness calls it directly. Time inside the simulation never depends on the frame rate. */
let simAcc = 0, idleSim = 0;
function wordEnvelope(t) { return t < 1.8 ? smooth(0, 1.8, t) : t < 5.2 ? 1 : 1 - smooth(5.2, 6.8, t); }
function simTick(h) {
  tSim += h; idleSim += h;
  if (word.t >= 0) { word.t += h; word.s = wordEnvelope(word.t); if (word.t > 6.8) word.t = -1; }
  step(1, tSim, U.uFalOn.value, falcon.stoop);
}
function frameFn(now) {
  rafId = requestAnimationFrame(frameFn);
  const dtMs = Math.min(100, now - (tPrev || now)); tPrev = now;
  if (dtMs > 0) { fpsAcc += 1000 / dtMs; fpsN++; if (fpsN >= 30) { stats.fps = Math.round(fpsAcc / fpsN); fpsAcc = fpsN = 0; } }
  simAcc += dtMs / 1000;

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
  if (falcon.moved) { idleSim = 0; falcon.moved = false; }
  if (sp < .06 && idleSim > 5.2) formWord(tSim * 1000);
  if (layout.secs[3] - sy < layout.vh * .55) formWord(tSim * 1000);

  readMasks();
  const t0 = performance.now(), h = 1 / FLOW.hz;
  let steps = 0;
  while (simAcc >= h && steps < FLOW.maxSteps) { simTick(h); simAcc -= h; steps++; }
  if (steps === FLOW.maxSteps) simAcc = Math.min(simAcc, h);   // too slow: run slower, never jump
  if (!steps) { domMotion(now, true); return; }                 // a 120 Hz screen: nothing moved, keep the last image
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
for (let s = 0, n = Math.round(FLOW.prewarm * FLOW.hz); s < n; s++) { tSim += 1 / FLOW.hz; step(1, tSim, 0, 0); }   // pre-warm
stats.prewarmed = true;
decide();
