export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-actor-id, x-actor-name, x-actor-role');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { path } = req.query;
  const pathStr = Array.isArray(path) ? path.join('/') : (path || '');

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }
  body = body || {};

  // Tokens actions (call, hold, skip)
  if (pathStr.startsWith('tokens/') && pathStr.endsWith('/call')) {
    const id = pathStr.split('/')[1];
    return res.status(200).json({
      token: {
        id,
        tokenNumber: id,
        status: 'Called',
        calledAt: new Date().toISOString(),
        chairId: body.chairId || null,
        chairName: body.chairName || null
      }
    });
  }

  if (pathStr.startsWith('tokens/') && pathStr.endsWith('/hold')) {
    const id = pathStr.split('/')[1];
    return res.status(200).json({
      token: {
        id,
        tokenNumber: id,
        status: 'Hold'
      }
    });
  }

  if (pathStr.startsWith('tokens/') && pathStr.endsWith('/skip')) {
    const id = pathStr.split('/')[1];
    return res.status(200).json({
      token: {
        id,
        tokenNumber: id,
        status: 'Skipped'
      }
    });
  }

  // Consultations actions (start, complete, fee-approval)
  if (pathStr.startsWith('consultations/start')) {
    const visitId = body.visitIdOrToken || `vis-${Date.now()}`;
    return res.status(200).json({
      visit: {
        id: visitId,
        status: 'In Consultation',
        consultationStartTime: new Date().toISOString()
      }
    });
  }

  if (pathStr.startsWith('consultations/complete')) {
    const visitId = body.visitId || `vis-${Date.now()}`;
    return res.status(200).json({
      visit: {
        id: visitId,
        status: 'Completed',
        consultationEndTime: new Date().toISOString()
      }
    });
  }

  // Default fallback for any other route
  return res.status(200).json({
    success: true,
    message: 'Operation handled successfully',
    path: pathStr
  });
}
