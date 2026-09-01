import React, { useState, useMemo } from 'react';
import { portIntelligenceData } from '../data/maritimeData';
import { portMapLocations, chokepointMarkers } from '../data/vesselTrackingData';
import { getSimplifiedLandRings } from '../utils/geo';
import { WorldMonitorMap } from './WorldMonitorMap/WorldMonitorMap';

type CorridorKey = 'malacca' | 'lombok' | 'sunda' | 'black_sea' | 'mozambique';

type WaypointRef =
  | { type: 'PORT'; id: string }
  | { type: 'CHOKEPOINT'; id: string }
  // Unlabeled open-sea transit point (Arafura Sea, Makassar Strait, etc.) — fills the gap
  // between two named waypoints so the plotted line follows real open water instead of
  // cutting a straight line across Indonesia/the Mediterranean/the Red Sea.
  | { type: 'SEA'; lat: number; lng: number; name: string };

interface CorridorDefinition {
  label: string;
  distanceNM: number;
  securityRisk: 'LOW (MARSEC 1)' | 'MODERATE' | 'HIGH';
  draftLimit: string;
  notes: string;
  waypointRefs: WaypointRef[];
}

// Real corridors built from the same port/chokepoint data driving the World Monitor Map,
// instead of a hardcoded illustration for a single fixed route.
const CORRIDOR_DEFINITIONS: Record<CorridorKey, CorridorDefinition> = {
  malacca: {
    label: 'Strait of Malacca Standard Track (Default)',
    distanceNM: 5612,
    securityRisk: 'LOW (MARSEC 1)',
    draftLimit: '22.5m (Malacca Max Clearance)',
    notes: 'Shortest great-circle transit. High traffic density at One Fathom Bank, compulsory TSS adherence. Bunkers at Singapore before the Bay of Bengal crossing.',
    waypointRefs: [
      { type: 'PORT', id: 'newcastle' },
      { type: 'SEA', lat: -18.0, lng: 158.0, name: 'Coral Sea Transit' },
      { type: 'CHOKEPOINT', id: 'torres_strait' },
      { type: 'SEA', lat: -8.0, lng: 133.0, name: 'Arafura Sea Transit' },
      { type: 'SEA', lat: -6.0, lng: 124.0, name: 'Banda Sea Transit' },
      { type: 'SEA', lat: -1.0, lng: 119.0, name: 'Makassar Strait Transit' },
      { type: 'SEA', lat: 3.0, lng: 113.0, name: 'South China Sea Transit' },
      { type: 'CHOKEPOINT', id: 'malacca_tss' },
      { type: 'PORT', id: 'singapore' },
      { type: 'SEA', lat: 6.0, lng: 97.0, name: 'Andaman Sea Transit' },
      { type: 'PORT', id: 'paradip' }
    ]
  },
  lombok: {
    label: 'Lombok Strait Deep-Water Corridor',
    distanceNM: 6092,
    securityRisk: 'LOW (MARSEC 1)',
    draftLimit: 'No draft restriction (>200m depth)',
    notes: 'Preferred for fully laden Capesize and Newcastlemax (>19m draft) to avoid Malacca shallows. +480 NM vs the standard track.',
    waypointRefs: [
      { type: 'PORT', id: 'newcastle' },
      { type: 'SEA', lat: -40.0, lng: 148.0, name: 'Tasman Sea (South of Australia)' },
      { type: 'SEA', lat: -40.0, lng: 115.0, name: 'Great Australian Bight' },
      { type: 'SEA', lat: -22.0, lng: 105.0, name: 'Offshore Western Australia' },
      { type: 'SEA', lat: -11.0, lng: 113.0, name: 'Lombok Approach (South)' },
      { type: 'CHOKEPOINT', id: 'lombok_strait' },
      { type: 'SEA', lat: -3.0, lng: 100.0, name: 'Indian Ocean, West of Sumatra' },
      { type: 'PORT', id: 'paradip' }
    ]
  },
  sunda: {
    label: 'Sunda Strait Alternative Passage',
    distanceNM: 5880,
    securityRisk: 'MODERATE',
    draftLimit: '18.0m (Strong tidal currents & volcanic shoals)',
    notes: 'Alternative direct oceanic passage through the Krakatoa channel. Heavy volcanic and tidal cross-currents.',
    waypointRefs: [
      { type: 'PORT', id: 'newcastle' },
      { type: 'SEA', lat: -18.0, lng: 158.0, name: 'Coral Sea Transit' },
      { type: 'CHOKEPOINT', id: 'torres_strait' },
      { type: 'SEA', lat: -9.0, lng: 130.0, name: 'Timor Sea Transit' },
      { type: 'SEA', lat: -7.0, lng: 112.0, name: 'Java Sea Transit' },
      { type: 'CHOKEPOINT', id: 'sunda_strait' },
      { type: 'SEA', lat: 2.0, lng: 95.0, name: 'Eastern Indian Ocean' },
      { type: 'PORT', id: 'paradip' }
    ]
  },
  black_sea: {
    label: 'Black Sea – Suez – Bab-el-Mandeb Corridor',
    distanceNM: 7350,
    securityRisk: 'MODERATE',
    draftLimit: '20.1m (Suezmax, Convoy System)',
    notes: 'Russian Black Sea coal export route. Mandatory Bosphorus transit, scheduled Suez Canal convoy, then heightened-watch passage through Bab-el-Mandeb into the Arabian Sea.',
    waypointRefs: [
      { type: 'PORT', id: 'taman' },
      { type: 'CHOKEPOINT', id: 'bosphorus_strait' },
      { type: 'SEA', lat: 36.0, lng: 24.0, name: 'Aegean Sea Transit' },
      { type: 'SEA', lat: 32.0, lng: 30.0, name: 'Eastern Mediterranean Transit' },
      { type: 'CHOKEPOINT', id: 'suez_canal' },
      { type: 'SEA', lat: 20.0, lng: 38.0, name: 'Red Sea Mid-Channel' },
      { type: 'CHOKEPOINT', id: 'bab_el_mandeb' },
      { type: 'SEA', lat: 12.0, lng: 62.0, name: 'Arabian Sea Transit' },
      { type: 'PORT', id: 'paradip' }
    ]
  },
  mozambique: {
    label: 'Mozambique Channel – Central Indian Ocean Direct',
    distanceNM: 3100,
    securityRisk: 'LOW (MARSEC 1)',
    draftLimit: '17.0m (Nacala Deep Natural Harbor)',
    notes: 'Direct East Africa to India East Coast crossing via the Mozambique Channel and central Indian Ocean — no major chokepoint transit required.',
    waypointRefs: [
      { type: 'PORT', id: 'nacala' },
      { type: 'PORT', id: 'gangavaram' }
    ]
  }
};

