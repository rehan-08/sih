import React from 'react';
import { ChokepointMarker } from '../../data/vesselTrackingData';
import { TrackedVessel } from '../../types';

interface ChokepointInspectorHUDProps {
  chokepoint: ChokepointMarker;
  nearbyVessels: TrackedVessel[];
  onClose: () => void;
  onFocusCoordinates?: (lat: number, lng: number) => void;
  onSelectVessel?: (vessel: TrackedVessel) => void;
}

export const ChokepointInspectorHUD: React.FC<ChokepointInspectorHUDProps> = ({
  chokepoint,
  nearbyVessels,
  onClose,
  onFocusCoordinates,
  onSelectVessel
}) => {
  return (
    <div className="bg-[#0C1622]/95 backdrop-blur-md border border-[#1E354B] rounded-xl p-5 shadow-2xl text-[#E8ECE9] flex flex-col gap-4 max-w-md w-full animate-fadeIn">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-[#1E354B] pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#F59E0B]/10 border border-[#F59E0B]/40 flex items-center justify-center text-[#F59E0B]">
            <span className="material-symbols-outlined text-2xl">warning</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-editorial text-lg font-bold text-white tracking-wide">{chokepoint.name}</h3>
              <span className={`text-[10px] px-2 py-0.5 rounded font-mono-data font-bold border ${
                chokepoint.riskLevel === 'HIGH' || chokepoint.riskLevel === 'ELEVATED'
                  ? 'bg-[#2E1212] text-[#F87171] border-[#EF4444]/40'
                  : 'bg-[#2B2008] text-[#FBBF24] border-[#F59E0B]/40'
              }`}>
                {chokepoint.riskLevel} RISK
              </span>
            </div>
            <p className="text-[11px] text-[#8E9B97] font-mono-data">
              Strategic Maritime Passage &amp; Traffic Separation Scheme
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-[#8E9B97] hover:text-white p-1 rounded hover:bg-[#1A2C3D] cursor-pointer transition-colors"
          title="Close Inspector"
        >
          <span className="material-symbols-outlined text-base">close</span>
        </button>
      </div>

      {/* Hydrographic & Passage Rules */}
      <div className="grid grid-cols-2 gap-2.5 text-xs font-mono-data">
        <div className="bg-[#12202E] p-2.5 rounded border border-[#1A2D3F]">
          <span className="text-[#8E9B97] text-[10px] block uppercase">Permissible Draft Limit</span>
          <span className="text-base font-bold text-[#F59E0B]">{chokepoint.maxDraft}</span>
        </div>

        <div className="bg-[#12202E] p-2.5 rounded border border-[#1A2D3F]">
          <span className="text-[#8E9B97] text-[10px] block uppercase">Avg Transits / Day</span>
          <span className="text-base font-bold text-[#00F5D4]">{chokepoint.dailyTransits}</span>
        </div>
      </div>

      {/* Hydrographic Constraints & Strategic Notes */}
      <div className="bg-[#12202E] p-3.5 rounded-lg border border-[#1A2D3F] flex flex-col gap-2 text-xs">
        <div className="text-[11px] font-bold text-white font-editorial">
          Hydrographic Passage Advisory:
        </div>
        <p className="text-[11px] text-[#A3B1AB] font-serif-body italic leading-relaxed">
          {chokepoint.notes}
        </p>

        <div className="pt-2 border-t border-[#1A2D3F] flex flex-col gap-1 text-[11px] font-mono-data">
          <div className="flex justify-between">
            <span className="text-[#8E9B97]">Traffic Density:</span>
            <span className="text-[#00F5D4] font-bold">Heavy Commercial Bulker Flow</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#8E9B97]">Under-Keel Clearance (UKC):</span>
            <span className="text-white font-bold">Minimum 3.5m Required</span>
          </div>
        </div>
      </div>

      {/* Transiting / Nearby Vessels */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] font-mono-data text-[#8E9B97] uppercase tracking-wider font-bold">
          Active Fleet Transiting Corridor ({nearbyVessels.length})
        </span>

        <div className="max-h-32 overflow-y-auto flex flex-col gap-1.5 pr-1">
          {nearbyVessels.length === 0 ? (
            <div className="text-xs text-[#6B7280] italic p-2 bg-[#12202E] rounded text-center">
              No vessels currently within 150 NM radius
            </div>
          ) : (
            nearbyVessels.map(v => (
              <div
                key={v.id}
                onClick={() => onSelectVessel?.(v)}
                className="bg-[#12202E] hover:bg-[#1A2C3D] border border-[#1A2D3F] hover:border-[#00F5D4]/50 p-2 rounded cursor-pointer transition-all flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span>{v.name}</span>
                    <span className="text-[9px] px-1 bg-[#1E3348] text-[#00F5D4] rounded font-mono-data">
                      {v.vesselClass}
                    </span>
                  </div>
                  <div className="text-[10px] text-[#8E9B97] font-mono-data">
                    {v.departurePort} → {v.destinationPort}
                  </div>
                </div>

                <div className="text-right font-mono-data text-[11px]">
                  <span className="text-[#00F5D4]">{v.sog} kts</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Action: Center 3D View */}
      {onFocusCoordinates && (
        <button
          onClick={() => onFocusCoordinates(chokepoint.lat, chokepoint.lng)}
          className="w-full py-2 px-3 bg-[#1A2D3F] hover:bg-[#233D56] text-[#00F5D4] rounded-lg text-xs font-mono-data font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">center_focus_strong</span>
          Center 3D View on Chokepoint
        </button>
      )}
    </div>
  );
};
