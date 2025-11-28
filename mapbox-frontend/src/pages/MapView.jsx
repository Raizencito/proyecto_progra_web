import React from 'react';
import Sidebar from '../components/Layout/Sidebar';
import MapComponent from '../components/Map/MapComponent';
import MapFilters from '../components/Map/MapFilters';
import EmployeesPanel from '../components/Map/EmployeesPanel';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';

const MapView = () => {
  const { user } = useAuth();
  const location = useLocation();
  
  // 🔥 NUEVO: Detectar si venimos para editar geocerca
  const { modoGeocerca, lugarId, lugarNombre } = location.state || {};

  return (
    <div className="app-container">
      <Sidebar />
      
      <div className="main-content">
        <header className="content-header">
          <h1>
            {modoGeocerca ? `Definiendo Geocerca: ${lugarNombre}` : 'Mapa en Tiempo Real'}
          </h1>
          <div className="user-info">
            <span>{user?.nombres} {user?.paterno}</span>
            <i className="fas fa-user-circle"></i>
          </div>
        </header>

        <div className="content map-content">
          <div className="map-container">
            <MapFilters />
            {/* 🔥 Pasar props al MapComponent */}
            <MapComponent 
              mode={modoGeocerca ? "edit" : "view"}
              selectedLugar={modoGeocerca ? { id: lugarId, nombre: lugarNombre } : null}
              onGeocercaSaved={(geocerca) => {
                // Aquí llamarás a lugarService.updateGeocerca(lugarId, geocerca)
                console.log('Geocerca a guardar:', geocerca);
                alert(`Geocerca guardada para ${lugarNombre}`);
              }}
            />
            {!modoGeocerca && <EmployeesPanel />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;