interface LiveWaypoint {
  ref: WaypointRef;
  name: string;
  lat: number;
  lng: number;
  isBunker: boolean;
  headline: string;
  detailLine1: string;
  detailLine2: string;
}

function buildWaypoint(ref: WaypointRef): LiveWaypoint | null {
  if (ref.type === 'SEA') {
    return {
      ref,
      name: ref.name,
      lat: ref.lat,
      lng: ref.lng,
      isBunker: false,
      headline: 'Open-Sea Transit',
      detailLine1: 'Deep oceanic waypoint — no port or chokepoint restrictions apply here.',
      detailLine2: 'Standard open-ocean navigation'
    };
  }
  if (ref.type === 'PORT') {
    const port = portMapLocations.find(p => p.id === ref.id);
    if (!port) return null;
    return {
      ref,
      name: `${port.name} (${port.country})`,
      lat: port.lat,
      lng: port.lng,
      isBunker: port.type === 'BUNKERING',
      headline: port.type === 'BUNKERING' ? 'Bunkering Stop' : port.type === 'LOADING' ? 'Loading Port' : 'Discharge Port',
      detailLine1: `Max Draft ${port.maxDraftM}m · Max LOA ${port.maxLoaM}m`,
      detailLine2: `Current Anchorage Wait: ~${port.currentWaitHours}h · Status: ${port.status}`
    };
  }
  const cp = chokepointMarkers.find(c => c.id === ref.id);
  if (!cp) return null;
  return {
    ref,
    name: cp.name,
    lat: cp.lat,
    lng: cp.lng,
    isBunker: false,
    headline: 'Strategic Chokepoint',
    detailLine1: cp.description,
    detailLine2: `Draft Limit: ${cp.maxDraft} · Risk Level: ${cp.riskLevel}`
  };
}

