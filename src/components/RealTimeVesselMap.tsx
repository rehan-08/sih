import React from 'react';
import { WorldMonitorMap } from './WorldMonitorMap/WorldMonitorMap';

interface RealTimeVesselMapProps {
  selectedClassFilter?: string;
  onSelectVesselClass?: (vesselClass: string) => void;
  onNavigateToComparison?: () => void;
}

export const RealTimeVesselMap: React.FC<RealTimeVesselMapProps> = ({
  selectedClassFilter = 'All',
  onSelectVesselClass,
  onNavigateToComparison
}) => {
  return (
    <WorldMonitorMap
      selectedClassFilter={selectedClassFilter}
      onSelectVesselClass={onSelectVesselClass}
      onNavigateToComparison={onNavigateToComparison}
    />
  );
};

export default RealTimeVesselMap;
