const CACHE_NAME = 'snake-v1';
const ASSETS = [
  './',
  './snake.html',
  './manifest.json',
  'https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap',
];

// Install: кэшируем все файлы
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate: удаляем старые кэши
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: сначала кэш, потом сеть (offline-first)
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(response => {
        // Кэшируем новые успешные GET-запросы
        if (e.request.method === 'GET' && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return response;
      }).catch(() => {
        // Если офлайн и не закэшировано — возвращаем главную страницу
        if (e.request.destination === 'document') {
          return caches.match('./snake.html');
        }
      });
    })
  );
});
