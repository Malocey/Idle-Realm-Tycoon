
import React, { useRef, useEffect } from 'react';
import { PlayerSharedSkillsState, SharedSkillDefinition } from '../types';

interface AnimatedStarfieldCanvasProps {
  playerSkills?: PlayerSharedSkillsState;
  skillDefinitions?: Record<string, SharedSkillDefinition>;
  nodePositions?: Record<string, {x: number, y: number}>;
  contentOffset?: { top: number; left: number }; // New prop
}

const LIGHT_COLORS = [
  'rgba(100, 180, 255, 0.1)', // Soft Blue
  'rgba(255, 210, 100, 0.12)', // Soft Amber
  'rgba(120, 220, 180, 0.1)', // Soft Teal
  'rgba(200, 150, 255, 0.1)', // Soft Purple
];

const AnimatedStarfieldCanvas: React.FC<AnimatedStarfieldCanvasProps> = ({
  playerSkills,
  skillDefinitions,
  nodePositions,
  contentOffset = { top: 0, left: 0 } // Default offset
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const resizeCanvas = () => {
      if (canvas.parentElement) {
        canvas.width = canvas.parentElement.offsetWidth;
        canvas.height = canvas.parentElement.offsetHeight;
      }
    };

    const initialResizeTimeout = setTimeout(resizeCanvas, 0);

    const draw = () => {
      if (!canvasRef.current || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (playerSkills && skillDefinitions && nodePositions) {
        Object.values(skillDefinitions).forEach((skillDef, index) => {
          const skillProgress = playerSkills[skillDef.id];
          const majorLevel = skillProgress?.currentMajorLevel || 0;

          if (majorLevel > 0 && skillDef.position) {
            const relativePos = nodePositions[skillDef.id];
            if (relativePos) {
              const absoluteX = relativePos.x + contentOffset.left;
              const absoluteY = relativePos.y + contentOffset.top;

              const baseGlowRadius = 40;
              const radiusPerMajorLevel = 25;
              const minorLevelContribution = (skillProgress?.currentMinorLevel || 0) * 3;
              const glowRadius = baseGlowRadius + (majorLevel * radiusPerMajorLevel) + minorLevelContribution;

              const colorIndex = index % LIGHT_COLORS.length;
              const baseColor = LIGHT_COLORS[colorIndex].substring(0, LIGHT_COLORS[colorIndex].lastIndexOf(','))

              const gradient = ctx.createRadialGradient(absoluteX, absoluteY, 0, absoluteX, absoluteY, glowRadius);
              gradient.addColorStop(0, `${baseColor}, 0.15)`);
              gradient.addColorStop(0.4 + Math.random()*0.1, `${baseColor}, 0.08)`);
              gradient.addColorStop(1, `${baseColor}, 0)`);

              ctx.fillStyle = gradient;
              ctx.beginPath();
              ctx.arc(absoluteX, absoluteY, glowRadius, 0, Math.PI * 2);
              ctx.fill();

              const corePulseFactor = Math.sin(Date.now() / (500 + (index * 50))) * 0.2 + 0.8;
              const coreRadius = 5 + majorLevel * 1.5 * corePulseFactor;
              ctx.beginPath();
              ctx.arc(absoluteX, absoluteY, coreRadius, 0, Math.PI * 2);
              ctx.fillStyle = `${baseColor}, ${0.2 + majorLevel * 0.05})`;
              ctx.fill();
            }
          }
        });
      }
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();
    window.addEventListener('resize', resizeCanvas);
    return () => {
      clearTimeout(initialResizeTimeout);
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [playerSkills, skillDefinitions, nodePositions, contentOffset]); // Added contentOffset

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  );
};

export default AnimatedStarfieldCanvas;
