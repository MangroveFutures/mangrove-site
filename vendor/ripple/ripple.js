/* Pond: still water seen from above. Throw a pebble and the rings spread, cross, bounce off nothing and fade.
   Sibling of the murmuration (packages/murmuration, the site's flock.js): there the pointer is a falcon that
   scatters the flock; here a click or a tap throws a pebble into the pond.

   What is borrowed, not invented (19 Nov 2026):
   - The water is the 2D wave equation on a height field, stepped with the damped scheme from Hugo Elias's
     "2D water" and Evan Wallace's WebGL Water (MIT, github.com/evanw/webgl-water): each cell's velocity moves
     towards the average of its four neighbours, is damped a little, then moves the height.
   - Edges absorb rather than reflect (a sponge layer, the usual trick in wave solvers), so the pond reads as
     open water, not a bath.
   - Looking down, you see mostly the bed: refraction bends the bed by the surface slope (Snell, small-angle),
     the water absorbs red first (Beer-Lambert), and a little sky is reflected where the surface tilts (Schlick's
     Fresnel). Caustics are where a convex wave focuses light: brightness follows minus the Laplacian of height.
   - A floating leaf slides down the surface slope; this is the force a real ripple puts on a floating object.
   Plain JavaScript, no build step, WebGL2 for drawing, the simulation on the CPU so leaves can read it. */

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const ease = (t) => t * t * (3 - 2 * t);

/* ══ POND: every choice in one block, with its reason. Change a number here, never below.
   Test overrides: ?p.<key>=<number>, e.g. ?p.damping=0.99 ══ */
export const POND = {
  seed: 20261119,
  hz: 60,            // fixed simulation step; the same seed and clicks give the same frames
  maxSteps: 4,       // a slow device catches up at most 4 steps a frame, then slows down rather than jumps
  substeps: 1,       // wave steps per tick. 1 keeps the rings at a calm walking pace (about 250 px/s on a laptop)
  cellPx: 5,         // target size of one simulation cell in CSS pixels
  minCols: 110, maxCols: 300,   // 300 columns is about 1 ms a step on a 2020 laptop; more costs time, not looks
  spring: 1.3,       // Elias/Wallace's neighbour pull. 2 is the stability limit, where the finest (checkerboard) ripples never die; 1.3 stays clear of it
  damping: .993,     // how much of each ring survives a step. .993 lets a pebble's rings reach about half a screen
  viscosity: .07,    // smoothing of the shortest waves each step (see the step function)
  sponge: 14,        // cells of absorbing edge, so rings leave the screen instead of bouncing back
  wind: .004,        // tiny random nudges each step: a breath of wind keeps the surface alive between throws
  windCells: 1,      // soft puffs of wind per step, each a few cells wide (single cells made a grid-shaped shimmer)
  ambientEvery: [2.6, 6.5],   // seconds between small natural touches (a raindrop, a water boatman)
  ambientStrength: .22,
  pebble: [6, 11],   // pebble size range, CSS pixels across, seen from above
  fall: .36,         // seconds from the throw to the splash (the pebble shrinks as it falls away from you)
  splash: 1.0,       // strength of a pebble's splash relative to its size
  droplets: [5, 10], // droplets thrown up by a splash; each makes its own small ring where it lands
  sink: 2.4,         // seconds for a pebble to settle on the bed. The bed keeps the last 8
  trail: .03,        // a mouse or finger moving through the water leaves a faint wake (strength per px moved, capped)
  leaves: 8, leavesPhone: 4,   // floating leaves; fewer on a phone so the words stay clear
  leafPush: 7000,     // how strongly the surface slope moves a leaf
  normal: 2.4,         // how much the slope tilts the light. Higher makes glints sharper and more frequent
  refract: .022,     // how far the bed is bent by the slope (in screen heights, at full depth)
  caustics: 9,       // how strongly focusing waves brighten the bed
  shine: 260,        // tightness of the sun's glint
  spec: .9,          // brightness of the glint
  reflect: .35,      // how much sky the tilted surface shows
};
try {
  for (const [k, v] of new URLSearchParams(location.search)) if (k.startsWith('p.') && k.slice(2) in POND) POND[k.slice(2)] = +v;
} catch (e) {}

