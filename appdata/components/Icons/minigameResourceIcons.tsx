import React from 'react';
import { IconComponent } from '../../types';
import { createIcon } from './helpers';

const MINIGAME_CRYSTAL_PATH_DATA = "M10 2l-1.447.904L5 6.472l1.447 3.528L10 13l3.553-3L15 6.472 11.447 2.904 10 2zm0 2.618L11.727 6l-1.727.882L10 8.618l-.882-1.736-1.727-.882L10 4.618zM6 15h8v2H6v-2z";
const MinigameCrystalIconComponent = createIcon(MINIGAME_CRYSTAL_PATH_DATA);

export const MINIGAME_RESOURCE_ICONS: Record<string, IconComponent> = {
  MINIGAME_DIRT: createIcon("M5 10c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2v-2c0-1.1-.9-2-2-2H5zm0 1h10v2H5v-2zM10 3a1 1 0 011 1v2h-2V4a1 1 0 011-1z"),
  MINIGAME_CLAY: createIcon("M4 8a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V8zm2 1h8v2H6V9z"), 
  MINIGAME_SAND: createIcon(
    <>
      <circle cx="7" cy="7" r="1" /> <circle cx="10" cy="7" r="1" /> <circle cx="13" cy="7" r="1" />
      <circle cx="6" cy="10" r="1" /> <circle cx="9" cy="10" r="1" /> <circle cx="12" cy="10" r="1" /> <circle cx="15" cy="10" r="1" />
      <circle cx="7" cy="13" r="1" /> <circle cx="10" cy="13" r="1" /> <circle cx="13" cy="13" r="1" />
    </>
  ),
  MINIGAME_ESSENCE: createIcon("M10 3l1.45 3.55L15 8l-3.55 1.45L10 13l-1.45-3.55L5 8l3.55-1.45L10 3z"),
  MINIGAME_CRYSTAL: MinigameCrystalIconComponent,
  MINIGAME_EMERALD: (props: React.SVGProps<SVGSVGElement>) => React.cloneElement(<MinigameCrystalIconComponent {...props} />, { style: { ...(props.style || {}), color: '#34D399' } } as any),
  MINIGAME_RUBY: (props: React.SVGProps<SVGSVGElement>) => React.cloneElement(<MinigameCrystalIconComponent {...props} />, { style: { ...(props.style || {}), color: '#F87171' } } as any),
  MINIGAME_SAPPHIRE: (props: React.SVGProps<SVGSVGElement>) => React.cloneElement(<MinigameCrystalIconComponent {...props} />, { style: { ...(props.style || {}), color: '#60A5FA' } } as any),
  GOLD_ORE_ICON: createIcon("M10 2L6 6v8l4 4 4-4V6l-4-4zm0 2l2 2-2 2-2-2 2-2z"),
  DIAMOND_ORE_ICON: createIcon("M10 2l-1.447.904L5 6.472l1.447 3.528L10 13l3.553-3L15 6.472 11.447 2.904 10 2zm0 2.618L11.727 6l-1.727.882L10 8.618l-.882-1.736-1.727-.882L10 4.618z"), // Same as CRYSTALS
  DIRT_ICON: createIcon("M5 10c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2v-2c0-1.1-.9-2-2-2H5zm0 1h10v2H5v-2zM10 3a1 1 0 011 1v2h-2V4a1 1 0 011-1z"),
};