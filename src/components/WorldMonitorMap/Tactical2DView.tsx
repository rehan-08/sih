import React, { useEffect, useRef, useState } from 'react';
import * as maplibreglNS from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

// maplibre-gl ships as a CJS-style module with everything hung off `default`; depending on
// the bundler's interop, `import * as` sometimes flattens that onto the namespace and
// sometimes doesn't. Resolve it defensively once here instead of assuming either shape.
const maplibregl: typeof import('maplibre-gl') =
  (maplibreglNS as unknown as { default?: typeof import('maplibre-gl') }).default ?? maplibreglNS;
import { TrackedVessel } from '../../types';
import { PortMapPoint, ChokepointMarker, MonsoonZone } from '../../data/vesselTrackingData';
import { MapLayerState, MapThemeMode, WorldMonitorSelection } from './types';
import {
  LngLat,
  MALACCA_ROUTE,
  LOMBOK_ROUTE,
  SUNDA_ROUTE,
  BLACK_SEA_ROUTE,
  MOZAMBIQUE_ROUTE,
  ATLANTIC_SUEZ_ROUTE,
  GULF_ROUTE,
  NINE_DEGREE_CHANNEL_WAYPOINT,
  SOUTH_OF_SRI_LANKA_WAYPOINT,
  BAY_OF_BENGAL_APPROACH_WAYPOINT
} from '../../data/seaRoutes';

interface Tactical2DViewProps {
  vessels: TrackedVessel[];
  ports: PortMapPoint[];
  chokepoints: ChokepointMarker[];
  monsoonZones: MonsoonZone[];
  selectedItem: WorldMonitorSelection;
  highlightedChokepointId: string | null;
  onSelectVessel: (vessel: TrackedVessel) => void;
  onSelectPort: (port: PortMapPoint) => void;
  onSelectChokepoint: (chokepoint: ChokepointMarker) => void;
  layers: MapLayerState;
  theme: MapThemeMode;
  targetFocusCoord?: { lat: number; lng: number } | null;
}

// Free, keyless CARTO dark-matter vector basemap (real place labels/borders via OpenStreetMap
// data), rendered with MapLibre GL JS (open source, BSD-3, no API key) — replaces the old
// hand-drawn SVG map.
const BASEMAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

// Trade corridors follow curated open-water waypoints (src/data/seaRoutes.ts) instead of a
// straight line between endpoints, which used to cut straight across Indonesia/Australia
// once the basemap started showing real coastlines.
const TRADE_CORRIDORS: Array<{ id: string; color: string; chokepointIds: string[]; points: LngLat[] }> = [
  { id: 'malacca', color: '#BC412B', chokepointIds: ['malacca_tss', 'singapore_strait'], points: MALACCA_ROUTE },
  { id: 'lombok', color: '#F59E0B', chokepointIds: ['lombok_strait'], points: LOMBOK_ROUTE },
  { id: 'sunda', color: '#14B8A6', chokepointIds: ['sunda_strait'], points: SUNDA_ROUTE },
  { id: 'black_sea', color: '#8B5CF6', chokepointIds: ['bosphorus_strait', 'suez_canal', 'bab_el_mandeb'], points: BLACK_SEA_ROUTE },
  { id: 'mozambique', color: '#22C55E', chokepointIds: [], points: MOZAMBIQUE_ROUTE },
  // Morocco phosphate -> Paradip: approaches from the Arabian Sea side but Paradip is on
  // India's east coast, so it needs the Nine Degree Channel detour around Sri Lanka.
  {
    id: 'phosphate_atlantic',
    color: '#EC4899',
    chokepointIds: ['strait_of_gibraltar', 'suez_canal', 'bab_el_mandeb'],
    points: [
      ...ATLANTIC_SUEZ_ROUTE,
      NINE_DEGREE_CHANNEL_WAYPOINT,
      SOUTH_OF_SRI_LANKA_WAYPOINT,
      BAY_OF_BENGAL_APPROACH_WAYPOINT,
      [86.67, 20.26]
    ]
  },
  // Persian Gulf fertilizer -> India's west coast: a short direct Arabian Sea crossing once
  // clear of Hormuz, no Sri Lanka detour needed.
  {
    id: 'gulf_fertilizer',
    color: '#0EA5E9',
    chokepointIds: ['strait_of_hormuz'],
    points: [...GULF_ROUTE, [69.72, 22.84]]
  }
];

