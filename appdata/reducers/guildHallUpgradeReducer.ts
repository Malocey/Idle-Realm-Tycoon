
import { GameState, GameAction, ResourceType, Cost, GameNotification, GlobalBonuses } from '../types';
import { GUILD_HALL_UPGRADE_DEFINITIONS, BUILDING_DEFINITIONS, HERO_DEFINITIONS } from '../gameData/index';
import { NOTIFICATION_ICONS } from '../constants';
import { canAfford, calculateGuildHallUpgradeCostValue, formatNumber } from '../utils';

export const handleGuildHallUpgradeActions = (
    state: GameState,
    action: Extract<GameAction, { type: 'UPGRADE_GUILD_HALL_UPGRADE' }>,
    globalBonuses: GlobalBonuses // Not directly used for cost calculation here, but good for consistency
): GameState => {
  switch (action.type) {
    case 'UPGRADE_GUILD_HALL_UPGRADE': {
        const { upgradeId, levelsToUpgrade = 1, totalBatchCost } = action.payload;
        const upgradeDef = GUILD_HALL_UPGRADE_DEFINITIONS[upgradeId];
        if (!upgradeDef) {
            console.warn(`Guild Hall upgrade definition ${upgradeId} not found.`);
            return state;
        }

        const guildHallBuilding = state.buildings.find(b => b.id === 'GUILD_HALL');
        if (!guildHallBuilding) {
            const newNotification: GameNotification = {id: Date.now().toString(), message: `Guild Hall not constructed.`, type: 'warning', iconName: NOTIFICATION_ICONS.warning, timestamp: Date.now()};
            return {...state, notifications: [...state.notifications, newNotification]};
        }

        const initialLevel = state.guildHallUpgradeLevels[upgradeId] || 0;
        if (upgradeDef.maxLevel !== -1 && initialLevel >= upgradeDef.maxLevel) {
            const newNotification: GameNotification = {id: Date.now().toString(), message: `${upgradeDef.name} is at max level.`, type: 'info', iconName: NOTIFICATION_ICONS.info, timestamp: Date.now()};
            return {...state, notifications: [...state.notifications, newNotification]};
        }
        if (levelsToUpgrade <=0) return state;


        // Check unlock requirements
        for (const req of upgradeDef.unlockRequirements) {
            if (req.guildHallLevel && guildHallBuilding.level < req.guildHallLevel) {
                const newNotification: GameNotification = {id: Date.now().toString(), message: `Requires Guild Hall Lvl ${req.guildHallLevel} for ${upgradeDef.name}.`, type: 'warning', iconName: NOTIFICATION_ICONS.warning, timestamp: Date.now()};
                return {...state, notifications: [...state.notifications, newNotification]};
            }
            if (req.heroRecruited && !state.heroes.find(h => h.definitionId === req.heroRecruited)) {
                const heroDef = HERO_DEFINITIONS[req.heroRecruited];
                const newNotification: GameNotification = {id: Date.now().toString(), message: `Requires ${heroDef?.name || req.heroRecruited} to be recruited for ${upgradeDef.name}.`, type: 'warning', iconName: NOTIFICATION_ICONS.warning, timestamp: Date.now()};
                return {...state, notifications: [...state.notifications, newNotification]};
            }
            if (req.otherGuildUpgradeId && req.otherGuildUpgradeLevel) {
                if ((state.guildHallUpgradeLevels[req.otherGuildUpgradeId] || 0) < req.otherGuildUpgradeLevel) {
                    const prereqGHUpgradeDef = GUILD_HALL_UPGRADE_DEFINITIONS[req.otherGuildUpgradeId];
                    const newNotification: GameNotification = {id: Date.now().toString(), message: `Requires ${prereqGHUpgradeDef?.name || req.otherGuildUpgradeId} Lvl ${req.otherGuildUpgradeLevel} for ${upgradeDef.name}.`, type: 'warning', iconName: NOTIFICATION_ICONS.warning, timestamp: Date.now()};
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
                amount: calculateGuildHallUpgradeCostValue(costDef, initialLevel + 1)
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

        costForUpgrade.forEach(c => {
             if (c.resource === ResourceType.TOWN_XP) {
                newTotalTownXp -= c.amount;
            } else {
                newResources[c.resource] = (newResources[c.resource] || 0) - c.amount; 
            }
        });

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
            guildHallUpgradeLevels: { ...state.guildHallUpgradeLevels, [upgradeId]: finalTargetLevel },
            notifications: [...state.notifications, successNotification]
        };
    }
    default:
      return state;
  }
};
