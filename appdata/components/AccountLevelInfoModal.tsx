
import React from 'react';
import Modal, { ModalProps } from './Modal';
import { useGameContext } from '../context';
import { formatNumber } from '../utils';
import { ICONS } from './Icons';
import { GlobalBonuses } from '../types';

interface AccountLevelInfoModalProps extends Omit<ModalProps, 'title' | 'children'> {}

const AccountLevelInfoModal: React.FC<AccountLevelInfoModalProps> = ({ isOpen, onClose }) => {
  const { gameState, staticData, getGlobalBonuses } = useGameContext();
  const { accountLevel, accountXP, expToNextAccountLevel, accountXpHistory } = gameState;
  const { accountLevelDefinitions } = staticData;

  const currentGlobalBonuses = getGlobalBonuses(); // Get all global bonuses

  const calculateBonusesAtLevel = (level: number): Partial<GlobalBonuses> => {
    const bonuses: Partial<GlobalBonuses> = {};
    if (!accountLevelDefinitions) return bonuses;

    for (let i = 0; i < level; i++) {
      const levelDef = accountLevelDefinitions.find(def => def.level === i + 1);
      if (levelDef) {
        levelDef.effects.forEach(effect => {
          if (bonuses.hasOwnProperty(effect.targetStat)) {
            (bonuses[effect.targetStat] as number) += effect.value;
          } else {
            (bonuses[effect.targetStat] as number) = effect.value;
          }
        });
      }
    }
    return bonuses;
  };

  const currentAccountLevelBonuses = calculateBonusesAtLevel(accountLevel);
  const nextAccountLevelBonusesDef = accountLevelDefinitions.find(def => def.level === accountLevel + 1);

  const formatBonusValue = (value: number, stat: keyof GlobalBonuses): string => {
    // Assume most are percentages for display simplicity here, adjust if needed
    return `${(value * 100).toFixed(1)}%`;
  };

  const getStatDisplayName = (stat: keyof GlobalBonuses): string => {
    return stat.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  };

  const xpPercentage = expToNextAccountLevel > 0 ? (accountXP / expToNextAccountLevel) * 100 : 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Account Progress & Boni" size="lg">
      <div className="space-y-4">
        {/* Current Level & Progress */}
        <div className="p-3 bg-slate-700/50 rounded-lg border border-slate-600">
          <h3 className="text-lg font-semibold text-amber-300 mb-1">
            Aktuelles Account Level: <span className="text-xl text-yellow-400">{accountLevel}</span>
          </h3>
          <div className="w-full bg-slate-600 rounded-full h-3.5 mb-1">
            <div
              className="bg-yellow-500 h-3.5 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${xpPercentage}%` }}
              role="progressbar"
              aria-valuenow={accountXP}
              aria-valuemin={0}
              aria-valuemax={expToNextAccountLevel}
            ></div>
          </div>
          <p className="text-xs text-slate-400 text-right">
            {formatNumber(accountXP)} / {formatNumber(expToNextAccountLevel)} Account XP
          </p>
        </div>

        {/* Current Active Bonuses */}
        <div className="p-3 bg-slate-700/50 rounded-lg border border-slate-600">
          <h4 className="text-md font-semibold text-green-400 mb-2">Aktive globale Boni (von Account Level):</h4>
          {Object.keys(currentAccountLevelBonuses).length > 0 ? (
            <ul className="list-disc list-inside space-y-0.5 text-sm text-slate-300">
              {Object.entries(currentAccountLevelBonuses).map(([stat, value]) => (
                value !== 0 && <li key={stat}>+{formatBonusValue(value, stat as keyof GlobalBonuses)} {getStatDisplayName(stat as keyof GlobalBonuses)}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-400 italic">Keine aktiven Boni von Account Leveln.</p>
          )}
        </div>

        {/* Next Level Bonuses */}
        {nextAccountLevelBonusesDef && (
          <div className="p-3 bg-slate-700/50 rounded-lg border border-slate-600">
            <h4 className="text-md font-semibold text-sky-400 mb-2">Boni für Level {accountLevel + 1}:</h4>
            <ul className="list-disc list-inside space-y-0.5 text-sm text-slate-300">
              {nextAccountLevelBonusesDef.effects.map((effect, index) => (
                <li key={index}>+{formatBonusValue(effect.value, effect.targetStat)} {getStatDisplayName(effect.targetStat)}</li>
              ))}
            </ul>
          </div>
        )}

        {/* XP History */}
        <div className="p-3 bg-slate-700/50 rounded-lg border border-slate-600">
          <h4 className="text-md font-semibold text-purple-400 mb-2">Letzte Account XP Gewinne:</h4>
          {accountXpHistory && accountXpHistory.length > 0 ? (
            <div className="space-y-1.5 max-h-40 overflow-y-auto fancy-scrollbar pr-1">
              {accountXpHistory.slice().reverse().map(event => (
                <div key={event.id} className="text-xs p-1.5 bg-slate-600/70 rounded">
                  <span className="text-purple-300">+{formatNumber(event.amount)} XP</span>
                  <span className="text-slate-400"> - {event.source} </span>
                  <span className="text-slate-500 text-[0.6rem]">({new Date(event.timestamp).toLocaleTimeString()})</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 italic">Noch keine Account XP erhalten.</p>
          )}
        </div>

      </div>
    </Modal>
  );
};

export default AccountLevelInfoModal;