function getVesselClassColor(vClass: string, isCompliant: boolean = true) {
  if (!isCompliant) return '#FF2A4D';
  switch (vClass) {
    case 'Panamax':
    case 'Kamsarmax':
      return '#00F5D4';
    case 'Capesize':
    case 'Newcastlemax':
      return '#F59E0B';
    case 'Supramax':
      return '#14B8A6';
    case 'Handysize':
      return '#3B82F6';
    default:
      return '#00F5D4';
  }
}

function upsertGeoJSONSource(map: maplibregl.Map, id: string, data: GeoJSON.FeatureCollection) {
  const existing = map.getSource(id) as maplibregl.GeoJSONSource | undefined;
  if (existing) {
    existing.setData(data);
  } else {
    map.addSource(id, { type: 'geojson', data });
  }
}

export const Tactical2DView: React.FC<Tactical2DViewProps> = ({
  vessels,
  ports,
  chokepoints,
  monsoonZones,
  selectedItem,
  highlightedChokepointId,
  onSelectVessel,
  onSelectPort,
  onSelectChokepoint,
  layers,
  targetFocusCoord
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const [mapReady, setMapReady] = useState(false);

  // Mount the map once. Guards against a second Map instance being created for the same
  // container (observed under React 19 StrictMode's dev-only double-invoke, which was
  // firing this effect twice back-to-back with no cleanup in between — two maplibre Map
  // instances fighting over one DOM container silently corrupts style/tile loading).
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: BASEMAP_STYLE,
      center: [90, 5],
      zoom: 2.2,
      attributionControl: { compact: true }
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    mapRef.current = map;
    popupRef.current = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 14 });

    map.on('load', () => setMapReady(true));

    const handleResize = () => map.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Camera focus (Sectors & Corridors presets, click-to-focus)
  useEffect(() => {
    if (targetFocusCoord && mapRef.current) {
      mapRef.current.flyTo({ center: [targetFocusCoord.lng, targetFocusCoord.lat], zoom: 4, duration: 1200 });
    }
  }, [targetFocusCoord]);

  // Rebuild GeoJSON layers + DOM markers whenever the live data or selection changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    // --- Trade corridors ---
    const corridorFeatures: GeoJSON.Feature[] = TRADE_CORRIDORS.map(c => ({
      type: 'Feature',
      properties: {
        color: c.chokepointIds.includes(highlightedChokepointId || '') ? '#FF2A4D' : c.color,
        width: c.chokepointIds.includes(highlightedChokepointId || '') ? 3.5 : 2
      },
      geometry: { type: 'LineString', coordinates: c.points }
    }));
    upsertGeoJSONSource(map, 'corridors', { type: 'FeatureCollection', features: corridorFeatures });
    if (!map.getLayer('corridors-line')) {
      map.addLayer({
        id: 'corridors-line',
        type: 'line',
        source: 'corridors',
        layout: { 'line-cap': 'round' },
        paint: {
          'line-color': ['get', 'color'],
          'line-width': ['get', 'width'],
          'line-dasharray': [2, 1.5],
          'line-opacity': 0.85
        }
      });
    }
    map.setLayoutProperty('corridors-line', 'visibility', layers.tradeCorridors ? 'visible' : 'none');

    // --- Vessel wake trails ---
    const wakeFeatures: GeoJSON.Feature[] = vessels
      .filter(v => v.recentTrail && v.recentTrail.length >= 2)
      .map(v => {
        const isSelected = selectedItem.type === 'VESSEL' && selectedItem.id === v.id;
        const coords: [number, number][] = v.recentTrail.map(t => [t.lng, t.lat]);
        coords.push([v.coordinates.lng, v.coordinates.lat]);
        return {
          type: 'Feature',
          properties: {
            color: getVesselClassColor(v.vesselClass, v.isDraftCompliant),
            width: isSelected ? 2.5 : 1.2,
            opacity: isSelected ? 0.9 : 0.4
          },
          geometry: { type: 'LineString', coordinates: coords }
        };
      });
    upsertGeoJSONSource(map, 'wakes', { type: 'FeatureCollection', features: wakeFeatures });
    if (!map.getLayer('wakes-line')) {
      map.addLayer({
        id: 'wakes-line',
        type: 'line',
        source: 'wakes',
        paint: {
          'line-color': ['get', 'color'],
          'line-width': ['get', 'width'],
          'line-opacity': ['get', 'opacity']
        }
      });
    }
    map.setLayoutProperty('wakes-line', 'visibility', layers.aisWakeTrails ? 'visible' : 'none');

    // --- Monsoon / weather hazard zones ---
    const monsoonFeatures: GeoJSON.Feature[] = monsoonZones.map(zone => ({
      type: 'Feature',
      properties: { name: `${zone.name} (${zone.waveHeightM})` },
      geometry: { type: 'Polygon', coordinates: [[...zone.coordinates.map(c => [c.lng, c.lat]), [zone.coordinates[0].lng, zone.coordinates[0].lat]]] }
    }));
    upsertGeoJSONSource(map, 'monsoon-zones', { type: 'FeatureCollection', features: monsoonFeatures });
    if (!map.getLayer('monsoon-fill')) {
      map.addLayer({
        id: 'monsoon-fill',
        type: 'fill',
        source: 'monsoon-zones',
        paint: { 'fill-color': '#BC412B', 'fill-opacity': 0.18 }
      });
      map.addLayer({
        id: 'monsoon-outline',
        type: 'line',
        source: 'monsoon-zones',
        paint: { 'line-color': '#FF6B6B', 'line-width': 1.5, 'line-dasharray': [4, 3] }
      });
      map.addLayer({
        id: 'monsoon-label',
        type: 'symbol',
        source: 'monsoon-zones',
        layout: { 'text-field': ['get', 'name'], 'text-size': 10, 'text-font': ['Open Sans Bold'] },
        paint: { 'text-color': '#FF6B6B', 'text-halo-color': '#0A141E', 'text-halo-width': 1.5 }
      });
    }
    ['monsoon-fill', 'monsoon-outline', 'monsoon-label'].forEach(id =>
      map.setLayoutProperty(id, 'visibility', layers.weatherRadar ? 'visible' : 'none')
    );

    // --- DOM markers (vessels, ports, chokepoints) rebuilt on every relevant change ---
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    if (layers.portNodes) {
      ports.forEach(port => {
        const isSelected = selectedItem.type === 'PORT' && selectedItem.id === port.id;
        const isDischarge = port.type === 'DISCHARGE';
        const statusColor = port.status === 'OPTIMAL' ? '#00F5D4' : port.status === 'CONGESTED' ? '#FF2A4D' : '#F59E0B';

        const el = document.createElement('div');
        el.style.cursor = 'pointer';
        el.innerHTML = `
          <div style="display:flex; align-items:center; gap:6px;">
            <div style="width:${isSelected ? 16 : 12}px; height:${isSelected ? 16 : 12}px; border-radius:50%; border:2px ${isDischarge ? 'dashed' : 'solid'} ${statusColor}; display:flex; align-items:center; justify-content:center; background:rgba(7,13,20,0.5);">
              <div style="width:5px; height:5px; border-radius:50%; background:${isDischarge ? '#00F5D4' : '#E8ECE9'};"></div>
            </div>
            <span style="font-size:10px; font-weight:bold; color:#E8ECE9; white-space:nowrap; text-shadow:0 1px 3px #000;">${port.name}</span>
          </div>
        `;
        el.addEventListener('click', (e) => { e.stopPropagation(); onSelectPort(port); });
        el.addEventListener('mouseenter', () => {
          popupRef.current
            ?.setLngLat([port.lng, port.lat])
            .setHTML(`<div style="font-family:monospace;font-size:11px;color:#E8ECE9;"><strong style="color:#00F5D4;">${port.name}</strong><br/>${port.country} · Max Draft ${port.maxDraftM}m · Queue ~${port.currentWaitHours}h</div>`)
            .addTo(map);
        });
        el.addEventListener('mouseleave', () => popupRef.current?.remove());

        const marker = new maplibregl.Marker({ element: el, anchor: 'left' })
          .setLngLat([port.lng, port.lat])
          .addTo(map);
        markersRef.current.push(marker);
      });
    }

    if (layers.chokepoints) {
      chokepoints.forEach(cp => {
        const isHighlighted = highlightedChokepointId === cp.id || (selectedItem.type === 'CHOKEPOINT' && selectedItem.id === cp.id);
        const color = isHighlighted ? '#FF2A4D' : '#F59E0B';

        const el = document.createElement('div');
        el.style.cursor = 'pointer';
        el.innerHTML = `
          <div style="display:flex; align-items:center; gap:6px;">
            <div style="width:14px; height:14px; background:${color}; border:1.5px solid #fff; transform:rotate(45deg); ${isHighlighted ? 'animation: marlin-chokepoint-pulse 1.1s ease-in-out infinite;' : ''}"></div>
            <span style="font-size:10px; font-weight:bold; color:${isHighlighted ? '#FF6B6B' : '#F59E0B'}; font-family:monospace; white-space:nowrap; text-shadow:0 1px 3px #000;">${cp.name.split(' (')[0]}</span>
          </div>
        `;
        el.addEventListener('click', (e) => { e.stopPropagation(); onSelectChokepoint(cp); });
        el.addEventListener('mouseenter', () => {
          popupRef.current
            ?.setLngLat([cp.lng, cp.lat])
            .setHTML(`<div style="font-family:monospace;font-size:11px;color:#E8ECE9;"><strong style="color:#F59E0B;">${cp.name}</strong><br/>Limit: ${cp.maxDraft}<br/>${cp.riskLevel} Chokepoint Risk</div>`)
            .addTo(map);
        });
        el.addEventListener('mouseleave', () => popupRef.current?.remove());

        const marker = new maplibregl.Marker({ element: el, anchor: 'left' })
          .setLngLat([cp.lng, cp.lat])
          .addTo(map);
        markersRef.current.push(marker);
      });
    }

    if (layers.aisFleet) {
      vessels.forEach(v => {
        const isSelected = selectedItem.type === 'VESSEL' && selectedItem.id === v.id;
        const color = getVesselClassColor(v.vesselClass, v.isDraftCompliant);

        const el = document.createElement('div');
        el.style.cursor = 'pointer';
        el.innerHTML = `
          <div style="display:flex; align-items:center; gap:6px;">
            <div style="width:0; height:0; border-left:5px solid transparent; border-right:5px solid transparent; border-bottom:12px solid ${color}; transform:rotate(${v.heading}deg); ${!v.isDraftCompliant ? 'filter:drop-shadow(0 0 4px #FF2A4D);' : isSelected ? `filter:drop-shadow(0 0 5px ${color});` : ''}"></div>
            <span style="font-size:9.5px; font-weight:bold; padding:1px 6px; border-radius:3px; white-space:nowrap; color:#fff; background:${isSelected ? '#BC412B' : 'rgba(10,20,30,0.85)'}; border:1px solid ${isSelected ? '#fff' : '#1E354B'};">
              ${v.name} · ${v.sog}k
            </span>
          </div>
        `;
        el.addEventListener('click', (e) => { e.stopPropagation(); onSelectVessel(v); });
        el.addEventListener('mouseenter', () => {
          popupRef.current
            ?.setLngLat([v.coordinates.lng, v.coordinates.lat])
            .setHTML(`<div style="font-family:monospace;font-size:11px;color:#E8ECE9;"><strong style="color:#00F5D4;">${v.name}</strong><br/>${v.vesselClass} · ${v.sog} kts · ${v.destinationPort}</div>`)
            .addTo(map);
        });
        el.addEventListener('mouseleave', () => popupRef.current?.remove());

        const marker = new maplibregl.Marker({ element: el, anchor: 'left' })
          .setLngLat([v.coordinates.lng, v.coordinates.lat])
          .addTo(map);
        markersRef.current.push(marker);
      });
    }
  }, [mapReady, vessels, ports, chokepoints, monsoonZones, selectedItem, highlightedChokepointId, layers, onSelectVessel, onSelectPort, onSelectChokepoint]);

  return (
    <div className="w-full h-full relative overflow-hidden bg-[#070D14] rounded-lg select-none border border-[#162738]" style={{ minHeight: '520px' }}>
      <style>{`
        @keyframes marlin-chokepoint-pulse {
          0%, 100% { transform: rotate(45deg) scale(1); opacity: 1; }
          50% { transform: rotate(45deg) scale(1.35); opacity: 0.6; }
        }
        .maplibregl-ctrl-attrib { font-size: 9px; }
        .maplibregl-popup-content {
          background: #0A141E !important;
          color: #E8ECE9 !important;
          border: 1px solid #1E354B !important;
          border-radius: 6px !important;
          box-shadow: 0 4px 16px rgba(0,0,0,0.5) !important;
          padding: 8px 10px !important;
        }
        .maplibregl-popup-content * { color: inherit; }
        .maplibregl-popup-tip { border-top-color: #0A141E !important; border-bottom-color: #0A141E !important; }
      `}</style>

      {/* Mode Tag */}
      <div className="absolute top-4 left-4 z-20 bg-[#0C1622]/90 backdrop-blur-md border border-[#1E354B] rounded px-3 py-1.5 text-[10px] font-mono-data text-[#8CB4D2] flex items-center gap-2 shadow-lg pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-[#00F5D4] animate-pulse" />
        <span className="font-bold text-[#E8ECE9]">2D TACTICAL CHART</span>
        <span>·</span>
        <span>LIVE VECTOR MAP</span>
      </div>

      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
};
