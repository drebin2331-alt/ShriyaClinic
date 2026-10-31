import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  ViewMode,
  Appointment,
  Doctor,
  Service,
  PatientRecord,
  WhatsAppReminder,
  TokenStatus,
  ToastMessage,
  DentalChair,
  InventoryItem,
  UserRole,
  ClinicVisit,
  QueueToken,
  ToothCondition,
  ToothSurfaceState,
  FollowUpRecord,
  FollowUpStatus,
  Invoice,
  PaymentRecord,
  PaymentMethod,
  PrescriptionRecord,
  FeeApprovalRecord,
  AuditEvent,
  StaffUser,
  PatientEnquiry
} from '../types';
import {
  MOCK_DOCTORS,
  MOCK_SERVICES,
  INITIAL_APPOINTMENTS,
  MOCK_PATIENTS,
  MOCK_WHATSAPP_REMINDERS,
  MOCK_CHAIRS,
  MOCK_INVENTORY,
  INITIAL_VISITS,
  INITIAL_TOKENS,
  INITIAL_INVOICES,
  INITIAL_PAYMENTS
} from '../mockData';
import { createFullDefaultDentalChart } from '../utils/dentalChartHelper';
import { apiClient } from '../utils/apiClient';
import {
  supabase,
  isSupabaseConfigured,
  fetchPatientsFromDb,
  savePatientToDb,
  deletePatientFromDb,
  fetchAppointmentsFromDb,
  saveAppointmentToDb,
  fetchTokensFromDb,
  saveTokenToDb,
  fetchInvoicesFromDb,
  saveInvoiceToDb,
  fetchPaymentsFromDb,
  savePaymentToDb,
  fetchChairsFromDb,
  saveChairToDb,
  fetchProfilesFromDb,
  saveProfileToDb,
  deleteProfileFromDb
} from '../lib/supabase';
import { safeSetItem } from '../utils/safeStorage';

function isSamePatientRecord(prev: PatientRecord | null, next: PatientRecord | null): boolean {
  if (prev === next) return true;
  if (!prev || !next) return false;
  if (prev.id !== next.id) return false;
  if (prev.outstandingBalance !== next.outstandingBalance) return false;
  if (prev.status !== next.status) return false;
  if (prev.currentTreatment !== next.currentTreatment) return false;
  if (prev.lastVisit !== next.lastVisit) return false;
  if (prev.totalVisits !== next.totalVisits) return false;
  if ((prev.invoices?.length || 0) !== (next.invoices?.length || 0)) return false;
  if ((prev.visits?.length || 0) !== (next.visits?.length || 0)) return false;
  if ((prev.clinicalNotes?.length || 0) !== (next.clinicalNotes?.length || 0)) return false;
  if ((prev.treatmentPlans?.length || 0) !== (next.treatmentPlans?.length || 0)) return false;
  return JSON.stringify(prev) === JSON.stringify(next);
}

export const INITIAL_STAFF_MEMBERS: StaffUser[] = [
  {
    id: 'usr-admin-01',
    name: 'Dr. Rajesh Patel',
    email: 'admin@clinic.com',
    password: 'Password@123',
    role: 'admin',
    phone: '+91 98765 33445',
    specialization: 'Practice Governance & Implants',
    qualification: 'BDS, FICOI (USA)',
    roomNumber: 'Admin Suite',
    status: 'Active',
    createdAt: '2026-01-01'
  }
];

interface AppContextType {
  activeView: ViewMode;
  setActiveView: (view: ViewMode) => void;
  appointments: Appointment[];
  visits: ClinicVisit[];
  tokens: QueueToken[];
  doctors: Doctor[];
  services: Service[];
  patients: PatientRecord[];
  chairs: DentalChair[];
  inventory: InventoryItem[];
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  reminders: WhatsAppReminder[];
  enquiries: PatientEnquiry[];
  addEnquiry: (data: {
    patientName: string;
    phone: string;
    email?: string;
    preferredDate?: string;
    preferredTimeWindow?: string;
    chiefComplaint: string;
    preferredDoctorId?: string;
    preferredDoctorName?: string;
    notes?: string;
  }) => Promise<PatientEnquiry>;
  updateEnquiryStatus: (id: string, status: PatientEnquiry['status']) => void;
  sendAppointmentWhatsApp: (appointment: Appointment, customNote?: string) => void;
  toasts: ToastMessage[];
  addToast: (title: string, description?: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;

  // Appointment workflow (Booking ≠ Arrival)
  addAppointment: (data: {
    patientName: string;
    patientPhone: string;
    patientEmail?: string;
    patientAge?: number;
    patientGender?: 'Male' | 'Female' | 'Other';
    doctorId: string;
    date: string;
    timeSlot: string;
    reasonForVisit: string;
    amount?: number;
  }) => Promise<Appointment>;
  updateAppointmentStatus: (id: string, status: TokenStatus) => void;
  markNoShow: (appointmentId: string) => void;
  rescheduleAppointment: (appointmentId: string, newDate: string, newTimeSlot: string, reason?: string) => Promise<void>;
  cancelAppointment: (appointmentId: string, reason?: string) => Promise<void>;

  // Patient Arrival & Token Lifecycle
  checkInPatient: (data: {
    appointmentId?: string;
    patientId: string;
    doctorId: string;
    chairId?: string;
    priority?: 'Normal' | 'Urgent' | 'Emergency';
    reasonForVisit: string;
    isWalkIn?: boolean;
  }) => Promise<{ visit: ClinicVisit; token: QueueToken }>;
  createWalkInPatient: (data: {
    patientName: string;
    patientPhone: string;
    patientAge?: number;
    patientGender?: 'Male' | 'Female' | 'Other';
    doctorId: string;
    reasonForVisit: string;
    priority?: 'Normal' | 'Urgent' | 'Emergency';
    chairId?: string;
  }) => Promise<{ visit: ClinicVisit; token: QueueToken }>;
  callToken: (tokenNumberOrId: string, chairId?: string) => Promise<void>;
  startConsultation: (visitIdOrToken: string) => Promise<void>;
  completeConsultation: (visitIdOrToken: string, summary?: {
    notes?: string;
    diagnosis?: string;
    clinicalFindings?: string;
    treatmentPlan?: string;
    followUpDate?: string;
    followUpReason?: string;
  }) => Promise<void>;
  holdToken: (tokenNumberOrId: string) => Promise<void>;
  skipToken: (tokenNumberOrId: string, reason?: string) => Promise<void>;

  // Doctor Fee Approval & Prescriptions
  approveFee: (data: {
    visitId: string;
    patientId?: string;
    patientName?: string;
    patientOpNumber?: string;
    doctorId?: string;
    doctorName?: string;
    consultationFee: number;
    items: Array<{ description: string; quantity: number; unitPrice: number }>;
    discountType?: 'amount' | 'percentage';
    discountValue?: number;
    discountReason?: string;
    taxRate?: number;
  }) => Promise<{ feeApproval: FeeApprovalRecord; invoice: Invoice; visit?: ClinicVisit }>;
  createPrescription: (data: {
    visitId: string;
    patientId: string;
    items: Array<{
      medicine: string;
      dosage: string;
      route?: string;
      frequency: string;
      duration: string;
      instructions: string;
    }>;
    diagnosis?: string;
    doctorNotes?: string;
    followUpDate?: string;
  }) => Promise<{ prescription: PrescriptionRecord; visit?: ClinicVisit }>;

  // Receptionist Checkout / Encounter Closure
  closeVisit: (visitId: string, adminNotes?: string) => Promise<void>;

  // Queue calls (legacy compatible)
  callNextPatient: () => void;
  skipCurrentPatient: () => void;
  holdCurrentPatient: () => void;
  completeCurrentPatient: () => void;

  sendWhatsApp: (reminderId: string) => void;
  selectedPatientForDetail: PatientRecord | null;
  setSelectedPatientForDetail: (patient: PatientRecord | null) => void;
  updatePatient: (patient: PatientRecord) => Promise<void>;
  addPatient: (patient: PatientRecord) => Promise<PatientRecord>;
  registerNewPatient: (data: {
    name: string;
    phone: string;
    gender: 'Male' | 'Female' | 'Other';
    dateOfBirth?: string;
    age?: number;
    secondaryPhone?: string;
    email?: string;
    address?: string;
    referralSource?: string;
    emergencyContact?: { name: string; phone: string; relation: string };
    assignedDoctorId?: string;
    assignedDoctorName?: string;
    reasonForVisit?: string;
    allowDuplicate?: boolean;
  }) => Promise<{ patient: PatientRecord; opNumber: string }>;

  updateDentalChartForVisit: (patientId: string, toothNumber: number, condition: ToothCondition, surfaces?: ToothSurfaceState) => void;
  updateChairStatus: (chairId: string, status: DentalChair['status']) => void;
  updateInventoryStock: (itemId: string, newStock: number) => void;
  userToken: string;
  setUserToken: (token: string) => void;
  latestCreatedAppointment: Appointment | null;
  setLatestCreatedAppointment: (apt: Appointment | null) => void;

  // Invoices & Payments Management
  invoices: Invoice[];
  payments: PaymentRecord[];
  prescriptions: PrescriptionRecord[];
  feeApprovals: FeeApprovalRecord[];
  auditEvents: AuditEvent[];
  recordPayment: (data: {
    invoiceId: string;
    amount: number;
    paymentMethod: PaymentMethod;
    referenceNumber?: string;
    notes?: string;
    receivedBy?: string;
    patientId?: string;
  }) => Promise<PaymentRecord>;
  createInvoice: (data: {
    patientId: string;
    patientName: string;
    doctorName: string;
    visitId?: string;
    items: { description: string; quantity: number; unitPrice: number }[];
    discount?: number;
    tax?: number;
    dueDate?: string;
    paymentMethod?: PaymentMethod;
    initialPaymentAmount?: number;
    referenceNumber?: string;
    notes?: string;
  }) => Promise<Invoice>;
  refreshState: () => Promise<void>;
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // Staff and User Credentials Management
  staffMembers: StaffUser[];
  addStaffMember: (data: Omit<StaffUser, 'id'>) => StaffUser;
  updateStaffMember: (id: string, updates: Partial<StaffUser>) => void;
  deleteStaffMember: (id: string) => void;

  // Clinical Follow-Up & Recall Management
  addFollowUp: (data: Omit<FollowUpRecord, 'id'>) => Promise<FollowUpRecord>;
  updateFollowUpStatus: (followUpId: string, status: FollowUpStatus, completedNotes?: string) => Promise<void>;
  rescheduleFollowUp: (followUpId: string, newDate: string, newTime?: string, reason?: string) => Promise<void>;
  sendFollowUpWhatsAppReminder: (followUpId: string, customMessage?: string) => Promise<void>;

  // Reception Queue to Doctor Cabin Handoff
  sentToDoctorTokens: string[];
  sendTokenToDoctor: (tokenNumber: string) => void;

  // First Visit Case Sheet Auto-Trigger
  shouldOpenCaseSheetOnProfile: boolean;
  setShouldOpenCaseSheetOnProfile: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const isDemoPatientOrToken = (nameOrToken?: string): boolean => {
  if (!nameOrToken) return false;
  const lower = nameOrToken.toLowerCase();
  return (
    lower.includes('ananya deshmukh') ||
    lower.includes('john doe') ||
    lower.includes('priya sharma') ||
    lower.includes('rahul kumar') ||
    lower.includes('vikram malhotra') ||
    lower.includes('ananya reddy')
  );
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // One-time purge of legacy mock tokens and demo entries from browser localStorage
  if (typeof window !== 'undefined' && !localStorage.getItem('smilecare_clean_db_v3')) {
    localStorage.removeItem('smilecare_tokens_list');
    localStorage.removeItem('smilecare_visits_list');
    localStorage.removeItem('smilecare_appointments_list');
    localStorage.removeItem('smilecare_invoices_list');
    localStorage.removeItem('smilecare_payments_list');
    localStorage.removeItem('smilecare_clean_db_v2'); // superseded
    try {
      const savedPatients = localStorage.getItem('smilecare_patients_list');
      if (savedPatients) {
        const parsed = JSON.parse(savedPatients);
        if (Array.isArray(parsed)) {
          const cleanPatients = parsed.filter((p: any) => !isDemoPatientOrToken(p.name));
          localStorage.setItem('smilecare_patients_list', JSON.stringify(cleanPatients));
        }
      }
    } catch { }
    localStorage.setItem('smilecare_clean_db_v3', 'true');
  }

  const [activeView, setActiveView] = useState<ViewMode>(() => {
    try {
      const saved = sessionStorage.getItem('smilecare_active_view');
      if (saved) return saved as ViewMode;
    } catch { }
    return 'landing';
  });

  useEffect(() => {
    if (activeView) {
      sessionStorage.setItem('smilecare_active_view', activeView);
    }
  }, [activeView]);
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    try {
      const saved = localStorage.getItem('smilecare_appointments_list');
      if (saved) {
        const parsed: Appointment[] = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed.filter((a) => !isDemoPatientOrToken(a.patientName));
      }
    } catch { }
    return [];
  });

