import { Projectile } from '../../types';
import { PROJECTILE_SIZE_PX } from '../../constants';

export const renderProjectiles = (
  context: CanvasRenderingContext2D,
  projectiles: Projectile[]
): void => {
  // Render Projectile Trails
  projectiles.forEach(proj => {
    if (proj.previousPositions && proj.previousPositions.length > 0) {
        const baseTrailWidth = PROJECTILE_SIZE_PX * 0.3; 
        proj.previousPositions.forEach(segment => {
            context.save();
            context.translate(segment.x, segment.y);
            context.rotate(segment.rotation * Math.PI / 180); 

            const trailLength = PROJECTILE_SIZE_PX * 1.0; 
            
            const redComponent = Math.floor(255 - (1 - segment.opacity) * 100);
            const greenComponent = Math.floor(255 - (1 - segment.opacity) * 150);
            const blueComponent = Math.floor(200 - (1 - segment.opacity) * 200);

            context.beginPath();
            context.moveTo(0, -trailLength / 2); 
            context.lineTo(0, trailLength / 2);
            context.lineWidth = Math.max(0.1, baseTrailWidth * segment.opacity); 
            context.strokeStyle = `rgba(${redComponent}, ${greenComponent}, ${blueComponent}, ${segment.opacity * 0.7})`;
            context.stroke();
            context.restore();
        });
    }
  });
  
  // Render Projectiles
  projectiles.forEach(proj => {
    context.save();
    context.translate(proj.currentX, proj.currentY);
    context.rotate(proj.rotation * Math.PI / 180);
    
    context.beginPath();
    context.moveTo(0, -PROJECTILE_SIZE_PX * 0.8); 
    context.lineTo(PROJECTILE_SIZE_PX * 0.4, PROJECTILE_SIZE_PX * 0.4); 
    context.lineTo(-PROJECTILE_SIZE_PX * 0.4, PROJECTILE_SIZE_PX * 0.4); 
    context.closePath();
    context.fillStyle = 'rgba(255, 230, 180, 0.9)'; 
    context.strokeStyle = 'rgba(200, 150, 50, 0.9)';
    context.lineWidth = 1;
    context.fill();
    context.stroke();
    
    context.restore();
  });
};