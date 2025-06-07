
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useGameContext } from '../context';
import Button from '../components/Button';
import { ResourceType, MinigameGridCellState, MinigameGolemState, MinigameEventType, MinigameUpgradeType, MinigameResourcePopupEvent, MinigameMoleState, StoneQuarryMinigameState } from '../types';
import { ICONS } from '../components/Icons';
import { formatNumber } from '../utils';
import {
    SQMG_GRID_SIZE,
    SQMG_GOLEM_COST_DIRT,
    SQMG_GOLEM_COST_ESSENCE,
    SQMG_CLAY_GOLEM_COST_CLAY,
    SQMG_SAND_GOLEM_COST_SAND,
    SQMG_SAND_GOLEM_COST_ESSENCE,
    SQMG_CRYSTAL_GOLEM_COST_EMERALD,
    SQMG_CRYSTAL_GOLEM_COST_RUBY,
    SQMG_CRYSTAL_GOLEM_COST_SAPPHIRE,
    SQMG_CRYSTAL_GOLEM_COST_ESSENCE,
    GAME_TICK_MS,
    RESOURCE_COLORS,
    SQMG_GOLEM_COLORS, 
} from '../constants';

// Import new sub-components
import MinigameCell from '../components/StoneQuarryMinigameView/MinigameCell';
import MinigameParticipantDisplay from '../components/StoneQuarryMinigameView/MinigameParticipantDisplay';
import MinigameUpgradesSection, { UpgradeConfig } from '../components/StoneQuarryMinigameView/MinigameUpgradesSection'; // UpgradeConfig might be better in a shared types if used by more parent components.
import MinigameResourcePopup, { MinigameResourcePopupProps } from '../components/MinigameResourcePopup'; // Import the new popup component


const CELL_SIZE_PX_FOR_POPUP_OFFSET = 40; // This remains for calculating initial offsets if needed

// AnimatedPopupData type for internal state, maps to MinigameResourcePopupProps
interface AnimatedPopupDataForView extends MinigameResourcePopupProps {
  originalTimestamp: number; // Keep original timestamp for cleanup logic
}


const formatMinigameResourceType = (type: ResourceType): string => {
  switch (type) {
    case ResourceType.MINIGAME_DIRT: return "Dirt";
    case ResourceType.MINIGAME_CLAY: return "Clay";
    case ResourceType.MINIGAME_SAND: return "Sand";
    case ResourceType.MINIGAME_ESSENCE: return "Essence";
    case ResourceType.MINIGAME_CRYSTAL: return "Crystal"; // Generic
    case ResourceType.MINIGAME_EMERALD: return "Emerald";
    case ResourceType.MINIGAME_RUBY: return "Ruby";
    case ResourceType.MINIGAME_SAPPHIRE: return "Sapphire";
    default: return type.replace('MINIGAME_', '').replace(/_/g, ' ');
  }
};


