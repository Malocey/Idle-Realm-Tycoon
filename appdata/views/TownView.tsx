
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useGameContext } from '../context';
import { ICONS } from '../components/Icons';
import { RESOURCE_COLORS } from '../constants';
import { BUILDING_DEFINITIONS, HERO_DEFINITIONS } from '../gameData/index';
import Button from '../components/Button';
import { formatNumber, canAfford } from '../utils';
import { GameNotification, PlayerBuildingState, ResourceType, Cost, BuildingDefinition, HeroDefinition } from '../types';
import TownHallUpgradeModal from '../components/TownHallUpgradeModal';
import ForgeUpgradeModal from '../components/ForgeUpgradeModal';
import DungeonSelectionModal from '../components/DungeonSelectionModal';
import BuildingSpecificUpgradeModal from '../components/BuildingSpecificUpgradeModal';
import GuildHallUpgradeModal from '../components/GuildHallUpgradeModal';
import AlchemistLabModal from '../components/AlchemistLabModal';
import LibraryModal from '../components/LibraryModal';

// Import new tab components
import MyBuildingsTab from './TownView/MyBuildingsTab';
import ConstructionTab from './TownView/ConstructionTab';
import RecruitmentTab from './TownView/RecruitmentTab';


type TownViewTab = 'MY_BUILDINGS' | 'CONSTRUCTION' | 'RECRUITMENT';
const TOWN_VIEW_TABS_ORDER: TownViewTab[] = ['MY_BUILDINGS', 'CONSTRUCTION', 'RECRUITMENT'];
const TAB_TRANSITION_DURATION = 300; // ms, should match CSS animation

