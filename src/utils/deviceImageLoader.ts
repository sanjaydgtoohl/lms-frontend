import type { DeviceData } from '../types/inventory.types';
import { ensureImageProxyReady, fetchImageViaServiceWorker } from './registerImageProxy';

const REMOTE_IMAGES_BASE = String(
  import.meta.env.VITE_REMOTE_IMAGES_BASE_URL || 'https://d2nljoxssb7y4b.cloudfront.net'
).replace(/\/$/, '');

const IMAGE_PROXY_PREFIX = String(import.meta.env.VITE_IMAGE_BASE_URL || '/remote-images').replace(
  /\/$/,
  ''
);

const IMAGE_FETCH_TIMEOUT = 45000;
const MAX_CONCURRENT_IMAGE_LOADS = 4;

const INVALID_IMAGE_VALUES = new Set(['', 'none', 'null', 'undefined', 'n/a']);

const imageDataUrlCache = new Map<string, Promise<string | null>>();

let activeImageLoads = 0;
const imageLoadQueue: Array<() => void> = [];

function acquireImageLoadSlot(): Promise<void> {
  if (activeImageLoads < MAX_CONCURRENT_IMAGE_LOADS) {
    activeImageLoads += 1;
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    imageLoadQueue.push(() => {
      activeImageLoads += 1;
      resolve();
    });
  });
}

function releaseImageLoadSlot(): void {
  activeImageLoads -= 1;
  const next = imageLoadQueue.shift();
  if (next) next();
}

export function resolveDeviceImageCandidates(device: DeviceData): string[] {
  const candidates = [device.device_image, device.aws_device_image, device.old_device_image];

  const seen = new Set<string>();
  const urls: string[] = [];

  for (const candidate of candidates) {
    const value = candidate?.trim();
    if (!value || INVALID_IMAGE_VALUES.has(value.toLowerCase())) continue;
    if (seen.has(value)) continue;
    seen.add(value);
    urls.push(value);
  }

  return urls;
}

export function resolveDeviceImageUrl(device: DeviceData): string | null {
  return resolveDeviceImageCandidates(device)[0] ?? null;
}

function getRemoteImagesHost(): string {
  try {
    return new URL(REMOTE_IMAGES_BASE).hostname;
  } catch {
    return 'd2nljoxssb7y4b.cloudfront.net';
  }
}

function collapseSlashes(path: string): string {
  return path.replace(/\/+/g, '/');
}

function stripRemoteImagesPrefix(path: string): string {
  return path.replace(/^\/?remote-images\//i, '').replace(/^\/+/, '');
}

/** Convert API image value to an absolute CDN URL. */
export function resolveCdnImageUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim();
  if (!trimmed) return '';

  if (trimmed.startsWith('//')) {
    return `${window.location.protocol}${trimmed}`;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  const path = collapseSlashes(stripRemoteImagesPrefix(trimmed.replace(/^\/+/, '')));
  return `${REMOTE_IMAGES_BASE}/${path}`;
}

/** Normalize API image paths to a fetchable absolute or same-origin proxy URL. */
export function normalizeDeviceImageUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return '';

  if (trimmed.startsWith('//')) {
    return `${window.location.protocol}${trimmed}`;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  const path = collapseSlashes(stripRemoteImagesPrefix(trimmed.replace(/^\/+/, '')));

  if (IMAGE_PROXY_PREFIX.startsWith('http')) {
    return `${IMAGE_PROXY_PREFIX}/${path}`;
  }

  return `${IMAGE_PROXY_PREFIX}/${path}`;
}

function toAbsoluteUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith('//')) return `${window.location.protocol}${url}`;
  return `${window.location.origin}${url.startsWith('/') ? url : `/${url}`}`;
}

function isRemoteCdnUrl(url: string): boolean {
  try {
    const imageUrl = new URL(url, window.location.origin);
    const remoteHost = getRemoteImagesHost();

    return (
      imageUrl.hostname === remoteHost ||
      imageUrl.hostname.endsWith('.cloudfront.net') ||
      imageUrl.hostname.includes('amazonaws.com')
    );
  } catch {
    return false;
  }
}

/** Build same-origin proxy URL so canvas/export can read pixels without CORS. */
export function buildDeviceImageFetchUrl(normalizedUrl: string): string {
  if (!normalizedUrl) return '';

  try {
    const imageUrl = new URL(normalizedUrl, window.location.origin);
    const origin = window.location.origin;

    if (imageUrl.origin === origin) {
      return imageUrl.toString();
    }

    if (isRemoteCdnUrl(imageUrl.toString())) {
      const proxiedPath = collapseSlashes(
        `${IMAGE_PROXY_PREFIX}${imageUrl.pathname}${imageUrl.search}`
      );
      return toAbsoluteUrl(proxiedPath);
    }

    if (IMAGE_PROXY_PREFIX.startsWith('http')) {
      return `${IMAGE_PROXY_PREFIX}${imageUrl.pathname}${imageUrl.search}`;
    }

    return toAbsoluteUrl(`${IMAGE_PROXY_PREFIX}${imageUrl.pathname}${imageUrl.search}`);
  } catch {
    return toAbsoluteUrl(normalizedUrl);
  }
}

