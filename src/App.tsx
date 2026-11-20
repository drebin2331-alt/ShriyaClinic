import React, { lazy, Suspense, useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { ToastContainer } from './components/common/ToastContainer';
import { MobileNavigation } from './components/common/MobileNavigation';
import { MobileProfileSheet } from './components/common/MobileProfileSheet';
import { DemoLoginModal } from './components/common/DemoLoginModal';

const LandingPage = lazy(() => import('./views/LandingPage').then(module => ({ default: module.LandingPage })));
const BookingWizard = lazy(() => import('./views/BookingWizard').then(module => ({ default: module.BookingWizard })));
const LiveQueueView = lazy(() => import('./views/LiveQueueView').then(module => ({ default: module.LiveQueueView })));
const PatientPortal = lazy(() => import('./views/PatientPortal').then(module => ({ default: module.PatientPortal })));
const MobileAppDashboard = lazy(() => import('./views/MobileAppDashboard').then(module => ({ default: module.MobileAppDashboard })));
const AppointmentManagement = lazy(() => import('./views/AppointmentManagement').then(module => ({ default: module.AppointmentManagement })));
const TokenControlView = lazy(() => import('./views/TokenControlView').then(module => ({ default: module.TokenControlView })));
const ReceptionTVView = lazy(() => import('./views/ReceptionTVView').then(module => ({ default: module.ReceptionTVView })));
const PatientManagementView = lazy(() => import('./views/PatientManagementView').then(module => ({ default: module.PatientManagementView })));
const PatientProfileView = lazy(() => import('./views/PatientProfileView').then(module => ({ default: module.PatientProfileView })));
const StaffCheckInView = lazy(() => import('./views/StaffCheckInView').then(module => ({ default: module.StaffCheckInView })));
const WhatsAppReminderView = lazy(() => import('./views/WhatsAppReminderView').then(module => ({ default: module.WhatsAppReminderView })));
const ReportsView = lazy(() => import('./views/ReportsView').then(module => ({ default: module.ReportsView })));
const BillingPaymentView = lazy(() => import('./views/BillingPaymentView').then(module => ({ default: module.BillingPaymentView })));
const StaffUserManagementView = lazy(() => import('./views/StaffUserManagementView').then(module => ({ default: module.StaffUserManagementView })));
const AdminSignInPage = lazy(() => import('./views/AdminSignInPage').then(module => ({ default: module.AdminSignInPage })));

const MainContent: React.FC = () => {
  const { activeView, setActiveView } = useApp();
  const { currentUser, isStaff } = useAuth();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [activeView]);

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
  const isStaffMode = isStaff || isAdminRoute;

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
    <div className="clinic-shell min-h-screen w-full max-w-full flex flex-col text-slate-900 pb-28 lg:pb-8">
      <Header 
        isAdminRoute={isStaffMode} 
        onNavigateToAdmin={() => {
          navigateTo('/admin');
          if (isStaff) {
            setActiveView('admin-patients');
          }
        }}
        onNavigateToHome={() => {
          navigateTo('/');
          if (isStaff) {
            setActiveView('admin-dashboard');
          } else {
            setActiveView('landing');
          }
        }}
      />

      <div className="flex-1 w-full max-w-full">
        {/* If user is authenticated as staff or on /admin route: show full Clinic EMR views */}
        {isStaffMode && isStaff ? (
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

            {/* Dashboards (Mobile App Model matching reference screenshots) */}
            {(activeView === 'admin-dashboard' || 
              activeView === 'staff-dashboard' || 
              activeView === 'doctor-dashboard' || 
              activeView === 'admin-settings' ||
              activeView === 'landing') && <MobileAppDashboard />}

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
      <MobileNavigation />
      <MobileProfileSheet />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Suspense fallback={<div role="status" className="desk-loading"><span>Loading Shriya Clinic…</span><i aria-hidden="true"/><i aria-hidden="true"/></div>}>
          <MainContent />
        </Suspense>
      </AppProvider>
    </AuthProvider>
  );
}
