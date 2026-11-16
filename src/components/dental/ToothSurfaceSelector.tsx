import React from 'react';
import { ToothCondition, ToothSurface, ToothSurfaceState } from '../../types';
import { getConditionColor } from '../../utils/dentalChartHelper';

interface ToothSurfaceSelectorProps {
  surfaces: ToothSurfaceState;
  selectedSurface: ToothSurface | null;
  onSelectSurface: (surface: ToothSurface) => void;
  onSetSurfaceCondition: (surface: ToothSurface, condition: ToothCondition) => void;
  toothNumber: number;
}

export const ToothSurfaceSelector: React.FC<ToothSurfaceSelectorProps> = ({
  surfaces,
  selectedSurface,
  onSelectSurface,
  onSetSurfaceCondition,
  toothNumber
}) => {
  const isUpper = (toothNumber >= 11 && toothNumber <= 28) || (toothNumber >= 51 && toothNumber <= 65);
  
  // Quadrant determines whether Mesial is left or right
  // Quadrant 1 (UR) & 4 (LR): Mesial is to the LEFT (towards center)
  // Quadrant 2 (UL) & 3 (LL): Mesial is to the RIGHT (towards center)
  const quad = Math.floor(toothNumber / 10);
  const mesialOnLeft = quad === 2 || quad === 3 || quad === 6 || quad === 7;

  const leftSurface: ToothSurface = mesialOnLeft ? 'Mesial' : 'Distal';
  const rightSurface: ToothSurface = mesialOnLeft ? 'Distal' : 'Mesial';
  const topSurface: ToothSurface = 'Buccal';
  const bottomSurface: ToothSurface = 'Lingual';
  const centerSurface: ToothSurface = 'Occlusal';

  const getColor = (surface: ToothSurface) => {
    const key = surface.toLowerCase() as keyof ToothSurfaceState;
    const cond = surfaces[key] || 'Healthy';
    return cond === 'Healthy' ? '#f8fafc' : getConditionColor(cond);
  };

  const getCondLabel = (surface: ToothSurface) => {
    const key = surface.toLowerCase() as keyof ToothSurfaceState;
    return surfaces[key] || 'Healthy';
  };

  const surfaceItems: { surface: ToothSurface; label: string; code: string }[] = [
    { surface: 'Occlusal', label: 'Occlusal (Chewing Surface)', code: 'O' },
    { surface: 'Mesial', label: 'Mesial (Towards Midline)', code: 'M' },
    { surface: 'Distal', label: 'Distal (Away from Midline)', code: 'D' },
    { surface: 'Buccal', label: isUpper ? 'Buccal / Facial' : 'Buccal', code: 'B' },
    { surface: 'Lingual', label: isUpper ? 'Palatal / Lingual' : 'Lingual', code: 'L' }
  ];

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl bg-slate-50/80 border border-slate-200">
      {/* Visual Cross Map */}
      <div className="flex flex-col items-center">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
          Tooth #{toothNumber} Surface Map
        </span>

        <div className="relative w-40 h-40">
          <svg viewBox="0 0 160 160" className="w-full h-full drop-shadow-sm select-none">
            {/* Top: Buccal */}
            <polygon
              points="40,40 120,40 145,15 15,15"
              fill={getColor(topSurface)}
              stroke={selectedSurface === topSurface ? '#0284c7' : '#94a3b8'}
              strokeWidth={selectedSurface === topSurface ? '3' : '1.5'}
              className="cursor-pointer transition-all hover:opacity-90"
              onClick={() => onSelectSurface(topSurface)}
            />
            <text x="80" y="28" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#475569">
              B ({topSurface[0]})
            </text>

            {/* Bottom: Lingual */}
            <polygon
              points="40,120 120,120 145,145 15,145"
              fill={getColor(bottomSurface)}
              stroke={selectedSurface === bottomSurface ? '#0284c7' : '#94a3b8'}
              strokeWidth={selectedSurface === bottomSurface ? '3' : '1.5'}
              className="cursor-pointer transition-all hover:opacity-90"
              onClick={() => onSelectSurface(bottomSurface)}
            />
            <text x="80" y="137" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#475569">
              L ({bottomSurface[0]})
            </text>

            {/* Left */}
            <polygon
              points="40,40 40,120 15,145 15,15"
              fill={getColor(leftSurface)}
              stroke={selectedSurface === leftSurface ? '#0284c7' : '#94a3b8'}
              strokeWidth={selectedSurface === leftSurface ? '3' : '1.5'}
              className="cursor-pointer transition-all hover:opacity-90"
              onClick={() => onSelectSurface(leftSurface)}
            />
            <text x="27" y="85" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#475569">
              {leftSurface[0]}
            </text>

            {/* Right */}
            <polygon
              points="120,40 120,120 145,145 145,15"
              fill={getColor(rightSurface)}
              stroke={selectedSurface === rightSurface ? '#0284c7' : '#94a3b8'}
              strokeWidth={selectedSurface === rightSurface ? '3' : '1.5'}
              className="cursor-pointer transition-all hover:opacity-90"
              onClick={() => onSelectSurface(rightSurface)}
            />
            <text x="133" y="85" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#475569">
              {rightSurface[0]}
            </text>

            {/* Center: Occlusal */}
            <rect
              x="42"
              y="42"
              width="76"
              height="76"
              rx="8"
              fill={getColor(centerSurface)}
              stroke={selectedSurface === centerSurface ? '#0284c7' : '#94a3b8'}
              strokeWidth={selectedSurface === centerSurface ? '3' : '1.5'}
              className="cursor-pointer transition-all hover:opacity-90"
              onClick={() => onSelectSurface(centerSurface)}
            />
            <text x="80" y="84" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#334155">
              O (Occlusal)
            </text>
          </svg>
        </div>
      </div>

      {/* Surface Status & Quick Selector buttons */}
      <div className="flex-1 space-y-2 w-full">
        <div className="text-xs font-bold text-slate-600 mb-1 flex items-center justify-between">
          <span>Surfaces Condition Status</span>
          <span className="text-[11px] text-slate-400">Click a surface to mark</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {surfaceItems.map(({ surface, label, code }) => {
            const isSelected = selectedSurface === surface;
            const currentCond = getCondLabel(surface);
            return (
              <div
                key={surface}
                onClick={() => onSelectSurface(surface)}
                className={`p-2 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-all ${
                  isSelected
                    ? 'border-sky-500 bg-sky-50/80 shadow-sm'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-[11px]">
                    {code}
                  </span>
                  <span className="font-semibold text-slate-800">{surface}</span>
                </div>
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                  style={{
                    backgroundColor: currentCond === 'Healthy' ? '#f1f5f9' : `${getConditionColor(currentCond)}25`,
                    color: currentCond === 'Healthy' ? '#64748b' : getConditionColor(currentCond)
                  }}
                >
                  {currentCond}
                </span>
              </div>
            );
          })}
        </div>

        {/* Selected Surface Quick Condition Changer */}
        {selectedSurface && (
          <div className="mt-3 p-3 bg-white rounded-xl border border-sky-200 shadow-sm animate-in fade-in">
            <div className="text-xs font-extrabold text-sky-800 mb-2 flex items-center justify-between">
              <span>Set Condition for {selectedSurface} Surface:</span>
              <span className="text-[10px] text-slate-500 font-bold">
                Current: <span className="font-extrabold" style={{ color: getCondLabel(selectedSurface) === 'Healthy' ? '#64748b' : getConditionColor(getCondLabel(selectedSurface)) }}>{getCondLabel(selectedSurface)}</span>
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {([
                'Healthy',
                'Caries',
                'Filling',
                'Crown',
                'Root Canal',
                'Missing',
                'Implant',
                'Fracture',
                'Extraction Required',
                'Mobility',
                'Sensitivity'
              ] as ToothCondition[]).map((cond) => {
                const isCondSelected = getCondLabel(selectedSurface) === cond;
                const col = getConditionColor(cond);
                return (
                  <button
                    key={cond}
                    type="button"
                    onClick={() => onSetSurfaceCondition(selectedSurface, cond)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      isCondSelected
                        ? 'text-white shadow-sm ring-1 ring-slate-800 scale-102'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                    style={{
                      backgroundColor: isCondSelected ? (cond === 'Healthy' ? '#334155' : col) : undefined
                    }}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor: isCondSelected ? '#ffffff' : (cond === 'Healthy' ? '#94a3b8' : col)
                      }}
                    />
                    <span>{cond}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
