const CACHE_NAME = 'partituras-app-v5';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './logo.png'
];

// Instalación: Guarda los archivos iniciales
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activación: Elimina cachés antiguas y toma el control inmediatamente
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Estrategia Network-First para HTML (Siempre busca la versión más reciente online)
self.addEventListener('fetch', (event) => {
  // Si la petición es para la página principal o HTML
  if (event.request.mode === 'navigate' || event.request.headers.get('accept').includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          // Si hay red, actualizamos la caché con el nuevo HTML y lo mostramos
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(() => {
          // Si no hay red (offline), entrega la versión guardada en caché
          return caches.match(event.request);
        })
    );
  }
});
