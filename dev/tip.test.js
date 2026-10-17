"use strict";
// The tip card in the About window (apps/COMMON-FEATURES.md, section 6).
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { root, read, dictionaries } = require("./helpers");

const dict = dictionaries();

test("the card has the agreed texts in the three languages", () => {
  assert.equal(dict.en.get("tip.line"), "Useful to you? A coffee for the mechanics is always welcome.");
  assert.equal(dict.en.get("tip.btn"), "Tip jar");
  assert.equal(dict.it.get("tip.line"), "Ti è utile? Un caffè per i meccanici è sempre ben accetto.");
  assert.equal(dict.it.get("tip.btn"), "Salvadanaio");
  assert.equal(dict.es.get("tip.line"), "¿Te resulta útil? Un café para los mecánicos siempre es bienvenido.");
  assert.equal(dict.es.get("tip.btn"), "Hucha");
});

test("the link goes to the support page of the site in the language of the app", () => {
  assert.equal(dict.en.get("tip.url"), "https://onairgarage.com/support/");
  assert.equal(dict.it.get("tip.url"), "https://onairgarage.com/it/support/");
  assert.equal(dict.es.get("tip.url"), "https://onairgarage.com/es/support/");
  assert.match(read("js/g-timer.js"), /\$\("tipBtn"\)\.href = \$\("tipJarLink"\)\.href = t\("tip\.url"\)/, "both links follow the language");
});

test("the jar and the pill are two links to the same page, in a new tab, and only the pill is for keyboards", () => {
  const html = read("index.html");
  const card = /<aside class="tip-card"[\s\S]*?<\/aside>/.exec(html);
  assert.ok(card, "tip card in index.html");
  const links = [...card[0].matchAll(/<a [^>]*>/g)].map((m) => m[0]);
  assert.equal(links.length, 2);
  for (const a of links) {
    assert.match(a, /href="https:\/\/onairgarage\.com\/support\/"/);
    assert.match(a, /target="_blank"/);
    assert.match(a, /rel="noopener"/);
  }
  const jar = links.find((a) => a.includes("tipJarLink"));
  assert.match(jar, /tabindex="-1"/);
  assert.match(jar, /aria-hidden="true"/);
  assert.match(card[0], /<img [^>]*alt=""/, "the jar is decorative");
  assert.match(card[0], /data-i18n="tip\.line"/);
  assert.match(card[0], /data-i18n="tip\.btn"/);
});

test("the jar image is the site's, it is cached for offline use and the CSP lets it load", () => {
  const file = path.join(root, "img", "tip-jar-sm.webp");
  const head = fs.readFileSync(file).subarray(0, 12);
  assert.equal(head.subarray(0, 4).toString(), "RIFF");
  assert.equal(head.subarray(8, 12).toString(), "WEBP");
  assert.match(read("sw.js"), /"\.\/img\/tip-jar-sm\.webp"/, "in the precache list");
  assert.match(read("index.html"), /img-src 'self' data:/);
});

test("the card has no pop-up, counter or reminder: nothing about it in the code but the link", () => {
  const code = read("js/g-timer.js");
  const lines = code.split("\n").filter((l) => /tip/i.test(l));
  assert.ok(lines.every((l) => /tipBtn|tipJarLink|tip\.url|\/\/ the tip card/.test(l)), "unexpected tip code: " + lines.join(" | "));
});
