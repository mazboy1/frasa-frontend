// hooks/useAxiosSecure.js - FINAL FIXED VERSION
import axios from 'axios';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const useAxiosSecure = () => {
  const navigate = useNavigate();

  const axiosSecure = axios.create({
    baseURL: 'https://frasa-backend.vercel.app',
    timeout: 15000,
  });

  useEffect(() => {
    // ✅ REQUEST INTERCEPTOR - IMPROVED
    const requestInterceptor = axiosSecure.interceptors.request.use(
      (config) => {
        // ✅ PRIORITAS TOKEN YANG BENAR
        const token = localStorage.getItem('token') || localStorage.getItem('access-token');
        
        console.log('🔐 Axios Request - URL:', config.url);
        console.log('🔐 Axios Request - Token exists:', !!token);
        
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('✅ Auth header added');
        } else {
          console.warn('⚠️ No token found in localStorage');
        }

        return config;
      },
      (error) => {
        console.error('❌ Request Interceptor Error:', error);
        return Promise.reject(error);
      }
    );

    // ✅ RESPONSE INTERCEPTOR - IMPROVED
    const responseInterceptor = axiosSecure.interceptors.response.use(
      (response) => {
        console.log('✅ Response Success:', response.status, response.config.url);
        return response;
      },
      (error) => {
        console.error('❌ Response Error:', {
          status: error.response?.status,
          url: error.config?.url,
          message: error.message,
          data: error.response?.data
        });

        // ✅ HANDLE AUTH ERRORS
        if (error.response?.status === 401 || error.response?.status === 403) {
          console.log('🔐 Auth Error - Clearing tokens and redirecting to login');
          localStorage.removeItem('token');
          localStorage.removeItem('access-token');
          navigate('/login');
        }

        return Promise.reject(error);
      }
    );

    return () => {
      axiosSecure.interceptors.request.eject(requestInterceptor);
      axiosSecure.interceptors.response.eject(responseInterceptor);
    };
  }, [axiosSecure, navigate]);

  return axiosSecure;
};

export default useAxiosSecure;