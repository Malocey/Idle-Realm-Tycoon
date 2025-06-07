
import { ResourceType, SkillTreeDefinition, SkillNodeDefinition, CalculatedSpecialAttackData } from '../../types';
import { SPECIAL_ATTACK_DEFINITIONS } from '../specialAttackDefinitions';
import { calculateSpecialAttackData } from '../../utils';

export const WARRIOR_SKILL_TREE_DEFINITION: SkillTreeDefinition = {
    id: 'WARRIOR_SKILLS',
    nodes: [
      // Top Branch (Damage oriented from WSK001)
      {
        id: 'WSK001', name: 'Heavy Strike',
        description: (level) => `Increases base damage by ${level * 2}.`,
        iconName: 'SWORD', maxLevel: 10,
        costPerLevel: (lvl) => ({ skillPoints: 1, resources: [{ resource: ResourceType.GOLD, amount: (lvl + 1) * 10 }] }),
        statBonuses: (lvl) => ({ damage: lvl * 2 }),
        prerequisites: [], position: { x: 2, y: 1 }
      },
      {
        id: 'WSK005', name: 'Rend Armor',
        description: (level) => `Further increases damage by ${level * 3}.`,
        iconName: 'SWORD', maxLevel: 5,
        costPerLevel: (lvl) => ({ skillPoints: 1, resources: [{ resource: ResourceType.IRON, amount: (lvl + 1) * 10 + 20 }] }),
        statBonuses: (lvl) => ({ damage: lvl * 3 }),
        prerequisites: [{ skillId: 'WSK001', level: 2 }], position: { x: 2, y: 0 }
      },
      {
        id: 'WSK_XP_STRENGTH', name: 'Strength Conditioning',
        description: (level) => `Increases base damage by ${level * 1}. (Uses Heroic Points)`,
        iconName: 'SWORD', maxLevel: 20,
        costPerLevel: (lvl) => ({ heroicPointsCost: 50 + lvl * 25, resources: [{ resource: ResourceType.GOLD, amount: (lvl + 1) * 50 }] }),
        statBonuses: (lvl) => ({ damage: lvl * 1 }),
        prerequisites: [{ skillId: 'WSK005', level: 1 }], position: { x: 1, y: 0 }
      },
      {
        id: 'WSK_SA001', specialAttackId: 'WARRIOR_WHIRLWIND', name: 'Learn Whirlwind',
        description: (level, data) => {
            const saDef = SPECIAL_ATTACK_DEFINITIONS['WARRIOR_WHIRLWIND'];
            if (!saDef) return "Error: Special attack not found.";
            const saData = data as CalculatedSpecialAttackData;
             if (level === 0 && saData?.currentDamageMultiplier !== undefined) {
                 return `Unlocks Whirlwind. ${saDef.description(1, saData)}`;
            } else if (level > 0 && saData?.currentDamageMultiplier !== undefined) {
                const currentDesc = saDef.description(level, saData);
                let nextLevelDesc = "";
                 if ((saDef.maxLevel === -1 || level < saDef.maxLevel) && saData.nextLevelDamageMultiplier !== undefined) {
                     nextLevelDesc = ` Next Lvl: ${(saData.nextLevelDamageMultiplier * 100).toFixed(0)}% Dmg, Mana: ${saData.nextLevelManaCost}, ${(saData.nextLevelCooldownMs! / 1000).toFixed(1)}s CD.`;
                }
                 return `${currentDesc}${nextLevelDesc}`;
            }
            const initialCalcData = calculateSpecialAttackData(saDef, 1);
            return `Learn Whirlwind. ${saDef.description(1, initialCalcData)}`;
        },
        iconName: 'WHIRLWIND_ICON', maxLevel: SPECIAL_ATTACK_DEFINITIONS['WARRIOR_WHIRLWIND'].maxLevel,
        costPerLevel: (lvl) => ({ heroicPointsCost: SPECIAL_ATTACK_DEFINITIONS['WARRIOR_WHIRLWIND'].costBase + lvl * SPECIAL_ATTACK_DEFINITIONS['WARRIOR_WHIRLWIND'].costIncreasePerLevel }),
        prerequisites: [{ skillId: 'WSK005', level: 2 }], position: { x: 3, y: 0 },
        statBonuses: () => ({})
      },

      // Central Node
      {
        id: 'WSK006', name: 'Focused Blow',
        description: (level) => `Increases Critical Hit Chance by ${(level * 0.01 * 100).toFixed(0)}% and Critical Hit Damage by ${(level * 0.05 * 100).toFixed(0)}%.`,
        iconName: 'SWORD', maxLevel: 5,
        costPerLevel: (lvl) => ({ heroicPointsCost: 100 + lvl * 50, resources: [{ resource: ResourceType.CRYSTALS, amount: (lvl + 1) * 5 }] }),
        statBonuses: (lvl) => ({ critChance: lvl * 0.01, critDamage: lvl * 0.05 }),
        prerequisites: [{ skillId: 'WSK001', level: 3 }, { skillId: 'WSK002', level: 3 }],
        position: { x: 2, y: 2 } 
      },

      // Utility Branch (from WSK006)
      {
        id: 'WSK007', name: 'Mana Leech',
        description: (level) => `Basic attacks have a ${level * 5}% chance to restore ${level * 1} Mana. (Passive)`,
        iconName: 'CRYSTALS', maxLevel: 5,
        costPerLevel: (lvl) => ({ skillPoints: 1, resources: [{ resource: ResourceType.CRYSTALS, amount: (lvl + 1) * 10 }] }),
        statBonuses: () => ({}), 
        prerequisites: [{ skillId: 'WSK006', level: 1 }],
        position: { x: 3, y: 2 },
        isPassiveEffect: true,
      },
      {
        id: 'WSK_XP_MANA', name: "Warrior's Endurance",
        description: (level) => `Increases Max Mana by ${level * 5} and Mana Regeneration by ${(level * 0.1).toFixed(1)}/s. (Uses Heroic Points)`,
        iconName: 'CRYSTALS', maxLevel: 10,
        costPerLevel: (lvl) => ({ heroicPointsCost: 70 + lvl * 20, resources: [{ resource: ResourceType.GOLD, amount: (lvl + 1) * 75 }] }),
        statBonuses: (lvl) => ({ maxMana: lvl * 5, manaRegen: lvl * 0.1 }),
        prerequisites: [{ skillId: 'WSK007', level: 2 }], position: { x: 4, y: 2 }
      },

      // Bottom Branch (Defense/HP oriented from WSK002)
      {
        id: 'WSK002', name: 'Iron Skin',
        description: (level) => `Increases defense by ${level * 1}.`,
        iconName: 'SHIELD', maxLevel: 10,
        costPerLevel: (lvl) => ({ skillPoints: 1, resources: [{ resource: ResourceType.STONE, amount: (lvl + 1) * 10 }] }),
        statBonuses: (lvl) => ({ defense: lvl * 1 }),
        prerequisites: [], position: { x: 1, y: 3 }
      },
      {
        id: 'WSK003', name: 'Toughness',
        description: (level) => `Increases Max HP by ${level * 10}.`,
        iconName: 'HERO', maxLevel: 5,
        costPerLevel: (lvl) => ({ skillPoints: 1, resources: [{ resource: ResourceType.FOOD, amount: (lvl + 1) * 5 + 10 }] }),
        statBonuses: (lvl) => ({ maxHp: lvl * 10 }),
        prerequisites: [{ skillId: 'WSK002', level: 2 }], position: { x: 1, y: 4 }
      },
      {
        id: 'WSK_XP_VITALITY', name: 'Vitality Training',
        description: (level) => `Increases Max HP by ${level * 5}. (Uses Heroic Points)`,
        iconName: 'HERO', maxLevel: 20,
        costPerLevel: (lvl) => ({ heroicPointsCost: 50 + lvl * 25, resources: [{ resource: ResourceType.FOOD, amount: (lvl + 1) * 25 }] }),
        statBonuses: (lvl) => ({ maxHp: lvl * 5 }),
        prerequisites: [{ skillId: 'WSK003', level: 1 }], position: { x: 1, y: 5 }
      },
      {
        id: 'WSK004', name: 'Battle Hardened',
        description: (level) => `Increases Max HP by ${level * 15} and Defense by ${level * 1}.`,
        iconName: 'SHIELD', maxLevel: 5,
        costPerLevel: (lvl) => ({ skillPoints: 1, heroicPointsCost: 75 + lvl * 25, resources: [{ resource: ResourceType.IRON, amount: (lvl + 1) * 5 + 15 }, { resource: ResourceType.FOOD, amount: (lvl + 1) * 10 + 20 }] }),
        statBonuses: (lvl) => ({ maxHp: lvl * 15, defense: lvl * 1 }),
        prerequisites: [{ skillId: 'WSK003', level: 2 }, { skillId: 'WSK006', level: 1 }],
        position: { x: 2, y: 3 }
      },
      {
        id: 'WSK_SA002', specialAttackId: 'WARRIOR_SHIELD_BASH', name: 'Learn Shield Bash',
        description: (level, data) => {
            const saDef = SPECIAL_ATTACK_DEFINITIONS['WARRIOR_SHIELD_BASH'];
            if (!saDef) return "Error: Special attack not found.";
            const saData = data as CalculatedSpecialAttackData;
            if (level === 0 && saData?.currentDamageMultiplier !== undefined) {
                 return `Unlocks Shield Bash. ${saDef.description(1, saData)}`;
            } else if (level > 0 && saData?.currentDamageMultiplier !== undefined) {
                const currentDesc = saDef.description(level, saData);
                let nextLevelDesc = "";
                if ((saDef.maxLevel === -1 || level < saDef.maxLevel) && saData.nextLevelDamageMultiplier !== undefined) {
                     nextLevelDesc = ` Next Lvl: ${(saData.nextLevelDamageMultiplier * 100).toFixed(0)}% Dmg, Mana: ${saData.nextLevelManaCost}, ${(saData.nextLevelCooldownMs! / 1000).toFixed(1)}s CD.`;
                }
                 return `${currentDesc}${nextLevelDesc}`;
            }
            const initialCalcData = calculateSpecialAttackData(saDef, 1);
            return `Learn Shield Bash. ${saDef.description(1, initialCalcData)}`;
        },
        iconName: 'SHIELD', maxLevel: SPECIAL_ATTACK_DEFINITIONS['WARRIOR_SHIELD_BASH'].maxLevel,
        costPerLevel: (lvl) => ({ heroicPointsCost: SPECIAL_ATTACK_DEFINITIONS['WARRIOR_SHIELD_BASH'].costBase + lvl * SPECIAL_ATTACK_DEFINITIONS['WARRIOR_SHIELD_BASH'].costIncreasePerLevel }),
        prerequisites: [{ skillId: 'WSK004', level: 2 }], position: { x: 3, y: 4 },
        statBonuses: () => ({})
      },
    ] as SkillNodeDefinition[],
};