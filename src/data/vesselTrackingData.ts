import { TrackedVessel } from '../types';

export interface PortMapPoint {
  id: string;
  name: string;
  code: string;
  country: string;
  lat: number;
  lng: number;
  type: 'DISCHARGE' | 'LOADING' | 'CHOKEPOINT' | 'BUNKERING';
  maxDraftM: number;
  maxLoaM: number;
  currentWaitHours: number;
  status: 'OPTIMAL' | 'MODERATE' | 'CONGESTED' | 'RESTRICTED';
}

export interface ChokepointMarker {
  id: string;
  name: string;
  lat: number;
  lng: number;
  maxDraft: string;
  description: string;
  riskLevel: 'LOW' | 'MODERATE' | 'ELEVATED';
}

export interface MonsoonZone {
  id: string;
  name: string;
  coordinates: Array<{ lat: number; lng: number }>;
  waveHeightM: string;
  windSpeedKts: string;
  direction: string;
  currentSeason: string;
}

export const portMapLocations: PortMapPoint[] = [
  {
    id: 'paradip',
    name: 'Paradip Port',
    code: 'INPRT',
    country: 'India',
    lat: 20.26,
    lng: 86.67,
    type: 'DISCHARGE',
    maxDraftM: 14.5,
    maxLoaM: 260,
    currentWaitHours: 16,
    status: 'OPTIMAL'
  },
  {
    id: 'vizag',
    name: 'Visakhapatnam',
    code: 'INVTZ',
    country: 'India',
    lat: 17.69,
    lng: 83.29,
    type: 'DISCHARGE',
    maxDraftM: 18.1,
    maxLoaM: 300,
    currentWaitHours: 36,
    status: 'MODERATE'
  },
  {
    id: 'gangavaram',
    name: 'Gangavaram Port',
    code: 'INGGV',
    country: 'India',
    lat: 17.62,
    lng: 83.24,
    type: 'DISCHARGE',
    maxDraftM: 19.5,
    maxLoaM: 320,
    currentWaitHours: 8,
    status: 'OPTIMAL'
  },
  {
    id: 'haldia',
    name: 'Haldia Dock Complex',
    code: 'INHAL',
    country: 'India',
    lat: 22.02,
    lng: 88.06,
    type: 'DISCHARGE',
    maxDraftM: 11.2,
    maxLoaM: 230,
    currentWaitHours: 42,
    status: 'CONGESTED'
  },
  {
    id: 'gopalpur',
    name: 'Gopalpur Port',
    code: 'INGPR',
    country: 'India',
    lat: 19.30,
    lng: 84.97,
    type: 'DISCHARGE',
    maxDraftM: 13.5,
    maxLoaM: 225,
    currentWaitHours: 12,
    status: 'OPTIMAL'
  },
  {
    id: 'dhamra',
    name: 'Dhamra Port',
    code: 'INDHR',
    country: 'India',
    lat: 20.80,
    lng: 86.96,
    type: 'DISCHARGE',
    maxDraftM: 18.5,
    maxLoaM: 310,
    currentWaitHours: 14,
    status: 'OPTIMAL'
  },
  {
    id: 'newcastle',
    name: 'Newcastle (Kooragang / NCIG)',
    code: 'AUNTL',
    country: 'Australia',
    lat: -32.92,
    lng: 151.78,
    type: 'LOADING',
    maxDraftM: 15.2,
    maxLoaM: 300,
    currentWaitHours: 24,
    status: 'OPTIMAL'
  },
  {
    id: 'gladstone',
    name: 'Gladstone (RG Tanna)',
    code: 'AUGLT',
    country: 'Australia',
    lat: -23.84,
    lng: 151.26,
    type: 'LOADING',
    maxDraftM: 17.5,
    maxLoaM: 315,
    currentWaitHours: 18,
    status: 'OPTIMAL'
  },
  {
    id: 'port_hedland',
    name: 'Port Hedland (Utah Point)',
    code: 'AUPHE',
    country: 'Australia',
    lat: -20.31,
    lng: 118.57,
    type: 'LOADING',
    maxDraftM: 19.5,
    maxLoaM: 330,
    currentWaitHours: 15,
    status: 'OPTIMAL'
  },
  {
    id: 'taboneo',
    name: 'Taboneo Anchorage',
    code: 'IDTAB',
    country: 'Indonesia',
    lat: -3.72,
    lng: 114.47,
    type: 'LOADING',
    maxDraftM: 16.0,
    maxLoaM: 290,
    currentWaitHours: 22,
    status: 'OPTIMAL'
  },
  {
    id: 'samarinda',
    name: 'Samarinda Anchorage (Muara Berau)',
    code: 'IDSMA',
    country: 'Indonesia',
    lat: -0.50,
    lng: 117.15,
    type: 'LOADING',
    maxDraftM: 14.0,
    maxLoaM: 250,
    currentWaitHours: 28,
    status: 'MODERATE'
  },
  {
    id: 'richards_bay',
    name: 'Richards Bay Coal Terminal (RBCT)',
    code: 'ZARCB',
    country: 'South Africa',
    lat: -28.80,
    lng: 32.05,
    type: 'LOADING',
    maxDraftM: 17.5,
    maxLoaM: 315,
    currentWaitHours: 32,
    status: 'MODERATE'
  },
  {
    id: 'singapore',
    name: 'Singapore Bunker Roads & TSS',
    code: 'SGSIN',
    country: 'Singapore',
    lat: 1.29,
    lng: 103.85,
    type: 'BUNKERING',
    maxDraftM: 21.0,
    maxLoaM: 399,
    currentWaitHours: 6,
    status: 'OPTIMAL'
  },
  {
    id: 'colombo',
    name: 'Colombo Outer Roads',
    code: 'LKCMB',
    country: 'Sri Lanka',
    lat: 6.94,
    lng: 79.84,
    type: 'BUNKERING',
    maxDraftM: 18.0,
    maxLoaM: 350,
    currentWaitHours: 10,
    status: 'OPTIMAL'
  },
  {
    id: 'taman',
    name: 'Taman Bay Coal Terminal',
    code: 'RUTAM',
    country: 'Russia',
    lat: 45.22,
    lng: 36.75,
    type: 'LOADING',
    maxDraftM: 16.5,
    maxLoaM: 300,
    currentWaitHours: 20,
    status: 'MODERATE'
  },
  {
    id: 'nacala',
    name: 'Nacala Port (Vale Logistics Corridor)',
    code: 'MZNAC',
    country: 'Mozambique',
    lat: -14.57,
    lng: 40.68,
    type: 'LOADING',
    maxDraftM: 17.0,
    maxLoaM: 290,
    currentWaitHours: 16,
    status: 'OPTIMAL'
  },
  {
    id: 'mundra',
    name: 'Mundra Port',
    code: 'INMUN',
    country: 'India',
    lat: 22.84,
    lng: 69.72,
    type: 'DISCHARGE',
    maxDraftM: 17.5,
    maxLoaM: 300,
    currentWaitHours: 10,
    status: 'MODERATE'
  },
  {
    id: 'kandla',
    name: 'Kandla (Deendayal Port)',
    code: 'INIXY',
    country: 'India',
    lat: 23.03,
    lng: 70.22,
    type: 'DISCHARGE',
    maxDraftM: 12.8,
    maxLoaM: 230,
    currentWaitHours: 14,
    status: 'MODERATE'
  },
  {
    id: 'mormugao',
    name: 'Mormugao Port',
    code: 'INMRM',
    country: 'India',
    lat: 15.42,
    lng: 73.80,
    type: 'DISCHARGE',
    maxDraftM: 16.5,
    maxLoaM: 280,
    currentWaitHours: 5,
    status: 'OPTIMAL'
  },
  {
    id: 'jorf_lasfar',
    name: 'Jorf Lasfar (OCP Phosphate Terminal)',
    code: 'MAJFL',
    country: 'Morocco',
    lat: 33.12,
    lng: -8.63,
    type: 'LOADING',
    maxDraftM: 18.0,
    maxLoaM: 290,
    currentWaitHours: 6,
    status: 'OPTIMAL'
  },
  {
    id: 'ras_al_khair',
    name: 'Ras Al Khair (Maaden Terminal)',
    code: 'SARAK',
    country: 'Saudi Arabia',
    lat: 27.05,
    lng: 49.85,
    type: 'LOADING',
    maxDraftM: 18.5,
    maxLoaM: 295,
    currentWaitHours: 5,
    status: 'OPTIMAL'
  },
  {
    id: 'sohar',
    name: 'Sohar Port',
    code: 'OMSOH',
    country: 'Oman',
    lat: 24.35,
    lng: 56.61,
    type: 'LOADING',
    maxDraftM: 20.0,
    maxLoaM: 300,
    currentWaitHours: 4,
    status: 'OPTIMAL'
  },
  {
    id: 'aqaba',
    name: 'Aqaba (Arab Potash Terminal)',
    code: 'JOAQJ',
    country: 'Jordan',
    lat: 29.53,
    lng: 35.00,
    type: 'LOADING',
    maxDraftM: 13.5,
    maxLoaM: 230,
    currentWaitHours: 9,
    status: 'MODERATE'
  }
];

