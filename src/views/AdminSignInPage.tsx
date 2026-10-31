import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  Database,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';

interface AdminSignInPageProps {
  onSuccess?: () => void;
  onBackToCustomer?: () => void;
}

export const AdminSignInPage: React.FC<AdminSignInPageProps> = ({ 
  onSuccess, 
  onBackToCustomer 
}) => {
  const { login, isSupabaseOnline } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    const res = await login(email, password);
    setIsSubmitting(false);

    if (res.success) {
      if (onSuccess) {
        onSuccess();
      }
    } else {
      setErrorMessage(res.error || 'Invalid username or password. Please verify your credentials.');
    }
  };

  const handleReturnHome = () => {
    if (onBackToCustomer) {
      onBackToCustomer();
    } else {
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 text-slate-100 p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -right-40 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Navigation Bar */}
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between py-2 relative z-10 gap-2">
        <button
          onClick={handleReturnHome}
          className="inline-flex items-center gap-1.5 sm:gap-2 text-xs font-bold text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 px-3 sm:px-3.5 py-2 rounded-xl border border-slate-700/60 transition-all cursor-pointer backdrop-blur-xs shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">Return to Website</span>
          <span className="xs:hidden">Website</span>
        </button>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <Database className={`w-3.5 h-3.5 ${isSupabaseOnline ? 'text-emerald-400' : 'text-teal-400'}`} />
          <span className="text-[10px] sm:text-[11px] font-semibold text-slate-300">
            {isSupabaseOnline ? 'DB Online' : 'Offline'}
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>
      </header>

      {/* Center Sign In Container */}
      <main className="w-full max-w-md mx-auto my-auto relative z-10 py-8">
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/60 space-y-6">
          {/* Brand Header */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-700 to-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-teal-900/40 border border-teal-400/20">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-teal-400 bg-teal-950/60 border border-teal-800/40 px-2.5 py-0.5 rounded-full">
                Clinical Administration
              </span>
              <h1 className="text-2xl font-black text-white tracking-tight mt-2">
                Sign In to Shriya Dental
              </h1>
              <p className="text-xs text-slate-400 mt-1 font-medium leading-relaxed max-w-xs mx-auto">
                Shriya Multispeciality Dental Clinic • Authorized personnel & management EMR portal.
              </p>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-950/70 border border-rose-800/80 text-rose-200 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Credentials Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">
                Username / Registered Email *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. admin@clinic.com"
                  autoComplete="username"
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-xs font-medium bg-slate-950/70 border border-slate-700/80 text-white placeholder-slate-500 focus:bg-slate-950 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your clinic password"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-10 py-3 rounded-xl text-xs font-medium bg-slate-950/70 border border-slate-700/80 text-white placeholder-slate-500 focus:bg-slate-950 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-500 hover:from-teal-500 hover:to-emerald-400 text-white font-black text-xs shadow-lg shadow-teal-950/50 hover:shadow-teal-600/30 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </div>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Secure Access Footer Note */}
          <div className="pt-3 border-t border-slate-800/80 text-center">
            <p className="text-[11px] text-slate-500 font-medium">
              Shriya Multispeciality Dental Clinic OS • End-to-End Encrypted
            </p>
          </div>
        </div>
      </main>

      {/* Page Footer */}
      <footer className="w-full max-w-5xl mx-auto py-3 text-center text-xs text-slate-500 relative z-10">
        <span>© {new Date().getFullYear()} Shriya Multispeciality Dental Clinic. All rights reserved.</span>
      </footer>
    </div>
  );
};
