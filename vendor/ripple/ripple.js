/* Pond: still water seen from above. Throw a pebble and the rings spread, cross, bounce off nothing and fade.
   Sibling of the murmuration (packages/murmuration, the site's flock.js): there the pointer is a falcon that
   scatters the flock; here a click or a tap throws a pebble into the pond.

   What is borrowed, not invented (19 Nov 2026):
   - The water is the 2D wave equation on a height field, stepped with the damped scheme from Hugo Elias's
     "2D water" and Evan Wallace's WebGL Water (MIT, github.com/evanw/webgl-water). Edges absorb rather than
     reflect, so the pond reads as open water, not a bath. (sim.js)
   - Looking down, you see mostly the bed: refraction, absorption of red first, a little reflected sky, and
     caustics where a convex wave focuses light. (render.js)
   - A floating leaf slides down the surface slope; this is the force a real ripple puts on a floating object. (fx.js)

   This file wires the parts together and keeps the input handling. The files:
     settings.js  every number, with its reason (POND)        sim.js     the water (no DOM, no WebGL; tested)
     render.js    the WebGL2 shader and the palette           fx.js      pebbles, droplets and leaves (2D)
     tune.js      the ?tune panel (Tweakpane), loaded only when the address has ?tune
   Plain JavaScript, no build step, WebGL2 for drawing, the simulation on the CPU so leaves can read it. */

import { POND, DEFAULTS, applyOverrides } from './settings.js';
import { createSim, makeRandom } from './sim.js';
import { createRenderer, readPalette } from './render.js';
import { createFx, makeShape, seedLeaves, stepLeaves } from './fx.js';

export { POND };
try { applyOverrides(POND, location.search); } catch (e) {}

/* createPond({ canvas, fx }): canvas draws the water (WebGL2), fx draws what is above it (falling pebbles,
   droplets, leaves; 2D). Both should fill the viewport, fixed, under the page. Returns a small handle. */
