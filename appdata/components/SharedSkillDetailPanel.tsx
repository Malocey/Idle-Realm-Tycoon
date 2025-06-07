
import React from 'react';
import { SharedSkillDefinition, PlayerSharedSkillProgress, HeroStats, ResourceType } from '../types';
import { ICONS } from './Icons';
import Button from './Button';
import { formatNumber } from '../utils';

interface SharedSkillDetailPanelProps {
  skillDef: SharedSkillDefinition;
  skillProgress: PlayerSharedSkillProgress | undefined;
  sharedSkillPoints: number;
  heroXpPool: number;
  onUpgradeMajor: (skillId: string) => void;
  onUpgradeMinor: (skillId: string) => void;
  onClose: () => void;
  panelId: string;
}

const SharedSkillDetailPanel: React.FC<SharedSkillDetailPanelProps> = ({
  skillDef,
  skillProgress,
  sharedSkillPoints,
  heroXpPool,
  onUpgradeMajor,
  onUpgradeMinor,
  onClose,
  panelId
}) => {
  const Icon = ICONS[skillDef.iconName];
  const SharedPointsIcon = ICONS.UPGRADE;
  const HeroicPointsIcon = ICONS.HEROIC_POINTS; // Changed from HeroXPIcon

  const currentMajorLevel = skillProgress?.currentMajorLevel || 0;
  const currentMinorLevel = skillProgress?.currentMinorLevel || 0;

  let currentTotalBonus = 0;
  const effect = skillDef.effects && skillDef.effects.length > 0 ? skillDef.effects[0] : null;

  if (effect) {
    for (let i = 0; i < currentMajorLevel; i++) {
      currentTotalBonus += effect.baseValuePerMajorLevel[i] || 0;
      if (i < currentMajorLevel -1 ) { // Sum minor levels from *completed* major tiers
          currentTotalBonus += (effect.minorValuePerMinorLevel[i] || 0) * (skillDef.minorLevelsPerMajorTier[i] || 0);
      }
    }
    if (currentMajorLevel > 0) { // Add minor levels from the *current* active major tier
        currentTotalBonus += (effect.minorValuePerMinorLevel[currentMajorLevel - 1] || 0) * currentMinorLevel;
    }
  }

  const isOriginNodeActive = skillDef.id === 'SHARED_ORIGIN' && currentMajorLevel >= 1;
  const isMaxMajorLevel = currentMajorLevel >= skillDef.maxMajorLevels;
  const minorLevelsInCurrentTier = currentMajorLevel > 0 ? skillDef.minorLevelsPerMajorTier[currentMajorLevel - 1] : (skillDef.isPassiveEffect ? 0 : skillDef.minorLevelsPerMajorTier[0]);
  const isMaxMinorLevelForCurrentTier = currentMajorLevel > 0 && currentMinorLevel >= minorLevelsInCurrentTier;
  const isCompletelyMaxed = isOriginNodeActive || (isMaxMajorLevel && (currentMajorLevel === 0 && skillDef.maxMajorLevels > 0 && !skillDef.isPassiveEffect ? false : (skillDef.isPassiveEffect && skillDef.maxMajorLevels === 1 ? true : isMaxMinorLevelForCurrentTier) ));
  const showMajorUpgradeSection = !isCompletelyMaxed && !isOriginNodeActive && (currentMajorLevel === 0 || isMaxMinorLevelForCurrentTier);


  let majorUpgradeCost = 0;
  let canAffordMajor = false;

  if (showMajorUpgradeSection) {
    majorUpgradeCost = skillDef.costSharedSkillPointsPerMajorLevel[currentMajorLevel] || Infinity;
    canAffordMajor = sharedSkillPoints >= majorUpgradeCost;
  }

  let canUpgradeMinor = false;
  let minorUpgradeCost = 0;
  let nextMinorBonus = null;
  if (effect && currentMajorLevel > 0 && !isMaxMinorLevelForCurrentTier && skillDef.minorLevelsPerMajorTier[currentMajorLevel-1] > 0 && !isOriginNodeActive) {
    minorUpgradeCost = skillDef.costHeroXpPoolPerMinorLevel(currentMajorLevel, currentMinorLevel);
    canUpgradeMinor = heroXpPool >= minorUpgradeCost;
    nextMinorBonus = effect.minorValuePerMinorLevel[currentMajorLevel - 1] || 0;
  }

  let nextMajorBonusUnlock = null;
  if(effect && !isMaxMajorLevel && skillDef.maxMajorLevels > 0 && !isOriginNodeActive){
      nextMajorBonusUnlock = effect.baseValuePerMajorLevel[currentMajorLevel] || 0;
  }

  const description = skillDef.description(currentTotalBonus, nextMinorBonus, nextMajorBonusUnlock, effect?.isPercentage || false);
  const titleColorClass = isCompletelyMaxed && skillDef.maxMajorLevels > 0 && !isOriginNodeActive ? 'text-green-300' : 'text-amber-300';
  const minorProgressPercentage = minorLevelsInCurrentTier > 0 ? (currentMinorLevel / minorLevelsInCurrentTier) * 100 : 0;

  const handleMajorUpgradeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpgradeMajor(skillDef.id);
  };

  const handleMinorUpgradeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpgradeMinor(skillDef.id);
  };


  return (
    <div className="flex flex-col h-full p-3"> {/* Removed bg, shadow, border - parent node provides this */}
      {/* Header for Expanded View */}
      <div className="flex items-start justify-between mb-2 flex-shrink-0">
        <div className="flex items-center">
          <div className="p-1 bg-slate-700/50 rounded-md mr-2.5 flex-shrink-0">
            {Icon && <Icon className={`w-7 h-7 ${titleColorClass}`} />}
          </div>
          <div>
            <h3 id={panelId} className={`text-lg font-semibold ${titleColorClass} leading-tight`}>{skillDef.name}</h3>
            <p className="text-xs text-slate-400">
              <span className="font-semibold text-slate-300">Rank:</span> {isOriginNodeActive ? 'Active' : `${currentMajorLevel} / ${skillDef.maxMajorLevels === 0 ? 1 : skillDef.maxMajorLevels}`}
              {currentMajorLevel > 0 && minorLevelsInCurrentTier > 0 && !isOriginNodeActive && <span className="ml-2"><span className="font-semibold text-slate-300">Progress:</span> {currentMinorLevel}/{minorLevelsInCurrentTier}</span>}
            </p>
          </div>
        </div>
        <Button onClick={onClose} variant="ghost" size="sm" className="p-0.5 -mr-1 -mt-1 text-xl leading-none hover:text-red-400">&times;</Button>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-grow overflow-y-auto fancy-scrollbar pr-1 mb-2">
        <p className="text-sm text-slate-300 mb-2 leading-normal">{description}</p>
      </div>

      {/* Action Buttons Area */}
      <div className="mt-auto space-y-2.5 pt-2.5 border-t border-slate-700/50 flex-shrink-0">
        {effect && currentMajorLevel > 0 && !isMaxMinorLevelForCurrentTier && !isCompletelyMaxed && minorLevelsInCurrentTier > 0 && !isOriginNodeActive && (
          <div>
            <div className="text-xs text-slate-400 mb-0.5 flex items-center">
              Cost:
              {HeroicPointsIcon && <HeroicPointsIcon className="w-3.5 h-3.5 mx-1 text-violet-400"/>}
              <span className={`${heroXpPool < minorUpgradeCost ? 'text-red-400' : 'text-violet-300'}`}>{formatNumber(minorUpgradeCost)}</span>
              <span className="text-slate-500 ml-1"> Heroic Points</span>
            </div>
            <div
              onClick={canUpgradeMinor ? handleMinorUpgradeClick : undefined}
              className={`relative w-full text-xs font-semibold rounded-md shadow-md transition-all duration-150 ease-in-out flex items-center justify-center p-2 overflow-hidden
                          ${canUpgradeMinor ? 'bg-slate-600 hover:bg-slate-500/80 active:scale-95 active:brightness-90 cursor-pointer' : 'bg-slate-700 opacity-60 cursor-not-allowed'}`}
              role="button" aria-disabled={!canUpgradeMinor} tabIndex={canUpgradeMinor ? 0 : -1}
              onKeyDown={canUpgradeMinor ? (e) => { if (e.key === 'Enter' || e.key === ' ') handleMinorUpgradeClick(e as any); } : undefined}
            >
              <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-amber-600 to-amber-500 rounded-md transition-all duration-300 ease-out" style={{ width: `${minorProgressPercentage}%` }} aria-hidden="true"></div>
              <div className="relative z-10 flex items-center justify-center space-x-1 text-white">
                {ICONS.UPGRADE && <ICONS.UPGRADE className="w-3 h-3"/>}
                <span>Level Up (+{(nextMinorBonus !== null ? (nextMinorBonus * (effect.isPercentage ? 100 : 1)).toFixed(1) : '0')}{effect.isPercentage ? '%' : ''})</span>
              </div>
            </div>
          </div>
        )}
        {showMajorUpgradeSection && !isOriginNodeActive && (
           <div>
            <div className="text-xs text-slate-400 mb-0.5 flex items-center">
                Cost:
                {SharedPointsIcon && <SharedPointsIcon className="w-3.5 h-3.5 mx-1 text-sky-400"/>}
                <span className={`${!canAffordMajor ? 'text-red-400' : 'text-sky-300'}`}>{formatNumber(majorUpgradeCost)}</span>
                <span className="text-slate-500 ml-1"> SP</span>
            </div>
            <Button
                onClick={handleMajorUpgradeClick}
                disabled={!canAffordMajor}
                variant={canAffordMajor ? (currentMajorLevel === 0 ? "success" : "primary") : "ghost"}
                size="sm"
                className="w-full"
                icon={currentMajorLevel === 0 ? (ICONS.CHECK_CIRCLE && <ICONS.CHECK_CIRCLE />) : (ICONS.UPGRADE && <ICONS.UPGRADE />)}
            >
                {currentMajorLevel === 0 ? 'Unlock Skill' : 'Upgrade Rank'}
            </Button>
           </div>
        )}
        {isCompletelyMaxed && !isOriginNodeActive && (
          <p className="text-sm text-green-300 text-center font-bold py-2 bg-green-700/30 rounded-md shadow-inner">Max Level Reached</p>
        )}
         {isOriginNodeActive && (
           <p className="text-sm text-sky-300 text-center italic py-1">Core node is active.</p>
        )}
      </div>
    </div>
  );
};

export default SharedSkillDetailPanel;