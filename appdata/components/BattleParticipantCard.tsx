

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useGameContext } from '../context';
import { BattleHero, BattleEnemy, HeroStats, AttackEvent, Cost, ResourceType, StatusEffect, TemporaryBuff, StatusEffectType, ParticipantChannelingState } from '../types';
import { ICONS } from './Icons';
import { GAME_TICK_MS, DEFAULT_ENERGY_SHIELD_RECHARGE_DELAY_TICKS, RESOURCE_COLORS } from '../constants';
import { formatNumber } from '../utils';

// Import new sub-components
import ParticipantInfoHeader from './BattleParticipantCard/ParticipantInfoHeader';
import BattleActionBar from './BattleParticipantCard/BattleActionBar';
import BattleStatBars from './BattleParticipantCard/BattleStatBars';
import ParticipantStatsDisplay from './BattleParticipantCard/ParticipantStatsDisplay';
import SpecialAttackBadges from './BattleParticipantCard/SpecialAttackBadges';
import TemporaryBuffBadges from './BattleParticipantCard/TemporaryBuffBadges';
import DamageHealPopups from './BattleParticipantCard/DamageHealPopups';

interface BattleParticipantCardProps {
  participant: BattleHero | BattleEnemy;
  type: 'hero' | 'enemy';
  onClick?: () => void;
  isTargetable?: boolean;
  onSetTarget?: (targetId: string | null) => void;
  isSelectedTarget?: boolean;
}

export interface PopupData {
  id: string;
  finalAmount: number;
  displayedAmount: number;
  isCritOrHealType: 'crit' | 'normal' | 'heal' | 'shield';
  timestamp: number;
}

type DisplayMode = 'ALIVE' | 'DYING' | 'SHOWING_LOOT';
const STAT_BAR_ANIMATION_DURATION_MS = 300;
const HIT_ANIMATION_DURATION_MS = 300;
const HERO_DEATH_ANIMATION_DURATION_MS = 500;
const HP_VALUE_ANIMATION_DURATION_MS = 400;
const CHANNEL_BAR_ANIMATION_DURATION_MS = 100;
const CHANNEL_BAR_HEIGHT_CLASS = 'h-3.5'; // Increased height for channeling bar

