import { ProcurementItem, VesselClassInfo, PortInfo, PortCongestion, SavedAnalysis, AnalysisInput, VesselComparisonItem } from '../types';

export const initialProcurementItems: ProcurementItem[] = [
  {
    id: 'proc-1',
    route: 'Newcastle → Paradip',
    origin: 'Newcastle',
    destination: 'Paradip',
    vessel: 'Panamax',
    currentFreight: '$14.80/MT',
    freightValue: 14.80,
    forecast: 'Soften',
    action: 'HOLD',
    cargo: 'Coal',
    quantity: '180,000 MT',
    quantityMT: 180000,
    status: 'NORMAL'
  },
  {
    id: 'proc-2',
    route: 'Taboneo → Vizag',
    origin: 'Taboneo',
    destination: 'Visakhapatnam',
    vessel: 'Supramax',
    currentFreight: '$11.20/MT',
    freightValue: 11.20,
    forecast: 'Rise',
    action: 'BOOK',
    cargo: 'Thermal Coal',
    quantity: '65,000 MT',
    quantityMT: 65000,
    status: 'TIGHT'
  },
  {
    id: 'proc-3',
    route: 'Beira → Haldia',
    origin: 'Beira',
    destination: 'Haldia',
    vessel: 'Panamax',
    currentFreight: '$18.50/MT',
    freightValue: 18.50,
    forecast: 'Stable',
    action: 'MONITOR',
    cargo: 'Coking Coal',
    quantity: '75,000 MT',
    quantityMT: 75000,
    status: 'CONGESTED'
  },
  {
    id: 'proc-4',
    route: 'Gladstone → Gangavaram',
    origin: 'Gladstone',
    destination: 'Gangavaram',
    vessel: 'Panamax',
    currentFreight: '$15.10/MT',
    freightValue: 15.10,
    forecast: 'Soften',
    action: 'HOLD',
    cargo: 'Bauxite',
    quantity: '120,000 MT',
    quantityMT: 120000,
    status: 'OPTIMAL'
  },
  {
    id: 'proc-5',
    route: 'Port Hedland → Paradip',
    origin: 'Port Hedland',
    destination: 'Paradip',
    vessel: 'Capesize',
    currentFreight: '$12.40/MT',
    freightValue: 12.40,
    forecast: 'Stable',
    action: 'MONITOR',
    cargo: 'Iron Ore',
    quantity: '160,000 MT',
    quantityMT: 160000,
    status: 'RESTRICTED'
  }
];

export const defaultAnalysisInput: AnalysisInput = {
  cargoType: 'Coal',
  quantityMT: 180000,
  originRegion: 'Australia',
  loadingPort: 'Newcastle',
  destinationRegion: 'India East Coast',
  dischargePort: 'Paradip',
  deliveryWindow: 'Q3 2024 (Jul - Sep)',
  contractPreference: '1-3 Voyages'
};

export const vesselClassMatrix: VesselClassInfo[] = [
  {
    type: 'Handysize',
    capacityMT: '35K – 40K',
    compatibility: 'Compatible',
    parcelUtilization: 'Low utilization',
    operationalFit: 'Lower fit',
    draft: '10.5m',
    loa: '180m',
    beam: '28.0m',
    berth: 'Standard General Cargo',
    suitabilityScore: 54
  },
  {
    type: 'Supramax',
    capacityMT: '50K – 60K',
    compatibility: 'Compatible',
    parcelUtilization: 'High utilization',
    operationalFit: 'Strong fit',
    draft: '13.2m',
    loa: '200m',
    beam: '32.2m',
    berth: 'Multi-Purpose Bulk',
    suitabilityScore: 82
  },
  {
    type: 'Panamax',
    capacityMT: '70K – 85K',
    compatibility: 'Compatible',
    parcelUtilization: 'Very high utilization',
    operationalFit: 'RECOMMENDED',
    isRecommended: true,
    draft: '18.0m',
    loa: '320m',
    beam: '32.2m',
    berth: 'Dedicated deep-water',
    suitabilityScore: 96
  },
  {
    type: 'Capesize',
    capacityMT: '150K+',
    compatibility: 'Restricted',
    parcelUtilization: 'High',
    operationalFit: 'NOT RECOMMENDED',
    draft: '20.5m',
    loa: '335m',
    beam: '45.0m',
    berth: 'Restricted Anchorage Only',
    suitabilityScore: 28
  }
];

