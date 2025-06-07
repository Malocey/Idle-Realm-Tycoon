
import { ResourceType, EnemyDefinition, EnemyChannelingAbilityDefinition, AbilityEffectTriggerType, StatusEffectType, HeroStats } from '../../types';
import { DEFAULT_ENERGY_SHIELD_RECHARGE_DELAY_TICKS, DEFAULT_ENERGY_SHIELD_RECHARGE_RATE_PER_TICK } from '../../constants';

const FORTIFY_CHANNEL_DURATION_MS = 4000;

// Define the initial version as a non-exported constant
const INITIAL_IRONCLAD_GOLEM_DEFINITION_BASE: Omit<EnemyDefinition, 'periodicEffectAbility' | 'channelingAbilities'> = {
  id: 'IRONCLAD_GOLEM',
  name: 'Ironclad Golem',
  stats: {
    maxHp: 450,
    damage: 35,
    defense: 25,
    attackSpeed: 0.4, // Slow attack speed
    critChance: 0.05,
    critDamage: 1.5,
    maxEnergyShield: 100,
    energyShieldRechargeRate: DEFAULT_ENERGY_SHIELD_RECHARGE_RATE_PER_TICK * 0.5,
    energyShieldRechargeDelay: DEFAULT_ENERGY_SHIELD_RECHARGE_DELAY_TICKS * 1.5,
  },
  loot: [
    { resource: ResourceType.GOLD, amount: 150 },
    { resource: ResourceType.STONE, amount: 20 },
    { resource: ResourceType.IRON, amount: 15 },
    { resource: ResourceType.CRYSTALS, amount: 5 },
  ],
  iconName: 'STONE',
  expReward: 120,
  attackType: 'MELEE',
};

// Create the final definition
export const IRONCLAD_GOLEM_DEFINITION: EnemyDefinition = {
  ...INITIAL_IRONCLAD_GOLEM_DEFINITION_BASE,
  periodicEffectAbility: { 
    cooldownMs: 18000,
    initialCooldownMs: 7000,
    statusEffect: {
      name: 'Metallic Roar Stun', // Specific name for clarity
      type: StatusEffectType.STUN,
      durationMs: 1200, // Short stun
      iconName: 'STUNNED',
    }
  },
  channelingAbilities: [
    {
      id: 'IRONCLAD_GOLEM_FORTIFY',
      name: 'Fortify',
      description: 'Enters a defensive stance, massively increasing defense and recovering shield upon completion. Cannot attack while channeling.',
      cooldownMs: 25000,
      initialCooldownMs: 10000,
      targetType: 'SELF',
      channelingProperties: {
        channelDurationMs: FORTIFY_CHANNEL_DURATION_MS,
        blocksActionsWhileChanneling: true,
        blocksMovementWhileChanneling: true,
        effects: {
          [AbilityEffectTriggerType.ON_CHANNEL_START]: [
            {
              type: 'APPLY_STATUS',
              targetScope: 'SELF',
              inlineStatusEffect: { // Defined inline
                name: 'Fortified Defense',
                type: StatusEffectType.BUFF,
                durationMs: FORTIFY_CHANNEL_DURATION_MS,
                iconName: 'SHIELD_BADGE',
                statAffected: 'defense' as keyof HeroStats,
                modifierType: 'PERCENTAGE_ADDITIVE',
                value: 2.0, // +200% Defense
              }
            }
          ],
          [AbilityEffectTriggerType.ON_CHANNEL_COMPLETE]: [
            { type: 'HEAL', targetScope: 'SELF', shieldHealPercentage: 0.50 }
          ],
        }
      }
    },
    {
      id: 'IRONCLAD_GOLEM_QUAKE',
      name: 'Quake',
      description: 'Channels briefly, then stomps to deal AOE damage and slow heroes.',
      cooldownMs: 30000,
      initialCooldownMs: 15000,
      targetType: 'AREA',
      channelingProperties: {
        channelDurationMs: 5000,
        blocksActionsWhileChanneling: true,
        blocksMovementWhileChanneling: true,
        effects: {
          [AbilityEffectTriggerType.ON_CHANNEL_COMPLETE]: [
            {
              type: 'DAMAGE',
              damageMultiplier: 0.7,
              targetScope: 'ALL_ENEMIES'
            },
            {
              type: 'APPLY_STATUS',
              targetScope: 'ALL_ENEMIES',
              chance: 1.0,
              inlineStatusEffect: { // Defined inline
                name: 'Quake Slow',
                type: StatusEffectType.DEBUFF,
                durationMs: 3000,
                iconName: 'WARNING',
                statAffected: 'attackSpeed' as keyof HeroStats,
                modifierType: 'PERCENTAGE_ADDITIVE',
                value: -0.30, // -30% Attack Speed
              }
            }
          ]
        }
      }
    }
  ],
};
