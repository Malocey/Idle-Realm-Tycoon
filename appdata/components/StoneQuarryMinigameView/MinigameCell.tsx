
import React, { useState, useEffect } from 'react';
import { MinigameGridCellState, ResourceType } from '../../types';
import { SQMG_CELL_COLORS, SQMG_GRID_SIZE } from '../../constants'; // Corrected import

interface MinigameCellProps {
  cellData: MinigameGridCellState;
  onClick: (r: number, c: number) => void;
  lastClickedCell: { r: number, c: number } | null;
  showGolemClickEffect: boolean;
}

const MinigameCell: React.FC<MinigameCellProps> = ({ cellData, onClick, lastClickedCell, showGolemClickEffect }) => {
  const [isPlayerClicked, setIsPlayerClicked] = useState(false);

  useEffect(() => {
    if (lastClickedCell && lastClickedCell.r === cellData.r && lastClickedCell.c === cellData.c) {
      setIsPlayerClicked(true);
      const timer = setTimeout(() => setIsPlayerClicked(false), 150);
      return () => clearTimeout(timer);
    }
  }, [lastClickedCell, cellData.r, cellData.c]);

  const cellBaseColorClass = SQMG_CELL_COLORS[cellData.currentResource as keyof typeof SQMG_CELL_COLORS] || 'bg-gray-400';
  let cellTransformPulseClass = '';
  if (cellData.currentResource !== ResourceType.MINIGAME_SAND && cellData.clicksToNextResource > 0) {
    const progress = cellData.currentClicks / cellData.clicksToNextResource;
    if (progress >= 0.8) {
      cellTransformPulseClass = 'animate-cell-transform-pulse';
    }
  }

  const cellClasses = `
    w-full h-full ${cellBaseColorClass} ${cellTransformPulseClass}
    rounded flex items-center justify-center cursor-pointer
    transition-transform duration-100 ease-out
    ${isPlayerClicked ? 'transform scale-90 brightness-75' : 'brightness-100'}
    relative overflow-hidden
  `;

  return (
    <div
      className={cellClasses}
      onClick={() => onClick(cellData.r, cellData.c)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick(cellData.r, cellData.c) }}
      aria-label={`Excavate ${cellData.currentResource.replace('MINIGAME_', '').toLowerCase()} at cell ${cellData.r}, ${cellData.c}`}
    >
      {showGolemClickEffect && <div className="golem-click-effect"></div>}
    </div>
  );
};

export default MinigameCell;
