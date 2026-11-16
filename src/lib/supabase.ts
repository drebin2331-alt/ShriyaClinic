import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  PatientRecord,
  Appointment,
  QueueToken,
  ClinicVisit,
  Invoice,
  PaymentRecord,
  DentalChair,
  InventoryItem,
  StaffUser,
  Doctor
} from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('http') &&
    !supabaseUrl.includes('your-project-id')
  );
};

// Fallback dummy client if credentials aren't set yet, avoiding crash on mount
const fallbackUrl = 'https://placeholder.supabase.co';
const fallbackKey = 'placeholder-key';

export const supabase: SupabaseClient = createClient(
  isSupabaseConfigured() ? supabaseUrl : fallbackUrl,
  isSupabaseConfigured() ? supabaseAnonKey : fallbackKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);

// Circuit breaker for Supabase billing/quota restrictions (HTTP 402 Payment Required)
let supabaseServiceRestricted = false;
let restrictedWarned = false;
let probePromise: Promise<boolean> | null = null;
const supabaseStatusListeners = new Set<() => void>();

export const isSupabaseBillingError = (error: any): boolean => {
  if (!error) return false;
  const status = error?.status ?? error?.statusCode ?? error?.code;
  if (status === 402 || status === '402') return true;
  const msg = String(error?.message || error?.error_description || error?.details || error || '').toLowerCase();
  return (
    msg.includes('402') ||
    msg.includes('payment required') ||
    msg.includes('restricted due to') ||
    msg.includes('spend cap') ||
    msg.includes('upgrade their plan')
  );
};

export const markSupabaseRestricted = (reason?: string): void => {
  if (!supabaseServiceRestricted) {
    supabaseServiceRestricted = true;
    try {
      supabase.removeAllChannels();
      (supabase as any).realtime?.disconnect?.();
    } catch {
      // Ignore realtime teardown issues
    }
    supabaseStatusListeners.forEach((cb) => {
      try { cb(); } catch {}
    });
  }
  if (!restrictedWarned) {
    restrictedWarned = true;
    console.warn(
      `[Supabase] Cloud sync paused (${reason || 'HTTP 402: project plan/spend cap reached'}). Operating on local clinic storage & API.`
    );
  }
};

export const isSupabaseAvailable = (): boolean => {
  return isSupabaseConfigured() && !supabaseServiceRestricted;
};

export const subscribeSupabaseStatus = (listener: () => void): (() => void) => {
  supabaseStatusListeners.add(listener);
  return () => {
    supabaseStatusListeners.delete(listener);
  };
};

export const probeSupabaseAvailability = async (): Promise<boolean> => {
  if (!isSupabaseConfigured() || supabaseServiceRestricted) return false;
  if (probePromise) return probePromise;

  probePromise = (async () => {
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/profiles?select=id&limit=1`, {
        method: 'GET',
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`
        }
      });
      if (res.status === 402) {
        let detail = 'HTTP 402 Payment Required';
        try {
          const body = await res.json();
          if (body?.message) detail = body.message;
        } catch {}
        markSupabaseRestricted(detail);
        return false;
      }
      return true;
    } catch {
      return false;
    }
  })();

  return probePromise;
};

const handleSupabaseError = (context: string, error: any): void => {
  if (!error) return;
  if (isSupabaseBillingError(error)) {
    markSupabaseRestricted(error?.message || String(error));
    return;
  }
  console.error(context, error);
};

