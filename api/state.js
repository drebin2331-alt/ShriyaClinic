export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-actor-id, x-actor-name, x-actor-role');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  global.__GLOBAL_ENQUIRIES__ = global.__GLOBAL_ENQUIRIES__ || [];

  const data = {
    patients: [],
    tokens: [],
    visits: [],
    invoices: [],
    payments: [],
    prescriptions: [],
    feeApprovals: [],
    appointments: [],
    enquiries: global.__GLOBAL_ENQUIRIES__,
    auditEvents: [],
    serverTime: new Date().toISOString()
  };

  return res.status(200).json(data);
}
