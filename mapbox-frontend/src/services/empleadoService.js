import { api } from './api';

export const empleadoService = {
  getEmpleados: async () => {
    return await api.get('/empleados');
  },

  createEmpleado: async (empleadoData) => {
    return await api.post('/empleados', empleadoData);
  },

  updateEmpleado: async (id, empleadoData) => {
    return await api.put(`/empleados/${id}`, empleadoData);
  },

  toggleActivo: async (id) => {
    return await api.patch(`/empleados/${id}/toggle-activo`);
  },

  getUbicacionEmpleado: async (id) => {
    return await api.get(`/ubicacion/empleado/${id}`);
  }
};