/* Palettes. A page sets these as CSS custom properties per theme (--pond-deep, --pond-bed, --pond-bed2, --pond-sky,
   --pond-sun, --pond-leaf, --pond-stone); these are the fallbacks, matched to the site's Dusk and Silt. */
const FALLBACK = {
  dark:  { deep: '#08151a', bed: '#4a3d30', bed2: '#221d18', sky: '#1d2833', sun: '#ffb07a', leaf: '#a08a44', stone: '#8d877e', absorb: [2.4, 1.35, 1.05], spec: 1, caust: 1, refl: 1 },
  light: { deep: '#7f9a92', bed: '#d6ccb4', bed2: '#a99d82', sky: '#f2f3ef', sun: '#ffffff', leaf: '#5f7a3a', stone: '#8f897e', absorb: [.75, .42, .34], spec: .04, caust: .45, refl: .03 },
  // In daylight a pale sandy bed and a white sky are already bright: full-strength glints, caustics and sky
  // reflection blew the rings out to white (seen 19 Nov 2026), so the light theme scales them down.
};

const VERT = `#version 300 es
in vec2 p; out vec2 vUv;
void main(){ vUv = vec2(p.x * .5 + .5, .5 - p.y * .5); gl_Position = vec4(p, 0., 1.); }`;

const FRAG = `#version 300 es
precision highp float;
uniform sampler2D uH;
uniform vec2 uTexel, uRes;
uniform float uCaustAmt;
uniform float uTime, uNormal, uRefract, uCaust, uShine, uSpec, uReflect;
uniform vec3 uDeep, uBed, uBed2, uSky, uSun, uStoneCol, uAbsorb;
uniform vec4 uStone[8];
uniform int uStoneN;
in vec2 vUv; out vec4 o;

float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3. - 2. * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + 1.), u.x), u.y); }
float fbm(vec2 p){ float s = 0., a = .5; for (int i = 0; i < 5; i++){ s += a * noise(p); p = p * 2.03 + 17.1; a *= .5; } return s; }

/* Depth of the pond, 0 shallow to 1 deep: deepest under the words (lower left), shallow towards the upper right. */
float depthAt(vec2 uv){
  float g = 1. - (uv.x * .75 + (1. - uv.y) * .55);
  return clamp(.38 + .62 * g + .25 * (fbm(uv * 2.3) - .5), .22, 1.);
}

/* The bed: silt, faint sand ripples, and scattered stones (a jittered grid, as in Worley noise). */
vec3 bedAt(vec2 q){
  float silt = fbm(q * 3.1);
  vec3 c = mix(uBed2, uBed, smoothstep(.25, .8, silt));
  float marks = sin(q.x * 38. + q.y * 9. + fbm(q * 2.) * 7.) * .5 + .5;
  c *= .93 + .07 * marks;
  vec2 g = q * 11., id = floor(g), f = fract(g);
  float best = 9.; vec2 bid = vec2(0); vec2 bdel = vec2(0);
  for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++){
    vec2 o2 = vec2(x, y); vec2 cen = o2 + vec2(hash(id + o2), hash(id + o2 + 7.1)) * .8 + .1;
    vec2 del = f - cen; float d = length(del);
    if (d < best){ best = d; bid = id + o2; bdel = del; }
  }
  float has = step(.93, hash(bid + 3.3));
  float r = .16 + .14 * hash(bid + 9.1);
  float m = has * smoothstep(r, r - .05, best);
  float lit = .85 + .2 * clamp(dot(normalize(vec3(bdel, .6)), normalize(vec3(-.5, -.6, .6))), 0., 1.);
  vec3 sc = mix(uBed2, uStoneCol, .25 + .3 * hash(bid + 1.7)) * lit;
  c = mix(c * (1. - .25 * has * smoothstep(r + .07, r, best)), sc, m);   // a soft contact shadow round each stone
  return c;
}

void main(){
  vec2 uv = vUv;
  float aspect = uRes.x / uRes.y;
  float h  = texture(uH, uv).r;
  float hl = texture(uH, uv - vec2(uTexel.x, 0.)).r, hr = texture(uH, uv + vec2(uTexel.x, 0.)).r;
  float hu = texture(uH, uv - vec2(0., uTexel.y)).r, hd = texture(uH, uv + vec2(0., uTexel.y)).r;
  vec2 grad = vec2(hr - hl, hd - hu) * .5;
  vec3 n = normalize(vec3(-grad * uNormal, 1.));
  float lap = hl + hr + hu + hd - 4. * h;

  float d = depthAt(uv);
  vec2 refr = n.xy * d * uRefract * vec2(1. / aspect, 1.) * 10.;
  vec2 buv = uv + refr;
  vec3 bed = bedAt(buv * vec2(aspect, 1.));
  bed *= 1. + clamp(-lap * uCaust * 40., -.45, 1.6) * uCaustAmt * (1. - .55 * d);   // caustics: convex crests focus light

  vec3 absorb = exp(-d * uAbsorb);
  vec3 col = bed * absorb + uDeep * (1. - absorb);

  /* Pebbles you threw: sinking (s from 0 to 1), then resting on the bed. Nearer the surface, less water in the way. */
  for (int i = 0; i < 8; i++){
    if (i >= uStoneN) break;
    vec4 s = uStone[i];
    float sink = s.w;
    vec2 at = (uv + refr * sink - s.xy) * uRes;      // in pixels
    float r = s.z * (1.12 - .12 * sink);
    float ang = atan(at.y, at.x);
    float wob = 1. + .13 * (noise(vec2(ang * 1.7 + s.x * 40., s.y * 31.)) - .5);
    float dd = length(at) / (r * wob);
    if (dd < 1.6){
      float m = smoothstep(1., .86, dd);
      float shadow = (1. - smoothstep(1., 1.55, length(at - vec2(r * .25, r * .3)) / r)) * sink * .35;
      vec3 sn = normalize(vec3(at / r, sqrt(max(0., 1. - dd * dd)) + .2));
      float lit = .55 + .55 * clamp(dot(sn, normalize(vec3(-.5, -.6, .65))), 0., 1.);
      vec3 sc = uStoneCol * lit * (.85 + .3 * hash(s.xy));
      vec3 ab = exp(-d * sink * uAbsorb);
      sc = sc * ab + uDeep * (1. - ab);
      col *= 1. - shadow;
      col = mix(col, sc, m);
    }
  }

  float F = .02 + .98 * pow(1. - n.z, 5.);                 // Schlick's Fresnel, looking straight down
  col = mix(col, uSky, clamp(F * uReflect * 6., 0., .7));
  vec3 L = normalize(vec3(-.45, -.55, .70));
  vec3 H = normalize(L + vec3(0., 0., 1.));
  col += uSun * pow(max(dot(n, H), 0.), uShine) * uSpec;    // the sun's glint on tilted water
  col += (hash(uv * uRes + fract(uTime) * 91.) - .5) * .018; // a whisper of grain, as on the homepage sky
  o = vec4(col, 1.);
}`;

