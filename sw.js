const CACHE_NAME = 'home-items-v5-offline';
const urlsToCache = [
  './', // 缓存当前目录
  './index.html',
  './manifest.json',
  // 关键：必须缓存外部依赖库，否则断网无法使用图表和扫码
  'https://cdn.jsdelivr.net/npm/chart.js',
  'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js'
];

// 1. 安装 SW 并缓存所有资源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting(); // 强制立即生效
});

// 2. 拦截网络请求：优先使用本地缓存，没有才去联网
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // 如果缓存中有，直接返回缓存（离线模式）
        if (response) {
          return response;
        }
        // 如果缓存没有，去网络请求
        return fetch(event.request);
      })
  );
});

// 3. 清理旧缓存
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});