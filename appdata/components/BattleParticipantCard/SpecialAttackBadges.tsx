
import React from 'react';
import { BattleHero } from '../../types';
import { ICONS } from '../Icons';
import { useGameContext } from '../../context';
import { calculateSpecialAttackData } from '../../utils';

interface SpecialAttackBadgesProps {
  battleHero: BattleHero | null;
  type: 'hero' | 'enemy';
  displayMode: 'ALIVE' | 'DYING' | 'SHOWING_LOOT';
  staticData: ReturnType<typeof useGameContext>['staticData'];
}

const SpecialAttackBadges: React.FC<SpecialAttackBadgesProps> = ({ battleHero, type, displayMode, staticData }) => {
  if (type !== 'hero' || displayMode !== 'ALIVE' || !battleHero || !battleHero.specialAttackLevels || Object.keys(battleHero.specialAttackLevels).length === 0) {
    return null;
  }

  return (
    <div className="mt-1 pt-1 border-t border-slate-700/50 flex flex-wrap gap-1 justify-center">
      {Object.entries(battleHero.specialAttackLevels).map(([saId, level]) => {
        if (level === 0) return null;
        const saDef = staticData.specialAttackDefinitions[saId];
        if (!saDef) return null;

        const saData = calculateSpecialAttackData(saDef, level);
        const currentSaManaCost = saData.currentManaCost || 0;
        const SpecialAttackIcon = ICONS[saDef.iconName];
        const cooldownRemainingMs = battleHero.specialAttackCooldownsRemaining[saId] || 0;
        const isReadyByCooldown = cooldownRemainingMs <= 0;
        const hasEnoughMana = battleHero.currentMana >= currentSaManaCost;
        const isFullyReady = isReadyByCooldown && hasEnoughMana;
        
        let statusText = 'Ready';
        let statusColor = 'cooldown-ready';

        if (!isReadyByCooldown) {
          statusText = `${(cooldownRemainingMs / 1000).toFixed(0)}s`;
          statusColor = 'cooldown-charging';
        } else if (!hasEnoughMana) {
          statusText = `Low MP`;
          statusColor = 'text-blue-400';
        }

        return (
          <div key={saId} className="special-attack-icon-container" title={`${saDef.name} Lvl ${level} (Cost: ${currentSaManaCost} MP)`}>
            {SpecialAttackIcon && <SpecialAttackIcon className={`special-attack-icon ${!isFullyReady && isReadyByCooldown && !hasEnoughMana ? 'opacity-60' : ''}`} />}
            <span className={statusColor}>{statusText}</span>
          </div>
        );
      })}
    </div>
  );
};

export default SpecialAttackBadges;
