
import React, { useEffect, useState, useContext } from 'react';
// Annahme: Der GameContext wird so importiert
import { GameContext } from '../context'; 
// Annahme: Die Typen und utils werden so importiert
import { AutoBattlerBuilding, AutoBattlerBuildingType, ActiveView, AutoBattlerUnit } from '../types'; 
import { formatNumber } from '../utils/formatters'; 
// Annahme: Button-Komponente existiert
import Button from '../components/Button'; 
import { ICONS } from '../components/Icons';
import { AUTOBATTLER_TICK_INTERVAL_MS } from '../constants';


const GRID_COLS = 10;
const GRID_ROWS = 6;
const UNIT_VISUAL_SIZE = 20; // Size of the unit square

const AutoBattlerView: React.FC = () => { 
    const { gameState, dispatch } = useContext(GameContext);
    const { autoBattler } = gameState;
    const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);

    useEffect(() => {
        // Initialisiert das Minispiel nur, wenn es noch nicht aktiv ist.
        if (!autoBattler || !autoBattler.isActive) {
            dispatch({ type: 'INITIALIZE_AUTO_BATTLER' });
        }
    }, [autoBattler, dispatch]);

    useEffect(() => {
        let tickInterval: number | undefined;
        if (autoBattler && autoBattler.isActive) { // Game tick starts if minigame is active
            tickInterval = window.setInterval(() => {
                dispatch({ type: 'AUTOBATTLER_GAME_TICK' });
            }, AUTOBATTLER_TICK_INTERVAL_MS);
        }
        return () => {
            if (tickInterval) {
                window.clearInterval(tickInterval);
            }
        };
    }, [autoBattler?.isActive, dispatch]);


    if (!autoBattler || !autoBattler.isActive) {
        return <div className="p-6 text-center text-slate-300">Loading Auto-Battler Arena...</div>;
    }

    const { supplies, grid, enemyTowers, enemyBase, hand, playerUnits } = autoBattler;

    const handleReturnToTown = () => {
        // Consider adding logic to end/cleanup the auto-battler state if necessary
        dispatch({ type: 'SET_ACTIVE_VIEW', payload: ActiveView.TOWN });
    };

    const handleCardClick = (index: number) => {
        // Card playing is always enabled
        setSelectedCardIndex(selectedCardIndex === index ? null : index);
    };

    const handleGridCellClick = (rowIndex: number, colIndex: number) => { 
        // Grid interaction always enabled if cell is empty and card selected
        if (selectedCardIndex !== null && gameState.autoBattler && !gameState.autoBattler.grid[rowIndex]?.[colIndex]) {
            dispatch({
                type: 'PLAY_AUTOBATTLER_CARD',
                payload: {
                    handIndex: selectedCardIndex,
                    position: { x: colIndex, y: rowIndex }, 
                },
            });
            setSelectedCardIndex(null);
        }
    };
  
    const getBuildingDisplay = (building: AutoBattlerBuilding | null): string => {
        if (!building) return '';
        switch(building.type) {
            case AutoBattlerBuildingType.FARM: return 'Farm';
            case AutoBattlerBuildingType.BARRACKS: return 'Barracks';
            case AutoBattlerBuildingType.WINDMILL: return 'Windmill';
            default: return building.type.substring(0, 3);
        }
    };


    return (
        <div className="p-2 sm:p-4 h-full flex flex-col text-slate-100 bg-slate-900 items-center">
            {/* Header */}
            <div className="w-full flex justify-between items-center mb-2 flex-shrink-0">
                <h2 className="text-xl sm:text-2xl font-bold text-amber-400">Auto-Battler Arena</h2>
                <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold text-yellow-300">
                        Supplies: {formatNumber(supplies)}
                    </span>
                    {/* "Start Battle" button removed */}
                    <Button onClick={handleReturnToTown} variant="secondary" size="sm">Return to Town</Button>
                </div>
            </div>

            {/* Main Arena Layout */}
            <div className="flex-grow flex w-full max-w-7xl border-2 border-slate-700 rounded-lg bg-slate-800/50 p-2 gap-2">
                {/* Player Side */}
                <div className="flex flex-col items-center w-2/5">
                    <h3 className="text-md font-semibold text-sky-300 mb-1">Player Deployment Zone</h3>
                    <div
                        className="grid border border-slate-600 bg-slate-700/30 p-1 rounded shadow-inner"
                        style={{
                            gridTemplateColumns: `repeat(${GRID_COLS}, minmax(0, 1fr))`,
                            gridTemplateRows: `repeat(${GRID_ROWS}, minmax(0, 1fr))`,
                            width: '100%',
                            aspectRatio: `${GRID_COLS} / ${GRID_ROWS}`,
                            maxHeight: '400px',
                        }}
                        role="grid"
                        aria-label="Player Building Grid"
                    >
                        {grid.map((row, rowIndex) =>
                            row.map((cell, colIndex) => (
                                <button
                                    key={`cell-${rowIndex}-${colIndex}`}
                                    className={`border border-slate-500/50 flex items-center justify-center text-xs 
                                                ${cell ? 'bg-sky-700/30 text-sky-200' : 'hover:bg-slate-600/50 text-slate-400'} 
                                                transition-colors disabled:cursor-not-allowed`}
                                    title={cell ? `${getBuildingDisplay(cell)} Lvl ${cell.level}` : `Place Building (${colIndex}, ${rowIndex})`}
                                    onClick={() => handleGridCellClick(rowIndex, colIndex)}
                                    disabled={!!cell || selectedCardIndex === null} 
                                    aria-label={cell ? `Building: ${getBuildingDisplay(cell)}, Level ${cell.level}` : `Place selected card at column ${colIndex + 1}, row ${rowIndex + 1}`}
                                >
                                    {cell ? getBuildingDisplay(cell) : ''}
                                </button>
                            ))
                        )}
                    </div>
                    <div className="mt-2 p-2 bg-sky-700 rounded w-32 h-16 flex items-center justify-center text-center">
                         <ICONS.COMMAND_POST_ICON className="w-6 h-6 mr-1"/> Player HQ
                    </div>
                </div>

                <div className="flex-grow bg-slate-700/50 rounded p-2 flex flex-col items-center justify-around relative" aria-label="Battle Path" style={{ position: 'relative' }}>
                    <h3 className="text-md font-semibold text-slate-300 mb-1 absolute top-1">Battle Path</h3>
                    <div className="absolute inset-0 top-8 bottom-8 left-2 right-2 overflow-hidden pointer-events-none"> {/* Container for units */}
                        {playerUnits.map(unit => (
                            <div
                                key={unit.instanceId}
                                className="absolute bg-blue-500 rounded"
                                style={{
                                    width: `${UNIT_VISUAL_SIZE}px`,
                                    height: `${UNIT_VISUAL_SIZE}px`,
                                    left: `${unit.x}px`,
                                    top: `${unit.y - UNIT_VISUAL_SIZE / 2}px`, 
                                    transition: 'left 0.1s linear', 
                                }}
                                title={`${unit.definitionId} (${unit.hp}/${unit.maxHp})`}
                            ></div>
                        ))}
                    </div>
                    <div className="flex w-full justify-around items-center h-full z-10 pointer-events-none"> 
                    {enemyTowers.map((tower, index) => (
                        <div key={tower.id} className="p-2 bg-red-700 rounded w-16 h-20 flex flex-col items-center justify-center text-center pointer-events-auto" title={`Enemy Tower ${index + 1}`}>
                            <ICONS.STONE className="w-5 h-5 mb-1"/> Tower {index+1} <br/> ({tower.hp}/{tower.maxHp})
                        </div>
                    ))}
                    </div>
                </div>

                <div className="flex flex-col items-center w-1/5">
                   <h3 className="text-md font-semibold text-red-400 mb-1">Enemy Territory</h3>
                    <div className="p-2 bg-red-800 rounded w-32 h-20 flex flex-col items-center justify-center text-center" title="Enemy Base">
                         <ICONS.ENEMY className="w-6 h-6 mb-1"/> Enemy Base <br /> ({enemyBase.hp}/{enemyBase.maxHp})
                    </div>
                </div>
            </div>

            <div className="flex-shrink-0 w-full max-w-3xl mt-2 p-2 bg-slate-800/60 rounded-lg">
                <h3 className="text-md font-semibold text-lime-300 mb-1 text-center">Card Hand</h3>
                <div className="flex justify-center gap-2">
                    {hand.map((card, index) => (
                        <button
                            key={card.id + '-' + index} 
                            onClick={() => handleCardClick(index)}
                            className={`w-28 h-40 p-2 rounded-md border-2 transition-all duration-150 cursor-pointer hover:scale-105
                                        ${selectedCardIndex === index ? 'border-yellow-400 bg-slate-600 ring-2 ring-yellow-300' : 'border-slate-600 bg-slate-700 hover:border-slate-500'}`}
                            aria-pressed={selectedCardIndex === index}
                            aria-label={`Select ${card.name} card. Cost: ${card.cost} supplies.`}
                        >
                            <div className="flex flex-col h-full justify-between items-center text-center">
                                <div className="font-semibold text-sm text-lime-200">{card.name}</div>
                                <div className="text-xs text-slate-300 my-1">Type: {card.buildingType.replace(/_/g, ' ')}</div>
                                <div className="font-bold text-lg text-yellow-400">{card.cost}</div>
                            </div>
                        </button>
                    ))}
                    {hand.length < 4 && Array(4 - hand.length).fill(null).map((_, index) => (
                         <div key={`empty-slot-${index}`} className="w-28 h-40 bg-slate-700/50 border-2 border-slate-600/70 rounded flex items-center justify-center text-slate-500 italic">
                            Empty
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AutoBattlerView;
