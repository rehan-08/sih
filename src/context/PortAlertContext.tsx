import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  PortAlertSubscription,
  PortAlertNotification,
  PortAlertType,
  AlertSeverity,
  VesselAlertSubscription
} from '../types';
import { portIntelligenceData } from '../data/maritimeData';
import { initialTrackedVessels } from '../data/vesselTrackingData';

export interface PortAlertContextType {
  subscriptions: Record<string, PortAlertSubscription>;
  vesselSubscriptions: Record<string, VesselAlertSubscription>;
  notifications: PortAlertNotification[];
  activePushToast: PortAlertNotification | null;
  unreadCount: number;
  soundEnabled: boolean;
  isAlertCenterOpen: boolean;
  isSubscriptionModalOpen: boolean;
  selectedPortForModal: string | null;
  toggleSound: () => void;
  toggleSubscription: (portId: string, portName?: string) => void;
  toggleVesselSubscription: (vesselId: string, vesselName?: string) => void;
  updateSubscription: (portId: string, updates: Partial<PortAlertSubscription>) => void;
  subscribeToAll: (portIds: string[]) => void;
  unsubscribeAll: () => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  deleteNotification: (notificationId: string) => void;
  dismissPushToast: () => void;
  openAlertCenter: () => void;
  closeAlertCenter: () => void;
  openSubscriptionModal: (portId?: string) => void;
  closeSubscriptionModal: () => void;
  simulatePortAlert: (customAlert?: Partial<PortAlertNotification>) => void;
  simulateVesselAlert: (customAlert?: Partial<PortAlertNotification>) => void;
  triggerPredefinedScenario: (scenarioKey: 'paradip_closure' | 'visakhapatnam_spike' | 'haldia_draft' | 'newcastle_shiploader' | 'richards_bay_rail' | 'cyclone_evacuation') => void;
}

const STORAGE_KEY_SUBSCRIPTIONS = 'marlin_port_alert_subscriptions_v1';
const STORAGE_KEY_VESSEL_SUBSCRIPTIONS = 'marlin_vessel_alert_subscriptions_v1';
const STORAGE_KEY_NOTIFICATIONS = 'marlin_port_alert_notifications_v1';
const STORAGE_KEY_SOUND = 'marlin_port_alert_sound_enabled';

const defaultVesselSubscriptions: Record<string, VesselAlertSubscription> = {
  'vessel-asian-progress': {
    vesselId: 'vessel-asian-progress',
    vesselName: 'MV Asian Progress',
    isSubscribed: true,
    channels: { inAppPush: true, emailDigest: false, soundChime: true, browserBadge: true },
    notifySeverity: 'ALL',
    createdAt: '2026-08-20T08:00:00Z'
  },
  'vessel-hooghly-star': {
    vesselId: 'vessel-hooghly-star',
    vesselName: 'MV Hooghly Star',
    isSubscribed: true,
    channels: { inAppPush: true, emailDigest: false, soundChime: true, browserBadge: true },
    notifySeverity: 'ALL',
    createdAt: '2026-08-20T08:00:00Z'
  }
};

