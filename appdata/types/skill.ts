
import { Cost } from './common';
import { CalculatedSpecialAttackData, HeroStats } from './hero';
import { ResourceType } from './enums';

export interface SkillNodeDefinition {
  id: string;
  name: string;
  specialAttackId?: string;
  description: (level: number, nextLevelEffectOrData?: string | CalculatedSpecialAttackData | HeroStats) => string;
  iconName: string;
  maxLevel: number;
  costPerLevel: (currentLevel: number) => { skillPoints?: number, resources?: Cost[], heroicPointsCost?: number };
  prerequisites: Array<{ skillId: string, level: number }>;
  position?: { x: number; y: number };
  isPassiveEffect?: boolean;
  statBonuses?: (level: number) => Partial<HeroStats>;
}

export interface SkillTreeDefinition {
  id: string;
  nodes: SkillNodeDefinition[];
}