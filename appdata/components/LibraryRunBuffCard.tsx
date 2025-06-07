import React, { useState, useEffect, useMemo } from 'react';
import { RunBuffDefinition, RunBuffRarity, HeroStats, Cost, RunBuffEffect, ResourceType } from '../types';
import { ICONS } from './Icons';
import Button from './Button'; 
import { useGameContext } from '../context';
import { formatNumber, canAfford, calculateMaxAffordableLevels } from '../utils';
import { RESOURCE_COLORS } from '../constants';
import { getRarityTextClass, getRarityBorderClass, getRarityAnimationClass } from '../utils/uiHelpers'; // Updated imports

interface LibraryRunBuffCardProps {
  buffDef: RunBuffDefinition;
}

const LibraryRunBuffCard: React.FC<LibraryRunBuffCardProps> = ({ buffDef }) => {
  const { gameState, dispatch } = useGameContext();
  const BuffIcon = ICONS[buffDef.iconName] || ICONS.UPGRADE; 
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isAnimating) {
      const timer = setTimeout(() => setIsAnimating(false), 600);
      return () => clearTimeout(timer);
    }
  }, [isAnimating]);

  const isUnlocked = gameState.unlockedRunBuffs.includes(buffDef.id);
  const currentLibraryLevel = gameState.runBuffLibraryLevels[buffDef.id] || 0;

  const rarityTextClass = getRarityTextClass(buffDef.rarity);
  const rarityBorderClass = getRarityBorderClass(buffDef.rarity);
  const animationClass = getRarityAnimationClass(buffDef.rarity);


  const isMaxLibraryLevel = buffDef.maxLibraryUpgradeLevel !== undefined && buffDef.maxLibraryUpgradeLevel !== -1 && currentLibraryLevel >= buffDef.maxLibraryUpgradeLevel;
  const canBeUpgradedInLibrary = buffDef.maxLibraryUpgradeLevel !== undefined && buffDef.maxLibraryUpgradeLevel > 0;

  let singleLevelUpgradeCost: Cost[] = [];
  let canAffordSingleUpgrade = false;
  if (isUnlocked && canBeUpgradedInLibrary && !isMaxLibraryLevel && buffDef.libraryUpgradeCostPerLevel) {
    singleLevelUpgradeCost = buffDef.libraryUpgradeCostPerLevel(currentLibraryLevel);
    canAffordSingleUpgrade = canAfford(gameState.resources, singleLevelUpgradeCost);
  }

  let unlockCost: Cost[] = [];
  let canAffordUnlock = false;
  if (!isUnlocked && buffDef.unlockCost) {
    unlockCost = buffDef.unlockCost;
    canAffordUnlock = canAfford(gameState.resources, unlockCost);
  }

  const maxAffordableLevelsData = useMemo(() => {
    if (!isUnlocked || !canBeUpgradedInLibrary || isMaxLibraryLevel || !buffDef.libraryUpgradeCostPerLevel) {
      return { levels: 0, totalCost: [] };
    }
    return calculateMaxAffordableLevels({
        currentLevel: currentLibraryLevel,
        maxLevel: buffDef.maxLibraryUpgradeLevel || -1,
        currentMainResources: gameState.resources,
        getMainResourceCostForNextLevel: (simLevel) => buffDef.libraryUpgradeCostPerLevel!(simLevel),
    });
  }, [currentLibraryLevel, buffDef, gameState.resources, isUnlocked, canBeUpgradedInLibrary, isMaxLibraryLevel]);

  const handleUpgrade = (levelsToUpgrade: number) => {
    if (levelsToUpgrade <= 0) return;
    setIsAnimating(true);
    if (levelsToUpgrade === 1) {
        dispatch({type: 'UPGRADE_RUN_BUFF_LIBRARY', payload: {buffId: buffDef.id}});
    } else {
        dispatch({
            type: 'UPGRADE_RUN_BUFF_LIBRARY',
            payload: {
                buffId: buffDef.id,
                levelsToUpgrade: maxAffordableLevelsData.levels,
                totalBatchCost: maxAffordableLevelsData.totalCost
            }
        });
    }
  };


  const getCombinedEffectsDescription = (): string => {
    let combinedEffects: RunBuffEffect[] = [...buffDef.effects];
    if (isUnlocked && buffDef.libraryEffectsPerUpgradeLevel && currentLibraryLevel > 0) {
        const libraryBonuses = buffDef.libraryEffectsPerUpgradeLevel(currentLibraryLevel);
        if(libraryBonuses && libraryBonuses.length > 0) {
             combinedEffects = [...combinedEffects, ...libraryBonuses];
        }
    }
    const aggregated: Record<string, { value: number, type: string, stats: (keyof HeroStats)[] }> = {};
    combinedEffects.forEach(eff => {
        if (eff.stat) {
            const key = `${eff.stat}-${eff.type}`;
            if (!aggregated[key]) aggregated[key] = { value: 0, type: eff.type, stats: [] };
            aggregated[key].value += eff.value;
            if (!aggregated[key].stats.includes(eff.stat)) aggregated[key].stats.push(eff.stat);
        }
    });

    let descParts: string[] = [];
    Object.values(aggregated).forEach(agg => {
        const statName = agg.stats.join('/'); 
        if (agg.type === 'PERCENTAGE_ADDITIVE') {
            descParts.push(`+${(agg.value * 100).toFixed(0)}% ${statName}`);
        } else {
            descParts.push(`+${agg.value.toFixed(agg.type === 'FLAT' && (statName === 'attackSpeed' || statName === 'manaRegen') ? 2 : 0)} ${statName}`);
        }
    });
    if (descParts.length > 0) return descParts.join(', ') + ".";
    
    if (buffDef.id === 'RUN_BUFF_LOOT_FIND' && isUnlocked) {
        let totalGoldBonus = 0.20; 
        if (buffDef.libraryEffectsPerUpgradeLevel && currentLibraryLevel > 0) {
            const libraryEffect = buffDef.libraryEffectsPerUpgradeLevel(currentLibraryLevel);
            if (libraryEffect && libraryEffect[0]) { 
                totalGoldBonus += libraryEffect[0].value;
            }
        }
        return `Increases gold from dungeon loot cells by ${(totalGoldBonus * 100).toFixed(0)}%.`;
    }
    if (buffDef.id === 'RUN_BUFF_SIGHT_RADIUS') return buffDef.description; 

    return buffDef.description; 
  };

  const cardBaseClasses = `p-3 rounded-lg border-2 bg-slate-700/60 shadow-md flex flex-col h-full ${rarityBorderClass} ${animationClass}`;
  const pulseAnimationClass = isAnimating ? "animate-special-cast hero-cast-pulse" : "";


  return (
    <div className={`${cardBaseClasses} ${pulseAnimationClass}`}>
      <div className="flex items-start mb-2">
        {BuffIcon && <BuffIcon className={`w-7 h-7 mr-2.5 flex-shrink-0 mt-0.5 ${rarityTextClass}`} />}
        <div>
          <h4 className={`text-md font-semibold ${rarityTextClass}`}>{buffDef.name}</h4>
          <p className={`text-xs font-medium ${rarityTextClass}`}>{buffDef.rarity}</p>
        </div>
      </div>
      <p className="text-xs text-slate-300 mb-2 flex-grow">
        Effect (Library Lvl {currentLibraryLevel}): {getCombinedEffectsDescription()}
      </p>
      
      <div className="mt-auto pt-2 border-t border-slate-600/50 space-y-2">
        {!isUnlocked && buffDef.unlockCost && (
            <>
            <p className="text-xs text-amber-400 mb-1">Unlock Cost:</p>
            {unlockCost.map(c => (
                <span key={c.resource} className={`text-xs mr-2 ${!canAffordUnlock && gameState.resources[c.resource] < c.amount ? 'text-red-400' : RESOURCE_COLORS[c.resource]}`}>
                {ICONS[c.resource] && React.createElement(ICONS[c.resource],{className: "inline w-3 h-3 mr-0.5"})} 
                {formatNumber(c.amount)} / {formatNumber(gameState.resources[c.resource] || 0)}
                </span>
            ))}
            <Button variant="success" size="sm" className="w-full mt-1" onClick={() => dispatch({type: 'UNLOCK_RUN_BUFF', payload: {buffId: buffDef.id}})} disabled={!canAffordUnlock}>
                Unlock Buff
            </Button>
            </>
        )}
        {isUnlocked && canBeUpgradedInLibrary && !isMaxLibraryLevel && buffDef.libraryUpgradeCostPerLevel && (
            <>
            <p className="text-xs text-sky-400 mb-1">Upgrade to Library Lvl {currentLibraryLevel + 1} Cost:</p>
            {singleLevelUpgradeCost.map(c => (
                <span key={c.resource} className={`text-xs mr-2 ${!canAffordSingleUpgrade && gameState.resources[c.resource] < c.amount ? 'text-red-400' : RESOURCE_COLORS[c.resource]}`}>
                {ICONS[c.resource] && React.createElement(ICONS[c.resource],{className: "inline w-3 h-3 mr-0.5"})} 
                {formatNumber(c.amount)} / {formatNumber(gameState.resources[c.resource] || 0)}
                </span>
            ))}
            <div className="flex space-x-2 mt-1">
                <Button variant="primary" size="sm" className="flex-1" onClick={() => handleUpgrade(1)} disabled={!canAffordSingleUpgrade}>
                    Upgrade
                </Button>
                <Button variant="success" size="sm" className="flex-1" onClick={() => handleUpgrade(maxAffordableLevelsData.levels)} disabled={maxAffordableLevelsData.levels === 0}>
                    Max (+{maxAffordableLevelsData.levels})
                </Button>
            </div>
            </>
        )}
        {isUnlocked && canBeUpgradedInLibrary && isMaxLibraryLevel && (
            <p className="text-xs text-green-400 text-center">Max Library Level Reached ({currentLibraryLevel})</p>
        )}
         {isUnlocked && !canBeUpgradedInLibrary && (
             <p className="text-xs text-slate-400 text-center">Not upgradeable in Library.</p>
         )}
        <p className="text-xs text-slate-500 mt-1">
            Stacks up to: {buffDef.maxStacks || 1} time(s) per run.
        </p>
      </div>
    </div>
  );
};

export default LibraryRunBuffCard;