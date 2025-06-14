// appdata/gameData/index.ts
export * from './buildingDefinitions';
export * from './heroDefinitions';
export * from './specialAttackDefinitions';
export * from './equipmentDefinitions';
export * from './skillTreeDefinitions';
export * from './enemyDefinitions';
export * from './waveDefinitions'; // This now correctly points to the WAVE_DEFINITIONS array which includes map-specific ones
export * from './townHallUpgradeDefinitions';
export * from './guildHallUpgradeDefinitions';
export * from './dungeonDefinitions';
export * from './buildingSpecificUpgradeDefinitions';
export * from './potionDefinitions';
export * from './shardDefinitions';
export * from './questDefinitions';
export * from './trapDefinitions';
export * from './eventDefinitions';
export * from './runBuffDefinitions';
export * from './colosseumWaveDefinitions';
export * from './sharedSkillDefinitions';
export * from './statusEffectDefinitions'; 
export * from './demoniconMilestoneRewards';
export * from './maps/index'; // Updated to use the maps barrel file
export * from './accountLevelBonuses';
export * from './aethericResonanceDefinitions';
export * from './researchDefinitions';
export * from './autoBattlerCardDefinitions';
export * from './autoBattlerUnitDefinitions';
export { GOLD_MINE_UPGRADE_DEFINITIONS } from './goldMineUpgrades';

// Explicitly re-export specific maps if needed elsewhere directly, though barrel files are preferred.
// These specific exports might become redundant if all imports are switched to use `worldMapDefinitions` from `./maps/index`.
export { VERDANT_PLAINS_LUMBER_MILL_SITE_MAP } from './maps/verdantPlains/verdantPlainsLumberMillSite';
export { VERDANT_PLAINS_FARMSTEAD_RUINS_MAP } from './maps/verdantPlains/verdantPlainsFarmsteadRuins';