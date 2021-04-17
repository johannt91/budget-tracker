const CACHE_NAME = 'my-site-cache-v1';
const DATA_CACHE_NAME = 'data-cache-v1';

const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/css/styles.css",
  "/js/index.js",
  "/manifest.json",
]

self.addEventListener('install', function (evt) {
  evt.waitUntil(
      caches.open(CACHE_NAME).then(cache => {
          console.log('Your files were pre-cached successfully');
          return cache.addAll(FILES_TO_CACHE);
      })
  );

  self.skipWaiting();
})

self.addEventListener('activate', function (evt) {
  evt.waitUntil(
      caches.keys().then(keyList => {
          return Promise.all(
              keyList.map(key => {
                  if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
                      console.log('Removing old cache data', key);
                      return caches.delete(key);
                  }
              })
          );
      })
  );

  self.clients.claim();
});

self.addEventListener('fetch', function (e) {
  console.log('fetch request : ' + e.request.url)
  e.respondWith(
      caches.match(e.request).then(function (request) {
          if (request) {
              console.log('responding with cache : ' + e.request.url)
              return request
          } else {
              console.log('file is not cached, fetching : ' + e.request.url)
              return fetch(e.request)
          }
      })
  )
})