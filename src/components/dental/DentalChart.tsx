import React, { useState } from 'react';
import './clinical-controls.css';
import { ToothCondition, ToothData } from '../../types';
import {
  ADULT_UPPER_RIGHT,
  ADULT_UPPER_LEFT,
  ADULT_LOWER_RIGHT,
  ADULT_LOWER_LEFT,
  CHILD_UPPER_RIGHT,
  CHILD_UPPER_LEFT,
  CHILD_LOWER_RIGHT,
  CHILD_LOWER_LEFT
} from '../../utils/dentalChartHelper';
import { DentalToothSvg } from './DentalToothSvg';
import { Layers, Eye, CheckSquare, Sparkles, Filter } from 'lucide-react';

interface DentalChartProps {
  teeth: ToothData[];
  selectedToothNumber: number | null;
  onSelectTooth: (toothNumber: number) => void;
  selectedToothNumbers?: number[];
  onToggleToothSelection?: (toothNumber: number) => void;
  isMultiSelectMode?: boolean;
  onToggleMultiSelectMode?: () => void;
  readOnly?: boolean;
}

export const DentalChart: React.FC<DentalChartProps> = ({
  teeth,
  selectedToothNumber,
  onSelectTooth,
  selectedToothNumbers = [],
  onToggleToothSelection,
  isMultiSelectMode = false,
  onToggleMultiSelectMode,
  readOnly = false
}) => {
  const [dentitionType, setDentitionType] = useState<'adult' | 'child'>('adult');
  const [archFilter, setArchFilter] = useState<'all' | 'upper' | 'lower'>('all');
  const [showSurfaces, setShowSurfaces] = useState(false);

  // Map teeth by tooth number
  const teethMap = new Map<number, ToothData>();
  teeth.forEach((t) => teethMap.set(t.toothNumber, t));

  const getTooth = (num: number): ToothData => {
    return teethMap.get(num) || {
      toothNumber: num,
      type: num >= 50 ? 'child' : 'adult',
      condition: 'Healthy',
      surfaces: { mesial: 'Healthy', distal: 'Healthy', occlusal: 'Healthy', buccal: 'Healthy', lingual: 'Healthy' }
    };
  };

  const handleToothClick = (num: number) => {
    if (readOnly) return;
    if (isMultiSelectMode && onToggleToothSelection) {
      onToggleToothSelection(num);
    } else {
      onSelectTooth(num);
    }
  };

  const upperRight = dentitionType === 'adult' ? ADULT_UPPER_RIGHT : CHILD_UPPER_RIGHT;
  const upperLeft = dentitionType === 'adult' ? ADULT_UPPER_LEFT : CHILD_UPPER_LEFT;
  const lowerRight = dentitionType === 'adult' ? ADULT_LOWER_RIGHT : CHILD_LOWER_RIGHT;
  const lowerLeft = dentitionType === 'adult' ? ADULT_LOWER_LEFT : CHILD_LOWER_LEFT;

  // Condition count summaries based on full mouth dentition
  const totalTeethCount = dentitionType === 'adult' ? 32 : 20;
  const relevantTeeth = teeth.filter((t) => dentitionType === 'adult' ? t.toothNumber < 50 : t.toothNumber >= 50);
  const cariesCount = relevantTeeth.filter(
    (t) => t.condition === 'Caries' || t.treatmentCode === 'C' || (t.surfaces && Object.values(t.surfaces).some((v) => v === 'Caries'))
  ).length;
  const rctCount = relevantTeeth.filter(
    (t) => t.condition === 'Root Canal' || t.treatmentCode === 'R' || (t.surfaces && Object.values(t.surfaces).some((v) => v === 'Root Canal'))
  ).length;
  const fillingCount = relevantTeeth.filter(
    (t) => t.condition === 'Filling' || t.treatmentCode === 'F' || (t.surfaces && Object.values(t.surfaces).some((v) => v === 'Filling'))
  ).length;
  const crownCount = relevantTeeth.filter(
    (t) => t.condition === 'Crown' || t.treatmentCode === 'CR' || (t.surfaces && Object.values(t.surfaces).some((v) => v === 'Crown'))
  ).length;
  const missingCount = relevantTeeth.filter(
    (t) => t.condition === 'Missing' || t.treatmentCode === 'X' || (t.surfaces && Object.values(t.surfaces).some((v) => v === 'Missing'))
  ).length;
  const anomalyCount = cariesCount + rctCount + fillingCount + crownCount + missingCount;
  const healthyCount = Math.max(0, totalTeethCount - anomalyCount);

  return (
    <div className="dental-chart clay-card">
      {/* Controls Bar */}
      <div className="dental-chart-controls">
        {/* Dentition Selector */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 rounded-2xl">
          <button
            onClick={() => setDentitionType('adult')}
            aria-pressed={dentitionType === 'adult'}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${dentitionType === 'adult'
              ? 'bg-white text-sky-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            Adult · 32 teeth
          </button>
          <button
            onClick={() => setDentitionType('child')}
            aria-pressed={dentitionType === 'child'}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${dentitionType === 'child'
              ? 'bg-white text-sky-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            Child · 20 teeth
          </button>
        </div>

        {/* Arch Filter */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 rounded-2xl">
          {(['all', 'upper', 'lower'] as const).map((arch) => (
            <button
              key={arch}
              onClick={() => setArchFilter(arch)}
              aria-pressed={archFilter === arch}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${archFilter === arch
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              {arch === 'all' ? 'Both arches' : arch}
            </button>
          ))}
        </div>

        {/* Quick Toggles */}
        <div className="flex items-center gap-2">
          {onToggleMultiSelectMode && (
            <button
              onClick={onToggleMultiSelectMode}
              aria-pressed={isMultiSelectMode}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${isMultiSelectMode
                ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-300'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Multi-Select ({selectedToothNumbers.length})</span>
            </button>
          )}

          <button
            onClick={() => setShowSurfaces(!showSurfaces)}
            aria-pressed={showSurfaces}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${showSurfaces
              ? 'bg-sky-600 text-white shadow-sm'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            title="Toggle 5-surface anatomies (Occlusal, Mesial, Distal, Buccal, Lingual)"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Surfaces</span>
          </button>
        </div>
      </div>

      {/* Quick Summary Pill Bar */}
      <div className="flex flex-wrap items-center gap-2 mb-3 text-xs font-bold">
        <span className="text-slate-400 text-[11px] uppercase tracking-wider mr-1">Condition Summary:</span>
        <span className="px-2.5 py-1 rounded-xl bg-slate-200/80 text-slate-700">
          Healthy: {healthyCount}
        </span>
        {cariesCount > 0 && (
          <span className="px-2.5 py-1 rounded-xl bg-rose-100 text-rose-700 border border-rose-200">
            Caries: {cariesCount}
          </span>
        )}
        {rctCount > 0 && (
          <span className="px-2.5 py-1 rounded-xl bg-purple-100 text-purple-700 border border-purple-200">
            Root Canal: {rctCount}
          </span>
        )}
        {fillingCount > 0 && (
          <span className="px-2.5 py-1 rounded-xl bg-blue-100 text-blue-700 border border-blue-200">
            Fillings: {fillingCount}
          </span>
        )}
        {crownCount > 0 && (
          <span className="px-2.5 py-1 rounded-xl bg-amber-100 text-amber-800 border border-amber-200">
            Crowns: {crownCount}
          </span>
        )}
        {missingCount > 0 && (
          <span className="px-2.5 py-1 rounded-xl bg-slate-200 text-slate-700 border border-slate-300">
            Missing: {missingCount}
          </span>
        )}
      </div>

      <div className="dental-arches" role="region" aria-label="Dental chart">
        {[
          { id: 'upper', name: 'Upper arch', quadrants: [upperRight, upperLeft] },
          { id: 'lower', name: 'Lower arch', quadrants: [lowerRight, lowerLeft] },
        ].filter(arch => archFilter === 'all' || archFilter === arch.id).map(arch => (
          <section key={arch.id} className="dental-arch">
            <h4>{arch.name}</h4>
            <div className="dental-quadrants">
              {arch.quadrants.map((numbers, index) => (
                <div key={numbers[0]} className="dental-quadrant">
                  <h5>Quadrant {Math.floor(numbers[0] / 10)} · Patient’s {index === 0 ? 'right' : 'left'}</h5>
                  <div className="dental-teeth">
                    {numbers.map(number => <DentalToothSvg
                      key={number}
                      tooth={getTooth(number)}
                      isSelected={selectedToothNumber === number}
                      isMultiSelected={selectedToothNumbers.includes(number)}
                      showSurfaces={showSurfaces}
                      onClick={readOnly ? undefined : () => handleToothClick(number)}
                    />)}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-4 text-center text-xs font-semibold text-slate-400">
        {readOnly ? 'FDI tooth numbers are shown above each tooth.' : 'Select a tooth to review its diagnosis, surfaces and treatment.'}
      </div>
    </div>
  );
};
