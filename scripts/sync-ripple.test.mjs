/* Tests for the sync script's check. Run: node --test scripts/ */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FILES, sha256, verifyAgainstManifest } from './sync-ripple.mjs';

const texts = Object.fromEntries(FILES.map((f) => [f, `// ${f}\nexport const x = 1;\n`]));
const manifest = { files: Object.fromEntries(FILES.map((f) => [f, sha256(texts[f])])) };
const read = (t) => (f) => { if (!(f in t)) throw new Error('missing'); return t[f]; };

test('a copy that matches the manifest has no problems, even with Windows line endings', () => {
  assert.deepEqual(verifyAgainstManifest(manifest, read(texts)), []);
  const crlf = Object.fromEntries(FILES.map((f) => [f, texts[f].replace(/\n/g, '\r\n')]));
  assert.deepEqual(verifyAgainstManifest(manifest, read(crlf)), []);
});

test('a hand edit, a missing file and an unlisted file are each reported', () => {
  assert.match(verifyAgainstManifest(manifest, read({ ...texts, 'sim.js': texts['sim.js'] + '// tweak\n' })).join(), /sim\.js: differs/);
  const { 'fx.js': _gone, ...fewer } = texts;
  assert.match(verifyAgainstManifest(manifest, read(fewer)).join(), /fx\.js: missing/);
  const short = { files: { ...manifest.files } }; delete short.files['tune.js'];
  assert.match(verifyAgainstManifest(short, read(texts)).join(), /tune\.js: not in MANIFEST/);
});
