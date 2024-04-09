const CACHE_NAME = "my-pwa-cache-v1";
const urlsToCache = [
    "/",
    "/index.html",
    "index.js",
    "index.css",
    "vite.svg",
    "manifest.json",
    "images/homescreen144.png",
    "images/homescreen168.png",
    "images/homescreen48.png",
    "images/homescreen72.png",
    "images/homescreen96.png",
];

self.addEventListener("install", (event) => {
    event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache)));
});

self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => response || fetch(event.request))
    );
});

self.addEventListener("activate", function (event) {
    console.log("Service worker activated.");

    event.waitUntil(self.clients.claim());
});
