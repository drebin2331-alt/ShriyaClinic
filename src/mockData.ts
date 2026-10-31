import { 
  Doctor, 
  Service, 
  Appointment, 
  PatientRecord, 
  WhatsAppReminder, 
  DentalChair, 
  InventoryItem, 
  ClinicVisit, 
  QueueToken, 
  Invoice, 
  PaymentRecord 
} from './types';

// ============================================================================
// CLINICAL SERVICES DIRECTORY
// ============================================================================
export const MOCK_SERVICES: Service[] = [
  {
    id: 'srv-1',
    name: 'Comprehensive Dental Examination & Digital Charting',
    category: 'Diagnostic',
    price: 500,
    duration: '30 mins',
    description: 'Complete oral cavity examination, digital intraoral screening and personalized treatment plan.'
  },
  {
    id: 'srv-2',
    name: 'Ultrasonic Scaling & Deep Polishing',
    category: 'Preventive',
    price: 1500,
    duration: '45 mins',
    description: 'Painless ultrasonic plaque and calculus removal with air-polishing.'
  },
  {
    id: 'srv-3',
    name: 'Composite Light-Cure Tooth Colored Restoration',
    category: 'Restorative',
    price: 1800,
    duration: '45 mins',
    description: 'Nanohybrid aesthetic filling matching the natural tooth shade.'
  },
  {
    id: 'srv-4',
    name: 'Single Sitting Microscopic Root Canal Treatment',
    category: 'Endodontics',
    price: 4500,
    duration: '60 mins',
    description: 'Apex locator and rotary biomechanical preparation for infected pulp removal.'
  },
  {
    id: 'srv-5',
    name: 'Zirconia Monolithic Crown (15-Yr Warranty)',
    category: 'Prosthodontics',
    price: 6500,
    duration: '45 mins',
    description: 'CAD/CAM milled biocompatible monolithic ceramic crown.'
  },
  {
    id: 'srv-6',
    name: 'At-Clinic Laser Teeth Whitening (Zoom Style)',
    category: 'Cosmetic',
    price: 8000,
    duration: '60 mins',
    description: 'Hydrogen peroxide laser-activated shade lightening up to 6-8 shades.'
  },
  {
    id: 'srv-7',
    name: 'Clear Aligner Scan & Assessment',
    category: 'Orthodontics',
    price: 1200,
    duration: '45 mins',
    description: '3D digital impression scan, AI crowding analysis, and virtual treatment simulation.'
  },
  {
    id: 'srv-8',
    name: 'Surgical Disimpaction (Wisdom Tooth Removal)',
    category: 'Surgery',
    price: 4000,
    duration: '60 mins',
    description: 'Minimally invasive third molar surgical extraction with local anesthesia.'
  }
];

// ============================================================================
// CLINICAL DOCTORS (Empty by default - Created manually by Admin in Supabase)
// ============================================================================
export const MOCK_DOCTORS: Doctor[] = [];

// ============================================================================
// DENTAL OPERATORIES & CHAIRS (Matches Supabase Schema)
// ============================================================================
export const MOCK_CHAIRS: DentalChair[] = [
  {
    id: 'chair-1',
    name: 'Dental Operatory 1 (Main Surgery)',
    doctorName: 'Unassigned',
    status: 'Available',
    isOperational: true
  },
  {
    id: 'chair-2',
    name: 'Dental Operatory 2 (Cosmetic & Implants)',
    doctorName: 'Dr. Rajesh Patel',
    status: 'Available',
    isOperational: true
  },
  {
    id: 'chair-3',
    name: 'Dental Operatory 3 (Pediatric & Hygiene)',
    doctorName: 'Unassigned',
    status: 'Available',
    isOperational: true
  },
  {
    id: 'chair-4',
    name: 'Dental Operatory 4 (Endodontics)',
    doctorName: 'Unassigned',
    status: 'Available',
    isOperational: true
  }
];

// ============================================================================
// REAL CLINIC DATA - EMPTY ARRAYS (Ready for live Supabase insertion)
// All mock patients, mock appointments, mock visits, mock tokens, mock invoices,
// and mock payments have been deleted as requested.
// ============================================================================
export const MOCK_PATIENTS: PatientRecord[] = [];
export const INITIAL_APPOINTMENTS: Appointment[] = [];
export const INITIAL_VISITS: ClinicVisit[] = [];
export const INITIAL_TOKENS: QueueToken[] = [];
export const INITIAL_INVOICES: Invoice[] = [];
export const INITIAL_PAYMENTS: PaymentRecord[] = [];
export const MOCK_WHATSAPP_REMINDERS: WhatsAppReminder[] = [];
export const MOCK_INVENTORY: InventoryItem[] = [];