const TownView: React.FC = () => {
  const { gameState, dispatch, getGlobalBonuses } = useGameContext();
  
  const [activeTownTab, setActiveTownTab] = useState<TownViewTab>('MY_BUILDINGS');
  const [previousTownTab, setPreviousTownTab] = useState<TownViewTab | null>(null);
  const [isTransitioningTabs, setIsTransitioningTabs] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState<'left' | 'right' | null>(null);

  const [isTownHallUpgradeModalOpen, setIsTownHallUpgradeModalOpen] = useState(false);
  const [isForgeUpgradeModalOpen, setIsForgeUpgradeModalOpen] = useState(false);
  const [isDungeonSelectionModalOpen, setIsDungeonSelectionModalOpen] = useState(false);
  const [isGuildHallUpgradeModalOpen, setIsGuildHallUpgradeModalOpen] = useState(false);
  const [isAlchemistLabModalOpen, setIsAlchemistLabModalOpen] = useState(false);
  const [isLibraryModalOpen, setIsLibraryModalOpen] = useState(false);
  const [selectedBuildingForSpecificUpgrades, setSelectedBuildingForSpecificUpgrades] = useState<string | null>(null);
  const [animatingCardId, setAnimatingCardId] = useState<string | null>(null);

  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const tabButtonRefs = {
    MY_BUILDINGS: useRef<HTMLButtonElement>(null),
    CONSTRUCTION: useRef<HTMLButtonElement>(null),
    RECRUITMENT: useRef<HTMLButtonElement>(null),
  };

  useEffect(() => {
    const activeTabRef = tabButtonRefs[activeTownTab]?.current;
    if (activeTabRef) {
      setIndicatorStyle({
        left: activeTabRef.offsetLeft,
        width: activeTabRef.offsetWidth,
      });
    }
  }, [activeTownTab, tabButtonRefs.MY_BUILDINGS, tabButtonRefs.CONSTRUCTION, tabButtonRefs.RECRUITMENT]);

  const handleTabChange = (newTab: TownViewTab) => {
    if (newTab !== activeTownTab && !isTransitioningTabs) {
      const oldTabIndex = TOWN_VIEW_TABS_ORDER.indexOf(activeTownTab);
      const newTabIndex = TOWN_VIEW_TABS_ORDER.indexOf(newTab);

      setPreviousTownTab(activeTownTab);
      setActiveTownTab(newTab);
      setIsTransitioningTabs(true);
      setTransitionDirection(newTabIndex > oldTabIndex ? 'right' : 'left');

      setTimeout(() => {
        setIsTransitioningTabs(false);
        setPreviousTownTab(null);
      }, TAB_TRANSITION_DURATION);
    }
  };
  
  useEffect(() => {
    if (animatingCardId) {
      const timer = setTimeout(() => setAnimatingCardId(null), 600); 
      return () => clearTimeout(timer);
    }
  }, [animatingCardId]);

  const globalBonuses = getGlobalBonuses();

  const unbuiltBuildingsRaw = Object.values(BUILDING_DEFINITIONS).filter(bd => !gameState.buildings.find(b => b.id === bd.id));

  const sortedUnbuiltBuildings = useMemo(() => {
    return unbuiltBuildingsRaw.sort((a, b) => {
      const costA = a.baseCost.map(c => ({
        ...c,
        amount: Math.max(1, Math.floor(c.amount * (1 - globalBonuses.buildingCostReduction)))
      }));
      const canAffordA = canAfford(gameState.resources, costA);
      const isLockedA = a.unlockWaveRequirement !== undefined && gameState.currentWaveProgress < a.unlockWaveRequirement;

      const costB = b.baseCost.map(c => ({
        ...c,
        amount: Math.max(1, Math.floor(c.amount * (1 - globalBonuses.buildingCostReduction)))
      }));
      const canAffordB = canAfford(gameState.resources, costB);
      const isLockedB = b.unlockWaveRequirement !== undefined && gameState.currentWaveProgress < b.unlockWaveRequirement;

      // Scoring: Lower is better.
      // Affordable & Unlocked: (0) + (0) = 0
      // Affordable & Locked:   (0) + (1) = 1
      // Unaffordable & Unlocked: (2) + (0) = 2
      // Unaffordable & Locked:   (2) + (1) = 3
      const scoreA = (canAffordA ? 0 : 2) + (isLockedA ? 1 : 0);
      const scoreB = (canAffordB ? 0 : 2) + (isLockedB ? 1 : 0);

      if (scoreA !== scoreB) {
        return scoreA - scoreB;
      }

      // If scores are equal, sort by wave requirement (lower first)
      const waveA = a.unlockWaveRequirement === undefined ? -1 : a.unlockWaveRequirement;
      const waveB = b.unlockWaveRequirement === undefined ? -1 : b.unlockWaveRequirement;
      if (waveA !== waveB) {
        return waveA - waveB;
      }

      // Then by name for stability
      return a.name.localeCompare(b.name);
    });
  }, [unbuiltBuildingsRaw, gameState.resources, gameState.currentWaveProgress, globalBonuses.buildingCostReduction]);


  const availableConstructionCount = useMemo(() => {
    return unbuiltBuildingsRaw.filter(def => {
        const isUnlocked = def.unlockWaveRequirement === undefined || gameState.currentWaveProgress >= def.unlockWaveRequirement;
        if (!isUnlocked) return false;
        const actualBuildCost = def.baseCost.map(c => ({
            ...c,
            amount: Math.max(1, Math.floor(c.amount * (1 - globalBonuses.buildingCostReduction)))
          }));
        return canAfford(gameState.resources, actualBuildCost);
      }).length;
  }, [unbuiltBuildingsRaw, gameState.currentWaveProgress, gameState.resources, globalBonuses.buildingCostReduction]);


  const unrecruitedHeroes = Object.values(HERO_DEFINITIONS).filter(hd => !gameState.heroes.find(h => h.definitionId === hd.id));
  const availableRecruitmentCount = unrecruitedHeroes.filter(heroDef => {
    const isUnlocked = heroDef.unlockWaveRequirement === undefined || gameState.currentWaveProgress >= heroDef.unlockWaveRequirement;
    if (!isUnlocked) return false;
    
    let recruitmentCost = heroDef.recruitmentCost ? [...heroDef.recruitmentCost] : [];
    if (recruitmentCost.length > 0 && globalBonuses.heroRecruitmentCostReduction > 0) {
        recruitmentCost = recruitmentCost.map(cost => ({
            ...cost,
            amount: Math.max(1, Math.floor(cost.amount * (1 - globalBonuses.heroRecruitmentCostReduction)))
        }));
    }
    return canAfford(gameState.resources, recruitmentCost);
  }).length;


  const handleOpenBuildingSpecificUpgrades = (buildingId: string) => {
    setSelectedBuildingForSpecificUpgrades(buildingId);
  };

  const handleCloseBuildingSpecificUpgrades = () => {
    setSelectedBuildingForSpecificUpgrades(null);
  };

  const handleConstructBuilding = (defId: string, canAffordBuild: boolean) => {
    if (canAffordBuild) {
      setAnimatingCardId(defId);
      dispatch({ type: 'CONSTRUCT_BUILDING', payload: { buildingId: defId } });
    }
  };

  const handleRecruitHero = (heroDefId: string, canAffordRecruit: boolean) => {
    if (canAffordRecruit) {
      setAnimatingCardId(heroDefId);
      dispatch({ type: 'RECRUIT_HERO', payload: { heroId: heroDefId } });
    }
  };

  const handleOpenStoneQuarryMinigame = () => {
    dispatch({ type: 'STONE_QUARRY_MINIGAME_INIT' }); 
    dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'STONE_QUARRY_MINIGAME' });
  };
  
  const handleOpenGoldMineMinigame = () => { 
    dispatch({ type: 'GOLD_MINE_MINIGAME_INIT' });
    dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'GOLD_MINE_MINIGAME' });
  };

  const handleEnterColosseum = () => {
    dispatch({ type: 'START_ACTION_BATTLE' });
    dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'ACTION_BATTLE_VIEW' });
  };
  
  const handleOpenDemoniconPortal = () => {
    dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'DEMONICON_PORTAL' });
  };

  const renderSingleTabContent = (tabKey: TownViewTab | null) => {
    if (!tabKey) return null;

    switch (tabKey) {
      case 'MY_BUILDINGS':
        return (
          <MyBuildingsTab
            buildings={gameState.buildings}
            onOpenTownHallUpgrades={() => setIsTownHallUpgradeModalOpen(true)}
            onOpenGuildHallUpgrades={() => setIsGuildHallUpgradeModalOpen(true)}
            onOpenAlchemistLab={() => setIsAlchemistLabModalOpen(true)}
            onOpenForgeUpgrades={() => setIsForgeUpgradeModalOpen(true)}
            onOpenDungeonSelection={() => setIsDungeonSelectionModalOpen(true)}
            onOpenBuildingSpecificUpgrades={handleOpenBuildingSpecificUpgrades}
            onOpenLibrary={() => setIsLibraryModalOpen(true)}
            onOpenStoneQuarryMinigame={handleOpenStoneQuarryMinigame}
            onOpenGoldMineMinigame={handleOpenGoldMineMinigame} 
            onEnterColosseum={handleEnterColosseum}
            onOpenDemoniconPortal={handleOpenDemoniconPortal}
          />
        );
      case 'CONSTRUCTION':
        return (
          <ConstructionTab
            unbuiltBuildings={sortedUnbuiltBuildings}
            gameState={gameState}
            globalBonuses={globalBonuses}
            handleConstructBuilding={handleConstructBuilding}
            animatingCardId={animatingCardId}
          />
        );
      case 'RECRUITMENT':
        return (
          <RecruitmentTab
            heroes={gameState.heroes}
            unrecruitedHeroes={unrecruitedHeroes}
            gameState={gameState}
            globalBonuses={globalBonuses}
            handleRecruitHero={handleRecruitHero}
            animatingCardId={animatingCardId}
          />
        );
      default:
        return null;
    }
  };

  const getAnimationClasses = (tabKey: TownViewTab | null, isExiting: boolean): string => {
    if (!isTransitioningTabs || tabKey !== (isExiting ? previousTownTab : activeTownTab)) {
        return ''; 
    }
    if (isExiting) {
        return transitionDirection === 'right' ? 'animate-tab-slide-out-left' : 'animate-tab-slide-out-right';
    } else { 
        return transitionDirection === 'right' ? 'animate-tab-slide-in-right' : 'animate-tab-slide-in-left';
    }
  };


  const tabButtonStyle = (tabName: TownViewTab, ref: React.RefObject<HTMLButtonElement>) => 
    `relative px-4 py-2 text-sm font-medium rounded-t-lg focus:outline-none transition-colors duration-150 flex items-center
     ${activeTownTab === tabName 
       ? 'text-sky-300'
       : 'bg-transparent hover:bg-slate-700/50 text-slate-400 hover:text-slate-200'}`;

  return (
    <div className="p-4 space-y-6">
      <div className="relative flex border-b border-slate-700 mb-4">
        {TOWN_VIEW_TABS_ORDER.map(tabId => (
            <button 
                key={tabId}
                ref={tabButtonRefs[tabId]} 
                className={tabButtonStyle(tabId, tabButtonRefs[tabId])} 
                onClick={() => handleTabChange(tabId)}
            >
            {tabId.replace('_', ' ')}
            {tabId === 'CONSTRUCTION' && availableConstructionCount > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {availableConstructionCount}
                </span>
            )}
            {tabId === 'RECRUITMENT' && availableRecruitmentCount > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {availableRecruitmentCount}
                </span>
            )}
            </button>
        ))}
        <div
          className="absolute bottom-0 h-0.5 bg-sky-500 transition-all duration-300 ease-in-out"
          style={{ left: indicatorStyle.left, width: indicatorStyle.width }}
        />
      </div>
      
      <div className="relative min-h-[300px]"> 
        {isTransitioningTabs && previousTownTab && (
          <div 
            key={`${previousTownTab}-exit`} 
            className={`tab-content-transition-wrapper ${getAnimationClasses(previousTownTab, true)}`}
          >
            {renderSingleTabContent(previousTownTab)}
          </div>
        )}
        <div 
          key={activeTownTab} 
          className={isTransitioningTabs ? `tab-content-transition-wrapper ${getAnimationClasses(activeTownTab, false)}` : ''}
        >
          {renderSingleTabContent(activeTownTab)}
        </div>
      </div>


      <TownHallUpgradeModal
        isOpen={isTownHallUpgradeModalOpen}
        onClose={() => setIsTownHallUpgradeModalOpen(false)}
      />
      <GuildHallUpgradeModal
        isOpen={isGuildHallUpgradeModalOpen}
        onClose={() => setIsGuildHallUpgradeModalOpen(false)}
      />
      <AlchemistLabModal
        isOpen={isAlchemistLabModalOpen}
        onClose={() => setIsAlchemistLabModalOpen(false)}
      />
      <LibraryModal
        isOpen={isLibraryModalOpen}
        onClose={() => setIsLibraryModalOpen(false)}
      />
      <ForgeUpgradeModal
        isOpen={isForgeUpgradeModalOpen}
        onClose={() => setIsForgeUpgradeModalOpen(false)}
      />
      <DungeonSelectionModal
        isOpen={isDungeonSelectionModalOpen}
        onClose={() => setIsDungeonSelectionModalOpen(false)}
      />
      {selectedBuildingForSpecificUpgrades && (
        <BuildingSpecificUpgradeModal
          isOpen={!!selectedBuildingForSpecificUpgrades}
          onClose={handleCloseBuildingSpecificUpgrades}
          buildingId={selectedBuildingForSpecificUpgrades}
        />
      )}
    </div>
  );
};

export default TownView;
