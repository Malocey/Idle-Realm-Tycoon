
import { AutoBattlerState, AutoBattlerUnit, AutoBattlerBuilding, AutoBattlerBaseStructure, AutoBattlerBuildingType } from '../types';
import { 
    AUTOBATTLER_UNIT_VISUAL_SIZE, AUTOBATTLER_UNIT_VISUAL_HEIGHT, 
    AUTOBATTLER_HP_BAR_WIDTH, AUTOBATTLER_HP_BAR_HEIGHT,
    AUTOBATTLER_STACK_COUNTER_FONT_SIZE, AUTOBATTLER_STACK_COUNTER_FONT, AUTOBATTLER_STACK_COUNTER_COLOR,
    AUTOBATTLER_PLAYER_UNIT_COLOR, AUTOBATTLER_ENEMY_UNIT_COLOR,
    AUTOBATTLER_PLAYER_HQ_COLOR, AUTOBATTLER_ENEMY_BUILDING_COLOR,
    AUTOBATTLER_HP_BAR_BG_COLOR, AUTOBATTLER_HP_BAR_PLAYER_COLOR, AUTOBATTLER_HP_BAR_ENEMY_COLOR,
    PLAYER_HQ_X, PLAYER_HQ_Y, PLAYER_HQ_WIDTH, PLAYER_HQ_HEIGHT,
    ENEMY_BASE_X, ENEMY_BASE_Y, ENEMY_BASE_WIDTH, ENEMY_BASE_HEIGHT,
    ENEMY_TOWER_WIDTH, ENEMY_TOWER_HEIGHT
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
}

const drawHpBar = (ctx: CanvasRenderingContext2D, unit: AutoBattlerUnit, constants: RenderConstants) => {
    const barX = unit.x - constants.HP_BAR_WIDTH / 2;
    const barY = unit.y - constants.UNIT_VISUAL_HEIGHT / 2 - constants.HP_BAR_HEIGHT - 3; // 3px spacing above unit

    ctx.fillStyle = constants.HP_BAR_BG_COLOR;
    ctx.fillRect(barX, barY, constants.HP_BAR_WIDTH, constants.HP_BAR_HEIGHT);

    const hpPercentage = unit.hp / unit.maxHp;
    const hpBarFillWidth = constants.HP_BAR_WIDTH * hpPercentage;
    ctx.fillStyle = unit.isPlayerUnit ? constants.HP_BAR_PLAYER_COLOR : constants.HP_BAR_ENEMY_COLOR;
    ctx.fillRect(barX, barY, hpBarFillWidth, constants.HP_BAR_HEIGHT);
};

const drawStackCounter = (ctx: CanvasRenderingContext2D, unit: AutoBattlerUnit, constants: RenderConstants) => {
    ctx.fillStyle = constants.STACK_COUNTER_COLOR;
    ctx.font = constants.STACK_COUNTER_FONT;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom'; // Align to bottom so it's clearly above the unit
    const textY = unit.y - constants.UNIT_VISUAL_HEIGHT / 2 - constants.HP_BAR_HEIGHT - 3 - 2; // Above HP bar
    ctx.fillText(`x${unit.stackSize}`, unit.x, textY);
};

const drawUnit = (ctx: CanvasRenderingContext2D, unit: AutoBattlerUnit, constants: RenderConstants) => {
    if (unit.hp <= 0) return;

    ctx.fillStyle = unit.isPlayerUnit ? constants.PLAYER_UNIT_COLOR : constants.ENEMY_UNIT_COLOR;
    ctx.beginPath();
    ctx.arc(unit.x, unit.y, constants.UNIT_VISUAL_SIZE / 2, 0, Math.PI * 2);
    ctx.fill();
    // ctx.fillRect(
    //     unit.x - constants.UNIT_VISUAL_SIZE / 2,
    //     unit.y - constants.UNIT_VISUAL_HEIGHT / 2,
    //     constants.UNIT_VISUAL_SIZE,
    //     constants.UNIT_VISUAL_HEIGHT
    // );

    drawHpBar(ctx, unit, constants);
    if (unit.stackSize > 1) {
        drawStackCounter(ctx, unit, constants);
    }
};

const drawBuilding = (
    ctx: CanvasRenderingContext2D, 
    building: AutoBattlerBuilding | AutoBattlerBaseStructure, 
    isEnemyBuilding: boolean, 
    constants: RenderConstants,
    fixedWidth?: number,
    fixedHeight?: number
) => {
    if (!building.hp || building.hp <= 0 || building.x === undefined || building.y === undefined) return;

    const width = fixedWidth || constants.UNIT_VISUAL_SIZE * 1.5; // Default if not provided
    const height = fixedHeight || constants.UNIT_VISUAL_SIZE * 2;  // Default if not provided
    const xPos = building.x - width / 2; // Assume x,y is center for buildings too
    const yPos = building.y - height / 2;

    ctx.fillStyle = isEnemyBuilding ? constants.ENEMY_BUILDING_COLOR : constants.PLAYER_HQ_COLOR;
    ctx.fillRect(xPos, yPos, width, height);
    
    // HP Bar for buildings
    const barX = xPos;
    const barY = yPos - constants.HP_BAR_HEIGHT - 3; 
    ctx.fillStyle = constants.HP_BAR_BG_COLOR;
    ctx.fillRect(barX, barY, width, constants.HP_BAR_HEIGHT);
    const hpPercentage = building.hp / (building.maxHp || building.hp);
    ctx.fillStyle = isEnemyBuilding ? constants.HP_BAR_ENEMY_COLOR : constants.HP_BAR_PLAYER_COLOR;
    ctx.fillRect(barX, barY, width * hpPercentage, constants.HP_BAR_HEIGHT);

    // Building Type Text (optional)
    ctx.fillStyle = 'white';
    ctx.font = '8px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(building.type.substring(0,3), building.x, yPos + height / 2 + 4);
};


export const renderAutoBattler = (
    ctx: CanvasRenderingContext2D,
    autoBattlerState: AutoBattlerState | null,
    constants: RenderConstants
) => {
    if (!ctx || !autoBattlerState) return;

    // 1. Clear Canvas
    ctx.clearRect(0, 0, constants.BATTLE_PATH_WIDTH, constants.BATTLE_PATH_CANVAS_HEIGHT);

    // 2. Draw Player HQ (simple rectangle on the left)
     drawBuilding(ctx, 
        { id: 'player_hq', type: AutoBattlerBuildingType.PLAYER_HQ, hp: 1, maxHp: 1, x: PLAYER_HQ_X + PLAYER_HQ_WIDTH / 2, y: PLAYER_HQ_Y }, 
        false, constants, PLAYER_HQ_WIDTH, PLAYER_HQ_HEIGHT
    );


    // 3. Draw Enemy Towers
    autoBattlerState.enemyTowers.forEach(tower => {
        drawBuilding(ctx, tower, true, constants, ENEMY_TOWER_WIDTH, ENEMY_TOWER_HEIGHT);
    });

    // 4. Draw Enemy Base
    drawBuilding(ctx, autoBattlerState.enemyBase, true, constants, ENEMY_BASE_WIDTH, ENEMY_BASE_HEIGHT);
    
    // 5. Draw Player Units
    autoBattlerState.playerUnits.forEach(unit => {
        drawUnit(ctx, unit, constants);
    });

    // 6. Draw Enemy Units
    autoBattlerState.enemyUnits.forEach(unit => {
        drawUnit(ctx, unit, constants);
    });
};
