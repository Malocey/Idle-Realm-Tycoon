
import { GameState, GameAction, ResourceType, GlobalBonuses, GameNotification, BuildingSpecificUpgradeDefinition, ResearchProgress, CompletedResearchEntry } from '../types';
import { BUILDING_DEFINITIONS, HERO_DEFINITIONS, POTION_DEFINITIONS, BUILDING_SPECIFIC_UPGRADE_DEFINITIONS, RESEARCH_DEFINITIONS } from '../gameData/index';
import { calculateBuildingProduction, getExpToNextHeroLevel, formatNumber, getTownHallUpgradeEffectValue } from '../utils';
import { NOTIFICATION_ICONS, GAME_TICK_MS } from '../constants';
import { ICONS } from '../components/Icons'; // Import ICONS

export const handleProcessTick = (state: GameState, action: Extract<GameAction, { type: 'PROCESS_TICK' }>, globalBonuses: GlobalBonuses): GameState => {
  let newResources = { ...state.resources };
  let newTotalTownXp = state.totalTownXp;
  let newPotions = { ...state.potions };
  let newCraftingQueue = [...state.craftingQueue];
  let newNotifications = [...state.notifications];
  let newResearchProgress = { ...state.researchProgress };
  let newCompletedResearch = { ...state.completedResearch };
  let newResearchQueue = [...state.researchQueue];

  // Building Production
  state.buildings.forEach(b => {
    if (b.level === 0) return;
    const def = BUILDING_DEFINITIONS[b.id];
    if (def && def.isProducer) {
      const production = calculateBuildingProduction(def, b.level);
      production.forEach(p => {
        let amount = p.amountPerTick * state.gameSpeed;
        if (p.resource !== ResourceType.TOWN_XP &&
            p.resource !== ResourceType.HEROIC_POINTS &&
            p.resource !== ResourceType.CATACOMB_BLUEPRINT &&
            p.resource !== ResourceType.AETHERIUM &&
            p.resource !== ResourceType.RESEARCH_POINTS) {
             amount *= (1 + globalBonuses.allResourceProductionBonus);
        }

        if (p.resource === ResourceType.TOWN_XP) {
          newTotalTownXp += amount;
        } else if (p.resource === ResourceType.HEROIC_POINTS) {
          amount *= (1 + globalBonuses.heroXpGainBonus);
          newResources[p.resource] = (newResources[p.resource] || 0) + amount;
        } else if (p.resource === ResourceType.RESEARCH_POINTS) {
          amount *= (1 + globalBonuses.researchPointProductionBonus);
          newResources[p.resource] = (newResources[p.resource] || 0) + amount;
        }
        else {
          newResources[p.resource] = (newResources[p.resource] || 0) + amount;
        }
      });
    }
    if (def?.id === 'FARM') {
        const farmUpgrades = BUILDING_SPECIFIC_UPGRADE_DEFINITIONS['FARM'];
        const herbCultivationUpgradeDef = farmUpgrades?.find(upg => upg.id === 'FARM_HERB_CULTIVATION');
        const herbCultivationLevel = state.buildingSpecificUpgradeLevels['FARM']?.['FARM_HERB_CULTIVATION'] || 0;

        if (herbCultivationUpgradeDef && herbCultivationLevel > 0) {
            herbCultivationUpgradeDef.effects.forEach(effect => {
                if (effect.passiveHerbProduction) {
                    const effectValue = getTownHallUpgradeEffectValue(effect, herbCultivationLevel);
                    const amountPerTick = effectValue * state.gameSpeed;
                    newResources[effect.passiveHerbProduction.herbType] = (newResources[effect.passiveHerbProduction.herbType] || 0) + amountPerTick;
                }
            });
        }
    }
  });

  // Hero XP (Not handled in tick, but kept hero update logic for consistency if other per-tick hero logic added later)
  const updatedHeroes = state.heroes.map(hero => {
    let currentExp = hero.currentExp;
    let level = hero.level;
    let skillPoints = hero.skillPoints;
    let expToNextLevel = hero.expToNextLevel;
    while (currentExp >= expToNextLevel && level < (HERO_DEFINITIONS[hero.definitionId] ? 100 : 100)) {
      currentExp -= expToNextLevel;
      level++; skillPoints++;
      expToNextLevel = getExpToNextHeroLevel(level);
    }
    return { ...hero, currentExp, level, skillPoints, expToNextLevel };
  });

  // Process Crafting Queue
  if (newCraftingQueue.length > 0) {
    const currentItem = { ...newCraftingQueue[0] };
    let craftTimeReductionFactor = 0;
    const alchemistLabUpgrades = BUILDING_SPECIFIC_UPGRADE_DEFINITIONS['ALCHEMISTS_LAB'];
    const efficientBrewingUpgradeDef = alchemistLabUpgrades?.find(upg => upg.id === 'AL_EFFICIENT_BREWING');
    const efficientBrewingLevel = state.buildingSpecificUpgradeLevels['ALCHEMISTS_LAB']?.['AL_EFFICIENT_BREWING'] || 0;
    if (efficientBrewingUpgradeDef && efficientBrewingLevel > 0) {
        const effect = efficientBrewingUpgradeDef.effects.find(e => e.potionCraftTimeReduction);
        if (effect) craftTimeReductionFactor = getTownHallUpgradeEffectValue(effect, efficientBrewingLevel);
    }
    const tickProgress = GAME_TICK_MS * state.gameSpeed;
    const effectiveTickProgress = craftTimeReductionFactor > 0 ? tickProgress * (1 + craftTimeReductionFactor) : tickProgress;
    currentItem.remainingCraftTimeMs -= effectiveTickProgress;

    if (currentItem.remainingCraftTimeMs <= 0) {
      const potionDef = POTION_DEFINITIONS[currentItem.potionId];
      if (potionDef) {
        newPotions[currentItem.potionId] = (newPotions[currentItem.potionId] || 0) + currentItem.quantity;
        newNotifications.push({ id: Date.now().toString() + "-potionBrewed-" + currentItem.id, message: `${currentItem.quantity}x ${potionDef.name} finished brewing!`, type: 'success', iconName: 'POTION_BREWED', timestamp: Date.now() });
      }
      newCraftingQueue.shift();
      if (newCraftingQueue.length > 0) {
        newCraftingQueue[0] = { ...newCraftingQueue[0], remainingCraftTimeMs: newCraftingQueue[0].totalCraftTimeMs, startTime: Date.now() };
      }
    } else {
      newCraftingQueue[0] = currentItem;
    }
  }

  // Process Research Queue
  const researchSlotIdsInUse = new Set<number>();
  Object.values(newResearchProgress).forEach(p => researchSlotIdsInUse.add(p.researchSlotId));

  Object.keys(newResearchProgress).forEach(instanceId => {
    const researchingItem = { ...newResearchProgress[instanceId] }; // Make a mutable copy
    const researchDef = RESEARCH_DEFINITIONS[researchingItem.researchId];
    if (!researchDef) return;

    researchingItem.currentProgressTicks += 1; // Increment by 1 game tick

    const researchTimeReductionBonus = globalBonuses.researchTimeReduction || 0;
    const effectiveTargetTicks = Math.max(1, Math.floor(researchingItem.targetTicks * (1 - researchTimeReductionBonus)));

    if (researchingItem.currentProgressTicks >= effectiveTargetTicks) {
      newCompletedResearch[researchingItem.researchId] = {
        level: researchingItem.levelBeingResearched,
      };
      delete newResearchProgress[instanceId];
      researchSlotIdsInUse.delete(researchingItem.researchSlotId); // Free up slot

      newNotifications.push({
        id: Date.now().toString() + "-researchComplete-" + researchDef.id,
        message: `Research Complete: ${researchDef.name} Lvl ${researchingItem.levelBeingResearched}!`,
        type: 'success',
        iconName: researchDef.iconName || 'UPGRADE',
        timestamp: Date.now(),
      });
    } else {
      newResearchProgress[instanceId] = researchingItem; // Update progress
    }
  });
  
  // Check queue if slots are free
  if (newResearchQueue.length > 0 && researchSlotIdsInUse.size < state.researchSlots) {
      for (let i = 0; i < state.researchSlots; i++) {
          if (!researchSlotIdsInUse.has(i) && newResearchQueue.length > 0) {
              const nextQueuedItem = newResearchQueue.shift()!;
              const nextResearchDef = RESEARCH_DEFINITIONS[nextQueuedItem.researchId];
              if (nextResearchDef) {
                const newInstanceId = `${nextQueuedItem.researchId}-${nextQueuedItem.levelToResearch}-${Date.now()}`;
                newResearchProgress[newInstanceId] = {
                    researchId: nextQueuedItem.researchId,
                    levelBeingResearched: nextQueuedItem.levelToResearch,
                    currentProgressTicks: 0,
                    targetTicks: nextResearchDef.researchTimeTicks,
                    researchSlotId: i,
                    startTime: Date.now(),
                };
                researchSlotIdsInUse.add(i); // Mark slot as used
                newNotifications.push({ id: Date.now().toString() + "-researchStartedFromQueue", message: `Started ${nextResearchDef.name} Lvl ${nextQueuedItem.levelToResearch} from queue.`, type: 'info', iconName: nextResearchDef.iconName, timestamp: Date.now() });
              }
          }
      }
  }


  // Cleanup old building level up events
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
    ? activeLevelUpEvents : state.buildingLevelUpEvents;

  return {
    ...state,
    resources: newResources,
    totalTownXp: newTotalTownXp,
    heroes: updatedHeroes,
    potions: newPotions,
    craftingQueue: newCraftingQueue,
    notifications: newNotifications,
    lastTickTimestamp: Date.now(),
    buildingLevelUpEvents: finalLevelUpEvents,
    researchProgress: newResearchProgress,
    completedResearch: newCompletedResearch,
    researchQueue: newResearchQueue,
  };
};
