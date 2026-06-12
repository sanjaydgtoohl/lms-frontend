/**
 * Proxies /remote-images/* to the CDN so PPT export can fetch images same-origin
 * on production (no nginx proxy required).
 */
const DEFAULT_CDN = 'https://d2nljoxssb7y4b.cloudfront.net';
let cdnBase = DEFAULT_CDN;

self.addEventListener('message', (event) => {
  if (event.data?.type === 'CONFIG' && event.data.cdn) {
    cdnBase = String(event.data.cdn).replace(/\/$/, '');
  }
});

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  if (!url.pathname.startsWith('/remote-images/')) return;
  if (event.request.method !== 'GET') return;

  const cdnPath = url.pathname.slice('/remote-images'.length) || '/';
  const target = `${cdnBase}${cdnPath}${url.search}`;

  event.respondWith(
    fetch(target).catch(() =>
      fetch(event.request).catch(() => Response.error())
    )
  );
});
