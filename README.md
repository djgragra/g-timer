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
- **English and Italian**: the language follows the browser, and you can switch it from the header.
- **Installable** as a web app (manifest included).

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
css/
js/
fonts/
icons/
```

To try it locally, serve the folder with any static server, for example:

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000/>.

The page has no inline scripts or styles, so it works with a strict Content Security Policy. A `<meta>` CSP is included. If you control the server, you can also send it as an HTTP header:

```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; manifest-src 'self'; object-src 'none'; base-uri 'self'; form-action 'none'; frame-ancestors 'self'
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
css/g-timer.css       styles
css/fonts.css         @font-face rules for the local fonts
js/i18n.js            English and Italian strings
js/g-timer.js         timer logic
fonts/                Barlow Condensed, Rajdhani, Share Tech Mono (woff2) + OFL licenses
icons/                app icons
```

## Credits and license

© 2026 Graziano Melzi · OnAir Garage. Released under the [MIT License](LICENSE).
Contact: [hello@onairgarage.com](mailto:hello@onairgarage.com) · <https://onairgarage.com>

Fonts: [Barlow Condensed](https://github.com/jpt/barlow), [Rajdhani](https://fonts.google.com/specimen/Rajdhani) (Indian Type Foundry) and [Share Tech Mono](https://fonts.google.com/specimen/Share+Tech+Mono) (Carrois Type Design). All three are licensed under the SIL Open Font License 1.1; the license files are in [`fonts/`](fonts/).

---

## In italiano

**G-Timer** è un timer di regia per registrazioni radiofoniche a blocchi. Lo pubblica gratuitamente [OnAir Garage](https://onairgarage.com/tools/g-timer/).

- Crei programmi divisi in blocchi, ciascuno con la sua durata. Registri con pre-roll 3·2·1 e vedi subito gli sforamenti.
- Il **conteggio dinamico (DIN)** riporta lo scarto di ogni blocco sui blocchi successivi.
- Puoi registrare ogni blocco in più take e saltare da un blocco all'altro senza seguire l'ordine.
- Alla fine ottieni un **report** da copiare o esportare in `.txt`.
- Puoi caricare il logo della tua radio e importare o esportare i programmi in JSON.
- Tutti i dati restano nel tuo browser: niente server, niente account, niente tracciamento.

Per ospitarlo sul tuo server basta copiare i file statici elencati sopra in una cartella qualsiasi. Licenza MIT, © 2026 Graziano Melzi.
