
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
    AUTOBATTLER_BATTLE_PATH_WIDTH,
} from '../constants';

interface AutoBattlerMinimapProps {
  autoBattlerState: AutoBattlerState | null;
  onMinimapClick: (worldX: number, worldY: number) => void;
  worldWidth: number;
  worldHeight: number;
  camera: { x: number; y: number };
  viewportWidth: number;  // This will now be the dynamic viewportWidth from state
  viewportHeight: number; // This will now be the dynamic viewportHeight from state
}

const AutoBattlerMinimap: React.FC<AutoBattlerMinimapProps> = ({
  autoBattlerState,
  onMinimapClick,
  worldWidth,
  worldHeight,
  camera,
  viewportWidth,
  viewportHeight,
}) => {
  if (!autoBattlerState) return null;

  const scaleX = AUTOBATTLER_MINIMAP_WIDTH / worldWidth;
  const scaleY = AUTOBATTLER_MINIMAP_HEIGHT / worldHeight;
  const dotSize = 2; 

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const clickMiniX = event.clientX - rect.left;
    const clickMiniY = event.clientY - rect.top;

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
          width: `${PLAYER_GRID_DISPLAY_WIDTH * scaleX}px`,
          height: `${worldHeight * scaleY}px`, 
        }}
      />
      {/* Battle Path Area Background */}
      <div
        className="absolute bg-slate-800/50"
        style={{
          left: `${PLAYER_GRID_DISPLAY_WIDTH * scaleX}px`,
          top: 0,
          width: `${(worldWidth - PLAYER_GRID_DISPLAY_WIDTH) * scaleX}px`, // Ensure it fills the rest
          height: `${worldHeight * scaleY}px`, 
        }}
      />

      {/* Player Buildings */}
      {autoBattlerState.grid.flat().map(building => {
        if (!building || building.x === undefined || building.y === undefined) return null;
        const buildingSize = 3; 
        return (
          <div
            key={`mini-pb-${building.id}`}
            className="absolute"
            style={{
              left: `${building.x * scaleX - buildingSize / 2}px`,
              top: `${building.y * scaleY - buildingSize / 2}px`,
              width: `${buildingSize}px`,
              height: `${buildingSize}px`,
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
              left: `${structure.x * scaleX - structureSize / 2}px`,
              top: `${structure.y * scaleY - structureSize / 2}px`,
              width: `${structureSize}px`,
              height: `${structureSize}px`,
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
            left: `${unit.x * scaleX - dotSize / 2}px`,
            top: `${unit.y * scaleY - dotSize / 2}px`,
            width: `${dotSize}px`,
            height: `${dotSize}px`,
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
            left: `${unit.x * scaleX - dotSize / 2}px`,
            top: `${unit.y * scaleY - dotSize / 2}px`,
            width: `${dotSize}px`,
            height: `${dotSize}px`,
            backgroundColor: AUTOBATTLER_MINIMAP_ENEMY_COLOR,
          }}
          title={`Enemy Unit`}
        />
      ))}

      {/* Camera Viewport Rectangle */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: `${camera.x * scaleX}px`,
          top: `${camera.y * scaleY}px`,
          width: `${viewportWidth * scaleX}px`,   // Use prop directly
          height: `${viewportHeight * scaleY}px`, // Use prop directly
          border: `1px solid ${AUTOBATTLER_MINIMAP_VIEWPORT_BORDER_COLOR}`,
          backgroundColor: AUTOBATTLER_MINIMAP_VIEWPORT_FILL_COLOR,
        }}
        title="Current View"
      />
    </div>
  );
};

export default AutoBattlerMinimap;
