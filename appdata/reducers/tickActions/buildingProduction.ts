
import { GameState, GlobalBonuses, ResourceType, BuildingSpecificUpgradeDefinition } from '../../types';
import { BUILDING_DEFINITIONS, BUILDING_SPECIFIC_UPGRADE_DEFINITIONS } from '../../gameData';
import { calculateBuildingProduction, getTownHallUpgradeEffectValue } from '../../utils';
import { GAME_TICK_MS } from '../../constants';

export const processBuildingProduction = (state: GameState, globalBonuses: GlobalBonuses, elapsedWallClockMs: number, gameSpeed: number): GameState => {
  let newResources = { ...state.resources };
  let newTotalTownXp = state.totalTownXp;

  state.buildings.forEach(b => {
    if (b.level === 0) return;
    const def = BUILDING_DEFINITIONS[b.id];
    if (def && def.isProducer) {
      const production = calculateBuildingProduction(def, b.level);
      production.forEach(p => {
        // p.amountPerTick is the amount produced per base GAME_TICK_MS interval at 1x speed.
        // We need to find how many such base intervals occurred in the elapsedWallClockMs, considering gameSpeed.
        const numberOfBaseTicksSimulated = elapsedWallClockMs / (GAME_TICK_MS / gameSpeed);
        let amount = p.amountPerTick * numberOfBaseTicksSimulated;
        
        if (p.resource !== ResourceType.TOWN_XP &&
            p.resource !== ResourceType.HEROIC_POINTS &&
            p.resource !== ResourceType.CATACOMB_BLUEPRINT &&
            p.resource !== ResourceType.AETHERIUM &&
            p.resource !== ResourceType.RESEARCH_POINTS) { // Exclude RESEARCH_POINTS from allResourceProductionBonus
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
                    const effectValuePerBaseTick = getTownHallUpgradeEffectValue(effect as any, herbCultivationLevel);
                    const numberOfBaseTicksSimulated = elapsedWallClockMs / (GAME_TICK_MS / gameSpeed);
                    const amount = effectValuePerBaseTick * numberOfBaseTicksSimulated;
                    newResources[effect.passiveHerbProduction.herbType] = (newResources[effect.passiveHerbProduction.herbType] || 0) + amount;
                }
            });
        }
    }
  });

  return { ...state, resources: newResources, totalTownXp: newTotalTownXp };
};
