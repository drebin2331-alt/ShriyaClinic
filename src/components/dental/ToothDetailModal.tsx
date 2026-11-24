import { ModalLayer } from '../common/ModalLayer';
import React, { useState } from 'react';
import { ToothCondition, ToothData, ToothSurface, ToothSurfaceState, TreatmentPlanItem, TreatmentPlanStatus } from '../../types';
import { getToothName, getConditionColor } from '../../utils/dentalChartHelper';
import { ToothSurfaceSelector } from './ToothSurfaceSelector';
import { PonticSelector } from './PonticSelector';
import { CollarSelector } from './CollarSelector';
import { X, Check, Plus, AlertCircle, Sparkles, ShieldAlert, FileText } from 'lucide-react';
import { ClayButton } from '../common/ClayButton';

interface ToothDetailModalProps {
  tooth: ToothData;
  isOpen: boolean;
  onClose: () => void;
  onSaveTooth: (updatedTooth: ToothData, newTreatmentItem?: Partial<TreatmentPlanItem>) => void;
  onAddTreatmentPlanItem?: (item: Partial<TreatmentPlanItem>) => void;
  existingTreatments?: TreatmentPlanItem[];
}

export interface ConditionProcedurePreset {
  name: string;
  diagnosis: string;
  cost: number;
}

