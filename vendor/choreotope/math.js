// GENERATED from MangroveFutures/studio packages/choreotope/app/src/lib/math.ts (unchanged; types stripped)
/* Small pure maths helpers shared by the library and the app. */
export const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
export const lerp = (a, b, t) => a + (b - a) * t;
export const smooth = (t) => t * t * (3 - 2 * t);
export const TAU = Math.PI * 2;
