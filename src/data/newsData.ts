import { NewsArticle, MorningBriefing } from '../types';

export const morningBriefingData: MorningBriefing = {
  date: 'August 30, 2026',
  edition: 'Dispatch No. 884 · Morning Session',
  headline: 'Pacific Panamax Ballast Surge Softens Forward Coal Curves; East Coast India Congestion Modulates',
  summary: 'Pacific dry bulk chartering opens with downward pressure on Australian coal corridors as ballast fleet replenishment reaches a 3-week peak off Eastern Australia. In contrast, Indonesian thermal coal spot availability remains constricted by localized Kalimantan barging bottlenecks, keeping Supramax fixtures elevated.',
  tonnageBalancePacific: 'Supply Heavy (Panamax +14.2% available tonnage vs 30d avg)',
  tonnageBalanceAtlantic: 'Balanced to Tight (Transatlantic Capesize firming)',
  bunkerBenchmarkSingapore: '$618.50/MT VLSFO (-$2.20)',
  bunkerBenchmarkFujairah: '$605.00/MT VLSFO (-$1.80)',
  bdiScore: 1842,
  bdiChange: '-18 pts (-0.97%)',
  keyDrivers: [
    'Newcastle PWCS & NCIG vessel queue stabilizes at 14 vessels with avg waiting 3.8 days',
    'Paradip mechanized coal berth queue eases from 4.2 to 3.1 days delay',
    'Panamax spot rates Newcastle → Paradip steady at $14.80/MT, forward contracts projected at $13.65/MT',
    'Indonesian HBA thermal coal benchmark adjusted upward by $1.85/MT for September delivery windows'
  ]
};

