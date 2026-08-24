/* Pregnancy Dashboard service worker — caches only the app's own files (offline shell).
   It never touches cross-origin requests, so encrypted sync traffic
   always goes straight to the network, untouched. */
const CACHE = 'preg-dash-v9';
const ASSETS = [
  './',
  './index.html',
  './app-core.js',
  './sync-config.js',
  './qrcode-generator.js',
  './pregnancy-intake-questionnaire.html',
  './manifest-v3.webmanifest',
  './icon-192-v3.png',
  './icon-512-v3.png',
  './apple-touch-icon-v3.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;              // never touch writes (sync PUTs)
  if (url.origin !== self.location.origin) return;      // never touch cross-origin sync traffic
  const networkFirst = e.request.mode === 'navigate' || ['document','script','manifest'].includes(e.request.destination);
  if(networkFirst){
    e.respondWith(fetch(e.request).then(resp=>{
      if(resp&&resp.ok){const copy=resp.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));}
      return resp;
    }).catch(()=>caches.match(e.request)));
    return;
  }
  e.respondWith(caches.match(e.request).then(cached=>cached||fetch(e.request).then(resp=>{
    if(resp&&resp.ok){const copy=resp.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));}
    return resp;
  })));
});
