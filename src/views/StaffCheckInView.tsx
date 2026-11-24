import { WalkInTokenDialog } from '../components/dental/WalkInTokenDialog';
import { PrioritySelector } from '../components/common/PrioritySelector';
import './clinic-modules.css';
import { SectionPicker, WorkspaceHeading } from '../components/common/WorkspaceControls';
import { ModalLayer } from '../components/common/ModalLayer';
import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ClayCard } from '../components/common/ClayCard';
import { ClayButton } from '../components/common/ClayButton';
import { ClayInput } from '../components/common/ClayInput';
import { ClaySelect } from '../components/common/ClaySelect';
import { Sidebar } from '../components/common/Sidebar';
import { Appointment, PatientRecord, ClinicVisit, PatientEnquiry } from '../types';
import { NewPatientRegistrationModal, InitialPatientData } from '../components/dental/NewPatientRegistrationModal';
import { ReceptionCheckoutModal } from '../components/dental/ReceptionCheckoutModal';
import { ReceptionBookingModal } from '../components/dental/ReceptionBookingModal';
import { 
  UserCheck, 
  Calendar, 
  Clock, 
  Search, 
  UserPlus, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  Phone, 
  Sparkles,
  ArrowRight,
  Stethoscope,
  Filter,
  Activity,
  Plus,
  Receipt,
  User,
  ShieldAlert,
  Send,
  Tv2,
  Inbox,
  MessageSquare,
  PhoneCall,
  Check,
  Calendar as CalendarIcon,
  RefreshCw,
  ExternalLink,
  Trash2
} from 'lucide-react';

