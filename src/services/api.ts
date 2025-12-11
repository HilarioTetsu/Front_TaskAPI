import axios from 'axios';
import router from '../router';

const api = axios.create({
  baseURL: "http://localhost:8080/ExampleAPI/v1",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('jwt');
      router.replace('/login');
    }
    return Promise.reject(err);
  }
);

export default api;
