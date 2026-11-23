export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-actor-id, x-actor-name, x-actor-role');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
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

    const { visitIdOrToken } = body;
    const nowIso = new Date().toISOString();
    const nowTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const visit = {
      id: visitIdOrToken || `VIS-${Date.now()}`,
      status: 'In Consultation',
      consultationStartTime: nowIso,
      timeline: [
        {
          time: nowTimeStr,
          event: 'Consultation Started. Examination underway.',
          actor: 'Doctor'
        }
      ]
    };

    const token = {
      id: body.tokenId || visitIdOrToken || `tok-${Date.now()}`,
      tokenNumber: body.tokenNumber || visitIdOrToken,
      patientName: body.patientName || 'Patient',
      patientId: body.patientId || 'PAT-TEMP',
      doctorId: body.doctorId || 'doc-1',
      doctorName: body.doctorName || 'Doctor',
      status: 'In Consultation',
      consultationStartedAt: nowIso
    };

    return res.status(200).json({ visit, token });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Consultation start error' });
  }
}
