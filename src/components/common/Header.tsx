import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { ViewMode } from '../../types';
import { GlobalSearchModal } from '../dental/GlobalSearchModal';
import { PatientEnquiryModal } from './PatientEnquiryModal';
import { 
  Search,
  Bell,
  Moon,
  Plus,
  ChevronDown,
  Menu,
  X,
  Calendar,
  Lock,
  LogOut,
  ExternalLink,
  Users,
  LayoutDashboard,
  Tv,
  UserPlus,
  Activity,
  FileText,
  Stethoscope,
  CheckCircle2,
  CreditCard,
  Sparkles,
  Clock,
  ShieldCheck,
  Phone,
  MessageSquare
} from 'lucide-react';

interface HeaderProps {
  isAdminRoute?: boolean;
  onNavigateToAdmin?: () => void;
  onNavigateToHome?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isAdminRoute = false,
  onNavigateToAdmin,
  onNavigateToHome
}) => {
  const { 
    activeView, 
    setActiveView, 
    patients, 
    appointments, 
    setSelectedPatientForDetail,
    isSidebarCollapsed,
    toggleSidebar,
    isProfileSheetOpen,
    setIsProfileSheetOpen,
    addToast
  } = useApp();

  const { currentUser, isStaff, isAuthenticated, logout } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [quickActionOpen, setQuickActionOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setQuickActionOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut Ctrl+K or Cmd+K in staff mode
  useEffect(() => {
    if (!isAdminRoute) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAdminRoute]);

  const handleNavClick = (view: ViewMode) => {
    setActiveView(view);
    setMobileMenuOpen(false);
    setQuickActionOpen(false);
  };

  const handleAdminRoute = () => {
    if (onNavigateToAdmin) {
      onNavigateToAdmin();
    } else {
      window.history.pushState({}, '', '/admin');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
    setMobileMenuOpen(false);
  };

  const handleHomeRoute = () => {
    if (onNavigateToHome) {
      onNavigateToHome();
    } else {
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
    setActiveView('landing');
    setMobileMenuOpen(false);
  };

  const handleScrollToSection = (sectionId: string) => {
    if (activeView !== 'landing') {
      setActiveView('landing');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        el?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(sectionId);
      el?.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  const getBreadcrumb = () => {
    switch (activeView) {
      case 'admin-dashboard':
      case 'staff-dashboard':
      case 'doctor-dashboard':
        return 'Dashboard';
      case 'staff-checkin':
        return 'Patient Check-In';
      case 'token-control':
      case 'staff-queue':
      case 'doctor-queue':
      case 'admin-queue':
        return 'Waiting Queue';
      case 'appointment-mgmt':
      case 'staff-appointments':
      case 'doctor-appointments':
      case 'admin-appointments':
        return 'Appointments';
      case 'patient-mgmt':
      case 'staff-patients':
      case 'doctor-patients':
      case 'admin-patients':
        return 'Patients Directory';
      case 'patient-profile':
      case 'patient-detail':
      case 'doctor-dental-chart':
        return 'Clinical Odontogram';
      case 'admin-staff':
        return 'Staff & Doctors Management';
      case 'reports':
      case 'admin-reports':
        return 'Practice Reports';
      case 'staff-payments':
      case 'admin-billing':
      case 'billing':
        return 'Billing & Payments';
      default:
        return 'EMR Portal';
    }
  };

  // =========================================================================
  // 1. CUSTOMER-FACING HEADER (Screenshot 2: Clean Public Interface)
  // No internal EMR search bar, no + Quick Action, no staff role badges.
  // =========================================================================
  if (!isAdminRoute) {
    return (
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          {/* Brand Logo */}
          <div 
            onClick={handleHomeRoute}
            className="flex items-center gap-2 sm:gap-2.5 cursor-pointer group select-none min-w-0"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-teal-700 to-emerald-600 text-white flex items-center justify-center font-bold text-base sm:text-lg shadow-sm group-hover:scale-105 transition-transform shrink-0">
              🦷
            </div>
            <div className="min-w-0">
              <span className="text-sm sm:text-base md:text-lg font-black text-slate-900 tracking-tight block leading-tight truncate">
                Shriya
              </span>
              <span className="text-[9px] sm:text-[10px] md:text-[11px] font-bold text-teal-700 block tracking-wider uppercase truncate">
                Multispeciality Dental Clinic
              </span>
            </div>
          </div>

          {/* Customer Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2 text-xs font-bold text-slate-600">
            <button 
              onClick={handleHomeRoute}
              className={`px-3 py-2 rounded-xl transition-colors cursor-pointer ${
                activeView === 'landing' ? 'text-teal-700 bg-teal-50/80 font-black' : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Home
            </button>
            <button 
              onClick={() => handleScrollToSection('services')}
              className="px-3 py-2 rounded-xl hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Specialities
            </button>
            <button 
              onClick={() => handleScrollToSection('transformations')}
              className="px-3 py-2 rounded-xl hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer text-teal-800 font-extrabold flex items-center gap-1.5"
            >
              <span>Smile Results</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </button>
            <button 
              onClick={() => handleScrollToSection('why-choose')}
              className="px-3 py-2 rounded-xl hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Why Choose Us
            </button>
            <button 
              onClick={() => handleScrollToSection('doctors')}
              className="px-3 py-2 rounded-xl hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Specialists
            </button>
            <button 
              onClick={() => handleScrollToSection('testimonials')}
              className="px-3 py-2 rounded-xl hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Reviews
            </button>
            <button 
              onClick={() => handleScrollToSection('contact')}
              className="px-3 py-2 rounded-xl hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Contact & Hours
            </button>
          </nav>

          {/* Right Action Section */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Book Appointment / Consultation Enquiry CTA */}
            <button
              onClick={() => setShowEnquiryModal(true)}
              className="px-2.5 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-teal-700 to-emerald-600 hover:from-teal-600 hover:to-emerald-500 text-white font-extrabold text-[11px] sm:text-xs shadow-sm transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
            >
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden xs:inline">Book Consultation</span>
              <span className="xs:hidden">Book</span>
            </button>

            {/* Staff / Admin Portal Route Link or Active Session Badge */}
            {isStaff ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={handleAdminRoute}
                  className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl border border-emerald-200 transition-colors cursor-pointer shadow-2xs active:scale-95"
                  title="Open Clinical EMR Dashboard"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span className="truncate max-w-[100px] xs:max-w-none">{currentUser.name || 'Doctor'} EMR →</span>
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    await logout();
                    addToast('Signed Out Successfully', 'You have been logged out of Clinic OS.', 'info');
                  }}
                  className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 px-2 py-1.5 rounded-xl border border-rose-200 transition-colors cursor-pointer active:scale-95 shrink-0"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-600" />
                  <span className="hidden xs:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleAdminRoute}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl border border-slate-200 transition-colors cursor-pointer shadow-2xs active:scale-95"
                title="Clinic Staff & Administration Login"
              >
                <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>Staff Portal</span>
              </button>
            )}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 md:hidden cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 pt-3 border-t border-slate-100 flex flex-col gap-1 animate-in fade-in slide-in-from-top-2 duration-150">
            <button 
              onClick={handleHomeRoute} 
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                activeView === 'landing' ? 'bg-teal-50 text-teal-800' : 'text-slate-800 hover:bg-slate-50'
              }`}
            >
              Home
            </button>
            <button onClick={() => handleScrollToSection('services')} className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-800 hover:bg-teal-50 hover:text-teal-800 transition-colors">
              Specialities & Treatments
            </button>
            <button onClick={() => handleScrollToSection('transformations')} className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-800 hover:bg-teal-50 hover:text-teal-800 transition-colors flex items-center justify-between">
              <span>Smile Transformations (Before & After)</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-black">5 Cases</span>
            </button>
            <button onClick={() => handleScrollToSection('why-choose')} className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-800 hover:bg-teal-50 hover:text-teal-800 transition-colors">
              Why Choose Us
            </button>
            <button onClick={() => handleScrollToSection('doctors')} className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-800 hover:bg-teal-50 hover:text-teal-800 transition-colors">
              Specialists
            </button>
            <button onClick={() => handleScrollToSection('testimonials')} className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-800 hover:bg-teal-50 hover:text-teal-800 transition-colors">
              Reviews
            </button>
            <button onClick={() => handleScrollToSection('contact')} className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-800 hover:bg-teal-50 hover:text-teal-800 transition-colors">
              Contact & Hours
            </button>
            
            <div className="pt-2 mt-1 border-t border-slate-100 flex flex-col gap-2">
              <button 
                onClick={() => {
                  setShowEnquiryModal(true);
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-teal-700 to-emerald-600 text-white font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-98"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Book Consultation / Enquire</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <a
                  href="tel:+919400320890"
                  className="py-2.5 px-3 rounded-xl bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 border border-slate-200"
                >
                  <Phone className="w-3.5 h-3.5 text-teal-700" />
                  <span>Call 9400320890</span>
                </a>
                <a
                  href="https://wa.me/919400320890?text=Hello%20Shriya%20Multispeciality%20Dental%20Clinic"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 rounded-xl bg-emerald-50 text-emerald-800 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer border border-emerald-200 active:scale-98"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                  <span>WhatsApp</span>
                </a>
              </div>

              <button 
                onClick={handleAdminRoute}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Staff & Admin Portal</span>
              </button>
            </div>
          </div>
        )}

        {/* Patient Consultation Enquiry Modal */}
        <PatientEnquiryModal
          isOpen={showEnquiryModal}
          onClose={() => setShowEnquiryModal(false)}
        />
      </header>
    );
  }

  // =========================================================================
  // 2. STAFF / ADMIN EMR HEADER (Dedicated to /admin route)
  // Displays Sidebar Menu Toggle, Search Bar (Ctrl+K), Quick Actions, Profile
  // =========================================================================
  return (
    <header className="sticky top-0 z-40 w-full max-w-full bg-white/95 backdrop-blur-md border-b border-slate-200 px-2.5 sm:px-4 py-2 sm:py-2.5 select-none shadow-xs">
      <div className="max-w-[1650px] mx-auto flex items-center justify-between gap-1.5 sm:gap-4">
        {/* Left: Menu Toggle, Brand & Breadcrumb */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 shadow-2xs cursor-pointer transition-colors flex items-center justify-center shrink-0"
            title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label="Toggle Side Menu"
          >
            <Menu className="w-4 h-4 text-slate-700" />
          </button>

          <div 
            onClick={() => handleNavClick('admin-dashboard')}
            className="flex items-center gap-2 cursor-pointer group min-w-0"
            title="Return to Clinic Dashboard"
          >
            <div className="relative shrink-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-700 to-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-xs transition-transform group-hover:scale-105">
                🦷
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 leading-none">
                <span className="text-xs sm:text-sm font-black text-slate-900 tracking-tight truncate">
                  Shriya Dental
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 hidden xs:inline shrink-0" />
              </div>
              <span className="text-[10px] font-bold text-slate-400 block leading-tight mt-0.5 truncate">
                Clinic OS • EMR
              </span>
            </div>
          </div>
        </div>

        {/* Center: Global Search Bar */}
        <div 
          onClick={() => setSearchModalOpen(true)}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-50 hover:bg-white text-slate-400 hover:text-slate-600 cursor-pointer border border-slate-200 transition-colors w-72 lg:w-[420px]"
        >
          <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-xs text-slate-500 truncate flex-1">
            Search patients, appointments, tokens, records...
          </span>
          <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-mono font-medium bg-white text-slate-500 rounded border border-slate-200 shadow-2xs">
            ⌘K
          </kbd>
        </div>

        {/* Right Section: Actions & Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Mobile Search Icon Button */}
          <button
            type="button"
            onClick={() => setSearchModalOpen(true)}
            className="md:hidden p-1.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer shadow-2xs"
            title="Search patients, appointments, tokens"
            aria-label="Search"
          >
            <Search className="w-4 h-4 text-slate-700" />
          </button>

          {/* Notification Bell Button (Matching Reference Screenshot 1) */}
          <button
            type="button"
            onClick={() => handleNavClick('tokens')}
            className="p-1.5 sm:p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer shadow-2xs relative shrink-0"
            title="Live Token Alerts"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4 text-slate-700" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </button>

          {/* Quick Action Button & Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setQuickActionOpen(!quickActionOpen)}
              className="bg-emerald-800 hover:bg-emerald-900 text-white font-medium text-xs px-2 sm:px-3 py-1.5 rounded-md shadow-xs flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Quick Action</span>
              <ChevronDown className="w-3 h-3 opacity-80" />
            </button>

            {quickActionOpen && (
              <div className="absolute right-0 mt-1.5 w-56 bg-white border border-slate-200 rounded-lg shadow-lg py-1.5 z-50 text-xs animate-in fade-in slide-in-from-top-1">
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Clinic Quick Actions
                </div>
                
                <button
                  onClick={() => handleNavClick('staff-checkin')}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-700 flex items-center gap-2 font-medium"
                >
                  <UserPlus className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Check-In Patient</span>
                </button>
                <button
                  onClick={() => handleNavClick('token-control')}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-700 flex items-center gap-2 font-medium"
                >
                  <Activity className="w-3.5 h-3.5 text-amber-600" />
                  <span>Call Next Token</span>
                </button>
                <button
                  onClick={() => handleNavClick('appointment-mgmt')}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-700 flex items-center gap-2 font-medium"
                >
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  <span>Appointments List</span>
                </button>
                <button
                  onClick={() => handleNavClick('admin-billing')}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-700 flex items-center gap-2 font-medium"
                >
                  <CreditCard className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Billing & Payments</span>
                </button>
              </div>
            )}
          </div>

          {/* Direct 1-Tap Sign Out Button (Visible at all times on mobile & desktop) */}
          <button
            type="button"
            onClick={async () => {
              await logout();
              addToast('Signed Out Successfully', 'You have been logged out of Clinic OS.', 'info');
            }}
            className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 active:bg-rose-200 text-rose-700 border border-rose-200 text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs active:scale-95 shrink-0"
            title="Sign Out from Clinic OS"
            aria-label="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            <span className="text-[11px] font-black">Sign Out</span>
          </button>

          {/* User Account Profile Pill (Tap opens Mobile App Profile Bottom Sheet) */}
          <div className="relative" ref={profileRef}>
            <div 
              onClick={() => {
                setIsProfileSheetOpen(true);
                setProfileDropdownOpen((prev) => !prev);
              }}
              className="flex items-center gap-2 px-2 sm:px-2.5 py-1 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 cursor-pointer transition-all shadow-2xs group active:scale-95"
              title="Doctor & Staff Account Profile (Tap to view details & switch role)"
            >
              <div className="relative shrink-0">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-800 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'A'}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
              </div>
              <div className="text-left min-w-0 max-w-[95px] xs:max-w-[130px] sm:max-w-none">
                <div className="text-xs font-bold text-slate-800 leading-tight truncate group-hover:text-emerald-800">
                  {currentUser.name || 'Admin'}
                </div>
                <div className="text-[10px] text-slate-500 leading-tight uppercase font-extrabold truncate">
                  Role: {currentUser.role}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </div>

            {profileDropdownOpen && (
              <div className="hidden md:block absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-2xl py-2 z-50 text-xs animate-in fade-in slide-in-from-top-2">
                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
                  <div className="font-extrabold text-slate-900 text-sm">{currentUser.name}</div>
                  <div className="text-[11px] text-slate-500 truncate">{currentUser.email}</div>
                  <div className="mt-1.5 inline-flex items-center gap-1 font-bold text-[10px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>Clinic {currentUser.role?.toUpperCase()}</span>
                  </div>
                </div>

                <div className="py-1 px-1 space-y-0.5">
                  <button
                    onClick={handleHomeRoute}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 rounded-xl flex items-center gap-2 font-medium cursor-pointer transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 text-slate-400" />
                    <span>View Patient Website</span>
                  </button>
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      setIsProfileSheetOpen(true);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-teal-50 text-teal-800 rounded-xl flex items-center gap-2 font-medium cursor-pointer transition-colors"
                  >
                    <Sparkles className="w-4 h-4 text-teal-600" />
                    <span>Account & Shift Details</span>
                  </button>
                  <div className="pt-1 border-t border-slate-100">
                    <button
                      onClick={async () => {
                        setProfileDropdownOpen(false);
                        await logout();
                        addToast('Signed Out Successfully', 'You have been logged out.', 'info');
                      }}
                      className="w-full text-left px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl flex items-center gap-2 font-bold cursor-pointer transition-colors"
                    >
                      <LogOut className="w-4 h-4 text-rose-600" />
                      <span>Sign Out from Clinic OS</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        patients={patients}
        appointments={appointments}
        onSelectPatient={(p) => {
          setSelectedPatientForDetail(p);
          setActiveView('patient-detail');
        }}
      />
    </header>
  );
};
