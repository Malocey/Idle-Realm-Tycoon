
import React, { useRef, useEffect, useState } from 'react';
import { FusionAnchor, FeederParticle } from '../types';
import {
  FEEDER_PARTICLE_DURATION_MS,
  FEEDER_GRAVITY,
  FUSION_ANCHOR_FADE_OUT_DURATION_MS,
  FUSION_COUNT_UP_DURATION_MS,
  FUSION_CRIT_SHAKE_DURATION_MS,
  FUSION_CRIT_SHAKE_MAGNITUDE_PX,
  FUSION_FONT_SIZE_BASE_PX,
  FUSION_FONT_SIZE_TIER_1_THRESHOLD, FUSION_FONT_SIZE_TIER_1_PX,
  FUSION_FONT_SIZE_TIER_2_THRESHOLD, FUSION_FONT_SIZE_TIER_2_PX,
  FUSION_FONT_SIZE_TIER_3_THRESHOLD, FUSION_FONT_SIZE_TIER_3_PX,
  FUSION_FONT_SIZE_TIER_4_THRESHOLD, FUSION_FONT_SIZE_TIER_4_PX,
  FUSION_FONT_SIZE_MAX_THRESHOLD, FUSION_FONT_SIZE_MAX_PX,
  FUSION_NORMAL_COLOR, FUSION_NORMAL_STROKE_COLOR,
  FUSION_CRITICAL_COLOR, FUSION_CRITICAL_STROKE_COLOR,
  FUSION_HEAL_COLOR, FUSION_HEAL_STROKE_COLOR, 
  FUSION_SHIELD_COLOR, FUSION_SHIELD_STROKE_COLOR, 
  FEEDER_FONT_SIZE_PX,
  FEEDER_NORMAL_COLOR, FEEDER_NORMAL_STROKE_COLOR,
  FEEDER_CRITICAL_COLOR, FEEDER_CRITICAL_STROKE_COLOR,
  FEEDER_HEAL_COLOR, FEEDER_HEAL_STROKE_COLOR,
  FEEDER_SHIELD_COLOR, FEEDER_SHIELD_STROKE_COLOR,
  CRIT_EFFECT_DURATION_MS, // Make sure this is defined in constants, e.g., 2000
} from '../constants/uiConstants'; // Ensure CRIT_EFFECT_DURATION_MS is exported
import { usePrevious } from '../hooks/usePrevious';
import { formatNumber } from '../utils';
import { interpolateColor, hexToRgb } from '../utils/uiHelpers'; // Added hexToRgb


interface BattleEffectsCanvasProps {
  anchors: FusionAnchor[];
  particles: FeederParticle[]; 
}

interface AnchorAnimationState {
  displayAmount: number; // What's currently drawn on screen
  targetAmount: number;  // The actual totalAmount from the anchor prop
  countUpStartTime: number; // When the count-up animation for the current targetAmount should start
  critShakeStartTime: number; // When the critical hit shake animation started for the latest crit
  lastCritTimestampForShake: number; // Tracks which crit the current shake belongs to
  isVisible: boolean; 
  firstHitLandedTime: number | null; 
}

const PARTICLE_ARC_DURATION_FACTOR = 0.7; // Critical particles arc for 70% of their duration
const INITIAL_ORBIT_RADIUS_PX = 25;
const ORBIT_ROTATIONS = 1;


