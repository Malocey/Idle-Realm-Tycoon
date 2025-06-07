
import React from 'react';
import { StoneQuarryMinigameState, MinigameUpgradeType, ResourceType } from '../../types';
import UpgradeButton from './UpgradeButton'; 
import * as GameConstants from '../../constants'; // Namespace import

export interface UpgradeConfig {
  id: MinigameUpgradeType;
  section: 'player' | 'golem' | 'gem_expertise';
  label: string;
  bonusPerLevelDisplay: string;
  getCosts: (level: number, state: StoneQuarryMinigameState) => Partial<Record<ResourceType, number>>;
  getCurrentLevel: (state: StoneQuarryMinigameState) => number;
  isMaxed: (state: StoneQuarryMinigameState) => boolean;
  getCurrentValueDisplay: (state: StoneQuarryMinigameState) => string;
}

const getUpgradeCost = (baseCosts: Partial<Record<ResourceType, number>>, currentLevel: number): Partial<Record<ResourceType, number>> => {
    const costs: Partial<Record<ResourceType, number>> = {};
    for (const resKey in baseCosts) {
      const resource = resKey as ResourceType;
      const costForResource = baseCosts[resource];
      if (costForResource !== undefined) {
        costs[resource] = Math.floor(costForResource * Math.pow(GameConstants.SQMG_UPGRADE_COST_SCALING_FACTOR, currentLevel));
      }
    }
    return costs;
};

