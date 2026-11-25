// Rondín service worker: makes the app installable and shows a page when there is no signal.
// Privacy (LOPDP): pages and API responses contain personal data, so they are NEVER cached.
// Only the offline page, the icons and the build's static files (JS/CSS/fonts) are stored.

const CACHE = "rondin-v1";
const PRECACHE = ["/offline", "/pwa-icon/192", "/pwa-icon/512"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  // Pages: always from the network; without signal, the offline page.
  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => caches.match("/offline")));
    return;
  }

  // Static build files never change (their names include a hash): cache first.
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
            return response;
          }),
      ),
    );
  }
  // Everything else (data, photos, API) goes straight to the network.
});
