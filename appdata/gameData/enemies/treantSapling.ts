
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
      description: "Channels growth. Transforms into an adult Treant upon completion.",
      cooldownMs: 99999999, 
      initialCooldownMs: 3000, 
      targetType: 'SELF',
      channelingProperties: {
        channelDurationMs: 8000, 
        blocksActionsWhileChanneling: true, 
        blocksMovementWhileChanneling: true,
        effects: {
          [AbilityEffectTriggerType.ON_CHANNEL_COMPLETE]: [
            { 
              type: 'TRANSFORM_INTO_ENEMY',
              targetScope: 'SELF', 
              enemyIdToTransformInto: 'TREANT_ADULT',
              inheritEliteStatus: true, 
            }
          ],
        }
      }
    },
  ],
};
