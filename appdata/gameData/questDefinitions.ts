
import { PlayerQuest, QuestObjectiveType, QuestRewardType, ResourceType, ShardType, QuestTemplate } from '../types'; // Added QuestTemplate import
import { formatNumber } from '../utils';
import { SHARD_DEFINITIONS } from '../gameData/shardDefinitions';

export const QUEST_DEFINITIONS: QuestTemplate[] = [
  {
    idPrefix: 'goblin_slayer',
    titlePattern: 'Goblin Slayer',
    objectiveTemplates: [{
      type: QuestObjectiveType.DEFEAT_ENEMIES,
      baseTargetValue: 8, 
      targetValueScaleFactor: 0.75, 
      enemyId: 'GOBLIN',
      descriptionPattern: 'Defeat {count} Goblins',
    }],
    rewardTemplates: [{
      type: QuestRewardType.SHARD,
      shardDefinitionId: 'ATTACK_SHARD_BASIC',
      shardLevel: 1,
      baseAmount: 1, // Number of shards
      descriptionPattern: '+{count} Attack Shard (Lvl {level})',
      iconName: 'SHARD_ATTACK_ICON'
    }],
    minWaveRequirement: 0,
  },
  {
    idPrefix: 'orc_hunter',
    titlePattern: 'Orc Hunt',
    objectiveTemplates: [{
      type: QuestObjectiveType.DEFEAT_ENEMIES,
      baseTargetValue: 2, 
      targetValueScaleFactor: 0.2, 
      enemyId: 'ORC_BRUTE',
      descriptionPattern: 'Defeat {count} Orc Brutes',
    }],
    rewardTemplates: [{
      type: QuestRewardType.SHARD,
      shardDefinitionId: 'HEALTH_SHARD_BASIC',
      shardLevel: 1,
      baseAmount: 1,
      descriptionPattern: '+{count} Health Shard (Lvl {level})',
      iconName: 'SHARD_HEALTH_ICON'
    }],
    minWaveRequirement: 5,
  },
  {
    idPrefix: 'gold_collector',
    titlePattern: 'Gold Drive',
    objectiveTemplates: [{
      type: QuestObjectiveType.COLLECT_RESOURCE,
      baseTargetValue: 150, 
      targetValueScaleFactor: 25, 
      resourceType: ResourceType.GOLD,
      descriptionPattern: 'Collect {count} Gold from battles',
    }],
    rewardTemplates: [{
      type: QuestRewardType.SHARD,
      shardDefinitionId: 'DEFENSE_SHARD_BASIC',
      shardLevel: 1,
      baseAmount: 1,
      descriptionPattern: '+{count} Defense Shard (Lvl {level})',
      iconName: 'SHARD_DEFENSE_ICON'
    }],
    minWaveRequirement: 3,
  },
  {
    idPrefix: 'wave_advancer',
    titlePattern: 'Push Forward',
    objectiveTemplates: [{
      type: QuestObjectiveType.REACH_WAVE,
      baseTargetValue: 3, 
      targetValueScaleFactor: 1, 
      descriptionPattern: 'Reach Wave {count}',
    }],
    rewardTemplates: [{
      type: QuestRewardType.HERO_XP,
      baseAmount: 50,
      amountScaleFactor: 15, 
      descriptionPattern: '+{count} Heroic Points',
      iconName: 'HEROIC_POINTS'
    }],
    minWaveRequirement: 0,
  },
  {
    idPrefix: 'general_cleanup',
    titlePattern: 'General Cleanup',
    objectiveTemplates: [{
        type: QuestObjectiveType.DEFEAT_ENEMIES,
        baseTargetValue: 15, 
        targetValueScaleFactor: 1,
        descriptionPattern: "Defeat {count} enemies of any type",
    }],
    rewardTemplates: [{
        type: QuestRewardType.RESOURCE,
        resourceType: ResourceType.WOOD,
        baseAmount: 50,
        amountScaleFactor: 8, 
        descriptionPattern: "+{count} Wood",
        iconName: 'WOOD'
    }],
    minWaveRequirement: 2,
  },
  {
    idPrefix: 'cleric_artifact',
    titlePattern: "Cleric's Artifact",
    objectiveTemplates: [{
      type: QuestObjectiveType.DEFEAT_ENEMIES,
      baseTargetValue: 2, 
      targetValueScaleFactor: 0.2, 
      enemyId: 'GOBLIN_SHAMAN',
      descriptionPattern: 'Defeat {count} Goblin Shamans',
    }],
    rewardTemplates: [{
      type: QuestRewardType.SHARD,
      shardDefinitionId: 'HEAL_POWER_SHARD_BASIC',
      shardLevel: 1,
      baseAmount: 1,
      descriptionPattern: '+{count} Heal Power Shard (Lvl {level})',
      iconName: 'STAFF_ICON'
    }],
    minWaveRequirement: 7,
  },
  {
    idPrefix: 'mage_crystal',
    titlePattern: "Mage's Crystal",
    objectiveTemplates: [{
      type: QuestObjectiveType.COLLECT_RESOURCE,
      baseTargetValue: 75, 
      targetValueScaleFactor: 15, 
      resourceType: ResourceType.CRYSTALS,
      descriptionPattern: 'Collect {count} Crystals from battles',
    }],
    rewardTemplates: [{
      type: QuestRewardType.SHARD,
      shardDefinitionId: 'MANA_SHARD_BASIC',
      shardLevel: 1,
      baseAmount: 1,
      descriptionPattern: '+{count} Mana Shard (Lvl {level})',
      iconName: 'CRYSTALS'
    }],
    minWaveRequirement: 6,
  },
  { // New Quest for Level 2 Shard
    idPrefix: 'elite_hunter_attack',
    titlePattern: 'Elite Attack Shard Hunt',
    objectiveTemplates: [{
      type: QuestObjectiveType.DEFEAT_ENEMIES,
      baseTargetValue: 1, 
      targetValueScaleFactor: 0, // No scaling for target count of elite
      enemyId: 'ELITE_GUARDIAN',
      descriptionPattern: 'Defeat {count} Elite Guardian',
    }],
    rewardTemplates: [{
      type: QuestRewardType.SHARD,
      shardDefinitionId: 'ATTACK_SHARD_BASIC', // Example: Attack Shard
      shardLevel: 2, // Higher level shard
      baseAmount: 1,
      descriptionPattern: '+{count} Attack Shard (Lvl {level})',
      iconName: 'SHARD_ATTACK_ICON'
    }],
    minWaveRequirement: 15, // Requires players to be further in the game
  }
];