/* The pond's water: a 2D wave equation on a height field. No DOM, no WebGL, so it runs under `node --test`.

   Borrowed, not invented (19 Nov 2026): the damped scheme from Hugo Elias's "2D water" and Evan Wallace's WebGL
   Water (MIT, github.com/evanw/webgl-water): each cell's velocity moves towards the average of its neighbours, is
   damped a little, then moves the height. Edges absorb (a sponge layer, the usual trick in wave solvers).

   The settings object (`pond`, see settings.js) is read on every step, so changing a number takes effect at once.
   Three settings shape arrays and need a rebuild when they change: cellPx, minCols and maxCols reshape the grid
   (call resize with force = true; the water is cleared), and sponge and damping fill the damping array
   (call rebuildDamp; the water is kept). */

export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const ease = (t) => t * t * (3 - 2 * t);

/* A small seeded generator (a linear congruential generator): the same seed gives the same numbers. */
export function makeRandom(seed) {
  let s = seed >>> 0;
  const rand = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  return rand;
}

/* How many columns and rows the grid has for a viewport of W by H CSS pixels. */
export function gridSize(W, H, pond) {
  const cols = clamp(Math.round(W / pond.cellPx), pond.minCols, pond.maxCols);
  const rows = Math.max(40, Math.round(cols * H / W));
  return { cols, rows };
}

export function createSim(pond) {
  let W = 0, H = 0, cols = 0, rows = 0;
  let h, v, nb, damp;

  /* The damping array: 1 x damping in the middle, falling towards the edges (the sponge). */
  function rebuildDamp() {
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
      const e = Math.min(x, y, cols - 1 - x, rows - 1 - y);
      const k = e >= pond.sponge ? 1 : ease(e / pond.sponge);
      damp[y * cols + x] = pond.damping * (.86 + .14 * k);
    }
  }

  /* Set the viewport size in CSS pixels and (re)allocate the grid if its size changed, or if force is true.
     Returns true when the grid was reallocated (the water is then still). */
  function resize(w, hh, force = false) {
    W = w; H = hh;
    const g = gridSize(W, H, pond);
    if (!force && g.cols === cols && g.rows === rows) return false;
    cols = g.cols; rows = g.rows;
    h = new Float32Array(cols * rows); v = new Float32Array(cols * rows);
    nb = new Float32Array(cols * rows); damp = new Float32Array(cols * rows);
    rebuildDamp();
    return true;
  }

  /* Wallace's update: v += (average of the 4 neighbours - h) * spring; v *= damping; h += v. */
  function step() {
    const c = cols, r = rows, k = pond.spring;
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
    const vis = pond.viscosity;
    for (let i = 0; i < h.length; i++) h[i] += v[i] + vis * (nb[i] - h[i]);
  }

  /* A cosine-shaped dent: the shape Wallace uses for a drop. x, y in CSS pixels; radius in cells. */
  function drop(px, py, strength, radius) {
    const cx = px / W * cols, cy = py / H * rows, R = Math.max(1, radius);
    const x0 = Math.max(1, Math.floor(cx - R)), x1 = Math.min(cols - 2, Math.ceil(cx + R));
    const y0 = Math.max(1, Math.floor(cy - R)), y1 = Math.min(rows - 2, Math.ceil(cy + R));
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const d = Math.hypot(x - cx, y - cy) / R;
      if (d < 1) h[y * cols + x] -= strength * .5 * (Math.cos(Math.PI * d) + 1);
    }
  }

  /* Soft random puffs of wind, which keep the surface alive between throws. */
  function wind(rand) {
    for (let j = 0; j < pond.windCells; j++) drop(rand() * W, rand() * H, (rand() - .5) * pond.wind, 2.5);
  }

  /* Height and slope at a point in CSS pixels (leaves read this). */
  function heightAt(px, py) {
    const x = clamp(Math.round(px / W * cols), 1, cols - 2), y = clamp(Math.round(py / H * rows), 1, rows - 2), i = y * cols + x;
    return { h: h[i], gx: (h[i + 1] - h[i - 1]) * .5 * cols / W, gy: (h[i + cols] - h[i - cols]) * .5 * rows / H };
  }

  function clear() { h.fill(0); v.fill(0); }

  /* Energy of the water: movement plus the stretch of the surface, with the small correction that this
     time-stepping needs. Plain movement plus stretch bobs up and down by a few per cent from step to step even
     without damping; this form (the energy a symplectic Euler step keeps) stays constant when damping,
     viscosity and the sponge are off (the tests check that), and with them on it only ever falls. */
  function energy() {
    let kin = 0, pot = 0, cross = 0;
    for (let y = 1; y < rows - 1; y++) for (let x = 1; x < cols - 1; x++) {
      const i = y * cols + x;
      const avg = ((h[i - 1] + h[i + 1] + h[i - cols] + h[i + cols]) * 4
                 + h[i - cols - 1] + h[i - cols + 1] + h[i + cols - 1] + h[i + cols + 1]) * .05;
      const stretch = h[i] - avg;
      kin += v[i] * v[i]; pot += h[i] * stretch; cross += v[i] * stretch;
    }
    return .5 * kin + .5 * pond.spring * (pot - cross);
  }

  return {
    resize, rebuildDamp, step, drop, wind, heightAt, clear, energy,
    get cols() { return cols; }, get rows() { return rows; }, get W() { return W; }, get H() { return H; },
    get h() { return h; }, get v() { return v; },
  };
}
