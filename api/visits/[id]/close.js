export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-actor-id, x-actor-name, x-actor-role');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }
  body = body || {};

  const { id } = req.query;
  const visitId = id || body.visitId || `VIS-${Date.now()}`;
  const nowIso = new Date().toISOString();
  const nowTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

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
