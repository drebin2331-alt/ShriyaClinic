import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { ToastContainer } from './components/common/ToastContainer';
import { MobileNavigation } from './components/common/MobileNavigation';
import { DemoLoginModal } from './components/common/DemoLoginModal';

import { LandingPage } from './views/LandingPage';
import { BookingWizard } from './views/BookingWizard';
import { LiveQueueView } from './views/LiveQueueView';
import { PatientPortal } from './views/PatientPortal';
import { AdminDashboard } from './views/AdminDashboard';
import { AppointmentManagement } from './views/AppointmentManagement';
import { TokenControlView } from './views/TokenControlView';
import { ReceptionTVView } from './views/ReceptionTVView';
import { PatientManagementView } from './views/PatientManagementView';
import { PatientProfileView } from './views/PatientProfileView';
import { StaffCheckInView } from './views/StaffCheckInView';
import { WhatsAppReminderView } from './views/WhatsAppReminderView';
import { ReportsView } from './views/ReportsView';
import { BillingPaymentView } from './views/BillingPaymentView';
import { StaffUserManagementView } from './views/StaffUserManagementView';
import { AdminSignInPage } from './views/AdminSignInPage';

const MainContent: React.FC = () => {
  const { activeView, setActiveView } = useApp();
  const { currentUser, isStaff } = useAuth();

  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  const isAdminRoute = currentPath.startsWith('/admin') || window.location.hash.startsWith('#/admin');

  // Reception TV View takes full screen
  if (activeView === 'reception-tv') {
    return <ReceptionTVView />;
  }

  // 1. If on /admin route and user is NOT authenticated as staff, show the dedicated Admin Sign-In Page
  if (isAdminRoute && !isStaff) {
    return (
      <>
        <AdminSignInPage 
          onSuccess={() => {
            navigateTo('/admin');
            setActiveView('admin-patients');
          }}
          onBackToCustomer={() => {
            navigateTo('/');
            setActiveView('landing');
          }}
        />
        <ToastContainer />
      </>
    );
  }

  // Helper check for customer views
  const isCustomerView = [
    'patient-portal',
    'customer-appointments',
    'customer-token',
    'customer-treatment',
    'customer-records',
    'customer-profile',
    'customer-billing'
  ].includes(activeView);

  // Helper check for patient EMR profile views
  const isPatientProfileView = [
    'patient-profile',
    'patient-detail',
    'clinical-intake',
    'patient-intake',
    'intake',
    'doctor-dental-chart',
    'doctor-treatment-plans',
    'doctor-clinical-notes',
    'doctor-lab-orders'
  ].includes(activeView);

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-900 pb-20 lg:pb-8">
      <Header 
        isAdminRoute={isAdminRoute} 
        onNavigateToAdmin={() => {
          navigateTo('/admin');
          if (isStaff) {
            setActiveView('admin-patients');
          }
        }}
        onNavigateToHome={() => {
          navigateTo('/');
          setActiveView('landing');
        }}
      />

      <div className="flex-1 w-full">
        {/* If on /admin route and user is authenticated as staff: show EMR views */}
        {isAdminRoute && isStaff ? (
          <>
            {/* Staff / Reception dedicated Check-In */}
            {activeView === 'staff-checkin' && <StaffCheckInView />}

            {/* Queues (Doctor, Admin, Front Desk) */}
            {(activeView === 'tokens' ||
              activeView === 'token-control' || 
              activeView === 'staff-queue' || 
              activeView === 'staff-token-control' || 
              activeView === 'doctor-queue' || 
              activeView === 'admin-queue') && <TokenControlView />}

            {/* Appointments Management */}
            {(activeView === 'appointment-mgmt' || 
              activeView === 'staff-appointments' || 
              activeView === 'doctor-appointments' || 
              activeView === 'admin-appointments') && <AppointmentManagement />}

            {/* Patient Directory */}
            {(activeView === 'patient-mgmt' || 
              activeView === 'staff-patients' || 
              activeView === 'doctor-patients' || 
              activeView === 'admin-patients') && <PatientManagementView />}

            {/* Patient Clinical Profile & Odontogram */}
            {isPatientProfileView && <PatientProfileView />}

            {/* Dedicated Billing, Invoices & Payment Records */}
            {(activeView === 'staff-payments' || 
              activeView === 'admin-billing' || 
              activeView === 'billing') && <BillingPaymentView />}

            {/* Doctors, Receptionists & Staff Management (Admin) */}
            {(activeView === 'admin-staff' || activeView === 'admin-doctors') && <StaffUserManagementView />}

            {/* Dashboards */}
            {(activeView === 'admin-dashboard' || 
              activeView === 'staff-dashboard' || 
              activeView === 'doctor-dashboard' || 
              activeView === 'admin-settings' ||
              activeView === 'landing') && (
                currentUser.role === 'admin' ? <PatientManagementView /> : <AdminDashboard />
              )}

            {/* WhatsApp & Reports */}
            {(activeView === 'whatsapp' || activeView === 'staff-whatsapp' || activeView === 'admin-whatsapp') && <WhatsAppReminderView />}
            {(activeView === 'reports' || activeView === 'admin-reports') && <ReportsView />}
          </>
        ) : (
          /* Customer / Patient views (Screenshot 2: Clean Public Site) */
          <>
            {(activeView === 'landing' || 
              activeView.startsWith('admin-') || 
              activeView.startsWith('staff-') || 
              activeView.startsWith('doctor-')) && <LandingPage />}
            {activeView === 'booking' && <BookingWizard />}
            {activeView === 'live-queue' && <LiveQueueView />}
            {isCustomerView && <PatientPortal />}
          </>
        )}
      </div>

      <DemoLoginModal />
      <ToastContainer />
      {isAdminRoute && isStaff && <MobileNavigation />}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <MainContent />
      </AppProvider>
    </AuthProvider>
  );
}
