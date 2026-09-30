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
- **Installable and offline-capable**: install it as an app from the browser (an “Install app” button appears when supported; on iPhone/iPad, use Share → Add to Home Screen). A service worker caches the whole app on first visit, so it keeps working in the control room without a network connection. When a new version is ready, a banner offers to reload; ignoring it just keeps the current version running.

### Timing, sources and validation

G-Timer contains no external technical values (no standards or reference tables), so there are no sources to cite.

- **How time is measured**: the elapsed time is the difference between a monotonic clock (`performance.now()`) now and at the moment the take started, read on every animation frame, so it does not accumulate drift from timers running late and is not affected by a change of the system clock (manual, or a network time correction) during a take. Pauses store the elapsed time and resume from it. Wall-clock time is used only for dates (programs, report header).
- **Limits**: the display resolution is one second. The timing has not been compared with a reference clock. Some browsers do not count the time a computer spends asleep in the monotonic clock.
- **Keep the tab visible and the computer awake** during a recording: browsers may slow animation frames in hidden tabs (the elapsed time is still computed from the clock when the tab comes back).

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
screenshots/
```

To try it locally, serve the folder with any static server, for example:

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000/>.

Tests: none (the timer has no calculation tables); the app is checked in the browser at 375 px, 768 px and desktop widths.

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
screenshots/          manifest screenshots (desktop and mobile)
```

Bump `CACHE_VERSION` at the top of `sw.js` whenever you change any cached file, so returning visitors get the update instead of a stale offline copy. The new version installs in the background and the app shows an in-page banner offering to reload; it does not reload on its own, so an ongoing recording is never interrupted.

## Credits and license

© 2026 Graziano Melzi · OnAir Garage. Released under the [MIT License](LICENSE).
Contact: [hello@onairgarage.com](mailto:hello@onairgarage.com) · <https://onairgarage.com>

Fonts: [Barlow Condensed](https://github.com/jpt/barlow), [Rajdhani](https://fonts.google.com/specimen/Rajdhani) (Indian Type Foundry) and [Share Tech Mono](https://fonts.google.com/specimen/Share+Tech+Mono) (Carrois Type Design). All three are licensed under the SIL Open Font License 1.1; the license files are in [`fonts/`](fonts/).
