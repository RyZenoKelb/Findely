export interface LatLng {
  lat: number;
  lng: number;
}

export interface GeoCircle {
  center: LatLng;
  radiusKm: number;
}

export interface GeoPolygon {
  points: LatLng[];
}

export type GeoZone =
  | { type: "radius"; circle: GeoCircle }
  | { type: "polygon"; polygon: GeoPolygon };

export function pointInCircle(point: LatLng, circle: GeoCircle): boolean {
  const dist = haversineKm(point, circle.center);
  return dist <= circle.radiusKm;
}

export function pointInPolygon(point: LatLng, polygon: GeoPolygon): boolean {
  const { points } = polygon;
  if (points.length < 3) return false;

  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const xi = points[i].lat;
    const yi = points[i].lng;
    const xj = points[j].lat;
    const yj = points[j].lng;

    const intersect =
      yi > point.lng !== yj > point.lng &&
      point.lat < ((xj - xi) * (point.lng - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

export function pointInZone(point: LatLng, zone: GeoZone): boolean {
  if (zone.type === "radius") return pointInCircle(point, zone.circle);
  return pointInPolygon(point, zone.polygon);
}

export function haversineKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h =
    sinLat * sinLat +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinLng * sinLng;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function circleAreaKm2(radiusKm: number): number {
  return Math.PI * radiusKm * radiusKm;
}

export function polygonAreaKm2(points: LatLng[]): number {
  if (points.length < 3) return 0;
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    area +=
      toRad(points[j].lng - points[i].lng) *
      (2 + Math.sin(toRad(points[i].lat)) + Math.sin(toRad(points[j].lat)));
  }
  area = (area * 6371 * 6371) / 2;
  return Math.abs(area);
}
