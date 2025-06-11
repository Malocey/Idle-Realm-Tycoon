
import { ResourceType, SkillTreeDefinition, SkillNodeDefinition, CalculatedSpecialAttackData } from '../../types';
import { SPECIAL_ATTACK_DEFINITIONS } from '../specialAttackDefinitions';
import { calculateSpecialAttackData } from '../../utils';

export const ARCHER_SKILL_TREE_DEFINITION: SkillTreeDefinition = {
    id: 'ARCHER_SKILLS',
    nodes: [
      { id: 'ASK001', name: 'Piercing Shot', description: (level) => `Increases base damage by ${level * 2}.`, iconName: 'SWORD', maxLevel: -1, costPerLevel: (lvl) => ({ skillPoints: 1 + Math.floor(lvl / 5) }), statBonuses: (lvl) => ({ damage: lvl * 2 }), prerequisites: [], position: { x: 0, y: 0 } },
      { id: 'ASK002', name: 'Swiftness', description: (level) => `Increases attack speed by ${ (level * 0.1).toFixed(2)}.`, iconName: 'HERO', maxLevel: -1, costPerLevel: (lvl) => ({ skillPoints: 1 + Math.floor(lvl / 4) }), statBonuses: (lvl) => ({ attackSpeed: lvl * 0.1 }), prerequisites: [], position: { x: 0, y: 1 } },
      { id: 'ASK003', name: 'Elemental Arrows', description: (level) => `Increases damage by ${level * 2}.`, iconName: 'MAGIC_ARROW', maxLevel: -1, costPerLevel: (lvl) => ({ skillPoints: 2 + Math.floor(lvl/4), resources: [{resource: ResourceType.CRYSTALS, amount: (lvl+1)*5}, {resource: ResourceType.WOOD, amount: (lvl+1)*10}] }), statBonuses: (lvl) => ({ damage: lvl * 2 }), prerequisites: [{ skillId: 'ASK001', level: 3 }], position: { x: 1, y: 0 } },
      { id: 'ASK004', name: 'Evasion', description: (level) => `Increases crit chance by ${(level * 0.005 * 100).toFixed(1)}%.`, iconName: 'WIND_SLASH', maxLevel: -1, costPerLevel: (lvl) => ({ skillPoints: 1 + Math.floor(lvl/3), resources: [{resource: ResourceType.FOOD, amount: (lvl+1)*15}] }), statBonuses: (lvl) => ({ critChance: lvl * 0.005 }), prerequisites: [{ skillId: 'ASK002', level: 3 }], position: { x: 1, y: 2 } },
      {
        id: 'ASK_SA001', specialAttackId: 'ARCHER_ARROW_RAIN', name: 'Learn Arrow Rain',
        description: (level, data) => {
            const saDef = SPECIAL_ATTACK_DEFINITIONS['ARCHER_ARROW_RAIN'];
            if (!saDef) return "Error: Special attack not found.";
            const saData = data as CalculatedSpecialAttackData;
             if (level === 0 && saData?.currentDamageMultiplier !== undefined) {
                 return `Unlocks Arrow Rain. ${saDef.description(1, saData)}`;
            } else if (level > 0 && saData?.currentDamageMultiplier !== undefined) {
                const currentDesc = saDef.description(level, saData);
                let nextLevelDesc = "";
                 if ((saDef.maxLevel === -1 || level < saDef.maxLevel) && saData.nextLevelDamageMultiplier !== undefined) {
                     nextLevelDesc = ` Next Lvl: ${saData.nextLevelNumHits} hits at ${(saData.nextLevelDamageMultiplier * 100).toFixed(0)}% Dmg, Mana: ${saData.nextLevelManaCost}, ${(saData.nextLevelCooldownMs! / 1000).toFixed(1)}s CD.`;
                }
                 return `${currentDesc}${nextLevelDesc}`;
            }
            const initialCalcData = calculateSpecialAttackData(saDef, 1);
            return `Learn Arrow Rain. ${saDef.description(1, initialCalcData)}`;
        },
        iconName: 'ARROW_RAIN_ICON', maxLevel: SPECIAL_ATTACK_DEFINITIONS['ARCHER_ARROW_RAIN'].maxLevel,
        costPerLevel: (lvl) => ({ heroicPointsCost: SPECIAL_ATTACK_DEFINITIONS['ARCHER_ARROW_RAIN'].costBase + lvl * SPECIAL_ATTACK_DEFINITIONS['ARCHER_ARROW_RAIN'].costIncreasePerLevel }),
        prerequisites: [{ skillId: 'ASK001', level: 3 }], position: { x: 2, y: 0 },
        statBonuses: () => ({})
      },
      {
        id: 'ASK_SA_FOCUS_SHOT', specialAttackId: 'ARCHER_FOCUS_SHOT', name: 'Learn Focus Shot',
        description: (level, data) => {
            const saDef = SPECIAL_ATTACK_DEFINITIONS['ARCHER_FOCUS_SHOT'];
            if (!saDef) return "Error: Special attack not found.";
            const saData = data as CalculatedSpecialAttackData;
            if (level === 0 && saData?.currentDamageMultiplier !== undefined) {
                return `Unlocks Focus Shot. ${saDef.description(1, saData)}`;
            } else if (level > 0 && saData?.currentDamageMultiplier !== undefined) {
                const currentDesc = saDef.description(level, saData);
                let nextLevelDesc = "";
                if ((saDef.maxLevel === -1 || level < saDef.maxLevel) && saData.nextLevelDamageMultiplier !== undefined) {
                    nextLevelDesc = ` Next Lvl: ${(saData.nextLevelDamageMultiplier * 100).toFixed(0)}% Dmg, Mana: ${saData.nextLevelManaCost}, ${(saData.nextLevelCooldownMs! / 1000).toFixed(1)}s CD.`;
                }
                return `${currentDesc}${nextLevelDesc}`;
            }
            const initialCalcData = calculateSpecialAttackData(saDef, 1);
            return `Learn Focus Shot. ${saDef.description(1, initialCalcData)}`;
        },
        iconName: 'BOW_ICON', maxLevel: SPECIAL_ATTACK_DEFINITIONS['ARCHER_FOCUS_SHOT'].maxLevel,
        costPerLevel: (lvl) => ({ heroicPointsCost: SPECIAL_ATTACK_DEFINITIONS['ARCHER_FOCUS_SHOT'].costBase + lvl * SPECIAL_ATTACK_DEFINITIONS['ARCHER_FOCUS_SHOT'].costIncreasePerLevel }),
        prerequisites: [{ skillId: 'ASK003', level: 2 }], position: { x: 3, y: 0 },
        statBonuses: () => ({})
      },
      {
        id: 'ASK_XP_ATTACK_SPEED', name: 'Rapid Reload',
        description: (level) => `Increases attack speed by ${(level * 0.05).toFixed(2)}. (Uses Heroic Points)`,
        iconName: 'ARROW_RAIN_ICON', maxLevel: 10,
        costPerLevel: (lvl) => ({ heroicPointsCost: 60 + lvl * 25, resources: [{resource: ResourceType.WOOD, amount: (lvl+1)*20}] }),
        statBonuses: (lvl) => ({ attackSpeed: lvl * 0.05 }),
        prerequisites: [{ skillId: 'ASK002', level: 2 }], position: { x: 2, y: 1 }
      },
      {
        id: 'ASK_XP_CRIT_DAMAGE', name: 'Lethal Precision',
        description: (level) => `Increases critical hit damage by ${(level * 0.1 * 100).toFixed(0)}%. (Uses Heroic Points)`,
        iconName: 'SWORD', maxLevel: 10,
        costPerLevel: (lvl) => ({ heroicPointsCost: 70 + lvl * 30, resources: [{resource: ResourceType.CRYSTALS, amount: (lvl+1)*10}] }),
        statBonuses: (lvl) => ({ critDamage: lvl * 0.1 }),
        prerequisites: [{ skillId: 'ASK004', level: 2 }], position: { x: 2, y: 2 }
      },
      {
        id: 'ARCHER_PASSIVE_RICOCHET_01', name: 'Ricochet Shot',
        description: (level) => `On Attack: ${(10 + level * 2)}% chance for arrows to ricochet to a second target for ${(30 + level * 5)}% damage.`,
        iconName: 'MAGIC_ARROW', maxLevel: 5,
        costPerLevel: (lvl) => ({ skillPoints: 1, resources: [{ resource: ResourceType.WOOD, amount: (lvl + 1) * 15 }] }),
        prerequisites: [{ skillId: 'ASK003', level: 1 }], position: { x: 1, y: -1 }, 
        isPassiveEffect: true, statBonuses: () => ({})
      },
      {
        id: 'ARCHER_PASSIVE_RAPIDFIRE_01', name: 'Rapid Fire',
        description: (level) => `On Standard Attack: ${(5 + level * 1)}% chance to immediately fire another arrow (no mana cost).`,
        iconName: 'BOW_ICON', maxLevel: 5,
        costPerLevel: (lvl) => ({ skillPoints: 1, heroicPointsCost: 50 + lvl * 20 }),
        prerequisites: [{ skillId: 'ASK_XP_ATTACK_SPEED', level: 1 }], position: { x: 3, y: 1 },
        isPassiveEffect: true, statBonuses: () => ({})
      },
      {
        id: 'ARCHER_PASSIVE_CRIPPLESHOT_01', name: 'Crippling Shot',
        description: (level) => `On Standard Attack: ${(8 + level * 2)}% chance to reduce target's attack speed by ${(15 + level * 3)}% for 3s.`,
        iconName: 'WIND_SLASH', maxLevel: 5,
        costPerLevel: (lvl) => ({ skillPoints: 1, resources: [{ resource: ResourceType.LEATHER, amount: (lvl + 1) * 10 }] }),
        prerequisites: [{ skillId: 'ASK004', level: 1 }], position: { x: 1, y: 3 },
        isPassiveEffect: true, statBonuses: () => ({})
      },
    ] as SkillNodeDefinition[],
};
