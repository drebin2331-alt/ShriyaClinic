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

  // Tokens actions (call, hold, skip)
  if (pathStr.startsWith('tokens/') && pathStr.endsWith('/call')) {
    const id = pathStr.split('/')[1];
    return res.status(200).json({
      token: {
        id,
        tokenNumber: id,
        patientName: body.patientName || 'Patient',
        doctorId: body.doctorId || 'doc-1',
        doctorName: body.doctorName || 'Doctor',
        status: 'Called',
        calledAt: new Date().toISOString(),
        chairId: body.chairId || null,
        chairName: body.chairName || null
      }
    });
  }

  if (pathStr.startsWith('tokens/') && pathStr.endsWith('/hold')) {
    const id = pathStr.split('/')[1];
    return res.status(200).json({
      token: {
        id,
        tokenNumber: id,
        patientName: body.patientName || 'Patient',
        doctorId: body.doctorId || 'doc-1',
        doctorName: body.doctorName || 'Doctor',
        status: 'Hold'
      }
    });
  }

  if (pathStr.startsWith('tokens/') && pathStr.endsWith('/skip')) {
    const id = pathStr.split('/')[1];
    return res.status(200).json({
      token: {
        id,
        tokenNumber: id,
        patientName: body.patientName || 'Patient',
        doctorId: body.doctorId || 'doc-1',
        doctorName: body.doctorName || 'Doctor',
        status: 'Skipped'
      }
    });
  }

  // Consultations actions (start, complete, fee-approval)
  if (pathStr.startsWith('consultations/start')) {
    const visitId = body.visitIdOrToken || `vis-${Date.now()}`;
    return res.status(200).json({
      visit: {
        id: visitId,
        status: 'In Consultation',
        consultationStartTime: new Date().toISOString()
      }
    });
  }

  if (pathStr.startsWith('consultations/complete')) {
    const visitId = body.visitId || `vis-${Date.now()}`;
    return res.status(200).json({
      visit: {
        id: visitId,
        status: 'Completed',
        consultationEndTime: new Date().toISOString()
      }
    });
  }

  if (pathStr.startsWith('consultations/fee-approval')) {
    const nowIso = new Date().toISOString();
    return res.status(200).json({
      feeApproval: {
        id: body.feeApprovalId || `FA-${Date.now()}`,
        visitId: body.visitId,
        patientId: body.patientId || 'PAT-TEMP',
        status: 'Approved',
        date: nowIso.split('T')[0],
        total: (body.items || []).reduce((s, it) => s + (it.quantity * it.unitPrice), 0) + (body.consultationFee || 0)
      },
      invoice: {
        id: `INV-${Date.now()}`,
        visitId: body.visitId,
        patientId: body.patientId || 'PAT-TEMP',
        status: 'Unpaid',
        date: nowIso.split('T')[0],
        total: (body.items || []).reduce((s, it) => s + (it.quantity * it.unitPrice), 0) + (body.consultationFee || 0),
        balance: (body.items || []).reduce((s, it) => s + (it.quantity * it.unitPrice), 0) + (body.consultationFee || 0),
        items: body.items || []
      }
    });
  }

  // Visits close
  if (pathStr.startsWith('visits/') && pathStr.endsWith('/close')) {
    const parts = pathStr.split('/');
    const visitId = parts[1] || `vis-${Date.now()}`;
    return res.status(200).json({
      visit: {
        id: visitId,
        status: 'Completed',
        checkoutTime: new Date().toISOString()
      }
    });
  }

  // Prescriptions
  if (pathStr.startsWith('prescriptions')) {
    if (req.method === 'DELETE') {
      return res.status(200).json({ success: true, message: 'Prescription deleted successfully' });
    }
    const rxId = pathStr.includes('/') ? pathStr.split('/')[1] : `RX-${Date.now()}`;
    return res.status(200).json({
      prescription: {
        id: rxId,
        visitId: body.visitId || 'VIS-TEMP',
        patientId: body.patientId || 'PAT-TEMP',
        patientName: 'Patient',
        date: new Date().toISOString().split('T')[0],
        diagnosis: body.diagnosis || '',
        doctorNotes: body.doctorNotes || '',
        items: body.items || [],
        followUpDate: body.followUpDate
      }
    });
  }

  // Payments
  if (pathStr.startsWith('payments')) {
    const nowIso = new Date().toISOString();
    return res.status(200).json({
      payment: {
        id: `PAY-${Date.now()}`,
        invoiceId: body.invoiceId || `INV-${Date.now()}`,
        amount: body.amount || 0,
        paymentDate: nowIso.split('T')[0],
        paymentMethod: body.paymentMethod || 'Cash',
        receiptNumber: `REC-${Date.now()}`
      },
      invoice: {
        id: body.invoiceId || `INV-${Date.now()}`,
        status: 'Paid',
        paidAmount: body.amount || 0,
        balance: 0
      },
      receiptNumber: `REC-${Date.now()}`,
      remainingBalance: 0
    });
  }

  // Appointments
  if (pathStr.startsWith('appointments/')) {
    return res.status(200).json({
      appointment: {
        id: pathStr.split('/')[1] || `apt-${Date.now()}`,
        status: pathStr.endsWith('/cancel') ? 'Cancelled' : 'Confirmed',
        date: body.newDate || new Date().toISOString().split('T')[0],
        timeSlot: body.newTimeSlot || '10:00 AM'
      }
    });
  }

  // Default fallback for any other route
  return res.status(200).json({
    success: true,
    message: 'Operation handled successfully',
    path: pathStr
  });
}
