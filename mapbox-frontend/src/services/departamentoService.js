import { api } from './api';

export const departamentoService = {
  getDepartamentos: async () => {
    try {
      // ✅ Usar la ruta correcta que SÍ existe en el backend
      return await api.get('/lugares/departamentos');
    } catch (error) {
      console.error('Error fetching departamentos:', error);
      throw error;
    }
  }
};