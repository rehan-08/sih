import React, { useMemo, useState } from 'react';
import { ViewMode, ProcurementItem, AnalysisInput, SavedAnalysis } from './types';
import {
  initialProcurementItems,
  defaultAnalysisInput,
  initialSavedAnalyses
} from './data/maritimeData';
import { buildRoute, routeDistanceNM } from './utils/routeCalc';
import { computeRecommendation } from './utils/recommendationEngine';
import { ThemeProvider } from './context/ThemeContext';
import { PortAlertProvider } from './context/PortAlertContext';
import { NewsProvider } from './context/NewsContext';

import { LandingPage } from './components/LandingPage';
import { LoginScreen } from './components/LoginScreen';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { OverviewView } from './components/OverviewView';
import { NewsFeedView } from './components/NewsFeedView';
import { NewAnalysisWizard } from './components/NewAnalysisWizard';
import { RouteIntelligenceView } from './components/RouteIntelligenceView';
import { FreightForecastView } from './components/FreightForecastView';
import { CharteringRecommendationView } from './components/CharteringRecommendationView';
import { VesselOptimizationView } from './components/VesselOptimizationView';
import { VesselComparisonView } from './components/VesselComparisonView';
import { CommodityIndexView } from './components/CommodityIndexView';
import { PortsView } from './components/PortsView';
import { PortComparisonView } from './components/PortComparisonView';
import { SavedAnalysesModal } from './components/SavedAnalysesModal';
import { ExportModal } from './components/ExportModal';
import { SettingsModal } from './components/SettingsModal';
import { PortAlertPushToast } from './components/PortAlertPushToast';
import { PortAlertCenterDrawer } from './components/PortAlertCenterDrawer';
import { PortAlertSubscriptionModal } from './components/PortAlertSubscriptionModal';

type AppStage = 'landing' | 'login' | 'app';

