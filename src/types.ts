export type ViewMode =
  // Public
  | 'landing'
  | 'booking'
  | 'reception-tv'
  | 'login'
  // Customer / Patient
  | 'patient-portal'
  | 'customer-appointments'
  | 'customer-token'
  | 'customer-treatment'
  | 'customer-records'
  | 'customer-profile'
  | 'customer-billing'
  // Staff / Reception
  | 'staff-dashboard'
  | 'staff-checkin'
  | 'staff-appointments'
  | 'staff-patients'
  | 'staff-queue'
  | 'staff-token-control'
  | 'staff-chairs'
  | 'staff-whatsapp'
  | 'staff-payments'
  // Doctor
  | 'doctor-dashboard'
  | 'doctor-patients'
  | 'doctor-queue'
  | 'doctor-appointments'
  | 'doctor-dental-chart'
  | 'doctor-treatment-plans'
  | 'doctor-clinical-notes'
  | 'doctor-lab-orders'
  | 'doctor-followups'
  // Admin
  | 'admin-dashboard'
  | 'admin-patients'
  | 'admin-appointments'
  | 'admin-doctors'
  | 'admin-staff'
  | 'admin-queue'
  | 'admin-chairs'
  | 'admin-inventory'
  | 'admin-billing'
  | 'admin-reports'
  | 'admin-whatsapp'
  | 'admin-settings'
  // Follow-Up Management Views
  | 'follow-ups'
  | 'staff-followups'
  | 'admin-followups'
  // Shared / Legacy aliases
  | 'appointment-mgmt'
  | 'token-control'
  | 'reception-tv'
  | 'patient-mgmt'
  | 'patient-profile'
  | 'patient-detail'
  | 'dental-chairs'
  | 'inventory'
  | 'billing'
  | 'whatsapp'
  | 'reports'
  | 'live-queue';

export type UserRole =
  | 'customer'
  | 'receptionist'
  | 'doctor'
  | 'admin'
  | 'dental_assistant'
  | 'billing'
  // Legacy string format support
  | 'Doctor'
  | 'Admin'
  | 'Receptionist'
  | 'Dental Assistant'
  | 'Billing Staff';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  patientId?: string; // For customer
  doctorId?: string;  // For doctor
  avatar?: string;
  title?: string;
}

export interface StaffUser {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  phone?: string;
  specialization?: string;
  qualification?: string;
  roomNumber?: string;
  status: 'Active' | 'Inactive';
  createdAt?: string;
  avatar?: string;
}

export type AppointmentStatus =
  | 'BOOKED'
  | 'CONFIRMED'
  | 'RESCHEDULED'
  | 'CANCELLED'
  | 'NO_SHOW'
  | 'COMPLETED';

export type VisitStatus =
  | 'Checked In'
  | 'Waiting'
  | 'Called'
  | 'In Consultation'
  | 'Consultation Completed'
  | 'Reception Follow-up'
  | 'Closed'
  | 'Completed'
  | 'Cancelled'
  | 'No Show';

export interface VisitTimelineEvent {
  time: string;
  event: string;
  actor?: string;
  notes?: string;
}

export interface PrescriptionItem {
  id: string;
  medicine: string;
  dosage: string;
  route?: string; // Oral, Topical, Sublingual, etc.
  frequency: string; // OD, BD, TDS, QID, SOS, Stat
  duration: string; // 3 days, 5 days, 7 days
  instructions: string; // After food, Before food, etc.
}

export interface PrescriptionRecord {
  id: string; // e.g. RX-2026-0001
  visitId: string;
  patientId: string;
  patientName: string;
  patientOpNumber: string;
  patientAge?: number;
  patientGender?: string;
  doctorId: string;
  doctorName: string;
  doctorTitle?: string;
  clinicName: string;
  clinicAddress: string;
  clinicPhone: string;
  date: string;
  diagnosis?: string;
  items: PrescriptionItem[];
  doctorNotes?: string;
  followUpDate?: string;
  createdAt: string;
}

