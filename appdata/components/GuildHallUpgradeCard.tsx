

import React, { useState, useEffect, useMemo } from 'react';
import { useGameContext } from '../context';
import { GuildHallUpgradeDefinition, ResourceType, Cost, HeroStats, GlobalEffectTarget } from '../types';
import { ICONS } from './Icons';
import { RESOURCE_COLORS, NOTIFICATION_ICONS } from '../constants';
import { HERO_DEFINITIONS, GUILD_HALL_UPGRADE_DEFINITIONS as ALL_GH_UPGRADES } from '../gameData/index'; // For hero names
import { formatNumber, canAfford, calculateGuildHallUpgradeCostValue, getTownHallUpgradeEffectValue, calculateMaxAffordableLevels } from '../utils';
import Button from './Button';

interface GuildHallUpgradeCardProps {
  upgradeDef: GuildHallUpgradeDefinition;
}

// const MAX_LEVEL_ITERATION_CAP_GENERIC = 100; // No longer needed here

const GuildHallUpgradeCard: React.FC<GuildHallUpgradeCardProps> = ({ upgradeDef }) => {
  const { gameState, dispatch } = useGameContext();
  const currentLevel = gameState.guildHallUpgradeLevels[upgradeDef.id] || 0;
  const Icon = ICONS[upgradeDef.iconName];
  const guildHallBuilding = gameState.buildings.find(b => b.id === 'GUILD_HALL');
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isAnimating) {
      const timer = setTimeout(() => setIsAnimating(false), 600);
      return () => clearTimeout(timer);
    }
  }, [isAnimating]);

  const isMaxLevel = upgradeDef.maxLevel !== -1 && currentLevel >= upgradeDef.maxLevel;
  const targetLevelForSingle = currentLevel + 1;

  let isLocked = false;
  let unlockMessages: string[] = [];

  for (const req of upgradeDef.unlockRequirements) {
    if (req.guildHallLevel && (!guildHallBuilding || guildHallBuilding.level < req.guildHallLevel)) {
      isLocked = true;
      unlockMessages.push(`Requires Guild Hall Lvl ${req.guildHallLevel}. (Current: ${guildHallBuilding?.level || 0})`);
    }
    if (req.heroRecruited && !gameState.heroes.find(h => h.definitionId === req.heroRecruited)) {
      isLocked = true;
      const heroDef = HERO_DEFINITIONS[req.heroRecruited];
      unlockMessages.push(`Requires ${heroDef?.name || req.heroRecruited} to be recruited.`);
    }
    if (req.otherGuildUpgradeId && req.otherGuildUpgradeLevel) {
      if ((gameState.guildHallUpgradeLevels[req.otherGuildUpgradeId] || 0) < req.otherGuildUpgradeLevel) {
        isLocked = true;
        const prereqGHUpgradeDef = ALL_GH_UPGRADES[req.otherGuildUpgradeId];
        unlockMessages.push(`Requires ${prereqGHUpgradeDef?.name || req.otherGuildUpgradeId} Lvl ${req.otherGuildUpgradeLevel}. (Current: ${gameState.guildHallUpgradeLevels[req.otherGuildUpgradeId] || 0})`);
      }
    }
  }
  
  const singleLevelCost: Cost[] = isMaxLevel || isLocked ? [] : upgradeDef.costs.map(costDef => ({
    resource: costDef.resource,
    amount: calculateGuildHallUpgradeCostValue(costDef, targetLevelForSingle)
  }));

  const townXpCostItemSingleGH = singleLevelCost.find(c => c.resource === ResourceType.TOWN_XP);
  const otherResourceCostsSingleGH = singleLevelCost.filter(c => c.resource !== ResourceType.TOWN_XP);
  const canAffordTownXpSingleGH = townXpCostItemSingleGH ? gameState.totalTownXp >= townXpCostItemSingleGH.amount : true;
  const canAffordOthersSingleGH = canAfford(gameState.resources, otherResourceCostsSingleGH);
  const canAffordSingleUpgrade = !isMaxLevel && !isLocked && canAffordTownXpSingleGH && canAffordOthersSingleGH;


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
                    amount: calculateGuildHallUpgradeCostValue(costDef, simLevel + 1)
                })),
        secondaryResource: townXpCostDef ? {
            name: "Town XP",
            currentValue: gameState.totalTownXp,
            getCostForNextLevel: (simLevel) => calculateGuildHallUpgradeCostValue(townXpCostDef, simLevel + 1),
            tempResourceTypeForTotalCost: ResourceType.TOWN_XP
        } : undefined,
    });
  }, [currentLevel, upgradeDef, gameState.resources, gameState.totalTownXp, isMaxLevel, isLocked]);

  const handleUpgrade = (levelsToUpgrade: number) => {
    if (levelsToUpgrade <= 0 || isLocked) return;
    setIsAnimating(true);
    if (levelsToUpgrade === 1) {
        dispatch({ type: 'UPGRADE_GUILD_HALL_UPGRADE', payload: { upgradeId: upgradeDef.id } });
    } else {
        dispatch({ 
            type: 'UPGRADE_GUILD_HALL_UPGRADE', 
            payload: { 
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
        const value = getTownHallUpgradeEffectValue(effect, level); // Reusing calculator
        if (effect.globalEffectTarget) {
            let targetText = effect.globalEffectTarget.toLowerCase().replace(/_/g, ' ');
             if (effect.globalEffectTarget === GlobalEffectTarget.BUILDING_COST_REDUCTION || effect.globalEffectTarget === GlobalEffectTarget.HERO_RECRUITMENT_COST_REDUCTION) {
                 return `-${(value * 100).toFixed(1)}% ${targetText}`;
            }
            return `+${(value * 100).toFixed(1)}% ${targetText}`;
        } else if (effect.stat) {
            const statName = effect.stat.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            let heroTargetName = '';
            if (effect.heroClassTarget) {
                const heroDef = HERO_DEFINITIONS[effect.heroClassTarget];
                heroTargetName = heroDef ? `${heroDef.name} ` : `${effect.heroClassTarget} `;
            }
            if (effect.effectParams.type === 'PercentageBonus') {
                return `+${(value * 100).toFixed(1)}% ${heroTargetName}${statName}`;
            }
            return `+${formatNumber(value)} ${heroTargetName}${statName}`;
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

export default GuildHallUpgradeCard;