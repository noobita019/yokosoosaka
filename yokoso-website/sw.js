var CACHE = 'japangoodies-v3';
var DATA_CACHE = 'japangoodies-data-v3';

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      return cache.addAll([
        '.',
        'index.html',
        'css/style.css',
        'js/app.js',
        'manifest.json'
      ]);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE && k !== DATA_CACHE; })
          .map(function(k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  var url = new URL(e.request.url);

  // API calls — network first, cache fallback
  if (e.request.method === 'GET' && (url.pathname.includes('/orders/') || url.pathname.endsWith('/orders') || url.pathname.includes('/stocks/') || url.pathname.endsWith('/stocks') || url.pathname.includes('/cart/') || url.pathname.endsWith('/cart'))) {
    e.respondWith(
      fetch(e.request).then(function(resp) {
        var clone = resp.clone();
        caches.open(DATA_CACHE).then(function(c) { c.put(e.request, clone); });
        return resp;
      }).catch(function() {
        return caches.match(e.request);
      })
    );
    return;
  }

  // data files (products.json, categories.json) — network first
  if (e.request.method === 'GET' && url.pathname.endsWith('.json') && url.pathname.includes('/data/')) {
    e.respondWith(
      fetch(e.request).then(function(resp) {
        var clone = resp.clone();
        caches.open(DATA_CACHE).then(function(c) { c.put(e.request, clone); });
        return resp;
      }).catch(function() {
        return caches.match(e.request);
      })
    );
    return;
  }

  // Static assets — cache first
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      return cached || fetch(e.request).then(function(resp) {
        if (e.request.method === 'GET') {
          var clone = resp.clone();
          caches.open(CACHE).then(function(c) { c.put(e.request, clone); });
        }
        return resp;
      });
    })
  );
});
