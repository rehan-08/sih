import React, { useState } from 'react';
import { AnalysisInput } from '../types';
import { Recommendation } from '../utils/recommendationEngine';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysisInput: AnalysisInput;
  recommendation: Recommendation;
  distanceNM: number;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  analysisInput,
  recommendation,
  distanceNM
}) => {
  const [format, setFormat] = useState<'pdf' | 'csv' | 'json'>('pdf');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const reportId = `MARLIN-INTEL-${new Date().getFullYear()}-${String(Math.abs(recommendation.projectedSavingsUSD) % 1000).padStart(3, '0')}`;
  const routeLabel = `${analysisInput.loadingPort} → ${analysisInput.dischargePort}`;

  const buildJson = () => ({
    report: 'MARLIN Maritime Chartering Intelligence Memo',
    reportId,
    route: `${routeLabel} (${distanceNM.toLocaleString()} NM)`,
    cargo: `${analysisInput.cargoType} ${analysisInput.quantityMT.toLocaleString()} MT`,
    contractPreference: analysisInput.contractPreference,
    deliveryWindow: analysisInput.deliveryWindow,
    recommendation: recommendation.action === 'WAIT' ? 'WAIT / HOLD FIXTURE' : 'EXECUTE / FIX NOW',
    confidencePct: recommendation.confidencePct,
    contractStrategy: recommendation.recommendedStructureLabel,
    recommendedVessel: recommendation.recommendedVessel.name,
    benchmarkSpotRate: `$${recommendation.baselineRateUSD.toFixed(2)}/MT`,
    targetPeriodRate: `$${recommendation.targetRateLowUSD.toFixed(2)}-$${recommendation.targetRateHighUSD.toFixed(2)}/MT`,
    projectedSavingsUSD: `$${recommendation.projectedSavingsUSD.toLocaleString()}`,
    optimalWindow: recommendation.optimalWindowLabel,
    timestamp: new Date().toISOString()
  });

  const buildCsv = () => {
    const data = buildJson();
    const rows = Object.entries(data);
    return ['Field,Value', ...rows.map(([k, v]) => `"${k}","${String(v).replace(/"/g, '""')}"`)].join('\n');
  };

  const buildSummaryText = () => `MARLIN MARITIME INTELLIGENCE MEMO
Report: ${reportId}
Route: ${routeLabel} (${distanceNM.toLocaleString()} NM)
Cargo: ${analysisInput.cargoType} (${analysisInput.quantityMT.toLocaleString()} MT)
Action: ${recommendation.action === 'WAIT' ? 'WAIT / HOLD FIXTURE' : 'EXECUTE / FIX NOW'}
Recommended Vessel: ${recommendation.recommendedVessel.name}
Structure: ${recommendation.recommendedStructureLabel}
Spot Baseline: $${recommendation.baselineRateUSD.toFixed(2)}/MT | Target: $${recommendation.targetRateLowUSD.toFixed(2)}-$${recommendation.targetRateHighUSD.toFixed(2)}/MT
Projected Savings: $${recommendation.projectedSavingsUSD.toLocaleString()}
Optimal Window: ${recommendation.optimalWindowLabel}`;

  const buildPrintableHtml = () => `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>${reportId} — MARLIN Chartering Memo</title>
<style>
  body { font-family: 'Georgia', serif; color: #1A1A1A; max-width: 720px; margin: 48px auto; padding: 0 24px; }
  h1 { font-size: 26px; margin-bottom: 2px; }
  .kicker { font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: #BC412B; font-weight: bold; }
  .sub { color: #6B645C; font-style: italic; margin-top: 4px; font-size: 13px; }
  .divider { border: none; border-top: 1px solid #DDD8CE; margin: 20px 0; }
  .action { display: inline-block; padding: 8px 20px; background: ${recommendation.action === 'WAIT' ? '#BC412B' : '#2D5A43'}; color: white; font-weight: bold; font-size: 20px; letter-spacing: 0.05em; border-radius: 4px; }
  table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 13px; }
  td { padding: 8px 0; border-bottom: 1px solid #EDE8DE; }
  td.label { color: #6B645C; width: 55%; }
  td.value { font-weight: bold; text-align: right; font-family: monospace; }
  .footer { margin-top: 32px; font-size: 11px; color: #7A7268; }
  @media print { body { margin: 0; padding: 24px; } }
</style>
</head>
<body>
  <span class="kicker">Executive Decision Memorandum · ${reportId}</span>
  <h1>MARLIN Chartering Recommendation</h1>
  <div class="sub">Corridor: ${routeLabel} (${distanceNM.toLocaleString()} NM) · ${analysisInput.cargoType} · ${analysisInput.quantityMT.toLocaleString()} MT</div>
  <hr class="divider" />
  <span class="action">${recommendation.action}</span>
  <p>${recommendation.rationale}</p>
  <table>
    <tr><td class="label">Model Confidence</td><td class="value">${recommendation.confidencePct}%</td></tr>
    <tr><td class="label">Recommended Structure</td><td class="value">${recommendation.recommendedStructureLabel}</td></tr>
    <tr><td class="label">Recommended Vessel</td><td class="value">${recommendation.recommendedVessel.name}</td></tr>
    <tr><td class="label">Target Freight Rate</td><td class="value">$${recommendation.targetRateLowUSD.toFixed(2)} – $${recommendation.targetRateHighUSD.toFixed(2)} / MT</td></tr>
    <tr><td class="label">Projected Net Savings</td><td class="value">$${recommendation.projectedSavingsUSD.toLocaleString()}</td></tr>
    <tr><td class="label">Optimal Fixture Window</td><td class="value">${recommendation.optimalWindowLabel}</td></tr>
    <tr><td class="label">Contract Preference</td><td class="value">${analysisInput.contractPreference}</td></tr>
    <tr><td class="label">Delivery Laycan</td><td class="value">${analysisInput.deliveryWindow}</td></tr>
  </table>
  <div class="footer">Generated ${new Date().toLocaleString()} · MARLIN Maritime Intelligence · For internal chartering use only</div>
  <script>window.onload = () => window.print();</script>
</body>
</html>`;

  const handleDownload = () => {
    if (format === 'pdf') {
      const win = window.open('', '_blank');
      if (win) {
        win.document.write(buildPrintableHtml());
        win.document.close();
      }
      onClose();
      return;
    }

    const content = format === 'csv' ? buildCsv() : JSON.stringify(buildJson(), null, 2);
    const mime = format === 'csv' ? 'text/csv' : 'application/json';
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);

    const downloadAnchor = document.createElement('a');
    downloadAnchor.href = url;
    downloadAnchor.download = `marlin_chartering_report_${Date.now()}.${format}`;
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    URL.revokeObjectURL(url);

    onClose();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(buildSummaryText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1A1A]/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-[#101820] border border-[#DDD8CE] dark:border-[#1F2E3E] rounded-lg max-w-lg w-full p-6 shadow-xl flex flex-col gap-5">
        <div className="flex justify-between items-center pb-3 border-b border-[#DDD8CE] dark:border-[#1F2E3E]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#BC412B] dark:text-[#E05A42] text-[22px]">download</span>
            <h2 className="font-editorial text-lg font-bold text-[#1A1A1A] dark:text-[#E8ECE9]">
              Export Intelligence Monograph
            </h2>
          </div>
          <button onClick={onClose} className="text-[#7A7268] dark:text-[#8E9B97] hover:text-[#1A1A1A] dark:hover:text-[#E8ECE9] text-base cursor-pointer">✕</button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-[11px] uppercase font-bold text-[#7A7268] dark:text-[#8E9B97] block mb-2 tracking-wider">Export Format</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'pdf', label: 'Executive PDF', icon: 'picture_as_pdf' },
                { id: 'csv', label: 'Raw CSV', icon: 'table_view' },
                { id: 'json', label: 'Terminal JSON', icon: 'code' }
              ].map((fmt) => (
                <button
                  key={fmt.id}
                  onClick={() => setFormat(fmt.id as 'pdf' | 'csv' | 'json')}
                  className={`p-3 rounded border text-xs font-semibold flex flex-col items-center gap-1.5 transition-colors cursor-pointer ${
                    format === fmt.id
                      ? 'bg-[#BC412B] border-[#BC412B] text-white shadow-2xs font-bold'
                      : 'bg-[#F4F0E8] dark:bg-[#16202C] border-[#DDD8CE] dark:border-[#1F2E3E] text-[#6B645C] dark:text-[#8E9B97] hover:bg-[#EDE8DE] dark:hover:bg-[#1C2834]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">{fmt.icon}</span>
                  <span className="font-serif-body">{fmt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Preview snippet */}
          <div className="bg-[#F4F0E8] dark:bg-[#16202C] p-3.5 rounded border border-[#DDD8CE] dark:border-[#1F2E3E] font-mono-data text-xs text-[#444444] dark:text-[#A3B1AB] leading-relaxed">
            <div><span className="text-[#7A7268] dark:text-[#8E9B97] font-bold">REPORT:</span> {reportId}</div>
            <div><span className="text-[#7A7268] dark:text-[#8E9B97] font-bold">ROUTE:</span> {routeLabel} ({distanceNM.toLocaleString()} NM)</div>
            <div><span className="text-[#7A7268] dark:text-[#8E9B97] font-bold">RECOMMENDATION:</span> {recommendation.action} (Projected Gain: ${recommendation.projectedSavingsUSD.toLocaleString()})</div>
            <div><span className="text-[#7A7268] dark:text-[#8E9B97] font-bold">STRUCTURE:</span> {recommendation.recommendedStructureLabel} — {recommendation.recommendedVessel.name}</div>
          </div>
        </div>

        <div className="flex justify-between items-center pt-3 border-t border-[#DDD8CE] dark:border-[#1F2E3E]">
          <button
            onClick={handleCopy}
            className="text-xs text-[#BC412B] dark:text-[#E05A42] hover:underline flex items-center gap-1 font-serif-body font-bold cursor-pointer"
          >
            <span className="material-symbols-outlined text-[14px]">content_copy</span>
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Summary Text'}</span>
          </button>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 bg-transparent border border-[#DDD8CE] dark:border-[#1F2E3E] text-xs text-[#7A7268] dark:text-[#8E9B97] hover:text-[#1A1A1A] dark:hover:text-[#E8ECE9] rounded hover:bg-[#F4F0E8] dark:hover:bg-[#16202C] cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-[#BC412B] hover:bg-[#A33420] text-white font-editorial font-bold text-xs rounded transition-colors shadow-2xs cursor-pointer"
            >
              {format === 'pdf' ? 'Open Printable Memo' : 'Download Dossier'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
