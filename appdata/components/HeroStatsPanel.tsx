
import React, { useState } from 'react';
import { useGameContext } from '../context';
import { PlayerHeroState, HeroDefinition, HeroStats } from '../types';
import { formatNumber } from '../utils';
import { ICONS } from './Icons';
import { useStatBreakdown } from '../hooks/useStatBreakdown'; 
import StatBreakdownDisplay from './StatBreakdownDisplay'; 
import { GAME_TICK_MS } from '../constants'; 

interface HeroStatsPanelProps {
  heroState: PlayerHeroState;
  heroDef: HeroDefinition;
}

const HeroStatsPanel: React.FC<HeroStatsPanelProps> = ({ heroState, heroDef }) => {
  const { getCalculatedHeroStats } = useGameContext();
  const [expandedStatKey, setExpandedStatKey] = useState<keyof HeroStats | null>(null);

  const finalStats = getCalculatedHeroStats(heroState);

  const toggleExpand = (statKey: keyof HeroStats) => {
    setExpandedStatKey(prev => (prev === statKey ? null : statKey));
  };

  const breakdownItems = useStatBreakdown(expandedStatKey ? heroState : null, expandedStatKey);

  return (
    <div className="p-4 space-y-3 bg-slate-800 rounded-lg h-full">
      <div>
        <h3 className="text-xl font-bold text-sky-300 mb-2">Character Stats</h3>
        <div className="space-y-1 text-sm">
          {(Object.keys(finalStats) as Array<keyof HeroStats>).map((key) => {
            const value = finalStats[key];
            if (value === undefined) return null;
            if (key === 'healPower' && value === 0) return null;
            if (key === 'manaRegen' && (!finalStats.maxMana || finalStats.maxMana === 0)) return null;
            if ((key === 'energyShieldRechargeRate' || key === 'energyShieldRechargeDelay') && (!finalStats.maxEnergyShield || finalStats.maxEnergyShield === 0)) {
                return null;
            }
            if (key === 'maxEnergyShield' && (!value || value === 0)) {
                return null;
            }


            const isExpanded = expandedStatKey === key;

            return (
              <div key={key} className="py-1.5 border-b border-slate-700/50">
                <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleExpand(key)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleExpand(key);}} aria-expanded={isExpanded}>
                  <span className="text-slate-300 flex items-center">
                     <span className={`mr-2 transform transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}>
                        {ICONS.ARROW_UP ? <ICONS.ARROW_UP className="w-3 h-3 rotate-[270deg]" /> : '>'}
                     </span>
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
                  </span>
                  <span className="text-slate-100 font-semibold">
                    {typeof value === 'number' ?
                      (key === 'attackSpeed' ? value.toFixed(2) :
                       key === 'critChance' ? `${(value * 100).toFixed(2)}%` :
                       key === 'critDamage' ? `${(value * 100).toFixed(1)}%` :
                       key === 'manaRegen' ? `${value.toFixed(1)}/s` :
                       key === 'energyShieldRechargeRate' ? `${(value * (1000 / GAME_TICK_MS)).toFixed(1)}/s` : 
                       key === 'energyShieldRechargeDelay' ? `${(value * GAME_TICK_MS / 1000).toFixed(1)}s` : 
                       formatNumber(value))
                      : value}
                  </span>
                </div>
                {isExpanded && breakdownItems && (
                  <StatBreakdownDisplay breakdownItems={breakdownItems} finalStatValue={finalStats[key]} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HeroStatsPanel;