export interface FeeApprovalItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface FeeApprovalRecord {
  id: string; // e.g. FA-2026-0001
  visitId: string;
  patientId: string;
  patientName: string;
  patientOpNumber: string;
  doctorId: string;
  doctorName: string;
  consultationFee: number;
  items: FeeApprovalItem[];
  subtotal: number;
  discountType: 'amount' | 'percentage';
  discountValue: number;
  discountAmount: number;
  discountReason: string;
  authorizingDoctorId: string;
  authorizingDoctorName: string;
  tax: number;
  finalPayable: number;
  approvedAt: string;
  status: 'Draft' | 'Approved' | 'Invoiced';
  invoiceId?: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string; // e.g. 'PATIENT_REGISTERED', 'CONSULTATION_COMPLETED', 'FEE_APPROVED', 'PAYMENT_RECORDED', 'APPOINTMENT_RESCHEDULED'
  entityType: string; // 'Patient', 'Visit', 'Invoice', 'Payment', 'Appointment'
  entityId: string;
  details: string;
  metadata?: Record<string, any>;
}

export interface ClinicVisit {
  id: string; // e.g. VIS-2026-00882
  patientId: string;
  patientName: string;
  opNumber?: string;
  patientPhone?: string;
  appointmentId?: string;
  doctorId: string;
  doctorName: string;
  visitDate: string;
  checkInTime: string; // "10:21 AM"
  calledTime?: string;
  consultationStartTime?: string;
  consultationEndTime?: string;
  completedByDoctor?: string;
  closedAt?: string;
  closedBy?: string;
  status: VisitStatus;
  tokenId?: string; // "A-024" or "W-001"
  chairId?: string;
  chairName?: string;
  priority: 'Normal' | 'Urgent' | 'Emergency';
  reasonForVisit: string;
  timeline: VisitTimelineEvent[];
  clinicalNotes?: string;
  historyOfPresentIllness?: string;
  medicalHistoryReview?: string;
  dentalHistoryReview?: string;
  allergiesObserved?: string[];
  diagnosis?: string;
  treatmentPlan?: string;
  toothNumber?: number;
  prescriptions?: string;
  prescriptionRecord?: PrescriptionRecord;
  feeApproval?: FeeApprovalRecord;
  invoiceId?: string;
  followUpDate?: string;
  followUpReason?: string;
  adminNotes?: string;
}

export type TokenQueueStatus =
  | 'Waiting'
  | 'Called'
  | 'In Consultation'
  | 'Reception Follow-up'
  | 'On Hold'
  | 'Skipped'
  | 'Completed'
  | 'Cancelled';

export interface QueueToken {
  id: string;
  tokenNumber: string; // e.g. "A-024", "W-001"
  patientId: string;
  patientName: string;
  patientPhone?: string;
  appointmentId?: string;
  visitId: string;
  doctorId: string;
  doctorName: string;
  chairId?: string;
  chairName?: string;
  date: string;
  status: TokenQueueStatus;
  priority: 'Normal' | 'Urgent' | 'Emergency';
  createdAt: string; // "10:21 AM" or ISO
  calledAt?: string;
  consultationStartedAt?: string;
  completedAt?: string;
  estimatedWaitMinutes?: number;
}

export type TokenStatus = 'Waiting' | 'Confirmed' | 'In Consultation' | 'Completed' | 'Cancelled' | 'On Hold' | 'Skipped';

export type ToothCondition =
  | 'Healthy'
  | 'Caries'
  | 'Filling'
  | 'Crown'
  | 'Root Canal'
  | 'Missing'
  | 'Implant'
  | 'Fracture'
  | 'Extraction Required'
  | 'Mobility'
  | 'Sensitivity'
  | 'Other';

export type ToothSurface = 'Mesial' | 'Distal' | 'Occlusal' | 'Buccal' | 'Lingual';

