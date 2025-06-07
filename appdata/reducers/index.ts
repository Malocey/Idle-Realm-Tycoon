
import { GameState, GameAction, GlobalBonuses, Cost, GameNotification, ResourceType, GameContextType, ActiveDemoniconChallenge, BattleHero, EnemyDefinition, BattleState, BuildingLevelUpEventInBattle } from './../types';
import { calculateGlobalBonusesFromAllSources, formatNumber, canAfford, calculateGoldMinePlayerStats, calculateDemoniconEnemyStats as calculateDemoniconEnemyStatsUtil, getExpToNextHeroLevel, calculateHeroStats as calculateHeroStatsUtil } from './../utils';
import { HERO_DEFINITIONS, ENEMY_DEFINITIONS as ALL_ENEMY_DEFINITIONS, TOWN_HALL_UPGRADE_DEFINITIONS, BUILDING_SPECIFIC_UPGRADE_DEFINITIONS, GUILD_HALL_UPGRADE_DEFINITIONS, GOLD_MINE_UPGRADE_DEFINITIONS, SKILL_TREES, EQUIPMENT_DEFINITIONS, RUN_BUFF_DEFINITIONS, STATUS_EFFECT_DEFINITIONS, SPECIAL_ATTACK_DEFINITIONS, BUILDING_DEFINITIONS, SHARD_DEFINITIONS, WAVE_DEFINITIONS } from '../gameData/index';
import { NOTIFICATION_ICONS, INITIAL_GOLD_MINE_PLAYER_STATS, GAME_TICK_MS, DEFAULT_ENERGY_SHIELD_RECHARGE_DELAY_TICKS, MAX_WAVE_NUMBER } from '../constants';

// Modular reducer imports
import { handleProcessTick } from './tickReducer';
import { handleMiscActions } from './miscReducer';
import { handleBuildingActions } from './buildingReducer';
import { handleBuildingSpecificUpgradeActions } from './buildingSpecificUpgradeReducer';
import { handleTownHallActions } from './townHallReducer';
import { handleGuildHallUpgradeActions } from './guildHallUpgradeReducer';
import { handleCraftingActions } from './craftingReducer';
import { handleHeroActions } from './heroReducer';
import { handleShardActions } from './shardReducer';
// BattleActions are now delegated from here.
import { handleCombatTick } from './combat/index';
import { handleDungeonActions } from './dungeonReducer';
import { questReducer } from './questReducer';
import { handleLibraryActions } from './libraryReducer';
import { stoneQuarryMinigameReducer } from './stoneQuarryMinigameReducer';
import { actionBattleReducer } from './actionBattleReducer';
import { handleSharedSkillsActions } from './sharedSkillsReducer';
import { goldMineMinigameReducer } from './minigame/goldMine/goldMineMinigameReducer';
import { ICONS } from '../components/Icons';
import { demoniconReducer } from './demoniconReducer';
import { waveBattleFlowReducer } from './battleFlow/waveBattleFlowReducer';
import { dungeonBattleFlowReducer } from './battleFlow/dungeonBattleFlowReducer';

