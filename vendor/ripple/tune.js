/* The live tuning panel. Loaded by ripple.js only when the address has ?tune, so a visitor never downloads it.

   Tool: Tweakpane (https://tweakpane.github.io/docs/), the usual live parameter panel for creative code, MIT
   licence. The version is pinned in the address below; change it here, never to "latest".
   Every setting in settings.js has a control, in folders. A change applies at once (ripple.js `retune` rebuilds
   the grid or the damping array when a setting needs that). "Copy settings" puts the changed values on the
   clipboard as text to paste back into settings.js. */

import { formatChanges } from './settings.js';

export const TWEAKPANE = 'https://cdn.jsdelivr.net/npm/tweakpane@4.0.5/dist/tweakpane.min.js';

/* Each control: [key, label or [min,max] pair, {min, max, step}]. A pair (two numbers in one setting) gets two sliders. */
const FOLDERS = [
  ['Time', [
    ['hz', { min: 20, max: 144, step: 1 }], ['maxSteps', { min: 1, max: 8, step: 1 }], ['substeps', { min: 1, max: 4, step: 1 }]]],
  ['Grid (changing these clears the water)', [
    ['cellPx', { min: 2, max: 12, step: .5 }], ['minCols', { min: 40, max: 300, step: 1 }], ['maxCols', { min: 100, max: 600, step: 1 }]]],
  ['Water', [
    ['spring', { min: .1, max: 1.99, step: .01 }], ['damping', { min: .95, max: 1, step: .0005 }],
    ['viscosity', { min: 0, max: .3, step: .005 }], ['sponge', { min: 0, max: 40, step: 1 }]]],
  ['Wind and ambient touches', [
    ['wind', { min: 0, max: .03, step: .0005 }], ['windCells', { min: 0, max: 6, step: 1 }],
    ['ambientEvery', { min: 0.5, max: 20, step: .1 }, ['from s', 'to s']], ['ambientStrength', { min: 0, max: 1, step: .01 }]]],
  ['Pebbles', [
    ['pebble', { min: 2, max: 30, step: .5 }, ['smallest px', 'largest px']], ['fall', { min: .05, max: 1.5, step: .01 }],
    ['splash', { min: 0, max: 3, step: .05 }], ['droplets', { min: 0, max: 30, step: 1 }, ['fewest', 'most']],
    ['sink', { min: .2, max: 8, step: .1 }], ['trail', { min: 0, max: .2, step: .005 }]]],
  ['Leaves', [
    ['leaves', { min: 0, max: 30, step: 1 }], ['leavesPhone', { min: 0, max: 30, step: 1 }], ['leafPush', { min: 0, max: 20000, step: 100 }]]],
  ['Light', [
    ['normal', { min: 0, max: 8, step: .1 }], ['refract', { min: 0, max: .1, step: .001 }], ['caustics', { min: 0, max: 30, step: .5 }],
    ['shine', { min: 10, max: 1000, step: 10 }], ['spec', { min: 0, max: 3, step: .05 }], ['reflect', { min: 0, max: 1, step: .01 }]]],
];

export async function mountTuning({ pond, defaults, onChange }) {
  const { Pane } = await import(TWEAKPANE);
  const pane = new Pane({ title: 'Pond settings', expanded: true });
  pane.element.style.position = 'fixed'; pane.element.style.top = '8px'; pane.element.style.right = '8px'; pane.element.style.zIndex = '99999';
  pane.element.style.maxHeight = 'calc(100vh - 16px)'; pane.element.style.overflowY = 'auto';   // a tall panel scrolls instead of running off the screen
  pane.element.setAttribute('data-pond-ignore', '');   // a click on the panel must not throw a pebble

  for (const [title, controls] of FOLDERS) {
    const folder = pane.addFolder({ title, expanded: title !== 'Time' });
    for (const [key, range, pair] of controls) {
      if (!(key in pond)) continue;
      if (pair) {   // two numbers in one array: one slider for each end
        const proxy = { get [pair[0]]() { return pond[key][0]; }, set [pair[0]](x) { pond[key][0] = x; },
                        get [pair[1]]() { return pond[key][1]; }, set [pair[1]](x) { pond[key][1] = x; } };
        for (const label of pair) folder.addBinding(proxy, label, range).on('change', () => onChange(key));
      } else folder.addBinding(pond, key, range).on('change', () => onChange(key));
    }
  }
  const seed = pane.addBinding(pond, 'seed', { format: (v) => String(v) });
  seed.disabled = true;   // the seed is read once at the start: reload with ?p.seed=<number> to try another

  pane.addButton({ title: 'Copy settings' }).on('click', async () => {
    const text = formatChanges(pond, defaults);
    try { await navigator.clipboard.writeText(text); }
    catch (e) { window.prompt('Copy these settings (Ctrl+C):', text); }
    console.log(text);
  });
  return pane;
}