export const portIntelligenceData: PortInfo[] = [
  {
    id: 'paradip',
    name: 'Paradip',
    region: 'India East Coast',
    country: 'India',
    status: 'MODERATE',
    distanceNM: 5612,
    transitDays: 15.8,
    estDelayHours: '14-18h Delay',
    draftLimitM: 14.5,
    maxLOAM: 260,
    berths: 16,
    waitingVessels: 12,
    notes: 'Moderate weather disruptions in Bay of Bengal causing queue build up at coal berths.',
    coordinates: { lat: 20.2644, lng: 86.6853 },
    lastTelemetryUpdate: '5 mins ago (AIS / Port Authority Live)',
    history: {
      congestionIndex: [58, 60, 59, 62, 64, 63, 65, 66, 67, 68, 67, 68],
      turnaroundHours: [36, 37, 38, 39, 40, 41, 42, 43, 44, 44.2, 44.4, 44.5],
      waitTimeHours: [12, 12.5, 13, 13.5, 14, 14.5, 15, 15.2, 15.5, 15.8, 16.2, 16.5]
    },
    weather: {
      condition: 'Monsoon Squalls & Heavy Chop',
      temperatureC: 29,
      windSpeedKnots: 19,
      windDirection: 'SSW 19 kts',
      waveHeightM: 2.2,
      visibilityNM: 7.5,
      tideHeightM: 2.8,
      tideStatus: 'Flood Tide',
      barometricPressureHpa: 1008,
      monsoonAlert: 'Swell Advisory: Long-period swell (2.2m) at Outer Anchorage'
    },
    congestion: {
      congestionLevel: 'MODERATE',
      congestionIndex: 68,
      berthOccupancyPct: 82,
      anchorageVesselsCount: 12,
      berthedVesselsCount: 13,
      incomingNext48h: 6,
      trend: 'Stable',
      historicalAverageWaitingVessels: 8.5
    },
    turnaround: {
      avgTurnaroundHours: 44.5,
      avgTurnaroundDays: 1.85,
      historicalNormHours: 34.0,
      avgDischargeRateMTDay: 21500,
      bulkUnloadingEfficiencyPct: 88,
      demurrageRisk: 'MODERATE',
      demurrageCostPerDayUSD: 24000,
      typicalStages: {
        anchorageWaitHours: 16.5,
        pilotageAndMooringHours: 2.5,
        dischargeOperationsHours: 23.0,
        draftSurveyAndClearanceHours: 2.5
      }
    },
    cranes: {
      totalCranes: 16,
      activeCranesInUse: 12,
      cranesUnderMaintenance: 2,
      standbyCranes: 2,
      craneUtilizationPct: 75.0,
      avgCranesPerBerth: 2.2,
      totalHandlingCapacityTPH: 16800,
      craneList: [
        { id: 'CR-PDP-01', name: 'CSU Unloader Alpha', type: 'Continuous Ship Unloader (CSU)', status: 'ACTIVE', berthAssigned: 'Berth 1 (Mechanized Coal)', capacityTPH: 2200, operatorShift: 'Shift A (Day)', efficiencyPct: 94 },
        { id: 'CR-PDP-02', name: 'CSU Unloader Beta', type: 'Continuous Ship Unloader (CSU)', status: 'ACTIVE', berthAssigned: 'Berth 1 (Mechanized Coal)', capacityTPH: 2200, operatorShift: 'Shift A (Day)', efficiencyPct: 92 },
        { id: 'CR-PDP-03', name: 'Grab Gantry #1', type: 'Grab Gantry Unloader', status: 'ACTIVE', berthAssigned: 'Berth 2 (General Bulk)', capacityTPH: 1400, operatorShift: 'Shift B (Day)', efficiencyPct: 86 },
        { id: 'CR-PDP-04', name: 'Grab Gantry #2', type: 'Grab Gantry Unloader', status: 'ACTIVE', berthAssigned: 'Berth 2 (General Bulk)', capacityTPH: 1400, operatorShift: 'Shift B (Day)', efficiencyPct: 89 },
        { id: 'CR-PDP-05', name: 'Grab Gantry #3', type: 'Grab Gantry Unloader', status: 'ACTIVE', berthAssigned: 'Berth 3 (Fertilizer)', capacityTPH: 1200, operatorShift: 'Shift A (Day)', efficiencyPct: 85 },
        { id: 'CR-PDP-06', name: 'Mobile Harbor #1', type: 'Mobile Harbor Crane', status: 'ACTIVE', berthAssigned: 'Berth 4 (Iron Ore)', capacityTPH: 1100, operatorShift: 'Shift C (Day)', efficiencyPct: 80 },
        { id: 'CR-PDP-07', name: 'Mobile Harbor #2', type: 'Mobile Harbor Crane', status: 'MAINTENANCE', berthAssigned: 'Berth 5 (Dry Dock Yard)', capacityTPH: 1100, operatorShift: 'Maintenance Crew', efficiencyPct: 0 },
        { id: 'CR-PDP-08', name: 'Grab Gantry #4', type: 'Grab Gantry Unloader', status: 'STANDBY', berthAssigned: 'Berth 6 (Reserve Berth)', capacityTPH: 1300, operatorShift: 'Standby Unit', efficiencyPct: 90 }
      ]
    },
    delays: {
      currentWaitTimeHours: 16.5,
      waitTimeRange: '14 - 18 hrs',
      pilotageDelayHours: 2.5,
      customsClearanceHours: 1.8,
      tidalLockDelayHours: 1.5,
      weatherDelayHours: 3.5,
      projectedDelayTrend: 'Steady',
      waitingVesselsQueue: [
        { vesselName: 'MV Ocean Pioneer', vesselClass: 'Panamax (74K DWT)', cargo: 'Thermal Coal', tonnageMT: 72000, waitingSinceHours: 17.5, assignedBerth: 'Berth 1 (Mechanized)', etaBerth: 'Today, 21:30' },
        { vesselName: 'Star Crimson', vesselClass: 'Capesize (152K DWT)', cargo: 'Iron Ore Fines', tonnageMT: 148000, waitingSinceHours: 22.0, assignedBerth: 'Deep Water Anchorage', etaBerth: 'Tomorrow, 06:00' },
        { vesselName: 'Pacific Fortune', vesselClass: 'Supramax (58K DWT)', cargo: 'Coking Coal', tonnageMT: 55000, waitingSinceHours: 13.0, assignedBerth: 'Berth 2 (General Bulk)', etaBerth: 'Today, 18:00' }
      ]
    }
  },
  {
    id: 'visakhapatnam',
    name: 'Visakhapatnam',
    region: 'India East Coast',
    country: 'India',
    status: 'HIGH',
    distanceNM: 5580,
    transitDays: 15.7,
    estDelayHours: '26h+ Delay',
    draftLimitM: 16.5,
    maxLOAM: 280,
    berths: 24,
    waitingVessels: 19,
    notes: 'Inner harbor maintenance creating extended vessel queuing and restricted fairway navigation.',
    coordinates: { lat: 17.6868, lng: 83.2185 },
    lastTelemetryUpdate: '3 mins ago (Port Control VTS)',
    history: {
      congestionIndex: [62, 65, 68, 70, 72, 74, 76, 78, 80, 81, 82, 84],
      turnaroundHours: [40, 42, 44, 46, 48, 50, 52, 54, 55, 56, 57, 58.2],
      waitTimeHours: [18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 28.5]
    },
    weather: {
      condition: 'Partly Cloudy & Moderate Sea',
      temperatureC: 31,
      windSpeedKnots: 13,
      windDirection: 'ESE 13 kts',
      waveHeightM: 1.4,
      visibilityNM: 9.5,
      tideHeightM: 1.9,
      tideStatus: 'High Slack',
      barometricPressureHpa: 1012,
      monsoonAlert: 'Channel Advisory: Tug escort mandatory for all vessels >220m LOA'
    },
    congestion: {
      congestionLevel: 'HIGH',
      congestionIndex: 84,
      berthOccupancyPct: 91,
      anchorageVesselsCount: 19,
      berthedVesselsCount: 21,
      incomingNext48h: 9,
      trend: 'Worsening',
      historicalAverageWaitingVessels: 11.2
    },
    turnaround: {
      avgTurnaroundHours: 58.2,
      avgTurnaroundDays: 2.42,
      historicalNormHours: 38.0,
      avgDischargeRateMTDay: 18200,
      bulkUnloadingEfficiencyPct: 78,
      demurrageRisk: 'HIGH',
      demurrageCostPerDayUSD: 28500,
      typicalStages: {
        anchorageWaitHours: 28.5,
        pilotageAndMooringHours: 4.2,
        dischargeOperationsHours: 22.5,
        draftSurveyAndClearanceHours: 3.0
      }
    },
    cranes: {
      totalCranes: 24,
      activeCranesInUse: 16,
      cranesUnderMaintenance: 4,
      standbyCranes: 4,
      craneUtilizationPct: 66.7,
      avgCranesPerBerth: 2.0,
      totalHandlingCapacityTPH: 21000,
      craneList: [
        { id: 'CR-VZG-01', name: 'Outer Berth Grab Unloader 1', type: 'Grab Gantry Unloader', status: 'ACTIVE', berthAssigned: 'Outer Harbor Berth 1', capacityTPH: 1800, operatorShift: 'Shift 1', efficiencyPct: 88 },
        { id: 'CR-VZG-02', name: 'Outer Berth Grab Unloader 2', type: 'Grab Gantry Unloader', status: 'ACTIVE', berthAssigned: 'Outer Harbor Berth 1', capacityTPH: 1800, operatorShift: 'Shift 1', efficiencyPct: 85 },
        { id: 'CR-VZG-03', name: 'Inner Harbor Crane A', type: 'Mobile Harbor Crane', status: 'MAINTENANCE', berthAssigned: 'Inner Basin Berth 4', capacityTPH: 1000, operatorShift: 'Hydraulic Overhaul', efficiencyPct: 0 },
        { id: 'CR-VZG-04', name: 'Inner Harbor Crane B', type: 'Mobile Harbor Crane', status: 'ACTIVE', berthAssigned: 'Inner Basin Berth 5', capacityTPH: 1000, operatorShift: 'Shift 2', efficiencyPct: 76 },
        { id: 'CR-VZG-05', name: 'Continuous Coal Unloader #1', type: 'Continuous Ship Unloader (CSU)', status: 'ACTIVE', berthAssigned: 'Coal Terminal EQ-1', capacityTPH: 2000, operatorShift: 'Shift 1', efficiencyPct: 91 },
        { id: 'CR-VZG-06', name: 'Continuous Coal Unloader #2', type: 'Continuous Ship Unloader (CSU)', status: 'MAINTENANCE', berthAssigned: 'Coal Terminal EQ-2', capacityTPH: 2000, operatorShift: 'Belt Repair', efficiencyPct: 0 }
      ]
    },
    delays: {
      currentWaitTimeHours: 28.5,
      waitTimeRange: '26 - 34 hrs',
      pilotageDelayHours: 4.2,
      customsClearanceHours: 2.2,
      tidalLockDelayHours: 0.0,
      weatherDelayHours: 1.5,
      projectedDelayTrend: 'Increasing',
      waitingVesselsQueue: [
        { vesselName: 'Cape Osprey', vesselClass: 'Capesize (178K DWT)', cargo: 'Coking Coal', tonnageMT: 165000, waitingSinceHours: 32.0, assignedBerth: 'Outer Harbor Berth 1', etaBerth: 'Tomorrow, 14:00' },
        { vesselName: 'MV Andhra Glory', vesselClass: 'Panamax (82K DWT)', cargo: 'Thermal Coal', tonnageMT: 78000, waitingSinceHours: 29.5, assignedBerth: 'EQ-1 Coal Berth', etaBerth: 'Tomorrow, 08:30' },
        { vesselName: 'Nordic Trader', vesselClass: 'Supramax (63K DWT)', cargo: 'Petcoke', tonnageMT: 60000, waitingSinceHours: 24.0, assignedBerth: 'Inner Basin Berth 5', etaBerth: 'Tomorrow, 20:00' }
      ]
    }
  },
  {
    id: 'gangavaram',
    name: 'Gangavaram',
    region: 'India East Coast',
    country: 'India',
    status: 'NORMAL',
    distanceNM: 5570,
    transitDays: 15.6,
    estDelayHours: '<2h Delay',
    draftLimitM: 18.5,
    maxLOAM: 320,
    berths: 9,
    waitingVessels: 3,
    isOptimal: true,
    notes: 'OPTIMAL ARRIVAL WINDOW: Dedicated deep-water berths open with fast discharge turnaround and ultra-modern CSUs.',
    coordinates: { lat: 17.6186, lng: 83.2389 },
    lastTelemetryUpdate: '1 min ago (Automated Terminal Sensor Feed)',
    history: {
      congestionIndex: [45, 42, 40, 38, 36, 34, 33, 31, 30, 29, 28, 28],
      turnaroundHours: [30, 29, 28, 27, 27, 26, 26, 25, 25, 24.9, 24.8, 24.8],
      waitTimeHours: [4, 3.8, 3.5, 3.2, 3, 2.8, 2.5, 2.3, 2.1, 2.0, 1.9, 1.8]
    },
    weather: {
      condition: 'Clear Skies & Calm Waters',
      temperatureC: 28,
      windSpeedKnots: 8,
      windDirection: 'SE 8 kts',
      waveHeightM: 0.8,
      visibilityNM: 12.0,
      tideHeightM: 1.4,
      tideStatus: 'High Slack',
      barometricPressureHpa: 1014,
      monsoonAlert: null
    },
    congestion: {
      congestionLevel: 'LOW',
      congestionIndex: 28,
      berthOccupancyPct: 44,
      anchorageVesselsCount: 3,
      berthedVesselsCount: 5,
      incomingNext48h: 4,
      trend: 'Improving',
      historicalAverageWaitingVessels: 4.0
    },
    turnaround: {
      avgTurnaroundHours: 24.8,
      avgTurnaroundDays: 1.03,
      historicalNormHours: 26.0,
      avgDischargeRateMTDay: 32500,
      bulkUnloadingEfficiencyPct: 96,
      demurrageRisk: 'LOW',
      demurrageCostPerDayUSD: 22000,
      typicalStages: {
        anchorageWaitHours: 1.8,
        pilotageAndMooringHours: 1.2,
        dischargeOperationsHours: 20.0,
        draftSurveyAndClearanceHours: 1.8
      }
    },
    cranes: {
      totalCranes: 12,
      activeCranesInUse: 10,
      cranesUnderMaintenance: 0,
      standbyCranes: 2,
      craneUtilizationPct: 83.3,
      avgCranesPerBerth: 3.0,
      totalHandlingCapacityTPH: 22500,
      craneList: [
        { id: 'CR-GGV-01', name: 'High-Speed CSU #1', type: 'Continuous Ship Unloader (CSU)', status: 'ACTIVE', berthAssigned: 'Berth 1 (Deep Water Coal)', capacityTPH: 2500, operatorShift: 'Automated Shift A', efficiencyPct: 98 },
        { id: 'CR-GGV-02', name: 'High-Speed CSU #2', type: 'Continuous Ship Unloader (CSU)', status: 'ACTIVE', berthAssigned: 'Berth 1 (Deep Water Coal)', capacityTPH: 2500, operatorShift: 'Automated Shift A', efficiencyPct: 97 },
        { id: 'CR-GGV-03', name: 'High-Speed CSU #3', type: 'Continuous Ship Unloader (CSU)', status: 'ACTIVE', berthAssigned: 'Berth 2 (Deep Water Coal)', capacityTPH: 2500, operatorShift: 'Automated Shift B', efficiencyPct: 95 },
        { id: 'CR-GGV-04', name: 'Heavy Grab Gantry A', type: 'Grab Gantry Unloader', status: 'ACTIVE', berthAssigned: 'Berth 3 (Bauxite / Ores)', capacityTPH: 2000, operatorShift: 'Shift 1', efficiencyPct: 94 },
        { id: 'CR-GGV-05', name: 'Heavy Grab Gantry B', type: 'Grab Gantry Unloader', status: 'ACTIVE', berthAssigned: 'Berth 3 (Bauxite / Ores)', capacityTPH: 2000, operatorShift: 'Shift 1', efficiencyPct: 93 },
        { id: 'CR-GGV-06', name: 'Mobile Crane Multi-1', type: 'Mobile Harbor Crane', status: 'STANDBY', berthAssigned: 'Berth 4 (Multi-purpose)', capacityTPH: 1200, operatorShift: 'Standby Hot', efficiencyPct: 92 }
      ]
    },
    delays: {
      currentWaitTimeHours: 1.8,
      waitTimeRange: '< 2 hrs',
      pilotageDelayHours: 0.5,
      customsClearanceHours: 0.8,
      tidalLockDelayHours: 0.0,
      weatherDelayHours: 0.0,
      projectedDelayTrend: 'Decreasing',
      waitingVesselsQueue: [
        { vesselName: 'MV Southern Cross', vesselClass: 'Capesize (180K DWT)', cargo: 'Coking Coal', tonnageMT: 172000, waitingSinceHours: 1.5, assignedBerth: 'Berth 1 (Deep Water)', etaBerth: 'Immediate (16:15)' },
        { vesselName: 'Gladstone Star', vesselClass: 'Panamax (82K DWT)', cargo: 'Bauxite', tonnageMT: 79000, waitingSinceHours: 2.0, assignedBerth: 'Berth 3 (Ores)', etaBerth: 'Today, 19:00' }
      ]
    }
  },
  {
    id: 'gopalpur',
    name: 'Gopalpur',
    region: 'India East Coast',
    country: 'India',
    status: 'MODERATE',
    distanceNM: 5595,
    transitDays: 15.7,
    estDelayHours: '8-12h Delay',
    draftLimitM: 13.0,
    maxLOAM: 230,
    berths: 4,
    waitingVessels: 5,
    notes: 'Feeder bulk access only; restricted draft for large gearless Panamax. Tidal window monitoring mandatory.',
    coordinates: { lat: 19.3082, lng: 84.9664 },
    lastTelemetryUpdate: '12 mins ago (Port Station Report)',
    history: {
      congestionIndex: [52, 54, 53, 56, 55, 57, 54, 56, 55, 54, 56, 55],
      turnaroundHours: [50, 51, 53, 50, 52, 54, 51, 53, 52, 51, 53, 52],
      waitTimeHours: [9, 9.5, 10, 9.2, 9.8, 10.2, 9.5, 9.8, 10, 9.6, 9.9, 9.8]
    },
    weather: {
      condition: 'Scattered Clouds & Coastal Swell',
      temperatureC: 30,
      windSpeedKnots: 15,
      windDirection: 'S 15 kts',
      waveHeightM: 1.7,
      visibilityNM: 8.0,
      tideHeightM: 2.1,
      tideStatus: 'Ebb Tide',
      barometricPressureHpa: 1010,
      monsoonAlert: 'Draft Alert: Max arrival draft during low tide is 12.2m'
    },
    congestion: {
      congestionLevel: 'MODERATE',
      congestionIndex: 55,
      berthOccupancyPct: 75,
      anchorageVesselsCount: 5,
      berthedVesselsCount: 3,
      incomingNext48h: 3,
      trend: 'Stable',
      historicalAverageWaitingVessels: 3.5
    },
    turnaround: {
      avgTurnaroundHours: 52.0,
      avgTurnaroundDays: 2.16,
      historicalNormHours: 42.0,
      avgDischargeRateMTDay: 12500,
      bulkUnloadingEfficiencyPct: 74,
      demurrageRisk: 'MODERATE',
      demurrageCostPerDayUSD: 20000,
      typicalStages: {
        anchorageWaitHours: 10.5,
        pilotageAndMooringHours: 2.5,
        dischargeOperationsHours: 36.5,
        draftSurveyAndClearanceHours: 2.5
      }
    },
    cranes: {
      totalCranes: 6,
      activeCranesInUse: 4,
      cranesUnderMaintenance: 1,
      standbyCranes: 1,
      craneUtilizationPct: 66.7,
      avgCranesPerBerth: 1.5,
      totalHandlingCapacityTPH: 5200,
      craneList: [
        { id: 'CR-GPL-01', name: 'Mobile Gottwald Crane #1', type: 'Mobile Harbor Crane', status: 'ACTIVE', berthAssigned: 'Berth 1 (Bulk)', capacityTPH: 950, operatorShift: 'Day Shift', efficiencyPct: 82 },
        { id: 'CR-GPL-02', name: 'Mobile Gottwald Crane #2', type: 'Mobile Harbor Crane', status: 'ACTIVE', berthAssigned: 'Berth 1 (Bulk)', capacityTPH: 950, operatorShift: 'Day Shift', efficiencyPct: 80 },
        { id: 'CR-GPL-03', name: 'Mobile Harbor Crane #3', type: 'Mobile Harbor Crane', status: 'ACTIVE', berthAssigned: 'Berth 2 (Fertilizer)', capacityTPH: 800, operatorShift: 'Day Shift', efficiencyPct: 75 },
        { id: 'CR-GPL-04', name: 'Mobile Harbor Crane #4', type: 'Mobile Harbor Crane', status: 'MAINTENANCE', berthAssigned: 'Berth 3', capacityTPH: 800, operatorShift: 'Scheduled Maintenance', efficiencyPct: 0 }
      ]
    },
    delays: {
      currentWaitTimeHours: 9.8,
      waitTimeRange: '8 - 12 hrs',
      pilotageDelayHours: 1.8,
      customsClearanceHours: 1.5,
      tidalLockDelayHours: 4.2,
      weatherDelayHours: 2.3,
      projectedDelayTrend: 'Steady',
      waitingVesselsQueue: [
        { vesselName: 'MV Bengal Breeze', vesselClass: 'Supramax (56K DWT)', cargo: 'Ilmenite Sand', tonnageMT: 50000, waitingSinceHours: 10.2, assignedBerth: 'Berth 1', etaBerth: 'Today, 23:00' },
        { vesselName: 'Coromandel Glory', vesselClass: 'Handymax (45K DWT)', cargo: 'Rock Phosphate', tonnageMT: 42000, waitingSinceHours: 8.5, assignedBerth: 'Berth 2', etaBerth: 'Tomorrow, 07:00' }
      ]
    }
  },
  {
    id: 'haldia',
    name: 'Haldia',
    region: 'India East Coast',
    country: 'India',
    status: 'HIGH',
    distanceNM: 5740,
    transitDays: 16.2,
    estDelayHours: '32h+ Delay',
    draftLimitM: 10.5,
    maxLOAM: 210,
    berths: 14,
    waitingVessels: 15,
    notes: 'Tidal restrictions and lock-gate scheduling delays. Mandatory draft lightening often required at Sandheads.',
    coordinates: { lat: 22.0232, lng: 88.0837 },
    lastTelemetryUpdate: '8 mins ago (Haldia Dock Complex AIS)',
    history: {
      congestionIndex: [70, 73, 76, 78, 80, 82, 84, 86, 88, 90, 91, 92],
      turnaroundHours: [50, 52, 54, 56, 58, 60, 61, 62, 63, 64, 65, 66.4],
      waitTimeHours: [24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 34.5]
    },
    weather: {
      condition: 'River Fog & Monsoon Precipitation',
      temperatureC: 27,
      windSpeedKnots: 14,
      windDirection: 'SSW 14 kts',
      waveHeightM: 1.1,
      visibilityNM: 4.5,
      tideHeightM: 3.6,
      tideStatus: 'Flood Tide',
      barometricPressureHpa: 1009,
      monsoonAlert: 'Lock Gate Restriction: River Hooghly siltation warning; low visibility slow speed order in place'
    },
    congestion: {
      congestionLevel: 'CRITICAL',
      congestionIndex: 92,
      berthOccupancyPct: 95,
      anchorageVesselsCount: 15,
      berthedVesselsCount: 12,
      incomingNext48h: 7,
      trend: 'Worsening',
      historicalAverageWaitingVessels: 9.8
    },
    turnaround: {
      avgTurnaroundHours: 66.4,
      avgTurnaroundDays: 2.76,
      historicalNormHours: 46.0,
      avgDischargeRateMTDay: 14000,
      bulkUnloadingEfficiencyPct: 68,
      demurrageRisk: 'SEVERE',
      demurrageCostPerDayUSD: 26000,
      typicalStages: {
        anchorageWaitHours: 34.0,
        pilotageAndMooringHours: 5.5,
        dischargeOperationsHours: 23.5,
        draftSurveyAndClearanceHours: 3.4
      }
    },
    cranes: {
      totalCranes: 14,
      activeCranesInUse: 9,
      cranesUnderMaintenance: 3,
      standbyCranes: 2,
      craneUtilizationPct: 64.3,
      avgCranesPerBerth: 1.6,
      totalHandlingCapacityTPH: 11200,
      craneList: [
        { id: 'CR-HLD-01', name: 'Lock Basin Grab Unloader 1', type: 'Grab Gantry Unloader', status: 'ACTIVE', berthAssigned: 'Berth 2 (Coal)', capacityTPH: 1200, operatorShift: 'Shift 1', efficiencyPct: 75 },
        { id: 'CR-HLD-02', name: 'Lock Basin Grab Unloader 2', type: 'Grab Gantry Unloader', status: 'ACTIVE', berthAssigned: 'Berth 2 (Coal)', capacityTPH: 1200, operatorShift: 'Shift 1', efficiencyPct: 72 },
        { id: 'CR-HLD-03', name: 'Fingered Berth Crane #1', type: 'Mobile Harbor Crane', status: 'MAINTENANCE', berthAssigned: 'Berth 4B', capacityTPH: 800, operatorShift: 'Slewing Ring Overhaul', efficiencyPct: 0 },
        { id: 'CR-HLD-04', name: 'Fingered Berth Crane #2', type: 'Mobile Harbor Crane', status: 'ACTIVE', berthAssigned: 'Berth 4B', capacityTPH: 800, operatorShift: 'Shift 2', efficiencyPct: 70 },
        { id: 'CR-HLD-05', name: 'Coal Gantry Unloader #3', type: 'Grab Gantry Unloader', status: 'MAINTENANCE', berthAssigned: 'Berth 8', capacityTPH: 1100, operatorShift: 'Electrical Fault', efficiencyPct: 0 }
      ]
    },
    delays: {
      currentWaitTimeHours: 34.5,
      waitTimeRange: '30 - 38 hrs',
      pilotageDelayHours: 5.5,
      customsClearanceHours: 2.8,
      tidalLockDelayHours: 9.5,
      weatherDelayHours: 4.0,
      projectedDelayTrend: 'Increasing',
      waitingVesselsQueue: [
        { vesselName: 'MV Hooghly Star', vesselClass: 'Supramax (55K DWT)', cargo: 'Coking Coal', tonnageMT: 48000, waitingSinceHours: 36.0, assignedBerth: 'Berth 2 (Lock Basin)', etaBerth: 'Tomorrow, 16:00 (Next High Tide)' },
        { vesselName: 'Eastern Venture', vesselClass: 'Handymax (42K DWT)', cargo: 'Manganese Ore', tonnageMT: 39000, waitingSinceHours: 31.0, assignedBerth: 'Berth 4B', etaBerth: 'Tomorrow, 22:00' }
      ]
    }
  },
  {
    id: 'dhamra',
    name: 'Dhamra',
    region: 'India East Coast',
    country: 'India',
    status: 'NORMAL',
    distanceNM: 5630,
    transitDays: 15.9,
    estDelayHours: '3-5h Delay',
    draftLimitM: 18.0,
    maxLOAM: 320,
    berths: 8,
    waitingVessels: 4,
    notes: 'Modern deep-draft private port with high mechanized discharge and direct conveyor links to storage yards.',
    coordinates: { lat: 20.8197, lng: 86.9742 },
    lastTelemetryUpdate: '4 mins ago (Dhamra Port Radar)',
    history: {
      congestionIndex: [48, 46, 44, 42, 40, 39, 38, 37, 36, 35, 34, 34],
      turnaroundHours: [32, 31.5, 31, 30.5, 30, 29.5, 29, 28.8, 28.5, 28.3, 28.2, 28.2],
      waitTimeHours: [6, 5.8, 5.5, 5.2, 5, 4.8, 4.6, 4.4, 4.3, 4.2, 4.2, 4.2]
    },
    weather: {
      condition: 'Clear Skies & Light Breeze',
      temperatureC: 29,
      windSpeedKnots: 10,
      windDirection: 'S 10 kts',
      waveHeightM: 1.0,
      visibilityNM: 11.0,
      tideHeightM: 2.2,
      tideStatus: 'Flood Tide',
      barometricPressureHpa: 1013,
      monsoonAlert: null
    },
    congestion: {
      congestionLevel: 'LOW',
      congestionIndex: 34,
      berthOccupancyPct: 52,
      anchorageVesselsCount: 4,
      berthedVesselsCount: 5,
      incomingNext48h: 5,
      trend: 'Improving',
      historicalAverageWaitingVessels: 3.8
    },
    turnaround: {
      avgTurnaroundHours: 28.2,
      avgTurnaroundDays: 1.17,
      historicalNormHours: 27.0,
      avgDischargeRateMTDay: 29000,
      bulkUnloadingEfficiencyPct: 92,
      demurrageRisk: 'LOW',
      demurrageCostPerDayUSD: 24000,
      typicalStages: {
        anchorageWaitHours: 4.2,
        pilotageAndMooringHours: 1.5,
        dischargeOperationsHours: 20.5,
        draftSurveyAndClearanceHours: 2.0
      }
    },
    cranes: {
      totalCranes: 10,
      activeCranesInUse: 8,
      cranesUnderMaintenance: 1,
      standbyCranes: 1,
      craneUtilizationPct: 80.0,
      avgCranesPerBerth: 2.8,
      totalHandlingCapacityTPH: 18000,
      craneList: [
        { id: 'CR-DHM-01', name: 'Continuous Coal Unloader #1', type: 'Continuous Ship Unloader (CSU)', status: 'ACTIVE', berthAssigned: 'Berth 1 (Bulk)', capacityTPH: 2400, operatorShift: 'Shift A', efficiencyPct: 96 },
        { id: 'CR-DHM-02', name: 'Continuous Coal Unloader #2', type: 'Continuous Ship Unloader (CSU)', status: 'ACTIVE', berthAssigned: 'Berth 1 (Bulk)', capacityTPH: 2400, operatorShift: 'Shift A', efficiencyPct: 94 },
        { id: 'CR-DHM-03', name: 'Grab Gantry Unloader #1', type: 'Grab Gantry Unloader', status: 'ACTIVE', berthAssigned: 'Berth 2 (Ore / Lime)', capacityTPH: 1800, operatorShift: 'Shift B', efficiencyPct: 90 },
        { id: 'CR-DHM-04', name: 'Grab Gantry Unloader #2', type: 'Grab Gantry Unloader', status: 'STANDBY', berthAssigned: 'Berth 2 (Ore / Lime)', capacityTPH: 1800, operatorShift: 'Hot Standby', efficiencyPct: 90 }
      ]
    },
    delays: {
      currentWaitTimeHours: 4.2,
      waitTimeRange: '3 - 5 hrs',
      pilotageDelayHours: 1.0,
      customsClearanceHours: 1.0,
      tidalLockDelayHours: 0.0,
      weatherDelayHours: 0.8,
      projectedDelayTrend: 'Steady',
      waitingVesselsQueue: [
        { vesselName: 'MV Odisha Valour', vesselClass: 'Capesize (175K DWT)', cargo: 'Coking Coal', tonnageMT: 160000, waitingSinceHours: 3.5, assignedBerth: 'Berth 1 (Deep Water)', etaBerth: 'Today, 20:00' }
      ]
    }
  },
  {
    id: 'newcastle',
    name: 'Newcastle',
    region: 'Australia East Coast',
    country: 'Australia',
    status: 'NORMAL',
    distanceNM: 5612,
    transitDays: 15.8,
    estDelayHours: '10-14h Loading Queue',
    draftLimitM: 15.2,
    maxLOAM: 300,
    berths: 12,
    waitingVessels: 11,
    notes: "World's largest coal export hub (PWCS Kooragang/Carrington + NCIG terminals). High-speed shiploaders sustain premium loading rates; queue driven by ballaster arrival waves, not infrastructure limits.",
    coordinates: { lat: -32.92, lng: 151.78 },
    lastTelemetryUpdate: '6 mins ago (Port Authority of NSW AIS Feed)',
    history: {
      congestionIndex: [58, 56, 54, 52, 50, 48, 47, 46, 45, 44, 43, 42],
      turnaroundHours: [42, 41, 40, 39, 38, 37, 36.5, 36, 35.5, 35, 34.5, 34.0],
      waitTimeHours: [18, 17, 16.5, 16, 15.5, 15, 14.8, 14.5, 14.2, 14, 13.8, 13.5]
    },
    weather: {
      condition: 'Fresh SE Trade Breeze & Moderate Swell',
      temperatureC: 19,
      windSpeedKnots: 17,
      windDirection: 'SE 17 kts',
      waveHeightM: 1.6,
      visibilityNM: 10.5,
      tideHeightM: 1.3,
      tideStatus: 'Ebb Tide',
      barometricPressureHpa: 1018,
      monsoonAlert: null
    },
    congestion: {
      congestionLevel: 'MODERATE',
      congestionIndex: 42,
      berthOccupancyPct: 68,
      anchorageVesselsCount: 11,
      berthedVesselsCount: 9,
      incomingNext48h: 6,
      trend: 'Improving',
      historicalAverageWaitingVessels: 12.5
    },
    turnaround: {
      avgTurnaroundHours: 34.0,
      avgTurnaroundDays: 1.42,
      historicalNormHours: 40.0,
      avgDischargeRateMTDay: 420000,
      bulkUnloadingEfficiencyPct: 91,
      demurrageRisk: 'LOW',
      demurrageCostPerDayUSD: 21000,
      typicalStages: {
        anchorageWaitHours: 13.5,
        pilotageAndMooringHours: 2.0,
        dischargeOperationsHours: 16.5,
        draftSurveyAndClearanceHours: 2.0
      }
    },
    cranes: {
      totalCranes: 9,
      activeCranesInUse: 8,
      cranesUnderMaintenance: 1,
      standbyCranes: 0,
      craneUtilizationPct: 88.9,
      avgCranesPerBerth: 1.5,
      totalHandlingCapacityTPH: 24500,
      craneList: [
        { id: 'CR-NTL-01', name: 'PWCS Shiploader #1', type: 'High-Speed Shiploader', status: 'ACTIVE', berthAssigned: 'Kooragang Berth 1', capacityTPH: 4800, operatorShift: 'Shift A', efficiencyPct: 95 },
        { id: 'CR-NTL-02', name: 'PWCS Shiploader #2', type: 'High-Speed Shiploader', status: 'ACTIVE', berthAssigned: 'Kooragang Berth 2', capacityTPH: 4800, operatorShift: 'Shift A', efficiencyPct: 93 },
        { id: 'CR-NTL-03', name: 'NCIG Shiploader Alpha', type: 'High-Speed Shiploader', status: 'ACTIVE', berthAssigned: 'NCIG Berth 4', capacityTPH: 6000, operatorShift: 'Shift B', efficiencyPct: 97 },
        { id: 'CR-NTL-04', name: 'Carrington Shiploader #3', type: 'High-Speed Shiploader', status: 'MAINTENANCE', berthAssigned: 'Carrington Berth 3', capacityTPH: 4200, operatorShift: 'Chute Overhaul', efficiencyPct: 0 }
      ]
    },
    delays: {
      currentWaitTimeHours: 13.5,
      waitTimeRange: '10 - 14 hrs',
      pilotageDelayHours: 2.0,
      customsClearanceHours: 1.2,
      tidalLockDelayHours: 0.0,
      weatherDelayHours: 1.0,
      projectedDelayTrend: 'Decreasing',
      waitingVesselsQueue: [
        { vesselName: 'MV Coral Trader', vesselClass: 'Panamax (76K DWT)', cargo: 'Thermal Coal', tonnageMT: 74500, waitingSinceHours: 14.0, assignedBerth: 'Kooragang Berth 1', etaBerth: 'Today, 22:00' },
        { vesselName: 'Ocean Kestrel', vesselClass: 'Kamsarmax (82K DWT)', cargo: 'Thermal Coal', tonnageMT: 79000, waitingSinceHours: 11.5, assignedBerth: 'NCIG Berth 4', etaBerth: 'Tomorrow, 04:00' }
      ]
    }
  },
  {
    id: 'gladstone',
    name: 'Gladstone',
    region: 'Australia East Coast',
    country: 'Australia',
    status: 'NORMAL',
    distanceNM: 5480,
    transitDays: 15.4,
    estDelayHours: '6-10h Loading Queue',
    draftLimitM: 17.5,
    maxLOAM: 315,
    berths: 7,
    waitingVessels: 6,
    isOptimal: true,
    notes: 'RG Tanna Coal Terminal offers deep-water Capesize loading with minimal queueing. Alumina and bauxite berths share swing basin, occasionally cross-scheduling with coal stems.',
    coordinates: { lat: -23.84, lng: 151.26 },
    lastTelemetryUpdate: '9 mins ago (Gladstone Ports Corporation VTS)',
    history: {
      congestionIndex: [38, 36, 35, 33, 32, 30, 29, 28, 27, 26, 25, 24],
      turnaroundHours: [30, 29, 28.5, 28, 27.5, 27, 26.5, 26, 25.8, 25.5, 25.2, 25.0],
      waitTimeHours: [9, 8.6, 8.2, 8.0, 7.8, 7.5, 7.2, 7.0, 6.8, 6.6, 6.4, 6.2]
    },
    weather: {
      condition: 'Clear Skies & Light Trade Wind',
      temperatureC: 24,
      windSpeedKnots: 11,
      windDirection: 'ESE 11 kts',
      waveHeightM: 1.0,
      visibilityNM: 12.0,
      tideHeightM: 2.6,
      tideStatus: 'High Slack',
      barometricPressureHpa: 1016,
      monsoonAlert: null
    },
    congestion: {
      congestionLevel: 'LOW',
      congestionIndex: 24,
      berthOccupancyPct: 51,
      anchorageVesselsCount: 6,
      berthedVesselsCount: 5,
      incomingNext48h: 4,
      trend: 'Improving',
      historicalAverageWaitingVessels: 7.0
    },
    turnaround: {
      avgTurnaroundHours: 25.0,
      avgTurnaroundDays: 1.04,
      historicalNormHours: 28.0,
      avgDischargeRateMTDay: 385000,
      bulkUnloadingEfficiencyPct: 94,
      demurrageRisk: 'LOW',
      demurrageCostPerDayUSD: 22500,
      typicalStages: {
        anchorageWaitHours: 6.2,
        pilotageAndMooringHours: 1.8,
        dischargeOperationsHours: 15.0,
        draftSurveyAndClearanceHours: 2.0
      }
    },
    cranes: {
      totalCranes: 6,
      activeCranesInUse: 6,
      cranesUnderMaintenance: 0,
      standbyCranes: 0,
      craneUtilizationPct: 100.0,
      avgCranesPerBerth: 0.9,
      totalHandlingCapacityTPH: 27000,
      craneList: [
        { id: 'CR-GLD-01', name: 'RG Tanna Shiploader #1', type: 'High-Speed Shiploader', status: 'ACTIVE', berthAssigned: 'RG Tanna Berth 1', capacityTPH: 6500, operatorShift: 'Shift A', efficiencyPct: 96 },
        { id: 'CR-GLD-02', name: 'RG Tanna Shiploader #2', type: 'High-Speed Shiploader', status: 'ACTIVE', berthAssigned: 'RG Tanna Berth 2', capacityTPH: 6500, operatorShift: 'Shift A', efficiencyPct: 95 },
        { id: 'CR-GLD-03', name: 'Barney Point Shiploader', type: 'High-Speed Shiploader', status: 'ACTIVE', berthAssigned: 'Barney Point Berth', capacityTPH: 4000, operatorShift: 'Shift B', efficiencyPct: 90 }
      ]
    },
    delays: {
      currentWaitTimeHours: 6.2,
      waitTimeRange: '6 - 10 hrs',
      pilotageDelayHours: 1.8,
      customsClearanceHours: 1.0,
      tidalLockDelayHours: 0.0,
      weatherDelayHours: 0.4,
      projectedDelayTrend: 'Steady',
      waitingVesselsQueue: [
        { vesselName: 'Gladstone Star', vesselClass: 'Panamax (82K DWT)', cargo: 'Bauxite', tonnageMT: 79000, waitingSinceHours: 2.0, assignedBerth: 'Barney Point Berth', etaBerth: 'Today, 19:00' }
      ]
    }
  },
  {
    id: 'port_hedland',
    name: 'Port Hedland',
    region: 'Australia West Coast',
    country: 'Australia',
    status: 'NORMAL',
    distanceNM: 3950,
    transitDays: 11.1,
    estDelayHours: '8-12h Loading Queue',
    draftLimitM: 19.5,
    maxLOAM: 330,
    berths: 5,
    waitingVessels: 9,
    notes: "World's largest bulk export port by tonnage (iron ore dominant). Utah Point multi-user facility handles junior miners' cargo; tidal windows govern Capesize/Newcastlemax sailing drafts.",
    coordinates: { lat: -20.31, lng: 118.57 },
    lastTelemetryUpdate: '7 mins ago (Pilbara Ports Authority VTS)',
    history: {
      congestionIndex: [40, 42, 41, 43, 45, 44, 46, 45, 47, 46, 48, 47],
      turnaroundHours: [22, 22.5, 23, 23.2, 23.5, 23.8, 24, 24.2, 24.4, 24.6, 24.8, 25.0],
      waitTimeHours: [8, 8.2, 8.5, 8.8, 9.0, 9.2, 9.4, 9.6, 9.8, 10.0, 10.2, 10.5]
    },
    weather: {
      condition: 'Hot & Dry with Offshore Breeze',
      temperatureC: 34,
      windSpeedKnots: 14,
      windDirection: 'SE 14 kts',
      waveHeightM: 0.9,
      visibilityNM: 13.0,
      tideHeightM: 4.8,
      tideStatus: 'Flood Tide',
      barometricPressureHpa: 1011,
      monsoonAlert: 'Cyclone Season Advisory: Tropical low tracking offshore, monitor for potential port closure'
    },
    congestion: {
      congestionLevel: 'MODERATE',
      congestionIndex: 47,
      berthOccupancyPct: 74,
      anchorageVesselsCount: 9,
      berthedVesselsCount: 6,
      incomingNext48h: 5,
      trend: 'Worsening',
      historicalAverageWaitingVessels: 7.5
    },
    turnaround: {
      avgTurnaroundHours: 25.0,
      avgTurnaroundDays: 1.04,
      historicalNormHours: 22.0,
      avgDischargeRateMTDay: 410000,
      bulkUnloadingEfficiencyPct: 90,
      demurrageRisk: 'MODERATE',
      demurrageCostPerDayUSD: 27000,
      typicalStages: {
        anchorageWaitHours: 10.5,
        pilotageAndMooringHours: 2.5,
        dischargeOperationsHours: 10.0,
        draftSurveyAndClearanceHours: 2.0
      }
    },
    cranes: {
      totalCranes: 5,
      activeCranesInUse: 4,
      cranesUnderMaintenance: 1,
      standbyCranes: 0,
      craneUtilizationPct: 80.0,
      avgCranesPerBerth: 1.0,
      totalHandlingCapacityTPH: 22000,
      craneList: [
        { id: 'CR-PHE-01', name: 'Utah Point Shiploader #1', type: 'High-Speed Shiploader', status: 'ACTIVE', berthAssigned: 'Utah Point Berth 1', capacityTPH: 5500, operatorShift: 'Shift A', efficiencyPct: 92 },
        { id: 'CR-PHE-02', name: 'Utah Point Shiploader #2', type: 'High-Speed Shiploader', status: 'MAINTENANCE', berthAssigned: 'Utah Point Berth 2', capacityTPH: 5500, operatorShift: 'Boom Inspection', efficiencyPct: 0 }
      ]
    },
    delays: {
      currentWaitTimeHours: 10.5,
      waitTimeRange: '8 - 12 hrs',
      pilotageDelayHours: 2.5,
      customsClearanceHours: 1.0,
      tidalLockDelayHours: 3.5,
      weatherDelayHours: 1.5,
      projectedDelayTrend: 'Increasing',
      waitingVesselsQueue: [
        { vesselName: 'MV Cape Osprey', vesselClass: 'Newcastlemax (208K DWT)', cargo: 'Iron Ore', tonnageMT: 204500, waitingSinceHours: 6.0, assignedBerth: 'Utah Point Berth 1', etaBerth: 'Today, 21:00' }
      ]
    }
  },
  {
    id: 'taboneo',
    name: 'Taboneo',
    region: 'Kalimantan, Indonesia',
    country: 'Indonesia',
    status: 'NORMAL',
    distanceNM: 2680,
    transitDays: 7.5,
    estDelayHours: '18-24h Anchorage Wait',
    draftLimitM: 16.0,
    maxLOAM: 290,
    berths: 0,
    waitingVessels: 14,
    notes: 'Open-sea floating-crane transshipment anchorage; barges feed mother vessels directly from Kalimantan river mouths. No fixed berths — throughput depends on barge fleet availability and swell conditions.',
    coordinates: { lat: -3.72, lng: 114.47 },
    lastTelemetryUpdate: '15 mins ago (Taboneo Anchorage Harbor Master Report)',
    history: {
      congestionIndex: [50, 52, 54, 53, 55, 57, 56, 58, 57, 59, 58, 60],
      turnaroundHours: [58, 59, 60, 61, 62, 63, 64, 64.5, 65, 65.5, 66, 66.5],
      waitTimeHours: [19, 19.5, 20, 20.5, 21, 21.2, 21.5, 21.8, 22, 22.2, 22.5, 22.8]
    },
    weather: {
      condition: 'Tropical Haze with Afternoon Squalls',
      temperatureC: 30,
      windSpeedKnots: 10,
      windDirection: 'S 10 kts',
      waveHeightM: 1.1,
      visibilityNM: 6.5,
      tideHeightM: 1.8,
      tideStatus: 'Ebb Tide',
      barometricPressureHpa: 1009,
      monsoonAlert: 'Afternoon Convective Squalls: Intermittent barging halts 14:00-17:00 local'
    },
    congestion: {
      congestionLevel: 'MODERATE',
      congestionIndex: 60,
      berthOccupancyPct: 0,
      anchorageVesselsCount: 14,
      berthedVesselsCount: 0,
      incomingNext48h: 7,
      trend: 'Worsening',
      historicalAverageWaitingVessels: 10.5
    },
    turnaround: {
      avgTurnaroundHours: 66.5,
      avgTurnaroundDays: 2.77,
      historicalNormHours: 54.0,
      avgDischargeRateMTDay: 16500,
      bulkUnloadingEfficiencyPct: 70,
      demurrageRisk: 'MODERATE',
      demurrageCostPerDayUSD: 19500,
      typicalStages: {
        anchorageWaitHours: 22.8,
        pilotageAndMooringHours: 0.0,
        dischargeOperationsHours: 40.0,
        draftSurveyAndClearanceHours: 3.7
      }
    },
    cranes: {
      totalCranes: 8,
      activeCranesInUse: 6,
      cranesUnderMaintenance: 1,
      standbyCranes: 1,
      craneUtilizationPct: 75.0,
      avgCranesPerBerth: 0,
      totalHandlingCapacityTPH: 7200,
      craneList: [
        { id: 'CR-TAB-01', name: 'Floating Crane Barge Alpha', type: 'Mobile Harbor Crane', status: 'ACTIVE', berthAssigned: 'Anchorage Sector A', capacityTPH: 1200, operatorShift: 'Day Ops', efficiencyPct: 78 },
        { id: 'CR-TAB-02', name: 'Floating Crane Barge Beta', type: 'Mobile Harbor Crane', status: 'ACTIVE', berthAssigned: 'Anchorage Sector B', capacityTPH: 1200, operatorShift: 'Day Ops', efficiencyPct: 74 },
        { id: 'CR-TAB-03', name: 'Floating Crane Barge Gamma', type: 'Mobile Harbor Crane', status: 'MAINTENANCE', berthAssigned: 'Anchorage Sector C', capacityTPH: 1100, operatorShift: 'Hydraulic Repair', efficiencyPct: 0 }
      ]
    },
    delays: {
      currentWaitTimeHours: 22.8,
      waitTimeRange: '18 - 24 hrs',
      pilotageDelayHours: 0.0,
      customsClearanceHours: 2.5,
      tidalLockDelayHours: 0.0,
      weatherDelayHours: 4.5,
      projectedDelayTrend: 'Increasing',
      waitingVesselsQueue: [
        { vesselName: 'MV Bharat Samudra', vesselClass: 'Panamax (75K DWT)', cargo: 'Steam Coal', tonnageMT: 73200, waitingSinceHours: 18.0, assignedBerth: 'Anchorage Sector A', etaBerth: 'Loaded / Departed' }
      ]
    }
  },
  {
    id: 'richards_bay',
    name: 'Richards Bay',
    region: 'KwaZulu-Natal, South Africa',
    country: 'South Africa',
    status: 'MODERATE',
    distanceNM: 4780,
    transitDays: 13.5,
    estDelayHours: '24-32h Loading Queue',
    draftLimitM: 17.5,
    maxLOAM: 315,
    berths: 4,
    waitingVessels: 11,
    notes: 'RBCT is the largest single coal export terminal by design capacity, but is rail-fed via a single dedicated corridor from Mpumalanga — any rail disruption immediately backs up the loading queue.',
    coordinates: { lat: -28.80, lng: 32.05 },
    lastTelemetryUpdate: '11 mins ago (Transnet Port Terminals Dispatch)',
    history: {
      congestionIndex: [55, 58, 60, 62, 64, 65, 67, 68, 69, 70, 71, 72],
      turnaroundHours: [47, 49, 51, 53, 55, 57, 59, 61, 63, 64, 64.5, 65.0],
      waitTimeHours: [20, 21, 22, 23, 24, 24.5, 25, 25.5, 26, 26.5, 27, 27.5]
    },
    weather: {
      condition: 'Warm Indian Ocean Swell',
      temperatureC: 25,
      windSpeedKnots: 16,
      windDirection: 'NE 16 kts',
      waveHeightM: 2.0,
      visibilityNM: 9.0,
      tideHeightM: 1.5,
      tideStatus: 'Flood Tide',
      barometricPressureHpa: 1015,
      monsoonAlert: null
    },
    congestion: {
      congestionLevel: 'HIGH',
      congestionIndex: 72,
      berthOccupancyPct: 87,
      anchorageVesselsCount: 11,
      berthedVesselsCount: 4,
      incomingNext48h: 5,
      trend: 'Worsening',
      historicalAverageWaitingVessels: 8.0
    },
    turnaround: {
      avgTurnaroundHours: 65.0,
      avgTurnaroundDays: 2.71,
      historicalNormHours: 47.0,
      avgDischargeRateMTDay: 145000,
      bulkUnloadingEfficiencyPct: 72,
      demurrageRisk: 'HIGH',
      demurrageCostPerDayUSD: 25000,
      typicalStages: {
        anchorageWaitHours: 27.5,
        pilotageAndMooringHours: 3.0,
        dischargeOperationsHours: 31.0,
        draftSurveyAndClearanceHours: 3.5
      }
    },
    cranes: {
      totalCranes: 4,
      activeCranesInUse: 3,
      cranesUnderMaintenance: 1,
      standbyCranes: 0,
      craneUtilizationPct: 75.0,
      avgCranesPerBerth: 1.0,
      totalHandlingCapacityTPH: 18500,
      craneList: [
        { id: 'CR-RBY-01', name: 'RBCT Shiploader #1', type: 'High-Speed Shiploader', status: 'ACTIVE', berthAssigned: 'RBCT Berth 1', capacityTPH: 4800, operatorShift: 'Shift A', efficiencyPct: 82 },
        { id: 'CR-RBY-02', name: 'RBCT Shiploader #2', type: 'High-Speed Shiploader', status: 'ACTIVE', berthAssigned: 'RBCT Berth 2', capacityTPH: 4800, operatorShift: 'Shift A', efficiencyPct: 79 },
        { id: 'CR-RBY-03', name: 'RBCT Shiploader #3', type: 'High-Speed Shiploader', status: 'MAINTENANCE', berthAssigned: 'RBCT Berth 3', capacityTPH: 4600, operatorShift: 'Rail Feed Chute Repair', efficiencyPct: 0 }
      ]
    },
    delays: {
      currentWaitTimeHours: 27.5,
      waitTimeRange: '24 - 32 hrs',
      pilotageDelayHours: 3.0,
      customsClearanceHours: 1.5,
      tidalLockDelayHours: 0.0,
      weatherDelayHours: 2.0,
      projectedDelayTrend: 'Increasing',
      waitingVesselsQueue: [
        { vesselName: 'MV Star Diamond', vesselClass: 'Panamax (77K DWT)', cargo: 'Steam Coal', tonnageMT: 75000, waitingSinceHours: 12.0, assignedBerth: 'RBCT Berth 1', etaBerth: 'Loaded / Departed' },
        { vesselName: 'Kwazulu Trader', vesselClass: 'Capesize (168K DWT)', cargo: 'Anthracite', tonnageMT: 162000, waitingSinceHours: 30.0, assignedBerth: 'RBCT Berth 2', etaBerth: 'Tomorrow, 10:00' }
      ]
    }
  },
  {
    id: 'singapore',
    name: 'Singapore',
    region: 'Singapore Strait',
    country: 'Singapore',
    status: 'NORMAL',
    distanceNM: 1650,
    transitDays: 4.6,
    estDelayHours: '4-8h Bunker Berth Wait',
    draftLimitM: 21.0,
    maxLOAM: 399,
    berths: 0,
    waitingVessels: 5,
    isOptimal: true,
    notes: "World's largest bunkering hub and mid-voyage anchorage for the Newcastle-India and Indonesia-India corridors. Not a cargo port for this trade — vessels stop for VLSFO bunkers, crew change, and TSS transit only.",
    coordinates: { lat: 1.29, lng: 103.85 },
    lastTelemetryUpdate: '2 mins ago (MPA VTIS Live Feed)',
    history: {
      congestionIndex: [22, 21, 20, 22, 21, 23, 20, 22, 21, 20, 22, 21],
      turnaroundHours: [10, 10.5, 10, 9.8, 10.2, 10, 9.9, 10.1, 10, 9.8, 10, 10.0],
      waitTimeHours: [5, 4.8, 5.2, 5, 4.9, 5.1, 5, 4.8, 5, 5.2, 5, 5.0]
    },
    weather: {
      condition: 'Equatorial Haze, Light Airs',
      temperatureC: 31,
      windSpeedKnots: 8,
      windDirection: 'SW 8 kts',
      waveHeightM: 0.6,
      visibilityNM: 8.0,
      tideHeightM: 1.9,
      tideStatus: 'Flood Tide',
      barometricPressureHpa: 1010,
      monsoonAlert: 'High Traffic Density Advisory: Tug/barge crossings near Raffles Lighthouse'
    },
    congestion: {
      congestionLevel: 'LOW',
      congestionIndex: 21,
      berthOccupancyPct: 0,
      anchorageVesselsCount: 5,
      berthedVesselsCount: 0,
      incomingNext48h: 12,
      trend: 'Stable',
      historicalAverageWaitingVessels: 6.0
    },
    turnaround: {
      avgTurnaroundHours: 10.0,
      avgTurnaroundDays: 0.42,
      historicalNormHours: 12.0,
      avgDischargeRateMTDay: 0,
      bulkUnloadingEfficiencyPct: 0,
      demurrageRisk: 'LOW',
      demurrageCostPerDayUSD: 18000,
      typicalStages: {
        anchorageWaitHours: 5.0,
        pilotageAndMooringHours: 0.5,
        dischargeOperationsHours: 3.5,
        draftSurveyAndClearanceHours: 1.0
      }
    },
    cranes: {
      totalCranes: 0,
      activeCranesInUse: 0,
      cranesUnderMaintenance: 0,
      standbyCranes: 0,
      craneUtilizationPct: 0,
      avgCranesPerBerth: 0,
      totalHandlingCapacityTPH: 0,
      craneList: []
    },
    delays: {
      currentWaitTimeHours: 5.0,
      waitTimeRange: '4 - 8 hrs',
      pilotageDelayHours: 0.5,
      customsClearanceHours: 0.8,
      tidalLockDelayHours: 0.0,
      weatherDelayHours: 0.2,
      projectedDelayTrend: 'Steady',
      waitingVesselsQueue: [
        { vesselName: 'MV Stella Hope', vesselClass: 'Kamsarmax (82K DWT)', cargo: 'Transit / Bunkers Only', tonnageMT: 0, waitingSinceHours: 3.0, assignedBerth: 'Bunker Anchorage 7', etaBerth: 'Today, 18:00' }
      ]
    }
  },
  {
    id: 'colombo',
    name: 'Colombo',
    region: 'Western Province, Sri Lanka',
    country: 'Sri Lanka',
    status: 'NORMAL',
    distanceNM: 1150,
    transitDays: 3.2,
    estDelayHours: '2-6h Bunker Berth Wait',
    draftLimitM: 18.0,
    maxLOAM: 350,
    berths: 0,
    waitingVessels: 3,
    isOptimal: true,
    notes: 'Secondary bunkering and transshipment roads for South Africa-India and Malacca-alternative routings via Dondra Head. Competitive VLSFO pricing versus Singapore with shorter deviation for Bay of Bengal-bound tonnage.',
    coordinates: { lat: 6.94, lng: 79.84 },
    lastTelemetryUpdate: '4 mins ago (Sri Lanka Ports Authority VTS)',
    history: {
      congestionIndex: [18, 17, 19, 18, 20, 17, 19, 18, 17, 19, 18, 17],
      turnaroundHours: [8, 8.2, 8, 7.8, 8.1, 8, 7.9, 8, 8.2, 8, 7.9, 8.0],
      waitTimeHours: [3.5, 3.2, 3.8, 3.5, 3.6, 3.4, 3.5, 3.6, 3.4, 3.5, 3.6, 3.5]
    },
    weather: {
      condition: 'Clear with Light SW Swell',
      temperatureC: 29,
      windSpeedKnots: 9,
      windDirection: 'SW 9 kts',
      waveHeightM: 1.0,
      visibilityNM: 11.0,
      tideHeightM: 0.6,
      tideStatus: 'High Slack',
      barometricPressureHpa: 1011,
      monsoonAlert: null
    },
    congestion: {
      congestionLevel: 'LOW',
      congestionIndex: 17,
      berthOccupancyPct: 0,
      anchorageVesselsCount: 3,
      berthedVesselsCount: 0,
      incomingNext48h: 4,
      trend: 'Stable',
      historicalAverageWaitingVessels: 4.0
    },
    turnaround: {
      avgTurnaroundHours: 8.0,
      avgTurnaroundDays: 0.33,
      historicalNormHours: 9.0,
      avgDischargeRateMTDay: 0,
      bulkUnloadingEfficiencyPct: 0,
      demurrageRisk: 'LOW',
      demurrageCostPerDayUSD: 16500,
      typicalStages: {
        anchorageWaitHours: 3.5,
        pilotageAndMooringHours: 0.5,
        dischargeOperationsHours: 3.0,
        draftSurveyAndClearanceHours: 1.0
      }
    },
    cranes: {
      totalCranes: 0,
      activeCranesInUse: 0,
      cranesUnderMaintenance: 0,
      standbyCranes: 0,
      craneUtilizationPct: 0,
      avgCranesPerBerth: 0,
      totalHandlingCapacityTPH: 0,
      craneList: []
    },
    delays: {
      currentWaitTimeHours: 3.5,
      waitTimeRange: '2 - 6 hrs',
      pilotageDelayHours: 0.5,
      customsClearanceHours: 0.6,
      tidalLockDelayHours: 0.0,
      weatherDelayHours: 0.1,
      projectedDelayTrend: 'Steady',
      waitingVesselsQueue: [
        { vesselName: 'MV Star Diamond', vesselClass: 'Panamax (77K DWT)', cargo: 'Transit / Bunkers Only', tonnageMT: 0, waitingSinceHours: 1.5, assignedBerth: 'Outer Roads Anchorage', etaBerth: 'Today, 15:00' }
      ]
    }
  },
  {
    id: 'taman',
    name: 'Taman',
    region: 'Krasnodar Krai, Russia',
    country: 'Russia',
    status: 'MODERATE',
    distanceNM: 7350,
    transitDays: 20.7,
    estDelayHours: '16-24h Loading Queue',
    draftLimitM: 16.5,
    maxLOAM: 300,
    berths: 3,
    waitingVessels: 8,
    notes: 'Deep-water Black Sea coal export terminal (OTEKO Group) feeding Kuzbass rail deliveries. All outbound tonnage must clear the Bosphorus Strait before Mediterranean/Suez transit — Turkish Straits traffic windows can add queueing.',
    coordinates: { lat: 45.22, lng: 36.75 },
    lastTelemetryUpdate: '9 mins ago (Taman Terminal Operations)',
    history: {
      congestionIndex: [48, 50, 52, 54, 53, 55, 57, 56, 58, 57, 59, 58],
      turnaroundHours: [34, 35, 36, 37, 38, 37.5, 38.5, 39, 38.8, 39.2, 39.5, 39.8],
      waitTimeHours: [14, 15, 16, 17, 17.5, 18, 18.5, 19, 19.2, 19.5, 19.8, 20.0]
    },
    weather: {
      condition: 'Cool with Fresh Northeasterly (Bora) Wind',
      temperatureC: 14,
      windSpeedKnots: 22,
      windDirection: 'NE 22 kts',
      waveHeightM: 1.9,
      visibilityNM: 9.0,
      tideHeightM: 0.3,
      tideStatus: 'High Slack',
      barometricPressureHpa: 1019,
      monsoonAlert: 'Bora Wind Advisory: Gusts to 35kts possible, loading operations may pause'
    },
    congestion: {
      congestionLevel: 'MODERATE',
      congestionIndex: 58,
      berthOccupancyPct: 78,
      anchorageVesselsCount: 8,
      berthedVesselsCount: 3,
      incomingNext48h: 4,
      trend: 'Worsening',
      historicalAverageWaitingVessels: 6.0
    },
    turnaround: {
      avgTurnaroundHours: 39.8,
      avgTurnaroundDays: 1.66,
      historicalNormHours: 34.0,
      avgDischargeRateMTDay: 260000,
      bulkUnloadingEfficiencyPct: 85,
      demurrageRisk: 'MODERATE',
      demurrageCostPerDayUSD: 23000,
      typicalStages: {
        anchorageWaitHours: 20.0,
        pilotageAndMooringHours: 2.2,
        dischargeOperationsHours: 15.0,
        draftSurveyAndClearanceHours: 2.6
      }
    },
    cranes: {
      totalCranes: 3,
      activeCranesInUse: 3,
      cranesUnderMaintenance: 0,
      standbyCranes: 0,
      craneUtilizationPct: 100.0,
      avgCranesPerBerth: 1.0,
      totalHandlingCapacityTPH: 12500,
      craneList: [
        { id: 'CR-TAM-01', name: 'Taman Shiploader #1', type: 'High-Speed Shiploader', status: 'ACTIVE', berthAssigned: 'Berth 1', capacityTPH: 4200, operatorShift: 'Shift A', efficiencyPct: 88 },
        { id: 'CR-TAM-02', name: 'Taman Shiploader #2', type: 'High-Speed Shiploader', status: 'ACTIVE', berthAssigned: 'Berth 2', capacityTPH: 4200, operatorShift: 'Shift A', efficiencyPct: 86 },
        { id: 'CR-TAM-03', name: 'Taman Shiploader #3', type: 'High-Speed Shiploader', status: 'ACTIVE', berthAssigned: 'Berth 3', capacityTPH: 4100, operatorShift: 'Shift B', efficiencyPct: 84 }
      ]
    },
    delays: {
      currentWaitTimeHours: 20.0,
      waitTimeRange: '16 - 24 hrs',
      pilotageDelayHours: 2.2,
      customsClearanceHours: 2.5,
      tidalLockDelayHours: 0.0,
      weatherDelayHours: 3.0,
      projectedDelayTrend: 'Increasing',
      waitingVesselsQueue: [
        { vesselName: 'MV Volga Endeavour', vesselClass: 'Panamax (78K DWT)', cargo: 'Steam Coal', tonnageMT: 75500, waitingSinceHours: 12.0, assignedBerth: 'Berth 1', etaBerth: 'Loaded / Departed' }
      ]
    }
  },
  {
    id: 'nacala',
    name: 'Nacala',
    region: 'Nampula Province, Mozambique',
    country: 'Mozambique',
    status: 'NORMAL',
    distanceNM: 3100,
    transitDays: 8.7,
    estDelayHours: '4-8h Loading Queue',
    draftLimitM: 17.0,
    maxLOAM: 290,
    berths: 2,
    waitingVessels: 4,
    isOptimal: true,
    notes: 'Deep natural harbor terminus of the Nacala Logistics Corridor rail line from the Moatize coal basin (Tete Province). One of the deepest natural ports in East Africa, allowing large gearless bulkers without lightering.',
    coordinates: { lat: -14.57, lng: 40.68 },
    lastTelemetryUpdate: '6 mins ago (Nacala Logistics Corridor Ops)',
    history: {
      congestionIndex: [30, 29, 31, 30, 28, 29, 27, 28, 26, 27, 26, 25],
      turnaroundHours: [28, 27.5, 27, 27.2, 26.8, 26.5, 26.2, 26.0, 25.8, 25.6, 25.4, 25.2],
      waitTimeHours: [6, 5.8, 6.2, 5.9, 5.6, 5.4, 5.2, 5.0, 4.9, 4.8, 4.7, 4.6]
    },
    weather: {
      condition: 'Warm with Steady SE Trade Wind',
      temperatureC: 27,
      windSpeedKnots: 13,
      windDirection: 'SE 13 kts',
      waveHeightM: 1.3,
      visibilityNM: 11.5,
      tideHeightM: 2.4,
      tideStatus: 'Flood Tide',
      barometricPressureHpa: 1013,
      monsoonAlert: null
    },
    congestion: {
      congestionLevel: 'LOW',
      congestionIndex: 25,
      berthOccupancyPct: 58,
      anchorageVesselsCount: 4,
      berthedVesselsCount: 2,
      incomingNext48h: 3,
      trend: 'Improving',
      historicalAverageWaitingVessels: 5.0
    },
    turnaround: {
      avgTurnaroundHours: 25.2,
      avgTurnaroundDays: 1.05,
      historicalNormHours: 28.0,
      avgDischargeRateMTDay: 195000,
      bulkUnloadingEfficiencyPct: 90,
      demurrageRisk: 'LOW',
      demurrageCostPerDayUSD: 20000,
      typicalStages: {
        anchorageWaitHours: 4.6,
        pilotageAndMooringHours: 1.5,
        dischargeOperationsHours: 17.0,
        draftSurveyAndClearanceHours: 2.1
      }
    },
    cranes: {
      totalCranes: 2,
      activeCranesInUse: 2,
      cranesUnderMaintenance: 0,
      standbyCranes: 0,
      craneUtilizationPct: 100.0,
      avgCranesPerBerth: 1.0,
      totalHandlingCapacityTPH: 9800,
      craneList: [
        { id: 'CR-NAC-01', name: 'Nacala Shiploader #1', type: 'High-Speed Shiploader', status: 'ACTIVE', berthAssigned: 'Berth 1', capacityTPH: 5000, operatorShift: 'Shift A', efficiencyPct: 93 },
        { id: 'CR-NAC-02', name: 'Nacala Shiploader #2', type: 'High-Speed Shiploader', status: 'ACTIVE', berthAssigned: 'Berth 2', capacityTPH: 4800, operatorShift: 'Shift B', efficiencyPct: 91 }
      ]
    },
    delays: {
      currentWaitTimeHours: 4.6,
      waitTimeRange: '4 - 8 hrs',
      pilotageDelayHours: 1.5,
      customsClearanceHours: 1.0,
      tidalLockDelayHours: 0.0,
      weatherDelayHours: 0.3,
      projectedDelayTrend: 'Decreasing',
      waitingVesselsQueue: [
        { vesselName: 'MV Nacala Pioneer', vesselClass: 'Supramax (58K DWT)', cargo: 'Coking Coal', tonnageMT: 56800, waitingSinceHours: 3.0, assignedBerth: 'Berth 1', etaBerth: 'Loaded / Departed' }
      ]
    }
  },
  {
    id: 'mundra',
    name: 'Mundra',
    region: 'Gujarat, India (West Coast)',
    country: 'India',
    status: 'MODERATE',
    distanceNM: 7510,
    transitDays: 21.1,
    estDelayHours: '6-10h Berth Queue',
    draftLimitM: 17.5,
    maxLOAM: 300,
    berths: 6,
    waitingVessels: 5,
    isOptimal: true,
    notes: "India's largest private commercial port (Adani-operated). Deep-draft coal terminal serving west Indian thermal power plants; handles Capesize tonnage without lightering.",
    coordinates: { lat: 22.84, lng: 69.72 },
    lastTelemetryUpdate: '8 mins ago (Mundra Port Ops)',
    congestion: {
      congestionLevel: 'MODERATE',
      congestionIndex: 52,
      berthOccupancyPct: 71,
      anchorageVesselsCount: 5,
      berthedVesselsCount: 6,
      incomingNext48h: 4,
      trend: 'Stable',
      historicalAverageWaitingVessels: 6.0
    },
    turnaround: {
      avgTurnaroundHours: 38.0,
      avgTurnaroundDays: 1.58,
      historicalNormHours: 32.0,
      avgDischargeRateMTDay: 28000,
      bulkUnloadingEfficiencyPct: 90,
      demurrageRisk: 'MODERATE',
      demurrageCostPerDayUSD: 24000,
      typicalStages: {
        anchorageWaitHours: 10.0,
        pilotageAndMooringHours: 2.0,
        dischargeOperationsHours: 23.5,
        draftSurveyAndClearanceHours: 2.5
      }
    },
    cranes: {
      totalCranes: 18,
      activeCranesInUse: 14,
      cranesUnderMaintenance: 2,
      standbyCranes: 2,
      craneUtilizationPct: 77.8,
      avgCranesPerBerth: 3.0,
      totalHandlingCapacityTPH: 26000,
      craneList: [
        { id: 'CR-MUN-01', name: 'Mundra CSU #1', type: 'Continuous Ship Unloader (CSU)', status: 'ACTIVE', berthAssigned: 'Berth 3', capacityTPH: 3200, operatorShift: 'Shift A', efficiencyPct: 92 }
      ]
    },
    delays: {
      currentWaitTimeHours: 10.0,
      waitTimeRange: '6-10 hrs',
      pilotageDelayHours: 2.0,
      customsClearanceHours: 1.5,
      tidalLockDelayHours: 0.5,
      weatherDelayHours: 1.0,
      projectedDelayTrend: 'Steady',
      waitingVesselsQueue: [
        { vesselName: 'MV Adani Prosperity', vesselClass: 'Capesize (180K DWT)', cargo: 'Thermal Coal', tonnageMT: 175000, waitingSinceHours: 8.0, assignedBerth: 'Berth 4', etaBerth: 'Today, 20:00' }
      ]
    }
  },
  {
    id: 'kandla',
    name: 'Kandla (Deendayal Port)',
    region: 'Gujarat, India (West Coast)',
    country: 'India',
    status: 'MODERATE',
    distanceNM: 7515,
    transitDays: 21.1,
    estDelayHours: '10-16h Tidal Berth Wait',
    draftLimitM: 12.8,
    maxLOAM: 230,
    berths: 4,
    waitingVessels: 7,
    isOptimal: false,
    notes: 'Tidal creek port at the head of the Gulf of Kutch; principal west-coast gateway for bulk fertilizer (DAP/MOP/Urea) and foodgrain imports. Draft restricted by tidal window and channel siltation.',
    coordinates: { lat: 23.03, lng: 70.22 },
    lastTelemetryUpdate: '5 mins ago (Kandla Port Trust)',
    congestion: {
      congestionLevel: 'MODERATE',
      congestionIndex: 58,
      berthOccupancyPct: 80,
      anchorageVesselsCount: 7,
      berthedVesselsCount: 4,
      incomingNext48h: 5,
      trend: 'Worsening',
      historicalAverageWaitingVessels: 6.5
    },
    turnaround: {
      avgTurnaroundHours: 52.0,
      avgTurnaroundDays: 2.17,
      historicalNormHours: 40.0,
      avgDischargeRateMTDay: 14500,
      bulkUnloadingEfficiencyPct: 79,
      demurrageRisk: 'MODERATE',
      demurrageCostPerDayUSD: 19000,
      typicalStages: {
        anchorageWaitHours: 14.0,
        pilotageAndMooringHours: 3.5,
        dischargeOperationsHours: 31.0,
        draftSurveyAndClearanceHours: 3.5
      }
    },
    cranes: {
      totalCranes: 8,
      activeCranesInUse: 5,
      cranesUnderMaintenance: 2,
      standbyCranes: 1,
      craneUtilizationPct: 62.5,
      avgCranesPerBerth: 2.0,
      totalHandlingCapacityTPH: 9600,
      craneList: [
        { id: 'CR-KDL-01', name: 'Kandla Grab Gantry #1', type: 'Grab Gantry Unloader', status: 'ACTIVE', berthAssigned: 'Berth 2', capacityTPH: 1400, operatorShift: 'Shift B', efficiencyPct: 81 }
      ]
    },
    delays: {
      currentWaitTimeHours: 14.0,
      waitTimeRange: '10-16 hrs',
      pilotageDelayHours: 3.5,
      customsClearanceHours: 2.0,
      tidalLockDelayHours: 4.0,
      weatherDelayHours: 0.5,
      projectedDelayTrend: 'Increasing',
      waitingVesselsQueue: [
        { vesselName: 'MV Gulf Fortune', vesselClass: 'Supramax (58K DWT)', cargo: 'MOP Fertilizer', tonnageMT: 52000, waitingSinceHours: 11.0, assignedBerth: 'Berth 3', etaBerth: 'Tomorrow, 06:00' }
      ]
    }
  },
  {
    id: 'mormugao',
    name: 'Mormugao',
    region: 'Goa, India (West Coast)',
    country: 'India',
    status: 'NORMAL',
    distanceNM: 7046,
    transitDays: 19.8,
    estDelayHours: '3-6h Berth Wait',
    draftLimitM: 16.5,
    maxLOAM: 280,
    berths: 3,
    waitingVessels: 3,
    isOptimal: true,
    notes: 'Natural deepwater harbor on the Zuari estuary; historic iron-ore export gateway converted to a coal and general-bulk import terminal for Karnataka/Goa power and cement plants.',
    coordinates: { lat: 15.42, lng: 73.80 },
    lastTelemetryUpdate: '7 mins ago (Mormugao Port Authority)',
    congestion: {
      congestionLevel: 'LOW',
      congestionIndex: 32,
      berthOccupancyPct: 60,
      anchorageVesselsCount: 3,
      berthedVesselsCount: 3,
      incomingNext48h: 3,
      trend: 'Stable',
      historicalAverageWaitingVessels: 4.0
    },
    turnaround: {
      avgTurnaroundHours: 30.0,
      avgTurnaroundDays: 1.25,
      historicalNormHours: 28.0,
      avgDischargeRateMTDay: 19000,
      bulkUnloadingEfficiencyPct: 86,
      demurrageRisk: 'LOW',
      demurrageCostPerDayUSD: 21000,
      typicalStages: {
        anchorageWaitHours: 5.0,
        pilotageAndMooringHours: 2.0,
        dischargeOperationsHours: 20.5,
        draftSurveyAndClearanceHours: 2.5
      }
    },
    cranes: {
      totalCranes: 6,
      activeCranesInUse: 5,
      cranesUnderMaintenance: 1,
      standbyCranes: 0,
      craneUtilizationPct: 83.3,
      avgCranesPerBerth: 2.0,
      totalHandlingCapacityTPH: 10500,
      craneList: [
        { id: 'CR-MOR-01', name: 'Mormugao Mobile Harbor Crane #1', type: 'Mobile Harbor Crane', status: 'ACTIVE', berthAssigned: 'Berth 1', capacityTPH: 1800, operatorShift: 'Shift A', efficiencyPct: 89 }
      ]
    },
    delays: {
      currentWaitTimeHours: 5.0,
      waitTimeRange: '3-6 hrs',
      pilotageDelayHours: 2.0,
      customsClearanceHours: 1.0,
      tidalLockDelayHours: 0.0,
      weatherDelayHours: 0.5,
      projectedDelayTrend: 'Steady',
      waitingVesselsQueue: [
        { vesselName: 'MV Konkan Star', vesselClass: 'Panamax (76K DWT)', cargo: 'Thermal Coal', tonnageMT: 74000, waitingSinceHours: 4.0, assignedBerth: 'Berth 2', etaBerth: 'Today, 18:00' }
      ]
    }
  },
  {
    id: 'jorf_lasfar',
    name: 'Jorf Lasfar',
    region: 'El Jadida, Morocco',
    country: 'Morocco',
    status: 'NORMAL',
    distanceNM: 6225,
    transitDays: 17.5,
    estDelayHours: '4-8h Loading Queue',
    draftLimitM: 18.0,
    maxLOAM: 290,
    berths: 5,
    waitingVessels: 4,
    isOptimal: true,
    notes: "World's largest phosphate/DAP export complex (OCP Group). Dedicated deepwater fertilizer berths feed India's Rock Phosphate and DAP procurement tenders directly.",
    coordinates: { lat: 33.12, lng: -8.63 },
    lastTelemetryUpdate: '9 mins ago (OCP Terminal Ops)',
    congestion: {
      congestionLevel: 'LOW',
      congestionIndex: 35,
      berthOccupancyPct: 64,
      anchorageVesselsCount: 4,
      berthedVesselsCount: 5,
      incomingNext48h: 4,
      trend: 'Stable',
      historicalAverageWaitingVessels: 5.0
    },
    turnaround: {
      avgTurnaroundHours: 32.0,
      avgTurnaroundDays: 1.33,
      historicalNormHours: 30.0,
      avgDischargeRateMTDay: 24000,
      bulkUnloadingEfficiencyPct: 91,
      demurrageRisk: 'LOW',
      demurrageCostPerDayUSD: 22000,
      typicalStages: {
        anchorageWaitHours: 6.0,
        pilotageAndMooringHours: 1.5,
        dischargeOperationsHours: 22.0,
        draftSurveyAndClearanceHours: 2.5
      }
    },
    cranes: {
      totalCranes: 10,
      activeCranesInUse: 8,
      cranesUnderMaintenance: 1,
      standbyCranes: 1,
      craneUtilizationPct: 80.0,
      avgCranesPerBerth: 2.0,
      totalHandlingCapacityTPH: 18000,
      craneList: [
        { id: 'CR-JRF-01', name: 'Jorf Lasfar Shiploader #1', type: 'High-Speed Shiploader', status: 'ACTIVE', berthAssigned: 'Berth 2', capacityTPH: 3600, operatorShift: 'Shift A', efficiencyPct: 94 }
      ]
    },
    delays: {
      currentWaitTimeHours: 6.0,
      waitTimeRange: '4-8 hrs',
      pilotageDelayHours: 1.5,
      customsClearanceHours: 1.0,
      tidalLockDelayHours: 0.0,
      weatherDelayHours: 1.0,
      projectedDelayTrend: 'Steady',
      waitingVesselsQueue: [
        { vesselName: 'MV Atlas Phosphate', vesselClass: 'Panamax (74K DWT)', cargo: 'Rock Phosphate', tonnageMT: 72000, waitingSinceHours: 5.0, assignedBerth: 'Berth 3', etaBerth: 'Today, 22:00' }
      ]
    }
  },
  {
    id: 'ras_al_khair',
    name: 'Ras Al Khair',
    region: 'Eastern Province, Saudi Arabia',
    country: 'Saudi Arabia',
    status: 'NORMAL',
    distanceNM: 2817,
    transitDays: 7.9,
    estDelayHours: '3-6h Loading Queue',
    draftLimitM: 18.5,
    maxLOAM: 295,
    berths: 4,
    waitingVessels: 3,
    isOptimal: true,
    notes: "Maaden's integrated phosphate/DAP export terminal on the Persian Gulf. Outbound tonnage transits the Strait of Hormuz before the short Arabian Sea crossing to India.",
    coordinates: { lat: 27.05, lng: 49.85 },
    lastTelemetryUpdate: '6 mins ago (Maaden Terminal Ops)',
    congestion: {
      congestionLevel: 'LOW',
      congestionIndex: 30,
      berthOccupancyPct: 58,
      anchorageVesselsCount: 3,
      berthedVesselsCount: 4,
      incomingNext48h: 3,
      trend: 'Stable',
      historicalAverageWaitingVessels: 3.5
    },
    turnaround: {
      avgTurnaroundHours: 28.0,
      avgTurnaroundDays: 1.17,
      historicalNormHours: 26.0,
      avgDischargeRateMTDay: 26000,
      bulkUnloadingEfficiencyPct: 92,
      demurrageRisk: 'LOW',
      demurrageCostPerDayUSD: 23000,
      typicalStages: {
        anchorageWaitHours: 5.0,
        pilotageAndMooringHours: 1.5,
        dischargeOperationsHours: 19.0,
        draftSurveyAndClearanceHours: 2.5
      }
    },
    cranes: {
      totalCranes: 8,
      activeCranesInUse: 6,
      cranesUnderMaintenance: 1,
      standbyCranes: 1,
      craneUtilizationPct: 75.0,
      avgCranesPerBerth: 2.0,
      totalHandlingCapacityTPH: 15500,
      craneList: [
        { id: 'CR-RAK-01', name: 'Ras Al Khair Shiploader #1', type: 'High-Speed Shiploader', status: 'ACTIVE', berthAssigned: 'Berth 1', capacityTPH: 4000, operatorShift: 'Shift A', efficiencyPct: 95 }
      ]
    },
    delays: {
      currentWaitTimeHours: 5.0,
      waitTimeRange: '3-6 hrs',
      pilotageDelayHours: 1.5,
      customsClearanceHours: 1.0,
      tidalLockDelayHours: 0.0,
      weatherDelayHours: 0.5,
      projectedDelayTrend: 'Steady',
      waitingVesselsQueue: [
        { vesselName: 'MV Maaden Voyager', vesselClass: 'Panamax (75K DWT)', cargo: 'DAP Fertilizer', tonnageMT: 73000, waitingSinceHours: 4.0, assignedBerth: 'Berth 2', etaBerth: 'Today, 16:00' }
      ]
    }
  },
  {
    id: 'sohar',
    name: 'Sohar',
    region: 'Al Batinah, Oman',
    country: 'Oman',
    status: 'NORMAL',
    distanceNM: 2359,
    transitDays: 6.6,
    estDelayHours: '2-5h Loading Queue',
    draftLimitM: 20.0,
    maxLOAM: 300,
    berths: 3,
    waitingVessels: 2,
    isOptimal: true,
    notes: "Gulf of Oman deepwater port outside the Strait of Hormuz. Major urea and pet coke export hub feeding India's fertilizer and cement/power industries via a direct Arabian Sea crossing.",
    coordinates: { lat: 24.35, lng: 56.61 },
    lastTelemetryUpdate: '4 mins ago (Sohar Port Authority)',
    congestion: {
      congestionLevel: 'LOW',
      congestionIndex: 26,
      berthOccupancyPct: 52,
      anchorageVesselsCount: 2,
      berthedVesselsCount: 3,
      incomingNext48h: 3,
      trend: 'Improving',
      historicalAverageWaitingVessels: 3.0
    },
    turnaround: {
      avgTurnaroundHours: 24.0,
      avgTurnaroundDays: 1.00,
      historicalNormHours: 24.0,
      avgDischargeRateMTDay: 21000,
      bulkUnloadingEfficiencyPct: 93,
      demurrageRisk: 'LOW',
      demurrageCostPerDayUSD: 20000,
      typicalStages: {
        anchorageWaitHours: 3.5,
        pilotageAndMooringHours: 1.5,
        dischargeOperationsHours: 16.5,
        draftSurveyAndClearanceHours: 2.5
      }
    },
    cranes: {
      totalCranes: 7,
      activeCranesInUse: 5,
      cranesUnderMaintenance: 1,
      standbyCranes: 1,
      craneUtilizationPct: 71.4,
      avgCranesPerBerth: 2.3,
      totalHandlingCapacityTPH: 13500,
      craneList: [
        { id: 'CR-SOH-01', name: 'Sohar Shiploader #1', type: 'High-Speed Shiploader', status: 'ACTIVE', berthAssigned: 'Berth 1', capacityTPH: 3400, operatorShift: 'Shift A', efficiencyPct: 93 }
      ]
    },
    delays: {
      currentWaitTimeHours: 3.5,
      waitTimeRange: '2-5 hrs',
      pilotageDelayHours: 1.5,
      customsClearanceHours: 1.0,
      tidalLockDelayHours: 0.0,
      weatherDelayHours: 0.0,
      projectedDelayTrend: 'Decreasing',
      waitingVesselsQueue: [
        { vesselName: 'MV Sohar Trader', vesselClass: 'Supramax (56K DWT)', cargo: 'Urea', tonnageMT: 54000, waitingSinceHours: 3.0, assignedBerth: 'Berth 2', etaBerth: 'Today, 14:00' }
      ]
    }
  },
  {
    id: 'aqaba',
    name: 'Aqaba',
    region: 'Aqaba Governorate, Jordan',
    country: 'Jordan',
    status: 'MODERATE',
    distanceNM: 3944,
    transitDays: 11.1,
    estDelayHours: '6-10h Loading Queue',
    draftLimitM: 13.5,
    maxLOAM: 230,
    berths: 2,
    waitingVessels: 4,
    isOptimal: false,
    notes: "Jordan's sole seaport at the head of the Red Sea. Arab Potash Company's export berth is India's key Muriate of Potash source, transiting Bab-el-Mandeb into the Arabian Sea.",
    coordinates: { lat: 29.53, lng: 35.00 },
    lastTelemetryUpdate: '10 mins ago (Aqaba Port Corporation)',
    congestion: {
      congestionLevel: 'MODERATE',
      congestionIndex: 48,
      berthOccupancyPct: 74,
      anchorageVesselsCount: 4,
      berthedVesselsCount: 2,
      incomingNext48h: 3,
      trend: 'Stable',
      historicalAverageWaitingVessels: 4.5
    },
    turnaround: {
      avgTurnaroundHours: 40.0,
      avgTurnaroundDays: 1.67,
      historicalNormHours: 34.0,
      avgDischargeRateMTDay: 12000,
      bulkUnloadingEfficiencyPct: 83,
      demurrageRisk: 'MODERATE',
      demurrageCostPerDayUSD: 18000,
      typicalStages: {
        anchorageWaitHours: 9.0,
        pilotageAndMooringHours: 2.0,
        dischargeOperationsHours: 26.5,
        draftSurveyAndClearanceHours: 2.5
      }
    },
    cranes: {
      totalCranes: 5,
      activeCranesInUse: 3,
      cranesUnderMaintenance: 1,
      standbyCranes: 1,
      craneUtilizationPct: 60.0,
      avgCranesPerBerth: 2.5,
      totalHandlingCapacityTPH: 7200,
      craneList: [
        { id: 'CR-AQB-01', name: 'Aqaba Grab Gantry #1', type: 'Grab Gantry Unloader', status: 'ACTIVE', berthAssigned: 'Berth 1', capacityTPH: 1300, operatorShift: 'Shift B', efficiencyPct: 84 }
      ]
    },
    delays: {
      currentWaitTimeHours: 9.0,
      waitTimeRange: '6-10 hrs',
      pilotageDelayHours: 2.0,
      customsClearanceHours: 1.5,
      tidalLockDelayHours: 0.0,
      weatherDelayHours: 0.5,
      projectedDelayTrend: 'Steady',
      waitingVesselsQueue: [
        { vesselName: 'MV Dead Sea Potash', vesselClass: 'Handysize (36K DWT)', cargo: 'Muriate of Potash', tonnageMT: 34500, waitingSinceHours: 7.0, assignedBerth: 'Berth 1', etaBerth: 'Today, 20:00' }
      ]
    }
  }
];

