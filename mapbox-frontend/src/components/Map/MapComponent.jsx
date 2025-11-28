import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { lugarService } from '../../services/lugarService';
import { getPredefinedGeocerca } from '../../utils/geoUtils';
import { empleadoService } from '../../services/empleadoService';

// Configurar Mapbox
const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;
mapboxgl.accessToken = mapboxToken;

const MapComponent = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [lugares, setLugares] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [empleadosConUbicacion, setEmpleadosConUbicacion] = useState([]);
  const initialized = useRef(false);

  // Cargar lugares con geocercas
  useEffect(() => {
    const loadLugares = async () => {
      try {
        console.log('🏢 Cargando lugares de trabajo...');
        const lugaresData = await lugarService.getLugares();
        console.log('✅ Lugares cargados:', lugaresData);
        setLugares(lugaresData);
      } catch (error) {
        console.error('❌ Error cargando lugares:', error);
      }
    };

    loadLugares();
  }, []);

  // Cargar empleados
  useEffect(() => {
    const loadEmpleados = async () => {
      try {
        console.log('👥 Cargando empleados...');
        const empleadosData = await empleadoService.getEmpleados();
        console.log('✅ Empleados cargados:', empleadosData);
        setEmpleados(empleadosData);
        
        // Simular ubicaciones para los empleados
        const empleadosConUbicacionSimulada = empleadosData.map(empleado => ({
          ...empleado,
          ubicacion: getUbicacionSimulada(empleado.lugar_trabajo)
        }));
        
        setEmpleadosConUbicacion(empleadosConUbicacionSimulada);
        
      } catch (error) {
        console.error('❌ Error cargando empleados:', error);
      }
    };

    loadEmpleados();
  }, []);

  // Función para obtener ubicación simulada basada en el lugar de trabajo
  const getUbicacionSimulada = (lugarTrabajo) => {
    const ubicaciones = {
      'Sede Central La Paz': { lng: -68.150, lat: -16.498 },
      'Planta Cochabamba': { lng: -66.162, lat: -17.397 },
      'Oficina Santa Cruz': { lng: -63.184, lat: -17.780 }
    };
    
    return ubicaciones[lugarTrabajo] || { lng: -64.75, lat: -16.50 };
  };

  // Función para obtener el color del marcador según el estado
  const getMarkerColor = (estado) => {
    switch (estado) {
      case 'dentro':
        return '#10B981'; // Verde
      case 'fuera':
        return '#EF4444'; // Rojo
      default:
        return '#6B7280'; // Gris
    }
  };

  // Función para obtener el icono según el estado
  const getMarkerIcon = (estado) => {
    switch (estado) {
      case 'dentro':
        return 'fa-check-circle';
      case 'fuera':
        return 'fa-exclamation-triangle';
      default:
        return 'fa-user';
    }
  };

  // Función para agregar marcadores de empleados al mapa
  // Función para agregar marcadores de empleados al mapa (VERSIÓN CORREGIDA)
