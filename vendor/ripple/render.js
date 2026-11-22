/* The pond's drawing: the water, as one WebGL2 shader over a height texture, and the palette it reads.
   Needs a browser (WebGL2, getComputedStyle); the simulation is in sim.js and the 2D overlay in fx.js.

   Looking down, you see mostly the bed: refraction bends the bed by the surface slope (Snell, small-angle),
   the water absorbs red first (Beer-Lambert), and a little sky is reflected where the surface tilts (Schlick's
   Fresnel). Caustics are where a convex wave focuses light: brightness follows minus the Laplacian of height. */

import { clamp } from './sim.js';

/* Palettes. A page sets these as CSS custom properties per theme (--pond-deep, --pond-bed, --pond-bed2, --pond-sky,
   --pond-sun, --pond-leaf, --pond-stone); these are the fallbacks, matched to the site's Dusk and Silt. */
export const FALLBACK = {
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

/* Read the palette for the current theme from the page's CSS. */
export function readPalette(root) {
  const dark = root.getAttribute('data-theme') !== 'light';
  const fb = dark ? FALLBACK.dark : FALLBACK.light;
  const cs = getComputedStyle(root), g = (n) => cs.getPropertyValue(n).trim();
  return { dark, fb,
    deep: hexToRgb(g('--pond-deep'), fb.deep), bed: hexToRgb(g('--pond-bed'), fb.bed), bed2: hexToRgb(g('--pond-bed2'), fb.bed2),
    sky: hexToRgb(g('--pond-sky'), fb.sky), sun: hexToRgb(g('--pond-sun'), fb.sun), stone: hexToRgb(g('--pond-stone'), fb.stone),
    leafHex: g('--pond-leaf') || fb.leaf, stoneHex: g('--pond-stone') || fb.stone, absorb: fb.absorb };
}

/* The renderer: one full-screen triangle and one height texture. Returns null if WebGL2 is not available. */
export function createRenderer(canvas) {
  const gl = canvas.getContext('webgl2', { antialias: false, alpha: false, premultipliedAlpha: false, powerPreference: 'low-power' });
  if (!gl) return null;
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

  const stoneBuf = new Float32Array(32);
  return {
    /* Match the drawing buffer to the canvas size. */
    viewport() { gl.viewport(0, 0, canvas.width, canvas.height); },
    /* A new height grid: make the texture the right size. */
    allocate(cols, rows, h) { gl.texImage2D(gl.TEXTURE_2D, 0, gl.R16F, cols, rows, 0, gl.RED, gl.FLOAT, h); },
    setPalette(pal) {
      gl.uniform3fv(U.uDeep, pal.deep); gl.uniform3fv(U.uBed, pal.bed); gl.uniform3fv(U.uBed2, pal.bed2);
      gl.uniform3fv(U.uSky, pal.sky); gl.uniform3fv(U.uSun, pal.sun); gl.uniform3fv(U.uStoneCol, pal.stone); gl.uniform3fv(U.uAbsorb, pal.absorb);
    },
    /* Draw the water. sim has cols, rows, h, W, H; stones are the pebbles on the bed; now is in milliseconds. */
    draw(sim, stones, pond, pal, now) {
      const { cols, rows } = sim;
      gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, cols, rows, gl.RED, gl.FLOAT, sim.h);
      gl.uniform2f(U.uTexel, 1 / cols, 1 / rows); gl.uniform2f(U.uRes, sim.W, sim.H); gl.uniform1f(U.uTime, now / 1000);
      gl.uniform1f(U.uNormal, pond.normal * cols / 200); gl.uniform1f(U.uRefract, pond.refract); gl.uniform1f(U.uCaust, pond.caustics); gl.uniform1f(U.uCaustAmt, pal.fb.caust);
      gl.uniform1f(U.uShine, pond.shine); gl.uniform1f(U.uSpec, pond.spec * pal.fb.spec); gl.uniform1f(U.uReflect, pond.reflect * pal.fb.refl);
      stones.forEach((s, i) => { stoneBuf.set([s.x, s.y, s.r, clamp((now - s.t0) / (pond.sink * 1000), 0, 1)], i * 4); });
      gl.uniform4fv(U.uStone, stoneBuf); gl.uniform1i(U.uStoneN, stones.length);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
  };
}
