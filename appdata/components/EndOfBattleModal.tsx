
import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { ICONS } from './Icons';
import { formatNumber } from '../utils';
import { ResourceType } from '../types'; // For potential future use with icon mapping
import type { BattleSummary, BattleSummaryHeroPerformance, BattleSummaryResource, BattleSummaryShard, BattleSummaryBuildingLevelUp } from '../types';

// Placeholder data for UI development
const dummyVictorySummary: BattleSummary = {
  result: 'VICTORY',
  xpGained: 1250,
  heroes: [
    { id: 'warrior_1', name: 'Valerius', xpGained: 300, didLevelUp: true, oldLevel: 5, newLevel: 6, totalDamageDealt: 1250, totalHealingDone: 0 },
    { id: 'archer_1', name: 'Lyra', xpGained: 250, didLevelUp: false, totalDamageDealt: 980, totalHealingDone: 0 },
    { id: 'cleric_1', name: 'Seraphina', xpGained: 150, didLevelUp: true, oldLevel: 4, newLevel: 5, totalDamageDealt: 50, totalHealingDone: 850 },
  ],
  resourcesGained: [
    { type: 'Gold', amount: 523, iconName: 'GOLD' },
    { type: 'Wood', amount: 120, iconName: 'WOOD' },
    { type: 'Iron', amount: 35, iconName: 'IRON' },
  ],
  shardsGained: [
    { id: 'shard_atk_1', name: 'Attack Shard Lv.1', iconName: 'SHARD_ATTACK_ICON' },
    { id: 'shard_hp_2', name: 'Health Shard Lv.2', iconName: 'SHARD_HEALTH_ICON' },
  ],
  buildingLevelUps: [
    { buildingId: 'LUMBER_MILL', buildingName: 'Lumber Mill', newLevel: 3, iconName: 'WOOD' },
  ],
};

const dummyDefeatSummary: BattleSummary = {
  result: 'DEFEAT',
  xpGained: 50,
  heroes: [
    { id: 'warrior_1', name: 'Valerius', xpGained: 30, didLevelUp: false, totalDamageDealt: 150, totalHealingDone: 0 },
    { id: 'archer_1', name: 'Lyra', xpGained: 20, didLevelUp: false, totalDamageDealt: 80, totalHealingDone: 0 },
  ],
  resourcesGained: [
    { type: 'Gold', amount: 15, iconName: 'GOLD' },
  ],
  shardsGained: [],
  buildingLevelUps: [],
};


interface EndOfBattleModalProps {
  isOpen: boolean;
  summary: BattleSummary | null;
  onClose: () => void; // For the Modal wrapper's own close (X button, overlay click)
  onRetry: () => void;
  onReturnToTown: () => void;
}

