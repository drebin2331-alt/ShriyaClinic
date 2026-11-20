import { Sidebar } from '../components/common/Sidebar';
import { ModalLayer } from '../components/common/ModalLayer';
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import {
  Activity, ArrowRight, BarChart3, Calendar, ChevronRight, CreditCard, Download,
  FileText, Layers, Smartphone, Stethoscope, UserPlus, Users, X
} from 'lucide-react';

export const MobileAppDashboard: React.FC = () => {
  const { 
    tokens = [], 
    patients = [], 
    appointments = [], 
    invoices = [], 
    payments = [],
    visits = [],
    setActiveView, 
    setSelectedPatientForDetail,
    callNextToken,
    addToast
  } = useApp();

  const { currentUser } = useAuth();

  const [isModulesModalOpen, setIsModulesModalOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  React.useEffect(() => {
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice?.outcome === 'accepted') {
        addToast('Installing App 📱', 'Shriya Dental Clinic OS is being installed on your device.', 'success');
      }
      setDeferredPrompt(null);
    } else {
      addToast('Install App 📲', 'To install on Android: Tap the 3 dots (⋮) in Chrome and select "Install app" or "Add to Home screen".', 'info');
    }
  };

  // Live Metrics - Only active tokens for TODAY's clinic session (purging stale demo/past tokens)
  const today = new Date().toISOString().split('T')[0];
  const waitingTokens = tokens.filter(
    (t) => t.status === 'Waiting' && t.id !== 'tok-1794029736556' && t.tokenNumber !== 'W-002' && (!t.date || t.date === today)
  );
  const calledToken = tokens.find(
    (t) => t.status === 'Called' && t.id !== 'tok-1794029736556' && t.tokenNumber !== 'W-002' && (!t.date || t.date === today)
  );
  const inConsultationToken = tokens.find(
    (t) => t.status === 'In Consultation' && t.id !== 'tok-1794029736556' && t.tokenNumber !== 'W-002' && (!t.date || t.date === today)
  );
  const activeToken = inConsultationToken || calledToken || waitingTokens[0];

  const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0) ||
    invoices.filter((i) => i.status === 'Paid').reduce((sum, i) => sum + (i.amount || 0), 0);

  const outstandingBalance = invoices
    .filter((i) => i.status !== 'Paid')
    .reduce((sum, i) => sum + (i.balance || 0), 0);

  const completedAppointments = appointments.filter((a) => a.status === 'Completed').length;

  const handleCallNext = () => {
    if (waitingTokens.length > 0) {
      const nextToken = waitingTokens[0];
      if (callNextToken) {
        callNextToken(nextToken.id || nextToken.tokenNumber);
      }
      addToast('Patient Called to Cabin 1 📢', `Token #${nextToken.tokenNumber} (${nextToken.patientName}) called.`, 'success');
    } else {
      addToast('Queue Empty', 'No patients currently waiting in queue.', 'info');
    }
  };

  const handleOpenPatientDetail = (patientId: string) => {
    const found = patients.find((p) => p.id === patientId);
    if (found) {
      setSelectedPatientForDetail(found);
      setActiveView('patient-detail');
    }
  };

  // Tools open the existing clinical workspaces.
  const modules = [
    {
      id: 'tokens',
      title: 'Queue',
      icon: <Activity className="w-5 h-5 text-emerald-600" />,
      view: 'tokens' as const
    },
    {
      id: 'patients',
      title: 'Patients',
      icon: <Users className="w-5 h-5 text-sky-600" />,
      view: 'admin-patients' as const
    },
    {
      id: 'chart',
      title: 'Odontogram',
      icon: <Stethoscope className="w-5 h-5 text-teal-600" />,
      view: 'patient-profile' as const
    },
    {
      id: 'billing',
      title: 'Billing',
      icon: <CreditCard className="w-5 h-5 text-amber-600" />,
      view: 'billing' as const
    },
    {
      id: 'appointments',
      title: 'Appointments',
      icon: <Calendar className="w-5 h-5 text-blue-600" />,
      view: 'appointment-mgmt' as const
    },
    {
      id: 'checkin',
      title: 'Check-In',
      icon: <UserPlus className="w-5 h-5 text-purple-600" />,
      view: 'staff-checkin' as const
    },
    {
      id: 'prescriptions',
      title: 'Prescriptions',
      icon: <FileText className="w-5 h-5 text-rose-600" />,
      view: 'patient-profile' as const
    },
    {
      id: 'reports',
      title: 'Reports',
      icon: <BarChart3 className="w-5 h-5 text-indigo-600" />,
      view: 'admin-reports' as const
    }
  ];

  const dateLabel = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
  const money = (value: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(value);
  const localDate = new Date();
  const scheduleDate = [localDate.getFullYear(), String(localDate.getMonth() + 1).padStart(2, '0'), String(localDate.getDate()).padStart(2, '0')].join('-');
  const dailyAppointments = appointments.filter(appointment => appointment.date === scheduleDate);
  const collectedToday = payments.filter(payment => payment.date?.slice(0, 10) === scheduleDate)
    .reduce((sum, payment) => sum + payment.amount, 0);
  const upcoming = appointments.filter(appointment => appointment.date >= scheduleDate &&
    ![appointment.status, appointment.appointmentStatus].some(status => ['CANCELLED', 'COMPLETED', 'NO_SHOW'].includes(String(status).toUpperCase())))
    .sort((a, b) => a.date.localeCompare(b.date) || Date.parse(a.date + ' ' + a.timeSlot) - Date.parse(b.date + ' ' + b.timeSlot)).slice(0, 5);
  const activity = [...visits].sort((a, b) => (b.visitDate || '').localeCompare(a.visitDate || '') ||
    Date.parse(b.visitDate + ' ' + b.checkInTime) - Date.parse(a.visitDate + ' ' + a.checkInTime)).slice(0, 4);
  const deskTitle = currentUser.role === 'doctor' ? 'Consultation desk' : currentUser.role === 'admin' ? 'Practice overview' :
    currentUser.role === 'billing' ? 'Accounts desk' : 'Reception desk';

  return (
    <div className="daybook-shell"><Sidebar /><main className="daybook">
      <header className="daybook-heading">
        <div><p className="daybook-date">{dateLabel}</p><h1>{deskTitle}</h1></div>
        <div className="desk-heading-actions"><button className="desk-button secondary" onClick={() => setIsModulesModalOpen(true)}>All tools <Layers size={16}/></button>
        <button className="desk-button" onClick={() => setActiveView(currentUser.role === 'doctor' ? 'doctor-patients' : currentUser.role === 'billing' ? 'billing' : 'staff-checkin')}>
          {currentUser.role === 'doctor' ? 'Patient records' : currentUser.role === 'billing' ? 'Open billing' : 'Open reception'} <ArrowRight size={16}/>
        </button></div>
      </header>
      <div className="desk-grid">
        <section className="desk-panel cabin">
          <div className="desk-section-title"><h2>Consultation room</h2><Stethoscope size={22}/></div>
          <div className="cabin-reading"><span>{activeToken ? activeToken.status : 'Current queue'}</span>
            <strong>{activeToken ? activeToken.tokenNumber : 'Cabin ready'}</strong>
            {activeToken && <p>{activeToken.patientName}</p>}
          </div>
          <button className="desk-button light" onClick={handleCallNext}>Call next token <ArrowRight size={16}/></button>
        </section>
        <section className="desk-panel daily"><h2>Practice at a glance</h2><dl className="desk-numbers">
          {[[dailyAppointments.length, 'Appointments today'], [waitingTokens.length, 'Waiting now'], [patients.length, 'Registered patients'], [completedAppointments, 'Completed appointments · all time']].map(([value,label]) =>
            <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
        </dl></section>
        <section className="desk-panel desk-schedule"><div className="desk-section-title"><h2>Appointment book</h2><button onClick={() => setActiveView('appointment-mgmt')}>View schedule <ChevronRight size={15}/></button></div>
          {upcoming.length ? <ol className="desk-list">{upcoming.map(a => <li key={a.id}><time>{a.date}<small>{a.timeSlot}</small></time><div><strong>{a.patientName}</strong><small>{a.doctorName}</small></div></li>)}</ol> :
            <p className="desk-empty"><Calendar/>No upcoming appointments.</p>}
        </section>
        <section className="desk-panel accounts"><div className="desk-section-title"><h2>Collections</h2><button onClick={() => setActiveView('billing')}>Billing <ChevronRight size={15}/></button></div>
          <dl className="desk-ledger">{[['Collected today', collectedToday], ['Outstanding balance', outstandingBalance], ['Total settled', totalRevenue]].map(([label,value])=><div key={label}><dt>{label}</dt><dd>{money(Number(value))}</dd></div>)}</dl>
        </section>
        <section className="desk-panel desk-queue"><div className="desk-section-title"><h2>Waiting room</h2><button onClick={() => setActiveView('tokens')}>Open queue <ChevronRight size={15}/></button></div>
          {waitingTokens.length ? <ol className="desk-list">{waitingTokens.slice(0,5).map(t => <li key={t.id}><b>{t.tokenNumber}</b><button onClick={() => handleOpenPatientDetail(t.patientId)}>{t.patientName}</button></li>)}</ol> :
            <p className="desk-empty"><Activity/>No patients waiting.</p>}
        </section>
        <section className="desk-panel"><h2>Recent patient visits</h2>{activity.length ? <ol className="desk-list">{activity.map(v=><li key={v.id}><time>{v.visitDate}</time><div><button onClick={() => handleOpenPatientDetail(v.patientId)}>{v.patientName}</button><small>{v.status}</small></div></li>)}</ol> : <p className="desk-empty">No visits recorded.</p>}</section>
      </div>
      <section className="desk-tools"><div className="desk-section-title"><h2>Clinical tools</h2></div>
        <div className="tool-grid">{modules.map(m=><button key={m.id} onClick={()=>setActiveView(m.view)}>{m.icon}<span>{m.title}</span><ChevronRight size={14}/></button>)}</div>
      </section>

      {isModulesModalOpen && (
        <ModalLayer onDismiss={() => setIsModulesModalOpen(false)}
          className="fixed inset-0 z-50 flex flex-col justify-end bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setIsModulesModalOpen(false)}
        >
          <div 
            className="w-full max-w-lg mx-auto bg-white rounded-t-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in slide-in-from-bottom duration-250 p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
            style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 1.25rem)' }}
          >
            {/* Top Drag Indicator */}
            <div className="w-12 h-1.5 rounded-full bg-slate-300 mx-auto -mt-1 mb-2" />

            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">
                Shriya Dental Modules
              </h3>
              <button aria-label="Close dialog"
                type="button"
                onClick={() => setIsModulesModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 2-Column Pill Buttons List (Matching Reference Screenshot 2) */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { label: '3D Odontogram', icon: '🦷', view: 'patient-profile' as const },
                { label: 'Common Ledger', icon: '📖', view: 'billing' as const },
                { label: 'Queue Tokens', icon: '⚡', view: 'tokens' as const },
                { label: 'Patient EMR', icon: '👥', view: 'admin-patients' as const },
                { label: 'Check-In Desk', icon: '📝', view: 'staff-checkin' as const },
                { label: 'Digital Rx', icon: '💊', view: 'patient-profile' as const },
                { label: 'Practice Reports', icon: '📊', view: 'admin-reports' as const },
                { label: 'Staff & Security', icon: '🛡️', view: 'admin-staff' as const },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    setIsModulesModalOpen(false);
                    setActiveView(item.view);
                  }}
                  className="p-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-left font-bold text-slate-800 flex items-center gap-2.5 transition-colors cursor-pointer shadow-2xs hover:border-teal-300 active:scale-95"
                >
                  <span className="text-base">{item.icon}</span>
                  <span className="break-words">{item.label}</span>
                </button>
              ))}
            </div>

            {/* Bottom Mobile App Install Banner (Matching Reference Screenshot 2) */}
            <div className="rounded-xl bg-teal-800 p-3 text-white flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <Smartphone className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="font-extrabold text-xs truncate">Shriya Dental Mobile App</div>
                  <div className="text-xs text-emerald-100">Android APK • Add to Home Screen</div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <a
                  href="https://github.com/drebin2331-alt/ShriyaClinic/releases/latest"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-teal-950 font-black text-xs shrink-0 cursor-pointer shadow-xs active:scale-95 transition-all flex items-center gap-1"
                  title="Download Android APK"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>APK</span>
                </a>
                <button
                  type="button"
                  onClick={handleInstallApp}
                  className="px-3 py-1.5 rounded-xl bg-white text-teal-900 font-black text-xs shrink-0 cursor-pointer shadow-xs hover:bg-emerald-50 active:scale-95 transition-all"
                >
                  Install
                </button>
              </div>
            </div>
          </div>
        </ModalLayer>
      )}
    </main></div>
  );
};

