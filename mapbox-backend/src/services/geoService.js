import * as turf from "@turf/turf";

// Función para validar si un punto está dentro de un polígono
export const isInsideGeofence = (pointLat, pointLng, polygonCoordinates) => {
  const point = turf.point([pointLng, pointLat]);
  const polygon = turf.polygon([polygonCoordinates]);
  return turf.booleanPointInPolygon(point, polygon);
};
