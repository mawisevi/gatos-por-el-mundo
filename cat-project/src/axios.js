import axios from 'axios';
import Cookies from 'js-cookie';
import { useAuthStore } from './store/auth';

// Instancia para Laravel backend
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  withCredentials: true,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
});

api.interceptors.request.use((config) => {
  // const token = Cookies.get('XSRF-TOKEN');
  // if (token) {
  //   config.headers['X-XSRF-TOKEN'] = token;
  // }

  const authStore = useAuthStore();
  if (authStore.token) {
    config.headers.Authorization = `Bearer ${authStore.token}`;
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});


// Instancia para API pública (sin cookies)
const catApi = axios.create({
  baseURL: 'https://api.thecatapi.com/v1',
  withCredentials: false,
});

export { api, catApi };
