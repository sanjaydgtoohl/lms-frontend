import axios from 'axios';

// Resolve SSP base URL from both import.meta.env and globalThis (runtime-injected)
const SSP_BASE_URL =
  (typeof globalThis !== 'undefined' && (globalThis as any).VITE_SSP_BASE_URL) ||
  (import.meta.env.VITE_SSP_BASE_URL as string) ||
  '';

const sspHttp = axios.create({
  baseURL: SSP_BASE_URL,
  withCredentials: true,
});

export default sspHttp;
