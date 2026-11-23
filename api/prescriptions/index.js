export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
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
    const prescription = {
      id: body.id || `rx-${Date.now()}`,
      visitId: body.visitId || `vis-${Date.now()}`,
      patientId: body.patientId || 'PAT-TEMP',
      patientName: body.patientName || 'Patient',
      patientOpNumber: body.patientOpNumber || 'OP-TEMP',
      doctorName: body.doctorName || 'Dr. DOCTOR TEST',
      date: body.date || nowIso.split('T')[0],
      medicines: body.medicines || [],
      instructions: body.instructions || '',
      diagnosis: body.diagnosis || ''
    };

    return res.status(200).json({ prescription });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Prescription processing error' });
  }
}
