const CACHE_NAME = 'partituras-app-v7';
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
    self.skipWaiting(); // Fuerza a tomar el control inmediatamente
});

// Activación: Elimina cachés antiguos y toma el control
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache); // Borra cachés viejos
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
                    // Si no hay red (offline), entregamos la copia guardada en caché
                    return caches.match(event.request);
                })
        );
    } else {
        // Para imágenes o librerías externas, usar caché primero para mayor velocidad
        event.respondWith(
            caches.match(event.request).then((cachedResponse) => {
                return cachedResponse || fetch(event.request);
            })
        );
    }
});
