import { ModalLayer } from '../common/ModalLayer';
import React, { useState, useEffect, useRef } from 'react';
import { PatientRecord } from '../../types';
import { ClayButton } from '../common/ClayButton';
import { 
  X, 
  Check, 
  Stethoscope, 
  HeartPulse, 
  AlertTriangle, 
  Pill, 
  FileText, 
  Plus, 
  Trash2, 
  Sparkles,
  ShieldAlert,
  Clock,
  History,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';

export interface DoctorCaseSheetModalProps {
  isOpen?: boolean;
  onClose: () => void;
  patient: PatientRecord;
  onSave: (updated: PatientRecord) => void;
  isPageModel?: boolean;
}

const SECTIONS = [
  { id: 'complaint' as const, num: 1, title: '1. Complaint & HOPI', shortTitle: 'Complaint & HOPI', desc: 'Chief dental complaint & symptom onset', icon: FileText },
  { id: 'medical' as const, num: 2, title: '2. Medical History', shortTitle: 'Medical History', desc: 'Systemic illnesses & past surgeries', icon: HeartPulse },
  { id: 'allergies' as const, num: 3, title: '3. Drugs & Allergies', shortTitle: 'Drugs & Allergies', desc: 'Safety alerts & current medications', icon: Pill },
  { id: 'dental' as const, num: 4, title: '4. Dental History', shortTitle: 'Dental History', desc: 'Past dental visits & oral habits', icon: History }
];

export const DoctorCaseSheetModal: React.FC<DoctorCaseSheetModalProps> = ({
  isOpen = true,
  onClose,
  patient,
  onSave,
  isPageModel = true
}) => {
  const currentPatientIdRef = useRef<string>(patient?.id || '');
  const draftKey = patient?.id ? `smilecare_case_sheet_draft_${patient.id}` : null;

  // Read draft once on initial mount if available
  const [initialDraft] = useState(() => {
    if (!draftKey) return null;
    try {
      const saved = sessionStorage.getItem(draftKey);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // Ignore
    }
    return null;
  });

  // Section tabs within Case Sheet
  const [activeSection, setActiveSection] = useState<'complaint' | 'medical' | 'allergies' | 'dental'>(
    initialDraft?.activeSection || 'complaint'
  );

  // 1. Chief Complaint & HOPI
  const [chiefComplaint, setChiefComplaint] = useState(
    initialDraft?.chiefComplaint !== undefined 
      ? initialDraft.chiefComplaint 
      : (patient.dentalHistory?.currentComplaint || patient.currentTreatment || '')
  );
  const [hopi, setHopi] = useState(
    initialDraft?.hopi !== undefined 
      ? initialDraft.hopi 
      : (patient.dentalHistory?.historyOfPresentIllness || '')
  );

  // 2. Medical History & Systemic Conditions
  const [hasDiabetes, setHasDiabetes] = useState(
    initialDraft?.hasDiabetes !== undefined ? initialDraft.hasDiabetes : !!patient.medicalHistory?.hasDiabetes
  );
  const [hasBloodPressure, setHasBloodPressure] = useState(
    initialDraft?.hasBloodPressure !== undefined ? initialDraft.hasBloodPressure : !!patient.medicalHistory?.hasBloodPressure
  );
  const [hasHeartConditions, setHasHeartConditions] = useState(
    initialDraft?.hasHeartConditions !== undefined ? initialDraft.hasHeartConditions : !!patient.medicalHistory?.hasHeartConditions
  );
  const [hasAsthma, setHasAsthma] = useState(
    initialDraft?.hasAsthma !== undefined ? initialDraft.hasAsthma : !!patient.medicalHistory?.hasAsthma
  );
  const [hasBleedingDisorders, setHasBleedingDisorders] = useState(
    initialDraft?.hasBleedingDisorders !== undefined ? initialDraft.hasBleedingDisorders : !!patient.medicalHistory?.hasBleedingDisorders
  );
  
  const [conditionsList, setConditionsList] = useState<string[]>(
    initialDraft?.conditionsList !== undefined ? initialDraft.conditionsList : (patient.medicalHistory?.conditions || [])
  );
  const [newConditionInput, setNewConditionInput] = useState('');

  const [surgeriesList, setSurgeriesList] = useState<string[]>(
    initialDraft?.surgeriesList !== undefined ? initialDraft.surgeriesList : (patient.medicalHistory?.previousSurgeries || [])
  );
  const [newSurgeryInput, setNewSurgeryInput] = useState('');

  const [precautionNotes, setPrecautionNotes] = useState(
    initialDraft?.precautionNotes !== undefined ? initialDraft.precautionNotes : (patient.medicalHistory?.otherNotes || '')
  );

  // 3. Drug Allergies
  const [allergiesList, setAllergiesList] = useState<string[]>(() => {
    if (initialDraft?.allergiesList !== undefined) return initialDraft.allergiesList;
    const fromMed = patient.medicalHistory?.allergies || [];
    const fromPat = patient.allergies || [];
    const merged = Array.from(new Set([...fromMed, ...fromPat]));
    return merged;
  });
  const [newAllergyInput, setNewAllergyInput] = useState('');

  // 4. Current Medications
  const [medicationsList, setMedicationsList] = useState<string[]>(
    initialDraft?.medicationsList !== undefined ? initialDraft.medicationsList : (patient.medicalHistory?.currentMedications || [])
  );
  const [newMedicationInput, setNewMedicationInput] = useState('');

  // 5. Dental History
  const [lastDentalVisit, setLastDentalVisit] = useState(
    initialDraft?.lastDentalVisit !== undefined ? initialDraft.lastDentalVisit : (patient.dentalHistory?.lastDentalVisit || '')
  );
  const [previousDentist, setPreviousDentist] = useState(
    initialDraft?.previousDentist !== undefined ? initialDraft.previousDentist : (patient.dentalHistory?.previousDentist || '')
  );
  const [previousTreatments, setPreviousTreatments] = useState<string[]>(
    initialDraft?.previousTreatments !== undefined ? initialDraft.previousTreatments : (patient.dentalHistory?.previousTreatments || [])
  );
  const [newTreatmentInput, setNewTreatmentInput] = useState('');

  const [habits, setHabits] = useState<string[]>(
    initialDraft?.habits !== undefined ? initialDraft.habits : (patient.dentalHistory?.habits || [])
  );
  const [newHabitInput, setNewHabitInput] = useState('');

  const [dentalNotes, setDentalNotes] = useState(
    initialDraft?.dentalNotes !== undefined ? initialDraft.dentalNotes : (patient.dentalHistory?.notes || '')
  );

  // Auto-save draft whenever any field changes so changes are NEVER lost
  useEffect(() => {
    if (!draftKey) return;
    try {
      const draft = {
        activeSection,
        chiefComplaint,
        hopi,
        hasDiabetes,
        hasBloodPressure,
        hasHeartConditions,
        hasAsthma,
        hasBleedingDisorders,
        conditionsList,
        surgeriesList,
        precautionNotes,
        allergiesList,
        medicationsList,
        lastDentalVisit,
        previousDentist,
        previousTreatments,
        habits,
        dentalNotes
      };
      sessionStorage.setItem(draftKey, JSON.stringify(draft));
    } catch (e) {
      // Ignore quota
    }
  }, [
    draftKey,
    activeSection,
    chiefComplaint,
    hopi,
    hasDiabetes,
    hasBloodPressure,
    hasHeartConditions,
    hasAsthma,
    hasBleedingDisorders,
    conditionsList,
    surgeriesList,
    precautionNotes,
    allergiesList,
    medicationsList,
    lastDentalVisit,
    previousDentist,
    previousTreatments,
    habits,
    dentalNotes
  ]);

  // Sync state ONLY when patient ID actually changes (switched to another patient)
  useEffect(() => {
    if (patient && patient.id !== currentPatientIdRef.current) {
      currentPatientIdRef.current = patient.id;
      
      const newDraftKey = `smilecare_case_sheet_draft_${patient.id}`;
      let loadedDraft: any = null;
      try {
        const saved = sessionStorage.getItem(newDraftKey);
        if (saved) loadedDraft = JSON.parse(saved);
      } catch (e) {}

      if (loadedDraft) {
        setActiveSection(loadedDraft.activeSection || 'complaint');
        setChiefComplaint(loadedDraft.chiefComplaint || '');
        setHopi(loadedDraft.hopi || '');
        setHasDiabetes(!!loadedDraft.hasDiabetes);
        setHasBloodPressure(!!loadedDraft.hasBloodPressure);
        setHasHeartConditions(!!loadedDraft.hasHeartConditions);
        setHasAsthma(!!loadedDraft.hasAsthma);
        setHasBleedingDisorders(!!loadedDraft.hasBleedingDisorders);
        setConditionsList(loadedDraft.conditionsList || []);
        setSurgeriesList(loadedDraft.surgeriesList || []);
        setPrecautionNotes(loadedDraft.precautionNotes || '');
        setAllergiesList(loadedDraft.allergiesList || []);
        setMedicationsList(loadedDraft.medicationsList || []);
        setLastDentalVisit(loadedDraft.lastDentalVisit || '');
        setPreviousDentist(loadedDraft.previousDentist || '');
        setPreviousTreatments(loadedDraft.previousTreatments || []);
        setHabits(loadedDraft.habits || []);
        setDentalNotes(loadedDraft.dentalNotes || '');
      } else {
        setActiveSection('complaint');
        setChiefComplaint(patient.dentalHistory?.currentComplaint || patient.currentTreatment || '');
        setHopi(patient.dentalHistory?.historyOfPresentIllness || '');
        setHasDiabetes(!!patient.medicalHistory?.hasDiabetes);
        setHasBloodPressure(!!patient.medicalHistory?.hasBloodPressure);
        setHasHeartConditions(!!patient.medicalHistory?.hasHeartConditions);
        setHasAsthma(!!patient.medicalHistory?.hasAsthma);
        setHasBleedingDisorders(!!patient.medicalHistory?.hasBleedingDisorders);
        setConditionsList(patient.medicalHistory?.conditions || []);
        setSurgeriesList(patient.medicalHistory?.previousSurgeries || []);
        setPrecautionNotes(patient.medicalHistory?.otherNotes || '');
        
        const fromMed = patient.medicalHistory?.allergies || [];
        const fromPat = patient.allergies || [];
        setAllergiesList(Array.from(new Set([...fromMed, ...fromPat])));
        
        setMedicationsList(patient.medicalHistory?.currentMedications || []);
        setLastDentalVisit(patient.dentalHistory?.lastDentalVisit || '');
        setPreviousDentist(patient.dentalHistory?.previousDentist || '');
        setPreviousTreatments(patient.dentalHistory?.previousTreatments || []);
        setHabits(patient.dentalHistory?.habits || []);
        setDentalNotes(patient.dentalHistory?.notes || '');
      }
    }
  }, [patient?.id]);

  if (!isOpen) return null;

  // Add / Remove helpers
  const handleAddAllergy = (allergy: string) => {
    const trimmed = allergy.trim();
    if (!trimmed) return;
    if (!allergiesList.includes(trimmed)) {
      setAllergiesList([...allergiesList, trimmed]);
    }
    setNewAllergyInput('');
  };

  const handleRemoveAllergy = (idx: number) => {
    setAllergiesList(allergiesList.filter((_, i) => i !== idx));
  };

  const handleAddMedication = (med: string) => {
    const trimmed = med.trim();
    if (!trimmed) return;
    if (!medicationsList.includes(trimmed)) {
      setMedicationsList([...medicationsList, trimmed]);
    }
    setNewMedicationInput('');
  };

  const handleRemoveMedication = (idx: number) => {
    setMedicationsList(medicationsList.filter((_, i) => i !== idx));
  };

  const handleAddCondition = (cond: string) => {
    const trimmed = cond.trim();
    if (!trimmed) return;
    if (!conditionsList.includes(trimmed)) {
      setConditionsList([...conditionsList, trimmed]);
    }
    setNewConditionInput('');
  };

  const handleRemoveCondition = (idx: number) => {
    setConditionsList(conditionsList.filter((_, i) => i !== idx));
  };

  const handleAddHabit = (habit: string) => {
    const trimmed = habit.trim();
    if (!trimmed) return;
    if (!habits.includes(trimmed)) {
      setHabits([...habits, trimmed]);
    }
    setNewHabitInput('');
  };

  const handleRemoveHabit = (idx: number) => {
    setHabits(habits.filter((_, i) => i !== idx));
  };

  const handleAddPreviousTreatment = (t: string) => {
    const trimmed = t.trim();
    if (!trimmed) return;
    if (!previousTreatments.includes(trimmed)) {
      setPreviousTreatments([...previousTreatments, trimmed]);
    }
    setNewTreatmentInput('');
  };

  const handleRemovePreviousTreatment = (idx: number) => {
    setPreviousTreatments(previousTreatments.filter((_, i) => i !== idx));
  };

  const handleSave = () => {
    if (draftKey) {
      try {
        sessionStorage.removeItem(draftKey);
      } catch (e) {
        // ignore
      }
    }

    if (patient?.id) {
      try {
        sessionStorage.setItem(`smilecare_intake_completed_${patient.id}`, 'true');
        localStorage.setItem(`smilecare_intake_completed_${patient.id}`, 'true');
        sessionStorage.setItem(`smilecare_intake_viewed_${patient.id}`, 'true');
      } catch (e) {
        // ignore
      }
    }

    // Compile conditions list with checkboxes
    const finalConditions = Array.from(new Set([
      ...conditionsList,
      hasDiabetes ? 'Diabetes Mellitus' : '',
      hasBloodPressure ? 'Hypertension' : '',
      hasHeartConditions ? 'Cardiac Condition' : '',
      hasAsthma ? 'Asthma / Respiratory' : '',
      hasBleedingDisorders ? 'Bleeding Disorder / Anticoagulants' : ''
    ])).filter(Boolean);

    const nowIso = new Date().toISOString();

    const updatedPatient: PatientRecord = {
      ...patient,
      status: patient.status === 'New Patient' ? 'Active Treatment' : patient.status,
      caseSheetCompleted: true,
      caseSheetCompletedAt: nowIso,
      currentTreatment: chiefComplaint.trim() || patient.currentTreatment,
      allergies: allergiesList,
      medicalHistory: {
        ...patient.medicalHistory,
        allergies: allergiesList,
        conditions: finalConditions,
        hasDiabetes,
        hasBloodPressure,
        hasHeartConditions,
        hasAsthma,
        hasBleedingDisorders,
        currentMedications: medicationsList,
        previousSurgeries: surgeriesList,
        otherNotes: precautionNotes.trim()
      },
      dentalHistory: {
        ...patient.dentalHistory,
        caseSheetCompleted: true,
        completedAt: nowIso,
        currentComplaint: chiefComplaint.trim(),
        historyOfPresentIllness: hopi.trim(),
        lastDentalVisit: lastDentalVisit.trim(),
        previousDentist: previousDentist.trim(),
        previousTreatments: previousTreatments,
        habits: habits,
        notes: dentalNotes.trim()
      }
    };

    onSave(updatedPatient);
    onClose();
  };

  if (!isOpen) return null;

  const currentSectionIndex = SECTIONS.findIndex((s) => s.id === activeSection);

  const innerContent = (
    <div className={`case-sheet-panel bg-white w-full ${isPageModel ? 'rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200' : 'max-w-3xl rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto'} space-y-6 animate-in fade-in`}>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 flex items-center gap-2">
            <Stethoscope className="w-5 h-5 sm:w-6 sm:h-6 text-sky-600 shrink-0" />
            <span>Case sheet · {patient.name}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            OP: <strong className="text-slate-800 font-mono">{patient.opNumber || patient.id}</strong> • Age: <strong className="text-slate-800">{patient.age}y</strong> ({patient.gender}) • Attending Doctor: <strong className="text-sky-800">{patient.assignedDoctorName}</strong> • Phone: <strong className="text-slate-800 font-mono">{patient.phone}</strong>
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer self-start sm:self-center flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Profile</span>
        </button>
      </div>

      {/* Visual Stepper & Progress Bar */}
      <div className="case-sections space-y-3 bg-slate-50/80 p-4 rounded-2xl border border-slate-200">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-slate-700">
            Active Section: <strong className="text-indigo-900">{SECTIONS[currentSectionIndex].title}</strong>
          </span>
          <span className="text-sky-700 font-mono font-black">
            {Math.round(((currentSectionIndex + 1) / 4) * 100)}% Completed
          </span>
        </div>

        <label className="case-section-select">
          <span>Case sheet section</span>
          <select value={activeSection} onChange={event => setActiveSection(event.target.value as typeof activeSection)}>
            {SECTIONS.map(section => <option key={section.id} value={section.id}>{section.num} of {SECTIONS.length} · {section.shortTitle}</option>)}
          </select>
        </label>

        {/* Progress Bar Track */}
        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-sky-500 transition-all duration-300 rounded-full"
            style={{ width: `${((currentSectionIndex + 1) / 4) * 100}%` }}
          />
        </div>

        {/* 4 Interactive Step Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-1">
          {SECTIONS.map((sec, idx) => {
            const isCurrent = activeSection === sec.id;
            const isCompleted = idx < currentSectionIndex;
            const SecIcon = sec.icon;

            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => setActiveSection(sec.id)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                  isCurrent
                    ? 'bg-white border-sky-500 shadow-sm ring-2 ring-sky-500/20'
                    : isCompleted
                    ? 'bg-emerald-50/70 border-emerald-300 text-slate-800'
                    : 'bg-white/60 border-slate-200 text-slate-500 hover:bg-white'
                }`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 font-bold text-xs ${
                  isCurrent
                    ? 'bg-sky-600 text-white'
                    : isCompleted
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 text-slate-600'
                }`}>
                  {isCompleted ? '✓' : idx + 1}
                </div>
                <div className="min-w-0">
                  <div className={`text-xs font-bold truncate ${isCurrent ? 'text-sky-950' : 'text-slate-700'}`}>
                    {sec.shortTitle}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate hidden sm:block">
                    {sec.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

        {/* SECTION 1: CHIEF COMPLAINT & HOPI */}
        {activeSection === 'complaint' && (
          <div className="space-y-4 animate-in fade-in">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1">
                  <span>Chief Dental Complaint</span>
                  <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-slate-400">Patient's own words</span>
              </div>
              <input
                type="text"
                value={chiefComplaint}
                onChange={(e) => setChiefComplaint(e.target.value)}
                placeholder="e.g. Severe throbbing pain in lower left molar tooth"
                className="w-full px-3.5 py-2.5 rounded-xl text-xs font-bold border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500"
              />

              {/* Quick preset chips */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase">⚡ Quick Chips:</span>
                {[
                  'Severe throbbing toothache',
                  'Sensitivity to hot & cold beverages',
                  'Bleeding gums & calculus buildup',
                  'Broken / chipped tooth crown',
                  'Wisdom tooth pericoronitis / pain',
                  'Routine scaling & prophylactic checkup',
                  'Aesthetic smile makeover & aligners'
                ].map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setChiefComplaint(chip)}
                    className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-indigo-50 text-[11px] font-medium text-slate-700 hover:text-indigo-900 border border-slate-200 transition-colors cursor-pointer"
                  >
                    + {chip}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  History of Present Illness (HOPI / "History of Presents Lines")
                </label>
                <span className="text-[11px] text-slate-400">Onset, severity, duration & triggers</span>
              </div>
              <textarea
                rows={4}
                value={hopi}
                onChange={(e) => setHopi(e.target.value)}
                placeholder="Describe: Onset (e.g. started 3 days ago), Character (sharp / dull throbbing), Radiation (radiates to ear/jaw), Triggers (hot/cold liquids, mastication), Relieving factors (analgesics)..."
                className="w-full p-3 rounded-xl text-xs font-medium border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500 leading-relaxed"
              />

              {/* Quick HOPI snippets */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase">⚡ Insert Lines:</span>
                {[
                  'Pain started 3 days ago with sudden onset.',
                  'Sharp shooting pain triggered by chewing food.',
                  'Severe sensitivity to cold water and ice cream.',
                  'Nocturnal spontaneous pain disturbing sleep.',
                  'Pain radiates to the ipsilateral temple and ear.',
                  'Partial temporary relief achieved with analgesics.'
                ].map((snippet, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setHopi((prev) => (prev ? `${prev} ${snippet}` : snippet));
                    }}
                    className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-sky-50 text-[11px] font-medium text-slate-700 hover:text-sky-900 border border-slate-200 transition-colors cursor-pointer"
                  >
                    + {snippet.slice(0, 32)}...
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: MEDICAL HISTORY & SYSTEMIC CONDITIONS */}
        {activeSection === 'medical' && (
          <div className="space-y-4 animate-in fade-in">
            <div>
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2">
                Systemic Conditions (Clinical Check)
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {/* Diabetes */}
                <label className={`p-3 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                  hasDiabetes ? 'border-sky-500 bg-sky-50' : 'border-slate-200 bg-slate-50'
                }`}>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Diabetes Mellitus</span>
                    <span className="text-[10px] text-slate-500">Type 1 / Type 2 / HbA1c</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={hasDiabetes}
                    onChange={(e) => setHasDiabetes(e.target.checked)}
                    className="w-4 h-4 text-sky-600 rounded cursor-pointer"
                  />
                </label>

                {/* Blood Pressure */}
                <label className={`p-3 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                  hasBloodPressure ? 'border-sky-500 bg-sky-50' : 'border-slate-200 bg-slate-50'
                }`}>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Hypertension / BP</span>
                    <span className="text-[10px] text-slate-500">Elevated blood pressure</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={hasBloodPressure}
                    onChange={(e) => setHasBloodPressure(e.target.checked)}
                    className="w-4 h-4 text-sky-600 rounded cursor-pointer"
                  />
                </label>

                {/* Heart Conditions */}
                <label className={`p-3 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                  hasHeartConditions ? 'border-rose-500 bg-rose-50' : 'border-slate-200 bg-slate-50'
                }`}>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Cardiac Disease</span>
                    <span className="text-[10px] text-slate-500">Stents / Valves / Pacemaker</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={hasHeartConditions}
                    onChange={(e) => setHasHeartConditions(e.target.checked)}
                    className="w-4 h-4 text-rose-600 rounded cursor-pointer"
                  />
                </label>

                {/* Asthma */}
                <label className={`p-3 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                  hasAsthma ? 'border-amber-500 bg-amber-50' : 'border-slate-200 bg-slate-50'
                }`}>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Asthma / Respiratory</span>
                    <span className="text-[10px] text-slate-500">Inhalers / Bronchospasm</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={hasAsthma}
                    onChange={(e) => setHasAsthma(e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded cursor-pointer"
                  />
                </label>

                {/* Bleeding Disorders */}
                <label className={`p-3 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                  hasBleedingDisorders ? 'border-rose-500 bg-rose-50' : 'border-slate-200 bg-slate-50'
                }`}>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Bleeding Disorders</span>
                    <span className="text-[10px] text-slate-500">Blood thinners / Hemophilia</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={hasBleedingDisorders}
                    onChange={(e) => setHasBleedingDisorders(e.target.checked)}
                    className="w-4 h-4 text-rose-600 rounded cursor-pointer"
                  />
                </label>
              </div>
            </div>

            {/* Additional diagnosed medical conditions */}
            <div>
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">
                Other Diagnosed Medical Conditions (Add & Remove)
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newConditionInput}
                  onChange={(e) => setNewConditionInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCondition(newConditionInput);
                    }
                  }}
                  placeholder="e.g. Thyroid Disorder, Hepatitis B, Epilepsy, Kidney Disease"
                  className="flex-1 px-3 py-2 rounded-xl text-xs border border-slate-300 bg-white"
                />
                <button
                  type="button"
                  onClick={() => handleAddCondition(newConditionInput)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {conditionsList.length > 0 ? (
                  conditionsList.map((cond, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 text-xs font-semibold"
                    >
                      <span>{cond}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCondition(idx)}
                        className="text-amber-700 hover:text-rose-700 cursor-pointer font-bold"
                      >
                        ✕
                      </button>
                    </span>
                  ))
                ) : (
                  <span className="text-[11px] text-slate-400 italic">No extra conditions added.</span>
                )}
              </div>
            </div>

            {/* Doctor Precaution Notes */}
            <div>
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">
                Doctor Precaution Notes / Special Instructions
              </label>
              <textarea
                rows={3}
                value={precautionNotes}
                onChange={(e) => setPrecautionNotes(e.target.value)}
                placeholder="e.g. Use 3% Mepivacaine without adrenaline. Patient requires antibiotic prophylaxis 1h prior to invasive procedures. Monitor BP before extractions."
                className="w-full p-3 rounded-xl text-xs font-medium border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500 leading-relaxed"
              />
            </div>
          </div>
        )}

        {/* SECTION 3: DRUG ALLERGIES & CURRENT MEDICATIONS */}
        {activeSection === 'allergies' && (
          <div className="space-y-5 animate-in fade-in">
            {/* DRUG ALLERGIES */}
            <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <h4 className="text-xs font-black uppercase tracking-wider text-rose-950">
                    Drug Allergies & Hypersensitivities
                  </h4>
                </div>
                {allergiesList.length === 0 && (
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    ✓ No Known Drug Allergies (NKDA)
                  </span>
                )}
              </div>

              {/* Add Allergy Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newAllergyInput}
                  onChange={(e) => setNewAllergyInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddAllergy(newAllergyInput);
                    }
                  }}
                  placeholder="Type drug allergy (e.g. Penicillin, Sulfa drugs, Ibuprofen)..."
                  className="flex-1 px-3 py-2 rounded-xl text-xs border border-rose-300 bg-white"
                />
                <button
                  type="button"
                  onClick={() => handleAddAllergy(newAllergyInput)}
                  className="px-3.5 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs cursor-pointer flex items-center gap-1 shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Allergy</span>
                </button>
              </div>

              {/* Quick Presets for Common Dental Allergies */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase">⚡ Common Allergens:</span>
                {[
                  'Penicillin / Amoxicillin',
                  'Sulfa Drugs',
                  'NSAIDs / Aspirin',
                  'Local Anesthetic (Lidocaine)',
                  'Latex Gloves',
                  'Codeine'
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAddAllergy(preset)}
                    className="px-2 py-0.5 rounded-md bg-white hover:bg-rose-100 text-[11px] font-semibold text-rose-900 border border-rose-200 transition-colors cursor-pointer"
                  >
                    + {preset}
                  </button>
                ))}
              </div>

              {/* Active Allergies Badges with Delete button */}
              <div className="pt-1">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1.5">
                  Active Allergy Warnings ({allergiesList.length}):
                </span>
                <div className="flex flex-wrap gap-2">
                  {allergiesList.map((allergy, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-600 text-white font-bold text-xs shadow-2xs animate-in zoom-in-95"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-white" />
                      <span>{allergy}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAllergy(idx)}
                        className="hover:bg-rose-800 rounded-full w-4 h-4 flex items-center justify-center cursor-pointer font-bold text-white transition-colors"
                        title="Delete allergy"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                  {allergiesList.length === 0 && (
                    <span className="text-xs text-slate-500 italic">
                      No drug allergies recorded. Click any chip above or type to add.
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* CURRENT MEDICATIONS */}
            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Pill className="w-4 h-4 text-indigo-700" />
                  <h4 className="text-xs font-black uppercase tracking-wider text-indigo-950">
                    Currently On Any Medication (Active Prescriptions)
                  </h4>
                </div>
                <span className="text-xs font-bold text-indigo-800">
                  Total: {medicationsList.length}
                </span>
              </div>

              {/* Add Medication Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMedicationInput}
                  onChange={(e) => setNewMedicationInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddMedication(newMedicationInput);
                    }
                  }}
                  placeholder="e.g. Metformin 500mg (OD), Amlodipine 5mg (OD), Ecosprin 75mg..."
                  className="flex-1 px-3 py-2 rounded-xl text-xs border border-indigo-300 bg-white"
                />
                <button
                  type="button"
                  onClick={() => handleAddMedication(newMedicationInput)}
                  className="px-3.5 py-2 rounded-xl bg-indigo-800 hover:bg-indigo-900 text-white font-bold text-xs cursor-pointer flex items-center gap-1 shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Medication</span>
                </button>
              </div>

              {/* Quick Presets */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase">⚡ Common Rx:</span>
                {[
                  'Metformin 500mg OD',
                  'Amlodipine 5mg OD',
                  'Telmisartan 40mg OD',
                  'Ecosprin 75mg OD',
                  'Thyronorm 50mcg',
                  'Atorvastatin 10mg HS'
                ].map((med, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAddMedication(med)}
                    className="px-2 py-0.5 rounded-md bg-white hover:bg-indigo-100 text-[11px] font-semibold text-indigo-900 border border-indigo-200 transition-colors cursor-pointer"
                  >
                    + {med}
                  </button>
                ))}
              </div>

              {/* Active Medications List */}
              <div className="pt-1">
                <div className="flex flex-wrap gap-2">
                  {medicationsList.map((med, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white text-indigo-950 font-bold text-xs border border-indigo-300 shadow-2xs"
                    >
                      <span>💊 {med}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveMedication(idx)}
                        className="text-slate-400 hover:text-rose-600 rounded-full w-4 h-4 flex items-center justify-center cursor-pointer font-bold transition-colors"
                        title="Remove medication"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                  {medicationsList.length === 0 && (
                    <span className="text-xs text-slate-500 italic">
                      Patient is currently not on regular systemic medications.
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 4: DENTAL HISTORY */}
        {activeSection === 'dental' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Last Dental Visit
                </label>
                <input
                  type="text"
                  value={lastDentalVisit}
                  onChange={(e) => setLastDentalVisit(e.target.value)}
                  placeholder="e.g. 6 months ago, Never, Last year"
                  className="w-full px-3 py-2 rounded-xl text-xs font-semibold border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Previous Dental Practice / Dentist
                </label>
                <input
                  type="text"
                  value={previousDentist}
                  onChange={(e) => setPreviousDentist(e.target.value)}
                  placeholder="e.g. City Dental Care / Dr. Sen"
                  className="w-full px-3 py-2 rounded-xl text-xs font-semibold border border-slate-300 bg-white"
                />
              </div>
            </div>

            {/* Previous Dental Treatments */}
            <div>
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">
                Previous Dental Procedures & Restorations (Add & Remove)
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newTreatmentInput}
                  onChange={(e) => setNewTreatmentInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddPreviousTreatment(newTreatmentInput);
                    }
                  }}
                  placeholder="e.g. Root Canal tooth #36, Composite fillings, Orthodontic braces, Wisdom tooth extraction"
                  className="flex-1 px-3 py-2 rounded-xl text-xs border border-slate-300 bg-white"
                />
                <button
                  type="button"
                  onClick={() => handleAddPreviousTreatment(newTreatmentInput)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {previousTreatments.map((t, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-50 text-sky-900 border border-sky-200 text-xs font-semibold"
                  >
                    <span>{t}</span>
                    <button
                      type="button"
                      onClick={() => handleRemovePreviousTreatment(idx)}
                      className="text-sky-700 hover:text-rose-700 cursor-pointer font-bold"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Dental Habits */}
            <div>
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">
                Oral Habits & Risk Factors
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {[
                  'Bruxism (Teeth Grinding)',
                  'Clenching',
                  'Tobacco Chewing',
                  'Smoking',
                  'Mouth Breathing',
                  'Nail Biting',
                  'High Sugar Diet'
                ].map((habitChip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAddHabit(habitChip)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium cursor-pointer border border-slate-200"
                  >
                    + {habitChip}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap gap-1.5">
                {habits.map((h, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-50 text-purple-900 border border-purple-200 text-xs font-semibold"
                  >
                    <span>{h}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveHabit(idx)}
                      className="text-purple-700 hover:text-rose-700 cursor-pointer font-bold"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Additional Dental Observations */}
            <div>
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">
                Doctor Dental Intake Notes
              </label>
              <textarea
                rows={2}
                value={dentalNotes}
                onChange={(e) => setDentalNotes(e.target.value)}
                placeholder="Specific clinical findings, plaque index, periodontal status, or dental concerns..."
                className="w-full p-2.5 rounded-xl text-xs font-medium border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        )}

        {/* Step Navigation Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-slate-200">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 border border-slate-200 cursor-pointer transition-colors"
            >
              Cancel
            </button>

            {currentSectionIndex > 0 && (
              <ClayButton
                variant="secondary"
                size="md"
                type="button"
                onClick={() => setActiveSection(SECTIONS[currentSectionIndex - 1].id)}
                icon={<ArrowLeft className="w-4 h-4 text-slate-600" />}
              >
                Previous
              </ClayButton>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <span className="text-xs text-slate-400 font-semibold hidden md:inline">
              Step {currentSectionIndex + 1} of 4
            </span>

            {currentSectionIndex < 3 ? (
              <ClayButton
                variant="primary"
                size="md"
                type="button"
                onClick={() => {
                  if (currentSectionIndex === 0 && !chiefComplaint.trim()) {
                    setChiefComplaint('New Patient Examination & Consultation');
                  }
                  setActiveSection(SECTIONS[currentSectionIndex + 1].id);
                }}
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Next section
              </ClayButton>
            ) : (
              <ClayButton
                variant="mint"
                size="lg"
                type="button"
                onClick={handleSave}
                icon={<Check className="w-5 h-5" />}
              >
                Save case sheet
              </ClayButton>
            )}
          </div>
        </div>

      </div>
  );

  if (isPageModel) {
    return innerContent;
  }

  return (
    <ModalLayer onDismiss={onClose} className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      {innerContent}
    </ModalLayer>
  );
};

export const DoctorCaseSheetPage = DoctorCaseSheetModal;
