import React from 'react';
import { PonticType } from '../../types';

interface PonticSelectorProps {
  value?: PonticType;
  onChange: (val: PonticType) => void;
}

export const PonticSelector: React.FC<PonticSelectorProps> = ({
  value = 'Modified Ridge',
  onChange
}) => {
  const ponticOptions: {
    type: PonticType;
    title: string;
    description: string;
    advantage: string;
  }[] = [
    {
      type: 'Modified Ridge',
      title: 'Modified Ridge Lap',
      description: 'Tissue contact on buccal slope only with open lingual contour.',
      advantage: 'Optimal balance of aesthetics & cleanability (Most Popular).'
    },
    {
      type: 'Full Ridge',
      title: 'Full Ridge Lap (Saddle)',
      description: 'Convex design overlapping both buccal and lingual ridge slopes.',
      advantage: 'Maximum aesthetic illusion, requires meticulous hygiene.'
    },
    {
      type: 'Hygienic',
      title: 'Hygienic / Sanitary',
      description: 'Zero mucosal contact; elevated 2mm above alveolar crest.',
      advantage: 'Easiest flossing for posterior mandibular molars.'
    },
    {
      type: 'Ovate',
      title: 'Ovate Pontic',
      description: 'Egg-shaped convex base resting in surgically prepared socket.',
      advantage: 'Pristine natural emergence profile for anterior smile zone.'
    }
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-black uppercase tracking-wider text-slate-600">
          Pontic Design Selection
        </label>
        <span className="text-[11px] font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
          Selected: {value}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {ponticOptions.map((opt) => {
          const isSelected = value === opt.type;
          return (
            <div
              key={opt.type}
              onClick={() => onChange(opt.type)}
              className={`p-3 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'border-sky-500 bg-sky-50/70 shadow-md ring-2 ring-sky-300'
                  : 'border-slate-200 bg-white/80 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              {/* Pontic Vector Illustration */}
              <div className="h-28 w-full bg-slate-100/70 rounded-xl flex items-center justify-center p-2 mb-2.5 overflow-hidden">
                <svg viewBox="0 0 100 100" className="w-full h-full max-h-24">
                  {/* Gum / Alveolar Ridge Tissue */}
                  {opt.type === 'Modified Ridge' && (
                    <g>
                      {/* Ridge */}
                      <path d="M10,80 C30,45 70,45 90,80 Z" fill="#fda4af" stroke="#f43f5e" strokeWidth="2" />
                      {/* Pontic Tooth */}
                      <path d="M25,15 C20,40 25,60 50,56 C75,53 80,40 75,15 Z" fill="#f8fafc" stroke="#64748b" strokeWidth="2" />
                      {/* Floss arrow indicator */}
                      <path d="M60,65 Q75,68 85,60" stroke="#0284c7" strokeWidth="2" strokeDasharray="3 2" fill="none" />
                    </g>
                  )}

                  {opt.type === 'Full Ridge' && (
                    <g>
                      {/* Ridge */}
                      <path d="M10,80 C30,45 70,45 90,80 Z" fill="#fda4af" stroke="#f43f5e" strokeWidth="2" />
                      {/* Pontic Tooth hugging ridge tightly on both sides */}
                      <path d="M25,15 C20,40 20,68 50,60 C80,68 80,40 75,15 Z" fill="#f8fafc" stroke="#64748b" strokeWidth="2" />
                    </g>
                  )}

                  {opt.type === 'Hygienic' && (
                    <g>
                      {/* Ridge */}
                      <path d="M10,85 C30,60 70,60 90,85 Z" fill="#fda4af" stroke="#f43f5e" strokeWidth="2" />
                      {/* Suspended Pontic with clearance */}
                      <path d="M25,15 C20,38 30,48 50,48 C70,48 80,38 75,15 Z" fill="#f8fafc" stroke="#64748b" strokeWidth="2" />
                      {/* Sanitary gap */}
                      <text x="50" y="58" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#0284c7">
                        2mm clearance
                      </text>
                    </g>
                  )}

                  {opt.type === 'Ovate' && (
                    <g>
                      {/* Ridge with concave pocket depression */}
                      <path d="M10,75 C25,50 35,55 50,65 C65,55 75,50 90,75 Z" fill="#fda4af" stroke="#f43f5e" strokeWidth="2" />
                      {/* Convex rounded pontic seated in depression */}
                      <path d="M25,15 C20,38 30,62 50,64 C70,62 80,38 75,15 Z" fill="#f8fafc" stroke="#64748b" strokeWidth="2" />
                    </g>
                  )}
                </svg>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-800">{opt.title}</span>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-sky-600 bg-sky-600' : 'border-slate-300 bg-white'}`}>
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 leading-tight mb-1.5">
                  {opt.description}
                </p>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md inline-block">
                  {opt.advantage}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
