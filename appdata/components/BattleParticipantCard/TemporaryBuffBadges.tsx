
import React from 'react';
import { BattleHero, TemporaryBuff } from '../../types';
import { ICONS } from '../Icons';
import { useGameContext } from '../../context';

interface TemporaryBuffBadgesProps {
  battleHero: BattleHero | null;
  type: 'hero' | 'enemy';
  displayMode: 'ALIVE' | 'DYING' | 'SHOWING_LOOT';
  staticData: ReturnType<typeof useGameContext>['staticData'];
}

const TemporaryBuffBadges: React.FC<TemporaryBuffBadgesProps> = ({ battleHero, type, displayMode, staticData }) => {
  if (type !== 'hero' || displayMode !== 'ALIVE' || !battleHero || !battleHero.temporaryBuffs || battleHero.temporaryBuffs.length === 0) {
    return null;
  }

  return (
    <div className="mt-1 pt-1 border-t border-slate-700/50 flex flex-wrap gap-1 justify-center">
      {battleHero.temporaryBuffs.map(buff => {
        const potionDef = staticData.potionDefinitions[buff.potionId];
        let BuffIcon = ICONS.BUFF_ICON;
        if (potionDef) BuffIcon = ICONS[potionDef.iconName] || BuffIcon;
        if (buff.stat === 'damage') BuffIcon = ICONS.BUFF_ATTACK || BuffIcon;
        if (buff.stat === 'defense') BuffIcon = ICONS.BUFF_DEFENSE || BuffIcon;
        
        const remainingSeconds = Math.ceil(buff.remainingDurationMs / 1000);
        return (
          <div key={buff.id} className="special-attack-icon-container" title={`${potionDef?.name || 'Buff'} - ${buff.stat || ''} ${buff.modifierType === 'PERCENTAGE_ADDITIVE' ? (buff.value * 100) + '%' : buff.value} (${remainingSeconds}s left)`}>
            {BuffIcon && <BuffIcon className="special-attack-icon text-yellow-400" />}
            <span className="text-yellow-400 text-xs">{remainingSeconds}s</span>
          </div>
        );
      })}
    </div>
  );
};

export default TemporaryBuffBadges;
