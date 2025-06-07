
import React, { useState, useEffect, useMemo } from 'react';
import { useGameContext } from '../context';
import { PlayerBuildingState, ResourceType, Cost, BuildingDefinition } from '../types';
import { ICONS } from './Icons';
import { RESOURCE_COLORS, GAME_TICK_MS } from '../constants';
import { BUILDING_DEFINITIONS, BUILDING_SPECIFIC_UPGRADE_DEFINITIONS } from '../gameData/index';
import { formatNumber, canAfford, calculateBuildingUpgradeCost, calculateMaxAffordableLevels } from '../utils';
import Button from './Button';

interface BuildingCardProps {
  buildingState: PlayerBuildingState;
  onOpenTownHallUpgrades?: () => void;
  onOpenForgeUpgrades?: () => void;
  onOpenDungeonSelection?: () => void;
  onOpenBuildingSpecificUpgrades?: (buildingId: string) => void;
  onOpenGuildHallUpgrades?: () => void;
  onOpenAlchemistLab?: () => void;
  onOpenLibrary?: () => void;
  onOpenStoneQuarryMinigame?: () => void; 
  onEnterColosseum?: () => void; 
  onOpenGoldMineMinigame?: () => void; 
  onOpenDemoniconPortal?: () => void; // New prop
}

const BUILDING_LEVEL_UP_INDICATOR_DURATION = 10000;

