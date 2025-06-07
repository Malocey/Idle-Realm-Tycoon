
import { SharedSkillDefinition } from '../types';

// Import individual skill node definitions
import { ORIGIN_NODE } from './sharedSkills/originNode';
import { ATTACK_FUNDAMENTALS_NODE } from './sharedSkills/attackFundamentalsNode';
import { PRECISION_STRIKES_NODE } from './sharedSkills/precisionStrikesNode';
import { DEFENSE_FUNDAMENTALS_NODE } from './sharedSkills/defenseFundamentalsNode';
import { RESILIENCE_NODE } from './sharedSkills/resilienceNode';
import { HP_FUNDAMENTALS_NODE } from './sharedSkills/hpFundamentalsNode';
import { MANA_FUNDAMENTALS_NODE } from './sharedSkills/manaFundamentalsNode';
import { ARCANE_RENEWAL_NODE } from './sharedSkills/manaRegenNode'; 
import { EXPANDED_MIND_NODE } from './sharedSkills/maxManaFlatNode'; 
import { COLOSSAL_FORTITUDE_NODE } from './sharedSkills/maxHpFlatNode';
import { DIVINE_HEALING_NODE } from './sharedSkills/divineHealingNode';
import { ARCANE_SHIELDING_NODE } from './sharedSkills/maxEnergyShieldNode';
import { RAPID_REGENERATION_NODE } from './sharedSkills/energyShieldRechargeRateNode';
import { QUICK_RECOVERY_NODE } from './sharedSkills/energyShieldRechargeDelayNode';
import { LETHAL_STRIKES_NODE } from './sharedSkills/critDamageNode';

export const SHARED_SKILL_DEFINITIONS: Record<string, SharedSkillDefinition> = {
  'SHARED_ORIGIN': ORIGIN_NODE,
  'SHARED_MAIN_ATTACK': ATTACK_FUNDAMENTALS_NODE,
  'SHARED_ATTACK_CRIT_CHANCE': PRECISION_STRIKES_NODE,
  'SHARED_DEFENSE_HP_REGEN': RESILIENCE_NODE,
  'SHARED_MAIN_DEFENSE': DEFENSE_FUNDAMENTALS_NODE,
  'SHARED_MAIN_HP': HP_FUNDAMENTALS_NODE,
  'SHARED_MAIN_MP': MANA_FUNDAMENTALS_NODE,
  'SHARED_MP_REGEN': ARCANE_RENEWAL_NODE, 
  'SHARED_MP_FLAT': EXPANDED_MIND_NODE,   
  'SHARED_HP_FLAT': COLOSSAL_FORTITUDE_NODE,
  'SHARED_HEAL_POWER_PERCENT': DIVINE_HEALING_NODE,
  'SHARED_MAX_ES_PERCENT': ARCANE_SHIELDING_NODE,
  'SHARED_ES_RECHARGE_RATE_PERCENT': RAPID_REGENERATION_NODE,
  'SHARED_ES_RECHARGE_DELAY_FLAT': QUICK_RECOVERY_NODE,
  'SHARED_CRIT_DAMAGE_PERCENT': LETHAL_STRIKES_NODE,
};
