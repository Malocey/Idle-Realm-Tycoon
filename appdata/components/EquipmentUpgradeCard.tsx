

import React, { useState, useEffect, useMemo } from 'react';
import { useGameContext } from '../context';
import { HeroEquipmentDefinition, PlayerHeroState, ResourceType, Cost, HeroStats } from '../types';
import { ICONS } from './Icons';
import { RESOURCE_COLORS } from '../constants';
import { formatNumber, canAfford, getTotalEquipmentStatBonus, calculateMaxAffordableLevels } from '../utils';
import Button from './Button';

interface EquipmentUpgradeCardProps {
  heroState: PlayerHeroState;
  equipmentDef: HeroEquipmentDefinition;
  forgeLevel: number; 
}

const EquipmentUpgradeCard: React.FC<EquipmentUpgradeCardProps> = ({ heroState, equipmentDef, forgeLevel }) => {
  const { gameState, dispatch } = useGameContext();
  const currentLevel = heroState.equipmentLevels[equipmentDef.id] || 0;
  const Icon = ICONS[equipmentDef.iconName];
  const LockIcon = ICONS.LOCK_CLOSED;
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isAnimating) {
      const timer = setTimeout(() => setIsAnimating(false), 600);
      return () => clearTimeout(timer);
    }
  }, [isAnimating]);

  const isLockedByUnlockLevel = equipmentDef.unlockForgeLevel !== undefined && forgeLevel < equipmentDef.unlockForgeLevel;
  const isCappedByCurrentForgeLevel = currentLevel >= forgeLevel && equipmentDef.maxLevel !== 0 && (equipmentDef.maxLevel === -1 || currentLevel < equipmentDef.maxLevel);
  
  const isDefinitionMaxLevel = equipmentDef.maxLevel !== -1 && currentLevel >= equipmentDef.maxLevel;
  const targetLevelForSingle = currentLevel + 1;

  const singleLevelCost: Cost[] = isDefinitionMaxLevel || isLockedByUnlockLevel || isCappedByCurrentForgeLevel ? [] : equipmentDef.costsPerLevel(currentLevel);
  const canAffordSingleUpgrade = !isDefinitionMaxLevel && !isLockedByUnlockLevel && !isCappedByCurrentForgeLevel && canAfford(gameState.resources, singleLevelCost);

  const currentTotalBonus = getTotalEquipmentStatBonus(equipmentDef, currentLevel);
  const nextLevelTotalBonusForSingle = isDefinitionMaxLevel || isLockedByUnlockLevel || isCappedByCurrentForgeLevel ? currentTotalBonus : getTotalEquipmentStatBonus(equipmentDef, targetLevelForSingle);
  
  const maxAffordableLevelsData = useMemo(() => {
    if (isDefinitionMaxLevel || isLockedByUnlockLevel || isCappedByCurrentForgeLevel) {
      return { levels: 0, totalCost: [] };
    }
    return calculateMaxAffordableLevels({
        currentLevel: currentLevel,
        maxLevel: equipmentDef.maxLevel,
        forgeLevelCap: forgeLevel, // Pass forgeLevel as the cap
        currentMainResources: gameState.resources,
        getMainResourceCostForNextLevel: (simLevel) => equipmentDef.costsPerLevel(simLevel),
    });
  }, [currentLevel, equipmentDef, gameState.resources, isDefinitionMaxLevel, isLockedByUnlockLevel, isCappedByCurrentForgeLevel, forgeLevel]);


  const handleUpgrade = (levelsToUpgrade: number) => {
    if (levelsToUpgrade <= 0 || isLockedByUnlockLevel || isCappedByCurrentForgeLevel) return;
    setIsAnimating(true);
    if (levelsToUpgrade === 1) {
        dispatch({ type: 'UPGRADE_HERO_EQUIPMENT', payload: { heroDefinitionId: heroState.definitionId, equipmentId: equipmentDef.id } });
    } else {
        dispatch({ 
            type: 'UPGRADE_HERO_EQUIPMENT', 
            payload: { 
                heroDefinitionId: heroState.definitionId, 
                equipmentId: equipmentDef.id,
                levelsToUpgrade: maxAffordableLevelsData.levels,
                totalBatchCost: maxAffordableLevelsData.totalCost
            }
        });
    }
  };

  const getBonusDisplay = (bonusObject: Partial<HeroStats>): string[] => {
    const displays: string[] = [];
    (Object.keys(bonusObject) as Array<keyof HeroStats>).forEach(statKey => {
        const value = bonusObject[statKey];
        if (value !== undefined && value !== 0) {
            const statName = statKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            if (statKey === 'critChance' || statKey === 'critDamage') {
                 displays.push(`+${(value * 100).toFixed(1)}% ${statName}`);
            } else if (statKey === 'attackSpeed') {
                displays.push(`+${value.toFixed(2)} ${statName}`);
            }
            else {
                 displays.push(`+${formatNumber(value)} ${statName}`);
            }
        }
    });
    return displays.length > 0 ? displays : ["No bonus."];
  };

  const cardBaseClasses = `p-3 rounded-lg border bg-slate-700/50 ${isLockedByUnlockLevel ? 'border-red-700 opacity-60' : 'border-slate-600'} relative`;
  const animationClasses = isAnimating ? "animate-special-cast hero-cast-pulse" : "";

  const showUpgradeSection = !isDefinitionMaxLevel && !isLockedByUnlockLevel && !isCappedByCurrentForgeLevel;

  return (
    <div className={`${cardBaseClasses} ${animationClasses}`}>
      {isLockedByUnlockLevel && (
        <div className="absolute inset-0 bg-slate-900/80 flex flex-col items-center justify-center rounded-lg z-10 p-2">
          {LockIcon && <LockIcon className="w-8 h-8 text-amber-400 mb-2" />}
          <p className="text-sm text-amber-300 font-semibold text-center">Requires Forge Level {equipmentDef.unlockForgeLevel} to unlock.</p>
        </div>
      )}
      <div className="flex items-center mb-1">
        {Icon && <Icon className="w-6 h-6 mr-2 text-amber-400" />}
        <h4 className="text-md font-semibold text-amber-300">
          {equipmentDef.name} <span className="text-xs text-slate-400">Lvl {currentLevel}{equipmentDef.maxLevel !== -1 ? `/${equipmentDef.maxLevel}` : ''}</span>
        </h4>
      </div>
      <p className="text-xs text-slate-400 mb-2">{equipmentDef.description(currentLevel, currentTotalBonus)}</p>

      {currentLevel > 0 && (
        <div className="mb-2">
            <p className="text-xs text-slate-500 uppercase font-semibold">Current Total Bonus:</p>
            {getBonusDisplay(currentTotalBonus).map((eff, i) => <p key={i} className="text-xs text-green-400">{eff}</p>)}
        </div>
      )}

      {showUpgradeSection && (
        <>
          <div className="mb-1">
            <p className="text-xs text-slate-500 uppercase font-semibold">Upgrade to Lvl {targetLevelForSingle} (Total Bonus):</p>
            {getBonusDisplay(nextLevelTotalBonusForSingle).map((eff, i) => <p key={i} className="text-xs text-sky-400">{eff}</p>)}
             <p className="text-xs text-slate-500 mt-1">Cost:</p>
            {singleLevelCost.map(c => (
              <span key={c.resource} className={`text-xs mr-2 ${gameState.resources[c.resource] < c.amount ? 'text-red-400' : RESOURCE_COLORS[c.resource]}`}>
                {ICONS[c.resource] && React.createElement(ICONS[c.resource],{className: "inline w-3 h-3 mr-0.5"})} 
                {formatNumber(c.amount)} / {formatNumber(gameState.resources[c.resource] || 0)} {c.resource.replace(/_/g,' ').toLowerCase()}
              </span>
            ))}
          </div>
          <div className="flex space-x-2 mt-2">
            <Button 
              onClick={() => handleUpgrade(1)}
              disabled={!canAffordSingleUpgrade}
              size="sm"
              variant="secondary"
              className="flex-1"
            >
              Upgrade
            </Button>
            <Button
              onClick={() => handleUpgrade(maxAffordableLevelsData.levels)}
              disabled={maxAffordableLevelsData.levels === 0}
              size="sm"
              variant="success"
              className="flex-1"
            >
              Max (+{maxAffordableLevelsData.levels})
            </Button>
          </div>
        </>
      )}
      {!isLockedByUnlockLevel && isCappedByCurrentForgeLevel && !isDefinitionMaxLevel && (
        <p className="text-xs text-amber-400 mt-1 text-center">
          Further upgrades require Forge Level {currentLevel + 1}. Current Forge Level: {forgeLevel}.
        </p>
      )}
      {!isLockedByUnlockLevel && isDefinitionMaxLevel && <p className="text-xs text-green-400 mt-1 text-center">Max Level Reached</p>}
    </div>
  );
};

export default EquipmentUpgradeCard;