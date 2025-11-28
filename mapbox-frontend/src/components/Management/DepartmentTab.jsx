import React from 'react';
import { useApi } from '../../hooks/useApi';
import { lugarService } from '../../services/lugarService';

const DepartmentTab = () => {
  const { data: lugares, loading, error } = useApi(() => lugarService.getLugares(), []);

  if (loading) return <div>Cargando departamentos...</div>;
  if (error) return <div>Error: {error}</div>;

  // Agrupar lugares por departamento
  const departamentos = lugares?.reduce((acc, lugar) => {
    const dept = acc.find(d => d.nombre === lugar.departamento);
    if (dept) {
      dept.lugares.push(lugar.nombre);
      dept.empleados_count += lugar.empleados_asignados;
    } else {
      acc.push({
        nombre: lugar.departamento,
        lugares: [lugar.nombre],
        empleados_count: lugar.empleados_asignados
      });
    }
    return acc;
  }, []) || [];

  return (
    <div>
      <h2>Departamentos</h2>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Lugares de Trabajo</th>
              <th>Empleados Asignados</th>
            </tr>
          </thead>
          <tbody>
            {departamentos.map((dept, index) => (
              <tr key={index}>
                <td>{dept.nombre}</td>
                <td>{dept.lugares.join(', ')}</td>
                <td>{dept.empleados_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DepartmentTab;