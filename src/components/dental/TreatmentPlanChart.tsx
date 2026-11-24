import { ModalLayer } from '../common/ModalLayer';
import React, { useState } from 'react';
import { ToothData, TreatmentPlanItem, TreatmentPlanStatus } from '../../types';
import { DentalChart } from './DentalChart';
import { TreatmentLegend } from './TreatmentLegend';
import { ToothDetailModal } from './ToothDetailModal';
import { 
  Sparkles, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Trash2, 
  Edit3, 
  DollarSign, 
  Layers, 
  FileCheck,
  Send,
  X
} from 'lucide-react';
import { ClayButton } from '../common/ClayButton';

interface TreatmentPlanChartProps {
  teeth: ToothData[];
  treatmentPlans: TreatmentPlanItem[];
  onUpdateTeeth: (teeth: ToothData[]) => void;
  onAddTreatmentPlan: (item: Partial<TreatmentPlanItem>) => void;
  onUpdateTreatmentStatus: (id: string, status: TreatmentPlanStatus) => void;
  onDeleteTreatmentPlan: (id: string) => void;
  onEditTreatmentPlan?: (item: TreatmentPlanItem) => void;
  onNavigateToBilling?: () => void;
  doctorName?: string;
  patientId: string;
}

export const TreatmentPlanChart: React.FC<TreatmentPlanChartProps> = ({
  teeth,
  treatmentPlans,
  onUpdateTeeth,
  onAddTreatmentPlan,
  onUpdateTreatmentStatus,
  onDeleteTreatmentPlan,
  onEditTreatmentPlan,
  onNavigateToBilling,
  doctorName = 'Consulting Doctor',
  patientId
}) => {
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [selectedTeethMulti, setSelectedTeethMulti] = useState<number[]>([]);
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [showTeethSelector, setShowTeethSelector] = useState(false);
  const [legendFilter, setLegendFilter] = useState<string | null>(null);

  // Edit treatment plan item state
  const [editingItem, setEditingItem] = useState<TreatmentPlanItem | null>(null);
  const [editProcedure, setEditProcedure] = useState('');
  const [editDiagnosis, setEditDiagnosis] = useState('');
  const [editCost, setEditCost] = useState<number>(0);
  const [editPriority, setEditPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [editStatus, setEditStatus] = useState<TreatmentPlanStatus>('Proposed');
  const [editTeethStr, setEditTeethStr] = useState('');

  const handleOpenEditModal = (item: TreatmentPlanItem) => {
    setEditingItem(item);
    setEditProcedure(item.procedure);
    setEditDiagnosis(item.diagnosis);
    setEditCost(item.estimatedCost);
    setEditPriority(item.priority);
    setEditStatus(item.status);
    setEditTeethStr((item.toothNumbers || []).join(', '));
  };

  const handleSaveEditedItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    const parsedTeeth = editTeethStr
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));

    const updated: TreatmentPlanItem = {
      ...editingItem,
      procedure: editProcedure.trim() || editingItem.procedure,
      diagnosis: editDiagnosis.trim() || editingItem.diagnosis,
      estimatedCost: Number(editCost) || 0,
      priority: editPriority,
      status: editStatus,
      toothNumbers: parsedTeeth.length > 0 ? parsedTeeth : editingItem.toothNumbers
    };

    if (onEditTreatmentPlan) {
      onEditTreatmentPlan(updated);
    }
    setEditingItem(null);
  };

  // Bulk treatment modal / form state
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkProcedure, setBulkProcedure] = useState('Composite Tooth Restoration');
  const [bulkDiagnosis, setBulkDiagnosis] = useState('Enamel Cavity / Abrasion');
  const [bulkCostPerTooth, setBulkCostPerTooth] = useState(1200);
  const [bulkPriority, setBulkPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');

  const handleToggleMulti = (toothNum: number) => {
    setSelectedTeethMulti((prev) =>
      prev.includes(toothNum) ? prev.filter((t) => t !== toothNum) : [...prev, toothNum]
    );
  };

  const handleSaveSingleTooth = (updated: ToothData) => {
    const currentTeeth = Array.isArray(teeth) ? teeth : [];
    const exists = currentTeeth.some((t) => t.toothNumber === updated.toothNumber);
    const updatedTeeth = exists
      ? currentTeeth.map((t) => (t.toothNumber === updated.toothNumber ? updated : t))
      : [...currentTeeth, updated];
    onUpdateTeeth(updatedTeeth);
  };

  const handleApplyBulkTreatment = () => {
    if (selectedTeethMulti.length === 0) return;

    onAddTreatmentPlan({
      patientId,
      toothNumbers: selectedTeethMulti,
      procedure: bulkProcedure,
      diagnosis: bulkDiagnosis,
      priority: bulkPriority,
      estimatedCost: bulkCostPerTooth * selectedTeethMulti.length,
      status: 'Proposed',
      doctorName,
      createdAt: new Date().toISOString()
    });

    // Also update chart condition on selected teeth
    const code = bulkProcedure.toLowerCase().includes('root canal') ? 'R' :
                 bulkProcedure.toLowerCase().includes('crown') ? 'CR' :
                 bulkProcedure.toLowerCase().includes('implant') ? 'I' :
                 bulkProcedure.toLowerCase().includes('extraction') ? 'E' : 'F';

    onUpdateTeeth(
      teeth.map((t) => {
        if (selectedTeethMulti.includes(t.toothNumber)) {
          return {
            ...t,
            treatmentCode: code,
            treatmentStatus: 'Proposed'
          };
        }
        return t;
      })
    );

    setSelectedTeethMulti([]);
    setShowBulkModal(false);
    setIsMultiSelectMode(false);
  };

  const totalEstimatedCost = treatmentPlans.reduce((sum, item) => sum + (item.estimatedCost || 0), 0);
  const completedCost = treatmentPlans
    .filter((item) => item.status === 'Completed')
    .reduce((sum, item) => sum + (item.estimatedCost || 0), 0);

  const getStatusBadge = (status: TreatmentPlanStatus) => {
    switch (status) {
      case 'Completed':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-700 border border-emerald-300">Completed ✓</span>;
      case 'In Progress':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-sky-100 text-sky-700 border border-sky-300 animate-pulse">In Progress ⏳</span>;
      case 'Accepted':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-indigo-100 text-indigo-700 border border-indigo-300">Accepted</span>;
      case 'Scheduled':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-teal-100 text-teal-700 border border-teal-300">Scheduled 📅</span>;
      case 'Cancelled':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-rose-100 text-rose-700 border border-rose-300">Cancelled</span>;
      case 'Proposed':
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300">Proposed</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Metric Bar */}
      <div className="plan-metrics">
        <div className="clay-card-flat p-4 bg-white/80 rounded-2xl border border-slate-200">
          <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
            Total Planned Procedures
          </span>
          <span className="text-2xl font-black text-slate-800">{treatmentPlans.length}</span>
          <span className="text-[11px] font-semibold text-slate-500 block mt-0.5">
            Across {new Set(treatmentPlans.flatMap((t) => t.toothNumbers)).size} Teeth
          </span>
        </div>

        <div className="clay-card-flat p-4 bg-white/80 rounded-2xl border border-slate-200">
          <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
            Total Treatment Value
          </span>
          <span className="text-2xl font-black text-sky-700">₹{totalEstimatedCost.toLocaleString()}</span>
          <span className="text-[11px] font-semibold text-emerald-600 block mt-0.5">
            ₹{completedCost.toLocaleString()} Completed
          </span>
        </div>

        <div className="clay-card-flat p-4 bg-white/80 rounded-2xl border border-slate-200">
          <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
            Active / In-Progress
          </span>
          <span className="text-2xl font-black text-amber-600">
            {treatmentPlans.filter((t) => t.status === 'In Progress' || t.status === 'Accepted').length}
          </span>
          <span className="text-[11px] font-semibold text-slate-500 block mt-0.5">
            Ready for chair session
          </span>
        </div>

        <div className="clay-card-flat p-4 bg-white/80 rounded-2xl border border-slate-200 flex flex-col justify-between">
          <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
            Visual Tooth Chart
          </span>
          <button
            onClick={() => {
              setShowTeethSelector(!showTeethSelector);
              if (!showTeethSelector) setIsMultiSelectMode(true);
            }}
            className="w-full py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black transition-colors cursor-pointer"
          >
            {showTeethSelector ? 'Hide chart' : 'Open chart'}
          </button>
        </div>
      </div>

      {/* Optional Interactive Odontogram Chart (only when toggled) */}
      {showTeethSelector && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <DentalChart
            teeth={teeth}
            selectedToothNumber={selectedTooth}
            onSelectTooth={(num) => setSelectedTooth(num)}
            selectedToothNumbers={selectedTeethMulti}
            onToggleToothSelection={handleToggleMulti}
            isMultiSelectMode={isMultiSelectMode}
            onToggleMultiSelectMode={() => {
              setIsMultiSelectMode(!isMultiSelectMode);
              setSelectedTeethMulti([]);
            }}
          />
          <TreatmentLegend
            activeFilter={legendFilter}
            onSelectFilter={setLegendFilter}
          />
        </div>
      )}

      {/* Multi-Tooth Action Banner */}
      {isMultiSelectMode && selectedTeethMulti.length > 0 && (
        <div className="clinical-section-heading p-4 rounded-2xl bg-indigo-50 border border-indigo-200">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm">
              {selectedTeethMulti.length}
            </span>
            <div>
              <h5 className="text-xs font-black text-indigo-900">
                Selected Teeth: {selectedTeethMulti.sort((a,b)=>a-b).map(n => `#${n}`).join(', ')}
              </h5>
              <p className="text-[11px] text-indigo-700">
                You can apply bulk procedures, diagnoses, and lab orders to all selected teeth simultaneously.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedTeethMulti([])}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-indigo-100"
            >
              Clear
            </button>
            <ClayButton
              variant="primary"
              size="sm"
              onClick={() => setShowBulkModal(true)}
              icon={<Sparkles className="w-3.5 h-3.5" />}
            >
              Apply Bulk Treatment
            </ClayButton>
          </div>
        </div>
      )}

      {/* Treatment Plan Procedures Table / Cards */}
      <div className="clay-card p-5 bg-white/95 rounded-3xl border border-white/80 shadow-md">
        <div className="clinical-section-heading pb-3 mb-4 border-b border-slate-200">
          <div>
            <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">
              Planned procedures
            </h4>
            <span className="text-xs text-slate-500">
              Assigned Doctor: <strong>{doctorName}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onNavigateToBilling && treatmentPlans.length > 0 && (
              <ClayButton
                variant="secondary"
                size="sm"
                onClick={onNavigateToBilling}
                icon={<DollarSign className="w-4 h-4 text-emerald-600" />}
              >
                Bill treatments
              </ClayButton>
            )}
            <ClayButton
              variant="mint"
              size="sm"
              onClick={() => setSelectedTooth(teeth[0]?.toothNumber || 11)}
              icon={<Plus className="w-4 h-4" />}
            >
              Add Procedure
            </ClayButton>
          </div>
        </div>

        {treatmentPlans.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <Sparkles className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="text-xs font-bold">No planned treatments recorded yet.</p>
            <p className="text-[11px] text-slate-400 mt-1">
              Click any tooth on the odontogram above or click "+ Add Procedure" to plan restorative or endodontic treatments.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs responsive-records">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Tooth / Teeth</th>
                  <th className="py-2.5 px-3">Diagnosis</th>
                  <th className="py-2.5 px-3">Procedure & Prosthetic Specs</th>
                  <th className="py-2.5 px-3">Priority</th>
                  <th className="py-2.5 px-3">Est. Cost</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {treatmentPlans.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Tooth Badges */}
                    <td data-label="Tooth / Teeth" className="py-3 px-3">
                      <div className="flex flex-wrap gap-1">
                        {item.toothNumbers.map((num) => (
                          <span
                            key={num}
                            onClick={() => setSelectedTooth(num)}
                            className="px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 font-black font-mono text-[11px] cursor-pointer hover:bg-sky-200 transition-colors"
                            title="Click to view tooth details"
                          >
                            #{num}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Diagnosis */}
                    <td data-label="Diagnosis" className="py-3 px-3 font-medium text-slate-700 max-w-[200px]">
                      {item.diagnosis}
                    </td>

                    {/* Procedure */}
                    <td data-label="Procedure & Prosthetic Specs" className="py-3 px-3">
                      <span className="font-extrabold text-slate-900 block">{item.procedure}</span>
                      {item.prostheticDesign && (
                        <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md inline-block mt-0.5">
                          {item.prostheticDesign.material} ({item.prostheticDesign.shade}) • {item.prostheticDesign.ponticDesign || 'Standard'}
                        </span>
                      )}
                    </td>

                    {/* Priority */}
                    <td data-label="Priority" className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                          item.priority === 'High'
                            ? 'bg-rose-100 text-rose-700'
                            : item.priority === 'Medium'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {item.priority}
                      </span>
                    </td>

                    {/* Cost */}
                    <td data-label="Est. Cost" className="py-3 px-3 font-mono font-black text-slate-800">
                      ₹{item.estimatedCost.toLocaleString()}
                    </td>

                    {/* Status Dropdown */}
                    <td data-label="Status" className="py-3 px-3">
                      <select
                        value={item.status}
                        onChange={(e) => onUpdateTreatmentStatus(item.id, e.target.value as TreatmentPlanStatus)}
                        className="px-2 py-1 rounded-xl text-xs font-bold border border-slate-200 bg-white focus:ring-2 focus:ring-sky-500 cursor-pointer"
                      >
                        <option value="Proposed">Proposed</option>
                        <option value="Accepted">Accepted</option>
                        <option value="Scheduled">Scheduled</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>

                    {/* Action buttons */}
                    <td data-label="Actions" className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                          title="Edit treatment details & cost"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteTreatmentPlan(item.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete from plan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Tooth Detail Modal when a single tooth is clicked */}
      {selectedTooth && (
        <ToothDetailModal
          tooth={teeth.find((t) => t.toothNumber === selectedTooth) || {
            toothNumber: selectedTooth,
            type: selectedTooth >= 50 ? 'child' : 'adult',
            condition: 'Healthy',
            surfaces: {}
          }}
          isOpen={!!selectedTooth}
          onClose={() => setSelectedTooth(null)}
          onSaveTooth={(updated, newTreatment) => {
            handleSaveSingleTooth(updated);
            if (newTreatment && onAddTreatmentPlan) {
              onAddTreatmentPlan(newTreatment);
            }
          }}
          onAddTreatmentPlanItem={onAddTreatmentPlan}
          existingTreatments={treatmentPlans.filter((t) => t.toothNumbers.includes(selectedTooth))}
        />
      )}

      {/* Bulk Multi-Tooth Treatment Modal */}
      {showBulkModal && (
        <ModalLayer onDismiss={() => setShowBulkModal(false)} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="clay-card w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-white space-y-4">
            <h3 className="text-base font-black text-slate-800">
              Bulk Treatment for {selectedTeethMulti.length} Selected Teeth
            </h3>
            <p className="text-xs text-slate-500">
              Teeth: <strong>{selectedTeethMulti.sort((a,b)=>a-b).map(n => `#${n}`).join(', ')}</strong>
            </p>

            <div className="space-y-3 pt-2">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Procedure:</label>
                <select
                  value={bulkProcedure}
                  onChange={(e) => setBulkProcedure(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs font-bold border border-slate-300"
                >
                  <option value="Composite Tooth Restoration">Composite Tooth Restoration (Filling)</option>
                  <option value="Root Canal Therapy">Root Canal Therapy</option>
                  <option value="Zirconia Ceramic Crown">Zirconia Ceramic Crown</option>
                  <option value="Dental Extraction">Dental Extraction</option>
                  <option value="Ultrasonic Scaling & Root Planing">Ultrasonic Scaling & Root Planing</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Diagnosis:</label>
                <input
                  type="text"
                  value={bulkDiagnosis}
                  onChange={(e) => setBulkDiagnosis(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs border border-slate-300 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Cost Per Tooth (₹):</label>
                  <input
                    type="number"
                    value={bulkCostPerTooth}
                    onChange={(e) => setBulkCostPerTooth(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl text-xs border border-slate-300 font-semibold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Priority:</label>
                  <select
                    value={bulkPriority}
                    onChange={(e) => setBulkPriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl text-xs font-bold border border-slate-300"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-sky-50 rounded-xl text-xs font-bold text-sky-800 flex items-center justify-between">
                <span>Total Estimated Cost:</span>
                <span className="text-base font-black font-mono">
                  ₹{(bulkCostPerTooth * selectedTeethMulti.length).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                onClick={() => setShowBulkModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <ClayButton variant="primary" onClick={handleApplyBulkTreatment}>
                Apply to All {selectedTeethMulti.length} Teeth
              </ClayButton>
            </div>
          </div>
        </ModalLayer>
      )}

      {/* Edit Treatment Plan Modal */}
      {editingItem && (
        <ModalLayer onDismiss={() => setEditingItem(null)} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-800 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                  Doctor Clinical Edit
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">
                  Edit Planned Treatment Procedure
                </h3>
              </div>
              <button aria-label="Close dialog"
                onClick={() => setEditingItem(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedItem} className="space-y-3.5 text-xs">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Procedure Description *
                </label>
                <input
                  type="text"
                  required
                  value={editProcedure}
                  onChange={(e) => setEditProcedure(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs font-bold border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Clinical Diagnosis
                </label>
                <input
                  type="text"
                  value={editDiagnosis}
                  onChange={(e) => setEditDiagnosis(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs font-medium border border-slate-300 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Tooth / Teeth Numbers
                  </label>
                  <input
                    type="text"
                    value={editTeethStr}
                    onChange={(e) => setEditTeethStr(e.target.value)}
                    placeholder="e.g. 36, 37"
                    className="w-full px-3 py-2 rounded-xl text-xs font-mono font-bold border border-slate-300 bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Estimated Cost (₹) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editCost}
                    onChange={(e) => setEditCost(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl text-xs font-mono font-bold border border-slate-300 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Priority
                  </label>
                  <select
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl text-xs font-bold border border-slate-300 bg-white"
                  >
                    <option value="High">High Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="Low">Low Priority</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Treatment Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl text-xs font-bold border border-slate-300 bg-white"
                  >
                    <option value="Proposed">Proposed</option>
                    <option value="Accepted">Accepted</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <ClayButton variant="mint" type="submit" icon={<CheckCircle2 className="w-4 h-4" />}>
                  Save Changes
                </ClayButton>
              </div>
            </form>
          </div>
        </ModalLayer>
      )}
    </div>
  );
};
