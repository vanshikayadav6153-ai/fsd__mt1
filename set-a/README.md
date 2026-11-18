# Set A - Event Registration Management API

## Setup
```bash
npm install
npm start
```
Server runs on http://localhost:3000 (change with the PORT env variable).

## Endpoints (base: /api/registrations)
| Method | Route | Description |
|---|---|---|
| GET | /api/registrations | Get all records |
| POST | /api/registrations | Create a record (201 / 400) |
| GET | /api/registrations/:id | Get by ID (200 / 404) |
| PUT | /api/registrations/:id | Update (200 / 400 / 404) |
| DELETE | /api/registrations/:id | Delete (200 / 404) |
| GET | /api/registrations/filter?department=CSE | Filter records |

Data is stored in an in-memory array (resets on restart).
