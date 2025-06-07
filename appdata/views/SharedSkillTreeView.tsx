
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useGameContext } from '../context';
import { SharedSkillDefinition, PlayerSharedSkillProgress, ResourceType } from '../types';
import { ICONS } from '../components/Icons';
import { formatNumber } from '../utils';
import SharedSkillTreeNodeDisplay from '../components/SharedSkillTreeNodeDisplay';
import AnimatedStarfieldCanvas from '../components/AnimatedStarfieldCanvas';

const NODE_WIDTH = 80;
const NODE_HEIGHT = 90;
const GAP_X = 60;
const GAP_Y = 50;
const EXPANDED_NODE_WIDTH = 320;
const MIN_EXPANDED_NODE_HEIGHT = 220;
const CURVE_FACTOR = 30; // Adjust for more or less curve

const SharedSkillTreeView: React.FC = () => {
  const { gameState, staticData, dispatch } = useGameContext();
  const { playerSharedSkillPoints, playerSharedSkills, resources } = gameState;
  const heroXpPool = resources[ResourceType.HEROIC_POINTS] || 0;
  const [expandedSkillId, setExpandedSkillId] = useState<string | null>(null);
  const treeContainerRef = useRef<HTMLDivElement>(null);
  const innerTreeContentRef = useRef<HTMLDivElement>(null);
  const [contentOffset, setContentOffset] = useState({ top: 0, left: 0 });

  const skillDefinitionsToDisplay = Object.values(staticData.sharedSkillDefinitions);

  const handleUpgradeMajor = (skillId: string) => {
    dispatch({ type: 'UPGRADE_SHARED_SKILL_MAJOR', payload: { skillId } });
  };

  const handleUpgradeMinor = (skillId: string) => {
    dispatch({ type: 'UPGRADE_SHARED_SKILL_MINOR', payload: { skillId } });
  };

  const handleNodeClick = (skillId: string) => {
    setExpandedSkillId(prevId => (prevId === skillId ? null : skillId));
  };

  const handleCloseExpandedNode = () => {
    setExpandedSkillId(null);
  };

  let minX = 0, maxX = 0, minY = 0, maxY = 0;
  skillDefinitionsToDisplay.forEach(skill => {
    if (skill.position) {
      minX = Math.min(minX, skill.position.x);
      maxX = Math.max(maxX, skill.position.x);
      minY = Math.min(minY, skill.position.y);
      maxY = Math.max(maxY, skill.position.y);
    }
  });

  const calculateNodeTopLeft = (skillDef: SharedSkillDefinition): { top: number; left: number } => {
    if (!skillDef.position) return { top: 0, left: 0 };
    return {
      top: (skillDef.position.y - minY) * (NODE_HEIGHT + GAP_Y),
      left: (skillDef.position.x - minX) * (NODE_WIDTH + GAP_X),
    };
  };

  const treeContentWidth = (maxX - minX + 1) * (NODE_WIDTH + GAP_X) - GAP_X;
  const treeContentHeight = (maxY - minY + 1) * (NODE_HEIGHT + GAP_Y) - GAP_Y;

  const isPrerequisiteMet = (skillDef: SharedSkillDefinition): boolean => {
    if (!skillDef.prerequisites || skillDef.prerequisites.length === 0) return true;
    return skillDef.prerequisites.every(prereq =>
      (playerSharedSkills[prereq.skillId]?.currentMajorLevel || 0) >= prereq.majorLevel
    );
  };

  useEffect(() => {
    if (expandedSkillId && treeContainerRef.current && innerTreeContentRef.current) {
      const nodeElement = document.getElementById(`skill-node-${expandedSkillId}`);
      if (nodeElement) {
         const treeContainerRect = treeContainerRef.current.getBoundingClientRect();
         const nodeRect = nodeElement.getBoundingClientRect();

         const scrollTop = treeContainerRef.current.scrollTop;
         const scrollLeft = treeContainerRef.current.scrollLeft;

         const nodeTopRelativeToScrollable = nodeRect.top - treeContainerRect.top + scrollTop;
         const nodeLeftRelativeToScrollable = nodeRect.left - treeContainerRect.left + scrollLeft;

        const desiredScrollTop = nodeTopRelativeToScrollable - (treeContainerRect.height / 2) + (MIN_EXPANDED_NODE_HEIGHT / 2) ;
        const desiredScrollLeft = nodeLeftRelativeToScrollable - (treeContainerRect.width / 2) + (EXPANDED_NODE_WIDTH / 2);

        treeContainerRef.current.scrollTo({
            top: Math.max(0, desiredScrollTop),
            left: Math.max(0, desiredScrollLeft),
            behavior: 'smooth'
        });
      }
    }
  }, [expandedSkillId]);

  useEffect(() => {
    const calculateOffsets = () => {
      if (innerTreeContentRef.current && treeContainerRef.current) {
        const parentRect = treeContainerRef.current.getBoundingClientRect();
        const childRect = innerTreeContentRef.current.getBoundingClientRect();
        setContentOffset({
          top: childRect.top - parentRect.top + treeContainerRef.current.scrollTop,
          left: childRect.left - parentRect.left + treeContainerRef.current.scrollLeft,
        });
      }
    };
    calculateOffsets();
    const resizeObserver = new ResizeObserver(calculateOffsets);
    if (treeContainerRef.current) resizeObserver.observe(treeContainerRef.current);
    if (innerTreeContentRef.current) resizeObserver.observe(innerTreeContentRef.current);

    treeContainerRef.current?.addEventListener('scroll', calculateOffsets);

    return () => {
      resizeObserver.disconnect();
      treeContainerRef.current?.removeEventListener('scroll', calculateOffsets);
    };
  }, [treeContentWidth, treeContentHeight]);

  const nodePositionsForCanvas = useMemo(() =>
    skillDefinitionsToDisplay.reduce((acc, skill) => {
        if (skill.position) {
            const pos = calculateNodeTopLeft(skill);
            acc[skill.id] = {
                x: pos.left + NODE_WIDTH / 2,
                y: pos.top + NODE_HEIGHT / 2
            };
        }
        return acc;
    }, {} as Record<string, {x:number, y:number}>),
  [skillDefinitionsToDisplay, minY, minX]);

  return (
    <div className="p-2 sm:p-4 flex flex-col h-[calc(100vh-100px)] relative bg-slate-900">
      <div className="flex-shrink-0 flex justify-between items-center mb-4 pb-3 border-b border-slate-700/50 sticky top-0 bg-slate-900/80 backdrop-blur-sm py-2 z-30 px-2 -mx-2">
        <h2 className="text-xl sm:text-2xl font-bold text-sky-300">Shared Passive Skills</h2>
        <div className="text-md sm:text-lg text-amber-300 font-semibold flex items-center">
          {ICONS.UPGRADE && <ICONS.UPGRADE className="w-5 h-5 sm:w-6 sm:h-6 mr-1.5 text-sky-400"/>}
          Points: <span className="text-lg sm:text-xl ml-1">{playerSharedSkillPoints}</span>
        </div>
      </div>

      <div
        ref={treeContainerRef}
        className="flex-grow relative fancy-scrollbar overflow-auto rounded-lg shadow-xl border border-slate-700/50 bg-transparent"
        style={{ position: 'relative' }}
      >
        <AnimatedStarfieldCanvas
          playerSkills={playerSharedSkills}
          skillDefinitions={staticData.sharedSkillDefinitions}
          nodePositions={nodePositionsForCanvas}
          contentOffset={contentOffset}
        />
        <div
          ref={innerTreeContentRef}
          style={{
            width: Math.max(treeContentWidth + EXPANDED_NODE_WIDTH, 400),
            height: Math.max(treeContentHeight + MIN_EXPANDED_NODE_HEIGHT, 300),
            position: 'relative',
            margin: 'auto',
            padding: '32px',
            zIndex: 1,
          }}
        >
          <svg
            width={Math.max(treeContentWidth + EXPANDED_NODE_WIDTH, 400)}
            height={Math.max(treeContentHeight + MIN_EXPANDED_NODE_HEIGHT, 300)}
            className="absolute top-0 left-0"
            style={{ zIndex: 1 }}
            aria-hidden="true"
          >
            {skillDefinitionsToDisplay.map(targetSkill => {
              if (!targetSkill.position || !targetSkill.prerequisites) return null;
              return targetSkill.prerequisites.map(prereq => {
                const sourceSkill = staticData.sharedSkillDefinitions[prereq.skillId];
                if (!sourceSkill || !sourceSkill.position) return null;

                const sourcePos = calculateNodeTopLeft(sourceSkill);
                const targetPos = calculateNodeTopLeft(targetSkill);

                const x1 = sourcePos.left + NODE_WIDTH / 2;
                const y1 = sourcePos.top + NODE_HEIGHT / 2;
                const x2 = targetPos.left + NODE_WIDTH / 2;
                const y2 = targetPos.top + NODE_HEIGHT / 2;

                const prerequisiteFulfilled = (playerSharedSkills[prereq.skillId]?.currentMajorLevel || 0) >= prereq.majorLevel;
                const lineClass = prerequisiteFulfilled ? "skill-tree-line line-active-flow" : "skill-tree-line";
                const strokeColor = prerequisiteFulfilled ? "rgba(59, 130, 246, 0.7)" : "rgba(100, 116, 139, 0.4)";
                const strokeWidth = prerequisiteFulfilled ? "3" : "1.5";
                const strokeDasharray = prerequisiteFulfilled ? "none" : "5,5";

                const isDiagonal = x1 !== x2 && y1 !== y2;

                if (isDiagonal) {
                  const midX = (x1 + x2) / 2;
                  const midY = (y1 + y2) / 2;
                  const dx = x2 - x1;
                  const dy = y2 - y1;
                  const length = Math.sqrt(dx * dx + dy * dy);
                  
                  // Determine curve direction based on relative positions to avoid extreme curves for nearly horizontal/vertical lines.
                  // A simple heuristic: if the line is more horizontal, offset Y; if more vertical, offset X.
                  let curveFactorAdjusted = CURVE_FACTOR;
                  if (Math.abs(dx) > Math.abs(dy) * 2) { // More horizontal
                     curveFactorAdjusted = Math.sign(dy) * Math.abs(CURVE_FACTOR) * 0.5 ; // Softer curve for mostly horizontal
                     if( (x2 > x1 && y2 < y1) || (x2 < x1 && y2 > y1) ) curveFactorAdjusted *= -1; // Adjust for different diagonals
                  } else if (Math.abs(dy) > Math.abs(dx) * 2) { // More vertical
                     curveFactorAdjusted = Math.sign(dx) * Math.abs(CURVE_FACTOR) * -0.5; // Softer curve for mostly vertical
                     if( (x2 > x1 && y2 < y1) || (x2 < x1 && y2 > y1) ) curveFactorAdjusted *= -1;
                  } else { // Truly diagonal
                      // Offset perpendicular to the line: (midX - dy/len * C, midY + dx/len * C) or (midX + dy/len * C, midY - dx/len * C)
                      // We can choose one side consistently or alternate.
                      // Let's try offsetting towards a "center" point or a fixed direction for consistency
                      const offsetX = -dy / length * CURVE_FACTOR * ( (x1 < x2 && y1 < y2) || (x1 > x2 && y1 > y2) ? 1 : -1);
                      const offsetY = dx / length * CURVE_FACTOR * ( (x1 < x2 && y1 < y2) || (x1 > x2 && y1 > y2) ? 1 : -1);
                      const controlX = midX + offsetX;
                      const controlY = midY + offsetY;
                       return (
                        <path
                            key={`${sourceSkill.id}-${targetSkill.id}`}
                            d={`M ${x1} ${y1} Q ${controlX} ${controlY} ${x2} ${y2}`}
                            className={lineClass}
                            stroke={strokeColor}
                            strokeWidth={strokeWidth}
                            strokeDasharray={strokeDasharray}
                            fill="none"
                        />
                        );
                  }
                  // For predominantly horizontal/vertical, control point is offset perpendicular to the main axis of the line
                  const controlX = Math.abs(dx) > Math.abs(dy) ? midX : midX + curveFactorAdjusted;
                  const controlY = Math.abs(dy) > Math.abs(dx) ? midY : midY - curveFactorAdjusted; // Note: SVG y is inverted

                  return (
                    <path
                      key={`${sourceSkill.id}-${targetSkill.id}`}
                      d={`M ${x1} ${y1} Q ${controlX} ${controlY} ${x2} ${y2}`}
                      className={lineClass}
                      stroke={strokeColor}
                      strokeWidth={strokeWidth}
                      strokeDasharray={strokeDasharray}
                      fill="none"
                    />
                  );
                } else {
                  // Straight line for horizontal or vertical
                  return (
                    <line
                      key={`${sourceSkill.id}-${targetSkill.id}`}
                      x1={x1} y1={y1}
                      x2={x2} y2={y2}
                      className={lineClass}
                      stroke={strokeColor}
                      strokeWidth={strokeWidth}
                      strokeDasharray={strokeDasharray}
                    />
                  );
                }
              });
            })}
          </svg>

          {skillDefinitionsToDisplay.map(skillDef => {
            if (!skillDef.position) return null;
            const { top, left } = calculateNodeTopLeft(skillDef);
            const isExpanded = expandedSkillId === skillDef.id;

            return (
              <div
                id={`skill-node-${skillDef.id}`}
                key={skillDef.id}
                style={{
                  position: 'absolute',
                  top: `${top}px`,
                  left: `${left}px`,
                  zIndex: isExpanded ? 20 : 10,
                }}
                className={`shared-skill-node-container ${isExpanded ? 'expanded' : ''}`}
              >
                <SharedSkillTreeNodeDisplay
                  skillDef={skillDef}
                  skillProgress={playerSharedSkills[skillDef.id]}
                  sharedSkillPoints={playerSharedSkillPoints}
                  heroXpPool={heroXpPool}
                  onClick={() => handleNodeClick(skillDef.id)}
                  onCloseExpanded={handleCloseExpandedNode}
                  onUpgradeMajor={handleUpgradeMajor}
                  onUpgradeMinor={handleUpgradeMinor}
                  isSelected={expandedSkillId === skillDef.id}
                  isExpanded={isExpanded}
                  isPrerequisiteMet={isPrerequisiteMet(skillDef)}
                  expandedNodeWidth={EXPANDED_NODE_WIDTH}
                  expandedNodeHeight={MIN_EXPANDED_NODE_HEIGHT}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SharedSkillTreeView;
