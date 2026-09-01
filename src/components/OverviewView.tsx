import React from 'react';
import { ProcurementItem, ViewMode, AnalysisInput } from '../types';
import { morningBriefingData } from '../data/newsData';
import { useNews } from '../context/NewsContext';
import { CorridorPreviewMap } from './CorridorPreviewMap';
import { CorridorStatsPanel } from './CorridorStatsPanel';
import { Recommendation } from '../utils/recommendationEngine';
import { STEAMING_SPEED_KTS } from '../utils/routeCalc';
import { portIntelligenceData } from '../data/maritimeData';

interface OverviewViewProps {
  procurementItems: ProcurementItem[];
  searchQuery: string;
  onSelectRoute: (routeId: string) => void;
  onNewAnalysis: () => void;
  onNavigate: (view: ViewMode) => void;
  analysisInput: AnalysisInput;
  recommendation: Recommendation;
  distanceNM: number;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  procurementItems,
  searchQuery,
  onSelectRoute,
  onNewAnalysis,
  onNavigate,
  analysisInput,
  recommendation,
  distanceNM
}) => {
  const steamingDays = Number((distanceNM / (STEAMING_SPEED_KTS * 24)).toFixed(1));
  const destPort = portIntelligenceData.find(p => p.name === analysisInput.dischargePort);
  const routeStatus = destPort?.status ?? 'NORMAL';
  const filteredItems = procurementItems.filter((item) =>
    item.route.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.vessel.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.cargo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const { articles } = useNews();
  const topNews = articles.slice(0, 3);

  return (
    <div className="p-6 sm:p-8 flex flex-col gap-8 max-w-7xl mx-auto w-full">
      {/* Top Banner & Title Area - Editorial Style */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-6 border-b border-[#DDD8CE] dark:border-[#1F2E3E]">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-serif-body italic text-sm text-[#BC412B] dark:text-[#E05A42]">Issue 884 · Market Intelligence Monograph</span>
            <span className="text-[#DDD8CE] dark:text-[#1F2E3E]">•</span>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#EDE8DE] dark:bg-[#16202C] border border-[#DDD8CE] dark:border-[#1F2E3E] text-[11px] text-[#6B645C] dark:text-[#A3B1AB] font-mono-data">
              <span className="w-1.5 h-1.5 rounded-full bg-[#BC412B] dark:bg-[#E05A42] animate-pulse" />
              <span>Live Pacific Indices (12m ago)</span>
            </div>
          </div>
          <h1 className="font-editorial text-3xl sm:text-4xl font-bold tracking-tight text-[#1A1A1A] dark:text-[#E8ECE9]">
            India East Coast Procurement
          </h1>
          <p className="font-serif-body text-base text-[#555555] dark:text-[#A3B1AB] mt-1 max-w-2xl">
            A comprehensive study of Pacific Panamax tonnage balance, forward freight derivatives, and strategic chartering windows.
          </p>
        </div>

        <button
          onClick={onNewAnalysis}
          className="bg-[#BC412B] hover:bg-[#A33621] text-white text-xs uppercase tracking-wider font-semibold py-2.5 px-5 rounded flex items-center gap-2 shadow-sm transition-all cursor-pointer flex-shrink-0"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          <span>+ New Analysis</span>
        </button>
      </div>

      {/* Main Grid: Route Map & Current Recommendation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Route Map Card (8 Cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-[#101820] border border-[#DDD8CE] dark:border-[#1F2E3E] rounded-lg p-5 relative overflow-hidden flex flex-col min-h-[400px] shadow-sm">
          {/* Header Controls */}
          <div className="flex justify-between items-center z-10 mb-4">
            <div className="bg-[#FFFFFF]/95 dark:bg-[#16202C]/95 backdrop-blur-sm border border-[#DDD8CE] dark:border-[#1F2E3E] px-3.5 py-1.5 rounded flex items-center gap-2.5 shadow-2xs">
              <span className="material-symbols-outlined text-[#BC412B] dark:text-[#E05A42] text-[18px]">route</span>
              <div>
                <span className="text-xs font-bold text-[#1A1A1A] dark:text-[#E8ECE9] block font-editorial">Corridor Hydrographic Map</span>
                <span className="text-[10px] text-[#7A7268] dark:text-[#8E9B97] uppercase tracking-wider">India (East Coast) Focus</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => onNavigate('routes')}
                className="bg-[#FFFFFF]/90 dark:bg-[#16202C]/90 border border-[#DDD8CE] dark:border-[#1F2E3E] text-xs px-2.5 py-1 rounded text-[#1A1A1A] dark:text-[#E8ECE9] hover:border-[#BC412B] hover:text-[#BC412B] flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs font-medium"
              >
                <span className="w-2 h-2 rounded-full bg-[#BC412B]" />
                <span>{analysisInput.loadingPort}</span>
              </button>
              <button
                onClick={() => onNavigate('ports')}
                className="bg-[#FFFFFF]/90 dark:bg-[#16202C]/90 border border-[#DDD8CE] dark:border-[#1F2E3E] text-xs px-2.5 py-1 rounded text-[#1A1A1A] dark:text-[#E8ECE9] hover:border-[#BC412B] hover:text-[#BC412B] flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs font-medium"
              >
                <span className="w-2 h-2 rounded-full bg-[#243E56]" />
                <span>{analysisInput.dischargePort} (IN)</span>
              </button>
            </div>
          </div>

          {/* Live embedded corridor map — real MapLibre map with a strait selector,
              redrawn for whichever origin/destination the current analysis actually uses. */}
          <div className="absolute inset-0">
            <CorridorPreviewMap loadingPort={analysisInput.loadingPort} dischargePort={analysisInput.dischargePort} />
          </div>

          {/* Highlighted Route Overlay Box */}
          <div className="mt-auto z-10 bg-white/95 dark:bg-[#16202C]/95 backdrop-blur-md border border-[#DDD8CE] dark:border-[#1F2E3E] rounded-lg p-4 max-w-xs shadow-md">
            <div className="flex justify-between items-center mb-1 text-[10px] font-bold text-[#BC412B] dark:text-[#E05A42] uppercase tracking-widest">
              <span>Primary Corridor</span>
              <span className="material-symbols-outlined text-[14px]">info</span>
            </div>
            <div className="text-base font-bold text-[#1A1A1A] dark:text-[#E8ECE9] flex items-center gap-2 mb-2 font-editorial">
              <span>{analysisInput.loadingPort}</span>
              <span className="material-symbols-outlined text-sm text-[#BC412B] dark:text-[#E05A42]">arrow_forward</span>
              <span>{analysisInput.dischargePort}</span>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#DDD8CE] dark:border-[#1F2E3E] text-xs">
              <div>
                <span className="text-[#7A7268] dark:text-[#8E9B97] block text-[10px] uppercase font-semibold">Distance</span>
                <span className="font-mono-data font-bold text-[#1A1A1A] dark:text-[#E8ECE9]">{distanceNM.toLocaleString()} NM</span>
              </div>
              <div>
                <span className="text-[#7A7268] dark:text-[#8E9B97] block text-[10px] uppercase font-semibold">Est. Duration</span>
                <span className="font-mono-data font-bold text-[#1A1A1A] dark:text-[#E8ECE9]">{steamingDays} days</span>
              </div>
            </div>
          </div>
        </div>

        {/* Current Recommendation Card (4 Cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-[#101820] border border-[#DDD8CE] dark:border-[#1F2E3E] border-t-4 border-t-[#BC412B] dark:border-t-[#E05A42] rounded-lg p-6 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex justify-between items-start mb-3 pb-3 border-b border-[#DDD8CE] dark:border-[#1F2E3E]">
              <div>
                <span className="text-[10px] uppercase tracking-widest font-bold text-[#BC412B] dark:text-[#E05A42] block mb-0.5">
                  Strategic Advisory
                </span>
                <h3 className="font-editorial text-xl font-bold text-[#1A1A1A] dark:text-[#E8ECE9]">
                  Current Guidance
                </h3>
                <p className="text-xs text-[#6B645C] dark:text-[#A3B1AB] mt-0.5 font-serif-body italic">
                  {analysisInput.loadingPort} → {analysisInput.dischargePort} Corridor
                </p>
              </div>
              <div className="p-2 rounded bg-[#F4F0E8] dark:bg-[#16202C] border border-[#DDD8CE] dark:border-[#1F2E3E] text-[#BC412B] dark:text-[#E05A42]">
                <span className="material-symbols-outlined text-[20px]">verified</span>
              </div>
            </div>

            {/* Quick action & status badges */}
            <div className="grid grid-cols-2 gap-3 my-4">
              <div className="bg-[#F4F0E8] dark:bg-[#16202C] p-3 rounded border border-[#DDD8CE] dark:border-[#1F2E3E]">
                <span className="text-[9px] uppercase tracking-wider text-[#7A7268] dark:text-[#8E9B97] block mb-1 font-bold">
                  Recommended Action
                </span>
                <span
                  className="inline-block px-2.5 py-0.5 text-white text-xs font-bold rounded font-mono-data"
                  style={{ backgroundColor: recommendation.action === 'WAIT' ? '#BC412B' : '#2D5A43' }}
                >
                  {recommendation.action}
                </span>
              </div>
              <div className="bg-[#F4F0E8] dark:bg-[#16202C] p-3 rounded border border-[#DDD8CE] dark:border-[#1F2E3E]">
                <span className="text-[9px] uppercase tracking-wider text-[#7A7268] dark:text-[#8E9B97] block mb-1 font-bold">
                  Route Status
                </span>
                <span className="inline-block px-2.5 py-0.5 bg-white dark:bg-[#101820] text-[#243E56] dark:text-[#6494B8] border border-[#DDD8CE] dark:border-[#1F2E3E] text-xs font-bold rounded font-mono-data">
                  {routeStatus}
                </span>
              </div>
            </div>

            {/* Vessel & Strategy cards */}
            <div className="space-y-3">
              <div className="bg-[#F4F0E8] dark:bg-[#16202C] p-3 rounded border border-[#DDD8CE] dark:border-[#1F2E3E] flex items-center justify-between">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-[#7A7268] dark:text-[#8E9B97] block font-bold">
                    Optimal Vessel Class
                  </span>
                  <span className="text-sm font-bold text-[#1A1A1A] dark:text-[#E8ECE9] flex items-center gap-1.5 mt-0.5 font-editorial">
                    <span className="material-symbols-outlined text-[#BC412B] dark:text-[#E05A42] text-[16px]">
                      directions_boat
                    </span>
                    {recommendation.recommendedVessel.classType}
                  </span>
                </div>
                <span className="text-xs font-mono-data text-[#6B645C] dark:text-[#A3B1AB] font-semibold">{(recommendation.recommendedVessel.dwt / 1000).toFixed(0)}K DWT</span>
              </div>

              <div className="bg-[#F4F0E8] dark:bg-[#16202C] p-3 rounded border border-[#DDD8CE] dark:border-[#1F2E3E]">
                <span className="text-[9px] uppercase tracking-wider text-[#7A7268] dark:text-[#8E9B97] block font-bold">
                  Contract Structure
                </span>
                <span className="text-sm font-bold text-[#BC412B] dark:text-[#E05A42] block mt-0.5 font-editorial uppercase">
                  {recommendation.recommendedStructureLabel}
                </span>
                <p className="text-xs text-[#555555] dark:text-[#A3B1AB] mt-1 font-serif-body leading-relaxed">
                  {recommendation.rationale}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('recommendation')}
            className="w-full mt-6 bg-[#FFFFFF] dark:bg-[#16202C] border border-[#DDD8CE] dark:border-[#1F2E3E] hover:border-[#BC412B] hover:bg-[#BC412B] hover:text-white text-[#1A1A1A] dark:text-[#E8ECE9] text-xs uppercase tracking-wider font-bold py-2.5 px-4 rounded transition-all flex justify-center items-center gap-2 cursor-pointer group shadow-2xs"
          >
            <span>Read Full Memo</span>
            <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
              arrow_forward
            </span>
          </button>
        </div>
      </div>

      {/* Corridor Statistics — real historical data, not decoration */}
      <CorridorStatsPanel />

      {/* Daily News Feed & Market Dispatches Spotlight Widget */}
      <div className="bg-white dark:bg-[#101820] border border-[#DDD8CE] dark:border-[#1F2E3E] rounded-lg p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-[#DDD8CE] dark:border-[#1F2E3E]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#BC412B]/10 dark:bg-[#BC412B]/20 text-[#BC412B] dark:text-[#E05A42] flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[18px]">newspaper</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#BC412B] dark:text-[#E05A42] font-mono-data">
                  Daily Intelligence Dispatches
                </span>
                <span className="text-xs text-[#7A7268] dark:text-[#8E9B97]">· Morning Session</span>
              </div>
              <h3 className="font-editorial text-lg font-bold text-[#1A1A1A] dark:text-[#E8ECE9]">
                Ports, Ships &amp; Commodity Trade Updates
              </h3>
            </div>
          </div>

          <button
            onClick={() => onNavigate('news')}
            className="text-xs text-[#BC412B] dark:text-[#E05A42] font-bold uppercase tracking-wider hover:underline flex items-center gap-1 cursor-pointer font-mono-data"
          >
            <span>View All Dispatches ({articles.length})</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {topNews.map((article) => (
            <div
              key={article.id}
              onClick={() => onNavigate('news')}
              className="p-4 rounded-lg bg-[#F4F0E8] dark:bg-[#16202C] border border-[#DDD8CE] dark:border-[#1F2E3E] hover:border-[#BC412B] dark:hover:border-[#E05A42] transition-colors cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex justify-between items-center text-[10px] font-mono-data mb-2">
                  <span className="uppercase text-[#BC412B] dark:text-[#E05A42] font-bold">
                    {article.category}
                  </span>
                  <span className="text-[#7A7268] dark:text-[#8E9B97]">
                    {article.publishedAt}
                  </span>
                </div>
                <h4 className="font-editorial text-sm font-bold text-[#1A1A1A] dark:text-[#E8ECE9] group-hover:text-[#BC412B] dark:group-hover:text-[#E05A42] transition-colors line-clamp-2 mb-1.5">
                  {article.title}
                </h4>
                <p className="font-serif-body text-xs text-[#555555] dark:text-[#A3B1AB] line-clamp-2">
                  {article.summary}
                </p>
              </div>

              {article.rateImpact && (
                <div className="mt-3 pt-2.5 border-t border-[#DDD8CE] dark:border-[#1F2E3E] flex justify-between items-center text-[11px] font-mono-data">
                  <span className="text-[#7A7268] dark:text-[#8E9B97]">Rate Impact:</span>
                  <span className={`font-bold ${
                    article.rateImpact.direction === 'down' ? 'text-[#2D5A43] dark:text-[#3EB58A]' : 'text-[#BC412B] dark:text-[#E05A42]'
                  }`}>
                    {article.rateImpact.delta}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Active Procurement Table */}
      <div className="bg-white dark:bg-[#101820] border border-[#DDD8CE] dark:border-[#1F2E3E] rounded-lg overflow-hidden shadow-sm">
        <div className="p-4 sm:p-5 border-b border-[#DDD8CE] dark:border-[#1F2E3E] bg-[#F4F0E8] dark:bg-[#16202C] flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[#BC412B] dark:text-[#E05A42] text-[20px]">
              table_chart
            </span>
            <div>
              <h3 className="font-editorial text-base sm:text-lg font-bold text-[#1A1A1A] dark:text-[#E8ECE9]">
                Active Procurement Fixture Index
              </h3>
              <p className="text-xs text-[#6B645C] dark:text-[#A3B1AB] font-serif-body italic">
                Cross-corridor rates, vessel classes, and algorithmic guidance
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-[#7A7268] dark:text-[#8E9B97] font-mono-data">
              Showing {filteredItems.length} active fixtures
            </span>
            <button 
              onClick={() => onNavigate('freight-forecast')}
              className="p-1.5 text-[#7A7268] dark:text-[#8E9B97] hover:text-[#1A1A1A] dark:hover:text-[#E8ECE9] hover:bg-[#DDD8CE]/50 rounded transition-colors cursor-pointer"
              title="Filter & Forecasts"
            >
              <span className="material-symbols-outlined text-[18px]">filter_list</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#DDD8CE] dark:border-[#1F2E3E] bg-[#EDE8DE]/70 dark:bg-[#1C2834]/70 text-[10px] font-bold text-[#7A7268] dark:text-[#8E9B97] uppercase tracking-wider">
                <th className="py-3 px-4">Voyage Corridor</th>
                <th className="py-3 px-4">Vessel Class</th>
                <th className="py-3 px-4">Current Freight</th>
                <th className="py-3 px-4">Forecast Vector</th>
                <th className="py-3 px-4 text-right">Guidance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDD8CE] dark:divide-[#1F2E3E] text-sm">
              {filteredItems.map((item) => {
                const isHold = item.action === 'HOLD';
                const isBook = item.action === 'BOOK';

                return (
                  <tr
                    key={item.id}
                    onClick={() => {
                      onSelectRoute(item.id);
                      onNavigate('recommendation');
                    }}
                    className="hover:bg-[#F9F7F2] dark:hover:bg-[#16202C] transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4 font-bold text-[#1A1A1A] dark:text-[#E8ECE9]">
                      <div className="flex items-center gap-2">
                        <span className="font-editorial text-sm">{item.route}</span>
                        <span className="text-xs text-[#7A7268] dark:text-[#8E9B97] font-mono-data">({item.cargo})</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-[#555555] dark:text-[#A3B1AB] text-xs">
                      {item.vessel}
                    </td>
                    <td className="py-3.5 px-4 font-mono-data font-bold text-[#1A1A1A] dark:text-[#E8ECE9]">
                      {item.currentFreight}
                    </td>
                    <td className="py-3.5 px-4">
                      {item.forecast === 'Soften' && (
                        <span className="inline-flex items-center gap-1 text-[#BC412B] dark:text-[#E05A42] font-bold text-xs font-mono-data">
                          <span className="material-symbols-outlined text-[14px]">arrow_downward</span>
                          <span>SOFTEN</span>
                        </span>
                      )}
                      {item.forecast === 'Rise' && (
                        <span className="inline-flex items-center gap-1 text-[#2D5A43] dark:text-[#3EB58A] font-bold text-xs font-mono-data">
                          <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
                          <span>RISE</span>
                        </span>
                      )}
                      {item.forecast === 'Stable' && (
                        <span className="inline-flex items-center gap-1 text-[#7A7268] dark:text-[#8E9B97] font-bold text-xs font-mono-data">
                          <span className="material-symbols-outlined text-[14px]">trending_flat</span>
                          <span>STABLE</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {isBook ? (
                        <span className="inline-block px-3 py-1 bg-[#2D5A43] text-white rounded text-xs font-bold font-mono-data group-hover:bg-[#1E4D38] transition-colors shadow-2xs">
                          BOOK
                        </span>
                      ) : isHold ? (
                        <span className="inline-block px-3 py-1 bg-[#BC412B] text-white rounded text-xs font-bold font-mono-data group-hover:bg-[#A33621] transition-colors shadow-2xs">
                          HOLD
                        </span>
                      ) : (
                        <span className="inline-block px-3 py-1 bg-[#EDE8DE] dark:bg-[#1F2E3E] border border-[#DDD8CE] dark:border-[#1F2E3E] text-[#555555] dark:text-[#A3B1AB] rounded text-xs font-bold font-mono-data group-hover:border-[#BC412B] transition-colors">
                          MONITOR
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

