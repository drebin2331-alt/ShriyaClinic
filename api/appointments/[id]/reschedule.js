export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
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

  const appointment = {
    id: id || body.id || `apt-${Date.now()}`,
    date: body.newDate || body.date || new Date().toISOString().split('T')[0],
    timeSlot: body.newTimeSlot || body.timeSlot || '10:00 AM',
    reason: body.reason || 'Rescheduled by Clinic',
    status: 'Confirmed',
    rescheduledAt: new Date().toISOString()
  };

  return res.status(200).json({ appointment, message: 'Appointment rescheduled successfully' });
}
