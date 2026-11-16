import { ToothCondition, ToothData, TreatmentPlanStatus } from '../types';

export const ADULT_UPPER_RIGHT = [18, 17, 16, 15, 14, 13, 12, 11];
export const ADULT_UPPER_LEFT = [21, 22, 23, 24, 25, 26, 27, 28];
export const ADULT_LOWER_LEFT = [31, 32, 33, 34, 35, 36, 37, 38];
export const ADULT_LOWER_RIGHT = [48, 47, 46, 45, 44, 43, 42, 41];

export const CHILD_UPPER_RIGHT = [55, 54, 53, 52, 51];
export const CHILD_UPPER_LEFT = [61, 62, 63, 64, 65];
export const CHILD_LOWER_LEFT = [71, 72, 73, 74, 75];
export const CHILD_LOWER_RIGHT = [85, 84, 83, 82, 81];

export const ALL_ADULT_TEETH = [
  ...ADULT_UPPER_RIGHT,
  ...ADULT_UPPER_LEFT,
  ...ADULT_LOWER_RIGHT,
  ...ADULT_LOWER_LEFT
];

export const ALL_CHILD_TEETH = [
  ...CHILD_UPPER_RIGHT,
  ...CHILD_UPPER_LEFT,
  ...CHILD_LOWER_RIGHT,
  ...CHILD_LOWER_LEFT
];

export interface LegendItem {
  code: string;
  label: string;
  description: string;
  textColor: string;
  bgColor: string;
  borderColor: string;
}

export const TREATMENT_LEGEND: LegendItem[] = [
  { code: 'X', label: 'Missing', description: 'Missing or previously extracted tooth', textColor: 'text-slate-600', bgColor: 'bg-slate-100', borderColor: 'border-slate-300' },
  { code: 'C', label: 'Caries', description: 'Dental decay / Cavity lesion', textColor: 'text-rose-700', bgColor: 'bg-rose-100', borderColor: 'border-rose-300' },
  { code: 'R', label: 'Root Canal', description: 'Endodontic therapy required or in-progress', textColor: 'text-purple-700', bgColor: 'bg-purple-100', borderColor: 'border-purple-300' },
  { code: 'F', label: 'Filling', description: 'Composite / Amalgam restoration present', textColor: 'text-blue-700', bgColor: 'bg-blue-100', borderColor: 'border-blue-300' },
  { code: 'CR', label: 'Crown', description: 'Ceramic / Zirconia / PFM prosthetic crown', textColor: 'text-amber-800', bgColor: 'bg-amber-100', borderColor: 'border-amber-300' },
  { code: 'I', label: 'Implant', description: 'Titanium root fixture & abutment', textColor: 'text-teal-800', bgColor: 'bg-teal-100', borderColor: 'border-teal-300' },
  { code: 'E', label: 'Extraction', description: 'Surgical or regular extraction advised', textColor: 'text-red-800', bgColor: 'bg-red-200', borderColor: 'border-red-400' },
  { code: 'FR', label: 'Fracture', description: 'Fractured or cracked tooth crown/root', textColor: 'text-orange-800', bgColor: 'bg-orange-100', borderColor: 'border-orange-300' },
  { code: 'M', label: 'Mobility', description: 'Grade I/II/III tooth mobility', textColor: 'text-amber-900', bgColor: 'bg-yellow-100', borderColor: 'border-yellow-300' },
  { code: 'S', label: 'Sensitivity', description: 'Dentin hypersensitivity / thermal reaction', textColor: 'text-cyan-800', bgColor: 'bg-cyan-100', borderColor: 'border-cyan-300' },
  { code: 'B', label: 'Bridge', description: 'Fixed partial denture unit / pontic', textColor: 'text-indigo-800', bgColor: 'bg-indigo-100', borderColor: 'border-indigo-300' },
  { code: 'P', label: 'Prosthetic', description: 'Removable partial or full denture', textColor: 'text-emerald-800', bgColor: 'bg-emerald-100', borderColor: 'border-emerald-300' },
  { code: 'W', label: 'Whitening', description: 'Aesthetic bleaching / enamel treatment', textColor: 'text-sky-800', bgColor: 'bg-sky-100', borderColor: 'border-sky-300' }
];

export const getToothType = (toothNumber: number): 'incisor' | 'canine' | 'premolar' | 'molar' => {
  const lastDigit = toothNumber % 10;
  if (lastDigit === 1 || lastDigit === 2) return 'incisor';
  if (lastDigit === 3) return 'canine';
  if (lastDigit === 4 || lastDigit === 5) {
    // Child 4 and 5 are primary molars
    if (toothNumber >= 50) return 'molar';
    return 'premolar';
  }
  return 'molar';
};

export const getToothName = (num: number): string => {
  const isChild = num >= 50;
  const quadrant = Math.floor(num / 10);
  const toothPos = num % 10;

  let quadStr = '';
  switch (quadrant) {
    case 1: quadStr = 'Upper Right'; break;
    case 2: quadStr = 'Upper Left'; break;
    case 3: quadStr = 'Lower Left'; break;
    case 4: quadStr = 'Lower Right'; break;
    case 5: quadStr = 'Primary Upper Right'; break;
    case 6: quadStr = 'Primary Upper Left'; break;
    case 7: quadStr = 'Primary Lower Left'; break;
    case 8: quadStr = 'Primary Lower Right'; break;
  }

  const names: Record<number, string> = {
    1: 'Central Incisor',
    2: 'Lateral Incisor',
    3: 'Canine (Cuspid)',
    4: isChild ? 'First Molar' : 'First Premolar (Bicuspid)',
    5: isChild ? 'Second Molar' : 'Second Premolar (Bicuspid)',
    6: 'First Molar (6-yr)',
    7: 'Second Molar (12-yr)',
    8: 'Third Molar (Wisdom)'
  };

  return `${quadStr} ${names[toothPos] || 'Tooth'} (#${num})`;
};

export const createDefaultToothData = (toothNumber: number): ToothData => {
  const isChild = toothNumber >= 50;
  return {
    toothNumber,
    type: isChild ? 'child' : 'adult',
    condition: 'Healthy',
    surfaces: {
      mesial: 'Healthy',
      distal: 'Healthy',
      occlusal: 'Healthy',
      buccal: 'Healthy',
      lingual: 'Healthy'
    }
  };
};

export const createFullDefaultDentalChart = (): ToothData[] => {
  const chart: ToothData[] = [];
  ALL_ADULT_TEETH.forEach((num) => {
    chart.push(createDefaultToothData(num));
  });
  ALL_CHILD_TEETH.forEach((num) => {
    chart.push(createDefaultToothData(num));
  });
  return chart;
};

export const getConditionColor = (condition: ToothCondition): string => {
  switch (condition) {
    case 'Healthy':
      return '#e2e8f0';
    case 'Caries':
      return '#ef4444'; // Red
    case 'Filling':
      return '#3b82f6'; // Blue
    case 'Crown':
      return '#f59e0b'; // Amber Gold
    case 'Root Canal':
      return '#a855f7'; // Purple
    case 'Missing':
      return '#64748b'; // Slate
    case 'Implant':
      return '#14b8a6'; // Teal
    case 'Fracture':
      return '#f97316'; // Orange
    case 'Extraction Required':
      return '#dc2626'; // Deep Red
    case 'Mobility':
      return '#eab308'; // Yellow
    case 'Sensitivity':
      return '#06b6d4'; // Cyan
    case 'Other':
      return '#8b5cf6';
    default:
      return '#cbd5e1';
  }
};
