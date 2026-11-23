export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-actor-id, x-actor-name, x-actor-role');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
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

    const nowIso = new Date().toISOString();
    const amount = Number(body.amount) || 0;
    const payment = {
      id: `PAY-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      invoiceId: body.invoiceId,
      receiptNumber: `RCP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      patientId: body.patientId,
      amount,
      paymentMethod: body.paymentMethod || 'Cash',
      referenceNumber: body.referenceNumber || '',
      receivedBy: body.receivedBy || 'RECEPTION DESK',
      date: nowIso.split('T')[0],
      notes: body.notes || ''
    };

    const invoice = {
      id: body.invoiceId,
      paidAmount: amount,
      balance: 0,
      status: 'Paid'
    };

    return res.status(200).json({ payment, invoice });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Payment processing error' });
  }
}
