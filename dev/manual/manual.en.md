# G-Timer manual

G-Timer is a **block-based recording timer for radio**. You build your programs as a list of timed blocks, record them with a 3·2·1 pre-roll, see overruns as they happen and export a report when you are done. It is a free web app (PWA) from OnAir Garage that works offline after the first visit.

## Open and install

Open G-Timer at `https://onairgarage.com/apps/g-timer/` (the tool page is `https://onairgarage.com/tools/g-timer/`). Nothing is installed to use it, and it keeps working in the control room without a network connection after the first visit. You can also install it as an app:

- **Chrome, Edge and Android**: press the *Install app* button (it appears when the browser supports it).
- **iPhone and iPad (Safari)**: tap the Share icon, then choose "Add to Home Screen".

The app always opens in English. Change the language from the header (English, Italiano, Español): the choice is remembered on the device.

## The two modes

At the top you choose the mode:

- **Free**: a quick countdown with presets (1, 2, 3, 5, 10, 15 minutes) or any mm:ss value you type in the MIN and SEC fields.
- **Program**: a program made of blocks, each with its own planned duration. Choose a saved program from the list; the *Blocks* panel on the side shows all its blocks.

## Recording

1. Press **▶ Start**. With the **Pre-roll 3·2·1** option on (the default), three one-second steps count down before the take starts, with optional beeps (*Sound*, key `S`).
2. While you record, the display shows the time left. It turns **yellow in the last minute** and **red in the last 10 seconds**; below zero it blinks red and counts the **overrun** (OVERRUN).
3. **⏸ Pause** stops the clock. While paused you can correct the remaining time (±10 s, ±60 s, or type a value as `mm:ss`; a bare number is minutes).
4. **⏭ End block** closes the block and moves to the next one. **↻ Redo** records the same block again; **◀ Back** goes to the previous block; **↺ Reset** clears the current take.
5. At the end of the last block the display says END OF PROGRAM and the report opens.

Keys: SPACE starts and pauses, `N` ends the block, `R` resets, `F` full screen, `S` sound.

- **Dynamic timing (DYN)**: with *DYN* on, the drift of each block carries over to the next one, so the program still ends on time: the target of block *i* is its planned time minus the sum of (actual − planned) of the blocks before it. The panel marks recalculated targets.
- **Several takes**: record a block in several takes; the takes add up.
- **Non-linear recording**: click any block in the side panel to jump to it. *↺ Restore* in the panel brings back the saved durations.

## Programs and logo

*Manage programs* opens the list of your programs: **+ New** to create one, and for each program *Load*, *Edit*, *Duplicate* and *Delete*. Programs can be imported (**⤓ Import**) and exported (**⤒ Export**) as JSON files. In the editor you give the program a name, add blocks (**+ Add block**) with a label and a planned time, and press **💾 Save**. A program file keeps only programs with a name and at least one block longer than 0 seconds.

*Station logo* (header) uploads your logo (PNG, JPG or SVG); it is kept only in your browser.

## The report

At the end of a program, or with **📋 Report**, the recording report lists for each block the **planned** time, the **actual** time and the **difference**, then the total planned, the total recorded and the **final drift** (the sum of actual − planned over all the blocks). **⧉ Copy** puts it on the clipboard and **⤒ Export .txt** saves it as a text file.

## Privacy

All data stays in your browser: programs, logo and settings are not sent anywhere. The *About* window shows the version, the licence and a small tip card with the jar of the site and a button that opens the support page of onairgarage.com in your language in a new tab; it is the only place, and nothing is asked inside the app.

## Updates

When a new version is ready, a banner says "A new version of G-Timer is ready." with *⟳ Reload*. Ignoring it just keeps the current version running.

## Limits

- The display resolution is one second. Some browsers do not count the time a computer spends asleep.
- **Keep the tab visible and the computer awake** during a recording: browsers may slow the display in hidden tabs (the elapsed time is still computed from the clock when the tab comes back).
- G-Timer is not a certified instrument; it measures with the browser's own clock.

## Troubleshooting

| Problem | What to do |
|---|---|
| The *Install app* button is not there | The browser may not offer it: on iPhone and iPad use Share → Add to Home Screen. |
| The logo cannot be saved | The browser storage is full or disabled: free some space or enable it for this site. |
| A program file is not accepted | It must be a JSON file exported by G-Timer, with a name and at least one block longer than 0 seconds. |
| The clock looks slow in a background tab | Bring the tab to the front: the time shown catches up from the clock. |

## Contacts

Graziano Melzi · OnAir Garage — `https://onairgarage.com` — `hello@onairgarage.com`. Tool page: `https://onairgarage.com/tools/g-timer/`. Source code and releases: `https://github.com/djgragra/g-timer`. Licence: MIT © 2026 Graziano Melzi.
