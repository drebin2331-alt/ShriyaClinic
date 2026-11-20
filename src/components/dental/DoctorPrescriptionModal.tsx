import { ModalLayer } from '../common/ModalLayer';
import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { PatientRecord, ClinicVisit, PrescriptionRecord, MedicineRecord } from '../../types';
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
  Edit3,
  Database,
  ChevronDown,
  Sparkles,
  History,
  AlertTriangle,
  RotateCcw
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
  prescriptionToEdit?: PrescriptionRecord | null;
  onPrescriptionCreated?: (prescription: PrescriptionRecord) => void;
  onDeletePrescription?: (id: string) => void;
}

export const DoctorPrescriptionModal: React.FC<DoctorPrescriptionModalProps> = ({
  isOpen,
  onClose,
  patient,
  visit,
  visitId,
  patientId,
  patientName,
  doctorName,
  prescriptionToEdit,
  onPrescriptionCreated,
  onDeletePrescription
}) => {
  const { 
    createPrescription, 
    updatePrescription, 
    deletePrescription, 
    addToast, 
    patients, 
    visits, 
    medicines, 
    saveMedicine,
    prescriptions 
  } = useApp();
  const { currentUser } = useAuth();

  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
  const [activeDropdownRowId, setActiveDropdownRowId] = useState<string | null>(null);
  const [showHistoryDropdown, setShowHistoryDropdown] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingRxId, setEditingRxId] = useState<string | null>(null);

  const targetPatientId = patient?.id || patientId;
  const targetVisitId = visit?.id || visitId;

  const resolvedPatient = patient || (targetPatientId ? patients.find((p) => p.id === targetPatientId) : undefined);
  const resolvedVisit =
    visit ||
    (targetVisitId ? visits.find((v) => v.id === targetVisitId) : undefined) ||
    (targetPatientId ? visits.find((v) => v.patientId === targetPatientId && v.status !== 'Cancelled') : undefined);

  // All previous prescriptions for this patient
  const patientPrescriptions = React.useMemo(() => {
    const list = (prescriptions || []).filter(
      (p) =>
        p.patientId === resolvedPatient?.id ||
        (resolvedPatient?.opNumber && p.patientOpNumber === resolvedPatient.opNumber) ||
        (resolvedPatient?.name && p.patientName === resolvedPatient.name)
    );
    if (resolvedPatient?.prescriptions) {
      resolvedPatient.prescriptions.forEach((rx) => {
        if (!list.some((existing) => existing.id === rx.id)) {
          list.push(rx);
        }
      });
    }
    return list.sort((a, b) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime());
  }, [prescriptions, resolvedPatient]);

  const [diagnosis, setDiagnosis] = useState<string>('');
  const [doctorNotes, setDoctorNotes] = useState<string>('');
  const [followUpDate, setFollowUpDate] = useState<string>('');
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
      id: `rx-${Date.now()}`,
      medicine: '',
      dosage: '',
      route: 'Oral',
      frequency: 'BD',
      duration: '5 days',
      instructions: 'After food'
    }
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const applyPrescription = (rx: PrescriptionRecord, isEditMode = true) => {
    setEditingRxId(isEditMode ? rx.id : null);
    setDiagnosis(rx.diagnosis || resolvedVisit?.diagnosis || resolvedPatient?.currentTreatment || '');
    setDoctorNotes(rx.doctorNotes || '');
    setFollowUpDate(rx.followUpDate || resolvedVisit?.followUpDate || '');
    if (rx.items && rx.items.length > 0) {
      setItems(
        rx.items.map((it, idx) => ({
          id: it.id || `rx-item-${Date.now()}-${idx}`,
          medicine: it.medicine || '',
          dosage: it.dosage || '',
          route: it.route || 'Oral',
          frequency: it.frequency || 'BD',
          duration: it.duration || '5 days',
          instructions: it.instructions || 'After food'
        }))
      );
    }
  };

  // Populate state when opening modal or changing prescriptionToEdit
  useEffect(() => {
    if (!isOpen) return;

    // 1. Explicit prescription to edit passed as prop
    if (prescriptionToEdit) {
      applyPrescription(prescriptionToEdit, true);
      return;
    }

    // 2. Check if the active visit already has a prescription recorded
    const existingVisitRx = 
      resolvedVisit?.prescriptionRecord || 
      patientPrescriptions.find((p) => p.visitId === resolvedVisit?.id);

    if (existingVisitRx) {
      applyPrescription(existingVisitRx, true);
      return;
    }

    // 3. If patient has any saved previous prescriptions, auto-load the latest one so doctor sees it immediately!
    if (patientPrescriptions && patientPrescriptions.length > 0) {
      applyPrescription(patientPrescriptions[0], true);
      return;
    }

    // 4. Brand new prescription initialization (when no previous prescription exists)
    setEditingRxId(null);
    setDiagnosis(resolvedVisit?.diagnosis || resolvedPatient?.currentTreatment || '');
    setDoctorNotes('');
    setFollowUpDate(resolvedVisit?.followUpDate || '');
    setItems([
      {
        id: `rx-${Date.now()}`,
        medicine: '',
        dosage: '',
        route: 'Oral',
        frequency: 'BD',
        duration: '5 days',
        instructions: 'After food'
      }
    ]);
  }, [isOpen, prescriptionToEdit, resolvedVisit?.id, patientPrescriptions.length]);

  const loadPreviousPrescription = (rx: PrescriptionRecord, asCopy = false) => {
    if (!asCopy) {
      setEditingRxId(rx.id);
    } else {
      setEditingRxId(null);
    }
    setDiagnosis(rx.diagnosis || '');
    setDoctorNotes(rx.doctorNotes || '');
    setFollowUpDate(rx.followUpDate || '');
    if (rx.items && rx.items.length > 0) {
      setItems(
        rx.items.map((it, idx) => ({
          id: asCopy ? `rx-copy-${Date.now()}-${idx}` : (it.id || `rx-item-${Date.now()}-${idx}`),
          medicine: it.medicine || '',
          dosage: it.dosage || '',
          route: it.route || 'Oral',
          frequency: it.frequency || 'BD',
          duration: it.duration || '5 days',
          instructions: it.instructions || 'After food'
        }))
      );
    }
    setShowHistoryDropdown(false);
    addToast(
      asCopy ? 'Copied to New Rx 📋' : 'Loaded Prescription ℞',
      asCopy ? `Medicines from ${rx.id} copied into fresh prescription.` : `Editing saved prescription ${rx.id}.`,
      'info'
    );
  };

  const handleStartFresh = () => {
    setEditingRxId(null);
    setDiagnosis(resolvedVisit?.diagnosis || resolvedPatient?.currentTreatment || '');
    setDoctorNotes('');
    setFollowUpDate(resolvedVisit?.followUpDate || '');
    setItems([
      {
        id: `rx-${Date.now()}`,
        medicine: '',
        dosage: '',
        route: 'Oral',
        frequency: 'BD',
        duration: '5 days',
        instructions: 'After food'
      }
    ]);
    addToast('New Prescription', 'Form reset for a brand new prescription.', 'info');
  };

  const handleDelete = async () => {
    if (!editingRxId) return;
    try {
      setIsSubmitting(true);
      if (onDeletePrescription) {
        onDeletePrescription(editingRxId);
      } else {
        await deletePrescription(editingRxId);
      }
      setShowDeleteConfirm(false);
      onClose();
    } catch (err: any) {
      addToast('Delete Failed', err.message || 'Could not delete prescription', 'danger');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFilteredMedicines = (searchQuery: string) => {
    const list = medicines || [];
    if (!searchQuery || !searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase().trim();
    return list.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        (m.dosage && m.dosage.toLowerCase().includes(q)) ||
        (m.category && m.category.toLowerCase().includes(q))
    );
  };

  const handleSelectMedicine = (itemId: string, selectedMed: MedicineRecord) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== itemId) return it;
        return {
          ...it,
          medicine: selectedMed.name,
          dosage: selectedMed.dosage || it.dosage || '500mg',
          route: selectedMed.route || it.route || 'Oral',
          frequency: selectedMed.frequency || it.frequency || 'BD',
          duration: selectedMed.duration || it.duration || '5 days',
          instructions: selectedMed.instructions || it.instructions || 'After food'
        };
      })
    );
    setActiveDropdownRowId(null);
  };

  const handleSaveToCatalog = async (item: typeof items[0]) => {
    if (!item.medicine.trim()) return;
    try {
      await saveMedicine({
        name: item.medicine.trim(),
        dosage: item.dosage.trim(),
        route: item.route,
        frequency: item.frequency,
        duration: item.duration,
        instructions: item.instructions
      });
      addToast('Medicine Saved to DB 💾', `"${item.medicine.trim()}" added to clinic database. It is now saved for future prescriptions.`, 'success');
    } catch (err: any) {
      addToast('Error', err.message || 'Failed to save medicine.', 'danger');
    }
  };

  if (!isOpen) return null;

  const handleAddItem = () => {
    const newId = `rx-${Date.now()}`;
    setItems((prev) => [
      ...prev,
      {
        id: newId,
        medicine: '',
        dosage: '',
        route: 'Oral',
        frequency: 'BD',
        duration: '5 days',
        instructions: 'After food'
      }
    ]);
    setActiveDropdownRowId(newId);
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
    if (activeDropdownRowId === id) setActiveDropdownRowId(null);
  };

  const handleItemChange = (id: string, field: string, val: string) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, [field]: val } : it))
    );
  };

  // Compile full prescription data for Shriya clinic pad
  const todayFormatted = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  const sheetData: ClinicPrescriptionData = {
    id: editingRxId || undefined,
    date: todayFormatted,
    patientName: resolvedPatient?.name || patientName || 'Patient',
    patientOpNumber: resolvedPatient?.opNumber || resolvedPatient?.id || targetPatientId || '',
    patientAge: resolvedPatient?.age,
    patientGender: resolvedPatient?.gender,
    patientPhone: resolvedPatient?.phone,
    doctorName: resolvedVisit?.doctorName || resolvedPatient?.assignedDoctorName || doctorName || currentUser?.name || 'Dr. EBIN BRITTO. M.',
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
      // Auto-save any newly typed custom medicines to the database catalog
      for (const item of items) {
        if (item.medicine.trim()) {
          const exists = (medicines || []).some(
            (m) => m.name.toLowerCase().trim() === item.medicine.toLowerCase().trim()
          );
          if (!exists) {
            saveMedicine({
              name: item.medicine.trim(),
              dosage: item.dosage.trim(),
              route: item.route,
              frequency: item.frequency,
              duration: item.duration,
              instructions: item.instructions
            }).catch(() => {});
          }
        }
      }

      let prescriptionResult: PrescriptionRecord;

      if (editingRxId) {
        // UPDATE EXISTING PRESCRIPTION
        const result = await updatePrescription(editingRxId, {
          items: items.filter((it) => it.medicine.trim()),
          diagnosis,
          doctorNotes,
          followUpDate: followUpDate || undefined
        });
        prescriptionResult = result.prescription;
      } else {
        // CREATE NEW PRESCRIPTION
        const result = await createPrescription({
          visitId: finalVisitId || `vis-${finalPatientId}-${new Date().toISOString().split('T')[0]}`,
          patientId: finalPatientId,
          items: items.filter((it) => it.medicine.trim()),
          diagnosis,
          doctorNotes,
          followUpDate: followUpDate || undefined
        });
        prescriptionResult = result.prescription;
      }

      if (shouldPrintAfter) {
        printPrescriptionElement('doctor-modal-prescription-sheet', sheetData.patientName, sheetData.patientOpNumber);
      }

      if (onPrescriptionCreated) {
        onPrescriptionCreated(prescriptionResult);
      }
      onClose();
    } catch (err: any) {
      addToast('Error', err.message || 'Failed to save prescription.', 'danger');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalLayer onDismiss={onClose} className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-3xl p-3.5 sm:p-7 shadow-2xl border border-slate-200 max-h-[96vh] overflow-y-auto space-y-4">
        
        {/* ========================================================= */}
        {/* MODAL HEADER & TOOLBAR                                    */}
        {/* ========================================================= */}
        <div className="rx-editor-heading">
          <div>
            <h3>{editingRxId ? 'Edit prescription' : 'Write prescription'}</h3>
            <p><strong>{resolvedPatient?.name || patientName || 'Patient'}</strong> · {resolvedPatient?.opNumber || resolvedPatient?.id || targetPatientId || 'N/A'}</p>
            <p>{[resolvedPatient?.age != null && resolvedPatient.age + 'y', resolvedPatient?.gender, sheetData.doctorName].filter(Boolean).join(' · ')}</p>
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
                <span>Edit</span>
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
                <span>Preview</span>
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

            <button aria-label="Close dialog"
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* PREVIOUS SAVED PRESCRIPTIONS HISTORY SELECTOR             */}
        {/* ========================================================= */}
        {patientPrescriptions.length > 0 && (
          <div className="relative">
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-2 flex-wrap">
              <div className="flex flex-wrap items-center gap-2">
                <span className="p-1 rounded-lg bg-teal-50 text-teal-700">
                  <History className="w-4 h-4" />
                </span>
                <span className="text-xs font-bold text-slate-700">
                  Prescriptions ({patientPrescriptions.length})
                </span>
                {editingRxId ? (
                  <span className="text-xs font-extrabold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    Active: {editingRxId}
                  </span>
                ) : (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Writing New Prescription
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowHistoryDropdown(!showHistoryDropdown)}
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 flex items-center gap-1 cursor-pointer shadow-2xs"
                >
                  <span>Saved Rx</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showHistoryDropdown ? 'rotate-180' : ''}`} />
                </button>

                {editingRxId && (
                  <button
                    type="button"
                    onClick={handleStartFresh}
                    className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 font-bold text-xs hover:bg-blue-100 flex items-center gap-1 cursor-pointer"
                    title="Clear and write a separate new prescription"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New Rx</span>
                  </button>
                )}
              </div>
            </div>

            {/* Dropdown Menu of Patient's Prescriptions */}
            {showHistoryDropdown && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-2xl shadow-xl border border-slate-300 z-50 p-2 max-h-72 overflow-y-auto space-y-1.5 animate-in fade-in">
                <div className="px-2.5 py-1 font-extrabold text-[11px] text-slate-500 uppercase tracking-wider flex items-center justify-between border-b border-slate-100 pb-1.5">
                  <span>Saved Prescriptions for {resolvedPatient?.name}</span>
                  <button
                    type="button"
                    onClick={() => setShowHistoryDropdown(false)}
                    className="text-slate-400 hover:text-slate-700 text-xs font-black cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
                {patientPrescriptions.map((rx) => {
                  const isCurrent = editingRxId === rx.id;
                  return (
                    <div
                      key={rx.id}
                      className={`p-2.5 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-colors ${
                        isCurrent
                          ? 'bg-blue-50/70 border-blue-300 font-bold'
                          : 'bg-white hover:bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-extrabold text-blue-900">{rx.id}</span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-600 font-medium">{rx.date}</span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-700 font-semibold">{rx.doctorName}</span>
                          {isCurrent && (
                            <span className="bg-blue-200/80 text-blue-900 text-[10px] font-black px-1.5 py-0.2 rounded">
                              CURRENTLY EDITING
                            </span>
                          )}
                        </div>
                        <p className="text-slate-600 font-medium text-[11px] mt-0.5">
                          <strong>Diagnosis:</strong> {rx.diagnosis || 'General Consultation'} •{' '}
                          <strong>Meds ({rx.items?.length || 0}):</strong>{' '}
                          {rx.items?.map((m) => m.medicine).filter(Boolean).join(', ') || 'None'}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => loadPreviousPrescription(rx, false)}
                          className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 font-bold text-xs flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3 text-teal-700" />
                          <span>Load / Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => loadPreviousPrescription(rx, true)}
                          className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1 cursor-pointer"
                          title="Copy these medicines into a new prescription"
                        >
                          <RotateCcw className="w-3 h-3 text-slate-500" />
                          <span>Repeat Meds</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Allergy Alert Warning Banner */}
        {resolvedPatient?.medicalHistory?.allergies && resolvedPatient.medicalHistory.allergies.length > 0 && (
          <div className="p-3 bg-rose-50 rounded-xl border-2 border-rose-300 flex flex-col sm:flex-row items-start sm:items-center gap-2 justify-between text-xs text-rose-950 animate-in fade-in">
            <span className="font-extrabold flex flex-wrap items-center gap-1.5">
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

        {/* Delete Confirmation Box */}
        {showDeleteConfirm && (
          <div className="p-4 bg-rose-50 border-2 border-rose-400 rounded-2xl space-y-3 animate-in fade-in">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-rose-100 text-rose-700 rounded-xl">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h4 className="font-black text-rose-950 text-sm">
                  Delete Prescription #{editingRxId}?
                </h4>
                <p className="text-xs text-rose-800 font-medium mt-0.5">
                  This will permanently delete this prescription record from the patient profile, visit history, and audit ledger. This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-rose-200">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-1.5 rounded-lg bg-white border border-rose-200 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Cancel Keep Rx
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleDelete}
                className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Deleting...' : 'Confirm Delete Prescription'}</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 1: COMPOSE / EDIT PRESCRIPTION FORM                  */}
        {/* ========================================================= */}
        {viewMode === 'edit' && (
          <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-4 text-xs relative">
            {/* Backdrop for closing active dropdown on outside click */}
            {activeDropdownRowId && (
              <div 
                className="fixed inset-0 z-30 cursor-default" 
                onClick={() => setActiveDropdownRowId(null)} 
              />
            )}

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
              <div className="clinical-section-heading">
                <h4>Medications ({items.length})</h4>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 font-bold text-xs hover:bg-emerald-100 flex items-center gap-1.5 border border-emerald-300 cursor-pointer shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add medicine</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {items.map((item, idx) => (
                  <div key={item.id} className="p-3 bg-white rounded-xl border border-slate-200 space-y-2.5 shadow-2xs relative">
                    
                    {/* Top Row: Index + Medicine Input + Delete Button (Mobile & Desktop) */}
                    <div className="flex items-center gap-2">
                      <span className="w-5 text-slate-400 font-mono font-bold text-center text-xs shrink-0">{idx + 1}.</span>
                      
                      {/* Searchable Database Medicine Dropdown Input */}
                      <div className="flex-1 relative">
                        <div className="relative flex items-center">
                          <input
                            type="text"
                            required
                            value={item.medicine}
                            onFocus={() => setActiveDropdownRowId(item.id)}
                            onChange={(e) => {
                              handleItemChange(item.id, 'medicine', e.target.value);
                              setActiveDropdownRowId(item.id);
                            }}
                            placeholder="Select from database or type medicine name..."
                            className="w-full px-2.5 py-2 sm:py-1.5 pr-8 rounded-lg border border-slate-300 font-bold text-xs focus:ring-2 focus:border-blue-500 bg-white"
                          />
                          <button
                            type="button"
                            onClick={() => setActiveDropdownRowId(activeDropdownRowId === item.id ? null : item.id)}
                            className="absolute right-2 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer p-1"
                            title="Toggle medicine database dropdown"
                          >
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdownRowId === item.id ? 'rotate-180 text-blue-600' : ''}`} />
                          </button>
                        </div>

                        {/* Interactive Dropdown Menu from Database */}
                        {activeDropdownRowId === item.id && (
                          <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl shadow-2xl border border-slate-300 z-40 max-h-56 overflow-y-auto p-1.5 animate-in fade-in zoom-in-95 duration-100">
                            <div className="flex items-center justify-between px-2.5 py-1 bg-slate-50 rounded-lg text-[10px] font-extrabold text-slate-600 uppercase tracking-wider mb-1 border border-slate-100">
                              <span className="flex items-center gap-1.5">
                                <Database className="w-3 h-3 text-blue-600" />
                                <span>Clinic Database Medicines ({getFilteredMedicines(item.medicine).length})</span>
                              </span>
                              <button
                                type="button"
                                onClick={() => setActiveDropdownRowId(null)}
                                className="text-slate-400 hover:text-slate-700 font-black cursor-pointer text-xs"
                              >
                                ✕
                              </button>
                            </div>

                            <div className="space-y-0.5">
                              {getFilteredMedicines(item.medicine).map((med) => (
                                <button
                                  key={med.id || med.name}
                                  type="button"
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    handleSelectMedicine(item.id, med);
                                  }}
                                  className="w-full text-left px-2.5 py-1.5 hover:bg-blue-50 rounded-lg flex items-center justify-between group transition-colors cursor-pointer"
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-800 group-hover:text-blue-900 text-xs">
                                      {med.name}
                                    </span>
                                    {med.dosage && (
                                      <span className="text-[10px] bg-slate-100 group-hover:bg-blue-100 text-slate-600 group-hover:text-blue-800 font-mono px-1.5 py-0.5 rounded font-semibold">
                                        {med.dosage}
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-1.5">
                                    {med.frequency && (
                                      <span className="text-[10px] text-slate-400 group-hover:text-blue-600 font-medium">
                                        {med.frequency}
                                      </span>
                                    )}
                                    {med.category && (
                                      <span className="text-[9px] bg-slate-100 text-slate-500 font-bold px-1.5 py-0.5 rounded uppercase">
                                        {med.category}
                                      </span>
                                    )}
                                  </div>
                                </button>
                              ))}

                              {getFilteredMedicines(item.medicine).length === 0 && (
                                <div className="px-3 py-2 text-center text-xs text-slate-400">
                                  No matching medicine in database.
                                </div>
                              )}

                              {/* If user typed a custom new medicine name, offer instant 1-click database save */}
                              {item.medicine.trim() && !medicines.some(m => m.name.toLowerCase().trim() === item.medicine.toLowerCase().trim()) && (
                                <div className="pt-1 mt-1 border-t border-slate-100">
                                  <button
                                    type="button"
                                    onMouseDown={(e) => {
                                      e.preventDefault();
                                      handleSaveToCatalog(item);
                                      setActiveDropdownRowId(null);
                                    }}
                                    className="w-full text-left px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 rounded-lg flex items-center gap-2 text-xs font-bold transition-colors cursor-pointer border border-blue-200"
                                  >
                                    <Database className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                                    <span>+ Save "{item.medicine}" to Database for future dropdowns</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Desktop Dosage & Route */}
                      <div className="hidden sm:block w-28 shrink-0">
                        <input
                          type="text"
                          value={item.dosage}
                          onChange={(e) => handleItemChange(item.id, 'dosage', e.target.value)}
                          placeholder="Dosage (625mg)"
                          className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold"
                        />
                      </div>
                      <div className="hidden sm:block w-28 shrink-0">
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
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer shrink-0 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Mobile-Only Row 2: Dosage + Route */}
                    <div className="grid grid-cols-2 gap-2 sm:hidden pl-7">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">Dosage</label>
                        <input
                          type="text"
                          value={item.dosage}
                          onChange={(e) => handleItemChange(item.id, 'dosage', e.target.value)}
                          placeholder="e.g. 500mg"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">Route</label>
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
                    </div>

                    {/* Mobile-Only Row 3: Frequency + Duration */}
                    <div className="grid grid-cols-2 gap-2 sm:hidden pl-7">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">Frequency</label>
                        <select
                          value={item.frequency}
                          onChange={(e) => handleItemChange(item.id, 'frequency', e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold bg-white"
                        >
                          <option value="OD">OD (Once daily)</option>
                          <option value="BD">BD (Twice daily)</option>
                          <option value="TDS">TDS (Thrice daily)</option>
                          <option value="QID">QID (Four times)</option>
                          <option value="SOS">SOS (When needed)</option>
                          <option value="Stat">Stat (Single dose)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">Duration</label>
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
                    </div>

                    {/* Mobile-Only Row 4: Instructions */}
                    <div className="sm:hidden pl-7">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">Instructions</label>
                      <input
                        type="text"
                        value={item.instructions}
                        onChange={(e) => handleItemChange(item.id, 'instructions', e.target.value)}
                        placeholder="Instructions (e.g. After food)"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-medium"
                      />
                    </div>

                    {/* Desktop-Only Grid: Frequency + Duration + Instructions */}
                    <div className="hidden sm:grid grid-cols-3 gap-2 pl-7">
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
              <div className="flex items-center justify-between sm:justify-start gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 sm:px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 font-bold cursor-pointer text-xs"
                >
                  Cancel
                </button>

                {editingRxId && (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 font-bold cursor-pointer text-xs flex items-center gap-1.5 transition-colors"
                    title="Delete this saved prescription"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Rx</span>
                  </button>
                )}
              </div>

              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrintOnly}
                  className="flex-1 sm:flex-none px-3.5 py-2.5 sm:py-2 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-transform active:scale-95"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print 🖨️</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  className="flex-1 sm:flex-none px-3.5 py-2.5 sm:py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-transform active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>PDF 📥</span>
                </button>

                <div className="w-full sm:w-auto">
                  <ClayButton
                    variant="mint"
                    type="submit"
                    disabled={isSubmitting}
                    icon={<CheckCircle2 className="w-4 h-4" />}
                    className="w-full sm:w-auto justify-center py-2.5 sm:py-2"
                  >
                    {isSubmitting 
                      ? 'Saving...' 
                      : editingRxId 
                        ? 'Update Prescription ℞' 
                        : 'Save & Issue Rx'}
                  </ClayButton>
                </div>
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
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setViewMode('edit')}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>← Back to Edit Form</span>
                </button>

                {editingRxId && (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 font-bold cursor-pointer text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Rx</span>
                  </button>
                )}
              </div>

              <ClayButton
                variant="mint"
                type="button"
                disabled={isSubmitting}
                onClick={(e) => handleSubmit(e, false)}
                icon={<CheckCircle2 className="w-4 h-4" />}
              >
                {isSubmitting 
                  ? 'Saving...' 
                  : editingRxId 
                    ? 'Update Prescription ℞' 
                    : 'Save & Issue Rx'}
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
    </ModalLayer>
  );
};
