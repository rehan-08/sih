import React, { useState } from 'react';
import { TrackedVessel } from '../../types';
import { usePortAlerts } from '../../context/PortAlertContext';

interface VesselInspectorHUDProps {
  vessel: TrackedVessel;
  onClose: () => void;
  onFocusCoordinates?: (lat: number, lng: number) => void;
  onNavigateToComparison?: () => void;
}

export const VesselInspectorHUD: React.FC<VesselInspectorHUDProps> = ({
  vessel,
  onClose,
  onFocusCoordinates,
  onNavigateToComparison
}) => {
  const { vesselSubscriptions, toggleVesselSubscription } = usePortAlerts();
  const isSubscribed = vesselSubscriptions[vessel.id]?.isSubscribed ?? false;

  // Interactive Speed Simulation Slider
  const [simulatedSpeed, setSimulatedSpeed] = useState<number>(vessel.sog);

  // Dynamic ETA and bunker calculation
  const distanceToGoNM = Math.round(vessel.totalDistanceNM * (1 - vessel.progressPct / 100));
  const baselineHours = distanceToGoNM / (vessel.sog || 12.5);
  const simulatedHours = distanceToGoNM / (simulatedSpeed || 12.5);
  const hoursDelta = simulatedHours - baselineHours;

  // Bunker consumption estimation: Consumption ~ Speed^3
  // Baseline ~ 30 MT/day VLSFO at 13 kts ($620/MT)
  const baselineDailyBurn = 30 * Math.pow(vessel.sog / 13.0, 3);
  const simulatedDailyBurn = 30 * Math.pow(simulatedSpeed / 13.0, 3);
  const baselineTotalBurn = (baselineHours / 24) * baselineDailyBurn;
  const simulatedTotalBurn = (simulatedHours / 24) * simulatedDailyBurn;
  const bunkerCostDelta = (simulatedTotalBurn - baselineTotalBurn) * 620;

  return (
    <div className="bg-[#0C1622]/95 backdrop-blur-md border border-[#1E354B] rounded-xl p-5 shadow-2xl text-[#E8ECE9] flex flex-col gap-4 max-w-md w-full animate-fadeIn">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-[#1E354B] pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#BC412B]/20 border border-[#BC412B] flex items-center justify-center text-[#E05A42]">
            <span className="material-symbols-outlined text-2xl">directions_boat</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-editorial text-lg font-bold text-white tracking-wide">{vessel.name}</h3>
              <span className="text-xs px-2 py-0.5 rounded font-mono-data font-bold bg-[#1A2C3D] text-[#00F5D4] border border-[#2B4660]">
                {vessel.vesselClass}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded font-mono-data font-bold bg-[#16202C] text-[#8CB4D2] border border-[#2B4660]">
                {vessel.contractType.replace('_', ' ')}
              </span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono-data font-bold border ${
                vessel.voyageLeg === 'BALLAST_RETURN'
                  ? 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/40'
                  : 'bg-[#2D5A43]/15 text-[#3EB58A] border-[#2D5A43]/40'
              }`}>
                {vessel.voyageLeg === 'BALLAST_RETURN' ? 'BALLAST' : 'LADEN'}
              </span>
            </div>
            <p className="text-[11px] text-[#8E9B97] font-mono-data">
              IMO {vessel.imo} · Flag: {vessel.flag} · Call: {vessel.callSign}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => toggleVesselSubscription(vessel.id, vessel.name)}
            className={`p-1.5 rounded cursor-pointer transition-colors ${
              isSubscribed ? 'text-[#00F5D4] hover:bg-[#1A2C3D]' : 'text-[#8E9B97] hover:text-white hover:bg-[#1A2C3D]'
            }`}
            title={isSubscribed ? 'Unsubscribe from vessel alerts' : 'Subscribe to vessel alerts'}
          >
            <span className="material-symbols-outlined text-base">{isSubscribed ? 'notifications_active' : 'notifications_none'}</span>
          </button>
          <button
            onClick={onClose}
            className="text-[#8E9B97] hover:text-white p-1 rounded hover:bg-[#1A2C3D] cursor-pointer transition-colors"
            title="Close Inspector"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>
      </div>

      {/* Hydrographic Draft Compliance Badge */}
      <div className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 ${
        vessel.isDraftCompliant
          ? 'bg-[#0D241C] border-[#10B981]/40 text-[#6EE7B7]'
          : 'bg-[#2E1212] border-[#EF4444]/40 text-[#FCA5A5]'
      }`}>
        <span className="material-symbols-outlined text-lg flex-shrink-0">
          {vessel.isDraftCompliant ? 'verified' : 'warning'}
        </span>
        <div>
          <div className="font-bold font-editorial">
            {vessel.isDraftCompliant ? 'HYDROGRAPHIC BERTH COMPLIANT' : 'PORT DRAFT / LOA RESTRICTION ALERT'}
          </div>
          <p className="text-[11px] mt-0.5 opacity-90 font-serif-body">
            {vessel.draftComplianceNote}
          </p>
        </div>
      </div>

      {/* Live Telemetry Grid */}
      <div className="grid grid-cols-3 gap-2.5 text-xs font-mono-data">
        <div className="bg-[#12202E] p-2.5 rounded border border-[#1A2D3F]">
          <span className="text-[#8E9B97] text-[10px] block uppercase">Live SOG Speed</span>
          <span className="text-base font-bold text-[#00F5D4]">{vessel.sog} kts</span>
        </div>

        <div className="bg-[#12202E] p-2.5 rounded border border-[#1A2D3F]">
          <span className="text-[#8E9B97] text-[10px] block uppercase">Heading / Track</span>
          <span className="text-base font-bold text-white">{vessel.heading}° T</span>
        </div>

        <div className="bg-[#12202E] p-2.5 rounded border border-[#1A2D3F]">
          <span className="text-[#8E9B97] text-[10px] block uppercase">Arrival Draft</span>
          <span className={`text-base font-bold ${vessel.isDraftCompliant ? 'text-white' : 'text-[#FF4D4D]'}`}>
            {vessel.currentDraftM}m
          </span>
        </div>
      </div>

      {/* Voyage & Cargo Progress */}
      <div className="bg-[#12202E] p-3.5 rounded-lg border border-[#1A2D3F] flex flex-col gap-2 text-xs">
        <div className="flex justify-between items-center text-[11px]">
          <span className="text-[#8E9B97]">Origin: <strong className="text-white">{vessel.departurePort}</strong></span>
          <span className="text-[#8E9B97]">Destination: <strong className="text-[#00F5D4]">{vessel.destinationPort}</strong></span>
        </div>

        {/* Progress bar */}
        <div>
          <div className="w-full bg-[#1A2C3D] h-2 rounded-full overflow-hidden flex">
            <div
              className="bg-gradient-to-r from-[#00F5D4] to-[#BC412B] h-full rounded-full transition-all"
              style={{ width: `${vessel.progressPct}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] font-mono-data text-[#8E9B97] mt-1">
            <span>{vessel.progressPct}% completed</span>
            <span>{distanceToGoNM.toLocaleString()} NM remaining</span>
          </div>
        </div>

        <div className="flex justify-between text-[11px] pt-1 border-t border-[#1A2D3F]">
          <span className="text-[#8E9B97]">Cargo: <strong className="text-white">{vessel.cargoType} ({vessel.dwt.toLocaleString()} DWT)</strong></span>
          <span className="text-[#8E9B97]">Est. Value: <strong className="text-[#F59E0B]">{vessel.cargoValueUSD}</strong></span>
        </div>

        <div className="text-[11px] text-[#A3B1AB] font-mono-data">
          ETA: <strong className="text-white">{vessel.eta}</strong> (~{Math.round(baselineHours)} hrs)
        </div>
      </div>

      {/* Interactive Speed & Fuel Simulation Slider */}
      <div className="bg-[#101C28] p-3.5 rounded-lg border border-[#1E354B] flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold font-editorial text-white flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-[#F59E0B]">speed</span>
            Steaming Speed &amp; Bunker Optimization
          </span>
          <span className="text-xs font-mono-data font-bold text-[#00F5D4]">{simulatedSpeed.toFixed(1)} kts</span>
        </div>

        <input
          type="range"
          min="10.0"
          max="16.0"
          step="0.2"
          value={simulatedSpeed}
          onChange={(e) => setSimulatedSpeed(parseFloat(e.target.value))}
          className="w-full h-1.5 bg-[#1A2D3F] rounded-lg appearance-none cursor-pointer accent-[#00F5D4]"
        />

        <div className="grid grid-cols-2 gap-2 text-[11px] font-mono-data">
          <div className="bg-[#162738] p-2 rounded">
            <span className="text-[#8E9B97] text-[10px] block">ETA Adjustment</span>
            <span className={`font-bold ${hoursDelta > 0 ? 'text-[#F59E0B]' : 'text-[#00F5D4]'}`}>
              {hoursDelta > 0 ? `+${Math.round(hoursDelta)}h delay` : `${Math.round(Math.abs(hoursDelta))}h faster`}
            </span>
          </div>

          <div className="bg-[#162738] p-2 rounded">
            <span className="text-[#8E9B97] text-[10px] block">Bunker Impact</span>
            <span className={`font-bold ${bunkerCostDelta > 0 ? 'text-[#FF4D4D]' : 'text-[#10B981]'}`}>
              {bunkerCostDelta > 0 ? `+$${Math.round(bunkerCostDelta).toLocaleString()}` : `-$${Math.round(Math.abs(bunkerCostDelta)).toLocaleString()} saved`}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-1">
        {onFocusCoordinates && (
          <button
            onClick={() => onFocusCoordinates(vessel.coordinates.lat, vessel.coordinates.lng)}
            className="flex-1 py-2 px-3 bg-[#1A2D3F] hover:bg-[#233D56] text-[#00F5D4] rounded-lg text-xs font-mono-data font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">center_focus_strong</span>
            Center 3D View
          </button>
        )}

        {onNavigateToComparison && (
          <button
            onClick={onNavigateToComparison}
            className="flex-1 py-2 px-3 bg-[#BC412B] hover:bg-[#A33420] text-white rounded-lg text-xs font-editorial font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">splitscreen</span>
            Class Fit
          </button>
        )}
      </div>
    </div>
  );
};
