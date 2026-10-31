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
  onSaveTooth: (updatedTooth: ToothData) => void;
  onAddTreatmentPlanItem?: (item: Partial<TreatmentPlanItem>) => void;
  existingTreatments?: TreatmentPlanItem[];
}

export const ToothDetailModal: React.FC<ToothDetailModalProps> = ({
  tooth,
  isOpen,
  onClose,
  onSaveTooth,
  onAddTreatmentPlanItem,
  existingTreatments = []
}) => {
  if (!isOpen) return null;

  const [condition, setCondition] = useState<ToothCondition>(tooth.condition);
  const [surfaces, setSurfaces] = useState<ToothSurfaceState>(tooth.surfaces || {});
  const [selectedSurface, setSelectedSurface] = useState<ToothSurface | null>('Occlusal');
  const [notes, setNotes] = useState<string>(tooth.notes || '');
  const [treatmentCode, setTreatmentCode] = useState<string>(tooth.treatmentCode || '');
  const [treatmentStatus, setTreatmentStatus] = useState<TreatmentPlanStatus>(tooth.treatmentStatus || 'Proposed');

  // Treatment plan form states
  const [showAddTreatment, setShowAddTreatment] = useState(false);
  const [procName, setProcName] = useState('Root Canal Therapy');
  const [procDiagnosis, setProcDiagnosis] = useState('Deep Dental Caries with Irreversible Pulpitis');
  const [procCost, setProcCost] = useState<number>(3500);
  const [procPriority, setProcPriority] = useState<'High' | 'Medium' | 'Low'>('High');

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

  const handleSurfaceCondition = (surface: ToothSurface, cond: ToothCondition) => {
    const key = surface.toLowerCase() as keyof ToothSurfaceState;
    setSurfaces((prev) => ({ ...prev, [key]: cond }));
  };

  const handleSave = () => {
    const updated: ToothData = {
      ...tooth,
      condition,
      surfaces,
      notes,
      treatmentCode: treatmentCode || (condition === 'Root Canal' ? 'R' : condition === 'Caries' ? 'C' : condition === 'Crown' ? 'CR' : condition === 'Filling' ? 'F' : condition === 'Missing' ? 'X' : condition === 'Implant' ? 'I' : undefined),
      treatmentStatus: treatmentStatus
    };
    onSaveTooth(updated);
    onClose();
  };

  const handleCreateTreatmentPlan = () => {
    if (onAddTreatmentPlanItem) {
      onAddTreatmentPlanItem({
        toothNumbers: [tooth.toothNumber],
        diagnosis: procDiagnosis,
        procedure: procName,
        priority: procPriority,
        estimatedCost: procCost,
        status: 'Proposed',
        notes: notes || undefined,
        prostheticDesign: showProsthetics ? {
          restorationType,
          material,
          shade,
          ponticDesign,
          collarDesign,
          marginDesign: 'Shoulder / Chamfer',
          labInstructions: `Custom shade ${shade} match for Tooth #${tooth.toothNumber}`
        } : undefined
      });
      setShowAddTreatment(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in overflow-y-auto">
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
          <button
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
                      if (cond === 'Root Canal') setTreatmentCode('R');
                      else if (cond === 'Caries') setTreatmentCode('C');
                      else if (cond === 'Crown') setTreatmentCode('CR');
                      else if (cond === 'Filling') setTreatmentCode('F');
                      else if (cond === 'Implant') setTreatmentCode('I');
                      else if (cond === 'Missing') setTreatmentCode('X');
                      else if (cond === 'Extraction Required') setTreatmentCode('E');
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
                onChange={(e) => setTreatmentCode(e.target.value)}
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

            {showAddTreatment && (
              <div className="mt-3 pt-3 border-t border-sky-200/80 space-y-3 animate-in fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Procedure Name:
                    </label>
                    <input
                      type="text"
                      value={procName}
                      onChange={(e) => setProcName(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-slate-300"
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
                      className="w-full px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-slate-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Estimated Cost (₹):
                    </label>
                    <input
                      type="number"
                      value={procCost}
                      onChange={(e) => setProcCost(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-slate-300"
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

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={handleCreateTreatmentPlan}
                    className="px-4 py-2 rounded-xl bg-sky-600 text-white font-bold text-xs hover:bg-sky-700 shadow-sm cursor-pointer"
                  >
                    Confirm & Add to Patient Treatment Plan
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
            Save Tooth Changes
          </ClayButton>
        </div>
      </div>
    </div>
  );
};