  const [visits, setVisits] = useState<ClinicVisit[]>(() => {
    try {
      const saved = localStorage.getItem('smilecare_visits_list');
      if (saved) {
        const parsed: ClinicVisit[] = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed.filter((v) => !isDemoPatientOrToken(v.patientName));
      }
    } catch { }
    return [];
  });

  const [tokens, setTokens] = useState<QueueToken[]>(() => {
    try {
      const saved = localStorage.getItem('smilecare_tokens_list');
      if (saved) {
        const parsed: QueueToken[] = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed.filter((t) => !isDemoPatientOrToken(t.patientName));
      }
    } catch { }
    return [];
  });

  const [staffMembers, setStaffMembers] = useState<StaffUser[]>(() => {
    try {
      const saved = localStorage.getItem('smilecare_staff_members');
      if (saved) {
        const parsed: StaffUser[] = JSON.parse(saved);
        // Filter out legacy mock accounts and strip mock photo URL
        const cleaned = parsed
          .filter(
            (s) =>
              s.email !== 'doctor@clinic.com' &&
              s.email !== 'reception@clinic.com' &&
              s.email !== 'patient@clinic.com' &&
              s.email !== 'ananya.doc@demo.com' &&
              s.email !== 'vikram.doc@demo.com' &&
              s.name !== 'Dr. Priya Sharma' &&
              s.name !== 'Sunita Sharma' &&
              s.name !== 'Rahul Kumar' &&
              s.name !== 'Dr. Ananya Reddy' &&
              s.name !== 'Dr. Vikram Malhotra'
          )
          .map((s) => ({
            ...s,
            avatar: (s.avatar && (s.avatar.includes('photo-1559839734') || s.avatar.length > 50000)) ? '' : (s.avatar || '')
          }));
        if (cleaned.length > 0) {
          safeSetItem('smilecare_staff_members', JSON.stringify(cleaned));
          return cleaned;
        }
      }
    } catch { }
    return INITIAL_STAFF_MEMBERS;
  });

  const [doctors, setDoctors] = useState<Doctor[]>(() => {
    try {
      const saved = localStorage.getItem('smilecare_doctors_list');
      if (saved) {
        const parsed: Doctor[] = JSON.parse(saved);
        // Filter out legacy mock doctors and clean any mock unsplash photo or oversized data
        const cleaned = parsed
          .filter(
            (d) =>
              d.id !== 'doc-1' &&
              d.id !== 'doc-3' &&
              d.id !== 'doc-4' &&
              d.name !== 'Dr. Priya Sharma' &&
              d.name !== 'Dr. Ananya Reddy' &&
              d.name !== 'Dr. Vikram Malhotra'
          )
          .map((d) => ({
            ...d,
            avatar: (d.avatar && (d.avatar.includes('photo-1559839734') || d.avatar.length > 50000)) ? '' : (d.avatar || '')
          }));
        safeSetItem('smilecare_doctors_list', JSON.stringify(cleaned));
        return cleaned;
      }
    } catch { }
    return MOCK_DOCTORS;
  });
  const [services] = useState<Service[]>(MOCK_SERVICES);

