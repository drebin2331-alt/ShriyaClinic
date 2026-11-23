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

    const visitId = body.visitId || body.visitIdOrToken || `VIS-${Date.now()}`;
    const nowIso = new Date().toISOString();
    const nowTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const visit = {
      id: visitId,
      status: 'Completed',
      consultationEndTime: nowIso,
      chiefComplaint: body.chiefComplaint || '',
      diagnosis: body.diagnosis || 'Clinical Dental Evaluation Completed',
      clinicalFindings: body.clinicalFindings || 'Examination complete.',
      treatmentPerformed: body.treatmentPerformed || 'Consultation & Procedure Completed',
      doctorNotes: body.doctorNotes || '',
      followUpDate: body.followUpDate,
      followUpReason: body.followUpReason,
      timeline: [
        {
          time: nowTimeStr,
          event: `Consultation Finalized. Diagnosis: ${body.diagnosis || 'Dental Evaluation Completed'}. Ready for Checkout.`,
          actor: 'Doctor'
        }
      ]
    };

    const token = {
      id: body.tokenId || `tok-${Date.now()}`,
      tokenNumber: body.tokenNumber || body.tokenId || visitId,
      patientName: body.patientName || 'Patient',
      patientId: body.patientId || 'PAT-TEMP',
      doctorId: body.doctorId || 'doc-1',
      doctorName: body.doctorName || 'Doctor',
      status: 'Reception Follow-up',
      completedAt: nowIso
    };

    return res.status(200).json({ visit, token });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Consultation completion error' });
  }
}
