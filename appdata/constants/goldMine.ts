
import { ResourceType } from '../types';

export const BASE_GOLD_MINE_GRID_ROWS = 10; // Base size at depth 1
export const BASE_GOLD_MINE_GRID_COLS = 10; // Base size at depth 1
export const ROW_INCREASE_PER_DEPTH = 1; // How many rows to add per depth level beyond 1
export const COL_INCREASE_PER_DEPTH = 1; // How many columns to add per depth level beyond 1
export const MAX_GOLD_MINE_DEPTH = 10; // Max depth player can reach/unlock

export const STAMINA_COST_PER_MOVE = 1;
export const STAMINA_COST_PER_MINE_ACTION = 5;

export const INITIAL_MINING_SPEED = 1;
export const INITIAL_STAMINA = 100;
export const INITIAL_FOG_OF_WAR_RADIUS = 2;

export const INITIAL_GOLD_MINE_PLAYER_STATS = {
    miningSpeed: INITIAL_MINING_SPEED,
    maxStamina: INITIAL_STAMINA,
    fogOfWarRadius: INITIAL_FOG_OF_WAR_RADIUS,
};

// Base Probabilities for resource generation in the grid at depth 1
export const BASE_GOLD_ORE_CHANCE = 0.06;
export const BASE_DIAMOND_ORE_CHANCE = 0.02;
export const BASE_OBSTACLE_CHANCE = 0.12;
export const BASE_STONE_PATCH_CHANCE = 0.18;

// Scaling factors for probabilities per depth level (additive)
export const GOLD_ORE_CHANCE_PER_DEPTH_INCREASE = 0.005; // Increases chance of gold
export const DIAMOND_ORE_CHANCE_PER_DEPTH_INCREASE = 0.003; // Increases chance of diamond
export const OBSTACLE_CHANCE_PER_DEPTH_INCREASE = 0.002; // Slightly more obstacles deeper

// Minimum depths for certain resources
export const MIN_DEPTH_FOR_GOLD_ORE_INCREASE = 2; // Gold ore chance starts increasing from this depth
export const MIN_DEPTH_FOR_DIAMOND_ORE = 3;    // Diamonds only start appearing from this depth

// Hardness values for different cell types
export const HARDNESS_DIRT_BASE = 1;
export const HARDNESS_DIRT_PER_DEPTH = 0.2; // Dirt gets slightly harder
export const HARDNESS_STONE_BASE = 3;
export const HARDNESS_STONE_PER_DEPTH = 0.5; // Stone gets harder
export const HARDNESS_GOLD_ORE_BASE = 5;
export const HARDNESS_GOLD_ORE_PER_DEPTH = 1;
export const HARDNESS_DIAMOND_ORE_BASE = 8;
export const HARDNESS_DIAMOND_ORE_PER_DEPTH = 1.5;


export const RESOURCE_POPUP_DURATION_MS = 1500;

// Upgrade Type Constants
export const GOLD_MINE_UPGRADE_TYPE_MAX_STAMINA = 'GM_MAX_STAMINA';
export const GOLD_MINE_UPGRADE_TYPE_MINING_SPEED = 'GM_MINING_SPEED';
export const GOLD_MINE_UPGRADE_TYPE_SIGHT_RADIUS = 'GM_SIGHT_RADIUS';
export const GOLD_MINE_UPGRADE_TYPE_STAMINA_EFFICIENCY = 'GM_STAMINA_EFFICIENCY';
export const GOLD_MINE_UPGRADE_TYPE_LUCK = 'GM_LUCK';
