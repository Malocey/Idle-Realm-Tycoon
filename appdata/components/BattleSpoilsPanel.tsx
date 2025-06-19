
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Cost, ResourceType, BuildingLevelUpEventInBattle } from '../types';
import { ICONS } from './Icons';
import { RESOURCE_COLORS } from '../constants';
import { formatNumber } from '../utils';
import { useGameContext } from '../context'; 

interface BattleSpoilsPanelProps {
  // Props will now be implicitly derived via useGameContext
}

type AnimatedValueKey = ResourceType | 'XP';

interface AnimationDetail {
  startValue: number;
  targetValue: number;
  startTime: number;
}

const ANIMATION_DURATION_MS = 400;

const BattleSpoilsPanel: React.FC<BattleSpoilsPanelProps> = () => {
  const { gameState } = useGameContext();
  const { battleState } = gameState;

  // Use session total collections
  const collectedLoot = battleState?.sessionTotalLoot || [];
  const collectedExp = battleState?.sessionTotalExp || 0;
  const buildingLevelUpEvents = battleState?.sessionTotalBuildingLevelUps || [];


  const [animatedValues, setAnimatedValues] = useState<Record<AnimatedValueKey, number>>(() => {
    const initialVals: Record<AnimatedValueKey, number> = {} as Record<AnimatedValueKey, number>;
    Object.values(ResourceType).forEach(rt => initialVals[rt] = 0);
    initialVals['XP'] = 0;
    return initialVals;
  });

  const animationDetailsRef = useRef<Partial<Record<AnimatedValueKey, AnimationDetail>>>({});
  const animationFrameIdRef = useRef<number | undefined>(undefined);

  const targetValues = useMemo(() => {
    const map: Record<AnimatedValueKey, number> = {} as Record<AnimatedValueKey, number>;
    Object.values(ResourceType).forEach(rt => map[rt] = 0);
    collectedLoot.forEach(item => {
      map[item.resource] = (map[item.resource] || 0) + item.amount;
    });
    map['XP'] = collectedExp;
    return map;
  }, [collectedLoot, collectedExp]);

  const processedBuildingLevelUps = useMemo(() => {
    // For session-wide display, we might want to show all distinct level-ups that happened in the session
    // or just the latest for each building. Current logic takes latest.
    const latestLevelUps = new Map<string, BuildingLevelUpEventInBattle>();
    buildingLevelUpEvents.forEach(event => {
        const existing = latestLevelUps.get(event.buildingId);
        if (!existing || event.newLevel > existing.newLevel || (event.newLevel === existing.newLevel && event.timestamp > existing.timestamp)) {
            latestLevelUps.set(event.buildingId, event);
        }
    });
    return Array.from(latestLevelUps.values()).sort((a, b) => a.timestamp - b.timestamp);
  }, [buildingLevelUpEvents]);


  useEffect(() => {
    let needsResourceAnimation = false;
    (Object.keys(targetValues) as AnimatedValueKey[]).forEach(key => {
        const currentAnimationDetail = animationDetailsRef.current[key];
        if (animatedValues[key] !== targetValues[key] || (currentAnimationDetail && currentAnimationDetail.targetValue !== targetValues[key])) {
            animationDetailsRef.current[key] = {
                startValue: animatedValues[key],
                targetValue: targetValues[key],
                startTime: performance.now(),
            };
            needsResourceAnimation = true;
        }
    });

    const animateResourceValues = (now: number) => {
        let stillAnimating = false;
        const newAv: Record<AnimatedValueKey, number> = {...animatedValues};

        (Object.keys(animationDetailsRef.current) as AnimatedValueKey[]).forEach(key => {
            const details = animationDetailsRef.current[key];
            if (details) {
                const elapsedTime = now - details.startTime;
                const progress = Math.min(1, elapsedTime / ANIMATION_DURATION_MS);
                newAv[key] = details.startValue + (details.targetValue - details.startValue) * progress;
                if (progress < 1) {
                    stillAnimating = true;
                } else {
                    newAv[key] = details.targetValue;
                    delete animationDetailsRef.current[key];
                }
            }
        });
        
        setAnimatedValues(prev => ({...prev, ...newAv})); 

        if (stillAnimating) {
            animationFrameIdRef.current = requestAnimationFrame(animateResourceValues);
        } else {
             if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
             animationFrameIdRef.current = undefined;
        }
    };
    
    if (needsResourceAnimation && !animationFrameIdRef.current) {
        animationFrameIdRef.current = requestAnimationFrame(animateResourceValues);
    }

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = undefined;
      }
    };
  }, [targetValues]); 

  const displayOrder: ResourceType[] = [
    ResourceType.GOLD, ResourceType.WOOD, ResourceType.STONE, ResourceType.FOOD, ResourceType.IRON, 
    ResourceType.CRYSTALS, ResourceType.LEATHER, ResourceType.CATACOMB_BLUEPRINT, ResourceType.CATACOMB_KEY,
    ResourceType.HERB_BLOODTHISTLE, ResourceType.HERB_IRONWOOD_LEAF, ResourceType.AETHERIUM, ResourceType.DEMONIC_COIN
  ];
  
  const lootToDisplay = displayOrder.filter(rt => animatedValues[rt] > 0 || targetValues[rt] > 0);

  const noSpoilsCollected = lootToDisplay.length === 0 && 
                            (animatedValues['XP'] <= 0 && targetValues['XP'] <= 0) &&
                            processedBuildingLevelUps.length === 0;

  if (!battleState || (battleState.status !== 'FIGHTING' && battleState.status !== 'VICTORY' && battleState.status !== 'DEFEAT')) {
     return null; 
  }

  if (noSpoilsCollected) {
    return (
        <div className="mt-2 p-3 rounded-lg glass-effect border border-slate-700 max-w-xs">
            <h4 className="text-sm font-semibold text-amber-300 mb-1.5">Spoils This Session:</h4>
            <p className="text-xs text-slate-500 italic">Nothing collected yet in this session...</p>
        </div>
    );
  }

  return (
    <div className="mt-2 p-3 rounded-lg glass-effect border border-slate-700 max-w-xs relative overflow-visible">
      <h4 className="text-sm font-semibold text-amber-300 mb-1.5">Spoils This Session:</h4>
      <div className="space-y-1">
        {lootToDisplay.map(resourceType => {
          const Icon = ICONS[resourceType];
          const value = animatedValues[resourceType] || 0;
          return (
            <div key={resourceType} className="flex items-center text-xs relative h-5">
              {Icon && <Icon className={`w-4 h-4 mr-1.5 ${RESOURCE_COLORS[resourceType] || 'text-slate-300'}`} />}
              <span className={`font-medium ${RESOURCE_COLORS[resourceType] || 'text-slate-200'}`}>
                {formatNumber(value)}
              </span>
              <span className="ml-1 text-slate-400">{resourceType.replace(/_/g, ' ')}</span>
            </div>
          );
        })}
        {(animatedValues['XP'] > 0 || targetValues['XP'] > 0) && (
          <div className="flex items-center text-xs relative h-5">
            {ICONS.HEROIC_POINTS && <ICONS.HEROIC_POINTS className={`w-4 h-4 mr-1.5 ${RESOURCE_COLORS.HEROIC_POINTS}`} />}
            <span className={`font-medium ${RESOURCE_COLORS.HEROIC_POINTS}`}>
              {formatNumber(animatedValues['XP'] || 0)}
            </span>
            <span className="ml-1 text-slate-400">Hero XP</span>
          </div>
        )}
        {processedBuildingLevelUps.length > 0 && (
          <div className="pt-1 mt-1 border-t border-slate-600/50">
            {processedBuildingLevelUps.map((event) => { 
               const BuildingIcon = ICONS[event.iconName] || ICONS.BUILDING;
               return (
                    <div key={event.id} className="flex items-center text-xs h-5 animate-fadeIn">
                        {BuildingIcon && <BuildingIcon className="w-4 h-4 mr-1.5 text-green-400" />}
                        <span className="text-green-300 font-medium">{event.buildingName}</span>
                        <span className="ml-1 text-slate-400">to Lvl {event.newLevel}!</span>
                    </div>
                );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default BattleSpoilsPanel;