

import React from 'react';
import { ResearchDefinition, ResourceType, TownHallUpgradeEffectType, ResearchCategory, GameState } from '../types';
import { ICONS } from './Icons';
import Button from './Button';
import { formatNumber } from '../utils';
import { RESOURCE_COLORS, GAME_TICK_MS } from '../constants';

interface ResearchStatus {
  currentLevel: number;
  isResearching: boolean;
  progressPercent: number;
  isInQueue: boolean;
  canAffordNext: boolean;
  isMaxLevel: boolean;
  canStartNext: boolean;
}

interface ResearchNodeDisplayProps {
  researchDef: ResearchDefinition | null | undefined;
  status: ResearchStatus;
  onStartResearch: () => void;
  onCancelResearch: () => void;
  playerResources: GameState['resources'];
}

const categoryStyles: Record<ResearchCategory, { bg: string; border: string; text: string; pulseRingHover: string, pulseRingActive: string }> = {
    Military: { bg: 'bg-red-800/70', border: 'border-red-600', text: 'text-red-300', pulseRingHover: 'hover:ring-red-500/50', pulseRingActive: 'ring-red-500/70' },
    Economic: { bg: 'bg-green-800/70', border: 'border-green-600', text: 'text-green-300', pulseRingHover: 'hover:ring-green-500/50', pulseRingActive: 'ring-green-500/70' },
    Exploration: { bg: 'bg-blue-800/70', border: 'border-blue-600', text: 'text-blue-300', pulseRingHover: 'hover:ring-blue-500/50', pulseRingActive: 'ring-blue-500/70' },
    Special: { bg: 'bg-purple-800/70', border: 'border-purple-600', text: 'text-purple-300', pulseRingHover: 'hover:ring-purple-500/50', pulseRingActive: 'ring-purple-500/70' },
    Alchemy: { bg: 'bg-teal-800/70', border: 'border-teal-600', text: 'text-teal-300', pulseRingHover: 'hover:ring-teal-500/50', pulseRingActive: 'ring-teal-500/70' },
};

