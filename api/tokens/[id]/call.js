export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-actor-id, x-actor-name, x-actor-role');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }
  body = body || {};

  return res.status(200).json({
    token: {
      id: id || `tok-${Date.now()}`,
      tokenNumber: id || 'A-001',
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
