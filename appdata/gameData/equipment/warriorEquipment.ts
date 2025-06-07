
import { ResourceType, EquipmentSlot, HeroEquipmentDefinition } from '../../types';

const WARRIOR_SWORD_DEFINITION: HeroEquipmentDefinition = {
  id: 'WARRIOR_SWORD',
  heroDefinitionId: 'WARRIOR',
  slot: EquipmentSlot.WEAPON,
  name: "Warrior's Blade",
  description: (level, totalBonus) => `A sturdy blade for the Warrior. Current Bonus: +${totalBonus.damage?.toFixed(1) || 0} Damage.`,
  iconName: 'EQUIPMENT_SWORD_ICON',
  maxLevel: -1,
  unlockForgeLevel: 2, // Example: Base level requirement
  costsPerLevel: (lvl) => [
    { resource: ResourceType.IRON, amount: 10 + lvl * 4 },
    { resource: ResourceType.WOOD, amount: 5 + lvl * 2 },
  ],
  statBonusesPerLevel: (lvl) => ({ damage: 0.3 }),
};

const WARRIOR_ARMOR_DEFINITION: HeroEquipmentDefinition = {
  id: 'WARRIOR_ARMOR',
  heroDefinitionId: 'WARRIOR',
  slot: EquipmentSlot.ARMOR,
  name: "Warrior's Plate",
  description: (level, totalBonus) => `Heavy plate armor for the Warrior. Current Bonus: +${totalBonus.maxHp?.toFixed(0) || 0} Max HP, +${totalBonus.defense?.toFixed(0) || 0} Defense.`,
  iconName: 'EQUIPMENT_ARMOR_ICON',
  maxLevel: -1,
  unlockForgeLevel: 1, // Example: Higher level requirement
  costsPerLevel: (lvl) => [
    { resource: ResourceType.IRON, amount: 15 + lvl * 6 },
    { resource: ResourceType.LEATHER, amount: 8 + lvl * 3 },
  ],
  statBonusesPerLevel: (lvl) => ({ maxHp: 3 + Math.floor(lvl/2), defense: 0.5 }),
};

const WARRIOR_HELMET_DEFINITION: HeroEquipmentDefinition = {
  id: 'WARRIOR_HELMET', heroDefinitionId: 'WARRIOR', slot: EquipmentSlot.HELMET, name: "Warrior's Helm",
  description: (level, totalBonus) => `Offers protection. Current Bonus: +${totalBonus.defense?.toFixed(0) || 0} Def, +${totalBonus.maxHp?.toFixed(0) || 0} HP.`,
  iconName: 'HELMET_ICON', maxLevel: -1, unlockForgeLevel: 3,
  costsPerLevel: (lvl) => [{ resource: ResourceType.IRON, amount: 12 + lvl * 5 }, { resource: ResourceType.LEATHER, amount: 4 + lvl * 1 }],
  statBonusesPerLevel: (lvl) => ({ defense: 0.5, maxHp: 3 + Math.floor(lvl/3) }),
};

const WARRIOR_SHOULDERS_DEFINITION: HeroEquipmentDefinition = {
  id: 'WARRIOR_SHOULDERS', heroDefinitionId: 'WARRIOR', slot: EquipmentSlot.SHOULDERS, name: "Warrior's Pauldrons",
  description: (level, totalBonus) => `Enhances combat prowess. Current Bonus: +${totalBonus.defense?.toFixed(0) || 0} Def, +${totalBonus.damage?.toFixed(1) || 0} Dmg.`,
  iconName: 'SHOULDER_PAULDRONS_ICON', maxLevel: -1, unlockForgeLevel: 4,
  costsPerLevel: (lvl) => [{ resource: ResourceType.IRON, amount: 14 + lvl * 5 }, { resource: ResourceType.STONE, amount: 5 + lvl * 2 }],
  statBonusesPerLevel: (lvl) => ({ defense: 0.4, damage: 0.2 }),
};

export const WARRIOR_EQUIPMENT: Record<string, HeroEquipmentDefinition> = {
  'WARRIOR_SWORD': WARRIOR_SWORD_DEFINITION,
  'WARRIOR_ARMOR': WARRIOR_ARMOR_DEFINITION,
  'WARRIOR_HELMET': WARRIOR_HELMET_DEFINITION,
  'WARRIOR_SHOULDERS': WARRIOR_SHOULDERS_DEFINITION,
};