export const RouteIntelligenceView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'world_monitor' | 'waypoints'>('world_monitor');
  const [selectedWaypointIdx, setSelectedWaypointIdx] = useState<number>(0);
  const [selectedPortId, setSelectedPortId] = useState<string>('paradip');
  const [selectedRoute, setSelectedRoute] = useState<CorridorKey>('malacca');
  const [monsoonSeason, setMonsoonSeason] = useState<'SW_MONSOON' | 'NE_MONSOON' | 'FAIR_WEATHER'>('SW_MONSOON');
  const [steamingSpeed, setSteamingSpeed] = useState<number>(14.5);

  const currentCorridor = CORRIDOR_DEFINITIONS[selectedRoute];

  const waypoints: LiveWaypoint[] = useMemo(() => {
    return currentCorridor.waypointRefs
      .map(buildWaypoint)
      .filter((w): w is LiveWaypoint => w !== null);
  }, [currentCorridor]);

  const activeWaypoint = waypoints[Math.min(selectedWaypointIdx, waypoints.length - 1)] || waypoints[0];

  const transitDays = Number((currentCorridor.distanceNM / (steamingSpeed * 24)).toFixed(1));
  const bunkerBurnMT = Math.round((currentCorridor.distanceNM / (steamingSpeed * 24)) * 32.5);

  // Bounding box + projection derived from the real waypoints of the selected corridor,
  // so the plot auto-scales to whichever route is picked (Indo-Pacific or Black Sea/Africa)
  // instead of a fixed illustration.
  const { project, viewBoxW, viewBoxH, landPathD } = useMemo(() => {
    const VB_W = 700;
    const VB_H = 380;
    const lats = waypoints.map(w => w.lat);
    const lngs = waypoints.map(w => w.lng);
    const latSpan = Math.max(...lats) - Math.min(...lats) || 10;
    const lngSpan = Math.max(...lngs) - Math.min(...lngs) || 10;
    const latPad = Math.max(6, latSpan * 0.25);
    const lngPad = Math.max(6, lngSpan * 0.25);
    const latMin = Math.min(...lats) - latPad;
    const latMax = Math.max(...lats) + latPad;
    const lngMin = Math.min(...lngs) - lngPad;
    const lngMax = Math.max(...lngs) + lngPad;

    const projectFn = (lat: number, lng: number) => ({
      x: ((lng - lngMin) / (lngMax - lngMin)) * VB_W,
      y: ((latMax - lat) / (latMax - latMin)) * VB_H
    });

    const margin = 10;
    const rings = getSimplifiedLandRings()
      .filter(ring => ring.some(([lng, lat]) =>
        lng >= lngMin - margin && lng <= lngMax + margin && lat >= latMin - margin && lat <= latMax + margin
      ))
      .map(ring => {
        const pts = ring.map(([lng, lat]) => projectFn(lat, lng));
        return `M ${pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' L ')} Z`;
      })
      .join(' ');

    return { project: projectFn, viewBoxW: VB_W, viewBoxH: VB_H, landPathD: rings };
  }, [waypoints]);

  const routePoints = waypoints.map(w => project(w.lat, w.lng));
  const routePathD = routePoints.length > 1
    ? `M ${routePoints.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' L ')}`
    : '';

  const monsoonDetails = {
    SW_MONSOON: {
      label: 'SW MONSOON (MAY – SEP)',
      swell: '2.8m – 3.6m SW Swell',
      wind: '22 – 30 kts SW',
      current: 'Adverse 1.2 kts',
      fuelPenalty: '+3.8% VLSFO Burn',
      riskLevel: 'MODERATE-HIGH',
      badgeColor: 'bg-[#BC412B]/15 text-[#BC412B] dark:bg-[#BC412B]/30 dark:text-[#E05A42]'
    },
    NE_MONSOON: {
      label: 'NE MONSOON (NOV – FEB)',
      swell: '1.8m – 2.4m NE Swell',
      wind: '15 – 22 kts NE',
      current: 'Favorable 0.8 kts',
      fuelPenalty: '-1.2% VLSFO Burn',
      riskLevel: 'LOW-MODERATE',
      badgeColor: 'bg-[#243E56]/15 text-[#243E56] dark:bg-[#243E56]/30 dark:text-[#8CB4D2]'
    },
    FAIR_WEATHER: {
      label: 'INTER-MONSOON / FAIR WEATHER',
      swell: '0.8m – 1.4m Calm',
      wind: '8 – 14 kts Variable',
      current: 'Neutral',
      fuelPenalty: 'Nominal baseline (0%)',
      riskLevel: 'LOW',
      badgeColor: 'bg-[#2D5A43]/15 text-[#2D5A43] dark:bg-[#2D5A43]/30 dark:text-[#3EB58A]'
    }
  }[monsoonSeason];

  const originName = waypoints[0]?.name.split(' (')[0] || '—';
  const destinationName = waypoints[waypoints.length - 1]?.name.split(' (')[0] || '—';

  return (
    <div className="p-6 sm:p-8 flex flex-col gap-8 max-w-7xl mx-auto w-full text-[#1A1A1A] dark:text-[#E8ECE9]">
      {/* Breadcrumb navigation */}
      <div className="flex items-center gap-2 text-xs text-[#7A7268] dark:text-[#8E9B97] font-mono-data">
        <span>Monographs</span>
        <span>&gt;</span>
        <span>Navigation</span>
        <span>&gt;</span>
        <span className="text-[#BC412B] dark:text-[#E05A42] font-semibold">{originName} → {destinationName} Corridor</span>
      </div>

      {/* Header title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[#DDD8CE] dark:border-[#1F2E3E]">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#BC412B] dark:text-[#E05A42] font-bold">
            Maritime Hydrography &amp; Route Telemetry
          </span>
          <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-[#1A1A1A] dark:text-[#E8ECE9] mt-0.5">
            Route Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-[#6B645C] dark:text-[#A3B1AB] font-serif-body italic mt-1">
            Corridor: {originName} → {destinationName} | Live Trans-Oceanic Bulk Routing System &amp; Chokepoint Analysis
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-[#EDE8DE] dark:bg-[#16202C] rounded-lg border border-[#DDD8CE] dark:border-[#1F2E3E] p-1 text-xs font-mono-data">
            <button
              onClick={() => setActiveTab('world_monitor')}
              className={`px-3 py-1.5 rounded transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'world_monitor'
                  ? 'bg-white dark:bg-[#101820] text-[#BC412B] dark:text-[#E05A42] font-bold shadow-2xs'
                  : 'text-[#6B645C] dark:text-[#A3B1AB] hover:text-[#1A1A1A] dark:hover:text-[#E8ECE9]'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">public</span>
              <span>3D &amp; 2D World Monitor Map</span>
            </button>

            <button
              onClick={() => setActiveTab('waypoints')}
              className={`px-3 py-1.5 rounded transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'waypoints'
                  ? 'bg-white dark:bg-[#101820] text-[#BC412B] dark:text-[#E05A42] font-bold shadow-2xs'
                  : 'text-[#6B645C] dark:text-[#A3B1AB] hover:text-[#1A1A1A] dark:hover:text-[#E8ECE9]'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">route</span>
              <span>Waypoints &amp; Ocean Passage</span>
            </button>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#101820] border border-[#DDD8CE] dark:border-[#1F2E3E] rounded text-xs text-[#1A1A1A] dark:text-[#E8ECE9] font-mono-data shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#2D5A43] animate-pulse" />
            <span className="font-bold">CORRIDOR ACTIVE</span>
          </span>
        </div>
      </div>

      {/* WORLD MONITOR 3D/2D MAP */}
      {activeTab === 'world_monitor' && (
        <WorldMonitorMap />
      )}

      {/* Top 4 KPI metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-[#101820] border border-[#DDD8CE] dark:border-[#1F2E3E] rounded-lg p-5 shadow-sm">
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#7A7268] dark:text-[#8E9B97] block mb-1">
            Selected Route Distance
          </span>
          <div className="text-2xl font-extrabold text-[#1A1A1A] dark:text-[#E8ECE9] font-mono-data">
            {currentCorridor.distanceNM.toLocaleString()} NM
          </div>
          <span className="text-[11px] text-[#6B645C] dark:text-[#A3B1AB] mt-1 block font-serif-body italic">
            Via {currentCorridor.label}
          </span>
        </div>

        <div className="bg-white dark:bg-[#101820] border border-[#DDD8CE] dark:border-[#1F2E3E] rounded-lg p-5 shadow-sm">
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#7A7268] dark:text-[#8E9B97] block mb-1">
            Est. Transit Duration
          </span>
          <div className="text-2xl font-extrabold text-[#BC412B] dark:text-[#E05A42] font-mono-data">
            {transitDays} Days
          </div>
          <span className="text-[11px] text-[#6B645C] dark:text-[#A3B1AB] mt-1 block font-serif-body italic">
            At {steamingSpeed} kts steaming speed
          </span>
        </div>

        <div className="bg-white dark:bg-[#101820] border border-[#DDD8CE] dark:border-[#1F2E3E] rounded-lg p-5 shadow-sm">
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#7A7268] dark:text-[#8E9B97] block mb-1">
            Total Voyage Fuel Burn
          </span>
          <div className="text-2xl font-extrabold text-[#1A1A1A] dark:text-[#E8ECE9] font-mono-data">
            {bunkerBurnMT} MT
          </div>
          <span className="text-[11px] text-[#2D5A43] dark:text-[#3EB58A] mt-1 block font-serif-body font-semibold">
            VLSFO @ 32.5 MT/day baseline
          </span>
        </div>

        <div className="bg-white dark:bg-[#101820] border border-[#DDD8CE] dark:border-[#1F2E3E] rounded-lg p-5 shadow-sm">
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#7A7268] dark:text-[#8E9B97] block mb-1">
            Seasonal Weather Risk
          </span>
          <div className="text-2xl font-extrabold text-[#BC412B] dark:text-[#E05A42] font-mono-data">
            {monsoonDetails.riskLevel}
          </div>
          <span className="text-[11px] text-[#BC412B] dark:text-[#E05A42] mt-1 block font-serif-body font-semibold">
            {monsoonDetails.fuelPenalty}
          </span>
        </div>
      </div>

      {/* Corridor Routing Selector Tabs */}
      <div className="bg-[#EDE8DE] dark:bg-[#16202C] p-1.5 rounded-lg border border-[#DDD8CE] dark:border-[#1F2E3E] flex flex-wrap gap-2">
        {(Object.keys(CORRIDOR_DEFINITIONS) as CorridorKey[]).map(key => {
          const def = CORRIDOR_DEFINITIONS[key];
          return (
            <button
              key={key}
              onClick={() => { setSelectedRoute(key); setSelectedWaypointIdx(0); }}
              className={`flex-1 min-w-[190px] py-2.5 px-4 rounded text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
                selectedRoute === key
                  ? 'bg-white dark:bg-[#101820] text-[#BC412B] dark:text-[#E05A42] shadow-sm font-bold border border-[#DDD8CE] dark:border-[#1F2E3E]'
                  : 'text-[#6B645C] dark:text-[#A3B1AB] hover:text-[#1A1A1A] dark:hover:text-[#E8ECE9]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">alt_route</span>
              <span>{def.label} ({def.distanceNM.toLocaleString()} NM)</span>
            </button>
          );
        })}
      </div>

      {/* Main Map & Chokepoint Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive Ocean Map (8 Cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-[#101820] border border-[#DDD8CE] dark:border-[#1F2E3E] rounded-lg p-5 flex flex-col relative overflow-hidden min-h-[460px] shadow-sm">
          <div className="flex flex-wrap justify-between items-center z-10 mb-4 bg-white/90 dark:bg-[#101820]/90 backdrop-blur-xs p-2.5 rounded border border-[#DDD8CE] dark:border-[#1F2E3E] gap-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#BC412B] dark:text-[#E05A42] text-[18px]">satellite_alt</span>
              <span className="text-xs font-bold text-[#1A1A1A] dark:text-[#E8ECE9] uppercase tracking-wider">
                Live Passage Plot — {currentCorridor.label}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-[#7A7268] dark:text-[#8E9B97] font-mono-data">
              <span>Speed: {steamingSpeed} kts</span>
              <span>•</span>
              <span>Auto-Scaled Mercator</span>
            </div>
          </div>

          <div className="absolute inset-0 maritime-grid opacity-60 pointer-events-none" />

          {/* Real-coordinate SVG Route Plot */}
          <svg className="absolute inset-0 w-full h-full" viewBox={`0 0 ${viewBoxW} ${viewBoxH}`} preserveAspectRatio="xMidYMid meet">
            <rect width={viewBoxW} height={viewBoxH} fill="#F4F0E8" className="dark:opacity-0" opacity="0.3" />
            {/* Real coastlines, consistent with the 3D globe and 2D tactical map */}
            <path d={landPathD} fill="#DCD5C5" className="dark:fill-[#16202C]" stroke="#B8AF98" strokeWidth="0.5" opacity="0.8" />

            {/* Primary Track — straight legs between real waypoints */}
            <path d={routePathD} fill="none" stroke="#BC412B" strokeWidth="2.5" strokeDasharray="8 4" />

            {/* Waypoints */}
            {waypoints.map((wp, idx) => {
              const pt = project(wp.lat, wp.lng);
              const isSelected = selectedWaypointIdx === idx;
              return (
                <g key={`${wp.ref.type}-${idx}`} className="cursor-pointer" onClick={() => setSelectedWaypointIdx(idx)}>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isSelected ? 9 : wp.isBunker ? 7 : 5.5}
                    fill={isSelected ? '#BC412B' : wp.isBunker ? '#2D8A6E' : wp.ref.type === 'CHOKEPOINT' ? '#F59E0B' : '#243E56'}
                    stroke="#FFFFFF"
                    strokeWidth="2"
                  />
                  {wp.isBunker && (
                    <text x={pt.x} y={pt.y + 3.5} fontSize="7" textAnchor="middle" fill="#FFFFFF">⛽</text>
                  )}
                  <text
                    x={pt.x}
                    y={pt.y + 18}
                    fill="currentColor"
                    className={isSelected ? 'text-[#BC412B] font-bold' : 'text-[#1A1A1A] dark:text-[#E8ECE9] font-medium'}
                    fontSize="10"
                    textAnchor="middle"
                    fontFamily="serif"
                  >
                    {wp.name.split(' (')[0]}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Floating Waypoint Detail Drawer */}
          {activeWaypoint && (
            <div className="mt-auto z-10 bg-white/95 dark:bg-[#101820]/95 backdrop-blur-md border border-[#DDD8CE] dark:border-[#1F2E3E] rounded-lg p-4 max-w-md shadow-md">
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-bold text-[#BC412B] dark:text-[#E05A42] font-editorial text-sm">
                  {activeWaypoint.headline}{activeWaypoint.isBunker ? ' · Fuel Bunkering' : ''}: {activeWaypoint.name}
                </span>
                <span className="text-[#7A7268] dark:text-[#8E9B97] text-[10px] font-mono-data">
                  {activeWaypoint.lat.toFixed(2)}°, {activeWaypoint.lng.toFixed(2)}°
                </span>
              </div>
              <p className="text-xs text-[#555555] dark:text-[#A3B1AB] font-serif-body mb-2">
                {activeWaypoint.detailLine1}
              </p>
              <div className="pt-2 border-t border-[#DDD8CE] dark:border-[#1F2E3E] text-[11px] font-mono-data">
                <span className="font-bold text-[#2D5A43] dark:text-[#3EB58A]">{activeWaypoint.detailLine2}</span>
              </div>
            </div>
          )}
        </div>

        {/* Chokepoint & Weather Advisory (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          {/* Chokepoint Telemetry */}
          <div className="bg-white dark:bg-[#101820] border border-[#DDD8CE] dark:border-[#1F2E3E] rounded-lg p-5 flex flex-col gap-3 shadow-sm">
            <div className="flex justify-between items-center pb-2 border-b border-[#DDD8CE] dark:border-[#1F2E3E]">
              <h3 className="text-sm font-bold text-[#1A1A1A] dark:text-[#E8ECE9] flex items-center gap-2 font-editorial">
                <span className="material-symbols-outlined text-[#BC412B] dark:text-[#E05A42] text-[18px]">alt_route</span>
                <span>Chokepoint Telemetry</span>
              </h3>
              <span className="px-2 py-0.5 bg-[#EDE8DE] dark:bg-[#16202C] text-[#2D5A43] dark:text-[#3EB58A] text-[10px] font-bold rounded font-mono-data border border-[#DDD8CE] dark:border-[#1F2E3E]">
                STATUS: CLEAR
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-[#DDD8CE] dark:border-[#1F2E3E]">
                <span className="text-[#6B645C] dark:text-[#8E9B97] font-medium">Selected Passage</span>
                <span className="font-bold text-[#1A1A1A] dark:text-[#E8ECE9] font-serif-body text-right">{currentCorridor.label}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#DDD8CE] dark:border-[#1F2E3E]">
                <span className="text-[#6B645C] dark:text-[#8E9B97] font-medium">Draft Clearance</span>
                <span className="font-mono-data font-bold text-[#1A1A1A] dark:text-[#E8ECE9] text-right">{currentCorridor.draftLimit}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#DDD8CE] dark:border-[#1F2E3E]">
                <span className="text-[#6B645C] dark:text-[#8E9B97] font-medium">Security MARSEC</span>
                <span className="font-mono-data font-bold text-[#2D5A43] dark:text-[#3EB58A]">{currentCorridor.securityRisk}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#6B645C] dark:text-[#8E9B97] font-medium">Key Chokepoints</span>
                <span className="font-mono-data text-[#7A7268] dark:text-[#A3B1AB] text-right">
                  {waypoints.filter(w => w.ref.type === 'CHOKEPOINT').map(w => w.name.split(' (')[0]).join(', ') || 'None (Direct)'}
                </span>
              </div>
              {waypoints.some(w => w.isBunker) && (
                <div className="flex justify-between py-1">
                  <span className="text-[#6B645C] dark:text-[#8E9B97] font-medium">Bunkering Stop</span>
                  <span className="font-mono-data font-bold text-[#2D8A6E]">
                    ⛽ {waypoints.find(w => w.isBunker)?.name}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Weather & Monsoon Advisory with Interactive Season Switcher */}
          <div className="bg-white dark:bg-[#101820] border border-[#DDD8CE] dark:border-[#1F2E3E] rounded-lg p-5 flex flex-col gap-3 shadow-sm">
            <div className="flex justify-between items-center pb-2 border-b border-[#DDD8CE] dark:border-[#1F2E3E]">
              <h3 className="text-sm font-bold text-[#1A1A1A] dark:text-[#E8ECE9] flex items-center gap-2 font-editorial">
                <span className="material-symbols-outlined text-[#BC412B] dark:text-[#E05A42] text-[18px]">thunderstorm</span>
                <span>Ocean Weather Simulator</span>
              </h3>
              <span className={`px-2 py-0.5 text-[10px] font-bold rounded font-mono-data border border-[#DDD8CE] dark:border-[#1F2E3E] ${monsoonDetails.badgeColor}`}>
                {monsoonDetails.riskLevel}
              </span>
            </div>

            {/* Season Selector */}
            <div className="flex bg-[#EDE8DE] dark:bg-[#16202C] p-0.5 rounded border border-[#DDD8CE] dark:border-[#1F2E3E] text-[11px]">
              {(['SW_MONSOON', 'NE_MONSOON', 'FAIR_WEATHER'] as const).map((season) => (
                <button
                  key={season}
                  onClick={() => setMonsoonSeason(season)}
                  className={`flex-1 py-1 px-1.5 rounded transition-all cursor-pointer font-mono-data text-center ${
                    monsoonSeason === season
                      ? 'bg-white dark:bg-[#101820] text-[#BC412B] dark:text-[#E05A42] font-bold shadow-2xs'
                      : 'text-[#6B645C] dark:text-[#8E9B97] hover:text-[#1A1A1A] dark:hover:text-[#E8ECE9]'
                  }`}
                >
                  {season === 'SW_MONSOON' ? 'SW Mon.' : season === 'NE_MONSOON' ? 'NE Mon.' : 'Fair Sea'}
                </button>
              ))}
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-[#DDD8CE] dark:border-[#1F2E3E]">
                <span className="text-[#6B645C] dark:text-[#8E9B97] font-medium">Corridor Swell</span>
                <span className="font-mono-data text-[#BC412B] dark:text-[#E05A42] font-bold">{monsoonDetails.swell}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#DDD8CE] dark:border-[#1F2E3E]">
                <span className="text-[#6B645C] dark:text-[#8E9B97] font-medium">Surface Winds</span>
                <span className="font-mono-data font-bold text-[#1A1A1A] dark:text-[#E8ECE9]">{monsoonDetails.wind}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#DDD8CE] dark:border-[#1F2E3E]">
                <span className="text-[#6B645C] dark:text-[#8E9B97] font-medium">Current Direction</span>
                <span className="font-mono-data font-bold text-[#1A1A1A] dark:text-[#E8ECE9]">{monsoonDetails.current}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#6B645C] dark:text-[#8E9B97] font-medium">Bunker Burn Delta</span>
                <span className="font-mono-data text-[#BC412B] dark:text-[#E05A42] font-bold">{monsoonDetails.fuelPenalty}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Port Comparison Table */}
      <div className="bg-white dark:bg-[#101820] border border-[#DDD8CE] dark:border-[#1F2E3E] rounded-lg overflow-hidden shadow-sm">
        <div className="p-4 sm:p-5 border-b border-[#DDD8CE] dark:border-[#1F2E3E] bg-[#F4F0E8] dark:bg-[#16202C] flex justify-between items-center">
          <div>
            <h3 className="font-editorial text-base sm:text-lg font-bold text-[#1A1A1A] dark:text-[#E8ECE9]">
              Global Discharge &amp; Loading Port Directory
            </h3>
            <p className="text-xs text-[#6B645C] dark:text-[#A3B1AB] font-serif-body italic">
              Real-time congestion and draft comparison across all tracked ports
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-[#DDD8CE] dark:border-[#1F2E3E] bg-[#EDE8DE]/70 dark:bg-[#1C2834]/70 text-[10px] font-bold text-[#7A7268] dark:text-[#8E9B97] uppercase tracking-wider">
                <th className="py-3 px-4">Port Name</th>
                <th className="py-3 px-4">Distance</th>
                <th className="py-3 px-4">Transit Time</th>
                <th className="py-3 px-4">Congestion &amp; Queue</th>
                <th className="py-3 px-4">Max Draft</th>
                <th className="py-3 px-4 text-right">Status / Recommendation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDD8CE] dark:divide-[#1F2E3E]">
              {portIntelligenceData.map((port) => {
                const isSelected = selectedPortId === port.id;
                return (
                  <tr
                    key={port.id}
                    onClick={() => setSelectedPortId(port.id)}
                    className={`hover:bg-[#F9F7F2] dark:hover:bg-[#16202C] transition-colors cursor-pointer ${
                      isSelected ? 'bg-[#F4F0E8] dark:bg-[#1C2834]' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4 font-bold text-[#1A1A1A] dark:text-[#E8ECE9]">
                      <div className="flex items-center gap-2">
                        <span>{port.name}</span>
                        {port.isOptimal && (
                          <span className="px-1.5 py-0.5 bg-[#BC412B] text-white text-[9px] font-bold rounded">
                            BEST
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono-data text-[#555555] dark:text-[#A3B1AB]">
                      {port.distanceNM.toLocaleString()} NM
                    </td>
                    <td className="py-3.5 px-4 font-mono-data text-[#1A1A1A] dark:text-[#E8ECE9]">
                      {port.transitDays} days
                    </td>
                    <td className="py-3.5 px-4 font-mono-data font-bold">
                      <span className={port.status === 'HIGH' ? 'text-[#BC412B] dark:text-[#E05A42]' : port.status === 'MODERATE' ? 'text-[#A33621] dark:text-[#FF8866]' : 'text-[#2D5A43] dark:text-[#3EB58A]'}>
                        {port.estDelayHours}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono-data text-[#1A1A1A] dark:text-[#E8ECE9]">
                      {port.draftLimitM}m
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {port.isOptimal ? (
                        <span className="inline-block px-2.5 py-1 bg-[#EDE8DE] dark:bg-[#16202C] text-[#BC412B] dark:text-[#E05A42] border border-[#BC412B]/40 rounded text-xs font-bold font-mono-data">
                          OPTIMAL ARRIVAL WINDOW
                        </span>
                      ) : (
                        <span className="inline-block px-2.5 py-1 bg-[#EDE8DE] dark:bg-[#16202C] text-[#7A7268] dark:text-[#8E9B97] rounded text-xs font-mono-data">
                          {port.status} QUEUE
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
