import { api } from './api';

export const lugarService = {
  // Obtener todos los lugares
  getLugares: async () => {
    return await api.get('/lugares');
  },

  // Obtener departamentos para selects
  getDepartamentos: async () => {
    return await api.get('/lugares/departamentos');
  },

  // Crear nuevo lugar
  createLugar: async (lugarData) => {
    return await api.post('/lugares', lugarData);
  },

  // Actualizar lugar
  updateLugar: async (id, lugarData) => {
    return await api.put(`/lugares/${id}`, lugarData);
  },

  // Actualizar solo geocerca
  updateGeocerca: async (id, geocercaData) => {
    return await api.put(`/lugares/${id}/geocerca`, geocercaData);
  },

  // Eliminar lugar (borrado lógico)
  deleteLugar: async (id) => {
    return await api.delete(`/lugares/${id}`);
  }
};