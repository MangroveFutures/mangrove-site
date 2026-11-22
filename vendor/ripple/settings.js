/* Pond settings: every choice in one block, with its reason. Change a number here, never in the other files.
   No DOM, no WebGL: the simulation tests import this file under Node.

   Test overrides: ?p.<key>=<number> in the address, e.g. ?p.damping=0.99 (applied by ripple.js).
   Live tuning: add ?tune to the address for a Tweakpane panel (tune.js). */

export const DEFAULTS = {
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

/* The settings the page really uses. A copy of DEFAULTS, so the panel can show what has changed. */
export const POND = clone(DEFAULTS);

export function clone(o) {
  const c = {};
  for (const [k, v] of Object.entries(o)) c[k] = Array.isArray(v) ? v.slice() : v;
  return c;
}

/* Apply ?p.<key>=<number> overrides from a query string such as location.search. Unknown keys are ignored. */
export function applyOverrides(pond, search) {
  try {
    for (const [k, v] of new URLSearchParams(search)) if (k.startsWith('p.') && k.slice(2) in pond) pond[k.slice(2)] = +v;
  } catch (e) {}
  return pond;
}

/* The settings that differ from the defaults, as { key: value }. */
export function changedSettings(pond, defaults = DEFAULTS) {
  const out = {};
  for (const [k, d] of Object.entries(defaults)) {
    const v = pond[k];
    if (Array.isArray(d) ? d.some((x, i) => x !== v[i]) : d !== v) out[k] = v;
  }
  return out;
}

/* The changed settings as text to paste: one line for each, then the same as an address where that is possible
   (single numbers only; the two-number ranges can only be changed in settings.js). */
export function formatChanges(pond, defaults = DEFAULTS) {
  const ch = changedSettings(pond, defaults), keys = Object.keys(ch);
  if (!keys.length) return '// No settings changed from the defaults.';
  const lit = (v) => Array.isArray(v) ? `[${v.map(lit).join(', ')}]` : String(+v.toFixed(6));
  const lines = ['// Pond settings changed from the defaults. Put each in settings.js (keep a reason beside it):',
    ...keys.map((k) => `${k}: ${lit(ch[k])},`)];
  const q = keys.filter((k) => !Array.isArray(ch[k])).map((k) => `p.${k}=${lit(ch[k])}`);
  if (q.length) lines.push('', '// For a test, as an address:', `?tune&${q.join('&')}`);
  return lines.join('\n');
}
