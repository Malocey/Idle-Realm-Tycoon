
import React, { useEffect, useState, useRef } from 'react';
import { useGameContext } from '../context';
import Button from '../components/Button';
import { ICONS } from '../components/Icons';
import { formatNumber } from '../utils';
import { GoldMineMinigameGridCell, ResourceType, GoldMinePopupEvent, GoldMineUpgradeDefinition } from '../types';
import GoldMineCellDisplay from '../components/GoldMineMinigameView/GoldMineCellDisplay';
import GoldMineUpgradeCard from '../components/GoldMineMinigameView/GoldMineUpgradeCard'; 
import { RESOURCE_POPUP_DURATION_MS, RESOURCE_COLORS, MAX_GOLD_MINE_DEPTH } from '../constants'; 
import { GOLD_MINE_UPGRADE_DEFINITIONS } from '../gameData';
import MinigameResourcePopup, { MinigameResourcePopupProps } from '../components/MinigameResourcePopup'; // Import the new popup component

// AnimatedPopupDataForView for internal state, maps to MinigameResourcePopupProps
interface AnimatedPopupDataForView extends MinigameResourcePopupProps {
  originalTimestamp: number; 
}

const GoldMineMinigameView: React.FC = () => {
  const { gameState, dispatch, staticData } = useGameContext(); 
  const minigameState = gameState.goldMineMinigame;
  const [animatedPopups, setAnimatedPopups] = useState<AnimatedPopupDataForView[]>([]);
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const [selectedDepthForRun, setSelectedDepthForRun] = useState<number>(1);

  useEffect(() => {
    if (!minigameState) {
      dispatch({ type: 'GOLD_MINE_MINIGAME_INIT' });
    } else {
      setSelectedDepthForRun(minigameState.maxUnlockedDepth || 1);
    }
  }, [minigameState, dispatch]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!minigameState || minigameState.status !== 'MINING_IN_PROGRESS') return;

      let dr = 0;
      let dc = 0;
      switch (event.key.toLowerCase()) {
        case 'w': case 'arrowup': dr = -1; break;
        case 's': case 'arrowdown': dr = 1; break;
        case 'a': case 'arrowleft': dc = -1; break;
        case 'd': case 'arrowright': dc = 1; break;
        default: return;
      }
      event.preventDefault();
      dispatch({ type: 'GOLD_MINE_MINIGAME_MINE_CELL', payload: { dr, dc } });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [minigameState, dispatch]);

  useEffect(() => {
    if (minigameState?.popupEvents && minigameState.popupEvents.length > 0) {
      const newPopupsToAnimate: AnimatedPopupDataForView[] = minigameState.popupEvents.map(event => {
        const cellSize = gridContainerRef.current ? gridContainerRef.current.offsetWidth / minigameState.gridCols : 40;
        const initialOffsetX = (Math.random() - 0.5) * (cellSize * 0.3);
        const initialOffsetY = (Math.random() - 0.5) * (cellSize * 0.3);

        const topStyle = `calc(${(event.r + 0.5) * (100 / minigameState.gridRows)}% + ${initialOffsetY}px)`;
        const leftStyle = `calc(${(event.c + 0.5) * (100 / minigameState.gridCols)}% + ${initialOffsetX}px)`;
        
        const arcHorizontalDrift = (Math.random() - 0.5) * 25;
        const arcVerticalPeak = -30 - Math.random() * 15;
        const arcVerticalFall = 35 + Math.random() * 15;

        return {
          id: event.id, // Use ID from event
          text: event.text,
          colorClass: event.color, // Use color from event (already a Tailwind class or default)
          topStyle,
          leftStyle,
          animationStyle: {
            '--initial-x-offset-px': '0px',
            '--initial-y-offset-px': '0px',
            '--arc-horizontal-drift': `${arcHorizontalDrift}px`,
            '--arc-vertical-peak': `${arcVerticalPeak}px`,
            '--arc-vertical-fall': `${arcVerticalFall}px`,
          },
          originalTimestamp: event.timestamp,
        };
      });

      setAnimatedPopups(prev => [...prev, ...newPopupsToAnimate].slice(-10)); 

      newPopupsToAnimate.forEach(p => {
        setTimeout(() => {
          setAnimatedPopups(current => current.filter(ap => ap.id !== p.id));
        }, RESOURCE_POPUP_DURATION_MS);
      });
    }
  }, [minigameState?.popupEvents, minigameState?.gridCols, minigameState?.gridRows]);


  const handleReturnToTown = () => {
    if (minigameState?.status === 'MINING_IN_PROGRESS' || minigameState?.status === 'FATIGUED_RETURN_TO_SURFACE') {
        dispatch({ type: 'GOLD_MINE_MINIGAME_RETURN_TO_SURFACE' });
    }
    dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'TOWN' });
  };
  
  const handlePurchaseUpgrade = (upgradeId: string) => {
    dispatch({ type: 'GOLD_MINE_MINIGAME_PURCHASE_UPGRADE', payload: { upgradeId } });
  };

  const handleStartDescent = () => {
    dispatch({ type: 'GOLD_MINE_MINIGAME_START_RUN', payload: { depth: selectedDepthForRun } });
  };


  if (!minigameState) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-3xl font-bold text-amber-400 mb-6">Gold Mine Excavation</h2>
        <p className="text-slate-300">Initializing minigame...</p>
      </div>
    );
  }
  
  const { playerStats } = minigameState;

  const availableDepths = Array.from({ length: Math.min(minigameState.maxUnlockedDepth, MAX_GOLD_MINE_DEPTH) }, (_, i) => i + 1);

  return (
    <div className="p-2 sm:p-4 h-full flex flex-col text-slate-100">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl sm:text-2xl font-bold text-amber-400">Gold Mine - Depth {minigameState.currentDepth}</h2>
        <Button onClick={handleReturnToTown} variant="secondary" size="sm">
          {minigameState.status === 'IDLE_AT_SURFACE' ? 'Exit to Town' : 'Return to Surface & Exit'}
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-3 flex-grow overflow-hidden">
        <div className="w-full md:w-1/3 lg:w-1/4 bg-slate-800/60 p-3 rounded-lg shadow-md overflow-y-auto fancy-scrollbar space-y-2.5 flex-shrink-0">
          <h3 className="text-md font-semibold text-sky-300 border-b border-slate-700 pb-1">Run Info</h3>
          <p className="text-sm">Status: <span className="font-semibold">{minigameState.status.replace(/_/g, ' ')}</span></p>
          <p className="text-sm">Stamina: <span className="font-semibold text-green-400">{formatNumber(minigameState.currentStamina)} / {formatNumber(playerStats.maxStamina)}</span></p>
          <p className="text-sm">Mining Speed: <span className="font-semibold text-orange-400">{formatNumber(playerStats.miningSpeed)}</span></p>
          <p className="text-sm">Sight Radius: <span className="font-semibold text-blue-400">{formatNumber(playerStats.fogOfWarRadius)}</span></p>
          
          {minigameState.status === 'IDLE_AT_SURFACE' && (
            <div className="pt-2">
              <h3 className="text-md font-semibold text-green-400 border-b border-slate-700 pb-1 mb-2">Mine Improvements</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto fancy-scrollbar pr-1 mb-2">
                {Object.values(GOLD_MINE_UPGRADE_DEFINITIONS).map((upgradeDef: GoldMineUpgradeDefinition) => (
                  <GoldMineUpgradeCard
                    key={upgradeDef.id}
                    upgradeDef={upgradeDef}
                    currentLevel={minigameState.permanentUpgradeLevels[upgradeDef.id] || 0}
                    onPurchase={handlePurchaseUpgrade}
                    playerResources={gameState.resources}
                  />
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-slate-700">
                <h4 className="text-md font-semibold text-sky-300 mb-1">Select Depth:</h4>
                <div className="flex flex-wrap gap-1 mb-2">
                    {availableDepths.map(depth => (
                        <Button 
                            key={depth}
                            onClick={() => setSelectedDepthForRun(depth)}
                            variant={selectedDepthForRun === depth ? 'primary' : 'secondary'}
                            size="sm"
                            className="text-xs px-2 py-1"
                        >
                            Depth {depth}
                        </Button>
                    ))}
                </div>
                <Button onClick={handleStartDescent} variant="success" size="sm" className="w-full">
                    Start Descent (Depth {selectedDepthForRun})
                </Button>
              </div>
            </div>
          )}
           {minigameState.status === 'FATIGUED_RETURN_TO_SURFACE' && (
            <Button onClick={() => dispatch({ type: 'GOLD_MINE_MINIGAME_RETURN_TO_SURFACE' })} variant="danger" size="sm" className="w-full mt-3">
                Return (Fatigued)
            </Button>
          )}

          <div className="pt-2 border-t border-slate-700 mt-2">
            <h4 className="text-sm font-semibold text-yellow-300 mb-1">Collected This Run:</h4>
            {Object.entries(minigameState.resourcesCollectedThisRun).map(([resource, amount]) => {
              if (amount === 0) return null;
              const Icon = ICONS[resource as ResourceType];
              return (
                <div key={resource} className="flex items-center text-xs">
                  {Icon && <Icon className={`w-3 h-3 mr-1 ${RESOURCE_COLORS[resource as ResourceType] || 'text-slate-300'}`} />}
                  <span className="text-slate-300">{resource.replace(/_/g, ' ')}:</span>
                  <span className="ml-1 font-medium text-slate-100">{formatNumber(amount)}</span>
                </div>
              );
            })}
            {Object.keys(minigameState.resourcesCollectedThisRun).length === 0 && <p className="text-xs text-slate-500 italic">Nothing yet.</p>}
          </div>
        </div>

        <div className="flex-grow bg-slate-900/70 p-1 sm:p-2 rounded-lg shadow-inner relative aspect-square max-w-full max-h-full overflow-hidden">
          {minigameState.status === 'MINING_IN_PROGRESS' && minigameState.grid.length > 0 ? (
            <div
              ref={gridContainerRef}
              className="grid relative w-full h-full"
              style={{
                gridTemplateColumns: `repeat(${minigameState.gridCols}, 1fr)`,
                gridTemplateRows: `repeat(${minigameState.gridRows}, 1fr)`,
                gap: '1px',
              }}
            >
              {minigameState.grid.flat().map((cell, index) => {
                const r = Math.floor(index / minigameState.gridCols);
                const c = index % minigameState.gridCols;
                return (
                  <GoldMineCellDisplay
                    key={`${r}-${c}`}
                    cell={cell}
                    isPlayerHere={minigameState.playerGridPos.r === r && minigameState.playerGridPos.c === c}
                  />
                );
              })}
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <p className="text-slate-400 italic">
                {minigameState.status === 'IDLE_AT_SURFACE' ? 'Start a descent to begin mining.' : 'Mine loading...'}
              </p>
            </div>
          )}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {animatedPopups.map(popup => (
              <MinigameResourcePopup
                key={popup.id}
                id={popup.id}
                text={popup.text}
                colorClass={popup.colorClass}
                topStyle={popup.topStyle}
                leftStyle={popup.leftStyle}
                animationStyle={popup.animationStyle}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoldMineMinigameView;
