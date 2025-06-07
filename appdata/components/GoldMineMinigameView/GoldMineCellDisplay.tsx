
import React from 'react';
import { GoldMineMinigameGridCell, ResourceType } from '../../types';
import { ICONS } from '../Icons';

interface GoldMineCellDisplayProps {
  cell: GoldMineMinigameGridCell;
  isPlayerHere: boolean;
}

const GoldMineCellDisplay: React.FC<GoldMineCellDisplayProps> = ({ cell, isPlayerHere }) => {
  let cellClasses = "w-full h-full flex items-center justify-center border border-slate-700 transition-all duration-100 relative text-xs";
  let content = null;
  const iconSizeClass = "w-5 h-5"; // Slightly smaller for grid view
  let titleText: string = cell.type;

  if (!cell.isRevealed) {
    cellClasses += " bg-slate-900"; // Unrevealed
    titleText = "Unrevealed";
  } else {
    switch (cell.type) {
      case ResourceType.EMPTY:
        cellClasses += " bg-slate-600";
        titleText = "Empty";
        break;
      case ResourceType.DIRT:
        cellClasses += " bg-yellow-700/80";
        content = ICONS.DIRT_ICON && <ICONS.DIRT_ICON className={`${iconSizeClass} text-yellow-200 opacity-70`} />;
        titleText = `Dirt (HP: ${cell.currentHp}/${cell.hardness})`;
        break;
      case ResourceType.STONE:
        cellClasses += " bg-gray-600/80";
        content = ICONS.STONE_ICON && <ICONS.STONE_ICON className={`${iconSizeClass} text-gray-300 opacity-70`} />;
        titleText = `Stone (HP: ${cell.currentHp}/${cell.hardness})`;
        break;
      case ResourceType.GOLD_ORE:
        cellClasses += " bg-yellow-500/80";
        content = ICONS.GOLD_ORE_ICON && <ICONS.GOLD_ORE_ICON className={`${iconSizeClass} text-yellow-200`} />;
        titleText = `Gold Ore (HP: ${cell.currentHp}/${cell.hardness})`;
        break;
      case ResourceType.DIAMOND_ORE:
        cellClasses += " bg-blue-500/80";
        content = ICONS.DIAMOND_ORE_ICON && <ICONS.DIAMOND_ORE_ICON className={`${iconSizeClass} text-blue-200`} />;
        titleText = `Diamond Ore (HP: ${cell.currentHp}/${cell.hardness})`;
        break;
      case ResourceType.OBSTACLE:
        cellClasses += " bg-slate-800";
        content = ICONS.OBSTACLE_ICON && <ICONS.OBSTACLE_ICON className={`${iconSizeClass} text-slate-500`} />;
        titleText = "Obstacle";
        break;
      case 'EXIT_SHAFT':
        cellClasses += " bg-green-700/80";
        content = ICONS.EXIT_SHAFT_ICON && <ICONS.EXIT_SHAFT_ICON className={`${iconSizeClass} text-green-200`} />;
        titleText = "Exit Shaft";
        break;
      default:
        cellClasses += " bg-slate-500"; // Fallback
        titleText = `Unknown (${cell.type})`;
    }
  }

  if (isPlayerHere) {
    // cellClasses += " ring-2 ring-amber-400 z-10"; // Ring can sometimes be obscured by adjacent cells, direct content better
    content = <div className="absolute inset-0 flex items-center justify-center">{ICONS.HERO && <ICONS.HERO className="w-6 h-6 text-amber-300 z-10 filter drop-shadow-lg" />}</div>;
    titleText += " (Player)";
  }
  
  const showHpBar = cell.isRevealed && cell.type !== ResourceType.EMPTY && cell.type !== 'EXIT_SHAFT' && cell.type !== ResourceType.OBSTACLE && cell.currentHp < cell.hardness && cell.currentHp > 0;

  return (
    <div className={cellClasses} title={titleText} style={{fontSize: '0.6rem'}}>
      {content}
      {showHpBar && (
        <div className="absolute bottom-0.5 left-0.5 right-0.5 h-1 bg-red-700/70 rounded-sm overflow-hidden">
          <div 
            className="h-full bg-red-400 transition-all duration-150"
            style={{ width: `${(cell.currentHp / cell.hardness) * 100}%`}}
          ></div>
        </div>
      )}
    </div>
  );
};

export default GoldMineCellDisplay;
