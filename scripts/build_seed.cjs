const fs = require('fs');
const path = require('path');

const raw = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'clinic_data.json'), 'utf8'));

fs.mkdirSync(path.join(__dirname, '..', 'src', 'seed'), { recursive: true });

const content = `import { 
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

export const SEED_PATIENTS: PatientRecord[] = ${JSON.stringify(raw.patients, null, 2)};

export const SEED_TOKENS: QueueToken[] = ${JSON.stringify(raw.tokens, null, 2)};

export const SEED_VISITS: ClinicVisit[] = ${JSON.stringify(raw.visits, null, 2)};

export const SEED_INVOICES: Invoice[] = ${JSON.stringify(raw.invoices, null, 2)};

export const SEED_PAYMENTS: PaymentRecord[] = ${JSON.stringify(raw.payments, null, 2)};

export const SEED_PRESCRIPTIONS: PrescriptionRecord[] = ${JSON.stringify(raw.prescriptions, null, 2)};

export const SEED_USERS: StaffUser[] = ${JSON.stringify(raw.users, null, 2)};

export const SEED_FEE_APPROVALS: FeeApprovalRecord[] = ${JSON.stringify(raw.feeApprovals, null, 2)};

export const SEED_MEDICINES: MedicineRecord[] = ${JSON.stringify(raw.medicines, null, 2)};

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
    email: u.email || 'doctor@gmail.com'
  }));
`;

fs.writeFileSync(path.join(__dirname, '..', 'src', 'seed', 'seedClinicData.ts'), content, 'utf8');
console.log('Successfully written src/seed/seedClinicData.ts');

