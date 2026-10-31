import fs from 'fs';
import path from 'path';
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
  PatientEnquiry 
} from '../src/types';

export interface ClinicDatabase {
  patients: PatientRecord[];
  visits: ClinicVisit[];
  tokens: QueueToken[];
  appointments: Appointment[];
  invoices: Invoice[];
  payments: PaymentRecord[];
  prescriptions: PrescriptionRecord[];
  feeApprovals: FeeApprovalRecord[];
  auditEvents: AuditEvent[];
  enquiries: PatientEnquiry[];
  counters: {
    opNumber: number;
    tokenNormal: number;
    tokenWalkIn: number;
    invoiceNumber: number;
    receiptNumber: number;
    visitNumber: number;
    prescriptionNumber: number;
    feeApprovalNumber: number;
  };
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'clinic_data.json');

let dbMemoryCache: ClinicDatabase | null = null;

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function initializeSeedData(): ClinicDatabase {
  return {
    patients: [
      {
        id: 'PAT-2026-000101',
        opNumber: 'OP-2026-00101',
        name: 'Customer 1',
        dateOfBirth: '2004-02-05',
        phone: '+919400180740',
        email: 'karthikeyanpl2019@gmail.com',
        age: 22,
        gender: 'Male',
        address: 'Alampady',
        assignedDoctorId: 'staff-1792653030970',
        assignedDoctorName: 'Dr. DOCTOR TEST',
        firstVisitDate: '2026-10-23',
        lastVisit: '2026-10-24',
        totalVisits: 1,
        currentTreatment: 'Dental Treatment & Consultation',
        status: 'Active Treatment',
        outstandingBalance: 0,
        medicalHistory: {
          allergies: ['Sulfa Drugs'],
          conditions: ['Diabetes Mellitus'],
          hasAsthma: false,
          hasDiabetes: true,
          hasBloodPressure: false,
          hasHeartConditions: false,
          hasBleedingDisorders: false,
          currentMedications: ['Metformin 500mg OD'],
          previousSurgeries: [],
          otherNotes: ''
        },
        allergies: ['Sulfa Drugs'],
        treatmentPlans: [],
        clinicalNotes: [],
        invoices: [],
        feeApprovals: [],
        visits: [],
        prescriptions: [],
        followUps: [],
        documents: [],
        labOrders: []
      } as any
    ],
    visits: [
      {
        id: 'vis-PAT-2026-000101-active',
        patientId: 'PAT-2026-000101',
        patientName: 'Customer 1',
        doctorId: 'staff-1792653030970',
        doctorName: 'Dr. DOCTOR TEST',
        visitDate: '2026-10-28',
        checkInTime: '10:00 AM',
        status: 'In Consultation',
        priority: 'Normal',
        reasonForVisit: 'Composite Filling & Consultation',
        timeline: []
      }
    ],
    tokens: [
      {
        id: 'tok-PAT-2026-000101',
        tokenNumber: 'W-002',
        patientId: 'PAT-2026-000101',
        patientName: 'Customer 1',
        doctorId: 'staff-1792653030970',
        doctorName: 'Dr. DOCTOR TEST',
        status: 'In Consultation',
        createdAt: new Date().toISOString(),
        visitId: 'vis-PAT-2026-000101-active'
      }
    ],
    appointments: [],
    invoices: [],
    payments: [],
    prescriptions: [],
    feeApprovals: [],
    auditEvents: [
      {
        id: `aud-${Date.now()}-init`,
        timestamp: new Date().toISOString(),
        actorId: 'system',
        actorName: 'Clinic Management System',
        actorRole: 'admin',
        action: 'SYSTEM_INITIALIZED',
        entityType: 'System',
        entityId: 'ROOT',
        details: 'Clinic database initialized with clean storage.'
      }
    ],
    enquiries: [],
    counters: {
      opNumber: 101,
      tokenNormal: 1,
      tokenWalkIn: 1,
      invoiceNumber: 1,
      receiptNumber: 1,
      visitNumber: 1,
      prescriptionNumber: 1,
      feeApprovalNumber: 1
    }
  };
}

