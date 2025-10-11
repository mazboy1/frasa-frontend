// hooks/useAxiosSecure.js - FINAL FIXED VERSION
import axios from 'axios';
import { useEffect } from 'react';

const useAxiosSecure = () => {
  const axiosSecure = axios.create({
    baseURL: 'https://frasa-backend.vercel.app',
  });

  useEffect(() => {
    // ✅ REQUEST INTERCEPTOR - FIXED
    const requestInterceptor = axiosSecure.interceptors.request.use(
      (config) => {
        // ✅ GET ACTIVE TOKEN
        const token = localStorage.getItem('token') || localStorage.getItem('access-token');
        
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('🔐 Auth header added to:', config.url);
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // ✅ RESPONSE INTERCEPTOR - FIXED
    const responseInterceptor = axiosSecure.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 403) {
          console.error('🚨 403 Forbidden - Clearing invalid tokens');
          localStorage.removeItem('token');
          localStorage.removeItem('access-token');
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axiosSecure.interceptors.request.eject(requestInterceptor);
      axiosSecure.interceptors.response.eject(responseInterceptor);
    };
  }, [axiosSecure]);

  return axiosSecure;
};

export default useAxiosSecure;