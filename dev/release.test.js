"use strict";
// What a release must keep consistent: version, cache, manifest, files and the strict page.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { root, read } = require("./helpers");

const exists = (f) => fs.existsSync(path.join(root, f));

test("VERSION and the cache name carry the same AAAA.M.N number", () => {
  const version = /const VERSION = "([^"]+)"/.exec(read("js/g-timer.js"))[1];
  const cache = /const CACHE_VERSION = "([^"]+)"/.exec(read("sw.js"))[1];
  assert.match(version, /^20\d\d\.(?:[1-9]|1[0-2])\.\d+$/);
  assert.equal(cache, "v" + version);
});

test("every file in the precache list exists", () => {
  const sw = read("sw.js");
  const list = /PRECACHE_URLS = \[([\s\S]*?)\];/.exec(sw)[1];
  const files = [...list.matchAll(/"\.\/([^"]*)"/g)].map((m) => m[1]).filter(Boolean);
  assert.ok(files.length > 25);
  for (const f of files) assert.ok(exists(f), "missing " + f);
});

test("every file the page and the manifest point to exists", () => {
  const html = read("index.html");
  for (const m of html.matchAll(/(?:href|src)="([^"#:]+)"/g)) assert.ok(exists(m[1].split("?")[0]) || /^[a-z]+:/.test(m[1]), "index.html -> " + m[1]);
  const manifest = JSON.parse(read("manifest.webmanifest"));
  for (const i of manifest.icons) assert.ok(exists(i.src), i.src);
  for (const s of manifest.screenshots) assert.ok(exists(s.src), s.src);
});

test("the manifest screenshots are as large as the manifest says", () => {
  const manifest = JSON.parse(read("manifest.webmanifest"));
  for (const s of manifest.screenshots) {
    const png = fs.readFileSync(path.join(root, s.src));
    assert.equal(png.subarray(1, 4).toString(), "PNG");
    assert.equal(png.readUInt32BE(16) + "x" + png.readUInt32BE(20), s.sizes, s.src);
  }
  assert.deepEqual(manifest.screenshots.map((s) => s.form_factor).sort(), ["narrow", "wide"]);
});

test("manifest identity", () => {
  const m = JSON.parse(read("manifest.webmanifest"));
  assert.equal(m.id, "com.onairgarage.gtimer");
  assert.equal(m.start_url, "./");
  assert.equal(m.scope, "./");
  assert.equal(m.lang, "en");
  assert.ok(m.icons.some((i) => i.purpose === "maskable"));
});

test("the page is strict: CSP without unsafe-inline, no inline script, style or handler, English by default", () => {
  const html = read("index.html");
  const csp = /Content-Security-Policy" content="([^"]+)"/.exec(html)[1];
  assert.ok(!/unsafe-inline|unsafe-eval/.test(csp));
  assert.match(csp, /default-src 'self'/);
  assert.match(csp, /script-src 'self'/);
  assert.ok(!/<script(?![^>]*\bsrc=)/.test(html), "inline script");
  assert.ok(!/<style/.test(html), "inline style");
  assert.ok(!/\sstyle="/.test(html), "style attribute");
  assert.ok(!/\son[a-z]+="/.test(html), "inline event handler");
  assert.match(html, /<html lang="en">/);
});

test("the service worker never skips waiting by itself", () => {
  const sw = read("sw.js").replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, ""); // code only, not the comments
  const calls = sw.match(/skipWaiting\(\)/g) || [];
  assert.equal(calls.length, 1);
  assert.match(sw, /type === "SKIP_WAITING"\) self\.skipWaiting\(\)/);
});

test("the README names the checks and the tip card has its place in the structure list", () => {
  const readme = read("README.md");
  assert.match(readme, /node --test dev\/\*\.test\.js/);
  assert.match(readme, /img\/ /);
});
