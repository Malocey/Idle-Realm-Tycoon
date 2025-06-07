import { ResourceType } from '../enums';
import { Cost } from '../common';

export interface GoldMineMinigameGridCell {
  type: ResourceType.EMPTY | ResourceType.DIRT | ResourceType.STONE | ResourceType.GOLD_ORE | ResourceType.DIAMOND_ORE | ResourceType.OBSTACLE | 'EXIT_SHAFT';
  isRevealed: boolean;
  hardness: number;
  currentHp: number;
}

export interface GoldMinePopupEvent {
    id: string;
    text: string;
    r: number;
    c: number;
    color: string;
    timestamp: number;
}

export interface GoldMinePlayerStats {
    miningSpeed: number;
    maxStamina: number;
    fogOfWarRadius: number;
    // Add other stats like luck, staminaCostModifier, etc.
}

export interface GoldMineUpgradeEffect {
    stat: keyof GoldMinePlayerStats;
    value: number; // Can be flat or percentage, interpretation depends on upgrade logic
    isPercentage?: boolean; // If true, value is treated as e.g., 0.1 for +10%
}

export interface GoldMineUpgradeDefinition {
  id: string; // e.g., 'GM_MAX_STAMINA'
  name: string;
  description: (currentLevel: number, effectValue: number) => string;
  iconName: string;
  maxLevel: number;
  cost: (currentLevel: number) => Cost[];
  effects: GoldMineUpgradeEffect[];
}

export interface GoldMineMinigameState {
  status: 'IDLE_AT_SURFACE' | 'MINING_IN_PROGRESS' | 'FATIGUED_RETURN_TO_SURFACE';
  grid: GoldMineMinigameGridCell[][];
  gridRows: number;
  gridCols: number;
  playerGridPos: { r: number; c: number };
  currentStamina: number;
  playerStats: GoldMinePlayerStats;
  currentDepth: number;
  maxUnlockedDepth: number; // New: Tracks the deepest level the player has successfully completed or reached
  resourcesCollectedThisRun: Partial<Record<ResourceType, number>>;
  permanentUpgradeLevels: Record<string, number>; 
  popupEvents: GoldMinePopupEvent[];
  runStartTime: number | null;
  totalTimeInMineSeconds: number;
  mineshaftExitPos?: { r: number; c: number };
}
