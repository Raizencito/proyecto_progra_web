import React from 'react';
import { useEmpleados } from '../../hooks/useEmpleados';

const EmployeesPanel = () => {
  const { data: empleados, loading, error } = useEmpleados();

  if (loading) return <div>Cargando empleados...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="employees-panel">
      <h3>Empleados</h3>
      <div className="employees-list">
        {empleados?.map(empleado => (
          <div key={empleado.id} className="employee-item">
            <div className="employee-info">
              <strong>{empleado.nombres} {empleado.paterno}</strong>
              <div>{empleado.departamento} - {empleado.lugar_trabajo}</div>
            </div>
            <div className={`employee-status status-${empleado.ultimo_estado}`}></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmployeesPanel;