import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { theme, setTheme } = useTheme();
  const [distanceUnit, setDistanceUnit] = useState('Nautical Miles (NM)');
  const [weightUnit, setWeightUnit] = useState('Metric Tons (MT)');
  const [currency, setCurrency] = useState('USD ($)');
  const [bunkerIndex, setBunkerIndex] = useState('Singapore VLSFO 0.5%');
  const [alertThreshold, setAlertThreshold] = useState('3.0% Rate Volatility');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1A1A]/60 dark:bg-black/80 backdrop-blur-xs">
      <div className="bg-white dark:bg-[#101820] border border-[#DDD8CE] dark:border-[#1F2E3E] rounded-lg max-w-lg w-full p-6 shadow-xl flex flex-col gap-5">
        <div className="flex justify-between items-center pb-3 border-b border-[#DDD8CE] dark:border-[#1F2E3E]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#BC412B] dark:text-[#E05A42] text-[22px]">settings</span>
            <h2 className="font-editorial text-lg font-bold text-[#1A1A1A] dark:text-[#E8ECE9]">
              System &amp; Maritime Parameters
            </h2>
          </div>
          <button onClick={onClose} className="text-[#7A7268] dark:text-[#8E9B97] hover:text-[#1A1A1A] dark:hover:text-[#E8ECE9] text-base cursor-pointer">✕</button>
        </div>

        <div className="space-y-3.5 text-xs">
          {/* Appearance & Color Scheme */}
          <div>
            <label className="text-[#7A7268] dark:text-[#8E9B97] font-bold uppercase tracking-wider text-[11px] block mb-1">
              Visual Theme &amp; Monograph Layout
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`flex items-center justify-center gap-2 p-2.5 rounded border text-xs font-semibold cursor-pointer transition-colors ${
                  theme === 'light'
                    ? 'border-[#BC412B] bg-[#BC412B]/10 text-[#BC412B] font-bold'
                    : 'border-[#DDD8CE] dark:border-[#1F2E3E] bg-[#F4F0E8] dark:bg-[#16202C] text-[#6B645C] dark:text-[#A3B1AB]'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">light_mode</span>
                <span>Editorial Light Paper</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`flex items-center justify-center gap-2 p-2.5 rounded border text-xs font-semibold cursor-pointer transition-colors ${
                  theme === 'dark'
                    ? 'border-[#BC412B] dark:border-[#E05A42] bg-[#BC412B]/15 text-[#BC412B] dark:text-[#E05A42] font-bold'
                    : 'border-[#DDD8CE] dark:border-[#1F2E3E] bg-[#F4F0E8] dark:bg-[#16202C] text-[#6B645C] dark:text-[#A3B1AB]'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">dark_mode</span>
                <span>Dark Obsidian Mode</span>
              </button>
            </div>
          </div>

          <div>
            <label className="text-[#7A7268] dark:text-[#8E9B97] font-bold uppercase tracking-wider text-[11px] block mb-1">
              Distance &amp; Navigation Unit
            </label>
            <select
              value={distanceUnit}
              onChange={(e) => setDistanceUnit(e.target.value)}
              className="w-full bg-[#F4F0E8] dark:bg-[#16202C] border border-[#DDD8CE] dark:border-[#1F2E3E] rounded p-2.5 text-[#1A1A1A] dark:text-[#E8ECE9] focus:border-[#BC412B] outline-none"
            >
              <option value="Nautical Miles (NM)">Nautical Miles (NM)</option>
              <option value="Kilometers (km)">Kilometers (km)</option>
            </select>
          </div>

          <div>
            <label className="text-[#7A7268] dark:text-[#8E9B97] font-bold uppercase tracking-wider text-[11px] block mb-1">
              Cargo &amp; Tonnage Measurement
            </label>
            <select
              value={weightUnit}
              onChange={(e) => setWeightUnit(e.target.value)}
              className="w-full bg-[#F4F0E8] dark:bg-[#16202C] border border-[#DDD8CE] dark:border-[#1F2E3E] rounded p-2.5 text-[#1A1A1A] dark:text-[#E8ECE9] focus:border-[#BC412B] outline-none"
            >
              <option value="Metric Tons (MT)">Metric Tons (MT)</option>
              <option value="Long Tons (LT)">Long Tons (LT)</option>
            </select>
          </div>

          <div>
            <label className="text-[#7A7268] dark:text-[#8E9B97] font-bold uppercase tracking-wider text-[11px] block mb-1">
              Base Settlement Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full bg-[#F4F0E8] dark:bg-[#16202C] border border-[#DDD8CE] dark:border-[#1F2E3E] rounded p-2.5 text-[#1A1A1A] dark:text-[#E8ECE9] focus:border-[#BC412B] outline-none"
            >
              <option value="USD ($)">USD ($) - United States Dollar</option>
              <option value="AUD ($)">AUD ($) - Australian Dollar</option>
              <option value="EUR (€)">EUR (€) - Euro</option>
              <option value="INR (₹)">INR (₹) - Indian Rupee</option>
            </select>
          </div>

          <div>
            <label className="text-[#7A7268] dark:text-[#8E9B97] font-bold uppercase tracking-wider text-[11px] block mb-1">
              Bunker Benchmark Reference Port
            </label>
            <select
              value={bunkerIndex}
              onChange={(e) => setBunkerIndex(e.target.value)}
              className="w-full bg-[#F4F0E8] dark:bg-[#16202C] border border-[#DDD8CE] dark:border-[#1F2E3E] rounded p-2.5 text-[#1A1A1A] dark:text-[#E8ECE9] focus:border-[#BC412B] outline-none"
            >
              <option value="Singapore VLSFO 0.5%">Singapore VLSFO 0.5% ($618/MT)</option>
              <option value="Fujairah VLSFO 0.5%">Fujairah VLSFO 0.5% ($605/MT)</option>
              <option value="Rotterdam VLSFO 0.5%">Rotterdam VLSFO 0.5% ($572/MT)</option>
            </select>
          </div>

          <div>
            <label className="text-[#7A7268] dark:text-[#8E9B97] font-bold uppercase tracking-wider text-[11px] block mb-1">
              Market Volatility Alert Threshold
            </label>
            <select
              value={alertThreshold}
              onChange={(e) => setAlertThreshold(e.target.value)}
              className="w-full bg-[#F4F0E8] dark:bg-[#16202C] border border-[#DDD8CE] dark:border-[#1F2E3E] rounded p-2.5 text-[#1A1A1A] dark:text-[#E8ECE9] focus:border-[#BC412B] outline-none"
            >
              <option value="2.0% Rate Volatility">2.0% Rate Volatility</option>
              <option value="3.0% Rate Volatility">3.0% Rate Volatility (Default)</option>
              <option value="5.0% Rate Volatility">5.0% Rate Volatility</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-[#DDD8CE] dark:border-[#1F2E3E]">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#BC412B] hover:bg-[#A33420] text-white font-editorial font-bold text-xs rounded transition-colors shadow-2xs cursor-pointer"
          >
            Save Parameters
          </button>
        </div>
      </div>
    </div>
  );
};

