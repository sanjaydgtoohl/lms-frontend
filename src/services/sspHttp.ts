import axios, { AxiosHeaders } from 'axios';
import { applySspAuthHeaders, resolveSspBaseUrl } from './sspConfig';

const sspHttp = axios.create({
  baseURL: resolveSspBaseUrl(),
  withCredentials: false,
});

sspHttp.interceptors.request.use((config) => {
  const baseUrl = resolveSspBaseUrl();
  if (!baseUrl) {
    throw new Error(
      'SSP base URL is not configured. Set VITE_SSP_API_BASE_URL in your environment.'
    );
  }

  const headers = AxiosHeaders.from(config.headers);
  Object.entries(applySspAuthHeaders()).forEach(([key, value]) => {
    headers.set(key, value);
  });
  config.headers = headers;

  return config;
});

export default sspHttp;
