// Troque o número da versão sempre que quiser forçar a limpeza do cache antigo.
const CACHE_NAME = 'cpb-cache-v1';
const ASSETS = ['./', './index.html', './manifest.json', './icon.svg', './icon-192.png', './icon-512.png', './icon-maskable-512.png', './apple-touch-icon.png', './favicon-32.png'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

// Rede primeiro, cache como reserva: quando há internet o app sempre abre a
// versão mais nova publicada; sem internet, abre a última que ficou guardada.
self.addEventListener('fetch', event => {
  if(event.request.method !== 'GET') return;
  // Deixa passar direto pedidos para fora da própria origem (fontes, Firebase, etc.)
  if(new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(
    fetch(event.request).then(resp => {
      const copy = resp.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
      return resp;
    }).catch(() => caches.match(event.request))
  );
});
