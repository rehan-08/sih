// Curated intermediate waypoints, in [lng, lat] order, that keep hand-drawn shipping routes
// inside open water on a real coastline map. The old straight-line/2-3-point corridors were
// fine over a stylized illustration but visibly cut across Indonesia, Australia, and the
// Mediterranean/Red Sea once the maps switched to real basemaps — these fill the gaps with
// named open-sea passages (Arafura Sea, Banda Sea, Makassar Strait, etc.) so the line hugs
// the actual navigable route instead of shortcutting through land.
//
// Every waypoint set below has been checked against the app's own coastline data
// (worldLandRings.json) with a point-in-polygon sampler along each leg, not just eyeballed —
// see the Mediterranean/Gulf/Oman/India-crossover routes added for the round-5 port expansion.

export type LngLat = [number, number];

// Newcastle -> Torres Strait -> Indonesian archipelago -> Singapore/Malacca -> Paradip.
// The Torres-to-Singapore leg is the single biggest offender (a direct line crosses
// Sulawesi/Borneo/Java) — threaded through Arafura Sea, Banda Sea, and Makassar Strait instead.
export const MALACCA_ROUTE: LngLat[] = [
  [151.78, -32.92], // Newcastle
  [158.0, -18.0],   // Coral Sea
  [142.15, -10.55], // Torres Strait
  [133.0, -8.0],    // Arafura Sea
  [124.0, -6.0],    // Banda Sea
  [119.0, -1.0],    // Makassar Strait
  [113.0, 3.0],     // South China Sea (south)
  [103.85, 1.29],   // Singapore Strait
  [101.0, 2.85],    // Malacca Strait TSS
  [97.0, 6.0],      // Andaman Sea
  [88.0, 14.0],     // Bay of Bengal
  [86.67, 20.26]    // Paradip
];

// Deep-water Capesize alternative: south of Australia, up the WA coast offshore, into the
// Indian Ocean via Lombok Strait (avoids the Malacca draft restriction entirely).
export const LOMBOK_ROUTE: LngLat[] = [
  [151.78, -32.92], // Newcastle
  [148.0, -40.0],   // Tasman Sea (south of Australia)
  [115.0, -40.0],   // Great Australian Bight
  [105.0, -22.0],   // offshore Western Australia
  [113.0, -11.0],   // approach to Lombok from the south
  [115.75, -8.75],  // Lombok Strait
  [100.0, -3.0],    // Indian Ocean, west of Sumatra
  [88.0, 10.0],     // Bay of Bengal
  [86.67, 20.26]    // Paradip
];

// Sunda Strait alternative from the Taboneo/Kalimantan anchorages.
export const SUNDA_ROUTE: LngLat[] = [
  [114.47, -3.72],  // Taboneo
  [108.0, -6.5],    // Java Sea
  [105.75, -5.92],  // Sunda Strait
  [95.0, 2.0],      // Indian Ocean
  [86.67, 20.26]    // Paradip
];

// Shared Eastern Mediterranean -> Suez -> Red Sea -> Bab-el-Mandeb -> Arabian Sea tail, reused
// by both BLACK_SEA_ROUTE and ATLANTIC_SUEZ_ROUTE below. South-of-Crete and the open-EMed point
// were placed by sampling the actual coastline data (lng24-28 at lat34 is clear of Crete,
// Cyprus, and the Turkish/Levant coast); the Suez->Red Sea leg still crosses the Sinai
// peninsula's silhouette for a few hundred km — the Gulf of Suez is narrower than this app's
// simplified coastline data resolves, so a short "canal-style" crossing there is unavoidable
// at this resolution (matches how the Suez Canal transit itself has always been drawn).
const SOUTH_OF_CRETE: LngLat = [24.0, 34.0];
const OPEN_EASTERN_MED: LngLat = [28.0, 34.0];
const PORT_SAID_APPROACH: LngLat = [31.5, 32.3];
const SUEZ_CANAL: LngLat = [32.35, 30.50];
const RED_SEA_MID: LngLat = [38.0, 20.0];
const BAB_EL_MANDEB_WAYPOINT: LngLat = [43.40, 12.60];
const ARABIAN_SEA_WEST: LngLat = [62.0, 12.0];

// Black Sea (Russia) -> Bosphorus -> Dardanelles -> Aegean -> Eastern Mediterranean -> Suez ->
// Red Sea -> Bab-el-Mandeb -> Arabian Sea -> [around Sri Lanka] -> Paradip. The Bosphorus/
// Dardanelles exit and Aegean crossing are threaded through open water confirmed clear of the
// Gallipoli peninsula, the Greek islands, and Crete (a straight Bosphorus-to-Aegean-point line
// previously cut across ~250km of the Turkish Aegean coast at this resolution); the final leg
// used to jump straight from the Arabian Sea to Paradip, cutting directly across southern
// India — it needs the same Sri Lanka detour as the other Arabian-Sea-side routes below.
export const BLACK_SEA_ROUTE: LngLat[] = [
  [36.75, 45.22],  // Taman
  [29.02, 41.05],  // Bosphorus Strait
  [26.4, 40.0],    // Dardanelles exit
  [25.0, 37.0],    // Aegean Sea (open water, clear of the Cyclades)
  SOUTH_OF_CRETE,
  OPEN_EASTERN_MED,
  PORT_SAID_APPROACH,
  SUEZ_CANAL,
  RED_SEA_MID,
  BAB_EL_MANDEB_WAYPOINT,
  ARABIAN_SEA_WEST,
  [73.0, 9.0],     // Nine Degree Channel
  [81.0, 5.0],     // south of Sri Lanka (Dondra Head)
  [84.0, 7.0],     // Bay of Bengal approach
  [86.67, 20.26]   // Paradip
];

