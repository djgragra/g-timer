"use strict";
// English / Italian / Spanish strings: complete, consistent, and the default is always English.
const test = require("node:test");
const assert = require("node:assert/strict");
const { read, loadI18n, dictionaries } = require("./helpers");

const dict = dictionaries();
const LANGS = ["en", "it", "es"];

test("the three languages have exactly the same keys", () => {
  const en = [...dict.en.keys()].sort();
  assert.ok(en.length > 100, "the English dictionary was read (" + en.length + " keys)");
  for (const lang of ["it", "es"]) {
    const keys = [...dict[lang].keys()].sort();
    assert.deepEqual(en.filter((k) => !keys.includes(k)), [], lang + " is missing keys");
    assert.deepEqual(keys.filter((k) => !en.includes(k)), [], lang + " has keys English does not have");
  }
});

test("no string is empty and the week and month lists are complete", () => {
  for (const lang of LANGS) {
    for (const [key, value] of dict[lang]) {
      if (Array.isArray(value)) assert.ok(value.every((x) => typeof x === "string" && x), lang + "." + key);
      else assert.ok(typeof value === "string" && value.trim(), lang + "." + key + " is empty");
    }
    assert.equal(dict[lang].get("days").length, 7, lang + " days");
    assert.equal(dict[lang].get("months").length, 12, lang + " months");
  }
});

test("a string uses the same {placeholders} in every language", () => {
  const holes = (v) => (typeof v === "string" ? (v.match(/\{\w+\}/g) || []).sort().join(",") : "");
  for (const [key, value] of dict.en) {
    for (const lang of ["it", "es"]) assert.equal(holes(dict[lang].get(key)), holes(value), lang + "." + key);
  }
});

test("every key used by the page and by the code exists", () => {
  const html = read("index.html"), code = read("js/g-timer.js");
  const used = new Set();
  for (const m of html.matchAll(/data-i18n(?:-title|-placeholder|-aria)?="([^"]+)"/g)) used.add(m[1]);
  for (const m of code.matchAll(/\bt\("([A-Za-z0-9_.]+)"/g)) used.add(m[1]);
  assert.ok(used.size > 50);
  for (const key of used) for (const lang of LANGS) assert.ok(dict[lang].has(key), "missing " + lang + "." + key);
});

test("the app opens in English, whatever the browser language", () => {
  assert.equal(loadI18n(undefined, "it-IT").I18N.lang, "en");
  assert.equal(loadI18n(undefined, "es-ES").I18N.lang, "en");
  assert.equal(loadI18n(undefined, "fr-FR").I18N.lang, "en");
});

test("only a choice made by hand is remembered", () => {
  assert.equal(loadI18n("it").I18N.lang, "it");
  assert.equal(loadI18n("es").I18N.lang, "es");
  assert.equal(loadI18n("xx").I18N.lang, "en", "an unknown saved language is ignored");
  const first = loadI18n(undefined);
  first.I18N.setLang("it");
  assert.equal(first.store.get("com.onairgarage.gtimer.lang"), "it");
  first.I18N.setLang("xx");
  assert.equal(first.I18N.lang, "it", "an unknown language is refused");
});

test("t() fills placeholders and returns the key when there is no string", () => {
  const { I18N } = loadI18n("it");
  assert.equal(I18N.t("manage.blocks", { n: 3 }), dict.it.get("manage.blocks").replace("{n}", "3"));
  assert.equal(I18N.t("no.such.key"), "no.such.key");
  assert.equal(I18N.locale(), "it-IT");
  assert.equal(loadI18n("es").I18N.locale(), "es-ES");
  assert.equal(loadI18n(undefined).I18N.locale(), "en-GB");
});