// Live-tick port telemetry: nudges congestion, occupancy, wait times, and crane utilization
// by small clamped deltas each interval, mirroring simulateVesselTick's movement pattern.
// Derives daily inbound/outbound vessel counts from telemetry the port already carries,
// instead of adding two more hand-authored constants per port that would drift out of sync
// with congestion/turnaround: arrivals scale off the AIS-scheduled 48h inbound count,
// departures off how many vessels are currently berthed and how fast this port turns them
// around (a vessel occupying a berth for `avgTurnaroundDays` implies ~1/avgTurnaroundDays of
// the berthed fleet clears per day).
export function estimateDailyVesselFlow(port: PortInfo): { arrivals: number; departures: number } {
  if (!port.congestion || !port.turnaround) {
    return { arrivals: 0, departures: 0 };
  }
  const arrivals = Math.max(1, Math.round(port.congestion.incomingNext48h / 2));
  const departures = Math.max(
    1,
    Math.round(port.congestion.berthedVesselsCount / Math.max(0.5, port.turnaround.avgTurnaroundDays))
  );
  return { arrivals, departures };
}

export function simulatePortTick(ports: PortInfo[]): PortInfo[] {
  const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
  const jitter = (spread: number) => (Math.random() - 0.5) * 2 * spread;

  return ports.map(port => {
    if (!port.congestion || !port.turnaround || !port.delays || !port.cranes) {
      return port;
    }

    const newCongestionIndex = Math.round(clamp(port.congestion.congestionIndex + jitter(3), 5, 98));
    const newBerthOccupancy = Math.round(clamp(port.congestion.berthOccupancyPct + jitter(2.5), 0, 100));
    const newAnchorageVessels = Math.max(0, Math.round(port.congestion.anchorageVesselsCount + jitter(1.2)));
    const newIncoming48h = Math.max(0, Math.round(port.congestion.incomingNext48h + jitter(1)));
    const newWaitTime = Number(clamp(port.delays.currentWaitTimeHours + jitter(0.8), 0.5, 96).toFixed(1));
    const newCraneUtilization = Number(clamp(port.cranes.craneUtilizationPct + jitter(2), 0, 100).toFixed(1));

    const newCongestionLevel: PortCongestion['congestionLevel'] =
      newCongestionIndex >= 80 ? 'CRITICAL' : newCongestionIndex >= 60 ? 'HIGH' : newCongestionIndex >= 35 ? 'MODERATE' : 'LOW';
    const newStatus: PortInfo['status'] =
      newCongestionLevel === 'CRITICAL' || newCongestionLevel === 'HIGH' ? 'HIGH' : newCongestionLevel === 'MODERATE' ? 'MODERATE' : 'NORMAL';

    const pushHistory = (arr: number[] | undefined, value: number): number[] => {
      const next = [...(arr || []), value];
      return next.length > 18 ? next.slice(next.length - 18) : next;
    };

    return {
      ...port,
      status: newStatus,
      lastTelemetryUpdate: 'Just now',
      history: {
        congestionIndex: pushHistory(port.history?.congestionIndex, newCongestionIndex),
        turnaroundHours: pushHistory(port.history?.turnaroundHours, port.turnaround.avgTurnaroundHours),
        waitTimeHours: pushHistory(port.history?.waitTimeHours, newWaitTime)
      },
      congestion: {
        ...port.congestion,
        congestionIndex: newCongestionIndex,
        congestionLevel: newCongestionLevel,
        berthOccupancyPct: newBerthOccupancy,
        anchorageVesselsCount: newAnchorageVessels,
        incomingNext48h: newIncoming48h
      },
      delays: {
        ...port.delays,
        currentWaitTimeHours: newWaitTime
      },
      cranes: {
        ...port.cranes,
        craneUtilizationPct: newCraneUtilization
      }
    };
  });
}

