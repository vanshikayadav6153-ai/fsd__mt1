// SET C - Employee Leave Management API
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ---------- In-memory data ----------
let leaves = [
  { id: 701, employeeName: 'Ananya Singh', employeeCode: 'EMP101', leaveType: 'Casual', days: 2, status: 'Pending' },
  { id: 702, employeeName: 'Rahul Verma', employeeCode: 'EMP102', leaveType: 'Sick', days: 1, status: 'Approved' },
  { id: 703, employeeName: 'Simran Kaur', employeeCode: 'EMP103', leaveType: 'Earned', days: 3, status: 'Rejected' },
];
let nextId = 704;

const LEAVE_TYPES = ['Casual', 'Sick', 'Earned'];
const STATUSES = ['Pending', 'Approved', 'Rejected'];

// ---------- Helpers ----------
const isNonEmptyString = (v) => typeof v === 'string' && v.trim().length > 0;
const matchOption = (value, options) =>
  typeof value === 'string' ? options.find((o) => o.toLowerCase() === value.trim().toLowerCase()) : undefined;

function validateLeave(body) {
  const errors = [];
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { errors: ['Request body must be a JSON object'] };
  }
  const { employeeName, employeeCode, leaveType, days, status } = body;

  if (!isNonEmptyString(employeeName)) errors.push('employeeName is required and must be a non-empty string');
  if (!isNonEmptyString(employeeCode)) errors.push('employeeCode is required and must be a non-empty string');

  const type = matchOption(leaveType, LEAVE_TYPES);
  if (!type) errors.push('leaveType must be one of: Casual, Sick, Earned');

  if (!Number.isInteger(days) || days <= 0) errors.push('days must be a positive integer');

  const stat = matchOption(status, STATUSES);
  if (!stat) errors.push('status must be one of: Pending, Approved, Rejected');

  if (errors.length) return { errors };
  return {
    errors,
    data: {
      employeeName: employeeName.trim(),
      employeeCode: employeeCode.trim(),
      leaveType: type,
      days,
      status: stat,
    },
  };
}

// ---------- Routes ----------
// NOTE: specific routes (/filter, /pending) must come BEFORE /:id

// 1. GET all
app.get('/api/leaves', (req, res) => {
  res.status(200).json(leaves);
});

// 6. Filter by status (case-insensitive)
app.get('/api/leaves/filter', (req, res) => {
  const { status } = req.query;
  if (!isNonEmptyString(status)) {
    return res.status(400).json({ error: 'Query parameter "status" is required' });
  }
  const result = leaves.filter((l) => l.status.toLowerCase() === status.trim().toLowerCase());
  res.status(200).json(result);
});

// 7. GET pending
app.get('/api/leaves/pending', (req, res) => {
  res.status(200).json(leaves.filter((l) => l.status === 'Pending'));
});

// 3. GET by id
app.get('/api/leaves/:id', (req, res) => {
  const leave = leaves.find((l) => l.id === Number(req.params.id));
  if (!leave) return res.status(404).json({ error: 'Leave request not found' });
  res.status(200).json(leave);
});

// 2. POST
app.post('/api/leaves', (req, res) => {
  const { errors, data } = validateLeave(req.body);
  if (errors.length) return res.status(400).json({ error: 'Validation failed', details: errors });

  const record = { id: nextId++, ...data };
  leaves.push(record);
  res.status(201).json(record);
});

// 4. PUT
app.put('/api/leaves/:id', (req, res) => {
  const index = leaves.findIndex((l) => l.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Leave request not found' });

  const { errors, data } = validateLeave(req.body);
  if (errors.length) return res.status(400).json({ error: 'Validation failed', details: errors });

  leaves[index] = { id: leaves[index].id, ...data };
  res.status(200).json(leaves[index]);
});

// 5. DELETE
app.delete('/api/leaves/:id', (req, res) => {
  const index = leaves.findIndex((l) => l.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Leave request not found' });

  const [removed] = leaves.splice(index, 1);
  res.status(200).json({ message: 'Leave request deleted successfully', deleted: removed });
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
  console.log(`Leave Management API running on http://localhost:${PORT}`);
});
