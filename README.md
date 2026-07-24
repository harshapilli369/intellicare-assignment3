# IntelliCare

An AI-Assisted Clinical Workflow Management Platform for reducing administrative burden in primary healthcare.

---

## Assignment 3 — Performance, Security and Monitoring

All artifacts for this assignment live in three top-level folders, each with its
own README explaining the contents and how to reproduce the results.

| Deliverable | Location |
|-------------|----------|
| JMeter test plan, baseline and optimized results | [`jmeter/`](jmeter/) |
| Lighthouse rendering measurements, before and after | [`lighthouse/`](lighthouse/) |
| OWASP ZAP scan reports and remediation evidence | [`zap/`](zap/) |
| Prometheus scrape config and Grafana dashboards | [`monitoring/`](monitoring/) |

The optimizations themselves are in the application code under [`backend/`](backend/)
and [`frontend/`](frontend/), each applied as a separate commit so the change and
its rationale can be reviewed independently.

### Scope

The assignment permits focusing on one or two features. This work targets two:

1. **Authentication and patient directory** — sign-in, and a searchable,
   paginated patient list with dashboard statistics.
2. **Patient record and AI pre-appointment notes** — a patient's full record with
   appointment history, and Gemini-generated pre-appointment summaries.

Only the code paths behind these two features are load-tested, optimized and
scanned. The broader platform is outlined under [Roadmap](#roadmap) below.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React.js, Vite, Tailwind CSS, Axios, React Router |
| Backend | Node.js, Express.js |
| Database | MongoDB (hosted on MongoDB Atlas) |
| AI | Google Gemini API |
| Auth | JWT (JSON Web Tokens) |
| Load testing | Apache JMeter |
| Security scanning | OWASP ZAP |
| Monitoring | Prometheus, Grafana |

MongoDB is the only datastore used in this assignment. The wider project design
also calls for MySQL as a relational store, but it is not part of this scope.

---

## Project Structure

```
intellicare-assignment3/
├── package.json               # Root — runs both servers with concurrently
├── frontend/                  # React application (Vite)
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── src/
│       ├── components/layout/ # Sidebar, TopBar
│       ├── context/           # AuthContext
│       ├── pages/
│       │   ├── auth/          # Login
│       │   └── clinician/     # Dashboard, Patients, PatientDetail, Appointments
│       ├── routes/            # ProtectedRoute
│       ├── services/          # Axios API wrappers
│       └── styles/
├── backend/                   # Node.js + Express API
│   ├── .env.example
│   ├── scripts/               # seed.js, explain-search.js
│   └── src/
│       ├── app.js             # Express entry point
│       ├── config/            # mongodb.js, gemini.js
│       ├── controllers/       # auth, patient, appointment, dashboard, ai
│       ├── middleware/        # authenticate, authorize, errorHandler
│       ├── models/mongodb/    # User, Patient, Appointment, Note, AISummary
│       ├── routes/            # auth, patients, appointments, dashboard, ai
│       └── services/          # aiService
├── jmeter/                    # Load test plan and CSV results
├── zap/                       # Security scan reports and remediation notes
└── monitoring/                # Prometheus and Grafana configuration
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- A MongoDB database (local or Atlas)
- A Google Gemini API key
- Java 11+ and Docker, if you intend to re-run the JMeter, ZAP or monitoring steps

### Installation

```bash
npm run install:all      # root + frontend + backend
```

### Environment Variables

```bash
cp backend/.env.example backend/.env
```

| Variable | Description |
|----------|-------------|
| `PORT` | Backend port (default 5000) |
| `NODE_ENV` | `development`, `production`, or `loadtest` |
| `JWT_SECRET` | Secret key for signing JWTs |
| `JWT_EXPIRES_IN` | Token lifetime (e.g. `7d`) |
| `MONGODB_URI` | MongoDB connection string |
| `GEMINI_API_KEY` | Google Gemini API key |
| `GEMINI_MODEL` | Gemini model identifier |
| `CLIENT_URL` | Frontend URL for CORS (e.g. `http://localhost:3000`) |

Setting `NODE_ENV=loadtest` relaxes the global rate limit so that JMeter runs
measure application behaviour rather than the limiter. It should never be used
in a deployed environment.

### Seeding the Database

The performance work depends on a realistic data volume. The seed creates
100,000 patients with around 200,000 appointments and matching clinical notes.
Ten thousand records proved too few to measure against: the whole collection is
only 3 MB, so a full scan completed in roughly 40 ms and an index made no
observable difference.

```bash
node backend/scripts/seed.js
```

Sign in afterwards as `dr.kuteishi@intellicare.ca` with the password
`Password123!`.

To inspect how MongoDB executes the directory search:

```bash
node backend/scripts/explain-search.js an
```

### Running the App

```bash
npm run dev                      # frontend and backend together

npm run dev --prefix frontend    # React on http://localhost:3000
npm run dev --prefix backend     # Express on http://localhost:5000
```

For load testing and security scanning, build the frontend and let Express serve
it, so both tools target a single origin with production security headers:

```bash
npm run build --prefix frontend
npm start --prefix backend
```

---

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register a new user | — |
| POST | `/api/auth/login` | Log in and receive a JWT | — |
| GET | `/api/patients` | Paginated patient list, supports `?search=` | Clinician |
| GET | `/api/patients/:id` | Full patient record with appointment history | Clinician |
| GET | `/api/appointments` | Appointment list, supports `?date=` | Clinician |
| GET | `/api/dashboard/stats` | Dashboard summary counts | Clinician |
| POST | `/api/ai/pre-appointment/:appointmentId` | Generate pre-appointment summary | Clinician |
| POST | `/api/ai/post-appointment/:appointmentId` | Generate post-appointment summary | Clinician |
| GET | `/api/ai/summary/:appointmentId` | Retrieve a stored summary | Clinician |
| PATCH | `/api/ai/summary/:appointmentId/finalize` | Approve and finalize a summary | Clinician |
| GET | `/api/ai/patient/:patientId/summaries` | Finalized summaries for a patient | Clinician, Patient |
| GET | `/api/health` | Health check | — |
| GET | `/metrics` | Prometheus metrics | — |

---

## AI Architecture

The frontend never communicates with Gemini directly. All AI requests follow this flow:

```
Frontend → Backend API → Gemini API → Backend API → Frontend
```

Generated summaries are reviewed and approved by the clinician before being
released to the patient. Summaries are persisted in MongoDB and keyed by
appointment, so a repeated request returns the stored result rather than
re-invoking the model.

---

## Roadmap

The following are part of the wider IntelliCare design but are outside the scope
of this assignment and are not implemented in this repository:

- Admin role for patient onboarding and record import/export
- Patient self-service appointment booking and intake forms
- Prescription creation and printing
- Email and in-app appointment reminders
- CSV/JSON bulk import and chart export
