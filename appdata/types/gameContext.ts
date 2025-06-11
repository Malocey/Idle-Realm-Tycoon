

import React from 'react';
import { GameState } from './gameState';
import { GameAction } from './gameActions';
import { GlobalBonuses } from './globalBonuses';
import { PlayerBuildingState, BuildingDefinition } from './building';
import { PlayerHeroState, HeroDefinition, HeroStats, SpecialAttackDefinition, HeroEquipmentDefinition, SharedSkillDefinition } from './hero'; // Added SharedSkillDefinition
import { SkillTreeDefinition, SkillNodeDefinition } from './skill';
import { EnemyDefinition } from './enemy';
import { WaveDefinition, BattleHero, StatusEffectDefinition } from './battle'; // Added StatusEffectDefinition
import { IconComponent, Production, Cost } from './common';
import { TownHallUpgradeDefinition, BuildingSpecificUpgradeDefinition, GuildHallUpgradeDefinition } from './upgrades';
import { DungeonDefinition, TrapDefinition, DungeonEventDefinition, WorldMapDefinition, AethericResonanceStatConfig, ResearchDefinition } from './index'; // Added WorldMapDefinition and AethericResonanceStatConfig, ResearchDefinition
import { PotionDefinition } from './crafting';
import { ShardDefinition } from './shards';
import { QuestTemplate } from './quests';
import { RunBuffDefinition } from './runBuffs';
import { ColosseumWaveDefinition } from './actionBattle';
import { DemoniconMilestoneRewardDefinition, AccountLevelDefinition } from './index'; // Import new type & AccountLevelDefinition

export interface GameContextType {
  gameState: GameState;
  dispatch: React.Dispatch<GameAction>;
  staticData: {
    buildingDefinitions: Record<string, BuildingDefinition>;
    heroDefinitions: Record<string, HeroDefinition>;
    skillTrees: Record<string, SkillTreeDefinition>;
    enemyDefinitions: Record<string, EnemyDefinition>;
    waveDefinitions: WaveDefinition[];
    icons: Record<string, IconComponent>;
    townHallUpgradeDefinitions: Record<string, TownHallUpgradeDefinition>;
    buildingSpecificUpgradeDefinitions: Record<string, BuildingSpecificUpgradeDefinition[]>;
    guildHallUpgradeDefinitions: Record<string, GuildHallUpgradeDefinition>;
    specialAttackDefinitions: Record<string, SpecialAttackDefinition>;
    equipmentDefinitions: Record<string, HeroEquipmentDefinition>;
    dungeonDefinitions: Record<string, DungeonDefinition>;
    potionDefinitions: Record<string, PotionDefinition>;
    shardDefinitions: Record<string, ShardDefinition>;
    questDefinitions: QuestTemplate[];
    trapDefinitions: Record<string, TrapDefinition>;
    eventDefinitions: Record<string, DungeonEventDefinition>;
    runBuffDefinitions: Record<string, RunBuffDefinition>;
    colosseumWaveDefinitions: ColosseumWaveDefinition[];
    sharedSkillDefinitions: Record<string, SharedSkillDefinition>;
    statusEffectDefinitions: Record<string, StatusEffectDefinition>; 
    demoniconMilestoneRewards: Record<string, DemoniconMilestoneRewardDefinition[]>;
    worldMapDefinitions: Record<string, WorldMapDefinition>; // Added worldMapDefinitions
    accountLevelDefinitions: AccountLevelDefinition[]; // Added accountLevelDefinitions
    aethericResonanceStatConfigs: AethericResonanceStatConfig[]; // Added Aetheric Resonance Stat Configs
    researchDefinitions: Record<string, ResearchDefinition>; // Added researchDefinitions
  };
  getCalculatedHeroStats: (heroState: PlayerHeroState | BattleHero) => HeroStats;
  getBuildingProduction: (buildingState: PlayerBuildingState) => Production[];
  getBuildingUpgradeCost: (buildingState: PlayerBuildingState) => Cost[];
  getSkillUpgradeCost: (heroDefId: string, skillId: string, currentSkillLevel: number) => ReturnType<SkillNodeDefinition['costPerLevel']>;
  getGlobalBonuses: () => GlobalBonuses;
  getShardDisplayValue: (shardDefinitionId: string, level: number) => number;
}