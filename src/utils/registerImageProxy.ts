const CDN_BASE = String(
  import.meta.env.VITE_REMOTE_IMAGES_BASE_URL || 'https://d2nljoxssb7y4b.cloudfront.net'
).replace(/\/$/, '');

let registrationPromise: Promise<void> | null = null;

function sendCdnConfig(worker: ServiceWorker | null | undefined) {
  worker?.postMessage({ type: 'CONFIG', cdn: CDN_BASE });
}

/** Register SW that proxies /remote-images -> CDN (production only). */
export function ensureImageProxyReady(): Promise<void> {
  if (import.meta.env.DEV || !('serviceWorker' in navigator)) {
    return Promise.resolve();
  }

  if (!registrationPromise) {
    registrationPromise = navigator.serviceWorker
      .register('/image-proxy-sw.js', { scope: '/' })
      .then((registration) => {
        sendCdnConfig(registration.installing || registration.waiting || registration.active);

        registration.addEventListener('updatefound', () => {
          const worker = registration.installing;
          worker?.addEventListener('statechange', () => {
            if (worker.state === 'activated') {
              sendCdnConfig(worker);
            }
          });
        });

        return navigator.serviceWorker.ready;
      })
      .then((registration) => {
        sendCdnConfig(registration.active);
      })
      .catch((error) => {
        console.warn('Image proxy service worker failed to register:', error);
      });
  }

  return registrationPromise;
}
