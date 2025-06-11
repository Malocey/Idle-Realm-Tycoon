
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
    { resource: ResourceType.HEROIC_POINTS, amount: 30 } 
  ],
  iconName: 'WOOD', 
  expReward: 75, 
  channelingAbilities: [
    {
      id: 'TREANT_ADULT_SUMMON_CHANNEL', 
      name: "Sapling Summon",
      description: "Summons new saplings while the adult Treant can still attack.",
      cooldownMs: 35000, 
      initialCooldownMs: 10000, 
      targetType: 'SELF',
      channelingProperties: {
        channelDurationMs: 15000, 
        blocksActionsWhileChanneling: false, 
        blocksMovementWhileChanneling: true, 
        effects: {
          [AbilityEffectTriggerType.ON_CHANNEL_COMPLETE]: [
            { type: 'SUMMON', targetScope: 'SELF', enemyIdToSummon: 'TREANT_SAPLING', count: 2, isElite: false } 
          ]
        }
      }
    }
  ],
};
