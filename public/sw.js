const cacheName = 'grammar-os-offline-v3';

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const shell = new URL('index.html', self.registration.scope);
    const response = await fetch(shell, { cache: 'reload' });
    if (!response.ok) throw new Error('Unable to cache the app shell');
    const markup = await response.clone().text();
    const assets = Array.from(markup.matchAll(/(?:src|href)="(\.\/assets\/[^"]+)"/g), match => match[1]);
    const cache = await caches.open(cacheName);
    await cache.addAll([...assets, './icon.svg'].map(asset => new URL(asset, shell)));
    await cache.put(shell, response);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || !request.url.startsWith(self.registration.scope)) return;
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(async () => {
      const cache = await caches.open(cacheName);
      return await cache.match(new URL('index.html', self.registration.scope)) ?? Response.error();
    }));
  } else {
    event.respondWith((async () => {
      const cache = await caches.open(cacheName);
      const cached = await cache.match(request);
      if (cached) return cached;
      const response = await fetch(request);
      if (response.ok) await cache.put(request, response.clone());
      return response;
    })());
  }
});
