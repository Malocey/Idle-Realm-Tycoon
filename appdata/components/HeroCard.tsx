
import React, { useState, useEffect, useRef } from 'react';
import { useGameContext } from '../context';
import { PlayerHeroState, HeroStats } from '../types';
import { ICONS } from './Icons';
import { formatNumber } from '../utils';

interface HeroCardProps {
  heroState: PlayerHeroState;
}

type StatDisplayConfig = {
  label: string;
  formatter: (value: number) => string;
  condition?: (stats: HeroStats) => boolean;
};

const STAT_DISPLAY_ORDER: Array<keyof HeroStats> = [
  'maxHp', 'damage', 'defense', 'attackSpeed', 'critChance', 'critDamage', 
  'maxMana', 'manaRegen', 'healPower', 'hpRegen', 
  'maxEnergyShield', 'energyShieldRechargeRate', 'energyShieldRechargeDelay'
];

const STAT_CONFIG: Partial<Record<keyof HeroStats, StatDisplayConfig>> = {
  maxHp: { label: 'Max HP', formatter: (val) => formatNumber(val) },
  damage: { label: 'Damage', formatter: (val) => formatNumber(val) },
  defense: { label: 'Defense', formatter: (val) => formatNumber(val) },
  attackSpeed: { label: 'Attack Speed', formatter: (val) => val.toFixed(2) },
  critChance: { label: 'Crit Chance', formatter: (val) => `${(val * 100).toFixed(2)}%` },
  critDamage: { label: 'Crit Damage', formatter: (val) => `${(val * 100).toFixed(1)}%` },
  maxMana: { label: 'Max Mana', formatter: (val) => formatNumber(val), condition: (stats) => (stats.maxMana || 0) > 0 },
  manaRegen: { label: 'Mana Regen', formatter: (val) => `${val.toFixed(1)}/s`, condition: (stats) => (stats.maxMana || 0) > 0 },
  healPower: { label: 'Heal Power', formatter: (val) => formatNumber(val), condition: (stats) => (stats.healPower || 0) > 0 },
  hpRegen: { label: 'HP Regen', formatter: (val) => `${formatNumber(val)}/s`, condition: (stats) => (stats.hpRegen || 0) > 0 },
  maxEnergyShield: { label: 'Max Shield', formatter: (val) => formatNumber(val), condition: (stats) => (stats.maxEnergyShield || 0) > 0 },
  energyShieldRechargeRate: { label: 'Shield Regen', formatter: (val) => `${val.toFixed(1)}/s`, condition: (stats) => (stats.maxEnergyShield || 0) > 0 },
  energyShieldRechargeDelay: { label: 'Shield Delay', formatter: (val) => `${(val * 0.02).toFixed(1)}s`, condition: (stats) => (stats.maxEnergyShield || 0) > 0 }, // Assuming 20ms ticks
};


const HeroCard: React.FC<HeroCardProps> = ({ heroState }) => {
  const { staticData, getCalculatedHeroStats } = useGameContext();
  const [isLevelingUp, setIsLevelingUp] = useState(false);
  const prevLevelRef = useRef(heroState.level);

  const heroDef = staticData.heroDefinitions[heroState.definitionId];
  if (!heroDef) return null;
  
  const stats = getCalculatedHeroStats(heroState);
  const Icon = ICONS[heroDef.iconName];

  const expPercentage = heroState.level > 0 && heroState.expToNextLevel > 0 
    ? Math.min(100, (heroState.currentExp / heroState.expToNextLevel) * 100) 
    : 0;

  useEffect(() => {
    if (heroState.level > prevLevelRef.current) {
      setIsLevelingUp(true);
      const timer = setTimeout(() => setIsLevelingUp(false), 500); // Duration of the flash animation
      prevLevelRef.current = heroState.level;
      return () => clearTimeout(timer);
    }
    if (heroState.level < prevLevelRef.current) {
        prevLevelRef.current = heroState.level;
    }
  }, [heroState.level]);

  const cardClasses = [
    "bg-slate-800 p-4 rounded-lg shadow-md glass-effect transition-all duration-200 ease-in-out hover:shadow-xl hover:-translate-y-1 hover:scale-[1.01]",
    isLevelingUp ? "animate-level-up-flash" : "",
    heroState.skillPoints > 0 ? "animate-skill-points-glow" : ""
  ].filter(Boolean).join(" ");

  return (
    <div className={cardClasses}>
      <div className="flex items-center mb-2">
        {Icon && <Icon className="w-8 h-8 mr-3 text-violet-400" />}
        <h3 className="text-xl font-semibold text-violet-300">{heroDef.name} <span className="text-sm text-slate-400">Lvl {heroState.level}</span></h3>
      </div>
      <p className="text-xs text-slate-400">Skill Points: {heroState.skillPoints}</p>
      <div className="my-2">
        <div className="w-full bg-slate-700 rounded-full h-2.5">
            <div 
              className="bg-violet-500 h-2.5 rounded-full transition-all duration-200 ease-out" 
              style={{ width: `${expPercentage}%` }}
              role="progressbar"
              aria-label={`${heroDef.name} Experience Progress`}
              aria-valuenow={heroState.currentExp}
              aria-valuemin={0}
              aria-valuemax={heroState.expToNextLevel}
            ></div>
        </div>
        <p className="text-xs text-slate-500 text-center mt-1">{formatNumber(heroState.currentExp)} / {formatNumber(heroState.expToNextLevel)} EXP</p>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm mb-3">
        {STAT_DISPLAY_ORDER.map((key) => {
          const statConfig = STAT_CONFIG[key];
          const value = stats[key];

          if (value === undefined || !statConfig || (statConfig.condition && !statConfig.condition(stats))) {
            return null;
          }
          // Ensure value is treated as number for formatting, provide default for 0 if that's intended
          const numericValue = typeof value === 'number' ? value : parseFloat(value as string) || 0;
          
          return (
            <div key={key} className="flex justify-between">
              <span className="text-slate-400">{statConfig.label}:</span>
              <span className="text-slate-200 font-medium">
                {statConfig.formatter(numericValue)}
              </span>
            </div>
          );
        })}
      </div>

      {heroState.permanentBuffs && heroState.permanentBuffs.length > 0 && (
        <div className="my-2 pt-2 border-t border-slate-700">
            <h4 className="text-xs text-slate-500 uppercase font-semibold mb-1">Permanent Buffs:</h4>
            {heroState.permanentBuffs.map((buff, index) => (
                <p key={index} className="text-xs text-green-400">
                    +{ buff.stat === 'critChance' ? (buff.value * 100).toFixed(2) : 
                       buff.stat === 'critDamage' ? (buff.value * 100).toFixed(1) :
                       buff.value.toFixed(buff.stat === 'attackSpeed' || buff.stat === 'manaRegen' ? 2 : 0)
                     }
                    {buff.stat === 'critChance' || buff.stat === 'critDamage' ? '%' : ''}
                    {buff.stat === 'manaRegen' ? '/s' : ''}
                    {' '}{buff.stat.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </p>
            ))}
        </div>
      )}
    </div>
  );
};

export default HeroCard;