export const newsArticlesData: NewsArticle[] = [
  {
    id: 'art-001',
    title: 'Newcastle Port Commission Announces PWCS Shiploader Maintenance Window for Mid-September',
    subtitle: 'Scheduled berth outage to throttle daily throughput by 18% over a 5-day window.',
    category: 'ports',
    impact: 'HIGH',
    source: 'Port of Newcastle Operations & Marine Advisory',
    author: 'Maritime Infrastructure Desk',
    publishedAt: 'Today, 06:45 UTC',
    readingTime: '3 min read',
    summary: 'Port Waratah Coal Services (PWCS) has formally filed a maintenance outage notice for Shiploader #3 at the Carrington and Kooragang terminals between September 14–19, 2026.',
    paragraphs: [
      'The scheduled five-day technical overhaul of Shiploader #3 at Kooragang Coal Terminal is intended to complete mandatory structural gear calibrations ahead of the peak Q4 export season. While berths 1 and 2 will operate at full capacity, total daily loading rates will temporarily decline from approximately 420,000 MT/day to 345,000 MT/day.',
      'Charterers fixing laycans in the Sep 12–22 window are advised to account for a potential 1.5 to 2.2 day expansion in anchorage waiting times off Stockton Beach. Demurrage exposure for post-Panamax and Capesize stems booked on narrow turnaround parameters should be closely evaluated.',
      'Commercial bulk traders targeting discharge at Indian terminals (Paradip, Gangavaram, Krishnapatnam) should review whether pre-loading prior to September 12 or delaying stems to late September offers superior net voyage economics.'
    ],
    keyTakeaways: [
      'PWCS daily throughput down ~18% during September 14–19 maintenance',
      'Anchorage wait times projected to expand by +1.8 days for mid-September laycans',
      'Advisable to target loading dates prior to Sep 12 or post-Sep 22 to evade demurrage'
    ],
    affectedCommodities: ['Thermal Coal', 'Coking Coal', 'PCI Coal'],
    affectedPorts: ['Newcastle', 'Gladstone', 'Paradip', 'Visakhapatnam'],
    affectedVesselClasses: ['Panamax', 'Capesize', 'Kamsarmax'],
    rateImpact: {
      metric: 'Newcastle Loading Demurrage Risk',
      delta: '+$0.35/MT equivalent',
      direction: 'up',
      timeframe: 'Sep 12–22 laycans'
    },
    tags: ['Newcastle', 'Port Maintenance', 'Demurrage', 'Coal Logistics'],
    isFeatured: true
  },
  {
    id: 'art-002',
    title: 'Pacific Panamax Ballast Supply Expands: 18 Tonnage Stems Repositioning to Eastern Australia',
    subtitle: 'Post-discharge ballasters from North Asia create tonnage surplus in the Coral Sea.',
    category: 'ships',
    impact: 'CRITICAL',
    source: 'Baltic Dry Bulk Fleet Monitor',
    author: 'Freight Derivatives & Tonnage Research',
    publishedAt: 'Today, 05:20 UTC',
    readingTime: '4 min read',
    summary: 'An unseasonably concentrated cluster of Panamax and Kamsarmax vessels discharging in Southern China and Japan have opened in ballast towards Queensland and New South Wales.',
    paragraphs: [
      'Vessel tracking telemetry confirms that 18 modern Panamax/Kamsarmax bulk carriers (75,000–84,000 DWT) have initiated southbound ballasting trajectories across the Philippine Sea and Coral Sea over the past 72 hours, targeting late-August and mid-September prompt loading.',
      'This sudden influx of spot tonnage is tipping the regional chartering supply balance heavily in favor of cargo owners and charterers. Shipowners who were holding firm on $15.50/MT freight ideas for Newcastle to India East Coast are already accepting bids closer to $14.80/MT, with chartering desk brokers anticipating softening towards $13.65–$13.80/MT over the next 10 business days.',
      'Our quantitative chartering model reinforces a HOLD recommendation on spot prompt bookings, as delaying contractual commitments by 7–10 days unlocks estimated cost reductions of $1.15/MT, yielding approximately $207,000 in net voyage savings on a standard 180,000 MT Parcel.'
    ],
    keyTakeaways: [
      '18 Panamax vessels ballasting to Australia increases Pacific spot tonnage supply by +14%',
      'Chartering rates on Newcastle → East Coast India under immediate downward pressure',
      'Supports the algorithmic recommendation to HOLD spot chartering for 7–10 days'
    ],
    affectedCommodities: ['Coal', 'Bauxite', 'Iron Ore Fines'],
    affectedPorts: ['Newcastle', 'Hay Point', 'Gladstone', 'Paradip', 'Haldia'],
    affectedVesselClasses: ['Panamax', 'Kamsarmax', 'Post-Panamax'],
    rateImpact: {
      metric: 'Panamax C5/Newcastle Freight Index',
      delta: '-$1.15/MT projected',
      direction: 'down',
      timeframe: 'Next 10–14 days'
    },
    tags: ['Tonnage Supply', 'Panamax', 'Freight Softening', 'Chartering Timing'],
    isFeatured: true
  },
  {
    id: 'art-003',
    title: 'Indian Power Utilities Issue 4.2 Million MT Thermal Coal Procurement Tenders for Q3/Q4 Buffer Stock',
    subtitle: 'NTPC and state power generation corporations ramp up seaborne blending inventories.',
    category: 'commodities',
    impact: 'HIGH',
    source: 'S&P Global Commodity Insights',
    author: 'Thermal Energy & Coal Advisory',
    publishedAt: 'Yesterday, 18:15 UTC',
    readingTime: '4 min read',
    summary: 'State-backed power utilities in Eastern and Southern India have published international import tenders totaling 4.2 million metric tons of thermal coal (5,000–6,000 kcal/kg NAR).',
    paragraphs: [
      'To mitigate domestic coal transport rail rakes shortages and sustain power generation during peak post-monsoon industrial demand, central and state power entities have floated competitive import parcels for deliveries spanning late September through November 2026.',
      'Of the 4.2M MT aggregate tender, approximately 65% is specified for delivery into East Coast discharge ports—predominantly Paradip, Visakhapatnam, and Krishnapatnam—with the remaining 35% destined for West Coast hubs (Mundra, Kandla, Dahej).',
      'The physical supply demand is expected to absorb a portion of the seasonal vessel surplus, establishing a reliable support floor for freight rates around $13.50/MT on Australian routes and $10.50/MT on Indonesian short-haul routes.'
    ],
    keyTakeaways: [
      '4.2M MT seaborne thermal coal tenders issued for Q3/Q4 Indian utility replenishment',
      'Paradip and Visakhapatnam to receive 2.7M MT of incoming cargo volume',
      'Secures baseline demand floor preventing freight collapse below $13.20/MT'
    ],
    affectedCommodities: ['Thermal Coal (6,000 NAR)', 'Indonesian 4,200 GAR Coal'],
    affectedPorts: ['Paradip', 'Visakhapatnam', 'Krishnapatnam', 'Newcastle', 'Taboneo'],
    affectedVesselClasses: ['Panamax', 'Supramax', 'Ultramax'],
    rateImpact: {
      metric: 'Pacific Thermal Coal Spot Demand',
      delta: '+4.2M MT Cargo Demand',
      direction: 'up',
      timeframe: 'Q3/Q4 2026'
    },
    tags: ['India Energy', 'Tenders', 'Thermal Coal', 'Utility Stocks']
  },
  {
    id: 'art-004',
    title: 'Paradip Port Mechanized Berth #2 Achieves Record 68,000 MT/Day Discharge Efficiency',
    subtitle: 'Newly commissioned automated rail-mounted unloaders shorten vessel turnaround.',
    category: 'ports',
    impact: 'MODERATE',
    source: 'Paradip Port Authority Technical Review',
    author: 'Port Engineering Directorate',
    publishedAt: 'Yesterday, 14:30 UTC',
    readingTime: '2 min read',
    summary: 'The operationalization of continuous conveyor unloaders at Paradip Port Coal Berth #2 has increased average vessel discharge rates from 48,000 MT/day to 68,000 MT/day.',
    paragraphs: [
      'Paradip Port Trust announced that modernization works on the East Quay coal receiving berths are now fully operational. The upgrade allows standard gearless Panamax bulkers carrying 75,000 MT parcels to complete discharge and unberth in approximately 26 to 28 hours under optimal conditions.',
      'The enhanced discharge speed significantly reduces turnaround variability and waiting vessel queues. Port authority data indicates average vessel pre-berthing wait times on the coal line have declined from 4.2 days to 3.1 days, lowering port disbursement accounts (PDA) and detention liabilities for charterers.',
      'Vessel operators are reminded that maximum permissible draft remains strictly capped at 14.50 meters at low water, with mandatory tidal windows applied for vessels exceeding 14.0 meters.'
    ],
    keyTakeaways: [
      'Discharge velocity improved by +41% to 68,000 MT/day at Berth #2',
      'Average vessel queue delays cut from 4.2 days down to 3.1 days',
      'Draft ceiling unchanged at 14.50m; strict compliance required'
    ],
    affectedCommodities: ['Thermal Coal', 'Coking Coal', 'Petcoke'],
    affectedPorts: ['Paradip', 'Newcastle', 'Gladstone'],
    affectedVesselClasses: ['Panamax', 'Kamsarmax'],
    rateImpact: {
      metric: 'Paradip Demurrage / Waiting Cost',
      delta: '-$0.25/MT equivalent savings',
      direction: 'down',
      timeframe: 'Immediate'
    },
    tags: ['Paradip Port', 'Turnaround Times', 'Discharge Efficiency', 'Berth Automation']
  },
  {
    id: 'art-005',
    title: 'Malacca Strait Navigation Alert: Monsoon Sea Swell & Tug-Barge Congestion Near Singapore Hub',
    subtitle: 'Navigational notice urges masters to maintain enhanced watch in Phillips Channel.',
    category: 'routes',
    impact: 'MODERATE',
    source: 'Maritime & Port Authority of Singapore (MPA)',
    author: 'Hydrographic & Safety Office',
    publishedAt: 'Aug 29, 2026',
    readingTime: '3 min read',
    summary: 'Seasonal Southwest monsoon squalls combined with high bunkering anchorage density off Eastern Outer Port Limits have led to increased maritime traffic density.',
    paragraphs: [
      'Vessels transiting eastbound through the Singapore Strait and Malacca Corridor are experiencing moderate speed reductions due to dense localized tug and barge activity near Raffles Lighthouse and Karimun Anchorage.',
      'Bulk carriers steaming at economic speeds (11.5–12.5 knots) on the Newcastle-to-India East Coast corridor via Malacca or Lombok Straits should account for an extra 4 to 6 hours in total navigational transit buffers.',
      'Bunker supply barges in Singapore Western Anchorage report VLSFO 0.5% barge scheduling wait times of 12–18 hours, though prompt spot fuel stems remain readily available at $618.50/MT.'
    ],
    keyTakeaways: [
      'Navigation transit buffer of +4 to +6 hours advised for Malacca Strait passages',
      'Singapore VLSFO bunker availability remains robust at $618.50/MT',
      'Lombok Strait alternative route remains clear with negligible swell'
    ],
    affectedCommodities: ['All Bulk Commodities'],
    affectedPorts: ['Singapore', 'Port Klang', 'Paradip', 'Newcastle'],
    affectedVesselClasses: ['Handymax', 'Supramax', 'Panamax', 'Capesize'],
    rateImpact: {
      metric: 'Bunker Fuel & Transit Delay',
      delta: '+$0.08/MT voyage variance',
      direction: 'neutral',
      timeframe: 'Active weekly'
    },
    tags: ['Malacca Strait', 'Weather Alert', 'Bunkering', 'Transit Time']
  },
  {
    id: 'art-006',
    title: 'Clarksons Dry Bulk Outlook: Eco-Electronic Engine Bulk Carriers Command $1,400/Day Time Charter Premium',
    subtitle: 'Fuel efficiency bifurcation widens as carbon intensity indices (CII) enforce slower steaming.',
    category: 'ships',
    impact: 'HIGH',
    source: 'Clarksons Shipping Intelligence Weekly',
    author: 'Fleet Performance Analysis',
    publishedAt: 'Aug 29, 2026',
    readingTime: '4 min read',
    summary: 'Analysis of recent time charter fixtures reveals that modern Tier III / Eco-spec Panamax and Kamsarmax vessels are capturing substantial charter rate premiums over non-eco tonnage.',
    paragraphs: [
      'Eco-configured bulk carriers consuming 21–23 MT/day of VLSFO at 13 knots are achieving time charter equivalent (TCE) premiums averaging $1,400 to $1,800/day compared to conventional tonnage burning 28–31 MT/day on identical round-voyage benchmarks.',
      'For voyage charterers contracting long-haul Pacific routes such as Newcastle to Paradip (5,612 NM), selecting an Eco-Panamax vessel reduces total voyage fuel consumption by approximately 84 MT of VLSFO, equivalent to direct bunker expenditure savings of $51,900 per voyage.',
      'Charterers are urged to verify engine technical spec sheets and speed-consumption warranties in charter party rider clauses before finalizing fixtures.'
    ],
    keyTakeaways: [
      'Eco-Panamax vessels generate ~$51,900 in direct bunker savings on Newcastle–India voyages',
      'CII emissions compliance widening rate spread between Tier II and Tier III bulkers',
      'Warranted speed/consumption clauses critical in charter party negotiations'
    ],
    affectedCommodities: ['Coal', 'Iron Ore', 'Grains'],
    affectedPorts: ['Newcastle', 'Gladstone', 'Paradip', 'Visakhapatnam'],
    affectedVesselClasses: ['Panamax', 'Kamsarmax', 'Ultramax'],
    rateImpact: {
      metric: 'Bunker Fuel Efficiency Savings',
      delta: '-$0.29/MT on freight cost',
      direction: 'down',
      timeframe: 'Permanent structural'
    },
    tags: ['Eco Vessels', 'Fuel Efficiency', 'Bunkers', 'Decarbonization']
  },
  {
    id: 'art-007',
    title: 'Indonesian Ministry of Energy Adjusts September HBA Thermal Coal Reference Formula',
    subtitle: 'Price indexing adjustment aligns high-calorific Kalimantan coal with international benchmarks.',
    category: 'commodities',
    impact: 'MODERATE',
    source: 'Ministry of Energy and Mineral Resources (ESDM)',
    author: 'Government Energy Statistics',
    publishedAt: 'Aug 28, 2026',
    readingTime: '3 min read',
    summary: 'Indonesia has recalibrated its Harga Batubara Acuan (HBA) reference price formula for high and medium calorific coals for September 2026 shipments.',
    paragraphs: [
      'The adjusted HBA reference price for 6,322 kcal/kg GAR coal is pegged at $118.40/MT FOB Kalimantan, reflecting steady demand from Southeast Asian and Indian independent power producers.',
      'For low-calorific 4,200 kcal/kg GAR coal, the reference rate is set at $52.80/MT FOB Taboneo/Muara Berau anchorages. Indonesian mining concession holders report steady barging deliveries, although sudden afternoon rain squalls have caused intermittent open-sea transshipment halts.',
      'The price parity between Indonesian 5,000+ kcal coal and Australian Newcastle thermal coal continues to favor Australian origin on a per-gigajoule delivered-to-berth calorific basis for East Coast Indian buyers.'
    ],
    keyTakeaways: [
      'HBA 6,322 kcal reference set at $118.40/MT; 4,200 kcal at $52.80/MT FOB',
      'Australian Newcastle coal maintains calorific cost advantage for Indian East Coast plants',
      'Taboneo open-sea transshipment seeing minor weather pauses'
    ],
    affectedCommodities: ['Thermal Coal', 'Indonesian Sub-Bituminous Coal'],
    affectedPorts: ['Taboneo', 'Muara Berau', 'Visakhapatnam', 'Krishnapatnam'],
    affectedVesselClasses: ['Supramax', 'Ultramax', 'Panamax'],
    rateImpact: {
      metric: 'Kalimantan FOB Spot Parity',
      delta: '+$1.85/MT HBA adjustment',
      direction: 'up',
      timeframe: 'September 2026'
    },
    tags: ['Indonesia Coal', 'HBA Index', 'FOB Kalimantan', 'Power Sector']
  },
  {
    id: 'art-008',
    title: 'Richards Bay Coal Terminal (RBCT) Rail Line Derailment Causes Temporary Tonnage Diversions',
    subtitle: 'Transnet Freight Rail reports 48-hour partial line closure in KwaZulu-Natal corridor.',
    category: 'ports',
    impact: 'HIGH',
    source: 'South African Maritime Logistics Bulletin',
    author: 'Indian Ocean Freight Desk',
    publishedAt: 'Aug 28, 2026',
    readingTime: '3 min read',
    summary: 'A minor freight wagon derailment on the Ermelo–Richards Bay dedicated coal rail line has temporarily reduced railing volumes into the export terminal.',
    paragraphs: [
      'Transnet Freight Rail technical teams are executing track clearance operations, with full double-track operations expected to resume within 48 hours. RBCT stockpile levels remain healthy at 3.2 million MT, mitigating immediate vessel loading disruptions for stems fixed in early September.',
      'However, two Capesize vessels scheduled for spot coal loading have opted to adjust laycan notices, leading some Indian importers to explore prompt replacement coal stems out of Gladstone and Newcastle.',
      'Freight rates on the Richards Bay → India East Coast route (via Mozambique Channel) have ticked up slightly by $0.40/MT to $16.90/MT on Supramax and $14.20/MT on Capesize.'
    ],
    keyTakeaways: [
      'Transnet rail line disruption expected to resolve within 48 hours',
      'RBCT stockpiles adequate (3.2M MT) to prevent widespread stockouts',
      'Slight freight premium (+$0.40/MT) on South Africa → India coal routes'
    ],
    affectedCommodities: ['Thermal Coal', 'Anthracite'],
    affectedPorts: ['Richards Bay', 'Durban', 'Paradip', 'Gangavaram'],
    affectedVesselClasses: ['Capesize', 'Panamax', 'Supramax'],
    rateImpact: {
      metric: 'Richards Bay → India Freight Rate',
      delta: '+$0.40/MT prompt adjustment',
      direction: 'up',
      timeframe: 'Next 5–7 days'
    },
    tags: ['Richards Bay', 'Rail Logistics', 'South Africa Coal', 'Tonnage Diversion']
  },
  {
    id: 'art-009',
    title: 'Gopalpur Port Commissions Tidal Window Advisory System for Deeper-Draft Feeder Calls',
    subtitle: 'New real-time tide-gauge network extends the safe arrival window by up to 90 minutes.',
    category: 'ports',
    impact: 'MODERATE',
    source: 'Gopalpur Ports Ltd Technical Bulletin',
    author: 'Port Engineering Directorate',
    publishedAt: 'Aug 27, 2026',
    readingTime: '2 min read',
    summary: 'Gopalpur has activated a networked tidal advisory system feeding live water-level data to inbound masters, allowing better-timed transits of its 13.0m low-tide draft restriction.',
    paragraphs: [
      'The new system pairs three offshore tide gauges with a shore-based advisory desk, giving masters a rolling six-hour draft window forecast instead of static tide tables alone.',
      'Port officials estimate the advisory can extend the practical arrival window for 12.0-12.5m draft feeder tonnage by up to 90 minutes either side of high water, modestly easing the tidal-lock delay that has historically been Gopalpur\'s largest single delay driver.',
      'Charterers fixing Handysize and small Supramax stems for ilmenite sand and rock phosphate parcels are advised to share ETA windows with the port desk 48 hours ahead to make full use of the new advisory.'
    ],
    keyTakeaways: [
      'New tide-gauge network gives a rolling six-hour draft forecast',
      'Practical arrival window extended by up to 90 minutes around high water',
      'Recommend sharing ETA 48h ahead to use the advisory fully'
    ],
    affectedCommodities: ['Ilmenite Sand', 'Rock Phosphate', 'General Bulk'],
    affectedPorts: ['Gopalpur'],
    affectedVesselClasses: ['Handysize', 'Supramax'],
    rateImpact: {
      metric: 'Gopalpur Tidal Lock Delay',
      delta: '-1.5 hrs average',
      direction: 'down',
      timeframe: 'Immediate'
    },
    tags: ['Gopalpur', 'Tidal Window', 'Port Technology', 'India East Coast']
  },
  {
    id: 'art-010',
    title: 'Dhamra Port Adds Fourth Continuous Ship Unloader Ahead of Q4 Peak Season',
    subtitle: 'New CSU lifts combined discharge capacity to over 22,000 MT/day.',
    category: 'ports',
    impact: 'MODERATE',
    source: 'Dhamra Port Operations Bulletin',
    author: 'Port Engineering Directorate',
    publishedAt: 'Aug 26, 2026',
    readingTime: '2 min read',
    summary: 'Dhamra has commissioned a fourth continuous ship unloader on Berth 1, further strengthening its position as one of the East Coast\'s fastest-turnaround deep-draft terminals.',
    paragraphs: [
      'The new unit runs alongside the existing pair of 2,400 TPH CSUs, giving Berth 1 combined nameplate capacity in excess of 22,000 MT/day for Capesize and Panamax coal and ore parcels.',
      'Dhamra\'s 18.0m draft and modern conveyor-fed stockyard already allow direct berthing without lightering for the large majority of India East Coast-bound tonnage; the additional unloader is expected to trim average turnaround by a further 2-3 hours during the Q4 export peak.',
      'The port continues to report the lowest congestion index among the six India East Coast discharge terminals tracked in this monograph.'
    ],
    keyTakeaways: [
      'Fourth CSU commissioned on Berth 1',
      'Combined Berth 1 capacity now exceeds 22,000 MT/day',
      'Average turnaround expected to improve by 2-3 hours in Q4'
    ],
    affectedCommodities: ['Thermal Coal', 'Coking Coal', 'Iron Ore'],
    affectedPorts: ['Dhamra'],
    affectedVesselClasses: ['Capesize', 'Panamax', 'Kamsarmax'],
    rateImpact: {
      metric: 'Dhamra Discharge Capacity',
      delta: '+2,400 TPH nameplate',
      direction: 'up',
      timeframe: 'Effective immediately'
    },
    tags: ['Dhamra Port', 'Crane Capacity', 'Discharge Efficiency', 'India East Coast']
  }
];

