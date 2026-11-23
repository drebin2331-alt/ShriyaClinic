import { PrioritySelector } from '../components/common/PrioritySelector';
import './patient-profile.css';
import { SectionPicker } from '../components/common/WorkspaceControls';
import { ModalLayer } from '../components/common/ModalLayer';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import {
  PatientRecord,
  ToothData,
  TreatmentPlanItem,
  TreatmentPlanStatus,
  ClinicalNote,
  DiagnosisRecord,
  LabOrder,
  Invoice,
  DocumentRecord,
  FollowUpRecord,
  PaymentMethod,
  PaymentRecord,
  PrescriptionRecord,
  ClinicVisit
} from '../types';
import { DentalChart } from '../components/dental/DentalChart';
import { TreatmentPlanChart } from '../components/dental/TreatmentPlanChart';
import { ToothDetailModal } from '../components/dental/ToothDetailModal';
import { TreatmentLegend } from '../components/dental/TreatmentLegend';
import { ClayButton } from '../components/common/ClayButton';
import { Sidebar } from '../components/common/Sidebar';
import { PrintablePrescriptionModal } from '../components/dental/PrintablePrescriptionModal';
import { PrintableReceiptModal } from '../components/dental/PrintableReceiptModal';
import { DoctorFeeApprovalModal } from '../components/dental/DoctorFeeApprovalModal';
import { DoctorPrescriptionModal } from '../components/dental/DoctorPrescriptionModal';
import { ReceptionCheckoutModal } from '../components/dental/ReceptionCheckoutModal';
import { DoctorCaseSheetModal } from '../components/dental/DoctorCaseSheetModal';
import {
  User,
  Calendar,
  Phone,
  Clock,
  AlertCircle,
  Heart,
  Activity,
  FileText,
  Sparkles,
  Layers,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  DollarSign,
  Plus,
  Eye,
  Download,
  Printer,
  CreditCard,
  MessageSquare,
  ShieldAlert,
  Send,
  FlaskConical,
  Stethoscope,
  Scissors,
  Receipt,
  QrCode,
  Edit3,
  Trash2,
  X,
  CalendarCheck2,
  RotateCcw,
  ClipboardList,
  Zap
} from 'lucide-react';

