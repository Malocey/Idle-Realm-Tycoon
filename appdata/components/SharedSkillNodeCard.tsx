
import React, { useState, useMemo } from 'react';
import { useGameContext } from '../context';
import { SharedSkillDefinition, PlayerSharedSkillProgress, HeroStats, ResourceType } from '../types';
import { ICONS } from './Icons';
import Button from '../components/Button';
import { formatNumber } from '../utils';

interface SharedSkillNodeCardProps {
  skillDef: SharedSkillDefinition;
  skillProgress: PlayerSharedSkillProgress | undefined;
  sharedSkillPoints: number;
  heroXpPool: number;
  onUpgradeMajor: (skillId: string) => void;
  onUpgradeMinor: (skillId: string) => void;
}

const SharedSkillNodeCard: React.FC<SharedSkillNodeCardProps> = ({
  skillDef,
  skillProgress,
  sharedSkillPoints,
  heroXpPool,
  onUpgradeMajor,
  onUpgradeMinor,
}) => {
  const Icon = ICONS[skillDef.iconName];
  const SharedPointsIcon = ICONS.UPGRADE;
  const HeroicPointsIcon = ICONS.HEROIC_POINTS; 

  const currentMajorLevel = skillProgress?.currentMajorLevel || 0;
  const currentMinorLevel = skillProgress?.currentMinorLevel || 0;

  const effect = skillDef.effects[0];
  let currentTotalBonusForDesc: number | { flat: number; percent: number };
  let nextMinorBonusForDesc: number | { flat: number; percent: number } | null = null;
  let nextMajorBonusForDesc: number | { flat: number; percent: number } | null = null;

  if (skillDef.id === 'SHARED_HP_FLAT') {
      let flat = 0; let percent = 0;
      for (let i = 0; i < currentMajorLevel; i++) {
          const majorVal = effect.baseValuePerMajorLevel[i] as { flat?: number; percent?: number };
          flat += majorVal.flat || 0;
          percent += majorVal.percent || 0;
          if (i < currentMajorLevel - 1) {
              const minorVal = effect.minorValuePerMinorLevel[i] as { flat?: number; percent?: number };
              flat += (minorVal.flat || 0) * (skillDef.minorLevelsPerMajorTier[i] || 0);
              percent += (minorVal.percent || 0) * (skillDef.minorLevelsPerMajorTier[i] || 0);
          }
      }
      if (currentMajorLevel > 0) {
          const minorValCurrent = effect.minorValuePerMinorLevel[currentMajorLevel - 1] as { flat?: number; percent?: number };
          flat += (minorValCurrent.flat || 0) * currentMinorLevel;
          percent += (minorValCurrent.percent || 0) * currentMinorLevel;
      }
      currentTotalBonusForDesc = { flat, percent };

      if (currentMajorLevel > 0 && currentMinorLevel < (skillDef.minorLevelsPerMajorTier[currentMajorLevel - 1] || 0)) {
          const nextMinorVal = effect.minorValuePerMinorLevel[currentMajorLevel - 1] as { flat?: number; percent?: number };
          nextMinorBonusForDesc = { flat: nextMinorVal.flat || 0, percent: nextMinorVal.percent || 0};
      }
      if (currentMajorLevel < skillDef.maxMajorLevels) {
          const nextMajorVal = effect.baseValuePerMajorLevel[currentMajorLevel] as { flat?: number; percent?: number };
           nextMajorBonusForDesc = { flat: nextMajorVal.flat || 0, percent: nextMajorVal.percent || 0 };
      }
  } else {
      let totalNumericBonus = 0;
      for (let i = 0; i < currentMajorLevel; i++) {
          totalNumericBonus += (effect.baseValuePerMajorLevel[i] as number) || 0;
          if (i < currentMajorLevel - 1) {
              totalNumericBonus += ((effect.minorValuePerMinorLevel[i] as number) || 0) * (skillDef.minorLevelsPerMajorTier[i] || 0);
          }
      }
      if (currentMajorLevel > 0) {
          totalNumericBonus += ((effect.minorValuePerMinorLevel[currentMajorLevel - 1] as number) || 0) * currentMinorLevel;
      }
      currentTotalBonusForDesc = totalNumericBonus;

      if (currentMajorLevel > 0 && currentMinorLevel < (skillDef.minorLevelsPerMajorTier[currentMajorLevel - 1] || 0)) {
          nextMinorBonusForDesc = (effect.minorValuePerMinorLevel[currentMajorLevel - 1] as number) || 0;
      }
      if (currentMajorLevel < skillDef.maxMajorLevels) {
          nextMajorBonusForDesc = (effect.baseValuePerMajorLevel[currentMajorLevel] as number) || 0;
      }
  }


  const isMaxMajorLevel = currentMajorLevel >= skillDef.maxMajorLevels;
  const minorLevelsInCurrentTier = currentMajorLevel > 0 ? skillDef.minorLevelsPerMajorTier[currentMajorLevel - 1] : (currentMajorLevel === 0 ? skillDef.minorLevelsPerMajorTier[0] : 0);
  const isMaxMinorLevelForCurrentTier = currentMajorLevel > 0 && currentMinorLevel >= minorLevelsInCurrentTier;

  const isCompletelyMaxed = isMaxMajorLevel && (currentMajorLevel === 0 ? true : isMaxMinorLevelForCurrentTier);
  const showMajorUpgradeSection = !isCompletelyMaxed && (currentMajorLevel === 0 || isMaxMinorLevelForCurrentTier);

  let majorUpgradeCost = 0;
  let canAffordMajor = false;
  let majorUpgradeButtonGlow = '';

  if (showMajorUpgradeSection) {
    majorUpgradeCost = skillDef.costSharedSkillPointsPerMajorLevel[currentMajorLevel] || Infinity;
    canAffordMajor = sharedSkillPoints >= majorUpgradeCost;
    if(canAffordMajor) {
      majorUpgradeButtonGlow = 'shadow-[0_0_15px_2px_rgba(59,130,246,0.4)] hover:shadow-[0_0_20px_5px_rgba(59,130,246,0.6)]';
    }
  }

  let canUpgradeMinor = false;
  let minorUpgradeCost = 0;
  
  if (currentMajorLevel > 0 && !isMaxMinorLevelForCurrentTier) {
    minorUpgradeCost = skillDef.costHeroXpPoolPerMinorLevel(currentMajorLevel, currentMinorLevel);
    canUpgradeMinor = heroXpPool >= minorUpgradeCost;
  }

  const description = skillDef.description(currentTotalBonusForDesc, nextMinorBonusForDesc, nextMajorBonusForDesc, effect.isPercentage);

  let cardBgClass = 'bg-slate-800';
  let borderColorClass = 'border-slate-700';
  let titleColorClass = 'text-amber-300';


  if (isCompletelyMaxed) {
    cardBgClass = 'bg-green-800/30';
    borderColorClass = 'border-green-500 ring-2 ring-green-400/50';
    titleColorClass = 'text-green-300';
  } else if (showMajorUpgradeSection && canAffordMajor) { 
    borderColorClass = 'border-sky-500';
  } else if (canUpgradeMinor) { 
    borderColorClass = 'border-amber-500';
  }


  const minorProgressPercentage = minorLevelsInCurrentTier > 0 ? (currentMinorLevel / minorLevelsInCurrentTier) * 100 : 0;

  return (
    <div className={`${cardBgClass} p-4 rounded-lg shadow-lg glass-effect border-2 ${borderColorClass} flex flex-col justify-between transition-all duration-200 hover:shadow-xl min-h-[300px]`}>
      <div>
        <div className="flex items-center mb-3">
          <div className="p-1.5 bg-slate-700 rounded-md mr-3 flex-shrink-0">
            {Icon && <Icon className={`w-8 h-8 ${titleColorClass}`} />}
          </div>
          <div>
            <h3 className={`text-xl font-semibold ${titleColorClass}`}>{skillDef.name}</h3>
            <p className="text-xs text-slate-400">
              <span className="font-semibold text-slate-300">Rank:</span> {currentMajorLevel} / {skillDef.maxMajorLevels}
              {currentMajorLevel > 0 && <span className="ml-2"><span className="font-semibold text-slate-300">Progress:</span> {currentMinorLevel}/{minorLevelsInCurrentTier}</span>}
            </p>
          </div>
        </div>
        <p className="text-sm text-slate-300 mb-3 min-h-[3.5em]">{description}</p>
      </div>
      <div className="mt-auto space-y-3 pt-3 border-t border-slate-700/50">
        {currentMajorLevel > 0 && !isMaxMinorLevelForCurrentTier && !isCompletelyMaxed && (
          <div>
            <div className="text-xs text-slate-400 mb-1 flex items-center">
              Cost:
              {HeroicPointsIcon && <HeroicPointsIcon className="w-3.5 h-3.5 mx-1 text-violet-400"/>}
              <span className={`${heroXpPool < minorUpgradeCost ? 'text-red-400' : 'text-violet-300'}`}>{formatNumber(minorUpgradeCost)}</span>
              <span className="text-slate-500 ml-1">/ {formatNumber(heroXpPool)} Heroic Points</span>
            </div>
            <div
              onClick={canUpgradeMinor ? () => onUpgradeMinor(skillDef.id) : undefined}
              className={`relative w-full text-sm font-semibold rounded-lg shadow-md transition-all duration-150 ease-in-out flex items-center justify-center p-2.5 overflow-hidden
                          ${canUpgradeMinor ? 'bg-slate-600 hover:bg-slate-500/80 active:scale-95 active:brightness-90 cursor-pointer' : 'bg-slate-700 opacity-60 cursor-not-allowed'}`}
              role="button"
              aria-disabled={!canUpgradeMinor}
              tabIndex={canUpgradeMinor ? 0 : -1}
              onKeyDown={canUpgradeMinor ? (e) => { if (e.key === 'Enter' || e.key === ' ') onUpgradeMinor(skillDef.id); } : undefined}
            >
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-amber-600 to-amber-500 rounded-lg transition-all duration-300 ease-out"
                style={{ width: `${minorProgressPercentage}%` }}
                aria-hidden="true"
              ></div>
              <div className="relative z-10 flex items-center justify-center space-x-1.5 text-white">
                {ICONS.UPGRADE && <ICONS.UPGRADE className="w-4 h-4"/>}
                <span>Level Up (+{((nextMinorBonusForDesc as number) * (effect.isPercentage ? 100 : 1)).toFixed(1)}{effect.isPercentage ? '%' : ''})</span>
              </div>
            </div>
          </div>
        )}
        {showMajorUpgradeSection && (
           <div>
            <div className="text-xs text-slate-400 mb-1 flex items-center">
                Cost:
                {SharedPointsIcon && <SharedPointsIcon className="w-3.5 h-3.5 mx-1 text-sky-400"/>}
                <span className={`${!canAffordMajor ? 'text-red-400' : 'text-sky-300'}`}>{formatNumber(majorUpgradeCost)}</span>
                <span className="text-slate-500 ml-1">/ {sharedSkillPoints} SP</span>
            </div>
            <Button
                onClick={() => onUpgradeMajor(skillDef.id)}
                disabled={!canAffordMajor}
                variant={canAffordMajor ? (currentMajorLevel === 0 ? "success" : "primary") : "ghost"}
                size="sm"
                className={`w-full transition-shadow duration-300 ${majorUpgradeButtonGlow}`}
                icon={currentMajorLevel === 0 ? (ICONS.CHECK_CIRCLE && <ICONS.CHECK_CIRCLE />) : (ICONS.UPGRADE && <ICONS.UPGRADE />)}
            >
                {currentMajorLevel === 0 ? 'Unlock Skill' : 'Upgrade Rank'}
            </Button>
           </div>
        )}
        {isCompletelyMaxed && (
          <p className="text-md text-green-300 text-center font-bold py-3 bg-green-700/30 rounded-md shadow-inner">Max Level Reached</p>
        )}
      </div>
    </div>
  );
};

export default SharedSkillNodeCard;
