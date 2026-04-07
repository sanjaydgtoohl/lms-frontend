import axios from 'axios';

const SSP_BASE_URL = (import.meta.env.VITE_SSP_BASE_URL as string) || '';

const sspHttp = axios.create({
  baseURL: SSP_BASE_URL,
  withCredentials: true,
});

export default sspHttp;
