
import React from 'react';
import { PopupData } from '../BattleParticipantCard'; // Assuming PopupData is exported from parent

interface DamageHealPopupsProps {
  popups: PopupData[];
  formatNumber: (num: number) => string;
}

const DamageHealPopups: React.FC<DamageHealPopupsProps> = ({ popups, formatNumber }) => {
  return (
    <div className="damage-popup-container">
      {popups.map(popup => {
        let popupClass = '';
        let prefix = '';
        if (popup.isCritOrHealType === 'crit') popupClass = 'damage-popup crit';
        else if (popup.isCritOrHealType === 'heal') { popupClass = 'heal-popup'; prefix = '+'; }
        else if (popup.isCritOrHealType === 'shield') { popupClass = 'shield-damage-popup'; } // Added shield type
        else popupClass = 'damage-popup';
        
        return (
          <div key={popup.id} className={popupClass}>
            {prefix}{formatNumber(popup.displayedAmount)} {popup.isCritOrHealType === 'crit' && "!"}
          </div>
        );
      })}
    </div>
  );
};

export default DamageHealPopups;