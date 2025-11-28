import { useState, useEffect } from 'react';
import { empleadoService } from '../services/empleadoService';

export const useEmpleados = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEmpleados = async () => {
    try {
      setLoading(true);
      setError(null);
      const empleados = await empleadoService.getEmpleados();
      setData(empleados);
    } catch (err) {
      setError(err.message || 'Error al cargar empleados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmpleados();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchEmpleados // ← Función para recargar datos
  };
};