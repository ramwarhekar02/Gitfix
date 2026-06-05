import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true, // HTTP-only cookies - NOT exposed to JavaScript
});

// Add request interceptor for security
axiosInstance.interceptors.request.use(
  (config) => {
    // Remove any Authorization header in favor of cookies
    if (config.headers.Authorization) {
      delete config.headers.Authorization;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't expose sensitive error details in development
    if (import.meta.env.MODE === 'development') {
      console.warn('API Error:', error.response?.status, error.response?.statusText);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
