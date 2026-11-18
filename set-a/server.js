// SET A - Event Registration Management API
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ---------- In-memory data ----------
let registrations = [
  { id: 501, participantName: 'Riya Sharma', eventName: 'Tech Fest', department: 'CSE', ticketCount: 2, paymentStatus: 'Paid' },
  { id: 502, participantName: 'Arjun Mehta', eventName: 'Code Sprint', department: 'IT', ticketCount: 1, paymentStatus: 'Pending' },
  { id: 503, participantName: 'Neha Verma', eventName: 'Tech Fest', department: 'ECE', ticketCount: 3, paymentStatus: 'Paid' },
];
let nextId = 504;

const PAYMENT_STATUSES = ['Paid', 'Pending'];

// ---------- Helpers ----------
const isNonEmptyString = (v) => typeof v === 'string' && v.trim().length > 0;

function validateRegistration(body) {
  const errors = [];
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { errors: ['Request body must be a JSON object'] };
  }
  const { participantName, eventName, department, ticketCount, paymentStatus } = body;

  if (!isNonEmptyString(participantName)) errors.push('participantName is required and must be a non-empty string');
  if (!isNonEmptyString(eventName)) errors.push('eventName is required and must be a non-empty string');
  if (!isNonEmptyString(department)) errors.push('department is required and must be a non-empty string');
  if (!Number.isInteger(ticketCount) || ticketCount <= 0) errors.push('ticketCount must be a positive integer');

  const status = typeof paymentStatus === 'string'
    ? PAYMENT_STATUSES.find((s) => s.toLowerCase() === paymentStatus.trim().toLowerCase())
    : undefined;
  if (!status) errors.push('paymentStatus must be either "Paid" or "Pending"');

  if (errors.length) return { errors };
  return {
    errors,
    data: {
      participantName: participantName.trim(),
      eventName: eventName.trim(),
      department: department.trim(),
      ticketCount,
      paymentStatus: status,
    },
  };
}

// ---------- Routes ----------
// NOTE: specific routes (/filter, /pending) must come BEFORE /:id

// 1. GET all
app.get('/api/registrations', (req, res) => {
  res.status(200).json(registrations);
});

// 6. Filter by department (case-insensitive)
app.get('/api/registrations/filter', (req, res) => {
  const { department } = req.query;
  if (!isNonEmptyString(department)) {
    return res.status(400).json({ error: 'Query parameter "department" is required' });
  }
  const result = registrations.filter(
    (r) => r.department.toLowerCase() === department.trim().toLowerCase()
  );
  res.status(200).json(result);
});

// 7. GET pending registrations
app.get('/api/registrations/pending', (req, res) => {
  res.status(200).json(registrations.filter((r) => r.paymentStatus === 'Pending'));
});

// 3. GET by id
app.get('/api/registrations/:id', (req, res) => {
  const reg = registrations.find((r) => r.id === Number(req.params.id));
  if (!reg) return res.status(404).json({ error: 'Registration not found' });
  res.status(200).json(reg);
});

// 2. POST
app.post('/api/registrations', (req, res) => {
  const { errors, data } = validateRegistration(req.body);
  if (errors.length) return res.status(400).json({ error: 'Validation failed', details: errors });

  const record = { id: nextId++, ...data };
  registrations.push(record);
  res.status(201).json(record);
});

// 4. PUT
app.put('/api/registrations/:id', (req, res) => {
  const index = registrations.findIndex((r) => r.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Registration not found' });

  const { errors, data } = validateRegistration(req.body);
  if (errors.length) return res.status(400).json({ error: 'Validation failed', details: errors });

  registrations[index] = { id: registrations[index].id, ...data };
  res.status(200).json(registrations[index]);
});

// 5. DELETE
app.delete('/api/registrations/:id', (req, res) => {
  const index = registrations.findIndex((r) => r.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Registration not found' });

  const [removed] = registrations.splice(index, 1);
  res.status(200).json({ message: 'Registration deleted successfully', deleted: removed });
});

// ---------- Error handling ----------
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON in request body' });
  }
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Event Registration API running on http://localhost:${PORT}`);
});
