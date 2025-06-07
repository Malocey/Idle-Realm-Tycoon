
import { ResourceType, EquipmentSlot, HeroEquipmentDefinition } from '../../types';

const PALADIN_HAMMER_DEFINITION: HeroEquipmentDefinition = {
  id: 'PALADIN_HAMMER', heroDefinitionId: 'PALADIN', slot: EquipmentSlot.WEAPON, name: "Paladin's Warhammer",
  description: (level, totalBonus) => `A heavy warhammer to smite foes. Current Bonus: +${totalBonus.damage?.toFixed(1) || 0} Damage.`,
  iconName: 'EQUIPMENT_SWORD_ICON', maxLevel: -1, costsPerLevel: (lvl) => [{ resource: ResourceType.IRON, amount: 15 + lvl * 6 }, { resource: ResourceType.WOOD, amount: 10 + lvl * 3 }, { resource: ResourceType.GOLD, amount: 60 + lvl * 20 }],
  statBonusesPerLevel: (lvl) => ({ damage: 0.4 + Math.floor(lvl/5) * 0.1 }),
};

const PALADIN_PLATE_DEFINITION: HeroEquipmentDefinition = {
  id: 'PALADIN_PLATE', heroDefinitionId: 'PALADIN', slot: EquipmentSlot.ARMOR, name: "Paladin's Heavy Plate",
  description: (level, totalBonus) => `Heavy plate armor providing excellent protection. Current Bonus: +${totalBonus.maxHp?.toFixed(0) || 0} Max HP, +${totalBonus.defense?.toFixed(0) || 0} Defense.`,
  iconName: 'EQUIPMENT_ARMOR_ICON', maxLevel: -1, costsPerLevel: (lvl) => [{ resource: ResourceType.IRON, amount: 20 + lvl * 8 }, { resource: ResourceType.STONE, amount: 10 + lvl * 4 }, { resource: ResourceType.LEATHER, amount: 5 + lvl * 2 }],
  statBonusesPerLevel: (lvl) => ({ maxHp: 4 + Math.floor(lvl/2), defense: 1.5 }),
};

const PALADIN_HELMET_DEFINITION: HeroEquipmentDefinition = {
  id: 'PALADIN_HELMET', heroDefinitionId: 'PALADIN', slot: EquipmentSlot.HELMET, name: "Paladin's Greathelm",
  description: (level, totalBonus) => `A sturdy greathelm. Current Bonus: +${totalBonus.defense?.toFixed(0) || 0} Def, +${totalBonus.maxHp?.toFixed(0) || 0} HP.`,
  iconName: 'HELMET_ICON', maxLevel: -1, costsPerLevel: (lvl) => [{ resource: ResourceType.IRON, amount: 18 + lvl * 7 }, { resource: ResourceType.STONE, amount: 6 + lvl * 2 }],
  statBonusesPerLevel: (lvl) => ({ defense: 0.6, maxHp: 4 + Math.floor(lvl/2) }),
};

const PALADIN_SHOULDERS_DEFINITION: HeroEquipmentDefinition = {
  id: 'PALADIN_SHOULDERS', heroDefinitionId: 'PALADIN', slot: EquipmentSlot.SHOULDERS, name: "Paladin's Spaulders",
  description: (level, totalBonus) => `Blessed spaulders. Current Bonus: +${totalBonus.defense?.toFixed(0) || 0} Def, +${totalBonus.hpRegen?.toFixed(1) || 0} HP Regen.`,
  iconName: 'SHOULDER_PAULDRONS_ICON', maxLevel: -1, costsPerLevel: (lvl) => [{ resource: ResourceType.IRON, amount: 16 + lvl * 6 }, { resource: ResourceType.CRYSTALS, amount: 3 + lvl * 1 }],
  statBonusesPerLevel: (lvl) => ({ defense: 0.5, hpRegen: 0.1 + Math.floor(lvl/5)*0.1 }),
};

export const PALADIN_EQUIPMENT: Record<string, HeroEquipmentDefinition> = {
  'PALADIN_HAMMER': PALADIN_HAMMER_DEFINITION,
  'PALADIN_PLATE': PALADIN_PLATE_DEFINITION,
  'PALADIN_HELMET': PALADIN_HELMET_DEFINITION,
  'PALADIN_SHOULDERS': PALADIN_SHOULDERS_DEFINITION,
};
