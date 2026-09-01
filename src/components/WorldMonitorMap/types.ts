import { TrackedVessel } from '../../types';
import { PortMapPoint, ChokepointMarker, MonsoonZone } from '../../data/vesselTrackingData';

export type MapProjectionMode = '3D_GLOBE' | '2D_TACTICAL';

export type MapThemeMode = 'tactical_dark' | 'world_monitor_cyan' | 'nautical_emerald' | 'monsoon_radar';

export interface MapCameraPreset {
  id: string;
  name: string;
  lat: number;
  lng: number;
  zoom: number; // 3D distance or 2D zoom level
  description: string;
}

export const MAP_CAMERA_PRESETS: MapCameraPreset[] = [
  {
    id: 'indo_pacific',
    name: 'Indo-Pacific Trade Corridor',
    lat: -5.0,
    lng: 105.0,
    zoom: 2.2,
    description: 'Full strategic corridor from Newcastle to Paradip & Bay of Bengal'
  },
  {
    id: 'bay_of_bengal',
    name: 'Bay of Bengal & East India Ports',
    lat: 16.5,
    lng: 86.5,
    zoom: 1.5,
    description: 'Paradip, Vizag, Gangavaram, Haldia & Gopalpur discharge nodes'
  },
  {
    id: 'malacca_strait',
    name: 'Strait of Malacca TSS',
    lat: 2.5,
    lng: 102.0,
    zoom: 1.2,
    description: 'Critical maritime chokepoint & Singapore bunkering crossroads'
  },
  {
    id: 'lombok_corridor',
    name: 'Lombok Deep-Water Corridor',
    lat: -8.7,
    lng: 116.0,
    zoom: 1.3,
    description: 'Capesize deep-water transit route (>200m depth, no draft limits)'
  },
  {
    id: 'australia_coal_basin',
    name: 'East Australia Loading Ports',
    lat: -28.0,
    lng: 152.0,
    zoom: 1.6,
    description: 'Newcastle (Kooragang/NCIG), Gladstone & Coral Sea departure tracks'
  },
  {
    id: 'torres_strait',
    name: 'Torres Strait / Prince of Wales',
    lat: -10.5,
    lng: 142.2,
    zoom: 1.2,
    description: 'Tidal restriction corridor with mandatory coastal pilotage'
  }
];

export interface MapLayerState {
  tradeCorridors: boolean;
  aisFleet: boolean;
  aisWakeTrails: boolean;
  portNodes: boolean;
  chokepoints: boolean;
  weatherRadar: boolean;
  graticuleGrid: boolean;
  autoRotate: boolean;
  radarSweep: boolean;
}

export interface WorldMonitorSelection {
  type: 'VESSEL' | 'PORT' | 'CHOKEPOINT' | null;
  id: string | null;
  data?: TrackedVessel | PortMapPoint | ChokepointMarker | null;
}