export type TreatmentPlanStatus = 'Proposed' | 'Accepted' | 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';

export type PonticType = 'Modified Ridge' | 'Full Ridge' | 'Hygienic' | 'Ovate';

export type CollarType = 'No Collar' | 'Lingual Collar' | '360° Collar';

export interface ToothSurfaceState {
  mesial?: ToothCondition;
  distal?: ToothCondition;
  occlusal?: ToothCondition;
  buccal?: ToothCondition;
  lingual?: ToothCondition;
}

export interface ToothData {
  toothNumber: number; // FDI 11-48, 51-85
  type: 'adult' | 'child';
  condition: ToothCondition;
  surfaces: ToothSurfaceState;
  notes?: string;
  treatments?: string[];
  treatmentCode?: string; // 'R', 'C', 'CR', 'F', 'I', 'X', 'E', 'B', 'P', 'W'
  treatmentStatus?: TreatmentPlanStatus;
}

export interface ProstheticDesign {
  restorationType: 'Crown' | 'Bridge' | 'Veneer' | 'Inlay' | 'Onlay';
  material: 'Zirconia' | 'Ceramic' | 'PFM' | 'Metal' | 'E-Max' | 'Composite';
  shade: 'A1' | 'A2' | 'A3' | 'B1' | 'B2' | 'C1' | 'D2';
  ponticDesign?: PonticType;
  collarDesign?: CollarType;
  marginDesign?: string;
  occlusionNotes?: string;
  labInstructions?: string;
}

export interface TreatmentPlanItem {
  id: string;
  patientId: string;
  toothNumbers: number[];
  diagnosis: string;
  procedure: string;
  priority: 'High' | 'Medium' | 'Low';
  estimatedCost: number;
  status: TreatmentPlanStatus;
  doctorId: string;
  doctorName: string;
  notes?: string;
  prostheticDesign?: ProstheticDesign;
  createdAt: string;
  completedAt?: string;
}

export interface LabOrder {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  toothNumbers: number[];
  treatment: string;
  labName: string;
  labType: 'Crown' | 'Bridge' | 'Denture' | 'Implant' | 'Orthodontic' | 'Other';
  orderDate: string;
  expectedDate: string;
  instructions: string;
  status: 'Requested' | 'Sent to Lab' | 'In Progress' | 'Ready' | 'Received' | 'Delivered';
  prostheticDetails?: ProstheticDesign;
}

export interface ClinicalNote {
  id: string;
  patientId: string;
  visitId?: string;
  date: string;
  doctorName: string;
  chiefComplaint: string;
  historyOfPresentComplaint?: string;
  clinicalFindings: string;
  diagnosis: string;
  treatmentPerformed: string;
  doctorNotes: string;
  nextVisitInstructions: string;
  prescriptions?: {
    medicine: string;
    dosage: string;
    duration: string;
    instructions: string;
  }[];
}

export interface DiagnosisRecord {
  id: string;
  patientId: string;
  diagnosis: string;
  toothNumber?: number;
  severity: 'Mild' | 'Moderate' | 'Severe';
  notes: string;
  doctorName: string;
  date: string;
}

export interface TreatmentSession {
  id: string;
  patientId: string;
  doctorName: string;
  toothNumber: number;
  treatment: string;
  procedure: string;
  materialsUsed: string;
  duration: string;
  notes: string;
  status: 'Started' | 'In Progress' | 'Completed';
  date: string;
}

export type FollowUpCategory =
  | 'Post-Procedure Check'
  | 'Suture Removal'
  | 'Crown / Prosthetic Fitting'
  | 'Aligner Review'
  | 'Root Canal Review'
  | 'Routine Hygiene Recall'
  | 'Pediatric Checkup'
  | 'General Review';

export type FollowUpStatus =
  | 'Scheduled'
  | 'Due'
  | 'Overdue'
  | 'Contacted'
  | 'Completed'
  | 'Missed'
  | 'Cancelled';

