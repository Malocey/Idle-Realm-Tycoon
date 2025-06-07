
import { GameState, GameAction, GlobalBonuses, Cost, GameNotification, RunBuffDefinition } from '../types';
import { RUN_BUFF_DEFINITIONS } from '../gameData/index';
import { NOTIFICATION_ICONS } from '../constants';
import { canAfford, formatNumber } from '../utils';

export const handleLibraryActions = (
    state: GameState,
    action: Extract<GameAction, { type: 'UNLOCK_RUN_BUFF' | 'UPGRADE_RUN_BUFF_LIBRARY' }>,
    globalBonuses: GlobalBonuses // Passed for consistency, not used directly here yet
): GameState => {
  switch (action.type) {
    case 'UNLOCK_RUN_BUFF': {
      const { buffId } = action.payload;
      const buffDef = RUN_BUFF_DEFINITIONS[buffId];
      if (!buffDef) {
        console.warn(`RunBuffDefinition not found for ID: ${buffId}`);
        return state;
      }

      if (state.unlockedRunBuffs.includes(buffId)) {
        const newNotification: GameNotification = { id: Date.now().toString(), message: `${buffDef.name} is already unlocked.`, type: 'info', iconName: NOTIFICATION_ICONS.info, timestamp: Date.now() };
        return { ...state, notifications: [...state.notifications, newNotification] };
      }

      const unlockCost = buffDef.unlockCost || [];
      if (!canAfford(state.resources, unlockCost)) {
        const newNotification: GameNotification = { id: Date.now().toString(), message: `Not enough resources to unlock ${buffDef.name}.`, type: 'error', iconName: NOTIFICATION_ICONS.error, timestamp: Date.now() };
        return { ...state, notifications: [...state.notifications, newNotification] };
      }

      const newResources = { ...state.resources };
      unlockCost.forEach(c => newResources[c.resource] -= c.amount);

      const newUnlockedRunBuffs = [...state.unlockedRunBuffs, buffId];
      const successNotification: GameNotification = { id: Date.now().toString(), message: `Unlocked Run Buff: ${buffDef.name}!`, type: 'success', iconName: buffDef.iconName, timestamp: Date.now() };
      
      return {
        ...state,
        resources: newResources,
        unlockedRunBuffs: newUnlockedRunBuffs,
        notifications: [...state.notifications, successNotification]
      };
    }
    case 'UPGRADE_RUN_BUFF_LIBRARY': {
      const { buffId, levelsToUpgrade = 1, totalBatchCost } = action.payload;
      const buffDef = RUN_BUFF_DEFINITIONS[buffId];
      if (!buffDef) {
        console.warn(`RunBuffDefinition not found for ID: ${buffId}`);
        return state;
      }

      if (!state.unlockedRunBuffs.includes(buffId)) {
        const newNotification: GameNotification = { id: Date.now().toString(), message: `${buffDef.name} is not unlocked yet.`, type: 'warning', iconName: NOTIFICATION_ICONS.warning, timestamp: Date.now() };
        return { ...state, notifications: [...state.notifications, newNotification] };
      }

      const initialLevel = state.runBuffLibraryLevels[buffId] || 0;

      if (buffDef.maxLibraryUpgradeLevel === undefined || (buffDef.maxLibraryUpgradeLevel !== -1 && initialLevel >= buffDef.maxLibraryUpgradeLevel)) {
        const newNotification: GameNotification = { id: Date.now().toString(), message: `${buffDef.name} is at max library level.`, type: 'info', iconName: NOTIFICATION_ICONS.info, timestamp: Date.now() };
        return { ...state, notifications: [...state.notifications, newNotification] };
      }
      if (levelsToUpgrade <=0) return state;
      
      if (!buffDef.libraryUpgradeCostPerLevel) {
        const newNotification: GameNotification = { id: Date.now().toString(), message: `${buffDef.name} cannot be upgraded in the library.`, type: 'info', iconName: NOTIFICATION_ICONS.info, timestamp: Date.now() };
        return { ...state, notifications: [...state.notifications, newNotification] };
      }

      let finalTargetLevel = initialLevel + levelsToUpgrade;
      if (buffDef.maxLibraryUpgradeLevel !== -1 && buffDef.maxLibraryUpgradeLevel !== undefined && finalTargetLevel > buffDef.maxLibraryUpgradeLevel) {
          finalTargetLevel = buffDef.maxLibraryUpgradeLevel;
      }
      const actualLevelsUpgraded = finalTargetLevel - initialLevel;
       if (actualLevelsUpgraded <= 0) {
          const newNotification: GameNotification = { id: Date.now().toString(), message: `${buffDef.name} is already at max library level or no upgrade possible.`, type: 'info', iconName: NOTIFICATION_ICONS.info, timestamp: Date.now() };
          return { ...state, notifications: [...state.notifications, newNotification]};
      }

      let costForUpgrade: Cost[];
      if (levelsToUpgrade > 1 && totalBatchCost) {
          costForUpgrade = totalBatchCost;
      } else {
          costForUpgrade = buffDef.libraryUpgradeCostPerLevel(initialLevel);
      }


      if (!canAfford(state.resources, costForUpgrade)) {
        const newNotification: GameNotification = { id: Date.now().toString(), message: `Not enough resources to upgrade ${buffDef.name} in library.`, type: 'error', iconName: NOTIFICATION_ICONS.error, timestamp: Date.now() };
        return { ...state, notifications: [...state.notifications, newNotification] };
      }

      const newResources = { ...state.resources };
      costForUpgrade.forEach(c => newResources[c.resource] -= c.amount);

      const newLibraryLevels = {
        ...state.runBuffLibraryLevels,
        [buffId]: finalTargetLevel,
      };
      const successNotification: GameNotification = { 
        id: Date.now().toString(), 
        message: levelsToUpgrade > 1
            ? `${buffDef.name} upgraded from Library Lvl ${initialLevel} to Lvl ${finalTargetLevel} (x${actualLevelsUpgraded} levels)!`
            : `${buffDef.name} upgraded to Library Level ${finalTargetLevel}!`,
        type: 'success', 
        iconName: buffDef.iconName, 
        timestamp: Date.now() 
      };

      return {
        ...state,
        resources: newResources,
        runBuffLibraryLevels: newLibraryLevels,
        notifications: [...state.notifications, successNotification]
      };
    }
    default:
      return state;
  }
};
