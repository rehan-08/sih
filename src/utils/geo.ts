import worldLandRings from '../data/worldLandRings.json';

// Natural Earth 110m land coastlines (public domain), pre-flattened at build time into
// plain [lng, lat] rings (one per landmass/island, outer ring only — no holes at this
// resolution). Used by both the 3D globe (canvas texture) and the 2D tactical map (SVG)
// so coastlines are accurate and consistent everywhere instead of hand-drawn approximations.
export type LandRing = Array<[number, number]>;

export function getLandRings(): LandRing[] {
  return worldLandRings as LandRing[];
}

let simplifiedCache: LandRing[] | null = null;

// A decimated variant for SVG contexts (2D tactical map, route passage plot). The full
// 5,000+ point dataset is fine as a one-time canvas raster (3D globe texture) but is
// unnecessarily heavy to paint as live vector <path> geometry — this cuts point count by
// ~3x while keeping coastlines clearly recognizable at the small sizes these maps render at.
export function getSimplifiedLandRings(step: number = 3, minRingPoints: number = 4): LandRing[] {
  if (simplifiedCache) return simplifiedCache;
  simplifiedCache = getLandRings()
    .map(ring => ring.filter((_, i) => i % step === 0))
    .filter(ring => ring.length >= minRingPoints);
  return simplifiedCache;
}
