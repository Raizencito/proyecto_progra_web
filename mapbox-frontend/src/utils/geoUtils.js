// Utilidades para conversión geoespacial
export const geoUtils = {
  // Convertir WKB hexadecimal a GeoJSON
  wkbToGeoJSON: (wkbHex) => {
    if (!wkbHex) return null;
    
    try {
      // Para POLYGON en WKB (formato de PostGIS)
      // En una aplicación real usaríamos una librería como wkx
      // Por ahora, vamos a crear GeoJSON manualmente basado en las coordenadas
      
      // Extraer coordenadas del WKB (simplificado para este ejemplo)
      // Nota: En producción deberías usar una librería como wkx o turf.js
      const coords = extractCoordinatesFromWKB(wkbHex);
      
      if (coords && coords.length > 0) {
        return {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [coords]
          },
          properties: {}
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error convirtiendo WKB a GeoJSON:', error);
      return null;
    }
  },
  
  // Función simplificada para extraer coordenadas (para demo)
  // En producción usa: npm install wkx
  extractCoordinatesFromWKB: (wkbHex) => {
    // Esta es una versión simplificada para el formato específico de tu data
    // Los primeros bytes indican el tipo de geometría (Polygon)
    // Luego vienen las coordenadas en little-endian
    
    try {
      // Para este ejemplo, vamos a usar coordenadas fijas basadas en el lugar
      // En una app real, implementarías el parsing completo del WKB
      console.log('📐 Procesando WKB:', wkbHex.substring(0, 50) + '...');
      
      // Por ahora, retornar coordenadas de ejemplo para La Paz
      return [
        [-68.152, -16.500],
        [-68.148, -16.500],
        [-68.148, -16.496],
        [-68.152, -16.496],
        [-68.152, -16.500] // Cerrar el polígono
      ];
      
    } catch (error) {
      console.error('Error extrayendo coordenadas:', error);
      return null;
    }
  }
};

// Función alternativa: usar coordenadas predefinidas por nombre de lugar
export const getPredefinedGeocerca = (nombreLugar) => {
  const geocercas = {
    'Sede Central La Paz': {
      type: 'Polygon',
      coordinates: [[
        [-68.152, -16.500],
        [-68.148, -16.500],
        [-68.148, -16.496],
        [-68.152, -16.496],
        [-68.152, -16.500]
      ]]
    },
    'Planta Cochabamba': {
      type: 'Polygon',
      coordinates: [[
        [-66.165, -17.400],
        [-66.160, -17.400],
        [-66.160, -17.395],
        [-66.165, -17.395],
        [-66.165, -17.400]
      ]]
    },
    'Oficina Santa Cruz': {
      type: 'Polygon', 
      coordinates: [[
        [-63.187, -17.783],
        [-63.182, -17.783],
        [-63.182, -17.778],
        [-63.187, -17.778],
        [-63.187, -17.783]
      ]]
    }
  };
  
  return geocercas[nombreLugar] || null;
};