export interface FollowUpRecord {
  id: string;
  patientId: string;
  patientName?: string;
  patientPhone?: string;
  patientOpNumber?: string;
  date: string;
  time?: string;
  doctorId?: string;
  doctorName: string;
  category?: FollowUpCategory;
  reason: string; // e.g. "Root Canal Review & Obturation", "Crown Delivery"
  treatment?: string;
  notes: string;
  status: FollowUpStatus;
  priority?: 'Normal' | 'Urgent' | 'Routine';
  lastContactedDate?: string;
  contactMethod?: 'WhatsApp' | 'Phone Call' | 'In-Clinic' | 'SMS';
  completedAt?: string;
  completedNotes?: string;
}

export interface PatientVisit {
  id: string;
  patientId: string;
  date: string;
  doctorName: string;
  chiefComplaint: string;
  clinicalFindings: string;
  diagnosis: string;
  dentalChartState?: ToothData[];
  treatment: string;
  doctorNotes: string;
  prescription?: string;
  followUp?: string;
  timelineType?: 'Consultation' | 'Examination' | 'Treatment' | 'Lab Order' | 'Follow-up' | 'Review';
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export type PaymentMethod = 'Cash' | 'UPI' | 'Card' | 'Net Banking' | 'Insurance' | 'Cheque';

export interface PaymentRecord {
  id: string; // e.g. "PAY-2026-0089"
  receiptNumber: string; // e.g. "REC-2026-0042"
  invoiceId: string;
  patientId: string;
  patientName: string;
  patientPhone?: string;
  doctorName?: string;
  amount: number;
  paymentMethod: PaymentMethod;
  referenceNumber?: string; // UPI txn ref / card auth / bank ref
  receivedBy: string; // "Reception Desk", "Dr. Priya Sharma", "Patient Online Portal"
  date: string; // YYYY-MM-DD
  time: string; // "10:30 AM"
  notes?: string;
  status: 'Successful' | 'Refunded' | 'Pending Verification';
}

export interface Invoice {
  id: string;
  patientId: string;
  patientName: string;
  patientOpNumber?: string;
  doctorName: string;
  date: string;
  dueDate?: string;
  feeApprovalId?: string;
  approvedBy?: string;
  discountReason?: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paid: number;
  balance: number;
  status: 'Paid' | 'Partial' | 'Pending';
  paymentMethod?: PaymentMethod;
  payments?: PaymentRecord[];
}

export interface DocumentRecord {
  id: string;
  patientId: string;
  name: string;
  category: 'X-rays' | 'Scans' | 'Reports' | 'Prescriptions' | 'Consent Forms' | 'Treatment Documents';
  date: string;
  doctorName: string;
  description: string;
  fileType: 'PDF' | 'DICOM' | 'JPG';
  fileSize?: string;
}

export interface DentalChair {
  id: string;
  name: string; // "Chair 01"
  room: string;
  status: 'Available' | 'Occupied' | 'Cleaning' | 'Maintenance';
  assignedDoctorId?: string;
  assignedDoctorName?: string;
  currentPatientName?: string;
  currentTreatment?: string;
  currentToken?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'Dental Materials' | 'Medicines' | 'Instruments' | 'Consumables' | 'Lab Materials';
  stock: number;
  minStock: number;
  unit: string;
  expiryDate: string;
  supplier: string;
  alertStatus: 'Normal' | 'Low Stock' | 'Expired' | 'Expiring Soon';
}

export interface Doctor {
  id: string;
  name: string;
  title: string;
  qualification: string;
  specialization: string;
  experience: string;
  rating: number;
  reviewsCount: number;
  avatar: string;
  availableDays: string[];
  slots: string[];
  bio: string;
  roomNumber: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  iconName: string;
  duration: string;
  price: number;
  category: string;
}

export interface Appointment {
  id: string;
  patientId?: string;
  tokenId?: string; // e.g. "A-023" (Assigned on check-in)
  visitId?: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  patientAge: number;
  patientGender: 'Male' | 'Female' | 'Other';
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "10:30 AM"
  reasonForVisit: string;
  appointmentStatus?: AppointmentStatus;
  status: TokenStatus | AppointmentStatus;
  createdAt: string;
  estimatedWaitMinutes?: number;
  notes?: string;
  amount: number;
}

export interface PatientEnquiry {
  id: string; // e.g. ENQ-2026-0001
  patientName: string;
  phone: string;
  email?: string;
  preferredDate?: string;
  preferredTimeWindow?: string;
  chiefComplaint: string;
  preferredDoctorId?: string;
  preferredDoctorName?: string;
  notes?: string;
  status: 'New' | 'Contacted' | 'Appointment Booked' | 'Registered' | 'Archived';
  createdAt: string;
}

export type PatientStatus = 'New Patient' | 'Existing Patient' | 'Active Treatment' | 'Follow-up' | 'Treatment Completed';

export interface PatientRecord {
  id: string; // e.g. PAT-2026-000124
  opNumber?: string; // e.g. OP-2026-00124 (Dedicated Outpatient Number)
  name: string;
  dateOfBirth?: string;
  phone: string;
  secondaryPhone?: string;
  email?: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  address?: string;
  referralSource?: string;
  registeredBy?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relation: string;
  };
  assignedDoctorId?: string;
  assignedDoctorName?: string;
  firstVisitDate: string;
  lastVisit: string;
  totalVisits: number;
  upcomingAppointmentDate?: string;
  currentTreatment?: string;
  status: PatientStatus;
  outstandingBalance: number;
  caseSheetCompleted?: boolean;
  caseSheetCompletedAt?: string;

