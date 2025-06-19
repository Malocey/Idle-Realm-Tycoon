
import React, { useState, useEffect, useMemo } from 'react';
import { GameProvider, useGameContext } from './context';
import TopBar from './components/TopBar';
import TownView from './views/TownView';
import BattleView from './views/BattleView';
import NotificationArea from './components/NotificationArea';
import Footer from './components/Footer';
import DungeonRewardModal from './components/DungeonRewardModal'; 
import HeroAcademyView from './views/HeroAcademyView'; 
import DungeonExploreView from './views/DungeonExploreView'; 
import CheatMenuModal from './components/CheatMenuModal';
import StoneQuarryMinigameView from './views/StoneQuarryMinigameView';
import ActionBattleView from './views/ActionBattleView'; // Corrected import if ActionBattleView exports default
import SharedSkillTreeView from './views/SharedSkillTreeView'; 
import GoldMineMinigameView from './views/GoldMineMinigameView';
import DemoniconPortalView from './views/DemoniconPortalView';
import WorldMapView from './views/WorldMapView'; 
import AccountLevelInfoModal from './components/AccountLevelInfoModal'; 
import AcademyModal from './components/AcademyModal'; 
import AutoBattlerView from './views/AutoBattlerView';
import EndOfBattleModal from './components/EndOfBattleModal'; 
import { GameState, ActiveView, BattleSummary, ResourceType } from './types'; 

const VIEW_TRANSITION_DURATION = 400; // ms, should match CSS animation duration