// Pool of breaking dispatches injected live by NewsContext over time (not shown until "published").
export const pendingNewsPool: NewsArticle[] = [
  {
    id: 'art-live-001',
    title: 'Port Hedland Cyclone Advisory Upgraded: Tropical Low Tracking Toward Pilbara Coast',
    subtitle: 'Pilbara Ports Authority flags potential 24-36h loading suspension window.',
    category: 'ports',
    impact: 'HIGH',
    source: 'Pilbara Ports Authority Marine Advisory',
    author: 'Weather & Routing Desk',
    publishedAt: 'Just now',
    readingTime: '2 min read',
    summary: 'A tropical low pressure system off the Pilbara coast has been upgraded, prompting advance mooring precautions at Port Hedland and Utah Point.',
    paragraphs: [
      'Pilbara Ports Authority has issued a Blue Alert for vessels at anchor off Port Hedland as the system intensifies over the Indian Ocean, with a possible Red Alert (full port closure) within 48 hours if the track holds.',
      'Charterers with prompt iron ore or bauxite stems ex-Hedland should build in a 24-36 hour contingency buffer on loading laycans.'
    ],
    keyTakeaways: [
      'Blue Alert issued for Port Hedland anchorage',
      'Potential full closure within 48 hours if system intensifies',
      'Recommend 24-36h laycan buffer on Hedland stems'
    ],
    affectedCommodities: ['Iron Ore', 'Bauxite'],
    affectedPorts: ['Port Hedland', 'Gangavaram', 'Paradip'],
    affectedVesselClasses: ['Capesize', 'Newcastlemax'],
    rateImpact: {
      metric: 'Hedland Loading Delay Risk',
      delta: '+$0.20/MT contingent',
      direction: 'up',
      timeframe: 'Next 48 hours'
    },
    tags: ['Port Hedland', 'Cyclone', 'Weather Alert', 'Iron Ore']
  },
  {
    id: 'art-live-002',
    title: 'Singapore Bunker Premiums Ease as VLSFO Supply Normalizes',
    subtitle: 'Barge scheduling wait times fall back to single digits after week-long congestion.',
    category: 'commodities',
    impact: 'MODERATE',
    source: 'Maritime & Port Authority of Singapore Bunkering Desk',
    author: 'Bunker Markets Desk',
    publishedAt: 'Just now',
    readingTime: '2 min read',
    summary: 'VLSFO 0.5% barge availability at Singapore Western Anchorage has improved materially, with spot prices easing off recent highs.',
    paragraphs: [
      'Barge queue times have fallen from 12-18 hours to under 8 hours as additional bunker tonnage was redeployed from Fujairah.',
      'Vessels transiting the Malacca corridor toward East Coast India can now expect prompt bunker stems without the deviation delays reported earlier this week.'
    ],
    keyTakeaways: [
      'VLSFO barge wait times fall to under 8 hours',
      'Spot prices easing off weekly highs',
      'No further transit deviation expected for Malacca-corridor tonnage'
    ],
    affectedCommodities: ['All Bulk Commodities'],
    affectedPorts: ['Singapore', 'Colombo'],
    affectedVesselClasses: ['Handysize', 'Supramax', 'Panamax', 'Capesize'],
    rateImpact: {
      metric: 'Singapore VLSFO Spot',
      delta: '-$1.40/MT',
      direction: 'down',
      timeframe: 'Prompt'
    },
    tags: ['Singapore', 'Bunkers', 'VLSFO', 'Fuel Markets']
  },
  {
    id: 'art-live-003',
    title: 'Gangavaram Deepwater Berth Sets New Monthly Discharge Record',
    subtitle: 'Automated CSU fleet clears 1.1M MT in a single week for the first time.',
    category: 'ports',
    impact: 'MODERATE',
    source: 'Gangavaram Port Ltd Operations Bulletin',
    author: 'Port Engineering Directorate',
    publishedAt: 'Just now',
    readingTime: '2 min read',
    summary: 'Gangavaram\'s deep-draft coal and ore berths posted their highest weekly throughput on record, reinforcing its position as the East Coast\'s fastest-turnaround terminal.',
    paragraphs: [
      'The three high-speed continuous ship unloaders averaged 97% uptime across the reporting week, aided by clear weather and low swell.',
      'Charterers routing Capesize and Newcastlemax tonnage directly to Gangavaram continue to avoid the lightering penalties triggered at shallower East Coast alternatives.'
    ],
    keyTakeaways: [
      'Gangavaram clears 1.1M MT in a single week, a new record',
      'CSU fleet uptime averaged 97%',
      'Remains the only East Coast port accepting full Capesize draft without lightering'
    ],
    affectedCommodities: ['Coking Coal', 'Bauxite', 'Iron Ore'],
    affectedPorts: ['Gangavaram'],
    affectedVesselClasses: ['Capesize', 'Newcastlemax', 'Panamax'],
    rateImpact: {
      metric: 'Gangavaram Discharge Efficiency',
      delta: '+6% vs prior month',
      direction: 'up',
      timeframe: 'Trailing 7 days'
    },
    tags: ['Gangavaram', 'Discharge Efficiency', 'Record Throughput']
  },
  {
    id: 'art-live-004',
    title: 'Taboneo Anchorage Barge Fleet Expands to Ease Transshipment Backlog',
    subtitle: 'Six additional floating cranes deployed ahead of peak loading season.',
    category: 'ports',
    impact: 'MODERATE',
    source: 'South Kalimantan Coal Exporters Association',
    author: 'Indonesia Coal Desk',
    publishedAt: 'Just now',
    readingTime: '2 min read',
    summary: 'Local barge operators have added six floating crane units to the Taboneo transshipment fleet, targeting a reduction in anchorage wait times ahead of the Q4 export peak.',
    paragraphs: [
      'The expansion follows weeks of elevated waiting times as barge availability failed to keep pace with river-mouth coal deliveries.',
      'Early indications suggest average anchorage wait could fall from the low-20-hour range toward 14-16 hours once the new units are fully integrated.'
    ],
    keyTakeaways: [
      'Six new floating cranes added to Taboneo fleet',
      'Wait times expected to fall toward 14-16 hours',
      'Positions Taboneo tonnage more competitively ahead of Q4'
    ],
    affectedCommodities: ['Thermal Coal', 'Steam Coal'],
    affectedPorts: ['Taboneo', 'Haldia', 'Paradip'],
    affectedVesselClasses: ['Supramax', 'Panamax', 'Handysize'],
    rateImpact: {
      metric: 'Taboneo Anchorage Wait',
      delta: '-6 to -8 hrs projected',
      direction: 'down',
      timeframe: 'Next 2-3 weeks'
    },
    tags: ['Taboneo', 'Transshipment', 'Indonesia Coal', 'Anchorage Wait']
  },
  {
    id: 'art-live-005',
    title: 'Colombo Emerges as Preferred Diversion Point Amid Malacca Traffic Density',
    subtitle: 'More Bay of Bengal-bound bulkers opting for Dondra Head routing for bunkers.',
    category: 'routes',
    impact: 'LOW',
    source: 'Sri Lanka Ports Authority Traffic Bulletin',
    author: 'Routing & Chokepoints Desk',
    publishedAt: 'Just now',
    readingTime: '2 min read',
    summary: 'A growing share of South Africa and Persian Gulf-origin bulk tonnage is opting to bunker at Colombo rather than deviate into the Singapore Strait.',
    paragraphs: [
      'The Dondra Head routing shaves an estimated 4-6 hours of transit deviation for vessels bound directly for East Coast India, at broadly comparable VLSFO pricing.',
      'Port agents report anchorage turnaround at Colombo remains under 6 hours even during peak call windows.'
    ],
    keyTakeaways: [
      'Colombo bunker calls rising for South Africa/Gulf-origin tonnage',
      'Saves 4-6 hours versus Singapore deviation',
      'Anchorage turnaround remains under 6 hours'
    ],
    affectedCommodities: ['All Bulk Commodities'],
    affectedPorts: ['Colombo', 'Singapore'],
    affectedVesselClasses: ['Panamax', 'Kamsarmax', 'Capesize'],
    tags: ['Colombo', 'Routing', 'Bunkers', 'Chokepoints']
  },
  {
    id: 'art-live-006',
    title: 'Bali Strait Traffic Advisory: Increased Fishing Fleet Density Reported',
    subtitle: 'Local authorities urge reduced speed for feeder tonnage using the alternate passage.',
    category: 'routes',
    impact: 'LOW',
    source: 'Indonesian Directorate General of Sea Transportation',
    author: 'Hydrographic & Safety Office',
    publishedAt: 'Just now',
    readingTime: '2 min read',
    summary: 'Seasonal fishing activity has increased traffic density in the Bali Strait, a narrow alternate route to the Lombok Strait used by smaller feeder bulkers.',
    paragraphs: [
      'Masters transiting the strait are advised to maintain reduced speed and enhanced lookout, particularly during dawn and dusk hours when fishing fleet activity peaks.',
      'Vessels with a Lombok Strait option available are encouraged to use it in preference to Bali Strait until the advisory is lifted.'
    ],
    keyTakeaways: [
      'Increased fishing fleet density in Bali Strait',
      'Reduced speed and enhanced lookout advised',
      'Lombok Strait preferred where vessel draft allows'
    ],
    affectedCommodities: ['All Bulk Commodities'],
    affectedPorts: ['Port Hedland', 'Taboneo'],
    affectedVesselClasses: ['Handysize', 'Supramax'],
    tags: ['Bali Strait', 'Navigation Alert', 'Chokepoints', 'Fishing Traffic']
  }
];