const StoneQuarryMinigameView: React.FC = () => {
  const { gameState, dispatch } = useGameContext();
  const minigameState = gameState.stoneQuarryMinigame;
  const [lastClickedCell, setLastClickedCell] = useState<{r:number, c:number} | null>(null);
  const [golemCellClickEffects, setGolemCellClickEffects] = useState<Record<string, number>>({});
  const [animatedPopups, setAnimatedPopups] = useState<AnimatedPopupDataForView[]>([]);

  useEffect(() => {
    if (!minigameState || !minigameState.gridInitialized) {
      dispatch({ type: 'STONE_QUARRY_MINIGAME_INIT' });
    }
  }, [minigameState, dispatch]);

 useEffect(() => {
    if (minigameState?.golems) {
        const now = Date.now();
        let effectsToSet: Record<string, number> = {};
        let hasNewEffects = false;

        minigameState.golems.forEach(golem => {
            if (golem.lastClickTick && (now - golem.lastClickTick < 350)) { 
                const cellKey = `${golem.r}-${golem.c}`;
                if (!golemCellClickEffects[cellKey] || golem.lastClickTick > golemCellClickEffects[cellKey]) {
                    effectsToSet[cellKey] = golem.lastClickTick;
                    hasNewEffects = true;
                }
            }
        });

        if (hasNewEffects) {
            setGolemCellClickEffects(prev => ({ ...prev, ...effectsToSet }));
            Object.keys(effectsToSet).forEach(cellKeyWithEffect => {
                 setTimeout(() => {
                    setGolemCellClickEffects(current => {
                        const updated = { ...current };
                        if (updated[cellKeyWithEffect] === effectsToSet[cellKeyWithEffect]) {
                            delete updated[cellKeyWithEffect];
                        }
                        return updated;
                    });
                }, 300); 
            });
        }
    }
  }, [minigameState?.golems, minigameState?.lastGolemActionTimestamp]); 

  useEffect(() => {
    if (minigameState && minigameState.popupEvents && minigameState.popupEvents.length > 0) {
      const newPopupsToAnimate: AnimatedPopupDataForView[] = [];
      minigameState.popupEvents.forEach(event => {
        if (event.amount === 0 && event.resourceType !== ResourceType.MINIGAME_DIRT && event.resourceType !== ResourceType.MINIGAME_CLAY) { 
            return;
        }
        const baseTopPercent = (event.r + 0.5) * (100 / SQMG_GRID_SIZE);
        const baseLeftPercent = (event.c + 0.5) * (100 / SQMG_GRID_SIZE);

        const initialOffsetX = (Math.random() - 0.5) * (CELL_SIZE_PX_FOR_POPUP_OFFSET * 0.3);
        const initialOffsetY = (Math.random() - 0.5) * (CELL_SIZE_PX_FOR_POPUP_OFFSET * 0.3);

        const topStyle = `calc(${baseTopPercent}% + ${initialOffsetY}px)`;
        const leftStyle = `calc(${baseLeftPercent}% + ${initialOffsetX}px)`;

        const arcHorizontalDrift = (Math.random() - 0.5) * 30;
        const arcVerticalPeak = -35 - Math.random() * 20;
        const arcVerticalFall = 40 + Math.random() * 20;

        const animationStyle = {
          '--initial-x-offset-px': '0px',
          '--initial-y-offset-px': '0px',
          '--arc-horizontal-drift': `${arcHorizontalDrift}px`,
          '--arc-vertical-peak': `${arcVerticalPeak}px`,
          '--arc-vertical-fall': `${arcVerticalFall}px`,
        };
        const text = event.amount > 0 ? `+${formatNumber(event.amount)} ${formatMinigameResourceType(event.resourceType)}` : `-${formatMinigameResourceType(event.resourceType)}`;
        
        newPopupsToAnimate.push({
          id: event.id, // Use the ID from the event
          text,
          colorClass: RESOURCE_COLORS[event.resourceType] || 'text-slate-100',
          topStyle,
          leftStyle,
          animationStyle,
          originalTimestamp: event.timestamp, // Keep original timestamp for cleanup
        });
      });

      setAnimatedPopups(prev => [...prev, ...newPopupsToAnimate].slice(-15));

      newPopupsToAnimate.forEach(p => {
        setTimeout(() => {
          setAnimatedPopups(current => current.filter(ap => ap.id !== p.id));
        }, 1500); // Duration of popup animation
      });
    }
  }, [minigameState?.popupEvents]);


  if (!minigameState || !minigameState.gridInitialized) {
    return (
      <div className="p-4 text-center">
        <h2 className="text-2xl font-bold text-sky-400 mb-4">Stone Quarry Excavation</h2>
        <p className="text-slate-300">Loading excavation site...</p>
      </div>
    );
  }

  const handleCellClick = (r: number, c: number) => {
    dispatch({ type: 'STONE_QUARRY_MINIGAME_CLICK_CELL', payload: { r, c } });
    setLastClickedCell({r,c});
  };

  const handleUpgrade = (upgradeType: MinigameUpgradeType) => {
    dispatch({ type: 'STONE_QUARRY_MINIGAME_PURCHASE_UPGRADE', payload: { upgradeType } });
  };

  const currentDirtGolemCost = SQMG_GOLEM_COST_DIRT + (minigameState.dirtGolemsCraftedCount * 50);

  const handleCraftDirtGolem = () => dispatch({ type: 'STONE_QUARRY_MINIGAME_CRAFT_GOLEM' });
  const handleCraftClayGolem = () => dispatch({ type: 'STONE_QUARRY_MINIGAME_CRAFT_CLAY_GOLEM' });
  const handleCraftSandGolem = () => dispatch({ type: 'STONE_QUARRY_MINIGAME_CRAFT_SAND_GOLEM' });
  const handleCraftCrystalGolem = () => dispatch({ type: 'STONE_QUARRY_MINIGAME_CRAFT_CRYSTAL_GOLEM' });
  
  const activeEvent = minigameState.activeMinigameEvent;
  const eventDurationSeconds = activeEvent ? Math.ceil(activeEvent.durationRemainingTicks * GAME_TICK_MS / 1000) : 0;

  const resourcesToDisplay = [
    ResourceType.MINIGAME_DIRT, ResourceType.MINIGAME_CLAY, ResourceType.MINIGAME_SAND,
    ResourceType.MINIGAME_ESSENCE, ResourceType.MINIGAME_CRYSTAL,
    ResourceType.MINIGAME_EMERALD, ResourceType.MINIGAME_RUBY, ResourceType.MINIGAME_SAPPHIRE
  ];


  return (
    <div className="p-2 sm:p-4 h-full flex flex-col text-slate-100">
      <h2 className="text-2xl sm:text-3xl font-bold text-amber-400 mb-3 text-center">Stone Quarry Excavation</h2>

      <div className="mb-3 p-2 bg-slate-800/60 rounded-lg shadow-md flex flex-wrap justify-center items-center gap-x-3 gap-y-1.5 text-sm sm:text-base">
        {resourcesToDisplay.map(resType => {
          const Icon = ICONS[resType];
          const colorClass = RESOURCE_COLORS[resType] || 'text-slate-300';
          return (
            <div key={resType} className={`flex items-center ${colorClass}`} title={formatMinigameResourceType(resType)}>
              {Icon && <Icon className="w-5 h-5 sm:w-6 sm:h-6 mr-1" />}
              <span className="font-semibold text-slate-100">{formatNumber(minigameState.resources[resType as keyof typeof minigameState.resources] || 0)}</span>
            </div>
          );
        })}
      </div>

       {activeEvent && (
        <div className="mb-3 p-2 bg-sky-700/70 rounded-lg shadow-md text-center animate-pulse">
          <p className="text-md font-semibold text-sky-200">
            Active Event: {activeEvent.type.replace(/_/g, ' ')}! ({eventDurationSeconds}s left)
          </p>
        </div>
      )}


      <div className="flex-grow flex flex-col md:flex-row gap-3 overflow-hidden">
        {/* Left Sidebar: Golem Crafting & Global Golem Upgrades */}
        <div className="w-full md:w-1/4 lg:w-1/5 bg-slate-800/60 p-3 rounded-lg shadow-md overflow-y-auto fancy-scrollbar space-y-2.5 flex-shrink-0">
          <h3 className="text-md font-semibold text-sky-300 border-b border-slate-700 pb-1">Golems ({minigameState.golems.length})</h3>
          <Button onClick={handleCraftDirtGolem} variant="secondary" size="sm" className="w-full" disabled={minigameState.resources[ResourceType.MINIGAME_DIRT] < currentDirtGolemCost || minigameState.resources[ResourceType.MINIGAME_ESSENCE] < SQMG_GOLEM_COST_ESSENCE}>
            Dirt ({formatNumber(currentDirtGolemCost)}D, {formatNumber(SQMG_GOLEM_COST_ESSENCE)}E)
          </Button>
          <Button onClick={handleCraftClayGolem} variant="secondary" size="sm" className="w-full" disabled={!minigameState.golems.some(g => g.golemType === 'DIRT') || minigameState.resources[ResourceType.MINIGAME_CLAY] < SQMG_CLAY_GOLEM_COST_CLAY}>
            Clay (1DG, {formatNumber(SQMG_CLAY_GOLEM_COST_CLAY)}C)
          </Button>
          <Button onClick={handleCraftSandGolem} variant="secondary" size="sm" className="w-full" disabled={!minigameState.golems.some(g => g.golemType === 'CLAY') || minigameState.resources[ResourceType.MINIGAME_SAND] < SQMG_SAND_GOLEM_COST_SAND || minigameState.resources[ResourceType.MINIGAME_ESSENCE] < SQMG_SAND_GOLEM_COST_ESSENCE}>
            Sand (1CG, {formatNumber(SQMG_SAND_GOLEM_COST_SAND)}S, {formatNumber(SQMG_SAND_GOLEM_COST_ESSENCE)}E)
          </Button>
          <Button onClick={handleCraftCrystalGolem} variant="secondary" size="sm" className="w-full" disabled={!minigameState.golems.some(g => g.golemType === 'SAND') || minigameState.resources[ResourceType.MINIGAME_EMERALD] < SQMG_CRYSTAL_GOLEM_COST_EMERALD || minigameState.resources[ResourceType.MINIGAME_RUBY] < SQMG_CRYSTAL_GOLEM_COST_RUBY || minigameState.resources[ResourceType.MINIGAME_SAPPHIRE] < SQMG_CRYSTAL_GOLEM_COST_SAPPHIRE || minigameState.resources[ResourceType.MINIGAME_ESSENCE] < SQMG_CRYSTAL_GOLEM_COST_ESSENCE}>
            Crystal (1SG, {formatNumber(SQMG_CRYSTAL_GOLEM_COST_EMERALD)}Em, {formatNumber(SQMG_CRYSTAL_GOLEM_COST_RUBY)}Ru, {formatNumber(SQMG_CRYSTAL_GOLEM_COST_SAPPHIRE)}Sa, {formatNumber(SQMG_CRYSTAL_GOLEM_COST_ESSENCE)}E)
          </Button>
          <MinigameUpgradesSection title="Golem Upgrades" sectionId="golem" minigameState={minigameState} handleUpgrade={handleUpgrade} />
        </div>

        {/* Center: Grid */}
        <div className="flex-grow bg-slate-900/70 p-1 sm:p-2 rounded-lg shadow-inner relative aspect-square max-w-full max-h-full">
          <div
            className="grid relative"
            style={{
              gridTemplateColumns: `repeat(${SQMG_GRID_SIZE}, 1fr)`,
              gridTemplateRows: `repeat(${SQMG_GRID_SIZE}, 1fr)`,
              gap: '2px',
              width: '100%',
              height: '100%'
            }}
          >
            {minigameState.gridCells.flat().map((cell) => (
              <MinigameCell
                key={`${cell.r}-${cell.c}`}
                cellData={cell}
                onClick={handleCellClick}
                lastClickedCell={lastClickedCell}
                showGolemClickEffect={!!golemCellClickEffects[`${cell.r}-${cell.c}`]}
              />
            ))}
             {minigameState.golems.map(golem => <MinigameParticipantDisplay key={golem.id} participant={golem} color={SQMG_GOLEM_COLORS[golem.golemType]} iconName="MINIGAME_GOLEM"/>)}
             {minigameState.moles.map(mole => <MinigameParticipantDisplay key={mole.id} participant={mole} color={SQMG_GOLEM_COLORS['MOLE']} iconName="MINIGAME_GOLEM"/>)}
          </div>
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

        {/* Right Sidebar: Player Upgrades */}
        <div className="w-full md:w-1/4 lg:w-1/5 bg-slate-800/60 p-3 rounded-lg shadow-md overflow-y-auto fancy-scrollbar space-y-2.5 flex-shrink-0">
          <MinigameUpgradesSection title="Player Upgrades" sectionId="player" minigameState={minigameState} handleUpgrade={handleUpgrade} />
          <MinigameUpgradesSection title="Gem Expertise" sectionId="gem_expertise" minigameState={minigameState} handleUpgrade={handleUpgrade} />
        </div>
      </div>
    </div>
  );
};

export default StoneQuarryMinigameView;