// Default pre-configured subscriptions
const defaultSubscriptions: Record<string, PortAlertSubscription> = {
  paradip: {
    portId: 'paradip',
    portName: 'Paradip',
    isSubscribed: true,
    channels: { inAppPush: true, emailDigest: true, soundChime: true, browserBadge: true },
    thresholds: {
      turnaroundSurgePct: 25,
      turnaroundHoursMax: 45,
      alertOnPortClosure: true,
      alertOnMonsoonCyclone: true,
      alertOnCraneOutage: true,
      alertOnDraftRestriction: true,
      alertOnDemurrageRisk: 'ALL'
    },
    notifySeverity: 'ALL',
    createdAt: '2026-08-20T08:00:00Z'
  },
  visakhapatnam: {
    portId: 'visakhapatnam',
    portName: 'Visakhapatnam',
    isSubscribed: true,
    channels: { inAppPush: true, emailDigest: true, soundChime: true, browserBadge: true },
    thresholds: {
      turnaroundSurgePct: 30,
      turnaroundHoursMax: 50,
      alertOnPortClosure: true,
      alertOnMonsoonCyclone: true,
      alertOnCraneOutage: true,
      alertOnDraftRestriction: true,
      alertOnDemurrageRisk: 'HIGH_SEVERE'
    },
    notifySeverity: 'ALL',
    createdAt: '2026-08-20T08:00:00Z'
  },
  haldia: {
    portId: 'haldia',
    portName: 'Haldia',
    isSubscribed: true,
    channels: { inAppPush: true, emailDigest: false, soundChime: true, browserBadge: true },
    thresholds: {
      turnaroundSurgePct: 20,
      turnaroundHoursMax: 55,
      alertOnPortClosure: true,
      alertOnMonsoonCyclone: true,
      alertOnCraneOutage: true,
      alertOnDraftRestriction: true,
      alertOnDemurrageRisk: 'ALL'
    },
    notifySeverity: 'ALL',
    createdAt: '2026-08-20T08:00:00Z'
  },
  gangavaram: {
    portId: 'gangavaram',
    portName: 'Gangavaram',
    isSubscribed: true,
    channels: { inAppPush: true, emailDigest: false, soundChime: false, browserBadge: true },
    thresholds: {
      turnaroundSurgePct: 35,
      turnaroundHoursMax: 36,
      alertOnPortClosure: true,
      alertOnMonsoonCyclone: true,
      alertOnCraneOutage: true,
      alertOnDraftRestriction: true,
      alertOnDemurrageRisk: 'HIGH_SEVERE'
    },
    notifySeverity: 'WARNING_AND_CRITICAL',
    createdAt: '2026-08-20T08:00:00Z'
  },
  gopalpur: {
    portId: 'gopalpur',
    portName: 'Gopalpur',
    isSubscribed: false,
    channels: { inAppPush: true, emailDigest: false, soundChime: false, browserBadge: true },
    thresholds: {
      turnaroundSurgePct: 30,
      turnaroundHoursMax: 48,
      alertOnPortClosure: true,
      alertOnMonsoonCyclone: true,
      alertOnCraneOutage: true,
      alertOnDraftRestriction: true,
      alertOnDemurrageRisk: 'HIGH_SEVERE'
    },
    notifySeverity: 'ALL',
    createdAt: '2026-08-20T08:00:00Z'
  },
  dhamra: {
    portId: 'dhamra',
    portName: 'Dhamra',
    isSubscribed: false,
    channels: { inAppPush: true, emailDigest: false, soundChime: false, browserBadge: true },
    thresholds: {
      turnaroundSurgePct: 30,
      turnaroundHoursMax: 36,
      alertOnPortClosure: true,
      alertOnMonsoonCyclone: true,
      alertOnCraneOutage: true,
      alertOnDraftRestriction: true,
      alertOnDemurrageRisk: 'ALL'
    },
    notifySeverity: 'ALL',
    createdAt: '2026-08-20T08:00:00Z'
  },
  newcastle: {
    portId: 'newcastle',
    portName: 'Newcastle',
    isSubscribed: true,
    channels: { inAppPush: true, emailDigest: true, soundChime: true, browserBadge: true },
    thresholds: {
      turnaroundSurgePct: 25,
      turnaroundHoursMax: 40,
      alertOnPortClosure: true,
      alertOnMonsoonCyclone: true,
      alertOnCraneOutage: true,
      alertOnDraftRestriction: true,
      alertOnDemurrageRisk: 'ALL'
    },
    notifySeverity: 'ALL',
    createdAt: '2026-08-20T08:00:00Z'
  },
  taboneo: {
    portId: 'taboneo',
    portName: 'Taboneo',
    isSubscribed: true,
    channels: { inAppPush: true, emailDigest: false, soundChime: true, browserBadge: true },
    thresholds: {
      turnaroundSurgePct: 30,
      turnaroundHoursMax: 48,
      alertOnPortClosure: true,
      alertOnMonsoonCyclone: true,
      alertOnCraneOutage: true,
      alertOnDraftRestriction: true,
      alertOnDemurrageRisk: 'ALL'
    },
    notifySeverity: 'ALL',
    createdAt: '2026-08-20T08:00:00Z'
  },
  richards_bay: {
    portId: 'richards_bay',
    portName: 'Richards Bay',
    isSubscribed: true,
    channels: { inAppPush: true, emailDigest: false, soundChime: true, browserBadge: true },
    thresholds: {
      turnaroundSurgePct: 30,
      turnaroundHoursMax: 55,
      alertOnPortClosure: true,
      alertOnMonsoonCyclone: true,
      alertOnCraneOutage: true,
      alertOnDraftRestriction: true,
      alertOnDemurrageRisk: 'HIGH_SEVERE'
    },
    notifySeverity: 'ALL',
    createdAt: '2026-08-20T08:00:00Z'
  },
  gladstone: {
    portId: 'gladstone',
    portName: 'Gladstone',
    isSubscribed: false,
    channels: { inAppPush: true, emailDigest: false, soundChime: false, browserBadge: true },
    thresholds: {
      turnaroundSurgePct: 30,
      turnaroundHoursMax: 40,
      alertOnPortClosure: true,
      alertOnMonsoonCyclone: true,
      alertOnCraneOutage: true,
      alertOnDraftRestriction: true,
      alertOnDemurrageRisk: 'ALL'
    },
    notifySeverity: 'ALL',
    createdAt: '2026-08-20T08:00:00Z'
  },
  singapore: {
    portId: 'singapore',
    portName: 'Singapore Anchorage',
    isSubscribed: true,
    channels: { inAppPush: true, emailDigest: false, soundChime: true, browserBadge: true },
    thresholds: {
      turnaroundSurgePct: 20,
      turnaroundHoursMax: 24,
      alertOnPortClosure: true,
      alertOnMonsoonCyclone: true,
      alertOnCraneOutage: true,
      alertOnDraftRestriction: true,
      alertOnDemurrageRisk: 'ALL'
    },
    notifySeverity: 'ALL',
    createdAt: '2026-08-20T08:00:00Z'
  }
};