function inferMimeType(blob: Blob, url: string): string {
  if (blob.type && blob.type.startsWith('image/')) {
    return blob.type;
  }

  const lower = url.toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.gif')) return 'image/gif';
  if (lower.endsWith('.svg')) return 'image/svg+xml';
  return 'image/jpeg';
}

async function blobToDataUrl(blob: Blob, sourceUrl: string): Promise<string> {
  const mimeType = inferMimeType(blob, sourceUrl);

  if (mimeType === 'image/jpeg' || mimeType === 'image/png') {
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') resolve(reader.result);
        else reject(new Error('Failed to read image blob'));
      };
      reader.onerror = () => reject(new Error('Failed to read image blob'));
      reader.readAsDataURL(blob);
    });
  }

  return await new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(new Blob([blob], { type: mimeType }));
    const image = new Image();

    image.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = image.naturalWidth || image.width || 1;
        canvas.height = image.naturalHeight || image.height || 1;
        const context = canvas.getContext('2d');
        if (!context) {
          reject(new Error('Canvas unavailable'));
          return;
        }
        context.drawImage(image, 0, 0);
        resolve(canvas.toDataURL('image/jpeg', 0.92));
      } catch (error) {
        reject(error);
      } finally {
        URL.revokeObjectURL(objectUrl);
      }
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to decode image'));
    };

    image.src = objectUrl;
  });
}

async function fetchImageBlob(url: string, mode: RequestMode = 'cors'): Promise<Blob | null> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), IMAGE_FETCH_TIMEOUT);

  try {
    const response = await fetch(url, { signal: controller.signal, mode });
    if (mode === 'cors' && !response.ok) return null;
    const blob = await response.blob();
    return blob.size > 0 ? blob : null;
  } catch {
    return null;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

async function fetchCdnImageDataUrl(cdnUrl: string): Promise<string | null> {
  const opaqueBlob = await fetchImageBlob(cdnUrl, 'no-cors');
  if (opaqueBlob) {
    try {
      return await blobToDataUrl(opaqueBlob, cdnUrl);
    } catch (error) {
      console.warn('CDN opaque blob conversion failed:', cdnUrl, error);
    }
  }

  const swDataUrl = await fetchImageViaServiceWorker(cdnUrl);
  if (swDataUrl) return swDataUrl;

  return null;
}

async function fetchProxiedImageDataUrl(proxiedUrl: string): Promise<string | null> {
  const blob = await fetchImageBlob(proxiedUrl, 'cors');
  if (!blob) return null;

  try {
    return await blobToDataUrl(blob, proxiedUrl);
  } catch (error) {
    console.warn('Proxied image blob conversion failed:', proxiedUrl, error);
    return null;
  }
}

async function loadImageDataUrl(rawUrl: string): Promise<string | null> {
  const cdnUrl = resolveCdnImageUrl(rawUrl);
  if (!cdnUrl) return null;

  const cacheKey = cdnUrl;
  const cached = imageDataUrlCache.get(cacheKey);
  if (cached) return cached;

  const loadPromise = (async () => {
    if (import.meta.env.DEV) {
      const proxiedUrl = buildDeviceImageFetchUrl(normalizeDeviceImageUrl(rawUrl));
      const proxiedDataUrl = await fetchProxiedImageDataUrl(proxiedUrl);
      if (proxiedDataUrl) return proxiedDataUrl;
    } else {
      await ensureImageProxyReady();

      const cdnDataUrl = await fetchCdnImageDataUrl(cdnUrl);
      if (cdnDataUrl) return cdnDataUrl;

      const proxiedUrl = buildDeviceImageFetchUrl(normalizeDeviceImageUrl(rawUrl));
      const proxiedDataUrl = await fetchProxiedImageDataUrl(proxiedUrl);
      if (proxiedDataUrl) return proxiedDataUrl;
    }

    return await fetchCdnImageDataUrl(cdnUrl);
  })();

  imageDataUrlCache.set(cacheKey, loadPromise);

  const result = await loadPromise;
  if (!result) {
    imageDataUrlCache.delete(cacheKey);
  }

  return result;
}

export async function loadDeviceImageDataUrl(device: DeviceData): Promise<string | null> {
  await acquireImageLoadSlot();

  try {
    const candidates = resolveDeviceImageCandidates(device);

    for (const candidate of candidates) {
      const dataUrl = await loadImageDataUrl(candidate);
      if (dataUrl) return dataUrl;
    }

    return null;
  } finally {
    releaseImageLoadSlot();
  }
}

/** URL for `<img src>` in the UI (direct CDN when possible). */
export function getDeviceImageDisplayUrl(device: DeviceData): string | null {
  const raw = resolveDeviceImageUrl(device);
  if (!raw) return null;

  return resolveCdnImageUrl(raw) || null;
}