// ============================================================================
// PATIENTS DATA LAYER
// ============================================================================
export const fetchPatientsFromDb = async (): Promise<PatientRecord[]> => {
  if (!isSupabaseAvailable()) return [];
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    handleSupabaseError('Error fetching patients from Supabase:', error);
    return [];
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    opNumber: row.op_number,
    name: row.name,
    dateOfBirth: row.date_of_birth,
    phone: row.phone,
    secondaryPhone: row.secondary_phone,
    email: row.email,
    age: row.age || 0,
    gender: row.gender || 'Other',
    address: row.address,
    referralSource: row.referral_source,
    registeredBy: row.registered_by,
    emergencyContact: row.emergency_contact || { name: '', phone: '', relation: '' },
    assignedDoctorId: row.assigned_doctor_id,
    assignedDoctorName: row.assigned_doctor_name,
    firstVisitDate: row.first_visit_date || row.created_at,
    lastVisit: row.last_visit || row.created_at,
    totalVisits: row.total_visits || 1,
    upcomingAppointmentDate: row.upcoming_appointment_date,
    currentTreatment: row.current_treatment,
    status: row.status || 'New Patient',
    outstandingBalance: Number(row.outstanding_balance) || 0,
    caseSheetCompleted: Boolean(row.case_sheet_completed || row.dental_history?.caseSheetCompleted),
    caseSheetCompletedAt: row.dental_history?.completedAt || row.case_sheet_completed_at,
    medicalHistory: row.medical_history || { allergies: [], conditions: [] },
    dentalHistory: row.dental_history || {},
    dentalChart: Array.isArray(row.dental_chart) ? row.dental_chart : [],
    clinicalNotes: row.clinical_notes || [],
    treatmentPlans: Array.isArray(row.treatment_plans) ? row.treatment_plans : [],
    allergies: row.allergies || [],
    visits: row.visits || []
  }));
};

export const savePatientToDb = async (patient: PatientRecord): Promise<void> => {
  if (!isSupabaseAvailable()) return;
  const payload = {
    id: patient.id,
    op_number: patient.opNumber,
    name: patient.name,
    date_of_birth: patient.dateOfBirth || null,
    phone: patient.phone,
    secondary_phone: patient.secondaryPhone || null,
    email: patient.email || null,
    age: patient.age,
    gender: patient.gender,
    address: patient.address || null,
    referral_source: patient.referralSource || null,
    registered_by: patient.registeredBy || null,
    emergency_contact: patient.emergencyContact || {},
    assigned_doctor_id: patient.assignedDoctorId || null,
    assigned_doctor_name: patient.assignedDoctorName || null,
    first_visit_date: patient.firstVisitDate || null,
    last_visit: patient.lastVisit || null,
    total_visits: patient.totalVisits || 1,
    upcoming_appointment_date: patient.upcomingAppointmentDate || null,
    current_treatment: patient.currentTreatment || null,
    status: patient.status || 'New Patient',
    outstanding_balance: patient.outstandingBalance || 0,
    case_sheet_completed: Boolean(patient.caseSheetCompleted || patient.dentalHistory?.caseSheetCompleted),
    case_sheet_completed_at: patient.caseSheetCompletedAt || patient.dentalHistory?.completedAt || null,
    medical_history: patient.medicalHistory || {},
    dental_history: patient.dentalHistory || {},
    dental_chart: Array.isArray(patient.dentalChart) ? patient.dentalChart : [],
    clinical_notes: patient.clinicalNotes || [],
    treatment_plans: Array.isArray(patient.treatmentPlans) ? patient.treatmentPlans : [],
    allergies: patient.allergies || [],
    visits: patient.visits || []
  };

  const { error } = await supabase.from('patients').upsert(payload);
  if (error) handleSupabaseError('Error saving patient to Supabase:', error);
};

export const deletePatientFromDb = async (patientId: string): Promise<void> => {
  if (!isSupabaseAvailable()) return;
  const { error } = await supabase.from('patients').delete().eq('id', patientId);
  if (error) handleSupabaseError('Error deleting patient from Supabase:', error);
};

