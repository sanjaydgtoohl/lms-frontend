import axios from 'axios';

// Resolve SSP base URL and special SSP API credentials from both import.meta.env and globalThis
const SSP_BASE_URL =
  (typeof globalThis !== 'undefined' && (globalThis as any).VITE_SSP_BASE_URL) ||
  import.meta.env.VITE_SSP_BASE_URL;

const SSP_BEARER_TOKEN =
  (typeof globalThis !== 'undefined' && (globalThis as any).VITE_SSP_BEARER_TOKEN) ||
  String(import.meta.env.VITE_SSP_BEARER_TOKEN || '');

const SSP_API_KEY =
  (typeof globalThis !== 'undefined' && (globalThis as any).VITE_SSP_API_KEY) ||
  String(import.meta.env.VITE_SSP_API_KEY || '');

const sspHttp = axios.create({
  baseURL: SSP_BASE_URL || undefined,
  withCredentials: false,
});

sspHttp.interceptors.request.use((config: any) => {
  if (!SSP_BASE_URL) {
    throw new Error(
      'SSP_BASE_URL is not configured. Set VITE_SSP_BASE_URL environment variable.'
    );
  }

  config.headers = config.headers || {};

  if (SSP_BEARER_TOKEN) {
    config.headers['Authorization'] = `Bearer ${SSP_BEARER_TOKEN}`;
  }

  if (SSP_API_KEY) {
    config.headers['x-api-key'] = btoa(SSP_API_KEY);
  }

  return config;
});

export default sspHttp;