const addEmployeeMarkers = () => {
  if (!map.current || empleadosConUbicacion.length === 0) return;

  console.log('📍 Agregando marcadores de empleados...');

  // Limpiar marcadores anteriores
  const existingMarkers = document.querySelectorAll('.employee-marker');
  existingMarkers.forEach(marker => marker.remove());

  // Agregar marcadores para cada empleado
  empleadosConUbicacion.forEach(empleado => {
    if (!empleado.ubicacion) return;

    // Crear elemento HTML personalizado para el marcador
    const markerEl = document.createElement('div');
    markerEl.className = 'employee-marker';
    markerEl.innerHTML = `
      <div class="marker-content" style="
        background-color: ${getMarkerColor(empleado.ultimo_estado)};
      ">
        <i class="fas ${getMarkerIcon(empleado.ultimo_estado)}"></i>
      </div>
    `;

    // Crear y agregar el marcador
    const marker = new mapboxgl.Marker(markerEl)
      .setLngLat([empleado.ubicacion.lng, empleado.ubicacion.lat])
      .setPopup(new mapboxgl.Popup({ 
        offset: 25,
        className: 'employee-popup'
      }).setHTML(`
        <div style="padding: 12px; min-width: 220px; font-family: Arial, sans-serif;">
          <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 16px; border-bottom: 2px solid ${getMarkerColor(empleado.ultimo_estado)}; padding-bottom: 4px;">
            ${empleado.nombres} ${empleado.paterno}
          </h3>
          <p style="margin: 6px 0; font-size: 14px; color: #4b5563;">
            <strong style="color: #374151;">CI:</strong> ${empleado.ci}
          </p>
          <p style="margin: 6px 0; font-size: 14px; color: #4b5563;">
            <strong style="color: #374151;">Teléfono:</strong> ${empleado.telefono || 'N/A'}
          </p>
          <p style="margin: 6px 0; font-size: 14px; color: #4b5563;">
            <strong style="color: #374151;">Lugar:</strong> ${empleado.lugar_trabajo}
          </p>
          <p style="margin: 6px 0; font-size: 14px;">
            <strong style="color: #374151;">Estado:</strong> 
            <span style="color: ${getMarkerColor(empleado.ultimo_estado)}; font-weight: bold; margin-left: 4px;">
              ${empleado.ultimo_estado === 'dentro' ? '✅ Dentro' : '❌ Fuera'}
            </span>
          </p>
        </div>
      `))
      .addTo(map.current);

    markerEl.addEventListener('mouseenter', () => {
      markerEl.classList.add('marker-hover');
    });

    markerEl.addEventListener('mouseleave', () => {
      markerEl.classList.remove('marker-hover');
    });
  });

  console.log(`✅ ${empleadosConUbicacion.length} marcadores de empleados agregados`);
};

  // Función para dibujar geocercas (la que ya teníamos)
  const drawGeocercas = () => {
  if (!map.current || lugares.length === 0) return;

  console.log('🎨 Dibujando geocercas...');

  try {
    // Crear GeoJSON con las geocercas
    const geocercasGeoJSON = {
      type: 'FeatureCollection',
      features: lugares.map(lugar => {
        const geocerca = getPredefinedGeocerca(lugar.nombre);
        
        return {
          type: 'Feature',
          geometry: geocerca,
          properties: {
            id: lugar.id,
            nombre: lugar.nombre,
            departamento: lugar.departamento,
            empleados_asignados: lugar.empleados_asignados
          }
        };
      }).filter(feature => feature.geometry !== null)
    };

    console.log('📐 GeoJSON creado:', geocercasGeoJSON);

    // Limpiar capas anteriores si existen
    if (map.current.getSource('geocercas')) {
      map.current.removeLayer('geocercas-fill');
      map.current.removeLayer('geocercas-border');
      map.current.removeSource('geocercas');
    }

    // Agregar fuente al mapa
    map.current.addSource('geocercas', {
      type: 'geojson',
      data: geocercasGeoJSON
    });

    // Capa de relleno para geocercas
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

    // Capa de borde para geocercas
    map.current.addLayer({
      id: 'geocercas-border',
      type: 'line',
      source: 'geocercas',
      paint: {
        'line-color': '#1d4ed8',
        'line-width': 2
      }
    });

    // Popup al hacer click en geocerca
    map.current.on('click', 'geocercas-fill', (e) => {
      const feature = e.features[0];
      console.log('📍 Click en geocerca:', feature.properties.nombre);
      
      new mapboxgl.Popup()
        .setLngLat(e.lngLat)
        .setHTML(`
          <div style="padding: 12px; min-width: 220px; font-family: Arial, sans-serif;">
            <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 16px; border-bottom: 2px solid #3b82f6; padding-bottom: 4px;">
              ${feature.properties.nombre}
            </h3>
            <p style="margin: 6px 0; font-size: 14px; color: #4b5563;">
              <strong style="color: #374151;">Departamento:</strong> ${feature.properties.departamento}
            </p>
            <p style="margin: 6px 0; font-size: 14px; color: #4b5563;">
              <strong style="color: #374151;">Empleados:</strong> ${feature.properties.empleados_asignados || 0}
            </p>
          </div>
        `)
        .addTo(map.current);
    });

    // Cambiar cursor al hover
    map.current.on('mouseenter', 'geocercas-fill', () => {
      if (map.current) {
        map.current.getCanvas().style.cursor = 'pointer';
      }
    });

    map.current.on('mouseleave', 'geocercas-fill', () => {
      if (map.current) {
        map.current.getCanvas().style.cursor = '';
      }
    });

    console.log('✅ Geocercas dibujadas correctamente');

  } catch (error) {
    console.error('❌ Error dibujando geocercas:', error);
  }
};

  // Dibujar geocercas y marcadores cuando el mapa esté listo
  useEffect(() => {
    if (mapLoaded) {
      if (lugares.length > 0) {
        drawGeocercas();
      }
      if (empleadosConUbicacion.length > 0) {
        addEmployeeMarkers();
      }
    }
  }, [mapLoaded, lugares, empleadosConUbicacion]);

  // Inicialización del mapa (código anterior que ya funciona)
  useEffect(() => {
    if (initialized.current || !mapContainer.current) return;

    console.log('🗺️ Inicializando mapa...');

    if (!mapboxToken) {
      setError('Token de Mapbox no configurado');
      return;
    }

    try {
      initialized.current = true;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [-64.75, -16.50],
        zoom: 5,
        attributionControl: true
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      map.current.on('load', () => {
        console.log('🎉 ¡Mapa cargado correctamente!');
        setMapLoaded(true);
      });

      map.current.on('error', (e) => {
        console.error('❌ Error en mapa:', e);
        setError('Error: ' + (e.error?.message || 'Desconocido'));
      });

    } catch (err) {
      console.error('💥 Error crítico:', err);
      setError('Error crítico: ' + err.message);
    }

    return () => {
      console.log('🧹 Cleanup: desmontando componente mapa');
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
      initialized.current = false;
    };
  }, []);

  // DEBUG
  console.log('📊 Estado - Empleados:', empleadosConUbicacion.length, 'MapLoaded:', mapLoaded);

  if (error) {
    return (
      <div style={{
        height: '400px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#fee2e2',
        border: '2px dashed #dc2626',
        borderRadius: '8px',
        color: '#dc2626',
        textAlign: 'center',
        padding: '2rem'
      }}>
        <div>
          <i className="fas fa-exclamation-triangle fa-2x" style={{ marginBottom: '1rem' }}></i>
          <h3 style={{ margin: '0 0 0.5rem 0' }}>Error al cargar el mapa</h3>
          <p style={{ margin: '0 0 0.5rem 0' }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={mapContainer} 
      style={{ 
        height: '100%', 
        width: '100%',
        minHeight: '500px',
        borderRadius: '8px',
        overflow: 'hidden',
        background: mapLoaded ? 'transparent' : '#f3f4f6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: mapLoaded ? 'flex-start' : 'center',
        border: mapLoaded ? '1px solid #e5e7eb' : '2px dashed #d1d5db',
        color: '#6b7280',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}
    >
      {!mapLoaded && (
        <div style={{ textAlign: 'center' }}>
          <i className="fas fa-spinner fa-spin fa-2x" style={{ marginBottom: '1rem' }}></i>
          <p style={{ margin: '0 0 0.25rem 0', fontWeight: 'bold' }}>Cargando mapa...</p>
          <small>Cargando empleados y geocercas...</small>
        </div>
      )}
    </div>
  );
};

export default MapComponent;