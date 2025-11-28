import { api } from './api';

export const departamentoService = {
  // Obtener todos los departamentos
  async getDepartamentos() {
    try {
      return await api.get('/departamentos');
    } catch (error) {
      console.error('Error fetching departamentos:', error);
      throw error;
    }
  }
};