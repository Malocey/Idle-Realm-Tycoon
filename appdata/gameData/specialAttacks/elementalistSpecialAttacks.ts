
import { ResourceType, SpecialAttackDefinition, SpecialAttackTargetType, CalculatedSpecialAttackData } from '../../types';

const ELEMENTALIST_FIREBALL_DEFINITION: SpecialAttackDefinition = {
    id: 'ELEMENTALIST_FIREBALL',
    name: 'Fireball',
    description: (level, data) => `Hurls a ball of fire at a single enemy, dealing ${(data.currentDamageMultiplier * 100).toFixed(0)}% of Attack Damage. Mana: ${data.currentManaCost}. Cooldown: ${(data.currentCooldownMs / 1000).toFixed(1)}s.`,
    iconName: 'ATOM_ICON',
    cooldownBaseMs: 8000,
    cooldownReductionPerLevelMs: 250,
    targetType: SpecialAttackTargetType.SINGLE_ENEMY,
    effects: [{
      damageMultiplierBase: 1.2, 
      damageMultiplierIncreasePerLevel: 0.2,
      numHitsBase: 1,
      numHitsIncreasePerLevel: 0,
    }],
    maxLevel: 10,
    costResource: ResourceType.HEROIC_POINTS,
    costBase: 60,
    costIncreasePerLevel: 30,
    manaCostBase: 12,
    manaCostIncreasePerLevel: 1,
};

export const ELEMENTALIST_SPECIAL_ATTACKS: Record<string, SpecialAttackDefinition> = {
    'ELEMENTALIST_FIREBALL': ELEMENTALIST_FIREBALL_DEFINITION,
};
