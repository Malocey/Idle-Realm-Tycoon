import React, { useRef, useEffect } from 'react';
import { CanvasParticle, Projectile } from '../types';
import { GAME_TICK_MS } from '../constants';
import { renderParticles, renderProjectiles } from './GameCanvas/index'; 

interface GameCanvasProps {
  particles: CanvasParticle[];
  setParticles: React.Dispatch<React.SetStateAction<CanvasParticle[]>>;
  projectiles: Projectile[];
  width: number;
  height: number;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ particles, setParticles, projectiles, width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameIdRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    const render = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);

      // Call modularized render functions
      renderParticles(context, particles, setParticles);
      renderProjectiles(context, projectiles);

      animationFrameIdRef.current = requestAnimationFrame(render);
    };

    animationFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameIdRef.current);
    };
  }, [particles, projectiles, setParticles, width, height]); 

  return <canvas ref={canvasRef} width={width} height={height} className="absolute top-0 left-0 pointer-events-none" style={{ zIndex: 20 }} />;
};

export default GameCanvas;