export function AppContent() {
  const [appStage, setAppStage] = useState<AppStage>('landing');
  const [currentView, setCurrentView] = useState<ViewMode>('overview');
  const [procurementItems, setProcurementItems] = useState<ProcurementItem[]>(initialProcurementItems);
  const [analysisInput, setAnalysisInput] = useState<AnalysisInput>(defaultAnalysisInput);
  const [savedAnalyses, setSavedAnalyses] = useState<SavedAnalysis[]>(initialSavedAnalyses);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const distanceNM = useMemo(
    () => Math.round(routeDistanceNM(buildRoute(analysisInput.loadingPort, analysisInput.dischargePort))),
    [analysisInput.loadingPort, analysisInput.dischargePort]
  );
  const recommendation = useMemo(
    () => computeRecommendation(analysisInput, distanceNM),
    [analysisInput, distanceNM]
  );

  // Modals
  const [isSavedAnalysesOpen, setIsSavedAnalysesOpen] = useState<boolean>(false);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleRunAnalysis = (data: AnalysisInput) => {
    setAnalysisInput(data);
    setCurrentView('recommendation');
    showToast(`Recommendation generated for ${data.loadingPort} → ${data.dischargePort} (${data.cargoType})`);
  };

  const handleNavigateToAnalysisPrefilled = (prefill: Partial<AnalysisInput>) => {
    setAnalysisInput(prev => ({
      ...prev,
      ...prefill
    }));
    setCurrentView('new-analysis');
    showToast(`Analysis pre-filled for ${prefill.loadingPort || 'Selected Route'} corridor`);
  };

  const handleSaveCurrentAnalysis = () => {
    const newSave: SavedAnalysis = {
      id: `mr-${Date.now().toString().slice(-4)}`,
      timestamp: 'Just now',
      route: `${analysisInput.loadingPort} → ${analysisInput.dischargePort}`,
      cargo: `${analysisInput.cargoType} (${analysisInput.quantityMT.toLocaleString()} MT)`,
      quantity: `${analysisInput.quantityMT.toLocaleString()} MT`,
      recommendation: recommendation.action === 'WAIT' ? 'WAIT' : 'EXECUTE',
      vessel: recommendation.recommendedVessel.name,
      contractStrategy: recommendation.recommendedStructureLabel,
      savingsEstimate: `$${recommendation.projectedSavingsUSD.toLocaleString()} projected saving via ${recommendation.recommendedStructureLabel}`
    };

    setSavedAnalyses([newSave, ...savedAnalyses]);
    showToast('Analysis successfully saved to portfolio');
  };

  if (appStage === 'landing') {
    return <LandingPage onEnter={() => setAppStage('login')} />;
  }

  if (appStage === 'login') {
    return <LoginScreen onLogin={() => setAppStage('app')} />;
  }

  return (
    <div className="min-h-screen bg-[#F9F7F2] dark:bg-[#0B1117] text-[#1A1A1A] dark:text-[#E8ECE9] flex font-sans transition-colors">
      {/* Global Maritime Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        onSelectView={(view) => setCurrentView(view)}
        onNewAnalysis={() => setCurrentView('new-analysis')}
        onOpenSavedAnalyses={() => setIsSavedAnalysesOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onLogout={() => setAppStage('login')}
        onExitToLanding={() => setAppStage('landing')}
      />

      {/* Main Content Area */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen overflow-x-hidden">
        <TopHeader
          currentView={currentView}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onExport={() => setIsExportOpen(true)}
          onNewAnalysis={() => setCurrentView('new-analysis')}
          analysisInput={analysisInput}
        />

        <main className="flex-1 pb-16">
          {currentView === 'overview' && (
            <OverviewView
              procurementItems={procurementItems}
              searchQuery={searchQuery}
              analysisInput={analysisInput}
              recommendation={recommendation}
              distanceNM={distanceNM}
              onSelectRoute={(routeId) => {
                const item = procurementItems.find(p => p.id === routeId);
                if (item) {
                  setAnalysisInput({
                    ...analysisInput,
                    cargoType: item.cargo,
                    loadingPort: item.origin,
                    dischargePort: item.destination,
                    quantityMT: item.quantityMT
                  });
                }
              }}
              onNewAnalysis={() => setCurrentView('new-analysis')}
              onNavigate={setCurrentView}
            />
          )}

          {currentView === 'news' && (
            <NewsFeedView
              onNavigateToAnalysis={handleNavigateToAnalysisPrefilled}
              onNavigate={setCurrentView}
            />
          )}

          {currentView === 'new-analysis' && (
            <NewAnalysisWizard
              initialData={analysisInput}
              onSubmit={handleRunAnalysis}
              onCancel={() => setCurrentView('overview')}
            />
          )}

          {currentView === 'recommendation' && (
            <CharteringRecommendationView
              onNavigate={setCurrentView}
              onSaveAnalysis={handleSaveCurrentAnalysis}
              onExport={() => setIsExportOpen(true)}
              analysisInput={analysisInput}
              recommendation={recommendation}
              distanceNM={distanceNM}
            />
          )}

          {currentView === 'routes' && <RouteIntelligenceView />}

          {currentView === 'freight-forecast' && <FreightForecastView />}

          {currentView === 'vessels' && (
            <VesselOptimizationView
              onNavigateToComparison={() => setCurrentView('vessel-comparison')}
            />
          )}

          {currentView === 'vessel-comparison' && (
            <VesselComparisonView
              onSelectVesselForAnalysis={(vesselClass) =>
                handleNavigateToAnalysisPrefilled({ vesselPreference: vesselClass })
              }
              onNavigateToOptimization={() => setCurrentView('vessels')}
            />
          )}

          {currentView === 'commodity-index' && <CommodityIndexView />}

          {currentView === 'ports' && (
            <PortsView
              onSelectPortForAnalysis={(portName) =>
                handleNavigateToAnalysisPrefilled({ dischargePort: portName })
              }
              onNavigateToComparison={() => setCurrentView('port-comparison')}
            />
          )}

          {currentView === 'port-comparison' && (
            <PortComparisonView onNavigateToPorts={() => setCurrentView('ports')} />
          )}
        </main>
      </div>

      {/* Modals */}
      <SavedAnalysesModal
        isOpen={isSavedAnalysesOpen}
        onClose={() => setIsSavedAnalysesOpen(false)}
        analyses={savedAnalyses}
        onSelectAnalysis={(saved) => {
          setCurrentView('recommendation');
        }}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        analysisInput={analysisInput}
        recommendation={recommendation}
        distanceNM={distanceNM}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Port Alert System Drawer, Toasts, and Subscription Settings */}
      <PortAlertPushToast onNavigateToPort={() => setCurrentView('ports')} />
      <PortAlertCenterDrawer onNavigateToPort={() => setCurrentView('ports')} />
      <PortAlertSubscriptionModal />

      {/* Interactive Toast Notification - Editorial Style */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#FFFFFF] dark:bg-[#16202C] border-l-4 border-l-[#BC412B] dark:border-l-[#E05A42] border border-[#DDD8CE] dark:border-[#1F2E3E] text-[#1A1A1A] dark:text-[#E8ECE9] px-4 py-3 rounded shadow-xl flex items-center gap-3 text-xs animate-bounce">
          <span className="material-symbols-outlined text-[#BC412B] dark:text-[#E05A42] text-[18px]">bookmark_added</span>
          <span className="font-medium font-serif-body text-sm">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <NewsProvider>
        <PortAlertProvider>
          <AppContent />
        </PortAlertProvider>
      </NewsProvider>
    </ThemeProvider>
  );
}

export default App;

