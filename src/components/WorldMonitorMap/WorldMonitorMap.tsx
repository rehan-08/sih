import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { TrackedVessel } from '../../types';
import { 
  initialTrackedVessels, 
  portMapLocations, 
  chokepointMarkers, 
  monsoonZones, 
  simulateVesselTick,
  PortMapPoint,
  ChokepointMarker
} from '../../data/vesselTrackingData';
import { 
  MapProjectionMode, 
  MapLayerState, 
  MapThemeMode, 
  WorldMonitorSelection,
  MapCameraPreset
} from './types';
import { Globe3DView } from './Globe3DView';
import { Tactical2DView } from './Tactical2DView';
import { TacticalHUD } from './TacticalHUD';
import { VesselInspectorHUD } from './VesselInspectorHUD';
import { PortInspectorHUD } from './PortInspectorHUD';
import { ChokepointInspectorHUD } from './ChokepointInspectorHUD';
import { fetchBatchWeather, waveHeightToSeaState, weatherCodeToCondition } from '../../services/weatherService';

interface WorldMonitorMapProps {
  selectedClassFilter?: string;
  onSelectVesselClass?: (vClass: string) => void;
  onNavigateToComparison?: () => void;
}

export const WorldMonitorMap: React.FC<WorldMonitorMapProps> = ({
  selectedClassFilter,
  onSelectVesselClass,
  onNavigateToComparison
}) => {
  // Map State
  const [projection, setProjection] = useState<MapProjectionMode>('3D_GLOBE');
  const [theme, setTheme] = useState<MapThemeMode>('tactical_dark');
  const [layers, setLayers] = useState<MapLayerState>({
    tradeCorridors: true,
    aisFleet: true,
    aisWakeTrails: true,
    portNodes: true,
    chokepoints: true,
    weatherRadar: true,
    graticuleGrid: true,
    autoRotate: true,
    radarSweep: true
  });

  // Fleet & Simulation State
  const [vessels, setVessels] = useState<TrackedVessel[]>(initialTrackedVessels);
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [simSpeed, setSimSpeed] = useState<number>(1);
  const vesselsRef = useRef(vessels);
  vesselsRef.current = vessels;

  // Inspector & Selection State
  const [selectedItem, setSelectedItem] = useState<WorldMonitorSelection>({
    type: null,
    id: null,
    data: null
  });
  const [highlightedChokepointId, setHighlightedChokepointId] = useState<string | null>(null);
  const [targetFocusCoord, setTargetFocusCoord] = useState<{ lat: number; lng: number } | null>(null);

  // Filter vessels if class filter is active
  const filteredVessels = useMemo(() => {
    if (!selectedClassFilter || selectedClassFilter === 'ALL') {
      return vessels;
    }
    return vessels.filter(v => v.vesselClass.toLowerCase() === selectedClassFilter.toLowerCase());
  }, [vessels, selectedClassFilter]);

  // Simulation Tick Loop
  useEffect(() => {
    if (!isSimulating) return;

    const intervalMs = Math.max(200, Math.round(2000 / simSpeed));
    const interval = setInterval(() => {
      setVessels(prev => simulateVesselTick(prev, 2, simSpeed));
    }, intervalMs);

    return () => clearInterval(interval);
  }, [isSimulating, simSpeed]);

  // Real live weather (Open-Meteo, free/keyless) for each vessel's current position.
  // Refreshed on a slower cycle than the position tick since vessels move gradually.
  useEffect(() => {
    let cancelled = false;

    const refreshVesselWeather = async () => {
      try {
        const coords = vesselsRef.current.map(v => v.coordinates);
        const results = await fetchBatchWeather(coords);
        if (cancelled) return;

        setVessels(prev => prev.map((v, i) => {
          const w = results[i];
          if (!w) return v;
          return {
            ...v,
            currentWeather: {
              seaState: waveHeightToSeaState(w.waveHeightM),
              waveHeightM: w.waveHeightM,
              windKts: Math.round(w.windSpeedKnots),
              windDirection: `${w.compass} (${Math.round(w.windDirectionDeg)}°)`,
              condition: weatherCodeToCondition(w.weatherCode)
            }
          };
        }));
      } catch (e) {
        console.debug('Live vessel weather fetch failed, keeping last known values', e);
      }
    };

    refreshVesselWeather();
    const weatherInterval = setInterval(refreshVesselWeather, 90000);
    return () => {
      cancelled = true;
      clearInterval(weatherInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync selected vessel data when vessel updates in simulation
  useEffect(() => {
    if (selectedItem.type === 'VESSEL' && selectedItem.id) {
      const updated = vessels.find(v => v.id === selectedItem.id);
      if (updated) {
        setSelectedItem(prev => ({ ...prev, data: updated }));
      }
    }
  }, [vessels, selectedItem.id, selectedItem.type]);

  // Toggle individual map layer
  const handleToggleLayer = (key: keyof MapLayerState) => {
    setLayers(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Handlers for selecting items
  const handleSelectVessel = (vessel: TrackedVessel) => {
    setSelectedItem({ type: 'VESSEL', id: vessel.id, data: vessel });
    setTargetFocusCoord({ lat: vessel.coordinates.lat, lng: vessel.coordinates.lng });
  };

  const handleSelectPort = (port: PortMapPoint) => {
    setSelectedItem({ type: 'PORT', id: port.id, data: port });
    setTargetFocusCoord({ lat: port.lat, lng: port.lng });
  };

  const handleSelectChokepoint = (chokepoint: ChokepointMarker) => {
    setSelectedItem({ type: 'CHOKEPOINT', id: chokepoint.id, data: chokepoint });
    setHighlightedChokepointId(chokepoint.id);
    setTargetFocusCoord({ lat: chokepoint.lat, lng: chokepoint.lng });
  };

  const handleSelectPreset = (preset: MapCameraPreset) => {
    setTargetFocusCoord({ lat: preset.lat, lng: preset.lng });
  };

  const handleCloseInspector = () => {
    setSelectedItem({ type: null, id: null, data: null });
  };

  // Get vessels bound for selected port
  const vesselsBoundForSelectedPort = useMemo(() => {
    if (selectedItem.type !== 'PORT' || !selectedItem.data) return [];
    const port = selectedItem.data as PortMapPoint;
    return vessels.filter(v => v.destinationPort.toLowerCase().includes(port.name.toLowerCase().split(' ')[0]));
  }, [vessels, selectedItem]);

  // Get vessels near selected chokepoint
  const vesselsNearChokepoint = useMemo(() => {
    if (selectedItem.type !== 'CHOKEPOINT' || !selectedItem.data) return [];
    const cp = selectedItem.data as ChokepointMarker;
    return vessels.filter(v => {
      const dLat = Math.abs(v.coordinates.lat - cp.lat);
      const dLng = Math.abs(v.coordinates.lng - cp.lng);
      return (dLat * dLat + dLng * dLng) < 144; // within ~12 degrees
    });
  }, [vessels, selectedItem]);

  return (
    <div className="bg-[#04080D] border border-[#162738] rounded-xl overflow-hidden shadow-2xl flex flex-col gap-3 p-4 sm:p-5">
      {/* Top Tactical Command HUD Bar */}
      <TacticalHUD
        projection={projection}
        onSelectProjection={setProjection}
        layers={layers}
        onToggleLayer={handleToggleLayer}
        isSimulating={isSimulating}
        onToggleSimulate={() => setIsSimulating(!isSimulating)}
        simSpeed={simSpeed}
        onChangeSimSpeed={setSimSpeed}
        onSelectPreset={handleSelectPreset}
        vessels={vessels}
        ports={portMapLocations}
        chokepoints={chokepointMarkers}
        onSelectVessel={handleSelectVessel}
        onSelectPort={handleSelectPort}
        onSelectChokepoint={handleSelectChokepoint}
        highlightedChokepointId={highlightedChokepointId}
        onHighlightChokepoint={setHighlightedChokepointId}
      />

      {/* Primary Map Stage with 3D Globe or 2D Tactical View */}
      <div className="relative w-full rounded-lg overflow-hidden border border-[#182F45]" style={{ height: '620px' }}>
        {projection === '3D_GLOBE' ? (
          <Globe3DView
            vessels={filteredVessels}
            ports={portMapLocations}
            chokepoints={chokepointMarkers}
            monsoonZones={monsoonZones}
            selectedItem={selectedItem}
            highlightedChokepointId={highlightedChokepointId}
            onSelectVessel={handleSelectVessel}
            onSelectPort={handleSelectPort}
            onSelectChokepoint={handleSelectChokepoint}
            layers={layers}
            theme={theme}
            targetFocusCoord={targetFocusCoord}
          />
        ) : (
          <Tactical2DView
            vessels={filteredVessels}
            ports={portMapLocations}
            chokepoints={chokepointMarkers}
            monsoonZones={monsoonZones}
            selectedItem={selectedItem}
            highlightedChokepointId={highlightedChokepointId}
            onSelectVessel={handleSelectVessel}
            onSelectPort={handleSelectPort}
            onSelectChokepoint={handleSelectChokepoint}
            layers={layers}
            theme={theme}
            targetFocusCoord={targetFocusCoord}
          />
        )}

        {/* Floating Right Docked Inspector Drawer */}
        {selectedItem.type && selectedItem.data && (
          <div className="absolute top-4 right-4 z-30 max-w-sm w-full">
            {selectedItem.type === 'VESSEL' && (
              <VesselInspectorHUD
                vessel={selectedItem.data as TrackedVessel}
                onClose={handleCloseInspector}
                onFocusCoordinates={(lat, lng) => setTargetFocusCoord({ lat, lng })}
                onNavigateToComparison={onNavigateToComparison}
              />
            )}

            {selectedItem.type === 'PORT' && (
              <PortInspectorHUD
                port={selectedItem.data as PortMapPoint}
                boundVessels={vesselsBoundForSelectedPort}
                onClose={handleCloseInspector}
                onFocusCoordinates={(lat, lng) => setTargetFocusCoord({ lat, lng })}
                onSelectVessel={handleSelectVessel}
              />
            )}

            {selectedItem.type === 'CHOKEPOINT' && (
              <ChokepointInspectorHUD
                chokepoint={selectedItem.data as ChokepointMarker}
                nearbyVessels={vesselsNearChokepoint}
                onClose={handleCloseInspector}
                onFocusCoordinates={(lat, lng) => setTargetFocusCoord({ lat, lng })}
                onSelectVessel={handleSelectVessel}
              />
            )}
          </div>
        )}

        {/* Left Live Fleet Status Telemetry Overlay */}
        <div className="absolute bottom-4 right-4 z-20 bg-[#0A141E]/90 backdrop-blur-md border border-[#1E354B] rounded-lg p-3 text-xs font-mono-data text-[#E8ECE9] shadow-xl flex flex-col gap-2 pointer-events-auto">
          <div className="flex items-center justify-between gap-4 border-b border-[#1E354B] pb-1.5">
            <span className="text-[10px] uppercase font-bold text-[#8E9B97]">Live AIS Telemetry</span>
            <span className="flex items-center gap-1.5 text-[#00F5D4] text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00F5D4] animate-ping" />
              {isSimulating ? 'TRANSMITTING' : 'PAUSED'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-[11px]">
            <div>
              <span className="text-[#8E9B97] text-[10px] block">Active Fleet</span>
              <span className="font-bold text-white">{vessels.length} Bulkers</span>
            </div>
            <div>
              <span className="text-[#8E9B97] text-[10px] block">Inbound Paradip</span>
              <span className="font-bold text-[#00F5D4]">
                {vessels.filter(v => v.destinationPort.includes('Paradip')).length} Vessels
              </span>
            </div>
            <div>
              <span className="text-[#8E9B97] text-[10px] block">Draft Compliant</span>
              <span className="font-bold text-[#34D399]">
                {vessels.filter(v => v.isDraftCompliant).length} / {vessels.length}
              </span>
            </div>
            <div>
              <span className="text-[#8E9B97] text-[10px] block">Capesize (Offshore)</span>
              <span className="font-bold text-[#F59E0B]">
                {vessels.filter(v => v.vesselClass === 'Capesize').length} Vessels
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