export const initialSavedAnalyses: SavedAnalysis[] = [
  {
    id: 'mr-992-a',
    timestamp: 'Today, 14:22 GMT',
    route: 'Newcastle → Paradip',
    cargo: 'Coal (180,000 MT)',
    quantity: '180,000 MT',
    recommendation: 'WAIT',
    vessel: 'Panamax (3-Voyage)',
    contractStrategy: '3-Voyage Short-Term',
    savingsEstimate: '$210,000 projected saving via 7-day wait'
  },
  {
    id: 'mr-841-k',
    timestamp: 'Yesterday, 09:15 GMT',
    route: 'Taboneo → Vizag',
    cargo: 'Thermal Coal (65,000 MT)',
    quantity: '65,000 MT',
    recommendation: 'BOOK',
    vessel: 'Supramax (Spot)',
    contractStrategy: 'Immediate Spot Fixture',
    savingsEstimate: 'Locked at $11.20/MT prior to expected 8% rally'
  },
  {
    id: 'mr-720-c',
    timestamp: '3 days ago',
    route: 'Gladstone → Gangavaram',
    cargo: 'Bauxite (120,000 MT)',
    quantity: '120,000 MT',
    recommendation: 'WAIT',
    vessel: 'Panamax',
    contractStrategy: '2-Voyage COA',
    savingsEstimate: '$145,000 optimization'
  }
];

