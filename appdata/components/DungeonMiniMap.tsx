
import React from 'react';
import { DungeonGridState, DungeonCell, CellType, TrapDefinition, DungeonEventDefinition, DungeonEncounterDefinition } from '../types';
import { useGameContext } from '../context'; 

const MINI_CELL_SIZE_PX = 10; 
const MINI_GRID_GAP_PX = 2;  

interface DungeonMiniMapProps {
  gridState: DungeonGridState;
}

const DungeonMiniMap: React.FC<DungeonMiniMapProps> = ({ gridState }) => {
  const { staticData } = useGameContext(); 
  const { grid, rows, cols, partyPosition, dungeonDefinitionId, currentFloor } = gridState;

  const dungeonDef = staticData.dungeonDefinitions[dungeonDefinitionId];
  const floorDef = dungeonDef?.floors[currentFloor];

  return (
    <div 
      className="grid border border-slate-600 bg-slate-800/70 p-1 rounded shadow-lg glass-effect"
      style={{
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
        width: `${cols * (MINI_CELL_SIZE_PX + MINI_GRID_GAP_PX) + MINI_GRID_GAP_PX}px`,
        height: `${rows * (MINI_CELL_SIZE_PX + MINI_GRID_GAP_PX) + MINI_GRID_GAP_PX}px`,
        gap: `${MINI_GRID_GAP_PX}px`,
      }}
      aria-label="Dungeon Mini-Map"
    >
      {grid.map((row, r) =>
        row.map((cell, c) => {
          let bgColor = 'bg-slate-700'; 
          let cellTypeForTitle = 'Unrevealed';

          if (cell.isRevealed) {
            cellTypeForTitle = cell.type;
            switch (cell.type) {
              case CellType.EMPTY:
                bgColor = cell.isVisited ? 'bg-slate-300' : 'bg-slate-400';
                break;
              case CellType.WALL:
                bgColor = 'bg-black'; // Changed from bg-black-700 for better contrast potentially
                break;
              case CellType.START:
                bgColor = 'bg-blue-500';
                break;
              case CellType.EXIT:
                bgColor = 'bg-green-500';
                break;
              case CellType.ENEMY:
                const encounterDef = floorDef?.enemies.find(enc => enc.id === cell.enemyEncounterId);
                bgColor = encounterDef?.isElite ? 'bg-red-800' : 'bg-red-600'; 
                cellTypeForTitle = encounterDef?.isElite ? 'Enemy (Elite)' : 'Enemy';
                break;
              case CellType.LOOT:
                bgColor = 'bg-yellow-500'; // Slightly brightened
                break;
              case CellType.TRAP:
                if (cell.isTrapTriggered) {
                  bgColor = cell.isVisited ? 'bg-slate-300' : 'bg-slate-400'; 
                  cellTypeForTitle = 'Trap (Triggered)';
                } else {
                  bgColor = 'bg-orange-500'; // Slightly brightened
                }
                break;
              case CellType.EVENT:
                 const eventDef = staticData.eventDefinitions[cell.eventId || ''];
                if (cell.isEventTriggered && eventDef?.removeAfterTrigger) { 
                  bgColor = cell.isVisited ? 'bg-slate-300' : 'bg-slate-400';
                  cellTypeForTitle = 'Event (Triggered)';
                } else {
                  bgColor = 'bg-purple-500'; // Slightly brightened
                }
                break;
              // Removed LOCKED_DOOR and DUNGEON_KEY_SPAWN cases
              default:
                bgColor = 'bg-slate-600'; 
            }
          }

          if (partyPosition.r === r && partyPosition.c === c) {
            bgColor = 'bg-amber-400 ring-1 ring-amber-200'; 
            cellTypeForTitle = `${cellTypeForTitle} (Party)`;
          }

          return (
            <div
              key={`mini-${r}-${c}`}
              className={`w-full h-full rounded-sm ${bgColor}`}
              style={{
                width: `${MINI_CELL_SIZE_PX}px`,
                height: `${MINI_CELL_SIZE_PX}px`,
              }}
              title={`Cell (${c}, ${r}): ${cellTypeForTitle}`}
            ></div>
          );
        })
      )}
    </div>
  );
};

export default DungeonMiniMap;
