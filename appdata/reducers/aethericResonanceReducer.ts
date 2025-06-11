
import { GameState, GameAction, GlobalBonuses, ResourceType, GameNotification, HeroStats, ResonanceMoteType, LastAppliedResonanceMoteInfo } from '../types';
import { AETHERIC_RESONANCE_STAT_CONFIGS } from '../gameData/index';
import { NOTIFICATION_ICONS } from '../constants';
import { formatNumber } from '../utils';
import { ICONS } from '../components/Icons';

// Hilfsfunktion zur Erzeugung eindeutiger IDs für Benachrichtigungen
const generateUniqueNotificationId = (prefix: string = "aetheric") => `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

export const aethericResonanceReducer = (
  state: GameState,
  action: Extract<GameAction, { type: 'COLLECT_RESONANCE_MOTES' | 'INFUSE_STAT_SPECIFIC_MOTE' }>,
  globalBonuses?: GlobalBonuses // globalBonuses ist hier nicht direkt notwendig, aber für Konsistenz beibehalten
): GameState => {
  switch (action.type) {
    case 'COLLECT_RESONANCE_MOTES': {
      const { statId, quality, amount } = action.payload;
      const newMotes = JSON.parse(JSON.stringify(state.resonanceMotes)); // Tiefe Kopie für verschachteltes Objekt

      if (!newMotes[statId]) {
        newMotes[statId] = { faint: 0, clear: 0, potent: 0 };
      }
      newMotes[statId][quality] = (newMotes[statId][quality] || 0) + amount;

      // Deutsche Kommentare: Keine direkte Benachrichtigung hier, da es sehr viele werden könnten.
      // Die UI (Altar) wird die neuen Mengen anzeigen.
      return {
        ...state,
        resonanceMotes: newMotes,
      };
    }

    case 'INFUSE_STAT_SPECIFIC_MOTE': {
      const { statId, moteType } = action.payload;
      const statConfig = AETHERIC_RESONANCE_STAT_CONFIGS.find(sc => sc.id === statId);

      if (!statConfig) {
        console.warn(`Aetheric Resonance: Stat configuration for ${statId} not found.`);
        return state;
      }

      const currentMotesForStat = state.resonanceMotes[statId];
      const currentMotesOfType = currentMotesForStat?.[moteType] || 0;

      // Englische Namen für UI und Benachrichtigungen
      const qualityDisplayName: LastAppliedResonanceMoteInfo['qualityName'] =
        moteType === 'faint' ? 'Resonance Shard' :
        moteType === 'clear' ? 'Clear Core' :
        'Potent Focus';

      if (currentMotesOfType <= 0) {
        const noMotesNotification: GameNotification = {
          id: generateUniqueNotificationId("noMotes"),
          message: `No ${qualityDisplayName} for ${statConfig.label} available to infuse.`,
          type: 'warning',
          iconName: NOTIFICATION_ICONS.warning,
          timestamp: Date.now(),
        };
        return { ...state, notifications: [...state.notifications, noMotesNotification] };
      }

      let bonusValue = statConfig.baseBonusPerFaintMote;
      if (moteType === 'clear') {
        bonusValue *= 2;
      } else if (moteType === 'potent') {
        bonusValue *= 10;
      }

      const newResonanceBonuses = { ...state.aethericResonanceBonuses };
      const currentStatBonuses = { ...(newResonanceBonuses[statId] || { percentage: 0, flat: 0 }) };

      if (statConfig.isPercentage) {
        currentStatBonuses.percentage = (currentStatBonuses.percentage || 0) + bonusValue;
      } else {
        currentStatBonuses.flat = (currentStatBonuses.flat || 0) + bonusValue;
      }
      newResonanceBonuses[statId] = currentStatBonuses;

      const newMotesInventory = JSON.parse(JSON.stringify(state.resonanceMotes));
      newMotesInventory[statId][moteType] = currentMotesOfType - 1;

      const bonusDisplay = statConfig.isPercentage
        ? `${(bonusValue * 100).toFixed(4)}%`
        : bonusValue.toFixed(5);

      const successNotification: GameNotification = {
        id: generateUniqueNotificationId("infuseSuccess"),
        message: `${statConfig.label} permanently empowered by +${bonusDisplay} with a ${qualityDisplayName}!`,
        type: 'success',
        iconName: statConfig.iconName || 'UPGRADE',
        timestamp: Date.now(),
      };
      
      const lastAppliedInfo: LastAppliedResonanceMoteInfo = {
        statId: statId,
        qualityName: qualityDisplayName,
        bonusValue: bonusValue,
        isPercentage: statConfig.isPercentage,
        timestamp: Date.now(),
      };

      return {
        ...state,
        resonanceMotes: newMotesInventory,
        aethericResonanceBonuses: newResonanceBonuses,
        notifications: [...state.notifications, successNotification],
        lastAppliedResonanceMote: lastAppliedInfo,
      };
    }
    default:
      return state;
  }
};
