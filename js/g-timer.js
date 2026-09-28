/* ============ G-Timer — block-based recording timer for radio ============
   © 2026 Graziano Melzi · OnAir Garage — https://onairgarage.com — MIT License
   ========================================================================== */
window.GTimer = (function () {
  "use strict";

  const VERSION = "2026.9.3";
  const I18N = window.GTimerI18n;
  const t = I18N.t;

  const $ = (id) => document.getElementById(id);

  // ---- Display / control elements ----
  const elTimer = $("timer");
  const elBadge = $("stateBadge");
  const elState = $("stateText");
  const elElapsed = $("elapsed");
  const elBar = $("progressBar");
  const elMin = $("minutes");
  const elSec = $("seconds");
  const btnStart = $("start");
  const btnStop = $("stop");
  const btnNext = $("next");
  const btnReset = $("reset");
  const btnSound = $("soundToggle");
  const btnPreroll = $("prerollToggle");
  const presets = $("presets");
  // meta + blocks panel
  const bmProg = $("bmProg"), bmPos = $("bmPos"), bmLabel = $("bmLabel");
  const blocksList = $("blocksList"), blocksFoot = $("blocksFoot");
  const progSelect = $("progSelect");

  // ---- Storage keys ----
  const KEY = "com.onairgarage.gtimer.";
  const SKEY = KEY + "programs";
  const RKEY = KEY + "lastReport";
  const LOGOKEY = KEY + "logo";

  // ---- Engine state ----
  let mode = "free";          // 'free' | 'prog'
  let blocks = [];            // working copy: [{label, sec}]
  let idx = 0;
  let actuals = [];           // recorded takes per block: actuals[i] = [sec, sec, ...]
  let targetSec = 0;
  let startEpoch = 0;
  let pausedElapsed = 0;      // seconds frozen while paused (>0 = can resume)
  let running = false;
  let finished = false;
  let rafId = null;
  let soundOn = false;
  let prerollOn = true;
  let prerollTimer = null;
  let dynamicOn = true;       // dynamic timing: carry drift over to the following blocks
  let jumped = false;         // true if the user jumped to a block from the sidebar

  // Multi-take helpers: actuals[i] is always an array of durations (sec)
  function hasTakes(i) { return Array.isArray(actuals[i]) && actuals[i].length > 0; }
  function totalTakes(i) { return hasTakes(i) ? actuals[i].reduce((s, x) => s + x, 0) : 0; }

  // Cumulative drift (sec) of completed blocks: sum(actual - planned)
  function cumDevBefore(i) {
    let d = 0;
    for (let k = 0; k < i; k++) if (hasTakes(k)) d += totalTakes(k) - blocks[k].sec;
    return d;
  }
  // Effective target of block i (drift is carried over, cascading)
  function effTarget(i) {
    if (!blocks[i]) return 0;
    return dynamicOn ? blocks[i].sec - cumDevBefore(i) : blocks[i].sec;
  }

  // ---- Program data ----
  let programs = [];
  let currentProgram = null;  // program loaded for the run
  let editingId = null;       // id being edited
  let lastReport = null;      // snapshot of the last report (can be reopened)

  function blockName(i) { return t("block") + " " + (i + 1); }

  /* ══════════ Audio ══════════ */
  let audioCtx = null;
  function beep(times, freq) {
    if (!soundOn) return;
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === "suspended") audioCtx.resume();
      const now = audioCtx.currentTime;
      for (let i = 0; i < times; i++) {
        const osc = audioCtx.createOscillator(), gain = audioCtx.createGain();
        const at = now + i * 0.28;
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq || 880, at);
        gain.gain.setValueAtTime(0.0001, at);
        gain.gain.exponentialRampToValueAtTime(0.4, at + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.22);
        osc.connect(gain).connect(audioCtx.destination);
        osc.start(at); osc.stop(at + 0.24);
      }
    } catch (e) { /* audio not available */ }
  }

  /* ══════════ Time helpers ══════════ */
  const pad = (n) => String(n).padStart(2, "0");
  function clk(sec) {
    const neg = sec < 0;
    sec = Math.abs(Math.round(sec));
    return (neg ? "-" : "") + pad(Math.floor(sec / 60)) + ":" + pad(sec % 60);
  }
  const durStr = (sec) => pad(Math.floor(Math.max(0, sec) / 60)) + ":" + pad(Math.max(0, sec) % 60);
  function parseDur(str) {
    str = String(str).trim();
    if (!str) return 0;
    if (str.includes(":")) {
      const p = str.split(":");
      return (parseInt(p[0], 10) || 0) * 60 + Math.min(59, parseInt(p[1], 10) || 0);
    }
    return Math.round((parseFloat(str) || 0) * 60); // bare number = minutes
  }

  /* ══════════ Display ══════════ */
  function paint(remaining, elapsed, opts) {
    opts = opts || {};
    elTimer.textContent = opts.text || clk(remaining);
    elTimer.className = "rec-display";
    elBar.className = "progress-bar";
    elBadge.className = "state-badge";
    let cls = "", badge = opts.badge || "";
    if (opts.text) {
      cls = opts.cls || "";
      if (cls) elTimer.classList.add("expired");
    } else if (opts.idle) {
      badge = badge || t("st.ready");   // idle state is always green
    } else if (remaining < 0) {
      cls = "over"; badge = badge || t("st.over"); elTimer.classList.add("blink-red");
    } else if (remaining <= 10) {
      cls = "danger"; badge = badge || t("st.closing");
    } else if (remaining <= 60) {
      cls = "warn"; badge = badge || t("st.warn");
    } else {
      badge = badge || t("st.rec");
    }
    if (cls) { elTimer.classList.add(cls); elBar.classList.add(cls); elBadge.classList.add(cls); }
    const frac = targetSec > 0 ? Math.max(0, Math.min(1, remaining / targetSec)) : 0;
    elBar.style.width = (frac * 100) + "%";
    elElapsed.textContent = t("elapsed", { e: clk(Math.max(0, elapsed)), t: clk(targetSec) });
    elState.textContent = badge;
  }

  function renderIdle() {
    if (mode === "prog" && !blocks.length) {
      elTimer.textContent = "00:00"; elTimer.className = "rec-display";
      elBar.className = "progress-bar"; elBar.style.width = "0%";
      elBadge.className = "state-badge"; elState.textContent = t("st.noProg");
      elElapsed.textContent = "—";
      renderMeta();
      return;
    }
    paint(targetSec, 0, { idle: true });
    renderMeta();
  }

  function renderMeta() {
    bmProg.textContent = currentProgram ? currentProgram.name : "—";
    bmPos.textContent = t("block.pos", { i: Math.min(idx, blocks.length - 1) + 1, n: blocks.length || 1 });
    bmLabel.textContent = (blocks[idx] && blocks[idx].label) || blockName(idx);
  }

  // Repaint the current state (used after a language change)
  function repaint() {
    if (running) { /* tick() repaints on the next frame */ }
    else if (finished) paint(0, 0, { text: t("st.end"), cls: "over", badge: t("st.endProg") });
    else if (pausedElapsed > 0) paint(targetSec - pausedElapsed, pausedElapsed, { badge: t("st.pause") });
    else renderIdle();
    renderMeta();
    renderBlockList();
    populateSelector();
    updateClock();
    $("aboutVer").textContent = t("about.version") + " " + VERSION;
    if (manageOverlay.classList.contains("show")) renderManageList();
    if (reportOverlay.classList.contains("show")) renderReport();
    if (editorOverlay.classList.contains("show")) {
      $("editorTitle").textContent = editingId ? t("ed.edit") : t("ed.new");
      reindexEdRows(); recomputeEdTotal();
    }
  }

  /* ══════════ Engine ══════════ */
  function start() {
    if (running || finished) return;
    if (pausedElapsed > 0) { beginRun(false); return; }   // resume
    if (mode === "free") {
      const s = readInputs();
      if (s <= 0) { flashInputs(); return; }
      blocks = [{ label: "", sec: s }]; idx = 0; actuals = []; targetSec = s;
    } else {
      if (!blocks.length || finished) return;
      targetSec = jumped ? Math.max(0, blocks[idx].sec - totalTakes(idx)) : effTarget(idx);
      jumped = false;
    }
    if (prerollOn) runPreroll(() => beginRun(true));
    else beginRun(true);
  }

  function beginRun(fresh) {
    document.body.classList.remove("paused");
    if (fresh) { pausedElapsed = 0; startEpoch = Date.now(); }
    else { startEpoch = Date.now() - pausedElapsed * 1000; pausedElapsed = 0; }
    running = true;
    if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
    setButtons();
    renderBlockList();
    cancelAnimationFrame(rafId);
    tick();
  }

  function tick() {
    const elapsed = (Date.now() - startEpoch) / 1000;
    const remaining = targetSec - elapsed;
    paint(remaining, elapsed);
    updateNextProj(remaining);
    rafId = requestAnimationFrame(tick);
  }
  // Live projection of the next block: gains/loses the current block's remaining time
  function updateNextProj(remaining) {
    const el = $("brProj");
    if (!el) return;
    const nb = blocks[idx + 1];
    if (!nb) return;
    const proj = dynamicOn ? nb.sec + remaining : nb.sec;
    el.textContent = "→ " + clk(proj);
    el.className = "br-proj" + (proj < nb.sec ? " over" : (proj > nb.sec ? " under" : ""));
  }

  function pause() {
    if (!running) return;
    pausedElapsed = (Date.now() - startEpoch) / 1000;
    running = false;
    cancelAnimationFrame(rafId);
    document.body.classList.add("paused");
    $("pauseIn").value = clk(targetSec - pausedElapsed);
    setButtons();
    paint(targetSec - pausedElapsed, pausedElapsed, { badge: t("st.pause") });
  }

  // Adjust remaining time while paused (negative allowed → overrun)
  function pauseAdjust(deltaSec) {
    if (running || pausedElapsed <= 0) return;
    targetSec += deltaSec;
    $("pauseIn").value = clk(targetSec - pausedElapsed);
    paint(targetSec - pausedElapsed, pausedElapsed, { badge: t("st.pause") });
    renderBlockList();
  }
  function pauseSetFromField() {
    if (running || pausedElapsed <= 0) return;
    const rem = parseSigned($("pauseIn").value);
    targetSec = pausedElapsed + rem;
    $("pauseIn").value = clk(targetSec - pausedElapsed);
    paint(targetSec - pausedElapsed, pausedElapsed, { badge: t("st.pause") });
    renderBlockList();
  }
  function parseSigned(str) {
    str = String(str).trim();
    const neg = str.startsWith("-");
    const v = parseDur(str.replace(/^-/, ""));
    return neg ? -v : v;
  }

  function next() {
    if (mode !== "prog" || !blocks.length || finished) return;
    // store the actual duration of the current block
    const el = running ? (Date.now() - startEpoch) / 1000 : pausedElapsed;
    if (el > 0) { if (!Array.isArray(actuals[idx])) actuals[idx] = []; actuals[idx].push(Math.round(el)); }
    jumped = false;
    running = false; pausedElapsed = 0; cancelAnimationFrame(rafId);
    document.body.classList.remove("paused");
    beep(2, 660);
    if (idx >= blocks.length - 1) {
      finished = true;
      snapshotReport();
      paint(0, 0, { text: t("st.end"), cls: "over", badge: t("st.endProg") });
      renderMeta(); renderBlockList(); setButtons();
      openReport();
      return;
    }
    idx++;
    targetSec = effTarget(idx);
    renderIdle(); renderBlockList(); setButtons();
  }

  // Redo the current block: discard its takes, restart from its target
  function redo() {
    if (mode !== "prog" || !blocks.length) return;
    if (finished) finished = false;
    running = false; pausedElapsed = 0; cancelAnimationFrame(rafId);
    document.body.classList.remove("paused");
    jumped = false;
    actuals[idx] = [];
    targetSec = effTarget(idx);
    renderIdle(); renderBlockList(); setButtons();
  }

  // Go back to the previous block (or reopen the last one if finished) to redo it
  function back() {
    if (mode !== "prog" || !blocks.length) return;
    running = false; pausedElapsed = 0; cancelAnimationFrame(rafId);
    document.body.classList.remove("paused");
    jumped = false;
    if (finished) { finished = false; }
    else if (idx > 0) { idx--; }
    else return;
    actuals[idx] = [];
    targetSec = effTarget(idx);
    renderIdle(); renderBlockList(); setButtons();
  }

  // Jump to any block by clicking it in the sidebar (non-linear recording)
  function jumpToBlock(i) {
    if (running || finished || i < 0 || !blocks[i]) return;
    // Keep the partial take if the current block was paused
    if (pausedElapsed > 0 && mode === "prog") {
      const el = Math.round(pausedElapsed);
      if (el > 0) {
        if (!Array.isArray(actuals[idx])) actuals[idx] = [];
        actuals[idx].push(el);
      }
    }
    pausedElapsed = 0;
    document.body.classList.remove("paused");
    // Dynamic timing makes no sense in non-linear recording: turn it off
    if (dynamicOn) {
      dynamicOn = false;
      $("dynToggle").classList.toggle("on", false);
      $("dynToggle").classList.toggle("off", true);
    }
    idx = i;
    jumped = true;
    // Target = remaining: planned minus already recorded
    targetSec = Math.max(0, blocks[i].sec - totalTakes(i));
    renderIdle(); renderBlockList(); setButtons();
  }

  function reset() {
    running = false; finished = false; pausedElapsed = 0; idx = 0; actuals = [];
    cancelAnimationFrame(rafId);
    hidePreroll();
    document.body.classList.remove("paused");
    if (mode === "free") { blocks = []; targetSec = 0; elMin.value = ""; elSec.value = ""; }
    else { targetSec = effTarget(0); }
    renderIdle(); renderBlockList(); setButtons();
  }

  function setButtons() {
    btnStart.disabled = running || finished || (mode === "prog" && !blocks.length);
    btnStop.disabled = !running;
    btnNext.disabled = mode !== "prog" || finished || !blocks.length;
    $("redo").disabled = mode !== "prog" || !blocks.length;
    $("back").disabled = mode !== "prog" || !blocks.length || (!finished && idx === 0);
    const rb = $("reportBtn"); rb.disabled = !lastReport; rb.classList.toggle("on", !!lastReport);
  }

  function readInputs() {
    const m = Math.max(0, parseInt(elMin.value, 10) || 0);
    const s = Math.max(0, Math.min(59, parseInt(elSec.value, 10) || 0));
    return m * 60 + s;
  }
  // Preview the entered values on the display (free mode, not started)
  function previewFree() {
    if (mode !== "free" || running || finished) return;
    targetSec = readInputs();
    renderIdle();
  }
  function flashInputs() {
    [elMin, elSec].forEach((el) => { el.classList.add("err"); setTimeout(() => el.classList.remove("err"), 600); });
  }

  /* ══════════ Pre-roll 3·2·1 ══════════ */
  const elPreroll = $("preroll"), elPrerollNum = $("prerollNum");
  function runPreroll(cb) {
    let n = 3;
    elPrerollNum.textContent = n;
    elPreroll.classList.add("show");
    beep(1, 660);
    clearInterval(prerollTimer);
    prerollTimer = setInterval(() => {
      n--;
      if (n > 0) {
        elPrerollNum.textContent = n;
        elPrerollNum.style.animation = "none"; void elPrerollNum.offsetWidth; elPrerollNum.style.animation = "";
        beep(1, n === 1 ? 990 : 660);
      } else {
        clearInterval(prerollTimer);
        hidePreroll();
        beep(1, 1320);
        cb();
      }
    }, 1000);
  }
  function hidePreroll() { clearInterval(prerollTimer); elPreroll.classList.remove("show"); }

  /* ══════════ Blocks panel ══════════ */
  function renderBlockList() {
    if (mode !== "prog") return;
    blocksList.innerHTML = "";
    blocks.forEach((b, i) => {
      const isCurrent = i === idx && !finished;
      const hasTk = hasTakes(i);
      const row = document.createElement("div");
      row.className = "block-row" +
        (isCurrent ? " current" : "") +
        (hasTk && !isCurrent ? " done" : "") +
        (!running && !finished ? " selectable" : "");
      const editable = !running && !finished && i === idx;
      let subHtml = "";
      if (hasTk) {
        const tot = totalTakes(i);
        const diff = tot - b.sec;
        const cls = diff > 0 ? "over" : (diff < 0 ? "under" : "");
        const takeBadge = actuals[i].length > 1
          ? ` <span class="br-take-badge">${actuals[i].length}× (${actuals[i].map(durStr).join("+")})</span>`
          : "";
        let detHtml;
        if (diff < 0) {
          const rem = b.sec - tot;
          detHtml = `${t("br.rec")} ${durStr(tot)} · <span class="br-rim">${t("br.rem")} ${durStr(rem)}</span>`;
        } else {
          detHtml = `${t("br.rec")} ${durStr(tot)} ${diff > 0 ? "+" : "±"}${durStr(Math.abs(diff))}`;
        }
        subHtml = `<div class="br-actual ${cls}">${detHtml}${takeBadge}</div>`;
      } else if (isCurrent && dynamicOn && cumDevBefore(i) !== 0) {
        subHtml = `<div class="br-recalc">${t("br.recalc")} ${clk(effTarget(i))}</div>`;
      } else if (i === idx + 1 && !finished) {
        subHtml = `<div class="br-proj" id="brProj">→ ${clk(b.sec)}</div>`;
      }
      row.innerHTML =
        `<span class="br-idx">${hasTk && !isCurrent ? "✓" : (i + 1)}</span>` +
        `<div class="br-main"><div class="br-label">${escapeHtml(b.label || blockName(i))}</div>${subHtml}</div>` +
        `<input class="br-dur" value="${durStr(b.sec)}" ${editable ? "" : "disabled"} data-i="${i}">`;
      blocksList.appendChild(row);
      // Row click → non-linear jump to the block
      row.addEventListener("click", (e) => {
        if (e.target.classList.contains("br-dur")) return;
        jumpToBlock(i);
      });
    });
    blocksList.querySelectorAll(".br-dur").forEach((inp) => {
      inp.addEventListener("change", () => {
        const i = +inp.dataset.i;
        blocks[i].sec = parseDur(inp.value);
        inp.value = durStr(blocks[i].sec);
        if (i === idx && !running && !finished) { targetSec = jumped ? Math.max(0, blocks[i].sec - totalTakes(i)) : effTarget(i); renderIdle(); }
        renderFoot();
      });
    });
    renderFoot();
  }
  function renderFoot() {
    const planned = blocks.reduce((a, b) => a + b.sec, 0);
    let rec = 0; for (let i = 0; i < blocks.length; i++) rec += totalTakes(i);
    blocksFoot.textContent = t("total") + " " + clk(planned) + (rec > 0 ? " · " + t("recorded") + " " + clk(rec) : "");
  }
  function escapeHtml(s) { return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }

  /* ══════════ Mode ══════════ */
  function setMode(m) {
    if (mode === m) return;
    reset();
    mode = m;
    document.body.className = "mode-" + m;
    $("modeFreeBtn").classList.toggle("act-blue", m === "free");
    $("modeProgBtn").classList.toggle("act-blue", m === "prog");
    if (m === "prog") {
      if (!currentProgram && programs.length) loadProgramById(programs[0].id, true);
      else if (currentProgram) loadProgramIntoRun(currentProgram);
      else renderIdle();
    } else {
      currentProgram = null; targetSec = 0;
      renderIdle();
    }
    setButtons();
  }

  /* ══════════ Programs: run ══════════ */
  function loadProgramIntoRun(prog) {
    currentProgram = prog;
    blocks = prog.blocks.map((b) => ({ label: b.label, sec: b.sec }));
    idx = 0; actuals = []; running = false; finished = false; pausedElapsed = 0;
    document.body.classList.remove("paused");
    targetSec = effTarget(0);
    progSelect.value = prog.id;
    renderIdle(); renderBlockList(); setButtons();
  }
  function loadProgramById(id, silent) {
    const p = programs.find((x) => x.id === id);
    if (p) loadProgramIntoRun(p);
    if (!silent && mode !== "prog") setMode("prog");
  }
  function onSelectProgram(id) { if (id) loadProgramById(id, true); }
  function restoreBlocks() {
    if (!currentProgram) return;
    blocks = currentProgram.blocks.map((b) => ({ label: b.label, sec: b.sec }));
    if (!running && !finished) targetSec = effTarget(idx);
    renderIdle(); renderBlockList();
  }

  /* ══════════ Programs: storage (browser only) ══════════ */
  // Bilingual text for the built-in sample programs, so they can follow the
  // interface language even after being saved to localStorage (see relocalizeSamples).
  const SAMPLE_I18N = {
    "sample-show": {
      en: { name: "Sample · One-hour show", blocks: ["Opening", "Segment 1", "Segment 2", "Interview", "Segment 3", "Closing"] },
      it: { name: "Esempio · Show di un'ora", blocks: ["Apertura", "Segmento 1", "Segmento 2", "Intervista", "Segmento 3", "Chiusura"] }
    },
    "sample-podcast": {
      en: { name: "Sample · Podcast episode", blocks: ["Cold open", "Intro & theme", "Main topic", "Listener questions", "Outro"] },
      it: { name: "Esempio · Puntata podcast", blocks: ["Cold open", "Sigla e presentazione", "Tema principale", "Domande degli ascoltatori", "Saluti"] }
    },
    "sample-news": {
      en: { name: "Sample · 5' news bulletin", blocks: ["Headlines", "Stories", "Weather", "Close"] },
      it: { name: "Esempio · Notiziario 5'", blocks: ["Titoli", "Notizie", "Meteo", "Chiusura"] }
    }
  };
  const SAMPLE_DURATIONS = {
    "sample-show": [120, 720, 720, 900, 600, 120],
    "sample-podcast": [60, 90, 1200, 480, 60],
    "sample-news": [30, 210, 40, 20]
  };
  function samplePrograms() {
    const lang = I18N.lang === "it" ? "it" : "en";
    return Object.keys(SAMPLE_I18N).map((id) => {
      const t = SAMPLE_I18N[id][lang], durations = SAMPLE_DURATIONS[id];
      return { id, name: t.name, blocks: t.blocks.map((label, i) => ({ label, sec: durations[i] })), updated: Date.now() };
    });
  }
  // If a program is an untouched sample (still named and labelled exactly as
  // either language's version), relabel it to the current language. Returns
  // true if it changed anything.
  function relocalizeSample(p) {
    const t = SAMPLE_I18N[p.id];
    if (!t) return false;
    const from = ["en", "it"].find((l) => t[l].name === p.name && p.blocks.length === t[l].blocks.length && p.blocks.every((b, i) => b.label === t[l].blocks[i]));
    if (!from) return false;
    const to = I18N.lang === "it" ? "it" : "en";
    if (to === from) return false;
    p.name = t[to].name;
    p.blocks.forEach((b, i) => { b.label = t[to].blocks[i]; });
    return true;
  }
  // Re-localize every untouched sample program to the current language,
  // called whenever the interface language changes.
  function relocalizeSamples() {
    let changed = false;
    programs.forEach((p) => { if (relocalizeSample(p)) changed = true; });
    if (changed) {
      storeSave();
      if (currentProgram && mode === "prog" && blocks.length === currentProgram.blocks.length) {
        blocks.forEach((b, i) => { b.label = currentProgram.blocks[i].label; });
      }
    }
    return changed;
  }
  // Keep only well-formed programs (also used for imported files)
  function cleanPrograms(list) {
    if (!Array.isArray(list)) return [];
    return list.filter((p) => p && typeof p.id === "string" && p.id && typeof p.name === "string" && p.name && Array.isArray(p.blocks))
      .map((p) => ({
        id: p.id.slice(0, 64),
        name: p.name.slice(0, 60),
        blocks: p.blocks
          .filter((b) => b && Number.isFinite(+b.sec) && +b.sec > 0)
          .map((b) => ({ label: String(b.label == null ? "" : b.label).slice(0, 80), sec: Math.round(+b.sec) })),
        updated: Number.isFinite(+p.updated) ? +p.updated : Date.now()
      }))
      .filter((p) => p.blocks.length);
  }
  function storeLoad() {
    try {
      const raw = localStorage.getItem(SKEY);
      if (raw === null) { const s = samplePrograms(); localStorage.setItem(SKEY, JSON.stringify(s)); return s; }
      return cleanPrograms(JSON.parse(raw));
    } catch (e) { return samplePrograms(); }
  }
  function storeSave() {
    try { localStorage.setItem(SKEY, JSON.stringify(programs)); } catch (e) { /* storage unavailable */ }
  }
  const uid = () => (crypto.randomUUID ? crypto.randomUUID() : "p" + Date.now() + Math.random().toString(36).slice(2, 7));

  function populateSelector() {
    progSelect.innerHTML = "";
    if (!programs.length) {
      const o = document.createElement("option"); o.value = ""; o.textContent = t("manage.none"); progSelect.appendChild(o);
      return;
    }
    programs.forEach((p) => {
      const o = document.createElement("option"); o.value = p.id; o.textContent = p.name; progSelect.appendChild(o);
    });
    if (currentProgram) progSelect.value = currentProgram.id;
  }

  /* ══════════ Manage modal ══════════ */
  const manageOverlay = $("manageOverlay");
  function openManage() { renderManageList(); manageOverlay.classList.add("show"); }
  function closeManage() { manageOverlay.classList.remove("show"); }
  function renderManageList() {
    const list = $("manageList");
    list.innerHTML = "";
    if (!programs.length) { list.innerHTML = `<div class="prog-empty">${t("manage.empty")}</div>`; return; }
    programs.forEach((p) => {
      const tot = p.blocks.reduce((a, b) => a + b.sec, 0);
      const id = escapeHtml(p.id);
      const item = document.createElement("div");
      item.className = "prog-item";
      item.innerHTML =
        `<div class="pi-main"><div class="pi-name">${escapeHtml(p.name)}</div>` +
        `<div class="pi-meta">${t("manage.blocks", { n: p.blocks.length })} · ${clk(tot)}</div></div>` +
        `<div class="pi-actions">` +
        `<button class="pi-btn load" type="button" title="${t("manage.load")}" data-a="load" data-id="${id}">▸</button>` +
        `<button class="pi-btn" type="button" title="${t("manage.edit")}" data-a="edit" data-id="${id}">✎</button>` +
        `<button class="pi-btn" type="button" title="${t("manage.dup")}" data-a="dup" data-id="${id}">⧉</button>` +
        `<button class="pi-btn" type="button" title="${t("manage.del")}" data-a="del" data-id="${id}">🗑</button>` +
        `</div>`;
      list.appendChild(item);
    });
    list.querySelectorAll(".pi-btn").forEach((b) => {
      b.addEventListener("click", () => {
        const id = b.dataset.id;
        if (b.dataset.a === "load") { loadProgramById(id); if (mode !== "prog") setMode("prog"); else loadProgramById(id, true); closeManage(); }
        else if (b.dataset.a === "edit") openEditor(id);
        else if (b.dataset.a === "dup") duplicateProgram(id);
        else if (b.dataset.a === "del") deleteProgramById(id);
      });
    });
  }

  /* ══════════ Editor ══════════ */
  const editorOverlay = $("editorOverlay");
  function openEditor(id) {
    editingId = id || null;
    const edBlocks = $("edBlocks");
    edBlocks.innerHTML = "";
    if (id) {
      const p = programs.find((x) => x.id === id);
      $("editorTitle").textContent = t("ed.edit");
      $("edName").value = p.name;
      p.blocks.forEach((b) => addBlockRow(b.label, b.sec));
      $("edDelete").classList.remove("hidden");
    } else {
      $("editorTitle").textContent = t("ed.new");
      $("edName").value = "";
      addBlockRow(blockName(0), 0);
      $("edDelete").classList.add("hidden");
    }
    recomputeEdTotal();
    editorOverlay.classList.add("show");
    $("edName").focus();
  }
  function closeEditor() { editorOverlay.classList.remove("show"); }
  function addBlockRow(label, sec) {
    const wrap = $("edBlocks");
    const n = wrap.children.length + 1;
    const row = document.createElement("div");
    row.className = "ed-row";
    row.innerHTML =
      `<span class="er-idx">${n}</span>` +
      `<input class="er-label" placeholder="${escapeHtml(blockName(n - 1))}" value="${escapeHtml(label || "")}">` +
      `<input class="er-dur" placeholder="mm:ss" value="${sec ? durStr(sec) : ""}">` +
      `<button class="er-del" type="button" title="${t("ed.remove")}">✕</button>`;
    wrap.appendChild(row);
    row.querySelector(".er-del").addEventListener("click", () => { row.remove(); reindexEdRows(); recomputeEdTotal(); });
    row.querySelector(".er-dur").addEventListener("input", recomputeEdTotal);
  }
  function reindexEdRows() {
    $("edBlocks").querySelectorAll(".ed-row").forEach((r, i) => {
      r.querySelector(".er-idx").textContent = i + 1;
      r.querySelector(".er-label").placeholder = blockName(i);
      r.querySelector(".er-del").title = t("ed.remove");
    });
  }
  function recomputeEdTotal() {
    let tot = 0;
    $("edBlocks").querySelectorAll(".er-dur").forEach((d) => tot += parseDur(d.value));
    $("edTotal").textContent = t("total") + " " + clk(tot);
  }
  function saveProgram() {
    const nameEl = $("edName");
    const name = nameEl.value.trim();
    if (!name) { nameEl.focus(); nameEl.classList.add("err"); setTimeout(() => nameEl.classList.remove("err"), 800); return; }
    const blks = [];
    $("edBlocks").querySelectorAll(".ed-row").forEach((r, i) => {
      const sec = parseDur(r.querySelector(".er-dur").value);
      if (sec > 0) blks.push({ label: r.querySelector(".er-label").value.trim() || blockName(i), sec });
    });
    if (!blks.length) { recomputeEdTotal(); return; }
    if (editingId) {
      const p = programs.find((x) => x.id === editingId);
      p.name = name; p.blocks = blks; p.updated = Date.now();
    } else {
      const p = { id: uid(), name, blocks: blks, updated: Date.now() };
      programs.push(p); editingId = p.id;
    }
    storeSave();
    populateSelector(); renderManageList();
    // load the saved program if in program mode and none/the same one is in use
    const saved = programs.find((x) => x.id === editingId);
    if (mode === "prog" && (!currentProgram || currentProgram.id === editingId)) loadProgramIntoRun(saved);
    closeEditor();
  }
  function duplicateProgram(id) {
    const p = programs.find((x) => x.id === id);
    if (!p) return;
    programs.push({ id: uid(), name: p.name + " " + t("manage.copy"), blocks: p.blocks.map((b) => ({ label: b.label, sec: b.sec })), updated: Date.now() });
    storeSave(); populateSelector(); renderManageList();
  }
  function deleteProgramById(id) {
    const p = programs.find((x) => x.id === id);
    if (!p || !confirm(t("manage.confirmDel", { name: p.name }))) return;
    programs = programs.filter((x) => x.id !== id);
    if (currentProgram && currentProgram.id === id) { currentProgram = null; if (mode === "prog") { if (programs.length) loadProgramById(programs[0].id, true); else { blocks = []; targetSec = 0; renderIdle(); renderBlockList(); } } }
    storeSave(); populateSelector(); renderManageList(); setButtons();
  }
  function deleteCurrentProgram() {
    if (editingId) { deleteProgramById(editingId); closeEditor(); }
  }

  /* ══════════ Export / Import ══════════ */
  function download(content, type, filename) {
    const blob = new Blob([content], { type });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
  function exportPrograms() {
    download(JSON.stringify(programs, null, 2), "application/json", t("prog.file") + ".json");
  }
  function importPrograms() { $("importFile").click(); }
  $("importFile").addEventListener("change", (e) => {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const data = JSON.parse(r.result);
        if (!Array.isArray(data)) throw new Error("not an array");
        const clean = cleanPrograms(data);
        if (!clean.length) throw new Error("no valid programs");
        const byId = {};
        programs.forEach((p) => byId[p.id] = p);
        clean.forEach((p) => byId[p.id] = p);
        programs = Object.values(byId);
        storeSave(); populateSelector(); renderManageList();
      } catch (_) { alert(t("manage.badFile")); }
    };
    r.readAsText(f);
    e.target.value = "";
  });

  /* ══════════ Recording report ══════════ */
  const reportOverlay = $("reportOverlay");
  function buildReport() {
    const rows = blocks.map((b, i) => {
      const tot = hasTakes(i) ? totalTakes(i) : null;
      return {
        n: i + 1, label: b.label || blockName(i),
        planned: b.sec, actual: tot,
        diff: tot != null ? tot - b.sec : null,
        takes: (actuals[i] && actuals[i].length > 1) ? actuals[i] : null
      };
    });
    const totPlanned = blocks.reduce((a, b) => a + b.sec, 0);
    let totActual = 0; for (let i = 0; i < blocks.length; i++) totActual += totalTakes(i);
    return { rows, totPlanned, totActual, drift: totActual - totPlanned };
  }
  function snapshotReport() {
    lastReport = Object.assign({ name: currentProgram ? currentProgram.name : "", when: Date.now() }, buildReport());
    try { localStorage.setItem(RKEY, JSON.stringify(lastReport)); } catch (e) { /* storage unavailable */ }
    $("reportBtn").classList.add("on");
  }
  const reportName = (r) => (r && r.name) || (currentProgram ? currentProgram.name : t("rep.recording"));
  const fmtWhen = (ms) => new Date(ms).toLocaleString(I18N.locale());
  function renderReportTitle() {
    const r = lastReport;
    const when = r && r.when ? " · " + fmtWhen(r.when) : "";
    $("reportTitle").textContent = "Report — " + reportName(r) + when;
  }
  function renderReport() {
    const r = lastReport || buildReport();
    const when = r.when ? " · " + fmtWhen(r.when) : "";
    $("reportTitle").textContent = "Report — " + reportName(r) + when;
    let html = `<tr><th>#</th><th>${t("block")}</th><th>${t("rep.planned")}</th><th>${t("rep.actual")}</th><th>${t("rep.diff")}</th></tr>`;
    r.rows.forEach((x) => {
      const dc = x.diff == null ? "" : (x.diff > 0 ? "up" : (x.diff < 0 ? "dn" : ""));
      const ds = x.diff == null ? "—" : (x.diff > 0 ? "+" : (x.diff < 0 ? "-" : "±")) + durStr(Math.abs(x.diff));
      const tkHtml = x.takes ? `<span class="rt-takes">${x.takes.map(durStr).join("+")} </span>` : "";
      html += `<tr><td>${x.n}</td><td class="rt-label">${escapeHtml(x.label)}</td>` +
        `<td>${durStr(x.planned)}</td><td>${x.actual == null ? "—" : durStr(x.actual)}${tkHtml}</td>` +
        `<td class="${dc}">${ds}</td></tr>`;
    });
    $("reportTable").innerHTML = html;
    const driftCls = r.drift > 0 ? "up" : (r.drift < 0 ? "dn" : "");
    const driftStr = (r.drift > 0 ? "+" : (r.drift < 0 ? "-" : "±")) + durStr(Math.abs(r.drift));
    $("reportTot").innerHTML =
      `<div class="rt-row"><span>${t("rep.totPlanned")}</span><span>${clk(r.totPlanned)}</span></div>` +
      `<div class="rt-row"><span>${t("rep.totActual")}</span><span>${clk(r.totActual)}</span></div>` +
      `<div class="rt-row rt-drift ${driftCls}"><span>${t("rep.drift")}</span><span>${driftStr}</span></div>`;
  }
  function openReport() { if (!lastReport && !blocks.length) return; renderReport(); reportOverlay.classList.add("show"); }
  function closeReport() { reportOverlay.classList.remove("show"); }
  function reportText() {
    const r = lastReport || buildReport();
    const w = [t("rep.planned"), t("rep.actual")].reduce((m, s) => Math.max(m, s.length), 7);
    let s = t("rep.header") + " — " + reportName(r) + "\n";
    s += fmtWhen(r.when || Date.now()) + "\n\n";
    s += "#  " + t("block").padEnd(22) + " " + t("rep.planned").padStart(w) + "  " + t("rep.actual").padStart(w) + "  " + t("rep.diff") + "\n";
    r.rows.forEach((x) => {
      const ds = x.diff == null ? "—" : (x.diff >= 0 ? "+" : "-") + durStr(Math.abs(x.diff));
      const tkLine = x.takes ? " [" + x.takes.map(durStr).join("+") + "]" : "";
      s += String(x.n).padEnd(3) + (x.label || "").padEnd(22).slice(0, 22) + " " +
        durStr(x.planned).padStart(w) + "  " + (x.actual == null ? "—" : durStr(x.actual)).padStart(w) + "  " + ds + tkLine + "\n";
    });
    const lw = Math.max(t("rep.totPlanned").length, t("rep.totActual").length, t("rep.drift").length) + 2;
    s += "\n" + (t("rep.totPlanned") + ":").padEnd(lw) + clk(r.totPlanned) + "\n";
    s += (t("rep.totActual") + ":").padEnd(lw) + clk(r.totActual) + "\n";
    s += (t("rep.drift") + ":").padEnd(lw) + (r.drift >= 0 ? "+" : "-") + durStr(Math.abs(r.drift)) + "\n";
    return s;
  }
  function copyReport() {
    const txt = reportText();
    if (navigator.clipboard) { navigator.clipboard.writeText(txt).catch(fallbackCopy); }
    else fallbackCopy();
    function fallbackCopy() {
      const ta = document.createElement("textarea"); ta.value = txt; ta.classList.add("offscreen");
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); } catch (_) { /* ignore */ }
      document.body.removeChild(ta);
    }
    $("reportTitle").textContent = t("rep.copied");
    setTimeout(renderReportTitle, 1400);
  }
  function exportReport() {
    const r = lastReport || buildReport();
    const base = (r.name || (currentProgram && currentProgram.name) || t("rep.recording")).replace(/[^\p{L}\p{N}_-]+/gu, "_");
    download(reportText(), "text/plain", t("rep.file") + "-" + base + ".txt");
  }

  /* ══════════ Dynamic timing toggle ══════════ */
  function toggleDyn() {
    dynamicOn = !dynamicOn;
    $("dynToggle").classList.toggle("on", dynamicOn);
    $("dynToggle").classList.toggle("off", !dynamicOn);
    if (mode === "prog" && !running && !finished) { targetSec = effTarget(idx); renderIdle(); }
    renderBlockList();
  }

  /* ══════════ Station logo ══════════ */
  const LOGO_MAX = 512;
  const logoOverlay = $("logoOverlay");
  function loadLogo() {
    try { return localStorage.getItem(LOGOKEY); } catch (e) { return null; }
  }
  function showLogo() {
    const data = loadLogo();
    const img = $("userLogo"), prev = $("logoPreview");
    if (data) {
      img.src = data; prev.src = data;
      img.classList.remove("hidden"); prev.classList.remove("hidden");
      $("appName").classList.add("hidden"); $("logoEmpty").classList.add("hidden");
      $("logoRemove").disabled = false;
    } else {
      img.removeAttribute("src"); prev.removeAttribute("src");
      img.classList.add("hidden"); prev.classList.add("hidden");
      $("appName").classList.remove("hidden"); $("logoEmpty").classList.remove("hidden");
      $("logoRemove").disabled = true;
    }
  }
  function logoError(key) {
    const el = $("logoErr");
    if (!key) { el.textContent = ""; el.classList.add("hidden"); return; }
    el.textContent = t(key); el.classList.remove("hidden");
  }
  function openLogo() { logoError(null); showLogo(); logoOverlay.classList.add("show"); }
  function closeLogo() { logoOverlay.classList.remove("show"); }
  function removeLogo() {
    try { localStorage.removeItem(LOGOKEY); } catch (e) { /* storage unavailable */ }
    logoError(null); showLogo();
  }
  // Resize client-side (max 512 px) and store as a data URL; SVGs are rasterised to PNG
  $("logoFile").addEventListener("change", (e) => {
    const f = e.target.files[0]; e.target.value = "";
    if (!f) return;
    const okType = /^image\/(png|jpeg|svg\+xml)$/.test(f.type) || /\.(png|jpe?g|svg)$/i.test(f.name);
    if (!okType) { logoError("logo.errType"); return; }
    const isJpeg = f.type === "image/jpeg" || /\.jpe?g$/i.test(f.name);
    // Read as a data URL (no blob: URLs, so it works with a strict img-src CSP)
    const reader = new FileReader();
    reader.onerror = () => logoError("logo.errRead");
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let w = img.naturalWidth || LOGO_MAX, h = img.naturalHeight || LOGO_MAX;
        const scale = Math.min(1, LOGO_MAX / Math.max(w, h));
        w = Math.max(1, Math.round(w * scale)); h = Math.max(1, Math.round(h * scale));
        const cv = document.createElement("canvas");
        cv.width = w; cv.height = h;
        const ctx = cv.getContext("2d");
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, w, h);
        let data;
        try { data = isJpeg ? cv.toDataURL("image/jpeg", 0.9) : cv.toDataURL("image/png"); }
        catch (err) { logoError("logo.errRead"); return; }
        try { localStorage.setItem(LOGOKEY, data); }
        catch (err) { logoError("logo.errSave"); return; }
        logoError(null); showLogo();
      };
      img.onerror = () => logoError("logo.errRead");
      img.src = reader.result;
    };
    reader.readAsDataURL(f);
  });

  /* ══════════ About / Fullscreen / options ══════════ */
  const aboutOverlay = $("aboutOverlay");
  function openAbout() { aboutOverlay.classList.add("show"); }
  function closeAbout() { aboutOverlay.classList.remove("show"); }

  function toggleFS() {
    const root = document.documentElement;
    if (!document.fullscreenElement) {
      const req = root.requestFullscreen || root.webkitRequestFullscreen;
      if (req) Promise.resolve(req.call(root)).catch(() => {});
    } else (document.exitFullscreen || document.webkitExitFullscreen).call(document);
  }
  document.addEventListener("fullscreenchange", () => { $("fsBtn").textContent = document.fullscreenElement ? "⤢" : "⛶"; });

  function toggleSound() {
    soundOn = !soundOn;
    btnSound.classList.toggle("off", !soundOn);
    btnSound.textContent = soundOn ? "🔊" : "🔇";
    if (soundOn) beep(1);
  }
  function togglePreroll() {
    prerollOn = !prerollOn;
    btnPreroll.classList.toggle("on", prerollOn);
    btnPreroll.classList.toggle("off", !prerollOn);
  }

  function applyLang() {
    I18N.apply();
    $("langEn").classList.toggle("act-blue", I18N.lang === "en");
    $("langIt").classList.toggle("act-blue", I18N.lang === "it");
    repaint();
  }
  function setLang(l) { I18N.setLang(l); relocalizeSamples(); applyLang(); }

  /* ══════════ Install as an app (PWA) ══════════ */
  const installOverlay = $("installOverlay");
  const btnInstall = $("installBtn");
  let deferredInstallPrompt = null;
  function isStandalone() {
    return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
  }
  // iPadOS Safari reports as "MacIntel" but, unlike a real Mac, has touch points
  function isIOS() {
    const ua = navigator.userAgent || "";
    return /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  }
  function updateInstallButton() {
    if (isStandalone()) { btnInstall.classList.add("hidden"); return; }
    btnInstall.classList.toggle("hidden", !(deferredInstallPrompt || isIOS()));
  }
  function openInstallInfo() { installOverlay.classList.add("show"); }
  function closeInstallInfo() { installOverlay.classList.remove("show"); }
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    updateInstallButton();
  });
  window.addEventListener("appinstalled", () => { deferredInstallPrompt = null; updateInstallButton(); });
  btnInstall.addEventListener("click", async () => {
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      try { await deferredInstallPrompt.userChoice; } catch (e) { /* ignore */ }
      deferredInstallPrompt = null;
      updateInstallButton();
    } else if (isIOS()) {
      openInstallInfo();
    }
  });
  try {
    window.matchMedia("(display-mode: standalone)").addEventListener("change", updateInstallButton);
  } catch (e) { /* older Safari lacks addEventListener on MediaQueryList */ }

  /* ══════════ Events ══════════ */
  btnStart.addEventListener("click", start);
  btnStop.addEventListener("click", pause);
  btnNext.addEventListener("click", next);
  $("redo").addEventListener("click", redo);
  $("back").addEventListener("click", back);
  btnReset.addEventListener("click", reset);
  btnSound.addEventListener("click", toggleSound);
  btnPreroll.addEventListener("click", togglePreroll);
  $("dynToggle").addEventListener("click", toggleDyn);
  $("reportBtn").addEventListener("click", openReport);

  // Header
  $("modeFreeBtn").addEventListener("click", () => setMode("free"));
  $("modeProgBtn").addEventListener("click", () => setMode("prog"));
  progSelect.addEventListener("change", () => onSelectProgram(progSelect.value));
  $("manageBtn").addEventListener("click", openManage);
  $("logoBtn").addEventListener("click", openLogo);
  $("infoBtn").addEventListener("click", openAbout);
  $("fsBtn").addEventListener("click", toggleFS);
  $("langEn").addEventListener("click", () => setLang("en"));
  $("langIt").addEventListener("click", () => setLang("it"));
  $("restoreBtn").addEventListener("click", restoreBlocks);

  // Modals: close buttons and click on the backdrop
  [[aboutOverlay, closeAbout], [logoOverlay, closeLogo], [installOverlay, closeInstallInfo], [manageOverlay, closeManage], [editorOverlay, closeEditor], [reportOverlay, closeReport]]
    .forEach(([ov, close]) => ov.addEventListener("click", (e) => { if (e.target === ov) close(); }));
  $("aboutClose").addEventListener("click", closeAbout);
  $("installX").addEventListener("click", closeInstallInfo);
  $("installClose").addEventListener("click", closeInstallInfo);
  $("logoX").addEventListener("click", closeLogo);
  $("logoUpload").addEventListener("click", () => $("logoFile").click());
  $("logoRemove").addEventListener("click", removeLogo);
  $("manageX").addEventListener("click", closeManage);
  $("importBtn").addEventListener("click", importPrograms);
  $("exportBtn").addEventListener("click", exportPrograms);
  $("newProgBtn").addEventListener("click", () => openEditor(null));
  $("editorX").addEventListener("click", closeEditor);
  $("addRowBtn").addEventListener("click", () => { addBlockRow("", 0); recomputeEdTotal(); });
  $("edDelete").addEventListener("click", deleteCurrentProgram);
  $("edCancel").addEventListener("click", closeEditor);
  $("edSave").addEventListener("click", saveProgram);
  $("reportX").addEventListener("click", closeReport);
  $("reportCopy").addEventListener("click", copyReport);
  $("reportExport").addEventListener("click", exportReport);
  $("reportClose").addEventListener("click", closeReport);

  // Edit remaining time while paused
  document.querySelectorAll(".pe-btn").forEach((b) => b.addEventListener("click", () => pauseAdjust(+b.dataset.adj)));
  $("pauseIn").addEventListener("change", pauseSetFromField);
  $("pauseIn").addEventListener("keydown", (e) => { if (e.key === "Enter") { pauseSetFromField(); e.target.blur(); } });

  presets.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip"); if (!chip) return;
    // load the preset as a base; start stays manual
    reset(); elMin.value = chip.dataset.min; elSec.value = "0"; previewFree();
  });
  // Live preview while the operator edits the values
  elMin.addEventListener("input", previewFree);
  elSec.addEventListener("input", previewFree);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { closeAbout(); closeLogo(); closeInstallInfo(); closeManage(); closeEditor(); closeReport(); hidePreroll(); return; }
    const tag = e.target.tagName;
    if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") {
      if (e.key === "Enter" && (e.target.id === "minutes" || e.target.id === "seconds")) { e.target.blur(); start(); }
      return;
    }
    if (document.querySelector(".modal-overlay.show, .about-overlay.show")) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    switch (e.key) {
      case " ": case "Spacebar": e.preventDefault(); running ? pause() : start(); break;
      case "n": case "N": next(); break;
      case "r": case "R": reset(); break;
      case "f": case "F": toggleFS(); break;
      case "s": case "S": toggleSound(); break;
    }
  });

  /* ══════════ Clock ══════════ */
  function updateClock() {
    const n = new Date();
    $("hTime").textContent = pad(n.getHours()) + ":" + pad(n.getMinutes()) + ":" + pad(n.getSeconds());
    $("hDate").textContent = t("days")[n.getDay()] + " " + pad(n.getDate()) + " " + t("months")[n.getMonth()] + " " + n.getFullYear();
  }
  setInterval(updateClock, 1000);

  /* ══════════ Init ══════════ */
  btnSound.classList.toggle("off", !soundOn);
  btnSound.textContent = soundOn ? "🔊" : "🔇";
  btnPreroll.classList.toggle("on", prerollOn);
  $("dynToggle").classList.toggle("on", dynamicOn);
  try { const lr = JSON.parse(localStorage.getItem(RKEY) || "null"); if (lr && Array.isArray(lr.rows)) lastReport = lr; } catch (e) { /* ignore */ }
  programs = storeLoad();
  showLogo();
  applyLang();
  setButtons();
  updateInstallButton();

  // Offline support: cache the app shell on first visit
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js").catch(() => { /* offline support unavailable */ });
    });
  }

  return { version: VERSION };
})();
