
import React, { useEffect, useState, useContext, useRef } from 'react';
import { GameContext } from '../context'; 
import { AutoBattlerBuilding, AutoBattlerBuildingType, ActiveView, AutoBattlerUnit, AutoBattlerState } from '../types'; 
import { formatNumber } from '../utils/formatters'; 
import Button from '../components/Button'; 
import { ICONS } from '../components/Icons';
import { 
    AUTOBATTLER_TICK_INTERVAL_MS,
    AUTOBATTLER_BATTLE_PATH_WIDTH,
    AUTOBATTLER_BATTLE_PATH_HEIGHT,
    AUTOBATTLER_UNIT_VISUAL_SIZE,
    AUTOBATTLER_UNIT_VISUAL_HEIGHT,
    AUTOBATTLER_HP_BAR_WIDTH,
    AUTOBATTLER_HP_BAR_HEIGHT,
    AUTOBATTLER_STACK_COUNTER_FONT_SIZE,
    AUTOBATTLER_STACK_COUNTER_FONT,
    AUTOBATTLER_STACK_COUNTER_COLOR,
    AUTOBATTLER_PLAYER_UNIT_COLOR,
    AUTOBATTLER_ENEMY_UNIT_COLOR,
    AUTOBATTLER_PLAYER_HQ_COLOR,
    AUTOBATTLER_ENEMY_BUILDING_COLOR,
    AUTOBATTLER_HP_BAR_BG_COLOR,
    AUTOBATTLER_HP_BAR_PLAYER_COLOR,
    AUTOBATTLER_HP_BAR_ENEMY_COLOR
} from '../constants';
import { renderAutoBattler } from '../utils/autoBattlerRenderer';


const GRID_COLS = 10;
const GRID_ROWS = 6;

const AutoBattlerView: React.FC = () => { 
    const { gameState, dispatch } = useContext(GameContext);
    const autoBattlerStateRef = useRef<AutoBattlerState | null>(gameState.autoBattler); // Ref to hold current state for RAF
    
    useEffect(() => {
        autoBattlerStateRef.current = gameState.autoBattler;
    }, [gameState.autoBattler]);


    const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const RENDER_CONSTANTS = {
        UNIT_VISUAL_SIZE: AUTOBATTLER_UNIT_VISUAL_SIZE,
        UNIT_VISUAL_HEIGHT: AUTOBATTLER_UNIT_VISUAL_HEIGHT,
        HP_BAR_WIDTH: AUTOBATTLER_HP_BAR_WIDTH,
        HP_BAR_HEIGHT: AUTOBATTLER_HP_BAR_HEIGHT,
        STACK_COUNTER_FONT_SIZE: AUTOBATTLER_STACK_COUNTER_FONT_SIZE,
        STACK_COUNTER_FONT: AUTOBATTLER_STACK_COUNTER_FONT,
        STACK_COUNTER_COLOR: AUTOBATTLER_STACK_COUNTER_COLOR,
        PLAYER_UNIT_COLOR: AUTOBATTLER_PLAYER_UNIT_COLOR,
        ENEMY_UNIT_COLOR: AUTOBATTLER_ENEMY_UNIT_COLOR,
        PLAYER_HQ_COLOR: AUTOBATTLER_PLAYER_HQ_COLOR,
        ENEMY_BUILDING_COLOR: AUTOBATTLER_ENEMY_BUILDING_COLOR,
        HP_BAR_BG_COLOR: AUTOBATTLER_HP_BAR_BG_COLOR,
        HP_BAR_PLAYER_COLOR: AUTOBATTLER_HP_BAR_PLAYER_COLOR,
        HP_BAR_ENEMY_COLOR: AUTOBATTLER_HP_BAR_ENEMY_COLOR,
        BATTLE_PATH_WIDTH: AUTOBATTLER_BATTLE_PATH_WIDTH,
        BATTLE_PATH_CANVAS_HEIGHT: AUTOBATTLER_BATTLE_PATH_HEIGHT,
    };


    useEffect(() => {
        if (!gameState.autoBattler || !gameState.autoBattler.isActive) {
            dispatch({ type: 'INITIALIZE_AUTO_BATTLER' });
        }
    }, [gameState.autoBattler, dispatch]);

    useEffect(() => {
        let gameTickIntervalId: number | undefined;
        if (gameState.autoBattler && gameState.autoBattler.isActive) {
            gameTickIntervalId = window.setInterval(() => {
                dispatch({ type: 'AUTOBATTLER_GAME_TICK' });
            }, AUTOBATTLER_TICK_INTERVAL_MS);
        }
        return () => {
            if (gameTickIntervalId) {
                window.clearInterval(gameTickIntervalId);
            }
        };
    }, [gameState.autoBattler?.isActive, dispatch]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        const renderLoop = () => {
            if (autoBattlerStateRef.current) { // Use the ref for rendering
                 renderAutoBattler(ctx, autoBattlerStateRef.current, RENDER_CONSTANTS);
            }
            animationFrameId = requestAnimationFrame(renderLoop);
        };
        renderLoop();
        return () => cancelAnimationFrame(animationFrameId);
    }, []); // Empty dependency array to run the RAF loop once

    if (!gameState.autoBattler || !gameState.autoBattler.isActive) {
        return <div className="p-6 text-center text-slate-300">Loading Auto-Battler Arena...</div>;
    }

    const { supplies, grid, hand } = gameState.autoBattler;

    const handleReturnToTown = () => {
        dispatch({ type: 'SET_ACTIVE_VIEW', payload: ActiveView.TOWN });
    };

    const handleCardClick = (index: number) => {
        setSelectedCardIndex(selectedCardIndex === index ? null : index);
    };

    const handleGridCellClick = (rowIndex: number, colIndex: number) => { 
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
            <div className="w-full flex justify-between items-center mb-2 flex-shrink-0">
                <h2 className="text-xl sm:text-2xl font-bold text-amber-400">Auto-Battler Arena</h2>
                <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold text-yellow-300">
                        Supplies: {formatNumber(supplies)}
                    </span>
                    <Button onClick={handleReturnToTown} variant="secondary" size="sm">Return to Town</Button>
                </div>
            </div>

            <div className="flex-grow flex w-full max-w-7xl border-2 border-slate-700 rounded-lg bg-slate-800/50 p-2 gap-2">
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
                     {/* Player HQ is now rendered on canvas */}
                </div>

                {/* Battle Path Canvas */}
                <div className="flex-grow bg-slate-700/50 rounded p-0 flex flex-col items-center justify-center relative" 
                     style={{ width: `${AUTOBATTLER_BATTLE_PATH_WIDTH}px`, height: `${AUTOBATTLER_BATTLE_PATH_HEIGHT}px`, minWidth: `${AUTOBATTLER_BATTLE_PATH_WIDTH}px` }} 
                     aria-label="Battle Path">
                    <canvas 
                        ref={canvasRef} 
                        width={AUTOBATTLER_BATTLE_PATH_WIDTH} 
                        height={AUTOBATTLER_BATTLE_PATH_HEIGHT}
                        className="rounded"
                    />
                </div>


                <div className="flex flex-col items-center w-1/5">
                   <h3 className="text-md font-semibold text-red-400 mb-1">Enemy Territory</h3>
                   {/* Enemy Base and Towers are now rendered on canvas */}
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