const ResearchNodeDisplay: React.FC<ResearchNodeDisplayProps> = ({
  researchDef,
  status,
  onStartResearch,
  onCancelResearch,
  playerResources,
}) => {
  if (!researchDef) {
    return <div className="p-2 rounded-lg border-2 border-red-500 bg-red-700/30 text-xs text-red-200">Error: Research data missing.</div>;
  }

  const { name, iconName, description, costPerLevel, researchTimeTicks, maxLevel, effects, category } = researchDef;
  const { currentLevel, isResearching, progressPercent, isInQueue, canAffordNext, isMaxLevel, canStartNext } = status;

  const ResearchIcon = ICONS[iconName] || ICONS.SETTINGS;
  const theme = categoryStyles[category] || categoryStyles.Special;

  let borderColorClass = theme.border;
  let bgColorClass = theme.bg;
  let titleTextColorClass = theme.text;
  let pulseClass = '';
  let mainTextColorClass = 'text-slate-300';

  if (isMaxLevel) {
    borderColorClass = 'border-green-500/70';
    bgColorClass = 'bg-green-700/50 hover:bg-green-600/60';
    titleTextColorClass = 'text-green-300';
    mainTextColorClass = 'text-green-400';
  } else if (!canStartNext) { // This includes prerequisite not met
    borderColorClass = 'border-slate-700/50';
    bgColorClass = 'bg-slate-800/30 opacity-60 cursor-not-allowed hover:bg-slate-800/40';
    titleTextColorClass = 'text-slate-600';
    mainTextColorClass = 'text-slate-600';
  } else if (isResearching || isInQueue) {
    borderColorClass = 'border-amber-500/80';
    bgColorClass = 'bg-amber-700/60 hover:bg-amber-600/70';
    titleTextColorClass = 'text-amber-300';
    mainTextColorClass = 'text-amber-400';
  } else if (canAffordNext) { // Can start and can afford
    borderColorClass = theme.border;
    bgColorClass = `${theme.bg} ${theme.pulseRingHover}`;
    titleTextColorClass = theme.text;
    pulseClass = `animate-pulse-strong ${theme.pulseRingActive}`;
    mainTextColorClass = 'text-slate-300';
  } else { // Can start but cannot afford
    borderColorClass = 'border-red-700/70';
    bgColorClass = `${theme.bg} hover:bg-opacity-80`; 
    titleTextColorClass = theme.text;
    mainTextColorClass = 'text-red-400'; 
  }

  const researchTimeSeconds = researchTimeTicks * (GAME_TICK_MS / 1000);

  let effectDisplayValue = "N/A";
  if (effects && effects.length > 0 && effects[0]) {
    const effectParam = effects[0].effectParams;
    const effectLevelForDisplay = currentLevel + 1; // Show effect for the *next* level if upgrading
    const totalEffectForNextLevel = (effectParam.type === TownHallUpgradeEffectType.Additive ? effectParam.baseIncrease : effectParam.baseAmount) + (effectParam.additiveStep * (effectLevelForDisplay -1));

    if (effectParam.type === TownHallUpgradeEffectType.PercentageBonus) {
      effectDisplayValue = `${(totalEffectForNextLevel * 100).toFixed(1)}%`;
    } else {
      effectDisplayValue = totalEffectForNextLevel.toFixed(effects[0].stat === 'attackSpeed' ? 2 : (effects[0].stat === 'manaRegen' || effects[0].stat === 'hpRegen' ? 1 : 0));
    }
  }

  const costsForNextLevel = isMaxLevel ? [] : costPerLevel(currentLevel + 1);

  const handleStartButtonClick = () => {
    // console.log('[ResearchNodeDisplay] Start Lvl X Button Clicked:', {
    //   researchId: researchDef.id,
    //   levelToResearch: status.currentLevel + 1,
    //   currentStatus: status
    // });
    onStartResearch();
  };

  return (
    <div
      className={`p-2 rounded-lg border-2 shadow-md h-full flex flex-col justify-between transition-all duration-150 ${borderColorClass} ${bgColorClass} ${pulseClass} group relative`}
      title={`${name} - ${description}`}
    >
      <div>
        <div className="flex items-center mb-1">
          {ResearchIcon && <ResearchIcon className={`w-5 h-5 mr-1.5 ${titleTextColorClass}`} />}
          <h5 className={`text-xs font-semibold truncate ${titleTextColorClass}`}>{name}</h5>
        </div>
        <p className={`text-[0.6rem] leading-tight text-slate-400 mb-0.5 line-clamp-2`}>
          Lvl {currentLevel}
          {maxLevel !== -1 ? `/${maxLevel}` : ''}
        </p>
      </div>

      <div className="mt-auto text-center">
        {isResearching ? (
          <>
            <div className="w-full bg-slate-600 rounded-full h-1 mb-0.5">
              <div
                className="bg-amber-400 h-1 rounded-full"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <Button onClick={onCancelResearch} variant="danger" size="sm" className="w-full text-[0.6rem] py-0.5 px-1">
              Cancel
            </Button>
          </>
        ) : isInQueue ? (
           <Button onClick={onCancelResearch} variant="ghost" size="sm" className="w-full text-[0.6rem] py-0.5 px-1 text-slate-400">
             Queued
            </Button>
        ) : isMaxLevel ? (
          <p className="text-[0.65rem] font-semibold text-green-400">Max Level</p>
        ) : ( 
          <Button 
            onClick={handleStartButtonClick} 
            disabled={!canStartNext || !canAffordNext} 
            variant={(canStartNext && canAffordNext) ? "primary" : "secondary"} 
            size="sm" 
            className="w-full text-[0.6rem] py-0.5 px-1"
          >
            Start Lvl {currentLevel + 1}
          </Button>
        )}
      </div>
       {!isResearching && !isInQueue && !isMaxLevel && (
          <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-1 w-48 p-2 bg-slate-900 border border-slate-700 rounded-md shadow-lg z-20 text-xs text-slate-300 opacity-0 transition-opacity duration-200 pointer-events-none group-hover:opacity-100">
            <p className="font-semibold mb-0.5">Cost (Lvl {currentLevel + 1}):</p>
            {costsForNextLevel.map((cost, idx) => (
                <span key={idx} className={`mr-1.5 ${(playerResources[cost.resource] || 0) < cost.amount ? 'text-red-400' : (RESOURCE_COLORS[cost.resource] || 'text-slate-300')}`}>
                    {ICONS[cost.resource] && React.createElement(ICONS[cost.resource], {className: "inline w-2.5 h-2.5 mr-0.5"})}
                    {formatNumber(cost.amount)}
                </span>
            ))}
            <p className="mt-0.5">Time: {researchTimeSeconds.toFixed(0)}s</p>
            {effects && effects.length > 0 && effects[0] && (
                <p className="mt-0.5 text-sky-400">{effects[0].description.replace('X%', effectDisplayValue)}</p>
            )}
          </div>
        )}
    </div>
  );
};

export default ResearchNodeDisplay;