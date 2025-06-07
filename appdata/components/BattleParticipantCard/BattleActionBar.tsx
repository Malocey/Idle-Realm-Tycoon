
import React from 'react';

interface BattleActionBarProps {
  actionBarProgress: number;
  actionBarReadyClass: string;
  participantName: string;
  initialAttackCooldown: number;
  attackCooldown: number;
}

const BattleActionBar: React.FC<BattleActionBarProps> = ({ actionBarProgress, actionBarReadyClass, participantName, initialAttackCooldown, attackCooldown }) => {
  return (
    <div 
      className="w-full bg-slate-600 rounded-full h-1.5 mb-1" 
      role="progressbar" 
      aria-label={`${participantName} Action Progress`} 
      aria-valuenow={initialAttackCooldown > 0 ? initialAttackCooldown - attackCooldown : 0} 
      aria-valuemin={0} 
      aria-valuemax={initialAttackCooldown > 0 ? initialAttackCooldown : 0}
    >
      <div
        className={`bg-cyan-400 h-1.5 rounded-full transition-all duration-100 ease-linear ${actionBarReadyClass}`}
        style={{ width: `${actionBarProgress}%` }}
      ></div>
    </div>
  );
};

export default BattleActionBar;
