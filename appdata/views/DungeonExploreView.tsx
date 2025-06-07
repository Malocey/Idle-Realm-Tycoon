
import React, { useEffect, useRef, useState } from 'react'; 
import { useGameContext } from '../context';
import { DungeonCell, CellType, DungeonGridState, TrapDefinition, DungeonEventDefinition, DungeonEncounterDefinition } from '../types';
import { ICONS } from '../components/Icons';
import Button from '../components/Button';
import { TRAP_DEFINITIONS, DUNGEON_EVENT_DEFINITIONS } from '../gameData/index';
import DungeonMiniMap from '../components/DungeonMiniMap';
import DungeonPartyStatusPanel from '../components/DungeonPartyStatusPanel'; 
import RunBuffSelectionModal from '../components/RunBuffSelectionModal'; 
import ActiveRunBuffsInfoModal from '../components/ActiveRunBuffsInfoModal'; 
import { formatNumber } from '../utils'; 

const CELL_SIZE_PX = 78;
const GRID_GAP_PX = 2;

interface DungeonCellDisplayProps {
  cell: DungeonCell;
  isPartyHere: boolean;
  trapDefinitions: Record<string, TrapDefinition>;
  eventDefinitions: Record<string, DungeonEventDefinition>;
  dungeonDefinitionId: string; 
  currentFloor: number;      
}

