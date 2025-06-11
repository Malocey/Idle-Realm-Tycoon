
import { ResourceType, SkillTreeDefinition, SkillNodeDefinition, CalculatedSpecialAttackData } from '../../types';
import { SPECIAL_ATTACK_DEFINITIONS } from '../specialAttackDefinitions';
import { calculateSpecialAttackData } from '../../utils';

export const PALADIN_SKILL_TREE_DEFINITION: SkillTreeDefinition = {
    id: 'PALADIN_SKILLS',
    nodes: [
      { id: 'PSK001', name: 'Steadfast Challenge', description: (level) => `The Paladin draws enemy attention, forcing them to attack the Paladin. (Passive: Active at Lvl 1)`, iconName: 'SHIELD_BADGE', maxLevel: 1, costPerLevel: () => ({ skillPoints: 1 }), statBonuses: () => ({}), prerequisites: [], position: { x: 0, y: 1 }, isPassiveEffect: true },
      { id: 'PSK002', name: 'Reinforced Armor', description: (level) => `Increases the Paladin's Max HP by ${level * 15} and Defense by ${level * 1}.`, iconName: 'SHIELD', maxLevel: 10, costPerLevel: (lvl) => ({ skillPoints: 1, resources: [{resource: ResourceType.IRON, amount: (lvl+1)*10}] }), statBonuses: (lvl) => ({ maxHp: lvl * 15, defense: lvl * 1 }), prerequisites: [{skillId: 'PSK001', level: 1}], position: { x: 1, y: 1 } },
      { id: 'PSK003', name: 'Holy Strike', description: (level) => `Adds ${level * 2} to the Paladin's base damage.`, iconName: 'SWORD', maxLevel: 10, costPerLevel: (lvl) => ({ skillPoints: 1, resources: [{resource: ResourceType.GOLD, amount: (lvl+1)*15}]}), statBonuses: (lvl) => ({ damage: lvl * 2 }), prerequisites: [{skillId: 'PSK001', level: 1}], position: { x: 0, y: 2 }},
      { id: 'PSK004', name: "Guardian's Resolve", description: (level) => `Further enhances Max HP by ${level * 18} and Defense by ${level * 2}.`, iconName: 'SHIELD_BADGE', maxLevel: 5, costPerLevel: (lvl) => ({ skillPoints: 2, heroicPointsCost: 80 + lvl * 30, resources: [{resource: ResourceType.STONE, amount: (lvl+1)*20}]}), statBonuses: (lvl) => ({ maxHp: lvl * 18, defense: lvl * 2 }), prerequisites: [{skillId: 'PSK002', level: 3}], position: { x: 2, y: 1 } },
      {
        id: 'PSK_SA_DIVINE_STORM', specialAttackId: 'PALADIN_DIVINE_STORM', name: 'Learn Divine Storm',
        description: (level, data) => {
            const saDef = SPECIAL_ATTACK_DEFINITIONS['PALADIN_DIVINE_STORM'];
            if (!saDef) return "Error: Special attack not found.";
            const saData = data as CalculatedSpecialAttackData;
            if (level === 0 && saData?.currentDamageMultiplier !== undefined) {
                return `Unlocks Divine Storm. ${saDef.description(1, saData)}`;
            } else if (level > 0 && saData?.currentDamageMultiplier !== undefined) {
                const currentDesc = saDef.description(level, saData);
                let nextLevelDesc = "";
                if ((saDef.maxLevel === -1 || level < saDef.maxLevel) && saData.nextLevelDamageMultiplier !== undefined) {
                     nextLevelDesc = ` Next Lvl: ${(saData.nextLevelDamageMultiplier * 100).toFixed(0)}% Dmg, Mana: ${saData.nextLevelManaCost}, ${(saData.nextLevelCooldownMs! / 1000).toFixed(1)}s CD.`;
                }
                 return `${currentDesc}${nextLevelDesc}`;
            }
            const initialCalcData = calculateSpecialAttackData(saDef, 1);
            return `Learn Divine Storm. ${saDef.description(1, initialCalcData)}`;
        },
        iconName: 'WHIRLWIND_ICON', maxLevel: SPECIAL_ATTACK_DEFINITIONS['PALADIN_DIVINE_STORM'].maxLevel,
        costPerLevel: (lvl) => ({ heroicPointsCost: SPECIAL_ATTACK_DEFINITIONS['PALADIN_DIVINE_STORM'].costBase + lvl * SPECIAL_ATTACK_DEFINITIONS['PALADIN_DIVINE_STORM'].costIncreasePerLevel }),
        prerequisites: [{ skillId: 'PSK003', level: 2 }], position: { x: 1, y: 0 },
        statBonuses: () => ({})
      },
      {
        id: 'PSK_XP_DAMAGE', name: 'Zealous Might',
        description: (level) => `Increases the Paladin's damage by ${level * 2}. (Uses Heroic Points)`,
        iconName: 'SWORD', maxLevel: 10,
        costPerLevel: (lvl) => ({ heroicPointsCost: 65 + lvl * 28, resources: [{resource: ResourceType.IRON, amount: (lvl+1)*15}] }),
        statBonuses: (lvl) => ({ damage: lvl * 2 }),
        prerequisites: [{ skillId: 'PSK003', level: 3 }], position: { x: 0, y: 3 }
      },
      {
        id: 'PSK_XP_HP', name: 'Steadfast Bastion',
        description: (level) => `Increases the Paladin's Max HP by ${level * 20}. (Uses Heroic Points)`,
        iconName: 'SHIELD', maxLevel: 10,
        costPerLevel: (lvl) => ({ heroicPointsCost: 70 + lvl * 30, resources: [{resource: ResourceType.STONE, amount: (lvl+1)*20}] }),
        statBonuses: (lvl) => ({ maxHp: lvl * 20 }),
        prerequisites: [{ skillId: 'PSK004', level: 2 }], position: { x: 3, y: 1 }
      },
      {
        id: 'PALADIN_PASSIVE_AVENGERSHIELD_01', name: 'Avenger\'s Shield',
        description: (level) => `On Block/Hit: ${(10 + level * 2)}% chance to deal damage to the attacker equal to ${(15 + level * 5)}% of the Paladin's Defense.`,
        iconName: 'SHIELD', maxLevel: 5,
        costPerLevel: (lvl) => ({ skillPoints: 1, resources: [{ resource: ResourceType.IRON, amount: (lvl + 1) * 10 }] }),
        prerequisites: [{ skillId: 'PSK002', level: 2 }], position: { x: 1, y: 2 }, 
        isPassiveEffect: true, statBonuses: () => ({})
      },
      {
        id: 'PALADIN_PASSIVE_STEADFASTDEFENDER_01', name: 'Steadfast Defender',
        description: (level) => `When a nearby ally is hit: ${(8 + level * 2)}% chance to grant the ally a +${(10 + level * 4)}% Defense buff for 4s.`,
        iconName: 'SHIELD_BADGE', maxLevel: 5,
        costPerLevel: (lvl) => ({ skillPoints: 1, heroicPointsCost: 90 + lvl * 25 }),
        prerequisites: [{ skillId: 'PSK004', level: 1 }], position: { x: 2, y: 2 },
        isPassiveEffect: true, statBonuses: () => ({})
      },
      {
        id: 'PALADIN_PASSIVE_PERSEVERANCEAURA_01', name: 'Aura of Perseverance',
        description: (level) => `Passive: Small chance (${(1 + level * 0.5).toFixed(1)}%) per tick for all party members to regenerate ${(1 + Math.floor(level/2))} Mana.`,
        iconName: 'ATOM_ICON', maxLevel: 5,
        costPerLevel: (lvl) => ({ skillPoints: 1, resources: [{ resource: ResourceType.CRYSTALS, amount: (lvl + 1) * 12 }] }),
        prerequisites: [{ skillId: 'PSK_SA_DIVINE_STORM', level: 1 }], position: { x: 0, y: 0 },
        isPassiveEffect: true, statBonuses: () => ({})
      },
    ] as SkillNodeDefinition[],
};