const EndOfBattleModal: React.FC<EndOfBattleModalProps> = ({ isOpen, summary, onClose, onRetry, onReturnToTown }) => {
  if (!isOpen || !summary) return null;
  
  const currentSummary = summary; 

  const titleColor = currentSummary.result === 'VICTORY' ? 'text-yellow-400' : 'text-slate-400';
  const titleText = currentSummary.result === 'VICTORY' ? 'VICTORY!' : 'DEFEAT';
  const performanceHeaderColor = currentSummary.result === 'VICTORY' ? 'text-amber-300' : 'text-sky-300';
  const rewardsHeaderColor = currentSummary.result === 'VICTORY' ? 'text-green-300' : 'text-sky-300';


  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="xl"> {/* Modal title is now rendered inside */}
      <div className="flex flex-col p-2">
        <h1 className={`text-4xl sm:text-5xl font-bold text-center mb-4 sm:mb-6 ${titleColor}`}>{titleText}</h1>
        
        <div className="mb-4 text-center">
            <p className="text-md sm:text-lg text-slate-300">Overall XP Gained: <span className="font-semibold text-sky-400">{formatNumber(currentSummary.xpGained)}</span></p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 sm:gap-6 mb-6">
          {/* Character Stats Column */}
          <div className="flex-1 bg-slate-800/60 p-3 sm:p-4 rounded-lg border border-slate-700/80 shadow-md">
            <h2 className={`text-lg sm:text-xl font-semibold ${performanceHeaderColor} mb-3 text-center md:text-left`}>Performance</h2>
            <div className="space-y-3 max-h-[250px] sm:max-h-[300px] overflow-y-auto fancy-scrollbar pr-2">
              {currentSummary.heroes.map(hero => (
                <div key={hero.id} className="p-2.5 bg-slate-700/80 rounded-md border border-slate-600/70">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="text-md sm:text-lg font-medium text-sky-300">{hero.name}</h3>
                    {hero.didLevelUp && (
                      <span className="px-2 py-0.5 sm:px-3 sm:py-1 bg-green-500 text-white text-[0.6rem] sm:text-xs font-bold rounded-full animate-pulse">
                        LEVEL UP! {hero.oldLevel} ➔ {hero.newLevel}
                      </span>
                    )}
                  </div>
                  <div className="text-xs sm:text-sm text-slate-400 space-y-0.5">
                    <p>Damage Dealt: <span className="font-semibold text-slate-200">{formatNumber(hero.totalDamageDealt)}</span></p>
                    <p>Healing Done: <span className="font-semibold text-slate-200">{formatNumber(hero.totalHealingDone)}</span></p>
                    <p>XP Gained: <span className="font-semibold text-sky-400">+{formatNumber(hero.xpGained)}</span></p>
                  </div>
                </div>
              ))}
              {currentSummary.heroes.length === 0 && (
                <p className="text-slate-400 italic">No hero performance data.</p>
              )}
            </div>
          </div>

          {/* Loot & Rewards Column */}
          <div className="flex-1 bg-slate-800/60 p-3 sm:p-4 rounded-lg border border-slate-700/80 shadow-md">
            <h2 className={`text-lg sm:text-xl font-semibold ${rewardsHeaderColor} mb-3 text-center md:text-left`}>Rewards</h2>
            <div className="space-y-3 max-h-[250px] sm:max-h-[300px] overflow-y-auto fancy-scrollbar pr-2">
              {currentSummary.resourcesGained.length > 0 && (
                <div>
                  <h3 className="text-sm sm:text-md font-medium text-slate-300 mb-1.5">Resources:</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {currentSummary.resourcesGained.map((res, index) => {
                      const Icon = res.iconName ? ICONS[res.iconName] : ICONS.GOLD;
                      return (
                        <div key={`${res.type}-${index}`} className="flex items-center bg-slate-700/70 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md text-xs sm:text-sm">
                          {Icon && <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 text-yellow-400" />}
                          <span className="text-slate-200 font-medium">{formatNumber(res.amount)}</span>
                          <span className="text-slate-400 ml-1">{res.type}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {currentSummary.shardsGained.length > 0 && (
                <div>
                  <h3 className="text-sm sm:text-md font-medium text-slate-300 mb-1.5">Shards:</h3>
                  <p className="text-[0.65rem] sm:text-xs text-slate-500 mb-1">(Equip shards via Hero Academy - Altar of Ascension)</p>
                  <div className="flex flex-wrap gap-1.5">
                  {currentSummary.shardsGained.map((shard, index) => {
                      const Icon = shard.iconName ? ICONS[shard.iconName] : ICONS.SHARD_ICON;
                      return (
                        <div key={shard.id + index} className="flex items-center bg-slate-700/70 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md text-xs sm:text-sm">
                         {Icon && <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 text-sky-400" />}
                          <span className="text-slate-200">{shard.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {currentSummary.buildingLevelUps.length > 0 && (
                <div>
                  <h3 className="text-sm sm:text-md font-medium text-slate-300 mb-1.5">Building Level Ups:</h3>
                  <div className="space-y-1">
                    {currentSummary.buildingLevelUps.map((bldg, index) => {
                       const Icon = bldg.iconName ? ICONS[bldg.iconName] : ICONS.BUILDING;
                       return (
                        <div key={bldg.buildingId + index} className="flex items-center bg-slate-700/70 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md text-xs sm:text-sm">
                           {Icon && <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 text-green-400" />}
                          <span className="text-slate-200">{bldg.buildingName || bldg.buildingId} leveled up to Lvl {bldg.newLevel}!</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {currentSummary.resourcesGained.length === 0 && currentSummary.shardsGained.length === 0 && currentSummary.buildingLevelUps.length === 0 && (
                  <p className="text-slate-400 italic">No specific rewards this time.</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-center space-x-3 sm:space-x-4 mt-4 pt-4 border-t border-slate-700">
          <Button onClick={onRetry} variant="secondary" size="md" className="px-3 py-1.5 sm:px-4 sm:py-2">
            Retry Challenge
          </Button>
          <Button onClick={onReturnToTown} variant="primary" size="md" className="px-3 py-1.5 sm:px-4 sm:py-2">
            Return to Town
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default EndOfBattleModal;
