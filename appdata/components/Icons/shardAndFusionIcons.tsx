import React from 'react';
import { IconComponent } from '../../types';
import { createIcon } from './helpers';

export const SHARD_FUSION_ICONS: Record<string, IconComponent> = {
  SHARD_ATTACK_ICON: createIcon("M10 1l2.5 5.5L10 13l-2.5-6.5L10 1zm0 13l2.5 5.5L10 19l-2.5-5.5L10 14z"), 
  SHARD_HEALTH_ICON: createIcon("M10 18a8 8 0 100-16 8 8 0 000 16zm-1-5H9V7a1 1 0 112 0v6h-1v2a1 1 0 11-2 0v-2zm3-4a1 1 0 100-2 1 1 0 000 2z"), 
  SHARD_DEFENSE_ICON: createIcon("M9 2.029c.465-.093.947-.144 1.451-.144s.986.051 1.451-.144A10.946 10.946 0 0110 18c-4.418 0-8-3.582-8-8 0-1.08.216-2.106.601-3.046L9 2.029zM10 6a4 4 0 00-4 4v1h8v-1a4 4 0 00-4-4z"), 
  SHARD_ICON: createIcon("M10 2 L12.5 7 L10 12 L7.5 7 Z M10 12 L12.5 17 L10 18 L7.5 17 Z"), 
  FUSION_ICON: createIcon( 
    <>
      <path d="M6 10l4-4 4 4M10 16V3" />
      <path d="M15 13.25L12.5 11.5M15 13.25L17.5 11.5" /> 
      <path d="M5 13.25L2.5 11.5M5 13.25L7.5 11.5" />
      <path d="M10 7.25L12.5 5.5M10 7.25L7.5 5.5" />
    </>
  ),
};