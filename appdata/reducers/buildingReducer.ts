
import { GameState, GameAction, PlayerBuildingState, Cost, GameNotification, GlobalBonuses } from '../types';
// FIX: Corrected import path for game data definitions
import { BUILDING_DEFINITIONS } from '../gameData/index';
import { NOTIFICATION_ICONS } from '../constants';
import { calculateBuildingUpgradeCost, canAfford } from '../utils';

export const handleBuildingActions = (
    state: GameState, 
    action: Extract<GameAction, { type: 'CONSTRUCT_BUILDING' | 'UPGRADE_BUILDING' }>,
    globalBonuses: GlobalBonuses
): GameState => {
  switch (action.type) {
    case 'CONSTRUCT_BUILDING': {
      const buildingDef = BUILDING_DEFINITIONS[action.payload.buildingId];
      if (!buildingDef || state.buildings.find(b => b.id === action.payload.buildingId)) {
        return state;
      }
      let cost = [...buildingDef.baseCost];
      // Apply cost reduction
      cost = cost.map(c => ({
          ...c,
          amount: Math.max(1, Math.floor(c.amount * (1 - globalBonuses.buildingCostReduction)))
      }));

      if (!canAfford(state.resources, cost)) {
        const newNotification: GameNotification = { id: Date.now().toString(), message: `Not enough resources to construct ${buildingDef.name}!`, type: 'error', iconName: NOTIFICATION_ICONS.error, timestamp: Date.now() };
        return { ...state, notifications: [...state.notifications, newNotification]};
      }
      const newResources = { ...state.resources };
      cost.forEach(c => newResources[c.resource] -= c.amount);
      const newBuilding: PlayerBuildingState = { id: buildingDef.id, level: 1 };
      const successNotification: GameNotification = { id: Date.now().toString(), message: `${buildingDef.name} constructed!`, type: 'success', iconName: NOTIFICATION_ICONS.success, timestamp: Date.now() };
      return { ...state, resources: newResources, buildings: [...state.buildings, newBuilding], notifications: [...state.notifications, successNotification] };
    }
    case 'UPGRADE_BUILDING': {
      const { buildingId, levelsToUpgrade = 1, totalBatchCost } = action.payload;
      const building = state.buildings.find(b => b.id === buildingId);
      const def = BUILDING_DEFINITIONS[buildingId];

      if (!building || !def || (def.maxLevel !== -1 && building.level >= def.maxLevel)) return state;
      if (levelsToUpgrade <= 0) return state;

      const initialLevel = building.level;
      let finalTargetLevel = initialLevel + levelsToUpgrade;

      if (def.maxLevel !== -1 && finalTargetLevel > def.maxLevel) {
        finalTargetLevel = def.maxLevel;
      }
      
      const actualLevelsUpgraded = finalTargetLevel - initialLevel;
      if (actualLevelsUpgraded <= 0) {
         const newNotification: GameNotification = { id: Date.now().toString(), message: `${def.name} is already at max level or no upgrade possible.`, type: 'info', iconName: NOTIFICATION_ICONS.info, timestamp: Date.now() };
         return { ...state, notifications: [...state.notifications, newNotification]};
      }

      let costForUpgrade: Cost[];
      if (levelsToUpgrade > 1 && totalBatchCost) {
        costForUpgrade = totalBatchCost;
      } else {
        // Single level upgrade or fallback if totalBatchCost wasn't provided
        costForUpgrade = calculateBuildingUpgradeCost(def, initialLevel + 1).map(c => ({
          ...c,
          amount: Math.max(1, Math.floor(c.amount * (1 - globalBonuses.buildingCostReduction)))
        }));
      }
      
      if (!canAfford(state.resources, costForUpgrade)) {
         const newNotification: GameNotification = { id: Date.now().toString(), message: `Not enough resources to upgrade ${def.name}!`, type: 'error', iconName: NOTIFICATION_ICONS.error, timestamp: Date.now() };
         return { ...state, notifications: [...state.notifications, newNotification]};
      }

      const newResources = { ...state.resources };
      costForUpgrade.forEach(c => newResources[c.resource] -= c.amount);
      
      const successNotification: GameNotification = {
        id: Date.now().toString(),
        message: levelsToUpgrade > 1
          ? `${def.name} upgraded from Lvl ${initialLevel} to Lvl ${finalTargetLevel} (x${actualLevelsUpgraded} levels)!`
          : `${def.name} upgraded to Lvl ${finalTargetLevel}!`,
        type: 'success',
        iconName: NOTIFICATION_ICONS.success,
        timestamp: Date.now()
      };

      return {
        ...state,
        resources: newResources,
        buildings: state.buildings.map(b => b.id === buildingId ? { ...b, level: finalTargetLevel } : b),
        notifications: [...state.notifications, successNotification]
      };
    }
    default:
      return state;
  }
};
