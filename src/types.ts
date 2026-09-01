export type ViewMode = 
  | 'overview' 
  | 'new-analysis' 
  | 'recommendation' 
  | 'routes' 
  | 'freight-forecast' 
  | 'vessels' 
  | 'vessel-comparison'
  | 'commodity-index'
  | 'ports'
  | 'port-comparison'
  | 'news';

export type NewsCategory = 'all' | 'ports' | 'ships' | 'commodities' | 'routes' | 'macro';
export type NewsImpact = 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';

export interface RateImpact {
  metric: string;
  delta: string;
  direction: 'up' | 'down' | 'neutral';
  timeframe: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  subtitle?: string;
  category: 'ports' | 'ships' | 'commodities' | 'routes' | 'macro';
  impact: NewsImpact;
  source: string;
  author: string;
  publishedAt: string;
  readingTime: string;
  summary: string;
  paragraphs: string[];
  keyTakeaways: string[];
  affectedCommodities: string[];
  affectedPorts: string[];
  affectedVesselClasses: string[];
  rateImpact?: RateImpact;
  tags: string[];
  isFeatured?: boolean;
}

export interface MorningBriefing {
  date: string;
  edition: string;
  headline: string;
  summary: string;
  tonnageBalancePacific: string;
  tonnageBalanceAtlantic: string;
  bunkerBenchmarkSingapore: string;
  bunkerBenchmarkFujairah: string;
  bdiScore: number;
  bdiChange: string;
  keyDrivers: string[];
}

export interface ProcurementItem {
  id: string;
  route: string;
  origin: string;
  destination: string;
  vessel: string;
  currentFreight: string;
  freightValue: number;
  forecast: 'Soften' | 'Rise' | 'Stable';
  action: 'HOLD' | 'BOOK' | 'MONITOR';
  cargo: string;
  quantity: string;
  quantityMT: number;
  status: string;
}

export interface AnalysisInput {
  cargoType: string;
  quantityMT: number;
  originRegion: string;
  loadingPort: string;
  destinationRegion: string;
  dischargePort: string;
  deliveryWindow: string;
  contractPreference: 'Spot' | '1-3 Voyages' | '3-6 Voyages' | 'Flexible';
  vesselPreference?: string;
}

export interface VesselClassInfo {
  type: string;
  capacityMT: string;
  compatibility: 'Compatible' | 'Restricted' | 'Incompatible';
  parcelUtilization: string;
  operationalFit: 'RECOMMENDED' | 'Strong fit' | 'Lower fit' | 'NOT RECOMMENDED';
  isRecommended?: boolean;
  draft: string;
  loa: string;
  beam: string;
  berth: string;
  suitabilityScore: number;
}

export interface PortWeather {
  condition: string;
  temperatureC: number;
  windSpeedKnots: number;
  windDirection: string;
  waveHeightM: number;
  visibilityNM: number;
  tideHeightM: number;
  tideStatus: 'High Slack' | 'Low Slack' | 'Flood Tide' | 'Ebb Tide';
  barometricPressureHpa: number;
  monsoonAlert?: string | null;
}

export interface PortCongestion {
  congestionLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  congestionIndex: number; // 0 - 100
  berthOccupancyPct: number; // 0 - 100
  anchorageVesselsCount: number;
  berthedVesselsCount: number;
  incomingNext48h: number;
  trend: 'Improving' | 'Worsening' | 'Stable';
  historicalAverageWaitingVessels: number;
}

export interface PortTurnaround {
  avgTurnaroundHours: number;
  avgTurnaroundDays: number;
  historicalNormHours: number;
  avgDischargeRateMTDay: number;
  bulkUnloadingEfficiencyPct: number;
  demurrageRisk: 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE';
  demurrageCostPerDayUSD: number;
  typicalStages: {
    anchorageWaitHours: number;
    pilotageAndMooringHours: number;
    dischargeOperationsHours: number;
    draftSurveyAndClearanceHours: number;
  };
}

export interface CraneItem {
  id: string;
  name: string;
  type: 'Continuous Ship Unloader (CSU)' | 'Grab Gantry Unloader' | 'Mobile Harbor Crane' | 'High-Speed Shiploader';
  status: 'ACTIVE' | 'MAINTENANCE' | 'STANDBY';
  berthAssigned: string;
  capacityTPH: number; // Tons Per Hour
  operatorShift: string;
  efficiencyPct: number;
}

export interface PortCranes {
  totalCranes: number;
  activeCranesInUse: number;
  cranesUnderMaintenance: number;
  standbyCranes: number;
  craneUtilizationPct: number;
  avgCranesPerBerth: number;
  totalHandlingCapacityTPH: number;
  craneList: CraneItem[];
}

export interface WaitingVesselRecord {
  vesselName: string;
  vesselClass: string;
  cargo: string;
  tonnageMT: number;
  waitingSinceHours: number;
  assignedBerth?: string;
  etaBerth: string;
}

