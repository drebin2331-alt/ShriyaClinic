import { ModalLayer } from '../components/common/ModalLayer';
import './clinic-modules.css';
import { WorkspaceHeading } from '../components/common/WorkspaceControls';
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { ClayCard } from '../components/common/ClayCard';
import { ClayButton } from '../components/common/ClayButton';
import { ClaySelect } from '../components/common/ClaySelect';
import { StatusBadge } from '../components/common/StatusBadge';
import { Sidebar } from '../components/common/Sidebar';
import { DoctorFeeApprovalModal } from '../components/dental/DoctorFeeApprovalModal';
import { DoctorPrescriptionModal } from '../components/dental/DoctorPrescriptionModal';
import { ReceptionCheckoutModal } from '../components/dental/ReceptionCheckoutModal';
import { PatientRecord, ClinicVisit } from '../types';
import { 
  Volume2, 
  SkipForward, 
  PauseCircle, 
  CheckCircle2, 
  Tv2, 
  Users, 
  Clock, 
  Activity, 
  Stethoscope,
  Play,
  ArrowRight,
  Filter,
  UserCheck,
  FileText,
  AlertTriangle,
  Pill,
  DollarSign,
  Receipt,
  Sparkles,
  Send
} from 'lucide-react';

export const TokenControlView: React.FC = () => {
  const { 
    tokens, 
    visits, 
    doctors, 
    patients, 
    invoices = [],
    callToken, 
    startConsultation, 
    completeConsultation, 
    holdToken, 
    skipToken, 
    setActiveView, 
    setSelectedPatientForDetail,
    setShouldOpenCaseSheetOnProfile,
    sentToDoctorTokens,
    sendTokenToDoctor,
    addToast 
  } = useApp();

  const { currentUser } = useAuth();
  const isReceptionist = currentUser.role === 'receptionist' || currentUser.role === 'billing';

  // If logged-in user is doctor, default doctorFilter to their doctorId
  const initialDoctorFilter = currentUser.role === 'doctor' && currentUser.doctorId ? currentUser.doctorId : 'ALL';
  const [doctorFilter, setDoctorFilter] = useState<string>(initialDoctorFilter);

  // Consultation completion modal state
  const [completingToken, setCompletingToken] = useState<any | null>(null);
  const [summaryNotes, setSummaryNotes] = useState('');
  const [summaryDiagnosis, setSummaryDiagnosis] = useState('');
  const [summaryTreatment, setSummaryTreatment] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');

  // Doctor Action Modals
  const [showFeeApprovalModal, setShowFeeApprovalModal] = useState(false);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);

  // Receptionist Checkout Modal from Queue
  const [checkoutVisitTarget, setCheckoutVisitTarget] = useState<ClinicVisit | null>(null);

  // Date filtering state: Default strictly to Today
  const [showAllDatesHistory, setShowAllDatesHistory] = useState(false);
  const todayDateStr = new Date().toISOString().split('T')[0];

  // Resolve the logged-in doctor's canonical record (handles missing currentUser.doctorId)
  const matchedDoctorRecord = currentUser.role === 'doctor'
    ? doctors.find((d) =>
        (currentUser.doctorId && d.id === currentUser.doctorId) ||
        d.id === currentUser.id ||
        (currentUser.email && d.email?.toLowerCase() === currentUser.email.toLowerCase()) ||
        (currentUser.name && d.name?.toLowerCase() === currentUser.name.toLowerCase())
      )
    : undefined;
  const myDoctorId = currentUser.doctorId || matchedDoctorRecord?.id || currentUser.id;
  const myDoctorName = (matchedDoctorRecord?.name || currentUser.name || '').toLowerCase().trim();

  // Filter tokens: only checked-in patients for TODAY'S clinic queue (unless user explicitly toggles history)
  const activeTokens = tokens
    .filter((t) => {
      if (!showAllDatesHistory) {
        const tokenDate = t.date || (t.createdAt && t.createdAt.includes('T') ? t.createdAt.split('T')[0] : todayDateStr);
        if (tokenDate !== todayDateStr) {
          return false;
        }
      }
      if (currentUser.role === 'doctor') {
        const docNameLower = (t.doctorName || '').toLowerCase().trim();
        const isUnassignedDoctor = !docNameLower || docNameLower === 'consulting doctor' || docNameLower === 'doctor' || docNameLower === 'any';
        if (isUnassignedDoctor && (!t.doctorId || t.doctorId === 'doc-1')) {
          return true; // Unassigned tokens are visible to all doctors
        }
        return (
          (myDoctorId && t.doctorId === myDoctorId) ||
          (myDoctorName && docNameLower === myDoctorName)
        );
      }
      if (doctorFilter !== 'ALL') {
        return t.doctorId === doctorFilter;
      }
      return true;
    })
    .map((t) => {
      const realPat = (!t.patientName || t.patientName === 'Patient') && t.patientId ? patients.find((p) => p.id === t.patientId) : undefined;
      const realDoc = (!t.doctorName || t.doctorName === 'Consulting Doctor') && t.doctorId ? doctors.find((d) => d.id === t.doctorId) : undefined;

      // Retroactive guard: if a visit/invoice for this token is already Completed/Paid, treat token as Completed
      const isAlreadyClosedVisit = visits.some(
        (v) => (v.status === 'Completed' || v.status === 'Closed') &&
          ((t.visitId && v.id === t.visitId) || (t.tokenNumber && v.tokenId === t.tokenNumber))
      );
      const isAlreadyPaidTokenInvoice = t.tokenNumber && invoices.some(
        (inv) => (inv.status === 'Paid' || (inv.balance <= 0 && inv.total > 0)) &&
          (inv.id.includes(`vis-${t.tokenNumber}-`) || (t.visitId && inv.visitId === t.visitId))
      );
      const effectiveStatus = (t.status === 'Waiting' || t.status === 'Called' || t.status === 'In Consultation' || t.status === 'Reception Follow-up') && (isAlreadyClosedVisit || isAlreadyPaidTokenInvoice)
        ? ('Completed' as const)
        : t.status;

      if (!realPat && !realDoc && effectiveStatus === t.status) return t;
      return {
        ...t,
        status: effectiveStatus,
        patientName: realPat?.name || t.patientName,
        patientPhone: realPat?.phone || t.patientPhone,
        doctorName: realDoc?.name || t.doctorName,
      };
    });

  // Current in consultation token
  const currentInConsultation = activeTokens.find((t) => t.status === 'In Consultation');
  const currentCalled = activeTokens.find((t) => t.status === 'Called');

  // Find linked visit and patient for active consultation
  const activeConsultationVisit = currentInConsultation
    ? visits.find((v) => v.id === currentInConsultation.visitId || v.tokenId === currentInConsultation.tokenNumber)
    : null;
  const activeConsultationPatient = currentInConsultation
    ? patients.find((p) => p.id === currentInConsultation.patientId)
    : null;

  // Active queue sorting: Emergency > Urgent > Normal, then check-in time
  const priorityRank = { Emergency: 0, Urgent: 1, Normal: 2 };
  
  const waitingQueue = activeTokens
    .filter((t) => t.status === 'Waiting' || t.status === 'On Hold')
    .sort((a, b) => {
      const pDiff = (priorityRank[a.priority] ?? 2) - (priorityRank[b.priority] ?? 2);
      if (pDiff !== 0) return pDiff;
      return a.createdAt.localeCompare(b.createdAt);
    });

  // Deduplicate followUpQueue: same patient should appear only once (keep the most recent)
  const followUpQueueRaw = activeTokens.filter((t) => t.status === 'Reception Follow-up');
  const followUpQueue = followUpQueueRaw.filter((t, idx, arr) => {
    const key = t.patientId || t.patientName?.toLowerCase() || t.tokenNumber;
    return arr.findIndex((x) => (x.patientId || x.patientName?.toLowerCase() || x.tokenNumber) === key) === idx;
  });
  const completedQueue = activeTokens.filter((t) => t.status === 'Completed');

  const handleOpenPatientProfile = (patientId: string, forceOpenIntake = false, fallbackToken?: QueueToken) => {
    const tok = fallbackToken || activeTokens.find((t) => t.patientId === patientId);
    const pat =
      patients.find((p) => p.id === patientId) ||
      (tok?.patientPhone ? patients.find((p) => p.phone === tok.patientPhone) : undefined) ||
      (tok?.patientName && tok.patientName !== 'Patient'
        ? patients.find((p) => p.name?.toLowerCase() === tok.patientName.toLowerCase())
        : undefined);

    const targetPatient: PatientRecord = pat || {
      id: (patientId && patientId !== 'PAT-TEMP' ? patientId : tok?.id) || `pat-${Date.now()}`,
      name: (tok?.patientName && tok.patientName !== 'Patient' ? tok.patientName : 'Walk-in Patient'),
      phone: tok?.patientPhone || '',
      age: 0,
      gender: 'Other',
      opNumber: tok?.opNumber || '',
      status: 'New Patient',
      totalVisits: 0,
      medicalHistory: '',
      allergies: '',
      dentalHistory: {},
    };

    setSelectedPatientForDetail(targetPatient);
    const isIntakeDone = Boolean(
      targetPatient.caseSheetCompleted ||
      targetPatient.dentalHistory?.caseSheetCompleted ||
      targetPatient.dentalHistory?.completedAt ||
      (targetPatient.id && (
        localStorage.getItem(`smilecare_intake_completed_${targetPatient.id}`) === 'true' ||
        sessionStorage.getItem(`smilecare_intake_completed_${targetPatient.id}`) === 'true'
      ))
    );

    if (forceOpenIntake || (!isIntakeDone && targetPatient.totalVisits === 0 && targetPatient.status === 'New Patient')) {
      setShouldOpenCaseSheetOnProfile(true);
    } else {
      setShouldOpenCaseSheetOnProfile(false);
    }
    setActiveView('patient-detail');
  };

  const handleConfirmComplete = () => {
    if (!completingToken) return;

    if (!summaryDiagnosis.trim()) {
      addToast('Validation', 'Please provide a clinical diagnosis before finalizing.', 'warning');
      return;
    }

    completeConsultation(completingToken.visitId || completingToken.tokenNumber, {
      notes: summaryNotes,
      diagnosis: summaryDiagnosis,
      treatmentPlan: summaryTreatment,
      followUpDate: followUpDate || undefined,
      tokenNumber: completingToken.tokenNumber,
      tokenId: completingToken.id,
      patientId: completingToken.patientId,
      patientName: completingToken.patientName,
      doctorId: completingToken.doctorId,
      doctorName: completingToken.doctorName
    });

    addToast(
      'Consultation Completed',
      `${completingToken.patientName}'s consultation complete. Patient forwarded to Reception for billing & follow-up.`,
      'success'
    );

    setCompletingToken(null);
    setSummaryNotes('');
    setSummaryDiagnosis('');
    setSummaryTreatment('');
    setFollowUpDate('');
  };

  return (
    <div className="workspace w-full max-w-full mx-auto px-2.5 sm:px-4 lg:px-6 py-3 sm:py-5 flex flex-col lg:flex-row gap-4 lg:gap-6">
      <Sidebar />

      <main className="flex-1 min-w-0 flex flex-col gap-4">
        <WorkspaceHeading title={currentUser.role === 'doctor' ? 'Consultation queue' : 'Patient queue'} />
        {currentUser.role !== 'doctor' && (
          <div className="module-filter-fields">
            <div><ClaySelect aria-label="Filter by doctor" value={doctorFilter} onChange={event => setDoctorFilter(event.target.value)}
              options={[{value: 'ALL', label: 'All doctors'}, ...doctors.map(doctor => ({value: doctor.id, label: doctor.name}))]} /></div>
            <button className="work-action" onClick={() => setActiveView('reception-tv')}><Tv2 size={16} /> Reception TV</button>
          </div>
        )}

        {/* ACTIVE OPERATORY DISPLAY BOX */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* CURRENT IN CABIN / CALLED HIGHLIGHT */}
          <div className="lg:col-span-8">
            <ClayCard variant="accent" className="p-3.5 sm:p-5 relative flex flex-col justify-between">
              <div>
                <div className="module-section-heading pb-2 border-b border-sky-200">
                  <span className="text-xs font-black uppercase text-sky-900 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                    Consultation room
                  </span>
                  {currentInConsultation ? (
                    <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black border border-emerald-300">
                      In Consultation
                    </span>
                  ) : currentCalled ? (
                    <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-black border border-amber-300">
                      Patient Called • Proceeding to Cabin
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-slate-400">Available</span>
                  )}
                </div>

                {currentInConsultation ? (
                  <div className="py-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div>
                      <div className="text-[11px] font-bold text-slate-500 uppercase">Now Serving Token</div>
                      <div className="text-4xl md:text-6xl font-black text-sky-950 font-mono tracking-tight my-1">
                        {currentInConsultation.tokenNumber}
                      </div>
                      <div className="text-xl font-black text-slate-900">{currentInConsultation.patientName}</div>
                      <div className="text-xs font-bold text-sky-800 mt-1 flex items-center gap-2">
                        <Stethoscope className="w-3.5 h-3.5" />
                        <span>Doctor: {currentInConsultation.doctorName}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 w-full md:w-auto">
                      {(!activeConsultationPatient || activeConsultationPatient.totalVisits === 0 || activeConsultationPatient.status === 'New Patient') ? (
                        <ClayButton
                          variant="mint"
                          size="md"
                          onClick={() => handleOpenPatientProfile(currentInConsultation.patientId, true, currentInConsultation)}
                          icon={<Sparkles className="w-4 h-4 text-amber-200" />}
                        >
                          Fill First Visit Intake Form 📋
                        </ClayButton>
                      ) : (
                        <ClayButton
                          variant="primary"
                          size="md"
                          onClick={() => handleOpenPatientProfile(currentInConsultation.patientId, false, currentInConsultation)}
                          icon={<FileText className="w-4 h-4" />}
                        >
                          Open Patient Profile (EMR)
                        </ClayButton>
                      )}

                      <div className="flex items-center gap-2">
                        <ClayButton
                          variant="secondary"
                          size="sm"
                          onClick={() => holdToken(currentInConsultation.tokenNumber)}
                          icon={<PauseCircle className="w-3.5 h-3.5 text-indigo-600" />}
                        >
                          Hold
                        </ClayButton>
                        <ClayButton
                          variant="warning"
                          size="sm"
                          onClick={() => skipToken(currentInConsultation.tokenNumber)}
                          icon={<SkipForward className="w-3.5 h-3.5 text-amber-700" />}
                        >
                          Skip
                        </ClayButton>
                      </div>
                    </div>
                  </div>
                ) : currentCalled ? (
                  <div className="py-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div>
                      <div className="text-[11px] font-bold text-amber-700 uppercase">Called & Directed to Doctor</div>
                      <div className="text-4xl md:text-6xl font-black text-amber-950 font-mono tracking-tight my-1">
                        {currentCalled.tokenNumber}
                      </div>
                      <div className="text-xl font-black text-slate-900">{currentCalled.patientName}</div>
                      <div className="text-xs font-bold text-sky-800 mt-1 flex items-center gap-2">
                        <Stethoscope className="w-3.5 h-3.5" />
                        <span>Doctor: {currentCalled.doctorName}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2.5 w-full md:w-auto">
                      <ClayButton
                        variant="mint"
                        size="lg"
                        onClick={() => startConsultation(currentCalled.tokenNumber)}
                        icon={<Play className="w-5 h-5" />}
                      >
                        START CONSULTATION ▶
                      </ClayButton>

                      <ClayButton
                        variant="secondary"
                        size="sm"
                        onClick={() => callToken(currentCalled.tokenNumber)}
                        icon={<Volume2 className="w-4 h-4" />}
                      >
                        Re-Call Announcement 🔔
                      </ClayButton>
                    </div>
                  </div>
                ) : (
                  <div className="py-4">
                    <div>
                      <h4 className="text-base font-semibold text-slate-700">No active consultation</h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {isReceptionist 
                          ? 'Send checked-in patients to the doctor’s cabin from the queue below.' 
                          : 'Select a waiting token from the queue below to call.'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="module-section-heading pt-2 border-t border-sky-200/80 text-xs text-slate-600">
                <span>Waiting <strong>{waitingQueue.length}</strong></span>
                <span>Follow-up <strong>{followUpQueue.length}</strong></span>
                <span>Completed <strong>{completedQueue.length}</strong></span>
              </div>
            </ClayCard>
          </div>

          {/* QUICK CALL NEXT STATION */}
          <div className="lg:col-span-4">
            <ClayCard className="p-4 h-full flex flex-col justify-between space-y-3">
              <div>
                <span className="text-xs font-black uppercase text-slate-400 tracking-wider">
                  {isReceptionist ? 'Reception Dispatch Station' : 'Call Next Waiting Patient'}
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">
                  {isReceptionist ? 'Send to Doctor Station' : 'Call next patient'}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {isReceptionist
                    ? 'Direct arriving patients to their designated doctor’s consultation cabin:'
                    : 'Ready to announce and call the next arriving patient directly into the consulting room:'}
                </p>
              </div>

              {waitingQueue.length > 0 ? (
                <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-sky-800">Next in Line:</span>
                    <span className="text-lg font-black text-sky-950 font-mono">
                      {waitingQueue[0].tokenNumber}
                    </span>
                  </div>
                  <div className="text-xs font-extrabold text-slate-800">
                    {waitingQueue[0].patientName}
                  </div>
                  <div className="text-[11px] text-slate-600 flex items-center gap-1.5">
                    <Stethoscope className="w-3.5 h-3.5 text-sky-700" />
                    <span>Doctor: {waitingQueue[0].doctorName}</span>
                  </div>

                  {isReceptionist ? (
                    sentToDoctorTokens.includes(waitingQueue[0].tokenNumber) ? (
                      <div className="w-full mt-2 py-2.5 px-3 rounded-xl bg-emerald-100 text-emerald-900 text-xs font-bold border border-emerald-300 flex items-center justify-center gap-2 shadow-2xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                        <span>Sent to Dr. {waitingQueue[0].doctorName} Cabin ✓</span>
                      </div>
                    ) : (
                      <ClayButton
                        variant="mint"
                        size="md"
                        className="w-full mt-2"
                        onClick={() => sendTokenToDoctor(waitingQueue[0].tokenNumber)}
                        icon={<Send className="w-4 h-4" />}
                      >
                        SEND TO DOCTOR 🩺
                      </ClayButton>
                    )
                  ) : (
                    <ClayButton
                      variant="mint"
                      size="md"
                      className="w-full mt-2"
                      onClick={() => callToken(waitingQueue[0].tokenNumber)}
                      icon={<Volume2 className="w-4 h-4" />}
                    >
                      CALL {waitingQueue[0].tokenNumber} 🔔
                    </ClayButton>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 text-center text-xs text-slate-400 font-bold">
                  Queue is clear! Check in arriving patients from the Check-In Desk.
                </div>
              )}
            </ClayCard>
          </div>
        </div>

        {/* SECTION: PATIENTS IN RECEPTION FOLLOW-UP / BILLING */}
        {followUpQueue.length > 0 && (
          <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-amber-700" />
                <h3 className="text-sm font-black text-amber-950">
                  Ready for Reception Billing & Checkout ({followUpQueue.length})
                </h3>
              </div>
              <span className="text-[11px] font-bold text-amber-800">
                Doctor consultation finalized • Patient at front desk
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {followUpQueue.map((tok) => {
                const linkedVis = visits.find((v) => 
                  (tok.visitId && v.id === tok.visitId) || 
                  (tok.tokenNumber && v.tokenId === tok.tokenNumber) ||
                  (tok.patientId && v.patientId === tok.patientId && v.status !== 'Completed') ||
                  (tok.patientName && v.patientName?.toLowerCase() === tok.patientName?.toLowerCase() && v.status !== 'Completed')
                );
                return (
                  <div
                    key={tok.id}
                    className="module-section-heading bg-white border border-amber-200 rounded-xl p-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-mono text-xs font-black">
                          {tok.tokenNumber}
                        </span>
                        <strong className="text-sm font-black text-slate-900">{tok.patientName}</strong>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        Doctor: {tok.doctorName}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (linkedVis) {
                          setCheckoutVisitTarget(linkedVis);
                        } else {
                          const pat = patients.find((p) => p.id === tok.patientId || (p.name && tok.patientName && p.name.toLowerCase() === tok.patientName.toLowerCase()));
                          const fallbackVis: ClinicVisit = {
                            id: tok.visitId || `vis-${tok.id}`,
                            patientId: tok.patientId || pat?.id || `pat-${Date.now()}`,
                            patientName: tok.patientName,
                            patientPhone: tok.patientPhone,
                            doctorId: tok.doctorId || 'doc-1',
                            doctorName: tok.doctorName || 'Attending Doctor',
                            tokenId: tok.tokenNumber,
                            visitDate: new Date().toISOString().split('T')[0],
                            checkInTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
                            status: 'Reception Follow-up',
                            priority: 'Normal',
                            reasonForVisit: tok.reasonForVisit || 'Dental Consultation & Procedure',
                            timeline: []
                          };
                          setCheckoutVisitTarget(fallbackVis);
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1 shadow-2xs cursor-pointer"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>Settle & Checkout</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ACTIVE WAITING QUEUE TABLE */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
            <div>
              <h2 className="text-sm sm:text-base font-black text-slate-800 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-sky-600" />
                <span>Waiting queue ({waitingQueue.length})</span>
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500">
                Ordered by priority, then arrival time.
              </p>
            </div>

            {/* Same-line compact controls */}
            <div className="flex items-center gap-2 shrink-0 flex-nowrap w-fit self-start sm:self-auto">
              <div className="inline-flex items-center p-0.5 rounded-lg bg-slate-100 border border-slate-200/90 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowAllDatesHistory(false)}
                  className={`queue-filter-btn px-2.5 py-1 rounded-md text-[11px] font-extrabold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                    !showAllDatesHistory
                      ? 'bg-white text-sky-800 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => setShowAllDatesHistory(true)}
                  className={`queue-filter-btn px-2.5 py-1 rounded-md text-[11px] font-extrabold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                    showAllDatesHistory
                      ? 'bg-white text-sky-800 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span className="sm:hidden">All</span>
                  <span className="hidden sm:inline">All Dates</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setActiveView('staff-checkin')}
                className="queue-filter-btn inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 font-extrabold text-[11px] border border-slate-200 shadow-2xs transition-all whitespace-nowrap cursor-pointer shrink-0"
              >
                <span>Check-In<span className="hidden sm:inline"> Desk</span></span>
                <ArrowRight className="w-3 h-3 text-slate-400" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {waitingQueue.map((tok) => {
              const isCalled = tok.status === 'Called';
              const pat = patients.find((p) => p.id === tok.patientId);
              const isFirstVisit = !pat || pat.totalVisits === 0 || pat.status === 'New Patient';
              return (
                <div
                  key={tok.id}
                  className={`clay-card p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border transition-all ${
                    isCalled 
                      ? 'border-amber-300 bg-amber-50/40 ring-2 ring-amber-300' 
                      : tok.priority === 'Emergency'
                      ? 'border-rose-300 bg-rose-50/30'
                      : 'border-white hover:border-sky-300'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl clay-card-accent flex flex-col items-center justify-center text-center shrink-0">
                      <span className="text-xl font-black text-sky-950 font-mono tracking-tight">
                        {tok.tokenNumber}
                      </span>
                      <span className={`text-[8px] font-black uppercase px-1 rounded ${
                        tok.priority === 'Emergency'
                          ? 'bg-rose-500 text-white'
                          : tok.priority === 'Urgent'
                          ? 'bg-amber-500 text-white'
                          : 'bg-sky-200 text-sky-800'
                      }`}>
                        {tok.priority}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-base font-black text-slate-900">{tok.patientName}</h4>
                        <span className="text-xs font-bold text-slate-400 font-mono">({tok.patientId})</span>
                        {isFirstVisit && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold border border-amber-300">
                            First Visit 🌟
                          </span>
                        )}
                        <StatusBadge status={tok.status as any} />
                      </div>

                      <div className="text-xs text-slate-500 font-semibold mt-1 flex flex-wrap items-center gap-3">
                        <span className="text-sky-700 font-bold flex items-center gap-1">
                          <Stethoscope className="w-3 h-3" />
                          Doctor: {tok.doctorName}
                        </span>
                        <span>•</span>
                        <span>Check-In: <strong>{tok.createdAt}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                    {tok.status === 'Waiting' && (
                      isReceptionist ? (
                        sentToDoctorTokens.includes(tok.tokenNumber) ? (
                          <span className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 flex items-center gap-1.5 shadow-2xs">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Sent to Doctor Cabin</span>
                          </span>
                        ) : (
                          <ClayButton
                            variant="mint"
                            size="sm"
                            onClick={() => sendTokenToDoctor(tok.tokenNumber)}
                            icon={<Send className="w-3.5 h-3.5" />}
                          >
                            SEND TO DOCTOR 🩺
                          </ClayButton>
                        )
                      ) : (
                        <ClayButton
                          variant="mint"
                          size="sm"
                          onClick={() => callToken(tok.tokenNumber)}
                          icon={<Volume2 className="w-4 h-4" />}
                        >
                          CALL TOKEN 🔔
                        </ClayButton>
                      )
                    )}

                    {tok.status === 'Called' && (
                      isReceptionist ? (
                        <span className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-800 text-xs font-bold border border-blue-200 flex items-center gap-1.5">
                          <span>Called to Cabin</span>
                        </span>
                      ) : (
                        <ClayButton
                          variant="primary"
                          size="sm"
                          onClick={() => startConsultation(tok.tokenNumber)}
                          icon={<Play className="w-4 h-4" />}
                        >
                          START CONSULTATION ▶
                        </ClayButton>
                      )
                    )}

                    {isFirstVisit && (
                      <ClayButton
                        variant="accent"
                        size="sm"
                        onClick={() => handleOpenPatientProfile(tok.patientId, true, tok)}
                        icon={<Sparkles className="w-3.5 h-3.5 text-amber-600" />}
                        title="Open First Visit Clinical Intake Form"
                      >
                        Intake 📋
                      </ClayButton>
                    )}

                    <ClayButton
                      variant="secondary"
                      size="sm"
                      onClick={() => handleOpenPatientProfile(tok.patientId, false, tok)}
                      icon={<FileText className="w-3.5 h-3.5" />}
                    >
                      EMR
                    </ClayButton>
                  </div>
                </div>
              );
            })}

            {waitingQueue.length === 0 && (
              <div className="p-8 text-center text-xs text-slate-400 font-bold clay-card">
                No waiting patients in queue right now.
              </div>
            )}
          </div>
        </div>

        {/* CONSULTATION SUMMARY / COMPLETION MODAL */}
        {completingToken && (
          <ModalLayer onDismiss={() => setCompletingToken(null)} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
            <div className="clay-card w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-white space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <span className="text-[10px] font-black uppercase text-emerald-700 px-2 py-0.5 rounded-full bg-emerald-100">
                    Clinical Wrap-Up
                  </span>
                  <h3 className="text-xl font-black text-slate-900 mt-1">
                    Complete Consultation: {completingToken.patientName} ({completingToken.tokenNumber})
                  </h3>
                </div>
                <button aria-label="Close dialog"
                  onClick={() => setCompletingToken(null)}
                  className="p-2 text-slate-400 hover:text-slate-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Clinical Diagnosis <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={summaryDiagnosis}
                    onChange={(e) => setSummaryDiagnosis(e.target.value)}
                    placeholder="e.g. Irreversible Pulpitis #36"
                    className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Treatment Performed / Planned</label>
                  <input
                    type="text"
                    value={summaryTreatment}
                    onChange={(e) => setSummaryTreatment(e.target.value)}
                    placeholder="e.g. Root Canal Access & Biomechanical Prep"
                    className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Doctor's Clinical Notes</label>
                  <textarea
                    rows={3}
                    value={summaryNotes}
                    onChange={(e) => setSummaryNotes(e.target.value)}
                    placeholder="Enter observation notes, medicine prescribed, or treatment progress..."
                    className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Schedule Follow-up Date (Optional)</label>
                  <input
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <ClayButton
                  variant="secondary"
                  size="sm"
                  onClick={() => setCompletingToken(null)}
                >
                  Cancel
                </ClayButton>
                <ClayButton
                  variant="mint"
                  size="md"
                  onClick={handleConfirmComplete}
                  icon={<CheckCircle2 className="w-4 h-4" />}
                >
                  COMPLETE CONSULTATION ✓
                </ClayButton>
              </div>
            </div>
          </ModalLayer>
        )}

        {/* DOCTOR FEE APPROVAL MODAL */}
        {showFeeApprovalModal && activeConsultationVisit && (
          <DoctorFeeApprovalModal
            isOpen={showFeeApprovalModal}
            onClose={() => setShowFeeApprovalModal(false)}
            visit={activeConsultationVisit}
            visitId={activeConsultationVisit.id}
            patient={activeConsultationPatient || undefined}
            patientId={activeConsultationVisit.patientId}
            patientName={activeConsultationVisit.patientName}
            defaultDoctorName={activeConsultationVisit.doctorName}
          />
        )}

        {/* DOCTOR PRESCRIPTION MODAL */}
        {showPrescriptionModal && activeConsultationVisit && (
          <DoctorPrescriptionModal
            isOpen={showPrescriptionModal}
            onClose={() => setShowPrescriptionModal(false)}
            visit={activeConsultationVisit}
            visitId={activeConsultationVisit.id}
            patient={activeConsultationPatient || undefined}
            patientId={activeConsultationVisit.patientId}
            patientName={activeConsultationVisit.patientName}
            doctorName={activeConsultationVisit.doctorName}
          />
        )}

        {/* RECEPTION BILLING & CHECKOUT MODAL */}
        {checkoutVisitTarget && (
          <ReceptionCheckoutModal
            isOpen={!!checkoutVisitTarget}
            onClose={() => setCheckoutVisitTarget(null)}
            visit={checkoutVisitTarget}
            patient={
              patients.find((p) => p.id === checkoutVisitTarget.patientId || (p.name && checkoutVisitTarget.patientName && p.name.toLowerCase() === checkoutVisitTarget.patientName.toLowerCase())) ||
              ({
                id: checkoutVisitTarget.patientId,
                name: checkoutVisitTarget.patientName,
                phone: checkoutVisitTarget.patientPhone || 'N/A',
                outstandingBalance: checkoutVisitTarget.feeApproval?.finalPayable || 0
              } as PatientRecord)
            }
          />
        )}
      </main>
    </div>
  );
};
