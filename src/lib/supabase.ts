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
  Doctor,
  PatientEnquiry
} from '../types';

// Production default credentials ensuring native mobile apps (Capacitor/APK) and CI builds connect seamlessly
const PRODUCTION_SUPABASE_URL = 'https://rgprflzadkrwyithvwha.supabase.co';
const PRODUCTION_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJncHJmbHphZGtyd3lpdGh2d2hhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI1MDc2MzgsImV4cCI6MjEwODA4MzYzOH0.BJDD7cpydjDykRIJjz23PAN5UnVpsufLuIv_rEyYT-A';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || PRODUCTION_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || PRODUCTION_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('http') &&
    !supabaseUrl.includes('your-project-id')
  );
};

export const supabase: SupabaseClient = createClient(
  supabaseUrl,
  supabaseAnonKey,
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
try {
  if (typeof window !== 'undefined' && sessionStorage.getItem('supabase_restricted') === 'true') {
    supabaseServiceRestricted = true;
  }
} catch {}

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

export const isSupabaseNetworkOrOfflineError = (error: any): boolean => {
  if (!error) return false;
  const msg = String(error?.message || error?.error_description || error?.details || error || '').toLowerCase();
  const code = String(error?.code || '');
  return (
    code === 'PGRST000' ||
    msg.includes('connection_closed') ||
    msg.includes('err_connection_closed') ||
    msg.includes('failed to fetch') ||
    msg.includes('network error') ||
    msg.includes('networkrequestfailed') ||
    msg.includes('abort') ||
    msg.includes('timeout') ||
    msg.includes('load failed')
  );
};

export const markSupabaseRestricted = (reason?: string): void => {
  if (!supabaseServiceRestricted) {
    supabaseServiceRestricted = true;
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('supabase_restricted', 'true');
      }
    } catch {}
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
      `[Supabase] Cloud sync paused (${reason || 'Connection closed or service unavailable'}). Operating smoothly on local clinic storage & backend API.`
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
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(`${supabaseUrl}/rest/v1/profiles?select=id&limit=1`, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`
        }
      });
      clearTimeout(timeoutId);

      if (res.status === 402) {
        let detail = 'HTTP 402 Payment Required';
        try {
          const body = await res.json();
          if (body?.message) detail = body.message;
        } catch {}
        markSupabaseRestricted(detail);
        return false;
      }

      if (!res.ok) {
        markSupabaseRestricted(`Supabase HTTP ${res.status}`);
        return false;
      }
      return true;
    } catch (err: any) {
      markSupabaseRestricted(err?.message || 'Connection closed / unreachable');
      return false;
    }
  })();

  return probePromise;
};

const handleSupabaseError = (context: string, error: any): void => {
  if (!error) return;
  if (isSupabaseBillingError(error) || isSupabaseNetworkOrOfflineError(error)) {
    markSupabaseRestricted(error?.message || 'Supabase offline or connection closed');
    return;
  }
  console.warn(context, error?.message || error);
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

export const toValidTimestampTz = (val: string | null | undefined, baseDate?: string): string | null => {
  if (!val || typeof val !== 'string') return null;
  const trimmed = val.trim();
  if (!trimmed || trimmed === 'null' || trimmed === 'undefined') return null;

  // If it's already an ISO or valid full date string (contains - or /)
  if ((trimmed.includes('-') || trimmed.includes('/')) && !isNaN(Date.parse(trimmed))) {
    try {
      return new Date(trimmed).toISOString();
    } catch {
      return null;
    }
  }

  // If it's a bare time string like "11:06 am", "04:17 pm", "11:35", "11:35:00"
  const dateStr = (baseDate && baseDate.includes('-')) ? baseDate : new Date().toISOString().split('T')[0];
  const timeMatch = trimmed.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(am|pm)?$/i);
  if (timeMatch) {
    let hours = parseInt(timeMatch[1], 10);
    const minutes = parseInt(timeMatch[2], 10);
    const seconds = timeMatch[3] ? parseInt(timeMatch[3], 10) : 0;
    const meridian = timeMatch[4] ? timeMatch[4].toLowerCase() : null;

    if (meridian === 'pm' && hours < 12) hours += 12;
    if (meridian === 'am' && hours === 12) hours = 0;

    const isoStr = `${dateStr}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.000Z`;
    const dt = new Date(isoStr);
    if (!isNaN(dt.getTime())) {
      return dt.toISOString();
    }
  }

  // Fallback combine with date
  try {
    const fallback = new Date(`${dateStr} ${trimmed}`);
    if (!isNaN(fallback.getTime())) {
      return fallback.toISOString();
    }
  } catch { }

  return null;
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
    medical_history: patient.medicalHistory || {},
    dental_history: {
      ...(patient.dentalHistory || {}),
      caseSheetCompleted: Boolean(patient.caseSheetCompleted || patient.dentalHistory?.caseSheetCompleted),
      caseSheetCompletedAt: toValidTimestampTz(patient.caseSheetCompletedAt || patient.dentalHistory?.completedAt) || null
    },
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
  if (!isSupabaseAvailable() || !apt) return;

  let patientName = apt.patientName?.trim() || 'Patient';
  let doctorName = apt.doctorName?.trim() || 'Consulting Doctor';
  let doctorId = apt.doctorId || 'doc-1';

  const payload = {
    id: apt.id,
    token_id: apt.tokenId || null,
    patient_id: apt.patientId || null,
    patient_name: patientName,
    patient_phone: apt.patientPhone || '0000000000',
    patient_age: apt.patientAge || null,
    patient_gender: apt.patientGender || null,
    patient_email: apt.patientEmail || null,
    doctor_id: doctorId,
    doctor_name: doctorName,
    date: apt.date || new Date().toISOString().split('T')[0],
    time_slot: apt.timeSlot || '10:00 AM',
    reason_for_visit: apt.reasonForVisit || null,
    status: apt.status || 'Confirmed',
    appointment_status: apt.appointmentStatus || 'CONFIRMED',
    amount: Number(apt.amount) || 0,
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
  if (!isSupabaseAvailable() || !token) return;

  let patientName = token.patientName?.trim() || (token as any).patient_name?.trim();
  let patientId = token.patientId || (token as any).patient_id || null;
  let doctorId = token.doctorId || (token as any).doctor_id;
  let doctorName = token.doctorName || (token as any).doctor_name;
  let tokenNumber = token.tokenNumber || (token as any).token_number || token.id;

  // If patientName or doctor details are missing, look up existing token from localStorage
  if (!patientName || !doctorName || !doctorId) {
    try {
      const stored = localStorage.getItem('smilecare_tokens_list');
      if (stored) {
        const tokens: QueueToken[] = JSON.parse(stored);
        const match = tokens.find(
          (t) => t.id === token.id || t.tokenNumber === tokenNumber || (token.visitId && t.visitId === token.visitId)
        );
        if (match) {
          patientName = patientName || match.patientName?.trim();
          patientId = patientId || match.patientId || null;
          doctorId = doctorId || match.doctorId || (match as any).doctor_id;
          doctorName = doctorName || match.doctorName || (match as any).doctor_name;
          tokenNumber = tokenNumber || match.tokenNumber || (match as any).token_number;
        }
      }
    } catch { }
  }

  // If still missing, check visits list in localStorage
  if (!patientName || !doctorName || !doctorId) {
    try {
      const storedVisits = localStorage.getItem('smilecare_visits_list');
      if (storedVisits) {
        const visits = JSON.parse(storedVisits);
        const matchVisit = visits.find((v: any) => v.id === token.visitId || v.id === token.id || v.tokenId === tokenNumber);
        if (matchVisit) {
          patientName = patientName || matchVisit.patientName?.trim();
          patientId = patientId || matchVisit.patientId || null;
          doctorId = doctorId || matchVisit.doctorId || matchVisit.doctor_id;
          doctorName = doctorName || matchVisit.doctorName || matchVisit.doctor_name;
        }
      }
    } catch { }
  }

  // Safe non-null fallbacks to strictly satisfy PostgreSQL NOT NULL constraints
  patientName = patientName || 'Patient';
  doctorName = doctorName || 'Consulting Doctor';
  doctorId = doctorId || 'doc-1';
  tokenNumber = tokenNumber || token.id;

  // Map status strictly to PostgreSQL allowed values:
  // ('Waiting', 'Called', 'In Consultation', 'Completed', 'Cancelled', 'On Hold', 'Skipped')
  let dbStatus: string = token.status;
  if (dbStatus === 'Reception Follow-up') {
    dbStatus = 'Completed';
  } else if (dbStatus === 'Hold') {
    dbStatus = 'On Hold';
  } else if (dbStatus === 'Confirmed') {
    dbStatus = 'Waiting';
  }
  if (!['Waiting', 'Called', 'In Consultation', 'Completed', 'Cancelled', 'On Hold', 'Skipped'].includes(dbStatus)) {
    dbStatus = 'Waiting';
  }

  // Map priority strictly to PostgreSQL allowed values:
  // ('Normal', 'Urgent', 'Emergency')
  let dbPriority: string = token.priority || 'Normal';
  if (!['Normal', 'Urgent', 'Emergency'].includes(dbPriority)) {
    dbPriority = 'Normal';
  }

  const payload = {
    id: token.id,
    token_number: tokenNumber,
    visit_id: token.visitId || (token as any).visit_id || null,
    appointment_id: token.appointmentId || (token as any).appointment_id || null,
    patient_id: patientId,
    patient_name: patientName,
    patient_phone: token.patientPhone || (token as any).patient_phone || null,
    doctor_id: doctorId,
    doctor_name: doctorName,
    chair_id: token.chairId || (token as any).chair_id || null,
    status: dbStatus,
    priority: dbPriority,
    reason_for_visit: token.reasonForVisit || (token as any).reason_for_visit || null,
    estimated_wait_minutes: token.estimatedWaitMinutes || (token as any).estimated_wait_minutes || 15,
    called_at: toValidTimestampTz(token.calledAt || (token as any).called_at, token.date || (token as any).date),
    started_at: toValidTimestampTz(token.startedAt || (token as any).started_at || (token as any).consultationStartedAt, token.date || (token as any).date),
    completed_at: toValidTimestampTz(token.completedAt || (token as any).completed_at, token.date || (token as any).date)
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
  if (!isSupabaseAvailable() || !inv) return;

  let patientName = inv.patientName?.trim();
  let patientId = inv.patientId;
  let doctorName = inv.doctorName?.trim();

  // If patientName or doctorName is missing, resolve from localStorage/patients
  if (!patientName && patientId) {
    try {
      const stored = localStorage.getItem('smilecare_patients_list');
      if (stored) {
        const patients = JSON.parse(stored);
        const match = patients.find((p: any) => p.id === patientId);
        if (match) {
          patientName = patientName || match.name?.trim();
        }
      }
    } catch { }
  }

  patientName = patientName || 'Patient';
  doctorName = doctorName || 'Consulting Doctor';

  // Supabase constraint `invoices_status_check` accepts: 'PAID', 'PARTIALLY_PAID', 'UNPAID', 'CANCELLED'
  const dbStatus =
    inv.status === 'Paid' || inv.balance <= 0 ? 'PAID' :
    inv.status === 'Partial' || inv.paid > 0 ? 'PARTIALLY_PAID' :
    'UNPAID';

  const payload: Record<string, any> = {
    id: inv.id,
    visit_id: inv.visitId || null,
    patient_id: patientId || null,
    patient_name: patientName,
    doctor_name: doctorName,
    items: inv.items || [],
    subtotal: Number(inv.subtotal) || 0,
    discount: Number(inv.discount) || 0,
    tax: Number(inv.tax) || 0,
    total: Number(inv.total) || 0,
    paid: Number(inv.paid) || 0,
    balance: Number(inv.balance) || 0,
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
  if (!isSupabaseAvailable() || !pay) return;

  let patientName = pay.patientName?.trim();
  let patientId = pay.patientId;

  if (!patientName && patientId) {
    try {
      const stored = localStorage.getItem('smilecare_patients_list');
      if (stored) {
        const patients = JSON.parse(stored);
        const match = patients.find((p: any) => p.id === patientId);
        if (match) {
          patientName = patientName || match.name?.trim();
        }
      }
    } catch { }
  }
  patientName = patientName || 'Patient';

  const payload = {
    id: pay.id,
    invoice_id: pay.invoiceId,
    patient_id: patientId || null,
    patient_name: patientName,
    amount: Number(pay.amount) || 0,
    payment_method: pay.paymentMethod || 'Cash',
    reference_number: pay.referenceNumber || null,
    receipt_number: pay.receiptNumber || `REC-${Date.now()}`,
    notes: pay.notes || null,
    received_by: pay.receivedBy || 'Receptionist',
    date: pay.date || (pay as any).paymentDate || new Date().toISOString().split('T')[0]
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
    doctorId: row.doctor_id || 'doc-1',
    doctorName: row.doctor_name || 'Consulting Doctor',
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
  if (!isSupabaseAvailable() || !rx) return;

  let patientName = rx.patientName?.trim();
  let patientId = rx.patientId || null;
  let doctorName = rx.doctorName?.trim();

  // If patientName or doctorName is missing, resolve from localStorage/patients
  if (!patientName || !doctorName) {
    try {
      const stored = localStorage.getItem('smilecare_patients_list');
      if (stored) {
        const patients = JSON.parse(stored);
        const match = patients.find((p: any) => p.id === patientId);
        if (match) {
          patientName = patientName || match.name?.trim();
        }
      }
    } catch { }
  }

  // Safe non-null fallbacks to strictly satisfy PostgreSQL NOT NULL constraints
  patientName = patientName || 'Patient';
  doctorName = doctorName || 'Consulting Doctor';

  const payload = {
    id: rx.id,
    visit_id: rx.visitId || null,
    patient_id: patientId,
    patient_name: patientName,
    doctor_name: doctorName,
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

// ============================================================================
// ONLINE WEBSITE CONSULTATION ENQUIRIES
// ============================================================================

export const fetchEnquiriesFromDb = async (): Promise<PatientEnquiry[]> => {
  if (!isSupabaseAvailable()) return [];
  try {
    // 1. Check direct enquiries table
    try {
      const { data: directData, error: directErr } = await supabase
        .from('enquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (!directErr && directData && directData.length > 0) {
        return directData.map((d: any) => ({
          id: d.id,
          patientName: d.patient_name || d.patientName || 'Visitor',
          phone: d.phone || '',
          email: d.email || '',
          preferredDate: d.preferred_date || d.preferredDate || '',
          preferredTimeWindow: d.preferred_time_window || d.preferredTimeWindow || '',
          chiefComplaint: d.chief_complaint || d.chiefComplaint || '',
          preferredDoctorId: d.preferred_doctor_id || d.preferredDoctorId || '',
          preferredDoctorName: d.preferred_doctor_name || d.preferredDoctorName || '',
          notes: d.notes || '',
          status: (d.status as any) || 'New',
          createdAt: d.created_at || d.createdAt || new Date().toISOString()
        }));
      }
    } catch { }

    // 2. Fetch from audit_events (guaranteed by public RLS policy)
    const { data: auditData, error: auditErr } = await supabase
      .from('audit_events')
      .select('*')
      .eq('entity_type', 'enquiry')
      .order('timestamp', { ascending: false });

    if (!auditErr && auditData && auditData.length > 0) {
      const mapped: PatientEnquiry[] = [];
      const seen = new Set<string>();

      for (const a of auditData) {
        const details = typeof a.details === 'string' ? JSON.parse(a.details) : (a.details || {});
        const enquiryId = details.id || a.entity_id;
        if (!enquiryId || seen.has(enquiryId)) continue;
        seen.add(enquiryId);

        mapped.push({
          id: enquiryId,
          patientName: details.patientName || a.actor_name || 'Visitor',
          phone: details.phone || '',
          email: details.email || '',
          preferredDate: details.preferredDate || (a.timestamp ? a.timestamp.split('T')[0] : ''),
          preferredTimeWindow: details.preferredTimeWindow || 'Morning (09:30 AM – 01:00 PM)',
          chiefComplaint: details.chiefComplaint || 'Consultation & Oral Examination',
          preferredDoctorId: details.preferredDoctorId || '',
          preferredDoctorName: details.preferredDoctorName || 'Any Available Dental Specialist',
          notes: details.notes || '',
          status: (details.status as any) || 'New',
          createdAt: details.createdAt || a.timestamp || new Date().toISOString()
        });
      }
      return mapped;
    }
  } catch (err) {
    console.warn('Error fetching enquiries from Supabase:', err);
  }
  return [];
};

export const saveEnquiryToDb = async (enquiry: PatientEnquiry): Promise<void> => {
  if (!isSupabaseAvailable()) return;
  // Always persist to audit_events (which is guaranteed to succeed with public RLS)
  try {
    const auditPayload = {
      id: `audit-${enquiry.id}`,
      entity_type: 'enquiry',
      entity_id: enquiry.id,
      action: 'CREATE_ENQUIRY',
      actor_id: 'guest',
      actor_name: enquiry.patientName,
      actor_role: 'customer',
      details: enquiry,
      timestamp: enquiry.createdAt || new Date().toISOString()
    };
    await supabase.from('audit_events').upsert(auditPayload);
  } catch (e) {
    console.warn('Error saving enquiry to audit_events:', e);
  }

  // Also try direct enquiries table
  try {
    const payload = {
      id: enquiry.id,
      patient_name: enquiry.patientName,
      phone: enquiry.phone,
      email: enquiry.email || null,
      preferred_date: enquiry.preferredDate || null,
      preferred_time_window: enquiry.preferredTimeWindow || null,
      chief_complaint: enquiry.chiefComplaint,
      preferred_doctor_id: enquiry.preferredDoctorId || null,
      preferred_doctor_name: enquiry.preferredDoctorName || null,
      notes: enquiry.notes || null,
      status: enquiry.status || 'New',
      created_at: enquiry.createdAt || new Date().toISOString()
    };
    await supabase.from('enquiries').upsert(payload);
  } catch { }
};

export const updateEnquiryStatusInDb = async (id: string, status: PatientEnquiry['status']): Promise<void> => {
  if (!isSupabaseAvailable()) return;
  // Update in audit_events
  try {
    const { data } = await supabase
      .from('audit_events')
      .select('*')
      .eq('entity_type', 'enquiry')
      .eq('entity_id', id)
      .maybeSingle();

    if (data) {
      const details = typeof data.details === 'string' ? JSON.parse(data.details) : (data.details || {});
      details.status = status;
      await supabase
        .from('audit_events')
        .update({ details, timestamp: new Date().toISOString() })
        .eq('id', data.id);
    }
  } catch (e) {
    console.warn('Error updating enquiry in audit_events:', e);
  }

  // Also try direct table
  try {
    await supabase.from('enquiries').update({ status }).eq('id', id);
  } catch { }
};

export const deleteEnquiryFromDb = async (id: string): Promise<void> => {
  if (!isSupabaseAvailable()) return;
  try {
    await supabase.from('audit_events').delete().eq('entity_id', id);
    await supabase.from('audit_events').delete().eq('id', `audit-${id}`);
  } catch { }
  try {
    await supabase.from('enquiries').delete().eq('id', id);
  } catch { }
};

export const clearAllEnquiriesFromDb = async (): Promise<void> => {
  if (!isSupabaseAvailable()) return;
  try {
    await supabase.from('audit_events').delete().eq('entity_type', 'enquiry');
  } catch { }
  try {
    await supabase.from('enquiries').delete().neq('id', 'NONE');
  } catch { }
};

