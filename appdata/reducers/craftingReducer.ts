

import { GameState, GameAction, ResourceType, Cost, GameNotification, GlobalBonuses, CraftingQueueItem, BuildingSpecificUpgradeDefinition } from '../types';
import { NOTIFICATION_ICONS } from '../constants';
// FIX: Corrected import path for POTION_DEFINITIONS and BUILDING_SPECIFIC_UPGRADE_DEFINITIONS
import { POTION_DEFINITIONS, BUILDING_SPECIFIC_UPGRADE_DEFINITIONS } from '../gameData/index'; // Import potion definitions
import { canAfford, formatNumber, getTownHallUpgradeEffectValue } from '../utils';

export const handleCraftingActions = (
    state: GameState, 
    action: Extract<GameAction, { type: 'CRAFT_ITEM' | 'ADD_POTION_TO_QUEUE' }>,
    globalBonuses: GlobalBonuses
): GameState => {
  switch (action.type) {
    case 'CRAFT_ITEM': { // Handles existing Catacomb Key crafting
        let newResourcesCraft = { ...state.resources };
        let newNotificationsCraft = [...state.notifications];
        if (action.payload.itemId === ResourceType.CATACOMB_KEY) {
            const costPerKey: Cost[] = [
                { resource: ResourceType.GOLD, amount: 250 },
                { resource: ResourceType.IRON, amount: 50 },
                { resource: ResourceType.CRYSTALS, amount: 25 },
                { resource: ResourceType.CATACOMB_BLUEPRINT, amount: 5 },
            ];
             const totalCost: Cost[] = costPerKey.map(c => ({...c, amount: c.amount * action.payload.quantity}));

             const finalCost = totalCost.map(c => ({
                ...c,
                amount: Math.max(1, Math.floor(c.amount * (1 - globalBonuses.catacombKeyCostReduction)))
             }));

            if (!canAfford(state.resources, finalCost)) {
                newNotificationsCraft.push({id: Date.now().toString(), message: `Not enough resources to craft ${action.payload.quantity} Catacomb Key(s).`, type: 'error', iconName: NOTIFICATION_ICONS.error, timestamp: Date.now()});
            } else {
                finalCost.forEach(c => newResourcesCraft[c.resource] -= c.amount);
                newResourcesCraft[ResourceType.CATACOMB_KEY] = (newResourcesCraft[ResourceType.CATACOMB_KEY] || 0) + action.payload.quantity;
                newNotificationsCraft.push({id: Date.now().toString(), message: `Crafted ${action.payload.quantity} Catacomb Key(s)!`, type: 'success', iconName: NOTIFICATION_ICONS.success, timestamp: Date.now()});
            }
            return { ...state, resources: newResourcesCraft, notifications: newNotificationsCraft };
        }
        return state; 
    }
    case 'ADD_POTION_TO_QUEUE': {
      const { potionId, quantity } = action.payload;
      const potionDef = POTION_DEFINITIONS[potionId];
      if (!potionDef) {
        console.warn(`Potion definition ${potionId} not found.`);
        return state;
      }
      if (quantity <= 0) {
         return { ...state, notifications: [...state.notifications, { id: Date.now().toString(), message: 'Cannot craft zero or negative potions.', type: 'warning', iconName: NOTIFICATION_ICONS.warning, timestamp: Date.now() }] };
      }

      let finalTotalCost: Cost[] = potionDef.costs.map(c => ({ ...c, amount: c.amount * quantity }));
      const newResources = { ...state.resources };
      let herbsSaved = false;

      // Apply Alchemist's Lab "Resourceful Alchemy" upgrade
      const alchemistLabUpgrades = BUILDING_SPECIFIC_UPGRADE_DEFINITIONS['ALCHEMISTS_LAB'];
      const resourcefulAlchemyUpgradeDef = alchemistLabUpgrades?.find(upg => upg.id === 'AL_RESOURCEFUL_ALCHEMY');
      const resourcefulAlchemyLevel = state.buildingSpecificUpgradeLevels['ALCHEMISTS_LAB']?.['AL_RESOURCEFUL_ALCHEMY'] || 0;

      if (resourcefulAlchemyUpgradeDef && resourcefulAlchemyLevel > 0) {
          const effect = resourcefulAlchemyUpgradeDef.effects.find(e => e.potionResourceSaveChance);
          if (effect) {
              const saveChance = getTownHallUpgradeEffectValue(effect, resourcefulAlchemyLevel);
              finalTotalCost = finalTotalCost.map(costItem => {
                  if ((costItem.resource === ResourceType.HERB_BLOODTHISTLE || costItem.resource === ResourceType.HERB_IRONWOOD_LEAF) && Math.random() < saveChance) {
                      herbsSaved = true;
                      return { ...costItem, amount: 0 }; // Herb cost is skipped
                  }
                  return costItem;
              });
          }
      }
      
      finalTotalCost = finalTotalCost.filter(c => c.amount > 0); // Remove items with 0 cost

      if (!canAfford(state.resources, finalTotalCost)) {
        return { ...state, notifications: [...state.notifications, { id: Date.now().toString(), message: `Not enough resources to craft ${quantity}x ${potionDef.name}.`, type: 'error', iconName: NOTIFICATION_ICONS.error, timestamp: Date.now() }] };
      }

      finalTotalCost.forEach(c => newResources[c.resource] -= c.amount);
      
      const newNotifications = [...state.notifications];
      if (herbsSaved) {
          newNotifications.push({
              id: Date.now().toString() + "-herbsSaved",
              message: "Resourceful Alchemy! Herbs saved while brewing.",
              type: 'success',
              iconName: 'HERB_BLOODTHISTLE', // Or a generic success/alchemy icon
              timestamp: Date.now()
          });
      }

      const newQueueItem: CraftingQueueItem = {
        id: `${potionId}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        potionId,
        quantity,
        totalCraftTimeMs: potionDef.baseCraftTimeMs * quantity, 
        remainingCraftTimeMs: potionDef.baseCraftTimeMs * quantity, // Will be adjusted by tickReducer based on upgrades
        startTime: Date.now(),
      };
      
      const newCraftingQueue = [...state.craftingQueue, newQueueItem];
       if (newCraftingQueue.length === 1) { 
          newQueueItem.remainingCraftTimeMs = newQueueItem.totalCraftTimeMs; // Initial set, tickReducer will adjust for speed
      }

      newNotifications.push({ id: Date.now().toString(), message: `Added ${quantity}x ${potionDef.name} to brewing queue.`, type: 'info', iconName: NOTIFICATION_ICONS.info, timestamp: Date.now() });

      return {
        ...state,
        resources: newResources,
        craftingQueue: newCraftingQueue,
        notifications: newNotifications,
      };
    }
    default:
      return state;
  }
};