

import { ShardDefinition, ShardType, HeroStats } from '../types';

export const SHARD_DEFINITIONS: Record<string, ShardDefinition> = {
  'ATTACK_SHARD_BASIC': {
    id: 'ATTACK_SHARD_BASIC',
    type: ShardType.ATTACK,
    name: 'Attack Shard',
    iconName: 'SHARD_ATTACK_ICON', 
    statAffected: 'damage' as keyof HeroStats, 
    baseValue: 1,        
    scalingFactor: 2.1,  
    maxFusionLevel: 10, 
  },
  'HEALTH_SHARD_BASIC': {
    id: 'HEALTH_SHARD_BASIC',
    type: ShardType.HEALTH,
    name: 'Health Shard',
    iconName: 'SHARD_HEALTH_ICON',
    statAffected: 'maxHp' as keyof HeroStats,
    baseValue: 5, 
    scalingFactor: 2.1,
    maxFusionLevel: 10,
  },
  'DEFENSE_SHARD_BASIC': {
    id: 'DEFENSE_SHARD_BASIC',
    type: ShardType.DEFENSE,
    name: 'Defense Shard',
    iconName: 'SHARD_DEFENSE_ICON',
    statAffected: 'defense' as keyof HeroStats,
    baseValue: 1, 
    scalingFactor: 2.1,
    maxFusionLevel: 10,
  },
  'HEAL_POWER_SHARD_BASIC': {
    id: 'HEAL_POWER_SHARD_BASIC',
    type: ShardType.HEAL_POWER,
    name: 'Heal Power Shard',
    iconName: 'STAFF_ICON', // Reusing staff icon for heal power
    statAffected: 'healPower' as keyof HeroStats,
    baseValue: 1,        
    scalingFactor: 2.1,  
    maxFusionLevel: 10, 
  },
  'MANA_SHARD_BASIC': {
    id: 'MANA_SHARD_BASIC',
    type: ShardType.MANA,
    name: 'Mana Shard',
    iconName: 'CRYSTALS', // Reusing crystals icon for mana
    statAffected: 'maxMana' as keyof HeroStats,
    baseValue: 5,        
    scalingFactor: 2.1,  
    maxFusionLevel: 10, 
  },
};