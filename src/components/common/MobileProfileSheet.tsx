import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { 
  X, 
  LogOut, 
  ShieldCheck, 
  ExternalLink, 
  Stethoscope, 
  UserCheck, 
  Activity, 
  Calendar, 
  CreditCard,
  Building,
  Phone,
  Mail,
  ChevronRight,
  Sparkles,
  Users
} from 'lucide-react';

export const MobileProfileSheet: React.FC = () => {
  const { 
    isProfileSheetOpen, 
    setIsProfileSheetOpen, 
    setActiveView, 
    addToast 
  } = useApp();
  const { currentUser, logout, setIsDemoModalOpen } = useAuth();

  if (!isProfileSheetOpen) return null;

  const handleSignOut = async () => {
    setIsProfileSheetOpen(false);
    await logout();
    addToast('Signed Out Successfully', 'You have been logged out of Clinic OS.', 'info');
  };

  const handleNavigate = (path: string, view?: any) => {
    setIsProfileSheetOpen(false);
    if (view) {
      setActiveView(view);
    }
    if (path) {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const getRoleBadge = () => {
    switch (currentUser.role) {
      case 'doctor':
        return {
          label: 'DOCTOR / SPECIALIST (MDS)',
          icon: <Stethoscope className="w-3.5 h-3.5 text-teal-600" />,
          color: 'bg-teal-50 text-teal-800 border-teal-200'
        };
      case 'admin':
        return {
          label: 'PRACTICE ADMINISTRATOR',
          icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />,
          color: 'bg-emerald-50 text-emerald-800 border-emerald-200'
        };
      case 'receptionist':
        return {
          label: 'RECEPTION & FRONT DESK',
          icon: <UserCheck className="w-3.5 h-3.5 text-sky-600" />,
          color: 'bg-sky-50 text-sky-800 border-sky-200'
        };
      default:
        return {
          label: 'PATIENT / GUEST',
          icon: <Sparkles className="w-3.5 h-3.5 text-slate-600" />,
          color: 'bg-slate-100 text-slate-800 border-slate-200'
        };
    }
  };

  const roleBadge = getRoleBadge();

  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col justify-end bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={() => setIsProfileSheetOpen(false)}
    >
      <div 
        className="w-full max-w-lg mx-auto bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in slide-in-from-bottom duration-250 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 1rem)' }}
      >
        {/* Pull Drag Indicator */}
        <div className="w-12 h-1.5 rounded-full bg-slate-300 mx-auto my-2.5 shrink-0" />

        {/* Sheet Top Bar */}
        <div className="px-5 py-2 flex items-center justify-between border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500">
              Clinic Account & Shift
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsProfileSheetOpen(false)}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close sheet"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* User Hero Identity Card */}
          <div className="bg-gradient-to-tr from-slate-900 via-teal-950 to-slate-900 rounded-2xl p-4 sm:p-5 text-white shadow-md relative overflow-hidden">
            <div className="relative z-10 flex items-start gap-3.5">
              <div className="relative shrink-0">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 text-slate-950 font-black text-xl flex items-center justify-center shadow-lg">
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-900" title="Active on duty" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-black text-white truncate">
                    {currentUser.name || 'Clinic User'}
                  </h3>
                </div>

                <div className="text-xs text-slate-300 truncate mt-0.5">
                  {currentUser.email || 'clinic.staff@shriyadental.com'}
                </div>

                <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                  <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${roleBadge.color}`}>
                    {roleBadge.icon}
                    <span>{roleBadge.label}</span>
                  </span>

                  <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-400/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>On Duty 🟢</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Building className="w-3 h-3 text-teal-400" />
                <span>Shriya Multispeciality Clinic</span>
              </span>
              <span className="font-mono text-slate-400">Pollachi Road, Kozhinjapara</span>
            </div>
          </div>

          {/* Quick Shortcuts Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => handleNavigate('/', 'landing')}
              className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-left transition-colors cursor-pointer group flex flex-col justify-between"
            >
              <ExternalLink className="w-4 h-4 text-teal-700 mb-2 group-hover:scale-110 transition-transform" />
              <div>
                <div className="text-xs font-black text-slate-900">Patient Website</div>
                <div className="text-[10px] text-slate-500">View public portal</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsProfileSheetOpen(false);
                setIsDemoModalOpen(true);
              }}
              className="p-3 rounded-2xl bg-teal-50/70 hover:bg-teal-100/70 border border-teal-200/70 text-left transition-colors cursor-pointer group flex flex-col justify-between"
            >
              <Sparkles className="w-4 h-4 text-emerald-700 mb-2 group-hover:scale-110 transition-transform" />
              <div>
                <div className="text-xs font-black text-teal-950">Switch Account</div>
                <div className="text-[10px] text-teal-700">Doctor / Admin / Desk</div>
              </div>
            </button>
          </div>

          {/* Clinical Workspaces (Direct 1-tap jumping) */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-1">
              Quick Clinical Navigation
            </span>

            <div className="bg-slate-50 rounded-2xl border border-slate-200/80 divide-y divide-slate-100 overflow-hidden">
              <button
                type="button"
                onClick={() => handleNavigate('/admin', 'tokens')}
                className="w-full px-3.5 py-2.5 text-left text-xs font-bold text-slate-700 hover:bg-white flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Activity className="w-4 h-4 text-teal-600" />
                  <span>Live Queue & Token Desk</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() => handleNavigate('/admin', 'admin-patients')}
                className="w-full px-3.5 py-2.5 text-left text-xs font-bold text-slate-700 hover:bg-white flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>Patients EMR Directory</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() => handleNavigate('/admin', 'billing')}
                className="w-full px-3.5 py-2.5 text-left text-xs font-bold text-slate-700 hover:bg-white flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  <span>Invoices & Billing Hub</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>

          {/* PROMINENT HIGH-CONTRAST SIGN OUT BUTTON */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-rose-600 via-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 active:scale-98 text-white font-black text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-rose-600/30 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out from Clinic OS</span>
            </button>
            <p className="text-center text-[10px] text-slate-400 mt-2 font-medium">
              You will be safely logged out of your active shift session.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

