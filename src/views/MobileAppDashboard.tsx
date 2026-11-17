import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { 
  Activity, 
  Users, 
  CreditCard, 
  Calendar, 
  Stethoscope, 
  UserPlus, 
  FileText, 
  BarChart3, 
  Sparkles, 
  Clock, 
  ArrowRight, 
  ChevronRight, 
  ChevronDown, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Search, 
  Bell, 
  Plus, 
  Phone, 
  ExternalLink, 
  ShieldCheck, 
  LogOut, 
  Layers, 
  Tv,
  Coins,
  Receipt,
  Download,
  Flame,
  Smartphone
} from 'lucide-react';

export const MobileAppDashboard: React.FC = () => {
  const { 
    tokens = [], 
    patients = [], 
    appointments = [], 
    invoices = [], 
    payments = [],
    setActiveView, 
    setSelectedPatientForDetail,
    callNextToken,
    addToast,
    isProfileSheetOpen,
    setIsProfileSheetOpen
  } = useApp();

  const { currentUser, logout, setIsDemoModalOpen } = useAuth();

  const [isModulesModalOpen, setIsModulesModalOpen] = useState(false);
  const [selectedCabin, setSelectedCabin] = useState('Cabin 1 — Dr. DOCTOR TEST');
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

  // Live Metrics
  const waitingTokens = tokens.filter((t) => t.status === 'Waiting');
  const calledToken = tokens.find((t) => t.status === 'Called');
  const inConsultationToken = tokens.find((t) => t.status === 'In Consultation');
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

  // 8 Quick Access Modules (Matching reference screenshot 1 & 2)
  const modules = [
    {
      id: 'tokens',
      title: 'Queue',
      subtitle: 'Live Tokens',
      icon: <Activity className="w-5 h-5 text-emerald-600" />,
      bg: 'bg-emerald-50 border-emerald-200/80',
      badge: waitingTokens.length > 0 ? `${waitingTokens.length}` : undefined,
      badgeColor: 'bg-rose-500 text-white',
      view: 'tokens' as const
    },
    {
      id: 'patients',
      title: 'Patients',
      subtitle: 'EMR Roster',
      icon: <Users className="w-5 h-5 text-sky-600" />,
      bg: 'bg-sky-50 border-sky-200/80',
      badge: `${patients.length}`,
      badgeColor: 'bg-sky-600 text-white',
      view: 'admin-patients' as const
    },
    {
      id: 'chart',
      title: 'Odontogram',
      subtitle: '3D Teeth Chart',
      icon: <Stethoscope className="w-5 h-5 text-teal-600" />,
      bg: 'bg-teal-50 border-teal-200/80',
      view: 'patient-profile' as const
    },
    {
      id: 'billing',
      title: 'Billing',
      subtitle: 'Invoices & POS',
      icon: <CreditCard className="w-5 h-5 text-amber-600" />,
      bg: 'bg-amber-50 border-amber-200/80',
      badge: outstandingBalance > 0 ? 'Due' : undefined,
      badgeColor: 'bg-amber-500 text-white',
      view: 'billing' as const
    },
    {
      id: 'appointments',
      title: 'Appts',
      subtitle: 'Doctor Schedule',
      icon: <Calendar className="w-5 h-5 text-blue-600" />,
      bg: 'bg-blue-50 border-blue-200/80',
      badge: `${appointments.length}`,
      badgeColor: 'bg-blue-600 text-white',
      view: 'appointment-mgmt' as const
    },
    {
      id: 'checkin',
      title: 'Check-In',
      subtitle: 'Fast Reception',
      icon: <UserPlus className="w-5 h-5 text-purple-600" />,
      bg: 'bg-purple-50 border-purple-200/80',
      view: 'staff-checkin' as const
    },
    {
      id: 'prescriptions',
      title: 'Rx Write',
      subtitle: 'Digital Medicine',
      icon: <FileText className="w-5 h-5 text-rose-600" />,
      bg: 'bg-rose-50 border-rose-200/80',
      view: 'patient-profile' as const
    },
    {
      id: 'reports',
      title: 'Reports',
      subtitle: 'Practice Ledger',
      icon: <BarChart3 className="w-5 h-5 text-indigo-600" />,
      bg: 'bg-indigo-50 border-indigo-200/80',
      view: 'admin-reports' as const
    }
  ];

  return (
    <div className="w-full max-w-lg mx-auto pb-6 px-3.5 sm:px-4 space-y-4 animate-in fade-in duration-200">
      {/* 1. TOP APP BAR CONTEXT PILL (Matching Reference Screenshot 1) */}
      <div className="flex items-center justify-between gap-2 pt-1 pb-0.5">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200/80 border border-slate-200 transition-colors cursor-pointer text-xs font-bold text-slate-800">
          <Stethoscope className="w-3.5 h-3.5 text-teal-700 shrink-0" />
          <select 
            value={selectedCabin}
            onChange={(e) => setSelectedCabin(e.target.value)}
            className="bg-transparent border-none text-xs font-bold text-slate-800 focus:outline-none cursor-pointer truncate max-w-[190px] xs:max-w-none"
          >
            <option value="Cabin 1 — Dr. DOCTOR TEST">Cabin 1 — Dr. DOCTOR TEST</option>
            <option value="Cabin 2 — General Dental Suite">Cabin 2 — General Dental Suite</option>
            <option value="Reception & Front Desk">Reception &amp; Front Desk</option>
          </select>
        </div>

        <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Live Hub</span>
        </div>
      </div>

      {/* 2. HERO CLINICAL STATUS CARD (Dark Teal Gradient Card like Reference 1) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-950 via-slate-900 to-emerald-950 p-5 sm:p-6 text-white shadow-xl border border-teal-800/40">
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-36 h-36 bg-teal-500/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-300 bg-emerald-900/60 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>Shift Active • OPD Open</span>
            </span>

            <span className="text-xs font-mono text-slate-300 flex items-center gap-1">
              <Clock className="w-3 h-3 text-teal-400" />
              <span>{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
            </span>
          </div>

          <div>
            <span className="text-[11px] font-bold text-slate-300 block">Current Cabin Patient Status</span>
            {activeToken ? (
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  #{activeToken.tokenNumber}
                </span>
                <span className="text-sm sm:text-base font-bold text-emerald-300 truncate">
                  {activeToken.patientName}
                </span>
              </div>
            ) : (
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Cabin Ready
                </span>
                <span className="text-xs text-slate-300">
                  Ready to examine next patient
                </span>
              </div>
            )}
            <p className="text-xs text-slate-300 mt-1 flex items-center gap-2">
              <span className="text-emerald-400 font-bold">{waitingTokens.length} waiting</span> in reception lobby
              <span>•</span>
              <span className="text-slate-300">{completedAppointments} completed</span>
            </p>
          </div>

          {/* Action Button (Styled after the "Request Loan" button in Reference Screenshot 1) */}
          <div className="pt-1">
            <button
              type="button"
              onClick={handleCallNext}
              className="w-full py-3.5 px-4 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-98 border border-white/20 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-lg backdrop-blur-md transition-all cursor-pointer group"
            >
              <div className="w-7 h-7 rounded-full bg-amber-400/20 border border-amber-300/40 text-amber-300 flex items-center justify-center shrink-0">
                <Flame className="w-4 h-4 fill-amber-300" />
              </div>
              <span>Call Next Token to Cabin</span>
              <ArrowRight className="w-4 h-4 text-emerald-300 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. CORE 8-MODULES QUICK ACCESS GRID (Exact Match to Reference Screenshot 1) */}
      <div className="space-y-2.5 pt-1">
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-amber-500 font-black text-sm">⚡</span>
              <h2 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                Shriya Dental Modules
              </h2>
              <button 
                onClick={() => setIsModulesModalOpen(true)}
                className="ml-1 text-[10px] font-black uppercase text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 cursor-pointer hover:bg-emerald-100 transition-colors"
              >
                Quick Access
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Instant access to your clinical activities &amp; patient tools
            </p>
          </div>
        </div>

        {/* 4x2 Grid of Squircle Touch Cards */}
        <div className="grid grid-cols-4 gap-2 sm:gap-2.5">
          {modules.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setActiveView(m.view)}
              className="bg-white hover:bg-slate-50 active:scale-92 rounded-2xl sm:rounded-3xl p-2 sm:p-2.5 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col items-center justify-center text-center cursor-pointer relative group aspect-square"
            >
              {m.badge && (
                <span className={`absolute -top-1.5 -right-1 min-w-4 h-4 px-1 rounded-full text-[9px] font-black flex items-center justify-center border-2 border-white shadow-xs ${m.badgeColor}`}>
                  {m.badge}
                </span>
              )}

              <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center border transition-transform duration-200 group-hover:scale-110 shadow-2xs ${m.bg}`}>
                {m.icon}
              </div>

              <span className="text-[10px] sm:text-[11px] font-black text-slate-800 tracking-tight mt-1.5 truncate max-w-full leading-tight group-hover:text-teal-700">
                {m.title}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 4. KEY METRICS 2-COLUMN CARDS (Matching Reference Screenshot 1 & 3) */}
      <div className="grid grid-cols-2 gap-2.5 pt-1">
        {/* Metric 1: Pending Balance */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 border border-slate-200/90 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 flex items-center gap-1">
              <span>💰</span>
              <span>Pending Dues</span>
            </span>
            <div className="w-6 h-6 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center text-xs">
              <Receipt className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            ₹{outstandingBalance.toLocaleString()}
          </div>

          <div className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
            <span>↗</span>
            <span className="truncate">Live verified balance</span>
          </div>
        </div>

        {/* Metric 2: Revenue Collected */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 border border-slate-200/90 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 flex items-center gap-1">
              <span>📈</span>
              <span>Total Settled</span>
            </span>
            <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs">
              <Coins className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            ₹{totalRevenue.toLocaleString()}
          </div>

          <div className="text-[10px] font-bold text-slate-400 truncate">
            Across verified invoices
          </div>
        </div>
      </div>

      {/* 5. LIVE RECEPTION WAITING QUEUE STRIP */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center font-bold text-xs border border-teal-200">
              👥
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-black text-slate-900">
                Lobby Waiting Queue ({waitingTokens.length})
              </h3>
              <p className="text-[10px] text-slate-400">Next patients queued for doctor consultation</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveView('tokens')}
            className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1 cursor-pointer"
          >
            <span>Full Desk</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {waitingTokens.length === 0 ? (
          <div className="py-5 text-center text-xs text-slate-400 font-medium bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            ✓ All waiting patients have been attended to.
          </div>
        ) : (
          <div className="space-y-2">
            {waitingTokens.slice(0, 3).map((t, idx) => (
              <div
                key={t.id || t.tokenNumber}
                onClick={() => handleOpenPatientDetail(t.patientId)}
                className="p-2.5 rounded-2xl bg-slate-50/80 hover:bg-teal-50/50 border border-slate-100 flex items-center justify-between gap-2 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-7 h-7 rounded-xl bg-teal-700 text-white font-black text-xs flex items-center justify-center shrink-0">
                    {t.tokenNumber}
                  </span>
                  <div className="min-w-0">
                    <div className="font-extrabold text-xs text-slate-900 truncate">
                      {t.patientName}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {t.chiefComplaint || 'Dental Examination'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                    #{idx + 1}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ===================================================================== */}
      {/* 6. MODULES BOTTOM SHEET MODAL (Exact Match to Reference Screenshot 2) */}
      {/* ===================================================================== */}
      {isModulesModalOpen && (
        <div 
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
              <button
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
                  <span className="truncate">{item.label}</span>
                </button>
              ))}
            </div>

            {/* Bottom Mobile App Install Banner (Matching Reference Screenshot 2) */}
            <div className="rounded-2xl bg-gradient-to-r from-teal-800 to-emerald-700 p-3.5 text-white flex items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <Smartphone className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="font-extrabold text-xs truncate">Shriya Dental Mobile App</div>
                  <div className="text-[10px] text-emerald-200 truncate">Android APK • Add to Home Screen</div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleInstallApp}
                className="px-3.5 py-1.5 rounded-xl bg-white text-teal-900 font-black text-xs shrink-0 cursor-pointer shadow-xs hover:bg-emerald-50 active:scale-95 transition-all"
              >
                Install
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