export const freightForecastHistory = [
  { day: '-30d', date: 'Jul 30', rate: 16.4, forecast: null, lower: null, upper: null, bdi: 1840, bunkerCost: 645, volumeKMT: 420 },
  { day: '-25d', date: 'Aug 04', rate: 16.1, forecast: null, lower: null, upper: null, bdi: 1810, bunkerCost: 638, volumeKMT: 390 },
  { day: '-20d', date: 'Aug 09', rate: 15.8, forecast: null, lower: null, upper: null, bdi: 1780, bunkerCost: 630, volumeKMT: 450 },
  { day: '-15d', date: 'Aug 14', rate: 15.3, forecast: null, lower: null, upper: null, bdi: 1725, bunkerCost: 628, volumeKMT: 480 },
  { day: '-10d', date: 'Aug 19', rate: 15.1, forecast: null, lower: null, upper: null, bdi: 1690, bunkerCost: 622, volumeKMT: 510 },
  { day: '-5d', date: 'Aug 24', rate: 14.9, forecast: null, lower: null, upper: null, bdi: 1660, bunkerCost: 618, volumeKMT: 460 },
  { day: 'Today', date: 'Aug 29', rate: 14.8, forecast: 14.8, lower: 14.8, upper: 14.8, bdi: 1645, bunkerCost: 615, volumeKMT: 530 },
  { day: '+5d', date: 'Sep 03', rate: null, forecast: 14.4, lower: 14.0, upper: 14.9, bdi: 1610, bunkerCost: 612, volumeKMT: 490 },
  { day: '+10d', date: 'Sep 08', rate: null, forecast: 14.1, lower: 13.7, upper: 14.7, bdi: 1580, bunkerCost: 608, volumeKMT: 470 },
  { day: '+15d', date: 'Sep 13', rate: null, forecast: 13.8, lower: 13.5, upper: 14.5, bdi: 1550, bunkerCost: 605, volumeKMT: 520 },
  { day: '+20d', date: 'Sep 18', rate: null, forecast: 13.6, lower: 13.4, upper: 14.8, bdi: 1530, bunkerCost: 602, volumeKMT: 540 },
  { day: '+25d', date: 'Sep 23', rate: null, forecast: 13.5, lower: 13.4, upper: 15.0, bdi: 1515, bunkerCost: 600, volumeKMT: 500 },
  { day: '+30d', date: 'Sep 28', rate: null, forecast: 13.4, lower: 13.4, upper: 15.2, bdi: 1500, bunkerCost: 598, volumeKMT: 560 }
];

