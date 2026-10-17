"use strict";
// The pure parts of the timer, cut out of js/g-timer.js and run as shipped.
const test = require("node:test");
const assert = require("node:assert/strict");
const { loadHelpers } = require("./helpers");

// values made inside the vm sandbox have that realm's prototypes: compare them as plain data
const plain = (v) => JSON.parse(JSON.stringify(v));

test("clk formats seconds as mm:ss, rounded, with a sign for negative values", () => {
  const { clk } = loadHelpers().api;
  assert.equal(clk(0), "00:00");
  assert.equal(clk(125), "02:05");
  assert.equal(clk(59.6), "01:00");
  assert.equal(clk(-5), "-00:05");
  assert.equal(clk(6000), "100:00");
});

test("durStr never shows a negative duration", () => {
  const { durStr } = loadHelpers().api;
  assert.equal(durStr(3599), "59:59");
  assert.equal(durStr(-5), "00:00");
  assert.equal(durStr(6000), "100:00");
});

test("parseDur reads mm:ss, a bare number of minutes and garbage", () => {
  const { parseDur } = loadHelpers().api;
  assert.equal(parseDur("2:30"), 150);
  assert.equal(parseDur(" 12:00 "), 720);
  assert.equal(parseDur(":30"), 30);
  assert.equal(parseDur("90"), 5400, "a bare number is minutes");
  assert.equal(parseDur("1.5"), 90);
  assert.equal(parseDur("2:75"), 179, "seconds are capped at 59");
  assert.equal(parseDur(""), 0);
  assert.equal(parseDur("abc"), 0);
});

test("parseSigned keeps the sign of a correction", () => {
  const { parseSigned } = loadHelpers().api;
  assert.equal(parseSigned("-1:00"), -60);
  assert.equal(parseSigned("0:30"), 30);
  assert.equal(parseSigned("-10"), -600);
});

test("dynamic timing carries the drift of finished blocks to the next ones", () => {
  const blocks = [{ sec: 60 }, { sec: 60 }, { sec: 60 }];
  const state = { blocks, actuals: [], dynamicOn: true };
  const { api } = loadHelpers(state);
  assert.equal(api.effTarget(0), 60);
  state.actuals[0] = [70];              // block 1 ran 10 s over
  assert.equal(api.cumDevBefore(1), 10);
  assert.equal(api.effTarget(1), 50, "the next block gives the 10 s back");
  state.actuals[1] = [40];              // block 2 finished 20 s early
  assert.equal(api.cumDevBefore(2), -10, "the drift is cumulative, not per block");
  assert.equal(api.effTarget(2), 70);
  assert.equal(api.effTarget(9), 0, "no such block");
});

test("without dynamic timing every block keeps its planned time", () => {
  const state = { blocks: [{ sec: 60 }, { sec: 90 }], actuals: [[100]], dynamicOn: false };
  const { api } = loadHelpers(state);
  assert.equal(api.effTarget(1), 90);
});

test("takes of one block add up", () => {
  const state = { blocks: [{ sec: 120 }], actuals: [[30, 40], []] };
  const { api } = loadHelpers(state);
  assert.equal(api.hasTakes(0), true);
  assert.equal(api.hasTakes(1), false);
  assert.equal(api.totalTakes(0), 70);
  assert.equal(api.totalTakes(1), 0);
});

test("cleanPrograms keeps well-formed programs and trims what it keeps", () => {
  const { cleanPrograms } = loadHelpers().api;
  assert.deepEqual(plain(cleanPrograms("nope")), []);
  assert.deepEqual(plain(cleanPrograms(null)), []);
  const out = cleanPrograms([
    { id: "a", name: "News", blocks: [{ label: "Head", sec: 29.6 }, { label: "Bad", sec: 0 }, { label: "Bad", sec: "x" }, null], updated: 5 },
    { id: "b", name: "Empty", blocks: [{ label: "x", sec: -3 }] },        // no valid block: dropped
    { id: "", name: "No id", blocks: [{ label: "x", sec: 10 }] },          // no id: dropped
    { id: "c", name: "", blocks: [{ label: "x", sec: 10 }] },              // no name: dropped
    { id: "d", name: "n".repeat(100), blocks: [{ label: "l".repeat(200), sec: 10 }] },
    "junk", 7
  ]);
  assert.deepEqual(plain(out.map((p) => p.id)), ["a", "d"]);
  assert.deepEqual(plain(out[0].blocks), [{ label: "Head", sec: 30 }], "seconds are rounded, invalid blocks dropped");
  assert.equal(out[0].updated, 5);
  assert.equal(out[1].name.length, 60, "names are cut at 60 characters");
  assert.equal(out[1].blocks[0].label.length, 80, "labels are cut at 80 characters");
});

test("escapeHtml neutralises markup in labels (they are written with innerHTML)", () => {
  const { escapeHtml } = loadHelpers().api;
  assert.equal(escapeHtml(`<img src=x onerror="alert(1)">'&`), "&lt;img src=x onerror=&quot;alert(1)&quot;&gt;&#39;&amp;");
});