export const chokepointMarkers: ChokepointMarker[] = [
  {
    id: 'malacca_tss',
    name: 'Strait of Malacca TSS (One Fathom Bank)',
    lat: 2.85,
    lng: 101.0,
    maxDraft: '22.5m Max UKC',
    description: 'World highest density bulk carrier passage. Compulsory TSS & VTIS Sector 7 reporting.',
    riskLevel: 'LOW'
  },
  {
    id: 'singapore_strait',
    name: 'Singapore Strait Western Approaches',
    lat: 1.23,
    lng: 103.65,
    maxDraft: '21.0m Channel Limit',
    description: 'High-speed pilot & ferry traffic crossing east-west bulk tracks. Bunkering crossroads.',
    riskLevel: 'LOW'
  },
  {
    id: 'torres_strait',
    name: 'Torres Strait (Prince of Wales Channel)',
    lat: -10.55,
    lng: 142.15,
    maxDraft: '12.2m – 14.5m (Tide Dependent)',
    description: 'Strict coastal pilotage. Ganenet & Varzin shoals require real-time UKC dynamic monitoring.',
    riskLevel: 'ELEVATED'
  },
  {
    id: 'lombok_strait',
    name: 'Lombok Strait Deep-Water Passage',
    lat: -8.75,
    lng: 115.75,
    maxDraft: 'Unrestricted (>200m depth)',
    description: 'Primary deep-water detour for fully laden Capesize and Newcastlemax (>18.5m draft).',
    riskLevel: 'LOW'
  },
  {
    id: 'sunda_strait',
    name: 'Sunda Strait Oceanic Passage',
    lat: -5.92,
    lng: 105.75,
    maxDraft: '18.0m (Volcanic shoals)',
    description: 'Heavy volcanic and tidal currents between Java and Sumatra. Alternate oceanic entrance.',
    riskLevel: 'MODERATE'
  },
  {
    id: 'andaman_passage',
    name: 'Preparis / Ten Degree Channel',
    lat: 10.0,
    lng: 92.5,
    maxDraft: 'Deep Oceanic',
    description: 'Entrance gateway into Bay of Bengal from Malacca Strait. Heavy swell in SW monsoon.',
    riskLevel: 'LOW'
  },
  {
    id: 'nine_degree_channel',
    name: 'Nine Degree Channel (Lakshadweep)',
    lat: 10.0,
    lng: 73.0,
    maxDraft: 'Deep Oceanic (>1000m)',
    description: 'West coast India / Colombo bunkering approach corridor. Fishing fleet density requires enhanced lookout at night.',
    riskLevel: 'LOW'
  },
  {
    id: 'bali_strait',
    name: 'Bali Strait (Selat Bali)',
    lat: -8.20,
    lng: 114.40,
    maxDraft: '~60m Depth, 2.4 NM Width',
    description: 'Narrow alternate passage to Lombok for Handysize/Supramax feeder tonnage exiting Port Hedland/Taboneo corridors. Strong tidal current and dense inter-island ferry traffic.',
    riskLevel: 'ELEVATED'
  },
  {
    id: 'bosphorus_strait',
    name: 'Bosphorus Strait (Istanbul)',
    lat: 41.05,
    lng: 29.02,
    maxDraft: '~15m Practical Draft (Turkish Straits Regime)',
    description: 'Mandatory exit chokepoint for all Black Sea coal/grain tonnage. Narrow S-curve through central Istanbul with dense ferry crossings; Turkish Straits Vessel Traffic Service reporting compulsory.',
    riskLevel: 'ELEVATED'
  },
  {
    id: 'suez_canal',
    name: 'Suez Canal',
    lat: 30.50,
    lng: 32.35,
    maxDraft: '20.1m (Suezmax), Convoy System',
    description: 'Primary Black Sea/Mediterranean shortcut to the Indian Ocean, bypassing the Cape of Good Hope. Scheduled northbound/southbound convoys; canal transit fees apply per voyage.',
    riskLevel: 'MODERATE'
  },
  {
    id: 'bab_el_mandeb',
    name: 'Bab-el-Mandeb Strait',
    lat: 12.60,
    lng: 43.40,
    maxDraft: 'Deep Oceanic, ~30km Width',
    description: 'Red Sea / Gulf of Aden gateway linking Suez transits to the Arabian Sea. Elevated security posture recommended; masters advised to maintain heightened watch through the corridor.',
    riskLevel: 'ELEVATED'
  },
  {
    id: 'strait_of_hormuz',
    name: 'Strait of Hormuz',
    lat: 26.60,
    lng: 56.30,
    maxDraft: 'Deep Oceanic, 2nm TSS Lanes',
    description: 'Mandatory chokepoint for all Persian Gulf fertilizer/phosphate tonnage (Ras Al Khair, Jubail). Narrow two-way TSS with heavy tanker crossing traffic; geopolitical risk premium applies.',
    riskLevel: 'ELEVATED'
  },
  {
    id: 'strait_of_gibraltar',
    name: 'Strait of Gibraltar',
    lat: 35.95,
    lng: -5.60,
    maxDraft: 'Deep Oceanic, ~13km Width',
    description: 'Atlantic-Mediterranean gateway for Morocco phosphate tonnage (Jorf Lasfar) transiting to Suez. Dense east-west ferry and container traffic crossing the bulk track.',
    riskLevel: 'MODERATE'
  }
];

export const monsoonZones: MonsoonZone[] = [
  {
    id: 'bay_of_bengal_swell',
    name: 'Bay of Bengal SW Monsoon Swell Zone',
    coordinates: [
      { lat: 8.0, lng: 82.0 },
      { lat: 14.0, lng: 80.0 },
      { lat: 21.0, lng: 86.0 },
      { lat: 21.5, lng: 92.0 },
      { lat: 15.0, lng: 94.0 },
      { lat: 8.0, lng: 90.0 }
    ],
    waveHeightM: '2.6m – 3.8m SW Chop',
    windSpeedKts: '22 – 32 kts',
    direction: 'South-Southwest (210°)',
    currentSeason: 'SW Monsoon (Active)'
  },
  {
    id: 'coral_sea_transit',
    name: 'Coral Sea Trade Wind Zone',
    coordinates: [
      { lat: -12.0, lng: 144.0 },
      { lat: -25.0, lng: 150.0 },
      { lat: -28.0, lng: 156.0 },
      { lat: -16.0, lng: 154.0 }
    ],
    waveHeightM: '1.4m – 2.0m SE Swell',
    windSpeedKts: '14 – 20 kts',
    direction: 'Southeast (135°)',
    currentSeason: 'Steady Trades'
  }
];

export const monsoonRiskZones = monsoonZones;

