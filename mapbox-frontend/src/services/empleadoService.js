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

  updateLugarTrabajo: async (id, id_lugar_trabajo) => {
    return await api.put(`/empleados/${id}/lugar`, { id_lugar_trabajo });
  },

  // Usando endpoints específicos PATCH (RECOMENDADO)
  activateEmpleado: async (id) => {
    return await api.patch(`/empleados/${id}/activar`);
  },

  deactivateEmpleado: async (id) => {
    return await api.patch(`/empleados/${id}/desactivar`);
  },

  getUbicacionEmpleado: async (id) => {
    return await api.get(`/ubicacion/empleado/${id}`);
  }
};