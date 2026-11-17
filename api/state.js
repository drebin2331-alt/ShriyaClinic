import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-actor-id, x-actor-name, x-actor-role');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const dataPath = path.join(process.cwd(), 'data', 'clinic_data.json');
    if (fs.existsSync(dataPath)) {
      const content = fs.readFileSync(dataPath, 'utf8');
      return res.status(200).send(content);
    }
  } catch (e) {
    // Fall back to embedded minimal dataset
  }

  return res.status(200).json({
    patients: [
      {
        id: "PAT-2026-000001",
        opNumber: "OP-2026-00001",
        name: "Customer 1",
        phone: "9633746591",
        age: 22,
        gender: "Male",
        assignedDoctorId: "staff-1792653030970",
        assignedDoctorName: "Dr. DOCTOR TEST",
        status: "Active Treatment",
        outstandingBalance: 0
      },
      {
        id: "PAT-2026-000002",
        opNumber: "OP-2026-00002",
        name: "customer 2",
        phone: "9633746592",
        age: 21,
        gender: "Female",
        assignedDoctorId: "staff-1792653030970",
        assignedDoctorName: "Dr. DOCTOR TEST",
        status: "New Patient",
        outstandingBalance: 0
      },
      {
        id: "PAT-2026-000003",
        opNumber: "OP-2026-00003",
        name: "customer 3",
        phone: "9633746593",
        age: 25,
        gender: "Female",
        assignedDoctorId: "staff-1792653030970",
        assignedDoctorName: "Dr. DOCTOR TEST",
        status: "New Patient",
        outstandingBalance: 0
      }
    ],
    tokens: [
      { id: "tok-1794029717795", tokenNumber: "W-001", patientName: "Customer 1", status: "Completed" },
      { id: "tok-1794029736556", tokenNumber: "W-002", patientName: "customer 2", status: "Waiting" },
      { id: "tok-1794203767035", tokenNumber: "W-003", patientName: "Customer 1", status: "Completed" }
    ],
    appointments: [],
    visits: [],
    invoices: [],
    payments: [],
    serverTime: new Date().toISOString()
  });
}
