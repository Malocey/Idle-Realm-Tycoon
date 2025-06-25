

import React, { useState, useEffect, useRef } from 'react';
import { BattleHero, BattleEnemy } from '../../types';
import { formatNumber } from '../../utils'; 
import { interpolateColor } from '../../utils/uiHelpers'; 
import { usePrevious } from '../../hooks/usePrevious'; 

interface BattleStatBarsProps {
  participantType: 'hero' | 'enemy';
  currentAnimatedHp: number; 
  maxHp: number;
  hpValueAnimationClass: string; 
  battleHero: BattleHero | null; 
  currentAnimatedMana: number; 
  maxMana: number;
  animatedExpState: { current: number; toNextLevel: number };
  displayMode: 'ALIVE' | 'DYING' | 'SHOWING_LOOT'; 
  formatNumber: (num: number) => string;
  participant: BattleHero | BattleEnemy; 
  currentAnimatedShield?: number; 
  maxShield?: number; 
}

const BattleStatBars: React.FC<BattleStatBarsProps> = React.memo(({
  participantType, currentAnimatedHp, maxHp, hpValueAnimationClass,
  battleHero, currentAnimatedMana, maxMana,
  animatedExpState, displayMode, formatNumber, participant,
  currentAnimatedShield, maxShield
}) => {
  const prevHpProp = usePrevious(currentAnimatedHp); // Tracks the prop value

  const targetHpPercentage = maxHp > 0 ? (currentAnimatedHp / maxHp) * 100 : 0;
  
  // For the "after-image" effect (damage drain visualization)
  // We want the red bar to show where the health *was* before dropping.
  const [afterImageDisplayPercent, setAfterImageDisplayPercent] = useState(targetHpPercentage);
  const afterImageTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (prevHpProp !== undefined && currentAnimatedHp < prevHpProp) {
      // HP Dropped: Set after-image to previous HP percentage immediately
      setAfterImageDisplayPercent((prevHpProp / maxHp) * 100);
      // Schedule after-image to shrink to current HP percentage after a delay
      if (afterImageTimeoutRef.current) clearTimeout(afterImageTimeoutRef.current);
      afterImageTimeoutRef.current = window.setTimeout(() => {
        setAfterImageDisplayPercent(targetHpPercentage);
      }, 250); // Delay before red bar starts shrinking, adjust as needed
    } else {
      // HP Increased or no change: after-image matches current HP percentage
      setAfterImageDisplayPercent(targetHpPercentage);
    }
    return () => {
      if (afterImageTimeoutRef.current) clearTimeout(afterImageTimeoutRef.current);
    };
  }, [currentAnimatedHp, prevHpProp, maxHp, targetHpPercentage]);


  let mainHpBarFillColor = participantType === 'hero' ? '#0ea5e9' : '#ef4444'; 
  if (participantType === 'hero') {
    const blueHex = '#0ea5e9'; const greenHex = '#22c55e'; const redHex = '#ef4444';
    const hpRatioForColor = targetHpPercentage / 100; 
    if (hpRatioForColor < 0.2) mainHpBarFillColor = redHex;
    else if (hpRatioForColor < 0.4) mainHpBarFillColor = interpolateColor(redHex, greenHex, (hpRatioForColor - 0.2) / 0.2);
    else mainHpBarFillColor = interpolateColor(greenHex, blueHex, Math.min(1, (hpRatioForColor - 0.4) / 0.6));
  }
  
  const percentageMana = battleHero && maxMana > 0 ? (currentAnimatedMana / maxMana) * 100 : 0;
  const percentageXP = battleHero && animatedExpState.toNextLevel > 0 ? (animatedExpState.current / animatedExpState.toNextLevel) * 100 : 0;
  const percentageShield = maxShield && maxShield > 0 && currentAnimatedShield !== undefined ? (currentAnimatedShield / maxShield) * 100 : 0;

  const showShieldBar = maxShield !== undefined && maxShield > 0 && currentAnimatedShield !== undefined;
  
  const textOnBarStyle: React.CSSProperties = {
    fontSize: '9px', 
    textShadow: '0px 0px 2px rgba(0,0,0,0.8), 0.5px 0.5px 0.5px rgba(0,0,0,0.6)', 
    lineHeight: '1', 
    color: 'white',
    fontWeight: '500',
  };

  return (
    <>
      {showShieldBar && (
        <div 
            className="w-full bg-slate-700/80 rounded-full h-2.5 mb-0.5 relative flex items-center justify-center"
            role="progressbar" aria-label={`${participant.name} Energy Shield`}
            aria-valuenow={currentAnimatedShield || 0} aria-valuemin={0} aria-valuemax={maxShield || 0}
          >
             <div 
                className="absolute top-0 left-0 bg-cyan-400 h-full rounded-full health-bar-shield-fill"
                style={{ width: `${percentageShield}%` }}
            />
            <span className="relative" style={textOnBarStyle}>
              {formatNumber(currentAnimatedShield || 0)}/{formatNumber(maxShield || 0)} SP
            </span>
          </div>
      )}

      <div 
        className="w-full bg-slate-700/80 rounded-full h-2.5 mb-0.5 relative flex items-center justify-center"
        role="progressbar" aria-label={`${participant.name} HP`}
        aria-valuenow={currentAnimatedHp} aria-valuemin={0} aria-valuemax={maxHp}
      >
        {/* After-Image Bar (Damage Drain Effect) - Represents health before drop */}
        <div
          className="absolute top-0 left-0 h-full rounded-full bg-red-700/60" 
          style={{ width: `${afterImageDisplayPercent}%`, transition: 'width 0.4s ease-out 0.1s' }} // Slower transition for after-image
        />
        {/* Main Health Bar */}
        <div 
            className="absolute top-0 left-0 h-full rounded-full health-bar-main-fill" 
            style={{ width: `${targetHpPercentage}%`, backgroundColor: mainHpBarFillColor }}
        />
         <span className="relative" style={textOnBarStyle}>
            <span className={hpValueAnimationClass}>{formatNumber(currentAnimatedHp)}</span>/{formatNumber(maxHp)} HP
        </span>
      </div>

      {participantType === 'hero' && battleHero && (battleHero.calculatedStats.maxMana || 0) > 0 && (
        <div 
            className="w-full bg-slate-700/80 rounded-full h-2.5 mb-0.5 relative flex items-center justify-center"
            role="progressbar" aria-label={`${battleHero.name} Mana`}
            aria-valuenow={currentAnimatedMana} aria-valuemin={0} aria-valuemax={maxMana}
          >
             <div 
                className="absolute top-0 left-0 bg-blue-500 h-full rounded-full health-bar-mana-fill"
                style={{ width: `${percentageMana}%` }}
            />
            <span className="relative" style={textOnBarStyle}>
              {formatNumber(currentAnimatedMana)}/{formatNumber(maxMana)} MP
            </span>
          </div>
      )}

      {participantType === 'hero' && battleHero && (
        <div 
            className="w-full bg-slate-800/80 rounded-full h-2.5 mb-0.5 relative flex items-center justify-center"
            role="progressbar" aria-label={`${participant.name} XP`}
            aria-valuenow={animatedExpState.current} aria-valuemin={0} aria-valuemax={animatedExpState.toNextLevel}
        >
             <div 
                className="absolute top-0 left-0 bg-violet-500 h-full rounded-full health-bar-xp-fill"
                style={{ width: `${percentageXP}%` }}
            />
            <span className="relative" style={textOnBarStyle}>
              {formatNumber(animatedExpState.current)}/{formatNumber(animatedExpState.toNextLevel)} XP
            </span>
        </div>
      )}
    </>
  );
});

export default BattleStatBars;