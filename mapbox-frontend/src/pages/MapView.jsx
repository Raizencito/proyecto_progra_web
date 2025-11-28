import React, { useState } from 'react';
import Sidebar from '../components/Layout/Sidebar';
import MapComponent from '../components/Map/MapComponent';
import MapFilters from '../components/Map/MapFilters';
import EmployeesPanel from '../components/Map/EmployeesPanel';
import { useAuth } from '../context/AuthContext';

const MapView = () => {
  const { user } = useAuth();
  const [filters, setFilters] = useState({
    departamento: '',
    mostrarGeocercas: true,
    empleado: '',
    buscarTexto: ''
  });

  const handleFiltersChange = (newFilters) => {
    console.log('🔧 Filtros actualizados:', newFilters);
    setFilters(newFilters);
  };

  return (
    <div className="app-container">
      <Sidebar />
      
      <div className="main-content">
        <header className="content-header">
          <h1>Mapa en Tiempo Real</h1>
          <div className="user-info">
            <span>{user?.nombres} {user?.paterno}</span>
            <i className="fas fa-user-circle"></i>
          </div>
        </header>

        <div className="content map-content">
          <div className="map-layout">
            {/* Panel de filtros */}
            <div className="filters-panel">
              <MapFilters onFiltersChange={handleFiltersChange} />
              <EmployeesPanel filters={filters} />
            </div>
            
            {/* Mapa principal */}
            <div className="map-panel">
              <MapComponent filters={filters} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;