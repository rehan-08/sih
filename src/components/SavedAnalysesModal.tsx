import React from 'react';
import { SavedAnalysis } from '../types';

interface SavedAnalysesModalProps {
  isOpen: boolean;
  onClose: () => void;
  analyses: SavedAnalysis[];
  onSelectAnalysis: (analysis: SavedAnalysis) => void;
}

export const SavedAnalysesModal: React.FC<SavedAnalysesModalProps> = ({
  isOpen,
  onClose,
  analyses,
  onSelectAnalysis
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1A1A]/60 backdrop-blur-xs">
      <div className="bg-white border border-[#DDD8CE] rounded-lg max-w-2xl w-full p-6 shadow-xl flex flex-col gap-5 max-h-[85vh] overflow-hidden">
        <div className="flex justify-between items-center pb-3 border-b border-[#DDD8CE]">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[#BC412B] text-[22px]">bookmark</span>
            <h2 className="font-editorial text-lg font-bold text-[#1A1A1A]">
              Archived Chartering Analyses
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#7A7268] hover:text-[#1A1A1A] text-lg font-bold p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {analyses.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                onSelectAnalysis(item);
                onClose();
              }}
              className="bg-[#F9F7F2] border border-[#DDD8CE] hover:border-[#BC412B] p-4 rounded-lg cursor-pointer transition-all flex flex-col gap-2 group shadow-2xs"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-editorial font-bold text-base text-[#1A1A1A] group-hover:text-[#BC412B] transition-colors">
                    {item.route}
                  </span>
                  <span className="text-xs text-[#7A7268] font-serif-body block mt-0.5">
                    {item.cargo}
                  </span>
                </div>
                <span className={`px-2.5 py-0.5 rounded text-xs font-mono-data font-bold ${
                  item.recommendation === 'BOOK' 
                    ? 'bg-[#2D5A43]/15 text-[#2D5A43] border border-[#2D5A43]/30' 
                    : 'bg-[#BC412B]/15 text-[#BC412B] border border-[#BC412B]/30'
                }`}>
                  {item.recommendation}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs text-[#6B645C] pt-2 border-t border-[#DDD8CE]/60">
                <span className="font-serif-body">{item.contractStrategy} ({item.vessel})</span>
                <span className="text-[#7A7268] font-mono-data text-[11px]">{item.timestamp}</span>
              </div>

              <div className="text-[11px] text-[#2D5A43] font-mono-data font-semibold">
                {item.savingsEstimate}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-3 border-t border-[#DDD8CE]">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#F4F0E8] hover:bg-[#EDE8DE] text-xs font-semibold text-[#1A1A1A] rounded transition-colors border border-[#DDD8CE] cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
