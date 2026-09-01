import React, { useState } from 'react';
import { TimelineSegment, SegmentType, VesselFleetSchedule, segmentTypeStyles } from '../../data/vesselScheduleData';

interface AddScheduleModalProps {
  fleet: VesselFleetSchedule[];
  onClose: () => void;
  onAddSegment: (newSegment: TimelineSegment) => void;
}

export const AddScheduleModal: React.FC<AddScheduleModalProps> = ({
  fleet,
  onClose,
  onAddSegment
}) => {
  const [selectedVesselId, setSelectedVesselId] = useState<string>(fleet[0]?.vesselId || '');
  const [segmentType, setSegmentType] = useState<SegmentType>('MAINTENANCE_DRYDOCK');
  const [title, setTitle] = useState<string>('Scheduled Special Survey & Drydock');
  const [startDate, setStartDate] = useState<string>('2026-09-15');
  const [durationDays, setDurationDays] = useState<number>(10);
  const [locationName, setLocationName] = useState<string>('Jurong Shipyard, Singapore');
  const [cargoType, setCargoType] = useState<string>('Thermal Coal');
  const [cargoQuantityMT, setCargoQuantityMT] = useState<number>(75000);
  const [budgetUSD, setBudgetUSD] = useState<number>(350000);
  const [classSurveyor, setClassSurveyor] = useState<string>('DNV');
  const [workScopeText, setWorkScopeText] = useState<string>(
    'Hull high-pressure water blasting and antifouling coating\nMain engine cylinder liner inspection\nTail shaft and propeller clearance verification'
  );
  const [description, setDescription] = useState<string>(
    'Scheduled maintenance window to ensure class compliance and restore fuel efficiency.'
  );

  const selectedVessel = fleet.find(v => v.vesselId === selectedVesselId) || fleet[0];
  const isMaintenance = segmentType.startsWith('MAINTENANCE');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Compute end date from start + duration
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + Number(durationDays));
    const endDateStr = end.toISOString().split('T')[0];

    const newSeg: TimelineSegment = {
      id: `seg-custom-${Date.now()}`,
      vesselId: selectedVessel.vesselId,
      vesselName: selectedVessel.vesselName,
      type: segmentType,
      title: title || `${segmentTypeStyles[segmentType].label} - ${locationName}`,
      shortLabel: title.slice(0, 18),
      startDate: startDate,
      endDate: endDateStr,
      durationDays: Number(durationDays),
      status: 'SCHEDULED',
      locationName: locationName,
      description: description,
      cargoType: isMaintenance ? undefined : cargoType,
      cargoQuantityMT: isMaintenance ? undefined : Number(cargoQuantityMT),
      shipyardName: isMaintenance ? locationName : undefined,
      classSurveyor: isMaintenance ? classSurveyor : undefined,
      maintenanceBudgetUSD: isMaintenance ? Number(budgetUSD) : undefined,
      offHireDays: isMaintenance ? Number(durationDays) : undefined,
      workScope: isMaintenance ? workScopeText.split('\n').filter(s => s.trim().length > 0) : undefined
    };

    onAddSegment(newSeg);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
      <div 
        className="bg-white dark:bg-[#101820] border border-[#DDD8CE] dark:border-[#1F2E3E] rounded-xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-[#1A1A1A] dark:text-[#E8ECE9]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-[#DDD8CE] dark:border-[#1F2E3E] bg-[#F4F0E8] dark:bg-[#16202C] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#BC412B] dark:text-[#E05A42] text-[22px]">
              calendar_add_on
            </span>
            <h2 className="font-editorial text-lg sm:text-xl font-bold text-[#1A1A1A] dark:text-[#E8ECE9]">
              Schedule Voyage / Maintenance Window
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#7A7268] dark:text-[#8E9B97] hover:bg-[#EDE8DE] dark:hover:bg-[#1F2E3E] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 flex flex-col gap-4 text-xs">
          {/* Vessel Selection */}
          <div className="flex flex-col gap-1.5">
            <label className="font-bold font-mono-data uppercase tracking-wider text-[#7A7268] dark:text-[#8E9B97]">
              Select Fleet Vessel:
            </label>
            <select
              value={selectedVesselId}
              onChange={(e) => setSelectedVesselId(e.target.value)}
              className="p-2.5 rounded-lg border border-[#DDD8CE] dark:border-[#1F2E3E] bg-white dark:bg-[#141E28] font-mono-data text-xs text-[#1A1A1A] dark:text-[#E8ECE9] focus:outline-hidden focus:border-[#BC412B]"
            >
              {fleet.map(v => (
                <option key={v.vesselId} value={v.vesselId}>
                  {v.vesselName} ({v.vesselClass} • {v.dwt.toLocaleString()} DWT • {v.flag})
                </option>
              ))}
            </select>
          </div>

          {/* Segment Type */}
          <div className="flex flex-col gap-1.5">
            <label className="font-bold font-mono-data uppercase tracking-wider text-[#7A7268] dark:text-[#8E9B97]">
              Segment Category:
            </label>
            <select
              value={segmentType}
              onChange={(e) => setSegmentType(e.target.value as SegmentType)}
              className="p-2.5 rounded-lg border border-[#DDD8CE] dark:border-[#1F2E3E] bg-white dark:bg-[#141E28] font-mono-data text-xs text-[#1A1A1A] dark:text-[#E8ECE9] focus:outline-hidden focus:border-[#BC412B]"
            >
              <optgroup label="Maintenance &amp; Technical">
                <option value="MAINTENANCE_DRYDOCK">Drydock &amp; Class Special Survey</option>
                <option value="MAINTENANCE_HULL">Underwater Hull Grooming &amp; Polishing</option>
                <option value="MAINTENANCE_ENGINE">Main Engine &amp; Turbocharger Overhaul</option>
                <option value="MAINTENANCE_BWTS">Ballast Water Treatment (BWTS) Calibration</option>
                <option value="MAINTENANCE_HOLDS">Cargo Hold Hydro-blasting &amp; Preservation</option>
              </optgroup>
              <optgroup label="Voyage Operations">
                <option value="LADEN_VOYAGE">Laden Voyage (Loaded Cargo Transit)</option>
                <option value="BALLAST_VOYAGE">Ballast Leg (Repositioning / Empty)</option>
                <option value="PORT_LOADING">Port Loading Operation</option>
                <option value="PORT_DISCHARGE">Port Discharging Operation</option>
                <option value="PORT_ANCHORAGE">Offshore Anchorage Wait / Lightering</option>
                <option value="BUNKERING_CALL">Bunkering Call</option>
              </optgroup>
            </select>
          </div>

          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="font-bold font-mono-data uppercase tracking-wider text-[#7A7268] dark:text-[#8E9B97]">
              Segment Title:
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="p-2.5 rounded-lg border border-[#DDD8CE] dark:border-[#1F2E3E] bg-white dark:bg-[#141E28] font-mono-data text-xs text-[#1A1A1A] dark:text-[#E8ECE9] focus:outline-hidden focus:border-[#BC412B]"
              placeholder="e.g. Sembcorp Marine Special Survey #2"
              required
            />
          </div>

          {/* Timing: Start Date & Duration */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="font-bold font-mono-data uppercase tracking-wider text-[#7A7268] dark:text-[#8E9B97]">
                Start Date:
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="p-2.5 rounded-lg border border-[#DDD8CE] dark:border-[#1F2E3E] bg-white dark:bg-[#141E28] font-mono-data text-xs text-[#1A1A1A] dark:text-[#E8ECE9] focus:outline-hidden focus:border-[#BC412B]"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-bold font-mono-data uppercase tracking-wider text-[#7A7268] dark:text-[#8E9B97]">
                Duration (Days):
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={durationDays}
                onChange={(e) => setDurationDays(Number(e.target.value))}
                className="p-2.5 rounded-lg border border-[#DDD8CE] dark:border-[#1F2E3E] bg-white dark:bg-[#141E28] font-mono-data text-xs text-[#1A1A1A] dark:text-[#E8ECE9] focus:outline-hidden focus:border-[#BC412B]"
                required
              />
            </div>
          </div>

          {/* Location / Yard */}
          <div className="flex flex-col gap-1.5">
            <label className="font-bold font-mono-data uppercase tracking-wider text-[#7A7268] dark:text-[#8E9B97]">
              {isMaintenance ? 'Shipyard / Anchorage Location:' : 'Port / Route Corridor:'}
            </label>
            <input
              type="text"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              className="p-2.5 rounded-lg border border-[#DDD8CE] dark:border-[#1F2E3E] bg-white dark:bg-[#141E28] font-mono-data text-xs text-[#1A1A1A] dark:text-[#E8ECE9] focus:outline-hidden focus:border-[#BC412B]"
              placeholder={isMaintenance ? 'e.g. Sembcorp Marine Tuas Boulevard' : 'e.g. Newcastle → Paradip'}
              required
            />
          </div>

          {/* Maintenance specifics vs Voyage specifics */}
          {isMaintenance ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold font-mono-data uppercase tracking-wider text-[#7A7268] dark:text-[#8E9B97]">
                    Budget Allocated ($USD):
                  </label>
                  <input
                    type="number"
                    value={budgetUSD}
                    onChange={(e) => setBudgetUSD(Number(e.target.value))}
                    className="p-2.5 rounded-lg border border-[#DDD8CE] dark:border-[#1F2E3E] bg-white dark:bg-[#141E28] font-mono-data text-xs text-[#1A1A1A] dark:text-[#E8ECE9]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-bold font-mono-data uppercase tracking-wider text-[#7A7268] dark:text-[#8E9B97]">
                    Class Society Surveyor:
                  </label>
                  <select
                    value={classSurveyor}
                    onChange={(e) => setClassSurveyor(e.target.value)}
                    className="p-2.5 rounded-lg border border-[#DDD8CE] dark:border-[#1F2E3E] bg-white dark:bg-[#141E28] font-mono-data text-xs text-[#1A1A1A] dark:text-[#E8ECE9]"
                  >
                    <option value="DNV">DNV</option>
                    <option value="Lloyd's Register">Lloyd&apos;s Register</option>
                    <option value="ClassNK">ClassNK</option>
                    <option value="ABS">ABS</option>
                    <option value="IRS">Indian Register of Shipping (IRS)</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold font-mono-data uppercase tracking-wider text-[#7A7268] dark:text-[#8E9B97]">
                  Work Scope Items (One per line):
                </label>
                <textarea
                  rows={3}
                  value={workScopeText}
                  onChange={(e) => setWorkScopeText(e.target.value)}
                  className="p-2.5 rounded-lg border border-[#DDD8CE] dark:border-[#1F2E3E] bg-white dark:bg-[#141E28] font-serif-body text-xs text-[#1A1A1A] dark:text-[#E8ECE9]"
                />
              </div>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="font-bold font-mono-data uppercase tracking-wider text-[#7A7268] dark:text-[#8E9B97]">
                  Cargo Description:
                </label>
                <input
                  type="text"
                  value={cargoType}
                  onChange={(e) => setCargoType(e.target.value)}
                  className="p-2.5 rounded-lg border border-[#DDD8CE] dark:border-[#1F2E3E] bg-white dark:bg-[#141E28] font-mono-data text-xs text-[#1A1A1A] dark:text-[#E8ECE9]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold font-mono-data uppercase tracking-wider text-[#7A7268] dark:text-[#8E9B97]">
                  Cargo Quantity (MT):
                </label>
                <input
                  type="number"
                  value={cargoQuantityMT}
                  onChange={(e) => setCargoQuantityMT(Number(e.target.value))}
                  className="p-2.5 rounded-lg border border-[#DDD8CE] dark:border-[#1F2E3E] bg-white dark:bg-[#141E28] font-mono-data text-xs text-[#1A1A1A] dark:text-[#E8ECE9]"
                />
              </div>
            </div>
          )}

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="font-bold font-mono-data uppercase tracking-wider text-[#7A7268] dark:text-[#8E9B97]">
              Operational Summary:
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="p-2.5 rounded-lg border border-[#DDD8CE] dark:border-[#1F2E3E] bg-white dark:bg-[#141E28] font-serif-body text-xs text-[#1A1A1A] dark:text-[#E8ECE9]"
            />
          </div>

          {/* Submit / Cancel Buttons */}
          <div className="pt-3 border-t border-[#DDD8CE] dark:border-[#1F2E3E] flex items-center justify-end gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-[#DDD8CE] dark:border-[#1F2E3E] bg-white dark:bg-[#101820] text-xs font-mono-data text-[#6B645C] dark:text-[#A3B1AB] hover:text-[#1A1A1A] dark:hover:text-[#E8ECE9] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-[#BC412B] hover:bg-[#A33420] text-white text-xs font-editorial font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">check</span>
              <span>Add to Schedule</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
