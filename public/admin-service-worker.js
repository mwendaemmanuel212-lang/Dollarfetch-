self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Never store private admin or member information offline.
self.addEventListener("fetch", () => {
  // Requests go directly to the network.
});
