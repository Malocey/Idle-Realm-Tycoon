

import { GameState, GameAction, AutoBattlerBuilding, AutoBattlerBuildingCard, AutoBattlerState, AutoBattlerBuildingType, GameNotification, AutoBattlerUnit, AutoBattlerUnitDefinition } from '../types';
import { AUTOBATTLER_CARD_DEFINITIONS } from '../gameData/autoBattlerCardDefinitions'; 
import { AUTOBATTLER_UNIT_DEFINITIONS } from '../gameData/autoBattlerUnitDefinitions';
import { NOTIFICATION_ICONS, FARM_SUPPLY_PER_TICK, AUTOBATTLER_TICK_INTERVAL_MS, AUTOBATTLER_FUSION_RADIUS, AUTOBATTLER_BATTLE_PATH_WIDTH } from '../constants'; // Added AUTOBATTLER_BATTLE_PATH_WIDTH

// --- HILFSFUNKTIONEN ---
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

const BATTLE_PATH_WIDTH_CONST = AUTOBATTLER_BATTLE_PATH_WIDTH; // Use constant for clarity
const UNIT_SPAWN_OFFSET_X = 10;
const ENEMY_SPAWN_X = BATTLE_PATH_WIDTH_CONST - UNIT_SPAWN_OFFSET_X - 20;
const PLAYER_SPAWN_X = UNIT_SPAWN_OFFSET_X;

// This is the base state used when initializing the AutoBattler.
// It's local to this reducer.
const initialAutoBattlerStateBase: Omit<AutoBattlerState, 'deck' | 'hand' | 'discard'> = {
    isActive: false,
    supplies: 100,
    grid: createInitialAutoBattlerGrid(6, 10), 
    playerUnits: [],
    builderUnits: [],
    playerDefenses: [],
    enemyUnits: [],
    enemyTowers: [
        { id: 'tower1', type: AutoBattlerBuildingType.ENEMY_TOWER, hp: 1000, maxHp: 1000, x: BATTLE_PATH_WIDTH_CONST - 100, y: 50 },
        { id: 'tower2', type: AutoBattlerBuildingType.ENEMY_TOWER, hp: 1000, maxHp: 1000, x: BATTLE_PATH_WIDTH_CONST - 100, y: 150 },
        { id: 'tower3', type: AutoBattlerBuildingType.ENEMY_TOWER, hp: 1000, maxHp: 1000, x: BATTLE_PATH_WIDTH_CONST - 100, y: 250 },
        { id: 'tower4', type: AutoBattlerBuildingType.ENEMY_TOWER, hp: 1000, maxHp: 1000, x: BATTLE_PATH_WIDTH_CONST - 100, y: 350 },
    ],
    enemyBase: { 
        id: 'enemyBase', type: AutoBattlerBuildingType.ENEMY_BASE, hp: 5000, maxHp: 5000, x: BATTLE_PATH_WIDTH_CONST - 30, y: 200,
        producesUnitId: 'ENEMY_GRUNT', 
        productionTimeMs: 7000,     // Updated to 7 seconds
        productionProgressMs: 0,    
    },
    enemySpawnRateModifier: 1.0,
    gameTime: 0,
};
// --- ENDE HILFSFUNKTIONEN ---


