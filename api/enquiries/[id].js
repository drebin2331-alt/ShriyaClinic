export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, PUT, DELETE, OPTIONS');
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
    return res.status(200).json({ success: true, message: `Enquiry ${id} deleted` });
  }

  const enquiry = {
    id: id || `ENQ-${Date.now()}`,
    updatedAt: new Date().toISOString(),
    ...body
  };

  return res.status(200).json({ enquiry, success: true });
}
