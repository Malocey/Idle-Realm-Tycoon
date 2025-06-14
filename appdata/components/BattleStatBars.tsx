

import React from 'react';
import { BattleHero, BattleEnemy } from '../types';
import { formatNumber } from '../utils'; 
import { interpolateColor } from '../utils/uiHelpers'; 

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

const BattleStatBars: React.FC<BattleStatBarsProps> = ({
  participantType, currentAnimatedHp, maxHp, hpValueAnimationClass,
  battleHero, currentAnimatedMana, maxMana,
  animatedExpState, displayMode, formatNumber, participant,
  currentAnimatedShield, maxShield
}) => {

  const percentageHP = maxHp > 0 ? (currentAnimatedHp / maxHp) * 100 : 0;
  let barFillColor = participantType === 'hero' ? '#0ea5e9' : '#ef4444'; 

  if (participantType === 'hero') {
    const blueHex = '#0ea5e9'; const greenHex = '#22c55e'; const redHex = '#ef4444';
    if (percentageHP < 20) barFillColor = redHex;
    else if (percentageHP < 40) barFillColor = interpolateColor(redHex, greenHex, (percentageHP - 20) / 20);
    else barFillColor = interpolateColor(greenHex, blueHex, Math.min(1, (percentageHP - 40) / 60));
  }
  
  const percentageMana = battleHero && maxMana > 0 ? (currentAnimatedMana / maxMana) * 100 : 0;
  const percentageXP = battleHero && animatedExpState.toNextLevel > 0 ? (animatedExpState.current / animatedExpState.toNextLevel) * 100 : 0;
  const percentageShield = maxShield && maxShield > 0 && currentAnimatedShield !== undefined ? (currentAnimatedShield / maxShield) * 100 : 0;

  const showShieldBar = maxShield !== undefined && maxShield > 0 && currentAnimatedShield !== undefined;
  
  const textOnBarStyle: React.CSSProperties = {
    fontSize: '9px', 
    textShadow: '0px 0px 2px rgba(0,0,0,0.8), 0.5px 0.5px 0.5px rgba(0,0,0,0.6)', 
    lineHeight: '1', 
    color: 'white', // Ensure text is white by default
    fontWeight: '500', // Medium font weight
  };


  return (
    <>
      {showShieldBar && (
        <div 
            className="w-full bg-slate-700/80 rounded-full h-2.5 mb-0.5 relative flex items-center justify-center" // Reduced height and margin
            role="progressbar" aria-label={`${participant.name} Energy Shield`}
            aria-valuenow={currentAnimatedShield || 0} aria-valuemin={0} aria-valuemax={maxShield || 0}
          >
             <div 
                className="absolute top-0 left-0 bg-cyan-400 h-full rounded-full" 
                style={{ width: `${percentageShield}%` }}
            />
            <span className="relative" style={textOnBarStyle}>
              {formatNumber(currentAnimatedShield || 0)}/{formatNumber(maxShield || 0)} SP
            </span>
          </div>
      )}

      <div 
        className="w-full bg-slate-700/80 rounded-full h-2.5 mb-0.5 relative flex items-center justify-center" // Reduced height and margin
        role="progressbar" aria-label={`${participant.name} HP`}
        aria-valuenow={currentAnimatedHp} aria-valuemin={0} aria-valuemax={maxHp}
      >
        <div 
            className="absolute top-0 left-0 h-full rounded-full transition-all duration-200 ease-out" 
            style={{ width: `${percentageHP}%`, backgroundColor: barFillColor }}
        />
         <span className="relative" style={textOnBarStyle}>
            <span className={hpValueAnimationClass}>{formatNumber(currentAnimatedHp)}</span>/{formatNumber(maxHp)} HP
        </span>
      </div>

      {participantType === 'hero' && battleHero && (battleHero.calculatedStats.maxMana || 0) > 0 && (
        <div 
            className="w-full bg-slate-700/80 rounded-full h-2.5 mb-0.5 relative flex items-center justify-center" // Reduced height and margin
            role="progressbar" aria-label={`${battleHero.name} Mana`}
            aria-valuenow={currentAnimatedMana} aria-valuemin={0} aria-valuemax={maxMana}
          >
             <div 
                className="absolute top-0 left-0 bg-blue-500 h-full rounded-full transition-all duration-200 ease-out" 
                style={{ width: `${percentageMana}%` }}
            />
            <span className="relative" style={textOnBarStyle}>
              {formatNumber(currentAnimatedMana)}/{formatNumber(maxMana)} MP
            </span>
          </div>
      )}

      {participantType === 'hero' && battleHero && (
        <div 
            className="w-full bg-slate-800/80 rounded-full h-2.5 mb-0.5 relative flex items-center justify-center" // Reduced height and margin, darker bg
            role="progressbar" aria-label={`${participant.name} XP`}
            aria-valuenow={animatedExpState.current} aria-valuemin={0} aria-valuemax={animatedExpState.toNextLevel}
        >
             <div 
                className="absolute top-0 left-0 bg-violet-500 h-full rounded-full transition-all duration-200 ease-out" 
                style={{ width: `${percentageXP}%` }}
            />
            <span className="relative" style={textOnBarStyle}>
              {formatNumber(animatedExpState.current)}/{formatNumber(animatedExpState.toNextLevel)} XP
            </span>
        </div>
      )}
    </>
  );
};

export default BattleStatBars;
