
import { ResourceType, SpecialAttackDefinition, SpecialAttackTargetType, CalculatedSpecialAttackData } from '../../types';

const PALADIN_DIVINE_STORM_DEFINITION: SpecialAttackDefinition = {
    id: 'PALADIN_DIVINE_STORM',
    name: 'Divine Storm',
    description: (level, data) => `Unleashes holy energy, hitting all enemies for ${(data.currentDamageMultiplier * 100).toFixed(0)}% of Attack Damage as holy damage. Mana: ${data.currentManaCost}. Cooldown: ${(data.currentCooldownMs / 1000).toFixed(1)}s.`,
    iconName: 'WHIRLWIND_ICON', 
    cooldownBaseMs: 22000,
    cooldownReductionPerLevelMs: 1200,
    targetType: SpecialAttackTargetType.ALL_ENEMIES,
    effects: [{
      damageMultiplierBase: 0.7,
      damageMultiplierIncreasePerLevel: 0.15,
      numHitsBase: 1,
      numHitsIncreasePerLevel: 0,
    }],
    maxLevel: 5,
    costResource: ResourceType.HEROIC_POINTS,
    costBase: 150,
    costIncreasePerLevel: 50,
    manaCostBase: 30,
    manaCostIncreasePerLevel: 4,
};

export const PALADIN_SPECIAL_ATTACKS: Record<string, SpecialAttackDefinition> = {
    'PALADIN_DIVINE_STORM': PALADIN_DIVINE_STORM_DEFINITION,
};
