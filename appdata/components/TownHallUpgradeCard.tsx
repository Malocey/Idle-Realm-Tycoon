

import React, { useState, useEffect, useMemo } from 'react';
import { useGameContext } from '../context';
import { TownHallUpgradeDefinition, ResourceType, Cost, TownHallUpgradeUnlockRequirementType, HeroStats, BuildingDefinition, GlobalEffectTarget } from '../types';
import { ICONS } from './Icons';
import { RESOURCE_COLORS, NOTIFICATION_ICONS } from '../constants';
// FIX: Corrected import path for game data definitions
import { TOWN_HALL_UPGRADE_DEFINITIONS, BUILDING_DEFINITIONS } from '../gameData/index';
import { formatNumber, canAfford, calculateTownHallUpgradeCostValue, getTownHallUpgradeEffectValue, calculateMaxAffordableLevels } from '../utils';
import Button from './Button';

interface TownHallUpgradeCardProps {
  upgradeDef: TownHallUpgradeDefinition;
}

// const MAX_LEVEL_ITERATION_CAP_GENERIC = 100; // No longer needed here

const TownHallUpgradeCard: React.FC<TownHallUpgradeCardProps> = ({ upgradeDef }) => {
  const { gameState, dispatch, staticData } = useGameContext();
  const currentLevel = gameState.townHallUpgradeLevels[upgradeDef.id] || 0;
  const Icon = ICONS[upgradeDef.iconName];
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isAnimating) {
      const timer = setTimeout(() => setIsAnimating(false), 600); // Animation duration
      return () => clearTimeout(timer);
    }
  }, [isAnimating]);

  const isMaxLevel = upgradeDef.maxLevel !== -1 && currentLevel >= upgradeDef.maxLevel;
  const targetLevelForSingle = currentLevel + 1;

  let isLocked = false;
  let unlockMessages: string[] = [];

  for (const req of upgradeDef.unlockRequirements) {
    const params = req.unlockParams;
    if (params.type === TownHallUpgradeUnlockRequirementType.SpecificUpgradeLevel) {
      if ((gameState.townHallUpgradeLevels[params.upgradeId] || 0) < params.level) {
        isLocked = true;
        const prereqDef = TOWN_HALL_UPGRADE_DEFINITIONS[params.upgradeId];
        unlockMessages.push(`Requires ${prereqDef?.name || params.upgradeId} Lvl ${params.level}. (Current: ${gameState.townHallUpgradeLevels[params.upgradeId] || 0})`);
      }
    } else if (params.type === TownHallUpgradeUnlockRequirementType.TotalResourceSpentOnPaths) {
      if (params.resource === ResourceType.GOLD && gameState.totalGoldSpentOnTownHallPaths < params.amount) {
        isLocked = true;
        unlockMessages.push(`Requires ${formatNumber(params.amount)} total Gold spent on specific TH upgrades. (Current: ${formatNumber(gameState.totalGoldSpentOnTownHallPaths)})`);
      }
    } else if (params.type === TownHallUpgradeUnlockRequirementType.BuildingLevel) {
        const building = gameState.buildings.find(b => b.id === params.buildingId);
        if (!building || building.level < params.level) {
            isLocked = true;
            const buildingDef = staticData.buildingDefinitions[params.buildingId];
            unlockMessages.push(`Requires ${buildingDef?.name || params.buildingId} Lvl ${params.level}. (Current: ${building?.level || 0})`);
        }
    }
  }
  
  const singleLevelCost: Cost[] = isMaxLevel || isLocked ? [] : upgradeDef.costs.map(costDef => ({
    resource: costDef.resource,
    amount: calculateTownHallUpgradeCostValue(costDef, targetLevelForSingle)
  }));
  
  const townXpCostItemSingle = singleLevelCost.find(c => c.resource === ResourceType.TOWN_XP);
  const otherResourceCostsSingle = singleLevelCost.filter(c => c.resource !== ResourceType.TOWN_XP);
  const canAffordTownXpSingle = townXpCostItemSingle ? gameState.totalTownXp >= townXpCostItemSingle.amount : true;
  const canAffordOthersSingle = canAfford(gameState.resources, otherResourceCostsSingle);
  const canAffordSingleUpgrade = !isMaxLevel && !isLocked && canAffordTownXpSingle && canAffordOthersSingle;


  const maxAffordableLevelsData = useMemo(() => {
    if (isMaxLevel || isLocked) {
      return { levels: 0, totalCost: [] };
    }
    
    const townXpCostDef = upgradeDef.costs.find(c => c.resource === ResourceType.TOWN_XP);

    return calculateMaxAffordableLevels({
        currentLevel: currentLevel,
        maxLevel: upgradeDef.maxLevel,
        currentMainResources: gameState.resources,
        getMainResourceCostForNextLevel: (simLevel) => 
            upgradeDef.costs
                .filter(cd => cd.resource !== ResourceType.TOWN_XP)
                .map(costDef => ({
                    resource: costDef.resource,
                    amount: calculateTownHallUpgradeCostValue(costDef, simLevel + 1)
                })),
        secondaryResource: townXpCostDef ? {
            name: "Town XP",
            currentValue: gameState.totalTownXp,
            getCostForNextLevel: (simLevel) => calculateTownHallUpgradeCostValue(townXpCostDef, simLevel + 1),
            tempResourceTypeForTotalCost: ResourceType.TOWN_XP
        } : undefined,
    });
  }, [currentLevel, upgradeDef, gameState.resources, gameState.totalTownXp, isMaxLevel, isLocked]);

  const handleUpgrade = (levelsToUpgrade: number) => {
    if (levelsToUpgrade <= 0 || isLocked) return;
    setIsAnimating(true);
    if (levelsToUpgrade === 1) {
        dispatch({ type: 'UPGRADE_TOWN_HALL_GLOBAL_UPGRADE', payload: { upgradeId: upgradeDef.id } });
    } else {
        dispatch({ 
            type: 'UPGRADE_TOWN_HALL_GLOBAL_UPGRADE', 
            payload: { 
                upgradeId: upgradeDef.id, 
                levelsToUpgrade: maxAffordableLevelsData.levels,
                totalBatchCost: maxAffordableLevelsData.totalCost
            } 
        });
    }
  };
  
  const getEffectDisplay = (level: number): string[] => {
    if (level === 0 && !upgradeDef.effects.some(e => e.globalEffectTarget)) return ["No current effect."]; 
    
    return upgradeDef.effects.map(effect => {
        const value = getTownHallUpgradeEffectValue(effect, level);
        if (effect.globalEffectTarget) {
            let targetText = effect.globalEffectTarget.toLowerCase().replace(/_/g, ' ');
            if (effect.globalEffectTarget === GlobalEffectTarget.BUILDING_COST_REDUCTION) {
                 return `-${(value * 100).toFixed(1)}% ${targetText}`;
            }
            return `+${(value * 100).toFixed(1)}% ${targetText}`;
        } else if (effect.stat) {
            const statName = effect.stat.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            if (effect.effectParams.type === 'PercentageBonus') {
                return `+${(value * 100).toFixed(1)}% ${statName}`;
            }
            return `+${formatNumber(value)} ${statName}`;
        }
        return "Unknown effect";
    });
  };

  const cardBaseClasses = `p-3 rounded-lg border bg-slate-700/50 ${isLocked ? 'border-red-700 opacity-70' : 'border-slate-600'}`;
  const animationClasses = isAnimating ? "animate-special-cast hero-cast-pulse" : "";


  return (
    <div className={`${cardBaseClasses} ${animationClasses}`}>
      <div className="flex items-center mb-1">
        {Icon && <Icon className="w-6 h-6 mr-2 text-amber-400" />}
        <h4 className="text-md font-semibold text-amber-300">
          {upgradeDef.name} <span className="text-xs text-slate-400">Lvl {currentLevel}{upgradeDef.maxLevel !== -1 ? `/${upgradeDef.maxLevel}` : ''}</span>
        </h4>
      </div>
      <p className="text-xs text-slate-400 mb-2">{upgradeDef.description}</p>

      {currentLevel > 0 && (
        <div className="mb-2">
            <p className="text-xs text-slate-500 uppercase font-semibold">Current Effect:</p>
            {getEffectDisplay(currentLevel).map((eff, i) => <p key={i} className="text-xs text-green-400">{eff}</p>)}
        </div>
      )}

      {isLocked && unlockMessages.length > 0 && (
        <div className="mb-2">
          <p className="text-xs text-red-400 font-semibold">Locked:</p>
          {unlockMessages.map((msg, i) => <p key={i} className="text-xs text-red-400">{msg}</p>)}
        </div>
      )}

      {!isMaxLevel && !isLocked && (
        <>
          <div className="mb-1">
            <p className="text-xs text-slate-500 uppercase font-semibold">Upgrade to Lvl {targetLevelForSingle}:</p>
            {getEffectDisplay(targetLevelForSingle).map((eff, i) => <p key={i} className="text-xs text-sky-400">{eff}</p>)}
             <p className="text-xs text-slate-500 mt-1">Cost:</p>
            {singleLevelCost.map(c => (
              <span key={c.resource} className={`text-xs mr-2 ${
                  c.resource === ResourceType.TOWN_XP 
                  ? (gameState.totalTownXp < c.amount ? 'text-red-400' : RESOURCE_COLORS[c.resource]) 
                  : (gameState.resources[c.resource] < c.amount ? 'text-red-400' : RESOURCE_COLORS[c.resource])
                }`}>
                {ICONS[c.resource] && React.createElement(ICONS[c.resource],{className: "inline w-3 h-3 mr-0.5"})} 
                {formatNumber(c.amount)} / {formatNumber(c.resource === ResourceType.TOWN_XP ? gameState.totalTownXp : (gameState.resources[c.resource] || 0))} {c.resource.replace(/_/g,' ').toLowerCase()}
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
      {isMaxLevel && <p className="text-xs text-green-400 mt-1">Max Level Reached</p>}
    </div>
  );
};

export default TownHallUpgradeCard;