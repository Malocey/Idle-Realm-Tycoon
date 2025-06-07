
import { ResourceType, EnemyDefinition, EnemyHealAbility, StatusEffectType, HeroStats } from '../../types';

export const GOBLIN_SHAMAN_DEFINITION: EnemyDefinition = {
  id: 'GOBLIN_SHAMAN',
  name: 'Goblin Shaman',
  stats: { maxHp: 70, damage: 8, defense: 2, attackSpeed: 0.9, critChance: 0.03, critDamage: 1.3, healPower: 15 },
  loot: [{ resource: ResourceType.GOLD, amount: 25 }, { resource: ResourceType.CRYSTALS, amount: 1 }],
  iconName: 'STAFF_ICON',
  expReward: 40,
  healAbility: {
    healAmount: 25,
    cooldownMs: 12000,
    initialCooldownMs: 6000,
    targetPriority: 'LOWEST_HP_PERCENTAGE',
  },
  attackType: 'RANGED',
  rangedAttackRangeUnits: 140,
  onAttackAbilities: [
    {
      chance: 0.15, // 15% chance to apply Weakness Curse
      // statusEffectId: 'WEAKNESS_CURSE', // Replaced with inline definition
      inlineStatusEffect: {
        name: 'Weakness Curse',
        type: StatusEffectType.DEBUFF,
        durationMs: 10000, // 10 seconds
        iconName: 'WARNING', // Placeholder icon
        statAffected: 'damage' as keyof HeroStats,
        modifierType: 'PERCENTAGE_ADDITIVE',
        value: -0.20, // Reduces damage by 20%
      }
    }
  ]
};
