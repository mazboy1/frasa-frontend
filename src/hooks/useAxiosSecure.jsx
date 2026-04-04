import { useEffect, useMemo } from 'react';
import axios from 'axios';
import useAuth from './useAuth';

const useAxiosSecure = () => {
  const { logout } = useAuth();
  
  const axiosInstance = useMemo(() => {
    return axios.create({
      baseURL: 'https://frasa-backend.vercel.app',  // ← TANPA trailing slash!
    });
  }, []);

  useEffect(() => {
    const requestInterceptor = axiosInstance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        
        console.log('📤 [Axios Request]:', {
          fullURL: config.baseURL + config.url,
          hasToken: !!token
        });
        
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
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