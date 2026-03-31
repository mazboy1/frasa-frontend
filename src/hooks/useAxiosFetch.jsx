// /src/hooks/useAxiosFetch.jsx
import axios from 'axios';

const useAxiosFetch = () => {
  const axiosInstance = axios.create({
    baseURL: 'https://frasa-backend.vercel.app', // TANPA /api
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    }
  });

  // Request interceptor untuk menambahkan token
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

  // Response interceptor untuk handling error
  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      console.error('❌ Axios Error:', error.response?.status, error.response?.data);
      return Promise.reject(error);
    }
  );

  return axiosInstance;
};

export default useAxiosFetch;