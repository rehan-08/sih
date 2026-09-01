import React, { useState } from 'react';
import { MapProjectionMode, MapLayerState, MAP_CAMERA_PRESETS, MapCameraPreset } from './types';
import { TrackedVessel } from '../../types';
import { PortMapPoint, ChokepointMarker } from '../../data/vesselTrackingData';

interface TacticalHUDProps {
  projection: MapProjectionMode;
  onSelectProjection: (mode: MapProjectionMode) => void;
  layers: MapLayerState;
  onToggleLayer: (layerKey: keyof MapLayerState) => void;
  isSimulating: boolean;
  onToggleSimulate: () => void;
  simSpeed: number;
  onChangeSimSpeed: (speed: number) => void;
  onSelectPreset: (preset: MapCameraPreset) => void;
  vessels: TrackedVessel[];
  ports: PortMapPoint[];
  chokepoints: ChokepointMarker[];
  onSelectVessel: (vessel: TrackedVessel) => void;
  onSelectPort: (port: PortMapPoint) => void;
  onSelectChokepoint: (chokepoint: ChokepointMarker) => void;
  highlightedChokepointId: string | null;
  onHighlightChokepoint: (id: string | null) => void;
}

export const TacticalHUD: React.FC<TacticalHUDProps> = ({
  projection,
  onSelectProjection,
  layers,
  onToggleLayer,
  isSimulating,
  onToggleSimulate,
  simSpeed,
  onChangeSimSpeed,
  onSelectPreset,
  vessels,
  ports,
  chokepoints,
  onSelectVessel,
  onSelectPort,
  onSelectChokepoint,
  highlightedChokepointId,
  onHighlightChokepoint
}) => {
  const [isLayerMenuOpen, setIsLayerMenuOpen] = useState<boolean>(false);
  const [isPresetMenuOpen, setIsPresetMenuOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  // Search matches
  const searchResults = searchQuery.trim().length > 1 ? {
    vessels: vessels.filter(v => v.name.toLowerCase().includes(searchQuery.toLowerCase()) || v.vesselClass.toLowerCase().includes(searchQuery.toLowerCase())),
    ports: ports.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.country.toLowerCase().includes(searchQuery.toLowerCase())),
    chokepoints: chokepoints.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
  } : null;

  return (
    <div className="flex flex-col gap-2">
      {/* Primary Command Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0A141E] p-2.5 rounded-lg border border-[#1B3147] text-xs font-mono-data text-[#E8ECE9]">
        {/* Left: 3D / 2D Switcher */}
        <div className="flex items-center gap-1.5 bg-[#12202E] p-1 rounded-md border border-[#1E354B]">
          <button
            onClick={() => onSelectProjection('3D_GLOBE')}
            className={`px-3 py-1.5 rounded flex items-center gap-1.5 cursor-pointer transition-all ${
              projection === '3D_GLOBE'
                ? 'bg-[#BC412B] text-white font-bold shadow-md'
                : 'text-[#8E9B97] hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">public</span>
            <span>3D Globe</span>
          </button>

          <button
            onClick={() => onSelectProjection('2D_TACTICAL')}
            className={`px-3 py-1.5 rounded flex items-center gap-1.5 cursor-pointer transition-all ${
              projection === '2D_TACTICAL'
                ? 'bg-[#BC412B] text-white font-bold shadow-md'
                : 'text-[#8E9B97] hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">map</span>
            <span>2D Tactical</span>
          </button>
        </div>

        {/* Center: Camera Sector Presets & Search */}
        <div className="flex items-center gap-2 flex-1 max-w-xl">
          {/* Preset Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setIsPresetMenuOpen(!isPresetMenuOpen);
                setIsLayerMenuOpen(false);
                setIsSearchOpen(false);
              }}
              className="px-3 py-1.5 bg-[#12202E] hover:bg-[#1A2D3F] border border-[#1E354B] rounded-md text-xs text-[#E8ECE9] flex items-center gap-2 cursor-pointer transition-colors"
            >
              <span className="material-symbols-outlined text-[16px] text-[#00F5D4]">visibility</span>
              <span>Sectors &amp; Corridors</span>
              <span className="material-symbols-outlined text-[14px]">arrow_drop_down</span>
            </button>

            {isPresetMenuOpen && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-[#0D1824] border border-[#1E354B] rounded-lg shadow-2xl z-40 py-1 divide-y divide-[#1A2D3F]">
                {MAP_CAMERA_PRESETS.map(preset => (
                  <button
                    key={preset.id}
                    onClick={() => {
                      onSelectPreset(preset);
                      setIsPresetMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-[#162738] transition-colors cursor-pointer flex flex-col gap-0.5"
                  >
                    <span className="font-bold text-white text-xs">{preset.name}</span>
                    <span className="text-[10px] text-[#8E9B97] line-clamp-1">{preset.description}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Search Jump Bar */}
          <div className="relative flex-1">
            <div className="flex items-center bg-[#12202E] border border-[#1E354B] rounded-md px-2.5 py-1">
              <span className="material-symbols-outlined text-[#8E9B97] text-[16px] mr-1.5">search</span>
              <input
                type="text"
                placeholder="Search ship, port, or chokepoint..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                className="bg-transparent text-xs text-white placeholder-[#5A738E] outline-none w-full font-mono-data"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-[#8E9B97] hover:text-white"
                >
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              )}
            </div>

            {/* Autocomplete Results */}
            {isSearchOpen && searchResults && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-[#0D1824] border border-[#1E354B] rounded-lg shadow-2xl z-50 max-h-60 overflow-y-auto divide-y divide-[#1A2D3F]">
                {searchResults.vessels.map(v => (
                  <div
                    key={`search-v-${v.id}`}
                    onClick={() => {
                      onSelectVessel(v);
                      setIsSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="p-2 hover:bg-[#162738] cursor-pointer flex items-center justify-between text-xs"
                  >
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[14px] text-[#00F5D4]">directions_boat</span>
                      {v.name}
                    </span>
                    <span className="text-[10px] text-[#8E9B97] font-mono-data">{v.vesselClass} · {v.destinationPort}</span>
                  </div>
                ))}

                {searchResults.ports.map(p => (
                  <div
                    key={`search-p-${p.id}`}
                    onClick={() => {
                      onSelectPort(p);
                      setIsSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="p-2 hover:bg-[#162738] cursor-pointer flex items-center justify-between text-xs"
                  >
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[14px] text-[#38BDF8]">anchor</span>
                      {p.name}
                    </span>
                    <span className="text-[10px] text-[#8E9B97] font-mono-data">{p.country} · {p.status}</span>
                  </div>
                ))}

                {searchResults.chokepoints.map(c => (
                  <div
                    key={`search-c-${c.id}`}
                    onClick={() => {
                      onSelectChokepoint(c);
                      setIsSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="p-2 hover:bg-[#162738] cursor-pointer flex items-center justify-between text-xs"
                  >
                    <span className="font-bold text-[#F59E0B] flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[14px]">warning</span>
                      {c.name}
                    </span>
                    <span className="text-[10px] text-[#8E9B97] font-mono-data">{c.riskLevel}</span>
                  </div>
                ))}

                {searchResults.vessels.length === 0 && searchResults.ports.length === 0 && searchResults.chokepoints.length === 0 && (
                  <div className="p-3 text-center text-[11px] text-[#5A738E] italic">
                    No matching vessels or landmarks found
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Layers & Simulation Engine */}
        <div className="flex items-center gap-2">
          {/* Layer Filter Toggles */}
          <div className="relative">
            <button
              onClick={() => {
                setIsLayerMenuOpen(!isLayerMenuOpen);
                setIsPresetMenuOpen(false);
              }}
              className="px-3 py-1.5 bg-[#12202E] hover:bg-[#1A2D3F] border border-[#1E354B] rounded-md text-xs text-[#E8ECE9] flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <span className="material-symbols-outlined text-[16px] text-[#38BDF8]">layers</span>
              <span>Layers</span>
            </button>

            {isLayerMenuOpen && (
              <div className="absolute top-full right-0 mt-1 w-56 bg-[#0D1824] border border-[#1E354B] rounded-lg shadow-2xl z-40 p-2 flex flex-col gap-1.5">
                <span className="text-[10px] text-[#8E9B97] uppercase tracking-wider font-bold px-1">Display Layers</span>
                {[
                  { key: 'tradeCorridors', label: 'Trade Routes & Arcs' },
                  { key: 'aisFleet', label: 'Live AIS Fleet' },
                  { key: 'aisWakeTrails', label: 'Vessel Wake Trails' },
                  { key: 'portNodes', label: 'Ports & Terminals' },
                  { key: 'chokepoints', label: 'Chokepoint Hazards' },
                  { key: 'weatherRadar', label: 'Monsoon Swell Radar' },
                  { key: 'graticuleGrid', label: 'Graticule Grid' },
                  ...(projection === '3D_GLOBE' ? [{ key: 'autoRotate', label: 'Auto-Rotate Globe' }] : [])
                ].map(item => (
                  <label
                    key={item.key}
                    className="flex items-center justify-between p-1.5 hover:bg-[#162738] rounded cursor-pointer text-xs"
                  >
                    <span className="text-[#E8ECE9]">{item.label}</span>
                    <input
                      type="checkbox"
                      checked={!!layers[item.key as keyof MapLayerState]}
                      onChange={() => onToggleLayer(item.key as keyof MapLayerState)}
                      className="accent-[#00F5D4] cursor-pointer"
                    />
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Simulation Play / Pause & Speed */}
          <div className="flex items-center bg-[#12202E] border border-[#1E354B] rounded-md p-0.5">
            <button
              onClick={onToggleSimulate}
              className={`p-1.5 rounded transition-colors cursor-pointer flex items-center justify-center ${
                isSimulating ? 'text-[#00F5D4] hover:bg-[#1A2D3F]' : 'text-[#F59E0B] hover:bg-[#1A2D3F]'
              }`}
              title={isSimulating ? 'Pause AIS Movement' : 'Resume AIS Movement'}
            >
              <span className="material-symbols-outlined text-[16px]">
                {isSimulating ? 'pause' : 'play_arrow'}
              </span>
            </button>

            {[1, 5, 15].map(spd => (
              <button
                key={spd}
                onClick={() => onChangeSimSpeed(spd)}
                className={`px-2 py-1 text-[10px] rounded font-bold cursor-pointer transition-colors ${
                  simSpeed === spd
                    ? 'bg-[#00F5D4] text-[#070D14]'
                    : 'text-[#8E9B97] hover:text-white'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Strategic Chokepoints Ribbon (Instant 1-Click Highlights) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono-data scrollbar-thin">
        <span className="text-[10px] uppercase font-bold text-[#8E9B97] flex-shrink-0 flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px] text-[#F59E0B]">warning</span>
          Chokepoint Ribbon:
        </span>

        {chokepoints.map(cp => {
          const isHighlighted = highlightedChokepointId === cp.id;
          return (
            <button
              key={cp.id}
              onClick={() => {
                if (isHighlighted) {
                  onHighlightChokepoint(null);
                } else {
                  onHighlightChokepoint(cp.id);
                  onSelectChokepoint(cp);
                }
              }}
              className={`px-2.5 py-1 rounded border flex-shrink-0 flex items-center gap-1.5 transition-all cursor-pointer ${
                isHighlighted
                  ? 'bg-[#BC412B] text-white border-[#FF4D4D] shadow-md font-bold'
                  : 'bg-[#0C1622] hover:bg-[#132435] text-[#A3B1AB] hover:text-white border-[#1B3147]'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${
                cp.riskLevel === 'ELEVATED' ? 'bg-[#FF4D4D] animate-pulse' : cp.riskLevel === 'MODERATE' ? 'bg-[#F59E0B]' : 'bg-[#38BDF8]'
              }`} />
              <span>{cp.name.split(' (')[0]}</span>
              <span className="text-[9px] opacity-75">{cp.maxDraft}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