function hexToRgb(hex, fb) {
  const m = /^#?([0-9a-f]{6})$/i.exec((hex || '').trim());
  const s = m ? m[1] : fb.replace('#', '');
  return [parseInt(s.slice(0, 2), 16) / 255, parseInt(s.slice(2, 4), 16) / 255, parseInt(s.slice(4, 6), 16) / 255];
}

/* createPond({ canvas, fx }): canvas draws the water (WebGL2), fx draws what is above it (falling pebbles,
   droplets, leaves; 2D). Both should fill the viewport, fixed, under the page. Returns a small handle. */
export function createPond({ canvas, fx, root = document.documentElement, ignore = 'a,button,input,label,select,textarea,[data-pond-ignore]' } = {}) {
  let seed = POND.seed;
  const rand = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  const mq = (q) => { try { return matchMedia(q).matches; } catch (e) { return false; } };
  const reduced = () => { const m = root.dataset.libMotion; return m ? m === 'reduce' : mq('(prefers-reduced-motion: reduce)'); };
  const phone = () => innerWidth < 640;

  const gl = canvas.getContext('webgl2', { antialias: false, alpha: false, premultipliedAlpha: false, powerPreference: 'low-power' });
  const ctx = fx.getContext('2d');
  if (!gl) { root.classList.add('no-gl'); return null; }
  root.classList.add('gl');

  /* GL setup: one full-screen triangle, one height texture. */
  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
  const prog = gl.createProgram();
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
  gl.useProgram(prog);
  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = {}; for (const n of ['uH', 'uTexel', 'uRes', 'uTime', 'uNormal', 'uRefract', 'uCaust', 'uShine', 'uSpec', 'uReflect',
    'uCaustAmt', 'uDeep', 'uBed', 'uBed2', 'uSky', 'uSun', 'uStoneCol', 'uAbsorb', 'uStone', 'uStoneN']) U[n] = gl.getUniformLocation(prog, n);
  const tex = gl.createTexture(); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.uniform1i(U.uH, 0);

  /* The simulation grid. */
  let W = 0, Hh = 0, DPR = 1, cols = 0, rows = 0, h, v, nb, damp;
  function allocate() {
    const nc = clamp(Math.round(W / POND.cellPx), POND.minCols, POND.maxCols);
    const nr = Math.max(40, Math.round(nc * Hh / W));
    if (nc === cols && nr === rows) return;
    cols = nc; rows = nr;
    h = new Float32Array(cols * rows); v = new Float32Array(cols * rows); nb = new Float32Array(cols * rows); damp = new Float32Array(cols * rows);
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
      const e = Math.min(x, y, cols - 1 - x, rows - 1 - y);
      const k = e >= POND.sponge ? 1 : ease(e / POND.sponge);
      damp[y * cols + x] = POND.damping * (.86 + .14 * k);
    }
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.R16F, cols, rows, 0, gl.RED, gl.FLOAT, h);
  }
  function resize() {
    W = innerWidth; Hh = innerHeight; DPR = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * Math.min(DPR, 1.5)); canvas.height = Math.round(Hh * Math.min(DPR, 1.5));
    fx.width = Math.round(W * DPR); fx.height = Math.round(Hh * DPR);
    gl.viewport(0, 0, canvas.width, canvas.height);
    allocate();
    if (!running) renderStill();
  }

  /* Wallace's update: v += (average of the 4 neighbours - h) * spring; v *= damping; h += v. */
  function stepWaveClean() {
    const c = cols, r = rows, k = POND.spring;
    for (let y = 1; y < r - 1; y++) {
      let i = y * c + 1;
      for (let x = 1; x < c - 1; x++, i++) {
        const avg = ((h[i - 1] + h[i + 1] + h[i - c] + h[i + c]) * 4
                   + h[i - c - 1] + h[i - c + 1] + h[i + c - 1] + h[i + c + 1]) * .05;   // 9-point stencil: round rings, not square ones
        v[i] = (v[i] + (avg - h[i]) * k) * damp[i];
        nb[i] = avg;
      }
    }
    // Viscosity: nudge each height towards its neighbours. It damps short waves far more than long ones (as k squared),
    // which is what real water does to the finest ripples, and it keeps waves near the grid's size from showing as steps.
    const vis = POND.viscosity;
    for (let i = 0; i < h.length; i++) h[i] += v[i] + vis * (nb[i] - h[i]);
  }

  /* A cosine-shaped dent: the shape Wallace uses for a drop. x, y in CSS pixels; radius in cells. */
  function drop(px, py, strength, radius) {
    const cx = px / W * cols, cy = py / Hh * rows, R = Math.max(1, radius);
    const x0 = Math.max(1, Math.floor(cx - R)), x1 = Math.min(cols - 2, Math.ceil(cx + R));
    const y0 = Math.max(1, Math.floor(cy - R)), y1 = Math.min(rows - 2, Math.ceil(cy + R));
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const d = Math.hypot(x - cx, y - cy) / R;
      if (d < 1) h[y * cols + x] -= strength * .5 * (Math.cos(Math.PI * d) + 1);
    }
  }
  function heightAt(px, py) {
    const x = clamp(Math.round(px / W * cols), 1, cols - 2), y = clamp(Math.round(py / Hh * rows), 1, rows - 2), i = y * cols + x;
    return { h: h[i], gx: (h[i + 1] - h[i - 1]) * .5 * cols / W, gy: (h[i + cols] - h[i - cols]) * .5 * rows / Hh };
  }

  /* Things above the water. */
  const pebbles = [], droplets = [], stones = [], leaves = [];
  function makeShape(n) { const pts = []; for (let i = 0; i < n; i++) pts.push(.82 + rand() * .3); return pts; }
  function throwPebble(x, y, now = performance.now()) {
    const size = POND.pebble[0] + rand() * (POND.pebble[1] - POND.pebble[0]);
    pebbles.push({ x, y, t0: now, size, rot: rand() * Math.PI * 2, shape: makeShape(9), done: false });
    if (!running) { splash({ x, y, size, rot: 0 }, now); settle(160); renderStill(); }
  }
  function splash(p, now) {
    const k = p.size / 9;
    drop(p.x, p.y, POND.splash * .6 * k, 3.5 + p.size * cols / W * .9);
    const n = Math.round(POND.droplets[0] + rand() * (POND.droplets[1] - POND.droplets[0]) * k);
    for (let i = 0; i < n; i++) {
      const a = rand() * Math.PI * 2, dist = p.size * (1.8 + rand() * 3.4);
      droplets.push({ x: p.x, y: p.y, tx: p.x + Math.cos(a) * dist, ty: p.y + Math.sin(a) * dist, t0: now, T: 220 + rand() * 300, r: .7 + rand() * 1.1 });
    }
    stones.push({ x: p.x / W, y: p.y / Hh, r: p.size * .5, t0: now, rot: p.rot });
    if (stones.length > 8) stones.shift();
  }
  function seedLeaves() {
    leaves.length = 0;
    const n = phone() ? POND.leavesPhone : POND.leaves;
    for (let i = 0; i < n; i++) leaves.push({
      x: W * (.3 + rand() * .7), y: Hh * rand() * .85, vx: (rand() - .5) * 6, vy: (rand() - .5) * 6,
      a: rand() * Math.PI * 2, va: 0, h: 0, len: (phone() ? 16 : 20) + rand() * 14, w: .4 + rand() * .12, tone: rand(),
    });
  }

  /* Pointer: click or tap throws a pebble; a moving mouse or dragging finger leaves a faint wake. */
  let last = null, wake = [], downAt = null;
  const ignored = (e) => e.target && e.target.closest && e.target.closest(ignore);
  addEventListener('pointerdown', (e) => {
    if (ignored(e)) return;
    downAt = { x: e.clientX, y: e.clientY, t: performance.now(), id: e.pointerId };
    if (e.pointerType !== 'touch') throwPebble(e.clientX, e.clientY);
  }, { passive: true });
  addEventListener('pointerup', (e) => {
    if (e.pointerType === 'touch' && downAt && downAt.id === e.pointerId && !ignored(e)
        && Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y) < 12) throwPebble(e.clientX, e.clientY);
    downAt = null;
  }, { passive: true });
  addEventListener('pointermove', (e) => {
    const touchDrag = e.pointerType === 'touch' && downAt;
    if (e.pointerType === 'touch' && !touchDrag) return;
    if (last) wake.push({ x: e.clientX, y: e.clientY, d: Math.hypot(e.clientX - last.x, e.clientY - last.y) });
    last = { x: e.clientX, y: e.clientY };
  }, { passive: true });
  document.addEventListener('pointerleave', () => { last = null; }, { passive: true });

  /* Palette from the page's CSS, by theme. */
  let pal;
  function readPalette() {
    const dark = root.getAttribute('data-theme') !== 'light';
    const fb = dark ? FALLBACK.dark : FALLBACK.light;
    const cs = getComputedStyle(root), g = (n) => cs.getPropertyValue(n).trim();
    pal = { dark, fb,
      deep: hexToRgb(g('--pond-deep'), fb.deep), bed: hexToRgb(g('--pond-bed'), fb.bed), bed2: hexToRgb(g('--pond-bed2'), fb.bed2),
      sky: hexToRgb(g('--pond-sky'), fb.sky), sun: hexToRgb(g('--pond-sun'), fb.sun), stone: hexToRgb(g('--pond-stone'), fb.stone),
      leafHex: g('--pond-leaf') || fb.leaf, stoneHex: g('--pond-stone') || fb.stone, absorb: fb.absorb };
    gl.uniform3fv(U.uDeep, pal.deep); gl.uniform3fv(U.uBed, pal.bed); gl.uniform3fv(U.uBed2, pal.bed2);
    gl.uniform3fv(U.uSky, pal.sky); gl.uniform3fv(U.uSun, pal.sun); gl.uniform3fv(U.uStoneCol, pal.stone); gl.uniform3fv(U.uAbsorb, pal.absorb);
    if (!running) renderStill();
  }
  new MutationObserver(() => { readPalette(); if (h) decide(); }).observe(root, { attributes: true, attributeFilter: ['data-theme', 'data-lib-motion'] });

  /* Drawing. */
  const stoneBuf = new Float32Array(32);
  function drawWater(now) {
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, cols, rows, gl.RED, gl.FLOAT, h);
    gl.uniform2f(U.uTexel, 1 / cols, 1 / rows); gl.uniform2f(U.uRes, W, Hh); gl.uniform1f(U.uTime, now / 1000);
    gl.uniform1f(U.uNormal, POND.normal * cols / 200); gl.uniform1f(U.uRefract, POND.refract); gl.uniform1f(U.uCaust, POND.caustics); gl.uniform1f(U.uCaustAmt, pal.fb.caust);
    gl.uniform1f(U.uShine, POND.shine); gl.uniform1f(U.uSpec, POND.spec * pal.fb.spec); gl.uniform1f(U.uReflect, POND.reflect * pal.fb.refl);
    stones.forEach((s, i) => { stoneBuf.set([s.x, s.y, s.r, clamp((now - s.t0) / (POND.sink * 1000), 0, 1)], i * 4); });
    gl.uniform4fv(U.uStone, stoneBuf); gl.uniform1i(U.uStoneN, stones.length);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  function pebblePath(p, s) {
    ctx.beginPath();
    p.shape.forEach((k, i) => {
      const a = p.rot + i / p.shape.length * Math.PI * 2, r = s * .5 * k;
      const x = p.x + Math.cos(a) * r, y = p.y + Math.sin(a) * r * .8;
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    });
    ctx.closePath();
  }
  function drawLeaf(L, shadow) {
    const s = L.len * (1 + clamp(-L.h * .35, -.06, .08));   // a leaf rides up on a crest, a touch nearer
    ctx.save();
    ctx.translate(L.x + (shadow ? 5 : 0), L.y + (shadow ? 7 : 0)); ctx.rotate(L.a);
    ctx.beginPath(); ctx.moveTo(-s * .5, 0);
    ctx.quadraticCurveTo(0, -s * L.w, s * .5, 0); ctx.quadraticCurveTo(0, s * L.w, -s * .5, 0);
    if (shadow) { ctx.fillStyle = pal.dark ? 'rgba(0,0,0,.42)' : 'rgba(40,46,40,.22)'; ctx.filter = 'blur(2.5px)'; ctx.fill(); ctx.filter = 'none'; }
    else {
      ctx.fillStyle = pal.leafHex; ctx.globalAlpha = .82 + L.tone * .18; ctx.fill();
      ctx.globalAlpha = .35; ctx.strokeStyle = pal.dark ? '#000' : '#fff'; ctx.lineWidth = .8;
      ctx.beginPath(); ctx.moveTo(-s * .55, 0); ctx.lineTo(s * .42, 0); ctx.stroke();
    }
    ctx.restore();
  }
  function drawFx(now) {
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, W, Hh);
    for (const L of leaves) drawLeaf(L, true);
    for (const L of leaves) drawLeaf(L, false);
    ctx.globalAlpha = 1;
    for (const p of pebbles) {
      const t = clamp((now - p.t0) / (POND.fall * 1000), 0, 1), u = 1 - t;
      const off = 26 * u;                                    // its shadow on the water closes in as it falls
      ctx.fillStyle = pal.dark ? `rgba(0,0,0,${.18 + .3 * t})` : `rgba(30,35,30,${.1 + .2 * t})`;
      pebblePath({ ...p, x: p.x + off * .7, y: p.y + off }, p.size * (1 + .25 * u)); ctx.fill();
      const s = p.size * (1 + 1.7 * u * u);
      const g = ctx.createRadialGradient(p.x - s * .18, p.y - s * .2, s * .05, p.x, p.y, s * .6);
      g.addColorStop(0, pal.dark ? '#c9c3b8' : '#bdb7ac'); g.addColorStop(1, pal.stoneHex);
      ctx.fillStyle = g; pebblePath(p, s); ctx.fill();
    }
    for (const d of droplets) {
      const u = clamp((now - d.t0) / d.T, 0, 1), z = 4 * u * (1 - u);
      ctx.fillStyle = pal.dark ? `rgba(236,230,218,${.55 * (1 - u * .4)})` : `rgba(255,255,255,${.75 * (1 - u * .4)})`;
      ctx.beginPath(); ctx.arc(d.x + (d.tx - d.x) * u, d.y + (d.ty - d.y) * u - z * 6, d.r * (1 + z * 1.2), 0, Math.PI * 2); ctx.fill();
    }
  }

  /* Ticks: fixed step, so the same input gives the same water. */
  let nextAmbient = 0;
  function tick(now) {
    for (let k = 0; k < POND.substeps; k++) {
      for (let j = 0; j < POND.windCells; j++) drop(rand() * W, rand() * Hh, (rand() - .5) * POND.wind, 2.5);
      stepWaveClean();
    }
    if (now > nextAmbient) {
      if (nextAmbient) drop(rand() * W, rand() * Hh, POND.ambientStrength, 2.6);
      nextAmbient = now + 1000 * (POND.ambientEvery[0] + rand() * (POND.ambientEvery[1] - POND.ambientEvery[0]));
    }
    for (const w of wake) drop(w.x, w.y, Math.min(.1, w.d * POND.trail * .1), 2.6);
    wake = [];
    for (let i = pebbles.length - 1; i >= 0; i--) {
      const p = pebbles[i];
      if (now - p.t0 >= POND.fall * 1000) { splash(p, now); pebbles.splice(i, 1); }
    }
    for (let i = droplets.length - 1; i >= 0; i--) {
      const d = droplets[i];
      if (now - d.t0 >= d.T) { drop(d.tx, d.ty, .06 + d.r * .04, 2.2); droplets.splice(i, 1); }
    }
    const dt = 1 / POND.hz;
    for (const L of leaves) {
      const s = heightAt(L.x, L.y); L.h = s.h;
      L.vx = (L.vx - s.gx * POND.leafPush * dt) * .985 + .09;   // slide down the slope; a slow drift to the right (about 6 px/s)
      L.vy = (L.vy - s.gy * POND.leafPush * dt) * .985;
      L.va = (L.va + (s.gx * Math.sin(L.a) - s.gy * Math.cos(L.a)) * 6 * dt) * .96;
      L.x += L.vx * dt; L.y += L.vy * dt; L.a += L.va * dt + .0006;
      const m = 30;
      if (L.x > W + m) L.x = -m; if (L.x < -m) L.x = W + m; if (L.y > Hh + m) L.y = -m; if (L.y < -m) L.y = Hh + m;
    }
  }

  let running = false, raf = 0, lastT = 0, acc = 0;
  function frame(now) {
    if (!running) return;
    acc += Math.min(now - (lastT || now), 250); lastT = now;
    const step = 1000 / POND.hz; let n = 0;
    while (acc >= step && n < POND.maxSteps) { tick(now); acc -= step; n++; }
    if (n === POND.maxSteps) acc = 0;
    drawWater(now); drawFx(now);
    raf = requestAnimationFrame(frame);
  }
  function settle(steps) { for (let i = 0; i < steps; i++) stepWaveClean(); }
  /* Reduced motion: a still pond, with the rings of three pebbles caught part way out. */
  function renderStill() {
    if (!pal || !cols) return;
    const now = performance.now();
    stones.forEach((s) => { s.t0 = now - POND.sink * 1000; });
    drawWater(now); drawFx(now);
  }
  function start() { if (running) return; running = true; lastT = 0; raf = requestAnimationFrame(frame); root.classList.remove('still'); }
  function stop() { running = false; cancelAnimationFrame(raf); }
  function decide() {
    if (reduced()) {
      stop(); root.classList.add('still');
      h.fill(0); v.fill(0);
      const pts = [[.62, .34, 10], [.8, .62, 8], [.42, .7, 7]];
      for (const [x, y, s] of pts) splash({ x: x * W, y: y * Hh, size: s, rot: rand() * 6 }, performance.now() - 1e5);
      droplets.length = 0; settle(70); renderStill();
    } else if (!document.hidden) start();
  }

  resize(); readPalette(); seedLeaves();
  addEventListener('resize', () => { resize(); }, { passive: true });
  document.addEventListener('visibilitychange', () => { document.hidden ? stop() : decide(); });
  try { matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', decide); } catch (e) {}
  decide();

  return { throwPebble, drop, start, stop, decide, POND, get running() { return running; } };
}
