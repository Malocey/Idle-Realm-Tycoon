
import React from 'react';
import { MapNode } from '../../types';
import { ICONS } from '../../components/Icons';

interface MapNodeDisplayProps {
  node: MapNode;
  isRevealed: boolean;
  isConnectedToRevealed: boolean;
  isCurrent: boolean;
  isMovingToThisNode: boolean;
  onClick: () => void;
  currentNodeId: string;
}

const MapNodeDisplay: React.FC<MapNodeDisplayProps> = ({
  node,
  isRevealed,
  isConnectedToRevealed,
  isCurrent,
  isMovingToThisNode,
  onClick,
  currentNodeId,
}) => {
  if (!isRevealed && !isConnectedToRevealed) return null;

  const NodeIcon = isRevealed ? ICONS[node.iconName] : ICONS.INFO;
  // Corrected isClickable logic:
  // A node is clickable if it's revealed AND (it's the current node OR it's connected to the player's current node)
  const isConnectedToCurrentPlayerNode = node.connections.includes(currentNodeId);
  const isClickable = isRevealed && (isCurrent || isConnectedToCurrentPlayerNode);


  let nodeClasses = "absolute transform -translate-x-1/2 -translate-y-1/2 p-1.5 rounded-full shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-75";
  let iconColor = "text-slate-100";

  if (!isRevealed && isConnectedToRevealed) {
    nodeClasses += " bg-slate-600/50 border-2 border-slate-500 cursor-default opacity-50";
    iconColor = "text-slate-400";
  } else if (isCurrent || isMovingToThisNode) {
    nodeClasses += " bg-amber-500/80 border-2 border-amber-300 ring-2 ring-amber-400 scale-110";
    iconColor = "text-white";
    if (!isMovingToThisNode && isCurrent) nodeClasses += " cursor-default";
    else if (isMovingToThisNode || isClickable) nodeClasses += " cursor-pointer";
  } else if (isClickable) {
    nodeClasses += " bg-sky-600/70 border-2 border-sky-400 hover:bg-sky-500/80 focus:ring-sky-300 cursor-pointer hover:scale-110 hover:shadow-xl";
    iconColor = "text-sky-100";
  } else {
    nodeClasses += " bg-slate-700/70 border-2 border-slate-500 cursor-default opacity-80";
    iconColor = "text-slate-300";
  }

  return (
    <button
      key={node.id}
      className={nodeClasses}
      style={{ left: `${node.x}%`, top: `${node.y}%`, zIndex: (isCurrent || isMovingToThisNode) ? 10 : (isRevealed ? 5 : 2) }}
      onClick={onClick}
      disabled={isMovingToThisNode || !isClickable}
      title={isRevealed ? `${node.name}${node.description ? ` - ${node.description}` : ''}${isCurrent ? ' (Current)' : isClickable ? ' (Reachable)' : ''}` : "Undiscovered Location"}
      aria-label={`Go to ${isRevealed ? node.name : 'Undiscovered Location'}`}
    >
      {NodeIcon && <NodeIcon className={`w-6 h-6 sm:w-7 sm:h-7 ${iconColor}`} />}
    </button>
  );
};

export default MapNodeDisplay;