export const StaffCheckInView: React.FC = () => {
  const { 
    appointments, 
    patients, 
    doctors, 
    visits,
    tokens,
    enquiries = [],
    updateEnquiryStatus,
    deleteEnquiry,
    clearAllEnquiries,
    sendAppointmentWhatsApp,
    checkInPatient, 
    createWalkInPatient, 
    callToken,
    holdToken,
    markNoShow,
    rescheduleAppointment,
    setActiveView,
    setSelectedPatientForDetail,
    setShouldOpenCaseSheetOnProfile,
    sentToDoctorTokens,
    sendTokenToDoctor,
    refreshState,
    addToast 
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'queue' | 'scheduled' | 'enquiries' | 'returning' | 'checkout'>('queue');

  useEffect(() => {
    if (activeSubTab === 'enquiries' && refreshState) {
      refreshState();
    }
  }, [activeSubTab, refreshState]);
  const [searchTerm, setSearchTerm] = useState('');
  const [doctorFilter, setDoctorFilter] = useState('ALL');

  // Enquiries & Online Booking State
  const [enquiryFilter, setEnquiryFilter] = useState<'ALL' | 'New' | 'Contacted' | 'Appointment Booked' | 'Registered'>('ALL');
  const [enquirySearchTerm, setEnquirySearchTerm] = useState('');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingInitialData, setBookingInitialData] = useState<{
    patientName?: string;
    phone?: string;
    email?: string;
    doctorId?: string;
    reason?: string;
    date?: string;
    timeSlot?: string;
    enquiryId?: string;
  } | null>(null);
  const [registerInitialData, setRegisterInitialData] = useState<InitialPatientData | null>(null);

  // Modals state
  const [showNewPatientModal, setShowNewPatientModal] = useState(false);
  const [checkoutVisitTarget, setCheckoutVisitTarget] = useState<ClinicVisit | null>(null);

  // Check-In Arrival Modal State
  const [checkInModalAppointment, setCheckInModalAppointment] = useState<Appointment | null>(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [priority, setPriority] = useState<'Normal' | 'Urgent' | 'Emergency'>('Normal');
  const [reasonOverride, setReasonOverride] = useState<string>('');

  // Walk-In Patient Modal State
  const [showWalkInModal, setShowWalkInModal] = useState(false);
  const [walkInName, setWalkInName] = useState('');
  const [walkInPhone, setWalkInPhone] = useState('');
  const [walkInAge, setWalkInAge] = useState('30');
  const [walkInGender, setWalkInGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [walkInDoctorId, setWalkInDoctorId] = useState(doctors[0]?.id || '');
  const [walkInReason, setWalkInReason] = useState('Emergency Dental Pain & Checkup');
  const [walkInPriority, setWalkInPriority] = useState<'Normal' | 'Urgent' | 'Emergency'>('Urgent');

  // Returning Patient Quick Check-in State
  const [returningSearchTerm, setReturningSearchTerm] = useState('');
  const [returningPatientTarget, setReturningPatientTarget] = useState<PatientRecord | null>(null);
  const [returningDoctorId, setReturningDoctorId] = useState(doctors[0]?.id || '');
  const [returningPriority, setReturningPriority] = useState<'Normal' | 'Urgent' | 'Emergency'>('Normal');
  const [returningReason, setReturningReason] = useState('Consultation & Follow-up');

  // Reschedule Modal State
  const [rescheduleAppointmentTarget, setRescheduleAppointmentTarget] = useState<Appointment | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTimeSlot, setRescheduleTimeSlot] = useState('11:00 AM');

  // Filter today's appointments that need check-in or have checked in
  const [sentDoctorAppointmentIds, setSentDoctorAppointmentIds] = useState<Set<string>>(new Set());

  const handleSendToDoctor = (apt: Appointment) => {
    setSentDoctorAppointmentIds((prev) => {
      const next = new Set(prev);
      next.add(apt.id);
      return next;
    });
    const doc = doctors.find((d) => d.id === apt.doctorId);
    addToast(
      'Sent to Doctor Cabin 🩺',
      `Patient ${apt.patientName} (Token: ${apt.tokenId || 'Active'}) sent to Dr. ${doc?.name || apt.doctorName || 'Doctor'}'s consultation queue.`,
      'success'
    );
  };

  const todayAppointments = appointments.filter((apt) => {
    const matchesSearch = 
      (apt.patientName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (apt.patientPhone || '').includes(searchTerm) ||
      (apt.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (apt.tokenId && apt.tokenId.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesDoctor = doctorFilter === 'ALL' || apt.doctorId === doctorFilter;
    return matchesSearch && matchesDoctor;
  });

  // Returning patient search matches
  const returningPatients = useMemo(() => {
    if (!returningSearchTerm.trim()) return [];
    const query = returningSearchTerm.toLowerCase();
    return patients.filter(
      (p) =>
        (p.name || '').toLowerCase().includes(query) ||
        (p.phone || '').includes(query) ||
        (p.id || '').toLowerCase().includes(query) ||
        (p.opNumber && p.opNumber.toLowerCase().includes(query))
    );
  }, [patients, returningSearchTerm]);

  // Today's Active Tokens in Clinic (Filtered strictly by Today's Date)
  const todayActiveTokens = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return tokens.filter((t) => {
      // Exclude tokens from past dates
      const tokenDate = t.date || (t.createdAt && t.createdAt.includes('T') ? t.createdAt.split('T')[0] : today);
      if (tokenDate !== today) return false;

      const matchesSearch =
        !searchTerm.trim() ||
        (t.patientName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.patientPhone && t.patientPhone.includes(searchTerm)) ||
        (t.tokenNumber || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDoctor = doctorFilter === 'ALL' || t.doctorId === doctorFilter;
      return matchesSearch && matchesDoctor;
    });
  }, [tokens, searchTerm, doctorFilter]);

  const waitingTokensCount = todayActiveTokens.filter(
    (t) => t.status === 'Waiting' || t.status === 'Called' || t.status === 'In Consultation' || t.status === 'On Hold'
  ).length;

  // Patients waiting for receptionist checkout (Phase 8)
  const checkoutVisits = visits.filter((v) => v.status === 'Reception Follow-up');
  const arrivedCount = waitingTokensCount || appointments.filter((a) => a.status === 'Waiting').length;

  // Open check-in modal
  const handleOpenCheckIn = (apt: Appointment) => {
    setCheckInModalAppointment(apt);
    setSelectedDoctorId(apt.doctorId);
    setReasonOverride(apt.reasonForVisit);
    setPriority('Normal');
  };

  // Confirm Check-In
  const handleConfirmArrival = () => {
    if (!checkInModalAppointment) return;

    const pat = patients.find(
      (p) => p.id === checkInModalAppointment.patientId || p.phone === checkInModalAppointment.patientPhone || p.name === checkInModalAppointment.patientName
    );

    checkInPatient({
      appointmentId: checkInModalAppointment.id,
      patientId: pat?.id || checkInModalAppointment.patientId || checkInModalAppointment.id,
      doctorId: selectedDoctorId || checkInModalAppointment.doctorId,
      priority,
      reasonForVisit: reasonOverride || checkInModalAppointment.reasonForVisit
    });

    setCheckInModalAppointment(null);
    setActiveSubTab('queue');
  };

  // Submit Returning Patient Arrival
  const handleConfirmReturningArrival = async () => {
    if (!returningPatientTarget) return;

    try {
      const res = await checkInPatient({
        patientId: returningPatientTarget.id,
        doctorId: returningDoctorId || returningPatientTarget.assignedDoctorId || doctors[0]?.id || 'doc-1',
        priority: returningPriority,
        reasonForVisit: returningReason || 'Regular Consultation',
        isWalkIn: true
      });

      addToast(
        'Token Issued',
        `Token #${res.token.tokenNumber} created for ${returningPatientTarget.name} (${returningPatientTarget.opNumber || returningPatientTarget.id})`,
        'success'
      );
      setReturningPatientTarget(null);
      setReturningSearchTerm('');
      setActiveSubTab('queue');
    } catch (err: any) {
      addToast('Check-in Failed', err.message, 'danger');
    }
  };

  // Submit Walk-In
  const handleConfirmWalkIn = async () => {
    if (!walkInName.trim() || !walkInPhone.trim()) {
      addToast('Missing Details', 'Please provide patient name and phone number.', 'danger');
      return;
    }

    try {
      const res = await createWalkInPatient({
        patientName: walkInName,
        patientPhone: walkInPhone,
        patientAge: parseInt(walkInAge, 10) || 30,
        patientGender: walkInGender,
        doctorId: walkInDoctorId || doctors[0]?.id || 'doc-1',
        reasonForVisit: walkInReason,
        priority: walkInPriority
      });

      setShowWalkInModal(false);
      setWalkInName('');
      setWalkInPhone('');
      setActiveSubTab('queue');
      addToast('Walk-In Token Created!', `Token #${res.token.tokenNumber} issued for ${walkInName}.`, 'success');
    } catch (e: any) {
      setShowWalkInModal(false);
      setWalkInName('');
      setWalkInPhone('');
      addToast('Walk-In Notice', e.message || 'Token could not be created.', 'warning');
      setActiveSubTab('queue');
    }
  };

  // Submit Reschedule
  const handleConfirmReschedule = () => {
    if (!rescheduleAppointmentTarget || !rescheduleDate) {
      addToast('Select Date', 'Please choose a new appointment date.', 'warning');
      return;
    }
    rescheduleAppointment(rescheduleAppointmentTarget.id, rescheduleDate, rescheduleTimeSlot);
    setRescheduleAppointmentTarget(null);
  };

  // Enquiries memo
  const newEnquiriesCount = useMemo(() => {
    return enquiries.filter((e) => e.status === 'New').length;
  }, [enquiries]);

  const filteredEnquiries = useMemo(() => {
    return enquiries.filter((enq) => {
      const matchFilter = enquiryFilter === 'ALL' || enq.status === enquiryFilter;
      const term = enquirySearchTerm.toLowerCase().trim();
      const matchSearch =
        !term ||
        (enq.patientName || '').toLowerCase().includes(term) ||
        (enq.phone || '').includes(term) ||
        (enq.chiefComplaint || '').toLowerCase().includes(term) ||
        (enq.id || '').toLowerCase().includes(term);
      return matchFilter && matchSearch;
    });
  }, [enquiries, enquiryFilter, enquirySearchTerm]);

  // Find linked patient details for selected check-in modal
  const linkedPatient = checkInModalAppointment 
    ? patients.find((p) => p.id === checkInModalAppointment.patientId || p.phone === checkInModalAppointment.patientPhone || p.name === checkInModalAppointment.patientName)
    : null;

  return (
    <div className="workspace w-full max-w-full mx-auto px-2.5 sm:px-4 lg:px-6 py-3 sm:py-5 flex flex-col lg:flex-row gap-4 lg:gap-6">
      <Sidebar />

      <main className="flex-1 min-w-0 flex flex-col gap-4">
        <div className="module-compact-heading"><WorkspaceHeading title="Reception desk">
          <button className="work-action primary" onClick={() => { setRegisterInitialData(null); setShowNewPatientModal(true); }}>
            <UserPlus size={13} />
            <span>Register<span className="hidden sm:inline"> patient</span></span>
          </button>
          <button className="work-action" onClick={() => setShowWalkInModal(true)}>
            <Plus size={13} />
            <span>Walk-in<span className="hidden sm:inline"> token</span></span>
          </button>
          <button className="work-action" onClick={() => setActiveView('reception-tv')}>
            <Tv2 size={13} />
            <span><span className="sm:hidden">TV</span><span className="hidden sm:inline">Reception TV</span></span>
          </button>
        </WorkspaceHeading></div>
        <SectionPicker label="Reception section" value={activeSubTab} onChange={setActiveSubTab} options={[
          { id: 'queue', label: 'Live queue', count: todayActiveTokens.length },
          { id: 'scheduled', label: 'Scheduled appointments', count: todayAppointments.length },
          { id: 'enquiries', label: 'Online inquiries', count: enquiries.length },
          { id: 'returning', label: 'Returning patient check-in' }, { id: 'checkout', label: 'Checkout desk', count: checkoutVisits.length }
        ]} />

        {/* High-Priority Notification Banner: Online Website Inquiries */}
        {newEnquiriesCount > 0 && activeSubTab !== 'enquiries' && (
          <div className="bg-rose-50 border-2 border-rose-300 rounded-xl px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs animate-in fade-in">
            <div className="flex items-center gap-2.5 text-rose-950 font-medium">
              <span className="relative flex h-3 w-3 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600"></span>
              </span>
              <span>
                <strong className="font-bold text-rose-950">New Online Booking Request:</strong> {newEnquiriesCount} website consultation inquiry {newEnquiriesCount === 1 ? 'is' : 'are'} waiting for WhatsApp confirmation or appointment booking!
              </span>
            </div>
            <button
              onClick={() => setActiveSubTab('enquiries')}
              className="px-3 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer self-start sm:self-auto shrink-0"
            >
              <span>View Online Inquiries ({newEnquiriesCount})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <p className="rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-950 px-2.5 py-1.5 flex items-center gap-1.5 font-medium">
          <span><strong>{arrivedCount}</strong> waiting</span>
          <span>·</span>
          <span><strong>{checkoutVisits.length}</strong> awaiting checkout</span>
        </p>

        {/* ========================================================= */}
        {/* SUB-TAB 0: TODAY'S LIVE QUEUE & WALK-IN TOKENS             */}
        {/* ========================================================= */}
        {activeSubTab === 'queue' && (
          <div className="space-y-3 sm:space-y-4 animate-in fade-in">
            {/* Filter bar */}
            <ClayCard className="p-2 sm:p-4 flex flex-col md:flex-row items-center justify-between gap-2.5 sm:gap-4">
              <div className="w-full md:w-80">
                <ClayInput
                  placeholder="Search token (e.g. W-013), patient, phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  icon={<Search className="w-3.5 h-3.5" />}
                />
              </div>

              <div className="flex items-center gap-2.5 w-full md:w-auto">
                <div className="w-full sm:w-52">
                  <ClaySelect
                    value={doctorFilter}
                    onChange={(e) => setDoctorFilter(e.target.value)}
                    options={[
                      { value: 'ALL', label: 'All Doctors' },
                      ...doctors.map((d) => ({ value: d.id, label: d.name }))
                    ]}
                  />
                </div>
              </div>
            </ClayCard>

            {/* Tokens Table */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between gap-2 px-1">
                <h2 className="text-xs sm:text-base font-black text-slate-800 flex items-center gap-1.5 min-w-0">
                  <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-600 shrink-0" />
                  <span className="truncate">
                    <span className="sm:hidden">Active Queue ({todayActiveTokens.length})</span>
                    <span className="hidden sm:inline">Today's Active Patient Queue ({todayActiveTokens.length})</span>
                  </span>
                </h2>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => setShowWalkInModal(true)}
                    className="h-7 px-2 sm:px-2.5 py-1 rounded-lg bg-sky-700 hover:bg-sky-800 text-white text-[11px] sm:text-xs font-extrabold flex items-center gap-1 shadow-2xs cursor-pointer transition-colors whitespace-nowrap"
                  >
                    <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    <span><span className="sm:hidden">Walk-In</span><span className="hidden sm:inline">+ Walk-In Token</span></span>
                  </button>
                </div>
              </div>

              {todayActiveTokens.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center mx-auto text-xl font-bold">
                    🎟️
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-800">No Active Tokens in Queue</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Use <strong>+ Walk-In Quick Token</strong> or check in an arriving patient from the Scheduled tab to issue a live queue token.
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse responsive-records">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 font-extrabold text-[11px] uppercase tracking-wider border-b border-slate-200">
                          <th className="py-3 px-4">Token #</th>
                          <th className="py-3 px-4">Patient Name</th>
                          <th className="py-3 px-4">Assigned Doctor</th>
                          <th className="py-3 px-4">Priority / Type</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4">Time</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs font-semibold">
                        {todayActiveTokens.map((t) => {
                          const doc = doctors.find((d) => d.id === t.doctorId);
                          const pat = patients.find((p) => p.id === t.patientId || p.name === t.patientName);
                          const isIntakeDone = Boolean(
                            pat?.caseSheetCompleted ||
                            pat?.dentalHistory?.caseSheetCompleted ||
                            pat?.dentalHistory?.completedAt ||
                            (pat?.id && (
                              localStorage.getItem(`smilecare_intake_completed_${pat.id}`) === 'true' ||
                              sessionStorage.getItem(`smilecare_intake_completed_${pat.id}`) === 'true'
                            ))
                          );
                          const isFirstVisit = !isIntakeDone && (!pat || pat.totalVisits === 0 || pat.status === 'New Patient');
                          const isWalkIn = t.tokenNumber.startsWith('W-');
                          const isUrgent = t.priority === 'Urgent' || t.priority === 'Emergency';
                          const isWaiting = t.status === 'Waiting';
                          const isCalled = t.status === 'Called';
                          const isInConsultation = t.status === 'In Consultation';

                          return (
                            <tr key={t.id || t.tokenNumber} className="hover:bg-sky-50/40 transition-colors">
                              <td data-label="Token #" className="py-3.5 px-4">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg font-black font-mono text-xs border ${
                                  isWalkIn 
                                    ? 'bg-amber-50 text-amber-900 border-amber-300' 
                                    : 'bg-sky-50 text-sky-900 border-sky-300'
                                }`}>
                                  {t.tokenNumber}
                                </span>
                              </td>
                              <td data-label="Patient Name" className="py-3.5 px-4">
                                <div>
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="font-extrabold text-slate-900 block">{t.patientName}</span>
                                    {isFirstVisit && (
                                      <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[9px] font-bold border border-amber-300">
                                        First Visit 🌟
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[11px] text-slate-500 font-mono">{t.patientPhone || 'Walk-In Patient'}</span>
                                </div>
                              </td>
                              <td data-label="Assigned Doctor" className="py-3.5 px-4">
                                <div>
                                  <span className="font-bold text-slate-800 block">{t.doctorName || doc?.name || 'Doctor'}</span>
                                  <span className="text-[10px] text-teal-700 font-semibold">{doc?.roomNumber || 'Consulting Room'}</span>
                                </div>
                              </td>
                              <td data-label="Priority / Type" className="py-3.5 px-4">
                                <div className="flex flex-col gap-1 items-start">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${
                                    isUrgent 
                                      ? 'bg-rose-50 text-rose-800 border-rose-200' 
                                      : 'bg-slate-100 text-slate-700 border-slate-200'
                                  }`}>
                                    {t.priority}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                    {isWalkIn ? 'Walk-In' : 'Appointment'}
                                  </span>
                                </div>
                              </td>
                              <td data-label="Status" className="py-3.5 px-4">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black border ${
                                  isWaiting
                                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                                    : isCalled
                                    ? 'bg-blue-100 text-blue-900 border-blue-300 animate-pulse'
                                    : isInConsultation
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    : 'bg-slate-100 text-slate-700 border-slate-200'
                                }`}>
                                  {t.status}
                                </span>
                              </td>
                              <td data-label="Time" className="py-3.5 px-4 text-slate-500 text-[11px] font-mono">
                                {t.createdAt ? t.createdAt.split('T')[1]?.slice(0, 5) || t.createdAt : 'Now'}
                              </td>
                              <td data-label="Actions" className="py-3.5 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5 flex-wrap">
                                  {isWaiting && (
                                    sentToDoctorTokens.includes(t.tokenNumber) ? (
                                      <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 flex items-center gap-1 shadow-2xs">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                        <span>Sent to Doctor Cabin</span>
                                      </span>
                                    ) : (
                                      <button
                                        onClick={() => sendTokenToDoctor(t.tokenNumber)}
                                        className="px-2.5 py-1 rounded-lg bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                                        title="Direct patient to assigned doctor cabin"
                                      >
                                        <Send className="w-3.5 h-3.5" />
                                        <span>Send to Doctor 🩺</span>
                                      </button>
                                    )
                                  )}

                                  {isCalled && (
                                    <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 text-[11px] font-bold border border-blue-200">
                                      Called to Room
                                    </span>
                                  )}

                                  {isFirstVisit && (
                                    <button
                                      onClick={() => {
                                        if (pat) {
                                          setSelectedPatientForDetail(pat);
                                          setShouldOpenCaseSheetOnProfile(true);
                                          setActiveView('patient-detail');
                                        } else {
                                          addToast('Intake', `Opening intake for ${t.patientName}`, 'info');
                                        }
                                      }}
                                      className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold flex items-center gap-1 cursor-pointer shadow-2xs"
                                      title="Open & Fill First Visit Clinical Intake Form"
                                    >
                                      <Sparkles className="w-3 h-3 text-amber-600" />
                                      <span>Intake 📋</span>
                                    </button>
                                  )}

                                  <button
                                    onClick={() => {
                                      if (pat) {
                                        setSelectedPatientForDetail(pat);
                                        setActiveView('patient-detail');
                                      } else {
                                        addToast('EMR', `Opening chart for ${t.patientName}`, 'info');
                                      }
                                    }}
                                    className="px-2 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium cursor-pointer"
                                    title="Open Patient Clinical Chart"
                                  >
                                    Profile
                                  </button>

                                  {isWaiting && (
                                    <button
                                      onClick={() => holdToken(t.tokenNumber)}
                                      className="px-2 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-medium cursor-pointer"
                                      title="Hold token temporarily"
                                    >
                                      Hold
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SUB-TAB 1: SCHEDULED APPOINTMENTS                         */}
        {/* ========================================================= */}
        {activeSubTab === 'scheduled' && (
          <div className="space-y-4">
            {/* Filter bar */}
            <ClayCard className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="w-full md:w-80">
                <ClayInput
                  placeholder="Search patient name, phone, APT ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  icon={<Search className="w-4 h-4" />}
                />
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="w-52">
                  <ClaySelect
                    value={doctorFilter}
                    onChange={(e) => setDoctorFilter(e.target.value)}
                    options={[
                      { value: 'ALL', label: 'All Doctors' },
                      ...doctors.map((d) => ({ value: d.id, label: d.name }))
                    ]}
                  />
                </div>
              </div>
            </ClayCard>

            {/* Appointments Table */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-sky-600" />
                  <span>Today's Scheduled Appointments ({todayAppointments.length})</span>
                </h2>
                <span className="text-xs font-bold text-slate-500">
                  Arrival triggers visit creation & token generation
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {todayAppointments.map((apt) => {
                  const isCheckedIn = !!apt.tokenId;
                  const isNoShow = apt.appointmentStatus === 'NO_SHOW' || apt.status === 'Cancelled';
                  const isCompleted = apt.status === 'Completed' || apt.appointmentStatus === 'COMPLETED';

                  return (
                    <div
                      key={apt.id}
                      className={`clay-card p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border transition-all ${
                        isCheckedIn 
                          ? 'border-emerald-200 bg-emerald-50/20' 
                          : isNoShow 
                          ? 'border-rose-200 bg-rose-50/10 opacity-75' 
                          : 'border-white hover:border-sky-300'
                      }`}
                    >
                      {/* Left Column: Time & Patient */}
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-2xl clay-card-flat flex flex-col items-center justify-center text-center shrink-0 border border-slate-200">
                          <Clock className="w-3.5 h-3.5 text-sky-600 mb-0.5" />
                          <span className="text-[11px] font-black text-slate-800 leading-tight">
                            {apt.timeSlot.split(' ')[0]}
                          </span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase">
                            {apt.timeSlot.split(' ')[1]}
                          </span>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-base font-black text-slate-900">{apt.patientName}</h3>
                            <span className="text-[11px] font-bold text-slate-400 font-mono">
                              ({apt.patientId || apt.id})
                            </span>

                            {isCheckedIn ? (
                              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black border border-emerald-300 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Checked In • Token {apt.tokenId}
                              </span>
                            ) : isNoShow ? (
                              <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-black border border-rose-300">
                                No-Show / Cancelled
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black border border-amber-300">
                                Confirmed • Awaiting Arrival
                              </span>
                            )}
                          </div>

                          <div className="text-xs text-slate-600 font-semibold mt-1 flex flex-wrap items-center gap-3">
                            <span className="text-sky-700 font-extrabold flex items-center gap-1">
                              <Stethoscope className="w-3.5 h-3.5" />
                              {apt.doctorName}
                            </span>
                            <span>•</span>
                            <span className="text-slate-700 font-medium">{apt.reasonForVisit}</span>
                            <span>•</span>
                            <span className="text-slate-500 font-mono">{apt.patientPhone}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right Actions */}
                      <div className="flex items-center gap-2 w-full lg:w-auto justify-end pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                        {!isCheckedIn && !isNoShow && !isCompleted && (
                          <>
                            <ClayButton
                              variant="mint"
                              size="md"
                              onClick={() => handleOpenCheckIn(apt)}
                              icon={<UserCheck className="w-4 h-4" />}
                            >
                              CHECK IN
                            </ClayButton>

                            <ClayButton
                              variant="secondary"
                              size="sm"
                              onClick={() => {
                                setRescheduleAppointmentTarget(apt);
                                setRescheduleDate(apt.date);
                                setRescheduleTimeSlot(apt.timeSlot);
                              }}
                            >
                              Reschedule
                            </ClayButton>

                            <button
                              onClick={() => markNoShow(apt.id)}
                              className="px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
                              title="Patient failed to arrive"
                            >
                              Mark No-Show
                            </button>
                          </>
                        )}

                        {isCheckedIn && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-emerald-700 bg-white px-3 py-1.5 rounded-xl border border-emerald-200">
                              Active Token: <strong>{apt.tokenId}</strong>
                            </span>
                            {sentDoctorAppointmentIds.has(apt.id) ? (
                              <button
                                onClick={() => handleSendToDoctor(apt)}
                                className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                                title="Patient token forwarded to doctor cabin. Click to notify cabin again."
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>✓ Sent to Doctor</span>
                              </button>
                            ) : (
                              <ClayButton
                                variant="mint"
                                size="sm"
                                onClick={() => handleSendToDoctor(apt)}
                                icon={<Send className="w-3.5 h-3.5" />}
                              >
                                Send to Doctor →
                              </ClayButton>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {todayAppointments.length === 0 && (
                  <div className="clay-card p-8 text-center text-slate-500 font-bold space-y-3">
                    <p>No appointments scheduled for today.</p>
                    {enquiries.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col items-center gap-2">
                        <p className="text-xs text-slate-600 font-semibold">
                          You have {enquiries.length} online consultation request{enquiries.length !== 1 ? 's' : ''} submitted by website visitors{newEnquiriesCount > 0 ? ` (${newEnquiriesCount} new)` : ''}.
                        </p>
                        <button
                          type="button"
                          onClick={() => setActiveSubTab('enquiries')}
                          className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                        >
                          <Inbox className="w-4 h-4" />
                          <span>Review Online Consultation Requests ({enquiries.length})</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SUB-TAB: ONLINE WEBSITE CONSULTATION ENQUIRIES             */}
        {/* ========================================================= */}
        {activeSubTab === 'enquiries' && (
          <div className="space-y-4 animate-in fade-in">
            {/* Top Stat Cards for Enquiries */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Total Inquiries</span>
                <span className="text-xl font-black text-slate-900">{enquiries.length}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 shadow-2xs">
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-700 block">New / Pending</span>
                <span className="text-xl font-black text-rose-700">{newEnquiriesCount}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200 shadow-2xs">
                <span className="text-[10px] font-black uppercase tracking-wider text-sky-700 block">Contacted</span>
                <span className="text-xl font-black text-sky-700">{enquiries.filter((e) => e.status === 'Contacted').length}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 shadow-2xs">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 block">Booked / Registered</span>
                <span className="text-xl font-black text-emerald-700">{enquiries.filter((e) => e.status === 'Appointment Booked' || e.status === 'Registered').length}</span>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <ClayCard className="p-4 flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
                {(['ALL', 'New', 'Contacted', 'Appointment Booked', 'Registered'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setEnquiryFilter(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      enquiryFilter === st
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {st === 'ALL' ? 'All Inquiries' : st}
                    {st === 'New' && newEnquiriesCount > 0 && (
                      <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[9px] bg-rose-500 text-white font-black">
                        {newEnquiriesCount}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <div className="w-full md:w-72">
                  <ClayInput
                    placeholder="Search name, phone, complaint..."
                    value={enquirySearchTerm}
                    onChange={(e) => setEnquirySearchTerm(e.target.value)}
                    icon={<Search className="w-4 h-4 text-slate-400" />}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    refreshState?.();
                    addToast('Cloud Sync', 'Syncing online inquiries with cloud database...', 'info');
                  }}
                  className="px-3 py-2 text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                  title="Sync online inquiries with Supabase"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-teal-700" />
                  <span className="hidden sm:inline">Sync</span>
                </button>
                {enquiries.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to clear all consultation inquiries?')) {
                        clearAllEnquiries();
                      }
                    }}
                    className="px-3 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                    title="Clear all consultation inquiries"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Clear All</span>
                  </button>
                )}
              </div>
            </ClayCard>

            {/* Enquiries List / Cards */}
            {filteredEnquiries.length === 0 ? (
              <ClayCard className="p-12 text-center">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                  <Inbox className="w-6 h-6 text-slate-400" />
                </div>
                <h4 className="text-sm font-bold text-slate-700">No consultation requests found</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  {enquirySearchTerm || enquiryFilter !== 'ALL'
                    ? 'No enquiries match your active search filters.'
                    : 'When patients submit consultation requests on the public website, they will appear here instantly for reception callback & scheduling.'}
                </p>
              </ClayCard>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredEnquiries.map((enq) => {
                  const cleanPhone = enq.phone.replace(/\D/g, '').slice(-10);
                  const isNew = enq.status === 'New';

                  const getStatusBadge = (status: PatientEnquiry['status']) => {
                    switch (status) {
                      case 'New':
                        return 'bg-rose-100 text-rose-800 border-rose-300 font-black';
                      case 'Contacted':
                        return 'bg-sky-100 text-sky-800 border-sky-300 font-bold';
                      case 'Appointment Booked':
                        return 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold';
                      case 'Registered':
                        return 'bg-teal-100 text-teal-800 border-teal-300 font-bold';
                      default:
                        return 'bg-slate-100 text-slate-700 border-slate-300';
                    }
                  };

                  return (
                    <div
                      key={enq.id}
                      className={`bg-white rounded-2xl p-4 sm:p-5 border flex flex-col justify-between gap-3 transition-all ${
                        isNew
                          ? 'border-rose-300 ring-2 ring-rose-100 shadow-md'
                          : 'border-slate-200 shadow-xs hover:border-slate-300'
                      }`}
                    >
                      <div className="space-y-3">
                        {/* Top ID & Time Row */}
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                              {enq.id}
                            </span>
                            <span className={`text-[10px] uppercase px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${getStatusBadge(enq.status)}`}>
                              {isNew && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>}
                              <span>{enq.status === 'New' ? 'NEW REQUEST' : enq.status}</span>
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-medium text-slate-400">
                              {new Date(enq.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            <button
                              type="button"
                              onClick={() => deleteEnquiry(enq.id)}
                              className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Delete consultation request"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Patient Name & Phone */}
                        <div>
                          <div className="flex items-center justify-between">
                            <h4 className="text-base font-bold text-slate-900">{enq.patientName}</h4>
                            <a
                              href={`tel:${enq.phone}`}
                              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline cursor-pointer"
                            >
                              <Phone className="w-3.5 h-3.5 text-emerald-600" />
                              <span>{enq.phone}</span>
                            </a>
                          </div>
                          {enq.email && (
                            <span className="text-[11px] text-slate-400 block">{enq.email}</span>
                          )}
                        </div>

                        {/* Dental Complaint Highlight */}
                        <div className="p-2.5 rounded-xl bg-teal-50/70 border border-teal-200/80">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-teal-800 block mb-0.5">
                            Chief Dental Concern
                          </span>
                          <span className="text-xs font-bold text-slate-900 block">
                            🦷 {enq.chiefComplaint}
                          </span>
                        </div>

                        {/* Timing and Preferred Doctor */}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                            <span className="text-[10px] font-semibold text-slate-400 uppercase block">Preferred Visit Date</span>
                            <span className="font-bold text-slate-800 block mt-0.5">{enq.preferredDate || 'Earliest Slot'}</span>
                            <span className="text-[11px] text-slate-500">{enq.preferredTimeWindow || 'Flexible'}</span>
                          </div>
                          <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                            <span className="text-[10px] font-semibold text-slate-400 uppercase block">Requested Doctor</span>
                            <span className="font-bold text-emerald-800 block mt-0.5 truncate">
                              {enq.preferredDoctorName || 'Any Specialist'}
                            </span>
                            <span className="text-[11px] text-slate-500">Shriya Dental Clinic</span>
                          </div>
                        </div>

                        {/* Patient Notes */}
                        {enq.notes && (
                          <div className="p-2 rounded-lg bg-amber-50/70 border border-amber-200 text-xs">
                            <span className="text-[10px] font-bold uppercase text-amber-800 block">Patient Message</span>
                            <p className="text-[11px] text-slate-700 mt-0.5">{enq.notes}</p>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons Toolbar */}
                      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                        {/* WhatsApp & Call */}
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              const greeting = encodeURIComponent(
                                `Hello ${enq.patientName}, Greetings from Shriya Multispeciality Dental Clinic (Pollachi Road, Kozhinjapara - 9400320890).\n\nWe received your online consultation request for "${enq.chiefComplaint}".\n\nOur dental specialist Dr. ${enq.preferredDoctorName || 'Doctor'} has consultation slots available on ${enq.preferredDate || 'tomorrow'} (${enq.preferredTimeWindow || 'flexible'}). What time would be convenient for you to visit?`
                              );
                              window.open(`https://wa.me/91${cleanPhone}?text=${greeting}`, '_blank');
                              if (enq.status === 'New') {
                                updateEnquiryStatus(enq.id, 'Contacted');
                              }
                            }}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                            title="Chat with Patient on WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Chat WhatsApp</span>
                          </button>

                          <a
                            href={`tel:${enq.phone}`}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                            title="Call Patient"
                          >
                            <PhoneCall className="w-3.5 h-3.5 text-sky-600" />
                          </a>
                        </div>

                        {/* Book Slot & Register */}
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setBookingInitialData({
                                patientName: enq.patientName,
                                phone: enq.phone,
                                email: enq.email,
                                doctorId: enq.preferredDoctorId,
                                reason: enq.chiefComplaint,
                                date: enq.preferredDate,
                                enquiryId: enq.id
                              });
                              setShowBookingModal(true);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                            title="Book verified appointment slot"
                          >
                            <CalendarIcon className="w-3.5 h-3.5 text-teal-700" />
                            <span>Book Slot</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setRegisterInitialData({
                                name: enq.patientName,
                                phone: enq.phone,
                                email: enq.email,
                                chiefComplaint: enq.chiefComplaint
                              });
                              setShowNewPatientModal(true);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                            title="Register new patient & issue OP token"
                          >
                            <UserPlus className="w-3.5 h-3.5 text-sky-700" />
                            <span>Register & OP Token</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* SUB-TAB 2: RETURNING PATIENT QUICK CHECK-IN (PHASE 2)     */}
        {/* ========================================================= */}
        {activeSubTab === 'returning' && (
          <div className="space-y-4">
            <ClayCard className="p-5 space-y-4">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-sky-600" />
                  <span>Search Returning Patient</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Search by OP Number (e.g. OP-2026-00001), Name, or Phone number. No need to re-register existing patients!
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <ClayInput
                    placeholder="Enter OP Number, patient name, or phone number..."
                    value={returningSearchTerm}
                    onChange={(e) => setReturningSearchTerm(e.target.value)}
                    icon={<Search className="w-4 h-4" />}
                  />
                </div>
                {returningSearchTerm && (
                  <button
                    onClick={() => setReturningSearchTerm('')}
                    className="px-3 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
                  >
                    Clear
                  </button>
                )}
              </div>
            </ClayCard>

            {/* Results Grid */}
            {returningSearchTerm.trim() && (
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-500 px-1">
                  Found {returningPatients.length} matching patient(s) in system
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {returningPatients.map((pat) => (
                    <div
                      key={pat.id}
                      className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs hover:border-sky-300 transition-all flex flex-col justify-between gap-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 text-[10px] font-black font-mono border border-sky-200">
                              {pat.opNumber || pat.id}
                            </span>
                            <h4 className="text-base font-black text-slate-900">{pat.name}</h4>
                          </div>

                          <div className="text-xs text-slate-600 font-medium mt-1 flex flex-wrap items-center gap-2">
                            <span>{pat.age} yrs • {pat.gender}</span>
                            <span>•</span>
                            <span className="font-mono">{pat.phone}</span>
                            <span>•</span>
                            <span>Last Visit: {pat.lastVisit || 'N/A'}</span>
                          </div>

                          {pat.medicalHistory?.allergies && pat.medicalHistory.allergies.length > 0 && (
                            <div className="mt-2 flex items-center gap-1.5 text-[11px] font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                              <ShieldAlert className="w-3.5 h-3.5" />
                              <span>Allergy: {pat.medicalHistory.allergies.join(', ')}</span>
                            </div>
                          )}
                        </div>

                        {pat.outstandingBalance > 0 && (
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 block font-bold">Outstanding</span>
                            <span className="text-xs font-mono font-black text-rose-600">
                              ₹{pat.outstandingBalance.toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                        <button
                          onClick={() => {
                            setSelectedPatientForDetail(pat);
                            setActiveView('patient-detail');
                          }}
                          className="text-xs font-bold text-sky-700 hover:underline cursor-pointer"
                        >
                          View Full History →
                        </button>

                        <button
                          onClick={() => {
                            setReturningPatientTarget(pat);
                            setReturningDoctorId(pat.assignedDoctorId || doctors[0]?.id || '');
                            setReturningReason('Consultation & Follow-up');
                            setReturningPriority('Normal');
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Check In Today 🎟️</span>
                        </button>
                      </div>
                    </div>
                  ))}

                  {returningPatients.length === 0 && (
                    <div className="col-span-2 p-8 text-center bg-white rounded-2xl border border-dashed border-slate-200 text-xs text-slate-500">
                      No patients found matching "{returningSearchTerm}". Click <strong>+ Register New Patient</strong> above to create a new registration.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* SUB-TAB 3: RETURNED FOR RECEPTION CHECKOUT (PHASE 8)       */}
        {/* ========================================================= */}
        {activeSubTab === 'checkout' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <div>
                <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-amber-600" />
                  <span>Patients Returned for Billing & Encounter Checkout ({checkoutVisits.length})</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Doctor has completed clinical consultation. Finalize payment, print receipt, book follow-up, and close encounter.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {checkoutVisits.map((vis) => {
                const pat = patients.find((p) => p.id === vis.patientId) || {
                  id: vis.patientId,
                  name: vis.patientName,
                  phone: vis.patientPhone || 'N/A',
                  outstandingBalance: 0
                } as PatientRecord;

                return (
                  <div
                    key={vis.id}
                    className="bg-white border-2 border-amber-300 rounded-2xl p-5 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[11px] font-black border border-amber-300">
                          Token {vis.tokenId}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-mono font-bold">
                          {pat.opNumber || pat.id}
                        </span>
                        <h4 className="text-base font-black text-slate-900">{vis.patientName}</h4>
                      </div>

                      <div className="text-xs text-slate-600 font-medium mt-1.5 flex flex-wrap items-center gap-3">
                        <span className="text-sky-700 font-bold flex items-center gap-1">
                          <Stethoscope className="w-3.5 h-3.5" />
                          Doctor: {vis.doctorName}
                        </span>
                        <span>•</span>
                        <span>Diagnosis: <strong>{vis.diagnosis || 'Consultation complete'}</strong></span>
                        {vis.treatment && (
                          <>
                            <span>•</span>
                            <span>Treatment: <strong>{vis.treatment}</strong></span>
                          </>
                        )}
                        {vis.followUp && (
                          <>
                            <span>•</span>
                            <span className="text-emerald-700 font-bold">Follow-Up: {vis.followUp}</span>
                          </>
                        )}
                      </div>

                      {vis.feeApproval && (
                        <div className="mt-2 text-xs font-semibold text-slate-700 flex items-center gap-3 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                          <span>Approved Billed: <strong>₹{vis.feeApproval.finalPayable}</strong></span>
                          {vis.feeApproval.discountAmount > 0 && (
                            <span className="text-emerald-700">
                              (Discount: ₹{vis.feeApproval.discountAmount} by {vis.feeApproval.approvedBy})
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
                      <button
                        onClick={() => {
                          setSelectedPatientForDetail(pat);
                          setActiveView('patient-detail');
                        }}
                        className="px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 border border-slate-200 cursor-pointer"
                      >
                        View History
                      </button>

                      <button
                        onClick={() => setCheckoutVisitTarget(vis)}
                        className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
                      >
                        <Receipt className="w-4 h-4" />
                        <span>Settle Bill & Checkout →</span>
                      </button>
                    </div>
                  </div>
                );
              })}

              {checkoutVisits.length === 0 && (
                <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-400 font-bold">
                  No patients currently waiting for reception checkout.
                </div>
              )}
            </div>
          </div>
        )}

        {/* CHECK-IN ARRIVAL MODAL */}
        {checkInModalAppointment && (
          <ModalLayer onDismiss={() => setCheckInModalAppointment(null)} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
            <div className="clay-card w-full max-w-2xl bg-white rounded-3xl p-6 shadow-2xl border border-white space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 px-2 py-0.5 rounded-full bg-emerald-100">
                    Patient Arrival Verification
                  </span>
                  <h3 className="text-xl font-black text-slate-900 mt-1">
                    Check-In: {checkInModalAppointment.patientName}
                  </h3>
                </div>
                <button aria-label="Close dialog"
                  onClick={() => setCheckInModalAppointment(null)}
                  className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Patient & Appointment Information Review Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
                <div>
                  <span className="text-[11px] text-slate-400 block font-bold">Patient Name & ID</span>
                  <span className="text-sm font-black text-slate-900">
                    {checkInModalAppointment.patientName}
                  </span>
                  <span className="text-[11px] text-slate-500 block font-mono">
                    {linkedPatient?.opNumber || linkedPatient?.id || checkInModalAppointment.patientId || 'New Registered'}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 block font-bold">Appointment ID</span>
                  <span className="text-sm font-black text-sky-700 font-mono">
                    {checkInModalAppointment.id}
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    Scheduled: {checkInModalAppointment.date} at {checkInModalAppointment.timeSlot}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 block font-bold">Reason for Visit</span>
                  <span className="text-xs font-extrabold text-slate-800">
                    {checkInModalAppointment.reasonForVisit}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 block font-bold">Previous Clinical Record</span>
                  <span className="text-xs font-extrabold text-slate-800">
                    Last Visit: {linkedPatient?.lastVisit || '12 Sep 2026'}
                  </span>
                  <span className="text-[11px] text-amber-700 font-bold block">
                    Outstanding: ₹{linkedPatient?.outstandingBalance ?? 0}
                  </span>
                </div>
              </div>

              {/* Arrival Processing Fields */}
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Assigned Doctor
                  </label>
                  <ClaySelect
                    value={selectedDoctorId}
                    onChange={(e) => setSelectedDoctorId(e.target.value)}
                    options={doctors.map((d) => ({
                      value: d.id,
                      label: `${d.name} (${d.specialization})`
                    }))}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <PrioritySelector label="Queue priority" value={priority} onChange={setPriority} />

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Clinical Reason Verification
                    </label>
                    <ClayInput
                      value={reasonOverride}
                      onChange={(e) => setReasonOverride(e.target.value)}
                      placeholder="Confirm or update reason for visit"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="clinic-dialog-actions">
                <ClayButton
                  variant="secondary"
                  size="md"
                  onClick={() => setCheckInModalAppointment(null)}
                >
                  Cancel
                </ClayButton>

                <ClayButton
                  variant="mint"
                  size="md"
                  onClick={handleConfirmArrival}
                  icon={<CheckCircle2 className="w-5 h-5" />}
                >
                  Confirm arrival
                </ClayButton>
              </div>
            </div>
          </ModalLayer>
        )}

                {/* RETURNING PATIENT ARRIVAL CHECK-IN MODAL */}
        {returningPatientTarget && (
          <ModalLayer onDismiss={() => setReturningPatientTarget(null)} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
            <div className="clay-card w-full max-w-xl bg-white rounded-3xl p-6 shadow-2xl border border-white space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <span className="text-[10px] font-black uppercase text-sky-700 px-2 py-0.5 rounded-full bg-sky-100">
                    Returning Patient Arrival
                  </span>
                  <h3 className="text-xl font-black text-slate-900 mt-1">
                    Check-In: {returningPatientTarget.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    OP: {returningPatientTarget.opNumber || returningPatientTarget.id} • Phone: {returningPatientTarget.phone}
                  </p>
                </div>
                <button aria-label="Close dialog"
                  onClick={() => setReturningPatientTarget(null)}
                  className="p-2 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Select Consulting Doctor</label>
                  <ClaySelect
                    value={returningDoctorId}
                    onChange={(e) => setReturningDoctorId(e.target.value)}
                    options={doctors.map((d) => ({
                      value: d.id,
                      label: `${d.name} (${d.specialization})`
                    }))}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Reason for Visit</label>
                  <ClayInput
                    value={returningReason}
                    onChange={(e) => setReturningReason(e.target.value)}
                    placeholder="e.g. Follow-up consultation, tooth pain, routine check"
                  />
                </div>

                <PrioritySelector label="Triage priority" value={returningPriority} onChange={setReturningPriority} />
              </div>

              <div className="clinic-dialog-actions">
                <ClayButton
                  variant="secondary"
                  size="md"
                  onClick={() => setReturningPatientTarget(null)}
                >
                  Cancel
                </ClayButton>
                <ClayButton
                  variant="mint"
                  size="md"
                  onClick={handleConfirmReturningArrival}
                  icon={<UserCheck className="w-5 h-5" />}
                >
                  Issue token
                </ClayButton>
              </div>
            </div>
          </ModalLayer>
        )}

                {/* WALK-IN PATIENT MODAL */}
        {showWalkInModal && <WalkInTokenDialog
          name={walkInName} phone={walkInPhone} age={walkInAge} gender={walkInGender}
          doctorId={walkInDoctorId} reason={walkInReason} priority={walkInPriority}
          doctors={doctors.map(doctor => ({ value: doctor.id, label: doctor.name + ' (' + doctor.specialization + ')' }))}
          onNameChange={setWalkInName} onPhoneChange={setWalkInPhone} onAgeChange={setWalkInAge}
          onGenderChange={setWalkInGender} onDoctorChange={setWalkInDoctorId}
          onReasonChange={setWalkInReason} onPriorityChange={setWalkInPriority}
          onClose={() => setShowWalkInModal(false)} onConfirm={handleConfirmWalkIn}
        />}

                {/* RESCHEDULE MODAL */}
        {rescheduleAppointmentTarget && (
          <ModalLayer onDismiss={() => setRescheduleAppointmentTarget(null)} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
            <div className="clay-card w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-white space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <h3 className="text-lg font-black text-slate-900">
                  Reschedule Appointment
                </h3>
                <button aria-label="Close dialog"
                  onClick={() => setRescheduleAppointmentTarget(null)}
                  className="p-2 text-slate-400 hover:text-slate-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3">
                <p className="text-xs text-slate-600">
                  Rescheduling <strong>{rescheduleAppointmentTarget.patientName}</strong> ({rescheduleAppointmentTarget.id})
                </p>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">New Date</label>
                  <ClayInput
                    type="date"
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">New Time Slot</label>
                  <ClaySelect
                    value={rescheduleTimeSlot}
                    onChange={(e) => setRescheduleTimeSlot(e.target.value)}
                    options={[
                      { value: '09:00 AM', label: '09:00 AM' },
                      { value: '10:00 AM', label: '10:00 AM' },
                      { value: '11:00 AM', label: '11:00 AM' },
                      { value: '02:00 PM', label: '02:00 PM' },
                      { value: '03:30 PM', label: '03:30 PM' },
                      { value: '05:00 PM', label: '05:00 PM' }
                    ]}
                  />
                </div>
              </div>

              <div className="clinic-dialog-actions">
                <ClayButton
                  variant="secondary"
                  size="sm"
                  onClick={() => setRescheduleAppointmentTarget(null)}
                >
                  Cancel
                </ClayButton>
                <ClayButton
                  variant="primary"
                  size="sm"
                  onClick={handleConfirmReschedule}
                >
                  Confirm Reschedule
                </ClayButton>
              </div>
            </div>
          </ModalLayer>
        )}

                {/* NEW PATIENT REGISTRATION MODAL (PHASE 2) */}
        {showNewPatientModal && (
          <NewPatientRegistrationModal
            isOpen={showNewPatientModal}
            initialData={registerInitialData || undefined}
            onClose={() => {
              setShowNewPatientModal(false);
              setRegisterInitialData(null);
            }}
            onRegisterPatient={(newPat) => {
              setSelectedPatientForDetail(newPat);
              setActiveView('patient-detail');
              setShowNewPatientModal(false);
              setRegisterInitialData(null);
            }}
          />
        )}

        {/* RECEPTION BOOKING MODAL (FOR WEBSITE ENQUIRIES & SCHEDULING) */}
        {showBookingModal && (
          <ReceptionBookingModal
            isOpen={showBookingModal}
            initialData={bookingInitialData}
            onClose={() => {
              setShowBookingModal(false);
              setBookingInitialData(null);
            }}
            onSuccess={(newApt) => {
              addToast('Appointment Booked! 📅', `Consultation confirmed for ${newApt.patientName}. WhatsApp notification ready.`, 'success');
              setShowBookingModal(false);
              setBookingInitialData(null);
              if (bookingInitialData?.enquiryId) {
                updateEnquiryStatus(bookingInitialData.enquiryId, 'Appointment Booked');
              }
            }}
          />
        )}

        {/* RECEPTION BILLING & CHECKOUT MODAL (PHASE 8) */}
        {checkoutVisitTarget && (
          <ReceptionCheckoutModal
            isOpen={!!checkoutVisitTarget}
            onClose={() => setCheckoutVisitTarget(null)}
            visit={checkoutVisitTarget}
            patient={
              patients.find((p) => p.id === checkoutVisitTarget.patientId) ||
              ({
                id: checkoutVisitTarget.patientId,
                name: checkoutVisitTarget.patientName,
                phone: checkoutVisitTarget.patientPhone || 'N/A',
                outstandingBalance: 0
              } as PatientRecord)
            }
          />
        )}
      </main>
    </div>
  );
};
