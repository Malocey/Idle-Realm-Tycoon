
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

interface BattleParticipantCardProps {
  participant: BattleHero | BattleEnemy;
  type: 'hero' | 'enemy';
  onClick?: () => void;
  isTargetable?: boolean;
  onSetTarget?: (targetId: string | null) => void;
  isSelectedTarget?: boolean;
  displayMode?: 'card' | 'grid'; 
}

type DisplayModeInternal = 'ALIVE' | 'DYING' | 'SHOWING_LOOT'; 
const STAT_BAR_ANIMATION_DURATION_MS = 300;
const HIT_ANIMATION_DURATION_MS = 300;
const HERO_DEATH_ANIMATION_DURATION_MS = 500;
const HP_VALUE_ANIMATION_DURATION_MS = 400;
const CHANNEL_BAR_ANIMATION_DURATION_MS = 100;
const CHANNEL_BAR_HEIGHT_CLASS = 'h-2'; 

const BattleParticipantCard: React.FC<BattleParticipantCardProps> = React.memo(({ 
  participant, 
  type, 
  onClick, 
  isTargetable, 
  onSetTarget, 
  isSelectedTarget,
  displayMode = 'card' 
}) => {
  const { gameState, staticData } = useGameContext();
  const stats = participant.calculatedStats;
  const maxHp = stats.maxHp;
  const battleHero = type === 'hero' ? (participant as BattleHero) : null;
  const battleEnemy = type === 'enemy' ? (participant as BattleEnemy) : null;

  const [isAttacking, setIsAttacking] = useState(false);
  const [internalDisplayMode, setInternalDisplayMode] = useState<DisplayModeInternal>('ALIVE');
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
  const specialCastTimeoutRef = useRef<number | null>(null);
  const hitReactionTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (internalDisplayMode === 'ALIVE') {
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
  }, [participant.currentHp, battleHero?.currentEnergyShield, battleEnemy?.currentEnergyShield, internalDisplayMode]);

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
            const progress = Math.min(1, elapsedTime / CHANNEL_BAR_ANIMATION_DURATION_MS); 
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
      setInternalDisplayMode('SHOWING_LOOT');
    } else if (participant.currentHp <= 0 && internalDisplayMode === 'ALIVE') {
      setInternalDisplayMode('DYING');
    } else if (participant.currentHp > 0 && internalDisplayMode !== 'ALIVE') {
      setInternalDisplayMode('ALIVE');
    }
  }, [participant.currentHp, (participant as BattleEnemy).isDying, (participant as BattleEnemy).dyingTicksRemaining, internalDisplayMode, type]);

  useEffect(() => {
    setIsVisuallyStunned(participant.statusEffects?.some(effect => effect.type === StatusEffectType.STUN && effect.remainingDurationMs > 0) || false);
  }, [participant.statusEffects]);

  useEffect(() => {
    return () => {
      if (attackAnimationTimeoutRef.current) clearTimeout(attackAnimationTimeoutRef.current);
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

  let cardBaseStyle = 'relative overflow-visible transition-all duration-200 flex flex-col justify-between';
  if (displayMode === 'card') {
    cardBaseStyle += ' p-3 rounded-lg shadow-md glass-effect border-2 h-full';
  } else { 
    cardBaseStyle += ' p-1 items-center flex flex-col w-24'; 
  }

  let cardClasses = [
    cardBaseStyle,
    type === 'hero' ? 'border-sky-500' : 'border-red-500',
    isAttacking && internalDisplayMode === 'ALIVE' && !participant.channelingState ? 'attacking' : '',
    (internalDisplayMode === 'DYING' && type === 'hero') ? 'animate-death' :
    (internalDisplayMode === 'SHOWING_LOOT' && type === 'enemy') ? 'opacity-0 transition-opacity duration-500 delay-300 pointer-events-none' : 
    (internalDisplayMode === 'DYING' && type === 'enemy') ? 'opacity-50' : 
    'opacity-100',
    isCastingSpecial && internalDisplayMode === 'ALIVE' && !participant.channelingState ? `animate-special-cast ${type === 'hero' ? 'hero-cast-pulse' : 'enemy-cast-pulse'}` : '',
    isTakingCrit && internalDisplayMode === 'ALIVE' ? 'target-crit-flash' : (isTakingHit && internalDisplayMode === 'ALIVE' ? 'target-hit-flash' : ''),
    isTakingShieldHit && internalDisplayMode === 'ALIVE' ? 'target-shield-flash' : '',
    isBeingHealed && internalDisplayMode === 'ALIVE' ? 'target-healed-flash' : '',
    isVisuallyStunned && internalDisplayMode === 'ALIVE' ? 'status-stunned-pulse' : '',
    isTargetable && internalDisplayMode === 'ALIVE' && type === 'hero' ? 'cursor-pointer hover:ring-2 hover:ring-green-400' : '',
    isSelectedTarget && internalDisplayMode === 'ALIVE' && type === 'enemy' ? 'ring-2 ring-orange-500 shadow-orange-400/50' : '',
    type === 'enemy' && internalDisplayMode === 'ALIVE' && !isTargetable && !isSelectedTarget ? 'cursor-pointer hover:ring-2 hover:ring-orange-400' : '',
    participant.channelingState ? 'ring-2 ring-purple-400 shadow-purple-500/40' : ''
  ].filter(Boolean).join(' ');


  if (type === 'enemy' && internalDisplayMode === 'SHOWING_LOOT') {
    const lootInfo = gameState.battleState?.defeatedEnemiesWithLoot[participant.uniqueBattleId];
    const Icon = ICONS[lootInfo?.originalIconName || 'ENEMY'];
    const lootDisplayStyle = displayMode === 'grid' 
      ? "p-0.5 rounded bg-slate-800/80 border border-slate-700/40 text-center w-24 h-28 flex flex-col items-center justify-center" 
      : "p-3 rounded-lg shadow-md glass-effect border-2 border-slate-700/50 bg-slate-800/70 h-full flex flex-col justify-center items-center opacity-80 hover:opacity-100 transition-opacity"; 

    return (
      <div id={`participant-card-${participant.uniqueBattleId}`} className={lootDisplayStyle}> 
        {Icon && <Icon className={`mb-0.5 ${displayMode === 'grid' ? 'w-7 h-7 text-slate-500' : 'w-10 h-10 text-slate-500'}`} />}
        {lootInfo && lootInfo.loot.length > 0 ? (
          lootInfo.loot.map((item, index) => {
            const LootItemIcon = ICONS[item.resource];
            return (
              <div key={index} className={`flex items-center ${displayMode === 'grid' ? 'text-[9px] justify-center' : 'text-xs'} text-yellow-300 leading-tight`}>
                {LootItemIcon && <LootItemIcon className={`w-2.5 h-2.5 mr-0.5 ${RESOURCE_COLORS[item.resource] || 'text-yellow-200'}`} />}
                {formatNumber(item.amount)} {item.resource.replace(/_/g, ' ').substring(0,5)}
              </div>
            );
          })
        ) : (
          <p className={`${displayMode === 'grid' ? 'text-[9px]' : 'text-xs'} text-slate-400 italic`}>No loot</p>
        )}
      </div>
    );
  }
  if (type === 'enemy' && internalDisplayMode === 'DYING') {
     return (
        <div id={`participant-card-${participant.uniqueBattleId}`} className={cardClasses} style={{pointerEvents: 'none'}}> 
          {displayMode === 'grid' && ICONS[participant.iconName] && React.createElement(ICONS[participant.iconName], { className: "w-12 h-12 text-red-700 opacity-50"})}
        </div>
    );
  }


  const handleCardClick = () => {
    if (onClick) {
      onClick();
    } else if (onSetTarget && type === 'enemy' && internalDisplayMode === 'ALIVE') {
      if (isSelectedTarget) {
        onSetTarget(null);
      } else {
        onSetTarget(participant.uniqueBattleId);
      }
    }
  };

  const activeStatusEffects = participant.statusEffects?.filter(se => se.remainingDurationMs > 0) || [];
  const ParticipantIcon = ICONS[participant.iconName];

  const gridSpecificIconClass = displayMode === 'grid' ? 'w-12 h-12' : 'w-6 h-6'; 
  const gridSpecificSpecialAttackIconClass = displayMode === 'grid' ? 'special-attack-icon w-2.5 h-2.5' : 'special-attack-icon';
  const gridSpecificSpecialAttackContainerPadding = displayMode === 'grid' ? 'px-0.5 py-px text-[9px]' : 'px-1.5 py-0.5 text-xs';


  return (
    <div
      id={`participant-card-${participant.uniqueBattleId}`} 
      className={cardClasses}
      onClick={handleCardClick}
      role="button"
      tabIndex={(onClick || (type === 'enemy' && onSetTarget)) ? 0 : -1}
      onKeyDown={(e) => { if((onClick || (type === 'enemy' && onSetTarget)) && (e.key === 'Enter' || e.key === ' ')) handleCardClick() }}
      aria-label={onClick ? `Use selected potion on ${participant.name}` : (type === 'enemy' && onSetTarget ? `Target ${participant.name}` : `${participant.name} card`)}
      aria-pressed={type === 'enemy' && isSelectedTarget ? true : undefined}
    >
      <div className={`${internalDisplayMode === 'DYING' ? 'opacity-0 transition-opacity duration-300 delay-200' : 'opacity-100'} w-full flex flex-col`}>
        {displayMode === 'grid' && ParticipantIcon && (
          <div className="mb-px"> 
            <ParticipantIcon className={`${gridSpecificIconClass} mx-auto ${type === 'hero' ? 'text-sky-400' : 'text-red-400'}`} />
          </div>
        )}
        <ParticipantInfoHeader 
            participant={participant} 
            type={type} 
            isVisuallyStunned={isVisuallyStunned} 
        />

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
              <span className={`relative z-10 font-medium text-white pointer-events-none text-on-bar truncate px-1 ${displayMode === 'grid' ? 'text-[8px]' : 'text-xs'}`} style={{lineHeight: 'normal'}}>
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
            displayMode={internalDisplayMode}
            formatNumber={formatNumber}
            participant={participant}
            currentAnimatedShield={currentAnimatedShield}
            maxShield={participant.calculatedStats.maxEnergyShield}
        />
      </div>
    </div>
  );
});

export default BattleParticipantCard;