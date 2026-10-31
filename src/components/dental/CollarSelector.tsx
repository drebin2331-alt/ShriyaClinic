import React from 'react';
import { CollarType } from '../../types';

interface CollarSelectorProps {
  value?: CollarType;
  onChange: (val: CollarType) => void;
}

export const CollarSelector: React.FC<CollarSelectorProps> = ({
  value = 'Lingual Collar',
  onChange
}) => {
  const collarOptions: {
    type: CollarType;
    title: string;
    description: string;
    indication: string;
  }[] = [
    {
      type: 'No Collar',
      title: 'No Collar (Porcelain Margin)',
      description: 'Porcelain butt joint margin with 100% ceramic coverage at the cervical boundary.',
      indication: 'Maximum aesthetic finish for anterior teeth (zero metal showing).'
    },
    {
      type: 'Lingual Collar',
      title: 'Lingual Collar (Standard PFM)',
      description: 'Discreet 0.5mm - 1mm metal collar placed exclusively on the lingual margin.',
      indication: 'Enhanced structural rigidity without aesthetic compromise in front view.'
    },
    {
      type: '360° Collar',
      title: '360° Circumferential Collar',
      description: 'Full 360-degree metal band surrounding the cervical finish line.',
      indication: 'Maximum retention, superior marginal seal for short crown preps.'
    }
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-black uppercase tracking-wider text-slate-600">
          Collar & Metal Substructure Design
        </label>
        <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
          Selected: {value}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {collarOptions.map((opt) => {
          const isSelected = value === opt.type;
          return (
            <div
              key={opt.type}
              onClick={() => onChange(opt.type)}
              className={`p-3 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'border-indigo-500 bg-indigo-50/70 shadow-md ring-2 ring-indigo-300'
                  : 'border-slate-200 bg-white/80 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              {/* Collar Vector Illustration */}
              <div className="h-28 w-full bg-slate-100/70 rounded-xl flex items-center justify-center p-2 mb-2.5 overflow-hidden">
                <svg viewBox="0 0 100 100" className="w-full h-full max-h-24">
                  {/* Crown prep core */}
                  <path d="M30,70 L35,35 L65,35 L70,70 Z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.5" />
                  
                  {opt.type === 'No Collar' && (
                    <g>
                      {/* Full Ceramic shell covering completely down to margin */}
                      <path d="M22,70 C18,30 25,12 50,12 C75,12 82,30 78,70 Z" fill="#ffffff" stroke="#38bdf8" strokeWidth="2.5" />
                      <circle cx="50" cy="70" r="3" fill="#10b981" />
                      <text x="50" y="85" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#0369a1">
                        All-Ceramic Margin
                      </text>
                    </g>
                  )}

                  {opt.type === 'Lingual Collar' && (
                    <g>
                      {/* Crown */}
                      <path d="M22,68 C18,30 25,12 50,12 C75,12 82,30 78,68 Z" fill="#ffffff" stroke="#64748b" strokeWidth="2" />
                      {/* Metal framework visible on right (lingual side) */}
                      <path d="M68,64 L78,68 L78,74 L68,74 Z" fill="#475569" stroke="#1e293b" strokeWidth="1.5" />
                      <text x="50" y="86" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#4338ca">
                        Lingual Metal Rim
                      </text>
                    </g>
                  )}

                  {opt.type === '360° Collar' && (
                    <g>
                      {/* Crown */}
                      <path d="M22,64 C18,30 25,12 50,12 C75,12 82,30 78,64 Z" fill="#ffffff" stroke="#64748b" strokeWidth="2" />
                      {/* Continuous metal collar band at base */}
                      <rect x="20" y="64" width="60" height="9" rx="2" fill="#475569" stroke="#1e293b" strokeWidth="1.5" />
                      <text x="50" y="86" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#475569">
                        Full 360° Metal Band
                      </text>
                    </g>
                  )}
                </svg>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-800">{opt.title}</span>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300 bg-white'}`}>
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 leading-tight mb-1.5">
                  {opt.description}
                </p>
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded-md inline-block">
                  {opt.indication}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
