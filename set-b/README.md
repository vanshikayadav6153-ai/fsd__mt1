# Set B - Student Course Enrollment API

## Setup
```bash
npm install
npm start
```
Server runs on http://localhost:3000 (change with the PORT env variable).

## Endpoints (base: /api/enrollments)
| Method | Route | Description |
|---|---|---|
| GET | /api/enrollments | Get all records |
| POST | /api/enrollments | Create a record (201 / 400) |
| GET | /api/enrollments/:id | Get by ID (200 / 404) |
| PUT | /api/enrollments/:id | Update (200 / 400 / 404) |
| DELETE | /api/enrollments/:id | Delete (200 / 404) |
| GET | /api/enrollments/filter?semester=3 | Filter records |

Data is stored in an in-memory array (resets on restart).
