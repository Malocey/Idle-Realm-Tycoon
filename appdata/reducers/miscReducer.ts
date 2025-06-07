
import { GameState, GameAction, ResourceType, GameNotification, PlayerOwnedShard } from '../types';
import { NOTIFICATION_ICONS, MAX_WAVE_NUMBER } from '../constants';
import { ICONS } from '../components/Icons';
import { HERO_DEFINITIONS, SHARD_DEFINITIONS, RUN_BUFF_DEFINITIONS } from '../gameData/index';
import { getExpToNextHeroLevel } from '../utils'; 

const generateUniqueIdMisc = () => `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

const MAX_NOTIFICATIONS_IN_STATE = 15;


export const handleMiscActions = (
    state: GameState,
    action: Extract<GameAction, { type: 'SET_ACTIVE_VIEW' | 'ADD_NOTIFICATION' | 'DISMISS_NOTIFICATION' | 'CHEAT_ADD_RESOURCES' | 'SET_GAME_SPEED' | 'CHEAT_UNLOCK_ALL_WAVES' | 'CHEAT_REVEAL_DUNGEON_FLOOR' | 'CHEAT_ADD_SPECIFIC_RUN_BUFF' | 'CHEAT_UNLOCK_MAX_ALL_RUN_BUFFS' | 'CHEAT_FORCE_BATTLE_VICTORY' | 'CHEAT_TOGGLE_GOD_MODE' | 'TOGGLE_ACTION_BATTLE_AI_SYSTEM' }>
): GameState => {
  switch (action.type) {
    case 'SET_ACTIVE_VIEW':
      return { ...state, activeView: action.payload };
    case 'ADD_NOTIFICATION': {
      const newNotificationPayloadAdd = action.payload as Omit<GameNotification, 'id' | 'timestamp'>;
      const newNotificationAdd: GameNotification = {
          ...newNotificationPayloadAdd,
          id: Date.now().toString() + Math.random().toString(16).slice(2),
          timestamp: Date.now(),
          iconName: newNotificationPayloadAdd.iconName || NOTIFICATION_ICONS[newNotificationPayloadAdd.type]
      };
      let updatedNotifications = [...state.notifications, newNotificationAdd];
      if (updatedNotifications.length > MAX_NOTIFICATIONS_IN_STATE) {
        updatedNotifications = updatedNotifications.slice(updatedNotifications.length - MAX_NOTIFICATIONS_IN_STATE);
      }
      return { ...state, notifications: updatedNotifications };
    }
    case 'DISMISS_NOTIFICATION':
      return { ...state, notifications: state.notifications.filter(n => n.id !== action.payload) };
    case 'CHEAT_ADD_RESOURCES': {
      const newResourcesCheat = { ...state.resources };
      let updatedHeroes = [...state.heroes];
      let newNotifications: GameNotification[] = [...state.notifications]; // Ensure newNotifications is typed correctly from the start.
      let shardsSuccessfullyAdded = false;
      let heroNameToNotify = '';
      let addedShardsSummary = '';

      for (const key in action.payload) {
        if (key === 'debugAddShardsToFirstHero') {
            const shardsToAddPayload = (action.payload as any).debugAddShardsToFirstHero;
            if (shardsToAddPayload && Array.isArray(shardsToAddPayload) && shardsToAddPayload.length > 0 && updatedHeroes.length > 0) {
                const firstHeroIndex = 0;
                let targetHero = {...updatedHeroes[firstHeroIndex]};
                let heroShards = [...(targetHero.ownedShards || [])];
                let totalAddedCount = 0;

                const firstShardInfo = shardsToAddPayload[0];
                const firstShardDef = SHARD_DEFINITIONS[firstShardInfo.definitionId];

                shardsToAddPayload.forEach((shardInfo: {definitionId: string, level: number, count: number}) => {
                    for (let i = 0; i < shardInfo.count; i++) {
                        heroShards.push({
                            instanceId: generateUniqueIdMisc(),
                            definitionId: shardInfo.definitionId,
                            level: shardInfo.level,
                        });
                        totalAddedCount++;
                    }
                });
                targetHero.ownedShards = heroShards;
                updatedHeroes[firstHeroIndex] = targetHero;
                shardsSuccessfullyAdded = totalAddedCount > 0;

                if (shardsSuccessfullyAdded) {
                    const heroDef = HERO_DEFINITIONS[targetHero.definitionId];
                    heroNameToNotify = heroDef?.name || 'First Hero';
                    addedShardsSummary = `${totalAddedCount} Lvl ${firstShardInfo.level} ${firstShardDef?.name || 'shards'}`;
                    const shardAddSuccessNotification: GameNotification = {
                        id: Date.now().toString() + "-shardsAddedCheat",
                        message: `Cheat: Added ${addedShardsSummary} to ${heroNameToNotify}.`,
                        type: 'success',
                        iconName: ICONS.SHARD_ICON ? 'SHARD_ICON' : NOTIFICATION_ICONS.success,
                        timestamp: Date.now()
                    };
                    newNotifications.push(shardAddSuccessNotification);
                }
            }
        } else if (Object.values(ResourceType).includes(key as ResourceType)) {
          newResourcesCheat[key as ResourceType] = (newResourcesCheat[key as ResourceType] || 0) + ((action.payload as any)[key as ResourceType] || 0);
        }
      }

      if (action.payload.hasOwnProperty('debugAddShardsToFirstHero')) {
        if (!shardsSuccessfullyAdded && updatedHeroes.length === 0) {
             const shardFailNoHeroNotification: GameNotification = {
                  id: Date.now().toString() + "-shardsFailedNoHeroes",
                  message: `Cheat: Could not add shards. No heroes available.`,
                  type: 'warning',
                  iconName: NOTIFICATION_ICONS.warning,
                  timestamp: Date.now()
              };
             newNotifications.push(shardFailNoHeroNotification);
        } else if (!shardsSuccessfullyAdded) {
             const shardFailGenericNotification: GameNotification = {
                  id: Date.now().toString() + "-shardsFailedGeneric",
                  message: `Cheat: Failed to add shards (payload issue or no shards specified).`,
                  type: 'warning',
                  iconName: NOTIFICATION_ICONS.warning,
                  timestamp: Date.now()
              };
             newNotifications.push(shardFailGenericNotification);
        }
      }
      const resAddedNotification: GameNotification = {
        id: Date.now().toString() + "-resAddedCheat",
        message: "Cheat: Dev Resources Added.", type: 'info', iconName: NOTIFICATION_ICONS.info, timestamp: Date.now()
      };
      newNotifications.push(resAddedNotification);
      
      if (newNotifications.length > MAX_NOTIFICATIONS_IN_STATE) {
        newNotifications = newNotifications.slice(newNotifications.length - MAX_NOTIFICATIONS_IN_STATE);
      }
      return { ...state, resources: newResourcesCheat, heroes: updatedHeroes, notifications: newNotifications };
    }
    case 'CHEAT_UNLOCK_ALL_WAVES': {
      const allHeroIds = Object.keys(HERO_DEFINITIONS);
      const newUnlockedHeroDefinitions = Array.from(new Set([...state.unlockedHeroDefinitions, ...allHeroIds]));

      const unlockNotification: GameNotification = {
        id: Date.now().toString(),
        message: 'Cheat: All waves and heroes unlocked!',
        type: 'success',
        iconName: NOTIFICATION_ICONS.success,
        timestamp: Date.now(),
      };
      let updatedNotifications = [...state.notifications, unlockNotification];
      if (updatedNotifications.length > MAX_NOTIFICATIONS_IN_STATE) {
        updatedNotifications = updatedNotifications.slice(updatedNotifications.length - MAX_NOTIFICATIONS_IN_STATE);
      }
      return {
        ...state,
        currentWaveProgress: MAX_WAVE_NUMBER,
        unlockedHeroDefinitions: newUnlockedHeroDefinitions,
        notifications: updatedNotifications,
      };
    }
    case 'CHEAT_REVEAL_DUNGEON_FLOOR': {
      if (!state.activeDungeonGrid) {
        const noDungeonNotification: GameNotification = { id: Date.now().toString(), message: "Cheat: No active dungeon floor to reveal.", type: 'warning', iconName: NOTIFICATION_ICONS.warning, timestamp: Date.now() };
        let updatedNotifications = [...state.notifications, noDungeonNotification];
        if (updatedNotifications.length > MAX_NOTIFICATIONS_IN_STATE) {
            updatedNotifications = updatedNotifications.slice(updatedNotifications.length - MAX_NOTIFICATIONS_IN_STATE);
        }
        return { ...state, notifications: updatedNotifications };
      }
      const revealedGrid = state.activeDungeonGrid.grid.map(row =>
        row.map(cell => ({ ...cell, isRevealed: true }))
      );
      const revealNotification: GameNotification = { id: Date.now().toString(), message: "Cheat: Current dungeon floor revealed!", type: 'info', iconName: ICONS.COMPASS ? 'COMPASS' : undefined, timestamp: Date.now() };
      let updatedNotifications = [...state.notifications, revealNotification];
      if (updatedNotifications.length > MAX_NOTIFICATIONS_IN_STATE) {
        updatedNotifications = updatedNotifications.slice(updatedNotifications.length - MAX_NOTIFICATIONS_IN_STATE);
      }
      return {
        ...state,
        activeDungeonGrid: { ...state.activeDungeonGrid, grid: revealedGrid },
        notifications: updatedNotifications,
      };
    }
    case 'SET_GAME_SPEED': {
      const speedNotificationSet: GameNotification = {
          id: Date.now().toString(),
          message: `Game speed set to x${action.payload}`,
          type: 'info',
          iconName: ICONS.SETTINGS ? 'SETTINGS' : NOTIFICATION_ICONS.info,
          timestamp: Date.now()
      };
      let updatedNotifications = [...state.notifications, speedNotificationSet];
      if (updatedNotifications.length > MAX_NOTIFICATIONS_IN_STATE) {
        updatedNotifications = updatedNotifications.slice(updatedNotifications.length - MAX_NOTIFICATIONS_IN_STATE);
      }
      return {...state, gameSpeed: action.payload, notifications: updatedNotifications };
    }
    case 'CHEAT_ADD_SPECIFIC_RUN_BUFF': {
      if (!state.activeDungeonRun) {
        const noRunNotification: GameNotification = { id: Date.now().toString(), message: "Cheat: No active dungeon run to add buff to.", type: 'warning', iconName: NOTIFICATION_ICONS.warning, timestamp: Date.now() };
        let updatedNotifications = [...state.notifications, noRunNotification];
         if (updatedNotifications.length > MAX_NOTIFICATIONS_IN_STATE) {
            updatedNotifications = updatedNotifications.slice(updatedNotifications.length - MAX_NOTIFICATIONS_IN_STATE);
        }
        return { ...state, notifications: updatedNotifications};
      }
      const buffIdToAdd = 'RUN_BUFF_COMMON_ATTACK'; 
      const buffDef = RUN_BUFF_DEFINITIONS[buffIdToAdd];
      if (!buffDef) return state;

      let newActiveBuffs = [...state.activeDungeonRun.activeRunBuffs];
      const existingBuff = newActiveBuffs.find(b => b.definitionId === buffIdToAdd);
      if (existingBuff) {
        if (existingBuff.stacks < (buffDef.maxStacks || 1)) {
          existingBuff.stacks++;
        }
      } else {
        newActiveBuffs.push({ definitionId: buffIdToAdd, stacks: 1 });
      }
      const specificBuffNotification: GameNotification = {id: Date.now().toString(), message: `Cheat: Added ${buffDef.name} to run.`, type:'info', iconName: buffDef.iconName, timestamp: Date.now()};
      let updatedNotifications = [...state.notifications, specificBuffNotification];
      if (updatedNotifications.length > MAX_NOTIFICATIONS_IN_STATE) {
        updatedNotifications = updatedNotifications.slice(updatedNotifications.length - MAX_NOTIFICATIONS_IN_STATE);
      }
      return {
        ...state,
        activeDungeonRun: { ...state.activeDungeonRun, activeRunBuffs: newActiveBuffs },
        notifications: updatedNotifications,
      };
    }
    case 'CHEAT_UNLOCK_MAX_ALL_RUN_BUFFS': {
      const allBuffIds = Object.keys(RUN_BUFF_DEFINITIONS);
      const newUnlockedRunBuffs = Array.from(new Set([...state.unlockedRunBuffs, ...allBuffIds]));
      const newRunBuffLibraryLevels: Record<string, number> = { ...state.runBuffLibraryLevels };
      allBuffIds.forEach(buffId => {
        const def = RUN_BUFF_DEFINITIONS[buffId];
        if (def.maxLibraryUpgradeLevel && def.maxLibraryUpgradeLevel > 0) {
          newRunBuffLibraryLevels[buffId] = def.maxLibraryUpgradeLevel;
        }
      });
      const unlockMaxNotification: GameNotification = {id: Date.now().toString(), message: "Cheat: All Run Buffs unlocked and maxed in Library.", type:'success', iconName: ICONS.BOOK_ICON ? 'BOOK_ICON' : undefined, timestamp: Date.now()};
      let updatedNotifications = [...state.notifications, unlockMaxNotification];
       if (updatedNotifications.length > MAX_NOTIFICATIONS_IN_STATE) {
            updatedNotifications = updatedNotifications.slice(updatedNotifications.length - MAX_NOTIFICATIONS_IN_STATE);
        }
      return {
        ...state,
        unlockedRunBuffs: newUnlockedRunBuffs,
        runBuffLibraryLevels: newRunBuffLibraryLevels,
        notifications: updatedNotifications,
      };
    }
    case 'CHEAT_FORCE_BATTLE_VICTORY': {
      if (!state.battleState || state.battleState.status !== 'FIGHTING') {
        const noBattleNotification: GameNotification = { id: Date.now().toString(), message: "Cheat: No active battle to win.", type: 'warning', iconName: NOTIFICATION_ICONS.warning, timestamp: Date.now() };
        let updatedNotifications = [...state.notifications, noBattleNotification];
         if (updatedNotifications.length > MAX_NOTIFICATIONS_IN_STATE) {
            updatedNotifications = updatedNotifications.slice(updatedNotifications.length - MAX_NOTIFICATIONS_IN_STATE);
        }
        return { ...state, notifications: updatedNotifications };
      }
      const forceVictoryNotification: GameNotification = {id: Date.now().toString(), message: "Cheat: Current battle forced to VICTORY.", type:'info', iconName: ICONS.FIGHT ? 'FIGHT' : undefined, timestamp: Date.now()};
      let updatedNotifications = [...state.notifications, forceVictoryNotification];
       if (updatedNotifications.length > MAX_NOTIFICATIONS_IN_STATE) {
            updatedNotifications = updatedNotifications.slice(updatedNotifications.length - MAX_NOTIFICATIONS_IN_STATE);
        }
      return {
        ...state,
        battleState: { ...state.battleState, status: 'VICTORY' },
        notifications: updatedNotifications,
      };
    }
    case 'CHEAT_TOGGLE_GOD_MODE': {
      const newGodModeStatus = !state.godModeActive;
      const godModeNotification: GameNotification = {id: Date.now().toString(), message: `Cheat: God Mode ${newGodModeStatus ? 'ACTIVATED' : 'DEACTIVATED'}.`, type:'info', iconName: ICONS.SHIELD_BADGE ? 'SHIELD_BADGE' : undefined, timestamp: Date.now()};
      let updatedNotifications = [...state.notifications, godModeNotification];
      if (updatedNotifications.length > MAX_NOTIFICATIONS_IN_STATE) {
            updatedNotifications = updatedNotifications.slice(updatedNotifications.length - MAX_NOTIFICATIONS_IN_STATE);
      }
      return {
        ...state,
        godModeActive: newGodModeStatus,
        notifications: updatedNotifications,
      };
    }
    case 'TOGGLE_ACTION_BATTLE_AI_SYSTEM': {
      const newAISystem = state.actionBattleAISystem === 'legacy' ? 'behaviorTree' : 'legacy';
      const toggleAINotification: GameNotification = {
        id: Date.now().toString(),
        message: `Action Battle AI switched to: ${newAISystem === 'behaviorTree' ? 'Behavior Tree (New)' : 'Legacy'}`,
        type: 'info',
        iconName: ICONS.SETTINGS ? 'SETTINGS' : undefined,
        timestamp: Date.now(),
      };
       let updatedNotifications = [...state.notifications, toggleAINotification];
       if (updatedNotifications.length > MAX_NOTIFICATIONS_IN_STATE) {
            updatedNotifications = updatedNotifications.slice(updatedNotifications.length - MAX_NOTIFICATIONS_IN_STATE);
       }
      return {
        ...state,
        actionBattleAISystem: newAISystem,
        notifications: updatedNotifications,
      };
    }
    default:
      return state;
  }
};
