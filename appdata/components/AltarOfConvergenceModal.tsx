
import React, { useState, useEffect, useMemo } from 'react';
import { useGameContext } from '../context';
import Modal, { ModalProps } from './Modal';
import Button from './Button';
import { ICONS } from './Icons';
import { AETHERIC_RESONANCE_STAT_CONFIGS } from '../gameData';
import { formatNumber } from '../utils';
import { HeroStats, ResonanceMoteType, LastAppliedResonanceMoteInfo, AethericResonanceStatConfig } from '../types';
import InfusedBonusesInfoModal from './InfusedBonusesInfoModal'; // Neu importiert

interface AltarOfConvergenceModalProps extends Omit<ModalProps, 'title' | 'children'> {}

const AltarOfConvergenceModal: React.FC<AltarOfConvergenceModalProps> = ({ isOpen, onClose }) => {
  const { gameState, dispatch, staticData } = useGameContext(); // staticData hinzugefügt
  const { resonanceMotes, aethericResonanceBonuses, lastAppliedResonanceMote } = gameState;

  const [pulsingStatId, setPulsingStatId] = useState<keyof HeroStats | null>(null);
  const [lastAppliedMoteInfoForDisplay, setLastAppliedMoteInfoForDisplay] = useState<LastAppliedResonanceMoteInfo | null>(null);
  const [isBonusInfoModalOpen, setIsBonusInfoModalOpen] = useState(false); // Neuer Zustand für das Info-Modal

  useEffect(() => {
    if (lastAppliedResonanceMote && isOpen) { 
      setPulsingStatId(lastAppliedResonanceMote.statId);
      setLastAppliedMoteInfoForDisplay(lastAppliedResonanceMote);
      const timer = setTimeout(() => {
        setPulsingStatId(null);
      }, 1200); 
      return () => clearTimeout(timer);
    }
  }, [lastAppliedResonanceMote, isOpen]);


  const handleInfuse = (statId: keyof HeroStats, moteType: ResonanceMoteType) => {
    dispatch({ type: 'INFUSE_STAT_SPECIFIC_MOTE', payload: { statId, moteType } });
  };

  const getBonusDisplay = (statId: keyof HeroStats): string => {
    const bonuses = aethericResonanceBonuses[statId];
    if (!bonuses) return "+0";
    const config = AETHERIC_RESONANCE_STAT_CONFIGS.find(c => c.id === statId);
    if (!config) return "+0";

    if (config.isPercentage) {
      return `+${(bonuses.percentage * 100).toFixed(4)}%`;
    } else {
      return `+${bonuses.flat.toFixed(5)}`;
    }
  };

  const getIncrementDisplay = (statId: keyof HeroStats, moteType: ResonanceMoteType): string => {
    const config = AETHERIC_RESONANCE_STAT_CONFIGS.find(c => c.id === statId);
    if (!config) return "+0";
    let increment = config.baseBonusPerFaintMote;
    if (moteType === 'clear') increment *= 2;
    else if (moteType === 'potent') increment *= 10;

    return `+${config.isPercentage ? (increment * 100).toFixed(4) + '%' : increment.toFixed(5)}`;
  };

  const moteIcons: Record<ResonanceMoteType, keyof typeof ICONS | undefined> = {
    faint: 'RESONANCE_MOTE_FAINT',
    clear: 'RESONANCE_MOTE_CLEAR',
    potent: 'RESONANCE_MOTE_POTENT',
  };
  const moteDisplayNames: Record<ResonanceMoteType, 'Resonance Shard' | 'Clear Core' | 'Potent Focus'> = {
    faint: 'Resonance Shard',
    clear: 'Clear Core',
    potent: 'Potent Focus',
  };

  const filteredAndSortedStats = useMemo(() => {
    return AETHERIC_RESONANCE_STAT_CONFIGS
      .map(statConfig => {
        const motesForStat = resonanceMotes[statConfig.id];
        const totalMotes = (motesForStat?.faint || 0) + (motesForStat?.clear || 0) + (motesForStat?.potent || 0);
        return { ...statConfig, totalMotes };
      })
      .filter(statConfig => statConfig.totalMotes > 0) 
      .sort((a, b) => {
        if (b.totalMotes !== a.totalMotes) {
          return b.totalMotes - a.totalMotes; 
        }
        return a.label.localeCompare(b.label); 
      });
  }, [resonanceMotes]);


  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Altar of Convergence" size="xl">
        <div className="space-y-4">
          <div className="flex justify-end mb-2">
            <Button
              onClick={() => setIsBonusInfoModalOpen(true)}
              variant="secondary"
              size="sm"
              icon={ICONS.INFO && <ICONS.INFO className="w-4 h-4"/>}
            >
              View Infused Bonuses
            </Button>
          </div>

          {lastAppliedMoteInfoForDisplay && (
            <div className="p-2 mb-3 text-center bg-yellow-600/30 border border-yellow-500/50 rounded-md text-sm animate-fadeIn">
              <span className="text-yellow-200">Last Infusion: </span>
              <span className="font-semibold text-yellow-300">{lastAppliedMoteInfoForDisplay.qualityName}</span>
              <span className="text-yellow-200"> for </span>
              <span className="font-semibold text-yellow-300">
                {AETHERIC_RESONANCE_STAT_CONFIGS.find(s => s.id === lastAppliedMoteInfoForDisplay.statId)?.label || lastAppliedMoteInfoForDisplay.statId}
              </span>
              <span className="text-yellow-200"> (+{lastAppliedMoteInfoForDisplay.isPercentage ? (lastAppliedMoteInfoForDisplay.bonusValue * 100).toFixed(4) + '%' : lastAppliedMoteInfoForDisplay.bonusValue.toFixed(5)})</span>
            </div>
          )}
          
          <div className="max-h-[65vh] overflow-y-auto fancy-scrollbar pr-2 space-y-3">
            {filteredAndSortedStats.length === 0 && (
              <p className="text-slate-400 italic text-center py-6">No Resonance Motes collected to empower stats. Defeat enemies to find them!</p>
            )}
            {filteredAndSortedStats.map(statConfig => {
              const StatIcon = ICONS[statConfig.iconName || 'UPGRADE'];
              const isPulsing = pulsingStatId === statConfig.id;
              const motesForThisStat = resonanceMotes[statConfig.id] || { faint: 0, clear: 0, potent: 0 };

              return (
                <div
                  key={statConfig.id}
                  className={`p-3 bg-slate-700/70 rounded-lg border border-slate-600 transition-all duration-300 ${isPulsing ? 'stat-upgrade-pulse' : ''}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      {StatIcon && <StatIcon className="w-6 h-6 mr-2 text-sky-300" />}
                      <span className="text-lg font-medium text-sky-200">{statConfig.label}</span>
                    </div>
                    <span className={`text-md font-semibold ${isPulsing ? 'text-yellow-300' : 'text-green-400'}`}>
                      Bonus: {getBonusDisplay(statConfig.id)}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-1">
                    {(['faint', 'clear', 'potent'] as ResonanceMoteType[]).map(moteType => {
                      const MoteIcon = ICONS[moteIcons[moteType]!];
                      const count = motesForThisStat[moteType] || 0;
                      return (
                      <Button
                        key={moteType}
                        onClick={() => handleInfuse(statConfig.id, moteType)}
                        disabled={count === 0}
                        variant="secondary"
                        size="sm"
                        className="w-full justify-start text-left py-1.5 px-2.5 !space-x-1.5"
                        title={`Infuse ${moteDisplayNames[moteType]}: ${getIncrementDisplay(statConfig.id, moteType)}`}
                      >
                        {MoteIcon && <MoteIcon className="w-4 h-4 text-sky-400 flex-shrink-0"/>}
                        <div className="flex flex-col items-start text-xs">
                          <span className="text-slate-100">{moteDisplayNames[moteType]} ({count})</span>
                          <span className="text-sky-300 text-[0.65rem]">{getIncrementDisplay(statConfig.id, moteType)}</span>
                        </div>
                      </Button>
                    )})}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Modal>
      {isBonusInfoModalOpen && (
        <InfusedBonusesInfoModal
          isOpen={isBonusInfoModalOpen}
          onClose={() => setIsBonusInfoModalOpen(false)}
          aethericResonanceBonuses={aethericResonanceBonuses}
          aethericResonanceStatConfigs={AETHERIC_RESONANCE_STAT_CONFIGS}
        />
      )}
    </>
  );
};

export default AltarOfConvergenceModal;
