import React, { useState } from 'react';
import { AnalysisInput } from '../types';
import { RoutePreviewChart } from './RoutePreviewChart';

interface NewAnalysisWizardProps {
  initialData: AnalysisInput;
  onSubmit: (data: AnalysisInput) => void;
  onCancel: () => void;
}

export const NewAnalysisWizard: React.FC<NewAnalysisWizardProps> = ({
  initialData,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState<AnalysisInput>(initialData);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate real-time computational pipeline
    const timer1 = setTimeout(() => setProcessingStep(1), 400);
    const timer2 = setTimeout(() => setProcessingStep(2), 900);
    const timer3 = setTimeout(() => setProcessingStep(3), 1400);
    const timer4 = setTimeout(() => {
      setIsProcessing(false);
      onSubmit(formData);
    }, 1900);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  };

  return (
    <div className="p-6 sm:p-8 flex flex-col gap-8 max-w-7xl mx-auto w-full text-[#1A1A1A] dark:text-[#E8ECE9]">
      {/* Breadcrumb navigation */}
      <div className="flex items-center gap-2 text-xs text-[#7A7268] dark:text-[#8E9B97] font-mono-data">
        <span>Monographs</span>
        <span>&gt;</span>
        <span>Advisory Engine</span>
        <span>&gt;</span>
        <span className="text-[#BC412B] dark:text-[#E05A42] font-semibold">New Procurement Analysis</span>
      </div>

      {/* Header */}
      <div className="pb-4 border-b border-[#DDD8CE] dark:border-[#1F2E3E]">
        <span className="text-xs uppercase tracking-widest text-[#BC412B] dark:text-[#E05A42] font-bold">
          Voyage Configuration &amp; Parameterization
        </span>
        <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-[#1A1A1A] dark:text-[#E8ECE9] mt-0.5">
          New Procurement Analysis
        </h1>
        <p className="text-xs sm:text-sm text-[#6B645C] dark:text-[#A3B1AB] font-serif-body italic mt-1">
          Configure parcel specifications to generate deterministic chartering recommendations and route intelligence.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Column (7 Cols) */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6 bg-white dark:bg-[#101820] border border-[#DDD8CE] dark:border-[#1F2E3E] rounded-lg p-6 sm:p-8 shadow-sm">
            
            {/* 01 CARGO PARAMETERS */}
            <div>
              <div className="flex items-center gap-2 pb-2 mb-4 border-b border-[#DDD8CE] dark:border-[#1F2E3E]">
                <span className="text-xs font-bold text-[#BC412B] dark:text-[#E05A42] font-mono-data">§ 01</span>
                <span className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] dark:text-[#E8ECE9] font-editorial">
                  Cargo &amp; Parcel Parameters
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-[#7A7268] dark:text-[#8E9B97] font-medium mb-1 block">
                    Cargo Commodity
                  </label>
                  <select
                    value={formData.cargoType}
                    onChange={(e) => setFormData({ ...formData, cargoType: e.target.value })}
                    className="w-full bg-[#F4F0E8] dark:bg-[#16202C] border border-[#DDD8CE] dark:border-[#1F2E3E] rounded text-sm text-[#1A1A1A] dark:text-[#E8ECE9] p-2.5 focus:border-[#BC412B] dark:focus:border-[#E05A42] focus:bg-white dark:focus:bg-[#101820] focus:outline-none transition-colors"
                  >
                    <option value="Coal">Coal (General Bulk)</option>
                    <option value="Thermal Coal">Thermal Coal (6,000 NAR)</option>
                    <option value="Coking Coal">Coking Coal (Prime Hard)</option>
                    <option value="Bauxite">Bauxite Ore</option>
                    <option value="Iron Ore">Iron Ore (Fines/Lump)</option>
                    <option value="Grain">Grain (Wheat/Maize/Soybean)</option>
                    <option value="Rock Phosphate">Rock Phosphate / DAP Fertilizer</option>
                    <option value="Urea">Urea (Bulk/Bagged)</option>
                    <option value="Pulses">Pulses (Tur/Urad/Chana)</option>
                    <option value="Steel Scrap">Steel Scrap (Ferrous)</option>
                    <option value="Pet Coke">Pet Coke (Cement/Power Grade)</option>
                    <option value="Sulphur">Sulphur (Fertilizer Feedstock)</option>
                    <option value="Limestone">Limestone / Gypsum</option>
                    <option value="Wood Pulp">Wood Pulp / Timber Logs</option>
                    <option value="Muriate of Potash">Muriate of Potash (MOP)</option>
                    <option value="Copper Concentrate">Copper Concentrate</option>
                    <option value="Manganese Ore">Manganese Ore</option>
                    <option value="Soda Ash">Soda Ash</option>
                    <option value="Cement Clinker">Cement Clinker</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-[#7A7268] dark:text-[#8E9B97] font-medium mb-1 block">
                    Total Parcel Quantity (MT)
                  </label>
                  <input
                    type="number"
                    value={formData.quantityMT}
                    onChange={(e) => setFormData({ ...formData, quantityMT: Number(e.target.value) })}
                    className="w-full bg-[#F4F0E8] dark:bg-[#16202C] border border-[#DDD8CE] dark:border-[#1F2E3E] rounded text-sm text-[#1A1A1A] dark:text-[#E8ECE9] p-2.5 font-mono-data focus:border-[#BC412B] dark:focus:border-[#E05A42] focus:bg-white dark:focus:bg-[#101820] focus:outline-none transition-colors font-bold"
                    step={5000}
                    min={10000}
                  />
                </div>
              </div>
            </div>

            {/* 02 ORIGIN */}
            <div>
              <div className="flex items-center gap-2 pb-2 mb-4 border-b border-[#DDD8CE] dark:border-[#1F2E3E]">
                <span className="text-xs font-bold text-[#BC412B] dark:text-[#E05A42] font-mono-data">§ 02</span>
                <span className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] dark:text-[#E8ECE9] font-editorial">
                  Origin &amp; Load Terminal
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-[#7A7268] dark:text-[#8E9B97] font-medium mb-1 block">
                    Origin Region
                  </label>
                  <select
                    value={formData.originRegion}
                    onChange={(e) => setFormData({ ...formData, originRegion: e.target.value })}
                    className="w-full bg-[#F4F0E8] dark:bg-[#16202C] border border-[#DDD8CE] dark:border-[#1F2E3E] rounded text-sm text-[#1A1A1A] dark:text-[#E8ECE9] p-2.5 focus:border-[#BC412B] dark:focus:border-[#E05A42] focus:bg-white dark:focus:bg-[#101820] focus:outline-none transition-colors"
                  >
                    <option value="Australia">Australia (East Coast)</option>
                    <option value="Indonesia">Indonesia (Kalimantan)</option>
                    <option value="Mozambique">Mozambique</option>
                    <option value="South Africa">South Africa</option>
                    <option value="Morocco">Morocco</option>
                    <option value="Saudi Arabia">Saudi Arabia (Persian Gulf)</option>
                    <option value="Oman">Oman (Gulf of Oman)</option>
                    <option value="Jordan">Jordan (Red Sea)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-[#7A7268] dark:text-[#8E9B97] font-medium mb-1 block">
                    Loading Port / Berth
                  </label>
                  <select
                    value={formData.loadingPort}
                    onChange={(e) => setFormData({ ...formData, loadingPort: e.target.value })}
                    className="w-full bg-[#F4F0E8] dark:bg-[#16202C] border border-[#DDD8CE] dark:border-[#1F2E3E] rounded text-sm text-[#1A1A1A] dark:text-[#E8ECE9] p-2.5 focus:border-[#BC412B] dark:focus:border-[#E05A42] focus:bg-white dark:focus:bg-[#101820] focus:outline-none transition-colors"
                  >
                    <option value="Newcastle">Newcastle (NCIG / PWCS)</option>
                    <option value="Gladstone">Gladstone (RGT)</option>
                    <option value="Hay Point">Hay Point (DBCT)</option>
                    <option value="Taboneo">Taboneo Anchorage</option>
                    <option value="Richards Bay">Richards Bay (RBCT)</option>
                    <option value="Jorf Lasfar">Jorf Lasfar (OCP Phosphate)</option>
                    <option value="Ras Al Khair">Ras Al Khair (Maaden)</option>
                    <option value="Sohar">Sohar Port</option>
                    <option value="Aqaba">Aqaba (Arab Potash)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 03 DESTINATION */}
            <div>
              <div className="flex items-center gap-2 pb-2 mb-4 border-b border-[#DDD8CE] dark:border-[#1F2E3E]">
                <span className="text-xs font-bold text-[#BC412B] dark:text-[#E05A42] font-mono-data">§ 03</span>
                <span className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] dark:text-[#E8ECE9] font-editorial">
                  Discharge Destination
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-[#7A7268] dark:text-[#8E9B97] font-medium mb-1 block">
                    Destination Region
                  </label>
                  <select
                    value={formData.destinationRegion}
                    onChange={(e) => setFormData({ ...formData, destinationRegion: e.target.value })}
                    className="w-full bg-[#F4F0E8] dark:bg-[#16202C] border border-[#DDD8CE] dark:border-[#1F2E3E] rounded text-sm text-[#1A1A1A] dark:text-[#E8ECE9] p-2.5 focus:border-[#BC412B] dark:focus:border-[#E05A42] focus:bg-white dark:focus:bg-[#101820] focus:outline-none transition-colors"
                  >
                    <option value="India East Coast">India East Coast</option>
                    <option value="India West Coast">India West Coast</option>
                    <option value="South China">South China</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-[#7A7268] dark:text-[#8E9B97] font-medium mb-1 block">
                    Discharge Port / Terminal
                  </label>
                  <select
                    value={formData.dischargePort}
                    onChange={(e) => setFormData({ ...formData, dischargePort: e.target.value })}
                    className="w-full bg-[#F4F0E8] dark:bg-[#16202C] border border-[#DDD8CE] dark:border-[#1F2E3E] rounded text-sm text-[#1A1A1A] dark:text-[#E8ECE9] p-2.5 focus:border-[#BC412B] dark:focus:border-[#E05A42] focus:bg-white dark:focus:bg-[#101820] focus:outline-none transition-colors"
                  >
                    <option value="Paradip">Paradip Port (Coal Berths #1 &amp; #2)</option>
                    <option value="Visakhapatnam">Visakhapatnam (Outer Harbour)</option>
                    <option value="Gangavaram">Gangavaram Deepwater</option>
                    <option value="Haldia">Haldia (Draft Constrained)</option>
                    <option value="Gopalpur">Gopalpur</option>
                    <option value="Mundra">Mundra Port (West Coast)</option>
                    <option value="Kandla">Kandla / Deendayal Port (West Coast)</option>
                    <option value="Mormugao">Mormugao, Goa (West Coast)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 04 DELIVERY WINDOW */}
            <div>
              <div className="flex items-center gap-2 pb-2 mb-4 border-b border-[#DDD8CE] dark:border-[#1F2E3E]">
                <span className="text-xs font-bold text-[#BC412B] dark:text-[#E05A42] font-mono-data">§ 04</span>
                <span className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] dark:text-[#E8ECE9] font-editorial">
                  Laycan &amp; Delivery Window
                </span>
              </div>
              <div>
                <label className="text-xs text-[#7A7268] dark:text-[#8E9B97] font-medium mb-1 block">
                  Select Delivery Laycan
                </label>
                <select
                  value={formData.deliveryWindow}
                  onChange={(e) => setFormData({ ...formData, deliveryWindow: e.target.value })}
                  className="w-full bg-[#F4F0E8] dark:bg-[#16202C] border border-[#DDD8CE] dark:border-[#1F2E3E] rounded text-sm text-[#1A1A1A] dark:text-[#E8ECE9] p-2.5 focus:border-[#BC412B] dark:focus:border-[#E05A42] focus:bg-white dark:focus:bg-[#101820] focus:outline-none transition-colors"
                >
                  <option value="Q3 2024 (Jul - Sep)">Q3 2024 (Jul - Sep)</option>
                  <option value="Aug 2024">Aug 2024</option>
                  <option value="Sep 2024">Sep 2024</option>
                  <option value="Q4 2024 (Oct - Dec)">Q4 2024 (Oct - Dec)</option>
                  <option value="Q1 2025">Q1 2025</option>
                </select>
              </div>
            </div>

            {/* 05 CONTRACT PREFERENCE */}
            <div>
              <div className="flex items-center gap-2 pb-2 mb-4 border-b border-[#DDD8CE] dark:border-[#1F2E3E]">
                <span className="text-xs font-bold text-[#BC412B] dark:text-[#E05A42] font-mono-data">§ 05</span>
                <span className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] dark:text-[#E8ECE9] font-editorial">
                  Chartering Structure Preference
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {(['Spot', '1-3 Voyages', '3-6 Voyages', 'Flexible'] as const).map((pref) => {
                  const isSelected = formData.contractPreference === pref;
                  return (
                    <button
                      key={pref}
                      type="button"
                      onClick={() => setFormData({ ...formData, contractPreference: pref })}
                      className={`p-2.5 rounded text-xs font-semibold border transition-all text-center cursor-pointer font-mono-data ${
                        isSelected
                          ? 'bg-[#BC412B] text-white border-[#BC412B] shadow-2xs font-bold'
                          : 'bg-[#F4F0E8] dark:bg-[#16202C] border-[#DDD8CE] dark:border-[#1F2E3E] text-[#6B645C] dark:text-[#8E9B97] hover:text-[#1A1A1A] dark:hover:text-[#E8ECE9] hover:bg-[#EDE8DE] dark:hover:bg-[#1C2834]'
                      }`}
                    >
                      {pref}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-4 pt-4 border-t border-[#DDD8CE] dark:border-[#1F2E3E]">
              <button
                type="submit"
                disabled={isProcessing}
                className="flex-1 bg-[#BC412B] hover:bg-[#A33420] text-white font-editorial font-bold text-sm py-3 px-6 rounded transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-70"
              >
                {isProcessing ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Executing Route &amp; Freight Optimization...</span>
                  </>
                ) : (
                  <>
                    <span>Generate Recommendation</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="bg-transparent border border-[#DDD8CE] dark:border-[#1F2E3E] text-[#7A7268] dark:text-[#8E9B97] hover:text-[#1A1A1A] dark:hover:text-[#E8ECE9] text-sm font-medium py-3 px-6 rounded hover:bg-[#F4F0E8] dark:hover:bg-[#16202C] transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Right Info Column (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Route Preview Card */}
          <div className="bg-white dark:bg-[#101820] border border-[#DDD8CE] dark:border-[#1F2E3E] rounded-lg p-5 flex flex-col gap-4 shadow-sm">
            <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-[#7A7268] dark:text-[#8E9B97] font-editorial">
              <span>Hydrographic Route Preview</span>
              <span className="material-symbols-outlined text-[#BC412B] dark:text-[#E05A42] text-[18px]">navigation</span>
            </div>

            <RoutePreviewChart loadingPort={formData.loadingPort} dischargePort={formData.dischargePort} />
          </div>

          {/* Pre-Analysis Checks Card */}
          <div className="bg-white dark:bg-[#101820] border border-[#DDD8CE] dark:border-[#1F2E3E] rounded-lg p-5 flex flex-col gap-4 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#7A7268] dark:text-[#8E9B97] font-editorial">
              <span className="material-symbols-outlined text-[#BC412B] dark:text-[#E05A42] text-[18px]">verified</span>
              <span>Pre-Analysis System Validation</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-2.5 text-[#1A1A1A] dark:text-[#E8ECE9]">
                <span className="material-symbols-outlined text-[#2D5A43] dark:text-[#3EB58A] text-[18px]">check_circle</span>
                <span className="font-serif-body">Ocean corridor bathymetric data verified</span>
              </div>
              <div className="flex items-center gap-2.5 text-[#1A1A1A] dark:text-[#E8ECE9]">
                <span className="material-symbols-outlined text-[#2D5A43] dark:text-[#3EB58A] text-[18px]">check_circle</span>
                <span className="font-serif-body">Historical Baltic Panamax Index curves loaded</span>
              </div>
              <div className="flex items-center gap-2.5 text-[#1A1A1A] dark:text-[#E8ECE9]">
                <span className="material-symbols-outlined text-[#2D5A43] dark:text-[#3EB58A] text-[18px]">check_circle</span>
                <span className="font-serif-body">Terminal draft &amp; LOA constraints checked</span>
              </div>
              <div className="flex items-center gap-2.5 text-[#1A1A1A] dark:text-[#E8ECE9]">
                <span className="material-symbols-outlined text-[#2D5A43] dark:text-[#3EB58A] text-[18px]">check_circle</span>
                <span className="font-serif-body">Real-time port queue congestion feed active</span>
              </div>
            </div>

            <div className="bg-[#EDE8DE] dark:bg-[#16202C] p-3.5 rounded border border-[#DDD8CE] dark:border-[#1F2E3E] text-[11px] text-[#444444] dark:text-[#A3B1AB] font-serif-body italic leading-relaxed">
              Parameters are cross-validated against live Pacific and Indian Ocean fleet positioning and seasonal monsoon weather forecasts.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
