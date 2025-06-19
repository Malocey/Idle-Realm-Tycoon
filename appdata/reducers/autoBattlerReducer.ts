
import { GameState, GameAction, AutoBattlerBuilding, AutoBattlerBuildingCard, AutoBattlerState, AutoBattlerBuildingType, GameNotification, AutoBattlerUnit, AutoBattlerUnitDefinition, AutoBattlerBaseStructure, DamagePopup, AutoBattlerEnemyTower } from '../types';
import { AUTOBATTLER_CARD_DEFINITIONS } from '../gameData/autoBattlerCardDefinitions';
import { AUTOBATTLER_UNIT_DEFINITIONS } from '../gameData/autoBattlerUnitDefinitions';
import * as constants from '../constants';

const createInitialAutoBattlerGrid = (rows: number, cols: number): (AutoBattlerBuilding | null)[][] => {
    return Array.from({ length: rows }, () => Array(cols).fill(null));
};

const shuffleDeck = (deck: AutoBattlerBuildingCard[]): AutoBattlerBuildingCard[] => {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

const createDefaultDeck = (): AutoBattlerBuildingCard[] => {
    return [
        ...(AUTOBATTLER_CARD_DEFINITIONS.FARM_CARD ? Array(5).fill(AUTOBATTLER_CARD_DEFINITIONS.FARM_CARD) : []),
        ...(AUTOBATTLER_CARD_DEFINITIONS.BARRACKS_CARD ? Array(5).fill(AUTOBATTLER_CARD_DEFINITIONS.BARRACKS_CARD) : []),
        ...(AUTOBATTLER_CARD_DEFINITIONS.WINDMILL_CARD ? Array(3).fill(AUTOBATTLER_CARD_DEFINITIONS.WINDMILL_CARD) : []),
    ];
};

export const initialAutoBattlerStateBase: Omit<AutoBattlerState, 'deck' | 'hand' | 'discard'> = {
    isActive: false, supplies: 250, grid: createInitialAutoBattlerGrid(constants.PLAYER_BUILDING_GRID_ROWS, constants.PLAYER_BUILDING_GRID_COLS), playerUnits: [], builderUnits: [],
    playerDefenses: [], enemyUnits: [],
    enemyTowers: [ 
        { id: 'tower1_original', type: AutoBattlerBuildingType.ENEMY_TOWER, hp: 4000, maxHp: 4000, x: constants.AUTOBATTLER_WORLD_WIDTH - 480, y: constants.AUTOBATTLER_BATTLE_PATH_HEIGHT * 0.3, damage: 40, attackSpeed: 1500, attackRange: 80, attackCooldownRemainingMs: 0 },
        { id: 'tower2_original', type: AutoBattlerBuildingType.ENEMY_TOWER, hp: 4000, maxHp: 4000, x: constants.AUTOBATTLER_WORLD_WIDTH - 480, y: constants.AUTOBATTLER_BATTLE_PATH_HEIGHT * 0.7, damage: 40, attackSpeed: 1500, attackRange: 80, attackCooldownRemainingMs: 0 },
        { id: 'tower3_original', type: AutoBattlerBuildingType.ENEMY_TOWER, hp: 8000, maxHp: 8000, x: constants.AUTOBATTLER_WORLD_WIDTH - 330, y: constants.AUTOBATTLER_BATTLE_PATH_HEIGHT * 0.4, damage: 60, attackSpeed: 1500, attackRange: 80, attackCooldownRemainingMs: 0 },
        { id: 'tower4_original', type: AutoBattlerBuildingType.ENEMY_TOWER, hp: 8000, maxHp: 8000, x: constants.AUTOBATTLER_WORLD_WIDTH - 330, y: constants.AUTOBATTLER_BATTLE_PATH_HEIGHT * 0.6, damage: 60, attackSpeed: 1500, attackRange: 80, attackCooldownRemainingMs: 0 },
        { id: 'tower5_new_rear', type: AutoBattlerBuildingType.ENEMY_TOWER, hp: 10000, maxHp: 10000, x: constants.AUTOBATTLER_WORLD_WIDTH - 180, y: constants.AUTOBATTLER_BATTLE_PATH_HEIGHT * 0.3, damage: 100, attackSpeed: 1800, attackRange: 90, attackCooldownRemainingMs: 0 },
        { id: 'tower6_new_rear', type: AutoBattlerBuildingType.ENEMY_TOWER, hp: 10000, maxHp: 10000, x: constants.AUTOBATTLER_WORLD_WIDTH - 180, y: constants.AUTOBATTLER_BATTLE_PATH_HEIGHT * 0.7, damage: 100, attackSpeed: 1800, attackRange: 90, attackCooldownRemainingMs: 0 },
    ],
    enemyBase: {
        id: 'enemyBase', type: AutoBattlerBuildingType.ENEMY_BASE, hp: 5000, maxHp: 5000, 
        x: constants.AUTOBATTLER_WORLD_WIDTH - constants.ENEMY_BASE_WIDTH / 2 - 30, 
        y: constants.ENEMY_BASE_Y, 
        producesUnitId: 'ENEMY_GRUNT', productionTimeMs: 7000, productionProgressMs: 0,
        damage: 30, attackSpeed: 2500, attackRange: 120, attackCooldownRemainingMs: 0,
    },
    enemySpawnRateModifier: 1.0, 
    nextEnemySpawnPoolIndex: 0,
    towersDestroyedCountThisRun: 0,
    gameTime: 0, popups: [],
    farmBuffs: {},
    camera: { x: 0, y: 0 },
    currentViewportWidth: constants.AUTOBATTLER_VIEWPORT_WIDTH,
    currentViewportHeight: constants.AUTOBATTLER_VIEWPORT_HEIGHT,
    eliteSpawnCooldownMs: 0,
};


export const autoBattlerReducer = (
    state: GameState,
    action: Extract<GameAction, { type: 'INITIALIZE_AUTO_BATTLER' | 'PLAY_AUTOBATTLER_CARD' | 'AUTOBATTLER_GAME_TICK' | 'AUTOBATTLER_CAMERA_PAN' | 'AUTOBATTLER_UNIT_ATTACK' }>
): GameState => {
    if (!state.autoBattler && action.type !== 'INITIALIZE_AUTO_BATTLER') {
        return state;
    }

    switch (action.type) {
        case 'INITIALIZE_AUTO_BATTLER': {
            if (state.autoBattler?.isActive) { return state; }
            const initialDeck = shuffleDeck(createDefaultDeck());
            const initialHand = initialDeck.slice(0, 4);
            const remainingDeck = initialDeck.slice(4);
            return { ...state, autoBattler: { ...initialAutoBattlerStateBase, isActive: true, deck: remainingDeck, hand: initialHand, discard: [] } };
        }

        case 'PLAY_AUTOBATTLER_CARD': {
            const { handIndex, position } = action.payload;
            const { x: gridCol, y: gridRow } = position; 
            const currentAutoBattlerState = state.autoBattler!;
            const playedCard = currentAutoBattlerState.hand[handIndex];

            if (!playedCard || (currentAutoBattlerState.grid[gridRow]?.[gridCol] !== null)) { return state; }

            let calculatedCost = playedCard.cost;
            const existingBuildingsOfType = currentAutoBattlerState.grid.flat().filter(b => b && b.type === playedCard.buildingType);
            const numberOfExisting = existingBuildingsOfType.length;

            if (playedCard.buildingType === AutoBattlerBuildingType.BARRACKS) {
                if (numberOfExisting === 0) calculatedCost = 20;
                else if (numberOfExisting === 1) calculatedCost = 40;
                else {
                    let prevCost = 40; 
                    for (let i = 1; i < numberOfExisting; i++) { 
                        prevCost += 30;
                    }
                    calculatedCost = prevCost + 30; 
                }
            } else if (playedCard.buildingType === AutoBattlerBuildingType.FARM) {
                calculatedCost = 40 + (10 * numberOfExisting);
            } else if (playedCard.buildingType === AutoBattlerBuildingType.WINDMILL) {
                calculatedCost = 100 + (20 * numberOfExisting);
            }

            if (currentAutoBattlerState.supplies < calculatedCost) { return state; }
            
            const buildingWorldX = gridCol * constants.PLAYER_GRID_CELL_WIDTH_PX + constants.PLAYER_GRID_CELL_WIDTH_PX / 2;
            const buildingWorldY = gridRow * constants.PLAYER_GRID_CELL_HEIGHT_PX + constants.PLAYER_GRID_CELL_HEIGHT_PX / 2;


            const newBuilding: AutoBattlerBuilding = { 
                id: `${playedCard.buildingType}-${Date.now()}`, 
                type: playedCard.buildingType, 
                level: 1, hp: 100, maxHp: 100, 
                position: { x: gridCol, y: gridRow }, 
                x: buildingWorldX, 
                y: buildingWorldY, 
                producesUnitId: playedCard.producesUnitId, 
                productionTimeMs: playedCard.productionTimeMs, 
                productionProgressMs: 0 
            };
            const newGrid = currentAutoBattlerState.grid.map((row, rIdx) => rIdx === gridRow ? row.map((cell, cIdx) => (cIdx === gridCol ? newBuilding : cell)) : row);
            const newHand = currentAutoBattlerState.hand.filter((_, index) => index !== handIndex);
            let newDiscard = [...currentAutoBattlerState.discard, playedCard];
            let newDeck = [...currentAutoBattlerState.deck];
            if (newDeck.length === 0 && newDiscard.length > 0) { newDeck = shuffleDeck(newDiscard); newDiscard = []; }
            if (newDeck.length > 0) { newHand.push(newDeck.shift()!); }
            return { ...state, autoBattler: { ...currentAutoBattlerState, supplies: currentAutoBattlerState.supplies - calculatedCost, grid: newGrid, hand: newHand, deck: newDeck, discard: newDiscard, }, };
        }
        
        case 'AUTOBATTLER_CAMERA_PAN': {
            if (!state.autoBattler) return state;
            const { dx: mouseDeltaX, dy: mouseDeltaY } = action.payload; 
            const currentCamera = state.autoBattler.camera;
            const viewportWidth = state.autoBattler.currentViewportWidth;
            const viewportHeight = state.autoBattler.currentViewportHeight;

            const maxCameraX = Math.max(0, constants.AUTOBATTLER_WORLD_WIDTH - viewportWidth);
            const maxCameraY = Math.max(0, constants.AUTOBATTLER_WORLD_HEIGHT - viewportHeight);
            
            let newCamX = currentCamera.x - mouseDeltaX;
            let newCamY = currentCamera.y - mouseDeltaY;

            newCamX = Math.max(0, Math.min(newCamX, maxCameraX));
            newCamY = Math.max(0, Math.min(newCamY, maxCameraY));
            
            return {
                ...state,
                autoBattler: {
                    ...state.autoBattler,
                    camera: {
                        x: newCamX,
                        y: newCamY,
                    },
                },
            };
        }

        case 'AUTOBATTLER_GAME_TICK': {
            if (!state.autoBattler || !state.autoBattler.isActive) return state;

            let newState = JSON.parse(JSON.stringify(state.autoBattler)) as AutoBattlerState;
            const { canvasWidth, canvasHeight } = action.payload; 
            
            newState.currentViewportWidth = canvasWidth;
            newState.currentViewportHeight = canvasHeight;

            const oldTowersDestroyedCountThisRun = newState.towersDestroyedCountThisRun;


            const farmBuffsMap = new Map<string, number>();
            newState.grid.forEach((row, r) => {
                row.forEach((building, c) => {
                    if (building && building.type === AutoBattlerBuildingType.WINDMILL) {
                        const adjacentOffsets = [{dr: -1, dc: 0}, {dr: 1, dc: 0}, {dr: 0, dc: -1}, {dr: 0, dc: 1}];
                        adjacentOffsets.forEach(offset => {
                            const adjR = r + offset.dr;
                            const adjC = c + offset.dc;
                            if (adjR >= 0 && adjR < constants.PLAYER_BUILDING_GRID_ROWS && adjC >= 0 && adjC < constants.PLAYER_BUILDING_GRID_COLS) {
                                const adjBuilding = newState.grid[adjR]?.[adjC];
                                if (adjBuilding && adjBuilding.type === AutoBattlerBuildingType.FARM && adjBuilding.id) { 
                                    farmBuffsMap.set(adjBuilding.id, (farmBuffsMap.get(adjBuilding.id) || 0) + constants.AUTOBATTLER_WINDMILL_FARM_BUFF_PERCENTAGE);
                                }
                            }
                        });
                    }
                });
            });
            newState.farmBuffs = Object.fromEntries(farmBuffsMap); 


            newState.grid.flat().forEach(building => {
                if (!building) return;
                if (building.type === AutoBattlerBuildingType.FARM) {
                    const baseSupplyPerSecond = constants.FARM_SUPPLY_PER_SECOND;
                    const buffPercentage = farmBuffsMap.get(building.id) || 0;
                    const effectiveSupplyRate = baseSupplyPerSecond * (1 + buffPercentage);
                    const suppliesThisTick = effectiveSupplyRate * (constants.AUTOBATTLER_TICK_INTERVAL_MS / 1000) * state.gameSpeed;
                    newState.supplies += suppliesThisTick;
                }

                if (building.producesUnitId && building.productionTimeMs && building.productionProgressMs !== undefined) {
                    building.productionProgressMs += constants.AUTOBATTLER_TICK_INTERVAL_MS * state.gameSpeed;
                    if (building.productionProgressMs >= building.productionTimeMs) {
                        const unitDef = AUTOBATTLER_UNIT_DEFINITIONS[building.producesUnitId];
                        if (unitDef) {
                            const spawnX = constants.PLAYER_GRID_DISPLAY_WIDTH + constants.PLAYER_UNIT_SPAWN_X_OFFSET;
                            const spawnY = building.y!; 
                            newState.playerUnits.push({
                                instanceId: `${unitDef.id}-${Date.now()}-${Math.random()}`, definitionId: unitDef.id,
                                hp: unitDef.hp, maxHp: unitDef.hp, damage: unitDef.damage,
                                attackSpeed: unitDef.attackSpeed, speed: unitDef.speed, attackRange: unitDef.attackRange,
                                x: spawnX, y: spawnY, isPlayerUnit: true, isMoving: true, attackCooldownRemainingMs: 0, stackSize: 1
                            });
                        }
                        building.productionProgressMs = 0;
                    }
                }
            });

            const enemySpawnPoolOrder = ['ENEMY_GRUNT', 'SCARECROW_SLASHER', 'ENEMY_GRUNT', 'ENEMY_GRUNT', 'CROP_GOLEM', 'SCARECROW_SLASHER'];
            if (newState.enemyBase.productionTimeMs && newState.enemyBase.productionProgressMs !== undefined) {
                const effectiveTickProgress = constants.AUTOBATTLER_TICK_INTERVAL_MS * state.gameSpeed * newState.enemySpawnRateModifier;
                newState.enemyBase.productionProgressMs += effectiveTickProgress;

                if (newState.enemyBase.productionProgressMs >= newState.enemyBase.productionTimeMs) {
                    const enemyUnitDefId = enemySpawnPoolOrder[newState.nextEnemySpawnPoolIndex];
                    const enemyUnitDef = AUTOBATTLER_UNIT_DEFINITIONS[enemyUnitDefId];
                    if (enemyUnitDef) {
                        const spawnX = newState.enemyBase.x! - constants.ENEMY_BASE_WIDTH / 2 - 10;
                        const spawnY = newState.enemyBase.y! + (Math.random() - 0.5) * constants.ENEMY_BASE_HEIGHT * 0.8;
                        newState.enemyUnits.push({
                            instanceId: `${enemyUnitDef.id}-enemy-${Date.now()}-${Math.random()}`, definitionId: enemyUnitDef.id,
                            hp: enemyUnitDef.hp, maxHp: enemyUnitDef.hp, damage: enemyUnitDef.damage,
                            attackSpeed: enemyUnitDef.attackSpeed, speed: enemyUnitDef.speed, attackRange: enemyUnitDef.attackRange,
                            x: spawnX, y: spawnY, isPlayerUnit: false, isMoving: true, attackCooldownRemainingMs: 0, stackSize: 1
                        });
                    }
                    newState.enemyBase.productionProgressMs = 0;
                    newState.nextEnemySpawnPoolIndex = (newState.nextEnemySpawnPoolIndex + 1) % enemySpawnPoolOrder.length;
                }
            }
            
            if (newState.towersDestroyedCountThisRun >= 4) {
                if (newState.eliteSpawnCooldownMs <= 0) {
                    const eliteDef = AUTOBATTLER_UNIT_DEFINITIONS['ELITE_GUARD'];
                    if (eliteDef) {
                        const spawnX = newState.enemyBase.x! - constants.ENEMY_BASE_WIDTH / 2 - 15 - (Math.random() * 10);
                        const spawnY = newState.enemyBase.y! + (Math.random() - 0.5) * constants.ENEMY_BASE_HEIGHT;
                        newState.enemyUnits.push({
                            instanceId: `${eliteDef.id}-elite-${Date.now()}`, definitionId: eliteDef.id,
                            hp: eliteDef.hp, maxHp: eliteDef.hp, damage: eliteDef.damage,
                            attackSpeed: eliteDef.attackSpeed, speed: eliteDef.speed, attackRange: eliteDef.attackRange,
                            x: spawnX, y: spawnY, isPlayerUnit: false, isMoving: true, attackCooldownRemainingMs: 0, stackSize: 1
                        });
                        const eliteSpawnNotification: GameNotification = {id: Date.now().toString(), message: "An Elite Guard has spawned from the enemy base!", type: 'warning', iconName: constants.NOTIFICATION_ICONS.warning, timestamp: Date.now()};
                    }
                    newState.eliteSpawnCooldownMs = 20 * 1000; 
                } else {
                    newState.eliteSpawnCooldownMs -= constants.AUTOBATTLER_TICK_INTERVAL_MS * state.gameSpeed;
                }
            }

            const allAttackingStructures: (AutoBattlerBaseStructure | AutoBattlerEnemyTower)[] = [...newState.enemyTowers];
            // Add enemy base to attacking structures if it can attack
            if (newState.enemyBase.hp > 0 && newState.enemyBase.damage && newState.enemyBase.attackSpeed && newState.enemyBase.attackRange) {
                allAttackingStructures.push(newState.enemyBase as AutoBattlerBaseStructure); // Type assertion as hp, etc., are guaranteed here
            }


            allAttackingStructures.forEach(structure => {
                if (!structure || structure.hp <= 0 || !structure.damage || !structure.attackSpeed || !structure.attackRange) return;
                
                let currentAttackCooldown = structure.attackCooldownRemainingMs || 0;
                if (currentAttackCooldown > 0) {
                    currentAttackCooldown -= constants.AUTOBATTLER_TICK_INTERVAL_MS * state.gameSpeed;
                    structure.attackCooldownRemainingMs = currentAttackCooldown;
                }

                if (currentAttackCooldown <= 0) {
                    let closestPlayerUnit: AutoBattlerUnit | null = null;
                    let minStructureDistSq = structure.attackRange! * structure.attackRange!; 
                    newState.playerUnits.forEach(playerUnit => {
                        if (playerUnit.hp > 0) {
                            const distSq = Math.pow(playerUnit.x - structure.x!, 2) + Math.pow(playerUnit.y - structure.y!, 2);
                            if (distSq < minStructureDistSq) { minStructureDistSq = distSq; closestPlayerUnit = playerUnit; }
                        }
                    });
                    if (closestPlayerUnit) {
                        closestPlayerUnit.hp -= structure.damage!;
                        newState.popups.push({
                            id: `popup-struct-${structure.id}-${Date.now()}`, text: `${structure.damage}`,
                            x: closestPlayerUnit.x, y: closestPlayerUnit.y - constants.AUTOBATTLER_UNIT_VISUAL_HEIGHT / 2 - 5,
                            targetId: closestPlayerUnit.instanceId, lifetimeMs: constants.AUTOBATTLER_POPUP_DURATION_MS,
                            initialLifetimeMs: constants.AUTOBATTLER_POPUP_DURATION_MS, isCrit: false,
                        });
                        structure.attackCooldownRemainingMs = structure.attackSpeed;
                    }
                }
            });


            const allPlayerDamageableEntities = [...newState.playerUnits];
            const allEnemyDamageableEntities = [...newState.enemyUnits, ...newState.enemyTowers.filter(t=>t.hp > 0), (newState.enemyBase.hp > 0 ? newState.enemyBase : null)].filter(Boolean) as (AutoBattlerUnit | AutoBattlerBaseStructure | AutoBattlerEnemyTower)[];


            for (const unit of [...newState.playerUnits, ...newState.enemyUnits]) {
                 if (unit.targetId && unit.attackCooldownRemainingMs <= 0) {
                    const targetPool = unit.isPlayerUnit ? allEnemyDamageableEntities : allPlayerDamageableEntities;
                    const target = targetPool.find(t => ('instanceId' in t ? t.instanceId : t.id) === unit.targetId);
                    if (target && target.hp > 0) {
                        const totalDamage = unit.damage * unit.stackSize;
                        target.hp -= totalDamage;
                        let targetHeight = constants.AUTOBATTLER_UNIT_VISUAL_HEIGHT;
                        if ('type' in target) { 
                            if (target.type === AutoBattlerBuildingType.ENEMY_TOWER) targetHeight = constants.ENEMY_TOWER_HEIGHT;
                            else if (target.type === AutoBattlerBuildingType.ENEMY_BASE) targetHeight = constants.ENEMY_BASE_HEIGHT;
                        }
                        newState.popups.push({
                            id: `popup-${Date.now()}-${Math.random()}`, text: `${totalDamage}`,
                            x: target.x!, y: target.y! - targetHeight / 2 - 5,
                            targetId: ('instanceId' in target ? target.instanceId : target.id),
                            lifetimeMs: constants.AUTOBATTLER_POPUP_DURATION_MS, initialLifetimeMs: constants.AUTOBATTLER_POPUP_DURATION_MS, isCrit: false
                        });
                    }
                    unit.attackCooldownRemainingMs = unit.attackSpeed;
                }
                if (unit.attackCooldownRemainingMs > 0) {
                    unit.attackCooldownRemainingMs -= constants.AUTOBATTLER_TICK_INTERVAL_MS * state.gameSpeed;
                }
            }
            
            const updateAndFilterUnits = (units: AutoBattlerUnit[]) => units.reduce((acc, unit) => {
                 if (unit.hp <= 0) {
                    if (unit.stackSize > 1) { unit.stackSize--; unit.hp = unit.maxHp; acc.push(unit); }
                } else { acc.push(unit); }
                return acc;
            }, [] as AutoBattlerUnit[]);
            newState.playerUnits = updateAndFilterUnits(newState.playerUnits);
            newState.enemyUnits = updateAndFilterUnits(newState.enemyUnits);
            
            const previousTowersCount = newState.enemyTowers.length;
            newState.enemyTowers = newState.enemyTowers.filter((t: AutoBattlerEnemyTower) => t.hp > 0);
            const towersDestroyedThisTick = previousTowersCount - newState.enemyTowers.length;


            if (towersDestroyedThisTick > 0) {
                const oldTotalDestroyed = newState.towersDestroyedCountThisRun;
                newState.towersDestroyedCountThisRun += towersDestroyedThisTick;
                let escalationMessage = "";

                for (let i = oldTotalDestroyed + 1; i <= newState.towersDestroyedCountThisRun; i++) {
                    let spawnCount = 0;
                    let spawnRateIncrease = 0;
                    let enemyTypesToSpawn: string[] = ['ENEMY_GRUNT', 'SCARECROW_SLASHER', 'CROP_GOLEM'];

                    if (i === 1) { spawnCount = 3; spawnRateIncrease = 0.20; } 
                    else if (i === 2) { spawnCount = 5; spawnRateIncrease = 0.50; } 
                    else if (i === 3) { spawnCount = 7; spawnRateIncrease = 1.00; } 
                    else if (i >= 4) { spawnCount = 10; spawnRateIncrease = 2.00; }
                    
                    if (spawnCount > 0) {
                        newState.enemySpawnRateModifier += spawnRateIncrease;
                        escalationMessage += `Tower ${i} destroyed! Spawn rate x${newState.enemySpawnRateModifier.toFixed(2)}. Spawning ${spawnCount} of each bonus unit. `;
                        enemyTypesToSpawn.forEach(unitId => {
                            const bonusEnemyDef = AUTOBATTLER_UNIT_DEFINITIONS[unitId];
                            if (bonusEnemyDef) {
                                for (let j = 0; j < spawnCount; j++) {
                                    const spawnX = newState.enemyBase.x! - constants.ENEMY_BASE_WIDTH / 2 - 15 - (Math.random() * 10);
                                    const spawnY = newState.enemyBase.y! + (Math.random() - 0.5) * constants.ENEMY_BASE_HEIGHT;
                                    newState.enemyUnits.push({
                                        instanceId: `${bonusEnemyDef.id}-escalation-${i}-${j}-${Date.now()}`, definitionId: bonusEnemyDef.id,
                                        hp: bonusEnemyDef.hp, maxHp: bonusEnemyDef.hp, damage: bonusEnemyDef.damage,
                                        attackSpeed: bonusEnemyDef.attackSpeed, speed: bonusEnemyDef.speed, attackRange: bonusEnemyDef.attackRange,
                                        x: spawnX, y: spawnY, isPlayerUnit: false, isMoving: true, attackCooldownRemainingMs: 0, stackSize: 1
                                    });
                                }
                            }
                        });
                    }
                }
            }
            
            for (const unit of [...newState.playerUnits, ...newState.enemyUnits]) {
                 const potentialTargets = unit.isPlayerUnit ? allEnemyDamageableEntities.filter(t => t.hp > 0) : allPlayerDamageableEntities.filter(t => t.hp > 0);
                let closestTarget: any = null;
                let minDistance = Infinity;
                for (const target of potentialTargets) {
                    if (!target || target.hp <= 0) continue;
                    const dist = Math.hypot(target.x! - unit.x, target.y! - unit.y);
                    if (dist < minDistance) { minDistance = dist; closestTarget = target; }
                }
                if (closestTarget && minDistance <= unit.attackRange) {
                    unit.isMoving = false;
                    unit.targetId = 'instanceId' in closestTarget ? closestTarget.instanceId : closestTarget.id;
                } else if (closestTarget) {
                    unit.isMoving = true; unit.targetId = null; 
                    const moveAmount = unit.speed * (constants.AUTOBATTLER_TICK_INTERVAL_MS / 1000) * state.gameSpeed;
                    unit.x += ((closestTarget.x! - unit.x) / minDistance) * moveAmount;
                    unit.y += ((closestTarget.y! - unit.y) / minDistance) * moveAmount;
                } else { 
                    unit.isMoving = true; unit.targetId = null;
                    const moveAmount = unit.speed * (constants.AUTOBATTLER_TICK_INTERVAL_MS / 1000) * state.gameSpeed;
                    if (unit.isPlayerUnit) { 
                         unit.x += moveAmount; 
                         if (unit.x > newState.enemyBase.x) unit.x = newState.enemyBase.x; 
                    } else { 
                         unit.x -= moveAmount; 
                         if (unit.x < constants.PLAYER_GRID_DISPLAY_WIDTH + constants.AUTOBATTLER_UNIT_VISUAL_SIZE / 2) {
                             unit.x = constants.PLAYER_GRID_DISPLAY_WIDTH + constants.AUTOBATTLER_UNIT_VISUAL_SIZE / 2;
                         }
                    }
                }
                const halfUnitSize = constants.AUTOBATTLER_UNIT_VISUAL_SIZE / 2;
                unit.x = Math.max(constants.PLAYER_GRID_DISPLAY_WIDTH + halfUnitSize, Math.min(unit.x, constants.AUTOBATTLER_WORLD_WIDTH - halfUnitSize));
                unit.y = Math.max(halfUnitSize, Math.min(unit.y, constants.AUTOBATTLER_BATTLE_PATH_HEIGHT - halfUnitSize));
            }

            const performFusion = (units: AutoBattlerUnit[]) => {
                if (units.length < 2) return units;
                let merged = new Set<string>(); const unitsCopy = units.map(u => ({...u})); 
                for (let i = 0; i < unitsCopy.length; i++) {
                    if (merged.has(unitsCopy[i].instanceId)) continue;
                    for (let j = i + 1; j < unitsCopy.length; j++) {
                        if (merged.has(unitsCopy[j].instanceId)) continue;
                        const unitA = unitsCopy[i]; const unitB = unitsCopy[j];
                        if (unitA.definitionId === unitB.definitionId && Math.hypot(unitA.x - unitB.x, unitA.y - unitB.y) < constants.AUTOBATTLER_FUSION_RADIUS) {
                            unitA.stackSize += unitB.stackSize;
                            merged.add(unitB.instanceId);
                        }
                    }
                }
                return unitsCopy.filter(u => !merged.has(u.instanceId));
            };
            newState.playerUnits = performFusion(newState.playerUnits);
            newState.enemyUnits = performFusion(newState.enemyUnits);
            
            newState.popups = newState.popups.map(p => ({ ...p, lifetimeMs: p.lifetimeMs - (constants.AUTOBATTLER_TICK_INTERVAL_MS * state.gameSpeed)})).filter(p => p.lifetimeMs > 0);

            if (newState.enemyBase.hp <= 0) {
                 return { ...state, autoBattler: { ...newState, isActive: false }, notifications: [...(state.notifications || []), {id:Date.now().toString(), message: "Enemy Base Destroyed! Victory!", type: 'success', iconName: constants.NOTIFICATION_ICONS.success, timestamp: Date.now()}] };
            }
            const canPlayerProduceUnits = newState.grid.flat().some(b => b && b.producesUnitId && b.type !== AutoBattlerBuildingType.FARM && b.type !== AutoBattlerBuildingType.WINDMILL);
            if (newState.playerUnits.length === 0 && !canPlayerProduceUnits && newState.supplies < Math.min(...Object.values(AUTOBATTLER_CARD_DEFINITIONS).map(c => c.cost).filter(c => c > 0))) {
                 return { ...state, autoBattler: { ...newState, isActive: false }, notifications: [...(state.notifications || []), {id:Date.now().toString(), message: "All units lost and no way to produce more. Defeat!", type: 'error', iconName: constants.NOTIFICATION_ICONS.error, timestamp: Date.now()}] };
            }
            
            return { ...state, autoBattler: newState };
        }
        default:
            return state;
    }
};