export const CONDITION_PROCEDURE_PRESETS: Record<ToothCondition, ConditionProcedurePreset[]> = {
  Filling: [
    { name: 'Composite Resin Restoration (Filling)', diagnosis: 'Dental Caries / Defective Tooth Margin', cost: 1000 },
    { name: 'Glass Ionomer (GIC) Restoration', diagnosis: 'Cervical Abrasion & Class V Erosion', cost: 800 },
    { name: 'Deep Composite Build-Up & Base', diagnosis: 'Deep Dentinal Decay with Pulp Protection', cost: 1500 },
    { name: 'Composite Inlay / Onlay Restoration', diagnosis: 'Extensive Cuspal Decay', cost: 2500 }
  ],
  Caries: [
    { name: 'Composite Resin Restoration', diagnosis: 'Primary Dental Caries (Decay)', cost: 1000 },
    { name: 'Glass Ionomer (GIC) Cement Restoration', diagnosis: 'Active Enamel & Dentin Caries', cost: 800 },
    { name: 'Deep Caries Excavation & Indirect Pulp Capping', diagnosis: 'Deep Caries Approaching Pulp Chamber', cost: 1200 },
    { name: 'Root Canal Therapy (RCT)', diagnosis: 'Deep Caries with Irreversible Pulpitis', cost: 3500 }
  ],
  'Root Canal': [
    { name: 'Root Canal Therapy (RCT)', diagnosis: 'Deep Dental Caries with Irreversible Pulpitis', cost: 3500 },
    { name: 'Single-Visit Rotary Endodontic Therapy', diagnosis: 'Acute Pulpitis / Periapical Abscess', cost: 4000 },
    { name: 'Re-Root Canal Retreatment', diagnosis: 'Failed Previous Endodontic Treatment', cost: 4500 },
    { name: 'Pulpectomy / Emergency Pulp Extirpation', diagnosis: 'Acute Severe Toothache & Pulp Inflammation', cost: 1500 }
  ],
  Crown: [
    { name: 'Full Ceramic / Zirconia Crown', diagnosis: 'Post-Endodontic Restoration / Grossly Mutilated Tooth', cost: 4500 },
    { name: 'Porcelain-Fused-to-Metal (PFM) Crown', diagnosis: 'Weakened Tooth Structure Requiring Full Coverage', cost: 3000 },
    { name: 'E-Max Aesthetic Ceramic Crown', diagnosis: 'High Aesthetic Front Tooth Restoration', cost: 6000 },
    { name: 'Temporary Acrylic Crown', diagnosis: 'Provisional Tooth Protection', cost: 800 }
  ],
  Fracture: [
    { name: 'Fracture Re-attachment & Composite Build-up', diagnosis: 'Coronal Tooth Fracture (Enamel & Dentin)', cost: 1500 },
    { name: 'Fiber Post & Core Build-Up with Crown', diagnosis: 'Complicated Crown Fracture with Loss of Tooth Structure', cost: 5500 },
    { name: 'Root Canal Therapy for Fractured Tooth', diagnosis: 'Tooth Fracture with Direct Pulp Exposure', cost: 3500 },
    { name: 'Tooth Extraction for Vertical Fracture', diagnosis: 'Vertical Root Fracture / Non-Restorable Split Tooth', cost: 1000 }
  ],
  'Extraction Required': [
    { name: 'Routine Tooth Extraction', diagnosis: 'Grossly Decayed / Non-Restorable Tooth', cost: 800 },
    { name: 'Surgical Complicated Tooth Extraction', diagnosis: 'Curved Roots / Ankylosed / Broken Down Root Piece', cost: 2000 },
    { name: 'Impacted Wisdom Tooth Surgical Disimpaction', diagnosis: 'Impacted Third Molar with Recurrent Pericoronitis', cost: 3500 }
  ],
  Implant: [
    { name: 'Titanium Dental Implant Fixture Placement', diagnosis: 'Single Edentulous Tooth Space', cost: 25000 },
    { name: 'Implant Abutment & Zirconia Crown', diagnosis: 'Osseointegrated Implant Ready for Prosthetic Loading', cost: 8500 },
    { name: 'Bone Grafting & Ridge Augmentation', diagnosis: 'Insufficient Bone Width for Implant Placement', cost: 6000 }
  ],
  Missing: [
    { name: 'Fixed Partial Denture (3-Unit Bridge)', diagnosis: 'Missing Tooth Space with Healthy Abutments', cost: 9000 },
    { name: 'Titanium Dental Implant Placement', diagnosis: 'Single Missing Tooth Site', cost: 25000 },
    { name: 'Cast Partial Denture (Removable)', diagnosis: 'Tooth Loss with Multiple Missing Units', cost: 3500 }
  ],
  Mobility: [
    { name: 'Periodontal Fiber Splinting & Deep Scaling', diagnosis: 'Grade II Mobility secondary to Periodontal Bone Loss', cost: 1800 },
    { name: 'Subgingival Ultrasonic Scaling & Curettage', diagnosis: 'Chronic Generalized Periodontitis', cost: 1200 },
    { name: 'Extraction for Hopeless Mobile Tooth', diagnosis: 'Grade III Mobility / End-Stage Periodontal Breakdown', cost: 800 }
  ],
  Sensitivity: [
    { name: 'Dentinal Desensitization Therapy & Fluoride Varnish', diagnosis: 'Cervical Abrasion & Severe Dentin Hypersensitivity', cost: 600 },
    { name: 'Glass Ionomer (GIC) Cervical Wedge Restoration', diagnosis: 'Cervical Abfraction / Wedge-Shaped Lesion', cost: 800 },
    { name: 'Gingival Recession Soft Tissue Grafting', diagnosis: 'Root Exposure with Extreme Thermal Sensitivity', cost: 3500 }
  ],
  Healthy: [
    { name: 'Comprehensive Oral Prophylaxis & Polishing', diagnosis: 'Routine Preventive Oral Care', cost: 800 },
    { name: 'Pit & Fissure Sealant Application', diagnosis: 'Deep Occlusal Grooves at Risk of Caries', cost: 600 },
    { name: 'Topical Fluoride Remineralization Therapy', diagnosis: 'Enamel Demineralization Prevention', cost: 500 }
  ],
  Other: [
    { name: 'Specialist Dental Procedure', diagnosis: 'Dental Clinical Finding', cost: 1000 },
    { name: 'Oral Biopsy / Soft Tissue Excision', diagnosis: 'Pathological Soft Tissue Lesion', cost: 2500 }
  ]
};

