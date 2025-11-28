import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Instancia simple de axios sin autenticación
const apiInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
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
  
  delete: async (endpoint) => {
    const response = await apiInstance.delete(endpoint);
    return response.data;
  },
  
  patch: async (endpoint, data) => {
    const response = await apiInstance.patch(endpoint, data);
    return response.data;
  }
};

export { API_BASE_URL };