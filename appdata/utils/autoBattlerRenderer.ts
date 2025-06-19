
import { AutoBattlerState, AutoBattlerUnit, AutoBattlerBuilding, AutoBattlerBaseStructure, AutoBattlerBuildingType, DamagePopup, AutoBattlerEnemyTower } from '../types';
import { 
    ENEMY_TOWER_WIDTH, ENEMY_TOWER_HEIGHT,
    AUTOBATTLER_POPUP_DURATION_MS, AUTOBATTLER_POPUP_LIFT_DISTANCE, 
    AUTOBATTLER_POPUP_FONT_SIZE, AUTOBATTLER_POPUP_COLOR_DAMAGE, 
    AUTOBATTLER_POPUP_COLOR_CRIT_DAMAGE, AUTOBATTLER_POPUP_FONT,
    ENEMY_BASE_WIDTH,
    ENEMY_BASE_HEIGHT,
    AUTOBATTLER_PROGRESS_BAR_HEIGHT,
    AUTOBATTLER_PROGRESS_BAR_BG_COLOR,
    AUTOBATTLER_PROGRESS_BAR_FILL_COLOR,
    AUTOBATTLER_FARM_BUFF_AURA_COLOR,
    PLAYER_GRID_CELL_WIDTH_PX, 
    PLAYER_GRID_CELL_HEIGHT_PX 
} from '../constants';

interface RenderConstants {
    UNIT_VISUAL_SIZE: number;
    UNIT_VISUAL_HEIGHT: number;
    HP_BAR_WIDTH: number;
    HP_BAR_HEIGHT: number;
    STACK_COUNTER_FONT_SIZE: number;
    STACK_COUNTER_FONT: string;
    STACK_COUNTER_COLOR: string;
    PLAYER_UNIT_COLOR: string;
    ENEMY_UNIT_COLOR: string;
    PLAYER_HQ_COLOR: string; 
    ENEMY_BUILDING_COLOR: string;
    HP_BAR_BG_COLOR: string;
    HP_BAR_PLAYER_COLOR: string;
    HP_BAR_ENEMY_COLOR: string;
    BATTLE_PATH_WIDTH: number; 
    BATTLE_PATH_CANVAS_HEIGHT: number; 
    PLAYER_BUILDING_GRID_COLS: number;
    PLAYER_BUILDING_GRID_ROWS: number;
    PLAYER_GRID_DISPLAY_WIDTH: number; 
    PLAYER_GRID_CELL_WIDTH_PX: number;
    PLAYER_GRID_CELL_HEIGHT_PX: number;
    AUTOBATTLER_PROGRESS_BAR_HEIGHT: number;
    AUTOBATTLER_PROGRESS_BAR_BG_COLOR: string;
    AUTOBATTLER_PROGRESS_BAR_FILL_COLOR: string;
    AUTOBATTLER_FARM_BUFF_AURA_COLOR: string;
}

