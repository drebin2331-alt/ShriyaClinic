import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { ViewMode } from '../../types';
import { LayoutDashboard, Calendar, Tv, UserCheck, Sparkles, UserPlus, Activity, Stethoscope, Clock, CreditCard, Users, BarChart3, CalendarCheck2 } from 'lucide-react';

export const MobileNavigation: React.FC = () => {
  const { activeView, setActiveView } = useApp();
  const { currentUser } = useAuth();

  let navItems = [
    { id: 'patient-portal' as ViewMode, label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'booking' as ViewMode, label: 'Book', icon: <Clock className="w-5 h-5" /> },
    { id: 'customer-token' as ViewMode, label: 'My Token', icon: <Tv className="w-5 h-5" /> },
    { id: 'landing' as ViewMode, label: 'Home', icon: <Sparkles className="w-5 h-5" /> },
  ];

  if (currentUser.role === 'receptionist' || currentUser.role === 'dental_assistant' || currentUser.role === 'billing') {
    navItems = [
      { id: 'staff-checkin' as ViewMode, label: 'Check-In', icon: <UserPlus className="w-5 h-5" /> },
      { id: 'billing' as ViewMode, label: 'Billing', icon: <CreditCard className="w-5 h-5" /> },
      { id: 'staff-appointments' as ViewMode, label: 'Appts', icon: <Calendar className="w-5 h-5" /> },
      { id: 'staff-patients' as ViewMode, label: 'Patients', icon: <UserCheck className="w-5 h-5" /> },
    ];
  } else if (currentUser.role === 'doctor') {
    navItems = [
      { id: 'doctor-queue' as ViewMode, label: 'My Queue', icon: <Activity className="w-5 h-5" /> },
      { id: 'patient-profile' as ViewMode, label: 'Patient EMR', icon: <Stethoscope className="w-5 h-5" /> },
      { id: 'doctor-appointments' as ViewMode, label: 'Appts', icon: <Calendar className="w-5 h-5" /> },
      { id: 'doctor-dashboard' as ViewMode, label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    ];
  } else if (currentUser.role === 'admin') {
    navItems = [
      { id: 'admin-patients' as ViewMode, label: 'Patients', icon: <Users className="w-5 h-5" /> },
      { id: 'admin-staff' as ViewMode, label: 'Staff', icon: <UserCheck className="w-5 h-5" /> },
      { id: 'admin-reports' as ViewMode, label: 'Reports', icon: <BarChart3 className="w-5 h-5" /> },
    ];
  }

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#f0f5fa]/95 backdrop-blur-md border-t border-white/70 px-3 py-2 shadow-2xl">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`flex flex-col items-center gap-1 p-1.5 rounded-2xl transition-all cursor-pointer ${
                isActive ? 'text-sky-600 scale-105 font-bold' : 'text-slate-500 font-medium'
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'clay-card-accent' : ''}`}>
                {item.icon}
              </div>
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
