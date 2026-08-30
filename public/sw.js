const CACHE_NAME = "aura-boutique-pwa-v1";
const STATIC_ASSETS = [
  "/",
  "/login",
  "/kasir",
  "/portal-admin",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

// Install Event: Cache Core App Shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn("PWA: Some static assets failed to cache during install", err);
      });
    })
  );
  self.skipWaiting();
});

// Activate Event: Cleanup Old Caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event: Network First with Cache Fallback for Pages & Assets
self.addEventListener("fetch", (event) => {
  // Ignore non-GET or chrome-extension requests
  if (event.request.method !== "GET" || !event.request.url.startsWith("http")) {
    return;
  }

  // Network First Strategy
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Only cache valid standard responses (not APIs)
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          !event.request.url.includes("/api/")
        ) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Fallback to cache if network is offline
        return caches.match(event.request);
      })
  );
});
