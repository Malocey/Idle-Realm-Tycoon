
import React, { useState, useMemo } from 'react';
import { useGameContext } from '../context';
import { ICONS } from './Icons';
import { RESOURCE_COLORS } from '../constants';
import { MAX_ACTIVE_QUESTS }
from '../types';
import { BUILDING_DEFINITIONS, HERO_DEFINITIONS, WAVE_DEFINITIONS } from '../gameData/index';
import { ResourceType, Production, GameState, PlayerSharedSkillProgress, BattleState, GameContextType, ActiveView } from '../types'; // Added ActiveView
import { calculateBuildingProduction, canAfford, formatNumber, getTownHallUpgradeEffectValue } from '../utils'; // Added getTownHallUpgradeEffectValue
import Button from './Button';
import Modal from './Modal';
import ResourceItem from './ResourceItem';
import DungeonSelectionModal from './DungeonSelectionModal';
import QuestLogModal from './QuestLogModal';

interface TopBarResourceDisplayConfig {
  id: ResourceType;
  getValue: (gameState: GameState) => number;
  showRate: boolean;
  iconNameOverride?: string;
  condition?: (gameState: GameState, globalBonuses: ReturnType<typeof useGameContext>['getGlobalBonuses']) => boolean;
}

interface TopBarProps {
  onToggleAccountLevelModal: () => void; // New prop for modal
}

const getContextualResources = (
  activeView: GameState['activeView'],
  battleState: GameState['battleState'],
  gameState: GameState,
  allResourceTypes: ResourceType[],
  staticData: GameContextType['staticData'] // Added staticData as argument
): ResourceType[] => {
  switch (activeView) {
    case ActiveView.TOWN:
      return [ResourceType.GOLD, ResourceType.TOWN_XP]; // Simplified for Town View
    case ActiveView.BATTLEFIELD:
      if (battleState?.isDemoniconBattle) {
        return [ResourceType.HEROIC_POINTS, ResourceType.DEMONIC_COIN];
      } else if (battleState?.isDungeonGridBattle || battleState?.isDungeonBattle) {
        return [ResourceType.HEROIC_POINTS, ResourceType.GOLD, ResourceType.CATACOMB_KEY];
      }
      return [ResourceType.HEROIC_POINTS, ResourceType.GOLD];
    case ActiveView.HERO_ACADEMY:
      return [ResourceType.HEROIC_POINTS, ResourceType.GOLD];
    case ActiveView.DUNGEON_EXPLORE: {
      const resourcesForDungeon = [ResourceType.GOLD];
      if (gameState.activeDungeonRun) {
        const dungeonDef = staticData.dungeonDefinitions[gameState.activeDungeonRun.dungeonDefinitionId];
        if (dungeonDef?.entryCost.some(c => c.resource === ResourceType.CATACOMB_KEY)) {
          resourcesForDungeon.push(ResourceType.CATACOMB_KEY);
        }
      }
      return resourcesForDungeon;
    }
    case ActiveView.STONE_QUARRY_MINIGAME:
      return [
        ResourceType.MINIGAME_DIRT, ResourceType.MINIGAME_CLAY, ResourceType.MINIGAME_SAND,
        ResourceType.MINIGAME_ESSENCE, ResourceType.MINIGAME_CRYSTAL, ResourceType.MINIGAME_EMERALD,
        ResourceType.MINIGAME_RUBY, ResourceType.MINIGAME_SAPPHIRE
      ];
    case ActiveView.GOLD_MINE_MINIGAME:
        return [ResourceType.GOLD, ResourceType.GOLD_ORE, ResourceType.DIAMOND_ORE, ResourceType.DIRT, ResourceType.STONE];
    case ActiveView.ACTION_BATTLE_VIEW:
      return [ResourceType.GOLD, ResourceType.HEROIC_POINTS];
    case ActiveView.SHARED_SKILL_TREE:
      return [ResourceType.HEROIC_POINTS, ResourceType.GOLD];
    case ActiveView.DEMONICON_PORTAL:
      return [ResourceType.DEMONIC_COIN, ResourceType.GOLD, ResourceType.HEROIC_POINTS];
    case ActiveView.DUNGEON_REWARD:
      return [ResourceType.GOLD, ResourceType.HEROIC_POINTS];
    case ActiveView.WORLD_MAP: // Add case for World Map
      return [ResourceType.GOLD, ResourceType.FOOD, ResourceType.HEROIC_POINTS]; // Example resources for world map
    default:
      return [ResourceType.GOLD, ResourceType.HEROIC_POINTS];
  }
};

