
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useGameContext } from '../context';
import { MapNode, WorldMapDefinition } from '../types';
import PoiInteractionModal from '../components/PoiInteractionModal';
import {MapPaths, MapNodeDisplay, MapBackground, MapPlayerMarker} from './WorldMapView/index';
import { useMapInteraction } from '../hooks/useMapInteraction';
import Button from '../components/Button'; 
import { ICONS } from '../components/Icons'; 

const MAP_CONTENT_WIDTH_PERCENT = 100;
const MAP_CONTENT_HEIGHT_PERCENT = 100;

const WorldMapView: React.FC = () => {
  const { gameState, dispatch, staticData } = useGameContext();
  const { currentMapId } = gameState;

  const currentMapDefinition = useMemo(() => staticData.worldMapDefinitions[currentMapId], [currentMapId, staticData.worldMapDefinitions]);
  const currentMapNodes = useMemo(() => currentMapDefinition?.nodes || [], [currentMapDefinition]);

  const {
    playerVisualPosition,
    handleNodeClick,
    handlePoiInteraction, 
    isMoving,
    poiModalContent,
    isPoiModalOpen,
    handleClosePoiModal,
    poiModalOnConfirmAction,
    poiModalConfirmButtonText,
    animationTargetNodeId,
    currentNode, 
  } = useMapInteraction(currentMapNodes, gameState.playerCurrentNodeId, gameState.revealedMapNodeIds, dispatch, staticData, currentMapId);

  const isCurrentNodeExaminable = useMemo(() => {
    if (!currentNode) return false;
    return currentNode.isBattleNode ||
           (currentNode.customWaveDefinitionIds && currentNode.customWaveDefinitionIds.length > 0) ||
           currentNode.poiType ||
           currentNode.description;
  }, [currentNode]);


  return (
    <div className="p-1 sm:p-2 h-full flex flex-col items-center justify-center bg-slate-800/30 rounded-lg relative"> {/* Added relative positioning */}
      <div className="text-center mb-2 flex-shrink-0">
        <h1 className="text-3xl font-bold text-amber-300">World Map</h1>
        <h2 className="text-xl text-sky-300">{currentMapDefinition?.name || "Unknown Region"}</h2>
      </div>

      <div className="flex-grow w-full max-w-4xl aspect-[16/10] relative border-4 border-slate-700 rounded-lg overflow-hidden shadow-2xl">
        <MapBackground mapId={currentMapDefinition?.id || 'verdant_plains'} />

        <svg
            width="100%"
            height="100%"
            viewBox={`0 0 ${MAP_CONTENT_WIDTH_PERCENT} ${MAP_CONTENT_HEIGHT_PERCENT}`}
            preserveAspectRatio="none"
            className="absolute inset-0 pointer-events-none z-0"
            aria-hidden="true"
        >
          <MapPaths
            currentMapNodes={currentMapNodes}
            revealedMapNodeIds={gameState.revealedMapNodeIds}
          />
        </svg>

        {currentMapNodes.map(node => (
          <MapNodeDisplay
            key={node.id}
            node={node}
            isRevealed={gameState.revealedMapNodeIds.includes(node.id)}
            isConnectedToRevealed={node.connections.some(connId => gameState.revealedMapNodeIds.includes(connId)) || gameState.revealedMapNodeIds.includes(node.id)}
            isCurrent={node.id === gameState.playerCurrentNodeId && !isMoving}
            isMovingToThisNode={isMoving && node.id === animationTargetNodeId}
            onClick={() => handleNodeClick(node.id)}
            currentNodeId={gameState.playerCurrentNodeId}
          />
        ))}

        {playerVisualPosition && (
          <MapPlayerMarker
            position={playerVisualPosition}
            isMoving={isMoving}
          />
        )}
      </div>
      {/* Examine Button Container - Positioned absolutely */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
        {currentNode && isCurrentNodeExaminable && !isMoving && (
            <Button
                onClick={() => handlePoiInteraction(currentNode)}
                variant="primary"
                size="md"
                icon={ICONS.INFO && <ICONS.INFO className="w-5 h-5" />}
            >
                Examine {currentNode.name}
            </Button>
        )}
      </div>
      {isPoiModalOpen && poiModalContent && (
        <PoiInteractionModal
          isOpen={isPoiModalOpen}
          onClose={handleClosePoiModal}
          title={poiModalContent.title}
          nodeName={poiModalContent.nodeName}
          onConfirm={poiModalOnConfirmAction || undefined}
          confirmButtonText={poiModalConfirmButtonText || undefined}
          isConfirmDisabled={false}
        >
          <p>{poiModalContent.message}</p>
        </PoiInteractionModal>
      )}
    </div>
  );
};

export default WorldMapView;
