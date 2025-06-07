
import { GameState, GameAction, ResourceType, Cost, TownHallUpgradeUnlockRequirementType, GameNotification, GlobalBonuses } from '../types';
// FIX: Corrected import path for game data definitions
import { TOWN_HALL_UPGRADE_DEFINITIONS, BUILDING_DEFINITIONS } from '../gameData/index';
import { NOTIFICATION_ICONS } from '../constants';
import { formatNumber, calculateTownHallUpgradeCostValue } from '../utils'; // Removed unused canAfford import
import { canAfford } from '../utils'; // Added canAfford back as it's used

export const handleTownHallActions = (
    state: GameState, 
    action: Extract<GameAction, { type: 'UPGRADE_TOWN_HALL_GLOBAL_UPGRADE' }>,
    globalBonuses: GlobalBonuses // Not directly used here but good for consistency
): GameState => {
  switch (action.type) {
    case 'UPGRADE_TOWN_HALL_GLOBAL_UPGRADE': {
        const { upgradeId, levelsToUpgrade = 1, totalBatchCost } = action.payload;
        const upgradeDef = TOWN_HALL_UPGRADE_DEFINITIONS[upgradeId];
        if (!upgradeDef) return state;
        
        const initialLevel = state.townHallUpgradeLevels[upgradeId] || 0;

        if (upgradeDef.maxLevel !== -1 && initialLevel >= upgradeDef.maxLevel) {
            const newNotification: GameNotification = {id: Date.now().toString(), message: `${upgradeDef.name} is at max level.`, type: 'info', iconName: NOTIFICATION_ICONS.info, timestamp: Date.now()};
            return {...state, notifications: [...state.notifications, newNotification]};
        }
        if (levelsToUpgrade <=0) return state;

        for (const req of upgradeDef.unlockRequirements) {
            const params = req.unlockParams;
            if (params.type === TownHallUpgradeUnlockRequirementType.SpecificUpgradeLevel) {
                if ((state.townHallUpgradeLevels[params.upgradeId] || 0) < params.level) {
                    const prereqUpgradeDef = TOWN_HALL_UPGRADE_DEFINITIONS[params.upgradeId];
                    const newNotification: GameNotification = {id: Date.now().toString(), message: `Requires ${prereqUpgradeDef?.name || params.upgradeId} Lvl ${params.level}.`, type: 'warning', iconName: NOTIFICATION_ICONS.warning, timestamp: Date.now()};
                    return {...state, notifications: [...state.notifications, newNotification]};
                }
            } else if (params.type === TownHallUpgradeUnlockRequirementType.TotalResourceSpentOnPaths) {
                if (params.resource === ResourceType.GOLD && state.totalGoldSpentOnTownHallPaths < params.amount) {
                     const newNotification: GameNotification = {id: Date.now().toString(), message: `Requires ${formatNumber(params.amount)} total Gold spent on specific Town Hall upgrades.`, type: 'warning', iconName: NOTIFICATION_ICONS.warning, timestamp: Date.now()};
                     return {...state, notifications: [...state.notifications, newNotification]};
                }
            } else if (params.type === TownHallUpgradeUnlockRequirementType.BuildingLevel) {
                const building = state.buildings.find(b => b.id === params.buildingId);
                if (!building || building.level < params.level) {
                    const buildingDef = BUILDING_DEFINITIONS[params.buildingId]; 
                    const newNotification: GameNotification = {id: Date.now().toString(), message: `Requires ${buildingDef?.name || params.buildingId} Lvl ${params.level}.`, type: 'warning', iconName: NOTIFICATION_ICONS.warning, timestamp: Date.now()};
                    return {...state, notifications: [...state.notifications, newNotification]};
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
                amount: calculateTownHallUpgradeCostValue(costDef, initialLevel + 1)
            }));
        }

        const townXpCostItemReducer = costForUpgrade.find(c => c.resource === ResourceType.TOWN_XP);
        const otherResourceCostsReducer = costForUpgrade.filter(c => c.resource !== ResourceType.TOWN_XP);
        const canAffordTownXpReducer = townXpCostItemReducer ? state.totalTownXp >= townXpCostItemReducer.amount : true;
        const canAffordOthersReducer = canAfford(state.resources, otherResourceCostsReducer);

        if (!(canAffordTownXpReducer && canAffordOthersReducer)) {
            const newNotification: GameNotification = {id: Date.now().toString(), message: `Not enough resources for ${upgradeDef.name}.`, type: 'error', iconName: NOTIFICATION_ICONS.error, timestamp: Date.now()};
            return {...state, notifications: [...state.notifications, newNotification]};
        }
        
        const newResources = { ...state.resources };
        let newTotalTownXp = state.totalTownXp;
        let goldSpentThisUpgrade = 0;

        costForUpgrade.forEach(c => { 
            if (c.resource === ResourceType.TOWN_XP) {
                newTotalTownXp -= c.amount;
            } else {
                newResources[c.resource] = (newResources[c.resource] || 0) - c.amount; 
            }
            if (c.resource === ResourceType.GOLD) {
                goldSpentThisUpgrade += c.amount; 
            }
        });
        
        let newTotalGoldSpentOnTownHallPaths = state.totalGoldSpentOnTownHallPaths;
        const townHallBatch3Def = TOWN_HALL_UPGRADE_DEFINITIONS['TownHall_Batch3_GlobalEffect']; 
        let trackedPathsForGoldSpending: string[] | undefined = undefined;
        if (townHallBatch3Def?.unlockRequirements) {
            const goldSpendingRequirement = townHallBatch3Def.unlockRequirements.find(req => req.unlockParams.type === 'TotalResourceSpentOnPaths' && req.unlockParams.resource === ResourceType.GOLD);
            if (goldSpendingRequirement && goldSpendingRequirement.unlockParams.type === 'TotalResourceSpentOnPaths') {
                trackedPathsForGoldSpending = goldSpendingRequirement.unlockParams.onUpgradePaths;
            }
        }
        if (trackedPathsForGoldSpending?.includes(upgradeId) && goldSpentThisUpgrade > 0) {
            newTotalGoldSpentOnTownHallPaths += goldSpentThisUpgrade;
        }

        const successNotification: GameNotification = {
            id: Date.now().toString(), 
            message: levelsToUpgrade > 1
                ? `${upgradeDef.name} upgraded from Lvl ${initialLevel} to Lvl ${finalTargetLevel} (x${actualLevelsUpgraded} levels)!`
                : `${upgradeDef.name} upgraded to Lvl ${finalTargetLevel}!`, 
            type: 'success', 
            iconName: NOTIFICATION_ICONS.success, 
            timestamp: Date.now()
        };

        return { 
            ...state, 
            resources: newResources, 
            totalTownXp: newTotalTownXp,
            townHallUpgradeLevels: { ...state.townHallUpgradeLevels, [upgradeId]: finalTargetLevel }, 
            totalGoldSpentOnTownHallPaths: newTotalGoldSpentOnTownHallPaths, 
            notifications: [...state.notifications, successNotification] 
        };
    }
    default:
      return state;
  }
};
