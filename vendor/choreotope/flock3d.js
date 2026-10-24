// GENERATED from MangroveFutures/studio packages/choreotope/app/src/lib/flock/flock3d.ts (unchanged; types stripped)
/* A 3D murmuration with topological neighbours: each bird steers by its seven nearest birds, however
   far away they are, rather than by everyone within a fixed distance. Ballerini et al. (PNAS, 2008)
   found real starling flocks behave this way, with each bird interacting with six or seven
   neighbours. Steering follows Reynolds (1987): separation, alignment, cohesion; plus attraction to
   targets (a dancer's hands, feet and head) and a gentle swirl.

   No DOM and no three.js: plain arrays, so the Studio, the Atlas and tests can all use it.
   Limit: k-nearest is found with a uniform grid, approximate when birds are very spread out. */
export class Flock3D {
    constructor(o, seed = 1) {
        this.centre = [0, 1.2, 0];
        this.cohesion = 1;
        this.alignment = 1;
        this.separation = 1;
        this.attract = 1;
        this.swirl = 0.6;
        this.cell = 0.6;
        this.grid = new Map();
        this.n = o.count;
        this.k = o.k ?? 7;
        this.speed = o.speed ?? 2.2;
        this.bounds = o.bounds ?? 4.5;
        this.pos = new Float32Array(this.n * 3);
        this.vel = new Float32Array(this.n * 3);
        this.nbr = new Int32Array(this.n * this.k).fill(-1);
        this.target = new Uint8Array(this.n);
        let s = seed;
        const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
        for (let i = 0; i < this.n; i++) {
            const a = rnd() * Math.PI * 2, r = 1.2 + rnd() * 2.2;
            this.pos.set([Math.cos(a) * r, 0.4 + rnd() * 2.6, Math.sin(a) * r], i * 3);
            this.vel.set([-Math.sin(a), (rnd() - 0.5) * 0.3, Math.cos(a)], i * 3);
            this.target[i] = i % 5;
        }
    }
    key(x, y, z) { return ((Math.floor(x / this.cell) + 512) * 1024 + (Math.floor(y / this.cell) + 512)) * 1024 + (Math.floor(z / this.cell) + 512); }
    /** Find each bird's k nearest neighbours (grid search, widening rings until k are found). */
    neighbours() {
        const { pos, n, k, nbr } = this;
        this.grid.clear();
        for (let i = 0; i < n; i++) {
            const key = this.key(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]);
            let b = this.grid.get(key);
            if (!b)
                this.grid.set(key, b = []);
            b.push(i);
        }
        const best = new Float64Array(k), idx = new Int32Array(k);
        for (let i = 0; i < n; i++) {
            best.fill(Infinity);
            idx.fill(-1);
            const x = pos[i * 3], y = pos[i * 3 + 1], z = pos[i * 3 + 2];
            const cx = Math.floor(x / this.cell), cy = Math.floor(y / this.cell), cz = Math.floor(z / this.cell);
            for (let ring = 1; ring <= 4; ring++) {
                for (let a = -ring; a <= ring; a++)
                    for (let b = -ring; b <= ring; b++)
                        for (let c = -ring; c <= ring; c++) {
                            if (ring > 1 && Math.max(Math.abs(a), Math.abs(b), Math.abs(c)) < ring)
                                continue; // only the new shell
                            const bucket = this.grid.get(((cx + a + 512) * 1024 + (cy + b + 512)) * 1024 + (cz + c + 512));
                            if (!bucket)
                                continue;
                            for (const j of bucket) {
                                if (j === i)
                                    continue;
                                const dx = pos[j * 3] - x, dy = pos[j * 3 + 1] - y, dz = pos[j * 3 + 2] - z, d = dx * dx + dy * dy + dz * dz;
                                if (d < best[k - 1]) {
                                    let m = k - 1;
                                    while (m > 0 && best[m - 1] > d) {
                                        best[m] = best[m - 1];
                                        idx[m] = idx[m - 1];
                                        m--;
                                    }
                                    best[m] = d;
                                    idx[m] = j;
                                }
                            }
                        }
                if (idx[k - 1] >= 0 && best[k - 1] < (ring * this.cell) ** 2)
                    break; // nothing closer can be further out
            }
            nbr.set(idx, i * k);
        }
    }
    /** One step. `targets` are points in metres; bird i is drawn to targets[target[i] % targets.length]. */
    step(dt, targets) {
        this.neighbours();
        const { pos, vel, n, k, nbr } = this, [ox, oy, oz] = this.centre;
        for (let i = 0; i < n; i++) {
            const x = pos[i * 3], y = pos[i * 3 + 1], z = pos[i * 3 + 2];
            let ax = 0, ay = 0, az = 0, cx = 0, cy = 0, cz = 0, sx = 0, sy = 0, sz = 0, m = 0;
            for (let q = 0; q < k; q++) {
                const j = nbr[i * k + q];
                if (j < 0)
                    continue;
                m++;
                const dx = pos[j * 3] - x, dy = pos[j * 3 + 1] - y, dz = pos[j * 3 + 2] - z, d2 = dx * dx + dy * dy + dz * dz + 1e-4;
                cx += dx;
                cy += dy;
                cz += dz;
                ax += vel[j * 3];
                ay += vel[j * 3 + 1];
                az += vel[j * 3 + 2];
                if (d2 < 0.04) {
                    sx -= dx / d2;
                    sy -= dy / d2;
                    sz -= dz / d2;
                }
            }
            let fx = 0, fy = 0, fz = 0;
            if (m) {
                fx += (cx / m) * 0.9 * this.cohesion + (ax / m - vel[i * 3]) * 1.6 * this.alignment + sx * 0.02 * this.separation;
                fy += (cy / m) * 0.9 * this.cohesion + (ay / m - vel[i * 3 + 1]) * 1.6 * this.alignment + sy * 0.02 * this.separation;
                fz += (cz / m) * 0.9 * this.cohesion + (az / m - vel[i * 3 + 2]) * 1.6 * this.alignment + sz * 0.02 * this.separation;
            }
            if (targets.length) {
                const t = targets[this.target[i] % targets.length];
                const dx = t[0] - x, dy = t[1] - y, dz = t[2] - z, d = Math.hypot(dx, dy, dz) + 0.3;
                fx += dx / d * 1.4 * this.attract;
                fy += dy / d * 1.4 * this.attract;
                fz += dz / d * 1.4 * this.attract;
            }
            const rx = x - ox, rz = z - oz;
            fx += -rz * 0.35 * this.swirl;
            fz += rx * 0.35 * this.swirl; // swirl round the dancer
            const out = Math.hypot(rx, y - oy, rz) - this.bounds;
            if (out > 0) {
                fx -= rx * out;
                fy -= (y - oy) * out;
                fz -= rz * out;
            }
            if (y < 0.15)
                fy += (0.15 - y) * 20; // the floor
            let vx = vel[i * 3] + fx * dt, vy = vel[i * 3 + 1] + fy * dt, vz = vel[i * 3 + 2] + fz * dt;
            const sp = Math.hypot(vx, vy, vz), lo = this.speed * 0.55, hi = this.speed * 1.3;
            if (sp > hi) {
                vx *= hi / sp;
                vy *= hi / sp;
                vz *= hi / sp;
            }
            else if (sp < lo && sp > 0) {
                vx *= lo / sp;
                vy *= lo / sp;
                vz *= lo / sp;
            }
            vel[i * 3] = vx;
            vel[i * 3 + 1] = vy;
            vel[i * 3 + 2] = vz;
        }
        for (let i = 0; i < n * 3; i++)
            pos[i] += vel[i] * dt;
    }
    /** Groups: connected pieces of the neighbour web, among the first `sample` birds (union–find). */
    groups(sample = this.n) {
        const p = Array.from({ length: sample }, (_, i) => i), f = (a) => (p[a] === a ? a : (p[a] = f(p[a])));
        for (let i = 0; i < sample; i++)
            for (let q = 0; q < this.k; q++) {
                const j = this.nbr[i * this.k + q];
                if (j >= 0 && j < sample)
                    p[f(i)] = f(j);
            }
        let c = 0;
        for (let i = 0; i < sample; i++)
            if (f(i) === i)
                c++;
        return c;
    }
}