export const createGameReducer = (staticData: GameContextType['staticData']) =>
  (state: GameState, action: GameAction): GameState => {
  const globalBonuses: GlobalBonuses = calculateGlobalBonusesFromAllSources(state, staticData.townHallUpgradeDefinitions, staticData.buildingSpecificUpgradeDefinitions, staticData.guildHallUpgradeDefinitions);
  let nextState = state;
  
  const originalBattleState: BattleState | null = state.battleState ? JSON.parse(JSON.stringify(state.battleState)) : null;


  // Tick Verarbeitung
  if (action.type === 'PROCESS_TICK') {
    let tickResult = handleProcessTick(state, action, globalBonuses);
    if (tickResult.stoneQuarryMinigame && tickResult.stoneQuarryMinigame.gridInitialized) {
        tickResult = stoneQuarryMinigameReducer(tickResult, { type: 'STONE_QUARRY_MINIGAME_TICK' } as any, globalBonuses);
    }
    if (tickResult.activeView === 'GOLD_MINE_MINIGAME' && tickResult.goldMineMinigame && tickResult.goldMineMinigame.status === 'MINING_IN_PROGRESS') {
        tickResult = goldMineMinigameReducer(tickResult, { type: 'GOLD_MINE_MINIGAME_TICK' } as any, globalBonuses);
    }
    return { ...state, ...tickResult };
  }

  if (action.type === 'GOLD_MINE_MINIGAME_PURCHASE_UPGRADE') {
    const { upgradeId } = action.payload;
    if (state.goldMineMinigame) {
      const upgradeDef = GOLD_MINE_UPGRADE_DEFINITIONS[upgradeId];
      const currentLevel = state.goldMineMinigame.permanentUpgradeLevels[upgradeId] || 0;
      if (upgradeDef && (upgradeDef.maxLevel === -1 || currentLevel < upgradeDef.maxLevel)) {
        const cost = upgradeDef.cost(currentLevel);
        if (canAfford(state.resources, cost)) {
          const newResources = { ...state.resources };
          cost.forEach(c => newResources[c.resource] = (newResources[c.resource] || 0) - c.amount);
          nextState = { ...state, resources: newResources };
          return goldMineMinigameReducer(nextState, action, globalBonuses);
        } else {
          const newNotification: GameNotification = { id: Date.now().toString(), message: `Not enough resources to improve ${upgradeDef.name}.`, type: 'error', iconName: NOTIFICATION_ICONS.error, timestamp: Date.now() };
          return { ...state, notifications: [...state.notifications, newNotification]};
        }
      }
    }
  }

  if (action.type === 'CONSTRUCT_BUILDING' || action.type === 'UPGRADE_BUILDING') {
    nextState = handleBuildingActions(state, action, globalBonuses);
  }
  else if (action.type === 'UPGRADE_BUILDING_SPECIFIC_UPGRADE') {
    nextState = handleBuildingSpecificUpgradeActions(state, action, globalBonuses);
  }
  else if (action.type === 'UPGRADE_GUILD_HALL_UPGRADE') {
    nextState = handleGuildHallUpgradeActions(state, action, globalBonuses);
  }
  else if (
    action.type === 'RECRUIT_HERO' ||
    action.type === 'UPGRADE_SKILL' ||
    action.type === 'LEARN_UPGRADE_SPECIAL_ATTACK' ||
    action.type === 'UPGRADE_HERO_EQUIPMENT' ||
    action.type === 'APPLY_PERMANENT_HERO_BUFF' ||
    action.type === 'TRANSFER_SHARD' ||
    action.type === 'CHEAT_MODIFY_FIRST_HERO_STATS'
  ) {
    nextState = handleHeroActions(state, action as any, globalBonuses);
  }
  else if (action.type === 'FUSE_SHARDS' || action.type === 'ANIMATION_ACK_FUSED_SHARD' || action.type === 'FUSE_ALL_MATCHING_SHARDS_FOR_HERO') {
    nextState = handleShardActions(state, action as any, globalBonuses);
  }
  else if (action.type === 'UNLOCK_RUN_BUFF' || action.type === 'UPGRADE_RUN_BUFF_LIBRARY') {
    nextState = handleLibraryActions(state, action, globalBonuses);
  }
  else if (action.type === 'START_DEMONICON_CHALLENGE' || action.type === 'PROCESS_DEMONICON_VICTORY_REWARDS' || action.type === 'CONTINUE_DEMONICON_CHALLENGE' || action.type === 'CLEANUP_DEMONICON_STATE') {
    // START_DEMONICON_CHALLENGE is handled by demoniconReducer, which sets up battleState.
    // The others are also internal demonicon flow.
    nextState = demoniconReducer(state, action, globalBonuses, staticData);
  }
  else if (action.type === 'START_BATTLE_PREPARATION') {
    // Dispatch to waveBattleFlowReducer for normal wave battles
    // Demonicon start is handled by START_DEMONICON_CHALLENGE in demoniconReducer
    // Dungeon grid battle start is handled within gridInteraction.
    // This specific action is now primarily for initiating regular wave battles.
    nextState = waveBattleFlowReducer(state, { type: 'START_WAVE_BATTLE_PREPARATION', payload: action.payload }, globalBonuses);
    if (action.payload.isAutoProgression && action.payload.previousBattleOutcomeForQuestProcessing) {
        const questProgressAction: GameAction = {
            type: 'PROCESS_QUEST_PROGRESS_FROM_BATTLE',
            payload: action.payload.previousBattleOutcomeForQuestProcessing
        };
        nextState = questReducer(nextState, questProgressAction);
    }
  }
  else if (action.type === 'END_BATTLE') {
    if (!originalBattleState) {
      return state; // No battle to end
    }
    if (originalBattleState.isDemoniconBattle) {
      nextState = demoniconReducer(state, action as any, globalBonuses, staticData); // demoniconReducer handles its own END_BATTLE logic internally
    } else if (originalBattleState.isDungeonGridBattle) {
      // A battle from a dungeon grid cell has ended.
      nextState = dungeonBattleFlowReducer(state, { type: 'END_DUNGEON_GRID_BATTLE_RESULT', payload: { outcome: action.payload.outcome, battleStateFromEnd: originalBattleState } }, globalBonuses);
    } else if (originalBattleState.isDungeonBattle) {
      // This is for a non-grid dungeon battle (e.g., scripted boss, might not exist yet, or END_DUNGEON_FLOOR handles it)
      // For now, treat as END_DUNGEON_FLOOR or delegate to a specific dungeon flow if it exists.
      // This case might need more specific handling if dungeon battles differ significantly from grid encounters' end.
      // Assuming END_DUNGEON_FLOOR is the primary way these conclude.
      // If END_BATTLE is called for a generic dungeon battle, it means the floor is over.
      nextState = handleDungeonActions(state, { type: 'END_DUNGEON_FLOOR', payload: { outcome: action.payload.outcome, collectedLoot: action.payload.collectedLoot, collectedExp: action.payload.expRewardToHeroes, buildingLevelUps: originalBattleState.buildingLevelUpEventsInBattle } }, globalBonuses);

    } else { // Normal Wave Battle
      nextState = waveBattleFlowReducer(state, { type: 'END_WAVE_BATTLE_RESULT', payload: { outcome: action.payload.outcome, battleStateFromEnd: originalBattleState } }, globalBonuses);
       // Quest processing for wave battles
      const lootForQuests: Cost[] = [];
      (action.payload.collectedLoot || []).forEach(loot => {
          const existing = lootForQuests.find(l => l.resource === loot.resource);
          if (existing) existing.amount += loot.amount; else lootForQuests.push({...loot});
      });
      if (action.payload.outcome === 'VICTORY') {
        (action.payload.waveClearBonus || []).forEach(loot => { 
            const existing = lootForQuests.find(l => l.resource === loot.resource);
            if (existing) existing.amount += loot.amount; else lootForQuests.push({...loot});
        });
      }
      const defeatedEnemyOriginalIds = Object.values(originalBattleState.defeatedEnemiesWithLoot || {})
                                         .map(data => data.originalEnemyId)
                                         .filter(id => !!id);
      const waveNumberReached = action.payload.outcome === 'VICTORY' ? originalBattleState.waveNumber : undefined;
      const questProgressAction: GameAction = {
          type: 'PROCESS_QUEST_PROGRESS_FROM_BATTLE',
          payload: { lootCollected: lootForQuests, defeatedEnemyOriginalIds, waveNumberReached }
      };
      nextState = questReducer(nextState, questProgressAction);
    }
  }
  else if (action.type === 'SELECT_POTION_FOR_USAGE' || action.type === 'USE_POTION_ON_HERO') {
      if(state.battleState){ // Potions are only relevant if a battle is active
        // This part was already implicitly handled by the battleReducer logic for wave battles
        // Ensure this is passed to the correct battle flow if needed, or keep general logic here.
        // For simplicity, let's assume `handleBattleActions` was a placeholder and the logic
        // for potion usage during a battle tick is handled by the respective battle processor.
        // If these actions modify `battleState` directly, they should be part of the flow reducers.
        // For now, assuming battle processors handle potion effects based on `activePotionIdForUsage`.
        // If this is an action that *modifies* state before a tick (e.g., setting activePotionIdForUsage),
        // it could be here.
        if (action.type === 'SELECT_POTION_FOR_USAGE' && state.battleState) {
             nextState = { ...state, battleState: { ...state.battleState, activePotionIdForUsage: action.payload.potionId }};
        } else if (action.type === 'USE_POTION_ON_HERO' && state.battleState && state.battleState.activePotionIdForUsage) {
            // The actual effect application happens in the battle tick logic.
            // This action might just log or confirm. For now, let a tick handle it.
            // Or, if immediate, it needs access to hero stats and potion defs.
             const potionId = state.battleState.activePotionIdForUsage;
             const potionDef = staticData.potionDefinitions[potionId];
             if (!potionDef || (state.potions[potionId] || 0) <= 0) {
                return { ...state, battleState: { ...state.battleState, activePotionIdForUsage: null }, notifications: [...state.notifications, { id: Date.now().toString(), message: "Invalid potion or out of stock.", type: "warning", iconName: NOTIFICATION_ICONS.warning, timestamp: Date.now() }] };
            }
            const heroIndex = state.battleState.heroes.findIndex(h => h.uniqueBattleId === action.payload.targetHeroUniqueBattleId);
            if (heroIndex === -1 || state.battleState.heroes[heroIndex].currentHp <= 0) {
                return { ...state, notifications: [...state.notifications, { id: Date.now().toString(), message: "Cannot use potion on invalid or defeated target.", type: "warning", iconName: NOTIFICATION_ICONS.warning, timestamp: Date.now() }] };
            }
            // Actual effect should be in tick or a dedicated potion effect processor.
            // For now, just consume the potion.
            const newPotions = { ...state.potions };
            newPotions[potionId] = (newPotions[potionId] || 1) - 1;
            const hero = state.battleState.heroes[heroIndex];
            nextState = { ...state, potions: newPotions, battleState: { ...state.battleState, activePotionIdForUsage: null }, notifications: [...state.notifications, {id:Date.now().toString(), message:`Used ${potionDef.name} on ${hero.name}.`, type:'info', iconName:potionDef.iconName, timestamp:Date.now()}] };
        }
      }
  }
  else if (action.type === 'SET_BATTLE_TARGET') {
    if (state.battleState) {
        nextState = {
            ...state,
            battleState: {
                ...state.battleState,
                selectedTargetId: action.payload.targetId,
            },
        };
    }
  }
  else if (action.type === 'CHEAT_ADD_RUN_XP') {
    const cheatNotification: GameNotification = { id: Date.now().toString(), message: "Cheat: Adding 1000 Run XP.", type: 'info', iconName: NOTIFICATION_ICONS.info, timestamp: Date.now() };
    const tempStateWithNotification = { ...state, notifications: [...state.notifications, cheatNotification] };
    nextState = handleDungeonActions(tempStateWithNotification, { type: 'GAIN_RUN_XP', payload: { amount: 1000 } }, globalBonuses);
  }
  else if (
    action.type === 'START_DUNGEON_RUN' || // START_DUNGEON_RUN is now a distinct setup action
    action.type === 'END_DUNGEON_FLOOR' || // END_DUNGEON_FLOOR handles end of a floor (incl. battle from grid)
    action.type === 'END_DUNGEON_RUN' ||
    action.type === 'START_DUNGEON_EXPLORATION' ||
    action.type === 'MOVE_PARTY_ON_GRID' ||
    action.type === 'UPDATE_GRID_CELL' ||
    action.type === 'EXIT_DUNGEON_EXPLORATION' ||
    action.type === 'GAIN_RUN_XP' ||
    action.type === 'PRESENT_RUN_BUFF_CHOICES' ||
    action.type === 'APPLY_CHOSEN_RUN_BUFF'
    ) {
    nextState = handleDungeonActions(state, action, globalBonuses);
  }
  else if (action.type === 'BATTLE_ACTION') {
    return handleCombatTick(state, action, globalBonuses, staticData);
  }
  else if (action.type === 'UPGRADE_TOWN_HALL_GLOBAL_UPGRADE') {
    nextState = handleTownHallActions(state, action, globalBonuses);
  }
  else if (action.type === 'CRAFT_ITEM' || action.type === 'ADD_POTION_TO_QUEUE') {
    nextState = handleCraftingActions(state, action, globalBonuses);
  }
  else if (action.type === 'GENERATE_NEW_QUESTS' || action.type === 'CLAIM_QUEST_REWARD' || action.type === 'PROCESS_QUEST_PROGRESS_FROM_BATTLE') {
    nextState = questReducer(state, action);
  }
  else if (
    action.type === 'STONE_QUARRY_MINIGAME_INIT' ||
    action.type === 'STONE_QUARRY_MINIGAME_CLICK_CELL' ||
    action.type === 'STONE_QUARRY_MINIGAME_PURCHASE_UPGRADE' ||
    action.type === 'STONE_QUARRY_MINIGAME_CRAFT_GOLEM' ||
    action.type === 'STONE_QUARRY_MINIGAME_CRAFT_CLAY_GOLEM' ||
    action.type === 'STONE_QUARRY_MINIGAME_CRAFT_SAND_GOLEM' ||
    action.type === 'STONE_QUARRY_MINIGAME_CRAFT_CRYSTAL_GOLEM' ||
    action.type === 'STONE_QUARRY_MINIGAME_UPGRADE_GOLEM'
  ) {
    nextState = stoneQuarryMinigameReducer(state, action as any, globalBonuses);
  }
  else if (
    action.type === 'GOLD_MINE_MINIGAME_INIT' ||
    action.type === 'GOLD_MINE_MINIGAME_START_RUN' ||
    action.type === 'GOLD_MINE_MINIGAME_MINE_CELL' ||
    action.type === 'GOLD_MINE_MINIGAME_MOVE_PLAYER' ||
    action.type === 'GOLD_MINE_MINIGAME_RETURN_TO_SURFACE' ||
    action.type === 'GOLD_MINE_MINIGAME_TICK'
  ) {
    nextState = goldMineMinigameReducer(state, action as any, globalBonuses);
  }
  else if (
    action.type === 'START_ACTION_BATTLE' ||
    action.type === 'ACTION_BATTLE_TICK' ||
    action.type === 'END_ACTION_BATTLE' ||
    action.type === 'COLOSSEUM_SPAWN_NEXT_WAVE' ||
    action.type === 'COLOSSEUM_WAVE_CLEARED' ||
    action.type === 'COLOSSEUM_ENEMY_TAKE_DAMAGE' ||
    action.type === 'COLOSSEUM_HERO_TAKE_DAMAGE' ||
    action.type === 'ACTION_BATTLE_SET_KEY_PRESSED' ||
    action.type === 'ACTION_BATTLE_TOGGLE_AUTO_MODE' ||
    action.type === 'ACTION_BATTLE_HERO_USE_SPECIAL'
  ) {
    nextState = actionBattleReducer(state, action, globalBonuses);
  }
  else if (action.type === 'UPGRADE_SHARED_SKILL_MAJOR' || action.type === 'UPGRADE_SHARED_SKILL_MINOR') {
    nextState = handleSharedSkillsActions(state, action, globalBonuses);
  }
  else if (
    action.type === 'SET_ACTIVE_VIEW' ||
    action.type === 'ADD_NOTIFICATION' ||
    action.type === 'DISMISS_NOTIFICATION' ||
    action.type === 'CHEAT_ADD_RESOURCES' ||
    action.type === 'SET_GAME_SPEED' ||
    action.type === 'CHEAT_UNLOCK_ALL_WAVES' ||
    action.type === 'CHEAT_REVEAL_DUNGEON_FLOOR' ||
    action.type === 'CHEAT_ADD_SPECIFIC_RUN_BUFF' ||
    action.type === 'CHEAT_UNLOCK_MAX_ALL_RUN_BUFFS' ||
    action.type === 'CHEAT_FORCE_BATTLE_VICTORY' ||
    action.type === 'CHEAT_TOGGLE_GOD_MODE' ||
    action.type === 'TOGGLE_ACTION_BATTLE_AI_SYSTEM'
  ) {
    nextState = handleMiscActions(state, action as any);
  }
  else {
    return state;
  }

  // Enemy defeat tracking for Demonicon (applies after all other logic for the tick)
  if (originalBattleState && originalBattleState.defeatedEnemiesWithLoot) {
    let updatedDefeatedEnemyTypes = [...nextState.defeatedEnemyTypes];
    let updatedDemoniconRanks = { ...nextState.demoniconHighestRankCompleted };
    let changed = false;
    Object.values(originalBattleState.defeatedEnemiesWithLoot).forEach(defeatedData => {
      const enemyId = defeatedData.originalEnemyId;
      if (enemyId && ALL_ENEMY_DEFINITIONS[enemyId] && !updatedDefeatedEnemyTypes.includes(enemyId)) {
        updatedDefeatedEnemyTypes.push(enemyId);
        if (updatedDemoniconRanks[enemyId] === undefined) {
          updatedDemoniconRanks[enemyId] = -1;
        }
        changed = true;
      }
    });
    if (changed) {
      nextState = { ...nextState, defeatedEnemyTypes: updatedDefeatedEnemyTypes, demoniconHighestRankCompleted: updatedDemoniconRanks };
    }
  }
  return nextState;
};
