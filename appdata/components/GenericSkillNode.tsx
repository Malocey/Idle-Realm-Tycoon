
import React, { useState, useEffect, useMemo } from 'react';
import {
  SkillNodeDefinition,
  SharedSkillDefinition,
  HeroStats,
  ResourceType,
  CalculatedSpecialAttackData,
  Cost,
  GameState,
  HeroDefinition, 
} from '../types';
import { ICONS } from './Icons';
import Button from './Button';
import { formatNumber, canAfford, calculateSpecialAttackData, calculateMaxAffordableLevels } from '../utils';
import { SPECIAL_ATTACK_DEFINITIONS, SKILL_TREES } from '../gameData/index';
import { useGameContext } from '../context';
import { RESOURCE_COLORS } from '../constants'; 

interface GenericSkillNodeProps {
  skillDefinition: SkillNodeDefinition | SharedSkillDefinition;
  skillType: 'hero' | 'shared';
  heroDefinitionId?: string; 

  currentLevel: number;
  currentMinorLevel?: number;

  primaryUpgradePoints: number; 
  secondaryUpgradeResourcePool?: GameState['resources']; 

  onUpgradePrimary: (skillId: string, specialAttackId?: string) => void;
  onUpgradeSecondary?: (skillId: string) => void; 

  onClick: () => void;
  isExpanded: boolean;
  isPrerequisiteMet: boolean;

  expandedNodeWidth: number;
  expandedNodeHeight: number;
  nodeIdForLayout: string;
}

const NODE_SIZE_COMPACT = 80;
const SVG_STROKE_WIDTH = 4;

