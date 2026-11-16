# Shriya Multispeciality Dental Clinic OS
> Complete Dental Electronic Medical Records (EMR), Live Waiting Room Queue, Front-Desk Reception Triage, Billing & Patient Portal.

---

## 🌟 Overview

**Shriya Multispeciality Dental Clinic OS** is a modern, responsive, end-to-end clinical management application built for dental practices. It unifies patient onboarding, walk-in token generation, interactive odontogram charting, doctor procedure authorization, invoicing with receipt printing, and WhatsApp communications into a single interface for clinic staff, doctors, and patients.

---

## 🚀 Key Features

### 1. 🌐 Public Patient Portal & Website
* **Consultation Requests:** Zero-advance booking with preferred time-window chips (Morning, Afternoon, Evening) and chief dental complaint selection.
* **Live Waiting Room Queue:** Real-time token counter tracking who is currently in consultation and estimated waiting times with patient name masking for privacy.
* **Patient Self-Service Dashboard:** Review verified visit history, tooth condition charts, upcoming appointments, prescriptions, and digital payment receipts.

### 2. 🏥 Reception & Front Desk (`StaffCheckInView`)
* **Online Inquiries Inbox:** Real-time desk notification banner with 1-click WhatsApp callback and direct conversion into booked slots or OP tokens.
* **Patient Registration:** Auto-generates structured OP numbers (`OP-2026-000XXX`) and unique patient IDs.
* **Fast-Track Walk-in Check-In:** Issues live walk-in tokens (`W-001`, `W-002`) with triage priority (`Normal`, `Urgent`, `Emergency`).
* **Doctor Cabin Handoff:** "Send to Doctor" push button that routes patients directly into the consulting room.

### 3. 🦷 Doctor Clinical EMR (`DoctorConsultationView` & `PatientProfileView`)
* **Interactive FDI Odontogram:** Adult (32 teeth, quadrants 1–4) and Pediatric (20 teeth, quadrants 5–8) charts with multi-surface selection (Occlusal, Mesial, Distal, Buccal, Lingual).
* **Treatment Planning & Case Sheets:** Visual tooth status coding (Healthy, Caries, RCT Done, Crown Needed, Missing, Implants).
* **Doctor Fee Authorization:** Doctor-controlled procedure pricing and authorized discounts (`DoctorFeeApprovalModal`) before handoff to billing.
* **Digital Prescriptions:** Medication selector with dosage, frequency, duration, food timing, and official PDF print layout.

### 4. 💳 Billing, POS & Official Receipts (`BillingPaymentView`)
* **Invoice Generation:** Automatic conversion of doctor-approved fees into numbered GST-compliant invoices (`INV-2026-XXXX`).
* **Multi-Mode Settlements:** Split payments via Cash, UPI, Credit/Debit Card, or Bank Transfer.
* **Letterhead Receipts:** Printable official clinic letterhead receipts (`REC-2026-XXXX`) with clinic tax GSTIN, balance tracking, and instant WhatsApp dispatch.

---

## 🏗️ System Architecture & Data Flow

```
+-----------------------------------------------------------------------------------+
|                            PUBLIC WEBSITE & PATIENT                               |
|   • Consultation Inquiries (ENQ-2026-XXXX)   • Live Waiting Room Queue (LiveQueue)|
+------------------------------------------+----------------------------------------+
                                           |
                                           v
+-----------------------------------------------------------------------------------+
|                        FRONT DESK RECEPTION (desk@gmail.com)                      |
|   • Online Inquiries Review -> WhatsApp Greeting (wa.me/91...)                    |
|   • Patient Check-in -> Issue Walk-In Token (W-001) / OP Number (OP-2026-000XXX)  |
|   • Push token into Doctor Cabin Queue                                            |
+------------------------------------------+----------------------------------------+
                                           |
                                           v
+-----------------------------------------------------------------------------------+
|                         DOCTOR CABIN (doctor@gmail.com)                           |
|   • Adult / Pediatric FDI Odontogram Diagnosis & Case Sheet                       |
|   • Digital Prescription Writing (Rx)                                             |
|   • Doctor Fee & Procedure Discount Authorization (DoctorFeeApprovalModal)        |
+------------------------------------------+----------------------------------------+
                                           |
                                           v
+-----------------------------------------------------------------------------------+
|                       RECEPTION BILLING & CASHIER CHECKOUT                        |
|   • Invoice Generation (INV-2026-XXXX)                                            |
|   • Payment Collection (Cash / UPI / Card) -> Receipt (REC-2026-XXXX)             |
|   • WhatsApp Digital Receipt & Follow-Up Reminders                                |
+-----------------------------------------------------------------------------------+
```

---

## 💻 Tech Stack

* **Frontend:** React 19, TypeScript, Tailwind CSS, Lucide Icons, Motion.
* **Build System:** Vite 6 with HMR and embedded API proxy middleware.
* **Backend:** Express API Router (`server/api.ts`) with disk persistence (`data/clinic_data.json`).
* **Database & Cloud Sync:** Supabase PostgreSQL with real-time WebSocket channels.
* **Observability:** Custom React `ErrorBoundary` with reload and recovery fallbacks.

---

## 🛠️ Getting Started

### Prerequisites
* **Node.js:** v18.0.0 or higher
* **npm:** v9.0.0 or higher

### Installation
1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd Clinic
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Add your Supabase project URL and anonymous key in `.env` if utilizing cloud synchronization:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```
4. Start the local development server:
   ```bash
   npm run dev
   ```
   The application will be live at `http://localhost:3000` (or `3001` if port 3000 is occupied).

---

## 👥 Demo Credentials

The application provides instant staff authentication profiles for testing:

| Role | Username / Registered Email | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@clinic.com` | `Password@123` | Full clinical and administrative governance |
| **Doctor** | `doctor@gmail.com` | `123456` or `Password@123` | Consultations, Odontogram, Rx & Pricing Authorization |
| **Receptionist** | `desk@gmail.com` | `123456` or `Password@123` | Patient Registration, Queue Tokens & Billing |
| **Patient** | `patient@clinic.com` | `Password@123` | Personal records, dental charts & receipts |

---

## 📦 Production Build

To create an optimized, minified production build:
```bash
npm run build
```
The output will be placed in the `dist/` directory ready for deployment on Vercel, Netlify, or any static hosting service.