export const PatientProfileView: React.FC = () => {
  const {
    selectedPatientForDetail,
    setSelectedPatientForDetail,
    patients,
    activeView,
    updatePatient,
    setActiveView,
    addToast,
    doctors,
    visits,
    tokens,
    appointments,
    checkInPatient,
    completeConsultation,
    invoices: globalInvoices,
    payments: globalPayments,
    createInvoice,
    recordPayment,
    addFollowUp,
    updateFollowUpStatus,
    rescheduleFollowUp,
    sendFollowUpWhatsAppReminder,
    shouldOpenCaseSheetOnProfile,
    setShouldOpenCaseSheetOnProfile,
    prescriptions,
    updatePrescription,
    deletePrescription
  } = useApp();
  const { currentUser } = useAuth();

  if (!selectedPatientForDetail && patients.length === 0) {
    return (
      <div className="workspace w-full max-w-[1650px] mx-auto px-4 lg:px-6 py-6 flex flex-col lg:flex-row gap-6">
        <Sidebar type="doctor" />
        <main className="flex-1 min-w-0 p-12 text-center space-y-4 bg-white rounded-2xl border border-slate-200">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto text-2xl font-bold border border-teal-200">
            <Stethoscope className="w-8 h-8 text-teal-700" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">No Patient Records in Database</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            There are currently 0 patients in the database. All mock data has been removed. Use the Patient Directory to register your first patient and start digital charting.
          </p>
          <button
            onClick={() => setActiveView('admin-patients')}
            className="px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs transition-colors cursor-pointer inline-flex items-center gap-2"
          >
            <span>+ Register First Patient in Directory</span>
          </button>
        </main>
      </div>
    );
  }

  const rawPatient = (selectedPatientForDetail?.id ? patients.find((p) => p.id === selectedPatientForDetail.id) : null) || selectedPatientForDetail || patients[0];

  const patient: PatientRecord = useMemo(() => {
    if (!rawPatient) return {} as PatientRecord;
    return {
      ...rawPatient,
      medicalHistory: {
        allergies: rawPatient.medicalHistory?.allergies || [],
        conditions: rawPatient.medicalHistory?.conditions || [],
        hasDiabetes: !!rawPatient.medicalHistory?.hasDiabetes,
        hasBloodPressure: !!rawPatient.medicalHistory?.hasBloodPressure,
        hasHeartConditions: !!rawPatient.medicalHistory?.hasHeartConditions,
        hasAsthma: !!rawPatient.medicalHistory?.hasAsthma,
        hasBleedingDisorders: !!rawPatient.medicalHistory?.hasBleedingDisorders,
        currentMedications: rawPatient.medicalHistory?.currentMedications || [],
        previousSurgeries: rawPatient.medicalHistory?.previousSurgeries || [],
        otherNotes: rawPatient.medicalHistory?.otherNotes || ''
      },
      dentalHistory: {
        ...rawPatient.dentalHistory,
        currentComplaint: rawPatient.dentalHistory?.currentComplaint || rawPatient.currentTreatment || '',
        historyOfPresentIllness: rawPatient.dentalHistory?.historyOfPresentIllness || ''
      },
      allergies: rawPatient.allergies || rawPatient.medicalHistory?.allergies || [],
      recentTreatments: rawPatient.recentTreatments || [],
      visits: rawPatient.visits || [],
      dentalChart: (() => {
        const baseChart: ToothData[] = [...(rawPatient.dentalChart || [])];
        // Auto-synchronize any treatments from treatmentPlans into dentalChart so 3D Odontogram and Summary counters reflect all treatments
        (rawPatient.treatmentPlans || []).forEach((tp) => {
          if (tp.toothNumbers && Array.isArray(tp.toothNumbers)) {
            tp.toothNumbers.forEach((tNum) => {
              const procLower = (tp.procedure || '').toLowerCase();
              const diagLower = (tp.diagnosis || '').toLowerCase();
              let derivedCond: ToothCondition = 'Root Canal';
              let derivedCode = 'R';

              if (procLower.includes('root canal') || procLower.includes('rct') || procLower.includes('endodontic') || diagLower.includes('pulpitis')) {
                derivedCond = 'Root Canal';
                derivedCode = 'R';
              } else if (procLower.includes('crown') || procLower.includes('cap') || tp.prostheticDesign?.restorationType === 'Crown') {
                derivedCond = 'Crown';
                derivedCode = 'CR';
              } else if (procLower.includes('filling') || procLower.includes('restoration') || procLower.includes('composite')) {
                derivedCond = 'Filling';
                derivedCode = 'F';
              } else if (procLower.includes('extract') || procLower.includes('removal')) {
                derivedCond = 'Missing';
                derivedCode = 'X';
              } else if (procLower.includes('implant')) {
                derivedCond = 'Implant';
                derivedCode = 'I';
              } else if (procLower.includes('caries') || diagLower.includes('caries')) {
                derivedCond = 'Caries';
                derivedCode = 'C';
              }

              const existingIdx = baseChart.findIndex((t) => t.toothNumber === tNum);
              if (existingIdx >= 0) {
                if (baseChart[existingIdx].condition === 'Healthy' || !baseChart[existingIdx].treatmentCode) {
                  baseChart[existingIdx] = {
                    ...baseChart[existingIdx],
                    condition: derivedCond,
                    treatmentCode: baseChart[existingIdx].treatmentCode || derivedCode,
                    treatmentStatus: baseChart[existingIdx].treatmentStatus || tp.status
                  };
                }
              } else {
                baseChart.push({
                  toothNumber: tNum,
                  type: tNum >= 50 ? 'child' : 'adult',
                  condition: derivedCond,
                  treatmentCode: derivedCode,
                  surfaces: { mesial: 'Healthy', distal: 'Healthy', occlusal: 'Healthy', buccal: 'Healthy', lingual: 'Healthy' },
                  treatmentStatus: tp.status
                });
              }
            });
          }
        });

        // Also auto-derive condition from surfaces if condition is Healthy
        baseChart.forEach((t, idx) => {
          if (t.condition === 'Healthy' && t.surfaces) {
            const sVals = Object.values(t.surfaces);
            if (sVals.some((v) => v === 'Root Canal')) {
              baseChart[idx] = { ...t, condition: 'Root Canal', treatmentCode: t.treatmentCode || 'R' };
            } else if (sVals.some((v) => v === 'Crown')) {
              baseChart[idx] = { ...t, condition: 'Crown', treatmentCode: t.treatmentCode || 'CR' };
            } else if (sVals.some((v) => v === 'Filling')) {
              baseChart[idx] = { ...t, condition: 'Filling', treatmentCode: t.treatmentCode || 'F' };
            } else if (sVals.some((v) => v === 'Caries')) {
              baseChart[idx] = { ...t, condition: 'Caries', treatmentCode: t.treatmentCode || 'C' };
            }
          }
        });

        return baseChart;
      })(),
      treatmentPlans: rawPatient.treatmentPlans || [],
      clinicalNotes: rawPatient.clinicalNotes || [],
      diagnoses: rawPatient.diagnoses || [],
      treatmentSessions: rawPatient.treatmentSessions || [],
      labOrders: rawPatient.labOrders || [],
      documents: rawPatient.documents || [],
      invoices: rawPatient.invoices || [],
      followUps: rawPatient.followUps || [],
      prescriptions: rawPatient.prescriptions || []
    };
  }, [rawPatient]);

  const defaultDoctorName = patient?.assignedDoctorName || currentUser?.name || doctors[0]?.name || 'Dr. DOCTOR TEST';
  const defaultDoctorId = patient?.assignedDoctorId || currentUser?.id || doctors[0]?.id || 'staff-1792653030970';

  type TabType =
    | 'overview'
    | 'chart'
    | 'prescriptions'
    | 'treatment-plan'
    | 'visits-notes'
    | 'lab-orders'
    | 'billing'
    | 'documents';

  const getTabFromView = (view: string): TabType => {
    switch (view) {
      case 'doctor-dental-chart':
        return 'chart';
      case 'prescriptions':
      case 'rx':
      case 'doctor-prescriptions':
        return 'prescriptions';
      case 'doctor-treatment-plans':
        return 'treatment-plan';
      case 'doctor-clinical-notes':
      case 'doctor-followups':
      case 'visits':
        return 'visits-notes';
      case 'doctor-lab-orders':
        return 'lab-orders';
      case 'customer-billing':
      case 'billing':
        return 'billing';
      case 'documents':
        return 'documents';
      case 'patient-profile':
      case 'patient-detail':
      default:
        return 'overview';
    }
  };

  const [activeTab, setActiveTab] = useState<TabType>(() => getTabFromView(activeView));

  // Keep activeTab in sync with activeView ONLY when an external action specifically targets a sub-tab
  const prevViewRef = React.useRef(activeView);
  useEffect(() => {
    if (prevViewRef.current !== activeView) {
      prevViewRef.current = activeView;
      if (['clinical-intake', 'patient-intake', 'intake', 'case-sheet'].includes(activeView)) {
        setShowCaseSheetModal(true);
      }
      const specificTabs = [
        'doctor-dental-chart',
        'chart',
        'doctor-treatment-plans',
        'treatment-plan',
        'doctor-clinical-notes',
        'doctor-lab-orders'
      ];
      if (specificTabs.includes(activeView)) {
        setActiveTab(getTabFromView(activeView));
      }
    }
  }, [activeView]);

  const handleTabChange = (newTab: TabType) => {
    setActiveTab(newTab);
  };

  // Consultation wrap-up modal state
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [compDiagnosis, setCompDiagnosis] = useState('');
  const [compTreatment, setCompTreatment] = useState('');
  const [compNotes, setCompNotes] = useState('');
  const [compFollowUp, setCompFollowUp] = useState('');

  const activeVisit = visits.find(
    (v) => (v.patientId === patient.id || (v.patientName && patient.name && v.patientName.toLowerCase() === patient.name.toLowerCase())) &&
      (v.status === 'In Consultation' || v.status === 'Called')
  );

  const checkoutVisit = visits.find(
    (v) => (v.patientId === patient.id || (v.patientName && patient.name && v.patientName.toLowerCase() === patient.name.toLowerCase())) &&
      v.status === 'Reception Follow-up'
  );

  const activeToken = tokens.find(
    (t) => (t.patientId === patient.id || (t.patientName && patient.name && t.patientName.toLowerCase() === patient.name.toLowerCase())) &&
      t.status !== 'Completed' && t.status !== 'Cancelled'
  );

  const effectiveVisit: ClinicVisit = useMemo(() => {
    if (activeVisit) return activeVisit;
    if (checkoutVisit) return checkoutVisit;

    const waitingOrActiveVisit = visits.find(
      (v) => (v.patientId === patient.id || (v.patientName && patient.name && v.patientName.toLowerCase() === patient.name.toLowerCase())) &&
        v.status !== 'Completed' && v.status !== 'Cancelled'
    );
    if (waitingOrActiveVisit) return waitingOrActiveVisit;

    if (activeToken?.visitId) {
      const tokVisit = visits.find((v) => v.id === activeToken.visitId);
      if (tokVisit) return tokVisit;
    }

    const anyPatientVisit = visits.find(
      (v) => v.patientId === patient.id || (v.patientName && patient.name && v.patientName.toLowerCase() === patient.name.toLowerCase())
    );
    if (anyPatientVisit) return anyPatientVisit;

    const todayStr = new Date().toISOString().split('T')[0];
    const nowTimeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    return {
      id: activeToken?.visitId || `vis-${patient.id}-${todayStr}`,
      patientId: patient.id,
      patientName: patient.name,
      doctorId: patient.assignedDoctorId || doctors[0]?.id || 'doc-1',
      doctorName: patient.assignedDoctorName || 'Dr. EBIN BRITTO. M.',
      visitDate: todayStr,
      checkInTime: nowTimeStr,
      status: 'In Consultation',
      tokenId: activeToken?.tokenNumber || patient.opNumber,
      priority: activeToken?.priority || 'Normal',
      reasonForVisit: patient.currentTreatment || 'General Dental Examination & Consultation',
      timeline: []
    };
  }, [activeVisit, checkoutVisit, visits, activeToken, patient, doctors]);

  // Resolve all invoices for this patient (merging patient.invoices and globalInvoices)
  const patientInvoices = useMemo(() => {
    const fromGlobal = globalInvoices.filter(
      (inv) => inv.patientId === patient.id ||
        (patient.opNumber && inv.patientOpNumber === patient.opNumber) ||
        (inv.patientName && patient.name && inv.patientName.toLowerCase() === patient.name.toLowerCase())
    );
    const fromPatient = patient.invoices || [];
    const map = new Map<string, Invoice>();
    [...fromPatient, ...fromGlobal].forEach((inv) => {
      if (inv && inv.id) map.set(inv.id, inv);
    });
    return Array.from(map.values());
  }, [patient.id, patient.opNumber, patient.name, patient.invoices, globalInvoices]);

  // Check for any doctor-approved fee on visits that has not yet been converted to an invoice
  const unbilledFeeApprovals = useMemo(() => {
    const patientVisits = visits.filter(
      (v) => v.patientId === patient.id || (v.patientName && patient.name && v.patientName.toLowerCase() === patient.name.toLowerCase())
    );
    return patientVisits
      .filter((v) => {
        if (!v.feeApproval || v.feeApproval.finalPayable <= 0) return false;
        const hasLinkedInvoice = patientInvoices.some(
          (inv) => inv.id === v.invoiceId || inv.feeApprovalId === v.feeApproval?.id || (v.feeApproval?.invoiceId && inv.id === v.feeApproval.invoiceId)
        );
        return !hasLinkedInvoice;
      })
      .map((v) => ({ visit: v, feeApproval: v.feeApproval! }));
  }, [patient.id, patient.name, visits, patientInvoices]);

  // Check for any completed / reception-stage visits that do not yet have an invoice
  // Default does NOT show 500. Only when doctor adds or approves a fee (v.feeApproval) is any amount shown.
  const pendingUnbilledVisits = useMemo(() => {
    return [];
  }, []);

  // Filter out treatment plans that are ALREADY billed in an invoice or approved in a fee authorization
  const unbilledTreatmentPlans = useMemo(() => {
    return (patient.treatmentPlans || []).filter((tp) => {
      if (tp.status === 'Billed' || tp.status === 'Completed') return false;
      const inInvoice = patientInvoices.some((inv) =>
        (inv.items || []).some((it) => it.description?.toLowerCase().trim() === tp.procedure?.toLowerCase().trim())
      );
      if (inInvoice) return false;
      const inFeeApproval = (effectiveVisit?.feeApproval?.items || []).some((it) =>
        it.description?.toLowerCase().trim() === tp.procedure?.toLowerCase().trim()
      );
      if (inFeeApproval) return false;
      return true;
    });
  }, [patient.treatmentPlans, patientInvoices, effectiveVisit?.feeApproval]);

  const isFeeAlreadyApproved = Boolean(
    effectiveVisit?.feeApproval?.status === 'Approved' ||
    effectiveVisit?.invoiceId ||
    patientInvoices.some((inv) => inv.feeApprovalId === effectiveVisit?.feeApproval?.id || (effectiveVisit?.id && inv.id === effectiveVisit?.invoiceId))
  );

  const hasAnyBilledFees = isFeeAlreadyApproved || patientInvoices.length > 0;
  const isAllInvoicesPaid = patientInvoices.length > 0 && patientInvoices.every((inv) => inv.status === 'Paid');
  const paidInvoicesAmount = patientInvoices.filter((inv) => inv.status === 'Paid').reduce((sum, inv) => sum + inv.total, 0);

  const approvedFeeAmount =
    effectiveVisit?.feeApproval?.finalPayable ||
    patientInvoices.find((inv) => inv.id === effectiveVisit?.invoiceId || inv.feeApprovalId === effectiveVisit?.feeApproval?.id)?.total;

  // Total invoice balance
  const invoiceBalance = patientInvoices.reduce((sum, inv) => sum + (inv.balance ?? (inv.total - (inv.paid || 0))), 0);
  // Total unbilled approved fees
  const unbilledFeesBalance = unbilledFeeApprovals.reduce((sum, item) => sum + item.feeApproval.finalPayable, 0);
  // Total unbilled pending visits
  const unbilledVisitsBalance = pendingUnbilledVisits.reduce((sum, item) => sum + item.amount, 0);

  // Real-time actual outstanding balance
  const actualOutstandingBalance = Math.max(
    patient.outstandingBalance || 0,
    invoiceBalance + unbilledFeesBalance + unbilledVisitsBalance
  );

  // Queue Token Generation State
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [tokenDoctorId, setTokenDoctorId] = useState<string>(patient.assignedDoctorId || doctors[0]?.id || 'doc-1');
  const [tokenPriority, setTokenPriority] = useState<'Normal' | 'Urgent' | 'Emergency'>('Normal');
  const [tokenReason, setTokenReason] = useState<string>(patient.currentTreatment || 'General Dental Examination & Consultation');
  const [isGeneratingToken, setIsGeneratingToken] = useState(false);

  useEffect(() => {
    if (patient) {
      setTokenDoctorId(patient.assignedDoctorId || doctors[0]?.id || 'doc-1');
      setTokenReason(patient.currentTreatment || 'General Dental Examination & Consultation');
    }
  }, [patient?.id]);

  const handleGenerateToken = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!patient) return;

    setIsGeneratingToken(true);
    try {
      const todayDate = new Date().toISOString().split('T')[0];
      const todayApt = appointments.find(
        (a) => (a.patientId === patient.id || a.patientPhone === patient.phone) &&
          a.date === todayDate && a.status !== 'Cancelled' && a.status !== 'Completed'
      );

      const result = await checkInPatient({
        patientId: patient.id,
        doctorId: tokenDoctorId || patient.assignedDoctorId || doctors[0]?.id || 'doc-1',
        priority: tokenPriority,
        reasonForVisit: tokenReason.trim() || patient.currentTreatment || 'General Dental Examination & Consultation',
        appointmentId: todayApt?.id,
        isWalkIn: !todayApt
      });

      setShowTokenModal(false);
      addToast('Queue Token Generated', `Token #${result.token.tokenNumber} issued for ${patient.name}.`, 'success');
    } catch (err: any) {
      addToast('Token Error', err.message || 'Failed to generate token.', 'danger');
    } finally {
      setIsGeneratingToken(false);
    }
  };

  // Clinical & Billing Modals State
  const [showCaseSheetModal, setShowCaseSheetModal] = useState(false);
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutTargetVisit, setCheckoutTargetVisit] = useState<ClinicVisit | null>(null);
  const [checkoutTargetInvoiceId, setCheckoutTargetInvoiceId] = useState<string | undefined>(undefined);
  const [checkoutTargetFeeApprovalId, setCheckoutTargetFeeApprovalId] = useState<string | undefined>(undefined);
  const [printablePrescriptionTarget, setPrintablePrescriptionTarget] = useState<PrescriptionRecord | null>(null);
  const [printableReceiptTarget, setPrintableReceiptTarget] = useState<PaymentRecord | null>(null);
  const [prescriptionToEdit, setPrescriptionToEdit] = useState<PrescriptionRecord | null>(null);

  // Unified patient digital prescriptions sorted newest first
  const patientPrescriptions = useMemo(() => {
    const list = (prescriptions || []).filter(
      (p) =>
        p.patientId === patient.id ||
        (patient.opNumber && p.patientOpNumber === patient.opNumber) ||
        (p.patientName && patient.name && p.patientName.toLowerCase() === patient.name.toLowerCase())
    );
    if (patient.prescriptions) {
      patient.prescriptions.forEach((rx) => {
        if (!list.some((existing) => existing.id === rx.id)) {
          list.push(rx);
        }
      });
    }
    return list.sort((a, b) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime());
  }, [prescriptions, patient.id, patient.opNumber, patient.name, patient.prescriptions]);

  // Determine if patient has completed clinical intake or is an established returning patient
  const isReturningPatient = Boolean(
    patient && (
      (patient.totalVisits && patient.totalVisits > 1) ||
      (patient.visits && patient.visits.length > 1) ||
      patient.status === 'Active Treatment' ||
      patient.status === 'Completed'
    )
  );

  const hasCompletedIntake = Boolean(
    patient?.caseSheetCompleted ||
    patient?.dentalHistory?.caseSheetCompleted ||
    patient?.dentalHistory?.completedAt ||
    isReturningPatient ||
    (patient?.id && (
      sessionStorage.getItem(`smilecare_intake_completed_${patient.id}`) === 'true' ||
      localStorage.getItem(`smilecare_intake_completed_${patient.id}`) === 'true'
    ))
  );

  // Determine if patient is visiting for the first time AND hasn't completed clinical intake yet
  const isFirstVisit = Boolean(
    patient &&
    !hasCompletedIntake &&
    !isReturningPatient &&
    (patient.totalVisits === 0 || patient.status === 'New Patient') &&
    (!patient.visits || patient.visits.length <= 1)
  );

  const prevPatientIdRef = useRef<string | null>(null);

  // Auto-open Clinical Intake Page Model for First-Visit Patients (ONLY if intake has not been completed yet)
  useEffect(() => {
    if (patient?.id) {
      const isNewPatientSelected = prevPatientIdRef.current !== patient.id;
      prevPatientIdRef.current = patient.id;

      // Do not auto-switch tabs on routine background state refresh if already viewing this patient
      if (!isNewPatientSelected && !shouldOpenCaseSheetOnProfile) {
        return;
      }

      const intakeKey = `smilecare_intake_viewed_${patient.id}`;
      if (!hasCompletedIntake && (shouldOpenCaseSheetOnProfile || (isFirstVisit && !sessionStorage.getItem(intakeKey)))) {
        setShowCaseSheetModal(true);
        sessionStorage.setItem(intakeKey, 'true');
        if (shouldOpenCaseSheetOnProfile) {
          setShouldOpenCaseSheetOnProfile(false);
        }
      } else if (shouldOpenCaseSheetOnProfile && hasCompletedIntake) {
        setShouldOpenCaseSheetOnProfile(false);
      }
    }
  }, [patient?.id, isFirstVisit, hasCompletedIntake, shouldOpenCaseSheetOnProfile]);

  // Edit Clinical Note Modal State
  const [editingClinicalNote, setEditingClinicalNote] = useState<ClinicalNote | null>(null);
  const [editNoteComplaint, setEditNoteComplaint] = useState('');
  const [editNoteFindings, setEditNoteFindings] = useState('');
  const [editNoteDiagnosis, setEditNoteDiagnosis] = useState('');
  const [editNoteTreatment, setEditNoteTreatment] = useState('');
  const [editNoteDoctorNotes, setEditNoteDoctorNotes] = useState('');
  const [editNoteNextVisit, setEditNoteNextVisit] = useState('');

  const handleConfirmConsultationComplete = () => {
    if (!activeVisit) return;
    completeConsultation(activeVisit.id, {
      diagnosis: compDiagnosis || 'Consultation Completed',
      treatmentPlan: compTreatment || patient.currentTreatment,
      notes: compNotes || 'Clinical examination and care completed.',
      followUpDate: compFollowUp || undefined
    });
    setShowCompleteModal(false);
  };

  // Chart modal state in Chart tab
  const [selectedToothForModal, setSelectedToothForModal] = useState<number | null>(null);

  // New Note Modal state
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [newChiefComplaint, setNewChiefComplaint] = useState('');
  const [newFindings, setNewFindings] = useState('');
  const [newDiagnosis, setNewDiagnosis] = useState('');
  const [newTreatmentDone, setNewTreatmentDone] = useState('');
  const [newDoctorNotes, setNewDoctorNotes] = useState('');
  const [newNextVisit, setNewNextVisit] = useState('');

  // New Lab Order state
  const [showAddLabModal, setShowAddLabModal] = useState(false);
  const [labTeethStr, setLabTeethStr] = useState('36');
  const [labType, setLabType] = useState<LabOrder['labType']>('Crown');
  const [labName, setLabName] = useState('Apex Precision Dental Lab');
  const [labInstructions, setLabInstructions] = useState('Monolithic Zirconia Crown, Shade A2');

  // Payment Recording state
  const [recordingInvoiceId, setRecordingInvoiceId] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(1000);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('UPI');
  const [paymentNotes, setPaymentNotes] = useState<string>('');
  const [activeProfileReceipt, setActiveProfileReceipt] = useState<PaymentRecord | null>(null);
  const [showProfileReceiptModal, setShowProfileReceiptModal] = useState<boolean>(false);

  // Unified chronological encounters timeline combining clinical notes and visits without duplicates
  const combinedTimeline = useMemo(() => {
    type TimelineItem = {
      id: string;
      date: string;
      doctorName: string;
      type: string;
      chiefComplaint: string;
      diagnosis: string;
      treatment: string;
      findings?: string;
      notes?: string;
      prescriptions?: Array<{ medicine: string; dosage: string; duration: string; instructions: string }>;
      prescriptionText?: string;
      followUp?: string;
    };

    const list: TimelineItem[] = (patient.clinicalNotes || []).map((cn) => ({
      id: cn.id,
      date: cn.date,
      doctorName: cn.doctorName || defaultDoctorName,
      type: 'Clinical Encounter',
      chiefComplaint: cn.chiefComplaint,
      diagnosis: cn.diagnosis,
      treatment: cn.treatmentPerformed,
      findings: cn.clinicalFindings,
      notes: cn.doctorNotes,
      prescriptions: cn.prescriptions,
      followUp: cn.nextVisitInstructions
    }));

    (patient.visits || []).forEach((vis) => {
      const alreadyExists = list.some((item) => item.date === vis.date);
      if (!alreadyExists) {
        list.push({
          id: vis.id,
          date: vis.date,
          doctorName: vis.doctorName || defaultDoctorName,
          type: vis.timelineType || 'Consultation Visit',
          chiefComplaint: vis.chiefComplaint,
          diagnosis: vis.diagnosis,
          treatment: vis.treatment,
          findings: vis.clinicalFindings,
          notes: vis.doctorNotes,
          prescriptionText: vis.prescription,
          followUp: vis.followUp
        });
      }
    });

    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [patient.clinicalNotes, patient.visits, patient.assignedDoctorName]);

  // Helper updates
  const handleUpdateTeeth = (updatedTeeth: ToothData[]) => {
    updatePatient({
      ...patient,
      dentalChart: updatedTeeth
    });
  };

  const handleAddTreatmentPlan = (item: Partial<TreatmentPlanItem>) => {
    const newItem: TreatmentPlanItem = {
      id: `tp-${Date.now()}`,
      patientId: patient.id,
      toothNumbers: item.toothNumbers || [],
      diagnosis: item.diagnosis || 'Clinical Diagnosis',
      procedure: item.procedure || 'Dental Treatment',
      priority: item.priority || 'Medium',
      estimatedCost: item.estimatedCost ?? 0,
      status: item.status || 'Proposed',
      doctorId: defaultDoctorId,
      doctorName: defaultDoctorName,
      notes: item.notes,
      prostheticDesign: item.prostheticDesign,
      createdAt: new Date().toISOString()
    };

    // Auto-update dentalChart tooth conditions to reflect the new treatment plan
    const updatedChart = [...(patient.dentalChart || [])];
    if (newItem.toothNumbers && newItem.toothNumbers.length > 0) {
      const procLower = (newItem.procedure || '').toLowerCase();
      const diagLower = (newItem.diagnosis || '').toLowerCase();
      let mappedCond: ToothCondition = 'Root Canal';
      let mappedCode = 'R';

      if (procLower.includes('root canal') || procLower.includes('rct') || diagLower.includes('pulpitis')) {
        mappedCond = 'Root Canal';
        mappedCode = 'R';
      } else if (procLower.includes('crown') || newItem.prostheticDesign?.restorationType === 'Crown') {
        mappedCond = 'Crown';
        mappedCode = 'CR';
      } else if (procLower.includes('filling') || procLower.includes('restoration') || procLower.includes('composite')) {
        mappedCond = 'Filling';
        mappedCode = 'F';
      } else if (procLower.includes('extract')) {
        mappedCond = 'Missing';
        mappedCode = 'X';
      } else if (procLower.includes('implant')) {
        mappedCond = 'Implant';
        mappedCode = 'I';
      } else if (procLower.includes('caries') || diagLower.includes('caries')) {
        mappedCond = 'Caries';
        mappedCode = 'C';
      }

      newItem.toothNumbers.forEach((tNum) => {
        const existingIdx = updatedChart.findIndex((t) => t.toothNumber === tNum);
        if (existingIdx >= 0) {
          updatedChart[existingIdx] = {
            ...updatedChart[existingIdx],
            condition: mappedCond,
            treatmentCode: mappedCode,
            treatmentStatus: newItem.status
          };
        } else {
          updatedChart.push({
            toothNumber: tNum,
            type: tNum >= 50 ? 'child' : 'adult',
            condition: mappedCond,
            treatmentCode: mappedCode,
            surfaces: { mesial: 'Healthy', distal: 'Healthy', occlusal: 'Healthy', buccal: 'Healthy', lingual: 'Healthy' },
            treatmentStatus: newItem.status
          });
        }
      });
    }

    updatePatient({
      ...patient,
      dentalChart: updatedChart,
      treatmentPlans: [newItem, ...patient.treatmentPlans]
    });
    addToast('Procedure Added', `${newItem.procedure} added to patient treatment plan.`, 'success');
  };

  const handleUpdateTreatmentStatus = (id: string, status: TreatmentPlanStatus) => {
    const updatedPlans = patient.treatmentPlans.map((tp) => (tp.id === id ? { ...tp, status } : tp));
    updatePatient({
      ...patient,
      treatmentPlans: updatedPlans
    });
    addToast('Treatment Status Updated', `Status set to ${status}.`, 'info');
  };

  const handleDeleteTreatmentPlan = (id: string) => {
    const updatedPlans = patient.treatmentPlans.filter((tp) => tp.id !== id);
    updatePatient({
      ...patient,
      treatmentPlans: updatedPlans
    });
    addToast('Procedure Removed', 'Item removed from treatment plan.', 'info');
  };

  const handleCreateClinicalNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDiagnosis.trim() && !newTreatmentDone.trim()) return;

    const newNote: ClinicalNote = {
      id: `cn-${Date.now()}`,
      patientId: patient.id,
      date: new Date().toISOString().split('T')[0],
      doctorName: defaultDoctorName,
      chiefComplaint: newChiefComplaint || 'Routine visit review',
      clinicalFindings: newFindings || 'Clinical review completed.',
      diagnosis: newDiagnosis || 'Monitored dental condition',
      treatmentPerformed: newTreatmentDone,
      doctorNotes: newDoctorNotes,
      nextVisitInstructions: newNextVisit
    };

    // Also add to chronological visits timeline
    const newVisitSnapshot = {
      id: `vis-${Date.now()}`,
      patientId: patient.id,
      date: new Date().toISOString().split('T')[0],
      doctorName: defaultDoctorName,
      chiefComplaint: newChiefComplaint || 'Follow-up consultation',
      clinicalFindings: newFindings,
      diagnosis: newDiagnosis,
      treatment: newTreatmentDone,
      doctorNotes: newDoctorNotes,
      followUp: newNextVisit,
      timelineType: 'Treatment' as const
    };

    updatePatient({
      ...patient,
      totalVisits: patient.totalVisits + 1,
      lastVisit: new Date().toISOString().split('T')[0],
      clinicalNotes: [newNote, ...patient.clinicalNotes],
      visits: [newVisitSnapshot, ...patient.visits]
    });

    setShowAddNoteModal(false);
    setNewChiefComplaint('');
    setNewFindings('');
    setNewDiagnosis('');
    setNewTreatmentDone('');
    setNewDoctorNotes('');
    setNewNextVisit('');
    addToast('Clinical Visit Saved', 'Clinical findings and treatment timeline recorded.', 'success');
  };

  const handleOpenEditNote = (noteId: string) => {
    const existing = patient.clinicalNotes.find((n) => n.id === noteId);
    if (existing) {
      setEditingClinicalNote(existing);
      setEditNoteComplaint(existing.chiefComplaint);
      setEditNoteDiagnosis(existing.diagnosis);
      setEditNoteFindings(existing.clinicalFindings);
      setEditNoteTreatment(existing.treatmentPerformed);
      setEditNoteDoctorNotes(existing.doctorNotes);
      setEditNoteNextVisit(existing.nextVisitInstructions);
    }
  };

  const handleSaveEditedNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClinicalNote) return;

    const updatedNote: ClinicalNote = {
      ...editingClinicalNote,
      chiefComplaint: editNoteComplaint,
      diagnosis: editNoteDiagnosis,
      clinicalFindings: editNoteFindings,
      treatmentPerformed: editNoteTreatment,
      doctorNotes: editNoteDoctorNotes,
      nextVisitInstructions: editNoteNextVisit
    };

    updatePatient({
      ...patient,
      clinicalNotes: patient.clinicalNotes.map((n) => (n.id === updatedNote.id ? updatedNote : n)),
      visits: patient.visits.map((v) =>
        v.id === updatedNote.id || v.date === updatedNote.date
          ? {
            ...v,
            chiefComplaint: editNoteComplaint,
            diagnosis: editNoteDiagnosis,
            clinicalFindings: editNoteFindings,
            treatment: editNoteTreatment,
            doctorNotes: editNoteDoctorNotes,
            followUp: editNoteNextVisit
          }
          : v
      )
    });

    setEditingClinicalNote(null);
    addToast('Clinical Note Updated', 'Saved modifications to clinical encounter.', 'success');
  };

  const handleDeleteClinicalNote = (noteId: string) => {
    if (!window.confirm('Are you sure you want to delete this clinical encounter record?')) return;

    updatePatient({
      ...patient,
      clinicalNotes: patient.clinicalNotes.filter((n) => n.id !== noteId),
      visits: patient.visits.filter((v) => v.id !== noteId)
    });
    setEditingClinicalNote(null);
    addToast('Note Deleted', 'Clinical encounter record removed.', 'info');
  };

  const handleEditTreatmentPlan = (updatedItem: TreatmentPlanItem) => {
    updatePatient({
      ...patient,
      treatmentPlans: patient.treatmentPlans.map((tp) => (tp.id === updatedItem.id ? updatedItem : tp))
    });
    addToast('Treatment Plan Saved', `Updated ${updatedItem.procedure}.`, 'success');
  };

  const handleCreateLabOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const toothNums = labTeethStr.split(',').map((s) => Number(s.trim())).filter((n) => !isNaN(n));
    const newOrder: LabOrder = {
      id: `lab-${Date.now()}`,
      patientId: patient.id,
      patientName: patient.name,
      doctorId: defaultDoctorId,
      doctorName: defaultDoctorName,
      toothNumbers: toothNums.length > 0 ? toothNums : [36],
      treatment: `${labType} Fabrication`,
      labName,
      labType,
      orderDate: new Date().toISOString().split('T')[0],
      expectedDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      instructions: labInstructions,
      status: 'Sent to Lab'
    };

    updatePatient({
      ...patient,
      labOrders: [newOrder, ...patient.labOrders]
    });
    setShowAddLabModal(false);
    addToast('Lab Order Dispatched', `Work order sent to ${labName}.`, 'success');
  };

  const handleRecordPayment = (invId: string) => {
    const amt = Number(paymentAmount) || 0;
    if (amt <= 0) {
      addToast('Invalid Amount', 'Please specify a valid payment amount.', 'danger');
      return;
    }

    const newReceipt = recordPayment({
      invoiceId: invId,
      amount: amt,
      paymentMethod: selectedPaymentMethod,
      notes: paymentNotes || `Counter payment recorded by ${currentUser.name}`,
      receivedBy: currentUser.name
    });

    const updatedInvoices = patient.invoices.map((inv) => {
      if (inv.id === invId) {
        const newPaid = inv.paid + amt;
        const newBalance = Math.max(0, inv.total - newPaid);
        return {
          ...inv,
          paid: newPaid,
          balance: newBalance,
          status: newBalance === 0 ? ('Paid' as const) : ('Partial' as const)
        };
      }
      return inv;
    });

    const newOutstanding = updatedInvoices.reduce((sum, inv) => sum + inv.balance, 0);

    updatePatient({
      ...patient,
      invoices: updatedInvoices,
      outstandingBalance: newOutstanding
    });

    setRecordingInvoiceId(null);
    setPaymentNotes('');
    if (newReceipt) {
      setActiveProfileReceipt(newReceipt);
      setShowProfileReceiptModal(true);
    }
    addToast('Payment Recorded', `₹${amt} collected via ${selectedPaymentMethod}. Official receipt generated.`, 'success');
  };

  const [isGeneratingVisitBill, setIsGeneratingVisitBill] = useState(false);

  const handleGenerateBillForVisit = async (
    v: ClinicVisit,
    items: Array<{ description: string; quantity: number; unitPrice: number }>
  ) => {
    setIsGeneratingVisitBill(true);
    try {
      const inv = await createInvoice({
        visitId: v.id,
        patientId: patient.id,
        patientName: patient.name,
        doctorName: v.doctorName || patient.assignedDoctorName || 'Dr. DOCTOR TEST',
        items: items.map((it) => ({
          description: it.description,
          quantity: it.quantity || 1,
          unitPrice: it.unitPrice || 0
        })),
        discount: 0,
        tax: 0
      });
      addToast('Bill Generated', `Official invoice ${inv.id} created for ₹${inv.total.toLocaleString()}.`, 'success');
    } catch (err: any) {
      addToast('Billing Error', err.message || 'Could not generate bill.', 'danger');
    } finally {
      setIsGeneratingVisitBill(false);
    }
  };

  return (
    <div className="workspace w-full max-w-full mx-auto px-2.5 sm:px-4 lg:px-6 py-3 sm:py-5 flex flex-col lg:flex-row gap-4 lg:gap-6">
      <Sidebar type="admin" />

      <main className="patient-chart-workspace flex-1 min-w-0 space-y-3">
        <section className="profile-masthead" aria-label="Patient chart">
          <div className="profile-route-actions">
            <button type="button" className="profile-compact-action" onClick={() => setActiveView('admin-patients')}>
              <ArrowLeft size={15} aria-hidden="true" /> Directory
            </button>
            <label className="profile-switch-patient">
              Switch patient <span aria-hidden="true">▾</span>
              <select aria-label="Switch patient" value={patient.id} onChange={event => {
                const found = patients.find(record => record.id === event.target.value);
                if (found) {
                  setSelectedPatientForDetail(found);
                  addToast('Patient Switched', `Viewing ${found.name}'s record.`, 'info');
                }
              }}>
                {patients.map(record => <option key={record.id} value={record.id}>
                  {record.name} ({record.id}) — {record.age}y / {record.gender}
                </option>)}
              </select>
            </label>
          </div>
          <div className="profile-masthead-body">
            <div className="profile-person">
              <span className="profile-monogram" aria-hidden="true">{patient.name.charAt(0)}</span>
              <div>
                <h1>{patient.name}</h1>
                <p>{patient.opNumber || patient.id} · {patient.age} yrs · {patient.gender}</p>
              </div>
            </div>
            <dl className="profile-masthead-facts">
              <div><dt>Doctor</dt><dd>{patient.assignedDoctorName || 'Unassigned'}</dd></div>
              <div><dt>Ledger balance</dt><dd>₹{actualOutstandingBalance.toLocaleString()}</dd></div>
              {activeTab !== 'overview' && <>
                <div><dt>Procedure</dt><dd>{patient.currentTreatment || 'None recorded'}</dd></div>
                <div><dt>Phone</dt><dd>{patient.phone || '—'}</dd></div>
              </>}
            </dl>
            {activeTab !== 'overview' && <div className="flex items-center gap-2 self-start lg:self-center shrink-0">
              {activeToken ? (
                <div className="flex items-center gap-1.5">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-medium border flex items-center gap-1.5 ${
                    activeToken.status === 'In Consultation'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : activeToken.status === 'Called'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : activeToken.status === 'Reception Follow-up'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-sky-50 text-sky-800 border-sky-200'
                  }`}>
                    <Activity className="w-3.5 h-3.5 text-teal-600" />
                    <span>Token #{activeToken.tokenNumber}</span>
                    <span className="text-[11px] opacity-75 font-normal">({activeToken.status})</span>
                  </span>
                  <button
                    onClick={() => setActiveView('token-control')}
                    className="px-2.5 py-1 rounded-md bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium transition-colors cursor-pointer border border-slate-200"
                    title="View Waiting Queue"
                  >
                    Queue ↗
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowTokenModal(true)}
                  className="px-3 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
                  title="Generate Queue Token for today's visit"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>+ Issue Token</span>
                </button>
              )}
            </div>}
          </div>

          <div className="profile-command-bar" role="group" aria-label="Clinical actions">
            <div className="profile-commands">
              {/* Clinical Case Sheet */}
              <button
                onClick={() => setShowCaseSheetModal(true)}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors shrink-0 whitespace-nowrap"
                title="Open Doctor Clinical Intake, HOPI, Medical & Dental History Case Sheet"
              >
                <ClipboardList className="w-3.5 h-3.5 text-teal-400" />
                <span>Clinical Case Sheet</span>
              </button>

              {(currentUser.role === 'doctor' || currentUser.role === 'admin') && (
                <>
                  <button
                    onClick={() => {
                      const existingRx = effectiveVisit?.prescriptionRecord ||
                        patientPrescriptions.find((p) => p.visitId === effectiveVisit?.id) ||
                        patientPrescriptions[0];
                      setPrescriptionToEdit(existingRx || null);
                      setShowPrescriptionModal(true);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors shrink-0 whitespace-nowrap"
                    title={patientPrescriptions.length > 0 ? "View / Edit or issue digital prescription" : "Write digital prescription"}
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                    <span>+ Write Rx{patientPrescriptions.length > 0 ? ` (${patientPrescriptions.length})` : ''}</span>
                  </button>

                  {isAllInvoicesPaid ? (
                    <button
                      onClick={() => setShowFeeModal(true)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs shrink-0 whitespace-nowrap"
                      title="Previous fee is fully paid and settled. Click to add next visit fee."
                    >
                      <Plus className="w-3.5 h-3.5 text-emerald-700" />
                      <span>+ Add Fee</span>
                      <span className="text-[10px] bg-emerald-200/90 text-emerald-950 px-1.5 py-0.2 rounded font-black">
                        ✓ Paid ₹{paidInvoicesAmount.toLocaleString()}
                      </span>
                    </button>
                  ) : hasAnyBilledFees ? (
                    <button
                      onClick={() => setShowFeeModal(true)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs shrink-0 whitespace-nowrap"
                      title="Previous fee already sent to Billing & Invoices. Click to add next visit fee or review."
                    >
                      <Plus className="w-3.5 h-3.5 text-emerald-700" />
                      <span>+ Add Fee</span>
                      <span className="text-[10px] bg-emerald-200/80 text-emerald-900 px-1.5 py-0.2 rounded font-black">
                        ✓ Billed {approvedFeeAmount ? `₹${approvedFeeAmount.toLocaleString()}` : ''}
                      </span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowFeeModal(true)}
                      className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors shrink-0 whitespace-nowrap"
                      title="Approve fees and apply discounts"
                    >
                      <DollarSign className="w-3.5 h-3.5 text-slate-500" />
                      <span>+ Approve Fees</span>
                    </button>
                  )}
                </>
              )}

              <button
                onClick={() => setShowAddNoteModal(true)}
                className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors shrink-0 whitespace-nowrap"
                title="Record clinical note and findings"
              >
                <Stethoscope className="w-3.5 h-3.5 text-slate-500" />
                <span>+ Record Note</span>
              </button>

              {activeVisit && (
                <button
                  onClick={() => setShowCompleteModal(true)}
                  className="px-3 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors shrink-0 whitespace-nowrap"
                  title="Finalize consultation and hand off to reception"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-300" />
                  <span>Finish Visit</span>
                </button>
              )}

              {checkoutVisit && (
                <button
                  onClick={() => {
                    setCheckoutTargetVisit(checkoutVisit);
                    setCheckoutTargetInvoiceId(checkoutVisit.invoiceId);
                    setCheckoutTargetFeeApprovalId(checkoutVisit.feeApproval?.id);
                    setShowCheckoutModal(true);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shrink-0 whitespace-nowrap"
                  title="Settle payment and checkout patient"
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>Settle & Checkout</span>
                </button>
              )}
            </div>
          </div>
        </section>

        {/* PROMINENT MEDICAL & ALLERGY ALERT WARNING BANNER */}
        {(patient.medicalHistory?.allergies?.length > 0 || patient.medicalHistory?.hasDiabetes || patient.medicalHistory?.hasBloodPressure || patient.medicalHistory?.hasHeartConditions) && (
          <div className="profile-safety-alert">
            <div><ShieldAlert size={16} aria-hidden="true" /><strong>Medical alerts</strong></div>
            <p>{[
              patient.medicalHistory.allergies?.length && 'Allergies: ' + patient.medicalHistory.allergies.join(', '),
              patient.medicalHistory.hasDiabetes && 'Type 2 Diabetes',
              patient.medicalHistory.hasBloodPressure && 'Hypertension',
              patient.medicalHistory.hasHeartConditions && 'Cardiovascular alert'
            ].filter(Boolean).join(' · ')}</p>
            {patient.medicalHistory.currentMedications?.length > 0 && (
              <div className="text-xs text-rose-800 font-normal">
                Current Medications: <strong>{patient.medicalHistory.currentMedications.join(', ')}</strong>
              </div>
            )}
          </div>
        )}

        {/* FIRST VISIT CLINICAL INTAKE NOTICE BANNER */}
        {isFirstVisit && !showCaseSheetModal && (
          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 border border-amber-200 text-amber-800 flex items-center justify-center shrink-0">
                <ClipboardList className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200">
                    First Visit Clinical Intake Required
                  </span>
                  <span className="text-xs font-medium text-slate-700">
                    {patient.name} ({patient.opNumber || patient.id})
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  This patient is visiting for the first time. Complete the Clinical Case Sheet (Chief Complaint, HOPI, Medical History, Allergies &amp; Dental History) to establish their baseline EMR.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowCaseSheetModal(true)}
              className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium flex items-center gap-2 shrink-0 cursor-pointer transition-colors"
            >
              <ClipboardList className="w-4 h-4 text-amber-300" />
              <span>Fill First Visit Intake Form</span>
            </button>
          </div>
        )}

        <SectionPicker label="Chart section" value={activeTab} onChange={handleTabChange} options={[
          { id: 'overview', label: 'Overview & History' }, { id: 'chart', label: '3D Dental Chart' },
          { id: 'prescriptions', label: 'Prescriptions', count: patientPrescriptions.length },
          { id: 'treatment-plan', label: 'Treatment Plans', count: patient.treatmentPlans.length },
          { id: 'visits-notes', label: 'Visits & Notes', count: patient.clinicalNotes.length || patient.visits.length },
          { id: 'lab-orders', label: 'Lab Orders', count: patient.labOrders.length },
          { id: 'billing', label: 'Billing & Invoices', count: patientInvoices.length + unbilledFeeApprovals.length },
          { id: 'documents', label: 'Documents', count: patient.documents.length },
        ]} />

        {/* ==================================================== */}
        {/* TAB 1: PATIENT OVERVIEW                              */}
        {/* ==================================================== */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <section className="profile-overview-card" aria-label="Patient overview">
              <div className="profile-overview-body">
                <h2 className="profile-overview-title">Visit overview</h2>
                <dl className="profile-visit-details">
                  <div><dt>Patient ID</dt><dd>{patient.id}</dd></div>
                  <div><dt>Phone</dt><dd>{patient.phone || '—'}</dd></div>
                  <div><dt>Last visit</dt><dd>{patient.lastVisit || '—'}</dd></div>
                </dl>
                <dl className="profile-care-summary">
                  <div><dt>Active procedure</dt><dd>{patient.currentTreatment || 'None recorded'}</dd></div>
                  <div><dt>Outstanding fee</dt><dd className={patient.outstandingBalance > 0 ? 'balance-due' : ''}>₹{patient.outstandingBalance.toLocaleString()}</dd></div>
                  <div className="profile-token-row">
                    <dt>Queue token</dt>
                    <dd>
                      {activeToken ? (
                        <button type="button" className="profile-token profile-compact-action" onClick={() => setActiveView('token-control')} title="View waiting queue">
                          <strong>#{activeToken.tokenNumber}</strong> {activeToken.status} <ArrowRight size={14} aria-hidden="true" />
                        </button>
                      ) : (
                        <button type="button" className="profile-compact-action" onClick={() => setShowTokenModal(true)}>
                          <Plus size={15} aria-hidden="true" /> Issue token
                        </button>
                      )}
                    </dd>
                  </div>
                </dl>
              </div>
            </section>

            <dl className="profile-visit-stats" aria-label="Visit summary">
              <div><dt>First visit</dt><dd>{patient.firstVisitDate || '—'}</dd></div>
              <div><dt>Completed visits</dt><dd>{patient.totalVisits}</dd></div>
              <div><dt>Active treatments</dt><dd>{patient.treatmentPlans.filter(t => t.status === 'In Progress' || t.status === 'Accepted').length}</dd></div>
              <div><dt>Next follow-up</dt><dd>{patient.followUps[0]?.date || patient.upcomingAppointmentDate || 'Unscheduled'}</dd>
                {patient.followUps[0]?.reason && <dd className="profile-follow-up-reason">{patient.followUps[0].reason}</dd>}
              </div>
            </dl>

            <div className="profile-histories">
              <section className="profile-history-card">
                <div className="profile-section-heading">
                  <h3>Medical history &amp; alerts</h3>
                  <div className="profile-heading-actions">
                    <button type="button" className="profile-compact-action" onClick={() => setShowCaseSheetModal(true)}>
                      <Edit3 size={15} aria-hidden="true" /> Edit medical &amp; Rx
                    </button>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="font-semibold text-slate-500 block text-[11px]">Allergies:</span>
                    <p className="font-bold text-rose-700 mt-0.5">
                      {patient.medicalHistory.allergies.length > 0 ? patient.medicalHistory.allergies.join(', ') : 'No known drug allergies (NKDA)'}
                    </p>
                  </div>

                  <div>
                    <span className="font-semibold text-slate-500 block text-[11px]">Diagnosed Medical Conditions:</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {patient.medicalHistory.conditions.length > 0 ? (
                        patient.medicalHistory.conditions.map((c, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-semibold text-xs">
                            {c}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-500 font-medium">None reported</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="font-semibold text-slate-500 block text-[11px]">Current Medications:</span>
                    <p className="font-medium text-slate-700 mt-0.5">
                      {patient.medicalHistory.currentMedications?.length > 0 ? patient.medicalHistory.currentMedications.join(', ') : 'None'}
                    </p>
                  </div>

                  {patient.medicalHistory.otherNotes && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="font-semibold text-slate-500 block text-[11px] mb-0.5">Doctor Precaution Notes:</span>
                      <p className="text-slate-700 font-medium leading-relaxed">
                        {patient.medicalHistory.otherNotes}
                      </p>
                    </div>
                  )}
                </div>
              </section>

              <section className="profile-history-card">
                <div className="profile-section-heading">
                  <h3>Chief dental complaint &amp; history</h3>
                  <div className="profile-heading-actions">
                    {hasCompletedIntake && <span className="profile-saved"><CheckCircle2 size={14} aria-hidden="true" />Case sheet saved</span>}
                    <button type="button" className="profile-compact-action" onClick={() => setShowCaseSheetModal(true)}>
                      <Edit3 size={15} aria-hidden="true" /> Edit case sheet
                    </button>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-teal-50/50 rounded-xl border border-teal-100">
                    <span className="font-semibold text-teal-800 block text-[11px] mb-0.5">Chief Dental Complaint:</span>
                    <p className="font-bold text-slate-900 leading-snug">
                      "{patient.dentalHistory.currentComplaint || patient.currentTreatment || 'General Dental Examination & Consultation'}"
                    </p>
                  </div>

                  {patient.dentalHistory.historyOfPresentIllness && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="font-semibold text-slate-700 block text-[11px] mb-0.5">
                        History of Present Illness (HOPI):
                      </span>
                      <p className="text-slate-800 font-medium leading-relaxed text-xs">
                        {patient.dentalHistory.historyOfPresentIllness}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="font-semibold text-slate-500 block text-[11px]">Last Dental Visit:</span>
                      <p className="font-semibold text-slate-700 mt-0.5">{patient.dentalHistory.lastDentalVisit || 'Not reported / First visit'}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-500 block text-[11px]">Previous Practice / Dentist:</span>
                      <p className="font-semibold text-slate-700 mt-0.5">{patient.dentalHistory.previousDentist || 'None recorded'}</p>
                    </div>
                  </div>

                  {patient.dentalHistory.previousTreatments && patient.dentalHistory.previousTreatments.length > 0 && (
                    <div>
                      <span className="font-semibold text-slate-500 block text-[11px] mb-1">Previous Dental Procedures & Restorations:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {patient.dentalHistory.previousTreatments.map((t, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded-lg bg-teal-50 text-teal-800 border border-teal-200 text-xs font-semibold">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <span className="font-semibold text-slate-500 block text-[11px] mb-1">Oral Habits & Risk Factors:</span>
                    {patient.dentalHistory.habits && patient.dentalHistory.habits.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {patient.dentalHistory.habits.map((h, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-800 border border-slate-200 text-xs font-semibold">
                            {h}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="font-medium text-slate-600">No adverse oral habits or risk factors reported.</p>
                    )}
                  </div>

                  {patient.dentalHistory.notes && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="font-semibold text-slate-500 block text-[11px] mb-0.5">Doctor Dental Intake Notes:</span>
                      <p className="text-slate-700 font-medium leading-relaxed">
                        {patient.dentalHistory.notes}
                      </p>
                    </div>
                  )}

                  <div>
                    <span className="font-semibold text-slate-500 block text-[11px]">Attending Doctor:</span>
                    <p className="font-bold text-teal-800 mt-0.5">
                      {patient.assignedDoctorName}
                    </p>
                  </div>
                </div>
              </section>
            </div>

            {/* Dental Odontogram Condition Summary Card on Overview */}
            {(() => {
              const isChildPatient = Boolean(patient.age && patient.age < 12);
              const dentitionTotal = isChildPatient ? 20 : 32;
              const chartTeeth = patient.dentalChart || [];
              const relevantOdontogramTeeth = chartTeeth.filter((t) => (isChildPatient ? t.toothNumber >= 50 : t.toothNumber < 50));

              // Find teeth with any active clinical condition or planned treatment
              const treatedTeethList = relevantOdontogramTeeth.filter((t) => {
                const hasSurfaceAnomaly = t.surfaces && Object.values(t.surfaces).some((v) => v && v !== 'Healthy');
                return (t.condition && t.condition !== 'Healthy') || t.treatmentCode || hasSurfaceAnomaly;
              });

              const cariesCount = relevantOdontogramTeeth.filter(
                (t) => t.condition === 'Caries' || t.treatmentCode === 'C' || (t.surfaces && Object.values(t.surfaces).some((v) => v === 'Caries'))
              ).length;
              const rctCount = relevantOdontogramTeeth.filter(
                (t) => t.condition === 'Root Canal' || t.treatmentCode === 'R' || (t.surfaces && Object.values(t.surfaces).some((v) => v === 'Root Canal'))
              ).length;
              const fillingCount = relevantOdontogramTeeth.filter(
                (t) => t.condition === 'Filling' || t.treatmentCode === 'F' || (t.surfaces && Object.values(t.surfaces).some((v) => v === 'Filling'))
              ).length;
              const crownCount = relevantOdontogramTeeth.filter(
                (t) => t.condition === 'Crown' || t.treatmentCode === 'CR' || (t.surfaces && Object.values(t.surfaces).some((v) => v === 'Crown'))
              ).length;
              const missingCount = relevantOdontogramTeeth.filter(
                (t) => t.condition === 'Missing' || t.treatmentCode === 'X' || (t.surfaces && Object.values(t.surfaces).some((v) => v === 'Missing'))
              ).length;
              const fractureCount = relevantOdontogramTeeth.filter(
                (t) => t.condition === 'Fracture' || t.treatmentCode === 'FR' || (t.surfaces && Object.values(t.surfaces).some((v) => v === 'Fracture'))
              ).length;

              const anomalyCount = relevantOdontogramTeeth.filter((t) => {
                const hasSurfaceAnomaly = t.surfaces && Object.values(t.surfaces).some((v) => v && v !== 'Healthy');
                return (t.condition && t.condition !== 'Healthy') || (t.treatmentCode && t.treatmentCode !== '') || hasSurfaceAnomaly;
              }).length;
              const healthyCount = Math.max(0, dentitionTotal - anomalyCount);

              return (
                <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-teal-50 text-teal-700">
                        <Stethoscope className="w-4 h-4" />
                      </span>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">
                          Tooth condition summary
                        </h4>

                      </div>
                    </div>
                    <button
                      onClick={() => handleTabChange('chart')}
                      className="px-3 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
                    >
                      <Stethoscope className="w-3.5 h-3.5" />
                      <span>Open 3D Dental Chart</span>
                      <span>→</span>
                    </button>
                  </div>

                  <div className="profile-tooth-counts">
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-center">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Healthy</span>
                      <span className="text-base font-bold tabular-nums text-slate-700">
                        {healthyCount}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-center">
                      <span className="text-[10px] font-bold text-rose-600 uppercase block">Caries</span>
                      <span className="text-base font-bold tabular-nums text-rose-700">
                        {cariesCount}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-teal-50 border border-teal-200 text-center">
                      <span className="text-[10px] font-bold text-teal-700 uppercase block">Root Canal</span>
                      <span className="text-base font-bold tabular-nums text-teal-800">
                        {rctCount}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-cyan-50 border border-cyan-200 text-center">
                      <span className="text-[10px] font-bold text-cyan-700 uppercase block">Fillings</span>
                      <span className="text-base font-bold tabular-nums text-cyan-800">
                        {fillingCount}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-center">
                      <span className="text-[10px] font-bold text-amber-600 uppercase block">Crowns</span>
                      <span className="text-base font-bold tabular-nums text-amber-700">
                        {crownCount}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-orange-50 border border-orange-200 text-center">
                      <span className="text-[10px] font-bold text-orange-600 uppercase block">Fracture</span>
                      <span className="text-base font-bold tabular-nums text-orange-700">
                        {fractureCount}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-100 border border-slate-300 text-center">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Missing</span>
                      <span className="text-base font-bold tabular-nums text-slate-600">
                        {missingCount}
                      </span>
                    </div>
                  </div>

                  {/* Individual Treated & Planned Teeth Badges */}
                  {treatedTeethList.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-semibold text-slate-600">
                        Identified Tooth Treatments ({treatedTeethList.length}):
                      </span>
                      {treatedTeethList.map((t) => {
                        const plan = patient.treatmentPlans.find((tp) => tp.toothNumbers?.includes(t.toothNumber));
                        return (
                          <button
                            key={t.toothNumber}
                            type="button"
                            onClick={() => {
                              setSelectedToothForModal(t.toothNumber);
                              handleTabChange('chart');
                            }}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-300 transition-colors cursor-pointer"
                            title="Click to inspect tooth in 3D Dental Chart"
                          >
                            <span className="font-mono">Tooth #{t.toothNumber}</span>
                            <span className="px-1.5 py-0.2 rounded bg-teal-700 text-white text-[10px] font-black uppercase">
                              {t.condition}
                            </span>
                            {plan && (
                              <span className="text-[11px] text-teal-700 font-medium">
                                • {plan.procedure} ({plan.status})
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* DEDICATED DIGITAL CLINICAL PRESCRIPTIONS (℞) CARD */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 rounded-xl bg-teal-50 text-teal-800 border border-teal-200 shrink-0">
                    <FileText className="w-4 h-4 text-teal-700" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">
                        Digital Clinical Prescriptions (℞)
                      </h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                        {patientPrescriptions.length} Recorded
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Doctor-authorized medication orders on official Shriya Clinic letterhead with PDF export &amp; print.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPrescriptionToEdit(null);
                      setShowPrescriptionModal(true);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Issue New Prescription</span>
                  </button>
                </div>
              </div>

              {patientPrescriptions.length === 0 ? (
                <div className="p-6 text-center rounded-xl bg-slate-50 border border-dashed border-slate-300 space-y-2">
                  <p className="text-xs font-semibold text-slate-600">
                    No clinical prescriptions recorded yet for {patient.name}.
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Click "+ Issue New Prescription" to prescribe antibiotics, analgesics, or dental rinses.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {patientPrescriptions.map((rx) => (
                    <div
                      key={rx.id}
                      className="p-4 rounded-xl border border-slate-200 bg-white hover:border-teal-300 transition-all shadow-2xs space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-bold text-xs text-teal-900 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                            {rx.id}
                          </span>
                          <span className="text-xs font-semibold text-slate-600">
                            📅 {rx.date}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="text-xs font-bold text-slate-700">
                            Dr: {rx.doctorName}
                          </span>
                          {rx.diagnosis && (
                            <span className="text-xs text-amber-900 bg-amber-50 px-2 py-0.5 rounded font-medium border border-amber-200">
                              Indication: {rx.diagnosis}
                            </span>
                          )}
                        </div>

                        {/* Action buttons: View, Download PDF, Edit, Delete */}
                        <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                          <button
                            type="button"
                            onClick={() => setPrintablePrescriptionTarget(rx)}
                            className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                            title="Preview official prescription pad"
                          >
                            <Eye className="w-3.5 h-3.5 text-teal-700" />
                            <span>View / Pad</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setPrintablePrescriptionTarget(rx)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                            title="Download prescription PDF"
                          >
                            <Download className="w-3.5 h-3.5 text-emerald-700" />
                            <span>PDF 📥</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setPrescriptionToEdit(rx);
                              setShowPrescriptionModal(true);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                            title="Edit this prescription"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-slate-600" />
                            <span>Edit ✏️</span>
                          </button>

                          <button
                            type="button"
                            onClick={async () => {
                              if (window.confirm(`Are you sure you want to delete prescription ${rx.id}?`)) {
                                await deletePrescription(rx.id);
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer transition-colors"
                            title="Delete prescription"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Prescribed Medications list */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {(rx.items || []).map((med, mIdx) => (
                          <div
                            key={med.id || mIdx}
                            className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900 truncate">
                                {mIdx + 1}. {med.medicine}
                              </span>
                              {med.dosage && (
                                <span className="text-[10px] font-mono font-bold text-teal-800 bg-teal-50 px-1.5 py-0.2 rounded border border-teal-200">
                                  {med.dosage}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                              <span className="bg-slate-200 text-slate-700 px-1 py-0.2 rounded font-bold text-[10px]">
                                {med.frequency}
                              </span>
                              <span>•</span>
                              <span>{med.duration}</span>
                              <span>•</span>
                              <span className="text-slate-700 italic">{med.instructions}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Doctor Notes / Advice */}
                      {rx.doctorNotes && (
                        <div className="p-2.5 rounded-lg bg-amber-50/60 border border-amber-200 text-xs text-amber-950">
                          <span className="font-bold block text-[11px] text-amber-900">Doctor Advice:</span>
                          <span className="font-medium">{rx.doctorNotes}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* DEDICATED PRESCRIPTIONS TAB CONTENT                   */}
        {/* ==================================================== */}
        {activeTab === 'prescriptions' && (
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="p-2.5 rounded-xl bg-teal-50 text-teal-800 border border-teal-200 shrink-0">
                    <FileText className="w-5 h-5 text-teal-700" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">
                        Digital Clinical Prescriptions (℞)
                      </h3>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                        {patientPrescriptions.length} Total Issued
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Medication orders recorded on official Shriya Clinic letterhead. Ready to view, edit, print, or download as PDF.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setPrescriptionToEdit(null);
                    setShowPrescriptionModal(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Issue New Prescription</span>
                </button>
              </div>

              {patientPrescriptions.length === 0 ? (
                <div className="p-10 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-300 space-y-2">
                  <FileText className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-sm font-bold text-slate-700">No Prescriptions Recorded Yet</p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    No medications have been prescribed for {patient.name}. Click "+ Issue New Prescription" to compose and print on official clinic letterhead.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {patientPrescriptions.map((rx, rxIndex) => (
                    <div
                      key={rx.id}
                      className="p-5 rounded-2xl border-2 border-slate-200 hover:border-teal-400 bg-white transition-all shadow-sm space-y-4"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-black text-sm text-blue-900 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                              Rx #{rx.id}
                            </span>
                            {rxIndex === 0 && (
                              <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full">
                                Latest Prescription
                              </span>
                            )}
                            <span className="text-xs font-semibold text-slate-500">
                              📅 Date: <strong className="text-slate-800">{rx.date}</strong>
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className="text-xs font-semibold text-slate-500">
                              Doctor: <strong className="text-slate-800">{rx.doctorName}</strong>
                            </span>
                          </div>

                          {rx.diagnosis && (
                            <p className="text-xs font-bold text-slate-700 mt-1.5 flex items-center gap-1.5">
                              <span className="text-slate-500 font-medium">Diagnosis / Indication:</span>
                              <span className="text-teal-900 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                                {rx.diagnosis}
                              </span>
                            </p>
                          )}
                        </div>

                        {/* Direct Action Buttons */}
                        <div className="flex items-center gap-2 shrink-0 flex-wrap">
                          <button
                            type="button"
                            onClick={() => setPrintablePrescriptionTarget(rx)}
                            className="px-3.5 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5 text-teal-700" />
                            <span>View / Pad Preview</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setPrintablePrescriptionTarget(rx)}
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download PDF 📥</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setPrescriptionToEdit(rx);
                              setShowPrescriptionModal(true);
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-slate-600" />
                            <span>Edit Rx ✏️</span>
                          </button>

                          <button
                            type="button"
                            onClick={async () => {
                              if (window.confirm(`Are you sure you want to delete prescription ${rx.id}?`)) {
                                await deletePrescription(rx.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 border border-transparent hover:border-rose-200 cursor-pointer transition-colors"
                            title="Delete prescription"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Medications Table / Cards */}
                      <div>
                        <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 block mb-2">
                          Prescribed Medications ({rx.items?.length || 0})
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                          {(rx.items || []).map((med, idx) => (
                            <div
                              key={med.id || idx}
                              className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5"
                            >
                              <div className="flex items-center justify-between gap-1">
                                <span className="font-bold text-slate-900 text-xs truncate">
                                  {idx + 1}. {med.medicine}
                                </span>
                                {med.dosage && (
                                  <span className="text-[10px] font-mono font-black text-teal-800 bg-teal-50 px-1.5 py-0.2 rounded border border-teal-200 shrink-0">
                                    {med.dosage}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 text-[11px] text-slate-600 font-medium flex-wrap">
                                <span className="bg-slate-200 text-slate-800 px-1.5 py-0.2 rounded font-bold text-[10px]">
                                  {med.frequency}
                                </span>
                                <span>•</span>
                                <span>{med.duration}</span>
                                <span>•</span>
                                <span className="text-slate-800 font-semibold">{med.instructions}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Doctor Notes & Follow Up */}
                      {(rx.doctorNotes || rx.followUpDate) && (
                        <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                          {rx.doctorNotes && (
                            <div>
                              <span className="font-bold text-amber-900 block text-[11px]">Doctor Advice / Precautions:</span>
                              <span className="text-slate-800 font-medium">{rx.doctorNotes}</span>
                            </div>
                          )}
                          {rx.followUpDate && (
                            <div className="shrink-0 sm:text-right">
                              <span className="font-bold text-amber-900 block text-[11px]">Recommended Review Date:</span>
                              <span className="text-slate-900 font-bold">{rx.followUpDate}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 3: DENTAL CHART / ODONTOGRAM                     */}
        {/* ==================================================== */}
        {activeTab === 'chart' && (
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-800 text-[11px] font-bold border border-sky-200 mb-1">
                  <Stethoscope className="w-3.5 h-3.5" />
                  <span>3D Odontogram & Anatomy</span>
                </div>
                <h2 className="text-base font-bold text-slate-900">
                  Interactive Dental Chart — {patient.name}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Click any tooth below to examine surfaces (M, D, O, B, L), record caries, crowns, fillings, or extractions.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleTabChange('treatment-plan')}
                  className="px-3 py-1.5 rounded-md bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                >
                  <Layers className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Treatment Plans</span>
                </button>
                <button
                  onClick={() => setShowAddNoteModal(true)}
                  className="px-3 py-1.5 rounded-md bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>+ Clinical Note</span>
                </button>
              </div>
            </div>

            <DentalChart
              teeth={patient.dentalChart}
              selectedToothNumber={selectedToothForModal}
              onSelectTooth={(num) => setSelectedToothForModal(num)}
            />

            <TreatmentLegend />

            {selectedToothForModal && (
              <ToothDetailModal
                tooth={patient.dentalChart.find((t) => t.toothNumber === selectedToothForModal) || {
                  toothNumber: selectedToothForModal,
                  type: selectedToothForModal >= 50 ? 'child' : 'adult',
                  condition: 'Healthy',
                  surfaces: {}
                }}
                isOpen={!!selectedToothForModal}
                onClose={() => setSelectedToothForModal(null)}
                onSaveTooth={(updated) => {
                  const currentTeeth = Array.isArray(patient.dentalChart) ? patient.dentalChart : [];
                  const exists = currentTeeth.some((t) => t.toothNumber === updated.toothNumber);
                  const updatedChart = exists
                    ? currentTeeth.map((t) => (t.toothNumber === updated.toothNumber ? updated : t))
                    : [...currentTeeth, updated];
                  handleUpdateTeeth(updatedChart);
                }}
                onAddTreatmentPlanItem={handleAddTreatmentPlan}
              />
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 4: TREATMENT PLAN MODULE                         */}
        {/* ==================================================== */}
        {activeTab === 'treatment-plan' && (
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200 mb-1">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Staged Dental Procedures</span>
                </div>
                <h2 className="text-base font-bold text-slate-900">
                  Treatment Plan & Cost Estimation — {patient.name}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Organize phase-wise clinical procedures, set tooth numbers, estimated fees, and track patient acceptance status.
                </p>
              </div>

              <button
                onClick={() => handleTabChange('chart')}
                className="px-3 py-1.5 rounded-md bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
              >
                <Stethoscope className="w-3.5 h-3.5 text-sky-600" />
                <span>Back to 3D Chart</span>
              </button>
            </div>

            <TreatmentPlanChart
              teeth={patient.dentalChart}
              treatmentPlans={patient.treatmentPlans}
              onUpdateTeeth={handleUpdateTeeth}
              onAddTreatmentPlan={handleAddTreatmentPlan}
              onUpdateTreatmentStatus={handleUpdateTreatmentStatus}
              onDeleteTreatmentPlan={handleDeleteTreatmentPlan}
              onEditTreatmentPlan={handleEditTreatmentPlan}
              onNavigateToBilling={() => handleTabChange('billing')}
              doctorName={patient.assignedDoctorName}
              patientId={patient.id}
            />
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 4: UNIFIED VISITS & CLINICAL NOTES               */}
        {/* ==================================================== */}
        {activeTab === 'visits-notes' && (
          <div className="space-y-4">
            {/* Quick Note Templates & Action Bar */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-teal-700" />
                    <span>Visits & Clinical Notes Timeline ({combinedTimeline.length})</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Unified clinical encounters, findings, procedures performed, doctor observations, and prescriptions.
                  </p>
                </div>

                <button
                  onClick={() => setShowAddNoteModal(true)}
                  className="px-3.5 py-1.5 rounded-md bg-teal-800 hover:bg-teal-900 text-white font-semibold text-xs transition-colors self-start sm:self-auto cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Record Visit Note</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-teal-600" /> Fast Templates:
                </span>
                {[
                  {
                    title: 'Scaling & Prophylaxis',
                    complaint: 'Routine scaling and stain removal',
                    findings: 'Supragingival calculus and plaque, generalized mild gingivitis',
                    diagnosis: 'Chronic Marginal Gingivitis',
                    treatment: 'Full mouth ultrasonic scaling and polishing performed',
                    notes: 'Advised warm saline rinses and soft-bristled toothbrush twice daily.'
                  },
                  {
                    title: 'Composite Filling',
                    complaint: 'Sensitivity to cold and food entrapment',
                    findings: 'Occlusal dental caries into enamel and dentin without pulpal involvement',
                    diagnosis: 'Class I Occlusal Dental Caries',
                    treatment: 'Excavation of caries, 37% phosphoric acid etching, bonding agent, and light-cured composite resin placed and polished.',
                    notes: 'Checked occlusion with articulating paper. No interference.'
                  },
                  {
                    title: 'Root Canal (Stage 1)',
                    complaint: 'Severe throbbing spontaneous nocturnal toothache',
                    findings: 'Extensive carious involvement into pulp chamber, severe tenderness to vertical percussion',
                    diagnosis: 'Acute Irreversible Pulpitis with Symptomatic Apical Periodontitis',
                    treatment: 'Access cavity prepared under 2% lignocaine with 1:80000 adrenaline. Working length verified via apex locator. Biomechanical prep up to 25/04. Calcium hydroxide intra-canal dressing placed. Temporary Cavit seal.',
                    notes: 'Rx: Amoxicillin 500mg TID x 5 days + Ibuprofen 400mg TID x 3 days. Return in 7 days for obturation.'
                  },
                  {
                    title: 'Simple Extraction',
                    complaint: 'Pain from non-restorable retained fractured root',
                    findings: 'Grossly decayed coronal tooth structure, mobility grade II, non-restorable',
                    diagnosis: 'Non-restorable retained dental root',
                    treatment: 'Local infiltration anesthesia given. Syndesmotomy and atraumatic elevation. Extraction completed without complication. Curettage and firm gauze pressure pack placed.',
                    notes: 'Bite firmly on gauze pack for 45 mins. No spitting, hot beverages, or straws for 24h. Post-op instructions given.'
                  },
                  {
                    title: 'Crown Prep & Impression',
                    complaint: 'Crown preparation for post-endodontic tooth',
                    findings: 'Completed root canal with core buildup, ready for prosthetic crown',
                    diagnosis: 'Post-endodontic prosthetic rehabilitation',
                    treatment: 'Subgingival shoulder margin tooth preparation done under anesthesia. Gingival retraction cord placed. Dual-viscosity polyvinyl siloxane impression taken.',
                    notes: 'Temporary crown fabricated and cemented with Temp-Bond. Lab order dispatched for Zirconia crown, shade A2.'
                  }
                ].map((tpl, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setNewChiefComplaint(tpl.complaint);
                      setNewFindings(tpl.findings);
                      setNewDiagnosis(tpl.diagnosis);
                      setNewTreatmentDone(tpl.treatment);
                      setNewDoctorNotes(tpl.notes);
                      setShowAddNoteModal(true);
                      addToast('Template Loaded', `${tpl.title} template loaded.`, 'info');
                    }}
                    className="px-2.5 py-1 rounded-md bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 text-xs font-semibold text-slate-700 hover:text-teal-900 transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Zap className="w-3 h-3 text-teal-600" />
                    <span>{tpl.title}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {combinedTimeline.length === 0 ? (
                <div className="p-12 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
                  <FileText className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                  <p className="text-xs font-bold">No clinical visits or notes recorded yet.</p>
                </div>
              ) : (
                combinedTimeline.map((item) => (
                  <div key={item.id} className="p-5 bg-white rounded-xl border border-slate-200 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="text-xs tabular-nums font-semibold bg-teal-50 text-teal-800 border border-teal-200 px-2.5 py-0.5 rounded-lg">
                          {item.date}
                        </span>
                        <span className="text-xs font-semibold text-slate-800">
                          Attending Doctor: <strong className="text-slate-900">{item.doctorName}</strong>
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditNote(item.id)}
                          className="px-2 py-1 rounded-lg text-slate-600 hover:text-teal-800 hover:bg-teal-50 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors border border-slate-200 hover:border-teal-200"
                          title="Edit clinical encounter notes"
                        >
                          <Edit3 className="w-3 h-3 text-teal-700" />
                          <span>Edit Note</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteClinicalNote(item.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
                          title="Delete clinical note"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {item.type || 'Clinical Encounter'}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="font-extrabold text-slate-400 text-[10px] uppercase block">Chief Complaint:</span>
                        <p className="font-semibold text-slate-800 mt-0.5">{item.chiefComplaint}</p>
                      </div>

                      <div>
                        <span className="font-extrabold text-slate-400 text-[10px] uppercase block">Diagnosis:</span>
                        <p className="font-bold text-sky-800 mt-0.5">{item.diagnosis}</p>
                      </div>

                      {item.findings && (
                        <div className="md:col-span-2">
                          <span className="font-extrabold text-slate-400 text-[10px] uppercase block">Clinical Findings:</span>
                          <p className="text-slate-600 font-medium mt-0.5">{item.findings}</p>
                        </div>
                      )}

                      <div className="md:col-span-2">
                        <span className="font-extrabold text-slate-400 text-[10px] uppercase block">Procedure Done:</span>
                        <p className="font-extrabold text-slate-900 mt-0.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                          {item.treatment}
                        </p>
                      </div>

                      {item.notes && (
                        <div className="md:col-span-2">
                          <span className="font-extrabold text-slate-400 text-[10px] uppercase block">Doctor Observations / Notes:</span>
                          <p className="text-slate-600 font-medium mt-0.5 leading-relaxed">
                            {item.notes}
                          </p>
                        </div>
                      )}

                      {item.prescriptions && item.prescriptions.length > 0 && (
                        <div className="md:col-span-2 p-3 bg-emerald-50 rounded-2xl border border-emerald-200">
                          <span className="font-extrabold text-emerald-900 text-[11px] uppercase block mb-1.5">
                            Prescribed Medications
                          </span>
                          <div className="space-y-1.5">
                            {item.prescriptions.map((p, i) => (
                              <div key={i} className="flex flex-wrap items-center justify-between text-xs bg-white/90 p-2 rounded-xl">
                                <span className="font-black text-slate-800">{p.medicine}</span>
                                <span className="text-slate-600 font-semibold">{p.dosage} • {p.duration}</span>
                                <span className="text-[11px] text-emerald-700 font-bold">{p.instructions}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {item.prescriptionText && !item.prescriptions && (
                        <div className="md:col-span-2 p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
                          <span className="font-extrabold text-emerald-800 text-[10px] uppercase block mb-0.5">
                            Prescription Issued:
                          </span>
                          <p className="font-bold text-emerald-900 text-xs">
                            {item.prescriptionText}
                          </p>
                        </div>
                      )}

                      {item.followUp && (
                        <div className="md:col-span-2 p-2.5 rounded-xl bg-sky-50 border border-sky-200 flex flex-wrap items-center justify-between gap-1 text-xs">
                          <span className="font-extrabold text-sky-800 text-[11px] uppercase">Next Visit / Instructions:</span>
                          <span className="font-bold text-slate-800">{item.followUp}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 6: DOCUMENTS VAULT                               */}
        {/* ==================================================== */}
        {activeTab === 'documents' && (
          <div className="space-y-6">
            <div className="profile-detail-heading">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Documents & radiographs
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  X-rays, RVG digital radiographs, consent forms, and medical reports.
                </p>
              </div>

              <ClayButton
                variant="mint"
                size="sm"
                onClick={() => addToast('Upload Document', 'Select X-ray / PDF scan to upload to vault.', 'info')}
                icon={<Plus className="w-4 h-4" />}
              >
                Upload Document
              </ClayButton>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {patient.documents.map((doc) => (
                <div key={doc.id} className="p-4 bg-white rounded-xl border border-slate-200 flex flex-col justify-between space-y-3">
                  <div className="h-32 bg-slate-100 rounded-xl flex items-center justify-center overflow-hidden relative group">
                    {doc.category === 'X-rays' ? (
                      <div className="w-full h-full bg-slate-950 flex flex-col items-center justify-center text-white/80">
                        <Activity className="w-8 h-8 text-teal-400 mb-1" />
                        <span className="text-xs font-semibold text-teal-400">
                          Digital RVG Sensor
                        </span>
                      </div>
                    ) : (
                      <div className="w-full h-full bg-teal-50 flex items-center justify-center text-teal-700">
                        <FileText className="w-10 h-10" />
                      </div>
                    )}

                    <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={() => addToast('Viewing Document', `Opening ${doc.name}...`, 'info')}
                        className="p-2 rounded-xl bg-white text-slate-800 text-xs font-bold cursor-pointer hover:bg-slate-100"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => addToast('Downloaded', `${doc.name} saved.`, 'success')}
                        className="p-2 rounded-xl bg-white text-slate-800 text-xs font-bold cursor-pointer hover:bg-slate-100"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-1">
                      <span>{doc.category}</span>
                      <span>{doc.fileSize || '2 MB'}</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 leading-tight">
                      {doc.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                      {doc.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-400">
                    <span>{doc.date}</span>
                    <span className="text-teal-700 font-bold">{doc.doctorName}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 7: LAB ORDERS                                    */}
        {/* ==================================================== */}
        {activeTab === 'lab-orders' && (
          <div className="space-y-6">
            <div className="profile-detail-heading">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Dental lab orders
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Crowns, bridges, veneers, aligners, and implant abutments sent to dental milling labs.
                </p>
              </div>

              <ClayButton
                variant="mint"
                size="sm"
                onClick={() => setShowAddLabModal(true)}
                icon={<FlaskConical className="w-4 h-4" />}
              >
                Dispatch New Lab Order
              </ClayButton>
            </div>

            <div className="space-y-4">
              {patient.labOrders.length === 0 ? (
                <div className="p-12 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
                  <FlaskConical className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                  <p className="text-xs font-bold">No active lab orders for this patient.</p>
                </div>
              ) : (
                patient.labOrders.map((order) => (
                  <div key={order.id} className="p-5 bg-white rounded-xl border border-slate-200 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center">
                          <FlaskConical className="w-4 h-4 text-teal-700" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">{order.treatment}</h4>
                          <span className="text-xs text-slate-500">
                            Lab: <strong>{order.labName}</strong>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-slate-500">Status:</span>
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200">
                          {order.status}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <span className="text-[11px] font-semibold text-slate-500 block">Teeth:</span>
                        <div className="flex gap-1 mt-0.5">
                          {order.toothNumbers.map((n) => (
                            <span key={n} className="px-2 py-0.5 rounded bg-teal-50 text-teal-800 font-semibold tabular-nums border border-teal-200">
                              #{n}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="text-[11px] font-semibold text-slate-500 block">Ordered On:</span>
                        <span className="font-semibold text-slate-800 mt-0.5 block">{order.orderDate}</span>
                      </div>

                      <div>
                        <span className="text-[11px] font-semibold text-slate-500 block">Expected Delivery:</span>
                        <span className="font-bold text-emerald-700 mt-0.5 block">{order.expectedDate}</span>
                      </div>
                    </div>

                    {order.prostheticDetails && (
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                        <span className="text-xs font-bold text-slate-900 block mb-1">
                          Prosthodontic Specifications
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-700 font-semibold">
                          <div>Material: <strong>{order.prostheticDetails.material}</strong></div>
                          <div>Shade: <strong>{order.prostheticDetails.shade}</strong></div>
                          <div>Pontic: <strong>{order.prostheticDetails.ponticDesign || 'None'}</strong></div>
                          <div>Collar: <strong>{order.prostheticDetails.collarDesign || 'Lingual'}</strong></div>
                        </div>
                      </div>
                    )}

                    <div>
                      <span className="text-[11px] font-semibold text-slate-500 block mb-0.5">
                        Lab Instructions:
                      </span>
                      <p className="text-xs text-slate-700 font-medium">
                        {order.instructions}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 8: BILLING & INVOICES                            */}
        {/* ==================================================== */}
        {activeTab === 'billing' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Patient Invoices & Payment Ledger
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Line-item dental bills, payment receipts, and real-time ledger settlement.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-600">Total Due:</span>
                  <span className={`text-sm font-bold tabular-nums px-3 py-1 rounded-xl ${actualOutstandingBalance > 0 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    ₹{actualOutstandingBalance.toLocaleString()}
                  </span>
                </div>
                <ClayButton
                  variant="secondary"
                  size="sm"
                  onClick={() => setActiveView('admin-billing')}
                  icon={<Receipt className="w-3.5 h-3.5 text-sky-600" />}
                >
                  Open Full Billing Hub
                </ClayButton>
              </div>
            </div>

            {/* Pending Doctor-Approved Consultation & Treatment Fees */}
            {unbilledFeeApprovals.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-rose-800 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  Doctor-Approved Fees Awaiting Checkout ({unbilledFeeApprovals.length})
                </h4>
                {unbilledFeeApprovals.map(({ visit: v, feeApproval: fa }) => (
                  <div key={fa.id} className="p-4 rounded-xl bg-rose-50/60 border border-rose-200 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-rose-200">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
                            Payment Due at Front Desk
                          </span>
                          <span className="text-xs font-semibold tabular-nums text-slate-700">Ref: {fa.id}</span>
                          <span className="text-xs font-semibold text-slate-600">
                            Doctor: <strong className="text-slate-900">{fa.authorizingDoctorName || v.doctorName}</strong>
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 mt-1">
                          Doctor-Approved Treatment Charges: <span className="tabular-nums text-rose-800 font-bold">₹{fa.finalPayable.toLocaleString()}</span>
                        </h4>
                      </div>

                      <div className="flex items-center gap-2">
                        <ClayButton
                          variant="mint"
                          size="sm"
                          onClick={() => {
                            const matchVisit = visits.find((item) => item.id === fa.visitId || item.feeApproval?.id === fa.id);
                            setCheckoutTargetVisit(matchVisit || activeVisit || effectiveVisit);
                            setCheckoutTargetInvoiceId(fa.invoiceId);
                            setCheckoutTargetFeeApprovalId(fa.id);
                            setShowCheckoutModal(true);
                          }}
                          icon={<Receipt className="w-4 h-4" />}
                        >
                          Settle & Collect Payment (₹{fa.finalPayable.toLocaleString()})
                        </ClayButton>
                      </div>
                    </div>

                    {/* Fee item details */}
                    <div className="overflow-x-auto bg-white rounded-lg p-3 border border-rose-200 text-xs">
                      <table className="w-full text-left responsive-records">
                        <thead>
                          <tr className="text-slate-500 font-semibold text-xs border-b border-slate-100">
                            <th className="py-1.5">Procedure / Service Description</th>
                            <th className="py-1.5 text-center">Qty</th>
                            <th className="py-1.5 text-right">Price</th>
                            <th className="py-1.5 text-right">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                          {fa.consultationFee > 0 && (
                            <tr>
                              <td data-label="Procedure / Service Description" className="py-2 font-semibold">Specialist Doctor Consultation</td>
                              <td data-label="Qty" className="py-2 text-center">1</td>
                              <td data-label="Price" className="py-2 text-right tabular-nums">₹{fa.consultationFee.toLocaleString()}</td>
                              <td data-label="Amount" className="py-2 text-right tabular-nums font-bold">₹{fa.consultationFee.toLocaleString()}</td>
                            </tr>
                          )}
                          {fa.items.map((it) => (
                            <tr key={it.id}>
                              <td data-label="Procedure / Service Description" className="py-2 font-semibold">{it.description}</td>
                              <td data-label="Qty" className="py-2 text-center">{it.quantity}</td>
                              <td data-label="Price" className="py-2 text-right tabular-nums">₹{it.unitPrice.toLocaleString()}</td>
                              <td data-label="Amount" className="py-2 text-right tabular-nums font-bold">₹{it.total.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="border-t border-rose-200 font-bold text-slate-900">
                            <td colSpan={3} className="py-2 text-right">Net Payable Amount:</td>
                            <td data-label="Qty" className="py-2 text-right tabular-nums text-sm text-rose-800 font-bold">₹{fa.finalPayable.toLocaleString()}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pending Unbilled Clinical Consultations & Treatments */}
            {pendingUnbilledVisits.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-amber-900 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  Clinical Consultations & Treatments Awaiting Bill & Checkout ({pendingUnbilledVisits.length})
                </h4>
                {pendingUnbilledVisits.map((item) => (
                  <div key={item.visit.id} className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-amber-200">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-900">
                            Awaiting Front Desk Settlement
                          </span>
                          <span className="text-xs font-semibold tabular-nums text-slate-700">Ref: {item.visit.tokenId || item.visit.id}</span>
                          <span className="text-xs font-semibold text-slate-600">
                            Doctor: <strong className="text-slate-900">{item.visit.doctorName || patient.assignedDoctorName || 'Dr. DOCTOR TEST'}</strong>
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 mt-1">
                          Consultation & Treatment Charges Due: <span className="tabular-nums text-rose-800 font-bold">₹{item.amount.toLocaleString()}</span>
                        </h4>
                      </div>

                      <div className="flex items-center gap-2">
                        <ClayButton
                          variant="mint"
                          size="sm"
                          onClick={() => {
                            setCheckoutTargetVisit(item.visit);
                            setCheckoutTargetInvoiceId(item.visit.invoiceId);
                            setCheckoutTargetFeeApprovalId(item.visit.feeApproval?.id);
                            setShowCheckoutModal(true);
                          }}
                          icon={<Receipt className="w-4 h-4" />}
                        >
                          Settle & Collect Payment (₹{item.amount.toLocaleString()})
                        </ClayButton>

                        <ClayButton
                          variant="secondary"
                          size="sm"
                          onClick={() => handleGenerateBillForVisit(item.visit, item.items)}
                          disabled={isGeneratingVisitBill}
                          icon={<FileText className="w-3.5 h-3.5 text-teal-700" />}
                        >
                          {isGeneratingVisitBill ? 'Generating...' : '+ Generate Bill'}
                        </ClayButton>
                      </div>
                    </div>

                    {/* Fee item details */}
                    <div className="overflow-x-auto bg-white/90 rounded-2xl p-3 border border-amber-200 text-xs">
                      <table className="w-full text-left responsive-records">
                        <thead>
                          <tr className="text-slate-400 font-extrabold uppercase text-[10px] border-b border-slate-100">
                            <th className="py-1.5">Procedure / Service Description</th>
                            <th className="py-1.5 text-center">Qty</th>
                            <th className="py-1.5 text-right">Price</th>
                            <th className="py-1.5 text-right">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                          {item.items.map((it, idx) => (
                            <tr key={it.id || idx}>
                              <td data-label="Procedure / Service Description" className="py-2 font-semibold">{it.description}</td>
                              <td data-label="Qty" className="py-2 text-center">{it.quantity}</td>
                              <td data-label="Price" className="py-2 text-right tabular-nums">₹{it.unitPrice.toLocaleString()}</td>
                              <td data-label="Amount" className="py-2 text-right tabular-nums font-bold">₹{(it.quantity * it.unitPrice).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="border-t border-amber-200 font-bold text-slate-900">
                            <td colSpan={3} className="py-2 text-right">Total Net Payable:</td>
                            <td data-label="Qty" className="py-2 text-right tabular-nums text-sm text-rose-800 font-bold">₹{item.amount.toLocaleString()}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Active Treatment Plans Billing Action Banner */}
            {unbilledTreatmentPlans.length > 0 && (
              <div className="p-4 rounded-xl bg-teal-50/40 border border-teal-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-semibold text-teal-800 bg-white px-2.5 py-0.5 rounded-full border border-teal-200">
                    Doctor Treatment Plans Available
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 mt-1">
                    {unbilledTreatmentPlans.length} Planned Procedure{unbilledTreatmentPlans.length > 1 ? 's' : ''} • Est. Total: <span className="tabular-nums text-emerald-800">₹{unbilledTreatmentPlans.reduce((sum, p) => sum + (p.estimatedCost || 0), 0).toLocaleString()}</span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Procedures with amounts added during doctor consultation and dental charting. Click below to issue an invoice with discount and payment options.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <ClayButton
                    variant="mint"
                    size="sm"
                    onClick={() => {
                      const defaultConsultationFee = 0;
                      const items = [
                        { description: patient.currentTreatment || 'Doctor Dental Consultation & Examination', quantity: 1, unitPrice: defaultConsultationFee },
                        ...unbilledTreatmentPlans.map((tp) => ({ description: tp.procedure, quantity: 1, unitPrice: Number(tp.estimatedCost) || 0 }))
                      ];
                      handleGenerateBillForVisit(effectiveVisit, items);
                    }}
                    disabled={isGeneratingVisitBill}
                    icon={<Receipt className="w-4 h-4" />}
                  >
                    Quick Generate Bill & Invoice
                  </ClayButton>
                  <ClayButton
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setSelectedPatientForDetail(patient);
                      setActiveView('admin-billing');
                    }}
                    icon={<Receipt className="w-4 h-4" />}
                  >
                    Billing Hub
                  </ClayButton>
                </div>
              </div>
            )}

            {/* Section 1: Invoices */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-teal-700" />
                Treatment Invoices ({patientInvoices.length})
              </h4>

              {patientInvoices.length === 0 && unbilledFeeApprovals.length === 0 && pendingUnbilledVisits.length === 0 && (
                <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  No invoices or pending charges found for this patient.
                </div>
              )}

              {patientInvoices.map((inv) => (
                <div key={inv.id} className="p-4 bg-white rounded-xl border border-slate-200 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold tabular-nums text-slate-900">{inv.id}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${inv.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}>
                          {inv.status}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500">Date: {inv.date}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {inv.balance > 0 && (
                        <ClayButton
                          variant="mint"
                          size="sm"
                          onClick={() => {
                            setRecordingInvoiceId(inv.id);
                            setPaymentAmount(inv.balance);
                            setSelectedPaymentMethod('UPI');
                          }}
                          icon={<CreditCard className="w-3.5 h-3.5" />}
                        >
                          Record Payment
                        </ClayButton>
                      )}
                      <button
                        onClick={() => addToast('Printing Invoice', `Generating PDF for ${inv.id}...`, 'info')}
                        className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
                        title="Print Invoice"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Line items table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left responsive-records">
                      <thead>
                        <tr className="text-slate-500 font-semibold text-xs border-b border-slate-100">
                          <th className="py-2">Description</th>
                          <th className="py-2 text-center">Qty</th>
                          <th className="py-2 text-right">Unit Price</th>
                          <th className="py-2 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                        {inv.items.map((item) => (
                          <tr key={item.id}>
                            <td data-label="Description" className="py-2.5 font-bold text-slate-800">{item.description}</td>
                            <td data-label="Qty" className="py-2.5 text-center">{item.quantity}</td>
                            <td data-label="Unit Price" className="py-2.5 text-right tabular-nums">₹{item.unitPrice.toLocaleString()}</td>
                            <td data-label="Amount" className="py-2.5 text-right tabular-nums font-bold">₹{item.total.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-3 border-t border-slate-100 text-xs">
                    <div className="text-slate-500">
                      Payment Method: <strong>{inv.paymentMethod || 'UPI / Card'}</strong>
                    </div>

                    <div className="space-y-1 text-right mt-2 sm:mt-0">
                      <div>Total: <strong className="tabular-nums text-slate-900">₹{inv.total.toLocaleString()}</strong></div>
                      <div>Paid: <strong className="tabular-nums text-emerald-700">₹{inv.paid.toLocaleString()}</strong></div>
                      <div>Balance: <strong className="tabular-nums text-rose-700 font-bold">₹{inv.balance.toLocaleString()}</strong></div>
                    </div>
                  </div>

                  {/* Step-by-Step Record Payment Form */}
                  {recordingInvoiceId === inv.id && (
                    <div className="p-4 bg-teal-50/40 rounded-xl border border-teal-200 space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-teal-200">
                        <span className="text-xs font-bold text-teal-950">
                          Record Payment for {inv.id}
                        </span>
                        <span className="text-xs text-teal-800 font-semibold">
                          Invoice Balance: <strong className="tabular-nums">₹{inv.balance}</strong>
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-[11px] font-semibold text-slate-700">Amount to Settle (₹) *</label>
                            <button
                              type="button"
                              onClick={() => setPaymentAmount(inv.balance)}
                              className="text-xs text-teal-700 font-semibold hover:underline cursor-pointer"
                            >
                              Pay Full ₹{inv.balance}
                            </button>
                          </div>
                          <input
                            type="number"
                            value={paymentAmount}
                            onChange={(e) => setPaymentAmount(Number(e.target.value))}
                            className="w-full px-3 py-2 rounded-xl text-xs font-bold border border-slate-300 bg-white"
                            placeholder="Amount"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-semibold text-slate-700 block mb-1">Notes / Transaction Ref</label>
                          <input
                            type="text"
                            value={paymentNotes}
                            onChange={(e) => setPaymentNotes(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl text-xs font-semibold border border-slate-300 bg-white"
                            placeholder="e.g. UPI txn ref / Cash counter note"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-slate-700 block mb-1.5">Payment Method *</label>
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                          {(['UPI', 'Cash', 'Card', 'Net Banking', 'Insurance'] as PaymentMethod[]).map((m) => (
                            <button
                              key={m}
                              type="button"
                              onClick={() => setSelectedPaymentMethod(m)}
                              className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-colors ${selectedPaymentMethod === m
                                  ? 'bg-teal-700 text-white'
                                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                                }`}
                            >
                              {m}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-teal-200">
                        <button
                          onClick={() => setRecordingInvoiceId(null)}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/50 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <ClayButton
                          variant="mint"
                          size="sm"
                          onClick={() => handleRecordPayment(inv.id)}
                          icon={<CheckCircle2 className="w-4 h-4" />}
                        >
                          Confirm & Generate Receipt (₹{paymentAmount})
                        </ClayButton>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Section 2: Payment Pay Records / Receipts History */}
            <div className="space-y-3 pt-2">
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-teal-700" />
                Payment Pay Records & Receipts History
              </h4>

              {(() => {
                const patientReceipts = globalPayments.filter(
                  (p) => p.patientId === patient.id ||
                    (p.patientName && patient.name && p.patientName.toLowerCase() === patient.name.toLowerCase()) ||
                    (patient.invoices || []).some((inv) => inv.id === p.invoiceId)
                );

                if (patientReceipts.length === 0) {
                  return (
                    <div className="p-6 text-center text-slate-500 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                      No payment receipts generated yet. Payments recorded on invoices will appear here in the verified transaction ledger.
                    </div>
                  );
                }

                return (
                  <div className="p-4 bg-white rounded-xl border border-slate-200 overflow-x-auto">
                    <table className="w-full text-xs text-left responsive-records">
                      <thead>
                        <tr className="text-slate-500 font-semibold text-xs border-b border-slate-100">
                          <th className="py-2.5">Receipt #</th>
                          <th className="py-2.5">Date & Time</th>
                          <th className="py-2.5">Invoice</th>
                          <th className="py-2.5">Method</th>
                          <th className="py-2.5 text-right">Amount Paid</th>
                          <th className="py-2.5 text-center">Status</th>
                          <th className="py-2.5 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                        {patientReceipts.map((rec) => (
                          <tr key={rec.id} className="hover:bg-slate-50/50">
                            <td data-label="Receipt #" className="py-3 tabular-nums font-bold text-slate-900">
                              {rec.receiptNumber}
                            </td>
                            <td data-label="Date & Time" className="py-3 text-slate-600">
                              {rec.date} <span className="text-xs text-slate-400">{rec.time}</span>
                            </td>
                            <td data-label="Invoice" className="py-3 tabular-nums text-slate-600">
                              {rec.invoiceId}
                            </td>
                            <td data-label="Method" className="py-3">
                              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                                {rec.paymentMethod}
                              </span>
                            </td>
                            <td data-label="Amount Paid" className="py-3 text-right tabular-nums font-bold text-emerald-700">
                              ₹{rec.amount.toLocaleString()}
                            </td>
                            <td data-label="Status" className="py-3 text-center">
                              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                Settled
                              </span>
                            </td>
                            <td data-label="Action" className="py-3 text-right">
                              <ClayButton
                                variant="secondary"
                                size="sm"
                                onClick={() => {
                                  setActiveProfileReceipt(rec);
                                  setShowProfileReceiptModal(true);
                                }}
                                icon={<Receipt className="w-3.5 h-3.5 text-teal-700" />}
                              >
                                View Receipt
                              </ClayButton>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 9: APPOINTMENTS                                  */}
        {/* ==================================================== */}
        {activeTab === 'appointments' && (
          <div className="p-6 bg-white rounded-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Patient Appointment Schedule
                </h3>
                <p className="text-xs text-slate-500">
                  Active queue tokens and upcoming appointments.
                </p>
              </div>

              <ClayButton
                variant="primary"
                size="sm"
                onClick={() => setActiveView('booking')}
                icon={<Calendar className="w-4 h-4" />}
              >
                Book New Appointment
              </ClayButton>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-800 text-white flex items-center justify-center font-bold tabular-nums text-xs">
                  A-028
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900">
                    Next Appointment: {patient.upcomingAppointmentDate || '25 Sep 2026'} at 02:30 PM
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium">
                    With {patient.assignedDoctorName} • Root Canal Review & Crown Fitting
                  </p>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-black bg-sky-100 text-sky-800">
                Confirmed
              </span>
            </div>
          </div>
        )}

        {/* MODAL: Record New Clinical Visit Note */}
        {showAddNoteModal && (
          <ModalLayer onDismiss={() => setShowAddNoteModal(false)} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 animate-in fade-in overflow-y-auto" data-ui="modal">
            <div className="w-full max-w-xl my-6 bg-white rounded-2xl p-6 border border-slate-200 space-y-4">
              <h3 className="text-base font-bold text-slate-900">
                Record Clinical Encounter for {patient.name}
              </h3>

              {/* In-Modal Template Chips */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
                <span className="text-xs font-semibold text-slate-700 block mb-1.5 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-teal-600" /> Quick Templates:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    {
                      title: 'Scaling',
                      complaint: 'Routine scaling and stain removal',
                      findings: 'Supragingival calculus and plaque, generalized mild gingivitis',
                      diagnosis: 'Chronic Marginal Gingivitis',
                      treatment: 'Full mouth ultrasonic scaling and polishing performed',
                      notes: 'Advised warm saline rinses and soft-bristled toothbrush twice daily.'
                    },
                    {
                      title: 'Filling',
                      complaint: 'Sensitivity to cold and food entrapment',
                      findings: 'Occlusal dental caries into enamel and dentin without pulpal involvement',
                      diagnosis: 'Class I Occlusal Dental Caries',
                      treatment: 'Excavation of caries, 37% phosphoric acid etching, bonding agent, and light-cured composite resin placed and polished.',
                      notes: 'Checked occlusion with articulating paper. No interference.'
                    },
                    {
                      title: 'RCT Stage 1',
                      complaint: 'Severe throbbing spontaneous nocturnal toothache',
                      findings: 'Extensive carious involvement into pulp chamber, severe tenderness to vertical percussion',
                      diagnosis: 'Acute Irreversible Pulpitis with Symptomatic Apical Periodontitis',
                      treatment: 'Access cavity prepared under 2% lignocaine with 1:80000 adrenaline. Working length verified via apex locator. Biomechanical prep up to 25/04. Calcium hydroxide intra-canal dressing placed. Temporary Cavit seal.',
                      notes: 'Rx: Amoxicillin 500mg TID x 5 days + Ibuprofen 400mg TID x 3 days. Return in 7 days for obturation.'
                    },
                    {
                      title: 'Extraction',
                      complaint: 'Pain from non-restorable retained fractured root',
                      findings: 'Grossly decayed coronal tooth structure, mobility grade II, non-restorable',
                      diagnosis: 'Non-restorable retained dental root',
                      treatment: 'Local infiltration anesthesia given. Syndesmotomy and atraumatic elevation. Extraction completed without complication. Curettage and firm gauze pressure pack placed.',
                      notes: 'Bite firmly on gauze pack for 45 mins. No spitting, hot beverages, or straws for 24h. Post-op instructions given.'
                    }
                  ].map((tpl, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setNewChiefComplaint(tpl.complaint);
                        setNewFindings(tpl.findings);
                        setNewDiagnosis(tpl.diagnosis);
                        setNewTreatmentDone(tpl.treatment);
                        setNewDoctorNotes(tpl.notes);
                      }}
                      className="px-2 py-0.5 rounded bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-300 text-xs font-semibold text-slate-700 hover:text-teal-900 transition-colors cursor-pointer"
                    >
                      {tpl.title}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleCreateClinicalNote} className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Chief Complaint:</label>
                  <input
                    type="text"
                    required
                    value={newChiefComplaint}
                    onChange={(e) => setNewChiefComplaint(e.target.value)}
                    placeholder="e.g. Mild sensitivity resolving, routine review"
                    className="w-full px-3 py-2 rounded-xl text-xs border border-slate-300"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Clinical Findings:</label>
                  <input
                    type="text"
                    value={newFindings}
                    onChange={(e) => setNewFindings(e.target.value)}
                    placeholder="e.g. Canals dry, asymptomatic, percussion negative"
                    className="w-full px-3 py-2 rounded-xl text-xs border border-slate-300"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Clinical Diagnosis:</label>
                  <input
                    type="text"
                    required
                    value={newDiagnosis}
                    onChange={(e) => setNewDiagnosis(e.target.value)}
                    placeholder="e.g. Resolving Apical Periodontitis (#36)"
                    className="w-full px-3 py-2 rounded-xl text-xs border border-slate-300 font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Treatment Performed Today:</label>
                  <textarea
                    rows={2}
                    required
                    value={newTreatmentDone}
                    onChange={(e) => setNewTreatmentDone(e.target.value)}
                    placeholder="e.g. Gutta-percha obturation with AH Plus sealer. Cavity etched and bonded with dual-cure composite core."
                    className="w-full px-3 py-2 rounded-xl text-xs border border-slate-300"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Doctor's Notes & Advice:</label>
                  <textarea
                    rows={2}
                    value={newDoctorNotes}
                    onChange={(e) => setNewDoctorNotes(e.target.value)}
                    placeholder="e.g. Patient advised crown preparation next week."
                    className="w-full px-3 py-2 rounded-xl text-xs border border-slate-300"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Next Visit Plan:</label>
                  <input
                    type="text"
                    value={newNextVisit}
                    onChange={(e) => setNewNextVisit(e.target.value)}
                    placeholder="e.g. Tooth preparation for Zirconia Crown"
                    className="w-full px-3 py-2 rounded-xl text-xs border border-slate-300"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowAddNoteModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <ClayButton variant="primary" type="submit">
                    Save Clinical Visit
                  </ClayButton>
                </div>
              </form>
            </div>
          </ModalLayer>
        )}

        {/* MODAL: Dispatch New Lab Order */}
        {showAddLabModal && (
          <ModalLayer onDismiss={() => setShowAddLabModal(false)} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 animate-in fade-in" data-ui="modal">
            <div className="w-full max-w-lg bg-white rounded-2xl p-6 border border-slate-200 space-y-4">
              <h3 className="text-base font-bold text-slate-800">
                New Dental Lab Work Order
              </h3>

              <form onSubmit={handleCreateLabOrder} className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Tooth / Teeth Numbers:</label>
                  <input
                    type="text"
                    required
                    value={labTeethStr}
                    onChange={(e) => setLabTeethStr(e.target.value)}
                    placeholder="e.g. 36 (or 11, 21)"
                    className="w-full px-3 py-2 rounded-xl text-xs border border-slate-300 font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Restoration Type:</label>
                    <select
                      value={labType}
                      onChange={(e) => setLabType(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl text-xs font-bold border border-slate-300"
                    >
                      <option value="Crown">Crown</option>
                      <option value="Bridge">Bridge</option>
                      <option value="Denture">Denture</option>
                      <option value="Implant">Implant Abutment</option>
                      <option value="Orthodontic">Orthodontic Aligner</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Lab Name:</label>
                    <input
                      type="text"
                      required
                      value={labName}
                      onChange={(e) => setLabName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-xs border border-slate-300 font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Technical Lab Instructions:</label>
                  <textarea
                    rows={3}
                    required
                    value={labInstructions}
                    onChange={(e) => setLabInstructions(e.target.value)}
                    placeholder="Material, shade, margin design, contact tightness"
                    className="w-full px-3 py-2 rounded-xl text-xs border border-slate-300"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowAddLabModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <ClayButton variant="primary" type="submit">
                    Dispatch Lab Order
                  </ClayButton>
                </div>
              </form>
            </div>
          </ModalLayer>
        )}

        {/* COMPLETE CONSULTATION MODAL */}
        {showCompleteModal && activeVisit && (
          <ModalLayer onDismiss={() => setShowCompleteModal(false)} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 animate-in fade-in" data-ui="modal">
            <div className="w-full max-w-lg bg-white rounded-2xl p-6 border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <span className="text-xs font-semibold text-emerald-800 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
                    Clinical Finalization
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">
                    Complete Consultation ({activeVisit.tokenId} • {patient.name})
                  </h3>
                </div>
                <button aria-label="Close dialog"
                  onClick={() => setShowCompleteModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Final Diagnosis</label>
                  <input
                    type="text"
                    value={compDiagnosis}
                    onChange={(e) => setCompDiagnosis(e.target.value)}
                    placeholder="e.g. Pulpitis — Tooth 36"
                    className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 font-bold focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Treatment Performed / Procedure</label>
                  <input
                    type="text"
                    value={compTreatment}
                    onChange={(e) => setCompTreatment(e.target.value)}
                    placeholder="e.g. Root Canal Treatment & Cavity Preparation"
                    className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 font-bold focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Clinical Notes & Observations</label>
                  <textarea
                    rows={3}
                    value={compNotes}
                    onChange={(e) => setCompNotes(e.target.value)}
                    placeholder="Patient advised to continue treatment. Antibiotic/analgesic advised as needed..."
                    className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Schedule Follow-up Date (e.g. 08 Oct 2026)</label>
                  <input
                    type="date"
                    value={compFollowUp}
                    onChange={(e) => setCompFollowUp(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <ClayButton
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowCompleteModal(false)}
                >
                  Cancel
                </ClayButton>
                <ClayButton
                  variant="mint"
                  size="md"
                  onClick={handleConfirmConsultationComplete}
                  icon={<CheckCircle2 className="w-4 h-4" />}
                >
                  Complete Consultation
                </ClayButton>
              </div>
            </div>
          </ModalLayer>
        )}

        {/* Printable Digital Receipt Modal */}
        {showProfileReceiptModal && activeProfileReceipt && (
          <ModalLayer onDismiss={() => setShowProfileReceiptModal(false)} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 animate-in fade-in" data-ui="modal">
            <div className="bg-white rounded-2xl p-6 md:p-8 max-w-lg w-full border border-slate-200 space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-teal-700 text-white flex items-center justify-center">
                    <Stethoscope className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 leading-tight">Apex Dental Speciality</h3>
                    <span className="text-[11px] text-slate-400 font-semibold">Official Clinical Payment Receipt</span>
                  </div>
                </div>
                <button aria-label="Close dialog"
                  onClick={() => setShowProfileReceiptModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200 text-center">
                <span className="text-xs font-semibold text-emerald-800">Amount Received</span>
                <div className="text-3xl font-bold tabular-nums text-emerald-900 my-0.5">
                  ₹{activeProfileReceipt.amount.toLocaleString()}
                </div>
                <span className="inline-block px-3 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Settled & Credited to Patient Ledger
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500 block text-[11px] font-semibold">Receipt No</span>
                  <span className="tabular-nums font-bold text-slate-900">{activeProfileReceipt.receiptNumber}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px] font-semibold">Date & Time</span>
                  <span className="font-semibold text-slate-800">{activeProfileReceipt.date} at {activeProfileReceipt.time}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px] font-semibold">Patient Name</span>
                  <span className="font-bold text-slate-900">{patient.name}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px] font-semibold">Invoice Ref</span>
                  <span className="tabular-nums font-semibold text-slate-900">{activeProfileReceipt.invoiceId}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px] font-semibold">Payment Method</span>
                  <span className="font-bold text-teal-800">{activeProfileReceipt.paymentMethod}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px] font-semibold">Collected By</span>
                  <span className="font-semibold text-slate-800">{activeProfileReceipt.receivedBy}</span>
                </div>
              </div>

              {activeProfileReceipt.referenceNumber && (
                <div className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  Transaction / Gateway Ref: <strong className="tabular-nums">{activeProfileReceipt.referenceNumber}</strong>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <ClayButton
                  variant="mint"
                  size="md"
                  className="w-full"
                  onClick={() => {
                    setPrintableReceiptTarget(activeProfileReceipt);
                  }}
                  icon={<Printer className="w-4 h-4" />}
                >
                  Download / Print Official Receipt
                </ClayButton>
                <ClayButton
                  variant="secondary"
                  size="md"
                  onClick={() => setShowProfileReceiptModal(false)}
                >
                  Close
                </ClayButton>
              </div>
            </div>
          </ModalLayer>
        )}

        {/* CLINICAL CASE SHEET MODAL (Doctor Intake: Chief Complaint, HOPI, Medical & Dental History, Allergies, Medications) */}
        {showCaseSheetModal && (
          <DoctorCaseSheetModal
            isOpen={showCaseSheetModal}
            isPageModel={false}
            onClose={() => setShowCaseSheetModal(false)}
            patient={patient}
            onSave={async (updated) => {
              try {
                sessionStorage.setItem(`smilecare_intake_completed_${updated.id}`, 'true');
                localStorage.setItem(`smilecare_intake_completed_${updated.id}`, 'true');
                sessionStorage.setItem(`smilecare_intake_viewed_${updated.id}`, 'true');
              } catch (e) { }
              setShouldOpenCaseSheetOnProfile(false);
              await updatePatient(updated);
              setSelectedPatientForDetail(updated);
              setShowCaseSheetModal(false);
              addToast('Case Sheet Updated', `Updated clinical records for ${updated.name}.`, 'success');
            }}
          />
        )}

        {/* EDIT CLINICAL NOTE MODAL */}
        {editingClinicalNote && (
          <ModalLayer onDismiss={() => setEditingClinicalNote(null)} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 animate-in fade-in" data-ui="modal">
            <div className="bg-white w-full max-w-2xl rounded-2xl p-6 border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between pb-3 border-b border-slate-200">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 text-xs font-semibold border border-teal-200 mb-1">
                    <FileText className="w-3 h-3" />
                    <span>Clinical Encounter Record Editor</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Edit Clinical Visit Record
                  </h3>
                  <p className="text-xs text-slate-500">
                    Date: {editingClinicalNote.date} • Doctor: {editingClinicalNote.doctorName || patient.assignedDoctorName}
                  </p>
                </div>
                <button aria-label="Close dialog"
                  onClick={() => setEditingClinicalNote(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveEditedNote} className="space-y-3.5 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Chief Complaint *</label>
                  <input
                    type="text"
                    required
                    value={editNoteComplaint}
                    onChange={(e) => setEditNoteComplaint(e.target.value)}
                    placeholder="e.g. Throbbing pain in lower right jaw"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Diagnosis *</label>
                  <input
                    type="text"
                    required
                    value={editNoteDiagnosis}
                    onChange={(e) => setEditNoteDiagnosis(e.target.value)}
                    placeholder="e.g. Irreversible Pulpitis #46"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Clinical Findings & Examination</label>
                  <textarea
                    rows={3}
                    value={editNoteFindings}
                    onChange={(e) => setEditNoteFindings(e.target.value)}
                    placeholder="e.g. Deep occlusal caries, tender to percussion (+), vital test delayed response"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Treatment Performed / Procedure</label>
                  <input
                    type="text"
                    value={editNoteTreatment}
                    onChange={(e) => setEditNoteTreatment(e.target.value)}
                    placeholder="e.g. Access cavity prepared, pulp extirpated, BMP done #46"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Doctor Precaution & Clinical Notes</label>
                  <textarea
                    rows={2}
                    value={editNoteDoctorNotes}
                    onChange={(e) => setEditNoteDoctorNotes(e.target.value)}
                    placeholder="e.g. Cotton pellet placed, temporary dressing IRM sealed. Caution: avoid hard chew on right side."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Next Visit Instructions & Follow-up</label>
                  <input
                    type="text"
                    value={editNoteNextVisit}
                    onChange={(e) => setEditNoteNextVisit(e.target.value)}
                    placeholder="e.g. Return in 5 days for canal obturation & post-endo crown planning"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  />
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => handleDeleteClinicalNote(editingClinicalNote.id)}
                    className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-rose-200"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Record</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingClinicalNote(null)}
                      className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold cursor-pointer transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Save Changes</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </ModalLayer>
        )}

        {/* DOCTOR FEE APPROVAL MODAL */}
        {showFeeModal && (
          <DoctorFeeApprovalModal
            isOpen={showFeeModal}
            onClose={() => setShowFeeModal(false)}
            visit={effectiveVisit}
            visitId={effectiveVisit.id}
            patient={patient}
            patientId={patient.id}
            patientName={patient.name}
            defaultDoctorName={effectiveVisit.doctorName || patient.assignedDoctorName}
          />
        )}

        {/* DOCTOR PRESCRIPTION MODAL */}
        {showPrescriptionModal && (
          <DoctorPrescriptionModal
            isOpen={showPrescriptionModal}
            onClose={() => {
              setShowPrescriptionModal(false);
              setPrescriptionToEdit(null);
            }}
            visit={effectiveVisit}
            visitId={effectiveVisit.id}
            patient={patient}
            patientId={patient.id}
            patientName={patient.name}
            doctorName={effectiveVisit.doctorName || patient.assignedDoctorName}
            prescriptionToEdit={prescriptionToEdit}
            onPrescriptionCreated={(rx) => {
              setPrintablePrescriptionTarget(rx);
              setShowPrescriptionModal(false);
              setPrescriptionToEdit(null);
            }}
            onDeletePrescription={async (id) => {
              await deletePrescription(id);
              setShowPrescriptionModal(false);
              setPrescriptionToEdit(null);
            }}
          />
        )}

        {/* RECEPTION CHECKOUT MODAL */}
        {showCheckoutModal && (
          <ReceptionCheckoutModal
            isOpen={showCheckoutModal}
            onClose={() => {
              setShowCheckoutModal(false);
              setCheckoutTargetVisit(null);
              setCheckoutTargetInvoiceId(undefined);
              setCheckoutTargetFeeApprovalId(undefined);
            }}
            visit={(checkoutTargetVisit || checkoutVisit || activeVisit || effectiveVisit)!}
            patient={patient}
            targetInvoiceId={checkoutTargetInvoiceId}
            targetFeeApprovalId={checkoutTargetFeeApprovalId}
          />
        )}

        {/* PRINTABLE DIGITAL PRESCRIPTION MODAL */}
        {printablePrescriptionTarget && (
          <PrintablePrescriptionModal
            isOpen={!!printablePrescriptionTarget}
            onClose={() => setPrintablePrescriptionTarget(null)}
            prescription={printablePrescriptionTarget}
            onEdit={(rx) => {
              setPrintablePrescriptionTarget(null);
              setPrescriptionToEdit(rx);
              setShowPrescriptionModal(true);
            }}
            onDelete={async (id) => {
              await deletePrescription(id);
              setPrintablePrescriptionTarget(null);
            }}
          />
        )}

        {/* PRINTABLE OFFICIAL RECEIPT MODAL */}
        {printableReceiptTarget && (
          <PrintableReceiptModal
            isOpen={!!printableReceiptTarget}
            onClose={() => setPrintableReceiptTarget(null)}
            payment={printableReceiptTarget}
            patientOpNumber={patient.opNumber || patient.id}
          />
        )}

        {/* QUICK QUEUE TOKEN GENERATION MODAL */}
        {showTokenModal && (
          <ModalLayer onDismiss={() => setShowTokenModal(false)} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 animate-in fade-in" data-ui="modal">
            <div className="bg-white w-full max-w-lg rounded-2xl p-6 border border-slate-200 space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between pb-3 border-b border-slate-200">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200 mb-1">
                    <QrCode className="w-3 h-3" />
                    <span>Queue Management & Check-In</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Generate Queue Token
                  </h3>
                  <p className="text-xs text-slate-500">
                    Check in patient and assign a live waiting token for today's clinical consultation.
                  </p>
                </div>
                <button aria-label="Close dialog"
                  onClick={() => setShowTokenModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Patient Demographics Pill */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-800 block">{patient.name}</span>
                  <span className="text-xs text-slate-500 tabular-nums">
                    {patient.opNumber || patient.id} • {patient.age}y / {patient.gender} • Ph: {patient.phone}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-800 font-semibold text-xs border border-teal-200">
                  Registered Patient
                </span>
              </div>

              <form onSubmit={handleGenerateToken} className="space-y-3.5 text-xs">
                {/* Doctor Select */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Assigning Doctor *
                  </label>
                  <select
                    value={tokenDoctorId}
                    onChange={(e) => setTokenDoctorId(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 cursor-pointer"
                  >
                    {doctors.map((doc) => (
                      <option key={doc.id} value={doc.id}>
                        {doc.name} ({doc.specialty})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Priority Selection */}
                <PrioritySelector value={tokenPriority} onChange={setTokenPriority} />

                {/* Reason / Chief Complaint */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Chief Complaint / Procedure Indication *
                  </label>
                  <input
                    type="text"
                    required
                    value={tokenReason}
                    onChange={(e) => setTokenReason(e.target.value)}
                    placeholder="e.g. Toothache, Scaling, Extraction, Consultation"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  />
                </div>

                {/* Today's Appointment Auto-link alert */}
                {(() => {
                  const todayDate = new Date().toISOString().split('T')[0];
                  const todayApt = appointments.find(
                    (a) => (a.patientId === patient.id || a.patientPhone === patient.phone) &&
                      a.date === todayDate && a.status !== 'Cancelled' && a.status !== 'Completed'
                  );
                  if (todayApt) {
                    return (
                      <div className="p-2.5 bg-teal-50 rounded-lg border border-teal-200 text-teal-900 text-xs flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                        <span>Auto-linking to scheduled appointment today at <strong>{todayApt.timeSlot}</strong>.</span>
                      </div>
                    );
                  }
                  return (
                    <div className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      Walk-in arrival: Token will automatically sync with Doctor Queue & Reception TV.
                    </div>
                  );
                })()}

                {/* Footer Controls */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowTokenModal(false)}
                    className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isGeneratingToken}
                    className="px-4 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isGeneratingToken ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <QrCode className="w-3.5 h-3.5" />
                        <span>Issue Token</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </ModalLayer>
        )}
      </main>
    </div>
  );
};


