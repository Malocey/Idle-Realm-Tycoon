
import React, { useEffect, useState, useRef } from 'react';
import { useGameContext } from '../context';
import Button from '../components/Button';
import { ICONS } from '../components/Icons';
import { BattleEnemy, BattleHero, AttackEvent, Projectile, ResourceType, Cost, CanvasParticle, ActionBattleAISystem } from '../types'; 
import { formatNumber } from '../utils';
import { GAME_TICK_MS, RESOURCE_COLORS, PARTICIPANT_SIZE_UNITS, ARENA_HEIGHT_UNITS, ARENA_WIDTH_UNITS, PROJECTILE_SIZE_PX, MAX_PROJECTILE_TRAIL_SEGMENTS } from '../constants';
import GameCanvas from '../components/GameCanvas';

const DAMAGE_POPUP_ANIMATION_DURATION_MS = 1500;
const WAVE_ANNOUNCEMENT_DURATION_MS = 2000;


interface DamagePopupData {
  id: string;
  amount: number;
  isCrit: boolean;
  x: number; 
  y: number;
  timestamp: number; 
  isHeal?: boolean;
}

interface WaveAnnouncement {
    text: string;
    type: 'wave-starting' | 'wave-cleared' | 'defeated';
    key: string;
}


const EnemyHealthBar: React.FC<{ currentHp: number; maxHp: number }> = ({ currentHp, maxHp }) => {
  const percentage = maxHp > 0 ? Math.max(0, (currentHp / maxHp) * 100) : 0;
  return (
    <div className="enemy-health-bar-colosseum"> 
      <div style={{ width: `${percentage}%` }}></div>
    </div>
  );
};

const HeroHealthBar: React.FC<{ currentHp: number; maxHp: number }> = ({ currentHp, maxHp }) => {
    const percentage = maxHp > 0 ? Math.max(0, (currentHp / maxHp) * 100) : 0;
    return (
      <div className="hero-health-bar-colosseum"> 
        <div style={{ width: `${percentage}%` }}></div>
      </div>
    );
  };


