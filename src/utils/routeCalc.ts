import {
  MALACCA_ROUTE,
  SUNDA_ROUTE,
  ATLANTIC_SUEZ_ROUTE,
  GULF_ROUTE,
  OMAN_ROUTE,
  RED_SEA_SOUTH_ROUTE,
  NINE_DEGREE_CHANNEL_WAYPOINT,
  SOUTH_OF_SRI_LANKA_WAYPOINT,
  BAY_OF_BENGAL_APPROACH_WAYPOINT,
  WEST_OF_SAURASHTRA_WAYPOINT,
  LngLat
} from '../data/seaRoutes';

// Real approximate coordinates for the load/discharge ports offered in the New Analysis
// wizard's dropdowns — not all of these exist in vesselTrackingData's portMapLocations
// (e.g. Gladstone, Hay Point, Richards Bay aren't tracked live ports), so they're kept
// local to this module rather than forcing an unrelated dataset to grow.
export const LOADING_PORT_COORDS: Record<string, LngLat> = {
  Newcastle: [151.78, -32.92],
  Gladstone: [151.26, -23.84],
  'Hay Point': [149.28, -21.27],
  Taboneo: [114.47, -3.72],
  'Richards Bay': [32.08, -28.78],
  'Jorf Lasfar': [-8.63, 33.12],
  'Ras Al Khair': [49.85, 27.05],
  Sohar: [56.61, 24.35],
  Aqaba: [35.0, 29.53]
};

export const DISCHARGE_PORT_COORDS: Record<string, LngLat> = {
  Paradip: [86.67, 20.26],
  Visakhapatnam: [83.28, 17.68],
  Gangavaram: [83.24, 17.62],
  Haldia: [88.06, 22.02],
  Gopalpur: [84.86, 19.26],
  Mundra: [69.72, 22.84],
  Kandla: [70.22, 23.03],
  Mormugao: [73.80, 15.42]
};

// India's east and west coasts only connect by sea via the south (around Sri Lanka) — a
// discharge port on the opposite coast from whichever side the route approaches on needs the
// Sri Lanka detour instead of a straight line across the subcontinent.
const WEST_COAST_DISCHARGE_PORTS = new Set(['Mundra', 'Kandla', 'Mormugao']);
// The Saurashtra peninsula juts out far enough that only the Gulf-of-Kutch ports need the
// extra clearing waypoint — Mormugao (further south, in Goa) clears without it.
const GUJARAT_DISCHARGE_PORTS = new Set(['Mundra', 'Kandla']);

export const STEAMING_SPEED_KTS = 12.5; // typical laden Panamax/Capesize bulker

// Tail appended when arriving from the Bay of Bengal side (SE Asia/Australia) but the
// destination is on India's west coast: south past Sri Lanka, through the Nine Degree
// Channel, then (for Gujarat ports specifically) around the Saurashtra peninsula.
function eastToWestTail(dest: LngLat, isGujarat: boolean): LngLat[] {
  return isGujarat
    ? [SOUTH_OF_SRI_LANKA_WAYPOINT, NINE_DEGREE_CHANNEL_WAYPOINT, WEST_OF_SAURASHTRA_WAYPOINT, dest]
    : [SOUTH_OF_SRI_LANKA_WAYPOINT, NINE_DEGREE_CHANNEL_WAYPOINT, dest];
}

// Tail appended when arriving from the Arabian Sea side (Middle East/Red Sea/Africa via Suez)
// but the destination is on India's east coast: through the Nine Degree Channel, south past
// Sri Lanka, then up into the Bay of Bengal.
function westToEastTail(dest: LngLat): LngLat[] {
  return [NINE_DEGREE_CHANNEL_WAYPOINT, SOUTH_OF_SRI_LANKA_WAYPOINT, BAY_OF_BENGAL_APPROACH_WAYPOINT, dest];
}

