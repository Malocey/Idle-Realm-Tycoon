
import React, { useEffect, useRef } from 'react';
import { useGameContext } from '../context';
import { PlayerOwnedShard, ShardDefinition } from '../types';
import { ICONS } from './Icons';
import { formatNumber } from '../utils';

interface ShardCardProps {
  heroDefinitionId: string; 
  shard: PlayerOwnedShard;
  definition: ShardDefinition;
  selectedShardForFusionInstanceId: string | null;
  setSelectedShardForFusionInstanceId: (id: string | null) => void;
  onTransferClick?: (shard: PlayerOwnedShard) => void; 
  isTransferMode?: boolean; 
  isSelectedForTransfer?: boolean; 
}

const ShardCard: React.FC<ShardCardProps> = ({
  heroDefinitionId,
  shard,
  definition,
  selectedShardForFusionInstanceId,
  setSelectedShardForFusionInstanceId,
  onTransferClick,
  isTransferMode = false,
  isSelectedForTransfer = false,
}) => {
  const { dispatch, gameState, getShardDisplayValue } = useGameContext();
  const cardRef = useRef<HTMLDivElement>(null);

  const statValue = getShardDisplayValue(shard.definitionId, shard.level);
  const Icon = ICONS[definition.iconName] || ICONS.SHARD_ICON;
  const justFused = gameState.justFusedShardInstanceId === shard.instanceId;

  const isSelectedForFusion = !isTransferMode && selectedShardForFusionInstanceId === shard.instanceId;
  let isValidFusionTarget = false;
  if (!isTransferMode && selectedShardForFusionInstanceId && selectedShardForFusionInstanceId !== shard.instanceId) {
    const currentlySelectedShard = gameState.heroes.find(h => h.definitionId === heroDefinitionId)?.ownedShards.find(s => s.instanceId === selectedShardForFusionInstanceId);
    if (currentlySelectedShard &&
        currentlySelectedShard.definitionId === shard.definitionId &&
        currentlySelectedShard.level === shard.level) {
      isValidFusionTarget = true;
    }
  }

  const handleClick = () => {
    if (isTransferMode && onTransferClick) {
      onTransferClick(shard);
      return;
    }

    // Fusion Logic
    if (isSelectedForFusion) {
      setSelectedShardForFusionInstanceId(null);
    } else if (selectedShardForFusionInstanceId) {
      const currentlySelectedShardForFusion = gameState.heroes.find(h => h.definitionId === heroDefinitionId)?.ownedShards.find(s => s.instanceId === selectedShardForFusionInstanceId);
      if (currentlySelectedShardForFusion &&
          currentlySelectedShardForFusion.definitionId === shard.definitionId &&
          currentlySelectedShardForFusion.level === shard.level) {
        dispatch({
          type: 'FUSE_SHARDS',
          payload: {
            heroDefinitionId: heroDefinitionId, 
            sourceShardInstanceId1: selectedShardForFusionInstanceId,
            sourceShardInstanceId2: shard.instanceId,
          },
        });
        setSelectedShardForFusionInstanceId(null);
      } else {
        setSelectedShardForFusionInstanceId(shard.instanceId);
      }
    } else {
      setSelectedShardForFusionInstanceId(shard.instanceId);
    }
  };

  useEffect(() => {
    if (justFused && cardRef.current) {
      cardRef.current.classList.add('shard-fused-flash');
      const timer = setTimeout(() => {
        if (cardRef.current) {
          cardRef.current.classList.remove('shard-fused-flash');
        }
        dispatch({ type: 'ANIMATION_ACK_FUSED_SHARD' });
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [justFused, shard.instanceId, dispatch]);

  let cardClasses = [
    'p-2.5 rounded-lg border-2 bg-slate-800/70 backdrop-blur-sm shadow-md cursor-pointer transition-all duration-150 ease-in-out',
    'flex flex-col items-center text-center relative',
  ];

  if (isTransferMode) {
    if (isSelectedForTransfer) {
      cardClasses.push('border-purple-500 ring-2 ring-purple-400 scale-105');
    } else {
      cardClasses.push('border-slate-600 hover:border-purple-400');
    }
  } else { // Fusion mode
    if (isSelectedForFusion) {
      cardClasses.push('shard-selected-for-fusion');
    } else if (isValidFusionTarget) {
      cardClasses.push('shard-valid-fusion-target');
    } else {
      cardClasses.push('border-slate-600 hover:border-sky-500 hover:shadow-lg');
    }
  }


  return (
    <div
      ref={cardRef}
      onClick={handleClick}
      className={cardClasses.join(' ')}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(); }}
      title={`${definition.name} - Lvl ${shard.level}\n+${formatNumber(statValue)} ${definition.statAffected.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}`}
    >
      {Icon && <Icon className="w-8 h-8 mb-1.5 text-sky-400" />}
      <p className="text-xs font-semibold text-slate-100 leading-tight">
        Lvl {shard.level}
      </p>
      <p className="text-[0.65rem] text-green-400 mt-0.5">
        +{formatNumber(statValue)} {definition.statAffected.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
      </p>
      {isTransferMode && (
         <button 
            className={`mt-1.5 text-xs font-semibold py-1 px-2 rounded-md w-full text-center text-[0.6rem] transition-colors
                        ${isSelectedForTransfer ? 'bg-purple-700 hover:bg-purple-800 text-white' : 'bg-purple-500 hover:bg-purple-600 text-white'}`}
            onClick={(e) => { e.stopPropagation(); handleClick();}}
        >
            {isSelectedForTransfer ? "Cancel Transfer" : "Select for Transfer"}
        </button>
      )}
    </div>
  );
};

export default ShardCard;