// Mozambique -> central Indian Ocean -> Gangavaram (already clears the coast with a direct
// line, kept as a 2-point reference for consistency with the other exports).
export const MOZAMBIQUE_ROUTE: LngLat[] = [
  [40.68, -14.57], // Nacala
  [55.0, -6.0],    // Central Indian Ocean
  [83.24, 17.62]   // Gangavaram
];

// India's east and west coasts only connect by sea via the south — a route approaching from
// the Bay of Bengal side (SE Asia/Australia) that needs a west-coast Indian port, or one
// approaching from the Arabian Sea side (Middle East/Red Sea/Africa) that needs an east-coast
// port, must go around Sri Lanka instead of cutting across the subcontinent. A single waypoint
// at the Nine Degree Channel isn't enough on its own — a straight line from there straight to
// an east-coast port cuts directly across southern India — so this is a short chain: the
// channel itself, then a point safely south of Dondra Head (Sri Lanka's southern tip), then an
// open-Bay-of-Bengal approach point before finally reaching an east-coast destination.
export const NINE_DEGREE_CHANNEL_WAYPOINT: LngLat = [73.0, 9.0];
export const SOUTH_OF_SRI_LANKA_WAYPOINT: LngLat = [81.0, 5.0];
export const BAY_OF_BENGAL_APPROACH_WAYPOINT: LngLat = [84.0, 7.0];
// The Saurashtra/Kathiawar peninsula (Diu/Porbandar, Gujarat) juts well out into the Arabian
// Sea — a line from the Nine Degree Channel straight to a Gulf-of-Kutch port (Mundra, Kandla)
// clips it. Only needed for those two; Mormugao (further south, in Goa) clears without it.
export const WEST_OF_SAURASHTRA_WAYPOINT: LngLat = [68.5, 21.0];

// Jorf Lasfar (Morocco, Atlantic-facing) -> Gibraltar -> Mediterranean -> Suez -> Red Sea ->
// Bab-el-Mandeb -> Arabian Sea. Shares the Eastern Mediterranean/Suez/Red Sea/Bab-el-Mandeb
// waypoints with BLACK_SEA_ROUTE; the Gibraltar-to-Sicily leg is new and was the worst offender
// here — a straight line at Gibraltar's latitude runs directly along the Algerian coast for
// ~1000km, so this dips north through the Alboran Sea and between the Balearics/Sardinia
// before threading the Strait of Sicily (clear of both Tunisia's Cape Bon and Sicily itself).
export const ATLANTIC_SUEZ_ROUTE: LngLat[] = [
  [-8.63, 33.12],  // Jorf Lasfar
  [-5.6, 35.9],    // Strait of Gibraltar
  [-2.0, 36.3],    // Alboran Sea
  [0.0, 37.5],     // Western Mediterranean
  [9.0, 38.0],     // between the Balearics and Sardinia
  [12.0, 36.0],    // Strait of Sicily
  [16.0, 36.0],    // Ionian Sea, south of Calabria
  [20.0, 35.5],    // Ionian Sea
  SOUTH_OF_CRETE,
  OPEN_EASTERN_MED,
  PORT_SAID_APPROACH,
  SUEZ_CANAL,
  RED_SEA_MID,
  BAB_EL_MANDEB_WAYPOINT,
  ARABIAN_SEA_WEST
];

// Ras Al Khair (Saudi Arabia, Persian Gulf) -> Strait of Hormuz -> Arabian Sea. A short Gulf
// haul compared to the Suez/Cape corridors. The direct Ras-Al-Khair-to-Hormuz line clips a
// Gulf island near Kish; dipping south through mid-Gulf water clears it.
export const GULF_ROUTE: LngLat[] = [
  [49.85, 27.05],  // Ras Al Khair
  [52.5, 25.6],    // mid-Persian-Gulf
  [56.3, 26.3],    // Strait of Hormuz
  [65.0, 20.0]     // Arabian Sea
];

// Sohar (Oman) sits on the Gulf of Oman just outside Hormuz. The direct line to open water ran
// straight along the Omani coast past Muscat for ~400km — this stays offshore (north of the
// coast) until clear of Ras al Hadd, Oman's northeastern cape, before turning into open sea.
export const OMAN_ROUTE: LngLat[] = [
  [56.61, 24.35],  // Sohar
  [59.0, 24.0],    // offshore, north of the Omani coast past Muscat
  [60.3, 21.2],    // clear of Ras al Hadd
  [63.0, 18.0]     // Arabian Sea
];

// Aqaba (Jordan, head of the Gulf of Aqaba) -> Red Sea -> Bab-el-Mandeb -> Arabian Sea. Like
// the Gulf of Suez above, the Gulf of Aqaba is narrower than this app's simplified coastline
// data resolves, so the initial crossing is a short, unavoidable "canal-style" transit — a
// waypoint just past the tip of Sinai (Ras Muhammad) shortens it as much as the data allows.
export const RED_SEA_SOUTH_ROUTE: LngLat[] = [
  [35.0, 29.53],   // Aqaba
  [34.5, 27.0],    // clear of the Sinai peninsula's southern tip
  RED_SEA_MID,
  BAB_EL_MANDEB_WAYPOINT,
  ARABIAN_SEA_WEST
];
