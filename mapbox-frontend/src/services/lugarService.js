import { api } from './api';

export const lugarService = {
  // ✅ EXISTE en backend
  getLugares: async () => {
    return await api.get('/lugares');
  },

  // ✅ EXISTE en backend - CREAR LUGAR
  createLugar: async (lugarData) => {
    return await api.post('/lugares', lugarData);
  },

  // ✅ EXISTE en backend - ACTUALIZAR LUGAR
  updateLugar: async (id, lugarData) => {
    return await api.put(`/lugares/${id}`, lugarData);
  },

  // ✅ EXISTE en backend - ELIMINAR LUGAR
  deleteLugar: async (id) => {
    return await api.delete(`/lugares/${id}`);
  },

  // ✅ EXISTE en backend - OBTENER DEPARTAMENTOS
  getDepartamentos: async () => {
    return await api.get('/lugares/departamentos');
  },

  // ✅ EXISTE en backend - ACTUALIZAR GEOCERCA
  updateGeocerca: async (id, geocercaData) => {
    return await api.put(`/lugares/${id}/geocerca`, geocercaData);
  }
};