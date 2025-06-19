

import { ResourceType, PotionDefinition, PotionEffectDefinition, HeroStats } from '../types';

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
        modifierType: 'PERCENTAGE_ADDITIVE', // Corrected from 'PERCENTAGE'
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
  // Permanent Potions
  'PERMANENT_HP_ELIXIR_1': {
    id: 'PERMANENT_HP_ELIXIR_1',
    name: 'Minor Elixir of Vitality',
    description: 'Permanently increases maximum HP by a small amount. Becomes more expensive to craft each time.',
    iconName: 'HEALTH_POTION',
    isPermanent: true,
    permanentStatBonuses: [{ stat: 'maxHp' as keyof HeroStats, value: 10, isPercentage: false }],
    costs: [], // Added missing property
    baseCostForPermanentPotion: [
      { resource: ResourceType.HERB_BLOODTHISTLE, amount: 20 },
      { resource: ResourceType.HERB_IRONWOOD_LEAF, amount: 10 },
      { resource: ResourceType.CRYSTALS, amount: 50 },
    ],
    costScalingFactorPerCraft: 1.3,
    researchUnlockId: 'UNLOCK_PERMANENT_POTIONS_MINOR',
    effects: [], // No temporary effects
    baseCraftTimeMs: 0, // Instantly applied
  },
  'PERMANENT_DAMAGE_ELIXIR_1': {
    id: 'PERMANENT_DAMAGE_ELIXIR_1',
    name: 'Minor Elixir of Power',
    description: 'Permanently increases base damage by a small amount. Becomes more expensive to craft each time.',
    iconName: 'STRENGTH_POTION',
    isPermanent: true,
    permanentStatBonuses: [{ stat: 'damage' as keyof HeroStats, value: 2, isPercentage: false }],
    costs: [], // Added missing property
    baseCostForPermanentPotion: [
      { resource: ResourceType.HERB_BLOODTHISTLE, amount: 15 },
      { resource: ResourceType.AETHERIUM, amount: 1 },
      { resource: ResourceType.CRYSTALS, amount: 75 },
    ],
    costScalingFactorPerCraft: 1.35,
    researchUnlockId: 'UNLOCK_PERMANENT_POTIONS_MINOR',
    effects: [],
    baseCraftTimeMs: 0,
  },
  'PERMANENT_DEFENSE_ELIXIR_1': {
    id: 'PERMANENT_DEFENSE_ELIXIR_1',
    name: 'Minor Elixir of Resilience',
    description: 'Permanently increases defense by a small amount. Becomes more expensive to craft each time.',
    iconName: 'DEFENSE_POTION',
    isPermanent: true,
    permanentStatBonuses: [{ stat: 'defense' as keyof HeroStats, value: 1, isPercentage: false }],
    costs: [], // Added missing property
    baseCostForPermanentPotion: [
      { resource: ResourceType.HERB_IRONWOOD_LEAF, amount: 25 },
      { resource: ResourceType.STONE, amount: 250 },
      { resource: ResourceType.IRON, amount: 100 },
    ],
    costScalingFactorPerCraft: 1.25,
    researchUnlockId: 'UNLOCK_PERMANENT_POTIONS_ADVANCED', // Example: requires different research
    effects: [],
    baseCraftTimeMs: 0,
  },
};