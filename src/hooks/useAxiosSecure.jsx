import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const useAxiosSecure = () => {
  const navigate = useNavigate();

  const axiosSecure = axios.create({
    baseURL: 'https://frasa-backend.vercel.app/api',
    timeout: 10000,
  });

  // ✅ INTERCEPTOR UNTUK REQUEST
  axiosSecure.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      console.log('🔐 Axios Request Interceptor - Token:', token);
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      console.log('🚀 Request Config:', {
        url: config.url,
        headers: config.headers
      });
      
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // ✅ INTERCEPTOR UNTUK RESPONSE
  axiosSecure.interceptors.response.use(
    (response) => {
      console.log('✅ Response Success:', response.status, response.config.url);
      return response;
    },
    (error) => {
      console.error('❌ Response Error:', {
        status: error.response?.status,
        url: error.config?.url,
        message: error.message
      });

      // ✅ HANDLE 403 FORBIDDEN
      if (error.response?.status === 403) {
        console.log('🚫 403 Forbidden - Redirecting to login');
        localStorage.removeItem('token');
        navigate('/login');
      }

      // ✅ HANDLE 401 UNAUTHORIZED
      if (error.response?.status === 401) {
        console.log('🔐 401 Unauthorized - Token invalid');
        localStorage.removeItem('token');
        navigate('/login');
      }

      return Promise.reject(error);
    }
  );

  return axiosSecure;
};

export default useAxiosSecure;