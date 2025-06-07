
import { GameState, GameAction, GlobalBonuses, Cost, GameNotification, ResourceType, GameContextType, ActiveDemoniconChallenge, BattleHero, EnemyDefinition, BattleState, BuildingLevelUpEventInBattle, PlayerHeroState } from './../types';
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
  
  if (action.type === 'SET_PLAYER_MAP_NODE') { 
    return { ...state, playerCurrentNodeId: action.payload.nodeId };
  }
  if (action.type === 'REVEAL_MAP_NODES_STATIC') {
    const newRevealedIds = Array.from(new Set([...state.revealedMapNodeIds, ...action.payload.nodeIds]));
    if (newRevealedIds.length > state.revealedMapNodeIds.length) {
        return { ...state, revealedMapNodeIds: newRevealedIds };
    }
    return state;
  }
  if (action.type === 'SET_CURRENT_MAP') {
    const { mapId } = action.payload;
    const newMapDef = staticData.worldMapDefinitions[mapId];
    if (!newMapDef) {
      console.error(`Map definition not found for ID: ${mapId}`);
      return state;
    }
    const entryNode = newMapDef.nodes.find(node => node.id === newMapDef.entryNodeId);
    if (!entryNode) {
        console.error(`Entry node ${newMapDef.entryNodeId} not found in map ${mapId}`);
        return state;
    }
    const newRevealedMapNodeIds = [entryNode.id, ...entryNode.connections];
    return {
        ...state,
        currentMapId: mapId,
        playerCurrentNodeId: newMapDef.entryNodeId,
        revealedMapNodeIds: newRevealedMapNodeIds,
    };
  }
  if (action.type === 'COLLECT_MAP_RESOURCE') {
    const { nodeId, mapId } = action.payload;
    const mapDef = staticData.worldMapDefinitions[mapId];
    if (!mapDef) return state;
    const node = mapDef.nodes.find(n => n.id === nodeId);
    if (!node || node.poiType !== 'RESOURCE' || !node.resourceType || !node.resourceAmount) return state;

    const newResources = { ...state.resources };
    newResources[node.resourceType] = (newResources[node.resourceType] || 0) + node.resourceAmount;
    
    const newNotifications = [...state.notifications, {
        id: Date.now().toString(),
        message: `Collected ${formatNumber(node.resourceAmount)} ${node.resourceType.replace(/_/g, ' ')} from ${node.name}.`,
        type: 'success',
        iconName: ICONS[node.resourceType] ? node.resourceType : NOTIFICATION_ICONS.success,
        timestamp: Date.now()
    } as GameNotification];

    // Future: Add cooldown logic here if needed
    return { ...state, resources: newResources, notifications: newNotifications };
  }
  if (action.type === 'SET_MAP_POI_COMPLETED') { 
    return {
      ...state,
      mapPoiCompletionStatus: {
        ...state.mapPoiCompletionStatus,
        [action.payload.poiKey]: true,
      },
    };
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
    nextState = demoniconReducer(state, action, globalBonuses, staticData);
  }
  else if (action.type === 'START_BATTLE_PREPARATION') {
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
      return state; 
    }
    
    if (originalBattleState.sourceMapNodeId && action.payload.outcome === 'VICTORY') {
        let poiKeyToComplete: string | null = null;
        let unlockNotificationMessage: string | null = null;
        
        if (originalBattleState.sourceMapNodeId === 'lumber_mill_battle' && !state.mapPoiCompletionStatus['lumber_mill_blueprint_obtained']) {
            poiKeyToComplete = 'lumber_mill_blueprint_obtained';
            unlockNotificationMessage = 'Lumber Mill blueprints acquired! You can now build it in town.';
        } else if (originalBattleState.sourceMapNodeId === 'farm_battle' && !state.mapPoiCompletionStatus['farm_blueprint_obtained']) {
            poiKeyToComplete = 'farm_blueprint_obtained';
            unlockNotificationMessage = 'Farm plans discovered! You can now build it in town.';
        } else if (originalBattleState.sourceMapNodeId === 'gold_mine_access_battle' && !state.mapPoiCompletionStatus['damaged_gold_mine_access_granted']) { // Updated from gold_mine_approach
            poiKeyToComplete = 'damaged_gold_mine_access_granted';
            unlockNotificationMessage = 'The path to the Damaged Gold Mine is clear!';
        } else if (originalBattleState.sourceMapNodeId === 'tannery_guardians' && !state.mapPoiCompletionStatus['tannery_blueprint_obtained']) {
            poiKeyToComplete = 'tannery_blueprint_obtained';
            unlockNotificationMessage = 'Tannery Blueprints secured! Available for construction.';
        } else if (originalBattleState.sourceMapNodeId === 'deep_woods_encounter' && !state.mapPoiCompletionStatus['cleric_recruitment_unlocked']) {
            poiKeyToComplete = 'cleric_recruitment_unlocked';
            unlockNotificationMessage = 'A Cleric, impressed by your valor, offers their aid! Cleric recruitment now available.';
        } else if (originalBattleState.sourceMapNodeId === 'stone_quarry_guards' && !state.mapPoiCompletionStatus['stone_quarry_blueprint_obtained']) {
            poiKeyToComplete = 'stone_quarry_blueprint_obtained';
            unlockNotificationMessage = 'Stone Quarry Blueprints obtained! You can now build it.';
        }


        if (poiKeyToComplete && unlockNotificationMessage) {
            nextState = {
                ...nextState,
                mapPoiCompletionStatus: { ...nextState.mapPoiCompletionStatus, [poiKeyToComplete]: true },
                notifications: [...nextState.notifications, { id: Date.now().toString(), message: unlockNotificationMessage, type: 'success', iconName: ICONS.UPGRADE ? 'UPGRADE' : NOTIFICATION_ICONS.success, timestamp: Date.now() }]
            };
        }
    }


    if (originalBattleState.isDemoniconBattle) {
      nextState = demoniconReducer(state, action as any, globalBonuses, staticData); 
    } else if (originalBattleState.isDungeonGridBattle) {
      nextState = dungeonBattleFlowReducer(state, { type: 'END_DUNGEON_GRID_BATTLE_RESULT', payload: { outcome: action.payload.outcome, battleStateFromEnd: originalBattleState } }, globalBonuses);
    } else if (originalBattleState.isDungeonBattle) { 
      nextState = handleDungeonActions(state, { type: 'END_DUNGEON_FLOOR', payload: { outcome: action.payload.outcome, collectedLoot: action.payload.collectedLoot, collectedExp: action.payload.expRewardToHeroes, buildingLevelUps: originalBattleState.buildingLevelUpEventsInBattle } }, globalBonuses);

    } else { // Normal Wave Battle (or a map battle that's not dungeon/demonicon)
      nextState = waveBattleFlowReducer(nextState, { type: 'END_WAVE_BATTLE_RESULT', payload: { outcome: action.payload.outcome, battleStateFromEnd: originalBattleState } }, globalBonuses);
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
      if(state.battleState){
        if (action.type === 'SELECT_POTION_FOR_USAGE' && state.battleState) {
             nextState = { ...state, battleState: { ...state.battleState, activePotionIdForUsage: action.payload.potionId }};
        } else if (action.type === 'USE_POTION_ON_HERO' && state.battleState && state.battleState.activePotionIdForUsage) {
             const potionId = state.battleState.activePotionIdForUsage;
             const potionDef = staticData.potionDefinitions[potionId];
             if (!potionDef || (state.potions[potionId] || 0) <= 0) {
                return { ...state, battleState: { ...state.battleState, activePotionIdForUsage: null }, notifications: [...state.notifications, { id: Date.now().toString(), message: "Invalid potion or out of stock.", type: "warning", iconName: NOTIFICATION_ICONS.warning, timestamp: Date.now() }] };
            }
            const heroIndex = state.battleState.heroes.findIndex(h => h.uniqueBattleId === action.payload.targetHeroUniqueBattleId);
            if (heroIndex === -1 || state.battleState.heroes[heroIndex].currentHp <= 0) {
                return { ...state, notifications: [...state.notifications, { id: Date.now().toString(), message: "Cannot use potion on invalid or defeated target.", type: "warning", iconName: NOTIFICATION_ICONS.warning, timestamp: Date.now() }] };
            }
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
    action.type === 'START_DUNGEON_RUN' || 
    action.type === 'END_DUNGEON_FLOOR' || 
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
