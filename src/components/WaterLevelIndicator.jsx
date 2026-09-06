import React from 'react';

export const WaterLevelIndicator = ({ percent, className = "w-16 h-28" }) => {
  return (
    <div className={`relative ${className} bg-slate-100 rounded-lg border-2 border-slate-200 overflow-hidden flex flex-col justify-end shadow-inner`}>
      {/* Background markings */}
      <div className="absolute inset-0 flex flex-col justify-between py-2 px-1 z-10 pointer-events-none opacity-30">
        {[100, 75, 50, 25, 0].map(mark => (
          <div key={mark} className="flex items-center gap-1">
            <div className="h-[1px] w-2 bg-slate-800"></div>
            <span className="text-[8px] font-bold text-slate-800">{mark}%</span>
          </div>
        ))}
      </div>
      
      {/* Water Fill */}
      <div 
        className="bg-blue-500 w-full transition-all duration-1000 ease-in-out relative"
        style={{ height: `${Math.max(0, Math.min(100, percent))}%` }}
      >
        <div className="absolute top-0 left-0 right-0 h-2 bg-blue-400 opacity-50 rounded-t-full"></div>
      </div>
    </div>
  );
};
