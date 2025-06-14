
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
const LINE_COLOR_LOCKED = 'rgba(100, 116, 139, 0.3)'; // Dimmer for locked
const LINE_COLOR_UNLOCKED = 'rgba(59, 130, 246, 0.9)'; // Brighter for unlocked
const LINE_STROKE_WIDTH_LOCKED = 1.5;
const LINE_STROKE_WIDTH_UNLOCKED = 3;
const LINE_STROKE_WIDTH_ACTIVE = 3.5; // For currently researching or completed
const LINE_COLOR_ACTIVE = 'rgba(250, 204, 21, 0.9)'; // Amber for active/completed path to current research

const EXPANDED_NODE_AREA_PADDING = 100; 

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
    dispatch({ type: 'START_RESEARCH', payload: { researchId, levelToResearch } });
  };

  const handleCancelResearch = (researchId: string, slotId?: number) => {
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
    prerequisitesMet: boolean;
  } => {
    if (!researchDef) {
        return { currentLevel: 0, isResearching: false, progressPercent: 0, isInQueue: false, canAffordNext: false, isMaxLevel: true, canStartNext: false, prerequisitesMet: false };
    }
    const completed = gameState.completedResearch[researchDef.id];
    const currentLevel = completed?.level || 0;
    const isMaxLevel = researchDef.maxLevel !== -1 && currentLevel >= researchDef.maxLevel;

    const researchingNow = Object.values(researchProgress).find(p => p.researchId === researchDef.id && p.levelBeingResearched === currentLevel + 1);
    const isInQueue = researchQueue.some(q => q.researchId === researchDef.id && q.levelToResearch === currentLevel + 1);

    let canAffordNext = false;
    let prerequisitesMet = true;
    if (researchDef.prerequisites.length > 0) {
        prerequisitesMet = researchDef.prerequisites.every(pr => (gameState.completedResearch[pr.researchId]?.level || 0) >= pr.level);
    }
    let canStartNext = prerequisitesMet && !isMaxLevel && !researchingNow && !isInQueue;
    
    if (canStartNext) {
        const nextLevelCost = researchDef.costPerLevel(currentLevel + 1);
        canAffordNext = nextLevelCost.every(cost => (resources[cost.resource] || 0) >= cost.amount);
    }
    
    return {
      currentLevel,
      isResearching: !!researchingNow,
      progressPercent: researchingNow ? (researchingNow.currentProgressTicks / researchingNow.targetTicks) * 100 : 0,
      isInQueue,
      canAffordNext,
      isMaxLevel,
      canStartNext,
      prerequisitesMet,
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
              <defs>
                <marker id="arrowhead-unlocked" markerWidth="8" markerHeight="5" refX="7" refY="2.5" orient="auto">
                  <polygon points="0 0, 8 2.5, 0 5" fill={LINE_COLOR_UNLOCKED} />
                </marker>
                 <marker id="arrowhead-active" markerWidth="8" markerHeight="5" refX="7" refY="2.5" orient="auto">
                  <polygon points="0 0, 8 2.5, 0 5" fill={LINE_COLOR_ACTIVE} />
                </marker>
                <marker id="arrowhead-locked" markerWidth="6" markerHeight="4" refX="5.5" refY="2" orient="auto">
                  <polygon points="0 0, 6 2, 0 4" fill={LINE_COLOR_LOCKED} />
                </marker>
              </defs>
              {sortedResearchDefs.map(targetNodeDef => {
                const currentTargetNode = targetNodeDef as ResearchDefinition;
                if (!currentTargetNode || !currentTargetNode.position) return null;
                const targetPos = calculateNodePosition(currentTargetNode);
                const targetStatus = getResearchStatus(currentTargetNode);

                return currentTargetNode.prerequisites.map(prereq => {
                  const sourceNode = researchDefinitions[prereq.researchId] as ResearchDefinition;
                  if (!sourceNode || !sourceNode.position) return null;
                  const sourcePos = calculateNodePosition(sourceNode);
                  const sourceStatus = getResearchStatus(sourceNode);

                  const isPrereqMetForThisLine = sourceStatus.currentLevel >= prereq.level;
                  let strokeColor = LINE_COLOR_LOCKED;
                  let strokeWidth = LINE_STROKE_WIDTH_LOCKED;
                  let strokeDash = "5,5";
                  let markerEnd = "url(#arrowhead-locked)";

                  if (isPrereqMetForThisLine) {
                    strokeColor = LINE_COLOR_UNLOCKED;
                    strokeWidth = LINE_STROKE_WIDTH_UNLOCKED;
                    strokeDash = "none";
                    markerEnd = "url(#arrowhead-unlocked)";
                  }
                  
                  // Highlight line if source is completed and target is researching/queued
                  if (isPrereqMetForThisLine && (targetStatus.isResearching || targetStatus.isInQueue)) {
                     strokeColor = LINE_COLOR_ACTIVE;
                     strokeWidth = LINE_STROKE_WIDTH_ACTIVE;
                     markerEnd = "url(#arrowhead-active)";
                  }


                  return (
                    <line
                      key={`${sourceNode.id}-${currentTargetNode.id}`}
                      x1={sourcePos.left + NODE_WIDTH / 2}
                      y1={sourcePos.top + NODE_HEIGHT / 2}
                      x2={targetPos.left + NODE_WIDTH / 2}
                      y2={targetPos.top + NODE_HEIGHT / 2}
                      stroke={strokeColor}
                      strokeWidth={strokeWidth}
                      strokeDasharray={strokeDash}
                      markerEnd={markerEnd}
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