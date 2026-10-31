import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { PatientRecord, ClinicVisit, PrescriptionRecord } from '../../types';
import { ClayButton } from '../common/ClayButton';
import { 
  X, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Stethoscope, 
  Printer, 
  Download, 
  FileText, 
  Eye, 
  Edit3 
} from 'lucide-react';
import { 
  ClinicPrescriptionSheet, 
  ClinicPrescriptionData, 
  printPrescriptionElement 
} from './ClinicPrescriptionSheet';

interface DoctorPrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient?: PatientRecord;
  visit?: ClinicVisit;
  visitId?: string;
  patientId?: string;
  patientName?: string;
  doctorName?: string;
  onPrescriptionCreated?: (prescription: PrescriptionRecord) => void;
}

const COMMON_DENTAL_MEDICATIONS = [
  { medicine: 'Amoxicillin + Clavulanate (Augmentin)', dosage: '625mg', route: 'Oral', frequency: 'BD', duration: '5 days', instructions: 'After food' },
  { medicine: 'Amoxicillin', dosage: '500mg', route: 'Oral', frequency: 'TDS', duration: '5 days', instructions: 'After food' },
  { medicine: 'Ibuprofen + Paracetamol (Combiflam)', dosage: '400mg/325mg', route: 'Oral', frequency: 'SOS / TDS', duration: '3 days', instructions: 'After food (with antacid)' },
  { medicine: 'Ketorolac Tromethamine (Ketorol-DT)', dosage: '10mg', route: 'Oral', frequency: 'SOS', duration: '3 days', instructions: 'Disperse in warm water' },
  { medicine: 'Metronidazole (Flagyl)', dosage: '400mg', route: 'Oral', frequency: 'TDS', duration: '5 days', instructions: 'After meals' },
  { medicine: 'Chlorhexidine Gluconate Mouthwash', dosage: '10ml', route: 'Topical rinse', frequency: 'BD', duration: '7 days', instructions: 'Swish for 60 seconds, no food for 30m' },
  { medicine: 'Pantoprazole (Pan-40)', dosage: '40mg', route: 'Oral', frequency: 'OD', duration: '5 days', instructions: 'Before breakfast' },
  { medicine: 'Triamcinolone Acetonide (Kenacort 0.1%)', dosage: 'Pea size', route: 'Topical application', frequency: 'TDS', duration: '5 days', instructions: 'Apply over ulcer after meals' }
];

