
import { ResourceType, EquipmentSlot, HeroEquipmentDefinition } from '../../types';

const ARCHER_BOW_DEFINITION: HeroEquipmentDefinition = {
  id: 'ARCHER_BOW', heroDefinitionId: 'ARCHER', slot: EquipmentSlot.WEAPON, name: "Archer's Longbow",
  description: (level, totalBonus) => `A precise longbow. Current Bonus: +${totalBonus.damage?.toFixed(1) || 0} Damage.`,
  iconName: 'EQUIPMENT_BOW_ICON', maxLevel: -1, unlockForgeLevel: 2,
  costsPerLevel: (lvl) => [{ resource: ResourceType.WOOD, amount: 12 + lvl * 5 }, { resource: ResourceType.LEATHER, amount: 6 + lvl * 2 }],
  statBonusesPerLevel: (lvl) => ({ damage: 0.5 }),
};

const ARCHER_TUNIC_DEFINITION: HeroEquipmentDefinition = {
  id: 'ARCHER_TUNIC', heroDefinitionId: 'ARCHER', slot: EquipmentSlot.ARMOR, name: "Archer's Tunic",
  description: (level, totalBonus) => `Reinforced tunic. Current Bonus: +${totalBonus.maxHp?.toFixed(0) || 0} Max HP, +${totalBonus.defense?.toFixed(0) || 0} Defense.`,
  iconName: 'EQUIPMENT_ARMOR_ICON', maxLevel: -1, unlockForgeLevel: 1,
  costsPerLevel: (lvl) => [{ resource: ResourceType.LEATHER, amount: 15 + lvl * 5 }, { resource: ResourceType.WOOD, amount: 8 + lvl * 3 }],
  statBonusesPerLevel: (lvl) => ({ maxHp: 2.5 + Math.floor(lvl/3), defense: 0.4 }),
};

const ARCHER_HELMET_DEFINITION: HeroEquipmentDefinition = {
  id: 'ARCHER_HELMET', heroDefinitionId: 'ARCHER', slot: EquipmentSlot.HELMET, name: "Archer's Hood",
  description: (level, totalBonus) => `Improves focus. Current Bonus: +${(totalBonus.critChance || 0) * 100}% Crit, +${totalBonus.attackSpeed?.toFixed(2) || 0} Atk Spd.`,
  iconName: 'HELMET_ICON', maxLevel: -1, unlockForgeLevel: 3,
  costsPerLevel: (lvl) => [{ resource: ResourceType.LEATHER, amount: 10 + lvl * 4 }, { resource: ResourceType.WOOD, amount: 3 + lvl * 1 }],
  statBonusesPerLevel: (lvl) => ({ critChance: 0.002 + Math.floor(lvl/10) * 0.001, attackSpeed: 0.005 }),
};

const ARCHER_SHOULDERS_DEFINITION: HeroEquipmentDefinition = {
  id: 'ARCHER_SHOULDERS', heroDefinitionId: 'ARCHER', slot: EquipmentSlot.SHOULDERS, name: "Archer's Quiver Straps",
  description: (level, totalBonus) => `Reinforced straps. Current Bonus: +${totalBonus.damage?.toFixed(1) || 0} Dmg, +${totalBonus.maxHp?.toFixed(0) || 0} HP.`,
  iconName: 'SHOULDER_PAULDRONS_ICON', maxLevel: -1, unlockForgeLevel: 4,
  costsPerLevel: (lvl) => [{ resource: ResourceType.LEATHER, amount: 12 + lvl * 4 }, { resource: ResourceType.IRON, amount: 2 + lvl * 1 }],
  statBonusesPerLevel: (lvl) => ({ damage: 0.2, maxHp: 2 + Math.floor(lvl/4) }),
};

export const ARCHER_EQUIPMENT: Record<string, HeroEquipmentDefinition> = {
  'ARCHER_BOW': ARCHER_BOW_DEFINITION,
  'ARCHER_TUNIC': ARCHER_TUNIC_DEFINITION,
  'ARCHER_HELMET': ARCHER_HELMET_DEFINITION,
  'ARCHER_SHOULDERS': ARCHER_SHOULDERS_DEFINITION,
};