const ActionBattleView: React.FC = () => {
  const { gameState, dispatch, staticData } = useGameContext(); 
  const { actionBattleState, actionBattleAISystem } = gameState; // Destructure actionBattleAISystem
  const [damagePopups, setDamagePopups] = useState<DamagePopupData[]>([]);
  const [activeCanvasParticles, setActiveCanvasParticles] = useState<CanvasParticle[]>([]);
  
  const lastAttackEventsRef = useRef<AttackEvent[]>([]);
  
  const [waveAnnouncement, setWaveAnnouncement] = useState<WaveAnnouncement | null>(null);
  const announcementTimeoutRef = useRef<number | null>(null);
  const prevStatusRef = useRef(actionBattleState?.status);
  const prevWaveNumberRef = useRef(actionBattleState?.currentWaveNumber);


  useEffect(() => {
    if (!actionBattleState) return;

    const newAttackEvents = actionBattleState.lastAttackEvents.filter(
      event => !lastAttackEventsRef.current.find(prevEvent => prevEvent.timestamp === event.timestamp && prevEvent.targetId === event.targetId && prevEvent.attackerId === event.attackerId && prevEvent.isHeal === event.isHeal)
    );

    if (newAttackEvents.length > 0) {
      const newPopups: DamagePopupData[] = [];
      const newCanvasParticlesBatch: CanvasParticle[] = [];

      newAttackEvents.forEach(event => {
        const targetParticipant = 
            actionBattleState.heroInstances.find(h => h.uniqueBattleId === event.targetId) || 
            actionBattleState.enemyInstances.find(e => e.uniqueBattleId === event.targetId);
        
        if (targetParticipant) {
            // For DOM popups, position relative to the participant's top-left in arena units
            newPopups.push({
                id: `${event.timestamp}-${event.targetId}-${event.isHeal ? 'heal' : 'dmg'}-${Math.random()}`,
                amount: event.isHeal ? (event.healAmount || 0) : event.damage,
                isCrit: event.isCrit,
                isHeal: event.isHeal,
                x: (targetParticipant.x || 0) + PARTICIPANT_SIZE_UNITS / 2, // Center of participant
                y: (targetParticipant.y || 0), // Top of participant
                timestamp: Date.now() 
            });

            // Generate Canvas Particles
            const spawnX = (targetParticipant.x || 0) + PARTICIPANT_SIZE_UNITS / 2;
            const spawnY = (targetParticipant.y || 0) + PARTICIPANT_SIZE_UNITS / 2;
            let particleCount = 0;
            let baseColorString = "";
            let baseSize = 0;
            let speedMagnitude = 0;
            let particleType: CanvasParticle['type'] = 'hit';

            if (event.isHeal) {
                particleCount = 8 + Math.floor(Math.random() * 5); // 8-12 heal particles
                baseColorString = `100, 255, 100`; // Bright green for heal
                baseSize = 2.5; // Slightly larger for heal particles
                speedMagnitude = 60; 
                particleType = 'heal_custom'; // Use specific type for canvas heal
            } else if (event.isCrit) {
                particleCount = 10 + Math.floor(Math.random() * 6); 
                baseColorString = `255, ${100 + Math.random()*80}, 0`; 
                baseSize = 2.8;
                speedMagnitude = 130;
                particleType = 'crit';
            } else { 
                particleCount = 6 + Math.floor(Math.random() * 5); 
                baseColorString = `255, 255, ${180 + Math.random()*55}`; 
                baseSize = 2.0;
                speedMagnitude = 90;
                particleType = 'hit';
            }
            
            for (let i = 0; i < particleCount; i++) {
                const angle = Math.random() * Math.PI * 2;
                const currentSpeed = speedMagnitude * (0.6 + Math.random() * 0.8); 
                const life = 350 + Math.random() * 450; 

                newCanvasParticlesBatch.push({
                    id: `cvs-p-${Date.now()}-${Math.random().toString(16).slice(2)}`,
                    x: spawnX,
                    y: spawnY,
                    size: baseSize * (0.7 + Math.random() * 0.6),
                    color: `rgba(${baseColorString}, ${0.6 + Math.random() * 0.4})`, // Add some alpha variation
                    velocityX: Math.cos(angle) * currentSpeed,
                    velocityY: particleType === 'heal_custom' 
                        ? -currentSpeed * (0.7 + Math.random() * 0.6) // Heal particles float up strongly
                        : Math.sin(angle) * currentSpeed - (speedMagnitude * 0.2), // Damage particles burst with more upward bias
                    life: life,
                    type: particleType,
                });
            }
        }
      });


      setDamagePopups(prev => [...prev, ...newPopups].slice(-12)); 
      newPopups.forEach(popup => {
        setTimeout(() => {
          setDamagePopups(current => current.filter(p => p.id !== popup.id));
        }, DAMAGE_POPUP_ANIMATION_DURATION_MS);
      });

      if (newCanvasParticlesBatch.length > 0) {
          setActiveCanvasParticles(prev => [...prev, ...newCanvasParticlesBatch].slice(-60)); 
      }
    }
    lastAttackEventsRef.current = [...actionBattleState.lastAttackEvents];

  }, [actionBattleState?.lastAttackEvents, actionBattleState?.heroInstances, actionBattleState?.enemyInstances]);


  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
        if (!gameState.actionBattleState || gameState.actionBattleState.status !== 'FIGHTING' || !gameState.actionBattleState.controlledHeroId) return;

        if (gameState.actionBattleState.isAutoBattleActive) return;

        let keyProcessed = false;
        switch (event.key.toLowerCase()) {
            case 'w': 
            case 'a': 
            case 's': 
            case 'd': 
                dispatch({ type: 'ACTION_BATTLE_SET_KEY_PRESSED', payload: { key: event.key.toLowerCase(), pressed: true } });
                keyProcessed = true; 
                break;
            case ' ': 
                event.preventDefault(); 
                dispatch({ type: 'ACTION_BATTLE_HERO_USE_SPECIAL' }); 
                keyProcessed = true; 
                break;
        }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
        if (!gameState.actionBattleState || !gameState.actionBattleState.controlledHeroId) return;
        if (gameState.actionBattleState.isAutoBattleActive) return;

        const key = event.key.toLowerCase();
        if (['w', 'a', 's', 'd'].includes(key)) {
            dispatch({ type: 'ACTION_BATTLE_SET_KEY_PRESSED', payload: { key, pressed: false } });
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (gameState.actionBattleState?.keysPressed) {
        Object.keys(gameState.actionBattleState.keysPressed).forEach(key => {
            if (gameState.actionBattleState!.keysPressed[key]) {
                 dispatch({ type: 'ACTION_BATTLE_SET_KEY_PRESSED', payload: { key, pressed: false } });
            }
        });
      }
    };
  }, [dispatch, gameState.actionBattleState?.status, gameState.actionBattleState?.controlledHeroId, gameState.actionBattleState?.isAutoBattleActive]); 

  useEffect(() => {
      return () => {
        if (gameState.actionBattleState) { 
            if (gameState.actionBattleState.keysPressed) {
                Object.keys(gameState.actionBattleState.keysPressed).forEach(key => {
                    if (gameState.actionBattleState!.keysPressed[key]) {
                        dispatch({ type: 'ACTION_BATTLE_SET_KEY_PRESSED', payload: { key, pressed: false } });
                    }
                });
            }
        }
      }
  }, [dispatch, gameState.actionBattleState]);

  useEffect(() => {
    if (!actionBattleState) return;
    const { status, currentWaveNumber } = actionBattleState;

    if (announcementTimeoutRef.current) {
        clearTimeout(announcementTimeoutRef.current);
        announcementTimeoutRef.current = null;
    }

    let newAnnouncement: WaveAnnouncement | null = null;

    if (prevStatusRef.current !== 'PREPARING' && status === 'PREPARING' && currentWaveNumber > 0) {
        newAnnouncement = { text: `Wave ${currentWaveNumber} Cleared!`, type: 'wave-cleared', key: `wave-cleared-${currentWaveNumber}-${Date.now()}` };
    } else if (prevWaveNumberRef.current !== currentWaveNumber && status === 'FIGHTING' && currentWaveNumber > 0) {
        newAnnouncement = { text: `Wave ${currentWaveNumber} Starting!`, type: 'wave-starting', key: `wave-starting-${currentWaveNumber}-${Date.now()}` };
    } else if (prevStatusRef.current !== 'DEFEAT' && status === 'DEFEAT') {
        newAnnouncement = { text: `--- DEFEATED ---`, type: 'defeated', key: `defeated-${currentWaveNumber}-${Date.now()}` };
    }

    if (newAnnouncement) {
        setWaveAnnouncement(newAnnouncement);
        announcementTimeoutRef.current = window.setTimeout(() => {
            setWaveAnnouncement(null);
        }, WAVE_ANNOUNCEMENT_DURATION_MS);
    }
    prevStatusRef.current = status;
    prevWaveNumberRef.current = currentWaveNumber;

  }, [actionBattleState?.status, actionBattleState?.currentWaveNumber]);


  if (!actionBattleState) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-3xl font-bold text-sky-400 mb-4">Colosseum</h2>
        <p className="text-slate-300">No active battle. Start one from the Town.</p>
      </div>
    );
  }

  const { heroInstances, enemyInstances, controlledHeroId, isAutoBattleActive, status, currentWaveNumber, waveTimerRemainingTicks, waveTimerMaxTicks, activeProjectiles } = actionBattleState;
  const controlledHero = heroInstances.find(h => h.uniqueBattleId === controlledHeroId);
  const waveTimerPercentage = waveTimerMaxTicks > 0 ? (waveTimerRemainingTicks / waveTimerMaxTicks) * 100 : 0;
  const currentAISystemText = actionBattleAISystem === 'legacy' ? 'Legacy AI' : 'Behavior Tree AI';


  return (
    <div className="p-1 sm:p-2 flex flex-col h-[calc(100vh-90px)] bg-slate-800/50">
      <div className="flex justify-between items-center mb-2 px-2">
        <h2 className="text-lg sm:text-xl font-bold text-amber-400">Colosseum - Wave {currentWaveNumber}</h2>
        <div className="flex items-center gap-2">
            <span className={`text-sm font-medium ${actionBattleAISystem === 'legacy' ? 'text-sky-300' : 'text-green-300'}`}>{currentAISystemText}</span>
            <Button onClick={() => dispatch({type: 'TOGGLE_ACTION_BATTLE_AI_SYSTEM'})} variant="secondary" size="sm" className="px-2 py-1 text-xs">Switch AI</Button>
            <Button onClick={() => dispatch({type: 'ACTION_BATTLE_TOGGLE_AUTO_MODE'})} variant={isAutoBattleActive ? "success" : "secondary"} size="sm" className="px-2 py-1 text-xs">
              {isAutoBattleActive ? 'Auto: ON' : 'Auto: OFF'}
            </Button>
            <Button onClick={() => dispatch({ type: 'END_ACTION_BATTLE' })} variant="danger" size="sm" className="px-2 py-1 text-xs">
              Leave
            </Button>
        </div>
      </div>
      {/* Wave Timer */}
      {status === 'FIGHTING' && waveTimerMaxTicks > 0 && (
          <div className="w-full bg-slate-700 rounded-full h-2.5 mb-2 overflow-hidden">
              <div 
                  className="bg-amber-500 h-2.5 rounded-full transition-all duration-100 ease-linear"
                  style={{ width: `${waveTimerPercentage}%`}}
              ></div>
          </div>
      )}
      
      {/* Battle Arena */}
      <div
        className="relative flex-grow bg-slate-900/70 border-2 border-slate-700 rounded-lg shadow-inner overflow-hidden"
        style={{ width: `${ARENA_WIDTH_UNITS}px`, height: `${ARENA_HEIGHT_UNITS}px`, margin: '0 auto' }}
        role="application"
        aria-label="Battle Arena"
      >
        <GameCanvas 
            particles={activeCanvasParticles} 
            setParticles={setActiveCanvasParticles}
            projectiles={activeProjectiles}
            width={ARENA_WIDTH_UNITS}
            height={ARENA_HEIGHT_UNITS}
        />
        {/* Heroes */}
        {heroInstances.map(hero => {
          if (hero.currentHp <= 0) return null;
          const isControlled = hero.uniqueBattleId === controlledHeroId && !isAutoBattleActive;
          return (
            <div
              key={hero.uniqueBattleId}
              className={`colosseum-participant absolute transition-all duration-100 ease-out
                          ${isControlled ? 'ring-2 ring-yellow-400 z-10' : ''}
                          ${hero.isAttackingTicksRemaining && hero.isAttackingTicksRemaining > 0 ? `attacking-visual-colosseum ${hero.attackType.toLowerCase()}` : ''}
                          ${hero.statusEffects.some(se => se.type === 'STUN') ? 'status-stunned-pulse' : ''}
                          ${hero.definitionId === 'CLERIC' && hero.isAttackingTicksRemaining && hero.isAttackingTicksRemaining > 0 ? 'animate-cleric-heal-cast-colosseum' : ''}
                         `}
              style={{
                left: `${hero.x}px`,
                top: `${hero.y}px`,
                width: `${PARTICIPANT_SIZE_UNITS}px`,
                height: `${PARTICIPANT_SIZE_UNITS}px`,
              }}
              title={`${hero.name} (HP: ${formatNumber(hero.currentHp)}/${formatNumber(hero.calculatedStats.maxHp)})`}
            >
              {ICONS[hero.iconName] && React.createElement(ICONS[hero.iconName], { className: `w-full h-full ${isControlled ? 'text-yellow-300' : 'text-sky-300'}`})}
              <HeroHealthBar currentHp={hero.currentHp} maxHp={hero.calculatedStats.maxHp} />
            </div>
          );
        })}

        {/* Player Controlled Hero Targeting Reticle */}
        {controlledHero && controlledHero.potentialTargetId && !isAutoBattleActive &&
          (() => {
            const targetEnemy = enemyInstances.find(e => e.uniqueBattleId === controlledHero.potentialTargetId);
            if (targetEnemy && targetEnemy.currentHp > 0 && !targetEnemy.isDying) {
              const reticleSize = PARTICIPANT_SIZE_UNITS * 1.2;
              return (
                <svg
                  className="absolute pointer-events-none"
                  style={{
                    left: `${targetEnemy.x + PARTICIPANT_SIZE_UNITS / 2 - reticleSize / 2}px`,
                    top: `${targetEnemy.y + PARTICIPANT_SIZE_UNITS / 2 - reticleSize / 2}px`,
                    width: `${reticleSize}px`,
                    height: `${reticleSize}px`,
                    zIndex: 15
                  }}
                  viewBox={`0 0 ${reticleSize} ${reticleSize}`}
                >
                  <circle cx={reticleSize/2} cy={reticleSize/2} r={reticleSize/2 - 1} className="potential-target-reticle" />
                </svg>
              );
            }
            return null;
          })()
        }


        {/* Enemies */}
        {enemyInstances.map(enemy => {
            if (enemy.currentHp <= 0 && !enemy.isDying) return null;
            const isDyingClass = enemy.isDying ? 'animate-enemy-death-colosseum' : '';
            return (
                <div
                    key={enemy.uniqueBattleId}
                    className={`colosseum-participant absolute transition-all duration-100 ease-out ${isDyingClass}
                                ${enemy.isAttackingTicksRemaining && enemy.isAttackingTicksRemaining > 0 ? `attacking-visual-colosseum ${enemy.attackType.toLowerCase()}` : ''}
                                ${enemy.statusEffects.some(se => se.type === 'STUN') ? 'status-stunned-pulse' : ''}
                                ${enemy.id === 'GOBLIN_SHAMAN' && enemy.isAttackingTicksRemaining && enemy.isAttackingTicksRemaining > 0 ? 'animate-cleric-heal-cast-colosseum' : ''}
                                `}
                    style={{
                    left: `${enemy.x}px`,
                    top: `${enemy.y}px`,
                    width: `${PARTICIPANT_SIZE_UNITS}px`,
                    height: `${PARTICIPANT_SIZE_UNITS}px`,
                    }}
                    title={`${enemy.name} (HP: ${formatNumber(enemy.currentHp)}/${formatNumber(enemy.calculatedStats.maxHp)})`}
                >
                    {ICONS[enemy.iconName] && React.createElement(ICONS[enemy.iconName], { className: "w-full h-full text-red-400" })}
                    {!enemy.isDying && <EnemyHealthBar currentHp={enemy.currentHp} maxHp={enemy.calculatedStats.maxHp} />}
                </div>
            );
        })}

        {/* Damage/Heal Popups - relative to participant positions */}
        {damagePopups.map(popup => (
          <div
            key={popup.id}
            className={`absolute text-sm font-bold pointer-events-none
                        ${popup.isHeal ? 'heal-popup' : (popup.isCrit ? 'damage-popup crit' : 'damage-popup')}
                        `}
            style={{
              left: `${popup.x}px`, // Arena units
              top: `${popup.y}px`,  // Arena units
            }}
          >
            {popup.isHeal ? '+' : ''}{formatNumber(popup.amount)}
          </div>
        ))}
        
        {/* Wave Announcement */}
        {waveAnnouncement && (
            <div key={waveAnnouncement.key} className={`colosseum-wave-announcement ${waveAnnouncement.type}`}>
                {waveAnnouncement.text}
            </div>
        )}

      </div>
    </div>
  );
};

export default ActionBattleView;
