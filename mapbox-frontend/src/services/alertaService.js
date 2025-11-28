import { api } from './api';

export const alertaService = {
  getAlertas: async () => {
    return await api.get('/alertas');
  },

  getAlertasHoy: async () => {
    return await api.get('/alertas/hoy');
  }
};