const drawHpBar = (ctx: CanvasRenderingContext2D, entity: AutoBattlerUnit | AutoBattlerBaseStructure | AutoBattlerBuilding | AutoBattlerEnemyTower, constants: RenderConstants, camera: {x: number, y: number}, isStructureOrBuilding = false) => {
    if (!entity.hp || !entity.maxHp || entity.hp <= 0) return;

    let entityWidth: number;
    let entityHeight: number;
    let visualEntityWorldX = entity.x!; 
    let visualEntityWorldY = entity.y!; 

    if (isStructureOrBuilding) {
        const structure = entity as (AutoBattlerBaseStructure | AutoBattlerBuilding | AutoBattlerEnemyTower);
        if (structure.type === AutoBattlerBuildingType.ENEMY_BASE) {
            entityWidth = ENEMY_BASE_WIDTH;
            entityHeight = ENEMY_BASE_HEIGHT;
        } else if (structure.type === AutoBattlerBuildingType.ENEMY_TOWER) {
            entityWidth = ENEMY_TOWER_WIDTH;
            entityHeight = ENEMY_TOWER_HEIGHT;
        } else { // Player Grid Building (AutoBattlerBuilding)
            const building = entity as AutoBattlerBuilding; 
            entityWidth = constants.PLAYER_GRID_CELL_WIDTH_PX * 0.8; 
            entityHeight = constants.PLAYER_GRID_CELL_HEIGHT_PX * 0.15; // This is for positioning reference, not actual bar height
            visualEntityWorldX = building.x!; 
            visualEntityWorldY = building.y!;
        }
    } else { // Unit
        entityWidth = constants.HP_BAR_WIDTH;
        entityHeight = constants.UNIT_VISUAL_HEIGHT; // Reference height for positioning above unit
    }
    
    const barScreenX = visualEntityWorldX - camera.x - entityWidth / 2;
    const barScreenY = visualEntityWorldY - camera.y - entityHeight / 2 - constants.HP_BAR_HEIGHT - 3;


    ctx.fillStyle = constants.HP_BAR_BG_COLOR;
    ctx.fillRect(barScreenX, barScreenY, entityWidth, constants.HP_BAR_HEIGHT);

    const hpPercentage = entity.hp / entity.maxHp;
    const hpBarFillWidth = entityWidth * hpPercentage;
    
    let fillColor: string;
    if (isStructureOrBuilding) {
        const structure = entity as (AutoBattlerBaseStructure | AutoBattlerBuilding | AutoBattlerEnemyTower);
        fillColor = (structure.type === AutoBattlerBuildingType.ENEMY_BASE || structure.type === AutoBattlerBuildingType.ENEMY_TOWER) 
            ? constants.HP_BAR_ENEMY_COLOR 
            : constants.HP_BAR_PLAYER_COLOR; // Player grid buildings and HQ
    } else {
        const battleUnit = entity as AutoBattlerUnit;
        fillColor = battleUnit.isPlayerUnit ? constants.HP_BAR_PLAYER_COLOR : constants.HP_BAR_ENEMY_COLOR;
    }

    ctx.fillStyle = fillColor;
    ctx.fillRect(barScreenX, barScreenY, hpBarFillWidth, constants.HP_BAR_HEIGHT);
};


const drawStackCounter = (ctx: CanvasRenderingContext2D, unit: AutoBattlerUnit, constants: RenderConstants, camera: {x:number, y:number}) => {
    ctx.fillStyle = constants.STACK_COUNTER_COLOR;
    ctx.font = constants.STACK_COUNTER_FONT;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom'; 
    const textScreenX = unit.x - camera.x;
    const textScreenY = unit.y - camera.y - constants.UNIT_VISUAL_HEIGHT / 2 - constants.HP_BAR_HEIGHT - 3 - 2; 
    ctx.fillText(`x${unit.stackSize}`, textScreenX, textScreenY);
};

const drawUnit = (ctx: CanvasRenderingContext2D, unit: AutoBattlerUnit, constants: RenderConstants, camera: {x: number, y: number}) => {
    if (unit.hp <= 0) return;
    const renderScreenX = unit.x - camera.x;
    const renderScreenY = unit.y - camera.y;
    ctx.fillStyle = unit.isPlayerUnit ? constants.PLAYER_UNIT_COLOR : constants.ENEMY_UNIT_COLOR;
    ctx.beginPath();
    ctx.arc(renderScreenX, renderScreenY, constants.UNIT_VISUAL_SIZE / 2, 0, Math.PI * 2);
    ctx.fill();
    drawHpBar(ctx, unit, constants, camera, false); 
    if (unit.stackSize > 1) {
        drawStackCounter(ctx, unit, constants, camera);
    }
};


const drawPlayerGridAndBuildings = (ctx: CanvasRenderingContext2D, autoBattlerState: AutoBattlerState, constants: RenderConstants, camera: {x: number, y: number}) => {
    const { grid, farmBuffs } = autoBattlerState;
    ctx.strokeStyle = 'rgba(100, 100, 100, 0.5)';
    ctx.lineWidth = 1;
    for (let r = 0; r < constants.PLAYER_BUILDING_GRID_ROWS; r++) {
        for (let c = 0; c < constants.PLAYER_BUILDING_GRID_COLS; c++) {
            const cellWorldX = c * PLAYER_GRID_CELL_WIDTH_PX; 
            const cellWorldY = r * PLAYER_GRID_CELL_HEIGHT_PX; 
            
            const cellScreenX = cellWorldX - camera.x;
            const cellScreenY = cellWorldY - camera.y;

            ctx.strokeRect(cellScreenX, cellScreenY, PLAYER_GRID_CELL_WIDTH_PX, PLAYER_GRID_CELL_HEIGHT_PX);

            const building = grid[r]?.[c];
            if (building) {
                // For player grid buildings, isEnemyBuildingOnBattlePath is false
                drawBuilding(ctx, building, false, constants, autoBattlerState, camera); 
            }
        }
    }
};