export const DoctorPrescriptionModal: React.FC<DoctorPrescriptionModalProps> = ({
  isOpen,
  onClose,
  patient,
  visit,
  visitId,
  patientId,
  patientName,
  doctorName,
  onPrescriptionCreated
}) => {
  const { createPrescription, addToast, patients, visits } = useApp();
  const { currentUser } = useAuth();

  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');

  const targetPatientId = patient?.id || patientId;
  const targetVisitId = visit?.id || visitId;

  const resolvedPatient = patient || (targetPatientId ? patients.find((p) => p.id === targetPatientId) : undefined);
  const resolvedVisit =
    visit ||
    (targetVisitId ? visits.find((v) => v.id === targetVisitId) : undefined) ||
    (targetPatientId ? visits.find((v) => v.patientId === targetPatientId && v.status !== 'Cancelled') : undefined);

  const [diagnosis, setDiagnosis] = useState<string>(
    resolvedVisit?.diagnosis || resolvedPatient?.currentTreatment || ''
  );
  const [doctorNotes, setDoctorNotes] = useState<string>('');
  const [followUpDate, setFollowUpDate] = useState<string>(resolvedVisit?.followUpDate || '');

  useEffect(() => {
    if (resolvedVisit?.diagnosis) {
      setDiagnosis(resolvedVisit.diagnosis);
    } else if (resolvedPatient?.currentTreatment) {
      setDiagnosis(resolvedPatient.currentTreatment);
    }
    if (resolvedVisit?.followUpDate) {
      setFollowUpDate(resolvedVisit.followUpDate);
    }
  }, [resolvedVisit?.id, resolvedVisit?.diagnosis, resolvedPatient?.currentTreatment, resolvedVisit?.followUpDate]);

  const [items, setItems] = useState<Array<{
    id: string;
    medicine: string;
    dosage: string;
    route: string;
    frequency: string;
    duration: string;
    instructions: string;
  }>>([
    {
      id: 'rx-1',
      medicine: 'Amoxicillin + Clavulanate (Augmentin)',
      dosage: '625mg',
      route: 'Oral',
      frequency: 'BD (Twice daily)',
      duration: '5 days',
      instructions: 'After food'
    },
    {
      id: 'rx-2',
      medicine: 'Ibuprofen + Paracetamol (Combiflam)',
      dosage: '400mg/325mg',
      route: 'Oral',
      frequency: 'SOS (For severe pain)',
      duration: '3 days',
      instructions: 'After food'
    }
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `rx-${Date.now()}`,
        medicine: '',
        dosage: '500mg',
        route: 'Oral',
        frequency: 'BD',
        duration: '5 days',
        instructions: 'After food'
      }
    ]);
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const handleItemChange = (id: string, field: string, val: string) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, [field]: val } : it))
    );
  };

  const handleAddPreset = (preset: typeof COMMON_DENTAL_MEDICATIONS[0]) => {
    setItems((prev) => [
      ...prev,
      {
        id: `rx-${Date.now()}`,
        ...preset
      }
    ]);
    addToast('Medicine Added', `Added ${preset.medicine} to prescription.`, 'info');
  };

  // Compile full prescription data for Shriya clinic pad
  const todayFormatted = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  const sheetData: ClinicPrescriptionData = {
    date: todayFormatted,
    patientName: resolvedPatient?.name || patientName || 'Patient',
    patientOpNumber: resolvedPatient?.opNumber || resolvedPatient?.id || targetPatientId || '',
    patientAge: resolvedPatient?.age,
    patientGender: resolvedPatient?.gender,
    patientPhone: resolvedPatient?.phone,
    doctorName: resolvedVisit?.doctorName || resolvedPatient?.assignedDoctorName || doctorName || currentUser.name || 'Dr. EBIN BRITTO. M.',
    doctorDegree: 'BDS',
    doctorRegNo: '26719/KDC',
    diagnosis: diagnosis.trim() || undefined,
    medicalHistoryConditions: resolvedPatient?.medicalHistory?.conditions || [],
    medicalHistoryNotes: resolvedPatient?.medicalHistory?.otherNotes,
    allergies: resolvedPatient?.medicalHistory?.allergies || resolvedPatient?.allergies || [],
    currentMedications: resolvedPatient?.medicalHistory?.currentMedications || [],
    items: items.filter((it) => it.medicine.trim()),
    doctorNotes: doctorNotes.trim() || undefined,
    followUpDate: followUpDate || undefined
  };

  const handlePrintOnly = () => {
    if (items.length === 0 || !items.some((it) => it.medicine.trim())) {
      addToast('Validation', 'Please enter at least one medication to print.', 'warning');
      return;
    }
    printPrescriptionElement('doctor-modal-prescription-sheet', sheetData.patientName, sheetData.patientOpNumber);
    addToast('Print Ready 🖨️', 'Opening print preview on Shriya Clinic letterhead.', 'info');
  };

  const handleDownloadPdf = () => {
    if (items.length === 0 || !items.some((it) => it.medicine.trim())) {
      addToast('Validation', 'Please enter at least one medication to download.', 'warning');
      return;
    }
    printPrescriptionElement('doctor-modal-prescription-sheet', sheetData.patientName, sheetData.patientOpNumber);
    addToast('PDF Download 📥', 'In the print dialog, select "Save as PDF" to download the official prescription.', 'success');
  };

  const handleSubmit = async (e?: React.FormEvent, shouldPrintAfter = false) => {
    if (e) e.preventDefault();
    if (items.length === 0 || items.some((it) => !it.medicine.trim())) {
      addToast('Validation Error', 'Please specify a medicine name for each prescription row.', 'danger');
      return;
    }

    setIsSubmitting(true);
    const finalPatientId = resolvedPatient?.id || targetPatientId;
    const finalVisitId =
      resolvedVisit?.id ||
      targetVisitId ||
      (finalPatientId ? `vis-${finalPatientId}-${new Date().toISOString().split('T')[0]}` : undefined);

    if (!finalPatientId) {
      addToast('Error', 'Missing patient record for prescription.', 'danger');
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await createPrescription({
        visitId: finalVisitId || `vis-${finalPatientId}-${new Date().toISOString().split('T')[0]}`,
        patientId: finalPatientId,
        items: items.filter((it) => it.medicine.trim()),
        diagnosis,
        doctorNotes,
        followUpDate: followUpDate || undefined
      });

      if (shouldPrintAfter) {
        printPrescriptionElement('doctor-modal-prescription-sheet', sheetData.patientName, sheetData.patientOpNumber);
      }

      if (onPrescriptionCreated) {
        onPrescriptionCreated(result.prescription);
      }
      onClose();
      addToast('Prescription Saved ℞', `Official prescription recorded for ${resolvedPatient?.name || 'patient'}.`, 'success');
    } catch (err: any) {
      addToast('Error', err.message || 'Failed to create prescription.', 'danger');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-3xl p-5 sm:p-7 shadow-2xl border border-slate-200 max-h-[94vh] overflow-y-auto space-y-4">
        
        {/* ========================================================= */}
        {/* MODAL HEADER & TOOLBAR                                    */}
        {/* ========================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-900 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                SHRIYA MULTISPECIALITY DENTAL CLINIC
              </span>
              <span className="text-xs font-bold text-slate-500">
                Attending: <strong className="text-slate-800">{sheetData.doctorName}</strong>
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-1 flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-blue-900 shrink-0" />
              <span>Digital Clinical Prescription (℞)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Patient: <strong className="text-slate-900">{resolvedPatient?.name || patientName || 'Patient'}</strong>{' '}
              ({resolvedPatient?.opNumber || resolvedPatient?.id || targetPatientId || 'N/A'}) • Age: {resolvedPatient?.age}y ({resolvedPatient?.gender})
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            {/* View Mode Toggle: Form vs Real Pad Preview */}
            <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode('edit')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'edit'
                    ? 'bg-white text-blue-900 shadow-2xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Form</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('preview')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'preview'
                    ? 'bg-blue-900 text-white shadow-xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Clinic Pad Preview</span>
              </button>
            </div>

            {/* Quick Header Print & PDF Buttons */}
            <button
              type="button"
              onClick={handlePrintOnly}
              className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-950 border border-blue-200 text-xs font-bold transition-colors cursor-pointer shadow-2xs flex items-center gap-1"
              title="Print Prescription (Official Shriya Header)"
            >
              <Printer className="w-4 h-4 text-blue-900" />
              <span className="hidden md:inline">Print</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPdf}
              className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border border-emerald-200 text-xs font-bold transition-colors cursor-pointer shadow-2xs flex items-center gap-1"
              title="Download as PDF file"
            >
              <Download className="w-4 h-4 text-emerald-800" />
              <span className="hidden md:inline">PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Allergy Alert Warning Banner */}
        {resolvedPatient?.medicalHistory?.allergies && resolvedPatient.medicalHistory.allergies.length > 0 && (
          <div className="p-3 bg-rose-50 rounded-xl border-2 border-rose-300 flex items-center justify-between text-xs text-rose-950 animate-in fade-in">
            <span className="font-extrabold flex items-center gap-1.5">
              ⚠️ Allergy Warning: Patient has documented allergy to:{' '}
              <span className="bg-rose-200/80 px-2 py-0.5 rounded font-black text-rose-900">
                {resolvedPatient.medicalHistory.allergies.join(', ')}
              </span>
            </span>
            <span className="text-[11px] font-bold text-rose-700 bg-white/80 px-2 py-0.5 rounded border border-rose-200">
              Check cross-reactivity
            </span>
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 1: COMPOSE / EDIT PRESCRIPTION FORM                  */}
        {/* ========================================================= */}
        {viewMode === 'edit' && (
          <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-4 text-xs">
            {/* Fast Medicine Presets */}
            <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-1.5">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                ⚡ Quick Dental Presets (Click to add to Rx):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_DENTAL_MEDICATIONS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAddPreset(preset)}
                    className="px-2.5 py-1 rounded-lg bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-[11px] font-semibold text-slate-700 transition-colors cursor-pointer shadow-2xs"
                  >
                    + {preset.medicine.split(' ')[0]} ({preset.dosage})
                  </button>
                ))}
              </div>
            </div>

            {/* Diagnosis & Indication */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Clinical Diagnosis / Indication *</label>
                <input
                  type="text"
                  required
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="e.g. Acute Irreversible Pulpitis (#36), Periapical Abscess"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold bg-white text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Recommended Next Review Date</label>
                <input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-semibold text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Prescription Medicine Items */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-slate-800 uppercase tracking-wider text-[11px]">
                  Medications to Prescribe ({items.length})
                </span>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 font-bold text-xs hover:bg-emerald-100 flex items-center gap-1.5 border border-emerald-300 cursor-pointer shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Medicine</span>
                </button>
              </div>

              <div className="space-y-2">
                {items.map((item, idx) => (
                  <div key={item.id} className="p-3 bg-white rounded-xl border border-slate-200 space-y-2 shadow-2xs">
                    <div className="flex items-center gap-2">
                      <span className="w-5 text-slate-400 font-mono font-bold text-center text-xs">{idx + 1}.</span>
                      <div className="flex-1">
                        <input
                          type="text"
                          required
                          value={item.medicine}
                          onChange={(e) => handleItemChange(item.id, 'medicine', e.target.value)}
                          placeholder="Medicine Name (e.g. Amoxicillin + Clavulanate)"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-bold text-xs"
                        />
                      </div>
                      <div className="w-28">
                        <input
                          type="text"
                          value={item.dosage}
                          onChange={(e) => handleItemChange(item.id, 'dosage', e.target.value)}
                          placeholder="Dosage (625mg)"
                          className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold"
                        />
                      </div>
                      <div className="w-28">
                        <select
                          value={item.route}
                          onChange={(e) => handleItemChange(item.id, 'route', e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold bg-white"
                        >
                          <option value="Oral">Oral</option>
                          <option value="Topical rinse">Topical rinse</option>
                          <option value="Topical application">Topical paste</option>
                          <option value="Sublingual">Sublingual</option>
                        </select>
                      </div>
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pl-7">
                      <div>
                        <select
                          value={item.frequency}
                          onChange={(e) => handleItemChange(item.id, 'frequency', e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold bg-white"
                        >
                          <option value="OD">OD (Once daily)</option>
                          <option value="BD">BD (Twice daily)</option>
                          <option value="TDS">TDS (Thrice daily)</option>
                          <option value="QID">QID (Four times daily)</option>
                          <option value="SOS">SOS (When needed for pain)</option>
                          <option value="Stat">Stat (Single immediate dose)</option>
                        </select>
                      </div>
                      <div>
                        <select
                          value={item.duration}
                          onChange={(e) => handleItemChange(item.id, 'duration', e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold bg-white"
                        >
                          <option value="3 days">3 days</option>
                          <option value="5 days">5 days</option>
                          <option value="7 days">7 days</option>
                          <option value="10 days">10 days</option>
                          <option value="14 days">14 days</option>
                        </select>
                      </div>
                      <div>
                        <input
                          type="text"
                          value={item.instructions}
                          onChange={(e) => handleItemChange(item.id, 'instructions', e.target.value)}
                          placeholder="Instructions (e.g. After food)"
                          className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-xs font-medium"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Doctor Observations & Special Advice */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">Doctor Advice / Post-Op Precautions</label>
              <textarea
                rows={2}
                value={doctorNotes}
                onChange={(e) => setDoctorNotes(e.target.value)}
                placeholder="e.g. Take medicines strictly after meals. In case of gastric irritation, take with antacid. Maintain soft diet for 48 hours."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium text-xs"
              />
            </div>

            {/* Bottom Actions Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 font-bold cursor-pointer text-xs"
              >
                Cancel
              </button>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handlePrintOnly}
                  className="px-3.5 py-2 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm transition-transform active:scale-95"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Prescription 🖨️</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm transition-transform active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF 📥</span>
                </button>

                <ClayButton
                  variant="mint"
                  type="submit"
                  disabled={isSubmitting}
                  icon={<CheckCircle2 className="w-4 h-4" />}
                >
                  {isSubmitting ? 'Saving Prescription...' : 'Save & Issue Rx'}
                </ClayButton>
              </div>
            </div>
          </form>
        )}

        {/* ========================================================= */}
        {/* VIEW 2: EXACT SHRIYA CLINIC PAD LIVE PREVIEW              */}
        {/* ========================================================= */}
        {viewMode === 'preview' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50/60 rounded-xl border border-blue-200 text-xs">
              <div className="flex items-center gap-2 text-blue-900 font-bold">
                <FileText className="w-4 h-4" />
                <span>Exact Replica of Shriya Multispeciality Dental Clinic Prescription Pad</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrintOnly}
                  className="px-3 py-1.5 rounded-lg bg-blue-900 text-white font-bold text-xs flex items-center gap-1 cursor-pointer shadow-xs hover:bg-blue-950"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Pad</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  className="px-3 py-1.5 rounded-lg bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer shadow-xs hover:bg-emerald-800"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>

            <div className="bg-slate-100 p-3 sm:p-4 rounded-2xl border border-slate-300 overflow-x-auto">
              <ClinicPrescriptionSheet 
                data={sheetData} 
                id="doctor-modal-prescription-sheet" 
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode('edit')}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>← Back to Edit Form</span>
              </button>

              <ClayButton
                variant="mint"
                type="button"
                disabled={isSubmitting}
                onClick={(e) => handleSubmit(e, false)}
                icon={<CheckCircle2 className="w-4 h-4" />}
              >
                {isSubmitting ? 'Saving Prescription...' : 'Save & Issue Rx'}
              </ClayButton>
            </div>
          </div>
        )}

        {/* Offscreen Container for Instant Printing from Edit Mode */}
        {viewMode === 'edit' && (
          <div style={{ position: 'absolute', left: '-9999px', top: '-9999px', width: '800px', pointerEvents: 'none' }}>
            <ClinicPrescriptionSheet 
              data={sheetData} 
              id="doctor-modal-prescription-sheet" 
            />
          </div>
        )}

      </div>
    </div>
  );
};
