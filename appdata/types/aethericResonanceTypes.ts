
import { HeroStats } from './hero';
import { ICONS } from '../components/Icons';

export type ResonanceMoteType = 'faint' | 'clear' | 'potent';

export interface AethericResonanceStatConfig {
  id: keyof HeroStats; // Stat, der beeinflusst wird
  label: string;       // Anzeigename für die UI, z.B. "Resonante Macht"
  iconName?: keyof typeof ICONS; // Optionales Icon für die UI
  baseBonusPerFaintMote: number; // Der *absolute* Wert des Bonus (z.B. 0.00005 für +0.005%)
  isPercentage: boolean; // True, wenn der Bonus prozentual ist (wirkt auf aethericResonanceBonuses[stat].percentage)
                          // False, wenn flach (wirkt auf aethericResonanceBonuses[stat].flat)
  dropWeight: number; // Gewichtung für die Drop-Wahrscheinlichkeit dieses Stat-Motes
}
// LastAppliedResonanceMoteInfo ist jetzt in types/gameState.ts definiert
