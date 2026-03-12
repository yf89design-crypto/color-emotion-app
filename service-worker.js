// Service Worker for 彩绘心灵 PWA
const CACHE_NAME = 'color-emotion-app-v14';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './particle-splash.js',
  './robot-service.js',
  './shape-course.js',
  './painting-blue.png',
  './painting-green.png',
  './painting-pink.png',
  './painting-purple.png',
  './painting-red.png',
  './painting-yellow.png',
  './robot-avatar.png',
  './scene-bg.png',
  './manifest.json'
];

// Install event: cache all static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching app assets');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  // Activate immediately
  self.skipWaiting();
});

// Activate event: clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  // Take control of all pages immediately
  self.clients.claim();
});

// Fetch event: serve from cache first, fall back to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip external requests (Google Fonts, etc.)
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  const url = event.request.url;
  const isCodeFile = url.endsWith('.html') || url.endsWith('.css') || url.endsWith('.js') || url.endsWith('/');

  if (isCodeFile) {
    // Network-first for HTML/CSS/JS — always get fresh code
    event.respondWith(
      fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Offline: fall back to cache
        return caches.match(event.request).then((cachedResponse) => {
          return cachedResponse || (event.request.destination === 'document' ? caches.match('/index.html') : undefined);
        });
      })
    );
  } else {
    // Cache-first for images and other assets (performance)
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        });
      }).catch(() => {
        return undefined;
      })
    );
  }
});
