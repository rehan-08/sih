import React from 'react';
import { usePortAlerts } from '../context/PortAlertContext';
import { ViewMode } from '../types';

interface PortAlertPushToastProps {
  onNavigateToPort?: (portId: string) => void;
}

export const PortAlertPushToast: React.FC<PortAlertPushToastProps> = ({ onNavigateToPort }) => {
  const { activePushToast, dismissPushToast, toggleSubscription, toggleVesselSubscription, subscriptions, vesselSubscriptions } = usePortAlerts();

  if (!activePushToast) return null;

  const isVesselAlert = activePushToast.targetType === 'VESSEL';
  const isCritical = activePushToast.severity === 'CRITICAL';
  const isWarning = activePushToast.severity === 'WARNING';
  const isSubscribed = isVesselAlert
    ? (vesselSubscriptions[activePushToast.portId]?.isSubscribed ?? true)
    : (subscriptions[activePushToast.portId]?.isSubscribed ?? true);

  const handleInspect = () => {
    if (!isVesselAlert && onNavigateToPort) {
      onNavigateToPort(activePushToast.portId);
    }
    dismissPushToast();
  };

  const handleMuteTarget = () => {
    if (isVesselAlert) {
      toggleVesselSubscription(activePushToast.portId, activePushToast.portName);
    } else {
      toggleSubscription(activePushToast.portId, activePushToast.portName);
    }
    dismissPushToast();
  };

  return (
    <div className="fixed top-20 right-6 z-50 max-w-md w-full animate-in slide-in-from-top-4 duration-300 shadow-2xl">
      <div 
        className={`rounded-lg border p-4 backdrop-blur-md transition-all ${
          isCritical
            ? 'bg-[#1A1110]/95 dark:bg-[#1C0E0C]/95 border-[#BC412B] text-[#FFF0EE]'
            : isWarning
            ? 'bg-[#1C1710]/95 dark:bg-[#1E170E]/95 border-[#D97706] text-[#FFFBEB]'
            : 'bg-[#101820]/95 border-[#3B82F6] text-[#EFF6FF]'
        }`}
      >
        {/* Top Header Row */}
        <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span 
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isCritical ? 'bg-[#BC412B]' : isWarning ? 'bg-[#D97706]' : 'bg-[#3B82F6]'
                }`}
              />
              <span 
                className={`relative inline-flex rounded-full h-3 w-3 ${
                  isCritical ? 'bg-[#BC412B]' : isWarning ? 'bg-[#D97706]' : 'bg-[#3B82F6]'
                }`}
              />
            </span>
            <span className="text-[10px] font-mono-data uppercase font-extrabold tracking-widest px-1.5 py-0.5 rounded bg-black/40 text-white border border-white/15">
              {isVesselAlert ? 'LIVE FLEET ALERT' : 'LIVE PORT PUSH ALERT'} • {activePushToast.portName.toUpperCase()}
            </span>
          </div>

          <button
            onClick={dismissPushToast}
            className="text-white/60 hover:text-white transition-colors cursor-pointer p-1 rounded hover:bg-white/10"
            title="Dismiss Push Alert"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>

        {/* Alert Body */}
        <div className="flex gap-3">
          <div className="pt-0.5 shrink-0">
            <span 
              className={`material-symbols-outlined text-[24px] p-2 rounded-lg ${
                isCritical 
                  ? 'bg-[#BC412B]/30 text-[#FF7A66]' 
                  : isWarning 
                  ? 'bg-[#D97706]/30 text-[#FBBF24]' 
                  : 'bg-[#3B82F6]/30 text-[#60A5FA]'
              }`}
            >
              {isVesselAlert
                ? 'directions_boat'
                : activePushToast.type === 'PORT_CLOSURE'
                ? 'block'
                : activePushToast.type === 'WEATHER_CYCLONE'
                ? 'cyclone'
                : activePushToast.type === 'CRANE_OUTAGE'
                ? 'precision_manufacturing'
                : activePushToast.type === 'DRAFT_RESTRICTION'
                ? 'waves'
                : 'timer'}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold leading-snug tracking-tight font-editorial text-white">
              {activePushToast.title}
            </h4>

            <p className="text-xs font-serif-body text-white/85 mt-1 leading-relaxed line-clamp-2">
              {activePushToast.message}
            </p>

            {/* Critical Metrics Highlights */}
            <div className="grid grid-cols-2 gap-2 mt-2.5 pt-2 border-t border-white/10 text-[11px] font-mono-data">
              {activePushToast.metrics.turnaroundDelta && (
                <div className="bg-black/30 p-1.5 rounded border border-white/10">
                  <span className="text-white/60 block text-[9px] uppercase">Turnaround Shift:</span>
                  <span className="font-bold text-[#FF9E8F]">{activePushToast.metrics.turnaroundDelta}</span>
                </div>
              )}

              {activePushToast.metrics.currentTurnaround && (
                <div className="bg-black/30 p-1.5 rounded border border-white/10">
                  <span className="text-white/60 block text-[9px] uppercase">Current Turnaround:</span>
                  <span className="font-bold text-white">{activePushToast.metrics.currentTurnaround}</span>
                </div>
              )}

              {activePushToast.metrics.closureEstimatedDuration && (
                <div className="col-span-2 bg-black/30 p-1.5 rounded border border-white/10">
                  <span className="text-white/60 block text-[9px] uppercase">Est. Closure Duration:</span>
                  <span className="font-bold text-[#FBBF24]">{activePushToast.metrics.closureEstimatedDuration}</span>
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-white/10">
              <span className="text-[10px] text-white/60 font-mono-data">
                {activePushToast.timestamp}
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleMuteTarget}
                  className="px-2 py-1 rounded text-[10px] font-mono-data text-white/70 hover:text-white bg-white/5 hover:bg-white/15 transition-all cursor-pointer"
                  title={`Mute notifications for this ${isVesselAlert ? 'vessel' : 'port'}`}
                >
                  {isSubscribed ? (isVesselAlert ? 'Mute Vessel' : 'Mute Port') : 'Unmuted'}
                </button>

                <button
                  onClick={handleInspect}
                  className="px-3 py-1 rounded text-xs font-mono-data font-bold bg-white text-[#101820] hover:bg-white/90 transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                >
                  <span>Inspect Telemetry</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
