// hooks/useAxiosSecure.js - FINAL FIXED VERSION
import { useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const useAxiosSecure = () => {
  const navigate = useNavigate();
  
  const axiosSecure = axios.create({
    baseURL: 'https://frasa-backend.vercel.app',
  });

  useEffect(() => {
    // ✅ REQUEST INTERCEPTOR - HANDLE ALL TOKEN VARIATIONS
    axiosSecure.interceptors.request.use((config) => {
      // ✅ CHECK ALL POSSIBLE TOKEN NAMES
      const token = localStorage.getItem('token') || 
                   localStorage.getItem('access-token');
      
      console.log('🔐 Axios Interceptor - Token found:', !!token);
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('✅ Token added to request headers');
      } else {
        console.warn('⚠️ No token found in localStorage');
        // Don't redirect here, let the response interceptor handle it
      }
      
      return config;
    }, (error) => {
      console.error('❌ Request interceptor error:', error);
      return Promise.reject(error);
    });

    // ✅ RESPONSE INTERCEPTOR - HANDLE AUTH ERRORS
    axiosSecure.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        console.error('❌ Response error:', error.response?.status);
        
        if (error.response?.status === 401 || error.response?.status === 403) {
          console.log('🔐 Authentication failed, redirecting to login...');
          // Clear all tokens
          localStorage.removeItem('token');
          localStorage.removeItem('access-token');
          navigate('/login');
        }
        return Promise.reject(error);
      }
    );
  }, [axiosSecure, navigate]);

  return axiosSecure;
}

export default useAxiosSecure;