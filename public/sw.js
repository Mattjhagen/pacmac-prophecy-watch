self.addEventListener('install', e => {
  e.waitUntil(caches.open('pm-cache-v1').then(cache => cache.addAll([
    '/', '/index.html', '/styles.css', '/app.js', '/manifest.json'
  ])));
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(resp => resp || fetch(e.request))
  );
});

// Optional: auto-refresh via periodic sync (Chrome only)
self.addEventListener('periodicsync', e => {
  if (e.tag === 'refresh-news') {
    e.waitUntil(fetch('/api/news').then(() => self.registration.showNotification('News updated!')));
  }
});