const BattleEffectsCanvas: React.FC<BattleEffectsCanvasProps> = ({ anchors, particles }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [anchorAnimStates, setAnchorAnimStates] = useState<Record<string, AnchorAnimationState>>({});
  const prevAnchors = usePrevious(anchors);
  const animationFrameIdRef = useRef<number | null>(null);

  useEffect(() => {
    setAnchorAnimStates(prevStates => {
      const newStates: Record<string, AnchorAnimationState> = {};
      let statesChangedOverall = false;

      anchors.forEach(anchor => {
        const prevAnchorData = prevAnchors?.find(pa => pa.id === anchor.id);
        const existingState = prevStates[anchor.id];
        let currentStateForUpdate = existingState 
            ? { ...existingState } 
            : { // Default for new anchor
                displayAmount: 0,
                targetAmount: anchor.totalAmount,
                countUpStartTime: 0,
                critShakeStartTime: anchor.lastCritTimestamp > 0 ? Date.now() : 0,
                lastCritTimestampForShake: anchor.lastCritTimestamp,
                isVisible: false,
                firstHitLandedTime: Date.now() + FEEDER_PARTICLE_DURATION_MS,
              };
        
        let thisAnchorStateChanged = false;

        if (!existingState) { // New anchor
            thisAnchorStateChanged = true;
            // Schedule count-up for new anchors if they have an initial amount
            if (anchor.totalAmount > 0) {
                 setTimeout(() => {
                    setAnchorAnimStates(prev => ({
                        ...prev,
                        [anchor.id]: { ...(prev[anchor.id] || currentStateForUpdate), countUpStartTime: Date.now() }
                    }));
                }, FEEDER_PARTICLE_DURATION_MS);
            }
        } else { // Existing anchor
            if (anchor.totalAmount !== existingState.targetAmount) {
                currentStateForUpdate.targetAmount = anchor.totalAmount;
                // Schedule count-up, displayAmount will start from current existingState.displayAmount
                setTimeout(() => {
                    setAnchorAnimStates(prev => {
                        const latestState = prev[anchor.id];
                        return {
                           ...prev,
                           [anchor.id]: {
                               ...(latestState || currentStateForUpdate),
                               displayAmount: latestState?.displayAmount || 0, // Ensure we use the current displayAmount before timeout
                               countUpStartTime: Date.now(),
                           }
                        };
                    });
                }, FEEDER_PARTICLE_DURATION_MS);
                thisAnchorStateChanged = true;
            }

            if (anchor.lastCritTimestamp > (existingState.lastCritTimestampForShake || 0)) {
                currentStateForUpdate.critShakeStartTime = Date.now();
                currentStateForUpdate.lastCritTimestampForShake = anchor.lastCritTimestamp;
                thisAnchorStateChanged = true;
            }
        }
        
        if (currentStateForUpdate.firstHitLandedTime !== null && Date.now() >= currentStateForUpdate.firstHitLandedTime && !currentStateForUpdate.isVisible) {
            currentStateForUpdate.isVisible = true;
            thisAnchorStateChanged = true;
        }
        
        newStates[anchor.id] = currentStateForUpdate;
        if(thisAnchorStateChanged) statesChangedOverall = true;
      });
      
      Object.keys(prevStates).forEach(id => {
        if (!anchors.find(a => a.id === id)) {
          // Anchor removed
          statesChangedOverall = true; 
        } else if (!newStates[id]) {
            // Anchor exists but wasn't processed above (shouldn't happen if logic is correct)
            // Carry over if no changes, but this case should be covered by `currentStateForUpdate = existingState`
            newStates[id] = prevStates[id];
        }
      });
      if(Object.keys(newStates).length !== Object.keys(prevStates).length && !statesChangedOverall) statesChangedOverall = true;


      return statesChangedOverall ? newStates : prevStates;
    });
  }, [anchors, prevAnchors]);


  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      if (canvas.parentElement) {
        canvas.width = canvas.parentElement.offsetWidth;
        canvas.height = canvas.parentElement.offsetHeight;
      }
    };
    
    let parentCheckInterval: number | undefined;
    if (!canvas.parentElement) {
        parentCheckInterval = window.setInterval(() => {
            if (canvas.parentElement) {
                clearInterval(parentCheckInterval);
                parentCheckInterval = undefined;
                resizeCanvas();
            }
        }, 50);
    } else {
        resizeCanvas();
    }
    window.addEventListener('resize', resizeCanvas);

    return () => {
      if (parentCheckInterval) clearInterval(parentCheckInterval);
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const now = Date.now();

      // --- Render Feeder Particles ---
      particles.forEach(particle => {
        const cardElement = document.getElementById(`participant-card-${particle.targetAnchorId}`);
        const anchorData = anchors.find(a => a.id === particle.targetAnchorId); // Use current anchors prop
        if (!cardElement || !anchorData) return;

        const canvasRect = canvas.getBoundingClientRect();
        const cardRect = cardElement.getBoundingClientRect();

        const startX_canvas = (cardRect.left - canvasRect.left) + cardRect.width / 2;
        const startY_canvas = (cardRect.top - canvasRect.top) + cardRect.height / 2;

        const anchorPointX_canvas = (cardRect.left - canvasRect.left) + cardRect.width / 2 + anchorData.anchorX;
        const anchorPointY_canvas = (cardRect.top - canvasRect.top) + cardRect.height / 2 + anchorData.anchorY;
        
        const particleDurationSec = FEEDER_PARTICLE_DURATION_MS / 1000.0;
        const timeSinceSpawnSec = (now - particle.timestamp) / 1000.0;
        const t_overall = Math.min(1.0, timeSinceSpawnSec / particleDurationSec);

        if (t_overall >= 1.0) return; // Particle has "landed" or expired

        let currentX: number;
        let currentY: number;
        let alpha: number;

        if (particle.isCritical) {
            const arcPhaseEndTime = PARTICLE_ARC_DURATION_FACTOR; // Time (0-1) when arc ends and orbit begins
            const orbitPhaseDuration = 1.0 - arcPhaseEndTime;

            if (t_overall < arcPhaseEndTime) { // Phase 1: Arc
                const t_phase1 = t_overall / arcPhaseEndTime;
                const p1_durationSec = particleDurationSec * arcPhaseEndTime;
                const p1_timeSinceSpawnSec = timeSinceSpawnSec;

                const initialVelocityX_p1 = (anchorPointX_canvas - startX_canvas) / p1_durationSec;
                const initialVelocityY_p1 = (anchorPointY_canvas - startY_canvas - 0.5 * FEEDER_GRAVITY * p1_durationSec * p1_durationSec) / p1_durationSec;

                currentX = startX_canvas + initialVelocityX_p1 * p1_timeSinceSpawnSec;
                currentY = startY_canvas + initialVelocityY_p1 * p1_timeSinceSpawnSec + 0.5 * FEEDER_GRAVITY * p1_timeSinceSpawnSec * p1_timeSinceSpawnSec;
                alpha = 1.0; // Fully visible during arc
            } else { // Phase 2: Orbit and Lunge
                const t_phase2 = (t_overall - arcPhaseEndTime) / orbitPhaseDuration;
                const orbitCenterX = anchorPointX_canvas;
                const orbitCenterY = anchorPointY_canvas;

                const currentOrbitRadius = INITIAL_ORBIT_RADIUS_PX * (1 - Math.pow(t_phase2, 2)); // Radius shrinks faster towards end
                const currentOrbitAngle = (ORBIT_ROTATIONS * 2 * Math.PI) * t_phase2 + (particle.id.charCodeAt(0) % 6); // Offset start angle a bit for variety

                currentX = orbitCenterX + currentOrbitRadius * Math.cos(currentOrbitAngle);
                currentY = orbitCenterY + currentOrbitRadius * Math.sin(currentOrbitAngle);
                alpha = 1.0 - t_phase2; // Fade out during orbit/lunge
            }
        } else { // Normal Particle
            const initialVelocityX = (anchorPointX_canvas - startX_canvas) / particleDurationSec;
            const initialVelocityY = (anchorPointY_canvas - startY_canvas - 0.5 * FEEDER_GRAVITY * particleDurationSec * particleDurationSec) / particleDurationSec;
            currentX = startX_canvas + initialVelocityX * timeSinceSpawnSec;
            currentY = startY_canvas + initialVelocityY * timeSinceSpawnSec + 0.5 * FEEDER_GRAVITY * timeSinceSpawnSec * timeSinceSpawnSec;
            alpha = Math.max(0, 1 - Math.pow(t_overall, 3)); // Original fade out
        }

        ctx.globalAlpha = Math.max(0, alpha);
        ctx.font = `bold ${FEEDER_FONT_SIZE_PX}px 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const particleText = particle.amount.toString() + (particle.isCritical ? "!" : "");
        if (particle.isCritical) {
            ctx.fillStyle = FEEDER_CRITICAL_COLOR;
            ctx.strokeStyle = FEEDER_CRITICAL_STROKE_COLOR;
        } else {
            ctx.fillStyle = FEEDER_NORMAL_COLOR;
            ctx.strokeStyle = FEEDER_NORMAL_STROKE_COLOR;
        }
        ctx.lineWidth = 1.5;
        ctx.strokeText(particleText, currentX, currentY);
        ctx.fillText(particleText, currentX, currentY);
      });


      // --- Render Fusion Anchors ---
      anchors.forEach(anchor => {
        const animState = anchorAnimStates[anchor.id];
        if (!animState || !animState.isVisible) return;
        
        const timeSinceLastActualUpdate = now - anchor.lastUpdateTime;
        if (timeSinceLastActualUpdate > FUSION_ANCHOR_FADE_OUT_DURATION_MS && animState.displayAmount === anchor.totalAmount && animState.targetAmount === anchor.totalAmount) {
          return; 
        }

        const cardElement = document.getElementById(`participant-card-${anchor.targetParticipantId}`);
        if (!cardElement) return;

        const canvasRect = canvas.getBoundingClientRect();
        const cardRect = cardElement.getBoundingClientRect();
        
        const originX = (cardRect.left - canvasRect.left) + cardRect.width / 2 + anchor.anchorX;
        const originY = (cardRect.top - canvasRect.top) + cardRect.height / 2 + anchor.anchorY;
        
        const fadeOutProgress = Math.min(1, timeSinceLastActualUpdate / FUSION_ANCHOR_FADE_OUT_DURATION_MS);
        ctx.globalAlpha = Math.max(0, 1 - Math.pow(fadeOutProgress, 2));
        if (ctx.globalAlpha <= 0.01 && animState.displayAmount === anchor.totalAmount) return;


        let currentDisplayAmount = animState.displayAmount;
        if (animState.countUpStartTime > 0 && animState.targetAmount !== animState.displayAmount) {
            const elapsedCountUp = now - animState.countUpStartTime;
            if (elapsedCountUp < FUSION_COUNT_UP_DURATION_MS) {
                const countUpProgress = elapsedCountUp / FUSION_COUNT_UP_DURATION_MS;
                currentDisplayAmount = Math.round(animState.displayAmount + (animState.targetAmount - animState.displayAmount) * countUpProgress);
            } else {
                currentDisplayAmount = animState.targetAmount;
                // Consider resetting countUpStartTime to 0 here if not handled by useEffect logic for state update
                setAnchorAnimStates(prev => ({...prev, [anchor.id]: {...prev[anchor.id], displayAmount: animState.targetAmount, countUpStartTime: 0 }}));
            }
        } else if (animState.countUpStartTime === 0 && animState.displayAmount !== animState.targetAmount) {
            // This case might occur if countUpStartTime was reset but displayAmount hasn't reached targetAmount yet.
            // Usually, the useEffect triggering count-up should handle setting targetAmount and then scheduling countUpStartTime.
            // For safety, can directly set displayAmount to targetAmount if no animation is active.
             currentDisplayAmount = animState.targetAmount;
             if (animState.displayAmount !== currentDisplayAmount) {
                 setAnchorAnimStates(prev => ({...prev, [anchor.id]: {...prev[anchor.id], displayAmount: currentDisplayAmount }}));
             }
        }


        let fontSize = FUSION_FONT_SIZE_BASE_PX;
        if (currentDisplayAmount >= FUSION_FONT_SIZE_MAX_THRESHOLD) fontSize = FUSION_FONT_SIZE_MAX_PX;
        else if (currentDisplayAmount >= FUSION_FONT_SIZE_TIER_4_THRESHOLD) fontSize = FUSION_FONT_SIZE_TIER_4_PX;
        else if (currentDisplayAmount >= FUSION_FONT_SIZE_TIER_3_THRESHOLD) fontSize = FUSION_FONT_SIZE_TIER_3_PX;
        else if (currentDisplayAmount >= FUSION_FONT_SIZE_TIER_2_THRESHOLD) fontSize = FUSION_FONT_SIZE_TIER_2_PX;
        else if (currentDisplayAmount >= FUSION_FONT_SIZE_TIER_1_THRESHOLD) fontSize = FUSION_FONT_SIZE_TIER_1_PX;
        
        ctx.font = `bold ${fontSize}px 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        let textToDraw = formatNumber(currentDisplayAmount);
        let currentX = originX;
        let currentY = originY;

        const timeSinceCrit = now - anchor.lastCritTimestamp;
        const isInCritDisplayState = anchor.lastCritTimestamp > 0 && timeSinceCrit < CRIT_EFFECT_DURATION_MS;
        
        let textColor = FUSION_NORMAL_COLOR;
        let strokeColor = FUSION_NORMAL_STROKE_COLOR;
        let symbolAlpha = 1.0;

        if (isInCritDisplayState) {
            const critFadeProgress = timeSinceCrit / CRIT_EFFECT_DURATION_MS;
            textColor = interpolateColor(FUSION_CRITICAL_COLOR, FUSION_NORMAL_COLOR, critFadeProgress);
            strokeColor = interpolateColor(FUSION_CRITICAL_STROKE_COLOR, FUSION_NORMAL_STROKE_COLOR, critFadeProgress);
            symbolAlpha = 1.0 - critFadeProgress;
            textToDraw += '!';
            
            if ((now - (animState.critShakeStartTime || 0)) < FUSION_CRIT_SHAKE_DURATION_MS && animState.lastCritTimestampForShake === anchor.lastCritTimestamp) {
                currentX += (Math.random() - 0.5) * FUSION_CRIT_SHAKE_MAGNITUDE_PX * 2;
                currentY += (Math.random() - 0.5) * FUSION_CRIT_SHAKE_MAGNITUDE_PX * 2;
            }
        }
        
        ctx.fillStyle = textColor;
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = Math.max(1, fontSize / 9);
        
        ctx.shadowColor = 'rgba(0,0,0,0.6)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 1.5;
        ctx.shadowOffsetY = 1.5;

        ctx.strokeText(textToDraw, currentX, currentY);
        ctx.fillText(textToDraw, currentX, currentY);
        
        ctx.shadowColor = 'transparent'; 
      });

      ctx.globalAlpha = 1.0;
      animationFrameIdRef.current = requestAnimationFrame(render);
    };

    if (anchors.length > 0 || particles.length > 0 || Object.keys(anchorAnimStates).some(id => anchorAnimStates[id].isVisible)) {
      if (!animationFrameIdRef.current) {
        animationFrameIdRef.current = requestAnimationFrame(render);
      }
    } else {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
      }
    };
  }, [anchors, particles, anchorAnimStates, canvasRef.current]);


  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full pointer-events-none"
      style={{ zIndex: 30 }} 
      aria-hidden="true"
    />
  );
};

export default BattleEffectsCanvas;
