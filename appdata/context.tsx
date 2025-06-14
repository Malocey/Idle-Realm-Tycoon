

import React, { createContext, useMemo, useCallback, useEffect, useContext, useReducer } from 'react';
import {
  ResourceType, GameState, GameAction, GameContextType, Resources, PlayerBuildingState,
  PlayerHeroState, BattleState, BattleHero, BattleEnemy, Cost, Production, HeroStats, GameNotification,
  AttackEvent, TownHallUpgradeDefinition, SpecialAttackDefinition, SpecialAttackTargetType,
  HeroEquipmentDefinition, BuildingDefinition, GlobalBonuses, TownHallUpgradeUnlockRequirementType,
  DungeonRunState, DungeonDefinition, PermanentHeroBuff, BuildingLevelUpEventInBattle, BuildingSpecificUpgradeDefinition, GuildHallUpgradeDefinition, PotionDefinition, ShardDefinition,
  QuestTemplate, TrapDefinition, DungeonEventDefinition, RunBuffDefinition, ColosseumWaveDefinition, ActionBattleState, SharedSkillDefinition, StatusEffectDefinition, WorldMapDefinition, AccountLevelDefinition, AethericResonanceStatConfig, ResearchDefinition
} from './types';
import { ICONS } from './components/Icons';
import {
  GAME_TICK_MS, MAX_WAVE_NUMBER
} from './constants';
import {
  BUILDING_DEFINITIONS, HERO_DEFINITIONS, SKILL_TREES, ENEMY_DEFINITIONS,
  WAVE_DEFINITIONS, TOWN_HALL_UPGRADE_DEFINITIONS, SPECIAL_ATTACK_DEFINITIONS, EQUIPMENT_DEFINITIONS,
  DUNGEON_DEFINITIONS, BUILDING_SPECIFIC_UPGRADE_DEFINITIONS, GUILD_HALL_UPGRADE_DEFINITIONS, POTION_DEFINITIONS, SHARD_DEFINITIONS, QUEST_DEFINITIONS, TRAP_DEFINITIONS, DUNGEON_EVENT_DEFINITIONS, RUN_BUFF_DEFINITIONS, COLOSSEUM_WAVE_DEFINITIONS, SHARED_SKILL_DEFINITIONS, STATUS_EFFECT_DEFINITIONS, 
  DEMONICON_MILESTONE_REWARDS, worldMapDefinitions, ACCOUNT_LEVEL_DEFINITIONS, AETHERIC_RESONANCE_STAT_CONFIGS, RESEARCH_DEFINITIONS
} from './gameData/index'; // Haupt-Barrel-Datei wird hier verwendet
import {
    calculateBuildingProduction, calculateBuildingUpgradeCost,
    calculateHeroStats, canAfford, getExpToNextHeroLevel,
    calculateTownHallUpgradeCostValue, getTownHallUpgradeEffectValue,
    calculateSpecialAttackData, calculateWaveEnemyStats, calculateDungeonEnemyStats,
    formatNumber, calculateGlobalBonusesFromAllSources, getShardDisplayValueUtil
} from './utils';
import { initialGameState } from './initialState';
import { createGameReducer } from './reducers/index';

// Import custom hooks
import { useGameTick } from './hooks/useGameTick';
import { useBattleManager } from './hooks/useBattleManager';
import { useNotificationManager } from './hooks/useNotificationManager';
import { useBattleProgression } from './hooks/useBattleProgression';
import { useDungeonManager } from './hooks/useDungeonManager';


