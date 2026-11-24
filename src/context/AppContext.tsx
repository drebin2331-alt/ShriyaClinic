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
  PatientEnquiry,
  MedicineRecord
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
import {
  SEED_PATIENTS,
  SEED_TOKENS,
  SEED_VISITS,
  SEED_INVOICES,
  SEED_PAYMENTS,
  SEED_PRESCRIPTIONS,
  SEED_USERS,
  SEED_FEE_APPROVALS,
  SEED_MEDICINES,
  SEED_DOCTORS
} from '../seed/seedClinicData';
import { createFullDefaultDentalChart } from '../utils/dentalChartHelper';
import { openWhatsAppChat } from '../utils/whatsapp';
import { apiClient, apiFetch } from '../utils/apiClient';
import {
  supabase,
  isSupabaseAvailable,
  probeSupabaseAvailability,
  subscribeSupabaseStatus,
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
  deleteProfileFromDb,
  fetchPrescriptionsFromDb,
  savePrescriptionToDb,
  deletePrescriptionFromDb,
  deleteInvoiceFromDb,
  fetchEnquiriesFromDb,
  saveEnquiryToDb,
  updateEnquiryStatusInDb,
  deleteEnquiryFromDb,
  clearAllEnquiriesFromDb
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
    name: 'ADMIN',
    email: 'admin@clinic.com',
    password: 'Password@123',
    role: 'admin',
    phone: '+91 98765 33445',
    specialization: 'Practice Governance & Operations',
    qualification: 'MHA',
    roomNumber: 'Admin Suite',
    status: 'Active',
    createdAt: '2026-10-20'
  }
];