const drawBuilding = (
    ctx: CanvasRenderingContext2D, 
    building: AutoBattlerBuilding | AutoBattlerBaseStructure | AutoBattlerEnemyTower, 
    isEnemyStructureOnBattlePath: boolean, // Renamed for clarity
    constants: RenderConstants,
    autoBattlerState: AutoBattlerState, 
    camera: {x: number, y: number},
    fixedWidth?: number,
    fixedHeight?: number
) => {
    if (!building.hp || building.hp <= 0 || building.x === undefined || building.y === undefined) return;

    const worldX = building.x; 
    const worldY = building.y;

    let width: number;
    let height: number;

    if (building.type === AutoBattlerBuildingType.ENEMY_BASE) {
        width = fixedWidth || ENEMY_BASE_WIDTH;
        height = fixedHeight || ENEMY_BASE_HEIGHT;
    } else if (building.type === AutoBattlerBuildingType.ENEMY_TOWER) {
        width = fixedWidth || ENEMY_TOWER_WIDTH;
        height = fixedHeight || ENEMY_TOWER_HEIGHT;
    } else { // Player Grid Building or Player HQ
        width = fixedWidth || constants.PLAYER_GRID_CELL_WIDTH_PX * 0.9;
        height = fixedHeight || constants.PLAYER_GRID_CELL_HEIGHT_PX * 0.9;
    }
    
    const screenXPos = worldX - camera.x - width / 2; 
    const screenYPos = worldY - camera.y - height / 2;

    ctx.fillStyle = (building.type === AutoBattlerBuildingType.ENEMY_BASE || building.type === AutoBattlerBuildingType.ENEMY_TOWER) 
                    ? constants.ENEMY_BUILDING_COLOR 
                    : constants.PLAYER_HQ_COLOR; 
    ctx.fillRect(screenXPos, screenYPos, width, height);
    
    // Pass true for the last parameter (isStructureOrBuilding) for all building types
    drawHpBar(ctx, building, constants, camera, true); 

    ctx.fillStyle = 'white';
    ctx.font = '8px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(building.type.substring(0,3), worldX - camera.x, screenYPos + height / 2 + 4);

    if ('producesUnitId' in building && building.producesUnitId && building.productionTimeMs && building.productionTimeMs > 0 && building.productionProgressMs !== undefined) {
        const progressPercentage = (building.productionProgressMs / building.productionTimeMs);
        const barWidth = width * 0.8;
        const barScreenX = worldX - camera.x - barWidth / 2;
        const barScreenY = worldY - camera.y - height / 2 - constants.AUTOBATTLER_PROGRESS_BAR_HEIGHT - 2; 

        ctx.fillStyle = constants.AUTOBATTLER_PROGRESS_BAR_BG_COLOR;
        ctx.fillRect(barScreenX, barScreenY, barWidth, constants.AUTOBATTLER_PROGRESS_BAR_HEIGHT);

        ctx.fillStyle = constants.AUTOBATTLER_PROGRESS_BAR_FILL_COLOR;
        ctx.fillRect(barScreenX, barScreenY, barWidth * progressPercentage, constants.AUTOBATTLER_PROGRESS_BAR_HEIGHT);
    }

    if (building.type === AutoBattlerBuildingType.FARM && autoBattlerState.farmBuffs && autoBattlerState.farmBuffs[building.id] > 0) {
        const auraRadius = Math.min(width, height) * 0.6; 
        ctx.beginPath();
        ctx.arc(worldX - camera.x, worldY - camera.y, auraRadius, 0, Math.PI * 2);
        ctx.fillStyle = constants.AUTOBATTLER_FARM_BUFF_AURA_COLOR;
        ctx.fill();
    }
};


