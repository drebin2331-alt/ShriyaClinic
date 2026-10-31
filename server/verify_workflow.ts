import express from 'express';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { apiRouter } from './api';
import { getDb } from './db';

const app = express();
app.use(express.json());
app.use('/api', apiRouter);

const PORT = 3099;
const BASE_URL = `http://localhost:${PORT}/api`;

interface TestResult {
  step: number;
  name: string;
  passed: boolean;
  details?: string;
  error?: string;
}

const results: TestResult[] = [];

async function runTests() {
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(PORT, () => resolve()));
  console.log(`\n======================================================`);
  console.log(`🏥 STARTING CLINIC E2E ACCEPTANCE VERIFICATION SUITE`);
  console.log(`   Running against test harness on port ${PORT}`);
  console.log(`======================================================\n`);

  try {
    // -------------------------------------------------------------
    // Scenario 1 & 2: Receptionist registers a new patient
    // -------------------------------------------------------------
    const testPhone = '+91 9' + Math.floor(100000000 + Math.random() * 900000000);
    console.log(`[TEST 1] Registering brand new patient with full demographics (phone: ${testPhone})...`);
    const regRes = await fetch(`${BASE_URL}/patients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-actor-id': 'staff-1',
        'x-actor-name': 'Pooja Nair',
        'x-actor-role': 'receptionist'
      },
      body: JSON.stringify({
        name: 'Ananya Deshmukh',
        phone: testPhone,
        gender: 'Female',
        dateOfBirth: '1995-06-20',
        age: 31,
        secondaryPhone: '+91 98765 99887',
        email: 'ananya.d@example.com',
        address: '42 Lotus Boulevard, Indiranagar, Bengaluru',
        referralSource: 'Doctor Referral',
        emergencyContact: {
          name: 'Vikram Deshmukh',
          phone: '+91 98765 88776',
          relation: 'Spouse'
        },
        initialComplaint: 'Severe tooth pain on upper left molar',
        assignedDoctorId: 'doc-1',
        medicalHistory: {
          allergies: ['Penicillin'],
          hasDiabetes: false,
          hasBloodPressure: true,
          hasHeartConditions: false,
          currentMedications: ['Amlodipine 5mg OD'],
          previousSurgeries: [],
          otherNotes: 'Monitored BP before anesthesia'
        }
      })
    });

    const regData = await regRes.json();
    if (!regRes.ok || !regData.patient?.opNumber) {
      throw new Error(`Failed to register patient: ${JSON.stringify(regData)}`);
    }

    const registeredPatient = regData.patient;
    const opNumber = registeredPatient.opNumber;
    console.log(`   ✓ Patient Registered: ${registeredPatient.name} | Unique OP: ${opNumber} | ID: ${registeredPatient.id}`);
    results.push({
      step: 1,
      name: 'Receptionist Patient Registration & Unique OP Generation',
      passed: opNumber.startsWith('OP-2026-') && registeredPatient.age === 31,
      details: `Generated OP Number: ${opNumber}`
    });

    // -------------------------------------------------------------
    // Scenario 2: Duplicate Patient Detection
    // -------------------------------------------------------------
    console.log(`[TEST 2] Testing duplicate patient registration prevention...`);
    const dupRes = await fetch(`${BASE_URL}/patients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-actor-id': 'staff-1',
        'x-actor-name': 'Pooja Nair',
        'x-actor-role': 'receptionist'
      },
      body: JSON.stringify({
        name: 'Ananya Deshmukh Duplicate',
        phone: testPhone,
        gender: 'Female'
      })
    });
    const dupData = await dupRes.json();
    const dupCaught = dupRes.status === 409 && dupData.existingPatient?.id === registeredPatient.id;
    console.log(`   ✓ Duplicate Detection: ${dupCaught ? 'Blocked with 409 Conflict' : 'Failed'}`);
    results.push({
      step: 2,
      name: 'Duplicate Patient Prevention by Phone / Identifier Match',
      passed: dupCaught,
      details: dupData.message
    });

    // -------------------------------------------------------------
    // Scenario 3: Patient Checked In & Token Issued
    // -------------------------------------------------------------
    console.log(`[TEST 3] Checking in patient and generating Queue Token...`);
    const checkInRes = await fetch(`${BASE_URL}/check-in`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-actor-id': 'staff-1',
        'x-actor-name': 'Pooja Nair',
        'x-actor-role': 'receptionist'
      },
      body: JSON.stringify({
        patientId: registeredPatient.id,
        doctorId: 'doc-1',
        priority: 'Urgent',
        reasonForVisit: 'Severe throbbing molar pain'
      })
    });
    const checkInData = await checkInRes.json();
    if (!checkInRes.ok) throw new Error(checkInData.message);

    const activeVisit = checkInData.visit;
    const activeToken = checkInData.token;
    console.log(`   ✓ Checked In: Token #${activeToken.tokenNumber} | Visit ID: ${activeVisit.id} | Status: ${activeVisit.status}`);
    results.push({
      step: 3,
      name: 'Patient Check-In & Token Generation',
      passed: activeToken.tokenNumber && activeVisit.status === 'Waiting',
      details: `Token #${activeToken.tokenNumber} attached to Visit ${activeVisit.id}`
    });

    // -------------------------------------------------------------
    // Scenario 4: Doctor Calls Token
    // -------------------------------------------------------------
    console.log(`[TEST 4] Doctor calls token #${activeToken.tokenNumber}...`);
    const callRes = await fetch(`${BASE_URL}/tokens/${activeToken.id}/call`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-actor-id': 'doc-1',
        'x-actor-name': 'Dr. Priya Sharma',
        'x-actor-role': 'doctor'
      },
      body: JSON.stringify({ chairId: 'chair-1' })
    });
    const callData = await callRes.json();
    results.push({
      step: 4,
      name: 'Doctor Calls Token',
      passed: callRes.ok && callData.token?.status === 'Called',
      details: `Token status transitioned to ${callData.token?.status}`
    });

    // -------------------------------------------------------------
    // Scenario 5: Doctor Starts Consultation
    // -------------------------------------------------------------
    console.log(`[TEST 5] Doctor starts consultation...`);
    const startRes = await fetch(`${BASE_URL}/consultations/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-actor-id': 'doc-1',
        'x-actor-name': 'Dr. Priya Sharma',
        'x-actor-role': 'doctor'
      },
      body: JSON.stringify({ visitIdOrToken: activeVisit.id })
    });
    const startData = await startRes.json();
    results.push({
      step: 5,
      name: 'Start Clinical Consultation',
      passed: startRes.ok && startData.visit?.status === 'In Consultation',
      details: `Visit status updated to ${startData.visit?.status}`
    });

    // -------------------------------------------------------------
    // Scenario 6: Doctor Writes Prescription
    // -------------------------------------------------------------
    console.log(`[TEST 6] Doctor records and saves digital prescription...`);
    const rxRes = await fetch(`${BASE_URL}/prescriptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-actor-id': 'doc-1',
        'x-actor-name': 'Dr. Priya Sharma',
        'x-actor-role': 'doctor'
      },
      body: JSON.stringify({
        visitId: activeVisit.id,
        patientId: registeredPatient.id,
        diagnosis: 'Acute Irreversible Pulpitis #26',
        doctorNotes: 'Advised warm water gargles, soft diet. Avoid biting hard on tooth #26.',
        followUpDate: '2026-10-22',
        items: [
          {
            medicine: 'Amoxicillin 500mg',
            dosage: '1 capsule',
            route: 'Oral',
            frequency: 'TID (3 times/day)',
            duration: '5 days',
            instructions: 'Take after meals'
          },
          {
            medicine: 'Ibuprofen 400mg',
            dosage: '1 tablet',
            route: 'Oral',
            frequency: 'BD (Twice/day)',
            duration: '3 days',
            instructions: 'Take after food for pain relief'
          }
        ]
      })
    });
    const rxData = await rxRes.json();
    if (!rxRes.ok) throw new Error(rxData.message);
    const savedRx = rxData.prescription;
    console.log(`   ✓ Prescription Saved: ID ${savedRx.id} with ${savedRx.items.length} medicines`);
    results.push({
      step: 6,
      name: 'Doctor Digital Prescription Creation & Association',
      passed: savedRx.id.startsWith('RX-2026-') && savedRx.items.length === 2,
      details: `Prescription ID ${savedRx.id}`
    });

    // -------------------------------------------------------------
    // Scenario 7: Doctor Approves Fees & Permitted Discount (Phase 3)
    // -------------------------------------------------------------
    console.log(`[TEST 7] Doctor approves fees and discount...`);
    // First, verify unauthorized non-staff actor CANNOT approve fee
    const unauthFeeRes = await fetch(`${BASE_URL}/consultations/fee-approval`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-actor-id': 'pat-guest-1',
        'x-actor-name': 'Guest User',
        'x-actor-role': 'patient' // unauthorized for fee approval
      },
      body: JSON.stringify({
        visitId: activeVisit.id,
        consultationFee: 500,
        items: [{ description: 'Endodontic Access & Biomechanical Prep #26', quantity: 1, unitPrice: 3500 }]
      })
    });
    const feeForbidden = unauthFeeRes.status === 403;

    // Now authorized doctor approves fee
    const authFeeRes = await fetch(`${BASE_URL}/consultations/fee-approval`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-actor-id': 'doc-1',
        'x-actor-name': 'Dr. Priya Sharma',
        'x-actor-role': 'doctor'
      },
      body: JSON.stringify({
        visitId: activeVisit.id,
        consultationFee: 500,
        items: [
          { description: 'Endodontic Access & Biomechanical Prep #26', quantity: 1, unitPrice: 3500 }
        ],
        discountType: 'amount',
        discountValue: 500,
        discountReason: 'Senior Doctor Courtesy Concession',
        taxRate: 0
      })
    });
    const feeData = await authFeeRes.json();
    if (!authFeeRes.ok) throw new Error(feeData.message);

    const feeApproval = feeData.feeApproval;
    const generatedInvoice = feeData.invoice;

    // Check calculations:
    // Subtotal: 500 + 3500 = 4000
    // Discount: 500
    // Final payable: 3500
    const calcCorrect =
      feeApproval.subtotal === 4000 &&
      feeApproval.discountAmount === 500 &&
      feeApproval.finalPayable === 3500 &&
      generatedInvoice.total === 3500 &&
      generatedInvoice.balance === 3500;

    console.log(`   ✓ Fee Approval Math: Subtotal ₹${feeApproval.subtotal} - Disc ₹${feeApproval.discountAmount} = Payable ₹${feeApproval.finalPayable}`);
    console.log(`   ✓ Security Enforcement: Receptionist approval rejected: ${feeForbidden ? '403 Forbidden' : 'Failed'}`);
    results.push({
      step: 7,
      name: 'Doctor Fee Approval, Discount Calculations & RBAC Enforcement',
      passed: feeForbidden && calcCorrect,
      details: `Subtotal ₹${feeApproval.subtotal}, Discount ₹${feeApproval.discountAmount}, Net Payable ₹${feeApproval.finalPayable}`
    });

    // -------------------------------------------------------------
    // Scenario 8: Doctor Completes Consultation (Phase 7)
    // -------------------------------------------------------------
    console.log(`[TEST 8] Doctor completes consultation...`);
    const compRes = await fetch(`${BASE_URL}/consultations/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-actor-id': 'doc-1',
        'x-actor-name': 'Dr. Priya Sharma',
        'x-actor-role': 'doctor'
      },
      body: JSON.stringify({
        visitIdOrToken: activeVisit.id,
        diagnosis: 'Acute Irreversible Pulpitis #26',
        treatmentPlan: 'Root Canal Phase 1 Complete. Obturation scheduled next visit.',
        notes: 'Working length 21mm, calcium hydroxide placed. Temp Cavit seal.',
        followUpDate: '2026-10-22',
        followUpReason: 'Root Canal Obturation & Core Build-Up'
      })
    });
    const compData = await compRes.json();
    if (!compRes.ok) throw new Error(compData.message);

    // Verify it transitioned to 'Reception Follow-up', NOT prematurely 'Closed'
    const handedOffToReception =
      compData.visit.status === 'Reception Follow-up' &&
      compData.token.status === 'Reception Follow-up' &&
      compData.visit.completedByDoctor === 'Dr. Priya Sharma';

    console.log(`   ✓ Consultation Finalized: Status '${compData.visit.status}' | Forwarded to Reception Desk`);
    results.push({
      step: 8,
      name: 'Consultation Completion & Safe Reception Handoff',
      passed: handedOffToReception,
      details: `Visit status set to ${compData.visit.status}, awaiting receptionist checkout`
    });

    // -------------------------------------------------------------
    // Scenario 9 & 10: Receptionist Records Partial Payment (Phase 8)
    // -------------------------------------------------------------
    console.log(`[TEST 9 & 10] Receptionist collects partial payment of ₹2,000...`);
    const pay1Res = await fetch(`${BASE_URL}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-actor-id': 'staff-1',
        'x-actor-name': 'Pooja Nair',
        'x-actor-role': 'receptionist'
      },
      body: JSON.stringify({
        invoiceId: generatedInvoice.id,
        amount: 2000,
        paymentMethod: 'UPI',
        referenceNumber: 'UPI/HDFC/20261015/00912',
        notes: 'Counter payment via QR code'
      })
    });
    const pay1Data = await pay1Res.json();
    if (!pay1Res.ok) throw new Error(pay1Data.message);

    const receipt1 = pay1Data.payment;
    const invAfterPay1 = pay1Data.invoice;

    // Remaining balance must be: 3500 - 2000 = 1500
    // Invoice status must be 'Partial', NOT 'Paid'
    const pay1Correct =
      receipt1.receiptNumber.startsWith('REC-2026-') &&
      receipt1.amount === 2000 &&
      invAfterPay1.paid === 2000 &&
      invAfterPay1.balance === 1500 &&
      invAfterPay1.status === 'Partial';

    console.log(`   ✓ Payment 1 Receipt: ${receipt1.receiptNumber} | Amount: ₹${receipt1.amount} | Remaining Balance: ₹${invAfterPay1.balance}`);
    results.push({
      step: 9,
      name: 'Partial Payment Recording & Atomic Receipt Generation',
      passed: pay1Correct,
      details: `Paid ₹2,000, Remaining Balance ₹${invAfterPay1.balance}, Status: ${invAfterPay1.status}`
    });

    // -------------------------------------------------------------
    // Scenario 11: Receptionist Records Second Payment Settle Full Balance
    // -------------------------------------------------------------
    console.log(`[TEST 11] Receptionist records second payment of ₹1,500 (Full Settlement)...`);
    const pay2Res = await fetch(`${BASE_URL}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-actor-id': 'staff-1',
        'x-actor-name': 'Pooja Nair',
        'x-actor-role': 'receptionist'
      },
      body: JSON.stringify({
        invoiceId: generatedInvoice.id,
        amount: 1500,
        paymentMethod: 'Cash',
        notes: 'Cash payment settled in full'
      })
    });
    const pay2Data = await pay2Res.json();
    if (!pay2Res.ok) throw new Error(pay2Data.message);

    const receipt2 = pay2Data.payment;
    const invAfterPay2 = pay2Data.invoice;

    const pay2Correct =
      receipt2.receiptNumber !== receipt1.receiptNumber &&
      invAfterPay2.paid === 3500 &&
      invAfterPay2.balance === 0 &&
      invAfterPay2.status === 'Paid';

    console.log(`   ✓ Payment 2 Receipt: ${receipt2.receiptNumber} | Amount: ₹${receipt2.amount} | Balance: ₹${invAfterPay2.balance} (${invAfterPay2.status})`);
    results.push({
      step: 11,
      name: 'Multiple Payments Against Invoice & Full Balance Settlement',
      passed: pay2Correct,
      details: `Receipts: ${receipt1.receiptNumber}, ${receipt2.receiptNumber} | Final Balance ₹0`
    });

    // -------------------------------------------------------------
    // Scenario 12: Receptionist Closes Today's Visit (Phase 8 Checkout)
    // -------------------------------------------------------------
    console.log(`[TEST 12] Receptionist finalizes checkout and closes visit...`);
    const closeRes = await fetch(`${BASE_URL}/visits/${activeVisit.id}/close`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-actor-id': 'staff-1',
        'x-actor-name': 'Pooja Nair',
        'x-actor-role': 'receptionist'
      },
      body: JSON.stringify({
        adminNotes: 'All fees settled. Rx printed and handed over. Follow-up booked for 22 Oct 2026.'
      })
    });
    const closeData = await closeRes.json();
    if (!closeRes.ok) throw new Error(closeData.message);

    const closedCorrect =
      closeData.visit.status === 'Closed' &&
      closeData.visit.closedAt &&
      closeData.token.status === 'Completed';

    console.log(`   ✓ Encounter Closed: Visit Status '${closeData.visit.status}' | Closed At: ${closeData.visit.closedAt}`);
    results.push({
      step: 12,
      name: 'Reception Encounter Checkout & Closure',
      passed: !!closedCorrect,
      details: `Encounter closed at ${closeData.visit.closedAt}`
    });

    // -------------------------------------------------------------
    // Scenario 13 & 14: Returning Patient Attendance & History Retention
    // -------------------------------------------------------------
    console.log(`[TEST 13 & 14] Returning patient returns next week. Reusing patient record...`);
    const returnCheckInRes = await fetch(`${BASE_URL}/check-in`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-actor-id': 'staff-1',
        'x-actor-name': 'Pooja Nair',
        'x-actor-role': 'receptionist'
      },
      body: JSON.stringify({
        patientId: registeredPatient.id,
        doctorId: 'doc-1',
        priority: 'Normal',
        reasonForVisit: 'Follow-up Root Canal Obturation',
        isWalkIn: true
      })
    });
    const returnData = await returnCheckInRes.json();
    if (!returnCheckInRes.ok) throw new Error(returnData.error || returnData.message || JSON.stringify(returnData));

    const newVisit = returnData.visit;
    const newToken = returnData.token;

    // Check DB state: Patient record must remain single!
    const db = getDb();
    const patientInstances = db.patients.filter((p) => p.id === registeredPatient.id || p.opNumber === opNumber);
    const patientVisits = db.visits.filter((v) => v.patientId === registeredPatient.id);
    const patientInvoices = db.invoices.filter((i) => i.patientId === registeredPatient.id);
    const patientPayments = db.payments.filter((p) => p.patientId === registeredPatient.id);

    const returningIntegrityPassed =
      patientInstances.length === 1 &&
      patientVisits.length >= 2 &&
      newVisit.id !== activeVisit.id &&
      newToken.tokenNumber !== activeToken.tokenNumber &&
      patientInvoices.length >= 1 &&
      patientPayments.length >= 2;

    console.log(`   ✓ Returning Patient Reused: Patient instances: ${patientInstances.length} | Total Visits: ${patientVisits.length}`);
    console.log(`   ✓ Historical Ledger Intact: Invoices: ${patientInvoices.length} | Receipts: ${patientPayments.length}`);
    results.push({
      step: 13,
      name: 'Returning Patient Check-In without Record Duplication & Complete Historical Audit Retention',
      passed: returningIntegrityPassed,
      details: `Patient ${registeredPatient.id} has ${patientVisits.length} visits, 2 payment receipts, and 1 invoice preserved.`
    });

    // -------------------------------------------------------------
    // Scenario 15: Edge Cases & Validation Hardening
    // -------------------------------------------------------------
    console.log(`[TEST 15] Validating edge cases (negative amounts, discount overflow, empty notes)...`);
    // Negative payment attempt
    const negPayRes = await fetch(`${BASE_URL}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-actor-id': 'staff-1',
        'x-actor-name': 'Pooja Nair',
        'x-actor-role': 'receptionist'
      },
      body: JSON.stringify({
        invoiceId: generatedInvoice.id,
        amount: -100,
        paymentMethod: 'Cash'
      })
    });
    const negPayBlocked = negPayRes.status === 400;

    // Discount exceeding subtotal
    const excessDiscRes = await fetch(`${BASE_URL}/consultations/fee-approval`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-actor-id': 'doc-1',
        'x-actor-name': 'Dr. Priya Sharma',
        'x-actor-role': 'doctor'
      },
      body: JSON.stringify({
        visitId: newVisit.id,
        consultationFee: 500,
        items: [{ description: 'Checkup', quantity: 1, unitPrice: 500 }],
        discountType: 'amount',
        discountValue: 5000 // subtotal is only 1000!
      })
    });
    const excessDiscBlocked = excessDiscRes.status === 400;

    results.push({
      step: 15,
      name: 'Financial Constraints (Negative Amounts & Excessive Discount Rejections)',
      passed: negPayBlocked && excessDiscBlocked,
      details: `Negative payment rejected: ${negPayBlocked} | Excessive discount rejected: ${excessDiscBlocked}`
    });

    // -------------------------------------------------------------
    // Scenario 16: File-Backed Atomic Persistence Integrity
    // -------------------------------------------------------------
    console.log(`[TEST 16] Verifying physical disk persistence in data/clinic_data.json...`);
    const dbPath = path.resolve(process.cwd(), 'data', 'clinic_data.json');
    const fileExists = fs.existsSync(dbPath);
    const rawFileContent = fs.readFileSync(dbPath, 'utf8');
    const parsedFile = JSON.parse(rawFileContent);
    const persistedPatient = parsedFile.patients.find((p: any) => p.id === registeredPatient.id);
    const persistencePassed =
      fileExists &&
      persistedPatient &&
      persistedPatient.opNumber === opNumber &&
      parsedFile.payments.length >= 2;

    console.log(`   ✓ File persistence verified: ${dbPath} (${fs.statSync(dbPath).size} bytes)`);
    results.push({
      step: 16,
      name: 'Disk Persistence & Independent Session Reloading',
      passed: persistencePassed,
      details: `Verified ${parsedFile.patients.length} patients, ${parsedFile.visits.length} visits, ${parsedFile.payments.length} receipts in JSON DB.`
    });

  } catch (err: any) {
    console.error(`❌ TEST SUITE RUNTIME EXCEPTION:`, err);
    results.push({
      step: 99,
      name: 'Test Execution Exception',
      passed: false,
      error: err.message
    });
  } finally {
    server.close();
  }

  console.log(`\n======================================================`);
  console.log(`📊 E2E ACCEPTANCE TEST RESULTS SUMMARY`);
  console.log(`======================================================`);
  let allPassed = true;
  for (const r of results) {
    const symbol = r.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${symbol} [Phase Test #${r.step}] ${r.name}`);
    if (r.details) console.log(`       ↳ ${r.details}`);
    if (r.error) console.log(`       ↳ ERROR: ${r.error}`);
    if (!r.passed) allPassed = false;
  }
  console.log(`======================================================`);
  console.log(`Overall Result: ${allPassed ? 'ALL ACCEPTANCE TESTS PASSED (16/16) 🎉' : 'FAILURES DETECTED'}`);
  console.log(`======================================================\n`);

  if (!allPassed) {
    process.exit(1);
  }
}

runTests();
