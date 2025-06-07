import React from 'react';
import { CanvasParticle } from '../../types';
import { GAME_TICK_MS } from '../../constants';

export const renderParticles = (
  context: CanvasRenderingContext2D,
  particles: CanvasParticle[],
  setParticles: React.Dispatch<React.SetStateAction<CanvasParticle[]>>
): void => {
  let updatedParticles = particles.map(p => {
    const newLife = p.life - GAME_TICK_MS; 
    if (newLife <= 0) return null;

    let newVx = p.velocityX;
    let newVy = p.velocityY;

    if (p.type === 'heal_custom') {
      newVy -= 20 * (GAME_TICK_MS / 1000); 
    } else {
       newVy += 30 * (GAME_TICK_MS / 1000); 
    }

    return {
      ...p,
      x: p.x + newVx * (GAME_TICK_MS / 1000),
      y: p.y + newVy * (GAME_TICK_MS / 1000),
      life: newLife,
      velocityX: newVx,
      velocityY: newVy,
    };
  }).filter(Boolean) as CanvasParticle[];

  updatedParticles.forEach(p => {
    const initialLifeEstimate = 500; 
    const lifeRatio = Math.max(0, p.life / initialLifeEstimate);
    
    context.beginPath();
    context.globalAlpha = Math.max(0, lifeRatio * 0.9); 

    if (p.type === 'heal_custom') {
        context.shadowColor = 'rgba(150, 255, 150, 0.7)';
        context.shadowBlur = 8;

        context.fillStyle = p.color; 
        context.font = `${p.size * lifeRatio * 2.0}px sans-serif`;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText('+', p.x, p.y);

        context.shadowColor = 'transparent';
        context.shadowBlur = 0;
    } else if (p.type === 'hit') {
        context.strokeStyle = p.color;
        context.lineWidth = Math.max(0.5, p.size * 0.35 * lifeRatio); 
        const lineLength = p.size * 2.0 * lifeRatio; 

        if (lineLength > 0.5) { 
            context.moveTo(p.x - lineLength / 2, p.y);
            context.lineTo(p.x + lineLength / 2, p.y);
            context.moveTo(p.x, p.y - lineLength / 2);
            context.lineTo(p.x, p.y + lineLength / 2);
            context.stroke();
        }
    } else if (p.type === 'crit') {
        context.strokeStyle = p.color;
        context.lineWidth = Math.max(0.5, p.size * 0.45 * lifeRatio); 
        const critLineLength = p.size * 2.5 * lifeRatio; 

        if (critLineLength > 0.5) { 
            context.shadowColor = p.color; 
            context.shadowBlur = 8; 

            context.moveTo(p.x - critLineLength / 2, p.y);
            context.lineTo(p.x + critLineLength / 2, p.y);
            context.moveTo(p.x, p.y - critLineLength / 2);
            context.lineTo(p.x, p.y + critLineLength / 2);

            const diagOffset = critLineLength / 2 * 0.7071; 
            context.moveTo(p.x - diagOffset, p.y - diagOffset);
            context.lineTo(p.x + diagOffset, p.y + diagOffset);
            context.moveTo(p.x - diagOffset, p.y + diagOffset);
            context.lineTo(p.x + diagOffset, p.y - diagOffset);
            
            context.stroke();

            context.shadowColor = 'transparent'; 
            context.shadowBlur = 0;
        }
    }
    context.globalAlpha = 1; 
  });
  setParticles(updatedParticles);
};