// ============================================================================
// APPOINTMENTS DATA LAYER
// ============================================================================
export const fetchAppointmentsFromDb = async (): Promise<Appointment[]> => {
  if (!isSupabaseAvailable()) return [];
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    handleSupabaseError('Error fetching appointments from Supabase:', error);
    return [];
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    tokenId: row.token_id || '',
    patientId: row.patient_id,
    patientName: row.patient_name,
    patientPhone: row.patient_phone,
    patientAge: row.patient_age,
    patientGender: row.patient_gender,
    patientEmail: row.patient_email,
    doctorId: row.doctor_id,
    doctorName: row.doctor_name,
    date: row.date,
    timeSlot: row.time_slot,
    reasonForVisit: row.reason_for_visit || 'Consultation',
    status: row.status,
    appointmentStatus: row.appointment_status,
    amount: Number(row.amount) || 0,
    notes: row.notes,
    createdAt: row.created_at
  }));
};

export const saveAppointmentToDb = async (apt: Appointment): Promise<void> => {
  if (!isSupabaseAvailable()) return;
  const payload = {
    id: apt.id,
    token_id: apt.tokenId || null,
    patient_id: apt.patientId || null,
    patient_name: apt.patientName,
    patient_phone: apt.patientPhone,
    patient_age: apt.patientAge || null,
    patient_gender: apt.patientGender || null,
    patient_email: apt.patientEmail || null,
    doctor_id: apt.doctorId,
    doctor_name: apt.doctorName,
    date: apt.date,
    time_slot: apt.timeSlot,
    reason_for_visit: apt.reasonForVisit || null,
    status: apt.status || 'Confirmed',
    appointment_status: apt.appointmentStatus || 'CONFIRMED',
    amount: apt.amount || 0,
    notes: apt.notes || null
  };

  const { error } = await supabase.from('appointments').upsert(payload);
  if (error) handleSupabaseError('Error saving appointment to Supabase:', error);
};

export const deleteAppointmentFromDb = async (aptId: string): Promise<void> => {
  if (!isSupabaseAvailable()) return;
  const { error } = await supabase.from('appointments').delete().eq('id', aptId);
  if (error) handleSupabaseError('Error deleting appointment from Supabase:', error);
};

// ============================================================================
// QUEUE TOKENS DATA LAYER
// ============================================================================
export const fetchTokensFromDb = async (): Promise<QueueToken[]> => {
  if (!isSupabaseAvailable()) return [];
  const { data, error } = await supabase
    .from('tokens')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    handleSupabaseError('Error fetching tokens from Supabase:', error);
    return [];
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    tokenNumber: row.token_number,
    visitId: row.visit_id,
    appointmentId: row.appointment_id,
    patientId: row.patient_id,
    patientName: row.patient_name,
    patientPhone: row.patient_phone,
    doctorId: row.doctor_id,
    doctorName: row.doctor_name,
    chairId: row.chair_id,
    status: row.status,
    priority: row.priority || 'Normal',
    reasonForVisit: row.reason_for_visit,
    estimatedWaitMinutes: row.estimated_wait_minutes || 15,
    calledAt: row.called_at,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    createdAt: row.created_at,
    date: row.date || (row.created_at && row.created_at.includes('T') ? row.created_at.split('T')[0] : new Date().toISOString().split('T')[0])
  }));
};

export const saveTokenToDb = async (token: QueueToken): Promise<void> => {
  if (!isSupabaseAvailable()) return;
  const payload = {
    id: token.id,
    token_number: token.tokenNumber,
    visit_id: token.visitId || null,
    appointment_id: token.appointmentId || null,
    patient_id: token.patientId || null,
    patient_name: token.patientName,
    patient_phone: token.patientPhone || null,
    doctor_id: token.doctorId,
    doctor_name: token.doctorName,
    chair_id: token.chairId || null,
    status: token.status,
    priority: token.priority || 'Normal',
    reason_for_visit: token.reasonForVisit || null,
    estimated_wait_minutes: token.estimatedWaitMinutes || 15,
    called_at: token.calledAt || null,
    started_at: token.startedAt || null,
    completed_at: token.completedAt || null
  };

  const { error } = await supabase.from('tokens').upsert(payload);
  if (error) handleSupabaseError('Error saving token to Supabase:', error);
};