const GenericSkillNode: React.FC<GenericSkillNodeProps> = React.memo(({
  skillDefinition,
  skillType,
  heroDefinitionId,
  currentLevel,
  currentMinorLevel = 0,
  primaryUpgradePoints,
  secondaryUpgradeResourcePool,
  onUpgradePrimary,
  onUpgradeSecondary,
  onClick,
  isExpanded,
  isPrerequisiteMet,
  expandedNodeWidth,
  expandedNodeHeight,
  nodeIdForLayout,
}) => {
  const { gameState, staticData, dispatch } = useGameContext(); 
  const [isAnimating, setIsAnimating] = useState(false);

  const heroState = skillType === 'hero' && heroDefinitionId ? gameState.heroes.find(h => h.definitionId === heroDefinitionId) : null;

  useEffect(() => {
    if (isAnimating) {
      const timer = setTimeout(() => setIsAnimating(false), 600);
      return () => clearTimeout(timer);
    }
  }, [isAnimating]);

  const Icon = ICONS[skillDefinition.iconName];
  let titleColor = isPrerequisiteMet ? 'text-amber-300' : 'text-red-400';
  let descriptionText = "";
  let costDisplayElements: React.JSX.Element[] = [];
  let isMaxedOut = false;
  let meetsAllPrerequisites = isPrerequisiteMet; 

  // Hero Skill Specific Logic
  if (skillType === 'hero' && heroState) {
    const heroDef = staticData.heroDefinitions[heroState.definitionId];
    const currentSkillTree = staticData.skillTrees[heroDef.skillTreeId];
    const heroSkillDef = skillDefinition as SkillNodeDefinition;

    isMaxedOut = heroSkillDef.specialAttackId
      ? (SPECIAL_ATTACK_DEFINITIONS[heroSkillDef.specialAttackId]?.maxLevel !== -1 && currentLevel >= SPECIAL_ATTACK_DEFINITIONS[heroSkillDef.specialAttackId]?.maxLevel)
      : (heroSkillDef.maxLevel !== -1 && currentLevel >= heroSkillDef.maxLevel);

    if (currentSkillTree) {
        for (const prereq of heroSkillDef.prerequisites) {
          if ((heroState.skillLevels[prereq.skillId] || 0) < prereq.level) {
            meetsAllPrerequisites = false;
            break;
          }
        }
    } else {
        meetsAllPrerequisites = false;
    }
    
    titleColor = meetsAllPrerequisites ? (isMaxedOut ? 'text-green-300' : 'text-amber-300') : 'text-red-400';

    if (heroSkillDef.specialAttackId) {
        const saDef = SPECIAL_ATTACK_DEFINITIONS[heroSkillDef.specialAttackId];
        if (saDef) {
            const calculatedDataCurrent = calculateSpecialAttackData(saDef, currentLevel);
            const calculatedDataNext = (isMaxedOut || !meetsAllPrerequisites) ? undefined : calculateSpecialAttackData(saDef, currentLevel + 1);
            descriptionText = heroSkillDef.description(currentLevel, currentLevel === 0 ? calculatedDataNext : calculatedDataCurrent);
            if (calculatedDataCurrent.currentManaCost && calculatedDataCurrent.currentManaCost > 0) {
              descriptionText += ` Mana Cost: ${calculatedDataCurrent.currentManaCost}.`;
            }
        }
    } else {
        let nextLevelBonusText = '';
        if (!isMaxedOut && heroSkillDef.statBonuses && meetsAllPrerequisites) {
            const nextLevelBonuses = heroSkillDef.statBonuses(currentLevel + 1);
            const currentBonuses = heroSkillDef.statBonuses(currentLevel);
            (Object.keys(nextLevelBonuses) as Array<keyof HeroStats>).forEach(statKey => {
                const diff = (nextLevelBonuses[statKey] || 0) - (currentBonuses[statKey] || 0);
                if (diff !== 0) { 
                    let suffix = '';
                    if (statKey === 'critChance' || statKey === 'critDamage') suffix = '%';
                    else if (statKey === 'manaRegen') suffix = '/s';
                    const valueDisplay = (statKey === 'critChance' || statKey === 'critDamage') 
                        ? (diff * 100).toFixed(1) 
                        : diff.toFixed((statKey === 'attackSpeed' || statKey === 'manaRegen') ? 2:0);
                    nextLevelBonusText += `+${valueDisplay}${suffix} ${statKey.replace(/([A-Z])/g, ' $1').toLowerCase()}; `;
                }
            });
            if (nextLevelBonusText) nextLevelBonusText = `Next: ${nextLevelBonusText}`;
        }
        descriptionText = heroSkillDef.description(currentLevel, nextLevelBonusText);
    }

    const singleLevelCostInfo = heroSkillDef.costPerLevel(currentLevel); 
    const singleLevelSkillPointsCost = singleLevelCostInfo.skillPoints || 0;
    const singleLevelHeroicPointsCost = singleLevelCostInfo.heroicPointsCost || 0;
    const singleLevelResourceCosts = singleLevelCostInfo.resources || [];

    if (singleLevelSkillPointsCost > 0) {
        costDisplayElements.push(
          <span key="spCost" className={`text-xs ${primaryUpgradePoints < singleLevelSkillPointsCost ? 'text-red-400' : 'text-amber-300'}`}>
            {singleLevelSkillPointsCost} SP / {primaryUpgradePoints}
          </span>
        );
    }
    if (singleLevelHeroicPointsCost > 0 && secondaryUpgradeResourcePool) {
        costDisplayElements.push(
          <span key="xpCost" className={`text-xs ml-1 ${(secondaryUpgradeResourcePool[ResourceType.HEROIC_POINTS] || 0) < singleLevelHeroicPointsCost ? 'text-red-400' : 'text-violet-400'}`}>
            {ICONS.HEROIC_POINTS && React.createElement(ICONS.HEROIC_POINTS, {className:"w-3 h-3 inline mr-0.5"})}
            {formatNumber(singleLevelHeroicPointsCost)} / {formatNumber(secondaryUpgradeResourcePool[ResourceType.HEROIC_POINTS] || 0)} Heroic Points
          </span>
        );
    }
    if (singleLevelResourceCosts.length > 0 && secondaryUpgradeResourcePool) {
        singleLevelResourceCosts.forEach(c => {
          costDisplayElements.push(
            <span key={`${c.resource}Cost`} className={`text-xs ml-1 ${(secondaryUpgradeResourcePool[c.resource] || 0) < c.amount ? 'text-red-400' : RESOURCE_COLORS[c.resource]}`}>
              {ICONS[c.resource] && React.createElement(ICONS[c.resource], {className:"w-3 h-3 inline mr-0.5"})}
              {formatNumber(c.amount)} / {formatNumber(secondaryUpgradeResourcePool[c.resource] || 0)} {c.resource.replace(/_/g,' ').toLowerCase()}
            </span>
          );
        });
    }
    if (costDisplayElements.length === 0 && !isMaxedOut && meetsAllPrerequisites) costDisplayElements.push(<span key="free" className="text-xs text-green-400">Free</span>);
  }
  // Shared Skill Specific Logic
  else if (skillType === 'shared') {
    const sharedSkillDef = skillDefinition as SharedSkillDefinition;
    const skillProgress = gameState.playerSharedSkills[sharedSkillDef.id] || { currentMajorLevel: 0, currentMinorLevel: 0 };
    
    const currentMajorLvlShared = skillProgress.currentMajorLevel;
    const currentMinorLvlShared = skillProgress.currentMinorLevel;

    const effectShared = sharedSkillDef.effects[0];
    let currentTotalBonusForDesc: number | { flat: number; percent: number };
    let nextMinorBonusForDesc: number | { flat: number; percent: number } | null = null;
    let nextMajorBonusForDesc: number | { flat: number; percent: number } | null = null;


    if (sharedSkillDef.id === 'SHARED_HP_FLAT') {
        let flat = 0; let percent = 0;
        for (let i = 0; i < currentMajorLvlShared; i++) {
            const majorVal = effectShared.baseValuePerMajorLevel[i] as { flat?: number; percent?: number };
            flat += majorVal.flat || 0;
            percent += majorVal.percent || 0;
            if (i < currentMajorLvlShared - 1) {
                const minorVal = effectShared.minorValuePerMinorLevel[i] as { flat?: number; percent?: number };
                flat += (minorVal.flat || 0) * (sharedSkillDef.minorLevelsPerMajorTier[i] || 0);
                percent += (minorVal.percent || 0) * (sharedSkillDef.minorLevelsPerMajorTier[i] || 0);
            }
        }
        if (currentMajorLvlShared > 0) {
            const minorValCurrent = effectShared.minorValuePerMinorLevel[currentMajorLvlShared - 1] as { flat?: number; percent?: number };
            flat += (minorValCurrent.flat || 0) * currentMinorLvlShared;
            percent += (minorValCurrent.percent || 0) * currentMinorLvlShared;
        }
        currentTotalBonusForDesc = { flat, percent };

        if (currentMajorLvlShared > 0 && currentMinorLvlShared < (sharedSkillDef.minorLevelsPerMajorTier[currentMajorLvlShared - 1] || 0)) {
            const nextMinorVal = effectShared.minorValuePerMinorLevel[currentMajorLvlShared - 1] as { flat?: number; percent?: number };
            nextMinorBonusForDesc = { flat: nextMinorVal.flat || 0, percent: nextMinorVal.percent || 0};
        }
        if (currentMajorLvlShared < sharedSkillDef.maxMajorLevels) {
            const nextMajorVal = effectShared.baseValuePerMajorLevel[currentMajorLvlShared] as { flat?: number; percent?: number };
             nextMajorBonusForDesc = { flat: nextMajorVal.flat || 0, percent: nextMajorVal.percent || 0 };
        }
    } else {
        let totalNumericBonus = 0;
        for (let i = 0; i < currentMajorLvlShared; i++) {
            totalNumericBonus += (effectShared.baseValuePerMajorLevel[i] as number) || 0;
            if (i < currentMajorLvlShared - 1) {
                totalNumericBonus += ((effectShared.minorValuePerMinorLevel[i] as number) || 0) * (sharedSkillDef.minorLevelsPerMajorTier[i] || 0);
            }
        }
        if (currentMajorLvlShared > 0) {
            totalNumericBonus += ((effectShared.minorValuePerMinorLevel[currentMajorLvlShared - 1] as number) || 0) * currentMinorLvlShared;
        }
        currentTotalBonusForDesc = totalNumericBonus;

        if (currentMajorLvlShared > 0 && currentMinorLvlShared < (sharedSkillDef.minorLevelsPerMajorTier[currentMajorLvlShared - 1] || 0)) {
            nextMinorBonusForDesc = (effectShared.minorValuePerMinorLevel[currentMajorLvlShared - 1] as number) || 0;
        }
        if (currentMajorLvlShared < sharedSkillDef.maxMajorLevels) {
            nextMajorBonusForDesc = (effectShared.baseValuePerMajorLevel[currentMajorLvlShared] as number) || 0;
        }
    }
    
    descriptionText = sharedSkillDef.description(currentTotalBonusForDesc, nextMinorBonusForDesc, nextMajorBonusForDesc, effectShared.isPercentage);
    isMaxedOut = currentMajorLvlShared >= sharedSkillDef.maxMajorLevels && (currentMajorLvlShared === 0 ? true : currentMinorLvlShared >= (sharedSkillDef.minorLevelsPerMajorTier[currentMajorLvlShared-1] || 0));

    const minorLevelsInCurrentTierShared = currentMajorLvlShared > 0 ? sharedSkillDef.minorLevelsPerMajorTier[currentMajorLvlShared - 1] : (sharedSkillDef.isPassiveEffect ? 0 : sharedSkillDef.minorLevelsPerMajorTier[0]);
    const isMaxMinorLevelForCurrentTierShared = currentMajorLvlShared > 0 && currentMinorLvlShared >= minorLevelsInCurrentTierShared;

    if (!isMaxedOut) {
      if (currentMajorLvlShared === 0 || isMaxMinorLevelForCurrentTierShared) { 
        const majorCost = sharedSkillDef.costSharedSkillPointsPerMajorLevel[currentMajorLvlShared] || Infinity;
        costDisplayElements.push(
          <span key="sharedSpCost" className={`text-xs ${primaryUpgradePoints < majorCost ? 'text-red-400' : 'text-amber-300'}`}>
            {majorCost} SP / {primaryUpgradePoints}
          </span>
        );
      } else if (currentMajorLvlShared > 0) { 
        const minorCost = sharedSkillDef.costHeroXpPoolPerMinorLevel(currentMajorLvlShared, currentMinorLvlShared);
        costDisplayElements.push(
          <span key="sharedHeroicPointsCost" className={`text-xs ${(secondaryUpgradeResourcePool?.[ResourceType.HEROIC_POINTS] || 0) < minorCost ? 'text-red-400' : 'text-violet-400'}`}>
            {ICONS.HEROIC_POINTS && React.createElement(ICONS.HEROIC_POINTS, {className:"w-3 h-3 inline mr-0.5"})}
            {formatNumber(minorCost)} / {formatNumber(secondaryUpgradeResourcePool?.[ResourceType.HEROIC_POINTS] || 0)} Heroic Points
          </span>
        );
      }
    }
  }

  const handlePrimaryUpgradeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAnimating(true);
    onUpgradePrimary(skillDefinition.id, (skillDefinition as SkillNodeDefinition).specialAttackId);
  };

  const handleSecondaryUpgradeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAnimating(true);
    if (onUpgradeSecondary) {
      onUpgradeSecondary(skillDefinition.id);
    }
  };
  
  const maxAffordableData = useMemo(() => {
    if (skillType === 'hero' && heroState && heroDefinitionId) {
        const heroSkillDef = skillDefinition as SkillNodeDefinition;
        const actualMaxLevel = heroSkillDef.specialAttackId 
            ? (SPECIAL_ATTACK_DEFINITIONS[heroSkillDef.specialAttackId]?.maxLevel ?? -1)
            : heroSkillDef.maxLevel;

        if ((actualMaxLevel !== -1 && currentLevel >= actualMaxLevel) || !meetsAllPrerequisites) {
          return { levels: 0, totalCost: [] };
        }
        
        return calculateMaxAffordableLevels({
            currentLevel: currentLevel,
            maxLevel: actualMaxLevel,
            currentMainResources: gameState.resources,
            getMainResourceCostForNextLevel: (simLevel) => {
                const costs = heroSkillDef.costPerLevel(simLevel);
                const mainCosts: Cost[] = costs.resources ? [...costs.resources] : [];
                if (costs.heroicPointsCost && costs.heroicPointsCost > 0) {
                    mainCosts.push({ resource: ResourceType.HEROIC_POINTS, amount: costs.heroicPointsCost });
                }
                return mainCosts;
            },
            secondaryResource: {
                name: "Skill Points",
                currentValue: heroState.skillPoints,
                getCostForNextLevel: (simLevel) => heroSkillDef.costPerLevel(simLevel).skillPoints || 0,
                tempResourceTypeForTotalCost: ResourceType.SKILL_POINTS_TEMP 
            },
        });
    }
    return { levels: 0, totalCost: [] };
  }, [skillType, heroState, heroDefinitionId, skillDefinition, currentLevel, meetsAllPrerequisites, gameState.resources, primaryUpgradePoints]);


  const canAffordSingleUpgrade = useMemo(() => {
    if (skillType === 'hero' && heroState) {
      const heroSkillDef = skillDefinition as SkillNodeDefinition;
      const singleCostInfo = heroSkillDef.costPerLevel(currentLevel);
      const spCost = singleCostInfo.skillPoints || 0;
      const heroicPointsCost = singleCostInfo.heroicPointsCost || 0;
      const resCosts = singleCostInfo.resources || [];

      return meetsAllPrerequisites && !isMaxedOut &&
             (spCost > 0 ? primaryUpgradePoints >= spCost : true) &&
             (heroicPointsCost > 0 ? (secondaryUpgradeResourcePool?.[ResourceType.HEROIC_POINTS] || 0) >= heroicPointsCost : true) &&
             (resCosts.length > 0 && secondaryUpgradeResourcePool ? canAfford(secondaryUpgradeResourcePool, resCosts) : true);
    }
    // Logic for Shared Skills affordability
    if (skillType === 'shared') {
        const sharedSkillDef = skillDefinition as SharedSkillDefinition;
        const skillProgress = gameState.playerSharedSkills[sharedSkillDef.id] || { currentMajorLevel: 0, currentMinorLevel: 0 };
        const currentMajorLvlShared = skillProgress.currentMajorLevel;
        const currentMinorLvlShared = skillProgress.currentMinorLevel;
        const minorLevelsInCurrentTierShared = currentMajorLvlShared > 0 ? sharedSkillDef.minorLevelsPerMajorTier[currentMajorLvlShared - 1] : (sharedSkillDef.isPassiveEffect ? 0 : sharedSkillDef.minorLevelsPerMajorTier[0]);
        const isMaxMinorLevelForCurrentTierShared = currentMajorLvlShared > 0 && currentMinorLvlShared >= minorLevelsInCurrentTierShared;

        if (isMaxedOut || !meetsAllPrerequisites) return false;

        if (currentMajorLvlShared === 0 || isMaxMinorLevelForCurrentTierShared) { // Check Major Upgrade
            const majorCost = sharedSkillDef.costSharedSkillPointsPerMajorLevel[currentMajorLvlShared] || Infinity;
            return primaryUpgradePoints >= majorCost;
        } else if (currentMajorLvlShared > 0) { // Check Minor Upgrade
            const minorCost = sharedSkillDef.costHeroXpPoolPerMinorLevel(currentMajorLvlShared, currentMinorLvlShared);
            return (secondaryUpgradeResourcePool?.[ResourceType.HEROIC_POINTS] || 0) >= minorCost;
        }
    }
    return false;
  }, [skillType, heroState, skillDefinition, currentLevel, primaryUpgradePoints, secondaryUpgradeResourcePool, meetsAllPrerequisites, isMaxedOut, gameState.playerSharedSkills, gameState.resources]);

  const nodeContainerStyle: React.CSSProperties = isExpanded
    ? { width: `${expandedNodeWidth}px`, minHeight: `${expandedNodeHeight}px`, height: 'auto' }
    : { width: `${NODE_SIZE_COMPACT}px`, height: `${NODE_SIZE_COMPACT}px` };

  let containerClasses = `shared-skill-node-container border-2 transition-all duration-300 ease-in-out relative 
    ${isExpanded ? 'expanded rounded-lg' : 'rounded-full'}
    ${isPrerequisiteMet ? 'cursor-pointer' : 'cursor-not-allowed'}
    ${isAnimating ? 'animate-special-cast hero-cast-pulse' : ''}
  `;

  let baseBorderColorClass = 'border-slate-600';
  let currentIconColor = 'text-slate-400'; 
  let bgColor = 'bg-slate-700/80 hover:bg-slate-600/90';
  let opacityClass = 'opacity-100';
  let pulseAnimationClass = '';
  let additionalBorderClasses = '';
  
  let finalMaxLevelDisplayValue: number | undefined | null = -1;
    if (skillType === 'hero') {
        const heroSkillDef = skillDefinition as SkillNodeDefinition;
        finalMaxLevelDisplayValue = heroSkillDef.specialAttackId
            ? SPECIAL_ATTACK_DEFINITIONS[heroSkillDef.specialAttackId!]?.maxLevel
            : heroSkillDef.maxLevel;
    } else {
        finalMaxLevelDisplayValue = (skillDefinition as SharedSkillDefinition).maxMajorLevels;
    }

  if (!isPrerequisiteMet) {
    baseBorderColorClass = 'border-red-700/50';
    titleColor = 'text-red-400/70';
    currentIconColor = 'text-red-600/60';
    bgColor = 'bg-slate-800/40';
    opacityClass = 'opacity-60';
  } else if (isMaxedOut) {
    baseBorderColorClass = 'border-transparent';
    additionalBorderClasses = 'skill-node-maxed'; 
    titleColor = 'text-green-300';
    currentIconColor = 'text-green-400';
    bgColor = 'bg-green-800/50 hover:bg-green-700/60';
  } else if (canAffordSingleUpgrade) {
    baseBorderColorClass = 'border-sky-500';
    additionalBorderClasses = 'ring-1 ring-sky-400/50';
    titleColor = 'text-sky-300';
    currentIconColor = 'text-sky-400';
    bgColor = 'bg-sky-700/50 hover:bg-sky-700/70';
    pulseAnimationClass = 'animate-pulse-strong';
  } else { 
    baseBorderColorClass = 'border-slate-500';
    titleColor = 'text-slate-300';
    currentIconColor = 'text-slate-400';
  }

  if (isExpanded) {
    baseBorderColorClass = 'border-yellow-400'; 
    additionalBorderClasses = 'ring-2 ring-yellow-300';
    bgColor = 'bg-slate-800 shadow-2xl'; 
  }

  containerClasses += ` ${baseBorderColorClass} ${additionalBorderClasses} ${bgColor} ${opacityClass} ${pulseAnimationClass}`;
  
  const nodeSizeForCurrentSkill = skillType === 'shared' ? (skillDefinition as SharedSkillDefinition).nodeSize : 'normal';
  const compactNodeSizeClass = nodeSizeForCurrentSkill === 'large' ? 'p-2' : 'p-1.5';
  const compactIconSizeClass = nodeSizeForCurrentSkill === 'large' ? 'w-7 h-7' : 'w-6 h-6';
  const compactNameSizeClass = nodeSizeForCurrentSkill === 'large' ? 'text-[0.6rem]' : 'text-[0.55rem]';
  const compactLevelSizeClass = nodeSizeForCurrentSkill === 'large' ? 'text-[0.55rem]' : 'text-[0.5rem]';

  return (
    <div
      id={nodeIdForLayout}
      className={containerClasses}
      style={nodeContainerStyle}
      onClick={isPrerequisiteMet ? onClick : undefined}
      role="button"
      tabIndex={isPrerequisiteMet ? 0 : -1}
      onKeyDown={isPrerequisiteMet ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
      aria-label={`Skill: ${skillDefinition.name}`}
    >
      <div className={`shared-skill-node-visual ${isExpanded ? 'expanded-node-style' : 'compact-node-style'} flex-grow`}>
        {!isExpanded && (
          <div className={`shared-skill-node-visual-compact-content ${compactNodeSizeClass}`}>
            {Icon && <Icon className={`${compactIconSizeClass} mx-auto mb-0.5 ${currentIconColor} filter drop-shadow-sm`} />}
            <p className={`${compactNameSizeClass} font-semibold ${titleColor} text-center leading-tight line-clamp-2 mb-0.5`}>
              {skillDefinition.name}
            </p>
            <p className={`${compactLevelSizeClass} text-slate-400`}>
              Lvl {currentLevel}{finalMaxLevelDisplayValue !== -1 ? `/${finalMaxLevelDisplayValue}` : ''}
            </p>
          </div>
        )}
        {isExpanded && (
          <div className="shared-skill-detail-content"> 
            <div className="flex flex-col h-full p-3">
                <div className="flex items-start justify-between mb-2 flex-shrink-0">
                    <div className="flex items-center">
                    <div className="p-1 bg-slate-700/50 rounded-md mr-2.5 flex-shrink-0">
                        {Icon && <Icon className={`w-7 h-7 ${titleColor}`} />}
                    </div>
                    <div>
                        <h3 className={`text-lg font-semibold ${titleColor} leading-tight`}>{skillDefinition.name}</h3>
                        <span className="text-xs text-slate-400">
                        Lvl {currentLevel}{finalMaxLevelDisplayValue !== -1 && `/${finalMaxLevelDisplayValue}`}
                        {skillType === 'shared' && (skillDefinition as SharedSkillDefinition).minorLevelsPerMajorTier[(gameState.playerSharedSkills[skillDefinition.id]?.currentMajorLevel || 1) -1] > 0 && ` (Minor ${currentMinorLevel}/${(skillDefinition as SharedSkillDefinition).minorLevelsPerMajorTier[(gameState.playerSharedSkills[skillDefinition.id]?.currentMajorLevel || 1) -1]})`}
                        </span>
                    </div>
                    </div>
                    <Button onClick={onClick} variant="ghost" size="sm" className="p-0.5 -mr-1 -mt-1 text-xl leading-none hover:text-red-400">&times;</Button>
                </div>
                
                <div className="flex-grow overflow-y-auto fancy-scrollbar mb-2 pr-1"> 
                    <p className="text-sm text-slate-300 mb-1 leading-normal">{descriptionText}</p>
                    {!meetsAllPrerequisites && heroState && skillType === 'hero' && (
                        <div className="mb-3 p-2 bg-red-900/30 rounded">
                            <p className="text-xs text-red-300 font-semibold">Requires:</p>
                            {(skillDefinition as SkillNodeDefinition).prerequisites.map(pr => {
                            const heroDefinition = staticData.heroDefinitions[heroState.definitionId] as HeroDefinition; 
                            const prereqSkillTree = staticData.skillTrees[heroDefinition.skillTreeId];
                            const prereqSkill = prereqSkillTree?.nodes.find(s => s.id === pr.skillId);
                            const currentPrereqLevel = heroState.skillLevels[pr.skillId] || 0;
                            if (currentPrereqLevel < pr.level) {
                                return <p key={pr.skillId} className="text-xs text-red-400 leading-tight">{prereqSkill?.name || pr.skillId} Lvl {pr.level} (Now: {currentPrereqLevel})</p>;
                            }
                            return null;
                            })}
                        </div>
                    )}
                    {!isMaxedOut && meetsAllPrerequisites && (
                        <div className="text-sm text-slate-400 mb-3">
                            <strong className="text-slate-500">Upgrade Cost:</strong> {costDisplayElements.length > 0 ? costDisplayElements.map((el, i) => <React.Fragment key={i}>{el}</React.Fragment>) : <span className="text-xs text-green-400">Free</span>}
                        </div>
                    )}
                </div>

                <div className="mt-auto space-y-2.5 pt-2.5 border-t border-slate-700/50 flex-shrink-0">
                    {skillType === 'hero' && !isMaxedOut && meetsAllPrerequisites && (
                      <>
                        <div className="flex space-x-2">
                            <Button 
                            onClick={handlePrimaryUpgradeClick}
                            disabled={!canAffordSingleUpgrade}
                            size="sm"
                            variant={canAffordSingleUpgrade ? "primary" : "secondary"}
                            className="flex-1"
                            >
                            {(currentLevel === 0 && (skillDefinition as SkillNodeDefinition).specialAttackId) || (currentLevel === 0 && !(skillDefinition as SkillNodeDefinition).specialAttackId) ? 'Learn' : 'Upgrade'}
                            </Button>
                            {heroState && (
                                <Button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsAnimating(true);
                                    const heroSkillDef = skillDefinition as SkillNodeDefinition;
                                    const actionType = heroSkillDef.specialAttackId ? 'LEARN_UPGRADE_SPECIAL_ATTACK' : 'UPGRADE_SKILL';
                                    dispatch({
                                        type: actionType,
                                        payload: {
                                            heroDefinitionId: heroState.definitionId,
                                            [heroSkillDef.specialAttackId ? 'skillNodeId' : 'skillId']: heroSkillDef.id,
                                            levelsToUpgrade: maxAffordableData.levels,
                                            totalBatchCost: maxAffordableData.totalCost
                                        }
                                    } as any);
                                }}
                                disabled={maxAffordableData.levels === 0}
                                size="sm"
                                variant="success"
                                className="flex-1"
                                >
                                Max (+{maxAffordableData.levels})
                                </Button>
                            )}
                        </div>
                      </>
                    )}
                    {skillType === 'shared' && !isMaxedOut && meetsAllPrerequisites && onUpgradeSecondary && (
                        <>
                         {(() => {
                            const sharedSkillDef = skillDefinition as SharedSkillDefinition;
                            const skillProgress = gameState.playerSharedSkills[sharedSkillDef.id] || { currentMajorLevel: 0, currentMinorLevel: 0 };
                            const currentMajorLvlShared = skillProgress.currentMajorLevel;
                            const currentMinorLvlShared = skillProgress.currentMinorLevel;
                            const minorLevelsInCurrentTierShared = currentMajorLvlShared > 0 ? sharedSkillDef.minorLevelsPerMajorTier[currentMajorLvlShared - 1] : (sharedSkillDef.isPassiveEffect ? 0 : sharedSkillDef.minorLevelsPerMajorTier[0]);
                            const isMaxMinorLevelForCurrentTierShared = currentMajorLvlShared > 0 && currentMinorLvlShared >= minorLevelsInCurrentTierShared;
                            
                            const showMajorUpgrade = (currentMajorLvlShared === 0 || isMaxMinorLevelForCurrentTierShared) && currentMajorLvlShared < sharedSkillDef.maxMajorLevels;
                            const showMinorUpgrade = currentMajorLvlShared > 0 && !isMaxMinorLevelForCurrentTierShared && minorLevelsInCurrentTierShared > 0;
                            
                            const majorCost = showMajorUpgrade ? (sharedSkillDef.costSharedSkillPointsPerMajorLevel[currentMajorLvlShared] || Infinity) : 0;
                            const canAffordMajor = primaryUpgradePoints >= majorCost;
                            
                            const minorCost = showMinorUpgrade ? sharedSkillDef.costHeroXpPoolPerMinorLevel(currentMajorLvlShared, currentMinorLvlShared) : 0;
                            const canAffordMinor = (secondaryUpgradeResourcePool?.[ResourceType.HEROIC_POINTS] || 0) >= minorCost;

                            return (
                                <div className="flex flex-col space-y-2">
                                    {showMinorUpgrade && (
                                        <Button onClick={handleSecondaryUpgradeClick} disabled={!canAffordMinor} size="sm" variant={canAffordMinor ? "primary" : "secondary"} className="w-full">
                                            Level Minor (+{((sharedSkillDef.effects[0].minorValuePerMinorLevel[currentMajorLvlShared - 1] as number) * (sharedSkillDef.effects[0].isPercentage ? 100 : 1)).toFixed(1)}{sharedSkillDef.effects[0].isPercentage ? '%' : ''})
                                        </Button>
                                    )}
                                    {showMajorUpgrade && (
                                        <Button onClick={handlePrimaryUpgradeClick} disabled={!canAffordMajor} size="sm" variant={canAffordMajor ? "success" : "secondary"} className="w-full">
                                             {currentMajorLvlShared === 0 ? 'Unlock Skill' : 'Upgrade Rank'}
                                        </Button>
                                    )}
                                </div>
                            );
                        })()}
                        </>
                    )}
                    {isMaxedOut && <p className="text-sm text-center text-green-400 py-2 w-full">Max Level Reached</p>}
                    {!meetsAllPrerequisites && <p className="text-sm text-center text-red-500 py-2 w-full">Locked</p>}
                </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default GenericSkillNode;