  // Instantly hydrate patients from local cache on initial page load / refresh
  const [patients, setPatients] = useState<PatientRecord[]>(() => {
    try {
      const saved = localStorage.getItem('smilecare_patients_list');
      if (saved) {
        const parsed: PatientRecord[] = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter((p) => !isDemoPatientOrToken(p.name));
          if (cleaned.length > 0) return cleaned;
        }
      }
    } catch { }
    return [];
  });

  const [chairs, setChairs] = useState<DentalChair[]>(MOCK_CHAIRS);
  const [inventory, setInventory] = useState<InventoryItem[]>(MOCK_INVENTORY);

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    try {
      const saved = localStorage.getItem('smilecare_invoices_list');
      if (saved) {
        const parsed: Invoice[] = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed.filter((i) => !isDemoPatientOrToken(i.patientName));
      }
    } catch { }
    return [];
  });

  const [payments, setPayments] = useState<PaymentRecord[]>(() => {
    try {
      const saved = localStorage.getItem('smilecare_payments_list');
      if (saved) {
        const parsed: PaymentRecord[] = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed.filter((p) => !isDemoPatientOrToken(p.patientName));
      }
    } catch { }
    return [];
  });
  const [prescriptions, setPrescriptions] = useState<PrescriptionRecord[]>([]);
  const [feeApprovals, setFeeApprovals] = useState<FeeApprovalRecord[]>([]);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [userRole, setUserRole] = useState<UserRole>('admin');
  const [reminders, setReminders] = useState<WhatsAppReminder[]>(MOCK_WHATSAPP_REMINDERS);
  const [enquiries, setEnquiries] = useState<PatientEnquiry[]>(() => {
    try {
      const saved = localStorage.getItem('smilecare_enquiries_list');
      if (saved) return JSON.parse(saved);
    } catch { }
    return [];
  });
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [selectedPatientForDetail, setSelectedPatientForDetail] = useState<PatientRecord | null>(() => {
    try {
      const saved = sessionStorage.getItem('smilecare_selected_patient');
      if (saved) return JSON.parse(saved);
    } catch { }
    return null;
  });

  useEffect(() => {
    if (selectedPatientForDetail) {
      try {
        sessionStorage.setItem('smilecare_selected_patient', JSON.stringify(selectedPatientForDetail));
      } catch { }
    }
  }, [selectedPatientForDetail]);
  const [userToken, setUserToken] = useState<string>('A-024');
  const [latestCreatedAppointment, setLatestCreatedAppointment] = useState<Appointment | null>(null);

  // Reception Sent-To-Doctor Token Tracking
  const [sentToDoctorTokens, setSentToDoctorTokens] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('smilecare_sent_tokens');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch { }
    return [];
  });

  // First Visit Case Sheet Auto-Trigger State
  const [shouldOpenCaseSheetOnProfile, setShouldOpenCaseSheetOnProfile] = useState<boolean>(false);

  // Sidebar Open / Close Collapse State (persisted in localStorage)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('smilecare_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleSidebar = useCallback(() => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        safeSetItem('smilecare_sidebar_collapsed', String(next));
      } catch { }
      return next;
    });
  }, []);

  const setSidebarCollapsed = useCallback((collapsed: boolean) => {
    setIsSidebarCollapsed(collapsed);
    try {
      safeSetItem('smilecare_sidebar_collapsed', String(collapsed));
    } catch { }
  }, []);

  const addToast = useCallback((title: string, description?: string, type: ToastMessage['type'] = 'info') => {
    const id = 'toast-' + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, description, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Broadcast sync trigger
  const notifyCrossTabSync = () => {
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const channel = new BroadcastChannel('smilecare_sync');
        channel.postMessage('sync');
        channel.close();
      }
    } catch (e) {
      // Fallback
    }
  };

  // Synchronize state from Supabase Cloud (or local memory fallback)
  const refreshState = useCallback(async () => {
    // 1. Live Supabase database synchronization
    if (isSupabaseConfigured()) {
      try {
        // Fast concurrent background sync without blocking patient display
        const p1 = fetchPatientsFromDb().then((dbPatients) => {
          if (dbPatients) {
            setPatients(dbPatients);
            safeSetItem('smilecare_patients_list', JSON.stringify(dbPatients));
            setSelectedPatientForDetail((curr) => {
              if (!curr) return dbPatients[0] || null;
              const matched = dbPatients.find((p) => p.id === curr.id || p.opNumber === curr.opNumber);
              if (!matched) return dbPatients[0] || null;
              // Only replace reference if data actually changed — prevents unnecessary re-renders
              return isSamePatientRecord(curr, matched) ? curr : matched;
            });
          }
        }).catch((e) => console.warn('Patients background sync note:', e));

        const p2 = fetchAppointmentsFromDb().then((dbAppointments) => {
          if (dbAppointments) {
            setAppointments(dbAppointments);
            safeSetItem('smilecare_appointments_list', JSON.stringify(dbAppointments));
          }
        }).catch((e) => console.warn('Appointments background sync note:', e));

        const p3 = fetchTokensFromDb().then(async (dbTokens) => {
          let mergedTokens = (dbTokens || []).filter((t) => !isDemoPatientOrToken(t.patientName));
          const map = new Map();
          mergedTokens.forEach((t) => map.set(t.tokenNumber, t));

          try {
            // Include locally cached tokens (filtered)
            const savedLocal = localStorage.getItem('smilecare_tokens_list');
            if (savedLocal) {
              const parsedLocal: QueueToken[] = JSON.parse(savedLocal);
              if (Array.isArray(parsedLocal)) {
                parsedLocal
                  .filter((t) => !isDemoPatientOrToken(t.patientName))
                  .forEach((t) => {
                    if (!map.has(t.tokenNumber)) map.set(t.tokenNumber, t);
                  });
              }
            }
          } catch { }

          try {
            // Merge tokens from backend API
            const apiState = await apiClient.getState();
            if (apiState.tokens && apiState.tokens.length > 0) {
              apiState.tokens
                .filter((t) => !isDemoPatientOrToken(t.patientName))
                .forEach((t) => map.set(t.tokenNumber, t));
            }
          } catch { }

          mergedTokens = Array.from(map.values()).filter((t) => !isDemoPatientOrToken(t.patientName));

          setTokens(mergedTokens);
          safeSetItem('smilecare_tokens_list', JSON.stringify(mergedTokens));
        }).catch((e) => console.warn('Tokens background sync note:', e));

        const p4 = fetchInvoicesFromDb().then((dbInvoices) => {
          if (dbInvoices) {
            setInvoices(dbInvoices);
            safeSetItem('smilecare_invoices_list', JSON.stringify(dbInvoices));
          }
        }).catch((e) => console.warn('Invoices background sync note:', e));

        const p5 = fetchPaymentsFromDb().then((dbPayments) => {
          if (dbPayments) {
            setPayments(dbPayments);
            safeSetItem('smilecare_payments_list', JSON.stringify(dbPayments));
          }
        }).catch((e) => console.warn('Payments background sync note:', e));

        const p6 = fetchChairsFromDb().then((dbChairs) => {
          if (dbChairs && dbChairs.length > 0) setChairs(dbChairs);
        }).catch((e) => console.warn('Chairs background sync note:', e));

        const p7 = fetchProfilesFromDb().then((dbProfiles) => {
          if (dbProfiles && dbProfiles.length > 0) {
            const mappedStaff: StaffUser[] = dbProfiles.map((p) => ({
              id: p.id,
              name: p.name,
              email: p.email,
              password: p.password || 'Password@123',
              role: p.role as UserRole,
              phone: p.phone,
              specialization: p.specialization,
              qualification: p.qualification,
              roomNumber: p.roomNumber,
              status: (p.status as any) || 'Active',
              createdAt: p.createdAt ? p.createdAt.split('T')[0] : '2026-01-01',
              avatar: p.avatar && !p.avatar.includes('photo-1559839734') ? p.avatar : ''
            }));
            setStaffMembers(mappedStaff);
            try {
              safeSetItem('smilecare_staff_members', JSON.stringify(mappedStaff));
            } catch { }

            // Synchronize doctors from database profiles
            const realDoctors: Doctor[] = mappedStaff
              .filter((s) => s.role === 'doctor')
              .map((s) => ({
                id: s.id,
                name: s.name.startsWith('Dr.') ? s.name : `Dr. ${s.name}`,
                title: s.qualification || 'Dental Surgeon',
                qualification: s.qualification || 'BDS',
                specialization: s.specialization || 'General Dentistry',
                experience: '5+ Years',
                rating: 5.0,
                reviewsCount: 0,
                avatar: s.avatar && !s.avatar.includes('photo-1559839734') ? s.avatar : '',
                availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'],
                bio: `${s.name} is specialized in ${s.specialization || 'dental care'}.`,
                roomNumber: s.roomNumber || 'Cabin 101'
              }));
            setDoctors(realDoctors);
            try {
              safeSetItem('smilecare_doctors_list', JSON.stringify(realDoctors));
            } catch { }
          }
        }).catch((e) => console.warn('Profiles background sync note:', e));

        await Promise.allSettled([p1, p2, p3, p4, p5, p6, p7]);
      } catch (err) {
        console.warn('Supabase state fetch error, falling back to local cache:', err);
      }
    }

    // 2. Synchronize authoritative visits, fee approvals, invoices, payments, and patients from backend API
    try {
      const data = await apiClient.getState();
      if (data.visits && data.visits.length > 0) {
        setVisits((prev) => {
          const map = new Map<string, ClinicVisit>();
          (data.visits || []).forEach((v) => map.set(v.id, v));
          (prev || []).forEach((v) => { if (!map.has(v.id)) map.set(v.id, v); });
          return Array.from(map.values());
        });
      }
      if (data.feeApprovals) setFeeApprovals(data.feeApprovals);
      if (data.invoices && data.invoices.length > 0) {
        setInvoices((prev) => {
          const map = new Map<string, Invoice>();
          (prev || []).forEach((i) => map.set(i.id, i));
          (data.invoices || []).forEach((i) => map.set(i.id, i));
          return Array.from(map.values());
        });
      }
      if (data.payments && data.payments.length > 0) {
        setPayments((prev) => {
          const map = new Map<string, PaymentRecord>();
          (prev || []).forEach((p) => map.set(p.id, p));
          (data.payments || []).forEach((p) => map.set(p.id, p));
          return Array.from(map.values());
        });
      }
      if (data.prescriptions) setPrescriptions(data.prescriptions);
      if (data.auditEvents) setAuditEvents(data.auditEvents);

      if (data.enquiries && Array.isArray(data.enquiries)) {
        setEnquiries((prev) => {
          const map = new Map<string, PatientEnquiry>();
          data.enquiries!.forEach((e) => map.set(e.id, e));
          (prev || []).forEach((e) => {
            if (!map.has(e.id)) map.set(e.id, e);
          });
          const merged = Array.from(map.values()).sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          safeSetItem('smilecare_enquiries_list', JSON.stringify(merged));
          return merged;
        });
      }

      if (data.patients && data.patients.length > 0) {
        setPatients((prev) => {
          if (!prev || prev.length === 0) return data.patients;
          return prev.map((p) => {
            const apiP = data.patients.find((ap) => ap.id === p.id || ap.opNumber === p.opNumber);
            if (apiP) {
              const mergedInvoices = (apiP.invoices && apiP.invoices.length > 0) ? apiP.invoices : (p.invoices || []);
              const totalInvBalance = mergedInvoices.reduce((sum, inv) => sum + (inv.balance || 0), 0);
              return {
                ...p,
                invoices: mergedInvoices,
                outstandingBalance: Math.max(apiP.outstandingBalance || 0, totalInvBalance, p.outstandingBalance || 0),
                visits: (apiP.visits && apiP.visits.length > 0) ? apiP.visits : (p.visits || []),
                medicalHistory: { ...p.medicalHistory, ...(apiP.medicalHistory || {}) }
              };
            }
            return p;
          });
        });
      }

      // Keep selected patient in sync with latest version (only if data actually changed)
      setSelectedPatientForDetail((curr) => {
        if (!curr) return (data.patients && data.patients[0]) || null;
        const matched = (data.patients || []).find((p) => p.id === curr.id || p.opNumber === curr.opNumber);
        if (!matched) return curr;
        return isSamePatientRecord(curr, matched) ? curr : matched;
      });
    } catch (err) {
      // Local memory mode
    }
  }, []);

  // Sync on mount, listen on Supabase Realtime channel, BroadcastChannel, and fallback polling
  useEffect(() => {
    refreshState();

    // Supabase Realtime channel subscription
    let realtimeChannel: any = null;
    if (isSupabaseConfigured()) {
      try {
        realtimeChannel = supabase
          .channel('realtime:clinic_operations')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'tokens' }, () => refreshState())
          .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => refreshState())
          .on('postgres_changes', { event: '*', schema: 'public', table: 'patients' }, () => refreshState())
          .on('postgres_changes', { event: '*', schema: 'public', table: 'invoices' }, () => refreshState())
          .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, () => refreshState())
          .on('postgres_changes', { event: '*', schema: 'public', table: 'dental_chairs' }, () => refreshState())
          .subscribe();
      } catch (e) {
        console.warn('Realtime subscription error:', e);
      }
    }

    let channel: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        channel = new BroadcastChannel('smilecare_sync');
        channel.onmessage = (msg) => {
          if (msg.data === 'sync') {
            refreshState();
          }
        };
      } catch (e) {
        // Fallback
      }
    }

    // Realtime background sync for enquiries, tokens, appointments, and visits (every 8 seconds)
    const interval = setInterval(() => {
      refreshState();
    }, 8000);

    return () => {
      if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel);
      }
      if (channel) channel.close();
      clearInterval(interval);
    };
  }, [refreshState]);

  // Keep patients local cache updated for 0ms instantaneous display on refresh
  useEffect(() => {
    if (patients && patients.length > 0) {
      safeSetItem('smilecare_patients_list', JSON.stringify(patients));
    }
  }, [patients]);

  // Keep tokens local cache updated
  useEffect(() => {
    if (tokens && tokens.length > 0) {
      safeSetItem('smilecare_tokens_list', JSON.stringify(tokens));
    }
  }, [tokens]);

  const updatePatient = async (updated: PatientRecord): Promise<void> => {
    // Optimistic local update
    setPatients((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    if (selectedPatientForDetail && selectedPatientForDetail.id === updated.id) {
      setSelectedPatientForDetail(updated);
    }

    try {
      await savePatientToDb(updated);
      try {
        await apiClient.updatePatient(updated.id, updated);
      } catch { }
      notifyCrossTabSync();
      addToast('Patient Record Saved', `Updated medical & dental chart for ${updated.name}.`, 'success');
    } catch (err: any) {
      console.error('Failed to save patient to database:', err);
      addToast('Saved Locally', `Record updated in current session.`, 'warning');
    }
  };

  const registerNewPatient = async (data: {
    name: string;
    phone: string;
    gender: 'Male' | 'Female' | 'Other';
    dateOfBirth?: string;
    age?: number;
    secondaryPhone?: string;
    email?: string;
    address?: string;
    referralSource?: string;
    emergencyContact?: { name: string; phone: string; relation: string };
    assignedDoctorId?: string;
    assignedDoctorName?: string;
    reasonForVisit?: string;
    allowDuplicate?: boolean;
  }): Promise<{ patient: PatientRecord; opNumber: string }> => {
    let resultPatient: PatientRecord;
    let opNumber: string;

    try {
      const result = await apiClient.registerPatient(data);
      resultPatient = result.patient;
      opNumber = result.opNumber;
    } catch (e) {
      // Direct local/Supabase creation
      const count = patients.length + 101;
      const genId = `PAT-2026-${String(count).padStart(6, '0')}`;
      opNumber = `OP-2026-${String(count).padStart(5, '0')}`;
      resultPatient = {
        id: genId,
        opNumber,
        name: data.name,
        phone: data.phone,
        secondaryPhone: data.secondaryPhone,
        email: data.email,
        age: data.age || 25,
        gender: data.gender,
        dateOfBirth: data.dateOfBirth,
        address: data.address,
        referralSource: data.referralSource,
        emergencyContact: data.emergencyContact || { name: '', phone: '', relation: '' },
        assignedDoctorId: data.assignedDoctorId,
        assignedDoctorName: data.assignedDoctorName,
        firstVisitDate: new Date().toISOString().split('T')[0],
        lastVisit: new Date().toISOString().split('T')[0],
        totalVisits: 1,
        currentTreatment: data.reasonForVisit || 'General Consultation',
        status: 'New Patient',
        outstandingBalance: 0,
        medicalHistory: {
          allergies: [],
          conditions: [],
          hasDiabetes: false,
          hasBloodPressure: false,
          hasHeartConditions: false,
          currentMedications: [],
          previousSurgeries: [],
          otherNotes: ''
        },
        dentalHistory: {
          currentComplaint: data.reasonForVisit
        },
        dentalChart: createFullDefaultDentalChart(),
        clinicalNotes: [],
        treatmentPlans: [],
        allergies: [],
        visits: []
      };
    }

    await savePatientToDb(resultPatient);
    setPatients((prev) => [resultPatient, ...prev.filter((p) => p.id !== resultPatient.id)]);
    setSelectedPatientForDetail(resultPatient);
    notifyCrossTabSync();
    addToast('New Patient Registered! 🎉', `${resultPatient.name} (${opNumber}) registered successfully.`, 'success');
    return { patient: resultPatient, opNumber };
  };

  const addPatient = async (newPat: PatientRecord): Promise<PatientRecord> => {
    try {
      await savePatientToDb(newPat);
      apiClient.registerPatient({
        name: newPat.name,
        phone: newPat.phone,
        gender: newPat.gender,
        dateOfBirth: newPat.dateOfBirth,
        age: newPat.age,
        secondaryPhone: newPat.secondaryPhone,
        email: newPat.email,
        address: newPat.address,
        referralSource: newPat.referralSource,
        emergencyContact: newPat.emergencyContact,
        assignedDoctorId: newPat.assignedDoctorId,
        assignedDoctorName: newPat.assignedDoctorName,
        reasonForVisit: newPat.currentTreatment,
        allowDuplicate: true
      }).catch(() => { });

      setPatients((prev) => [newPat, ...prev.filter((p) => p.id !== newPat.id)]);
      setSelectedPatientForDetail(newPat);
      notifyCrossTabSync();
      addToast('Patient Registered', `${newPat.name} saved to Supabase database.`, 'success');
      return newPat;
    } catch (err: any) {
      setPatients((prev) => [newPat, ...prev]);
      setSelectedPatientForDetail(newPat);
      addToast('Registered Locally', `${newPat.name} saved in current session.`, 'info');
      return newPat;
    }
  };

  const updateChairStatus = (chairId: string, status: DentalChair['status']) => {
    setChairs((prev) =>
      prev.map((c) => {
        if (c.id === chairId) {
          const updated = { ...c, status };
          saveChairToDb(updated).catch(() => { });
          return updated;
        }
        return c;
      })
    );
    addToast('Chair Status Updated', `Chair status set to ${status}.`, 'info');
  };

  const updateInventoryStock = (itemId: string, newStock: number) => {
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const alertStatus = newStock <= 0 ? 'Expired' : newStock <= item.minStock ? 'Low Stock' : 'Normal';
          return { ...item, stock: newStock, alertStatus };
        }
        return item;
      })
    );
    addToast('Inventory Stock Updated', 'Item quantity and stock alerts adjusted.', 'success');
  };

  // BOOK APPOINTMENT: Booking ≠ Arrival. No Token generated!
  const addAppointment = async (data: {
    patientName: string;
    patientPhone: string;
    patientEmail?: string;
    patientAge?: number;
    patientGender?: 'Male' | 'Female' | 'Other';
    doctorId: string;
    date: string;
    timeSlot: string;
    reasonForVisit: string;
    amount?: number;
  }): Promise<Appointment> => {
    const doc = doctors.find((d) => d.id === data.doctorId) || doctors[0];
    const generatedAptId = `APT-2026-${Math.floor(100000 + Math.random() * 900000)}`;

    let patient = patients.find(
      (p) => p.phone === data.patientPhone || p.name.toLowerCase() === data.patientName.toLowerCase()
    );

    let patientId = patient?.id;
    if (!patient) {
      try {
        const regResult = await registerNewPatient({
          name: data.patientName,
          phone: data.patientPhone,
          gender: data.patientGender || 'Other',
          age: data.patientAge,
          email: data.patientEmail,
          assignedDoctorId: data.doctorId,
          assignedDoctorName: doc.name,
          reasonForVisit: data.reasonForVisit
        });
        patientId = regResult.patient.id;
      } catch (e) {
        patientId = `PAT-2026-${Math.floor(100000 + Math.random() * 900000)}`;
      }
    }

    const newApt: Appointment = {
      id: generatedAptId,
      patientId,
      tokenId: undefined, // NO TOKEN GENERATED ON BOOKING
      patientName: data.patientName,
      patientPhone: data.patientPhone,
      patientEmail: data.patientEmail || '',
      patientAge: data.patientAge || 30,
      patientGender: data.patientGender || 'Other',
      doctorId: doc.id,
      doctorName: doc.name,
      doctorSpecialty: doc.specialization,
      date: data.date,
      timeSlot: data.timeSlot,
      reasonForVisit: data.reasonForVisit,
      appointmentStatus: 'CONFIRMED',
      status: 'Confirmed',
      createdAt: new Date().toISOString(),
      amount: data.amount || 300
    };

    setAppointments((prev) => [...prev, newApt]);
    setLatestCreatedAppointment(newApt);
    await saveAppointmentToDb(newApt);

    // WhatsApp Reminder
    const newReminder: WhatsAppReminder = {
      id: `wa-${Date.now()}`,
      patientName: data.patientName,
      phone: data.patientPhone,
      appointmentDate: data.date,
      appointmentTime: data.timeSlot,
      doctorName: doc.name,
      type: 'Confirmation',
      status: 'Scheduled',
      scheduledFor: 'Immediate',
      messageText: `Hello ${data.patientName}! Your appointment with ${doc.name} at Shriya Multispeciality Dental Clinic is confirmed for ${data.date} at ${data.timeSlot}. Please arrive at the reception desk to complete arrival check-in.`
    };
    setReminders((prev) => [newReminder, ...prev]);

    notifyCrossTabSync();
    addToast('Appointment Confirmed!', `Booking ID: ${newApt.id}. Token will be generated upon arrival.`, 'success');
    return newApt;
  };

  const updateAppointmentStatus = (id: string, status: TokenStatus) => {
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === id ? { ...apt, status } : apt))
    );
    const target = appointments.find((a) => a.id === id);
    if (target) {
      addToast('Status Updated', `Appointment ${target.id} (${target.patientName}) is now ${status}.`, 'info');
    }
  };

  const markNoShow = (appointmentId: string) => {
    setAppointments((prev) =>
      prev.map((a) =>
        a.id === appointmentId ? { ...a, appointmentStatus: 'NO_SHOW', status: 'Cancelled' } : a
      )
    );
    apiClient.cancelAppointment(appointmentId, 'Marked as No-Show by reception desk').catch(() => { });
    notifyCrossTabSync();
    addToast('Marked No-Show', `Appointment ${appointmentId} marked as No-Show. No token was issued.`, 'warning');
  };

  const rescheduleAppointment = async (appointmentId: string, newDate: string, newTimeSlot: string, reason?: string): Promise<void> => {
    setAppointments((prev) =>
      prev.map((a) =>
        a.id === appointmentId
          ? {
            ...a,
            date: newDate,
            timeSlot: newTimeSlot,
            appointmentStatus: 'RESCHEDULED',
            status: 'Confirmed'
          }
          : a
      )
    );
    try {
      await apiClient.rescheduleAppointment(appointmentId, newDate, newTimeSlot, reason);
      notifyCrossTabSync();
    } catch (e) {
      console.warn('Reschedule API sync warning:', e);
    }
    addToast('Appointment Rescheduled', `Rescheduled to ${newDate} at ${newTimeSlot}.`, 'success');
  };

  const cancelAppointment = async (appointmentId: string, reason?: string): Promise<void> => {
    setAppointments((prev) =>
      prev.map((a) =>
        a.id === appointmentId
          ? { ...a, appointmentStatus: 'CANCELLED', status: 'Cancelled' }
          : a
      )
    );
    try {
      await apiClient.cancelAppointment(appointmentId, reason);
      notifyCrossTabSync();
    } catch (e) {
      console.warn('Cancel API sync warning:', e);
    }
    addToast('Appointment Cancelled', `Appointment ${appointmentId} was cancelled.`, 'warning');
  };

  // PATIENT ENQUIRIES (Public Website -> Reception Desk)
  const addEnquiry = async (data: {
    patientName: string;
    phone: string;
    email?: string;
    preferredDate?: string;
    preferredTimeWindow?: string;
    chiefComplaint: string;
    preferredDoctorId?: string;
    preferredDoctorName?: string;
    notes?: string;
  }): Promise<PatientEnquiry> => {
    const newEnquiry: PatientEnquiry = {
      id: `ENQ-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
      patientName: data.patientName.trim(),
      phone: data.phone.trim(),
      email: data.email?.trim() || '',
      preferredDate: data.preferredDate || new Date().toISOString().split('T')[0],
      preferredTimeWindow: data.preferredTimeWindow || 'Morning (09:30 AM - 01:00 PM)',
      chiefComplaint: data.chiefComplaint.trim(),
      preferredDoctorId: data.preferredDoctorId,
      preferredDoctorName: data.preferredDoctorName || 'Any Available Dental Specialist',
      notes: data.notes?.trim() || '',
      status: 'New',
      createdAt: new Date().toISOString()
    };

    setEnquiries((prev) => {
      const updated = [newEnquiry, ...prev];
      safeSetItem('smilecare_enquiries_list', JSON.stringify(updated));
      return updated;
    });

    // Also persist to backend JSON database asynchronously
    fetch('/api/enquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((serverEnquiry) => {
        if (serverEnquiry && serverEnquiry.id) {
          setEnquiries((prev) => {
            const mapped = prev.map((e) => (e.id === newEnquiry.id ? serverEnquiry : e));
            safeSetItem('smilecare_enquiries_list', JSON.stringify(mapped));
            return mapped;
          });
        }
      })
      .catch(() => { });

    notifyCrossTabSync();
    addToast('Enquiry Received! 📋', `Thank you ${newEnquiry.patientName}. Our reception team will contact you shortly.`, 'success');
    return newEnquiry;
  };

  const updateEnquiryStatus = (id: string, status: PatientEnquiry['status']) => {
    setEnquiries((prev) => {
      const updated = prev.map((e) => (e.id === id ? { ...e, status } : e));
      safeSetItem('smilecare_enquiries_list', JSON.stringify(updated));
      return updated;
    });

    // Also update backend JSON database asynchronously
    fetch(`/api/enquiries/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    }).catch(() => { });

    notifyCrossTabSync();
  };

  const sendAppointmentWhatsApp = (appointment: Appointment, customNote?: string) => {
    const cleanPhone = (appointment.patientPhone || '').replace(/[^0-9]/g, '');
    const phoneWithCountry = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

    const message =
      `Hello *${appointment.patientName}*,%0A%0A` +
      `Greetings from *Shriya Multispeciality Dental Clinic*! 🦷%0A%0A` +
      `Your dental appointment has been scheduled with our doctor:%0A` +
      `👨‍⚕️ *Doctor:* ${appointment.doctorName}%0A` +
      `📅 *Date:* ${appointment.date}%0A` +
      `⏰ *Time Slot:* ${appointment.timeSlot}%0A` +
      (appointment.reasonForVisit ? `🩺 *Reason:* ${appointment.reasonForVisit}%0A` : '') +
      (customNote ? `📝 *Note from Clinic:* ${customNote}%0A` : '') +
      `📍 *Location:* Pollachi Road, Kozhinjapara, Palakkad%0A` +
      `📞 *Helpdesk:* +91 9400320890, 7904221656%0A%0A` +
      `Kindly arrive 10 minutes prior to your time slot. If you need to reschedule, please reply to this message.%0A%0A` +
      `Keep smiling! ✨`;

    if (typeof window !== 'undefined') {
      window.open(`https://wa.me/${phoneWithCountry}?text=${message}`, '_blank');
      addToast('WhatsApp Launched 💬', `Opening WhatsApp for ${appointment.patientName}...`, 'info');
    }
  };

  // PATIENT ARRIVAL / CHECK-IN
  const checkInPatient = async (data: {
    appointmentId?: string;
    patientId: string;
    doctorId: string;
    chairId?: string;
    priority?: 'Normal' | 'Urgent' | 'Emergency';
    reasonForVisit: string;
    isWalkIn?: boolean;
  }): Promise<{ visit: ClinicVisit; token: QueueToken }> => {
    try {
      const result = await apiClient.checkInPatient(data);
      setVisits((prev) => [result.visit, ...prev.filter((v) => v.id !== result.visit.id)]);
      setTokens((prev) => [...prev.filter((t) => t.id !== result.token.id), result.token]);
      setUserToken(result.token.tokenNumber);

      if (data.appointmentId) {
        setAppointments((prev) =>
          prev.map((a) =>
            a.id === data.appointmentId
              ? { ...a, tokenId: result.token.tokenNumber, visitId: result.visit.id, status: 'Waiting' }
              : a
          )
        );
      }

      saveTokenToDb(result.token).catch(() => { });
      notifyCrossTabSync();
      addToast('Patient Arrival Confirmed! 🎟️', `Token ${result.token.tokenNumber} issued for ${result.visit.patientName}.`, 'success');
      return result;
    } catch (err: any) {
      if (err?.activeToken) {
        setTokens((prev) => {
          const next = [...prev.filter((t) => t.id !== err.activeToken.id && t.tokenNumber !== err.activeToken.tokenNumber), err.activeToken];
          safeSetItem('smilecare_tokens_list', JSON.stringify(next));
          return next;
        });
      }
      addToast('Check-In Notice', err.message || 'Unable to check in patient.', 'danger');
      throw err;
    }
  };

  // WALK-IN PATIENT
  const createWalkInPatient = async (data: {
    patientName: string;
    patientPhone: string;
    patientAge?: number;
    patientGender?: 'Male' | 'Female' | 'Other';
    doctorId: string;
    reasonForVisit: string;
    priority?: 'Normal' | 'Urgent' | 'Emergency';
    chairId?: string;
  }): Promise<{ visit: ClinicVisit; token: QueueToken }> => {
    let patient = patients.find(
      (p) => p.phone === data.patientPhone || p.name.toLowerCase() === data.patientName.toLowerCase()
    );

    let patientId = patient?.id;
    if (!patient) {
      try {
        const reg = await registerNewPatient({
          name: data.patientName,
          phone: data.patientPhone,
          age: data.patientAge,
          gender: data.patientGender || 'Other',
          assignedDoctorId: data.doctorId,
          reasonForVisit: data.reasonForVisit
        });
        patientId = reg.patient.id;
      } catch (e: any) {
        if (e.existingPatient) {
          patientId = e.existingPatient.id;
        } else {
          patientId = `PAT-2026-${Math.floor(100000 + Math.random() * 900000)}`;
        }
      }
    }

    return checkInPatient({
      patientId: patientId!,
      doctorId: data.doctorId,
      priority: data.priority || 'Normal',
      reasonForVisit: data.reasonForVisit,
      chairId: data.chairId,
      isWalkIn: true
    });
  };

  // CALL TOKEN (Waiting -> Called)
  const callToken = async (tokenNumberOrId: string, assignedChairId?: string): Promise<void> => {
    const targetChair = assignedChairId
      ? chairs.find((c) => c.id === assignedChairId)
      : chairs.find((c) => c.status === 'Available') || chairs[1];

    try {
      const result = await apiClient.callToken(tokenNumberOrId, targetChair?.id, targetChair?.name);
      setTokens((prev) =>
        prev.map((t) => (t.tokenNumber === tokenNumberOrId || t.id === tokenNumberOrId ? result.token : t))
      );
      if (result.visit) {
        setVisits((prev) =>
          prev.map((v) => (v.id === result.visit!.id ? result.visit! : v))
        );
      }

      // Update chair
      if (targetChair) {
        setChairs((prev) =>
          prev.map((c) =>
            c.id === targetChair.id
              ? {
                ...c,
                status: 'Occupied',
                currentPatientName: result.token.patientName,
                currentToken: result.token.tokenNumber
              }
              : c
          )
        );
      }

      notifyCrossTabSync();
      addToast(`Calling Token ${tokenNumberOrId} 🔔`, `Please proceed to doctor's consulting room.`, 'info');
    } catch (err: any) {
      addToast('Error', err.message || 'Failed to call token', 'danger');
    }
  };

  // SEND TOKEN TO DOCTOR (Reception handoff: direct waiting patient to doctor's cabin)
  const sendTokenToDoctor = (tokenNumber: string) => {
    setSentToDoctorTokens((prev) => {
      const next = Array.from(new Set([...prev, tokenNumber]));
      safeSetItem('smilecare_sent_tokens', JSON.stringify(next));
      return next;
    });

    const tok = tokens.find((t) => t.tokenNumber === tokenNumber);
    const doc = doctors.find((d) => d.id === tok?.doctorId);
    const docName = doc?.name || tok?.doctorName || 'Doctor';
    addToast(
      'Sent to Doctor Cabin 🩺',
      `Patient ${tok?.patientName || 'Patient'} (Token: ${tokenNumber}) directed to Dr. ${docName}'s consultation cabin.`,
      'success'
    );
  };

  // START CONSULTATION (Called -> In Consultation)
  const startConsultation = async (visitIdOrToken: string): Promise<void> => {
    try {
      const result = await apiClient.startConsultation(visitIdOrToken);
      setVisits((prev) =>
        prev.map((v) => (v.id === result.visit.id ? result.visit : v))
      );
      if (result.token) {
        setTokens((prev) =>
          prev.map((t) => (t.id === result.token!.id ? result.token! : t))
        );
      }

      const pat = patients.find((p) => p.id === result.visit.patientId);
      if (pat) {
        setSelectedPatientForDetail(pat);
      }

      notifyCrossTabSync();
      addToast('Consultation Started 🩺', `Doctor is examining patient in consultation suite.`, 'success');
    } catch (err: any) {
      addToast('Error', err.message || 'Failed to start consultation', 'danger');
    }
  };

  // COMPLETE CONSULTATION (Transitions to Reception Follow-up!)
  const completeConsultation = async (
    visitIdOrToken: string,
    summary?: {
      notes?: string;
      diagnosis?: string;
      clinicalFindings?: string;
      treatmentPlan?: string;
      followUpDate?: string;
      followUpReason?: string;
    }
  ): Promise<void> => {
    try {
      const result = await apiClient.completeConsultation({
        visitId: visitIdOrToken,
        chiefComplaint: summary?.notes,
        diagnosis: summary?.diagnosis || 'Clinical Dental Evaluation Completed',
        clinicalFindings: summary?.clinicalFindings || 'Examination complete.',
        treatmentPerformed: summary?.treatmentPlan || 'Consultation & Procedure Completed',
        doctorNotes: summary?.notes || '',
        followUpDate: summary?.followUpDate,
        followUpReason: summary?.followUpReason
      });

      setVisits((prev) =>
        prev.map((v) => (v.id === result.visit.id ? result.visit : v))
      );
      if (result.token) {
        setTokens((prev) =>
          prev.map((t) => (t.id === result.token!.id ? result.token! : t))
        );
      }

      // Free chair
      setChairs((prev) =>
        prev.map((c) =>
          c.currentToken === visitIdOrToken || (result.token && c.currentToken === result.token.tokenNumber)
            ? { ...c, status: 'Available', currentPatientName: undefined, currentToken: undefined }
            : c
        )
      );

      // Refresh patients list to include updated clinical notes and followups
      await refreshState();
      notifyCrossTabSync();
      addToast('Consultation Finalized! ✓', 'Patient transferred to Reception Desk for payment and checkout.', 'success');
    } catch (err: any) {
      addToast('Consultation Notice', err.message || 'Failed to complete consultation.', 'danger');
      throw err;
    }
  };

  // DOCTOR APPROVES FEE & DISCOUNT
  const approveFee = async (data: {
    visitId: string;
    patientId?: string;
    patientName?: string;
    patientOpNumber?: string;
    doctorId?: string;
    doctorName?: string;
    consultationFee: number;
    items: Array<{ description: string; quantity: number; unitPrice: number }>;
    discountType?: 'amount' | 'percentage';
    discountValue?: number;
    discountReason?: string;
    taxRate?: number;
  }): Promise<{ feeApproval: FeeApprovalRecord; invoice: Invoice; visit?: ClinicVisit }> => {
    try {
      const result = await apiClient.approveFee(data);
      setFeeApprovals((prev) => [result.feeApproval, ...prev]);
      setInvoices((prev) => [result.invoice, ...prev.filter((i) => i.id !== result.invoice.id)]);
      if (result.visit) {
        setVisits((prev) => [result.visit!, ...prev.filter((v) => v.id !== result.visit!.id)]);
      }

      // Update patient invoices in local state
      setPatients((prev) =>
        prev.map((p) => {
          if (p.id === result.invoice.patientId) {
            const updatedInvoices = [result.invoice, ...(p.invoices || []).filter((i) => i.id !== result.invoice.id)];
            return {
              ...p,
              invoices: updatedInvoices,
              outstandingBalance: updatedInvoices.reduce((sum, inv) => sum + inv.balance, 0),
              visits: result.visit ? [result.visit, ...(p.visits || []).filter((v) => v.id !== result.visit!.id)] : p.visits
            };
          }
          return p;
        })
      );

      notifyCrossTabSync();
      // Persist invoice to Supabase so it survives page reload
      saveInvoiceToDb(result.invoice).catch(() => { });
      addToast('Fees Approved & Invoiced 📄', `Doctor approved ₹${result.invoice.total} for ${result.invoice.patientName}.`, 'success');
      return result;
    } catch (err: any) {
      addToast('Approval Error', err.message || 'Failed to approve fees.', 'danger');
      throw err;
    }
  };

  // CREATE DIGITAL PRESCRIPTION
  const createPrescription = async (data: {
    visitId: string;
    patientId: string;
    items: Array<{
      medicine: string;
      dosage: string;
      route?: string;
      frequency: string;
      duration: string;
      instructions: string;
    }>;
    diagnosis?: string;
    doctorNotes?: string;
    followUpDate?: string;
  }): Promise<{ prescription: PrescriptionRecord; visit?: ClinicVisit }> => {
    try {
      const result = await apiClient.createPrescription(data);
      setPrescriptions((prev) => [result.prescription, ...prev]);
      if (result.visit) {
        setVisits((prev) => [result.visit!, ...prev.filter((v) => v.id !== result.visit!.id)]);
      }

      // Update patient in state
      setPatients((prev) =>
        prev.map((p) =>
          p.id === data.patientId
            ? {
                ...p,
                prescriptions: [result.prescription, ...(p.prescriptions || [])],
                visits: result.visit ? [result.visit, ...(p.visits || []).filter((v) => v.id !== result.visit!.id)] : p.visits
              }
            : p
        )
      );

      notifyCrossTabSync();
      addToast('Prescription Saved 💊', `Digital Rx ${result.prescription.id} generated. Ready to print.`, 'success');
      return result;
    } catch (err: any) {
      addToast('Prescription Error', err.message || 'Failed to create prescription.', 'danger');
      throw err;
    }
  };

  // RECEPTIONIST CLOSES VISIT (CHECKOUT)
  const closeVisit = async (visitId: string, adminNotes?: string): Promise<void> => {
    try {
      const result = await apiClient.closeVisit(visitId, adminNotes);
      setVisits((prev) =>
        prev.map((v) => (v.id === result.visit.id ? result.visit : v))
      );
      if (result.token) {
        setTokens((prev) =>
          prev.map((t) => (t.id === result.token!.id ? result.token! : t))
        );
      }
      notifyCrossTabSync();
      addToast('Checkout Complete! 👋', `Encounter closed for ${result.visit.patientName}.`, 'success');
    } catch (err: any) {
      addToast('Error', err.message || 'Failed to close visit.', 'danger');
      throw err;
    }
  };

  const holdToken = async (tokenNumberOrId: string): Promise<void> => {
    try {
      const result = await apiClient.holdToken(tokenNumberOrId);
      setTokens((prev) =>
        prev.map((t) => (t.id === result.token.id || t.tokenNumber === tokenNumberOrId ? result.token : t))
      );
      notifyCrossTabSync();
      addToast('Token Placed on Hold', `Token ${tokenNumberOrId} placed on hold.`, 'warning');
    } catch (err: any) {
      addToast('Error', err.message || 'Failed to hold token', 'danger');
    }
  };

  const skipToken = async (tokenNumberOrId: string, reason?: string): Promise<void> => {
    try {
      const result = await apiClient.skipToken(tokenNumberOrId, reason);
      setTokens((prev) =>
        prev.map((t) => (t.id === result.token.id || t.tokenNumber === tokenNumberOrId ? result.token : t))
      );
      notifyCrossTabSync();
      addToast('Token Skipped', `Token ${tokenNumberOrId} was skipped.`, 'warning');
    } catch (err: any) {
      addToast('Error', err.message || 'Failed to skip token', 'danger');
    }
  };

  // Legacy queue call methods
  const callNextPatient = () => {
    const nextWaiting = tokens.find((t) => t.status === 'Waiting');
    if (!nextWaiting) {
      addToast('Queue Cleared', 'There are no waiting patients in queue.', 'warning');
      return;
    }
    callToken(nextWaiting.tokenNumber);
  };

  const skipCurrentPatient = () => {
    const current = tokens.find((t) => t.status === 'In Consultation');
    if (current) {
      skipToken(current.tokenNumber);
    } else {
      addToast('No Patient in Room', 'Select or call a waiting patient first.', 'warning');
    }
  };

  const holdCurrentPatient = () => {
    const current = tokens.find((t) => t.status === 'In Consultation');
    if (current) {
      holdToken(current.tokenNumber);
    } else {
      addToast('No Patient in Room', 'Select or call a waiting patient first.', 'warning');
    }
  };

  const completeCurrentPatient = () => {
    const current = tokens.find((t) => t.status === 'In Consultation');
    if (current) {
      completeConsultation(current.visitId || current.tokenNumber);
    } else {
      addToast('No Active Consultation', 'No patient is currently in consultation.', 'warning');
    }
  };

  const updateDentalChartForVisit = (
    patientId: string,
    toothNumber: number,
    condition: ToothCondition,
    surfaces?: ToothSurfaceState
  ) => {
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id !== patientId) return p;
        const updatedChart = p.dentalChart.map((t) =>
          t.toothNumber === toothNumber
            ? { ...t, condition, surfaces: surfaces || t.surfaces }
            : t
        );
        const updatedPat = { ...p, dentalChart: updatedChart };
        apiClient.updatePatient(patientId, { dentalChart: updatedChart }).catch(() => { });
        return updatedPat;
      })
    );
    notifyCrossTabSync();
    addToast('Dental Chart Updated', `Tooth #${toothNumber} marked as ${condition}.`, 'info');
  };

  const sendWhatsApp = (reminderId: string) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === reminderId ? { ...r, status: 'Sent' } : r))
    );
    const target = reminders.find((r) => r.id === reminderId);
    if (target) {
      addToast('WhatsApp Sent 💬', `Reminder sent successfully to ${target.patientName} (${target.phone}).`, 'success');
    }
  };

  // RECORD PAYMENT
  const recordPayment = async (data: {
    invoiceId: string;
    amount: number;
    paymentMethod: PaymentMethod;
    referenceNumber?: string;
    notes?: string;
    receivedBy?: string;
    patientId?: string;
  }): Promise<PaymentRecord> => {
    try {
      const result = await apiClient.recordPayment(data);
      setPayments((prev) => [result.payment, ...prev.filter((p) => p.id !== result.payment.id)]);
      setInvoices((prev) => prev.map((inv) => (inv.id === result.invoice.id ? result.invoice : inv)));

      // Update patient state
      setPatients((prev) =>
        prev.map((p) => {
          if (p.id === result.invoice.patientId) {
            const updatedInvoices = (p.invoices || []).map((inv) =>
              inv.id === result.invoice.id ? result.invoice : inv
            );
            return {
              ...p,
              invoices: updatedInvoices,
              outstandingBalance: updatedInvoices.reduce((sum, inv) => sum + inv.balance, 0),
              payments: [result.payment, ...(p.payments || []).filter((pay) => pay.id !== result.payment.id)]
            };
          }
          return p;
        })
      );

      savePaymentToDb(result.payment).catch(() => { });
      saveInvoiceToDb(result.invoice).catch(() => { });
      notifyCrossTabSync();
      // Trigger a background state refresh so billing, reports, and patient header all update immediately
      refreshState().catch(() => { });
      addToast('Payment Recorded! 💳', `Receipt ${result.receiptNumber} generated for ₹${data.amount.toLocaleString()} (${data.paymentMethod}).`, 'success');
      return result.payment;
    } catch (err: any) {
      addToast('Payment Error', err.message || 'Failed to record payment.', 'danger');
      throw err;
    }
  };

  // CREATE INVOICE
  const createInvoice = async (data: {
    patientId: string;
    patientName: string;
    doctorName: string;
    visitId?: string;
    items: { description: string; quantity: number; unitPrice: number }[];
    discount?: number;
    tax?: number;
    dueDate?: string;
    paymentMethod?: PaymentMethod;
    initialPaymentAmount?: number;
    referenceNumber?: string;
    notes?: string;
  }): Promise<Invoice> => {
    const subtotal = data.items.reduce((sum, it) => sum + it.quantity * it.unitPrice, 0);
    const discount = data.discount || 0;
    const tax = data.tax || 0;
    const total = Math.max(0, subtotal - discount + tax);

    // Call fee approval API to ensure authorization and consistency
    const result = await apiClient.approveFee({
      visitId: data.visitId || `vis-${data.patientId}-${Date.now()}`,
      patientId: data.patientId,
      consultationFee: 0,
      items: data.items,
      discountType: 'amount',
      discountValue: discount,
      discountReason: discount > 0 ? (data.notes || 'Standard approved clinic billing concession') : 'None'
    });

    setInvoices((prev) => [result.invoice, ...prev.filter((i) => i.id !== result.invoice.id)]);
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id === result.invoice.patientId) {
          const updatedInvoices = [result.invoice, ...(p.invoices || []).filter((i) => i.id !== result.invoice.id)];
          return {
            ...p,
            invoices: updatedInvoices,
            outstandingBalance: updatedInvoices.reduce((sum, inv) => sum + inv.balance, 0)
          };
        }
        return p;
      })
    );

    saveInvoiceToDb(result.invoice).catch(() => { });

    // If initial payment collected
    if (data.initialPaymentAmount && data.initialPaymentAmount > 0 && data.paymentMethod) {
      await recordPayment({
        invoiceId: result.invoice.id,
        amount: data.initialPaymentAmount,
        paymentMethod: data.paymentMethod,
        referenceNumber: data.referenceNumber,
        notes: data.notes
      });
    }

    notifyCrossTabSync();
    // Refresh all state so billing hub, reports, and patient header reflect the new invoice immediately
    refreshState().catch(() => { });
    return result.invoice;
  };

  // STAFF & USER CREDENTIALS HANDLERS (Admin-Controlled)
  const addStaffMember = (data: Omit<StaffUser, 'id'>): StaffUser => {
    const newStaff: StaffUser = {
      ...data,
      id: `staff-${Date.now()}`,
      status: data.status || 'Active',
      createdAt: new Date().toISOString().split('T')[0]
    };
    const nextList = [...staffMembers, newStaff];
    setStaffMembers(nextList);
    try {
      safeSetItem('smilecare_staff_members', JSON.stringify(nextList));
    } catch { }

    // Save profile to Supabase database
    saveProfileToDb({
      id: newStaff.id,
      email: newStaff.email,
      name: newStaff.name,
      password: newStaff.password || 'Password@123',
      role: newStaff.role,
      phone: newStaff.phone,
      specialization: newStaff.specialization,
      qualification: newStaff.qualification,
      roomNumber: newStaff.roomNumber,
      status: newStaff.status,
      avatar: newStaff.avatar
    }).catch(() => { });

    if (data.role === 'doctor') {
      const newDoc: Doctor = {
        id: `doc-${Date.now()}`,
        name: data.name.startsWith('Dr.') ? data.name : `Dr. ${data.name}`,
        title: data.qualification || 'Dental Surgeon',
        qualification: data.qualification || 'BDS',
        specialization: data.specialization || 'General Dentistry',
        experience: '5+ Years',
        rating: 5.0,
        reviewsCount: 0,
        avatar: data.avatar || '',
        availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'],
        bio: `${data.name} is specialized in ${data.specialization || 'dental care'}.`,
        roomNumber: data.roomNumber || 'Cabin 105'
      };
      const updatedDocs = [...doctors, newDoc];
      setDoctors(updatedDocs);
      try {
        safeSetItem('smilecare_doctors_list', JSON.stringify(updatedDocs));
      } catch { }
    }

    addToast('Account Created! 🚀', `Provisioned ${newStaff.name} (${newStaff.role.toUpperCase()}) credentials.`, 'success');
    return newStaff;
  };

  const updateStaffMember = (id: string, updates: Partial<StaffUser>) => {
    const nextList = staffMembers.map((s) => (s.id === id ? { ...s, ...updates } : s));
    setStaffMembers(nextList);
    try {
      safeSetItem('smilecare_staff_members', JSON.stringify(nextList));
    } catch { }

    const target = nextList.find((s) => s.id === id);
    if (target) {
      saveProfileToDb({
        id: target.id,
        email: target.email,
        name: target.name,
        password: target.password,
        role: target.role,
        phone: target.phone,
        specialization: target.specialization,
        qualification: target.qualification,
        roomNumber: target.roomNumber,
        status: target.status,
        avatar: target.avatar
      }).catch(() => { });
    }

    if (target && target.role === 'doctor') {
      let docFound = false;
      let updatedDocs = doctors.map((d) => {
        if (d.name.toLowerCase().includes(target.name.toLowerCase()) || d.id === target.id) {
          docFound = true;
          return {
            ...d,
            name: updates.name ? (updates.name.startsWith('Dr.') ? updates.name : `Dr. ${updates.name}`) : d.name,
            specialization: updates.specialization || d.specialization,
            qualification: updates.qualification || d.qualification,
            roomNumber: updates.roomNumber || d.roomNumber,
            avatar: updates.avatar !== undefined ? updates.avatar : d.avatar
          };
        }
        return d;
      });

      if (!docFound) {
        const newDoc: Doctor = {
          id: target.id,
          name: target.name.startsWith('Dr.') ? target.name : `Dr. ${target.name}`,
          specialization: target.specialization || 'General Dentistry',
          qualification: target.qualification || 'BDS, MDS',
          experience: '8+ Years',
          rating: 5.0,
          reviewsCount: 0,
          avatar: target.avatar || '',
          availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
          slots: ['09:30 AM', '10:30 AM', '11:30 AM', '02:30 PM', '04:30 PM', '06:00 PM'],
          bio: `${target.name} is specialized in ${target.specialization || 'General Dentistry'}.`,
          roomNumber: target.roomNumber || 'Cabin 101'
        };
        updatedDocs = [...updatedDocs, newDoc];
      }
      setDoctors(updatedDocs);
      try {
        safeSetItem('smilecare_doctors_list', JSON.stringify(updatedDocs));
      } catch { }
    }

    addToast('Staff Updated', `Updated profile and credentials for ${updates.name || target?.name}.`, 'info');
  };

  const deleteStaffMember = (id: string) => {
    const target = staffMembers.find((s) => s.id === id);
    const nextList = staffMembers.filter((s) => s.id !== id);
    setStaffMembers(nextList);
    try {
      safeSetItem('smilecare_staff_members', JSON.stringify(nextList));
    } catch { }

    if (target) {
      deleteProfileFromDb(target.email).catch(() => { });
    }

    if (target && target.role === 'doctor') {
      const updatedDocs = doctors.filter((d) => !d.name.includes(target.name) && d.id !== target.id);
      setDoctors(updatedDocs);
      try {
        safeSetItem('smilecare_doctors_list', JSON.stringify(updatedDocs));
      } catch { }
    }

    addToast('Account Removed', `Removed ${target?.name || 'User'} from clinic database.`, 'info');
  };

  // Follow-Up Management Functions
  const addFollowUp = async (data: Omit<FollowUpRecord, 'id'>): Promise<FollowUpRecord> => {
    const newFollowUp: FollowUpRecord = {
      ...data,
      id: `fu-${Date.now()}`
    };

    setPatients((prev) =>
      prev.map((p) => {
        if (p.id === data.patientId) {
          const updatedFollowUps = [newFollowUp, ...(p.followUps || [])];
          const updatedPat = {
            ...p,
            followUps: updatedFollowUps,
            upcomingAppointmentDate: p.upcomingAppointmentDate || newFollowUp.date
          };
          apiClient.updatePatient(p.id, { followUps: updatedFollowUps }).catch(() => { });
          return updatedPat;
        }
        return p;
      })
    );

    // Auto-create a WhatsApp reminder queue item
    const patientObj = patients.find((p) => p.id === data.patientId);
    if (patientObj) {
      const newReminder: WhatsAppReminder = {
        id: `wa-fu-${Date.now()}`,
        patientName: patientObj.name,
        phone: patientObj.phone,
        appointmentDate: newFollowUp.date,
        appointmentTime: newFollowUp.time || '10:00 AM',
        doctorName: newFollowUp.doctorName,
        type: '24h Reminder',
        status: 'Scheduled',
        scheduledFor: `${newFollowUp.date}, 09:00 AM`,
        messageText: `Dear ${patientObj.name}, this is a reminder for your dental follow-up (${newFollowUp.reason}) with ${newFollowUp.doctorName} on ${newFollowUp.date}. Please contact Shriya Multispeciality Dental Clinic if you need to reschedule.`
      };
      setReminders((prev) => [newReminder, ...prev]);
    }

    notifyCrossTabSync();
    addToast('Follow-Up Scheduled 📅', `Follow-up set for ${data.patientName || 'patient'} on ${data.date}.`, 'success');
    return newFollowUp;
  };

  const updateFollowUpStatus = async (
    followUpId: string,
    status: FollowUpStatus,
    completedNotes?: string
  ): Promise<void> => {
    setPatients((prev) =>
      prev.map((p) => {
        const hasFu = (p.followUps || []).some((f) => f.id === followUpId);
        if (!hasFu) return p;

        const updatedFollowUps = (p.followUps || []).map((f) => {
          if (f.id === followUpId) {
            return {
              ...f,
              status,
              ...(status === 'Completed'
                ? {
                  completedAt: new Date().toISOString().split('T')[0],
                  completedNotes: completedNotes || 'Consultation attended & completed.'
                }
                : {})
            };
          }
          return f;
        });

        const updatedPat = { ...p, followUps: updatedFollowUps };
        apiClient.updatePatient(p.id, { followUps: updatedFollowUps }).catch(() => { });
        return updatedPat;
      })
    );

    notifyCrossTabSync();
    addToast('Follow-Up Updated ✓', `Marked as ${status}.`, 'info');
  };

  const rescheduleFollowUp = async (
    followUpId: string,
    newDate: string,
    newTime?: string,
    reason?: string
  ): Promise<void> => {
    setPatients((prev) =>
      prev.map((p) => {
        const hasFu = (p.followUps || []).some((f) => f.id === followUpId);
        if (!hasFu) return p;

        const updatedFollowUps = (p.followUps || []).map((f) => {
          if (f.id === followUpId) {
            return {
              ...f,
              date: newDate,
              ...(newTime ? { time: newTime } : {}),
              status: 'Scheduled' as FollowUpStatus,
              notes: reason ? `${f.notes ? `${f.notes} | ` : ''}Rescheduled: ${reason}` : f.notes
            };
          }
          return f;
        });

        const updatedPat = { ...p, followUps: updatedFollowUps };
        apiClient.updatePatient(p.id, { followUps: updatedFollowUps }).catch(() => { });
        return updatedPat;
      })
    );

    notifyCrossTabSync();
    addToast('Follow-Up Rescheduled 🗓️', `New appointment date: ${newDate}.`, 'success');
  };

  const sendFollowUpWhatsAppReminder = async (followUpId: string, customMessage?: string): Promise<void> => {
    let targetFu: FollowUpRecord | undefined;
    let targetPat: PatientRecord | undefined;

    for (const pat of patients) {
      const fu = (pat.followUps || []).find((f) => f.id === followUpId);
      if (fu) {
        targetFu = fu;
        targetPat = pat;
        break;
      }
    }

    if (!targetFu || !targetPat) {
      addToast('Error', 'Follow-up or patient not found', 'danger');
      return;
    }

    const message =
      customMessage ||
      `Dear ${targetPat.name},\nThis is a gentle reminder from Shriya Multispeciality Dental Clinic regarding your upcoming follow-up for *${targetFu.reason}* with *${targetFu.doctorName}* on *${targetFu.date}*${targetFu.time ? ` at ${targetFu.time}` : ''}.\n\nInstructions: ${targetFu.notes || 'Please arrive 5 minutes before your time.'}\n\nCall or reply to this message for any queries. Thank you!`;

    const reminderItem: WhatsAppReminder = {
      id: `wa-fu-${Date.now()}`,
      patientName: targetPat.name,
      phone: targetPat.phone,
      appointmentDate: targetFu.date,
      appointmentTime: targetFu.time || '10:00 AM',
      doctorName: targetFu.doctorName,
      type: '24h Reminder',
      status: 'Sent',
      scheduledFor: 'Immediate',
      messageText: message
    };

    setReminders((prev) => [reminderItem, ...prev]);
    await updateFollowUpStatus(followUpId, 'Contacted');
    addToast('WhatsApp Reminder Sent 💬', `Dispatched follow-up alert to ${targetPat.name} (${targetPat.phone}).`, 'success');
  };

  return (
    <AppContext.Provider
      value={{
        activeView,
        setActiveView,
        appointments,
        visits,
        tokens,
        doctors,
        services,
        patients,
        chairs,
        inventory,
        invoices,
        payments,
        prescriptions,
        feeApprovals,
        auditEvents,
        recordPayment,
        staffMembers,
        addStaffMember,
        updateStaffMember,
        deleteStaffMember,
        createInvoice,
        userRole,
        setUserRole,
        reminders,
        enquiries,
        addEnquiry,
        updateEnquiryStatus,
        sendAppointmentWhatsApp,
        toasts,
        addToast,
        removeToast,
        addAppointment,
        updateAppointmentStatus,
        markNoShow,
        rescheduleAppointment,
        cancelAppointment,
        checkInPatient,
        createWalkInPatient,
        callToken,
        startConsultation,
        completeConsultation,
        approveFee,
        createPrescription,
        closeVisit,
        holdToken,
        skipToken,
        callNextPatient,
        skipCurrentPatient,
        holdCurrentPatient,
        completeCurrentPatient,
        sendWhatsApp,
        selectedPatientForDetail,
        setSelectedPatientForDetail,
        updatePatient,
        addPatient,
        registerNewPatient,
        updateDentalChartForVisit,
        updateChairStatus,
        updateInventoryStock,
        userToken,
        setUserToken,
        latestCreatedAppointment,
        setLatestCreatedAppointment,
        refreshState,
        isSidebarCollapsed,
        toggleSidebar,
        setSidebarCollapsed,
        addFollowUp,
        updateFollowUpStatus,
        rescheduleFollowUp,
        sendFollowUpWhatsAppReminder,
        sentToDoctorTokens,
        sendTokenToDoctor,
        shouldOpenCaseSheetOnProfile,
        setShouldOpenCaseSheetOnProfile
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
