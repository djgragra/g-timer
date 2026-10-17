# G-Timer

**Block-based recording timer for radio.** Build your programs as a list of timed blocks, record them with a 3·2·1 pre-roll, see overruns as they happen and export a report when you are done.

G-Timer is a free tool from [OnAir Garage](https://onairgarage.com/tools/g-timer/) by Graziano Melzi.

- **Use it online:** <https://onairgarage.com/apps/g-timer/>
- **Tool page:** <https://onairgarage.com/tools/g-timer/>

## Features

- **Free mode**: a quick countdown with presets (1, 2, 3, 5, 10, 15 min) or any mm:ss value.
- **Program mode**: programs made of blocks, each with its own planned duration.
- **Pre-roll 3·2·1** before each take (can be turned off), with optional beeps.
- **Overrun tracking**: the display turns yellow in the last minute and red in the last 10 seconds, then counts the overrun.
- **Dynamic timing (DYN)**: the drift of each block carries over to the next one, so the program still ends on time.
- **Multi-take**: record a block in several takes; the takes add up.
- **Non-linear recording**: click any block in the side panel to jump to it.
- **Pause and adjust**: while paused you can correct the remaining time (±10 s, ±60 s or type a value).
- **Final report**: planned vs. actual time for each block, with the final drift. You can copy it or export it as `.txt`.
- **Your programs, your logo**: create, edit, duplicate, import and export programs as JSON, and upload your station logo (PNG, JPG or SVG).
- **English, Italian and Spanish**: the app always opens in English; switch the language from the header and your choice is remembered on the device.
- **A small tip card** in the About window (the OnAir Garage tip jar, one line and a button that opens the tip page of the site in your language in a new tab). It is the only place; there are no pop-ups, reminders or counters.
- **Installable and offline-capable**: install it as an app from the browser (an “Install app” button appears when supported; on iPhone/iPad, use Share → Add to Home Screen). A service worker caches the whole app on first visit, so it keeps working in the control room without a network connection. When a new version is ready, a banner offers to reload; ignoring it just keeps the current version running.

### Formulas and sources

G-Timer contains no external technical values (no standards, no reference tables), so there are no outside sources to cite. Every rule below is the app's own; the column "Status" says what backs it.

| Value or rule | Source | Status |
|---|---|---|
| Elapsed time = `performance.now()` now minus `performance.now()` at the start of the take, read on every animation frame | own design (a monotonic clock does not follow changes of the system clock) | observed (browser checks); the clock itself is not compared with a reference |
| Pauses store the elapsed time and resume from it | own design | covered by browser checks, not by the unit tests |
| Remaining time ≤ 60 s turns the display yellow, ≤ 10 s red, below zero it blinks red and counts the overrun | own design (`paint()` in `js/g-timer.js`) | observed (browser checks) |
| Pre-roll 3·2·1: three one-second steps, then the take starts | own design | observed (browser checks) |
| Time typed as `mm:ss`; a bare number is minutes; seconds are capped at 59; a minus sign gives a negative correction | own rule | tested (`dev/gtimer.test.js`) |
| Dynamic timing (DYN): target of block *i* = planned time − Σ (actual − planned) of the blocks before it | own rule | tested (`dev/gtimer.test.js`) |
| Several takes of one block add up | own rule | tested (`dev/gtimer.test.js`) |
| Report: difference = actual − planned; final drift = Σ (actual − planned) over all blocks | own rule | observed (browser checks) |
| Program files: only programs with an id, a name and at least one block longer than 0 s are kept; names cut at 60 and labels at 80 characters; seconds rounded | own rule | tested (`dev/gtimer.test.js`) |

- **Limits**: the display resolution is one second. Some browsers do not count the time a computer spends asleep in the monotonic clock.
- **Keep the tab visible and the computer awake** during a recording: browsers may slow animation frames in hidden tabs (the elapsed time is still computed from the clock when the tab comes back).
- Wall-clock time is used only for dates (programs, report header).

### Validation and references

| Reference | What it validates | Result | How to re-run |
|---|---|---|---|
| `dev/gtimer.test.js` | time parsing and formatting, dynamic timing, takes, program-file cleaning, escaping of labels (the shipped functions are cut out of `js/g-timer.js` and run as they are) | 9 tests pass | `node --test dev/*.test.js` |
| `dev/i18n.test.js` | the three languages have the same keys, the same placeholders and no empty string; every key used by the page and by the code exists; the app opens in English whatever the browser language; only a chosen language is remembered | 7 tests pass | `node --test dev/*.test.js` |
| `dev/tip.test.js` | the tip card: texts in the three languages, link to the site's support page per language, new tab, the jar is a second link out of keyboard order, image cached offline | 5 tests pass | `node --test dev/*.test.js` |
| `dev/release.test.js` | version and cache name agree, every cached and linked file exists, manifest screenshots have the declared size, strict CSP without inline code, the service worker never skips waiting by itself | 8 tests pass | `node --test dev/*.test.js` |
| Browser check, 2026.10.1 (Chromium under Playwright, 375, 360 and 667×375 px, touch emulation) | every control is at least 44 × 44 px on a touch screen, no horizontal scroll, no console error, opens in English with the browser in Italian, works offline, desktop layout identical to the previous version | passed | not part of the repository |

### Not validated

- The accuracy of the timing against a reference clock, and long recordings (hours).
- Behaviour after the computer sleeps, in a hidden tab, or in a browser that throttles animation frames.
- Touch targets and layout on real phones and tablets (Safari on iOS, Chrome on Android): measured only in emulation.
- Safari and Firefox rendering of the new tip card and of the touch sizes; screen-reader reading of the About window.
- The beeps on every browser and under every autoplay policy.
- The update banner and the offline update on real devices.
- The minimum browser versions below are estimated from the web features used.

### Sources to re-check

None: the app has no external technical values. Re-check the estimated minimum browser versions when a web feature is added.

### Keyboard shortcuts

| Key | Action |
|---|---|
| Space | Start / pause |
| N | End block |
| R | Reset |
| F | Fullscreen |
| S | Sound on/off |
| Esc | Close dialogs |

## Privacy

G-Timer is a static web app with no server side, no accounts, no analytics and no third-party requests. Fonts are self-hosted. Your programs, your logo, the last report and the language choice are saved in your browser's `localStorage` only, under keys starting with `com.onairgarage.gtimer.`. Clearing the site data removes them, so export your programs if you want a backup.

## Self-hosting

G-Timer is plain HTML, CSS and JavaScript. It has no build step and no dependencies. Copy these files to any static web server, in any folder (all paths are relative):

```
index.html
manifest.webmanifest
sw.js
css/
js/
fonts/
icons/
img/
screenshots/
```

To try it locally, serve the folder with any static server, for example:

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000/>.

Tests: `node --test dev/*.test.js` (no install step, Node 22; they run on every pull request and every push to `main`). The app is also checked by hand in the browser at 375 px, 768 px and desktop widths.

The page has no inline scripts or styles, so it works with a strict Content Security Policy. A `<meta>` CSP is included. If you control the server, you can also send it as an HTTP header:

```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; manifest-src 'self'; object-src 'none'; base-uri 'self'; form-action 'none'; frame-ancestors 'self'
```

### Program file format

Programs are exported as a JSON array:

```json
[
  {
    "id": "sample-news",
    "name": "Sample · 5' news bulletin",
    "blocks": [
      { "label": "Headlines", "sec": 30 },
      { "label": "Stories", "sec": 210 }
    ]
  }
]
```

On import, programs with the same `id` are replaced and new ones are added.

## Browser support

G-Timer runs in current versions of Chrome, Edge, Firefox and Safari, on desktop and mobile.
Estimated minimum versions, based on the web features used (not tested on each one): Chrome/Edge 87, Firefox 78, Safari 14.1 (macOS and iOS).

## Project structure

```
index.html            app page
manifest.webmanifest  web app manifest (id: com.onairgarage.gtimer)
sw.js                 service worker: caches the app for offline use
css/g-timer.css       styles
css/fonts.css         @font-face rules for the local fonts
js/i18n.js            English, Italian and Spanish strings
js/g-timer.js         timer logic
fonts/                Barlow Condensed, Rajdhani, Share Tech Mono (woff2) + OFL licenses
icons/                app icons, including the maskable one for Android
img/                  the tip jar picture of the About window
screenshots/          manifest screenshots (desktop and mobile)
dev/                  tests (`node --test dev/*.test.js`); not part of the app that is published
.github/workflows/    ci.yml (tests on every pull request) and release.yml (tag and release by hand, see below)
```

Keep `VERSION` in `js/g-timer.js` and `CACHE_VERSION` in `sw.js` on the same number (a test checks it), and bump both whenever you change any cached file, so returning visitors get the update instead of a stale offline copy. The new version installs in the background and the app shows an in-page banner offering to reload; it does not reload on its own, so an ongoing recording is never interrupted.

## Releasing

Versions are `YYYY.M.N` (for example `2026.10.1`); the tag is `v` plus the version. On the Actions tab, run **Release** on `main` with the version: it checks that the version is the one in `js/g-timer.js`, that it is higher than the latest tag and that the tag does not exist yet, runs the tests, and then creates the tag and the release. Nothing is built: the app is the files themselves.

## Credits and license

© 2026 Graziano Melzi · OnAir Garage. Released under the [MIT License](LICENSE).
Contact: [hello@onairgarage.com](mailto:hello@onairgarage.com) · <https://onairgarage.com>

Fonts: [Barlow Condensed](https://github.com/jpt/barlow), [Rajdhani](https://fonts.google.com/specimen/Rajdhani) (Indian Type Foundry) and [Share Tech Mono](https://fonts.google.com/specimen/Share+Tech+Mono) (Carrois Type Design). All three are licensed under the SIL Open Font License 1.1; the license files are in [`fonts/`](fonts/).
