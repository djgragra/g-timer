/* G-Timer — translations (EN default, IT)
   © 2026 Graziano Melzi · OnAir Garage — MIT License */
window.GTimerI18n = (function () {
  "use strict";

  const LKEY = "com.onairgarage.gtimer.lang";

  const DICT = {
    en: {
      "mode.free": "Free",
      "mode.prog": "Program",
      "hdr.manage": "Manage programs",
      "hdr.logo": "Station logo",
      "hdr.info": "About",
      "hdr.fs": "Fullscreen (F)",
      "in.min": "MIN",
      "in.sec": "SEC",
      "in.minutes": "Minutes",
      "in.seconds": "Seconds",
      "pause.edit": "Paused — adjust remaining",
      "btn.start": "▶ Start",
      "btn.pause": "⏸ Pause",
      "btn.next": "⏭ End block",
      "btn.redo": "↻ Redo",
      "btn.back": "◀ Back",
      "btn.reset": "↺ Reset",
      "btn.close": "Close",
      "btn.cancel": "Cancel",
      "opt.sound": "Sound (S)",
      "opt.preroll": "Pre-roll 3·2·1",
      "opt.dyn": "DYN",
      "opt.dynTitle": "Dynamic timing (recalculate blocks)",
      "opt.report": "📋 Report",
      "opt.reportTitle": "Reopen last report",
      "hint": "SPACE start/pause · N end block · R reset · F fullscreen",
      "bp.title": "Blocks",
      "bp.restore": "↺ Restore",
      "bp.restoreTitle": "Restore saved durations",
      "about.desc": "Studio timer for block-based radio recordings: saved programs, per-block durations, pre-roll and overrun tracking.",
      "about.dev": "Developed by",
      "about.web": "Website",
      "about.license": "License",
      "about.privacy": "Privacy",
      "about.privacyText": "All data stays in your browser",
      "about.version": "Version",
      "logo.title": "Station logo",
      "logo.note": "Upload your station logo (PNG, JPG or SVG). It is resized to max 512 px and stored only in this browser.",
      "logo.none": "No logo",
      "logo.remove": "Remove",
      "logo.upload": "⤓ Upload logo",
      "logo.errType": "Unsupported file: use PNG, JPG or SVG.",
      "logo.errRead": "Could not read the image.",
      "logo.errSave": "Could not save the logo (browser storage full or disabled).",
      "manage.title": "Manage programs",
      "manage.import": "⤓ Import",
      "manage.export": "⤒ Export",
      "manage.new": "+ New",
      "manage.empty": "No saved programs.<br>Press “+ New” to create one.",
      "manage.load": "Load",
      "manage.edit": "Edit",
      "manage.dup": "Duplicate",
      "manage.del": "Delete",
      "manage.blocks": "{n} blocks",
      "manage.copy": "(copy)",
      "manage.confirmDel": "Delete program “{name}”?",
      "manage.badFile": "Invalid file.",
      "manage.none": "— no programs —",
      "ed.new": "New program",
      "ed.edit": "Edit program",
      "ed.name": "Program name",
      "ed.namePh": "e.g. Morning Show",
      "ed.add": "+ Add block",
      "ed.delete": "Delete",
      "ed.save": "💾 Save",
      "ed.remove": "Remove",
      "block": "Block",
      "block.pos": "Block {i} / {n}",
      "total": "Total",
      "recorded": "Recorded",
      "elapsed": "Elapsed {e} / Target {t}",
      "st.ready": "READY",
      "st.noProg": "NO PROGRAM",
      "st.over": "OVERRUN",
      "st.closing": "CLOSING",
      "st.warn": "WARNING",
      "st.rec": "REC",
      "st.pause": "PAUSED",
      "st.end": "END",
      "st.endProg": "END OF PROGRAM",
      "br.rec": "rec",
      "br.rem": "rem",
      "br.recalc": "recalc target",
      "rep.title": "Recording report",
      "rep.copied": "Report copied ✓",
      "rep.copy": "⧉ Copy",
      "rep.export": "⤒ Export .txt",
      "rep.recording": "Recording",
      "rep.planned": "Planned",
      "rep.actual": "Actual",
      "rep.diff": "Diff",
      "rep.totPlanned": "Total planned",
      "rep.totActual": "Total recorded",
      "rep.drift": "Final drift",
      "rep.header": "RECORDING REPORT",
      "rep.file": "report",
      "prog.file": "g-timer-programs",
      "days": ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"],
      "months": ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]
    },
    it: {
      "mode.free": "Libero",
      "mode.prog": "Programma",
      "hdr.manage": "Gestisci programmi",
      "hdr.logo": "Logo della radio",
      "hdr.info": "Informazioni",
      "hdr.fs": "Schermo intero (F)",
      "in.min": "MIN",
      "in.sec": "SEC",
      "in.minutes": "Minuti",
      "in.seconds": "Secondi",
      "pause.edit": "Pausa — correggi residuo",
      "btn.start": "▶ Start",
      "btn.pause": "⏸ Pausa",
      "btn.next": "⏭ Fine blocco",
      "btn.redo": "↻ Rifai",
      "btn.back": "◀ Indietro",
      "btn.reset": "↺ Reset",
      "btn.close": "Chiudi",
      "btn.cancel": "Annulla",
      "opt.sound": "Suono (S)",
      "opt.preroll": "Pre-roll 3·2·1",
      "opt.dyn": "DIN",
      "opt.dynTitle": "Conteggio dinamico (ricalcolo blocchi)",
      "opt.report": "📋 Report",
      "opt.reportTitle": "Riapri ultimo report",
      "hint": "SPAZIO start/pausa · N fine blocco · R reset · F schermo intero",
      "bp.title": "Blocchi",
      "bp.restore": "↺ Ripristina",
      "bp.restoreTitle": "Ripristina durate salvate",
      "about.desc": "Timer di regia per registrazioni radiofoniche a blocchi: programmi memorizzati, durate per blocco, pre-roll e misura dello sforamento.",
      "about.dev": "Sviluppato da",
      "about.web": "Sito",
      "about.license": "Licenza",
      "about.privacy": "Privacy",
      "about.privacyText": "I dati restano nel tuo browser",
      "about.version": "Versione",
      "logo.title": "Logo della radio",
      "logo.note": "Carica il logo della tua radio (PNG, JPG o SVG). Viene ridimensionato a max 512 px e salvato solo in questo browser.",
      "logo.none": "Nessun logo",
      "logo.remove": "Rimuovi",
      "logo.upload": "⤓ Carica logo",
      "logo.errType": "File non supportato: usa PNG, JPG o SVG.",
      "logo.errRead": "Impossibile leggere l'immagine.",
      "logo.errSave": "Impossibile salvare il logo (memoria del browser piena o disattivata).",
      "manage.title": "Gestione programmi",
      "manage.import": "⤓ Importa",
      "manage.export": "⤒ Esporta",
      "manage.new": "+ Nuovo",
      "manage.empty": "Nessun programma salvato.<br>Premi “+ Nuovo” per crearne uno.",
      "manage.load": "Carica",
      "manage.edit": "Modifica",
      "manage.dup": "Duplica",
      "manage.del": "Elimina",
      "manage.blocks": "{n} blocchi",
      "manage.copy": "(copia)",
      "manage.confirmDel": "Eliminare il programma “{name}”?",
      "manage.badFile": "File non valido.",
      "manage.none": "— nessun programma —",
      "ed.new": "Nuovo programma",
      "ed.edit": "Modifica programma",
      "ed.name": "Nome programma",
      "ed.namePh": "es. Morning Show",
      "ed.add": "+ Aggiungi blocco",
      "ed.delete": "Elimina",
      "ed.save": "💾 Salva",
      "ed.remove": "Rimuovi",
      "block": "Blocco",
      "block.pos": "Blocco {i} / {n}",
      "total": "Totale",
      "recorded": "Registrato",
      "elapsed": "Trascorso {e} / Target {t}",
      "st.ready": "PRONTO",
      "st.noProg": "NESSUN PROGRAMMA",
      "st.over": "SFORAMENTO",
      "st.closing": "CHIUSURA",
      "st.warn": "ATTENZIONE",
      "st.rec": "REGISTRA",
      "st.pause": "PAUSA",
      "st.end": "FINE",
      "st.endProg": "FINE PROGRAMMA",
      "br.rec": "reg",
      "br.rem": "rim",
      "br.recalc": "target ricalc",
      "rep.title": "Report registrazione",
      "rep.copied": "Report copiato ✓",
      "rep.copy": "⧉ Copia",
      "rep.export": "⤒ Esporta .txt",
      "rep.recording": "Registrazione",
      "rep.planned": "Pianif.",
      "rep.actual": "Effettivo",
      "rep.diff": "Scarto",
      "rep.totPlanned": "Totale pianificato",
      "rep.totActual": "Totale registrato",
      "rep.drift": "Scarto finale",
      "rep.header": "REPORT REGISTRAZIONE",
      "rep.file": "report",
      "prog.file": "g-timer-programmi",
      "days": ["DOM", "LUN", "MAR", "MER", "GIO", "VEN", "SAB"],
      "months": ["GEN", "FEB", "MAR", "APR", "MAG", "GIU", "LUG", "AGO", "SET", "OTT", "NOV", "DIC"]
    }
  };

  function detect() {
    try {
      const saved = localStorage.getItem(LKEY);
      if (saved && DICT[saved]) return saved;
    } catch (e) { /* storage unavailable */ }
    const langs = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || "en"];
    for (const l of langs) {
      const code = String(l).slice(0, 2).toLowerCase();
      if (DICT[code]) return code;
    }
    return "en";
  }

  let lang = detect();

  function t(key, vars) {
    let s = (DICT[lang] && DICT[lang][key]);
    if (s === undefined) s = DICT.en[key];
    if (s === undefined) return key;
    if (vars && typeof s === "string") s = s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
    return s;
  }

  function apply(root) {
    root = root || document;
    document.documentElement.lang = lang;
    root.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
    root.querySelectorAll("[data-i18n-title]").forEach((el) => { el.title = t(el.dataset.i18nTitle); });
    root.querySelectorAll("[data-i18n-placeholder]").forEach((el) => { el.placeholder = t(el.dataset.i18nPlaceholder); });
    root.querySelectorAll("[data-i18n-aria]").forEach((el) => { el.setAttribute("aria-label", t(el.dataset.i18nAria)); });
  }

  function setLang(l) {
    if (!DICT[l]) return;
    lang = l;
    try { localStorage.setItem(LKEY, l); } catch (e) { /* storage unavailable */ }
    apply();
  }

  return { t, apply, setLang, get lang() { return lang; }, locale: () => (lang === "it" ? "it-IT" : "en-GB") };
})();
