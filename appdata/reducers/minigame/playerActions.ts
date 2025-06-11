
import { GameState, GameAction, StoneQuarryMinigameState, ResourceType, MinigameUpgradeType, GameNotification } from '../../types';
import { MinigameEventType } from '../../types/enums/minigame'; // Corrected import for MinigameEventType
import * as GameConstants from '../../constants'; // Namespace import for all constants
import { formatNumber } from '../../utils';
import { ICONS } from '../../components/Icons';
import { createPopupEvent } from './utils';

export const handleMinigameCellClick = (
  state: GameState,
  action: Extract<GameAction, { type: 'STONE_QUARRY_MINIGAME_CLICK_CELL' }>
): GameState => {
  const minigameState = state.stoneQuarryMinigame;
  if (!minigameState || !minigameState.gridInitialized) return state;

  const { r, c } = action.payload;
  const cell = minigameState.gridCells[r]?.[c];
  if (!cell) return state;

  let newNotifications = [...state.notifications];
  const newMinigameState: StoneQuarryMinigameState = {
    ...minigameState,
    resources: { ...minigameState.resources },
    gridCells: minigameState.gridCells.map(row => row.map(cl => (cl.r === r && cl.c === c ? { ...cl } : cl))), // Deep copy relevant cell
    popupEvents: [], // Reset for this action
  };
  const currentCellInNewState = newMinigameState.gridCells[r][c];


  let clicksToApply = 1;
  if (Math.random() < newMinigameState.playerMultiClickChance) {
    clicksToApply = 2;
    newNotifications.push({id: Date.now().toString() + "-multiClickProc", message: `Multi-Click!`, type: 'success', iconName: ICONS.UPGRADE ? 'UPGRADE' : undefined, timestamp: Date.now()});
  }

  for (let i = 0; i < clicksToApply; i++) {
    const amountCollected = newMinigameState.playerClickPower;
    newMinigameState.resources[currentCellInNewState.currentResource] = (newMinigameState.resources[currentCellInNewState.currentResource] || 0) + amountCollected;
    newMinigameState.popupEvents.push(createPopupEvent(currentCellInNewState.currentResource, amountCollected, currentCellInNewState.r, currentCellInNewState.c, true));

    if (Math.random() < newMinigameState.playerAdvancedExcavationChance) {
      let revealedResource: ResourceType | null = null;
      if (currentCellInNewState.currentResource === ResourceType.MINIGAME_DIRT) revealedResource = ResourceType.MINIGAME_CLAY;
      else if (currentCellInNewState.currentResource === ResourceType.MINIGAME_CLAY) revealedResource = ResourceType.MINIGAME_SAND;
      if (revealedResource) {
        newMinigameState.resources[revealedResource] = (newMinigameState.resources[revealedResource] || 0) + 1;
        newMinigameState.popupEvents.push(createPopupEvent(revealedResource, 1, currentCellInNewState.r, currentCellInNewState.c, true));
        newNotifications.push({id: Date.now().toString() + "-advExcProc", message: `Master Excavator! Found +1 ${revealedResource.replace('MINIGAME_','')}!`, type: 'success', iconName: ICONS.UPGRADE ? 'UPGRADE' : undefined, timestamp: Date.now()});
      }
    }

    let currentEssenceDropChance = newMinigameState.essenceDropChance;
    if (newMinigameState.activeMinigameEvent?.type === MinigameEventType.ESSENCE_BOOM) currentEssenceDropChance += GameConstants.SQMG_ESSENCE_BOOM_BONUS_CHANCE;
    if ((currentCellInNewState.currentResource === ResourceType.MINIGAME_CLAY || currentCellInNewState.currentResource === ResourceType.MINIGAME_SAND) && Math.random() < currentEssenceDropChance) {
      newMinigameState.resources[ResourceType.MINIGAME_ESSENCE]++;
      newMinigameState.popupEvents.push(createPopupEvent(ResourceType.MINIGAME_ESSENCE, 1, currentCellInNewState.r, currentCellInNewState.c, true));
    }

    let currentGenericCrystalDropChance = newMinigameState.playerCrystalFindChance + GameConstants.SQMG_CRYSTAL_DROP_CHANCE;
    if (newMinigameState.activeMinigameEvent?.type === MinigameEventType.CRYSTAL_SHOWER) currentGenericCrystalDropChance += GameConstants.SQMG_CRYSTAL_SHOWER_BONUS_CHANCE;
    else if (currentCellInNewState.currentResource === ResourceType.MINIGAME_SAND) currentGenericCrystalDropChance += GameConstants.SQMG_CRYSTAL_DROP_CHANCE;
    if ((currentCellInNewState.currentResource === ResourceType.MINIGAME_SAND || (newMinigameState.activeMinigameEvent?.type === MinigameEventType.CRYSTAL_SHOWER && currentCellInNewState.currentResource !== ResourceType.MINIGAME_DIRT)) && Math.random() < currentGenericCrystalDropChance) {
      newMinigameState.resources[ResourceType.MINIGAME_CRYSTAL]++;
      newMinigameState.popupEvents.push(createPopupEvent(ResourceType.MINIGAME_CRYSTAL, 1, currentCellInNewState.r, currentCellInNewState.c, true));
    }

    if (currentCellInNewState.currentResource === ResourceType.MINIGAME_SAND) {
      if (Math.random() < GameConstants.SQMG_EMERALD_DROP_CHANCE_FROM_SAND + newMinigameState.emeraldExpertiseChance) {
        newMinigameState.resources[ResourceType.MINIGAME_EMERALD]++;
        newMinigameState.popupEvents.push(createPopupEvent(ResourceType.MINIGAME_EMERALD, 1, currentCellInNewState.r, currentCellInNewState.c, true));
      }
      if (Math.random() < GameConstants.SQMG_RUBY_DROP_CHANCE_FROM_SAND + newMinigameState.rubyRefinementChance) {
        newMinigameState.resources[ResourceType.MINIGAME_RUBY]++;
        newMinigameState.popupEvents.push(createPopupEvent(ResourceType.MINIGAME_RUBY, 1, currentCellInNewState.r, currentCellInNewState.c, true));
      }
      if (Math.random() < GameConstants.SQMG_SAPPHIRE_DROP_CHANCE_FROM_SAND + newMinigameState.sapphireSynthesisChance) {
        newMinigameState.resources[ResourceType.MINIGAME_SAPPHIRE]++;
        newMinigameState.popupEvents.push(createPopupEvent(ResourceType.MINIGAME_SAPPHIRE, 1, currentCellInNewState.r, currentCellInNewState.c, true));
      }
    }
    
    if (currentCellInNewState.currentResource !== ResourceType.MINIGAME_SAND) { 
        currentCellInNewState.currentClicks += amountCollected;
        if (currentCellInNewState.currentClicks >= currentCellInNewState.clicksToNextResource) {
            if (currentCellInNewState.currentResource === ResourceType.MINIGAME_DIRT) {
                currentCellInNewState.currentResource = ResourceType.MINIGAME_CLAY;
                currentCellInNewState.clicksToNextResource = GameConstants.SQMG_CLAY_TO_SAND_CLICKS;
            } else if (currentCellInNewState.currentResource === ResourceType.MINIGAME_CLAY) {
                currentCellInNewState.currentResource = ResourceType.MINIGAME_SAND;
                currentCellInNewState.clicksToNextResource = Infinity; 
            }
            currentCellInNewState.currentClicks = 0;
        }
    }
  }
  return { ...state, stoneQuarryMinigame: newMinigameState, notifications: newNotifications };
};

