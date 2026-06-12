import type { DeviceData } from '../types/inventory.types';
import { ensureImageProxyReady } from './registerImageProxy';

const REMOTE_IMAGES_BASE = String(
  import.meta.env.VITE_REMOTE_IMAGES_BASE_URL || 'https://d2nljoxssb7y4b.cloudfront.net'
).replace(/\/$/, '');

const IMAGE_PROXY_PREFIX = String(import.meta.env.VITE_IMAGE_BASE_URL || '/remote-images').replace(
  /\/$/,
  ''
);

const IMAGE_FETCH_TIMEOUT = 12000;

const INVALID_IMAGE_VALUES = new Set(['', 'none', 'null', 'undefined', 'n/a']);

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

  const path = trimmed.replace(/^\/+/, '');
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

/** Build same-origin proxy URL so canvas/export can read pixels without CORS. */
export function buildDeviceImageFetchUrl(normalizedUrl: string): string {
  if (!normalizedUrl) return '';

  try {
    const imageUrl = new URL(normalizedUrl, window.location.origin);
    const origin = window.location.origin;

    if (imageUrl.origin === origin) {
      return imageUrl.toString();
    }

    const remoteHost = getRemoteImagesHost();
    const isRemoteAsset =
      imageUrl.hostname === remoteHost ||
      imageUrl.hostname.endsWith('.cloudfront.net') ||
      imageUrl.hostname.includes('amazonaws.com');

    if (isRemoteAsset) {
      const proxiedPath = `${IMAGE_PROXY_PREFIX}${imageUrl.pathname}${imageUrl.search}`;
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

function buildFetchCandidates(rawUrl: string): string[] {
  const normalized = normalizeDeviceImageUrl(rawUrl);
  if (!normalized) return [];

  const proxied = buildDeviceImageFetchUrl(normalized);
  const remoteAbsolute = /^https?:\/\//i.test(normalized)
    ? normalized
    : `${REMOTE_IMAGES_BASE}/${normalized.replace(/^\/+/, '')}`;

  return Array.from(new Set([proxied, normalized, remoteAbsolute].filter(Boolean)));
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

async function fetchImageBlob(url: string): Promise<Blob | null> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), IMAGE_FETCH_TIMEOUT);

  try {
    const response = await fetch(url, { signal: controller.signal, credentials: 'same-origin' });
    if (!response.ok) return null;
    const blob = await response.blob();
    return blob.size > 0 ? blob : null;
  } catch {
    return null;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

async function loadImageViaElement(url: string): Promise<string> {
  return await new Promise((resolve, reject) => {
    const image = new Image();
    const isCrossOrigin =
      /^https?:\/\//i.test(url) && !url.startsWith(window.location.origin);

    if (isCrossOrigin) {
      image.crossOrigin = 'anonymous';
    }

    const timeoutId = window.setTimeout(() => {
      reject(new Error('Image load timeout'));
    }, IMAGE_FETCH_TIMEOUT);

    image.onload = () => {
      window.clearTimeout(timeoutId);
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
      }
    };

    image.onerror = () => {
      window.clearTimeout(timeoutId);
      reject(new Error('Image element failed to load'));
    };

    image.src = url;
  });
}

async function loadImageDataUrl(rawUrl: string): Promise<string | null> {
  await ensureImageProxyReady();
  const candidates = buildFetchCandidates(rawUrl);

  for (const candidate of candidates) {
    const blob = await fetchImageBlob(candidate);
    if (blob) {
      try {
        return await blobToDataUrl(blob, candidate);
      } catch (error) {
        console.warn('Device image blob conversion failed:', candidate, error);
      }
    }

    try {
      return await loadImageViaElement(candidate);
    } catch (error) {
      console.warn('Device image element load failed:', candidate, error);
    }
  }

  return null;
}

export async function loadDeviceImageDataUrl(device: DeviceData): Promise<string | null> {
  const candidates = resolveDeviceImageCandidates(device);

  for (const candidate of candidates) {
    const dataUrl = await loadImageDataUrl(candidate);
    if (dataUrl) return dataUrl;
  }

  return null;
}

/** URL for `<img src>` in the UI (direct CDN when possible). */
export function getDeviceImageDisplayUrl(device: DeviceData): string | null {
  const raw = resolveDeviceImageUrl(device);
  if (!raw) return null;

  const normalized = normalizeDeviceImageUrl(raw);
  if (/^https?:\/\//i.test(normalized)) {
    return normalized;
  }

  return `${REMOTE_IMAGES_BASE}/${normalized.replace(/^\/+/, '').replace(/^remote-images\//, '')}`;
}
