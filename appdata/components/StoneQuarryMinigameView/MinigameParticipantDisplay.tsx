
import React from 'react';
import { MinigameGolemState, MinigameMoleState } from '../../types';
import * as GameConstants from '../../constants'; // Namespace import
import { ICONS } from '../Icons'; // Keep direct import for ICONS if preferred for clarity or if other components do so.
                                  // Alternatively, access via GameConstants.ICONS

interface MinigameParticipantDisplayProps {
  participant: MinigameGolemState | MinigameMoleState;
  color: string; // This color is passed from the parent, likely derived from SQMG_GOLEM_COLORS
  iconName: string;
}

const MinigameParticipantDisplay: React.FC<MinigameParticipantDisplayProps> = ({ participant, color, iconName }) => {
  const ParticipantIcon = ICONS[iconName] || ICONS.STONE;
  const cellSizePercentage = 100 / GameConstants.SQMG_GRID_SIZE; // Use namespaced constant
  return (
    <div
      className="absolute transition-all duration-500 ease-in-out pointer-events-none"
      style={{
        top: `${participant.r * cellSizePercentage}%`,
        left: `${participant.c * cellSizePercentage}%`,
        width: `${cellSizePercentage}%`,
        height: `${cellSizePercentage}%`,
        transform: 'translate(5%, 5%)' 
      }}
      title={`Participant ${participant.id}`}
    >
      <ParticipantIcon className={`w-4/5 h-4/5 ${color} opacity-80 animate-pulse`} />
    </div>
  );
};

export default MinigameParticipantDisplay;