const BattleParticipantCard: React.FC<BattleParticipantCardProps> = ({ participant, type, onClick, isTargetable, onSetTarget, isSelectedTarget }) => {
  const { gameState, staticData } = useGameContext();
  const stats = participant.calculatedStats;
  const maxHp = stats.maxHp;
  const battleHero = type === 'hero' ? (participant as BattleHero) : null;
  const battleEnemy = type === 'enemy' ? (participant as BattleEnemy) : null;

  const [isAttacking, setIsAttacking] = useState(false);
  const [popups, setPopups] = useState<PopupData[]>([]);
  const [displayMode, setDisplayMode] = useState<DisplayMode>('ALIVE');
  const [isCastingSpecial, setIsCastingSpecial] = useState(false);
  const [isTakingHit, setIsTakingHit] = useState(false);
  const [isTakingCrit, setIsTakingCrit] = useState(false);
  const [isTakingShieldHit, setIsTakingShieldHit] = useState(false);
  const [isBeingHealed, setIsBeingHealed] = useState(false);
  const [isVisuallyStunned, setIsVisuallyStunned] = useState(false);
  const [hpValueAnimationClass, setHpValueAnimationClass] = useState('');

  const gameStateRef = useRef(gameState);
  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);

  const prevHpRef = useRef(participant.currentHp);
  const prevShieldRef = useRef(battleHero?.currentEnergyShield || battleEnemy?.currentEnergyShield);
  const hpAnimationTimeoutRef = useRef<number | null>(null);

  const [currentAnimatedHp, setCurrentAnimatedHp] = useState(participant.currentHp);
  const [currentAnimatedMana, setCurrentAnimatedMana] = useState(battleHero ? battleHero.currentMana : 0);
  const [currentAnimatedShield, setCurrentAnimatedShield] = useState(battleHero?.currentEnergyShield || battleEnemy?.currentEnergyShield || 0);
  const [currentAnimatedChannelProgress, setCurrentAnimatedChannelProgress] = useState(0);


  const [animatedExpState, setAnimatedExpState] = useState({
    current: battleHero ? battleHero.currentExp : 0,
    toNextLevel: battleHero ? battleHero.expToNextLevel : 1,
  });
  const hpBarAnimationRef = useRef<number | null>(null);
  const manaBarAnimationRef = useRef<number | null>(null);
  const shieldBarAnimationRef = useRef<number | null>(null);
  const xpBarAnimationRef = useRef<number | null>(null);
  const channelBarAnimationRef = useRef<number | null>(null);
  const attackAnimationTimeoutRef = useRef<number | null>(null);
  const popupTimeoutsRef = useRef<Record<string, number>>({});
  const animationFrameRef = useRef<number | null>(null);
  const specialCastTimeoutRef = useRef<number | null>(null);
  const hitReactionTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (displayMode === 'ALIVE') {
        if (participant.currentHp < prevHpRef.current) {
            setHpValueAnimationClass('animate-hp-damage-value');
            if (hpAnimationTimeoutRef.current) clearTimeout(hpAnimationTimeoutRef.current);
            hpAnimationTimeoutRef.current = window.setTimeout(() => setHpValueAnimationClass(''), HP_VALUE_ANIMATION_DURATION_MS);
        } else if (participant.currentHp > prevHpRef.current) {
            setHpValueAnimationClass('animate-hp-heal-value');
            if (hpAnimationTimeoutRef.current) clearTimeout(hpAnimationTimeoutRef.current);
            hpAnimationTimeoutRef.current = window.setTimeout(() => setHpValueAnimationClass(''), HP_VALUE_ANIMATION_DURATION_MS);
        }
    }
    prevHpRef.current = participant.currentHp;
    const currentShieldValue = battleHero?.currentEnergyShield || battleEnemy?.currentEnergyShield;
    prevShieldRef.current = currentShieldValue;
  }, [participant.currentHp, battleHero?.currentEnergyShield, battleEnemy?.currentEnergyShield, displayMode]);

  useEffect(() => {
    if (hpBarAnimationRef.current) cancelAnimationFrame(hpBarAnimationRef.current);
    const startTime = performance.now();
    const startValue = currentAnimatedHp;
    const endValue = participant.currentHp;
    const animate = (now: number) => {
      const elapsedTime = now - startTime;
      const progress = Math.min(1, elapsedTime / STAT_BAR_ANIMATION_DURATION_MS);
      setCurrentAnimatedHp(startValue + (endValue - startValue) * progress);
      if (progress < 1) hpBarAnimationRef.current = requestAnimationFrame(animate);
      else setCurrentAnimatedHp(endValue);
    };
    hpBarAnimationRef.current = requestAnimationFrame(animate);
    return () => { if (hpBarAnimationRef.current) cancelAnimationFrame(hpBarAnimationRef.current); };
  }, [participant.currentHp]);

  useEffect(() => {
    if (type !== 'hero' || !battleHero) return;
    if (manaBarAnimationRef.current) cancelAnimationFrame(manaBarAnimationRef.current);
    const startTime = performance.now();
    const startValue = currentAnimatedMana;
    const endValue = battleHero.currentMana;
    const animate = (now: number) => {
      const elapsedTime = now - startTime;
      const progress = Math.min(1, elapsedTime / STAT_BAR_ANIMATION_DURATION_MS);
      setCurrentAnimatedMana(startValue + (endValue - startValue) * progress);
      if (progress < 1) manaBarAnimationRef.current = requestAnimationFrame(animate);
      else setCurrentAnimatedMana(endValue);
    };
    manaBarAnimationRef.current = requestAnimationFrame(animate);
    return () => { if (manaBarAnimationRef.current) cancelAnimationFrame(manaBarAnimationRef.current); };
  }, [battleHero?.currentMana, type, battleHero]);

  useEffect(() => {
    const shieldUser = battleHero || battleEnemy;
    if (!shieldUser || shieldUser.currentEnergyShield === undefined) return;

    if (shieldBarAnimationRef.current) cancelAnimationFrame(shieldBarAnimationRef.current);
    const startTime = performance.now();
    const startValue = currentAnimatedShield || 0;
    const endValue = shieldUser.currentEnergyShield || 0;

    const animateShield = (now: number) => {
      const elapsedTime = now - startTime;
      const progress = Math.min(1, elapsedTime / STAT_BAR_ANIMATION_DURATION_MS);
      setCurrentAnimatedShield(startValue + (endValue - startValue) * progress);
      if (progress < 1) shieldBarAnimationRef.current = requestAnimationFrame(animateShield);
      else setCurrentAnimatedShield(endValue);
    };
    shieldBarAnimationRef.current = requestAnimationFrame(animateShield);
    return () => { if (shieldBarAnimationRef.current) cancelAnimationFrame(shieldBarAnimationRef.current); };
  }, [battleHero?.currentEnergyShield, battleEnemy?.currentEnergyShield, type]);

  useEffect(() => {
    const channelingState = participant.channelingState;
    if (channelBarAnimationRef.current) cancelAnimationFrame(channelBarAnimationRef.current);
    if (channelingState) {
        const startTime = performance.now();
        const startValue = typeof currentAnimatedChannelProgress === 'number' ? currentAnimatedChannelProgress : 0;
        const endValue = (channelingState.progressMs / channelingState.totalDurationMs) * 100;

        const animateChannel = (now: number) => {
            const elapsedTime = now - startTime;
            const progress = Math.min(1, elapsedTime / CHANNEL_BAR_ANIMATION_DURATION_MS); // Faster animation for channel bar
            setCurrentAnimatedChannelProgress(startValue + (endValue - startValue) * progress);
            if (progress < 1) {
                channelBarAnimationRef.current = requestAnimationFrame(animateChannel);
            } else {
                setCurrentAnimatedChannelProgress(endValue);
            }
        };
        channelBarAnimationRef.current = requestAnimationFrame(animateChannel);
    } else {
        setCurrentAnimatedChannelProgress(0);
    }
    return () => { if (channelBarAnimationRef.current) cancelAnimationFrame(channelBarAnimationRef.current); };
  }, [participant.channelingState?.progressMs, participant.channelingState?.totalDurationMs]);


  useEffect(() => {
    const currentHero = type === 'hero' ? (participant as BattleHero) : null;
    if (!currentHero) return;
    const targetCurrentExp = currentHero.currentExp;
    const targetExpToNext = currentHero.expToNextLevel;
    if (xpBarAnimationRef.current) cancelAnimationFrame(xpBarAnimationRef.current);
    const startAnimatedCurrentExp = animatedExpState.current;
    const startAnimatedExpToNext = animatedExpState.toNextLevel;
    const startTime = performance.now();
    const animateExp = (now: number) => {
      const elapsedTime = now - startTime;
      const progress = Math.min(1, elapsedTime / STAT_BAR_ANIMATION_DURATION_MS);
      const newAnimatedCurrent = Math.round(startAnimatedCurrentExp + (targetCurrentExp - startAnimatedCurrentExp) * progress);
      const newAnimatedToNext = Math.round(startAnimatedExpToNext + (targetExpToNext - startAnimatedExpToNext) * progress);
      setAnimatedExpState({ current: newAnimatedCurrent, toNextLevel: newAnimatedToNext });
      if (progress < 1) xpBarAnimationRef.current = requestAnimationFrame(animateExp);
      else setAnimatedExpState({ current: targetCurrentExp, toNextLevel: targetExpToNext });
    };
    if (targetCurrentExp !== animatedExpState.current || targetExpToNext !== animatedExpState.toNextLevel) {
      xpBarAnimationRef.current = requestAnimationFrame(animateExp);
    } else {
      setAnimatedExpState({ current: targetCurrentExp, toNextLevel: targetExpToNext });
    }
    return () => { if (xpBarAnimationRef.current) cancelAnimationFrame(xpBarAnimationRef.current); };
  }, [battleHero?.currentExp, battleHero?.expToNextLevel, battleHero?.level, participant.uniqueBattleId, type, animatedExpState.current, animatedExpState.toNextLevel]);

  useEffect(() => {
    const currentHero = type === 'hero' ? (participant as BattleHero) : null;
    setAnimatedExpState({
        current: currentHero ? currentHero.currentExp : 0,
        toNextLevel: currentHero ? currentHero.expToNextLevel : 1,
    });
  }, [participant.uniqueBattleId, type]);

  useEffect(() => {
    if (type === 'enemy' && (participant as BattleEnemy).isDying && (participant as BattleEnemy).dyingTicksRemaining !== undefined && (participant as BattleEnemy).dyingTicksRemaining! <= 0) {
      setDisplayMode('SHOWING_LOOT');
    } else if (participant.currentHp <= 0 && displayMode === 'ALIVE') {
      setDisplayMode('DYING');
    } else if (participant.currentHp > 0 && displayMode !== 'ALIVE') {
      setDisplayMode('ALIVE');
    }
  }, [participant.currentHp, (participant as BattleEnemy).isDying, (participant as BattleEnemy).dyingTicksRemaining, displayMode, type]);

  useEffect(() => {
    const currentAttackEvents = gameStateRef.current.battleState?.lastAttackEvents || [];
    let aggregatedDamage = 0;
    let aggregatedShieldDamage = 0;
    let aggregatedHeal = 0;
    let wasCrit = false;
    let eventTimestampForPopup = 0;

    if (hitReactionTimeoutRef.current) clearTimeout(hitReactionTimeoutRef.current);

    currentAttackEvents.forEach((event: AttackEvent) => {
      if (event.attackerId === participant.uniqueBattleId && displayMode === 'ALIVE') {
        setIsAttacking(true);
        if (attackAnimationTimeoutRef.current) clearTimeout(attackAnimationTimeoutRef.current);
        attackAnimationTimeoutRef.current = window.setTimeout(() => setIsAttacking(false), HIT_ANIMATION_DURATION_MS);
        if (event.isSpecialAttack) {
            setIsCastingSpecial(true);
            if (specialCastTimeoutRef.current) clearTimeout(specialCastTimeoutRef.current);
            specialCastTimeoutRef.current = window.setTimeout(() => setIsCastingSpecial(false), 600);
        }
      }
      if (event.targetId === participant.uniqueBattleId) {
        if (eventTimestampForPopup === 0) eventTimestampForPopup = event.timestamp;
        if (event.isHeal && event.healAmount) {
            aggregatedHeal += event.healAmount;
            setIsBeingHealed(true);
        } else {
            if(event.shieldDamage && event.shieldDamage > 0) {
                aggregatedShieldDamage += event.shieldDamage;
                setIsTakingShieldHit(true);
            }
            if (event.damage > 0) {
                aggregatedDamage += event.damage;
                if (event.isCrit) { wasCrit = true; setIsTakingCrit(true); }
                else { setIsTakingHit(true); }
            }
        }
      }
    });

    if (isTakingHit || isTakingCrit || isBeingHealed || isTakingShieldHit) {
        hitReactionTimeoutRef.current = window.setTimeout(() => {
            setIsTakingHit(false); setIsTakingCrit(false); setIsBeingHealed(false); setIsTakingShieldHit(false);
        }, HIT_ANIMATION_DURATION_MS);
    }

    const createAndManagePopup = (amount: number, typePopup: PopupData['isCritOrHealType']) => {
        if (amount > 0 && eventTimestampForPopup > 0 && displayMode === 'ALIVE') {
            const popupId = `${eventTimestampForPopup}-${participant.uniqueBattleId}-${typePopup}-${Math.random().toString(36).substr(2, 5)}`;
            setPopups(prev => [...prev, { id: popupId, finalAmount: amount, displayedAmount: 0, isCritOrHealType: typePopup, timestamp: Date.now() }].slice(-7));
            if (popupTimeoutsRef.current[popupId]) clearTimeout(popupTimeoutsRef.current[popupId]);
            popupTimeoutsRef.current[popupId] = window.setTimeout(() => {
                setPopups(current => current.filter(p => p.id !== popupId));
                delete popupTimeoutsRef.current[popupId];
            }, 1800);
        }
    };

    createAndManagePopup(aggregatedShieldDamage, 'shield');
    createAndManagePopup(aggregatedDamage, wasCrit ? 'crit' : 'normal');
    createAndManagePopup(aggregatedHeal, 'heal');

  }, [gameState.battleState?.lastAttackEvents, participant.uniqueBattleId, displayMode]);

  useEffect(() => {
    const animatePopups = () => {
      setPopups(currentPopups => {
        let hasChanges = false;
        const updatedPopups = currentPopups.map(p => {
          if (p.displayedAmount < p.finalAmount) {
            hasChanges = true;
            const increment = Math.max(1, Math.ceil((p.finalAmount - p.displayedAmount) * 0.1));
            return { ...p, displayedAmount: Math.min(p.finalAmount, p.displayedAmount + increment) };
          }
          return p;
        });
        return hasChanges ? updatedPopups : currentPopups;
      });
      animationFrameRef.current = requestAnimationFrame(animatePopups);
    };
    if (displayMode === 'ALIVE') animationFrameRef.current = requestAnimationFrame(animatePopups);
    return () => { if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current); };
  }, [displayMode]);

  useEffect(() => {
    setIsVisuallyStunned(participant.statusEffects?.some(effect => effect.type === StatusEffectType.STUN && effect.remainingDurationMs > 0) || false);
  }, [participant.statusEffects]);

  useEffect(() => {
    return () => {
      if (attackAnimationTimeoutRef.current) clearTimeout(attackAnimationTimeoutRef.current);
      Object.values(popupTimeoutsRef.current).forEach(clearTimeout);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (specialCastTimeoutRef.current) clearTimeout(specialCastTimeoutRef.current);
      if (hitReactionTimeoutRef.current) clearTimeout(hitReactionTimeoutRef.current);
      if (hpBarAnimationRef.current) cancelAnimationFrame(hpBarAnimationRef.current);
      if (manaBarAnimationRef.current) cancelAnimationFrame(manaBarAnimationRef.current);
      if (shieldBarAnimationRef.current) cancelAnimationFrame(shieldBarAnimationRef.current);
      if (xpBarAnimationRef.current) cancelAnimationFrame(xpBarAnimationRef.current);
      if (channelBarAnimationRef.current) cancelAnimationFrame(channelBarAnimationRef.current);
      if (hpAnimationTimeoutRef.current) clearTimeout(hpAnimationTimeoutRef.current);
    };
  }, []);

  const initialAttackCooldownForBasicAttack = stats.attackSpeed > 0 ? 1000 / stats.attackSpeed : 0;
  const currentAttackCooldownTimeMsForBasicAttack = participant.attackCooldown;
  const actionBarProgressForBasicAttack = initialAttackCooldownForBasicAttack > 0
    ? Math.max(0, Math.min(100, (1 - (currentAttackCooldownTimeMsForBasicAttack / initialAttackCooldownForBasicAttack)) * 100))
    : 0;
  const actionBarReadyClassForBasicAttack = actionBarProgressForBasicAttack >= 100 ? 'animate-action-bar-ready' : '';

  let isChanneling = !!participant.channelingState;
  let isChannelingAndBlockingActions = isChanneling && participant.channelingState!.areActionsBlocked;
  let channelingAbilityName: string | null = null;
  let channelingProgressText: string | null = null;

  if (isChanneling && participant.channelingState) {
    const abilityId = participant.channelingState.abilityId;
    if(type === 'hero') {
        channelingAbilityName = staticData.specialAttackDefinitions[abilityId]?.name || 'Channeling';
    } else {
        const enemyDef = staticData.enemyDefinitions[participant.id];
        channelingAbilityName = enemyDef?.channelingAbilities?.find(ca => ca.id === abilityId)?.name || 'Channeling';
    }
    const currentSeconds = (participant.channelingState.progressMs / 1000).toFixed(1);
    const totalSeconds = (participant.channelingState.totalDurationMs / 1000).toFixed(1);
    channelingProgressText = ` (${currentSeconds}s / ${totalSeconds}s)`;
  }


  let cardClasses = [
    'p-3 rounded-lg shadow-md glass-effect border-2 relative overflow-visible transition-all duration-200 h-full flex flex-col justify-between',
    type === 'hero' ? 'border-sky-500' : 'border-red-500',
    isAttacking && displayMode === 'ALIVE' && !participant.channelingState ? 'attacking' : '',
    (displayMode === 'DYING' && type === 'hero') ? 'animate-death' :
    (displayMode === 'SHOWING_LOOT' && type === 'enemy') ? 'opacity-0 transition-opacity duration-500 delay-300 pointer-events-none' : 
    (displayMode === 'DYING' && type === 'enemy') ? 'opacity-50' : 
    'opacity-100',
    isCastingSpecial && displayMode === 'ALIVE' && !participant.channelingState ? `animate-special-cast ${type === 'hero' ? 'hero-cast-pulse' : 'enemy-cast-pulse'}` : '',
    isTakingCrit && displayMode === 'ALIVE' ? 'target-crit-flash' : (isTakingHit && displayMode === 'ALIVE' ? 'target-hit-flash' : ''),
    isTakingShieldHit && displayMode === 'ALIVE' ? 'target-shield-flash' : '',
    isBeingHealed && displayMode === 'ALIVE' ? 'target-healed-flash' : '',
    isVisuallyStunned && displayMode === 'ALIVE' ? 'status-stunned-pulse' : '',
    isTargetable && displayMode === 'ALIVE' && type === 'hero' ? 'cursor-pointer hover:ring-2 hover:ring-green-400' : '',
    isSelectedTarget && displayMode === 'ALIVE' && type === 'enemy' ? 'ring-2 ring-orange-500 shadow-orange-400/50' : '',
    type === 'enemy' && displayMode === 'ALIVE' && !isTargetable && !isSelectedTarget ? 'cursor-pointer hover:ring-2 hover:ring-orange-400' : '',
    participant.channelingState ? 'ring-2 ring-purple-400 shadow-purple-500/40' : ''
  ].filter(Boolean).join(' ');


  if (type === 'enemy' && displayMode === 'SHOWING_LOOT') {
    const lootInfo = gameState.battleState?.defeatedEnemiesWithLoot[participant.uniqueBattleId];
    const Icon = ICONS[lootInfo?.originalIconName || 'ENEMY'];
    return (
      <div className="p-3 rounded-lg shadow-md glass-effect border-2 border-slate-700/50 bg-slate-800/70 h-full flex flex-col justify-center items-center opacity-80 hover:opacity-100 transition-opacity">
        {Icon && <Icon className="w-10 h-10 mb-2 text-slate-500" />}
        {lootInfo && lootInfo.loot.length > 0 ? (
          lootInfo.loot.map((item, index) => {
            const LootItemIcon = ICONS[item.resource];
            return (
              <div key={index} className="flex items-center text-xs text-yellow-300">
                {LootItemIcon && <LootItemIcon className={`w-3 h-3 mr-1 ${RESOURCE_COLORS[item.resource] || 'text-yellow-200'}`} />}
                {formatNumber(item.amount)} {item.resource.replace(/_/g, ' ')}
              </div>
            );
          })
        ) : (
          <p className="text-xs text-slate-400 italic">No loot</p>
        )}
      </div>
    );
  }
  if (type === 'enemy' && displayMode === 'DYING') {
     // Minimal rendering for dying enemy before it becomes SHOWING_LOOT or removed
     return (
        <div className={cardClasses} style={{pointerEvents: 'none'}}>
           {/* Optionally render a faded icon or something simple */}
        </div>
    );
  }


  const handleCardClick = () => {
    if (onClick) {
      onClick();
    } else if (onSetTarget && type === 'enemy' && displayMode === 'ALIVE') {
      if (isSelectedTarget) {
        onSetTarget(null);
      } else {
        onSetTarget(participant.uniqueBattleId);
      }
    }
  };

  const activeStatusEffects = participant.statusEffects?.filter(se => se.remainingDurationMs > 0) || [];

  return (
    <div
      className={cardClasses}
      onClick={handleCardClick}
      role="button"
      tabIndex={(onClick || (type === 'enemy' && onSetTarget)) ? 0 : -1}
      onKeyDown={(e) => { if((onClick || (type === 'enemy' && onSetTarget)) && (e.key === 'Enter' || e.key === ' ')) handleCardClick() }}
      aria-label={onClick ? `Use selected potion on ${participant.name}` : (type === 'enemy' && onSetTarget ? `Target ${participant.name}` : `${participant.name} card`)}
      aria-pressed={type === 'enemy' && isSelectedTarget ? true : undefined}
    >
      <DamageHealPopups popups={popups} formatNumber={formatNumber} />

      <div className={displayMode === 'DYING' ? 'opacity-0 transition-opacity duration-300 delay-200' : 'opacity-100'}>
        <ParticipantInfoHeader participant={participant} type={type} isVisuallyStunned={isVisuallyStunned} />

        {isChanneling && (
          <div
            className={`w-full bg-slate-600 rounded-full ${CHANNEL_BAR_HEIGHT_CLASS} mb-0.5 relative flex items-center justify-center overflow-hidden`}
            title={`Channeling: ${channelingAbilityName}`}
          >
            <div
              className="absolute top-0 left-0 bg-purple-500 h-full rounded-full transition-all duration-100 ease-linear"
              style={{ width: `${currentAnimatedChannelProgress}%` }}
            />
            {channelingAbilityName && (
              <span className="relative z-10 text-xs font-medium text-white pointer-events-none text-on-bar truncate px-1" style={{lineHeight: 'normal'}}>
                {channelingAbilityName}{channelingProgressText}
              </span>
            )}
          </div>
        )}

        {(!isChanneling || (isChanneling && !isChannelingAndBlockingActions)) && (
          <BattleActionBar
            actionBarProgress={actionBarProgressForBasicAttack}
            actionBarReadyClass={actionBarReadyClassForBasicAttack}
            participantName={participant.name}
            initialAttackCooldown={initialAttackCooldownForBasicAttack}
            attackCooldown={currentAttackCooldownTimeMsForBasicAttack}
          />
        )}

        <BattleStatBars
            participantType={type}
            currentAnimatedHp={currentAnimatedHp}
            maxHp={maxHp}
            hpValueAnimationClass={hpValueAnimationClass}
            battleHero={battleHero}
            currentAnimatedMana={currentAnimatedMana}
            maxMana={battleHero?.calculatedStats.maxMana || 0}
            animatedExpState={animatedExpState}
            displayMode={displayMode}
            formatNumber={formatNumber}
            participant={participant}
            currentAnimatedShield={currentAnimatedShield}
            maxShield={participant.calculatedStats.maxEnergyShield}
        />
        <ParticipantStatsDisplay stats={stats} type={type} displayMode={displayMode} />

        {displayMode === 'ALIVE' && (!participant.channelingState || !participant.channelingState.areActionsBlocked) && (
            <>
                <SpecialAttackBadges battleHero={battleHero} type={type} displayMode={displayMode} staticData={staticData} />
                <TemporaryBuffBadges battleHero={battleHero} type={type} displayMode={displayMode} staticData={staticData} />
            </>
        )}

        {activeStatusEffects.length > 0 && (
          <div className="mt-1 pt-1 border-t border-slate-700/50 flex flex-wrap gap-1 justify-center">
            {activeStatusEffects.map(effect => {
              const EffectIcon = ICONS[effect.iconName || (effect.type === StatusEffectType.BUFF ? 'BUFF_ICON' : effect.type === StatusEffectType.DEBUFF ? 'WARNING' : 'INFO')];
              const remainingSeconds = Math.ceil(effect.remainingDurationMs / 1000);
              let iconColorClass = 'text-slate-300';
              if (effect.type === StatusEffectType.BUFF) iconColorClass = 'text-green-400';
              else if (effect.type === StatusEffectType.DEBUFF || effect.type === StatusEffectType.DOT) iconColorClass = 'text-red-400';
              else if (effect.type === StatusEffectType.STUN) iconColorClass = 'text-yellow-400';

              return (
                <div key={effect.instanceId} className="special-attack-icon-container" title={`${effect.name} (${remainingSeconds}s left)`}>
                  {EffectIcon && <EffectIcon className={`special-attack-icon ${iconColorClass}`} />}
                  <span className={`text-xs ${iconColorClass}`}>{remainingSeconds}s</span>
                </div>
              );
            })}
          </div>
        )}

        {type === 'enemy' && battleEnemy && displayMode === 'ALIVE' && (
          <div className="mt-1 pt-1 border-t border-slate-700/50 space-y-0.5">
             {battleEnemy.periodicEffectAbility && (
              <div className="special-attack-icon-container" title={`Periodic: ${battleEnemy.periodicEffectAbility.statusEffect.name}`}>
                {ICONS[battleEnemy.periodicEffectAbility.statusEffect.iconName || 'SETTINGS'] &&
                    React.createElement(ICONS[battleEnemy.periodicEffectAbility.statusEffect.iconName || 'SETTINGS'], {className: "special-attack-icon text-rose-400"})}
                <span className={(battleEnemy.currentPeriodicEffectCooldownMs || 0) <= 0 ? 'cooldown-ready' : 'cooldown-charging'}>
                  {(battleEnemy.currentPeriodicEffectCooldownMs || 0) <= 0 ? 'Ready' : `${((battleEnemy.currentPeriodicEffectCooldownMs || 0) / 1000).toFixed(0)}s`}
                </span>
              </div>
            )}
            {battleEnemy.summonAbility && (
              <div className="special-attack-icon-container" title={`Summon: ${staticData.enemyDefinitions[battleEnemy.summonAbility.enemyIdToSummon]?.name || 'Minions'}`}>
                {ICONS[staticData.enemyDefinitions[battleEnemy.summonAbility.enemyIdToSummon]?.iconName || 'ENEMY'] &&
                    React.createElement(ICONS[staticData.enemyDefinitions[battleEnemy.summonAbility.enemyIdToSummon]?.iconName || 'ENEMY'], {className: "special-attack-icon text-purple-400"})}
                <span className={(battleEnemy.currentSummonCooldownMs || 0) <= 0 ? 'cooldown-ready' : 'cooldown-charging'}>
                  {(battleEnemy.currentSummonCooldownMs || 0) <= 0 ? 'Ready' : `${((battleEnemy.currentSummonCooldownMs || 0) / 1000).toFixed(0)}s`}
                </span>
              </div>
            )}
            {battleEnemy.channelingAbilities && battleEnemy.channelingAbilities.map(abilityDef => {
                if(participant.channelingState && participant.channelingState.abilityId === abilityDef.id) return null;
                const ChanneledIcon = ICONS[abilityDef.iconName || 'SKILL'];
                const currentCooldown = battleEnemy.specialAttackCooldownsRemaining?.[abilityDef.id] || 0;
                return (
                    <div key={abilityDef.id} className="special-attack-icon-container" title={`Channel: ${abilityDef.name}`}>
                        {ChanneledIcon && <ChanneledIcon className="special-attack-icon text-indigo-400" />}
                        <span className={currentCooldown <= 0 ? 'cooldown-ready' : 'cooldown-charging'}>
                            {currentCooldown <= 0 ? 'Ready' : `${(currentCooldown / 1000).toFixed(0)}s`}
                        </span>
                    </div>
                );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default BattleParticipantCard;