// Default initial notifications
const initialNotifications: PortAlertNotification[] = [
  {
    id: 'alert-vzg-turnaround-01',
    portId: 'visakhapatnam',
    portName: 'Visakhapatnam',
    type: 'TURNAROUND_SURGE',
    severity: 'CRITICAL',
    title: 'Turnaround Time Spiked to 58.2 Hours (+53% Surge)',
    message: 'Inner Harbor Basin Berth 4 Mobile Crane & Coal Terminal EQ-2 Continuous Ship Unloader taken offline for emergency mechanical overhaul. Anchorage queue has expanded to 19 bulk vessels with average wait times reaching 28.5 hours.',
    metrics: {
      turnaroundDelta: '+20.2 hrs (+53.2%)',
      previousTurnaround: '38.0 hrs (1.58 days)',
      currentTurnaround: '58.2 hrs (2.42 days)',
      affectedBerths: ['Inner Basin Berth 4', 'Coal Terminal EQ-2'],
      affectedVesselsCount: 19,
      demurrageRiskImpact: '$28,500/day Demurrage (High Risk)'
    },
    timestamp: '14 mins ago',
    isRead: false,
    source: 'VTS Visakhapatnam Port Operations Center',
    actionRecommendation: 'Recommended Action: Divert prompt Newcastle/Taboneo coal stems to Gangavaram (24.8h turnaround) or Dhamra to avoid ~$57,000 demurrage penalty.',
    incidentStatus: 'ACTIVE'
  },
  {
    id: 'alert-hld-closure-02',
    portId: 'haldia',
    portName: 'Haldia Dock Complex',
    type: 'PORT_CLOSURE',
    severity: 'CRITICAL',
    title: 'Lock Gate Channel Siltation & Max Draft Reduced to 9.8m',
    message: 'Monsoon siltation along River Hooghly Fairway has forced Kolkata Port Trust to suspend navigation for vessels with arrival draft >9.8m (previously 10.5m). Lock Basin Berth 2 and Berth 8 handling suspended for 48 hours until emergency suction dredging clears channel.',
    metrics: {
      turnaroundDelta: '+20.4 hrs (+44.3%)',
      previousTurnaround: '46.0 hrs',
      currentTurnaround: '66.4 hrs (2.76 days)',
      closureEstimatedDuration: '48 - 72 Hours (Expected reopening Sep 01)',
      affectedBerths: ['Lock Basin Berth 2', 'Berth 8 Coal Berth'],
      affectedVesselsCount: 15,
      demurrageRiskImpact: 'Severe Demurrage Accrual'
    },
    timestamp: '42 mins ago',
    isRead: false,
    source: 'Kolkata Port Trust Notice to Mariners #114',
    actionRecommendation: 'Immediate Action: Initiate emergency lightering at Sandheads anchorage for inbound Supramax vessels MV Hooghly Star & Eastern Venture.',
    incidentStatus: 'ACTIVE'
  },
  {
    id: 'alert-pdp-weather-03',
    portId: 'paradip',
    portName: 'Paradip',
    type: 'WEATHER_CYCLONE',
    severity: 'WARNING',
    title: 'Outer Anchorage Swell (2.2m) & CSU Unloader #2 Throttle',
    message: 'Bay of Bengal monsoon depression generating 2.2m long-period swells at Outer Anchorage. Pilot boarding operations intermittently halted. CSU Unloader Beta operating at 65% rated capacity due to vessel surge motion at Berth 1.',
    metrics: {
      turnaroundDelta: '+10.5 hrs (+30.8%)',
      previousTurnaround: '34.0 hrs',
      currentTurnaround: '44.5 hrs (1.85 days)',
      affectedBerths: ['Berth 1 (Mechanized Coal)'],
      affectedVesselsCount: 12,
      weatherCondition: 'SSW 19 kts / 2.2m Sea Swell'
    },
    timestamp: '1.5 hours ago',
    isRead: false,
    source: 'Paradip Port Trust Hydrographic Warning #08-29',
    actionRecommendation: 'Recommended Action: Request 24h laycan adjustment from charterer or hold prompt fixing until swell abates on Sep 02.',
    incidentStatus: 'ACTIVE'
  },
  {
    id: 'alert-new-restore-04',
    portId: 'newcastle',
    portName: 'Newcastle (Australia)',
    type: 'CRANE_OUTAGE',
    severity: 'INFO',
    title: 'PWCS Berth 2 High-Speed Shiploader Restored',
    message: 'Planned conveyor transfer chute replacement completed ahead of schedule. Nominal 4,800 TPH loading restored. Turnaround times have normalized to 34.0 hours with offshore queue reduced to 8 vessels.',
    metrics: {
      turnaroundDelta: '-14.0 hrs (Normalized)',
      previousTurnaround: '48.0 hrs',
      currentTurnaround: '34.0 hrs (1.41 days)',
      affectedBerths: ['PWCS Berth 2', 'Kooragang Berth 4']
    },
    timestamp: '3.5 hours ago',
    isRead: true,
    source: 'Port Authority of New South Wales Dispatch',
    actionRecommendation: 'Standard Pacific load stems can proceed on schedule without congestion risk.',
    incidentStatus: 'RESOLVED'
  },
  {
    id: 'alert-rb-rail-05',
    portId: 'richards_bay',
    portName: 'Richards Bay',
    type: 'CONGESTION_LOGJAM',
    severity: 'WARNING',
    title: 'Transnet Rail Bottleneck Causing Berth 3 Coal Feed Delay',
    message: 'Locomotive maintenance shortages along the Mpumalanga-Richards Bay corridor have reduced daily rake deliveries to the export terminal stockpile by 28%. Vessel turnaround times expanded by 18 hours.',
    metrics: {
      turnaroundDelta: '+18.0 hrs (+38.3%)',
      previousTurnaround: '47.0 hrs',
      currentTurnaround: '65.0 hrs (2.70 days)',
      affectedVesselsCount: 11,
      demurrageRiskImpact: 'Moderate Risk for Capesize Vessels'
    },
    timestamp: '6 hours ago',
    isRead: true,
    source: 'RBCT Terminal Logistics Report',
    actionRecommendation: 'Confirm minimum 100,000 MT verified stockpile with suppliers prior to stem stem confirmation.',
    incidentStatus: 'MONITORING'
  }
];

