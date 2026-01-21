import axios from 'axios';
import { API_BASE_URL } from './config';

if (!API_BASE_URL) {
  throw new Error("API_BASE_URL is not defined. Check VITE_API_BASE_URL");
}

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;