const DungeonCellDisplay: React.FC<DungeonCellDisplayProps> = ({ cell, isPartyHere, trapDefinitions, eventDefinitions, dungeonDefinitionId, currentFloor }) => {
  const { staticData } = useGameContext();
  let cellClasses = "w-full h-full flex items-center justify-center border border-slate-700 transition-all duration-200 relative"; 
  let content = null;
  const PartyIcon = ICONS.HERO;
  const iconSizeClass = "w-8 h-8";
  let titleText: string;

  const trapDef = cell.trapId ? trapDefinitions[cell.trapId] : undefined;
  const eventDef = cell.eventId ? eventDefinitions[cell.eventId] : undefined;
  
  let isEliteEnemy = false;
  if (cell.type === CellType.ENEMY && cell.enemyEncounterId) {
    const dungeon = staticData.dungeonDefinitions[dungeonDefinitionId];
    const floor = dungeon?.floors[currentFloor];
    const encounter = floor?.enemies.find(enc => enc.id === cell.enemyEncounterId);
    if (encounter?.isElite) {
        isEliteEnemy = true;
    }
  }


  if (!cell.isRevealed) {
    cellClasses += " bg-slate-800";
    titleText = 'Unrevealed';
  } else {
    switch (cell.type) {
      case CellType.EMPTY:
        cellClasses += cell.isVisited ? " bg-slate-600" : " bg-slate-500";
        titleText = "Empty";
        break;
      case CellType.WALL:
        cellClasses += " bg-slate-900";
        content = ICONS.STONE && <ICONS.STONE className={`${iconSizeClass} text-slate-500`} />;
        titleText = "Wall";
        break;
      case CellType.START:
        cellClasses += " bg-green-700";
        content = ICONS.COMPASS && <ICONS.COMPASS className={`${iconSizeClass} text-green-300`} />;
        titleText = "Entrance";
        break;
      case CellType.EXIT:
        cellClasses += " bg-sky-700";
        content = ICONS.ARROW_UP && <ICONS.ARROW_UP className={`${iconSizeClass} text-sky-300`} />;
        titleText = "Exit";
        break;
      case CellType.ENEMY:
        if (isEliteEnemy) {
            cellClasses += " bg-red-800 hover:bg-red-700";
            content = (
                <div className="relative w-full h-full flex items-center justify-center">
                    {ICONS.ENEMY && <ICONS.ENEMY className={`${iconSizeClass} text-red-200`} />}
                    {ICONS.STAR_INDICATOR_ICON && <ICONS.STAR_INDICATOR_ICON className="w-4 h-4 text-yellow-300 absolute top-1 right-1" />}
                </div>
            );
            titleText="Enemy (Elite)";
        } else {
            cellClasses += " bg-red-700 hover:bg-red-600";
            content = ICONS.ENEMY && <ICONS.ENEMY className={`${iconSizeClass} text-red-300`} />;
            titleText="Enemy";
        }
        break;
      case CellType.LOOT:
        cellClasses += " bg-yellow-600 hover:bg-yellow-500";
        content = ICONS.GOLD && <ICONS.GOLD className={`${iconSizeClass} text-yellow-300`} />;
        titleText = "Loot";
        break;
      case CellType.TRAP:
        if (trapDef) {
            titleText = trapDef.name;
            if (cell.isTrapTriggered) {
                cellClasses += " bg-slate-500"; 
                content = ICONS[trapDef.iconNameWhenTriggered] && React.createElement(ICONS[trapDef.iconNameWhenTriggered], {className: `${iconSizeClass} text-slate-400`});
                titleText += " (Triggered)";
            } else if (trapDef.visibility === 'VISIBLE_WHEN_REVEALED') {
                cellClasses += " bg-orange-700 hover:bg-orange-600";
                content = ICONS[trapDef.iconNameWhenVisible] && React.createElement(ICONS[trapDef.iconNameWhenVisible], {className: `${iconSizeClass} text-orange-300`});
            } else { 
                 cellClasses += cell.isVisited ? " bg-slate-600" : " bg-slate-500"; 
                 titleText = "Floor"; 
            }
        } else {
            cellClasses += cell.isVisited ? " bg-slate-600" : " bg-slate-500";
            titleText = "Trap (Unknown)";
        }
        break;
      case CellType.EVENT:
        if (eventDef) {
            titleText = eventDef.name;
            if (cell.isEventTriggered && eventDef.removeAfterTrigger) {
                cellClasses += cell.isVisited ? " bg-slate-600" : " bg-slate-500"; 
                titleText += " (Triggered)";
            } else {
                cellClasses += " bg-purple-700 hover:bg-purple-600";
                const iconColor = cell.isEventTriggered && !eventDef.removeAfterTrigger ? "text-purple-500" : "text-purple-300";
                content = ICONS[eventDef.iconName] && React.createElement(ICONS[eventDef.iconName], {className: `${iconSizeClass} ${iconColor}`});
                if (cell.isEventTriggered) titleText += " (Triggered)";
            }
        } else {
             cellClasses += cell.isVisited ? " bg-slate-600" : " bg-slate-500";
             titleText = "Event (Unknown)";
        }
        break;
      default:
        cellClasses += " bg-slate-500";
        titleText = `Unknown Cell (${cell.type})`;
    }
  }

  if (isPartyHere) {
    cellClasses += " ring-2 ring-amber-400";
    content = PartyIcon && <PartyIcon className={`${iconSizeClass} text-amber-300 z-10`} />;
    titleText += " (Party)";
  }

  return <div className={cellClasses} style={{ width: `${CELL_SIZE_PX}px`, height: `${CELL_SIZE_PX}px` }} title={titleText}>{content}</div>;
};

