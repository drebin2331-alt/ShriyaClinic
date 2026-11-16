import React, { useState } from 'react';
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
    <div className="clay-card p-5 bg-gradient-to-b from-[#f8fafc] to-[#f1f5f9] rounded-3xl border border-white/90 shadow-lg">
      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200/80">
        {/* Dentition Selector */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 rounded-2xl">
          <button
            onClick={() => setDentitionType('adult')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${dentitionType === 'adult'
              ? 'bg-white text-sky-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            Adult Dentition (32 Teeth)
          </button>
          <button
            onClick={() => setDentitionType('child')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${dentitionType === 'child'
              ? 'bg-white text-sky-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            Pediatric / Primary (20 Teeth)
          </button>
        </div>

        {/* Arch Filter */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 rounded-2xl">
          {(['all', 'upper', 'lower'] as const).map((arch) => (
            <button
              key={arch}
              onClick={() => setArchFilter(arch)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${archFilter === arch
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              {arch === 'all' ? 'Full Mouth' : `${arch} Arch`}
            </button>
          ))}
        </div>

        {/* Quick Toggles */}
        <div className="flex items-center gap-2">
          {onToggleMultiSelectMode && (
            <button
              onClick={onToggleMultiSelectMode}
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
      <div className="flex flex-wrap items-center gap-2 mb-6 text-xs font-bold">
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

      {/* ODONTOGRAM ARCHES CONTAINER */}
      <div className="overflow-x-auto py-2">
        <div className="min-w-[680px] flex flex-col items-center gap-8">
          {/* UPPER ARCH (MAXILLARY) */}
          {(archFilter === 'all' || archFilter === 'upper') && (
            <div className="w-full flex flex-col items-center">
              <div className="flex items-center justify-between w-full max-w-3xl px-6 mb-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-sky-800 bg-sky-100/80 px-2.5 py-0.5 rounded-full">
                  Quadrant 1 (Upper Right)
                </span>
                <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                  MAXILLARY ARCH (UPPER JAW)
                </span>
                <span className="text-[11px] font-black uppercase tracking-wider text-sky-800 bg-sky-100/80 px-2.5 py-0.5 rounded-full">
                  Quadrant 2 (Upper Left)
                </span>
              </div>

              <div className="relative flex items-center justify-center gap-1.5 p-3.5 bg-white/90 rounded-2xl border border-slate-200/90 shadow-sm w-full max-w-4xl">
                {/* Upper Right Quadrant (18..11 or 55..51) */}
                <div className="flex items-center gap-1 sm:gap-2">
                  {upperRight.map((num) => {
                    const tooth = getTooth(num);
                    return (
                      <DentalToothSvg
                        key={num}
                        tooth={tooth}
                        isSelected={selectedToothNumber === num}
                        isMultiSelected={selectedToothNumbers.includes(num)}
                        showSurfaces={showSurfaces}
                        onClick={() => handleToothClick(num)}
                      />
                    );
                  })}
                </div>

                {/* Midline Divider */}
                <div className="w-0.5 h-24 bg-sky-400/60 mx-1.5 relative flex items-center justify-center">
                  <span className="absolute -top-3 text-[10px] font-mono font-bold text-sky-500 bg-white px-1 rounded shadow-xs">
                    MIDLINE
                  </span>
                </div>

                {/* Upper Left Quadrant (21..28 or 61..65) */}
                <div className="flex items-center gap-1 sm:gap-2">
                  {upperLeft.map((num) => {
                    const tooth = getTooth(num);
                    return (
                      <DentalToothSvg
                        key={num}
                        tooth={tooth}
                        isSelected={selectedToothNumber === num}
                        isMultiSelected={selectedToothNumbers.includes(num)}
                        showSurfaces={showSurfaces}
                        onClick={() => handleToothClick(num)}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* LOWER ARCH (MANDIBULAR) */}
          {(archFilter === 'all' || archFilter === 'lower') && (
            <div className="w-full flex flex-col items-center">
              <div className="flex items-center justify-between w-full max-w-3xl px-6 mb-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-teal-800 bg-teal-100/80 px-2.5 py-0.5 rounded-full">
                  Quadrant 4 (Lower Right)
                </span>
                <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                  MANDIBULAR ARCH (LOWER JAW)
                </span>
                <span className="text-[11px] font-black uppercase tracking-wider text-teal-800 bg-teal-100/80 px-2.5 py-0.5 rounded-full">
                  Quadrant 3 (Lower Left)
                </span>
              </div>

              <div className="relative flex items-center justify-center gap-1.5 p-3.5 bg-white/90 rounded-2xl border border-slate-200/90 shadow-sm w-full max-w-4xl">
                {/* Lower Right Quadrant (48..41 or 85..81) */}
                <div className="flex items-center gap-1 sm:gap-2">
                  {lowerRight.map((num) => {
                    const tooth = getTooth(num);
                    return (
                      <DentalToothSvg
                        key={num}
                        tooth={tooth}
                        isSelected={selectedToothNumber === num}
                        isMultiSelected={selectedToothNumbers.includes(num)}
                        showSurfaces={showSurfaces}
                        onClick={() => handleToothClick(num)}
                      />
                    );
                  })}
                </div>

                {/* Midline Divider */}
                <div className="w-0.5 h-24 bg-teal-400/60 mx-1.5 relative flex items-center justify-center">
                  <span className="absolute -bottom-3 text-[10px] font-mono font-bold text-teal-600 bg-white px-1 rounded shadow-xs">
                    MIDLINE
                  </span>
                </div>

                {/* Lower Left Quadrant (31..38 or 71..75) */}
                <div className="flex items-center gap-1 sm:gap-2">
                  {lowerLeft.map((num) => {
                    const tooth = getTooth(num);
                    return (
                      <DentalToothSvg
                        key={num}
                        tooth={tooth}
                        isSelected={selectedToothNumber === num}
                        isMultiSelected={selectedToothNumbers.includes(num)}
                        showSurfaces={showSurfaces}
                        onClick={() => handleToothClick(num)}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 text-center text-xs font-semibold text-slate-400">
        💡 Click on any tooth to view diagnosis, mark surfaces (M, D, O, B, L), or plan endodontic/prosthetic treatments.
      </div>
    </div>
  );
};
