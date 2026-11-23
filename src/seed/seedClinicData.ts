import { 
  PatientRecord, 
  QueueToken, 
  ClinicVisit, 
  Invoice, 
  PaymentRecord, 
  PrescriptionRecord, 
  StaffUser, 
  FeeApprovalRecord, 
  MedicineRecord, 
  Doctor 
} from '../types';

// Clean production baseline - 0 fake demo patients
export const SEED_PATIENTS: PatientRecord[] = [];

// Clean production baseline - 0 active demo tokens
export const SEED_TOKENS: QueueToken[] = [];

// Clean production baseline - 0 fake visits
export const SEED_VISITS: ClinicVisit[] = [];

// Clean production baseline - 0 fake invoices
export const SEED_INVOICES: Invoice[] = [];

// Clean production baseline - 0 fake payments
export const SEED_PAYMENTS: PaymentRecord[] = [];

// Clean production baseline - 0 fake prescriptions
export const SEED_PRESCRIPTIONS: PrescriptionRecord[] = [];

// Clean production baseline - 0 fee approvals
export const SEED_FEE_APPROVALS: FeeApprovalRecord[] = [];

export const SEED_USERS: StaffUser[] = [
  {
    "id": "usr-admin-01",
    "name": "ADMIN",
    "email": "admin@clinic.com",
    "role": "admin",
    "password": "Password@123",
    "phone": "+91 98765 33445",
    "status": "Active"
  }
];

export const SEED_MEDICINES: MedicineRecord[] = [
  {
    "id": "med-001",
    "name": "Amoxicillin + Clavulanate (Augmentin)",
    "dosage": "625mg",
    "route": "Oral",
    "frequency": "BD",
    "duration": "5 days",
    "instructions": "After food",
    "category": "Antibiotic"
  },
  {
    "id": "med-002",
    "name": "Amoxicillin",
    "dosage": "500mg",
    "route": "Oral",
    "frequency": "TDS",
    "duration": "5 days",
    "instructions": "After food",
    "category": "Antibiotic"
  },
  {
    "id": "med-003",
    "name": "Ibuprofen + Paracetamol (Combiflam)",
    "dosage": "400mg/325mg",
    "route": "Oral",
    "frequency": "SOS",
    "duration": "3 days",
    "instructions": "After food (with antacid)",
    "category": "Analgesic"
  },
  {
    "id": "med-004",
    "name": "Ketorolac Tromethamine (Ketorol-DT)",
    "dosage": "10mg",
    "route": "Oral",
    "frequency": "SOS",
    "duration": "3 days",
    "instructions": "Disperse in warm water",
    "category": "Analgesic"
  },
  {
    "id": "med-005",
    "name": "Metronidazole (Flagyl)",
    "dosage": "400mg",
    "route": "Oral",
    "frequency": "TDS",
    "duration": "5 days",
    "instructions": "After meals",
    "category": "Antibiotic"
  },
  {
    "id": "med-006",
    "name": "Chlorhexidine Gluconate Mouthwash",
    "dosage": "10ml",
    "route": "Topical rinse",
    "frequency": "BD",
    "duration": "7 days",
    "instructions": "Swish for 60 seconds, no food for 30m",
    "category": "Antiseptic"
  },
  {
    "id": "med-007",
    "name": "Pantoprazole (Pan-40)",
    "dosage": "40mg",
    "route": "Oral",
    "frequency": "OD",
    "duration": "5 days",
    "instructions": "Before breakfast",
    "category": "Antacid"
  },
  {
    "id": "med-008",
    "name": "Triamcinolone Acetonide (Kenacort 0.1%)",
    "dosage": "Pea size",
    "route": "Topical application",
    "frequency": "TDS",
    "duration": "5 days",
    "instructions": "Apply over ulcer after meals",
    "category": "Topical"
  },
  {
    "id": "med-009",
    "name": "Paracetamol (Dolo 650)",
    "dosage": "650mg",
    "route": "Oral",
    "frequency": "SOS",
    "duration": "3 days",
    "instructions": "After food for fever or mild pain",
    "category": "Analgesic"
  },
  {
    "id": "med-010",
    "name": "Aceclofenac + Paracetamol (Zerodol-P)",
    "dosage": "100mg/325mg",
    "route": "Oral",
    "frequency": "BD",
    "duration": "3 days",
    "instructions": "After food",
    "category": "Analgesic"
  }
];

export const SEED_DOCTORS: Doctor[] = SEED_USERS
  .filter((u) => u.role === 'doctor')
  .map((u) => ({
    id: u.id,
    name: u.name,
    specialization: u.specialization || 'Orthodontics & Aligners',
    qualification: u.qualification || 'BDS, MDS',
    experience: '8+ Years',
    avatar: u.avatar || '',
    availability: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    cabinNumber: u.roomNumber || 'Cabin 101',
    rating: 4.9,
    reviewsCount: 120,
    phone: u.phone || '+91 9400320890',
    email: u.email || ''
  }));
