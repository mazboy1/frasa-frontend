import { useEffect, useMemo } from 'react';
import axios from 'axios';
import useAuth from './useAuth';

const useAxiosSecure = () => {
  const { logout } = useAuth();
  
  const axiosInstance = useMemo(() => {
    return axios.create({
      baseURL: 'https://frasa-backend.vercel.app/api/',
    });
  }, []);

  useEffect(() => {
    // Request Interceptor - Tambah token
    const requestInterceptor = axiosInstance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        
        // 🔧 DEBUG: Log token
        console.log('🔐 [useAxiosSecure] Token from localStorage:', token ? '✅ Found' : '❌ Not Found');
        console.log('📤 [useAxiosSecure] Request to:', config.baseURL + config.url);
        
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('✅ [useAxiosSecure] Authorization header set');
        } else {
          console.warn('⚠️ [useAxiosSecure] No token found in localStorage!');
        }
        
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response Interceptor - Handle error
    const responseInterceptor = axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        console.error('❌ [useAxiosSecure] Response error:', error.response?.status, error.response?.data);
        
        if (error.response?.status === 401 || error.response?.status === 403) {
          console.log('🔴 [useAxiosSecure] Unauthorized - logging out');
          await logout();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axiosInstance.interceptors.request.eject(requestInterceptor);
      axiosInstance.interceptors.response.eject(responseInterceptor);
    };
  }, [axiosInstance, logout]);

  return axiosInstance;
};

export default useAxiosSecure;