export const extendedForecast60d = [
  { day: '-60d', date: 'Jun 30', rate: 17.2, forecast: null, lower: null, upper: null, bdi: 1920 },
  { day: '-45d', date: 'Jul 15', rate: 16.8, forecast: null, lower: null, upper: null, bdi: 1880 },
  { day: '-30d', date: 'Jul 30', rate: 16.4, forecast: null, lower: null, upper: null, bdi: 1840 },
  { day: '-15d', date: 'Aug 14', rate: 15.3, forecast: null, lower: null, upper: null, bdi: 1725 },
  { day: 'Today', date: 'Aug 29', rate: 14.8, forecast: 14.8, lower: 14.8, upper: 14.8, bdi: 1645 },
  { day: '+15d', date: 'Sep 13', rate: null, forecast: 13.8, lower: 13.4, upper: 14.5, bdi: 1550 },
  { day: '+30d', date: 'Sep 28', rate: null, forecast: 13.4, lower: 13.2, upper: 15.0, bdi: 1500 },
  { day: '+45d', date: 'Oct 13', rate: null, forecast: 13.7, lower: 13.1, upper: 15.6, bdi: 1540 },
  { day: '+60d', date: 'Oct 28', rate: null, forecast: 14.2, lower: 13.3, upper: 16.2, bdi: 1600 }
];