// ============================================================================
// INVOICES & PAYMENTS DATA LAYER
// ============================================================================
export const fetchInvoicesFromDb = async (): Promise<Invoice[]> => {
  if (!isSupabaseAvailable()) return [];
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    handleSupabaseError('Error fetching invoices from Supabase:', error);
    return [];
  }

  return (data || []).map((row: any) => {
    // Map Supabase DB status ('PAID', 'PARTIALLY_PAID', 'UNPAID', 'CANCELLED') → app status
    let appStatus: 'Paid' | 'Partial' | 'Pending' = 'Pending';
    if (row.status === 'PAID') {
      appStatus = 'Paid';
    } else if (row.status === 'PARTIALLY_PAID') {
      appStatus = 'Partial';
    } else if (row.status === 'UNPAID') {
      appStatus = 'Pending';
    } else if (row.balance <= 0 && Number(row.total) > 0) {
      appStatus = 'Paid';
    } else if (Number(row.paid) > 0) {
      appStatus = 'Partial';
    }

    return {
      id: row.id,
      visitId: row.visit_id,
      patientId: row.patient_id,
      patientName: row.patient_name,
      doctorName: row.doctor_name,
      items: row.items || [],
      subtotal: Number(row.subtotal) || 0,
      discount: Number(row.discount) || 0,
      tax: Number(row.tax) || 0,
      total: Number(row.total) || 0,
      paid: Number(row.paid) || 0,
      balance: Number(row.balance) || 0,
      status: appStatus,
      dueDate: row.due_date,
      createdAt: row.created_at
    };
  });
};

export const saveInvoiceToDb = async (inv: Invoice): Promise<void> => {
  if (!isSupabaseAvailable()) return;

  // Supabase constraint `invoices_status_check` accepts: 'PAID', 'PARTIALLY_PAID', 'UNPAID', 'CANCELLED'
  const dbStatus =
    inv.status === 'Paid' || inv.balance <= 0 ? 'PAID' :
    inv.status === 'Partial' || inv.paid > 0 ? 'PARTIALLY_PAID' :
    'UNPAID';

  const payload: Record<string, any> = {
    id: inv.id,
    visit_id: inv.visitId || null,
    patient_id: inv.patientId,
    patient_name: inv.patientName,
    doctor_name: inv.doctorName,
    items: inv.items || [],
    subtotal: inv.subtotal,
    discount: inv.discount || 0,
    tax: inv.tax || 0,
    total: inv.total,
    paid: inv.paid || 0,
    balance: inv.balance,
    status: dbStatus,
    due_date: inv.dueDate || null
  };

  const { error } = await supabase.from('invoices').upsert(payload);
  if (error) {
    handleSupabaseError('Error saving invoice to Supabase:', error);
  }
};

export const fetchPaymentsFromDb = async (): Promise<PaymentRecord[]> => {
  if (!isSupabaseAvailable()) return [];
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    handleSupabaseError('Error fetching payments from Supabase:', error);
    return [];
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    invoiceId: row.invoice_id,
    patientId: row.patient_id,
    patientName: row.patient_name,
    amount: Number(row.amount) || 0,
    paymentMethod: row.payment_method,
    referenceNumber: row.reference_number,
    receiptNumber: row.receipt_number,
    notes: row.notes,
    receivedBy: row.received_by,
    date: row.date,
    createdAt: row.created_at
  }));
};

export const savePaymentToDb = async (pay: PaymentRecord): Promise<void> => {
  if (!isSupabaseAvailable()) return;
  const payload = {
    id: pay.id,
    invoice_id: pay.invoiceId,
    patient_id: pay.patientId || null,
    patient_name: pay.patientName,
    amount: pay.amount,
    payment_method: pay.paymentMethod,
    reference_number: pay.referenceNumber || null,
    receipt_number: pay.receiptNumber,
    notes: pay.notes || null,
    received_by: pay.receivedBy || null,
    date: pay.date
  };

  const { error } = await supabase.from('payments').upsert(payload);
  if (error) handleSupabaseError('Error saving payment to Supabase:', error);
};

