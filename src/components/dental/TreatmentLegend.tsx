import React from 'react';
import { TREATMENT_LEGEND, LegendItem } from '../../utils/dentalChartHelper';

interface TreatmentLegendProps {
  activeFilter?: string | null;
  onSelectFilter?: (code: string | null) => void;
  compact?: boolean;
}

export const TreatmentLegend: React.FC<TreatmentLegendProps> = ({
  activeFilter = null,
  onSelectFilter,
  compact = false
}) => {
  return (
    <div className="clay-card-flat p-3.5 bg-white/70 border border-white/80 rounded-2xl">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase tracking-wider text-slate-500">
            Odontogram Treatment Legend & Symbols
          </span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sky-100 text-sky-700">
            FDI Standard
          </span>
        </div>
        {activeFilter && onSelectFilter && (
          <button
            onClick={() => onSelectFilter(null)}
            className="text-[11px] font-bold text-sky-600 hover:underline cursor-pointer"
          >
            Clear Filter
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {TREATMENT_LEGEND.map((item) => {
          const isSelected = activeFilter === item.code;
          return (
            <div
              key={item.code}
              onClick={() => onSelectFilter && onSelectFilter(isSelected ? null : item.code)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                isSelected
                  ? 'ring-2 ring-sky-500 scale-105 shadow-sm'
                  : 'hover:scale-102 hover:shadow-sm'
              } ${item.bgColor} ${item.borderColor}`}
              title={item.description}
            >
              <span className={`w-5 h-5 rounded-md flex items-center justify-center font-black font-mono text-[11px] ${item.textColor} bg-white/80 shadow-xs`}>
                {item.code}
              </span>
              <span className={`text-[11px] font-bold ${item.textColor}`}>
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
