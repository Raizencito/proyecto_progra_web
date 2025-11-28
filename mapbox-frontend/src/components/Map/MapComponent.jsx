import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import { lugarService } from '../../services/lugarService';
import { empleadoService } from '../../services/empleadoService';

const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;
mapboxgl.accessToken = mapboxToken;

const MapComponent = ({ mode = 'view', selectedLugar = null, onGeocercaSaved = null }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const draw = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [lugares, setLugares] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [currentGeocerca, setCurrentGeocerca] = useState(null);

  // 1. INICIALIZACIÓN BÁSICA DEL MAPA
  useEffect(() => {
    if (!mapContainer.current) return;

    console.log('🗺️ Inicializando mapa...');

    if (!mapboxToken) {
      setError('Token de Mapbox no configurado');
      return;
    }

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [-64.75, -16.50],
        zoom: 5
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      map.current.on('load', () => {
        console.log('🎉 Mapa cargado!');
        setMapLoaded(true);
        loadLugares();
        loadEmpleados();
      });

    } catch (err) {
      console.error('Error:', err);
      setError('Error al cargar el mapa');
    }
  }, []);

  // 2. CONFIGURAR DIBUJO CUANDO EL MAPA ESTÉ LISTO
  useEffect(() => {
    if (!mapLoaded || !map.current) return;

    console.log('🎨 Configurando herramientas de dibujo...');

    const drawInstance = new MapboxDraw({
      displayControlsDefault: true,
      controls: {
        polygon: true,
        trash: true
      }
    });

    map.current.addControl(drawInstance, 'top-left');
    draw.current = drawInstance;

    // Eventos de dibujo
    map.current.on('draw.create', updateCurrentGeocerca);
    map.current.on('draw.update', updateCurrentGeocerca);
    map.current.on('draw.delete', updateCurrentGeocerca);

  }, [mapLoaded]);

  // 3. CARGAR DATOS
  const loadLugares = async () => {
    try {
      const lugaresData = await lugarService.getLugares();
      setLugares(lugaresData);
      drawGeocercas(lugaresData);
    } catch (error) {
      console.error('Error cargando lugares:', error);
    }
  };

  const loadEmpleados = async () => {
    try {
      const empleadosData = await empleadoService.getEmpleados();
      setEmpleados(empleadosData);
      addEmployeeMarkers(empleadosData);
    } catch (error) {
      console.error('Error cargando empleados:', error);
    }
  };

  // 4. DIBUJAR GEOCERCAS EXISTENTES
  const drawGeocercas = (lugaresData) => {
    if (!map.current || lugaresData.length === 0) return;

    const geocercasGeoJSON = {
      type: 'FeatureCollection',
      features: lugaresData.map(lugar => ({
        type: 'Feature',
        geometry: getGeocercaBasica(lugar.nombre),
        properties: {
          id: lugar.id,
          nombre: lugar.nombre,
          departamento: lugar.departamento
        }
      }))
    };

    // Limpiar capas anteriores
    if (map.current.getSource('geocercas')) {
      map.current.removeLayer('geocercas-fill');
      map.current.removeLayer('geocercas-border');
      map.current.removeSource('geocercas');
    }

    // Agregar nuevas capas
    map.current.addSource('geocercas', {
      type: 'geojson',
      data: geocercasGeoJSON
    });

    map.current.addLayer({
      id: 'geocercas-fill',
      type: 'fill',
      source: 'geocercas',
      paint: {
        'fill-color': '#3b82f6',
        'fill-opacity': 0.3,
        'fill-outline-color': '#1d4ed8'
      }
    });

    map.current.addLayer({
      id: 'geocercas-border',
      type: 'line',
      source: 'geocercas',
      paint: {
        'line-color': '#1d4ed8',
        'line-width': 2
      }
    });

    // Popups
    map.current.on('click', 'geocercas-fill', (e) => {
      new mapboxgl.Popup()
        .setLngLat(e.lngLat)
        .setHTML(`
          <h3>${e.features[0].properties.nombre}</h3>
          <p>${e.features[0].properties.departamento}</p>
        `)
        .addTo(map.current);
    });
  };

  // 5. AGREGAR MARCADORES DE EMPLEADOS
  const addEmployeeMarkers = (empleadosData) => {
    if (!map.current) return;

    empleadosData.forEach(empleado => {
      const ubicacion = getUbicacionSimulada(empleado.lugar_trabajo);
      
      const markerEl = document.createElement('div');
      markerEl.innerHTML = '📍';
      markerEl.style.fontSize = '24px';
      markerEl.style.cursor = 'pointer';

      new mapboxgl.Marker(markerEl)
        .setLngLat([ubicacion.lng, ubicacion.lat])
        .setPopup(new mapboxgl.Popup().setHTML(`
          <strong>${empleado.nombres} ${empleado.paterno}</strong>
          <br/>${empleado.lugar_trabajo}
          <br/>Estado: ${empleado.ultimo_estado}
        `))
        .addTo(map.current);
    });
  };

  // 6. FUNCIONES AUXILIARES
  const getGeocercaBasica = (nombreLugar) => {
    const geocercas = {
      'Sede Central La Paz': {
        type: 'Polygon',
        coordinates: [[
          [-68.152, -16.500], [-68.148, -16.500],
          [-68.148, -16.496], [-68.152, -16.496],
          [-68.152, -16.500]
        ]]
      },
      'Planta Cochabamba': {
        type: 'Polygon', 
        coordinates: [[
          [-66.165, -17.400], [-66.160, -17.400],
          [-66.160, -17.395], [-66.165, -17.395],
          [-66.165, -17.400]
        ]]
      }
    };
    return geocercas[nombreLugar] || geocercas['Sede Central La Paz'];
  };

  const getUbicacionSimulada = (lugarTrabajo) => {
    const ubicaciones = {
      'Sede Central La Paz': { lng: -68.150, lat: -16.498 },
      'Planta Cochabamba': { lng: -66.162, lat: -17.397 }
    };
    return ubicaciones[lugarTrabajo] || { lng: -64.75, lat: -16.50 };
  };

  const updateCurrentGeocerca = () => {
    if (!draw.current) return;
    const features = draw.current.getAll();
    setCurrentGeocerca(features.features.length > 0 ? features.features[0].geometry : null);
  };

  const handleSaveGeocerca = async () => {
  if (!currentGeocerca) {
    alert('Primero dibuja una geocerca!');
    return;
  }
  try {
    if (onGeocercaSaved && selectedLugar) {
      // 🔥 GUARDAR GEOCERCA REAL EN EL BACKEND
      await lugarService.updateGeocerca(selectedLugar.id, currentGeocerca);
      await onGeocercaSaved(currentGeocerca);
    }
    alert('Geocerca guardada exitosamente!');
  } catch (error) {
    console.error('Error guardando geocerca:', error);
    alert('Error guardando geocerca: ' + (error.error || 'Error del servidor'));
  }
};

  // 7. RENDER
  if (error) {
    return (
      <div style={{ padding: '20px', background: '#fee', color: '#c00' }}>
        <strong>Error:</strong> {error}
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* MAPA */}
      <div 
        ref={mapContainer} 
        style={{ 
          width: '100%', 
          height: '500px',
          border: '2px solid #ccc',
          borderRadius: '8px'
        }} 
      />

      {/* CONTROLES DE DIBUJO (solo en modo edición/creación) */}
      {mode !== 'view' && (
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: 'white',
          padding: '15px',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
          zIndex: 10
        }}>
          <h4>🎨 Controles de Geocerca</h4>
          <p>Usa los botones arriba a la izquierda para dibujar</p>
          <button 
            onClick={handleSaveGeocerca}
            disabled={!currentGeocerca}
            style={{
              background: currentGeocerca ? '#4CAF50' : '#ccc',
              color: 'white',
              border: 'none',
              padding: '10px 15px',
              borderRadius: '5px',
              cursor: currentGeocerca ? 'pointer' : 'not-allowed'
            }}
          >
            💾 Guardar Geocerca
          </button>
        </div>
      )}

      {/* ESTADO DE CARGA */}
      {!mapLoaded && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div>🔄 Cargando mapa...</div>
        </div>
      )}
    </div>
  );
};

export default MapComponent;