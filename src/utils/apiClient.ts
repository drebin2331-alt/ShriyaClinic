import { 
  PatientRecord, 
  ClinicVisit, 
  QueueToken, 
  Appointment, 
  Invoice, 
  PaymentRecord, 
  PrescriptionRecord, 
  FeeApprovalRecord, 
  AuditEvent,
  PatientEnquiry,
  MedicineRecord
} from '../types';
import {
  SEED_PATIENTS,
  SEED_TOKENS,
  SEED_VISITS,
  SEED_INVOICES,
  SEED_PAYMENTS,
  SEED_PRESCRIPTIONS,
  SEED_FEE_APPROVALS,
  SEED_MEDICINES
} from '../seed/seedClinicData';
import { safeSetItem } from './safeStorage';

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  try {
    const saved = localStorage.getItem('smilecare_auth_user');
    if (saved) {
      const user = JSON.parse(saved);
      headers['x-actor-id'] = user.id || 'usr-admin-01';
      headers['x-actor-name'] = user.name || 'ADMIN';
      headers['x-actor-role'] = user.role || 'admin';
    }
  } catch (e) {
    // Fall back to default
  }

  return headers;
}

export async function parseSafeJson(res: Response): Promise<any> {
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      return await res.json();
    } catch {
      return {};
    }
  }
  const text = await res.text().catch(() => '');
  try {
    return JSON.parse(text);
  } catch {
    return { error: text || `HTTP ${res.status}` };
  }
}

export interface ClinicSyncState {
  patients: PatientRecord[];
  visits: ClinicVisit[];
  tokens: QueueToken[];
  appointments: Appointment[];
  invoices: Invoice[];
  payments: PaymentRecord[];
  prescriptions: PrescriptionRecord[];
  feeApprovals: FeeApprovalRecord[];
  auditEvents: AuditEvent[];
  enquiries?: PatientEnquiry[];
  medicines?: MedicineRecord[];
  serverTime: string;
}

function getLocalFallbackState(): ClinicSyncState {
  let patients: PatientRecord[] = [];
  let tokens: QueueToken[] = [];
  let visits: ClinicVisit[] = [];
  let invoices: Invoice[] = [];
  let payments: PaymentRecord[] = [];
  let prescriptions: PrescriptionRecord[] = [];
  let feeApprovals: FeeApprovalRecord[] = [];
  let medicines = SEED_MEDICINES;
  let appointments: Appointment[] = [];
  let enquiries: PatientEnquiry[] = [];
  let auditEvents: AuditEvent[] = [];

  try {
    const p = localStorage.getItem('smilecare_patients_list');
    if (p) {
      const parsed = JSON.parse(p);
      if (Array.isArray(parsed) && parsed.length > 0) patients = parsed;
    }
    const t = localStorage.getItem('smilecare_tokens_list');
    if (t) {
      const parsed = JSON.parse(t);
      if (Array.isArray(parsed) && parsed.length > 0) tokens = parsed;
    }
    const v = localStorage.getItem('smilecare_visits_list');
    if (v) {
      const parsed = JSON.parse(v);
      if (Array.isArray(parsed) && parsed.length > 0) visits = parsed;
    }
    const inv = localStorage.getItem('smilecare_invoices_list');
    if (inv) {
      const parsed = JSON.parse(inv);
      if (Array.isArray(parsed) && parsed.length > 0) invoices = parsed;
    }
    const pay = localStorage.getItem('smilecare_payments_list');
    if (pay) {
      const parsed = JSON.parse(pay);
      if (Array.isArray(parsed) && parsed.length > 0) payments = parsed;
    }
    const rx = localStorage.getItem('smilecare_prescriptions_list');
    if (rx) {
      const parsed = JSON.parse(rx);
      if (Array.isArray(parsed) && parsed.length > 0) prescriptions = parsed;
    }
    const appts = localStorage.getItem('smilecare_appointments_list');
    if (appts) {
      const parsed = JSON.parse(appts);
      if (Array.isArray(parsed)) appointments = parsed;
    }
  } catch (e) {
    // Ignore storage parse errors
  }

  return {
    patients,
    tokens,
    visits,
    appointments,
    invoices,
    payments,
    prescriptions,
    feeApprovals,
    medicines,
    auditEvents,
    enquiries,
    serverTime: new Date().toISOString()
  };
}

