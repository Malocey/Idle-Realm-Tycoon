
import { ResourceType, GlobalEffectTarget, HeroStats, TownHallUpgradeEffectType } from './index'; // Corrected import
import { Cost } from './common';
import { TownHallUpgradeEffectParams } from './upgrades'; // Re-use for consistency

export type ResearchCategory = 'Military' | 'Economic' | 'Exploration' | 'Special';

export interface ResearchEffectDefinition {
  // Similar to TownHallUpgradeEffectDefinition but might need more specific types later
  stat?: keyof HeroStats | keyof GlobalEffectTarget; // Can affect hero stats or global bonuses
  effectParams: TownHallUpgradeEffectParams; // Re-using existing structure
  // OR define specific effect types for research
  // e.g., unlockBuildingId?: string; unlockHeroId?: string;
  description: string; // Describes the effect of this specific part of the research
}

export interface ResearchDefinition {
  id: string;
  name: string;
  description: string; // General description of the research
  category: ResearchCategory;
  iconName: string;
  costPerLevel: (level: number) => Cost[]; // Geändert von costs: Cost[]
  researchTimeTicks: number; // Time in game ticks
  prerequisites: Array<{ researchId: string; level: number }>; // Other research needed
  effects: ResearchEffectDefinition[];
  maxLevel: number; // -1 for infinite, or a specific max level
  position?: { x: number; y: number }; 
}

export interface ResearchProgress {
  researchId: string;
  currentProgressTicks: number;
  targetTicks: number; // Total ticks needed for current level
  researchSlotId: number; // If multiple slots are implemented
  startTime?: number; // Optional: for real-time tracking if needed
  levelBeingResearched: number;
}

export interface CompletedResearchEntry {
    level: number;
    // Potentially store other info like completion date if needed
}