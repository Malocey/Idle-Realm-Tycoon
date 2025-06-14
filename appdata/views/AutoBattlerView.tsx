
import React, { useEffect } from 'react';
import { useGameContext } from '../context';
import Button from '../components/Button';
import { ICONS } from '../components/Icons';
import { AutoBattlerBuilding, AutoBattlerBuildingType, AutoBattlerEnemyTower, AutoBattlerBaseStructure, ActiveView } from '../types';
import { formatNumber } from '../utils';

const GRID_COLS = 10;
const GRID_ROWS = 6;

const AutoBattlerView: React.FC = () => {
  const { gameState, dispatch } = useGameContext();
  const { autoBattler } = gameState;

  useEffect(() => {
    if (!autoBattler) {
      dispatch({ type: 'INITIALIZE_AUTO_BATTLER' });
    }
  }, [autoBattler, dispatch]);

  if (!autoBattler) {
    return (
      <div className="p-6 text-center text-slate-300">
        Loading Auto-Battler Arena...
      </div>
    );
  }

  const {
    supplies,
    grid,
    enemyTowers,
    enemyBase,
    hand,
    currentPhase
  } = autoBattler;

  const handleReturnToTown = () => {
    dispatch({ type: 'SET_ACTIVE_VIEW', payload: ActiveView.TOWN });
    // Consider dispatching an action to set autoBattler.isActive = false if needed
  };
  
  const handleStartBattle = () => {
    // Placeholder for starting battle logic
    console.log("Start Battle button clicked");
  };

  return (
    <div className="p-2 sm:p-4 h-full flex flex-col text-slate-100 bg-slate-900 items-center">
      <div className="w-full flex justify-between items-center mb-2 flex-shrink-0">
        <h2 className="text-xl sm:text-2xl font-bold text-amber-400">Auto-Battler Arena</h2>
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold text-yellow-300">
            Supplies: {formatNumber(supplies)}
          </span>
          {currentPhase !== 'COMBAT' && (
             <Button onClick={handleStartBattle} variant="success" size="sm">Start Battle</Button>
          )}
          <Button onClick={handleReturnToTown} variant="secondary" size="sm">Return to Town</Button>
        </div>
      </div>

      {/* Main Arena Layout */}
      <div className="flex-grow flex w-full max-w-7xl border-2 border-slate-700 rounded-lg bg-slate-800/50 p-2 gap-2">
        {/* Player Side (Grid & HQ) */}
        <div className="flex flex-col items-center w-2/5">
          <h3 className="text-md font-semibold text-sky-300 mb-1">Player Deployment Zone</h3>
          {/* Player Grid */}
          <div 
            className="grid border border-slate-600 bg-slate-700/30 p-1 rounded shadow-inner"
            style={{
              gridTemplateColumns: `repeat(${GRID_COLS}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${GRID_ROWS}, minmax(0, 1fr))`,
              width: '100%',
              aspectRatio: `${GRID_COLS} / ${GRID_ROWS}`, // Maintain aspect ratio
              maxHeight: '400px', // Limit height
            }}
            aria-label="Player Building Grid"
          >
            {grid.flat().map((cell, index) => {
              const row = Math.floor(index / GRID_COLS);
              const col = index % GRID_COLS;
              return (
                <div
                  key={`cell-${row}-${col}`}
                  className="border border-slate-500/50 flex items-center justify-center text-xs text-slate-400 hover:bg-slate-600/50 transition-colors"
                  title={`Grid Cell (${col}, ${row})`}
                >
                  {cell ? cell.type : ''}
                </div>
              );
            })}
          </div>
          {/* Player HQ (placeholder) */}
          <div className="mt-2 p-2 bg-sky-700 rounded w-32 h-16 flex items-center justify-center text-center">
             <ICONS.COMMAND_POST_ICON className="w-6 h-6 mr-1"/> Player HQ
          </div>
        </div>

        {/* Battle Path */}
        <div className="flex-grow bg-slate-700/50 rounded p-2 flex flex-col items-center justify-around relative" aria-label="Battle Path">
          <h3 className="text-md font-semibold text-slate-300 mb-1 absolute top-1">Battle Path</h3>
            {/* Enemy Towers Placeholders */}
            <div className="flex w-full justify-around items-center h-full">
            {enemyTowers.map((tower, index) => (
                <div key={tower.id} className="p-2 bg-red-700 rounded w-16 h-20 flex flex-col items-center justify-center text-center" title={`Enemy Tower ${index + 1}`}>
                    <ICONS.STONE className="w-5 h-5 mb-1"/> Tower {index+1} <br/> ({tower.hp}/{tower.maxHp})
                </div>
            ))}
            </div>
        </div>

        {/* Enemy Side (Base & Territory) */}
        <div className="flex flex-col items-center w-1/5">
           <h3 className="text-md font-semibold text-red-400 mb-1">Enemy Territory</h3>
          {/* Enemy Base (placeholder) */}
          <div className="p-2 bg-red-800 rounded w-32 h-20 flex flex-col items-center justify-center text-center" title="Enemy Base">
             <ICONS.ENEMY className="w-6 h-6 mb-1"/> Enemy Base <br /> ({enemyBase.hp}/{enemyBase.maxHp})
          </div>
        </div>
      </div>

      {/* Card Hand Area (Placeholder) */}
      <div className="flex-shrink-0 w-full max-w-3xl mt-2 p-2 bg-slate-800/60 rounded-lg">
        <h3 className="text-md font-semibold text-lime-300 mb-1">Card Hand</h3>
        <div className="flex justify-center gap-2">
          {Array(4).fill(null).map((_, index) => (
            <div key={`hand-slot-${index}`} className="w-24 h-32 bg-slate-700 border border-slate-600 rounded flex items-center justify-center text-slate-400">
              Slot {index + 1}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AutoBattlerView;
