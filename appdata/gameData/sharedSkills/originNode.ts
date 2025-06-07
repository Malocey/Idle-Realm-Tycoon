
import { SharedSkillDefinition, HeroStats, ResourceType } from '../../types';

export const ORIGIN_NODE: SharedSkillDefinition = {
  id: 'SHARED_ORIGIN',
  name: 'Core Potential',
  description: () => "The wellspring of shared power, empowering all heroes. This node is always active.",
  iconName: 'ATOM_ICON',
  maxMajorLevels: 1,
  minorLevelsPerMajorTier: [0],
  costSharedSkillPointsPerMajorLevel: [0],
  costHeroXpPoolPerMinorLevel: () => 0,
  effects: [],
  position: { x: 2, y: 2 },
  isPassiveEffect: true,
  nodeSize: 'large',
};
