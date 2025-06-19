
import React from 'react';
import { AutoBattlerState, AutoBattlerBuildingType } from '../types';
import { 
    AUTOBATTLER_MINIMAP_WIDTH, 
    AUTOBATTLER_MINIMAP_HEIGHT,
    AUTOBATTLER_MINIMAP_PLAYER_COLOR,
    AUTOBATTLER_MINIMAP_ENEMY_COLOR,
    AUTOBATTLER_MINIMAP_BUILDING_COLOR,
    AUTOBATTLER_MINIMAP_VIEWPORT_BORDER_COLOR,
    AUTOBATTLER_MINIMAP_VIEWPORT_FILL_COLOR,
    PLAYER_GRID_DISPLAY_WIDTH,
    AUTOBATTLER_BATTLE_PATH_WIDTH, // May not be needed directly if worldWidth is used
    PLAYER_GRID_CELL_WIDTH_PX, // For building size calculation relative to cell
    PLAYER_GRID_CELL_HEIGHT_PX // For building size calculation relative to cell
} from '../constants';

interface AutoBattlerMinimapProps {
  autoBattlerState: AutoBattlerState | null;
  onMinimapClick: (worldX: number, worldY: number) => void;
  worldWidth: number; // New prop
  worldHeight: number; // New prop
  camera: { x: number; y: number };
  viewportWidth: number;
  viewportHeight: number;
}

const AutoBattlerMinimap: React.FC<AutoBattlerMinimapProps> = ({
  autoBattlerState,
  onMinimapClick,
  worldWidth, // Use this
  worldHeight, // Use this
  camera,
  viewportWidth,
  viewportHeight,
}) => {
  if (!autoBattlerState) return null;

  // Scales for converting world coordinates to minimap pixels (if needed for fixed size elements)
  const scaleX = AUTOBATTLER_MINIMAP_WIDTH / worldWidth;
  const scaleY = AUTOBATTLER_MINIMAP_HEIGHT / worldHeight;
  
  const dotSize = 2; // Absolute pixel size for unit dots
  const buildingDotSize = 3; // Absolute pixel size for building dots

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const clickMiniX = event.clientX - rect.left;
    const clickMiniY = event.clientY - rect.top;

    // Convert minimap click (pixels) back to world coordinates
    const targetWorldX = clickMiniX / scaleX;
    const targetWorldY = clickMiniY / scaleY;
    
    onMinimapClick(targetWorldX, targetWorldY);
  };

  return (
    <div
      className="bg-slate-900/70 border border-slate-500 rounded shadow-lg cursor-pointer"
      style={{
        width: `${AUTOBATTLER_MINIMAP_WIDTH}px`,
        height: `${AUTOBATTLER_MINIMAP_HEIGHT}px`,
        position: 'relative', 
      }}
      onClick={handleClick}
      aria-label="Minimap - Click to move view"
      role="button"
    >
      {/* Player Grid Area Background */}
      <div
        className="absolute bg-slate-700/50"
        style={{
          left: 0,
          top: 0,
          width: `${(PLAYER_GRID_DISPLAY_WIDTH / worldWidth) * 100}%`,
          height: `100%`, 
        }}
      />
      {/* Battle Path Area Background */}
      <div
        className="absolute bg-slate-800/50"
        style={{
          left: `${(PLAYER_GRID_DISPLAY_WIDTH / worldWidth) * 100}%`,
          top: 0,
          width: `${((worldWidth - PLAYER_GRID_DISPLAY_WIDTH) / worldWidth) * 100}%`,
          height: `100%`, 
        }}
      />

      {/* Player Buildings */}
      {autoBattlerState.grid.flat().map(building => {
        if (!building || building.x === undefined || building.y === undefined) return null;
        return (
          <div
            key={`mini-pb-${building.id}`}
            className="absolute"
            style={{
              left: `${(building.x / worldWidth) * 100}%`,
              top: `${(building.y / worldHeight) * 100}%`,
              width: `${buildingDotSize}px`,
              height: `${buildingDotSize}px`,
              transform: 'translate(-50%, -50%)',
              backgroundColor: AUTOBATTLER_MINIMAP_BUILDING_COLOR,
              borderRadius: '1px',
            }}
            title={`${building.type}`}
          />
        );
      })}

      {/* Enemy Towers & Base */}
      {[...autoBattlerState.enemyTowers, autoBattlerState.enemyBase].map(structure => {
        if (!structure || !structure.hp || structure.hp <= 0 || structure.x === undefined || structure.y === undefined) return null;
        const structureSize = 4; 
        return (
          <div
            key={`mini-es-${structure.id}`}
            className="absolute"
            style={{
              left: `${(structure.x / worldWidth) * 100}%`,
              top: `${(structure.y / worldHeight) * 100}%`,
              width: `${structureSize}px`,
              height: `${structureSize}px`,
              transform: 'translate(-50%, -50%)',
              backgroundColor: AUTOBATTLER_MINIMAP_ENEMY_COLOR,
              borderRadius: '1px',
            }}
            title={`${structure.type}`}
          />
        );
      })}

      {/* Player Units */}
      {autoBattlerState.playerUnits.map(unit => (
        unit.hp > 0 &&
        <div
          key={`mini-pu-${unit.instanceId}`}
          className="absolute rounded-full"
          style={{
            left: `${(unit.x / worldWidth) * 100}%`,
            top: `${(unit.y / worldHeight) * 100}%`,
            width: `${dotSize}px`,
            height: `${dotSize}px`,
            transform: 'translate(-50%, -50%)',
            backgroundColor: AUTOBATTLER_MINIMAP_PLAYER_COLOR,
          }}
          title={`Player Unit`}
        />
      ))}

      {/* Enemy Units */}
      {autoBattlerState.enemyUnits.map(unit => (
         unit.hp > 0 &&
        <div
          key={`mini-eu-${unit.instanceId}`}
          className="absolute rounded-full"
          style={{
            left: `${(unit.x / worldWidth) * 100}%`,
            top: `${(unit.y / worldHeight) * 100}%`,
            width: `${dotSize}px`,
            height: `${dotSize}px`,
            transform: 'translate(-50%, -50%)',
            backgroundColor: AUTOBATTLER_MINIMAP_ENEMY_COLOR,
          }}
          title={`Enemy Unit`}
        />
      ))}

      {/* Camera Viewport Rectangle */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: `${(camera.x / worldWidth) * 100}%`,
          top: `${(camera.y / worldHeight) * 100}%`,
          width: `${(viewportWidth / worldWidth) * 100}%`,
          height: `${(viewportHeight / worldHeight) * 100}%`,
          border: `1px solid ${AUTOBATTLER_MINIMAP_VIEWPORT_BORDER_COLOR}`,
          backgroundColor: AUTOBATTLER_MINIMAP_VIEWPORT_FILL_COLOR,
        }}
        title="Current View"
      />
    </div>
  );
};

export default AutoBattlerMinimap;
