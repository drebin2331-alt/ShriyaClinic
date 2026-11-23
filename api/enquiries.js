export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
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
    const enquiry = {
      id: `ENQ-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
      status: 'New',
      ...body
    };
    return res.status(201).json(enquiry);
  }

  if (req.method === 'DELETE') {
    return res.status(200).json({ success: true, message: 'All enquiries cleared' });
  }

  return res.status(200).json({ enquiries: [] });
}
