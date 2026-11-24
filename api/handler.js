export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-actor-id, x-actor-name, x-actor-role');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  let pathStr = '';
  if (req.query && req.query.path) {
    pathStr = Array.isArray(req.query.path) ? req.query.path.join('/') : req.query.path;
  }
  if (!pathStr && req.url) {
    const cleanUrl = req.url.split('?')[0];
    pathStr = cleanUrl.replace(/^\/api\/?/, '');
  }
  pathStr = (pathStr || '').replace(/^\/+|\/+$/g, '');

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

  // 1. Tokens actions (call, hold, skip, complete, get/create)
  if (pathStr.startsWith('tokens')) {
    const parts = pathStr.split('/');
    const id = decodeURIComponent(parts[1] || body.id || body.tokenNumber || `tok-${Date.now()}`);
    const action = parts[2];

    if (action === 'call') {
      return res.status(200).json({
        token: {
          id,
          tokenNumber: id,
          patientName: body.patientName || 'Patient',
          doctorId: body.doctorId || 'doc-1',
          doctorName: body.doctorName || 'Consulting Doctor',
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
          doctorId: body.doctorId || 'doc-1',
          doctorName: body.doctorName || 'Consulting Doctor',
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
          doctorId: body.doctorId || 'doc-1',
          doctorName: body.doctorName || 'Consulting Doctor',
          status: 'Skipped'
        }
      });
    }
    if (action === 'complete') {
      return res.status(200).json({
        token: {
          id,
          tokenNumber: id,
          patientName: body.patientName || 'Patient',
          doctorId: body.doctorId || 'doc-1',
          doctorName: body.doctorName || 'Consulting Doctor',
          status: 'Completed',
          completedAt: nowIso
        }
      });
    }
    return res.status(200).json({
      token: {
        id,
        tokenNumber: id,
        patientName: body.patientName || 'Patient',
        doctorId: body.doctorId || 'doc-1',
        doctorName: body.doctorName || 'Consulting Doctor',
        status: body.status || 'Waiting',
        ...body
      },
      tokens: []
    });
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
        status: 'Reception Follow-up',
        consultationEndTime: nowIso
      },
      token: {
        id: body.tokenId || `tok-${Date.now()}`,
        tokenNumber: body.tokenNumber || body.tokenId || visitId,
        patientName: body.patientName || 'Patient',
        patientId: body.patientId || 'PAT-TEMP',
        doctorId: body.doctorId || 'doc-1',
        doctorName: body.doctorName || 'Consulting Doctor',
        status: 'Reception Follow-up',
        completedAt: nowIso
      }
    });
  }

  if (pathStr.startsWith('consultations/fee-approval')) {
    const total = (body.items || []).reduce((s, it) => s + (it.quantity * it.unitPrice), 0) + (body.consultationFee || 0);
    const feeApprovalId = body.feeApprovalId || `FA-${body.visitId ? String(body.visitId).replace(/[^a-zA-Z0-9-]/g, '') : Date.now()}`;
    const invoiceId = body.invoiceId || (body.visitId ? `INV-${String(body.visitId).replace(/[^a-zA-Z0-9-]/g, '')}` : `INV-${Date.now()}`);
    return res.status(200).json({
      feeApproval: {
        id: feeApprovalId,
        visitId: body.visitId,
        patientId: body.patientId || 'PAT-TEMP',
        patientName: body.patientName || 'Patient',
        invoiceId,
        status: 'Approved',
        date: todayStr,
        total
      },
      invoice: {
        id: invoiceId,
        visitId: body.visitId,
        patientId: body.patientId || 'PAT-TEMP',
        patientName: body.patientName || 'Patient',
        doctorName: body.doctorName || 'Consulting Doctor',
        status: 'Unpaid',
        date: todayStr,
        subtotal: total,
        total,
        balance: total,
        items: body.items || []
      }
    });
  }

  // 3. Visits close & general visits (Checkout & Encounter Finalization)
  if (pathStr.startsWith('visits')) {
    const parts = pathStr.split('/');
    const visitId = decodeURIComponent(parts[1] || body.visitId || `VIS-${Date.now()}`);
    const patientId = body.patientId || null;
    const patientName = body.patientName || 'Patient';
    const doctorId = body.doctorId || 'doc-1';
    const doctorName = body.doctorName || 'Consulting Doctor';
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
      return res.status(201).json({ patient, opNumber: patient.opNumber });
    }
    if (req.method === 'PUT' && parts[1]) {
      return res.status(200).json({ patient: { id: parts[1], ...body } });
    }
    return res.status(200).json({ patients: [] });
  }

  // 5. Enquiries
  if (pathStr.startsWith('enquiries')) {
    global.__GLOBAL_ENQUIRIES__ = global.__GLOBAL_ENQUIRIES__ || [];
    const parts = pathStr.split('/');
    if (req.method === 'POST') {
      const enquiry = {
        id: body.id || `ENQ-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        createdAt: body.createdAt || nowIso,
        status: 'New',
        ...body
      };
      global.__GLOBAL_ENQUIRIES__ = [enquiry, ...global.__GLOBAL_ENQUIRIES__.filter((e) => e.id !== enquiry.id)];
      return res.status(201).json(enquiry);
    }
    if ((req.method === 'PUT' || req.method === 'PATCH') && parts[1]) {
      const id = parts[1];
      global.__GLOBAL_ENQUIRIES__ = global.__GLOBAL_ENQUIRIES__.map((e) => (e.id === id ? { ...e, ...body } : e));
      return res.status(200).json({ enquiry: { id, ...body } });
    }
    if (req.method === 'DELETE') {
      if (parts[1]) {
        global.__GLOBAL_ENQUIRIES__ = global.__GLOBAL_ENQUIRIES__.filter((e) => e.id !== parts[1]);
      } else {
        global.__GLOBAL_ENQUIRIES__ = [];
      }
      return res.status(200).json({ success: true, message: 'Enquiries updated' });
    }
    return res.status(200).json({ enquiries: global.__GLOBAL_ENQUIRIES__ });
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
        date: todayStr,
        patientName: body?.patientName || 'Patient',
        patientOpNumber: body?.patientOpNumber || 'OP-TEMP',
        doctorId: body?.doctorId || 'doc-1',
        doctorName: body?.doctorName || 'Consulting Doctor',
        diagnosis: body?.diagnosis || 'Dental Examination',
        doctorNotes: body?.doctorNotes || '',
        items: body?.items || [],
        followUpDate: body?.followUpDate || null,
        ...body
      }
    });
  }

  // 7. Invoices
  if (pathStr.startsWith('invoices')) {
    const parts = pathStr.split('/');
    if (req.method === 'DELETE') {
      return res.status(200).json({ success: true, deletedInvoiceId: parts[1] || '' });
    }
    const invId = pathStr.includes('/') && parts[1] ? parts[1] : (body?.id || (body?.visitId ? `INV-${String(body.visitId).replace(/[^a-zA-Z0-9-]/g, '')}` : `INV-${Date.now()}`));
    return res.status(200).json({
      invoice: {
        id: invId,
        date: todayStr,
        patientName: body?.patientName || 'Patient',
        doctorName: body?.doctorName || 'Consulting Doctor',
        status: body?.status || 'Unpaid',
        subtotal: Number(body?.subtotal) || Number(body?.total) || 0,
        total: Number(body?.total) || 0,
        balance: body?.balance !== undefined ? Number(body?.balance) : Number(body?.total) || 0,
        items: body?.items || [],
        ...body
      }
    });
  }

  // 7b. Payments
  if (pathStr.startsWith('payments')) {
    const payId = `PAY-${Date.now()}`;
    const recNum = `REC-${Date.now()}`;
    const amount = Number(body?.amount) || 0;
    const payment = {
      id: payId,
      invoiceId: body?.invoiceId || `INV-${Date.now()}`,
      patientId: body?.patientId || 'PAT-TEMP',
      patientName: body?.patientName || 'Patient',
      patientOpNumber: body?.patientOpNumber || 'OP-TEMP',
      amount,
      paymentDate: todayStr,
      paymentMethod: body?.paymentMethod || 'Cash',
      referenceNumber: body?.referenceNumber || '',
      notes: body?.notes || '',
      receiptNumber: recNum,
      receivedBy: body?.receivedBy || 'Reception'
    };
    const invoice = {
      id: body?.invoiceId || `INV-${Date.now()}`,
      patientId: body?.patientId || 'PAT-TEMP',
      patientName: body?.patientName || 'Patient',
      doctorName: body?.doctorName || 'Doctor',
      date: todayStr,
      items: [],
      subtotal: amount,
      discount: 0,
      tax: 0,
      total: amount,
      paidAmount: amount,
      balance: 0,
      status: 'Paid',
      payments: [payment]
    };
    return res.status(200).json({
      payment,
      invoice,
      receiptNumber: recNum,
      remainingBalance: 0
    });
  }

  // 8. Appointments
  if (pathStr.startsWith('appointments')) {
    const parts = pathStr.split('/');
    const aptId = parts[1] || `APT-${Date.now()}`;
    if (req.method === 'POST') {
      return res.status(200).json({
        appointment: {
          id: aptId,
          status: 'Confirmed',
          ...body
        }
      });
    }
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
