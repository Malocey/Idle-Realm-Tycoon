
import { ResourceType, EnemyDefinition, StatusEffectType, HeroStats, AbilityEffectTriggerType } from '../../types';

export const TREANT_SAPLING_DEFINITION: EnemyDefinition = {
  id: 'TREANT_SAPLING',
  name: 'Treant Sapling',
  stats: { maxHp: 120, damage: 10, defense: 8, attackSpeed: 0.7, critChance: 0.02, critDamage: 1.2 },
  loot: [{ resource: ResourceType.WOOD, amount: 5 }, { resource: ResourceType.HERB_IRONWOOD_LEAF, amount: 1 }],
  iconName: 'WOOD',
  expReward: 50,
  channelingAbilities: [
    {
      id: 'TREANT_SAPLING_GROWTH_CHANNEL',
      name: "Growing",
      description: "Kanalisiert Wachstum. Transformiert sich bei Abschluss in einen ausgewachsenen Treant.",
      cooldownMs: 99999999, // Effectively once per sapling for this transformation
      initialCooldownMs: 3000, // Sapling attacks normally for 11s before this starts
      targetType: 'SELF',
      channelingProperties: {
        channelDurationMs: 8000, // 8 seconds for growth
        blocksActionsWhileChanneling: true, 
        blocksMovementWhileChanneling: true,
        effects: {
          [AbilityEffectTriggerType.ON_CHANNEL_COMPLETE]: [
            { 
              type: 'TRANSFORM_INTO_ENEMY',
              targetScope: 'SELF', // The sapling transforms itself
              enemyIdToTransformInto: 'TREANT_ADULT',
              inheritEliteStatus: true, // The adult should be elite if the sapling was
            }
          ],
        }
      }
    },
    // TREANT_ADULT_SUMMON_CHANNEL is removed from here and will be on TREANT_ADULT
  ],
};
