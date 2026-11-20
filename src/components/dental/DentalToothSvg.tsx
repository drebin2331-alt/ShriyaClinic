import React from 'react';
import { ToothCondition, ToothData, ToothSurfaceState } from '../../types';
import { getConditionColor, getToothType } from '../../utils/dentalChartHelper';

interface DentalToothSvgProps {
  tooth: ToothData;
  isSelected?: boolean;
  isMultiSelected?: boolean;
  showSurfaces?: boolean;
  showTreatmentBadge?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export const DentalToothSvg: React.FC<DentalToothSvgProps> = ({
  tooth,
  isSelected = false,
  isMultiSelected = false,
  showSurfaces = false,
  showTreatmentBadge = true,
  onClick,
  size = 'md'
}) => {
  const toothNum = tooth.toothNumber;
  const isUpper = (toothNum >= 11 && toothNum <= 28) || (toothNum >= 51 && toothNum <= 65);
  const type = getToothType(toothNum);
  
  const s = tooth.surfaces || {};
  const hasSurfaceCaries = Object.values(s).some((v) => v === 'Caries');
  const hasSurfaceFilling = Object.values(s).some((v) => v === 'Filling');
  const hasSurfaceCrown = Object.values(s).some((v) => v === 'Crown');
  const hasSurfaceRCT = Object.values(s).some((v) => v === 'Root Canal');

  const condition = tooth.condition;
  const isMissing = condition === 'Missing' || tooth.treatmentCode === 'X';
  const isRootCanal = condition === 'Root Canal' || tooth.treatmentCode === 'R' || hasSurfaceRCT;
  const isCrown = condition === 'Crown' || tooth.treatmentCode === 'CR' || hasSurfaceCrown;
  const isFilling = condition === 'Filling' || tooth.treatmentCode === 'F' || hasSurfaceFilling;
  const isCaries = condition === 'Caries' || tooth.treatmentCode === 'C' || hasSurfaceCaries;
  const isImplant = condition === 'Implant' || tooth.treatmentCode === 'I';
  const isExtraction = condition === 'Extraction Required' || tooth.treatmentCode === 'E';
  const isFracture = condition === 'Fracture' || tooth.treatmentCode === 'FR' || Object.values(s).some((v) => v === 'Fracture');
  const isMobility = condition === 'Mobility' || tooth.treatmentCode === 'M' || Object.values(s).some((v) => v === 'Mobility');
  const isSensitivity = condition === 'Sensitivity' || tooth.treatmentCode === 'S' || Object.values(s).some((v) => v === 'Sensitivity');

  const effectiveCondition = isRootCanal
    ? 'Root Canal'
    : isCrown
    ? 'Crown'
    : isFilling
    ? 'Filling'
    : isCaries
    ? 'Caries'
    : isFracture
    ? 'Fracture'
    : isMissing
    ? 'Missing'
    : isImplant
    ? 'Implant'
    : isExtraction
    ? 'Extraction Required'
    : isMobility
    ? 'Mobility'
    : isSensitivity
    ? 'Sensitivity'
    : condition;

  const effectiveTreatmentCode =
    tooth.treatmentCode ||
    (isRootCanal
      ? 'R'
      : isCrown
      ? 'CR'
      : isFilling
      ? 'F'
      : isCaries
      ? 'C'
      : isFracture
      ? 'FR'
      : isMissing
      ? 'X'
      : isImplant
      ? 'I'
      : isExtraction
      ? 'E'
      : isMobility
      ? 'M'
      : isSensitivity
      ? 'S'
      : undefined);
  const condColor = getConditionColor(effectiveCondition);

  // Dimension scaling
  const dimensions = {
    sm: { width: 38, height: 60, crownH: 26 },
    md: { width: 48, height: 76, crownH: 34 },
    lg: { width: 62, height: 96, crownH: 42 }
  }[size];

  // Surface colors
  const mesialColor = s.mesial && s.mesial !== 'Healthy' ? getConditionColor(s.mesial) : '#f8fafc';
  const distalColor = s.distal && s.distal !== 'Healthy' ? getConditionColor(s.distal) : '#f8fafc';
  const occlusalColor = s.occlusal && s.occlusal !== 'Healthy' ? getConditionColor(s.occlusal) : '#f8fafc';
  const buccalColor = s.buccal && s.buccal !== 'Healthy' ? getConditionColor(s.buccal) : '#f8fafc';
  const lingualColor = s.lingual && s.lingual !== 'Healthy' ? getConditionColor(s.lingual) : '#f8fafc';

  return (
    <button
      type="button"
      disabled={!onClick}
      aria-label={`Tooth ${toothNum}, ${condition}${tooth.treatmentCode ? ', ' + tooth.treatmentCode : ''}`}
      aria-pressed={isSelected || isMultiSelected}
      onClick={onClick}
      className={`relative flex flex-col items-center cursor-pointer transition-all duration-200 select-none group ${
        isSelected
          ? 'scale-105 z-20'
          : isMultiSelected
          ? 'scale-102 z-10'
          : 'hover:scale-105 hover:z-10'
      }`}
      title={`Tooth #${toothNum} - ${condition}${tooth.treatmentCode ? ` [${tooth.treatmentCode}]` : ''}`}
    >
      {/* FDI Tooth Number Badge */}
      <span
        className={`text-[11px] font-black font-mono px-1.5 py-0.5 rounded-md transition-colors ${
          isSelected
            ? 'bg-sky-600 text-white shadow-sm'
            : isMultiSelected
            ? 'bg-indigo-600 text-white'
            : effectiveCondition !== 'Healthy'
            ? 'bg-slate-800 text-white'
            : 'bg-slate-200/90 text-slate-700 group-hover:bg-slate-300'
        }`}
      >
        {toothNum}
      </span>

      {/* Anatomical Tooth SVG */}
      <div
        className={`mt-1 rounded-xl p-1 transition-all ${
          isSelected
            ? 'ring-2 ring-sky-500 ring-offset-2 bg-sky-50/80 shadow-md'
            : isMultiSelected
            ? 'ring-2 ring-indigo-400 ring-offset-1 bg-indigo-50/50'
            : 'hover:bg-slate-100/60'
        }`}
      >
        <svg
          width={dimensions.width}
          height={dimensions.height}
          viewBox="0 0 100 160"
          className={`overflow-visible ${isMissing ? 'opacity-40 grayscale' : ''}`}
        >
          <defs>
            {/* Soft clay gradient for natural tooth enamel */}
            <linearGradient id={`enamel-${toothNum}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="60%" stopColor="#f1f5f9" />
              <stop offset="100%" stopColor="#e2e8f0" />
            </linearGradient>

            <linearGradient id={`root-${toothNum}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#e2e8f0" />
              <stop offset="100%" stopColor="#cbd5e1" />
            </linearGradient>

            {/* Gold Crown Gradient */}
            <linearGradient id={`crown-grad-${toothNum}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
          </defs>

          {/* Group oriented according to upper vs lower jaw */}
          <g transform={isUpper ? '' : 'translate(0, 160) scale(1, -1)'}>
            {/* ROOT(S) VISUALIZATION */}
            {isImplant ? (
              // Titanium Implant screw threads
              <g id="implant-screw">
                <path
                  d="M40,25 L60,25 L58,85 L50,95 L42,85 Z"
                  fill="#0d9488"
                  stroke="#115e59"
                  strokeWidth="2"
                />
                {/* Thread ridges */}
                <line x1="38" y1="35" x2="62" y2="35" stroke="#14b8a6" strokeWidth="2.5" />
                <line x1="39" y1="48" x2="61" y2="48" stroke="#14b8a6" strokeWidth="2.5" />
                <line x1="41" y1="61" x2="59" y2="61" stroke="#14b8a6" strokeWidth="2.5" />
                <line x1="43" y1="74" x2="57" y2="74" stroke="#14b8a6" strokeWidth="2.5" />
              </g>
            ) : type === 'molar' ? (
              // Multi-root molar (2-3 roots)
              <g id="molar-roots">
                {/* Mesial Root */}
                <path
                  d="M26,80 C24,50 18,30 24,10 C29,10 36,40 44,75 Z"
                  fill={isRootCanal ? '#f3e8ff' : `url(#root-${toothNum})`}
                  stroke={isRootCanal ? '#9333ea' : '#94a3b8'}
                  strokeWidth="2"
                />
                {/* Distal Root */}
                <path
                  d="M56,75 C64,40 71,10 76,10 C82,30 76,50 74,80 Z"
                  fill={isRootCanal ? '#f3e8ff' : `url(#root-${toothNum})`}
                  stroke={isRootCanal ? '#9333ea' : '#94a3b8'}
                  strokeWidth="2"
                />
                {/* Root canal lines if endodontic */}
                {isRootCanal && (
                  <>
                    <path d="M25,18 Q27,45 35,76" stroke="#9333ea" strokeWidth="3" strokeLinecap="round" />
                    <path d="M75,18 Q73,45 65,76" stroke="#9333ea" strokeWidth="3" strokeLinecap="round" />
                  </>
                )}
              </g>
            ) : type === 'premolar' ? (
              // Premolar root
              <g id="premolar-root">
                <path
                  d="M36,80 C32,50 40,15 50,10 C60,15 68,50 64,80 Z"
                  fill={isRootCanal ? '#f3e8ff' : `url(#root-${toothNum})`}
                  stroke={isRootCanal ? '#9333ea' : '#94a3b8'}
                  strokeWidth="2"
                />
                {isRootCanal && (
                  <path d="M50,16 L50,78" stroke="#9333ea" strokeWidth="3.5" strokeLinecap="round" />
                )}
              </g>
            ) : (
              // Incisor or Canine single long root
              <g id="single-root">
                <path
                  d="M37,80 C33,48 42,12 50,8 C58,12 67,48 63,80 Z"
                  fill={isRootCanal ? '#f3e8ff' : `url(#root-${toothNum})`}
                  stroke={isRootCanal ? '#9333ea' : '#94a3b8'}
                  strokeWidth="2"
                />
                {isRootCanal && (
                  <path d="M50,14 L50,78" stroke="#9333ea" strokeWidth="3.5" strokeLinecap="round" />
                )}
              </g>
            )}

            {/* CROWN VISUALIZATION */}
            <g id="tooth-crown">
              {/* Crown Base contour */}
              <path
                d={
                  type === 'molar'
                    ? 'M15,82 C14,105 16,145 28,150 C38,154 62,154 72,150 C84,145 86,105 85,82 C72,86 28,86 15,82 Z'
                    : type === 'premolar'
                    ? 'M22,82 C20,105 22,146 32,151 C42,155 58,155 68,151 C78,146 80,105 78,82 C68,86 32,86 22,82 Z'
                    : type === 'canine'
                    ? 'M26,82 C22,105 25,142 50,154 C75,142 78,105 74,82 C65,86 35,86 26,82 Z'
                    : 'M25,82 C23,105 24,148 26,151 C35,153 65,153 74,151 C76,148 77,105 75,82 C65,85 35,85 25,82 Z'
                }
                fill={isCrown ? `url(#crown-grad-${toothNum})` : `url(#enamel-${toothNum})`}
                stroke={isCrown ? '#b45309' : '#64748b'}
                strokeWidth="2.5"
              />

              {/* Surface diagram overlay if requested */}
              {showSurfaces && (
                <g id="surface-diagram" opacity="0.85">
                  {/* Occlusal / Incisal center */}
                  <rect
                    x="36"
                    y="108"
                    width="28"
                    height="24"
                    rx="4"
                    fill={occlusalColor}
                    stroke="#94a3b8"
                    strokeWidth="1.2"
                  />
                  {/* Buccal */}
                  <polygon points="36,108 64,108 72,92 28,92" fill={buccalColor} stroke="#94a3b8" strokeWidth="1" />
                  {/* Lingual */}
                  <polygon points="36,132 64,132 72,146 28,146" fill={lingualColor} stroke="#94a3b8" strokeWidth="1" />
                  {/* Mesial */}
                  <polygon points="36,108 36,132 25,140 25,98" fill={mesialColor} stroke="#94a3b8" strokeWidth="1" />
                  {/* Distal */}
                  <polygon points="64,108 64,132 75,140 75,98" fill={distalColor} stroke="#94a3b8" strokeWidth="1" />
                </g>
              )}

              {/* Specific Condition visual effects */}
              {isCaries && !showSurfaces && (
                <circle cx="50" cy="120" r="9" fill="#ef4444" stroke="#991b1b" strokeWidth="2" />
              )}

              {isFilling && !showSurfaces && (
                <rect x="40" y="112" width="20" height="18" rx="3" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="2" />
              )}

              {/* Fracture crack mark */}
              {isFracture && (
                <path
                  d="M32,95 L46,112 L40,126 L55,146"
                  stroke="#ea580c"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  fill="none"
                />
              )}

              {/* Missing tooth Cross-out */}
              {isMissing && (
                <g stroke="#dc2626" strokeWidth="4" strokeLinecap="round">
                  <line x1="15" y1="20" x2="85" y2="150" />
                  <line x1="85" y1="20" x2="15" y2="150" />
                </g>
              )}

              {/* Extraction cross / arrow */}
              {isExtraction && (
                <g stroke="#b91c1c" strokeWidth="3" strokeLinecap="round">
                  <line x1="20" y1="90" x2="80" y2="145" />
                  <line x1="80" y1="90" x2="20" y2="145" />
                </g>
              )}
            </g>
          </g>
        </svg>
      </div>

      {/* Treatment Code Badge (R, C, CR, F, I, X, E, FR, M, S, etc.) */}
      {showTreatmentBadge && effectiveTreatmentCode && (
        <span
          className={`absolute -bottom-1 text-[10px] font-black px-1.5 py-0.2 rounded-full border shadow-sm font-mono ${
            effectiveTreatmentCode === 'R'
              ? 'bg-purple-600 text-white border-purple-400'
              : effectiveTreatmentCode === 'C'
              ? 'bg-rose-600 text-white border-rose-400'
              : effectiveTreatmentCode === 'CR'
              ? 'bg-amber-500 text-white border-amber-300'
              : effectiveTreatmentCode === 'F'
              ? 'bg-blue-600 text-white border-blue-400'
              : effectiveTreatmentCode === 'I'
              ? 'bg-teal-600 text-white border-teal-400'
              : effectiveTreatmentCode === 'E'
              ? 'bg-red-700 text-white border-red-500'
              : effectiveTreatmentCode === 'FR'
              ? 'bg-orange-600 text-white border-orange-400'
              : effectiveTreatmentCode === 'M'
              ? 'bg-yellow-500 text-slate-900 border-yellow-300 font-extrabold'
              : effectiveTreatmentCode === 'S'
              ? 'bg-cyan-600 text-white border-cyan-400'
              : 'bg-slate-700 text-white border-slate-500'
          }`}
        >
          {effectiveTreatmentCode}
        </span>
      )}

      {/* Status indicator dot if planned or in-progress */}
      {tooth.treatmentStatus && (
        <span
          className={`w-2 h-2 rounded-full absolute top-5 right-0.5 border border-white shadow-sm ${
            tooth.treatmentStatus === 'In Progress'
              ? 'bg-emerald-500 animate-pulse'
              : tooth.treatmentStatus === 'Proposed'
              ? 'bg-amber-500'
              : tooth.treatmentStatus === 'Accepted'
              ? 'bg-sky-500'
              : 'bg-slate-400'
          }`}
          title={`Treatment Status: ${tooth.treatmentStatus}`}
        />
      )}
    </button>
  );
};
