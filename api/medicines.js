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
    const medicine = {
      id: body.id || `med-${Date.now()}`,
      name: body.name || 'Sample Medicine',
      dosage: body.dosage || '500mg',
      route: body.route || 'Oral',
      frequency: body.frequency || 'BD',
      duration: body.duration || '5 days',
      instructions: body.instructions || 'After food'
    };
    return res.status(200).json({ medicine, medicines: [medicine] });
  }

  return res.status(200).json({ medicines: [] });
}
