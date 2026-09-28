/* G-Timer — service worker: caches the app shell so G-Timer keeps working
   without a network connection in the control room.
   © 2026 Graziano Melzi · OnAir Garage — MIT License

   Bump CACHE_VERSION whenever any file below changes; the old cache is
   dropped on activate. */
const CACHE_VERSION = "v2026.9.4";
const CACHE_NAME = "g-timer-" + CACHE_VERSION;

const PRECACHE_URLS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./css/g-timer.css",
  "./css/fonts.css",
  "./js/g-timer.js",
  "./js/i18n.js",
  "./icons/icon.svg",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./fonts/barlow-condensed-300-latin.woff2",
  "./fonts/barlow-condensed-300-latin-ext.woff2",
  "./fonts/barlow-condensed-400-latin.woff2",
  "./fonts/barlow-condensed-400-latin-ext.woff2",
  "./fonts/barlow-condensed-600-latin.woff2",
  "./fonts/barlow-condensed-600-latin-ext.woff2",
  "./fonts/barlow-condensed-700-latin.woff2",
  "./fonts/barlow-condensed-700-latin-ext.woff2",
  "./fonts/barlow-condensed-900-latin.woff2",
  "./fonts/barlow-condensed-900-latin-ext.woff2",
  "./fonts/rajdhani-500-latin.woff2",
  "./fonts/rajdhani-500-latin-ext.woff2",
  "./fonts/rajdhani-600-latin.woff2",
  "./fonts/rajdhani-600-latin-ext.woff2",
  "./fonts/rajdhani-700-latin.woff2",
  "./fonts/rajdhani-700-latin-ext.woff2",
  "./fonts/share-tech-mono-400-latin.woff2"
];

self.addEventListener("install", (event) => {
  // Does NOT call skipWaiting(): on an update, the new worker waits until
  // the page asks it to take over (see the "message" listener below), so
  // the app can show an "update available" banner first. On a first
  // install there is no active worker to wait for, so this has no effect.
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// The page sends this once the user confirms the "update available" banner.
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

// Cache-first: instant offline loads. Fetched files are also stored, so
// anything not in PRECACHE_URLS (e.g. a future asset) still gets cached
// after its first successful load.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return response;
      }).catch(() => cached);
    })
  );
});
