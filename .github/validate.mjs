#!/usr/bin/env node
/**
 * Integrity checks for the public openephemeris-MCP repo. No dependencies —
 * runs anywhere Node runs.
 *
 *   node .github/validate.mjs
 *
 * Catches the things that have actually gone wrong here: manifests drifting out
 * of agreement on the version, skills published with their `<!-- INCLUDE -->`
 * markers unexpanded, README images pointing at paths that 404, and relative
 * links to files that don't exist.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];
const fail = (msg) => errors.push(msg);
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");
const exists = (rel) => fs.existsSync(path.join(ROOT, rel));

// 1. Every JSON file parses.
const jsonFiles = [".claude-plugin/marketplace.json", "plugin/openephemeris/.claude-plugin/plugin.json", "glama.json"];
for (const f of jsonFiles) {
  if (!exists(f)) { fail(`missing ${f}`); continue; }
  try { JSON.parse(read(f)); } catch (e) { fail(`${f} is not valid JSON: ${e.message}`); }
}
if (errors.length) { report(); process.exit(1); }

// 2. The marketplace listing and the plugin manifest agree on the version.
const plugin = JSON.parse(read("plugin/openephemeris/.claude-plugin/plugin.json"));
const marketplace = JSON.parse(read(".claude-plugin/marketplace.json"));
for (const p of marketplace.plugins ?? []) {
  if (p.name === plugin.name && p.version !== plugin.version) {
    fail(`marketplace.json says plugin ${p.name} is ${p.version}, plugin.json says ${plugin.version}`);
  }
  if (p.source && !exists(p.source)) fail(`marketplace.json plugin source not found: ${p.source}`);
}

// 3. Skills are fully rendered and have the frontmatter the loader needs.
const skillsDir = path.join(ROOT, "skills");
for (const name of fs.readdirSync(skillsDir)) {
  const rel = `skills/${name}/SKILL.md`;
  if (!exists(rel)) continue;
  const body = read(rel);
  if (/<!--\s*INCLUDE:/.test(body)) {
    fail(`${rel} still contains an unexpanded <!-- INCLUDE --> marker — it was published raw instead of rendered`);
  }
  const fm = body.match(/^---\n([\s\S]*?)\n---\n/);
  if (!fm) { fail(`${rel} has no frontmatter`); continue; }
  for (const key of ["name", "description", "version"]) {
    if (!new RegExp(`^${key}:`, "m").test(fm[1])) fail(`${rel} frontmatter missing "${key}"`);
  }
  const declared = fm[1].match(/^name:\s*(.+)$/m)?.[1].trim();
  if (declared && declared !== name) fail(`${rel} frontmatter name "${declared}" doesn't match its folder "${name}"`);
}

// 4. Local images and relative links in the top-level docs resolve.
for (const doc of ["README.md", "SETUP.md", "CONTRIBUTING.md", "SECURITY.md", "CODE_OF_CONDUCT.md"]) {
  if (!exists(doc)) continue;
  const body = read(doc);
  for (const m of body.matchAll(/!?\[[^\]]*\]\(([^)\s]+)\)/g)) {
    const target = m[1];
    if (/^(https?:|mailto:|#|cursor:|vscode:)/.test(target)) continue;
    const resolved = path.resolve(path.dirname(path.join(ROOT, doc)), target.split("#")[0]);
    if (!fs.existsSync(resolved)) fail(`${doc} links to a path that doesn't exist: ${target}`);
  }
  // Images hosted from this repo must point at a file that is actually committed.
  for (const m of body.matchAll(/https:\/\/raw\.githubusercontent\.com\/openephemeris\/openephemeris-MCP\/main\/(\S+?)[)\s"]/g)) {
    if (!exists(m[1])) fail(`${doc} embeds a raw.githubusercontent URL for a file not in this repo: ${m[1]}`);
  }
}

// 5. Nothing that looks like a live credential.
const SECRET = /\b(sk-[A-Za-z0-9]{20,}|oe_live_[A-Za-z0-9]{16,}|ghp_[A-Za-z0-9]{30,})\b/;
for (const dir of ["curl", "python", "typescript", "skills"]) {
  if (!exists(dir)) continue;
  const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
  for (const f of walk(path.join(ROOT, dir))) {
    const hit = fs.readFileSync(f, "utf8").match(SECRET);
    if (hit) fail(`possible live credential in ${path.relative(ROOT, f)}: ${hit[0].slice(0, 12)}…`);
  }
}

function report() {
  for (const e of errors) console.error(`  ✗ ${e}`);
}

if (errors.length) {
  console.error(`❌ ${errors.length} problem(s):`);
  report();
  process.exit(1);
}
console.log("✅ repo validation passed");
