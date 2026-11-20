// Copies only the public site files into dist/, which is the one folder Cloudflare uploads.
// An allow-list, not an ignore-list: a new internal file is left out unless someone adds it here
// (epoch#1747: working files were once public). Keep in step with the exclusions in _config.yml.
import { cpSync, rmSync, mkdirSync, existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

export const PUBLIC = ["index.html", "flock.js", "fonts", "next", "vendor"];

export function stage(root = ".", out = "dist") {
  rmSync(join(root, out), { recursive: true, force: true });
  mkdirSync(join(root, out), { recursive: true });
  for (const name of PUBLIC) {
    const from = join(root, name);
    if (!existsSync(from)) throw new Error(`public path missing: ${name}`);
    cpSync(from, join(root, out, name), { recursive: true });
  }
  return readdirSync(join(root, out)).map((n) => (statSync(join(root, out, n)).isDirectory() ? n + "/" : n));
}

if (process.argv[1] && process.argv[1].endsWith("stage-site.mjs")) {
  console.log("staged:", stage().join(", "));
}
