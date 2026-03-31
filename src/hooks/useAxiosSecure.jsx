// /src/hooks/useAxiosSecure.jsx
import axios from 'axios';

const useAxiosSecure = () => {
  const axiosInstance = axios.create({
    baseURL: 'https://frasa-backend.vercel.app', // TANPA /api
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    }
  });

  // Request interceptor
  axiosInstance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor
  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      console.error('❌ AxiosSecure Error:', error.response?.status);
      
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      
      return Promise.reject(error);
    }
  );

  return axiosInstance;
};

export default useAxiosSecure;