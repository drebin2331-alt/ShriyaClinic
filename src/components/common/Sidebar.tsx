import { ClinicMark } from './ClinicMark';
import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { ViewMode } from '../../types';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Tv, 
  Tv2,
  MessageSquare, 
  BarChart3, 
  UserCheck, 
  FileText, 
  Stethoscope, 
  Activity, 
  CreditCard, 
  Armchair, 
  Package, 
  Layers, 
  FlaskConical, 
  Clock, 
  Settings, 
  UserPlus, 
  Search,
  ChevronRight,
  Menu,
  Sparkles,
  ArrowRight,
  CalendarCheck2,
  LogOut
} from 'lucide-react';

export interface SidebarProps {
  type?: 'admin' | 'patient' | string;
  mobile?: boolean;
  onNavigate?: () => void;
}

interface NavItem {
  id: ViewMode;
  label: string;
  icon: React.ReactNode;
  badge?: string | number;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({ mobile = false, onNavigate }) => {
  const { 
    activeView, 
    setActiveView: changeView,
    appointments, 
    tokens,
    patients, 
    selectedPatientForDetail,
    isSidebarCollapsed,
    toggleSidebar,
    enquiries = []
  } = useApp();
  const { currentUser, logout } = useAuth();
  const setActiveView = (view: ViewMode) => { changeView(view); onNavigate?.(); };

  const today = new Date().toISOString().split('T')[0];
  const activeTokensCount = tokens.filter(
    (t) => (t.status === 'Waiting' || t.status === 'Called') && t.id !== 'tok-1794029736556' && t.tokenNumber !== 'W-002' && (!t.date || t.date === today)
  ).length;
  const waitingAppointmentsCount = appointments.filter((a) => a.status === 'Waiting').length;
  const newEnquiriesCount = enquiries.filter((e) => e.status === 'New').length;

  // Build section groups depending on role
  const getNavSections = (): NavSection[] => {
    if (currentUser.role === 'customer') {
      return [
        {
          title: 'WORKSPACE',
          items: [
            { id: 'patient-portal', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
            { id: 'customer-token', label: 'My Live Token', icon: <Tv className="w-4 h-4" /> }
          ]
        },
        {
          title: 'APPOINTMENTS',
          items: [
            { id: 'booking', label: 'Book Appointment', icon: <Clock className="w-4 h-4" /> },
            { id: 'customer-appointments', label: 'My Appointments', icon: <Calendar className="w-4 h-4" /> }
          ]
        },
        {
          title: 'MY RECORDS',
          items: [
            { id: 'customer-treatment', label: 'Treatment Plans', icon: <Activity className="w-4 h-4" /> },
            { id: 'customer-records', label: 'Records & Scans', icon: <FileText className="w-4 h-4" /> },
            { id: 'customer-billing', label: 'Bills & Payments', icon: <CreditCard className="w-4 h-4" /> },
            { id: 'customer-profile', label: 'My Profile', icon: <UserCheck className="w-4 h-4" /> }
          ]
        }
      ];
    }

    if (currentUser.role === 'doctor') {
      return [
        {
          title: 'CLINICAL QUEUE',
          items: [
            { id: 'doctor-queue', label: "Doctor's Consultation Queue", icon: <Activity className="w-4 h-4" />, badge: waitingAppointmentsCount || undefined },
            { id: 'doctor-appointments', label: 'My Appointments', icon: <Calendar className="w-4 h-4" />, badge: appointments.length || undefined }
          ]
        },
        {
          title: 'PATIENT EMR & ODONTOGRAM',
          items: [
            { id: 'doctor-patients', label: 'Patients Directory (EMR)', icon: <Users className="w-4 h-4" />, badge: patients.length },
            ...(selectedPatientForDetail ? [
              { id: 'patient-profile' as ViewMode, label: `${selectedPatientForDetail.name} (Active EMR)`, icon: <Stethoscope className="w-4 h-4" /> }
            ] : [])
          ]
        },
        {
          title: 'BILLING & REPORTS',
          items: [
            { id: 'billing', label: 'Approved Bills & Pricing', icon: <CreditCard className="w-4 h-4" /> },
            { id: 'reports', label: 'Clinical Reports', icon: <BarChart3 className="w-4 h-4" /> }
          ]
        }
      ];
    }

    if (currentUser.role === 'admin') {
      return [
        {
          title: 'ADMINISTRATION',
          items: [
            { id: 'admin-patients', label: 'Full Patients List', icon: <Users className="w-4 h-4" />, badge: patients.length },
            { id: 'token-control', label: 'Live Queue & Tokens', icon: <Clock className="w-4 h-4" />, badge: activeTokensCount || undefined },
            { id: 'admin-staff', label: 'User Accounts & Staff (Doctors, Reception, Patients)', icon: <UserCheck className="w-4 h-4" /> },
            { id: 'admin-reports', label: 'Reports & PDF Download', icon: <BarChart3 className="w-4 h-4" /> }
          ]
        }
      ];
    }

    // Default: Merged Receptionist, Billing & Accounts
    return [
      {
        title: 'FRONT DESK',
        items: [
          { id: 'staff-checkin', label: 'Patient Arrival & Check-In', icon: <UserPlus className="w-4 h-4" />, badge: newEnquiriesCount > 0 ? newEnquiriesCount : undefined },
          { id: 'token-control', label: 'Live Queue & Token Control', icon: <Clock className="w-4 h-4" />, badge: activeTokensCount || undefined },
          { id: 'reception-tv', label: 'Reception TV Mode', icon: <Tv2 className="w-4 h-4" /> }
        ]
      },
      {
        title: 'PATIENT DIRECTORY',
        items: [
          { id: 'staff-patients', label: 'Patients Directory & Reg', icon: <Users className="w-4 h-4" />, badge: patients.length },
          { id: 'staff-appointments', label: "Appointments & Inquiries", icon: <Calendar className="w-4 h-4" />, badge: newEnquiriesCount > 0 ? newEnquiriesCount : appointments.length || undefined }
        ]
      },
      {
        title: 'BILLING & ACCOUNTS',
        items: [
          { id: 'billing', label: 'Billing & Invoices', icon: <CreditCard className="w-4 h-4" /> },
          { id: 'admin-reports', label: 'Financial Collections Report', icon: <BarChart3 className="w-4 h-4" /> },
          { id: 'staff-whatsapp', label: 'WhatsApp Reminders', icon: <MessageSquare className="w-4 h-4" /> }
        ]
      }
    ];
  };

  const sections = getNavSections();

  // Collapsed Sidebar View (Compact Icon Rail with Hover Tooltips)
  if (isSidebarCollapsed && !mobile) {
    return (
      <aside className="hidden lg:flex flex-col w-16 shrink-0 bg-white border-r border-slate-200 py-3.5 px-2 min-h-[calc(100vh-60px)] items-center transition-all duration-200 select-none">
        {/* Top: Brand Icon + Open/Expand Toggle Button */}
        <div className="flex flex-col items-center gap-2 pb-3 mb-2 border-b border-slate-100 w-full">
          <div 
            onClick={() => setActiveView('landing')}
            className="w-8 h-8 rounded-lg bg-emerald-800 text-white font-bold text-sm flex items-center justify-center shadow-xs cursor-pointer hover:scale-105 transition-transform"
            title="Shriya Multispeciality Dental Clinic EMR"
          ><ClinicMark /></div>
          <button
            onClick={toggleSidebar}
            className="w-8 h-8 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 flex items-center justify-center cursor-pointer transition-colors border border-emerald-300 shadow-2xs group"
            title="Open / Expand Side Menu (Click to Open)"
            aria-label="Expand Side Menu"
          >
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

        {/* Compact Icon Navigation */}
        <div className="flex-1 overflow-y-auto space-y-3.5 w-full py-1 scrollbar-none flex flex-col items-center">
          {sections.map((section) => (
            <div key={section.title} className="space-y-1.5 w-full flex flex-col items-center">
              {section.items.map((item) => {
                const isActive = 
                  activeView === item.id || 
                  (item.id === 'patient-profile' && (activeView === 'patient-detail' || activeView === 'doctor-patients')) ||
                  (item.id === 'staff-checkin' && activeView === 'staff-checkin') ||
                  (item.id === 'staff-appointments' && activeView === 'appointment-mgmt');

                return (
                  <div key={item.id} className="relative group w-full flex justify-center">
                    <button
                      onClick={() => setActiveView(item.id)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer relative ${
                        isActive
                          ? 'bg-emerald-700 text-white shadow-md ring-2 ring-emerald-500/20'
                          : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                      title={item.label}
                    >
                      <span className="shrink-0">{item.icon}</span>

                      {item.badge !== undefined && typeof item.badge === 'number' && item.badge > 0 && (
                        <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-emerald-600 text-white rounded-full text-[9px] font-black flex items-center justify-center border-2 border-white shadow-2xs">
                          {item.badge > 9 ? '9+' : item.badge}
                        </span>
                      )}
                    </button>

                    {/* Floating Flyout Tooltip */}
                    <div className="absolute left-12 top-1/2 -translate-y-1/2 z-50 hidden group-hover:flex items-center gap-2 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-xl shadow-xl whitespace-nowrap pointer-events-none animate-in fade-in zoom-in-95">
                      <span>{item.label}</span>
                      {item.badge !== undefined && (
                        <span className="px-1.5 py-0.2 bg-emerald-500 text-white rounded-full text-[10px] font-black">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Bottom Expand Button */}
        <div className="pt-2 border-t border-slate-100 w-full flex flex-col items-center gap-1.5">
          <button
            onClick={toggleSidebar}
            className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 flex items-center justify-center cursor-pointer transition-colors shadow-2xs"
            title="Open / Expand Side Menu"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </aside>
    );
  }

  // Expanded Sidebar View (Full Navigation with Clear Close Option)
  return (
    <aside className={`${mobile ? 'flex w-full' : 'hidden lg:flex w-64'} flex-col shrink-0 bg-white border-r border-slate-200 py-4 px-3 min-h-[calc(100dvh-60px)] transition-all duration-200 select-none`}>
      {/* Brand Header */}
      <div className="flex items-center px-2 pb-3 mb-2 border-b border-slate-100">
        <div 
          onClick={() => setActiveView('landing')}
          className="flex items-center gap-2 cursor-pointer group"
          title="Shriya Multispeciality Dental Clinic EMR"
        >
          <div className="w-7 h-7 rounded-md bg-emerald-800 text-white font-bold text-xs flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform"><ClinicMark /></div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-900 tracking-tight">Shriya Dental</span>
              <span className="text-[9px] font-black px-1.5 py-0.2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded">
                CLINIC EMR
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block -mt-0.5 truncate">
              Multispeciality Clinic
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {sections.map((section) => (
          <div key={section.title} className="space-y-0.5">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2.5 py-1">
              {section.title}
            </div>

            {section.items.map((item) => {
              const isActive = 
                activeView === item.id || 
                (item.id === 'patient-profile' && (activeView === 'patient-detail' || activeView === 'doctor-patients')) ||
                (item.id === 'staff-checkin' && activeView === 'staff-checkin') ||
                (item.id === 'staff-appointments' && activeView === 'appointment-mgmt');

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-colors cursor-pointer text-left ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-200 font-bold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
                  }`}
                >
                  <div className={`flex items-center gap-2.5 ${mobile ? 'min-w-0' : 'truncate'}`}>
                    <span className={`shrink-0 ${isActive ? 'text-emerald-700' : 'text-slate-400'}`}>
                      {item.icon}
                    </span>
                    <span className={mobile ? 'whitespace-normal text-left' : 'truncate'}>{item.label}</span>
                  </div>

                  {item.badge !== undefined && typeof item.badge === 'number' && item.badge > 0 && (
                    <span 
                      className={`ml-2 px-2 py-0.5 text-[10px] font-black rounded-full ${
                        isActive 
                          ? 'bg-emerald-700 text-white shadow-2xs' 
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Sign Out Action at Bottom */}
      <div className="pt-3 mt-2 border-t border-slate-100 px-1">
        <button
          onClick={async () => {
            onNavigate?.();
            await logout();
          }}
          className="w-full flex items-center justify-between text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-2 rounded-xl transition-colors cursor-pointer border border-rose-200/80 shadow-2xs"
          title="Sign Out from Clinic OS"
        >
          <span className="flex items-center gap-1.5">
            <LogOut className="w-3.5 h-3.5 text-rose-500" />
            <span>Sign Out</span>
          </span>
          <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-1.5 py-0.5 rounded border border-rose-200">
            Exit
          </span>
        </button>
      </div>
    </aside>
  );
};
