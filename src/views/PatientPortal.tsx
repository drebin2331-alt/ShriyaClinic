import './clinic-modules.css';
import { SectionPicker, WorkspaceHeading } from '../components/common/WorkspaceControls';
import { ModalLayer } from '../components/common/ModalLayer';
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { ClayCard } from '../components/common/ClayCard';
import { ClayButton } from '../components/common/ClayButton';
import { StatusBadge } from '../components/common/StatusBadge';
import { Sidebar } from '../components/common/Sidebar';
import { 
  Calendar, 
  Clock, 
  FileText, 
  User, 
  CheckCircle2, 
  Tv, 
  Stethoscope, 
  Plus, 
  Phone, 
  Mail, 
  ShieldCheck, 
  Download,
  AlertCircle,
  Activity,
  Layers,
  ArrowRight,
  CreditCard,
  Receipt,
  QrCode,
  Printer,
  X,
  Share2,
  Building,
  Check
} from 'lucide-react';
import { Invoice, PaymentRecord, PaymentMethod } from '../types';

interface PatientPortalProps {
  initialTab?: 'dashboard' | 'appointments' | 'token' | 'treatment' | 'billing' | 'records' | 'profile';
}

export const PatientPortal: React.FC<PatientPortalProps> = ({ initialTab = 'dashboard' }) => {
  const { 
    appointments, 
    patients, 
    tokens, 
    invoices, 
    payments, 
    recordPayment, 
    activeView, 
    setActiveView, 
    addToast 
  } = useApp();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'appointments' | 'token' | 'treatment' | 'billing' | 'records' | 'profile'>(initialTab);

  // Online Payment modal state
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [payingInvoice, setPayingInvoice] = useState<Invoice | null>(null);
  const [payModalAmount, setPayModalAmount] = useState<number>(0);
  const [payModalMethod, setPayModalMethod] = useState<PaymentMethod>('UPI');
  const [payModalRef, setPayModalRef] = useState<string>('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [activeReceiptModal, setActiveReceiptModal] = useState<PaymentRecord | null>(null);

  // Sync tab with external route/view
  useEffect(() => {
    if (activeView === 'customer-appointments') setActiveTab('appointments');
    else if (activeView === 'customer-token') setActiveTab('token');
    else if (activeView === 'customer-treatment') setActiveTab('treatment');
    else if (activeView === 'customer-billing') setActiveTab('billing');
    else if (activeView === 'customer-records') setActiveTab('records');
    else if (activeView === 'customer-profile') setActiveTab('profile');
  }, [activeView]);

  // Find patient record strictly by logged-in patientId, email, or phone (NEVER default to another patient)
  const patientRecord = 
    (currentUser.patientId ? patients.find((p) => p.id === currentUser.patientId) : null) ||
    (currentUser.email ? patients.find((p) => p.email && p.email.toLowerCase() === currentUser.email.toLowerCase()) : null) ||
    (currentUser.phone ? patients.find((p) => p.phone && p.phone.replace(/\D/g, '') === currentUser.phone!.replace(/\D/g, '')) : null) ||
    null;

  // User's own appointments only
  const myAppointments = appointments.filter(
    (a) => a.patientId === patientRecord?.id || a.patientName === patientRecord?.name || a.patientPhone === patientRecord?.phone
  );

  const upcomingApt = myAppointments.find(
    (a) => a.status === 'Confirmed' || a.appointmentStatus === 'CONFIRMED' || a.status === 'Waiting' || a.status === 'In Consultation'
  );

  // Invoices & Payments for this patient
  const myInvoices = invoices.filter(
    (inv) => inv.patientId === patientRecord?.id || inv.patientName.toLowerCase() === (patientRecord?.name || '').toLowerCase()
  );

  const myPayments = payments.filter(
    (pay) => pay.patientId === patientRecord?.id || pay.patientName.toLowerCase() === (patientRecord?.name || '').toLowerCase()
  );

  const totalMyBilled = myInvoices.reduce((sum, inv) => sum + inv.total, 0);
  const totalMyPaid = myInvoices.reduce((sum, inv) => sum + inv.paid, 0);
  const totalMyBalance = myInvoices.reduce((sum, inv) => sum + inv.balance, 0);

  const handleOpenPayModal = (invoice: Invoice) => {
    setPayingInvoice(invoice);
    setPayModalAmount(invoice.balance > 0 ? invoice.balance : invoice.total);
    setPayModalMethod('UPI');
    setPayModalRef(`UPI-WEB-${Date.now().toString().slice(-6)}`);
    setIsPayModalOpen(true);
  };

  const handleProcessPatientPayment = () => {
    if (!payingInvoice || payModalAmount <= 0) return;
    setIsProcessingPayment(true);

    setTimeout(() => {
      const recorded = recordPayment({
        invoiceId: payingInvoice.id,
        amount: Number(payModalAmount),
        paymentMethod: payModalMethod,
        referenceNumber: payModalRef,
        notes: 'Online self-settlement via patient portal',
        receivedBy: 'Patient Online Portal'
      });
      setIsProcessingPayment(false);
      setIsPayModalOpen(false);
      setActiveReceiptModal(recorded);
    }, 1000);
  };

  // Active queue token for this patient (AFTER check-in)
  const myActiveToken = tokens.find(
    (t) => (t.patientId === patientRecord?.id || t.patientName === patientRecord?.name) &&
           t.status !== 'Completed' && t.status !== 'Cancelled'
  );

  // Live queue calculations
  const inConsultationToken = tokens.find((t) => t.status === 'In Consultation');
  const calledToken = tokens.find((t) => t.status === 'Called');
  const currentServingToken = inConsultationToken || calledToken;

  const waitingTokens = tokens.filter((t) => t.status === 'Waiting');
  const myIndexInWaiting = myActiveToken 
    ? waitingTokens.findIndex((t) => t.tokenNumber === myActiveToken.tokenNumber)
    : -1;
  const patientsAhead = myIndexInWaiting > 0 ? myIndexInWaiting : 0;
  const estimatedWaitMinutes = myActiveToken ? Math.max(5, (patientsAhead + 1) * 10) : 0;

  return (
    <div className="workspace w-full max-w-full mx-auto px-2.5 sm:px-4 lg:px-6 py-3 sm:py-5 flex flex-col lg:flex-row gap-4 lg:gap-6">
      <Sidebar />

      <main className="flex-1 min-w-0 flex flex-col gap-4">
        <WorkspaceHeading title={patientRecord?.name || currentUser.name || 'Patient portal'}
          detail={[patientRecord?.id, patientRecord?.phone || currentUser.phone].filter(Boolean).join(' · ')}>
          <button className="work-action primary" onClick={() => setActiveView('booking')}><Plus size={16} /> Book appointment</button>
        </WorkspaceHeading>

        {/* Informative banner if no patient record is linked */}
        {!patientRecord && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-center justify-between gap-3">
            <span>
              Contact reception at <a className="font-semibold underline" href="tel:+919400320890">+91 9400320890</a> to link your clinic records.
            </span>
          </div>
        )}

        <SectionPicker label="Patient portal section" value={activeTab} onChange={setActiveTab} options={[
          { id: 'dashboard', label: 'Overview' }, { id: 'appointments', label: 'Appointments' },
          { id: 'token', label: 'Live token' }, { id: 'treatment', label: 'Treatment plan' },
          { id: 'billing', label: 'Bills & UPI Pay' }, { id: 'records', label: 'Records & scans' }, { id: 'profile', label: 'Profile' }
        ]} />

        {/* TAB 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="flex flex-col gap-6">
            <dl className="module-summary">
              <div><dt>Next appointment</dt><dd>{upcomingApt?.timeSlot || 'None booked'}</dd>
                {upcomingApt && <small>{upcomingApt.date} · {upcomingApt.doctorName}</small>}</div>
              <div><dt>Queue token</dt><dd>{myActiveToken?.tokenNumber || 'No token'}</dd>{myActiveToken && <small>{myActiveToken.status}</small>}</div>
              <div><dt>Current treatment</dt><dd>{patientRecord?.currentTreatment || 'Routine care'}</dd>{patientRecord?.assignedDoctorName && <small>{patientRecord.assignedDoctorName}</small>}</div>
              <div><dt>Outstanding balance</dt><dd><button className="module-balance-link" onClick={() => setActiveTab('billing')} aria-label="View bills and outstanding balance">
                ₹{patientRecord?.outstandingBalance || totalMyBalance || 0}<ArrowRight size={14} />
              </button></dd></div>
            </dl>

            {/* 4-Step Guided Patient Journey (Clear, intuitive, non-repetitive) */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
              <h2 className="text-base font-semibold mb-3">Your clinic visit</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                <div className={`p-3 rounded-xl border ${upcomingApt ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Step 1</span>
                    <span className="text-xs">{upcomingApt ? '✓' : '1'}</span>
                  </div>
                  <div className="font-bold text-xs mt-1">Appointment Booked</div>
                  <div className="text-[11px] opacity-80 mt-0.5 truncate">{upcomingApt ? `${upcomingApt.date} • ${upcomingApt.timeSlot}` : 'Book your slot'}</div>
                </div>

                <div className={`p-3 rounded-xl border ${myActiveToken ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Step 2</span>
                    <span className="text-xs">{myActiveToken ? '✓' : '2'}</span>
                  </div>
                  <div className="font-bold text-xs mt-1">Arrival & Token</div>
                  <div className="text-[11px] opacity-80 mt-0.5 truncate">{myActiveToken ? `Token: ${myActiveToken.tokenNumber}` : 'Issued at clinic desk'}</div>
                </div>

                <div className={`p-3 rounded-xl border ${myActiveToken?.status === 'In Consultation' ? 'bg-sky-50 border-sky-300 text-sky-950 font-bold' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Step 3</span>
                    <span className="text-xs">3</span>
                  </div>
                  <div className="font-bold text-xs mt-1">Doctor Consultation</div>
                  <div className="text-[11px] opacity-80 mt-0.5 truncate">{myActiveToken?.status === 'In Consultation' ? 'In Consultation now' : 'Examination & Care'}</div>
                </div>

                <div 
                  onClick={() => setActiveTab('billing')}
                  className={`p-3 rounded-xl border cursor-pointer hover:scale-[1.02] transition-transform ${(patientRecord?.outstandingBalance || totalMyBalance) > 0 ? 'bg-amber-50/80 border-amber-300 text-amber-950' : 'bg-emerald-50/80 border-emerald-200 text-emerald-950'}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Step 4</span>
                    <span className="text-xs">{(patientRecord?.outstandingBalance || totalMyBalance) > 0 ? '!' : '✓'}</span>
                  </div>
                  <div className="font-bold text-xs mt-1">Bill & Receipt</div>
                  <div className="text-[11px] opacity-80 mt-0.5 truncate">{(patientRecord?.outstandingBalance || totalMyBalance) > 0 ? `₹${patientRecord?.outstandingBalance || totalMyBalance} Due • Click to Pay` : 'All Settled ✓'}</div>
                </div>
              </div>
            </div>

            {/* Live Queue / Arrival Status Banner */}
            <div className="clay-card p-6 bg-sky-50 border border-white">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-sky-200 text-sky-800 tracking-wider">
                    Clinic Flow Status
                  </span>
                  <h3 className="text-lg font-black text-slate-900 mt-2">
                    {myActiveToken
                      ? `You are checked in! Active Queue Token: ${myActiveToken.tokenNumber}`
                      : upcomingApt
                      ? `Your next appointment is confirmed for ${upcomingApt.date} at ${upcomingApt.timeSlot}`
                      : 'Schedule your next dental scaling & consultation'}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1">
                    {myActiveToken
                      ? `Current queue status: ${myActiveToken.status}. Relax in the lounge; audio alerts will guide you.`
                      : 'Please arrive at the clinic 10 minutes early. Reception will verify your arrival and issue your active queue token.'}
                  </p>
                </div>

                <ClayButton
                  variant="primary"
                  onClick={() => setActiveTab('token')}
                  icon={<Tv className="w-4 h-4" />}
                >
                  View Token Tracker
                </ClayButton>
              </div>
            </div>

            {/* Recent Treatments History */}
            <ClayCard className="p-6">
              <h3 className="text-base font-black text-slate-800 mb-4">My Completed Treatments</h3>
              <div className="flex flex-col gap-3">
                {patientRecord?.recentTreatments && patientRecord.recentTreatments.length > 0 ? (
                  patientRecord.recentTreatments.map((t, i) => (
                    <div key={i} className="clay-card-flat p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-extrabold text-slate-900">{t.treatment}</div>
                        <div className="text-xs text-slate-500 font-semibold mt-0.5">
                          {t.doctorName} • {t.date}
                        </div>
                        <div className="text-xs text-slate-600 mt-1">{t.notes}</div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-sky-600">₹{t.cost}</span>
                        <span className="text-[10px] text-emerald-600 font-bold block">Settled ✓</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-xs text-slate-400">No past treatments on file yet.</div>
                )}
              </div>
            </ClayCard>
          </div>
        )}

        {/* TAB 2: APPOINTMENTS */}
        {activeTab === 'appointments' && (
          <div className="flex flex-col gap-6">
            <div className="module-section-heading">
              <div>
                <h2 className="text-lg font-black text-slate-800">My appointments</h2>
                <p className="text-xs text-slate-500">View upcoming bookings and past clinical visit history.</p>
              </div>
              <ClayButton
                variant="mint"
                size="sm"
                onClick={() => setActiveView('booking')}
                icon={<Plus className="w-4 h-4" />}
              >
                Book New Slot
              </ClayButton>
            </div>

            <div className="flex flex-col gap-4">
              {myAppointments.map((apt) => (
                <ClayCard key={apt.id} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-mono font-black text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                        {apt.id}
                      </span>
                      {apt.tokenId && (
                        <span className="text-xs font-mono font-black text-sky-800 bg-sky-100 px-2.5 py-1 rounded-lg">
                          Token: {apt.tokenId}
                        </span>
                      )}
                      <StatusBadge status={apt.status as any} />
                    </div>
                    <h4 className="text-base font-extrabold text-slate-900 mt-2">{apt.reasonForVisit}</h4>
                    <p className="text-xs font-semibold text-slate-500 mt-0.5">
                      Doctor: {apt.doctorName} • {apt.date} at {apt.timeSlot}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <ClayButton
                      variant="secondary"
                      size="sm"
                      onClick={() => addToast('Prescription Downloaded 📄', 'Receipt downloaded.', 'success')}
                      icon={<Download className="w-4 h-4" />}
                    >
                      Receipt
                    </ClayButton>
                  </div>
                </ClayCard>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: MY TOKEN (STRICT REQUIREMENT 24 COMPLIANT) */}
        {activeTab === 'token' && (
          <div className="flex flex-col gap-6">
            {/* SCENARIO A: BEFORE PATIENT ARRIVES (NO TOKEN ISSUED YET) */}
            {!myActiveToken && (
              <ClayCard variant="accent" className="p-8 text-center flex flex-col items-center gap-4 border-2 border-white">
                <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-2xl">
                  🕒
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-amber-800">
                  Appointment Confirmed • Awaiting Arrival
                </span>
                
                <div className="text-4xl md:text-5xl font-black text-slate-800 font-mono my-1">
                  NOT YET ASSIGNED
                </div>

                <div className="p-4 rounded-2xl bg-white/80 border border-amber-200 text-amber-900 text-xs font-semibold max-w-md">
                  Your queue token will be generated when you check in at the clinic reception desk upon arrival.
                </div>

                {upcomingApt && (
                  <div className="text-xs font-bold text-slate-600 bg-slate-100 px-4 py-2 rounded-xl">
                    Scheduled for: <strong>{upcomingApt.date} at {upcomingApt.timeSlot}</strong> with {upcomingApt.doctorName}
                  </div>
                )}
              </ClayCard>
            )}

            {/* SCENARIO B: AFTER CHECK-IN (TOKEN ACTIVE) */}
            {myActiveToken && (
              <div className="space-y-6">
                {/* CALLED ALERT BANNER */}
                {myActiveToken.status === 'Called' && (
                  <div className="p-6 rounded-3xl bg-emerald-500 text-white shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95">
                    <span className="text-xs font-black uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full mb-2">
                      Now Calling You 🔔
                    </span>
                    <h2 className="text-3xl md:text-5xl font-black tracking-tight">
                      NOW SERVING YOU — {myActiveToken.tokenNumber}
                    </h2>
                    <p className="text-lg font-extrabold text-emerald-100 mt-2">
                      PLEASE PROCEED TO: DOCTOR'S CABIN ({myActiveToken.doctorName})
                    </p>
                    <span className="text-sm font-semibold text-white/90 mt-1">
                      Consulting Doctor: {myActiveToken.doctorName}
                    </span>
                  </div>
                )}

                {/* IN CONSULTATION BANNER */}
                {myActiveToken.status === 'In Consultation' && (
                  <div className="p-6 rounded-3xl bg-teal-500 text-white shadow-2xl flex flex-col items-center text-center">
                    <span className="text-xs font-black uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full mb-2">
                      Live Consultation In Progress
                    </span>
                    <h2 className="text-3xl md:text-4xl font-black tracking-tight">
                      TOKEN {myActiveToken.tokenNumber} • In Cabin
                    </h2>
                    <p className="text-sm font-semibold text-teal-100 mt-1">
                      With {myActiveToken.doctorName} in Doctor's Cabin
                    </p>
                  </div>
                )}

                {/* WAITING QUEUE CARD */}
                {myActiveToken.status === 'Waiting' && (
                  <ClayCard variant="accent" className="p-8 text-center flex flex-col items-center gap-4 border-2 border-white">
                    <span className="text-xs font-black uppercase tracking-widest text-sky-800">
                      Your Active Clinic Queue Token
                    </span>
                    <div className="text-7xl md:text-8xl font-black text-sky-950 font-mono tracking-tight my-2">
                      {myActiveToken.tokenNumber}
                    </div>

                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 font-extrabold text-xs">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                      <span>Status: WAITING</span>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-lg mt-2">
                      <div className="clay-card-flat p-3 rounded-2xl text-center">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Current Token</span>
                        <span className="text-xl font-black text-slate-800 font-mono">
                          {currentServingToken?.tokenNumber || 'A-022'}
                        </span>
                      </div>

                      <div className="clay-card-flat p-3 rounded-2xl text-center">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Patients Ahead</span>
                        <span className="text-xl font-black text-sky-700">
                          {patientsAhead}
                        </span>
                      </div>

                      <div className="clay-card-flat p-3 rounded-2xl text-center">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Estimated Wait</span>
                        <span className="text-xl font-black text-emerald-700">
                          ~{estimatedWaitMinutes} mins
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 max-w-md mt-2">
                      Please relax in the patient waiting area. An audio chime and WhatsApp update will notify you as soon as your token is called.
                    </p>
                  </ClayCard>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: MY TREATMENT PLAN */}
        {activeTab === 'treatment' && (
          <div className="flex flex-col gap-6">
            <h2 className="text-lg font-black text-slate-800">My Clinical Treatment Plans</h2>
            {patientRecord?.treatmentPlans && patientRecord.treatmentPlans.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {patientRecord.treatmentPlans.map((tp) => (
                  <ClayCard key={tp.id} className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800">
                          Tooth #{tp.toothNumbers.join(', ')}
                        </span>
                        <span className="text-xs font-bold text-slate-400">•</span>
                        <span className="text-xs font-bold text-slate-600">Diagnosis: {tp.diagnosis}</span>
                      </div>
                      <h4 className="text-base font-extrabold text-slate-900 mt-1">{tp.procedure}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Doctor: {tp.doctorName}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-lg font-black text-slate-900">₹{tp.estimatedCost}</span>
                      <span className="text-xs font-bold text-sky-700 block">Status: {tp.status}</span>
                    </div>
                  </ClayCard>
                ))}
              </div>
            ) : (
              <ClayCard className="p-8 text-center text-xs text-slate-400">
                No active treatment plans currently registered.
              </ClayCard>
            )}
          </div>
        )}

        {/* TAB 4: MY BILLS & PAYMENTS (CLIENT-FRIENDLY BILLING & PAYMENT PAY RECORDS) */}
        {activeTab === 'billing' && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-200">
            {/* Header & Balance Notice */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  My Bills, Payments & Receipts
                </h2>
                <p className="text-xs text-slate-500">
                  Review itemized treatment invoices, pay outstanding dues online via UPI/Card, and download official receipts.
                </p>
              </div>

              {totalMyBalance > 0 && myInvoices[0] && (
                <button
                  onClick={() => handleOpenPayModal(myInvoices.find(i => i.balance > 0) || myInvoices[0])}
                  className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer transition-colors"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Pay Balance Due (₹{totalMyBalance.toLocaleString()})</span>
                </button>
              )}
            </div>

            {/* Financial Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <ClayCard variant="flat" className="p-4">
                <span className="text-[10px] font-bold uppercase text-slate-400">Total Treatment Charges</span>
                <div className="text-2xl font-black text-slate-900 mt-1">₹{totalMyBilled.toLocaleString()}</div>
                <span className="text-[11px] text-slate-500 block mt-0.5">{myInvoices.length} invoices on file</span>
              </ClayCard>

              <ClayCard variant="flat" className="p-4">
                <span className="text-[10px] font-bold uppercase text-slate-400">Total Amount Paid</span>
                <div className="text-2xl font-black text-emerald-700 mt-1">₹{totalMyPaid.toLocaleString()}</div>
                <span className="text-[11px] text-emerald-600 block mt-0.5 font-medium">{myPayments.length} verified payments</span>
              </ClayCard>

              <ClayCard variant={totalMyBalance > 0 ? 'accent' : 'flat'} className={`p-4 border-2 ${totalMyBalance > 0 ? 'border-amber-300' : 'border-transparent'}`}>
                <span className="text-[10px] font-bold uppercase text-slate-500">Current Outstanding Due</span>
                <div className={`text-2xl font-black mt-1 ${totalMyBalance > 0 ? 'text-rose-700' : 'text-slate-800'}`}>
                  ₹{totalMyBalance.toLocaleString()}
                </div>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  {totalMyBalance > 0 ? 'Payment pending • Online settlement available' : 'All accounts settled ✓'}
                </span>
              </ClayCard>
            </div>

            {/* Outstanding Alert Banner */}
            {totalMyBalance > 0 ? (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 text-amber-950">
                  <div className="w-6 h-6 rounded-full bg-amber-500 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    !
                  </div>
                  <div>
                    <strong className="font-bold">Pending Payment:</strong> You have an outstanding balance of <span className="font-mono font-bold text-rose-700">₹{totalMyBalance.toLocaleString()}</span>. You can clear this now using UPI (Google Pay, PhonePe, Paytm) or Card.
                  </div>
                </div>

                <button
                  onClick={() => handleOpenPayModal(myInvoices.find(i => i.balance > 0) || myInvoices[0])}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-bold shrink-0 cursor-pointer text-xs"
                >
                  Pay Now Online →
                </button>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-xs text-emerald-900">
                <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                <div>
                  <strong>All Settled:</strong> You have zero pending payments. All dental treatments and consultations are fully paid.
                </div>
              </div>
            )}

            {/* SECTION 1: INVOICES LIST */}
            <div className="space-y-3">
              <h3 className="text-sm font-extrabold text-slate-900">My Invoices & Treatment Bills</h3>
              <div className="flex flex-col gap-3">
                {myInvoices.length > 0 ? (
                  myInvoices.map((inv) => (
                    <ClayCard key={inv.id} className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="font-mono font-bold text-xs text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {inv.id}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              inv.status === 'Paid'
                                ? 'bg-emerald-100 text-emerald-800'
                                : inv.status === 'Partial'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {inv.status}
                          </span>
                          <span className="text-xs text-slate-500 font-semibold">
                            Date: {inv.date} • Doctor: {inv.doctorName}
                          </span>
                        </div>

                        {/* Line items preview */}
                        <div className="mt-2.5 space-y-1">
                          {inv.items.map((it, idx) => (
                            <div key={idx} className="text-xs text-slate-600 flex justify-between max-w-md">
                              <span>• {it.description} (x{it.quantity})</span>
                              <span className="font-mono font-medium">₹{it.total.toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col md:items-end justify-between gap-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 w-full md:w-auto">
                        <div className="text-right">
                          <div className="text-xs text-slate-500">
                            Total: <strong className="font-mono text-slate-900">₹{inv.total.toLocaleString()}</strong>
                          </div>
                          <div className="text-xs text-emerald-700">
                            Paid: <strong className="font-mono">₹{inv.paid.toLocaleString()}</strong>
                          </div>
                          {inv.balance > 0 ? (
                            <div className="text-sm font-extrabold text-rose-600 mt-0.5">
                              Balance Due: <span className="font-mono">₹{inv.balance.toLocaleString()}</span>
                            </div>
                          ) : (
                            <span className="text-[11px] font-bold text-emerald-700 block mt-0.5">Fully Cleared ✓</span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-1">
                          {inv.balance > 0 && (
                            <button
                              onClick={() => handleOpenPayModal(inv)}
                              className="px-3.5 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold flex items-center gap-1 cursor-pointer shadow-xs"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              <span>Pay ₹{inv.balance.toLocaleString()}</span>
                            </button>
                          )}

                          <button
                            onClick={() => addToast('Receipt Export', `Downloading official invoice ${inv.id}...`, 'info')}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
                            title="Download Invoice PDF"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </ClayCard>
                  ))
                ) : (
                  <ClayCard className="p-8 text-center text-xs text-slate-400">
                    No invoices generated on your account yet.
                  </ClayCard>
                )}
              </div>
            </div>

            {/* SECTION 2: PAYMENT PAY RECORDS & RECEIPTS (PAYMENT HISTORY) */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Payments and receipts
                  </h3>
                  <p className="text-xs text-slate-500">
                    Official digital payment records and transaction receipts for all cleared settlements.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {myPayments.length > 0 ? (
                  myPayments.map((pay) => (
                    <div key={pay.id} className="clay-card-flat p-4 rounded-xl border border-slate-200 flex flex-col justify-between gap-3 bg-white">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-xs text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {pay.receiptNumber}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Verified ✓
                          </span>
                        </div>

                        <div className="mt-2 text-xs text-slate-600 space-y-0.5">
                          <div>Date & Time: <strong className="text-slate-800">{pay.date} at {pay.time}</strong></div>
                          <div>Invoice: <span className="font-mono text-slate-700">{pay.invoiceId}</span></div>
                          <div>Method: <strong className="text-slate-800">{pay.paymentMethod}</strong></div>
                          {pay.referenceNumber && (
                            <div>Txn Ref: <span className="font-mono text-[11px] text-slate-500">{pay.referenceNumber}</span></div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <span className="text-base font-black text-emerald-700 font-mono">
                          ₹{pay.amount.toLocaleString()}
                        </span>

                        <button
                          onClick={() => setActiveReceiptModal(pay)}
                          className="px-2.5 py-1 rounded bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 flex items-center gap-1 cursor-pointer"
                        >
                          <Receipt className="w-3.5 h-3.5 text-emerald-700" />
                          <span>View Receipt</span>
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 p-6 rounded-xl bg-slate-50 text-center text-xs text-slate-400">
                    No payment transactions recorded yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: MY RECORDS */}
        {activeTab === 'records' && (
          <div className="flex flex-col gap-6">
            <h2 className="text-lg font-black text-slate-800">Approved Digital Dental Records</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ClayCard variant="flat" className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 rounded-2xl bg-sky-100 text-sky-700">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-800">Panoramic OPG Dental X-Ray</h4>
                    <span className="text-[10px] text-slate-400">
                      {patientRecord?.assignedDoctorName ? `Verified by ${patientRecord.assignedDoctorName}` : 'Clinical Record'}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-600">High-resolution digital scan showing molar canal anatomy.</p>
                <ClayButton
                  variant="ghost"
                  size="sm"
                  onClick={() => addToast('Scan Viewer', 'OPG DICOM opened in viewer.', 'info')}
                  className="mt-3 text-sky-600 font-extrabold"
                >
                  View Scan File →
                </ClayButton>
              </ClayCard>

              <ClayCard variant="flat" className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 rounded-2xl bg-teal-100 text-teal-700">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-800">Clinical Consultation Summary</h4>
                    <span className="text-[10px] text-slate-400">Shriya Multispeciality Dental Clinic</span>
                  </div>
                </div>
                <p className="text-xs text-slate-600">Official dental health assessment & hygiene maintenance summary.</p>
                <ClayButton
                  variant="ghost"
                  size="sm"
                  onClick={() => addToast('PDF Summary', 'Summary PDF downloaded.', 'info')}
                  className="mt-3 text-teal-700 font-extrabold"
                >
                  Download Summary PDF →
                </ClayButton>
              </ClayCard>
            </div>
          </div>
        )}

        {/* TAB 6: MY PROFILE */}
        {activeTab === 'profile' && (
          <div className="flex flex-col gap-6">
            <h2 className="text-lg font-black text-slate-800">My Demographic Profile</h2>
            <ClayCard className="p-6 space-y-4 max-w-2xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 font-bold block">Full Name</span>
                  <span className="text-sm font-black text-slate-900">{patientRecord?.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block">Patient ID</span>
                  <span className="text-sm font-black text-slate-900 font-mono">{patientRecord?.id}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block">Phone</span>
                  <span className="text-sm font-bold text-slate-800">{patientRecord?.phone}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block">Email</span>
                  <span className="text-sm font-bold text-slate-800">{patientRecord?.email}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block">Age / Gender</span>
                  <span className="text-sm font-bold text-slate-800">{patientRecord?.age} yrs • {patientRecord?.gender}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block">Assigned Doctor</span>
                  <span className="text-sm font-bold text-sky-700">{patientRecord?.assignedDoctorName || 'Attending Doctor'}</span>
                </div>
              </div>
            </ClayCard>
          </div>
        )}
      </main>

      {/* ==================================================== */}
      {/* PATIENT ONLINE PAYMENT MODAL                         */}
      {/* ==================================================== */}
      {isPayModalOpen && payingInvoice && (
        <ModalLayer onDismiss={() => setIsPayModalOpen(false)} className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  💳
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Settle Treatment Bill Online</h3>
                  <p className="text-[11px] text-slate-500">Secure 256-bit encrypted medical checkout</p>
                </div>
              </div>
              <button aria-label="Close dialog"
                onClick={() => setIsPayModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Bill Info Card */}
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600 pb-1.5 border-b border-slate-200">
                <span>Invoice Number:</span>
                <span className="font-mono font-bold text-slate-900">{payingInvoice.id}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Doctor:</span>
                <span className="font-semibold text-slate-800">{payingInvoice.doctorName}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Procedures:</span>
                <span className="text-slate-800 truncate max-w-[220px]">
                  {payingInvoice.items.map((i) => i.description).join(', ')}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Total Invoice:</span>
                <span className="font-mono">₹{payingInvoice.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Already Paid:</span>
                <span className="font-mono text-emerald-700">₹{payingInvoice.paid.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 pt-1.5 border-t border-slate-200 text-sm">
                <span>Balance to Settle:</span>
                <span className="font-mono text-rose-600">₹{payingInvoice.balance.toLocaleString()}</span>
              </div>
            </div>

            {/* Amount Input */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Amount to Pay Now (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">₹</span>
                <input
                  type="number"
                  value={payModalAmount}
                  onChange={(e) => setPayModalAmount(Number(e.target.value))}
                  className="w-full py-2 pl-7 pr-3 bg-white border border-slate-300 rounded-lg text-sm font-mono font-bold text-slate-900 focus:outline-none focus:border-emerald-700"
                />
              </div>
            </div>

            {/* Choose Payment Method */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                Choose Payment Method
              </label>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'UPI', label: 'UPI / QR', icon: <QrCode className="w-4 h-4 text-purple-600" /> },
                  { id: 'Card', label: 'Card', icon: <CreditCard className="w-4 h-4 text-sky-600" /> },
                  { id: 'Net Banking', label: 'Net Banking', icon: <Building className="w-4 h-4 text-teal-600" /> }
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPayModalMethod(m.id as PaymentMethod)}
                    className={`p-2 rounded-xl border text-center flex flex-col items-center gap-1 cursor-pointer transition-all ${
                      payModalMethod === m.id
                        ? 'border-emerald-700 bg-emerald-50 text-emerald-900 font-bold shadow-xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {m.icon}
                    <span className="text-xs">{m.label}</span>
                  </button>
                ))}
              </div>

              {/* UPI Tab */}
              {payModalMethod === 'UPI' && (
                <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200 flex flex-col items-center text-center gap-2 mt-2">
                  <span className="text-[10px] font-bold text-purple-900 uppercase tracking-wider">
                    Scan with any UPI App
                  </span>
                  <div className="w-24 h-24 bg-white p-2 rounded-lg border border-purple-200 shadow-2xs flex flex-col items-center justify-center">
                    <QrCode className="w-16 h-16 text-slate-800" />
                  </div>
                  <div className="text-[11px] font-bold text-slate-800">
                    UPI ID: <span className="font-mono text-purple-900">shriyadental@hdfcbank</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium">
                    <span>Google Pay</span> • <span>PhonePe</span> • <span>Paytm</span> • <span>BHIM</span>
                  </div>
                </div>
              )}

              {/* Card Tab */}
              {payModalMethod === 'Card' && (
                <div className="p-3.5 rounded-xl bg-sky-50/70 border border-sky-200 space-y-2 mt-2 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-600 font-semibold block mb-0.5">Card Number</label>
                    <input
                      type="text"
                      placeholder="4532 •••• •••• 8821"
                      defaultValue="4532 •••• •••• 8821"
                      className="w-full p-1.5 bg-white border border-slate-200 rounded font-mono text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-600 font-semibold block mb-0.5">Expiry</label>
                      <input
                        type="text"
                        placeholder="MM / YY"
                        defaultValue="08/29"
                        className="w-full p-1.5 bg-white border border-slate-200 rounded font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-600 font-semibold block mb-0.5">CVV</label>
                      <input
                        type="password"
                        placeholder="•••"
                        defaultValue="381"
                        className="w-full p-1.5 bg-white border border-slate-200 rounded font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Net Banking Tab */}
              {payModalMethod === 'Net Banking' && (
                <div className="p-3 rounded-xl bg-teal-50/70 border border-teal-200 space-y-1.5 mt-2 text-xs">
                  <label className="text-[10px] text-slate-600 font-semibold block">Select Your Bank</label>
                  <select className="w-full p-1.5 bg-white border border-slate-200 rounded text-xs">
                    <option>HDFC Bank</option>
                    <option>ICICI Bank</option>
                    <option>State Bank of India (SBI)</option>
                    <option>Axis Bank</option>
                    <option>Kotak Mahindra Bank</option>
                  </select>
                </div>
              )}
            </div>

            {/* Submit Action */}
            <div className="pt-2">
              <button
                type="button"
                disabled={isProcessingPayment}
                onClick={handleProcessPatientPayment}
                className="w-full py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md cursor-pointer transition-colors disabled:opacity-70"
              >
                {isProcessingPayment ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing payment securely...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-emerald-300" />
                    <span>Pay ₹{payModalAmount.toLocaleString()} Securely</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </ModalLayer>
      )}

      {/* ==================================================== */}
      {/* OFFICIAL DIGITAL RECEIPT MODAL                       */}
      {/* ==================================================== */}
      {activeReceiptModal && (
        <ModalLayer onDismiss={() => setActiveReceiptModal(null)} className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Payment Cleared & Confirmed
              </span>
              <button aria-label="Close dialog"
                onClick={() => setActiveReceiptModal(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-3.5 text-xs text-slate-700">
              <div className="text-center pb-3 border-b border-dashed border-slate-300">
                <div className="text-lg font-bold text-slate-900 tracking-tight flex items-center justify-center gap-1.5">
                  <span>🦷</span>
                  <span>Shriya Multispeciality Dental Clinic</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Official Patient Digital Receipt • Reg: DENT-2026-KA
                </div>
                <div className="mt-2 inline-block px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] uppercase tracking-wider">
                  Payment Cleared ✓
                </div>
              </div>

              <div className="space-y-1.5 pb-3 border-b border-dashed border-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-500">Receipt No:</span>
                  <strong className="font-mono text-slate-900">{activeReceiptModal.receiptNumber}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date & Time:</span>
                  <span>{activeReceiptModal.date} • {activeReceiptModal.time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Invoice Ref:</span>
                  <span className="font-mono">{activeReceiptModal.invoiceId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Patient Name:</span>
                  <strong className="text-slate-900">{activeReceiptModal.patientName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Mode:</span>
                  <strong>{activeReceiptModal.paymentMethod}</strong>
                </div>
                {activeReceiptModal.referenceNumber && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Transaction ID:</span>
                    <span className="font-mono text-[11px]">{activeReceiptModal.referenceNumber}</span>
                  </div>
                )}
              </div>

              <div className="bg-emerald-100/60 p-3 rounded-lg flex items-center justify-between text-emerald-950 font-bold">
                <span className="text-xs uppercase tracking-wider">Amount Paid</span>
                <span className="text-xl font-mono">₹{activeReceiptModal.amount.toLocaleString()}</span>
              </div>

              <div className="text-center text-[10px] text-slate-400 pt-1">
                Official electronic receipt generated by Shriya Multispeciality Dental Clinic EMR.
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => {
                  window.print();
                  addToast('Printed', 'Receipt sent to printer.', 'info');
                }}
                className="flex-1 py-2 rounded-md bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Receipt</span>
              </button>

              <button
                onClick={() => {
                  addToast('Receipt Downloaded 📄', `Receipt ${activeReceiptModal.receiptNumber} saved.`, 'success');
                }}
                className="py-2 px-3 rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>

              <button
                onClick={() => setActiveReceiptModal(null)}
                className="py-2 px-3 rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </ModalLayer>
      )}
    </div>
  );
};