// Audio chime using Web Audio API
const playAlertSound = (severity: AlertSeverity) => {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    
    const audioCtx = new AudioContextClass();
    const now = audioCtx.currentTime;

    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    if (severity === 'CRITICAL') {
      // Urgent high-attention maritime alert tone
      osc1.frequency.setValueAtTime(880, now); // A5
      osc1.frequency.exponentialRampToValueAtTime(1174.66, now + 0.12); // D6
      osc2.frequency.setValueAtTime(659.25, now + 0.12); // E5
      osc2.frequency.exponentialRampToValueAtTime(880, now + 0.28); // A5
    } else if (severity === 'WARNING') {
      // Warm alert tone
      osc1.frequency.setValueAtTime(587.33, now); // D5
      osc1.frequency.setValueAtTime(783.99, now + 0.15); // G5
    } else {
      // Subtle info chime
      osc1.frequency.setValueAtTime(523.25, now); // C5
      osc1.frequency.setValueAtTime(659.25, now + 0.12); // E5
    }

    gainNode.gain.setValueAtTime(0.08, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc1.connect(gainNode);
    if (severity === 'CRITICAL') {
      osc2.connect(gainNode);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.35);
    }

    gainNode.connect(audioCtx.destination);
    osc1.start(now);
    osc1.stop(now + 0.38);
  } catch (e) {
    // Audio context not allowed or blocked
    console.debug('Web audio autoplay restrained:', e);
  }
};

const PortAlertContext = createContext<PortAlertContextType | undefined>(undefined);