export interface PortDelayWaitTime {
  currentWaitTimeHours: number;
  waitTimeRange: string;
  pilotageDelayHours: number;
  customsClearanceHours: number;
  tidalLockDelayHours: number;
  weatherDelayHours: number;
  projectedDelayTrend: 'Increasing' | 'Decreasing' | 'Steady';
  waitingVesselsQueue: WaitingVesselRecord[];
}

export type PortAlertType =
  | 'TURNAROUND_SURGE'
  | 'PORT_CLOSURE'
  | 'WEATHER_CYCLONE'
  | 'CRANE_OUTAGE'
  | 'DRAFT_RESTRICTION'
  | 'CONGESTION_LOGJAM'
  | 'DRAFT_COMPLIANCE_CHANGE'
  | 'DEMURRAGE_ESCALATION'
  | 'CHOKEPOINT_PROXIMITY';

export type AlertSeverity = 'CRITICAL' | 'WARNING' | 'INFO';

export interface PortAlertMetrics {
  turnaroundDelta?: string;
  previousTurnaround?: string;
  currentTurnaround?: string;
  closureEstimatedDuration?: string;
  affectedBerths?: string[];
  affectedVesselsCount?: number;
  demurrageRiskImpact?: string;
  weatherCondition?: string;
}

export interface PortAlertNotification {
  id: string;
  portId: string;
  portName: string;
  type: PortAlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  metrics: PortAlertMetrics;
  timestamp: string;
  isRead: boolean;
  source: string;
  actionRecommendation?: string;
  incidentStatus: 'ACTIVE' | 'RESOLVING' | 'RESOLVED' | 'MONITORING';
  // Distinguishes port-level alerts from vessel/route-level alerts (default PORT for legacy records)
  targetType?: 'PORT' | 'VESSEL';
}

export interface PortAlertSubscription {
  portId: string;
  portName: string;
  isSubscribed: boolean;
  channels: {
    inAppPush: boolean;
    emailDigest: boolean;
    soundChime: boolean;
    browserBadge: boolean;
  };
  thresholds: {
    turnaroundSurgePct: number;
    turnaroundHoursMax: number;
    alertOnPortClosure: boolean;
    alertOnMonsoonCyclone: boolean;
    alertOnCraneOutage: boolean;
    alertOnDraftRestriction: boolean;
    alertOnDemurrageRisk: 'ALL' | 'HIGH_SEVERE' | 'SEVERE_ONLY';
  };
  notifySeverity: 'ALL' | 'WARNING_AND_CRITICAL' | 'CRITICAL_ONLY';
  lastTriggeredAt?: string;
  createdAt: string;
}

export interface VesselAlertSubscription {
  vesselId: string;
  vesselName: string;
  isSubscribed: boolean;
  channels: {
    inAppPush: boolean;
    emailDigest: boolean;
    soundChime: boolean;
    browserBadge: boolean;
  };
  notifySeverity: 'ALL' | 'WARNING_AND_CRITICAL' | 'CRITICAL_ONLY';
  lastTriggeredAt?: string;
  createdAt: string;
}

export interface PortInfo {
  id: string;
  name: string;
  region: string;
  country: string;
  status: 'NORMAL' | 'MODERATE' | 'HIGH';
  distanceNM: number;
  transitDays: number;
  estDelayHours: string;
  draftLimitM: number;
  maxLOAM: number;
  berths: number;
  waitingVessels: number;
  isOptimal?: boolean;
  notes: string;
  // Extended real-time telemetry
  weather?: PortWeather;
  congestion?: PortCongestion;
  turnaround?: PortTurnaround;
  cranes?: PortCranes;
  delays?: PortDelayWaitTime;
  coordinates?: { lat: number; lng: number };
  lastTelemetryUpdate?: string;
  history?: {
    congestionIndex: number[];
    turnaroundHours: number[];
    waitTimeHours: number[];
  };
}

export interface SavedAnalysis {
  id: string;
  timestamp: string;
  route: string;
  cargo: string;
  quantity: string;
  recommendation: 'WAIT' | 'EXECUTE' | 'BOOK' | 'MONITOR';
  vessel: string;
  contractStrategy: string;
  savingsEstimate: string;
}

export interface VesselComparisonItem {
  id: string;
  name: string;
  classType: string;
  isRecommended?: boolean;
  operationalFit: 'RECOMMENDED' | 'Strong fit' | 'Lower fit' | 'NOT RECOMMENDED';
  compatibility: 'Compatible' | 'Restricted' | 'Incompatible';
  suitabilityScore: number; // 0-100
  summaryDescription: string;

  // Capacity & Cargo Hold Specs
  dwt: number; // Deadweight MT
  grossTonnage: number;
  netTonnage: number;
  grainCubicCapacityM3: number;
  baleCubicCapacityM3: number;
  holdsAndHatches: string;
  hatchDimensions: string;
  gearing: string;
  hasCranes: boolean;
  craneCapacityDescription: string;
  maxSafeParcelParadipMT: number; // Max intake under 14.5m draft restriction
  voyagesNeededFor180kMT: number; // Decimal voyages to lift 180,000 MT

