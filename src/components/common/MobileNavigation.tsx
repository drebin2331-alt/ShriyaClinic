import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { ViewMode } from '../../types';
import { 
  LayoutDashboard, 
  Calendar, 
  Tv, 
  UserCheck, 
  Sparkles, 
  UserPlus, 
  Activity, 
  Stethoscope, 
  Clock, 
  CreditCard, 
  Users, 
  BarChart3,
  MessageSquare,
  User,
  LogOut,
  LayoutGrid,
  Home
} from 'lucide-react';

export const MobileNavigation: React.FC = () => {
  const { activeView, setActiveView, tokens, isProfileSheetOpen, setIsProfileSheetOpen } = useApp();
  const { currentUser } = useAuth();

  const waitingTokensCount = (tokens || []).filter(
    (t) => t.status === 'Waiting' || t.status === 'Called'
  ).length;

  interface NavItemConfig {
    id: ViewMode | 'direct-whatsapp' | 'open-profile';
    label: string;
    icon: React.ReactNode;
    badge?: number | string;
    matchViews?: ViewMode[];
    action?: () => void;
  }

  const handleOpenWhatsApp = () => {
    const clinicNumber = '919400320890';
    const message = encodeURIComponent(
      'Hello Shriya Multispeciality Dental Clinic! I would like to enquire about a dental consultation slot.'
    );
    window.open(`https://wa.me/${clinicNumber}?text=${message}`, '_blank');
  };

  let navItems: NavItemConfig[] = [
    { 
      id: 'landing' as ViewMode, 
      label: 'Home', 
      icon: <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" /> 
    },
    { 
      id: 'booking' as ViewMode, 
      label: 'Book Consult', 
      icon: <Calendar className="w-4 h-4 sm:w-5 sm:h-5" /> 
    },
    { 
      id: 'live-queue' as ViewMode, 
      label: 'Live Queue', 
      icon: <Tv className="w-4 h-4 sm:w-5 sm:h-5" />, 
      badge: waitingTokensCount > 0 ? waitingTokensCount : undefined 
    },
    { 
      id: 'patient-portal' as ViewMode, 
      label: 'My Records', 
      icon: <LayoutDashboard className="w-4 h-4 sm:w-5 sm:h-5" /> 
    },
    { 
      id: 'open-profile', 
      label: 'Account', 
      icon: <User className="w-4 h-4 sm:w-5 sm:h-5" />,
      action: () => setIsProfileSheetOpen(true)
    }
  ];

  if (currentUser.role === 'receptionist' || currentUser.role === 'dental_assistant' || currentUser.role === 'billing') {
    navItems = [
      { 
        id: 'admin-dashboard' as ViewMode, 
        label: 'Home', 
        icon: <Home className="w-4 h-4 sm:w-5 sm:h-5" />,
        matchViews: ['admin-dashboard', 'staff-dashboard', 'doctor-dashboard']
      },
      { 
        id: 'tokens' as ViewMode, 
        label: 'Queue', 
        icon: <Activity className="w-4 h-4 sm:w-5 sm:h-5" />, 
        badge: waitingTokensCount > 0 ? waitingTokensCount : undefined, 
        matchViews: ['tokens', 'token-control', 'staff-queue'] 
      },
      { 
        id: 'staff-patients' as ViewMode, 
        label: 'Patients', 
        icon: <Users className="w-4 h-4 sm:w-5 sm:h-5" />, 
        matchViews: ['staff-patients', 'patient-mgmt', 'admin-patients'] 
      },
      { 
        id: 'staff-checkin' as ViewMode, 
        label: 'Check-In', 
        icon: <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" /> 
      },
      { 
        id: 'open-profile', 
        label: 'Profile', 
        icon: <User className="w-4 h-4 sm:w-5 sm:h-5" />, 
        action: () => setIsProfileSheetOpen(true)
      }
    ];
  } else if (currentUser.role === 'doctor') {
    navItems = [
      { 
        id: 'doctor-dashboard' as ViewMode, 
        label: 'Home', 
        icon: <Home className="w-4 h-4 sm:w-5 sm:h-5" />,
        matchViews: ['doctor-dashboard', 'admin-dashboard', 'staff-dashboard']
      },
      { 
        id: 'doctor-queue' as ViewMode, 
        label: 'Queue', 
        icon: <Activity className="w-4 h-4 sm:w-5 sm:h-5" />, 
        badge: waitingTokensCount > 0 ? waitingTokensCount : undefined, 
        matchViews: ['doctor-queue', 'token-control', 'tokens'] 
      },
      { 
        id: 'patient-profile' as ViewMode, 
        label: 'EMR Chart', 
        icon: <Stethoscope className="w-4 h-4 sm:w-5 sm:h-5" />, 
        matchViews: ['patient-profile', 'patient-detail', 'clinical-intake', 'doctor-dental-chart', 'doctor-treatment-plans'] 
      },
      { 
        id: 'admin-patients' as ViewMode, 
        label: 'Patients', 
        icon: <Users className="w-4 h-4 sm:w-5 sm:h-5" />, 
        matchViews: ['admin-patients', 'staff-patients'] 
      },
      { 
        id: 'open-profile', 
        label: 'Profile', 
        icon: <User className="w-4 h-4 sm:w-5 sm:h-5" />, 
        action: () => setIsProfileSheetOpen(true)
      }
    ];
  } else if (currentUser.role === 'admin') {
    navItems = [
      { 
        id: 'admin-dashboard' as ViewMode, 
        label: 'Home', 
        icon: <Home className="w-4 h-4 sm:w-5 sm:h-5" />,
        matchViews: ['admin-dashboard', 'staff-dashboard', 'doctor-dashboard']
      },
      { 
        id: 'tokens' as ViewMode, 
        label: 'Queue', 
        icon: <Activity className="w-4 h-4 sm:w-5 sm:h-5" />, 
        badge: waitingTokensCount > 0 ? waitingTokensCount : undefined, 
        matchViews: ['tokens', 'token-control', 'admin-queue'] 
      },
      { 
        id: 'admin-patients' as ViewMode, 
        label: 'Patients', 
        icon: <Users className="w-4 h-4 sm:w-5 sm:h-5" />, 
        matchViews: ['admin-patients', 'staff-patients', 'patient-profile', 'patient-detail'] 
      },
      { 
        id: 'billing' as ViewMode, 
        label: 'Billing', 
        icon: <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />, 
        matchViews: ['billing', 'admin-billing'] 
      },
      { 
        id: 'open-profile', 
        label: 'Profile', 
        icon: <User className="w-4 h-4 sm:w-5 sm:h-5" />,
        action: () => setIsProfileSheetOpen(true)
      }
    ];
  }

  return (
    <aside 
      aria-label="Mobile Navigation Dock"
      className="lg:hidden fixed bottom-3 left-3 right-3 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:w-[460px] max-w-[calc(100vw-1.5rem)] z-40 bg-white/95 backdrop-blur-2xl border border-slate-200/90 rounded-3xl shadow-[0_12px_40px_rgba(15,23,42,0.14)] p-1.5 transition-all select-none"
      style={{ marginBottom: 'max(env(safe-area-inset-bottom, 0px), 0.25rem)' }}
    >
      <div className="flex items-center justify-around gap-1 w-full">
        {navItems.map((item) => {
          const isActive = 
            item.id === 'open-profile'
              ? isProfileSheetOpen
              : item.id !== 'direct-whatsapp' && 
                (activeView === item.id || (item.matchViews && item.matchViews.includes(activeView as ViewMode)));

          const handleClick = () => {
            if (item.action) {
              item.action();
            } else if (item.id !== 'direct-whatsapp' && item.id !== 'open-profile') {
              setActiveView(item.id as ViewMode);
            }
          };

          return (
            <button
              key={item.id}
              type="button"
              onClick={handleClick}
              className={`flex-1 min-w-0 flex flex-col items-center justify-center pt-2 pb-1.5 px-0.5 rounded-2xl transition-all cursor-pointer relative active:scale-95 ${
                isActive 
                  ? 'text-emerald-700' 
                  : 'text-slate-400 hover:text-slate-700 font-medium'
              }`}
            >
              {/* Reference Screenshot 1 Accent Bar on Active Tab */}
              {isActive && (
                <span className="absolute top-0.5 left-1/2 -translate-x-1/2 w-7 h-1 rounded-full bg-emerald-600 shadow-2xs animate-in zoom-in-75 duration-150" />
              )}

              <div className="relative flex items-center justify-center">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 ${
                  isActive ? 'bg-emerald-50 text-emerald-700 shadow-2xs scale-105' : 'text-slate-500'
                }`}>
                  {item.icon}
                </div>

                {item.badge !== undefined && (
                  <span className="absolute -top-1 -right-2 min-w-4 h-4 px-1 rounded-full text-[9px] font-black flex items-center justify-center border-2 border-white bg-rose-500 text-white shadow-xs animate-pulse">
                    {item.badge}
                  </span>
                )}
              </div>

              <span className={`text-[9.5px] sm:text-[10.5px] tracking-tight mt-0.5 truncate max-w-full leading-none ${
                isActive ? 'font-black text-emerald-800' : 'font-semibold text-slate-500'
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
};
