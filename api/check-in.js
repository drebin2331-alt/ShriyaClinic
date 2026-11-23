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

    const {
      patientId,
      doctorId = 'staff-1792653030970',
      appointmentId,
      reasonForVisit = 'Consultation & Oral Examination',
      priority = 'Normal',
      chairId,
      isWalkIn = false
    } = body;

    const prefix = isWalkIn ? 'W' : 'A';
    const randNum = Math.floor(100 + Math.random() * 900);
    const tokenNumber = `${prefix}-${randNum}`;
    const visitId = `VIS-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const nowIso = new Date().toISOString();
    const todayStr = nowIso.split('T')[0];
    const nowTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const visit = {
      id: visitId,
      patientId: patientId || `PAT-${Date.now()}`,
      patientName: body.patientName || 'Patient',
      opNumber: body.opNumber || `OP-2026-${randNum}`,
      patientPhone: body.patientPhone || '',
      appointmentId: appointmentId || null,
      doctorId,
      doctorName: body.doctorName || 'Consulting Doctor',
      visitDate: todayStr,
      checkInTime: nowIso,
      status: 'Waiting',
      tokenId: tokenNumber,
      chairId: chairId || null,
      priority,
      reasonForVisit,
      timeline: [
        {
          time: nowTimeStr,
          event: `Patient Checked In. Token ${tokenNumber} issued at reception desk.`,
          actor: 'Reception Desk'
        }
      ]
    };

    const token = {
      id: `tok-${Date.now()}`,
      tokenNumber,
      patientId: patientId || `PAT-${Date.now()}`,
      patientName: body.patientName || 'Patient',
      patientPhone: body.patientPhone || '',
      appointmentId: appointmentId || null,
      visitId,
      doctorId,
      doctorName: body.doctorName || 'Consulting Doctor',
      chairId: chairId || null,
      date: todayStr,
      status: 'Waiting',
      priority,
      createdAt: nowIso,
      estimatedWaitMinutes: 15
    };

    return res.status(200).json({ visit, token });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Check-in processing error' });
  }
}
