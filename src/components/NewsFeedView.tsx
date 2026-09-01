import React, { useState, useMemo } from 'react';
import { NewsArticle, NewsCategory, NewsImpact, ViewMode, AnalysisInput } from '../types';
import { morningBriefingData } from '../data/newsData';
import { useNews } from '../context/NewsContext';

interface NewsFeedViewProps {
  onNavigateToAnalysis?: (prefill: Partial<AnalysisInput>) => void;
  onNavigate?: (view: ViewMode) => void;
}

export const NewsFeedView: React.FC<NewsFeedViewProps> = ({
  onNavigateToAnalysis,
  onNavigate
}) => {
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory>('all');
  const [selectedImpact, setSelectedImpact] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(['art-002']);
  const [showBookmarksOnly, setShowBookmarksOnly] = useState<boolean>(false);
  const [isBriefingExpanded, setIsBriefingExpanded] = useState<boolean>(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { articles: newsArticlesData } = useNews();

  const categories: { id: NewsCategory; label: string; icon: string; count: number }[] = [
    { id: 'all', label: 'All Dispatches', icon: 'feed', count: newsArticlesData.length },
    { id: 'ports', label: 'Ports & Terminals', icon: 'anchor', count: newsArticlesData.filter(a => a.category === 'ports').length },
    { id: 'ships', label: 'Ships & Fleet Tonnage', icon: 'directions_boat', count: newsArticlesData.filter(a => a.category === 'ships').length },
    { id: 'commodities', label: 'Commodities', icon: 'inventory_2', count: newsArticlesData.filter(a => a.category === 'commodities').length },
    { id: 'routes', label: 'Routes & Chokepoints', icon: 'route', count: newsArticlesData.filter(a => a.category === 'routes').length },
  ];

  const filteredArticles = useMemo(() => {
    return newsArticlesData.filter((article) => {
      // Category filter
      if (selectedCategory !== 'all' && article.category !== selectedCategory) {
        return false;
      }
      // Impact filter
      if (selectedImpact !== 'all' && article.impact !== selectedImpact) {
        return false;
      }
      // Bookmarks filter
      if (showBookmarksOnly && !bookmarkedIds.includes(article.id)) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = article.title.toLowerCase().includes(q);
        const matchSummary = article.summary.toLowerCase().includes(q);
        const matchSource = article.source.toLowerCase().includes(q);
        const matchTags = article.tags.some(t => t.toLowerCase().includes(q));
        const matchPorts = article.affectedPorts.some(p => p.toLowerCase().includes(q));
        const matchCommodities = article.affectedCommodities.some(c => c.toLowerCase().includes(q));
        const matchVessels = article.affectedVesselClasses.some(v => v.toLowerCase().includes(q));
        return matchTitle || matchSummary || matchSource || matchTags || matchPorts || matchCommodities || matchVessels;
      }
      return true;
    });
  }, [newsArticlesData, selectedCategory, selectedImpact, searchQuery, showBookmarksOnly, bookmarkedIds]);

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarkedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleCopy = (article: NewsArticle, e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `[MARLIN Maritime Intelligence Memo]\n${article.title}\nSource: ${article.source} (${article.publishedAt})\n\nKey Takeaways:\n${article.keyTakeaways.map(k => `• ${k}`).join('\n')}\n\nRate Impact: ${article.rateImpact ? `${article.rateImpact.metric} (${article.rateImpact.delta})` : 'N/A'}`;
    navigator.clipboard.writeText(text);
    setCopiedId(article.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleRunAnalysisForArticle = (article: NewsArticle) => {
    if (onNavigateToAnalysis) {
      const portOrigin = article.affectedPorts.find(p => ['Newcastle', 'Gladstone', 'Hay Point', 'Taboneo', 'Richards Bay'].includes(p)) || 'Newcastle';
      const portDest = article.affectedPorts.find(p => ['Paradip', 'Visakhapatnam', 'Gangavaram', 'Haldia', 'Krishnapatnam'].includes(p)) || 'Paradip';
      const commodity = article.affectedCommodities[0] || 'Coal';
      
      onNavigateToAnalysis({
        loadingPort: portOrigin,
        dischargePort: portDest,
        cargoType: commodity
      });
    }
  };

  const getImpactBadge = (impact: NewsImpact) => {
    switch (impact) {
      case 'CRITICAL':
        return 'bg-[#BC412B]/15 text-[#BC412B] dark:bg-[#BC412B]/25 dark:text-[#E05A42] border border-[#BC412B]/30';
      case 'HIGH':
        return 'bg-[#D97706]/15 text-[#B45309] dark:bg-[#D97706]/25 dark:text-[#FBBF24] border border-[#D97706]/30';
      case 'MODERATE':
        return 'bg-[#2D5A43]/15 text-[#2D5A43] dark:bg-[#2D5A43]/25 dark:text-[#3EB58A] border border-[#2D5A43]/30';
      default:
        return 'bg-[#DDD8CE] text-[#6B645C] dark:bg-[#1F2E3E] dark:text-[#A3B1AB]';
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'ports':
        return { label: 'Port Operations', color: 'text-[#243E56] dark:text-[#6494B8]' };
      case 'ships':
        return { label: 'Fleet & Tonnage', color: 'text-[#BC412B] dark:text-[#E05A42]' };
      case 'commodities':
        return { label: 'Commodity Index', color: 'text-[#B45309] dark:text-[#FBBF24]' };
      case 'routes':
        return { label: 'Corridor Intelligence', color: 'text-[#2D5A43] dark:text-[#3EB58A]' };
      default:
        return { label: 'Maritime Macro', color: 'text-[#6B645C] dark:text-[#A3B1AB]' };
    }
  };

  return (
    <div className="p-6 sm:p-8 flex flex-col gap-8 max-w-7xl mx-auto w-full">
      {/* Header & Title Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-6 border-b border-[#DDD8CE] dark:border-[#1F2E3E]">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-serif-body italic text-sm text-[#BC412B] dark:text-[#E05A42]">
              Maritime Dispatches · Daily Intelligence Monograph
            </span>
            <span className="text-[#DDD8CE] dark:text-[#1F2E3E]">•</span>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#EDE8DE] dark:bg-[#16202C] border border-[#DDD8CE] dark:border-[#1F2E3E] text-[11px] text-[#6B645C] dark:text-[#A3B1AB] font-mono-data">
              <span className="w-1.5 h-1.5 rounded-full bg-[#BC412B] dark:bg-[#E05A42] animate-pulse" />
              <span>Real-Time Fleet & Port Telemetry</span>
            </div>
          </div>
          <h1 className="font-editorial text-3xl sm:text-4xl font-bold tracking-tight text-[#1A1A1A] dark:text-[#E8ECE9]">
            Daily Maritime &amp; Freight News Feed
          </h1>
          <p className="font-serif-body text-base text-[#555555] dark:text-[#A3B1AB] mt-1 max-w-2xl">
            Continuous intelligence covering ocean bulk terminals, Pacific &amp; Indian Ocean tonnage balance, dry bulk commodity derivatives, and vessel efficiency analytics.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-shrink-0">
          <button
            onClick={() => setShowBookmarksOnly(!showBookmarksOnly)}
            className={`px-3.5 py-2 rounded text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer border ${
              showBookmarksOnly
                ? 'bg-[#BC412B] text-white border-[#BC412B]'
                : 'bg-white dark:bg-[#101820] text-[#1A1A1A] dark:text-[#E8ECE9] border-[#DDD8CE] dark:border-[#1F2E3E] hover:border-[#BC412B]'
            }`}
          >
            <span 
              className="material-symbols-outlined text-[16px]"
              style={{ fontVariationSettings: showBookmarksOnly ? "'FILL' 1" : "'FILL' 0" }}
            >
              bookmark
            </span>
            <span>Saved ({bookmarkedIds.length})</span>
          </button>
        </div>
      </div>

      {/* Today's Morning Executive Briefing Card */}
      <div className="bg-white dark:bg-[#101820] border border-[#DDD8CE] dark:border-[#1F2E3E] rounded-lg p-6 shadow-sm transition-all">
        <div className="flex justify-between items-start cursor-pointer select-none" onClick={() => setIsBriefingExpanded(!isBriefingExpanded)}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-[#BC412B]/10 dark:bg-[#BC412B]/20 text-[#BC412B] dark:text-[#E05A42] flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[20px]">newspaper</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] uppercase font-bold tracking-widest text-[#BC412B] dark:text-[#E05A42] font-mono-data">
                  {morningBriefingData.edition}
                </span>
                <span className="text-xs text-[#7A7268] dark:text-[#8E9B97]">· {morningBriefingData.date}</span>
              </div>
              <h2 className="font-editorial text-lg sm:text-xl font-bold text-[#1A1A1A] dark:text-[#E8ECE9] mt-0.5">
                {morningBriefingData.headline}
              </h2>
            </div>
          </div>

          <button className="text-[#7A7268] dark:text-[#8E9B97] hover:text-[#1A1A1A] dark:hover:text-[#E8ECE9] p-1">
            <span className="material-symbols-outlined text-[22px]">
              {isBriefingExpanded ? 'expand_less' : 'expand_more'}
            </span>
          </button>
        </div>

        {isBriefingExpanded && (
          <div className="mt-5 pt-5 border-t border-[#DDD8CE] dark:border-[#1F2E3E] flex flex-col gap-5">
            <p className="font-serif-body text-sm text-[#444444] dark:text-[#C4CCC7] leading-relaxed">
              {morningBriefingData.summary}
            </p>

            {/* Quick Benchmark Data Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#F4F0E8] dark:bg-[#16202C] p-4 rounded border border-[#DDD8CE] dark:border-[#1F2E3E]">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#7A7268] dark:text-[#8E9B97] font-bold block">
                  Baltic Dry Index (BDI)
                </span>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="font-mono-data text-base font-extrabold text-[#1A1A1A] dark:text-[#E8ECE9]">
                    {morningBriefingData.bdiScore}
                  </span>
                  <span className="text-[11px] font-mono-data text-[#BC412B] dark:text-[#E05A42] font-bold">
                    {morningBriefingData.bdiChange}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#7A7268] dark:text-[#8E9B97] font-bold block">
                  Pacific Tonnage Status
                </span>
                <span className="font-mono-data text-xs font-semibold text-[#2D5A43] dark:text-[#3EB58A] mt-0.5 block truncate">
                  {morningBriefingData.tonnageBalancePacific}
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#7A7268] dark:text-[#8E9B97] font-bold block">
                  Singapore VLSFO 0.5%
                </span>
                <span className="font-mono-data text-xs font-semibold text-[#1A1A1A] dark:text-[#E8ECE9] mt-0.5 block">
                  {morningBriefingData.bunkerBenchmarkSingapore}
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#7A7268] dark:text-[#8E9B97] font-bold block">
                  Fujairah VLSFO 0.5%
                </span>
                <span className="font-mono-data text-xs font-semibold text-[#1A1A1A] dark:text-[#E8ECE9] mt-0.5 block">
                  {morningBriefingData.bunkerBenchmarkFujairah}
                </span>
              </div>
            </div>

            {/* Strategic Observations */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] dark:text-[#E8ECE9] block mb-2 font-editorial">
                Key Strategic Observations
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-[#555555] dark:text-[#A3B1AB]">
                {morningBriefingData.keyDrivers.map((driver, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-[#BC412B] dark:text-[#E05A42] font-bold">§</span>
                    <span className="font-serif-body">{driver}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Controls & Filters */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-white dark:bg-[#101820] p-4 rounded-lg border border-[#DDD8CE] dark:border-[#1F2E3E]">
        {/* Category Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#BC412B] text-white shadow-2xs font-bold'
                    : 'bg-transparent text-[#6B645C] dark:text-[#A3B1AB] hover:bg-[#F4F0E8] dark:hover:bg-[#16202C] hover:text-[#1A1A1A] dark:hover:text-[#E8ECE9]'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">{cat.icon}</span>
                <span>{cat.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono-data ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-[#DDD8CE]/60 dark:bg-[#1F2E3E] text-[#6B645C] dark:text-[#A3B1AB]'
                }`}>
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Impact Filter */}
        <div className="flex items-center gap-2.5">
          {/* Impact select */}
          <select
            value={selectedImpact}
            onChange={(e) => setSelectedImpact(e.target.value)}
            className="bg-[#F4F0E8] dark:bg-[#16202C] border border-[#DDD8CE] dark:border-[#1F2E3E] text-xs text-[#1A1A1A] dark:text-[#E8ECE9] rounded px-2.5 py-1.5 focus:border-[#BC412B] outline-none cursor-pointer"
          >
            <option value="all">All Impact Tiers</option>
            <option value="CRITICAL">⚡ Critical / Market Moving</option>
            <option value="HIGH">High Impact</option>
            <option value="MODERATE">Moderate Impact</option>
          </select>

          {/* Search */}
          <div className="relative flex-1 sm:w-52">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[#7A7268] dark:text-[#8E9B97] text-[16px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dispatches..."
              className="w-full bg-[#F4F0E8] dark:bg-[#16202C] border border-[#DDD8CE] dark:border-[#1F2E3E] rounded pl-8 pr-6 py-1.5 text-xs text-[#1A1A1A] dark:text-[#E8ECE9] placeholder-[#7A7268] focus:border-[#BC412B] outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[#7A7268] hover:text-[#1A1A1A]"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Dispatches Feed List */}
      {filteredArticles.length === 0 ? (
        <div className="bg-white dark:bg-[#101820] border border-[#DDD8CE] dark:border-[#1F2E3E] rounded-lg p-12 text-center flex flex-col items-center justify-center gap-3">
          <span className="material-symbols-outlined text-[40px] text-[#7A7268]">feed</span>
          <h3 className="font-editorial text-lg font-bold text-[#1A1A1A] dark:text-[#E8ECE9]">No matching maritime dispatches</h3>
          <p className="text-xs text-[#7A7268] dark:text-[#8E9B97] max-w-md">
            No articles match your current category or search criteria. Try clearing search filters or selecting "All Dispatches".
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSelectedImpact('all');
              setSearchQuery('');
              setShowBookmarksOnly(false);
            }}
            className="mt-2 text-xs text-[#BC412B] dark:text-[#E05A42] font-semibold hover:underline cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Feed Column (8 Cols or Full) */}
          <div className="lg:col-span-8 flex flex-col gap-5">
            {filteredArticles.map((article) => {
              const catBadge = getCategoryBadge(article.category);
              const isBookmarked = bookmarkedIds.includes(article.id);

              return (
                <article
                  key={article.id}
                  onClick={() => setSelectedArticle(article)}
                  className="bg-white dark:bg-[#101820] border border-[#DDD8CE] dark:border-[#1F2E3E] hover:border-[#BC412B] dark:hover:border-[#E05A42] rounded-lg p-5 sm:p-6 shadow-sm transition-all cursor-pointer group flex flex-col gap-4"
                >
                  {/* Card Header Info */}
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[11px] uppercase tracking-wider font-bold ${catBadge.color} font-mono-data`}>
                        {catBadge.label}
                      </span>
                      <span className="text-[#DDD8CE] dark:text-[#1F2E3E]">•</span>
                      <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded font-mono-data ${getImpactBadge(article.impact)}`}>
                        {article.impact} IMPACT
                      </span>
                      <span className="text-[#DDD8CE] dark:text-[#1F2E3E]">•</span>
                      <span className="text-xs text-[#7A7268] dark:text-[#8E9B97] font-mono-data">
                        {article.publishedAt}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => handleCopy(article, e)}
                        title="Copy Summary"
                        className="p-1 text-[#7A7268] hover:text-[#BC412B] transition-colors rounded hover:bg-[#F4F0E8] dark:hover:bg-[#16202C]"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {copiedId === article.id ? 'check' : 'content_copy'}
                        </span>
                      </button>
                      <button
                        onClick={(e) => toggleBookmark(article.id, e)}
                        title={isBookmarked ? 'Remove Bookmark' : 'Save Article'}
                        className={`p-1 transition-colors rounded hover:bg-[#F4F0E8] dark:hover:bg-[#16202C] ${
                          isBookmarked ? 'text-[#BC412B] dark:text-[#E05A42]' : 'text-[#7A7268] hover:text-[#1A1A1A] dark:hover:text-[#E8ECE9]'
                        }`}
                      >
                        <span 
                          className="material-symbols-outlined text-[18px]"
                          style={{ fontVariationSettings: isBookmarked ? "'FILL' 1" : "'FILL' 0" }}
                        >
                          bookmark
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Title & Subtitle */}
                  <div>
                    <h3 className="font-editorial text-lg sm:text-xl font-bold text-[#1A1A1A] dark:text-[#E8ECE9] group-hover:text-[#BC412B] dark:group-hover:text-[#E05A42] transition-colors leading-snug">
                      {article.title}
                    </h3>
                    {article.subtitle && (
                      <p className="text-xs sm:text-sm font-serif-body italic text-[#6B645C] dark:text-[#A3B1AB] mt-1">
                        {article.subtitle}
                      </p>
                    )}
                  </div>

                  {/* Summary */}
                  <p className="font-serif-body text-xs sm:text-sm text-[#444444] dark:text-[#C4CCC7] leading-relaxed">
                    {article.summary}
                  </p>

                  {/* Freight Rate Impact Callout */}
                  {article.rateImpact && (
                    <div className="bg-[#F4F0E8] dark:bg-[#16202C] border-l-2 border-l-[#BC412B] dark:border-l-[#E05A42] p-2.5 px-3.5 rounded-r flex flex-wrap justify-between items-center gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#BC412B] dark:text-[#E05A42] text-[16px]">
                          trending_down
                        </span>
                        <span className="font-bold text-[#1A1A1A] dark:text-[#E8ECE9] font-editorial">
                          Freight Delta: {article.rateImpact.metric}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 font-mono-data font-bold">
                        <span className={`text-xs ${
                          article.rateImpact.direction === 'down' 
                            ? 'text-[#2D5A43] dark:text-[#3EB58A]' 
                            : 'text-[#BC412B] dark:text-[#E05A42]'
                        }`}>
                          {article.rateImpact.delta}
                        </span>
                        <span className="text-[10px] text-[#7A7268] dark:text-[#8E9B97] font-normal">
                          ({article.rateImpact.timeframe})
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Footer Tags & Source */}
                  <div className="flex flex-wrap justify-between items-center gap-2 pt-3 border-t border-[#DDD8CE] dark:border-[#1F2E3E] text-xs">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {article.affectedPorts.slice(0, 2).map((port) => (
                        <span key={port} className="text-[10px] bg-[#EDE8DE] dark:bg-[#1F2E3E] text-[#1A1A1A] dark:text-[#E8ECE9] px-2 py-0.5 rounded font-mono-data">
                          ⚓ {port}
                        </span>
                      ))}
                      {article.affectedVesselClasses.slice(0, 2).map((vessel) => (
                        <span key={vessel} className="text-[10px] bg-[#EDE8DE] dark:bg-[#1F2E3E] text-[#1A1A1A] dark:text-[#E8ECE9] px-2 py-0.5 rounded font-mono-data">
                          🚢 {vessel}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 text-[#7A7268] dark:text-[#8E9B97] text-[11px] font-mono-data">
                      <span>{article.source}</span>
                      <span>·</span>
                      <span>{article.readingTime}</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Right Rail Column: Market Sentiment & Focus Indices (4 Cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Quick Pulse Card */}
            <div className="bg-white dark:bg-[#101820] border border-[#DDD8CE] dark:border-[#1F2E3E] rounded-lg p-5 flex flex-col gap-4 shadow-sm">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] dark:text-[#E8ECE9] font-editorial">
                  Seaborne Market Sentiment
                </span>
                <span className="text-[10px] uppercase font-bold text-[#2D5A43] dark:text-[#3EB58A] bg-[#2D5A43]/10 dark:bg-[#2D5A43]/20 px-2 py-0.5 rounded font-mono-data">
                  HOLD ADVISORY
                </span>
              </div>

              <p className="text-xs font-serif-body text-[#555555] dark:text-[#A3B1AB] leading-relaxed">
                The confluence of 18 ballasting Panamaxes and PWCS maintenance creates a prime 7-to-10 day window where spot chartering desks hold strong commercial leverage.
              </p>

              <div className="space-y-2.5 pt-3 border-t border-[#DDD8CE] dark:border-[#1F2E3E] text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-[#7A7268] dark:text-[#8E9B97]">Pacific Dry Bulk Tone</span>
                  <span className="font-mono-data font-bold text-[#2D5A43] dark:text-[#3EB58A]">Softening (-4.2%)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#7A7268] dark:text-[#8E9B97]">Indian Port Turnaround</span>
                  <span className="font-mono-data font-bold text-[#1A1A1A] dark:text-[#E8ECE9]">Improving (3.1d delay)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#7A7268] dark:text-[#8E9B97]">Bunker Fuel Volatility</span>
                  <span className="font-mono-data font-bold text-[#1A1A1A] dark:text-[#E8ECE9]">Low ($618.50/MT)</span>
                </div>
              </div>
            </div>

            {/* Vessel Category Spotlight */}
            <div className="bg-white dark:bg-[#101820] border border-[#DDD8CE] dark:border-[#1F2E3E] rounded-lg p-5 flex flex-col gap-3 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] dark:text-[#E8ECE9] font-editorial">
                Fleet Class Outlook
              </span>

              <div className="space-y-3 text-xs">
                <div className="p-2.5 rounded bg-[#F4F0E8] dark:bg-[#16202C] border border-[#DDD8CE] dark:border-[#1F2E3E]">
                  <div className="flex justify-between font-bold text-[#1A1A1A] dark:text-[#E8ECE9] mb-1">
                    <span>Panamax / Kamsarmax</span>
                    <span className="text-[#2D5A43] dark:text-[#3EB58A] font-mono-data">▼ Softening</span>
                  </div>
                  <p className="text-[11px] text-[#6B645C] dark:text-[#A3B1AB] font-serif-body">
                    Over-tonnage in Coral Sea driving Newcastle rates down to $13.65/MT.
                  </p>
                </div>

                <div className="p-2.5 rounded bg-[#F4F0E8] dark:bg-[#16202C] border border-[#DDD8CE] dark:border-[#1F2E3E]">
                  <div className="flex justify-between font-bold text-[#1A1A1A] dark:text-[#E8ECE9] mb-1">
                    <span>Supramax / Ultramax</span>
                    <span className="text-[#BC412B] dark:text-[#E05A42] font-mono-data">▲ Firming</span>
                  </div>
                  <p className="text-[11px] text-[#6B645C] dark:text-[#A3B1AB] font-serif-body">
                    Kalimantan coal barging delays keeping SE Asia prompt rates firm at $11.20/MT.
                  </p>
                </div>

                <div className="p-2.5 rounded bg-[#F4F0E8] dark:bg-[#16202C] border border-[#DDD8CE] dark:border-[#1F2E3E]">
                  <div className="flex justify-between font-bold text-[#1A1A1A] dark:text-[#E8ECE9] mb-1">
                    <span>Capesize (180K DWT)</span>
                    <span className="text-[#7A7268] dark:text-[#8E9B97] font-mono-data">■ Stable</span>
                  </div>
                  <p className="text-[11px] text-[#6B645C] dark:text-[#A3B1AB] font-serif-body">
                    WAus Iron Ore stems absorbed by Qingdao discharge lines; rates at $12.40/MT.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Links to Port & Route Analytics */}
            <div className="bg-[#F4F0E8] dark:bg-[#16202C] border border-[#DDD8CE] dark:border-[#1F2E3E] rounded-lg p-5 flex flex-col gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] dark:text-[#E8ECE9] font-editorial">
                Advisory Quick Links
              </span>
              <div className="flex flex-col gap-2 text-xs">
                <button
                  onClick={() => onNavigate && onNavigate('ports')}
                  className="flex items-center justify-between p-2 rounded bg-white dark:bg-[#101820] border border-[#DDD8CE] dark:border-[#1F2E3E] hover:border-[#BC412B] text-[#1A1A1A] dark:text-[#E8ECE9] transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-[#BC412B]">anchor</span>
                    <span>Port Wait Times &amp; Drafts</span>
                  </span>
                  <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                </button>

                <button
                  onClick={() => onNavigate && onNavigate('freight-forecast')}
                  className="flex items-center justify-between p-2 rounded bg-white dark:bg-[#101820] border border-[#DDD8CE] dark:border-[#1F2E3E] hover:border-[#BC412B] text-[#1A1A1A] dark:text-[#E8ECE9] transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-[#BC412B]">trending_up</span>
                    <span>14-Day Freight Forecast Curves</span>
                  </span>
                  <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                </button>

                <button
                  onClick={() => onNavigate && onNavigate('commodity-index')}
                  className="flex items-center justify-between p-2 rounded bg-white dark:bg-[#101820] border border-[#DDD8CE] dark:border-[#1F2E3E] hover:border-[#BC412B] text-[#1A1A1A] dark:text-[#E8ECE9] transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-[#BC412B]">monitoring</span>
                    <span>Thermal Coal Index Pricing</span>
                  </span>
                  <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Article Reader Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1A1A]/70 dark:bg-black/80 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#101820] border border-[#DDD8CE] dark:border-[#1F2E3E] rounded-lg max-w-3xl w-full p-6 sm:p-8 shadow-2xl flex flex-col gap-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-start pb-4 border-b border-[#DDD8CE] dark:border-[#1F2E3E]">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-xs uppercase font-bold tracking-wider px-2.5 py-0.5 rounded font-mono-data ${getImpactBadge(selectedArticle.impact)}`}>
                  {selectedArticle.impact} IMPACT
                </span>
                <span className="text-xs text-[#7A7268] dark:text-[#8E9B97] font-mono-data">
                  {selectedArticle.publishedAt} · {selectedArticle.readingTime}
                </span>
              </div>
              <button
                onClick={() => setSelectedArticle(null)}
                className="text-[#7A7268] dark:text-[#8E9B97] hover:text-[#1A1A1A] dark:hover:text-[#E8ECE9] text-xl font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Article Headline */}
            <div>
              <span className="text-xs uppercase tracking-widest text-[#BC412B] dark:text-[#E05A42] font-bold font-mono-data block mb-1">
                {selectedArticle.source}
              </span>
              <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#1A1A1A] dark:text-[#E8ECE9] leading-tight">
                {selectedArticle.title}
              </h2>
              {selectedArticle.subtitle && (
                <p className="text-sm font-serif-body italic text-[#6B645C] dark:text-[#A3B1AB] mt-1.5">
                  {selectedArticle.subtitle}
                </p>
              )}
            </div>

            {/* Freight Rate Impact Box */}
            {selectedArticle.rateImpact && (
              <div className="bg-[#F4F0E8] dark:bg-[#16202C] border-l-4 border-l-[#BC412B] dark:border-l-[#E05A42] p-4 rounded-r flex flex-wrap justify-between items-center gap-3">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[#7A7268] dark:text-[#8E9B97] font-bold block">
                    Estimated Freight Impact Metric
                  </span>
                  <span className="font-editorial font-bold text-base text-[#1A1A1A] dark:text-[#E8ECE9]">
                    {selectedArticle.rateImpact.metric}
                  </span>
                </div>
                <div className="text-right font-mono-data">
                  <span className={`text-lg font-bold block ${
                    selectedArticle.rateImpact.direction === 'down'
                      ? 'text-[#2D5A43] dark:text-[#3EB58A]'
                      : 'text-[#BC412B] dark:text-[#E05A42]'
                  }`}>
                    {selectedArticle.rateImpact.delta}
                  </span>
                  <span className="text-[11px] text-[#7A7268] dark:text-[#8E9B97]">
                    Timeframe: {selectedArticle.rateImpact.timeframe}
                  </span>
                </div>
              </div>
            )}

            {/* Article Narrative Body */}
            <div className="space-y-4 font-serif-body text-sm sm:text-base text-[#2A2A2A] dark:text-[#D1D9D4] leading-relaxed">
              {selectedArticle.paragraphs.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
            </div>

            {/* Key Takeaways */}
            <div className="bg-[#EDE8DE] dark:bg-[#1B2735] p-4 sm:p-5 rounded border border-[#DDD8CE] dark:border-[#1F2E3E]">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] dark:text-[#E8ECE9] font-editorial block mb-2.5">
                Executive Takeaways for Charterers
              </span>
              <ul className="space-y-2 text-xs sm:text-sm text-[#444444] dark:text-[#C4CCC7] font-serif-body">
                {selectedArticle.keyTakeaways.map((takeaway, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-[#BC412B] dark:text-[#E05A42] font-bold mt-0.5">•</span>
                    <span>{takeaway}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Affected Supply Chain Footprint */}
            <div className="flex flex-col gap-2 pt-2 border-t border-[#DDD8CE] dark:border-[#1F2E3E] text-xs">
              <span className="text-[11px] uppercase font-bold text-[#7A7268] dark:text-[#8E9B97]">
                Affected Supply Chains &amp; Fleet Nodes
              </span>
              <div className="flex flex-wrap gap-2">
                {selectedArticle.affectedPorts.map(p => (
                  <span key={p} className="bg-[#F4F0E8] dark:bg-[#16202C] text-[#1A1A1A] dark:text-[#E8ECE9] px-2.5 py-1 rounded font-mono-data text-xs border border-[#DDD8CE] dark:border-[#1F2E3E]">
                    ⚓ {p} Port
                  </span>
                ))}
                {selectedArticle.affectedCommodities.map(c => (
                  <span key={c} className="bg-[#F4F0E8] dark:bg-[#16202C] text-[#1A1A1A] dark:text-[#E8ECE9] px-2.5 py-1 rounded font-mono-data text-xs border border-[#DDD8CE] dark:border-[#1F2E3E]">
                    📦 {c}
                  </span>
                ))}
                {selectedArticle.affectedVesselClasses.map(v => (
                  <span key={v} className="bg-[#F4F0E8] dark:bg-[#16202C] text-[#1A1A1A] dark:text-[#E8ECE9] px-2.5 py-1 rounded font-mono-data text-xs border border-[#DDD8CE] dark:border-[#1F2E3E]">
                    🚢 {v} Bulkers
                  </span>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap justify-between items-center gap-3 pt-4 border-t border-[#DDD8CE] dark:border-[#1F2E3E]">
              <button
                onClick={(e) => handleCopy(selectedArticle, e)}
                className="text-xs text-[#BC412B] dark:text-[#E05A42] font-serif-body font-bold hover:underline flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">content_copy</span>
                <span>{copiedId === selectedArticle.id ? 'Copied Monograph!' : 'Copy Intelligence Brief'}</span>
              </button>

              <div className="flex gap-2.5">
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="px-4 py-2 bg-transparent border border-[#DDD8CE] dark:border-[#1F2E3E] text-xs font-semibold text-[#7A7268] dark:text-[#8E9B97] hover:text-[#1A1A1A] dark:hover:text-[#E8ECE9] rounded hover:bg-[#F4F0E8] dark:hover:bg-[#16202C] cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleRunAnalysisForArticle(selectedArticle);
                    setSelectedArticle(null);
                  }}
                  className="px-4 py-2 bg-[#BC412B] hover:bg-[#A33420] text-white font-editorial font-bold text-xs rounded transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">analytics</span>
                  <span>Run Analysis on Affected Route</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