export const PortAlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [subscriptions, setSubscriptions] = useState<Record<string, PortAlertSubscription>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SUBSCRIPTIONS);
      if (saved) {
        return { ...defaultSubscriptions, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Failed reading subscriptions from localStorage:', e);
    }
    return defaultSubscriptions;
  });

  const [vesselSubscriptions, setVesselSubscriptions] = useState<Record<string, VesselAlertSubscription>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_VESSEL_SUBSCRIPTIONS);
      if (saved) {
        return { ...defaultVesselSubscriptions, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Failed reading vessel subscriptions from localStorage:', e);
    }
    return defaultVesselSubscriptions;
  });

  const [notifications, setNotifications] = useState<PortAlertNotification[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_NOTIFICATIONS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed reading notifications from localStorage:', e);
    }
    return initialNotifications;
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SOUND);
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const [activePushToast, setActivePushToast] = useState<PortAlertNotification | null>(null);
  const [isAlertCenterOpen, setIsAlertCenterOpen] = useState<boolean>(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState<boolean>(false);
  const [selectedPortForModal, setSelectedPortForModal] = useState<string | null>(null);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SUBSCRIPTIONS, JSON.stringify(subscriptions));
    } catch (e) {
      console.warn('Error storing subscriptions:', e);
    }
  }, [subscriptions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(notifications));
    } catch (e) {
      console.warn('Error storing notifications:', e);
    }
  }, [notifications]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_VESSEL_SUBSCRIPTIONS, JSON.stringify(vesselSubscriptions));
    } catch (e) {
      console.warn('Error storing vessel subscriptions:', e);
    }
  }, [vesselSubscriptions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SOUND, JSON.stringify(soundEnabled));
    } catch (e) {
      console.warn('Error storing sound preference:', e);
    }
  }, [soundEnabled]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const toggleSound = () => {
    setSoundEnabled(prev => !prev);
  };

  const toggleSubscription = (portId: string, portName?: string) => {
    setSubscriptions(prev => {
      const existing = prev[portId];
      const name = portName || existing?.portName || portIntelligenceData.find(p => p.id === portId)?.name || portId;
      
      if (existing) {
        return {
          ...prev,
          [portId]: {
            ...existing,
            isSubscribed: !existing.isSubscribed
          }
        };
      } else {
        // Create new subscription entry
        return {
          ...prev,
          [portId]: {
            portId,
            portName: name,
            isSubscribed: true,
            channels: { inAppPush: true, emailDigest: false, soundChime: true, browserBadge: true },
            thresholds: {
              turnaroundSurgePct: 25,
              turnaroundHoursMax: 48,
              alertOnPortClosure: true,
              alertOnMonsoonCyclone: true,
              alertOnCraneOutage: true,
              alertOnDraftRestriction: true,
              alertOnDemurrageRisk: 'ALL'
            },
            notifySeverity: 'ALL',
            createdAt: new Date().toISOString()
          }
        };
      }
    });
  };

  const toggleVesselSubscription = (vesselId: string, vesselName?: string) => {
    setVesselSubscriptions(prev => {
      const existing = prev[vesselId];
      const name = vesselName || existing?.vesselName || initialTrackedVessels.find(v => v.id === vesselId)?.name || vesselId;

      if (existing) {
        return {
          ...prev,
          [vesselId]: {
            ...existing,
            isSubscribed: !existing.isSubscribed
          }
        };
      }

      return {
        ...prev,
        [vesselId]: {
          vesselId,
          vesselName: name,
          isSubscribed: true,
          channels: { inAppPush: true, emailDigest: false, soundChime: true, browserBadge: true },
          notifySeverity: 'ALL',
          createdAt: new Date().toISOString()
        }
      };
    });
  };

  const updateSubscription = (portId: string, updates: Partial<PortAlertSubscription>) => {
    setSubscriptions(prev => {
      const existing = prev[portId];
      if (!existing) return prev;
      return {
        ...prev,
        [portId]: {
          ...existing,
          ...updates
        }
      };
    });
  };

  const subscribeToAll = (portIds: string[]) => {
    setSubscriptions(prev => {
      const updated = { ...prev };
      portIds.forEach(id => {
        const portInfo = portIntelligenceData.find(p => p.id === id);
        const name = portInfo?.name || id;
        if (updated[id]) {
          updated[id] = { ...updated[id], isSubscribed: true };
        } else {
          updated[id] = {
            portId: id,
            portName: name,
            isSubscribed: true,
            channels: { inAppPush: true, emailDigest: true, soundChime: true, browserBadge: true },
            thresholds: {
              turnaroundSurgePct: 25,
              turnaroundHoursMax: 48,
              alertOnPortClosure: true,
              alertOnMonsoonCyclone: true,
              alertOnCraneOutage: true,
              alertOnDraftRestriction: true,
              alertOnDemurrageRisk: 'ALL'
            },
            notifySeverity: 'ALL',
            createdAt: new Date().toISOString()
          };
        }
      });
      return updated;
    });
  };

  const unsubscribeAll = () => {
    setSubscriptions(prev => {
      const updated: Record<string, PortAlertSubscription> = {};
      Object.keys(prev).forEach(key => {
        updated[key] = { ...prev[key], isSubscribed: false };
      });
      return updated;
    });
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
    setActivePushToast(null);
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    if (activePushToast?.id === notificationId) {
      setActivePushToast(null);
    }
  };

  const dismissPushToast = () => {
    setActivePushToast(null);
  };

  const openAlertCenter = () => {
    setIsAlertCenterOpen(true);
  };

  const closeAlertCenter = () => {
    setIsAlertCenterOpen(false);
  };

  const openSubscriptionModal = (portId?: string) => {
    setSelectedPortForModal(portId || null);
    setIsSubscriptionModalOpen(true);
  };

  const closeSubscriptionModal = () => {
    setIsSubscriptionModalOpen(false);
    setSelectedPortForModal(null);
  };

  const simulatePortAlert = useCallback((customAlert?: Partial<PortAlertNotification>) => {
    const alertId = `alert-live-${Date.now()}`;
    const targetPortId = customAlert?.portId || 'paradip';
    const targetPort = portIntelligenceData.find(p => p.id === targetPortId);
    const portName = customAlert?.portName || targetPort?.name || 'Paradip';

    const newNotification: PortAlertNotification = {
      id: alertId,
      portId: targetPortId,
      portName: portName,
      type: customAlert?.type || 'TURNAROUND_SURGE',
      severity: customAlert?.severity || 'CRITICAL',
      title: customAlert?.title || `Drastic Turnaround Surge Alert: ${portName}`,
      message: customAlert?.message || `Automated telemetry alert: Turnaround times have surged by +48% in the last 4 hours due to sudden swell and mechanized unloader breakdown.`,
      metrics: {
        turnaroundDelta: customAlert?.metrics?.turnaroundDelta || '+18.5 hrs (+48.2%)',
        previousTurnaround: customAlert?.metrics?.previousTurnaround || '34.0 hrs',
        currentTurnaround: customAlert?.metrics?.currentTurnaround || '52.5 hrs (2.18 days)',
        affectedBerths: customAlert?.metrics?.affectedBerths || ['Berth 1 (Mechanized Coal)', 'Berth 3'],
        affectedVesselsCount: customAlert?.metrics?.affectedVesselsCount || 16,
        demurrageRiskImpact: customAlert?.metrics?.demurrageRiskImpact || '$24,000/day Demurrage Penalty',
        closureEstimatedDuration: customAlert?.metrics?.closureEstimatedDuration,
        weatherCondition: customAlert?.metrics?.weatherCondition
      },
      timestamp: 'Just now',
      isRead: false,
      source: customAlert?.source || `${portName} Port Control VTS Telemetry Live`,
      actionRecommendation: customAlert?.actionRecommendation || `Immediate Review: Inspect alternative discharge berths or notify vessel masters to adjust speed for virtual arrival.`,
      incidentStatus: customAlert?.incidentStatus || 'ACTIVE'
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Check if subscription allows in-app push & sound
    const sub = subscriptions[targetPortId];
    const shouldPush = !sub || (sub.isSubscribed && sub.channels.inAppPush);
    const shouldSound = soundEnabled && (!sub || (sub.isSubscribed && sub.channels.soundChime));

    if (shouldPush) {
      setActivePushToast(newNotification);
    }

    if (shouldSound) {
      playAlertSound(newNotification.severity);
    }
  }, [soundEnabled, subscriptions]);

  const simulateVesselAlert = useCallback((customAlert?: Partial<PortAlertNotification>) => {
    const alertId = `alert-vessel-live-${Date.now()}`;
    const targetVesselId = customAlert?.portId || 'vessel-asian-progress';
    const targetVessel = initialTrackedVessels.find(v => v.id === targetVesselId);
    const vesselName = customAlert?.portName || targetVessel?.name || 'Tracked Vessel';

    const newNotification: PortAlertNotification = {
      id: alertId,
      portId: targetVesselId,
      portName: vesselName,
      type: customAlert?.type || 'DEMURRAGE_ESCALATION',
      severity: customAlert?.severity || 'WARNING',
      title: customAlert?.title || `Demurrage Risk Escalation: ${vesselName}`,
      message: customAlert?.message || `Automated AIS telemetry alert: ${vesselName}'s projected anchorage wait has increased, raising demurrage exposure at destination.`,
      metrics: {
        affectedVesselsCount: 1,
        demurrageRiskImpact: customAlert?.metrics?.demurrageRiskImpact || 'Risk band raised one level'
      },
      timestamp: 'Just now',
      isRead: false,
      source: customAlert?.source || `${vesselName} Satellite AIS Feed`,
      actionRecommendation: customAlert?.actionRecommendation || 'Review updated ETA and consider adjusting laycan or speed instructions.',
      incidentStatus: customAlert?.incidentStatus || 'ACTIVE',
      targetType: 'VESSEL'
    };

    setNotifications(prev => [newNotification, ...prev]);

    const sub = vesselSubscriptions[targetVesselId];
    const shouldPush = sub?.isSubscribed && sub.channels.inAppPush;
    const shouldSound = soundEnabled && sub?.isSubscribed && sub.channels.soundChime;

    if (shouldPush) {
      setActivePushToast(newNotification);
    }

    if (shouldSound) {
      playAlertSound(newNotification.severity);
    }
  }, [soundEnabled, vesselSubscriptions]);

  const triggerPredefinedScenario = (scenarioKey: 'paradip_closure' | 'visakhapatnam_spike' | 'haldia_draft' | 'newcastle_shiploader' | 'richards_bay_rail' | 'cyclone_evacuation') => {
    switch (scenarioKey) {
      case 'paradip_closure':
        simulatePortAlert({
          portId: 'paradip',
          portName: 'Paradip',
          type: 'PORT_CLOSURE',
          severity: 'CRITICAL',
          title: 'UNEXPECTED CLOSURE: Paradip Fairway Suspended Due to Long Swell (3.4m)',
          message: 'Paradip Port Authority has declared an emergency suspension of all vessel movements. Wave buoy #3 records 3.4m heavy seas preventing tug assist maneuvers. All 14 anchored bulk carriers ordered to stand clear.',
          metrics: {
            turnaroundDelta: '+32.0 hrs (+94%)',
            previousTurnaround: '34.0 hrs',
            currentTurnaround: '66.0 hrs (2.75 days)',
            closureEstimatedDuration: 'Estimated 36h suspension until swell subsides',
            affectedBerths: ['All Coal Berths 1-4', 'Iron Ore Terminal'],
            affectedVesselsCount: 17,
            demurrageRiskImpact: 'Severe ($24,000/day Demurrage)'
          },
          source: 'Paradip Port Trust Emergency Broadcast #109',
          actionRecommendation: 'Alert Chartering Desk: Hold prompt Panamax fixtures. Request 48h laycan extension on open charters.',
          incidentStatus: 'ACTIVE'
        });
        break;

      case 'visakhapatnam_spike':
        simulatePortAlert({
          portId: 'visakhapatnam',
          portName: 'Visakhapatnam',
          type: 'TURNAROUND_SURGE',
          severity: 'CRITICAL',
          title: 'DRASTIC TURNAROUND SPIKE: Vizag Turnaround Surges to 64.5h (+70%)',
          message: 'Both Grab Unloaders at Outer Berth #1 suffer electrical power grid failure. Bulk discharge halted while 22 vessels remain anchored. Turnaround time has blown out past 2.68 days.',
          metrics: {
            turnaroundDelta: '+26.5 hrs (+69.7%)',
            previousTurnaround: '38.0 hrs',
            currentTurnaround: '64.5 hrs (2.68 days)',
            affectedBerths: ['Outer Berth 1', 'Outer Berth 2'],
            affectedVesselsCount: 22,
            demurrageRiskImpact: '$28,500/day Demurrage Penalty'
          },
          source: 'Visakhapatnam Port Operations Alert',
          actionRecommendation: 'Immediate Action: Divert prompt inbound Panamax stems to Gangavaram Port immediately to avoid $57K+ demurrage liability.',
          incidentStatus: 'ACTIVE'
        });
        break;

      case 'haldia_draft':
        simulatePortAlert({
          portId: 'haldia',
          portName: 'Haldia',
          type: 'DRAFT_RESTRICTION',
          severity: 'CRITICAL',
          title: 'EMERGENCY DRAFT CUT: River Hooghly Max Draft Cut to 9.2m',
          message: 'Upstream flash flooding causes massive silt deposition across Haldia lock gate approaches. Maximum safe draft reduced from 10.5m to 9.2m. Fully loaded Supramax vessels cannot transit.',
          metrics: {
            turnaroundDelta: '+28.0 hrs (+60.8%)',
            previousTurnaround: '46.0 hrs',
            currentTurnaround: '74.0 hrs (3.08 days)',
            closureEstimatedDuration: 'Lightering mandatory at Sandheads for next 5 days',
            affectedBerths: ['Lock Basin Berth 2', 'Berth 4B'],
            affectedVesselsCount: 16
          },
          source: 'Haldia Dock Complex AIS Navigational Flash',
          actionRecommendation: 'Deploy floating cranes at Sandheads for 15,000 MT lightering prior to lock entry.',
          incidentStatus: 'ACTIVE'
        });
        break;

      case 'newcastle_shiploader':
        simulatePortAlert({
          portId: 'newcastle',
          portName: 'Newcastle',
          type: 'CRANE_OUTAGE',
          severity: 'WARNING',
          title: 'UNEXPECTED OUTAGE: Kooragang Berth 4 Shiploader Hydraulic Line Burst',
          message: 'High-speed shiploader at Kooragang Coal Terminal offline. Loading rates drop by 50% across the terminal. Offshore vessel queue surges from 8 to 15 Capesize/Panamax vessels.',
          metrics: {
            turnaroundDelta: '+18.5 hrs (+54.4%)',
            previousTurnaround: '34.0 hrs',
            currentTurnaround: '52.5 hrs (2.19 days)',
            affectedBerths: ['Kooragang Berth 4 (Coal Export)'],
            affectedVesselsCount: 15
          },
          source: 'Port Authority of New South Wales Bulletin',
          actionRecommendation: 'Reschedule Newcastle loading laycans by 3-5 days to avoid anchorage waiting costs.',
          incidentStatus: 'ACTIVE'
        });
        break;

      case 'richards_bay_rail':
        simulatePortAlert({
          portId: 'richards_bay',
          portName: 'Richards Bay',
          type: 'CONGESTION_LOGJAM',
          severity: 'WARNING',
          title: 'CONGESTION LOGJAM: Richards Bay Rail Stoppage Delays Coal Feed',
          message: 'Transnet rail supply line disruption cuts RBCT daily coal deliveries by 45%. Multiple export vessels forced into cold anchorage wait while terminal stockpiles run low.',
          metrics: {
            turnaroundDelta: '+22.0 hrs (+46.8%)',
            previousTurnaround: '47.0 hrs',
            currentTurnaround: '69.0 hrs (2.87 days)',
            affectedBerths: ['RBCT Export Berth 1 & 2'],
            affectedVesselsCount: 14
          },
          source: 'RBCT Operations Dispatch',
          actionRecommendation: 'Verify stockpile verification certificates from coal suppliers before fixing spot tonnage.',
          incidentStatus: 'ACTIVE'
        });
        break;

      case 'cyclone_evacuation':
        simulatePortAlert({
          portId: 'visakhapatnam',
          portName: 'Visakhapatnam & Gangavaram',
          type: 'WEATHER_CYCLONE',
          severity: 'CRITICAL',
          title: 'CYCLONIC STORM WARNING: Cyclone Alert Level 4 – Ports Evacuate Anchorages',
          message: 'IMD issues severe cyclonic storm advisory for Andhra Pradesh coastline. Maximum sustained winds 55-65 kts, gusting to 75 kts. Port Captain orders all vessels to slip moorings and proceed to deep water open sea.',
          metrics: {
            turnaroundDelta: '+48.0 hrs (+126%)',
            previousTurnaround: '38.0 hrs',
            currentTurnaround: '86.0 hrs (3.58 days)',
            closureEstimatedDuration: 'Full port shutdown for next 48-60 hours',
            affectedBerths: ['All Berths 1-24', 'Outer & Inner Harbors'],
            affectedVesselsCount: 31,
            weatherCondition: 'Winds 60 kts / 4.5m Rough Seas'
          },
          source: 'Indian Meteorological Department & VTS Emergency Protocol',
          actionRecommendation: 'CRITICAL: Halt all vessel routing to East Coast India. Issue storm avoidance steaming orders immediately.',
          incidentStatus: 'ACTIVE'
        });
        break;
    }
  };

  // Auto-fire a random scenario every ~100-200s so alerts evolve on their own while the app is open.
  // Refs keep the callbacks/state fresh (latest subscriptions/soundEnabled) without restarting the timer loop.
  const scenarioKeys: Array<'paradip_closure' | 'visakhapatnam_spike' | 'haldia_draft' | 'newcastle_shiploader' | 'richards_bay_rail' | 'cyclone_evacuation'> = [
    'paradip_closure', 'visakhapatnam_spike', 'haldia_draft', 'newcastle_shiploader', 'richards_bay_rail', 'cyclone_evacuation'
  ];
  const triggerScenarioRef = useRef(triggerPredefinedScenario);
  triggerScenarioRef.current = triggerPredefinedScenario;
  const simulateVesselAlertRef = useRef(simulateVesselAlert);
  simulateVesselAlertRef.current = simulateVesselAlert;
  const vesselSubscriptionsRef = useRef(vesselSubscriptions);
  vesselSubscriptionsRef.current = vesselSubscriptions;

  const vesselAlertTemplates: Array<(id: string, name: string) => Partial<PortAlertNotification>> = [
    (id, name) => ({
      portId: id, portName: name, type: 'DRAFT_COMPLIANCE_CHANGE', severity: 'WARNING',
      title: `Draft Compliance Change: ${name}`,
      message: `${name}'s current laden draft profile has shifted against its destination berth limit following updated stowage figures.`,
      metrics: { affectedVesselsCount: 1 },
      actionRecommendation: 'Re-verify berth fit assessment before final approach.'
    }),
    (id, name) => ({
      portId: id, portName: name, type: 'DEMURRAGE_ESCALATION', severity: 'WARNING',
      title: `Demurrage Risk Escalation: ${name}`,
      message: `${name}'s projected anchorage wait has increased, raising demurrage exposure at destination.`,
      metrics: { affectedVesselsCount: 1, demurrageRiskImpact: 'Risk band raised one level' },
      actionRecommendation: 'Review updated ETA and consider adjusting laycan or speed instructions.'
    }),
    (id, name) => ({
      portId: id, portName: name, type: 'CHOKEPOINT_PROXIMITY', severity: 'INFO',
      title: `Chokepoint Proximity Alert: ${name}`,
      message: `${name} is approaching a designated strategic chokepoint corridor; enhanced monitoring engaged.`,
      metrics: { affectedVesselsCount: 1 },
      actionRecommendation: 'No action required — informational proximity notice.'
    })
  ];

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const scheduleNext = () => {
      const delay = 100000 + Math.random() * 100000;
      timeoutId = setTimeout(() => {
        const allVesselSubs: VesselAlertSubscription[] = Object.values(vesselSubscriptionsRef.current);
        const subscribedVesselIds = allVesselSubs
          .filter(s => s.isSubscribed)
          .map(s => s.vesselId);

        if (subscribedVesselIds.length > 0 && Math.random() < 0.35) {
          const vesselId = subscribedVesselIds[Math.floor(Math.random() * subscribedVesselIds.length)];
          const vesselName = vesselSubscriptionsRef.current[vesselId].vesselName;
          const template = vesselAlertTemplates[Math.floor(Math.random() * vesselAlertTemplates.length)];
          simulateVesselAlertRef.current(template(vesselId, vesselName));
        } else {
          const key = scenarioKeys[Math.floor(Math.random() * scenarioKeys.length)];
          triggerScenarioRef.current(key);
        }
        scheduleNext();
      }, delay);
    };

    scheduleNext();
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <PortAlertContext.Provider
      value={{
        subscriptions,
        vesselSubscriptions,
        notifications,
        activePushToast,
        unreadCount,
        soundEnabled,
        isAlertCenterOpen,
        isSubscriptionModalOpen,
        selectedPortForModal,
        toggleSound,
        toggleSubscription,
        toggleVesselSubscription,
        updateSubscription,
        subscribeToAll,
        unsubscribeAll,
        markAsRead,
        markAllAsRead,
        clearNotifications,
        deleteNotification,
        dismissPushToast,
        openAlertCenter,
        closeAlertCenter,
        openSubscriptionModal,
        closeSubscriptionModal,
        simulatePortAlert,
        simulateVesselAlert,
        triggerPredefinedScenario
      }}
    >
      {children}
    </PortAlertContext.Provider>
  );
};

export const usePortAlerts = (): PortAlertContextType => {
  const context = useContext(PortAlertContext);
  if (!context) {
    throw new Error('usePortAlerts must be used within a PortAlertProvider');
  }
  return context;
};
