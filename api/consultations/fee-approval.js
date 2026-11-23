export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-actor-id, x-actor-name, x-actor-role');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
    }
    body = body || {};

    const items = Array.isArray(body.items) ? body.items : [];
    const subtotal = items.reduce((s, it) => s + (it.quantity * it.unitPrice), 0) + (body.consultationFee || 0);
    let discountAmount = 0;
    if (body.discountType === 'percentage' && body.discountValue) {
      discountAmount = (subtotal * body.discountValue) / 100;
    } else if (body.discountType === 'amount' && body.discountValue) {
      discountAmount = body.discountValue;
    }
    const taxable = Math.max(0, subtotal - discountAmount);
    const taxAmount = (taxable * (body.taxRate || 0)) / 100;
    const total = Math.round(taxable + taxAmount);
    const nowIso = new Date().toISOString();
    const randNum = Math.floor(1000 + Math.random() * 9000);

    const feeApprovalId = body.feeApprovalId || `FA-2026-${randNum}`;
    const invoiceId = `INV-2026-${randNum}`;

    const feeApproval = {
      id: feeApprovalId,
      visitId: body.visitId || `VIS-${Date.now()}`,
      patientId: body.patientId || 'PAT-TEMP',
      patientName: body.patientName || 'Patient',
      patientOpNumber: body.patientOpNumber || 'OP-TEMP',
      doctorId: body.doctorId || 'doc-1',
      doctorName: body.doctorName || 'Dr. DOCTOR TEST',
      date: nowIso.split('T')[0],
      consultationFee: body.consultationFee || 0,
      items,
      discountType: body.discountType || 'amount',
      discountValue: body.discountValue || 0,
      discountReason: body.discountReason || '',
      subtotal,
      discountAmount,
      total,
      approvedBy: body.doctorName || 'Doctor',
      status: 'Approved'
    };

    const invoice = {
      id: invoiceId,
      visitId: body.visitId || `VIS-${Date.now()}`,
      patientId: body.patientId || 'PAT-TEMP',
      patientName: body.patientName || 'Patient',
      patientOpNumber: body.patientOpNumber || 'OP-TEMP',
      doctorName: body.doctorName || 'Dr. DOCTOR TEST',
      date: nowIso.split('T')[0],
      feeApprovalId,
      items: items.map((it, idx) => ({
        id: `item-${idx}`,
        serviceId: `srv-${idx}`,
        serviceName: it.description,
        category: 'Procedure',
        unitPrice: it.unitPrice,
        quantity: it.quantity,
        discount: 0,
        total: it.quantity * it.unitPrice
      })),
      subtotal,
      discount: discountAmount,
      discountReason: body.discountReason || '',
      tax: taxAmount,
      total,
      paidAmount: 0,
      balance: total,
      status: 'Unpaid',
      payments: []
    };

    return res.status(200).json({ feeApproval, invoice });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Fee approval error' });
  }
}
