
import { ResourceType, EquipmentSlot, HeroEquipmentDefinition } from '../../types';

const ELEMENTAL_STAFF_DEFINITION: HeroEquipmentDefinition = {
  id: 'ELEMENTAL_STAFF', heroDefinitionId: 'ELEMENTAL_MAGE', slot: EquipmentSlot.WEAPON, name: "Elemental Staff",
  description: (level, totalBonus) => `Channels raw elemental power. Current Bonus: +${totalBonus.damage?.toFixed(1) || 0} Dmg, +${totalBonus.maxMana?.toFixed(0) || 0} Mana, +${totalBonus.manaRegen?.toFixed(2) || 0} Mana Regen.`,
  iconName: 'STAFF_ICON', maxLevel: -1, costsPerLevel: (lvl) => [{ resource: ResourceType.WOOD, amount: 10 + lvl * 4 }, { resource: ResourceType.CRYSTALS, amount: 8 + lvl * 3 }],
  statBonusesPerLevel: (lvl) => ({ damage: 0.5, maxMana: 1 + Math.floor(lvl/5), manaRegen: 0.05 }),
};

const MAGE_ROBES_DEFINITION: HeroEquipmentDefinition = {
  id: 'MAGE_ROBES', heroDefinitionId: 'ELEMENTAL_MAGE', slot: EquipmentSlot.ARMOR, name: "Mage Robes",
  description: (level, totalBonus) => `Enchanted robes. Current Bonus: +${totalBonus.maxHp?.toFixed(0) || 0} Max HP, +${totalBonus.defense?.toFixed(0) || 0} Def, +${totalBonus.maxMana?.toFixed(0) || 0} Mana.`,
  iconName: 'EQUIPMENT_ARMOR_ICON', maxLevel: -1, costsPerLevel: (lvl) => [{ resource: ResourceType.LEATHER, amount: 12 + lvl * 4 }, { resource: ResourceType.CRYSTALS, amount: 6 + lvl * 2 }],
  statBonusesPerLevel: (lvl) => ({ maxHp: 2 + Math.floor(lvl/4), defense: 0.3, maxMana: 3 + Math.floor(lvl/4) }),
};

const MAGE_HELMET_DEFINITION: HeroEquipmentDefinition = {
  id: 'MAGE_HELMET', heroDefinitionId: 'ELEMENTAL_MAGE', slot: EquipmentSlot.HELMET, name: "Mage Cowl",
  description: (level, totalBonus) => `A cowl for arcane focus. Current Bonus: +${totalBonus.maxMana?.toFixed(0) || 0} Mana, +${totalBonus.damage?.toFixed(1) || 0} Dmg (Spell).`,
  iconName: 'HELMET_ICON', maxLevel: -1, costsPerLevel: (lvl) => [{ resource: ResourceType.LEATHER, amount: 8 + lvl * 3 }, { resource: ResourceType.CRYSTALS, amount: 10 + lvl * 4 }],
  statBonusesPerLevel: (lvl) => ({ maxMana: 3 + Math.floor(lvl/3), damage: 0.15 }),
};

const MAGE_SHOULDERS_DEFINITION: HeroEquipmentDefinition = {
  id: 'MAGE_SHOULDERS', heroDefinitionId: 'ELEMENTAL_MAGE', slot: EquipmentSlot.SHOULDERS, name: "Mage Mantle",
  description: (level, totalBonus) => `A mantle woven with ley lines. Current Bonus: +${totalBonus.manaRegen?.toFixed(2) || 0} Mana Regen, +${totalBonus.maxHp?.toFixed(0) || 0} HP.`,
  iconName: 'SHOULDER_PAULDRONS_ICON', maxLevel: -1, costsPerLevel: (lvl) => [{ resource: ResourceType.CRYSTALS, amount: 12 + lvl * 5 }, { resource: ResourceType.FOOD, amount: 10 + lvl * 3 }],
  statBonusesPerLevel: (lvl) => ({ manaRegen: 0.08, maxHp: 1 + Math.floor(lvl/5) }),
};

export const MAGE_EQUIPMENT: Record<string, HeroEquipmentDefinition> = {
  'ELEMENTAL_STAFF': ELEMENTAL_STAFF_DEFINITION,
  'MAGE_ROBES': MAGE_ROBES_DEFINITION,
  'MAGE_HELMET': MAGE_HELMET_DEFINITION,
  'MAGE_SHOULDERS': MAGE_SHOULDERS_DEFINITION,
};