let lastDbMtime = 0;

export function getDb(): ClinicDatabase {
  ensureDataDir();

  if (fs.existsSync(DB_FILE)) {
    try {
      const stats = fs.statSync(DB_FILE);
      if (!dbMemoryCache || stats.mtimeMs !== lastDbMtime) {
        const content = fs.readFileSync(DB_FILE, 'utf-8');
        dbMemoryCache = JSON.parse(content);
        if (!dbMemoryCache.enquiries) dbMemoryCache.enquiries = [];
        lastDbMtime = stats.mtimeMs;
      }
      if (!dbMemoryCache.enquiries) dbMemoryCache.enquiries = [];
      return dbMemoryCache!;
    } catch (err) {
      console.error('Failed to parse clinic_data.json, re-initializing from seeds...', err);
    }
  }

  dbMemoryCache = initializeSeedData();
  saveDb(dbMemoryCache);
  return dbMemoryCache;
}

export function saveDb(db: ClinicDatabase): void {
  ensureDataDir();
  dbMemoryCache = db;
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write clinic database:', err);
  }
}

// Atomic identifier generators
export function generateOpNumber(): string {
  const db = getDb();
  const currentYear = new Date().getFullYear();
  db.counters.opNumber += 1;
  const opNumber = `OP-${currentYear}-${String(db.counters.opNumber).padStart(5, '0')}`;
  saveDb(db);
  return opNumber;
}

export function generateTokenNumber(isWalkIn: boolean = false): string {
  const db = getDb();
  if (isWalkIn) {
    db.counters.tokenWalkIn += 1;
    const token = `W-${String(db.counters.tokenWalkIn).padStart(3, '0')}`;
    saveDb(db);
    return token;
  } else {
    db.counters.tokenNormal += 1;
    const token = `A-${String(db.counters.tokenNormal).padStart(3, '0')}`;
    saveDb(db);
    return token;
  }
}

export function generateVisitId(): string {
  const db = getDb();
  const currentYear = new Date().getFullYear();
  db.counters.visitNumber = Math.max((db.counters.visitNumber || 0) + 1, (db.visits?.length || 0) + 1);
  const visitId = `VIS-${currentYear}-${String(db.counters.visitNumber).padStart(5, '0')}`;
  saveDb(db);
  return visitId;
}

export function generateInvoiceNumber(): string {
  const db = getDb();
  const currentYear = new Date().getFullYear();
  db.counters.invoiceNumber += 1;
  const invId = `INV-${currentYear}-${String(db.counters.invoiceNumber).padStart(4, '0')}`;
  saveDb(db);
  return invId;
}

export function generateReceiptNumber(): string {
  const db = getDb();
  const currentYear = new Date().getFullYear();
  db.counters.receiptNumber += 1;
  const recId = `REC-${currentYear}-${String(db.counters.receiptNumber).padStart(4, '0')}`;
  saveDb(db);
  return recId;
}

export function generatePrescriptionId(): string {
  const db = getDb();
  const currentYear = new Date().getFullYear();
  db.counters.prescriptionNumber += 1;
  const rxId = `RX-${currentYear}-${String(db.counters.prescriptionNumber).padStart(4, '0')}`;
  saveDb(db);
  return rxId;
}

export function generateFeeApprovalId(): string {
  const db = getDb();
  const currentYear = new Date().getFullYear();
  db.counters.feeApprovalNumber += 1;
  const faId = `FA-${currentYear}-${String(db.counters.feeApprovalNumber).padStart(4, '0')}`;
  saveDb(db);
  return faId;
}

export function logAuditEvent(event: Omit<AuditEvent, 'id' | 'timestamp'>): AuditEvent {
  const db = getDb();
  const fullEvent: AuditEvent = {
    ...event,
    id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString()
  };
  db.auditEvents.unshift(fullEvent);
  saveDb(db);
  return fullEvent;
}
