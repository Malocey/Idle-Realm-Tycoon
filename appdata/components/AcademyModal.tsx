

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useGameContext } from '../context';
import Modal, { ModalProps } from './Modal';
import Button from './Button';
import { ICONS } from './Icons';
import { formatNumber } from '../utils';
import { ResearchDefinition, ResourceType, ResearchProgress, ResearchCategory, Cost } from '../types';
import ResearchNodeDisplay from './ResearchNodeDisplay';

const NODE_WIDTH = 160;
const NODE_HEIGHT = 90;
const GAP_X = 60;
const GAP_Y = 40;
const LINE_COLOR_LOCKED = 'rgba(100, 116, 139, 0.5)';
const LINE_COLOR_UNLOCKED = 'rgba(59, 130, 246, 0.8)';
const LINE_STROKE_WIDTH = 2.5;
const EXPANDED_NODE_AREA_PADDING = 100; // Extra padding around the tree for expanded nodes

interface AcademyModalProps extends Omit<ModalProps, 'title' | 'children'> {}

const AcademyModal: React.FC<AcademyModalProps> = ({ isOpen, onClose }) => {
  const { gameState, staticData, dispatch } = useGameContext();
  const { researchProgress, completedResearch, researchSlots, researchQueue, resources } = gameState;
  const researchDefinitions = staticData.researchDefinitions || {};

  const treeContainerRef = useRef<HTMLDivElement>(null);
  const innerTreeContentRef = useRef<HTMLDivElement>(null);

  const researchPoints = resources[ResourceType.RESEARCH_POINTS] || 0;

  const sortedResearchDefs = useMemo(() => {
    return Object.values(researchDefinitions).sort((a, b) => {
      if (a.position && b.position) {
        if (a.position.y !== b.position.y) return a.position.y - b.position.y;
        return a.position.x - b.position.x;
      }
      return a.name.localeCompare(b.name);
    });
  }, [researchDefinitions]);

  const { treeContentWidth, treeContentHeight, minX, minY } = useMemo(() => {
    let currentMinX = Infinity, currentMaxX = -Infinity, currentMinY = Infinity, currentMaxY = -Infinity;
    sortedResearchDefs.forEach(def => {
      if (def.position) {
        currentMinX = Math.min(currentMinX, def.position.x);
        currentMaxX = Math.max(currentMaxX, def.position.x);
        currentMinY = Math.min(currentMinY, def.position.y);
        currentMaxY = Math.max(currentMaxY, def.position.y);
      }
    });
    if (currentMinX === Infinity) return { treeContentWidth: 600, treeContentHeight: 400, minX:0, minY:0 };

    const width = (currentMaxX - currentMinX + 1) * (NODE_WIDTH + GAP_X) + EXPANDED_NODE_AREA_PADDING * 2;
    const height = (currentMaxY - currentMinY + 1) * (NODE_HEIGHT + GAP_Y) + EXPANDED_NODE_AREA_PADDING * 2;
    return { treeContentWidth: Math.max(width, 800), treeContentHeight: Math.max(height, 600), minX: currentMinX, minY: currentMinY };
  }, [sortedResearchDefs]);


  const calculateNodePosition = (nodeDef: ResearchDefinition | null | undefined): { top: number; left: number } => {
    if (!nodeDef || !nodeDef.position) {
      return { top: EXPANDED_NODE_AREA_PADDING, left: EXPANDED_NODE_AREA_PADDING };
    }
    return {
      top: (nodeDef.position.y - minY) * (NODE_HEIGHT + GAP_Y) + EXPANDED_NODE_AREA_PADDING,
      left: (nodeDef.position.x - minX) * (NODE_WIDTH + GAP_X) + EXPANDED_NODE_AREA_PADDING,
    };
  };

  const handleStartResearch = (researchId: string, levelToResearch: number) => {
    // console.log('[AcademyModal] handleStartResearch called with:', { researchId, levelToResearch });
    dispatch({ type: 'START_RESEARCH', payload: { researchId, levelToResearch } });
  };

  const handleCancelResearch = (researchId: string, slotId?: number) => {
    // console.log('[AcademyModal] handleCancelResearch called with:', { researchId, slotId });
    dispatch({ type: 'CANCEL_RESEARCH', payload: { researchId, researchSlotId: slotId } });
  };

  const getResearchStatus = (researchDef: ResearchDefinition | null | undefined): {
    currentLevel: number;
    isResearching: boolean;
    progressPercent: number;
    isInQueue: boolean;
    canAffordNext: boolean;
    isMaxLevel: boolean;
    canStartNext: boolean;
  } => {
    if (!researchDef) {
        return { currentLevel: 0, isResearching: false, progressPercent: 0, isInQueue: false, canAffordNext: false, isMaxLevel: true, canStartNext: false };
    }
    const completed = gameState.completedResearch[researchDef.id];
    const currentLevel = completed?.level || 0;
    const isMaxLevel = researchDef.maxLevel !== -1 && currentLevel >= researchDef.maxLevel;

    const researchingNow = Object.values(researchProgress).find(p => p.researchId === researchDef.id && p.levelBeingResearched === currentLevel + 1);
    const isInQueue = researchQueue.some(q => q.researchId === researchDef.id && q.levelToResearch === currentLevel + 1);

    let canAffordNext = false;
    let canStartNext = !isMaxLevel && !researchingNow && !isInQueue;
    let nextLevelCost: Cost[] = [];

    if (canStartNext) {
        nextLevelCost = researchDef.costPerLevel(currentLevel + 1);
        canAffordNext = nextLevelCost.every(cost => (resources[cost.resource] || 0) >= cost.amount);
    }

    if (researchDef.prerequisites.length > 0) {
        const prereqsMet = researchDef.prerequisites.every(pr => (gameState.completedResearch[pr.researchId]?.level || 0) >= pr.level);
        if (!prereqsMet) canStartNext = false;
    }
    
    return {
      currentLevel,
      isResearching: !!researchingNow,
      progressPercent: researchingNow ? (researchingNow.currentProgressTicks / researchingNow.targetTicks) * 100 : 0,
      isInQueue,
      canAffordNext,
      isMaxLevel,
      canStartNext,
    };
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Academy of Scholars - Research Tree" size="full">
      <div className="flex flex-col h-[calc(80vh)]">
        <div className="flex-shrink-0 p-3 bg-slate-700/50 rounded-md mb-3 flex justify-between items-center">
          <div className="flex items-center">
            {ICONS.RESEARCH_POINTS && <ICONS.RESEARCH_POINTS className="w-6 h-6 mr-2 text-teal-400" />}
            <span className="text-lg font-semibold text-teal-300">Research Points: {formatNumber(researchPoints)}</span>
          </div>
          <span className="text-sm text-slate-400">Research Slots: {Object.keys(researchProgress).length}/{researchSlots} | Queue: {researchQueue.length}</span>
        </div>

        <div ref={treeContainerRef} className="flex-grow relative overflow-auto fancy-scrollbar border border-slate-700 rounded-lg bg-slate-800/30">
          <div
            ref={innerTreeContentRef}
            style={{ width: treeContentWidth, height: treeContentHeight, position: 'relative' }}
          >
            <svg width={treeContentWidth} height={treeContentHeight} className="absolute top-0 left-0 pointer-events-none z-0">
              {sortedResearchDefs.map(targetNodeDef => {
                const currentTargetNode = targetNodeDef as ResearchDefinition;
                if (!currentTargetNode || !currentTargetNode.position) return null;
                const targetPos = calculateNodePosition(currentTargetNode);

                return currentTargetNode.prerequisites.map(prereq => {
                  const sourceNode = researchDefinitions[prereq.researchId] as ResearchDefinition;
                  if (!sourceNode || !sourceNode.position) return null;
                  const sourcePos = calculateNodePosition(sourceNode);

                  const isPrereqMet = (completedResearch[prereq.researchId]?.level || 0) >= prereq.level;
                  const strokeColor = isPrereqMet ? LINE_COLOR_UNLOCKED : LINE_COLOR_LOCKED;
                  const strokeDash = isPrereqMet ? undefined : "5,5";

                  return (
                    <line
                      key={`${sourceNode.id}-${currentTargetNode.id}`}
                      x1={sourcePos.left + NODE_WIDTH / 2}
                      y1={sourcePos.top + NODE_HEIGHT / 2}
                      x2={targetPos.left + NODE_WIDTH / 2}
                      y2={targetPos.top + NODE_HEIGHT / 2}
                      stroke={strokeColor}
                      strokeWidth={LINE_STROKE_WIDTH}
                      strokeDasharray={strokeDash}
                    />
                  );
                });
              })}
            </svg>

            <div className="relative z-10">
              {sortedResearchDefs.map(researchDef => {
                if (!researchDef) return null;
                const currentResearchDef = researchDef as ResearchDefinition;
                const pos = calculateNodePosition(currentResearchDef);
                const status = getResearchStatus(currentResearchDef);
                return (
                  <div
                    key={currentResearchDef.id}
                    style={{
                      position: 'absolute',
                      top: `${pos.top}px`,
                      left: `${pos.left}px`,
                      width: `${NODE_WIDTH}px`,
                      height: `${NODE_HEIGHT}px`,
                    }}
                  >
                    <ResearchNodeDisplay
                      researchDef={currentResearchDef}
                      status={status}
                      onStartResearch={() => handleStartResearch(currentResearchDef.id, status.currentLevel + 1)}
                      onCancelResearch={() => {
                          const activeResearch = Object.values(researchProgress).find(p => p.researchId === currentResearchDef.id);
                          handleCancelResearch(currentResearchDef.id, activeResearch?.researchSlotId);
                      }}
                      playerResources={resources}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AcademyModal;