export function createPond({ canvas, fx, root = document.documentElement, ignore = 'a,button,input,label,select,textarea,[data-pond-ignore]' } = {}) {
  const rand = makeRandom(POND.seed);
  const mq = (q) => { try { return matchMedia(q).matches; } catch (e) { return false; } };
  const reduced = () => { const m = root.dataset.libMotion; return m ? m === 'reduce' : mq('(prefers-reduced-motion: reduce)'); };
  const phone = () => innerWidth < 640;

  const renderer = createRenderer(canvas);
  const ctx = fx.getContext('2d');
  if (!renderer) { root.classList.add('no-gl'); return null; }
  root.classList.add('gl');
  const overlay = createFx(ctx);
  const sim = createSim(POND);

  let W = 0, Hh = 0, DPR = 1;
  function resize(force = false) {
    W = innerWidth; Hh = innerHeight; DPR = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * Math.min(DPR, 1.5)); canvas.height = Math.round(Hh * Math.min(DPR, 1.5));
    fx.width = Math.round(W * DPR); fx.height = Math.round(Hh * DPR);
    renderer.viewport();
    if (sim.resize(W, Hh, force)) renderer.allocate(sim.cols, sim.rows, sim.h);
    if (!running) renderStill();
  }

  /* Things above the water. */
  const pebbles = [], droplets = [], stones = [], leaves = [];
  const things = { leaves, pebbles, droplets };
  function throwPebble(x, y, now = performance.now()) {
    const size = POND.pebble[0] + rand() * (POND.pebble[1] - POND.pebble[0]);
    pebbles.push({ x, y, t0: now, size, rot: rand() * Math.PI * 2, shape: makeShape(9, rand), done: false });
    if (!running) { splash({ x, y, size, rot: 0 }, now); settle(160); renderStill(); }
  }
  function splash(p, now) {
    const k = p.size / 9;
    sim.drop(p.x, p.y, POND.splash * .6 * k, 3.5 + p.size * sim.cols / W * .9);
    const n = Math.round(POND.droplets[0] + rand() * (POND.droplets[1] - POND.droplets[0]) * k);
    for (let i = 0; i < n; i++) {
      const a = rand() * Math.PI * 2, dist = p.size * (1.8 + rand() * 3.4);
      droplets.push({ x: p.x, y: p.y, tx: p.x + Math.cos(a) * dist, ty: p.y + Math.sin(a) * dist, t0: now, T: 220 + rand() * 300, r: .7 + rand() * 1.1 });
    }
    stones.push({ x: p.x / W, y: p.y / Hh, r: p.size * .5, t0: now, rot: p.rot });
    if (stones.length > 8) stones.shift();
  }
  const scatterLeaves = () => seedLeaves(leaves, W, Hh, POND, rand, phone());

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
  function loadPalette() {
    pal = readPalette(root);
    renderer.setPalette(pal);
    if (!running) renderStill();
  }
  new MutationObserver(() => { loadPalette(); if (sim.cols) decide(); }).observe(root, { attributes: true, attributeFilter: ['data-theme', 'data-lib-motion'] });

  const drawAll = (now) => { renderer.draw(sim, stones, POND, pal, now); overlay.draw(things, pal, POND, now, W, Hh, DPR); };

  /* Ticks: fixed step, so the same input gives the same water. */
  let nextAmbient = 0;
  function tick(now) {
    for (let k = 0; k < POND.substeps; k++) {
      sim.wind(rand);
      sim.step();
    }
    if (now > nextAmbient) {
      if (nextAmbient) sim.drop(rand() * W, rand() * Hh, POND.ambientStrength, 2.6);
      nextAmbient = now + 1000 * (POND.ambientEvery[0] + rand() * (POND.ambientEvery[1] - POND.ambientEvery[0]));
    }
    for (const w of wake) sim.drop(w.x, w.y, Math.min(.1, w.d * POND.trail * .1), 2.6);
    wake = [];
    for (let i = pebbles.length - 1; i >= 0; i--) {
      const p = pebbles[i];
      if (now - p.t0 >= POND.fall * 1000) { splash(p, now); pebbles.splice(i, 1); }
    }
    for (let i = droplets.length - 1; i >= 0; i--) {
      const d = droplets[i];
      if (now - d.t0 >= d.T) { sim.drop(d.tx, d.ty, .06 + d.r * .04, 2.2); droplets.splice(i, 1); }
    }
    stepLeaves(leaves, sim, POND);
  }

  let running = false, raf = 0, lastT = 0, acc = 0;
  function frame(now) {
    if (!running) return;
    acc += Math.min(now - (lastT || now), 250); lastT = now;
    const step = 1000 / POND.hz; let n = 0;
    while (acc >= step && n < POND.maxSteps) { tick(now); acc -= step; n++; }
    if (n === POND.maxSteps) acc = 0;
    drawAll(now);
    raf = requestAnimationFrame(frame);
  }
  function settle(steps) { for (let i = 0; i < steps; i++) sim.step(); }
  /* Reduced motion: a still pond, with the rings of three pebbles caught part way out. */
  function renderStill() {
    if (!pal || !sim.cols) return;
    const now = performance.now();
    stones.forEach((s) => { s.t0 = now - POND.sink * 1000; });
    drawAll(now);
  }
  function start() { if (running) return; running = true; lastT = 0; raf = requestAnimationFrame(frame); root.classList.remove('still'); }
  function stop() { running = false; cancelAnimationFrame(raf); }
  function decide() {
    if (reduced()) {
      stop(); root.classList.add('still');
      sim.clear();
      const pts = [[.62, .34, 10], [.8, .62, 8], [.42, .7, 7]];
      for (const [x, y, s] of pts) splash({ x: x * W, y: y * Hh, size: s, rot: rand() * 6 }, performance.now() - 1e5);
      droplets.length = 0; settle(70); renderStill();
    } else if (!document.hidden) start();
  }

  /* A setting changed live (from the ?tune panel). Most are read afresh every step and need nothing.
     The ones that shape arrays need a rebuild: the grid size (cellPx, minCols, maxCols; the water is
     cleared), the damping array (damping, sponge; the water is kept) and the leaves (leaves, leavesPhone). */
  const REALLOCATE = ['cellPx', 'minCols', 'maxCols'], REBUILD_DAMP = ['damping', 'sponge'], RESEED_LEAVES = ['leaves', 'leavesPhone'];
  function retune(key) {
    if (REALLOCATE.includes(key)) resize(true);
    else if (REBUILD_DAMP.includes(key)) sim.rebuildDamp();
    else if (RESEED_LEAVES.includes(key)) scatterLeaves();
    if (!running) renderStill();
  }

  resize(); loadPalette(); scatterLeaves();
  addEventListener('resize', () => { resize(); }, { passive: true });
  document.addEventListener('visibilitychange', () => { document.hidden ? stop() : decide(); });
  try { matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', decide); } catch (e) {}
  decide();

  const handle = { throwPebble, drop: sim.drop, start, stop, decide, retune, POND, sim, get running() { return running; } };

  /* The tuning panel: only with ?tune in the address, and only then is anything extra downloaded. */
  let wantTune = false;
  try { wantTune = new URLSearchParams(location.search).has('tune'); } catch (e) {}
  if (wantTune) import('./tune.js').then((m) => m.mountTuning({ pond: POND, defaults: DEFAULTS, onChange: retune })).catch((e) => console.warn('pond: tuning panel not loaded', e));

  return handle;
}
