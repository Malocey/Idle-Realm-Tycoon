
import React, { useEffect, useState, useContext, useRef } from 'react';
import { GameContext } from '../context'; 
import { AutoBattlerBuilding, AutoBattlerBuildingType, ActiveView, AutoBattlerUnit, AutoBattlerState, AutoBattlerBuildingCard } from '../types'; 
import { formatNumber } from '../utils/formatters'; 
import Button from '../components/Button'; 
import { ICONS } from '../components/Icons';
import { 
    AUTOBATTLER_TICK_INTERVAL_MS,
    PLAYER_BUILDING_GRID_COLS, 
    PLAYER_BUILDING_GRID_ROWS, 
    PLAYER_GRID_DISPLAY_WIDTH, 
    PLAYER_GRID_CELL_WIDTH_PX, 
    PLAYER_GRID_CELL_HEIGHT_PX, 
    AUTOBATTLER_UNIT_VISUAL_SIZE,
    AUTOBATTLER_UNIT_VISUAL_HEIGHT,
    AUTOBATTLER_HP_BAR_WIDTH,
    AUTOBATTLER_HP_BAR_HEIGHT,
    AUTOBATTLER_STACK_COUNTER_FONT_SIZE,
    AUTOBATTLER_PLAYER_UNIT_COLOR,
    AUTOBATTLER_ENEMY_UNIT_COLOR,
    AUTOBATTLER_PLAYER_HQ_COLOR,
    AUTOBATTLER_ENEMY_BUILDING_COLOR,
    AUTOBATTLER_STACK_COUNTER_COLOR,
    AUTOBATTLER_STACK_COUNTER_FONT,
    AUTOBATTLER_HP_BAR_BG_COLOR,
    AUTOBATTLER_HP_BAR_PLAYER_COLOR,
    AUTOBATTLER_HP_BAR_ENEMY_COLOR,
    AUTOBATTLER_PROGRESS_BAR_HEIGHT,
    AUTOBATTLER_PROGRESS_BAR_BG_COLOR,
    AUTOBATTLER_PROGRESS_BAR_FILL_COLOR,
    AUTOBATTLER_FARM_BUFF_AURA_COLOR,
    AUTOBATTLER_VIEWPORT_WIDTH, 
    AUTOBATTLER_VIEWPORT_HEIGHT, 
    AUTOBATTLER_WORLD_WIDTH, // Import for minimap
    AUTOBATTLER_WORLD_HEIGHT, // Import for minimap
    AUTOBATTLER_BATTLE_PATH_HEIGHT, 
    AUTOBATTLER_BATTLE_PATH_WIDTH 
} from '../constants';
import { renderAutoBattler } from '../utils/autoBattlerRenderer';
import AutoBattlerMinimap from '../components/AutoBattlerMinimap'; 