export const extendedForecast90d = [
  { day: '-90d', date: 'May 31', rate: 17.8, forecast: null, lower: null, upper: null, bdi: 1980 },
  { day: '-60d', date: 'Jun 30', rate: 17.2, forecast: null, lower: null, upper: null, bdi: 1920 },
  { day: '-30d', date: 'Jul 30', rate: 16.4, forecast: null, lower: null, upper: null, bdi: 1840 },
  { day: 'Today', date: 'Aug 29', rate: 14.8, forecast: 14.8, lower: 14.8, upper: 14.8, bdi: 1645 },
  { day: '+30d', date: 'Sep 28', rate: null, forecast: 13.4, lower: 13.2, upper: 15.0, bdi: 1500 },
  { day: '+60d', date: 'Oct 28', rate: null, forecast: 14.2, lower: 13.3, upper: 16.2, bdi: 1600 },
  { day: '+90d', date: 'Nov 27', rate: null, forecast: 15.1, lower: 13.8, upper: 17.4, bdi: 1710 }
];

export const multiCorridorBenchmarkData = [
  { time: '-30d', date: 'Jul 30', newcastleParadip: 16.4, taboneoVizag: 12.8, richardsBayParadip: 20.2, gladstoneGangavaram: 16.8 },
  { time: '-20d', date: 'Aug 09', newcastleParadip: 15.8, taboneoVizag: 12.2, richardsBayParadip: 19.6, gladstoneGangavaram: 16.1 },
  { time: '-10d', date: 'Aug 19', newcastleParadip: 15.1, taboneoVizag: 11.6, richardsBayParadip: 19.1, gladstoneGangavaram: 15.5 },
  { time: 'Today', date: 'Aug 29', newcastleParadip: 14.8, taboneoVizag: 11.2, richardsBayParadip: 18.8, gladstoneGangavaram: 15.1 },
  { time: '+10d', date: 'Sep 08', newcastleParadip: 14.1, taboneoVizag: 11.5, richardsBayParadip: 18.2, gladstoneGangavaram: 14.6 },
  { time: '+20d', date: 'Sep 18', newcastleParadip: 13.6, taboneoVizag: 11.9, richardsBayParadip: 17.8, gladstoneGangavaram: 14.2 },
  { time: '+30d', date: 'Sep 28', newcastleParadip: 13.4, taboneoVizag: 12.3, richardsBayParadip: 17.5, gladstoneGangavaram: 14.0 },
  { time: '+45d', date: 'Oct 13', newcastleParadip: 13.7, taboneoVizag: 12.8, richardsBayParadip: 17.9, gladstoneGangavaram: 14.4 },
  { time: '+60d', date: 'Oct 28', newcastleParadip: 14.2, taboneoVizag: 13.1, richardsBayParadip: 18.5, gladstoneGangavaram: 14.9 }
];

export const freightCostBreakdownTimeline = [
  { period: '-30d', baseOpex: 6.2, bunkerFuel: 5.6, portCanalDues: 2.1, marketMargin: 2.5, total: 16.4 },
  { period: '-20d', baseOpex: 6.2, bunkerFuel: 5.4, portCanalDues: 2.1, marketMargin: 2.1, total: 15.8 },
  { period: '-10d', baseOpex: 6.2, bunkerFuel: 5.3, portCanalDues: 2.1, marketMargin: 1.5, total: 15.1 },
  { period: 'Today', baseOpex: 6.2, bunkerFuel: 5.1, portCanalDues: 2.1, marketMargin: 1.4, total: 14.8 },
  { period: '+10d', baseOpex: 6.2, bunkerFuel: 4.9, portCanalDues: 2.1, marketMargin: 0.9, total: 14.1 },
  { period: '+20d', baseOpex: 6.2, bunkerFuel: 4.8, portCanalDues: 2.1, marketMargin: 0.5, total: 13.6 },
  { period: '+30d', baseOpex: 6.2, bunkerFuel: 4.8, portCanalDues: 2.1, marketMargin: 0.3, total: 13.4 },
  { period: '+60d', baseOpex: 6.2, bunkerFuel: 5.0, portCanalDues: 2.1, marketMargin: 0.9, total: 14.2 }
];

export const forwardRateProbabilityDistribution = [
  { priceBracket: '$12.0 - $12.5', probabilityPct: 4, cumulativePct: 4, scenarioTag: 'Severe Slump' },
  { priceBracket: '$12.5 - $13.0', probabilityPct: 12, cumulativePct: 16, scenarioTag: 'Strong Softening' },
  { priceBracket: '$13.0 - $13.5', probabilityPct: 32, cumulativePct: 48, scenarioTag: 'Projected Target Band' },
  { priceBracket: '$13.5 - $14.0', probabilityPct: 28, cumulativePct: 76, scenarioTag: 'Moderate Softening' },
  { priceBracket: '$14.0 - $14.5', probabilityPct: 14, cumulativePct: 90, scenarioTag: 'Base Continuation' },
  { priceBracket: '$14.5 - $15.0', probabilityPct: 7, cumulativePct: 97, scenarioTag: 'Spot Flat' },
  { priceBracket: '>$15.0', probabilityPct: 3, cumulativePct: 100, scenarioTag: 'Rebound Spike' }
];

export const thermalIndexChartData = [
  { month: 'Aug', price: 104 },
  { month: 'Aug 15', price: 108 },
  { month: 'Sep', price: 101 },
  { month: 'Sep 15', price: 116 },
  { month: 'Oct', price: 112 },
  { month: 'Oct 15', price: 124 },
  { month: 'Nov', price: 130 },
  { month: 'Nov 15', price: 122 },
  { month: 'Dec', price: 135 },
  { month: 'Dec 15', price: 131 },
  { month: 'Jan', price: 142 },
  { month: 'Current', price: 128.45 }
];

