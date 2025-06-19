
import { GameState, GlobalBonuses, ResourceType, BuildingSpecificUpgradeDefinition } from '../../types';
import { BUILDING_DEFINITIONS, BUILDING_SPECIFIC_UPGRADE_DEFINITIONS } from '../../gameData';
import { calculateBuildingProduction, getTownHallUpgradeEffectValue } from '../../utils';
import { GAME_TICK_MS } from '../../constants';

export const processBuildingProduction = (state: GameState, globalBonuses: GlobalBonuses, timeSinceLastTick: number, gameSpeed: number): GameState => {
  let newResources = { ...state.resources };
  let newTotalTownXp = state.totalTownXp;

  state.buildings.forEach(b => {
    if (b.level === 0) return;
    const def = BUILDING_DEFINITIONS[b.id];
    if (def && def.isProducer) {
      const production = calculateBuildingProduction(def, b.level);
      production.forEach(p => {
        // Amount per game tick interval, then scale by how many actual intervals have passed
        let amount = p.amountPerTick * (timeSinceLastTick / (GAME_TICK_MS / gameSpeed));
        
        if (p.resource !== ResourceType.TOWN_XP &&
            p.resource !== ResourceType.HEROIC_POINTS &&
            p.resource !== ResourceType.CATACOMB_BLUEPRINT &&
            p.resource !== ResourceType.AETHERIUM &&
            p.resource !== ResourceType.RESEARCH_POINTS) {
             amount *= (1 + globalBonuses.allResourceProductionBonus);
        }

        // Apply specific production bonuses
        if (p.resource === ResourceType.WOOD && globalBonuses.woodProductionBonus) amount *= (1 + globalBonuses.woodProductionBonus);
        if (p.resource === ResourceType.FOOD && globalBonuses.foodProductionBonus) amount *= (1 + globalBonuses.foodProductionBonus);
        if (p.resource === ResourceType.GOLD && globalBonuses.goldProductionBonus) amount *= (1 + globalBonuses.goldProductionBonus);
        if (p.resource === ResourceType.IRON && globalBonuses.ironProductionBonus) amount *= (1 + globalBonuses.ironProductionBonus);
        if (p.resource === ResourceType.CRYSTALS && globalBonuses.crystalProductionBonus) amount *= (1 + globalBonuses.crystalProductionBonus);


        if (p.resource === ResourceType.TOWN_XP) {
          newTotalTownXp += amount;
        } else if (p.resource === ResourceType.HEROIC_POINTS) {
          amount *= (1 + globalBonuses.heroXpGainBonus); 
          newResources[p.resource] = (newResources[p.resource] || 0) + amount;
        } else if (p.resource === ResourceType.RESEARCH_POINTS) {
          amount *= (1 + globalBonuses.researchPointProductionBonus);
          newResources[p.resource] = (newResources[p.resource] || 0) + amount;
        }
        else {
          newResources[p.resource] = (newResources[p.resource] || 0) + amount;
        }
      });
    }
    // Passive herb production from Farm upgrades
    if (def?.id === 'FARM') {
        const farmUpgrades = BUILDING_SPECIFIC_UPGRADE_DEFINITIONS['FARM'];
        const herbCultivationUpgradeDef = farmUpgrades?.find(upg => upg.id === 'FARM_HERB_CULTIVATION');
        const herbCultivationLevel = state.buildingSpecificUpgradeLevels['FARM']?.['FARM_HERB_CULTIVATION'] || 0;

        if (herbCultivationUpgradeDef && herbCultivationLevel > 0) {
            herbCultivationUpgradeDef.effects.forEach(effect => {
                if (effect.passiveHerbProduction) {
                    // getTownHallUpgradeEffectValue assumes 'level' is the direct input for calculation
                    // For passive production, effect.passiveHerbProduction.amountPerTick is the base per-tick rate at level 1 of the *upgrade*
                    // We need to scale this by the upgrade's effect calculation.
                    // Assuming getTownHallUpgradeEffectValue correctly interprets the `additiveStep` to give total flat bonus per tick for the upgrade level.
                    const effectValuePerTick = getTownHallUpgradeEffectValue(effect as any, herbCultivationLevel);
                    const amount = effectValuePerTick * (timeSinceLastTick / (GAME_TICK_MS / gameSpeed));
                    newResources[effect.passiveHerbProduction.herbType] = (newResources[effect.passiveHerbProduction.herbType] || 0) + amount;
                }
            });
        }
    }
  });

  return { ...state, resources: newResources, totalTownXp: newTotalTownXp };
};