const AutoBattlerView: React.FC = () => { 
    const { gameState, dispatch } = useContext(GameContext);
    const autoBattlerStateRef = useRef<AutoBattlerState | null>(gameState.autoBattler); 
    
    useEffect(() => {
        autoBattlerStateRef.current = gameState.autoBattler;
    }, [gameState.autoBattler]);


    const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const canvasContainerRef = useRef<HTMLDivElement>(null); 

    // Panning State
    const [viewOffset, setViewOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    const [viewportDimensions, setViewportDimensions] = useState({
        width: AUTOBATTLER_VIEWPORT_WIDTH,
        height: AUTOBATTLER_VIEWPORT_HEIGHT,
    });


    const RENDER_CONSTANTS_VIEW = {
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
        PLAYER_BUILDING_GRID_COLS,
        PLAYER_BUILDING_GRID_ROWS,
        PLAYER_GRID_DISPLAY_WIDTH,
        PLAYER_GRID_CELL_WIDTH_PX,
        PLAYER_GRID_CELL_HEIGHT_PX,
        AUTOBATTLER_PROGRESS_BAR_HEIGHT,
        AUTOBATTLER_PROGRESS_BAR_BG_COLOR,
        AUTOBATTLER_PROGRESS_BAR_FILL_COLOR,
        AUTOBATTLER_FARM_BUFF_AURA_COLOR,
    };

    useEffect(() => {
        const container = canvasContainerRef.current;
        if (!container) return;

        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                const { width, height } = entry.contentRect;
                setViewportDimensions({ width, height });
                if(autoBattlerStateRef.current) {
                    dispatch({ 
                        type: 'AUTOBATTLER_GAME_TICK', 
                        payload: { canvasWidth: width, canvasHeight: height } 
                    });
                }
            }
        });

        resizeObserver.observe(container);
        setViewportDimensions({ width: container.clientWidth, height: container.clientHeight });
        
        return () => resizeObserver.disconnect();
    }, [dispatch]);


    useEffect(() => {
        if (!gameState.autoBattler || !gameState.autoBattler.isActive) {
            dispatch({ type: 'INITIALIZE_AUTO_BATTLER' });
        }
    }, [gameState.autoBattler, dispatch]);

    useEffect(() => {
        let gameTickIntervalId: number | undefined;
        if (gameState.autoBattler && gameState.autoBattler.isActive) {
            gameTickIntervalId = window.setInterval(() => {
                dispatch({ 
                    type: 'AUTOBATTLER_GAME_TICK',
                    payload: { canvasWidth: viewportDimensions.width, canvasHeight: viewportDimensions.height } 
                });
            }, AUTOBATTLER_TICK_INTERVAL_MS);
        }
        return () => {
            if (gameTickIntervalId) {
                window.clearInterval(gameTickIntervalId);
            }
        };
    }, [gameState.autoBattler?.isActive, dispatch, viewportDimensions]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !autoBattlerStateRef.current) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        const renderLoop = () => {
            if (autoBattlerStateRef.current) { 
                 renderAutoBattler(ctx, autoBattlerStateRef.current, RENDER_CONSTANTS_VIEW, {x: -viewOffset.x, y: -viewOffset.y});
            }
            animationFrameId = requestAnimationFrame(renderLoop);
        };
        renderLoop();
        return () => cancelAnimationFrame(animationFrameId);
    }, [RENDER_CONSTANTS_VIEW, viewOffset]); 

    if (!gameState.autoBattler || !gameState.autoBattler.isActive) {
        return <div className="p-6 text-center text-slate-300">Loading Auto-Battler Arena...</div>;
    }

    const { supplies, hand, grid } = gameState.autoBattler;

    const handleReturnToTown = () => {
        dispatch({ type: 'SET_ACTIVE_VIEW', payload: ActiveView.TOWN });
    };

    const handleCardClick = (index: number) => {
        setSelectedCardIndex(selectedCardIndex === index ? null : index);
    };

    const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
        if (event.button === 0) { 
            event.preventDefault();
            setIsDragging(true);
            setDragStart({ 
                x: event.clientX - viewOffset.x, 
                y: event.clientY - viewOffset.y 
            });
        }
    };

    const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
        if (!isDragging) return;
        event.preventDefault();

        const newRawX = event.clientX - dragStart.x;
        const newRawY = event.clientY - dragStart.y;

        const minOffsetX = Math.min(0, viewportDimensions.width - AUTOBATTLER_WORLD_WIDTH);
        const maxOffsetX = 0;
        const minOffsetY = Math.min(0, viewportDimensions.height - AUTOBATTLER_WORLD_HEIGHT);
        const maxOffsetY = 0;

        const clampedX = AUTOBATTLER_WORLD_WIDTH > viewportDimensions.width 
            ? Math.max(minOffsetX, Math.min(newRawX, maxOffsetX))
            : 0;
        const clampedY = AUTOBATTLER_WORLD_HEIGHT > viewportDimensions.height
            ? Math.max(minOffsetY, Math.min(newRawY, maxOffsetY))
            : 0;

        setViewOffset({ x: clampedX, y: clampedY });
    };

    const handleMouseUpOrLeave = () => {
        setIsDragging(false);
    };
    
    const handleCanvasContainerClick = (event: React.MouseEvent<HTMLDivElement>) => {
        const clickThreshold = 5; // pixels
        if (isDragging && dragStart && (Math.abs(event.clientX - (dragStart.x + viewOffset.x)) > clickThreshold || Math.abs(event.clientY - (dragStart.y + viewOffset.y)) > clickThreshold)) {
            return;
        }

        const container = canvasContainerRef.current;
        if (!container || selectedCardIndex === null || !gameState.autoBattler) return;

        const rect = container.getBoundingClientRect();
        const clickViewportX = event.clientX - rect.left;
        const clickViewportY = event.clientY - rect.top;
        
        const worldX = clickViewportX - viewOffset.x;
        const worldY = clickViewportY - viewOffset.y;

        if (worldX < PLAYER_GRID_DISPLAY_WIDTH && worldY < PLAYER_BUILDING_GRID_ROWS * PLAYER_GRID_CELL_HEIGHT_PX) { 
            const colIndex = Math.floor(worldX / PLAYER_GRID_CELL_WIDTH_PX);
            const rowIndex = Math.floor(worldY / PLAYER_GRID_CELL_HEIGHT_PX);

            if (colIndex >= 0 && colIndex < PLAYER_BUILDING_GRID_COLS &&
                rowIndex >= 0 && rowIndex < PLAYER_BUILDING_GRID_ROWS &&
                !gameState.autoBattler.grid[rowIndex]?.[colIndex]) {
                
                dispatch({
                    type: 'PLAY_AUTOBATTLER_CARD',
                    payload: {
                        handIndex: selectedCardIndex,
                        position: { x: colIndex, y: rowIndex },
                    },
                });
                setSelectedCardIndex(null);
            }
        }
    };
    
    const handleMinimapClick = (worldX: number, worldY: number) => {
        let targetViewOffsetX = -(worldX - viewportDimensions.width / 2);
        let targetViewOffsetY = -(worldY - viewportDimensions.height / 2);
    
        const minOffsetX = Math.min(0, viewportDimensions.width - AUTOBATTLER_WORLD_WIDTH);
        const maxOffsetX = 0;
        const minOffsetY = Math.min(0, viewportDimensions.height - AUTOBATTLER_WORLD_HEIGHT);
        const maxOffsetY = 0;
    
        targetViewOffsetX = AUTOBATTLER_WORLD_WIDTH > viewportDimensions.width
            ? Math.max(minOffsetX, Math.min(targetViewOffsetX, maxOffsetX))
            : 0;
        targetViewOffsetY = AUTOBATTLER_WORLD_HEIGHT > viewportDimensions.height
            ? Math.max(minOffsetY, Math.min(targetViewOffsetY, maxOffsetY))
            : 0;
    
        setViewOffset({ x: targetViewOffsetX, y: targetViewOffsetY });
    };


    const getDynamicCardCost = (card: AutoBattlerBuildingCard): number => {
        if (!grid) return card.cost; 
        const existingBuildingsOfType = grid.flat().filter(b => b && b.type === card.buildingType);
        const numberOfExisting = existingBuildingsOfType.length;

        if (card.buildingType === AutoBattlerBuildingType.BARRACKS) {
            if (numberOfExisting === 0) return 20;
            if (numberOfExisting === 1) return 40;
            let cost = 40;
            for (let i = 1; i < numberOfExisting; i++) { 
                cost += 30;
            }
            return cost + 30; 
        } else if (card.buildingType === AutoBattlerBuildingType.FARM) {
            return 40 + (10 * numberOfExisting);
        } else if (card.buildingType === AutoBattlerBuildingType.WINDMILL) {
            return 100 + (20 * numberOfExisting);
        }
        return card.cost;
    };
  

    return (
        <div className="p-2 sm:p-4 h-full flex flex-col text-slate-100 bg-slate-900 items-center">
            <div className="w-full flex justify-between items-center mb-2 flex-shrink-0">
                <h2 className="text-xl sm:text-2xl font-bold text-amber-400">War Academy - Auto Battler</h2>
                <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold text-yellow-300">
                        Supplies: {formatNumber(supplies)}
                    </span>
                    <Button onClick={handleReturnToTown} variant="secondary" size="sm">Return to Town</Button>
                </div>
            </div>

            <div 
                ref={canvasContainerRef}
                className="flex-grow w-full relative border-2 border-slate-700 rounded-lg bg-slate-800/50 overflow-hidden"
                aria-label="Auto Battler Arena: Player Grid and Battle Path"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUpOrLeave}
                onMouseLeave={handleMouseUpOrLeave}
                onClick={handleCanvasContainerClick} 
                style={{ cursor: isDragging ? 'grabbing' : (selectedCardIndex !== null ? 'copy' : 'grab') }}
            >
                <div 
                    className="absolute" 
                    style={{
                        width: `${AUTOBATTLER_WORLD_WIDTH}px`,
                        height: `${AUTOBATTLER_WORLD_HEIGHT}px`,
                        transform: `translate(${viewOffset.x}px, ${viewOffset.y}px)`,
                        willChange: 'transform',
                    }}
                >
                    <canvas 
                        ref={canvasRef}
                        width={AUTOBATTLER_WORLD_WIDTH}
                        height={AUTOBATTLER_WORLD_HEIGHT}
                        className="absolute top-0 left-0"
                    />
                </div>
                 <div className="absolute top-2 right-2 z-10 pointer-events-auto"> 
                    <AutoBattlerMinimap 
                        autoBattlerState={gameState.autoBattler}
                        onMinimapClick={handleMinimapClick}
                        worldWidth={AUTOBATTLER_WORLD_WIDTH}
                        worldHeight={AUTOBATTLER_WORLD_HEIGHT}
                        camera={{ x: -viewOffset.x, y: -viewOffset.y }}
                        viewportWidth={viewportDimensions.width} 
                        viewportHeight={viewportDimensions.height} 
                    />
                </div>
            </div>

            <div className="flex-shrink-0 w-full max-w-3xl mt-2 p-2 bg-slate-800/60 rounded-lg">
                <h3 className="text-md font-semibold text-lime-300 mb-1 text-center">Card Hand</h3>
                <div className="flex justify-center gap-2 flex-wrap">
                    {hand.map((card, index) => {
                        const dynamicCost = getDynamicCardCost(card);
                        return (
                            <button
                                key={card.id + '-' + index} 
                                onClick={(e) => { e.stopPropagation(); handleCardClick(index); }} 
                                className={`w-24 h-36 sm:w-28 sm:h-40 p-2 rounded-md border-2 transition-all duration-150 cursor-pointer hover:scale-105
                                            ${selectedCardIndex === index ? 'border-yellow-400 bg-slate-600 ring-2 ring-yellow-300' : 'border-slate-600 bg-slate-700 hover:border-slate-500'}`}
                                aria-pressed={selectedCardIndex === index}
                                aria-label={`Select ${card.name} card. Cost: ${dynamicCost} supplies.`}
                                disabled={supplies < dynamicCost}
                            >
                                <div className="flex flex-col h-full justify-between items-center text-center">
                                    <div className="font-semibold text-xs sm:text-sm text-lime-200">{card.name}</div>
                                    <div className="text-[0.6rem] sm:text-xs text-slate-300 my-1">Type: {card.buildingType.replace(/_/g, ' ')}</div>
                                    <div className={`font-bold text-md sm:text-lg ${supplies < dynamicCost ? 'text-red-500' : 'text-yellow-400'}`}>{dynamicCost}</div>
                                </div>
                            </button>
                        );
                    })}
                    {hand.length < 4 && Array(4 - hand.length).fill(null).map((_, index) => (
                         <div key={`empty-slot-${index}`} className="w-24 h-36 sm:w-28 sm:h-40 bg-slate-700/50 border-2 border-slate-600/70 rounded flex items-center justify-center text-slate-500 italic">
                            Empty
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AutoBattlerView;