  // Efficiency & Carbon Metrics
  ciiRating: 'A' | 'B' | 'C' | 'D' | 'E';
  eexiValueGramsCO2: number; // g CO2/tonne-nm
  eediCompliancePhase: string;
  transportEfficiencyScore: number; // 0-100 index
  tonneMilesPerTonFuel: number; // Tonne-miles cargo per ton bunker
  carbonTaxExposureUSD: number; // Projected ETS/IMO carbon cost per Newcastle-Paradip voyage
  turnaroundDaysParadip: number; // Average port turnaround in days

  // Fuel Consumption & Bunker Economics
  ladenSpeedKnots: number;
  ecoSpeedKnots: number;
  ladenFuelConsumptionMTDay: number; // VLSFO MT/day at design speed
  ecoFuelConsumptionMTDay: number; // VLSFO MT/day at eco speed
  ballastFuelConsumptionMTDay: number; // VLSFO MT/day ballast
  portIdleConsumptionMTDay: number; // MGO/VLSFO MT/day idle
  portWorkingConsumptionMTDay: number; // MT/day active discharging
  scrubberEquipped: boolean;
  dailyBunkerCostUSD: number; // Daily bunker cost at standard $620/MT
  voyageFuelBurnNewcastleParadipMT: number; // Total voyage fuel burn in MT
  bunkerCostPerTonCargoUSD: number; // Bunker cost in $/MT cargo

  // Navigational & Dimensional Geometry
  ladenDraftM: number;
  ballastDraftM: number;
  loaM: number; // Length Overall
  beamM: number; // Beam
  airDraftM: number; // Air draft in ballast
  tpc: number; // Tonnes Per Centimetre immersion
  berthAllocation: string;
  lighteringRequiredParadip: boolean;
  lighteringCostPerTonUSD: number; // Added $/MT cost if lightering is required

  // Commercial & Voyage Financials
  dailyTceRateUSD: number; // Standard daily Time Charter Equivalent
  freightRatePerTonUSD: number; // Effective $/MT freight
  totalVoyageDays: number; // Transit days + port stay + lightering
  demurrageCostPerDayUSD: number;
  totalEstimatedVoyageCostUSD: number; // Total voyage charter + bunker + port fees
}

export type VesselNavStatus = 
  | 'UNDERWAY' 
  | 'ANCHORAGE' 
  | 'SLOW_STEAMING' 
  | 'MANOEUVRING' 
  | 'BERTHED' 
  | 'DRIFTING';

export type VesselSpeedMode =
  | 'LADEN_FULL'
  | 'ECO_SPEED'
  | 'VIRTUAL_ARRIVAL'
  | 'REDUCED_WEATHER';

export type VesselContractType = 'SPOT' | 'COA' | 'TIME_CHARTER' | 'FOB_SALE';

export type VesselVoyageLeg = 'LADEN_OUTBOUND' | 'BALLAST_RETURN';

export interface VesselWaypoint {
  lat: number;
  lng: number;
  name: string;
  passed?: boolean;
}

export interface TrackedVessel {
  id: string;
  name: string;
  imo: string;
  mmsi: string;
  callSign: string;
  flag: string;
  flagCode: string;
  vesselClass: 'Handysize' | 'Supramax' | 'Panamax' | 'Kamsarmax' | 'Capesize' | 'Newcastlemax';
  dwt: number;
  loa: number; // Length overall in meters
  beam: number; // Beam in meters
  currentDraft: number; // Current draft in meters
  maxDraft: number; // Summer draft
  builtYear: number;
  ownerOperator: string;
  
  // Real-time AIS Telemetry
  coordinates: {
    lat: number;
    lng: number;
  };
  heading: number; // 0 - 360 deg
  cog: number; // Course over ground
  sog: number; // Speed over ground in knots (e.g. 13.4 kts)
  navStatus: VesselNavStatus;
  lastAisPing: string;
  
  // Voyage & Cargo Information
  cargoType: string;
  cargoParcelMT: number;
  originPort: string;
  originCountry: string;
  departureDate: string;
  destinationPort: string;
  destinationBerth?: string;
  destinationCountry: string;
  assignedRouteCorridor: string;
  contractType: VesselContractType;
  voyageLeg: VesselVoyageLeg;
  
  // Distance, Speed, & Projected ETA
  totalDistanceNM: number;
  distanceTraveledNM: number;
  distanceToGoNM: number;
  progressPct: number; // 0-100%
  projectedEta: string;
  etaHoursRemaining: number;
  etaDaysRemaining: number;
  speedMode: VesselSpeedMode;
  weatherImpactKts: number;
  
  // Hydrographic & Port Fit Analysis
  destinationPortMaxDraft: number;
  destinationPortMaxLOA: number;
  isDraftCompliant: boolean;
  lighteringRequired: boolean;
  lighteringEstimatedCostUSD?: number;
  berthFitAssessment: string;
  demurrageRiskAtEta: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  projectedAnchorageWaitHours: number;
  
  // Historical Track & Waypoints
  recentTrail: Array<{ lat: number; lng: number; timestamp: string }>;
  plannedTrack: VesselWaypoint[];
  
  // Weather at current position
  currentWeather: {
    seaState: string;
    waveHeightM: number;
    windKts: number;
    windDirection: string;
    condition: string;
  };
}

