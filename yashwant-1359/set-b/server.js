// SET B - Student Course Enrollment API
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ---------- In-memory data ----------
let enrollments = [
  { id: 601, studentName: 'Aarav Gupta', courseCode: 'CS301', courseName: 'Data Structures', semester: 3, attendance: 82 },
  { id: 602, studentName: 'Meera Joshi', courseCode: 'CS305', courseName: 'Database Systems', semester: 3, attendance: 74 },
  { id: 603, studentName: 'Kabir Khan', courseCode: 'CS310', courseName: 'Computer Networks', semester: 3, attendance: 91 },
];
let nextId = 604;

// ---------- Helpers ----------
const isNonEmptyString = (v) => typeof v === 'string' && v.trim().length > 0;

// excludeId lets PUT keep the record's own courseCode
function validateEnrollment(body, excludeId = null) {
  const errors = [];
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { errors: ['Request body must be a JSON object'] };
  }
  const { studentName, courseCode, courseName, semester, attendance } = body;

  if (!isNonEmptyString(studentName)) errors.push('studentName is required and must be a non-empty string');
  if (!isNonEmptyString(courseCode)) errors.push('courseCode is required and must be a non-empty string');
  if (!isNonEmptyString(courseName)) errors.push('courseName is required and must be a non-empty string');
  if (!Number.isInteger(semester) || semester <= 0) errors.push('semester must be a positive integer');
  if (typeof attendance !== 'number' || !Number.isFinite(attendance) || attendance < 0 || attendance > 100) {
    errors.push('attendance must be a number between 0 and 100');
  }

  // courseCode must be unique
  if (isNonEmptyString(courseCode)) {
    const duplicate = enrollments.some(
      (e) => e.id !== excludeId && e.courseCode.toLowerCase() === courseCode.trim().toLowerCase()
    );
    if (duplicate) errors.push(`courseCode "${courseCode.trim()}" already exists`);
  }

  if (errors.length) return { errors };
  return {
    errors,
    data: {
      studentName: studentName.trim(),
      courseCode: courseCode.trim(),
      courseName: courseName.trim(),
      semester,
      attendance,
    },
  };
}

// ---------- Routes ----------
// NOTE: specific routes (/filter, /low-attendance) must come BEFORE /:id

// 1. GET all
app.get('/api/enrollments', (req, res) => {
  res.status(200).json(enrollments);
});

// 6. Filter by semester
app.get('/api/enrollments/filter', (req, res) => {
  const { semester } = req.query;
  if (semester === undefined || String(semester).trim() === '') {
    return res.status(400).json({ error: 'Query parameter "semester" is required' });
  }
  const sem = Number(semester);
  if (!Number.isInteger(sem)) {
    return res.status(400).json({ error: 'semester must be an integer' });
  }
  res.status(200).json(enrollments.filter((e) => e.semester === sem));
});

// 7. Low attendance (< 75)
app.get('/api/enrollments/low-attendance', (req, res) => {
  res.status(200).json(enrollments.filter((e) => e.attendance < 75));
});

// 3. GET by id
app.get('/api/enrollments/:id', (req, res) => {
  const item = enrollments.find((e) => e.id === Number(req.params.id));
  if (!item) return res.status(404).json({ error: 'Enrollment not found' });
  res.status(200).json(item);
});

// 2. POST
app.post('/api/enrollments', (req, res) => {
  const { errors, data } = validateEnrollment(req.body);
  if (errors.length) return res.status(400).json({ error: 'Validation failed', details: errors });

  const record = { id: nextId++, ...data };
  enrollments.push(record);
  res.status(201).json(record);
});

// 4. PUT
app.put('/api/enrollments/:id', (req, res) => {
  const index = enrollments.findIndex((e) => e.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Enrollment not found' });

  const { errors, data } = validateEnrollment(req.body, enrollments[index].id);
  if (errors.length) return res.status(400).json({ error: 'Validation failed', details: errors });

  enrollments[index] = { id: enrollments[index].id, ...data };
  res.status(200).json(enrollments[index]);
});

// 5. DELETE
app.delete('/api/enrollments/:id', (req, res) => {
  const index = enrollments.findIndex((e) => e.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Enrollment not found' });

  const [removed] = enrollments.splice(index, 1);
  res.status(200).json({ message: 'Enrollment deleted successfully', deleted: removed });
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
  console.log(`Course Enrollment API running on http://localhost:${PORT}`);
});
