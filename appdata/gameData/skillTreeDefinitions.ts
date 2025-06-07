import { SkillTreeDefinition } from '../types';
import { WARRIOR_SKILL_TREE_DEFINITION } from './skillTrees/warriorSkillTree';
import { ARCHER_SKILL_TREE_DEFINITION } from './skillTrees/archerSkillTree';
import { CLERIC_SKILL_TREE_DEFINITION } from './skillTrees/clericSkillTree';
import { PALADIN_SKILL_TREE_DEFINITION } from './skillTrees/paladinSkillTree';
import { ELEMENTAL_MAGE_SKILL_TREE_DEFINITION } from './skillTrees/elementalMageSkillTree';

export const SKILL_TREES: Record<string, SkillTreeDefinition> = {
  'WARRIOR_SKILLS': WARRIOR_SKILL_TREE_DEFINITION,
  'ARCHER_SKILLS': ARCHER_SKILL_TREE_DEFINITION,
  'CLERIC_SKILLS': CLERIC_SKILL_TREE_DEFINITION,
  'PALADIN_SKILLS': PALADIN_SKILL_TREE_DEFINITION,
  'ELEMENTAL_MAGE_SKILLS': ELEMENTAL_MAGE_SKILL_TREE_DEFINITION,
};
