import React from 'react';
import { ResourceType } from './enums';

export type Resources = Record<ResourceType, number>;

export interface Cost {
  resource: ResourceType;
  amount: number;
}

export interface Production {
  resource: ResourceType;
  amountPerTick: number;
}

export interface GameNotification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
  timestamp: number;
  iconName?: string;
}

export type IconComponent = React.FC<React.SVGProps<SVGSVGElement> & { name?: string, title?: string }>;

// For old DOM-based particle system (phasing out)
export interface ParticleEvent {
  id: string;
  type: 'hit' | 'crit';
  x: number;
  y: number;
  timestamp: number;
}

// For new Canvas-based particle & projectile system
export interface Projectile {
  id: string;
  attackerId: string;
  targetId: string;
  originX: number;
  originY: number;
  currentX: number;
  currentY: number;
  targetX: number;
  targetY: number;
  speed: number;
  damage: number;
  isCrit: boolean;
  iconName: string;
  rotation: number;
  previousPositions: Array<{ x: number; y: number; rotation: number; opacity: number }>;
}

export interface CanvasParticle {
  id: string;
  x: number;
  y: number;
  size: number;
  color: string;
  velocityX: number;
  velocityY: number;
  life: number; // e.g., in milliseconds or ticks
  type: 'hit' | 'crit' | 'heal_custom';
}