export const initialTrackedVessels: TrackedVessel[] = [
  {
    id: 'vessel-maran-glory',
    name: 'MV Maran Glory',
    imo: '9784124',
    mmsi: '538007812',
    callSign: 'V7AB8',
    flag: 'Marshall Islands',
    flagCode: 'MH',
    vesselClass: 'Panamax',
    dwt: 76800,
    loa: 225.0,
    beam: 32.26,
    currentDraft: 14.2,
    maxDraft: 14.45,
    builtYear: 2019,
    ownerOperator: 'Maran Dry Management Inc.',
    
    coordinates: {
      lat: 16.85,
      lng: 85.90
    },
    heading: 345,
    cog: 343,
    sog: 13.8,
    navStatus: 'UNDERWAY',
    lastAisPing: 'Live (2 mins ago via Satellite AIS)',
    
    cargoType: 'Thermal Coal (Newcastle High-CV)',
    cargoParcelMT: 74500,
    originPort: 'Newcastle (Kooragang)',
    originCountry: 'Australia',
    departureDate: '2026-08-16 08:30 UTC',
    destinationPort: 'Paradip Port',
    destinationBerth: 'Coal Berth #2 (Dedicated Conveyor)',
    destinationCountry: 'India',
    assignedRouteCorridor: 'Strait of Malacca Standard Track',
    contractType: 'SPOT',
    voyageLeg: 'LADEN_OUTBOUND',
    
    totalDistanceNM: 5612,
    distanceTraveledNM: 5120,
    distanceToGoNM: 492,
    progressPct: 91.2,
    projectedEta: '2026-08-31 22:45 UTC',
    etaHoursRemaining: 35.6,
    etaDaysRemaining: 1.5,
    speedMode: 'LADEN_FULL',
    weatherImpactKts: -0.6,
    
    destinationPortMaxDraft: 14.5,
    destinationPortMaxLOA: 260,
    isDraftCompliant: true,
    lighteringRequired: false,
    berthFitAssessment: 'OPTIMAL FIT: 14.2m laden draft fits within Paradip 14.5m CD channel with 0.3m safety UKC.',
    demurrageRiskAtEta: 'LOW',
    projectedAnchorageWaitHours: 14,
    
    recentTrail: [
      { lat: -32.92, lng: 151.78, timestamp: 'Aug 16' },
      { lat: -21.40, lng: 150.20, timestamp: 'Aug 18' },
      { lat: -10.55, lng: 142.15, timestamp: 'Aug 21' },
      { lat: 1.25, lng: 103.80, timestamp: 'Aug 26' },
      { lat: 6.80, lng: 94.20, timestamp: 'Aug 28' },
      { lat: 13.20, lng: 88.10, timestamp: 'Aug 29' },
      { lat: 16.85, lng: 85.90, timestamp: 'Aug 30 (Now)' }
    ],
    plannedTrack: [
      { lat: 16.85, lng: 85.90, name: 'Current AIS Position (Bay of Bengal)' },
      { lat: 18.80, lng: 86.40, name: 'Paradip Fairway Approach Waypoint' },
      { lat: 20.26, lng: 86.67, name: 'Paradip Pilot Boarding Station' }
    ],
    currentWeather: {
      seaState: 'Moderate Sea State 4',
      waveHeightM: 2.4,
      windKts: 20,
      windDirection: 'SSW (205°)',
      condition: 'Monsoon overcast with intermittent drizzle'
    }
  },
  {
    id: 'vessel-pacific-voyager',
    name: 'MV Pacific Voyager',
    imo: '9845512',
    mmsi: '354890120',
    callSign: '3EPR9',
    flag: 'Panama',
    flagCode: 'PA',
    vesselClass: 'Capesize',
    dwt: 181200,
    loa: 292.0,
    beam: 45.0,
    currentDraft: 18.1,
    maxDraft: 18.4,
    builtYear: 2021,
    ownerOperator: 'Pacific Bulk Shipping Ltd.',
    
    coordinates: {
      lat: -4.50,
      lng: 96.20
    },
    heading: 320,
    cog: 318,
    sog: 12.6,
    navStatus: 'UNDERWAY',
    lastAisPing: 'Live (4 mins ago via Satellite AIS)',
    
    cargoType: 'Coking Coal (180K MT Macro Parcel)',
    cargoParcelMT: 178500,
    originPort: 'Newcastle (NCIG)',
    originCountry: 'Australia',
    departureDate: '2026-08-20 14:00 UTC',
    destinationPort: 'Paradip Port',
    destinationBerth: 'Deep Offshore Anchorage (Lightering Required)',
    destinationCountry: 'India',
    assignedRouteCorridor: 'Lombok Strait Deep-Water Corridor',
    contractType: 'COA',
    voyageLeg: 'LADEN_OUTBOUND',
    
    totalDistanceNM: 6092,
    distanceTraveledNM: 3950,
    distanceToGoNM: 2142,
    progressPct: 64.8,
    projectedEta: '2026-09-06 18:30 UTC',
    etaHoursRemaining: 170.0,
    etaDaysRemaining: 7.1,
    speedMode: 'ECO_SPEED',
    weatherImpactKts: -0.4,
    
    destinationPortMaxDraft: 14.5,
    destinationPortMaxLOA: 260,
    isDraftCompliant: false,
    lighteringRequired: true,
    lighteringEstimatedCostUSD: 749700, // +$4.20/MT on 178,500 MT
    berthFitAssessment: 'HYDROGRAPHIC RESTRICTION: 18.1m draft exceeds Paradip 14.5m harbor limit. Vessel cannot enter inner basin and requires offshore barge transshipment (+4.20/MT).',
    demurrageRiskAtEta: 'HIGH',
    projectedAnchorageWaitHours: 48,
    
    recentTrail: [
      { lat: -32.92, lng: 151.78, timestamp: 'Aug 20' },
      { lat: -34.80, lng: 138.50, timestamp: 'Aug 23' },
      { lat: -28.20, lng: 114.10, timestamp: 'Aug 26' },
      { lat: -8.75, lng: 115.75, timestamp: 'Aug 28 (Lombok Passage)' },
      { lat: -4.50, lng: 96.20, timestamp: 'Aug 30 (Now)' }
    ],
    plannedTrack: [
      { lat: -4.50, lng: 96.20, name: 'Current AIS Position (Indian Ocean Equatorial Basin)' },
      { lat: 5.50, lng: 90.0, name: 'Nicobar Deep Ocean Waypoint' },
      { lat: 14.00, lng: 87.50, name: 'Bay of Bengal Deep Basin' },
      { lat: 20.15, lng: 86.85, name: 'Paradip Deep Offshore Anchorage' }
    ],
    currentWeather: {
      seaState: 'Moderate Sea State 3',
      waveHeightM: 1.8,
      windKts: 16,
      windDirection: 'S (180°)',
      condition: 'Clear tropical visibility'
    }
  },
  {
    id: 'vessel-stella-hope',
    name: 'MV Stella Hope',
    imo: '9740198',
    mmsi: '248912000',
    callSign: '9HA4821',
    flag: 'Malta',
    flagCode: 'MT',
    vesselClass: 'Kamsarmax',
    dwt: 82000,
    loa: 229.0,
    beam: 32.26,
    currentDraft: 14.4,
    maxDraft: 14.52,
    builtYear: 2020,
    ownerOperator: 'Eastern Star Maritime SA',
    
    coordinates: {
      lat: 5.80,
      lng: 97.40
    },
    heading: 305,
    cog: 304,
    sog: 14.2,
    navStatus: 'UNDERWAY',
    lastAisPing: 'Live (1 min ago via Satellite AIS)',
    
    cargoType: 'Bauxite Bulk (Gladstone Refinery Ore)',
    cargoParcelMT: 80200,
    originPort: 'Gladstone (RG Tanna)',
    originCountry: 'Australia',
    departureDate: '2026-08-18 19:00 UTC',
    destinationPort: 'Visakhapatnam',
    destinationBerth: 'Outer Harbour Coal & Ore Berth #1',
    destinationCountry: 'India',
    assignedRouteCorridor: 'Strait of Malacca Standard Track',
    contractType: 'TIME_CHARTER',
    voyageLeg: 'LADEN_OUTBOUND',
    
    totalDistanceNM: 5480,
    distanceTraveledNM: 4210,
    distanceToGoNM: 1270,
    progressPct: 76.8,
    projectedEta: '2026-09-03 11:15 UTC',
    etaHoursRemaining: 89.4,
    etaDaysRemaining: 3.7,
    speedMode: 'LADEN_FULL',
    weatherImpactKts: -0.3,
    
    destinationPortMaxDraft: 18.1,
    destinationPortMaxLOA: 300,
    isDraftCompliant: true,
    lighteringRequired: false,
    berthFitAssessment: 'COMPLIANT: 14.4m draft comfortably clears Vizag Outer Harbour 18.1m draft ceiling.',
    demurrageRiskAtEta: 'MODERATE',
    projectedAnchorageWaitHours: 32,
    
    recentTrail: [
      { lat: -23.84, lng: 151.26, timestamp: 'Aug 18' },
      { lat: -10.55, lng: 142.15, timestamp: 'Aug 22' },
      { lat: 1.25, lng: 103.80, timestamp: 'Aug 27' },
      { lat: 5.80, lng: 97.40, timestamp: 'Aug 30 (Now)' }
    ],
    plannedTrack: [
      { lat: 5.80, lng: 97.40, name: 'Current AIS Position (North Malacca Outlet)' },
      { lat: 10.50, lng: 90.0, name: 'Andaman Sea Center Line' },
      { lat: 17.69, lng: 83.29, name: 'Visakhapatnam Breakwater Approach' }
    ],
    currentWeather: {
      seaState: 'Rough Sea State 5',
      waveHeightM: 3.1,
      windKts: 26,
      windDirection: 'SW (220°)',
      condition: 'Monsoon rain squalls with limited visibility'
    }
  },
  {
    id: 'vessel-bharat-samudra',
    name: 'MV Bharat Samudra',
    imo: '9651120',
    mmsi: '419000845',
    callSign: 'AVBT',
    flag: 'India',
    flagCode: 'IN',
    vesselClass: 'Panamax',
    dwt: 75500,
    loa: 225.0,
    beam: 32.2,
    currentDraft: 13.8,
    maxDraft: 14.2,
    builtYear: 2017,
    ownerOperator: 'Shipping Corporation of India (SCI)',
    
    coordinates: {
      lat: 11.20,
      lng: 88.70
    },
    heading: 335,
    cog: 334,
    sog: 13.1,
    navStatus: 'UNDERWAY',
    lastAisPing: 'Live (5 mins ago via Terrestrial AIS)',
    
    cargoType: 'Indonesian Steam Coal (5,500 kcal/kg)',
    cargoParcelMT: 73200,
    originPort: 'Taboneo Anchorage',
    originCountry: 'Indonesia',
    departureDate: '2026-08-23 06:00 UTC',
    destinationPort: 'Paradip Port',
    destinationBerth: 'Coal Berth #1 (Direct Conveyor)',
    destinationCountry: 'India',
    assignedRouteCorridor: 'Sunda Strait Oceanic Passage',
    contractType: 'SPOT',
    voyageLeg: 'LADEN_OUTBOUND',
    
    totalDistanceNM: 2680,
    distanceTraveledNM: 2080,
    distanceToGoNM: 600,
    progressPct: 77.6,
    projectedEta: '2026-09-01 07:30 UTC',
    etaHoursRemaining: 45.8,
    etaDaysRemaining: 1.9,
    speedMode: 'LADEN_FULL',
    weatherImpactKts: -0.5,
    
    destinationPortMaxDraft: 14.5,
    destinationPortMaxLOA: 260,
    isDraftCompliant: true,
    lighteringRequired: false,
    berthFitAssessment: 'OPTIMAL: 13.8m laden draft allows immediate direct discharge onto Paradip conveyor.',
    demurrageRiskAtEta: 'LOW',
    projectedAnchorageWaitHours: 12,
    
    recentTrail: [
      { lat: -3.72, lng: 114.47, timestamp: 'Aug 23' },
      { lat: -5.92, lng: 105.75, timestamp: 'Aug 25 (Sunda Strait)' },
      { lat: 3.50, lng: 94.0, timestamp: 'Aug 27' },
      { lat: 11.20, lng: 88.70, timestamp: 'Aug 30 (Now)' }
    ],
    plannedTrack: [
      { lat: 11.20, lng: 88.70, name: 'Current AIS Position (Bay of Bengal)' },
      { lat: 16.50, lng: 87.20, name: 'Paradip Approach Corridor' },
      { lat: 20.26, lng: 86.67, name: 'Paradip Roads' }
    ],
    currentWeather: {
      seaState: 'Moderate Sea State 4',
      waveHeightM: 2.2,
      windKts: 19,
      windDirection: 'SSW (210°)',
      condition: 'Scattered cloud cover'
    }
  },
  {
    id: 'vessel-asian-progress',
    name: 'MV Asian Progress',
    imo: '9554019',
    mmsi: '566890123',
    callSign: '9V8921',
    flag: 'Singapore',
    flagCode: 'SG',
    vesselClass: 'Supramax',
    dwt: 56800,
    loa: 189.9,
    beam: 32.26,
    currentDraft: 12.6,
    maxDraft: 12.8,
    builtYear: 2016,
    ownerOperator: 'Oceanic Bulk Lines Pte Ltd',
    
    coordinates: {
      lat: 14.60,
      lng: 91.80
    },
    heading: 340,
    cog: 338,
    sog: 12.0,
    navStatus: 'UNDERWAY',
    lastAisPing: 'Live (8 mins ago via Satellite AIS)',
    
    cargoType: 'High-Ash Indonesian Coal',
    cargoParcelMT: 54000,
    originPort: 'Samarinda (Muara Berau)',
    originCountry: 'Indonesia',
    departureDate: '2026-08-21 12:00 UTC',
    destinationPort: 'Haldia Dock Complex',
    destinationBerth: 'Berth #4A (Self-Geared Discharging)',
    destinationCountry: 'India',
    assignedRouteCorridor: 'Strait of Malacca Standard Track',
    contractType: 'COA',
    voyageLeg: 'LADEN_OUTBOUND',
    
    totalDistanceNM: 2850,
    distanceTraveledNM: 2310,
    distanceToGoNM: 540,
    progressPct: 81.0,
    projectedEta: '2026-09-01 04:00 UTC',
    etaHoursRemaining: 45.0,
    etaDaysRemaining: 1.9,
    speedMode: 'VIRTUAL_ARRIVAL',
    weatherImpactKts: -0.2,
    
    destinationPortMaxDraft: 11.2,
    destinationPortMaxLOA: 230,
    isDraftCompliant: false,
    lighteringRequired: true,
    lighteringEstimatedCostUSD: 140400, // Partial lightering to 11.2m
    berthFitAssessment: 'TIDAL LOCK RESTRICTION: 12.6m draft requires partial skim lightering at Sandheads anchorage to meet Haldia 11.2m lock sill limit.',
    demurrageRiskAtEta: 'CRITICAL',
    projectedAnchorageWaitHours: 44,
    
    recentTrail: [
      { lat: -0.50, lng: 117.15, timestamp: 'Aug 21' },
      { lat: 1.25, lng: 103.80, timestamp: 'Aug 24' },
      { lat: 6.00, lng: 96.00, timestamp: 'Aug 27' },
      { lat: 14.60, lng: 91.80, timestamp: 'Aug 30 (Now)' }
    ],
    plannedTrack: [
      { lat: 14.60, lng: 91.80, name: 'Current AIS Position (North Bay of Bengal)' },
      { lat: 21.00, lng: 88.30, name: 'Sandheads Outer Pilot Station' },
      { lat: 22.02, lng: 88.06, name: 'Haldia Lock Gates' }
    ],
    currentWeather: {
      seaState: 'Calm Sea State 2',
      waveHeightM: 1.2,
      windKts: 12,
      windDirection: 'S (175°)',
      condition: 'Hazy sunshine'
    }
  },
  {
    id: 'vessel-orient-venture',
    name: 'MV Orient Venture',
    imo: '9698421',
    mmsi: '372109845',
    callSign: '3FA49',
    flag: 'Panama',
    flagCode: 'PA',
    vesselClass: 'Handysize',
    dwt: 38200,
    loa: 179.9,
    beam: 28.4,
    currentDraft: 10.4,
    maxDraft: 10.6,
    builtYear: 2018,
    ownerOperator: 'Orient Navigation Bulk SA',
    
    coordinates: {
      lat: 18.20,
      lng: 85.40
    },
    heading: 325,
    cog: 324,
    sog: 11.8,
    navStatus: 'UNDERWAY',
    lastAisPing: 'Live (3 mins ago via Terrestrial AIS)',
    
    cargoType: 'Indonesian Steam Coal (38,000 MT Parcel)',
    cargoParcelMT: 37200,
    originPort: 'Bunyu Anchorage',
    originCountry: 'Indonesia',
    departureDate: '2026-08-22 09:00 UTC',
    destinationPort: 'Gopalpur Port',
    destinationBerth: 'Berth #2 General Cargo',
    destinationCountry: 'India',
    assignedRouteCorridor: 'Strait of Malacca Standard Track',
    contractType: 'FOB_SALE',
    voyageLeg: 'LADEN_OUTBOUND',
    
    totalDistanceNM: 2790,
    distanceTraveledNM: 2690,
    distanceToGoNM: 100,
    progressPct: 96.4,
    projectedEta: '2026-08-30 20:00 UTC',
    etaHoursRemaining: 8.5,
    etaDaysRemaining: 0.4,
    speedMode: 'LADEN_FULL',
    weatherImpactKts: -0.1,
    
    destinationPortMaxDraft: 13.5,
    destinationPortMaxLOA: 225,
    isDraftCompliant: true,
    lighteringRequired: false,
    berthFitAssessment: 'FULLY COMPLIANT: 10.4m draft easily docks at Gopalpur with 3.1m draft clearance margin.',
    demurrageRiskAtEta: 'LOW',
    projectedAnchorageWaitHours: 8,
    
    recentTrail: [
      { lat: 3.50, lng: 117.80, timestamp: 'Aug 22' },
      { lat: 1.25, lng: 103.80, timestamp: 'Aug 25' },
      { lat: 9.00, lng: 91.00, timestamp: 'Aug 28' },
      { lat: 18.20, lng: 85.40, timestamp: 'Aug 30 (Now)' }
    ],
    plannedTrack: [
      { lat: 18.20, lng: 85.40, name: 'Current AIS Position (Gopalpur Fairway)' },
      { lat: 19.30, lng: 84.97, name: 'Gopalpur Port Breakwater' }
    ],
    currentWeather: {
      seaState: 'Slight Sea State 3',
      waveHeightM: 1.6,
      windKts: 15,
      windDirection: 'SW (215°)',
      condition: 'Passing showers'
    }
  },
  {
    id: 'vessel-cape-osprey',
    name: 'MV Cape Osprey',
    imo: '9920194',
    mmsi: '311000984',
    callSign: 'C6DX2',
    flag: 'Bahamas',
    flagCode: 'BS',
    vesselClass: 'Newcastlemax',
    dwt: 208000,
    loa: 299.9,
    beam: 50.0,
    currentDraft: 18.6,
    maxDraft: 18.8,
    builtYear: 2023,
    ownerOperator: 'Anglo American Freight / NYK Line',
    
    coordinates: {
      lat: 2.10,
      lng: 85.50
    },
    heading: 350,
    cog: 348,
    sog: 14.5,
    navStatus: 'UNDERWAY',
    lastAisPing: 'Live (2 mins ago via Satellite AIS)',
    
    cargoType: 'High-Grade Iron Ore Lump & Fines',
    cargoParcelMT: 204500,
    originPort: 'Port Hedland (Utah Point)',
    originCountry: 'Australia',
    departureDate: '2026-08-22 04:00 UTC',
    destinationPort: 'Gangavaram Port',
    destinationBerth: 'Deepwater Bulk Berth #1 (19.5m CD)',
    destinationCountry: 'India',
    assignedRouteCorridor: 'Sunda Strait Oceanic Passage',
    contractType: 'TIME_CHARTER',
    voyageLeg: 'LADEN_OUTBOUND',
    
    totalDistanceNM: 3950,
    distanceTraveledNM: 2850,
    distanceToGoNM: 1100,
    progressPct: 72.1,
    projectedEta: '2026-09-02 21:00 UTC',
    etaHoursRemaining: 75.8,
    etaDaysRemaining: 3.2,
    speedMode: 'LADEN_FULL',
    weatherImpactKts: -0.2,
    
    destinationPortMaxDraft: 19.5,
    destinationPortMaxLOA: 320,
    isDraftCompliant: true,
    lighteringRequired: false,
    berthFitAssessment: 'PERFECT FIT FOR GANGAVARAM: 18.6m laden draft is fully accepted at Gangavaram 19.5m deep berth without any lightering penalty.',
    demurrageRiskAtEta: 'LOW',
    projectedAnchorageWaitHours: 6,
    
    recentTrail: [
      { lat: -20.31, lng: 118.57, timestamp: 'Aug 22' },
      { lat: -10.00, lng: 105.00, timestamp: 'Aug 25' },
      { lat: -5.92, lng: 105.75, timestamp: 'Aug 26 (Sunda Strait)' },
      { lat: 2.10, lng: 85.50, timestamp: 'Aug 30 (Now)' }
    ],
    plannedTrack: [
      { lat: 2.10, lng: 85.50, name: 'Current AIS Position (Equatorial Indian Ocean)' },
      { lat: 10.00, lng: 84.00, name: 'Sri Lanka East Deepway' },
      { lat: 17.62, lng: 83.24, name: 'Gangavaram Deepwater Basin' }
    ],
    currentWeather: {
      seaState: 'Moderate Sea State 3',
      waveHeightM: 1.9,
      windKts: 17,
      windDirection: 'S (185°)',
      condition: 'Good visibility'
    }
  },
  {
    id: 'vessel-star-diamond',
    name: 'MV Star Diamond',
    imo: '9711802',
    mmsi: '636018902',
    callSign: 'D5QW8',
    flag: 'Liberia',
    flagCode: 'LR',
    vesselClass: 'Panamax',
    dwt: 77400,
    loa: 228.9,
    beam: 32.25,
    currentDraft: 14.1,
    maxDraft: 14.4,
    builtYear: 2019,
    ownerOperator: 'Star Bulk Carriers Corp',
    
    coordinates: {
      lat: 6.40,
      lng: 80.50
    },
    heading: 45,
    cog: 44,
    sog: 13.6,
    navStatus: 'UNDERWAY',
    lastAisPing: 'Live (4 mins ago via Terrestrial AIS)',
    
    cargoType: 'South African Steam Coal (RB1 6,000 kcal)',
    cargoParcelMT: 75000,
    originPort: 'Richards Bay Coal Terminal (RBCT)',
    originCountry: 'South Africa',
    departureDate: '2026-08-17 10:00 UTC',
    destinationPort: 'Paradip Port',
    destinationBerth: 'Coal Berth #2',
    destinationCountry: 'India',
    assignedRouteCorridor: 'South Africa - Bay of Bengal Great Circle',
    contractType: 'SPOT',
    voyageLeg: 'LADEN_OUTBOUND',
    
    totalDistanceNM: 4780,
    distanceTraveledNM: 3820,
    distanceToGoNM: 960,
    progressPct: 79.9,
    projectedEta: '2026-09-02 12:00 UTC',
    etaHoursRemaining: 70.5,
    etaDaysRemaining: 2.9,
    speedMode: 'LADEN_FULL',
    weatherImpactKts: -0.3,
    
    destinationPortMaxDraft: 14.5,
    destinationPortMaxLOA: 260,
    isDraftCompliant: true,
    lighteringRequired: false,
    berthFitAssessment: 'COMPLIANT: 14.1m draft allows direct berthing at Paradip Coal Berth #2.',
    demurrageRiskAtEta: 'LOW',
    projectedAnchorageWaitHours: 15,
    
    recentTrail: [
      { lat: -28.80, lng: 32.05, timestamp: 'Aug 17' },
      { lat: -18.00, lng: 48.00, timestamp: 'Aug 20' },
      { lat: -5.00, lng: 65.00, timestamp: 'Aug 25' },
      { lat: 6.40, lng: 80.50, timestamp: 'Aug 30 (Now - South of Sri Lanka)' }
    ],
    plannedTrack: [
      { lat: 6.40, lng: 80.50, name: 'Current AIS Position (Dondra Head TSS)' },
      { lat: 14.00, lng: 84.50, name: 'Bay of Bengal West Channel' },
      { lat: 20.26, lng: 86.67, name: 'Paradip Pilot Station' }
    ],
    currentWeather: {
      seaState: 'Rough Sea State 5',
      waveHeightM: 3.2,
      windKts: 24,
      windDirection: 'SW (225°)',
      condition: 'Monsoon squall advisory'
    }
  },
  {
    id: 'vessel-golden-horizon',
    name: 'MV Golden Horizon',
    imo: '9620045',
    mmsi: '538006421',
    callSign: 'V7TJ3',
    flag: 'Marshall Islands',
    flagCode: 'MH',
    vesselClass: 'Supramax',
    dwt: 61000,
    loa: 199.9,
    beam: 32.26,
    currentDraft: 13.2,
    maxDraft: 13.4,
    builtYear: 2015,
    ownerOperator: 'Golden Ocean Group Ltd',
    
    coordinates: {
      lat: 17.65,
      lng: 83.38
    },
    heading: 210,
    cog: 0,
    sog: 0.2,
    navStatus: 'ANCHORAGE',
    lastAisPing: 'Live (1 min ago via Terrestrial AIS)',
    
    cargoType: 'Indonesian Thermal Coal',
    cargoParcelMT: 59500,
    originPort: 'Taboneo Anchorage',
    originCountry: 'Indonesia',
    departureDate: '2026-08-20 02:00 UTC',
    destinationPort: 'Visakhapatnam',
    destinationBerth: 'Inner Harbour East Berth #1',
    destinationCountry: 'India',
    assignedRouteCorridor: 'Strait of Malacca Standard Track',
    contractType: 'SPOT',
    voyageLeg: 'LADEN_OUTBOUND',
    
    totalDistanceNM: 2450,
    distanceTraveledNM: 2450,
    distanceToGoNM: 4,
    progressPct: 100.0,
    projectedEta: 'Arrived (Awaiting Berth)',
    etaHoursRemaining: 0,
    etaDaysRemaining: 0,
    speedMode: 'VIRTUAL_ARRIVAL',
    weatherImpactKts: 0,
    
    destinationPortMaxDraft: 18.1,
    destinationPortMaxLOA: 300,
    isDraftCompliant: true,
    lighteringRequired: false,
    berthFitAssessment: 'AT ANCHORAGE: Vessel has anchored at Vizag Outer Roads (depth 22m). Pilot scheduled for Aug 31 16:00 UTC.',
    demurrageRiskAtEta: 'MODERATE',
    projectedAnchorageWaitHours: 28,
    
    recentTrail: [
      { lat: -3.72, lng: 114.47, timestamp: 'Aug 20' },
      { lat: 1.25, lng: 103.80, timestamp: 'Aug 23' },
      { lat: 10.00, lng: 88.00, timestamp: 'Aug 27' },
      { lat: 17.65, lng: 83.38, timestamp: 'Aug 29 (Anchored)' }
    ],
    plannedTrack: [
      { lat: 17.65, lng: 83.38, name: 'Vizag Outer Anchorage #2' },
      { lat: 17.69, lng: 83.29, name: 'Visakhapatnam Inner Harbour Berth' }
    ],
    currentWeather: {
      seaState: 'Moderate Sea State 3',
      waveHeightM: 1.7,
      windKts: 18,
      windDirection: 'SW (210°)',
      condition: 'Partly cloudy'
    }
  },
  {
    id: 'vessel-jag-anand',
    name: 'MV Jag Anand',
    imo: '9481235',
    mmsi: '419000189',
    callSign: 'ATJA',
    flag: 'India',
    flagCode: 'IN',
    vesselClass: 'Panamax',
    dwt: 76000,
    loa: 225.0,
    beam: 32.2,
    currentDraft: 11.2, // Partial discharge draft
    maxDraft: 14.3,
    builtYear: 2012,
    ownerOperator: 'Great Eastern Shipping Co.',
    
    coordinates: {
      lat: 20.26,
      lng: 86.68
    },
    heading: 85,
    cog: 0,
    sog: 0.0,
    navStatus: 'BERTHED',
    lastAisPing: 'Live (Real-Time Shore Radar)',
    
    cargoType: 'Thermal Coal (Active Discharge: 42,000 MT Remaining)',
    cargoParcelMT: 74000,
    originPort: 'Newcastle (Kooragang)',
    originCountry: 'Australia',
    departureDate: '2026-08-11 16:00 UTC',
    destinationPort: 'Paradip Port',
    destinationBerth: 'Coal Berth #2 (CSU-1 & CSU-2)',
    destinationCountry: 'India',
    assignedRouteCorridor: 'Strait of Malacca Standard Track',
    contractType: 'COA',
    voyageLeg: 'LADEN_OUTBOUND',
    
    totalDistanceNM: 5612,
    distanceTraveledNM: 5612,
    distanceToGoNM: 0,
    progressPct: 100.0,
    projectedEta: 'Berthed / Discharging (ETD: Sep 01 18:00 UTC)',
    etaHoursRemaining: 0,
    etaDaysRemaining: 0,
    speedMode: 'LADEN_FULL',
    weatherImpactKts: 0,
    
    destinationPortMaxDraft: 14.5,
    destinationPortMaxLOA: 260,
    isDraftCompliant: true,
    lighteringRequired: false,
    berthFitAssessment: 'CURRENTLY DISCHARGING: Berth #2 continuous ship unloaders running at combined 2,800 TPH. 32,000 MT discharged.',
    demurrageRiskAtEta: 'LOW',
    projectedAnchorageWaitHours: 0,
    
    recentTrail: [
      { lat: -32.92, lng: 151.78, timestamp: 'Aug 11' },
      { lat: 1.25, lng: 103.80, timestamp: 'Aug 21' },
      { lat: 20.26, lng: 86.68, timestamp: 'Aug 28 (Berthed)' }
    ],
    plannedTrack: [
      { lat: 20.26, lng: 86.68, name: 'Paradip Coal Berth #2' }
    ],
    currentWeather: {
      seaState: 'Calm Harbor Basin',
      waveHeightM: 0.5,
      windKts: 14,
      windDirection: 'SSW (200°)',
      condition: 'Overcast, operational cranes active'
    }
  },
  {
    id: 'vessel-southern-cross',
    name: 'MV Southern Cross',
    imo: '9902341',
    mmsi: '477812350',
    callSign: 'VRSC7',
    flag: 'Hong Kong',
    flagCode: 'HK',
    vesselClass: 'Capesize',
    dwt: 180000,
    loa: 292.0,
    beam: 45.0,
    currentDraft: 17.8,
    maxDraft: 18.4,
    builtYear: 2022,
    ownerOperator: 'Oldendorff Carriers GmbH',

    coordinates: { lat: -10.50, lng: 96.00 },
    heading: 315,
    cog: 313,
    sog: 13.2,
    navStatus: 'UNDERWAY',
    lastAisPing: 'Live (3 mins ago via Satellite AIS)',

    cargoType: 'Coking Coal (Gladstone Premium Hard)',
    cargoParcelMT: 172000,
    originPort: 'Gladstone (RG Tanna)',
    originCountry: 'Australia',
    departureDate: '2026-08-19 06:00 UTC',
    destinationPort: 'Gangavaram Port',
    destinationBerth: 'Deepwater Bulk Berth #1 (19.5m CD)',
    destinationCountry: 'India',
    assignedRouteCorridor: 'Sunda Strait Oceanic Passage',
    contractType: 'TIME_CHARTER',
    voyageLeg: 'LADEN_OUTBOUND',

    totalDistanceNM: 5480,
    distanceTraveledNM: 2100,
    distanceToGoNM: 3380,
    progressPct: 38.3,
    projectedEta: '2026-09-06 09:00 UTC',
    etaHoursRemaining: 256.1,
    etaDaysRemaining: 10.7,
    speedMode: 'LADEN_FULL',
    weatherImpactKts: -0.3,

    destinationPortMaxDraft: 19.5,
    destinationPortMaxLOA: 320,
    isDraftCompliant: true,
    lighteringRequired: false,
    berthFitAssessment: 'PERFECT FIT FOR GANGAVARAM: 17.8m laden draft fully accepted at Gangavaram 19.5m deep berth without lightering penalty.',
    demurrageRiskAtEta: 'LOW',
    projectedAnchorageWaitHours: 6,

    recentTrail: [
      { lat: -23.84, lng: 151.26, timestamp: 'Aug 19' },
      { lat: -20.00, lng: 125.00, timestamp: 'Aug 23' },
      { lat: -5.92, lng: 105.75, timestamp: 'Aug 27 (Sunda Strait)' },
      { lat: -10.50, lng: 96.00, timestamp: 'Aug 30 (Now)' }
    ],
    plannedTrack: [
      { lat: -10.50, lng: 96.00, name: 'Current AIS Position (Equatorial Indian Ocean)' },
      { lat: 2.00, lng: 88.00, name: 'Nicobar-Sumatra Deep Ocean Waypoint' },
      { lat: 17.62, lng: 83.24, name: 'Gangavaram Deepwater Basin' }
    ],
    currentWeather: {
      seaState: 'Moderate Sea State 3',
      waveHeightM: 1.7,
      windKts: 15,
      windDirection: 'SE (150°)',
      condition: 'Scattered cloud, good visibility'
    }
  },
  {
    id: 'vessel-nordic-trader',
    name: 'Nordic Trader',
    imo: '9633014',
    mmsi: '219018742',
    callSign: 'OWNT2',
    flag: 'Denmark',
    flagCode: 'DK',
    vesselClass: 'Supramax',
    dwt: 63000,
    loa: 199.9,
    beam: 32.26,
    currentDraft: 12.4,
    maxDraft: 12.9,
    builtYear: 2017,
    ownerOperator: 'Norden Dry Bulk A/S',

    coordinates: { lat: 8.50, lng: 92.00 },
    heading: 330,
    cog: 328,
    sog: 12.4,
    navStatus: 'UNDERWAY',
    lastAisPing: 'Live (6 mins ago via Satellite AIS)',

    cargoType: 'Petcoke (Kalimantan Blend)',
    cargoParcelMT: 60500,
    originPort: 'Taboneo Anchorage',
    originCountry: 'Indonesia',
    departureDate: '2026-08-24 11:00 UTC',
    destinationPort: 'Haldia Dock Complex',
    destinationBerth: 'Berth #2 (Lock Basin)',
    destinationCountry: 'India',
    assignedRouteCorridor: 'Strait of Malacca Standard Track',
    contractType: 'SPOT',
    voyageLeg: 'LADEN_OUTBOUND',

    totalDistanceNM: 2960,
    distanceTraveledNM: 2240,
    distanceToGoNM: 720,
    progressPct: 75.7,
    projectedEta: '2026-09-01 15:00 UTC',
    etaHoursRemaining: 58.1,
    etaDaysRemaining: 2.4,
    speedMode: 'LADEN_FULL',
    weatherImpactKts: -0.4,

    destinationPortMaxDraft: 10.5,
    destinationPortMaxLOA: 210,
    isDraftCompliant: false,
    lighteringRequired: true,
    lighteringEstimatedCostUSD: 254100,
    berthFitAssessment: 'TIDAL LOCK RESTRICTION: 12.4m draft exceeds Haldia 10.5m lock sill limit. Mandatory Sandheads lightering before lock transit.',
    demurrageRiskAtEta: 'HIGH',
    projectedAnchorageWaitHours: 34,

    recentTrail: [
      { lat: -3.72, lng: 114.47, timestamp: 'Aug 24' },
      { lat: 1.25, lng: 103.80, timestamp: 'Aug 27' },
      { lat: 5.50, lng: 96.50, timestamp: 'Aug 29' },
      { lat: 8.50, lng: 92.00, timestamp: 'Aug 30 (Now)' }
    ],
    plannedTrack: [
      { lat: 8.50, lng: 92.00, name: 'Current AIS Position (Andaman Sea)' },
      { lat: 21.00, lng: 88.30, name: 'Sandheads Outer Pilot Station' },
      { lat: 22.02, lng: 88.06, name: 'Haldia Lock Gates' }
    ],
    currentWeather: {
      seaState: 'Moderate Sea State 3',
      waveHeightM: 1.9,
      windKts: 17,
      windDirection: 'SW (215°)',
      condition: 'Broken cloud with light rain showers'
    }
  },
  {
    id: 'vessel-hooghly-star',
    name: 'MV Hooghly Star',
    imo: '9512034',
    mmsi: '412009821',
    callSign: 'BQHS3',
    flag: 'China',
    flagCode: 'CN',
    vesselClass: 'Supramax',
    dwt: 55200,
    loa: 190.0,
    beam: 32.26,
    currentDraft: 11.6,
    maxDraft: 11.9,
    builtYear: 2014,
    ownerOperator: 'COSCO Shipping Bulk Co. Ltd',

    coordinates: { lat: 21.00, lng: 88.30 },
    heading: 20,
    cog: 0,
    sog: 0.1,
    navStatus: 'ANCHORAGE',
    lastAisPing: 'Live (Real-Time Shore Radar)',

    cargoType: 'Coking Coal (48,000 MT)',
    cargoParcelMT: 48000,
    originPort: 'Taboneo Anchorage',
    originCountry: 'Indonesia',
    departureDate: '2026-08-19 08:00 UTC',
    destinationPort: 'Haldia Dock Complex',
    destinationBerth: 'Berth #2 (Lock Basin)',
    destinationCountry: 'India',
    assignedRouteCorridor: 'Strait of Malacca Standard Track',
    contractType: 'COA',
    voyageLeg: 'LADEN_OUTBOUND',

    totalDistanceNM: 2960,
    distanceTraveledNM: 2960,
    distanceToGoNM: 0,
    progressPct: 100.0,
    projectedEta: 'Anchored (Awaiting Next High Tide Lock Window)',
    etaHoursRemaining: 0,
    etaDaysRemaining: 0,
    speedMode: 'VIRTUAL_ARRIVAL',
    weatherImpactKts: 0,

    destinationPortMaxDraft: 10.5,
    destinationPortMaxLOA: 210,
    isDraftCompliant: false,
    lighteringRequired: true,
    lighteringEstimatedCostUSD: 198000,
    berthFitAssessment: 'AT SANDHEADS ANCHORAGE: Awaiting emergency lightering following River Hooghly siltation reducing max draft to 9.8m. Waiting 36 hours.',
    demurrageRiskAtEta: 'CRITICAL',
    projectedAnchorageWaitHours: 36,

    recentTrail: [
      { lat: -3.72, lng: 114.47, timestamp: 'Aug 19' },
      { lat: 1.25, lng: 103.80, timestamp: 'Aug 23' },
      { lat: 12.00, lng: 90.00, timestamp: 'Aug 27' },
      { lat: 21.00, lng: 88.30, timestamp: 'Aug 29 (Anchored)' }
    ],
    plannedTrack: [
      { lat: 21.00, lng: 88.30, name: 'Sandheads Outer Pilot Station (Anchored)' },
      { lat: 22.02, lng: 88.06, name: 'Haldia Lock Gates' }
    ],
    currentWeather: {
      seaState: 'Slight River Chop',
      waveHeightM: 0.9,
      windKts: 14,
      windDirection: 'SSW (200°)',
      condition: 'River fog patches, reduced visibility'
    }
  },
  {
    id: 'vessel-eastern-venture',
    name: 'Eastern Venture',
    imo: '9455123',
    mmsi: '565018223',
    callSign: '9V5122',
    flag: 'Singapore',
    flagCode: 'SG',
    vesselClass: 'Supramax',
    dwt: 52400,
    loa: 189.0,
    beam: 32.26,
    currentDraft: 10.9,
    maxDraft: 11.2,
    builtYear: 2013,
    ownerOperator: 'Eastern Pacific Shipping Pte Ltd',

    coordinates: { lat: 22.00, lng: 88.10 },
    heading: 15,
    cog: 0,
    sog: 0.0,
    navStatus: 'ANCHORAGE',
    lastAisPing: 'Live (Real-Time Shore Radar)',

    cargoType: 'Manganese Ore (39,000 MT)',
    cargoParcelMT: 39000,
    originPort: 'Richards Bay Coal Terminal (RBCT)',
    originCountry: 'South Africa',
    departureDate: '2026-08-14 09:00 UTC',
    destinationPort: 'Haldia Dock Complex',
    destinationBerth: 'Berth #4B',
    destinationCountry: 'India',
    assignedRouteCorridor: 'South Africa - Bay of Bengal Great Circle',
    contractType: 'FOB_SALE',
    voyageLeg: 'LADEN_OUTBOUND',

    totalDistanceNM: 5740,
    distanceTraveledNM: 5740,
    distanceToGoNM: 0,
    progressPct: 100.0,
    projectedEta: 'Anchored (Awaiting Next High Tide Lock Window)',
    etaHoursRemaining: 0,
    etaDaysRemaining: 0,
    speedMode: 'VIRTUAL_ARRIVAL',
    weatherImpactKts: 0,

    destinationPortMaxDraft: 10.5,
    destinationPortMaxLOA: 210,
    isDraftCompliant: false,
    lighteringRequired: true,
    lighteringEstimatedCostUSD: 87500,
    berthFitAssessment: 'AT BERTH 4B QUEUE: Draft marginally over reduced 9.8m sill; awaiting partial skim discharge to Sandheads barge before lock entry.',
    demurrageRiskAtEta: 'HIGH',
    projectedAnchorageWaitHours: 31,

    recentTrail: [
      { lat: -28.80, lng: 32.05, timestamp: 'Aug 14' },
      { lat: -10.00, lng: 60.00, timestamp: 'Aug 20' },
      { lat: 6.00, lng: 80.00, timestamp: 'Aug 25' },
      { lat: 22.00, lng: 88.10, timestamp: 'Aug 28 (Anchored)' }
    ],
    plannedTrack: [
      { lat: 22.00, lng: 88.10, name: 'Sandheads / Berth 4B Queue (Anchored)' },
      { lat: 22.02, lng: 88.06, name: 'Haldia Lock Gates' }
    ],
    currentWeather: {
      seaState: 'Slight River Chop',
      waveHeightM: 0.8,
      windKts: 13,
      windDirection: 'SSW (195°)',
      condition: 'River fog patches, reduced visibility'
    }
  },
  {
    id: 'vessel-andhra-glory',
    name: 'MV Andhra Glory',
    imo: '9601147',
    mmsi: '419001120',
    callSign: 'ATAG5',
    flag: 'India',
    flagCode: 'IN',
    vesselClass: 'Panamax',
    dwt: 82000,
    loa: 229.0,
    beam: 32.26,
    currentDraft: 14.3,
    maxDraft: 14.5,
    builtYear: 2018,
    ownerOperator: 'Shipping Corporation of India (SCI)',

    coordinates: { lat: 17.70, lng: 83.35 },
    heading: 5,
    cog: 0,
    sog: 0.0,
    navStatus: 'ANCHORAGE',
    lastAisPing: 'Live (Real-Time Shore Radar)',

    cargoType: 'Thermal Coal (78,000 MT)',
    cargoParcelMT: 78000,
    originPort: 'Taboneo Anchorage',
    originCountry: 'Indonesia',
    departureDate: '2026-08-17 05:00 UTC',
    destinationPort: 'Visakhapatnam',
    destinationBerth: 'EQ-1 Coal Berth',
    destinationCountry: 'India',
    assignedRouteCorridor: 'Strait of Malacca Standard Track',
    contractType: 'TIME_CHARTER',
    voyageLeg: 'LADEN_OUTBOUND',

    totalDistanceNM: 2860,
    distanceTraveledNM: 2860,
    distanceToGoNM: 0,
    progressPct: 100.0,
    projectedEta: 'Arrived (Awaiting Berth)',
    etaHoursRemaining: 0,
    etaDaysRemaining: 0,
    speedMode: 'VIRTUAL_ARRIVAL',
    weatherImpactKts: 0,

    destinationPortMaxDraft: 16.5,
    destinationPortMaxLOA: 280,
    isDraftCompliant: true,
    lighteringRequired: false,
    berthFitAssessment: 'AT VIZAG OUTER ANCHORAGE: Draft compliant, awaiting berth clearance amid inner harbor maintenance queue. Waiting 29.5 hours.',
    demurrageRiskAtEta: 'HIGH',
    projectedAnchorageWaitHours: 29.5,

    recentTrail: [
      { lat: -3.72, lng: 114.47, timestamp: 'Aug 17' },
      { lat: 1.25, lng: 103.80, timestamp: 'Aug 20' },
      { lat: 10.00, lng: 90.00, timestamp: 'Aug 23' },
      { lat: 17.70, lng: 83.35, timestamp: 'Aug 26 (Anchored)' }
    ],
    plannedTrack: [
      { lat: 17.70, lng: 83.35, name: 'Vizag Outer Anchorage #1 (Anchored)' },
      { lat: 17.69, lng: 83.29, name: 'Visakhapatnam EQ-1 Coal Berth' }
    ],
    currentWeather: {
      seaState: 'Moderate Sea State 3',
      waveHeightM: 1.6,
      windKts: 17,
      windDirection: 'ESE (110°)',
      condition: 'Partly cloudy'
    }
  },
  {
    id: 'vessel-ocean-pioneer',
    name: 'MV Ocean Pioneer',
    imo: '9587221',
    mmsi: '538008834',
    callSign: 'V7OP4',
    flag: 'Marshall Islands',
    flagCode: 'MH',
    vesselClass: 'Panamax',
    dwt: 74000,
    loa: 225.0,
    beam: 32.26,
    currentDraft: 14.0,
    maxDraft: 14.3,
    builtYear: 2016,
    ownerOperator: 'Diana Shipping Inc.',

    coordinates: { lat: 20.30, lng: 86.75 },
    heading: 90,
    cog: 0,
    sog: 0.0,
    navStatus: 'ANCHORAGE',
    lastAisPing: 'Live (Real-Time Shore Radar)',

    cargoType: 'Thermal Coal (72,000 MT)',
    cargoParcelMT: 72000,
    originPort: 'Newcastle (Kooragang)',
    originCountry: 'Australia',
    departureDate: '2026-08-14 10:00 UTC',
    destinationPort: 'Paradip Port',
    destinationBerth: 'Berth 1 (Mechanized Coal)',
    destinationCountry: 'India',
    assignedRouteCorridor: 'Strait of Malacca Standard Track',
    contractType: 'SPOT',
    voyageLeg: 'LADEN_OUTBOUND',

    totalDistanceNM: 5612,
    distanceTraveledNM: 5612,
    distanceToGoNM: 0,
    progressPct: 100.0,
    projectedEta: 'Arrived (Awaiting Berth), ETA Berth Today 21:30',
    etaHoursRemaining: 0,
    etaDaysRemaining: 0,
    speedMode: 'VIRTUAL_ARRIVAL',
    weatherImpactKts: 0,

    destinationPortMaxDraft: 14.5,
    destinationPortMaxLOA: 260,
    isDraftCompliant: true,
    lighteringRequired: false,
    berthFitAssessment: 'AT PARADIP OUTER ANCHORAGE: Compliant draft, staged for Berth 1 mechanized coal line. Waiting 17.5 hours.',
    demurrageRiskAtEta: 'MODERATE',
    projectedAnchorageWaitHours: 17.5,

    recentTrail: [
      { lat: -32.92, lng: 151.78, timestamp: 'Aug 14' },
      { lat: -10.55, lng: 142.15, timestamp: 'Aug 18' },
      { lat: 1.25, lng: 103.80, timestamp: 'Aug 23' },
      { lat: 20.30, lng: 86.75, timestamp: 'Aug 28 (Anchored)' }
    ],
    plannedTrack: [
      { lat: 20.30, lng: 86.75, name: 'Paradip Outer Anchorage (Anchored)' },
      { lat: 20.26, lng: 86.67, name: 'Paradip Berth 1 (Mechanized Coal)' }
    ],
    currentWeather: {
      seaState: 'Moderate Sea State 4',
      waveHeightM: 2.1,
      windKts: 18,
      windDirection: 'SSW (205°)',
      condition: 'Monsoon overcast'
    }
  },
  {
    id: 'vessel-star-crimson',
    name: 'Star Crimson',
    imo: '9412887',
    mmsi: '636019123',
    callSign: 'D5SC9',
    flag: 'Liberia',
    flagCode: 'LR',
    vesselClass: 'Capesize',
    dwt: 152000,
    loa: 289.0,
    beam: 45.0,
    currentDraft: 17.9,
    maxDraft: 18.2,
    builtYear: 2011,
    ownerOperator: 'Star Bulk Carriers Corp',

    coordinates: { lat: 20.10, lng: 86.90 },
    heading: 100,
    cog: 0,
    sog: 0.0,
    navStatus: 'ANCHORAGE',
    lastAisPing: 'Live (Real-Time Shore Radar)',

    cargoType: 'Iron Ore Fines (148,000 MT)',
    cargoParcelMT: 148000,
    originPort: 'Port Hedland (Utah Point)',
    originCountry: 'Australia',
    departureDate: '2026-08-16 12:00 UTC',
    destinationPort: 'Paradip Port',
    destinationBerth: 'Deep Offshore Anchorage (Lightering Required)',
    destinationCountry: 'India',
    assignedRouteCorridor: 'Lombok Strait Deep-Water Corridor',
    contractType: 'SPOT',
    voyageLeg: 'LADEN_OUTBOUND',

    totalDistanceNM: 4680,
    distanceTraveledNM: 4680,
    distanceToGoNM: 0,
    progressPct: 100.0,
    projectedEta: 'Arrived (Awaiting Berth), ETA Berth Tomorrow 06:00',
    etaHoursRemaining: 0,
    etaDaysRemaining: 0,
    speedMode: 'VIRTUAL_ARRIVAL',
    weatherImpactKts: 0,

    destinationPortMaxDraft: 14.5,
    destinationPortMaxLOA: 260,
    isDraftCompliant: false,
    lighteringRequired: true,
    lighteringEstimatedCostUSD: 621600,
    berthFitAssessment: 'HYDROGRAPHIC RESTRICTION: 17.9m draft exceeds Paradip 14.5m harbor limit. Offshore barge transshipment required (+4.20/MT).',
    demurrageRiskAtEta: 'HIGH',
    projectedAnchorageWaitHours: 22,

    recentTrail: [
      { lat: -20.31, lng: 118.57, timestamp: 'Aug 16' },
      { lat: -8.75, lng: 115.75, timestamp: 'Aug 20 (Lombok Passage)' },
      { lat: 5.00, lng: 92.00, timestamp: 'Aug 24' },
      { lat: 20.10, lng: 86.90, timestamp: 'Aug 27 (Anchored)' }
    ],
    plannedTrack: [
      { lat: 20.10, lng: 86.90, name: 'Paradip Deep Offshore Anchorage (Anchored)' }
    ],
    currentWeather: {
      seaState: 'Moderate Sea State 4',
      waveHeightM: 2.0,
      windKts: 19,
      windDirection: 'SSW (208°)',
      condition: 'Monsoon overcast with swell'
    }
  },
  {
    id: 'vessel-pacific-fortune',
    name: 'Pacific Fortune',
    imo: '9498562',
    mmsi: '354890998',
    callSign: '3EPF6',
    flag: 'Panama',
    flagCode: 'PA',
    vesselClass: 'Supramax',
    dwt: 58000,
    loa: 189.9,
    beam: 32.26,
    currentDraft: 12.8,
    maxDraft: 13.0,
    builtYear: 2015,
    ownerOperator: 'Pacific Basin Shipping Ltd',

    coordinates: { lat: 20.28, lng: 86.70 },
    heading: 95,
    cog: 0,
    sog: 0.0,
    navStatus: 'ANCHORAGE',
    lastAisPing: 'Live (Real-Time Shore Radar)',

    cargoType: 'Coking Coal (55,000 MT)',
    cargoParcelMT: 55000,
    originPort: 'Taboneo Anchorage',
    originCountry: 'Indonesia',
    departureDate: '2026-08-25 07:00 UTC',
    destinationPort: 'Paradip Port',
    destinationBerth: 'Berth 2 (General Bulk)',
    destinationCountry: 'India',
    assignedRouteCorridor: 'Strait of Malacca Standard Track',
    contractType: 'COA',
    voyageLeg: 'LADEN_OUTBOUND',

    totalDistanceNM: 2680,
    distanceTraveledNM: 2680,
    distanceToGoNM: 0,
    progressPct: 100.0,
    projectedEta: 'Arrived (Awaiting Berth), ETA Berth Today 18:00',
    etaHoursRemaining: 0,
    etaDaysRemaining: 0,
    speedMode: 'VIRTUAL_ARRIVAL',
    weatherImpactKts: 0,

    destinationPortMaxDraft: 14.5,
    destinationPortMaxLOA: 260,
    isDraftCompliant: true,
    lighteringRequired: false,
    berthFitAssessment: 'AT PARADIP OUTER ANCHORAGE: Compliant draft, staged for Berth 2 general bulk queue. Waiting 13.0 hours.',
    demurrageRiskAtEta: 'LOW',
    projectedAnchorageWaitHours: 13,

    recentTrail: [
      { lat: -3.72, lng: 114.47, timestamp: 'Aug 25' },
      { lat: 1.25, lng: 103.80, timestamp: 'Aug 27' },
      { lat: 12.00, lng: 89.00, timestamp: 'Aug 29' },
      { lat: 20.28, lng: 86.70, timestamp: 'Aug 30 (Anchored)' }
    ],
    plannedTrack: [
      { lat: 20.28, lng: 86.70, name: 'Paradip Outer Anchorage (Anchored)' },
      { lat: 20.26, lng: 86.67, name: 'Paradip Berth 2 (General Bulk)' }
    ],
    currentWeather: {
      seaState: 'Moderate Sea State 4',
      waveHeightM: 2.1,
      windKts: 18,
      windDirection: 'SSW (206°)',
      condition: 'Monsoon overcast'
    }
  },
  {
    id: 'vessel-kwazulu-trader',
    name: 'Kwazulu Trader',
    imo: '9633892',
    mmsi: '601008745',
    callSign: 'ZSKT4',
    flag: 'South Africa',
    flagCode: 'ZA',
    vesselClass: 'Capesize',
    dwt: 168000,
    loa: 289.0,
    beam: 45.0,
    currentDraft: 9.4,
    maxDraft: 18.0,
    builtYear: 2013,
    ownerOperator: 'Grindrod Shipping Holdings Ltd',

    coordinates: { lat: -28.75, lng: 32.10 },
    heading: 60,
    cog: 0,
    sog: 0.0,
    navStatus: 'ANCHORAGE',
    lastAisPing: 'Live (5 mins ago via Terrestrial AIS)',

    cargoType: 'Anthracite (Nominated Parcel, Not Yet Loaded)',
    cargoParcelMT: 162000,
    originPort: 'Richards Bay Coal Terminal (RBCT)',
    originCountry: 'South Africa',
    departureDate: 'Pending Loading Completion',
    destinationPort: 'Paradip Port',
    destinationBerth: 'Coal Berth #2',
    destinationCountry: 'India',
    assignedRouteCorridor: 'South Africa - Bay of Bengal Great Circle',
    contractType: 'TIME_CHARTER',
    voyageLeg: 'BALLAST_RETURN',

    totalDistanceNM: 4780,
    distanceTraveledNM: 0,
    distanceToGoNM: 4780,
    progressPct: 0.0,
    projectedEta: 'Pending Departure (Rail Feed Delay)',
    etaHoursRemaining: 0,
    etaDaysRemaining: 0,
    speedMode: 'ECO_SPEED',
    weatherImpactKts: 0,

    destinationPortMaxDraft: 14.5,
    destinationPortMaxLOA: 260,
    isDraftCompliant: true,
    lighteringRequired: false,
    berthFitAssessment: 'PRE-LOADING: Vessel in ballast awaiting RBCT Berth 2 loading slot; final draft compliance to be reassessed once fully laden.',
    demurrageRiskAtEta: 'MODERATE',
    projectedAnchorageWaitHours: 30,

    recentTrail: [
      { lat: -28.75, lng: 32.10, timestamp: 'Aug 28 (Ballast Arrival)' },
      { lat: -28.75, lng: 32.10, timestamp: 'Aug 30 (Now, Awaiting Loading)' }
    ],
    plannedTrack: [
      { lat: -28.75, lng: 32.10, name: 'RBCT Loading Queue (Ballast)' },
      { lat: 20.26, lng: 86.67, name: 'Paradip Coal Berth #2' }
    ],
    currentWeather: {
      seaState: 'Slight Sea State 2',
      waveHeightM: 1.2,
      windKts: 15,
      windDirection: 'NE (45°)',
      condition: 'Warm and clear'
    }
  },
  {
    id: 'vessel-coral-trader',
    name: 'MV Coral Trader',
    imo: '9744120',
    mmsi: '503009654',
    callSign: 'VLCT8',
    flag: 'Australia',
    flagCode: 'AU',
    vesselClass: 'Panamax',
    dwt: 76500,
    loa: 225.0,
    beam: 32.26,
    currentDraft: 8.6,
    maxDraft: 14.4,
    builtYear: 2019,
    ownerOperator: 'Bulk Carriers Australia Pty Ltd',

    coordinates: { lat: -32.95, lng: 151.85 },
    heading: 45,
    cog: 0,
    sog: 0.0,
    navStatus: 'ANCHORAGE',
    lastAisPing: 'Live (2 mins ago via Terrestrial AIS)',

    cargoType: 'Thermal Coal (Nominated Parcel, Not Yet Loaded)',
    cargoParcelMT: 74500,
    originPort: 'Newcastle (Kooragang)',
    originCountry: 'Australia',
    departureDate: 'Pending Loading Completion',
    destinationPort: 'Dhamra Port',
    destinationBerth: 'Berth 1 (Bulk)',
    destinationCountry: 'India',
    assignedRouteCorridor: 'Strait of Malacca Standard Track',
    contractType: 'SPOT',
    voyageLeg: 'BALLAST_RETURN',

    totalDistanceNM: 5630,
    distanceTraveledNM: 0,
    distanceToGoNM: 5630,
    progressPct: 0.0,
    projectedEta: 'Pending Departure (Shiploader Queue)',
    etaHoursRemaining: 0,
    etaDaysRemaining: 0,
    speedMode: 'ECO_SPEED',
    weatherImpactKts: 0,

    destinationPortMaxDraft: 18.0,
    destinationPortMaxLOA: 320,
    isDraftCompliant: true,
    lighteringRequired: false,
    berthFitAssessment: 'PRE-LOADING: Vessel in ballast awaiting Kooragang Berth 1 shiploader slot; final draft compliance to be reassessed once fully laden.',
    demurrageRiskAtEta: 'LOW',
    projectedAnchorageWaitHours: 14,

    recentTrail: [
      { lat: -32.95, lng: 151.85, timestamp: 'Aug 29 (Ballast Arrival)' },
      { lat: -32.95, lng: 151.85, timestamp: 'Aug 30 (Now, Awaiting Loading)' }
    ],
    plannedTrack: [
      { lat: -32.95, lng: 151.85, name: 'Newcastle Loading Queue (Ballast)' },
      { lat: 20.82, lng: 86.97, name: 'Dhamra Berth 1 (Bulk)' }
    ],
    currentWeather: {
      seaState: 'Slight Sea State 2',
      waveHeightM: 1.1,
      windKts: 16,
      windDirection: 'SE (140°)',
      condition: 'Fresh breeze, clear skies'
    }
  },
  {
    id: 'vessel-volga-endeavour',
    name: 'MV Volga Endeavour',
    imo: '9788213',
    mmsi: '273451890',
    callSign: 'UBVE7',
    flag: 'Russia',
    flagCode: 'RU',
    vesselClass: 'Panamax',
    dwt: 78200,
    loa: 229.0,
    beam: 32.26,
    currentDraft: 14.0,
    maxDraft: 14.3,
    builtYear: 2015,
    ownerOperator: 'Sovcomflot Dry Bulk Division',

    coordinates: { lat: 27.30, lng: 34.10 },
    heading: 155,
    cog: 154,
    sog: 12.8,
    navStatus: 'UNDERWAY',
    lastAisPing: 'Live (7 mins ago via Satellite AIS)',

    cargoType: 'Steam Coal (Kuzbass Blend, 6,000 kcal/kg)',
    cargoParcelMT: 75500,
    originPort: 'Taman Bay Coal Terminal',
    originCountry: 'Russia',
    departureDate: '2026-08-12 14:00 UTC',
    destinationPort: 'Paradip Port',
    destinationBerth: 'Coal Berth #1 (Direct Conveyor)',
    destinationCountry: 'India',
    assignedRouteCorridor: 'Black Sea - Suez - Bab-el-Mandeb Corridor',
    contractType: 'COA',
    voyageLeg: 'LADEN_OUTBOUND',

    totalDistanceNM: 7350,
    distanceTraveledNM: 2650,
    distanceToGoNM: 4700,
    progressPct: 36.1,
    projectedEta: '2026-09-14 06:00 UTC',
    etaHoursRemaining: 367.2,
    etaDaysRemaining: 15.3,
    speedMode: 'LADEN_FULL',
    weatherImpactKts: -0.3,

    destinationPortMaxDraft: 14.5,
    destinationPortMaxLOA: 260,
    isDraftCompliant: true,
    lighteringRequired: false,
    berthFitAssessment: 'OPTIMAL FIT: 14.0m laden draft fits within Paradip 14.5m CD channel with adequate safety UKC.',
    demurrageRiskAtEta: 'LOW',
    projectedAnchorageWaitHours: 15,

    recentTrail: [
      { lat: 45.22, lng: 36.75, timestamp: 'Aug 12' },
      { lat: 41.05, lng: 29.02, timestamp: 'Aug 14 (Bosphorus Transit)' },
      { lat: 35.00, lng: 25.00, timestamp: 'Aug 17 (Aegean/Mediterranean)' },
      { lat: 31.30, lng: 32.30, timestamp: 'Aug 20 (Suez Northern Approach)' },
      { lat: 27.30, lng: 34.10, timestamp: 'Aug 22 (Now, Gulf of Suez)' }
    ],
    plannedTrack: [
      { lat: 27.30, lng: 34.10, name: 'Current AIS Position (Gulf of Suez)' },
      { lat: 12.60, lng: 43.40, name: 'Bab-el-Mandeb Strait' },
      { lat: 10.00, lng: 60.00, name: 'Arabian Sea Deep Basin' },
      { lat: 5.00, lng: 80.00, name: 'South of Sri Lanka Waypoint' },
      { lat: 20.26, lng: 86.67, name: 'Paradip Pilot Boarding Station' }
    ],
    currentWeather: {
      seaState: 'Slight Sea State 2',
      waveHeightM: 1.0,
      windKts: 13,
      windDirection: 'NNW (335°)',
      condition: 'Clear, hot and dry'
    }
  },
  {
    id: 'vessel-nacala-pioneer',
    name: 'MV Nacala Pioneer',
    imo: '9633127',
    mmsi: '650009321',
    callSign: 'C9NP5',
    flag: 'Mozambique',
    flagCode: 'MZ',
    vesselClass: 'Supramax',
    dwt: 58500,
    loa: 190.0,
    beam: 32.26,
    currentDraft: 13.0,
    maxDraft: 13.3,
    builtYear: 2016,
    ownerOperator: 'Vale Logistics Shipping SA',

    coordinates: { lat: -8.00, lng: 55.00 },
    heading: 60,
    cog: 59,
    sog: 13.4,
    navStatus: 'UNDERWAY',
    lastAisPing: 'Live (3 mins ago via Satellite AIS)',

    cargoType: 'Coking Coal (Moatize Basin, via Nacala Corridor)',
    cargoParcelMT: 56800,
    originPort: 'Nacala Port (Vale Logistics Corridor)',
    originCountry: 'Mozambique',
    departureDate: '2026-08-23 10:00 UTC',
    destinationPort: 'Gangavaram Port',
    destinationBerth: 'Deepwater Bulk Berth #2 (19.5m CD)',
    destinationCountry: 'India',
    assignedRouteCorridor: 'Mozambique Channel - Central Indian Ocean Direct',
    contractType: 'SPOT',
    voyageLeg: 'LADEN_OUTBOUND',

    totalDistanceNM: 3100,
    distanceTraveledNM: 1550,
    distanceToGoNM: 1550,
    progressPct: 50.0,
    projectedEta: '2026-09-03 12:00 UTC',
    etaHoursRemaining: 115.7,
    etaDaysRemaining: 4.8,
    speedMode: 'LADEN_FULL',
    weatherImpactKts: -0.2,

    destinationPortMaxDraft: 19.5,
    destinationPortMaxLOA: 320,
    isDraftCompliant: true,
    lighteringRequired: false,
    berthFitAssessment: 'PERFECT FIT FOR GANGAVARAM: 13.0m laden draft fully accepted at Gangavaram deep berth without lightering penalty.',
    demurrageRiskAtEta: 'LOW',
    projectedAnchorageWaitHours: 6,

    recentTrail: [
      { lat: -14.57, lng: 40.68, timestamp: 'Aug 23' },
      { lat: -10.50, lng: 48.00, timestamp: 'Aug 26 (North of Madagascar)' },
      { lat: -8.00, lng: 55.00, timestamp: 'Aug 28 (Now, Central Indian Ocean)' }
    ],
    plannedTrack: [
      { lat: -8.00, lng: 55.00, name: 'Current AIS Position (Central Indian Ocean)' },
      { lat: 0.00, lng: 70.00, name: 'Equatorial Crossing Waypoint' },
      { lat: 17.62, lng: 83.24, name: 'Gangavaram Deepwater Basin' }
    ],
    currentWeather: {
      seaState: 'Moderate Sea State 3',
      waveHeightM: 1.7,
      windKts: 15,
      windDirection: 'SE (135°)',
      condition: 'Steady trade wind, good visibility'
    }
  }
];

