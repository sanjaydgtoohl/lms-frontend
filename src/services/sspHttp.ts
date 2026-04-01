import axios from 'axios';

const SSP_BASE_URL =
  (import.meta.env.VITE_SSP_BASE_URL as string) ||
  ((globalThis as any).VITE_SSP_BASE_URL as string) ||
  'http://localhost:8000';

const sspHttp = axios.create({
  baseURL: SSP_BASE_URL,
  withCredentials: true,
});

export default sspHttp;
