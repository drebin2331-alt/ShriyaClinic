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
      firstVisitDate: new Date().toISOString().split('T')[0],
      totalVisits: 1,
      outstandingBalance: 0,
      ...body
    };
    return res.status(201).json({ patient });
  }

  return res.status(200).json({ patients: [] });
}