const upgradeConfigsList: UpgradeConfig[] = [
    {
        id: 'playerClickPower', section: 'player', label: 'Click Power',
        bonusPerLevelDisplay: `+${GameConstants.SQMG_PLAYER_CLICK_POWER_UPGRADE_BONUS}`,
        getCosts: (level) => ({ [ResourceType.MINIGAME_DIRT]: Math.floor(GameConstants.SQMG_PLAYER_CLICK_POWER_UPGRADE_COST_BASE * Math.pow(GameConstants.SQMG_PLAYER_CLICK_POWER_UPGRADE_COST_FACTOR, level)) }),
        getCurrentLevel: (state) => state.playerClickPower - GameConstants.SQMG_DIRT_CLICK_YIELD,
        isMaxed: () => false,
        getCurrentValueDisplay: (state) => state.playerClickPower.toString(),
    },
    {
        id: 'playerMultiClickChance', section: 'player', label: 'Multi-Click',
        bonusPerLevelDisplay: `+${(GameConstants.SQMG_PLAYER_MULTI_CLICK_CHANCE_UPGRADE_BONUS * 100).toFixed(0)}%`,
        getCosts: (level) => getUpgradeCost({ [ResourceType.MINIGAME_DIRT]: GameConstants.SQMG_PLAYER_MULTI_CLICK_CHANCE_UPGRADE_BASE_COST_DIRT, [ResourceType.MINIGAME_CLAY]: GameConstants.SQMG_PLAYER_MULTI_CLICK_CHANCE_UPGRADE_BASE_COST_CLAY, [ResourceType.MINIGAME_ESSENCE]: GameConstants.SQMG_PLAYER_MULTI_CLICK_CHANCE_UPGRADE_BASE_COST_ESSENCE }, level),
        getCurrentLevel: (state) => state.playerMultiClickChanceUpgradeLevel,
        isMaxed: (state) => state.playerMultiClickChance >= GameConstants.SQMG_MAX_PLAYER_MULTI_CLICK_CHANCE,
        getCurrentValueDisplay: (state) => `${(state.playerMultiClickChance * 100).toFixed(0)}%`,
    },
    {
        id: 'essenceDropChance', section: 'player', label: 'Essence Drop',
        bonusPerLevelDisplay: `+${(GameConstants.SQMG_ESSENCE_DROP_CHANCE_UPGRADE_BONUS * 100).toFixed(0)}%`,
        getCosts: (level) => getUpgradeCost({ [ResourceType.MINIGAME_DIRT]: GameConstants.SQMG_ESSENCE_DROP_CHANCE_UPGRADE_BASE_COST_DIRT, [ResourceType.MINIGAME_SAND]: GameConstants.SQMG_ESSENCE_DROP_CHANCE_UPGRADE_BASE_COST_SAND, [ResourceType.MINIGAME_ESSENCE]: GameConstants.SQMG_ESSENCE_DROP_CHANCE_UPGRADE_BASE_COST_ESSENCE }, level),
        getCurrentLevel: (state) => state.essenceDropChanceUpgradeLevel,
        isMaxed: (state) => state.essenceDropChance >= GameConstants.SQMG_MAX_ESSENCE_DROP_CHANCE,
        getCurrentValueDisplay: (state) => `${(state.essenceDropChance * 100).toFixed(0)}%`,
    },
    {
        id: 'playerCrystalFindChance', section: 'player', label: 'Crystal Find',
        bonusPerLevelDisplay: `+${(GameConstants.SQMG_PLAYER_CRYSTAL_FIND_CHANCE_UPGRADE_BONUS * 100).toFixed(1)}%`,
        getCosts: (level) => getUpgradeCost({ [ResourceType.MINIGAME_DIRT]: GameConstants.SQMG_PLAYER_CRYSTAL_FIND_CHANCE_UPGRADE_BASE_COST_DIRT, [ResourceType.MINIGAME_SAND]: GameConstants.SQMG_PLAYER_CRYSTAL_FIND_CHANCE_UPGRADE_BASE_COST_SAND, [ResourceType.MINIGAME_ESSENCE]: GameConstants.SQMG_PLAYER_CRYSTAL_FIND_CHANCE_UPGRADE_BASE_COST_ESSENCE }, level),
        getCurrentLevel: (state) => state.playerCrystalFindChanceUpgradeLevel,
        isMaxed: (state) => state.playerCrystalFindChance >= GameConstants.SQMG_MAX_PLAYER_CRYSTAL_FIND_CHANCE,
        getCurrentValueDisplay: (state) => `${(state.playerCrystalFindChance * 100).toFixed(1)}%`,
    },
    {
        id: 'playerAdvancedExcavation', section: 'player', label: 'Adv. Excavation',
        bonusPerLevelDisplay: `+${(GameConstants.SQMG_PLAYER_ADVANCED_EXCAVATION_UPGRADE_BONUS * 100).toFixed(1)}%`,
        getCosts: (level) => getUpgradeCost({ [ResourceType.MINIGAME_SAND]: GameConstants.SQMG_PLAYER_ADVANCED_EXCAVATION_UPGRADE_BASE_COST_SAND, [ResourceType.MINIGAME_CRYSTAL]: GameConstants.SQMG_PLAYER_ADVANCED_EXCAVATION_UPGRADE_BASE_COST_CRYSTAL }, level),
        getCurrentLevel: (state) => state.playerAdvancedExcavationUpgradeLevel,
        isMaxed: (state) => state.playerAdvancedExcavationChance >= GameConstants.SQMG_MAX_PLAYER_ADVANCED_EXCAVATION_CHANCE,
        getCurrentValueDisplay: (state) => `${(state.playerAdvancedExcavationChance * 100).toFixed(1)}%`,
    },
    {
        id: 'golemClickPower', section: 'golem', label: 'Power',
        bonusPerLevelDisplay: `+${GameConstants.SQMG_GOLEM_CLICK_POWER_UPGRADE_BONUS}`,
        getCosts: (level) => getUpgradeCost({ [ResourceType.MINIGAME_DIRT]: GameConstants.SQMG_GOLEM_CLICK_POWER_UPGRADE_BASE_COST_DIRT, [ResourceType.MINIGAME_CLAY]: GameConstants.SQMG_GOLEM_CLICK_POWER_UPGRADE_BASE_COST_CLAY, [ResourceType.MINIGAME_ESSENCE]: GameConstants.SQMG_GOLEM_CLICK_POWER_UPGRADE_BASE_COST_ESSENCE }, level),
        getCurrentLevel: (state) => state.golemClickPowerUpgradeLevel,
        isMaxed: () => false,
        getCurrentValueDisplay: (state) => state.golemBaseClickPower.toString(),
    },
    {
        id: 'golemClickSpeed', section: 'golem', label: 'Click Speed',
        bonusPerLevelDisplay: `-${GameConstants.SQMG_GOLEM_CLICK_SPEED_REDUCTION_MS / 1000}s`,
        getCosts: (level) => getUpgradeCost({ [ResourceType.MINIGAME_DIRT]: GameConstants.SQMG_GOLEM_CLICK_SPEED_UPGRADE_BASE_COST_DIRT, [ResourceType.MINIGAME_CLAY]: GameConstants.SQMG_GOLEM_CLICK_SPEED_UPGRADE_BASE_COST_CLAY, [ResourceType.MINIGAME_ESSENCE]: GameConstants.SQMG_GOLEM_CLICK_SPEED_UPGRADE_BASE_COST_ESSENCE }, level),
        getCurrentLevel: (state) => state.golemClickSpeedUpgradeLevel,
        isMaxed: (state) => state.golemBaseClickSpeedMs <= GameConstants.SQMG_MIN_GOLEM_CLICK_SPEED_MS,
        getCurrentValueDisplay: (state) => `${(state.golemBaseClickSpeedMs / 1000).toFixed(1)}s`,
    },
    {
        id: 'golemMoveSpeed', section: 'golem', label: 'Move Speed',
        bonusPerLevelDisplay: `-${GameConstants.SQMG_GOLEM_MOVE_SPEED_REDUCTION_MS / 1000}s`,
        getCosts: (level) => getUpgradeCost({ [ResourceType.MINIGAME_DIRT]: GameConstants.SQMG_GOLEM_MOVE_SPEED_UPGRADE_BASE_COST_DIRT, [ResourceType.MINIGAME_SAND]: GameConstants.SQMG_GOLEM_MOVE_SPEED_UPGRADE_BASE_COST_SAND, [ResourceType.MINIGAME_ESSENCE]: GameConstants.SQMG_GOLEM_MOVE_SPEED_UPGRADE_BASE_COST_ESSENCE }, level),
        getCurrentLevel: (state) => state.golemMoveSpeedUpgradeLevel,
        isMaxed: (state) => state.golemBaseMoveSpeedMs <= GameConstants.SQMG_MIN_GOLEM_MOVE_SPEED_MS,
        getCurrentValueDisplay: (state) => `${(state.golemBaseMoveSpeedMs / 1000).toFixed(1)}s`,
    },
    {
        id: 'golemEssenceAffinity', section: 'golem', label: 'Ess. Affinity',
        bonusPerLevelDisplay: `+${(GameConstants.SQMG_GOLEM_ESSENCE_AFFINITY_UPGRADE_BONUS * 100).toFixed(1)}%`,
        getCosts: (level) => getUpgradeCost({ [ResourceType.MINIGAME_DIRT]: GameConstants.SQMG_GOLEM_ESSENCE_AFFINITY_UPGRADE_BASE_COST_DIRT, [ResourceType.MINIGAME_CLAY]: GameConstants.SQMG_GOLEM_ESSENCE_AFFINITY_UPGRADE_BASE_COST_CLAY, [ResourceType.MINIGAME_ESSENCE]: GameConstants.SQMG_GOLEM_ESSENCE_AFFINITY_UPGRADE_BASE_COST_ESSENCE }, level),
        getCurrentLevel: (state) => state.golemEssenceAffinityUpgradeLevel,
        isMaxed: (state) => state.golemEssenceAffinity >= GameConstants.SQMG_MAX_GOLEM_ESSENCE_AFFINITY,
        getCurrentValueDisplay: (state) => `${(state.golemEssenceAffinity * 100).toFixed(1)}%`,
    },
    {
        id: 'golemCrystalSifters', section: 'golem', label: 'Crystal Sifters',
        bonusPerLevelDisplay: `+${(GameConstants.SQMG_GOLEM_CRYSTAL_SIFTERS_UPGRADE_BONUS * 100).toFixed(2)}%`,
        getCosts: (level) => getUpgradeCost({ [ResourceType.MINIGAME_DIRT]: GameConstants.SQMG_GOLEM_CRYSTAL_SIFTERS_UPGRADE_BASE_COST_DIRT, [ResourceType.MINIGAME_SAND]: GameConstants.SQMG_GOLEM_CRYSTAL_SIFTERS_UPGRADE_BASE_COST_SAND, [ResourceType.MINIGAME_ESSENCE]: GameConstants.SQMG_GOLEM_CRYSTAL_SIFTERS_UPGRADE_BASE_COST_ESSENCE }, level),
        getCurrentLevel: (state) => state.golemCrystalSiftersUpgradeLevel,
        isMaxed: (state) => state.golemCrystalSifters >= GameConstants.SQMG_MAX_GOLEM_CRYSTAL_SIFTERS,
        getCurrentValueDisplay: (state) => `${(state.golemCrystalSifters * 100).toFixed(2)}%`,
    },
    {
        id: 'emeraldExpertise', section: 'gem_expertise', label: 'Emerald Find',
        bonusPerLevelDisplay: `+${(GameConstants.SQMG_EMERALD_EXPERTISE_UPGRADE_BONUS * 100).toFixed(1)}%`,
        getCosts: (level) => getUpgradeCost({ [ResourceType.MINIGAME_DIRT]: GameConstants.SQMG_EMERALD_EXPERTISE_UPGRADE_BASE_COST_DIRT, [ResourceType.MINIGAME_ESSENCE]: GameConstants.SQMG_EMERALD_EXPERTISE_UPGRADE_BASE_COST_ESSENCE }, level),
        getCurrentLevel: (state) => state.emeraldExpertiseUpgradeLevel,
        isMaxed: () => false, // No defined max
        getCurrentValueDisplay: (state) => `${((GameConstants.SQMG_EMERALD_DROP_CHANCE_FROM_SAND + state.emeraldExpertiseChance) * 100).toFixed(1)}%`,
    },
    {
        id: 'rubyRefinement', section: 'gem_expertise', label: 'Ruby Find',
        bonusPerLevelDisplay: `+${(GameConstants.SQMG_RUBY_REFINEMENT_UPGRADE_BONUS * 100).toFixed(1)}%`,
        getCosts: (level) => getUpgradeCost({ [ResourceType.MINIGAME_CLAY]: GameConstants.SQMG_RUBY_REFINEMENT_UPGRADE_BASE_COST_CLAY, [ResourceType.MINIGAME_ESSENCE]: GameConstants.SQMG_RUBY_REFINEMENT_UPGRADE_BASE_COST_ESSENCE, [ResourceType.MINIGAME_EMERALD]: GameConstants.SQMG_RUBY_REFINEMENT_UPGRADE_BASE_COST_EMERALD }, level),
        getCurrentLevel: (state) => state.rubyRefinementUpgradeLevel,
        isMaxed: () => false,
        getCurrentValueDisplay: (state) => `${((GameConstants.SQMG_RUBY_DROP_CHANCE_FROM_SAND + state.rubyRefinementChance) * 100).toFixed(1)}%`,
    },
    {
        id: 'sapphireSynthesis', section: 'gem_expertise', label: 'Sapphire Find',
        bonusPerLevelDisplay: `+${(GameConstants.SQMG_SAPPHIRE_SYNTHESIS_UPGRADE_BONUS * 100).toFixed(1)}%`,
        getCosts: (level) => getUpgradeCost({ [ResourceType.MINIGAME_SAND]: GameConstants.SQMG_SAPPHIRE_SYNTHESIS_UPGRADE_BASE_COST_SAND, [ResourceType.MINIGAME_ESSENCE]: GameConstants.SQMG_SAPPHIRE_SYNTHESIS_UPGRADE_BASE_COST_ESSENCE, [ResourceType.MINIGAME_RUBY]: GameConstants.SQMG_SAPPHIRE_SYNTHESIS_UPGRADE_BASE_COST_RUBY }, level),
        getCurrentLevel: (state) => state.sapphireSynthesisUpgradeLevel,
        isMaxed: () => false,
        getCurrentValueDisplay: (state) => `${((GameConstants.SQMG_SAPPHIRE_DROP_CHANCE_FROM_SAND + state.sapphireSynthesisChance) * 100).toFixed(1)}%`,
    },
];


