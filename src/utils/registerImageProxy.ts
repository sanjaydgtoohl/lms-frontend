const CDN_BASE = String(
  import.meta.env.VITE_REMOTE_IMAGES_BASE_URL || 'https://d2nljoxssb7y4b.cloudfront.net'
).replace(/\/$/, '');

const SW_FETCH_TIMEOUT = 45000;

let registrationPromise: Promise<void> | null = null;

function sendCdnConfig(worker: ServiceWorker | null | undefined) {
  worker?.postMessage({ type: 'CONFIG', cdn: CDN_BASE });
}

function waitForServiceWorkerController(timeoutMs = 10000): Promise<void> {
  if (!('serviceWorker' in navigator) || navigator.serviceWorker.controller) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const timer = window.setTimeout(() => resolve(), timeoutMs);
    navigator.serviceWorker.addEventListener(
      'controllerchange',
      () => {
        window.clearTimeout(timer);
        resolve();
      },
      { once: true }
    );
  });
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
      .then(async (registration) => {
        sendCdnConfig(registration.active);
        await waitForServiceWorkerController();
      })
      .catch((error) => {
        console.warn('Image proxy service worker failed to register:', error);
      });
  }

  return registrationPromise;
}

/** Ask the active service worker to fetch a CDN image and return a data URL. */
export async function fetchImageViaServiceWorker(url: string): Promise<string | null> {
  if (import.meta.env.DEV || !('serviceWorker' in navigator)) {
    return null;
  }

  await ensureImageProxyReady();

  const controller = navigator.serviceWorker.controller;
  if (!controller) return null;

  const requestId =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`;

  return await new Promise((resolve) => {
    const timeoutId = window.setTimeout(() => {
      navigator.serviceWorker.removeEventListener('message', onMessage);
      resolve(null);
    }, SW_FETCH_TIMEOUT);

    const onMessage = (event: MessageEvent) => {
      if (event.data?.type !== 'FETCH_IMAGE_RESULT') return;
      if (event.data.requestId !== requestId) return;

      window.clearTimeout(timeoutId);
      navigator.serviceWorker.removeEventListener('message', onMessage);

      if (event.data.error || typeof event.data.dataUrl !== 'string') {
        resolve(null);
        return;
      }

      resolve(event.data.dataUrl);
    };

    navigator.serviceWorker.addEventListener('message', onMessage);
    controller.postMessage({ type: 'FETCH_IMAGE', requestId, url });
  });
}
