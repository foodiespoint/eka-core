const CACHE_NAME = 'eka-core-v5';

// Install event - caches initial app frame and skips waiting immediately
self.addEventListener('install', (e) => {
    self.skipWaiting();
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(['./', './index.html']);
        })
    );
});

// Activate event - purges old caches (v1, v2, v3, v4)
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch event - network-first approach to always pull fresh updates from GitHub
self.addEventListener('fetch', (e) => {
    e.respondWith(
        fetch(e.request)
            .then((response) => {
                const responseClone = response.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(e.request, responseClone));
                return response;
            })
            .catch(() => caches.match(e.request))
    );
});
