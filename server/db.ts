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
  PatientEnquiry,
  MedicineRecord 
} from '../src/types';

export const DEFAULT_DENTAL_MEDICINES: MedicineRecord[] = [
  {
    id: 'med-001',
    name: 'Amoxicillin + Clavulanate (Augmentin)',
    dosage: '625mg',
    route: 'Oral',
    frequency: 'BD',
    duration: '5 days',
    instructions: 'After food',
    category: 'Antibiotic'
  },
  {
    id: 'med-002',
    name: 'Amoxicillin',
    dosage: '500mg',
    route: 'Oral',
    frequency: 'TDS',
    duration: '5 days',
    instructions: 'After food',
    category: 'Antibiotic'
  },
  {
    id: 'med-003',
    name: 'Ibuprofen + Paracetamol (Combiflam)',
    dosage: '400mg/325mg',
    route: 'Oral',
    frequency: 'SOS',
    duration: '3 days',
    instructions: 'After food (with antacid)',
    category: 'Analgesic'
  },
  {
    id: 'med-004',
    name: 'Ketorolac Tromethamine (Ketorol-DT)',
    dosage: '10mg',
    route: 'Oral',
    frequency: 'SOS',
    duration: '3 days',
    instructions: 'Disperse in warm water',
    category: 'Analgesic'
  },
  {
    id: 'med-005',
    name: 'Metronidazole (Flagyl)',
    dosage: '400mg',
    route: 'Oral',
    frequency: 'TDS',
    duration: '5 days',
    instructions: 'After meals',
    category: 'Antibiotic'
  },
  {
    id: 'med-006',
    name: 'Chlorhexidine Gluconate Mouthwash',
    dosage: '10ml',
    route: 'Topical rinse',
    frequency: 'BD',
    duration: '7 days',
    instructions: 'Swish for 60 seconds, no food for 30m',
    category: 'Antiseptic'
  },
  {
    id: 'med-007',
    name: 'Pantoprazole (Pan-40)',
    dosage: '40mg',
    route: 'Oral',
    frequency: 'OD',
    duration: '5 days',
    instructions: 'Before breakfast',
    category: 'Antacid'
  },
  {
    id: 'med-008',
    name: 'Triamcinolone Acetonide (Kenacort 0.1%)',
    dosage: 'Pea size',
    route: 'Topical application',
    frequency: 'TDS',
    duration: '5 days',
    instructions: 'Apply over ulcer after meals',
    category: 'Topical'
  },
  {
    id: 'med-009',
    name: 'Paracetamol (Dolo 650)',
    dosage: '650mg',
    route: 'Oral',
    frequency: 'SOS',
    duration: '3 days',
    instructions: 'After food for fever or mild pain',
    category: 'Analgesic'
  },
  {
    id: 'med-010',
    name: 'Aceclofenac + Paracetamol (Zerodol-P)',
    dosage: '100mg/325mg',
    route: 'Oral',
    frequency: 'BD',
    duration: '3 days',
    instructions: 'After food',
    category: 'Analgesic'
  }
];

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
  medicines: MedicineRecord[];
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
    patients: [],
    visits: [],
    tokens: [],
    appointments: [],
    invoices: [],
    payments: [],
    prescriptions: [],
    feeApprovals: [],
    auditEvents: [],
    enquiries: [],
    medicines: [...DEFAULT_DENTAL_MEDICINES],
    counters: {
      opNumber: 1,
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

const DEFAULT_COUNTERS = {
  opNumber: 0,
  tokenNormal: 0,
  tokenWalkIn: 0,
  invoiceNumber: 0,
  receiptNumber: 0,
  visitNumber: 0,
  prescriptionNumber: 0,
  feeApprovalNumber: 0
};

let lastDbMtime = 0;

export function getDb(): ClinicDatabase {
  ensureDataDir();

  if (fs.existsSync(DB_FILE)) {
    try {
      const stats = fs.statSync(DB_FILE);
      if (!dbMemoryCache || stats.mtimeMs !== lastDbMtime) {
        const content = fs.readFileSync(DB_FILE, 'utf-8');
        dbMemoryCache = JSON.parse(content);
        lastDbMtime = stats.mtimeMs;
      }
      if (dbMemoryCache) {
        if (!dbMemoryCache.patients) dbMemoryCache.patients = [];
        if (!dbMemoryCache.visits) dbMemoryCache.visits = [];
        if (!dbMemoryCache.tokens) dbMemoryCache.tokens = [];
        if (!dbMemoryCache.appointments) dbMemoryCache.appointments = [];
        if (!dbMemoryCache.invoices) dbMemoryCache.invoices = [];
        if (!dbMemoryCache.payments) dbMemoryCache.payments = [];
        if (!dbMemoryCache.prescriptions) dbMemoryCache.prescriptions = [];
        if (!dbMemoryCache.feeApprovals) dbMemoryCache.feeApprovals = [];
        if (!dbMemoryCache.auditEvents) dbMemoryCache.auditEvents = [];
        if (!dbMemoryCache.enquiries) dbMemoryCache.enquiries = [];
        if (!dbMemoryCache.medicines || dbMemoryCache.medicines.length === 0) {
          dbMemoryCache.medicines = [...DEFAULT_DENTAL_MEDICINES];
        }
        if (!dbMemoryCache.counters) {
          dbMemoryCache.counters = { ...DEFAULT_COUNTERS };
        } else {
          dbMemoryCache.counters = { ...DEFAULT_COUNTERS, ...dbMemoryCache.counters };
        }
        return dbMemoryCache;
      }
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
  if (!db.counters) db.counters = { ...DEFAULT_COUNTERS };
  const currentYear = new Date().getFullYear();
  db.counters.opNumber = (db.counters.opNumber || 0) + 1;
  const opNumber = `OP-${currentYear}-${String(db.counters.opNumber).padStart(5, '0')}`;
  saveDb(db);
  return opNumber;
}

export function generateTokenNumber(isWalkIn: boolean = false): string {
  const db = getDb();
  if (!db.counters) db.counters = { ...DEFAULT_COUNTERS };
  if (isWalkIn) {
    db.counters.tokenWalkIn = (db.counters.tokenWalkIn || 0) + 1;
    const token = `W-${String(db.counters.tokenWalkIn).padStart(3, '0')}`;
    saveDb(db);
    return token;
  } else {
    db.counters.tokenNormal = (db.counters.tokenNormal || 0) + 1;
    const token = `A-${String(db.counters.tokenNormal).padStart(3, '0')}`;
    saveDb(db);
    return token;
  }
}

export function generateVisitId(): string {
  const db = getDb();
  if (!db.counters) db.counters = { ...DEFAULT_COUNTERS };
  const currentYear = new Date().getFullYear();
  db.counters.visitNumber = Math.max((db.counters.visitNumber || 0) + 1, (db.visits?.length || 0) + 1);
  const visitId = `VIS-${currentYear}-${String(db.counters.visitNumber).padStart(5, '0')}`;
  saveDb(db);
  return visitId;
}

export function generateInvoiceNumber(): string {
  const db = getDb();
  if (!db.counters) db.counters = { ...DEFAULT_COUNTERS };
  const currentYear = new Date().getFullYear();

  const existingIds = new Set<string>();
  (db.invoices || []).forEach((i) => existingIds.add(i.id));
  (db.patients || []).forEach((p) => (p.invoices || []).forEach((i) => existingIds.add(i.id)));

  let nextNum = Math.max(db.counters.invoiceNumber || 0, existingIds.size) + 1;
  let invId = `INV-${currentYear}-${String(nextNum).padStart(4, '0')}`;
  while (existingIds.has(invId)) {
    nextNum += 1;
    invId = `INV-${currentYear}-${String(nextNum).padStart(4, '0')}`;
  }

  db.counters.invoiceNumber = nextNum;
  saveDb(db);
  return invId;
}

export function generateReceiptNumber(): string {
  const db = getDb();
  if (!db.counters) db.counters = { ...DEFAULT_COUNTERS };
  const currentYear = new Date().getFullYear();

  const existingIds = new Set<string>();
  (db.payments || []).forEach((p) => {
    if (p.receiptNumber) existingIds.add(p.receiptNumber);
    if (p.id) existingIds.add(p.id);
  });
  (db.patients || []).forEach((p) => (p.payments || []).forEach((pay) => {
    if (pay.receiptNumber) existingIds.add(pay.receiptNumber);
    if (pay.id) existingIds.add(pay.id);
  }));

  let nextNum = Math.max(db.counters.receiptNumber || 0, existingIds.size) + 1;
  let recId = `REC-${currentYear}-${String(nextNum).padStart(4, '0')}`;
  while (existingIds.has(recId)) {
    nextNum += 1;
    recId = `REC-${currentYear}-${String(nextNum).padStart(4, '0')}`;
  }

  db.counters.receiptNumber = nextNum;
  saveDb(db);
  return recId;
}

export function generatePrescriptionId(): string {
  const db = getDb();
  if (!db.counters) db.counters = { ...DEFAULT_COUNTERS };
  const currentYear = new Date().getFullYear();

  const existingIds = new Set<string>();
  (db.prescriptions || []).forEach((p) => existingIds.add(p.id));
  (db.patients || []).forEach((p) => (p.prescriptions || []).forEach((rx) => existingIds.add(rx.id)));

  let nextNum = Math.max(db.counters.prescriptionNumber || 0, existingIds.size) + 1;
  let rxId = `RX-${currentYear}-${String(nextNum).padStart(4, '0')}`;
  while (existingIds.has(rxId)) {
    nextNum += 1;
    rxId = `RX-${currentYear}-${String(nextNum).padStart(4, '0')}`;
  }

  db.counters.prescriptionNumber = nextNum;
  saveDb(db);
  return rxId;
}

export function generateFeeApprovalId(): string {
  const db = getDb();
  if (!db.counters) db.counters = { ...DEFAULT_COUNTERS };
  const currentYear = new Date().getFullYear();

  const existingIds = new Set<string>();
  (db.feeApprovals || []).forEach((f) => existingIds.add(f.id));
  (db.patients || []).forEach((p) => (p.feeApprovals || []).forEach((fa) => existingIds.add(fa.id)));

  let nextNum = Math.max(db.counters.feeApprovalNumber || 0, existingIds.size) + 1;
  let faId = `FA-${currentYear}-${String(nextNum).padStart(4, '0')}`;
  while (existingIds.has(faId)) {
    nextNum += 1;
    faId = `FA-${currentYear}-${String(nextNum).padStart(4, '0')}`;
  }

  db.counters.feeApprovalNumber = nextNum;
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
