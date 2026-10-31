import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  LogIn, 
  ShieldCheck, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  Database,
  ArrowRight,
  UserCheck,
  Stethoscope,
  Building2,
  Users
} from 'lucide-react';

export const DemoLoginModal: React.FC = () => {
  const { 
    isDemoModalOpen, 
    setIsDemoModalOpen, 
    demoAccounts, 
    login, 
    isSupabaseOnline 
  } = useAuth();
  const { setActiveView, addToast } = useApp();

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isDemoModalOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    const res = await login(loginEmail, loginPassword);
    setIsSubmitting(false);

    if (res.success) {
      addToast('Welcome Back!', `Successfully signed in as ${loginEmail}`, 'success');
      routeUserByEmail(loginEmail);
    } else {
      setErrorMessage(res.error || 'Invalid email or password.');
    }
  };

  const handleQuickLogin = async (email: string, role: string) => {
    setErrorMessage(null);
    setIsSubmitting(true);
    setLoginEmail(email);
    setLoginPassword('Password@123');

    const res = await login(email, 'Password@123');
    setIsSubmitting(false);

    if (res.success) {
      addToast('Role Switched', `Active session: ${email}`, 'info');
      routeUserByRole(role);
    } else {
      setErrorMessage(res.error || 'Login failed.');
    }
  };

  const routeUserByEmail = (email: string) => {
    const clean = email.toLowerCase().trim();
    if (clean.includes('patient') || clean.includes('customer')) {
      routeUserByRole('customer');
    } else if (clean.includes('doctor') || clean.includes('dr.')) {
      routeUserByRole('doctor');
    } else if (clean.includes('reception') || clean.includes('desk')) {
      routeUserByRole('receptionist');
    } else {
      const matched = demoAccounts.find((a) => a.email.toLowerCase() === clean);
      routeUserByRole(matched?.role || 'admin');
    }
  };

  const routeUserByRole = (role: string) => {
    if (role === 'customer') {
      setActiveView('patient-portal');
    } else if (role === 'receptionist' || role === 'billing') {
      setActiveView('staff-checkin');
    } else if (role === 'doctor') {
      setActiveView('doctor-queue');
    } else {
      setActiveView('admin-patients');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 max-h-[92vh] overflow-y-auto">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-700 to-emerald-600 text-white flex items-center justify-center shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                Sign In to SmileCare
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Dental Clinic Portal & EMR Management
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsDemoModalOpen(false)}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer transition-colors"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Database Status Indicator */}
        <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
          <div className="flex items-center gap-2">
            <Database className={`w-4 h-4 ${isSupabaseOnline ? 'text-emerald-600' : 'text-teal-600'}`} />
            <span className="font-bold text-slate-700">Database Engine:</span>
            {isSupabaseOnline ? (
              <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Connected to Supabase
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200 text-[11px]">
                Active Clinical Mode
              </span>
            )}
          </div>
        </div>

        {/* Admin-Provisioned Notice Banner */}
        <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 text-emerald-950 text-xs space-y-1">
          <div className="flex items-center gap-2 font-bold text-emerald-900">
            <Lock className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>Admin-Governed Access</span>
          </div>
          <p className="text-[11px] text-emerald-800 leading-relaxed pl-6">
            Public self-registration is disabled. All accounts for <strong>Doctors</strong>, <strong>Receptionists</strong>, and <strong>Patients (Customers)</strong> are created and issued directly by the Clinic Administrator.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Username / Registered Email *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="e.g. admin@clinic.com"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 border border-slate-200 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all outline-hidden text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Password *</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Enter password"
                required
                className="w-full pl-10 pr-10 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 border border-slate-200 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all outline-hidden text-slate-800"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-teal-700 to-emerald-600 hover:from-teal-600 hover:to-emerald-500 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign In to Dashboard</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
