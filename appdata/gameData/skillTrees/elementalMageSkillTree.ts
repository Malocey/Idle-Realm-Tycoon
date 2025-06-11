
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
      {
        id: 'MAGE_PASSIVE_ELEMENTALDISCHARGE_01', name: 'Elemental Discharge',
        description: (level) => `On Spell Cast: ${(8 + level * 2)}% chance to trigger an additional, smaller elemental explosion at the target location (Fire, Ice, Lightning depending on spell) for ${(20 + level * 5)}% of spell damage.`,
        iconName: 'ATOM_ICON', maxLevel: 5,
        costPerLevel: (lvl) => ({ skillPoints: 1, resources: [{ resource: ResourceType.CRYSTALS, amount: (lvl + 1) * 10 }] }),
        prerequisites: [{ skillId: 'EMSK_SA_FIREBALL', level: 1 }], position: { x: 2, y: 1 }, 
        isPassiveEffect: true, statBonuses: () => ({})
      },
      {
        id: 'MAGE_PASSIVE_ARCANEABSORPTION_01', name: 'Arcane Absorption',
        description: (level) => `On Magical Damage Taken: ${(5 + level * 1)}% chance to regain ${(15 + level * 5)}% of the magical damage taken as Mana.`,
        iconName: 'SHIELD_BADGE', maxLevel: 5, 
        costPerLevel: (lvl) => ({ skillPoints: 1, heroicPointsCost: 80 + lvl * 22 }),
        prerequisites: [{ skillId: 'EMSK002', level: 2 }], position: { x: 2, y: 0 },
        isPassiveEffect: true, statBonuses: () => ({})
      },
      {
        id: 'MAGE_PASSIVE_UNSTABLEMAGIC_01', name: 'Unstable Magic',
        description: (level) => `On Spell Cast: ${(3 + level * 1)}% chance for the spell to have no Mana cost, but its cooldown is increased by ${(30 - level * 2)}%.`,
        iconName: 'WIZARD_HAT', maxLevel: 5,
        costPerLevel: (lvl) => ({ skillPoints: 1, resources: [{ resource: ResourceType.AETHERIUM, amount: Math.max(1, 1 + Math.floor(lvl/2)) }] }),
        prerequisites: [{ skillId: 'EMSK_SA_FIREBALL', level: 2 }], position: { x: 0, y: 2 },
        isPassiveEffect: true, statBonuses: () => ({})
      },
    ] as SkillNodeDefinition[],
};
