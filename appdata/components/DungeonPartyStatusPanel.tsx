
import React from 'react';
import { useGameContext } from '../context';
import { PlayerHeroState, DungeonRunState } from '../types';
import { ICONS } from './Icons';
import { formatNumber } from '../utils';
import Button from './Button'; // Added Button import

interface DungeonPartyStatusPanelProps {
  onToggleBuffInfoModal?: () => void; // New prop
}

const DungeonPartyStatusPanel: React.FC<DungeonPartyStatusPanelProps> = ({ onToggleBuffInfoModal }) => {
  const { gameState, staticData, getCalculatedHeroStats } = useGameContext();
  const { activeDungeonRun, heroes: playerHeroes } = gameState;

  if (!activeDungeonRun) {
    return null;
  }

  const survivingHeroDetails = activeDungeonRun.survivingHeroIds
    .map(heroId => {
      const playerHero = playerHeroes.find(h => h.definitionId === heroId);
      const runHeroState = activeDungeonRun.heroStatesAtFloorStart[heroId];
      const heroDef = staticData.heroDefinitions[heroId];

      if (!playerHero || !runHeroState || !heroDef) return null;
      
      const maxHp = runHeroState.maxHp;
      const maxMana = runHeroState.maxMana;
      
      return {
        ...playerHero,
        ...runHeroState,
        heroDef,
        maxHp, 
        maxMana
      };
    })
    .filter(Boolean);

  if (survivingHeroDetails.length === 0) {
    return <p className="text-center text-slate-400 my-2">No heroes currently in the dungeon party.</p>;
  }

  return (
    <div className="w-full max-w-3xl p-2 bg-slate-800/70 glass-effect rounded-lg shadow-md">
      <h4 className="text-sm font-semibold text-amber-300 mb-1.5 text-center">Party Status</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {survivingHeroDetails.map(hero => {
          if (!hero) return null;
          const HeroIcon = ICONS[hero.heroDef.iconName];
          const hpPercentage = hero.maxHp > 0 ? (hero.currentHp / hero.maxHp) * 100 : 0;
          const manaPercentage = hero.maxMana > 0 ? (hero.currentMana / hero.maxMana) * 100 : 0;
          const xpPercentage = hero.expToNextLevel > 0 ? (hero.currentExp / hero.expToNextLevel) * 100 : 0;

          return (
            <div key={hero.definitionId} className="p-2 bg-slate-700/50 rounded border border-slate-600">
              <div className="flex items-center mb-1">
                {HeroIcon && <HeroIcon className="w-5 h-5 mr-1.5 text-sky-400 flex-shrink-0" />}
                <span className="text-xs font-medium text-sky-300 truncate" title={hero.heroDef.name}>{hero.heroDef.name} (Lvl {hero.level})</span>
              </div>
              
              <div className="text-xs text-slate-400 mb-0.5">HP: {formatNumber(hero.currentHp)}/{formatNumber(hero.maxHp)}</div>
              <div className="w-full bg-slate-600 rounded-full h-1.5 mb-1">
                <div className="bg-red-500 h-1.5 rounded-full" style={{ width: `${hpPercentage}%` }}></div>
              </div>

              {hero.maxMana > 0 && (
                <>
                  <div className="text-xs text-slate-400 mb-0.5">MP: {formatNumber(hero.currentMana)}/{formatNumber(hero.maxMana)}</div>
                  <div className="w-full bg-slate-600 rounded-full h-1.5 mb-1">
                    <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${manaPercentage}%` }}></div>
                  </div>
                </>
              )}
              
               <div className="text-xs text-slate-400 mb-0.5">XP: {formatNumber(hero.currentExp)}/{formatNumber(hero.expToNextLevel)}</div>
              <div className="w-full bg-slate-600 rounded-full h-1.5">
                <div className="bg-violet-500 h-1.5 rounded-full" style={{ width: `${xpPercentage}%` }}></div>
              </div>
            </div>
          );
        })}
      </div>
      {/* Active Run Buffs Display */}
      {activeDungeonRun.activeRunBuffs.length > 0 && (
        <div className="mt-2 pt-1.5 border-t border-slate-700">
            <h5 className="text-xs text-center font-semibold text-green-300 mb-1">Active Run Buffs:</h5>
            <div className="flex flex-wrap justify-center gap-1.5">
                {activeDungeonRun.activeRunBuffs.map(activeBuff => {
                    const buffDef = staticData.runBuffDefinitions[activeBuff.definitionId];
                    if (!buffDef) return null;
                    const BuffIcon = ICONS[buffDef.iconName] || ICONS.UPGRADE;
                    return (
                        <div key={activeBuff.definitionId + activeBuff.stacks} className="p-1 bg-slate-600 rounded-md flex items-center text-xs" title={`${buffDef.name} (x${activeBuff.stacks}): ${buffDef.description}`}>
                           {BuffIcon && <BuffIcon className="w-3.5 h-3.5 mr-1 text-green-400"/>}
                           {activeBuff.stacks > 1 && <span className="text-green-200 mr-0.5">x{activeBuff.stacks}</span>}
                        </div>
                    );
                })}
            </div>
            {onToggleBuffInfoModal && (
              <Button
                onClick={onToggleBuffInfoModal}
                variant="ghost"
                size="sm"
                className="w-full mt-2 text-xs"
              >
                View Buff Details
              </Button>
            )}
        </div>
      )}
    </div>
  );
};

export default DungeonPartyStatusPanel;
