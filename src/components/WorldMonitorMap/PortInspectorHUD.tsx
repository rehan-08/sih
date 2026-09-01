import React from 'react';
import { PortMapPoint } from '../../data/vesselTrackingData';
import { TrackedVessel } from '../../types';
import { usePortAlerts } from '../../context/PortAlertContext';

interface PortInspectorHUDProps {
  port: PortMapPoint;
  boundVessels: TrackedVessel[];
  onClose: () => void;
  onFocusCoordinates?: (lat: number, lng: number) => void;
  onSelectVessel?: (vessel: TrackedVessel) => void;
}

export const PortInspectorHUD: React.FC<PortInspectorHUDProps> = ({
  port,
  boundVessels,
  onClose,
  onFocusCoordinates,
  onSelectVessel
}) => {
  const { subscriptions, toggleSubscription, openSubscriptionModal } = usePortAlerts();
  const subscribed = !!subscriptions[port.id]?.isSubscribed;

  return (
    <div className="bg-[#0C1622]/95 backdrop-blur-md border border-[#1E354B] rounded-xl p-5 shadow-2xl text-[#E8ECE9] flex flex-col gap-4 max-w-md w-full animate-fadeIn">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-[#1E354B] pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#00F5D4]/10 border border-[#00F5D4]/40 flex items-center justify-center text-[#00F5D4]">
            <span className="material-symbols-outlined text-2xl">anchor</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-editorial text-lg font-bold text-white tracking-wide">{port.name}</h3>
              <span className={`text-[10px] px-2 py-0.5 rounded font-mono-data font-bold border ${
                port.status === 'OPTIMAL'
                  ? 'bg-[#0D241C] text-[#34D399] border-[#10B981]/40'
                  : port.status === 'CONGESTED'
                  ? 'bg-[#2E1212] text-[#F87171] border-[#EF4444]/40'
                  : 'bg-[#2B2008] text-[#FBBF24] border-[#F59E0B]/40'
              }`}>
                {port.status}
              </span>
            </div>
            <p className="text-[11px] text-[#8E9B97] font-mono-data">
              {port.country} · {port.type === 'LOADING' ? 'Primary Loading Hub' : 'Discharge Terminal'}
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

      {/* Hydrographic Limits Grid */}
      <div className="grid grid-cols-3 gap-2.5 text-xs font-mono-data">
        <div className="bg-[#12202E] p-2.5 rounded border border-[#1A2D3F]">
          <span className="text-[#8E9B97] text-[10px] block uppercase">Max Safe Draft</span>
          <span className="text-base font-bold text-[#00F5D4]">{port.maxDraftM}m</span>
        </div>

        <div className="bg-[#12202E] p-2.5 rounded border border-[#1A2D3F]">
          <span className="text-[#8E9B97] text-[10px] block uppercase">Max Berth LOA</span>
          <span className="text-base font-bold text-white">{port.maxLoaM}m</span>
        </div>

        <div className="bg-[#12202E] p-2.5 rounded border border-[#1A2D3F]">
          <span className="text-[#8E9B97] text-[10px] block uppercase">Berth Queue</span>
          <span className="text-base font-bold text-[#F59E0B]">~{port.currentWaitHours}h</span>
        </div>
      </div>

      {/* Terminal Specifications */}
      <div className="bg-[#12202E] p-3.5 rounded-lg border border-[#1A2D3F] flex flex-col gap-2 text-xs">
        <div className="text-[11px] font-bold text-white font-editorial flex items-center justify-between">
          <span>Terminal Infrastructure:</span>
          <span className="text-[#8E9B97] font-mono-data">{port.activeBerths} Active Berths</span>
        </div>
        <p className="text-[11px] text-[#A3B1AB] font-serif-body italic leading-relaxed">
          {port.terminalNotes}
        </p>

        {/* Live Weather & Swell Conditions */}
        <div className="pt-2 border-t border-[#1A2D3F] flex items-center justify-between text-[11px] font-mono-data text-[#8CB4D2]">
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[15px] text-[#38BDF8]">air</span>
            Wind: {port.windKts} kts
          </span>
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[15px] text-[#38BDF8]">tsunami</span>
            Wave Swell: {port.swellHeightM}m
          </span>
        </div>
      </div>

      {/* Bound / En-Route Tracked Vessels */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] font-mono-data text-[#8E9B97] uppercase tracking-wider font-bold">
          En-Route Vessels Bound for {port.name} ({boundVessels.length})
        </span>

        <div className="max-h-36 overflow-y-auto flex flex-col gap-1.5 pr-1">
          {boundVessels.length === 0 ? (
            <div className="text-xs text-[#6B7280] italic p-2 bg-[#12202E] rounded text-center">
              No active AIS vessels currently targeted
            </div>
          ) : (
            boundVessels.map(v => (
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
                    ETA: {v.eta} · {v.sog} kts
                  </div>
                </div>

                <div className="text-right font-mono-data text-[11px]">
                  <span className={v.isDraftCompliant ? 'text-[#34D399]' : 'text-[#F87171] font-bold'}>
                    {v.currentDraftM}m draft
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Port Alert Subscription & Camera Focus */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={() => toggleSubscription(port.name)}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-mono-data font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border ${
            subscribed
              ? 'bg-[#0D241C] text-[#34D399] border-[#10B981]/50 hover:bg-[#103025]'
              : 'bg-[#1A2D3F] text-[#E8ECE9] border-[#2E4860] hover:bg-[#233D56]'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">
            {subscribed ? 'notifications_active' : 'notification_add'}
          </span>
          {subscribed ? 'Alert Subscribed' : 'Enable Port Alerts'}
        </button>

        {onFocusCoordinates && (
          <button
            onClick={() => onFocusCoordinates(port.lat, port.lng)}
            className="py-2 px-3 bg-[#1A2D3F] hover:bg-[#233D56] text-[#00F5D4] rounded-lg text-xs font-mono-data font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            title="Center Camera on Port"
          >
            <span className="material-symbols-outlined text-[16px]">center_focus_strong</span>
          </button>
        )}
      </div>
    </div>
  );
};