const drawDamagePopups = (ctx: CanvasRenderingContext2D, popups: DamagePopup[], autoBattlerState: AutoBattlerState, constants: RenderConstants, camera: {x: number, y: number}) => {
    popups.forEach(popup => {
        if (popup.lifetimeMs <= 0) return;
        let baseWorldX = popup.x;
        let baseWorldY = popup.y;
        let targetHeight = constants.UNIT_VISUAL_HEIGHT; 
        if (popup.targetId) {
            let target: AutoBattlerUnit | AutoBattlerBaseStructure | AutoBattlerEnemyTower | null = null; // Added AutoBattlerEnemyTower
            target = autoBattlerState.playerUnits.find(u => u.instanceId === popup.targetId) ||
                     autoBattlerState.enemyUnits.find(u => u.instanceId === popup.targetId) ||
                     autoBattlerState.enemyTowers.find(t => t.id === popup.targetId) || // Correctly check for tower
                     (autoBattlerState.enemyBase.id === popup.targetId ? autoBattlerState.enemyBase : null);
            if (target && target.x !== undefined && target.y !== undefined) {
                baseWorldX = target.x; 
                if ('instanceId' in target) { 
                    targetHeight = constants.UNIT_VISUAL_HEIGHT;
                } else { 
                    if (target.type === AutoBattlerBuildingType.ENEMY_TOWER) targetHeight = ENEMY_TOWER_HEIGHT;
                    else if (target.type === AutoBattlerBuildingType.ENEMY_BASE) targetHeight = ENEMY_BASE_HEIGHT;
                }
                baseWorldY = target.y - targetHeight / 2 - 5; 
            }
        }
        const progress = 1 - (popup.lifetimeMs / popup.initialLifetimeMs);
        const currentScreenY = baseWorldY - camera.y - (progress * AUTOBATTLER_POPUP_LIFT_DISTANCE);
        const currentScreenX = baseWorldX - camera.x;
        const alpha = Math.max(0, 1 - Math.pow(progress, 2));
        ctx.globalAlpha = alpha;
        ctx.fillStyle = popup.isCrit ? AUTOBATTLER_POPUP_COLOR_CRIT_DAMAGE : AUTOBATTLER_POPUP_COLOR_DAMAGE;
        ctx.font = AUTOBATTLER_POPUP_FONT;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(popup.text, currentScreenX, currentScreenY);
    });
    ctx.globalAlpha = 1;
};


export const renderAutoBattler = (
    ctx: CanvasRenderingContext2D,
    autoBattlerState: AutoBattlerState | null,
    constants: RenderConstants,
    camera: { x: number; y: number } 
) => {
    if (!ctx || !autoBattlerState) return;
    
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.fillStyle = 'rgba(20, 25, 30, 1)'; 
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    drawPlayerGridAndBuildings(ctx, autoBattlerState, constants, camera);

    const battlePathScreenX = constants.PLAYER_GRID_DISPLAY_WIDTH - camera.x;
    const battlePathScreenY = 0 - camera.y; 
    const battlePathScreenHeight = constants.BATTLE_PATH_CANVAS_HEIGHT; 

    ctx.fillStyle = 'rgba(30, 35, 40, 1)'; 
    ctx.fillRect(
      battlePathScreenX, 
      battlePathScreenY, 
      constants.BATTLE_PATH_WIDTH, 
      battlePathScreenHeight
    );


    autoBattlerState.enemyTowers.forEach(tower => {
        drawBuilding(ctx, tower, true, constants, autoBattlerState, camera, ENEMY_TOWER_WIDTH, ENEMY_TOWER_HEIGHT);
    });
    // Ensure enemyBase is drawn correctly
    if(autoBattlerState.enemyBase && autoBattlerState.enemyBase.hp > 0) {
        drawBuilding(ctx, autoBattlerState.enemyBase, true, constants, autoBattlerState, camera, ENEMY_BASE_WIDTH, ENEMY_BASE_HEIGHT);
    }
    
    autoBattlerState.playerUnits.forEach(unit => {
        drawUnit(ctx, unit, constants, camera);
    });
    autoBattlerState.enemyUnits.forEach(unit => {
        drawUnit(ctx, unit, constants, camera);
    });

    if (autoBattlerState.popups) {
        drawDamagePopups(ctx, autoBattlerState.popups, autoBattlerState, constants, camera);
    }
};
