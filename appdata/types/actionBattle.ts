import { Cost, ParticleEvent, Projectile, CanvasParticle } from './common';
import { BattleHero, BattleEnemy, AttackEvent } from './battle';

export interface ActionBattleState {
    heroInstances: BattleHero[];
    enemyInstances: BattleEnemy[];
    controlledHeroId: string | null;
    isAutoBattleActive: boolean;
    status: 'IDLE' | 'PREPARING' | 'FIGHTING' | 'VICTORY' | 'DEFEAT';
    currentWaveNumber: number;
    timeToNextWave: number;
    waveTimerMaxTicks: number;
    waveTimerRemainingTicks: number;
    maxConcurrentEnemies: number;
    keysPressed: Record<string, boolean>;
    lastAttackEvents: AttackEvent[];
    lastParticleEffectEvents: ParticleEvent[]; // To be phased out for canvas effects
    activeCanvasParticles: CanvasParticle[];
    activeProjectiles: Projectile[];
    currentColosseumLoot: Cost[];
    currentColosseumExpForPool: number;
}

export interface ColosseumWaveDefinition {
  waveNumber: number;
  enemies: Array<{ enemyId: string; count: number }>;
}
