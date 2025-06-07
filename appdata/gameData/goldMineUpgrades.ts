
import { GoldMineUpgradeDefinition, ResourceType } from '../types';
import {
  GOLD_MINE_UPGRADE_TYPE_MAX_STAMINA,
  GOLD_MINE_UPGRADE_TYPE_MINING_SPEED,
  GOLD_MINE_UPGRADE_TYPE_SIGHT_RADIUS,
  GOLD_MINE_UPGRADE_TYPE_STAMINA_EFFICIENCY,
  GOLD_MINE_UPGRADE_TYPE_LUCK
} from '../constants';

export const GOLD_MINE_UPGRADE_DEFINITIONS: Record<string, GoldMineUpgradeDefinition> = {
  [GOLD_MINE_UPGRADE_TYPE_MAX_STAMINA]: {
    id: GOLD_MINE_UPGRADE_TYPE_MAX_STAMINA,
    name: 'Reinforced Stamina',
    description: (level, effectValue) => `Increases maximum stamina by ${effectValue}. Currently: +${effectValue * level}`,
    iconName: 'HERO',
    maxLevel: 20,
    cost: (level) => [
      { resource: ResourceType.DIRT, amount: 100 + level * 50 },
      { resource: ResourceType.STONE, amount: 50 + level * 25 },
    ],
    effects: [{ stat: 'maxStamina', value: 10 }],
  },
  [GOLD_MINE_UPGRADE_TYPE_MINING_SPEED]: {
    id: GOLD_MINE_UPGRADE_TYPE_MINING_SPEED,
    name: 'Sharpened Pickaxe',
    description: (level, effectValue) => `Increases mining speed by ${effectValue}. Currently: +${effectValue * level}`,
    iconName: 'PICKAXE_ICON',
    maxLevel: 15,
    cost: (level) => [
      { resource: ResourceType.STONE, amount: 150 + level * 75 },
      { resource: ResourceType.GOLD_ORE, amount: 5 + level * 3 },
    ],
    effects: [{ stat: 'miningSpeed', value: 1 }],
  },
  [GOLD_MINE_UPGRADE_TYPE_SIGHT_RADIUS]: {
    id: GOLD_MINE_UPGRADE_TYPE_SIGHT_RADIUS,
    name: 'Durable Lantern',
    description: (level, effectValue) => `Increases sight radius by ${effectValue}. Currently: +${effectValue * level}`,
    iconName: 'COMPASS',
    maxLevel: 5,
    cost: (level) => [
      { resource: ResourceType.WOOD, amount: 75 + level * 30 }, // Wood still makes sense for lanterns
      { resource: ResourceType.DIAMOND_ORE, amount: 2 + level * 1 },
    ],
    effects: [{ stat: 'fogOfWarRadius', value: 1 }],
  },
  [GOLD_MINE_UPGRADE_TYPE_STAMINA_EFFICIENCY]: {
    id: GOLD_MINE_UPGRADE_TYPE_STAMINA_EFFICIENCY,
    name: 'Efficient Mining Techniques',
    description: (level, effectValue) => `Reduces stamina cost of mining actions by ${effectValue * 100}%. Currently: -${(effectValue * level * 100).toFixed(0)}%`,
    iconName: 'SETTINGS',
    maxLevel: 10,
    cost: (level) => [
      { resource: ResourceType.DIRT, amount: 200 + level * 100 },
      { resource: ResourceType.GOLD_ORE, amount: 10 + level * 5 },
    ],
    // This is a conceptual effect. The actual stamina cost reduction will be handled in the mining logic,
    // potentially by checking this upgrade level and applying a multiplier to base costs.
    // For now, linking to maxStamina as a placeholder; actual implementation needs specific logic.
    effects: [{ stat: 'maxStamina', value: 0.02, isPercentage: true }], 
  },
  [GOLD_MINE_UPGRADE_TYPE_LUCK]: {
    id: GOLD_MINE_UPGRADE_TYPE_LUCK,
    name: 'Prospector\'s Luck',
    description: (level, effectValue) => `Increases chance of finding rare ores by ${effectValue * 100}%. Currently: +${(effectValue * level * 100).toFixed(1)}%`,
    iconName: 'STAR_INDICATOR_ICON',
    maxLevel: 10,
    cost: (level) => [
      { resource: ResourceType.GOLD_ORE, amount: 20 + level * 10 },
      { resource: ResourceType.DIAMOND_ORE, amount: 5 + level * 2 },
    ],
    // This is also conceptual for the 'effects' array. Actual luck implemented in grid generation/mining.
    // Placeholder effect:
    effects: [{ stat: 'miningSpeed', value: 0.005, isPercentage: true }], 
  },
};