export const ToothDetailModal: React.FC<ToothDetailModalProps> = ({
  tooth,
  isOpen,
  onClose,
  onSaveTooth,
  onAddTreatmentPlanItem,
  existingTreatments = []
}) => {
  if (!isOpen) return null;

  const initialCond = tooth.condition || 'Healthy';
  const defaultPreset = (CONDITION_PROCEDURE_PRESETS[initialCond] || CONDITION_PROCEDURE_PRESETS['Filling'])[0];

  const [condition, setCondition] = useState<ToothCondition>(initialCond);
  const [surfaces, setSurfaces] = useState<ToothSurfaceState>(tooth.surfaces || {});
  const [selectedSurface, setSelectedSurface] = useState<ToothSurface | null>('Occlusal');
  const [notes, setNotes] = useState<string>(tooth.notes || '');
  const [treatmentCode, setTreatmentCode] = useState<string>(tooth.treatmentCode || '');
  const [treatmentStatus, setTreatmentStatus] = useState<TreatmentPlanStatus>(tooth.treatmentStatus || 'Proposed');

  // Treatment plan form states - open by default and cost initialized from preset
  const [showAddTreatment, setShowAddTreatment] = useState(true);
  const [procName, setProcName] = useState(defaultPreset?.name || '');
  const [procDiagnosis, setProcDiagnosis] = useState(defaultPreset?.diagnosis || '');
  const [procCost, setProcCost] = useState<number | string>(defaultPreset?.cost || 1000);
  const [isCustomProc, setIsCustomProc] = useState(false);
  const [procPriority, setProcPriority] = useState<'High' | 'Medium' | 'Low'>('High');
  const [hasAddedTreatmentPlan, setHasAddedTreatmentPlan] = useState(false);

  // Prosthetic options
  const [showProsthetics, setShowProsthetics] = useState(false);
  const [restorationType, setRestorationType] = useState<'Crown' | 'Bridge' | 'Veneer' | 'Inlay' | 'Onlay'>('Crown');
  const [material, setMaterial] = useState<'Zirconia' | 'Ceramic' | 'PFM' | 'Metal' | 'E-Max'>('Zirconia');
  const [shade, setShade] = useState<'A1' | 'A2' | 'A3' | 'B1' | 'B2' | 'C1' | 'D2'>('A2');
  const [ponticDesign, setPonticDesign] = useState<'Modified Ridge' | 'Full Ridge' | 'Hygienic' | 'Ovate'>('Modified Ridge');
  const [collarDesign, setCollarDesign] = useState<'No Collar' | 'Lingual Collar' | '360° Collar'>('Lingual Collar');

  const conditionsList: ToothCondition[] = [
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
  ];

  const getCodeForCondition = (cond: ToothCondition): string => {
    switch (cond) {
      case 'Root Canal': return 'R';
      case 'Caries': return 'C';
      case 'Crown': return 'CR';
      case 'Filling': return 'F';
      case 'Implant': return 'I';
      case 'Missing': return 'X';
      case 'Extraction Required': return 'E';
      case 'Fracture': return 'FR';
      case 'Mobility': return 'M';
      case 'Sensitivity': return 'S';
      default: return '';
    }
  };

  const handleSurfaceCondition = (surface: ToothSurface, cond: ToothCondition) => {
    const key = surface.toLowerCase() as keyof ToothSurfaceState;
    setSurfaces((prev) => ({ ...prev, [key]: cond }));
    if (cond !== 'Healthy') {
      setCondition(cond);
      const code = getCodeForCondition(cond);
      if (code) setTreatmentCode(code);
      const rec = (CONDITION_PROCEDURE_PRESETS[cond] || CONDITION_PROCEDURE_PRESETS['Filling'])[0];
      if (rec && !isCustomProc) {
        setProcName(rec.name);
        setProcDiagnosis(rec.diagnosis);
        setProcCost(rec.cost);
      }
      if (cond === 'Crown') {
        setShowProsthetics(true);
      }
    }
  };

  const handleCreateTreatmentPlan = () => {
    const finalCost = Number(procCost) > 0
      ? Number(procCost)
      : ((CONDITION_PROCEDURE_PRESETS[condition] || [])[0]?.cost || 1000);

    const planItem: Partial<TreatmentPlanItem> = {
      toothNumbers: [tooth.toothNumber],
      diagnosis: procDiagnosis || `${condition} on Tooth #${tooth.toothNumber}`,
      procedure: procName || `${condition} Treatment`,
      priority: procPriority,
      estimatedCost: finalCost,
      status: treatmentStatus || 'Proposed',
      notes: notes || undefined,
      prostheticDesign: (showProsthetics || condition === 'Crown' || procName.toLowerCase().includes('crown')) ? {
        restorationType,
        material,
        shade,
        ponticDesign,
        collarDesign,
        marginDesign: 'Shoulder / Chamfer',
        labInstructions: `Custom shade ${shade} match for Tooth #${tooth.toothNumber}`
      } : undefined
    };

    if (onAddTreatmentPlanItem) {
      onAddTreatmentPlanItem(planItem);
    }
    setHasAddedTreatmentPlan(true);

    // Synchronize tooth condition with this planned treatment
    const procLower = procName.toLowerCase();
    const diagLower = procDiagnosis.toLowerCase();
    let newCond: ToothCondition = condition;
    let newCode = treatmentCode || getCodeForCondition(condition);

    if (procLower.includes('root canal') || procLower.includes('rct') || diagLower.includes('pulpitis')) {
      newCond = 'Root Canal';
      newCode = 'R';
    } else if (procLower.includes('crown') || restorationType === 'Crown') {
      newCond = 'Crown';
      newCode = 'CR';
    } else if (procLower.includes('filling') || procLower.includes('restoration')) {
      newCond = 'Filling';
      newCode = 'F';
    } else if (procLower.includes('extract')) {
      newCond = 'Missing';
      newCode = 'X';
    } else if (procLower.includes('implant')) {
      newCond = 'Implant';
      newCode = 'I';
    } else if (procLower.includes('caries') || diagLower.includes('caries')) {
      newCond = 'Caries';
      newCode = 'C';
    }

    setCondition(newCond);
    setTreatmentCode(newCode);
  };

  const handleSave = () => {
    let effectiveCondition = condition;
    if (effectiveCondition === 'Healthy' && surfaces) {
      const surfaceValues = Object.values(surfaces);
      if (surfaceValues.some((v) => v === 'Root Canal')) effectiveCondition = 'Root Canal';
      else if (surfaceValues.some((v) => v === 'Crown')) effectiveCondition = 'Crown';
      else if (surfaceValues.some((v) => v === 'Filling')) effectiveCondition = 'Filling';
      else if (surfaceValues.some((v) => v === 'Caries')) effectiveCondition = 'Caries';
      else if (surfaceValues.some((v) => v === 'Fracture')) effectiveCondition = 'Fracture';
      else if (surfaceValues.some((v) => v === 'Extraction Required')) effectiveCondition = 'Extraction Required';
      else if (surfaceValues.some((v) => v === 'Mobility')) effectiveCondition = 'Mobility';
      else if (surfaceValues.some((v) => v === 'Sensitivity')) effectiveCondition = 'Sensitivity';
    }

    const effectiveCode = treatmentCode || getCodeForCondition(effectiveCondition) || undefined;

    const updated: ToothData = {
      ...tooth,
      condition: effectiveCondition,
      surfaces,
      notes,
      treatmentCode: effectiveCode,
      treatmentStatus: treatmentStatus
    };

    let planItemToSave: Partial<TreatmentPlanItem> | undefined = undefined;

    // AUTO-CREATE TREATMENT PLAN IF NOT ALREADY ADDED:
    // If the tooth is marked with any active dental condition or code,
    // automatically generate and bundle the treatment plan item with its estimated cost!
    if (!hasAddedTreatmentPlan && (effectiveCondition !== 'Healthy' || effectiveCode || treatmentStatus !== 'Proposed')) {
      const finalCost = Number(procCost) > 0 
        ? Number(procCost) 
        : ((CONDITION_PROCEDURE_PRESETS[effectiveCondition] || [])[0]?.cost || 1000);

      const finalProcName = procName || (CONDITION_PROCEDURE_PRESETS[effectiveCondition] || [])[0]?.name || `${effectiveCondition} Procedure`;
      const finalDiag = procDiagnosis || (CONDITION_PROCEDURE_PRESETS[effectiveCondition] || [])[0]?.diagnosis || `${effectiveCondition} on Tooth #${tooth.toothNumber}`;

      planItemToSave = {
        toothNumbers: [tooth.toothNumber],
        diagnosis: finalDiag,
        procedure: finalProcName,
        priority: procPriority,
        estimatedCost: finalCost,
        status: treatmentStatus || 'Proposed',
        notes: notes || undefined,
        prostheticDesign: (effectiveCondition === 'Crown' || showProsthetics || finalProcName.toLowerCase().includes('crown')) ? {
          restorationType,
          material,
          shade,
          ponticDesign,
          collarDesign,
          marginDesign: 'Shoulder / Chamfer',
          labInstructions: `Custom shade ${shade} match for Tooth #${tooth.toothNumber}`
        } : undefined
      };
    }

    onSaveTooth(updated, planItemToSave);
    onClose();
  };

  return (
    <ModalLayer onDismiss={onClose} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="clay-card w-full max-w-3xl my-8 bg-white/95 rounded-3xl p-6 shadow-2xl border border-white/80 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 flex items-center justify-center text-sky-700 font-black text-xl font-mono shadow-inner">
              #{tooth.toothNumber}
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-800">
                {getToothName(tooth.toothNumber)}
              </h3>
              <p className="text-xs font-semibold text-slate-500">
                FDI Dental Examination, Surface Marking & Clinical Plan
              </p>
            </div>
          </div>
          <button aria-label="Close dialog"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="space-y-6 py-4">
          {/* Main Condition Selector */}
          <div>
            <label className="text-xs font-black uppercase tracking-wider text-slate-500 block mb-2">
              Primary Tooth Condition:
            </label>
            <div className="flex flex-wrap gap-2">
              {conditionsList.map((cond) => {
                const isSelected = condition === cond;
                const col = getConditionColor(cond);
                return (
                  <button
                    key={cond}
                    type="button"
                    onClick={() => {
                      setCondition(cond);
                      const code = getCodeForCondition(cond);
                      setTreatmentCode(code);
                      if (selectedSurface) {
                        const key = selectedSurface.toLowerCase() as keyof ToothSurfaceState;
                        setSurfaces((prev) => ({ ...prev, [key]: cond }));
                      }
                      // Automatically update procedure recommendation for selected condition
                      const rec = (CONDITION_PROCEDURE_PRESETS[cond] || CONDITION_PROCEDURE_PRESETS['Filling'])[0];
                      if (rec && !isCustomProc) {
                        setProcName(rec.name);
                        setProcDiagnosis(rec.diagnosis);
                        setProcCost(rec.cost);
                        if (cond === 'Crown') {
                          setShowProsthetics(true);
                          setRestorationType('Crown');
                        }
                      }
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'shadow-md scale-105 text-white ring-2 ring-slate-800'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                    style={{
                      backgroundColor: isSelected ? col : undefined
                    }}
                  >
                    <span className="w-2 h-2 rounded-full bg-white/80" />
                    <span>{cond}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5-Surface Diagram & Marking */}
          <ToothSurfaceSelector
            surfaces={surfaces}
            selectedSurface={selectedSurface}
            onSelectSurface={setSelectedSurface}
            onSetSurfaceCondition={handleSurfaceCondition}
            toothNumber={tooth.toothNumber}
          />

          {/* Treatment Code Badge & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">
                Chart Symbol Code:
              </label>
              <select
                value={treatmentCode}
                onChange={(e) => {
                  const val = e.target.value;
                  setTreatmentCode(val);
                  let matchedCond: ToothCondition | null = null;
                  if (val === 'CR') matchedCond = 'Crown';
                  else if (val === 'R') matchedCond = 'Root Canal';
                  else if (val === 'C') matchedCond = 'Caries';
                  else if (val === 'F') matchedCond = 'Filling';
                  else if (val === 'I') matchedCond = 'Implant';
                  else if (val === 'X' || val === 'E') matchedCond = 'Extraction Required';
                  else if (val === 'FR') matchedCond = 'Fracture';
                  else if (val === 'M') matchedCond = 'Mobility';
                  else if (val === 'S') matchedCond = 'Sensitivity';
                  if (matchedCond) {
                    setCondition(matchedCond);
                    const rec = (CONDITION_PROCEDURE_PRESETS[matchedCond] || CONDITION_PROCEDURE_PRESETS['Filling'])[0];
                    if (rec && !isCustomProc) {
                      setProcName(rec.name);
                      setProcDiagnosis(rec.diagnosis);
                      setProcCost(rec.cost);
                      if (matchedCond === 'Crown') {
                        setShowProsthetics(true);
                        setRestorationType('Crown');
                      }
                    }
                  }
                }}
                className="w-full px-3 py-2 rounded-xl text-xs font-bold bg-white border border-slate-300 focus:ring-2 focus:ring-sky-500"
              >
                <option value="">None (Standard View)</option>
                <option value="R">R - Root Canal</option>
                <option value="C">C - Caries / Cavity</option>
                <option value="F">F - Filling</option>
                <option value="CR">CR - Crown</option>
                <option value="I">I - Implant</option>
                <option value="X">X - Missing</option>
                <option value="E">E - Extraction Advised</option>
                <option value="FR">FR - Fracture / Crack</option>
                <option value="M">M - Mobility</option>
                <option value="S">S - Sensitivity</option>
                <option value="B">B - Bridge Unit</option>
                <option value="P">P - Prosthetic</option>
                <option value="W">W - Whitening</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">
                Treatment Plan Status:
              </label>
              <select
                value={treatmentStatus}
                onChange={(e) => setTreatmentStatus(e.target.value as TreatmentPlanStatus)}
                className="w-full px-3 py-2 rounded-xl text-xs font-bold bg-white border border-slate-300 focus:ring-2 focus:ring-sky-500"
              >
                <option value="Proposed">Proposed</option>
                <option value="Accepted">Accepted by Patient</option>
                <option value="Scheduled">Scheduled</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Clinical Doctor Notes */}
          <div>
            <label className="text-xs font-bold text-slate-600 flex items-center justify-between mb-1">
              <span>Doctor's Tooth Notes & Observations:</span>
              <span className="text-[10px] text-slate-400">Tooth #{tooth.toothNumber}</span>
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Mild tenderness on vertical percussion. Pulp testing non-vital. Deep disto-occlusal decay approaching pulp chamber."
              className="w-full px-3 py-2.5 rounded-xl text-xs bg-slate-50 border border-slate-300 focus:bg-white focus:ring-2 focus:ring-sky-500 font-medium"
            />
          </div>

          {/* Quick Add Treatment Plan Section */}
          <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-600" />
                <h4 className="text-xs font-black uppercase tracking-wider text-sky-800">
                  Treatment Planning for Tooth #{tooth.toothNumber}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowAddTreatment(!showAddTreatment)}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-sky-600 text-white hover:bg-sky-700 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{showAddTreatment ? 'Collapse' : 'Add Procedure to Plan'}</span>
              </button>
            </div>

            {existingTreatments && existingTreatments.length > 0 && (
              <div className="mb-3 p-3 bg-white rounded-xl border border-sky-300 shadow-2xs">
                <span className="text-[11px] font-extrabold text-sky-950 block mb-1.5 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Existing Treatment Plan for Tooth #{tooth.toothNumber}:</span>
                </span>
                <div className="space-y-1">
                  {existingTreatments.map((t) => (
                    <div key={t.id} className="flex justify-between items-center text-xs bg-slate-50 p-2 rounded-lg border border-slate-200">
                      <div>
                        <span className="font-bold text-slate-800">{t.procedure}</span>
                        <span className="text-[10px] text-slate-500 block">{t.diagnosis} • Status: <strong>{t.status}</strong></span>
                      </div>
                      <span className="font-mono font-black text-emerald-700 text-sm">₹{(t.estimatedCost || 0).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {hasAddedTreatmentPlan && (
              <div className="mb-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-900 font-bold flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Procedure added to Treatment Plan: <strong>{procName}</strong> (₹{Number(procCost).toLocaleString()})</span>
                </span>
                <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-800">
                  Ready to Save ✓
                </span>
              </div>
            )}

            {showAddTreatment && (
              <div className="mt-3 pt-3 border-t border-sky-200/80 space-y-3 animate-in fade-in">
                {/* Condition-Tailored Recommended Procedures Picker */}
                <div className="p-3 bg-white rounded-xl border border-sky-200 shadow-sm space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="text-[11px] font-extrabold text-sky-900 flex items-center gap-1.5">
                      <span>Suitable Procedures for:</span>
                      <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-300 font-black">
                        {condition}
                      </span>
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold">
                      Select a procedure below or enter a custom procedure:
                    </span>
                  </div>

                  {/* Quick-pick procedure chips */}
                  <div className="flex flex-wrap gap-1.5">
                    {/* Custom New Procedure Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomProc(true);
                        setProcName('');
                        setProcDiagnosis('');
                        setProcCost('');
                      }}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        isCustomProc
                          ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-300'
                          : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200'
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Custom / New Procedure</span>
                    </button>

                    {(CONDITION_PROCEDURE_PRESETS[condition] || []).map((preset) => {
                      const isCurrent = !isCustomProc && procName === preset.name;
                      return (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => {
                            setIsCustomProc(false);
                            setProcName(preset.name);
                            setProcDiagnosis(preset.diagnosis);
                            setProcCost(preset.cost);
                            if (condition === 'Crown' || preset.name.toLowerCase().includes('crown') || preset.name.toLowerCase().includes('bridge')) {
                              setShowProsthetics(true);
                            }
                          }}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                            isCurrent
                              ? 'bg-sky-600 text-white shadow-sm ring-2 ring-sky-300'
                              : 'bg-slate-50 hover:bg-sky-50 text-slate-700 border border-slate-200'
                          }`}
                        >
                          <span>{preset.name} (₹{preset.cost.toLocaleString()})</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Or select from full dropdown */}
                  <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center gap-2">
                    <label className="text-[11px] font-bold text-slate-600 shrink-0">
                      Or Select from Procedure Catalog:
                    </label>
                    <select
                      value={isCustomProc ? '__CUSTOM__' : procName}
                      onChange={(e) => {
                        const chosenName = e.target.value;
                        if (chosenName === '__CUSTOM__') {
                          setIsCustomProc(true);
                          setProcName('');
                          setProcDiagnosis('');
                          setProcCost('');
                          return;
                        }
                        setIsCustomProc(false);
                        setProcName(chosenName);
                        for (const condKey of Object.keys(CONDITION_PROCEDURE_PRESETS) as ToothCondition[]) {
                          const found = CONDITION_PROCEDURE_PRESETS[condKey]?.find((p) => p.name === chosenName);
                          if (found) {
                            setProcDiagnosis(found.diagnosis);
                            setProcCost(found.cost);
                            if (chosenName.toLowerCase().includes('crown') || chosenName.toLowerCase().includes('bridge')) {
                              setShowProsthetics(true);
                            }
                            break;
                          }
                        }
                      }}
                      className="w-full px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-50 border border-slate-300 focus:bg-white focus:ring-2 focus:ring-sky-500 cursor-pointer"
                    >
                      <option value="__CUSTOM__">✏️ + Custom / New Procedure (Enter Details Manually)</option>
                      <optgroup label={`Suitable for ${condition}`}>
                        {(CONDITION_PROCEDURE_PRESETS[condition] || []).map((p) => (
                          <option key={p.name} value={p.name}>
                            {p.name}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="Other Dental Procedures">
                        {Object.entries(CONDITION_PROCEDURE_PRESETS)
                          .filter(([cond]) => cond !== condition)
                          .flatMap(([_, presets]) => presets)
                          .map((p) => (
                            <option key={`${p.name}-${p.diagnosis}`} value={p.name}>
                              {p.name}
                            </option>
                          ))}
                      </optgroup>
                    </select>
                  </div>
                </div>

                {isCustomProc && (
                  <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-800 font-semibold flex items-center justify-between">
                    <span>✏️ <strong>Custom Procedure Mode:</strong> Enter your custom procedure name, diagnosis, and price manually below.</span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomProc(false);
                        const rec = (CONDITION_PROCEDURE_PRESETS[condition] || CONDITION_PROCEDURE_PRESETS['Filling'])[0];
                        if (rec) {
                          setProcName(rec.name);
                          setProcDiagnosis(rec.diagnosis);
                        }
                      }}
                      className="text-[11px] underline font-bold text-indigo-700 hover:text-indigo-900 cursor-pointer"
                    >
                      Reset to Catalog
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Procedure Name:
                    </label>
                    <input
                      type="text"
                      value={procName}
                      onChange={(e) => setProcName(e.target.value)}
                      placeholder="e.g. Tooth Restoration, Polishing, Splinting..."
                      className="w-full px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-slate-300 focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Clinical Diagnosis:
                    </label>
                    <input
                      type="text"
                      value={procDiagnosis}
                      onChange={(e) => setProcDiagnosis(e.target.value)}
                      placeholder="e.g. Dental Caries, Abrasion, Pulpitis..."
                      className="w-full px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-slate-300 focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Estimated Cost (₹) (Manually Enter):
                    </label>
                    <input
                      type="number"
                      value={procCost}
                      onChange={(e) => setProcCost(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="Enter price manually (e.g. 500)"
                      className="w-full px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-slate-300 focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Priority:
                    </label>
                    <select
                      value={procPriority}
                      onChange={(e) => setProcPriority(e.target.value as 'High' | 'Medium' | 'Low')}
                      className="w-full px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-slate-300"
                    >
                      <option value="High">High (Immediate)</option>
                      <option value="Medium">Medium (Next Visit)</option>
                      <option value="Low">Low (Elective)</option>
                    </select>
                  </div>
                </div>

                {/* Prosthetic Design Toggle if Crown/Bridge/Restoration */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setShowProsthetics(!showProsthetics)}
                    className="text-xs font-bold text-indigo-700 flex items-center gap-1.5 hover:underline cursor-pointer"
                  >
                    <span>{showProsthetics ? 'Hide' : '+ Configure Prosthetic Specs (Pontic, Collar, Material, Shade)'}</span>
                  </button>

                  {showProsthetics && (
                    <div className="mt-3 p-3.5 bg-white rounded-xl border border-indigo-200 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="text-[11px] font-bold text-slate-600 block mb-1">Restoration Type:</label>
                          <select
                            value={restorationType}
                            onChange={(e) => setRestorationType(e.target.value as any)}
                            className="w-full px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-slate-300"
                          >
                            <option value="Crown">Crown</option>
                            <option value="Bridge">Bridge</option>
                            <option value="Veneer">Veneer</option>
                            <option value="Inlay">Inlay</option>
                            <option value="Onlay">Onlay</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-600 block mb-1">Material:</label>
                          <select
                            value={material}
                            onChange={(e) => setMaterial(e.target.value as any)}
                            className="w-full px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-slate-300"
                          >
                            <option value="Zirconia">Zirconia (Monolithic)</option>
                            <option value="Ceramic">Ceramic (Layered)</option>
                            <option value="PFM">PFM (Porcelain-Fused-to-Metal)</option>
                            <option value="E-Max">E-Max (Lithium Disilicate)</option>
                            <option value="Metal">Full Cast Metal</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-600 block mb-1">Vita Shade:</label>
                          <select
                            value={shade}
                            onChange={(e) => setShade(e.target.value as any)}
                            className="w-full px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-slate-300"
                          >
                            <option value="A1">A1 (Very Light)</option>
                            <option value="A2">A2 (Standard Natural)</option>
                            <option value="A3">A3 (Slightly Warm)</option>
                            <option value="B1">B1 (Bright White)</option>
                            <option value="B2">B2 (Warm Yellow)</option>
                            <option value="C1">C1 (Gray Tone)</option>
                            <option value="D2">D2 (Reddish Tone)</option>
                          </select>
                        </div>
                      </div>

                      {/* Pontic and Collar visual selectors */}
                      <PonticSelector value={ponticDesign} onChange={setPonticDesign} />
                      <CollarSelector value={collarDesign} onChange={setCollarDesign} />
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-sky-100">
                  <span className="text-xs font-bold text-slate-600">
                    Estimated Procedure Fee: <strong className="text-emerald-800 font-mono text-sm">₹{Number(procCost || 0).toLocaleString()}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={handleCreateTreatmentPlan}
                    className="px-4 py-2 rounded-xl bg-sky-600 text-white font-bold text-xs hover:bg-sky-700 shadow-sm cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{hasAddedTreatmentPlan ? 'Update in Treatment Plan' : `Add to Treatment Plan (₹${Number(procCost || 0).toLocaleString()})`}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <ClayButton
            variant="primary"
            onClick={handleSave}
            icon={<Check className="w-4 h-4" />}
          >
            Save Tooth & Plan Changes
          </ClayButton>
        </div>
      </div>
    </ModalLayer>
  );
};