const TopBar: React.FC<TopBarProps> = ({ onToggleAccountLevelModal }) => {
  const { gameState, dispatch, getGlobalBonuses, staticData } = useGameContext();
  const [showAllResources, setShowAllResources] = useState(false);
  const [isDungeonModalOpen, setIsDungeonModalOpen] = useState(false);
  const [isQuestLogModalOpen, setIsQuestLogModalOpen] = useState(false);

  const productionRates = useMemo(() => {
    const rates: Partial<Record<ResourceType, number>> = {};
    const currentGlobalBonuses = getGlobalBonuses();

    gameState.buildings.forEach(b => {
      if (b.level === 0) return;
      const def = BUILDING_DEFINITIONS[b.id];
      if (def && def.isProducer) {
        const prod = calculateBuildingProduction(def, b.level);
        prod.forEach(p => {
          let amountPerTickWithBonus = p.amountPerTick;
          if (p.resource !== ResourceType.TOWN_XP &&
              p.resource !== ResourceType.HEROIC_POINTS &&
              p.resource !== ResourceType.CATACOMB_BLUEPRINT &&
              p.resource !== ResourceType.AETHERIUM) {
             amountPerTickWithBonus *= (1 + currentGlobalBonuses.allResourceProductionBonus);
          }

          if (p.resource === ResourceType.TOWN_XP) {
            // Town XP is handled by totalTownXp
          } else if (p.resource === ResourceType.HEROIC_POINTS) {
            amountPerTickWithBonus *= (1 + currentGlobalBonuses.heroXpGainBonus); // Apply hero XP gain bonus
            rates[p.resource] = (rates[p.resource] || 0) + amountPerTickWithBonus;
          }
          else {
            rates[p.resource] = (rates[p.resource] || 0) + amountPerTickWithBonus;
          }
        });
      }
    });

    const farmHerbUpgrade = staticData.buildingSpecificUpgradeDefinitions['FARM']?.find(upg => upg.id === 'FARM_HERB_CULTIVATION');
    const farmHerbLevel = gameState.buildingSpecificUpgradeLevels['FARM']?.['FARM_HERB_CULTIVATION'] || 0;
    if (farmHerbUpgrade && farmHerbLevel > 0) {
        farmHerbUpgrade.effects.forEach(effect => {
            if (effect.passiveHerbProduction) {
                const effectValue = getTownHallUpgradeEffectValue(effect as any, farmHerbLevel);
                rates[effect.passiveHerbProduction.herbType] = (rates[effect.passiveHerbProduction.herbType] || 0) + effectValue;
            }
        });
    }

    return rates;
  }, [gameState.buildings, gameState.buildingSpecificUpgradeLevels, getGlobalBonuses, staticData.townHallUpgradeDefinitions, staticData.buildingSpecificUpgradeDefinitions]);


  const allGameResourceTypes = useMemo(() => Object.values(ResourceType), []);

  const displayedResourceTypes = useMemo(() => {
    return getContextualResources(gameState.activeView, gameState.battleState, gameState, allGameResourceTypes, staticData);
  }, [gameState.activeView, gameState.battleState, gameState, allGameResourceTypes, staticData]);


  const explorerGuildExists = gameState.buildings.some(b => b.id === 'EXPLORERS_GUILD' && b.level > 0);
  const canAccessHeroAcademy = gameState.heroes.length > 0;

  const mainViewButtonText = () => {
    if (gameState.activeView === ActiveView.TOWN || gameState.activeView === ActiveView.WORLD_MAP) return 'Go to Battle';
    return 'Go to Town';
  };

  const handleMainViewToggle = () => {
    if (gameState.activeView === ActiveView.TOWN || gameState.activeView === ActiveView.WORLD_MAP) {
      if (gameState.activeDungeonGrid) {
        dispatch({ type: 'SET_ACTIVE_VIEW', payload: ActiveView.DUNGEON_EXPLORE });
      } else if (gameState.battleState && gameState.battleState.status === 'FIGHTING') {
        dispatch({ type: 'SET_ACTIVE_VIEW', payload: ActiveView.BATTLEFIELD });
      } else if (gameState.actionBattleState && gameState.actionBattleState.status === 'FIGHTING') {
        dispatch({ type: 'SET_ACTIVE_VIEW', payload: ActiveView.ACTION_BATTLE_VIEW });
      } else {
        dispatch({ type: 'SET_ACTIVE_VIEW', payload: ActiveView.BATTLEFIELD });
      }
    } else {
      dispatch({ type: 'SET_ACTIVE_VIEW', payload: ActiveView.TOWN });
    }
  };

  const heroAcademyActionableCount = useMemo(() => {
    if (!gameState || !staticData) return 0;
    let actionableHeroes = 0;
    gameState.heroes.forEach(hero => {
      let heroIsActionable = false;
      if (hero.skillPoints > 0) {
        heroIsActionable = true;
      } else {
        const shardGroups: Record<string, Record<number, number>> = {};
        (hero.ownedShards || []).forEach(shard => {
          if (!shardGroups[shard.definitionId]) shardGroups[shard.definitionId] = {};
          shardGroups[shard.definitionId][shard.level] = (shardGroups[shard.definitionId][shard.level] || 0) + 1;
        });
        for (const defId in shardGroups) {
          for (const level in shardGroups[defId]) {
            if (shardGroups[defId][Number(level)] >= 2) {
              heroIsActionable = true;
              break;
            }
          }
          if (heroIsActionable) break;
        }
      }
      if (heroIsActionable) {
        actionableHeroes++;
      }
    });
    return actionableHeroes;
  }, [gameState.heroes, staticData.shardDefinitions]);

  const sharedPassivesActionableCount = useMemo(() => {
    if (!gameState || !staticData) return 0;
    let upgradableSkillCount = 0;

    Object.values(staticData.sharedSkillDefinitions).forEach(skillDef => {
      if (skillDef.id === 'SHARED_ORIGIN') return;

      const progress: PlayerSharedSkillProgress = gameState.playerSharedSkills[skillDef.id] || { currentMajorLevel: 0, currentMinorLevel: 0 };
      const currentMajorLevel = progress.currentMajorLevel;
      const currentMinorLevel = progress.currentMinorLevel;

      let prerequisitesMet = true;
      if (skillDef.prerequisites) {
        prerequisitesMet = skillDef.prerequisites.every(prereq =>
          (gameState.playerSharedSkills[prereq.skillId]?.currentMajorLevel || 0) >= prereq.majorLevel
        );
      }
      if (!prerequisitesMet) return;

      const isMaxMajorLevel = currentMajorLevel >= skillDef.maxMajorLevels;
      const minorLevelsInCurrentTier = currentMajorLevel > 0 && skillDef.minorLevelsPerMajorTier.length >= currentMajorLevel ? (skillDef.minorLevelsPerMajorTier[currentMajorLevel - 1] || 0) : (currentMajorLevel === 0 ? (skillDef.minorLevelsPerMajorTier[0] || 0) : 0);
      const isMaxMinorLevelForCurrentTier = currentMajorLevel > 0 && currentMinorLevel >= minorLevelsInCurrentTier;

      let canUpgradeThisSkill = false;

      if (!isMaxMajorLevel && (currentMajorLevel === 0 || isMaxMinorLevelForCurrentTier)) {
        const majorUpgradeCost = skillDef.costSharedSkillPointsPerMajorLevel[currentMajorLevel];
        if (majorUpgradeCost !== undefined && gameState.playerSharedSkillPoints >= majorUpgradeCost) {
          canUpgradeThisSkill = true;
        }
      }

      if (!canUpgradeThisSkill && currentMajorLevel > 0 && !isMaxMinorLevelForCurrentTier && minorLevelsInCurrentTier > 0) {
        const minorUpgradeCostXP = skillDef.costHeroXpPoolPerMinorLevel(currentMajorLevel, currentMinorLevel);
        if ((gameState.resources[ResourceType.HEROIC_POINTS] || 0) >= minorUpgradeCostXP) {
          canUpgradeThisSkill = true;
        }
      }
      if (canUpgradeThisSkill) {
        upgradableSkillCount++;
      }
    });
    return upgradableSkillCount;
  }, [gameState.playerSharedSkillPoints, gameState.playerSharedSkills, gameState.resources, staticData.sharedSkillDefinitions]);

  const claimableQuestsCount = useMemo(() => {
    if (!gameState) return 0;
    const count = gameState.activeQuests.filter(q => q.isCompleted && !q.isClaimed).length;
    return count;
  }, [gameState.activeQuests]);


  const renderBadge = (count: number) => {
    if (count <= 0) return null;
    return (
      <span className="absolute top-0 right-0 bg-red-500 text-white text-[0.5rem] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
        {count > 9 ? '9+' : count}
      </span>
    );
  };

  return (
    <>
      <div className="bg-slate-800/80 backdrop-blur-md p-3 shadow-lg flex justify-between items-center sticky top-0 z-40 flex-wrap gap-2">
        <div className="flex items-center space-x-2 sm:space-x-4 flex-wrap gap-y-1">
           <div
            className="flex items-center space-x-1 p-1.5 rounded-md bg-slate-700/50 hover:bg-slate-600/70 cursor-pointer transition-colors"
            title={`Account Level: ${gameState.accountLevel}. Click for details.`}
            onClick={onToggleAccountLevelModal} // Added onClick
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onToggleAccountLevelModal(); }}
           >
                {ICONS.XP_ICON && <ICONS.XP_ICON className="w-5 h-5 text-yellow-400" />}
                <span className="text-yellow-300 font-semibold">Acc. Lvl:</span>
                <span className="text-slate-100 font-bold">{gameState.accountLevel}</span>
                <span className="text-xs text-slate-400">({formatNumber(gameState.accountXP)}/{formatNumber(gameState.expToNextAccountLevel)} XP)</span>
            </div>
          {displayedResourceTypes.map(resType => {

            const isMinigameView = gameState.activeView === ActiveView.STONE_QUARRY_MINIGAME || gameState.activeView === ActiveView.GOLD_MINE_MINIGAME;
            const value = resType === ResourceType.TOWN_XP ? gameState.totalTownXp : (gameState.resources[resType] || 0);
            const rate = productionRates[resType];

            if (gameState.activeView === ActiveView.TOWN) {
                 if (resType !== ResourceType.GOLD && resType !== ResourceType.TOWN_XP) return null;
            } else if (!isMinigameView && value === 0 && !rate && ![ResourceType.GOLD, ResourceType.TOWN_XP, ResourceType.HEROIC_POINTS].includes(resType)) {
                return null;
            }

            if (resType === ResourceType.DEMONIC_COIN && !gameState.buildings.some(b => b.id === 'DEMONICON_GATE' && b.level > 0)) {
                return null;
            }
            return (
              <ResourceItem
                key={resType}
                iconName={ICONS[resType] ? resType : 'STONE'}
                value={value}
                label={resType}
                rate={rate}
              />
            );
          })}
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => setShowAllResources(true)} variant="secondary" size="sm">All Resources</Button>
          <Button
            onClick={() => setIsQuestLogModalOpen(true)}
            variant="secondary"
            size="sm"
            icon={ICONS.QUEST_ICON && <ICONS.QUEST_ICON className="w-4 h-4" />}
            className="relative"
          >
            Quests
            {renderBadge(claimableQuestsCount)}
          </Button>
          {explorerGuildExists && (
              <Button onClick={() => setIsDungeonModalOpen(true)} variant="secondary" size="sm" icon={ICONS.COMPASS && <ICONS.COMPASS className="w-4 h-4"/>}>
                  Dungeons
              </Button>
          )}
          {gameState.activeView !== ActiveView.WORLD_MAP && ( // New Button for World Map
            <Button
              onClick={() => dispatch({ type: 'SET_ACTIVE_VIEW', payload: ActiveView.WORLD_MAP })}
              variant="secondary"
              size="sm"
              icon={ICONS.MAP_ICON && <ICONS.MAP_ICON className="w-4 h-4"/>}
            >
              World Map
            </Button>
          )}
          {canAccessHeroAcademy && gameState.activeView !== ActiveView.HERO_ACADEMY && (
            <Button
              onClick={() => dispatch({ type: 'SET_ACTIVE_VIEW', payload: ActiveView.HERO_ACADEMY })}
              variant="secondary"
              size="sm"
              icon={ICONS.SKILL && <ICONS.SKILL className="w-4 h-4"/>}
              className="relative"
            >
              Hero Academy
              {renderBadge(heroAcademyActionableCount)}
            </Button>
          )}
          {gameState.activeView !== ActiveView.SHARED_SKILL_TREE && (
            <Button
              onClick={() => dispatch({ type: 'SET_ACTIVE_VIEW', payload: ActiveView.SHARED_SKILL_TREE })}
              variant="secondary"
              size="sm"
              icon={ICONS.UPGRADE && <ICONS.UPGRADE className="w-4 h-4"/>}
              className="relative"
            >
              Shared Passives
              {renderBadge(sharedPassivesActionableCount)}
            </Button>
          )}
          <Button onClick={handleMainViewToggle} variant="primary" size="sm">
            {mainViewButtonText()}
          </Button>
        </div>
      </div>
      <Modal isOpen={showAllResources} onClose={() => setShowAllResources(false)} title="All Resources">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {allGameResourceTypes.map(rt => {
            let rate: number | undefined = productionRates[rt];
            const displayValue = rt === ResourceType.TOWN_XP ? gameState.totalTownXp : (gameState.resources[rt] || 0);

            if (rt === ResourceType.DEMONIC_COIN && !gameState.buildings.some(b => b.id === 'DEMONICON_GATE' && b.level > 0)) {
                return null;
            }
            return (
                <ResourceItem
                key={rt}
                iconName={ICONS[rt] ? rt : 'STONE'}
                value={displayValue}
                label={rt}
                rate={rate}
                />
            );
          })}
        </div>
      </Modal>
      {explorerGuildExists && (
        <DungeonSelectionModal
            isOpen={isDungeonModalOpen}
            onClose={() => setIsDungeonModalOpen(false)}
        />
      )}
      <QuestLogModal
        isOpen={isQuestLogModalOpen}
        onClose={() => setIsQuestLogModalOpen(false)}
      />
    </>
  );
};

export default TopBar;