export const apiClient = {
  async getState(): Promise<ClinicSyncState> {
    try {
      const res = await fetch('/api/state', {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const text = await res.text();
        if (text && (text.trim().startsWith('{') || text.trim().startsWith('['))) {
          const parsed = JSON.parse(text);
          if (parsed && typeof parsed === 'object') {
            return parsed;
          }
        }
      }
    } catch {
      // Offline or Vercel static hosting fallback
    }
    return getLocalFallbackState();
  },

  async registerPatient(data: {
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
  }): Promise<{ patient: PatientRecord; opNumber: string }> {
    try {
      const res = await fetch('/api/patients', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      const json = await parseSafeJson(res);
      if (!res.ok) {
        const err = new Error(json?.error || 'Failed to register patient');
        (err as any).existingPatient = json?.existingPatient;
        throw err;
      }
      return json;
    } catch (e: any) {
      if (e?.existingPatient) throw e;
      const randNum = Math.floor(1000 + Math.random() * 9000);
      const fallbackPatient: PatientRecord = {
        id: `PAT-2026-${randNum}`,
        opNumber: `OP-2026-${randNum}`,
        name: data.name,
        phone: data.phone,
        gender: data.gender,
        age: data.age || 30,
        address: data.address || '',
        currentTreatment: data.reasonForVisit || 'Consultation',
        status: 'New Patient',
        firstVisitDate: new Date().toISOString().split('T')[0],
        lastVisit: new Date().toISOString().split('T')[0],
        totalVisits: 1,
        outstandingBalance: 0,
        medicalHistory: { allergies: [], conditions: [] },
        dentalHistory: { currentComplaint: data.reasonForVisit || 'General Consultation' },
        dentalChart: {},
        clinicalNotes: [],
        treatmentPlans: [],
        allergies: [],
        visits: []
      };
      return { patient: fallbackPatient, opNumber: fallbackPatient.opNumber };
    }
  },

  async updatePatient(id: string, data: Partial<PatientRecord>): Promise<{ patient: PatientRecord }> {
    try {
      const res = await fetch(`/api/patients/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      const json = await parseSafeJson(res);
      if (json && json.patient) {
        return json;
      }
    } catch {
      // Fallback
    }
    return { patient: { id, ...(data as any) } };
  },

  async checkInPatient(data: {
    patientId: string;
    doctorId?: string;
    appointmentId?: string;
    reasonForVisit?: string;
    priority?: 'Normal' | 'Urgent' | 'Emergency';
    chairId?: string;
    isWalkIn?: boolean;
  }): Promise<{ visit: ClinicVisit; token: QueueToken }> {
    const res = await fetch('/api/check-in', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    const json = await parseSafeJson(res);
    if (!res.ok) {
      const err = new Error(json.error || `Check-in server responded with ${res.status}`);
      (err as any).activeToken = json.activeToken;
      (err as any).status = res.status;
      throw err;
    }
    return json;
  },

  async callToken(id: string, chairId?: string, chairName?: string): Promise<{ token: QueueToken; visit?: ClinicVisit }> {
    const res = await fetch(`/api/tokens/${encodeURIComponent(id)}/call`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ chairId, chairName })
    });
    const json = await parseSafeJson(res);
    if (!res.ok) {
      const err = new Error(json.error || 'Failed to call token');
      (err as any).status = res.status;
      throw err;
    }
    return json;
  },

  async holdToken(id: string): Promise<{ token: QueueToken }> {
    const res = await fetch(`/api/tokens/${encodeURIComponent(id)}/hold`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    const json = await parseSafeJson(res);
    if (!res.ok) {
      const err = new Error(json.error || 'Failed to hold token');
      (err as any).status = res.status;
      throw err;
    }
    return json;
  },

  async skipToken(id: string, reason?: string): Promise<{ token: QueueToken }> {
    const res = await fetch(`/api/tokens/${encodeURIComponent(id)}/skip`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reason })
    });
    const json = await parseSafeJson(res);
    if (!res.ok) {
      const err = new Error(json.error || 'Failed to skip token');
      (err as any).status = res.status;
      throw err;
    }
    return json;
  },

  async startConsultation(
    visitIdOrToken: string,
    metadata?: { patientName?: string; patientId?: string; doctorId?: string; doctorName?: string; tokenNumber?: string }
  ): Promise<{ visit: ClinicVisit; token?: QueueToken }> {
    const res = await fetch('/api/consultations/start', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ visitIdOrToken, ...(metadata || {}) })
    });
    const json = await parseSafeJson(res);
    if (!res.ok) {
      const err = new Error(json.error || 'Failed to start consultation');
      (err as any).status = res.status;
      throw err;
    }
    return json;
  },

  async completeConsultation(data: {
    visitId: string;
    chiefComplaint?: string;
    diagnosis: string;
    clinicalFindings?: string;
    treatmentPerformed: string;
    doctorNotes?: string;
    followUpDate?: string;
    followUpReason?: string;
  }): Promise<{ visit: ClinicVisit; token?: QueueToken; message: string }> {
    const res = await fetch('/api/consultations/complete', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    const json = await parseSafeJson(res);
    if (!res.ok) {
      throw new Error(json.error || 'Failed to complete consultation');
    }
    return json;
  },

  async approveFee(data: {
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
  }): Promise<{ feeApproval: FeeApprovalRecord; invoice: Invoice; visit?: ClinicVisit }> {
    const res = await fetch('/api/consultations/fee-approval', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    const json = await parseSafeJson(res);
    if (!res.ok) {
      throw new Error(json.error || 'Failed to approve fee');
    }
    return json;
  },

  async createPrescription(data: {
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
  }): Promise<{ prescription: PrescriptionRecord; visit?: ClinicVisit }> {
    const res = await fetch('/api/prescriptions', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    const json = await parseSafeJson(res);
    if (!res.ok) {
      throw new Error(json.error || 'Failed to create prescription');
    }
    return json;
  },

  async updatePrescription(
    id: string,
    data: {
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
  ): Promise<{ prescription: PrescriptionRecord; visit?: ClinicVisit }> {
    const res = await fetch(`/api/prescriptions/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    const json = await parseSafeJson(res);
    if (!res.ok) {
      throw new Error(json.error || 'Failed to update prescription');
    }
    return json;
  },

  async deletePrescription(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`/api/prescriptions/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const json = await parseSafeJson(res);
    if (!res.ok) {
      throw new Error(json.error || 'Failed to delete prescription');
    }
    return json;
  },

  async getMedicines(): Promise<{ medicines: MedicineRecord[] }> {
    try {
      const res = await fetch('/api/medicines', {
        headers: getAuthHeaders()
      });
      const json = await parseSafeJson(res);
      return { medicines: Array.isArray(json?.medicines) ? json.medicines : [] };
    } catch {
      return { medicines: [] };
    }
  },

  async saveMedicine(data: Partial<MedicineRecord>): Promise<{ medicine: MedicineRecord; medicines: MedicineRecord[] }> {
    try {
      const res = await fetch('/api/medicines', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      const json = await parseSafeJson(res);
      const med: MedicineRecord = json?.medicine || {
        id: `med-${Date.now()}`,
        name: data.name || '',
        dosage: data.dosage || '',
        route: data.route || 'Oral',
        frequency: data.frequency || 'BD',
        duration: data.duration || '5 days',
        instructions: data.instructions || 'After food'
      };
      return { medicine: med, medicines: Array.isArray(json?.medicines) ? json.medicines : [med] };
    } catch {
      const fallbackMed: MedicineRecord = {
        id: `med-${Date.now()}`,
        name: data.name || '',
        dosage: data.dosage || '',
        route: data.route || 'Oral',
        frequency: data.frequency || 'BD',
        duration: data.duration || '5 days',
        instructions: data.instructions || 'After food'
      };
      return { medicine: fallbackMed, medicines: [fallbackMed] };
    }
  },

  async recordPayment(data: {
    invoiceId: string;
    amount: number;
    paymentMethod: string;
    referenceNumber?: string;
    notes?: string;
  }): Promise<{ payment: PaymentRecord; invoice: Invoice; receiptNumber: string; remainingBalance: number }> {
    const res = await fetch('/api/payments', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    const json = await parseSafeJson(res);
    if (!res.ok) {
      throw new Error(json.error || 'Failed to record payment');
    }
    return json;
  },

  async closeVisit(visitId: string, adminNotes?: string, meta?: any): Promise<{ visit: ClinicVisit; token?: QueueToken }> {
    const res = await fetch(`/api/visits/${encodeURIComponent(visitId)}/close`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ adminNotes, ...(meta || {}) })
    });
    const json = await parseSafeJson(res);
    if (!res.ok) {
      throw new Error(json.error || 'Failed to close visit');
    }
    return json;
  },

  async rescheduleAppointment(id: string, newDate: string, newTimeSlot: string, reason?: string): Promise<{ appointment: Appointment }> {
    const res = await fetch(`/api/appointments/${encodeURIComponent(id)}/reschedule`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ newDate, newTimeSlot, reason })
    });
    const json = await parseSafeJson(res);
    if (!res.ok) {
      throw new Error(json.error || 'Failed to reschedule appointment');
    }
    return json;
  },

  async cancelAppointment(id: string, reason?: string): Promise<{ appointment: Appointment }> {
    const res = await fetch(`/api/appointments/${encodeURIComponent(id)}/cancel`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reason })
    });
    const json = await parseSafeJson(res);
    if (!res.ok) {
      throw new Error(json.error || 'Failed to cancel appointment');
    }
    return json;
  },

  async getAuditLog(): Promise<{ auditEvents: AuditEvent[] }> {
    try {
      const res = await fetch('/api/audit', {
        headers: getAuthHeaders()
      });
      const json = await parseSafeJson(res);
      return { auditEvents: Array.isArray(json?.auditEvents) ? json.auditEvents : [] };
    } catch {
      return { auditEvents: [] };
    }
  }
};
