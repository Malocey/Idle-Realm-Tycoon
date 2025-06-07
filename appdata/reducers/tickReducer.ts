

import { GameState, GameAction, ResourceType, GlobalBonuses, GameNotification, BuildingSpecificUpgradeDefinition } from '../types';
// FIX: Corrected import path for BUILDING_DEFINITIONS, HERO_DEFINITIONS, POTION_DEFINITIONS
import { BUILDING_DEFINITIONS, HERO_DEFINITIONS, POTION_DEFINITIONS, BUILDING_SPECIFIC_UPGRADE_DEFINITIONS } from '../gameData/index';
import { calculateBuildingProduction, getExpToNextHeroLevel, formatNumber, getTownHallUpgradeEffectValue } from '../utils';
// FIX: Import GAME_TICK_MS
import { NOTIFICATION_ICONS, GAME_TICK_MS } from '../constants';

export const handleProcessTick = (state: GameState, action: Extract<GameAction, { type: 'PROCESS_TICK' }>, globalBonuses: GlobalBonuses): GameState => {
  let newResources = { ...state.resources };
  let newTotalTownXp = state.totalTownXp;
  let newPotions = { ...state.potions };
  let newCraftingQueue = [...state.craftingQueue];
  let newNotifications = [...state.notifications];

  state.buildings.forEach(b => {
    if (b.level === 0) return;
    const def = BUILDING_DEFINITIONS[b.id];
    if (def && def.isProducer) {
      const production = calculateBuildingProduction(def, b.level);
      production.forEach(p => {
        let amount = p.amountPerTick * state.gameSpeed;
        // Apply global production bonus to resources, not XP or special items like blueprints
        if (p.resource !== ResourceType.TOWN_XP &&
            p.resource !== ResourceType.HEROIC_POINTS &&
            p.resource !== ResourceType.CATACOMB_BLUEPRINT &&
            p.resource !== ResourceType.AETHERIUM) { // Aetherium not affected by global prod bonus
             amount *= (1 + globalBonuses.allResourceProductionBonus);
        }

        if (p.resource === ResourceType.TOWN_XP) {
          newTotalTownXp += amount;
        } else if (p.resource === ResourceType.HEROIC_POINTS) {
          amount *= (1 + globalBonuses.heroXpGainBonus); // Apply hero XP gain bonus
          newResources[p.resource] = (newResources[p.resource] || 0) + amount;
        }
        else {
          newResources[p.resource] = (newResources[p.resource] || 0) + amount;
        }
      });
    }
    // Handle Farm's Herb Cultivation upgrade
    if (def?.id === 'FARM') {
        const farmUpgrades = BUILDING_SPECIFIC_UPGRADE_DEFINITIONS['FARM'];
        const herbCultivationUpgradeDef = farmUpgrades?.find(upg => upg.id === 'FARM_HERB_CULTIVATION');
        const herbCultivationLevel = state.buildingSpecificUpgradeLevels['FARM']?.['FARM_HERB_CULTIVATION'] || 0;

        if (herbCultivationUpgradeDef && herbCultivationLevel > 0) {
            herbCultivationUpgradeDef.effects.forEach(effect => {
                if (effect.passiveHerbProduction) {
                    const effectValue = getTownHallUpgradeEffectValue(effect, herbCultivationLevel); // This will use baseIncrease + additiveStep
                    const amountPerTick = effectValue * state.gameSpeed; // Apply game speed
                    newResources[effect.passiveHerbProduction.herbType] = (newResources[effect.passiveHerbProduction.herbType] || 0) + amountPerTick;
                }
            });
        }
    }
  });

  const updatedHeroes = state.heroes.map(hero => {
    let currentExp = hero.currentExp;
    let level = hero.level;
    let skillPoints = hero.skillPoints;
    let expToNextLevel = hero.expToNextLevel;

    while (currentExp >= expToNextLevel && level < (HERO_DEFINITIONS[hero.definitionId] ? 100 : 100)) {
      currentExp -= expToNextLevel;
      level++;
      skillPoints++;
      expToNextLevel = getExpToNextHeroLevel(level);
    }
    return { ...hero, currentExp, level, skillPoints, expToNextLevel };
  });

  // Process Crafting Queue
  if (newCraftingQueue.length > 0) {
    const currentItem = { ...newCraftingQueue[0] }; // Work with a copy
    
    // Apply Alchemist's Lab "Efficient Brewing" upgrade
    let craftTimeReductionFactor = 0;
    const alchemistLabUpgrades = BUILDING_SPECIFIC_UPGRADE_DEFINITIONS['ALCHEMISTS_LAB'];
    const efficientBrewingUpgradeDef = alchemistLabUpgrades?.find(upg => upg.id === 'AL_EFFICIENT_BREWING');
    const efficientBrewingLevel = state.buildingSpecificUpgradeLevels['ALCHEMISTS_LAB']?.['AL_EFFICIENT_BREWING'] || 0;

    if (efficientBrewingUpgradeDef && efficientBrewingLevel > 0) {
        const effect = efficientBrewingUpgradeDef.effects.find(e => e.potionCraftTimeReduction);
        if (effect) {
            craftTimeReductionFactor = getTownHallUpgradeEffectValue(effect, efficientBrewingLevel);
        }
    }

    const tickReduction = (GAME_TICK_MS / state.gameSpeed) * state.gameSpeed; // Base tick reduction
    const effectiveTickReduction = craftTimeReductionFactor > 0 ? tickReduction / (1 - craftTimeReductionFactor) : tickReduction;
    
    currentItem.remainingCraftTimeMs -= effectiveTickReduction;

    if (currentItem.remainingCraftTimeMs <= 0) {
      const potionDef = POTION_DEFINITIONS[currentItem.potionId];
      if (potionDef) {
        newPotions[currentItem.potionId] = (newPotions[currentItem.potionId] || 0) + currentItem.quantity;
        newNotifications.push({
          id: Date.now().toString() + "-potionBrewed-" + currentItem.id,
          message: `${currentItem.quantity}x ${potionDef.name} finished brewing!`,
          type: 'success',
          iconName: 'POTION_BREWED', // Assuming POTION_BREWED icon exists
          timestamp: Date.now()
        });
      }
      newCraftingQueue.shift(); // Remove completed item

      if (newCraftingQueue.length > 0) {
        // Start next item by setting its remaining time
        newCraftingQueue[0] = {
            ...newCraftingQueue[0],
            remainingCraftTimeMs: newCraftingQueue[0].totalCraftTimeMs,
            startTime: Date.now()
        };
      }
    } else {
      newCraftingQueue[0] = currentItem; // Update the first item with new remaining time
    }
  }


  const nowForCleanup = Date.now();
  const LEVEL_UP_EVENT_DURATION_MS = 10000;
  const activeLevelUpEvents: Record<string, { timestamp: number }> = {};
  let levelUpEventsChanged = false;

  Object.entries(state.buildingLevelUpEvents).forEach(([buildingId, eventData]) => {
    if (nowForCleanup - eventData.timestamp < LEVEL_UP_EVENT_DURATION_MS) {
      activeLevelUpEvents[buildingId] = eventData;
    } else {
      levelUpEventsChanged = true;
    }
  });

  const finalLevelUpEvents = levelUpEventsChanged || Object.keys(state.buildingLevelUpEvents).length !== Object.keys(activeLevelUpEvents).length
    ? activeLevelUpEvents
    : state.buildingLevelUpEvents;


  return {
    ...state,
    resources: newResources,
    totalTownXp: newTotalTownXp,
    heroes: updatedHeroes,
    potions: newPotions,
    craftingQueue: newCraftingQueue,
    notifications: newNotifications, // Make sure to include notifications from brewing
    lastTickTimestamp: Date.now(),
    buildingLevelUpEvents: finalLevelUpEvents
  };
};