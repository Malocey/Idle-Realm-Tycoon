
import React from 'react';
import Modal, { ModalProps } from './Modal';
import { HeroStats, AethericResonanceStatConfig } from '../types';
import { ICONS } from './Icons';
import { formatNumber } from '../utils';

interface InfusedBonusesInfoModalProps extends Omit<ModalProps, 'title' | 'children'> {
  aethericResonanceBonuses: Partial<Record<keyof HeroStats, { percentage: number; flat: number }>>;
  aethericResonanceStatConfigs: AethericResonanceStatConfig[];
}

// Hilfsfunktion zur Formatierung von HeroStats-Schlüsseln für die Anzeige
const formatStatKeyForDisplay = (statKey: keyof HeroStats): string => {
  const words = statKey.replace(/([A-Z])/g, ' $1');
  return words.charAt(0).toUpperCase() + words.slice(1);
};

const InfusedBonusesInfoModal: React.FC<InfusedBonusesInfoModalProps> = ({
  isOpen,
  onClose,
  aethericResonanceBonuses,
  aethericResonanceStatConfigs,
}) => {

  const activeBonuses = Object.entries(aethericResonanceBonuses)
    .map(([statId, bonuses]) => {
      const config = aethericResonanceStatConfigs.find(c => c.id === statId as keyof HeroStats);
      if (!config || (bonuses.flat === 0 && bonuses.percentage === 0)) {
        return null;
      }
      return {
        statId: statId as keyof HeroStats,
        label: config.label,
        iconName: config.iconName,
        flatBonus: bonuses.flat,
        percentageBonus: bonuses.percentage,
        isPercentageStatDisplay: config.isPercentage, // To guide overall display if the stat itself is often a %
      };
    })
    .filter(Boolean)
    .sort((a, b) => a!.label.localeCompare(b!.label));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Total Infused Aetheric Bonuses" size="md">
      <div className="space-y-3 max-h-[60vh] overflow-y-auto fancy-scrollbar pr-1">
        {activeBonuses.length === 0 ? (
          <p className="text-slate-400 text-center">No bonuses have been infused yet.</p>
        ) : (
          activeBonuses.map(bonus => {
            if (!bonus) return null;
            const StatIcon = ICONS[bonus.iconName || 'UPGRADE'];
            const affectedStatName = formatStatKeyForDisplay(bonus.statId);

            return (
              <div key={bonus.statId} className="p-3 bg-slate-700/50 rounded-md border border-slate-600">
                <div className="flex items-center mb-1">
                  {StatIcon && <StatIcon className="w-5 h-5 mr-2 text-sky-400" />}
                  <h4 className="text-md font-semibold text-sky-300">{bonus.label}</h4>
                </div>
                <ul className="list-disc list-inside pl-2 text-sm text-slate-300">
                  {bonus.flatBonus !== 0 && (
                    <li>Flat Bonus to {affectedStatName}: <span className="text-green-400">+{bonus.flatBonus.toFixed(5)}</span></li>
                  )}
                  {bonus.percentageBonus !== 0 && (
                    <li>Percentage Bonus to {affectedStatName}: <span className="text-green-400">+{ (bonus.percentageBonus * 100).toFixed(4)}%</span></li>
                  )}
                </ul>
              </div>
            );
          })
        )}
      </div>
    </Modal>
  );
};

export default InfusedBonusesInfoModal;