export const vesselComparisonData: VesselComparisonItem[] = [
  {
    id: 'handysize',
    name: 'Handysize 38K',
    classType: 'Handysize',
    isRecommended: false,
    operationalFit: 'Lower fit',
    compatibility: 'Compatible',
    suitabilityScore: 54,
    summaryDescription: 'Self-geared flexible workhorse. Full access to shallow berths, but requires 4-5 round trips to move 180K MT parcel, resulting in high freight cost/MT.',
    dwt: 38500,
    grossTonnage: 23800,
    netTonnage: 12600,
    grainCubicCapacityM3: 48500,
    baleCubicCapacityM3: 46200,
    holdsAndHatches: '5 Holds / 5 Hatches',
    hatchDimensions: '16.8m x 14.5m (Hatch 2-5)',
    gearing: '4 x 30 MT Electro-Hydraulic Cranes + 4 x 10 cbm grabs',
    hasCranes: true,
    craneCapacityDescription: '4 x 30 MT SWL with radio grab attachments',
    maxSafeParcelParadipMT: 38000,
    voyagesNeededFor180kMT: 4.7,
    ciiRating: 'C',
    eexiValueGramsCO2: 5.12,
    eediCompliancePhase: 'Phase 2 Standard',
    transportEfficiencyScore: 62,
    tonneMilesPerTonFuel: 42500,
    carbonTaxExposureUSD: 14200,
    turnaroundDaysParadip: 2.1,
    ladenSpeedKnots: 13.5,
    ecoSpeedKnots: 11.5,
    ladenFuelConsumptionMTDay: 20.5,
    ecoFuelConsumptionMTDay: 14.5,
    ballastFuelConsumptionMTDay: 17.5,
    portIdleConsumptionMTDay: 1.8,
    portWorkingConsumptionMTDay: 4.5,
    scrubberEquipped: false,
    dailyBunkerCostUSD: 12710,
    voyageFuelBurnNewcastleParadipMT: 330,
    bunkerCostPerTonCargoUSD: 5.38,
    ladenDraftM: 10.5,
    ballastDraftM: 6.2,
    loaM: 180,
    beamM: 28.0,
    airDraftM: 36.5,
    tpc: 48.5,
    berthAllocation: 'Standard General Cargo & Fertilizer Berths',
    lighteringRequiredParadip: false,
    lighteringCostPerTonUSD: 0,
    dailyTceRateUSD: 14500,
    freightRatePerTonUSD: 21.50,
    totalVoyageDays: 17.9,
    demurrageCostPerDayUSD: 16000,
    totalEstimatedVoyageCostUSD: 817000
  },
  {
    id: 'supramax',
    name: 'Supramax 58K',
    classType: 'Supramax',
    isRecommended: false,
    operationalFit: 'Strong fit',
    compatibility: 'Compatible',
    suitabilityScore: 82,
    summaryDescription: 'High-versatility geared bulker. Excellent self-discharge capability at congested ports, moderate fuel burn, but parcel unit cost is higher than gearless Panamax.',
    dwt: 58000,
    grossTonnage: 33500,
    netTonnage: 19200,
    grainCubicCapacityM3: 78500,
    baleCubicCapacityM3: 75200,
    holdsAndHatches: '5 Holds / 5 Hatches',
    hatchDimensions: '19.5m x 18.2m',
    gearing: '4 x 30 MT Cranes + 4 x 12 cbm Electro-hydraulic grabs',
    hasCranes: true,
    craneCapacityDescription: '4 x 30.5 MT Cranes with 12 cbm remote grabs',
    maxSafeParcelParadipMT: 58000,
    voyagesNeededFor180kMT: 3.1,
    ciiRating: 'B',
    eexiValueGramsCO2: 4.25,
    eediCompliancePhase: 'Phase 2 Standard',
    transportEfficiencyScore: 78,
    tonneMilesPerTonFuel: 58200,
    carbonTaxExposureUSD: 18500,
    turnaroundDaysParadip: 2.4,
    ladenSpeedKnots: 13.8,
    ecoSpeedKnots: 11.8,
    ladenFuelConsumptionMTDay: 24.8,
    ecoFuelConsumptionMTDay: 18.2,
    ballastFuelConsumptionMTDay: 21.0,
    portIdleConsumptionMTDay: 2.2,
    portWorkingConsumptionMTDay: 5.2,
    scrubberEquipped: false,
    dailyBunkerCostUSD: 15376,
    voyageFuelBurnNewcastleParadipMT: 395,
    bunkerCostPerTonCargoUSD: 4.22,
    ladenDraftM: 13.2,
    ballastDraftM: 7.1,
    loaM: 200,
    beamM: 32.2,
    airDraftM: 42.0,
    tpc: 58.2,
    berthAllocation: 'Multi-Purpose Bulk Berth & Coal Berth #3',
    lighteringRequiredParadip: false,
    lighteringCostPerTonUSD: 0,
    dailyTceRateUSD: 17200,
    freightRatePerTonUSD: 17.80,
    totalVoyageDays: 18.1,
    demurrageCostPerDayUSD: 19000,
    totalEstimatedVoyageCostUSD: 1032400
  },
  {
    id: 'ultramax',
    name: 'Ultramax 64K Eco',
    classType: 'Ultramax',
    isRecommended: false,
    operationalFit: 'Strong fit',
    compatibility: 'Compatible',
    suitabilityScore: 88,
    summaryDescription: 'Modern eco-hull geared vessel. 10% higher cubic capacity and 8% lower daily fuel consumption than conventional Supramax with Phase 3 EEDI compliance.',
    dwt: 64000,
    grossTonnage: 36200,
    netTonnage: 21400,
    grainCubicCapacityM3: 88000,
    baleCubicCapacityM3: 84500,
    holdsAndHatches: '5 Holds / 5 Hatches',
    hatchDimensions: '21.0m x 18.5m',
    gearing: '4 x 35 MT High-Duty Cranes + 4 x 14 cbm grabs',
    hasCranes: true,
    craneCapacityDescription: '4 x 35 MT Heavy Duty Cranes (Eco inverter drives)',
    maxSafeParcelParadipMT: 64000,
    voyagesNeededFor180kMT: 2.8,
    ciiRating: 'A',
    eexiValueGramsCO2: 3.75,
    eediCompliancePhase: 'Phase 3 Eco-Optimized',
    transportEfficiencyScore: 89,
    tonneMilesPerTonFuel: 67400,
    carbonTaxExposureUSD: 16800,
    turnaroundDaysParadip: 2.3,
    ladenSpeedKnots: 14.0,
    ecoSpeedKnots: 12.0,
    ladenFuelConsumptionMTDay: 23.5,
    ecoFuelConsumptionMTDay: 16.8,
    ballastFuelConsumptionMTDay: 19.5,
    portIdleConsumptionMTDay: 2.0,
    portWorkingConsumptionMTDay: 4.8,
    scrubberEquipped: true,
    dailyBunkerCostUSD: 14570,
    voyageFuelBurnNewcastleParadipMT: 375,
    bunkerCostPerTonCargoUSD: 3.63,
    ladenDraftM: 13.6,
    ballastDraftM: 7.3,
    loaM: 200,
    beamM: 32.2,
    airDraftM: 42.5,
    tpc: 61.4,
    berthAllocation: 'Multi-Purpose Bulk Berth & Mechanized Coal Berth #2',
    lighteringRequiredParadip: false,
    lighteringCostPerTonUSD: 0,
    dailyTceRateUSD: 18800,
    freightRatePerTonUSD: 16.20,
    totalVoyageDays: 17.8,
    demurrageCostPerDayUSD: 21000,
    totalEstimatedVoyageCostUSD: 1036800
  },
  {
    id: 'panamax',
    name: 'Panamax 75K (Standard)',
    classType: 'Panamax',
    isRecommended: true,
    operationalFit: 'RECOMMENDED',
    compatibility: 'Compatible',
    suitabilityScore: 96,
    summaryDescription: 'Benchmark coal carrier. Optimal alignment with Paradip 14.5m draft, direct conveyor berth berthing without lightering, and lowest freight rate ($14.80/MT).',
    dwt: 75000,
    grossTonnage: 41200,
    netTonnage: 25100,
    grainCubicCapacityM3: 96000,
    baleCubicCapacityM3: 91800,
    holdsAndHatches: '7 Holds / 7 Hatches',
    hatchDimensions: '20.0m x 15.4m',
    gearing: 'Gearless (Discharge via Shore CSU / Grab Gantries)',
    hasCranes: false,
    craneCapacityDescription: 'Gearless - Discharged via Paradip 2,200 TPH CSU',
    maxSafeParcelParadipMT: 74500,
    voyagesNeededFor180kMT: 2.4,
    ciiRating: 'A',
    eexiValueGramsCO2: 3.15,
    eediCompliancePhase: 'Phase 3 Compliant',
    transportEfficiencyScore: 96,
    tonneMilesPerTonFuel: 78500,
    carbonTaxExposureUSD: 21400,
    turnaroundDaysParadip: 1.85,
    ladenSpeedKnots: 14.2,
    ecoSpeedKnots: 12.2,
    ladenFuelConsumptionMTDay: 27.5,
    ecoFuelConsumptionMTDay: 19.8,
    ballastFuelConsumptionMTDay: 23.0,
    portIdleConsumptionMTDay: 2.5,
    portWorkingConsumptionMTDay: 3.2,
    scrubberEquipped: true,
    dailyBunkerCostUSD: 17050,
    voyageFuelBurnNewcastleParadipMT: 435,
    bunkerCostPerTonCargoUSD: 3.62,
    ladenDraftM: 14.2,
    ballastDraftM: 7.8,
    loaM: 229,
    beamM: 32.2,
    airDraftM: 45.0,
    tpc: 71.0,
    berthAllocation: 'Dedicated Mechanized Coal Berth #2',
    lighteringRequiredParadip: false,
    lighteringCostPerTonUSD: 0,
    dailyTceRateUSD: 21500,
    freightRatePerTonUSD: 14.80,
    totalVoyageDays: 17.65,
    demurrageCostPerDayUSD: 24000,
    totalEstimatedVoyageCostUSD: 1110000
  },
  {
    id: 'kamsarmax',
    name: 'Kamsarmax 82K',
    classType: 'Kamsarmax',
    isRecommended: false,
    operationalFit: 'Strong fit',
    compatibility: 'Compatible',
    suitabilityScore: 92,
    summaryDescription: 'Maximum length Panamax (229m LOA) with 82K DWT. Fully compatible at Paradip when loading to 14.5m tropical draft (approx 78,000 MT coal).',
    dwt: 82000,
    grossTonnage: 44800,
    netTonnage: 27200,
    grainCubicCapacityM3: 102500,
    baleCubicCapacityM3: 98000,
    holdsAndHatches: '7 Holds / 7 Hatches',
    hatchDimensions: '21.5m x 16.0m',
    gearing: 'Gearless (Shore CSU / Grab Gantry discharge)',
    hasCranes: false,
    craneCapacityDescription: 'Gearless - High-speed shore unloader compatible',
    maxSafeParcelParadipMT: 78000,
    voyagesNeededFor180kMT: 2.3,
    ciiRating: 'A',
    eexiValueGramsCO2: 2.85,
    eediCompliancePhase: 'Phase 3 Eco-Optimized',
    transportEfficiencyScore: 94,
    tonneMilesPerTonFuel: 84200,
    carbonTaxExposureUSD: 22600,
    turnaroundDaysParadip: 1.95,
    ladenSpeedKnots: 14.2,
    ecoSpeedKnots: 12.2,
    ladenFuelConsumptionMTDay: 26.2,
    ecoFuelConsumptionMTDay: 18.5,
    ballastFuelConsumptionMTDay: 21.8,
    portIdleConsumptionMTDay: 2.5,
    portWorkingConsumptionMTDay: 3.2,
    scrubberEquipped: true,
    dailyBunkerCostUSD: 16244,
    voyageFuelBurnNewcastleParadipMT: 415,
    bunkerCostPerTonCargoUSD: 3.30,
    ladenDraftM: 14.5,
    ballastDraftM: 8.0,
    loaM: 229,
    beamM: 32.2,
    airDraftM: 45.5,
    tpc: 74.5,
    berthAllocation: 'Dedicated Deep-Draft Coal Berth #1 & #2',
    lighteringRequiredParadip: false,
    lighteringCostPerTonUSD: 0,
    dailyTceRateUSD: 22800,
    freightRatePerTonUSD: 14.10,
    totalVoyageDays: 17.75,
    demurrageCostPerDayUSD: 25500,
    totalEstimatedVoyageCostUSD: 1156200
  },
  {
    id: 'capesize',
    name: 'Capesize 180K',
    classType: 'Capesize',
    isRecommended: false,
    operationalFit: 'NOT RECOMMENDED',
    compatibility: 'Restricted',
    suitabilityScore: 28,
    summaryDescription: 'Massive economies of scale on open ocean, but draft (18.2m) exceeds Paradip 14.5m limit. Requires double-banking lightering (+ $4.20/MT), negating sea savings.',
    dwt: 180000,
    grossTonnage: 93500,
    netTonnage: 59200,
    grainCubicCapacityM3: 215000,
    baleCubicCapacityM3: 208000,
    holdsAndHatches: '9 Holds / 9 Hatches',
    hatchDimensions: '22.5m x 20.0m',
    gearing: 'Gearless (Deep-water offshore transshipment barges required)',
    hasCranes: false,
    craneCapacityDescription: 'Gearless - Requires transshipment floating crane barges',
    maxSafeParcelParadipMT: 110000,
    voyagesNeededFor180kMT: 1.0,
    ciiRating: 'A',
    eexiValueGramsCO2: 1.95,
    eediCompliancePhase: 'Phase 3 Standard',
    transportEfficiencyScore: 48,
    tonneMilesPerTonFuel: 118000,
    carbonTaxExposureUSD: 38500,
    turnaroundDaysParadip: 5.8,
    ladenSpeedKnots: 14.5,
    ecoSpeedKnots: 12.0,
    ladenFuelConsumptionMTDay: 44.5,
    ecoFuelConsumptionMTDay: 32.0,
    ballastFuelConsumptionMTDay: 38.0,
    portIdleConsumptionMTDay: 3.5,
    portWorkingConsumptionMTDay: 4.2,
    scrubberEquipped: true,
    dailyBunkerCostUSD: 27590,
    voyageFuelBurnNewcastleParadipMT: 710,
    bunkerCostPerTonCargoUSD: 2.45,
    ladenDraftM: 18.2,
    ballastDraftM: 9.4,
    loaM: 292,
    beamM: 45.0,
    airDraftM: 54.0,
    tpc: 122.0,
    berthAllocation: 'Outer Deep Anchorage Only (Lightering Mandatory)',
    lighteringRequiredParadip: true,
    lighteringCostPerTonUSD: 4.20,
    dailyTceRateUSD: 31500,
    freightRatePerTonUSD: 16.60,
    totalVoyageDays: 21.6,
    demurrageCostPerDayUSD: 38000,
    totalEstimatedVoyageCostUSD: 2988000
  },
  {
    id: 'newcastlemax',
    name: 'Newcastlemax 208K',
    classType: 'Newcastlemax',
    isRecommended: false,
    operationalFit: 'NOT RECOMMENDED',
    compatibility: 'Restricted',
    suitabilityScore: 22,
    summaryDescription: 'Maximum beam (50.0m) design for Newcastle coal terminals. Incompatible with East Coast India inner ports; requires deep-water offshore lightering.',
    dwt: 208000,
    grossTonnage: 108000,
    netTonnage: 68500,
    grainCubicCapacityM3: 245000,
    baleCubicCapacityM3: 238000,
    holdsAndHatches: '9 Holds / 9 Hatches',
    hatchDimensions: '24.0m x 21.0m',
    gearing: 'Gearless',
    hasCranes: false,
    craneCapacityDescription: 'Gearless - Offshore floating transloader required',
    maxSafeParcelParadipMT: 110000,
    voyagesNeededFor180kMT: 0.9,
    ciiRating: 'A',
    eexiValueGramsCO2: 1.78,
    eediCompliancePhase: 'Phase 3 Eco-Optimized',
    transportEfficiencyScore: 42,
    tonneMilesPerTonFuel: 128500,
    carbonTaxExposureUSD: 42000,
    turnaroundDaysParadip: 6.5,
    ladenSpeedKnots: 14.5,
    ecoSpeedKnots: 12.0,
    ladenFuelConsumptionMTDay: 48.0,
    ecoFuelConsumptionMTDay: 34.5,
    ballastFuelConsumptionMTDay: 41.0,
    portIdleConsumptionMTDay: 3.8,
    portWorkingConsumptionMTDay: 4.5,
    scrubberEquipped: true,
    dailyBunkerCostUSD: 29760,
    voyageFuelBurnNewcastleParadipMT: 765,
    bunkerCostPerTonCargoUSD: 2.28,
    ladenDraftM: 19.8,
    ballastDraftM: 10.2,
    loaM: 300,
    beamM: 50.0,
    airDraftM: 56.5,
    tpc: 135.0,
    berthAllocation: 'Offshore Roadstead Only (Lightering Mandatory)',
    lighteringRequiredParadip: true,
    lighteringCostPerTonUSD: 4.50,
    dailyTceRateUSD: 34000,
    freightRatePerTonUSD: 16.90,
    totalVoyageDays: 22.3,
    demurrageCostPerDayUSD: 42000,
    totalEstimatedVoyageCostUSD: 3515200
  }
];

