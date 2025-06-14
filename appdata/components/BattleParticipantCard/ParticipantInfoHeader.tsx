
import React from 'react';
import { BattleHero, BattleEnemy } from '../../types';
import { ICONS } from '../Icons';

interface ParticipantInfoHeaderProps {
  participant: BattleHero | BattleEnemy;
  type: 'hero' | 'enemy';
  isVisuallyStunned: boolean;
}

const ParticipantInfoHeader: React.FC<ParticipantInfoHeaderProps> = ({ participant, type, isVisuallyStunned }) => {
  const Icon = ICONS[participant.iconName];
  const isHero = type === 'hero';
  const levelDisplay = isHero ? ` Lvl ${(participant as BattleHero).level}` : '';
  const nameColor = isHero ? 'text-sky-300' : 'text-red-300';
  
  // Note: Icon display for grid mode is handled in BattleParticipantCard itself.
  // This component is now primarily for the text part in grid mode.
  
  return (
    <div className="flex flex-col items-center text-center"> {/* Removed mb-0.5 */}
      {/* Icon display for 'card' mode would go here, or conditionally render based on a prop if needed */}
      <h4 className={`text-[0.65rem] font-semibold truncate max-w-full px-1 ${nameColor} leading-tight`}> {/* Reduced font, added leading-tight */}
        {participant.name}{levelDisplay}
      </h4>
      {isVisuallyStunned && (
        <span className="mt-0.5 px-1 py-0 text-[9px] font-bold text-yellow-900 bg-yellow-400 rounded-full">
          STUNNED
        </span>
      )}
    </div>
  );
};

export default ParticipantInfoHeader;
