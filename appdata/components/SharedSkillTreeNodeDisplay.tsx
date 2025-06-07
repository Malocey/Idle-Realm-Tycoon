
import React from 'react';
import { SharedSkillDefinition, PlayerSharedSkillProgress, ResourceType } from '../types';
import { ICONS } from './Icons';
import SharedSkillDetailPanel from './SharedSkillDetailPanel'; 
import { formatNumber } from '../utils';

interface SharedSkillTreeNodeDisplayProps {
  skillDef: SharedSkillDefinition;
  skillProgress: PlayerSharedSkillProgress | undefined;
  sharedSkillPoints: number;
  heroXpPool: number;
  onClick: () => void;
  onCloseExpanded: () => void;
  onUpgradeMajor: (skillId: string) => void;
  onUpgradeMinor: (skillId: string) => void;
  isSelected: boolean;
  isExpanded: boolean;
  isPrerequisiteMet: boolean;
  expandedNodeWidth: number;
  expandedNodeHeight: number; 
}

const SVG_STROKE_WIDTH = 4; // Thickness of the progress border
const NODE_SIZE_COMPACT = 80; // Diameter of the circular node

const SharedSkillTreeNodeDisplay: React.FC<SharedSkillTreeNodeDisplayProps> = React.memo(({
  skillDef,
  skillProgress,
  sharedSkillPoints,
  heroXpPool,
  onClick,
  onCloseExpanded,
  onUpgradeMajor,
  onUpgradeMinor,
  isSelected,
  isExpanded,
  isPrerequisiteMet,
  expandedNodeWidth,
  expandedNodeHeight, 
}) => {
  const Icon = ICONS[skillDef.iconName];
  const currentMajorLevel = skillProgress?.currentMajorLevel || 0;
  const currentMinorLevel = skillProgress?.currentMinorLevel || 0;

  const isMaxMajorLevel = currentMajorLevel >= skillDef.maxMajorLevels;
  const minorLevelsInCurrentTier = currentMajorLevel > 0 && skillDef.minorLevelsPerMajorTier.length >= currentMajorLevel
    ? skillDef.minorLevelsPerMajorTier[currentMajorLevel - 1]
    : (skillDef.isPassiveEffect ? 0 : (skillDef.minorLevelsPerMajorTier[0] || 0)); 
    
  const isMaxMinorLevelForCurrentTier = currentMajorLevel > 0 && minorLevelsInCurrentTier > 0 && currentMinorLevel >= minorLevelsInCurrentTier;

  const isOriginNodeActive = skillDef.id === 'SHARED_ORIGIN' && currentMajorLevel >= 1;
  const isCompletelyMaxed = isOriginNodeActive || (skillDef.maxMajorLevels > 0 && isMaxMajorLevel && (minorLevelsInCurrentTier === 0 ? true : isMaxMinorLevelForCurrentTier));


  let baseBorderColorClass = 'border-slate-600';
  let titleColor = 'text-slate-300';
  let bgColor = 'bg-slate-700/80 hover:bg-slate-600/90';
  let iconColor = 'text-slate-400';
  let opacityClass = 'opacity-100';
  let pulseAnimationClass = '';
  let additionalBorderClasses = ''; 

  const costToUnlock = skillDef.costSharedSkillPointsPerMajorLevel[0] || Infinity;
  const canAffordUnlock = sharedSkillPoints >= costToUnlock;
  
  const showMinorProgressBarSVG = !isExpanded && currentMajorLevel > 0 && minorLevelsInCurrentTier > 0 && !isCompletelyMaxed && skillDef.id !== 'SHARED_ORIGIN';

  if (!isPrerequisiteMet) {
    baseBorderColorClass = 'border-red-800/50';
    titleColor = 'text-slate-500';
    iconColor = 'text-slate-600';
    bgColor = 'bg-slate-800/40 cursor-not-allowed';
    opacityClass = 'opacity-60';
  } else if (skillDef.id === 'SHARED_ORIGIN') {
    baseBorderColorClass = 'border-amber-400'; // Gold border for origin
    additionalBorderClasses = 'ring-2 ring-amber-300/70 shadow-lg shadow-amber-500/30';
    titleColor = 'text-yellow-200';
    iconColor = 'text-yellow-300';
    bgColor = 'bg-slate-700/90 hover:bg-slate-700/95';
  } else if (isCompletelyMaxed) {
    baseBorderColorClass = 'border-transparent'; // Maxed border handled by CSS class
    additionalBorderClasses = 'skill-node-maxed'; 
    titleColor = 'text-green-300';
    iconColor = 'text-green-400';
    bgColor = 'bg-green-800/50 hover:bg-green-700/60';
  } else if (currentMajorLevel === 0 && canAffordUnlock && !skillDef.isPassiveEffect) {
    baseBorderColorClass = 'border-sky-500'; // Blue for affordable unlock
    additionalBorderClasses = 'ring-1 ring-sky-400/50';
    titleColor = 'text-sky-300';
    iconColor = 'text-sky-400';
    bgColor = 'bg-sky-700/50 hover:bg-sky-700/70';
    pulseAnimationClass = 'animate-pulse-strong';
  } else if (currentMajorLevel === 0 && !skillDef.isPassiveEffect) { // Locked but prerequisite met
    baseBorderColorClass = 'border-sky-700/70';
    titleColor = 'text-sky-500/80';
    iconColor = 'text-sky-600/80';
    bgColor = 'bg-sky-800/40 hover:bg-sky-800/60';
  } else if (currentMajorLevel > 0) { // Active with potential minor upgrades
     baseBorderColorClass = showMinorProgressBarSVG ? 'border-transparent' : 'border-amber-500'; // Hide Tailwind border if SVG is showing progress
     additionalBorderClasses = showMinorProgressBarSVG ? '' : 'ring-1 ring-amber-400/50';
     titleColor = 'text-amber-300';
     iconColor = 'text-amber-400';
     const costMinor = skillDef.costHeroXpPoolPerMinorLevel(currentMajorLevel, currentMinorLevel);
     if (heroXpPool >= costMinor && !isMaxMinorLevelForCurrentTier) {
         pulseAnimationClass = 'animate-pulse-strong';
     }
  }

  if (isExpanded) {
    baseBorderColorClass = 'border-yellow-400'; 
    additionalBorderClasses = 'ring-2 ring-yellow-300';
    bgColor = 'bg-slate-800 shadow-2xl'; 
  }

  const nodeSizeClass = isExpanded ? '' : (skillDef.nodeSize === 'large' ? 'p-2' : 'p-1.5'); // Adjusted padding for compact
  const iconSizeClass = isExpanded ? '' : (skillDef.nodeSize === 'large' ? 'w-7 h-7' : 'w-6 h-6'); // Adjusted icon size
  const nameSizeClass = isExpanded ? '' : (skillDef.nodeSize === 'large' ? 'text-[0.6rem]' : 'text-[0.55rem]');
  const levelSizeClass = isExpanded ? '' : (skillDef.nodeSize === 'large' ? 'text-[0.55rem]' : 'text-[0.5rem]');

  const rankDisplayText = isOriginNodeActive
    ? 'Active'
    : isCompletelyMaxed && skillDef.id !== 'SHARED_ORIGIN'
    ? 'Max'
    : `Rank ${currentMajorLevel}/${skillDef.maxMajorLevels === 0 ? 1 : skillDef.maxMajorLevels}`;

  const style: React.CSSProperties = isExpanded
    ? { width: `${expandedNodeWidth}px`, minHeight: `${expandedNodeHeight}px`, height: 'auto' }
    : { width: `${NODE_SIZE_COMPACT}px`, height: `${NODE_SIZE_COMPACT}px` }; 


  const radius = (NODE_SIZE_COMPACT / 2) - (SVG_STROKE_WIDTH / 2);
  const circumference = 2 * Math.PI * radius;
  const minorProgressPercentage = minorLevelsInCurrentTier > 0 ? (currentMinorLevel / minorLevelsInCurrentTier) * 100 : 0;
  const strokeDashoffset = circumference * (1 - minorProgressPercentage / 100);

  return (
    <div
      className={`shared-skill-node-container border-2 transition-all duration-300 ease-in-out 
                  ${baseBorderColorClass} ${additionalBorderClasses} ${bgColor} ${opacityClass} ${pulseAnimationClass} 
                  ${isExpanded ? 'expanded' : ''}
                  ${!isPrerequisiteMet ? 'cursor-not-allowed' : 'cursor-pointer'}
                  relative`} 
      style={style}
      onClick={isPrerequisiteMet ? onClick : undefined} 
      role="button"
      tabIndex={isPrerequisiteMet ? 0 : -1}
      onKeyDown={isPrerequisiteMet ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
      aria-label={`Skill: ${skillDef.name}, ${rankDisplayText}. ${isExpanded ? 'Press to collapse.' : 'Press to expand.'}`}
      title={`${skillDef.name}${rankDisplayText !== 'Active' ? ` - ${rankDisplayText}` : ''}${isCompletelyMaxed ? ' (Maxed)' : !isPrerequisiteMet ? ' (Locked)' : currentMajorLevel === 0 && skillDef.id !== 'SHARED_ORIGIN' ? ' (Unlockable)' : ''}`}
    >
      {showMinorProgressBarSVG && (
        <svg className="circular-progress-svg" viewBox={`0 0 ${NODE_SIZE_COMPACT} ${NODE_SIZE_COMPACT}`}>
          <circle
            className="text-slate-600"
            stroke="currentColor"
            fill="transparent"
            strokeWidth={SVG_STROKE_WIDTH}
            r={radius}
            cx={NODE_SIZE_COMPACT / 2}
            cy={NODE_SIZE_COMPACT / 2}
          />
          <circle
            className="text-amber-400 transition-all duration-300 ease-out"
            stroke="currentColor"
            fill="transparent"
            strokeWidth={SVG_STROKE_WIDTH}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            r={radius}
            cx={NODE_SIZE_COMPACT / 2}
            cy={NODE_SIZE_COMPACT / 2}
          />
        </svg>
      )}
      <div className={`shared-skill-node-visual ${isExpanded ? 'expanded-node-style' : 'compact-node-style'} flex-grow`}>
        {!isExpanded && (
          <div className={`shared-skill-node-visual-compact-content ${nodeSizeClass}`}>
            {Icon && <Icon className={`${iconSizeClass} mx-auto mb-0.5 ${iconColor} filter drop-shadow-sm`} />}
            <p className={`${nameSizeClass} font-semibold ${titleColor} text-center leading-tight line-clamp-2 mb-0.5`}>
              {skillDef.name}
            </p>
            <p className={`${levelSizeClass} text-slate-400`}>
              {rankDisplayText}
            </p>
          </div>
        )}
        {isExpanded && (
          <div className="shared-skill-detail-content"> 
            <SharedSkillDetailPanel
              skillDef={skillDef}
              skillProgress={skillProgress}
              sharedSkillPoints={sharedSkillPoints}
              heroXpPool={heroXpPool}
              onUpgradeMajor={onUpgradeMajor}
              onUpgradeMinor={onUpgradeMinor}
              onClose={onCloseExpanded}
              panelId={`skill-detail-title-${skillDef.id}`}
            />
          </div>
        )}
      </div>
    </div>
  );
});

export default SharedSkillTreeNodeDisplay;
