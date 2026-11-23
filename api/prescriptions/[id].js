export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
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

  if (req.method === 'DELETE') {
    return res.status(200).json({ success: true, message: `Prescription ${id} deleted successfully` });
  }

  const prescription = {
    id: id || body.id || `rx-${Date.now()}`,
    visitId: body.visitId || `vis-${Date.now()}`,
    patientId: body.patientId || 'PAT-TEMP',
    items: Array.isArray(body.items) ? body.items : [],
    diagnosis: body.diagnosis || '',
    doctorNotes: body.doctorNotes || '',
    followUpDate: body.followUpDate || '',
    updatedAt: new Date().toISOString()
  };

  return res.status(200).json({ prescription, success: true, message: 'Prescription updated successfully' });
}
