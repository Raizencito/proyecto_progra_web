import React, { useState, useEffect } from 'react';
import { useEmpleados } from '../../hooks/useEmpleados';
import { departamentoService } from '../../services/departamentoService'; // ← NUEVO

const MapFilters = ({ onFiltersChange }) => {
  const { data: empleados, loading: empleadosLoading } = useEmpleados();
  const [departamentos, setDepartamentos] = useState([]);
  const [loadingDeptos, setLoadingDeptos] = useState(true);
  const [filters, setFilters] = useState({
    departamento: '',
    mostrarGeocercas: true,
    empleado: '',
    buscarTexto: ''
  });

  // Cargar departamentos desde la API
  useEffect(() => {
    const loadDepartamentos = async () => {
      try {
        setLoadingDeptos(true);
        console.log('🏢 Cargando departamentos...');
        
        // INTENTAR CON EL NUEVO SERVICIO
        try {
          const deptosData = await departamentoService.getDepartamentos();
          console.log('✅ Departamentos cargados:', deptosData);
          setDepartamentos(deptosData.map(d => d.nombre));
        } catch (error) {
          console.log('⚠️ Falló servicio departamentos, intentando alternativa...');
          // Alternativa: extraer de empleados
          if (empleados && empleados.length > 0) {
            const deptosFromEmpleados = [...new Set(empleados.map(emp => emp.departamento))].filter(Boolean);
            console.log('✅ Departamentos de empleados:', deptosFromEmpleados);
            setDepartamentos(deptosFromEmpleados);
          }
        }
        
      } catch (error) {
        console.error('❌ Error cargando departamentos:', error);
        setDepartamentos([]);
      } finally {
        setLoadingDeptos(false);
      }
    };

    if (empleados) {
      loadDepartamentos();
    }
  }, [empleados]);

  // Emitir cambios de filtros
  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Obtener lista de empleados para el select
  const empleadosOptions = empleados?.map(emp => ({
    value: emp.id,
    label: `${emp.nombres} ${emp.paterno}`
  })) || [];

  if (empleadosLoading || loadingDeptos) {
    return (
      <div className="map-filters">
        <h3>Filtros</h3>
        <div className="filter-loading">
          <i className="fas fa-spinner fa-spin"></i>
          Cargando filtros...
        </div>
      </div>
    );
  }

  return (
    <div className="map-filters">
      <div className="filters-header">
        <h3>
          <i className="fas fa-filter"></i>
          Filtros
        </h3>
      </div>
      
      {/* FILTRO A: Departamento */}
      <div className="filter-group">
        <label className="filter-label">
          <i className="fas fa-building"></i>
          Departamento:
        </label>
        <select 
          value={filters.departamento} 
          onChange={(e) => handleFilterChange('departamento', e.target.value)}
          className="filter-select"
        >
          <option value="">Todos los departamentos</option>
          {departamentos.map(depto => (
            <option key={depto} value={depto}>{depto}</option>
          ))}
        </select>
        {departamentos.length === 0 && (
          <small style={{color: '#ef4444', marginTop: '0.5rem', display: 'block'}}>
            No se pudieron cargar los departamentos
          </small>
        )}
      </div>
      
      {/* FILTRO C: Buscar empleado */}
      <div className="filter-group">
        <label className="filter-label">
          <i className="fas fa-search"></i>
          Buscar empleado:
        </label>
        <input 
          type="text" 
          placeholder="Nombre o apellido..."
          value={filters.buscarTexto}
          onChange={(e) => handleFilterChange('buscarTexto', e.target.value)}
          className="filter-input"
        />
      </div>

      {/* FILTRO C: Selector de empleado específico */}
      <div className="filter-group">
        <label className="filter-label">
          <i className="fas fa-user"></i>
          Empleado específico:
        </label>
        <select 
          value={filters.empleado} 
          onChange={(e) => handleFilterChange('empleado', e.target.value)}
          className="filter-select"
        >
          <option value="">Todos los empleados</option>
          {empleadosOptions.map(emp => (
            <option key={emp.value} value={emp.value}>{emp.label}</option>
          ))}
        </select>
      </div>
      
      {/* FILTRO B: Mostrar/ocultar geocercas */}
      <div className="filter-group">
        <label className="filter-checkbox">
          <input 
            type="checkbox" 
            checked={filters.mostrarGeocercas}
            onChange={(e) => handleFilterChange('mostrarGeocercas', e.target.checked)}
          />
          <span className="checkmark"></span>
          <i className="fas fa-map-marker-alt"></i>
          Mostrar Geocercas
        </label>
      </div>

      {/* Botón para limpiar filtros */}
      <div className="filter-actions">
        <button 
          onClick={() => setFilters({
            departamento: '',
            mostrarGeocercas: true,
            empleado: '',
            buscarTexto: ''
          })}
          className="btn-clear-filters"
        >
          <i className="fas fa-times"></i>
          Limpiar Filtros
        </button>
      </div>

      {/* Contador de resultados */}
      <div className="filter-results">
        <small>
          {empleados?.length || 0} empleados • {departamentos.length} departamentos
        </small>
      </div>
    </div>
  );
};

export default MapFilters;