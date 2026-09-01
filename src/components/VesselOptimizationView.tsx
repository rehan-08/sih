import React, { useState } from 'react';
import { vesselClassMatrix } from '../data/maritimeData';
import { RealTimeVesselMap } from './RealTimeVesselMap';
import { VesselTimelineGantt } from './VesselTimelineGantt/VesselTimelineGantt';

interface VesselOptimizationViewProps {
  onNavigateToComparison?: () => void;
}

export const VesselOptimizationView: React.FC<VesselOptimizationViewProps> = ({
  onNavigateToComparison
}) => {
  const [selectedVessel, setSelectedVessel] = useState<string>('Panamax');
  const [activeTab, setActiveTab] = useState<'all' | 'timeline' | 'map' | 'matrix'>('all');

  const detailedVesselInfo: Record<string, { draft: string; maxDraft: string; loa: string; maxLoa: string; beam: string; maxBeam: string; berth: string; details: string }> = {
    Handysize: {
      draft: '10.5m',
      maxDraft: '14.5m',
      loa: '180m',
      maxLoa: '260m',
      beam: '28.0m',
      maxBeam: '32.5m',
      berth: 'Standard General Cargo Berth',
      details: 'Fully compliant with all Indian East Coast ports, but requires 4-5 voyages to lift 180K MT.'
    },
    Supramax: {
      draft: '13.2m',
      maxDraft: '14.5m',
      loa: '200m',
      maxLoa: '260m',
      beam: '32.2m',
      maxBeam: '32.5m',
      berth: 'Multi-Purpose Bulk Berth',
      details: 'Good flexibility and self-geared discharge capability, but higher $/MT freight rate than Panamax.'
    },
    Panamax: {
      draft: '14.2m',
      maxDraft: '14.5m',
      loa: '229m',
      maxLoa: '260m',
      beam: '32.2m',
      maxBeam: '32.5m',
      berth: 'Dedicated Deep-Draft Coal Berth #2',
      details: 'Optimal cargo parcel density and lowest freight cost per ton without requiring lightering.'
    },
    Capesize: {
      draft: '18.2m',
      maxDraft: '14.5m (EXCEEDED)',
      loa: '292m (EXCEEDED)',
      maxLoa: '260m',
      beam: '45.0m (EXCEEDED)',
      maxBeam: '32.5m',
      berth: 'Deep Offshore Anchorage Only',
      details: 'Requires offshore double-banking and barge transshipment; incurs +$4.20/MT lightering charge.'
    }
  };

  const selectedDetails = detailedVesselInfo[selectedVessel] || detailedVesselInfo['Panamax'];

  return (
    <div className="p-6 sm:p-8 flex flex-col gap-8 max-w-7xl mx-auto w-full text-[#1A1A1A] dark:text-[#E8ECE9]">
      {/* Breadcrumb navigation */}
      <div className="flex items-center gap-2 text-xs text-[#7A7268] dark:text-[#8E9B97] font-mono-data">
        <span>Monographs</span>
        <span>&gt;</span>
        <span>Fleet Optimization</span>
        <span>&gt;</span>
        <span className="text-[#BC412B] dark:text-[#E05A42] font-semibold">Vessel Class Matrix</span>
      </div>

      {/* Header */}
      <div className="pb-4 border-b border-[#DDD8CE] dark:border-[#1F2E3E] flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#BC412B] dark:text-[#E05A42] font-bold">
            Fleet Architecture, Live AIS &amp; Hydrodynamic Fit
          </span>
          <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-[#1A1A1A] dark:text-[#E8ECE9] mt-0.5">
            Vessel Optimization Matrix
          </h1>
          <p className="text-xs sm:text-sm text-[#6B645C] dark:text-[#A3B1AB] font-serif-body italic mt-1">
            Real-Time Bulker Tracking &amp; Hull Classification Suitability for Newcastle → Paradip (180,000 MT Thermal Coal Parcel)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Switcher */}
          <div className="flex bg-[#EDE8DE] dark:bg-[#16202C] rounded-lg border border-[#DDD8CE] dark:border-[#1F2E3E] p-1 text-xs font-mono-data">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'all'
                  ? 'bg-white dark:bg-[#101820] text-[#BC412B] dark:text-[#E05A42] font-bold shadow-2xs'
                  : 'text-[#6B645C] dark:text-[#A3B1AB] hover:text-[#1A1A1A] dark:hover:text-[#E8ECE9]'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">dashboard</span>
              <span>All Modules</span>
            </button>

            <button
              onClick={() => setActiveTab('timeline')}
              className={`px-3 py-1.5 rounded transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'timeline'
                  ? 'bg-white dark:bg-[#101820] text-[#BC412B] dark:text-[#E05A42] font-bold shadow-2xs'
                  : 'text-[#6B645C] dark:text-[#A3B1AB] hover:text-[#1A1A1A] dark:hover:text-[#E8ECE9]'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">view_timeline</span>
              <span>Gantt Schedule</span>
            </button>

            <button
              onClick={() => setActiveTab('map')}
              className={`px-3 py-1.5 rounded transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'map'
                  ? 'bg-white dark:bg-[#101820] text-[#BC412B] dark:text-[#E05A42] font-bold shadow-2xs'
                  : 'text-[#6B645C] dark:text-[#A3B1AB] hover:text-[#1A1A1A] dark:hover:text-[#E8ECE9]'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">explore</span>
              <span>Live Map Overlay</span>
            </button>

            <button
              onClick={() => setActiveTab('matrix')}
              className={`px-3 py-1.5 rounded transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'matrix'
                  ? 'bg-white dark:bg-[#101820] text-[#BC412B] dark:text-[#E05A42] font-bold shadow-2xs'
                  : 'text-[#6B645C] dark:text-[#A3B1AB] hover:text-[#1A1A1A] dark:hover:text-[#E8ECE9]'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">table_chart</span>
              <span>Class Matrix</span>
            </button>
          </div>

          {onNavigateToComparison && (
            <button
              onClick={onNavigateToComparison}
              className="px-4 py-2 rounded bg-[#BC412B] hover:bg-[#A33420] text-white text-xs font-editorial font-bold shadow-xs cursor-pointer flex items-center gap-2 transition-all self-start sm:self-auto"
            >
              <span className="material-symbols-outlined text-[18px]">splitscreen</span>
              <span>Side-by-Side Vessel Comparison</span>
            </button>
          )}
        </div>
      </div>

      {/* FLEET VOYAGES & SCHEDULED MAINTENANCE GANTT TIMELINE */}
      {(activeTab === 'all' || activeTab === 'timeline') && (
        <VesselTimelineGantt
          onSelectVesselClass={(vClass) => setSelectedVessel(vClass)}
        />
      )}

      {/* REAL-TIME VESSEL TRACKING MAP OVERLAY */}
      {(activeTab === 'all' || activeTab === 'map') && (
        <RealTimeVesselMap
          selectedClassFilter={selectedVessel}
          onSelectVesselClass={(vClass) => setSelectedVessel(vClass)}
          onNavigateToComparison={onNavigateToComparison}
        />
      )}

      {/* Main Table: Vessel Class Matrix */}
      {(activeTab === 'all' || activeTab === 'matrix') && (
        <>
          <div className="bg-white dark:bg-[#101820] border border-[#DDD8CE] dark:border-[#1F2E3E] rounded-lg overflow-hidden shadow-sm">
            <div className="p-4 sm:p-5 border-b border-[#DDD8CE] dark:border-[#1F2E3E] bg-[#F4F0E8] dark:bg-[#16202C] flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#BC412B] dark:text-[#E05A42] text-[20px]">
                  directions_boat
                </span>
                <h3 className="font-editorial text-base sm:text-lg font-bold text-[#1A1A1A] dark:text-[#E8ECE9]">
                  Vessel Class Comparison Matrix
                </h3>
              </div>
              <span className="text-xs text-[#7A7268] dark:text-[#8E9B97] font-serif-body italic hidden sm:inline">
                Select a vessel class row to review terminal specifications &amp; filter map
              </span>
            </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-[#DDD8CE] dark:border-[#1F2E3E] bg-[#EDE8DE]/70 dark:bg-[#1C2834]/70 text-[10px] font-bold text-[#7A7268] dark:text-[#8E9B97] uppercase tracking-wider">
                <th className="py-3.5 px-4">Vessel Class</th>
                <th className="py-3.5 px-4">Capacity (DWT)</th>
                <th className="py-3.5 px-4">Port Compatibility</th>
                <th className="py-3.5 px-4">Parcel Utilization</th>
                <th className="py-3.5 px-4 text-right">Operational Fit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDD8CE] dark:divide-[#1F2E3E]">
              {vesselClassMatrix.map((v) => {
                const isSelected = selectedVessel === v.type;
                const isRec = v.isRecommended;

                return (
                  <tr
                    key={v.type}
                    onClick={() => setSelectedVessel(v.type)}
                    className={`cursor-pointer transition-colors ${
                      isRec
                        ? 'bg-[#EDE8DE]/60 dark:bg-[#16202C] border-l-4 border-[#BC412B] dark:border-[#E05A42]'
                        : isSelected
                        ? 'bg-[#F4F0E8] dark:bg-[#1C2834]'
                        : 'hover:bg-[#F9F7F2] dark:hover:bg-[#16202C]/60'
                    }`}
                  >
                    <td className="py-4 px-4 font-bold text-[#1A1A1A] dark:text-[#E8ECE9]">
                      <div className="flex items-center gap-2">
                        <span className="font-editorial text-base">{v.type}</span>
                        {isRec && (
                          <span className="px-2 py-0.5 bg-[#BC412B] text-white text-[10px] font-bold rounded font-mono-data">
                            OPTIMAL
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4 font-mono-data text-[#555555] dark:text-[#A3B1AB]">
                      {v.capacityMT} MT
                    </td>
                    <td className="py-4 px-4">
                      {v.compatibility === 'Compatible' ? (
                        <span className="inline-flex items-center gap-1.5 text-[#2D5A43] dark:text-[#3EB58A] text-xs font-bold font-serif-body">
                          <span className="material-symbols-outlined text-[16px]">check_circle</span>
                          <span>Compatible</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-[#BC412B] dark:text-[#E05A42] text-xs font-bold font-serif-body">
                          <span className="material-symbols-outlined text-[16px]">warning</span>
                          <span>Restricted (Draft/LOA)</span>
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-xs text-[#333333] dark:text-[#C5D0CB] font-serif-body">
                      {v.parcelUtilization}
                    </td>
                    <td className="py-4 px-4 text-right">
                      {isRec ? (
                        <span className="inline-block px-3 py-1 bg-[#BC412B] text-white rounded text-xs font-bold font-mono-data shadow-2xs">
                          RECOMMENDED
                        </span>
                      ) : v.operationalFit === 'NOT RECOMMENDED' ? (
                        <span className="inline-block px-3 py-1 bg-[#EDE8DE] dark:bg-[#16202C] text-[#BC412B] dark:text-[#E05A42] border border-[#BC412B]/40 rounded text-xs font-bold font-mono-data">
                          NOT RECOMMENDED
                        </span>
                      ) : (
                        <span className="inline-block px-3 py-1 bg-[#EDE8DE] dark:bg-[#16202C] text-[#7A7268] dark:text-[#8E9B97] rounded text-xs font-mono-data">
                          {v.operationalFit}
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

      {/* Capesize Restriction Notice */}
      <div className="bg-white dark:bg-[#101820] border border-[#BC412B]/30 dark:border-[#E05A42]/30 border-l-4 border-l-[#BC412B] dark:border-l-[#E05A42] rounded-lg p-5 flex items-start gap-4 shadow-sm">
        <div className="p-2.5 bg-[#EDE8DE] dark:bg-[#16202C] rounded text-[#BC412B] dark:text-[#E05A42] flex-shrink-0">
          <span className="material-symbols-outlined text-2xl">report_problem</span>
        </div>
        <div>
          <h4 className="text-sm font-bold text-[#BC412B] dark:text-[#E05A42] uppercase tracking-wider mb-1 font-editorial">
            Capesize Hydrographic Restriction Notice
          </h4>
          <p className="text-xs text-[#444444] dark:text-[#C5D0CB] font-serif-body leading-relaxed">
            Paradip inner harbor draft limits (14.5m) and LOA restrictions (260m) prevent fully laden Capesize vessels (typically requiring 18.0m+ draft) from berthing directly. Transshipment / lightering at anchorage would add <span className="font-bold text-[#BC412B] dark:text-[#E05A42] font-mono-data">$3.80–$4.50/MT</span> in secondary handling costs, neutralizing vessel scale economies.
          </p>
        </div>
      </div>

      {/* Vessel-Port Compatibility Deep-Dive */}
      <div className="bg-white dark:bg-[#101820] border border-[#DDD8CE] dark:border-[#1F2E3E] rounded-lg p-6 shadow-sm flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-[#DDD8CE] dark:border-[#1F2E3E]">
          <div>
            <h3 className="font-editorial text-base sm:text-lg font-bold text-[#1A1A1A] dark:text-[#E8ECE9]">
              {selectedVessel} Class Vessel-Port Compatibility Analysis
            </h3>
            <p className="text-xs text-[#6B645C] dark:text-[#A3B1AB] font-serif-body italic">
              Discharge Port: Paradip Port (Coal Berths #1 &amp; #2)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#7A7268] dark:text-[#8E9B97] font-mono-data">Select Class:</span>
            <div className="flex bg-[#EDE8DE] dark:bg-[#16202C] rounded border border-[#DDD8CE] dark:border-[#1F2E3E] p-0.5">
              {(['Handysize', 'Supramax', 'Panamax', 'Capesize'] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setSelectedVessel(v)}
                  className={`px-3 py-1 text-xs rounded transition-colors cursor-pointer font-mono-data ${
                    selectedVessel === v
                      ? 'bg-white dark:bg-[#101820] text-[#BC412B] dark:text-[#E05A42] font-bold shadow-2xs'
                      : 'text-[#6B645C] dark:text-[#8E9B97] hover:text-[#1A1A1A] dark:hover:text-[#E8ECE9]'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Technical Specs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="bg-[#F4F0E8] dark:bg-[#16202C] p-4 rounded border border-[#DDD8CE] dark:border-[#1F2E3E]">
            <span className="text-[#7A7268] dark:text-[#8E9B97] block text-[10px] uppercase font-bold tracking-wider">Max Operating Draft</span>
            <div className="text-lg font-extrabold text-[#1A1A1A] dark:text-[#E8ECE9] font-mono-data mt-1">{selectedDetails.draft}</div>
            <span className="text-[11px] text-[#6B645C] dark:text-[#A3B1AB] block mt-1 font-serif-body">Port Limit: {selectedDetails.maxDraft}</span>
          </div>

          <div className="bg-[#F4F0E8] dark:bg-[#16202C] p-4 rounded border border-[#DDD8CE] dark:border-[#1F2E3E]">
            <span className="text-[#7A7268] dark:text-[#8E9B97] block text-[10px] uppercase font-bold tracking-wider">Length Overall (LOA)</span>
            <div className="text-lg font-extrabold text-[#1A1A1A] dark:text-[#E8ECE9] font-mono-data mt-1">{selectedDetails.loa}</div>
            <span className="text-[11px] text-[#6B645C] dark:text-[#A3B1AB] block mt-1 font-serif-body">Port Max LOA: {selectedDetails.maxLoa}</span>
          </div>

          <div className="bg-[#F4F0E8] dark:bg-[#16202C] p-4 rounded border border-[#DDD8CE] dark:border-[#1F2E3E]">
            <span className="text-[#7A7268] dark:text-[#8E9B97] block text-[10px] uppercase font-bold tracking-wider">Beam / Breadth</span>
            <div className="text-lg font-extrabold text-[#1A1A1A] dark:text-[#E8ECE9] font-mono-data mt-1">{selectedDetails.beam}</div>
            <span className="text-[11px] text-[#6B645C] dark:text-[#A3B1AB] block mt-1 font-serif-body">Port Max Beam: {selectedDetails.maxBeam}</span>
          </div>

          <div className="bg-[#F4F0E8] dark:bg-[#16202C] p-4 rounded border border-[#DDD8CE] dark:border-[#1F2E3E]">
            <span className="text-[#7A7268] dark:text-[#8E9B97] block text-[10px] uppercase font-bold tracking-wider">Berth Allocation</span>
            <div className="text-sm font-bold text-[#BC412B] dark:text-[#E05A42] font-editorial mt-1">{selectedDetails.berth}</div>
            <span className="text-[11px] text-[#6B645C] dark:text-[#A3B1AB] block mt-1 font-serif-body italic">Direct conveyor link</span>
          </div>
        </div>

        <div className="bg-[#EDE8DE] dark:bg-[#16202C] p-4 rounded text-xs text-[#1A1A1A] dark:text-[#E8ECE9] flex items-center gap-3 border border-[#DDD8CE] dark:border-[#1F2E3E]">
          <span className="material-symbols-outlined text-[#BC412B] dark:text-[#E05A42] text-[20px] flex-shrink-0">info</span>
          <span className="font-serif-body italic">{selectedDetails.details}</span>
        </div>
      </div>
      </>
      )}
    </div>
  );
};