export const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const staticData: GameContextType['staticData'] = useMemo(() => ({
    buildingDefinitions: BUILDING_DEFINITIONS,
    heroDefinitions: HERO_DEFINITIONS,
    skillTrees: SKILL_TREES,
    enemyDefinitions: ENEMY_DEFINITIONS,
    waveDefinitions: WAVE_DEFINITIONS, // Dies sollte jetzt alle Wellen enthalten
    icons: ICONS,
    townHallUpgradeDefinitions: TOWN_HALL_UPGRADE_DEFINITIONS,
    buildingSpecificUpgradeDefinitions: BUILDING_SPECIFIC_UPGRADE_DEFINITIONS,
    guildHallUpgradeDefinitions: GUILD_HALL_UPGRADE_DEFINITIONS, 
    specialAttackDefinitions: SPECIAL_ATTACK_DEFINITIONS,
    equipmentDefinitions: EQUIPMENT_DEFINITIONS,
    dungeonDefinitions: DUNGEON_DEFINITIONS,
    potionDefinitions: POTION_DEFINITIONS,
    shardDefinitions: SHARD_DEFINITIONS,
    questDefinitions: QUEST_DEFINITIONS as QuestTemplate[], 
    trapDefinitions: TRAP_DEFINITIONS, 
    eventDefinitions: DUNGEON_EVENT_DEFINITIONS, 
    runBuffDefinitions: RUN_BUFF_DEFINITIONS, 
    colosseumWaveDefinitions: COLOSSEUM_WAVE_DEFINITIONS,
    sharedSkillDefinitions: SHARED_SKILL_DEFINITIONS,
    statusEffectDefinitions: STATUS_EFFECT_DEFINITIONS, 
    demoniconMilestoneRewards: DEMONICON_MILESTONE_REWARDS,
    worldMapDefinitions: worldMapDefinitions, // Dies sollte jetzt alle Karten enthalten
    accountLevelDefinitions: ACCOUNT_LEVEL_DEFINITIONS,
    aethericResonanceStatConfigs: AETHERIC_RESONANCE_STAT_CONFIGS,
    researchDefinitions: RESEARCH_DEFINITIONS,
  }), []);

  const reducerWithStaticData = useMemo(() => createGameReducer(staticData), [staticData]);
  const [gameState, dispatch] = useReducer(reducerWithStaticData, initialGameState);


  const getGlobalBonuses = useCallback((): GlobalBonuses => {
    return calculateGlobalBonusesFromAllSources(
        gameState,
        staticData.townHallUpgradeDefinitions,
        staticData.buildingSpecificUpgradeDefinitions,
        staticData.guildHallUpgradeDefinitions
    );
  }, [gameState, staticData.townHallUpgradeDefinitions, staticData.buildingSpecificUpgradeDefinitions, staticData.guildHallUpgradeDefinitions]);

  const getCalculatedHeroStats = useCallback((heroState: PlayerHeroState | BattleHero): HeroStats => {
      const heroDef = staticData.heroDefinitions[heroState.definitionId];
      const skillTree = staticData.skillTrees[heroDef.skillTreeId];
      const currentGlobalBonuses = getGlobalBonuses();
      const isDemoniconBattle = !!(gameState.battleState && gameState.battleState.isDemoniconBattle);
      return calculateHeroStats(
          heroState, 
          heroDef, 
          skillTree, 
          gameState, 
          staticData.townHallUpgradeDefinitions, 
          staticData.guildHallUpgradeDefinitions, 
          staticData.equipmentDefinitions, 
          currentGlobalBonuses,
          staticData.shardDefinitions,
          staticData.runBuffDefinitions,
          staticData.statusEffectDefinitions,
          isDemoniconBattle, 
          gameState.achievedDemoniconMilestoneRewards 
      );
  }, [staticData, gameState, getGlobalBonuses]);

  const getBuildingProduction = useCallback((buildingState: PlayerBuildingState): Production[] => {
      const def = staticData.buildingDefinitions[buildingState.id];
      return def ? calculateBuildingProduction(def, buildingState.level) : [];
  }, [staticData]);

  const getBuildingUpgradeCost = useCallback((buildingState: PlayerBuildingState): Cost[] => {
      const def = staticData.buildingDefinitions[buildingState.id];
      return def ? calculateBuildingUpgradeCost(def, buildingState.level + 1) : [];
  }, [staticData]);

  const getSkillUpgradeCost = useCallback((heroDefId: string, skillId: string, currentSkillLevel: number) => {
      const heroDef = staticData.heroDefinitions[heroDefId];
      const skillTree = staticData.skillTrees[heroDef.skillTreeId];
      const skillDef = skillTree?.nodes.find(s => s.id === skillId);

      if (skillDef?.specialAttackId) {
        const saDef = staticData.specialAttackDefinitions[skillDef.specialAttackId];
        if (saDef) {
            return { heroXpPoolCost: saDef.costBase + currentSkillLevel * saDef.costIncreasePerLevel };
        }
      }
      return skillDef ? skillDef.costPerLevel(currentSkillLevel) : {skillPoints: 999, resources: [], heroXpPoolCost: 9999};
  }, [staticData]);

  const getShardDisplayValue = useCallback((shardDefinitionId: string, level: number): number => {
    const def = staticData.shardDefinitions[shardDefinitionId];
    return getShardDisplayValueUtil(def, level);
  }, [staticData.shardDefinitions]);

  useGameTick(dispatch, gameState.gameSpeed);
  useBattleManager(
    dispatch,
    gameState.activeView,
    gameState.battleState?.status as GameState['battleState_status'], 
    gameState.actionBattleState?.status as GameState['actionBattleState_status'], 
    gameState.gameSpeed
  );
  useNotificationManager(dispatch, gameState.notifications);
  useBattleProgression(dispatch, gameState.battleState);
  useDungeonManager(dispatch, gameState, staticData);


  const gameContextValue: GameContextType = useMemo(() => ({
    gameState, dispatch, staticData, getCalculatedHeroStats, getBuildingProduction, getBuildingUpgradeCost, getSkillUpgradeCost, getGlobalBonuses, getShardDisplayValue
  }), [gameState, dispatch, staticData, getCalculatedHeroStats, getBuildingProduction, getBuildingUpgradeCost, getSkillUpgradeCost, getGlobalBonuses, getShardDisplayValue]);

  return <GameContext.Provider value={gameContextValue}>{children}</GameContext.Provider>;
};

export const useGameContext = (): GameContextType => {
  const context = useContext(GameContext);
  if (context === undefined) throw new Error('useGameContext must be used within a GameProvider');
  return context;
};

declare module './types' {
    interface GameState {
        battleState_status?: BattleState['status'] | null;
        actionBattleState_status?: ActionBattleState['status'] | null;
    }
}
