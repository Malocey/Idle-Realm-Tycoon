
import { ResourceType, PotionDefinition, PotionEffectDefinition } from '../types';

export const POTION_DEFINITIONS: Record<string, PotionDefinition> = {
  'MINOR_HEALING_POTION': {
    id: 'MINOR_HEALING_POTION',
    name: 'Minor Healing Potion',
    description: 'Restores a small amount of HP to the user.',
    iconName: 'HEALTH_POTION',
    costs: [
      { resource: ResourceType.HERB_BLOODTHISTLE, amount: 1 },
      { resource: ResourceType.FOOD, amount: 5 },
    ],
    effects: [
      {
        type: 'INSTANT_HEAL',
        targetType: 'SELF',
        value: 50, // Heals 50 HP
      },
    ],
    baseCraftTimeMs: 30000, // 30 seconds
  },
  'MINOR_STRENGTH_POTION': {
    id: 'MINOR_STRENGTH_POTION',
    name: 'Minor Strength Potion',
    description: 'Temporarily increases damage.',
    iconName: 'STRENGTH_POTION',
    costs: [
      { resource: ResourceType.HERB_BLOODTHISTLE, amount: 1 },
      { resource: ResourceType.GOLD, amount: 10 },
    ],
    effects: [
      {
        type: 'TEMPORARY_STAT_MODIFIER',
        targetType: 'SELF',
        stat: 'damage',
        modifierType: 'PERCENTAGE',
        value: 0.1, // +10% damage
        durationMs: 60000, // 60 seconds
      },
    ],
    baseCraftTimeMs: 30000, // 30 seconds
  },
  'MINOR_DEFENSE_POTION': {
    id: 'MINOR_DEFENSE_POTION',
    name: 'Minor Steelskin Potion',
    description: 'Temporarily increases defense.',
    iconName: 'DEFENSE_POTION',
    costs: [
      { resource: ResourceType.HERB_IRONWOOD_LEAF, amount: 1 },
      { resource: ResourceType.STONE, amount: 10 },
    ],
    effects: [
      {
        type: 'TEMPORARY_STAT_MODIFIER',
        targetType: 'SELF',
        stat: 'defense',
        modifierType: 'FLAT',
        value: 5, // +5 defense
        durationMs: 60000, // 60 seconds
      },
    ],
    baseCraftTimeMs: 30000, // 30 seconds
  },
};
