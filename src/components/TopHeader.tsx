import React from 'react';
import { ViewMode, AnalysisInput } from '../types';
import { useTheme } from '../context/ThemeContext';
import { usePortAlerts } from '../context/PortAlertContext';

interface TopHeaderProps {
  currentView: ViewMode;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onExport: () => void;
  onNewAnalysis: () => void;
  analysisInput: AnalysisInput;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  currentView,
  searchQuery,
  onSearchChange,
  onExport,
  onNewAnalysis,
  analysisInput
}) => {
  const { theme, toggleTheme } = useTheme();
  const { unreadCount, openAlertCenter, notifications } = usePortAlerts();

  const getHeaderTitle = () => {
    switch (currentView) {
      case 'overview':
        return {
          main: 'Marlin Decision Support',
          sub: 'India East Coast Procurement'
        };
      case 'news':
        return {
          main: 'Maritime Dispatches',
          sub: 'Daily Ports, Fleet, Commodities & Freight Intelligence Feed'
        };
      case 'new-analysis':
        return {
          main: 'Marlin Decision Support',
          sub: 'New Procurement Analysis'
        };
      case 'recommendation':
        return {
          main: 'Chartering Recommendation',
          sub: `${analysisInput.loadingPort.toUpperCase()} → ${analysisInput.dischargePort.toUpperCase()} | ${analysisInput.cargoType.toUpperCase()} | ${analysisInput.quantityMT.toLocaleString()} MT`
        };
      case 'routes':
        return {
          main: 'Route Intelligence',
          sub: `${analysisInput.loadingPort.toUpperCase()} → ${analysisInput.dischargePort.toUpperCase()}`
        };
      case 'freight-forecast':
        return {
          main: 'Freight Forecast',
          sub: `Route: ${analysisInput.loadingPort} → ${analysisInput.dischargePort} | Vessel: Panamax`
        };
      case 'vessels':
        return {
          main: 'Vessel Optimization',
          sub: 'Port Draft & LOA Suitability Matrix'
        };
      case 'vessel-comparison':
        return {
          main: 'Vessel Comparison Monograph',
          sub: 'Side-by-Side Efficiency, Fuel Burn & Capacity Benchmark'
        };
      case 'commodity-index':
        return {
          main: 'Commodity Intelligence',
          sub: 'Newcastle Thermal Index'
        };
      case 'ports':
        return {
          main: 'Port Logistics Directory',
          sub: 'East Coast India & Pacific Load Terminals'
        };
      default:
        return {
          main: 'MARLIN Intelligence',
          sub: 'Decision Support'
        };
    }
  };

  const headerInfo = getHeaderTitle();

  return (
    <header className="bg-[#F9F7F2] dark:bg-[#0D141C] text-[#1A1A1A] dark:text-[#E8ECE9] sticky top-0 z-40 border-b border-[#DDD8CE] dark:border-[#1F2E3E] flex justify-between items-center w-full px-6 py-3.5 h-[68px] transition-colors">
      <div className="flex items-center gap-3">
        <h2 className="font-editorial text-lg sm:text-xl font-bold tracking-tight text-[#1A1A1A] dark:text-[#E8ECE9]">
          {headerInfo.main}
        </h2>
        <div className="h-4 w-px bg-[#DDD8CE] dark:bg-[#1F2E3E] hidden sm:block" />
        <span className="text-xs sm:text-sm font-serif-body italic text-[#BC412B] dark:text-[#E05A42] font-medium truncate max-w-xs md:max-w-md hidden sm:inline">
          {headerInfo.sub}
        </span>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Search input - Editorial Style */}
        <div className="relative bg-[#EDE8DE] dark:bg-[#16202C] border border-[#DDD8CE] dark:border-[#1F2E3E] rounded overflow-hidden flex items-center h-9 px-3 w-36 sm:w-60 focus-within:border-[#BC412B] transition-colors">
          <span className="material-symbols-outlined text-[#7A7268] dark:text-[#8E9B97] text-[18px] mr-2">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search routes, ports, cargo..."
            className="bg-transparent border-none text-[#1A1A1A] dark:text-[#E8ECE9] text-xs w-full focus:ring-0 focus:outline-none p-0 placeholder-[#7A7268] dark:placeholder-[#8E9B97]"
          />
          {searchQuery && (
            <button 
              onClick={() => onSearchChange('')}
              className="text-[#7A7268] hover:text-[#1A1A1A] dark:hover:text-[#E8ECE9] text-xs cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light Paper' : 'Dark Obsidian'} theme`}
          className="bg-white dark:bg-[#101820] border border-[#DDD8CE] dark:border-[#1F2E3E] hover:border-[#BC412B] dark:hover:border-[#E05A42] text-[#1A1A1A] dark:text-[#E8ECE9] h-9 w-9 rounded flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
        >
          <span className="material-symbols-outlined text-[18px] text-[#BC412B] dark:text-[#E05A42]">
            {theme === 'dark' ? 'light_mode' : 'dark_mode'}
          </span>
        </button>

        {/* Port Alerts Bell Notification Center Button */}
        <button
          onClick={openAlertCenter}
          title="Open Port Alert Center"
          className="relative bg-white dark:bg-[#101820] border border-[#DDD8CE] dark:border-[#1F2E3E] hover:border-[#BC412B] dark:hover:border-[#E05A42] text-[#1A1A1A] dark:text-[#E8ECE9] hover:text-[#BC412B] dark:hover:text-[#E05A42] h-9 px-2.5 rounded flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
        >
          <span className="material-symbols-outlined text-[18px] text-[#BC412B] dark:text-[#E05A42]">
            {unreadCount > 0 ? 'notifications_active' : 'notifications'}
          </span>
          <span className="text-xs font-mono-data font-bold hidden lg:inline">Port Alerts</span>
          {unreadCount > 0 && (
            <span className="relative flex h-5 min-w-5 px-1 items-center justify-center rounded-full bg-[#BC412B] text-white text-[10px] font-mono-data font-extrabold shadow-xs">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#BC412B] opacity-75" />
              <span className="relative">{unreadCount}</span>
            </span>
          )}
        </button>

        {/* Export Data Button */}
        <button
          onClick={onExport}
          className="bg-white dark:bg-[#101820] border border-[#DDD8CE] dark:border-[#1F2E3E] hover:border-[#BC412B] dark:hover:border-[#E05A42] text-[#1A1A1A] dark:text-[#E8ECE9] hover:text-[#BC412B] dark:hover:text-[#E05A42] text-xs uppercase tracking-wider font-semibold py-2 px-3.5 rounded transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs h-9"
        >
          <span className="material-symbols-outlined text-[16px]">download</span>
          <span className="hidden md:inline">Export Memo</span>
        </button>

        {/* Quick New Analysis Button */}
        <button
          onClick={onNewAnalysis}
          className="bg-[#BC412B] hover:bg-[#A33621] text-white text-xs uppercase tracking-wider font-semibold py-2 px-3.5 rounded transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm h-9"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          <span className="hidden sm:inline">New Analysis</span>
        </button>
      </div>
    </header>
  );
};