const DungeonExploreView: React.FC = () => {
  const { gameState, dispatch, staticData } = useGameContext();
  const { activeDungeonGrid, activeDungeonRun, activeView } = gameState; 
  const scrollableGridContainerRef = useRef<HTMLDivElement>(null);
  const [isBuffInfoModalOpen, setIsBuffInfoModalOpen] = useState(false); 

  useEffect(() => {
    if (activeDungeonGrid && scrollableGridContainerRef.current) {
      const { partyPosition } = activeDungeonGrid;
      const container = scrollableGridContainerRef.current;

      const cellWidthWithGap = CELL_SIZE_PX + GRID_GAP_PX;
      const cellHeightWithGap = CELL_SIZE_PX + GRID_GAP_PX;

      const playerCenterX = partyPosition.c * cellWidthWithGap + cellWidthWithGap / 2;
      const playerCenterY = partyPosition.r * cellHeightWithGap + cellHeightWithGap / 2;

      const newScrollLeft = playerCenterX - container.clientWidth / 2;
      const newScrollTop = playerCenterY - container.clientHeight / 2;

      if (Math.abs(container.scrollLeft - newScrollLeft) > 1 || Math.abs(container.scrollTop - newScrollTop) > 1) {
        container.scrollTo({
            left: newScrollLeft,
            top: newScrollTop,
            behavior: 'smooth',
        });
      }
    }
  }, [activeDungeonGrid?.partyPosition.r, activeDungeonGrid?.partyPosition.c]); 

  useEffect(() => {
    const container = scrollableGridContainerRef.current;
    if (container) {
      const preventWheel = (e: WheelEvent) => {
        if (e.target === container || container.contains(e.target as Node)) {
            e.preventDefault();
        }
      };
      const preventMiddleClick = (e: MouseEvent) => {
        if (e.button === 1 && (e.target === container || container.contains(e.target as Node))) { 
          e.preventDefault();
        }
      };

      container.addEventListener('wheel', preventWheel, { passive: false });
      container.addEventListener('mousedown', preventMiddleClick);

      return () => {
        container.removeEventListener('wheel', preventWheel);
        container.removeEventListener('mousedown', preventMiddleClick);
      };
    }
  }, [activeDungeonGrid]); 

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
        if (activeView !== 'DUNGEON_EXPLORE' || (activeDungeonRun && activeDungeonRun.offeredBuffChoices)) {
            return; 
        }

        let dr = 0;
        let dc = 0;

        switch (event.key) {
            case 'w':
            case 'ArrowUp':
                dr = -1;
                break;
            case 's':
            case 'ArrowDown':
                dr = 1;
                break;
            case 'a':
            case 'ArrowLeft':
                dc = -1;
                break;
            case 'd':
            case 'ArrowRight':
                dc = 1;
                break;
            default:
                return; 
        }

        if (dr !== 0 || dc !== 0) {
            event.preventDefault(); 
            dispatch({ type: 'MOVE_PARTY_ON_GRID', payload: { dr, dc } });
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
    };
  }, [dispatch, activeView, activeDungeonRun?.offeredBuffChoices]);


  if (!activeDungeonGrid || !activeDungeonRun) { 
    return (
      <div className="p-4 text-center">
        <h2 className="text-2xl font-bold text-sky-400 mb-4">Dungeon Portal</h2>
        <p className="text-slate-300">No active dungeon. Select one from the Dungeons menu.</p>
      </div>
    );
  }

  const { grid, rows, cols, partyPosition, dungeonDefinitionId, currentFloor } = activeDungeonGrid;
  const dungeonDef = staticData.dungeonDefinitions[dungeonDefinitionId];
  const { runLevel, runXP, expToNextRunLevel, offeredBuffChoices, activeRunBuffs } = activeDungeonRun;
  const runXpPercentage = expToNextRunLevel > 0 ? (runXP / expToNextRunLevel) * 100 : 0;


  const handleMove = (dr: number, dc: number) => {
    if (offeredBuffChoices) return; 
    dispatch({ type: 'MOVE_PARTY_ON_GRID', payload: { dr, dc } });
  };

  const gridContainerWidth = cols * (CELL_SIZE_PX + GRID_GAP_PX);
  const gridContainerHeight = rows * (CELL_SIZE_PX + GRID_GAP_PX);

  const handleBuffSelection = (buffId: string) => {
    dispatch({ type: 'APPLY_CHOSEN_RUN_BUFF', payload: { buffId } });
  };

  const toggleBuffInfoModal = () => {
    setIsBuffInfoModalOpen(prev => !prev);
  };

  return (
    <div className="p-4 flex flex-col items-center h-[calc(100vh-120px)]">
      {offeredBuffChoices && (
        <RunBuffSelectionModal
          isOpen={!!offeredBuffChoices}
          offeredBuffIds={offeredBuffChoices}
          onSelectBuff={handleBuffSelection}
        />
      )}
      <ActiveRunBuffsInfoModal 
        isOpen={isBuffInfoModalOpen}
        onClose={toggleBuffInfoModal}
        activeBuffs={activeRunBuffs}
        buffDefinitions={staticData.runBuffDefinitions}
      />
      <div className="flex-shrink-0 mb-2 text-center w-full max-w-3xl">
        <h2 className="text-2xl font-bold text-sky-400">
          {dungeonDef?.name || 'Dungeon'} - Floor {currentFloor + 1}
        </h2>
        <p className="text-sm text-slate-400">
          Party Position: ({partyPosition.c}, {partyPosition.r})
        </p>
        <div className="mt-1">
            <p className="text-sm text-amber-400">Run Level: {runLevel}</p>
            <div className="w-full bg-slate-700 rounded-full h-2.5 max-w-xs mx-auto">
                <div 
                    className="bg-amber-500 h-2.5 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${runXpPercentage}%` }}
                    role="progressbar"
                    aria-label="Run XP Progress"
                    aria-valuenow={runXP}
                    aria-valuemin={0}
                    aria-valuemax={expToNextRunLevel}
                ></div>
            </div>
            <p className="text-xs text-slate-500">{formatNumber(runXP)} / {formatNumber(expToNextRunLevel)} Run XP</p>
        </div>
      </div>

      <div className="flex-grow w-full flex flex-col items-center justify-center overflow-hidden min-h-0">
        <div
          ref={scrollableGridContainerRef}
          className="border border-slate-700 bg-slate-800/30 p-2 rounded-lg shadow-xl mb-3 flex-grow min-h-0 fancy-scrollbar" 
          style={{
            maxWidth: 'min(90vw, 1000px)', 
            width: '100%', 
            overflow: 'auto', 
            position: 'relative' 
          }}
        >
          <div
            className="grid"
            style={{
              gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
              width: `${gridContainerWidth}px`,
              height: `${gridContainerHeight}px`,
              gap: `${GRID_GAP_PX}px`,
            }}
          >
            {grid.map((row, r_idx) => 
              row.map((cell, c_idx) => ( 
                <DungeonCellDisplay
                  key={`${r_idx}-${c_idx}`}
                  cell={cell}
                  isPartyHere={partyPosition.r === r_idx && partyPosition.c === c_idx}
                  trapDefinitions={staticData.trapDefinitions}
                  eventDefinitions={staticData.eventDefinitions}
                  dungeonDefinitionId={dungeonDefinitionId}
                  currentFloor={currentFloor}
                />
              ))
            )}
          </div>
        </div>
        <div className="absolute top-16 right-2 md:top-20 md:right-4 z-20"> 
            <DungeonMiniMap gridState={activeDungeonGrid} />
        </div>

        <div className="flex-shrink-0 w-full max-w-3xl">
          <DungeonPartyStatusPanel onToggleBuffInfoModal={toggleBuffInfoModal} />
        </div>
      </div>

      <div className="flex-shrink-0 mt-auto pt-2">
        <div className="grid grid-cols-3 gap-2 w-48 mb-2">
          <div></div>
          <Button onClick={() => handleMove(-1, 0)} variant="secondary" size="md" icon={ICONS.ARROW_UP && <ICONS.ARROW_UP className="w-5 h-5"/>} aria-label="Move Up" disabled={!!offeredBuffChoices}>
            Up
          </Button>
          <div></div>

          <Button onClick={() => handleMove(0, -1)} variant="secondary" size="md" icon={ICONS.ARROW_UP && <ICONS.ARROW_UP className="w-5 h-5 transform -rotate-90"/>} aria-label="Move Left" disabled={!!offeredBuffChoices}>
            Left
          </Button>
          <Button onClick={() => handleMove(1, 0)} variant="secondary" size="md" icon={ICONS.ARROW_UP && <ICONS.ARROW_UP className="w-5 h-5 transform rotate-180"/>} aria-label="Move Down" disabled={!!offeredBuffChoices}>
            Down
          </Button>
          <Button onClick={() => handleMove(0, 1)} variant="secondary" size="md" icon={ICONS.ARROW_UP && <ICONS.ARROW_UP className="w-5 h-5 transform rotate-90"/>} aria-label="Move Right" disabled={!!offeredBuffChoices}>
            Right
          </Button>
        </div>
        <Button
              onClick={() => dispatch({ type: 'EXIT_DUNGEON_EXPLORATION', payload: { outcome: 'ABANDONED' }})}
              variant="danger"
              size="sm"
              className="w-full"
              icon={ICONS.X_CIRCLE && <ICONS.X_CIRCLE className="w-4 h-4" />}
              disabled={!!offeredBuffChoices}
          >
              Abandon Run
        </Button>
      </div>
    </div>
  );
};

export default DungeonExploreView;