const BuildingCard: React.FC<BuildingCardProps> = ({
  buildingState,
  onOpenTownHallUpgrades,
  onOpenForgeUpgrades,
  onOpenDungeonSelection,
  onOpenBuildingSpecificUpgrades,
  onOpenGuildHallUpgrades,
  onOpenAlchemistLab,
  onOpenLibrary,
  onOpenStoneQuarryMinigame,
  onEnterColosseum,
  onOpenGoldMineMinigame,
  onOpenDemoniconPortal, // New
}) => {
  const { gameState, dispatch, getBuildingProduction, getBuildingUpgradeCost: getSingleLevelUpgradeCost, getGlobalBonuses } = useGameContext();
  const def = BUILDING_DEFINITIONS[buildingState.id];
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isAnimating) {
      const timer = setTimeout(() => setIsAnimating(false), 600); 
      return () => clearTimeout(timer);
    }
  }, [isAnimating]);

  if (!def) return null;

  const globalBonuses = getGlobalBonuses();
  const Icon = ICONS[def.iconName];

  const upgradeCostForNextLevel = getSingleLevelUpgradeCost(buildingState); 

  const currentProductionPerTick = getBuildingProduction(buildingState);

  const currentProductionPerSecond = currentProductionPerTick.map(p => {
    let amountPerSecondWithBonus = p.amountPerTick * (1000 / GAME_TICK_MS);
    if (p.resource !== ResourceType.TOWN_XP &&
        p.resource !== ResourceType.HEROIC_POINTS &&
        p.resource !== ResourceType.CATACOMB_BLUEPRINT &&
        p.resource !== ResourceType.AETHERIUM) {
      amountPerSecondWithBonus *= (1 + globalBonuses.allResourceProductionBonus);
    }
    return { ...p, amountPerSecond: amountPerSecondWithBonus };
  });

  const canAffordSingleUpgrade = canAfford(gameState.resources, upgradeCostForNextLevel);

  const [craftKeyAmount, setCraftKeyAmount] = useState(1);
  const catacombKeyCostBase: Cost[] = [
    { resource: ResourceType.GOLD, amount: 250 },
    { resource: ResourceType.IRON, amount: 50 },
    { resource: ResourceType.CRYSTALS, amount: 25 },
    { resource: ResourceType.CATACOMB_BLUEPRINT, amount: 5 },
  ];
  const totalKeyCost = catacombKeyCostBase.map(c => ({
    ...c,
    amount: Math.max(1, Math.floor(c.amount * craftKeyAmount * (1 - globalBonuses.catacombKeyCostReduction)))
  }));
  const canAffordKeys = canAfford(gameState.resources, totalKeyCost);

  const handleCraftKeys = () => {
    if (craftKeyAmount > 0 && canAffordKeys) {
      setIsAnimating(true);
      dispatch({ type: 'CRAFT_ITEM', payload: { itemId: ResourceType.CATACOMB_KEY, quantity: craftKeyAmount }});
    }
  };

  const handleUpgradeBuilding = () => {
    if (canAffordSingleUpgrade) {
      setIsAnimating(true);
      dispatch({ type: 'UPGRADE_BUILDING', payload: { buildingId: def.id } });
    }
  };

  const maxAffordableLevelsData = useMemo(() => {
    if (!def || (def.maxLevel !== -1 && buildingState.level >= def.maxLevel)) {
      return { levels: 0, totalCost: [] };
    }
    return calculateMaxAffordableLevels({
        currentLevel: buildingState.level,
        maxLevel: def.maxLevel,
        currentMainResources: gameState.resources,
        getMainResourceCostForNextLevel: (simLevel) => 
            calculateBuildingUpgradeCost(def, simLevel + 1).map(c => ({
                ...c,
                amount: Math.max(1, Math.floor(c.amount * (1 - globalBonuses.buildingCostReduction)))
            })),
    });
  }, [buildingState.level, def, gameState.resources, globalBonuses.buildingCostReduction]);


  const handleMaxUpgrade = () => {
    if (maxAffordableLevelsData.levels > 0) {
      dispatch({
        type: 'UPGRADE_BUILDING',
        payload: {
          buildingId: def.id,
          levelsToUpgrade: maxAffordableLevelsData.levels,
          totalBatchCost: maxAffordableLevelsData.totalCost
        }
      });
      setIsAnimating(true); 
    }
  };


  const buildingLevelUpEvent = gameState.buildingLevelUpEvents[buildingState.id];
  const showLevelUpIndicator = buildingLevelUpEvent && (Date.now() - buildingLevelUpEvent.timestamp < BUILDING_LEVEL_UP_INDICATOR_DURATION);

  const hasSpecificUpgrades = BUILDING_SPECIFIC_UPGRADE_DEFINITIONS[def.id] && BUILDING_SPECIFIC_UPGRADE_DEFINITIONS[def.id].length > 0;

  const cardBaseClasses = "bg-slate-800 p-4 rounded-lg shadow-md glass-effect relative transition-all duration-200 ease-in-out border border-slate-700 hover:shadow-xl hover:border-sky-400";
  const animationClasses = isAnimating ? "animate-special-cast hero-cast-pulse" : "";


  return (
    <div className={`${cardBaseClasses} ${animationClasses}`}>
      {showLevelUpIndicator && (
        <span className="building-level-up-indicator" aria-label="Leveled up from loot">+1</span>
      )}
      <div className="flex items-center mb-2">
        {Icon && <Icon className="w-8 h-8 mr-3 text-sky-400" />}
        <h3 className="text-xl font-semibold text-sky-300">{def.name} <span className="text-sm text-slate-400">Lvl {buildingState.level}</span></h3>
      </div>
      <p className="text-sm text-slate-400 mb-2">{def.description}</p>

      {def.isProducer && currentProductionPerSecond.length > 0 && (
        <div className="mb-2">
            <h4 className="text-xs text-slate-500 uppercase font-semibold mb-1">Production (per second)</h4>
            {currentProductionPerSecond.map(p => (
            <div key={p.resource} className="flex items-center text-sm">
                <span className={`${RESOURCE_COLORS[p.resource as ResourceType]}`}>{p.resource.replace(/_/g,' ')}:</span>
                <span className="ml-1 text-slate-200">+{formatNumber(p.amountPerSecond)}</span>
            </div>
            ))}
        </div>
      )}

       {(def.maxLevel === -1 || buildingState.level < def.maxLevel) && (
        <div className="mt-3 space-y-2">
          <h4 className="text-xs text-slate-500 uppercase font-semibold mb-1">Upgrade Cost (Lvl {buildingState.level + 1})</h4>
          {upgradeCostForNextLevel.map(c => (
            <div key={c.resource} className={`flex items-center text-sm ${gameState.resources[c.resource] < c.amount ? 'text-red-400' : 'text-slate-300'}`}>
              <span className={`${RESOURCE_COLORS[c.resource as ResourceType]}`}>{ICONS[c.resource] && React.createElement(ICONS[c.resource], {className:"w-3 h-3 inline mr-1"})} {c.resource.replace(/_/g,' ')}:</span>
              <span className="ml-1">{formatNumber(c.amount)} / {formatNumber(gameState.resources[c.resource] || 0)}</span>
            </div>
          ))}
          <div className="flex space-x-2">
            <Button
              onClick={handleUpgradeBuilding}
              disabled={!canAffordSingleUpgrade}
              className="flex-1"
              variant="primary"
              icon={ICONS.UPGRADE && <ICONS.UPGRADE className="w-4 h-4"/>}
            >
              Upgrade
            </Button>
            <Button
              onClick={handleMaxUpgrade}
              disabled={maxAffordableLevelsData.levels === 0}
              className="flex-1"
              variant="success" 
              icon={ICONS.UPGRADE && <ICONS.UPGRADE className="w-4 h-4"/>}
            >
              Max (+{maxAffordableLevelsData.levels})
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-2 mt-2">
        {def.id === 'TOWN_HALL' && onOpenTownHallUpgrades && (
            <Button
              onClick={onOpenTownHallUpgrades}
              className="w-full"
              variant="secondary"
              icon={ICONS.SETTINGS && <ICONS.SETTINGS className="w-4 h-4"/>}
            >
              Global Upgrades
            </Button>
        )}
        {def.id === 'GUILD_HALL' && onOpenGuildHallUpgrades && (
            <Button
              onClick={onOpenGuildHallUpgrades}
              className="w-full"
              variant="secondary"
              icon={ICONS.HERO && <ICONS.HERO className="w-4 h-4"/>}
            >
              Guild Upgrades
            </Button>
        )}
        {def.id === 'ALCHEMISTS_LAB' && onOpenAlchemistLab && (
            <Button
              onClick={onOpenAlchemistLab}
              className="w-full"
              variant="secondary"
              icon={ICONS.STAFF_ICON && <ICONS.STAFF_ICON className="w-4 h-4"/>}
            >
              Potion Brewing
            </Button>
        )}
        {(def.id === 'ALCHEMISTS_LAB' || def.id === 'MAGE_TOWER' || def.id === 'FARM') && onOpenBuildingSpecificUpgrades && hasSpecificUpgrades && (
            <Button
              onClick={() => onOpenBuildingSpecificUpgrades(def.id)}
              className="w-full"
              variant="secondary"
              icon={ICONS.UPGRADE && <ICONS.UPGRADE className="w-4 h-4"/>}
            >
              {def.id === 'ALCHEMISTS_LAB' ? 'Alchemical Upgrades' :
               def.id === 'MAGE_TOWER' ? 'Arcane Enhancements' :
               def.id === 'FARM' ? 'Farm Upgrades' : 'Building Upgrades'}
            </Button>
        )}
        {def.id === 'LIBRARY' && onOpenLibrary && (
          <Button
            onClick={onOpenLibrary}
            className="w-full"
            variant="secondary"
            icon={ICONS.BOOK_ICON && <ICONS.BOOK_ICON className="w-4 h-4"/>}
          >
            View Buff Compendium
          </Button>
        )}
         {def.id === 'STONE_QUARRY' && onOpenStoneQuarryMinigame && def.hasMinigame && ( 
            <Button
              onClick={onOpenStoneQuarryMinigame}
              className="w-full"
              variant="secondary"
              icon={ICONS.SHOVEL_ICON && <ICONS.SHOVEL_ICON className="w-4 h-4"/>}
            >
              Excavate
            </Button>
        )}
        {def.id === 'GOLD_MINE' && onOpenGoldMineMinigame && def.hasMinigame && ( 
            <Button
              onClick={onOpenGoldMineMinigame}
              className="w-full"
              variant="secondary"
              icon={ICONS.PICKAXE_ICON ? <ICONS.PICKAXE_ICON className="w-4 h-4"/> : (ICONS.GOLD && <ICONS.GOLD className="w-4 h-4"/>)}
            >
              Enter Mine
            </Button>
        )}
        {def.id === 'COLOSSEUM' && onEnterColosseum && (
            <Button
              onClick={onEnterColosseum}
              className="w-full"
              variant="secondary"
              icon={ICONS.COLOSSEUM_ICON && <ICONS.COLOSSEUM_ICON className="w-4 h-4"/>}
            >
              Enter Colosseum
            </Button>
        )}
        {def.id === 'DEMONICON_GATE' && onOpenDemoniconPortal && ( // New button for Demonicon Gate
            <Button
              onClick={onOpenDemoniconPortal}
              className="w-full"
              variant="secondary" // Or a more thematic variant
              icon={ICONS.ENEMY && <ICONS.ENEMY className="w-4 h-4"/>} // Placeholder icon
            >
              Enter Demonicon
            </Button>
        )}
      </div>

      {def.id === 'FORGE' && (
        <div className="mt-3 pt-3 border-t border-slate-700 space-y-2">
            <h4 className="text-md font-semibold text-amber-300">Craft Catacomb Key</h4>
             <div className="flex items-center space-x-2">
                <label htmlFor={`craft-key-amount-${def.id}`} className="text-sm text-slate-300">Amount:</label>
                <input
                    type="number"
                    id={`craft-key-amount-${def.id}`}
                    value={craftKeyAmount}
                    onChange={(e) => setCraftKeyAmount(Math.max(1, parseInt(e.target.value) || 1))}
                    min="1"
                    className="w-16 p-1 bg-slate-700 border border-slate-600 rounded text-sm"
                />
            </div>
            <div className="text-xs">Cost for {craftKeyAmount} Key(s):</div>
            {totalKeyCost.map(c => (
                 <div key={c.resource} className={`flex items-center text-xs ${gameState.resources[c.resource] < c.amount ? 'text-red-400' : RESOURCE_COLORS[c.resource]}`}>
                    <span className={`${RESOURCE_COLORS[c.resource]}`}>{ICONS[c.resource] && React.createElement(ICONS[c.resource], {className:"w-3 h-3 inline mr-1"})} {c.resource.replace(/_/g,' ')}:</span>
                    <span className="ml-1">{formatNumber(c.amount)} / {formatNumber(gameState.resources[c.resource] || 0)}</span>
                </div>
            ))}
            <Button onClick={handleCraftKeys} disabled={!canAffordKeys || craftKeyAmount <= 0} className="w-full" variant="secondary" icon={ICONS.CATACOMB_KEY && <ICONS.CATACOMB_KEY className="w-4 h-4"/>}>
                Craft Key(s)
            </Button>
            {onOpenForgeUpgrades && (
                <Button onClick={onOpenForgeUpgrades} className="w-full" variant="secondary" icon={ICONS.ANVIL && <ICONS.ANVIL className="w-4 h-4"/>}>
                    Upgrade Equipment
                </Button>
            )}
        </div>
      )}
       {def.id === 'EXPLORERS_GUILD' && onOpenDungeonSelection && (
          <Button
            onClick={onOpenDungeonSelection}
            className="w-full mt-2"
            variant="secondary"
            icon={ICONS.COMPASS && <ICONS.COMPASS className="w-4 h-4"/>}
          >
            Enter Catacombs
          </Button>
      )}

      {def.maxLevel !== -1 && buildingState.level >= def.maxLevel && (
        <p className="text-sm text-green-400 mt-3 text-center">Building Max Level Reached</p>
      )}
    </div>
  );
};

export default BuildingCard;
