-- ============================================================================
-- SMILECARE DENTAL CLINIC - COMPLETE SUPABASE DATABASE SCHEMA
-- ============================================================================
-- Copy and paste this entire script into your Supabase SQL Editor and click "RUN".
-- This creates all required tables, constraints, indexes, triggers, and RLS policies.
-- ============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 2. PROFILES & USER ACCOUNTS TABLE (Admin-Provisioned Staff & Patient Accounts)
-- ============================================================================
-- Note: Supabase Auth service is NOT required. Accounts are directly provisioned
-- by the Clinic Administrator for Doctors, Receptionists, and Patients.
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL DEFAULT 'Password@123',
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'doctor', 'receptionist', 'billing', 'customer')),
  title TEXT,
  phone TEXT,
  avatar TEXT,
  doctor_id TEXT,
  patient_id TEXT,
  specialization TEXT,
  qualification TEXT,
  room_number TEXT,
  status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'On Leave')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Safe migration for existing tables: add password column & remove auth.users FK
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS password TEXT NOT NULL DEFAULT 'Password@123';
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
DO $$
BEGIN
  ALTER TABLE public.profiles ALTER COLUMN id TYPE TEXT;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- ============================================================================
-- 3. PATIENTS TABLE (Full Clinical EMR Master)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.patients (
  id TEXT PRIMARY KEY, -- e.g. PAT-2026-000101
  op_number TEXT UNIQUE, -- e.g. OP-2026-00101
  name TEXT NOT NULL,
  date_of_birth DATE,
  phone TEXT NOT NULL,
  secondary_phone TEXT,
  email TEXT,
  age INTEGER,
  gender TEXT CHECK (gender IN ('Male', 'Female', 'Other')),
  address TEXT,
  referral_source TEXT,
  registered_by TEXT,
  emergency_contact JSONB DEFAULT '{"name": "", "phone": "", "relation": ""}'::jsonb,
  assigned_doctor_id TEXT,
  assigned_doctor_name TEXT,
  first_visit_date TEXT,
  last_visit TEXT,
  total_visits INTEGER DEFAULT 0,
  upcoming_appointment_date TEXT,
  current_treatment TEXT,
  status TEXT DEFAULT 'New Patient' CHECK (status IN ('New Patient', 'Existing Patient', 'Active Treatment', 'Follow-up', 'Treatment Completed')),
  outstanding_balance NUMERIC(12,2) DEFAULT 0.00,
  medical_history JSONB DEFAULT '{"allergies": [], "conditions": [], "hasDiabetes": false, "hasBloodPressure": false, "hasHeartConditions": false, "currentMedications": [], "previousSurgeries": [], "otherNotes": ""}'::jsonb,
  dental_history JSONB DEFAULT '{"currentComplaint": ""}'::jsonb,
  dental_chart JSONB DEFAULT '{}'::jsonb,
  clinical_notes JSONB DEFAULT '[]'::jsonb,
  treatment_plans JSONB DEFAULT '[]'::jsonb,
  allergies JSONB DEFAULT '[]'::jsonb,
  visits JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_patients_phone ON public.patients(phone);
CREATE INDEX IF NOT EXISTS idx_patients_op_number ON public.patients(op_number);
CREATE INDEX IF NOT EXISTS idx_patients_name ON public.patients(name);

-- ============================================================================
-- 4. APPOINTMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.appointments (
  id TEXT PRIMARY KEY, -- e.g. apt-1700000000
  token_id TEXT, -- e.g. A-024
  patient_id TEXT REFERENCES public.patients(id) ON DELETE SET NULL,
  patient_name TEXT NOT NULL,
  patient_phone TEXT NOT NULL,
  patient_age INTEGER,
  patient_gender TEXT,
  patient_email TEXT,
  doctor_id TEXT NOT NULL,
  doctor_name TEXT NOT NULL,
  date TEXT NOT NULL, -- YYYY-MM-DD
  time_slot TEXT NOT NULL, -- e.g. "10:30 AM"
  reason_for_visit TEXT,
  status TEXT DEFAULT 'Confirmed' CHECK (status IN ('Confirmed', 'Waiting', 'In Consultation', 'Completed', 'Cancelled', 'No-Show')),
  appointment_status TEXT DEFAULT 'CONFIRMED',
  amount NUMERIC(10,2) DEFAULT 0.00,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(date);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor ON public.appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON public.appointments(patient_id);

-- ============================================================================
-- 5. QUEUE TOKENS TABLE (Live OPD Queue)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.tokens (
  id TEXT PRIMARY KEY,
  token_number TEXT NOT NULL, -- e.g. "A-001"
  visit_id TEXT,
  appointment_id TEXT,
  patient_id TEXT,
  patient_name TEXT NOT NULL,
  patient_phone TEXT,
  doctor_id TEXT NOT NULL,
  doctor_name TEXT NOT NULL,
  chair_id TEXT,
  status TEXT DEFAULT 'Waiting' CHECK (status IN ('Waiting', 'Called', 'In Consultation', 'Completed', 'Skipped', 'On Hold', 'Cancelled')),
  priority TEXT DEFAULT 'Normal' CHECK (priority IN ('Normal', 'Urgent', 'Emergency')),
  reason_for_visit TEXT,
  estimated_wait_minutes INTEGER DEFAULT 15,
  called_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tokens_status ON public.tokens(status);
CREATE INDEX IF NOT EXISTS idx_tokens_doctor ON public.tokens(doctor_id);

-- ============================================================================
-- 6. CLINIC VISITS / ENCOUNTERS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.clinic_visits (
  id TEXT PRIMARY KEY,
  appointment_id TEXT,
  token_id TEXT,
  patient_id TEXT NOT NULL,
  doctor_id TEXT NOT NULL,
  doctor_name TEXT,
  chair_id TEXT,
  date TEXT NOT NULL,
  status TEXT DEFAULT 'WAITING',
  queue_status TEXT DEFAULT 'WAITING',
  chief_complaint TEXT,
  clinical_findings TEXT,
  diagnosis TEXT,
  treatment TEXT,
  doctor_notes TEXT,
  consultation_fee NUMERIC(10,2) DEFAULT 500.00,
  total_payable NUMERIC(10,2) DEFAULT 500.00,
  is_walk_in BOOLEAN DEFAULT false,
  check_in_time TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_visits_patient ON public.clinic_visits(patient_id);
CREATE INDEX IF NOT EXISTS idx_visits_date ON public.clinic_visits(date);

-- ============================================================================
-- 7. INVOICES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.invoices (
  id TEXT PRIMARY KEY, -- e.g. INV-2026-001
  visit_id TEXT,
  patient_id TEXT NOT NULL,
  patient_name TEXT NOT NULL,
  doctor_name TEXT NOT NULL,
  items JSONB DEFAULT '[]'::jsonb,
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  discount NUMERIC(12,2) DEFAULT 0.00,
  tax NUMERIC(12,2) DEFAULT 0.00,
  total NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  paid NUMERIC(12,2) DEFAULT 0.00,
  balance NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  status TEXT DEFAULT 'UNPAID' CHECK (status IN ('PAID', 'PARTIALLY_PAID', 'UNPAID', 'CANCELLED')),
  due_date TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_invoices_patient ON public.invoices(patient_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);

-- ============================================================================
-- 8. PAYMENTS & RECEIPTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.payments (
  id TEXT PRIMARY KEY, -- e.g. PAY-2026-001
  invoice_id TEXT NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  patient_id TEXT,
  patient_name TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('Cash', 'Card', 'UPI', 'Insurance', 'NetBanking')),
  reference_number TEXT,
  receipt_number TEXT NOT NULL UNIQUE,
  notes TEXT,
  received_by TEXT,
  date TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payments_invoice ON public.payments(invoice_id);

-- ============================================================================
-- 9. PRESCRIPTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.prescriptions (
  id TEXT PRIMARY KEY,
  visit_id TEXT,
  patient_id TEXT NOT NULL,
  patient_name TEXT NOT NULL,
  doctor_name TEXT NOT NULL,
  items JSONB DEFAULT '[]'::jsonb,
  diagnosis TEXT,
  doctor_notes TEXT,
  follow_up_date TEXT,
  date TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_prescriptions_patient ON public.prescriptions(patient_id);

-- ============================================================================
-- 10. DENTAL CHAIRS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.dental_chairs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  doctor_id TEXT,
  doctor_name TEXT,
  status TEXT DEFAULT 'Available' CHECK (status IN ('Available', 'Occupied', 'Sanitizing', 'Maintenance')),
  current_token_id TEXT,
  current_patient_name TEXT,
  is_operational BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 11. INVENTORY TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.inventory_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  current_stock INTEGER NOT NULL DEFAULT 0,
  minimum_level INTEGER NOT NULL DEFAULT 10,
  unit TEXT NOT NULL DEFAULT 'units',
  unit_cost NUMERIC(10,2) DEFAULT 0.00,
  batch_number TEXT,
  expiry_date TEXT,
  supplier_name TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 12. AUDIT LOGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.audit_events (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL,
  actor_id TEXT NOT NULL,
  actor_name TEXT NOT NULL,
  actor_role TEXT NOT NULL,
  details JSONB,
  timestamp TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 13. SEED INITIAL CLINIC ACCOUNTS (Admin, Doctor, Receptionist, Customer)
-- ============================================================================
-- Master administrator provisions accounts for Doctors, Receptionists, and Customers.
INSERT INTO public.profiles (id, email, password, name, role, title, phone, avatar, room_number, specialization, status)
VALUES
  ('usr-admin-01', 'admin@clinic.com', 'Password@123', 'Dr. Rajesh Patel', 'admin', 'Chief Administrator & Managing Director', '+91 98765 33445', '👨‍⚕️', 'Admin Suite', 'Practice Governance & Implants', 'Active'),
  ('usr-doctor-01', 'doctor@clinic.com', 'Password@123', 'Dr. Priya Sharma', 'doctor', 'Chief Dental Surgeon', '+91 98765 11223', '👩‍⚕️', 'Cabin 101', 'Orthodontics & Aligners', 'Active'),
  ('usr-reception-01', 'reception@clinic.com', 'Password@123', 'Sunita Sharma', 'receptionist', 'Front Desk & Billing Lead', '+91 98765 43210', '👩‍💼', 'Front Desk Station 1', 'Patient Check-In & Accounts', 'Active'),
  ('usr-patient-01', 'patient@clinic.com', 'Password@123', 'Rahul Kumar', 'customer', 'Registered Patient', '+91 98765 00101', '👤', NULL, NULL, 'Active')
ON CONFLICT (email) DO UPDATE
SET
  password = EXCLUDED.password,
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  title = EXCLUDED.title,
  updated_at = now();

-- ============================================================================
-- 14. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dental_chairs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;

-- Public / Anon access policies for web application (Clinic Portal)
-- Users with the anon key can perform clinical operations
CREATE POLICY "Allow public read access on profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update on profiles" ON public.profiles FOR ALL USING (true);

CREATE POLICY "Allow all on patients" ON public.patients FOR ALL USING (true);
CREATE POLICY "Allow all on appointments" ON public.appointments FOR ALL USING (true);
CREATE POLICY "Allow all on tokens" ON public.tokens FOR ALL USING (true);
CREATE POLICY "Allow all on clinic_visits" ON public.clinic_visits FOR ALL USING (true);
CREATE POLICY "Allow all on invoices" ON public.invoices FOR ALL USING (true);
CREATE POLICY "Allow all on payments" ON public.payments FOR ALL USING (true);
CREATE POLICY "Allow all on prescriptions" ON public.prescriptions FOR ALL USING (true);
CREATE POLICY "Allow all on dental_chairs" ON public.dental_chairs FOR ALL USING (true);
CREATE POLICY "Allow all on inventory_items" ON public.inventory_items FOR ALL USING (true);
CREATE POLICY "Allow all on audit_events" ON public.audit_events FOR ALL USING (true);

-- ============================================================================
-- 15. SEED INITIAL DENTAL OPERATORIES & CHAIRS
-- ============================================================================
INSERT INTO public.dental_chairs (id, name, doctor_name, status, is_operational)
VALUES 
  ('chair-1', 'Dental Operatory 1 (Main Surgery)', 'Dr. Priya Sharma', 'Available', true),
  ('chair-2', 'Dental Operatory 2 (Cosmetic & Implants)', 'Dr. Rajesh Patel', 'Available', true),
  ('chair-3', 'Dental Operatory 3 (Pediatric & Hygiene)', 'Dr. Ananya Reddy', 'Available', true),
  ('chair-4', 'Dental Operatory 4 (Endodontics)', 'Dr. Vikram Malhotra', 'Available', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 16. ENABLE REALTIME BROADCASTING ON QUEUE & CLINICAL TABLES
-- ============================================================================
-- Note: Run in Supabase SQL editor to enable live token/appointment broadcast
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.tokens;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.patients;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.invoices;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.dental_chairs;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
END $$;

-- ============================================================================
-- COMPLETE! Your Supabase database is now fully configured.
-- ============================================================================
