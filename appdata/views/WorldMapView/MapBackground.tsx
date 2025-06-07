
import React from 'react';

interface MapBackgroundProps {
  mapId: string;
}

const MapBackground: React.FC<MapBackgroundProps> = ({ mapId }) => {
  // This component's content is identical to the original MapBackgroundRenderer in WorldMapView.tsx
  // Ensure to copy the switch statement logic here.
  switch (mapId) {
    case 'verdant_plains':
      return (
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-0 -z-20">
          <div className="col-span-3 row-span-1 bg-slate-500 flex items-center justify-center p-2"><span className="text-xs text-slate-100 opacity-70 transform -rotate-3">The Frostpeaks</span></div>
          <div className="col-span-1 row-span-1 bg-emerald-700 flex items-center justify-center p-2"><span className="text-xs text-emerald-100 opacity-70">Whispering Woods (Region)</span></div>
          <div className="col-span-1 row-span-1 bg-green-600 flex items-center justify-center p-2"><span className="text-xs text-green-100 opacity-70">Emerald Plains</span></div>
          <div className="col-span-1 row-span-1 bg-emerald-700 flex items-center justify-center p-2"><span className="text-xs text-emerald-100 opacity-70">Verdant Thicket</span></div>
          <div className="col-span-3 row-span-1 bg-blue-600 flex items-center justify-center p-2"><span className="text-lg text-blue-100 opacity-50 font-serif">The Azure Expanse</span></div>
        </div>
      );
    case 'whispering_woods':
      return (
        <div className="absolute inset-0 bg-emerald-900 -z-20 overflow-hidden">
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-amber-900/70 blur-sm"></div>
          <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-green-800/50 rounded-full blur-xl opacity-70"></div>
          <div className="absolute -top-1/3 -right-1/3 w-2/3 h-1/2 bg-emerald-700/40 rounded-full blur-2xl opacity-60"></div>
          <div className="absolute bottom-0 left-1/4 w-1/3 h-1/3 bg-lime-800/30 rounded-t-full blur-lg opacity-50"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl font-serif text-emerald-200/30 opacity-60 transform -rotate-6 select-none">Whispering Woods</span>
          </div>
        </div>
      );
    case 'burning_desert':
      return (
        <div className="absolute inset-0 bg-gradient-to-b from-orange-300 via-yellow-400 to-amber-600 -z-20 overflow-hidden">
          <div className="absolute bottom-0 left-0 w-full h-1/3 bg-amber-800/80 rounded-t-full blur-md"></div>
          <div className="absolute bottom-0 right-0 w-2/3 h-1/2 bg-orange-700/70 rounded-tl-full blur-lg opacity-80"></div>
          <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-200 rounded-full opacity-70 blur-sm animate-pulse animation-delay-500"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-5xl font-serif text-red-800/40 opacity-70 transform rotate-3 select-none" style={{ fontFamily: "'Papyrus', fantasy" }}>The Burning Desert</span>
          </div>
        </div>
      );
    case 'frozen_peaks':
      return (
        <div className="absolute inset-0 bg-gradient-to-b from-sky-600 via-blue-700 to-slate-800 -z-20 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-white/20 rounded-full blur-2xl opacity-50 animate-pulse"></div>
          <div className="absolute -bottom-1/4 -right-1/4 w-3/4 h-3/4 bg-sky-400/30 rounded-full blur-xl opacity-60"></div>
          <div className="absolute bottom-0 left-0 w-1/3 h-2/3 bg-slate-500" style={{ clipPath: 'polygon(0% 100%, 50% 0%, 100% 100%)' }}></div>
          <div className="absolute bottom-0 right-0 w-1/2 h-3/4 bg-slate-600 opacity-80" style={{ clipPath: 'polygon(0% 100%, 70% 10%, 100% 100%)' }}></div>
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/4 h-1/2 bg-slate-400 opacity-90" style={{ clipPath: 'polygon(20% 100%, 50% 0%, 80% 100%)' }}></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-5xl font-bold text-white/40 opacity-70 select-none" style={{ fontFamily: "'Impact', fantasy" }}>Frozen Peaks</span>
          </div>
        </div>
      );
    default:
      return <div className="absolute inset-0 bg-slate-700 -z-20"></div>; // Fallback
  }
};

export default MapBackground;