export const autoBattlerReducer = (
    state: GameState,
    action: Extract<GameAction, { type: 'INITIALIZE_AUTO_BATTLER' | 'PLAY_AUTOBATTLER_CARD' | 'AUTOBATTLER_GAME_TICK' | 'AUTOBATTLER_UNIT_ATTACK' }>
): GameState => {
    const autoBattlerStateFromOuterScope = state.autoBattler; 
    if (!autoBattlerStateFromOuterScope && action.type !== 'INITIALIZE_AUTO_BATTLER') {
        return state;
    }
    
    switch (action.type) {
        case 'INITIALIZE_AUTO_BATTLER': {
            if (state.autoBattler?.isActive) { 
                return state;
            }
            const initialDeck = shuffleDeck(createDefaultDeck());
            const initialHand = initialDeck.slice(0, 4);
            const remainingDeck = initialDeck.slice(4);

            return {
                ...state,
                autoBattler: {
                    ...initialAutoBattlerStateBase,
                    isActive: true,
                    deck: remainingDeck,
                    hand: initialHand,
                    discard: [],
                },
            };
        }

        case 'PLAY_AUTOBATTLER_CARD': {
            const { handIndex, position } = action.payload;
            const { x: gridX, y: gridY } = position; 
            const state_AutoBattler = state.autoBattler; 

            if (!state_AutoBattler || !state_AutoBattler.isActive) {
                return state;
            }
                
            const playedCard = state_AutoBattler.hand[handIndex];
            if (!playedCard) {
                return state;
            }

            if (state_AutoBattler.supplies < playedCard.cost) {
                const newNotification: GameNotification = { id: Date.now().toString(), message: `Not enough supplies to play ${playedCard.name}. Cost: ${playedCard.cost}, Have: ${state_AutoBattler.supplies}`, type: 'warning', iconName: NOTIFICATION_ICONS.warning, timestamp: Date.now() };
                return { ...state, notifications: [...state.notifications, newNotification] };
            }
            
            if (!state_AutoBattler.grid[gridY] || state_AutoBattler.grid[gridY][gridX] !== null) {
                return state;
            }
        
            const newBuilding: AutoBattlerBuilding = {
                id: `${playedCard.buildingType}-${Date.now()}`,
                type: playedCard.buildingType,
                level: 1,
                hp: 100, 
                maxHp: 100, 
                position: { x: gridX, y: gridY },
                producesUnitId: playedCard.producesUnitId,
                productionTimeMs: playedCard.productionTimeMs,
                productionProgressMs: (playedCard.producesUnitId && playedCard.productionTimeMs) ? 0 : undefined,
            };
        
            const newGrid = state_AutoBattler.grid.map(row => [...row]);
            newGrid[gridY][gridX] = newBuilding;
            
            let newHand = state_AutoBattler.hand.filter((_, index) => index !== handIndex);
            let newDiscard = [...state_AutoBattler.discard, playedCard];
            let newDeck = [...state_AutoBattler.deck];
        
            if (newHand.length < 4) { 
                if (newDeck.length === 0 && newDiscard.length > 0) { 
                    newDeck = shuffleDeck(newDiscard);
                    newDiscard = [];
                }
                if (newDeck.length > 0) {
                    newHand.push(newDeck.shift()!);
                }
            }
            
            return {
                ...state,
                autoBattler: {
                    ...state_AutoBattler,
                    supplies: state_AutoBattler.supplies - playedCard.cost,
                    grid: newGrid,
                    hand: newHand,
                    deck: newDeck,
                    discard: newDiscard,
                },
            };
        }
        
        case 'AUTOBATTLER_GAME_TICK': {
            if (!state.autoBattler || !state.autoBattler.isActive) {
                return state;
            }
            const currentAutoBattlerState = state.autoBattler;
            let newState: AutoBattlerState = JSON.parse(JSON.stringify(currentAutoBattlerState)); 
            const newAttackActionsToDispatch: GameAction[] = [];


            // 1. Supply Generation
            // FARM_SUPPLY_PER_TICK is now "per second"
            // AUTOBATTLER_TICK_INTERVAL_MS is the duration of one tick in ms
            // (AUTOBATTLER_TICK_INTERVAL_MS / 1000) is the fraction of a second this tick represents
            const supplyPerTickForBaseFarm = FARM_SUPPLY_PER_TICK * (AUTOBATTLER_TICK_INTERVAL_MS / 1000);

            newState.grid.forEach(row => {
                row.forEach(cell => {
                    if (cell) {
                        if (cell.type === AutoBattlerBuildingType.FARM) {
                            newState.supplies += supplyPerTickForBaseFarm * cell.level * state.gameSpeed;
                        } else if (cell.type === AutoBattlerBuildingType.WINDMILL) {
                            const adjacentPositions = [
                                {r: cell.position.y - 1, c: cell.position.x}, {r: cell.position.y + 1, c: cell.position.x},
                                {r: cell.position.y, c: cell.position.x - 1}, {r: cell.position.y, c: cell.position.x + 1}
                            ];
                            adjacentPositions.forEach(pos => {
                                if(pos.r >=0 && pos.r < newState.grid.length && pos.c >=0 && pos.c < newState.grid[0].length) {
                                    const adjCell = newState.grid[pos.r][pos.c];
                                    if(adjCell && adjCell.type === AutoBattlerBuildingType.FARM) {
                                        newState.supplies += (supplyPerTickForBaseFarm * adjCell.level * 0.5 * cell.level) * state.gameSpeed;
                                    }
                                }
                            });
                        }
                    }
                });
            });

            // 2. Player Unit Production
            newState.grid.forEach(row => {
                row.forEach(building => {
                    if (building && building.producesUnitId && building.productionTimeMs && building.productionProgressMs !== undefined) {
                        building.productionProgressMs = (building.productionProgressMs || 0) + AUTOBATTLER_TICK_INTERVAL_MS * state.gameSpeed;
                        if (building.productionProgressMs >= building.productionTimeMs) {
                            const unitDef = AUTOBATTLER_UNIT_DEFINITIONS[building.producesUnitId];
                            if (unitDef) {
                                const newUnit: AutoBattlerUnit = {
                                    instanceId: `${unitDef.id}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
                                    definitionId: unitDef.id,
                                    hp: unitDef.hp, maxHp: unitDef.maxHp, damage: unitDef.damage,
                                    attackSpeed: unitDef.attackSpeed, speed: unitDef.speed, attackRange: unitDef.attackRange,
                                    x: PLAYER_SPAWN_X, 
                                    y: 100 + Math.random() * (BATTLE_PATH_WIDTH_CONST/2 - 50), 
                                    isPlayerUnit: true, isMoving: true, attackCooldownRemainingMs: 0,
                                    stackSize: 1, 
                                };
                                newState.playerUnits.push(newUnit);
                                building.productionProgressMs = 0; 
                            }
                        }
                    }
                });
            });

            // 3. Enemy Unit Production
            if (newState.enemyBase.producesUnitId && newState.enemyBase.productionTimeMs && newState.enemyBase.productionProgressMs !== undefined) {
                newState.enemyBase.productionProgressMs = (newState.enemyBase.productionProgressMs || 0) + AUTOBATTLER_TICK_INTERVAL_MS * state.gameSpeed;
                if (newState.enemyBase.productionProgressMs >= newState.enemyBase.productionTimeMs) {
                    const enemyUnitDef = AUTOBATTLER_UNIT_DEFINITIONS[newState.enemyBase.producesUnitId];
                    if (enemyUnitDef) {
                        const newEnemyUnit: AutoBattlerUnit = {
                            instanceId: `${enemyUnitDef.id}-enemy-${Date.now()}-${Math.random().toString(16).slice(2)}`,
                            definitionId: enemyUnitDef.id,
                            hp: enemyUnitDef.hp, maxHp: enemyUnitDef.maxHp, damage: enemyUnitDef.damage,
                            attackSpeed: enemyUnitDef.attackSpeed, speed: enemyUnitDef.speed, attackRange: enemyUnitDef.attackRange,
                            x: ENEMY_SPAWN_X, 
                            y: 100 + Math.random() * (BATTLE_PATH_WIDTH_CONST/2 - 50), 
                            isPlayerUnit: false, isMoving: true, attackCooldownRemainingMs: 0,
                            stackSize: 1, 
                        };
                        newState.enemyUnits.push(newEnemyUnit);
                        newState.enemyBase.productionProgressMs = 0;
                    }
                }
            }
            
            // 4. Unit Movement
            [...newState.playerUnits, ...newState.enemyUnits].forEach(unit => {
                if (unit.hp <= 0 || !unit.isMoving) return;

                const target = unit.isPlayerUnit 
                    ? newState.enemyUnits.find(e => e.instanceId === unit.targetId && e.hp > 0) 
                    : newState.playerUnits.find(p => p.instanceId === unit.targetId && p.hp > 0);
                
                const movementAmount = unit.speed * (AUTOBATTLER_TICK_INTERVAL_MS / 1000) * state.gameSpeed;

                if (target) {
                    const dx = target.x - unit.x;
                    // const dy = target.y - unit.y; 
                    const dist = Math.abs(dx); // Assuming movement primarily on X for now for simplicity
                    if (dist > 0) { 
                        unit.x += (dx / dist) * movementAmount;
                        // unit.y += (dy / dist) * movementAmount; // If Y movement is significant
                    }
                } else { 
                    unit.x += unit.isPlayerUnit ? movementAmount : -movementAmount;
                }
                 // Keep unit within battle path roughly, can be refined
                unit.x = Math.max(0, Math.min(BATTLE_PATH_WIDTH_CONST, unit.x));

                if (unit.x > BATTLE_PATH_WIDTH_CONST + 50 || unit.x < -50) unit.hp = 0; // Despawn if way off
            });

            // 5. Unit Fusion (Player Units only for now)
            let playerUnitsAfterFusion: AutoBattlerUnit[] = [];
            let unitsToRemoveFromFusion = new Set<string>();

            for (let i = 0; i < newState.playerUnits.length; i++) {
                if (unitsToRemoveFromFusion.has(newState.playerUnits[i].instanceId)) continue;
                let unitA = { ...newState.playerUnits[i] };

                for (let j = i + 1; j < newState.playerUnits.length; j++) {
                    if (unitsToRemoveFromFusion.has(newState.playerUnits[j].instanceId)) continue;
                    let unitB = newState.playerUnits[j];

                    if (unitA.definitionId === unitB.definitionId && Math.hypot(unitA.x - unitB.x, unitA.y - unitB.y) < AUTOBATTLER_FUSION_RADIUS) {
                        unitA.stackSize += unitB.stackSize;
                        unitsToRemoveFromFusion.add(unitB.instanceId);
                    }
                }
                playerUnitsAfterFusion.push(unitA);
            }
            newState.playerUnits = playerUnitsAfterFusion;

            // 6. Unit Logic (Cooldowns, Target Acquisition, Attack Action Generation)
            const allUnits = [...newState.playerUnits, ...newState.enemyUnits];
            allUnits.forEach(unit => {
                if (unit.hp <= 0) return; 

                if (unit.attackCooldownRemainingMs && unit.attackCooldownRemainingMs > 0) {
                    unit.attackCooldownRemainingMs = Math.max(0, unit.attackCooldownRemainingMs - (AUTOBATTLER_TICK_INTERVAL_MS * state.gameSpeed));
                }

                const potentialTargets = unit.isPlayerUnit ? newState.enemyUnits.filter(e => e.hp > 0) : newState.playerUnits.filter(p => p.hp > 0);
                let currentTarget = potentialTargets.find(t => t.instanceId === unit.targetId);

                if (currentTarget) {
                    const distanceToCurrentTarget = Math.hypot(unit.x - currentTarget.x, unit.y - currentTarget.y);
                    if (currentTarget.hp <= 0 || distanceToCurrentTarget > unit.attackRange * 1.2) { 
                        currentTarget = undefined;
                        unit.targetId = null;
                        unit.isMoving = true;
                    }
                }
                
                if (!currentTarget) {
                    unit.isMoving = true; 
                    for (const potentialTarget of potentialTargets) {
                        if (Math.hypot(unit.x - potentialTarget.x, unit.y - potentialTarget.y) <= unit.attackRange) {
                            unit.targetId = potentialTarget.instanceId;
                            currentTarget = potentialTarget;
                            unit.isMoving = false;
                            break;
                        }
                    }
                } else { 
                     const distanceToTarget = Math.hypot(unit.x - currentTarget.x, unit.y - currentTarget.y);
                     if(distanceToTarget <= unit.attackRange) {
                        unit.isMoving = false; 
                     } else {
                        unit.isMoving = true; 
                     }
                }
                                
                if (!unit.isMoving && currentTarget && unit.targetId && unit.attackCooldownRemainingMs <= 0) {
                     newAttackActionsToDispatch.push({ type: 'AUTOBATTLER_UNIT_ATTACK', payload: { attackerId: unit.instanceId, targetId: unit.targetId } });
                     unit.attackCooldownRemainingMs = unit.attackSpeed;
                }
            });
            
            newState.gameTime += 1;
            let stateAfterTickProcessing: GameState = { ...state, autoBattler: newState };
            
            newAttackActionsToDispatch.forEach(attackAction => {
                stateAfterTickProcessing = autoBattlerReducer(stateAfterTickProcessing, attackAction as any);
            });

            // 7. HP / Stack Cleanup
            if (stateAfterTickProcessing.autoBattler) {
                const processStackedUnits = (units: AutoBattlerUnit[]): AutoBattlerUnit[] => {
                    return units.map(unit => {
                        if (unit.hp <= 0) {
                            if (unit.stackSize > 1) {
                                return { ...unit, stackSize: unit.stackSize - 1, hp: unit.maxHp };
                            }
                            return null; 
                        }
                        return unit;
                    }).filter(Boolean) as AutoBattlerUnit[];
                };
                stateAfterTickProcessing.autoBattler.playerUnits = processStackedUnits(stateAfterTickProcessing.autoBattler.playerUnits);
                stateAfterTickProcessing.autoBattler.enemyUnits = processStackedUnits(stateAfterTickProcessing.autoBattler.enemyUnits); 
            }
            
            return stateAfterTickProcessing;
        }
        case 'AUTOBATTLER_UNIT_ATTACK': {
            if (!state.autoBattler) return state;
            const { attackerId, targetId } = action.payload;
            const currentAutoBattler = state.autoBattler;
            
            const playerUnits = currentAutoBattler.playerUnits.map(u => ({ ...u }));
            const enemyUnits = currentAutoBattler.enemyUnits.map(u => ({ ...u }));

            const attacker = playerUnits.find(u => u.instanceId === attackerId) || enemyUnits.find(u => u.instanceId === attackerId);
            let target = playerUnits.find(u => u.instanceId === targetId) || enemyUnits.find(u => u.instanceId === targetId);

            if (attacker && target && target.hp > 0) {
                const damageDealt = attacker.damage * attacker.stackSize; 
                target.hp -= damageDealt;
                if (target.hp <= 0) {
                    target.hp = 0;
                }
            }
            return { 
                ...state, 
                autoBattler: {
                    ...currentAutoBattler,
                    playerUnits,
                    enemyUnits,
                } 
            };
        }
        default:
            return state;
    }
};
