export interface UkRegionRef {
  id: number;
  shortName: string;
  dnoRegion: string;
  /** Approximate centroid, used only for nearest-region geolocation matching. */
  lat: number;
  lon: number;
}

/** Static reference for the 14 GB DNO license areas (regionid 1-14 from the Carbon Intensity API). */
export const UK_REGIONS: UkRegionRef[] = [
  { id: 1, shortName: "North Scotland", dnoRegion: "Scottish Hydro Electric Power Distribution", lat: 57.4, lon: -4.7 },
  { id: 2, shortName: "South Scotland", dnoRegion: "SP Distribution", lat: 55.6, lon: -3.9 },
  { id: 3, shortName: "North West England", dnoRegion: "Electricity North West", lat: 53.8, lon: -2.7 },
  { id: 4, shortName: "North East England", dnoRegion: "NPG North East", lat: 54.9, lon: -1.6 },
  { id: 5, shortName: "Yorkshire", dnoRegion: "NPG Yorkshire", lat: 53.8, lon: -1.5 },
  { id: 6, shortName: "North Wales & Merseyside", dnoRegion: "SP Manweb", lat: 53.2, lon: -3.2 },
  { id: 7, shortName: "South Wales", dnoRegion: "WPD South Wales", lat: 51.6, lon: -3.4 },
  { id: 8, shortName: "West Midlands", dnoRegion: "WPD West Midlands", lat: 52.5, lon: -2.0 },
  { id: 9, shortName: "East Midlands", dnoRegion: "WPD East Midlands", lat: 52.9, lon: -1.1 },
  { id: 10, shortName: "East England", dnoRegion: "UKPN East", lat: 52.3, lon: 0.5 },
  { id: 11, shortName: "South West England", dnoRegion: "WPD South West", lat: 50.9, lon: -3.6 },
  { id: 12, shortName: "South England", dnoRegion: "SSE South", lat: 50.9, lon: -1.4 },
  { id: 13, shortName: "London", dnoRegion: "UKPN London", lat: 51.5, lon: -0.12 },
  { id: 14, shortName: "South East England", dnoRegion: "UKPN South East", lat: 51.2, lon: 0.5 },
];

function haversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

/**
 * Approximates the DNO region for a coordinate by nearest centroid. The Carbon
 * Intensity API only resolves regions by postcode, and browser geolocation only
 * gives coordinates, so this is a best-effort match rather than an authoritative lookup.
 */
export function findNearestRegion(lat: number, lon: number): UkRegionRef {
  return UK_REGIONS.reduce((closest, region) =>
    haversineDistanceKm(lat, lon, region.lat, region.lon) <
    haversineDistanceKm(lat, lon, closest.lat, closest.lon)
      ? region
      : closest
  );
}
