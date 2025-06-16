
import { ResourceType, CellType, RunBuffRarity } from './enums';
import { Cost, GameNotification } from './common';
import { PermanentHeroBuff, PlayerHeroState, HeroStats } from './hero'; // Moved HeroStats here
import { BuildingLevelUpEventInBattle, BattleHero, BattleState } from './battle';
import { MinigameUpgradeType } from './minigame';
import { ResonanceMoteType } from './aethericResonanceTypes'; // Corrected import for ResonanceMoteType

export type GameAction =
  | { type: 'PROCESS_TICK' }
  | { type: 'SET_ACTIVE_VIEW'; payload: 'TOWN' | 'BATTLEFIELD' | 'DUNGEON_REWARD' | 'HERO_ACADEMY' | 'DUNGEON_EXPLORE' | 'STONE_QUARRY_MINIGAME' | 'ACTION_BATTLE_VIEW' | 'SHARED_SKILL_TREE' | 'GOLD_MINE_MINIGAME' | 'DEMONICON_PORTAL' | 'WORLD_MAP' }
  | { type: 'CONSTRUCT_BUILDING'; payload: { buildingId: string } }
  | { type: 'UPGRADE_BUILDING'; payload: { buildingId: string; levelsToUpgrade?: number; totalBatchCost?: Cost[] } }
  | { type: 'RECRUIT_HERO'; payload: { heroId: string } }
  | { type: 'UNLOCK_HERO_DEFINITION'; payload: { heroId: string } }
  | { type: 'UPGRADE_SKILL'; payload: { heroDefinitionId: string; skillId: string; levelsToUpgrade?: number; totalBatchCost?: Cost[] } }
  | { type: 'LEARN_UPGRADE_SPECIAL_ATTACK'; payload: { heroDefinitionId: string; skillNodeId: string; levelsToUpgrade?: number; totalBatchCost?: Cost[] } }
  | { type: 'UPGRADE_HERO_EQUIPMENT'; payload: { heroDefinitionId: string; equipmentId: string; levelsToUpgrade?: number; totalBatchCost?: Cost[] } }
  | { type: 'AWARD_SHARD_TO_HERO'; payload: { heroDefinitionId: string; shardDefinitionId: string; shardLevel: number; } }
  | { type: 'START_BATTLE_PREPARATION'; payload: {
        waveNumber: number;
        isAutoProgression?: boolean;
        persistedHeroHp?: Record<string, number>;
        persistedHeroMana?: Record<string, number>;
        persistedHeroSpecialCooldowns?: Record<string, Record<string, number>>;
        rewardsForPreviousWave?: Cost[];
        expFromPreviousWave?: number;
        previousWaveNumberCleared?: number;
        buildingLevelUpEventsFromPreviousWave?: BuildingLevelUpEventInBattle[];
        previousBattleOutcomeForQuestProcessing?: {
            lootCollected: Cost[];
            defeatedEnemyOriginalIds: string[];
            waveNumberReached: number;
        };
        sourceMapNodeId?: string;
        customWaveSequence?: string[];
        currentCustomWaveIndex?: number;
    } }
  | { type: 'START_WAVE_BATTLE_PREPARATION'; payload: {
        waveNumber: number;
        isAutoProgression?: boolean;
        persistedHeroHp?: Record<string, number>;
        persistedHeroMana?: Record<string, number>;
        persistedHeroSpecialCooldowns?: Record<string, Record<string, number>>;
        rewardsForPreviousWave?: Cost[];
        expFromPreviousWave?: number;
        previousWaveNumberCleared?: number;
        buildingLevelUpEventsFromPreviousWave?: BuildingLevelUpEventInBattle[];
         previousBattleOutcomeForQuestProcessing?: {
            lootCollected: Cost[];
            defeatedEnemyOriginalIds: string[];
            waveNumberReached: number;
        };
        sourceMapNodeId?: string;
        customWaveSequence?: string[];
        currentCustomWaveIndex?: number;
    } }
  | { type: 'BATTLE_ACTION' }
  | { type: 'END_BATTLE'; payload: { outcome: 'VICTORY' | 'DEFEAT'; waveClearBonus?: Cost[], collectedLoot?: Cost[], expRewardToHeroes?: number } }
  | { type: 'END_WAVE_BATTLE_RESULT'; payload: { outcome: 'VICTORY' | 'DEFEAT'; battleStateFromEnd: BattleState } }
  | { type: 'END_DUNGEON_GRID_BATTLE_RESULT'; payload: { outcome: 'VICTORY' | 'DEFEAT'; battleStateFromEnd: BattleState } }
  | { type: 'ADD_NOTIFICATION'; payload: Omit<GameNotification, 'id' | 'timestamp'> }
  | { type: 'DISMISS_NOTIFICATION'; payload: string }
  | { type: 'CHEAT_ADD_RESOURCES'; payload: Partial<Record<ResourceType, number> & { debugAddShardsToFirstHero: Array<{definitionId: string, level: number, count: number}> }> }
  | { type: 'CHEAT_UNLOCK_ALL_WAVES' }
  | { type: 'CHEAT_REVEAL_DUNGEON_FLOOR' }
  | { type: 'SET_GAME_SPEED'; payload: number }
  | { type: 'UPGRADE_TOWN_HALL_GLOBAL_UPGRADE'; payload: { upgradeId: string; levelsToUpgrade?: number; totalBatchCost?: Cost[] } }
  | { type: 'UPGRADE_BUILDING_SPECIFIC_UPGRADE'; payload: { buildingId: string; upgradeId: string; levelsToUpgrade?: number; totalBatchCost?: Cost[] } }
  | { type: 'UPGRADE_GUILD_HALL_UPGRADE'; payload: { upgradeId: string; levelsToUpgrade?: number; totalBatchCost?: Cost[] } }
  | { type: 'START_DUNGEON_RUN'; payload: { dungeonId: string } }
  | { type: 'END_DUNGEON_FLOOR'; payload: { outcome: 'VICTORY' | 'DEFEAT', collectedLoot?: Cost[], collectedExp?: number, buildingLevelUps?: BuildingLevelUpEventInBattle[] } }
  | { type: 'END_DUNGEON_RUN'; payload: { outcome: 'SUCCESS' | 'FAILURE' } }
  | { type: 'APPLY_PERMANENT_HERO_BUFF'; payload: { heroDefinitionId: string, buff: PermanentHeroBuff } }
  | { type: 'CRAFT_ITEM'; payload: { itemId: string, quantity: number }}
  | { type: 'ADD_POTION_TO_QUEUE'; payload: { potionId: string, quantity: number }}
  | { type: 'SELECT_POTION_FOR_USAGE'; payload: { potionId: string | null } }
  | { type: 'USE_POTION_ON_HERO'; payload: { targetHeroUniqueBattleId: string } }
  | { type: 'FUSE_SHARDS'; payload: { heroDefinitionId: string, sourceShardInstanceId1: string, sourceShardInstanceId2: string } }
  | { type: 'FUSE_ALL_MATCHING_SHARDS_FOR_HERO'; payload: { heroDefinitionId: string } }
  | { type: 'TRANSFER_SHARD'; payload: { sourceHeroId: string, targetHeroId: string, shardInstanceId: string } }
  | { type: 'ANIMATION_ACK_FUSED_SHARD' }
  | { type: 'CLAIM_QUEST_REWARD'; payload: { questId: string } }
  | { type: 'PROCESS_QUEST_PROGRESS_FROM_BATTLE'; payload: { lootCollected: Cost[]; defeatedEnemyOriginalIds: string[]; waveNumberReached?: number; } }
  | { type: 'GENERATE_NEW_QUESTS' }
  | { type: 'START_DUNGEON_EXPLORATION'; payload: { dungeonId: string; floorIndex: number; } }
  | { type: 'MOVE_PARTY_ON_GRID'; payload: { dr: number; dc: number } }
  | { type: 'TRIGGER_GRID_ENCOUNTER'; payload: { r: number; c: number } }
  | { type: 'UPDATE_GRID_CELL'; payload: { r: number; c: number; newCellType: CellType; lootCollected?: boolean } }
  | { type: 'PROCEED_TO_NEXT_DUNGEON_FLOOR' }
  | { type: 'EXIT_DUNGEON_EXPLORATION'; payload: { outcome: 'SUCCESS' | 'FAILURE' | 'ABANDONED' } }
  | { type: 'GAIN_RUN_XP'; payload: { amount: number } }
  | { type: 'PRESENT_RUN_BUFF_CHOICES'; payload?: { numChoices?: number, rarityFilter?: RunBuffRarity[] } }
  | { type: 'APPLY_CHOSEN_RUN_BUFF'; payload: { buffId: string } }
  | { type: 'UNLOCK_RUN_BUFF'; payload: { buffId: string } }
  | { type: 'UPGRADE_RUN_BUFF_LIBRARY'; payload: { buffId: string; levelsToUpgrade?: number; totalBatchCost?: Cost[] } }
  | { type: 'CHEAT_ADD_RUN_XP' }
  | { type: 'CHEAT_ADD_SPECIFIC_RUN_BUFF' }
  | { type: 'CHEAT_UNLOCK_MAX_ALL_RUN_BUFFS' }
  | { type: 'CHEAT_FORCE_BATTLE_VICTORY' }
  | { type: 'CHEAT_MODIFY_FIRST_HERO_STATS' }
  | { type: 'CHEAT_TOGGLE_GOD_MODE' }
  | { type: 'TOGGLE_ACTION_BATTLE_AI_SYSTEM' }
  | { type: 'STONE_QUARRY_MINIGAME_INIT' }
  | { type: 'STONE_QUARRY_MINIGAME_CLICK_CELL'; payload: { r: number, c: number } }
  | { type: 'STONE_QUARRY_MINIGAME_PURCHASE_UPGRADE'; payload: { upgradeType: MinigameUpgradeType } }
  | { type: 'STONE_QUARRY_MINIGAME_CRAFT_GOLEM' }
  | { type: 'STONE_QUARRY_MINIGAME_CRAFT_CLAY_GOLEM' }
  | { type: 'STONE_QUARRY_MINIGAME_CRAFT_SAND_GOLEM' }
  | { type: 'STONE_QUARRY_MINIGAME_CRAFT_CRYSTAL_GOLEM' }
  | { type: 'STONE_QUARRY_MINIGAME_UPGRADE_GOLEM'; payload: { golemId?: string; upgradeType: 'clickPower' | 'clickSpeed' | 'moveSpeed' } }
  | { type: 'STONE_QUARRY_MINIGAME_TICK' }
  | { type: 'START_ACTION_BATTLE'; payload?: { encounterId?: string } }
  | { type: 'ACTION_BATTLE_SET_KEY_PRESSED'; payload: { key: string, pressed: boolean } }
  | { type: 'ACTION_BATTLE_TOGGLE_AUTO_MODE' }
  | { type: 'ACTION_BATTLE_HERO_USE_SPECIAL' }
  | { type: 'ACTION_BATTLE_TICK' }
  | { type: 'END_ACTION_BATTLE'; payload?: { outcome?: 'VICTORY' | 'DEFEAT' } }
  | { type: 'COLOSSEUM_SPAWN_NEXT_WAVE' }
  | { type: 'COLOSSEUM_WAVE_CLEARED' }
  | { type: 'COLOSSEUM_ENEMY_TAKE_DAMAGE'; payload: { enemyUniqueId: string; damage: number } }
  | { type: 'COLOSSEUM_HERO_TAKE_DAMAGE'; payload: { heroUniqueId: string; damage: number } }
  | { type: 'TOGGLE_ACTION_BATTLE_AI_SYSTEM' }
  | { type: 'UPGRADE_SHARED_SKILL_MAJOR'; payload: { skillId: string } }
  | { type: 'UPGRADE_SHARED_SKILL_MINOR'; payload: { skillId: string } }
  | { type: 'GOLD_MINE_MINIGAME_INIT'; payload?: { depth?: number } }
  | { type: 'GOLD_MINE_MINIGAME_START_RUN'; payload?: { depth?: number } }
  | { type: 'GOLD_MINE_MINIGAME_MINE_CELL'; payload: { dr: number, dc: number } }
  | { type: 'GOLD_MINE_MINIGAME_MOVE_PLAYER'; payload: { dr: number, dc: number } }
  | { type: 'GOLD_MINE_MINIGAME_RETURN_TO_SURFACE' }
  | { type: 'GOLD_MINE_MINIGAME_PURCHASE_UPGRADE'; payload: { upgradeId: string } }
  | { type: 'GOLD_MINE_MINIGAME_TICK' }
  | { type: 'SET_BATTLE_TARGET'; payload: { targetId: string | null } }
  | { type: 'START_DEMONICON_CHALLENGE'; payload: { enemyId: string } }
  | { type: 'PROCESS_DEMONICON_VICTORY_REWARDS'; payload: {
      enemyId: string;
      clearedRank: number;
      survivingHeroesWithState: Array<{
        uniqueBattleId: string;
        definitionId: string;
        level: number;
        currentExp: number;
        expToNextLevel: number;
        skillPoints: number;
        currentHp: number;
        currentMana: number;
        specialAttackCooldownsRemaining: Record<string, number>;
      }>;
      rankLootCollected: Cost[];
      rankExpCollected: number;
    } }
  | { type: 'CONTINUE_DEMONICON_CHALLENGE' }
  | { type: 'CLEANUP_DEMONICON_STATE' }
  | { type: 'SET_PLAYER_MAP_NODE'; payload: { nodeId: string } }
  | { type: 'REVEAL_MAP_NODES_STATIC'; payload: { nodeIds: string[] } }
  | { type: 'SET_CURRENT_MAP'; payload: { mapId: string; targetNodeId?: string } }
  | { type: 'COLLECT_MAP_RESOURCE'; payload: { nodeId: string; mapId: string } }
  | { type: 'SET_MAP_POI_COMPLETED'; payload: { poiKey: string } }
  | { type: 'GAIN_ACCOUNT_XP'; payload: { amount: number; source: string; } }
  | { type: 'COLLECT_RESONANCE_MOTES'; payload: { statId: keyof HeroStats; quality: ResonanceMoteType; amount: number } }
  | { type: 'INFUSE_STAT_SPECIFIC_MOTE'; payload: { statId: keyof HeroStats; moteType: ResonanceMoteType } }
  // Research Actions
  | { type: 'START_RESEARCH'; payload: { researchId: string, levelToResearch: number } }
  | { type: 'CANCEL_RESEARCH'; payload: { researchId: string, researchSlotId?: number } }
  | { type: 'PROCESS_RESEARCH_TICK' }; // Added for tickReducer to process research
