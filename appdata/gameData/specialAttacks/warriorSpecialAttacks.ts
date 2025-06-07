
import { ResourceType, SpecialAttackDefinition, SpecialAttackTargetType, CalculatedSpecialAttackData, StatusEffectType } from '../../types';

const WARRIOR_WHIRLWIND_DEFINITION: SpecialAttackDefinition = {
    id: 'WARRIOR_WHIRLWIND',
    name: 'Whirlwind',
    description: (level, data) => `Unleashes a spinning attack, hitting all enemies for ${ (data.currentDamageMultiplier * 100).toFixed(0)}% of Attack Damage. Mana: ${data.currentManaCost}. Cooldown: ${(data.currentCooldownMs / 1000).toFixed(1)}s.`,
    iconName: 'WHIRLWIND_ICON',
    cooldownBaseMs: 15000,
    cooldownReductionPerLevelMs: 500, 
    targetType: SpecialAttackTargetType.ALL_ENEMIES,
    effects: [{
      damageMultiplierBase: 0.6, 
      damageMultiplierIncreasePerLevel: 0.1, 
      numHitsBase: 1,
      numHitsIncreasePerLevel: 0,
    }],
    maxLevel: 10,
    costResource: ResourceType.HEROIC_POINTS,
    costBase: 50, 
    costIncreasePerLevel: 25, 
    manaCostBase: 15, 
    manaCostIncreasePerLevel: 2, 
};

const WARRIOR_SHIELD_BASH_DEFINITION: SpecialAttackDefinition = {
    id: 'WARRIOR_SHIELD_BASH',
    name: 'Shield Bash',
    description: (level, data) => {
      const stunChance = 0.25 + (level - 1) * 0.05; 
      const stunDurationMs = 1500 + (level - 1) * 200; // Keep for description consistency
      return `Slams the target with a shield, dealing ${(data.currentDamageMultiplier * 100).toFixed(0)}% of Attack Damage with a ${(stunChance * 100).toFixed(0)}% chance to Stun for ${(stunDurationMs / 1000).toFixed(1)}s. Mana: ${data.currentManaCost}. Cooldown: ${(data.currentCooldownMs / 1000).toFixed(1)}s.`;
    },
    iconName: 'SHIELD',
    cooldownBaseMs: 10000,
    cooldownReductionPerLevelMs: 300,
    targetType: SpecialAttackTargetType.SINGLE_ENEMY,
    effects: [{
      damageMultiplierBase: 0.8, 
      damageMultiplierIncreasePerLevel: 0.15,
      numHitsBase: 1,
      numHitsIncreasePerLevel: 0,
    }],
    statusEffectsToApply: [
        {
            // effectId: 'GENERIC_STUN', // Removed ID reference
            inlineEffect: { // Using inlineEffect for dynamic duration
                type: StatusEffectType.STUN,
                name: 'Shield Bash Stun', // Specific name for clarity
                iconName: 'STUNNED',
                // durationMs is now handled by durationMsOverride, but a base could be set if needed as fallback
                // For a purely dynamic duration, base durationMs here could be the Lvl 1 duration.
                durationMs: 1500, // Base duration for Lvl 1 if override is not used or for display.
            },
            chance: 0.25, // Base chance, actual chance scaling could be part of special attack logic if needed
            durationMsOverride: (level: number) => 1500 + (level - 1) * 200, // Dynamic duration
        }
    ],
    maxLevel: 5,
    costResource: ResourceType.HEROIC_POINTS,
    costBase: 75,
    costIncreasePerLevel: 30,
    manaCostBase: 10,
    manaCostIncreasePerLevel: 1,
};

export const WARRIOR_SPECIAL_ATTACKS: Record<string, SpecialAttackDefinition> = {
    'WARRIOR_WHIRLWIND': WARRIOR_WHIRLWIND_DEFINITION,
    'WARRIOR_SHIELD_BASH': WARRIOR_SHIELD_BASH_DEFINITION,
};