// Helper function to step vessel positions smoothly
export function simulateVesselTick(
  vessels: TrackedVessel[],
  deltaSeconds: number = 2,
  speedMultiplier: number = 1
): TrackedVessel[] {
  return vessels.map(v => {
    if (v.navStatus === 'BERTHED' || v.navStatus === 'ANCHORAGE') {
      return v;
    }

    // Convert speed (knots = NM / hour) to coordinate degree shift
    // 1 knot = 1 NM/hr ~= 1/60 degrees latitude per hour
    const hoursElapsed = (deltaSeconds * speedMultiplier) / 3600;
    const distanceStepNM = v.sog * hoursElapsed;
    
    // Heading in radians
    const headingRad = (v.heading * Math.PI) / 180;
    
    const dLat = (Math.cos(headingRad) * distanceStepNM) / 60;
    const dLng = (Math.sin(headingRad) * distanceStepNM) / (60 * Math.cos((v.coordinates.lat * Math.PI) / 180));
    
    const newLat = v.coordinates.lat + dLat;
    const newLng = v.coordinates.lng + dLng;
    
    const newDistanceTraveled = Math.min(v.totalDistanceNM, v.distanceTraveledNM + distanceStepNM);
    const newDistanceToGo = Math.max(0, v.totalDistanceNM - newDistanceTraveled);
    const newProgressPct = Number(((newDistanceTraveled / v.totalDistanceNM) * 100).toFixed(1));
    const newEtaHours = v.sog > 0 ? Number((newDistanceToGo / v.sog).toFixed(1)) : 0;
    const newEtaDays = Number((newEtaHours / 24).toFixed(1));
    
    return {
      ...v,
      coordinates: {
        lat: Number(newLat.toFixed(4)),
        lng: Number(newLng.toFixed(4))
      },
      distanceTraveledNM: Math.round(newDistanceTraveled),
      distanceToGoNM: Math.round(newDistanceToGo),
      progressPct: newProgressPct,
      etaHoursRemaining: newEtaHours,
      etaDaysRemaining: newEtaDays,
      lastAisPing: 'Live (AIS Ping just now)'
    };
  });
}

