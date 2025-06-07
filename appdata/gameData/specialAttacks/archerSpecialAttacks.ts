
import { ResourceType, SpecialAttackDefinition, SpecialAttackTargetType, CalculatedSpecialAttackData } from '../../types';

const ARCHER_ARROW_RAIN_DEFINITION: SpecialAttackDefinition = {
    id: 'ARCHER_ARROW_RAIN',
    name: 'Arrow Rain',
    description: (level, data) => `Showers a random enemy with ${data.currentNumHits} arrows, each dealing ${(data.currentDamageMultiplier * 100).toFixed(0)}% of Attack Damage. Mana: ${data.currentManaCost}. Cooldown: ${(data.currentCooldownMs / 1000).toFixed(1)}s.`,
    iconName: 'ARROW_RAIN_ICON',
    cooldownBaseMs: 12000,
    cooldownReductionPerLevelMs: 400, 
    targetType: SpecialAttackTargetType.RANDOM_ENEMY,
    effects: [{
      damageMultiplierBase: 0.6, 
      damageMultiplierIncreasePerLevel: 0.05, 
      numHitsBase: 3,
      numHitsIncreasePerLevel: 0, 
    }],
    maxLevel: 10,
    costResource: ResourceType.HEROIC_POINTS,
    costBase: 40, 
    costIncreasePerLevel: 20, 
    manaCostBase: 10, 
    manaCostIncreasePerLevel: 1, 
};

const ARCHER_FOCUS_SHOT_DEFINITION: SpecialAttackDefinition = {
    id: 'ARCHER_FOCUS_SHOT',
    name: 'Focus Shot',
    description: (level, data) => `A powerful shot dealing ${(data.currentDamageMultiplier * 100).toFixed(0)}% damage. Has inherent bonus critical chance and damage. Mana: ${data.currentManaCost}. Cooldown: ${(data.currentCooldownMs / 1000).toFixed(1)}s.`,
    iconName: 'BOW_ICON', 
    cooldownBaseMs: 18000,
    cooldownReductionPerLevelMs: 800,
    targetType: SpecialAttackTargetType.SINGLE_ENEMY,
    effects: [{
      damageMultiplierBase: 1.5, 
      damageMultiplierIncreasePerLevel: 0.25,
      numHitsBase: 1,
      numHitsIncreasePerLevel: 0,
    }],
    maxLevel: 5,
    costResource: ResourceType.HEROIC_POINTS,
    costBase: 120,
    costIncreasePerLevel: 45,
    manaCostBase: 20,
    manaCostIncreasePerLevel: 2,
};

export const ARCHER_SPECIAL_ATTACKS: Record<string, SpecialAttackDefinition> = {
    'ARCHER_ARROW_RAIN': ARCHER_ARROW_RAIN_DEFINITION,
    'ARCHER_FOCUS_SHOT': ARCHER_FOCUS_SHOT_DEFINITION,
};
