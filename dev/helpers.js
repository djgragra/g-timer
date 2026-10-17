"use strict";
// Shared by the tests. The app is plain browser files with no exports, so the tests read the
// shipped source: i18n.js runs inside a `vm` sandbox, and single functions of g-timer.js are
// cut out of the source text and run on their own. Nothing here is a copy of the app code.
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.join(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

// Source text of `function name(...) { ... }` (braces counted; strings in these functions hold none)
function functionSource(src, name) {
  const start = src.indexOf("function " + name + "(");
  if (start < 0) throw new Error("function not found: " + name);
  let depth = 0, seen = false;
  for (let i = src.indexOf("{", start); i < src.length; i++) {
    if (src[i] === "{") { depth++; seen = true; }
    else if (src[i] === "}") { depth--; if (seen && depth === 0) return src.slice(start, i + 1); }
  }
  throw new Error("unbalanced braces in " + name);
}
// Source text of a one-line `const name = ...;`
function constSource(src, name) {
  const start = src.indexOf("const " + name + " =");
  if (start < 0) throw new Error("const not found: " + name);
  return src.slice(start, src.indexOf(";\n", start) + 1);
}

// Runs the named pieces of js/g-timer.js in a sandbox that provides the engine state they read.
function loadHelpers(state) {
  const src = read("js/g-timer.js");
  const sandbox = Object.assign({ blocks: [], actuals: [], dynamicOn: false }, state || {});
  const code = [
    constSource(src, "pad"),
    functionSource(src, "clk"),
    constSource(src, "durStr"),
    functionSource(src, "parseDur"),
    functionSource(src, "parseSigned"),
    functionSource(src, "hasTakes"),
    functionSource(src, "totalTakes"),
    functionSource(src, "cumDevBefore"),
    functionSource(src, "effTarget"),
    functionSource(src, "escapeHtml"),
    functionSource(src, "cleanPrograms"),
    "this.api = { pad, clk, durStr, parseDur, parseSigned, hasTakes, totalTakes, cumDevBefore, effTarget, escapeHtml, cleanPrograms };"
  ].join("\n");
  vm.runInNewContext(code, sandbox);
  return sandbox;
}

// js/i18n.js in a sandbox. `saved` is what localStorage holds for the language key.
function loadI18n(saved, navigatorLanguage) {
  const store = new Map();
  if (saved !== undefined) store.set("com.onairgarage.gtimer.lang", saved);
  const sandbox = {
    window: {},
    document: { documentElement: {}, querySelectorAll: () => [] },
    navigator: { language: navigatorLanguage || "en-US", languages: [navigatorLanguage || "en-US"] },
    localStorage: { getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)) }
  };
  vm.runInNewContext(read("js/i18n.js"), sandbox);
  return { I18N: sandbox.window.GTimerI18n, store };
}

// { en: Map(key -> value), it: ..., es: ... } read from the dictionary in js/i18n.js
function dictionaries() {
  const src = read("js/i18n.js");
  const result = {};
  for (const lang of ["en", "it", "es"]) {
    const at = src.indexOf("\n    " + lang + ": {");
    if (at < 0) throw new Error("language block not found: " + lang);
    const open = src.indexOf("{", at);
    let depth = 0, end = open;
    for (let i = open; i < src.length; i++) {
      if (src[i] === "{") depth++;
      else if (src[i] === "}") { depth--; if (depth === 0) { end = i; break; } }
    }
    const map = new Map();
    for (const line of src.slice(open + 1, end).split("\n")) {
      const m = /^\s*"([^"]+)":\s*(.*?),?\s*$/.exec(line);
      if (m) map.set(m[1], JSON.parse(m[2]));
    }
    result[lang] = map;
  }
  return result;
}

module.exports = { root, read, loadHelpers, loadI18n, dictionaries };