const AppContentInternal: React.FC = () => {
  const context = useGameContext(); 
  const [isCheatMenuModalOpen, setIsCheatMenuModalOpen] = useState(false);
  const [isAccountLevelModalOpen, setIsAccountLevelModalOpen] = useState(false); 
  
  const [currentView, setCurrentView] = useState<ActiveView | null>(null); 
  const [previousView, setPreviousView] = useState<ActiveView | null>(null); 
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [battleSummaryForModal, setBattleSummaryForModal] = useState<BattleSummary | null>(null);


  useEffect(() => {
    if (!context) return;
    const newActiveView = context.gameState.activeView;

    if (currentView === null) { 
      setCurrentView(newActiveView);
      if (newActiveView === ActiveView.END_OF_BATTLE_SUMMARY) {
        setBattleSummaryForModal(context.gameState.battleSummary); 
      }
    } else if (newActiveView !== currentView && !isTransitioning) {
      setIsTransitioning(true);
      setPreviousView(currentView);
      setCurrentView(newActiveView); 

      if (newActiveView === ActiveView.END_OF_BATTLE_SUMMARY) {
        setBattleSummaryForModal(context.gameState.battleSummary);
      } else {
        if (currentView === ActiveView.END_OF_BATTLE_SUMMARY) {
           if (battleSummaryForModal) { 
             context.dispatch({ type: 'CLEAR_BATTLE_SUMMARY' });
           }
           setBattleSummaryForModal(null);
        }
      }

      setTimeout(() => {
        setIsTransitioning(false);
        setPreviousView(null); 
      }, VIEW_TRANSITION_DURATION);
    }
  }, [context?.gameState.activeView, context?.gameState.battleSummary, currentView, isTransitioning, battleSummaryForModal, context]);


  if (!context) {
    return <div className="h-screen flex items-center justify-center text-2xl">Initializing Game Context...</div>;
  }
  
  const [isAppInitialized, setIsAppInitialized] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAppInitialized(true);
    }, 100); 
    return () => clearTimeout(timer);
  }, []);

  if (!isAppInitialized) {
    return <div className="h-screen flex items-center justify-center text-2xl">Loading Idle Realm Tycoon...</div>;
  }

  const toggleCheatMenuModal = () => {
    setIsCheatMenuModalOpen(prev => !prev);
  };

  const toggleAccountLevelModal = () => { 
    setIsAccountLevelModalOpen(prev => !prev);
  };

  const renderView = (viewName: ActiveView | null, isExiting: boolean) => { 
    if (!viewName) return null;
    
    let viewComponent;
    switch (viewName) {
      case ActiveView.TOWN: viewComponent = <TownView />; break;
      case ActiveView.BATTLEFIELD: viewComponent = <BattleView />; break;
      case ActiveView.HERO_ACADEMY: viewComponent = <HeroAcademyView />; break;
      case ActiveView.DUNGEON_EXPLORE: viewComponent = <DungeonExploreView />; break;
      case ActiveView.STONE_QUARRY_MINIGAME: viewComponent = <StoneQuarryMinigameView />; break;
      case ActiveView.ACTION_BATTLE_VIEW: viewComponent = <ActionBattleView />; break;
      case ActiveView.SHARED_SKILL_TREE: viewComponent = <SharedSkillTreeView />; break; 
      case ActiveView.GOLD_MINE_MINIGAME: viewComponent = <GoldMineMinigameView />; break;
      case ActiveView.DEMONICON_PORTAL: viewComponent = <DemoniconPortalView />; break;
      case ActiveView.WORLD_MAP: viewComponent = <WorldMapView />; break;
      case ActiveView.ACADEMY_OF_SCHOLARS: 
        viewComponent = (
          <AcademyModal 
            isOpen={true} 
            onClose={() => context.dispatch({ type: 'SET_ACTIVE_VIEW', payload: ActiveView.TOWN })} 
          />
        ); 
        break;
      case ActiveView.AUTO_BATTLER: viewComponent = <AutoBattlerView />; break;
      default: return null;
    }

    const animationClass = isExiting ? 'view-exit-active' : 'view-enter-active';
    
    return (
        <div 
            key={viewName + (isExiting ? '-exit' : '-enter')} 
            className={`view-transition-wrapper ${animationClass}`}
        >
            {viewComponent}
        </div>
    );
  };

  const handleReturnToTownFromModal = () => {
    context.dispatch({ type: 'CLEAR_BATTLE_SUMMARY' });
    context.dispatch({ type: 'SET_ACTIVE_VIEW', payload: ActiveView.TOWN });
  };

  const handleRetryChallengeFromModal = () => {
    if (!battleSummaryForModal) return;
    context.dispatch({ type: 'CLEAR_BATTLE_SUMMARY' });

    if (battleSummaryForModal.wasDemoniconBattle && battleSummaryForModal.demoniconEnemyIdForRetry && battleSummaryForModal.demoniconRankForRetry !== undefined) {
        context.dispatch({ type: 'START_DEMONICON_CHALLENGE', payload: { enemyId: battleSummaryForModal.demoniconEnemyIdForRetry, rank: battleSummaryForModal.demoniconRankForRetry } });
    } else if (battleSummaryForModal.sourceMapNodeId) {
        const mapNode = context.staticData.worldMapDefinitions[context.gameState.currentMapId]?.nodes.find(n => n.id === battleSummaryForModal.sourceMapNodeId);
        if (mapNode) {
            const payload: any = {
                isAutoProgression: false,
                sourceMapNodeId: battleSummaryForModal.sourceMapNodeId,
            };
            if (battleSummaryForModal.customWaveSequenceForRetry && battleSummaryForModal.customWaveSequenceForRetry.length > 0) {
                payload.customWaveSequence = battleSummaryForModal.customWaveSequenceForRetry;
                payload.currentCustomWaveIndex = battleSummaryForModal.currentCustomWaveIndexForRetry !== undefined ? battleSummaryForModal.currentCustomWaveIndexForRetry : 0;
            } else {
                // For non-custom sequence map battles, waveNumberForRetry should be the starting wave of that node.
                payload.waveNumber = battleSummaryForModal.waveNumberForRetry || 1;
            }
            context.dispatch({ type: 'START_BATTLE_PREPARATION', payload });
        } else {
            // Fallback if map node definition is somehow lost
            context.dispatch({ type: 'SET_ACTIVE_VIEW', payload: ActiveView.WORLD_MAP }); 
        }
    } else if (battleSummaryForModal.wasDungeonGridBattle || battleSummaryForModal.wasDungeonBattle) {
        // Retrying a specific dungeon battle is complex; for now, return to explore.
        // A more complete retry would involve restarting the floor or a specific encounter.
        context.dispatch({ type: 'SET_ACTIVE_VIEW', payload: ActiveView.DUNGEON_EXPLORE });
    } else {
        // Standard wave battle retry, waveNumberForRetry should be 1
        context.dispatch({ type: 'START_BATTLE_PREPARATION', payload: { waveNumber: battleSummaryForModal.waveNumberForRetry || 1 } });
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-slate-900">
      <TopBar onToggleAccountLevelModal={toggleAccountLevelModal} />
      <main className="flex-grow container mx-auto px-0 sm:px-4 py-4 relative overflow-y-auto fancy-scrollbar"> 
        {isTransitioning && previousView && renderView(previousView, true)}
        {currentView && renderView(currentView, false)}
      </main>
      <Footer onToggleCheatMenu={toggleCheatMenuModal} />
      <NotificationArea />
      <DungeonRewardModal 
        isOpen={context.gameState.activeView === ActiveView.DUNGEON_REWARD} 
        onClose={() => context.dispatch({ type: 'END_DUNGEON_RUN', payload: { outcome: 'SUCCESS' }})} 
      />
      <EndOfBattleModal
        isOpen={context.gameState.activeView === ActiveView.END_OF_BATTLE_SUMMARY && !!battleSummaryForModal}
        summary={battleSummaryForModal}
        onClose={() => { 
            if (!battleSummaryForModal) { 
                context.dispatch({ type: 'SET_ACTIVE_VIEW', payload: ActiveView.TOWN });
            } else if (battleSummaryForModal.wasDungeonGridBattle || battleSummaryForModal.wasDungeonBattle) {
                context.dispatch({ type: 'SET_ACTIVE_VIEW', payload: ActiveView.DUNGEON_EXPLORE });
            } else if (battleSummaryForModal.sourceMapNodeId) {
                 context.dispatch({ type: 'SET_ACTIVE_VIEW', payload: ActiveView.WORLD_MAP });
            } else if (battleSummaryForModal.wasDemoniconBattle) {
                 context.dispatch({ type: 'CLEANUP_DEMONICON_STATE' }); 
            } else { 
                context.dispatch({ type: 'SET_ACTIVE_VIEW', payload: ActiveView.TOWN });
            }
            context.dispatch({ type: 'CLEAR_BATTLE_SUMMARY' }); 
        }}
        onRetry={handleRetryChallengeFromModal}
        onReturnToTown={handleReturnToTownFromModal}
      />
      <CheatMenuModal 
        isOpen={isCheatMenuModalOpen}
        onClose={toggleCheatMenuModal}
      />
      <AccountLevelInfoModal
        isOpen={isAccountLevelModalOpen}
        onClose={toggleAccountLevelModal}
      />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <GameProvider>
      <AppContentInternal />
    </GameProvider>
  );
};

export default App;
