import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const api = {
  get: async (endpoint) => {
    const response = await apiInstance.get(endpoint);
    return response.data;
  },
  
  post: async (endpoint, data) => {
    const response = await apiInstance.post(endpoint, data);
    return response.data;
  },
  
  put: async (endpoint, data) => {
    const response = await apiInstance.put(endpoint, data);
    return response.data;
  },
  
  // AGREGAR ESTE MÉTODO
  patch: async (endpoint, data) => {
    const response = await apiInstance.patch(endpoint, data);
    return response.data;
  },
  
  delete: async (endpoint) => {
    const response = await apiInstance.delete(endpoint);
    return response.data;
  }
};

export { api, API_BASE_URL };