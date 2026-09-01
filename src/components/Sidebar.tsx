import React from 'react';
import { ViewMode } from '../types';
import { useTheme } from '../context/ThemeContext';

interface SidebarProps {
  currentView: ViewMode;
  onSelectView: (view: ViewMode) => void;
  onNewAnalysis: () => void;
  onOpenSavedAnalyses: () => void;
  onOpenSettings: () => void;
  onLogout: () => void;
  onExitToLanding: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  onNewAnalysis,
  onOpenSavedAnalyses,
  onOpenSettings,
  onLogout,
  onExitToLanding
}) => {
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { id: 'overview' as ViewMode, label: 'Overview', icon: 'dashboard' },
    { id: 'news' as ViewMode, label: 'Daily News Feed', icon: 'newspaper', badge: 'LIVE' },
    { id: 'new-analysis' as ViewMode, label: 'Analyse', icon: 'analytics' },
    { id: 'routes' as ViewMode, label: 'Routes', icon: 'map' },
    { id: 'freight-forecast' as ViewMode, label: 'Freight Forecast', icon: 'trending_up' },
    { id: 'vessels' as ViewMode, label: 'Vessels', icon: 'directions_boat' },
    { id: 'vessel-comparison' as ViewMode, label: 'Vessel Comparison', icon: 'splitscreen', badge: 'NEW' },
    { id: 'ports' as ViewMode, label: 'Ports', icon: 'anchor' },
    { id: 'port-comparison' as ViewMode, label: 'Port Comparison', icon: 'compare_arrows' },
    { id: 'commodity-index' as ViewMode, label: 'Commodity Index', icon: 'monitoring' }
  ];

  return (
    <aside className="bg-[#F2EEE5] dark:bg-[#0D141C] text-[#1A1A1A] dark:text-[#E8ECE9] h-screen w-64 fixed left-0 top-0 flex flex-col border-r border-[#DDD8CE] dark:border-[#1F2E3E] z-50 select-none transition-colors">
      <div className="flex flex-col h-full py-6">
        {/* Header Branding - Editorial Monograph Style */}
        <div 
          onClick={() => onSelectView('overview')}
          className="px-6 mb-6 flex items-center gap-3.5 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded bg-[#BC412B] text-white flex items-center justify-center flex-shrink-0 shadow-sm font-editorial font-bold text-xl group-hover:bg-[#A33621] transition-colors">
            M.
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-editorial text-xl font-bold tracking-tight text-[#1A1A1A] dark:text-[#E8ECE9]">
                MARLIN
              </h1>
              <span className="text-[9px] uppercase tracking-widest px-1 py-0.2 bg-[#E2DDD3] dark:bg-[#1C2834] text-[#6B645C] dark:text-[#A3B1AB] font-mono-data rounded font-semibold">
                ED. IV
              </span>
            </div>
            <p className="text-[10px] text-[#6B645C] dark:text-[#8E9B97] font-serif-body italic tracking-wide">
              Maritime Intelligence Journal
            </p>
          </div>
        </div>

        {/* Primary Action Button */}
        <div className="px-4 mb-5">
          <button
            onClick={onNewAnalysis}
            className="w-full bg-[#BC412B] text-white font-medium text-xs tracking-wider uppercase py-2.5 px-4 rounded hover:bg-[#A33621] transition-all flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>+ New Analysis</span>
          </button>
        </div>

        {/* Main Navigation Tabs */}
        <nav className="flex-1 flex flex-col gap-1 overflow-y-auto px-2">
          {navItems.map((item) => {
            const isActive = 
              currentView === item.id || 
              (item.id === 'new-analysis' && currentView === 'recommendation');

            return (
              <button
                key={item.id}
                onClick={() => onSelectView(item.id)}
                className={`flex items-center justify-between px-4 py-2.5 rounded transition-all text-xs uppercase tracking-wider text-left w-full cursor-pointer ${
                  isActive
                    ? 'text-[#BC412B] dark:text-[#E05A42] font-bold bg-[#FFFFFF] dark:bg-[#16202C] border-r-2 border-[#BC412B] dark:border-[#E05A42] shadow-sm'
                    : 'text-[#555555] dark:text-[#A3B1AB] hover:text-[#1A1A1A] dark:hover:text-[#E8ECE9] hover:bg-[#E8E2D6] dark:hover:bg-[#16202C]/60 font-medium'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span 
                    className={`material-symbols-outlined text-[18px] ${isActive ? 'text-[#BC412B] dark:text-[#E05A42]' : 'text-[#7A7268] dark:text-[#8E9B97]'}`}
                    style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[9px] font-mono-data font-bold px-1.5 py-0.2 rounded bg-[#BC412B]/15 text-[#BC412B] dark:bg-[#BC412B]/30 dark:text-[#E05A42] animate-pulse">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer Tabs & Theme Switcher */}
        <div className="mt-auto border-t border-[#DDD8CE] dark:border-[#1F2E3E] pt-4 px-2 flex flex-col gap-1">
          <button
            onClick={toggleTheme}
            className="text-[#6B645C] dark:text-[#A3B1AB] hover:text-[#1A1A1A] dark:hover:text-[#E8ECE9] hover:bg-[#E8E2D6] dark:hover:bg-[#16202C] flex items-center justify-between px-4 py-2 rounded transition-colors text-xs font-medium text-left w-full cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[16px] text-[#7A7268] dark:text-[#8E9B97]">
                {theme === 'dark' ? 'dark_mode' : 'light_mode'}
              </span>
              <span>{theme === 'dark' ? 'Dark Theme' : 'Light Paper'}</span>
            </div>
            <span className="text-[10px] font-mono-data text-[#7A7268] uppercase">
              {theme}
            </span>
          </button>
          <button
            onClick={onOpenSavedAnalyses}
            className="text-[#6B645C] dark:text-[#A3B1AB] hover:text-[#1A1A1A] dark:hover:text-[#E8ECE9] hover:bg-[#E8E2D6] dark:hover:bg-[#16202C] flex items-center gap-3 px-4 py-2 rounded transition-colors text-xs font-medium text-left w-full cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] text-[#7A7268] dark:text-[#8E9B97]">bookmark</span>
            <span>Saved Analyses</span>
          </button>
          <button
            onClick={onOpenSettings}
            className="text-[#6B645C] dark:text-[#A3B1AB] hover:text-[#1A1A1A] dark:hover:text-[#E8ECE9] hover:bg-[#E8E2D6] dark:hover:bg-[#16202C] flex items-center gap-3 px-4 py-2 rounded transition-colors text-xs font-medium text-left w-full cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] text-[#7A7268] dark:text-[#8E9B97]">settings</span>
            <span>Settings &amp; Units</span>
          </button>
          <button
            onClick={onExitToLanding}
            className="text-[#6B645C] dark:text-[#A3B1AB] hover:text-[#1A1A1A] dark:hover:text-[#E8ECE9] hover:bg-[#E8E2D6] dark:hover:bg-[#16202C] flex items-center gap-3 px-4 py-2 rounded transition-colors text-xs font-medium text-left w-full cursor-pointer"
            title="Return to the landing page"
          >
            <span className="material-symbols-outlined text-[16px] text-[#7A7268] dark:text-[#8E9B97]">public</span>
            <span>Exit to Landing</span>
          </button>
          <button
            onClick={onLogout}
            className="text-[#6B645C] dark:text-[#A3B1AB] hover:text-[#BC412B] hover:bg-[#BC412B]/10 flex items-center gap-3 px-4 py-2 rounded transition-colors text-xs font-medium text-left w-full cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] text-[#7A7268] dark:text-[#8E9B97]">logout</span>
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

