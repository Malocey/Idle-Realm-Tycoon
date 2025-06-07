
import { GameState, GameAction, ResourceType, Cost, GameNotification, GlobalBonuses } from '../types';
import { BUILDING_DEFINITIONS, BUILDING_SPECIFIC_UPGRADE_DEFINITIONS } from '../gameData/index';
import { NOTIFICATION_ICONS } from '../constants';
import { canAfford, calculateBuildingSpecificUpgradeCostValue, formatNumber } from '../utils';

export const handleBuildingSpecificUpgradeActions = (
    state: GameState,
    action: Extract<GameAction, { type: 'UPGRADE_BUILDING_SPECIFIC_UPGRADE' }>,
    globalBonuses: GlobalBonuses
): GameState => {
  switch (action.type) {
    case 'UPGRADE_BUILDING_SPECIFIC_UPGRADE': {
      const { buildingId, upgradeId, levelsToUpgrade = 1, totalBatchCost } = action.payload;
      const buildingSpecificUpgradeDefsArray = BUILDING_SPECIFIC_UPGRADE_DEFINITIONS[buildingId];
      if (!buildingSpecificUpgradeDefsArray) {
        console.error(`No specific upgrades defined for building ${buildingId}`);
        return state;
      }
      const upgradeDef = buildingSpecificUpgradeDefsArray.find(ud => ud.id === upgradeId);
      if (!upgradeDef) {
        console.error(`Upgrade definition ${upgradeId} not found for building ${buildingId}`);
        return state;
      }

      const buildingState = state.buildings.find(b => b.id === buildingId);
      if (!buildingState) {
        console.error(`Building ${buildingId} not found in player state`);
        return state;
      }

      const initialLevel = state.buildingSpecificUpgradeLevels[buildingId]?.[upgradeId] || 0;

      if (upgradeDef.maxLevel !== -1 && initialLevel >= upgradeDef.maxLevel) {
        const newNotification: GameNotification = { id: Date.now().toString(), message: `${upgradeDef.name} is at max level.`, type: 'info', iconName: NOTIFICATION_ICONS.info, timestamp: Date.now() };
        return { ...state, notifications: [...state.notifications, newNotification] };
      }
      if (levelsToUpgrade <=0) return state;


      // Check building level unlock requirements
      if (upgradeDef.unlockRequirements) {
        for (const req of upgradeDef.unlockRequirements) {
          if (buildingState.level < req.buildingLevel) {
            const buildingDefForNotification = BUILDING_DEFINITIONS[buildingId];
            const newNotification: GameNotification = { id: Date.now().toString(), message: `Requires ${buildingDefForNotification?.name || buildingId} Lvl ${req.buildingLevel} for ${upgradeDef.name}.`, type: 'warning', iconName: NOTIFICATION_ICONS.warning, timestamp: Date.now() };
            return { ...state, notifications: [...state.notifications, newNotification] };
          }
        }
      }

      let finalTargetLevel = initialLevel + levelsToUpgrade;
      if (upgradeDef.maxLevel !== -1 && finalTargetLevel > upgradeDef.maxLevel) {
          finalTargetLevel = upgradeDef.maxLevel;
      }
      const actualLevelsUpgraded = finalTargetLevel - initialLevel;
      if (actualLevelsUpgraded <= 0) {
          const newNotification: GameNotification = { id: Date.now().toString(), message: `${upgradeDef.name} is already at max level or no upgrade possible.`, type: 'info', iconName: NOTIFICATION_ICONS.info, timestamp: Date.now() };
          return { ...state, notifications: [...state.notifications, newNotification]};
      }

      let costForUpgrade: Cost[];
      if (levelsToUpgrade > 1 && totalBatchCost) {
          costForUpgrade = totalBatchCost;
      } else {
          costForUpgrade = upgradeDef.costs.map(costDef => ({
              resource: costDef.resource,
              amount: calculateBuildingSpecificUpgradeCostValue(costDef, initialLevel + 1)
          }));
      }


      if (!canAfford(state.resources, costForUpgrade)) {
        const newNotification: GameNotification = { id: Date.now().toString(), message: `Not enough resources for ${upgradeDef.name}.`, type: 'error', iconName: NOTIFICATION_ICONS.error, timestamp: Date.now() };
        return { ...state, notifications: [...state.notifications, newNotification] };
      }

      const newResources = { ...state.resources };
      costForUpgrade.forEach(c => { newResources[c.resource] -= c.amount; });

      const newBuildingSpecificUpgradeLevels = {
        ...state.buildingSpecificUpgradeLevels,
        [buildingId]: {
          ...(state.buildingSpecificUpgradeLevels[buildingId] || {}),
          [upgradeId]: finalTargetLevel
        }
      };
      
      const buildingDefForNotification = BUILDING_DEFINITIONS[buildingId];
      const successNotification: GameNotification = { 
          id: Date.now().toString(), 
          message: levelsToUpgrade > 1 
            ? `${buildingDefForNotification?.name}'s ${upgradeDef.name} upgraded from Lvl ${initialLevel} to Lvl ${finalTargetLevel} (x${actualLevelsUpgraded} levels)!`
            : `${buildingDefForNotification?.name}'s ${upgradeDef.name} upgraded to Lvl ${finalTargetLevel}!`, 
          type: 'success', 
          iconName: NOTIFICATION_ICONS.success, 
          timestamp: Date.now() 
      };
      
      return {
        ...state,
        resources: newResources,
        buildingSpecificUpgradeLevels: newBuildingSpecificUpgradeLevels,
        notifications: [...state.notifications, successNotification]
      };
    }
    default:
      return state;
  }
};
