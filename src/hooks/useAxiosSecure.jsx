// hooks/useAxiosSecure.js - FINAL COMPLETE FIXED VERSION
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
    // ✅ REQUEST INTERCEPTOR - COMPLETE FIXED VERSION
    const requestInterceptor = axiosSecure.interceptors.request.use(
      (config) => {
        // ✅ CEK SEMUA KEMUNGKINAN TOKEN DENGAN PRIORITAS
        const token = localStorage.getItem('token') || 
                     localStorage.getItem('access-token') ||
                     sessionStorage.getItem('token');
        
        console.log('🔐 Axios Request Interceptor:');
        console.log('URL:', config.url);
        console.log('Method:', config.method);
        console.log('Token exists:', !!token);
        console.log('Token source:', 
          localStorage.getItem('token') ? 'localStorage-token' :
          localStorage.getItem('access-token') ? 'localStorage-access-token' :
          sessionStorage.getItem('token') ? 'sessionStorage-token' : 'No token'
        );
        
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('✅ Authorization header added to request');
        } else {
          console.warn('⚠️ No authentication token found for request:', config.url);
          // Jangan redirect di sini, biarkan component handle error
        }

        return config;
      },
      (error) => {
        console.error('❌ Request Interceptor Error:', error);
        return Promise.reject(error);
      }
    );

    // ✅ RESPONSE INTERCEPTOR - COMPLETE FIXED VERSION
    const responseInterceptor = axiosSecure.interceptors.response.use(
      (response) => {
        console.log('✅ Response Success:', {
          status: response.status,
          url: response.config.url,
          data: response.data
        });
        return response;
      },
      (error) => {
        const errorDetails = {
          status: error.response?.status,
          url: error.config?.url,
          method: error.config?.method,
          message: error.message,
          data: error.response?.data
        };

        console.error('❌ Response Error Details:', errorDetails);

        // ✅ HANDLE 403 FORBIDDEN SPECIFICALLY
        if (error.response?.status === 403) {
          console.log('🚫 403 Forbidden - Authentication failed for:', error.config?.url);
          
          // Clear semua token yang mungkin invalid
          localStorage.removeItem('token');
          localStorage.removeItem('access-token');
          sessionStorage.removeItem('token');
          
          console.log('🔐 All tokens cleared due to 403 error');
          
          // Jangan auto-redirect, biarkan component handle
          // Component bisa memberikan opsi untuk login ulang
        }

        // ✅ HANDLE 401 UNAUTHORIZED
        if (error.response?.status === 401) {
          console.log('🔐 401 Unauthorized - Redirecting to login');
          
          // Clear tokens
          localStorage.removeItem('token');
          localStorage.removeItem('access-token');
          sessionStorage.removeItem('token');
          
          // Redirect ke login
          navigate('/login', { 
            state: { 
              from: window.location.pathname,
              error: 'Session expired. Please login again.'
            }
          });
        }

        // ✅ HANDLE NETWORK ERRORS
        if (!error.response) {
          console.error('🌐 Network Error:', error.message);
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