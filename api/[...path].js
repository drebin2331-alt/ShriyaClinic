export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-actor-id, x-actor-name, x-actor-role');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { path } = req.query;
  const pathStr = Array.isArray(path) ? path.join('/') : (path || '');

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }
  body = body || {};

  const nowIso = new Date().toISOString();
  const todayStr = nowIso.split('T')[0];
  const nowTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // 1. Tokens actions (call, hold, skip)
  if (pathStr.startsWith('tokens/')) {
    const parts = pathStr.split('/');
    const id = parts[1];
    const action = parts[2];
    if (action === 'call') {
      return res.status(200).json({
        token: {
          id,
          tokenNumber: id,
          patientName: body.patientName || 'Patient',
          doctorId: body.doctorId || 'staff-1792653030970',
          doctorName: body.doctorName || 'Dr. DOCTOR TEST',
          status: 'Called',
          calledAt: nowIso,
          chairId: body.chairId || null,
          chairName: body.chairName || null
        }
      });
    }
    if (action === 'hold') {
      return res.status(200).json({
        token: {
          id,
          tokenNumber: id,
          patientName: body.patientName || 'Patient',
          doctorId: body.doctorId || 'staff-1792653030970',
          doctorName: body.doctorName || 'Dr. DOCTOR TEST',
          status: 'On Hold'
        }
      });
    }
    if (action === 'skip') {
      return res.status(200).json({
        token: {
          id,
          tokenNumber: id,
          patientName: body.patientName || 'Patient',
          doctorId: body.doctorId || 'staff-1792653030970',
          doctorName: body.doctorName || 'Dr. DOCTOR TEST',
          status: 'Skipped'
        }
      });
    }
  }

  // 2. Consultations actions (start, complete, fee-approval)
  if (pathStr.startsWith('consultations/start')) {
    const visitId = body.visitId || body.visitIdOrToken || `VIS-${Date.now()}`;
    return res.status(200).json({
      visit: {
        id: visitId,
        status: 'In Consultation',
        consultationStartTime: nowIso
      }
    });
  }

  if (pathStr.startsWith('consultations/complete')) {
    const visitId = body.visitId || body.visitIdOrToken || `VIS-${Date.now()}`;
    return res.status(200).json({
      visit: {
        id: visitId,
        status: 'Completed',
        consultationEndTime: nowIso
      },
      token: {
        id: body.tokenId || `tok-${Date.now()}`,
        tokenNumber: body.tokenNumber || body.tokenId || visitId,
        patientName: body.patientName || 'Patient',
        patientId: body.patientId || 'PAT-TEMP',
        doctorId: body.doctorId || 'staff-1792653030970',
        doctorName: body.doctorName || 'Dr. DOCTOR TEST',
        status: 'Reception Follow-up',
        completedAt: nowIso
      }
    });
  }

  if (pathStr.startsWith('consultations/fee-approval')) {
    const total = (body.items || []).reduce((s, it) => s + (it.quantity * it.unitPrice), 0) + (body.consultationFee || 0);
    return res.status(200).json({
      feeApproval: {
        id: body.feeApprovalId || `FA-${Date.now()}`,
        visitId: body.visitId,
        patientId: body.patientId || 'PAT-TEMP',
        status: 'Approved',
        date: todayStr,
        total
      },
      invoice: {
        id: `INV-${Date.now()}`,
        visitId: body.visitId,
        patientId: body.patientId || 'PAT-TEMP',
        status: 'Unpaid',
        date: todayStr,
        total,
        balance: total,
        items: body.items || []
      }
    });
  }

  // 3. Visits close (Checkout & Encounter Finalization)
  if (pathStr.startsWith('visits/') && pathStr.endsWith('/close')) {
    const parts = pathStr.split('/');
    const visitId = parts[1] || body.visitId || `VIS-${Date.now()}`;
    const patientId = body.patientId || null;
    const patientName = body.patientName || 'Patient';
    const doctorId = body.doctorId || 'staff-1792653030970';
    const doctorName = body.doctorName || 'Dr. DOCTOR TEST';
    const tokenId = body.tokenId || body.tokenNumber || null;

    return res.status(200).json({
      visit: {
        id: visitId,
        patientId,
        patientName,
        doctorId,
        doctorName,
        tokenId,
        status: 'Completed',
        checkoutTime: nowIso,
        adminNotes: body.adminNotes || '',
        timeline: [
          {
            time: nowTimeStr,
            event: `Reception Checkout Completed. Encounter Closed. Notes: ${body.adminNotes || 'Payment & visit finalized.'}`,
            actor: 'Receptionist'
          }
        ]
      },
      token: tokenId ? {
        id: tokenId,
        tokenNumber: tokenId,
        patientId,
        patientName,
        doctorId,
        doctorName,
        status: 'Completed',
        completedAt: nowIso
      } : null
    });
  }

  // 4. Patients (register, update, list)
  if (pathStr.startsWith('patients')) {
    const parts = pathStr.split('/');
    if (req.method === 'POST') {
      const randNum = Math.floor(1000 + Math.random() * 9000);
      const patient = {
        id: body.id || `PAT-2026-${randNum}`,
        opNumber: body.opNumber || `OP-2026-${randNum}`,
        name: body.name || 'New Patient',
        phone: body.phone || '',
        age: body.age || 0,
        gender: body.gender || 'Other',
        status: 'New Patient',
        firstVisitDate: todayStr,
        totalVisits: 1,
        outstandingBalance: 0,
        ...body
      };
      return res.status(201).json({ patient });
    }
    if (req.method === 'PUT' && parts[1]) {
      return res.status(200).json({ patient: { id: parts[1], ...body } });
    }
    return res.status(200).json({ patients: [] });
  }

  // 5. Enquiries
  if (pathStr.startsWith('enquiries')) {
    const parts = pathStr.split('/');
    if (req.method === 'POST') {
      const enquiry = {
        id: `ENQ-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        createdAt: nowIso,
        status: 'New',
        ...body
      };
      return res.status(201).json(enquiry);
    }
    if (req.method === 'PUT' && parts[1]) {
      return res.status(200).json({ enquiry: { id: parts[1], ...body } });
    }
    if (req.method === 'DELETE') {
      return res.status(200).json({ success: true, message: 'Enquiries cleared' });
    }
    return res.status(200).json({ enquiries: [] });
  }

  // 6. Prescriptions
  if (pathStr.startsWith('prescriptions')) {
    if (req.method === 'DELETE') {
      return res.status(200).json({ success: true, message: 'Prescription deleted successfully' });
    }
    const rxId = pathStr.includes('/') ? pathStr.split('/')[1] : `RX-${Date.now()}`;
    return res.status(200).json({
      prescription: {
        id: rxId,
        visitId: body.visitId || `vis-${Date.now()}`,
        patientId: body.patientId || 'PAT-TEMP',
        patientName: body.patientName || 'Patient',
        patientOpNumber: body.patientOpNumber || 'OP-TEMP',
        doctorName: body.doctorName || 'Dr. DOCTOR TEST',
        date: body.date || todayStr,
        medicines: body.medicines || [],
        instructions: body.instructions || '',
        diagnosis: body.diagnosis || ''
      }
    });
  }

  // 7. Payments
  if (pathStr.startsWith('payments')) {
    const payId = `PAY-${Date.now()}`;
    const recNum = `REC-${Date.now()}`;
    return res.status(200).json({
      payment: {
        id: payId,
        invoiceId: body.invoiceId || `INV-${Date.now()}`,
        amount: body.amount || 0,
        paymentDate: todayStr,
        paymentMethod: body.paymentMethod || 'Cash',
        receiptNumber: recNum
      },
      invoice: {
        id: body.invoiceId || `INV-${Date.now()}`,
        status: 'Paid',
        paidAmount: body.amount || 0,
        balance: 0
      },
      receiptNumber: recNum,
      remainingBalance: 0
    });
  }

  // 8. Appointments
  if (pathStr.startsWith('appointments')) {
    const parts = pathStr.split('/');
    const aptId = parts[1] || `apt-${Date.now()}`;
    return res.status(200).json({
      appointment: {
        id: aptId,
        status: pathStr.endsWith('/cancel') ? 'Cancelled' : 'Confirmed',
        date: body.newDate || todayStr,
        timeSlot: body.newTimeSlot || '10:00 AM'
      }
    });
  }

  // 9. Medicines
  if (pathStr.startsWith('medicines')) {
    if (req.method === 'POST') {
      const med = {
        id: `med-${Date.now()}`,
        name: body.name || 'Medicine',
        dosage: body.dosage || '',
        route: body.route || 'Oral',
        frequency: body.frequency || 'BD',
        duration: body.duration || '5 days',
        instructions: body.instructions || 'After food'
      };
      return res.status(200).json({ medicine: med, medicines: [med] });
    }
    return res.status(200).json({ medicines: [] });
  }

  // 10. Audit
  if (pathStr.startsWith('audit')) {
    return res.status(200).json({ success: true, message: 'Audit event logged' });
  }

  // Default fallback
  return res.status(200).json({
    success: true,
    message: 'Operation handled successfully',
    path: pathStr
  });
}
