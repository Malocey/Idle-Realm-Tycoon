
import { ResourceType, EnemyDefinition, StatusEffectType, HeroStats, AbilityEffectTriggerType } from '../../types';

export const TREANT_ADULT_DEFINITION: EnemyDefinition = {
  id: 'TREANT_ADULT',
  name: 'Treant Adult',
  stats: { 
    maxHp: 600, 
    damage: 15, 
    defense: 16, 
    attackSpeed: 0.6, 
    critChance: 0.03, 
    critDamage: 1.3 
  },
  loot: [
    { resource: ResourceType.WOOD, amount: 25 }, 
    { resource: ResourceType.HERB_IRONWOOD_LEAF, amount: 3 },
    { resource: ResourceType.HEROIC_POINTS, amount: 30 } // More XP than a regular sapling
  ],
  iconName: 'WOOD', // Can be a different icon later if desired
  expReward: 75, // More EXP
  channelingAbilities: [
    {
      id: 'TREANT_ADULT_SUMMON_CHANNEL', // This was previously on the buffed sapling
      name: "Sapling-Summon",
      description: "Beschwört neue Setzlinge, während der ausgewachsene Treant angreifen kann.",
      cooldownMs: 35000, // Cooldown for the adult to summon again
      initialCooldownMs: 10000, // Initial cooldown after transforming
      targetType: 'SELF',
      channelingProperties: {
        channelDurationMs: 15000, // 15 seconds for summoning
        blocksActionsWhileChanneling: false, // Can attack during summoning
        blocksMovementWhileChanneling: true, 
        effects: {
          [AbilityEffectTriggerType.ON_CHANNEL_COMPLETE]: [
            { type: 'SUMMON', targetScope: 'SELF', enemyIdToSummon: 'TREANT_SAPLING', count: 2, isElite: false } // Summons regular saplings
          ]
        }
      }
    }
  ],
};