// Reuses the same curated open-water waypoints as the live tactical map (src/data/seaRoutes.ts)
// so any consumer threads the real straits instead of a straight line cutting across Indonesia,
// Madagascar, or (for the Bay-of-Bengal/Arabian-Sea crossover case) India itself — only the
// first/last point is swapped for whichever exact berth is selected.
export function buildRoute(loadingPort: string, dischargePort: string): LngLat[] {
  const origin = LOADING_PORT_COORDS[loadingPort] ?? MALACCA_ROUTE[0];
  const dest = DISCHARGE_PORT_COORDS[dischargePort] ?? MALACCA_ROUTE[MALACCA_ROUTE.length - 1];
  const isWestCoastDest = WEST_COAST_DISCHARGE_PORTS.has(dischargePort);
  const isGujaratDest = GUJARAT_DISCHARGE_PORTS.has(dischargePort);

  if (loadingPort === 'Jorf Lasfar') {
    const tail: LngLat[] = isWestCoastDest ? [dest] : westToEastTail(dest);
    return [origin, ...ATLANTIC_SUEZ_ROUTE.slice(1), ...tail];
  }
  if (loadingPort === 'Ras Al Khair') {
    const tail: LngLat[] = isWestCoastDest ? [dest] : westToEastTail(dest);
    return [origin, ...GULF_ROUTE.slice(1), ...tail];
  }
  if (loadingPort === 'Sohar') {
    const tail: LngLat[] = isWestCoastDest ? [dest] : westToEastTail(dest);
    return [origin, ...OMAN_ROUTE.slice(1), ...tail];
  }
  if (loadingPort === 'Aqaba') {
    const tail: LngLat[] = isWestCoastDest ? [dest] : westToEastTail(dest);
    return [origin, ...RED_SEA_SOUTH_ROUTE.slice(1), ...tail];
  }
  if (loadingPort === 'Taboneo') {
    const tail: LngLat[] = isWestCoastDest ? eastToWestTail(dest, isGujaratDest) : [dest];
    return [origin, ...SUNDA_ROUTE.slice(1, -1), ...tail];
  }
  if (loadingPort === 'Richards Bay') {
    // South of Madagascar into the central Indian Ocean — clears the island entirely, and
    // already approaches India from the west so no Sri Lanka detour is needed either way.
    // Gulf-of-Kutch ports still need the Saurashtra-clearing waypoint, same as other origins.
    const tail: LngLat[] = isGujaratDest ? [WEST_OF_SAURASHTRA_WAYPOINT, dest] : [dest];
    return [origin, [50, -32], [80, -15], ...tail];
  }
  // Australia east-coast berths (Newcastle / Gladstone / Hay Point) share the standard
  // Coral Sea -> Torres Strait -> Arafura/Banda/Makassar -> Malacca track.
  const tail: LngLat[] = isWestCoastDest ? eastToWestTail(dest, isGujaratDest) : [dest];
  return [origin, ...MALACCA_ROUTE.slice(1, -1), ...tail];
}

// The named chokepoints a given loading/discharge pair actually transits — mirrors the same
// branching as buildRoute() above, reused so any UI listing "featured straits" for the current
// corridor (e.g. the Overview page's corridor card) shows the real ones instead of a fixed
// Malacca-corridor list that doesn't apply once the origin/destination changes.
export function getRouteChokepoints(loadingPort: string, dischargePort: string): string[] {
  const isWestCoastDest = WEST_COAST_DISCHARGE_PORTS.has(dischargePort);
  const crossesSriLanka = ['Newcastle', 'Gladstone', 'Hay Point', 'Taboneo'].includes(loadingPort)
    ? isWestCoastDest
    : ['Jorf Lasfar', 'Ras Al Khair', 'Sohar', 'Aqaba'].includes(loadingPort)
    ? !isWestCoastDest
    : false;
  const crossover = crossesSriLanka ? ['nine_degree_channel'] : [];

  switch (loadingPort) {
    case 'Jorf Lasfar':
      return ['strait_of_gibraltar', 'suez_canal', 'bab_el_mandeb', ...crossover];
    case 'Ras Al Khair':
      return ['strait_of_hormuz', ...crossover];
    case 'Sohar':
      return [...crossover];
    case 'Aqaba':
      return ['bab_el_mandeb', ...crossover];
    case 'Taboneo':
      return ['sunda_strait', ...crossover];
    case 'Richards Bay':
      return [];
    default:
      // Newcastle / Gladstone / Hay Point — standard Malacca corridor
      return ['torres_strait', 'malacca_tss', 'singapore_strait', ...crossover];
  }
}

export function haversineNM(a: LngLat, b: LngLat): number {
  const R_KM = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b[1] - a[1]);
  const dLng = toRad(b[0] - a[0]);
  const lat1 = toRad(a[1]);
  const lat2 = toRad(b[1]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return (R_KM * c) / 1.852;
}

export function routeDistanceNM(route: LngLat[]): number {
  let total = 0;
  for (let i = 1; i < route.length; i++) total += haversineNM(route[i - 1], route[i]);
  return total;
}
