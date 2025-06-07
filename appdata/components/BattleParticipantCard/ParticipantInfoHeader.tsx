
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
  return (
    <div className="flex items-center mb-1">
      {Icon && <Icon className={`w-6 h-6 mr-2 ${type === 'hero' ? 'text-sky-400' : 'text-red-400'}`} />}
      <h4 className="text-md font-semibold">{participant.name} {type === 'hero' && `Lvl ${(participant as BattleHero).level}`}</h4>
      {isVisuallyStunned && (
        <span className="ml-2 px-1.5 py-0.5 text-xs font-bold text-yellow-900 bg-yellow-400 rounded-full">
          STUNNED
        </span>
      )}
    </div>
  );
};

export default ParticipantInfoHeader;
