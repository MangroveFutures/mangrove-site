/* What floats and flies above the water, drawn on a 2D canvas: falling pebbles, droplets and leaves.
   The state (pebbles, droplets, leaves) is plain objects; the functions here make, move and draw them.
   A floating leaf slides down the surface slope: this is the force a real ripple puts on a floating object.
   Nothing here touches the DOM except the 2D context it is given. */

import { clamp } from './sim.js';

/* An irregular pebble outline: n radii between .82 and 1.12 of the size. */
export function makeShape(n, rand) { const pts = []; for (let i = 0; i < n; i++) pts.push(.82 + rand() * .3); return pts; }

/* Fill `leaves` with a fresh scatter, for a viewport of W by H CSS pixels. */
export function seedLeaves(leaves, W, H, pond, rand, phone) {
  leaves.length = 0;
  const n = phone ? pond.leavesPhone : pond.leaves;
  for (let i = 0; i < n; i++) leaves.push({
    x: W * (.3 + rand() * .7), y: H * rand() * .85, vx: (rand() - .5) * 6, vy: (rand() - .5) * 6,
    a: rand() * Math.PI * 2, va: 0, h: 0, len: (phone ? 16 : 20) + rand() * 14, w: .4 + rand() * .12, tone: rand(),
  });
}

/* Move every leaf one fixed step, pushed by the slope of the water under it (sim.heightAt). */
export function stepLeaves(leaves, sim, pond) {
  const dt = 1 / pond.hz, W = sim.W, H = sim.H;
  for (const L of leaves) {
    const s = sim.heightAt(L.x, L.y); L.h = s.h;
    L.vx = (L.vx - s.gx * pond.leafPush * dt) * .985 + .09;   // slide down the slope; a slow drift to the right (about 6 px/s)
    L.vy = (L.vy - s.gy * pond.leafPush * dt) * .985;
    L.va = (L.va + (s.gx * Math.sin(L.a) - s.gy * Math.cos(L.a)) * 6 * dt) * .96;
    L.x += L.vx * dt; L.y += L.vy * dt; L.a += L.va * dt + .0006;
    const m = 30;
    if (L.x > W + m) L.x = -m; if (L.x < -m) L.x = W + m; if (L.y > H + m) L.y = -m; if (L.y < -m) L.y = H + m;
  }
}

/* The 2D overlay. ctx is the 2D context of the fx canvas. */
export function createFx(ctx) {
  function pebblePath(p, s) {
    ctx.beginPath();
    p.shape.forEach((k, i) => {
      const a = p.rot + i / p.shape.length * Math.PI * 2, r = s * .5 * k;
      const x = p.x + Math.cos(a) * r, y = p.y + Math.sin(a) * r * .8;
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    });
    ctx.closePath();
  }
  function drawLeaf(L, shadow, pal) {
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
  /* things: { leaves, pebbles, droplets }; W, H in CSS pixels; DPR the canvas scale. */
  function draw({ leaves, pebbles, droplets }, pal, pond, now, W, H, DPR) {
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, W, H);
    for (const L of leaves) drawLeaf(L, true, pal);
    for (const L of leaves) drawLeaf(L, false, pal);
    ctx.globalAlpha = 1;
    for (const p of pebbles) {
      const t = clamp((now - p.t0) / (pond.fall * 1000), 0, 1), u = 1 - t;
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
  return { draw };
}
