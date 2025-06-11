
import { AethericResonanceStatConfig, HeroStats } from '../types';

// Höhere Gewichte für häufigere Stats
const COMMON_STAT_WEIGHT = 25;
const UNCOMMON_STAT_WEIGHT = 10;
const RARE_STAT_WEIGHT = 3;

// Deutsche Kommentare: Konfiguration für die Stats des Aetherischen Resonanzsystems
export const AETHERIC_RESONANCE_STAT_CONFIGS: AethericResonanceStatConfig[] = [
  {
    id: 'damage',
    label: 'Resonant Power', // Englischer Name
    iconName: 'SWORD',
    baseBonusPerFaintMote: 0.00005, // +0.005%
    isPercentage: true,
    dropWeight: COMMON_STAT_WEIGHT,
  },
  {
    id: 'maxHp',
    label: 'Resonant Vitality', // Englischer Name
    iconName: 'HERO',
    baseBonusPerFaintMote: 0.0001, // +0.01%
    isPercentage: true,
    dropWeight: COMMON_STAT_WEIGHT,
  },
  {
    id: 'defense',
    label: 'Resonant Toughness', // Englischer Name
    iconName: 'SHIELD',
    baseBonusPerFaintMote: 0.00005, // +0.005%
    isPercentage: true,
    dropWeight: COMMON_STAT_WEIGHT,
  },
  {
    id: 'maxMana',
    label: 'Resonant Focus', // Englischer Name
    iconName: 'CRYSTALS',
    baseBonusPerFaintMote: 0.0001, // +0.01%
    isPercentage: true,
    dropWeight: COMMON_STAT_WEIGHT,
  },
  {
    id: 'maxEnergyShield',
    label: 'Resonant Barrier', // Englischer Name
    iconName: 'SHIELD_BADGE',
    baseBonusPerFaintMote: 0.0001, // +0.01%
    isPercentage: true,
    dropWeight: COMMON_STAT_WEIGHT,
  },
  {
    id: 'attackSpeed',
    label: 'Resonant Haste', // Englischer Name
    iconName: 'WIND_SLASH',
    baseBonusPerFaintMote: 0.00001, // +0.00001 flach
    isPercentage: false,
    dropWeight: RARE_STAT_WEIGHT,
  },
  {
    id: 'critChance',
    label: 'Resonant Luck', // Englischer Name
    iconName: 'MAGIC_ARROW',
    baseBonusPerFaintMote: 0.000005, // +0.0005% flach
    isPercentage: false,
    dropWeight: UNCOMMON_STAT_WEIGHT,
  },
  {
    id: 'critDamage',
    label: 'Resonant Havoc', // Englischer Name
    iconName: 'SWORD',
    baseBonusPerFaintMote: 0.00001, // +0.001% flach
    isPercentage: false,
    dropWeight: UNCOMMON_STAT_WEIGHT,
  },
  {
    id: 'manaRegen',
    label: 'Resonant Recovery', // Englischer Name
    iconName: 'ATOM_ICON',
    baseBonusPerFaintMote: 0.00002, // +0.0002 flach/s
    isPercentage: false,
    dropWeight: UNCOMMON_STAT_WEIGHT,
  },
  {
    id: 'healPower',
    label: 'Resonant Blessing', // Englischer Name
    iconName: 'STAFF_ICON',
    baseBonusPerFaintMote: 0.00005, // +0.005%
    isPercentage: true,
    dropWeight: UNCOMMON_STAT_WEIGHT,
  },
  {
    id: 'hpRegen',
    label: 'Resonant Lifeforce', // Englischer Name
    iconName: 'HEALTH_POTION',
    baseBonusPerFaintMote: 0.00002, // +0.002 flach/s
    isPercentage: false,
    dropWeight: UNCOMMON_STAT_WEIGHT,
  },
  {
    id: 'energyShieldRechargeRate',
    label: 'Resonant Charge', // Englischer Name
    iconName: 'ATOM_ICON',
    baseBonusPerFaintMote: 0.00005, // +0.005%
    isPercentage: true,
    dropWeight: RARE_STAT_WEIGHT,
  },
  {
    id: 'energyShieldRechargeDelay',
    label: 'Resonant Resolve', // Englischer Name
    iconName: 'SETTINGS',
    baseBonusPerFaintMote: -0.0005, // -0.0005 Ticks flach (kleiner Effekt)
    isPercentage: false,
    dropWeight: RARE_STAT_WEIGHT,
  },
];