export const INITIAL_DOCTORS: Doctor[] = [];

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
  deleteEnquiry: (id: string) => Promise<void>;
  clearAllEnquiries: () => Promise<void>;
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
    tokenNumber?: string;
    tokenId?: string;
    patientId?: string;
    patientName?: string;
    doctorId?: string;
    doctorName?: string;
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
    feeApprovalId?: string;
    isNewFee?: boolean;
  }) => Promise<{ feeApproval: FeeApprovalRecord; invoice: Invoice; visit?: ClinicVisit }>;
  createPrescription: (data: {
    visitId: string;
    patientId: string;
    patientName?: string;
    patientOpNumber?: string;
    doctorId?: string;
    doctorName?: string;
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
  updatePrescription: (
    id: string,
    data: {
      patientName?: string;
      patientOpNumber?: string;
      doctorId?: string;
      doctorName?: string;
      patientId?: string;
      items: Array<{
        id?: string;
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
    }
  ) => Promise<{ prescription: PrescriptionRecord; visit?: ClinicVisit }>;
  deletePrescription: (id: string) => Promise<void>;
  medicines: MedicineRecord[];
  saveMedicine: (med: Partial<MedicineRecord>) => Promise<MedicineRecord>;

  // Receptionist Checkout / Encounter Closure
  closeVisit: (
    visitId: string, 
    adminNotes?: string,
    meta?: {
      patientId?: string;
      patientName?: string;
      tokenId?: string;
      tokenNumber?: string;
      doctorId?: string;
      doctorName?: string;
    }
  ) => Promise<void>;

  // Queue calls (legacy compatible)
  callNextPatient: () => void;
  skipCurrentPatient: () => void;
  holdCurrentPatient: () => void;
  completeCurrentPatient: () => void;

  sendWhatsApp: (reminderId: string, openExternal?: boolean) => void;
  addWhatsAppReminder: (data: Omit<WhatsAppReminder, 'id'>) => string;
  deleteWhatsAppReminder: (reminderId: string) => void;
  dispatchAllPendingWhatsApp: () => void;
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
  deleteInvoice: (invoiceId: string) => Promise<void>;
  refreshState: () => Promise<void>;
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  isProfileSheetOpen: boolean;
  setIsProfileSheetOpen: (open: boolean) => void;

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

const isPhantomToken = (t: QueueToken): boolean => {
  const genericPatient = !t.patientName || t.patientName === 'Patient' || t.patientName === 'PAT-TEMP';
  // Only drop synthetic visit-ID tokens (VIS-...) with generic fallback names — never drop real W-/T- tokens
  if (genericPatient && (t.tokenNumber?.startsWith('VIS-') || t.id?.startsWith('VIS-'))) return true;
  return false;
};

const cleanAndDeduplicateTokens = (list: QueueToken[]): QueueToken[] => {
  const today = new Date().toISOString().split('T')[0];
  const statusPriority: Record<string, number> = {
    'Reception Follow-up': 10, 'In Consultation': 9, 'Called': 8,
    'Waiting': 7, 'On Hold': 6, 'Completed': 5, 'Cancelled': 1,
  };
  const byTokenNumber = new Map<string, QueueToken>();

  for (const raw of list || []) {
    if (!raw || isDemoPatientOrToken(raw.patientName) || isPhantomToken(raw)) continue;
    const t: QueueToken =
      raw.id === 'tok-1794029736556' ||
      raw.tokenNumber === 'W-002' ||
      (raw.status === 'Waiting' && raw.date && raw.date < today)
        ? { ...raw, status: 'Completed' as TokenStatus, completedAt: raw.completedAt || new Date().toISOString() }
        : raw;

    const key = t.tokenNumber || t.id;
    if (!key) continue;
    const existing = byTokenNumber.get(key);
    if (!existing) {
      byTokenNumber.set(key, t);
    } else {
      const tHasRealName = Boolean(t.patientName && t.patientName !== 'Patient' && t.patientName !== 'PAT-TEMP');
      const existingHasRealName = Boolean(existing.patientName && existing.patientName !== 'Patient' && existing.patientName !== 'PAT-TEMP');
      if (tHasRealName && !existingHasRealName) {
        byTokenNumber.set(key, t);
      } else if (tHasRealName === existingHasRealName && (statusPriority[t.status] ?? 0) > (statusPriority[existing.status] ?? 0)) {
        byTokenNumber.set(key, t);
      }
    }
  }
  return Array.from(byTokenNumber.values());
};

export const deduplicatePatients = (list: PatientRecord[]): PatientRecord[] => {
  const map = new Map<string, PatientRecord>();
  for (const p of list || []) {
    if (!p) continue;
    // Reject legacy test ID from earlier failed counter sequence
    if (p.id === 'PAT-2026-000101' || p.opNumber === 'OP-2026-00101') continue;
    if (isDemoPatientOrToken(p.name)) continue;

    const normPhone = (p.phone || '').replace(/\D/g, '').slice(-10);
    const key = normPhone.length >= 8 ? `phone:${normPhone}` : `id:${p.id}`;

    const existing = map.get(key);
    if (!existing) {
      map.set(key, p);
    } else {
      // Pick the record with the canonical sequential ID (e.g. PAT-2026-000001 over others)
      const preferP = (p.id.localeCompare(existing.id) <= 0) ? p : existing;
      const other = preferP === p ? existing : p;
      map.set(key, {
        ...other,
        ...preferP,
        visits: (preferP.visits?.length || 0) >= (other.visits?.length || 0) ? preferP.visits : other.visits,
        prescriptions: (preferP.prescriptions?.length || 0) >= (other.prescriptions?.length || 0) ? preferP.prescriptions : other.prescriptions,
        invoices: (preferP.invoices?.length || 0) >= (other.invoices?.length || 0) ? preferP.invoices : other.invoices,
        treatmentPlans: (preferP.treatmentPlans?.length || 0) >= (other.treatmentPlans?.length || 0) ? preferP.treatmentPlans : other.treatmentPlans,
        dentalChart: (preferP.dentalChart?.length || 0) >= (other.dentalChart?.length || 0) ? preferP.dentalChart : other.dentalChart,
      });
    }
  }
  return Array.from(map.values()).sort((a, b) => a.id.localeCompare(b.id));
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // One-time clean launch reset for client production: purge legacy test data
  if (typeof window !== 'undefined') {
    try {
      const cleanLaunchKey = 'smilecare_clean_launch_v5';
      if (!localStorage.getItem(cleanLaunchKey)) {
        localStorage.removeItem('smilecare_patients_list');
        localStorage.removeItem('smilecare_tokens_list');
        localStorage.removeItem('smilecare_visits_list');
        localStorage.removeItem('smilecare_invoices_list');
        localStorage.removeItem('smilecare_payments_list');
        localStorage.removeItem('smilecare_prescriptions_list');
        localStorage.removeItem('smilecare_fee_approvals');
        localStorage.removeItem('smilecare_whatsapp_reminders');
        localStorage.removeItem('smilecare_staff_members');
        localStorage.removeItem('smilecare_doctors_list');
        const savedAuth = localStorage.getItem('smilecare_auth_user');
        if (savedAuth) {
          try {
            const parsed = JSON.parse(savedAuth);
            if (parsed.email !== 'admin@clinic.com') {
              localStorage.removeItem('smilecare_auth_user');
            }
          } catch {
            localStorage.removeItem('smilecare_auth_user');
          }
        }
        localStorage.setItem(cleanLaunchKey, 'true');
      }
    } catch { }
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
        if (Array.isArray(parsed) && parsed.length > 0) {
          // De-duplicate by id; filter out phantom fallback visits (synthetic VIS-20xx-xxxxx with generic data)
          const seenIds = new Set<string>();
          const isPhantomVisit = (v: ClinicVisit) =>
            (!v.patientName || v.patientName === 'Patient' || v.patientName === 'PAT-TEMP') &&
            (!v.doctorName || v.doctorName === 'Consulting Doctor') &&
            (v.id?.startsWith('VIS-20') || v.id?.startsWith('tok-'));

          return parsed
            .filter((v) => !isDemoPatientOrToken(v.patientName) && !isPhantomVisit(v))
            .filter((v) => {
              if (seenIds.has(v.id)) return false;
              seenIds.add(v.id);
              return true;
            })
            .map((v) => {
              if (v.id === 'VIS-2026-00002' || (v.status === 'Waiting' && v.visitDate && v.visitDate < new Date().toISOString().split('T')[0])) {
                return { ...v, status: 'Closed' as const, closedAt: v.closedAt || '11:35 am' };
              }
              return v;
            });
        }
      }
    } catch { }
    return SEED_VISITS;
  });

  const [tokens, setTokens] = useState<QueueToken[]>(() => {
    try {
      const saved = localStorage.getItem('smilecare_tokens_list');
      if (saved) {
        const parsed: QueueToken[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return cleanAndDeduplicateTokens(parsed);
        }
      }
    } catch { }
    return SEED_TOKENS;
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
              s.email !== 'doctor@gmail.com' &&
              s.email !== 'desk@gmail.com' &&
              s.email !== 'doctor@clinic.com' &&
              s.email !== 'reception@clinic.com' &&
              s.email !== 'patient@clinic.com' &&
              s.email !== 'ananya.doc@demo.com' &&
              s.email !== 'vikram.doc@demo.com' &&
              s.name !== 'DOCTOR TEST' &&
              s.name !== 'TEST DESK' &&
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
              d.id !== 'staff-1792653030970' &&
              d.id !== 'doc-1' &&
              d.id !== 'doc-3' &&
              d.id !== 'doc-4' &&
              d.name !== 'DOCTOR TEST' &&
              d.name !== 'Dr. DOCTOR TEST' &&
              d.name !== 'Dr. Priya Sharma' &&
              d.name !== 'Dr. Ananya Reddy' &&
              d.name !== 'Dr. Vikram Malhotra'
          )
          .map((d) => ({
            ...d,
            avatar: (d.avatar && (d.avatar.includes('photo-1559839734') || d.avatar.length > 50000)) ? '' : (d.avatar || '')
          }));
        if (cleaned.length > 0) {
          safeSetItem('smilecare_doctors_list', JSON.stringify(cleaned));
          return cleaned;
        }
      }
    } catch { }
    return INITIAL_DOCTORS;
  });
  const [services] = useState<Service[]>(MOCK_SERVICES);

  // Instantly hydrate patients from local cache on initial page load / refresh
  const [patients, setPatients] = useState<PatientRecord[]>(() => {
    try {
      const saved = localStorage.getItem('smilecare_patients_list');
      if (saved) {
        const parsed: PatientRecord[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const cleaned = deduplicatePatients(parsed);
          if (cleaned.length > 0) return cleaned;
        }
      }
    } catch { }
    return SEED_PATIENTS;
  });

  const [chairs, setChairs] = useState<DentalChair[]>(MOCK_CHAIRS);
  const [inventory, setInventory] = useState<InventoryItem[]>(MOCK_INVENTORY);

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    try {
      const saved = localStorage.getItem('smilecare_invoices_list');
      if (saved) {
        const parsed: Invoice[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed.filter((i) => !isDemoPatientOrToken(i.patientName));
      }
    } catch { }
    return SEED_INVOICES;
  });

  const [payments, setPayments] = useState<PaymentRecord[]>(() => {
    try {
      const saved = localStorage.getItem('smilecare_payments_list');
      if (saved) {
        const parsed: PaymentRecord[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed.filter((p) => !isDemoPatientOrToken(p.patientName));
      }
    } catch { }
    return SEED_PAYMENTS;
  });
  const [prescriptions, setPrescriptions] = useState<PrescriptionRecord[]>(() => {
    try {
      const saved = localStorage.getItem('smilecare_prescriptions_list');
      if (saved) {
        const parsed: PrescriptionRecord[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch { }
    return SEED_PRESCRIPTIONS;
  });
  const [medicines, setMedicines] = useState<MedicineRecord[]>(() => {
    try {
      const saved = localStorage.getItem('smilecare_medicines_list');
      if (saved) {
        const parsed: MedicineRecord[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch { }
    return SEED_MEDICINES;
  });
  const [feeApprovals, setFeeApprovals] = useState<FeeApprovalRecord[]>(() => {
    try {
      const saved = localStorage.getItem('smilecare_fee_approvals');
      if (saved) {
        const parsed: FeeApprovalRecord[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch { }
    return SEED_FEE_APPROVALS;
  });
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [userRole, setUserRole] = useState<UserRole>('admin');
  const [reminders, setReminders] = useState<WhatsAppReminder[]>(() => {
    try {
      const saved = localStorage.getItem('smilecare_whatsapp_reminders');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch { }
    return MOCK_WHATSAPP_REMINDERS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('smilecare_whatsapp_reminders', JSON.stringify(reminders));
    } catch { }
  }, [reminders]);
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

  const [isProfileSheetOpen, setIsProfileSheetOpen] = useState<boolean>(false);

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

  // Synchronize state from authoritative Backend API and Cloud DB
  const refreshState = useCallback(async () => {
    // 1. Fetch authoritative full clinic state from backend API (/api/state)
    try {
      const data = await apiClient.getState();

      // Merge patients safely without dropping newly registered ones
      if (data.patients && data.patients.length > 0) {
        setPatients((prev) => {
          const merged = deduplicatePatients([...data.patients!, ...(prev || [])]);
          safeSetItem('smilecare_patients_list', JSON.stringify(merged));
          return merged;
        });
      } else {
        setPatients((prev) => {
          if (!prev || prev.length === 0) {
            safeSetItem('smilecare_patients_list', JSON.stringify(SEED_PATIENTS));
            return SEED_PATIENTS;
          }
          return prev;
        });
      }

      // Merge appointments safely (NEVER wipe out with empty array)
      if (data.appointments && data.appointments.length > 0) {
        setAppointments((prev) => {
          const map = new Map<string, Appointment>();
          (prev || []).forEach((a) => map.set(a.id, a));
          (data.appointments || []).forEach((a) => map.set(a.id, a));
          const merged = Array.from(map.values()).filter((a) => !isDemoPatientOrToken(a.patientName));
          safeSetItem('smilecare_appointments_list', JSON.stringify(merged));
          return merged;
        });
      }

      // Merge tokens safely by unique ID (NEVER map by tokenNumber which collides across dates)
      if (data.tokens && data.tokens.length > 0) {
        setTokens((prev) => {
          const map = new Map<string, QueueToken>();
          (prev || []).forEach((t) => map.set(t.id, t));
          (data.tokens || []).forEach((t) => map.set(t.id, t));
          const deduped = cleanAndDeduplicateTokens(Array.from(map.values()));
          safeSetItem('smilecare_tokens_list', JSON.stringify(deduped));
          return deduped;
        });
      } else {
        setTokens((prev) => {
          if (!prev || prev.length === 0) {
            safeSetItem('smilecare_tokens_list', JSON.stringify(SEED_TOKENS));
            return SEED_TOKENS;
          }
          return prev;
        });
      }

      // Merge visits
      if (data.visits && data.visits.length > 0) {
        setVisits((prev) => {
          const map = new Map<string, ClinicVisit>();
          (data.visits || []).forEach((v) => map.set(v.id, v));
          (prev || []).forEach((v) => { if (!map.has(v.id)) map.set(v.id, v); });
          return Array.from(map.values());
        });
      } else {
        setVisits((prev) => {
          if (!prev || prev.length === 0) return SEED_VISITS;
          return prev;
        });
      }

      // Merge invoices
      if (data.invoices && data.invoices.length > 0) {
        setInvoices((prev) => {
          const map = new Map<string, Invoice>();
          (prev || []).forEach((i) => map.set(i.id, i));
          (data.invoices || []).forEach((i) => map.set(i.id, i));
          const merged = Array.from(map.values());
          safeSetItem('smilecare_invoices_list', JSON.stringify(merged));
          return merged;
        });
      }

      // Merge payments
      if (data.payments && data.payments.length > 0) {
        setPayments((prev) => {
          const map = new Map<string, PaymentRecord>();
          (prev || []).forEach((p) => map.set(p.id, p));
          (data.payments || []).forEach((p) => map.set(p.id, p));
          const merged = Array.from(map.values());
          safeSetItem('smilecare_payments_list', JSON.stringify(merged));
          return merged;
        });
      }

      if (data.feeApprovals) setFeeApprovals(data.feeApprovals);
      if (data.prescriptions && data.prescriptions.length > 0) {
        setPrescriptions((prev) => {
          const map = new Map<string, PrescriptionRecord>();
          (prev || []).forEach((p) => map.set(p.id, p));
          (data.prescriptions || []).forEach((p) => map.set(p.id, p));
          const merged = Array.from(map.values());
          safeSetItem('smilecare_prescriptions_list', JSON.stringify(merged));
          return merged;
        });
      }
      if (data.medicines && data.medicines.length > 0) {
        setMedicines((prev) => {
          const map = new Map<string, MedicineRecord>();
          (prev || []).forEach((m) => map.set(m.name.toLowerCase().trim(), m));
          (data.medicines || []).forEach((m) => map.set(m.name.toLowerCase().trim(), m));
          return Array.from(map.values());
        });
      }
      if (data.auditEvents) setAuditEvents(data.auditEvents);

      // Sync enquiries from backend (Additive only - NEVER wipe with empty array)
      if (data.enquiries && Array.isArray(data.enquiries) && data.enquiries.length > 0) {
        setEnquiries((prev) => {
          const map = new Map<string, PatientEnquiry>();
          (prev || []).forEach((e) => map.set(e.id, e));
          (data.enquiries || []).forEach((e) => map.set(e.id, e));
          const merged = Array.from(map.values()).sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          safeSetItem('smilecare_enquiries_list', JSON.stringify(merged));
          return merged;
        });
      }

      // PRESERVE SELECTED PATIENT: NEVER FORCE patients[0]! NEVER FLIP TO ANOTHER PATIENT!
      setSelectedPatientForDetail((curr) => {
        if (!curr) return null;
        const matched = (data.patients || []).find((p) => p.id === curr.id || p.opNumber === curr.opNumber);
        if (!matched) return curr;
        return isSamePatientRecord(curr, matched) ? curr : { ...curr, ...matched };
      });
    } catch (err) {
      // Local fallback
    }

    // 2. Secondary Supabase Cloud Synchronization (Additive only — NEVER destructive)
    if (await probeSupabaseAvailability()) {
      try {
        const [
          dbPatients, 
          dbAppointments, 
          dbTokens, 
          dbInvoices, 
          dbPayments, 
          dbChairs, 
          dbProfiles, 
          dbEnquiries,
          dbPrescriptions
        ] = await Promise.allSettled([
          fetchPatientsFromDb(),
          fetchAppointmentsFromDb(),
          fetchTokensFromDb(),
          fetchInvoicesFromDb(),
          fetchPaymentsFromDb(),
          fetchChairsFromDb(),
          fetchProfilesFromDb(),
          fetchEnquiriesFromDb(),
          fetchPrescriptionsFromDb()
        ]);

        // Sync patients directly from Supabase
        if (dbPatients.status === 'fulfilled') {
          const cleanPatients = deduplicatePatients(dbPatients.value || []);
          setPatients(cleanPatients);
          safeSetItem('smilecare_patients_list', JSON.stringify(cleanPatients));
        }

        // Sync appointments directly from Supabase
        if (dbAppointments.status === 'fulfilled') {
          const cleanAppointments = (dbAppointments.value || []).filter((a) => !isDemoPatientOrToken(a.patientName));
          setAppointments(cleanAppointments);
          safeSetItem('smilecare_appointments_list', JSON.stringify(cleanAppointments));
        }

        // Sync tokens directly from Supabase
        if (dbTokens.status === 'fulfilled') {
          setTokens((prev) => {
            const mapped = (dbTokens.value || []).map((t) => {
              const localMatch = prev.find((p) => p.id === t.id || p.tokenNumber === t.tokenNumber);
              if (localMatch && localMatch.status === 'Reception Follow-up' && t.status === 'Completed') {
                return { ...t, status: 'Reception Follow-up' as TokenStatus };
              }
              return t;
            });
            const cleanTokens = cleanAndDeduplicateTokens(mapped);
            safeSetItem('smilecare_tokens_list', JSON.stringify(cleanTokens));
            return cleanTokens;
          });
        }

        // Sync invoices directly from Supabase
        if (dbInvoices.status === 'fulfilled') {
          const cleanInvoices = (dbInvoices.value || []).filter((i) => !isDemoPatientOrToken(i.patientName));
          setInvoices(cleanInvoices);
          safeSetItem('smilecare_invoices_list', JSON.stringify(cleanInvoices));
        }

        // Sync payments directly from Supabase
        if (dbPayments.status === 'fulfilled') {
          const cleanPayments = (dbPayments.value || []).filter((p) => !isDemoPatientOrToken(p.patientName));
          setPayments(cleanPayments);
          safeSetItem('smilecare_payments_list', JSON.stringify(cleanPayments));
        }

        // Sync prescriptions directly from Supabase
        if (dbPrescriptions.status === 'fulfilled' && dbPrescriptions.value && dbPrescriptions.value.length > 0) {
          setPrescriptions((prev) => {
            const map = new Map<string, PrescriptionRecord>();
            (prev || []).forEach((p) => map.set(p.id, p));
            (dbPrescriptions.value || []).forEach((p) => map.set(p.id, p));
            const merged = Array.from(map.values()).sort(
              (a, b) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime()
            );
            safeSetItem('smilecare_prescriptions_list', JSON.stringify(merged));
            return merged;
          });
        }

        // Sync online enquiries directly from Supabase
        if (dbEnquiries.status === 'fulfilled' && dbEnquiries.value && dbEnquiries.value.length > 0) {
          setEnquiries((prev) => {
            const map = new Map<string, PatientEnquiry>();
            (prev || []).forEach((e) => map.set(e.id, e));
            (dbEnquiries.value || []).forEach((e) => map.set(e.id, e));
            const merged = Array.from(map.values()).sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            safeSetItem('smilecare_enquiries_list', JSON.stringify(merged));
            return merged;
          });
        }

        if (dbChairs.status === 'fulfilled' && dbChairs.value && dbChairs.value.length > 0) {
          setChairs(dbChairs.value);
        }

        // Profiles / Doctors: Authoritative synchronization from Supabase profiles
        if (dbProfiles.status === 'fulfilled') {
          const profilesList = dbProfiles.value || [];
          const mappedStaff: StaffUser[] = profilesList.map((p) => ({
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

          const authoritativeStaff = mappedStaff.length > 0 ? mappedStaff : INITIAL_STAFF_MEMBERS;
          setStaffMembers(authoritativeStaff);
          try { safeSetItem('smilecare_staff_members', JSON.stringify(authoritativeStaff)); } catch { }

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
          try { safeSetItem('smilecare_doctors_list', JSON.stringify(realDoctors)); } catch { }
        }
      } catch (err) {
        console.warn('Supabase background sync note:', err);
      }
    }
  }, []);

  // Sync on mount, listen on Supabase Realtime channel, BroadcastChannel, and fallback polling
  useEffect(() => {
    let isDisposed = false;
    let realtimeChannel: any = null;

    const cleanupRealtime = () => {
      if (realtimeChannel) {
        try {
          supabase.removeChannel(realtimeChannel);
        } catch { }
        realtimeChannel = null;
      }
    };

    refreshState();

    // Only connect Supabase Realtime after verifying the cloud project is not restricted (HTTP 402)
    probeSupabaseAvailability().then((available) => {
      if (isDisposed || !available || !isSupabaseAvailable()) return;
      try {
        realtimeChannel = supabase
          .channel('realtime:clinic_operations')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'tokens' }, () => refreshState())
          .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => refreshState())
          .on('postgres_changes', { event: '*', schema: 'public', table: 'patients' }, () => refreshState())
          .on('postgres_changes', { event: '*', schema: 'public', table: 'invoices' }, () => refreshState())
          .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, () => refreshState())
          .on('postgres_changes', { event: '*', schema: 'public', table: 'dental_chairs' }, () => refreshState())
          .on('postgres_changes', { event: '*', schema: 'public', table: 'audit_events' }, () => refreshState())
          .on('postgres_changes', { event: '*', schema: 'public', table: 'enquiries' }, () => refreshState())
          .subscribe((status) => {
            if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
              cleanupRealtime();
            }
          });
      } catch (e) {
        console.warn('Realtime subscription error:', e);
      }
    });

    const unsubStatus = subscribeSupabaseStatus(() => {
      if (!isSupabaseAvailable()) {
        cleanupRealtime();
      }
    });

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

    // Realtime background sync for enquiries, tokens, appointments, and visits (every 30 seconds fallback)
    const interval = setInterval(() => {
      refreshState();
    }, 30000);

    return () => {
      isDisposed = true;
      unsubStatus();
      cleanupRealtime();
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
    // Client-side duplicate check by normalized phone
    const normPhone = data.phone.replace(/\D/g, '').slice(-10);
    const existing = normPhone.length >= 8 ? patients.find(p => p.phone.replace(/\D/g, '').slice(-10) === normPhone) : null;
    if (existing && !data.allowDuplicate) {
      setSelectedPatientForDetail(existing);
      addToast('Patient Already Registered', `${existing.name} is already registered (${existing.opNumber || existing.id}).`, 'warning');
      return { patient: existing, opNumber: existing.opNumber || existing.id };
    }

    let resultPatient: PatientRecord;
    let opNumber: string;

    try {
      const result = await apiClient.registerPatient(data);
      resultPatient = result?.patient || (result as any);
      opNumber = result?.opNumber || resultPatient?.opNumber || resultPatient?.id || `OP-2026-${String(patients.length + 1).padStart(5, '0')}`;
      if (!resultPatient || !resultPatient.id) {
        throw new Error('API did not return a valid patient record');
      }
    } catch (e) {
      // Direct local/Supabase creation
      const count = patients.length + 1;
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
        totalVisits: 0,
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
    setPatients((prev) => [resultPatient, ...prev.filter((p) => p && p.id && p.id !== resultPatient.id)]);
    setSelectedPatientForDetail(resultPatient);
    notifyCrossTabSync();
    addToast('New Patient Registered! 🎉', `${resultPatient.name} (${opNumber}) registered successfully.`, 'success');
    return { patient: resultPatient, opNumber };
  };

  const addPatient = async (newPat: PatientRecord): Promise<PatientRecord> => {
    try {
      await savePatientToDb(newPat);
      setPatients((prev) => [newPat, ...prev.filter((p) => p && p.id && p.id !== newPat.id)]);
      setSelectedPatientForDetail(newPat);
      notifyCrossTabSync();
      addToast('Patient Saved', `${newPat.name} saved to database.`, 'success');
      return newPat;
    } catch (err: any) {
      setPatients((prev) => [newPat, ...prev.filter((p) => p && p.id && p.id !== newPat.id)]);
      setSelectedPatientForDetail(newPat);
      addToast('Saved Locally', `${newPat.name} saved in current session.`, 'info');
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
    const doc = doctors.find((d) => d.id === data.doctorId) || doctors[0] || {
      id: data.doctorId || 'doc-1',
      name: 'Duty Dental Surgeon',
      specialization: 'General Dentistry'
    };
    const generatedAptId = `APT-2026-${Math.floor(100000 + Math.random() * 900000)}`;

    let patient = patients.find(
      (p) => (p.phone && data.patientPhone && p.phone === data.patientPhone) || (p.name && data.patientName && p.name.toLowerCase() === data.patientName.toLowerCase())
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
    let updated: Appointment | undefined;
    setAppointments((prev) =>
      prev.map((a) => {
        if (a.id === appointmentId) {
          updated = { ...a, appointmentStatus: 'NO_SHOW', status: 'Cancelled' };
          return updated;
        }
        return a;
      })
    );
    if (updated) {
      saveAppointmentToDb(updated).catch(() => { });
    }
    apiClient.cancelAppointment(appointmentId, 'Marked as No-Show by reception desk').catch(() => { });
    notifyCrossTabSync();
    addToast('Marked No-Show', `Appointment ${appointmentId} marked as No-Show. No token was issued.`, 'warning');
  };

  const rescheduleAppointment = async (appointmentId: string, newDate: string, newTimeSlot: string, reason?: string): Promise<void> => {
    let updatedApt: Appointment | undefined;
    setAppointments((prev) =>
      prev.map((a) => {
        if (a.id === appointmentId) {
          updatedApt = {
            ...a,
            date: newDate,
            timeSlot: newTimeSlot,
            appointmentStatus: 'RESCHEDULED',
            status: 'Confirmed'
          };
          return updatedApt;
        }
        return a;
      })
    );
    if (updatedApt) {
      saveAppointmentToDb(updatedApt).catch(() => { });
    }
    try {
      await apiClient.rescheduleAppointment(appointmentId, newDate, newTimeSlot, reason);
      notifyCrossTabSync();
    } catch (e) {
      console.warn('Reschedule API sync warning:', e);
    }
    addToast('Appointment Rescheduled', `Rescheduled to ${newDate} at ${newTimeSlot}.`, 'success');
  };

  const cancelAppointment = async (appointmentId: string, reason?: string): Promise<void> => {
    let cancelledApt: Appointment | undefined;
    setAppointments((prev) =>
      prev.map((a) => {
        if (a.id === appointmentId) {
          cancelledApt = { ...a, appointmentStatus: 'CANCELLED', status: 'Cancelled' };
          return cancelledApt;
        }
        return a;
      })
    );
    if (cancelledApt) {
      saveAppointmentToDb(cancelledApt).catch(() => { });
    }
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
      const updated = [newEnquiry, ...prev.filter((e) => e.id !== newEnquiry.id)];
      safeSetItem('smilecare_enquiries_list', JSON.stringify(updated));
      return updated;
    });

    // Save directly to Supabase cloud database so any Receptionist device sees it instantly
    await saveEnquiryToDb(newEnquiry);

    // Also persist to backend JSON database asynchronously
    apiFetch('/api/enquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEnquiry)
    }).catch(() => { });

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

    updateEnquiryStatusInDb(id, status).catch(() => { });

    // Also update backend JSON database asynchronously
    apiFetch(`/api/enquiries/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    }).catch(() => { });

    notifyCrossTabSync();
  };

  const deleteEnquiry = async (id: string) => {
    setEnquiries((prev) => {
      const updated = prev.filter((e) => e.id !== id);
      safeSetItem('smilecare_enquiries_list', JSON.stringify(updated));
      return updated;
    });

    deleteEnquiryFromDb(id).catch(() => { });

    try {
      await apiFetch(`/api/enquiries/${id}`, { method: 'DELETE' });
    } catch { }

    notifyCrossTabSync();
    addToast('Enquiry Removed', 'The consultation request has been deleted.', 'info');
  };

  const clearAllEnquiries = async () => {
    setEnquiries([]);
    safeSetItem('smilecare_enquiries_list', JSON.stringify([]));

    clearAllEnquiriesFromDb().catch(() => { });

    try {
      await apiFetch('/api/enquiries', { method: 'DELETE' });
    } catch { }

    notifyCrossTabSync();
    addToast('Enquiries Cleared', 'All consultation requests have been cleared.', 'info');
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
    let result: { visit: ClinicVisit; token: QueueToken };
    try {
      result = await apiClient.checkInPatient(data);
    } catch (err: any) {
      if (err?.activeToken || err?.status === 409) {
        if (err?.activeToken) {
          setTokens((prev) => {
            const next = [...prev.filter((t) => t.id !== err.activeToken.id && t.tokenNumber !== err.activeToken.tokenNumber), err.activeToken];
            safeSetItem('smilecare_tokens_list', JSON.stringify(next));
            return next;
          });
        }
        addToast('Check-In Notice', err.message || 'Patient already has an active queue token for today.', 'danger');
        throw err;
      }

      // Offline / Static Deployment Fallback: Create locally in client state & Supabase
      const patient = patients.find((p) => p.id === data.patientId || p.opNumber === data.patientId);
      const todayStr = new Date().toISOString().split('T')[0];

      // Check if patient already has an active token today
      const activeExistingToken = tokens.find(
        (t) => t.patientId === data.patientId && t.date === todayStr &&
          ['Waiting', 'Called', 'In Consultation', 'Reception Follow-up'].includes(t.status)
      );

      if (activeExistingToken) {
        addToast('Check-In Notice', `Patient already has an active token (${activeExistingToken.tokenNumber}) for today.`, 'warning');
        return {
          visit: visits.find((v) => v.id === activeExistingToken.visitId) || {
            id: activeExistingToken.visitId || `vis-${Date.now()}`,
            patientId: data.patientId,
            patientName: patient?.name || 'Patient',
            opNumber: patient?.opNumber || 'OP-2026-00001',
            doctorId: data.doctorId,
            doctorName: patient?.assignedDoctorName || 'Consulting Doctor',
            visitDate: todayStr,
            status: 'Waiting'
          } as ClinicVisit,
          token: activeExistingToken
        };
      }

      const prefix = data.isWalkIn ? 'W' : 'A';
      const matchingTokens = tokens.filter((t) => t.date === todayStr && t.tokenNumber && t.tokenNumber.startsWith(prefix));
      let maxNum = 0;
      matchingTokens.forEach((t) => {
        const parts = t.tokenNumber.split('-');
        if (parts[1]) {
          const num = parseInt(parts[1], 10);
          if (!isNaN(num) && num > maxNum) maxNum = num;
        }
      });
      const tokenNumber = `${prefix}-${String(maxNum + 1).padStart(3, '0')}`;
      const visitId = `VIS-2026-${String(visits.length + 1).padStart(5, '0')}`;
      const nowIso = new Date().toISOString();
      const nowTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const doc = doctors.find((d) => d.id === data.doctorId);
      const doctorName = doc?.name || patient?.assignedDoctorName || 'Consulting Doctor';

      const fallbackVisit: ClinicVisit = {
        id: visitId,
        patientId: data.patientId,
        patientName: patient?.name || 'Patient',
        opNumber: patient?.opNumber || 'OP-2026-00001',
        patientPhone: patient?.phone || '',
        appointmentId: data.appointmentId,
        doctorId: data.doctorId || 'doc-1',
        doctorName,
        visitDate: todayStr,
        checkInTime: nowIso,
        status: 'Waiting',
        tokenId: tokenNumber,
        chairId: data.chairId,
        priority: data.priority || 'Normal',
        reasonForVisit: data.reasonForVisit || 'Consultation & Oral Examination',
        timeline: [
          {
            time: nowTimeStr,
            event: `Patient Checked In. Token ${tokenNumber} generated at reception desk.`,
            actor: 'Reception Desk'
          }
        ]
      };

      const fallbackToken: QueueToken = {
        id: `tok-${Date.now()}`,
        tokenNumber,
        patientId: data.patientId,
        patientName: patient?.name || 'Patient',
        patientPhone: patient?.phone || '',
        appointmentId: data.appointmentId,
        visitId,
        doctorId: data.doctorId || 'doc-1',
        doctorName,
        chairId: data.chairId,
        date: todayStr,
        status: 'Waiting',
        priority: data.priority || 'Normal',
        createdAt: nowIso,
        estimatedWaitMinutes: 15
      };

      result = { visit: fallbackVisit, token: fallbackToken };
    }

    setVisits((prev) => {
      const next = [result.visit, ...prev.filter((v) => v.id !== result.visit.id)];
      safeSetItem('smilecare_visits_list', JSON.stringify(next));
      return next;
    });

    setTokens((prev) => {
      const next = [...prev.filter((t) => t.id !== result.token.id && t.tokenNumber !== result.token.tokenNumber), result.token];
      safeSetItem('smilecare_tokens_list', JSON.stringify(next));
      return next;
    });

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
      (p) => (p.phone && data.patientPhone && p.phone === data.patientPhone) || (p.name && data.patientName && p.name.toLowerCase() === data.patientName.toLowerCase())
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
      saveTokenToDb(result.token).catch(() => { });
      if (result.visit) {
        setVisits((prev) =>
          prev.map((v) => (v.id === result.visit!.id ? result.visit! : v))
        );
      }
    } catch {
      // Local fallback for offline / serverless deployment
      const targetToken = tokens.find((t) => t.tokenNumber === tokenNumberOrId || t.id === tokenNumberOrId);
      if (targetToken) {
        const nowIso = new Date().toISOString();
        const updatedToken: QueueToken = {
          ...targetToken,
          status: 'Called',
          calledAt: nowIso,
          chairId: targetChair?.id,
          chairName: targetChair?.name
        };
        setTokens((prev) => {
          const next = prev.map((t) => (t.id === targetToken.id ? updatedToken : t));
          safeSetItem('smilecare_tokens_list', JSON.stringify(next));
          return next;
        });
        saveTokenToDb(updatedToken).catch(() => { });
      }
    }

    // Update chair
    if (targetChair) {
      const tok = tokens.find((t) => t.tokenNumber === tokenNumberOrId || t.id === tokenNumberOrId);
      setChairs((prev) =>
        prev.map((c) =>
          c.id === targetChair.id
            ? {
              ...c,
              status: 'Occupied',
              currentPatientName: tok?.patientName || 'Patient',
              currentToken: tok?.tokenNumber || tokenNumberOrId
            }
            : c
        )
      );
    }

    notifyCrossTabSync();
    addToast(`Calling Token ${tokenNumberOrId} 🔔`, `Please proceed to doctor's consulting room.`, 'info');
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
    let result: { visit: ClinicVisit; token?: QueueToken };
    const existingVisit = visits.find((v) => v.id === visitIdOrToken || v.tokenId === visitIdOrToken);
    const existingToken = tokens.find((t) => t.visitId === existingVisit?.id || t.tokenNumber === visitIdOrToken || t.id === visitIdOrToken);

    try {
      result = await apiClient.startConsultation(visitIdOrToken, {
        patientName: existingToken?.patientName || existingVisit?.patientName,
        patientId: existingToken?.patientId || existingVisit?.patientId,
        doctorId: existingToken?.doctorId || existingVisit?.doctorId,
        doctorName: existingToken?.doctorName || existingVisit?.doctorName,
        tokenNumber: existingToken?.tokenNumber || existingVisit?.tokenId || visitIdOrToken
      });
    } catch {
      // Local fallback for offline / serverless deployment
      const nowIso = new Date().toISOString();
      const nowTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const updatedVisit: ClinicVisit = existingVisit ? {
        ...existingVisit,
        status: 'In Consultation',
        consultationStartTime: nowIso,
        timeline: [
          ...(existingVisit.timeline || []),
          {
            time: nowTimeStr,
            event: `Consultation Started with ${existingVisit.doctorName}. Examination underway.`,
            actor: 'Doctor'
          }
        ]
      } : {
        id: visitIdOrToken,
        patientId: existingToken?.patientId || 'PAT-TEMP',
        patientName: existingToken?.patientName || 'Patient',
        opNumber: 'OP-TEMP',
        doctorId: existingToken?.doctorId || 'doc-1',
        doctorName: existingToken?.doctorName || 'Consulting Doctor',
        visitDate: nowIso.split('T')[0],
        checkInTime: nowIso,
        status: 'In Consultation',
        consultationStartTime: nowIso,
        tokenId: existingToken?.tokenNumber || visitIdOrToken
      };

      const updatedToken: QueueToken | undefined = existingToken ? {
        ...existingToken,
        status: 'In Consultation',
        consultationStartedAt: nowIso
      } : undefined;

      result = { visit: updatedVisit, token: updatedToken };
    }

    setVisits((prev) => {
      const next = prev.map((v) => (v.id === result.visit.id ? result.visit : v));
      if (!next.some((v) => v.id === result.visit.id)) next.unshift(result.visit);
      safeSetItem('smilecare_visits_list', JSON.stringify(next));
      return next;
    });

    if (result.token) {
      const existingToken = tokens.find(
        (t) => t.id === result.token!.id || t.tokenNumber === result.token!.tokenNumber || t.visitId === result.visit.id
      );
      const mergedToken: QueueToken = {
        ...(existingToken || {}),
        ...result.token,
        patientName: result.token.patientName || existingToken?.patientName || result.visit.patientName || 'Patient',
        patientId: result.token.patientId || existingToken?.patientId || result.visit.patientId || 'PAT-TEMP',
        doctorId: result.token.doctorId || existingToken?.doctorId || result.visit.doctorId || 'doc-1',
        doctorName: result.token.doctorName || existingToken?.doctorName || result.visit.doctorName || 'Doctor',
        tokenNumber: result.token.tokenNumber || existingToken?.tokenNumber || result.visit.tokenId || result.token.id,
        status: 'In Consultation',
        startedAt: result.token.startedAt || (result.token as any).consultationStartedAt || new Date().toISOString()
      };

      setTokens((prev) => {
        const next = prev.map((t) => (t.id === mergedToken.id || t.tokenNumber === mergedToken.tokenNumber ? mergedToken : t));
        if (!next.some((t) => t.id === mergedToken.id || t.tokenNumber === mergedToken.tokenNumber)) {
          next.unshift(mergedToken);
        }
        safeSetItem('smilecare_tokens_list', JSON.stringify(next));
        return next;
      });
      saveTokenToDb(mergedToken).catch(() => { });
    }

    const pat = patients.find((p) => p.id === result.visit.patientId);
    if (pat) {
      setSelectedPatientForDetail(pat);
    }

    notifyCrossTabSync();
    addToast('Consultation Started 🩺', `Doctor is examining patient in consultation suite.`, 'success');
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
      tokenNumber?: string;
      tokenId?: string;
      patientId?: string;
      patientName?: string;
      doctorId?: string;
      doctorName?: string;
    }
  ): Promise<void> => {
    const nowIso = new Date().toISOString();
    const nowTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. Resolve matching visit robustly
    const existingVisit = visits.find((v) =>
      v.id === visitIdOrToken ||
      v.tokenId === visitIdOrToken ||
      (summary?.tokenNumber && v.tokenId === summary.tokenNumber) ||
      (summary?.patientId && v.patientId === summary.patientId && (v.status === 'In Consultation' || v.status === 'Called'))
    );

    // 2. Resolve matching tokens to update to 'Reception Follow-up'
    const matchingTokens = tokens.filter((t) =>
      t.status !== 'Completed' && t.status !== 'Cancelled' && (
        t.id === visitIdOrToken ||
        t.tokenNumber === visitIdOrToken ||
        (summary?.tokenNumber && t.tokenNumber === summary.tokenNumber) ||
        (summary?.tokenId && t.id === summary.tokenId) ||
        (existingVisit && (t.visitId === existingVisit.id || t.tokenNumber === existingVisit.tokenId)) ||
        (summary?.patientId && t.patientId === summary.patientId && (t.status === 'In Consultation' || t.status === 'Called')) ||
        (existingVisit?.patientId && t.patientId === existingVisit.patientId && (t.status === 'In Consultation' || t.status === 'Called'))
      )
    );

    const primaryToken = matchingTokens[0];
    const targetTokenNumber = primaryToken?.tokenNumber || summary?.tokenNumber || existingVisit?.tokenId || (visitIdOrToken.startsWith('W-') || visitIdOrToken.startsWith('T-') ? visitIdOrToken : undefined);
    const targetTokenId = primaryToken?.id || summary?.tokenId;
    const targetPatientId = primaryToken?.patientId || existingVisit?.patientId || summary?.patientId;
    const targetPatientName = primaryToken?.patientName || existingVisit?.patientName || summary?.patientName;
    const targetDoctorId = primaryToken?.doctorId || existingVisit?.doctorId || summary?.doctorId;
    const targetDoctorName = primaryToken?.doctorName || existingVisit?.doctorName || summary?.doctorName;

    let result: { visit: ClinicVisit; token?: QueueToken };
    try {
      result = await apiClient.completeConsultation({
        visitId: existingVisit?.id || visitIdOrToken,
        tokenId: targetTokenId,
        tokenNumber: targetTokenNumber,
        patientId: targetPatientId,
        patientName: targetPatientName,
        doctorId: targetDoctorId,
        doctorName: targetDoctorName,
        chiefComplaint: summary?.notes,
        diagnosis: summary?.diagnosis || 'Clinical Dental Evaluation Completed',
        clinicalFindings: summary?.clinicalFindings || 'Examination complete.',
        treatmentPerformed: summary?.treatmentPlan || 'Consultation & Procedure Completed',
        doctorNotes: summary?.notes || '',
        followUpDate: summary?.followUpDate,
        followUpReason: summary?.followUpReason
      });
    } catch {
      // Local Fallback:
      const updatedVisit: ClinicVisit = existingVisit ? {
        ...existingVisit,
        status: 'Reception Follow-up',
        consultationEndTime: nowIso,
        chiefComplaint: summary?.notes || existingVisit.chiefComplaint,
        diagnosis: summary?.diagnosis || existingVisit.diagnosis || 'Clinical Dental Evaluation Completed',
        clinicalFindings: summary?.clinicalFindings || existingVisit.clinicalFindings || 'Examination complete.',
        treatmentPerformed: summary?.treatmentPlan || existingVisit.treatmentPerformed || 'Consultation & Procedure Completed',
        doctorNotes: summary?.notes || existingVisit.doctorNotes || '',
        followUpDate: summary?.followUpDate || existingVisit.followUpDate,
        followUpReason: summary?.followUpReason || existingVisit.followUpReason,
        timeline: [
          ...(existingVisit.timeline || []),
          {
            time: nowTimeStr,
            event: `Consultation Finalized. Diagnosis: ${summary?.diagnosis || 'Dental Evaluation Completed'}. Ready for Reception Checkout.`,
            actor: 'Doctor'
          }
        ]
      } : {
        id: visitIdOrToken,
        patientId: targetPatientId || 'PAT-TEMP',
        patientName: targetPatientName || 'Patient',
        opNumber: 'OP-TEMP',
        doctorId: targetDoctorId || 'doc-1',
        doctorName: targetDoctorName || 'Consulting Doctor',
        visitDate: nowIso.split('T')[0],
        status: 'Reception Follow-up',
        consultationEndTime: nowIso,
        diagnosis: summary?.diagnosis || 'Clinical Dental Evaluation Completed'
      };

      const updatedToken: QueueToken | undefined = primaryToken ? {
        ...primaryToken,
        status: 'Reception Follow-up',
        completedAt: nowIso
      } : undefined;

      result = { visit: updatedVisit, token: updatedToken };
    }

    setVisits((prev) => {
      // Update matching visits to Reception Follow-up
      let matched = false;
      const next = prev.map((v) => {
        const isMatch =
          v.id === result.visit.id ||
          (existingVisit && v.id === existingVisit.id) ||
          (targetPatientId && v.patientId === targetPatientId && (v.status === 'In Consultation' || v.status === 'Called' || v.status === 'Reception Follow-up'));
        if (isMatch) { matched = true; return { ...v, ...result.visit, status: 'Reception Follow-up' as const }; }
        return v;
      });
      // If no existing visit was matched/updated, insert the result visit so StaffCheckIn can see it
      if (!matched && result.visit.patientId && result.visit.patientId !== 'PAT-TEMP') {
        next.unshift({ ...result.visit, status: 'Reception Follow-up' as const });
      }
      safeSetItem('smilecare_visits_list', JSON.stringify(next));
      return next;
    });

    if (result.token) {
      // Build the canonical merged token, preferring the real local token's id/tokenNumber
      const mergedToken: QueueToken = {
        ...(primaryToken || {}),
        ...result.token,
        // Always keep the real local identifiers so we don't create a phantom new entry
        id: primaryToken?.id || targetTokenId || result.token.id,
        tokenNumber: primaryToken?.tokenNumber || targetTokenNumber || result.token.tokenNumber,
        patientName: targetPatientName || result.token.patientName || 'Patient',
        patientId: targetPatientId || result.token.patientId || 'PAT-TEMP',
        doctorId: targetDoctorId || result.token.doctorId || 'doc-1',
        doctorName: targetDoctorName || result.token.doctorName || 'Doctor',
        status: 'Reception Follow-up',
        completedAt: result.token.completedAt || nowIso
      };

      setTokens((prev) => {
        // De-duplicate: replace all matching tokens (by id OR tokenNumber) with the merged one
        const updatedIds = new Set<string>();
        const next = prev.map((t) => {
          const isMatch =
            (primaryToken && (t.id === primaryToken.id || t.tokenNumber === primaryToken.tokenNumber)) ||
            matchingTokens.some((mt) => mt.id === t.id || mt.tokenNumber === t.tokenNumber) ||
            t.id === mergedToken.id ||
            t.tokenNumber === mergedToken.tokenNumber;
          if (isMatch) {
            if (!updatedIds.has(mergedToken.id)) {
              updatedIds.add(mergedToken.id);
              return mergedToken;
            }
            // Skip duplicate — filter it out by returning null, then we filter below
            return null;
          }
          return t;
        }).filter(Boolean) as typeof prev;

        if (!next.some((t) => t.id === mergedToken.id || t.tokenNumber === mergedToken.tokenNumber)) {
          next.unshift(mergedToken);
        }
        safeSetItem('smilecare_tokens_list', JSON.stringify(next));
        return next;
      });

      // Persist to Supabase
      saveTokenToDb(mergedToken).catch(() => { });
    }

    // Persist all matching tokens to Supabase
    matchingTokens.forEach((tok) => {
      const updatedTok: QueueToken = {
        ...tok,
        status: 'Reception Follow-up',
        completedAt: nowIso
      };
      saveTokenToDb(updatedTok).catch(() => { });
    });

    // Free chair
    setChairs((prev) =>
      prev.map((c) =>
        c.currentToken === visitIdOrToken || (targetTokenNumber && c.currentToken === targetTokenNumber) || (result.token && c.currentToken === result.token.tokenNumber)
          ? { ...c, status: 'Available', currentPatientName: undefined, currentToken: undefined }
          : c
      )
    );

    // Refresh patients list to include updated clinical notes and followups
    await refreshState();
    notifyCrossTabSync();
    addToast('Consultation Finalized! ✓', 'Patient transferred to Reception Desk for payment and checkout.', 'success');
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
    feeApprovalId?: string;
    isNewFee?: boolean;
  }): Promise<{ feeApproval: FeeApprovalRecord; invoice: Invoice; visit?: ClinicVisit }> => {
    let result: { feeApproval: FeeApprovalRecord; invoice: Invoice; visit?: ClinicVisit };
    try {
      result = await apiClient.approveFee(data);
    } catch {
      // Local fallback for offline / serverless deployment
      const patient = patients.find((p) => p.id === data.patientId || p.opNumber === data.patientOpNumber);
      const subtotal = data.items.reduce((s, it) => s + (it.quantity * it.unitPrice), 0) + (data.consultationFee || 0);
      let discountAmount = 0;
      if (data.discountType === 'percentage' && data.discountValue) {
        discountAmount = (subtotal * data.discountValue) / 100;
      } else if (data.discountType === 'amount' && data.discountValue) {
        discountAmount = data.discountValue;
      }
      const taxable = Math.max(0, subtotal - discountAmount);
      const taxAmount = (taxable * (data.taxRate || 0)) / 100;
      const total = Math.round(taxable + taxAmount);
      const nowIso = new Date().toISOString();

      const existingInv = !data.isNewFee
        ? invoices.find((i) => i.visitId === data.visitId || (data.feeApprovalId && i.feeApprovalId === data.feeApprovalId))
        : undefined;

      const invoiceId = existingInv ? existingInv.id : `INV-2026-${String(invoices.length + 1).padStart(4, '0')}`;

      const existingFA = !data.isNewFee
        ? feeApprovals.find((fa) => fa.id === data.feeApprovalId || fa.visitId === data.visitId)
        : undefined;

      const feeApprovalId = data.feeApprovalId || existingFA?.id || `FA-2026-${String(feeApprovals.length + 1).padStart(4, '0')}`;
      const feeApproval: FeeApprovalRecord = {
        id: feeApprovalId,
        visitId: data.visitId,
        patientId: data.patientId || patient?.id || 'PAT-TEMP',
        patientName: data.patientName || patient?.name || 'Patient',
        patientOpNumber: data.patientOpNumber || patient?.opNumber || 'OP-TEMP',
        doctorId: data.doctorId || 'doc-1',
        doctorName: data.doctorName || patient?.assignedDoctorName || 'Consulting Doctor',
        date: nowIso.split('T')[0],
        consultationFee: data.consultationFee || 0,
        items: data.items,
        discountType: data.discountType || 'amount',
        discountValue: data.discountValue || 0,
        discountReason: data.discountReason || '',
        subtotal,
        discountAmount,
        total,
        approvedBy: data.doctorName || 'Doctor',
        status: 'Approved'
      };

      const invoice: Invoice = {
        id: invoiceId,
        visitId: data.visitId,
        patientId: data.patientId || patient?.id || 'PAT-TEMP',
        patientName: data.patientName || patient?.name || 'Patient',
        patientOpNumber: data.patientOpNumber || patient?.opNumber || 'OP-TEMP',
        doctorName: data.doctorName || patient?.assignedDoctorName || 'Consulting Doctor',
        date: nowIso.split('T')[0],
        feeApprovalId,
        items: data.items.map((it, idx) => ({
          id: `item-${idx}`,
          serviceId: `srv-${idx}`,
          serviceName: it.description,
          category: 'Procedure',
          unitPrice: it.unitPrice,
          quantity: it.quantity,
          discount: 0,
          total: it.quantity * it.unitPrice
        })),
        subtotal,
        discount: discountAmount,
        discountReason: data.discountReason || '',
        tax: taxAmount,
        total,
        paidAmount: existingInv?.paidAmount || existingInv?.paid || 0,
        balance: Math.max(0, total - (existingInv?.paidAmount || existingInv?.paid || 0)),
        status: (existingInv?.paidAmount || existingInv?.paid || 0) >= total ? 'Paid' : ((existingInv?.paidAmount || existingInv?.paid || 0) > 0 ? 'Partially Paid' : 'Unpaid'),
        payments: existingInv?.payments || []
      };

      result = { feeApproval, invoice };
    }

    const patient = patients.find((p) => p.id === data.patientId);
    const enrichedInvoice: Invoice = {
      ...result.invoice,
      patientId: result.invoice.patientId || data.patientId,
      patientName: result.invoice.patientName || (data as any).patientName || patient?.name || 'Patient',
      doctorName: result.invoice.doctorName || (data as any).doctorName || 'Consulting Doctor',
      subtotal: result.invoice.subtotal || result.invoice.total || 0,
      total: result.invoice.total || 0,
      balance: result.invoice.balance !== undefined ? result.invoice.balance : result.invoice.total || 0
    };
    result.invoice = enrichedInvoice;

    setFeeApprovals((prev) => [result.feeApproval, ...prev.filter((fa) => fa.id !== result.feeApproval.id && fa.visitId !== result.feeApproval.visitId)]);
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
            outstandingBalance: updatedInvoices.reduce((sum, inv) => sum + (inv.balance || 0), 0),
            visits: result.visit ? [result.visit, ...(p.visits || []).filter((v) => v.id !== result.visit!.id)] : p.visits
          };
        }
        return p;
      })
    );

    // Also immediately update selectedPatientForDetail so PatientProfileView updates seamlessly
    setSelectedPatientForDetail((curr) => {
      if (!curr) return null;
      if (curr.id === result.invoice.patientId || (curr.opNumber && curr.opNumber === result.invoice.patientOpNumber)) {
        const updatedInvoices = [result.invoice, ...(curr.invoices || []).filter((i) => i.id !== result.invoice.id)];
        return {
          ...curr,
          invoices: updatedInvoices,
          outstandingBalance: updatedInvoices.reduce((sum, inv) => sum + (inv.balance || 0), 0),
          feeApprovals: [result.feeApproval, ...(curr.feeApprovals || []).filter((fa) => fa.id !== result.feeApproval.id && fa.visitId !== result.feeApproval.visitId)],
          visits: result.visit ? [result.visit, ...(curr.visits || []).filter((v) => v.id !== result.visit!.id)] : curr.visits
        };
      }
      return curr;
    });

    notifyCrossTabSync();
    // Persist invoice to Supabase so it survives page reload
    saveInvoiceToDb(result.invoice).catch(() => { });
    addToast('Fees Approved & Invoiced 📄', `Doctor approved ₹${result.invoice.total} for ${result.invoice.patientName}.`, 'success');
    return result;
  };

  // CREATE DIGITAL PRESCRIPTION
  const createPrescription = async (data: {
    visitId: string;
    patientId: string;
    patientName?: string;
    patientOpNumber?: string;
    doctorId?: string;
    doctorName?: string;
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
    let result: { prescription: PrescriptionRecord; visit?: ClinicVisit };
    try {
      result = await apiClient.createPrescription(data);
    } catch {
      // Local fallback for offline / serverless
      const patient = patients.find((p) => p.id === data.patientId);
      const visit = visits.find((v) => v.id === data.visitId);
      const nowIso = new Date().toISOString();
      const rxId = `RX-2026-${String(prescriptions.length + 1).padStart(4, '0')}`;
      const prescription: PrescriptionRecord = {
        id: rxId,
        visitId: data.visitId,
        patientId: data.patientId,
        patientName: data.patientName || patient?.name || 'Patient',
        patientOpNumber: data.patientOpNumber || patient?.opNumber || 'OP-TEMP',
        doctorId: data.doctorId || visit?.doctorId || 'doc-1',
        doctorName: data.doctorName || visit?.doctorName || 'Consulting Doctor',
        date: nowIso.split('T')[0],
        diagnosis: data.diagnosis || visit?.diagnosis || 'Dental Examination',
        doctorNotes: data.doctorNotes || '',
        items: data.items.map((it, idx) => ({
          id: `item-${idx}`,
          medicine: it.medicine,
          dosage: it.dosage,
          route: it.route || 'Oral',
          frequency: it.frequency,
          duration: it.duration,
          instructions: it.instructions
        })),
        followUpDate: data.followUpDate
      };

      const updatedVisit: ClinicVisit | undefined = visit ? {
        ...visit,
        prescriptionRecord: prescription,
        prescriptions: [
          ...(visit.prescriptions || []),
          ...data.items.map((it) => `${it.medicine} ${it.dosage} - ${it.frequency}`)
        ]
      } : undefined;

      result = { prescription, visit: updatedVisit };
    }

    // Ensure prescription has all vital metadata non-null
    const patient = patients.find((p) => p.id === data.patientId);
    const visit = visits.find((v) => v.id === data.visitId);
    const enrichedPrescription: PrescriptionRecord = {
      ...result.prescription,
      patientId: result.prescription.patientId || data.patientId,
      patientName: result.prescription.patientName || data.patientName || patient?.name || 'Patient',
      patientOpNumber: result.prescription.patientOpNumber || data.patientOpNumber || patient?.opNumber || 'OP-TEMP',
      doctorId: result.prescription.doctorId || data.doctorId || visit?.doctorId || 'doc-1',
      doctorName: result.prescription.doctorName || data.doctorName || visit?.doctorName || 'Consulting Doctor',
      diagnosis: result.prescription.diagnosis || data.diagnosis || visit?.diagnosis || 'Dental Examination',
      doctorNotes: result.prescription.doctorNotes || data.doctorNotes || '',
      followUpDate: result.prescription.followUpDate || data.followUpDate
    };
    result.prescription = enrichedPrescription;

    setPrescriptions((prev) => {
      const next = [result.prescription, ...prev.filter((p) => p.id !== result.prescription.id)];
      safeSetItem('smilecare_prescriptions_list', JSON.stringify(next));
      return next;
    });
    if (result.visit) {
      setVisits((prev) => [result.visit!, ...prev.filter((v) => v.id !== result.visit!.id)]);
    }

    // Update patient in state
    setPatients((prev) =>
      prev.map((p) =>
        p.id === data.patientId || (p.opNumber && p.opNumber === result.prescription.patientOpNumber)
          ? {
            ...p,
            prescriptions: [result.prescription, ...(p.prescriptions || []).filter((rx) => rx.id !== result.prescription.id)],
            visits: result.visit ? [result.visit, ...(p.visits || []).filter((v) => v.id !== result.visit!.id)] : p.visits
          }
          : p
      )
    );

    // Also immediately update selectedPatientForDetail so PatientProfileView re-renders
    setSelectedPatientForDetail((curr) => {
      if (!curr) return null;
      if (curr.id === data.patientId || (curr.opNumber && curr.opNumber === result.prescription.patientOpNumber)) {
        return {
          ...curr,
          prescriptions: [result.prescription, ...(curr.prescriptions || []).filter((rx) => rx.id !== result.prescription.id)],
          visits: result.visit ? [result.visit, ...(curr.visits || []).filter((v) => v.id !== result.visit!.id)] : curr.visits
        };
      }
      return curr;
    });

    notifyCrossTabSync();
    if (result.prescription) {
      savePrescriptionToDb(result.prescription).catch((e) => console.warn('Supabase Rx save warning:', e));
    }

    // Update local medicines catalog with newly prescribed items
    if (data.items && data.items.length > 0) {
      setMedicines((prev) => {
        const map = new Map<string, MedicineRecord>();
        prev.forEach((m) => map.set(m.name.toLowerCase().trim(), m));
        data.items.forEach((it) => {
          if (it.medicine && it.medicine.trim()) {
            const key = it.medicine.toLowerCase().trim();
            if (!map.has(key)) {
              map.set(key, {
                id: `med-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                name: it.medicine.trim(),
                dosage: it.dosage,
                route: it.route || 'Oral',
                frequency: it.frequency,
                duration: it.duration,
                instructions: it.instructions
              });
            }
          }
        });
        return Array.from(map.values());
      });
    }

    addToast('Prescription Saved 💊', `Digital Rx ${result.prescription.id} generated. Ready to print.`, 'success');
    return result;
  };

  const updatePrescription = async (
    id: string,
    data: {
      patientName?: string;
      patientOpNumber?: string;
      doctorId?: string;
      doctorName?: string;
      patientId?: string;
      items: Array<{
        id?: string;
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
    }
  ): Promise<{ prescription: PrescriptionRecord; visit?: ClinicVisit }> => {
    let result: { prescription: PrescriptionRecord; visit?: ClinicVisit };
    try {
      result = await apiClient.updatePrescription(id, data);
    } catch {
      const existing = prescriptions.find((p) => p.id === id);
      const updatedPrescription: PrescriptionRecord = existing ? {
        ...existing,
        patientName: data.patientName || existing.patientName || 'Patient',
        patientOpNumber: data.patientOpNumber || existing.patientOpNumber || 'OP-TEMP',
        doctorId: data.doctorId || existing.doctorId || 'doc-1',
        doctorName: data.doctorName || existing.doctorName || 'Consulting Doctor',
        diagnosis: data.diagnosis !== undefined ? data.diagnosis : existing.diagnosis,
        doctorNotes: data.doctorNotes !== undefined ? data.doctorNotes : existing.doctorNotes,
        followUpDate: data.followUpDate !== undefined ? data.followUpDate : existing.followUpDate,
        items: data.items.map((it, idx) => ({
          id: it.id || `item-${idx}`,
          medicine: it.medicine,
          dosage: it.dosage,
          route: it.route || 'Oral',
          frequency: it.frequency,
          duration: it.duration,
          instructions: it.instructions
        }))
      } : {
        id,
        visitId: 'VIS-TEMP',
        patientId: data.patientId || 'PAT-TEMP',
        patientName: data.patientName || 'Patient',
        patientOpNumber: data.patientOpNumber || 'OP-TEMP',
        doctorId: data.doctorId || 'doc-1',
        doctorName: data.doctorName || 'Consulting Doctor',
        date: new Date().toISOString().split('T')[0],
        diagnosis: data.diagnosis || 'Clinical Dental Evaluation',
        doctorNotes: data.doctorNotes || '',
        items: data.items.map((it, idx) => ({
          id: it.id || `item-${idx}`,
          medicine: it.medicine,
          dosage: it.dosage,
          route: it.route || 'Oral',
          frequency: it.frequency,
          duration: it.duration,
          instructions: it.instructions
        })),
        followUpDate: data.followUpDate
      };
      result = { prescription: updatedPrescription };
    }

    const existing = prescriptions.find((p) => p.id === id);
    const enrichedPrescription: PrescriptionRecord = {
      ...result.prescription,
      patientId: result.prescription.patientId || data.patientId || existing?.patientId || 'PAT-TEMP',
      patientName: result.prescription.patientName || data.patientName || existing?.patientName || 'Patient',
      patientOpNumber: result.prescription.patientOpNumber || data.patientOpNumber || existing?.patientOpNumber || 'OP-TEMP',
      doctorId: result.prescription.doctorId || data.doctorId || existing?.doctorId || 'doc-1',
      doctorName: result.prescription.doctorName || data.doctorName || existing?.doctorName || 'Consulting Doctor',
      diagnosis: result.prescription.diagnosis || data.diagnosis || existing?.diagnosis || 'Dental Examination',
      doctorNotes: result.prescription.doctorNotes || data.doctorNotes || existing?.doctorNotes || '',
      followUpDate: result.prescription.followUpDate || data.followUpDate || existing?.followUpDate
    };
    result.prescription = enrichedPrescription;

    setPrescriptions((prev) => {
      const next = prev.map((p) => (p.id === id ? result.prescription : p));
      safeSetItem('smilecare_prescriptions_list', JSON.stringify(next));
      return next;
    });

    // Update patient state
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id === result.prescription.patientId || (p.opNumber && p.opNumber === result.prescription.patientOpNumber)) {
          return {
            ...p,
            prescriptions: (p.prescriptions || []).map((rx) => (rx.id === id ? result.prescription : rx)),
            visits: result.visit ? (p.visits || []).map((v) => (v.id === result.visit!.id ? result.visit! : v)) : p.visits
          };
        }
        return p;
      })
    );

    // Also update selectedPatientForDetail
    setSelectedPatientForDetail((curr) => {
      if (!curr) return null;
      if (curr.id === result.prescription.patientId || (curr.opNumber && curr.opNumber === result.prescription.patientOpNumber)) {
        return {
          ...curr,
          prescriptions: (curr.prescriptions || []).map((rx) => (rx.id === id ? result.prescription : rx)),
          visits: result.visit ? (curr.visits || []).map((v) => (v.id === result.visit!.id ? result.visit! : v)) : curr.visits
        };
      }
      return curr;
    });

    // Update visit state
    if (result.visit) {
      setVisits((prev) => prev.map((v) => (v.id === result.visit!.id ? result.visit! : v)));
    }

    notifyCrossTabSync();
    if (result.prescription) {
      savePrescriptionToDb(result.prescription).catch((e) => console.warn('Supabase Rx save warning:', e));
    }

      // Update local medicines catalog with newly prescribed items
      if (data.items && data.items.length > 0) {
        setMedicines((prev) => {
          const map = new Map<string, MedicineRecord>();
          prev.forEach((m) => map.set(m.name.toLowerCase().trim(), m));
          data.items.forEach((it) => {
            if (it.medicine && it.medicine.trim()) {
              const key = it.medicine.toLowerCase().trim();
              if (!map.has(key)) {
                map.set(key, {
                  id: `med-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                  name: it.medicine.trim(),
                  dosage: it.dosage,
                  route: it.route || 'Oral',
                  frequency: it.frequency,
                  duration: it.duration,
                  instructions: it.instructions
                });
              }
            }
          });
          return Array.from(map.values());
        });
      }

      addToast('Prescription Updated ℞', `Prescription ${id} updated successfully.`, 'success');
      return result;
  };

  const deletePrescription = async (id: string): Promise<void> => {
    try {
      await apiClient.deletePrescription(id);
    } catch {
      // Local fallback for offline / serverless
    }
    setPrescriptions((prev) => {
      const next = prev.filter((p) => p.id !== id);
      safeSetItem('smilecare_prescriptions_list', JSON.stringify(next));
      return next;
    });

    setPatients((prev) =>
      prev.map((p) => ({
        ...p,
        prescriptions: (p.prescriptions || []).filter((rx) => rx.id !== id)
      }))
    );

    setVisits((prev) =>
      prev.map((v) => {
        if (v.prescriptionRecord?.id === id) {
          return {
            ...v,
            prescriptionRecord: undefined,
            prescriptions: undefined
          };
        }
        return v;
      })
    );

    notifyCrossTabSync();
    deletePrescriptionFromDb(id).catch((e) => console.warn('Supabase Rx delete warning:', e));
    addToast('Prescription Deleted 🗑️', `Prescription ${id} deleted.`, 'info');
  };

  const saveMedicine = async (medData: Partial<MedicineRecord>): Promise<MedicineRecord> => {
    try {
      const res = await apiClient.saveMedicine(medData);
      setMedicines((prev) => {
        const filtered = prev.filter(
          (m) => m.name.toLowerCase().trim() !== res.medicine.name.toLowerCase().trim()
        );
        return [...filtered, res.medicine];
      });
      return res.medicine;
    } catch (err: any) {
      console.error('Failed to save medicine to database:', err);
      throw err;
    }
  };

  // RECEPTIONIST CLOSES VISIT (CHECKOUT & ENCOUNTER CLOSURE)
  const closeVisit = async (
    visitId: string, 
    adminNotes?: string,
    meta?: {
      patientId?: string;
      patientName?: string;
      tokenId?: string;
      tokenNumber?: string;
      doctorId?: string;
      doctorName?: string;
    }
  ): Promise<void> => {
    const nowIso = new Date().toISOString();
    const todayStr = nowIso.split('T')[0];

    // Find the existing visit or synthesized visit
    const existingVisit = visits.find((v) => 
      v.id === visitId || 
      (meta?.tokenId && v.tokenId === meta.tokenId) ||
      (meta?.patientId && v.patientId === meta.patientId && v.status !== 'Completed')
    );

    let result: { visit: ClinicVisit; token?: QueueToken };
    try {
      result = await apiClient.closeVisit(visitId, adminNotes, meta);
    } catch {
      result = {
        visit: {
          id: existingVisit?.id || visitId,
          patientId: existingVisit?.patientId || meta?.patientId || 'PAT-TEMP',
          patientName: existingVisit?.patientName || meta?.patientName || 'Patient',
          opNumber: existingVisit?.opNumber || 'OP-TEMP',
          doctorId: existingVisit?.doctorId || meta?.doctorId || 'doc-1',
          doctorName: existingVisit?.doctorName || meta?.doctorName || 'Consulting Doctor',
          visitDate: existingVisit?.visitDate || todayStr,
          checkInTime: existingVisit?.checkInTime || nowIso,
          status: 'Completed',
          checkoutTime: nowIso,
          adminNotes: adminNotes || existingVisit?.adminNotes
        }
      };
    }

    const patientId = meta?.patientId || existingVisit?.patientId || result.visit?.patientId;
    const patientName = meta?.patientName || existingVisit?.patientName || result.visit?.patientName;
    const targetTokenId = meta?.tokenId || meta?.tokenNumber || existingVisit?.tokenId;

    // 1. Build completed visit record preserving clinical history
    const completedVisit: ClinicVisit = {
      ...(existingVisit || {}),
      ...(result.visit || {}),
      id: existingVisit?.id || result.visit?.id || visitId,
      patientId: patientId || 'PAT-TEMP',
      patientName: patientName || 'Patient',
      doctorId: result.visit?.doctorId || existingVisit?.doctorId || meta?.doctorId || 'doc-1',
      doctorName: result.visit?.doctorName || existingVisit?.doctorName || meta?.doctorName || 'Consulting Doctor',
      tokenId: targetTokenId || existingVisit?.tokenId,
      status: 'Completed',
      checkoutTime: nowIso,
      adminNotes: adminNotes || existingVisit?.adminNotes
    };

    // Update visits state and persistent storage
    setVisits((prev) => {
      const exists = prev.some((v) => v.id === completedVisit.id || (targetTokenId && v.tokenId === targetTokenId));
      const next = exists
        ? prev.map((v) => (v.id === completedVisit.id || (targetTokenId && v.tokenId === targetTokenId) ? completedVisit : v))
        : [completedVisit, ...prev];
      safeSetItem('smilecare_visits_list', JSON.stringify(next));
      return next;
    });

    // 2. Identify and complete all matching tokens for this patient encounter
    const tokensToComplete = tokens.filter((t) =>
      t.status !== 'Completed' && (
        t.visitId === visitId ||
        t.visitId === completedVisit.id ||
        (targetTokenId && (t.tokenNumber === targetTokenId || t.id === targetTokenId)) ||
        (patientId && t.patientId === patientId) ||
        (patientName && t.patientName && t.patientName.toLowerCase() === patientName.toLowerCase())
      )
    );

    if (tokensToComplete.length === 0 && result.token) {
      tokensToComplete.push(result.token);
    }

    // Update tokens state and localStorage
    setTokens((prev) => {
      const next = prev.map((t) => {
        const isMatch = tokensToComplete.some((tc) => tc.id === t.id || tc.tokenNumber === t.tokenNumber);
        if (isMatch) {
          return {
            ...t,
            status: 'Completed' as TokenStatus,
            completedAt: nowIso
          };
        }
        return t;
      });
      safeSetItem('smilecare_tokens_list', JSON.stringify(next));
      return next;
    });

    // Persist completed tokens to Supabase
    tokensToComplete.forEach((t) => {
      const updatedToken: QueueToken = {
        ...t,
        status: 'Completed',
        completedAt: nowIso
      };
      saveTokenToDb(updatedToken).catch(() => { });
    });

    // 3. Update Patient record: totalVisits + 1, lastVisit = today
    if (patientId) {
      setPatients((prev) => {
        const next = prev.map((p) => {
          if (p.id === patientId || (patientName && p.name.toLowerCase() === patientName.toLowerCase())) {
            return {
              ...p,
              totalVisits: (p.totalVisits || 0) + 1,
              lastVisit: todayStr,
              status: p.status === 'New Patient' ? ('Active Treatment' as const) : p.status
            };
          }
          return p;
        });
        safeSetItem('smilecare_patients_list', JSON.stringify(next));
        return next;
      });
    }

    // 4. Free any dental chairs occupied by this visit / token
    setChairs((prev) =>
      prev.map((c) => {
        const matchesChair = 
          (targetTokenId && c.currentToken === targetTokenId) ||
          tokensToComplete.some((tc) => tc.tokenNumber === c.currentToken || tc.id === c.currentToken);
        if (matchesChair) {
          const updatedChair: DentalChair = {
            ...c,
            status: 'Available',
            currentToken: undefined
          };
          saveChairToDb(updatedChair).catch(() => { });
          return updatedChair;
        }
        return c;
      })
    );

    notifyCrossTabSync();
    addToast('Checkout Complete! 👋', `Encounter closed for ${completedVisit.patientName}.`, 'success');
  };

  const holdToken = async (tokenNumberOrId: string): Promise<void> => {
    try {
      const result = await apiClient.holdToken(tokenNumberOrId);
      setTokens((prev) =>
        prev.map((t) => (t.id === result.token.id || t.tokenNumber === tokenNumberOrId ? result.token : t))
      );
      saveTokenToDb(result.token).catch(() => { });
    } catch {
      // Local fallback
      setTokens((prev) => {
        const next = prev.map((t) =>
          t.id === tokenNumberOrId || t.tokenNumber === tokenNumberOrId
            ? { ...t, status: 'Hold' as TokenStatus }
            : t
        );
        safeSetItem('smilecare_tokens_list', JSON.stringify(next));
        const updated = next.find((t) => t.id === tokenNumberOrId || t.tokenNumber === tokenNumberOrId);
        if (updated) saveTokenToDb(updated).catch(() => { });
        return next;
      });
    }
    notifyCrossTabSync();
    addToast('Token Placed on Hold', `Token ${tokenNumberOrId} placed on hold.`, 'warning');
  };

  const skipToken = async (tokenNumberOrId: string, reason?: string): Promise<void> => {
    try {
      const result = await apiClient.skipToken(tokenNumberOrId, reason);
      setTokens((prev) =>
        prev.map((t) => (t.id === result.token.id || t.tokenNumber === tokenNumberOrId ? result.token : t))
      );
      saveTokenToDb(result.token).catch(() => { });
    } catch {
      // Local fallback
      setTokens((prev) => {
        const next = prev.map((t) =>
          t.id === tokenNumberOrId || t.tokenNumber === tokenNumberOrId
            ? { ...t, status: 'Skipped' as TokenStatus }
            : t
        );
        safeSetItem('smilecare_tokens_list', JSON.stringify(next));
        const updated = next.find((t) => t.id === tokenNumberOrId || t.tokenNumber === tokenNumberOrId);
        if (updated) saveTokenToDb(updated).catch(() => { });
        return next;
      });
    }
    notifyCrossTabSync();
    addToast('Token Skipped', `Token ${tokenNumberOrId} was skipped.`, 'warning');
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
      completeConsultation(current.visitId || current.tokenNumber, {
        tokenNumber: current.tokenNumber,
        tokenId: current.id,
        patientId: current.patientId,
        patientName: current.patientName,
        doctorId: current.doctorId,
        doctorName: current.doctorName
      });
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

  const sendWhatsApp = (reminderId: string, openExternal: boolean = true) => {
    const target = reminders.find((r) => r.id === reminderId);
    if (target) {
      if (openExternal && target.phone && target.phone !== 'Multiple (Broadcast)') {
        openWhatsAppChat(target.phone, target.messageText);
      }
      setReminders((prev) =>
        prev.map((r) => (r.id === reminderId ? { ...r, status: 'Sent' } : r))
      );
      addToast('WhatsApp Sent 💬', `Dispatched WhatsApp to ${target.patientName} (${target.phone}).`, 'success');
      notifyCrossTabSync();
    }
  };

  const addWhatsAppReminder = (data: Omit<WhatsAppReminder, 'id'>): string => {
    const id = `wa-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newReminder: WhatsAppReminder = {
      ...data,
      id
    };
    setReminders((prev) => [newReminder, ...prev]);
    notifyCrossTabSync();
    return id;
  };

  const deleteWhatsAppReminder = (reminderId: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== reminderId));
    notifyCrossTabSync();
    addToast('Reminder Removed', 'WhatsApp message removed from queue.', 'info');
  };

  const dispatchAllPendingWhatsApp = () => {
    const pendingList = reminders.filter((r) => r.status === 'Pending' || r.status === 'Scheduled');
    if (pendingList.length === 0) {
      addToast('Queue Empty', 'No pending WhatsApp messages to dispatch.', 'info');
      return;
    }
    setReminders((prev) =>
      prev.map((r) => (r.status === 'Pending' || r.status === 'Scheduled' ? { ...r, status: 'Sent' } : r))
    );
    if (pendingList.length === 1 && pendingList[0].phone && pendingList[0].phone !== 'Multiple (Broadcast)') {
      openWhatsAppChat(pendingList[0].phone, pendingList[0].messageText);
    }
    addToast('Dispatched Queue 💬', `Marked ${pendingList.length} reminders as sent.`, 'success');
    notifyCrossTabSync();
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
    let result: { payment: PaymentRecord; invoice: Invoice; receiptNumber: string };
    try {
      result = await apiClient.recordPayment(data);
    } catch {
      // Local fallback for offline / serverless deployment
      const targetInvoice = invoices.find((inv) => inv.id === data.invoiceId);
      const nowIso = new Date().toISOString();
      const receiptNumber = `REC-2026-${String(payments.length + 1).padStart(4, '0')}`;
      const newPaidAmount = (targetInvoice?.paidAmount || 0) + data.amount;
      const invoiceTotal = targetInvoice?.total || data.amount;
      const newBalance = Math.max(0, invoiceTotal - newPaidAmount);
      const newStatus = newBalance <= 0 ? 'Paid' : newPaidAmount > 0 ? 'Partially Paid' : 'Unpaid';

      const payment: PaymentRecord = {
        id: `PAY-2026-${String(payments.length + 1).padStart(4, '0')}`,
        invoiceId: data.invoiceId,
        patientId: data.patientId || targetInvoice?.patientId || 'PAT-TEMP',
        patientName: targetInvoice?.patientName || 'Patient',
        patientOpNumber: targetInvoice?.patientOpNumber || 'OP-TEMP',
        amount: data.amount,
        paymentDate: nowIso.split('T')[0],
        paymentMethod: data.paymentMethod,
        referenceNumber: data.referenceNumber || '',
        notes: data.notes || '',
        receiptNumber,
        receivedBy: data.receivedBy || 'Reception'
      };

      const updatedInvoice: Invoice = targetInvoice ? {
        ...targetInvoice,
        paidAmount: newPaidAmount,
        balance: newBalance,
        status: newStatus as any,
        payments: [...(targetInvoice.payments || []), payment]
      } : {
        id: data.invoiceId,
        patientId: data.patientId || 'PAT-TEMP',
        patientName: 'Patient',
        patientOpNumber: 'OP-TEMP',
        doctorName: 'Doctor',
        date: nowIso.split('T')[0],
        items: [],
        subtotal: data.amount,
        discount: 0,
        tax: 0,
        total: data.amount,
        paidAmount: data.amount,
        balance: 0,
        status: 'Paid',
        payments: [payment]
      };

      result = { payment, invoice: updatedInvoice, receiptNumber };
    }

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

    // Prevent duplicate: check if an unpaid invoice for this patient already exists with these items or visitId
    const currentPatient = patients.find((p) => p.id === data.patientId);
    const existingInvoices = [
      ...(currentPatient?.invoices || []),
      ...invoices.filter((i) => i.patientId === data.patientId)
    ];
    const incomingItemsSig = (data.items || []).map((it) => `${(it.description || '').toLowerCase().trim()}_${it.unitPrice}`).sort().join('|');

    const matchingInvoice = existingInvoices.find((inv) => {
      if (inv.status === 'Paid') return false;
      if (data.visitId && inv.visitId === data.visitId) return true;
      const invItemsSig = (inv.items || []).map((it) => `${(it.description || '').toLowerCase().trim()}_${it.unitPrice}`).sort().join('|');
      return invItemsSig === incomingItemsSig;
    });

    if (matchingInvoice) {
      addToast('Invoice Already Generated', `Invoice #${matchingInvoice.id} is already open for this visit. Duplicate invoice prevented.`, 'info');
      return matchingInvoice;
    }

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

    const finalInvoice: Invoice = {
      ...result.invoice,
      patientId: result.invoice.patientId || data.patientId,
      patientName: result.invoice.patientName || data.patientName || 'Patient',
      doctorName: result.invoice.doctorName || data.doctorName || 'Consulting Doctor',
      subtotal: result.invoice.subtotal || subtotal,
      discount: result.invoice.discount !== undefined ? result.invoice.discount : discount,
      tax: result.invoice.tax !== undefined ? result.invoice.tax : tax,
      total: result.invoice.total || total,
      balance: result.invoice.balance !== undefined ? result.invoice.balance : total,
      status: result.invoice.status || 'Pending'
    };
    result.invoice = finalInvoice;

    const itemNames = new Set((data.items || []).map((i) => (i.description || '').toLowerCase().trim()));

    setInvoices((prev) => [result.invoice, ...prev.filter((i) => i.id !== result.invoice.id)]);
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id === result.invoice.patientId) {
          const updatedInvoices = [result.invoice, ...(p.invoices || []).filter((i) => i.id !== result.invoice.id)];
          const updatedPlans = (p.treatmentPlans || []).map((tp) =>
            itemNames.has((tp.procedure || '').toLowerCase().trim()) && tp.status !== 'Billed'
              ? { ...tp, status: 'Billed' as const, invoiceId: result.invoice.id }
              : tp
          );
          return {
            ...p,
            treatmentPlans: updatedPlans,
            invoices: updatedInvoices,
            outstandingBalance: updatedInvoices.reduce((sum, inv) => sum + (inv.balance || 0), 0)
          };
        }
        return p;
      })
    );

    setSelectedPatientForDetail((curr) => {
      if (!curr) return null;
      if (curr.id === result.invoice.patientId || (curr.opNumber && curr.opNumber === result.invoice.patientOpNumber)) {
        const updatedInvoices = [result.invoice, ...(curr.invoices || []).filter((i) => i.id !== result.invoice.id)];
        const updatedPlans = (curr.treatmentPlans || []).map((tp) =>
          itemNames.has((tp.procedure || '').toLowerCase().trim()) && tp.status !== 'Billed'
            ? { ...tp, status: 'Billed' as const, invoiceId: result.invoice.id }
            : tp
        );
        return {
          ...curr,
          treatmentPlans: updatedPlans,
          invoices: updatedInvoices,
          outstandingBalance: updatedInvoices.reduce((sum, inv) => sum + (inv.balance || 0), 0)
        };
      }
      return curr;
    });

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

  const deleteInvoice = async (invoiceId: string): Promise<void> => {
    if (!invoiceId) return;

    setInvoices((prev) => {
      const next = prev.filter((inv) => inv.id !== invoiceId);
      safeSetItem('smilecare_invoices_list', JSON.stringify(next));
      return next;
    });

    setPatients((prev) =>
      prev.map((p) => {
        const hasInv = (p.invoices || []).some((inv) => inv.id === invoiceId);
        if (hasInv) {
          const nextInvoices = (p.invoices || []).filter((inv) => inv.id !== invoiceId);
          const nextPlans = (p.treatmentPlans || []).map((tp) =>
            tp.invoiceId === invoiceId ? { ...tp, status: 'Proposed' as const, invoiceId: undefined } : tp
          );
          return {
            ...p,
            treatmentPlans: nextPlans,
            invoices: nextInvoices,
            outstandingBalance: nextInvoices.reduce((sum, inv) => sum + (inv.balance || 0), 0)
          };
        }
        return p;
      })
    );

    setSelectedPatientForDetail((curr) => {
      if (!curr) return null;
      const hasInv = (curr.invoices || []).some((inv) => inv.id === invoiceId);
      if (hasInv) {
        const nextInvoices = (curr.invoices || []).filter((inv) => inv.id !== invoiceId);
        const nextPlans = (curr.treatmentPlans || []).map((tp) =>
          tp.invoiceId === invoiceId ? { ...tp, status: 'Proposed' as const, invoiceId: undefined } : tp
        );
        return {
          ...curr,
          treatmentPlans: nextPlans,
          invoices: nextInvoices,
          outstandingBalance: nextInvoices.reduce((sum, inv) => sum + (inv.balance || 0), 0)
        };
      }
      return curr;
    });

    // Also remove from Supabase
    deleteInvoiceFromDb(invoiceId).catch(() => {});
    apiFetch(`/api/invoices/${encodeURIComponent(invoiceId)}`, { method: 'DELETE' }).catch(() => {});
    notifyCrossTabSync();
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

    openWhatsAppChat(targetPat.phone, message);
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
        deleteInvoice,
        userRole,
        setUserRole,
        reminders,
        addWhatsAppReminder,
        deleteWhatsAppReminder,
        dispatchAllPendingWhatsApp,
        enquiries,
        addEnquiry,
        updateEnquiryStatus,
        deleteEnquiry,
        clearAllEnquiries,
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
        updatePrescription,
        deletePrescription,
        medicines,
        saveMedicine,
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
        isProfileSheetOpen,
        setIsProfileSheetOpen,
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
