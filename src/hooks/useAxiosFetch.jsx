import { useEffect, useMemo } from 'react';
import axios from 'axios';

const useAxiosFetch = () => {
  // ✅ useMemo agar instance tidak berubah setiap render
  const axiosInstance = useMemo(() => {
    return axios.create({
      baseURL: 'https://frasa-backend.vercel.app/api/',
    });
  }, []);

  useEffect(() => {
    const requestInterceptor = axiosInstance.interceptors.request.use(
      (config) => config,
      (error) => Promise.reject(error)
    );

    const responseInterceptor = axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => Promise.reject(error)
    );

    return () => {
      axiosInstance.interceptors.request.eject(requestInterceptor);
      axiosInstance.interceptors.response.eject(responseInterceptor);
    };
  }, [axiosInstance]);

  return axiosInstance;
};

export default useAxiosFetch;