interface MinigameUpgradesSectionProps {
  title: string;
  sectionId: 'player' | 'golem' | 'gem_expertise';
  minigameState: StoneQuarryMinigameState;
  handleUpgrade: (upgradeType: MinigameUpgradeType) => void;
}

const MinigameUpgradesSection: React.FC<MinigameUpgradesSectionProps> = ({
  title,
  sectionId,
  minigameState,
  handleUpgrade,
}) => {
  const sectionUpgrades = upgradeConfigsList.filter(conf => conf.section === sectionId);
  return (
    <>
      <h3 className="text-md font-semibold text-sky-300 border-b border-slate-700 pb-1 pt-2">{title}</h3>
      {sectionUpgrades.map(config => (
        <UpgradeButton
          key={config.id}
          config={config}
          minigameState={minigameState}
          handleUpgrade={handleUpgrade}
        />
      ))}
      {sectionId === 'golem' && (
        <div className="pt-2 border-t border-slate-700 mt-2 text-xs text-slate-400 space-y-0.5">
            {upgradeConfigsList.filter(c => c.section === 'golem').map(config => (
              <p key={config.id}>{config.label}: {config.getCurrentValueDisplay(minigameState)}</p>
            ))}
        </div>
      )}
      {sectionId === 'player' && (
         <div className="pt-2 border-t border-slate-700 mt-2 text-xs text-slate-400 space-y-0.5">
            {upgradeConfigsList.filter(c => c.section === 'player').map(config => (
              <p key={config.id}>{config.label}: {config.getCurrentValueDisplay(minigameState)}</p>
            ))}
        </div>
      )}
       {sectionId === 'gem_expertise' && (
         <div className="pt-2 border-t border-slate-700 mt-2 text-xs text-slate-400 space-y-0.5">
            {upgradeConfigsList.filter(c => c.section === 'gem_expertise').map(config => (
              <p key={config.id}>{config.label}: {config.getCurrentValueDisplay(minigameState)}</p>
            ))}
        </div>
      )}
    </>
  );
};

export default MinigameUpgradesSection;