// ============================================================================
// DENTAL CHAIRS DATA LAYER
// ============================================================================
export const fetchChairsFromDb = async (): Promise<DentalChair[]> => {
  if (!isSupabaseAvailable()) return [];
  const { data, error } = await supabase
    .from('dental_chairs')
    .select('*')
    .order('id', { ascending: true });

  if (error) {
    handleSupabaseError('Error fetching chairs from Supabase:', error);
    return [];
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    name: row.name,
    doctorId: row.doctor_id,
    doctorName: row.doctor_name,
    status: row.status,
    currentTokenId: row.current_token_id,
    currentPatientName: row.current_patient_name,
    isOperational: row.is_operational
  }));
};

export const saveChairToDb = async (chair: DentalChair): Promise<void> => {
  if (!isSupabaseAvailable()) return;
  const payload = {
    id: chair.id,
    name: chair.name,
    doctor_id: chair.doctorId || null,
    doctor_name: chair.doctorName || null,
    status: chair.status,
    current_token_id: chair.currentTokenId || null,
    current_patient_name: chair.currentPatientName || null,
    is_operational: chair.isOperational
  };

  const { error } = await supabase.from('dental_chairs').upsert(payload);
  if (error) handleSupabaseError('Error saving chair to Supabase:', error);
};

// ============================================================================
// PRESCRIPTIONS DATA LAYER
// ============================================================================
export const fetchPrescriptionsFromDb = async (): Promise<PrescriptionRecord[]> => {
  if (!isSupabaseAvailable()) return [];
  const { data, error } = await supabase
    .from('prescriptions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    handleSupabaseError('Error fetching prescriptions from Supabase:', error);
    return [];
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    visitId: row.visit_id || undefined,
    patientId: row.patient_id,
    patientName: row.patient_name,
    patientOpNumber: row.patient_op_number || undefined,
    patientAge: row.patient_age || undefined,
    patientGender: row.patient_gender || undefined,
    doctorId: row.doctor_id || 'staff-1792653030970',
    doctorName: row.doctor_name || 'Dr. DOCTOR TEST',
    clinicName: 'Shriya Multispeciality Dental Clinic',
    clinicAddress: 'Pollachi Road, Kozhinjapara, Palakkad - 678555',
    clinicPhone: '+91 94003 20890',
    date: row.date || (row.created_at ? row.created_at.split('T')[0] : new Date().toISOString().split('T')[0]),
    diagnosis: row.diagnosis || '',
    items: row.items || [],
    doctorNotes: row.doctor_notes || '',
    followUpDate: row.follow_up_date || undefined,
    createdAt: row.created_at
  }));
};

export const savePrescriptionToDb = async (rx: PrescriptionRecord): Promise<void> => {
  if (!isSupabaseAvailable()) return;
  const payload = {
    id: rx.id,
    visit_id: rx.visitId || null,
    patient_id: rx.patientId,
    patient_name: rx.patientName,
    doctor_name: rx.doctorName,
    items: rx.items || [],
    diagnosis: rx.diagnosis || null,
    doctor_notes: rx.doctorNotes || null,
    follow_up_date: rx.followUpDate || null,
    date: rx.date || new Date().toISOString().split('T')[0]
  };

  const { error } = await supabase.from('prescriptions').upsert(payload);
  if (error) handleSupabaseError('Error saving prescription to Supabase:', error);
};

export const deletePrescriptionFromDb = async (id: string): Promise<void> => {
  if (!isSupabaseAvailable()) return;
  const { error } = await supabase.from('prescriptions').delete().eq('id', id);
  if (error) handleSupabaseError('Error deleting prescription from Supabase:', error);
};

