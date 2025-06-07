
import { ResourceType, SkillTreeDefinition, SkillNodeDefinition, CalculatedSpecialAttackData } from '../../types';
import { SPECIAL_ATTACK_DEFINITIONS } from '../specialAttackDefinitions';
import { calculateSpecialAttackData } from '../../utils';

export const ELEMENTAL_MAGE_SKILL_TREE_DEFINITION: SkillTreeDefinition = {
    id: 'ELEMENTAL_MAGE_SKILLS',
    nodes: [
      {
        id: 'EMSK001', name: 'Arcane Intellect',
        description: (level) => `Increases Max Mana by ${level * 20}.`,
        iconName: 'CRYSTALS', maxLevel: 10,
        costPerLevel: (lvl) => ({ skillPoints: 1, resources: [{resource: ResourceType.GOLD, amount: (lvl+1)*25}]}),
        statBonuses: (lvl) => ({ maxMana: lvl * 20 }),
        prerequisites: [], position: { x: 0, y: 0 }
      },
      {
        id: 'EMSK002', name: 'Mana Flow',
        description: (level) => `Increases Mana Regeneration by ${(level * 0.25).toFixed(2)}/s.`,
        iconName: 'CRYSTALS', maxLevel: 10,
        costPerLevel: (lvl) => ({ skillPoints: 1, resources: [{resource: ResourceType.CRYSTALS, amount: (lvl+1)*5}]}),
        statBonuses: (lvl) => ({ manaRegen: lvl * 0.25 }),
        prerequisites: [{ skillId: 'EMSK001', level: 2 }], position: { x: 1, y: 0 }
      },
      {
        id: 'EMSK003', name: 'Spell Power',
        description: (level) => `Increases Spell Damage (base damage stat) by ${level * 3}.`,
        iconName: 'ATOM_ICON', maxLevel: 10,
        costPerLevel: (lvl) => ({ skillPoints: 1, resources: [{resource: ResourceType.GOLD, amount: (lvl+1)*30}]}),
        statBonuses: (lvl) => ({ damage: lvl * 3 }),
        prerequisites: [], position: { x: 0, y: 1 }
      },
      {
        id: 'EMSK_SA_FIREBALL', specialAttackId: 'ELEMENTALIST_FIREBALL', name: 'Learn Fireball',
        description: (level, data) => {
            const saDef = SPECIAL_ATTACK_DEFINITIONS['ELEMENTALIST_FIREBALL'];
            if (!saDef) return "Error: Special attack not found.";
            const saData = data as CalculatedSpecialAttackData;
            if (level === 0 && saData?.currentDamageMultiplier !== undefined) {
                 return `Unlocks Fireball. ${saDef.description(1, saData)}`;
            } else if (level > 0 && saData?.currentDamageMultiplier !== undefined) {
                const currentDesc = saDef.description(level, saData);
                let nextLevelDesc = "";
                if ((saDef.maxLevel === -1 || level < saDef.maxLevel) && saData.nextLevelDamageMultiplier !== undefined) {
                     nextLevelDesc = ` Next Lvl: ${(saData.nextLevelDamageMultiplier * 100).toFixed(0)}% Dmg, Mana: ${saData.nextLevelManaCost}, ${(saData.nextLevelCooldownMs! / 1000).toFixed(1)}s CD.`;
                }
                 return `${currentDesc}${nextLevelDesc}`;
            }
            const initialCalcData = calculateSpecialAttackData(saDef, 1);
            return `Learn Fireball. ${saDef.description(1, initialCalcData)}`;
        },
        iconName: 'ATOM_ICON', maxLevel: SPECIAL_ATTACK_DEFINITIONS['ELEMENTALIST_FIREBALL'].maxLevel,
        costPerLevel: (lvl) => ({ heroicPointsCost: SPECIAL_ATTACK_DEFINITIONS['ELEMENTALIST_FIREBALL'].costBase + lvl * SPECIAL_ATTACK_DEFINITIONS['ELEMENTALIST_FIREBALL'].costIncreasePerLevel }),
        prerequisites: [{ skillId: 'EMSK003', level: 1 }], position: { x: 1, y: 1 },
        statBonuses: () => ({})
      },
    ] as SkillNodeDefinition[],
};