// Run: node --test scripts/
import { test } from "node:test";
import assert from "node:assert";
import { readdirSync } from "node:fs";
import { stage, PUBLIC } from "./stage-site.mjs";

test("dist holds exactly the public allow-list and no internals", () => {
  const got = stage(".", "dist").map((n) => n.replace("/", "")).sort();
  assert.deepStrictEqual(got, [...PUBLIC].sort());
  for (const banned of ["CLAUDE.md", "README.md", "design", "design-system", ".github", ".git", "wrangler.jsonc", "scripts", "node_modules", "CNAME", "_config.yml"]) {
    assert.ok(!readdirSync("dist").includes(banned), `${banned} must not be uploaded`);
  }
});
