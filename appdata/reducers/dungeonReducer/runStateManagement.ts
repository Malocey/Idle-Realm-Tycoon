
import { GameState, GameAction, DungeonRunState, GlobalBonuses, GameNotification, ResourceType, ActiveView } from '../../types';
import { DUNGEON_DEFINITIONS, HERO_DEFINITIONS, SKILL_TREES, EQUIPMENT_DEFINITIONS, TOWN_HALL_UPGRADE_DEFINITIONS, GUILD_HALL_UPGRADE_DEFINITIONS, SHARD_DEFINITIONS, RUN_BUFF_DEFINITIONS } from '../../gameData/index';
import { ICONS } from '../../components/Icons';
import { NOTIFICATION_ICONS } from '../../constants';
import { canAfford, calculateHeroStats, calculateRunExpToNextLevel, formatNumber } from '../../utils';

export const handleRunStateActions = (
    state: GameState,
    action: Extract<GameAction, { type: 'START_DUNGEON_RUN' | 'END_DUNGEON_RUN' | 'EXIT_DUNGEON_EXPLORATION' | 'GAIN_RUN_XP' | 'APPLY_CHOSEN_RUN_BUFF' | 'PRESENT_RUN_BUFF_CHOICES' }>,
    globalBonuses: GlobalBonuses
): GameState => {
  switch (action.type) {
    case 'START_DUNGEON_RUN': {
        const { dungeonId } = action.payload;
        const dungeonDef = DUNGEON_DEFINITIONS[dungeonId];
        if (!dungeonDef) return state;

        if (!canAfford(state.resources, dungeonDef.entryCost)) {
            return { ...state, notifications: [...state.notifications, {id: Date.now().toString(), message: `Not enough resources to enter ${dungeonDef.name}`, type: 'error', iconName: NOTIFICATION_ICONS.error, timestamp: Date.now()}]};
        }
        const newResources = { ...state.resources };
        dungeonDef.entryCost.forEach(c => newResources[c.resource] = (newResources[c.resource] || 0) - c.amount);

        const heroStatesAtFloorStart: DungeonRunState['heroStatesAtFloorStart'] = {};
        state.heroes.forEach(h => {
            const heroDef = HERO_DEFINITIONS[h.definitionId];
            const skillTree = SKILL_TREES[heroDef.skillTreeId];
            const calculatedStats = calculateHeroStats(h, heroDef, skillTree, state, TOWN_HALL_UPGRADE_DEFINITIONS, GUILD_HALL_UPGRADE_DEFINITIONS, EQUIPMENT_DEFINITIONS, globalBonuses, SHARD_DEFINITIONS, RUN_BUFF_DEFINITIONS);
            const initialCooldowns: Record<string, number> = {};
            Object.keys(h.specialAttackLevels).forEach(saId => { if(h.specialAttackLevels[saId] > 0) initialCooldowns[saId] = 0; });
            heroStatesAtFloorStart[h.definitionId] = {
                level: h.level,
                currentExp: h.currentExp,
                expToNextLevel: h.expToNextLevel,
                skillPoints: h.skillPoints,
                currentHp: calculatedStats.maxHp,
                currentMana: calculatedStats.maxMana || 0,
                maxHp: calculatedStats.maxHp,
                maxMana: calculatedStats.maxMana || 0,
                specialAttackCooldownsRemaining: initialCooldowns
            };
        });

        const newActiveDungeonRun: DungeonRunState = {
            dungeonDefinitionId: dungeonId,
            currentFloorIndex: 0, 
            heroStatesAtFloorStart,
            survivingHeroIds: state.heroes.map(h => h.definitionId),
            runXP: 0,
            runLevel: 1,
            expToNextRunLevel: calculateRunExpToNextLevel(1),
            activeRunBuffs: [],
            offeredBuffChoices: null,
        };
        return { ...state, resources: newResources, activeDungeonRun: newActiveDungeonRun };
    }
    case 'END_DUNGEON_RUN': {
        let notifications = [...state.notifications];
        let updatedHeroes = [...state.heroes];

        if (state.activeDungeonRun) {
           // Hero progression (XP, levels, skill points) should have been updated via END_DUNGEON_FLOOR
           // and reflected in state.heroes. This action primarily cleans up the run.
        }

        if (action.payload.outcome === 'SUCCESS') {
            notifications.push({id: Date.now().toString(), message: `Dungeon Run Completed!`, type: 'success', iconName: ICONS.CHECK_CIRCLE ? 'CHECK_CIRCLE' : undefined, timestamp: Date.now()});
        } else {
             notifications.push({id: Date.now().toString(), message: `Dungeon Run Failed.`, type: 'error', iconName: ICONS.X_CIRCLE ? 'X_CIRCLE' : undefined, timestamp: Date.now()});
        }
        return { ...state, heroes: updatedHeroes, activeDungeonRun: null, activeDungeonGrid: null, battleState: null, activeView: ActiveView.TOWN, notifications };
    }
    case 'EXIT_DUNGEON_EXPLORATION': {
        const notifications = [...state.notifications];
        if (action.payload.outcome === 'ABANDONED') {
            notifications.push({id: Date.now().toString(), message: "Dungeon run abandoned.", type: 'warning', iconName: NOTIFICATION_ICONS.warning, timestamp: Date.now()});
        }
        return { ...state, activeView: ActiveView.TOWN, activeDungeonGrid: null, activeDungeonRun: null, battleState: null, notifications };
    }
    case 'GAIN_RUN_XP': { 
      if (!state.activeDungeonRun) return state;
      
      let nextActiveDungeonRun = { ...state.activeDungeonRun }; 
      nextActiveDungeonRun.runXP = nextActiveDungeonRun.runXP + action.payload.amount;
      
      let notifications = [...state.notifications];
      if (action.payload.amount > 0) { 
        notifications.push({ id: Date.now().toString() + "-runXPGainActual", message: `Gained ${formatNumber(action.payload.amount)} Run XP.`, type: 'info', iconName: ICONS.XP_ICON ? 'XP_ICON' : undefined, timestamp: Date.now() });
      }
      
      while (nextActiveDungeonRun.runXP >= nextActiveDungeonRun.expToNextRunLevel) {
        nextActiveDungeonRun.runLevel++;
        nextActiveDungeonRun.runXP -= nextActiveDungeonRun.expToNextRunLevel;
        nextActiveDungeonRun.expToNextRunLevel = calculateRunExpToNextLevel(nextActiveDungeonRun.runLevel);
        notifications.push({ id: Date.now().toString() + "-runLevelUpCombined", message: `Run Level Up! Reached Level ${nextActiveDungeonRun.runLevel}. Choose a buff!`, type: 'success', iconName: ICONS.UPGRADE ? 'UPGRADE' : undefined, timestamp: Date.now() });
        
        const numChoices = (DUNGEON_DEFINITIONS[nextActiveDungeonRun.dungeonDefinitionId]?.finalReward.permanentBuffChoices || 3) + globalBonuses.dungeonBuffChoicesBonus;
        const availableBuffs = Object.values(RUN_BUFF_DEFINITIONS).filter(buff => state.unlockedRunBuffs.includes(buff.id));
        const chosenBuffIds: string[] = [];
        if(availableBuffs.length > 0){
            for (let i = 0; i < numChoices && availableBuffs.length > 0; i++) {
                const randomIndex = Math.floor(Math.random() * availableBuffs.length);
                chosenBuffIds.push(availableBuffs.splice(randomIndex, 1)[0].id);
            }
        }
        nextActiveDungeonRun.offeredBuffChoices = chosenBuffIds.length > 0 ? chosenBuffIds : null;
      }
      return { ...state, activeDungeonRun: nextActiveDungeonRun, notifications };
    }
    case 'APPLY_CHOSEN_RUN_BUFF': {
        if (!state.activeDungeonRun || !state.activeDungeonRun.offeredBuffChoices) return state;
        const buffId = action.payload.buffId;
        const buffDef = RUN_BUFF_DEFINITIONS[buffId];
        if (!buffDef) return state;

        let nextActiveDungeonRun = { ...state.activeDungeonRun }; 
        let updatedActiveBuffs = [...nextActiveDungeonRun.activeRunBuffs]; 

        const existingBuffIndex = updatedActiveBuffs.findIndex(b => b.definitionId === buffId);
        if (existingBuffIndex !== -1) {
            const existingBuff = updatedActiveBuffs[existingBuffIndex];
            if ((buffDef.maxStacks || 1) > existingBuff.stacks) {
                updatedActiveBuffs[existingBuffIndex] = { ...existingBuff, stacks: existingBuff.stacks + 1 };
            }
        } else {
            updatedActiveBuffs.push({ definitionId: buffId, stacks: 1 });
        }
        
        nextActiveDungeonRun.activeRunBuffs = updatedActiveBuffs;
        nextActiveDungeonRun.offeredBuffChoices = null; 

        return { 
            ...state, 
            activeDungeonRun: nextActiveDungeonRun, 
            notifications: [...state.notifications, {id:Date.now().toString(), message:`Gained Buff: ${buffDef.name}!`, type:'success', iconName:buffDef.iconName, timestamp:Date.now()}]
        };
    }
    case 'PRESENT_RUN_BUFF_CHOICES': { 
        if (!state.activeDungeonRun) return state;
        const { numChoices = 3, rarityFilter } = action.payload || {};
        
        const actualNumChoices = (DUNGEON_DEFINITIONS[state.activeDungeonRun.dungeonDefinitionId]?.finalReward.permanentBuffChoices || numChoices) + globalBonuses.dungeonBuffChoicesBonus;

        let availableBuffs = Object.values(RUN_BUFF_DEFINITIONS).filter(buff => state.unlockedRunBuffs.includes(buff.id));
        if (rarityFilter && rarityFilter.length > 0) {
            availableBuffs = availableBuffs.filter(b => rarityFilter.includes(b.rarity));
        }
        const chosenBuffIds: string[] = [];
        if(availableBuffs.length > 0){
            for (let i = 0; i < actualNumChoices && availableBuffs.length > 0; i++) {
                const randomIndex = Math.floor(Math.random() * availableBuffs.length);
                chosenBuffIds.push(availableBuffs.splice(randomIndex, 1)[0].id);
            }
        }
        return { ...state, activeDungeonRun: { ...state.activeDungeonRun, offeredBuffChoices: chosenBuffIds.length > 0 ? chosenBuffIds : null }};
    }
    default:
      return state;
  }
};
