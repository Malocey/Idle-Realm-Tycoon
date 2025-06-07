
import React from 'react';
import { HeroStats } from '../../types'; 
import { formatNumber } from '../../utils';

// Define DisplayMode if it's not imported from a shared location
type DisplayMode = 'ALIVE' | 'DYING' | 'SHOWING_LOOT';

interface ParticipantStatsDisplayProps {
  stats: HeroStats;
  type: 'hero' | 'enemy';
  displayMode: DisplayMode; 
}

const ParticipantStatsDisplay: React.FC<ParticipantStatsDisplayProps> = ({ stats, type, displayMode }) => {
  // Only display stats if the participant is alive
  if (displayMode !== 'ALIVE') return null;
  
  // For enemies, stats are always shown. For heroes, they are shown below XP bar.
  // This component can be used for both if styled correctly or conditionally rendered where appropriate.

  return (
    <div className="flex justify-center items-center space-x-3 text-xs text-slate-300 my-1">
      <span className="flex items-center" title={`Attack: ${formatNumber(stats.damage)}`}>
        {/* Placeholder for SwordIcon, assuming ICONS.SWORD is available in consuming component or passed as prop */}
        ATK: {formatNumber(stats.damage)}
      </span>
      <span className="flex items-center" title={`Defense: ${formatNumber(stats.defense)}`}>
        {/* Placeholder for ShieldIcon */}
        DEF: {formatNumber(stats.defense)}
      </span>
    </div>
  );
};

export default ParticipantStatsDisplay;
