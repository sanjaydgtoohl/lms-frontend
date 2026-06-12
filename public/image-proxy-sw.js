/**
 * Proxies /remote-images/* to the CDN and fetches CDN images on demand for PPT export.
 */
const DEFAULT_CDN = 'https://d2nljoxssb7y4b.cloudfront.net';
const CACHE_NAME = 'remote-images-v2';

let cdnBase = DEFAULT_CDN;

function inferMimeFromUrl(url) {
  const lower = String(url).toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.gif')) return 'image/gif';
  if (lower.endsWith('.svg')) return 'image/svg+xml';
  return 'image/jpeg';
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  let binary = '';
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

self.addEventListener('message', (event) => {
  if (event.data?.type === 'CONFIG' && event.data.cdn) {
    cdnBase = String(event.data.cdn).replace(/\/$/, '');
    return;
  }

  if (event.data?.type !== 'FETCH_IMAGE') return;

  const { requestId, url } = event.data;
  const port = event.source;
  if (!port || !requestId || !url) return;

  fetch(url)
    .then((response) => {
      if (!response.ok) throw new Error('bad status');
      return response.arrayBuffer();
    })
    .then((buffer) => {
      if (!buffer.byteLength) throw new Error('empty');
      port.postMessage({
        type: 'FETCH_IMAGE_RESULT',
        requestId,
        dataUrl: `data:${inferMimeFromUrl(url)};base64,${arrayBufferToBase64(buffer)}`,
      });
    })
    .catch(() => {
      port.postMessage({ type: 'FETCH_IMAGE_RESULT', requestId, error: true });
    });
});

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key.startsWith('remote-images-') && key !== CACHE_NAME).map((key) => caches.delete(key)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  if (!url.pathname.startsWith('/remote-images/')) return;
  if (event.request.method !== 'GET') return;

  const cdnPath = url.pathname.slice('/remote-images'.length) || '/';
  const target = `${cdnBase}${cdnPath}${url.search}`;

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(event.request);
      if (cached) return cached;

      const response = await fetch(target);
      if (!response.ok) return response;

      const headers = new Headers(response.headers);
      const mime = inferMimeFromUrl(target);
      if (!headers.get('content-type')?.startsWith('image/')) {
        headers.set('content-type', mime);
      }

      const normalized = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });

      cache.put(event.request, normalized.clone());
      return normalized;
    })
  );
});
