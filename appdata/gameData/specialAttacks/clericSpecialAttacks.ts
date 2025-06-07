
import { ResourceType, SpecialAttackDefinition, SpecialAttackTargetType, CalculatedSpecialAttackData } from '../../types';

const CLERIC_CIRCLE_OF_HEALING_DEFINITION: SpecialAttackDefinition = {
    id: 'CLERIC_CIRCLE_OF_HEALING',
    name: 'Circle of Healing',
    description: (level, data) => `Heals all allies for ${(data.currentHealAmount || 0).toFixed(0)} HP. Mana: ${data.currentManaCost}. Cooldown: ${(data.currentCooldownMs / 1000).toFixed(1)}s.`,
    iconName: 'CHECK_CIRCLE', 
    cooldownBaseMs: 20000,
    cooldownReductionPerLevelMs: 1000,
    targetType: SpecialAttackTargetType.ALL_ALLIES,
    effects: [{
      damageMultiplierBase: 0, 
      damageMultiplierIncreasePerLevel: 0,
      numHitsBase: 1, 
      numHitsIncreasePerLevel: 0,
      healAmountBase: 20, 
      healAmountIncreasePerLevel: 5, 
    }],
    maxLevel: 5,
    costResource: ResourceType.HEROIC_POINTS,
    costBase: 100,
    costIncreasePerLevel: 40,
    manaCostBase: 25,
    manaCostIncreasePerLevel: 3,
};

export const CLERIC_SPECIAL_ATTACKS: Record<string, SpecialAttackDefinition> = {
    'CLERIC_CIRCLE_OF_HEALING': CLERIC_CIRCLE_OF_HEALING_DEFINITION,
};
