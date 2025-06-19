
import { GameState, GameNotification, CraftingQueueItem, BuildingSpecificUpgradeDefinition, GlobalBonuses } from '../../types';
import { POTION_DEFINITIONS, BUILDING_SPECIFIC_UPGRADE_DEFINITIONS } from '../../gameData';
import { NOTIFICATION_ICONS, GAME_TICK_MS } from '../../constants';
import { getTownHallUpgradeEffectValue } from '../../utils';

export const processPotionCrafting = (state: GameState, globalBonuses: GlobalBonuses, timeSinceLastTick: number, gameSpeed: number): GameState => {
  if (state.craftingQueue.length === 0) {
    return state;
  }

  let newCraftingQueue = [...state.craftingQueue];
  let newPotions = { ...state.potions };
  let newNotifications = [...state.notifications];

  const currentItem = { ...newCraftingQueue[0] };
  let craftTimeReductionFactor = 0;
  
  const alchemistLabUpgrades = BUILDING_SPECIFIC_UPGRADE_DEFINITIONS['ALCHEMISTS_LAB'];
  const efficientBrewingUpgradeDef = alchemistLabUpgrades?.find(upg => upg.id === 'AL_EFFICIENT_BREWING');
  const efficientBrewingLevel = state.buildingSpecificUpgradeLevels['ALCHEMISTS_LAB']?.['AL_EFFICIENT_BREWING'] || 0;
  
  if (efficientBrewingUpgradeDef && efficientBrewingLevel > 0) {
      const effect = efficientBrewingUpgradeDef.effects.find(e => e.potionCraftTimeReduction);
      if (effect) {
          // getTownHallUpgradeEffectValue expects effectParams, we pass the whole effect for now.
          // Ensure the effect definition for potionCraftTimeReduction has compatible effectParams.
          craftTimeReductionFactor = getTownHallUpgradeEffectValue(effect as any, efficientBrewingLevel);
      }
  }
  
  // Apply global potion crafting time reduction from GlobalBonuses
  craftTimeReductionFactor += globalBonuses.potionCraftingTimeReduction || 0;


  // Effective time passed considering game speed and bonuses
  const actualTimeProgressedMs = timeSinceLastTick * (1 + craftTimeReductionFactor);
  
  currentItem.remainingCraftTimeMs -= actualTimeProgressedMs;

  if (currentItem.remainingCraftTimeMs <= 0) {
    const potionDef = POTION_DEFINITIONS[currentItem.potionId];
    if (potionDef) {
      newPotions[currentItem.potionId] = (newPotions[currentItem.potionId] || 0) + currentItem.quantity;
      newNotifications.push({ 
        id: Date.now().toString() + "-potionBrewed-" + currentItem.id, 
        message: `${currentItem.quantity}x ${potionDef.name} finished brewing!`, 
        type: 'success', 
        iconName: 'POTION_BREWED', 
        timestamp: Date.now() 
      });
    }
    newCraftingQueue.shift(); // Remove completed item
    if (newCraftingQueue.length > 0) {
      // Reset progress for the next item in queue if it exists
      // The startTime is important for displaying accurate time remaining, but the core logic is remainingCraftTimeMs
      newCraftingQueue[0] = { 
          ...newCraftingQueue[0], 
          remainingCraftTimeMs: newCraftingQueue[0].totalCraftTimeMs, // Start with full duration
          startTime: Date.now() 
      };
    }
  } else {
    newCraftingQueue[0] = currentItem; // Update the current item's progress
  }

  return { ...state, potions: newPotions, craftingQueue: newCraftingQueue, notifications: newNotifications };
};
