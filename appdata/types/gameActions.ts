
import { ResourceType, CellType, RunBuffRarity } from './enums';
import { Cost, GameNotification } from './common';
import { PermanentHeroBuff, PlayerHeroState } from './hero'; 
import { BuildingLevelUpEventInBattle, BattleHero, BattleState } from './battle'; 
import { MinigameUpgradeType } from './minigame';

// Repräsentiert die Form des 'payload' für verschiedene Aktionen
// Dies ist keine diskriminierte Union selbst, sondern eine Sammlung von Payload-Typen
// Die eigentliche GameAction wird eine diskriminierte Union sein, die diese verwendet.

export type GameAction =
  | { type: 'PROCESS_TICK' }
  | { type: 'SET_ACTIVE_VIEW'; payload: 'TOWN' | 'BATTLEFIELD' | 'DUNGEON_REWARD' | 'HERO_ACADEMY' | 'DUNGEON_EXPLORE' | 'STONE_QUARRY_MINIGAME' | 'ACTION_BATTLE_VIEW' | 'SHARED_SKILL_TREE' | 'GOLD_MINE_MINIGAME' | 'DEMONICON_PORTAL' }
  | { type: 'CONSTRUCT_BUILDING'; payload: { buildingId: string } }
  | { type: 'UPGRADE_BUILDING'; payload: { buildingId: string; levelsToUpgrade?: number; totalBatchCost?: Cost[] } }
  | { type: 'RECRUIT_HERO'; payload: { heroId: string } }
  | { type: 'UPGRADE_SKILL'; payload: { heroDefinitionId: string; skillId: string; levelsToUpgrade?: number; totalBatchCost?: Cost[] } }
  | { type: 'LEARN_UPGRADE_SPECIAL_ATTACK'; payload: { heroDefinitionId: string; skillNodeId: string; levelsToUpgrade?: number; totalBatchCost?: Cost[] } }
  | { type: 'UPGRADE_HERO_EQUIPMENT'; payload: { heroDefinitionId: string; equipmentId: string; levelsToUpgrade?: number; totalBatchCost?: Cost[] } }
  // Generic START_BATTLE_PREPARATION, context might be inferred or passed.
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
    } }
  // Specific START actions for different battle flows
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
         previousBattleOutcomeForQuestProcessing?: { // Added for quest processing
            lootCollected: Cost[];
            defeatedEnemyOriginalIds: string[];
            waveNumberReached: number;
        };
    } }
  // START_DUNGEON_GRID_BATTLE might be implicitly handled by MOVE_PARTY_ON_GRID if it lands on an enemy cell
  | { type: 'BATTLE_ACTION' } // Combat tick
  | { type: 'END_BATTLE'; payload: { outcome: 'VICTORY' | 'DEFEAT'; waveClearBonus?: Cost[], collectedLoot?: Cost[], expRewardToHeroes?: number } } // Generic end, will be dispatched to specifics
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
  // Stone Quarry Minigame
  | { type: 'STONE_QUARRY_MINIGAME_INIT' }
  | { type: 'STONE_QUARRY_MINIGAME_CLICK_CELL'; payload: { r: number, c: number } }
  | { type: 'STONE_QUARRY_MINIGAME_PURCHASE_UPGRADE'; payload: { upgradeType: MinigameUpgradeType } }
  | { type: 'STONE_QUARRY_MINIGAME_CRAFT_GOLEM' }
  | { type: 'STONE_QUARRY_MINIGAME_CRAFT_CLAY_GOLEM' }
  | { type: 'STONE_QUARRY_MINIGAME_CRAFT_SAND_GOLEM' }
  | { type: 'STONE_QUARRY_MINIGAME_CRAFT_CRYSTAL_GOLEM' }
  | { type: 'STONE_QUARRY_MINIGAME_UPGRADE_GOLEM'; payload: { golemId?: string; upgradeType: 'clickPower' | 'clickSpeed' | 'moveSpeed' } }
  | { type: 'STONE_QUARRY_MINIGAME_TICK' }
  // Action Battle / Colosseum
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
  // Shared Passive Skills
  | { type: 'UPGRADE_SHARED_SKILL_MAJOR'; payload: { skillId: string } }
  | { type: 'UPGRADE_SHARED_SKILL_MINOR'; payload: { skillId: string } }
  // Gold Mine Minigame Actions
  | { type: 'GOLD_MINE_MINIGAME_INIT'; payload?: { depth?: number } }
  | { type: 'GOLD_MINE_MINIGAME_START_RUN'; payload?: { depth?: number } }
  | { type: 'GOLD_MINE_MINIGAME_MINE_CELL'; payload: { dr: number, dc: number } } 
  | { type: 'GOLD_MINE_MINIGAME_MOVE_PLAYER'; payload: { dr: number, dc: number } }
  | { type: 'GOLD_MINE_MINIGAME_RETURN_TO_SURFACE' }
  | { type: 'GOLD_MINE_MINIGAME_PURCHASE_UPGRADE'; payload: { upgradeId: string } }
  | { type: 'GOLD_MINE_MINIGAME_TICK' }
  // New Battle Target Action
  | { type: 'SET_BATTLE_TARGET'; payload: { targetId: string | null } }
  // Demonicon Actions
  | { type: 'START_DEMONICON_CHALLENGE'; payload: { enemyId: string } }
  | { type: 'PROCESS_DEMONICON_VICTORY_REWARDS'; payload: { 
      enemyId: string; 
      clearedRank: number; 
      survivingHeroesWithState: Array<{ 
        uniqueBattleId: string; 
        definitionId: string; 
        level: number; // Added
        currentExp: number; // Added
        expToNextLevel: number; // Added
        skillPoints: number; // Added
        currentHp: number; 
        currentMana: number; 
        specialAttackCooldownsRemaining: Record<string, number>; 
      }>;
      rankLootCollected: Cost[]; 
      rankExpCollected: number;  
    } }
  | { type: 'CONTINUE_DEMONICON_CHALLENGE' }
  | { type: 'CLEANUP_DEMONICON_STATE' };