// Recalculate ETA based on interactive speed adjustments
export function recalculateVesselEta(vessel: TrackedVessel, targetSpeedKts: number): {
  speed: number;
  etaHours: number;
  etaDays: number;
  etaDateFormatted: string;
  fuelBurnDeltaPct: number;
  bunkerCostSavingsUSD: number;
} {
  const effectiveSpeed = Math.max(8, Math.min(18, targetSpeedKts + vessel.weatherImpactKts));
  const etaHours = Number((vessel.distanceToGoNM / effectiveSpeed).toFixed(1));
  const etaDays = Number((etaHours / 24).toFixed(1));
  
  // Calculate projected date
  const now = new Date();
  const arrivalDate = new Date(now.getTime() + etaHours * 3600 * 1000);
  const etaDateFormatted = arrivalDate.toUTCString().slice(0, 22) + ' UTC';
  
  // Fuel burn cubic relation ~ (speed / designSpeed)^3
  const baselineSpeed = 14.0;
  const fuelBurnFactor = Math.pow(targetSpeedKts / baselineSpeed, 3);
  const fuelBurnDeltaPct = Number(((fuelBurnFactor - 1) * 100).toFixed(1));
  
  // Standard daily consumption 32 MT/day @ $620/MT
  const dailyFuelCostUSD = 32 * 620;
  const totalDays = etaHours / 24;
  const baselineCost = totalDays * dailyFuelCostUSD;
  const adjustedCost = totalDays * (dailyFuelCostUSD * fuelBurnFactor);
  const bunkerCostSavingsUSD = Math.round(baselineCost - adjustedCost);
  
  return {
    speed: targetSpeedKts,
    etaHours,
    etaDays,
    etaDateFormatted,
    fuelBurnDeltaPct,
    bunkerCostSavingsUSD
  };
}