  medicalHistory: {
    allergies: string[];
    conditions: string[];
    hasDiabetes: boolean;
    hasBloodPressure: boolean;
    hasHeartConditions: boolean;
    hasAsthma?: boolean;
    hasBleedingDisorders?: boolean;
    currentMedications: string[];
    previousSurgeries: string[];
    otherNotes?: string;
  };

  dentalHistory: {
    caseSheetCompleted?: boolean;
    completedAt?: string;
    previousDentist?: string;
    lastDentalVisit?: string;
    previousTreatments?: string[];
    currentComplaint?: string;
    historyOfPresentIllness?: string;
    habits?: string[];
    previousXRays?: string;
    notes?: string;
  };

  // Backwards compatibility convenience arrays
  allergies?: string[];
  recentTreatments: {
    date: string;
    doctorName: string;
    treatment: string;
    notes: string;
    cost: number;
  }[];

  // Comprehensive EMR records
  visits: PatientVisit[];
  dentalChart: ToothData[];
  treatmentPlans: TreatmentPlanItem[];
  clinicalNotes: ClinicalNote[];
  diagnoses: DiagnosisRecord[];
  treatmentSessions: TreatmentSession[];
  labOrders: LabOrder[];
  documents: DocumentRecord[];
  invoices: Invoice[];
  payments?: PaymentRecord[];
  prescriptions?: PrescriptionRecord[];
  feeApprovals?: FeeApprovalRecord[];
  followUps: FollowUpRecord[];
  auditLog?: AuditEvent[];
}

export interface WhatsAppReminder {
  id: string;
  patientName: string;
  phone: string;
  appointmentDate: string;
  appointmentTime: string;
  doctorName: string;
  type: 'Confirmation' | '24h Reminder' | 'Token Update' | 'Post Visit Care';
  status: 'Scheduled' | 'Sent' | 'Failed' | 'Pending';
  scheduledFor: string;
  messageText: string;
}

export interface Testimonial {
  id: string;
  patientName: string;
  role: string;
  comment: string;
  rating: number;
  date: string;
  avatar: string;
}

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type: 'success' | 'info' | 'warning' | 'danger';
}

