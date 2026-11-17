const fs = require('fs');
const path = require('path');

const raw = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'clinic_data.json'), 'utf8'));

const code = `export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-actor-id, x-actor-name, x-actor-role');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const data = ${JSON.stringify(raw, null, 2)};
  return res.status(200).json(data);
}
`;

fs.writeFileSync(path.join(__dirname, '..', 'api', 'state.js'), code, 'utf8');
console.log('Successfully generated api/state.js with full clinic data embedded');
