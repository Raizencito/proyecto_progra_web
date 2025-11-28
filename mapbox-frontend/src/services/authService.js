import { api } from './api';

export const authService = {
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      
      if (response.empleado) {
        localStorage.setItem('token', response.token || 'jwt-token-simulado');
        localStorage.setItem('user', JSON.stringify(response.empleado));
      }
      
      return response;
    } catch (error) {
      if (error.response) {
        throw error.response.data;
      }
      throw { error: 'Error de conexión con el servidor' };
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  }
};