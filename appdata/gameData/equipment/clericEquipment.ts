
import { ResourceType, EquipmentSlot, HeroEquipmentDefinition } from '../../types';

const CLERIC_STAFF_DEFINITION: HeroEquipmentDefinition = {
  id: 'CLERIC_STAFF', heroDefinitionId: 'CLERIC', slot: EquipmentSlot.WEAPON, name: "Cleric's Holy Staff",
  description: (level, totalBonus) => `A staff to channel divine healing. Current Bonus: +${totalBonus.healPower?.toFixed(1) || 0} Heal Power.`,
  iconName: 'STAFF_ICON', maxLevel: -1, costsPerLevel: (lvl) => [{ resource: ResourceType.WOOD, amount: 8 + lvl * 3 }, { resource: ResourceType.CRYSTALS, amount: 5 + lvl * 2 }, { resource: ResourceType.GOLD, amount: 50 + lvl * 15 }],
  statBonusesPerLevel: (lvl) => ({ healPower: 0.3 + Math.floor(lvl/5) * 0.1 }),
};

const CLERIC_ROBES_DEFINITION: HeroEquipmentDefinition = {
  id: 'CLERIC_ROBES', heroDefinitionId: 'CLERIC', slot: EquipmentSlot.ARMOR, name: "Cleric's Blessed Robes",
  description: (level, totalBonus) => `Robes offering modest protection. Current Bonus: +${totalBonus.maxHp?.toFixed(0) || 0} Max HP, +${totalBonus.defense?.toFixed(0) || 0} Defense.`,
  iconName: 'EQUIPMENT_ARMOR_ICON', maxLevel: -1, costsPerLevel: (lvl) => [{ resource: ResourceType.FOOD, amount: 20 + lvl * 8 }, { resource: ResourceType.LEATHER, amount: 10 + lvl * 3 }, { resource: ResourceType.CRYSTALS, amount: 3 + lvl * 1 }],
  statBonusesPerLevel: (lvl) => ({ maxHp: 2 + Math.floor(lvl/3), defense: 0.3 }),
};

const CLERIC_HELMET_DEFINITION: HeroEquipmentDefinition = {
  id: 'CLERIC_HELMET', heroDefinitionId: 'CLERIC', slot: EquipmentSlot.HELMET, name: "Cleric's Circlet",
  description: (level, totalBonus) => `A circlet aiding focus. Current Bonus: +${totalBonus.maxMana?.toFixed(0) || 0} Mana, +${totalBonus.healPower?.toFixed(1) || 0} Heal Pwr.`,
  iconName: 'HELMET_ICON', maxLevel: -1, costsPerLevel: (lvl) => [{ resource: ResourceType.CRYSTALS, amount: 8 + lvl * 3 }, { resource: ResourceType.GOLD, amount: 40 + lvl * 10 }],
  statBonusesPerLevel: (lvl) => ({ maxMana: 3 + Math.floor(lvl/4), healPower: 0.1 }),
};

const CLERIC_SHOULDERS_DEFINITION: HeroEquipmentDefinition = {
  id: 'CLERIC_SHOULDERS', heroDefinitionId: 'CLERIC', slot: EquipmentSlot.SHOULDERS, name: "Cleric's Mantle",
  description: (level, totalBonus) => `A mantle providing spiritual protection. Current Bonus: +${totalBonus.defense?.toFixed(0) || 0} Def, +${totalBonus.manaRegen?.toFixed(2) || 0} Mana Regen.`,
  iconName: 'SHOULDER_PAULDRONS_ICON', maxLevel: -1, costsPerLevel: (lvl) => [{ resource: ResourceType.FOOD, amount: 15 + lvl * 6 }, { resource: ResourceType.CRYSTALS, amount: 4 + lvl * 1 }],
  statBonusesPerLevel: (lvl) => ({ defense: 0.2, manaRegen: 0.05 }),
};

export const CLERIC_EQUIPMENT: Record<string, HeroEquipmentDefinition> = {
  'CLERIC_STAFF': CLERIC_STAFF_DEFINITION,
  'CLERIC_ROBES': CLERIC_ROBES_DEFINITION,
  'CLERIC_HELMET': CLERIC_HELMET_DEFINITION,
  'CLERIC_SHOULDERS': CLERIC_SHOULDERS_DEFINITION,
};
