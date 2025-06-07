
import React from 'react';

export interface BarColorConfig {
  fill: string;
  background: string;
  // border?: string; // Removed optional border
}

// BAR_BORDER_RADIUS constant removed

export function drawBar(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  percentage: number, // 0-100
  colorConfig: BarColorConfig
): void {
  // Background
  ctx.fillStyle = colorConfig.background;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Fill
  if (percentage > 0) {
    const fillWidth = (canvasWidth * Math.max(0, Math.min(100, percentage))) / 100;
    if (fillWidth > 0) { 
        ctx.fillStyle = colorConfig.fill;
        ctx.fillRect(0, 0, fillWidth, canvasHeight);
    }
  }
  // Border logic removed
}