// ============================================================================
// PROFILES & USER ACCOUNTS DATA LAYER (Admin-Provisioned Roles)
// ============================================================================
export interface ProfileRecord {
  id: string;
  email: string;
  password?: string;
  name: string;
  role: string;
  title?: string;
  phone?: string;
  avatar?: string;
  doctorId?: string;
  patientId?: string;
  specialization?: string;
  qualification?: string;
  roomNumber?: string;
  status?: string;
  createdAt?: string;
}

export const fetchProfilesFromDb = async (): Promise<ProfileRecord[]> => {
  if (!isSupabaseAvailable()) return [];
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      if (isSupabaseBillingError(error)) {
        markSupabaseRestricted(error.message);
      } else {
        console.warn('Error fetching profiles from Supabase:', error.message);
      }
      return [];
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      email: row.email,
      password: row.password || 'Password@123',
      name: row.name,
      role: row.role,
      title: row.title,
      phone: row.phone,
      avatar: row.avatar,
      doctorId: row.doctor_id,
      patientId: row.patient_id,
      specialization: row.specialization,
      qualification: row.qualification,
      roomNumber: row.room_number,
      status: row.status || 'Active',
      createdAt: row.created_at
    }));
  } catch (e) {
    console.warn('Supabase profiles read exception:', e);
    return [];
  }
};

export const saveProfileToDb = async (profile: Partial<ProfileRecord> & { email: string; name: string; role: string }): Promise<ProfileRecord | null> => {
  if (!isSupabaseAvailable()) return null;
  try {
    const payload: any = {
      email: profile.email.toLowerCase().trim(),
      name: profile.name.trim(),
      role: profile.role,
      password: profile.password || 'Password@123',
      title: profile.title || (profile.role === 'doctor' ? 'Dental Surgeon' : profile.role === 'customer' ? 'Patient' : profile.role.toUpperCase()),
      phone: profile.phone || null,
      avatar: profile.avatar || (profile.role === 'doctor' ? '🩺' : profile.role === 'receptionist' ? '👩‍💼' : profile.role === 'customer' ? '👤' : '🛡️'),
      doctor_id: profile.doctorId || null,
      patient_id: profile.patientId || null,
      specialization: profile.specialization || null,
      qualification: profile.qualification || null,
      room_number: profile.roomNumber || null,
      status: profile.status || 'Active'
    };

    if (profile.id) {
      payload.id = profile.id;
    }

    const { data, error } = await supabase
      .from('profiles')
      .upsert(payload, { onConflict: 'email' })
      .select()
      .maybeSingle();

    if (error) {
      handleSupabaseError('Error saving profile to Supabase:', error);
      return null;
    }

    if (!data) return null;

    return {
      id: data.id,
      email: data.email,
      password: data.password,
      name: data.name,
      role: data.role,
      title: data.title,
      phone: data.phone,
      avatar: data.avatar,
      doctorId: data.doctor_id,
      patientId: data.patient_id,
      specialization: data.specialization,
      qualification: data.qualification,
      roomNumber: data.room_number,
      status: data.status,
      createdAt: data.created_at
    };
  } catch (e) {
    console.error('Supabase profile save exception:', e);
    return null;
  }
};

export const deleteProfileFromDb = async (idOrEmail: string): Promise<boolean> => {
  if (!isSupabaseAvailable()) return true;
  try {
    const query = idOrEmail.includes('@')
      ? supabase.from('profiles').delete().eq('email', idOrEmail.toLowerCase().trim())
      : supabase.from('profiles').delete().eq('id', idOrEmail);

    const { error } = await query;
    if (error) {
      handleSupabaseError('Error deleting profile from Supabase:', error);
      return false;
    }
    return true;
  } catch (e) {
    console.error('Supabase profile delete exception:', e);
    return false;
  }
};

