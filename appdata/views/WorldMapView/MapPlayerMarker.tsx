
import React from 'react';
import { ICONS } from '../../components/Icons';

interface MapPlayerMarkerProps {
  position: { x: number; y: number };
  isMoving: boolean;
}

const MapPlayerMarker: React.FC<MapPlayerMarkerProps> = ({ position, isMoving }) => {
  return (
    <div
      className="absolute p-1 bg-white/30 rounded-full shadow-xl border-2 border-white pointer-events-none"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: 'translate(-50%, -50%) scale(0.7)',
        zIndex: 15,
        transition: isMoving ? 'none' : 'left 0.1s linear, top 0.1s linear',
      }}
      title="Your Party"
    >
      {ICONS.HERO && <ICONS.HERO className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-300 filter drop-shadow(0 1px 1px rgba(0,0,0,0.5))" />}
    </div>
  );
};

export default MapPlayerMarker;
