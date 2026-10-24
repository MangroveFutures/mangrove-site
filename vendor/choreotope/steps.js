// GENERATED from MangroveFutures/studio packages/choreotope/app/src/lib/pose/steps.ts (unchanged; types stripped)
/* The ballet vocabulary, the words parser, poses and the skeleton. No DOM, so it can be tested.
   Moved out of dance.ts (which re-exports all of it) for the Benesh sketch, 30 Sept 2026. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { clamp, lerp, smooth } from './math.js';
/* ---------- Dancers: a small ballet vocabulary on a simple 3D skeleton ----------
   Pose: arms [elevation from down, azimuth (0 side, +front, -back), elbow], legs [elevation, azimuth, knee],
   plus rise (relevé), lift (jump), spin (turns), lean, travel. Joints are 3D, rotated by spin, then projected. */
export const BASE = { la: [0.25, 0.7, 0.35], ra: [0.25, 0.7, 0.35], ll: [0.04, 0, 0], rl: [0.04, 0, 0], rise: 0, lift: 0, spin: 0, lean: 0, tx: 0 };
export const P2 = (o) => Object.assign(JSON.parse(JSON.stringify(BASE)), o);
export const SECOND = [1.45, 0.05, 0.25], FIFTH = [2.75, 0.35, 0.35], FIRSTA = [1.2, 1.35, 0.6];
export const STEPS = {
    'plié': { beats: 2, words: ['plie', 'plié', 'plies', 'pliés', 'bend'], keys: [[0, {}], [.5, { ll: [0.4, 0, 0.8], rl: [0.4, 0, 0.8], la: SECOND, ra: SECOND }], [1, {}]] },
    'relevé': { beats: 2, words: ['releve', 'relevé', 'relevés', 'rise'], keys: [[0, {}], [.45, { rise: 1, la: FIFTH, ra: FIFTH }], [.7, { rise: 1, la: FIFTH, ra: FIFTH }], [1, {}]] },
    'tendu': { beats: 2, words: ['tendu', 'tendus', 'point'], keys: [[0, {}], [.5, { rl: [0.5, 0.3, 0], ra: SECOND, la: SECOND }], [1, {}]] },
    'port de bras': { beats: 4, words: ['port de bras', 'arms'], keys: [[0, {}], [.25, { la: FIRSTA, ra: FIRSTA }], [.5, { la: FIFTH, ra: FIFTH }], [.75, { la: SECOND, ra: SECOND }], [1, {}]] },
    'arabesque': { beats: 4, words: ['arabesque', 'arabesques'], keys: [[0, {}], [.3, { spin: .25, rl: [1.55, -1.5, 0], la: [1.6, 1.5, 0.1], ra: [1.5, -0.2, 0.1], lean: .25 }], [.8, { spin: .25, rl: [1.6, -1.5, 0], la: [1.65, 1.5, 0.1], ra: [1.5, -0.2, 0.1], lean: .3 }], [1, { spin: 0 }]] },
    'attitude': { beats: 4, words: ['attitude', 'attitudes'], keys: [[0, {}], [.3, { spin: .25, rl: [1.4, -1.5, 1.2], la: FIFTH, ra: [1.5, 0, .3], lean: .15, rise: 1 }], [.8, { spin: .25, rl: [1.45, -1.5, 1.25], la: FIFTH, ra: [1.5, 0, .3], lean: .15, rise: 1 }], [1, { spin: 0 }]] },
    'pirouette': { beats: 2, words: ['pirouette', 'pirouettes', 'turn', 'turns', 'spin'], keys: [[0, {}], [.15, { rl: [1.25, 0, 2.3], rise: 1, la: FIRSTA, ra: FIRSTA, spin: 0 }], [.85, { rl: [1.25, 0, 2.3], rise: 1, la: FIRSTA, ra: FIRSTA, spin: 1 }], [1, { spin: 1 }]] },
    'grand jeté': { beats: 2, words: ['jete', 'jeté', 'jetés', 'jetes', 'grand jete', 'grand jeté', 'leap', 'leaps'], keys: [[0, { ll: [0.35, 0, .7], rl: [0.35, 0, .7] }], [.5, { lift: .45, spin: .25, rl: [1.5, 1.5, 0], ll: [1.3, -1.5, 0], la: [2.2, 1.2, .2], ra: [1.6, -.4, .2], tx: .35 }], [1, { tx: .6, ll: [0.35, 0, .7], rl: [0.35, 0, .7] }]] },
    'sauté': { beats: 1, words: ['saute', 'sauté', 'sautés', 'sautes', 'jump', 'jumps', 'hop'], keys: [[0, { ll: [0.35, 0, .7], rl: [0.35, 0, .7] }], [.5, { lift: .22, la: SECOND, ra: SECOND }], [1, { ll: [0.35, 0, .7], rl: [0.35, 0, .7] }]] },
    'pas de bourrée': { beats: 2, words: ['bourree', 'bourrée', 'pas de bourree', 'pas de bourrée', 'travel', 'run'], keys: [[0, {}], [.25, { rise: 1, rl: [.3, .2, .5], tx: .1 }], [.5, { rise: 1, ll: [.3, .2, .5], tx: .2 }], [.75, { rise: 1, rl: [.3, .2, .5], tx: .3 }], [1, { tx: .35 }]] },
    'battement': { beats: 2, words: ['battement', 'battements', 'kick', 'kicks'], keys: [[0, {}], [.4, { rl: [1.8, 0.15, 0], la: SECOND, ra: SECOND }], [1, {}]] },
    'révérence': { beats: 4, words: ['reverence', 'révérence', 'bow', 'curtsy'], keys: [[0, {}], [.5, { lean: .7, rl: [.35, -1.4, 0], ll: [.3, 0, .5], ra: [1.4, .9, .3], la: [0.6, -0.4, .3] }], [1, {}]] }
};
export const NUMS = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, a: 1, an: 1, double: 2, triple: 3 };
const COUNT_RE = /^(\d+|one|two|three|four|five|six|seven|eight|a|an|double|triple)\b\s*/;
const COUNT_WORD = ['', '', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'];
export function parseParts(text) {
    const out = [];
    for (const raw of text.replace(/[.;]/g, ',').split(/,|\bthen\b|\band\b/i)) {
        const part = raw.trim();
        if (!part)
            continue;
        const low = part.toLowerCase();
        let count = 1;
        const m = low.match(COUNT_RE);
        if (m) {
            count = /^\d/.test(m[1]) ? +m[1] : NUMS[m[1]];
        }
        let found = null, best = 0;
        for (const [name, st] of Object.entries(STEPS))
            for (const w of st.words)
                if (low.includes(w) && w.length > best) {
                    found = name;
                    best = w.length;
                }
        out.push({ text: part, step: found, count: found ? Math.max(1, Math.min(count, 8)) : 0 });
    }
    return out;
}
/** The steps a phrase names, in order. With `fallback`, an empty phrase plays plié and relevé (the Studio's behaviour). */
export function parsePhrase(text, fallback = true) {
    const out = [];
    for (const p of parseParts(text))
        for (let i = 0; i < p.count; i++)
            out.push(p.step);
    return out.length || !fallback ? out : ['plié', 'relevé'];
}
function withCount(p, n) {
    const bare = p.text.replace(COUNT_RE, '');
    return n <= 1 ? bare : `${COUNT_WORD[Math.min(n, 8)]} ${bare}`;
}
/** Which part produced the i-th step. */
function partOf(parts, i) { let k = 0; for (let j = 0; j < parts.length; j++) {
    k += parts[j].count;
    if (i < k)
        return j;
} return -1; }
/** Remove the i-th step, changing only the part that produced it ("two pliés" becomes "pliés"). */
export function removeStep(text, i) {
    const parts = parseParts(text), j = partOf(parts, i);
    if (j < 0)
        return text;
    const p = parts[j];
    const rest = p.count > 1 ? [withCount(p, p.count - 1)] : [];
    return [...parts.slice(0, j).map(q => q.text), ...rest, ...parts.slice(j + 1).map(q => q.text)].join(', ');
}
/** Repeat the i-th step once more, in the same part ("plié" becomes "two plié"). */
export function repeatStep(text, i) {
    const parts = parseParts(text), j = partOf(parts, i);
    if (j < 0)
        return text;
    const p = parts[j];
    if (p.count >= 8)
        return text;
    return parts.map((q, k) => (k === j ? withCount(p, p.count + 1) : q.text)).join(', ');
}
export function poseAt(step, u) {
    const k = STEPS[step].keys;
    let i = 0;
    while (i < k.length - 2 && u > k[i + 1][0])
        i++;
    const [t0, a0] = k[i], [t1, a1] = k[i + 1];
    const t = smooth(clamp((u - t0) / Math.max(t1 - t0, 1e-6), 0, 1));
    const A = P2(a0), B = P2(a1), o = {};
    const base = BASE;
    for (const key in base)
        o[key] = Array.isArray(base[key]) ? A[key].map((v, j) => lerp(v, B[key][j], t)) : lerp(A[key], B[key], t);
    return o;
}
/** The figure's joints in body space, before turning and projection: x to the dancer's right, y down
    (pelvis at 0, feet about 0.5 below it when standing straight), z to the dancer's front. */
export function skeletonLocal(p) {
    const limb = (side, a, az) => [side * Math.sin(a) * Math.cos(az), Math.cos(a), Math.sin(a) * Math.sin(az)];
    const add = (o, d, L) => [o[0] + d[0] * L, o[1] + d[1] * L, o[2] + d[2] * L];
    const hips = { l: [-0.07, 0, 0], r: [0.07, 0, 0] }, sh = { l: [-0.11, -0.3, p.lean * 0.28], r: [0.11, -0.3, p.lean * 0.28] };
    const legs = {};
    for (const [k, side] of [['l', -1], ['r', 1]]) {
        const L = p[k + 'l'];
        const th = limb(side, L[0], L[1]);
        const kn = add(hips[k], th, 0.25);
        const sh2 = limb(side, L[0] - L[2], L[1]);
        legs[k] = { k: kn, f: add(kn, sh2, 0.25) };
    }
    const arms = {};
    for (const [k, side] of [['l', -1], ['r', 1]]) {
        const A = p[k + 'a'];
        const up = limb(side, A[0], A[1]);
        const el = add(sh[k], up, 0.15);
        const fo = limb(side, A[0] + A[2], A[1]);
        arms[k] = { e: el, h: add(el, fo, 0.14) };
    }
    return { pelvis: [0, 0, 0], neck: [0, -0.32, p.lean * 0.3], head: [0, -0.41, p.lean * 0.36], ls: sh.l, rs: sh.r, lhip: hips.l, rhip: hips.r,
        le: arms.l.e, lh: arms.l.h, re: arms.r.e, rh: arms.r.h, lk: legs.l.k, lf: legs.l.f, rk: legs.r.k, rf: legs.r.f };
}
export function skeleton(p, x0, floor, s, spin) {
    const U = s * 0.45; // figure height unit
    const cs = Math.cos(spin), sn = Math.sin(spin);
    const proj = (v) => ({ x: v[0] * cs + v[2] * sn, y: v[1], z: -v[0] * sn + v[2] * cs });
    const L = skeletonLocal(p);
    const lowest = Math.max(L.lf[1], L.rf[1]);
    const oy = floor - (lowest + p.rise * 0.04 + p.lift) * U;
    const out = {};
    for (const k in L) {
        const q = proj(L[k]);
        out[k] = { x: x0 + q.x * U, y: oy + q.y * U, z: q.z };
    }
    return out;
}
/* Allen's interval algebra (Allen 1983): the 13 possible relations between two time intervals */
export function allen(a, b) {
    if (a.e < b.s)
        return 'before';
    if (b.e < a.s)
        return 'after';
    if (a.e === b.s)
        return 'meets';
    if (b.e === a.s)
        return 'met by';
    if (a.s === b.s && a.e === b.e)
        return 'equals';
    if (a.s === b.s)
        return a.e < b.e ? 'starts' : 'started by';
    if (a.e === b.e)
        return a.s > b.s ? 'finishes' : 'finished by';
    if (a.s > b.s && a.e < b.e)
        return 'during';
    if (b.s > a.s && b.e < a.e)
        return 'contains';
    return a.s < b.s ? 'overlaps' : 'overlapped by';
}
/** The movement score as data: every dancer's steps with start and length in beats (MIDI-like; see
    docs/strand-movement-notation.md section 2). Format version 0, a proposal to be changed freely. */
export function movementScore(phrase, dancers, canon, tempoBpm) {
    return {
        format: 'choreotope-movement-score', version: 0, tempoBpm, beatsPerBar: 4,
        dancers: Array.from({ length: dancers }, (_, d) => {
            let t = d * canon;
            return { dancer: d + 1, events: phrase.map(step => { const e = { step, startBeat: t, beats: STEPS[step].beats }; t += e.beats; return e; }) };
        })
    };
}
