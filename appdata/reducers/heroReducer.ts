
import { GameState, GameAction, PlayerHeroState, GameNotification, ResourceType, GlobalBonuses, Cost, MAX_POTION_SLOTS_PER_HERO } from '../types';
import { HERO_DEFINITIONS, SKILL_TREES, SPECIAL_ATTACK_DEFINITIONS, EQUIPMENT_DEFINITIONS, SHARD_DEFINITIONS } from '../gameData/index';
import { NOTIFICATION_ICONS } from '../constants';
import { canAfford, getExpToNextHeroLevel } from '../utils';
import { ICONS } from '../components/Icons';

// Helper function to generate a unique ID for new shards
const generateUniqueIdHero = () => `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;


export const handleHeroActions = (
    state: GameState,
    action: Extract<GameAction, { type: 'RECRUIT_HERO' | 'UNLOCK_HERO_DEFINITION' | 'UPGRADE_SKILL' | 'LEARN_UPGRADE_SPECIAL_ATTACK' | 'UPGRADE_HERO_EQUIPMENT' | 'APPLY_PERMANENT_HERO_BUFF' | 'TRANSFER_SHARD' | 'CHEAT_MODIFY_FIRST_HERO_STATS' | 'AWARD_SHARD_TO_HERO' | 'EQUIP_POTION_TO_SLOT' | 'UNEQUIP_POTION_FROM_SLOT' }>, 
    globalBonuses: GlobalBonuses
): GameState => {
  switch (action.type) {
    case 'RECRUIT_HERO': {
      const heroDef = HERO_DEFINITIONS[action.payload.heroId];
      if (!heroDef || state.heroes.find(h => h.definitionId === action.payload.heroId)) return state;

      if (heroDef.unlockWaveRequirement && heroDef.unlockWaveRequirement > state.currentWaveProgress && !state.unlockedHeroDefinitions.includes(heroDef.id)) {
        const newNotification: GameNotification = {id: Date.now().toString(), message: `${heroDef.name} unlocks after Wave ${heroDef.unlockWaveRequirement}.`, type: 'warning', iconName: NOTIFICATION_ICONS.warning, timestamp: Date.now()};
        return { ...state, notifications: [...state.notifications, newNotification]};
      }
      if (!state.unlockedHeroDefinitions.includes(heroDef.id) && !(heroDef.unlockWaveRequirement && heroDef.unlockWaveRequirement <= state.currentWaveProgress) ) {
         const newNotification: GameNotification = {id: Date.now().toString(), message: `${heroDef.name} is not yet unlocked.`, type: 'warning', iconName: NOTIFICATION_ICONS.warning, timestamp: Date.now()};
         return { ...state, notifications: [...state.notifications, newNotification]};
      }


      let recruitmentCost = heroDef.recruitmentCost ? [...heroDef.recruitmentCost] : [];
      if (recruitmentCost.length > 0 && globalBonuses.heroRecruitmentCostReduction > 0) {
        recruitmentCost = recruitmentCost.map(cost => ({
            ...cost,
            amount: Math.max(1, Math.floor(cost.amount * (1 - globalBonuses.heroRecruitmentCostReduction)))
        }));
      }

      if (recruitmentCost.length > 0 && !canAfford(state.resources, recruitmentCost)) {
         const newNotification: GameNotification = {id: Date.now().toString(), message: `Not enough resources to recruit ${heroDef.name}!`, type: 'error', iconName: NOTIFICATION_ICONS.error, timestamp: Date.now()};
         return { ...state, notifications: [...state.notifications, newNotification]};
      }
      const newResources = { ...state.resources };
      recruitmentCost.forEach(c => newResources[c.resource] -= c.amount);
      const newHero: PlayerHeroState = { 
          definitionId: heroDef.id, 
          level: 1, currentExp: 0, 
          expToNextLevel: getExpToNextHeroLevel(1), 
          skillPoints: 1, skillLevels: {}, 
          specialAttackLevels: {}, 
          equipmentLevels: {}, 
          permanentBuffs: [], 
          ownedShards: [], 
          potionSlots: Array(MAX_POTION_SLOTS_PER_HERO).fill(null),
          appliedPermanentStats: {},
      };
      const successNotification: GameNotification = {id: Date.now().toString(), message: `${heroDef.name} recruited!`, type: 'success', iconName: NOTIFICATION_ICONS.success, timestamp: Date.now()};
      return { ...state, resources: newResources, heroes: [...state.heroes, newHero], notifications: [...state.notifications, successNotification] };
    }
    case 'UNLOCK_HERO_DEFINITION': {
        const { heroId } = action.payload;
        if (!state.unlockedHeroDefinitions.includes(heroId)) {
            return {
                ...state,
                unlockedHeroDefinitions: [...state.unlockedHeroDefinitions, heroId]
            };
        }
        return state;
    }
    case 'UPGRADE_SKILL': {
      const { heroDefinitionId, skillId, levelsToUpgrade = 1, totalBatchCost } = action.payload;
      const heroIndex = state.heroes.findIndex(h => h.definitionId === heroDefinitionId);
      if (heroIndex === -1) return state;

      const hero = state.heroes[heroIndex];
      const heroDef = HERO_DEFINITIONS[hero.definitionId];
      const skillTree = SKILL_TREES[heroDef.skillTreeId];
      const skillDef = skillTree?.nodes.find(s => s.id === skillId);

      if (!skillDef || skillDef.specialAttackId) return state;
      
      const initialLevel = hero.skillLevels[skillId] || 0;
      if (skillDef.maxLevel !== -1 && initialLevel >= skillDef.maxLevel) return state;
      if (levelsToUpgrade <=0) return state;


      let finalTargetLevel = initialLevel + levelsToUpgrade;
      if (skillDef.maxLevel !== -1 && finalTargetLevel > skillDef.maxLevel) {
        finalTargetLevel = skillDef.maxLevel;
      }
      const actualLevelsUpgraded = finalTargetLevel - initialLevel;
      if (actualLevelsUpgraded <= 0) {
         const newNotification: GameNotification = { id: Date.now().toString(), message: `${skillDef.name} is already at max level or no upgrade possible.`, type: 'info', iconName: NOTIFICATION_ICONS.info, timestamp: Date.now() };
         return { ...state, notifications: [...state.notifications, newNotification]};
      }
      
      for (const prereq of skillDef.prerequisites) {
        if ((hero.skillLevels[prereq.skillId] || 0) < prereq.level) {
          const prereqSkillDef = skillTree?.nodes.find(s => s.id === prereq.skillId);
          const newNotification: GameNotification = {id: Date.now().toString(), message: `Requires ${prereqSkillDef?.name || prereq.skillId} Lvl ${prereq.level}!`, type: 'warning', iconName: NOTIFICATION_ICONS.warning, timestamp: Date.now()};
          return {...state, notifications: [...state.notifications, newNotification]};
        }
      }

      let finalCostForUpgrade: { skillPoints: number; resources: Cost[]; heroicPointsCost: number } = { skillPoints: 0, resources: [], heroicPointsCost: 0 };

      if (levelsToUpgrade > 1 && totalBatchCost) { 
        totalBatchCost.forEach(cost => {
            if (cost.resource === 'SKILL_POINTS_TEMP' as any) finalCostForUpgrade.skillPoints += cost.amount;
            else if (cost.resource === ResourceType.HEROIC_POINTS) finalCostForUpgrade.heroicPointsCost += cost.amount;
            else finalCostForUpgrade.resources.push(cost);
        });
      } else { 
        const singleCostInfo = skillDef.costPerLevel(initialLevel);
        finalCostForUpgrade.skillPoints = singleCostInfo.skillPoints || 0;
        finalCostForUpgrade.heroicPointsCost = singleCostInfo.heroicPointsCost || 0;
        finalCostForUpgrade.resources = singleCostInfo.resources || [];
      }


      if (finalCostForUpgrade.skillPoints > 0 && hero.skillPoints < finalCostForUpgrade.skillPoints) {
        const newNotification: GameNotification = {id: Date.now().toString(), message: 'Not enough skill points!', type: 'error', iconName: NOTIFICATION_ICONS.error, timestamp: Date.now()};
        return { ...state, notifications: [...state.notifications, newNotification]};
      }
      if (finalCostForUpgrade.resources.length > 0 && !canAfford(state.resources, finalCostForUpgrade.resources)) {
        const newNotification: GameNotification = {id: Date.now().toString(), message: 'Not enough resources for skill!', type: 'error', iconName: NOTIFICATION_ICONS.error, timestamp: Date.now()};
        return { ...state, notifications: [...state.notifications, newNotification]};
      }
      if (finalCostForUpgrade.heroicPointsCost > 0 && state.resources[ResourceType.HEROIC_POINTS] < finalCostForUpgrade.heroicPointsCost) {
        const newNotification: GameNotification = { id: Date.now().toString(), message: `Not enough Heroic Points for ${skillDef.name}!`, type: 'error', iconName: NOTIFICATION_ICONS.error, timestamp: Date.now() };
        return { ...state, notifications: [...state.notifications, newNotification] };
      }


      const newResources = { ...state.resources };
      if(finalCostForUpgrade.resources.length > 0) {
        finalCostForUpgrade.resources.forEach(c => newResources[c.resource] -= c.amount);
      }
      if (finalCostForUpgrade.heroicPointsCost > 0) {
        newResources[ResourceType.HEROIC_POINTS] -= finalCostForUpgrade.heroicPointsCost;
      }

      const updatedHeroes = [...state.heroes];
      updatedHeroes[heroIndex] = {
        ...hero,
        skillPoints: hero.skillPoints - finalCostForUpgrade.skillPoints,
        skillLevels: { ...hero.skillLevels, [skillId]: finalTargetLevel }
      };

      const successNotification: GameNotification = {
        id: Date.now().toString(), 
        message: levelsToUpgrade > 1
            ? `${heroDef.name}'s ${skillDef.name} upgraded from Lvl ${initialLevel} to Lvl ${finalTargetLevel} (x${actualLevelsUpgraded} levels)!`
            : `${heroDef.name}'s ${skillDef.name} Lvl ${finalTargetLevel}!`,
        type: 'success', 
        iconName: NOTIFICATION_ICONS.success, 
        timestamp: Date.now()
      };
      return { ...state, resources: newResources, heroes: updatedHeroes, notifications: [...state.notifications, successNotification] };
    }
     case 'LEARN_UPGRADE_SPECIAL_ATTACK': {
        const { heroDefinitionId, skillNodeId, levelsToUpgrade = 1, totalBatchCost } = action.payload;
        const heroIndex = state.heroes.findIndex(h => h.definitionId === heroDefinitionId);
        if (heroIndex === -1) return state;

        const hero = state.heroes[heroIndex];
        const heroDef = HERO_DEFINITIONS[hero.definitionId];
        const skillTree = SKILL_TREES[heroDef.skillTreeId];
        const skillNodeDef = skillTree?.nodes.find(s => s.id === skillNodeId);

        if (!skillNodeDef || !skillNodeDef.specialAttackId) return state;

        const specialAttackDef = SPECIAL_ATTACK_DEFINITIONS[skillNodeDef.specialAttackId];
        if (!specialAttackDef) return state;

        const initialLevel = hero.specialAttackLevels[skillNodeDef.specialAttackId] || 0;
        if (specialAttackDef.maxLevel !== -1 && initialLevel >= specialAttackDef.maxLevel) {
            const newNotification: GameNotification = { id: Date.now().toString(), message: `${specialAttackDef.name} is at max level.`, type: 'info', iconName: NOTIFICATION_ICONS.info, timestamp: Date.now() };
            return { ...state, notifications: [...state.notifications, newNotification] };
        }
        if (levelsToUpgrade <=0) return state;

        let finalTargetLevel = initialLevel + levelsToUpgrade;
        if (specialAttackDef.maxLevel !== -1 && finalTargetLevel > specialAttackDef.maxLevel) {
            finalTargetLevel = specialAttackDef.maxLevel;
        }
        const actualLevelsUpgraded = finalTargetLevel - initialLevel;
        if (actualLevelsUpgraded <= 0) {
             const newNotification: GameNotification = { id: Date.now().toString(), message: `${specialAttackDef.name} is already at max level or no upgrade possible.`, type: 'info', iconName: NOTIFICATION_ICONS.info, timestamp: Date.now() };
             return { ...state, notifications: [...state.notifications, newNotification]};
        }


        for (const prereq of skillNodeDef.prerequisites) {
            if ((hero.skillLevels[prereq.skillId] || 0) < prereq.level) {
                const prereqSkillDef = skillTree?.nodes.find(s => s.id === prereq.skillId);
                const newNotification: GameNotification = { id: Date.now().toString(), message: `Requires ${prereqSkillDef?.name || prereq.skillId} Lvl ${prereq.level}!`, type: 'warning', iconName: NOTIFICATION_ICONS.warning, timestamp: Date.now() };
                return { ...state, notifications: [...state.notifications, newNotification] };
            }
        }

        let finalCostForUpgrade: { skillPoints: number; resources: Cost[]; heroicPointsCost: number } = { skillPoints: 0, resources: [], heroicPointsCost: 0 };
        if (levelsToUpgrade > 1 && totalBatchCost) {
            totalBatchCost.forEach(cost => {
                if (cost.resource === 'SKILL_POINTS_TEMP' as any) finalCostForUpgrade.skillPoints += cost.amount;
                else if (cost.resource === ResourceType.HEROIC_POINTS) finalCostForUpgrade.heroicPointsCost += cost.amount;
                else finalCostForUpgrade.resources.push(cost);
            });
        } else {
            const singleCostInfo = skillNodeDef.costPerLevel(initialLevel);
            finalCostForUpgrade.skillPoints = singleCostInfo.skillPoints || 0;
            finalCostForUpgrade.heroicPointsCost = singleCostInfo.heroicPointsCost || 0;
            finalCostForUpgrade.resources = singleCostInfo.resources || [];
        }
        

        if (finalCostForUpgrade.skillPoints > 0 && hero.skillPoints < finalCostForUpgrade.skillPoints) {
            const newNotification: GameNotification = {id: Date.now().toString(), message: 'Not enough skill points for special attack!', type: 'error', iconName: NOTIFICATION_ICONS.error, timestamp: Date.now()};
            return { ...state, notifications: [...state.notifications, newNotification]};
        }
        if (finalCostForUpgrade.heroicPointsCost > 0 && state.resources[ResourceType.HEROIC_POINTS] < finalCostForUpgrade.heroicPointsCost) {
            const newNotification: GameNotification = { id: Date.now().toString(), message: `Not enough Heroic Points for ${specialAttackDef.name}!`, type: 'error', iconName: NOTIFICATION_ICONS.error, timestamp: Date.now() };
            return { ...state, notifications: [...state.notifications, newNotification] };
        }
        if (finalCostForUpgrade.resources.length > 0 && !canAfford(state.resources, finalCostForUpgrade.resources)) {
            const newNotification: GameNotification = {id: Date.now().toString(), message: 'Not enough other resources for special attack!', type: 'error', iconName: NOTIFICATION_ICONS.error, timestamp: Date.now()};
            return { ...state, notifications: [...state.notifications, newNotification]};
        }

        const newResources = { ...state.resources };
        if (finalCostForUpgrade.heroicPointsCost > 0) newResources[ResourceType.HEROIC_POINTS] -= finalCostForUpgrade.heroicPointsCost;
         if(finalCostForUpgrade.resources.length > 0) {
            finalCostForUpgrade.resources.forEach(c => newResources[c.resource] -= c.amount);
        }

        const updatedHeroes = [...state.heroes];
        updatedHeroes[heroIndex] = {
            ...hero,
            skillPoints: hero.skillPoints - finalCostForUpgrade.skillPoints,
            specialAttackLevels: {
                ...hero.specialAttackLevels,
                [skillNodeDef.specialAttackId]: finalTargetLevel,
            }
        };

        const successNotification: GameNotification = { 
            id: Date.now().toString(), 
            message: levelsToUpgrade > 1 
                ? `${heroDef.name}'s ${specialAttackDef.name} upgraded from Lvl ${initialLevel} to Lvl ${finalTargetLevel} (x${actualLevelsUpgraded} levels)!`
                : `${heroDef.name}'s ${specialAttackDef.name} upgraded to Lvl ${finalTargetLevel}!`,
            type: 'success', 
            iconName: NOTIFICATION_ICONS.success, 
            timestamp: Date.now() 
        };
        return { ...state, resources: newResources, heroes: updatedHeroes, notifications: [...state.notifications, successNotification] };
    }
    case 'UPGRADE_HERO_EQUIPMENT': {
        const { heroDefinitionId, equipmentId, levelsToUpgrade = 1, totalBatchCost } = action.payload;
        const heroIndex = state.heroes.findIndex(h => h.definitionId === heroDefinitionId);
        if (heroIndex === -1) return state;

        const hero = state.heroes[heroIndex];
        const equipDef = EQUIPMENT_DEFINITIONS[equipmentId];

        if (!equipDef || equipDef.heroDefinitionId !== heroDefinitionId) return state;

        const initialLevel = hero.equipmentLevels[equipmentId] || 0;
        if (equipDef.maxLevel !== -1 && initialLevel >= equipDef.maxLevel) {
            const newNotification: GameNotification = { id: Date.now().toString(), message: `${equipDef.name} is at max level.`, type: 'info', iconName: NOTIFICATION_ICONS.info, timestamp: Date.now() };
            return { ...state, notifications: [...state.notifications, newNotification] };
        }
        if (levelsToUpgrade <=0) return state;

        let finalTargetLevel = initialLevel + levelsToUpgrade;
        if (equipDef.maxLevel !== -1 && finalTargetLevel > equipDef.maxLevel) {
            finalTargetLevel = equipDef.maxLevel;
        }
        const actualLevelsUpgraded = finalTargetLevel - initialLevel;
        if (actualLevelsUpgraded <= 0) {
             const newNotification: GameNotification = { id: Date.now().toString(), message: `${equipDef.name} is already at max level or no upgrade possible.`, type: 'info', iconName: NOTIFICATION_ICONS.info, timestamp: Date.now() };
             return { ...state, notifications: [...state.notifications, newNotification]};
        }
        
        let costForUpgrade: Cost[];
        if (levelsToUpgrade > 1 && totalBatchCost) {
            costForUpgrade = totalBatchCost;
        } else {
            costForUpgrade = equipDef.costsPerLevel(initialLevel);
        }


        if (!canAfford(state.resources, costForUpgrade)) {
            const newNotification: GameNotification = { id: Date.now().toString(), message: `Not enough resources to upgrade ${equipDef.name}.`, type: 'error', iconName: NOTIFICATION_ICONS.error, timestamp: Date.now() };
            return { ...state, notifications: [...state.notifications, newNotification] };
        }

        const newResources = { ...state.resources };
        costForUpgrade.forEach(c => newResources[c.resource] -= c.amount);

        const updatedHeroes = [...state.heroes];
        updatedHeroes[heroIndex] = {
            ...hero,
            equipmentLevels: {
                ...hero.equipmentLevels,
                [equipmentId]: finalTargetLevel,
            }
        };
        const successNotification: GameNotification = { 
            id: Date.now().toString(), 
            message: levelsToUpgrade > 1
                ? `${HERO_DEFINITIONS[heroDefinitionId].name}'s ${equipDef.name} upgraded from Lvl ${initialLevel} to Lvl ${finalTargetLevel} (x${actualLevelsUpgraded} levels)!`
                : `${HERO_DEFINITIONS[heroDefinitionId].name}'s ${equipDef.name} upgraded to Lvl ${finalTargetLevel}!`,
            type: 'success', 
            iconName: NOTIFICATION_ICONS.success, 
            timestamp: Date.now() 
        };
        return { ...state, resources: newResources, heroes: updatedHeroes, notifications: [...state.notifications, successNotification] };
    }
    case 'APPLY_PERMANENT_HERO_BUFF': {
        const { heroDefinitionId, buff } = action.payload;
        const heroIndex = state.heroes.findIndex(h => h.definitionId === heroDefinitionId);
        if (heroIndex === -1) return state;

        const updatedHeroesArr = [...state.heroes];
        const heroToBuff = { ...updatedHeroesArr[heroIndex] };
        heroToBuff.permanentBuffs = [...(heroToBuff.permanentBuffs || []), buff];
        updatedHeroesArr[heroIndex] = heroToBuff;

        return {
            ...state,
            heroes: updatedHeroesArr,
            notifications: [...state.notifications, {id: Date.now().toString(), message: `${HERO_DEFINITIONS[heroDefinitionId].name} gained permanent buff: ${buff.description}`, type: 'success', iconName: NOTIFICATION_ICONS.success, timestamp: Date.now()}]
        };
    }
    case 'TRANSFER_SHARD': {
        const { sourceHeroId, targetHeroId, shardInstanceId } = action.payload;
        const sourceHeroIndex = state.heroes.findIndex(h => h.definitionId === sourceHeroId);
        const targetHeroIndex = state.heroes.findIndex(h => h.definitionId === targetHeroId);

        if (sourceHeroIndex === -1 || targetHeroIndex === -1 || sourceHeroId === targetHeroId) {
            console.warn("Invalid source or target hero for shard transfer.");
            return state;
        }

        const updatedHeroes = [...state.heroes];
        const sourceHero = { ...updatedHeroes[sourceHeroIndex] };
        const targetHero = { ...updatedHeroes[targetHeroIndex] };

        const shardToTransferIndex = (sourceHero.ownedShards || []).findIndex(s => s.instanceId === shardInstanceId);
        if (shardToTransferIndex === -1) {
            console.warn("Shard to transfer not found in source hero's inventory.");
            return state;
        }
        
        const shardToTransfer = sourceHero.ownedShards[shardToTransferIndex];

        sourceHero.ownedShards = [
            ...(sourceHero.ownedShards.slice(0, shardToTransferIndex)),
            ...(sourceHero.ownedShards.slice(shardToTransferIndex + 1))
        ];
        targetHero.ownedShards = [...(targetHero.ownedShards || []), shardToTransfer];

        updatedHeroes[sourceHeroIndex] = sourceHero;
        updatedHeroes[targetHeroIndex] = targetHero;

        const shardDef = SHARD_DEFINITIONS[shardToTransfer.definitionId];
        const sourceHeroDef = HERO_DEFINITIONS[sourceHeroId];
        const targetHeroDef = HERO_DEFINITIONS[targetHeroId];
        const transferNotification: GameNotification = {
            id: Date.now().toString(),
            message: `Transferred ${shardDef?.name || 'Shard'} Lvl ${shardToTransfer.level} from ${sourceHeroDef?.name} to ${targetHeroDef?.name}.`,
            type: 'info',
            iconName: ICONS.FUSION_ICON ? 'FUSION_ICON' : NOTIFICATION_ICONS.info, 
            timestamp: Date.now(),
        };

        return { ...state, heroes: updatedHeroes, notifications: [...state.notifications, transferNotification] };
    }
    case 'CHEAT_MODIFY_FIRST_HERO_STATS': {
        if (state.heroes.length === 0) {
          return { ...state, notifications: [...state.notifications, { id: Date.now().toString(), message: "Cheat: No heroes to modify.", type: 'warning', iconName: NOTIFICATION_ICONS.warning, timestamp: Date.now() }]};
        }
        const updatedHeroes = [...state.heroes];
        let heroToModify = { ...updatedHeroes[0] };
        const originalLevel = heroToModify.level;
        
        heroToModify.level += 1;
        heroToModify.skillPoints += 5;
        heroToModify.currentExp += 500;
  
        while (heroToModify.currentExp >= heroToModify.expToNextLevel) {
          heroToModify.currentExp -= heroToModify.expToNextLevel;
          heroToModify.level++;
          heroToModify.skillPoints++;
          heroToModify.expToNextLevel = getExpToNextHeroLevel(heroToModify.level);
        }
        updatedHeroes[0] = heroToModify;
        const heroDef = HERO_DEFINITIONS[heroToModify.definitionId];
        
        const levelsGained = heroToModify.level - originalLevel;
        const newSharedSkillPoints = state.playerSharedSkillPoints + levelsGained;


        return {
          ...state,
          heroes: updatedHeroes,
          playerSharedSkillPoints: newSharedSkillPoints,
          notifications: [...state.notifications, {id: Date.now().toString(), message: `Cheat: ${heroDef?.name || 'First Hero'} gained Lvl, SP, XP. +${levelsGained} Shared SP.`, type:'info', iconName: ICONS.HERO ? 'HERO' : undefined, timestamp: Date.now()}]
        };
    }
    case 'EQUIP_POTION_TO_SLOT': {
      const { heroId, potionId, slotIndex } = action.payload;
      const heroIndex = state.heroes.findIndex(h => h.definitionId === heroId);
      if (heroIndex === -1) return state;

      const updatedHeroes = [...state.heroes];
      const heroToUpdate = { ...updatedHeroes[heroIndex] };
      
      if (slotIndex >= 0 && slotIndex < MAX_POTION_SLOTS_PER_HERO) {
        if (!heroToUpdate.potionSlots || heroToUpdate.potionSlots.length !== MAX_POTION_SLOTS_PER_HERO) {
            heroToUpdate.potionSlots = Array(MAX_POTION_SLOTS_PER_HERO).fill(null);
        }
        heroToUpdate.potionSlots[slotIndex] = potionId;
        updatedHeroes[heroIndex] = heroToUpdate;
        return { ...state, heroes: updatedHeroes };
      }
      return state;
    }
    case 'UNEQUIP_POTION_FROM_SLOT': {
      const { heroId, slotIndex } = action.payload;
      const heroIndex = state.heroes.findIndex(h => h.definitionId === heroId);
      if (heroIndex === -1) return state;

      const updatedHeroes = [...state.heroes];
      const heroToUpdate = { ...updatedHeroes[heroIndex] };

      if (heroToUpdate.potionSlots && slotIndex >= 0 && slotIndex < heroToUpdate.potionSlots.length) {
        heroToUpdate.potionSlots[slotIndex] = null;
        updatedHeroes[heroIndex] = heroToUpdate;
        return { ...state, heroes: updatedHeroes };
      }
      return state;
    }
    default:
      return state;
  }
};