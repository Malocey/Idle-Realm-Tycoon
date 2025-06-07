

import React, { useState, useEffect, useMemo } from 'react';
import { useGameContext } from '../context';
import { BuildingSpecificUpgradeDefinition, ResourceType, Cost, TownHallUpgradeEffectType, HeroStats } from '../types';
import { ICONS } from './Icons';
import { RESOURCE_COLORS, NOTIFICATION_ICONS } from '../constants';
// FIX: Corrected import path for BUILDING_DEFINITIONS
import { BUILDING_DEFINITIONS } from '../gameData/index';
import { formatNumber, canAfford, calculateBuildingSpecificUpgradeCostValue, getTownHallUpgradeEffectValue, calculateMaxAffordableLevels } from '../utils';
import Button from './Button';

interface BuildingSpecificUpgradeCardProps {
  upgradeDef: BuildingSpecificUpgradeDefinition;
}

// const MAX_LEVEL_ITERATION_CAP_GENERIC = 100; // No longer needed here

const BuildingSpecificUpgradeCard: React.FC<BuildingSpecificUpgradeCardProps> = ({ upgradeDef }) => {
  const { gameState, dispatch } = useGameContext();
  const currentLevel = gameState.buildingSpecificUpgradeLevels[upgradeDef.buildingId]?.[upgradeDef.id] || 0;
  const Icon = ICONS[upgradeDef.iconName];
  const buildingState = gameState.buildings.find(b => b.id === upgradeDef.buildingId);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isAnimating) {
      const timer = setTimeout(() => setIsAnimating(false), 600);
      return () => clearTimeout(timer);
    }
  }, [isAnimating]);

  const isMaxLevel = upgradeDef.maxLevel !== -1 && currentLevel >= upgradeDef.maxLevel;
  const targetLevelForSingle = currentLevel + 1;

  const singleLevelCost: Cost[] = isMaxLevel ? [] : upgradeDef.costs.map(costDef => ({
    resource: costDef.resource,
    amount: calculateBuildingSpecificUpgradeCostValue(costDef, targetLevelForSingle)
  }));
  
  let isLockedByBuildingLevel = false;
  if (upgradeDef.unlockRequirements && buildingState) {
    for (const req of upgradeDef.unlockRequirements) {
      if (buildingState.level < req.buildingLevel) {
        isLockedByBuildingLevel = true;
        break;
      }
    }
  }
  
  const canAffordSingleUpgrade = !isMaxLevel && !isLockedByBuildingLevel && canAfford(gameState.resources, singleLevelCost);

  const maxAffordableLevelsData = useMemo(() => {
    if (isMaxLevel || isLockedByBuildingLevel) {
      return { levels: 0, totalCost: [] };
    }
    return calculateMaxAffordableLevels({
        currentLevel: currentLevel,
        maxLevel: upgradeDef.maxLevel,
        currentMainResources: gameState.resources,
        getMainResourceCostForNextLevel: (simLevel) => 
            upgradeDef.costs.map(costDef => ({
                resource: costDef.resource,
                amount: calculateBuildingSpecificUpgradeCostValue(costDef, simLevel + 1)
            })),
    });
  }, [currentLevel, upgradeDef, gameState.resources, isMaxLevel, isLockedByBuildingLevel]);

  const handleUpgrade = (levelsToUpgrade: number) => {
    if (levelsToUpgrade <= 0 || isLockedByBuildingLevel) return;
    setIsAnimating(true);
    if (levelsToUpgrade === 1) {
        dispatch({ type: 'UPGRADE_BUILDING_SPECIFIC_UPGRADE', payload: { buildingId: upgradeDef.buildingId, upgradeId: upgradeDef.id } });
    } else {
        dispatch({ 
            type: 'UPGRADE_BUILDING_SPECIFIC_UPGRADE', 
            payload: { 
                buildingId: upgradeDef.buildingId, 
                upgradeId: upgradeDef.id,
                levelsToUpgrade: maxAffordableLevelsData.levels,
                totalBatchCost: maxAffordableLevelsData.totalCost
            } 
        });
    }
  };

  const getEffectDisplay = (level: number): string[] => {
    if (level === 0) return ["No current effect."];
    
    return upgradeDef.effects.map(effect => {
        const value = getTownHallUpgradeEffectValue(effect, level); 
        
        if (effect.stat) {
            const statName = effect.stat.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            return `+${(value * 100).toFixed(1)}% ${statName}`;
        } else if (effect.productionBonus) {
            let bonusType = effect.productionBonus.effectType === 'PERCENTAGE_BONUS' ? '%' : ' flat';
            return `+${effect.productionBonus.effectType === 'PERCENTAGE_BONUS' ? (value * 100).toFixed(1) : value}${bonusType} ${effect.productionBonus.resource.replace(/_/g,' ')} Production`;
        } else if (effect.potionCraftTimeReduction) {
            return `-${(value * 100).toFixed(0)}% Potion Craft Time`;
        } else if (effect.potionResourceSaveChance) {
            return `${(value * 100).toFixed(0)}% Chance to save Herbs`;
        } else if (effect.passiveHerbProduction) {
            return `+${value.toFixed(3)}/tick ${effect.passiveHerbProduction.herbType.replace(/HERB_/g,'').replace(/_/g,' ')} Production`;
        }
        return "Unknown effect type";
    });
  };

  const cardBaseClasses = `p-3 rounded-lg border bg-slate-700/50 ${isLockedByBuildingLevel ? 'border-red-700 opacity-70' : 'border-slate-600'}`;
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

      {isLockedByBuildingLevel && upgradeDef.unlockRequirements && buildingState && (
        <div className="mb-2">
          <p className="text-xs text-red-400 font-semibold">Locked:</p>
          {upgradeDef.unlockRequirements.map((req, i) => 
            buildingState.level < req.buildingLevel ? 
            <p key={i} className="text-xs text-red-400">Requires {BUILDING_DEFINITIONS[upgradeDef.buildingId]?.name || 'Building'} Lvl {req.buildingLevel}. (Current: {buildingState.level})</p> 
            : null
          )}
        </div>
      )}

      {!isMaxLevel && !isLockedByBuildingLevel && (
        <>
          <div className="mb-1">
            <p className="text-xs text-slate-500 uppercase font-semibold">Upgrade to Lvl {targetLevelForSingle}:</p>
            {getEffectDisplay(targetLevelForSingle).map((eff, i) => <p key={i} className="text-xs text-sky-400">{eff}</p>)}
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
      {isMaxLevel && <p className="text-xs text-green-400 mt-1">Max Level Reached</p>}
    </div>
  );
};

export default BuildingSpecificUpgradeCard;