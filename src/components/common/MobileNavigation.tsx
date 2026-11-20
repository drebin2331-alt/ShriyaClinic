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

  const today = new Date().toISOString().split('T')[0];
  const waitingTokensCount = (tokens || []).filter(
    (t) => (t.status === 'Waiting' || t.status === 'Called') && t.id !== 'tok-1794029736556' && t.tokenNumber !== 'W-002' && (!t.date || t.date === today)
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
      label: 'Book',
      icon: <Calendar className="w-4 h-4 sm:w-5 sm:h-5" /> 
    },
    { 
      id: 'live-queue' as ViewMode, 
      label: 'Queue',
      icon: <Tv className="w-4 h-4 sm:w-5 sm:h-5" />, 
      badge: waitingTokensCount > 0 ? waitingTokensCount : undefined 
    },
    { 
      id: 'patient-portal' as ViewMode, 
      label: 'Records',
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
        label: 'Chart',
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
    <nav aria-label="Mobile Navigation Dock" className="phone-dock">
      <div>
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
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="dock-symbol">{item.icon}{item.badge !== undefined && <sup>{item.badge}</sup>}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
