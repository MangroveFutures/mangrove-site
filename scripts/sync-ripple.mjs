#!/usr/bin/env node
/* Keep vendor/ripple/ (the pond) a copy of one tagged version of the studio package, never hand-edited.

   Why a copy: the studio repo is private and this site is public, so the site cannot load the code from it.
   Why a tag and a manifest: the tag says exactly which studio commit the copy came from; vendor/ripple/MANIFEST.json
   records the tag, the commit and a SHA-256 hash of each file, so a hand edit is caught without needing studio.

   Use (Node 20 or later, no dependencies; run from anywhere):
     node scripts/sync-ripple.mjs <tag> [--studio <path>]   write vendor/ripple/ from the tag (default path ../studio)
     node scripts/sync-ripple.mjs --check                   files match MANIFEST.json (what CI runs; no studio needed)
     node scripts/sync-ripple.mjs --check --studio <path>   also match the tag's files in a studio checkout

   Hashes are taken over the text with line endings normalised to LF, so a Windows checkout does not trip the check. */

import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const FILES = ['ripple.js', 'settings.js', 'sim.js', 'render.js', 'fx.js', 'tune.js'];
const SOURCE_DIR = 'packages/ripple';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dest = join(root, 'vendor', 'ripple');
const manifestPath = join(dest, 'MANIFEST.json');

export const normalise = (text) => text.replace(/\r\n/g, '\n');
export const sha256 = (text) => createHash('sha256').update(normalise(text)).digest('hex');
const git = (studio, ...args) => execFileSync('git', ['-C', studio, ...args], { encoding: 'utf8', maxBuffer: 1 << 26 });

/* Compare the files in `dir` with the hashes in `manifest`. Returns a list of problems (empty when all match). */
export function verifyAgainstManifest(manifest, readFile) {
  const problems = [];
  for (const f of FILES) {
    const want = manifest.files && manifest.files[f];
    let text = null;
    try { text = readFile(f); } catch (e) { /* missing */ }
    if (!want) problems.push(`${f}: not in MANIFEST.json`);
    else if (text === null) problems.push(`${f}: missing from vendor/ripple/`);
    else if (sha256(text) !== want) problems.push(`${f}: differs from MANIFEST.json (hand-edited, or synced from another tag?)`);
  }
  return problems;
}

function main(argv) {
  const args = argv.slice(2);
  const studioAt = args.indexOf('--studio');
  const studio = studioAt >= 0 ? resolve(args[studioAt + 1]) : resolve(root, '..', 'studio');
  const check = args.includes('--check');
  const tag = args.find((a, i) => !a.startsWith('--') && args[i - 1] !== '--studio');

  if (check) {
    if (!existsSync(manifestPath)) { console.error('vendor/ripple/MANIFEST.json is missing. Run: node scripts/sync-ripple.mjs <tag>'); return 1; }
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
    const problems = verifyAgainstManifest(manifest, (f) => readFileSync(join(dest, f), 'utf8'));
    if (studioAt >= 0) {
      const commit = git(studio, 'rev-parse', `${manifest.tag}^{commit}`).trim();
      if (commit !== manifest.commit) problems.push(`tag ${manifest.tag} is now commit ${commit}, MANIFEST.json says ${manifest.commit}`);
      for (const f of FILES) {
        if (sha256(git(studio, 'show', `${manifest.tag}:${SOURCE_DIR}/${f}`)) !== sha256(readFileSync(join(dest, f), 'utf8'))) problems.push(`${f}: differs from studio ${manifest.tag}`);
      }
    }
    if (problems.length) { console.error(`vendor/ripple/ does not match ${manifest.tag}:\n - ` + problems.join('\n - ')); return 1; }
    console.log(`vendor/ripple/ matches ${manifest.tag} (${manifest.commit.slice(0, 10)})${studioAt >= 0 ? ', checked against studio too' : ''}.`);
    return 0;
  }

  if (!tag) { console.error('Usage: node scripts/sync-ripple.mjs <tag> [--studio <path>]  |  --check [--studio <path>]'); return 2; }
  const commit = git(studio, 'rev-parse', `${tag}^{commit}`).trim();
  mkdirSync(dest, { recursive: true });
  const files = {};
  for (const f of FILES) {
    const text = normalise(git(studio, 'show', `${tag}:${SOURCE_DIR}/${f}`));
    writeFileSync(join(dest, f), text);
    files[f] = sha256(text);
  }
  const manifest = {
    note: 'Made by scripts/sync-ripple.mjs from the private studio repo. Do not edit these files: change packages/ripple in studio, tag it, and run the script again.',
    source: 'MangroveFutures/studio', path: SOURCE_DIR, tag, commit, files,
  };
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
  console.log(`Wrote ${FILES.length} files and MANIFEST.json from studio ${tag} (${commit.slice(0, 10)}).`);
  return 0;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exit(main(process.argv));