export const handleMinigamePurchaseUpgrade = (
  state: GameState,
  action: Extract<GameAction, { type: 'STONE_QUARRY_MINIGAME_PURCHASE_UPGRADE' }>
): GameState => {
  const minigameState = state.stoneQuarryMinigame;
  if (!minigameState) return state;

  const { upgradeType } = action.payload;
  const newMinigameState = { ...minigameState, resources: { ...minigameState.resources } };
  const newNotifications = [...state.notifications];

  let cost: Partial<Record<ResourceType, number>> = {};
  let canAfford = false;
  let newLevel = 0;
  let upgradeLabel = '';

  const calculateCost = (baseCosts: Partial<Record<ResourceType, number>>, level: number) => {
      const costs: Partial<Record<ResourceType, number>> = {};
      for (const resKey in baseCosts) {
        const resource = resKey as ResourceType;
        const costForResource = baseCosts[resource];
        if (costForResource !== undefined) {
          costs[resource] = Math.floor(costForResource * Math.pow(GameConstants.SQMG_UPGRADE_COST_SCALING_FACTOR, level));
        }
      }
      return costs;
  };

  switch (upgradeType) {
    case 'playerClickPower':
      cost = { [ResourceType.MINIGAME_DIRT]: Math.floor(GameConstants.SQMG_PLAYER_CLICK_POWER_UPGRADE_COST_BASE * Math.pow(GameConstants.SQMG_PLAYER_CLICK_POWER_UPGRADE_COST_FACTOR, newMinigameState.playerClickPower - GameConstants.SQMG_DIRT_CLICK_YIELD)) };
      upgradeLabel = "Player Click Power";
      if ((newMinigameState.resources[ResourceType.MINIGAME_DIRT] || 0) >= (cost[ResourceType.MINIGAME_DIRT] || Infinity)) {
        canAfford = true;
        newMinigameState.resources[ResourceType.MINIGAME_DIRT]! -= cost[ResourceType.MINIGAME_DIRT]!;
        newMinigameState.playerClickPower += GameConstants.SQMG_PLAYER_CLICK_POWER_UPGRADE_BONUS;
        newLevel = newMinigameState.playerClickPower;
      }
      break;
    case 'golemClickPower':
        cost = calculateCost({ [ResourceType.MINIGAME_DIRT]: GameConstants.SQMG_GOLEM_CLICK_POWER_UPGRADE_BASE_COST_DIRT, [ResourceType.MINIGAME_CLAY]: GameConstants.SQMG_GOLEM_CLICK_POWER_UPGRADE_BASE_COST_CLAY, [ResourceType.MINIGAME_ESSENCE]: GameConstants.SQMG_GOLEM_CLICK_POWER_UPGRADE_BASE_COST_ESSENCE }, newMinigameState.golemClickPowerUpgradeLevel);
        upgradeLabel = "Golem Click Power";
         if (Object.keys(cost).every(resKey => (newMinigameState.resources[resKey as ResourceType] || 0) >= (cost[resKey as ResourceType] || Infinity))) {
            canAfford = true; Object.entries(cost).forEach(([res, amt]) => newMinigameState.resources[res as ResourceType]! -= amt!);
            newMinigameState.golemBaseClickPower += GameConstants.SQMG_GOLEM_CLICK_POWER_UPGRADE_BONUS;
            newMinigameState.golemClickPowerUpgradeLevel++; newLevel = newMinigameState.golemBaseClickPower;
        }
        break;
    case 'golemClickSpeed':
        cost = calculateCost({ [ResourceType.MINIGAME_DIRT]: GameConstants.SQMG_GOLEM_CLICK_SPEED_UPGRADE_BASE_COST_DIRT, [ResourceType.MINIGAME_CLAY]: GameConstants.SQMG_GOLEM_CLICK_SPEED_UPGRADE_BASE_COST_CLAY, [ResourceType.MINIGAME_ESSENCE]: GameConstants.SQMG_GOLEM_CLICK_SPEED_UPGRADE_BASE_COST_ESSENCE }, newMinigameState.golemClickSpeedUpgradeLevel);
        upgradeLabel = "Golem Click Speed";
        if (newMinigameState.golemBaseClickSpeedMs > GameConstants.SQMG_MIN_GOLEM_CLICK_SPEED_MS && Object.keys(cost).every(resKey => (newMinigameState.resources[resKey as ResourceType] || 0) >= (cost[resKey as ResourceType] || Infinity))) {
            canAfford = true; Object.entries(cost).forEach(([res, amt]) => newMinigameState.resources[res as ResourceType]! -= amt!);
            newMinigameState.golemBaseClickSpeedMs = Math.max(GameConstants.SQMG_MIN_GOLEM_CLICK_SPEED_MS, newMinigameState.golemBaseClickSpeedMs - GameConstants.SQMG_GOLEM_CLICK_SPEED_REDUCTION_MS);
            newMinigameState.golemClickSpeedUpgradeLevel++; newLevel = newMinigameState.golemBaseClickSpeedMs;
        }
        break;
    case 'golemMoveSpeed':
        cost = calculateCost({ [ResourceType.MINIGAME_DIRT]: GameConstants.SQMG_GOLEM_MOVE_SPEED_UPGRADE_BASE_COST_DIRT, [ResourceType.MINIGAME_SAND]: GameConstants.SQMG_GOLEM_MOVE_SPEED_UPGRADE_BASE_COST_SAND, [ResourceType.MINIGAME_ESSENCE]: GameConstants.SQMG_GOLEM_MOVE_SPEED_UPGRADE_BASE_COST_ESSENCE }, newMinigameState.golemMoveSpeedUpgradeLevel);
        upgradeLabel = "Golem Move Speed";
        if (newMinigameState.golemBaseMoveSpeedMs > GameConstants.SQMG_MIN_GOLEM_MOVE_SPEED_MS && Object.keys(cost).every(resKey => (newMinigameState.resources[resKey as ResourceType] || 0) >= (cost[resKey as ResourceType] || Infinity))) {
            canAfford = true; Object.entries(cost).forEach(([res, amt]) => newMinigameState.resources[res as ResourceType]! -= amt!);
            newMinigameState.golemBaseMoveSpeedMs = Math.max(GameConstants.SQMG_MIN_GOLEM_MOVE_SPEED_MS, newMinigameState.golemBaseMoveSpeedMs - GameConstants.SQMG_GOLEM_MOVE_SPEED_REDUCTION_MS);
            newMinigameState.golemMoveSpeedUpgradeLevel++; newLevel = newMinigameState.golemBaseMoveSpeedMs;
        }
        break;
    case 'essenceDropChance':
        cost = calculateCost({ [ResourceType.MINIGAME_DIRT]: GameConstants.SQMG_ESSENCE_DROP_CHANCE_UPGRADE_BASE_COST_DIRT, [ResourceType.MINIGAME_SAND]: GameConstants.SQMG_ESSENCE_DROP_CHANCE_UPGRADE_BASE_COST_SAND, [ResourceType.MINIGAME_ESSENCE]: GameConstants.SQMG_ESSENCE_DROP_CHANCE_UPGRADE_BASE_COST_ESSENCE }, newMinigameState.essenceDropChanceUpgradeLevel);
        upgradeLabel = "Essence Drop Chance";
        if (newMinigameState.essenceDropChance < GameConstants.SQMG_MAX_ESSENCE_DROP_CHANCE && Object.keys(cost).every(resKey => (newMinigameState.resources[resKey as ResourceType] || 0) >= (cost[resKey as ResourceType] || Infinity))) {
            canAfford = true; Object.entries(cost).forEach(([res, amt]) => newMinigameState.resources[res as ResourceType]! -= amt!);
            newMinigameState.essenceDropChance = Math.min(GameConstants.SQMG_MAX_ESSENCE_DROP_CHANCE, newMinigameState.essenceDropChance + GameConstants.SQMG_ESSENCE_DROP_CHANCE_UPGRADE_BONUS);
            newMinigameState.essenceDropChanceUpgradeLevel++; newLevel = Math.round(newMinigameState.essenceDropChance * 100);
        }
        break;
    case 'playerMultiClickChance':
        cost = calculateCost({ [ResourceType.MINIGAME_DIRT]: GameConstants.SQMG_PLAYER_MULTI_CLICK_CHANCE_UPGRADE_BASE_COST_DIRT, [ResourceType.MINIGAME_CLAY]: GameConstants.SQMG_PLAYER_MULTI_CLICK_CHANCE_UPGRADE_BASE_COST_CLAY, [ResourceType.MINIGAME_ESSENCE]: GameConstants.SQMG_PLAYER_MULTI_CLICK_CHANCE_UPGRADE_BASE_COST_ESSENCE }, newMinigameState.playerMultiClickChanceUpgradeLevel);
        upgradeLabel = "Player Multi-Click Chance";
        if (newMinigameState.playerMultiClickChance < GameConstants.SQMG_MAX_PLAYER_MULTI_CLICK_CHANCE && Object.keys(cost).every(resKey => (newMinigameState.resources[resKey as ResourceType] || 0) >= (cost[resKey as ResourceType] || Infinity))) {
            canAfford = true; Object.entries(cost).forEach(([res, amt]) => newMinigameState.resources[res as ResourceType]! -= amt!);
            newMinigameState.playerMultiClickChance = Math.min(GameConstants.SQMG_MAX_PLAYER_MULTI_CLICK_CHANCE, newMinigameState.playerMultiClickChance + GameConstants.SQMG_PLAYER_MULTI_CLICK_CHANCE_UPGRADE_BONUS);
            newMinigameState.playerMultiClickChanceUpgradeLevel++; newLevel = Math.round(newMinigameState.playerMultiClickChance * 100);
        }
        break;
    case 'golemEssenceAffinity':
        cost = calculateCost({ [ResourceType.MINIGAME_DIRT]: GameConstants.SQMG_GOLEM_ESSENCE_AFFINITY_UPGRADE_BASE_COST_DIRT, [ResourceType.MINIGAME_CLAY]: GameConstants.SQMG_GOLEM_ESSENCE_AFFINITY_UPGRADE_BASE_COST_CLAY, [ResourceType.MINIGAME_ESSENCE]: GameConstants.SQMG_GOLEM_ESSENCE_AFFINITY_UPGRADE_BASE_COST_ESSENCE }, newMinigameState.golemEssenceAffinityUpgradeLevel);
        upgradeLabel = "Golem Essence Affinity";
        if (newMinigameState.golemEssenceAffinity < GameConstants.SQMG_MAX_GOLEM_ESSENCE_AFFINITY && Object.keys(cost).every(resKey => (newMinigameState.resources[resKey as ResourceType] || 0) >= (cost[resKey as ResourceType] || Infinity))) {
            canAfford = true; Object.entries(cost).forEach(([res, amt]) => newMinigameState.resources[res as ResourceType]! -= amt!);
            newMinigameState.golemEssenceAffinity = Math.min(GameConstants.SQMG_MAX_GOLEM_ESSENCE_AFFINITY, newMinigameState.golemEssenceAffinity + GameConstants.SQMG_GOLEM_ESSENCE_AFFINITY_UPGRADE_BONUS);
            newMinigameState.golemEssenceAffinityUpgradeLevel++; newLevel = Math.round(newMinigameState.golemEssenceAffinity * 100);
        }
        break;
    case 'playerCrystalFindChance':
        cost = calculateCost({ [ResourceType.MINIGAME_DIRT]: GameConstants.SQMG_PLAYER_CRYSTAL_FIND_CHANCE_UPGRADE_BASE_COST_DIRT, [ResourceType.MINIGAME_SAND]: GameConstants.SQMG_PLAYER_CRYSTAL_FIND_CHANCE_UPGRADE_BASE_COST_SAND, [ResourceType.MINIGAME_ESSENCE]: GameConstants.SQMG_PLAYER_CRYSTAL_FIND_CHANCE_UPGRADE_BASE_COST_ESSENCE }, newMinigameState.playerCrystalFindChanceUpgradeLevel);
        upgradeLabel = "Player Crystal Find Chance";
        if (newMinigameState.playerCrystalFindChance < GameConstants.SQMG_MAX_PLAYER_CRYSTAL_FIND_CHANCE && Object.keys(cost).every(resKey => (newMinigameState.resources[resKey as ResourceType] || 0) >= (cost[resKey as ResourceType] || Infinity))) {
            canAfford = true; Object.entries(cost).forEach(([res, amt]) => newMinigameState.resources[res as ResourceType]! -= amt!);
            newMinigameState.playerCrystalFindChance = Math.min(GameConstants.SQMG_MAX_PLAYER_CRYSTAL_FIND_CHANCE, newMinigameState.playerCrystalFindChance + GameConstants.SQMG_PLAYER_CRYSTAL_FIND_CHANCE_UPGRADE_BONUS);
            newMinigameState.playerCrystalFindChanceUpgradeLevel++; newLevel = Math.round(newMinigameState.playerCrystalFindChance * 1000) / 10; // For display as x.x%
        }
        break;
    case 'golemCrystalSifters':
        cost = calculateCost({ [ResourceType.MINIGAME_DIRT]: GameConstants.SQMG_GOLEM_CRYSTAL_SIFTERS_UPGRADE_BASE_COST_DIRT, [ResourceType.MINIGAME_SAND]: GameConstants.SQMG_GOLEM_CRYSTAL_SIFTERS_UPGRADE_BASE_COST_SAND, [ResourceType.MINIGAME_ESSENCE]: GameConstants.SQMG_GOLEM_CRYSTAL_SIFTERS_UPGRADE_BASE_COST_ESSENCE }, newMinigameState.golemCrystalSiftersUpgradeLevel);
        upgradeLabel = "Golem Crystal Sifters";
        if (newMinigameState.golemCrystalSifters < GameConstants.SQMG_MAX_GOLEM_CRYSTAL_SIFTERS && Object.keys(cost).every(resKey => (newMinigameState.resources[resKey as ResourceType] || 0) >= (cost[resKey as ResourceType] || Infinity))) {
            canAfford = true; Object.entries(cost).forEach(([res, amt]) => newMinigameState.resources[res as ResourceType]! -= amt!);
            newMinigameState.golemCrystalSifters = Math.min(GameConstants.SQMG_MAX_GOLEM_CRYSTAL_SIFTERS, newMinigameState.golemCrystalSifters + GameConstants.SQMG_GOLEM_CRYSTAL_SIFTERS_UPGRADE_BONUS);
            newMinigameState.golemCrystalSiftersUpgradeLevel++; newLevel = Math.round(newMinigameState.golemCrystalSifters * 1000) / 10; // For display as x.x%
        }
        break;
    case 'playerAdvancedExcavation':
        cost = calculateCost({ [ResourceType.MINIGAME_SAND]: GameConstants.SQMG_PLAYER_ADVANCED_EXCAVATION_UPGRADE_BASE_COST_SAND, [ResourceType.MINIGAME_CRYSTAL]: GameConstants.SQMG_PLAYER_ADVANCED_EXCAVATION_UPGRADE_BASE_COST_CRYSTAL }, newMinigameState.playerAdvancedExcavationUpgradeLevel);
        upgradeLabel = "Player Advanced Excavation";
        if (newMinigameState.playerAdvancedExcavationChance < GameConstants.SQMG_MAX_PLAYER_ADVANCED_EXCAVATION_CHANCE && Object.keys(cost).every(resKey => (newMinigameState.resources[resKey as ResourceType] || 0) >= (cost[resKey as ResourceType] || Infinity))) {
            canAfford = true; Object.entries(cost).forEach(([res, amt]) => newMinigameState.resources[res as ResourceType]! -= amt!);
            newMinigameState.playerAdvancedExcavationChance = Math.min(GameConstants.SQMG_MAX_PLAYER_ADVANCED_EXCAVATION_CHANCE, newMinigameState.playerAdvancedExcavationChance + GameConstants.SQMG_PLAYER_ADVANCED_EXCAVATION_UPGRADE_BONUS);
            newMinigameState.playerAdvancedExcavationUpgradeLevel++; newLevel = Math.round(newMinigameState.playerAdvancedExcavationChance * 1000) / 10;
        }
        break;
    case 'emeraldExpertise':
        cost = calculateCost({ [ResourceType.MINIGAME_DIRT]: GameConstants.SQMG_EMERALD_EXPERTISE_UPGRADE_BASE_COST_DIRT, [ResourceType.MINIGAME_ESSENCE]: GameConstants.SQMG_EMERALD_EXPERTISE_UPGRADE_BASE_COST_ESSENCE }, newMinigameState.emeraldExpertiseUpgradeLevel);
        upgradeLabel = "Emerald Expertise";
        if (Object.keys(cost).every(resKey => (newMinigameState.resources[resKey as ResourceType] || 0) >= (cost[resKey as ResourceType] || Infinity))) {
            canAfford = true; Object.entries(cost).forEach(([res, amt]) => newMinigameState.resources[res as ResourceType]! -= amt!);
            newMinigameState.emeraldExpertiseChance += GameConstants.SQMG_EMERALD_EXPERTISE_UPGRADE_BONUS;
            newMinigameState.emeraldExpertiseUpgradeLevel++; newLevel = Math.round((GameConstants.SQMG_EMERALD_DROP_CHANCE_FROM_SAND + newMinigameState.emeraldExpertiseChance) * 1000) / 10;
        }
        break;
    case 'rubyRefinement':
        cost = calculateCost({ [ResourceType.MINIGAME_CLAY]: GameConstants.SQMG_RUBY_REFINEMENT_UPGRADE_BASE_COST_CLAY, [ResourceType.MINIGAME_ESSENCE]: GameConstants.SQMG_RUBY_REFINEMENT_UPGRADE_BASE_COST_ESSENCE, [ResourceType.MINIGAME_EMERALD]: GameConstants.SQMG_RUBY_REFINEMENT_UPGRADE_BASE_COST_EMERALD }, newMinigameState.rubyRefinementUpgradeLevel);
        upgradeLabel = "Ruby Refinement";
        if (Object.keys(cost).every(resKey => (newMinigameState.resources[resKey as ResourceType] || 0) >= (cost[resKey as ResourceType] || Infinity))) {
            canAfford = true; Object.entries(cost).forEach(([res, amt]) => newMinigameState.resources[res as ResourceType]! -= amt!);
            newMinigameState.rubyRefinementChance += GameConstants.SQMG_RUBY_REFINEMENT_UPGRADE_BONUS;
            newMinigameState.rubyRefinementUpgradeLevel++; newLevel = Math.round((GameConstants.SQMG_RUBY_DROP_CHANCE_FROM_SAND + newMinigameState.rubyRefinementChance) * 1000) / 10;
        }
        break;
    case 'sapphireSynthesis':
        cost = calculateCost({ [ResourceType.MINIGAME_SAND]: GameConstants.SQMG_SAPPHIRE_SYNTHESIS_UPGRADE_BASE_COST_SAND, [ResourceType.MINIGAME_ESSENCE]: GameConstants.SQMG_SAPPHIRE_SYNTHESIS_UPGRADE_BASE_COST_ESSENCE, [ResourceType.MINIGAME_RUBY]: GameConstants.SQMG_SAPPHIRE_SYNTHESIS_UPGRADE_BASE_COST_RUBY }, newMinigameState.sapphireSynthesisUpgradeLevel);
        upgradeLabel = "Sapphire Synthesis";
        if (Object.keys(cost).every(resKey => (newMinigameState.resources[resKey as ResourceType] || 0) >= (cost[resKey as ResourceType] || Infinity))) {
            canAfford = true; Object.entries(cost).forEach(([res, amt]) => newMinigameState.resources[res as ResourceType]! -= amt!);
            newMinigameState.sapphireSynthesisChance += GameConstants.SQMG_SAPPHIRE_SYNTHESIS_UPGRADE_BONUS;
            newMinigameState.sapphireSynthesisUpgradeLevel++; newLevel = Math.round((GameConstants.SQMG_SAPPHIRE_DROP_CHANCE_FROM_SAND + newMinigameState.sapphireSynthesisChance) * 1000) / 10;
        }
        break;
  }

  if (canAfford) {
    newNotifications.push({id: Date.now().toString() + "-upgradeSuccess", message: `${upgradeLabel} upgraded! (Now: ${newLevel}${upgradeType.includes('Chance') || upgradeType.includes('Affinity') || upgradeType.includes('Expertise') || upgradeType.includes('Refinement') || upgradeType.includes('Synthesis') ? '%' : (upgradeType.includes('Speed') ? 's' : '')})`, type: 'success', iconName: ICONS.UPGRADE ? 'UPGRADE' : undefined, timestamp: Date.now()});
  } else {
    newNotifications.push({id: Date.now().toString() + "-upgradeFail", message: `Not enough resources for ${upgradeLabel}.`, type: 'warning', iconName: GameConstants.NOTIFICATION_ICONS.warning, timestamp: Date.now()});
  }
  return { ...state, stoneQuarryMinigame: newMinigameState, notifications: newNotifications };
};
