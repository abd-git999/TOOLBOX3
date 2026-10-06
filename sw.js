const CACHE_NAME = "toolbox-v1";

const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./calculator.html",
  "./calculator.css",
  "./calculator.js",
  "./weather.html",
  "./weather.js",
  "./earthMap.html",
  "./earthMap.js",
  "./styles.css",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});