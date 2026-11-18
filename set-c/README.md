# Set C - Employee Leave Management API

## Setup
```bash
npm install
npm start
```
Server runs on http://localhost:3000 (change with the PORT env variable).

## Endpoints (base: /api/leaves)
| Method | Route | Description |
|---|---|---|
| GET | /api/leaves | Get all records |
| POST | /api/leaves | Create a record (201 / 400) |
| GET | /api/leaves/:id | Get by ID (200 / 404) |
| PUT | /api/leaves/:id | Update (200 / 400 / 404) |
| DELETE | /api/leaves/:id | Delete (200 / 404) |
| GET | /api/leaves/filter?status=Pending | Filter records |

Data is stored in an in-memory array (resets on restart).
