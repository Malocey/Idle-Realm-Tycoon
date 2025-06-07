
import { ResourceType, SkillTreeDefinition, SkillNodeDefinition, CalculatedSpecialAttackData } from '../../types';
import { SPECIAL_ATTACK_DEFINITIONS } from '../specialAttackDefinitions';
import { calculateSpecialAttackData } from '../../utils';

export const CLERIC_SKILL_TREE_DEFINITION: SkillTreeDefinition = {
    id: 'CLERIC_SKILLS',
    nodes: [
      { id: 'CSK001', name: 'Minor Blessing', description: (level) => `The Cleric's basic actions become healing spells. Increases base heal amount by ${level * 1}.`, iconName: 'STAFF_ICON', maxLevel: 10, costPerLevel: (lvl) => ({ skillPoints: 1, resources: [{resource: ResourceType.FOOD, amount: (lvl+1)*5}] }), statBonuses: (lvl) => ({ healPower: lvl * 1 }), prerequisites: [], position: { x: 0, y: 0 }, isPassiveEffect: true },
      { id: 'CSK002', name: 'Improved Mending', description: (level) => `Further increases healing effectiveness by ${level * 2}.`, iconName: 'STAFF_ICON', maxLevel: 5, costPerLevel: (lvl) => ({ skillPoints: 1, heroicPointsCost: 50 + lvl * 20 }), statBonuses: (lvl) => ({ healPower: lvl * 2 }), prerequisites: [{skillId: 'CSK001', level: 3}], position: { x: 1, y: 0 } },
      { id: 'CSK003', name: 'Divine Resilience', description: (level) => `Increases the Cleric's Max HP by ${level * 10} and Defense by ${level * 1}.`, iconName: 'SHIELD', maxLevel: 10, costPerLevel: (lvl) => ({ skillPoints: 1, resources: [{resource: ResourceType.LEATHER, amount: (lvl+1)*8}]}), statBonuses: (lvl) => ({ maxHp: lvl * 10, defense: lvl * 1}), prerequisites: [], position: { x: 0, y: 2 }},
      { id: 'CSK004', name: 'Greater Blessing', description: (level) => `Significantly enhances Heal Power by ${level * 2}.`, iconName: 'STAFF_ICON', maxLevel: 5, costPerLevel: (lvl) => ({ skillPoints: 2, heroicPointsCost: 100 + lvl * 40, resources: [{resource: ResourceType.CRYSTALS, amount: (lvl+1)*5}]}), statBonuses: (lvl) => ({ healPower: lvl * 2 }), prerequisites: [{skillId: 'CSK002', level: 2}], position: { x: 2, y: 0 }},
      { id: 'CSK005', name: 'Mana Spring', description: (level) => `Increases Max Mana by ${level * 10}.`, iconName: 'CRYSTALS', maxLevel: 5, costPerLevel: (lvl) => ({ skillPoints: 1, resources: [{resource: ResourceType.GOLD, amount: (lvl+1)*20}] }), statBonuses: (lvl) => ({ maxMana: lvl * 10 }), prerequisites: [], position: { x: 0, y: 1 }},
      { id: 'CSK006', name: 'Improved Mana Spring', description: (level) => `Increases Mana Regeneration by ${ (level * 0.2).toFixed(1)}/sec.`, iconName: 'CRYSTALS', maxLevel: 5, costPerLevel: (lvl) => ({ skillPoints: 1, heroicPointsCost: 60 + lvl * 25 }), statBonuses: (lvl) => ({ manaRegen: lvl * 0.2 }), prerequisites: [{skillId: 'CSK005', level: 2}], position: { x: 1, y: 1 }},
      {
        id: 'CSK_XP_POTENCY', name: 'Potent Mending',
        description: (level) => `Erhöht die Heilkraft zusätzlich um ${level * 2}. (Kostet Heroische Punkte)`,
        iconName: 'STAFF_ICON', maxLevel: 10,
        costPerLevel: (lvl) => ({ heroicPointsCost: 75 + lvl * 30, resources: [{resource: ResourceType.CRYSTALS, amount: (lvl+1)*10}] }),
        statBonuses: (lvl) => ({ healPower: lvl * 2 }),
        prerequisites: [{ skillId: 'CSK004', level: 2 }], position: { x: 3, y: 0 }
      },
      {
        id: 'CSK_SA_CIRCLE_OF_HEALING', specialAttackId: 'CLERIC_CIRCLE_OF_HEALING', name: 'Learn Circle of Healing',
        description: (level, data) => {
            const saDef = SPECIAL_ATTACK_DEFINITIONS['CLERIC_CIRCLE_OF_HEALING'];
            if (!saDef) return "Error: Special attack not found.";
            const saData = data as CalculatedSpecialAttackData;
            if (level === 0 && saData?.currentHealAmount !== undefined) {
                 return `Unlocks Circle of Healing. ${saDef.description(1, saData)}`;
            } else if (level > 0 && saData?.currentHealAmount !== undefined) {
                const currentDesc = saDef.description(level, saData);
                let nextLevelDesc = "";
                if ((saDef.maxLevel === -1 || level < saDef.maxLevel) && saData.nextLevelHealAmount !== undefined) {
                     nextLevelDesc = ` Next Lvl: Heals ${saData.nextLevelHealAmount}, Mana: ${saData.nextLevelManaCost}, ${(saData.nextLevelCooldownMs! / 1000).toFixed(1)}s CD.`;
                }
                 return `${currentDesc}${nextLevelDesc}`;
            }
            const initialCalcData = calculateSpecialAttackData(saDef, 1);
            return `Learn Circle of Healing. ${saDef.description(1, initialCalcData)}`;
        },
        iconName: 'CHECK_CIRCLE', maxLevel: SPECIAL_ATTACK_DEFINITIONS['CLERIC_CIRCLE_OF_HEALING'].maxLevel,
        costPerLevel: (lvl) => ({ heroicPointsCost: SPECIAL_ATTACK_DEFINITIONS['CLERIC_CIRCLE_OF_HEALING'].costBase + lvl * SPECIAL_ATTACK_DEFINITIONS['CLERIC_CIRCLE_OF_HEALING'].costIncreasePerLevel }),
        prerequisites: [{ skillId: 'CSK006', level: 3 }], position: { x: 2, y: 1 },
        statBonuses: () => ({})
      },
      {
        id: 'CSK_XP_VITALITY', name: 'Divine Vigor',
        description: (level) => `Erhöht Max. HP des Klerikers um ${level * 15} und Verteidigung um ${level * 1}. (Kostet Heroische Punkte)`,
        iconName: 'SHIELD', maxLevel: 10,
        costPerLevel: (lvl) => ({ heroicPointsCost: 60 + lvl * 25, resources: [{resource: ResourceType.FOOD, amount: (lvl+1)*15}] }),
        statBonuses: (lvl) => ({ maxHp: lvl * 15, defense: lvl * 1 }),
        prerequisites: [{ skillId: 'CSK003', level: 3 }], position: { x: 1, y: 2 }
      },
      {
        id: 'CSK_PASSIVE_REGEN', name: 'Blessed Renewal',
        description: (level) => `Regeneriert passiv ${level * 2} HP pro Sekunde im Kampf.`,
        iconName: 'HERO', maxLevel: 5,
        costPerLevel: (lvl) => ({ skillPoints: 1, resources: [{resource: ResourceType.GOLD, amount: (lvl+1)*100}] }),
        statBonuses: (lvl) => ({ hpRegen: lvl * 2 }),
        prerequisites: [{ skillId: 'CSK_XP_VITALITY', level: 2 }], position: { x: 2, y: 2 }
      }
    ] as SkillNodeDefinition[],
};