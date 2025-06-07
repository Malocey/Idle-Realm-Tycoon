
import React from 'react';
import { StatBreakdownItem } from '../types'; // Import hinzugefügt
import { formatNumber } from '../utils';

interface StatBreakdownDisplayProps {
  breakdownItems: StatBreakdownItem[];
  finalStatValue: number | string | undefined; 
}

const StatBreakdownDisplay: React.FC<StatBreakdownDisplayProps> = ({ breakdownItems, finalStatValue }) => {
  return (
    <div className="mt-1.5 pl-6 pr-2 space-y-0.5 animate-fadeIn">
      {breakdownItems.map((item, index) => (
        <div key={index} className="flex justify-between text-xs">
          <span className="text-slate-400">{item.source}:</span>
          <span className={`font-medium ${Number(item.value) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {item.valueDisplay ? item.valueDisplay :
             (item.isPercentage ? `${(Number(item.value) * 100).toFixed(1)}%` :
              (item.isFlat ? (Number(item.value) > 0 ? '+' : '') + formatNumber(Number(item.value)) : formatNumber(Number(item.value))))}
          </span>
        </div>
      ))}
      <div className="flex justify-between text-xs pt-1 mt-1 border-t border-slate-600">
        <span className="text-slate-300 font-semibold">Total:</span>
        <span className="text-slate-100 font-bold">
            {typeof finalStatValue === 'number' ? formatNumber(finalStatValue) : finalStatValue}
        </span>
      </div>
    </div>
  );
};

export default StatBreakdownDisplay;